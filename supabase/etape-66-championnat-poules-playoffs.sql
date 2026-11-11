-- HandSlam — Étape 66 : le championnat du cercle avec poules, playoffs et playouts.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 65. Peut être relancé sans risque.
--
-- Décisions du porteur du projet (11 novembre) :
--  * une option du championnat : une seule poule (3 à 10 joueurs) ou 2, 3, 4 poules (3 à 10 joueurs chacune, aller simple),
--    composées en serpentin par niveau officiel ; à chaque nouvelle édition, l'organisateur garde les mêmes poules ou les recompose ;
--  * playoffs (obligatoires avec des poules) :
--      une poule : finale 1er-2e à 3 joueurs ; demies 1-4 / 2-3 à 4-5 joueurs ; façon Top 14 dès 6 (1er et 2e en demies,
--        barrages 3-6 et 4-5) ;
--      2 poules : les 2 premiers en demies croisées (1A-2B, 1B-2A), ou dès 5 joueurs par poule les 4 premiers en quarts croisés
--        (1A-4B, 2B-3A, 1B-4A, 2A-3B) ;
--      3 poules : les 2 premiers et les 2 meilleurs 3es en quarts (deux joueurs d'une même poule ne se croisent pas en quart) ;
--      4 poules : les 2 premiers en quarts croisés (1A-2B, 1C-2D, 1B-2A, 1D-2C) ;
--  * le format des matchs au choix à trois endroits : poules, élimination directe, finale ;
--  * calendrier : deux tiers de la durée pour les poules, un tiers pour les playoffs ; avec 3 tours ou plus d'élimination directe
--    (quarts, ou barrages façon Top 14) : 10 jours au moins, et chaque semaine devient toutes les 2 semaines ;
--  * match de playoffs non joué : celui qui a essayé de le jouer passe ; si personne : le mieux classé de la saison ;
--  * playouts seulement avec un enjeu : les derniers de chaque poule (non qualifiés) entre eux (une poule : le dernier contre
--    l'avant-dernier), en même temps que les playoffs ; le perdant s'y colle (match non joué : le meilleur bilan est sauvé) ;
--  * champion : le vainqueur de la finale ; le 1er de la saison et celui qui s'y colle sont gardés (fil du cercle).
-- Les tours : 1 = la saison (les poules) ; 2, 3, 4 = l'élimination directe (et les playouts, positions à partir de 101).

-- ---------------------------------------------------------------- les nouvelles colonnes
alter table public.tournois add column if not exists nb_poules smallint not null default 1;
alter table public.tournois add column if not exists playoffs boolean not null default false;
alter table public.tournois add column if not exists ko_points smallint;          -- format de l'élimination directe (vide : celui des poules)
alter table public.tournois add column if not exists ko_sets smallint;
alter table public.tournois add column if not exists fin_points smallint;         -- format de la finale (vide : celui de l'élimination directe)
alter table public.tournois add column if not exists fin_sets smallint;
alter table public.tournois add column if not exists garder_poules boolean not null default false;
alter table public.tournois add column if not exists fin_prevue timestamptz;      -- la fin de tout le championnat (playoffs compris)
alter table public.tournois add column if not exists tranche_ko interval;         -- le temps donné à chaque tour d'élimination directe
alter table public.tournois add column if not exists premier_saison uuid references public.profils (id) on delete set null;
alter table public.tournois add column if not exists dernier uuid references public.profils (id) on delete set null;   -- celui qui s'y colle
alter table public.tournois drop constraint if exists tournois_nb_poules_check;
alter table public.tournois add constraint tournois_nb_poules_check check (nb_poules between 1 and 4);
alter table public.tournois drop constraint if exists tournois_formats_ko_check;
alter table public.tournois add constraint tournois_formats_ko_check check (
  (ko_points is null or ko_points in (1, 3, 7, 11)) and (ko_sets is null or ko_sets in (1, 2, 3))
  and (fin_points is null or fin_points in (1, 3, 7, 11)) and (fin_sets is null or fin_sets in (1, 2, 3)));

alter table public.inscrits_tournoi add column if not exists poule smallint;        -- 0 = poule A, 1 = B…
alter table public.inscrits_tournoi add column if not exists rang_poule smallint;   -- à la fin de la saison
alter table public.inscrits_tournoi add column if not exists rang_saison smallint;  -- tous les joueurs, les 1ers de poule d'abord

alter table public.matchs_tournoi add column if not exists phase text not null default 'poule';
alter table public.matchs_tournoi drop constraint if exists matchs_tournoi_phase_check;
alter table public.matchs_tournoi add constraint matchs_tournoi_phase_check check (phase in ('poule', 'playoff', 'playout'));
alter table public.matchs_tournoi add column if not exists etape text;               -- « Finale », « Demi-finale »…
alter table public.matchs_tournoi add column if not exists points_par_set smallint;   -- (vide : le format du tournoi)
alter table public.matchs_tournoi add column if not exists sets_gagnants smallint;
alter table public.matchs_tournoi add column if not exists source0 text;              -- « G:<match> » : son vainqueur ; « P:<match> » : son perdant
alter table public.matchs_tournoi add column if not exists source1 text;

-- ---------------------------------------------------------------- le classement (des poules)
-- Une poule (p_poule : 0, 1…) ou tous les joueurs (null). Seuls les matchs de la saison (tour 1) comptent.
-- { joueur (carte), rang, points, v, d, joues, sets, points_gagnes }, du premier au dernier.
create or replace function public._classement_poule(p_id uuid, p_poule int) returns jsonb
language sql stable security definer set search_path = public as $$
  with joueurs as (select joueur, inscrit_le from inscrits_tournoi where tournoi_id = p_id and (p_poule is null or poule = p_poule)),
  lignes as (
    select j.joueur, m.vainqueur, case when m.j0 = j.joueur then m.j1 else m.j0 end as adv,
           case when d.j0 = j.joueur then 0 else 1 end as cote, d.sets, d.scores_sets
    from joueurs j join matchs_tournoi m on m.tournoi_id = p_id and m.tour = 1 and j.joueur in (m.j0, m.j1) and m.fin is not null
    left join duels d on d.id = m.duel_id and d.phase = 'termine'),
  stats as (
    select j.joueur, j.inscrit_le,
      count(l.joueur) filter (where l.vainqueur = j.joueur)::int as v,
      count(l.joueur) filter (where l.vainqueur is distinct from j.joueur)::int as d,
      coalesce(sum(l.sets[l.cote + 1]), 0)::int as sets_g,
      coalesce(sum((select sum((x->>l.cote)::int) from jsonb_array_elements(l.scores_sets) x)), 0)::int as pts_g
    from joueurs j left join lignes l on l.joueur = j.joueur group by j.joueur, j.inscrit_le),
  directes as (
    select l.joueur, count(*)::int as n from lignes l join stats s on s.joueur = l.joueur join stats a on a.joueur = l.adv
    where l.vainqueur = l.joueur and a.v = s.v group by l.joueur),
  rangs as (
    select s.*, coalesce(dr.n, 0) as dir,
      row_number() over (order by s.v desc, coalesce(dr.n, 0) desc, s.sets_g desc, s.pts_g desc, s.inscrit_le, s.joueur) as rang
    from stats s left join directes dr on dr.joueur = s.joueur)
  select coalesce(jsonb_agg(jsonb_build_object('joueur', _carte(r.joueur), 'rang', r.rang, 'points', 2 * r.v, 'v', r.v, 'd', r.d,
    'joues', r.v + r.d, 'sets', r.sets_g, 'points_gagnes', r.pts_g) order by r.rang), '[]'::jsonb)
  from rangs r
$$;
-- Remplace la version de l'étape 35 : seuls les matchs de la saison comptent (pas ceux des playoffs).
create or replace function public._classement_championnat(p_id uuid) returns jsonb
language sql stable security definer set search_path = public as $$ select _classement_poule(p_id, null) $$;

-- ---------------------------------------------------------------- la forme du tableau final
-- Le nombre de tours d'élimination directe (0 sans playoffs).
create or replace function public._tours_ko(p_poules int, p_min int, p_n int) returns int
language sql immutable as $$
  select case when p_poules = 1 then case when p_n <= 3 then 1 when p_n <= 5 then 2 else 3 end
              when p_poules = 2 then case when p_min >= 5 then 3 else 2 end
              else 3 end
$$;
-- Le joueur classé p_rang dans la poule p_poule (à la fin de la saison).
create or replace function public._qui(p_id uuid, p_poule int, p_rang int) returns uuid
language sql stable security definer set search_path = public as $$
  select joueur from inscrits_tournoi where tournoi_id = p_id and poule = p_poule and rang_poule = p_rang
$$;
create or replace function public._rang_saison(p_id uuid, p_joueur uuid) returns int
language sql stable security definer set search_path = public as $$
  select coalesce(rang_saison, 999) from inscrits_tournoi where tournoi_id = p_id and joueur = p_joueur
$$;
-- Un match de l'élimination directe ; le mieux classé de la saison en j0 (il passe si personne ne joue).
create or replace function public._match_ko(p_id uuid, p_tour int, p_pos int, p_phase text, p_etape text, p_j0 uuid, p_j1 uuid,
  p_src0 text, p_src1 text, p_points int, p_sets int) returns uuid
language plpgsql security definer set search_path = public as $$
declare r uuid;
begin
  if p_j0 is not null and p_j1 is not null and _rang_saison(p_id, p_j1) < _rang_saison(p_id, p_j0) then
    insert into matchs_tournoi (tournoi_id, tour, position, phase, etape, j0, j1, source0, source1, points_par_set, sets_gagnants)
    values (p_id, p_tour, p_pos, p_phase, p_etape, p_j1, p_j0, p_src1, p_src0, p_points, p_sets) returning id into r;
  else
    insert into matchs_tournoi (tournoi_id, tour, position, phase, etape, j0, j1, source0, source1, points_par_set, sets_gagnants)
    values (p_id, p_tour, p_pos, p_phase, p_etape, p_j0, p_j1, p_src0, p_src1, p_points, p_sets) returning id into r;
  end if;
  return r;
end $$;

-- À la fin de la saison : les rangs, le 1er de la saison, le tableau des playoffs et celui des playouts.
create or replace function public._construire_playoffs(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; nbp int; k int; cl jsonb; e jsonb; n int; mini int; tours int;
  kp int; ks int; fp int; fs int; s uuid[]; qual uuid[] := '{}'; q1 uuid; q2 uuid; q3 uuid; q4 uuid;
  L uuid[]; x1 uuid; x2 uuid; perm int[];
begin
  select * into t from tournois where id = p_id for update;
  nbp := coalesce((select max(poule) + 1 from inscrits_tournoi where tournoi_id = p_id), 1);
  -- Les rangs dans chaque poule, puis le rang de la saison (les 1ers de poule d'abord, départagés par leur bilan).
  for k in 0 .. nbp - 1 loop
    cl := _classement_poule(p_id, k);
    for e in select * from jsonb_array_elements(cl) loop
      update inscrits_tournoi set rang_poule = (e->>'rang')::int where tournoi_id = p_id and joueur = (e->'joueur'->>'id')::uuid;
    end loop;
  end loop;
  cl := _classement_poule(p_id, null);
  update inscrits_tournoi i set rang_saison = x.r from (
    select (c->'joueur'->>'id')::uuid as joueur, row_number() over (order by i2.rang_poule, (c->>'v')::int desc, (c->>'sets')::int desc,
           (c->>'points_gagnes')::int desc, (c->>'rang')::int) as r
    from jsonb_array_elements(cl) c join inscrits_tournoi i2 on i2.tournoi_id = p_id and i2.joueur = (c->'joueur'->>'id')::uuid) x
  where i.tournoi_id = p_id and i.joueur = x.joueur;
  update tournois set premier_saison = (select joueur from inscrits_tournoi where tournoi_id = p_id and rang_saison = 1) where id = p_id;

  n := (select count(*) from inscrits_tournoi where tournoi_id = p_id);
  mini := (select min(c) from (select count(*) c from inscrits_tournoi where tournoi_id = p_id group by poule) z);
  tours := _tours_ko(nbp, mini, n);
  kp := coalesce(t.ko_points, t.points_par_set); ks := coalesce(t.ko_sets, t.sets_gagnants);
  fp := coalesce(t.fin_points, kp); fs := coalesce(t.fin_sets, ks);
  s := array(select joueur from inscrits_tournoi where tournoi_id = p_id order by rang_saison);

  -- Le tableau des playoffs (tours 2 à 1 + tours).
  if nbp = 1 and n <= 3 then
    perform _match_ko(p_id, 2, 1, 'playoff', 'Finale', s[1], s[2], null, null, fp, fs);
    qual := s[1:2];
  elsif nbp = 1 and n <= 5 then
    q1 := _match_ko(p_id, 2, 1, 'playoff', 'Demi-finale', s[1], s[4], null, null, kp, ks);
    q2 := _match_ko(p_id, 2, 2, 'playoff', 'Demi-finale', s[2], s[3], null, null, kp, ks);
    perform _match_ko(p_id, 3, 1, 'playoff', 'Finale', null, null, 'G:' || q1, 'G:' || q2, fp, fs);
    qual := s[1:4];
  elsif nbp = 1 then   -- façon Top 14
    q1 := _match_ko(p_id, 2, 1, 'playoff', 'Barrage', s[3], s[6], null, null, kp, ks);
    q2 := _match_ko(p_id, 2, 2, 'playoff', 'Barrage', s[4], s[5], null, null, kp, ks);
    q3 := _match_ko(p_id, 3, 1, 'playoff', 'Demi-finale', s[1], null, null, 'G:' || q2, kp, ks);
    q4 := _match_ko(p_id, 3, 2, 'playoff', 'Demi-finale', s[2], null, null, 'G:' || q1, kp, ks);
    perform _match_ko(p_id, 4, 1, 'playoff', 'Finale', null, null, 'G:' || q3, 'G:' || q4, fp, fs);
    qual := s[1:6];
  elsif nbp = 2 and mini < 5 then
    q1 := _match_ko(p_id, 2, 1, 'playoff', 'Demi-finale', _qui(p_id, 0, 1), _qui(p_id, 1, 2), null, null, kp, ks);
    q2 := _match_ko(p_id, 2, 2, 'playoff', 'Demi-finale', _qui(p_id, 1, 1), _qui(p_id, 0, 2), null, null, kp, ks);
    perform _match_ko(p_id, 3, 1, 'playoff', 'Finale', null, null, 'G:' || q1, 'G:' || q2, fp, fs);
    qual := array[_qui(p_id, 0, 1), _qui(p_id, 0, 2), _qui(p_id, 1, 1), _qui(p_id, 1, 2)];
  else
    if nbp = 2 then
      q1 := _match_ko(p_id, 2, 1, 'playoff', 'Quart de finale', _qui(p_id, 0, 1), _qui(p_id, 1, 4), null, null, kp, ks);
      q2 := _match_ko(p_id, 2, 2, 'playoff', 'Quart de finale', _qui(p_id, 1, 2), _qui(p_id, 0, 3), null, null, kp, ks);
      q3 := _match_ko(p_id, 2, 3, 'playoff', 'Quart de finale', _qui(p_id, 1, 1), _qui(p_id, 0, 4), null, null, kp, ks);
      q4 := _match_ko(p_id, 2, 4, 'playoff', 'Quart de finale', _qui(p_id, 0, 2), _qui(p_id, 1, 3), null, null, kp, ks);
      qual := array(select joueur from inscrits_tournoi where tournoi_id = p_id and rang_poule <= 4);
    elsif nbp = 4 then
      q1 := _match_ko(p_id, 2, 1, 'playoff', 'Quart de finale', _qui(p_id, 0, 1), _qui(p_id, 1, 2), null, null, kp, ks);
      q2 := _match_ko(p_id, 2, 2, 'playoff', 'Quart de finale', _qui(p_id, 2, 1), _qui(p_id, 3, 2), null, null, kp, ks);
      q3 := _match_ko(p_id, 2, 3, 'playoff', 'Quart de finale', _qui(p_id, 1, 1), _qui(p_id, 0, 2), null, null, kp, ks);
      q4 := _match_ko(p_id, 2, 4, 'playoff', 'Quart de finale', _qui(p_id, 3, 1), _qui(p_id, 2, 2), null, null, kp, ks);
      qual := array(select joueur from inscrits_tournoi where tournoi_id = p_id and rang_poule <= 2);
    else   -- 3 poules : les 8 premiers de la saison (3 premiers de poule, 3 deuxièmes, les 2 meilleurs 3es)
      -- Les adversaires des 4 meilleurs : le plus proche de 8-5-7-6 sans deux joueurs d'une même poule.
      select array[a, b, c, d] into perm
      from unnest(array[5, 6, 7, 8]) a, unnest(array[5, 6, 7, 8]) b, unnest(array[5, 6, 7, 8]) c, unnest(array[5, 6, 7, 8]) d
      where a <> b and a <> c and a <> d and b <> c and b <> d and c <> d
      order by (select count(*) from (values (1, a), (4, b), (2, c), (3, d)) v (x, y)
                where (select poule from inscrits_tournoi where tournoi_id = p_id and joueur = s[v.x])
                    = (select poule from inscrits_tournoi where tournoi_id = p_id and joueur = s[v.y])),
               abs(a - 8) + abs(b - 5) + abs(c - 7) + abs(d - 6)
      limit 1;
      q1 := _match_ko(p_id, 2, 1, 'playoff', 'Quart de finale', s[1], s[perm[1]], null, null, kp, ks);
      q2 := _match_ko(p_id, 2, 2, 'playoff', 'Quart de finale', s[4], s[perm[2]], null, null, kp, ks);
      q3 := _match_ko(p_id, 2, 3, 'playoff', 'Quart de finale', s[2], s[perm[3]], null, null, kp, ks);
      q4 := _match_ko(p_id, 2, 4, 'playoff', 'Quart de finale', s[3], s[perm[4]], null, null, kp, ks);
      qual := s[1:8];
    end if;
    q1 := _match_ko(p_id, 3, 1, 'playoff', 'Demi-finale', null, null, 'G:' || q1, 'G:' || q2, kp, ks);
    q2 := _match_ko(p_id, 3, 2, 'playoff', 'Demi-finale', null, null, 'G:' || q3, 'G:' || q4, kp, ks);
    perform _match_ko(p_id, 4, 1, 'playoff', 'Finale', null, null, 'G:' || q1, 'G:' || q2, fp, fs);
  end if;

  -- Les playouts (seulement avec un enjeu) : le dernier de chaque poule, s'il n'est pas qualifié (une poule : les deux derniers).
  if t.enjeu is not null then
    if nbp = 1 then
      L := array(select joueur from inscrits_tournoi where tournoi_id = p_id and not (joueur = any (qual)) order by rang_saison desc limit 2);
    else
      L := array(select i.joueur from inscrits_tournoi i where i.tournoi_id = p_id and not (i.joueur = any (qual))
                   and i.rang_poule = (select max(rang_poule) from inscrits_tournoi where tournoi_id = p_id and poule = i.poule));
    end if;
    L := array(select x from unnest(L) x order by _rang_saison(p_id, x));   -- le meilleur bilan d'abord
    if coalesce(array_length(L, 1), 0) = 0 then
      update tournois set dernier = s[n] where id = p_id;
    elsif array_length(L, 1) = 1 then
      update tournois set dernier = L[1] where id = p_id;
    elsif array_length(L, 1) = 2 then
      perform _match_ko(p_id, 2, 101, 'playout', 'Match des derniers', L[1], L[2], null, null, kp, ks);
    elsif array_length(L, 1) = 3 then
      x1 := _match_ko(p_id, 2, 101, 'playout', 'Playout', L[2], L[3], null, null, kp, ks);
      perform _match_ko(p_id, 3, 101, 'playout', 'Match des derniers', L[1], null, null, 'nbp:' || x1, kp, ks);
    else
      x1 := _match_ko(p_id, 2, 101, 'playout', 'Playout', L[1], L[4], null, null, kp, ks);
      x2 := _match_ko(p_id, 2, 102, 'playout', 'Playout', L[2], L[3], null, null, kp, ks);
      perform _match_ko(p_id, 3, 101, 'playout', 'Match des derniers', null, null, 'nbp:' || x1, 'nbp:' || x2, kp, ks);
    end if;
  end if;
  update tournois set nb_tours = (select max(tour) from matchs_tournoi where tournoi_id = p_id) where id = p_id;
end $$;

-- Remplir les places qui attendaient un vainqueur (« G: ») ou un perdant (« P: ») ; le mieux classé de la saison en j0.
create or replace function public._remplir_tableau(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare m public.matchs_tournoi; s public.matchs_tournoi; j uuid; a uuid; b uuid;
begin
  for m in select * from matchs_tournoi where tournoi_id = p_id and fin is null and (source0 is not null or source1 is not null) for update loop
    a := m.j0; b := m.j1;
    if a is null and m.source0 is not null then
      select * into s from matchs_tournoi where id = substr(m.source0, 3)::uuid;
      if s.fin is not null then a := case when left(m.source0, 1) = 'G' then s.vainqueur else case when s.vainqueur = s.j0 then s.j1 else s.j0 end end; end if;
    end if;
    if b is null and m.source1 is not null then
      select * into s from matchs_tournoi where id = substr(m.source1, 3)::uuid;
      if s.fin is not null then b := case when left(m.source1, 1) = 'G' then s.vainqueur else case when s.vainqueur = s.j0 then s.j1 else s.j0 end end; end if;
    end if;
    if a is distinct from m.j0 or b is distinct from m.j1 then
      if a is not null and b is not null and _rang_saison(p_id, b) < _rang_saison(p_id, a) then j := a; a := b; b := j; end if;
      update matchs_tournoi set j0 = a, j1 = b,
        source0 = case when a is not null then null else source0 end, source1 = case when b is not null then null else source1 end
      where id = m.id;
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------- faire avancer le championnat
-- Remplace la version de l'étape 51.
create or replace function public._avancer_championnat(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; m public.matchs_tournoi; d public.duels; premier jsonb; finale public.matchs_tournoi; po public.matchs_tournoi;
begin
  select * into t from tournois where id = p_id for update;
  if t.id is null or t.phase <> 'en_cours' then return; end if;
  loop
    perform _remplir_tableau(p_id);
    -- Un joueur a supprimé son compte : son adversaire gagne le match (seulement les matchs du tour en cours, déjà remplis).
    update matchs_tournoi set vainqueur = coalesce(j0, j1), fin = case when coalesce(j0, j1) is null then 'double_forfait' else 'exempt' end
    where tournoi_id = p_id and tour = t.tour and fin is null and (j0 is null or j1 is null) and source0 is null and source1 is null;

    -- Fin du temps du tour : les matchs pas joués (et pas en cours) sont décidés.
    if now() > t.echeance then
      for m in select * from matchs_tournoi where tournoi_id = p_id and tour = t.tour and fin is null for update loop
        select * into d from duels where id = m.duel_id;
        continue when d.id is not null and d.phase in ('presentation', 'jeu', 'entre_sets');   -- on le laisse finir
        if d.id is not null and d.phase = 'attente' then
          perform set_config('pcf.interne', '1', true);
          update duels set phase = 'annule', maj_le = now() where id = d.id;
          perform set_config('pcf.interne', '', true);
        end if;
        if (m.essai0 is not null) <> (m.essai1 is not null) then
          update matchs_tournoi set vainqueur = case when m.essai0 is not null then m.j0 else m.j1 end, fin = 'forfait' where id = m.id;
        elsif m.tour > 1 then   -- élimination directe : le mieux classé de la saison passe (playouts : le meilleur bilan est sauvé)
          update matchs_tournoi set vainqueur = m.j0, fin = 'tete_de_serie' where id = m.id;
        else   -- saison : personne n'est venu (ou les deux sans jamais se croiser) : perdu pour les deux
          update matchs_tournoi set vainqueur = null, fin = 'double_forfait' where id = m.id;
        end if;
      end loop;
    end if;

    exit when exists (select 1 from matchs_tournoi where tournoi_id = p_id and tour = t.tour and fin is null);

    -- Le tour est fini.
    if t.tour = 1 and t.playoffs then
      perform _construire_playoffs(p_id);
    end if;
    if exists (select 1 from matchs_tournoi where tournoi_id = p_id and tour > t.tour) then
      update tournois set tour = tour + 1, echeance = now() + coalesce(tranche_ko, interval '1 day') where id = p_id returning * into t;
      continue;
    end if;

    -- Tous les matchs sont décidés : le championnat est fini.
    if t.playoffs then
      select * into finale from matchs_tournoi where tournoi_id = p_id and phase = 'playoff' order by tour desc, position limit 1;
      select * into po from matchs_tournoi where tournoi_id = p_id and phase = 'playout' order by tour desc, position limit 1;
      update tournois set phase = 'termine', echeance = null, fini_le = now(), vainqueur = finale.vainqueur,
        dernier = case when po.id is not null then case when po.vainqueur = po.j0 then po.j1 else po.j0 end else dernier end
      where id = p_id;
    else
      premier := _classement_championnat(p_id)->0;
      update tournois set phase = 'termine', echeance = null, fini_le = now(),
        vainqueur = case when (premier->>'v')::int > 0 then (premier->'joueur'->>'id')::uuid end,
        premier_saison = case when (premier->>'v')::int > 0 then (premier->'joueur'->>'id')::uuid end,
        dernier = case when t.enjeu is not null then ((_classement_championnat(p_id)->-1)->'joueur'->>'id')::uuid end
      where id = p_id;
    end if;
    -- Chaque semaine : l'édition suivante, sauf si personne n'a joué un seul match (la série s'arrête).
    if t.hebdo then
      if exists (select 1 from matchs_tournoi where tournoi_id = p_id and fin in ('score', 'abandon')) then perform _edition_suivante(p_id);
      else update tournois set hebdo = false where id = p_id; end if;
    end if;
    exit;
  end loop;
end $$;

-- ---------------------------------------------------------------- le lancement
-- Les poules en serpentin par niveau officiel (sauf si on garde celles de l'édition d'avant) ; une poule a au moins 3 joueurs.
create or replace function public._composer_poules(p_id uuid, p_poules int) returns int
language plpgsql security definer set search_path = public as $$
declare n int := (select count(*) from inscrits_tournoi where tournoi_id = p_id); nbp int; j record; i int := 0; k int;
begin
  nbp := greatest(1, least(p_poules, n / 3));
  if nbp = 1 then update inscrits_tournoi set poule = 0 where tournoi_id = p_id; return 1; end if;
  -- Les poules gardées : seuls les nouveaux venus sont placés (dans la poule la moins remplie).
  if (select garder_poules from tournois where id = p_id) and exists (select 1 from inscrits_tournoi where tournoi_id = p_id and poule is not null)
     and (select count(distinct poule) from inscrits_tournoi where tournoi_id = p_id and poule is not null) = nbp then
    for j in select joueur from inscrits_tournoi where tournoi_id = p_id and poule is null order by inscrit_le loop
      update inscrits_tournoi set poule = (select x.num from generate_series(0, nbp - 1) x (num)
        order by (select count(*) from inscrits_tournoi where tournoi_id = p_id and poule = x.num), x.num limit 1)
      where tournoi_id = p_id and joueur = j.joueur;
    end loop;
    if (select min(c) from (select count(*) c from inscrits_tournoi where tournoi_id = p_id group by poule) z) >= 3 then return nbp; end if;
  end if;
  for j in select i2.joueur from inscrits_tournoi i2 left join classements c on c.joueur = i2.joueur
           where i2.tournoi_id = p_id order by coalesce(c.points, 1200) desc, i2.inscrit_le, i2.joueur loop
    k := case when (i / nbp) % 2 = 0 then i % nbp else nbp - 1 - i % nbp end;
    update inscrits_tournoi set poule = k where tournoi_id = p_id and joueur = j.joueur;
    i := i + 1;
  end loop;
  return nbp;
end $$;

-- Remplace la version de l'étape 51 : les poules (chacun contre tous dans sa poule) et le calendrier avec les playoffs.
create or replace function public._lancer_championnat(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; n int; nbp int; mini int; tours int; v_fin timestamptz; js uuid[]; i int; k int; q int; pos int := 0;
begin
  select * into t from tournois where id = p_id for update;
  n := (select count(*) from inscrits_tournoi where tournoi_id = p_id);
  if n < 3 then raise exception 'Il faut au moins 3 joueurs pour lancer le championnat'; end if;
  nbp := _composer_poules(p_id, t.nb_poules);
  for q in 0 .. nbp - 1 loop
    js := array(select joueur from inscrits_tournoi where tournoi_id = p_id and poule = q order by inscrit_le, joueur);
    for i in 1 .. coalesce(array_length(js, 1), 0) - 1 loop
      for k in i + 1 .. array_length(js, 1) loop
        pos := pos + 1; insert into matchs_tournoi (tournoi_id, tour, position, j0, j1) values (p_id, 1, pos, js[i], js[k]);
        if t.aller_retour and nbp = 1 then   -- (avec des poules : aller simple)
          pos := pos + 1; insert into matchs_tournoi (tournoi_id, tour, position, j0, j1) values (p_id, 1, pos, js[k], js[i]);
        end if;
      end loop;
    end loop;
  end loop;
  mini := (select min(c) from (select count(*) c from inscrits_tournoi where tournoi_id = p_id group by poule) z);
  tours := case when t.playoffs or nbp > 1 then _tours_ko(nbp, mini, n) else 0 end;
  -- La fin de tout le championnat : 10 jours au moins avec 3 tours d'élimination directe ; chaque semaine → toutes les 2 semaines.
  v_fin := case when t.serie is not null then _fin_semaine(now()) + case when tours >= 3 then interval '7 days' else interval '0' end
              else now() + greatest(t.duree_tour, case when tours >= 3 then interval '10 days' else interval '0' end) end;
  update tournois set phase = 'en_cours', tour = 1, nb_tours = 1 + tours, lance_le = now(), nb_poules = nbp, playoffs = (tours > 0),
    fin_prevue = v_fin, echeance = case when tours > 0 then now() + (v_fin - now()) * 2 / 3 else v_fin end,
    tranche_ko = case when tours > 0 then (v_fin - now()) / 3 / tours end
  where id = p_id;
end $$;

-- ---------------------------------------------------------------- jouer un match (le format du match, s'il en a un)
-- Remplace la version de l'étape 5.
create or replace function public.jouer_match_tournoi(p_match uuid) returns public.duels
language plpgsql security definer set search_path = public as $$
declare m public.matchs_tournoi; t public.tournois; d public.duels; moi smallint; adv uuid; v_pts int; v_sets int;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  select tournoi_id into t.id from matchs_tournoi where id = p_match;
  if t.id is null then raise exception 'Match introuvable'; end if;
  perform _avancer_tournoi(t.id);
  select * into t from tournois where id = t.id for update;
  select * into m from matchs_tournoi where id = p_match for update;
  if auth.uid() = m.j0 then moi := 0; adv := m.j1; elsif auth.uid() = m.j1 then moi := 1; adv := m.j0;
  else raise exception 'Ce match ne te concerne pas'; end if;
  if t.phase <> 'en_cours' or m.tour <> t.tour or m.fin is not null then raise exception 'Ce match n''est plus à jouer'; end if;
  if moi = 0 then update matchs_tournoi set essai0 = coalesce(essai0, now()) where id = p_match;
  else update matchs_tournoi set essai1 = coalesce(essai1, now()) where id = p_match; end if;

  select * into d from duels where id = m.duel_id for update;
  if d.id is not null and d.phase in ('presentation', 'jeu', 'entre_sets') then return d; end if;
  if d.id is not null and d.phase = 'attente' then
    if d.j1 = auth.uid() then   -- l'adversaire m'attend : on y va
      update duels set phase = 'presentation', echeance = now() + interval '45 seconds', maj_le = now() where id = d.id returning * into d;
    end if;
    return d;
  end if;
  v_pts := coalesce(m.points_par_set, t.points_par_set); v_sets := coalesce(m.sets_gagnants, t.sets_gagnants);
  insert into duels (j0, j1, points_par_set, sets_gagnants, classe, tournoi_id, tournoi_match)
  values (auth.uid(), adv, v_pts, v_sets, v_pts >= 7 and v_sets > 1, t.id, p_match)
  returning * into d;
  update matchs_tournoi set duel_id = d.id where id = p_match;
  return d;
end $$;

-- ---------------------------------------------------------------- les réglages
-- Remplace la version de l'étape 35 : 10 joueurs par poule.
create or replace function public._inscrire(t public.tournois) returns void
language plpgsql security definer set search_path = public as $$
begin
  if t.phase <> 'inscriptions' then raise exception 'Les inscriptions à ce tournoi sont closes'; end if;
  if t.cercle_id is not null and _role(t.cercle_id) is null then raise exception 'Ce tournoi est réservé aux membres du cercle'; end if;
  if t.mode = 'championnat' and (select count(*) from inscrits_tournoi where tournoi_id = t.id) >= _max_championnat() * t.nb_poules then
    raise exception 'Ce championnat est complet (% joueurs)', _max_championnat() * t.nb_poules;
  end if;
  if (select count(*) from inscrits_tournoi where tournoi_id = t.id) >= greatest(32, _max_championnat() * t.nb_poules) then
    raise exception 'Ce tournoi est complet';
  end if;
  insert into inscrits_tournoi (tournoi_id, joueur) values (t.id, auth.uid()) on conflict do nothing;
end $$;

-- Remplace la version de l'étape 51. p_options : { poules (1 à 4), playoffs, ko_points, ko_sets, fin_points, fin_sets, garder_poules }.
drop function if exists public.creer_championnat(text, uuid, int, int, int, boolean, text, boolean);
create or replace function public.creer_championnat(p_nom text, p_cercle uuid, p_points int, p_sets int, p_jours int,
  p_aller_retour boolean default false, p_enjeu text default null, p_hebdo boolean default false, p_options jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.tournois; e text; o jsonb := coalesce(p_options, '{}'::jsonb); np int; po boolean;
  kp int; ks int; fp int; fs int;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton compte'; end if;
  if p_cercle is null or _role(p_cercle) is null then raise exception 'Un championnat se joue dans un cercle dont tu fais partie'; end if;
  if p_nom is null or char_length(btrim(p_nom)) not between 2 and 40 then raise exception 'Le nom du championnat doit faire entre 2 et 40 caractères'; end if;
  if p_jours is null or p_jours not in (3, 7, 14) then raise exception 'Durée de championnat invalide'; end if;
  if nullif(btrim(coalesce(p_enjeu, '')), '') is not null then e := _enjeu_propre(p_enjeu); end if;
  if (select count(*) from tournois where createur = auth.uid() and phase in ('inscriptions', 'en_cours')) >= _limite_tournois() then
    raise exception 'Tu as déjà % tournois en cours : termine-les ou annule-en un', _limite_tournois();
  end if;
  np := coalesce((o->>'poules')::int, 1);
  if np not between 1 and 4 then raise exception 'De 1 à 4 poules'; end if;
  po := np > 1 or coalesce((o->>'playoffs')::boolean, false);   -- avec des poules, les playoffs sont obligatoires
  kp := (o->>'ko_points')::int; ks := (o->>'ko_sets')::int; fp := (o->>'fin_points')::int; fs := (o->>'fin_sets')::int;
  if (kp is not null and kp not in (1, 3, 7, 11)) or (fp is not null and fp not in (1, 3, 7, 11))
     or (ks is not null and ks not in (1, 2, 3)) or (fs is not null and fs not in (1, 2, 3)) then raise exception 'Format de match invalide'; end if;
  if coalesce(p_hebdo, false) then p_jours := 7; end if;   -- chaque semaine : du lundi midi au dimanche soir
  insert into tournois (nom, cercle_id, createur, points_par_set, sets_gagnants, duree_tour, mode, aller_retour, enjeu, hebdo, edition, depart,
                        nb_poules, playoffs, ko_points, ko_sets, fin_points, fin_sets, garder_poules)
  values (btrim(p_nom), p_cercle, auth.uid(), p_points, p_sets, make_interval(days => p_jours), 'championnat', coalesce(p_aller_retour, false) and np = 1, e,
          coalesce(p_hebdo, false), 1, case when p_hebdo then _prochain_lundi_midi(now()) end,
          np, po, case when po then kp end, case when po then ks end, case when po then fp end, case when po then fs end,
          coalesce((o->>'garder_poules')::boolean, false))
  returning * into t;
  if t.hebdo then update tournois set serie = t.id where id = t.id; end if;
  insert into inscrits_tournoi (tournoi_id, joueur) values (t.id, auth.uid());
  return jsonb_build_object('id', t.id, 'code', t.code);
end $$;

-- Remplace la version de l'étape 51 : l'édition suivante garde aussi les poules et les playoffs (et les poules, si on les garde).
create or replace function public._edition_suivante(p_id uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare t public.tournois; n public.tournois;
begin
  select * into t from tournois where id = p_id;
  if exists (select 1 from tournois where serie = t.serie and edition > t.edition) then return null; end if;   -- déjà créée
  insert into tournois (nom, cercle_id, createur, points_par_set, sets_gagnants, duree_tour, mode, aller_retour, enjeu, hebdo, serie, edition, depart,
                        nb_poules, playoffs, ko_points, ko_sets, fin_points, fin_sets, garder_poules)
  values (t.nom, t.cercle_id, t.createur, t.points_par_set, t.sets_gagnants, t.duree_tour, 'championnat', t.aller_retour, t.enjeu,
          true, t.serie, t.edition + 1, _prochain_lundi_midi(now()),
          t.nb_poules, t.playoffs, t.ko_points, t.ko_sets, t.fin_points, t.fin_sets, t.garder_poules)
  returning * into n;
  insert into inscrits_tournoi (tournoi_id, joueur, poule)
  select n.id, i.joueur, case when t.garder_poules then i.poule end from inscrits_tournoi i
  where i.tournoi_id = p_id and exists (select 1 from membres_cercle m where m.cercle_id = t.cercle_id and m.joueur = i.joueur)
  order by i.inscrit_le;
  return n.id;
end $$;

-- Le palmarès d'une série : avec celui qui s'y colle. Remplace la version de l'étape 51.
create or replace function public._palmares_serie(p_serie uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'edition', x.edition, 'fini_le', x.fini_le,
    'vainqueur', case when x.vainqueur is not null then _carte(x.vainqueur) end,
    'dernier', case when x.dernier is not null then _carte(x.dernier)
                    when x.vainqueur is not null then (_classement_championnat(x.id)->-1)->'joueur' end) order by x.edition desc), '[]'::jsonb)
  from (select * from tournois where serie = p_serie and phase = 'termine' order by edition desc limit 10) x
$$;

-- ---------------------------------------------------------------- ce que voit l'appli
-- Remplace la version de l'étape 51 : avec les poules, les playoffs, les formats, le 1er de la saison et celui qui s'y colle.
create or replace function public._resume_tournoi(t public.tournois) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', t.id, 'mode', t.mode, 'taille', t.taille, 'nom', t.nom, 'phase', t.phase, 'tour', t.tour, 'nb_tours', t.nb_tours, 'echeance', t.echeance,
    'points_par_set', t.points_par_set, 'sets_gagnants', t.sets_gagnants, 'duree_minutes', extract(epoch from t.duree_tour)::int / 60,
    'mise', t.mise, 'freeroll', t.freeroll, 'programme', t.programme, 'depart', t.depart, 'garantie', t.garantie, 'finale_sets', t.finale_sets,
    'enjeu', t.enjeu, 'aller_retour', t.aller_retour, 'fini_le', t.fini_le, 'hebdo', t.hebdo, 'edition', t.edition, 'serie', t.serie,
    'nb_poules', t.nb_poules, 'playoffs', t.playoffs, 'ko_points', t.ko_points, 'ko_sets', t.ko_sets, 'fin_points', t.fin_points,
    'fin_sets', t.fin_sets, 'garder_poules', t.garder_poules, 'fin_prevue', t.fin_prevue,
    'premier_saison', case when t.premier_saison is not null then _carte(t.premier_saison) end,
    'dernier', case when t.dernier is not null then _carte(t.dernier) end,
    'cercle', (select jsonb_build_object('id', c.id, 'nom', c.nom, 'blason', c.blason) from cercles c where c.id = t.cercle_id),
    'inscrits', (select count(*) from inscrits_tournoi where tournoi_id = t.id),
    'bots', (select count(*) from inscrits_tournoi i join bots_en_ligne b on b.joueur = i.joueur where i.tournoi_id = t.id),
    'inscrit', exists (select 1 from inscrits_tournoi where tournoi_id = t.id and joueur = auth.uid()),
    'createur', t.createur = auth.uid(),
    'vainqueur', case when t.vainqueur is not null then _carte(t.vainqueur) end,
    'gagne', t.phase = 'termine' and t.vainqueur = auth.uid(),
    'a_jouer', exists (select 1 from matchs_tournoi m where m.tournoi_id = t.id and m.tour = t.tour and m.fin is null
                         and t.phase = 'en_cours' and auth.uid() in (m.j0, m.j1)),
    'elimine', t.mode <> 'championnat' and t.phase = 'en_cours' and exists (select 1 from matchs_tournoi m where m.tournoi_id = t.id and m.fin is not null
                         and auth.uid() in (m.j0, m.j1) and m.vainqueur is distinct from auth.uid()))
$$;

-- Remplace la version de l'étape 51 : avec le classement de chaque poule, et la phase, l'étape et le format de chaque match.
create or replace function public.voir_tournoi(p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  select * into t from tournois where id = p_id;
  if t.id is null or not _voit_tournoi(t) then raise exception 'Tournoi introuvable'; end if;
  perform _avancer_tournoi(p_id);
  select * into t from tournois where id = p_id;
  return _resume_tournoi(t) || jsonb_build_object(
    'code', t.code, 'organise', _organise(t), 'maintenant', now(),
    'efface_enjeu', t.enjeu is not null and (t.createur = auth.uid() or (t.cercle_id is not null and _role(t.cercle_id) = 'admin')),
    'arrete_serie', t.hebdo and t.phase in ('inscriptions', 'en_cours') and (t.createur = auth.uid() or (t.cercle_id is not null and _role(t.cercle_id) = 'admin')),
    'palmares', case when t.serie is not null then _palmares_serie(t.serie) end,
    'classement', case when t.mode = 'championnat' and t.phase <> 'inscriptions' then _classement_championnat(p_id) end,
    'poules', case when t.mode = 'championnat' and t.phase <> 'inscriptions' and t.nb_poules > 1 then
      (select jsonb_agg(_classement_poule(p_id, k) order by k) from generate_series(0, t.nb_poules - 1) k) end,
    'joueurs', coalesce((select jsonb_agg(_carte(i.joueur) || jsonb_build_object('tete', i.tete, 'poule', i.poule) order by i.tete nulls last, i.inscrit_le)
                         from inscrits_tournoi i where i.tournoi_id = p_id), '[]'::jsonb),
    'matchs', coalesce((select jsonb_agg(jsonb_build_object(
        'id', m.id, 'tour', m.tour, 'position', m.position, 'fin', m.fin, 'phase', m.phase, 'etape', m.etape,
        'points_par_set', coalesce(m.points_par_set, t.points_par_set), 'sets_gagnants', coalesce(m.sets_gagnants, t.sets_gagnants),
        'j0', case when m.j0 is not null then _carte(m.j0) || jsonb_build_object('tete', (select tete from inscrits_tournoi where tournoi_id = p_id and joueur = m.j0)) end,
        'j1', case when m.j1 is not null then _carte(m.j1) || jsonb_build_object('tete', (select tete from inscrits_tournoi where tournoi_id = p_id and joueur = m.j1)) end,
        'vainqueur', m.vainqueur, 'essai0', m.essai0 is not null, 'essai1', m.essai1 is not null,
        'duel', (select jsonb_build_object('id', d.id, 'phase', d.phase, 'j0', d.j0, 'scores_sets', d.scores_sets, 'sets', d.sets, 'points', d.points)
                 from duels d where d.id = m.duel_id)) order by m.tour, m.position)
      from matchs_tournoi m where m.tournoi_id = p_id), '[]'::jsonb));
end $$;

-- ---------------------------------------------------------------- sécurité
revoke all on function public._classement_poule(uuid, int), public._tours_ko(int, int, int), public._qui(uuid, int, int),
  public._rang_saison(uuid, uuid), public._match_ko(uuid, int, int, text, text, uuid, uuid, text, text, int, int),
  public._construire_playoffs(uuid), public._remplir_tableau(uuid), public._composer_poules(uuid, int),
  public._classement_championnat(uuid), public._avancer_championnat(uuid), public._lancer_championnat(uuid),
  public._edition_suivante(uuid), public._palmares_serie(uuid), public._inscrire(public.tournois) from public, anon, authenticated;
revoke all on function public.creer_championnat(text, uuid, int, int, int, boolean, text, boolean, jsonb), public.jouer_match_tournoi(uuid) from public, anon;
grant execute on function public.creer_championnat(text, uuid, int, int, int, boolean, text, boolean, jsonb), public.jouer_match_tournoi(uuid) to authenticated;
