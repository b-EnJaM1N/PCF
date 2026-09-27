-- Tests de supabase/etape-4b-formats.sql : match en 1 set, sets en 3 jeux.
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
create or replace function pg_temp.accepter(d uuid) returns void language plpgsql as $$
begin
  perform pg_temp.en_tant_que('bbbbbbbb-0000-0000-0000-000000000002'); perform repondre_duel(d, true); perform pret(d);
  perform pg_temp.en_tant_que('aaaaaaaa-0000-0000-0000-000000000001'); perform pret(d);
end $$;
\set A 'aaaaaaaa-0000-0000-0000-000000000001'
\set B 'bbbbbbbb-0000-0000-0000-000000000002'
create temp table t (cle text primary key, val uuid);
grant all on t to public;

-- 1. Match en 1 set : toujours amical
select pg_temp.en_tant_que(:'A');
insert into t select 'court', id from lancer_defi(:'B', 7, 1, true, 1);
select pg_temp.verifier((select sets_gagnants = 1 and not classe from duels where id = (select val from t where cle = 'court')), 'match en 1 set : accepté, et toujours amical');
select pg_temp.interdit(format('select lancer_defi(%L, 11, 2, true, 2)', :'B'), '2 jeux par set refusé');
select pg_temp.interdit(format('select lancer_defi(%L, 11, 4, true, 1)', :'B'), '4 sets gagnants refusé');
select pg_temp.accepter((select val from t where cle = 'court'));
select pg_temp.points_alice((select val from t where cle = 'court'), 7);
select pg_temp.verifier((select phase = 'termine' and vainqueur = 0 and scores_sets = '[[7,0]]' and classement_motif = 'amical'
  from duels where id = (select val from t where cle = 'court')), 'un set gagné : match terminé, niveau officiel inchangé');

-- 2. Sets en 3 jeux
select pg_temp.en_tant_que(:'A');
insert into t select 'jeux', id from lancer_defi(:'B', 7, 2, true, 3);
select pg_temp.accepter((select val from t where cle = 'jeux'));
select pg_temp.points_alice((select val from t where cle = 'jeux'), 6);
select pg_temp.verifier((select points = '{6,0}' and jeux = '{0,0}' from duels where id = (select val from t where cle = 'jeux')), '6–0 dans le premier jeu');
select pg_temp.points_alice((select val from t where cle = 'jeux'), 1);
select pg_temp.verifier((select phase = 'jeu' and points = '{0,0}' and jeux = '{1,0}' and sets = '{0,0}' and scores_jeux = '[[7,0]]'
  from duels where id = (select val from t where cle = 'jeux')), 'premier jeu gagné 7–0 : le set continue');
select pg_temp.verifier((select echeance > now() + interval '7 seconds' from duels where id = (select val from t where cle = 'jeux')), 'décompte de 3 s avant le jeu suivant');
select pg_temp.points_alice((select val from t where cle = 'jeux'), 14);
select pg_temp.verifier((select phase = 'entre_sets' and jeux = '{0,0}' and sets = '{1,0}' and scores_sets = '[[3,0]]' and jsonb_array_length(scores_jeux) = 3
  from duels where id = (select val from t where cle = 'jeux')), 'trois jeux gagnés : le set est pris 3–0');
reset role;
\echo 'Tous les tests des formats sont passés.'
