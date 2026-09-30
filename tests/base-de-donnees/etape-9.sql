-- Tests de supabase/etape-9-poignee.sql : chacun choisit sa poignée de main, une fois, après un match terminé.
\set QUIET on
\echo Tests de la base de données (étape 9 : poignée de main)

insert into auth.users select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'j' || i || '@x.fr' from generate_series(1, 3) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'Joueur' || i, 0 from generate_series(1, 3) i;

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

create temp table t (id uuid);
grant all on t to public;
insert into duels (j0, j1, points_par_set, sets_gagnants, classe, phase) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 11, 2, false, 'jeu');
insert into t select id from duels;

do $$
declare d uuid := (select id from t); x public.duels;
begin
  perform pg_temp.en_tant_que('00000000-0000-0000-0000-000000000001');
  perform pg_temp.interdit(format('select serrer_la_main(%L, ''franche'')', d), 'pas de poignée de main pendant le match');
  execute 'reset role';
  update duels set phase = 'termine', vainqueur = 0, fin = 'score' where id = d;

  perform pg_temp.en_tant_que('00000000-0000-0000-0000-000000000001');
  x := serrer_la_main(d, 'franche');
  perform pg_temp.verifier(x.poignee0 = 'franche' and x.poignee1 is null, 'le joueur 1 serre franchement');
  x := serrer_la_main(d, 'froide');
  perform pg_temp.verifier(x.poignee0 = 'franche', 'on ne change pas d''avis');
  perform pg_temp.interdit(format('select serrer_la_main(%L, ''molle'')', d), 'style inconnu refusé');
  perform pg_temp.en_tant_que('00000000-0000-0000-0000-000000000002');
  x := serrer_la_main(d, 'froide');
  perform pg_temp.verifier(x.poignee0 = 'franche' and x.poignee1 = 'froide', 'le joueur 2 serre froidement, et voit le choix du joueur 1');
  perform pg_temp.en_tant_que('00000000-0000-0000-0000-000000000003');
  perform pg_temp.interdit(format('select serrer_la_main(%L, ''franche'')', d), 'un spectateur ne serre pas la main');
  perform pg_temp.en_tant_que('');
  perform pg_temp.interdit(format('select serrer_la_main(%L, ''franche'')', d), 'visiteur refusé');
  execute 'reset role';
end $$;
