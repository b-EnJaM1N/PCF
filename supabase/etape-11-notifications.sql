-- PCF — Étape 11 : les notifications (« Bob te défie ! »).
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 10. Peut être relancé sans risque.
-- Il faut aussi créer la fonction « notifier » (supabase/functions/notifier/index.ts) : voir supabase/LISEZMOI.md.
--
-- Principes :
--  * le téléphone qui accepte les notifications envoie son « abonnement » (une adresse fournie par le navigateur) ;
--  * quand un événement arrive (défi reçu, défi accepté, match de tournoi prêt), la base l'inscrit dans « notifications »
--    et appelle la fonction « notifier », qui envoie la notification (une seule fois par événement) ;
--  * les clés d'envoi sont créées par la fonction « notifier » elle-même et restent dans la base : aucune clé secrète
--    ne passe par le code ni par personne.

-- pg_net : permet à la base d'appeler la fonction « notifier » (disponible sur Supabase).
do $$ begin create extension if not exists pg_net; exception when others then raise notice 'pg_net indisponible ici : les notifications seront seulement enregistrées'; end $$;

create table if not exists public.abonnements_push (
  endpoint text primary key,
  joueur uuid not null references public.profils (id) on delete cascade,
  p256dh text not null,
  auth text not null,
  cree_le timestamptz not null default now(),
  constraint endpoint_valide check (endpoint ~ '^https://' and char_length(endpoint) < 1000)
);
alter table public.abonnements_push enable row level security;
revoke all on public.abonnements_push from public, anon, authenticated;

-- Les clés d'envoi (créées par la fonction « notifier » au premier appel).
create table if not exists public.config_push (
  id int primary key default 1 check (id = 1),
  publique text not null,
  privee text not null
);
alter table public.config_push enable row level security;
revoke all on public.config_push from public, anon, authenticated;

create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  duel_id uuid not null references public.duels (id) on delete cascade,
  joueur uuid not null references public.profils (id) on delete cascade,
  evenement text not null check (evenement in ('defi', 'accepte', 'tournoi')),
  cree_le timestamptz not null default now(),
  envoye_le timestamptz,
  constraint une_notification_par_evenement unique (duel_id, joueur, evenement)
);
alter table public.notifications enable row level security;
revoke all on public.notifications from public, anon, authenticated;

create or replace function public._url_notifier() returns text language sql immutable as $$
  select 'https://fvfdcyglwngosxfougje.supabase.co/functions/v1/notifier'
$$;

-- Inscrit une notification (une seule fois) et demande à la fonction « notifier » de l'envoyer.
-- Rien ici ne doit jamais empêcher un duel d'avancer : en cas de problème, on abandonne en silence.
create or replace function public._notifier(p_duel uuid, p_joueur uuid, p_evenement text) returns void
language plpgsql security definer set search_path = public as $$
declare n bigint;
begin
  if p_joueur is null then return; end if;
  insert into notifications (duel_id, joueur, evenement) values (p_duel, p_joueur, p_evenement)
  on conflict do nothing returning id into n;
  if n is null or not exists (select 1 from abonnements_push where joueur = p_joueur) then return; end if;
  if to_regproc('net.http_post') is null then return; end if;
  execute 'select net.http_post(url := $1, body := $2, headers := $3)'
    using _url_notifier(), jsonb_build_object('notification', n), jsonb_build_object('Content-Type', 'application/json');
exception when others then
  raise notice 'notification non envoyée : %', sqlerrm;
end $$;

-- Les événements qui méritent une notification.
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
  elsif old.phase = 'attente' and new.phase = 'presentation' and new.tournoi_id is null and not new.rapide then
    perform _notifier(new.id, new.j0, 'accepte');              -- mon défi est accepté
  end if;
  return null;
end $$;
drop trigger if exists duels_notifications on public.duels;
create trigger duels_notifications after insert or update of phase on public.duels
for each row execute function public._evenements_duel();

-- Le téléphone accepte les notifications : on garde son abonnement (5 appareils au plus par joueur).
create or replace function public.enregistrer_abonnement_push(p_endpoint text, p_p256dh text, p_auth text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  insert into abonnements_push (endpoint, joueur, p256dh, auth) values (p_endpoint, auth.uid(), p_p256dh, p_auth)
  on conflict (endpoint) do update set joueur = auth.uid(), p256dh = excluded.p256dh, auth = excluded.auth, cree_le = now();
  delete from abonnements_push where joueur = auth.uid() and endpoint not in
    (select endpoint from abonnements_push where joueur = auth.uid() order by cree_le desc limit 5);
end $$;

create or replace function public.retirer_abonnement_push(p_endpoint text) returns void
language sql security definer set search_path = public as $$
  delete from abonnements_push where endpoint = p_endpoint and joueur = auth.uid();
$$;

revoke all on function public._notifier(uuid, uuid, text), public._evenements_duel(), public._url_notifier() from public, anon, authenticated;
revoke all on function public.enregistrer_abonnement_push(text, text, text), public.retirer_abonnement_push(text) from public, anon;
grant execute on function public.enregistrer_abonnement_push(text, text, text), public.retirer_abonnement_push(text) to authenticated;
