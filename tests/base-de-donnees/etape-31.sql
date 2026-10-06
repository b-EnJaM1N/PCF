-- Tests de supabase/etape-31-divisions.sql : divisions, marge de descente, classement par division.
-- un seul humain suffit ; les bots comptent dans la cagnotte, chacun est payé selon sa vraie place.
\set QUIET on
\echo Tests de la base de données (étape 31 : divisions)

insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 5) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'Joueur' || i, 0 from generate_series(1, 5) i;

create or replace function pg_temp.u(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid $$;
create or replace function pg_temp.en_tant_que(uid text) returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', uid, false);
  execute format('set role %I', case when uid = '' then 'anon' else 'authenticated' end);
end $$;
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
create or replace function pg_temp.solde(i int) returns int language sql security definer as $$ select coalesce((select solde from public.jetons where joueur = pg_temp.u(i)), 1000) $$;
-- Un joueur seul dans une salle de Sit & Go, qui attend depuis 3 minutes : la salle se complète.
create or replace function pg_temp.salle_seul(i int, p_taille int, p_mise int) returns public.tournois language plpgsql as $$
declare t public.tournois;
begin
  perform pg_temp.en_tant_que(pg_temp.u(i)::text);
  perform rejoindre_sit_and_go(p_taille, p_mise);
  execute 'reset role';
  select t2.* into t from tournois t2 join inscrits_tournoi x on x.tournoi_id = t2.id where x.joueur = pg_temp.u(i) and t2.phase = 'inscriptions';
  update inscrits_tournoi set inscrit_le = now() - interval '3 minutes' where tournoi_id = t.id;
  perform _veille_tournois();
  select * into t from tournois where id = t.id;
  return t;
end $$;

do $$
declare r jsonb; d smallint;
begin
  -- 1. Les seuils, et la marge de 20 points pour redescendre.
  perform pg_temp.verifier(_division_brute(1099) = 0 and _division_brute(1100) = 1 and _division_brute(1200) = 1 and _division_brute(1250) = 2
    and _division_brute(1400) = 3 and _division_brute(1550) = 4, 'seuils : Bronze, Argent (1 100), Or (1 250), Platine (1 400), Diamant (1 550)');
  perform pg_temp.verifier(_division(1::smallint, 1250) = 2, 'Argent à 1 250 : promu en Or');
  perform pg_temp.verifier(_division(2::smallint, 1240) = 2 and _division(2::smallint, 1230) = 2, 'Or à 1 240 ou 1 230 : reste en Or (marge de 20)');
  perform pg_temp.verifier(_division(2::smallint, 1229) = 1, 'Or à 1 229 : redescend en Argent');
  perform pg_temp.verifier(_division(0::smallint, 1600) = 4, 'un grand bond : plusieurs divisions d''un coup');

  -- 2. La division suit les points (déclencheur).
  insert into classements (joueur, points, joues, maj_le) values (pg_temp.u(1), 1200, 12, now());
  update classements set points = 1260 where joueur = pg_temp.u(1);
  update classements set points = 1240 where joueur = pg_temp.u(1);
  select division into d from classements where joueur = pg_temp.u(1);
  perform pg_temp.verifier(d = 2, 'monté en Or à 1 260, toujours en Or à 1 240');

  -- 3. Le classement de la division Or : seulement 10 duels et plus, actifs depuis 30 jours.
  insert into classements (joueur, points, joues, maj_le) values (pg_temp.u(2), 1300, 20, now()), (pg_temp.u(3), 1350, 4, now()), (pg_temp.u(4), 1380, 30, now() - interval '40 days');
  perform pg_temp.en_tant_que(pg_temp.u(3)::text);
  r := classement_division(2);
  execute 'reset role';
  perform pg_temp.verifier(jsonb_array_length(r -> 'joueurs') = 2, 'Or : 2 joueurs classés (le débutant et l''inactif sont masqués)');
  perform pg_temp.verifier((r -> 'joueurs' -> 0 ->> 'pseudo') = 'Joueur2' and (r -> 'joueurs' -> 0 ->> 'rang')::int = 1
    and (r -> 'joueurs' -> 1 ->> 'pseudo') = 'Joueur1' and (r -> 'joueurs' -> 1 ->> 'rang')::int = 2, 'rangés par points : Joueur2 1er, Joueur1 2e');
  perform pg_temp.verifier((r -> 'moi' ->> 'division')::int = 2 and (r -> 'moi' ->> 'manque')::int = 6, 'le débutant voit sa division et les 6 duels qui lui manquent');
  perform pg_temp.en_tant_que(pg_temp.u(4)::text);
  r := classement_division(2);
  execute 'reset role';
  perform pg_temp.verifier((r -> 'moi' ->> 'inactif')::boolean and (r -> 'moi' ->> 'points')::int = 1380, 'l''inactif garde ses points, simplement masqué');
end $$;
