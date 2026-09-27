-- PCF — Étape 5 : tournois en ligne (élimination directe).
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2, 3, 4 et 4b. Peut être relancé sans risque.
--
-- Principes :
--  * un tournoi est soit un tournoi de cercle (réservé aux membres), soit un tournoi privé
--    rejoint par un lien ; de 3 à 32 joueurs, têtes de série selon le niveau officiel ;
--  * chaque tour a une date limite (15 min, 1 h, 24 h ou 3 jours) ; les deux joueurs jouent
--    leur match quand ils veulent pendant ce temps (un duel ordinaire, arbitré par le serveur) ;
--  * à la date limite, un match non joué est attribué à celui qui a essayé de le jouer ;
--    si aucun des deux ne s'est manifesté, la meilleure tête de série passe ;
--  * pas de tâche programmée : le tournoi avance dès qu'un joueur l'ouvre ou qu'un match se termine.

-- ---------------------------------------------------------------- les tables
create table if not exists public.tournois (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  cercle_id uuid references public.cercles (id) on delete cascade,     -- vide : tournoi privé, par lien
  code text not null unique default substr(md5(gen_random_uuid()::text), 1, 10),
  createur uuid references public.profils (id) on delete set null,
  points_par_set smallint not null check (points_par_set in (1, 3, 7, 11)),
  sets_gagnants smallint not null check (sets_gagnants in (1, 2, 3)),
  duree_tour interval not null check (duree_tour in ('15 minutes', '1 hour', '24 hours', '72 hours')),
  phase text not null default 'inscriptions' check (phase in ('inscriptions', 'en_cours', 'termine', 'annule')),
  tour int not null default 0,                -- tour en cours (1 = premier tour)
  nb_tours int not null default 0,
  echeance timestamptz,                       -- date limite du tour en cours
  vainqueur uuid references public.profils (id) on delete set null,
  cree_le timestamptz not null default now(),
  lance_le timestamptz,
  fini_le timestamptz,
  constraint nom_tournoi_valide check (char_length(nom) between 2 and 40 and nom = btrim(nom) and nom !~ '[[:cntrl:]]')
);
create index if not exists tournois_cercle on public.tournois (cercle_id);

create table if not exists public.inscrits_tournoi (
  tournoi_id uuid not null references public.tournois (id) on delete cascade,
  joueur uuid not null references public.profils (id) on delete cascade,
  tete smallint,                              -- tête de série (1 = la meilleure), fixée au lancement
  inscrit_le timestamptz not null default now(),
  primary key (tournoi_id, joueur)
);
create index if not exists inscrits_tournoi_joueur on public.inscrits_tournoi (joueur);

create table if not exists public.matchs_tournoi (
  id uuid primary key default gen_random_uuid(),
  tournoi_id uuid not null references public.tournois (id) on delete cascade,
  tour int not null,
  position int not null,
  j0 uuid references public.profils (id) on delete set null,
  j1 uuid references public.profils (id) on delete set null,
  vainqueur uuid references public.profils (id) on delete set null,
  fin text check (fin in ('score', 'forfait', 'abandon', 'exempt', 'tete_de_serie')),   -- rempli quand le match est décidé
  essai0 timestamptz,                         -- quand chaque joueur a essayé de jouer
  essai1 timestamptz,
  duel_id uuid references public.duels (id) on delete set null,
  unique (tournoi_id, tour, position)
);

alter table public.duels add column if not exists tournoi_id uuid references public.tournois (id) on delete set null;
alter table public.duels add column if not exists tournoi_match uuid references public.matchs_tournoi (id) on delete set null;

-- ---------------------------------------------------------------- outils internes
create or replace function public._limite_tournois() returns int language sql immutable as $$ select 5 $$;   -- tournois actifs créés par joueur

-- Ordre des têtes de série dans le tableau (1 contre 8, 4 contre 5, 2 contre 7, 3 contre 6…).
create or replace function public._ordre_tableau(p_taille int) returns int[]
language plpgsql immutable as $$
declare o int[] := array[1]; k int := 1; r int[]; s int;
begin
  while k < p_taille loop
    k := k * 2; r := '{}';
    foreach s in array o loop r := r || s || (k + 1 - s); end loop;
    o := r;
  end loop;
  return o;
end $$;

-- Peut-on voir ce tournoi ? (inscrit, créateur ou membre du cercle)
create or replace function public._voit_tournoi(t public.tournois) returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and (
    t.createur = auth.uid()
    or exists (select 1 from inscrits_tournoi where tournoi_id = t.id and joueur = auth.uid())
    or (t.cercle_id is not null and exists (select 1 from membres_cercle where cercle_id = t.cercle_id and joueur = auth.uid())))
$$;

create or replace function public._tete(p_tournoi uuid, p_joueur uuid) returns int
language sql stable as $$
  select coalesce((select tete from public.inscrits_tournoi where tournoi_id = p_tournoi and joueur = p_joueur), 999)
$$;

-- Fait avancer le tournoi : exempts, dates limites dépassées, tour suivant, fin du tournoi.
create or replace function public._avancer_tournoi(p_id uuid) returns void
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

-- À la fin d'un duel de tournoi : le match est décidé, et le tournoi avance.
create or replace function public._fin_duel_tournoi() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.tournoi_match is null or new.phase <> 'termine' or old.phase = 'termine' then return null; end if;
  update matchs_tournoi set vainqueur = case when new.vainqueur = 0 then new.j0 else new.j1 end, fin = new.fin
  where id = new.tournoi_match and fin is null;
  perform _avancer_tournoi(new.tournoi_id);
  return null;
end $$;
drop trigger if exists duels_fin_tournoi on public.duels;
create trigger duels_fin_tournoi after update on public.duels for each row execute function public._fin_duel_tournoi();

-- Un match de tournoi ne se refuse pas et ne s'annule pas (seul le tournoi peut l'annuler).
create or replace function public._garde_duel_tournoi() returns trigger
language plpgsql as $$
begin
  if new.tournoi_match is not null and new.phase in ('refuse', 'annule') and old.phase is distinct from new.phase
     and coalesce(current_setting('pcf.interne', true), '') <> '1' then
    raise exception 'Un match de tournoi ne peut pas être refusé ni annulé';
  end if;
  return new;
end $$;
drop trigger if exists duels_garde_tournoi on public.duels;
create trigger duels_garde_tournoi before update on public.duels for each row execute function public._garde_duel_tournoi();

-- Résumé d'un tournoi (pour les listes), du point de vue du joueur connecté.
create or replace function public._resume_tournoi(t public.tournois) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', t.id, 'nom', t.nom, 'phase', t.phase, 'tour', t.tour, 'nb_tours', t.nb_tours, 'echeance', t.echeance,
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

-- ---------------------------------------------------------------- les actions des joueurs
-- p_duree : durée d'un tour en minutes (15, 60, 1440 ou 4320).
create or replace function public.creer_tournoi(p_nom text, p_cercle uuid, p_points int, p_sets int, p_duree int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton compte'; end if;
  if p_nom is null or char_length(btrim(p_nom)) not between 2 and 40 then raise exception 'Le nom du tournoi doit faire entre 2 et 40 caractères'; end if;
  if p_duree not in (15, 60, 1440, 4320) then raise exception 'Durée de tour invalide'; end if;
  if p_cercle is not null and _role(p_cercle) is null then raise exception 'Tu ne fais pas partie de ce cercle'; end if;
  if (select count(*) from tournois where createur = auth.uid() and phase in ('inscriptions', 'en_cours')) >= _limite_tournois() then
    raise exception 'Tu as déjà % tournois en cours : termine-les ou annule-en un', _limite_tournois();
  end if;
  insert into tournois (nom, cercle_id, createur, points_par_set, sets_gagnants, duree_tour)
  values (btrim(p_nom), p_cercle, auth.uid(), p_points, p_sets, make_interval(mins => p_duree)) returning * into t;
  insert into inscrits_tournoi (tournoi_id, joueur) values (t.id, auth.uid());
  return jsonb_build_object('id', t.id, 'code', t.code);
end $$;

create or replace function public._inscrire(t public.tournois) returns void
language plpgsql security definer set search_path = public as $$
begin
  if t.phase <> 'inscriptions' then raise exception 'Les inscriptions à ce tournoi sont closes'; end if;
  if t.cercle_id is not null and _role(t.cercle_id) is null then raise exception 'Ce tournoi est réservé aux membres du cercle'; end if;
  if (select count(*) from inscrits_tournoi where tournoi_id = t.id) >= 32 then raise exception 'Ce tournoi est complet (32 joueurs)'; end if;
  insert into inscrits_tournoi (tournoi_id, joueur) values (t.id, auth.uid()) on conflict do nothing;
end $$;

-- S'inscrire à un tournoi de cercle (depuis la page du cercle).
create or replace function public.inscrire_tournoi(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  select * into t from tournois where id = p_id for update;
  if t.id is null or not _voit_tournoi(t) then raise exception 'Tournoi introuvable'; end if;
  perform _inscrire(t);
end $$;

-- Rejoindre un tournoi par son lien « ?tournoi=CODE ».
create or replace function public.rejoindre_tournoi(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton compte'; end if;
  select * into t from tournois where code = p_code for update;
  if t.id is null then raise exception 'Ce lien de tournoi n''est plus valable'; end if;
  if not exists (select 1 from inscrits_tournoi where tournoi_id = t.id and joueur = auth.uid()) then perform _inscrire(t); end if;
  return jsonb_build_object('id', t.id, 'nom', t.nom);
end $$;

create or replace function public.desinscrire_tournoi(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  select * into t from tournois where id = p_id for update;
  if t.id is null then raise exception 'Tournoi introuvable'; end if;
  if t.phase <> 'inscriptions' then raise exception 'Le tournoi a commencé : tu ne peux plus te désinscrire'; end if;
  delete from inscrits_tournoi where tournoi_id = p_id and joueur = auth.uid();
end $$;

-- Qui peut lancer ou annuler : le créateur ; s'il n'existe plus, le responsable du cercle ou un inscrit.
create or replace function public._organise(t public.tournois) returns boolean
language sql stable security definer set search_path = public as $$
  select t.createur = auth.uid()
    or (t.createur is null and ((t.cercle_id is not null and _role(t.cercle_id) = 'admin')
        or exists (select 1 from inscrits_tournoi where tournoi_id = t.id and joueur = auth.uid())))
$$;

create or replace function public.lancer_tournoi(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; n int; taille int; o int[]; p int; a uuid; b uuid;
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
  taille := 2; while taille < n loop taille := taille * 2; end loop;
  o := _ordre_tableau(taille);
  for p in 1 .. taille / 2 loop
    select joueur into a from inscrits_tournoi where tournoi_id = p_id and tete = o[2 * p - 1];
    select joueur into b from inscrits_tournoi where tournoi_id = p_id and tete = o[2 * p];
    insert into matchs_tournoi (tournoi_id, tour, position, j0, j1) values (p_id, 1, p, a, b);
    a := null; b := null;
  end loop;
  update tournois set phase = 'en_cours', tour = 1, nb_tours = round(log(2, taille))::int, echeance = now() + duree_tour, lance_le = now()
  where id = p_id;
  perform _avancer_tournoi(p_id);
end $$;

create or replace function public.annuler_tournoi(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  select * into t from tournois where id = p_id for update;
  if t.id is null or not _organise(t) then raise exception 'Seul l''organisateur peut annuler le tournoi'; end if;
  if t.phase <> 'inscriptions' then raise exception 'Un tournoi commencé ne peut plus être annulé'; end if;
  update tournois set phase = 'annule', fini_le = now() where id = p_id;
end $$;

-- « Jouer mon match » : je signale que je veux jouer, et le duel est lancé (ou accepté s'il m'attend).
-- Renvoie le duel : en « attente » tant que l'adversaire n'est pas là, en « presentation » quand les deux y sont.
create or replace function public.jouer_match_tournoi(p_match uuid) returns public.duels
language plpgsql security definer set search_path = public as $$
declare m public.matchs_tournoi; t public.tournois; d public.duels; moi smallint; adv uuid;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  select tournoi_id into t.id from matchs_tournoi where id = p_match;
  if t.id is null then raise exception 'Match introuvable'; end if;
  perform _avancer_tournoi(t.id);
  select * into t from tournois where id = t.id for update;
  select * into m from matchs_tournoi where id = p_match for update;
  if auth.uid() = m.j0 then moi := 0; adv := m.j1; elsif auth.uid() = m.j1 then moi := 1; adv := m.j0;
  else raise exception 'Ce match ne te concerne pas'; end if;
  if t.phase <> 'en_cours' or m.tour <> t.tour or m.fin is not null then raise exception 'Ce match n''est plus à jouer'; end if;
  if moi = 0 then update matchs_tournoi set essai0 = coalesce(essai0, now()) where id = p_match;
  else update matchs_tournoi set essai1 = coalesce(essai1, now()) where id = p_match; end if;

  select * into d from duels where id = m.duel_id for update;
  if d.id is not null and d.phase in ('presentation', 'jeu', 'entre_sets') then return d; end if;
  if d.id is not null and d.phase = 'attente' then
    if d.j1 = auth.uid() then   -- l'adversaire m'attend : on y va
      update duels set phase = 'presentation', echeance = now() + interval '45 seconds', maj_le = now() where id = d.id returning * into d;
    end if;
    return d;
  end if;
  insert into duels (j0, j1, points_par_set, sets_gagnants, classe, tournoi_id, tournoi_match)
  values (auth.uid(), adv, t.points_par_set, t.sets_gagnants, t.points_par_set >= 7 and t.sets_gagnants > 1, t.id, p_match)
  returning * into d;
  update matchs_tournoi set duel_id = d.id where id = p_match;
  return d;
end $$;

-- Mes tournois (inscrit ou créateur), et les tournois de mes cercles ouverts aux inscriptions.
create or replace function public.mes_tournois() returns jsonb
language plpgsql security definer set search_path = public as $$
declare r uuid;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  for r in select t.id from tournois t where t.phase = 'en_cours' and exists (select 1 from inscrits_tournoi where tournoi_id = t.id and joueur = auth.uid()) loop
    perform _avancer_tournoi(r);
  end loop;
  return coalesce((
    select jsonb_agg(_resume_tournoi(t) order by case t.phase when 'en_cours' then 0 when 'inscriptions' then 1 else 2 end, t.cree_le desc)
    from (select * from tournois t
          where (t.createur = auth.uid() or exists (select 1 from inscrits_tournoi where tournoi_id = t.id and joueur = auth.uid())
                 or (t.phase = 'inscriptions' and t.cercle_id in (select cercle_id from membres_cercle where joueur = auth.uid())))
            and (t.phase in ('inscriptions', 'en_cours') or t.fini_le > now() - interval '30 days')
          order by t.cree_le desc limit 30) t), '[]'::jsonb);
end $$;

-- Les tournois d'un cercle (en cours et palmarès).
create or replace function public.tournois_cercle(p_cercle uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if _role(p_cercle) is null then raise exception 'Tu ne fais pas partie de ce cercle'; end if;
  return coalesce((select jsonb_agg(_resume_tournoi(t) order by case t.phase when 'en_cours' then 0 when 'inscriptions' then 1 else 2 end, t.cree_le desc)
    from (select * from tournois where cercle_id = p_cercle and phase <> 'annule' order by cree_le desc limit 30) t), '[]'::jsonb);
end $$;

-- Un tournoi : inscrits, tableau complet, et mon match à jouer.
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
        'j0', case when m.j0 is not null then _carte(m.j0) || jsonb_build_object('tete', _tete(p_id, m.j0)) end,
        'j1', case when m.j1 is not null then _carte(m.j1) || jsonb_build_object('tete', _tete(p_id, m.j1)) end,
        'vainqueur', m.vainqueur, 'essai0', m.essai0 is not null, 'essai1', m.essai1 is not null,
        'duel', (select jsonb_build_object('id', d.id, 'phase', d.phase, 'j0', d.j0, 'scores_sets', d.scores_sets, 'sets', d.sets)
                 from duels d where d.id = m.duel_id)) order by m.tour, m.position)
      from matchs_tournoi m where m.tournoi_id = p_id), '[]'::jsonb));
end $$;

-- ---------------------------------------------------------------- sécurité
alter table public.tournois enable row level security;
alter table public.inscrits_tournoi enable row level security;
alter table public.matchs_tournoi enable row level security;
revoke all on public.tournois, public.inscrits_tournoi, public.matchs_tournoi from anon, authenticated;

revoke all on function public._ordre_tableau(int), public._voit_tournoi(public.tournois), public._tete(uuid, uuid),
  public._avancer_tournoi(uuid), public._fin_duel_tournoi(), public._garde_duel_tournoi(), public._resume_tournoi(public.tournois),
  public._inscrire(public.tournois), public._organise(public.tournois) from public, anon, authenticated;
revoke all on function public.creer_tournoi(text, uuid, int, int, int), public.inscrire_tournoi(uuid), public.rejoindre_tournoi(text),
  public.desinscrire_tournoi(uuid), public.lancer_tournoi(uuid), public.annuler_tournoi(uuid), public.jouer_match_tournoi(uuid),
  public.mes_tournois(), public.tournois_cercle(uuid), public.voir_tournoi(uuid) from public, anon;
grant execute on function public.creer_tournoi(text, uuid, int, int, int), public.inscrire_tournoi(uuid), public.rejoindre_tournoi(text),
  public.desinscrire_tournoi(uuid), public.lancer_tournoi(uuid), public.annuler_tournoi(uuid), public.jouer_match_tournoi(uuid),
  public.mes_tournois(), public.tournois_cercle(uuid), public.voir_tournoi(uuid) to authenticated;
