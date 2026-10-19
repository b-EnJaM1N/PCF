-- Tests de supabase/etape-44-fidelite.sql : revenus de la veille et 3e match, anonymes.
\set QUIET on
\echo Tests de la base de données (étape 44 : fidélité)

create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
delete from visites;

set role anon;
select compter_visite('site', true);                 -- une ancienne version de l'appli (deux paramètres)
select compter_visite('site', false, true);          -- revenu de la veille
select compter_visite(p_origine => 'android', p_nouveau => false, p_revenu => true);
select compter_trois_matchs('site');
select compter_trois_matchs('installee');
select compter_trois_matchs('pirate');
reset role;

do $$ begin
  perform pg_temp.verifier((select visiteurs = 2 and nouveaux = 1 and revenus = 1 and trois_matchs = 1 from visites where origine = 'site'), 'site : 2 visiteurs, 1 nouveau, 1 revenu, 1 troisième match');
  perform pg_temp.verifier((select visiteurs = 1 and revenus = 1 from visites where origine = 'android'), 'appli Android : 1 revenu');
  perform pg_temp.verifier((select visiteurs = 0 and trois_matchs = 1 from visites where origine = 'installee'), 'un 3e match ne compte pas comme une visite');
  perform pg_temp.verifier((select count(*) = 3 from visites), 'origine inconnue ignorée');
end $$;
delete from visites;
