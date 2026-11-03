-- HandSlam — Étape 57 : plus aucune mise entre joueurs ; des jetons gagnés en jouant.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 56. Peut être relancé sans risque.
--
-- Décision du porteur du projet (3 novembre, après l'audit) : les mises de jetons entre joueurs sont supprimées partout
-- (défis entre amis, partie rapide, heads-up, Sit & Go, tournois programmés) : elles pouvaient être vues comme un jeu de
-- hasard simulé, avec des joueurs mineurs. Les entrées deviennent gratuites. Les jetons se gagnent en jouant (match terminé,
-- victoire, exploits) et ne servent qu'à la boutique (plus tard : des tickets de tournoi). Ils ne s'achètent jamais.
-- (Les tests de la base peuvent réactiver les anciennes mises avec « set pcf.mises = 'on' », pour vérifier l'ancien code.)

-- ---------------------------------------------------------------- les mises sont fermées
create or replace function public._mises_actives() returns boolean
language sql stable as $$ select coalesce(current_setting('pcf.mises', true), '') = 'on' $$;

-- (remplace la version de l'étape 14) : toute mise est refusée.
create or replace function public._verifier_mise(p_mise int) returns void
language plpgsql stable as $$
begin
  if coalesce(p_mise, 0) = 0 then return; end if;
  if not _mises_actives() then raise exception 'Les mises de jetons sont supprimées : les parties sont gratuites'; end if;
  if not (p_mise = any (_mises())) then raise exception 'Mise invalide'; end if;
end $$;

-- (remplace la version de l'étape 18) : les tournois programmés deviennent gratuits (la cagnotte garantie reste offerte).
create or replace function public._programme()
returns table (cle text, nom text, heure time, jours int[], mise int, garantie int, finale_sets smallint)
language sql stable as $$
  select cle, nom, heure, jours, case when _mises_actives() then mise else 0 end, garantie, finale_sets from (
    values ('midi', 'Le Midi', time '12:30', array[1, 2, 3, 4, 5, 6, 7], 100, 0, null::smallint),
           ('apero', 'L''Apéro', time '18:00', array[1, 2, 3, 4, 5, 6, 7], 100, 0, null),
           ('nocturne', 'Le Nocturne', time '21:30', array[1, 2, 3, 4, 5, 6], 200, 0, null),
           ('grand_chelem', 'Le Grand Chelem', time '21:00', array[7], 1000, 5000, 3::smallint)
  ) p (cle, nom, heure, jours, mise, garantie, finale_sets)
$$;

-- Les tournois et salles encore ouverts à une mise : les entrées déjà payées sont rendues, et ils deviennent gratuits.
do $$
declare t record;
begin
  if _mises_actives() then return; end if;
  for t in select id, mise from public.tournois where coalesce(mise, 0) > 0 and phase = 'inscriptions' loop
    perform public._crediter(i.joueur, t.mise, 'entrée rendue') from public.inscrits_tournoi i where i.tournoi_id = t.id;
    update public.tournois set mise = 0 where id = t.id;
  end loop;
end $$;

-- ---------------------------------------------------------------- les jetons gagnés en jouant
-- Après chaque match terminé (contre un bot ou en duel) : +5, +10 de plus pour une victoire, et les exploits :
-- match du jour +15, balle de match sauvée +15, set gagné sans perdre un point +20, série de 5 points +5, smash gagnant +3.
-- Au plus 150 jetons par jour de cette façon (le même compteur que l'ancien « +10 par victoire contre un bot »).
-- (Les mêmes montants que l'appli : app/js/jetons-logique.js, recompenseMatch.)
create or replace function public._recompense_match(p_gagne boolean, p_exploits text[]) returns int
language sql immutable as $$
  select 5 + case when p_gagne then 10 else 0 end + coalesce((select sum(case e
    when 'match_du_jour' then 15 when 'balle_match' then 15 when 'set_blanc' then 20 when 'serie5' then 5 when 'smash' then 3 else 0 end)
    from (select distinct unnest(p_exploits) e) x), 0)::int
$$;
create or replace function public._plafond_matchs() returns int language sql immutable as $$ select 150 $$;

create or replace function public.gain_match(p_gagne boolean, p_exploits text[] default '{}') returns jsonb
language plpgsql security definer set search_path = public as $$
declare j public.jetons; deja int; m int;
begin
  j := _mon_portefeuille();
  deja := case when j.jour_entrainement = _aujourdhui() then j.gains_entrainement else 0 end;
  m := greatest(0, least(_recompense_match(coalesce(p_gagne, false), coalesce(p_exploits, '{}')), _plafond_matchs() - deja));
  if m > 0 then
    update jetons set jour_entrainement = _aujourdhui(), gains_entrainement = deja + m where joueur = j.joueur;
    perform _crediter(j.joueur, m, 'match');
  end if;
  select * into j from jetons where joueur = j.joueur;
  return _etat_jetons(j) || jsonb_build_object('gagne', m);
end $$;

revoke all on function public._mises_actives(), public._recompense_match(boolean, text[]), public._plafond_matchs() from public, anon, authenticated;
revoke all on function public.gain_match(boolean, text[]) from public, anon;
grant execute on function public.gain_match(boolean, text[]) to authenticated;
