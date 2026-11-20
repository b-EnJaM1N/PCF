-- Tests de supabase/etape-84-creneaux-match.sql : programmer un match de tournoi (créneaux, rendez-vous, rappels, forfait).
\set QUIET on
\echo Tests de la base de données (étape 84 : programmer un match de tournoi)

insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 3) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'Joueur' || i, 1000 + i from generate_series(1, 3) i;
create or replace function pg_temp.u(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid $$;
create or replace function pg_temp.en_tant_que(uid uuid) returns void language plpgsql as $$
begin execute 'reset role'; perform set_config('request.jwt.claim.sub', uid::text, false); execute 'set role authenticated'; end $$;
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
create or replace function pg_temp.refuse(sql text, msg text) returns void language plpgsql as $$
begin
  begin execute sql; exception when others then raise notice 'ok : % (%)', msg, sqlerrm; return; end;
  raise exception 'ÉCHEC : % (accepté)', msg;
end $$;

-- Un tournoi à 2 joueurs, en cours, tour 1, date limite dans 24 heures.
insert into tournois (id, nom, createur, points_par_set, sets_gagnants, duree_tour, phase, tour, nb_tours, echeance, lance_le)
values ('11111111-1111-1111-1111-111111111111', 'Coupe test', pg_temp.u(1), 7, 1, '24 hours', 'en_cours', 1, 1, now() + interval '24 hours', now());
insert into inscrits_tournoi (tournoi_id, joueur) values ('11111111-1111-1111-1111-111111111111', pg_temp.u(1)), ('11111111-1111-1111-1111-111111111111', pg_temp.u(2));
insert into matchs_tournoi (id, tournoi_id, tour, position, j0, j1) values ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 1, 0, pg_temp.u(1), pg_temp.u(2));

do $$
declare r jsonb; m uuid := '22222222-2222-2222-2222-222222222222';
begin
  perform pg_temp.en_tant_que(pg_temp.u(3));
  perform pg_temp.refuse(format('select proposer_creneaux(%L, %L)', m, jsonb_build_array(jsonb_build_object('debut', now() + interval '1 hour', 'fin', now() + interval '2 hours'))), 'un autre joueur ne programme pas notre match');

  perform pg_temp.en_tant_que(pg_temp.u(1));
  perform pg_temp.refuse(format('select proposer_creneaux(%L, %L)', m, jsonb_build_array(jsonb_build_object('debut', now() + interval '30 hours', 'fin', now() + interval '31 hours'))), 'pas après la date limite');
  r := proposer_creneaux(m, jsonb_build_array(jsonb_build_object('debut', now() + interval '1 hour', 'fin', now() + interval '3 hours'),
                                               jsonb_build_object('debut', now() + interval '5 hours', 'fin', now() + interval '6 hours')));
  perform pg_temp.verifier(r->'creneaux'->>'statut' = 'propose' and jsonb_array_length(r->'creneaux'->'plages') = 2, 'deux plages proposées');
  perform pg_temp.refuse(format('select choisir_creneau(%L, %L)', m, now() + interval '2 hours'), 'on ne choisit pas dans ses propres plages');
  reset role;
  perform pg_temp.verifier((select count(*) from notifications where joueur = pg_temp.u(2) and evenement = 'creneaux') = 1, 'l''adversaire est prévenu');

  perform pg_temp.en_tant_que(pg_temp.u(2));
  perform pg_temp.refuse(format('select choisir_creneau(%L, %L)', m, now() + interval '4 hours'), 'une heure hors des plages : refusée');
  r := choisir_creneau(m, now() + interval '2 hours');
  perform pg_temp.verifier(r->'creneaux'->>'statut' = 'fixe' and (r->'creneaux'->>'rdv')::timestamptz > now(), 'le rendez-vous est fixé');
  reset role;
  perform pg_temp.verifier((select quand from notifications where joueur = pg_temp.u(1) and evenement = 'rdv_fixe') is not null, 'le proposeur est prévenu, avec l''heure');

  -- Le rendez-vous approche, puis il est l'heure : les rappels.
  update creneaux_match set rdv = now() + interval '5 minutes' where match_id = m;
  perform _rappels_rdv(); perform _rappels_rdv();
  perform pg_temp.verifier((select count(*) from notifications where evenement = 'rdv_rappel') = 2, 'un rappel 10 minutes avant, à chacun, une seule fois');
  update creneaux_match set rdv = now() - interval '1 minute' where match_id = m;
  perform _rappels_rdv();
  perform pg_temp.verifier((select count(*) from notifications where evenement = 'rdv_heure') = 2, 'puis « c''est l''heure », à chacun');

  -- Le joueur 2 reprend la main : il repropose, le joueur 1 décline.
  perform pg_temp.en_tant_que(pg_temp.u(2));
  r := proposer_creneaux(m, jsonb_build_array(jsonb_build_object('debut', now() + interval '3 hours', 'fin', now() + interval '4 hours')));
  perform pg_temp.verifier(r->'creneaux'->>'statut' = 'propose' and r->'creneaux'->>'rdv' is null, 'reproposer : le rendez-vous est à refaire');
  perform pg_temp.en_tant_que(pg_temp.u(1));
  r := decliner_creneaux(m);
  perform pg_temp.verifier(r->'creneaux'->>'statut' = 'decline', 'décliner');

  -- Un rendez-vous manqué : le joueur 1 était là, pas le joueur 2.
  r := proposer_creneaux(m, jsonb_build_array(jsonb_build_object('debut', now() + interval '1 hour', 'fin', now() + interval '2 hours')));
  perform pg_temp.en_tant_que(pg_temp.u(2));
  r := choisir_creneau(m, now() + interval '90 minutes');
  perform pg_temp.en_tant_que(pg_temp.u(1));
  perform pg_temp.refuse(format('select forfait_rdv(%L)', m), 'pas de forfait avant l''heure');
  reset role;
  update creneaux_match set rdv = now() - interval '20 minutes' where match_id = m;
  perform pg_temp.en_tant_que(pg_temp.u(1));
  perform pg_temp.refuse(format('select forfait_rdv(%L)', m), 'pas de forfait si je n''étais pas là');
  reset role;
  update creneaux_match set la0 = now() - interval '19 minutes' where match_id = m;
  perform pg_temp.en_tant_que(pg_temp.u(2));
  perform pg_temp.refuse(format('select forfait_rdv(%L)', m), 'celui qui n''est pas venu ne réclame rien');
  perform pg_temp.en_tant_que(pg_temp.u(1));
  r := forfait_rdv(m);
  perform pg_temp.verifier((r->>'ok')::boolean, 'forfait réclamé');
  perform pg_temp.refuse(format('select forfait_rdv(%L)', m), 'un match décidé n''est plus à caler');
  reset role;
  perform pg_temp.verifier((select vainqueur = pg_temp.u(1) and fin = 'forfait' from matchs_tournoi where id = m), 'victoire par forfait');
end $$;
reset role;
