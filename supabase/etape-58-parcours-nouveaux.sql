-- HandSlam — Étape 58 : le parcours des nouveaux joueurs, toujours anonyme.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ».
-- Nécessite les étapes 43, 44 et 50. Peut être relancé sans risque.
--
-- Priorité du porteur du projet (audit, 3 novembre) : savoir ce que deviennent les nouveaux. Les chiffres sont rangés par
-- jour d'arrivée (le jour de la toute première ouverture sur ce téléphone) :
--   nouveaux      : les téléphones arrivés ce jour-là ;
--   premier_match : parmi eux, ceux qui ont fini leur premier match (une seule fois par téléphone, dans les 30 jours) ;
--   retour_1j     : ceux qui sont revenus le lendemain de leur arrivée ;
--   retour_7j     : ceux qui sont revenus une semaine plus tard (entre le 7e et le 13e jour, compté une seule fois).
-- Le téléphone se souvient lui-même de son jour d'arrivée ; il n'envoie que ce jour et l'origine (site, appli Android, appli
-- installée) : ni compte, ni identifiant, ni adresse. Le serveur ne garde que des totaux. La version de test ne compte pas.
-- Seuls les téléphones arrivés avec cette version de l'appli (ou plus récente) sont suivis.
--
-- Pour lire les chiffres (éditeur SQL, une ligne) :
-- select to_char(arrivee,'DD/MM') arrivee, sum(nouveaux) n, sum(premier_match) fini_1er_match, sum(retour_1j) revenu_j1, sum(retour_7j) revenu_j7 from parcours group by arrivee order by arrivee desc limit 30;

create table if not exists public.parcours (
  arrivee date not null,
  origine text not null check (origine in ('site', 'android', 'installee')),
  nouveaux int not null default 0,
  premier_match int not null default 0,
  retour_1j int not null default 0,
  retour_7j int not null default 0,
  primary key (arrivee, origine)
);
alter table public.parcours enable row level security;   -- aucune règle : personne ne lit ni n'écrit directement
revoke all on public.parcours from anon, authenticated;

-- Une étape du parcours d'un nouveau : « arrive » (le jour même), « premier_match », « retour_1j » ou « retour_7j ».
-- Le serveur vérifie que la date d'arrivée va avec l'étape (pas d'arrivée dans le futur, ni trop ancienne).
create or replace function public.compter_parcours(p_origine text, p_arrivee date, p_etape text) returns void
language plpgsql security definer set search_path = public as $$
declare
  aujourdhui date := (now() at time zone 'Europe/Paris')::date;
  ecart int := aujourdhui - p_arrivee;
begin
  if p_origine is null or p_origine not in ('site', 'android', 'installee') or p_arrivee is null then return; end if;
  if not (p_etape = 'arrive' and ecart = 0
       or p_etape = 'premier_match' and ecart between 0 and 30
       or p_etape = 'retour_1j' and ecart = 1
       or p_etape = 'retour_7j' and ecart between 7 and 13) then return; end if;
  insert into parcours (arrivee, origine, nouveaux, premier_match, retour_1j, retour_7j)
  values (p_arrivee, p_origine, (p_etape = 'arrive')::int, (p_etape = 'premier_match')::int, (p_etape = 'retour_1j')::int, (p_etape = 'retour_7j')::int)
  on conflict (arrivee, origine) do update set
    nouveaux = parcours.nouveaux + (p_etape = 'arrive')::int,
    premier_match = parcours.premier_match + (p_etape = 'premier_match')::int,
    retour_1j = parcours.retour_1j + (p_etape = 'retour_1j')::int,
    retour_7j = parcours.retour_7j + (p_etape = 'retour_7j')::int;
end $$;
revoke all on function public.compter_parcours(text, date, text) from public;
grant execute on function public.compter_parcours(text, date, text) to anon, authenticated;
