-- Tests de supabase/etape-15-freeroll.sql : freeroll de 20 h, défis du jour, classement du mois.
\set QUIET on
\echo Tests de la base de données (étape 15 : freeroll, défis, classement)

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
create or replace function pg_temp.interdit(sql text, msg text) returns void language plpgsql as $$
begin
  begin execute sql; exception when others then raise notice 'ok : %', msg; return; end;
  raise exception 'ÉCHEC : accepté alors que ça devait être refusé : %', msg;
end $$;
create or replace function pg_temp.solde(i int) returns int language sql security definer as $$ select coalesce((select solde from public.jetons where joueur = pg_temp.u(i)), 1000) $$;

do $$
declare r jsonb; t public.tournois; i int; d text; avant int;
begin
  -- Le freeroll du jour existe, gratuit, à 20 h.
  perform pg_temp.en_tant_que(pg_temp.u(1)::text);
  r := freeroll_du_jour();
  perform pg_temp.verifier(r->>'phase' = 'inscriptions' and (r->>'mise')::int = 0 and (r->>'cagnotte')::int = 1000, 'freeroll du jour : inscriptions, cagnotte de départ 1 000');
  if now() < _heure_freeroll(_aujourdhui()) then
    r := inscrire_freeroll();
    perform pg_temp.verifier((r->>'inscrit')::boolean and (r->>'cagnotte')::int = 1050, 'inscription : +50 à la cagnotte');
    r := desinscrire_freeroll();
    perform pg_temp.verifier(not (r->>'inscrit')::boolean, 'désinscription');
  end if;
  -- L'inscrit au freeroll n'est pas « en salle » de Sit & Go.
  execute 'reset role';
  select * into t from tournois where freeroll = _aujourdhui();
  insert into inscrits_tournoi (tournoi_id, joueur, vu) select t.id, pg_temp.u(k), now() from generate_series(1, 5) k;
  perform pg_temp.en_tant_que(pg_temp.u(1)::text);
  perform pg_temp.verifier((salles_sit_and_go()->'mien') = 'null'::jsonb, 'un inscrit au freeroll peut encore jouer un Sit & Go');

  -- 20 h passées (on recule le freeroll d'un jour) : 4 présents, 1 absent retiré.
  execute 'reset role';
  update tournois set freeroll = _aujourdhui() - 1 where id = t.id;
  update inscrits_tournoi set vu = _heure_freeroll(_aujourdhui() - 1) - interval '1 hour' where tournoi_id = t.id and joueur = pg_temp.u(5);
  update inscrits_tournoi set vu = _heure_freeroll(_aujourdhui() - 1) - interval '10 seconds' where tournoi_id = t.id and joueur <> pg_temp.u(5);
  perform _lancer_freeroll(t.id);
  select * into t from tournois where id = t.id;
  perform pg_temp.verifier(t.phase = 'en_cours' and t.taille = 4 and t.nb_tours = 2, 'départ à 4 joueurs, tableau de 4');
  perform pg_temp.verifier((select count(*) from inscrits_tournoi where tournoi_id = t.id) = 4, 'l''absent est retiré');
  perform pg_temp.verifier((select count(*) from duels where tournoi_id = t.id and phase = 'presentation' and classe) = 2, 'les deux demi-finales officielles sont lancées');

  -- Fin simulée : 1 bat 2 en finale ; 3 et 4 perdent en demi-finale. Cagnotte : 1 000 + 4 × 50 = 1 200.
  delete from matchs_tournoi where tournoi_id = t.id;
  insert into matchs_tournoi (tournoi_id, tour, position, j0, j1, vainqueur, fin) values
    (t.id, 1, 1, pg_temp.u(1), pg_temp.u(4), pg_temp.u(1), 'score'),
    (t.id, 1, 2, pg_temp.u(2), pg_temp.u(3), pg_temp.u(2), 'score'),
    (t.id, 2, 1, pg_temp.u(1), pg_temp.u(2), pg_temp.u(1), 'score');
  update tournois set phase = 'termine', vainqueur = pg_temp.u(1) where id = t.id;
  perform pg_temp.verifier(pg_temp.solde(1) = 1600 and pg_temp.solde(2) = 1360 and pg_temp.solde(3) = 1120 and pg_temp.solde(4) = 1120, 'gains : 600, 360, 120, 120');

  -- Moins de 4 présents : annulé.
  insert into tournois (nom, points_par_set, sets_gagnants, duree_tour, mode, taille, freeroll) values ('Freeroll', 11, 2, '1 hour', 'direct', 64, _aujourdhui() - 2) returning * into t;
  insert into inscrits_tournoi (tournoi_id, joueur, vu) select t.id, pg_temp.u(k), _heure_freeroll(_aujourdhui() - 2) from generate_series(1, 3) k;
  perform _lancer_freeroll(t.id);
  perform pg_temp.verifier((select phase from tournois where id = t.id) = 'annule', 'moins de 4 joueurs : freeroll annulé');

  -- Défis du jour : 3, les mêmes pour tous.
  perform pg_temp.en_tant_que(pg_temp.u(6)::text);
  r := defis_du_jour();
  perform pg_temp.verifier(jsonb_array_length(r) = 3, '3 défis par jour');
  perform pg_temp.en_tant_que(pg_temp.u(5)::text);
  perform pg_temp.verifier(defis_du_jour() = r, 'les mêmes pour tout le monde');
  perform pg_temp.en_tant_que(pg_temp.u(6)::text);
  perform pg_temp.interdit('select valider_defi(''inexistant'')', 'défi hors programme refusé');
  select x->>'id' into d from jsonb_array_elements(r) x where x->>'id' not in ('duel_en_ligne', 'freeroll') limit 1;
  avant := pg_temp.solde(6);
  r := valider_defi(d);
  perform pg_temp.verifier((r->>'gagne')::int > 0 and (r->>'solde')::int = avant + (r->>'gagne')::int, 'défi encaissé');
  perform pg_temp.interdit(format('select valider_defi(%L)', d), 'un défi ne s''encaisse qu''une fois');
  execute 'reset role';
  perform pg_temp.verifier((select count(*) from defis_reussis where joueur = pg_temp.u(6)) = 1, 'défi noté');

  -- Classement du mois : bénéfice des jeux (les gains du freeroll comptent, pas les bonus ni les défis).
  perform pg_temp.en_tant_que(pg_temp.u(2)::text);
  r := classement_mois();
  perform pg_temp.verifier((r->'top'->0->>'id')::uuid = pg_temp.u(1) and (r->'top'->0->>'benefice')::int = 600, 'le vainqueur du freeroll est 1er avec 600');
  perform pg_temp.verifier((r->'moi'->>'rang')::int = 2, 'le finaliste est 2e');
  perform pg_temp.en_tant_que(pg_temp.u(6)::text);
  perform pg_temp.verifier(classement_mois()->'moi' = 'null'::jsonb, 'les défis ne comptent pas au classement');
  execute 'reset role';
end $$;
