-- HandSlam — Étape 79 : les notifications des demandes d'ami et des invitations dans un cercle.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Peut être relancé sans risque. Nécessite les étapes 2 à 78.
-- Puis mettre à jour la fonction « Notifier » (supabase/functions/notifier/index.ts : les trois nouvelles notifications).
--
-- Accord du porteur du projet (15 novembre) : une notification quand on reçoit une demande d'ami (« 🤝 X veut être ton ami »),
-- quand sa demande est acceptée (« ✅ X a accepté ta demande d'ami »), et quand on est invité dans un cercle (« 🏰 X t'invite
-- dans le cercle … »). Une seule par demande : pas de rappel, et rien de plus si on réinvite la même personne. En touchant la
-- notification, l'appli s'ouvre sur Amis, où la demande attend en haut avec « Accepter » / « Refuser ».
-- Faites par des déclencheurs : les fonctions demander_ami, repondre_ami et inviter_cercle ne changent pas.

alter table public.notifications add column if not exists cercle_id uuid references public.cercles (id) on delete cascade;
alter table public.notifications drop constraint if exists notifications_evenement_check;
alter table public.notifications add constraint notifications_evenement_check
  check (evenement in ('defi', 'accepte', 'tournoi', 'test', 'freeroll', 'programme', 'attend', 'invitation',
                       'ami_demande', 'ami_accepte', 'invitation_cercle'));

-- Inscrit la notification (une seule fois pour ce joueur, cet événement, cet expéditeur et ce cercle) et l'envoie.
-- Rien ici ne doit jamais empêcher la demande ou l'invitation : en cas de problème, on abandonne en silence.
create or replace function public._notifier_social(p_joueur uuid, p_evenement text, p_de uuid, p_cercle uuid default null) returns void
language plpgsql security definer set search_path = public as $$
declare n bigint;
begin
  if p_joueur is null or p_joueur = p_de then return; end if;
  if exists (select 1 from notifications where joueur = p_joueur and evenement = p_evenement and de is not distinct from p_de
             and cercle_id is not distinct from p_cercle) then return; end if;
  insert into notifications (duel_id, joueur, evenement, de, cercle_id) values (null, p_joueur, p_evenement, p_de, p_cercle) returning id into n;
  if exists (select 1 from abonnements_push where joueur = p_joueur) then perform _appeler_notifier(n); end if;
exception when others then
  raise notice 'notification non envoyée : %', sqlerrm;
end $$;

-- Les amis : une demande reçue (l'autre que le demandeur), une demande acceptée (le demandeur).
create or replace function public._notifier_amitie() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' and new.statut = 'attente' then
    perform _notifier_social(case when new.a = new.demandeur then new.b else new.a end, 'ami_demande', new.demandeur);
  elsif tg_op = 'UPDATE' and old.statut = 'attente' and new.statut = 'amis' then
    perform _notifier_social(new.demandeur, 'ami_accepte', case when new.a = new.demandeur then new.b else new.a end);
  end if;
  return null;
end $$;
drop trigger if exists amities_notifications on public.amities;
create trigger amities_notifications after insert or update of statut on public.amities
for each row execute function public._notifier_amitie();

-- Les cercles : une invitation reçue.
create or replace function public._notifier_invitation_cercle() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform _notifier_social(new.invite, 'invitation_cercle', new.par, new.cercle_id);
  return null;
end $$;
drop trigger if exists invitations_cercle_notifications on public.invitations_cercle;
create trigger invitations_cercle_notifications after insert on public.invitations_cercle
for each row execute function public._notifier_invitation_cercle();

-- ---------------------------------------------------------------- sécurité
revoke all on function public._notifier_social(uuid, text, uuid, uuid), public._notifier_amitie(), public._notifier_invitation_cercle()
  from public, anon, authenticated;
