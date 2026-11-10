-- HandSlam — Étape 60 : plus de défi « Participe au freeroll de 20 h » dans les défis du jour.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ».
-- Nécessite l'étape 15. Peut être relancé sans risque.
--
-- Remarque du porteur du projet (9 novembre) : le freeroll est caché dans la version de lancement (5 novembre), mais le défi
-- « Participe au freeroll de 20 h » était encore tiré au sort. Il sort de la liste ; les 3 défis du jour sont tirés parmi les 8
-- autres (pour remettre le freeroll plus tard, il suffira de rajouter sa ligne).

create or replace function public._defis() returns table (id text, recompense int) language sql immutable as $$
  values ('gagner_3', 40), ('jouer_5', 40), ('duel_en_ligne', 50), ('balle_sauvee', 60), ('set_net', 60),
         ('poignees_franches', 30), ('serie_4', 30), ('bot_fort', 50)
$$;
revoke all on function public._defis() from public, anon, authenticated;
