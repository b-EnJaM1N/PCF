-- Tests de supabase/etape-43-visites.sql : le compteur de visites, anonyme.
\set QUIET on
\echo Tests de la base de données (étape 43 : compteur de visites)

create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
delete from visites;

set role anon;
select compter_visite('site', true);
select compter_visite('site', false);
select compter_visite('android', true);
select compter_visite('pirate', true);
do $$ begin
  begin perform count(*) from visites; raise exception 'ÉCHEC : un visiteur lit les visites';
  exception when insufficient_privilege then raise notice 'ok : un visiteur ne lit pas les visites'; end;
end $$;
reset role;

do $$ begin
  perform pg_temp.verifier((select visiteurs = 2 and nouveaux = 1 from visites where origine = 'site'), 'site : 2 visiteurs dont 1 nouveau');
  perform pg_temp.verifier((select visiteurs = 1 and nouveaux = 1 from visites where origine = 'android'), 'appli Android : 1 visiteur, nouveau');
  perform pg_temp.verifier((select count(*) = 2 from visites), 'origine inconnue ignorée');
end $$;
