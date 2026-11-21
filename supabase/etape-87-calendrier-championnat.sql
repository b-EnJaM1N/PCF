-- HandSlam — Étape 87 : l'organisateur décide du calendrier de son championnat.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 86. Peut être relancé sans risque.
-- Puis mettre à jour la fonction « Notifier » (supabase/functions/notifier/index.ts : deux nouvelles notifications).
--
-- Choix du porteur du projet (21 novembre) :
--  * à la création, l'organisateur choisit en jours entiers (1 à 30) la durée des poules (ou de tout le championnat, sans
--    playoffs) et, avec des playoffs, leur durée totale (1 à 30 jours), partagée entre les tours (12 heures au moins par tour) ;
--    les playoffs commencent juste après les poules. Plus de « deux tiers / un tiers » ni de minimum de 10 jours ;
--  * pendant les poules, il peut avancer ou reculer leur date limite, d'un jour ou plus (la fin reste au moins 12 heures après
--    maintenant) ; tout le calendrier se décale, et les joueurs sont prévenus ;
--  * 24 heures avant la date limite des poules, ceux qui ont encore un match à jouer reçoivent un rappel.
-- Les championnats créés avant cette étape, et ceux « chaque semaine », gardent leur calendrier (étape 66).

alter table public.tournois add column if not exists jours_playoffs int;                       -- null : l'ancien calendrier
alter table public.tournois add column if not exists rappel_echeance boolean not null default false;

-- (les championnats : de 1 à 30 jours)
alter table public.tournois drop constraint if exists tournois_duree_tour_check;
alter table public.tournois add constraint tournois_duree_tour_check
  check (duree_tour in ('15 minutes', '1 hour', '24 hours', '72 hours', '7 days', '14 days')
         or (mode = 'championnat' and duree_tour between interval '1 day' and interval '30 days'));

alter table public.notifications drop constraint if exists notifications_evenement_check;
alter table public.notifications add constraint notifications_evenement_check
  check (evenement in ('defi', 'accepte', 'tournoi', 'test', 'freeroll', 'programme', 'attend', 'invitation',
                       'ami_demande', 'ami_accepte', 'invitation_cercle',
                       'creneaux', 'rdv_fixe', 'rdv_decline', 'rdv_rappel', 'rdv_heure',
                       'poules_24h', 'calendrier'));

-- ---------------------------------------------------------------- la création
-- Remplace la version de l'étape 66. p_jours : la durée des poules (ou de tout le championnat, sans playoffs), de 1 à 30 jours ;
-- p_options.jours_playoffs : la durée des playoffs (1 à 30 jours ; sans elle, l'ancien calendrier).
create or replace function public.creer_championnat(p_nom text, p_cercle uuid, p_points int, p_sets int, p_jours int,
  p_aller_retour boolean default false, p_enjeu text default null, p_hebdo boolean default false, p_options jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.tournois; e text; o jsonb := coalesce(p_options, '{}'::jsonb); np int; po boolean;
  kp int; ks int; fp int; fs int; jpo int;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton compte'; end if;
  if p_cercle is null or _role(p_cercle) is null then raise exception 'Un championnat se joue dans un cercle dont tu fais partie'; end if;
  if p_nom is null or char_length(btrim(p_nom)) not between 2 and 40 then raise exception 'Le nom du championnat doit faire entre 2 et 40 caractères'; end if;
  if p_jours is null or p_jours not between 1 and 30 then raise exception 'Durée de championnat invalide (de 1 à 30 jours)'; end if;
  if nullif(btrim(coalesce(p_enjeu, '')), '') is not null then e := _enjeu_propre(p_enjeu); end if;
  if (select count(*) from tournois where createur = auth.uid() and phase in ('inscriptions', 'en_cours')) >= _limite_tournois() then
    raise exception 'Tu as déjà % tournois en cours : termine-les ou annule-en un', _limite_tournois();
  end if;
  np := coalesce((o->>'poules')::int, 1);
  if np not between 1 and 4 then raise exception 'De 1 à 4 poules'; end if;
  po := np > 1 or coalesce((o->>'playoffs')::boolean, false);   -- avec des poules, les playoffs sont obligatoires
  kp := (o->>'ko_points')::int; ks := (o->>'ko_sets')::int; fp := (o->>'fin_points')::int; fs := (o->>'fin_sets')::int;
  if (kp is not null and kp not in (1, 3, 7, 11)) or (fp is not null and fp not in (1, 3, 7, 11))
     or (ks is not null and ks not in (1, 2, 3)) or (fs is not null and fs not in (1, 2, 3)) then raise exception 'Format de match invalide'; end if;
  jpo := (o->>'jours_playoffs')::int;
  if jpo is not null and jpo not between 1 and 30 then raise exception 'Durée des playoffs invalide (de 1 à 30 jours)'; end if;
  if coalesce(p_hebdo, false) then p_jours := 7; jpo := null; end if;   -- chaque semaine : du lundi midi au dimanche soir
  if not po then jpo := null; end if;
  insert into tournois (nom, cercle_id, createur, points_par_set, sets_gagnants, duree_tour, mode, aller_retour, enjeu, hebdo, edition, depart,
                        nb_poules, playoffs, ko_points, ko_sets, fin_points, fin_sets, garder_poules, jours_playoffs)
  values (btrim(p_nom), p_cercle, auth.uid(), p_points, p_sets, make_interval(days => p_jours), 'championnat', coalesce(p_aller_retour, false) and np = 1, e,
          coalesce(p_hebdo, false), 1, case when p_hebdo then _prochain_lundi_midi(now()) end,
          np, po, case when po then kp end, case when po then ks end, case when po then fp end, case when po then fs end,
          coalesce((o->>'garder_poules')::boolean, false), jpo)
  returning * into t;
  if t.hebdo then update tournois set serie = t.id where id = t.id; end if;
  insert into inscrits_tournoi (tournoi_id, joueur) values (t.id, auth.uid());
  return jsonb_build_object('id', t.id, 'code', t.code);
end $$;

-- ---------------------------------------------------------------- le lancement
-- Remplace la version de l'étape 66 : avec jours_playoffs, le calendrier de l'organisateur (les poules pendant duree_tour, puis les
-- playoffs pendant jours_playoffs, 12 heures au moins par tour) ; sinon, l'ancien calendrier.
create or replace function public._lancer_championnat(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; n int; nbp int; mini int; tours int; v_fin timestamptz; v_ech timestamptz; v_tranche interval;
  js uuid[]; i int; k int; q int; pos int := 0;
begin
  select * into t from tournois where id = p_id for update;
  n := (select count(*) from inscrits_tournoi where tournoi_id = p_id);
  if n < 3 then raise exception 'Il faut au moins 3 joueurs pour lancer le championnat'; end if;
  nbp := _composer_poules(p_id, t.nb_poules);
  for q in 0 .. nbp - 1 loop
    js := array(select joueur from inscrits_tournoi where tournoi_id = p_id and poule = q order by inscrit_le, joueur);
    for i in 1 .. coalesce(array_length(js, 1), 0) - 1 loop
      for k in i + 1 .. array_length(js, 1) loop
        pos := pos + 1; insert into matchs_tournoi (tournoi_id, tour, position, j0, j1) values (p_id, 1, pos, js[i], js[k]);
        if t.aller_retour and nbp = 1 then   -- (avec des poules : aller simple)
          pos := pos + 1; insert into matchs_tournoi (tournoi_id, tour, position, j0, j1) values (p_id, 1, pos, js[k], js[i]);
        end if;
      end loop;
    end loop;
  end loop;
  mini := (select min(c) from (select count(*) c from inscrits_tournoi where tournoi_id = p_id group by poule) z);
  tours := case when t.playoffs or nbp > 1 then _tours_ko(nbp, mini, n) else 0 end;
  if t.jours_playoffs is not null and t.serie is null then
    -- (21 novembre) le calendrier choisi par l'organisateur
    v_ech := now() + t.duree_tour;
    v_tranche := case when tours > 0 then greatest(make_interval(days => t.jours_playoffs) / tours, interval '12 hours') end;
    v_fin := v_ech + coalesce(v_tranche * tours, interval '0');
  else
    -- (étape 66) la fin de tout le championnat : 10 jours au moins avec 3 tours d'élimination directe ; chaque semaine → toutes les 2 semaines
    v_fin := case when t.serie is not null then _fin_semaine(now()) + case when tours >= 3 then interval '7 days' else interval '0' end
                else now() + greatest(t.duree_tour, case when tours >= 3 then interval '10 days' else interval '0' end) end;
    v_ech := case when tours > 0 then now() + (v_fin - now()) * 2 / 3 else v_fin end;
    v_tranche := case when tours > 0 then (v_fin - now()) / 3 / tours end;
  end if;
  update tournois set phase = 'en_cours', tour = 1, nb_tours = 1 + tours, lance_le = now(), nb_poules = nbp, playoffs = (tours > 0),
    fin_prevue = v_fin, echeance = v_ech, tranche_ko = v_tranche, rappel_echeance = false
  where id = p_id;
end $$;

-- ---------------------------------------------------------------- avancer ou reculer la date limite des poules
-- L'organisateur, pendant les poules (ou la saison, sans playoffs) : p_jours (de -30 à 30, pas 0) ; la date limite reste au moins
-- 12 heures après maintenant. Tout le calendrier se décale, et les autres joueurs sont prévenus.
create or replace function public.decaler_calendrier(p_id uuid, p_jours int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.tournois; v_ech timestamptz; j uuid;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  select * into t from tournois where id = p_id for update;
  if t.id is null or t.mode <> 'championnat' then raise exception 'Championnat introuvable'; end if;
  if t.createur <> auth.uid() then raise exception 'Seul l''organisateur peut changer le calendrier'; end if;
  if t.serie is not null then raise exception 'Le championnat de chaque semaine garde son calendrier (du lundi au dimanche)'; end if;
  if t.phase <> 'en_cours' or t.tour <> 1 then raise exception 'On ne peut changer la date limite que pendant les poules'; end if;
  if p_jours is null or p_jours = 0 or p_jours not between -30 and 30 then raise exception 'De 1 à 30 jours'; end if;
  v_ech := t.echeance + make_interval(days => p_jours);
  if v_ech < now() + interval '12 hours' then raise exception 'Trop tôt : la date limite doit rester au moins 12 heures après maintenant'; end if;
  update tournois set echeance = v_ech, fin_prevue = fin_prevue + make_interval(days => p_jours),
    rappel_echeance = rappel_echeance and v_ech <= now() + interval '24 hours'
  where id = p_id;
  for j in select joueur from inscrits_tournoi where tournoi_id = p_id and joueur <> auth.uid() loop
    perform _notifier_creneau(j, 'calendrier', auth.uid(), p_id, v_ech);
  end loop;
  return voir_tournoi(p_id);
end $$;

-- ---------------------------------------------------------------- le rappel, 24 heures avant la date limite des poules
-- Remplace la version de l'étape 51 : en plus, le rappel à ceux qui ont encore un match de poule (ou de la saison) à jouer.
create or replace function public._veille_championnats() returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; j uuid;
begin
  for t in select * from tournois where mode = 'championnat' and phase = 'inscriptions' and depart <= now() loop
    if (select count(*) from inscrits_tournoi where tournoi_id = t.id) >= 3 then perform _lancer_championnat(t.id);
    else update tournois set depart = _prochain_lundi_midi(now()) where id = t.id; end if;
  end loop;
  for t in select * from tournois where mode = 'championnat' and phase = 'en_cours' and echeance < now() loop
    perform _avancer_championnat(t.id);
  end loop;
  for t in select * from tournois where mode = 'championnat' and phase = 'en_cours' and tour = 1 and not rappel_echeance
           and echeance > now() and echeance <= now() + interval '24 hours' loop
    update tournois set rappel_echeance = true where id = t.id;
    for j in select distinct x.joueur from matchs_tournoi m, lateral (values (m.j0), (m.j1)) x (joueur)
             where m.tournoi_id = t.id and m.tour = 1 and m.fin is null and x.joueur is not null
               and not exists (select 1 from bots_en_ligne b where b.joueur = x.joueur) loop
      perform _notifier_creneau(j, 'poules_24h', null, t.id, t.echeance);
    end loop;
  end loop;
end $$;

-- ---------------------------------------------------------------- ce que voit l'appli
-- Remplace la version de l'étape 66 : avec la durée des playoffs (jours_playoffs) et la date limite des poules.
create or replace function public._resume_tournoi(t public.tournois) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', t.id, 'mode', t.mode, 'taille', t.taille, 'nom', t.nom, 'phase', t.phase, 'tour', t.tour, 'nb_tours', t.nb_tours, 'echeance', t.echeance,
    'points_par_set', t.points_par_set, 'sets_gagnants', t.sets_gagnants, 'duree_minutes', extract(epoch from t.duree_tour)::int / 60,
    'mise', t.mise, 'freeroll', t.freeroll, 'programme', t.programme, 'depart', t.depart, 'garantie', t.garantie, 'finale_sets', t.finale_sets,
    'enjeu', t.enjeu, 'aller_retour', t.aller_retour, 'fini_le', t.fini_le, 'hebdo', t.hebdo, 'edition', t.edition, 'serie', t.serie,
    'nb_poules', t.nb_poules, 'playoffs', t.playoffs, 'ko_points', t.ko_points, 'ko_sets', t.ko_sets, 'fin_points', t.fin_points,
    'fin_sets', t.fin_sets, 'garder_poules', t.garder_poules, 'fin_prevue', t.fin_prevue, 'jours_playoffs', t.jours_playoffs,
    'premier_saison', case when t.premier_saison is not null then _carte(t.premier_saison) end,
    'dernier', case when t.dernier is not null then _carte(t.dernier) end,
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

-- ---------------------------------------------------------------- sécurité
revoke all on function public._lancer_championnat(uuid), public._veille_championnats() from public, anon, authenticated;
revoke all on function public.creer_championnat(text, uuid, int, int, int, boolean, text, boolean, jsonb), public.decaler_calendrier(uuid, int) from public, anon;
grant execute on function public.creer_championnat(text, uuid, int, int, int, boolean, text, boolean, jsonb), public.decaler_calendrier(uuid, int) to authenticated;
