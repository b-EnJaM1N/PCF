-- HandSlam — Étape 74 : les records du cercle et les records d'un tournoi.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Peut être relancé sans risque. Nécessite les étapes 2 à 73.
--
-- Idée et choix du porteur du projet (13 novembre) : sur la page d'un cercle, « 📊 Records du cercle », avec un choix « tous les
-- duels du cercle » ou « les tournois du cercle » ; sur la page d'un tournoi (pendant et après), « 📊 Records du tournoi ».
-- Les records se calculent dans l'appli (app/js/records-cercle.js) à partir de la suite des points de chaque match : le serveur
-- n'envoie que qui a gagné chaque point (et les smashs), jamais les signes joués d'un joueur, pour que personne ne puisse étudier
-- les habitudes des autres. Seuls les signes de tous ces matchs, en total, sont donnés. Jamais les matchs contre un bot.
--
-- → { duels: [{ id, j0, j1, vainqueur, fin, points_par_set, sets_gagnants, scores_sets, penalites, quand, tournoi,
--              g: [0 | 1 | null, …], smash: [[bool, bool], …] }], signes: [pierre, ciseaux, feuille] }

-- (interne) Les records d'une liste de duels terminés, sans bot ; les 400 plus récents.
create or replace function public._records_de(p_duels uuid[]) returns jsonb
language sql stable security definer set search_path = public as $$
  with choisis as (
    select d.* from duels d
    where d.id = any(p_duels) and d.phase = 'termine' and d.vainqueur is not null and d.j0 is not null and d.j1 is not null
      and not exists (select 1 from bots_en_ligne b where b.joueur in (d.j0, d.j1))
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
$$;

-- Les records du cercle (pour ses membres) : les duels entre membres (depuis la création du cercle), ou seulement ses tournois.
drop function if exists public.records_cercle(uuid, boolean, uuid);
create or replace function public.records_cercle(p_id uuid, p_tournois boolean default false) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare c public.cercles;
begin
  if _role(p_id) is null then raise exception 'Tu ne fais pas partie de ce cercle'; end if;
  select * into c from cercles where id = p_id;
  return _records_de(array(
    select d.id from duels d
    where case when p_tournois then d.tournoi_id in (select t.id from tournois t where t.cercle_id = p_id)
               else d.cree_le >= c.cree_le
                    and d.j0 in (select joueur from membres_cercle where cercle_id = p_id)
                    and d.j1 in (select joueur from membres_cercle where cercle_id = p_id) end));
end $$;

-- Les records d'un tournoi (pour ceux qui voient le tournoi), pendant et après.
create or replace function public.records_tournoi(p_tournoi uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare t public.tournois;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  select * into t from tournois where id = p_tournoi;
  -- (les mêmes règles que la page du tournoi, voir_tournoi : les tournois automatiques, sans créateur, sont visibles de tous)
  if t.id is null or not _voit_tournoi(t) then raise exception 'Tournoi introuvable'; end if;
  return _records_de(array(select d.id from duels d where d.tournoi_id = p_tournoi));
end $$;

revoke all on function public._records_de(uuid[]) from public, anon, authenticated;
revoke all on function public.records_cercle(uuid, boolean), public.records_tournoi(uuid) from public, anon;
grant execute on function public.records_cercle(uuid, boolean), public.records_tournoi(uuid) to authenticated;
