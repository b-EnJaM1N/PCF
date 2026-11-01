-- Tests de supabase/etape-53-messages-entre-sets.sql : un message par pause entre les sets, les annonces, le temps d'écrire.
\set QUIET on
\echo Tests de la base de données (étape 53 : messages entre les sets)

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
\set A 'aaaaaaaa-0000-0000-0000-000000000001'
\set B 'bbbbbbbb-0000-0000-0000-000000000002'
create temp table t (cle text primary key, val uuid);
grant all on t to public;

select pg_temp.en_tant_que(:'A');
insert into t select 'duel', id from creer_duel(:'B', 7, 2);
select pg_temp.en_tant_que(:'B'); select repondre_duel((select val from t where cle = 'duel'), true);
select pg_temp.en_tant_que(:'A'); select rendez_vous((select val from t where cle = 'duel'));
-- 1. Avant le match : une annonce, avec n'importe quel joueur.
select envoyer_message((select val from t where cle = 'duel'), 'ouvre_p');
select pg_temp.verifier((select message_avant0 = 'ouvre_p' from duels where id = (select val from t where cle = 'duel')), 'avant le match : « J''ouvre avec Pierre. »');
select pg_temp.en_tant_que(:'B'); select pret((select val from t where cle = 'duel'));
select pg_temp.en_tant_que(:'A'); select pret((select val from t where cle = 'duel'));
-- Alice gagne le premier set 7–0 : la pause entre les sets.
do $$ declare i int; le_duel uuid := (select val from t where cle = 'duel'); m int; begin
  for i in 1..7 loop
    m := (select manche from duels where duels.id = le_duel);
    perform pg_temp.en_tant_que('aaaaaaaa-0000-0000-0000-000000000001'); perform jouer(le_duel, m, 2);
    perform pg_temp.en_tant_que('bbbbbbbb-0000-0000-0000-000000000002'); perform jouer(le_duel, m, 0);
  end loop;
end $$;
select pg_temp.en_tant_que(:'B');
select pg_temp.verifier((select phase = 'entre_sets' from duels where id = (select val from t where cle = 'duel')), 'pause entre les sets');
-- 2. Bob ouvre la fenêtre des messages : le set suivant attend 30 secondes au moins.
reset role; update duels set echeance = now() + interval '5 seconds' where id = (select val from t where cle = 'duel');
select pg_temp.en_tant_que(:'B'); select j_ecris((select val from t where cle = 'duel'));
select pg_temp.verifier((select echeance > now() + interval '28 seconds' and ecrit_set_n[2] = 1 from duels where id = (select val from t where cle = 'duel')), 'Bob écrit : 30 secondes pour le faire');
-- 3. Il envoie une annonce ; un deuxième message dans la même pause est ignoré ; le chambrage est réservé aux amis.
select envoyer_message((select val from t where cle = 'duel'), 'sais_c');
select envoyer_message((select val from t where cle = 'duel'), 'pas_fini');
select pg_temp.verifier((select message_set1 = 'sais_c' and message_set_n = '{-1,1}' from duels where id = (select val from t where cle = 'duel')), 'un message par pause : « Je sais : tu ouvres avec Ciseaux. »');
select pg_temp.en_tant_que(:'A');
select pg_temp.interdit(format('select envoyer_message(%L, %L)', (select val from t where cle = 'duel'), 'regretter'), 'chambrage entre les sets : seulement entre amis');
select envoyer_message((select val from t where cle = 'duel'), 'set_bien_joue');
select pg_temp.verifier((select message_set0 = 'set_bien_joue' from duels where id = (select val from t where cle = 'duel')), 'Alice répond : « Bien joué ce set ! »');
-- 4. Pendant le jeu, pas de message.
select pret((select val from t where cle = 'duel'));
select pg_temp.en_tant_que(:'B'); select pret((select val from t where cle = 'duel'));
select pg_temp.interdit(format('select envoyer_message(%L, %L)', (select val from t where cle = 'duel'), 'joue_p'), 'pendant le jeu : pas de message');
