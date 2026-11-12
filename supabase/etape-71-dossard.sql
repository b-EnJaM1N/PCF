-- HandSlam — Étape 71 : le Dossard 1, le gant jaune du tenant du titre d'un cercle.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Peut être relancé sans risque.
-- Nécessite les étapes 2 à 70.
--
-- Décisions du porteur du projet (12 novembre) : le tenant du titre d'un cercle est le vainqueur du dernier tournoi terminé dans
-- ce cercle (coupe ou championnat), avec au moins 3 vrais joueurs (les bots ne comptent pas). Il porte le Dossard 1 (un gant
-- jaune, dossard « 1 », coutures et liseré d'or) tant qu'il est tenant du titre d'au moins un de ses cercles ; le titre passe au
-- vainqueur du tournoi suivant et n'expire pas tout seul. Le fil du cercle annonce les passages.
-- Rien n'est stocké : tout se déduit des tournois terminés.

-- Les tournois du cercle qui comptent pour le Dossard 1.
create or replace function public._tournois_dossard(p_cercle uuid)
returns table (id uuid, vainqueur uuid, fini_le timestamptz, nom text, mode text)
language sql stable security definer set search_path = public as $$
  select t.id, t.vainqueur, t.fini_le, t.nom, t.mode from tournois t
  where t.cercle_id = p_cercle and t.phase = 'termine' and t.vainqueur is not null and t.fini_le is not null
    and (select count(*) from inscrits_tournoi i
         where i.tournoi_id = t.id and not exists (select 1 from bots_en_ligne b where b.joueur = i.joueur)) >= 3
$$;

-- Mes titres en cours : les cercles (dont je suis membre) où je suis tenant du titre.
-- → [{ cercle: { id, nom, blason }, depuis, tournoi }]
create or replace function public.mes_dossards() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('cercle', jsonb_build_object('id', c.id, 'nom', c.nom, 'blason', c.blason),
           'depuis', d.fini_le, 'tournoi', d.nom) order by d.fini_le desc), '[]'::jsonb)
  from membres_cercle m
  join cercles c on c.id = m.cercle_id
  cross join lateral (select * from _tournois_dossard(m.cercle_id) x order by x.fini_le desc limit 1) d
  where m.joueur = auth.uid() and d.vainqueur = auth.uid()
$$;

-- Le Dossard 1 d'un cercle (pour ses membres) : le tenant du titre, et les passages des 60 derniers jours (du plus récent au
-- plus ancien ; avant : le tenant précédent, vide pour le tout premier).
-- → { tenant: carte | null, depuis, passages: [{ quand, joueur, avant, tournoi, mode }] }
create or replace function public.dossard_du_cercle(p_id uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare dernier record;
begin
  if _role(p_id) is null then raise exception 'Tu ne fais pas partie de ce cercle'; end if;
  select * into dernier from _tournois_dossard(p_id) x order by x.fini_le desc limit 1;
  return jsonb_build_object(
    'tenant', case when dernier.vainqueur is not null then _carte(dernier.vainqueur) end,
    'depuis', dernier.fini_le,
    'passages', coalesce((select jsonb_agg(jsonb_build_object('quand', p.fini_le, 'joueur', p.vainqueur, 'avant', p.avant,
        'tournoi', p.nom, 'mode', p.mode) order by p.fini_le desc)
      from (select x.*, lag(x.vainqueur) over (order by x.fini_le) as avant from _tournois_dossard(p_id) x) p
      where p.fini_le > now() - interval '60 days'), '[]'::jsonb));
end $$;

revoke all on function public._tournois_dossard(uuid) from public, anon, authenticated;
revoke all on function public.mes_dossards(), public.dossard_du_cercle(uuid) from public, anon;
grant execute on function public.mes_dossards(), public.dossard_du_cercle(uuid) to authenticated;
