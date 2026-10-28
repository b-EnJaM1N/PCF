-- HandSlam — Étape 49 : la réserve de temps (plus aucun coup joué au hasard).
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 48. Peut être relancé sans risque.
-- Si on relance un jour l'étape 3, 4b, 6, 7 ou 26, il faut relancer celle-ci ensuite.
--
-- Décision du porteur du projet (28 octobre) : un coup joué au hasard peut avantager un joueur (rien n'est plus imprévisible).
-- À la place : 8 secondes par coup, puis une réserve de 20 secondes pour tout le match (pas remise à zéro à chaque set),
-- où l'on puise. Réserve épuisée sans avoir joué : un avertissement la première fois (et 8 secondes de plus pour jouer
-- ce coup), puis un point de pénalité à chaque fois : le point va à l'adversaire, sans signes montrés.
-- La même règle est appliquée dans l'appli (app/js/regles.js : RESERVE_MS, depassement, penaliser).

-- ---------------------------------------------------------------- les colonnes
alter table public.duels add column if not exists reserve real[] not null default '{20,20}';          -- secondes restantes
alter table public.duels add column if not exists avertis boolean[] not null default '{false,false}'; -- déjà averti
-- Les points de pénalité, dans l'ordre : { "apres": nombre de coups révélés avant, "fautif": 0 ou 1 }.
alter table public.duels add column if not exists penalites jsonb not null default '[]'::jsonb;
-- L'heure à laquelle chaque signe a été joué (pour puiser dans la réserve).
alter table public.coups_secrets add column if not exists joue_le timestamptz not null default now();

-- ---------------------------------------------------------------- le score
-- Marque un point (g : 0 ou 1 ; null : rien) sur le duel d, sans l'enregistrer : fin de set, fin de match.
create or replace function public._marquer(d public.duels, g smallint) returns public.duels
language plpgsql as $$
declare p smallint[]; s smallint[];
begin
  if g is null then return d; end if;
  p := d.points; p[g + 1] := p[g + 1] + 1;
  -- Set gagné : au moins points_par_set points et l'écart nécessaire, ou le plafond atteint (point décisif à 14 ou 9 partout).
  if (greatest(p[1], p[2]) >= d.points_par_set and abs(p[1] - p[2]) >= public._ecart(d.points_par_set))
     or greatest(p[1], p[2]) >= coalesce(public._plafond(d.points_par_set), 32767) then
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
  return d;
end $$;

-- Révèle les deux signes du coup en cours (remplace la version de l'étape 26) : chacun puise dans sa réserve le temps
-- passé après la fin de ses 8 secondes.
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
  d.coups := d.coups || jsonb_build_object('a', sa.signe, 'b', sb.signe, 'g', g, 'auto', jsonb_build_array(sa.auto, sb.auto));
  d.manche := d.manche + 1;
  d.echeance := now() + public._duree_coup() + interval '0.9 seconds';   -- le temps de voir les signes
  d := public._marquer(d, g);

  update public.duels set coups = d.coups, manche = d.manche, echeance = d.echeance, points = d.points, sets = d.sets,
    scores_sets = d.scores_sets, phase = d.phase, prets = d.prets, vainqueur = d.vainqueur, fin = d.fin, reserve = d.reserve,
    maj_le = now()
  where id = p_id;
end $$;

-- Les 8 secondes et la réserve de ces joueurs sont épuisées, sans signe : avertissement la première fois (8 secondes de
-- plus pour ce coup), point de pénalité ensuite (le coup est terminé, le point va à l'adversaire).
create or replace function public._depasser(p_id uuid, p_fautifs smallint[]) returns void
language plpgsql as $$
declare d public.duels; f smallint; r real[]; av boolean[]; penalise boolean := false;
begin
  select * into d from public.duels where id = p_id for update;
  if d.phase <> 'jeu' then return; end if;
  r := d.reserve; av := d.avertis;
  foreach f in array p_fautifs loop
    r[f + 1] := 0;
    if not av[f + 1] then
      av[f + 1] := true;
    elsif d.phase = 'jeu' then
      d.penalites := d.penalites || jsonb_build_object('apres', jsonb_array_length(d.coups), 'fautif', f);
      d := public._marquer(d, (1 - f)::smallint);
      penalise := true;
    end if;
  end loop;
  d.reserve := r; d.avertis := av;
  if penalise then
    d.manche := d.manche + 1;
    if d.phase = 'jeu' then d.echeance := now() + public._duree_coup() + interval '0.9 seconds'; end if;
  else
    d.echeance := now() + public._duree_coup();
  end if;
  update public.duels set penalites = d.penalites, manche = d.manche, echeance = d.echeance, points = d.points, sets = d.sets,
    scores_sets = d.scores_sets, phase = d.phase, prets = d.prets, vainqueur = d.vainqueur, fin = d.fin, reserve = d.reserve,
    avertis = d.avertis, maj_le = now()
  where id = p_id;
end $$;

-- ---------------------------------------------------------------- jouer (remplace la version de l'étape 3)
-- Nouveau : on peut jouer tant qu'il reste de la réserve.
create or replace function public.jouer(p_id uuid, p_manche int, p_signe int)
returns public.duels language plpgsql security definer set search_path = public as $$
declare d public.duels; moi smallint;
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
  insert into coups_secrets (duel_id, manche, joueur, signe) values (p_id, d.manche, moi, p_signe);
  if (select count(*) from coups_secrets where duel_id = p_id and manche = d.manche) = 2 then
    perform _resoudre(p_id);
  end if;
  select * into d from duels where id = p_id;
  return d;
end $$;

-- ---------------------------------------------------------------- reclamer (remplace la version de l'étape 7)
-- Nouveau : temps dépassé (8 secondes et réserve) : avertissement, puis point de pénalité, au lieu d'un coup au hasard.
create or replace function public.reclamer(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare d public.duels; moi smallint; lui smallint; vu_lui timestamptz; absent boolean; fautifs smallint[];
begin
  select * into d from duels where id = p_id for update;
  if d is null then raise exception 'Duel introuvable'; end if;
  moi := _ma_place(d); lui := 1 - moi;
  perform _presence(p_id, moi);

  if d.phase = 'presentation' and now() > d.echeance and d.rapide
     and not exists (select 1 from presences where duel_id = p_id and joueur = lui) then
    -- Partie rapide : l'adversaire n'est jamais arrivé : la partie est annulée, sans vainqueur.
    update duels set phase = 'annule', echeance = null, maj_le = now() where id = p_id;
  elsif d.phase = 'presentation' and now() > d.echeance and d.tournoi_id is not null
     and not exists (select 1 from presences where duel_id = p_id and joueur = lui) then
    -- Match de tournoi : l'adversaire n'est jamais arrivé (60 secondes) : victoire par forfait.
    update duels set phase = 'termine', vainqueur = moi, fin = 'forfait', echeance = null, maj_le = now() where id = p_id;
  elsif d.phase in ('presentation', 'entre_sets') and now() > d.echeance then
    perform _demarrer(p_id);
  elsif d.phase = 'jeu' then
    select vu into vu_lui from presences where duel_id = p_id and joueur = lui;
    absent := vu_lui is null or vu_lui < now() - _absence();
    if absent and d.pause_depuis is null then
      update duels set pause_depuis = now(), maj_le = now() where id = p_id;
    elsif absent and now() > d.pause_depuis + _forfait() then
      update duels set phase = 'termine', vainqueur = moi, fin = 'forfait', echeance = null, pause_depuis = null, maj_le = now()
      where id = p_id;
    elsif not absent and d.pause_depuis is not null then
      update duels set pause_depuis = null, echeance = now() + _duree_coup(), maj_le = now() where id = p_id;
    elsif not absent and now() > d.echeance + _tolerance() then
      -- Ceux qui n'ont pas joué et dont la réserve est épuisée.
      select array_agg(j::smallint order by j) into fautifs from generate_series(0, 1) j
      where not exists (select 1 from coups_secrets c where c.duel_id = p_id and c.manche = d.manche and c.joueur = j)
        and now() > d.echeance + _tolerance() + make_interval(secs => d.reserve[j + 1]);
      if fautifs is not null then perform _depasser(p_id, fautifs); end if;
    end if;
  end if;
  select * into d from duels where id = p_id;
  return jsonb_build_object('maintenant', now(), 'duel', to_jsonb(d));
end $$;

-- ---------------------------------------------------------------- sécurité
revoke all on function public._marquer(public.duels, smallint), public._resoudre(uuid), public._depasser(uuid, smallint[])
  from public, anon, authenticated;
revoke all on function public.jouer(uuid, int, int), public.reclamer(uuid) from public, anon;
grant execute on function public.jouer(uuid, int, int), public.reclamer(uuid) to authenticated;
