-- PCF — Étape 2 : comptes joueurs et fiche sauvegardée en ligne.
--
-- À coller dans Supabase : menu « SQL Editor » → « New query » → coller → « Run ».
-- Le script peut être relancé sans risque (il ne supprime aucune donnée).
--
-- Sécurité : chaque joueur ne peut créer, modifier ou supprimer QUE sa propre fiche.
-- Les autres joueurs connectés peuvent lire le pseudo, le numéro, le pays, l'avatar
-- et les statistiques (utile pour la recherche et le face-à-face des étapes suivantes).
-- L'adresse e-mail n'est jamais visible par les autres joueurs.

-- ---------------------------------------------------------------- la table des profils
create table if not exists public.profils (
  id uuid primary key references auth.users (id) on delete cascade,
  pseudo text not null,
  numero smallint not null,                      -- le « #4821 » qui distingue deux Benji
  pseudo_min text generated always as (lower(pseudo)) stored,
  drapeau text not null default '🇫🇷',
  avatar jsonb not null default '{}'::jsonb,
  fiche jsonb not null default '{}'::jsonb,      -- statistiques, titres, niveau…
  cree_le timestamptz not null default now(),
  maj_le timestamptz not null default now(),
  constraint pseudo_valide check (char_length(pseudo) between 2 and 16 and pseudo !~ '[#[:cntrl:]]' and pseudo = btrim(pseudo)),
  constraint numero_valide check (numero between 1000 and 9999),
  constraint drapeau_court check (char_length(drapeau) <= 8),
  constraint avatar_leger check (pg_column_size(avatar) < 2000),
  constraint fiche_legere check (pg_column_size(fiche) < 100000),
  constraint pseudo_numero_unique unique (pseudo_min, numero)
);

create index if not exists profils_recherche on public.profils (pseudo_min text_pattern_ops);

-- ---------------------------------------------------------------- le numéro, attribué par le serveur
-- Le numéro est tiré au hasard parmi ceux encore libres pour ce pseudo.
-- Le joueur ne peut pas le choisir. S'il change de pseudo, il garde son numéro si possible.
create or replace function public.attribuer_numero()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  essai smallint;
  i int := 0;
begin
  if tg_op = 'UPDATE' then
    new.id := old.id;
    new.cree_le := old.cree_le;
    new.numero := old.numero;
    if lower(new.pseudo) = lower(old.pseudo) then
      new.maj_le := now();
      return new;
    end if;
    if not exists (select 1 from profils where pseudo_min = lower(new.pseudo) and numero = old.numero and id <> old.id) then
      new.maj_le := now();
      return new;
    end if;
  end if;
  loop
    essai := (1000 + floor(random() * 9000))::smallint;
    exit when not exists (select 1 from profils where pseudo_min = lower(new.pseudo) and numero = essai);
    i := i + 1;
    if i > 200 then
      raise exception 'Ce pseudo est trop demandé, choisis-en un autre.';
    end if;
  end loop;
  new.numero := essai;
  new.maj_le := now();
  if tg_op = 'INSERT' then new.cree_le := now(); end if;
  return new;
end;
$$;

drop trigger if exists profils_numero on public.profils;
create trigger profils_numero
  before insert or update on public.profils
  for each row execute function public.attribuer_numero();

-- ---------------------------------------------------------------- règles de sécurité (RLS)
alter table public.profils enable row level security;

drop policy if exists "lecture par les joueurs connectés" on public.profils;
create policy "lecture par les joueurs connectés" on public.profils
  for select to authenticated using (true);

drop policy if exists "création de sa propre fiche" on public.profils;
create policy "création de sa propre fiche" on public.profils
  for insert to authenticated with check (id = auth.uid());

drop policy if exists "modification de sa propre fiche" on public.profils;
create policy "modification de sa propre fiche" on public.profils
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "suppression de sa propre fiche" on public.profils;
create policy "suppression de sa propre fiche" on public.profils
  for delete to authenticated using (id = auth.uid());

-- Les visiteurs non connectés n'ont accès à rien.
revoke all on public.profils from anon;
grant select, insert, update, delete on public.profils to authenticated;

-- ---------------------------------------------------------------- suppression du compte
-- Un joueur peut supprimer son compte et toutes ses données (droit à l'effacement).
create or replace function public.supprimer_mon_compte()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Non connecté';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.supprimer_mon_compte() from public, anon;
grant execute on function public.supprimer_mon_compte() to authenticated;
