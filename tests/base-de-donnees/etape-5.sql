-- Tests de supabase/etape-5-tournois.sql : un tournoi de cercle complet, dates limites, sécurité.
\set QUIET on
\echo Tests de la base de données (étape 5 : tournois)

insert into auth.users values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'a@x.fr'), ('bbbbbbbb-0000-0000-0000-000000000002', 'b@x.fr'),
  ('cccccccc-0000-0000-0000-000000000003', 'c@x.fr'), ('dddddddd-0000-0000-0000-000000000004', 'd@x.fr'),
  ('eeeeeeee-0000-0000-0000-000000000005', 'e@x.fr'), ('ffffffff-0000-0000-0000-000000000006', 'f@x.fr');
insert into profils (id, pseudo, numero) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Alice', 0), ('bbbbbbbb-0000-0000-0000-000000000002', 'Bob', 0),
  ('cccccccc-0000-0000-0000-000000000003', 'Chloé', 0), ('dddddddd-0000-0000-0000-000000000004', 'Dan', 0),
  ('eeeeeeee-0000-0000-0000-000000000005', 'Emma', 0), ('ffffffff-0000-0000-0000-000000000006', 'Fred', 0);
-- Niveaux officiels : Alice 1300 > Bob 1250 > Chloé 1200 > Dan 1150 > Emma 1100 (têtes de série 1 à 5).
insert into classements (joueur, points) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 1300), ('bbbbbbbb-0000-0000-0000-000000000002', 1250),
  ('dddddddd-0000-0000-0000-000000000004', 1150), ('eeeeeeee-0000-0000-0000-000000000005', 1100);

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
create temp table t (cle text primary key, val text);
grant all on t to public;
create or replace function pg_temp.v(k text) returns text language sql as $$ select val from t where cle = k $$;
-- Le match du tour en cours entre deux joueurs.
create or replace function pg_temp.match(tid text, x text, y text) returns uuid language sql as $$
  select id from matchs_tournoi where tournoi_id = tid::uuid and fin is null and x::uuid in (j0, j1) and y::uuid in (j0, j1)
$$;
-- Les deux joueurs ont rejoint le duel : « prêt », puis le gagnant marque (sets de 1 point, 1 set).
create or replace function pg_temp.jouer_duel(d uuid, gagnant text, perdant text) returns void language plpgsql as $$
declare m int;
begin
  perform pg_temp.en_tant_que(gagnant); perform pret(d);
  perform pg_temp.en_tant_que(perdant); perform pret(d);
  m := (select manche from duels where id = d);
  perform pg_temp.en_tant_que(gagnant); perform jouer(d, m, 0);
  perform pg_temp.en_tant_que(perdant); perform jouer(d, m, 1);
end $$;
\set A 'aaaaaaaa-0000-0000-0000-000000000001'
\set B 'bbbbbbbb-0000-0000-0000-000000000002'
\set C 'cccccccc-0000-0000-0000-000000000003'
\set D 'dddddddd-0000-0000-0000-000000000004'
\set E 'eeeeeeee-0000-0000-0000-000000000005'
\set F 'ffffffff-0000-0000-0000-000000000006'

-- 1. Un cercle et son tournoi
select pg_temp.en_tant_que(:'A');
insert into t select 'cercle', creer_cercle('Famille', '{}')->>'id';
reset role; insert into t select 'code_cercle', code from cercles where id = pg_temp.v('cercle')::uuid;
select pg_temp.en_tant_que(:'B'); select rejoindre_cercle(pg_temp.v('code_cercle'));
select pg_temp.en_tant_que(:'C'); select rejoindre_cercle(pg_temp.v('code_cercle'));
select pg_temp.en_tant_que(:'D'); select rejoindre_cercle(pg_temp.v('code_cercle'));
select pg_temp.en_tant_que(:'A');
select pg_temp.interdit(format('select creer_tournoi(''X'', %L, 1, 1, 15)', pg_temp.v('cercle')), 'nom trop court refusé');
select pg_temp.interdit(format('select creer_tournoi(''Open'', %L, 1, 1, 30)', pg_temp.v('cercle')), 'durée de tour invalide refusée');
insert into t select 'tournoi', creer_tournoi('Open de la Famille', pg_temp.v('cercle')::uuid, 1, 1, 15)->>'id';
select pg_temp.verifier((select (x->>'inscrit')::boolean and x->>'phase' = 'inscriptions' from jsonb_array_elements(mes_tournois()) x), 'le créateur est inscrit, inscriptions ouvertes');
select pg_temp.interdit('select * from tournois', 'la table des tournois n''est pas lisible directement');
select pg_temp.interdit(format('insert into inscrits_tournoi (tournoi_id, joueur) values (%L, %L)', pg_temp.v('tournoi'), :'F'), 'impossible d''inscrire quelqu''un directement');

-- 2. Inscriptions
select pg_temp.en_tant_que(:'B');
select pg_temp.verifier((select jsonb_array_length(mes_tournois()) = 1), 'un membre du cercle voit le tournoi ouvert');
select inscrire_tournoi(pg_temp.v('tournoi')::uuid);
select pg_temp.en_tant_que(:'C'); select inscrire_tournoi(pg_temp.v('tournoi')::uuid);
select pg_temp.en_tant_que(:'D'); select inscrire_tournoi(pg_temp.v('tournoi')::uuid);
select pg_temp.en_tant_que(:'E');
select pg_temp.interdit(format('select inscrire_tournoi(%L)', pg_temp.v('tournoi')), 'un non-membre ne peut pas s''inscrire');
reset role; insert into t select 'code_tournoi', code from tournois where id = pg_temp.v('tournoi')::uuid;
select pg_temp.en_tant_que(:'E');
select pg_temp.interdit(format('select rejoindre_tournoi(%L)', pg_temp.v('code_tournoi')), 'tournoi de cercle : même avec le lien, il faut être membre');
select pg_temp.interdit(format('select voir_tournoi(%L)', pg_temp.v('tournoi')), 'un non-membre ne voit pas le tournoi');
select rejoindre_cercle(pg_temp.v('code_cercle'));
select pg_temp.verifier((select rejoindre_tournoi(pg_temp.v('code_tournoi'))->>'nom' = 'Open de la Famille'), 'une fois membre, Emma rejoint par le lien');
select pg_temp.interdit(format('select lancer_tournoi(%L)', pg_temp.v('tournoi')), 'seul l''organisateur lance le tournoi');

-- 3. Lancement : 5 joueurs, tableau de 8, 3 exempts
select pg_temp.en_tant_que(:'A'); select lancer_tournoi(pg_temp.v('tournoi')::uuid);
select pg_temp.verifier((select x->>'phase' = 'en_cours' and (x->>'nb_tours')::int = 3 and (x->>'tour')::int = 1 and jsonb_array_length(x->'joueurs') = 5
  from voir_tournoi(pg_temp.v('tournoi')::uuid) x), 'tournoi lancé : 5 joueurs, 3 tours');
select pg_temp.verifier((select (x->'joueurs'->0->>'pseudo') = 'Alice' and (x->'joueurs'->2->>'pseudo') = 'Chloé' and (x->'joueurs'->4->>'pseudo') = 'Emma'
  from voir_tournoi(pg_temp.v('tournoi')::uuid) x), 'têtes de série rangées par niveau officiel');
reset role; select pg_temp.verifier((select count(*) = 3 from matchs_tournoi where tournoi_id = pg_temp.v('tournoi')::uuid and fin = 'exempt'), 'les 3 meilleures têtes de série sont exemptées');
select pg_temp.verifier((select count(*) = 1 from matchs_tournoi where tournoi_id = pg_temp.v('tournoi')::uuid and fin is null
  and j0 = :'D' and j1 = :'E'), 'premier tour : Dan (4) contre Emma (5)');
select pg_temp.en_tant_que(:'D');
select pg_temp.interdit(format('select desinscrire_tournoi(%L)', pg_temp.v('tournoi')), 'plus de désinscription après le lancement');
select pg_temp.verifier((select (x->>'a_jouer')::boolean from jsonb_array_elements(mes_tournois()) x), 'Dan a un match à jouer');

-- 4. Dan et Emma jouent leur match
reset role; insert into t select 'm1', pg_temp.match(pg_temp.v('tournoi'), :'D', :'E');
select pg_temp.en_tant_que(:'D');
insert into t select 'd1', (jouer_match_tournoi(pg_temp.v('m1')::uuid)).id;
select pg_temp.verifier((select phase = 'attente' and tournoi_match = pg_temp.v('m1')::uuid and not classe from duels where id = pg_temp.v('d1')::uuid),
  'Dan veut jouer : le duel attend Emma (format court : amical)');
select pg_temp.en_tant_que(:'E');
select pg_temp.interdit(format('select repondre_duel(%L, false)', pg_temp.v('d1')), 'un match de tournoi ne se refuse pas');
select pg_temp.verifier((select (jouer_match_tournoi(pg_temp.v('m1')::uuid)).phase = 'presentation'), 'Emma arrive : le match commence');
select pg_temp.jouer_duel(pg_temp.v('d1')::uuid, :'D', :'E');
reset role; select pg_temp.verifier((select fin = 'score' and vainqueur = :'D' from matchs_tournoi where id = pg_temp.v('m1')::uuid), 'Dan gagne son match');
select pg_temp.verifier((select tour = 2 from tournois where id = pg_temp.v('tournoi')::uuid), 'tour terminé : le tour suivant commence');
select pg_temp.verifier((select count(*) = 2 from matchs_tournoi where tournoi_id = pg_temp.v('tournoi')::uuid and tour = 2
  and ((j0 = :'A' and j1 = :'D') or (j0 = :'B' and j1 = :'C'))), 'demi-finales : Alice contre Dan, Bob contre Chloé');

-- 5. Date limite dépassée
reset role; insert into t select 'm2', pg_temp.match(pg_temp.v('tournoi'), :'B', :'C');
select pg_temp.en_tant_que(:'B');
insert into t select 'd2', (jouer_match_tournoi(pg_temp.v('m2')::uuid)).id;
reset role; update tournois set echeance = now() - interval '1 second' where id = pg_temp.v('tournoi')::uuid;
insert into t select 'm3', pg_temp.match(pg_temp.v('tournoi'), :'A', :'D');
select pg_temp.en_tant_que(:'C'); select voir_tournoi(pg_temp.v('tournoi')::uuid);
reset role; select pg_temp.verifier((select fin = 'forfait' and vainqueur = :'B' from matchs_tournoi where id = pg_temp.v('m2')::uuid), 'seul Bob a essayé de jouer : il passe par forfait');
select pg_temp.verifier((select phase = 'annule' from duels where id = pg_temp.v('d2')::uuid), 'son défi en attente est annulé');
reset role; select pg_temp.verifier((select fin = 'tete_de_serie' and vainqueur = :'A' from matchs_tournoi where id = pg_temp.v('m3')::uuid), 'personne n''a essayé : la meilleure tête de série passe');
select pg_temp.verifier((select tour = 3 and echeance > now() from tournois where id = pg_temp.v('tournoi')::uuid), 'la finale commence, avec une nouvelle date limite');

-- 6. Finale
reset role; insert into t select 'm4', pg_temp.match(pg_temp.v('tournoi'), :'A', :'B');
select pg_temp.en_tant_que(:'A'); insert into t select 'd4', (jouer_match_tournoi(pg_temp.v('m4')::uuid)).id;
select pg_temp.en_tant_que(:'B'); select jouer_match_tournoi(pg_temp.v('m4')::uuid);
select pg_temp.jouer_duel(pg_temp.v('d4')::uuid, :'B', :'A');
reset role; select pg_temp.verifier((select phase = 'termine' and vainqueur = :'B' from tournois where id = pg_temp.v('tournoi')::uuid), 'Bob remporte le tournoi');
select pg_temp.en_tant_que(:'C');
select pg_temp.verifier((select x->>'phase' = 'termine' and x->'vainqueur'->>'pseudo' = 'Bob' from jsonb_array_elements(tournois_cercle(pg_temp.v('cercle')::uuid)) x), 'le palmarès du cercle affiche le vainqueur');
select pg_temp.interdit(format('select jouer_match_tournoi(%L)', pg_temp.v('m4')), 'un match terminé ne se rejoue pas');

-- 7. Tournoi privé par lien, format officiel, et compte supprimé
select pg_temp.en_tant_que(:'F');
insert into t select 'prive', creer_tournoi('Tournoi de Fred', null, 11, 2, 1440)->>'id';
reset role; insert into t select 'code_prive', code from tournois where id = pg_temp.v('prive')::uuid;
select pg_temp.en_tant_que(:'D');
select pg_temp.interdit(format('select voir_tournoi(%L)', pg_temp.v('prive')), 'un tournoi privé est invisible sans le lien');
select rejoindre_tournoi(pg_temp.v('code_prive'));
select pg_temp.en_tant_que(:'E'); select rejoindre_tournoi(pg_temp.v('code_prive'));
select pg_temp.en_tant_que(:'F');
select pg_temp.interdit(format('select annuler_tournoi(%L)', gen_random_uuid()), 'tournoi inconnu');
select lancer_tournoi(pg_temp.v('prive')::uuid);
reset role; insert into t select 'm5', id from matchs_tournoi where tournoi_id = pg_temp.v('prive')::uuid and fin is null;
select pg_temp.en_tant_que(:'D');
select pg_temp.verifier((select classe from jouer_match_tournoi(pg_temp.v('m5')::uuid)), 'format officiel : le match compte pour le niveau officiel');
reset role; delete from auth.users where id = :'E';
select pg_temp.en_tant_que(:'D'); select voir_tournoi(pg_temp.v('prive')::uuid);
reset role; select pg_temp.verifier((select fin = 'exempt' and vainqueur = :'D' from matchs_tournoi where id = pg_temp.v('m5')::uuid), 'adversaire supprimé : Dan passe');
select pg_temp.verifier((select tour = 2 from tournois where id = pg_temp.v('prive')::uuid), 'et le tournoi continue');

-- 8. Limites et visiteurs
select pg_temp.en_tant_que(:'C');
do $$ begin for i in 1..5 loop perform creer_tournoi('Tournoi ' || i, null, 11, 2, 60); end loop; end $$;
select pg_temp.interdit('select creer_tournoi(''Un de trop'', null, 11, 2, 60)', 'au plus 5 tournois actifs par organisateur');
insert into t select 'annule', (select x->>'id' from jsonb_array_elements(mes_tournois()) x where x->>'nom' = 'Tournoi 1');
select annuler_tournoi(pg_temp.v('annule')::uuid);
reset role; select pg_temp.verifier((select phase = 'annule' from tournois where id = pg_temp.v('annule')::uuid), 'l''organisateur annule un tournoi pas encore lancé');
select pg_temp.en_tant_que('');
select pg_temp.interdit('select mes_tournois()', 'les visiteurs ne voient aucun tournoi');
reset role;
\echo 'Tous les tests des tournois sont passés.'
