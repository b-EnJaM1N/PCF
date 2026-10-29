-- Tests de supabase/etape-50-matchs-par-jour.sql : le nombre de matchs joués chaque jour, anonyme.
\set QUIET on
\echo Tests de la base de données (étape 50 : matchs par jour)

create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
delete from visites;

set role anon;
select compter_visite('site', false, false);
select compter_match('site');
select compter_match('site');
select compter_match('android');
select compter_match('pirate');
reset role;

do $$ begin
  perform pg_temp.verifier((select visiteurs = 1 and matchs = 2 from visites where origine = 'site'), 'site : 1 visiteur, 2 matchs');
  perform pg_temp.verifier((select visiteurs = 0 and matchs = 1 from visites where origine = 'android'), 'un match ne compte pas comme une visite');
  perform pg_temp.verifier((select count(*) = 2 from visites), 'origine inconnue ignorée');
end $$;
delete from visites;
