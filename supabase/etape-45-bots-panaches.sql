-- HandSlam — Étape 45 : des bots de tous les niveaux dans les salles de la version de lancement.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ».
-- Nécessite les étapes 24 et 29. Peut être relancé sans risque.
--
-- Décision du porteur du projet (20 octobre) : la version de lancement ne propose plus que les mises 0, 50 et 100.
-- Avec l'échelle de l'étape 29, les bots forts (prévus pour 500 et 1 000) ne jouaient donc plus jamais.
-- Désormais, sans mise, à 50 et à 100 (et au freeroll), les bots sont **panachés** : un débutant, un moyen, un fort,
-- un redoutable, puis on recommence, dans un ordre tiré au sort. Un heads-up tombe sur n'importe quel niveau ;
-- une salle de 8 a toujours un mélange équilibré. Les mises de 200 à 1 000 (cachées pour l'instant) gardent leur marche.
-- Le jour où les grosses mises reviennent : relancer l'étape 29 remet l'échelle d'origine pour 50 et 100.

-- Les niveaux de bots voulus pour une mise (null : panachés, de tous les niveaux). Remplace la version de l'étape 29.
create or replace function public._niveaux_bots_mise(p_mise int) returns int4range
language sql immutable as $$
  select case when coalesce(p_mise, 0) <= 100 then null
              when p_mise <= 200 then int4range(1150, 1350, '[]')
              when p_mise <= 500 then int4range(1300, 1500, '[]')
              else int4range(1450, null, '[]') end
$$;

-- Ajoute des bots dans un tournoi. Avec une marche de niveaux : ceux de la marche d'abord, puis les plus proches
-- (comme l'étape 24). Sans marche : panachés, un de chaque quart de niveau à tour de rôle, dans un ordre tiré au sort.
-- Remplace la version de l'étape 24.
create or replace function public._ajouter_bots(p_id uuid, p_nb int) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; r int4range;
begin
  if p_nb <= 0 then return; end if;
  perform _assurer_bots(0);
  select * into t from tournois where id = p_id;
  r := _niveaux_bots(t);
  insert into inscrits_tournoi (tournoi_id, joueur, vu)
  select p_id, x.joueur, now() from (
    select d.joueur, d.elo, row_number() over (partition by d.quart order by random()) as tour
    from (select b.joueur, b.elo, ntile(4) over (order by b.elo) as quart from bots_en_ligne b
          where b.actif and not exists (select 1 from inscrits_tournoi i where i.tournoi_id = p_id and i.joueur = b.joueur)) d
  ) x
  order by case when r is null or r @> x.elo then 0
                when upper(r) is not null and x.elo > upper(r) then x.elo - upper(r)
                else coalesce(lower(r), 0) - x.elo end,
           case when r is null then x.tour else 0 end,
           random()
  limit p_nb;
end $$;

revoke all on function public._niveaux_bots_mise(int), public._ajouter_bots(uuid, int) from public, anon, authenticated;
