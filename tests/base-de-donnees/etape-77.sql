-- Tests de supabase/etape-77-routines.sql : les routines d'entrée à la boutique.
\set QUIET on
\echo Tests de la base de données (étape 77 : les routines d'entrée)
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
select pg_temp.verifier((select count(*) from _catalogue()) >= 83, 'au moins 83 articles au catalogue (87 depuis l''étape 78)');
select pg_temp.verifier((select count(*) from _catalogue() where id like 'routine:%') = 9, '9 routines à vendre (le salut reste gratuit)');
select pg_temp.verifier((select prix from _catalogue() where id = 'routine:pianiste') = 800, 'le pianiste : 800 jetons');
select pg_temp.verifier((select prix from _catalogue() where id = 'routine:chut') = 2000, '« Chut ! » : 2 000 jetons');
select pg_temp.verifier(not exists (select 1 from _catalogue() where id = 'routine:salut'), 'le salut n''est pas à vendre');
