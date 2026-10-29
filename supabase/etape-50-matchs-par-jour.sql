-- HandSlam — Étape 50 : le nombre de matchs joués chaque jour, toujours anonyme.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ».
-- Nécessite les étapes 43 et 44. Peut être relancé sans risque.
--
-- Décision du porteur du projet (28 octobre) : « trois_matchs » ne compte qu'une fois par téléphone (le jour de son 3e match) ;
-- pour voir l'activité de tous, anciens compris : chaque téléphone signale « un match terminé » à la fin de chaque match
-- (contre un bot ou en ligne ; en ligne, chacun des deux joueurs compte le sien). Sans compte, sans identifiant, sans adresse.
-- La version de test (/preview/) ne compte pas.
--
-- Pour lire les chiffres (éditeur SQL, une ligne) :
-- select to_char(jour,'DD/MM') j, sum(visiteurs) v, sum(nouveaux) n, sum(revenus) r, sum(trois_matchs) t, sum(matchs) m from visites group by jour order by jour desc limit 30;

alter table public.visites add column if not exists matchs int not null default 0;

-- « Je viens de finir un match ».
create or replace function public.compter_match(p_origine text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_origine is null or p_origine not in ('site', 'android', 'installee') then return; end if;
  insert into visites (jour, origine, matchs) values ((now() at time zone 'Europe/Paris')::date, p_origine, 1)
  on conflict (jour, origine) do update set matchs = visites.matchs + 1;
end $$;
revoke all on function public.compter_match(text) from public;
grant execute on function public.compter_match(text) to anon, authenticated;
