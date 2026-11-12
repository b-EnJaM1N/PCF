-- Tests de supabase/etape-71-dossard.sql : le Dossard 1, au vainqueur du dernier tournoi du cercle (au moins 3 vrais joueurs).
\set QUIET on
\echo Tests de la base de données (étape 71 : le Dossard 1)

insert into auth.users select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'j' || i || '@x.fr' from generate_series(1, 6) i;
insert into profils (id, pseudo, numero) values
  ('00000000-0000-0000-0000-000000000001', 'Ana', 0), ('00000000-0000-0000-0000-000000000002', 'Bruno', 0),
  ('00000000-0000-0000-0000-000000000003', 'Clara', 0), ('00000000-0000-0000-0000-000000000004', 'Dino', 0),
  ('00000000-0000-0000-0000-000000000005', 'Rocco', 0), ('00000000-0000-0000-0000-000000000006', 'Eve', 0);
insert into bots_en_ligne (joueur, modele, favori, elo) values ('00000000-0000-0000-0000-000000000005', 'rocky', 0, 900);
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
\set A '00000000-0000-0000-0000-000000000001'
\set B '00000000-0000-0000-0000-000000000002'
\set E '00000000-0000-0000-0000-000000000006'
\set K 'cccccccc-0000-0000-0000-000000000001'

-- Un cercle : Alice, Bob, Chloé, Dan (et le bot inscrit aux tournois) ; Eve n'en fait pas partie.
insert into cercles (id, nom) values (:'K', 'Le Club');
insert into membres_cercle (cercle_id, joueur, role) select :'K', ('00000000-0000-0000-0000-00000000000' || i)::uuid, case when i = 1 then 'admin' else 'membre' end from generate_series(1, 4) i;
create or replace function pg_temp.tournoi(id text, vainqueur text, fini interval, joueurs int[], mode text default 'libre') returns void language plpgsql as $$
begin
  insert into tournois (id, nom, cercle_id, points_par_set, sets_gagnants, duree_tour, phase, vainqueur, fini_le, mode)
  values (id::uuid, 'Tournoi ' || right(id, 1), 'cccccccc-0000-0000-0000-000000000001', 7, 1, '24 hours', 'termine', vainqueur::uuid, now() - fini, mode);
  insert into inscrits_tournoi (tournoi_id, joueur) select id::uuid, ('00000000-0000-0000-0000-00000000000' || j)::uuid from unnest(joueurs) j;
end $$;

-- 1. Pas encore de tournoi : personne.
select pg_temp.en_tant_que(:'A');
select pg_temp.verifier((dossard_du_cercle(:'K')->'tenant') = 'null'::jsonb, 'pas de tournoi terminé : pas de tenant du titre');
select pg_temp.verifier(mes_dossards() = '[]'::jsonb, 'Alice n''a pas de titre');
-- 2. Alice gagne une coupe à 3 vrais joueurs : elle prend le Dossard 1.
reset role; select pg_temp.tournoi('dddddddd-0000-0000-0000-000000000001', :'A', '5 days', array[1, 2, 3]);
select pg_temp.en_tant_que(:'A');
select pg_temp.verifier(jsonb_array_length(mes_dossards()) = 1 and mes_dossards()->0->'cercle'->>'nom' = 'Le Club', 'Alice tient le titre du cercle');
-- 3. Bob gagne un tournoi à 2 vrais joueurs (et un bot) : il ne compte pas.
reset role; select pg_temp.tournoi('dddddddd-0000-0000-0000-000000000002', :'B', '4 days', array[2, 4, 5]);
select pg_temp.en_tant_que(:'B');
select pg_temp.verifier(mes_dossards() = '[]'::jsonb, 'moins de 3 vrais joueurs (le bot ne compte pas) : pas de Dossard');
-- 4. Bob gagne un championnat à 4 vrais joueurs : le titre passe d'Alice à Bob.
reset role; select pg_temp.tournoi('dddddddd-0000-0000-0000-000000000003', :'B', '2 days', array[1, 2, 3, 4], 'championnat');
select pg_temp.verifier(jsonb_array_length(mes_dossards()) = 1, 'Bob prend le Dossard 1');
select pg_temp.en_tant_que(:'A');
select pg_temp.verifier(mes_dossards() = '[]'::jsonb, 'Alice le perd');
create temp table d as select dossard_du_cercle(:'K') as v; grant all on d to public;
select pg_temp.verifier((select v->'tenant'->>'pseudo' = 'Bruno' from d), 'le cercle voit Bob tenant du titre');
select pg_temp.verifier((select jsonb_array_length(v->'passages') = 2 and v->'passages'->0->>'avant' = :'A' and v->'passages'->1->'avant' = 'null'::jsonb from d),
  'les passages : Alice → Bob (le tournoi à 2 vrais joueurs n''y est pas)');
-- 5. Bob quitte le cercle : il n'a plus le droit de porter le Dossard pour ce cercle.
reset role; delete from membres_cercle where cercle_id = :'K' and joueur = :'B';
select pg_temp.en_tant_que(:'B');
select pg_temp.verifier(mes_dossards() = '[]'::jsonb, 'hors du cercle : pas de Dossard');
-- 6. Les autres n'y ont pas accès.
select pg_temp.en_tant_que(:'E');
select pg_temp.interdit($$ select dossard_du_cercle('cccccccc-0000-0000-0000-000000000001') $$, 'un non-membre ne voit pas le Dossard du cercle');
select pg_temp.interdit($$ select * from _tournois_dossard('cccccccc-0000-0000-0000-000000000001') $$, 'la fonction interne n''est pas ouverte');
select pg_temp.en_tant_que('');
select pg_temp.interdit($$ select mes_dossards() $$, 'sans compte : refusé');
reset role;
