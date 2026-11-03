-- Tests de supabase/etape-57-sans-mises.sql : plus aucune mise ; les jetons gagnés en jouant, plafonnés à 150 par jour.
\set QUIET on
\echo Tests de la base de données (étape 57 : sans mises, jetons gagnés en jouant)
insert into auth.users values ('aaaaaaaa-0000-0000-0000-000000000001', 'a@x.fr'), ('bbbbbbbb-0000-0000-0000-000000000002', 'b@x.fr');
insert into profils (id, pseudo, numero) values ('aaaaaaaa-0000-0000-0000-000000000001', 'Alice', 0), ('bbbbbbbb-0000-0000-0000-000000000002', 'Bob', 0);
create or replace function pg_temp.en_tant_que(uid text) returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', uid, false);
  execute format('set role %I', case when uid = '' then 'anon' else 'authenticated' end);
end $$;
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
create or replace function pg_temp.interdit(sql text, msg text) returns void language plpgsql as $$
begin
  begin execute sql; exception when others then raise notice 'ok : %', msg; return; end;
  raise exception 'ÉCHEC : accepté alors que ça devait être refusé : %', msg;
end $$;
reset pcf.mises;
select pg_temp.en_tant_que('aaaaaaaa-0000-0000-0000-000000000001');
select pg_temp.interdit($$select lancer_defi('bbbbbbbb-0000-0000-0000-000000000002', 11, 2, false, 50)$$, 'un défi avec mise est refusé');
select pg_temp.interdit($$select chercher_partie('express', 100)$$, 'une partie rapide avec mise est refusée');
select pg_temp.interdit($$select rejoindre_sit_and_go(8, 50)$$, 'un Sit & Go avec mise est refusé');
select pg_temp.verifier((select (lancer_defi('bbbbbbbb-0000-0000-0000-000000000002', 11, 2, false, 0)).id is not null), 'un défi sans mise passe');
reset role;
select pg_temp.verifier((select bool_and(mise = 0) from _programme()), 'les tournois programmés sont gratuits');
select pg_temp.en_tant_que('aaaaaaaa-0000-0000-0000-000000000001');
select pg_temp.verifier((select (gain_match(false, '{}') ->> 'gagne')::int = 5), 'match perdu : +5');
select pg_temp.verifier((select (gain_match(true, '{match_du_jour,smash,smash}') ->> 'gagne')::int = 33), 'victoire + match du jour + smash (compté une fois) : +33');
select pg_temp.verifier((select (gain_match(true, '{set_blanc,balle_match,serie5,inconnu}') ->> 'gagne')::int = 55), 'victoire et exploits : +55');
select pg_temp.verifier((select (gain_match(true, '{set_blanc,balle_match}') ->> 'gagne')::int = 50), 'victoire et exploits : +50');
select pg_temp.verifier((select (gain_match(true, '{}') ->> 'gagne')::int = 7), 'le plafond du jour (150) : seulement 7');
select pg_temp.verifier((select (gain_match(true, '{}') ->> 'gagne')::int = 0), 'plafond atteint : plus rien aujourd''hui');
reset role;
select pg_temp.verifier((select solde from jetons where joueur = 'aaaaaaaa-0000-0000-0000-000000000001') = 1150, '1 000 de bienvenue + 150 gagnés en jouant');
