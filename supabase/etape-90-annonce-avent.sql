-- PCF — Étape 90 : le 1er décembre, une notification à tous : « Le calendrier de l'Avent est ouvert ! » (24 novembre, choix du
-- porteur du projet ; étape 89).
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Nécessite l'étape 89. Peut être relancé sans risque.
-- Puis mettre à jour la fonction « Notifier » (le texte de la notification).
--
-- Une seule fois par an : le 1er décembre au matin (9 h 15 à Paris), à chaque joueur abonné aux notifications.

alter table public.notifications drop constraint if exists notifications_evenement_check;
alter table public.notifications add constraint notifications_evenement_check
  check (evenement in ('defi', 'accepte', 'tournoi', 'test', 'freeroll', 'programme', 'attend', 'invitation',
                       'ami_demande', 'ami_accepte', 'invitation_cercle',
                       'creneaux', 'rdv_fixe', 'rdv_decline', 'rdv_rappel', 'rdv_heure',
                       'poules_24h', 'calendrier', 'disqualifie', 'tournoi_annule', 'avent'));

-- Les années où l'annonce est déjà partie (pour ne jamais l'envoyer deux fois).
create table if not exists public.annonces_avent (annee int primary key, envoyee_le timestamptz not null default now());
alter table public.annonces_avent enable row level security;
revoke all on public.annonces_avent from anon, authenticated;

-- Envoie l'annonce, si on est le 1er décembre (ou plus tard en décembre, si le minuteur a raté le 1er) et qu'elle n'est pas
-- encore partie cette année. Renvoie le nombre de joueurs prévenus.
create or replace function public._annoncer_avent() returns int
language plpgsql security definer set search_path = public as $$
declare a int := extract(year from _aujourdhui())::int; j uuid; n int := 0;
begin
  if _jour_avent() not between 1 and 24 then return 0; end if;
  insert into annonces_avent (annee) values (a) on conflict do nothing;
  if not found then return 0; end if;
  for j in select distinct joueur from abonnements_push loop
    perform _notifier_creneau(j, 'avent', null, null);
    n := n + 1;
  end loop;
  return n;
end $$;
revoke all on function public._annoncer_avent() from public, anon, authenticated;

do $$ begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job where jobname = 'annonce-avent';
  -- (toutes les heures de 8 h à 11 h UTC, du 1er au 3 décembre : la première fois envoie, les suivantes ne font rien)
  perform cron.schedule('annonce-avent', '15 8-11 1-3 12 *', 'select public._annoncer_avent()');
exception when others then
  raise notice 'pg_cron indisponible ici : pas d''annonce automatique du calendrier (%)', sqlerrm;
end $$;
