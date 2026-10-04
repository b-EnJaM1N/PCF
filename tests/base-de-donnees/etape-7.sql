-- Tests de supabase/etape-7-partie-rapide.sql : files d'attente, appariement par niveau, absents, annulation.
\set QUIET on
\echo Tests de la base de données (étape 7 : Partie rapide)

insert into auth.users select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'j' || i || '@x.fr' from generate_series(1, 9) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'Joueur' || i, 0 from generate_series(1, 9) i;
insert into classements (joueur, points) values
  ('00000000-0000-0000-0000-000000000004', 1360), ('00000000-0000-0000-0000-000000000005', 1220), ('00000000-0000-0000-0000-000000000006', 1240);

create or replace function pg_temp.j(i int) returns text language sql as $$ select '00000000-0000-0000-0000-00000000000' || i $$;
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
create or replace function pg_temp.cherche(i int, f text) returns jsonb language plpgsql as $$
begin perform pg_temp.en_tant_que(pg_temp.j(i)); return chercher_partie(f); end $$;

do $$
declare r jsonb; d public.duels; id1 uuid;
begin
  -- 1. Seul dans la file : on attend.
  r := pg_temp.cherche(1, 'officiel');
  perform pg_temp.verifier(r->>'attente' = 'true' and (r->>'en_attente')::int = 1, 'seul : en attente');
  r := pg_temp.cherche(2, 'eclair');
  perform pg_temp.verifier(r->>'attente' = 'true' and (r->>'en_attente')::int = 1, 'une autre file : en attente aussi');
  r := pg_temp.cherche(1, 'officiel');
  perform pg_temp.verifier(r->>'attente' = 'true', 'toujours en attente (signe de vie)');

  -- 2. Un deuxième joueur arrive : le duel est créé, officiel, sets de 11.
  r := pg_temp.cherche(3, 'officiel');
  perform pg_temp.verifier(r ? 'duel', 'le joueur 3 trouve un adversaire');
  id1 := (r->'duel'->>'id')::uuid;
  execute 'reset role'; select * into d from duels where id = id1;
  perform pg_temp.verifier(d.j0 = pg_temp.j(1)::uuid and d.j1 = pg_temp.j(3)::uuid and d.rapide and not d.classe   -- (amicale depuis l'étape 27)
    and d.points_par_set = 11 and d.sets_gagnants = 2 and d.phase = 'presentation', 'duel rapide en sets de 11, 2 sets, amical, en présentation');
  r := pg_temp.cherche(1, 'officiel');
  perform pg_temp.verifier((r->'duel'->>'id')::uuid = id1, 'le joueur 1 reçoit le même duel');
  execute 'reset role';
  perform pg_temp.verifier(not exists (select 1 from file_rapide where joueur in (pg_temp.j(1)::uuid, pg_temp.j(3)::uuid)), 'les deux ont quitté la file');
  perform pg_temp.interdit($q$ select pg_temp.cherche(3, 'officiel') $q$, 'pas de nouvelle recherche avec un duel en cours');

  -- 3. Le niveau le plus proche d'abord.
  -- (deux joueurs déjà en attente, ajoutés directement : sinon ils s'associeraient entre eux)
  execute 'reset role';
  insert into file_rapide (joueur, format, niveau, entree) values
    (pg_temp.j(4)::uuid, 'officiel', 1360, now() - interval '5 seconds'), (pg_temp.j(5)::uuid, 'officiel', 1220, now());
  r := pg_temp.cherche(6, 'officiel');
  execute 'reset role'; select * into d from duels where id = (r->'duel'->>'id')::uuid;
  perform pg_temp.verifier(d.j0 = pg_temp.j(5)::uuid, 'niveau 1240 associé au 1220 plutôt qu''au 1360');

  -- 4. La file éclair : un set de 7, amical.
  r := pg_temp.cherche(7, 'eclair');
  execute 'reset role'; select * into d from duels where id = (r->'duel'->>'id')::uuid;
  perform pg_temp.verifier(d.j0 = pg_temp.j(2)::uuid and not d.classe and d.points_par_set = 7 and d.sets_gagnants = 1, 'éclair : 7 points, un set, amical');

  -- 5. L'adversaire n'arrive jamais : partie annulée, sans vainqueur.
  perform pg_temp.en_tant_que(pg_temp.j(7)); perform reclamer(d.id);
  execute 'reset role'; update duels set echeance = now() - interval '1 second' where id = d.id;
  perform pg_temp.en_tant_que(pg_temp.j(7)); perform reclamer(d.id);
  execute 'reset role'; select * into d from duels where id = d.id;
  perform pg_temp.verifier(d.phase = 'annule' and d.vainqueur is null, 'adversaire jamais arrivé : partie annulée');

  -- 6. Sans signe de vie, on sort de la file.
  perform pg_temp.en_tant_que(pg_temp.j(4)); perform quitter_partie();
  perform pg_temp.cherche(8, 'officiel');
  execute 'reset role'; update file_rapide set vu = now() - interval '20 seconds' where joueur = pg_temp.j(8)::uuid;
  r := pg_temp.cherche(9, 'officiel');
  perform pg_temp.verifier(r->>'attente' = 'true', 'un joueur absent n''est pas proposé');
  perform pg_temp.en_tant_que(pg_temp.j(1));
  r := file_partie_rapide();
  perform pg_temp.verifier((r->>'officiel')::int = 1 and (r->>'eclair')::int = 0, 'compte des joueurs en attente');
  perform pg_temp.en_tant_que(pg_temp.j(9)); perform quitter_partie();
  execute 'reset role';
  perform pg_temp.verifier(not exists (select 1 from file_rapide where joueur = pg_temp.j(9)::uuid), 'quitter la file');

  -- 7. Sécurité.
  perform pg_temp.en_tant_que(pg_temp.j(1));
  perform pg_temp.interdit($q$ select * from file_rapide $q$, 'la file n''est pas lisible directement');
  perform pg_temp.interdit($q$ select chercher_partie('blitz') $q$, 'format inconnu refusé');
  perform pg_temp.en_tant_que('');
  perform pg_temp.interdit($q$ select chercher_partie('officiel') $q$, 'visiteur non connecté refusé');
  execute 'reset role';
end $$;
