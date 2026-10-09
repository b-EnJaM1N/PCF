-- Tests de supabase/etape-37-rendez-vous.sql : accepter un défi donne rendez-vous ; le match démarre quand les deux sont là.
\set QUIET on
\echo Tests de la base de données (étape 37 : rendez-vous des défis)

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
create or replace function pg_temp.phase(d uuid) returns text language sql as $$ select phase from duels where id = d $$;

do $$
declare d public.duels; l public.duels; code text;
begin
  -- 1. Joueur 1 défie joueur 2 (avec une mise), puis s'en va. Joueur 2 accepte : rendez-vous, rien ne démarre.
  execute 'reset role';
  insert into jetons (joueur, solde) values (pg_temp.j(1), 1000), (pg_temp.j(2), 1000) on conflict (joueur) do update set solde = 1000;
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  d := lancer_defi(pg_temp.j(2), 11, 2, true, 100);
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  perform pg_temp.interdit(format('select annuler_duel(%L)', d.id), 'avant d''accepter, l''invité ne peut pas annuler (il refuse)');
  d := repondre_duel(d.id, true);
  perform pg_temp.verifier(d.phase = 'attente' and d.accepte_le is not null and d.rdv1 is not null and d.rdv0 is null, 'accepté : rendez-vous, le match n''a pas commencé');
  execute 'reset role';
  perform pg_temp.verifier((select count(*) = 1 from notifications where evenement = 'accepte' and joueur = pg_temp.j(1) and duel_id = d.id), 'joueur 1 est prévenu : son défi est accepté');
  perform pg_temp.verifier((select solde from jetons where joueur = pg_temp.j(1)) = 1000 and (select solde from jetons where joueur = pg_temp.j(2)) = 1000, 'pas de mise prélevée avant le vrai départ');
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  perform pg_temp.interdit(format('select repondre_duel(%L, true)', d.id), 'on n''accepte pas deux fois');
  -- Joueur 2 attend un moment dans la salle, puis s'en va.
  d := rendez_vous(d.id);
  perform pg_temp.verifier(d.phase = 'attente', 'seul dans la salle d''attente : on attend');
  execute 'reset role';
  update duels set rdv1 = now() - interval '5 minutes' where id = d.id;
  -- Joueur 1 revient : joueur 2 n'est plus là, on l'attend (pas de forfait).
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  d := rendez_vous(d.id);
  perform pg_temp.verifier(d.phase = 'attente' and d.rdv0 is not null, 'joueur 2 parti : joueur 1 attend à son tour');
  -- Joueur 2 revient : les deux sont là, le match commence (et les mises sont prélevées).
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  d := rendez_vous(d.id);
  perform pg_temp.verifier(d.phase = 'presentation' and d.mise_payee, 'les deux sont là : le match commence');
  execute 'reset role';
  perform pg_temp.verifier((select solde from jetons where joueur = pg_temp.j(1)) = 900, 'mise prélevée au départ');
  perform pg_temp.verifier((select count(*) = 1 from notifications where evenement = 'accepte' and duel_id = d.id), 'pas de deuxième notification au départ');
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  perform pg_temp.verifier((rendez_vous(d.id)).phase = 'presentation', 'rendez_vous sur un match commencé : rien ne change');

  -- 2. Un tiers n'a rien à faire là.
  perform pg_temp.en_tant_que(pg_temp.j(3)::text);
  perform pg_temp.interdit(format('select rendez_vous(%L)', d.id), 'un tiers ne rejoint pas le rendez-vous');

  -- 3. Rendez-vous jamais honoré : annulé au bout de 24 heures, sans vainqueur.
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  d := lancer_defi(pg_temp.j(2), 11, 2);
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  d := repondre_duel(d.id, true);
  execute 'reset role';
  update duels set accepte_le = now() - interval '25 hours' where id = d.id;
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  d := rendez_vous(d.id);
  perform pg_temp.verifier(d.phase = 'annule' and d.vainqueur is null, '24 heures sans se retrouver : annulé, sans vainqueur');
  -- Le ménage du minuteur fait pareil.
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  d := lancer_defi(pg_temp.j(2), 11, 2);
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  d := repondre_duel(d.id, true);
  execute 'reset role';
  update duels set accepte_le = now() - interval '25 hours' where id = d.id;
  perform _nettoyer_rdv();
  perform pg_temp.verifier(pg_temp.phase(d.id) = 'annule', 'le ménage annule les vieux rendez-vous');

  -- 4. Une fois accepté, l'un ou l'autre peut annuler le rendez-vous.
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  d := lancer_defi(pg_temp.j(2), 11, 2);
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  perform repondre_duel(d.id, true);
  d := annuler_duel(d.id);
  perform pg_temp.verifier(d.phase = 'annule', 'celui qui a accepté peut annuler le rendez-vous');

  -- 5. Défi par lien : même rendez-vous.
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  l := creer_duel(null, 11, 2);
  execute 'reset role';
  select duels.code into code from duels where id = l.id;
  perform pg_temp.en_tant_que(pg_temp.j(3)::text);
  l := rejoindre_duel(code);
  perform pg_temp.verifier(l.phase = 'attente' and l.j1 = pg_temp.j(3) and l.accepte_le is not null, 'lien rejoint : rendez-vous');
  perform pg_temp.verifier((rejoindre_duel(code)).phase = 'attente', 'rouvrir le lien : on reste dans la salle d''attente');
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  perform pg_temp.verifier((rendez_vous(l.id)).phase = 'presentation', 'le créateur du lien arrive : le match commence');
end $$;
