-- HandSlam — Étape 42 : une salle de Sit & Go n'est jamais le Grand Chelem ni le freeroll.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ».
-- Nécessite les étapes 2 à 41. Peut être relancé sans risque.
--
-- Correction (12 octobre) : pour trouver la salle à rejoindre, le serveur prenait n'importe quel tournoi automatique
-- ouvert de la même taille et de la même mise. Le Grand Chelem (64 places, 1 000 jetons) et le freeroll (64 places,
-- sans mise) en sont aussi : « Entrer » dans un Sit & Go de 64 joueurs à 1 000 jetons inscrivait au Grand Chelem
-- (ou affichait « duplicate key… » si on y était déjà inscrit), et un Sit & Go de 64 sans mise, au freeroll.

-- La salle d'attente d'une taille et d'une mise (remplace la version de l'étape 14) : seulement les vrais Sit & Go.
create or replace function public._salle(p_taille int, p_mise int default 0) returns public.tournois
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  perform pg_advisory_xact_lock(hashtext('pcf-sng-' || p_taille || '-' || coalesce(p_mise, 0)));
  select * into t from tournois where mode = 'direct' and freeroll is null and programme is null
    and phase = 'inscriptions' and taille = p_taille and mise = coalesce(p_mise, 0)
  order by cree_le limit 1 for update;
  if t.id is null then
    insert into tournois (nom, cercle_id, createur, points_par_set, sets_gagnants, duree_tour, mode, taille, mise)
    values (case when coalesce(p_mise, 0) > 0 then 'Sit & Go · ' || p_mise || ' jetons' else 'Sit & Go · ' || p_taille || ' joueurs' end,
            null, null, 11, 2, interval '1 hour', 'direct', p_taille, coalesce(p_mise, 0)) returning * into t;
  end if;
  return t;
end $$;
revoke all on function public._salle(int, int) from public, anon, authenticated;
