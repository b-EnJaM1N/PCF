-- Tests de supabase/etape-74-records-cercle.sql : les records du cercle (qui gagne chaque point, jamais les signes).
\set QUIET on
\echo Tests de la base de données (étape 74 : les records du cercle)

insert into auth.users select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'r' || i || '@x.fr' from generate_series(1, 4) i;
insert into profils (id, pseudo, numero) values
  ('00000000-0000-0000-0000-000000000001', 'Rami', 0), ('00000000-0000-0000-0000-000000000002', 'Rosa', 0),
  ('00000000-0000-0000-0000-000000000003', 'Rudi', 0), ('00000000-0000-0000-0000-000000000004', 'Remi', 0);
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
\set C '00000000-0000-0000-0000-000000000003'
\set D '00000000-0000-0000-0000-000000000004'
\set K 'cccccccc-0000-0000-0000-000000000074'
insert into cercles (id, nom, cree_le) values (:'K', 'Les Records', now() - interval '30 days');
insert into membres_cercle (cercle_id, joueur, role) values (:'K', :'A', 'admin'), (:'K', :'B', 'membre'), (:'K', :'C', 'membre');
insert into tournois (id, nom, cercle_id, points_par_set, sets_gagnants, duree_tour, phase)
values ('dddddddd-0000-0000-0000-000000000074', 'Coupe', :'K', 7, 1, '24 hours', 'termine');
insert into duels (id, j0, j1, points_par_set, sets_gagnants, phase, vainqueur, fin, sets, scores_sets, coups, tournoi_id) values
  ('11111111-0000-0000-0000-000000000074', :'A', :'B', 3, 1, 'termine', 0, 'score', '{1,0}', '[[3,1]]',
   '[{"a":0,"b":1,"g":0},{"a":2,"b":2,"g":null},{"a":0,"b":2,"g":1},{"a":1,"b":2,"g":0,"smash":[true,false]},{"a":2,"b":0,"g":0}]', null),
  ('22222222-0000-0000-0000-000000000074', :'B', :'C', 3, 1, 'termine', 1, 'score', '{0,1}', '[[0,3]]',
   '[{"a":1,"b":0,"g":1},{"a":1,"b":0,"g":1},{"a":1,"b":0,"g":1}]', 'dddddddd-0000-0000-0000-000000000074'),
  ('33333333-0000-0000-0000-000000000074', :'A', :'D', 3, 1, 'termine', 0, 'score', '{1,0}', '[[3,0]]', '[]', null);

select pg_temp.en_tant_que(:'B');
create temp table r as select records_cercle(:'K') as tous, records_cercle(:'K', true) as tournois; grant all on r to public;
select pg_temp.verifier((select jsonb_array_length(tous->'duels') = 2 from r), 'tous les duels entre membres (pas celui contre Remi, qui n''est pas membre)');
select pg_temp.verifier((select jsonb_array_length(tournois->'duels') = 1 from r), 'les tournois du cercle seulement');
select pg_temp.verifier((select tous->'duels'->0->'g' = '[0, null, 1, 0, 0]'::jsonb from r), 'qui gagne chaque point, dans l''ordre');
select pg_temp.verifier((select tous->'duels'->0->'smash'->3 = '[true, false]'::jsonb and tous->'duels'->0->'smash'->0 = '[false, false]'::jsonb from r), 'les smashs, coup par coup');
select pg_temp.verifier((select not (tous::text like '%"a":%') and not (tous::text like '%"b":%') from r), 'jamais les signes d''un joueur');
select pg_temp.verifier((select tous->'signes' = '[6, 5, 5]'::jsonb from r), 'les signes de tout le cercle, en total (Pierre, Ciseaux, Feuille)');
select pg_temp.en_tant_que(:'D');
select pg_temp.interdit($$ select records_cercle('cccccccc-0000-0000-0000-000000000074') $$, 'un non-membre ne voit pas les records');
reset role;
