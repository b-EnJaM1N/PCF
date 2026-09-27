-- PCF — Étape 4b : nouveaux formats de match en duel.
--   * match en 1 set (toujours amical : il ne compte pas pour le niveau officiel) ;
--   * sets en plusieurs jeux : un jeu se gagne en 11 (ou 7) points avec 2 points d'écart,
--     un set au premier qui gagne 1 jeu (format classique) ou 3 jeux.
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2, 3 et 4. Peut être relancé sans risque.

alter table public.duels add column if not exists jeux_par_set smallint not null default 1;
alter table public.duels add column if not exists jeux smallint[] not null default '{0,0}';       -- jeux du set en cours
alter table public.duels add column if not exists scores_jeux jsonb not null default '[]'::jsonb; -- points de chaque jeu terminé

alter table public.duels drop constraint if exists duels_jeux_par_set_check;
alter table public.duels add constraint duels_jeux_par_set_check check (jeux_par_set in (1, 3));
alter table public.duels drop constraint if exists duels_sets_gagnants_check;
alter table public.duels add constraint duels_sets_gagnants_check check (sets_gagnants in (1, 2, 3));

-- Révèle les deux signes du coup en cours et applique les règles (remplace la version de l'étape 3).
create or replace function public._resoudre(p_id uuid) returns void
language plpgsql as $$
declare
  d public.duels;
  sa public.coups_secrets; sb public.coups_secrets;
  g smallint; p smallint[]; j smallint[]; s smallint[];
begin
  select * into d from public.duels where id = p_id for update;
  select * into sa from public.coups_secrets where duel_id = p_id and manche = d.manche and joueur = 0;
  select * into sb from public.coups_secrets where duel_id = p_id and manche = d.manche and joueur = 1;
  if sa is null or sb is null or d.phase <> 'jeu' then return; end if;

  -- Pierre bat Ciseaux, Ciseaux bat Feuille, Feuille bat Pierre ; égalité : rejouée.
  g := case when sa.signe = sb.signe then null when (sa.signe + 1) % 3 = sb.signe then 0 else 1 end;
  d.coups := d.coups || jsonb_build_object('a', sa.signe, 'b', sb.signe, 'g', g, 'auto', jsonb_build_array(sa.auto, sb.auto));
  d.manche := d.manche + 1;
  d.echeance := now() + public._duree_coup() + interval '0.9 seconds';   -- le temps de voir les signes

  if g is not null then
    p := d.points; p[g + 1] := p[g + 1] + 1;
    -- Jeu gagné : au moins points_par_set points et 2 points d'écart.
    if greatest(p[1], p[2]) >= d.points_par_set and abs(p[1] - p[2]) >= 2 then
      d.scores_jeux := d.scores_jeux || jsonb_build_array(jsonb_build_array(p[1], p[2]));
      j := d.jeux; j[g + 1] := j[g + 1] + 1;
      if j[g + 1] = d.jeux_par_set then
        -- … et le set avec : score en points (un seul jeu par set) ou en jeux.
        d.scores_sets := d.scores_sets || case when d.jeux_par_set = 1 then jsonb_build_array(jsonb_build_array(p[1], p[2]))
                                                                        else jsonb_build_array(jsonb_build_array(j[1], j[2])) end;
        s := d.sets; s[g + 1] := s[g + 1] + 1; d.sets := s;
        j := '{0,0}';
        if s[g + 1] = d.sets_gagnants then
          d.phase := 'termine'; d.vainqueur := g; d.fin := 'score'; d.echeance := null;
        else
          d.phase := 'entre_sets'; d.prets := '{false,false}'; d.echeance := now() + interval '30 seconds';
        end if;
      else
        -- Jeu suivant dans le même set : décompte de 3 secondes, comme au début d'un set.
        d.echeance := now() + public._decompte() + public._duree_coup();
      end if;
      d.jeux := j;
      p := '{0,0}';
    end if;
    d.points := p;
  end if;

  update public.duels set coups = d.coups, manche = d.manche, echeance = d.echeance, points = d.points, jeux = d.jeux, sets = d.sets,
    scores_jeux = d.scores_jeux, scores_sets = d.scores_sets, phase = d.phase, prets = d.prets, vainqueur = d.vainqueur, fin = d.fin, maj_le = now()
  where id = p_id;
end $$;
revoke all on function public._resoudre(uuid) from public, anon, authenticated;

-- Lancer un défi avec le nombre de jeux par set (remplace la version de l'étape 4).
drop function if exists public.lancer_defi(uuid, int, int, boolean);
create or replace function public.lancer_defi(p_adversaire uuid, p_points int, p_sets int, p_classe boolean default true, p_jeux int default 1)
returns public.duels language plpgsql security definer set search_path = public as $$
declare d public.duels;
begin
  if coalesce(p_jeux, 1) not in (1, 3) then raise exception 'Nombre de jeux par set invalide'; end if;
  d := creer_duel(p_adversaire, p_points, p_sets);
  -- Un match en 1 set est toujours amical.
  update duels set classe = coalesce(p_classe, true) and p_sets > 1, jeux_par_set = coalesce(p_jeux, 1)
  where id = d.id returning * into d;
  return d;
end $$;
revoke all on function public.lancer_defi(uuid, int, int, boolean, int) from public, anon;
grant execute on function public.lancer_defi(uuid, int, int, boolean, int) to authenticated;
