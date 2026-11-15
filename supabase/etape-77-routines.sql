-- HandSlam — Étape 77 : les routines d'entrée à la boutique.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Nécessite l'étape 72. Peut être relancé sans risque.
--
-- Idée d'un testeur et du porteur du projet (14-15 novembre) : pendant la présentation du match, la main de chaque joueur fait
-- sa routine d'avant-match (app/js/routines.js). Le salut à la foule est gratuit ; les autres sont à la boutique : rares
-- (800 jetons : shadow boxing, pianiste, ciseaux qui claquent, Pierre-Feuille-Ciseaux, craquer les doigts, la vague, regarder
-- sa montre) ou épiques (2 000 jetons : « Viens par ici ! », « Chut ! » au public). Elles entrent aussi dans la vitrine du jour.
-- Le catalogue complet (remplace celui de l'étape 72) ; un test vérifie qu'il correspond à app/js/catalogue.js.

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
         ('geste:coeur', 800), ('geste:salut_militaire', 2000), ('geste:micro', 5000),
         ('gantMotif:club', 2000), ('bague:symbole', 800), ('poignet:club', 300),
         ('gantMotif:signe_pierre', 800), ('gantMotif:signe_feuille', 800), ('gantMotif:signe_ciseaux', 800),
         ('bracelet:jonc', 800), ('bracelet:gourmette_or', 800), ('bracelet:gourmette_argent', 800), ('bracelet:clous_noir', 800),
         ('bracelet:clous_rouge', 800), ('bracelet:tresse', 300), ('bracelet:tresse_club', 800), ('bracelet:breloque_pierre', 800),
         ('bracelet:breloque_feuille', 800), ('bracelet:breloque_ciseaux', 800), ('bague:saphir', 800), ('bague:emeraude', 800),
         ('bague:diamant', 2000), ('bague:signe_pierre', 800), ('bague:signe_feuille', 800), ('bague:signe_ciseaux', 800),
         ('gantMotif:vache', 800), ('gantMotif:girafe', 800), ('gantMotif:leopard', 800),
         ('routine:shadow', 800), ('routine:pianiste', 800), ('routine:claque', 800), ('routine:trois', 800),
         ('routine:craquer', 800), ('routine:vague', 800), ('routine:montre', 800), ('routine:viens', 2000), ('routine:chut', 2000)
$$;

revoke all on function public._catalogue() from public, anon, authenticated;
