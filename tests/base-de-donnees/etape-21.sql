-- Tests de supabase/etape-21-bots-tournois.sql : bots qui remplissent les tableaux, jouent sur le serveur, ne gagnent rien.
\set QUIET on
\echo Tests de la base de données (étape 21 : bots dans les tournois)

insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 6) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'Joueur' || i, 0 from generate_series(1, 6) i;

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

do $$
declare t public.tournois; d public.duels; k int; b uuid; b2 uuid; n int;
begin
  -- Freeroll d'hier avec 2 présents : le minuteur le lance, 6 bots complètent le tableau de 8.
  t := _freeroll(_aujourdhui() - 1);
  insert into inscrits_tournoi (tournoi_id, joueur, vu) values
    (t.id, pg_temp.u(1), _heure_freeroll(_aujourdhui() - 1) - interval '10 seconds'),
    (t.id, pg_temp.u(2), _heure_freeroll(_aujourdhui() - 1) - interval '10 seconds');
  perform _veille_tournois();
  select * into t from tournois where id = t.id;
  perform pg_temp.verifier(t.phase = 'en_cours' and t.taille = 8 and _humains(t.id) = 2 and (select count(*) from inscrits_tournoi where tournoi_id = t.id) = 8,
    'le minuteur lance le freeroll : 2 joueurs + 6 bots');
  perform pg_temp.verifier((select count(*) from bots_en_ligne) >= 6 and not exists (select 1 from profils p join bots_en_ligne b on b.joueur = p.id where p.visible_recherche),
    'les bots existent, invisibles dans la recherche');
  perform pg_temp.verifier((select tete from inscrits_tournoi where tournoi_id = t.id and joueur = pg_temp.u(1)) <= 2
    and (select tete from inscrits_tournoi where tournoi_id = t.id and joueur = pg_temp.u(2)) <= 2, 'les humains sont les premières têtes de série');
  perform pg_temp.verifier((select count(*) from matchs_tournoi where tournoi_id = t.id and tour = 1 and fin = 'score' and duel_id is null) = 2,
    'les deux matchs entre bots sont joués tout de suite');
  perform pg_temp.verifier((select count(*) from duels where tournoi_id = t.id and phase = 'presentation' and not classe) = 2, 'chaque joueur affronte un bot (match amical)');

  -- Le joueur 1 joue son match contre le bot jusqu'au bout : le bot est prêt, joue à chaque coup, serre la main.
  select * into d from duels where tournoi_id = t.id and pg_temp.u(1) in (j0, j1);
  perform pg_temp.en_tant_que(pg_temp.u(1)::text);
  perform pret(d.id);
  select * into d from duels where id = d.id;
  perform pg_temp.verifier(d.phase = 'jeu', 'le bot est prêt : le match commence');
  for k in 1 .. 400 loop
    select * into d from duels where id = d.id;
    exit when d.phase = 'termine';
    if d.phase = 'entre_sets' then perform pret(d.id); continue; end if;
    perform jouer(d.id, d.manche, k % 3);
  end loop;
  execute 'reset role';
  select * into d from duels where id = d.id;
  perform pg_temp.verifier(d.phase = 'termine' and d.fin = 'score' and jsonb_array_length(d.coups) >= 22, 'match joué jusqu''au bout contre le bot');
  perform pg_temp.verifier(case when d.j0 = pg_temp.u(1) then d.poignee1 else d.poignee0 end = 'normale', 'le bot serre la main');
  perform pg_temp.verifier((select fin from matchs_tournoi where id = d.tournoi_match) = 'score', 'le résultat compte pour le tableau');

  -- Le joueur 2 a quitté l'appli pendant son match : forfait au bout de 90 secondes.
  select * into d from duels where tournoi_id = t.id and pg_temp.u(2) in (j0, j1);
  insert into presences (duel_id, joueur, vu) values (d.id, case when d.j0 = pg_temp.u(2) then 0 else 1 end, now() - interval '2 minutes')
  on conflict (duel_id, joueur) do update set vu = excluded.vu;
  perform _veille_bots();
  select * into d from duels where id = d.id;
  perform pg_temp.verifier(d.phase = 'termine' and d.fin = 'forfait' and d.vainqueur = case when d.j0 = pg_temp.u(2) then 1 else 0 end, 'joueur parti : le bot gagne par forfait');

  -- Sit & Go à 100 jetons : 2 joueurs attendent depuis plus de 2 minutes : des bots complètent la salle.
  perform pg_temp.en_tant_que(pg_temp.u(3)::text);
  perform rejoindre_sit_and_go(8, 100);
  perform pg_temp.en_tant_que(pg_temp.u(4)::text);
  perform rejoindre_sit_and_go(8, 100);
  execute 'reset role';
  select t2.* into t from tournois t2 join inscrits_tournoi i on i.tournoi_id = t2.id where i.joueur = pg_temp.u(3) and t2.mise = 100;
  perform pg_temp.verifier(t.phase = 'inscriptions', 'salle en attente');
  perform pg_temp.en_tant_que(pg_temp.u(3)::text);
  perform salles_sit_and_go();
  execute 'reset role';
  perform pg_temp.verifier((select phase from tournois where id = t.id) = 'inscriptions', 'moins de 2 minutes : on attend encore');
  update inscrits_tournoi set inscrit_le = now() - interval '3 minutes' where tournoi_id = t.id;
  perform pg_temp.en_tant_que(pg_temp.u(3)::text);
  perform salles_sit_and_go();
  execute 'reset role';
  select * into t from tournois where id = t.id;
  perform pg_temp.verifier(t.phase = 'en_cours' and (select count(*) from inscrits_tournoi where tournoi_id = t.id) = 8, 'au bout de 2 minutes : 6 bots, la salle démarre');
  perform pg_temp.verifier(pg_temp.solde(3) = 900 and pg_temp.solde(4) = 900, 'les joueurs ont payé leur entrée');
  perform pg_temp.verifier(not exists (select 1 from mouvements_jetons m join bots_en_ligne b on b.joueur = m.joueur), 'les bots ne paient pas d''entrée');

  -- Fin simulée : un bot bat le joueur 3 en finale ; le joueur 4 perd en demi-finale contre un bot.
  -- Cagnotte : 2 × 100 − 10 % = 180 ; 2 humains : 2 places payées, données aux humains selon leur parcours (117 et 63).
  select i.joueur into b from inscrits_tournoi i join bots_en_ligne x on x.joueur = i.joueur where i.tournoi_id = t.id limit 1;
  select i.joueur into b2 from inscrits_tournoi i join bots_en_ligne x on x.joueur = i.joueur where i.tournoi_id = t.id and i.joueur <> b limit 1;
  delete from duels where tournoi_id = t.id;
  delete from matchs_tournoi where tournoi_id = t.id;
  insert into matchs_tournoi (tournoi_id, tour, position, j0, j1, vainqueur, fin) values
    (t.id, 2, 1, pg_temp.u(3), b2, pg_temp.u(3), 'score'),
    (t.id, 2, 2, pg_temp.u(4), b, b, 'forfait'),
    (t.id, 3, 1, pg_temp.u(3), b, b, 'score');
  update tournois set phase = 'termine', vainqueur = b, fini_le = now() where id = t.id;
  perform pg_temp.verifier(pg_temp.solde(3) = 1017 and pg_temp.solde(4) = 963, 'gains aux humains : 117 et 63');
  perform pg_temp.verifier(not exists (select 1 from mouvements_jetons m join bots_en_ligne x on x.joueur = m.joueur), 'les bots ne gagnent jamais de jetons');

  -- Un salon de 16 : il faut au moins 4 joueurs (un quart) pour que les bots complètent.
  perform pg_temp.en_tant_que(pg_temp.u(5)::text);
  perform rejoindre_sit_and_go(16, 0);
  perform pg_temp.en_tant_que(pg_temp.u(6)::text);
  perform rejoindre_sit_and_go(16, 0);
  execute 'reset role';
  select t2.* into t from tournois t2 join inscrits_tournoi i on i.tournoi_id = t2.id where i.joueur = pg_temp.u(5) and t2.taille = 16;
  update inscrits_tournoi set inscrit_le = now() - interval '3 minutes' where tournoi_id = t.id;
  perform _veille_tournois();
  perform pg_temp.verifier((select phase from tournois where id = t.id) = 'inscriptions', 'salle de 16 avec 2 joueurs : pas de bots (il en faut 4)');
end $$;
