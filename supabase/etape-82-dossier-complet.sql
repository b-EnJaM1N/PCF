-- HandSlam — Étape 82 : le dossier de l'adversaire, plus complet (ses smashs, ses débuts de set).
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Peut être relancé sans risque. Nécessite les étapes 2 à 81.
--
-- 19 novembre (demande du porteur du projet : « l'onglet Dossier n'est pas un peu léger ? ») : le dossier montre maintenant tous
-- ses réflexes, ce qu'il fait après une égalité, ses débuts de set, ses smashs, sa forme récente et des conseils pour le battre.
-- Le serveur renvoie en plus, pour chaque coup, « s » : true quand c'est lui qui a smashé ; et sur le premier coup de chaque
-- match, « p » (points par set) et « n » (sets gagnants), pour retrouver les débuts de set dans l'application.
-- (remplace la version de l'étape 32 ; les anciennes versions de l'appli ignorent ces nouveaux champs)

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
      order by d.maj_le desc
      limit 50
    ) x), '[]'::jsonb);
end $$;

revoke all on function public.dossier_joueur(uuid) from public, anon;
grant execute on function public.dossier_joueur(uuid) to authenticated;
