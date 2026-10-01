-- PCF — Étape 18 : les tournois programmés (payants en jetons, à heure fixe).
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 16. Peut être relancé sans risque.
-- Si on relance un jour les étapes 6, 14 ou 15, il faut relancer celle-ci ensuite.
-- Il faut aussi mettre à jour le code de la fonction « Notifier » (voir supabase/LISEZMOI.md).
--
-- Le programme (heure de Paris) :
--   Le Midi          12 h 30, tous les jours            entrée 100
--   L'Apéro          18 h,    tous les jours            entrée 100
--   Le Nocturne      21 h 30, du lundi au samedi        entrée 200
--   Le Grand Chelem  21 h,    le dimanche               entrée 1 000, cagnotte garantie 5 000, finale en 3 sets gagnants
-- Comme le freeroll : sets de 11, 2 sets gagnants (officiel) ; départ à l'heure avec les inscrits présents (au moins 4).
-- L'entrée est payée à l'inscription, rendue si on se désinscrit avant le départ ou si le tournoi est annulé
-- (moins de 4 présents). Un inscrit absent au départ n'est pas remboursé : son entrée reste dans la cagnotte.
-- Cagnotte : les entrées moins 10 % (au moins la garantie) ; 50 % au 1er, 30 % au 2e, 10 % aux deux demi-finalistes.

alter table public.tournois add column if not exists programme text;         -- la clé du programme (vide pour les autres tournois)
alter table public.tournois add column if not exists depart timestamptz;     -- l'heure de départ prévue
alter table public.tournois add column if not exists garantie int not null default 0;
alter table public.tournois add column if not exists finale_sets smallint;   -- sets gagnants de la finale, si différent
alter table public.tournois add column if not exists entrees int;            -- entrées payées au moment du départ
create unique index if not exists tournois_programme_depart on public.tournois (programme, depart) where programme is not null;

create or replace function public._programme()
returns table (cle text, nom text, heure time, jours int[], mise int, garantie int, finale_sets smallint)
language sql immutable as $$
  values ('midi', 'Le Midi', time '12:30', array[1, 2, 3, 4, 5, 6, 7], 100, 0, null::smallint),
         ('apero', 'L''Apéro', time '18:00', array[1, 2, 3, 4, 5, 6, 7], 100, 0, null),
         ('nocturne', 'Le Nocturne', time '21:30', array[1, 2, 3, 4, 5, 6], 200, 0, null),
         ('grand_chelem', 'Le Grand Chelem', time '21:00', array[7], 1000, 5000, 3::smallint)
$$;
create or replace function public._programme_min() returns int language sql immutable as $$ select 4 $$;

-- ---------------------------------------------------------------- ne pas mélanger avec les Sit & Go
-- (remplacent les versions de l'étape 15 : un inscrit à un tournoi programmé n'est ni « en salle », ni retiré pour absence)
create or replace function public._nettoyer_salles() returns void
language sql security definer set search_path = public as $$
  delete from inscrits_tournoi i using tournois t
  where t.id = i.tournoi_id and t.mode = 'direct' and t.freeroll is null and t.programme is null
    and t.phase = 'inscriptions' and i.vu < now() - _absence_salle();
$$;
create or replace function public._mon_sng() returns public.tournois
language sql stable security definer set search_path = public as $$
  select t.* from tournois t join inscrits_tournoi i on i.tournoi_id = t.id and i.joueur = auth.uid()
  where t.mode = 'direct' and t.freeroll is null and t.programme is null and (t.phase = 'inscriptions' or (t.phase = 'en_cours' and not exists (
    select 1 from matchs_tournoi m where m.tournoi_id = t.id and m.fin is not null and auth.uid() in (m.j0, m.j1) and m.vainqueur is distinct from auth.uid())))
  order by t.cree_le desc limit 1
$$;
create or replace function public.quitter_sit_and_go() returns void
language sql security definer set search_path = public as $$
  delete from inscrits_tournoi i using tournois t
  where t.id = i.tournoi_id and i.joueur = auth.uid() and t.mode = 'direct' and t.freeroll is null and t.programme is null and t.phase = 'inscriptions';
$$;
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
                     where t.mode = 'direct' and t.freeroll is null and t.programme is null and t.phase = 'inscriptions' and t.mise = x)) order by x)
      from unnest(_mises()) x),
    'mien', case when mien.id is not null then _resume_tournoi(mien) end,
    'dernier', case when dernier.id is not null and dernier.id is distinct from mien.id then _resume_tournoi(dernier) end);
end $$;

-- Le résumé d'un tournoi : avec son programme. Remplace la version de l'étape 15.
create or replace function public._resume_tournoi(t public.tournois) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', t.id, 'mode', t.mode, 'taille', t.taille, 'nom', t.nom, 'phase', t.phase, 'tour', t.tour, 'nb_tours', t.nb_tours, 'echeance', t.echeance,
    'points_par_set', t.points_par_set, 'sets_gagnants', t.sets_gagnants, 'duree_minutes', extract(epoch from t.duree_tour)::int / 60,
    'mise', t.mise, 'freeroll', t.freeroll, 'programme', t.programme, 'depart', t.depart, 'garantie', t.garantie, 'finale_sets', t.finale_sets,
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

-- ---------------------------------------------------------------- les entrées et les gains
-- L'entrée, payée à l'inscription, rendue si on part avant le départ. Remplace la version de l'étape 14 :
-- au départ d'un tournoi programmé, les absents sont retirés sans remboursement (pcf.sans_remboursement).
create or replace function public._mise_inscription() returns trigger
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  if tg_op = 'INSERT' then
    select * into t from tournois where id = new.tournoi_id;
    if coalesce(t.mise, 0) > 0 then
      if _solde(new.joueur) < t.mise then raise exception 'Pas assez de jetons pour une entrée de %', t.mise; end if;
      perform _crediter(new.joueur, -t.mise, case when t.programme is not null then 'entrée de tournoi' else 'entrée de Sit & Go' end);
    end if;
    return new;
  end if;
  select * into t from tournois where id = old.tournoi_id;
  if coalesce(t.mise, 0) > 0 and t.phase = 'inscriptions' and coalesce(current_setting('pcf.sans_remboursement', true), '') <> 'on'
     and exists (select 1 from jetons where joueur = old.joueur) then
    perform _crediter(old.joueur, t.mise, 'entrée rendue');
  end if;
  return old;
end $$;

-- Les gains d'un Sit & Go à mise. Remplace la version de l'étape 14 (les tournois programmés ont les leurs).
create or replace function public._gains_tournoi() returns trigger
language plpgsql security definer set search_path = public as $$
declare pot int; f public.matchs_tournoi; m public.matchs_tournoi; perdant uuid;
begin
  if coalesce(new.mise, 0) <= 0 or new.programme is not null or new.phase = old.phase then return new; end if;
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

-- La cagnotte d'un tournoi programmé : les entrées moins 10 %, au moins la garantie.
create or replace function public._cagnotte_programme(t public.tournois) returns int
language sql stable security definer set search_path = public as $$
  select greatest(t.garantie, floor(t.mise * coalesce(t.entrees, (select count(*) from inscrits_tournoi where tournoi_id = t.id)) * (1 - _commission()))::int)
$$;

create or replace function public._gains_programme() returns trigger
language plpgsql security definer set search_path = public as $$
declare pot int; f public.matchs_tournoi; m public.matchs_tournoi; perdant uuid;
begin
  if new.programme is null or new.phase = old.phase then return new; end if;
  if new.phase = 'annule' and old.phase = 'inscriptions' then
    perform _crediter(i.joueur, new.mise, 'entrée rendue') from inscrits_tournoi i where i.tournoi_id = new.id;
  elsif new.phase = 'termine' then
    pot := _cagnotte_programme(new);
    select * into f from matchs_tournoi where tournoi_id = new.id and tour = new.nb_tours and position = 1;
    if f.vainqueur is not null then perform _portefeuille_de(f.vainqueur); perform _crediter(f.vainqueur, floor(pot * 0.5)::int, 'tournoi : 1er'); end if;
    perdant := case when f.vainqueur = f.j0 then f.j1 else f.j0 end;
    if perdant is not null then perform _portefeuille_de(perdant); perform _crediter(perdant, floor(pot * 0.3)::int, 'tournoi : 2e'); end if;
    for m in select * from matchs_tournoi where tournoi_id = new.id and tour = new.nb_tours - 1 and vainqueur is not null loop
      perdant := case when m.vainqueur = m.j0 then m.j1 else m.j0 end;
      if perdant is not null then perform _portefeuille_de(perdant); perform _crediter(perdant, floor(pot * 0.1)::int, 'tournoi : demi-finale'); end if;
    end loop;
  end if;
  return new;
end $$;
drop trigger if exists tournois_gains_programme on public.tournois;
create trigger tournois_gains_programme after update on public.tournois for each row execute function public._gains_programme();

-- La finale du Grand Chelem se joue en 3 sets gagnants.
create or replace function public._sets_finale() returns trigger
language plpgsql security definer set search_path = public as $$
declare t public.tournois; m public.matchs_tournoi;
begin
  if new.tournoi_id is null or new.tournoi_match is null then return new; end if;
  select * into t from tournois where id = new.tournoi_id;
  if t.finale_sets is null then return new; end if;
  select * into m from matchs_tournoi where id = new.tournoi_match;
  if m.tour = t.nb_tours then new.sets_gagnants := t.finale_sets; end if;
  return new;
end $$;
drop trigger if exists duels_sets_finale on public.duels;
create trigger duels_sets_finale before insert on public.duels for each row execute function public._sets_finale();

-- Le classement du mois compte aussi les tournois programmés. Remplace la version de l'étape 15.
create or replace function public._motifs_jeu() returns text[] language sql immutable as $$
  select array['mise de duel', 'gain de duel', 'mise rendue', 'entrée de Sit & Go', 'entrée rendue',
               'Sit & Go : 1er', 'Sit & Go : 2e', 'Sit & Go : demi-finale', 'freeroll : 1er', 'freeroll : 2e', 'freeroll : demi-finale',
               'entrée de tournoi', 'tournoi : 1er', 'tournoi : 2e', 'tournoi : demi-finale']
$$;

-- ---------------------------------------------------------------- les tournois du programme
-- Le tournoi d'un programme pour un jour donné (créé au premier passage).
create or replace function public._tournoi_programme(p_cle text, p_jour date) returns public.tournois
language plpgsql security definer set search_path = public as $$
declare t public.tournois; p record; d timestamptz;
begin
  select * into p from _programme() where cle = p_cle;
  if p.cle is null then raise exception 'Tournoi inconnu'; end if;
  d := (p_jour + p.heure) at time zone 'Europe/Paris';
  select * into t from tournois where programme = p_cle and depart = d;
  if t.id is null then
    insert into tournois (nom, cercle_id, createur, points_par_set, sets_gagnants, duree_tour, mode, taille, mise, programme, depart, garantie, finale_sets)
    values (p.nom, null, null, 11, 2, interval '1 hour', 'direct', 64, p.mise, p_cle, d, p.garantie, p.finale_sets)
    on conflict (programme, depart) where programme is not null do nothing;
    select * into t from tournois where programme = p_cle and depart = d;
  end if;
  return t;
end $$;

-- Le tournoi à afficher pour un programme : celui du jour tant qu'il n'est pas fini depuis plus de 30 min, sinon le prochain.
create or replace function public._prochain_programme(p_cle text) returns public.tournois
language plpgsql security definer set search_path = public as $$
declare p record; j date := _aujourdhui(); k int; t public.tournois; d timestamptz;
begin
  select * into p from _programme() where cle = p_cle;
  for k in 0 .. 7 loop
    continue when not (extract(isodow from j + k)::int = any (p.jours));
    d := (j + k + p.heure) at time zone 'Europe/Paris';
    select * into t from tournois where programme = p_cle and depart = d;
    if d > now() or (t.id is not null and (t.phase in ('inscriptions', 'en_cours') or t.fini_le > now() - interval '30 minutes')) then
      return _tournoi_programme(p_cle, j + k);
    end if;
  end loop;
  return null;
end $$;

-- L'heure est passée : on lance avec les présents (ou on annule et on rembourse tout le monde s'il y en a moins de 4).
create or replace function public._lancer_programme(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; n int; n_taille int := 4;
begin
  select * into t from tournois where id = p_id for update;
  if t.phase <> 'inscriptions' or now() < t.depart then return; end if;
  n := (select count(*) from inscrits_tournoi where tournoi_id = p_id and vu >= t.depart - interval '90 seconds');
  if n < _programme_min() then
    update tournois set phase = 'annule', fini_le = now() where id = p_id;
    return;
  end if;
  update tournois set entrees = (select count(*) from inscrits_tournoi where tournoi_id = p_id) where id = p_id;
  perform set_config('pcf.sans_remboursement', 'on', true);
  delete from inscrits_tournoi where tournoi_id = p_id and vu < t.depart - interval '90 seconds';
  perform set_config('pcf.sans_remboursement', 'off', true);
  while n_taille < n loop n_taille := n_taille * 2; end loop;
  update tournois set taille = n_taille where id = p_id;
  perform _lancer_direct(p_id);   -- tableau à élimination directe ; les places vides font passer les meilleures têtes de série
end $$;

-- Le programme (avec signe de vie de mes inscriptions) et le tenant du titre du Grand Chelem. Fait avancer les tournois.
create or replace function public.tournois_programmes() returns jsonb
language plpgsql security definer set search_path = public as $$
declare p record; t public.tournois; liste jsonb := '[]'::jsonb; dernier public.tournois;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  update inscrits_tournoi i set vu = now() from tournois t2
  where t2.id = i.tournoi_id and i.joueur = auth.uid() and t2.programme is not null and t2.phase = 'inscriptions';
  -- les tournois des jours passés restés en attente (personne n'est passé à l'heure) : lancés ou annulés et remboursés
  for t in select * from tournois where programme is not null and phase = 'inscriptions' and depart < now() - interval '5 minutes' loop
    perform _lancer_programme(t.id);
  end loop;
  for t in select * from tournois where programme is not null and phase = 'en_cours' and lance_le > now() - interval '6 hours' loop
    perform _avancer_tournoi(t.id);
  end loop;
  for p in select * from _programme() loop
    t := _prochain_programme(p.cle);
    continue when t.id is null;
    if t.phase = 'inscriptions' and now() >= t.depart then perform _lancer_programme(t.id); end if;
    if t.phase in ('inscriptions', 'en_cours') then perform _avancer_tournoi(t.id); end if;
    select * into t from tournois where id = t.id;
    liste := liste || jsonb_build_array(_resume_tournoi(t) || jsonb_build_object('cle', p.cle, 'cagnotte', _cagnotte_programme(t)));
  end loop;
  select * into dernier from tournois where programme = 'grand_chelem' and phase = 'termine' and vainqueur is not null order by depart desc limit 1;
  return jsonb_build_object('maintenant', now(),
    'tournois', (select jsonb_agg(x order by x->>'depart') from jsonb_array_elements(liste) x),
    'tenant', case when dernier.id is not null then _carte(dernier.vainqueur) || jsonb_build_object('depart', dernier.depart) end);
end $$;

create or replace function public.inscrire_programme(p_cle text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton compte'; end if;
  if not exists (select 1 from _programme() where cle = p_cle) then raise exception 'Tournoi inconnu'; end if;
  t := _prochain_programme(p_cle);
  if t.id is null or t.phase <> 'inscriptions' or now() >= t.depart then raise exception 'Les inscriptions à ce tournoi sont closes'; end if;
  if exists (select 1 from inscrits_tournoi where tournoi_id = t.id and joueur = auth.uid()) then return tournois_programmes(); end if;
  perform _assez_pour(t.mise);
  insert into inscrits_tournoi (tournoi_id, joueur, vu) values (t.id, auth.uid(), now());
  return tournois_programmes();
end $$;

create or replace function public.desinscrire_programme(p_cle text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  t := _prochain_programme(p_cle);
  if t.id is not null and t.phase = 'inscriptions' and now() < t.depart then
    delete from inscrits_tournoi where tournoi_id = t.id and joueur = auth.uid();   -- l'entrée est rendue
  end if;
  return tournois_programmes();
end $$;

-- ---------------------------------------------------------------- le rappel, 10 minutes avant
alter table public.notifications add column if not exists tournoi_id uuid references public.tournois (id) on delete cascade;
alter table public.notifications drop constraint if exists notifications_evenement_check;
alter table public.notifications add constraint notifications_evenement_check check (evenement in ('defi', 'accepte', 'tournoi', 'test', 'freeroll', 'programme'));

-- Un minuteur appelle rappel_programmes() toutes les 5 minutes ; on prévient les inscrits des tournois qui partent
-- dans 5 à 15 minutes (une seule fois par tournoi).
create or replace function public.rappel_programmes(p_maintenant timestamptz default now()) returns int
language plpgsql security definer set search_path = public as $$
declare t public.tournois; i record; n bigint; envoyes int := 0;
begin
  for t in select * from tournois where programme is not null and phase = 'inscriptions'
           and depart > p_maintenant + interval '5 minutes' and depart <= p_maintenant + interval '15 minutes' loop
    for i in select joueur from inscrits_tournoi where tournoi_id = t.id loop
      continue when exists (select 1 from notifications where joueur = i.joueur and evenement = 'programme' and tournoi_id = t.id);
      insert into notifications (duel_id, joueur, evenement, tournoi_id) values (null, i.joueur, 'programme', t.id) returning id into n;
      if exists (select 1 from abonnements_push where joueur = i.joueur) then perform _appeler_notifier(n); envoyes := envoyes + 1; end if;
    end loop;
  end loop;
  return envoyes;
end $$;

do $$ begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job where jobname = 'rappel-programmes';
  perform cron.schedule('rappel-programmes', '*/5 * * * *', 'select public.rappel_programmes()');
exception when others then
  raise notice 'pg_cron indisponible ici : pas de rappel automatique (%)', sqlerrm;
end $$;

-- ---------------------------------------------------------------- sécurité
revoke all on function public._programme(), public._tournoi_programme(text, date), public._prochain_programme(text), public._lancer_programme(uuid),
  public._cagnotte_programme(public.tournois), public._gains_programme(), public._sets_finale(), public._mise_inscription(), public._gains_tournoi(),
  public._nettoyer_salles(), public._mon_sng(), public._resume_tournoi(public.tournois), public.rappel_programmes(timestamptz)
  from public, anon, authenticated;
revoke all on function public.tournois_programmes(), public.inscrire_programme(text), public.desinscrire_programme(text),
  public.quitter_sit_and_go(), public.salles_sit_and_go() from public, anon;
grant execute on function public.tournois_programmes(), public.inscrire_programme(text), public.desinscrire_programme(text),
  public.quitter_sit_and_go(), public.salles_sit_and_go() to authenticated;
