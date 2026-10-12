-- HandSlam — Étape 43 : un compteur de visites, anonyme.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ».
-- Nécessite les étapes 2 à 42. Peut être relancé sans risque.
--
-- Décision du porteur du projet (12 octobre) : connaître le nombre de visites, sans outil extérieur ni pistage.
-- Chaque téléphone (ou navigateur) signale au plus une fois par jour « j'ai ouvert l'appli », sans rien d'autre :
-- ni compte, ni identifiant, ni adresse. Le serveur ne garde que des totaux par jour et par origine
-- (site, appli Android, appli installée depuis le navigateur). La version de test (/preview/) ne compte pas.
--
-- Pour lire les chiffres (éditeur SQL) : select * from visites order by jour desc, origine limit 60;

create table if not exists public.visites (
  jour date not null,
  origine text not null check (origine in ('site', 'android', 'installee')),
  visiteurs int not null default 0,      -- téléphones (ou navigateurs) différents ce jour-là
  nouveaux int not null default 0,       -- dont ceux qui ouvraient HandSlam pour la première fois
  primary key (jour, origine)
);
alter table public.visites enable row level security;   -- aucune règle : personne ne lit ni n'écrit directement
revoke all on public.visites from anon, authenticated;

-- « J'ai ouvert l'appli aujourd'hui » (appelé une fois par jour par l'appli, avec ou sans compte).
create or replace function public.compter_visite(p_origine text, p_nouveau boolean default false) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_origine is null or p_origine not in ('site', 'android', 'installee') then return; end if;
  insert into visites (jour, origine, visiteurs, nouveaux)
  values ((now() at time zone 'Europe/Paris')::date, p_origine, 1, case when p_nouveau then 1 else 0 end)
  on conflict (jour, origine) do update
    set visiteurs = visites.visiteurs + 1, nouveaux = visites.nouveaux + case when p_nouveau then 1 else 0 end;
end $$;
revoke all on function public.compter_visite(text, boolean) from public;
grant execute on function public.compter_visite(text, boolean) to anon, authenticated;
