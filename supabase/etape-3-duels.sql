-- PCF — Étape 3 : duels en ligne entre deux joueurs, arbitrés par le serveur.
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite d'avoir lancé etape-2-comptes.sql avant. Peut être relancé sans risque.
--
-- Principe anti-triche :
--  * chaque joueur envoie son signe au serveur ; il est rangé dans une table que
--    PERSONNE ne peut lire (coups_secrets) ;
--  * quand les deux ont joué, le serveur révèle les deux signes en même temps et
--    applique lui-même les règles officielles (points, sets, fin du match) ;
--  * les téléphones ne peuvent rien modifier directement : tout passe par les
--    fonctions ci-dessous, qui vérifient qui appelle et à quel moment.
--
-- Joueur 0 = celui qui lance le défi, joueur 1 = celui qui le reçoit.

-- ---------------------------------------------------------------- réglage : apparaître dans la recherche
alter table public.profils add column if not exists visible_recherche boolean not null default true;

-- ---------------------------------------------------------------- les duels
create table if not exists public.duels (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default substr(md5(gen_random_uuid()::text), 1, 10), -- pour le lien d'invitation
  j0 uuid not null references public.profils (id) on delete cascade,
  j1 uuid references public.profils (id) on delete cascade,     -- vide tant qu'un défi par lien n'est pas accepté
  par_lien boolean not null default false,
  points_par_set smallint not null check (points_par_set in (7, 11)),
  sets_gagnants smallint not null check (sets_gagnants in (2, 3)),
  phase text not null default 'attente'
    check (phase in ('attente', 'presentation', 'jeu', 'entre_sets', 'termine', 'annule', 'refuse')),
  points smallint[] not null default '{0,0}',
  sets smallint[] not null default '{0,0}',
  scores_sets jsonb not null default '[]'::jsonb,   -- ex. [[11,8],[9,11]]
  coups jsonb not null default '[]'::jsonb,         -- coups révélés : {"a":0,"b":2,"g":1,"auto":[false,true]}
  manche int not null default 1,                    -- numéro du coup en cours
  echeance timestamptz,                             -- fin du temps pour le coup (ou la pause) en cours
  prets boolean[] not null default '{false,false}',
  pause_depuis timestamptz,                         -- un joueur a disparu : pause, puis forfait
  vainqueur smallint check (vainqueur in (0, 1)),
  fin text check (fin in ('score', 'forfait', 'abandon')),
  cree_le timestamptz not null default now(),
  maj_le timestamptz not null default now(),
  constraint deux_joueurs_differents check (j1 is null or j1 <> j0)
);
create index if not exists duels_j0 on public.duels (j0, phase);
create index if not exists duels_j1 on public.duels (j1, phase);

-- Les signes pas encore révélés : aucune règle de lecture, donc invisibles pour tous les joueurs.
create table if not exists public.coups_secrets (
  duel_id uuid not null references public.duels (id) on delete cascade,
  manche int not null,
  joueur smallint not null check (joueur in (0, 1)),
  signe smallint not null check (signe between 0 and 2),
  auto boolean not null default false,
  primary key (duel_id, manche, joueur)
);

-- Dernier signe de vie de chaque joueur pendant un duel (pour la pause et le forfait).
create table if not exists public.presences (
  duel_id uuid not null references public.duels (id) on delete cascade,
  joueur smallint not null check (joueur in (0, 1)),
  vu timestamptz not null default now(),
  primary key (duel_id, joueur)
);

-- ---------------------------------------------------------------- sécurité
alter table public.duels enable row level security;
alter table public.coups_secrets enable row level security;
alter table public.presences enable row level security;

drop policy if exists "les deux joueurs voient leur duel" on public.duels;
create policy "les deux joueurs voient leur duel" on public.duels
  for select to authenticated using (auth.uid() = j0 or auth.uid() = j1);

revoke all on public.duels, public.coups_secrets, public.presences from anon, authenticated;
grant select on public.duels to authenticated;   -- lecture seule ; les changements passent par les fonctions

-- Mises à jour en direct (Realtime) des duels vers les deux téléphones.
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'duels') then
    alter publication supabase_realtime add table public.duels;
  end if;
end $$;

-- ---------------------------------------------------------------- réglages de temps
create or replace function public._duree_coup() returns interval language sql immutable as $$ select interval '5 seconds' $$;
create or replace function public._tolerance() returns interval language sql immutable as $$ select interval '1.5 seconds' $$;   -- délai du réseau
create or replace function public._absence() returns interval language sql immutable as $$ select interval '10 seconds' $$;    -- sans signe de vie : pause
create or replace function public._forfait() returns interval language sql immutable as $$ select interval '60 seconds' $$;    -- pause trop longue : forfait

-- ---------------------------------------------------------------- outils internes
-- Place du joueur connecté dans ce duel (0 ou 1), sinon erreur.
create or replace function public._ma_place(d public.duels) returns smallint
language plpgsql stable as $$
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if auth.uid() = d.j0 then return 0; end if;
  if auth.uid() = d.j1 then return 1; end if;
  raise exception 'Ce duel ne te concerne pas';
end $$;

create or replace function public._presence(p_duel uuid, p_joueur smallint) returns void
language sql as $$
  insert into public.presences (duel_id, joueur, vu) values (p_duel, p_joueur, now())
  on conflict (duel_id, joueur) do update set vu = now();
$$;

-- Lance le coup suivant (début de match ou de set).
create or replace function public._demarrer(p_id uuid) returns void
language sql as $$
  update public.duels set phase = 'jeu', prets = '{false,false}', pause_depuis = null,
    echeance = now() + public._duree_coup(), maj_le = now()
  where id = p_id;
$$;

-- Révèle les deux signes du coup en cours et applique les règles officielles.
create or replace function public._resoudre(p_id uuid) returns void
language plpgsql as $$
declare
  d public.duels;
  sa public.coups_secrets; sb public.coups_secrets;
  g smallint; p smallint[]; s smallint[];
begin
  select * into d from public.duels where id = p_id for update;
  select * into sa from public.coups_secrets where duel_id = p_id and manche = d.manche and joueur = 0;
  select * into sb from public.coups_secrets where duel_id = p_id and manche = d.manche and joueur = 1;
  if sa is null or sb is null or d.phase <> 'jeu' then return; end if;

  -- Pierre bat Ciseaux, Ciseaux bat Feuille, Feuille bat Pierre ; égalité : rejouée.
  g := case when sa.signe = sb.signe then null when (sa.signe + 1) % 3 = sb.signe then 0 else 1 end;
  d.coups := d.coups || jsonb_build_object('a', sa.signe, 'b', sb.signe, 'g', g, 'auto', jsonb_build_array(sa.auto, sb.auto));
  d.manche := d.manche + 1;
  d.echeance := now() + public._duree_coup() + interval '0.9 seconds';   -- le temps de voir les signes

  if g is not null then
    p := d.points; p[g + 1] := p[g + 1] + 1;
    -- Set gagné : au moins points_par_set points et 2 points d'écart.
    if greatest(p[1], p[2]) >= d.points_par_set and abs(p[1] - p[2]) >= 2 then
      d.scores_sets := d.scores_sets || jsonb_build_array(jsonb_build_array(p[1], p[2]));
      s := d.sets; s[g + 1] := s[g + 1] + 1; d.sets := s;
      p := '{0,0}';
      if s[g + 1] = d.sets_gagnants then
        d.phase := 'termine'; d.vainqueur := g; d.fin := 'score'; d.echeance := null;
      else
        d.phase := 'entre_sets'; d.prets := '{false,false}'; d.echeance := now() + interval '30 seconds';
      end if;
    end if;
    d.points := p;
  end if;

  update public.duels set coups = d.coups, manche = d.manche, echeance = d.echeance, points = d.points, sets = d.sets,
    scores_sets = d.scores_sets, phase = d.phase, prets = d.prets, vainqueur = d.vainqueur, fin = d.fin, maj_le = now()
  where id = p_id;
end $$;

-- ---------------------------------------------------------------- les actions des joueurs
-- Recherche d'adversaires par pseudo (« Benji » ou « Benji#4821 »).
create or replace function public.chercher_joueurs(p_texte text)
returns table (id uuid, pseudo text, numero smallint, drapeau text, avatar jsonb, niveau int)
language plpgsql stable security definer set search_path = public as $$
declare t text := lower(btrim(coalesce(p_texte, ''))); n text;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if position('#' in t) > 0 then n := split_part(t, '#', 2); t := split_part(t, '#', 1); end if;
  if char_length(t) < 2 then return; end if;
  return query
    select p.id, p.pseudo, p.numero, p.drapeau, p.avatar, coalesce((p.fiche->>'elo')::int, 1200)
    from profils p
    where p.visible_recherche and p.id <> auth.uid()
      and p.pseudo_min like replace(replace(t, '%', ''), '_', '\_') || '%'
      and (n is null or n = '' or p.numero::text like n || '%')
    order by (p.pseudo_min = t) desc, p.pseudo_min, p.numero
    limit 20;
end $$;

-- Lance un défi : à un joueur précis, ou par lien (p_adversaire vide).
create or replace function public.creer_duel(p_adversaire uuid, p_points int, p_sets int)
returns public.duels language plpgsql security definer set search_path = public as $$
declare d public.duels;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton compte'; end if;
  if p_adversaire = auth.uid() then raise exception 'Tu ne peux pas te défier toi-même'; end if;
  if p_adversaire is not null and not exists (select 1 from profils where id = p_adversaire) then raise exception 'Joueur introuvable'; end if;
  if (select count(*) from duels where j0 = auth.uid() and phase = 'attente') >= 5 then
    raise exception 'Tu as déjà 5 défis en attente : annules-en un avant d''en lancer un autre';
  end if;
  insert into duels (j0, j1, par_lien, points_par_set, sets_gagnants)
  values (auth.uid(), p_adversaire, p_adversaire is null, p_points, p_sets)
  returning * into d;
  return d;
end $$;

-- Rejoindre un défi reçu par lien.
create or replace function public.rejoindre_duel(p_code text)
returns public.duels language plpgsql security definer set search_path = public as $$
declare d public.duels;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton compte'; end if;
  select * into d from duels where code = p_code for update;
  if d is null then raise exception 'Défi introuvable'; end if;
  if auth.uid() in (d.j0, d.j1) then return d; end if;                       -- déjà dedans
  if not d.par_lien or d.j1 is not null or d.phase <> 'attente' then raise exception 'Ce défi n''est plus disponible'; end if;
  update duels set j1 = auth.uid(), phase = 'presentation', echeance = now() + interval '45 seconds', maj_le = now()
  where id = d.id returning * into d;
  return d;
end $$;

-- Accepter ou refuser un défi reçu dans l'application.
create or replace function public.repondre_duel(p_id uuid, p_accepte boolean)
returns public.duels language plpgsql security definer set search_path = public as $$
declare d public.duels;
begin
  select * into d from duels where id = p_id for update;
  if d is null or auth.uid() is distinct from d.j1 then raise exception 'Ce défi ne t''est pas adressé'; end if;
  if d.phase <> 'attente' then raise exception 'Ce défi n''est plus disponible'; end if;
  update duels set phase = case when p_accepte then 'presentation' else 'refuse' end,
    echeance = case when p_accepte then now() + interval '45 seconds' end, maj_le = now()
  where id = p_id returning * into d;
  return d;
end $$;

-- Annuler un défi pas encore accepté.
create or replace function public.annuler_duel(p_id uuid)
returns public.duels language plpgsql security definer set search_path = public as $$
declare d public.duels;
begin
  select * into d from duels where id = p_id for update;
  if d is null or auth.uid() is distinct from d.j0 then raise exception 'Ce défi n''est pas le tien'; end if;
  if d.phase <> 'attente' then raise exception 'Ce défi a déjà commencé'; end if;
  update duels set phase = 'annule', maj_le = now() where id = p_id returning * into d;
  return d;
end $$;

-- « Commencer » (après la présentation) ou « Lancer le set suivant ».
create or replace function public.pret(p_id uuid)
returns public.duels language plpgsql security definer set search_path = public as $$
declare d public.duels; moi smallint; pr boolean[];
begin
  select * into d from duels where id = p_id for update;
  if d is null then raise exception 'Duel introuvable'; end if;
  moi := _ma_place(d);
  perform _presence(p_id, moi);
  if d.phase not in ('presentation', 'entre_sets') then return d; end if;
  pr := d.prets; pr[moi + 1] := true;
  update duels set prets = pr, maj_le = now() where id = p_id;
  if pr[1] and pr[2] then perform _demarrer(p_id); end if;
  select * into d from duels where id = p_id;
  return d;
end $$;

-- Jouer son signe (0 = Pierre, 1 = Ciseaux, 2 = Feuille) pour le coup en cours.
create or replace function public.jouer(p_id uuid, p_manche int, p_signe int)
returns public.duels language plpgsql security definer set search_path = public as $$
declare d public.duels; moi smallint;
begin
  select * into d from duels where id = p_id for update;
  if d is null then raise exception 'Duel introuvable'; end if;
  moi := _ma_place(d);
  perform _presence(p_id, moi);
  if d.phase <> 'jeu' then raise exception 'Ce n''est pas le moment de jouer'; end if;
  if d.pause_depuis is not null then raise exception 'Match en pause'; end if;
  if p_manche <> d.manche then raise exception 'Ce coup est déjà terminé'; end if;
  if p_signe not between 0 and 2 then raise exception 'Signe invalide'; end if;
  if now() > d.echeance + _tolerance() then raise exception 'Temps écoulé'; end if;
  if exists (select 1 from coups_secrets where duel_id = p_id and manche = d.manche and joueur = moi) then
    raise exception 'Tu as déjà joué ce coup';
  end if;
  insert into coups_secrets (duel_id, manche, joueur, signe) values (p_id, d.manche, moi, p_signe);
  if (select count(*) from coups_secrets where duel_id = p_id and manche = d.manche) = 2 then
    perform _resoudre(p_id);
  end if;
  select * into d from duels where id = p_id;
  return d;
end $$;

-- Appelé régulièrement par chaque téléphone pendant un duel : signe de vie, et
-- application des délais (5 secondes par coup, pause, forfait, démarrage automatique).
-- Renvoie l'heure du serveur, pour que les deux minuteurs soient synchronisés.
create or replace function public.reclamer(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare d public.duels; moi smallint; lui smallint; vu_lui timestamptz; absent boolean; s int;
begin
  select * into d from duels where id = p_id for update;
  if d is null then raise exception 'Duel introuvable'; end if;
  moi := _ma_place(d); lui := 1 - moi;
  perform _presence(p_id, moi);

  if d.phase in ('presentation', 'entre_sets') and now() > d.echeance then
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

-- Abandonner le duel en cours (défaite).
create or replace function public.abandonner(p_id uuid)
returns public.duels language plpgsql security definer set search_path = public as $$
declare d public.duels; moi smallint;
begin
  select * into d from duels where id = p_id for update;
  if d is null then raise exception 'Duel introuvable'; end if;
  moi := _ma_place(d);
  if d.phase in ('presentation', 'jeu', 'entre_sets') then
    update duels set phase = 'termine', vainqueur = 1 - moi, fin = 'abandon', echeance = null, maj_le = now()
    where id = p_id;
  end if;
  select * into d from duels where id = p_id;
  return d;
end $$;

-- Les fonctions internes ne sont pas appelables par les joueurs.
revoke all on function public._ma_place(public.duels), public._presence(uuid, smallint), public._demarrer(uuid),
  public._resoudre(uuid) from public, anon, authenticated;
revoke all on function public.chercher_joueurs(text), public.creer_duel(uuid, int, int), public.rejoindre_duel(text),
  public.repondre_duel(uuid, boolean), public.annuler_duel(uuid), public.pret(uuid), public.jouer(uuid, int, int),
  public.reclamer(uuid), public.abandonner(uuid) from public, anon;
grant execute on function public.chercher_joueurs(text), public.creer_duel(uuid, int, int), public.rejoindre_duel(text),
  public.repondre_duel(uuid, boolean), public.annuler_duel(uuid), public.pret(uuid), public.jouer(uuid, int, int),
  public.reclamer(uuid), public.abandonner(uuid) to authenticated;
