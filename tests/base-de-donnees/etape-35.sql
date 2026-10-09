-- Tests de supabase/etape-35-championnat.sql : le championnat du cercle (chacun contre tous, classement, enjeu).
\set QUIET on
\echo Tests de la base de données (étape 35 : championnat du cercle)

insert into auth.users values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'a@x.fr'), ('bbbbbbbb-0000-0000-0000-000000000002', 'b@x.fr'),
  ('cccccccc-0000-0000-0000-000000000003', 'c@x.fr'), ('dddddddd-0000-0000-0000-000000000004', 'd@x.fr'),
  ('eeeeeeee-0000-0000-0000-000000000005', 'e@x.fr');
insert into profils (id, pseudo, numero) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Alice', 0), ('bbbbbbbb-0000-0000-0000-000000000002', 'Bob', 0),
  ('cccccccc-0000-0000-0000-000000000003', 'Chloé', 0), ('dddddddd-0000-0000-0000-000000000004', 'Dan', 0),
  ('eeeeeeee-0000-0000-0000-000000000005', 'Emma', 0);

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
create or replace function pg_temp.match(tid text, x text, y text) returns uuid language sql as $$
  select id from matchs_tournoi where tournoi_id = tid::uuid and fin is null and x::uuid in (j0, j1) and y::uuid in (j0, j1) order by position limit 1
$$;
-- Un match du championnat, joué point par point (sets de 1 point) : « G » = point du gagnant, « P » = point du perdant.
create or replace function pg_temp.jouer_match(tid text, gagnant text, perdant text, points text) returns void language plpgsql as $$
declare mid uuid; d uuid; m int; c text;
begin
  execute 'reset role'; mid := pg_temp.match(tid, gagnant, perdant);
  perform pg_temp.en_tant_que(gagnant); d := (jouer_match_tournoi(mid)).id;
  perform pg_temp.en_tant_que(perdant); perform jouer_match_tournoi(mid);
  foreach c in array regexp_split_to_array(points, '') loop
    perform pg_temp.en_tant_que(gagnant); perform pret(d);
    perform pg_temp.en_tant_que(perdant); perform pret(d);
    m := (select manche from duels where id = d);
    perform pg_temp.en_tant_que(gagnant); perform jouer(d, m, case when c = 'G' then 0 else 1 end);
    perform pg_temp.en_tant_que(perdant); perform jouer(d, m, case when c = 'G' then 1 else 0 end);
  end loop;
  execute 'reset role';
end $$;
\set A 'aaaaaaaa-0000-0000-0000-000000000001'
\set B 'bbbbbbbb-0000-0000-0000-000000000002'
\set C 'cccccccc-0000-0000-0000-000000000003'
\set D 'dddddddd-0000-0000-0000-000000000004'
\set E 'eeeeeeee-0000-0000-0000-000000000005'

-- 1. Un cercle (Alice responsable) et la création du championnat
select pg_temp.en_tant_que(:'A');
insert into t select 'cercle', creer_cercle('Famille', '{}')->>'id';
reset role; insert into t select 'code_cercle', code from cercles where id = pg_temp.v('cercle')::uuid;
select pg_temp.en_tant_que(:'B'); select rejoindre_cercle(pg_temp.v('code_cercle'));
select pg_temp.en_tant_que(:'C'); select rejoindre_cercle(pg_temp.v('code_cercle'));
select pg_temp.en_tant_que(:'D'); select rejoindre_cercle(pg_temp.v('code_cercle'));

select pg_temp.en_tant_que(:'A');
select pg_temp.interdit('select creer_championnat(''Ligue'', null, 1, 2, 7)', 'un championnat se joue dans un cercle');
select pg_temp.interdit(format('select creer_championnat(''Ligue'', %L, 1, 2, 5)', pg_temp.v('cercle')), 'durée invalide refusée');
select pg_temp.interdit(format('select creer_championnat(''Ligue'', %L, 1, 2, 7, false, ''Le perdant paie 10 euros'')', pg_temp.v('cercle')), 'pas d''argent dans l''enjeu');
select pg_temp.interdit(format('select creer_championnat(''Ligue'', %L, 1, 2, 7, false, ''ok'')', pg_temp.v('cercle')), 'enjeu trop court refusé');
select pg_temp.en_tant_que(:'E');
select pg_temp.interdit(format('select creer_championnat(''Ligue'', %L, 1, 2, 7)', pg_temp.v('cercle')), 'un non-membre ne crée pas de championnat');
-- N'importe quel membre peut organiser (décision du 9 octobre) : ici Bob, simple membre.
select pg_temp.en_tant_que(:'B');
insert into t select 'essai', creer_championnat('Essai', pg_temp.v('cercle')::uuid, 1, 1, 3, true, 'Le dernier ramène les chocolatines')->>'id';
select pg_temp.verifier((select x->>'mode' = 'championnat' and (x->>'aller_retour')::boolean and x->>'enjeu' = 'Le dernier ramène les chocolatines'
  and (x->>'duree_minutes')::int = 4320 from voir_tournoi(pg_temp.v('essai')::uuid) x), 'un simple membre organise un championnat aller-retour avec enjeu');
select pg_temp.en_tant_que(:'C');
select pg_temp.interdit(format('select effacer_enjeu_tournoi(%L)', pg_temp.v('essai')), 'un autre membre n''efface pas l''enjeu');
select pg_temp.en_tant_que(:'A');
select pg_temp.verifier((select (x->>'efface_enjeu')::boolean from voir_tournoi(pg_temp.v('essai')::uuid) x), 'le responsable du cercle peut effacer l''enjeu');
select effacer_enjeu_tournoi(pg_temp.v('essai')::uuid);
select pg_temp.verifier((select x->>'enjeu' is null from voir_tournoi(pg_temp.v('essai')::uuid) x), 'enjeu effacé par le responsable');
-- Aller-retour : 3 joueurs, 6 matchs (chacun joue 2 fois contre chaque autre).
select inscrire_tournoi(pg_temp.v('essai')::uuid);
select pg_temp.en_tant_que(:'C'); select inscrire_tournoi(pg_temp.v('essai')::uuid);
select pg_temp.en_tant_que(:'A');
select pg_temp.interdit(format('select lancer_tournoi(%L)', pg_temp.v('essai')), 'seul l''organisateur lance le championnat');
select pg_temp.en_tant_que(:'B'); select lancer_tournoi(pg_temp.v('essai')::uuid);
reset role;
select pg_temp.verifier((select count(*) = 6 and count(*) filter (where j0 = :'A' and j1 = :'B') = 1 and count(*) filter (where j0 = :'B' and j1 = :'A') = 1
  from matchs_tournoi where tournoi_id = pg_temp.v('essai')::uuid), 'aller-retour : 6 matchs, dont un aller et un retour par paire');
-- Personne ne joue : à la fin, tous les matchs sont perdus pour les deux, pas de champion.
update tournois set echeance = now() - interval '1 second' where id = pg_temp.v('essai')::uuid;
select pg_temp.en_tant_que(:'C');
select pg_temp.verifier((select x->>'phase' = 'termine' and x->'vainqueur' = 'null'::jsonb
  and (select bool_and((l->>'d')::int = 4 and (l->>'points')::int = 0) from jsonb_array_elements(x->'classement') l)
  from voir_tournoi(pg_temp.v('essai')::uuid) x), 'matchs jamais joués : perdus pour les deux, pas de champion');
reset role;
select pg_temp.verifier((select bool_and(fin = 'double_forfait' and vainqueur is null) from matchs_tournoi where tournoi_id = pg_temp.v('essai')::uuid), 'chaque match : double forfait');

-- 2. Le vrai championnat : aller simple, 2 sets gagnants (sets de 1 point), une semaine
select pg_temp.en_tant_que(:'A');
insert into t select 'ch', creer_championnat('Ligue du dimanche', pg_temp.v('cercle')::uuid, 1, 2, 7, false, '  Le dernier fait   la vaisselle ')->>'id';
select pg_temp.verifier((select x->>'enjeu' = 'Le dernier fait la vaisselle' and (x->>'duree_minutes')::int = 10080 from voir_tournoi(pg_temp.v('ch')::uuid) x), 'enjeu rangé, durée d''une semaine');
select pg_temp.en_tant_que(:'B'); select inscrire_tournoi(pg_temp.v('ch')::uuid);
select pg_temp.en_tant_que(:'C'); select inscrire_tournoi(pg_temp.v('ch')::uuid);
select pg_temp.en_tant_que(:'D'); select inscrire_tournoi(pg_temp.v('ch')::uuid);
select pg_temp.en_tant_que(:'E');
select pg_temp.interdit(format('select inscrire_tournoi(%L)', pg_temp.v('ch')), 'un non-membre ne s''inscrit pas');
select pg_temp.interdit(format('select voir_tournoi(%L)', pg_temp.v('ch')), 'un non-membre ne voit pas le championnat (ni son enjeu)');
select pg_temp.en_tant_que(:'A'); select lancer_tournoi(pg_temp.v('ch')::uuid);
select pg_temp.verifier((select x->>'phase' = 'en_cours' and jsonb_array_length(x->'matchs') = 6 and jsonb_array_length(x->'classement') = 4
  from voir_tournoi(pg_temp.v('ch')::uuid) x), 'lancé : 4 joueurs, 6 matchs, classement à 4 lignes');
select pg_temp.en_tant_que(:'D');
select pg_temp.verifier((select bool_and((x->>'a_jouer')::boolean and not (x->>'elimine')::boolean) from jsonb_array_elements(mes_tournois()) x
  where x->>'id' = pg_temp.v('ch')), 'Dan a des matchs à jouer');

-- Les résultats : Bob bat Alice 2-1, Alice bat Chloé et Dan 2-0, Chloé bat Bob 2-0, Bob bat Dan 2-1.
select pg_temp.jouer_match(pg_temp.v('ch'), :'B', :'A', 'GPG');
select pg_temp.jouer_match(pg_temp.v('ch'), :'A', :'C', 'GG');
select pg_temp.jouer_match(pg_temp.v('ch'), :'A', :'D', 'GG');
select pg_temp.en_tant_que(:'A');
select pg_temp.verifier((select x->>'phase' = 'en_cours' from voir_tournoi(pg_temp.v('ch')::uuid) x), 'une défaite n''élimine pas : le championnat continue');
select pg_temp.verifier((select not (x->>'elimine')::boolean from jsonb_array_elements(mes_tournois()) x where x->>'id' = pg_temp.v('ch')), 'Alice n''est pas « éliminée » après sa défaite');
select pg_temp.jouer_match(pg_temp.v('ch'), :'C', :'B', 'GG');
select pg_temp.jouer_match(pg_temp.v('ch'), :'B', :'D', 'PGG');
-- Chloé contre Dan : seul Dan vient (le duel reste en attente).
reset role; insert into t select 'm_cd', pg_temp.match(pg_temp.v('ch'), :'C', :'D');
select pg_temp.en_tant_que(:'D'); select jouer_match_tournoi(pg_temp.v('m_cd')::uuid);
reset role; insert into t select 'duel_cd', duel_id from matchs_tournoi where id = pg_temp.v('m_cd')::uuid;
select pg_temp.en_tant_que(:'C');
select pg_temp.verifier((select x->>'phase' = 'en_cours' from voir_tournoi(pg_temp.v('ch')::uuid) x), 'avant la fin de la semaine, le match non joué attend');

-- Fin de la semaine
reset role; update tournois set echeance = now() - interval '1 second' where id = pg_temp.v('ch')::uuid;
select pg_temp.en_tant_que(:'C');
select x as ch from voir_tournoi(pg_temp.v('ch')::uuid) x \gset
reset role;
select pg_temp.verifier((select phase = 'annule' from duels where id = pg_temp.v('duel_cd')::uuid), 'le duel en attente est annulé');
select pg_temp.verifier((select fin = 'forfait' and vainqueur = :'D' from matchs_tournoi where duel_id = pg_temp.v('duel_cd')::uuid), 'Dan, seul à avoir essayé, gagne par forfait');
select pg_temp.verifier((:'ch'::jsonb)->>'phase' = 'termine' and (:'ch'::jsonb)->'vainqueur'->>'pseudo' = 'Bob', 'championnat terminé : Bob champion');
-- Alice et Bob : 2 victoires chacun ; Alice a plus de sets (5 contre 4), mais Bob l'a battue : Bob devant.
-- Chloé et Dan : 1 victoire chacun ; Chloé a plus de sets (2 contre 1), mais Dan l'a battue (forfait) : Dan devant.
select pg_temp.verifier((select string_agg(l->'joueur'->>'pseudo', ',' order by (l->>'rang')::int) = 'Bob,Alice,Dan,Chloé'
  from jsonb_array_elements((:'ch'::jsonb)->'classement') l), 'classement : la confrontation directe passe avant les sets');
select pg_temp.verifier((select (l->>'points')::int = 4 and (l->>'v')::int = 2 and (l->>'d')::int = 1 and (l->>'sets')::int = 4 and (l->>'points_gagnes')::int = 4
  from jsonb_array_elements((:'ch'::jsonb)->'classement') l where l->'joueur'->>'pseudo' = 'Bob'), 'Bob : 4 points, 2 V, 1 D, 4 sets gagnés');
select pg_temp.verifier((select (l->>'sets')::int = 5 from jsonb_array_elements((:'ch'::jsonb)->'classement') l where l->'joueur'->>'pseudo' = 'Alice'), 'Alice : 5 sets gagnés');
select pg_temp.verifier((:'ch'::jsonb)->>'enjeu' = 'Le dernier fait la vaisselle', 'l''enjeu reste affiché à la fin');
select pg_temp.en_tant_que(:'B');
select pg_temp.verifier((select (x->>'gagne')::boolean from jsonb_array_elements(mes_tournois()) x where x->>'id' = pg_temp.v('ch')), 'Bob voit qu''il a gagné (trophée « Champion du cercle »)');
select pg_temp.en_tant_que(:'A');
select pg_temp.verifier((select not (x->>'gagne')::boolean from jsonb_array_elements(mes_tournois()) x where x->>'id' = pg_temp.v('ch')), 'Alice n''a pas gagné');

-- 3. Égalité totale (tout le monde à 0 point, aucun set) : l'ordre d'inscription départage en dernier
select pg_temp.verifier((select string_agg(l->'joueur'->>'pseudo', ',' order by (l->>'rang')::int) = 'Bob,Alice,Chloé'
  from jsonb_array_elements((voir_tournoi(pg_temp.v('essai')::uuid))->'classement') l), 'égalité totale : ordre d''inscription');

-- 4. Le tournoi à élimination directe marche toujours (le créateur seul ne peut pas lancer à 1)
insert into t select 'ko', creer_tournoi('Coupe', pg_temp.v('cercle')::uuid, 1, 1, 15)->>'id';
select pg_temp.verifier((select x->>'mode' = 'libre' and x->>'enjeu' is null from voir_tournoi(pg_temp.v('ko')::uuid) x), 'un tournoi classique reste à élimination directe');
select pg_temp.interdit(format('select lancer_tournoi(%L)', pg_temp.v('ko')), 'il faut toujours 3 joueurs');
