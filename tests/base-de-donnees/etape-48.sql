-- Tests de supabase/etape-48-message-ecrit.sql : le message écrit, seulement entre amis, avec les garde-fous.
\set QUIET on
\echo Tests de la base de données (étape 48 : message écrit entre amis)

insert into auth.users select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'j' || i || '@x.fr' from generate_series(1, 2) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'Joueur' || i, 0 from generate_series(1, 2) i;

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
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 11, 2, false, 'presentation');
insert into t select id from duels;

do $$
declare d uuid := (select id from t); x public.duels;
begin
  perform pg_temp.en_tant_que('00000000-0000-0000-0000-000000000001');
  perform pg_temp.interdit(format('select envoyer_message(%L, ''libre:Salut toi'')', d), 'pas de message écrit entre inconnus');
  execute 'reset role';
  insert into amities (a, b, demandeur, statut) values ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'amis');
  perform pg_temp.en_tant_que('00000000-0000-0000-0000-000000000001');
  perform pg_temp.interdit(format('select envoyer_message(%L, ''libre:espèce de connard'')', d), 'gros mot refusé');
  perform pg_temp.interdit(format('select envoyer_message(%L, ''libre:je te dois 10 euros'')', d), 'pas d''argent');
  perform pg_temp.interdit(format('select envoyer_message(%L, ''libre:va sur www.exemple.com'')', d), 'pas de lien');
  perform pg_temp.interdit(format('select envoyer_message(%L, %L)', d, 'libre:' || repeat('a', 61)), 'trop long');
  x := envoyer_message(d, 'libre:  Rendez-vous   dimanche ! ');
  perform pg_temp.verifier(x.message_avant0 = 'libre:Rendez-vous dimanche !', 'entre amis, le message écrit passe (rangé)');
  perform pg_temp.en_tant_que('00000000-0000-0000-0000-000000000002');
  x := envoyer_message(d, 'fumer');
  perform pg_temp.verifier(x.message_avant1 = 'fumer', 'les phrases toutes faites marchent toujours');
end $$;
