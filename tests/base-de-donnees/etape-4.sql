-- Tests de supabase/etape-4-classement.sql : niveau officiel, amis et cercles.
\set QUIET on
\echo Tests de la base de données (étape 4 : classement, amis, cercles)

insert into auth.users values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'a@x.fr'), ('bbbbbbbb-0000-0000-0000-000000000002', 'b@x.fr'),
  ('cccccccc-0000-0000-0000-000000000003', 'c@x.fr'), ('dddddddd-0000-0000-0000-000000000004', 'd@x.fr');
insert into profils (id, pseudo, numero) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Alice', 0), ('bbbbbbbb-0000-0000-0000-000000000002', 'Bob', 0),
  ('cccccccc-0000-0000-0000-000000000003', 'Chloé', 0), ('dddddddd-0000-0000-0000-000000000004', 'Dan', 0);

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
-- Un duel complet (sets de 7, 2 sets gagnants) que « gagnant » remporte 2–0.
create or replace function pg_temp.duel_complet(gagnant text, perdant text, classe boolean) returns uuid language plpgsql as $$
declare d uuid; m int;
begin
  perform pg_temp.en_tant_que(gagnant);
  select id into d from lancer_defi(perdant::uuid, 7, 2, classe);
  perform pg_temp.en_tant_que(perdant); perform repondre_duel(d, true); perform pret(d);
  perform pg_temp.en_tant_que(gagnant); perform pret(d);
  loop
    perform pg_temp.en_tant_que(gagnant);
    if (select phase from duels where id = d) = 'entre_sets' then
      perform pret(d); perform pg_temp.en_tant_que(perdant); perform pret(d); perform pg_temp.en_tant_que(gagnant);
    end if;
    exit when (select phase from duels where id = d) = 'termine';
    m := (select manche from duels where id = d);
    perform jouer(d, m, 0);
    perform pg_temp.en_tant_que(perdant); perform jouer(d, m, 1);
  end loop;
  return d;
end $$;
\set A 'aaaaaaaa-0000-0000-0000-000000000001'
\set B 'bbbbbbbb-0000-0000-0000-000000000002'
\set C 'cccccccc-0000-0000-0000-000000000003'
\set D 'dddddddd-0000-0000-0000-000000000004'
create temp table t (cle text primary key, val text);
grant all on t to public;
create or replace function pg_temp.v(k text) returns text language sql as $$ select val from t where cle = k $$;

-- 1. La formule (identique à nouvelElo dans l'application)
reset role;
select pg_temp.verifier(_variation(1200, 1200) = 16, 'à niveau égal : +16 / −16');
select pg_temp.verifier(_variation(1400, 1200) = 8, 'le favori gagne : +8 seulement');
select pg_temp.verifier(_variation(1200, 1400) = 24, 'l''outsider gagne : +24');

-- 2. Amis
select pg_temp.en_tant_que(:'A');
select pg_temp.verifier(demander_ami(:'B') = 'envoyee', 'Alice demande Bob en ami');
select pg_temp.verifier(demander_ami(:'B') = 'envoyee', 'redemander ne crée pas de doublon');
select pg_temp.interdit(format('select demander_ami(%L)', :'A'), 'on ne peut pas être son propre ami');
select pg_temp.interdit('select * from amities', 'la table des amitiés n''est pas lisible directement');
select pg_temp.interdit(format('insert into amities values (%L, %L, %L, ''amis'')', :'A', :'C', :'A'), 'impossible de s''ajouter un ami sans son accord');
select pg_temp.en_tant_que(:'B');
select pg_temp.verifier((select mes_amis()->0->>'pseudo' = 'Alice' and (mes_amis()->0->>'recue')::boolean), 'Bob voit la demande reçue');
select pg_temp.verifier(repondre_ami(:'A', true) = 'amis', 'Bob accepte');
select pg_temp.en_tant_que(:'A');
select pg_temp.verifier((select mes_amis()->0->>'statut' = 'amis'), 'Alice et Bob sont amis');
select pg_temp.en_tant_que(:'C'); select demander_ami(:'A');
select pg_temp.en_tant_que(:'D');
select pg_temp.interdit(format('select repondre_ami(%L, true)', :'C'), 'un tiers ne peut pas accepter à la place d''Alice');
select pg_temp.en_tant_que(:'A');
select pg_temp.verifier(repondre_ami(:'C', false) = 'refusee', 'Alice refuse Chloé');
select pg_temp.verifier(jsonb_array_length(mes_amis()) = 1, 'la demande refusée disparaît');
select pg_temp.en_tant_que(:'D'); select demander_ami(:'A');
select pg_temp.en_tant_que(:'A');
select pg_temp.verifier(demander_ami(:'D') = 'amis', 'demandes croisées : amis directement');
select retirer_ami(:'D');
select pg_temp.verifier(jsonb_array_length(mes_amis()) = 1, 'retirer un ami');

-- 3. Cercles
select pg_temp.en_tant_que(:'A');
insert into t select 'cercle', creer_cercle('Famille', '{"embleme":"lion","fond":"or"}')->>'id';
select pg_temp.interdit('select creer_cercle(''X'', ''{}'')', 'nom trop court refusé');
select pg_temp.interdit('select creer_cercle(''Un nom beaucoup trop long pour un cercle'', ''{}'')', 'nom trop long refusé');
select pg_temp.verifier((select mes_cercles()->'cercles'->0->>'role' = 'admin'), 'le créateur est responsable du cercle');
select pg_temp.interdit('select * from cercles', 'la table des cercles n''est pas lisible directement');
select pg_temp.interdit(format('insert into membres_cercle values (%L, %L)', pg_temp.v('cercle'), :'D'), 'impossible d''ajouter un membre directement');
select inviter_cercle(pg_temp.v('cercle')::uuid, :'B');
select pg_temp.en_tant_que(:'C');
select pg_temp.interdit(format('select inviter_cercle(%L, %L)', pg_temp.v('cercle'), :'D'), 'un non-membre ne peut pas inviter');
select pg_temp.interdit(format('select voir_cercle(%L)', pg_temp.v('cercle')), 'un non-membre ne voit pas le cercle');
select pg_temp.en_tant_que(:'B');
select pg_temp.verifier((select mes_cercles()->'invitations'->0->>'nom' = 'Famille'
  and mes_cercles()->'invitations'->0->'par'->>'pseudo' = 'Alice'), 'Bob voit l''invitation d''Alice');
select repondre_cercle(pg_temp.v('cercle')::uuid, true);
select pg_temp.verifier((select jsonb_array_length(mes_cercles()->'invitations') = 0 and mes_cercles()->'cercles'->0->>'role' = 'membre'), 'Bob a rejoint le cercle');
select pg_temp.interdit(format('select modifier_cercle(%L, ''Piraté'', null)', pg_temp.v('cercle')), 'un simple membre ne peut pas renommer');
select pg_temp.interdit(format('select supprimer_cercle(%L)', pg_temp.v('cercle')), 'un simple membre ne peut pas supprimer');
select pg_temp.interdit(format('select exclure_cercle(%L, %L)', pg_temp.v('cercle'), :'A'), 'un simple membre ne peut pas exclure');
select pg_temp.verifier((select voir_cercle(pg_temp.v('cercle')::uuid)->>'code' is not null), 'un membre voit le lien d''invitation');

-- par lien
reset role; insert into t select 'code', code from cercles where id = pg_temp.v('cercle')::uuid;
select pg_temp.en_tant_que(:'C');
select pg_temp.verifier((select rejoindre_cercle(pg_temp.v('code'))->>'nom' = 'Famille'), 'Chloé rejoint par le lien');
select pg_temp.verifier((select rejoindre_cercle(pg_temp.v('code'))->>'nom' = 'Famille'), 'rejoindre deux fois ne pose pas de problème');
select pg_temp.interdit('select rejoindre_cercle(''inconnu123'')', 'lien inconnu refusé');
select pg_temp.en_tant_que(:'A');
select nouveau_lien_cercle(pg_temp.v('cercle')::uuid);
select pg_temp.en_tant_que(:'D');
select pg_temp.interdit(format('select rejoindre_cercle(%L)', pg_temp.v('code')), 'l''ancien lien ne marche plus après renouvellement');
select pg_temp.en_tant_que(:'A');
select modifier_cercle(pg_temp.v('cercle')::uuid, 'La Famille', '{"embleme":"loup","fond":"court"}');
select pg_temp.verifier((select voir_cercle(pg_temp.v('cercle')::uuid)->>'nom' = 'La Famille'), 'le responsable renomme le cercle');

-- 4. Niveau officiel : un duel officiel
insert into t select 'd1', pg_temp.duel_complet(:'A', :'B', true);
select pg_temp.en_tant_que(:'B');
select pg_temp.verifier((select classement_avant = '{1200,1200}' and classement_apres = '{1216,1184}' and classement_motif is null
  from duels where id = pg_temp.v('d1')::uuid), 'Alice gagne : 1200 → 1216, Bob : 1200 → 1184');
select pg_temp.verifier((select points = 1216 and joues = 1 and gagnes = 1 and meilleur = 1216 from classements where joueur = :'A'), 'classement d''Alice enregistré');
select pg_temp.verifier((select points = 1184 and joues = 1 and gagnes = 0 from classements where joueur = :'B'), 'classement de Bob enregistré');
select pg_temp.interdit(format('update classements set points = 3000 where joueur = %L', :'B'), 'un joueur ne peut pas changer son classement');
select pg_temp.interdit(format('insert into classements (joueur, points) values (%L, 3000)', :'D'), 'un joueur ne peut pas s''inventer un classement');
select pg_temp.interdit(format('select _variation(1200, 1200)'), 'fonction interne interdite aux joueurs');
select pg_temp.verifier((select niveau = 1216 from chercher_joueurs('alice')), 'la recherche affiche le niveau officiel');
select pg_temp.verifier((select (mes_amis()->0->>'classement')::int = 1216), 'la liste d''amis affiche le niveau officiel');

-- 5. Duel amical : ne compte pas
insert into t select 'd2', pg_temp.duel_complet(:'B', :'A', false);
select pg_temp.verifier((select classement_apres is null and classement_motif = 'amical' from duels where id = pg_temp.v('d2')::uuid), 'duel amical : pas de changement');
select pg_temp.verifier((select points = 1216 from classements where joueur = :'A'), 'le classement d''Alice n''a pas bougé');

-- 6. Abandon avant le premier coup : ne compte pas ; abandon en cours de match : compte
select pg_temp.en_tant_que(:'C'); insert into t select 'd3', (lancer_defi(:'D', 11, 2)).id;
select pg_temp.en_tant_que(:'D'); select repondre_duel(pg_temp.v('d3')::uuid, true); select abandonner(pg_temp.v('d3')::uuid);
select pg_temp.verifier((select classement_apres is null and classement_motif = 'non_dispute' from duels where id = pg_temp.v('d3')::uuid), 'abandon sans coup joué : ne compte pas');
select pg_temp.en_tant_que(:'C'); insert into t select 'd4', (lancer_defi(:'D', 11, 2)).id;
select pg_temp.en_tant_que(:'D'); select repondre_duel(pg_temp.v('d4')::uuid, true); select pret(pg_temp.v('d4')::uuid);
select pg_temp.en_tant_que(:'C'); select pret(pg_temp.v('d4')::uuid); select jouer(pg_temp.v('d4')::uuid, 1, 0);
select pg_temp.en_tant_que(:'D'); select jouer(pg_temp.v('d4')::uuid, 1, 2); select abandonner(pg_temp.v('d4')::uuid);
select pg_temp.verifier((select classement_apres = '{1216,1184}' from duels where id = pg_temp.v('d4')::uuid), 'abandon en cours de match : défaite classée');

-- 7. Anti-arrangement : au plus 5 duels officiels par jour entre les deux mêmes joueurs
do $$ begin for i in 1..4 loop perform pg_temp.duel_complet('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', true); end loop; end $$;
insert into t select 'd6', pg_temp.duel_complet(:'B', :'A', true);
select pg_temp.verifier((select classement_apres is null and classement_motif = 'limite' from duels where id = pg_temp.v('d6')::uuid), '6e duel officiel du jour entre Alice et Bob : ne compte pas');
select pg_temp.verifier((select joues = 5 from classements where joueur = :'A'), 'Alice a bien 5 duels officiels');
select pg_temp.verifier((select sum(points) = 4 * 1200 from classements), 'les points gagnés par l''un sont perdus par l''autre');

-- 8. Le classement du cercle
select pg_temp.en_tant_que(:'C');
select pg_temp.verifier((select voir_cercle(pg_temp.v('cercle')::uuid)->'membres'->0->>'pseudo' = 'Bob'), 'le cercle est rangé par niveau officiel');
select pg_temp.verifier((select (voir_cercle(pg_temp.v('cercle')::uuid)->>'matchs')::int = 7), 'duels joués entre membres depuis la création du cercle');
select pg_temp.verifier((select (x->>'v')::int = 6 and (x->>'d')::int = 1 from jsonb_array_elements(voir_cercle(pg_temp.v('cercle')::uuid)->'membres') x where x->>'pseudo' = 'Bob'), 'victoires et défaites de Bob dans le cercle');
select pg_temp.en_tant_que(:'A');
select pg_temp.verifier((select (mes_cercles()->'cercles'->0->>'rang')::int = 3 and (mes_cercles()->'cercles'->0->>'membres')::int = 3), 'mon rang dans le cercle');

-- 9. Départs : le cercle garde toujours un responsable
select quitter_cercle(pg_temp.v('cercle')::uuid);
select pg_temp.en_tant_que(:'B');
select pg_temp.verifier((select voir_cercle(pg_temp.v('cercle')::uuid)->>'role' = 'admin'), 'le responsable part : le plus ancien membre le remplace');
select exclure_cercle(pg_temp.v('cercle')::uuid, :'C');
select pg_temp.verifier((select jsonb_array_length(voir_cercle(pg_temp.v('cercle')::uuid)->'membres') = 1), 'le responsable retire un membre');
select nommer_responsable(pg_temp.v('cercle')::uuid, :'B');
select quitter_cercle(pg_temp.v('cercle')::uuid);
reset role;
select pg_temp.verifier((select count(*) = 0 from cercles where id = pg_temp.v('cercle')::uuid), 'le dernier membre part : le cercle disparaît');
select pg_temp.en_tant_que(:'C');
insert into t select 'cercle2', creer_cercle('Bureau', '{}')->>'id';
select inviter_cercle(pg_temp.v('cercle2')::uuid, :'D');
select nommer_responsable(pg_temp.v('cercle2')::uuid, :'C');
select pg_temp.en_tant_que(:'D'); select repondre_cercle(pg_temp.v('cercle2')::uuid, true);
reset role; delete from auth.users where id = :'C';
select pg_temp.en_tant_que(:'D');
select pg_temp.verifier((select voir_cercle(pg_temp.v('cercle2')::uuid)->>'role' = 'admin'), 'le responsable supprime son compte : le cercle continue');
select supprimer_cercle(pg_temp.v('cercle2')::uuid);
select pg_temp.verifier((select jsonb_array_length(mes_cercles()->'cercles') = 0), 'le responsable supprime le cercle');

-- 10. Visiteurs
select pg_temp.en_tant_que('');
select pg_temp.interdit('select mes_amis()', 'les visiteurs n''ont pas d''amis');
select pg_temp.interdit('select mes_cercles()', 'les visiteurs ne voient aucun cercle');
select pg_temp.interdit('select count(*) from classements', 'les visiteurs ne voient pas les classements');
reset role;
\echo 'Tous les tests du classement, des amis et des cercles sont passés.'
