-- Tests de supabase/etape-3-duels.sql : règles, anti-triche, délais, pause et forfait.
\set QUIET on
\echo Tests de la base de données (étape 3 : duels)

insert into auth.users values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'a@x.fr'), ('bbbbbbbb-0000-0000-0000-000000000002', 'b@x.fr'),
  ('cccccccc-0000-0000-0000-000000000003', 'c@x.fr'), ('dddddddd-0000-0000-0000-000000000004', 'd@x.fr');
insert into profils (id, pseudo, numero) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Alice', 0), ('bbbbbbbb-0000-0000-0000-000000000002', 'Bob', 0),
  ('cccccccc-0000-0000-0000-000000000003', 'Bobette', 0), ('dddddddd-0000-0000-0000-000000000004', 'Cachou', 0);
update profils set visible_recherche = false where pseudo = 'Cachou';

create or replace function pg_temp.en_tant_que(uid text) returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', uid, false);
  execute format('set role %I', case when uid = '' then 'anon' else 'authenticated' end);
end $$;
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
-- Doit échouer (avec n'importe quelle erreur).
create or replace function pg_temp.interdit(sql text, msg text) returns void language plpgsql as $$
begin
  begin execute sql; exception when others then raise notice 'ok : %', msg; return; end;
  raise exception 'ÉCHEC : accepté alors que ça devait être refusé : %', msg;
end $$;
\set A 'aaaaaaaa-0000-0000-0000-000000000001'
\set B 'bbbbbbbb-0000-0000-0000-000000000002'
\set C 'cccccccc-0000-0000-0000-000000000003'
\set D 'dddddddd-0000-0000-0000-000000000004'
create temp table t (cle text primary key, val uuid);
grant all on t to public;

-- 1. Recherche
select pg_temp.en_tant_que(:'A');
select pg_temp.verifier((select count(*) = 2 from chercher_joueurs('bob')), 'recherche « bob » : Bob et Bobette');
select pg_temp.verifier((select count(*) = 0 from chercher_joueurs('alice')), 'on ne se trouve pas soi-même');
select pg_temp.verifier((select count(*) = 0 from chercher_joueurs('cachou')), 'un joueur caché n''apparaît pas');
select pg_temp.verifier((select count(*) = 1 from chercher_joueurs('bob#' || (select numero from profils where pseudo = 'Bob'))), 'recherche avec numéro');

-- 2. Défi d'Alice à Bob
insert into t select 'duel', id from creer_duel(:'B', 7, 2);
select pg_temp.verifier((select phase = 'attente' from duels where id = (select val from t where cle = 'duel')), 'défi créé, en attente');
select pg_temp.interdit(format('select creer_duel(%L, 7, 2)', :'A'), 'impossible de se défier soi-même');
select pg_temp.interdit('select creer_duel(null, 9, 2)', 'format invalide refusé');
select pg_temp.interdit(format('update duels set points = ''{6,0}'' where id = %L', (select val from t where cle = 'duel')), 'un joueur ne peut pas modifier le duel directement');
select pg_temp.interdit('select count(*) from coups_secrets', 'personne ne lit les coups secrets');

select pg_temp.en_tant_que(:'C');
select pg_temp.verifier((select count(*) = 0 from duels), 'un tiers ne voit pas le duel');
select pg_temp.interdit(format('select repondre_duel(%L, true)', (select val from t where cle = 'duel')), 'un tiers ne peut pas accepter');

-- 3. Bob accepte, les deux sont prêts
select pg_temp.en_tant_que(:'B');
select pg_temp.verifier((select count(*) = 1 from duels where phase = 'attente'), 'Bob voit le défi reçu');
select pg_temp.interdit(format('select jouer(%L, 1, 0)', (select val from t where cle = 'duel')), 'on ne joue pas avant d''avoir accepté');
select repondre_duel((select val from t where cle = 'duel'), true);
select pret((select val from t where cle = 'duel'));
select pg_temp.verifier((select phase = 'presentation' from duels where id = (select val from t where cle = 'duel')), 'un seul prêt : on attend l''autre');
select pg_temp.en_tant_que(:'A');
select pret((select val from t where cle = 'duel'));
select pg_temp.verifier((select phase = 'jeu' and echeance > now() from duels where id = (select val from t where cle = 'duel')), 'les deux sont prêts : le jeu commence');

-- 4. Un coup : Alice joue Pierre, Bob ne peut pas le voir, puis Bob joue Ciseaux
select jouer((select val from t where cle = 'duel'), 1, 0);
select pg_temp.interdit(format('select jouer(%L, 1, 2)', (select val from t where cle = 'duel')), 'un seul signe par coup, impossible de changer d''avis');
select pg_temp.en_tant_que(:'B');
select pg_temp.verifier((select jsonb_array_length(coups) = 0 from duels where id = (select val from t where cle = 'duel')), 'le signe d''Alice reste caché pour Bob');
select pg_temp.interdit(format('select jouer(%L, 1, 7)', (select val from t where cle = 'duel')), 'signe invalide refusé');
select pg_temp.interdit(format('select jouer(%L, 5, 1)', (select val from t where cle = 'duel')), 'mauvais numéro de coup refusé');
select jouer((select val from t where cle = 'duel'), 1, 1);
select pg_temp.verifier((select coups->0 = '{"a":0,"b":1,"g":0,"auto":[false,false]}'::jsonb and points = '{1,0}' and manche = 2
  from duels where id = (select val from t where cle = 'duel')), 'Pierre bat Ciseaux : point pour Alice, révélé aux deux');

-- 5. Une égalité ne compte pas
select pg_temp.en_tant_que(:'A'); select jouer((select val from t where cle = 'duel'), 2, 2);
select pg_temp.en_tant_que(:'B'); select jouer((select val from t where cle = 'duel'), 2, 2);
select pg_temp.verifier((select points = '{1,0}' and manche = 3 from duels where id = (select val from t where cle = 'duel')), 'égalité : score inchangé, coup suivant');

-- 6. Alice gagne le set 7–0
do $$ declare i int; le_duel uuid := (select val from t where cle = 'duel'); m int; begin
  for i in 1..6 loop
    m := (select manche from duels where duels.id = le_duel);
    perform pg_temp.en_tant_que('aaaaaaaa-0000-0000-0000-000000000001'); perform jouer(le_duel, m, 2);
    perform pg_temp.en_tant_que('bbbbbbbb-0000-0000-0000-000000000002'); perform jouer(le_duel, m, 0);
  end loop;
end $$;
select pg_temp.en_tant_que(:'A');
select pg_temp.verifier((select phase = 'entre_sets' and sets = '{1,0}' and points = '{0,0}' and scores_sets = '[[7,0]]'
  from duels where id = (select val from t where cle = 'duel')), 'set gagné 7–0, pause entre les sets');

-- 7. Relance du set : automatique si les joueurs tardent
reset role; update duels set echeance = now() - interval '1 second' where id = (select val from t where cle = 'duel');
select pg_temp.en_tant_que(:'A'); select reclamer((select val from t where cle = 'duel'));
select pg_temp.verifier((select phase = 'jeu' from duels where id = (select val from t where cle = 'duel')), 'set suivant lancé automatiquement');

-- 8. Temps écoulé : un signe au hasard pour celui qui n'a pas joué
select jouer((select val from t where cle = 'duel'), (select manche from duels where id = (select val from t where cle = 'duel')), 0);
select pg_temp.en_tant_que(:'B'); select reclamer((select val from t where cle = 'duel'));   -- Bob est bien là
reset role; update duels set echeance = now() - interval '2 seconds' where id = (select val from t where cle = 'duel');
select pg_temp.en_tant_que(:'B');
select pg_temp.interdit(format('select jouer(%L, %s, 1)', (select val from t where cle = 'duel'), (select manche from duels where id = (select val from t where cle = 'duel'))), 'trop tard pour jouer');
select pg_temp.en_tant_que(:'A'); select reclamer((select val from t where cle = 'duel'));
select pg_temp.verifier((select (coups->-1->'auto') = '[false,true]'::jsonb and (coups->-1->>'a')::int = 0
  from duels where id = (select val from t where cle = 'duel')), 'temps écoulé : Bob a joué au hasard, Alice a gardé son signe');

-- 9. Bob disparaît : pause, puis forfait après 60 secondes
reset role; update presences set vu = now() - interval '20 seconds' where joueur = 1 and duel_id = (select val from t where cle = 'duel');
select pg_temp.en_tant_que(:'A'); select reclamer((select val from t where cle = 'duel'));
select pg_temp.verifier((select pause_depuis is not null and phase = 'jeu' from duels where id = (select val from t where cle = 'duel')), 'adversaire absent : match en pause');
select pg_temp.interdit(format('select jouer(%L, %s, 1)', (select val from t where cle = 'duel'), (select manche from duels where id = (select val from t where cle = 'duel'))), 'on ne joue pas pendant la pause');
-- Bob revient avant la fin : le match reprend
select pg_temp.en_tant_que(:'B'); select reclamer((select val from t where cle = 'duel'));
select pg_temp.verifier((select pause_depuis is null from duels where id = (select val from t where cle = 'duel')), 'l''adversaire revient : le match reprend');
-- Bob repart pour de bon
reset role; update presences set vu = now() - interval '20 seconds' where joueur = 1 and duel_id = (select val from t where cle = 'duel');
select pg_temp.en_tant_que(:'A'); select reclamer((select val from t where cle = 'duel'));
reset role; update duels set pause_depuis = now() - interval '61 seconds' where id = (select val from t where cle = 'duel');
select pg_temp.en_tant_que(:'A'); select reclamer((select val from t where cle = 'duel'));
select pg_temp.verifier((select phase = 'termine' and vainqueur = 0 and fin = 'forfait' from duels where id = (select val from t where cle = 'duel')), 'absent plus de 60 s : victoire par forfait');

-- 10. Défi par lien : le premier qui rejoint devient l'adversaire
select pg_temp.en_tant_que(:'A');
insert into t select 'lien', id from creer_duel(null, 11, 3);
reset role; create temp table code_lien as select code from duels where id = (select val from t where cle = 'lien'); grant all on code_lien to public;
select pg_temp.en_tant_que(:'C');
select rejoindre_duel((select code from code_lien));
select pg_temp.verifier((select j1 = auth.uid() and phase = 'presentation' from duels where id = (select val from t where cle = 'lien')), 'défi par lien rejoint');
select pg_temp.en_tant_que(:'D');
select pg_temp.interdit(format('select rejoindre_duel(%L)', (select code from code_lien)), 'un lien déjà utilisé ne marche plus');

-- 11. Abandon
select pg_temp.en_tant_que(:'C'); select abandonner((select val from t where cle = 'lien'));
select pg_temp.verifier((select phase = 'termine' and vainqueur = 0 and fin = 'abandon' from duels where id = (select val from t where cle = 'lien')), 'abandon : victoire de l''autre');

-- 12. Refus et annulation
select pg_temp.en_tant_que(:'A'); insert into t select 'refus', id from creer_duel(:'B', 11, 2);
select pg_temp.en_tant_que(:'B'); select repondre_duel((select val from t where cle = 'refus'), false);
select pg_temp.verifier((select phase = 'refuse' from duels where id = (select val from t where cle = 'refus')), 'défi refusé');
select pg_temp.en_tant_que(:'A'); insert into t select 'annul', id from creer_duel(:'B', 11, 2);
select annuler_duel((select val from t where cle = 'annul'));
select pg_temp.verifier((select phase = 'annule' from duels where id = (select val from t where cle = 'annul')), 'défi annulé');

-- 13. Fonctions internes et visiteurs
select pg_temp.interdit(format('select _resoudre(%L)', (select val from t where cle = 'duel')), 'fonction interne interdite aux joueurs');
select pg_temp.en_tant_que('');
select pg_temp.interdit('select chercher_joueurs(''bob'')', 'les visiteurs ne peuvent pas chercher');
select pg_temp.interdit('select count(*) from duels', 'les visiteurs ne voient aucun duel');
reset role;
\echo 'Tous les tests des duels sont passés.'
