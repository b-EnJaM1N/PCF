-- Tests de supabase/etape-52-smash.sql : le smash, un par set et par joueur, révélé avec le coup.
\set QUIET on
\echo Tests de la base de données (étape 52 : le smash)

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
\set A 'aaaaaaaa-0000-0000-0000-000000000001'
\set B 'bbbbbbbb-0000-0000-0000-000000000002'
create temp table t (cle text primary key, val uuid);
grant all on t to public;

select pg_temp.en_tant_que(:'A');
insert into t select 'duel', id from creer_duel(:'B', 7, 2);
select pg_temp.en_tant_que(:'B'); select repondre_duel((select val from t where cle = 'duel'), true);
select pg_temp.en_tant_que(:'A'); select rendez_vous((select val from t where cle = 'duel'));
select pg_temp.en_tant_que(:'B'); select pret((select val from t where cle = 'duel'));
select pg_temp.en_tant_que(:'A'); select pret((select val from t where cle = 'duel'));
\set M '(select manche from duels where id = (select val from t where cle = ''duel''))'

-- 1. Alice smashe : révélé avec le coup ; Bob joue sans (ancienne façon d'appeler, sans p_smash).
select jouer((select val from t where cle = 'duel'), :M, 0, true);
select pg_temp.en_tant_que(:'B'); select jouer((select val from t where cle = 'duel'), :M, 1);
select pg_temp.verifier((select coups->-1->'smash' = '[true, false]'::jsonb from duels where id = (select val from t where cle = 'duel')), 'le smash d''Alice est révélé avec le coup');
-- 2. Un deuxième smash dans le même set : le coup part, sans smash.
select pg_temp.en_tant_que(:'A'); select jouer((select val from t where cle = 'duel'), :M, 2, true);
select pg_temp.en_tant_que(:'B'); select jouer((select val from t where cle = 'duel'), :M, 2, true);
select pg_temp.verifier((select coups->-1->'smash' = '[false, true]'::jsonb from duels where id = (select val from t where cle = 'duel')), 'un seul smash par set : Alice n''en a plus, Bob a le sien');
select pg_temp.verifier((select points = '{1,0}' from duels where id = (select val from t where cle = 'duel')), 'le smash ne change pas le point');
-- 3. Nouveau set : un nouveau smash.
reset role; update duels set smashs = '{0,0}', scores_sets = '[[7,0]]', sets = '{1,0}' where id = (select val from t where cle = 'duel');
select pg_temp.en_tant_que(:'A'); select jouer((select val from t where cle = 'duel'), :M, 0, true);
select pg_temp.en_tant_que(:'B'); select jouer((select val from t where cle = 'duel'), :M, 1);
select pg_temp.verifier((select coups->-1->'smash' = '[true, false]'::jsonb from duels where id = (select val from t where cle = 'duel')), 'nouveau set : de nouveau un smash');
