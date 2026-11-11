-- Tests de supabase/etape-65-fil-du-cercle.sql : le fil d'actualité du cercle (résultats, Une publiée, réactions, arrivées).
\set QUIET on
\echo Tests de la base de données (étape 65 : le fil du cercle)

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
\set A 'aaaaaaaa-0000-0000-0000-000000000001'
\set B 'bbbbbbbb-0000-0000-0000-000000000002'
\set C 'cccccccc-0000-0000-0000-000000000003'
\set D 'dddddddd-0000-0000-0000-000000000004'
create temp table t (cle text primary key, val text);
grant all on t to public;
create or replace function pg_temp.v(k text) returns text language sql as $$ select val from t where cle = k $$;

-- Un cercle : Alice (responsable), Bob et Chloé ; Dan n'en fait pas partie.
reset role;
insert into cercles (id, nom, cree_le) values ('eeeeeeee-0000-0000-0000-000000000005', 'Les Testeurs', now() - interval '10 days');
insert into membres_cercle (cercle_id, joueur, role, rejoint_le) values
  ('eeeeeeee-0000-0000-0000-000000000005', :'A', 'admin', now() - interval '10 days'),
  ('eeeeeeee-0000-0000-0000-000000000005', :'B', 'membre', now() - interval '2 days'),
  ('eeeeeeee-0000-0000-0000-000000000005', :'C', 'membre', now() - interval '90 days');
\set K 'eeeeeeee-0000-0000-0000-000000000005'
-- Des duels terminés : Alice bat Bob (au bout), Bob bat Chloé (abandon), Alice bat Dan (hors du cercle), un duel en cours.
insert into duels (id, j0, j1, points_par_set, sets_gagnants, phase, vainqueur, fin, sets, scores_sets, coups, enjeu) values
  ('11111111-0000-0000-0000-000000000001', :'A', :'B', 7, 2, 'termine', 0, 'score', '{2,0}', '[[7,5],[7,4]]', '[{"a":0,"b":1,"g":0}]', 'Le perdant paie le café'),
  ('11111111-0000-0000-0000-000000000002', :'B', :'C', 7, 2, 'termine', 0, 'abandon', '{1,0}', '[[7,3]]', '[]', null),
  ('11111111-0000-0000-0000-000000000003', :'A', :'D', 7, 2, 'termine', 0, 'score', '{2,0}', '[[7,0],[7,0]]', '[]', null),
  ('11111111-0000-0000-0000-000000000004', :'A', :'C', 7, 2, 'jeu', null, null, '{0,0}', '[]', '[]', null);

-- 1. Le fil, vu par un membre
select pg_temp.en_tant_que(:'B');
insert into t select 'fil', fil_cercle(:'K')::text;
select pg_temp.verifier(jsonb_array_length(pg_temp.v('fil')::jsonb->'duels') = 2, 'deux duels entre membres, terminés (pas celui contre Dan, pas celui en cours)');
select pg_temp.verifier((pg_temp.v('fil')::jsonb->'duels'->0->'une') = 'null'::jsonb, 'pas de Une publiée : ni les coups ni l''enjeu');
select pg_temp.verifier(jsonb_array_length(pg_temp.v('fil')::jsonb->'arrivees') = 2, 'les arrivées des 60 derniers jours (pas Chloé, arrivée il y a 90 jours)');
select pg_temp.en_tant_que(:'D');
select pg_temp.interdit($$ select fil_cercle('eeeeeeee-0000-0000-0000-000000000005') $$, 'un non-membre ne voit pas le fil');
select pg_temp.en_tant_que('');
select pg_temp.interdit($$ select fil_cercle('eeeeeeee-0000-0000-0000-000000000005') $$, 'sans compte : refusé');

-- 2. Publier la Une
select pg_temp.en_tant_que(:'B');
select pg_temp.verifier(publier_une('11111111-0000-0000-0000-000000000001', 42, 'commentatrice_fin_01') = '{"publiee": true, "cercles": 1}', 'Bob publie la Une de son duel contre Alice (1 cercle en commun)');
select pg_temp.en_tant_que(:'A');
select pg_temp.verifier(not (publier_une('11111111-0000-0000-0000-000000000001', 7, null)->>'publiee')::boolean, 'une seule Une par duel : celle d''Alice ne remplace pas celle de Bob');
select pg_temp.en_tant_que(:'C');
select pg_temp.interdit($$ select publier_une('11111111-0000-0000-0000-000000000001', 1, null) $$, 'on ne publie pas la Une du duel des autres');
select pg_temp.en_tant_que(:'B');
select pg_temp.interdit($$ select publier_une('11111111-0000-0000-0000-000000000002', 1, null) $$, 'pas de Une pour un match abandonné');
reset role;
select pg_temp.verifier((select par = 1 and graine = 42 from unes_publiees where duel_id = '11111111-0000-0000-0000-000000000001'), 'racontée du côté de Bob (joueur 1), avec sa graine');
select pg_temp.en_tant_que(:'C');
select pg_temp.interdit($$ select publier_une('11111111-0000-0000-0000-000000000004', 1, null) $$, 'pas de Une pour un duel en cours');
select pg_temp.en_tant_que(:'B');
select pg_temp.verifier(not (publier_une('11111111-0000-0000-0000-000000000001', 1, 'Un texte <b>libre</b>')->>'publiee')::boolean, '(déjà publiée)');
reset role;
delete from unes_publiees where duel_id = '11111111-0000-0000-0000-000000000001';
select pg_temp.en_tant_que(:'A');
select publier_une('11111111-0000-0000-0000-000000000001', 3, 'Un texte <b>libre</b> !');
reset role;
select pg_temp.verifier((select citation is null and par = 0 from unes_publiees where duel_id = '11111111-0000-0000-0000-000000000001'), 'jamais de texte libre : une citation qui n''est pas un identifiant est ignorée');
select pg_temp.en_tant_que(:'C');
delete from t where cle = 'fil'; insert into t select 'fil', fil_cercle(:'K')::text;
select pg_temp.verifier((select d->'une'->>'enjeu' = 'Le perdant paie le café' and jsonb_array_length(d->'une'->'coups') = 1
  from jsonb_array_elements(pg_temp.v('fil')::jsonb->'duels') d where d->>'id' = '11111111-0000-0000-0000-000000000001'), 'Une publiée : les coups et l''enjeu pour la redessiner');

-- 3. Les réactions
select pg_temp.en_tant_que(:'C');
select reagir_fil(:'K', '11111111-0000-0000-0000-000000000001', 'feu');
select pg_temp.en_tant_que(:'B');
select reagir_fil(:'K', '11111111-0000-0000-0000-000000000001', 'feu');
select reagir_fil(:'K', '11111111-0000-0000-0000-000000000001', 'rire');
delete from t where cle = 'fil'; insert into t select 'fil', fil_cercle(:'K')::text;
select pg_temp.verifier((select d->'reactions' = '{"feu": 1, "rire": 1}'::jsonb and d->>'ma_reaction' = 'rire'
  from jsonb_array_elements(pg_temp.v('fil')::jsonb->'duels') d where d->>'id' = '11111111-0000-0000-0000-000000000001'), 'une réaction par joueur (changer la remplace), et la mienne');
select reagir_fil(:'K', '11111111-0000-0000-0000-000000000001', 'rire');
reset role;
select pg_temp.verifier((select count(*) = 1 from reactions_fil), 'la même réaction une 2e fois la retire');
select pg_temp.en_tant_que(:'B');
select pg_temp.interdit($$ select reagir_fil('eeeeeeee-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000003', 'feu') $$, 'pas de réaction sur un duel hors du cercle');
select pg_temp.interdit($$ select reagir_fil('eeeeeeee-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000001', 'coeur') $$, 'seulement les 4 réactions prévues');
select pg_temp.en_tant_que(:'D');
select pg_temp.interdit($$ select reagir_fil('eeeeeeee-0000-0000-0000-000000000005', '11111111-0000-0000-0000-000000000001', 'feu') $$, 'un non-membre ne réagit pas');
select pg_temp.interdit($$ select * from unes_publiees $$, 'les tables ne se lisent pas directement');
select pg_temp.interdit($$ insert into reactions_fil values ('11111111-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000004', 'feu') $$, 'ni ne s''écrivent directement');
reset role;
