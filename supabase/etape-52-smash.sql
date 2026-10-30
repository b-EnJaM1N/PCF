-- HandSlam — Étape 52 : le smash (un coup joué « plus fort »), transmis à l'adversaire.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 51. Peut être relancé sans risque.
-- Si on relance un jour l'étape 49, il faut relancer celle-ci ensuite.
--
-- Décision du porteur du projet (30 octobre) : un appui long sur un signe joue un « smash » : gros son de raquette, secousse
-- et vibration, sur les deux téléphones. Pour le spectacle seulement (le point ne change pas), un par set et par joueur.
-- Le serveur garde le droit au smash (colonne smashs : le numéro du set, à partir de 0, du dernier smash de chacun) et le
-- révèle avec le coup ({ ..., "smash": [false, true] }).

alter table public.coups_secrets add column if not exists smash boolean not null default false;
alter table public.duels add column if not exists smashs smallint[] not null default '{-1,-1}';

-- Révèle les deux signes (remplace la version de l'étape 49) : avec qui a smashé.
create or replace function public._resoudre(p_id uuid) returns void
language plpgsql as $$
declare
  d public.duels;
  sa public.coups_secrets; sb public.coups_secrets;
  g smallint; r real[];
begin
  select * into d from public.duels where id = p_id for update;
  select * into sa from public.coups_secrets where duel_id = p_id and manche = d.manche and joueur = 0;
  select * into sb from public.coups_secrets where duel_id = p_id and manche = d.manche and joueur = 1;
  if sa is null or sb is null or d.phase <> 'jeu' then return; end if;

  r := d.reserve;
  r[1] := greatest(0, r[1] - greatest(0, extract(epoch from sa.joue_le - d.echeance)));
  r[2] := greatest(0, r[2] - greatest(0, extract(epoch from sb.joue_le - d.echeance)));
  d.reserve := r;

  -- Pierre bat Ciseaux, Ciseaux bat Feuille, Feuille bat Pierre ; égalité : rejouée.
  g := case when sa.signe = sb.signe then null when (sa.signe + 1) % 3 = sb.signe then 0 else 1 end;
  d.coups := d.coups || jsonb_build_object('a', sa.signe, 'b', sb.signe, 'g', g, 'auto', jsonb_build_array(sa.auto, sb.auto),
    'smash', jsonb_build_array(sa.smash, sb.smash));
  d.manche := d.manche + 1;
  d.echeance := now() + public._duree_coup() + interval '0.9 seconds';   -- le temps de voir les signes
  d := public._marquer(d, g);

  update public.duels set coups = d.coups, manche = d.manche, echeance = d.echeance, points = d.points, sets = d.sets,
    scores_sets = d.scores_sets, phase = d.phase, prets = d.prets, vainqueur = d.vainqueur, fin = d.fin, reserve = d.reserve,
    maj_le = now()
  where id = p_id;
end $$;

-- Jouer son signe (remplace la version de l'étape 49) : avec ou sans smash. L'ancienne version (sans p_smash) est retirée :
-- deux versions côte à côte rendraient l'appel ambigu ; les anciennes versions de l'appli, qui n'envoient pas p_smash, marchent toujours.
drop function if exists public.jouer(uuid, int, int);
create or replace function public.jouer(p_id uuid, p_manche int, p_signe int, p_smash boolean default false)
returns public.duels language plpgsql security definer set search_path = public as $$
declare d public.duels; moi smallint; s smallint; sm boolean;
begin
  select * into d from duels where id = p_id for update;
  if d is null then raise exception 'Duel introuvable'; end if;
  moi := _ma_place(d);
  perform _presence(p_id, moi);
  if d.phase <> 'jeu' then raise exception 'Ce n''est pas le moment de jouer'; end if;
  if d.pause_depuis is not null then raise exception 'Match en pause'; end if;
  if p_manche <> d.manche then raise exception 'Ce coup est déjà terminé'; end if;
  if p_signe not between 0 and 2 then raise exception 'Signe invalide'; end if;
  if now() > d.echeance + _tolerance() + make_interval(secs => d.reserve[moi + 1]) then raise exception 'Temps écoulé'; end if;
  if exists (select 1 from coups_secrets where duel_id = p_id and manche = d.manche and joueur = moi) then
    raise exception 'Tu as déjà joué ce coup';
  end if;
  -- Le smash : un par set et par joueur (sinon, le coup part sans smash).
  s := jsonb_array_length(d.scores_sets);
  sm := coalesce(p_smash, false) and coalesce(d.smashs[moi + 1], -1) <> s;
  if sm then update duels set smashs[moi + 1] = s where id = p_id; end if;
  insert into coups_secrets (duel_id, manche, joueur, signe, smash) values (p_id, d.manche, moi, p_signe, sm);
  if (select count(*) from coups_secrets where duel_id = p_id and manche = d.manche) = 2 then
    perform _resoudre(p_id);
  end if;
  select * into d from duels where id = p_id;
  return d;
end $$;

revoke all on function public._resoudre(uuid) from public, anon, authenticated;
revoke all on function public.jouer(uuid, int, int, boolean) from public, anon;
grant execute on function public.jouer(uuid, int, int, boolean) to authenticated;
