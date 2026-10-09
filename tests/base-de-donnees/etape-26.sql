-- Tests de supabase/etape-26-plafond-des-sets.sql : point décisif à 14 partout (sets de 11) et à 9 partout (sets de 7).
\set QUIET on
\echo Tests de la base de données (étape 26 : plafond des sets)

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

-- 1. Set de 11 : 13 partout, il faut encore 2 points d'écart ; 14 partout, point décisif : 15–14 gagne le set.
select pg_temp.en_tant_que(:'A');
insert into t select 'onze', id from lancer_defi(:'B', 11, 2, false);
select pg_temp.accepter((select val from t where cle = 'onze'));
select pg_temp.points_alice((select val from t where cle = 'onze'), 10);
select pg_temp.points_bob((select val from t where cle = 'onze'), 10);
select pg_temp.points_alice((select val from t where cle = 'onze'), 1), pg_temp.points_bob((select val from t where cle = 'onze'), 1);
select pg_temp.points_alice((select val from t where cle = 'onze'), 1), pg_temp.points_bob((select val from t where cle = 'onze'), 1);
select pg_temp.points_alice((select val from t where cle = 'onze'), 1), pg_temp.points_bob((select val from t where cle = 'onze'), 1);
select pg_temp.verifier((select phase = 'jeu' and points = '{13,13}' from duels where id = (select val from t where cle = 'onze')), '13 partout : le set continue');
select pg_temp.points_bob((select val from t where cle = 'onze'), 1);
select pg_temp.points_alice((select val from t where cle = 'onze'), 1);
select pg_temp.verifier((select phase = 'jeu' and points = '{14,14}' from duels where id = (select val from t where cle = 'onze')), '14 partout : le set continue (point décisif)');
select pg_temp.points_bob((select val from t where cle = 'onze'), 1);
select pg_temp.verifier((select phase = 'entre_sets' and sets = '{0,1}' and scores_sets = '[[14,15]]' from duels where id = (select val from t where cle = 'onze')),
  'point décisif : 14–15, le set est gagné avec un seul point d''écart');

-- 2. Set de 7 : 9 partout, point décisif : 10–9 gagne.
select pg_temp.en_tant_que(:'A');
insert into t select 'sept', id from lancer_defi(:'B', 7, 1, false);
select pg_temp.accepter((select val from t where cle = 'sept'));
select pg_temp.points_alice((select val from t where cle = 'sept'), 6);
select pg_temp.points_bob((select val from t where cle = 'sept'), 6);
select pg_temp.points_alice((select val from t where cle = 'sept'), 1), pg_temp.points_bob((select val from t where cle = 'sept'), 1);
select pg_temp.points_alice((select val from t where cle = 'sept'), 1), pg_temp.points_bob((select val from t where cle = 'sept'), 1);
select pg_temp.points_alice((select val from t where cle = 'sept'), 1), pg_temp.points_bob((select val from t where cle = 'sept'), 1);
select pg_temp.verifier((select phase = 'jeu' and points = '{9,9}' from duels where id = (select val from t where cle = 'sept')), '9 partout en set de 7 : le set continue');
select pg_temp.points_alice((select val from t where cle = 'sept'), 1);
select pg_temp.verifier((select phase = 'termine' and vainqueur = 0 and scores_sets = '[[10,9]]' from duels where id = (select val from t where cle = 'sept')),
  'point décisif : 10–9, match gagné');
