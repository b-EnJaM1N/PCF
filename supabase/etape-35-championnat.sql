-- HandSlam — Étape 35 : le championnat du cercle.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ».
-- Nécessite les étapes 2 à 34. Peut être relancé sans risque.
--
-- Décisions du porteur du projet (8 et 9 octobre) :
--  * dans un cercle, n'importe quel membre peut organiser un championnat (comme un tournoi du cercle) ;
--  * chacun joue contre tous, en aller simple ou en aller-retour, pendant 3 jours, 1 semaine ou 2 semaines ;
--    les matchs se jouent quand on veut pendant cette période (« Jouer mon match », comme en tournoi) ;
--  * 2 points par victoire ; à égalité : la confrontation directe, puis les sets gagnés, puis les points gagnés ;
--  * match non joué à la fin : gagné par celui qui a essayé de le jouer, perdu pour les deux si personne n'a essayé ;
--  * un enjeu facultatif (mêmes garde-fous que le défi avec enjeu, étape 34) : le dernier s'y colle ;
--    l'organisateur ou le responsable du cercle peut l'effacer ;
--  * récompense : le trophée « Champion du cercle » et 🏆 à côté de son nom dans le cercle (côté appli).
-- De 3 à 10 joueurs. Pas de tâche programmée : le championnat avance dès qu'un joueur l'ouvre ou qu'un match se termine.

alter table public.tournois add column if not exists enjeu text;
alter table public.tournois add column if not exists aller_retour boolean not null default false;
alter table public.tournois drop constraint if exists tournois_mode_check;
alter table public.tournois add constraint tournois_mode_check check (mode in ('libre', 'direct', 'championnat'));
alter table public.tournois drop constraint if exists tournois_duree_tour_check;
alter table public.tournois add constraint tournois_duree_tour_check
  check (duree_tour in ('15 minutes', '1 hour', '24 hours', '72 hours', '7 days', '14 days'));
alter table public.matchs_tournoi drop constraint if exists matchs_tournoi_fin_check;
alter table public.matchs_tournoi add constraint matchs_tournoi_fin_check
  check (fin in ('score', 'forfait', 'abandon', 'exempt', 'tete_de_serie', 'double_forfait'));

create or replace function public._max_championnat() returns int language sql immutable as $$ select 10 $$;

-- ---------------------------------------------------------------- le classement
-- Une ligne par joueur, du premier au dernier : { joueur (carte), rang, points, v, d, joues, sets, points_gagnes }.
create or replace function public._classement_championnat(p_id uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  with joueurs as (select joueur, inscrit_le from inscrits_tournoi where tournoi_id = p_id),
  lignes as (   -- un match décidé, vu par chacun de ses deux joueurs
    select j.joueur, m.vainqueur, case when m.j0 = j.joueur then m.j1 else m.j0 end as adv,
           case when d.j0 = j.joueur then 0 else 1 end as cote, d.sets, d.scores_sets
    from joueurs j join matchs_tournoi m on m.tournoi_id = p_id and j.joueur in (m.j0, m.j1) and m.fin is not null
    left join duels d on d.id = m.duel_id and d.phase = 'termine'),
  stats as (
    select j.joueur, j.inscrit_le,
      count(l.joueur) filter (where l.vainqueur = j.joueur)::int as v,
      count(l.joueur) filter (where l.vainqueur is distinct from j.joueur)::int as d,
      coalesce(sum(l.sets[l.cote + 1]), 0)::int as sets_g,
      coalesce(sum((select sum((x->>l.cote)::int) from jsonb_array_elements(l.scores_sets) x)), 0)::int as pts_g
    from joueurs j left join lignes l on l.joueur = j.joueur group by j.joueur, j.inscrit_le),
  -- Confrontation directe : les victoires contre les joueurs à égalité de points (2 points = 1 victoire).
  directes as (
    select l.joueur, count(*)::int as n from lignes l join stats s on s.joueur = l.joueur join stats a on a.joueur = l.adv
    where l.vainqueur = l.joueur and a.v = s.v group by l.joueur),
  rangs as (
    select s.*, coalesce(dr.n, 0) as dir,
      row_number() over (order by s.v desc, coalesce(dr.n, 0) desc, s.sets_g desc, s.pts_g desc, s.inscrit_le, s.joueur) as rang
    from stats s left join directes dr on dr.joueur = s.joueur)
  select coalesce(jsonb_agg(jsonb_build_object('joueur', _carte(r.joueur), 'rang', r.rang, 'points', 2 * r.v, 'v', r.v, 'd', r.d,
    'joues', r.v + r.d, 'sets', r.sets_g, 'points_gagnes', r.pts_g) order by r.rang), '[]'::jsonb)
  from rangs r
$$;

-- ---------------------------------------------------------------- faire avancer le championnat
create or replace function public._avancer_championnat(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; m public.matchs_tournoi; d public.duels; premier jsonb;
begin
  select * into t from tournois where id = p_id for update;
  if t.id is null or t.phase <> 'en_cours' then return; end if;

  -- Un joueur a supprimé son compte : son adversaire gagne le match.
  update matchs_tournoi set vainqueur = coalesce(j0, j1), fin = case when coalesce(j0, j1) is null then 'double_forfait' else 'exempt' end
  where tournoi_id = p_id and fin is null and (j0 is null or j1 is null);

  -- Fin de la période : les matchs pas joués (et pas en cours) sont décidés.
  if now() > t.echeance then
    for m in select * from matchs_tournoi where tournoi_id = p_id and fin is null for update loop
      select * into d from duels where id = m.duel_id;
      continue when d.id is not null and d.phase in ('presentation', 'jeu', 'entre_sets');   -- on le laisse finir
      if d.id is not null and d.phase = 'attente' then
        perform set_config('pcf.interne', '1', true);
        update duels set phase = 'annule', maj_le = now() where id = d.id;
        perform set_config('pcf.interne', '', true);
      end if;
      if (m.essai0 is not null) <> (m.essai1 is not null) then
        update matchs_tournoi set vainqueur = case when m.essai0 is not null then m.j0 else m.j1 end, fin = 'forfait' where id = m.id;
      else   -- personne n'est venu (ou les deux sont venus sans jamais se croiser) : perdu pour les deux
        update matchs_tournoi set vainqueur = null, fin = 'double_forfait' where id = m.id;
      end if;
    end loop;
  end if;

  -- Tous les matchs sont décidés : le championnat est fini.
  if not exists (select 1 from matchs_tournoi where tournoi_id = p_id and fin is null) then
    premier := _classement_championnat(p_id)->0;
    update tournois set phase = 'termine', echeance = null, fini_le = now(),
      vainqueur = case when (premier->>'v')::int > 0 then (premier->'joueur'->>'id')::uuid end
    where id = p_id;
  end if;
end $$;

-- Remplace la version de l'étape 6 : le championnat a sa propre façon d'avancer.
create or replace function public._avancer_tournoi(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_mode text := (select mode from tournois where id = p_id);
begin
  if v_mode = 'direct' then perform _avancer_direct(p_id);
  elsif v_mode = 'championnat' then perform _avancer_championnat(p_id);
  else perform _avancer_libre(p_id); end if;
end $$;

-- ---------------------------------------------------------------- les actions des joueurs
-- p_jours : durée du championnat (3, 7 ou 14 jours). p_enjeu : facultatif.
create or replace function public.creer_championnat(p_nom text, p_cercle uuid, p_points int, p_sets int, p_jours int,
  p_aller_retour boolean default false, p_enjeu text default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.tournois; e text;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton compte'; end if;
  if p_cercle is null or _role(p_cercle) is null then raise exception 'Un championnat se joue dans un cercle dont tu fais partie'; end if;
  if p_nom is null or char_length(btrim(p_nom)) not between 2 and 40 then raise exception 'Le nom du championnat doit faire entre 2 et 40 caractères'; end if;
  if p_jours is null or p_jours not in (3, 7, 14) then raise exception 'Durée de championnat invalide'; end if;
  if nullif(btrim(coalesce(p_enjeu, '')), '') is not null then e := _enjeu_propre(p_enjeu); end if;
  if (select count(*) from tournois where createur = auth.uid() and phase in ('inscriptions', 'en_cours')) >= _limite_tournois() then
    raise exception 'Tu as déjà % tournois en cours : termine-les ou annule-en un', _limite_tournois();
  end if;
  insert into tournois (nom, cercle_id, createur, points_par_set, sets_gagnants, duree_tour, mode, aller_retour, enjeu)
  values (btrim(p_nom), p_cercle, auth.uid(), p_points, p_sets, make_interval(days => p_jours), 'championnat', coalesce(p_aller_retour, false), e)
  returning * into t;
  insert into inscrits_tournoi (tournoi_id, joueur) values (t.id, auth.uid());
  return jsonb_build_object('id', t.id, 'code', t.code);
end $$;

-- Remplace la version de l'étape 5 : un championnat accueille 10 joueurs au plus.
create or replace function public._inscrire(t public.tournois) returns void
language plpgsql security definer set search_path = public as $$
begin
  if t.phase <> 'inscriptions' then raise exception 'Les inscriptions à ce tournoi sont closes'; end if;
  if t.cercle_id is not null and _role(t.cercle_id) is null then raise exception 'Ce tournoi est réservé aux membres du cercle'; end if;
  if t.mode = 'championnat' and (select count(*) from inscrits_tournoi where tournoi_id = t.id) >= _max_championnat() then
    raise exception 'Ce championnat est complet (% joueurs)', _max_championnat();
  end if;
  if (select count(*) from inscrits_tournoi where tournoi_id = t.id) >= 32 then raise exception 'Ce tournoi est complet (32 joueurs)'; end if;
  insert into inscrits_tournoi (tournoi_id, joueur) values (t.id, auth.uid()) on conflict do nothing;
end $$;

-- Lancer un championnat : tous les matchs sont créés d'un coup (chacun contre tous, deux fois en aller-retour).
create or replace function public._lancer_championnat(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; n int; js uuid[]; i int; k int; p int := 0;
begin
  select * into t from tournois where id = p_id for update;
  n := (select count(*) from inscrits_tournoi where tournoi_id = p_id);
  if n < 3 then raise exception 'Il faut au moins 3 joueurs pour lancer le championnat'; end if;
  js := array(select joueur from inscrits_tournoi where tournoi_id = p_id order by inscrit_le, joueur);
  for i in 1 .. n - 1 loop
    for k in i + 1 .. n loop
      p := p + 1; insert into matchs_tournoi (tournoi_id, tour, position, j0, j1) values (p_id, 1, p, js[i], js[k]);
      if t.aller_retour then
        p := p + 1; insert into matchs_tournoi (tournoi_id, tour, position, j0, j1) values (p_id, 1, p, js[k], js[i]);
      end if;
    end loop;
  end loop;
  update tournois set phase = 'en_cours', tour = 1, nb_tours = 1, echeance = now() + duree_tour, lance_le = now() where id = p_id;
end $$;

-- Remplace la version de l'étape 23 : le championnat se lance à sa façon.
create or replace function public.lancer_tournoi(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; n int; v_taille int;
begin
  select * into t from tournois where id = p_id for update;
  if t.id is null or not _organise(t) then raise exception 'Seul l''organisateur peut lancer le tournoi'; end if;
  if t.phase <> 'inscriptions' then raise exception 'Ce tournoi a déjà commencé'; end if;
  if t.mode = 'championnat' then perform _lancer_championnat(p_id); return; end if;
  n := (select count(*) from inscrits_tournoi where tournoi_id = p_id);
  if n < 3 then raise exception 'Il faut au moins 3 joueurs pour lancer le tournoi'; end if;
  v_taille := 2; while v_taille < n loop v_taille := v_taille * 2; end loop;
  perform _tirage_tableau(p_id, v_taille);
  update tournois set phase = 'en_cours', tour = 1, nb_tours = round(log(2, v_taille))::int, echeance = now() + duree_tour, lance_le = now()
  where id = p_id;
  perform _avancer_tournoi(p_id);
end $$;

-- Effacer l'enjeu d'un championnat : l'organisateur ou le responsable du cercle.
create or replace function public.effacer_enjeu_tournoi(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  select * into t from tournois where id = p_id for update;
  if t.id is null or not _voit_tournoi(t) then raise exception 'Tournoi introuvable'; end if;
  if not (t.createur = auth.uid() or (t.cercle_id is not null and _role(t.cercle_id) = 'admin')) then
    raise exception 'Seul l''organisateur ou le responsable du cercle peut effacer l''enjeu';
  end if;
  update tournois set enjeu = null where id = p_id;
end $$;

-- ---------------------------------------------------------------- ce que voit l'appli
-- Le résumé d'un tournoi : avec l'enjeu et la formule du championnat. Remplace la version de l'étape 21.
create or replace function public._resume_tournoi(t public.tournois) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', t.id, 'mode', t.mode, 'taille', t.taille, 'nom', t.nom, 'phase', t.phase, 'tour', t.tour, 'nb_tours', t.nb_tours, 'echeance', t.echeance,
    'points_par_set', t.points_par_set, 'sets_gagnants', t.sets_gagnants, 'duree_minutes', extract(epoch from t.duree_tour)::int / 60,
    'mise', t.mise, 'freeroll', t.freeroll, 'programme', t.programme, 'depart', t.depart, 'garantie', t.garantie, 'finale_sets', t.finale_sets,
    'enjeu', t.enjeu, 'aller_retour', t.aller_retour, 'fini_le', t.fini_le,
    'cercle', (select jsonb_build_object('id', c.id, 'nom', c.nom, 'blason', c.blason) from cercles c where c.id = t.cercle_id),
    'inscrits', (select count(*) from inscrits_tournoi where tournoi_id = t.id),
    'bots', (select count(*) from inscrits_tournoi i join bots_en_ligne b on b.joueur = i.joueur where i.tournoi_id = t.id),
    'inscrit', exists (select 1 from inscrits_tournoi where tournoi_id = t.id and joueur = auth.uid()),
    'createur', t.createur = auth.uid(),
    'vainqueur', case when t.vainqueur is not null then _carte(t.vainqueur) end,
    'gagne', t.phase = 'termine' and t.vainqueur = auth.uid(),
    'a_jouer', exists (select 1 from matchs_tournoi m where m.tournoi_id = t.id and m.tour = t.tour and m.fin is null
                         and t.phase = 'en_cours' and auth.uid() in (m.j0, m.j1)),
    'elimine', t.mode <> 'championnat' and t.phase = 'en_cours' and exists (select 1 from matchs_tournoi m where m.tournoi_id = t.id and m.fin is not null
                         and auth.uid() in (m.j0, m.j1) and m.vainqueur is distinct from auth.uid()))
$$;

-- Le tableau (remplace la version de l'étape 23) : avec le classement, pour un championnat.
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
    'efface_enjeu', t.enjeu is not null and (t.createur = auth.uid() or (t.cercle_id is not null and _role(t.cercle_id) = 'admin')),
    'classement', case when t.mode = 'championnat' and t.phase <> 'inscriptions' then _classement_championnat(p_id) end,
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

-- ---------------------------------------------------------------- sécurité
revoke all on function public._max_championnat(), public._classement_championnat(uuid), public._avancer_championnat(uuid),
  public._lancer_championnat(uuid) from public, anon, authenticated;
revoke all on function public.creer_championnat(text, uuid, int, int, int, boolean, text), public.effacer_enjeu_tournoi(uuid) from public, anon;
grant execute on function public.creer_championnat(text, uuid, int, int, int, boolean, text), public.effacer_enjeu_tournoi(uuid) to authenticated;
