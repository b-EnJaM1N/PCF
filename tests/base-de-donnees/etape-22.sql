-- Tests de supabase/etape-22-messages-rapides.sql : un message avant, un après, le chambrage seulement entre amis.
\set QUIET on
\echo Tests de la base de données (étape 22 : messages rapides)

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
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 11, 2, false, 'presentation');
insert into t select id from duels;

do $$
declare d uuid := (select id from t); x public.duels;
begin
  perform pg_temp.en_tant_que('00000000-0000-0000-0000-000000000001');
  x := envoyer_message(d, 'bonne_chance');
  perform pg_temp.verifier(x.message_avant0 = 'bonne_chance' and x.message_avant1 is null, 'le joueur 1 souhaite bonne chance');
  x := envoyer_message(d, 'bon_match');
  perform pg_temp.verifier(x.message_avant0 = 'bonne_chance', 'un seul message avant le match');
  perform pg_temp.interdit(format('select envoyer_message(%L, ''n_importe_quoi'')', d), 'message inconnu refusé');
  perform pg_temp.interdit(format('select envoyer_message(%L, ''gg'')', d), 'pas de message d''après-match avant le match');

  perform pg_temp.en_tant_que('00000000-0000-0000-0000-000000000002');
  perform pg_temp.interdit(format('select envoyer_message(%L, ''fumer'')', d), 'pas de chambrage entre inconnus');
  execute 'reset role';
  insert into amities (a, b, demandeur, statut) values ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'amis');
  perform pg_temp.en_tant_que('00000000-0000-0000-0000-000000000002');
  x := envoyer_message(d, 'fumer');
  perform pg_temp.verifier(x.message_avant1 = 'fumer' and x.message_avant0 = 'bonne_chance', 'entre amis, le chambrage passe');

  perform pg_temp.en_tant_que('00000000-0000-0000-0000-000000000003');
  perform pg_temp.interdit(format('select envoyer_message(%L, ''bonne_chance'')', d), 'un spectateur n''envoie rien');
  perform pg_temp.en_tant_que('');
  perform pg_temp.interdit(format('select envoyer_message(%L, ''bonne_chance'')', d), 'visiteur refusé');

  execute 'reset role';
  update duels set phase = 'jeu' where id = d;
  perform pg_temp.en_tant_que('00000000-0000-0000-0000-000000000001');
  perform pg_temp.interdit(format('select envoyer_message(%L, ''bravo'')', d), 'pas de message pendant le match');

  execute 'reset role';
  update duels set phase = 'termine', vainqueur = 0, fin = 'score' where id = d;
  perform pg_temp.en_tant_que('00000000-0000-0000-0000-000000000001');
  perform pg_temp.interdit(format('select envoyer_message(%L, ''bravo_victoire'')', d), 'le vainqueur n''a pas les messages du vaincu');
  x := envoyer_message(d, 'deculottee');
  perform pg_temp.verifier(x.message_apres0 = 'deculottee', 'le vainqueur chambre son ami');
  perform pg_temp.en_tant_que('00000000-0000-0000-0000-000000000002');
  perform pg_temp.interdit(format('select envoyer_message(%L, ''gg'')', d), 'le vaincu n''a pas les messages du vainqueur');
  x := envoyer_message(d, 'faux_rebond');
  perform pg_temp.verifier(x.message_apres1 = 'faux_rebond' and x.message_apres0 = 'deculottee', 'le vaincu répond, et voit le message du vainqueur');
  x := envoyer_message(d, 'bravo');
  perform pg_temp.verifier(x.message_apres1 = 'faux_rebond', 'un seul message après le match');
  execute 'reset role';
end $$;
