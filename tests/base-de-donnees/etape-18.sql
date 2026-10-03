-- Tests de supabase/etape-18-tournois-programmes.sql : programme, entrées, départ avec les présents, gains, garantie, rappel.
\set QUIET on
\echo Tests de la base de données (étape 18 : tournois programmés)

insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 8) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'Joueur' || i, 0 from generate_series(1, 8) i;

create or replace function pg_temp.u(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid $$;
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
create or replace function pg_temp.solde(i int) returns int language sql security definer as $$ select coalesce((select solde from public.jetons where joueur = pg_temp.u(i)), 1000) $$;
-- Inscrit les joueurs a..b (l'entrée est prélevée) ; vu : leur dernier signe de vie.
create or replace function pg_temp.inscrire(t uuid, a int, b int, vu timestamptz) returns void language plpgsql as $$
declare k int;
begin
  for k in a .. b loop perform _portefeuille_de(pg_temp.u(k)); insert into inscrits_tournoi (tournoi_id, joueur, vu) values (t, pg_temp.u(k), vu); end loop;
end $$;

do $$
declare r jsonb; x jsonb; t public.tournois; d public.duels; m uuid;
begin
  -- Le programme (allégé à l'étape 21) : le Grand Chelem du dimanche, avec son entrée.
  perform pg_temp.en_tant_que(pg_temp.u(1)::text);
  r := tournois_programmes();
  perform pg_temp.verifier(jsonb_array_length(r->'tournois') = 1, '1 tournoi au programme (le Grand Chelem)');
  select x2 into x from jsonb_array_elements(r->'tournois') x2 where x2->>'cle' = 'grand_chelem';
  perform pg_temp.verifier((x->>'mise')::int = 1000 and (x->>'cagnotte')::int = 5000 and (x->>'finale_sets')::int = 3
    and extract(isodow from ((x->>'depart')::timestamptz at time zone 'Europe/Paris')) = 7, 'Grand Chelem : le dimanche, 1 000 jetons, 5 000 garantis, finale en 3 sets');
  perform pg_temp.verifier(r->'tenant' = 'null'::jsonb, 'pas encore de tenant du titre');

  -- Inscription : l'entrée est prélevée ; désinscription : rendue.
  r := inscrire_programme('grand_chelem');
  select x2 into x from jsonb_array_elements(r->'tournois') x2 where x2->>'cle' = 'grand_chelem';
  perform pg_temp.verifier((x->>'inscrit')::boolean and pg_temp.solde(1) = 0 and (x->>'cagnotte')::int = 5000, 'inscription au Grand Chelem : −1 000');
  r := inscrire_programme('grand_chelem');
  perform pg_temp.verifier(pg_temp.solde(1) = 0, 'une seule inscription (pas de double prélèvement)');
  perform pg_temp.verifier((salles_sit_and_go()->'mien') = 'null'::jsonb, 'un inscrit au Grand Chelem peut encore jouer un Sit & Go');
  perform quitter_sit_and_go();
  perform pg_temp.verifier(pg_temp.solde(1) = 0, 'quitter une salle de Sit & Go ne désinscrit pas du Grand Chelem');
  r := desinscrire_programme('grand_chelem');
  perform pg_temp.verifier(pg_temp.solde(1) = 1000, 'désinscription : entrée rendue');
  perform pg_temp.interdit('select inscrire_programme(''inconnu'')', 'tournoi inconnu refusé');
  perform pg_temp.interdit('select inscrire_programme(''midi'')', 'Le Midi est en pause');
  execute 'reset role';
  update jetons set solde = 150 where joueur = pg_temp.u(1);
  perform pg_temp.en_tant_que(pg_temp.u(1)::text);
  perform pg_temp.interdit('select inscrire_programme(''grand_chelem'')', 'pas assez de jetons pour le Grand Chelem');
  execute 'reset role';
  update jetons set solde = 1000 where joueur = pg_temp.u(1);

  -- L'heure est passée (Midi d'hier) : 5 présents, 1 absent retiré sans remboursement.
  t := _tournoi_programme('midi', _aujourdhui() - 1);
  perform pg_temp.inscrire(t.id, 1, 5, t.depart - interval '10 seconds');
  perform pg_temp.inscrire(t.id, 6, 6, t.depart - interval '1 hour');
  perform _lancer_programme(t.id);
  select * into t from tournois where id = t.id;
  perform pg_temp.verifier(t.phase = 'en_cours' and t.taille = 8 and t.nb_tours = 3 and t.entrees = 9, 'départ à 5 présents, tableau de 8, 6 entrées payées + 3 bots (étape 24 : les bots comptent)');
  perform pg_temp.verifier(_humains(t.id) = 5 and (select count(*) from inscrits_tournoi where tournoi_id = t.id) = 8, 'l''absent est retiré, 3 bots complètent le tableau');
  perform pg_temp.verifier(pg_temp.solde(6) = 900 and pg_temp.solde(1) = 900, 'l''absent n''est pas remboursé');
  perform pg_temp.verifier(_cagnotte_programme(t) = 810, 'cagnotte : 9 × 100 − 10 % = 810 (l''entrée de l''absent y reste, les bots comptent)');

  -- Fin simulée : 1 bat 2 en finale ; 3 et 4 perdent en demi-finale. Tableau de 8 : 2 payés (grille de l'étape 19), 526 / 283.
  delete from duels where tournoi_id = t.id;
  delete from matchs_tournoi where tournoi_id = t.id;
  insert into matchs_tournoi (tournoi_id, tour, position, j0, j1, vainqueur, fin) values
    (t.id, 2, 1, pg_temp.u(1), pg_temp.u(4), pg_temp.u(1), 'score'),
    (t.id, 2, 2, pg_temp.u(2), pg_temp.u(3), pg_temp.u(2), 'score'),
    (t.id, 3, 1, pg_temp.u(1), pg_temp.u(2), pg_temp.u(1), 'score');
  update tournois set phase = 'termine', vainqueur = pg_temp.u(1), fini_le = now() where id = t.id;
  perform pg_temp.verifier(pg_temp.solde(1) = 1426 and pg_temp.solde(2) = 1183 and pg_temp.solde(3) = 900 and pg_temp.solde(4) = 900 and pg_temp.solde(5) = 900,
    'gains : 526, 283');

  -- Personne de présent : annulé, et tout le monde est remboursé (absents compris).
  t := _tournoi_programme('apero', _aujourdhui() - 1);
  perform pg_temp.inscrire(t.id, 7, 7, t.depart - interval '2 hours');
  perform pg_temp.inscrire(t.id, 8, 8, t.depart - interval '2 hours');
  perform pg_temp.inscrire(t.id, 6, 6, t.depart - interval '2 hours');
  perform pg_temp.inscrire(t.id, 5, 5, t.depart - interval '2 hours');
  perform pg_temp.verifier(pg_temp.solde(7) = 900, 'entrée prélevée');
  perform _lancer_programme(t.id);
  perform pg_temp.verifier((select phase from tournois where id = t.id) = 'annule', 'personne de présent : annulé');
  perform pg_temp.verifier(pg_temp.solde(7) = 1000 and pg_temp.solde(6) = 900 and pg_temp.solde(5) = 900, 'tout le monde est remboursé');

  -- Un seul présent : le tournoi démarre, 7 bots complètent le tableau (étape 24).
  t := _tournoi_programme('apero', _aujourdhui() - 2);
  perform pg_temp.inscrire(t.id, 8, 8, t.depart - interval '10 seconds');
  perform _lancer_programme(t.id);
  select * into t from tournois where id = t.id;
  perform pg_temp.verifier(t.phase = 'en_cours' and (select count(*) from inscrits_tournoi where tournoi_id = t.id) = 8 and t.entrees = 8,
    'un seul présent : départ avec 7 bots, 8 entrées dans la cagnotte');

  -- Un tournoi resté en attente (personne n'est passé à l'heure) est réglé au passage suivant.
  t := _tournoi_programme('apero', _aujourdhui() - 3);
  perform pg_temp.inscrire(t.id, 7, 7, t.depart - interval '1 day');
  perform pg_temp.en_tant_que(pg_temp.u(8)::text);
  perform tournois_programmes();
  execute 'reset role';
  perform pg_temp.verifier((select phase from tournois where id = t.id) = 'annule' and pg_temp.solde(7) = 1000, 'tournoi oublié : annulé et remboursé');

  -- Grand Chelem : cagnotte garantie, finale en 3 sets gagnants.
  t := _tournoi_programme('grand_chelem', _aujourdhui() - 7);
  update jetons set solde = 2000 where joueur in (pg_temp.u(1), pg_temp.u(2), pg_temp.u(3), pg_temp.u(4));
  perform pg_temp.inscrire(t.id, 1, 4, t.depart - interval '10 seconds');
  perform _lancer_programme(t.id);
  select * into t from tournois where id = t.id;
  perform pg_temp.verifier(_cagnotte_programme(t) = 7200, '4 joueurs + 4 bots : 8 × 1 000 − 10 % = 7 200, plus que la garantie de 5 000');
  perform pg_temp.verifier((select bool_and(sets_gagnants = 2) from duels where tournoi_id = t.id) and (select count(*) from duels where tournoi_id = t.id) = 4,
    '1er tour (contre les bots) en 2 sets gagnants');
  insert into matchs_tournoi (tournoi_id, tour, position, j0, j1) values (t.id, t.nb_tours, 1, pg_temp.u(1), pg_temp.u(2)) returning id into m;
  insert into duels (j0, j1, points_par_set, sets_gagnants, classe, tournoi_id, tournoi_match, phase)
  values (pg_temp.u(1), pg_temp.u(2), 11, 2, true, t.id, m, 'presentation') returning * into d;
  perform pg_temp.verifier(d.sets_gagnants = 3, 'finale en 3 sets gagnants');
  delete from duels where tournoi_id = t.id;
  update matchs_tournoi set vainqueur = j0, fin = 'score' where tournoi_id = t.id;
  update tournois set phase = 'termine', vainqueur = pg_temp.u(1), fini_le = now() where id = t.id;
  perform pg_temp.verifier(pg_temp.solde(1) = 5680 and pg_temp.solde(2) = 3520, 'finale : 4 680 au vainqueur, 2 520 au finaliste');
  perform pg_temp.en_tant_que(pg_temp.u(5)::text);
  perform pg_temp.verifier((tournois_programmes()->'tenant'->>'id')::uuid = pg_temp.u(1), 'tenant du titre : le vainqueur du dernier Grand Chelem');

  -- Classement du mois : les gains des tournois programmés comptent.
  r := classement_mois();
  perform pg_temp.verifier((r->'top'->0->>'id')::uuid = pg_temp.u(1), 'le vainqueur est en tête du classement du mois');
  execute 'reset role';

  -- Rappel : 10 minutes avant, aux inscrits (une seule fois).
  insert into tournois (nom, points_par_set, sets_gagnants, duree_tour, mode, taille, mise, programme, depart)
  values ('Le Midi', 11, 2, '1 hour', 'direct', 64, 100, 'midi', date_trunc('minute', now()) + interval '10 minutes') returning * into t;
  perform pg_temp.inscrire(t.id, 7, 8, now());
  insert into abonnements_push (endpoint, joueur, p256dh, auth) values ('https://push.exemple/7', pg_temp.u(7), 'k', 'a');
  perform pg_temp.verifier(rappel_programmes(now() - interval '10 minutes') = 0, '20 minutes avant : pas encore');
  perform pg_temp.verifier(rappel_programmes() = 1, '10 minutes avant : l''inscrit abonné est prévenu');
  perform pg_temp.verifier((select count(*) from notifications where evenement = 'programme' and tournoi_id = t.id) = 2, 'notification notée pour les deux inscrits');
  perform pg_temp.verifier(rappel_programmes(now() + interval '3 minutes') = 0, 'une seule fois');
end $$;
