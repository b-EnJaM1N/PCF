# Script des annonces et commentaires

Ce fichier est généré automatiquement à partir de `app/js/voix/script.js`
(commande `npm run script-voix`). Ne pas le modifier à la main.

**Pour enregistrer une réplique** : crée un fichier MP3 portant exactement le
nom indiqué, et dépose-le dans `app/audio/`. Exemple :
`commentateur_craquage_02.mp3`. Tant qu'un fichier manque, la réplique est
seulement affichée par écrit (voix de synthèse activable dans les Options).

Nom d'un fichier = qui parle _ situation _ numéro de version, suivi si besoin
du signe (`_pierre`, `_ciseaux`, `_feuille`) et de `_f` pour la version
dite à une joueuse. Le speaker annonce les surnoms en deux fichiers (le nom,
puis le complément).
L'arbitre ne prononce jamais de pseudo : il nomme les joueurs par leur côté
(jaune = le joueur, rouge = l'adversaire). Les scores rares au-delà de 20–18
restent lus par la voix de synthèse.

## Arbitre — grave et sobre (90 répliques)

| Fichier | Texte |
|---|---|
| `arbitre_premier_set_01.mp3` | Premier set. |
| `arbitre_deuxieme_set_01.mp3` | Deuxième set. |
| `arbitre_troisieme_set_01.mp3` | Troisième set. |
| `arbitre_quatrieme_set_01.mp3` | Quatrième set. |
| `arbitre_set_decisif_01.mp3` | Set décisif. |
| `arbitre_balle_de_set_jaune_01.mp3` | Balle de set, côté jaune. |
| `arbitre_balle_de_set_rouge_01.mp3` | Balle de set, côté rouge. |
| `arbitre_balle_de_match_jaune_01.mp3` | Balle de match, côté jaune. |
| `arbitre_balle_de_match_rouge_01.mp3` | Balle de match, côté rouge. |
| `arbitre_premier_set_jaune_01.mp3` | Premier set remporté par le côté jaune. |
| `arbitre_premier_set_rouge_01.mp3` | Premier set remporté par le côté rouge. |
| `arbitre_deuxieme_set_jaune_01.mp3` | Deuxième set remporté par le côté jaune. |
| `arbitre_deuxieme_set_rouge_01.mp3` | Deuxième set remporté par le côté rouge. |
| `arbitre_troisieme_set_jaune_01.mp3` | Troisième set remporté par le côté jaune. |
| `arbitre_troisieme_set_rouge_01.mp3` | Troisième set remporté par le côté rouge. |
| `arbitre_quatrieme_set_jaune_01.mp3` | Quatrième set remporté par le côté jaune. |
| `arbitre_quatrieme_set_rouge_01.mp3` | Quatrième set remporté par le côté rouge. |
| `arbitre_jeu_set_et_match_jaune_01.mp3` | Jeu, set et match, côté jaune. |
| `arbitre_jeu_set_et_match_rouge_01.mp3` | Jeu, set et match, côté rouge. |
| `arbitre_sets_deux_a_zero_01.mp3` | Deux sets à zéro. |
| `arbitre_sets_deux_a_un_01.mp3` | Deux sets à un. |
| `arbitre_sets_trois_a_zero_01.mp3` | Trois sets à zéro. |
| `arbitre_sets_trois_a_un_01.mp3` | Trois sets à un. |
| `arbitre_sets_trois_a_deux_01.mp3` | Trois sets à deux. |
| `arbitre_set_unique_01.mp3` | Set unique. |
| `arbitre_point_decisif_01.mp3` | Point décisif. |
| `arbitre_les_joueurs_sont_prets_01.mp3` | Les joueurs sont prêts. Premier set. |
| `arbitre_troisieme_et_dernier_set_01.mp3` | Troisième et dernier set. |
| `arbitre_silence_01.mp3` | Silence, s'il vous plaît. |
| `arbitre_temps_01.mp3` | Temps. |
| `arbitre_coup_joue_d_office_01.mp3` | Coup joué d'office. |
| `arbitre_temps_mort_jaune_01.mp3` | Temps mort, côté jaune. |
| `arbitre_temps_mort_rouge_01.mp3` | Temps mort, côté rouge. |
| `arbitre_reprise_du_jeu_01.mp3` | Reprise du jeu. |
| `arbitre_reclamation_rejetee_01.mp3` | Réclamation rejetée. |
| `arbitre_reclamation_rejetee_02.mp3` | Réclamation rejetée. Le signe était valide. |
| `arbitre_reclamation_rejetee_03.mp3` | Réclamation rejetée. L'arbitre a vu. |
| `arbitre_poignee_de_main_01.mp3` | Les joueurs se serrent la main. |
| `arbitre_poignee_franche_01.mp3` | Belle poignée de main. |
| `arbitre_poignee_legere_01.mp3` | Poignée de main… discrète. |
| `arbitre_forfait_jaune_01.mp3` | Victoire par forfait, côté jaune. |
| `arbitre_forfait_rouge_01.mp3` | Victoire par forfait, côté rouge. |
| `arbitre_abandon_01.mp3` | Abandon. Le match est terminé. |
| `arbitre_score_un_a_zero_01.mp3` | Un à zéro. |
| `arbitre_score_trois_a_zero_01.mp3` | Trois à zéro. |
| `arbitre_score_trois_a_un_01.mp3` | Trois à un. |
| `arbitre_score_trois_a_deux_01.mp3` | Trois à deux. |
| `arbitre_score_sept_a_zero_01.mp3` | Sept à zéro. |
| `arbitre_score_sept_a_un_01.mp3` | Sept à un. |
| `arbitre_score_sept_a_deux_01.mp3` | Sept à deux. |
| `arbitre_score_sept_a_trois_01.mp3` | Sept à trois. |
| `arbitre_score_sept_a_quatre_01.mp3` | Sept à quatre. |
| `arbitre_score_sept_a_cinq_01.mp3` | Sept à cinq. |
| `arbitre_score_huit_a_six_01.mp3` | Huit à six. |
| `arbitre_score_neuf_a_sept_01.mp3` | Neuf à sept. |
| `arbitre_score_dix_a_huit_01.mp3` | Dix à huit. |
| `arbitre_score_onze_a_zero_01.mp3` | Onze à zéro. |
| `arbitre_score_onze_a_un_01.mp3` | Onze à un. |
| `arbitre_score_onze_a_deux_01.mp3` | Onze à deux. |
| `arbitre_score_onze_a_trois_01.mp3` | Onze à trois. |
| `arbitre_score_onze_a_quatre_01.mp3` | Onze à quatre. |
| `arbitre_score_onze_a_cinq_01.mp3` | Onze à cinq. |
| `arbitre_score_onze_a_six_01.mp3` | Onze à six. |
| `arbitre_score_onze_a_sept_01.mp3` | Onze à sept. |
| `arbitre_score_onze_a_huit_01.mp3` | Onze à huit. |
| `arbitre_score_onze_a_neuf_01.mp3` | Onze à neuf. |
| `arbitre_score_douze_a_dix_01.mp3` | Douze à dix. |
| `arbitre_score_treize_a_onze_01.mp3` | Treize à onze. |
| `arbitre_score_quatorze_a_douze_01.mp3` | Quatorze à douze. |
| `arbitre_score_quinze_a_treize_01.mp3` | Quinze à treize. |
| `arbitre_score_seize_a_quatorze_01.mp3` | Seize à quatorze. |
| `arbitre_score_dix_sept_a_quinze_01.mp3` | Dix-sept à quinze. |
| `arbitre_score_dix_huit_a_seize_01.mp3` | Dix-huit à seize. |
| `arbitre_score_dix_neuf_a_dix_sept_01.mp3` | Dix-neuf à dix-sept. |
| `arbitre_score_vingt_a_dix_huit_01.mp3` | Vingt à dix-huit. |
| `arbitre_partout_six_01.mp3` | Six partout. Deux points d'écart. |
| `arbitre_partout_sept_01.mp3` | Sept partout. Deux points d'écart. |
| `arbitre_partout_huit_01.mp3` | Huit partout. Deux points d'écart. |
| `arbitre_partout_neuf_01.mp3` | Neuf partout. Deux points d'écart. |
| `arbitre_partout_dix_01.mp3` | Dix partout. Deux points d'écart. |
| `arbitre_partout_onze_01.mp3` | Onze partout. Deux points d'écart. |
| `arbitre_partout_douze_01.mp3` | Douze partout. Deux points d'écart. |
| `arbitre_partout_treize_01.mp3` | Treize partout. Deux points d'écart. |
| `arbitre_partout_quatorze_01.mp3` | Quatorze partout. Deux points d'écart. |
| `arbitre_partout_quinze_01.mp3` | Quinze partout. Deux points d'écart. |
| `arbitre_partout_seize_01.mp3` | Seize partout. Deux points d'écart. |
| `arbitre_partout_dix_sept_01.mp3` | Dix-sept partout. Deux points d'écart. |
| `arbitre_partout_dix_huit_01.mp3` | Dix-huit partout. Deux points d'écart. |
| `arbitre_partout_dix_neuf_01.mp3` | Dix-neuf partout. Deux points d'écart. |
| `arbitre_partout_vingt_01.mp3` | Vingt partout. Deux points d'écart. |

## Commentateur — vif, enthousiaste, plein de références (200 répliques)

| Fichier | Texte |
|---|---|
| `commentateur_craquage_01.mp3` | Il est en train de craquer sous la pression ! |
| `commentateur_craquage_01_f.mp3` | Elle est en train de craquer sous la pression ! |
| `commentateur_craquage_02.mp3` | Il avait le set au bout des doigts… et il l'a laissé filer ! |
| `commentateur_craquage_02_f.mp3` | Elle avait le set au bout des doigts… et elle l'a laissé filer ! |
| `commentateur_craquage_03.mp3` | Chute à l'avant ! Il avait le set en poche ! |
| `commentateur_craquage_03_f.mp3` | Chute à l'avant ! Elle avait le set en poche ! |
| `commentateur_craquage_04.mp3` | Coiffé sur le poteau ! |
| `commentateur_craquage_04_f.mp3` | Coiffée sur le poteau ! |
| `commentateur_craquage_05.mp3` | Il enfourche la dernière porte ! |
| `commentateur_craquage_05_f.mp3` | Elle enfourche la dernière porte ! |
| `commentateur_craquage_06.mp3` | J'ai glissé, chef ! |
| `commentateur_craquage_07.mp3` | Il avait le match au bout des doigts… et il l'a laissé filer ! |
| `commentateur_craquage_07_f.mp3` | Elle avait le match au bout des doigts… et elle l'a laissé filer ! |
| `commentateur_craquage_08.mp3` | Chute à l'avant ! Il avait le match en poche ! |
| `commentateur_craquage_08_f.mp3` | Chute à l'avant ! Elle avait le match en poche ! |
| `commentateur_main_legendaire_01.mp3` | La main du siècle ! |
| `commentateur_main_legendaire_02.mp3` | Une main pour l'histoire ! |
| `commentateur_main_legendaire_03.mp3` | La main du destin ! |
| `commentateur_main_legendaire_04.mp3` | Une main qui entre dans la légende ! |
| `commentateur_main_legendaire_05.mp3` | Arrêtez tout ! Nous venons d'assister à un moment d'histoire ! |
| `commentateur_main_legendaire_06.mp3` | On pourra parler de cette main pendant des années ! |
| `commentateur_main_legendaire_07.mp3` | Mesdames et messieurs… quelle main ! |
| `commentateur_main_legendaire_08.mp3` | Dans cinquante ans, on racontera encore cette main ! |
| `commentateur_balle_sauvee_01.mp3` | Sauvée ! Quel sang-froid ! |
| `commentateur_balle_sauvee_02.mp3` | Pas aujourd'hui ! Pas comme ça ! Pas après tout ce que tu as fait… |
| `commentateur_balle_sauvee_03.mp3` | Il refuse de mourir ! Encore en vie ! Toujours en vie ! |
| `commentateur_balle_sauvee_03_f.mp3` | Elle refuse de mourir ! Encore en vie ! Toujours en vie ! |
| `commentateur_balle_sauvee_04_pierre.mp3` | Sauvé par le gong ! Enfin… par la Pierre ! |
| `commentateur_balle_sauvee_04_pierre_f.mp3` | Sauvée par le gong ! Enfin… par la Pierre ! |
| `commentateur_balle_sauvee_04_ciseaux.mp3` | Sauvé par le gong ! Enfin… par les Ciseaux ! |
| `commentateur_balle_sauvee_04_ciseaux_f.mp3` | Sauvée par le gong ! Enfin… par les Ciseaux ! |
| `commentateur_balle_sauvee_04_feuille.mp3` | Sauvé par le gong ! Enfin… par la Feuille ! |
| `commentateur_balle_sauvee_04_feuille_f.mp3` | Sauvée par le gong ! Enfin… par la Feuille ! |
| `commentateur_balle_sauvee_05.mp3` | Il était dans les cordes, et il en sort ! |
| `commentateur_balle_sauvee_05_f.mp3` | Elle était dans les cordes, et elle en sort ! |
| `commentateur_balle_sauvee_06_pierre.mp3` | Parade réflexe ! Il a vu la Pierre arriver ! |
| `commentateur_balle_sauvee_06_pierre_f.mp3` | Parade réflexe ! Elle a vu la Pierre arriver ! |
| `commentateur_balle_sauvee_06_ciseaux.mp3` | Parade réflexe ! Il a vu les Ciseaux arriver ! |
| `commentateur_balle_sauvee_06_ciseaux_f.mp3` | Parade réflexe ! Elle a vu les Ciseaux arriver ! |
| `commentateur_balle_sauvee_06_feuille.mp3` | Parade réflexe ! Il a vu la Feuille arriver ! |
| `commentateur_balle_sauvee_06_feuille_f.mp3` | Parade réflexe ! Elle a vu la Feuille arriver ! |
| `commentateur_balle_sauvee_07.mp3` | Madame, vous n'auriez pas fait mieux ! Enfin… sauf en 1997 ! |
| `commentateur_remontee_01.mp3` | Quelle remontée extraordinaire ! |
| `commentateur_remontee_02.mp3` | On l'avait enterré un peu trop vite ! |
| `commentateur_remontee_02_f.mp3` | On l'avait enterrée un peu trop vite ! |
| `commentateur_remontee_03.mp3` | Le vent a tourné, mesdames et mesdames ! |
| `commentateur_remontee_04.mp3` | De l'enfer au paradis en quelques coups ! |
| `commentateur_remontee_05.mp3` | La cabane est tombée sur le chien ! |
| `commentateur_remontee_06.mp3` | Il a fait l'élastique, et le revoilà dans la roue ! |
| `commentateur_remontee_06_f.mp3` | Elle a fait l'élastique, et la revoilà dans la roue ! |
| `commentateur_remontee_07.mp3` | C'est dingue ! C'est dingue ! |
| `commentateur_serie_pour_01.mp3` | Plus rien ne l'arrête ! |
| `commentateur_serie_pour_02.mp3` | Quatre à la suite ! |
| `commentateur_serie_pour_03.mp3` | Ça déroule, ça déroule ! |
| `commentateur_serie_pour_04.mp3` | Il a mis une mine, ça explose derrière ! |
| `commentateur_serie_pour_04_f.mp3` | Elle a mis une mine, ça explose derrière ! |
| `commentateur_serie_pour_05.mp3` | C'est du Pierre-Feuille-Ciseaux champagne ! |
| `commentateur_serie_pour_06.mp3` | Vers l'infini et au-delà ! |
| `commentateur_serie_pour_07.mp3` | Cours, Forrest, cours ! |
| `commentateur_serie_pour_08.mp3` | Il marche sur son adversaire ! |
| `commentateur_serie_pour_08_f.mp3` | Elle marche sur son adversaire ! |
| `commentateur_serie_pour_09.mp3` | Qui va réussir à l'arrêter ? |
| `commentateur_serie_pour_10.mp3` | La main est chaude ! Très chaude ! |
| `commentateur_serie_contre_01.mp3` | Quelqu'un peut arrêter ça ?! |
| `commentateur_serie_contre_02.mp3` | Il est dans les cordes ! Il faut réagir ! |
| `commentateur_serie_contre_02_f.mp3` | Elle est dans les cordes ! Il faut réagir ! |
| `commentateur_serie_contre_03.mp3` | Allez, petit bonhomme ! |
| `commentateur_serie_contre_03_f.mp3` | Allez, petite bonne femme ! |
| `commentateur_serie_contre_04.mp3` | Oublie que t'as aucune chance, vas-y, fonce ! |
| `commentateur_obstination_01_pierre.mp3` | Troisième Pierre d'affilée ! C'est audacieux ! |
| `commentateur_obstination_01_ciseaux.mp3` | Troisièmes Ciseaux d'affilée ! C'est audacieux ! |
| `commentateur_obstination_01_feuille.mp3` | Troisième Feuille d'affilée ! C'est audacieux ! |
| `commentateur_obstination_02.mp3` | Soit c'est du génie, soit c'est de l'entêtement ! |
| `commentateur_obstination_03_pierre.mp3` | Sa Pierre… son précieux… |
| `commentateur_obstination_03_ciseaux.mp3` | Ses Ciseaux… son précieux… |
| `commentateur_obstination_03_feuille.mp3` | Sa Feuille… son précieux… |
| `commentateur_obstination_04.mp3` | Tous les chemins mènent à la Pierre ! |
| `commentateur_changement_01.mp3` | Le changement, c'est maintenant ! |
| `commentateur_duel_esprits_01.mp3` | Ils se lisent dans les pensées ! |
| `commentateur_duel_esprits_02.mp3` | Télépathie sur le court ! |
| `commentateur_duel_esprits_03.mp3` | Surplace sur la piste ! Personne ne veut lancer le sprint ! |
| `commentateur_duel_esprits_04.mp3` | Coude à coude ! Impossible de les séparer ! |
| `commentateur_duel_esprits_05.mp3` | Cinq égalités ! On n'avait pas vu ça depuis le schisme de la Feuille ! |
| `commentateur_duel_esprits_06.mp3` | Deux mains, zéro vainqueur ! |
| `commentateur_duel_esprits_07.mp3` | Égalité ! Les cerveaux sont connectés ! |
| `commentateur_duel_esprits_08.mp3` | Ils se regardent… et ils recommencent ! |
| `commentateur_duel_esprits_09.mp3` | Égalité parfaite ! La tension monte ! |
| `commentateur_lecture_reussie_01.mp3` | Il l'attendait ! Il l'attendait ! |
| `commentateur_lecture_reussie_01_f.mp3` | Elle l'attendait ! Elle l'attendait ! |
| `commentateur_lecture_reussie_02.mp3` | Pleine lucarne ! Il l'avait lu depuis le vestiaire ! |
| `commentateur_lecture_reussie_02_f.mp3` | Pleine lucarne ! Elle l'avait lu depuis le vestiaire ! |
| `commentateur_lecture_reussie_03_pierre.mp3` | Second poteau, la Pierre ! |
| `commentateur_lecture_reussie_03_ciseaux.mp3` | Second poteau, les Ciseaux ! |
| `commentateur_lecture_reussie_03_feuille.mp3` | Second poteau, la Feuille ! |
| `commentateur_lecture_reussie_04.mp3` | Il vous a compris ! |
| `commentateur_lecture_reussie_04_f.mp3` | Elle vous a compris ! |
| `commentateur_temps_ecoule_01.mp3` | Il a oublié de jouer ! |
| `commentateur_temps_ecoule_01_f.mp3` | Elle a oublié de jouer ! |
| `commentateur_temps_ecoule_02.mp3` | Calé sur la grille de départ ! |
| `commentateur_temps_ecoule_02_f.mp3` | Calée sur la grille de départ ! |
| `commentateur_temps_ecoule_03.mp3` | Faux départ… enfin, pas de départ du tout ! |
| `commentateur_tension_01.mp3` | Silence dans la salle… |
| `commentateur_tension_02.mp3` | Tout un match… pour un seul signe. |
| `commentateur_tension_03.mp3` | Le côté jaune a peur. |
| `commentateur_point_decisif_01.mp3` | Un point. Un seul. Pour tout ! |
| `commentateur_set_ecrasant_01.mp3` | Une leçon ! Une démonstration de force ! |
| `commentateur_set_ecrasant_02.mp3` | Au tapis ! L'arbitre peut compter jusqu'à dix ! |
| `commentateur_set_ecrasant_03.mp3` | Fanny ! Onze à zéro, il va falloir embrasser Fanny ! |
| `commentateur_set_couteau_01.mp3` | Irrespirable ! |
| `commentateur_set_couteau_02.mp3` | Quel set, mesdames et messieurs ! |
| `commentateur_set_couteau_03.mp3` | Photo-finish ! Il faut la photo pour les départager ! |
| `commentateur_set_couteau_04.mp3` | Arrivée au sprint, et ça passe d'un boyau ! |
| `commentateur_resume_set_01.mp3` | Set bouclé, et quelle bataille ! |
| `commentateur_resume_set_02.mp3` | Un set maîtrisé de bout en bout ! |
| `commentateur_resume_set_03.mp3` | Un set partout, tout se jouera maintenant ! |
| `commentateur_resume_set_04.mp3` | Le public retient son souffle avant la suite ! |
| `commentateur_set_decisif_01.mp3` | Set décisif ! Tout se joue maintenant ! |
| `commentateur_set_decisif_02.mp3` | C'est la der des ders ! |
| `commentateur_renversement_01.mp3` | Mené un set à zéro, il renverse tout ! |
| `commentateur_renversement_01_f.mp3` | Menée un set à zéro, elle renverse tout ! |
| `commentateur_renversement_02.mp3` | Le retour du siècle ! |
| `commentateur_renversement_03.mp3` | Il était dans les cordes, c'est l'autre qui finit au tapis ! |
| `commentateur_renversement_03_f.mp3` | Elle était dans les cordes, c'est l'autre qui finit au tapis ! |
| `commentateur_renversement_04.mp3` | Tête-à-queue complet dans ce match ! |
| `commentateur_balle_match_convertie_01_pierre.mp3` | Pieeeeerre ! Pierre ! Pierre ! |
| `commentateur_balle_match_convertie_01_ciseaux.mp3` | Ciseaaaaux ! Ciseaux ! Ciseaux ! |
| `commentateur_balle_match_convertie_01_feuille.mp3` | Feuiiiiille ! Feuille ! Feuille ! |
| `commentateur_balle_match_convertie_02.mp3` | Il franchit la ligne les bras levés ! |
| `commentateur_balle_match_convertie_02_f.mp3` | Elle franchit la ligne les bras levés ! |
| `commentateur_balle_match_convertie_03.mp3` | Après avoir vu ça, on peut aller se coucher tranquille ! |
| `commentateur_balle_match_convertie_04.mp3` | Et un, et deux, et trois sets à zéro ! |
| `commentateur_balle_match_convertie_05.mp3` | Une victoire gravée dans la Pierre ! |
| `commentateur_balle_match_convertie_06.mp3` | Un coup de Pierre, un coup de maître ! |
| `commentateur_balle_match_convertie_07.mp3` | Pierre de taille, victoire de taille ! |
| `commentateur_balle_match_convertie_08.mp3` | Il a jeté la Pierre… et elle a fait mouche ! |
| `commentateur_balle_match_convertie_08_f.mp3` | Elle a jeté la Pierre… et elle a fait mouche ! |
| `commentateur_balle_match_convertie_09.mp3` | C'est du solide ! |
| `commentateur_balle_match_convertie_10.mp3` | Il a tourné la page de son adversaire ! |
| `commentateur_balle_match_convertie_10_f.mp3` | Elle a tourné la page de son adversaire ! |
| `commentateur_balle_match_convertie_11.mp3` | Il a écrit l'histoire… sur une belle Feuille ! |
| `commentateur_balle_match_convertie_11_f.mp3` | Elle a écrit l'histoire… sur une belle Feuille ! |
| `commentateur_balle_match_convertie_12.mp3` | Il vient de découper son adversaire en deux ! |
| `commentateur_balle_match_convertie_12_f.mp3` | Elle vient de découper son adversaire en deux ! |
| `commentateur_balle_match_convertie_13.mp3` | Il a taillé son adversaire en pièces ! |
| `commentateur_balle_match_convertie_13_f.mp3` | Elle a taillé son adversaire en pièces ! |
| `commentateur_balle_match_convertie_14.mp3` | Il a coupé l'herbe sous le pied de son adversaire ! |
| `commentateur_balle_match_convertie_14_f.mp3` | Elle a coupé l'herbe sous le pied de son adversaire ! |
| `commentateur_balle_match_convertie_15.mp3` | Il vient de couper les ponts avec la défaite ! |
| `commentateur_balle_match_convertie_15_f.mp3` | Elle vient de couper les ponts avec la défaite ! |
| `commentateur_balle_match_convertie_16.mp3` | Il a pris les choses en main… et les Ciseaux aussi ! |
| `commentateur_balle_match_convertie_16_f.mp3` | Elle a pris les choses en main… et les Ciseaux aussi ! |
| `commentateur_victoire_01.mp3` | C'est fini ! Quel combat ! |
| `commentateur_victoire_02.mp3` | Il l'a fait ! |
| `commentateur_victoire_02_f.mp3` | Elle l'a fait ! |
| `commentateur_victoire_03.mp3` | Et c'est la délivrance ! |
| `commentateur_victoire_04.mp3` | Un match qui fera date ! |
| `commentateur_victoire_05.mp3` | Bravo aux deux joueurs, quel spectacle ! |
| `commentateur_victoire_06.mp3` | Et c'est gagné ! Quelle démonstration de maîtrise ! |
| `commentateur_victoire_07.mp3` | Il l'a vu venir à trois kilomètres ! |
| `commentateur_victoire_07_f.mp3` | Elle l'a vu venir à trois kilomètres ! |
| `commentateur_victoire_08.mp3` | Quel match ! Quelle audace ! Quel poignet ! |
| `commentateur_victoire_09.mp3` | Une victoire qui ne souffre d'aucune contestation ! |
| `commentateur_victoire_10.mp3` | Il avait la bonne main au bon moment ! |
| `commentateur_victoire_10_f.mp3` | Elle avait la bonne main au bon moment ! |
| `commentateur_victoire_11.mp3` | Masterclass ! |
| `commentateur_victoire_12.mp3` | Ça, c'est du Pierre-Feuille-Ciseaux de très haut niveau ! |
| `commentateur_victoire_13.mp3` | Mesdames et messieurs, quel duel ! |
| `commentateur_victoire_14.mp3` | Ce duel va rester dans les mémoires ! |
| `commentateur_victoire_15.mp3` | Une main en or, une victoire en béton ! |
| `commentateur_victoire_16.mp3` | Une victoire en trois actes : Pierre. Feuille. Ciseaux. Légende. |
| `commentateur_victoire_17.mp3` | Ce n'était pas un simple duel. C'était une bataille pour l'éternité ! |
| `commentateur_victoire_18.mp3` | Il vient peut-être de changer l'histoire du Pierre-Feuille-Ciseaux ! |
| `commentateur_victoire_18_f.mp3` | Elle vient peut-être de changer l'histoire du Pierre-Feuille-Ciseaux ! |
| `commentateur_defaite_01.mp3` | Battu, mais pas abattu ! |
| `commentateur_defaite_01_f.mp3` | Battue, mais pas abattue ! |
| `commentateur_defaite_02.mp3` | Je reviendrai ! Il reviendra ! |
| `commentateur_defaite_02_f.mp3` | Je reviendrai ! Elle reviendra ! |
| `commentateur_defaite_03.mp3` | Il cherche encore où il a perdu la Feuille ! |
| `commentateur_defaite_03_f.mp3` | Elle cherche encore où elle a perdu la Feuille ! |
| `commentateur_humain_01.mp3` | C'est un duel ! Un vrai ! Les yeux dans les yeux ! |
| `commentateur_dialogue_avant_match_01.mp3` | Madame, on sent une tension palpable. |
| `commentateur_dialogue_avant_match_02.mp3` | Deux styles, deux écoles ! |
| `commentateur_dialogue_avant_match_03.mp3` | Un pronostic, Madame ? |
| `commentateur_dialogue_avant_match_04.mp3` | Vous le sentez comment, ce match ? |
| `commentateur_dialogue_avant_match_05.mp3` | Le Pierre, c'est la base, Madame ! |
| `commentateur_dialogue_avant_match_06.mp3` | Bonsoir à tous ! Roland Pignon, en direct du court central, aux côtés de Monique Latouffe ! |
| `commentateur_dialogue_avant_match_07.mp3` | Monique Latouffe, la finale de 1997, les trois Ciseaux… |
| `commentateur_dialogue_fin_set_01.mp3` | Madame, un mot sur ce set ? |
| `commentateur_dialogue_fin_set_02.mp3` | Un set parfait ! Comme vous en 1997, Madame ! |
| `commentateur_dialogue_fin_set_03.mp3` | Qu'est-ce qu'il doit changer ? |
| `commentateur_dialogue_fin_set_03_f.mp3` | Qu'est-ce qu'elle doit changer ? |
| `commentateur_dialogue_fin_set_04.mp3` | Il doit tout changer, Madame ! |
| `commentateur_dialogue_fin_set_04_f.mp3` | Elle doit tout changer, Madame ! |
| `commentateur_dialogue_set_decisif_01.mp3` | Un set pour l'éternité, Madame ! |
| `commentateur_dialogue_serie_01.mp3` | Il est injouable ! Il est… |
| `commentateur_dialogue_serie_01_f.mp3` | Elle est injouable ! Elle est… |
| `commentateur_dialogue_titre_01.mp3` | Madame, c'est historique ! |
| `commentateur_dialogue_fin_match_01.mp3` | Il n'a pas démérité ! |
| `commentateur_dialogue_fin_match_01_f.mp3` | Elle n'a pas démérité ! |
| `commentateur_dialogue_cri_01.mp3` | Ah, il y a de la voix ! |

## Commentatrice — glaciale, cinglante, jamais impressionnée (150 répliques)

| Fichier | Texte |
|---|---|
| `commentatrice_craquage_01.mp3` | Oh… la main a tremblé. |
| `commentatrice_craquage_02.mp3` | Elle était là, cette balle. Juste là. |
| `commentatrice_craquage_03.mp3` | La tête a dit Pierre. Le cœur a dit Feuille. Le cœur a tort, en général. |
| `commentatrice_craquage_04.mp3` | Quand l'enjeu monte, la lucidité s'en va. Chez certains. |
| `commentatrice_craquage_05.mp3` | Un mental de chips. |
| `commentatrice_craquage_06.mp3` | Il a vu la ligne d'arrivée. Et il a freiné. Fascinant. |
| `commentatrice_craquage_06_f.mp3` | Elle a vu la ligne d'arrivée. Et elle a freiné. Fascinant. |
| `commentatrice_craquage_07.mp3` | Il ne faut jamais vendre la Feuille avant de l'avoir jouée. |
| `commentatrice_main_legendaire_01.mp3` | Je note l'heure. Pour les archives. |
| `commentatrice_balle_sauvee_01.mp3` | Glacial. Absolument glacial. J'approuve. |
| `commentatrice_balle_sauvee_02.mp3` | Tout le monde la voyait perdue. Sauf lui. C'est touchant. |
| `commentatrice_balle_sauvee_02_f.mp3` | Tout le monde la voyait perdue. Sauf elle. C'est touchant. |
| `commentatrice_balle_sauvee_03.mp3` | Des nerfs d'acier. Ou aucune conscience du danger. On ne saura jamais. |
| `commentatrice_remontee_01.mp3` | Personne n'y croyait. Lui, si. C'est bien le seul. |
| `commentatrice_remontee_01_f.mp3` | Personne n'y croyait. Elle, si. C'est bien la seule. |
| `commentatrice_remontee_02.mp3` | Ne jamais enterrer un joueur de Pierre. Jamais. |
| `commentatrice_remontee_02_f.mp3` | Ne jamais enterrer une joueuse de Pierre. Jamais. |
| `commentatrice_remontee_03.mp3` | Son adversaire a avalé la trompette. |
| `commentatrice_remontee_04.mp3` | Un match n'est jamais fini. Surtout quand on joue mal. |
| `commentatrice_remontee_05.mp3` | C'est abracadabrantesque. |
| `commentatrice_serie_pour_01.mp3` | Il a trouvé la faille. Il appuie dessus. Enfin quelqu'un de sérieux. |
| `commentatrice_serie_pour_01_f.mp3` | Elle a trouvé la faille. Elle appuie dessus. Enfin quelqu'un de sérieux. |
| `commentatrice_serie_pour_02.mp3` | Il gagne dans un fauteuil. |
| `commentatrice_serie_pour_02_f.mp3` | Elle gagne dans un fauteuil. |
| `commentatrice_serie_pour_03.mp3` | Une démonstration. Je note. |
| `commentatrice_serie_pour_04.mp3` | Il ne joue plus. Il distribue des corrections. |
| `commentatrice_serie_pour_04_f.mp3` | Elle ne joue plus. Elle distribue des corrections. |
| `commentatrice_serie_pour_05.mp3` | Six points d'affilée. Ça devient indécent. |
| `commentatrice_serie_contre_01.mp3` | Ça commence à ressembler à une correction. |
| `commentatrice_serie_contre_02.mp3` | Muscle ton jeu, Robert. |
| `commentatrice_serie_contre_03.mp3` | Jusqu'ici, tout va bien… jusqu'ici. |
| `commentatrice_serie_contre_04.mp3` | Sur un malentendu, ça peut marcher. |
| `commentatrice_serie_contre_05.mp3` | Sa maison brûle, et il regarde ailleurs. |
| `commentatrice_serie_contre_05_f.mp3` | Sa maison brûle, et elle regarde ailleurs. |
| `commentatrice_serie_contre_06.mp3` | Il faudrait peut-être arrêter pour aujourd'hui. |
| `commentatrice_serie_contre_07.mp3` | Son adversaire connaît maintenant son jeu par cœur. |
| `commentatrice_serie_contre_08.mp3` | Une série noire. Absolument magnifique. |
| `commentatrice_serie_contre_09.mp3` | Il faudrait peut-être essayer… autre chose. |
| `commentatrice_serie_contre_10.mp3` | Fidèle à lui-même : toujours du mauvais côté. |
| `commentatrice_serie_contre_10_f.mp3` | Fidèle à elle-même : toujours du mauvais côté. |
| `commentatrice_obstination_01_pierre.mp3` | Encore Pierre. C'est de la provocation. |
| `commentatrice_obstination_01_ciseaux.mp3` | Encore Ciseaux. C'est de la provocation. |
| `commentatrice_obstination_01_feuille.mp3` | Encore Feuille. C'est de la provocation. |
| `commentatrice_obstination_02.mp3` | Culot ou manque d'imagination ? Je penche pour l'imagination. |
| `commentatrice_obstination_03_pierre.mp3` | Il gare le bus devant sa Pierre. |
| `commentatrice_obstination_03_pierre_f.mp3` | Elle gare le bus devant sa Pierre. |
| `commentatrice_obstination_03_ciseaux.mp3` | Il gare le bus devant ses Ciseaux. |
| `commentatrice_obstination_03_ciseaux_f.mp3` | Elle gare le bus devant ses Ciseaux. |
| `commentatrice_obstination_03_feuille.mp3` | Il gare le bus devant sa Feuille. |
| `commentatrice_obstination_03_feuille_f.mp3` | Elle gare le bus devant sa Feuille. |
| `commentatrice_obstination_04_pierre.mp3` | La Pierre, ça ose tout. C'est même à ça qu'on la reconnaît. |
| `commentatrice_obstination_04_ciseaux.mp3` | Les Ciseaux, ça ose tout. C'est même à ça qu'on les reconnaît. |
| `commentatrice_obstination_04_feuille.mp3` | La Feuille, ça ose tout. C'est même à ça qu'on la reconnaît. |
| `commentatrice_obstination_05_pierre.mp3` | C'est une bonne situation, ça, Pierre ? |
| `commentatrice_obstination_05_ciseaux.mp3` | C'est une bonne situation, ça, Ciseaux ? |
| `commentatrice_obstination_05_feuille.mp3` | C'est une bonne situation, ça, Feuille ? |
| `commentatrice_obstination_06.mp3` | Le Mur de Clermont aurait approuvé. Moi, non. |
| `commentatrice_obstination_07.mp3` | C'est de la poudre de perlimpinpin. |
| `commentatrice_obstination_08.mp3` | Quand on veut, on peut. Quand on peut, on choisit Pierre, apparemment. |
| `commentatrice_obstination_09.mp3` | Mieux vaut une Feuille en main que deux Ciseaux dans le pot. C'est sa philosophie. |
| `commentatrice_duel_esprits_01.mp3` | Deux esprits. Une seule idée. Jamais la bonne. |
| `commentatrice_duel_esprits_02.mp3` | On pourrait rester là toute la nuit. Je préférerais éviter. |
| `commentatrice_duel_esprits_03.mp3` | Une partie d'échecs à trois pièces. Sans les échecs. |
| `commentatrice_duel_esprits_04.mp3` | À ce niveau, l'égalité, c'est de la politesse. |
| `commentatrice_duel_esprits_05_pierre.mp3` | Vous n'avez pas le monopole de la Pierre. |
| `commentatrice_duel_esprits_05_ciseaux.mp3` | Vous n'avez pas le monopole des Ciseaux. |
| `commentatrice_duel_esprits_05_feuille.mp3` | Vous n'avez pas le monopole de la Feuille. |
| `commentatrice_duel_esprits_06.mp3` | Laissez du temps au temps. |
| `commentatrice_duel_esprits_07.mp3` | Ennuyeux. |
| `commentatrice_duel_esprits_08.mp3` | Ils ont exactement la même idée. Inquiétant. |
| `commentatrice_duel_esprits_09.mp3` | Personne ne veut prendre de risque aujourd'hui. |
| `commentatrice_duel_esprits_10.mp3` | Encore la même chose. Ça sent le duel interminable. |
| `commentatrice_lecture_subie_01.mp3` | Lu comme un livre ouvert. Un livre court. |
| `commentatrice_lecture_subie_02.mp3` | Trop prévisible. L'adversaire a pris des notes. Moi aussi. |
| `commentatrice_lecture_subie_03.mp3` | Ses tics sont en train de le trahir. |
| `commentatrice_lecture_subie_03_f.mp3` | Ses tics sont en train de la trahir. |
| `commentatrice_lecture_subie_04.mp3` | C'était écrit. En gros caractères. |
| `commentatrice_lecture_reussie_01.mp3` | Coup de maître. |
| `commentatrice_temps_ecoule_01.mp3` | Le chrono ne pardonne pas. Moi non plus. |
| `commentatrice_temps_ecoule_02.mp3` | Trop de réflexion tue la réflexion. |
| `commentatrice_temps_ecoule_03.mp3` | Jouer au hasard, c'est avouer qu'on n'a plus de plan. |
| `commentatrice_temps_ecoule_04.mp3` | L'affaire du chronomètre. On n'en parle pas. |
| `commentatrice_temps_ecoule_05.mp3` | Le ridicule ne tue pas. Heureusement pour lui. |
| `commentatrice_temps_ecoule_05_f.mp3` | Le ridicule ne tue pas. Heureusement pour elle. |
| `commentatrice_tension_01.mp3` | C'est maintenant que les champions se révèlent. Et les autres aussi. |
| `commentatrice_tension_02.mp3` | Pas de Pierre ici. Tout le monde attend la Pierre. |
| `commentatrice_tension_03.mp3` | Pas d'enflammade, pas d'enflammade. |
| `commentatrice_point_decisif_01.mp3` | Ici, pas de deuxième chance. Comme dans la vie. |
| `commentatrice_set_ecrasant_01.mp3` | Sèche correction. |
| `commentatrice_set_ecrasant_02.mp3` | Il n'y a pas eu de match dans ce set. |
| `commentatrice_set_ecrasant_03.mp3` | L'adversaire est resté au vestiaire. Il aurait dû y rester. |
| `commentatrice_set_ecrasant_04.mp3` | Vous êtes le maillon faible. Au revoir ! |
| `commentatrice_set_ecrasant_05.mp3` | Un set à oublier. Je l'ai déjà oublié. |
| `commentatrice_set_ecrasant_06.mp3` | Qu'on m'apporte un café. Et un autre match. |
| `commentatrice_set_couteau_01.mp3` | Arraché. Mérité, on en reparlera. |
| `commentatrice_set_couteau_02.mp3` | Il fallait des nerfs solides pour conclure celui-là. Il y en avait. Juste assez. |
| `commentatrice_set_couteau_03.mp3` | Personne ne méritait de le perdre. L'un des deux l'a quand même perdu. |
| `commentatrice_set_couteau_04.mp3` | La goutte d'eau qui fait déborder la Feuille. |
| `commentatrice_resume_set_01.mp3` | L'un a pris les commandes. À l'autre de réagir. S'il sait comment. |
| `commentatrice_resume_set_02.mp3` | Il faudra changer de plan. Ou en avoir un. |
| `commentatrice_resume_set_03.mp3` | Le rapport de force est clair. Pour l'instant. |
| `commentatrice_set_decisif_01.mp3` | Les statistiques ne servent plus à rien. C'est le caractère qui parle. Quand il y en a. |
| `commentatrice_renversement_01.mp3` | Il a perdu une bataille. Il gagne la guerre. Classique. |
| `commentatrice_renversement_01_f.mp3` | Elle a perdu une bataille. Elle gagne la guerre. Classique. |
| `commentatrice_balle_match_convertie_01.mp3` | Échec et mat. |
| `commentatrice_balle_match_convertie_02.mp3` | Hasta la vista, baby. |
| `commentatrice_balle_match_convertie_03.mp3` | C'est tout. |
| `commentatrice_balle_match_convertie_04.mp3` | La Pierre a parlé. Elle n'a demandé l'avis de personne. |
| `commentatrice_balle_match_convertie_05.mp3` | La Pierre angulaire de la victoire. Évidemment. |
| `commentatrice_balle_match_convertie_06.mp3` | On ne fait pas d'omelette sans casser des Ciseaux. |
| `commentatrice_balle_match_convertie_07.mp3` | Il a tranché la question. |
| `commentatrice_balle_match_convertie_07_f.mp3` | Elle a tranché la question. |
| `commentatrice_balle_match_convertie_08.mp3` | Il a coupé court au suspense. Merci. |
| `commentatrice_balle_match_convertie_08_f.mp3` | Elle a coupé court au suspense. Merci. |
| `commentatrice_balle_match_convertie_09.mp3` | Une victoire taillée sur mesure. |
| `commentatrice_balle_match_convertie_10.mp3` | Une victoire au scalpel. |
| `commentatrice_balle_match_convertie_11.mp3` | Quelle violence… pour une Feuille. |
| `commentatrice_victoire_01.mp3` | Rideau. |
| `commentatrice_victoire_02.mp3` | Mission accomplie. Sans éclat, mais accomplie. |
| `commentatrice_victoire_03.mp3` | Rien à dire. Et je trouve toujours quelque chose à dire. |
| `commentatrice_victoire_04.mp3` | Propre. Net. Sans bavure. |
| `commentatrice_victoire_05.mp3` | On ne reverra peut-être jamais ça. Tant mieux, j'ai eu mon compte. |
| `commentatrice_defaite_01.mp3` | Au revoir. |
| `commentatrice_defaite_02.mp3` | Il faudra revoir ce match. Ou l'oublier. Je conseille l'oubli. |
| `commentatrice_defaite_03.mp3` | On apprend plus d'une défaite. Il a beaucoup appris, ce soir. |
| `commentatrice_defaite_03_f.mp3` | On apprend plus d'une défaite. Elle a beaucoup appris, ce soir. |
| `commentatrice_defaite_04.mp3` | Quelqu'un peut lui expliquer les règles ? |
| `commentatrice_defaite_05.mp3` | C'est officiel : la stratégie n'était pas au rendez-vous. |
| `commentatrice_defaite_06.mp3` | Il va falloir se remettre en question. Ou changer de main. |
| `commentatrice_domination_01.mp3` | Je suis ton père. |
| `commentatrice_poignee_froide_01.mp3` | Glacial. J'approuve. |
| `commentatrice_poignee_contraste_01.mp3` | L'un tend la main. L'autre tend un glaçon. |
| `commentatrice_humain_01.mp3` | Ils se connaissent. Et ça se voit. |
| `commentatrice_humain_02.mp3` | Entre amis, il n'y a pas de pitié. Il n'y a que des signes. |
| `commentatrice_dialogue_avant_match_01.mp3` | On sent surtout deux personnes devant leur téléphone. Mais oui. |
| `commentatrice_dialogue_avant_match_02.mp3` | Trois signes. Il n'y en a jamais eu que trois. |
| `commentatrice_dialogue_avant_match_03.mp3` | Je ne fais pas de pronostic. Je constate. Après. |
| `commentatrice_dialogue_avant_match_04.mp3` | Long. |
| `commentatrice_dialogue_avant_match_05.mp3` | C'est pas faux. |
| `commentatrice_dialogue_avant_match_06.mp3` | Bonsoir. Commençons, Roland. |
| `commentatrice_dialogue_avant_match_07.mp3` | Roland. Le match. |
| `commentatrice_dialogue_fin_set_01.mp3` | Solide. Sans génie. Mais solide. |
| `commentatrice_dialogue_fin_set_02.mp3` | Nous n'en parlerons pas. |
| `commentatrice_dialogue_fin_set_03.mp3` | Tout. Ou rien. C'est ça, le HandSlam. |
| `commentatrice_dialogue_fin_set_04.mp3` | Vaste programme. |
| `commentatrice_dialogue_set_decisif_01.mp3` | Un set pour ce soir. Ce sera déjà bien. |
| `commentatrice_dialogue_serie_01.mp3` | Je vous demande de vous arrêter. |
| `commentatrice_dialogue_titre_01.mp3` | Pas d'enflammade. Pas d'enflammade. |
| `commentatrice_dialogue_fin_match_01.mp3` | Si. Un peu quand même. |
| `commentatrice_dialogue_cri_01.mp3` | On l'avait entendu. |

## Speaker — voix de salle, voyelles étirées (144 répliques)

| Fichier | Texte |
|---|---|
| `speaker_bienvenue_01.mp3` | Mesdaaames et messieuuurs… bienvenue pour ce duel ! |
| `speaker_bienvenue_02.mp3` | Mesdames et messieurs, veuillez regagner vos places. Le match va commencer. |
| `speaker_bienvenue_03.mp3` | Mesdames et messieurs… bonsoir, et bienvenue sur le court central ! |
| `speaker_bienvenue_04.mp3` | Le public est là… les joueurs sont là… il ne manque plus que le premier signe ! |
| `speaker_bienvenue_05.mp3` | Mesdames et messieurs… éteignez vos téléphones. Enfin… pas celui-là. |
| `speaker_bienvenue_06.mp3` | Bienvenue dans le temple du Pierre-Feuille-Ciseaux ! |
| `speaker_bienvenue_07.mp3` | Mesdames et messieurs, faites du bruit pour le prochain duel ! |
| `speaker_bienvenue_08.mp3` | Silence dans les tribunes… les joueurs entrent sur le court. |
| `speaker_revanche_01.mp3` | Ils se sont déjà affrontés… et ils se retrouvent ce soir ! |
| `speaker_revanche_02.mp3` | Le match retour, mesdames et messieurs ! |
| `speaker_revanche_03.mp3` | Une revanche est dans l'air… |
| `speaker_david_goliath_01.mp3` | David… contre Goliath ! |
| `speaker_david_goliath_02.mp3` | Sur le papier, c'est déséquilibré. Mais on ne joue pas sur le papier ! |
| `speaker_coude_a_coude_01.mp3` | Deux joueurs au coude à coude au classement… impossible de faire un pronostic ! |
| `speaker_compatriotes_01.mp3` | Un duel entre compatriotes ! Il n'y aura pas de jaloux. |
| `speaker_nuit_01.mp3` | Il est tard, mesdames et messieurs… mais le Pierre-Feuille-Ciseaux ne dort jamais ! |
| `speaker_nuit_02.mp3` | Bienvenue aux noctambules ! |
| `speaker_matin_01.mp3` | Un duel au lever du soleil ! Les champions se lèvent tôt. |
| `speaker_dimanche_01.mp3` | Le match du dimanche, mesdames et messieurs ! |
| `speaker_partie_rapide_01.mp3` | Deux joueurs… un appariement… et c'est parti ! |
| `speaker_partie_rapide_02.mp3` | Ils ne se connaissaient pas il y a trente secondes. Ils vont s'affronter maintenant ! |
| `speaker_officiel_01.mp3` | Attention : ce match compte pour le classement officiel ! |
| `speaker_officiel_02.mp3` | Des points de niveau sont en jeu ce soir… |
| `speaker_un_set_01.mp3` | Un seul set… aucune seconde chance ! |
| `speaker_marathon_01.mp3` | Trois sets gagnants… installez-vous confortablement, ce sera un marathon ! |
| `speaker_contre_bot_01.mp3` | Un humain… contre la machine ! |
| `speaker_coin_jaune_01.mp3` | Dans le coin jaaaune… |
| `speaker_coin_jaune_02.mp3` | À ma gauche… dans le coin jaaaune… |
| `speaker_coin_jaune_03.mp3` | Côté jaune… accueillez… |
| `speaker_coin_rouge_01.mp3` | Et dans le coin rouuuge… |
| `speaker_coin_rouge_02.mp3` | Et à ma droite… dans le coin rouuuge… |
| `speaker_coin_rouge_03.mp3` | Face à lui… côté rouge… |
| `speaker_coin_rouge_03_f.mp3` | Face à elle… côté rouge… |
| `speaker_debutant_01.mp3` | Pour son tout premier match officiel… |
| `speaker_invaincu_01.mp3` | Invaincu depuis trois rencontres… |
| `speaker_invaincu_01_f.mp3` | Invaincue depuis trois rencontres… |
| `speaker_serie_01.mp3` | Sur une série de victoires impressionnante… |
| `speaker_imprevisible_01.mp3` | On le dit imprévisible. On le dit dangereux… |
| `speaker_imprevisible_01_f.mp3` | On la dit imprévisible. On la dit dangereuse… |
| `speaker_figuration_01.mp3` | Il ne vient pas pour faire de la figuration… |
| `speaker_figuration_01_f.mp3` | Elle ne vient pas pour faire de la figuration… |
| `speaker_trophee_01.mp3` | Il a déjà soulevé un trophée… |
| `speaker_trophee_01_f.mp3` | Elle a déjà soulevé un trophée… |
| `speaker_habitue_01.mp3` | Un habitué des grands rendez-vous… |
| `speaker_laver_affront_01.mp3` | Il revient pour laver l'affront… |
| `speaker_laver_affront_01_f.mp3` | Elle revient pour laver l'affront… |
| `speaker_patron_01.mp3` | Le patron de la soirée… |
| `speaker_faim_01.mp3` | Il a faim de victoire… |
| `speaker_faim_01_f.mp3` | Elle a faim de victoire… |
| `speaker_cloture_01.mp3` | Que le meilleur gagne ! |
| `speaker_cloture_02.mp3` | Que le spectacle commence ! |
| `speaker_cloture_03.mp3` | Joueurs… à vos mains ! |
| `speaker_cloture_04.mp3` | Trois signes… deux joueurs… un seul vainqueur ! |
| `speaker_cloture_05.mp3` | Mesdames et messieurs… que le duel commence ! |
| `speaker_cloture_06.mp3` | Pierre… Feuille… Ciseaux… c'est parti ! |
| `speaker_miroir_01.mp3` | Mesdames et messieurs… ce soir, c'est un duel de jumeaux. |
| `speaker_miroir_02.mp3` | Même surnom… même ambition… un seul vainqueur ! |
| `speaker_miroir_03.mp3` | Deux surnoms identiques. Il n'en restera qu'un. |
| `speaker_huitiemes_01.mp3` | Place aux huitièmes de finale ! |
| `speaker_quarts_01.mp3` | Place aux quarts de finale ! |
| `speaker_demis_01.mp3` | Place aux demi-finales ! |
| `speaker_finale_01.mp3` | Mesdames et messieurs… voici… la finaaale ! |
| `speaker_sit_and_go_01.mp3` | Les portes sont fermées. Le tournoi commence. Un seul sortira vainqueur. |
| `speaker_champion_01.mp3` | Mesdames et messieurs… votre champion ! |
| `speaker_bot_bambi_01.mp3` | Bambi ! |
| `speaker_bot_papyrus_01.mp3` | Papyrus ! |
| `speaker_bot_tictac_01.mp3` | Tic-Tac ! |
| `speaker_bot_rancune_01.mp3` | Rancune ! |
| `speaker_bot_bluffeur_01.mp3` | Le Bluffeur ! |
| `speaker_bot_mante_01.mp3` | La Mante ! |
| `speaker_bot_nemesis_01.mp3` | Némésis ! |
| `speaker_bot_titan_01.mp3` | Titan ! |
| `speaker_bot_rocky_01.mp3` | Rocky ! |
| `speaker_bot_miroir_01.mp3` | Miroir ! |
| `speaker_bot_cyclo_01.mp3` | Cyclo ! |
| `speaker_bot_boomerang_01.mp3` | Boomerang ! |
| `speaker_bot_chaos_01.mp3` | Chaos ! |
| `speaker_bot_stratege_01.mp3` | Stratège ! |
| `speaker_bot_professeur_01.mp3` | Le Professeur ! |
| `speaker_surnom_le_bleu_01.mp3` | Le Bleu… |
| `speaker_surnom_la_recrue_01.mp3` | La Recrue… |
| `speaker_surnom_la_jeune_pousse_01.mp3` | La Jeune Pousse… |
| `speaker_surnom_le_roc_01.mp3` | Le Roc… |
| `speaker_surnom_le_bloc_01.mp3` | Le Bloc… |
| `speaker_surnom_le_granit_01.mp3` | Le Granit… |
| `speaker_surnom_le_menhir_01.mp3` | Le Menhir… |
| `speaker_surnom_le_belier_01.mp3` | Le Bélier… |
| `speaker_surnom_la_lame_01.mp3` | La Lame… |
| `speaker_surnom_le_secateur_01.mp3` | Le Sécateur… |
| `speaker_surnom_le_barbier_01.mp3` | Le Barbier… |
| `speaker_surnom_le_tailleur_01.mp3` | Le Tailleur… |
| `speaker_surnom_la_guillotine_01.mp3` | La Guillotine… |
| `speaker_surnom_le_papetier_01.mp3` | Le Papetier… |
| `speaker_surnom_le_buvard_01.mp3` | Le Buvard… |
| `speaker_surnom_l_enveloppe_01.mp3` | L'Enveloppe… |
| `speaker_surnom_le_parchemin_01.mp3` | Le Parchemin… |
| `speaker_surnom_l_origami_01.mp3` | L'Origami… |
| `speaker_surnom_le_metronome_01.mp3` | Le Métronome… |
| `speaker_surnom_l_horloger_01.mp3` | L'Horloger… |
| `speaker_surnom_le_comptable_01.mp3` | Le Comptable… |
| `speaker_surnom_le_taureau_01.mp3` | Le Taureau… |
| `speaker_surnom_la_mule_01.mp3` | La Mule… |
| `speaker_surnom_le_bulldozer_01.mp3` | Le Bulldozer… |
| `speaker_surnom_le_cameleon_01.mp3` | Le Caméléon… |
| `speaker_surnom_le_joker_01.mp3` | Le Joker… |
| `speaker_surnom_le_fantome_01.mp3` | Le Fantôme… |
| `speaker_surnom_l_enigme_01.mp3` | L'Énigme… |
| `speaker_surnom_le_sphinx_01.mp3` | Le Sphinx… |
| `speaker_surnom_l_ancien_01.mp3` | L'Ancien… |
| `speaker_surnom_le_veteran_01.mp3` | Le Vétéran… |
| `speaker_surnom_de_l_ombre_01.mp3` | de l'ombre… |
| `speaker_surnom_en_devenir_01.mp3` | en devenir… |
| `speaker_surnom_qui_monte_01.mp3` | qui monte… |
| `speaker_surnom_du_grand_nord_01.mp3` | du Grand Nord… |
| `speaker_surnom_du_sud_01.mp3` | du Sud… |
| `speaker_surnom_de_l_etranger_01.mp3` | de l'étranger… |
| `speaker_surnom_du_dimanche_01.mp3` | du dimanche… |
| `speaker_surnom_du_petit_matin_01.mp3` | du petit matin… |
| `speaker_surnom_de_minuit_01.mp3` | de minuit… |
| `speaker_surnom_des_nuits_blanches_01.mp3` | des nuits blanches… |
| `speaker_surnom_du_chronometre_01.mp3` | du chronomètre… |
| `speaker_surnom_des_mains_qui_hesitent_01.mp3` | des mains qui hésitent… |
| `speaker_surnom_des_egalites_01.mp3` | des égalités… |
| `speaker_surnom_du_miroir_01.mp3` | du miroir… |
| `speaker_surnom_des_marathons_01.mp3` | des marathons… |
| `speaker_surnom_de_l_endurance_01.mp3` | de l'endurance… |
| `speaker_surnom_sans_defaite_01.mp3` | sans défaite… |
| `speaker_surnom_des_series_01.mp3` | des séries… |
| `speaker_surnom_du_set_decisif_01.mp3` | du set décisif… |
| `speaker_surnom_du_grand_soir_01.mp3` | du grand soir… |
| `speaker_surnom_des_balles_de_match_01.mp3` | des balles de match… |
| `speaker_surnom_de_la_derniere_chance_01.mp3` | de la dernière chance… |
| `speaker_surnom_de_la_remontada_01.mp3` | de la remontada… |
| `speaker_surnom_qui_ne_meurt_jamais_01.mp3` | qui ne meurt jamais… |
| `speaker_surnom_a_la_main_de_fer_01.mp3` | à la main de fer… |
| `speaker_surnom_sans_pitie_01.mp3` | sans pitié… |
| `speaker_surnom_aux_nerfs_d_acier_01.mp3` | aux nerfs d'acier… |
| `speaker_surnom_au_sang_froid_01.mp3` | au sang-froid… |
| `speaker_surnom_au_regard_de_glace_01.mp3` | au regard de glace… |
| `speaker_surnom_qui_lit_dans_les_pensees_01.mp3` | qui lit dans les pensées… |
| `speaker_surnom_au_troisieme_oeil_01.mp3` | au troisième œil… |
| `speaker_surnom_de_la_fanny_01.mp3` | de la Fanny… |
| `speaker_surnom_des_tournois_01.mp3` | des tournois… |
| `speaker_surnom_au_trophee_01.mp3` | au trophée… |

## Journaliste — après une finale seulement (8 répliques)

| Fichier | Texte |
|---|---|
| `journaliste_question_01.mp3` | Félicitations. Que ressentez-vous ? |
| `journaliste_question_02.mp3` | À quel moment avez-vous senti que le titre était pour vous ? |
| `journaliste_question_03.mp3` | Un mot pour votre adversaire ? |
| `journaliste_question_04.mp3` | On vous a vu jouer beaucoup de signes ce soir. C'était prévu ? |
| `journaliste_question_05.mp3` | Qu'allez-vous faire maintenant ? |
| `journaliste_question_defaite_01.mp3` | Une finale perdue… Que retiendrez-vous de cette soirée ? |
| `journaliste_conclusion_01.mp3` | Merci. Et encore bravo. |
| `journaliste_conclusion_02.mp3` | C'était… un honneur. À vous les studios. |

## Sons du court (5 sons)

Fabriqués par le code en attendant. Un vrai enregistrement portant ce nom les remplace.

| Fichier | Son |
|---|---|
| `public_point_01.mp3` | Applaudissements courts, après chaque point |
| `public_clameur_01.mp3` | Clameur et applaudissements nourris (balle sauvée, remontée…) |
| `public_set_01.mp3` | Applaudissements de fin de set |
| `public_ovation_01.mp3` | Ovation de fin de match |
| `public_fond_01.mp3` | undefined |
| `public_tension_01.mp3` | undefined |
| `public_ooh_01.mp3` | undefined |
