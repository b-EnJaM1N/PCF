-- Tests de supabase/etape-86-defi-programme.sql : le défi programmé, version complète.
\set QUIET on
\echo Tests de la base de données (étape 86 : défi programmé complet)

insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 2) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'Joueur' || i, 1000 + i from generate_series(1, 2) i;
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

insert into duels (id, j0, j1, points_par_set, sets_gagnants, phase) values
  ('44444444-4444-4444-4444-444444444444', pg_temp.u(1), pg_temp.u(2), 11, 2, 'attente'),
  ('55555555-5555-5555-5555-555555555555', pg_temp.u(1), pg_temp.u(2), 11, 2, 'attente');

do $$
declare r jsonb; d uuid := '44444444-4444-4444-4444-444444444444'; d2 uuid := '55555555-5555-5555-5555-555555555555'; x public.duels;
begin
  perform pg_temp.en_tant_que(pg_temp.u(1));
  r := proposer_creneaux_duel(d, jsonb_build_array(jsonb_build_object('debut', now() + interval '2 hours', 'fin', now() + interval '2 hours 15 minutes')));
  reset role;
  perform pg_temp.verifier((select plages is not null and ref_duel = d from notifications where joueur = pg_temp.u(2) and evenement = 'creneaux'), 'la notification porte l''horaire et le défi');
  perform pg_temp.en_tant_que(pg_temp.u(2));
  perform pg_temp.refuse(format('select repondre_duel(%L, true)', d), 'un défi programmé ne s''accepte pas sans horaire');
  r := choisir_creneau_duel(d, now() + interval '2 hours');
  perform pg_temp.refuse(format('select rendez_vous(%L)', d), 'pas de salle d''attente deux heures avant');
  reset role;
  update creneaux_duel set rdv = now() + interval '4 minutes' where duel_id = d;
  perform pg_temp.en_tant_que(pg_temp.u(2));
  x := rendez_vous(d);
  perform pg_temp.verifier(x.rdv1 is not null and x.phase = 'attente', '4 minutes avant : la salle d''attente est ouverte');
  -- Décliner refuse le défi.
  perform pg_temp.en_tant_que(pg_temp.u(1));
  r := proposer_creneaux_duel(d2, jsonb_build_array(jsonb_build_object('debut', now() + interval '1 hour', 'fin', now() + interval '3 hours')));
  perform pg_temp.en_tant_que(pg_temp.u(2));
  r := decliner_creneaux_duel(d2);
  reset role;
  perform pg_temp.verifier((select phase from duels where id = d2) = 'refuse', 'décliner refuse le défi');
end $$;
reset role;
