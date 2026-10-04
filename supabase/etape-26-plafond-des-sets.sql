-- HandSlam — Étape 26 : plus de sets à rallonge (point décisif à 14 partout en sets de 11, à 9 partout en sets de 7).
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 25. Peut être relancé sans risque.
-- Si on relance un jour l'étape 3 ou 4b, il faut relancer celle-ci ensuite.
--
-- Règle (décision du porteur du projet) : il faut toujours 2 points d'écart en sets de 11 et de 7, mais pas sans fin :
-- à 14 partout (sets de 11) ou à 9 partout (sets de 7), point décisif : le premier à 15 (ou 10) gagne le set.
-- La même règle est appliquée dans l'appli (app/js/regles.js ; un test vérifie que les deux sont identiques).

-- Le score qui gagne le set quoi qu'il arrive : 15 en sets de 11, 10 en sets de 7 (null : pas de limite).
create or replace function public._plafond(p_points smallint) returns int language sql immutable as $$
  select case p_points when 11 then 15 when 7 then 10 end
$$;

-- Révèle les deux signes du coup en cours et applique les règles (remplace la version de l'étape 4b : avec le plafond).
create or replace function public._resoudre(p_id uuid) returns void
language plpgsql as $$
declare
  d public.duels;
  sa public.coups_secrets; sb public.coups_secrets;
  g smallint; p smallint[]; s smallint[];
begin
  select * into d from public.duels where id = p_id for update;
  select * into sa from public.coups_secrets where duel_id = p_id and manche = d.manche and joueur = 0;
  select * into sb from public.coups_secrets where duel_id = p_id and manche = d.manche and joueur = 1;
  if sa is null or sb is null or d.phase <> 'jeu' then return; end if;

  -- Pierre bat Ciseaux, Ciseaux bat Feuille, Feuille bat Pierre ; égalité : rejouée.
  g := case when sa.signe = sb.signe then null when (sa.signe + 1) % 3 = sb.signe then 0 else 1 end;
  d.coups := d.coups || jsonb_build_object('a', sa.signe, 'b', sb.signe, 'g', g, 'auto', jsonb_build_array(sa.auto, sb.auto));
  d.manche := d.manche + 1;
  d.echeance := now() + public._duree_coup() + interval '0.9 seconds';   -- le temps de voir les signes

  if g is not null then
    p := d.points; p[g + 1] := p[g + 1] + 1;
    -- Set gagné : au moins points_par_set points et l'écart nécessaire, ou le plafond atteint (point décisif à 14 ou 9 partout).
    if (greatest(p[1], p[2]) >= d.points_par_set and abs(p[1] - p[2]) >= public._ecart(d.points_par_set))
       or greatest(p[1], p[2]) >= coalesce(public._plafond(d.points_par_set), 32767) then
      d.scores_sets := d.scores_sets || jsonb_build_array(jsonb_build_array(p[1], p[2]));
      s := d.sets; s[g + 1] := s[g + 1] + 1; d.sets := s;
      p := '{0,0}';
      if s[g + 1] = d.sets_gagnants then
        d.phase := 'termine'; d.vainqueur := g; d.fin := 'score'; d.echeance := null;
      else
        d.phase := 'entre_sets'; d.prets := '{false,false}'; d.echeance := now() + interval '30 seconds';
      end if;
    end if;
    d.points := p;
  end if;

  update public.duels set coups = d.coups, manche = d.manche, echeance = d.echeance, points = d.points, sets = d.sets,
    scores_sets = d.scores_sets, phase = d.phase, prets = d.prets, vainqueur = d.vainqueur, fin = d.fin, maj_le = now()
  where id = p_id;
end $$;

revoke all on function public._plafond(smallint), public._resoudre(uuid) from public, anon, authenticated;
