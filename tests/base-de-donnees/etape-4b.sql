-- Tests de supabase/etape-4b-formats.sql : match en 1 set, sets de 3 et 1 point.
\set QUIET on
\echo Tests de la base de données (étape 4b : formats)

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
-- Alice gagne n points de suite (Pierre contre Ciseaux) ; renvoie rien.
create or replace function pg_temp.points_alice(d uuid, n int) returns void language plpgsql as $$
declare i int; m int;
begin
  for i in 1..n loop
    m := (select manche from duels where id = d);
    perform pg_temp.en_tant_que('aaaaaaaa-0000-0000-0000-000000000001'); perform jouer(d, m, 0);
    perform pg_temp.en_tant_que('bbbbbbbb-0000-0000-0000-000000000002'); perform jouer(d, m, 1);
  end loop;
end $$;
create or replace function pg_temp.points_bob(d uuid, n int) returns void language plpgsql as $$
declare i int; m int;
begin
  for i in 1..n loop
    m := (select manche from duels where id = d);
    perform pg_temp.en_tant_que('aaaaaaaa-0000-0000-0000-000000000001'); perform jouer(d, m, 1);
    perform pg_temp.en_tant_que('bbbbbbbb-0000-0000-0000-000000000002'); perform jouer(d, m, 0);
  end loop;
end $$;
create or replace function pg_temp.accepter(d uuid) returns void language plpgsql as $$
begin
  perform pg_temp.en_tant_que('bbbbbbbb-0000-0000-0000-000000000002'); perform repondre_duel(d, true);
  perform pg_temp.en_tant_que('aaaaaaaa-0000-0000-0000-000000000001'); perform rendez_vous(d);   -- étape 37 : le rendez-vous
  perform pg_temp.en_tant_que('bbbbbbbb-0000-0000-0000-000000000002'); perform pret(d);
  perform pg_temp.en_tant_que('aaaaaaaa-0000-0000-0000-000000000001'); perform pret(d);
end $$;
\set A 'aaaaaaaa-0000-0000-0000-000000000001'
\set B 'bbbbbbbb-0000-0000-0000-000000000002'
create temp table t (cle text primary key, val uuid);
grant all on t to public;

-- 1. Match en 1 set : toujours amical
select pg_temp.en_tant_que(:'A');
insert into t select 'court', id from lancer_defi(:'B', 7, 1, true);
select pg_temp.verifier((select sets_gagnants = 1 and not classe from duels where id = (select val from t where cle = 'court')), 'match en 1 set : accepté, et toujours amical');
select pg_temp.interdit(format('select lancer_defi(%L, 5, 2, true)', :'B'), 'sets de 5 points refusés');
select pg_temp.interdit(format('select lancer_defi(%L, 11, 4, true)', :'B'), '4 sets gagnants refusé');
select pg_temp.accepter((select val from t where cle = 'court'));
select pg_temp.points_alice((select val from t where cle = 'court'), 7);
select pg_temp.verifier((select phase = 'termine' and vainqueur = 0 and scores_sets = '[[7,0]]' and classement_motif = 'amical'
  from duels where id = (select val from t where cle = 'court')), 'un set gagné : match terminé, niveau officiel inchangé');

-- 2. Sets de 1 point : le premier point gagne le set
select pg_temp.en_tant_que(:'A');
insert into t select 'un', id from lancer_defi(:'B', 1, 2, true);
select pg_temp.verifier((select not classe from duels where id = (select val from t where cle = 'un')), 'sets de 1 point : toujours amical');
select pg_temp.accepter((select val from t where cle = 'un'));
select pg_temp.points_alice((select val from t where cle = 'un'), 1);
select pg_temp.verifier((select phase = 'entre_sets' and sets = '{1,0}' and scores_sets = '[[1,0]]' from duels where id = (select val from t where cle = 'un')), 'un point : set gagné 1–0');

-- 3. Sets de 3 points : 3–2 suffit
select pg_temp.en_tant_que(:'A');
insert into t select 'trois', id from lancer_defi(:'B', 3, 2, true);
select pg_temp.accepter((select val from t where cle = 'trois'));
select pg_temp.points_bob((select val from t where cle = 'trois'), 2);
select pg_temp.points_alice((select val from t where cle = 'trois'), 3);
select pg_temp.verifier((select phase = 'entre_sets' and scores_sets = '[[3,2]]' from duels where id = (select val from t where cle = 'trois')), 'set de 3 points gagné 3–2, sans 2 points d''écart');

-- 4. Les sets de 11 gardent les 2 points d'écart
select pg_temp.en_tant_que(:'A');
insert into t select 'onze', id from lancer_defi(:'B', 11, 2, true);
select pg_temp.verifier((select classe from duels where id = (select val from t where cle = 'onze')), 'sets de 11 : match officiel');
select pg_temp.accepter((select val from t where cle = 'onze'));
select pg_temp.points_bob((select val from t where cle = 'onze'), 10);
select pg_temp.points_alice((select val from t where cle = 'onze'), 11);
select pg_temp.verifier((select phase = 'jeu' and points = '{11,10}' from duels where id = (select val from t where cle = 'onze')), '11–10 : pas encore gagné');
reset role;
\echo 'Tous les tests des formats sont passés.'
