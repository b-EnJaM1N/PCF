-- HandSlam — Étape 23 : le tirage au sort des tableaux, façon tennis, et l'écran d'attente.
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 22. Peut être relancé sans risque.
--
-- Principe (décidé avec le porteur du projet) :
--  * seuls les meilleurs joueurs sont têtes de série : la moitié du tableau, 32 au plus (4 sur 8, 8 sur 16, 16 sur 32,
--    32 à partir de 64) ; à niveau égal, le hasard départage ;
--  * les têtes de série sont placées comme au tennis : la 1 en haut, la 2 en bas, les 3 et 4 tirées au sort entre
--    les deux autres quarts, les 5 à 8 entre les huitièmes…, de sorte que deux têtes de série ne se croisent pas trop tôt ;
--  * les places vides (exempts) et les bots vont d'abord face aux meilleures têtes de série ;
--  * tous les autres joueurs sont tirés au sort : la 1 peut tomber sur n'importe quel joueur non tête de série.
-- Les tests de la base peuvent demander un tirage sans hasard : set_config('pcf.tirage_fixe', '1', false).

-- Le nombre de têtes de série pour un tableau de « p_taille » places et « p_humains » joueurs.
create or replace function public._nb_tetes(p_taille int, p_humains int) returns int
language sql immutable as $$
  select greatest(0, least(p_humains, p_taille / 2, 32))
$$;

-- Le tirage : fixe les têtes de série (colonne « tete », vide pour les autres) et crée les matchs du premier tour.
create or replace function public._tirage_tableau(p_id uuid, p_taille int) returns void
language plpgsql security definer set search_path = public as $$
declare
  fixe boolean := coalesce(current_setting('pcf.tirage_fixe', true), '') = '1';
  VIDE constant uuid := '00000000-0000-0000-0000-000000000000';
  v_h uuid[]; v_b uuid[]; v_faibles uuid[]; v_reste uuid[]; o int[]; place uuid[]; slots int[]; libres int[];
  s int; lo int; hi int; k int; i int; j int; f int := 1; e int; partenaire int; m int; p int;
begin
  -- Les humains, du meilleur niveau officiel au moins bon ; à égalité, le hasard (ou l'ordre d'inscription en tirage fixe).
  select coalesce(array_agg(x.joueur order by coalesce(c.points, _classement_depart()) desc,
                            case when fixe then extract(epoch from x.inscrit_le) else random() end, x.joueur), '{}')
  into v_h
  from inscrits_tournoi x left join classements c on c.joueur = x.joueur
  where x.tournoi_id = p_id and not exists (select 1 from bots_en_ligne b where b.joueur = x.joueur);
  select coalesce(array_agg(x.joueur order by case when fixe then extract(epoch from x.inscrit_le) else random() end, x.joueur), '{}')
  into v_b
  from inscrits_tournoi x where x.tournoi_id = p_id and exists (select 1 from bots_en_ligne b where b.joueur = x.joueur);

  s := _nb_tetes(p_taille, cardinality(v_h));
  update inscrits_tournoi set tete = null where tournoi_id = p_id;
  for k in 1 .. s loop update inscrits_tournoi set tete = k where tournoi_id = p_id and joueur = v_h[k]; end loop;

  -- 1. Les têtes de série, par groupes : 1 ; 2 ; 3-4 ; 5-8 ; 9-16 ; 17-32 (tirées au sort dans leur groupe).
  o := _ordre_tableau(p_taille);
  place := array_fill(null::uuid, array[p_taille]);
  lo := 1;
  while lo <= s loop
    hi := case when lo <= 2 then lo else 2 * lo - 2 end;
    select array_agg(x order by case when fixe then o[x] else random() end) into slots
    from generate_series(1, p_taille) x where o[x] between lo and hi;
    for k in lo .. least(hi, s) loop place[slots[k - lo + 1]] := v_h[k]; end loop;
    lo := hi + 1;
  end loop;

  -- 2. Les bots puis les places vides (exempts), face aux meilleurs : les têtes de série d'abord,
  --    puis, s'il en reste, les meilleurs des autres joueurs, dans un match tiré au sort.
  e := p_taille - cardinality(v_h) - cardinality(v_b);
  v_faibles := v_b || array_fill(VIDE, array[greatest(e, 0)]);
  v_reste := v_h[s + 1 :];
  i := 1;
  for k in 1 .. cardinality(v_h) loop
    exit when f > cardinality(v_faibles);
    if k <= s then
      i := array_position(place, v_h[k]);
      partenaire := case when i % 2 = 1 then i + 1 else i - 1 end;
      place[partenaire] := v_faibles[f]; f := f + 1;
    else
      -- un match encore entièrement libre, tiré au sort
      select x into m from generate_series(1, p_taille / 2) x
      where place[2 * x - 1] is null and place[2 * x] is null
      order by case when fixe then x else random() end limit 1;
      exit when m is null;
      place[2 * m - 1] := v_h[k]; place[2 * m] := v_faibles[f]; f := f + 1;
      v_reste := array_remove(v_reste, v_h[k]);
    end if;
  end loop;

  -- 3. Tous les autres (joueurs non têtes de série, bots restants) : tirés au sort dans les places libres
  --    (en tirage fixe : dans l'ordre du niveau, aux places classiques).
  v_reste := v_reste || coalesce(v_faibles[f :], '{}');
  if not fixe then select coalesce(array_agg(x order by random()), '{}') into v_reste from unnest(v_reste) x; end if;
  select coalesce(array_agg(x order by o[x]), '{}') into libres from generate_series(1, p_taille) x where place[x] is null;
  for j in 1 .. least(cardinality(libres), cardinality(v_reste)) loop place[libres[j]] := v_reste[j]; end loop;

  -- 4. Les matchs du premier tour.
  for p in 1 .. p_taille / 2 loop
    insert into matchs_tournoi (tournoi_id, tour, position, j0, j1)
    values (p_id, 1, p, nullif(place[2 * p - 1], VIDE), nullif(place[2 * p], VIDE));
  end loop;
end $$;

-- Lancer un tournoi libre (remplace la version de l'étape 6) : le tirage façon tennis.
create or replace function public.lancer_tournoi(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; n int; v_taille int;
begin
  select * into t from tournois where id = p_id for update;
  if t.id is null or not _organise(t) then raise exception 'Seul l''organisateur peut lancer le tournoi'; end if;
  if t.phase <> 'inscriptions' then raise exception 'Ce tournoi a déjà commencé'; end if;
  n := (select count(*) from inscrits_tournoi where tournoi_id = p_id);
  if n < 3 then raise exception 'Il faut au moins 3 joueurs pour lancer le tournoi'; end if;
  v_taille := 2; while v_taille < n loop v_taille := v_taille * 2; end loop;
  perform _tirage_tableau(p_id, v_taille);
  update tournois set phase = 'en_cours', tour = 1, nb_tours = round(log(2, v_taille))::int, echeance = now() + duree_tour, lance_le = now()
  where id = p_id;
  perform _avancer_tournoi(p_id);
end $$;

-- Lancer un tournoi en direct : Sit & Go, freeroll, tournois programmés (remplace la version de l'étape 21).
create or replace function public._lancer_direct(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  select * into t from tournois where id = p_id for update;
  perform _tirage_tableau(p_id, t.taille);
  update tournois set phase = 'en_cours', tour = 1, nb_tours = round(log(2, t.taille))::int, echeance = null, lance_le = now() where id = p_id;
  perform _avancer_tournoi(p_id);
end $$;

-- La meilleure tête de série (pour départager un match que personne n'est venu jouer) :
-- les têtes de série d'abord, puis le niveau officiel.
create or replace function public._tete(p_tournoi uuid, p_joueur uuid) returns int
language sql stable security definer set search_path = public as $$
  select coalesce((select tete from public.inscrits_tournoi where tournoi_id = p_tournoi and joueur = p_joueur),
                  1000 + 5000 - coalesce((select points from public.classements where joueur = p_joueur), _classement_depart()))
$$;

-- Le tableau (remplace la version de l'étape 5) : la tête de série n'est donnée qu'aux têtes de série,
-- et les points du set en cours sont ajoutés, pour l'écran d'attente.
create or replace function public.voir_tournoi(p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  select * into t from tournois where id = p_id;
  if t.id is null or not _voit_tournoi(t) then raise exception 'Tournoi introuvable'; end if;
  perform _avancer_tournoi(p_id);
  select * into t from tournois where id = p_id;
  return _resume_tournoi(t) || jsonb_build_object(
    'code', t.code, 'organise', _organise(t), 'maintenant', now(),
    'joueurs', coalesce((select jsonb_agg(_carte(i.joueur) || jsonb_build_object('tete', i.tete) order by i.tete nulls last, i.inscrit_le)
                         from inscrits_tournoi i where i.tournoi_id = p_id), '[]'::jsonb),
    'matchs', coalesce((select jsonb_agg(jsonb_build_object(
        'id', m.id, 'tour', m.tour, 'position', m.position, 'fin', m.fin,
        'j0', case when m.j0 is not null then _carte(m.j0) || jsonb_build_object('tete', (select tete from inscrits_tournoi where tournoi_id = p_id and joueur = m.j0)) end,
        'j1', case when m.j1 is not null then _carte(m.j1) || jsonb_build_object('tete', (select tete from inscrits_tournoi where tournoi_id = p_id and joueur = m.j1)) end,
        'vainqueur', m.vainqueur, 'essai0', m.essai0 is not null, 'essai1', m.essai1 is not null,
        'duel', (select jsonb_build_object('id', d.id, 'phase', d.phase, 'j0', d.j0, 'scores_sets', d.scores_sets, 'sets', d.sets, 'points', d.points)
                 from duels d where d.id = m.duel_id)) order by m.tour, m.position)
      from matchs_tournoi m where m.tournoi_id = p_id), '[]'::jsonb));
end $$;

revoke all on function public._nb_tetes(int, int), public._tirage_tableau(uuid, int), public._tete(uuid, uuid) from public, anon, authenticated;
