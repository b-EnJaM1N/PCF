-- HandSlam — Étape 37 : le rendez-vous des défis entre joueurs.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ».
-- Nécessite les étapes 2 à 36. Peut être relancé sans risque.
--
-- Décision du porteur du projet (10 octobre) : accepter un défi ne lance plus le match tout de suite (l'autre
-- n'était peut-être plus là, et perdait par forfait). Le défi accepté devient un rendez-vous :
--  * celui qui accepte entre dans la salle d'attente ; celui qui a lancé le défi reçoit la notification « accepté » ;
--  * chacun peut quitter la salle d'attente et revenir (bouton « Rejoindre ») ; le match démarre dès que les deux
--    sont dans la salle d'attente en même temps ;
--  * un défi accepté mais jamais joué est annulé au bout de 24 heures, sans vainqueur (les mises ne sont prélevées
--    qu'au vrai départ du match) ; l'un ou l'autre peut aussi l'annuler avant.
-- Même chose pour un défi par lien. Les matchs de tournoi et les parties rapides ne changent pas.
-- Pendant le match, rien ne change (absence : pause, puis forfait au bout de 60 secondes).

alter table public.duels add column if not exists accepte_le timestamptz;   -- rendez-vous : défi accepté, match pas encore commencé
alter table public.duels add column if not exists rdv0 timestamptz;         -- dernier signe de vie de chacun dans la salle d'attente
alter table public.duels add column if not exists rdv1 timestamptz;

create or replace function public._attente_rdv() returns interval language sql immutable as $$ select interval '24 hours' $$;
create or replace function public._ensemble_rdv() returns interval language sql immutable as $$ select interval '20 seconds' $$;

-- Accepter ou refuser un défi reçu (remplace la version de l'étape 3) : accepter, c'est entrer dans la salle d'attente.
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
  perform _assez_pour(d.mise);
  update duels set accepte_le = now(), rdv1 = now(), maj_le = now() where id = p_id returning * into d;
  return rendez_vous(p_id);
end $$;

-- Rejoindre un défi reçu par lien (remplace la version de l'étape 3) : même rendez-vous.
create or replace function public.rejoindre_duel(p_code text)
returns public.duels language plpgsql security definer set search_path = public as $$
declare d public.duels;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton compte'; end if;
  select * into d from duels where code = p_code for update;
  if d is null then raise exception 'Défi introuvable'; end if;
  if auth.uid() in (d.j0, d.j1) then
    if d.phase = 'attente' and d.accepte_le is not null then return rendez_vous(d.id); end if;
    return d;                                                                  -- déjà dedans
  end if;
  if not d.par_lien or d.j1 is not null or d.phase <> 'attente' then raise exception 'Ce défi n''est plus disponible'; end if;
  perform _assez_pour(d.mise);
  update duels set j1 = auth.uid(), accepte_le = now(), rdv1 = now(), maj_le = now() where id = d.id;
  return rendez_vous(d.id);
end $$;

-- Dans la salle d'attente (appelé toutes les quelques secondes par le téléphone) : je suis là.
-- Le match démarre quand les deux y sont ; au bout de 24 heures, le rendez-vous est annulé.
create or replace function public.rendez_vous(p_id uuid)
returns public.duels language plpgsql security definer set search_path = public as $$
declare d public.duels; moi smallint;
begin
  select * into d from duels where id = p_id for update;
  if d is null or auth.uid() is null or auth.uid() not in (d.j0, d.j1) then raise exception 'Duel introuvable'; end if;
  if d.phase <> 'attente' or d.accepte_le is null then return d; end if;     -- déjà commencé, annulé…
  if now() > d.accepte_le + _attente_rdv() then
    update duels set phase = 'annule', maj_le = now() where id = p_id returning * into d;
    return d;
  end if;
  moi := case when auth.uid() = d.j0 then 0 else 1 end;
  if moi = 0 then d.rdv0 := now(); else d.rdv1 := now(); end if;
  if d.rdv0 > now() - _ensemble_rdv() and d.rdv1 > now() - _ensemble_rdv() then
    update duels set rdv0 = d.rdv0, rdv1 = d.rdv1, phase = 'presentation', echeance = now() + interval '45 seconds', maj_le = now()
    where id = p_id returning * into d;
  else
    update duels set rdv0 = d.rdv0, rdv1 = d.rdv1, maj_le = now() where id = p_id returning * into d;
  end if;
  return d;
end $$;

-- Annuler un défi pas encore commencé (remplace la version de l'étape 3) : celui qui l'a lancé,
-- ou, une fois accepté, l'un ou l'autre.
create or replace function public.annuler_duel(p_id uuid)
returns public.duels language plpgsql security definer set search_path = public as $$
declare d public.duels;
begin
  select * into d from duels where id = p_id for update;
  if d is null or not (auth.uid() = d.j0 or (d.accepte_le is not null and auth.uid() = d.j1)) then raise exception 'Ce défi n''est pas le tien'; end if;
  if d.phase <> 'attente' then raise exception 'Ce défi a déjà commencé'; end if;
  update duels set phase = 'annule', maj_le = now() where id = p_id returning * into d;
  return d;
end $$;

-- Les notifications (remplace la version de l'étape 11) : « accepté » quand le défi devient un rendez-vous.
create or replace function public._evenements_duel() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.tournoi_id is not null then
      -- Match de tournoi : prêt tout de suite (Sit & Go), ou l'adversaire t'attend (tournoi entre amis).
      if new.phase = 'presentation' then perform _notifier(new.id, new.j0, 'tournoi'); end if;
      perform _notifier(new.id, new.j1, 'tournoi');
    elsif new.phase = 'attente' and new.j1 is not null and not new.rapide then
      perform _notifier(new.id, new.j1, 'defi');               -- un défi reçu
    end if;
  elsif old.accepte_le is null and new.accepte_le is not null and new.tournoi_id is null and not new.rapide then
    perform _notifier(new.id, new.j0, 'accepte');              -- mon défi est accepté : on m'attend
  elsif old.phase = 'attente' and new.phase = 'presentation' and new.accepte_le is null and new.tournoi_id is null and not new.rapide then
    perform _notifier(new.id, new.j0, 'accepte');              -- (ancien chemin, sans rendez-vous)
  end if;
  return null;
end $$;
drop trigger if exists duels_notifications on public.duels;
create trigger duels_notifications after insert or update of phase, accepte_le on public.duels
for each row execute function public._evenements_duel();

-- Le ménage : les rendez-vous de plus de 24 heures sont annulés (toutes les 15 minutes, si pg_cron est là ;
-- sinon, au prochain passage d'un des deux joueurs).
create or replace function public._nettoyer_rdv() returns void
language sql security definer set search_path = public as $$
  update duels set phase = 'annule', maj_le = now() where phase = 'attente' and accepte_le < now() - _attente_rdv()
$$;
do $$ begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job where jobname = 'nettoyer-rdv';
  perform cron.schedule('nettoyer-rdv', '*/15 * * * *', 'select public._nettoyer_rdv()');
exception when others then
  raise notice 'pg_cron indisponible ici : pas de ménage automatique des rendez-vous (%)', sqlerrm;
end $$;

-- ---------------------------------------------------------------- sécurité
revoke all on function public._attente_rdv(), public._ensemble_rdv(), public._nettoyer_rdv() from public, anon, authenticated;
revoke all on function public.rendez_vous(uuid) from public, anon;
grant execute on function public.rendez_vous(uuid) to authenticated;
