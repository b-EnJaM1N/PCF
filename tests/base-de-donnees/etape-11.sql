-- Tests de supabase/etape-11-notifications.sql : abonnements, événements inscrits une seule fois.
\set QUIET on
\echo Tests de la base de données (étape 11 : notifications)

insert into auth.users select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'j' || i || '@x.fr' from generate_series(1, 3) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'Joueur' || i, 0 from generate_series(1, 3) i;

create or replace function pg_temp.j(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-00000000000' || i)::uuid $$;
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
create or replace function pg_temp.nb(e text, qui int) returns int language sql as $$
  select count(*)::int from notifications where evenement = e and joueur = pg_temp.j(qui) $$;

do $$
declare d public.duels;
begin
  -- 1. S'abonner (et se désabonner).
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  perform enregistrer_abonnement_push('https://push.exemple/abc', 'cle', 'secret');
  perform enregistrer_abonnement_push('https://push.exemple/abc', 'cle2', 'secret2');
  execute 'reset role';
  perform pg_temp.verifier((select count(*) from abonnements_push where joueur = pg_temp.j(2)) = 1 and (select p256dh from abonnements_push) = 'cle2', 'un appareil, mis à jour');
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  for i in 1..6 loop perform enregistrer_abonnement_push('https://push.exemple/' || i, 'c', 's'); end loop;
  execute 'reset role';
  perform pg_temp.verifier((select count(*) from abonnements_push where joueur = pg_temp.j(2)) = 5, '5 appareils au plus');
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  perform pg_temp.interdit('select * from abonnements_push', 'les abonnements ne sont pas lisibles');
  perform pg_temp.interdit('select * from config_push', 'les clés d''envoi non plus');
  perform pg_temp.interdit('select * from notifications', 'ni les notifications');
  perform pg_temp.interdit('select enregistrer_abonnement_push(''http://pas-securise'', ''c'', ''s'')', 'adresse non sécurisée refusée');

  -- 2. Un défi reçu, puis accepté.
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  d := lancer_defi(pg_temp.j(2), 11, 2, true);
  execute 'reset role';
  perform pg_temp.verifier(pg_temp.nb('defi', 2) = 1, 'défi reçu : notification pour le joueur 2');
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  perform repondre_duel(d.id, true);
  execute 'reset role';
  perform pg_temp.verifier(pg_temp.nb('accepte', 1) = 1, 'défi accepté : notification pour le joueur 1');
  update duels set phase = 'attente' where id = d.id; update duels set phase = 'presentation' where id = d.id;
  perform pg_temp.verifier(pg_temp.nb('accepte', 1) = 1, 'une seule notification par événement');

  -- 3. Partie rapide : pas de notification (les deux joueurs sont déjà sur l'écran).
  insert into duels (j0, j1, points_par_set, sets_gagnants, rapide, phase) values (pg_temp.j(1), pg_temp.j(3), 7, 1, true, 'presentation');
  perform pg_temp.verifier(pg_temp.nb('defi', 3) + pg_temp.nb('accepte', 1) = 1, 'partie rapide : rien de plus');

  -- 4. Désabonnement.
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  perform retirer_abonnement_push('https://push.exemple/6');
  execute 'reset role';
  perform pg_temp.verifier(not exists (select 1 from abonnements_push where endpoint = 'https://push.exemple/6'), 'désabonnement');
  perform pg_temp.en_tant_que('');
  perform pg_temp.interdit('select enregistrer_abonnement_push(''https://x'', ''c'', ''s'')', 'visiteur refusé');
  execute 'reset role';
end $$;
