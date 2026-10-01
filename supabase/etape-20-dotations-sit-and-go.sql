-- PCF — Étape 20 : les Sit & Go à mise passent aux dotations façon poker.
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 19. Peut être relancé sans risque.
-- Si on relance un jour les étapes 14 ou 18, il faut relancer celle-ci ensuite.
--
-- Même grille que les tournois programmés (étape 19) : à 8 joueurs, les 2 finalistes sont payés, 65 % et 35 %
-- de la cagnotte (les entrées moins 10 %).

-- Les gains d'un Sit & Go à mise (ou les entrées rendues s'il est annulé). Remplace la version de l'étape 18.
create or replace function public._gains_tournoi() returns trigger
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if coalesce(new.mise, 0) <= 0 or new.programme is not null or new.phase = old.phase then return new; end if;
  if new.phase = 'annule' and old.phase in ('inscriptions', 'en_cours') then
    perform _crediter(i.joueur, new.mise, 'entrée rendue') from inscrits_tournoi i where i.tournoi_id = new.id;
  elsif new.phase = 'termine' then
    n := coalesce(new.taille, (select count(*) from inscrits_tournoi where tournoi_id = new.id));
    perform _verser_dotations(new.id, floor(new.mise * n * (1 - _commission()))::int, n, 'Sit & Go');
  end if;
  return new;
end $$;

-- Le classement du mois : toutes les places payées des Sit & Go aussi. Remplace la version de l'étape 19.
create or replace function public._motifs_jeu() returns text[] language sql immutable as $$
  select array['mise de duel', 'gain de duel', 'mise rendue', 'entrée de Sit & Go', 'entrée rendue', 'entrée de tournoi']
    || array(select j || ' : ' || p from unnest(array['tournoi', 'freeroll', 'Sit & Go']) j, unnest(_noms_places()) p)
$$;

revoke all on function public._gains_tournoi() from public, anon, authenticated;
