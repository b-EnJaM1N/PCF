-- HandSlam — Étape 83 : le dossier de l'adversaire, seulement contre de vrais joueurs.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Peut être relancé sans risque. Nécessite les étapes 2 à 82.
--
-- 20 novembre (demande du porteur du projet) : le dossier (ses 50 derniers matchs en ligne) ne compte plus les matchs contre
-- les bots des tournois en ligne (Rocky 🤖…) ; le dossier d'un bot en ligne, lui, compte toujours ses matchs. Le fantôme
-- d'un joueur (fantome.js), tiré du même dossier, joue donc lui aussi comme contre de vrais joueurs.
-- (remplace la version de l'étape 82)

create or replace function public.dossier_joueur(p_joueur uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  return coalesce((
    select jsonb_agg(x.coups order by x.maj_le desc)
    from (
      select d.maj_le, (
        select jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
                 'b', case when d.j0 = p_joueur then e->'a' else e->'b' end,
                 'a', case when d.j0 = p_joueur then e->'b' else e->'a' end,
                 's', case when coalesce((e->'smash'->>(case when d.j0 = p_joueur then 0 else 1 end))::boolean, false) then true end,
                 'p', case when i = 1 then d.points_par_set end,
                 'n', case when i = 1 then d.sets_gagnants end))
               || jsonb_build_object('g', case when e->>'g' is null then null
                           when (e->>'g')::int = (case when d.j0 = p_joueur then 0 else 1 end) then 1 else 0 end)
               order by i)
        from jsonb_array_elements(d.coups) with ordinality as t(e, i)) as coups
      from duels d
      where (d.j0 = p_joueur or d.j1 = p_joueur) and d.phase = 'termine' and jsonb_array_length(d.coups) > 0
        -- (étape 83) seulement contre de vrais joueurs, sauf pour le dossier d'un bot en ligne
        and (_est_bot(p_joueur) or not exists (select 1 from bots_en_ligne b where b.joueur in (d.j0, d.j1)))
      order by d.maj_le desc
      limit 50
    ) x), '[]'::jsonb);
end $$;

revoke all on function public.dossier_joueur(uuid) from public, anon;
grant execute on function public.dossier_joueur(uuid) to authenticated;
