-- HandSlam — Étape 75 : le ménage du journal des tâches automatiques.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Peut être relancé sans risque. Nécessite les étapes 2 à 74.
--
-- Constat du 13 novembre (taille de la base : 32 Mo) : la plus grosse table était cron.job_run_details (13 Mo), le journal des
-- tâches automatiques (veille des tournois chaque minute, rappels, championnats…) : une ligne à chaque passage, gardée pour
-- toujours. Décision du porteur du projet : chaque nuit, on efface les lignes de plus de 7 jours (une semaine d'historique reste,
-- pour comprendre un éventuel problème). Aucune donnée de joueur n'est touchée.
-- (La place libérée est réutilisée par la base : le journal ne grossit plus, même si la taille affichée ne baisse pas tout de suite.)

-- Efface les lignes du journal plus vieilles que p_jours jours (au moins 1) ; renvoie le nombre de lignes effacées.
-- (Sans pg_cron, par exemple sur une base de test, il n'y a pas de journal : rien à faire.)
create or replace function public._menage_journal(p_jours int default 7) returns bigint
language plpgsql security definer set search_path = public as $$
declare n bigint := 0;
begin
  if to_regclass('cron.job_run_details') is null then return 0; end if;
  execute format('delete from cron.job_run_details where end_time < now() - make_interval(days => %s)', greatest(coalesce(p_jours, 7), 1));
  get diagnostics n = row_count;
  return n;
end $$;

-- Chaque nuit à 3 h 17 (heure UTC), et une première fois tout de suite.
do $$ begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job where jobname = 'menage-journal';
  perform cron.schedule('menage-journal', '17 3 * * *', 'select public._menage_journal(7)');
  raise notice 'Journal : % lignes de plus de 7 jours effacées', public._menage_journal(7);
exception when others then
  raise notice 'pg_cron indisponible ici : pas de ménage automatique du journal (%)', sqlerrm;
end $$;

-- ---------------------------------------------------------------- sécurité
revoke all on function public._menage_journal(int) from public, anon, authenticated;
