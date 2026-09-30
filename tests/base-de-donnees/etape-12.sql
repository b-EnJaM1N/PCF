-- Tests de supabase/etape-12-test-notification.sql : la notification de test.
\set QUIET on
\echo Tests de la base de données (étape 12 : notification de test)

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

do $$
declare n bigint; e jsonb;
begin
  perform pg_temp.en_tant_que('00000000-0000-0000-0000-000000000001');
  perform pg_temp.interdit('select tester_notification()', 'pas de test sans appareil abonné');
  perform enregistrer_abonnement_push('https://push.exemple/1', 'c', 's');
  n := tester_notification();
  e := etat_notification(n);
  perform pg_temp.verifier(e->>'partie' = 'false', 'le test est inscrit, pas encore parti');
  perform pg_temp.interdit('select tester_notification()', 'un seul test à la fois');
  -- La fonction « notifier » (ici simulée) le traite et note le résultat.
  execute 'reset role';
  update notifications set envoye_le = now(), resultat = '1 appareil sur 1' where id = n;
  perform pg_temp.en_tant_que('00000000-0000-0000-0000-000000000001');
  e := etat_notification(n);
  perform pg_temp.verifier(e->>'partie' = 'true' and e->>'resultat' = '1 appareil sur 1', 'le résultat est lisible par le joueur');
  perform pg_temp.en_tant_que('00000000-0000-0000-0000-000000000002');
  perform pg_temp.verifier(etat_notification(n) is null, 'mais pas par un autre joueur');
  execute 'reset role';
end $$;
