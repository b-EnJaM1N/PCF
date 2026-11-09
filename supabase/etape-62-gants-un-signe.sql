-- HandSlam — Étape 62 : les gants à un seul signe à la boutique (le gant « Pierre », le gant « Feuille », le gant « Ciseaux »).
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Nécessite l'étape 61. Peut être relancé sans risque.
--
-- Demande du porteur du projet (9 novembre) : à côté du gant « Trois signes », pouvoir choisir un seul signe.
-- Comme les autres objets du club : en vente seulement sur la version de test, hors de la vitrine du jour (à la sortie, ils
-- deviendront des récompenses de fidélité).
-- Le catalogue complet (remplace celui de l'étape 61) ; un test vérifie qu'il correspond à app/js/catalogue.js.

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
         ('gantMotif:signes', 800), ('gantMotif:club', 2000), ('bague:symbole', 800), ('poignet:club', 300),
         ('gantMotif:signe_pierre', 800), ('gantMotif:signe_feuille', 800), ('gantMotif:signe_ciseaux', 800)
$$;

-- La vitrine du jour : sans les objets du club (le tirage des autres articles ne change pas).
create or replace function public._vitrine(p_jour date) returns table (id text, prix int, prix_remise int) language sql immutable as $$
  select id, prix, (round(prix * 0.7 / 10) * 10)::int from _catalogue()
  where id not in ('gantMotif:signes', 'gantMotif:club', 'bague:symbole', 'poignet:club',
                   'gantMotif:signe_pierre', 'gantMotif:signe_feuille', 'gantMotif:signe_ciseaux')
  order by md5(id || p_jour::text) limit 3
$$;

revoke all on function public._catalogue(), public._vitrine(date) from public, anon, authenticated;
