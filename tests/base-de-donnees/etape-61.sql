-- Tests de supabase/etape-61-objets-du-club.sql : les objets du club s'achètent, mais restent hors de la vitrine du jour.
\set QUIET on
\echo Tests de la base de données (étape 61 : les objets du club)

create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;

do $$ begin
  perform pg_temp.verifier((select count(*) from _catalogue()) = 53, '53 articles au catalogue');
  perform pg_temp.verifier((select prix from _catalogue() where id = 'gantMotif:club') = 2000, 'le gant Club HandSlam : 2 000 jetons');
  perform pg_temp.verifier((select prix from _catalogue() where id = 'bague:symbole') = 800, 'la chevalière HandSlam : 800 jetons');
  -- sur une année entière, jamais dans la vitrine (la version officielle ne sait pas encore les dessiner)
  perform pg_temp.verifier(not exists (select 1 from generate_series(date '2026-01-01', date '2026-12-31', interval '1 day') j, _vitrine(j::date) v
    where v.id in ('gantMotif:signes', 'gantMotif:club', 'bague:symbole', 'poignet:club')), 'jamais dans la vitrine du jour');
  perform pg_temp.verifier((select count(*) from _vitrine(date '2026-11-09')) = 3, 'toujours 3 articles en vitrine');
end $$;
