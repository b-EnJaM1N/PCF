-- Tests de supabase/etape-81-pause-replay.sql : en duel, la pause entre deux sets dure 45 secondes (le replay, puis 30 secondes).
\set QUIET on
\echo Tests de la base de données (étape 81 : la pause de 45 secondes)

insert into auth.users values ('aaaaaaaa-0000-0000-0000-000000000001', 'a@x.fr'), ('bbbbbbbb-0000-0000-0000-000000000002', 'b@x.fr');
insert into profils (id, pseudo, numero) values ('aaaaaaaa-0000-0000-0000-000000000001', 'Paula81', 0), ('bbbbbbbb-0000-0000-0000-000000000002', 'Remi81', 0);
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
reset role;
select pg_temp.verifier((select echeance > now() + interval '43 seconds' and echeance <= now() + interval '45 seconds' from duels where id = (select val from t where cle = 'duel')), 'la pause dure 45 secondes');
