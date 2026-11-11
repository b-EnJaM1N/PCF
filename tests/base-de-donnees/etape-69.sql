-- Tests de supabase/etape-69-smash-recupere.sql : au double smash, le gagnant du point récupère un smash pour le set.
\set QUIET on
\echo Tests de la base de données (étape 69 : le smash récupéré)

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

\set D '(select val from t where cle = 'duel')'
\set R '(select recups from duels where id = (select val from t where cle = ''duel''))'
\set S '(select coups->-1->''smash'' from duels where id = (select val from t where cle = ''duel''))'
\set J '(select val from t where cle = ''duel'')'

-- 1. Double smash : Alice (Pierre) bat Bob (Ciseaux) : elle récupère un smash pour ce set ; Bob, rien.
select jouer(:J, :M, 0, true);
select pg_temp.en_tant_que(:'B'); select jouer(:J, :M, 1, true);
select pg_temp.verifier(:R = '{0,-1}', 'double smash gagné par Alice : elle récupère un smash (set 0)');
-- 2. Alice resmashe dans le même set (Bob, sonné, attend 4 secondes) : le smash récupéré est dépensé.
select pg_temp.en_tant_que(:'A'); select jouer(:J, :M, 2, true);
reset role; update duels set echeance = now() + interval '3 seconds' where id = :J;
select pg_temp.en_tant_que(:'B'); select jouer(:J, :M, 2);
select pg_temp.verifier(:S = '[true, false]' and :R = '{-1,-1}', 'Alice smashe avec son smash récupéré');
-- 3. Plus rien en réserve : son smash suivant part sans smash.
select pg_temp.en_tant_que(:'A'); select jouer(:J, :M, 1, true);
select pg_temp.en_tant_que(:'B'); select jouer(:J, :M, 1);
select pg_temp.verifier(:S = '[false, false]', 'plus de smash : le coup part sans smash');
-- 4. Un smash simple repoussé ne donne rien : Bob smashe (Ciseaux), Alice gagne (Pierre) sans smasher.
select pg_temp.en_tant_que(:'B'); select jouer(:J, :M, 1, true);
select pg_temp.en_tant_que(:'A'); select jouer(:J, :M, 0);
select pg_temp.verifier(:R = '{-1,-1}', 'smash simple repoussé : personne ne récupère rien');
-- 5. Double smash bloqué (même signe) : personne ne récupère rien.
reset role; update duels set smashs = '{-1,-1}' where id = :J;
select pg_temp.en_tant_que(:'A'); select jouer(:J, :M, 2, true);
select pg_temp.en_tant_que(:'B'); select jouer(:J, :M, 2, true);
select pg_temp.verifier(:R = '{-1,-1}', 'double smash bloqué : personne ne récupère rien');
-- 6. Le smash récupéré se perd à la fin du set : double smash gagné par Bob sur la balle de set.
reset role; update duels set smashs = '{-1,-1}', points = '{0,6}' where id = :J;
select pg_temp.en_tant_que(:'A'); select jouer(:J, :M, 1, true);
select pg_temp.en_tant_que(:'B'); select jouer(:J, :M, 0, true);
select pg_temp.verifier((select phase = 'entre_sets' and recups[2] = 0 and jsonb_array_length(scores_sets) = 1 from duels where id = :J), 'Bob récupère un smash du set 0, qui est fini : il ne compte plus au set 1');
reset role;
