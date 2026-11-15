-- Tests de supabase/etape-78-poignets-animaux.sql : les poignets vache et girafe à la boutique.
\set QUIET on
\echo Tests de la base de données (étape 78 : poignets vache et girafe)
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
select pg_temp.verifier((select count(*) from _catalogue()) = 85, '85 articles au catalogue');
select pg_temp.verifier((select count(*) from _catalogue() where id in ('poignet:vache', 'poignet:girafe') and prix = 800) = 2, 'poignets vache et girafe : 800 jetons chacun');
