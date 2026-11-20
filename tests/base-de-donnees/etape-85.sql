-- Tests de supabase/etape-85-programmer-defi.sql : programmer un défi entre joueurs.
\set QUIET on
\echo Tests de la base de données (étape 85 : programmer un défi)

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

insert into duels (id, j0, j1, points_par_set, sets_gagnants, phase) values ('33333333-3333-3333-3333-333333333333', pg_temp.u(1), pg_temp.u(2), 11, 2, 'attente');

do $$
declare r jsonb; d uuid := '33333333-3333-3333-3333-333333333333'; rdv timestamptz;
begin
  perform pg_temp.en_tant_que(pg_temp.u(3));
  perform pg_temp.refuse(format('select proposer_creneaux_duel(%L, %L)', d, jsonb_build_array(jsonb_build_object('debut', now() + interval '1 hour', 'fin', now() + interval '2 hours'))), 'un autre joueur ne programme pas notre défi');
  perform pg_temp.en_tant_que(pg_temp.u(1));
  perform pg_temp.refuse(format('select proposer_creneaux_duel(%L, %L)', d, jsonb_build_array(jsonb_build_object('debut', now() + interval '20 days', 'fin', now() + interval '20 days 1 hour'))), 'pas plus de 14 jours à l''avance');
  r := proposer_creneaux_duel(d, jsonb_build_array(jsonb_build_object('debut', now() + interval '30 hours', 'fin', now() + interval '32 hours')));
  perform pg_temp.verifier(r->0->>'statut' = 'propose', 'le défi envoyé, programmé : plages proposées');
  perform pg_temp.en_tant_que(pg_temp.u(2));
  r := mes_creneaux_duels();
  perform pg_temp.verifier(jsonb_array_length(r) = 1, 'l''autre voit les créneaux');
  rdv := now() + interval '31 hours';
  r := choisir_creneau_duel(d, rdv);
  reset role;
  perform pg_temp.verifier((select accepte_le = rdv - interval '23 hours' and phase = 'attente' from duels where id = d), 'rendez-vous fixé : le défi est accepté, gardé jusqu''à 1 h après l''heure');
  perform pg_temp.verifier((select count(*) from notifications where joueur = pg_temp.u(1) and evenement = 'rdv_fixe') = 1, 'celui qui a proposé est prévenu');
  perform _nettoyer_rdv();
  perform pg_temp.verifier((select phase from duels where id = d) = 'attente', 'pas annulé avant l''heure');
  -- Les rappels, puis le ménage une heure après l'heure.
  update creneaux_duel set rdv = now() + interval '5 minutes' where duel_id = d;
  perform _rappels_rdv();
  perform pg_temp.verifier((select count(*) from notifications where evenement = 'rdv_rappel' and tournoi_id is null) = 2, 'rappel 10 minutes avant, aux deux joueurs');
  update duels set accepte_le = now() - interval '23 hours' - interval '61 minutes' where id = d;
  perform _nettoyer_rdv();
  perform pg_temp.verifier((select phase from duels where id = d) = 'annule', 'une heure après l''heure, sans match : annulé, sans vainqueur');
end $$;
reset role;
