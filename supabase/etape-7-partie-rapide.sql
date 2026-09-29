-- PCF — Étape 7 : la Partie rapide (trouver un adversaire en un clic).
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 6. Peut être relancé sans risque.
-- Si on relance un jour les étapes 3, 5 ou 6, il faut relancer celle-ci ensuite.
--
-- Principes :
--  * deux files d'attente : « officielle » (sets de 11, 2 sets gagnants, compte pour le niveau officiel)
--    et « éclair » (un set de 7, amicale) ;
--  * on est associé au joueur en attente dont le niveau est le plus proche ;
--  * il faut rester sur l'écran : sans signe de vie depuis 15 secondes, on sort de la file ;
--  * le duel démarre aussitôt ; si l'adversaire n'arrive jamais (30 secondes), la partie est annulée
--    (ni victoire ni défaite).

alter table public.duels add column if not exists rapide boolean not null default false;

create table if not exists public.file_rapide (
  joueur uuid primary key references public.profils (id) on delete cascade,
  format text not null check (format in ('officiel', 'eclair')),
  niveau int not null,
  entree timestamptz not null default now(),        -- arrivée dans la file
  vu timestamptz not null default now(),            -- dernier signe de vie
  duel_id uuid references public.duels (id) on delete set null   -- rempli quand un adversaire nous a trouvés
);
alter table public.file_rapide enable row level security;
revoke all on public.file_rapide from public, anon, authenticated;   -- lue et écrite seulement par les fonctions ci-dessous

create or replace function public._absence_file() returns interval language sql immutable as $$ select interval '15 seconds' $$;
create or replace function public._arrivee_rapide() returns interval language sql immutable as $$ select interval '30 seconds' $$;

-- Retire de la file ceux qui ne donnent plus signe de vie.
create or replace function public._nettoyer_file() returns void
language sql security definer set search_path = public as $$
  delete from file_rapide where (duel_id is null and vu < now() - _absence_file()) or (duel_id is not null and vu < now() - interval '5 minutes');
$$;

-- Chercher une partie (appelé toutes les 2 à 3 secondes tant qu'on attend : c'est aussi le signe de vie).
-- Renvoie { duel } quand un adversaire est trouvé, sinon { attente, depuis, en_attente, maintenant }.
create or replace function public.chercher_partie(p_format text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare moi uuid := auth.uid(); e public.file_rapide; autre public.file_rapide; d public.duels; niv int;
begin
  if moi is null then raise exception 'Non connecté'; end if;
  if p_format is null or p_format not in ('officiel', 'eclair') then raise exception 'Format inconnu'; end if;
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

  niv := coalesce((select points from classements where joueur = moi), _classement_depart());

  -- Quelqu'un attend dans la même file : le niveau le plus proche, puis celui qui attend depuis le plus longtemps.
  select * into autre from file_rapide f
  where f.format = p_format and f.joueur <> moi and f.duel_id is null
  order by abs(f.niveau - niv), f.entree limit 1;
  if autre.joueur is not null then
    insert into duels (j0, j1, points_par_set, sets_gagnants, classe, rapide, phase, echeance)
    values (autre.joueur, moi, case when p_format = 'officiel' then 11 else 7 end, case when p_format = 'officiel' then 2 else 1 end,
            p_format = 'officiel', true, 'presentation', now() + _arrivee_rapide())
    returning * into d;
    update file_rapide set duel_id = d.id, vu = now() where joueur = autre.joueur;
    delete from file_rapide where joueur = moi;
    return jsonb_build_object('duel', to_jsonb(d));
  end if;

  -- Personne : j'attends (ou je continue d'attendre).
  insert into file_rapide (joueur, format, niveau) values (moi, p_format, niv)
  on conflict (joueur) do update set vu = now(), niveau = excluded.niveau, format = excluded.format, duel_id = null,
    entree = case when file_rapide.format = excluded.format then file_rapide.entree else now() end;
  select * into e from file_rapide where joueur = moi;
  return jsonb_build_object('attente', true, 'depuis', e.entree, 'maintenant', now(),
    'en_attente', (select count(*) from file_rapide where format = p_format and duel_id is null));
end $$;

-- Quitter la file.
create or replace function public.quitter_partie() returns void
language sql security definer set search_path = public as $$
  delete from file_rapide where joueur = auth.uid() and duel_id is null;
$$;

-- Combien de joueurs attendent dans chaque file (pour l'écran d'accueil de la Partie rapide).
create or replace function public.file_partie_rapide() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  perform _nettoyer_file();
  return jsonb_build_object(
    'officiel', (select count(*) from file_rapide where format = 'officiel' and duel_id is null and joueur <> auth.uid()),
    'eclair', (select count(*) from file_rapide where format = 'eclair' and duel_id is null and joueur <> auth.uid()));
end $$;

-- ---------------------------------------------------------------- reclamer (remplace la version de l'étape 6)
-- Nouveau : une partie rapide dont l'adversaire n'est jamais arrivé est annulée (au lieu d'un forfait).
create or replace function public.reclamer(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare d public.duels; moi smallint; lui smallint; vu_lui timestamptz; absent boolean; s int;
begin
  select * into d from duels where id = p_id for update;
  if d is null then raise exception 'Duel introuvable'; end if;
  moi := _ma_place(d); lui := 1 - moi;
  perform _presence(p_id, moi);

  if d.phase = 'presentation' and now() > d.echeance and d.rapide
     and not exists (select 1 from presences where duel_id = p_id and joueur = lui) then
    -- Partie rapide : l'adversaire n'est jamais arrivé : la partie est annulée, sans vainqueur.
    update duels set phase = 'annule', echeance = null, maj_le = now() where id = p_id;
  elsif d.phase = 'presentation' and now() > d.echeance and d.tournoi_id is not null
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

-- ---------------------------------------------------------------- sécurité
revoke all on function public._nettoyer_file() from public, anon, authenticated;
revoke all on function public.chercher_partie(text), public.quitter_partie(), public.file_partie_rapide(), public.reclamer(uuid) from public, anon;
grant execute on function public.chercher_partie(text), public.quitter_partie(), public.file_partie_rapide(), public.reclamer(uuid) to authenticated;
