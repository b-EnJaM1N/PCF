-- HandSlam — Étape 85 : programmer un défi entre joueurs (les créneaux et le rendez-vous).
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Peut être relancé sans risque. Nécessite les étapes 2 à 84.
-- Puis mettre à jour la fonction « Notifier » (supabase/functions/notifier/index.ts : une notification de défi ouvre « Défis »).
--
-- 20 novembre (choix du porteur du projet) : comme pour les matchs de tournoi (étape 84), sur un défi pas encore commencé (envoyé,
-- reçu ou accepté ; entre amis ou par pseudo), « 📅 Programmer » : un joueur propose des plages (jusqu'à 5, dans les 14 jours),
-- l'autre choisit une heure (le rendez-vous est fixé, et le défi est accepté), propose d'autres plages ou décline.
-- Rappels 10 minutes avant et à l'heure. Pas de forfait : un défi programmé est gardé jusqu'à une heure après l'heure prévue,
-- puis annulé sans vainqueur (comme un défi accepté jamais joué, étape 37). Les mises ne sont prélevées qu'au vrai départ.
-- (accepte_le est placé 23 heures avant l'heure du rendez-vous : le ménage de l'étape 37 l'annule une heure après l'heure.)

create table if not exists public.creneaux_duel (
  duel_id uuid primary key references public.duels (id) on delete cascade,
  propose_par uuid references public.profils (id) on delete set null,
  plages jsonb not null default '[]'::jsonb,
  statut text not null default 'propose' check (statut in ('propose', 'fixe', 'decline')),
  rdv timestamptz,
  rappel_avant boolean not null default false, rappel_heure boolean not null default false,
  maj_le timestamptz not null default now()
);
alter table public.creneaux_duel enable row level security;
revoke all on public.creneaux_duel from public, anon, authenticated;

-- Le défi p_duel, s'il est à programmer par moi.
create or replace function public._defi_a_programmer(p_duel uuid) returns public.duels
language plpgsql security definer set search_path = public as $$
declare d public.duels;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  select * into d from duels where id = p_duel;
  if d.id is null or auth.uid() not in (d.j0, d.j1) then raise exception 'Ce défi ne te concerne pas'; end if;
  if d.tournoi_id is not null or d.rapide or d.j1 is null then raise exception 'Ce défi ne se programme pas'; end if;
  if d.phase <> 'attente' then raise exception 'Ce défi a déjà commencé (ou il est terminé)'; end if;
  return d;
end $$;

-- Mes défis programmés (ou en train de l'être) : pour l'appli.
create or replace function public.mes_creneaux_duels() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('duel_id', c.duel_id, 'propose_par', c.propose_par, 'plages', c.plages, 'statut', c.statut, 'rdv', c.rdv)), '[]'::jsonb)
  from creneaux_duel c join duels d on d.id = c.duel_id
  where auth.uid() in (d.j0, d.j1) and d.phase = 'attente'
$$;

create or replace function public.proposer_creneaux_duel(p_duel uuid, p_plages jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare d public.duels; p jsonb; v_debut timestamptz; v_fin timestamptz; propres jsonb := '[]'::jsonb;
begin
  d := _defi_a_programmer(p_duel);
  if p_plages is null or jsonb_typeof(p_plages) <> 'array' or jsonb_array_length(p_plages) = 0 then raise exception 'Propose au moins une plage'; end if;
  if jsonb_array_length(p_plages) > 5 then raise exception 'Cinq plages au plus'; end if;
  for p in select * from jsonb_array_elements(p_plages) loop
    begin v_debut := (p->>'debut')::timestamptz; v_fin := (p->>'fin')::timestamptz;
    exception when others then raise exception 'Plage invalide'; end;
    if v_debut is null or v_fin is null or v_fin <= v_debut then raise exception 'Plage invalide'; end if;
    if v_fin - v_debut < interval '15 minutes' or v_fin - v_debut > interval '12 hours' then raise exception 'Une plage dure de 15 minutes à 12 heures'; end if;
    if v_fin < now() + interval '5 minutes' then raise exception 'Cette plage est déjà passée'; end if;
    if v_debut > now() + interval '14 days' then raise exception 'Pas plus de 14 jours à l''avance'; end if;
    propres := propres || jsonb_build_array(jsonb_build_object('debut', greatest(v_debut, now()), 'fin', v_fin));
  end loop;
  insert into creneaux_duel (duel_id, propose_par, plages, statut, rdv, rappel_avant, rappel_heure, maj_le)
  values (p_duel, auth.uid(), propres, 'propose', null, false, false, now())
  on conflict (duel_id) do update set propose_par = excluded.propose_par, plages = excluded.plages, statut = 'propose', rdv = null,
    rappel_avant = false, rappel_heure = false, maj_le = now();
  perform _notifier_creneau(case when auth.uid() = d.j0 then d.j1 else d.j0 end, 'creneaux', auth.uid(), null);
  return mes_creneaux_duels();
end $$;

-- Choisir une heure dans les plages de l'autre : le rendez-vous est fixé, et le défi est accepté (gardé jusqu'à 1 h après l'heure).
create or replace function public.choisir_creneau_duel(p_duel uuid, p_heure timestamptz) returns jsonb
language plpgsql security definer set search_path = public as $$
declare d public.duels; c public.creneaux_duel;
begin
  d := _defi_a_programmer(p_duel);
  select * into c from creneaux_duel where duel_id = p_duel for update;
  if c.duel_id is null or c.statut <> 'propose' then raise exception 'Pas de créneau à choisir'; end if;
  if c.propose_par = auth.uid() then raise exception 'C''est à l''autre joueur de choisir'; end if;
  if p_heure is null or p_heure < now() - interval '1 minute' then raise exception 'Cette heure est déjà passée'; end if;
  if not exists (select 1 from jsonb_array_elements(c.plages) e where p_heure between (e->>'debut')::timestamptz and (e->>'fin')::timestamptz) then
    raise exception 'Choisis une heure dans une des plages proposées';
  end if;
  if auth.uid() = d.j1 and d.accepte_le is null then perform _assez_pour(d.mise); end if;   -- (accepter un défi à mise)
  update creneaux_duel set statut = 'fixe', rdv = p_heure, rappel_avant = p_heure < now() + interval '10 minutes', rappel_heure = false, maj_le = now()
  where duel_id = p_duel;
  update duels set accepte_le = p_heure - interval '23 hours', maj_le = now() where id = p_duel;
  perform _notifier_creneau(c.propose_par, 'rdv_fixe', auth.uid(), null, p_heure);
  return mes_creneaux_duels();
end $$;

create or replace function public.decliner_creneaux_duel(p_duel uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare d public.duels; c public.creneaux_duel;
begin
  d := _defi_a_programmer(p_duel);
  select * into c from creneaux_duel where duel_id = p_duel for update;
  if c.duel_id is null or c.statut <> 'propose' then raise exception 'Pas de créneau à décliner'; end if;
  if c.propose_par = auth.uid() then raise exception 'Ce sont tes propres créneaux'; end if;
  update creneaux_duel set statut = 'decline', maj_le = now() where duel_id = p_duel;
  perform _notifier_creneau(c.propose_par, 'rdv_decline', auth.uid(), null);
  return mes_creneaux_duels();
end $$;

-- Les rappels : ceux des matchs de tournoi (étape 84), puis ceux des défis programmés.
create or replace function public._rappels_rdv() returns void
language plpgsql security definer set search_path = public as $$
declare c record;
begin
  for c in select cm.*, m.j0, m.j1, m.tournoi_id from creneaux_match cm join matchs_tournoi m on m.id = cm.match_id
           where cm.statut = 'fixe' and m.fin is null and cm.rdv between now() - interval '5 minutes' and now() + interval '10 minutes' loop
    if not c.rappel_avant and c.rdv > now() then
      update creneaux_match set rappel_avant = true where match_id = c.match_id;
      perform _notifier_creneau(c.j0, 'rdv_rappel', c.j1, c.tournoi_id, c.rdv);
      perform _notifier_creneau(c.j1, 'rdv_rappel', c.j0, c.tournoi_id, c.rdv);
    elsif not c.rappel_heure and c.rdv <= now() then
      update creneaux_match set rappel_heure = true, rappel_avant = true where match_id = c.match_id;
      perform _notifier_creneau(c.j0, 'rdv_heure', c.j1, c.tournoi_id, c.rdv);
      perform _notifier_creneau(c.j1, 'rdv_heure', c.j0, c.tournoi_id, c.rdv);
    end if;
  end loop;
  for c in select cd.*, d.j0, d.j1 from creneaux_duel cd join duels d on d.id = cd.duel_id
           where cd.statut = 'fixe' and d.phase = 'attente' and cd.rdv between now() - interval '5 minutes' and now() + interval '10 minutes' loop
    if not c.rappel_avant and c.rdv > now() then
      update creneaux_duel set rappel_avant = true where duel_id = c.duel_id;
      perform _notifier_creneau(c.j0, 'rdv_rappel', c.j1, null, c.rdv);
      perform _notifier_creneau(c.j1, 'rdv_rappel', c.j0, null, c.rdv);
    elsif not c.rappel_heure and c.rdv <= now() then
      update creneaux_duel set rappel_heure = true, rappel_avant = true where duel_id = c.duel_id;
      perform _notifier_creneau(c.j0, 'rdv_heure', c.j1, null, c.rdv);
      perform _notifier_creneau(c.j1, 'rdv_heure', c.j0, null, c.rdv);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------- sécurité
revoke all on function public._defi_a_programmer(uuid), public._rappels_rdv() from public, anon, authenticated;
revoke all on function public.mes_creneaux_duels(), public.proposer_creneaux_duel(uuid, jsonb), public.choisir_creneau_duel(uuid, timestamptz),
  public.decliner_creneaux_duel(uuid) from public, anon;
grant execute on function public.mes_creneaux_duels(), public.proposer_creneaux_duel(uuid, jsonb), public.choisir_creneau_duel(uuid, timestamptz),
  public.decliner_creneaux_duel(uuid) to authenticated;
