-- Tests de supabase/etape-64-bijoux.sql : les nouveaux bijoux à la boutique.
\set QUIET on
\echo Tests de la base de données (étape 64 : les bijoux)

create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;

do $$ begin
  perform pg_temp.verifier((select count(*) from _catalogue()) >= 71, 'au moins 71 articles au catalogue (74 depuis l''étape 72)');
  perform pg_temp.verifier((select prix from _catalogue() where id = 'bague:diamant') = 2000, 'la bague au diamant : 2 000 jetons');
  perform pg_temp.verifier(exists (select 1 from generate_series(date '2026-01-01', date '2026-12-31', interval '1 day') j, _vitrine(j::date) v where v.id like 'bracelet:%'), 'les bijoux passent parfois en vitrine');
  perform pg_temp.verifier(not exists (select 1 from generate_series(date '2026-01-01', date '2026-12-31', interval '1 day') j, _vitrine(j::date) v
    where v.id like 'gantMotif:signe%' or v.id in ('gantMotif:club', 'bague:symbole', 'poignet:club')), 'les objets du club toujours hors de la vitrine');
end $$;
