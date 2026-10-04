-- Tests de supabase/etape-27-heads-up.sql : partie rapide amicale, Sit & Go à deux (heads-up) avec ou sans mise.
\set QUIET on
\echo Tests de la base de données (étape 27 : heads-up)

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
declare r jsonb; d public.duels; t public.tournois; s jsonb;
begin
  -- 1. Partie rapide « officielle » (sets de 11) : désormais amicale.
  perform pg_temp.en_tant_que(pg_temp.u(1)::text);
  perform chercher_partie('officiel', 0);
  perform pg_temp.en_tant_que(pg_temp.u(2)::text);
  r := chercher_partie('officiel', 0);
  execute 'reset role';
  d := jsonb_populate_record(null::public.duels, r -> 'duel');
  perform pg_temp.verifier(d.id is not null and d.points_par_set = 11 and d.sets_gagnants = 2 and not d.classe, 'partie rapide en sets de 11 : amicale');
  delete from duels where id = d.id;

  -- 2. Heads-up à 100 jetons entre deux humains : le tournoi part dès le 2e inscrit, un seul match.
  perform pg_temp.en_tant_que(pg_temp.u(3)::text);
  perform pg_temp.interdit('select rejoindre_sit_and_go(4, 100)', 'salle de 4 refusée');
  perform pg_temp.interdit('select rejoindre_sit_and_go(16, 100)', 'mise en salle de 16 refusée');
  perform rejoindre_sit_and_go(2, 100);
  s := salles_sit_and_go();
  perform pg_temp.verifier((select (x ->> 'inscrits')::int from jsonb_array_elements(s -> 'heads_up') x where (x ->> 'mise')::int = 100) = 1
    and (select (x ->> 'inscrits')::int from jsonb_array_elements(s -> 'salles_mise') x where (x ->> 'mise')::int = 100) = 0,
    'la salle heads-up à 100 est listée à part (1 inscrit), pas avec les salles de 8');
  perform pg_temp.en_tant_que(pg_temp.u(4)::text);
  r := rejoindre_sit_and_go(2, 100);
  execute 'reset role';
  select * into t from tournois where id = (r ->> 'id')::uuid;
  perform pg_temp.verifier(t.phase = 'en_cours' and t.taille = 2 and t.nb_tours = 1 and t.mise = 100, 'heads-up lancé : 2 joueurs, un seul tour');
  perform pg_temp.verifier(pg_temp.solde(3) = 900 and pg_temp.solde(4) = 900, 'chacun a payé 100');
  perform pg_temp.verifier((select count(*) from matchs_tournoi where tournoi_id = t.id) = 1, 'un seul match');

  -- 3. Le gagnant prend toute la cagnotte : 2 × 100 − 10 % = 180.
  delete from duels where tournoi_id = t.id;
  update matchs_tournoi set vainqueur = pg_temp.u(4), fin = 'score' where tournoi_id = t.id;
  update tournois set phase = 'termine', vainqueur = pg_temp.u(4), fini_le = now() where id = t.id;
  perform pg_temp.verifier(pg_temp.solde(4) = 900 + 180 and pg_temp.solde(3) = 900, format('le gagnant remporte 180, le perdant rien (soldes %s et %s)', pg_temp.solde(4), pg_temp.solde(3)));

  -- 4. Seul en heads-up depuis 3 minutes : un bot complète la salle ; s'il gagne, il ne touche rien.
  perform pg_temp.en_tant_que(pg_temp.u(5)::text);
  perform rejoindre_sit_and_go(2, 500);
  execute 'reset role';
  select t2.* into t from tournois t2 join inscrits_tournoi i on i.tournoi_id = t2.id where i.joueur = pg_temp.u(5) and t2.phase = 'inscriptions';
  update inscrits_tournoi set inscrit_le = now() - interval '3 minutes' where tournoi_id = t.id;
  perform _veille_tournois();
  select * into t from tournois where id = t.id;
  perform pg_temp.verifier(t.phase = 'en_cours' and (select count(*) from inscrits_tournoi i join bots_en_ligne b on b.joueur = i.joueur where i.tournoi_id = t.id) = 1,
    'seul depuis 3 minutes : un bot complète le heads-up');
  perform pg_temp.verifier((select b.elo from inscrits_tournoi i join bots_en_ligne b on b.joueur = i.joueur where i.tournoi_id = t.id) >= 1250, 'mise de 500 : un bot fort');
  delete from duels where tournoi_id = t.id;
  update matchs_tournoi set vainqueur = coalesce(case when j0 = pg_temp.u(5) then j1 else j0 end), fin = 'score' where tournoi_id = t.id;
  update tournois set phase = 'termine', vainqueur = (select joueur from inscrits_tournoi where tournoi_id = t.id and joueur <> pg_temp.u(5)), fini_le = now() where id = t.id;
  perform pg_temp.verifier(pg_temp.solde(5) = 500, 'battu par le bot : 500 perdus');
  perform pg_temp.verifier(not exists (select 1 from mouvements_jetons m join bots_en_ligne b on b.joueur = m.joueur), 'les bots ne gagnent jamais de jetons');

  -- 5. Heads-up sans mise : possible aussi.
  perform pg_temp.en_tant_que(pg_temp.u(6)::text);
  r := rejoindre_sit_and_go(2, 0);
  execute 'reset role';
  perform pg_temp.verifier((r ->> 'taille')::int = 2 and (r ->> 'mise')::int = 0, 'heads-up sans mise');
end $$;
