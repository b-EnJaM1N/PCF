-- Tests de supabase/etape-6-sit-and-go.sql : salle, départ quand c'est plein, matchs enchaînés, absents.
\set QUIET on
-- Tirage sans hasard (étape 23) : ces tests vérifient des affiches précises.
select set_config('pcf.tirage_fixe', '1', false) \g /dev/null
\echo Tests de la base de données (étape 6 : Sit & Go)

insert into auth.users select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'j' || i || '@x.fr' from generate_series(1, 9) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'Joueur' || i, 0 from generate_series(1, 9) i;
-- Niveaux : le joueur 1 est le meilleur, le joueur 8 le moins bon.
insert into classements (joueur, points) select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 1400 - i * 20 from generate_series(1, 8) i;

create or replace function pg_temp.j(i int) returns text language sql as $$ select '00000000-0000-0000-0000-00000000000' || i $$;
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
-- Le duel du match entre les joueurs x et y (lu en administrateur).
create or replace function pg_temp.duel(x int, y int) returns uuid language plpgsql as $$
declare r uuid;
begin
  execute 'reset role';
  select m.duel_id into r from matchs_tournoi m where m.fin is null and pg_temp.j(x)::uuid in (m.j0, m.j1) and pg_temp.j(y)::uuid in (m.j0, m.j1);
  return r;
end $$;
-- Les deux joueurs arrivent, puis g gagne 2 sets à 0 (Pierre contre Ciseaux).
create or replace function pg_temp.gagner(d uuid, g int, p int) returns void language plpgsql as $$
declare m int;
begin
  perform pg_temp.en_tant_que(pg_temp.j(g)); perform reclamer(d); perform pret(d);
  perform pg_temp.en_tant_que(pg_temp.j(p)); perform reclamer(d); perform pret(d);
  loop
    perform pg_temp.en_tant_que(pg_temp.j(g));
    if (select phase from duels where id = d) = 'entre_sets' then
      perform pret(d); perform pg_temp.en_tant_que(pg_temp.j(p)); perform pret(d); perform pg_temp.en_tant_que(pg_temp.j(g));
    end if;
    exit when (select phase from duels where id = d) = 'termine';
    m := (select manche from duels where id = d);
    perform jouer(d, m, 0);
    perform pg_temp.en_tant_que(pg_temp.j(p)); perform jouer(d, m, 1);
  end loop;
end $$;
create temp table t (cle text primary key, val text);
grant all on t to public;
create or replace function pg_temp.v(k text) returns text language sql as $$ select val from t where cle = k $$;

-- 1. La salle de 8 se remplit
select pg_temp.en_tant_que(pg_temp.j(1));
select pg_temp.interdit('select rejoindre_sit_and_go(12)', 'taille de tournoi invalide refusée');
insert into t select 'sng', rejoindre_sit_and_go(8)->>'id';
select pg_temp.verifier((select (salles_sit_and_go()->'salles'->0->>'inscrits')::int = 1 and salles_sit_and_go()->'mien'->>'phase' = 'inscriptions'), 'premier inscrit dans la salle de 8');
select pg_temp.interdit('select rejoindre_sit_and_go(16)', 'un seul Sit & Go à la fois');
select pg_temp.interdit('select * from tournois', 'la table des tournois reste illisible directement');
do $$ begin for i in 2 .. 7 loop perform pg_temp.en_tant_que(pg_temp.j(i)); perform rejoindre_sit_and_go(8); end loop; end $$;
select pg_temp.verifier((select (salles_sit_and_go()->'salles'->0->>'inscrits')::int = 7), '7 inscrits sur 8');
-- Le joueur 7 ferme l'application : il est retiré de la salle
reset role; update inscrits_tournoi set vu = now() - interval '4 minutes' where joueur = pg_temp.j(7)::uuid;
select pg_temp.en_tant_que(pg_temp.j(1)); select presence_sit_and_go();
select pg_temp.verifier((select (salles_sit_and_go()->'salles'->0->>'inscrits')::int = 6), 'un inscrit sans signe de vie est retiré de la salle');
select pg_temp.en_tant_que(pg_temp.j(9)); select rejoindre_sit_and_go(8); select quitter_sit_and_go();
select pg_temp.verifier((select (salles_sit_and_go()->'salles'->0->>'inscrits')::int = 6 and salles_sit_and_go()->'mien' = 'null'::jsonb), 'on peut quitter la salle avant le départ');
select pg_temp.en_tant_que(pg_temp.j(7)); select rejoindre_sit_and_go(8);

-- 2. Le 8e arrive : départ immédiat
select pg_temp.en_tant_que(pg_temp.j(8));
select pg_temp.verifier((select rejoindre_sit_and_go(8)->>'phase' = 'en_cours'), 'salle pleine : le tournoi démarre tout de suite');
reset role;
select pg_temp.verifier((select count(*) = 4 from matchs_tournoi m join duels d on d.id = m.duel_id
  where m.tournoi_id = pg_temp.v('sng')::uuid and d.phase = 'presentation' and d.classe and d.echeance > now() + interval '50 seconds'),
  '4 matchs lancés d''office, officiels, 60 secondes pour arriver');
select pg_temp.verifier((select count(*) = 1 from matchs_tournoi where tournoi_id = pg_temp.v('sng')::uuid
  and j0 = pg_temp.j(1)::uuid and j1 = pg_temp.j(8)::uuid), 'têtes de série : 1 contre 8');
select pg_temp.en_tant_que(pg_temp.j(9));
select pg_temp.verifier((select voir_tournoi(pg_temp.v('sng')::uuid)->>'mode' = 'direct'), 'un Sit & Go est public : tout le monde peut le suivre');
select pg_temp.verifier((select (salles_sit_and_go()->'salles'->0->>'inscrits')::int = 0), 'une nouvelle salle de 8 s''ouvre');

-- 3. Les matchs s'enchaînent sans attendre la fin du tour
select pg_temp.gagner(pg_temp.duel(1, 8), 1, 8);
select pg_temp.gagner(pg_temp.duel(4, 5), 4, 5);
reset role;
select pg_temp.verifier((select count(*) = 1 from matchs_tournoi m join duels d on d.id = m.duel_id where m.tournoi_id = pg_temp.v('sng')::uuid
  and m.tour = 2 and m.j0 = pg_temp.j(1)::uuid and m.j1 = pg_temp.j(4)::uuid and d.phase = 'presentation'),
  'Joueur1 et Joueur4 ont fini : leur demi-finale démarre, sans attendre les autres');
select pg_temp.verifier((select tour = 2 and phase = 'en_cours' from tournois where id = pg_temp.v('sng')::uuid), 'le tournoi continue');
select pg_temp.en_tant_que(pg_temp.j(8));
select pg_temp.verifier((select salles_sit_and_go()->'mien' = 'null'::jsonb), 'un éliminé peut rejoindre un autre Sit & Go');
select pg_temp.verifier((select (salles_sit_and_go()->'dernier'->>'elimine')::boolean), 'l''éliminé voit toujours son dernier Sit & Go');

-- 4. Absents
-- Joueur2 arrive, Joueur7 non : après 60 secondes, Joueur2 gagne par forfait.
select pg_temp.en_tant_que(pg_temp.j(2)); select reclamer(pg_temp.duel(2, 7));
insert into t select 'd27', pg_temp.duel(2, 7);
reset role; update duels set echeance = now() - interval '1 second' where id = pg_temp.v('d27')::uuid;
select pg_temp.en_tant_que(pg_temp.j(2)); select reclamer(pg_temp.v('d27')::uuid);
reset role;
select pg_temp.verifier((select phase = 'termine' and fin = 'forfait' and (vainqueur = 0) = (j0 = pg_temp.j(2)::uuid) from duels where id = pg_temp.v('d27')::uuid),
  'adversaire jamais arrivé : victoire par forfait');
-- Ni Joueur3 ni Joueur6 ne viennent : la meilleure tête de série passe.
insert into t select 'd36', pg_temp.duel(3, 6);
reset role; update duels set echeance = now() - interval '10 seconds' where id = pg_temp.v('d36')::uuid;
select pg_temp.en_tant_que(pg_temp.j(9)); select voir_tournoi(pg_temp.v('sng')::uuid);
reset role;
select pg_temp.verifier((select m.fin = 'tete_de_serie' and m.vainqueur = pg_temp.j(3)::uuid and d.phase = 'annule'
  from matchs_tournoi m join duels d on d.id = m.duel_id where d.id = pg_temp.v('d36')::uuid), 'personne n''est venu : la meilleure tête de série passe');

-- 5. Demi-finales et finale
select pg_temp.gagner(pg_temp.duel(1, 4), 1, 4);
select pg_temp.gagner(pg_temp.duel(2, 3), 3, 2);
select pg_temp.gagner(pg_temp.duel(1, 3), 3, 1);
reset role;
select pg_temp.verifier((select phase = 'termine' and vainqueur = pg_temp.j(3)::uuid from tournois where id = pg_temp.v('sng')::uuid), 'Joueur3 remporte le Sit & Go');
select pg_temp.verifier((select points > 1340 from classements where joueur = pg_temp.j(3)::uuid), 'les matchs ont compté pour le niveau officiel');
select pg_temp.en_tant_que('');
select pg_temp.interdit('select salles_sit_and_go()', 'les visiteurs ne voient pas les salles');
reset role;
\echo 'Tous les tests des Sit & Go sont passés.'
