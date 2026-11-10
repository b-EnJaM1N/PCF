-- Tests de supabase/etape-60-defis-sans-freeroll.sql : le freeroll n'est plus jamais tiré dans les défis du jour.
\set QUIET on
\echo Tests de la base de données (étape 60 : défis du jour sans le freeroll)

create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;

do $$ begin
  perform pg_temp.verifier(not exists (select 1 from _defis() where id = 'freeroll'), 'le freeroll n''est plus dans la liste des défis');
  perform pg_temp.verifier((select count(*) from _defis()) = 8, '8 défis possibles');
  -- sur une année entière, jamais tiré
  perform pg_temp.verifier(not exists (select 1 from generate_series(date '2026-01-01', date '2026-12-31', interval '1 day') j, _defis_du_jour(j::date) d where d.id = 'freeroll'),
    'jamais tiré au sort, de toute l''année');
  perform pg_temp.verifier((select count(*) from _defis_du_jour(date '2026-11-09')) = 3, 'toujours 3 défis par jour');
end $$;
