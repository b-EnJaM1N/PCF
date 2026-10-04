-- HandSlam — Étape 29 : une vraie échelle de bots, une marche par mise.
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 28. Peut être relancé sans risque.
-- Si on relance un jour l'étape 24 ou 25, il faut relancer celle-ci ensuite.
--
-- Décision du porteur du projet : plus la mise est élevée, plus les bots sont forts, mise par mise
-- (avant : trois niveaux seulement, 100 et 200 donnaient les mêmes bots, 500 et 1 000 aussi).
--   sans mise, freeroll : n'importe lesquels
--   50 : 850 à 1 050    100 : 1 000 à 1 200    200 : 1 150 à 1 350    500 : 1 300 à 1 500
--   1 000 (et le Grand Chelem) : 1 450 et plus
-- Dans les grandes salles, s'il n'y a pas assez de bots de ce niveau, on prend les plus proches (étape 24).

-- Les niveaux de bots voulus pour une mise (null : n'importe lesquels).
create or replace function public._niveaux_bots_mise(p_mise int) returns int4range
language sql immutable as $$
  select case when coalesce(p_mise, 0) <= 0 then null
              when p_mise <= 50 then int4range(850, 1050, '[]')
              when p_mise <= 100 then int4range(1000, 1200, '[]')
              when p_mise <= 200 then int4range(1150, 1350, '[]')
              when p_mise <= 500 then int4range(1300, 1500, '[]')
              else int4range(1450, null) end
$$;

-- Les niveaux de bots voulus pour un tournoi (remplace la version de l'étape 24) : selon sa mise, sauf le freeroll.
create or replace function public._niveaux_bots(t public.tournois) returns int4range
language sql immutable as $$
  select case when t.freeroll is not null then null else public._niveaux_bots_mise(t.mise) end
$$;

revoke all on function public._niveaux_bots_mise(int), public._niveaux_bots(public.tournois) from public, anon, authenticated;
