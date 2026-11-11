-- Tests de supabase/etape-66-championnat-poules-playoffs.sql : poules, playoffs, playouts, formats et calendrier.
\set QUIET on
\echo Tests de la base de données (étape 66 : championnat avec poules et playoffs)

-- 12 joueurs, J1 le mieux classé (niveau officiel 2000), J12 le moins bien (900).
insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 12) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'J' || i, 0 from generate_series(1, 12) i;
insert into classements (joueur, points) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 2100 - 100 * i from generate_series(1, 12) i;

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
create or replace function pg_temp.j(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid $$;
create or replace function pg_temp.num(u uuid) returns int language sql as $$ select right(u::text, 2)::int $$;
create temp table t (cle text primary key, val text);
grant all on t to public;
create or replace function pg_temp.v(k text) returns text language sql as $$ select val from t where cle = k $$;
-- Un championnat de n joueurs (J1 à Jn) créé par J1, avec ses options ; lancé.
create or replace function pg_temp.championnat(n int, opts jsonb, enjeu text default null, hebdo boolean default false) returns uuid language plpgsql as $$
declare tid uuid; i int;
begin
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  tid := (creer_championnat('Ligue', pg_temp.v('cercle')::uuid, 1, 1, 7, false, enjeu, hebdo, opts)->>'id')::uuid;
  for i in 2 .. n loop perform pg_temp.en_tant_que(pg_temp.j(i)::text); perform inscrire_tournoi(tid); end loop;
  execute 'reset role';
  perform _lancer_championnat(tid);
  return tid;
end $$;
-- La saison : chaque match de poule gagné par le mieux classé (Ji bat Jk si i < k).
create or replace function pg_temp.saison(tid uuid) returns void language plpgsql as $$
begin
  execute 'reset role';
  update matchs_tournoi set vainqueur = case when pg_temp.num(j0) < pg_temp.num(j1) then j0 else j1 end, fin = 'score'
  where tournoi_id = tid and tour = 1 and fin is null;
  perform _avancer_championnat(tid);
end $$;
-- Un match de l'élimination directe entre Ja et Jb, gagné par Ja.
create or replace function pg_temp.gagne(tid uuid, a int, b int) returns void language plpgsql as $$
begin
  execute 'reset role';
  update matchs_tournoi set vainqueur = pg_temp.j(a), fin = 'score'
  where tournoi_id = tid and fin is null and pg_temp.j(a) in (j0, j1) and pg_temp.j(b) in (j0, j1);
  if not found then raise exception 'ÉCHEC : pas de match J% – J% à jouer', a, b; end if;
  perform _avancer_championnat(tid);
end $$;
-- Les matchs (non décidés) du tour en cours : « J3-J6, J4-J5 » (j0 en premier).
create or replace function pg_temp.affiches(tid uuid, ph text default 'playoff') returns text language sql as $$
  select string_agg('J' || pg_temp.num(j0) || '-J' || pg_temp.num(j1), ', ' order by position) from matchs_tournoi m
  where tournoi_id = tid and phase = ph and fin is null and tour = (select tour from tournois where id = tid)
$$;
create or replace function pg_temp.tournoi(tid uuid) returns public.tournois language sql as $$ select * from tournois where id = tid $$;

-- (le temps des tests : J1 organise plus de 5 championnats à la fois ; remis à 5 à la fin)
create or replace function public._limite_tournois() returns int language sql immutable as $$ select 100 $$;

-- Un cercle de 12 (J1 responsable)
select pg_temp.en_tant_que(pg_temp.j(1)::text);
insert into t select 'cercle', creer_cercle('Le Club', '{}')->>'id';
reset role; insert into t select 'code', code from cercles where id = pg_temp.v('cercle')::uuid;
do $$ begin for i in 2 .. 12 loop perform pg_temp.en_tant_que(pg_temp.j(i)::text); perform rejoindre_cercle(pg_temp.v('code')); end loop; end $$;

-- 1. Les réglages
select pg_temp.en_tant_que(pg_temp.j(1)::text);
select pg_temp.interdit(format('select creer_championnat(''L'', %L, 7, 1, 7, false, null, false, ''{"poules": 5}'')', pg_temp.v('cercle')), 'pas plus de 4 poules');
select pg_temp.interdit(format('select creer_championnat(''L'', %L, 7, 1, 7, false, null, false, ''{"playoffs": true, "fin_sets": 4}'')', pg_temp.v('cercle')), 'un format de finale impossible est refusé');
insert into t select 'p2', creer_championnat('Deux poules', pg_temp.v('cercle')::uuid, 7, 1, 7, true, null, false, '{"poules": 2}')->>'id';
reset role;
select pg_temp.verifier((select playoffs and not aller_retour and nb_poules = 2 from tournois where id = pg_temp.v('p2')::uuid), 'avec des poules : playoffs obligatoires, aller simple');
-- 20 joueurs au plus avec 2 poules (10 par poule) : le 11e inscrit d'un championnat à une poule est refusé.
do $$ declare tid uuid; begin
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  tid := (creer_championnat('Une poule', pg_temp.v('cercle')::uuid, 7, 1, 7)->>'id')::uuid;
  for i in 2 .. 10 loop perform pg_temp.en_tant_que(pg_temp.j(i)::text); perform inscrire_tournoi(tid); end loop;
  insert into t values ('p1', tid::text);
end $$;
select pg_temp.en_tant_que(pg_temp.j(11)::text);
select pg_temp.interdit(format('select inscrire_tournoi(%L)', pg_temp.v('p1')), 'une poule : 10 joueurs au plus');
select inscrire_tournoi(pg_temp.v('p2')::uuid);
select pg_temp.verifier(true, 'deux poules : le 2e inscrit passe (20 au plus)');
reset role; delete from tournois where id in (pg_temp.v('p1')::uuid, pg_temp.v('p2')::uuid);

-- 2. Une poule de 6, façon Top 14, avec enjeu : barrages, demies, finale (formats au choix)
reset role;
insert into t select 'top14', pg_temp.championnat(6, '{"playoffs": true, "ko_points": 7, "ko_sets": 1, "fin_points": 11, "fin_sets": 2}', 'Le dernier paie les croissants');
select pg_temp.verifier((select playoffs and nb_tours = 4 and echeance < fin_prevue and fin_prevue - lance_le >= interval '10 days'
  from pg_temp.tournoi(pg_temp.v('top14')::uuid)), '3 tours d''élimination directe : 10 jours au moins, la saison d''abord');
select pg_temp.saison(pg_temp.v('top14')::uuid);
select pg_temp.verifier((select tour = 2 and premier_saison = pg_temp.j(1) and dernier = pg_temp.j(6) from pg_temp.tournoi(pg_temp.v('top14')::uuid)),
  'saison finie : 1er de la saison J1 ; à 6, tout le monde est qualifié : le dernier de la saison s''y colle');
select pg_temp.verifier(pg_temp.affiches(pg_temp.v('top14')::uuid) = 'J3-J6, J4-J5', 'barrages 3e-6e et 4e-5e');
select pg_temp.verifier((select bool_and(points_par_set = 7 and sets_gagnants = 1) from matchs_tournoi where tournoi_id = pg_temp.v('top14')::uuid and tour = 2),
  'le format de l''élimination directe');
select pg_temp.gagne(pg_temp.v('top14')::uuid, 6, 3);
select pg_temp.gagne(pg_temp.v('top14')::uuid, 4, 5);
select pg_temp.verifier(pg_temp.affiches(pg_temp.v('top14')::uuid) = 'J1-J4, J2-J6', 'demies : le 1er contre le vainqueur de 4-5, le 2e contre celui de 3-6');
select pg_temp.gagne(pg_temp.v('top14')::uuid, 1, 4);
select pg_temp.gagne(pg_temp.v('top14')::uuid, 6, 2);
select pg_temp.verifier(pg_temp.affiches(pg_temp.v('top14')::uuid) = 'J1-J6', 'la finale');
-- La finale se joue avec son format.
insert into t select 'finale', id from matchs_tournoi where tournoi_id = pg_temp.v('top14')::uuid and etape = 'Finale';
select pg_temp.en_tant_que(pg_temp.j(6)::text);
select pg_temp.verifier((select points_par_set = 11 and sets_gagnants = 2 from jouer_match_tournoi(pg_temp.v('finale')::uuid)),
  'la finale : le format de la finale (11 points, 2 sets gagnants)');
select pg_temp.gagne(pg_temp.v('top14')::uuid, 6, 1);
select pg_temp.verifier((select phase = 'termine' and vainqueur = pg_temp.j(6) and premier_saison = pg_temp.j(1) from pg_temp.tournoi(pg_temp.v('top14')::uuid)),
  'le champion : le vainqueur de la finale (J6, 6e de la saison !)');
select pg_temp.en_tant_que(pg_temp.j(2)::text);
select pg_temp.verifier((select x->'vainqueur'->>'pseudo' = 'J6' and x->'premier_saison'->>'pseudo' = 'J1' and x->'dernier'->>'pseudo' = 'J6'
  and jsonb_array_length(x->'matchs') = 15 + 5 from voir_tournoi(pg_temp.v('top14')::uuid) x), 'ce que voit l''appli : champion, 1er de la saison, celui qui s''y colle');
reset role;

-- 3. Une poule de 8 avec enjeu : les playouts (le 7e contre le 8e) ; personne ne joue : le mieux classé passe
insert into t select 'p8', pg_temp.championnat(8, '{"playoffs": true}', 'Le perdant range la salle');
select pg_temp.saison(pg_temp.v('p8')::uuid);
select pg_temp.verifier(pg_temp.affiches(pg_temp.v('p8')::uuid, 'playout') = 'J7-J8', 'playouts : le 7e contre le 8e (non qualifiés)');
do $$ begin
  for i in 1 .. 4 loop
    update tournois set echeance = now() - interval '1 second' where id = pg_temp.v('p8')::uuid;
    perform _avancer_championnat(pg_temp.v('p8')::uuid);
  end loop;
end $$;
select pg_temp.verifier((select phase = 'termine' and vainqueur = pg_temp.j(1) and dernier = pg_temp.j(8) from pg_temp.tournoi(pg_temp.v('p8')::uuid)),
  'personne ne joue : le mieux classé passe à chaque tour (champion J1), le meilleur bilan est sauvé (J8 s''y colle)');
select pg_temp.verifier((select count(*) = 0 from matchs_tournoi where tournoi_id = pg_temp.v('p8')::uuid and tour > 1 and fin <> 'tete_de_serie'),
  '(décidés « tête de série »)');
-- Un seul des deux a essayé de jouer : il passe.
insert into t select 'p8b', pg_temp.championnat(8, '{"playoffs": true}');
select pg_temp.saison(pg_temp.v('p8b')::uuid);
update matchs_tournoi set essai1 = now() where tournoi_id = pg_temp.v('p8b')::uuid and tour = 2 and j1 = pg_temp.j(6);
update tournois set echeance = now() - interval '1 second' where id = pg_temp.v('p8b')::uuid;
select _avancer_championnat(pg_temp.v('p8b')::uuid);
select pg_temp.verifier(pg_temp.affiches(pg_temp.v('p8b')::uuid) = 'J1-J4, J2-J6', 'celui qui a essayé de jouer passe (J6 bat J3)');
select pg_temp.verifier((select count(*) = 0 from matchs_tournoi where tournoi_id = pg_temp.v('p8b')::uuid and phase = 'playout'), 'sans enjeu : pas de playouts');

-- 4. Deux poules de 4 (serpentin), avec enjeu : demies croisées, playouts entre les derniers
insert into t select 'deux', pg_temp.championnat(8, '{"poules": 2, "garder_poules": true}', 'Le dernier fait la vaisselle', true);
select pg_temp.verifier((select string_agg('J' || pg_temp.num(joueur), ' ' order by pg_temp.num(joueur)) = 'J1 J4 J5 J8'
  from inscrits_tournoi where tournoi_id = pg_temp.v('deux')::uuid and poule = 0), 'serpentin : poule A = J1, J4, J5, J8');
select pg_temp.verifier((select count(*) = 12 from matchs_tournoi where tournoi_id = pg_temp.v('deux')::uuid and tour = 1), 'chacun contre tous dans sa poule (2 × 6 matchs)');
select pg_temp.verifier((select fin_prevue = _fin_semaine(lance_le) from pg_temp.tournoi(pg_temp.v('deux')::uuid)), 'chaque semaine, sans quarts : jusqu''au dimanche soir');
select pg_temp.saison(pg_temp.v('deux')::uuid);
select pg_temp.verifier(pg_temp.affiches(pg_temp.v('deux')::uuid) = 'J1-J3, J2-J4', 'demies croisées : 1er A - 2e B, 1er B - 2e A');
select pg_temp.verifier(pg_temp.affiches(pg_temp.v('deux')::uuid, 'playout') in ('J7-J8', 'J8-J7'), 'playouts : les derniers des deux poules');
select pg_temp.gagne(pg_temp.v('deux')::uuid, 3, 1);
select pg_temp.gagne(pg_temp.v('deux')::uuid, 2, 4);
select pg_temp.gagne(pg_temp.v('deux')::uuid, 8, 7);
select pg_temp.gagne(pg_temp.v('deux')::uuid, 2, 3);
select pg_temp.verifier((select phase = 'termine' and vainqueur = pg_temp.j(2) and dernier = pg_temp.j(7) from pg_temp.tournoi(pg_temp.v('deux')::uuid)),
  'champion J2 ; J7 perd le match des derniers : il s''y colle');
select pg_temp.verifier((select count(*) = 1 from tournois where serie = pg_temp.v('deux')::uuid and edition = 2), 'chaque semaine : l''édition suivante est créée');
select pg_temp.verifier((select string_agg('J' || pg_temp.num(i.joueur), ' ' order by pg_temp.num(i.joueur)) = 'J1 J4 J5 J8'
  from inscrits_tournoi i join tournois x on x.id = i.tournoi_id where x.serie = pg_temp.v('deux')::uuid and x.edition = 2 and i.poule = 0),
  'mêmes poules gardées pour l''édition suivante');
select pg_temp.en_tant_que(pg_temp.j(3)::text);
select pg_temp.verifier((select (x->'palmares'->0->'dernier'->>'pseudo') = 'J7' from voir_tournoi(pg_temp.v('deux')::uuid) x), 'le palmarès : celui qui s''y colle');
reset role;

-- 5. Deux poules de 5 : les 4 premiers en quarts croisés ; chaque semaine → 2 semaines
insert into t select 'q2', pg_temp.championnat(10, '{"poules": 2}', null, true);
select pg_temp.verifier((select fin_prevue = _fin_semaine(lance_le) + interval '7 days' from pg_temp.tournoi(pg_temp.v('q2')::uuid)), 'chaque semaine avec des quarts : toutes les 2 semaines');
select pg_temp.saison(pg_temp.v('q2')::uuid);
-- poule A (serpentin) : J1 J4 J5 J8 J9 ; poule B : J2 J3 J6 J7 J10
select pg_temp.verifier(pg_temp.affiches(pg_temp.v('q2')::uuid) = 'J1-J7, J3-J5, J2-J8, J4-J6',
  'quarts croisés : 1A-4B, 2B-3A, 1B-4A, 2A-3B (le mieux classé de la saison en premier)');

-- 6. Trois poules de 3 : les 2 premiers et les 2 meilleurs 3es ; jamais deux joueurs d'une même poule en quart ; enjeu sans playout
insert into t select 'trois', pg_temp.championnat(9, '{"poules": 3}', 'Le dernier offre le café');
select pg_temp.saison(pg_temp.v('trois')::uuid);
select pg_temp.verifier((select count(*) = 4 from matchs_tournoi where tournoi_id = pg_temp.v('trois')::uuid and tour = 2 and phase = 'playoff'), '4 quarts de finale');
select pg_temp.verifier((select count(*) = 0 from matchs_tournoi m where tournoi_id = pg_temp.v('trois')::uuid and tour = 2
  and (select poule from inscrits_tournoi where tournoi_id = m.tournoi_id and joueur = m.j0) = (select poule from inscrits_tournoi where tournoi_id = m.tournoi_id and joueur = m.j1)),
  'jamais deux joueurs d''une même poule en quart');
select pg_temp.verifier((select count(*) = 0 from matchs_tournoi where tournoi_id = pg_temp.v('trois')::uuid and phase = 'playout')
  and (select dernier is not null and (select rang_poule from inscrits_tournoi where tournoi_id = x.id and joueur = x.dernier) = 3 from pg_temp.tournoi(pg_temp.v('trois')::uuid) x),
  'un seul dernier de poule non qualifié : il s''y colle sans playout');

-- 7. Quatre poules de 3 : les 2 premiers en quarts croisés
insert into t select 'quatre', pg_temp.championnat(12, '{"poules": 4}');
select pg_temp.saison(pg_temp.v('quatre')::uuid);
-- poules (serpentin) : A J1 J8 J9 ; B J2 J7 J10 ; C J3 J6 J11 ; D J4 J5 J12
select pg_temp.verifier(pg_temp.affiches(pg_temp.v('quatre')::uuid) = 'J1-J7, J3-J5, J2-J8, J4-J6', 'quarts croisés : 1A-2B, 1C-2D, 1B-2A, 1D-2C');
select pg_temp.verifier((select fin_prevue - lance_le >= interval '10 days' from pg_temp.tournoi(pg_temp.v('quatre')::uuid)), 'avec des quarts : 10 jours au moins');

-- 8. Pas assez de joueurs pour les poules demandées : moins de poules
insert into t select 'peu', pg_temp.championnat(5, '{"poules": 2}');
select pg_temp.verifier((select nb_poules = 1 and playoffs from pg_temp.tournoi(pg_temp.v('peu')::uuid)), '5 joueurs pour 2 poules : une seule poule (avec playoffs)');
-- Sans playoffs : comme avant (le 1er est champion).
insert into t select 'simple', pg_temp.championnat(4, '{}', 'Le dernier paie');
select pg_temp.saison(pg_temp.v('simple')::uuid);
select pg_temp.verifier((select phase = 'termine' and vainqueur = pg_temp.j(1) and dernier = pg_temp.j(4) and not playoffs from pg_temp.tournoi(pg_temp.v('simple')::uuid)),
  'sans playoffs : le 1er de la saison est champion, le dernier s''y colle');
reset role;
create or replace function public._limite_tournois() returns int language sql immutable as $$ select 5 $$;
