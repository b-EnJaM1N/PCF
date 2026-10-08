-- Tests de supabase/etape-24-bots-par-niveau.sql : 32 bots différents, choisis selon la mise, plus ou moins forts ;
-- un seul humain suffit ; les bots comptent dans la cagnotte, chacun est payé selon sa vraie place.
\set QUIET on
\echo Tests de la base de données (étape 24 : 32 bots, choisis selon la mise)

insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 4) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'Joueur' || i, 0 from generate_series(1, 4) i;

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
declare t public.tournois; k int; coups jsonb := '[]'; n int;
begin
  -- 1. Un bot par modèle, tous différents (32 à l'étape 24, 64 depuis l'étape 33).
  perform _assurer_bots(0);
  perform pg_temp.verifier((select count(*) from bots_en_ligne where actif) = (select count(*) from _modeles_bots()), 'un bot en service par modèle');
  perform pg_temp.verifier((select count(distinct modele) from bots_en_ligne where actif) = (select count(*) from _modeles_bots())
    and (select count(distinct p.pseudo) from bots_en_ligne b join profils p on p.id = b.joueur where b.actif) = (select count(*) from _modeles_bots()), 'aucun doublon (ni modèle, ni nom)');
  perform pg_temp.verifier(exists (select 1 from bots_en_ligne b join profils p on p.id = b.joueur where b.actif and p.pseudo = 'Glaçon 97 🤖' and b.elo = 1510 and b.favori = 1),
    'Glaçon 97 : Ciseaux, niveau 1 510 (les trois Ciseaux de 1997)');
  perform pg_temp.verifier(exists (select 1 from bots_en_ligne b join profils p on p.id = b.joueur where b.actif and p.pseudo = 'Flanby 🤖'), 'Flanby est là');
  -- Les anciens comptes de l'étape 21 (un deuxième « Rocky ») : gardés pour l'historique, mais plus choisis.
  insert into auth.users (id, email) values ('b0700000-0000-4000-8000-000000000999', 'bot-999@bots.handslam.fr');
  insert into profils (id, pseudo, numero, visible_recherche) values ('b0700000-0000-4000-8000-000000000999', 'Rocky 🤖', 1000, false);
  insert into bots_en_ligne (joueur, modele, favori, elo) values ('b0700000-0000-4000-8000-000000000999', 'rocky', 0, 850);
  perform _assurer_bots(0);
  perform pg_temp.verifier((select count(*) from bots_en_ligne where actif) = (select count(*) from _modeles_bots()) and (select count(*) from bots_en_ligne where modele = 'rocky' and actif) = 1,
    'un ancien doublon n''est plus choisi');

  -- 2. Un joueur seul dans un Sit & Go sans mise : au bout de 2 minutes, 7 bots complètent la salle.
  t := pg_temp.salle_seul(1, 8, 0);
  perform pg_temp.verifier(t.phase = 'en_cours' and (select count(*) from inscrits_tournoi where tournoi_id = t.id) = 8, 'seul dans une salle de 8 : 7 bots, la salle démarre');
  update tournois set phase = 'termine', fini_le = now() where id = t.id;

  -- 3. Mise de 50 : des bots faibles ; mise de 500 : des bots forts ; un tableau de 32 : 31 bots tous différents.
  t := pg_temp.salle_seul(2, 8, 50);
  perform pg_temp.verifier((select bool_and(b.elo <= 1100) from inscrits_tournoi i join bots_en_ligne b on b.joueur = i.joueur where i.tournoi_id = t.id), 'mise de 50 : 7 bots faibles (1 100 au plus)');
  update tournois set phase = 'annule', fini_le = now() where id = t.id;
  t := pg_temp.salle_seul(3, 8, 500);
  perform pg_temp.verifier((select bool_and(b.elo >= 1250) from inscrits_tournoi i join bots_en_ligne b on b.joueur = i.joueur where i.tournoi_id = t.id), 'mise de 500 : 7 bots forts (1 250 au moins)');
  update tournois set phase = 'annule', fini_le = now() where id = t.id;
  t := pg_temp.salle_seul(4, 32, 0);
  perform pg_temp.verifier((select count(distinct b.modele) from inscrits_tournoi i join bots_en_ligne b on b.joueur = i.joueur where i.tournoi_id = t.id) = 31,
    'seul dans une salle de 32 : 31 bots, tous différents');
  update tournois set phase = 'termine', fini_le = now() where id = t.id;

  -- 4. Contre un humain qui joue toujours Pierre : le plus fort le contre souvent (Feuille), le plus faible joue son favori.
  for k in 1 .. 6 loop coups := coups || jsonb_build_object('a', 0, 'b', 1); end loop;
  select count(*) into n from generate_series(1, 400) where _coup_bot((select joueur from bots_en_ligne where modele = 'boss' and actif), coups, 1::smallint) = 2;
  perform pg_temp.verifier(n > 400 * 0.55, format('Boss Final lit le joueur : Feuille %s fois sur 400 contre un joueur qui ne joue que Pierre', n));
  select count(*) into n from generate_series(1, 400) where _coup_bot((select joueur from bots_en_ligne where modele = 'rocky' and actif), coups, 1::smallint) = 0;
  perform pg_temp.verifier(n > 400 * 0.6, format('Rocky (faible) joue son favori, Pierre, %s fois sur 400', n));
  select count(*) into n from generate_series(1, 400) where _coup_bot((select joueur from bots_en_ligne where modele = 'rocky' and actif), coups, 1::smallint) = 2;
  perform pg_temp.verifier(n < 400 * 0.25, format('Rocky ne lit pas le joueur (Feuille %s fois sur 400)', n));

  -- 5. Solution A : un joueur seul à 50 jetons, qui gagne : la cagnotte compte les 8 entrées (8 × 50 − 10 % = 360).
  update jetons set solde = 1000 where joueur = pg_temp.u(1);
  t := pg_temp.salle_seul(1, 8, 50);
  perform pg_temp.verifier(pg_temp.solde(1) = 950, 'entrée de 50 payée');
  delete from duels where tournoi_id = t.id;
  update matchs_tournoi set vainqueur = coalesce(j0, j1), fin = 'score' where tournoi_id = t.id;
  update tournois set phase = 'termine', vainqueur = pg_temp.u(1), fini_le = now() where id = t.id;
  perform pg_temp.verifier(pg_temp.solde(1) > 950 + 200, format('le vainqueur touche la part du 1er d''une cagnotte de 360 (solde %s)', pg_temp.solde(1)));
  perform pg_temp.verifier(not exists (select 1 from mouvements_jetons m join bots_en_ligne b on b.joueur = m.joueur), 'les bots ne gagnent jamais de jetons');

  -- 6. Vraie place : seul à 50 jetons, éliminé au 1er tour par un bot : rien (avant, le « meilleur humain » prenait la part du 1er).
  update jetons set solde = 1000 where joueur = pg_temp.u(2);
  t := pg_temp.salle_seul(2, 8, 50);
  delete from duels where tournoi_id = t.id;
  update matchs_tournoi set vainqueur = case when j0 = pg_temp.u(2) then j1 when j1 = pg_temp.u(2) then j0 else j0 end, fin = 'score' where tournoi_id = t.id;
  -- (la suite du tableau, simulée : chaque bot encore en lice perd plus tard contre le vainqueur, sauf le vainqueur lui-même)
  insert into matchs_tournoi (tournoi_id, tour, position, j0, j1, vainqueur, fin)
  select t.id, 3, 100 + row_number() over (), v.joueur, x.joueur, v.joueur, 'score'
  from (select joueur from inscrits_tournoi where tournoi_id = t.id and joueur <> pg_temp.u(2) order by joueur limit 1) v,
       inscrits_tournoi x
  where x.tournoi_id = t.id and x.joueur not in (pg_temp.u(2), v.joueur)
    and not exists (select 1 from matchs_tournoi m where m.tournoi_id = t.id and x.joueur in (m.j0, m.j1) and m.vainqueur <> x.joueur);
  update tournois set phase = 'termine', vainqueur = (select joueur from inscrits_tournoi where tournoi_id = t.id and joueur <> pg_temp.u(2) order by joueur limit 1), fini_le = now() where id = t.id;
  perform pg_temp.verifier(pg_temp.solde(2) = 950, 'éliminé au 1er tour par un bot : pas de gain');
end $$;
