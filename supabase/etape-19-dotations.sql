-- PCF — Étape 19 : les dotations façon poker (tournois programmés et freeroll).
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 18. Peut être relancé sans risque.
-- Si on relance un jour les étapes 15 ou 18, il faut relancer celle-ci ensuite.
--
-- Comme au poker : on paie environ 10 à 15 % des joueurs (au moins les 2 finalistes), le plus petit gain vaut
-- au moins 1,5 fois l'entrée, et le 1er touche de 65 % (petit tournoi) à 23 % (très gros tournoi) de la cagnotte.
-- En élimination directe, les places payées vont par tour : 1er, 2e, 3e-4e (perdants des demi-finales), 5e-8e (quarts)…
-- Places payées : la plus grande puissance de 2 qui ne dépasse pas 15 % des joueurs au départ (de 2 à 64).
-- Les Sit & Go à mise (salles de 8) gardent leur partage 50 / 30 / 10 / 10.

-- La grille : la part de chaque joueur du palier, en dix-millièmes (la même que dans app/js/programmes-logique.js).
create or replace function public._grille(p_places int) returns int[] language sql immutable as $$
  select case p_places
    when 2 then array[6500, 3500]
    when 4 then array[5000, 2500, 1250]
    when 8 then array[4000, 2200, 1100, 400]
    when 16 then array[3200, 1800, 900, 450, 175]
    when 32 then array[2612, 1500, 750, 375, 175, 93]
    else array[2280, 1300, 650, 320, 160, 80, 40] end
$$;
create or replace function public._places_payees(p_joueurs int) returns int language plpgsql immutable as $$
declare p int := 2;
begin
  while p < 64 and p * 2 <= 0.15 * p_joueurs loop p := p * 2; end loop;
  return p;
end $$;
create or replace function public._noms_places() returns text[] language sql immutable as $$
  select array['1er', '2e', 'demi-finale', 'quart de finale', '8e de finale', '16e de finale', '32e de finale']
$$;

-- Verse la cagnotte d'un tournoi terminé selon la grille ; p_joueurs : joueurs au départ ; p_jeu : « tournoi » ou « freeroll ».
create or replace function public._verser_dotations(p_id uuid, p_pot int, p_joueurs int, p_jeu text) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; g int[] := _grille(_places_payees(p_joueurs)); f public.matchs_tournoi; m public.matchs_tournoi; perdant uuid; k int;
begin
  select * into t from tournois where id = p_id;
  select * into f from matchs_tournoi where tournoi_id = p_id and tour = t.nb_tours and position = 1;
  if f.vainqueur is not null then
    perform _portefeuille_de(f.vainqueur); perform _crediter(f.vainqueur, floor(p_pot * g[1] / 10000.0)::int, p_jeu || ' : 1er');
  end if;
  for k in 2 .. array_length(g, 1) loop
    exit when t.nb_tours - (k - 2) < 1;
    for m in select * from matchs_tournoi where tournoi_id = p_id and tour = t.nb_tours - (k - 2) and vainqueur is not null loop
      perdant := case when m.vainqueur = m.j0 then m.j1 else m.j0 end;
      if perdant is not null then
        perform _portefeuille_de(perdant); perform _crediter(perdant, floor(p_pot * g[k] / 10000.0)::int, p_jeu || ' : ' || (_noms_places())[k]);
      end if;
    end loop;
  end loop;
end $$;

-- Tournois programmés : remplace la version de l'étape 18.
create or replace function public._gains_programme() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.programme is null or new.phase = old.phase then return new; end if;
  if new.phase = 'annule' and old.phase = 'inscriptions' then
    perform _crediter(i.joueur, new.mise, 'entrée rendue') from inscrits_tournoi i where i.tournoi_id = new.id;
  elsif new.phase = 'termine' then
    perform _verser_dotations(new.id, _cagnotte_programme(new), (select count(*)::int from inscrits_tournoi where tournoi_id = new.id), 'tournoi');
  end if;
  return new;
end $$;

-- Freeroll : remplace la version de l'étape 15 (cagnotte offerte : 1 000 + 50 par joueur).
create or replace function public._gains_freeroll() returns trigger
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if new.freeroll is null or new.phase <> 'termine' or old.phase = 'termine' then return new; end if;
  n := (select count(*) from inscrits_tournoi where tournoi_id = new.id);
  perform _verser_dotations(new.id, 1000 + 50 * n, n, 'freeroll');
  return new;
end $$;

-- Le classement du mois compte toutes les places payées. Remplace la version de l'étape 18.
create or replace function public._motifs_jeu() returns text[] language sql immutable as $$
  select array['mise de duel', 'gain de duel', 'mise rendue', 'entrée de Sit & Go', 'entrée rendue', 'entrée de tournoi',
               'Sit & Go : 1er', 'Sit & Go : 2e', 'Sit & Go : demi-finale']
    || array(select j || ' : ' || p from unnest(array['tournoi', 'freeroll']) j, unnest(_noms_places()) p)
$$;

revoke all on function public._grille(int), public._places_payees(int), public._noms_places(),
  public._verser_dotations(uuid, int, int, text), public._gains_programme(), public._gains_freeroll() from public, anon, authenticated;
