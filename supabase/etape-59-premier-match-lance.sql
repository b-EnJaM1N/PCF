-- HandSlam — Étape 59 : dans le parcours des nouveaux, ceux qui lancent leur premier match et ceux qui y jouent un coup.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ».
-- Nécessite l'étape 58. Peut être relancé sans risque.
--
-- Question du porteur du projet (6 novembre) : un seul nouveau sur cinq finit son premier match (contre Bambi, un set de 7) ;
-- ne le lancent-ils pas, ou décrochent-ils en route ? Deux colonnes de plus, toujours rangées par jour d'arrivée :
--   premier_lance : ceux qui ont touché « Jouer mon premier match » (une seule fois par téléphone) ;
--   premier_coup  : ceux qui y ont joué au moins un coup (une seule fois par téléphone).
-- Toujours anonyme : le téléphone n'envoie que son jour d'arrivée et son origine.
--
-- Pour lire les chiffres (éditeur SQL, une ligne) :
-- select to_char(arrivee,'DD/MM') arrivee, sum(nouveaux) n, sum(premier_lance) lance, sum(premier_coup) un_coup, sum(premier_match) fini, sum(retour_1j) j1, sum(retour_7j) j7 from parcours group by arrivee order by arrivee desc limit 30;

alter table public.parcours add column if not exists premier_lance int not null default 0;
alter table public.parcours add column if not exists premier_coup int not null default 0;

create or replace function public.compter_parcours(p_origine text, p_arrivee date, p_etape text) returns void
language plpgsql security definer set search_path = public as $$
declare
  aujourdhui date := (now() at time zone 'Europe/Paris')::date;
  ecart int := aujourdhui - p_arrivee;
begin
  if p_origine is null or p_origine not in ('site', 'android', 'installee') or p_arrivee is null then return; end if;
  if not (p_etape = 'arrive' and ecart = 0
       or p_etape in ('premier_lance', 'premier_coup', 'premier_match') and ecart between 0 and 30
       or p_etape = 'retour_1j' and ecart = 1
       or p_etape = 'retour_7j' and ecart between 7 and 13) then return; end if;
  insert into parcours (arrivee, origine, nouveaux, premier_lance, premier_coup, premier_match, retour_1j, retour_7j)
  values (p_arrivee, p_origine, (p_etape = 'arrive')::int, (p_etape = 'premier_lance')::int, (p_etape = 'premier_coup')::int,
    (p_etape = 'premier_match')::int, (p_etape = 'retour_1j')::int, (p_etape = 'retour_7j')::int)
  on conflict (arrivee, origine) do update set
    nouveaux = parcours.nouveaux + (p_etape = 'arrive')::int,
    premier_lance = parcours.premier_lance + (p_etape = 'premier_lance')::int,
    premier_coup = parcours.premier_coup + (p_etape = 'premier_coup')::int,
    premier_match = parcours.premier_match + (p_etape = 'premier_match')::int,
    retour_1j = parcours.retour_1j + (p_etape = 'retour_1j')::int,
    retour_7j = parcours.retour_7j + (p_etape = 'retour_7j')::int;
end $$;
revoke all on function public.compter_parcours(text, date, text) from public;
grant execute on function public.compter_parcours(text, date, text) to anon, authenticated;
