-- HandSlam — Étape 47 : trois nouveaux gestes de victoire à la boutique.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Nécessite l'étape 17. Peut être relancé sans risque.
--
-- Décision du porteur du projet (21 octobre) : cinq nouveaux gestes. Trois s'achètent avec des jetons (le poing sur le cœur,
-- le salut militaire, le micro qui tombe) ; les deux autres se gagnent avec un trophée (le check : « Gentleman » ; le doigt
-- « non, non, non » : « Phénix ») et ne passent donc pas par la boutique.
-- Le catalogue complet (remplace celui de l'étape 17) ; un test vérifie qu'il correspond à app/js/catalogue.js.

create or replace function public._catalogue() returns table (id text, prix int) language sql immutable as $$
  values ('gant:rose', 300), ('gant:violet', 300), ('gant:noir', 300), ('gant:turquoise', 300),
         ('gantMotif:damier', 800), ('gantMotif:flammes', 800), ('gantMotif:tigre', 800), ('gantMotif:zebre', 800),
         ('gantMotif:coeurs', 800), ('gantMotif:etoiles', 800), ('gantMotif:camouflage', 800), ('gantMotif:carbone', 800),
         ('fond:roland', 800), ('fond:londres', 800), ('fond:neon', 2000), ('fond:coucher', 2000),
         ('fond:stade', 2000), ('fond:galaxie', 5000), ('poignet:tricolore', 300), ('poignet:arcenciel', 800),
         ('poignet:leopard', 800), ('cri:jeu_set_et_main', 800), ('cri:trop_facile', 800), ('cri:ole', 800),
         ('cri:boum', 800), ('cri:le_metier', 800), ('cri:sayonara', 800), ('cri:ca_fait_mal', 800),
         ('cri:le_patron', 800), ('cri:qui_le_patron', 800), ('geste:poing_tremble', 800), ('geste:poing_leve', 800),
         ('geste:salut', 800), ('geste:v_victoire', 2000), ('geste:pouce_leve', 2000), ('geste:doigt_leve', 2000),
         ('geste:uppercut', 5000), ('celebration:etoiles', 2000), ('celebration:coeurs', 2000), ('celebration:eclairs', 2000),
         ('celebration:feu', 2000), ('celebration:or', 5000), ('cadre:bronze', 300), ('cadre:argent', 800),
         ('cadre:neon', 2000), ('cadre:or', 5000),
         ('geste:coeur', 800), ('geste:salut_militaire', 2000), ('geste:micro', 5000)
$$;
