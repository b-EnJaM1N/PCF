-- PCF — Étape 4b : formats courts en duel.
--   * sets de 3 et de 1 point, en plus de 7 et 11 : sans écart de 2 points (3–2 gagne ;
--     à 1 point, le premier point gagne le set) ;
--   * match en 1 set.
-- Ces formats courts sont toujours amicaux : ils ne comptent pas pour le niveau officiel.
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2, 3 et 4. Peut être relancé sans risque.
-- Si on relance un jour les étapes 3 ou 4, il faut relancer celui-ci ensuite.

alter table public.duels drop constraint if exists duels_points_par_set_check;
alter table public.duels add constraint duels_points_par_set_check check (points_par_set in (1, 3, 7, 11));
alter table public.duels drop constraint if exists duels_sets_gagnants_check;
alter table public.duels add constraint duels_sets_gagnants_check check (sets_gagnants in (1, 2, 3));

-- Écart nécessaire pour gagner un set : 2 points pour les sets de 7 et 11, 1 point pour ceux de 3 et 1.
create or replace function public._ecart(p_points smallint) returns int language sql immutable as $$
  select case when p_points >= 7 then 2 else 1 end
$$;

-- Révèle les deux signes du coup en cours et applique les règles (remplace la version de l'étape 3).
create or replace function public._resoudre(p_id uuid) returns void
language plpgsql as $$
declare
  d public.duels;
  sa public.coups_secrets; sb public.coups_secrets;
  g smallint; p smallint[]; s smallint[];
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
    -- Set gagné : au moins points_par_set points, et l'écart nécessaire.
    if greatest(p[1], p[2]) >= d.points_par_set and abs(p[1] - p[2]) >= public._ecart(d.points_par_set) then
      d.scores_sets := d.scores_sets || jsonb_build_array(jsonb_build_array(p[1], p[2]));
      s := d.sets; s[g + 1] := s[g + 1] + 1; d.sets := s;
      p := '{0,0}';
      if s[g + 1] = d.sets_gagnants then
        d.phase := 'termine'; d.vainqueur := g; d.fin := 'score'; d.echeance := null;
      else
        d.phase := 'entre_sets'; d.prets := '{false,false}'; d.echeance := now() + interval '30 seconds';
      end if;
    end if;
    d.points := p;
  end if;

  update public.duels set coups = d.coups, manche = d.manche, echeance = d.echeance, points = d.points, sets = d.sets,
    scores_sets = d.scores_sets, phase = d.phase, prets = d.prets, vainqueur = d.vainqueur, fin = d.fin, maj_le = now()
  where id = p_id;
end $$;

-- Lancer un défi (remplace la version de l'étape 4) : les formats courts sont toujours amicaux.
drop function if exists public.lancer_defi(uuid, int, int, boolean, int);   -- version d'essai « jeux », abandonnée
create or replace function public.lancer_defi(p_adversaire uuid, p_points int, p_sets int, p_classe boolean default true)
returns public.duels language plpgsql security definer set search_path = public as $$
declare d public.duels;
begin
  d := creer_duel(p_adversaire, p_points, p_sets);
  update duels set classe = coalesce(p_classe, true) and p_sets > 1 and p_points >= 7 where id = d.id returning * into d;
  return d;
end $$;

revoke all on function public._ecart(smallint), public._resoudre(uuid) from public, anon, authenticated;
revoke all on function public.lancer_defi(uuid, int, int, boolean) from public, anon;
grant execute on function public.lancer_defi(uuid, int, int, boolean) to authenticated;
