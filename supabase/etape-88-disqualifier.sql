-- HandSlam — Étape 88 : l'organisateur disqualifie un joueur de son championnat.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 87. Peut être relancé sans risque.
-- Puis mettre à jour la fonction « Notifier » (supabase/functions/notifier/index.ts : le joueur disqualifié est prévenu).
--
-- Choix du porteur du projet (21 novembre) :
--  * seul l'organisateur disqualifie, pendant les poules ou les playoffs (jamais lui-même ; il doit rester au moins 3 joueurs) ;
--  * les matchs déjà joués par le disqualifié restent au classement ; ceux qu'il n'a pas joués sont gagnés par forfait par ses
--    adversaires (pendant les playoffs : son match est perdu par forfait, son adversaire passe) ;
--  * il passe en dernier du classement, ne compte plus pour les playoffs (leur forme se recalcule sans lui) ;
--  * avec un enjeu, il s'y colle d'office (pas de playouts) ;
--  * le classement montre aussi le nombre de forfaits de chacun, pour aider l'organisateur à décider.

alter table public.inscrits_tournoi add column if not exists disqualifie_le timestamptz;

alter table public.notifications drop constraint if exists notifications_evenement_check;
alter table public.notifications add constraint notifications_evenement_check
  check (evenement in ('defi', 'accepte', 'tournoi', 'test', 'freeroll', 'programme', 'attend', 'invitation',
                       'ami_demande', 'ami_accepte', 'invitation_cercle',
                       'creneaux', 'rdv_fixe', 'rdv_decline', 'rdv_rappel', 'rdv_heure',
                       'poules_24h', 'calendrier', 'disqualifie'));

-- ---------------------------------------------------------------- le classement, la forme des playoffs, la fin
-- Remplacent les versions de l'étape 66 : le disqualifié en dernier (et le nombre de forfaits de chacun) ; les playoffs sans lui ;
-- avec un enjeu, il s'y colle.

create or replace function public._classement_poule(p_id uuid, p_poule int) returns jsonb
language sql stable security definer set search_path = public as $$
  with joueurs as (select joueur, inscrit_le, disqualifie_le from inscrits_tournoi where tournoi_id = p_id and (p_poule is null or poule = p_poule)),
  lignes as (
    select j.joueur, m.vainqueur, case when m.j0 = j.joueur then m.j1 else m.j0 end as adv,
           case when d.j0 = j.joueur then 0 else 1 end as cote, d.sets, d.scores_sets, m.fin
    from joueurs j join matchs_tournoi m on m.tournoi_id = p_id and m.tour = 1 and j.joueur in (m.j0, m.j1) and m.fin is not null
    left join duels d on d.id = m.duel_id and d.phase = 'termine'),
  stats as (
    select j.joueur, j.inscrit_le, j.disqualifie_le is not null as disq,
      count(l.joueur) filter (where l.fin in ('forfait', 'double_forfait') and l.vainqueur is distinct from j.joueur)::int as forfaits,
      count(l.joueur) filter (where l.vainqueur = j.joueur)::int as v,
      count(l.joueur) filter (where l.vainqueur is distinct from j.joueur)::int as d,
      coalesce(sum(l.sets[l.cote + 1]), 0)::int as sets_g,
      coalesce(sum((select sum((x->>l.cote)::int) from jsonb_array_elements(l.scores_sets) x)), 0)::int as pts_g
    from joueurs j left join lignes l on l.joueur = j.joueur group by j.joueur, j.inscrit_le, j.disqualifie_le),
  directes as (
    select l.joueur, count(*)::int as n from lignes l join stats s on s.joueur = l.joueur join stats a on a.joueur = l.adv
    where l.vainqueur = l.joueur and a.v = s.v group by l.joueur),
  rangs as (
    select s.*, coalesce(dr.n, 0) as dir,
      row_number() over (order by s.disq, s.v desc, coalesce(dr.n, 0) desc, s.sets_g desc, s.pts_g desc, s.inscrit_le, s.joueur) as rang
    from stats s left join directes dr on dr.joueur = s.joueur)
  select coalesce(jsonb_agg(jsonb_build_object('joueur', _carte(r.joueur), 'rang', r.rang, 'points', 2 * r.v, 'v', r.v, 'd', r.d,
    'joues', r.v + r.d, 'sets', r.sets_g, 'points_gagnes', r.pts_g,
    'forfaits', r.forfaits, 'disqualifie', r.disq) order by r.rang), '[]'::jsonb)
  from rangs r
$$;

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

  -- (étape 88) sans les disqualifiés
  n := (select count(*) from inscrits_tournoi where tournoi_id = p_id and disqualifie_le is null);
  mini := (select min(c) from (select count(*) c from inscrits_tournoi where tournoi_id = p_id and disqualifie_le is null group by poule) z);
  tours := _tours_ko(nbp, mini, n);
  kp := coalesce(t.ko_points, t.points_par_set); ks := coalesce(t.ko_sets, t.sets_gagnants);
  fp := coalesce(t.fin_points, kp); fs := coalesce(t.fin_sets, ks);
  s := array(select joueur from inscrits_tournoi where tournoi_id = p_id and disqualifie_le is null order by rang_saison);

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
      qual := array(select joueur from inscrits_tournoi where tournoi_id = p_id and rang_poule <= 4 and disqualifie_le is null);
    elsif nbp = 4 then
      q1 := _match_ko(p_id, 2, 1, 'playoff', 'Quart de finale', _qui(p_id, 0, 1), _qui(p_id, 1, 2), null, null, kp, ks);
      q2 := _match_ko(p_id, 2, 2, 'playoff', 'Quart de finale', _qui(p_id, 2, 1), _qui(p_id, 3, 2), null, null, kp, ks);
      q3 := _match_ko(p_id, 2, 3, 'playoff', 'Quart de finale', _qui(p_id, 1, 1), _qui(p_id, 0, 2), null, null, kp, ks);
      q4 := _match_ko(p_id, 2, 4, 'playoff', 'Quart de finale', _qui(p_id, 3, 1), _qui(p_id, 2, 2), null, null, kp, ks);
      qual := array(select joueur from inscrits_tournoi where tournoi_id = p_id and rang_poule <= 2 and disqualifie_le is null);
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
  -- (étape 88) un disqualifié s'y colle d'office : pas de playouts
  if t.enjeu is not null and exists (select 1 from inscrits_tournoi where tournoi_id = p_id and disqualifie_le is not null) then
    update tournois set dernier = (select joueur from inscrits_tournoi where tournoi_id = p_id and disqualifie_le is not null order by disqualifie_le limit 1) where id = p_id;
  elsif t.enjeu is not null then
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

create or replace function public._avancer_championnat(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; m public.matchs_tournoi; d public.duels; premier jsonb; finale public.matchs_tournoi; po public.matchs_tournoi;
  disq uuid := (select joueur from inscrits_tournoi where tournoi_id = p_id and disqualifie_le is not null order by disqualifie_le limit 1);
begin
  select * into t from tournois where id = p_id for update;
  if t.id is null or t.phase <> 'en_cours' then return; end if;
  loop
    perform _remplir_tableau(p_id);
    -- (étape 88) un match contre un disqualifié : gagné par forfait par l'autre joueur
    update matchs_tournoi mx set vainqueur = case when exists (select 1 from inscrits_tournoi i where i.tournoi_id = p_id and i.joueur = mx.j0
                                                                and i.disqualifie_le is not null) then mx.j1 else mx.j0 end, fin = 'forfait'
    where mx.tournoi_id = p_id and mx.fin is null and mx.j0 is not null and mx.j1 is not null
      and exists (select 1 from inscrits_tournoi i where i.tournoi_id = p_id and i.joueur in (mx.j0, mx.j1) and i.disqualifie_le is not null);
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
        dernier = case when t.enjeu is not null and disq is not null then disq
                       when po.id is not null then case when po.vainqueur = po.j0 then po.j1 else po.j0 end else dernier end
      where id = p_id;
    else
      premier := _classement_championnat(p_id)->0;
      update tournois set phase = 'termine', echeance = null, fini_le = now(),
        vainqueur = case when (premier->>'v')::int > 0 then (premier->'joueur'->>'id')::uuid end,
        premier_saison = case when (premier->>'v')::int > 0 then (premier->'joueur'->>'id')::uuid end,
        dernier = case when t.enjeu is not null then coalesce(disq, ((_classement_championnat(p_id)->-1)->'joueur'->>'id')::uuid) end
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

-- ---------------------------------------------------------------- disqualifier
create or replace function public.disqualifier_joueur(p_id uuid, p_joueur uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.tournois; m public.matchs_tournoi; d public.duels; reste int; nbp int; mini int; tours int;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  select * into t from tournois where id = p_id for update;
  if t.id is null or t.mode <> 'championnat' then raise exception 'Championnat introuvable'; end if;
  if t.createur <> auth.uid() then raise exception 'Seul l''organisateur peut disqualifier un joueur'; end if;
  if t.phase <> 'en_cours' then raise exception 'On ne disqualifie que pendant le championnat'; end if;
  if p_joueur = auth.uid() then raise exception 'Tu ne peux pas te disqualifier toi-même'; end if;
  if not exists (select 1 from inscrits_tournoi where tournoi_id = p_id and joueur = p_joueur and disqualifie_le is null) then
    raise exception 'Ce joueur n''est pas (ou plus) dans ce championnat';
  end if;
  reste := (select count(*) from inscrits_tournoi where tournoi_id = p_id and disqualifie_le is null) - 1;
  if reste < 3 then raise exception 'Il doit rester au moins 3 joueurs'; end if;
  update inscrits_tournoi set disqualifie_le = now() where tournoi_id = p_id and joueur = p_joueur;
  -- Ses matchs pas encore décidés : gagnés par forfait par son adversaire (un duel pas commencé est annulé).
  -- (ceux dont l'adversaire n'est pas encore connu, dans les playoffs, le seront quand il le sera : voir _avancer_championnat)
  for m in select * from matchs_tournoi where tournoi_id = p_id and fin is null and p_joueur in (j0, j1) and j0 is not null and j1 is not null for update loop
    select * into d from duels where id = m.duel_id;
    if d.id is not null and d.phase = 'attente' then
      perform set_config('pcf.interne', '1', true);
      update duels set phase = 'annule', maj_le = now() where id = d.id;
      perform set_config('pcf.interne', '', true);
    end if;
    update matchs_tournoi set vainqueur = case when m.j0 = p_joueur then m.j1 else m.j0 end, fin = 'forfait' where id = m.id;
  end loop;
  -- Pendant les poules : les playoffs auront peut-être un tour de moins ; leur temps se partage entre les tours restants.
  if t.tour = 1 and t.playoffs and t.fin_prevue is not null then
    nbp := coalesce(t.nb_poules, 1);
    mini := (select min(c) from (select count(*) c from inscrits_tournoi where tournoi_id = p_id and disqualifie_le is null group by poule) z);
    tours := _tours_ko(nbp, mini, reste);
    if tours > 0 then update tournois set tranche_ko = (fin_prevue - echeance) / tours where id = p_id; end if;
  end if;
  perform _notifier_creneau(p_joueur, 'disqualifie', auth.uid(), p_id);
  perform _avancer_championnat(p_id);
  return voir_tournoi(p_id);
end $$;

-- ---------------------------------------------------------------- sécurité
revoke all on function public._classement_poule(uuid, int), public._construire_playoffs(uuid), public._avancer_championnat(uuid) from public, anon, authenticated;
revoke all on function public.disqualifier_joueur(uuid, uuid) from public, anon;
grant execute on function public.disqualifier_joueur(uuid, uuid) to authenticated;
