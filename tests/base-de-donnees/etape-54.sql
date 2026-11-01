-- Tests de supabase/etape-54-smash-sonne.sql : un smash réussi sonne l'adversaire 4 secondes au coup suivant.
\set QUIET on
\echo Tests de la base de données (étape 54 : sonné par un smash)

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
select pg_temp.en_tant_que(:'B'); select pret((select val from t where cle = 'duel'));
select pg_temp.en_tant_que(:'A'); select pret((select val from t where cle = 'duel'));
\set M '(select manche from duels where id = (select val from t where cle = ''duel''))'

-- 1. Alice smashe et gagne le point (Pierre contre Ciseaux) : Bob est sonné pour le coup suivant.
select jouer((select val from t where cle = 'duel'), :M, 0, true);
select pg_temp.en_tant_que(:'B'); select jouer((select val from t where cle = 'duel'), :M, 1);
select pg_temp.verifier((select sonne = 1 and sonne_manche = manche from duels where id = (select val from t where cle = 'duel')), 'smash réussi d''Alice : Bob est sonné');
-- 2. Bob ne peut pas jouer tout de suite ; Alice, si.
select pg_temp.interdit(format('select jouer(%L, %s, 2)', (select val from t where cle = 'duel'), (select manche from duels where id = (select val from t where cle = 'duel'))), 'sonné : pas pendant les 4 premières secondes');
select pg_temp.en_tant_que(:'A'); select jouer((select val from t where cle = 'duel'), :M, 2);
-- 3. Après 4 secondes, Bob peut jouer.
reset role; update duels set echeance = now() + interval '3 seconds' where id = (select val from t where cle = 'duel');
select pg_temp.en_tant_que(:'B'); select jouer((select val from t where cle = 'duel'), :M, 2);
select pg_temp.verifier((select jsonb_array_length(coups) = 2 from duels where id = (select val from t where cle = 'duel')), 'après 4 secondes, Bob peut jouer');
-- 4. Un smash raté ne sonne personne.
select jouer((select val from t where cle = 'duel'), :M, 1, true);
select pg_temp.en_tant_que(:'A'); select jouer((select val from t where cle = 'duel'), :M, 0);
select pg_temp.verifier((select sonne_manche <> manche from duels where id = (select val from t where cle = 'duel')), 'smash raté de Bob : personne n''est sonné');
