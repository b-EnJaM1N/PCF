-- Tests de supabase/etape-67-message-pleurer.sql : « Tu vas pleurer. » avant le match, entre amis.
\set QUIET on
\echo Tests de la base de données (étape 67 : un message de plus)
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
select pg_temp.verifier('pleurer' = any (_messages_rapides('avant', true)), '« Tu vas pleurer. » permis avant le match, entre amis');
select pg_temp.verifier(not ('pleurer' = any (_messages_rapides('avant', false))), 'pas avec un inconnu');
select pg_temp.verifier('chatoune' = any (_messages_rapides('vaincu', true)), 'les messages retirés de l''appli restent acceptés (anciennes versions)');
