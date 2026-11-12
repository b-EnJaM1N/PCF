-- Tests de supabase/etape-73-pouce-retire.sql : le pouce levé ne passe plus en vitrine et ne s'achète plus.
\set QUIET on
\echo Tests de la base de données (étape 73 : le pouce levé retiré de la vente)
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
select pg_temp.verifier(not exists (select 1 from generate_series(date '2026-01-01', date '2027-12-31', interval '1 day') j, _vitrine(j::date) v where v.id = 'geste:pouce_leve'), 'le pouce levé ne passe plus dans la vitrine du jour');
select pg_temp.verifier((select count(*) from _vitrine(date '2026-11-13')) = 3, 'la vitrine garde 3 articles');
select pg_temp.verifier(exists (select 1 from _catalogue() where id = 'geste:pouce_leve'), 'il reste au catalogue (ceux qui l''ont le gardent)');
