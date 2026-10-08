-- HandSlam — Étape 33 : 64 bots en ligne (32 de plus).
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 32. Peut être relancé sans risque.
-- Si on relance un jour l'étape 21 ou 24, il faut relancer celle-ci ensuite.
--
-- Décision du porteur du projet (8 octobre) : 64 bots en tout, pour qu'une salle de 64 joueurs puisse être complétée
-- par des bots tous différents. Les 32 nouveaux ne jouent qu'en ligne (Sit & Go, tournois, parties rapides) :
-- l'entraînement garde ses 15 bots. Ils jouent comme les autres, selon leur niveau (étape 24) et sont choisis selon la mise
-- (étape 29) ; ils sont répartis sur toute l'échelle, 8 par tranche (débutants, moyens, forts, redoutables).
-- Noms choisis avec le porteur du projet (Chamalou, Petit Scarabée… ; « L'Oracle » existant déjà, le nouveau s'appelle Le Devin).
--
-- Les nouveaux modèles sont AJOUTÉS À LA FIN de la liste : _assurer_bots numérote les comptes dans l'ordre de la liste,
-- et les comptes existants gardent ainsi leur numéro.

create or replace function public._modeles_bots() returns table (cle text, nom text, favori smallint, elo int, avatar jsonb)
language sql immutable as $$
  values ('pantoufle', 'Pantoufle', 2::smallint, 800, '{"symbole":"feuille","fond":"violet","gant":"rose","poignet":"blanc","motif":"uni"}'::jsonb),
         ('rocky', 'Rocky', 0, 850, '{"symbole":"pierre","fond":"terre","gant":"rouge","poignet":"noir","motif":"uni"}'),
         ('tamagotchi', 'Tamagotchi', 1, 850, '{"symbole":"ciseaux","fond":"gazon","gant":"jaune","poignet":"bleu","motif":"uni"}'),
         ('papyrus', 'Papyrus', 2, 900, '{"symbole":"feuille","fond":"terre","gant":"blanc","poignet":"rouge","motif":"uni"}'),
         ('flanby', 'Flanby', 2, 900, '{"symbole":"feuille","fond":"or","gant":"jaune","poignet":"blanc","motif":"uni"}'),
         ('bambi', 'Bambi', 0, 950, '{"symbole":"pierre","fond":"gazon","gant":"blanc","poignet":"jaune","motif":"uni"}'),
         ('gaston', 'Gaston', 0, 950, '{"symbole":"pierre","fond":"court","gant":"rouge","poignet":"blanc","motif":"uni"}'),
         ('miroir', 'Miroir', 2, 1000, '{"symbole":"feuille","fond":"court","gant":"blanc","poignet":"bleu","motif":"rayures"}'),
         ('mollasson', 'Mollasson', 0, 1000, '{"symbole":"pierre","fond":"violet","gant":"bleu","poignet":"jaune","motif":"rayures"}'),
         ('boomerang', 'Boomerang', 0, 1050, '{"symbole":"pierre","fond":"violet","gant":"jaune","poignet":"rouge","motif":"etoile"}'),
         ('rubik', 'Rubik', 1, 1080, '{"symbole":"ciseaux","fond":"court","gant":"rouge","poignet":"jaune","motif":"rayures"}'),
         ('cyclo', 'Cyclo', 1, 1100, '{"symbole":"ciseaux","fond":"gazon","gant":"jaune","poignet":"blanc","motif":"rayures"}'),
         ('origami', 'Origami', 2, 1130, '{"symbole":"feuille","fond":"gazon","gant":"blanc","poignet":"bleu","motif":"etoile"}'),
         ('tictac', 'Tic-Tac', 1, 1150, '{"symbole":"ciseaux","fond":"violet","gant":"bleu","poignet":"blanc","motif":"rayures"}'),
         ('silex', 'Silex', 0, 1180, '{"symbole":"pierre","fond":"terre","gant":"argent","poignet":"noir","motif":"rayures"}'),
         ('chaos', 'Chaos', 1, 1200, '{"symbole":"ciseaux","fond":"court","gant":"vert","poignet":"jaune","motif":"eclair"}'),
         ('tondeuse', 'Tondeuse', 1, 1230, '{"symbole":"ciseaux","fond":"gazon","gant":"vert","poignet":"noir","motif":"rayures"}'),
         ('rancune', 'Rancune', 1, 1250, '{"symbole":"ciseaux","fond":"terre","gant":"rouge","poignet":"noir","motif":"eclair"}'),
         ('comete', 'Comète', 2, 1280, '{"symbole":"feuille","fond":"minuit","gant":"jaune","poignet":"bleu","motif":"etoile"}'),
         ('bluffeur', 'Bluffeur', 2, 1300, '{"symbole":"feuille","fond":"violet","gant":"jaune","poignet":"noir","motif":"etoile"}'),
         ('shuriken', 'Shuriken', 1, 1330, '{"symbole":"ciseaux","fond":"ardoise","gant":"noir","poignet":"rouge","motif":"eclair"}'),
         ('nemesis', 'Némésis', 0, 1350, '{"symbole":"pierre","fond":"ardoise","gant":"bleu","poignet":"or","motif":"eclair"}'),
         ('mante', 'La Mante', 1, 1400, '{"symbole":"ciseaux","fond":"gazon","gant":"vert","poignet":"noir","motif":"eclair"}'),
         ('sphinx', 'Le Sphinx', 2, 1420, '{"symbole":"feuille","fond":"or","gant":"jaune","poignet":"noir","motif":"eclair"}'),
         ('stratege', 'Stratège', 2, 1450, '{"symbole":"feuille","fond":"ardoise","gant":"rouge","poignet":"noir","motif":"eclair"}'),
         ('oracle', 'L''Oracle', 0, 1480, '{"symbole":"pierre","fond":"galaxie","gant":"blanc","poignet":"or","motif":"etoile"}'),
         ('professeur', 'Professeur', 2, 1500, '{"symbole":"feuille","fond":"or","gant":"blanc","poignet":"noir","motif":"etoile"}'),
         ('glacon97', 'Glaçon 97', 1, 1510, '{"symbole":"ciseaux","fond":"minuit","gant":"argent","poignet":"blanc","motif":"etoile"}'),
         ('mentaliste', 'Mentaliste', 2, 1550, '{"symbole":"feuille","fond":"ardoise","gant":"violet","poignet":"or","motif":"etoile"}'),
         ('titan', 'Titan', 0, 1600, '{"symbole":"pierre","fond":"or","gant":"or","poignet":"noir","motif":"etoile"}'),
         ('kaiser', 'Le Kaiser', 0, 1650, '{"symbole":"pierre","fond":"ardoise","gant":"rouge","poignet":"or","motif":"eclair"}'),
         ('boss', 'Boss Final', 1, 1700, '{"symbole":"ciseaux","fond":"stade","gant":"noir","poignet":"or","motif":"eclair"}'),
         ('doudou', 'Doudou', 2, 820, '{"symbole":"feuille","fond":"violet","gant":"rose","poignet":"blanc","motif":"uni"}'),
         ('chamalou', 'Chamalou', 0, 860, '{"symbole":"pierre","fond":"coucher","gant":"rose","poignet":"blanc","motif":"uni"}'),
         ('biscotte', 'Biscotte', 1, 880, '{"symbole":"ciseaux","fond":"terre","gant":"jaune","poignet":"rouge","motif":"uni"}'),
         ('scarabee', 'Petit Scarabée', 0, 920, '{"symbole":"pierre","fond":"gazon","gant":"vert","poignet":"jaune","motif":"uni"}'),
         ('guimauve', 'Guimauve', 2, 960, '{"symbole":"feuille","fond":"neon","gant":"rose","poignet":"bleu","motif":"uni"}'),
         ('croquette', 'Croquette', 1, 990, '{"symbole":"ciseaux","fond":"terre","gant":"or","poignet":"noir","motif":"rayures"}'),
         ('brindille', 'Brindille', 2, 1020, '{"symbole":"feuille","fond":"gazon","gant":"vert","poignet":"blanc","motif":"rayures"}'),
         ('toupie', 'Toupie', 0, 1040, '{"symbole":"pierre","fond":"court","gant":"turquoise","poignet":"jaune","motif":"etoile"}'),
         ('zigzag', 'Zigzag', 1, 1060, '{"symbole":"ciseaux","fond":"neon","gant":"jaune","poignet":"noir","motif":"eclair"}'),
         ('galet', 'Galet', 0, 1090, '{"symbole":"pierre","fond":"ardoise","gant":"argent","poignet":"bleu","motif":"uni"}'),
         ('pivert', 'Pivert', 1, 1120, '{"symbole":"ciseaux","fond":"gazon","gant":"rouge","poignet":"noir","motif":"rayures"}'),
         ('ricochet', 'Ricochet', 0, 1160, '{"symbole":"pierre","fond":"court","gant":"bleu","poignet":"blanc","motif":"etoile"}'),
         ('sardine', 'Sardine', 2, 1190, '{"symbole":"feuille","fond":"court","gant":"argent","poignet":"bleu","motif":"rayures"}'),
         ('pistache', 'Pistache', 1, 1220, '{"symbole":"ciseaux","fond":"gazon","gant":"vert","poignet":"rouge","motif":"etoile"}'),
         ('lasso', 'Lasso', 2, 1260, '{"symbole":"feuille","fond":"terre","gant":"or","poignet":"rouge","motif":"rayures"}'),
         ('moustique', 'Moustique', 1, 1290, '{"symbole":"ciseaux","fond":"minuit","gant":"noir","poignet":"jaune","motif":"eclair"}'),
         ('scorpion', 'Scorpion', 1, 1310, '{"symbole":"ciseaux","fond":"terre","gant":"noir","poignet":"rouge","motif":"eclair"}'),
         ('vautour', 'Vautour', 0, 1340, '{"symbole":"pierre","fond":"ardoise","gant":"noir","poignet":"blanc","motif":"eclair"}'),
         ('mirage', 'Mirage', 2, 1370, '{"symbole":"feuille","fond":"coucher","gant":"or","poignet":"blanc","motif":"etoile"}'),
         ('sablier', 'Sablier', 0, 1390, '{"symbole":"pierre","fond":"or","gant":"or","poignet":"noir","motif":"rayures"}'),
         ('faucon', 'Faucon', 1, 1430, '{"symbole":"ciseaux","fond":"minuit","gant":"argent","poignet":"or","motif":"eclair"}'),
         ('typhon', 'Typhon', 2, 1460, '{"symbole":"feuille","fond":"minuit","gant":"turquoise","poignet":"blanc","motif":"eclair"}'),
         ('sorciere', 'La Sorcière', 1, 1470, '{"symbole":"ciseaux","fond":"galaxie","gant":"violet","poignet":"noir","motif":"etoile"}'),
         ('notaire', 'Le Notaire', 2, 1490, '{"symbole":"feuille","fond":"ardoise","gant":"blanc","poignet":"noir","motif":"uni"}'),
         ('devin', 'Le Devin', 0, 1520, '{"symbole":"pierre","fond":"galaxie","gant":"argent","poignet":"or","motif":"etoile"}'),
         ('baron', 'Le Baron', 2, 1560, '{"symbole":"feuille","fond":"rubis","gant":"blanc","poignet":"or","motif":"rayures"}'),
         ('minotaure', 'Minotaure', 0, 1590, '{"symbole":"pierre","fond":"terre","gant":"rouge","poignet":"or","motif":"eclair"}'),
         ('comtesse', 'La Comtesse', 2, 1620, '{"symbole":"feuille","fond":"rubis","gant":"violet","poignet":"or","motif":"etoile"}'),
         ('pharaon', 'Le Pharaon', 1, 1660, '{"symbole":"ciseaux","fond":"or","gant":"or","poignet":"bleu","motif":"etoile"}'),
         ('hydre', 'Hydre', 1, 1690, '{"symbole":"ciseaux","fond":"stade","gant":"vert","poignet":"noir","motif":"eclair"}'),
         ('bigbang', 'Big Bang', 0, 1720, '{"symbole":"pierre","fond":"galaxie","gant":"or","poignet":"noir","motif":"eclair"}'),
         ('reinemere', 'La Reine Mère', 2, 1750, '{"symbole":"feuille","fond":"stade","gant":"or","poignet":"or","motif":"etoile"}')
$$;

-- Les comptes des nouveaux bots, tout de suite (sinon au prochain tournoi).
select public._assurer_bots(0);
revoke all on function public._modeles_bots() from public, anon, authenticated;
