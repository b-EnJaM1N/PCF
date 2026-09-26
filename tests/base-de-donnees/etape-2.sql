-- Tests de sécurité et de fonctionnement de supabase/etape-2-comptes.sql.
-- Chaque test lève une erreur s'il échoue (psql -v ON_ERROR_STOP=1).
\set QUIET on
\echo Tests de la base de données (étape 2)
insert into auth.users values
  ('11111111-1111-1111-1111-111111111111', 'a@exemple.fr'),
  ('22222222-2222-2222-2222-222222222222', 'b@exemple.fr'),
  ('33333333-3333-3333-3333-333333333333', 'c@exemple.fr');

-- Joue le rôle d'un joueur connecté (ou d'un visiteur si uid est vide).
create or replace function pg_temp.en_tant_que(uid text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', uid, false);
  execute format('set role %I', case when uid = '' then 'anon' else 'authenticated' end);
end $$;
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;

-- 1. Un joueur crée sa fiche ; le numéro est attribué par le serveur, pas par le joueur.
select pg_temp.en_tant_que('11111111-1111-1111-1111-111111111111');
insert into profils (id, pseudo, numero, avatar, fiche) values ('11111111-1111-1111-1111-111111111111', 'Benji', 1, '{"symbole":"ciseaux"}', '{"matchs":3}');
select pg_temp.verifier((select numero between 1000 and 9999 from profils where id = auth.uid()), 'numéro attribué entre 1000 et 9999');

-- 2. Il ne peut pas créer la fiche de quelqu'un d'autre.
do $$ begin
  insert into profils (id, pseudo, numero) values ('22222222-2222-2222-2222-222222222222', 'Pirate', 1000);
  raise exception 'ÉCHEC : fiche créée pour un autre joueur';
exception when insufficient_privilege then raise notice 'ok : impossible de créer la fiche d''un autre';
end $$;

-- 3. Un second « benji » (casse différente) reçoit un numéro différent.
reset role;
select pg_temp.en_tant_que('22222222-2222-2222-2222-222222222222');
insert into profils (id, pseudo, numero) values ('22222222-2222-2222-2222-222222222222', 'benji', 0);
select pg_temp.verifier((select count(distinct numero) = 2 from profils where pseudo_min = 'benji'), 'deux Benji, deux numéros différents');

-- 4. Il peut lire la fiche des autres, mais pas la modifier ni la supprimer.
select pg_temp.verifier((select count(*) = 2 from profils), 'lecture des autres fiches');
update profils set fiche = '{"matchs":999}' where id = '11111111-1111-1111-1111-111111111111';
delete from profils where id = '11111111-1111-1111-1111-111111111111';
reset role;
select pg_temp.verifier((select fiche->>'matchs' = '3' from profils where id = '11111111-1111-1111-1111-111111111111'), 'la fiche d''un autre reste intacte');

-- 5. Il ne peut pas choisir son numéro en modifiant sa fiche ; il garde son numéro en changeant de pseudo.
select pg_temp.en_tant_que('22222222-2222-2222-2222-222222222222');
create temp table avant as select numero from profils where id = auth.uid();
update profils set numero = 1234, fiche = '{"matchs":5}' where id = auth.uid();
select pg_temp.verifier((select p.numero = a.numero from profils p, avant a where p.id = auth.uid()), 'numéro non modifiable');
update profils set pseudo = 'Benjamin' where id = auth.uid();
select pg_temp.verifier((select p.numero = a.numero and p.pseudo = 'Benjamin' from profils p, avant a where p.id = auth.uid()), 'nouveau pseudo, même numéro');
select pg_temp.verifier((select fiche->>'matchs' = '5' from profils where id = auth.uid()), 'fiche mise à jour');

-- 6. Pseudos invalides refusés.
do $$ declare p text; begin
  foreach p in array array['A', 'Nom#1234', 'beaucouptroplongpseudo', ' espace'] loop
    begin
      update profils set pseudo = p where id = auth.uid();
      raise exception 'ÉCHEC : pseudo accepté : %', p;
    exception when check_violation then null;
    end;
  end loop;
  raise notice 'ok : pseudos invalides refusés';
end $$;

-- 7. Un visiteur non connecté ne voit rien.
reset role;
select pg_temp.en_tant_que('');
do $$ begin
  perform count(*) from profils;
  raise exception 'ÉCHEC : un visiteur peut lire les fiches';
exception when insufficient_privilege then raise notice 'ok : les visiteurs ne voient rien';
end $$;

-- 8. Suppression de son compte : le compte et la fiche disparaissent, pas ceux des autres.
reset role;
select pg_temp.en_tant_que('22222222-2222-2222-2222-222222222222');
select public.supprimer_mon_compte();
reset role;
select pg_temp.verifier((select count(*) = 0 from auth.users where id = '22222222-2222-2222-2222-222222222222'), 'compte supprimé');
select pg_temp.verifier((select count(*) = 0 from profils where id = '22222222-2222-2222-2222-222222222222'), 'fiche supprimée avec le compte');
select pg_temp.verifier((select count(*) = 1 from profils), 'les autres fiches restent');

-- 9. Un visiteur ne peut pas appeler la suppression.
select pg_temp.en_tant_que('');
do $$ begin
  perform public.supprimer_mon_compte();
  raise exception 'ÉCHEC : un visiteur peut appeler supprimer_mon_compte';
exception when insufficient_privilege then raise notice 'ok : suppression réservée aux joueurs connectés';
end $$;
reset role;
\echo 'Tous les tests de la base de données sont passés.'
