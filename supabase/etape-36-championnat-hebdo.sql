-- HandSlam — Étape 36 : le championnat du cercle, chaque semaine.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ».
-- Nécessite les étapes 2 à 35. Peut être relancé sans risque.
--
-- Décision du porteur du projet (9 octobre) : un championnat peut se répéter chaque semaine.
--  * chaque édition se joue du lundi 12 h au dimanche 22 h (heure de Paris) ;
--  * à la fin d'une édition, la suivante est créée avec les mêmes réglages (format, formule, enjeu) et les mêmes
--    joueurs, inscrits d'office ; chacun peut se désinscrire, et les autres membres s'inscrire, jusqu'au lundi 12 h ;
--  * le lundi à 12 h, l'édition part toute seule s'il y a au moins 3 joueurs (sinon, elle attend le lundi suivant) ;
--    l'organisateur peut aussi la lancer plus tôt (elle finit alors le dimanche 22 h, ou celui d'après s'il reste moins de 3 jours) ;
--  * la série s'arrête si l'organisateur ou le responsable du cercle l'arrête, si une édition est annulée,
--    ou si personne n'a joué un seul match de toute une semaine.
-- Un minuteur (pg_cron, déjà utilisé par les tournois) vérifie toutes les 5 minutes ; l'appli fait aussi avancer
-- le championnat quand quelqu'un l'ouvre.

alter table public.tournois add column if not exists hebdo boolean not null default false;
alter table public.tournois add column if not exists serie uuid;      -- l'identifiant de la 1re édition de la série
alter table public.tournois add column if not exists edition int;     -- n° de l'édition dans la série
create index if not exists tournois_serie on public.tournois (serie);

-- ---------------------------------------------------------------- les heures (Paris)
-- Le prochain lundi 12 h (heure de Paris) strictement après p_apres.
create or replace function public._prochain_lundi_midi(p_apres timestamptz) returns timestamptz
language sql stable as $$
  select (case when l > (p_apres at time zone 'Europe/Paris') then l else l + interval '7 days' end) at time zone 'Europe/Paris'
  from (select date_trunc('week', p_apres at time zone 'Europe/Paris') + interval '12 hours' as l) x
$$;
-- La fin d'une édition lancée à p_depart : le dimanche 22 h de la même semaine, ou celui d'après s'il reste moins de 3 jours.
create or replace function public._fin_semaine(p_depart timestamptz) returns timestamptz
language sql stable as $$
  select case when f - p_depart >= interval '3 days' then f else ((f at time zone 'Europe/Paris') + interval '7 days') at time zone 'Europe/Paris' end
  from (select (date_trunc('week', p_depart at time zone 'Europe/Paris') + interval '6 days 22 hours') at time zone 'Europe/Paris' as f) x
$$;

-- ---------------------------------------------------------------- la série
-- L'édition suivante : mêmes réglages, mêmes joueurs (s'ils sont toujours dans le cercle).
create or replace function public._edition_suivante(p_id uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare t public.tournois; n public.tournois;
begin
  select * into t from tournois where id = p_id;
  if exists (select 1 from tournois where serie = t.serie and edition > t.edition) then return null; end if;   -- déjà créée
  insert into tournois (nom, cercle_id, createur, points_par_set, sets_gagnants, duree_tour, mode, aller_retour, enjeu, hebdo, serie, edition, depart)
  values (t.nom, t.cercle_id, t.createur, t.points_par_set, t.sets_gagnants, t.duree_tour, 'championnat', t.aller_retour, t.enjeu,
          true, t.serie, t.edition + 1, _prochain_lundi_midi(now()))
  returning * into n;
  insert into inscrits_tournoi (tournoi_id, joueur)
  select n.id, i.joueur from inscrits_tournoi i
  where i.tournoi_id = p_id and exists (select 1 from membres_cercle m where m.cercle_id = t.cercle_id and m.joueur = i.joueur)
  order by i.inscrit_le;
  return n.id;
end $$;

-- Le palmarès d'une série : les éditions terminées, de la plus récente à la plus ancienne (10 au plus).
create or replace function public._palmares_serie(p_serie uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'edition', x.edition, 'fini_le', x.fini_le,
    'vainqueur', case when x.vainqueur is not null then _carte(x.vainqueur) end,
    'dernier', case when x.vainqueur is not null then (_classement_championnat(x.id)->-1)->'joueur' end) order by x.edition desc), '[]'::jsonb)
  from (select * from tournois where serie = p_serie and phase = 'termine' order by edition desc limit 10) x
$$;

-- Le minuteur : départ du lundi midi (ou report d'une semaine s'il manque des joueurs), et fin du dimanche soir.
create or replace function public._veille_championnats() returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  for t in select * from tournois where mode = 'championnat' and phase = 'inscriptions' and depart <= now() loop
    if (select count(*) from inscrits_tournoi where tournoi_id = t.id) >= 3 then perform _lancer_championnat(t.id);
    else update tournois set depart = _prochain_lundi_midi(now()) where id = t.id; end if;
  end loop;
  for t in select * from tournois where mode = 'championnat' and phase = 'en_cours' and echeance < now() loop
    perform _avancer_championnat(t.id);
  end loop;
end $$;

do $$ begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job where jobname = 'veille-championnats';
  perform cron.schedule('veille-championnats', '*/5 * * * *', 'select public._veille_championnats()');
exception when others then
  raise notice 'pg_cron indisponible ici : pas de minuteur des championnats (%)', sqlerrm;
end $$;

-- Arrêter la série : l'organisateur ou le responsable du cercle. L'édition en cours (ou en inscriptions) se joue encore.
create or replace function public.arreter_serie(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  select * into t from tournois where id = p_id;
  if t.id is null or not _voit_tournoi(t) then raise exception 'Tournoi introuvable'; end if;
  if not (t.createur = auth.uid() or (t.cercle_id is not null and _role(t.cercle_id) = 'admin')) then
    raise exception 'Seul l''organisateur ou le responsable du cercle peut arrêter la répétition';
  end if;
  update tournois set hebdo = false where serie = t.serie and phase in ('inscriptions', 'en_cours');
end $$;

-- ---------------------------------------------------------------- les nouvelles versions (étape 35)
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
    -- Chaque semaine : l'édition suivante, sauf si personne n'a joué un seul match (la série s'arrête).
    if t.hebdo then
      if exists (select 1 from matchs_tournoi where tournoi_id = p_id and fin in ('score', 'abandon')) then perform _edition_suivante(p_id);
      else update tournois set hebdo = false where id = p_id; end if;
    end if;
  end if;
end $$;

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
  update tournois set phase = 'en_cours', tour = 1, nb_tours = 1, lance_le = now(),
    echeance = case when t.serie is not null then _fin_semaine(now()) else now() + duree_tour end where id = p_id;
end $$;

drop function if exists public.creer_championnat(text, uuid, int, int, int, boolean, text);
create or replace function public.creer_championnat(p_nom text, p_cercle uuid, p_points int, p_sets int, p_jours int,
  p_aller_retour boolean default false, p_enjeu text default null, p_hebdo boolean default false) returns jsonb
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
  if coalesce(p_hebdo, false) then p_jours := 7; end if;   -- chaque semaine : du lundi midi au dimanche soir
  insert into tournois (nom, cercle_id, createur, points_par_set, sets_gagnants, duree_tour, mode, aller_retour, enjeu, hebdo, edition, depart)
  values (btrim(p_nom), p_cercle, auth.uid(), p_points, p_sets, make_interval(days => p_jours), 'championnat', coalesce(p_aller_retour, false), e,
          coalesce(p_hebdo, false), 1, case when p_hebdo then _prochain_lundi_midi(now()) end)
  returning * into t;
  if t.hebdo then update tournois set serie = t.id where id = t.id; end if;
  insert into inscrits_tournoi (tournoi_id, joueur) values (t.id, auth.uid());
  return jsonb_build_object('id', t.id, 'code', t.code);
end $$;

create or replace function public._resume_tournoi(t public.tournois) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', t.id, 'mode', t.mode, 'taille', t.taille, 'nom', t.nom, 'phase', t.phase, 'tour', t.tour, 'nb_tours', t.nb_tours, 'echeance', t.echeance,
    'points_par_set', t.points_par_set, 'sets_gagnants', t.sets_gagnants, 'duree_minutes', extract(epoch from t.duree_tour)::int / 60,
    'mise', t.mise, 'freeroll', t.freeroll, 'programme', t.programme, 'depart', t.depart, 'garantie', t.garantie, 'finale_sets', t.finale_sets,
    'enjeu', t.enjeu, 'aller_retour', t.aller_retour, 'fini_le', t.fini_le, 'hebdo', t.hebdo, 'edition', t.edition, 'serie', t.serie,
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
    'arrete_serie', t.hebdo and t.phase in ('inscriptions', 'en_cours') and (t.createur = auth.uid() or (t.cercle_id is not null and _role(t.cercle_id) = 'admin')),
    'palmares', case when t.serie is not null then _palmares_serie(t.serie) end,
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
revoke all on function public._prochain_lundi_midi(timestamptz), public._fin_semaine(timestamptz), public._edition_suivante(uuid),
  public._palmares_serie(uuid), public._veille_championnats() from public, anon, authenticated;
revoke all on function public.creer_championnat(text, uuid, int, int, int, boolean, text, boolean), public.arreter_serie(uuid) from public, anon;
grant execute on function public.creer_championnat(text, uuid, int, int, int, boolean, text, boolean), public.arreter_serie(uuid) to authenticated;
