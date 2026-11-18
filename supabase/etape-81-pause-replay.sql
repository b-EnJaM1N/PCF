-- HandSlam — Étape 81 : en duel, la pause entre deux sets dure 45 secondes (au lieu de 30).
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Peut être relancé sans risque. Nécessite les étapes 2 à 80.
-- Si on relance un jour l'étape 49, il faut relancer celle-ci ensuite.
--
-- 18 novembre (demande du porteur du projet) : le replay du moment fort du set passe au début de la pause, en duel aussi
-- (une quinzaine de secondes, que chacun peut passer) ; les 30 secondes pour se préparer et s'envoyer un message commencent
-- après. Le set repart toujours dès que les deux joueurs sont prêts.

-- Marque un point (g : 0 ou 1 ; null : rien) sur le duel d, sans l'enregistrer : fin de set, fin de match.
-- (remplace la version de l'étape 49 : seule la durée de la pause change)
create or replace function public._marquer(d public.duels, g smallint) returns public.duels
language plpgsql as $$
declare p smallint[]; s smallint[];
begin
  if g is null then return d; end if;
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
      d.phase := 'entre_sets'; d.prets := '{false,false}'; d.echeance := now() + interval '45 seconds';
    end if;
  end if;
  d.points := p;
  return d;
end $$;
revoke all on function public._marquer(public.duels, smallint) from public, anon, authenticated;
