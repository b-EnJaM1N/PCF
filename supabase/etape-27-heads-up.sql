-- HandSlam — Étape 27 : partie rapide amicale, et Sit & Go à deux (heads-up) avec ou sans mise.
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 26. Peut être relancé sans risque.
-- Si on relance un jour l'étape 14, 18 ou 24, il faut relancer celle-ci ensuite.
--
-- Décisions du porteur du projet :
--  * la partie rapide est toujours sans mise et amicale (sans effet sur le niveau officiel) ;
--  * les mises se jouent en Sit & Go, y compris à deux (heads-up) : sans mise, 50, 100, 200, 500 ou 1 000 jetons ;
--    le gagnant d'un heads-up à mise remporte toute la cagnotte (2 entrées moins 10 %, soit 1,8 fois la mise) ;
--    seul en salle depuis 2 minutes : un bot (choisi selon la mise) complète la salle, comme pour les salles de 8.

-- Chercher une partie rapide (remplace la version de l'étape 14) : la partie rapide est toujours amicale, sans effet sur le niveau.
create or replace function public.chercher_partie(p_format text, p_mise int default 0) returns jsonb
language plpgsql security definer set search_path = public as $$
declare moi uuid := auth.uid(); e public.file_rapide; autre public.file_rapide; d public.duels; niv int; m int := coalesce(p_mise, 0);
begin
  if moi is null then raise exception 'Non connecté'; end if;
  if p_format is null or p_format not in ('officiel', 'eclair') then raise exception 'Format inconnu'; end if;
  perform _verifier_mise(m);
  perform pg_advisory_xact_lock(hashtext('pcf_file_rapide'));   -- une recherche à la fois : pas de double appariement
  perform _nettoyer_file();

  -- Un adversaire m'a déjà trouvé : voici le duel.
  select * into e from file_rapide where joueur = moi;
  if e.duel_id is not null then
    delete from file_rapide where joueur = moi;
    select * into d from duels where id = e.duel_id;
    if d.id is not null and d.phase in ('presentation', 'jeu', 'entre_sets') then return jsonb_build_object('duel', to_jsonb(d)); end if;
    e := null;
  end if;

  if exists (select 1 from duels where moi in (j0, j1) and phase in ('presentation', 'jeu', 'entre_sets')) then
    delete from file_rapide where joueur = moi;
    raise exception 'Tu as déjà un duel en cours';
  end if;
  perform _assez_pour(m);

  niv := coalesce((select points from classements where joueur = moi), _classement_depart());

  -- Quelqu'un attend dans la même file (même format, même mise) et peut encore payer : le niveau le plus proche.
  select * into autre from file_rapide f
  where f.format = p_format and f.mise = m and f.joueur <> moi and f.duel_id is null
    and (m = 0 or coalesce((select solde from jetons where joueur = f.joueur), 0) >= m)
  order by abs(f.niveau - niv), f.entree limit 1;
  if autre.joueur is not null then
    insert into duels (j0, j1, points_par_set, sets_gagnants, classe, rapide, phase, echeance, mise)
    values (autre.joueur, moi, case when p_format = 'officiel' then 11 else 7 end, case when p_format = 'officiel' then 2 else 1 end,
            false, true, 'presentation', now() + _arrivee_rapide(), m)
    returning * into d;
    update file_rapide set duel_id = d.id, vu = now() where joueur = autre.joueur;
    delete from file_rapide where joueur = moi;
    return jsonb_build_object('duel', to_jsonb(d));
  end if;

  -- Personne : j'attends (ou je continue d'attendre).
  insert into file_rapide (joueur, format, niveau, mise) values (moi, p_format, niv, m)
  on conflict (joueur) do update set vu = now(), niveau = excluded.niveau, format = excluded.format, mise = excluded.mise, duel_id = null,
    entree = case when file_rapide.format = excluded.format and file_rapide.mise = excluded.mise then file_rapide.entree else now() end;
  select * into e from file_rapide where joueur = moi;
  return jsonb_build_object('attente', true, 'depuis', e.entree, 'maintenant', now(),
    'en_attente', (select count(*) from file_rapide where format = p_format and mise = m and duel_id is null));
end $$;

-- S'inscrire dans une salle (remplace la version de l'étape 14) : aussi les salles à deux (heads-up), avec ou sans mise.
create or replace function public.rejoindre_sit_and_go(p_taille int, p_mise int default 0) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.tournois; mien public.tournois; m int := coalesce(p_mise, 0);
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton compte'; end if;
  perform _verifier_mise(m);
  if m > 0 and p_taille not in (2, 8) then raise exception 'Les Sit & Go à mise se jouent à 2 ou à 8'; end if;
  if not (p_taille = any (_tailles_sng()) or p_taille = 2) then raise exception 'Taille de tournoi invalide'; end if;
  perform _nettoyer_salles();
  mien := _mon_sng();
  if mien.id is not null then raise exception 'Un seul Sit & Go à la fois : termine (ou quitte) celui en cours'; end if;
  perform _assez_pour(m);
  t := _salle(p_taille, m);
  insert into inscrits_tournoi (tournoi_id, joueur, vu) values (t.id, auth.uid(), now());
  if (select count(*) from inscrits_tournoi where tournoi_id = t.id) >= t.taille then perform _lancer_direct(t.id); end if;
  select * into t from tournois where id = t.id;
  return _resume_tournoi(t);
end $$;

-- Les salles et mon Sit & Go en cours (remplace la version de l'étape 18) : avec les salles à deux (heads-up).
create or replace function public.salles_sit_and_go() returns jsonb
language plpgsql security definer set search_path = public as $$
declare mien public.tournois; dernier public.tournois;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  perform _nettoyer_salles();
  select t.* into dernier from tournois t join inscrits_tournoi i on i.tournoi_id = t.id and i.joueur = auth.uid()
  where t.mode = 'direct' and t.freeroll is null and t.programme is null and t.phase in ('en_cours', 'termine') and t.lance_le > now() - interval '3 hours'
  order by t.lance_le desc limit 1;
  if dernier.id is not null and dernier.phase = 'en_cours' then perform _avancer_tournoi(dernier.id); select * into dernier from tournois where id = dernier.id; end if;
  mien := _mon_sng();
  if mien.id is not null and mien.phase = 'en_cours' then perform _avancer_tournoi(mien.id); mien := _mon_sng(); end if;
  return jsonb_build_object(
    'salles', (select jsonb_agg(jsonb_build_object('taille', n,
        'inscrits', (select count(*) from inscrits_tournoi i join tournois t on t.id = i.tournoi_id
                     where t.mode = 'direct' and t.freeroll is null and t.programme is null and t.phase = 'inscriptions' and t.taille = n and t.mise = 0)) order by n)
      from unnest(_tailles_sng()) n),
    'salles_mise', (select jsonb_agg(jsonb_build_object('mise', x, 'taille', 8,
        'inscrits', (select count(*) from inscrits_tournoi i join tournois t on t.id = i.tournoi_id
                     where t.mode = 'direct' and t.freeroll is null and t.programme is null and t.phase = 'inscriptions' and t.taille = 8 and t.mise = x)) order by x)
      from unnest(_mises()) x),
    'heads_up', (select jsonb_agg(jsonb_build_object('mise', x, 'taille', 2,
        'inscrits', (select count(*) from inscrits_tournoi i join tournois t on t.id = i.tournoi_id
                     where t.mode = 'direct' and t.freeroll is null and t.programme is null and t.phase = 'inscriptions' and t.taille = 2 and t.mise = x)) order by x)
      from unnest(array[0] || _mises()) x),
    'mien', case when mien.id is not null then _resume_tournoi(mien) end,
    'dernier', case when dernier.id is not null and dernier.id is distinct from mien.id then _resume_tournoi(dernier) end);
end $$;

-- Les gains d'un Sit & Go à mise (remplace la version de l'étape 24) : en heads-up, le gagnant prend tout.
create or replace function public._gains_tournoi() returns trigger
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if coalesce(new.mise, 0) <= 0 or new.programme is not null or new.phase = old.phase then return new; end if;
  if new.phase = 'annule' and old.phase in ('inscriptions', 'en_cours') then
    perform _crediter(i.joueur, new.mise, 'entrée rendue') from inscrits_tournoi i where i.tournoi_id = new.id and not _est_bot(i.joueur);
  elsif new.phase = 'termine' then
    n := (select count(*)::int from inscrits_tournoi where tournoi_id = new.id);
    if n = 2 then
      -- Heads-up : le gagnant prend toute la cagnotte (2 entrées moins 10 %), comme un duel à mise ; un bot ne gagne rien.
      if new.vainqueur is not null and not _est_bot(new.vainqueur) then
        perform _portefeuille_de(new.vainqueur);
        perform _crediter(new.vainqueur, floor(new.mise * 2 * (1 - _commission()))::int, 'Sit & Go : ' || (_noms_places())[1]);
      end if;
    else
      perform _verser_dotations(new.id, floor(new.mise * n * (1 - _commission()))::int, n, 'Sit & Go');
    end if;
  end if;
  return new;
end $$;

revoke all on function public._gains_tournoi() from public, anon, authenticated;
revoke all on function public.chercher_partie(text, int), public.rejoindre_sit_and_go(int, int), public.salles_sit_and_go() from public, anon;
grant execute on function public.chercher_partie(text, int), public.rejoindre_sit_and_go(int, int), public.salles_sit_and_go() to authenticated;
