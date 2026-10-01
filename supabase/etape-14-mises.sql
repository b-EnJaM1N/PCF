-- PCF — Étape 14 : les mises en jetons (duel à mise, défi avec mise, Sit & Go à mise).
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 13. Peut être relancé sans risque.
-- Si on relance un jour les étapes 3, 4, 4b, 6 ou 7, il faut relancer celle-ci ensuite.
--
-- Principes :
--  * mises possibles : 50, 100, 200, 500 ou 1 000 jetons (0 = sans mise) ;
--  * duel : chaque joueur paie sa mise quand le match commence (présentation) ; le gagnant reçoit 1,8 fois la mise
--    (10 % de commission, qui disparaît) ; duel annulé (adversaire jamais arrivé, défi refusé…) : chacun est remboursé ;
--  * Sit & Go à mise : salles de 8 ; l'entrée est payée à l'inscription et rendue si on quitte la salle avant le départ ;
--    à la fin, la cagnotte (moins 10 %) est partagée : 50 % au 1er, 30 % au 2e, 10 % aux 3e et 4e.

create or replace function public._mises() returns int[] language sql immutable as $$ select array[50, 100, 200, 500, 1000] $$;
create or replace function public._commission() returns numeric language sql immutable as $$ select 0.10 $$;

alter table public.duels add column if not exists mise int not null default 0;
alter table public.duels add column if not exists mise_payee boolean not null default false;   -- les deux mises ont été prélevées
alter table public.duels add column if not exists mise_reglee boolean not null default false;  -- gains versés (ou mises rendues)
alter table public.tournois add column if not exists mise int not null default 0;
alter table public.file_rapide add column if not exists mise int not null default 0;

-- Le portefeuille d'un joueur (créé avec les 1 000 jetons de bienvenue s'il n'en a pas encore).
create or replace function public._portefeuille_de(p_joueur uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into jetons (joueur) values (p_joueur) on conflict (joueur) do nothing;
  if found then perform _crediter(p_joueur, 1000, 'bienvenue'); end if;
end $$;
create or replace function public._mon_portefeuille() returns public.jetons
language plpgsql security definer set search_path = public as $$
declare j public.jetons;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton profil'; end if;
  perform _portefeuille_de(auth.uid());
  select * into j from jetons where joueur = auth.uid() for update;
  return j;
end $$;
create or replace function public._solde(p_joueur uuid) returns int
language plpgsql security definer set search_path = public as $$
begin
  perform _portefeuille_de(p_joueur);
  return (select solde from jetons where joueur = p_joueur);
end $$;
create or replace function public._verifier_mise(p_mise int) returns void
language plpgsql immutable as $$
begin
  if coalesce(p_mise, 0) <> 0 and not (p_mise = any (_mises())) then raise exception 'Mise invalide'; end if;
end $$;
-- Assez de jetons pour cette mise ? (pour moi)
create or replace function public._assez_pour(p_mise int) returns void
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(p_mise, 0) > 0 and _solde(auth.uid()) < p_mise then
    raise exception 'Pas assez de jetons pour une mise de % (tu en as %)', p_mise, _solde(auth.uid());
  end if;
end $$;

-- ---------------------------------------------------------------- duels : prélèvement et règlement automatiques
create or replace function public._mise_duel() returns trigger
language plpgsql security definer set search_path = public as $$
declare gain int; i int; joueurs uuid[];
begin
  if new.mise <= 0 then return new; end if;
  joueurs := array[new.j0, new.j1];
  -- Le match commence : les deux mises sont prélevées.
  if new.phase = 'presentation' and not new.mise_payee and new.j1 is not null then
    for i in 1 .. 2 loop
      if _solde(joueurs[i]) < new.mise then
        raise exception '%', case when joueurs[i] = auth.uid() then format('Pas assez de jetons pour une mise de %s', new.mise)
                                  else format('Ton adversaire n''a plus assez de jetons pour une mise de %s', new.mise) end;
      end if;
    end loop;
    perform _crediter(new.j0, -new.mise, 'mise de duel');
    perform _crediter(new.j1, -new.mise, 'mise de duel');
    new.mise_payee := true;
  end if;
  -- Le match est fini : le gagnant prend la cagnotte (moins la commission). Annulé : chacun récupère sa mise.
  if new.mise_payee and not new.mise_reglee and new.phase in ('termine', 'annule', 'refuse') then
    if new.phase = 'termine' and new.vainqueur is not null then
      gain := floor(2 * new.mise * (1 - _commission()));
      perform _crediter(joueurs[new.vainqueur + 1], gain, 'gain de duel');
    else
      perform _crediter(new.j0, new.mise, 'mise rendue');
      perform _crediter(new.j1, new.mise, 'mise rendue');
    end if;
    new.mise_reglee := true;
  end if;
  return new;
end $$;
drop trigger if exists duels_mise on public.duels;
create trigger duels_mise before insert or update on public.duels for each row execute function public._mise_duel();

-- Lancer un défi (remplace la version de l'étape 4b) : avec une mise facultative.
drop function if exists public.lancer_defi(uuid, int, int, boolean);
create or replace function public.lancer_defi(p_adversaire uuid, p_points int, p_sets int, p_classe boolean default true, p_mise int default 0)
returns public.duels language plpgsql security definer set search_path = public as $$
declare d public.duels;
begin
  perform _verifier_mise(p_mise);
  perform _assez_pour(p_mise);
  d := creer_duel(p_adversaire, p_points, p_sets);
  update duels set classe = coalesce(p_classe, true) and p_sets > 1 and p_points >= 7, mise = coalesce(p_mise, 0)
  where id = d.id returning * into d;
  return d;
end $$;

-- ---------------------------------------------------------------- partie rapide : une file par format et par mise
drop function if exists public.chercher_partie(text);
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
            p_format = 'officiel', true, 'presentation', now() + _arrivee_rapide(), m)
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

-- Combien de joueurs attendent dans chaque file (sans mise), et dans les files à mise (tous formats confondus).
create or replace function public.file_partie_rapide() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  perform _nettoyer_file();
  return jsonb_build_object(
    'officiel', (select count(*) from file_rapide where format = 'officiel' and mise = 0 and duel_id is null and joueur <> auth.uid()),
    'eclair', (select count(*) from file_rapide where format = 'eclair' and mise = 0 and duel_id is null and joueur <> auth.uid()),
    'mises', (select coalesce(jsonb_object_agg(format || '_' || mise, n), '{}'::jsonb) from (
      select format, mise, count(*) n from file_rapide where mise > 0 and duel_id is null and joueur <> auth.uid() group by format, mise) x));
end $$;

-- ---------------------------------------------------------------- Sit & Go à mise
-- L'entrée est payée à l'inscription, rendue si on quitte la salle (ou si on en est retiré) avant le départ.
create or replace function public._mise_inscription() returns trigger
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  if tg_op = 'INSERT' then
    select * into t from tournois where id = new.tournoi_id;
    if coalesce(t.mise, 0) > 0 then
      if _solde(new.joueur) < t.mise then raise exception 'Pas assez de jetons pour une entrée de %', t.mise; end if;
      perform _crediter(new.joueur, -t.mise, 'entrée de Sit & Go');
    end if;
    return new;
  end if;
  select * into t from tournois where id = old.tournoi_id;
  if coalesce(t.mise, 0) > 0 and t.phase = 'inscriptions' and exists (select 1 from jetons where joueur = old.joueur) then
    perform _crediter(old.joueur, t.mise, 'entrée rendue');
  end if;
  return old;
end $$;
drop trigger if exists inscrits_mise on public.inscrits_tournoi;
create trigger inscrits_mise before insert or delete on public.inscrits_tournoi for each row execute function public._mise_inscription();

-- Les gains d'un Sit & Go à mise, à la fin (ou les entrées rendues s'il est annulé).
create or replace function public._gains_tournoi() returns trigger
language plpgsql security definer set search_path = public as $$
declare pot int; f public.matchs_tournoi; m public.matchs_tournoi; perdant uuid;
begin
  if coalesce(new.mise, 0) <= 0 or new.phase = old.phase then return new; end if;
  if new.phase = 'annule' and old.phase in ('inscriptions', 'en_cours') then
    perform _crediter(i.joueur, new.mise, 'entrée rendue') from inscrits_tournoi i where i.tournoi_id = new.id;
  elsif new.phase = 'termine' then
    pot := floor(new.mise * coalesce(new.taille, (select count(*) from inscrits_tournoi where tournoi_id = new.id)) * (1 - _commission()));
    select * into f from matchs_tournoi where tournoi_id = new.id and tour = new.nb_tours and position = 1;
    if f.vainqueur is not null then perform _crediter(f.vainqueur, floor(pot * 0.5)::int, 'Sit & Go : 1er'); end if;
    perdant := case when f.vainqueur = f.j0 then f.j1 else f.j0 end;
    if perdant is not null then perform _crediter(perdant, floor(pot * 0.3)::int, 'Sit & Go : 2e'); end if;
    for m in select * from matchs_tournoi where tournoi_id = new.id and tour = new.nb_tours - 1 and vainqueur is not null loop
      perdant := case when m.vainqueur = m.j0 then m.j1 else m.j0 end;
      if perdant is not null then perform _crediter(perdant, floor(pot * 0.1)::int, 'Sit & Go : demi-finale'); end if;
    end loop;
  end if;
  return new;
end $$;
drop trigger if exists tournois_gains on public.tournois;
create trigger tournois_gains after update on public.tournois for each row execute function public._gains_tournoi();

-- La salle ouverte d'une taille et d'une mise données (créée si besoin). Remplace la version de l'étape 6.
create or replace function public._salle(p_taille int, p_mise int default 0) returns public.tournois
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  perform pg_advisory_xact_lock(hashtext('pcf-sng-' || p_taille || '-' || coalesce(p_mise, 0)));
  select * into t from tournois where mode = 'direct' and phase = 'inscriptions' and taille = p_taille and mise = coalesce(p_mise, 0)
  order by cree_le limit 1 for update;
  if t.id is null then
    insert into tournois (nom, cercle_id, createur, points_par_set, sets_gagnants, duree_tour, mode, taille, mise)
    values (case when coalesce(p_mise, 0) > 0 then 'Sit & Go · ' || p_mise || ' jetons' else 'Sit & Go · ' || p_taille || ' joueurs' end,
            null, null, 11, 2, interval '1 hour', 'direct', p_taille, coalesce(p_mise, 0)) returning * into t;
  end if;
  return t;
end $$;
drop function if exists public._salle(int);

-- S'inscrire dans une salle ; le tournoi démarre dès qu'elle est pleine. Les salles à mise comptent 8 joueurs.
drop function if exists public.rejoindre_sit_and_go(int);
create or replace function public.rejoindre_sit_and_go(p_taille int, p_mise int default 0) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.tournois; mien public.tournois; m int := coalesce(p_mise, 0);
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton compte'; end if;
  perform _verifier_mise(m);
  if m > 0 and p_taille <> 8 then raise exception 'Les Sit & Go à mise se jouent à 8'; end if;
  if not (p_taille = any (_tailles_sng())) then raise exception 'Taille de tournoi invalide'; end if;
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

-- Les salles (sans mise : par taille ; à mise : par montant) et mon Sit & Go en cours. Remplace la version de l'étape 6.
create or replace function public.salles_sit_and_go() returns jsonb
language plpgsql security definer set search_path = public as $$
declare mien public.tournois; dernier public.tournois;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  perform _nettoyer_salles();
  select t.* into dernier from tournois t join inscrits_tournoi i on i.tournoi_id = t.id and i.joueur = auth.uid()
  where t.mode = 'direct' and t.phase in ('en_cours', 'termine') and t.lance_le > now() - interval '3 hours'
  order by t.lance_le desc limit 1;
  if dernier.id is not null and dernier.phase = 'en_cours' then perform _avancer_tournoi(dernier.id); select * into dernier from tournois where id = dernier.id; end if;
  mien := _mon_sng();
  if mien.id is not null and mien.phase = 'en_cours' then perform _avancer_tournoi(mien.id); mien := _mon_sng(); end if;
  return jsonb_build_object(
    'salles', (select jsonb_agg(jsonb_build_object('taille', n,
        'inscrits', (select count(*) from inscrits_tournoi i join tournois t on t.id = i.tournoi_id
                     where t.mode = 'direct' and t.phase = 'inscriptions' and t.taille = n and t.mise = 0)) order by n)
      from unnest(_tailles_sng()) n),
    'salles_mise', (select jsonb_agg(jsonb_build_object('mise', x, 'taille', 8,
        'inscrits', (select count(*) from inscrits_tournoi i join tournois t on t.id = i.tournoi_id
                     where t.mode = 'direct' and t.phase = 'inscriptions' and t.mise = x)) order by x)
      from unnest(_mises()) x),
    'mien', case when mien.id is not null then _resume_tournoi(mien) end,
    'dernier', case when dernier.id is not null and dernier.id is distinct from mien.id then _resume_tournoi(dernier) end);
end $$;

-- Le résumé d'un tournoi : avec sa mise. Remplace la version de l'étape 6.
create or replace function public._resume_tournoi(t public.tournois) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', t.id, 'mode', t.mode, 'taille', t.taille, 'nom', t.nom, 'phase', t.phase, 'tour', t.tour, 'nb_tours', t.nb_tours, 'echeance', t.echeance,
    'points_par_set', t.points_par_set, 'sets_gagnants', t.sets_gagnants, 'duree_minutes', extract(epoch from t.duree_tour)::int / 60,
    'mise', t.mise,
    'cercle', (select jsonb_build_object('id', c.id, 'nom', c.nom, 'blason', c.blason) from cercles c where c.id = t.cercle_id),
    'inscrits', (select count(*) from inscrits_tournoi where tournoi_id = t.id),
    'inscrit', exists (select 1 from inscrits_tournoi where tournoi_id = t.id and joueur = auth.uid()),
    'createur', t.createur = auth.uid(),
    'vainqueur', case when t.vainqueur is not null then _carte(t.vainqueur) end,
    'a_jouer', exists (select 1 from matchs_tournoi m where m.tournoi_id = t.id and m.tour = t.tour and m.fin is null
                         and t.phase = 'en_cours' and auth.uid() in (m.j0, m.j1)),
    'elimine', t.phase = 'en_cours' and exists (select 1 from matchs_tournoi m where m.tournoi_id = t.id and m.fin is not null
                         and auth.uid() in (m.j0, m.j1) and m.vainqueur is distinct from auth.uid()))
$$;

-- ---------------------------------------------------------------- sécurité
revoke all on function public._portefeuille_de(uuid), public._solde(uuid), public._assez_pour(int), public._mise_duel(),
  public._mise_inscription(), public._gains_tournoi(), public._salle(int, int), public._resume_tournoi(public.tournois),
  public._mon_portefeuille() from public, anon, authenticated;
revoke all on function public.lancer_defi(uuid, int, int, boolean, int), public.chercher_partie(text, int),
  public.rejoindre_sit_and_go(int, int), public.salles_sit_and_go(), public.file_partie_rapide() from public, anon;
grant execute on function public.lancer_defi(uuid, int, int, boolean, int), public.chercher_partie(text, int),
  public.rejoindre_sit_and_go(int, int), public.salles_sit_and_go(), public.file_partie_rapide() to authenticated;
