-- Tests de supabase/etape-23-tirage-au-sort.sql : têtes de série façon tennis, le reste tiré au sort.
\set QUIET on
\echo Tests de la base de données (étape 23 : tirage au sort des tableaux)

-- 130 joueurs : les 40 premiers ont des niveaux tous différents (1 = le meilleur), les autres sont tous à 1200.
insert into auth.users select ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 130) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid, 'Joueur' || i, 0 from generate_series(1, 130) i;
insert into classements (joueur, points) select ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid, 1700 - i * 10 from generate_series(1, 40) i;

create or replace function pg_temp.u(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid $$;
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;

-- Un tournoi de n joueurs (les joueurs 1 à n) dans un tableau de p_taille places, tiré au sort.
create or replace function pg_temp.tirer(n int, p_taille int) returns uuid language plpgsql as $$
declare t uuid;
begin
  insert into tournois (nom, points_par_set, sets_gagnants, duree_tour, mode, taille) values ('Essai', 11, 2, '15 minutes', 'direct', p_taille) returning id into t;
  insert into inscrits_tournoi (tournoi_id, joueur) select t, pg_temp.u(i) from generate_series(1, n) i;
  perform _tirage_tableau(t, p_taille);
  return t;
end $$;
-- La place (1 à taille) d'un joueur dans le premier tour.
create or replace function pg_temp.place(t uuid, j uuid) returns int language sql as $$
  select case when j0 = j then 2 * position - 1 else 2 * position end from matchs_tournoi where tournoi_id = t and tour = 1 and j in (j0, j1)
$$;
-- L'adversaire d'un joueur au premier tour (null : exempt).
create or replace function pg_temp.adversaire(t uuid, j uuid) returns uuid language sql as $$
  select case when j0 = j then j1 else j0 end from matchs_tournoi where tournoi_id = t and tour = 1 and j in (j0, j1)
$$;

do $$
declare t uuid; k int; adv uuid[] := '{}'; ordre text[] := '{}';
begin
  -- 1. Un tableau de 128 pour 127 joueurs
  t := pg_temp.tirer(127, 128);
  perform pg_temp.verifier((select count(*) from inscrits_tournoi where tournoi_id = t and tete is not null) = 32, '128 places : 32 têtes de série');
  perform pg_temp.verifier((select bool_and(tete = substr(joueur::text, 25)::int) from inscrits_tournoi where tournoi_id = t and tete is not null),
    'les têtes de série sont les 32 meilleurs niveaux, dans l''ordre');
  perform pg_temp.verifier((select count(*) from matchs_tournoi where tournoi_id = t and tour = 1) = 64, '64 matchs au premier tour');
  perform pg_temp.verifier((select count(distinct x) = 127 from matchs_tournoi m, unnest(array[m.j0, m.j1]) x where m.tournoi_id = t and m.tour = 1 and x is not null),
    'chaque joueur est placé une fois');
  perform pg_temp.verifier(pg_temp.place(t, pg_temp.u(1)) = 1 and pg_temp.place(t, pg_temp.u(2)) > 64, 'la 1 en haut du tableau, la 2 dans l''autre moitié : elles ne peuvent se croiser qu''en finale');
  perform pg_temp.verifier(pg_temp.adversaire(t, pg_temp.u(1)) is null, 'la place vide (exempt) revient à la tête de série n° 1');
  -- deux têtes de série ne peuvent pas se croiser trop tôt : chaque bloc de 4 places n'en a qu'une
  perform pg_temp.verifier((select count(distinct (pg_temp.place(t, pg_temp.u(i)) - 1) / 4) = 32 from generate_series(1, 32) i),
    'jamais deux têtes de série avant les seizièmes de finale');
  perform pg_temp.verifier((select count(distinct (pg_temp.place(t, pg_temp.u(i)) - 1) / 32) = 4 from generate_series(1, 4) i),
    'les 4 premières têtes de série dans 4 quarts différents');
  perform pg_temp.verifier((select bool_and((select tete from inscrits_tournoi where tournoi_id = t and joueur = pg_temp.adversaire(t, pg_temp.u(i))) is null)
    from generate_series(2, 32) i), 'chaque tête de série affronte un joueur non tête de série');

  -- 2. Le hasard : l'adversaire de la tête de série n° 2 et l'ordre des joueurs à égalité changent d'un tirage à l'autre
  for k in 1 .. 6 loop
    t := pg_temp.tirer(127, 128);
    adv := adv || pg_temp.adversaire(t, pg_temp.u(2));
    ordre := ordre || (select string_agg(coalesce(j0::text, '-') || coalesce(j1::text, '-'), ',' order by position) from matchs_tournoi where tournoi_id = t and tour = 1);
  end loop;
  perform pg_temp.verifier((select count(distinct x) > 1 from unnest(adv) x), 'la tête de série n° 2 ne tombe pas toujours sur le même joueur');
  perform pg_temp.verifier((select count(distinct x) = 6 from unnest(ordre) x), 'six tirages, six tableaux différents');

  -- 3. Un tableau de 8 : 4 têtes de série, les 4 autres tirés au sort
  adv := '{}';
  for k in 1 .. 12 loop
    t := pg_temp.tirer(8, 8);
    perform pg_temp.verifier((select count(*) from inscrits_tournoi where tournoi_id = t and tete is not null) = 4, '8 places : 4 têtes de série') where k = 1;
    adv := adv || pg_temp.adversaire(t, pg_temp.u(1));
  end loop;
  perform pg_temp.verifier((select bool_and(substr(x::text, 25)::int between 5 and 8) from unnest(adv) x), 'la n° 1 affronte un joueur non tête de série');
  perform pg_temp.verifier((select count(distinct x) > 1 from unnest(adv) x), 'et pas toujours le même');

  -- 3 bis. La moitié du tableau, 32 au plus
  perform pg_temp.verifier(_nb_tetes(4, 4) = 2 and _nb_tetes(16, 16) = 8 and _nb_tetes(32, 32) = 16 and _nb_tetes(64, 64) = 32
    and _nb_tetes(128, 128) = 32 and _nb_tetes(256, 256) = 32, 'têtes de série : 2 sur 4, 8 sur 16, 16 sur 32, 32 à partir de 64');
  perform pg_temp.verifier(_nb_tetes(32, 5) = 5, 'jamais plus de têtes de série que de joueurs');
  t := pg_temp.tirer(16, 16);
  perform pg_temp.verifier((select count(*) from matchs_tournoi m where m.tournoi_id = t and m.tour = 1
    and ((select tete from inscrits_tournoi where tournoi_id = t and joueur = m.j0) is null) = ((select tete from inscrits_tournoi where tournoi_id = t and joueur = m.j1) is null)) = 0,
    '16 joueurs : 8 têtes de série, chacune contre un joueur tiré au sort');

  -- 4. Beaucoup de places vides (tournoi entre amis de 17 joueurs, tableau de 32) : jamais deux places vides face à face
  t := pg_temp.tirer(17, 32);
  perform pg_temp.verifier((select count(*) from matchs_tournoi where tournoi_id = t and tour = 1 and j0 is null and j1 is null) = 0, 'jamais deux places vides face à face');
  perform pg_temp.verifier((select count(*) from matchs_tournoi where tournoi_id = t and tour = 1 and (j0 is null) <> (j1 is null)) = 15, '15 exemptés');
  perform pg_temp.verifier((select bool_and(pg_temp.adversaire(t, pg_temp.u(i)) is null) from generate_series(1, 8) i), 'les têtes de série sont exemptées en premier');

  -- 5. Tirage fixe (pour les autres tests) : l'ordre classique, 1 contre 8, 4 contre 5…
  perform set_config('pcf.tirage_fixe', '1', true);
  t := pg_temp.tirer(8, 8);
  perform pg_temp.verifier(pg_temp.adversaire(t, pg_temp.u(1)) = pg_temp.u(8) and pg_temp.adversaire(t, pg_temp.u(4)) = pg_temp.u(5), 'tirage fixe : 1 contre 8, 4 contre 5');
end $$;
