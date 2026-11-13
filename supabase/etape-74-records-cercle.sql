-- HandSlam — Étape 74 : les records du cercle.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Peut être relancé sans risque. Nécessite les étapes 2 à 73.
--
-- Idée et choix du porteur du projet (13 novembre) : sur la page d'un cercle, « 📊 Records », avec un choix « tous les duels du
-- cercle » ou « les tournois du cercle » seulement. Les records se calculent dans l'appli (app/js/records-cercle.js) à partir de
-- la suite des points de chaque match : le serveur n'envoie que qui a gagné chaque point (et les smashs), jamais les signes
-- joués d'un membre, pour que personne ne puisse étudier les habitudes des autres. Seuls les signes de tout le cercle, en total,
-- sont donnés. Jamais les matchs contre un bot.
--
-- p_tournoi (13 novembre, demande du porteur du projet) : seulement les matchs d'un tournoi du cercle (par exemple celui en cours).
-- → { duels: [{ id, j0, j1, vainqueur, fin, points_par_set, sets_gagnants, scores_sets, penalites, quand, tournoi,
--              g: [0 | 1 | null, …], smash: [[bool, bool], …] }], signes: [pierre, ciseaux, feuille] }
drop function if exists public.records_cercle(uuid, boolean);
create or replace function public.records_cercle(p_id uuid, p_tournois boolean default false, p_tournoi uuid default null) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare c public.cercles;
begin
  if _role(p_id) is null then raise exception 'Tu ne fais pas partie de ce cercle'; end if;
  select * into c from cercles where id = p_id;
  return (
    with choisis as (
      select d.* from duels d
      where d.phase = 'termine' and d.vainqueur is not null and d.j0 is not null and d.j1 is not null
        and not exists (select 1 from bots_en_ligne b where b.joueur in (d.j0, d.j1))
        and (case when p_tournoi is not null
               then d.tournoi_id = p_tournoi and exists (select 1 from tournois t where t.id = p_tournoi and t.cercle_id = p_id)
             when p_tournois
               then d.tournoi_id in (select t.id from tournois t where t.cercle_id = p_id)
               else d.cree_le >= c.cree_le
                    and d.j0 in (select joueur from membres_cercle where cercle_id = p_id)
                    and d.j1 in (select joueur from membres_cercle where cercle_id = p_id) end)
      order by d.maj_le desc limit 400)
    select jsonb_build_object(
      'duels', coalesce((select jsonb_agg(jsonb_build_object('id', d.id, 'j0', d.j0, 'j1', d.j1, 'vainqueur', d.vainqueur, 'fin', d.fin,
          'points_par_set', d.points_par_set, 'sets_gagnants', d.sets_gagnants, 'scores_sets', d.scores_sets,
          'penalites', coalesce(d.penalites, '[]'::jsonb), 'quand', d.maj_le, 'tournoi', d.tournoi_id is not null,
          'g', coalesce((select jsonb_agg(x.v->'g' order by x.n) from jsonb_array_elements(d.coups) with ordinality x(v, n)), '[]'::jsonb),
          'smash', coalesce((select jsonb_agg(coalesce(x.v->'smash', '[false, false]'::jsonb) order by x.n)
                             from jsonb_array_elements(d.coups) with ordinality x(v, n)), '[]'::jsonb)) order by d.maj_le)
        from choisis d), '[]'::jsonb),
      'signes', (select jsonb_build_array(count(*) filter (where s = 0), count(*) filter (where s = 1), count(*) filter (where s = 2))
                 from choisis d, jsonb_array_elements(d.coups) x(v), lateral (values ((x.v->>'a')::int), ((x.v->>'b')::int)) y(s)))
  );
end $$;

revoke all on function public.records_cercle(uuid, boolean, uuid) from public, anon;
grant execute on function public.records_cercle(uuid, boolean, uuid) to authenticated;
