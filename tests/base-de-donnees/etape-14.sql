-- Tests de supabase/etape-14-mises.sql : défi avec mise, duel à mise en partie rapide, Sit & Go à mise.
\set QUIET on
\echo Tests de la base de données (étape 14 : mises en jetons)

insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 10) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'Joueur' || i, 0 from generate_series(1, 10) i;

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
-- (pas encore de portefeuille = les 1 000 jetons de bienvenue, versés au premier passage)
create or replace function pg_temp.solde(i int) returns int language sql security definer as $$ select coalesce((select solde from public.jetons where joueur = pg_temp.u(i)), 1000) $$;

do $$
declare d public.duels; r jsonb; t public.tournois; i int; a uuid := pg_temp.u(1); b uuid := pg_temp.u(2);
begin
  -- Défi avec mise : rien n'est prélevé tant qu'il n'est pas accepté.
  perform pg_temp.en_tant_que(a::text);
  perform pg_temp.interdit(format('select lancer_defi(%L, 11, 2, false, 75)', b), 'mise invalide refusée');
  perform pg_temp.interdit(format('select lancer_defi(%L, 11, 2, false, 5000)', b), 'mise plus grosse que le solde refusée');
  d := lancer_defi(b, 11, 2, false, 100);
  perform pg_temp.verifier(d.mise = 100 and d.phase = 'attente', 'défi avec mise de 100 lancé');
  execute 'reset role';
  perform pg_temp.verifier(pg_temp.solde(1) = 1000, 'rien de prélevé avant l''acceptation');
  perform pg_temp.en_tant_que(b::text);
  d := repondre_duel(d.id, false);
  execute 'reset role';
  perform pg_temp.verifier(pg_temp.solde(1) = 1000 and pg_temp.solde(2) = 1000, 'défi refusé : personne ne paie');

  perform pg_temp.en_tant_que(a::text);
  d := lancer_defi(b, 11, 2, false, 100);
  perform pg_temp.en_tant_que(b::text);
  d := repondre_duel(d.id, true);
  execute 'reset role';
  perform pg_temp.verifier(pg_temp.solde(1) = 1000 and pg_temp.solde(2) = 1000, 'défi accepté (rendez-vous) : rien de prélevé avant le vrai départ');
  perform pg_temp.en_tant_que(a::text);
  d := rendez_vous(d.id);
  execute 'reset role';
  perform pg_temp.verifier(pg_temp.solde(1) = 900 and pg_temp.solde(2) = 900 and d.mise_payee, 'défi accepté : chacun paie 100');
  perform pg_temp.en_tant_que(a::text);
  perform abandonner(d.id);
  execute 'reset role';
  perform pg_temp.verifier(pg_temp.solde(1) = 900 and pg_temp.solde(2) = 1080, 'abandon : le gagnant reçoit 180 (1,8 fois la mise)');
  update duels set phase = 'termine' where id = d.id;   -- une mise à jour de plus ne paie pas deux fois
  perform pg_temp.verifier(pg_temp.solde(2) = 1080, 'les gains ne sont versés qu''une fois');

  -- Défi sans mise : comme avant.
  perform pg_temp.en_tant_que(a::text);
  d := lancer_defi(b, 11, 2, true);
  perform pg_temp.verifier(d.mise = 0, 'défi sans mise');
  perform annuler_duel(d.id);

  -- Partie rapide : une file par mise.
  perform pg_temp.en_tant_que(pg_temp.u(3)::text);
  r := chercher_partie('eclair', 200);
  perform pg_temp.verifier(r ? 'attente', 'le joueur 3 attend dans la file à 200');
  perform pg_temp.en_tant_que(pg_temp.u(4)::text);
  r := chercher_partie('eclair', 100);
  perform pg_temp.verifier(r ? 'attente', 'le joueur 4 attend dans la file à 100 (pas de mélange)');
  r := file_partie_rapide();
  perform pg_temp.verifier((r->'mises'->>'eclair_200')::int = 1, 'on voit qu''un joueur attend à 200');
  perform quitter_partie();
  perform pg_temp.en_tant_que(pg_temp.u(5)::text);
  r := chercher_partie('eclair', 200);
  perform pg_temp.verifier(r ? 'duel' and (r->'duel'->>'mise')::int = 200, 'le joueur 5 affronte le joueur 3, mise de 200');
  execute 'reset role';
  perform pg_temp.verifier(pg_temp.solde(3) = 800 and pg_temp.solde(5) = 800, 'les deux mises sont prélevées au départ');
  update duels set phase = 'annule' where id = (r->'duel'->>'id')::uuid;
  perform pg_temp.verifier(pg_temp.solde(3) = 1000 and pg_temp.solde(5) = 1000, 'partie annulée : chacun est remboursé');

  -- Sit & Go à mise : entrée payée à l'inscription, rendue si on quitte avant le départ.
  perform pg_temp.en_tant_que(pg_temp.u(1)::text);
  -- (depuis l'étape 28, les Sit & Go à mise se jouent dans toutes les tailles : voir etape-28.sql)
  r := rejoindre_sit_and_go(8, 50);
  execute 'reset role';
  perform pg_temp.verifier(pg_temp.solde(1) = 850, 'entrée de 50 payée à l''inscription');
  perform pg_temp.en_tant_que(pg_temp.u(1)::text);
  perform quitter_sit_and_go();
  execute 'reset role';
  perform pg_temp.verifier(pg_temp.solde(1) = 900, 'entrée rendue en quittant la salle');
  r := null;
  for i in 1 .. 8 loop
    perform pg_temp.en_tant_que(pg_temp.u(i)::text);
    r := rejoindre_sit_and_go(8, 50);
  end loop;
  execute 'reset role';
  select * into t from tournois where id = (r->>'id')::uuid;
  perform pg_temp.verifier(t.phase = 'en_cours' and t.mise = 50, 'salle pleine : le Sit & Go à 50 démarre');
  perform pg_temp.verifier((select count(*) from tournois where mode = 'direct' and mise = 0 and phase = 'en_cours') = 0, 'les salles sans mise ne sont pas touchées');

  -- Fin simulée : le joueur 1 gagne la finale contre le 2 ; les 3 et 4 perdent en demi-finale.
  delete from matchs_tournoi where tournoi_id = t.id and tour > 1;
  insert into matchs_tournoi (tournoi_id, tour, position, j0, j1, vainqueur, fin) values
    (t.id, 2, 1, pg_temp.u(1), pg_temp.u(3), pg_temp.u(1), 'score'),
    (t.id, 2, 2, pg_temp.u(2), pg_temp.u(4), pg_temp.u(2), 'score'),
    (t.id, 3, 1, pg_temp.u(1), pg_temp.u(2), pg_temp.u(1), 'score');
  update tournois set phase = 'termine', vainqueur = pg_temp.u(1) where id = t.id;
  -- cagnotte : 8 × 50 = 400, moins 10 % = 360 → 180, 108, 36, 36
  perform pg_temp.verifier(pg_temp.solde(1) = 900 - 50 + 234, '1er : 234 jetons (65 % de 360, étape 20)');
  perform pg_temp.verifier(pg_temp.solde(2) = 1080 - 50 + 126, '2e : 126 jetons (35 %)');
  perform pg_temp.verifier(pg_temp.solde(3) = 1000 - 50 and pg_temp.solde(4) = 1000 - 50, 'demi-finalistes : pas payés (façon poker)');
  perform pg_temp.verifier(pg_temp.solde(6) = 950, 'éliminé au 1er tour : l''entrée est perdue');
end $$;
