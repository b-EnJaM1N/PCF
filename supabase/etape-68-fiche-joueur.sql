-- HandSlam — Étape 68 : la fiche complète d'un joueur en ligne (ses stats, ses face-à-face, son historique).
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Peut être relancé sans risque.
--
-- 11 novembre (choix du porteur du projet) : sur la fiche d'un joueur en ligne, 3 onglets, visibles par tous les joueurs connectés :
--   - 📊 ses stats, tous ses duels confondus (matchs, victoires, séries, sets, officiels, smashs) ;
--   - 🤝 ses face-à-face : ses adversaires les plus fréquents et son bilan contre chacun ;
--   - 📜 son historique : ses 20 derniers duels (adversaire, score, date).
-- Seulement les duels entre joueurs : jamais les matchs contre un bot du serveur (les matchs hors ligne ne sont pas sur le serveur).
-- Option « Cacher mon historique » (Options › Confidentialité) : ses adversaires (face-à-face et historique) ne sont plus montrés ;
-- ses stats chiffrées restent visibles.

create table if not exists public.historiques_caches (
  joueur uuid primary key references public.profils (id) on delete cascade,
  cree_le timestamptz not null default now()
);
alter table public.historiques_caches enable row level security;   -- aucune règle : on passe par les fonctions ci-dessous
revoke all on public.historiques_caches from anon, authenticated;

create or replace function public.regler_historique(p_cache boolean) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton compte'; end if;
  if coalesce(p_cache, false) then insert into historiques_caches (joueur) values (auth.uid()) on conflict do nothing;
  else delete from historiques_caches where joueur = auth.uid(); end if;
  return coalesce(p_cache, false);
end $$;
create or replace function public.mon_historique_cache() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from historiques_caches where joueur = auth.uid())
$$;

-- La fiche : { stats: { joues, v, d, sets_g, sets_p, officiels, officiels_v, serie, meilleure_serie, smashs, smashs_reussis },
--              cache, face_a_face: [{ adversaire (carte), joues, v, d, dernier }] | null,
--              historique: [{ adversaire (carte), gagne, scores, quand, officiel, tournoi, fin }] | null }
create or replace function public.fiche_joueur(p_joueur uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare st jsonb; cache boolean; r record; serie int := 0; meilleure int := 0; en_cours boolean := true; ec int := 0;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = p_joueur) then raise exception 'Joueur introuvable'; end if;
  cache := p_joueur <> auth.uid() and exists (select 1 from historiques_caches where joueur = p_joueur);

  create temp table if not exists _fiche (id uuid, adv uuid, cote int, gagne boolean, sets smallint[], scores jsonb, coups jsonb,
    quand timestamptz, classe boolean, tournoi boolean, fin text) on commit drop;
  delete from _fiche;
  insert into _fiche
  select d.id, case when d.j0 = p_joueur then d.j1 else d.j0 end, case when d.j0 = p_joueur then 0 else 1 end,
         d.vainqueur = case when d.j0 = p_joueur then 0 else 1 end, d.sets, d.scores_sets, d.coups, d.maj_le, d.classe, d.tournoi_id is not null, d.fin
  from duels d
  where d.phase = 'termine' and d.vainqueur is not null and p_joueur in (d.j0, d.j1) and d.j0 is not null and d.j1 is not null
    and not exists (select 1 from bots_en_ligne b where b.joueur in (d.j0, d.j1));

  -- Les séries : la meilleure, et celle en cours (victoires d'affilée).
  for r in select gagne from _fiche order by quand desc loop
    if en_cours then if r.gagne then ec := ec + 1; else en_cours := false; end if; end if;
  end loop;
  for r in select gagne from _fiche order by quand loop
    if r.gagne then serie := serie + 1; meilleure := greatest(meilleure, serie); else serie := 0; end if;
  end loop;

  select jsonb_build_object(
    'joues', count(*), 'v', count(*) filter (where gagne), 'd', count(*) filter (where not gagne),
    'sets_g', coalesce(sum(sets[cote + 1]), 0), 'sets_p', coalesce(sum(sets[2 - cote]), 0),
    'officiels', count(*) filter (where classe), 'officiels_v', count(*) filter (where classe and gagne),
    'serie', ec, 'meilleure_serie', meilleure,
    'smashs', coalesce(sum((select count(*) from jsonb_array_elements(coups) c where (c->'smash'->>cote)::boolean)), 0),
    'smashs_reussis', coalesce(sum((select count(*) from jsonb_array_elements(coups) c
                                    where (c->'smash'->>cote)::boolean and (c->>'g')::int = cote)), 0))
  into st from _fiche;

  return jsonb_build_object('stats', st, 'cache', cache,
    'face_a_face', case when cache then null else coalesce((select jsonb_agg(jsonb_build_object('adversaire', _carte(x.adv), 'joues', x.n, 'v', x.v,
        'd', x.n - x.v, 'dernier', x.dernier) order by x.n desc, x.dernier desc)
      from (select adv, count(*)::int n, count(*) filter (where gagne)::int v, max(quand) dernier from _fiche group by adv
            order by count(*) desc, max(quand) desc limit 10) x), '[]'::jsonb) end,
    'historique', case when cache then null else coalesce((select jsonb_agg(jsonb_build_object('adversaire', _carte(h.adv), 'gagne', h.gagne,
        'scores', (select jsonb_agg(case when h.cote = 0 then s else jsonb_build_array(s->1, s->0) end) from jsonb_array_elements(h.scores) s),
        'quand', h.quand, 'officiel', h.classe, 'tournoi', h.tournoi, 'fin', h.fin) order by h.quand desc)
      from (select * from _fiche order by quand desc limit 20) h), '[]'::jsonb) end);
end $$;

revoke all on function public.regler_historique(boolean), public.mon_historique_cache(), public.fiche_joueur(uuid) from public, anon;
grant execute on function public.regler_historique(boolean), public.mon_historique_cache(), public.fiche_joueur(uuid) to authenticated;
