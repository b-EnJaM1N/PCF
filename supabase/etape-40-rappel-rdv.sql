-- HandSlam — Étape 40 : prévenir l'autre joueur quand on l'attend dans la salle d'attente.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Puis mettre à jour la fonction « Notifier ».
-- Nécessite les étapes 2 à 39. Peut être relancé sans risque.
--
-- Demande du porteur du projet (10 octobre) : « trouver tous les moyens de synchroniser les joueurs ».
-- Quand un joueur entre dans la salle d'attente d'un défi accepté et que l'autre n'y est pas, l'autre reçoit
-- la notification « ⏳ X t'attend ! » ; au plus une toutes les 10 minutes par duel, et pas si on vient déjà de
-- le prévenir (par exemple « X a accepté ton défi », juste avant).

alter table public.notifications drop constraint if exists notifications_evenement_check;
alter table public.notifications add constraint notifications_evenement_check
  check (evenement in ('defi', 'accepte', 'tournoi', 'test', 'freeroll', 'programme', 'attend'));

create or replace function public._rappel_rdv() returns interval language sql immutable as $$ select interval '10 minutes' $$;

-- « X t'attend » pour p_joueur (au plus une fois toutes les 10 minutes, et pas juste après une autre notification).
create or replace function public._prevenir_attente(p_duel uuid, p_joueur uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_joueur is null then return; end if;
  if exists (select 1 from notifications where duel_id = p_duel and joueur = p_joueur and cree_le > now() - _rappel_rdv()) then return; end if;
  delete from notifications where duel_id = p_duel and joueur = p_joueur and evenement = 'attend';   -- l'ancien rappel (une seule ligne par événement)
  perform _notifier(p_duel, p_joueur, 'attend');
exception when others then
  raise notice 'rappel non envoyé : %', sqlerrm;   -- rien ici ne doit empêcher le rendez-vous
end $$;

-- Dans la salle d'attente (remplace la version de l'étape 37) : si l'autre n'est pas là, il est prévenu.
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
    perform _prevenir_attente(d.id, case when moi = 0 then d.j1 else d.j0 end);
  end if;
  return d;
end $$;

revoke all on function public._rappel_rdv(), public._prevenir_attente(uuid, uuid) from public, anon, authenticated;
