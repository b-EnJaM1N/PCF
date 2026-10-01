-- PCF — Étape 16 : la notification « le freeroll commence dans 10 minutes ».
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Nécessite les étapes 11, 12 et 15.
-- Peut être relancé sans risque. Il faut aussi mettre à jour le code de la fonction « Notifier » (voir supabase/LISEZMOI.md).
--
-- Un minuteur du serveur (pg_cron, gratuit sur Supabase) appelle rappel_freeroll() à 17 h 50 et 18 h 50 (heure universelle) ;
-- la fonction n'agit que s'il est entre 19 h 45 et 20 h à Paris (donc une fois par jour, heure d'été comme d'hiver),
-- et prévient chaque inscrit du freeroll du jour qui a activé les notifications.

alter table public.notifications drop constraint if exists notifications_evenement_check;
alter table public.notifications add constraint notifications_evenement_check check (evenement in ('defi', 'accepte', 'tournoi', 'test', 'freeroll'));

-- (p_maintenant : pour les tests ; le minuteur appelle rappel_freeroll() sans argument)
drop function if exists public.rappel_freeroll();
create or replace function public.rappel_freeroll(p_maintenant timestamptz default now()) returns int
language plpgsql security definer set search_path = public as $$
declare t public.tournois; i record; n bigint; envoyes int := 0; heure time := (p_maintenant at time zone 'Europe/Paris')::time;
begin
  if heure < time '19:45' or heure >= time '20:00' then return 0; end if;
  select * into t from tournois where freeroll = (p_maintenant at time zone 'Europe/Paris')::date and phase = 'inscriptions';
  if t.id is null then return 0; end if;
  for i in select joueur from inscrits_tournoi where tournoi_id = t.id loop
    continue when exists (select 1 from notifications where joueur = i.joueur and evenement = 'freeroll' and cree_le > now() - interval '12 hours');
    insert into notifications (duel_id, joueur, evenement) values (null, i.joueur, 'freeroll') returning id into n;
    if exists (select 1 from abonnements_push where joueur = i.joueur) then perform _appeler_notifier(n); envoyes := envoyes + 1; end if;
  end loop;
  return envoyes;
end $$;
revoke all on function public.rappel_freeroll(timestamptz) from public, anon, authenticated;

-- Le minuteur (si pg_cron est disponible : sur Supabase, il s'active tout seul ici ou dans Database → Extensions).
do $$ begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job where jobname = 'rappel-freeroll';
  perform cron.schedule('rappel-freeroll', '50 17,18 * * *', 'select public.rappel_freeroll()');
exception when others then
  raise notice 'pg_cron indisponible ici : pas de rappel automatique (%)', sqlerrm;
end $$;
