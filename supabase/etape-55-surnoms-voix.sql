-- HandSlam — Étape 55 : Roland dit les surnoms d'un trait (fonction « Surnom »).
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite l'étape 2. Peut être relancé sans risque.
--
-- Décision du porteur du projet (2 novembre) : seuls les surnoms vraiment portés sont enregistrés, une fois chacun, par la
-- fonction « Surnom » (supabase/functions/surnom/index.ts), dans le stockage public « surnoms ». Cette table note chaque
-- enregistrement, pour limiter la dépense de crédits (3 par joueur et par jour, 60 par jour en tout).

-- Le stockage public des voix des surnoms (lecture libre ; seule la fonction y dépose des fichiers).
insert into storage.buckets (id, name, public) values ('surnoms', 'surnoms', true) on conflict (id) do update set public = true;

create table if not exists public.surnoms_voix (
  cle text primary key,                       -- <nom>__<complement>, comme le nom du fichier
  par uuid references auth.users on delete set null,
  cree_le timestamptz not null default now()
);
create index if not exists surnoms_voix_cree_le on public.surnoms_voix (cree_le);
-- Personne n'y touche directement (seule la fonction, avec la clé de service).
alter table public.surnoms_voix enable row level security;
revoke all on public.surnoms_voix from anon, authenticated;
