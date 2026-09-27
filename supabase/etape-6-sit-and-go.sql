-- PCF — Étape 6 : tournois « Sit & Go » publics, en direct.
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 5. Peut être relancé sans risque.
-- Si on relance un jour les étapes 3 ou 5, il faut relancer celle-ci ensuite.
--
-- Principes :
--  * des salles publiques de 8, 16, 32 et 64 joueurs ; le tournoi démarre dès que la salle est pleine ;
--  * il faut rester dans l'application : un inscrit sans signe de vie depuis 45 s est retiré de la salle ;
--  * élimination directe, têtes de série selon le niveau officiel, format officiel (sets de 11, 2 sets gagnants) ;
--  * chaque match démarre tout seul dès que les deux joueurs sont libres ; 60 secondes pour arriver,
--    sinon victoire par forfait de l'adversaire (et si aucun des deux n'arrive, la meilleure tête de série passe).

alter table public.tournois add column if not exists mode text not null default 'libre';
alter table public.tournois drop constraint if exists tournois_mode_check;
alter table public.tournois add constraint tournois_mode_check check (mode in ('libre', 'direct'));
alter table public.tournois add column if not exists taille int;
alter table public.inscrits_tournoi add column if not exists vu timestamptz not null default now();   -- dernier signe de vie en salle

create or replace function public._tailles_sng() returns int[] language sql immutable as $$ select array[8, 16, 32, 64] $$;
create or replace function public._arrivee() returns interval language sql immutable as $$ select interval '60 seconds' $$;
create or replace function public._absence_salle() returns interval language sql immutable as $$ select interval '45 seconds' $$;

-- ---------------------------------------------------------------- faire avancer un tournoi
-- Tournois « libres » (étape 5) : inchangé, sous un autre nom.
create or replace function public._avancer_libre(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; m public.matchs_tournoi; d public.duels; g uuid; p int; a uuid; b uuid; tardif boolean;
begin
  loop
    select * into t from tournois where id = p_id for update;
    exit when t.id is null or t.phase <> 'en_cours';

    -- Un seul joueur (exempt, ou adversaire qui a supprimé son compte) : il passe.
    update matchs_tournoi set vainqueur = coalesce(j0, j1), fin = 'exempt'
    where tournoi_id = p_id and tour = t.tour and fin is null and (j0 is null or j1 is null);

    -- Date limite dépassée : les matchs pas joués (et pas en cours) sont attribués.
    tardif := now() > t.echeance;
    if tardif then
      for m in select * from matchs_tournoi where tournoi_id = p_id and tour = t.tour and fin is null for update loop
        select * into d from duels where id = m.duel_id;
        continue when d.id is not null and d.phase in ('presentation', 'jeu', 'entre_sets');   -- on le laisse finir
        if d.id is not null and d.phase = 'attente' then
          perform set_config('pcf.interne', '1', true);
          update duels set phase = 'annule', maj_le = now() where id = d.id;
          perform set_config('pcf.interne', '', true);
        end if;
        if (m.essai0 is not null) <> (m.essai1 is not null) then
          update matchs_tournoi set vainqueur = case when m.essai0 is not null then m.j0 else m.j1 end, fin = 'forfait' where id = m.id;
        else
          update matchs_tournoi set vainqueur = case when _tete(p_id, m.j0) <= _tete(p_id, m.j1) then m.j0 else m.j1 end, fin = 'tete_de_serie' where id = m.id;
        end if;
      end loop;
    end if;

    -- Tour terminé ?
    exit when exists (select 1 from matchs_tournoi where tournoi_id = p_id and tour = t.tour and fin is null);
    if t.tour >= t.nb_tours then
      select vainqueur into g from matchs_tournoi where tournoi_id = p_id and tour = t.tour and position = 1;
      update tournois set phase = 'termine', vainqueur = g, echeance = null, fini_le = now() where id = p_id;
      exit;
    end if;
    -- Tour suivant : le vainqueur du match 2p-1 contre celui du match 2p.
    for p in 1 .. (select count(*) from matchs_tournoi where tournoi_id = p_id and tour = t.tour) / 2 loop
      select vainqueur into a from matchs_tournoi where tournoi_id = p_id and tour = t.tour and position = 2 * p - 1;
      select vainqueur into b from matchs_tournoi where tournoi_id = p_id and tour = t.tour and position = 2 * p;
      insert into matchs_tournoi (tournoi_id, tour, position, j0, j1) values (p_id, t.tour + 1, p, a, b);
    end loop;
    -- Si le tour s'est fini en avance, le suivant démarre maintenant ; sinon, à la date limite du précédent.
    update tournois set tour = tour + 1, echeance = (case when tardif then t.echeance else now() end) + duree_tour where id = p_id;
  end loop;
end $$;

-- Tournois en direct : les matchs s'enchaînent sans attendre la fin du tour.
create or replace function public._avancer_direct(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; m public.matchs_tournoi; d public.duels; k int; p int; a uuid; b uuid; change boolean; p0 boolean; p1 boolean;
begin
  loop
    change := false;
    select * into t from tournois where id = p_id for update;
    exit when t.id is null or t.phase <> 'en_cours';

    -- Adversaire disparu (compte supprimé) : l'autre passe.
    update matchs_tournoi set vainqueur = coalesce(j0, j1), fin = 'exempt'
    where tournoi_id = p_id and fin is null and (j0 is null or j1 is null);
    if found then change := true; end if;

    -- 60 secondes pour arriver à son match.
    for m in select * from matchs_tournoi where tournoi_id = p_id and fin is null and duel_id is not null loop
      select * into d from duels where id = m.duel_id;
      continue when d.id is null or d.phase <> 'presentation' or now() <= d.echeance + interval '5 seconds';
      p0 := exists (select 1 from presences where duel_id = d.id and joueur = 0);
      p1 := exists (select 1 from presences where duel_id = d.id and joueur = 1);
      if p0 <> p1 then
        update duels set phase = 'termine', vainqueur = case when p0 then 0 else 1 end, fin = 'forfait', echeance = null, maj_le = now() where id = d.id;
        change := true;
      elsif not p0 and not p1 then
        perform set_config('pcf.interne', '1', true);
        update duels set phase = 'annule', maj_le = now() where id = d.id;
        perform set_config('pcf.interne', '', true);
        update matchs_tournoi set vainqueur = case when _tete(p_id, m.j0) <= _tete(p_id, m.j1) then m.j0 else m.j1 end, fin = 'tete_de_serie'
        where id = m.id and fin is null;
        change := true;
      end if;
    end loop;

    -- Les matchs prêts démarrent : les deux joueurs sont appelés.
    for m in select * from matchs_tournoi where tournoi_id = p_id and fin is null and duel_id is null and j0 is not null and j1 is not null loop
      insert into duels (j0, j1, points_par_set, sets_gagnants, classe, tournoi_id, tournoi_match, phase, echeance)
      values (m.j0, m.j1, t.points_par_set, t.sets_gagnants, t.points_par_set >= 7 and t.sets_gagnants > 1, p_id, m.id, 'presentation', now() + _arrivee())
      returning * into d;
      update matchs_tournoi set duel_id = d.id where id = m.id;
    end loop;

    -- Le tour suivant se remplit match par match.
    for k in 1 .. t.nb_tours - 1 loop
      for p in 1 .. (t.taille >> k) / 2 loop
        continue when exists (select 1 from matchs_tournoi where tournoi_id = p_id and tour = k + 1 and position = p);
        continue when (select count(*) from matchs_tournoi where tournoi_id = p_id and tour = k and position in (2 * p - 1, 2 * p) and fin is not null) < 2;
        select vainqueur into a from matchs_tournoi where tournoi_id = p_id and tour = k and position = 2 * p - 1;
        select vainqueur into b from matchs_tournoi where tournoi_id = p_id and tour = k and position = 2 * p;
        insert into matchs_tournoi (tournoi_id, tour, position, j0, j1) values (p_id, k + 1, p, a, b);
        update tournois set tour = greatest(tour, k + 1) where id = p_id;
        change := true;
      end loop;
    end loop;

    -- Finale jouée : le tournoi est fini.
    if exists (select 1 from matchs_tournoi where tournoi_id = p_id and tour = t.nb_tours and fin is not null) then
      update tournois set phase = 'termine', echeance = null, fini_le = now(),
        vainqueur = (select vainqueur from matchs_tournoi where tournoi_id = p_id and tour = t.nb_tours and position = 1)
      where id = p_id;
      exit;
    end if;
    exit when not change;
  end loop;
end $$;

create or replace function public._avancer_tournoi(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if (select mode from tournois where id = p_id) = 'direct' then perform _avancer_direct(p_id);
  else perform _avancer_libre(p_id); end if;
end $$;

-- Les Sit & Go sont publics : tout joueur connecté peut les voir.
create or replace function public._voit_tournoi(t public.tournois) returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and (
    t.createur = auth.uid()
    or exists (select 1 from inscrits_tournoi where tournoi_id = t.id and joueur = auth.uid())
    or t.mode = 'direct'                                          -- Sit & Go : publics
    or (t.cercle_id is not null and exists (select 1 from membres_cercle where cercle_id = t.cercle_id and joueur = auth.uid())))
$$;

create or replace function public._resume_tournoi(t public.tournois) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', t.id, 'mode', t.mode, 'taille', t.taille, 'nom', t.nom, 'phase', t.phase, 'tour', t.tour, 'nb_tours', t.nb_tours, 'echeance', t.echeance,
    'points_par_set', t.points_par_set, 'sets_gagnants', t.sets_gagnants, 'duree_minutes', extract(epoch from t.duree_tour)::int / 60,
    'cercle', (select jsonb_build_object('id', c.id, 'nom', c.nom, 'blason', c.blason) from cercles c where c.id = t.cercle_id),
    'inscrits', (select count(*) from inscrits_tournoi where tournoi_id = t.id),
    'inscrit', exists (select 1 from inscrits_tournoi where tournoi_id = t.id and joueur = auth.uid()),
    'createur', t.createur = auth.uid(),
    'vainqueur', case when t.vainqueur is not null then _carte(t.vainqueur) end,
    -- mon match du tour en cours, s'il reste à jouer
    'a_jouer', exists (select 1 from matchs_tournoi m where m.tournoi_id = t.id and m.tour = t.tour and m.fin is null
                         and t.phase = 'en_cours' and auth.uid() in (m.j0, m.j1)),
    'elimine', t.phase = 'en_cours' and exists (select 1 from matchs_tournoi m where m.tournoi_id = t.id and m.fin is not null
                         and auth.uid() in (m.j0, m.j1) and m.vainqueur is distinct from auth.uid()))
$$;

-- Match de tournoi : un adversaire qui n'arrive pas dans les 60 secondes perd par forfait (remplace la version de l'étape 3).
create or replace function public.reclamer(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare d public.duels; moi smallint; lui smallint; vu_lui timestamptz; absent boolean; s int;
begin
  select * into d from duels where id = p_id for update;
  if d is null then raise exception 'Duel introuvable'; end if;
  moi := _ma_place(d); lui := 1 - moi;
  perform _presence(p_id, moi);

  if d.phase = 'presentation' and now() > d.echeance and d.tournoi_id is not null
     and not exists (select 1 from presences where duel_id = p_id and joueur = lui) then
    -- Match de tournoi : l'adversaire n'est jamais arrivé (60 secondes) : victoire par forfait.
    update duels set phase = 'termine', vainqueur = moi, fin = 'forfait', echeance = null, maj_le = now() where id = p_id;
  elsif d.phase in ('presentation', 'entre_sets') and now() > d.echeance then
    perform _demarrer(p_id);
  elsif d.phase = 'jeu' then
    select vu into vu_lui from presences where duel_id = p_id and joueur = lui;
    absent := vu_lui is null or vu_lui < now() - _absence();
    if absent and d.pause_depuis is null then
      update duels set pause_depuis = now(), maj_le = now() where id = p_id;
    elsif absent and now() > d.pause_depuis + _forfait() then
      update duels set phase = 'termine', vainqueur = moi, fin = 'forfait', echeance = null, pause_depuis = null, maj_le = now()
      where id = p_id;
    elsif not absent and d.pause_depuis is not null then
      update duels set pause_depuis = null, echeance = now() + _duree_coup(), maj_le = now() where id = p_id;
    elsif not absent and now() > d.echeance + _tolerance() then
      -- Temps écoulé : un signe au hasard pour celui qui n'a pas joué.
      for s in 0..1 loop
        insert into coups_secrets (duel_id, manche, joueur, signe, auto)
        values (p_id, d.manche, s, floor(random() * 3)::smallint, true)
        on conflict do nothing;
      end loop;
      perform _resoudre(p_id);
    end if;
  end if;
  select * into d from duels where id = p_id;
  return jsonb_build_object('maintenant', now(), 'duel', to_jsonb(d));
end $$;


-- Lancer un tournoi libre (remplace la version de l'étape 5 : même contenu, variable renommée
-- pour ne pas être confondue avec la nouvelle colonne « taille »).
create or replace function public.lancer_tournoi(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; n int; v_taille int; o int[]; p int; a uuid; b uuid;
begin
  select * into t from tournois where id = p_id for update;
  if t.id is null or not _organise(t) then raise exception 'Seul l''organisateur peut lancer le tournoi'; end if;
  if t.phase <> 'inscriptions' then raise exception 'Ce tournoi a déjà commencé'; end if;
  n := (select count(*) from inscrits_tournoi where tournoi_id = p_id);
  if n < 3 then raise exception 'Il faut au moins 3 joueurs pour lancer le tournoi'; end if;
  -- Têtes de série : par niveau officiel, puis par ordre d'inscription.
  update inscrits_tournoi i set tete = r.rang
  from (select x.joueur, row_number() over (order by coalesce(c.points, _classement_depart()) desc, x.inscrit_le, x.joueur) as rang
        from inscrits_tournoi x left join classements c on c.joueur = x.joueur where x.tournoi_id = p_id) r
  where i.tournoi_id = p_id and i.joueur = r.joueur;
  v_taille := 2; while v_taille < n loop v_taille := v_taille * 2; end loop;
  o := _ordre_tableau(v_taille);
  for p in 1 .. v_taille / 2 loop
    select joueur into a from inscrits_tournoi where tournoi_id = p_id and tete = o[2 * p - 1];
    select joueur into b from inscrits_tournoi where tournoi_id = p_id and tete = o[2 * p];
    insert into matchs_tournoi (tournoi_id, tour, position, j0, j1) values (p_id, 1, p, a, b);
    a := null; b := null;
  end loop;
  update tournois set phase = 'en_cours', tour = 1, nb_tours = round(log(2, v_taille))::int, echeance = now() + duree_tour, lance_le = now()
  where id = p_id;
  perform _avancer_tournoi(p_id);
end $$;

-- ---------------------------------------------------------------- les salles
-- Retire des salles les inscrits sans signe de vie.
create or replace function public._nettoyer_salles() returns void
language sql security definer set search_path = public as $$
  delete from inscrits_tournoi i using tournois t
  where t.id = i.tournoi_id and t.mode = 'direct' and t.phase = 'inscriptions' and i.vu < now() - _absence_salle();
$$;

-- La salle ouverte d'une taille donnée (créée si besoin).
create or replace function public._salle(p_taille int) returns public.tournois
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  perform pg_advisory_xact_lock(hashtext('pcf-sng-' || p_taille));
  select * into t from tournois where mode = 'direct' and phase = 'inscriptions' and taille = p_taille order by cree_le limit 1 for update;
  if t.id is null then
    insert into tournois (nom, cercle_id, createur, points_par_set, sets_gagnants, duree_tour, mode, taille)
    values ('Sit & Go · ' || p_taille || ' joueurs', null, null, 11, 2, interval '1 hour', 'direct', p_taille) returning * into t;
  end if;
  return t;
end $$;

-- Mon Sit & Go en cours (en salle, ou en course), s'il y en a un.
create or replace function public._mon_sng() returns public.tournois
language sql stable security definer set search_path = public as $$
  select t.* from tournois t join inscrits_tournoi i on i.tournoi_id = t.id and i.joueur = auth.uid()
  where t.mode = 'direct' and (t.phase = 'inscriptions' or (t.phase = 'en_cours' and not exists (
    select 1 from matchs_tournoi m where m.tournoi_id = t.id and m.fin is not null and auth.uid() in (m.j0, m.j1) and m.vainqueur is distinct from auth.uid())))
  order by t.cree_le desc limit 1
$$;

-- Démarre un Sit & Go complet.
create or replace function public._lancer_direct(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; o int[]; p int; a uuid; b uuid;
begin
  select * into t from tournois where id = p_id for update;
  update inscrits_tournoi i set tete = r.rang
  from (select x.joueur, row_number() over (order by coalesce(c.points, _classement_depart()) desc, x.inscrit_le, x.joueur) as rang
        from inscrits_tournoi x left join classements c on c.joueur = x.joueur where x.tournoi_id = p_id) r
  where i.tournoi_id = p_id and i.joueur = r.joueur;
  o := _ordre_tableau(t.taille);
  for p in 1 .. t.taille / 2 loop
    select joueur into a from inscrits_tournoi where tournoi_id = p_id and tete = o[2 * p - 1];
    select joueur into b from inscrits_tournoi where tournoi_id = p_id and tete = o[2 * p];
    insert into matchs_tournoi (tournoi_id, tour, position, j0, j1) values (p_id, 1, p, a, b);
  end loop;
  update tournois set phase = 'en_cours', tour = 1, nb_tours = round(log(2, t.taille))::int, echeance = null, lance_le = now() where id = p_id;
  perform _avancer_tournoi(p_id);
end $$;

-- Les salles (combien d'inscrits dans chacune) et mon Sit & Go en cours.
create or replace function public.salles_sit_and_go() returns jsonb
language plpgsql security definer set search_path = public as $$
declare mien public.tournois; dernier public.tournois;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  perform _nettoyer_salles();
  -- Mon dernier Sit & Go (éliminé, ou terminé depuis moins de 3 heures), pour en montrer le résultat.
  select t.* into dernier from tournois t join inscrits_tournoi i on i.tournoi_id = t.id and i.joueur = auth.uid()
  where t.mode = 'direct' and t.phase in ('en_cours', 'termine') and t.lance_le > now() - interval '3 hours'
  order by t.lance_le desc limit 1;
  if dernier.id is not null and dernier.phase = 'en_cours' then perform _avancer_tournoi(dernier.id); select * into dernier from tournois where id = dernier.id; end if;
  mien := _mon_sng();
  if mien.id is not null and mien.phase = 'en_cours' then perform _avancer_tournoi(mien.id); mien := _mon_sng(); end if;
  return jsonb_build_object(
    'salles', (select jsonb_agg(jsonb_build_object('taille', n,
        'inscrits', (select count(*) from inscrits_tournoi i join tournois t on t.id = i.tournoi_id
                     where t.mode = 'direct' and t.phase = 'inscriptions' and t.taille = n)) order by n)
      from unnest(_tailles_sng()) n),
    'mien', case when mien.id is not null then _resume_tournoi(mien) end,
    'dernier', case when dernier.id is not null and dernier.id is distinct from mien.id then _resume_tournoi(dernier) end);
end $$;

-- S'inscrire dans la salle d'une taille donnée ; le tournoi démarre dès qu'elle est pleine.
create or replace function public.rejoindre_sit_and_go(p_taille int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.tournois; mien public.tournois;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton compte'; end if;
  if not (p_taille = any (_tailles_sng())) then raise exception 'Taille de tournoi invalide'; end if;
  perform _nettoyer_salles();
  mien := _mon_sng();
  if mien.id is not null then raise exception 'Un seul Sit & Go à la fois : termine (ou quitte) celui en cours'; end if;
  t := _salle(p_taille);
  insert into inscrits_tournoi (tournoi_id, joueur, vu) values (t.id, auth.uid(), now());
  if (select count(*) from inscrits_tournoi where tournoi_id = t.id) >= t.taille then perform _lancer_direct(t.id); end if;
  select * into t from tournois where id = t.id;
  return _resume_tournoi(t);
end $$;

-- Signe de vie en salle (toutes les quelques secondes) ; renvoie l'état de mon Sit & Go.
create or replace function public.presence_sit_and_go() returns jsonb
language plpgsql security definer set search_path = public as $$
declare mien public.tournois;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  update inscrits_tournoi i set vu = now() from tournois t
  where t.id = i.tournoi_id and i.joueur = auth.uid() and t.mode = 'direct' and t.phase = 'inscriptions';
  mien := _mon_sng();
  return case when mien.id is not null then _resume_tournoi(mien) end;
end $$;

create or replace function public.quitter_sit_and_go() returns void
language sql security definer set search_path = public as $$
  delete from inscrits_tournoi i using tournois t
  where t.id = i.tournoi_id and i.joueur = auth.uid() and t.mode = 'direct' and t.phase = 'inscriptions';
$$;

-- ---------------------------------------------------------------- sécurité
revoke all on function public._avancer_libre(uuid), public._avancer_direct(uuid), public._avancer_tournoi(uuid),
  public._nettoyer_salles(), public._salle(int), public._mon_sng(), public._lancer_direct(uuid),
  public._voit_tournoi(public.tournois), public._resume_tournoi(public.tournois) from public, anon, authenticated;
revoke all on function public.salles_sit_and_go(), public.rejoindre_sit_and_go(int), public.presence_sit_and_go(),
  public.quitter_sit_and_go(), public.reclamer(uuid), public.lancer_tournoi(uuid) from public, anon;
grant execute on function public.salles_sit_and_go(), public.rejoindre_sit_and_go(int), public.presence_sit_and_go(),
  public.quitter_sit_and_go(), public.reclamer(uuid), public.lancer_tournoi(uuid) to authenticated;
