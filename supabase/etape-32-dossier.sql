-- HandSlam — Étape 32 : le dossier de l'adversaire.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ».
-- Nécessite les étapes 2 à 31. Peut être relancé sans risque.
--
-- Décision du porteur du projet (8 octobre) : avant un match, chacun peut consulter les habitudes de jeu
-- de son adversaire, tirées de ses 50 derniers matchs en ligne terminés (tous les joueurs, sans option pour s'en cacher).
-- Pendant un match officiel, l'encadré « Lire l'adversaire » reste caché : le dossier d'avant-match est la seule aide.
--
-- Le serveur renvoie seulement les coups, vus du côté du joueur demandé (b = son signe, a = celui d'en face,
-- g = 1 s'il a gagné le point, 0 s'il l'a perdu, null pour une égalité) ; ni les adversaires ni les dates.
-- L'application en tire les habitudes (app/js/lecture-adversaire.js).

create or replace function public.dossier_joueur(p_joueur uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  return coalesce((
    select jsonb_agg(x.coups order by x.maj_le desc)
    from (
      select d.maj_le, (
        select jsonb_agg(jsonb_build_object(
                 'b', case when d.j0 = p_joueur then e->'a' else e->'b' end,
                 'a', case when d.j0 = p_joueur then e->'b' else e->'a' end,
                 'g', case when e->>'g' is null then null
                           when (e->>'g')::int = (case when d.j0 = p_joueur then 0 else 1 end) then 1 else 0 end)
               order by i)
        from jsonb_array_elements(d.coups) with ordinality as t(e, i)) as coups
      from duels d
      where (d.j0 = p_joueur or d.j1 = p_joueur) and d.phase = 'termine' and jsonb_array_length(d.coups) > 0
      order by d.maj_le desc
      limit 50
    ) x), '[]'::jsonb);
end $$;

revoke all on function public.dossier_joueur(uuid) from public, anon;
grant execute on function public.dossier_joueur(uuid) to authenticated;
