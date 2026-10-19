-- HandSlam — Étape 44 : deux chiffres de plus dans le compteur de visites, toujours anonymes.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ».
-- Nécessite l'étape 43. Peut être relancé sans risque.
--
-- Décision du porteur du projet (version de lancement) : savoir si les joueurs accrochent.
--   revenus     : parmi les visiteurs du jour, ceux qui avaient déjà ouvert l'appli la veille ;
--   trois_matchs : les téléphones qui viennent de jouer leur 3e match (une seule fois par téléphone).
-- Toujours sans compte, sans identifiant, sans adresse : le téléphone se souvient lui-même de sa dernière visite.
--
-- Pour lire les chiffres (éditeur SQL, une ligne) :
-- select jour, sum(visiteurs) visiteurs, sum(nouveaux) nouveaux, sum(revenus) revenus, sum(trois_matchs) trois_matchs from visites group by jour order by jour desc limit 30;

alter table public.visites add column if not exists revenus int not null default 0;
alter table public.visites add column if not exists trois_matchs int not null default 0;

-- « J'ai ouvert l'appli aujourd'hui » (+ « j'étais déjà là hier »). Remplace la version de l'étape 43 ;
-- les anciennes versions de l'appli, qui n'envoient que l'origine et « nouveau », marchent toujours.
drop function if exists public.compter_visite(text, boolean);
create or replace function public.compter_visite(p_origine text, p_nouveau boolean default false, p_revenu boolean default false) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_origine is null or p_origine not in ('site', 'android', 'installee') then return; end if;
  insert into visites (jour, origine, visiteurs, nouveaux, revenus)
  values ((now() at time zone 'Europe/Paris')::date, p_origine, 1, case when p_nouveau then 1 else 0 end, case when p_revenu then 1 else 0 end)
  on conflict (jour, origine) do update
    set visiteurs = visites.visiteurs + 1, nouveaux = visites.nouveaux + case when p_nouveau then 1 else 0 end,
        revenus = visites.revenus + case when p_revenu then 1 else 0 end;
end $$;
revoke all on function public.compter_visite(text, boolean, boolean) from public;
grant execute on function public.compter_visite(text, boolean, boolean) to anon, authenticated;

-- « Je viens de jouer mon 3e match » (envoyé une seule fois par téléphone).
create or replace function public.compter_trois_matchs(p_origine text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_origine is null or p_origine not in ('site', 'android', 'installee') then return; end if;
  insert into visites (jour, origine, trois_matchs) values ((now() at time zone 'Europe/Paris')::date, p_origine, 1)
  on conflict (jour, origine) do update set trois_matchs = visites.trois_matchs + 1;
end $$;
revoke all on function public.compter_trois_matchs(text) from public;
grant execute on function public.compter_trois_matchs(text) to anon, authenticated;
