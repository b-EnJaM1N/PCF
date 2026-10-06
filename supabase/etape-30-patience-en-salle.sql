-- HandSlam — Étape 30 : en salle de Sit & Go, on garde le joueur 3 minutes sans signe de vie (au lieu de 45 secondes).
-- À coller dans Supabase (une seule ligne utile). Nécessite les étapes 2 à 29. Peut être relancé sans risque.
-- Pourquoi : les bots complètent la salle au bout de 2 minutes ; un joueur qui mettait son téléphone en veille
-- ou passait dans une autre appli était retiré de la salle avant leur arrivée, et la salle ne démarrait jamais.
create or replace function public._absence_salle() returns interval language sql immutable as $$ select interval '3 minutes' $$;
