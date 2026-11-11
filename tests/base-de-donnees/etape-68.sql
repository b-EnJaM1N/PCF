-- Tests de supabase/etape-68-fiche-joueur.sql : la fiche d'un joueur (stats, face-à-face, historique), sans les bots.
\set QUIET on
\echo Tests de la base de données (étape 68 : la fiche joueur)

insert into auth.users values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'a@x.fr'), ('bbbbbbbb-0000-0000-0000-000000000002', 'b@x.fr'),
  ('cccccccc-0000-0000-0000-000000000003', 'c@x.fr'), ('dddddddd-0000-0000-0000-000000000004', 'd@x.fr');
insert into profils (id, pseudo, numero) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Alice', 0), ('bbbbbbbb-0000-0000-0000-000000000002', 'Bob', 0),
  ('cccccccc-0000-0000-0000-000000000003', 'Chloé', 0), ('dddddddd-0000-0000-0000-000000000004', 'Robot', 0);
insert into bots_en_ligne (joueur, modele, favori, elo) values ('dddddddd-0000-0000-0000-000000000004', 'test', 0, 1200);

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
\set C 'cccccccc-0000-0000-0000-000000000003'
\set R 'dddddddd-0000-0000-0000-000000000004'
create temp table t (cle text primary key, val text);
grant all on t to public;
create or replace function pg_temp.v(k text) returns text language sql as $$ select val from t where cle = k $$;

-- Les duels d'Alice : elle bat Bob (avec un smash réussi), perd contre Chloé, bat Chloé, bat Bob (amical) ; un duel contre un bot ;
-- un duel en cours.
reset role;
insert into duels (j0, j1, points_par_set, sets_gagnants, phase, vainqueur, fin, sets, scores_sets, coups, classe, maj_le) values
  (:'A', :'B', 7, 2, 'termine', 0, 'score', '{2,0}', '[[7,5],[7,4]]', '[{"a":0,"b":1,"g":0,"smash":[true,false]},{"a":1,"b":1,"g":null,"smash":[true,false]}]', true, now() - interval '4 days'),
  (:'C', :'A', 7, 2, 'termine', 0, 'score', '{2,1}', '[[7,5],[4,7],[7,6]]', '[]', true, now() - interval '3 days'),
  (:'A', :'C', 7, 2, 'termine', 0, 'score', '{2,0}', '[[7,1],[7,2]]', '[]', true, now() - interval '2 days'),
  (:'B', :'A', 7, 1, 'termine', 1, 'abandon', '{0,1}', '[[3,7]]', '[]', false, now() - interval '1 day'),
  (:'A', :'R', 7, 2, 'termine', 0, 'score', '{2,0}', '[[7,0],[7,0]]', '[]', true, now()),
  (:'A', :'B', 7, 2, 'jeu', null, null, '{0,0}', '[]', '[]', true, now());

select pg_temp.en_tant_que(:'B');
insert into t select 'f', fiche_joueur(:'A')::text;
select pg_temp.verifier((pg_temp.v('f')::jsonb->'stats') @> '{"joues": 4, "v": 3, "d": 1, "officiels": 3, "officiels_v": 2, "serie": 2, "meilleure_serie": 2}',
  'les stats d''Alice : 4 duels entre joueurs (pas le bot, pas le duel en cours), 3 victoires, série en cours 2');
select pg_temp.verifier((pg_temp.v('f')::jsonb->'stats') @> '{"sets_g": 6, "sets_p": 2, "smashs": 2, "smashs_reussis": 1}', 'sets et smashs, de son côté');
select pg_temp.verifier((select string_agg(x->'adversaire'->>'pseudo' || ' ' || (x->>'v') || '-' || (x->>'d'), ', ') from jsonb_array_elements(pg_temp.v('f')::jsonb->'face_a_face') x)
  = 'Bob 2-0, Chloé 1-1', 'ses face-à-face, les plus fréquents d''abord');
select pg_temp.verifier((pg_temp.v('f')::jsonb->'historique'->0->'adversaire'->>'pseudo') = 'Bob' and (pg_temp.v('f')::jsonb->'historique'->0->>'gagne')::boolean
  and (pg_temp.v('f')::jsonb->'historique'->0->'scores') = '[[7, 3]]' and jsonb_array_length(pg_temp.v('f')::jsonb->'historique') = 4,
  'son historique, le plus récent d''abord, le score de son côté');

-- Cacher son historique
select pg_temp.en_tant_que(:'A');
select regler_historique(true);
select pg_temp.verifier(mon_historique_cache(), 'Alice cache son historique');
select pg_temp.verifier((fiche_joueur(:'A')->'historique') is not null, 'elle voit toujours le sien');
select pg_temp.en_tant_que(:'C');
delete from t; insert into t select 'f', fiche_joueur(:'A')::text;
select pg_temp.verifier((pg_temp.v('f')::jsonb->>'cache')::boolean and pg_temp.v('f')::jsonb->'face_a_face' = 'null' and pg_temp.v('f')::jsonb->'historique' = 'null'
  and (pg_temp.v('f')::jsonb->'stats'->>'joues')::int = 4, 'les autres : ses stats chiffrées, mais ni face-à-face ni historique');
select pg_temp.en_tant_que(:'A');
select regler_historique(false);
select pg_temp.verifier(not mon_historique_cache(), 'elle le montre de nouveau');
select pg_temp.en_tant_que('');
select pg_temp.interdit($$ select fiche_joueur('aaaaaaaa-0000-0000-0000-000000000001') $$, 'sans compte : refusé');
select pg_temp.en_tant_que(:'B');
select pg_temp.interdit($$ select * from historiques_caches $$, 'la liste des historiques cachés ne se lit pas');
reset role;
