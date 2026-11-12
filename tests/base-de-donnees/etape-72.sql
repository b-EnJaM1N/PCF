-- Tests de supabase/etape-72-motifs-animaux.sql : les gants vache, girafe et léopard à la boutique.
\set QUIET on
\echo Tests de la base de données (étape 72 : gants vache, girafe et léopard)
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
select pg_temp.verifier((select count(*) from _catalogue()) = 74, '74 articles au catalogue');
select pg_temp.verifier((select count(*) from _catalogue() where id in ('gantMotif:vache', 'gantMotif:girafe', 'gantMotif:leopard') and prix = 800) = 3, 'vache, girafe et léopard : 800 jetons chacun');
