-- PCF — Étape 10 : signaler un joueur, et garder Supabase éveillé.
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 9. Peut être relancé sans risque.
--
-- Principes :
--  * un joueur peut en signaler un autre (pseudo, avatar ou comportement), une fois par motif ;
--  * un pseudo signalé par 3 joueurs différents est retiré automatiquement : il devient « Joueur »,
--    et ce pseudo ne peut plus être repris ;
--  * l'administrateur voit les signalements dans « Table Editor » → vue « signalements_a_traiter »,
--    et peut retirer un pseudo lui-même (voir supabase/LISEZMOI.md) ;
--  * ping() : une fonction qui ne fait rien, appelée chaque jour par GitHub pour que Supabase
--    ne mette pas le projet en pause (il le fait après une semaine sans activité).

create table if not exists public.signalements (
  id bigint generated always as identity primary key,
  auteur uuid not null references public.profils (id) on delete cascade,
  joueur uuid not null references public.profils (id) on delete cascade,
  motif text not null check (motif in ('pseudo', 'avatar', 'comportement')),
  detail text check (char_length(detail) <= 300),
  pseudo_signale text,                              -- le pseudo au moment du signalement
  cree_le timestamptz not null default now(),
  traite boolean not null default false,
  constraint un_signalement_par_motif unique (auteur, joueur, motif),
  constraint pas_soi_meme check (auteur <> joueur)
);
alter table public.signalements enable row level security;
revoke all on public.signalements from public, anon, authenticated;

create table if not exists public.pseudos_interdits (
  pseudo_min text primary key,
  cree_le timestamptz not null default now()
);
alter table public.pseudos_interdits enable row level security;
revoke all on public.pseudos_interdits from public, anon, authenticated;

create or replace function public._seuil_signalements() returns int language sql immutable as $$ select 3 $$;
create or replace function public._max_signalements_jour() returns int language sql immutable as $$ select 20 $$;

-- Retirer un pseudo : il devient « Joueur » et ne peut plus être repris.
create or replace function public._retirer_pseudo(p_joueur uuid) returns void
language plpgsql security definer set search_path = public as $$
declare ancien text;
begin
  select pseudo_min into ancien from profils where id = p_joueur;
  if ancien is null then return; end if;
  if ancien <> 'joueur' then insert into pseudos_interdits (pseudo_min) values (ancien) on conflict do nothing; end if;
  update profils set pseudo = 'Joueur', maj_le = now() where id = p_joueur;
  update signalements set traite = true where joueur = p_joueur and motif = 'pseudo';
end $$;

-- Pour l'administrateur (depuis l'éditeur SQL) : select moderer_pseudo('identifiant-du-joueur');
create or replace function public.moderer_pseudo(p_joueur uuid) returns void
language sql security definer set search_path = public as $$ select _retirer_pseudo(p_joueur) $$;

-- Un pseudo retiré ne peut pas être repris (ni à la création, ni en changeant de pseudo).
create or replace function public._pseudo_autorise() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT' or lower(new.pseudo) <> lower(old.pseudo))
     and exists (select 1 from pseudos_interdits where pseudo_min = lower(new.pseudo)) then
    raise exception 'Ce pseudo n''est pas autorisé : choisis-en un autre.';
  end if;
  return new;
end $$;
drop trigger if exists profils_interdits on public.profils;
create trigger profils_interdits before insert or update of pseudo on public.profils
for each row execute function public._pseudo_autorise();

-- Signaler un joueur. Renvoie 'envoye', ou 'deja' si on l'a déjà signalé pour ce motif.
create or replace function public.signaler_joueur(p_joueur uuid, p_motif text, p_detail text default null) returns text
language plpgsql security definer set search_path = public as $$
declare moi uuid := auth.uid(); n int;
begin
  if moi is null then raise exception 'Non connecté'; end if;
  if p_joueur = moi then raise exception 'Tu ne peux pas te signaler toi-même'; end if;
  if p_motif is null or p_motif not in ('pseudo', 'avatar', 'comportement') then raise exception 'Motif inconnu'; end if;
  if not exists (select 1 from profils where id = p_joueur) then raise exception 'Joueur introuvable'; end if;
  if (select count(*) from signalements where auteur = moi and cree_le > now() - interval '24 hours') >= _max_signalements_jour() then
    raise exception 'Trop de signalements aujourd''hui : réessaie demain.';
  end if;
  insert into signalements (auteur, joueur, motif, detail, pseudo_signale)
  values (moi, p_joueur, p_motif, nullif(left(btrim(coalesce(p_detail, '')), 300), ''), (select pseudo from profils where id = p_joueur))
  on conflict (auteur, joueur, motif) do nothing;
  if not found then return 'deja'; end if;
  -- Trois joueurs différents trouvent le pseudo inacceptable : il est retiré tout de suite.
  if p_motif = 'pseudo' then
    select count(distinct auteur) into n from signalements where joueur = p_joueur and motif = 'pseudo' and not traite;
    if n >= _seuil_signalements() then perform _retirer_pseudo(p_joueur); end if;
  end if;
  return 'envoye';
end $$;

-- Pour l'administrateur : les signalements à traiter, lisibles (Table Editor → signalements_a_traiter).
create or replace view public.signalements_a_traiter as
  select s.cree_le, s.motif, s.pseudo_signale, p.pseudo || '#' || p.numero as pseudo_actuel, s.detail,
         a.pseudo || '#' || a.numero as signale_par, s.joueur as identifiant_du_joueur, s.id
  from signalements s join profils p on p.id = s.joueur join profils a on a.id = s.auteur
  where not s.traite order by s.cree_le desc;
revoke all on public.signalements_a_traiter from public, anon, authenticated;

-- Le réveil quotidien (voir .github/workflows/reveil-supabase.yml).
create or replace function public.ping() returns text language sql stable as $$ select 'pong'::text $$;

revoke all on function public._retirer_pseudo(uuid), public.moderer_pseudo(uuid), public._pseudo_autorise(),
  public._seuil_signalements(), public._max_signalements_jour() from public, anon, authenticated;
revoke all on function public.signaler_joueur(uuid, text, text) from public, anon;
grant execute on function public.signaler_joueur(uuid, text, text) to authenticated;
grant execute on function public.ping() to anon, authenticated;
