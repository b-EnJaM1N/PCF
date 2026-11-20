-- HandSlam — Étape 86 : le défi programmé, version complète.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Peut être relancé sans risque. Nécessite les étapes 2 à 85.
-- Puis mettre à jour la fonction « Notifier » (supabase/functions/notifier/index.ts : l'horaire dans la notification).
--
-- 20 novembre (parcours validé par le porteur du projet) :
--  * la notification dit tout : « 📅 Benja-Main te propose un défi ce soir à 19 h » (ou « entre 20 h et 22 h », ou « 2 créneaux ») ;
--    sur le téléphone, elle remplace celle du défi (même étiquette) ;
--  * « Décliner » refuse le défi (ou l'annule, pour celui qui l'a lancé) ;
--  * un défi programmé ne se lance jamais avant l'heure : on ne peut rejoindre la salle d'attente que 5 minutes avant le
--    rendez-vous, et pas tant qu'un nouvel horaire attend sa réponse ; on ne l'accepte pas sans choisir un horaire.

-- Les notifications des créneaux : les plages proposées, et le défi concerné (pour l'étiquette sur le téléphone).
alter table public.notifications add column if not exists plages jsonb;
alter table public.notifications add column if not exists ref_duel uuid;

drop function if exists public._notifier_creneau(uuid, text, uuid, uuid, timestamptz);
create or replace function public._notifier_creneau(p_joueur uuid, p_evenement text, p_de uuid, p_tournoi uuid, p_quand timestamptz default null,
  p_plages jsonb default null, p_duel uuid default null) returns void
language plpgsql security definer set search_path = public as $$
declare n bigint;
begin
  if p_joueur is null then return; end if;
  insert into notifications (duel_id, joueur, evenement, de, tournoi_id, quand, plages, ref_duel)
  values (null, p_joueur, p_evenement, p_de, p_tournoi, p_quand, p_plages, p_duel) returning id into n;
  if exists (select 1 from abonnements_push where joueur = p_joueur) then perform _appeler_notifier(n); end if;
exception when others then
  raise notice 'notification non envoyée : %', sqlerrm;
end $$;

-- (les plages dans la notification ; remplace la version de l'étape 84)
create or replace function public.proposer_creneaux(p_match uuid, p_plages jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare z record; vm public.matchs_tournoi; vt public.tournois; vmoi smallint; p jsonb; d timestamptz; f timestamptz; propres jsonb := '[]'::jsonb; adv uuid;
begin
  select * into z from _match_a_caler(p_match); vm := z.m; vt := z.t; vmoi := z.moi;
  if p_plages is null or jsonb_typeof(p_plages) <> 'array' or jsonb_array_length(p_plages) = 0 then raise exception 'Propose au moins une plage'; end if;
  if jsonb_array_length(p_plages) > 5 then raise exception 'Cinq plages au plus'; end if;
  for p in select * from jsonb_array_elements(p_plages) loop
    begin d := (p->>'debut')::timestamptz; f := (p->>'fin')::timestamptz;
    exception when others then raise exception 'Plage invalide'; end;
    if d is null or f is null or f <= d then raise exception 'Plage invalide'; end if;
    if f - d < interval '15 minutes' or f - d > interval '12 hours' then raise exception 'Une plage dure de 15 minutes à 12 heures'; end if;
    if f < now() + interval '5 minutes' then raise exception 'Cette plage est déjà passée'; end if;
    if vt.echeance is not null and d >= vt.echeance then raise exception 'Cette plage est après la date limite du tour'; end if;
    propres := propres || jsonb_build_array(jsonb_build_object('debut', greatest(d, now()), 'fin', least(f, coalesce(vt.echeance, f))));
  end loop;
  insert into creneaux_match (match_id, propose_par, plages, statut, rdv, la0, la1, rappel_avant, rappel_heure, maj_le)
  values (p_match, auth.uid(), propres, 'propose', null, null, null, false, false, now())
  on conflict (match_id) do update set propose_par = excluded.propose_par, plages = excluded.plages, statut = 'propose', rdv = null,
    la0 = null, la1 = null, rappel_avant = false, rappel_heure = false, maj_le = now();
  adv := case when vmoi = 0 then vm.j1 else vm.j0 end;
  perform _notifier_creneau(adv, 'creneaux', auth.uid(), vt.id, null, propres);
  return creneaux_de(p_match);
end $$;

-- (les plages et le défi dans la notification ; remplace la version de l'étape 85)
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
  perform _notifier_creneau(case when auth.uid() = d.j0 then d.j1 else d.j0 end, 'creneaux', auth.uid(), null, null, propres, p_duel);
  return mes_creneaux_duels();
end $$;

-- (remplace la version de l'étape 85 : le défi dans la notification)
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
  perform _notifier_creneau(c.propose_par, 'rdv_fixe', auth.uid(), null, p_heure, null, p_duel);
  return mes_creneaux_duels();
end $$;

-- Décliner (remplace la version de l'étape 85) : refuse le défi (ou l'annule, pour celui qui l'a lancé), avec ses créneaux.
create or replace function public.decliner_creneaux_duel(p_duel uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare d public.duels; c public.creneaux_duel;
begin
  d := _defi_a_programmer(p_duel);
  select * into c from creneaux_duel where duel_id = p_duel for update;
  if c.duel_id is null or c.statut <> 'propose' then raise exception 'Pas de créneau à décliner'; end if;
  if c.propose_par = auth.uid() then raise exception 'Ce sont tes propres créneaux'; end if;
  update creneaux_duel set statut = 'decline', maj_le = now() where duel_id = p_duel;
  update duels set phase = case when auth.uid() = d.j1 then 'refuse' else 'annule' end, maj_le = now() where id = p_duel;
  perform _notifier_creneau(c.propose_par, 'rdv_decline', auth.uid(), null, null, null, p_duel);
  return mes_creneaux_duels();
end $$;

-- (remplace la version de l'étape 85 : le défi dans les rappels)
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
      perform _notifier_creneau(c.j0, 'rdv_rappel', c.j1, null, c.rdv, null, c.duel_id);
      perform _notifier_creneau(c.j1, 'rdv_rappel', c.j0, null, c.rdv, null, c.duel_id);
    elsif not c.rappel_heure and c.rdv <= now() then
      update creneaux_duel set rappel_heure = true, rappel_avant = true where duel_id = c.duel_id;
      perform _notifier_creneau(c.j0, 'rdv_heure', c.j1, null, c.rdv, null, c.duel_id);
      perform _notifier_creneau(c.j1, 'rdv_heure', c.j0, null, c.rdv, null, c.duel_id);
    end if;
  end loop;
end $$;

-- La salle d'attente d'un défi programmé n'ouvre que 5 minutes avant l'heure (remplace la version de l'étape 40).
create or replace function public.rendez_vous(p_id uuid)
returns public.duels language plpgsql security definer set search_path = public as $$
declare d public.duels; moi smallint; c public.creneaux_duel;
begin
  select * into d from duels where id = p_id for update;
  if d is null or auth.uid() is null or auth.uid() not in (d.j0, d.j1) then raise exception 'Duel introuvable'; end if;
  if d.phase <> 'attente' or d.accepte_le is null then return d; end if;     -- déjà commencé, annulé…
  if now() > d.accepte_le + _attente_rdv() then
    update duels set phase = 'annule', maj_le = now() where id = p_id returning * into d;
    return d;
  end if;
  select * into c from creneaux_duel where duel_id = p_id;
  if c.duel_id is not null and c.statut = 'propose' then raise exception 'Un nouvel horaire attend sa réponse'; end if;
  if c.duel_id is not null and c.statut = 'fixe' and now() < c.rdv - interval '5 minutes' then
    raise exception 'Ce défi est programmé : la salle d''attente ouvre 5 minutes avant l''heure';
  end if;
  moi := case when auth.uid() = d.j0 then 0 else 1 end;
  if moi = 0 then d.rdv0 := now(); else d.rdv1 := now(); end if;
  if d.rdv0 > now() - _ensemble_rdv() and d.rdv1 > now() - _ensemble_rdv() then
    update duels set rdv0 = d.rdv0, rdv1 = d.rdv1, phase = 'presentation', echeance = now() + interval '45 seconds', maj_le = now()
    where id = p_id returning * into d;
  else
    update duels set rdv0 = d.rdv0, rdv1 = d.rdv1, maj_le = now() where id = p_id returning * into d;
    perform _prevenir_attente(d.id, case when moi = 0 then d.j1 else d.j0 end);
  end if;
  return d;
end $$;

-- Un défi programmé ne s'accepte qu'en choisissant un horaire (remplace la version de l'étape 37).
create or replace function public.repondre_duel(p_id uuid, p_accepte boolean)
returns public.duels language plpgsql security definer set search_path = public as $$
declare d public.duels;
begin
  select * into d from duels where id = p_id for update;
  if d is null or auth.uid() is distinct from d.j1 then raise exception 'Ce défi ne t''est pas adressé'; end if;
  if d.phase <> 'attente' or d.accepte_le is not null then raise exception 'Ce défi n''est plus disponible'; end if;
  if not p_accepte then
    update duels set phase = 'refuse', maj_le = now() where id = p_id returning * into d;
    return d;
  end if;
  if d.tournoi_id is not null or d.rapide then   -- match de tournoi (ou partie rapide) : comme avant, il commence tout de suite
    update duels set phase = 'presentation', echeance = now() + interval '45 seconds', maj_le = now() where id = p_id returning * into d;
    return d;
  end if;
  if exists (select 1 from creneaux_duel where duel_id = p_id and statut in ('propose', 'fixe')) then
    raise exception 'Ce défi est programmé : accepte un horaire';
  end if;
  perform _assez_pour(d.mise);
  update duels set accepte_le = now(), rdv1 = now(), maj_le = now() where id = p_id returning * into d;
  return rendez_vous(p_id);
end $$;

-- ---------------------------------------------------------------- sécurité
revoke all on function public._notifier_creneau(uuid, text, uuid, uuid, timestamptz, jsonb, uuid) from public, anon, authenticated;
