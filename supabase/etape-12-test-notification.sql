-- PCF — Étape 12 : la notification de test (Options › Notifications › « Envoyer une notification de test »).
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Nécessite l'étape 11.
-- Peut être relancé sans risque. Il faut aussi mettre à jour le code de la fonction « notifier » (voir supabase/LISEZMOI.md).
--
-- Le test passe par le même chemin qu'une vraie notification : la base appelle la fonction « notifier »,
-- qui envoie sur le téléphone et note le résultat. L'appli lit ce résultat et dit ce qui bloque, s'il y a un problème.

alter table public.notifications alter column duel_id drop not null;
alter table public.notifications drop constraint if exists notifications_evenement_check;
alter table public.notifications add constraint notifications_evenement_check check (evenement in ('defi', 'accepte', 'tournoi', 'test'));
alter table public.notifications add column if not exists resultat text;   -- ce que la fonction a pu envoyer

-- Demande à la fonction « notifier » d'envoyer la notification n.
create or replace function public._appeler_notifier(n bigint) returns void
language plpgsql security definer set search_path = public as $$
begin
  if to_regproc('net.http_post') is null then return; end if;
  execute 'select net.http_post(url := $1, body := $2, headers := $3)'
    using _url_notifier(), jsonb_build_object('notification', n), jsonb_build_object('Content-Type', 'application/json');
exception when others then
  raise notice 'notification non envoyée : %', sqlerrm;
end $$;

-- Envoyer une notification de test à soi-même. Renvoie son numéro, pour suivre le résultat.
create or replace function public.tester_notification() returns bigint
language plpgsql security definer set search_path = public as $$
declare n bigint;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from abonnements_push where joueur = auth.uid()) then
    raise exception 'Aucun appareil abonné : active d''abord les notifications.';
  end if;
  if exists (select 1 from notifications where joueur = auth.uid() and evenement = 'test' and cree_le > now() - interval '15 seconds') then
    raise exception 'Un test est déjà en cours : attends quelques secondes.';
  end if;
  insert into notifications (duel_id, joueur, evenement) values (null, auth.uid(), 'test') returning id into n;
  perform _appeler_notifier(n);
  return n;
end $$;

-- Où en est la notification n ? { partie : la fonction l'a traitée, resultat : ce qu'elle a pu envoyer }
create or replace function public.etat_notification(p_id bigint) returns jsonb
language sql security definer set search_path = public as $$
  select jsonb_build_object('partie', envoye_le is not null, 'resultat', resultat)
  from notifications where id = p_id and joueur = auth.uid()
$$;

revoke all on function public._appeler_notifier(bigint) from public, anon, authenticated;
revoke all on function public.tester_notification(), public.etat_notification(bigint) from public, anon;
grant execute on function public.tester_notification(), public.etat_notification(bigint) to authenticated;
