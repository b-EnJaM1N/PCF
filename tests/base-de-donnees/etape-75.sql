-- Tests de supabase/etape-75-menage-journal.sql : le journal des tâches automatiques garde 7 jours.
\set QUIET on
\echo Tests de la base de données (étape 75 : le ménage du journal des tâches automatiques)
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
-- Sans journal (pas de pg_cron ici) : rien à faire.
select pg_temp.verifier(to_regclass('cron.job_run_details') is not null or _menage_journal(7) = 0, 'sans journal : rien à effacer, pas d''erreur');
-- Un faux journal, comme celui de pg_cron (seulement s'il n'existe pas déjà).
do $$ begin
  if to_regclass('cron.job_run_details') is null then
    create schema if not exists cron;
    create table cron.job_run_details (runid bigserial primary key, end_time timestamptz, faux boolean default true);
  end if;
end $$;
insert into cron.job_run_details (end_time) select now() - make_interval(days => d) + interval '1 hour' from generate_series(0, 20) d;
insert into cron.job_run_details (end_time) values (null);   -- une tâche encore en cours
select pg_temp.verifier(_menage_journal(7) = 13, 'les 13 lignes de plus de 7 jours sont effacées');
select pg_temp.verifier((select count(*) from cron.job_run_details) = 9, 'la dernière semaine reste, et la tâche en cours aussi');
select pg_temp.verifier(_menage_journal(0) = 6, 'au moins 1 jour gardé, même si on demande 0');
select pg_temp.verifier(not has_function_privilege('anon', 'public._menage_journal(int)', 'execute')
  and not has_function_privilege('authenticated', 'public._menage_journal(int)', 'execute'), 'les joueurs ne peuvent pas l''appeler');
do $$ begin if exists (select 1 from information_schema.columns where table_schema = 'cron' and column_name = 'faux') then drop schema cron cascade; end if; end $$;
