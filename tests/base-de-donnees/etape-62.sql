-- Tests de supabase/etape-62-gants-un-signe.sql : les gants à un seul signe s'achètent, mais restent hors de la vitrine du jour.
\set QUIET on
\echo Tests de la base de données (étape 62 : les gants à un seul signe)

create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;

do $$ begin
  perform pg_temp.verifier((select count(*) from _catalogue()) = 55, '55 articles au catalogue');
  perform pg_temp.verifier((select prix from _catalogue() where id = 'gantMotif:signe_feuille') = 800, 'le gant « Feuille » : 800 jetons');
  perform pg_temp.verifier(not exists (select 1 from generate_series(date '2026-01-01', date '2026-12-31', interval '1 day') j, _vitrine(j::date) v
    where v.id like 'gantMotif:signe%' or v.id in ('gantMotif:club', 'bague:symbole', 'poignet:club')), 'les objets du club jamais dans la vitrine du jour');
end $$;
