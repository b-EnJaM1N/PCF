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

## Commentateur — vif, enthousiaste, plein de références (426 répliques)

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
| `commentateur_craquage_09.mp3` | Oh non, pas ça ! Pas aujourd'hui ! Pas comme ça ! Pas après tout ce que tu as fait… |
| `commentateur_main_legendaire_01.mp3` | La main du siècle ! |
| `commentateur_main_legendaire_02.mp3` | Une main pour l'histoire ! |
| `commentateur_main_legendaire_03.mp3` | La main du destin ! |
| `commentateur_main_legendaire_04.mp3` | Une main qui entre dans la légende ! |
| `commentateur_main_legendaire_05.mp3` | Arrêtez tout ! Nous venons d'assister à un moment d'histoire ! |
| `commentateur_main_legendaire_06.mp3` | On pourra parler de cette main pendant des années ! |
| `commentateur_main_legendaire_07.mp3` | Mesdames et mesdames… quelle main ! |
| `commentateur_main_legendaire_08.mp3` | Dans cinquante ans, on racontera encore cette main ! |
| `commentateur_balle_sauvee_01.mp3` | Sauvée ! Quel sang-froid ! |
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
| `commentateur_balle_sauvee_08.mp3` | Vous ne passerez pas ! |
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
| `commentateur_serie_contre_04.mp3` | Oublie que t'as aucune chance, vas-y, fonce !! |
| `commentateur_serie_contre_05.mp3` | T'es pas venu ici pour souffrir, ok ? |
| `commentateur_serie_contre_05_f.mp3` | T'es pas venue ici pour souffrir, ok ? |
| `commentateur_serie_contre_06.mp3` | Houston, on a un problème ! |
| `commentateur_obstination_01_pierre.mp3` | Troisième Pierre d'affilée ! C'est audacieux ! |
| `commentateur_obstination_01_ciseaux.mp3` | Troisièmes Ciseaux d'affilée ! C'est audacieux ! |
| `commentateur_obstination_01_feuille.mp3` | Troisième Feuille d'affilée ! C'est audacieux ! |
| `commentateur_obstination_02.mp3` | Soit c'est du génie, soit c'est de l'entêtement ! |
| `commentateur_obstination_03_pierre.mp3` | Sa Pierre… son précieux… |
| `commentateur_obstination_03_ciseaux.mp3` | Ses Ciseaux… son précieux… |
| `commentateur_obstination_03_feuille.mp3` | Sa Feuille… son précieux… |
| `commentateur_obstination_04.mp3` | Tous les chemins mènent à la Pierre ! |
| `commentateur_obstination_05_pierre.mp3` | Des pierres, des pierres, des pierres, des pierres, des pierres ! |
| `commentateur_obstination_05_ciseaux.mp3` | Ciseaux, ciseaux, ciseaux, ciseaux, ciseaux ! |
| `commentateur_obstination_05_feuille.mp3` | Des feuilles, des feuilles, des feuilles, des feuilles, des feuilles ! |
| `commentateur_changement_01.mp3` | Le changement, c'est maintenant ! |
| `commentateur_duel_esprits_01.mp3` | Ils se lisent dans les pensées ! |
| `commentateur_duel_esprits_03.mp3` | Surplace sur la piste ! Personne ne veut lancer le sprint ! |
| `commentateur_duel_esprits_04.mp3` | Coude à coude ! Impossible de les séparer ! |
| `commentateur_duel_esprits_05.mp3` | Cinq égalités ! On n'avait pas vu ça depuis le schisme de la Feuille ! |
| `commentateur_duel_esprits_06.mp3` | Deux mains, zéro vainqueur ! |
| `commentateur_duel_esprits_07.mp3` | Égalité ! Les cerveaux sont connectés ! |
| `commentateur_duel_esprits_08.mp3` | Ils se regardent… et ils recommencent ! |
| `commentateur_duel_esprits_09.mp3` | Égalité parfaite ! La tension monte ! |
| `commentateur_lecture_reussie_01.mp3` | Il l'attendait ! Il l'attendait ! |
| `commentateur_lecture_reussie_01_f.mp3` | Elle l'attendait ! Elle l'attendait ! |
| `commentateur_lecture_reussie_02.mp3` | Pleine lucarne ! |
| `commentateur_lecture_reussie_03_pierre.mp3` | Second poteau, la Pierre ! |
| `commentateur_lecture_reussie_03_ciseaux.mp3` | Second poteau, les Ciseaux ! |
| `commentateur_lecture_reussie_03_feuille.mp3` | Second poteau, la Feuille ! |
| `commentateur_lecture_reussie_04.mp3` | Il vous a compris ! |
| `commentateur_lecture_reussie_04_f.mp3` | Elle vous a compris ! |
| `commentateur_lecture_reussie_05.mp3` | Il est entré dans son cerveau ! |
| `commentateur_lecture_reussie_05_f.mp3` | Elle est entrée dans son cerveau ! |
| `commentateur_temps_ecoule_01.mp3` | Il a oublié de jouer ! |
| `commentateur_temps_ecoule_01_f.mp3` | Elle a oublié de jouer ! |
| `commentateur_temps_ecoule_02.mp3` | Calé sur la grille de départ ! |
| `commentateur_temps_ecoule_02_f.mp3` | Calée sur la grille de départ ! |
| `commentateur_temps_ecoule_03.mp3` | Faux départ… enfin, pas de départ du tout ! |
| `commentateur_tension_01.mp3` | Silence dans la salle… |
| `commentateur_tension_02.mp3` | Tout un match… pour un seul signe. |
| `commentateur_tension_03.mp3` | Le côté jaune a peur. |
| `commentateur_tension_04.mp3` | Un point pour l'Éternité… |
| `commentateur_tension_05.mp3` | Le titre est au bout de ce point… |
| `commentateur_point_decisif_01.mp3` | Un point. Un seul. Pour tout ! |
| `commentateur_point_decisif_02.mp3` | Un point pour entrer dans l'Histoire ! |
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
| `commentateur_set_decisif_03.mp3` | Set décisif, et une place dans l'Histoire en jeu ! |
| `commentateur_renversement_01.mp3` | Mené un set à zéro, il renverse tout ! |
| `commentateur_renversement_01_f.mp3` | Menée un set à zéro, elle renverse tout ! |
| `commentateur_renversement_02.mp3` | Le retour du siècle ! |
| `commentateur_renversement_03.mp3` | Il était dans les cordes, c'est l'autre qui finit au tapis ! |
| `commentateur_renversement_03_f.mp3` | Elle était dans les cordes, c'est l'autre qui finit au tapis ! |
| `commentateur_renversement_04.mp3` | Tête-à-queue complet dans ce match ! |
| `commentateur_renversement_05.mp3` | C'est la remontada ! |
| `commentateur_balle_match_convertie_01_pierre.mp3` | Pieeeeerre ! Pierre ! Pierre ! |
| `commentateur_balle_match_convertie_01_ciseaux.mp3` | Ciseaaaaux ! Ciseaux ! Ciseaux ! |
| `commentateur_balle_match_convertie_01_feuille.mp3` | Feuiiiiille ! Feuille ! Feuille ! |
| `commentateur_balle_match_convertie_02.mp3` | Il franchit la ligne les bras levés ! |
| `commentateur_balle_match_convertie_02_f.mp3` | Elle franchit la ligne les bras levés ! |
| `commentateur_balle_match_convertie_03.mp3` | Après avoir vu ça, on peut dormir tranquille ! |
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
| `commentateur_balle_match_convertie_17_pierre.mp3` | La lumière est venue de la Pierre ! |
| `commentateur_balle_match_convertie_17_ciseaux.mp3` | La lumière est venue des Ciseaux ! |
| `commentateur_balle_match_convertie_17_feuille.mp3` | La lumière est venue de la Feuille ! |
| `commentateur_balle_match_convertie_18.mp3` | Il entre dans la légende ! |
| `commentateur_balle_match_convertie_18_f.mp3` | Elle entre dans la légende ! |
| `commentateur_balle_match_convertie_19.mp3` | Qualifié ! Le tableau tremble ! |
| `commentateur_balle_match_convertie_19_f.mp3` | Qualifiée ! Le tableau tremble ! |
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
| `commentateur_defaite_02.mp3` | Il reviendra ! |
| `commentateur_defaite_02_f.mp3` | Elle reviendra ! |
| `commentateur_defaite_03.mp3` | Il cherche encore où il a perdu la Feuille ! |
| `commentateur_defaite_03_f.mp3` | Elle cherche encore où elle a perdu la Feuille ! |
| `commentateur_humain_01.mp3` | C'est un duel ! Un vrai ! Les yeux dans les yeux ! |
| `commentateur_dialogue_avant_match_01.mp3` | Madame, la tension est palpable. |
| `commentateur_dialogue_avant_match_02.mp3` | Deux styles, deux écoles ! |
| `commentateur_dialogue_avant_match_03.mp3` | Un pronostic, Madame ? |
| `commentateur_dialogue_avant_match_04.mp3` | Vous le sentez comment, ce match ? |
| `commentateur_dialogue_avant_match_05.mp3` | La Pierre, c'est la base, Madame ! |
| `commentateur_dialogue_avant_match_06.mp3` | Bonsoir à tous ! Roland Pignon, en direct du court central, aux côtés de la légendaire Monique Latouffe ! |
| `commentateur_dialogue_avant_match_07.mp3` | Monique Latouffe, la finale de 1997, les trois Ciseaux… |
| `commentateur_dialogue_avant_match_08.mp3` | Monique, votre pronostic pour ce soir ? |
| `commentateur_dialogue_avant_match_09.mp3` | Quelle ambiance, Madame ! Le public est chaud bouillant ! |
| `commentateur_dialogue_avant_match_10.mp3` | On m'annonce un match historique ! |
| `commentateur_dialogue_avant_match_11.mp3` | Trois signes, Madame ! Seulement trois ! Et pourtant, quelle richesse ! |
| `commentateur_dialogue_avant_match_12.mp3` | Vous avez un signe fétiche, Monique ? |
| `commentateur_dialogue_avant_match_13.mp3` | Les deux joueurs se regardent droit dans les yeux… |
| `commentateur_dialogue_avant_match_14.mp3` | Échauffement terminé, les mains sont prêtes ! |
| `commentateur_dialogue_avant_match_15.mp3` | Un conseil pour nos joueurs, Madame ? |
| `commentateur_dialogue_avant_bot_01.mp3` | Un humain contre une machine, Madame ! |
| `commentateur_dialogue_avant_finale_01.mp3` | Une finale, Madame ! Une FINALE ! |
| `commentateur_dialogue_avant_revanche_01.mp3` | Ils se connaissent, ces deux-là ! |
| `commentateur_dialogue_avant_nuit_01.mp3` | Il est tard, Madame, mais le HandSlam ne dort jamais ! |
| `commentateur_dialogue_figure_triple_loop_01.mp3` | UN TRIPLE LOOP ! Trois fois le même signe ! |
| `commentateur_dialogue_figure_triple_loop_02.mp3` | Le triple loop, Madame ! Et réceptionné ! |
| `commentateur_dialogue_figure_double_boucle_01.mp3` | DOUBLE BOUCLE PIQUÉ ! |
| `commentateur_dialogue_figure_double_boucle_02.mp3` | Un double boucle piqué d'une pureté rare ! |
| `commentateur_dialogue_figure_valse_01.mp3` | LA VALSE À TROIS TEMPS ! |
| `commentateur_dialogue_figure_valse_02.mp3` | Trois, puis deux ! La valse, Madame ! |
| `commentateur_dialogue_figure_tour_01.mp3` | LE TOUR DU PROPRIÉTAIRE ! Pierre, Feuille, Ciseaux ! |
| `commentateur_dialogue_figure_tour_02.mp3` | Le tour du propriétaire, exécuté à la perfection ! |
| `commentateur_dialogue_figure_retro_01.mp3` | LE RÉTRO INVERSÉ ! |
| `commentateur_dialogue_figure_retro_02.mp3` | Ciseaux, Feuille, Pierre ! Le rétro inversé ! |
| `commentateur_dialogue_figure_ascenseur_01.mp3` | L'ASCENSEUR ÉMOTIONNEL ! |
| `commentateur_dialogue_figure_ascenseur_02.mp3` | Un aller-retour d'une audace folle ! |
| `commentateur_dialogue_figure_boomerang_01.mp3` | LE BOOMERANG ! Le signe revient ! |
| `commentateur_dialogue_figure_boomerang_02.mp3` | Le boomerang, Madame ! Le signe perdant revient gagner ! |
| `commentateur_dialogue_figure_miroir_01.mp3` | LE MIROIR TOXIQUE ! |
| `commentateur_dialogue_figure_miroir_02.mp3` | Le miroir toxique ! Quelle insolence ! |
| `commentateur_dialogue_figure_marteau_01.mp3` | LE MARTEAU-PIQUEUR ! Encore et encore ! |
| `commentateur_dialogue_figure_marteau_02.mp3` | Quatre fois le même signe ! Le marteau-piqueur ! |
| `commentateur_dialogue_figure_parapluie_01.mp3` | LE COUP DU PARAPLUIE ! |
| `commentateur_dialogue_figure_parapluie_02.mp3` | Trois égalités, puis le coup du parapluie ! |
| `commentateur_dialogue_buse_01.mp3` | Une triple buse inversée ! C'est osé à ce moment-là de la partie ! |
| `commentateur_dialogue_buse_02.mp3` | Attention… une triple buse inversée ! On n'en voit pas tous les jours ! |
| `commentateur_dialogue_avant_entrainement_01.mp3` | Et c'est parti pour un petit entraînement ! |
| `commentateur_dialogue_avant_entrainement_02.mp3` | Pas de pression aujourd'hui… enfin, normalement ! |
| `commentateur_dialogue_avant_entrainement_03.mp3` | Une rencontre qui pourrait déjà révéler de grands talents ! |
| `commentateur_dialogue_avant_entrainement_04.mp3` | Pas de trophée à la clé, mais une belle occasion de progresser ! |
| `commentateur_dialogue_avant_entrainement_05.mp3` | Peut-être le début d'une incroyable carrière ! |
| `commentateur_dialogue_avant_entrainement_06.mp3` | Une rencontre qui pourrait entrer dans l'Histoire ! |
| `commentateur_dialogue_avant_entrainement_07.mp3` | Le public attend beaucoup de cette rencontre ! |
| `commentateur_dialogue_avant_entrainement_08.mp3` | Chaque main compte ! |
| `commentateur_dialogue_avant_entrainement_09.mp3` | L'heure est venue de montrer ce qu'ils ont dans le ventre ! |
| `commentateur_dialogue_avant_entrainement_10.mp3` | Que le spectacle commence ! |
| `commentateur_dialogue_avant_tournoi_premiers_01.mp3` | Le tournoi commence ! |
| `commentateur_dialogue_avant_tournoi_premiers_02.mp3` | Première étape vers la gloire ! |
| `commentateur_dialogue_avant_tournoi_premiers_03.mp3` | Première bataille ! |
| `commentateur_dialogue_avant_tournoi_premiers_04.mp3` | Ils veulent marquer les esprits dès le premier tour ! |
| `commentateur_dialogue_avant_tournoi_premiers_05.mp3` | Aujourd'hui peut naître une légende ! |
| `commentateur_dialogue_avant_tournoi_premiers_06.mp3` | Il faut entrer dans ce tournoi avec panache ! |
| `commentateur_dialogue_avant_tournoi_premiers_07.mp3` | Chaque victoire nous rapproche du titre ! |
| `commentateur_dialogue_avant_tournoi_premiers_08.mp3` | Le public veut du spectacle ! |
| `commentateur_dialogue_avant_tournoi_quarts_01.mp3` | ET NOUS Y VOILÀ ! Les quarts de finale ! |
| `commentateur_dialogue_avant_tournoi_quarts_02.mp3` | Une victoire et les demi-finales sont à portée de main ! |
| `commentateur_dialogue_avant_tournoi_quarts_03.mp3` | Le moindre geste peut tout changer ! |
| `commentateur_dialogue_avant_tournoi_quarts_04.mp3` | La tension monte ! |
| `commentateur_dialogue_avant_tournoi_quarts_05.mp3` | Ils ne sont plus qu'à deux victoires du titre ! |
| `commentateur_dialogue_avant_tournoi_quarts_06.mp3` | Nous entrons dans une nouvelle dimension ! |
| `commentateur_dialogue_avant_tournoi_quarts_07.mp3` | Le tournoi prend une toute autre dimension ! |
| `commentateur_dialogue_avant_tournoi_quarts_08.mp3` | Le moment est venu de sortir les grandes armes ! |
| `commentateur_dialogue_avant_tournoi_demis_01.mp3` | UNE SEULE VICTOIRE LES SÉPARE DE LA FINALE ! |
| `commentateur_dialogue_avant_tournoi_demis_02.mp3` | Ils touchent au but ! |
| `commentateur_dialogue_avant_tournoi_demis_03.mp3` | Le titre commence à se rapprocher ! |
| `commentateur_dialogue_avant_tournoi_demis_04.mp3` | La tension est absolument incroyable ! |
| `commentateur_dialogue_avant_tournoi_demis_05.mp3` | Ce match pourrait entrer dans les mémoires ! |
| `commentateur_dialogue_avant_tournoi_demis_06.mp3` | Ils jouent pour une place en finale ! |
| `commentateur_dialogue_avant_tournoi_demis_07.mp3` | Le rêve est à portée de main ! |
| `commentateur_dialogue_avant_tournoi_demis_08.mp3` | Nous sommes à deux doigts de vivre un moment exceptionnel ! |
| `commentateur_dialogue_avant_tournoi_finale_01.mp3` | MESDAMES ET MESSIEURS… LA FINALE ! |
| `commentateur_dialogue_avant_tournoi_finale_02.mp3` | Deux joueurs ! Une victoire ! Un champion ! |
| `commentateur_dialogue_avant_tournoi_finale_03.mp3` | La gloire est à portée de main ! |
| `commentateur_dialogue_avant_tournoi_finale_04.mp3` | Il n'en restera qu'un ! |
| `commentateur_dialogue_avant_tournoi_finale_05.mp3` | Le destin se joue maintenant ! |
| `commentateur_dialogue_avant_tournoi_finale_06.mp3` | Ils vont entrer dans la légende ! |
| `commentateur_dialogue_avant_majeur_quarts_01.mp3` | MESDAMES ET MESSIEURS, LE MONDE DU HANDSLAM RETIENT SON SOUFFLE ! |
| `commentateur_dialogue_avant_majeur_quarts_02.mp3` | NOUS ENTRONS DANS UNE AUTRE DIMENSION ! |
| `commentateur_dialogue_avant_majeur_quarts_03.mp3` | CHAQUE MAIN PEUT CHANGER LE DESTIN DE CE TOURNOI ! |
| `commentateur_dialogue_avant_majeur_quarts_04.mp3` | LE NIVEAU EST EXCEPTIONNEL ! |
| `commentateur_dialogue_avant_majeur_quarts_05.mp3` | NOUS ASSISTONS À UN MOMENT HISTORIQUE ! |
| `commentateur_dialogue_avant_majeur_quarts_06.mp3` | LA PRESSION EST MONUMENTALE ! |
| `commentateur_dialogue_avant_majeur_quarts_07.mp3` | LE MOINDRE FAUX PAS SERA FATAL ! |
| `commentateur_dialogue_avant_majeur_quarts_08.mp3` | LES QUARTS DE FINALE D'UN TOURNOI LÉGENDAIRE ! |
| `commentateur_dialogue_avant_majeur_demis_01.mp3` | C'EST HISTORIQUE ! |
| `commentateur_dialogue_avant_majeur_demis_02.mp3` | LE DESTIN EST EN TRAIN DE S'ÉCRIRE SOUS NOS YEUX ! |
| `commentateur_dialogue_avant_majeur_demis_03.mp3` | UNE SEULE VICTOIRE AVANT LA FINALE ! |
| `commentateur_dialogue_avant_majeur_demis_04.mp3` | L'HISTOIRE ATTEND SON HÉROS ! |
| `commentateur_dialogue_avant_majeur_demis_05.mp3` | LA PRESSION EST INSOUTENABLE ! |
| `commentateur_dialogue_avant_majeur_demis_06.mp3` | NOUS SOMMES À UNE MAIN DU SOMMET ! |
| `commentateur_dialogue_avant_majeur_finale_01.mp3` | MESDAMES ET MESSIEURS… LE MOMENT QUE L'HUMANITÉ ATTENDAIT ! |
| `commentateur_dialogue_avant_majeur_finale_02.mp3` | L'ULTIME COMBAT ! |
| `commentateur_dialogue_avant_majeur_finale_03.mp3` | DEUX CHAMPIONS ! UNE COURONNE ! UNE DESTINÉE ! |
| `commentateur_dialogue_avant_majeur_finale_04.mp3` | LE MONDE DU HANDSLAM EST SUSPENDU À CETTE MAIN ! |
| `commentateur_dialogue_avant_majeur_finale_05.mp3` | CE SOIR, UN JOUEUR DEVIENDRA UNE LÉGENDE ! |
| `commentateur_dialogue_avant_majeur_finale_06.mp3` | ILS NE JOUENT PLUS POUR LA GLOIRE… ILS JOUENT POUR L'ÉTERNITÉ ! |
| `commentateur_dialogue_avant_majeur_finale_07.mp3` | LA MAIN DU DESTIN VA S'ABATTRE ! |
| `commentateur_dialogue_avant_majeur_finale_08.mp3` | NOUS Y SOMMES ! LE SOMMET ABSOLU DU HANDSLAM ! |
| `commentateur_dialogue_avant_majeur_finale_09.mp3` | QUE LE PLUS GRAND GAGNE ! |
| `commentateur_dialogue_avant_majeur_finale_10.mp3` | L'HISTOIRE VA S'ÉCRIRE ! |
| `commentateur_dialogue_apres_entrainement_victoire_01.mp3` | Et voilà ! Une victoire pour commencer ! |
| `commentateur_dialogue_apres_entrainement_victoire_02.mp3` | Quelle démonstration ! |
| `commentateur_dialogue_apres_entrainement_victoire_03.mp3` | Une victoire qui va donner énormément de confiance ! |
| `commentateur_dialogue_apres_entrainement_victoire_04.mp3` | Magnifique prestation ! |
| `commentateur_dialogue_apres_entrainement_victoire_05.mp3` | Quel talent ! |
| `commentateur_dialogue_apres_entrainement_victoire_06.mp3` | Ils ont envoyé un message ! |
| `commentateur_dialogue_apres_entrainement_victoire_07.mp3` | Une victoire qui restera dans les mémoires ! |
| `commentateur_dialogue_apres_entrainement_victoire_08.mp3` | Quelle entrée en matière ! |
| `commentateur_dialogue_apres_entrainement_defaite_01.mp3` | Et quelle défaite ! |
| `commentateur_dialogue_apres_entrainement_defaite_02.mp3` | Il va falloir travailler après cette contre-performance ! |
| `commentateur_dialogue_apres_tournoi_premiers_victoire_01.mp3` | ET C'EST UNE VICTOIRE ! |
| `commentateur_dialogue_apres_tournoi_premiers_victoire_02.mp3` | Quelle entrée fracassante dans ce tournoi ! |
| `commentateur_dialogue_apres_tournoi_premiers_victoire_03.mp3` | Le message est envoyé à toute la concurrence ! |
| `commentateur_dialogue_apres_tournoi_premiers_victoire_04.mp3` | Une victoire parfaitement maîtrisée ! |
| `commentateur_dialogue_apres_tournoi_premiers_victoire_05.mp3` | Le voilà lancé vers le titre ! |
| `commentateur_dialogue_apres_tournoi_premiers_victoire_05_f.mp3` | La voilà lancée vers le titre ! |
| `commentateur_dialogue_apres_tournoi_premiers_victoire_06.mp3` | Quelle démonstration ! |
| `commentateur_dialogue_apres_tournoi_premiers_defaite_01.mp3` | Une défaite dès le premier tour ! Quel coup de tonnerre ! |
| `commentateur_dialogue_apres_tournoi_premiers_defaite_02.mp3` | C'est déjà terminé ! |
| `commentateur_dialogue_apres_tournoi_premiers_defaite_03.mp3` | Quel dommage ! |
| `commentateur_dialogue_apres_tournoi_premiers_defaite_04.mp3` | Une élimination terrible ! |
| `commentateur_dialogue_apres_tournoi_quarts_victoire_01.mp3` | IL EST EN DEMI-FINALE ! |
| `commentateur_dialogue_apres_tournoi_quarts_victoire_01_f.mp3` | ELLE EST EN DEMI-FINALE ! |
| `commentateur_dialogue_apres_tournoi_quarts_victoire_02.mp3` | Quelle bataille incroyable ! |
| `commentateur_dialogue_apres_tournoi_quarts_victoire_03.mp3` | Il n'est plus qu'à une victoire de la finale ! |
| `commentateur_dialogue_apres_tournoi_quarts_victoire_03_f.mp3` | Elle n'est plus qu'à une victoire de la finale ! |
| `commentateur_dialogue_apres_tournoi_quarts_victoire_04.mp3` | Quel sang-froid exceptionnel ! |
| `commentateur_dialogue_apres_tournoi_quarts_victoire_05.mp3` | Une victoire qui pourrait tout changer ! |
| `commentateur_dialogue_apres_tournoi_quarts_victoire_06.mp3` | Il vient de franchir un obstacle monumental ! |
| `commentateur_dialogue_apres_tournoi_quarts_victoire_06_f.mp3` | Elle vient de franchir un obstacle monumental ! |
| `commentateur_dialogue_apres_tournoi_quarts_defaite_01.mp3` | Quelle terrible élimination en quarts ! |
| `commentateur_dialogue_apres_tournoi_quarts_defaite_02.mp3` | Le rêve s'arrête ici ! |
| `commentateur_dialogue_apres_tournoi_quarts_defaite_03.mp3` | Il était si proche ! |
| `commentateur_dialogue_apres_tournoi_quarts_defaite_03_f.mp3` | Elle était si proche ! |
| `commentateur_dialogue_apres_tournoi_quarts_defaite_04.mp3` | Une énorme désillusion ! |
| `commentateur_dialogue_apres_tournoi_demis_victoire_01.mp3` | IL EST EN FINALE ! |
| `commentateur_dialogue_apres_tournoi_demis_victoire_01_f.mp3` | ELLE EST EN FINALE ! |
| `commentateur_dialogue_apres_tournoi_demis_victoire_02.mp3` | QUEL EXPLOIT ! |
| `commentateur_dialogue_apres_tournoi_demis_victoire_03.mp3` | Il touche le titre du bout des doigts ! |
| `commentateur_dialogue_apres_tournoi_demis_victoire_03_f.mp3` | Elle touche le titre du bout des doigts ! |
| `commentateur_dialogue_apres_tournoi_demis_victoire_04.mp3` | Quelle maîtrise dans ce moment décisif ! |
| `commentateur_dialogue_apres_tournoi_demis_victoire_05.mp3` | Il vient de renverser le tournoi ! |
| `commentateur_dialogue_apres_tournoi_demis_victoire_05_f.mp3` | Elle vient de renverser le tournoi ! |
| `commentateur_dialogue_apres_tournoi_demis_victoire_06.mp3` | LE RÊVE CONTINUE ! |
| `commentateur_dialogue_apres_tournoi_demis_defaite_01.mp3` | Quelle terrible défaite ! |
| `commentateur_dialogue_apres_tournoi_demis_defaite_02.mp3` | Le rêve s'effondre ! |
| `commentateur_dialogue_apres_tournoi_demis_defaite_03.mp3` | Si près du but ! |
| `commentateur_dialogue_apres_tournoi_demis_defaite_04.mp3` | Une élimination cruelle ! |
| `commentateur_dialogue_apres_tournoi_finale_victoire_01.mp3` | IL EST CHAMPION ! |
| `commentateur_dialogue_apres_tournoi_finale_victoire_01_f.mp3` | ELLE EST CHAMPIONNE ! |
| `commentateur_dialogue_apres_tournoi_finale_victoire_02.mp3` | QUEL TRIOMPHE ! |
| `commentateur_dialogue_apres_tournoi_finale_victoire_03.mp3` | IL ENTRE DANS LA LÉGENDE ! |
| `commentateur_dialogue_apres_tournoi_finale_victoire_03_f.mp3` | ELLE ENTRE DANS LA LÉGENDE ! |
| `commentateur_dialogue_apres_tournoi_finale_victoire_04.mp3` | UNE VICTOIRE POUR L'ÉTERNITÉ ! |
| `commentateur_dialogue_apres_tournoi_finale_victoire_05.mp3` | QUELLE FINALE ! QUEL CHAMPION ! |
| `commentateur_dialogue_apres_tournoi_finale_victoire_05_f.mp3` | QUELLE FINALE ! QUELLE CHAMPIONNE ! |
| `commentateur_dialogue_apres_tournoi_finale_victoire_06.mp3` | LE TROPHÉE EST À LUI ! |
| `commentateur_dialogue_apres_tournoi_finale_victoire_06_f.mp3` | LE TROPHÉE EST À ELLE ! |
| `commentateur_dialogue_apres_tournoi_finale_defaite_01.mp3` | Quel terrible dénouement ! |
| `commentateur_dialogue_apres_tournoi_finale_defaite_02.mp3` | Il était si proche de la gloire ! |
| `commentateur_dialogue_apres_tournoi_finale_defaite_02_f.mp3` | Elle était si proche de la gloire ! |
| `commentateur_dialogue_apres_tournoi_finale_defaite_03.mp3` | Le rêve s'écroule au dernier moment ! |
| `commentateur_dialogue_apres_tournoi_finale_defaite_04.mp3` | Quelle désillusion ! |
| `commentateur_dialogue_apres_majeur_quarts_victoire_01.mp3` | IL VIENT DE RÉALISER UN EXPLOIT MAJEUR ! |
| `commentateur_dialogue_apres_majeur_quarts_victoire_01_f.mp3` | ELLE VIENT DE RÉALISER UN EXPLOIT MAJEUR ! |
| `commentateur_dialogue_apres_majeur_quarts_victoire_02.mp3` | QUELLE PERFORMANCE EXCEPTIONNELLE ! |
| `commentateur_dialogue_apres_majeur_quarts_victoire_03.mp3` | IL EST DÉSORMAIS À DEUX MATCHS DE L'IMMORTALITÉ ! |
| `commentateur_dialogue_apres_majeur_quarts_victoire_03_f.mp3` | ELLE EST DÉSORMAIS À DEUX MATCHS DE L'IMMORTALITÉ ! |
| `commentateur_dialogue_apres_majeur_quarts_victoire_04.mp3` | LE PUBLIC EST EN DÉLIRE ! |
| `commentateur_dialogue_apres_majeur_quarts_victoire_05.mp3` | CETTE VICTOIRE VA RESTER DANS L'HISTOIRE ! |
| `commentateur_dialogue_apres_majeur_quarts_defaite_01.mp3` | QUELLE ÉLIMINATION ! LE TOURNOI EST TERMINÉ ! |
| `commentateur_dialogue_apres_majeur_quarts_defaite_02.mp3` | LE RÊVE S'ARRÊTE BRUTALEMENT ! |
| `commentateur_dialogue_apres_majeur_quarts_defaite_03.mp3` | QUELLE TERRIBLE DÉSILLUSION ! |
| `commentateur_dialogue_apres_majeur_demis_victoire_01.mp3` | IL EST EN FINALE D'UN TOURNOI MAJEUR ! |
| `commentateur_dialogue_apres_majeur_demis_victoire_01_f.mp3` | ELLE EST EN FINALE D'UN TOURNOI MAJEUR ! |
| `commentateur_dialogue_apres_majeur_demis_victoire_02.mp3` | IL VIENT D'ÉCRIRE UNE PAGE DE L'HISTOIRE DU HANDSLAM ! |
| `commentateur_dialogue_apres_majeur_demis_victoire_02_f.mp3` | ELLE VIENT D'ÉCRIRE UNE PAGE DE L'HISTOIRE DU HANDSLAM ! |
| `commentateur_dialogue_apres_majeur_demis_victoire_03.mp3` | QUEL EXPLOIT ABSOLUMENT EXTRAORDINAIRE ! |
| `commentateur_dialogue_apres_majeur_demis_victoire_04.mp3` | IL N'EST PLUS QU'À UNE VICTOIRE DE LA GLOIRE ÉTERNELLE ! |
| `commentateur_dialogue_apres_majeur_demis_victoire_04_f.mp3` | ELLE N'EST PLUS QU'À UNE VICTOIRE DE LA GLOIRE ÉTERNELLE ! |
| `commentateur_dialogue_apres_majeur_demis_victoire_05.mp3` | IL A SURVÉCU À UNE DEMI-FINALE DANTESQUE ! |
| `commentateur_dialogue_apres_majeur_demis_victoire_05_f.mp3` | ELLE A SURVÉCU À UNE DEMI-FINALE DANTESQUE ! |
| `commentateur_dialogue_apres_majeur_demis_defaite_01.mp3` | QUELLE DÉFAITE ! LE RÊVE EST BRISÉ ! |
| `commentateur_dialogue_apres_majeur_demis_defaite_02.mp3` | IL ÉTAIT À UNE SEULE VICTOIRE DE LA FINALE ! |
| `commentateur_dialogue_apres_majeur_demis_defaite_02_f.mp3` | ELLE ÉTAIT À UNE SEULE VICTOIRE DE LA FINALE ! |
| `commentateur_dialogue_apres_majeur_demis_defaite_03.mp3` | UNE ÉLIMINATION TERRIBLEMENT CRUELLE ! |
| `commentateur_dialogue_apres_majeur_finale_victoire_01.mp3` | IL EST CHAMPION ! CHAMPION DU MONDE DU HANDSLAM ! |
| `commentateur_dialogue_apres_majeur_finale_victoire_01_f.mp3` | ELLE EST CHAMPIONNE ! CHAMPIONNE DU MONDE DU HANDSLAM ! |
| `commentateur_dialogue_apres_majeur_finale_victoire_02.mp3` | IL VIENT D'ENTRER DANS LA LÉGENDE ! |
| `commentateur_dialogue_apres_majeur_finale_victoire_02_f.mp3` | ELLE VIENT D'ENTRER DANS LA LÉGENDE ! |
| `commentateur_dialogue_apres_majeur_finale_victoire_03.mp3` | QUEL TRIOMPHE ! QUELLE PERFORMANCE ! QUEL CHAMPION ! |
| `commentateur_dialogue_apres_majeur_finale_victoire_03_f.mp3` | QUEL TRIOMPHE ! QUELLE PERFORMANCE ! QUELLE CHAMPIONNE ! |
| `commentateur_dialogue_apres_majeur_finale_victoire_04.mp3` | LA MAIN DU DESTIN A PARLÉ ! |
| `commentateur_dialogue_apres_majeur_finale_victoire_05.mp3` | IL A ÉCRIT L'HISTOIRE SOUS NOS YEUX ! |
| `commentateur_dialogue_apres_majeur_finale_victoire_05_f.mp3` | ELLE A ÉCRIT L'HISTOIRE SOUS NOS YEUX ! |
| `commentateur_dialogue_apres_majeur_finale_victoire_06.mp3` | UNE VICTOIRE POUR L'ÉTERNITÉ ! |
| `commentateur_dialogue_apres_majeur_finale_victoire_07.mp3` | LE PUBLIC EST EN FUSION ! LE HANDSLAM EST EN FÊTE ! |
| `commentateur_dialogue_apres_majeur_finale_victoire_08.mp3` | QUELLE SOIRÉE HISTORIQUE ! |
| `commentateur_dialogue_apres_majeur_finale_defaite_01.mp3` | QUELLE DÉFAITE ! QUELLE DÉSILLUSION ! |
| `commentateur_dialogue_apres_majeur_finale_defaite_02.mp3` | IL ÉTAIT À UNE MAIN DU SACRE ! |
| `commentateur_dialogue_apres_majeur_finale_defaite_02_f.mp3` | ELLE ÉTAIT À UNE MAIN DU SACRE ! |
| `commentateur_dialogue_apres_majeur_finale_defaite_03.mp3` | LE TROPHÉE LUI ÉCHAPPE AU DERNIER MOMENT ! |
| `commentateur_dialogue_apres_majeur_finale_defaite_04.mp3` | UNE FIN TERRIBLE POUR UN PARCOURS EXCEPTIONNEL ! |
| `commentateur_dialogue_apres_majeur_finale_defaite_05.mp3` | LE MONDE DU HANDSLAM EST EN DEUIL ! |
| `commentateur_dialogue_apres_majeur_finale_defaite_06.mp3` | IL TOUCHAIT DU DOIGT L'IMMORTALITÉ ! |
| `commentateur_dialogue_apres_majeur_finale_defaite_06_f.mp3` | ELLE TOUCHAIT DU DOIGT L'IMMORTALITÉ ! |
| `commentateur_dialogue_fin_set_01.mp3` | Madame, un mot sur ce set ? |
| `commentateur_dialogue_fin_set_02.mp3` | Un set parfait ! Comme vous en 1997, Madame ! |
| `commentateur_dialogue_fin_set_03.mp3` | Qu'est-ce qu'il doit changer ? |
| `commentateur_dialogue_fin_set_03_f.mp3` | Qu'est-ce qu'elle doit changer ? |
| `commentateur_dialogue_fin_set_04.mp3` | Il doit tout changer, Madame ! |
| `commentateur_dialogue_fin_set_04_f.mp3` | Elle doit tout changer, Madame ! |
| `commentateur_dialogue_set_decisif_01.mp3` | Un set pour l'éternité, Madame ! |
| `commentateur_dialogue_titre_01.mp3` | Madame, c'est historique ! |
| `commentateur_dialogue_fin_match_01.mp3` | Il n'a pas démérité ! |
| `commentateur_dialogue_fin_match_01_f.mp3` | Elle n'a pas démérité ! |
| `commentateur_dialogue_cri_01.mp3` | Ah, il y a de la voix ! |
| `commentateur_dialogue_cri_02.mp3` | Il a craqué son slip ! |
| `commentateur_dialogue_cri_02_f.mp3` | Elle a craqué son slip ! |
| `commentateur_dialogue_cri_03.mp3` | Il éructe de joie ! |
| `commentateur_dialogue_cri_03_f.mp3` | Elle éructe de joie ! |
| `commentateur_dialogue_cri_04.mp3` | Siuuuu ! |

## Commentatrice — glaciale, cinglante, jamais impressionnée (369 répliques)

| Fichier | Texte |
|---|---|
| `commentatrice_craquage_01.mp3` | Oh… la main a tremblé. |
| `commentatrice_craquage_02.mp3` | Elle était là, cette balle. Juste là. |
| `commentatrice_craquage_03.mp3` | La tête a dit Pierre. Le cœur a dit Feuille. Le cœur a tort, en général. |
| `commentatrice_craquage_04.mp3` | Quand l'enjeu monte, la lucidité s'en va. Chez certains. |
| `commentatrice_craquage_05.mp3` | Quel mental de chips. |
| `commentatrice_craquage_06.mp3` | Il a vu la ligne d'arrivée. Et il a freiné. Fascinant. |
| `commentatrice_craquage_06_f.mp3` | Elle a vu la ligne d'arrivée. Et elle a freiné. Fascinant. |
| `commentatrice_craquage_07.mp3` | Il ne faut jamais vendre la Feuille avant de l'avoir jouée. |
| `commentatrice_main_legendaire_01.mp3` | Je note l'heure. Pour les archives. |
| `commentatrice_main_legendaire_02.mp3` | Dinguerie ! Comme disent les jeunes. |
| `commentatrice_main_legendaire_03.mp3` | C'est un vrai banger. Comme disent les jeunes. |
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
| `commentatrice_serie_contre_02.mp3` | Muscle ton jeu, Robert. Muscle ton jeu. |
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
| `commentatrice_serie_contre_11.mp3` | Les calculs sont pas bons, Kevin. |
| `commentatrice_serie_contre_12.mp3` | Il est en PLS. Comme disent les jeunes. |
| `commentatrice_serie_contre_12_f.mp3` | Elle est en PLS. Comme disent les jeunes. |
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
| `commentatrice_obstination_10.mp3` | Allô ? Non mais allô, quoi ! |
| `commentatrice_duel_esprits_01.mp3` | Deux esprits. Une seule idée. Jamais la bonne. |
| `commentatrice_duel_esprits_02.mp3` | On pourrait rester là toute la nuit. Je préférerais éviter. |
| `commentatrice_duel_esprits_03.mp3` | Une partie d'échecs à trois pièces. Sans les échecs. |
| `commentatrice_duel_esprits_05_pierre.mp3` | Il n'a pas le monopole de la Pierre. |
| `commentatrice_duel_esprits_05_pierre_f.mp3` | Elle n'a pas le monopole de la Pierre. |
| `commentatrice_duel_esprits_05_ciseaux.mp3` | Il n'a pas le monopole des Ciseaux. |
| `commentatrice_duel_esprits_05_ciseaux_f.mp3` | Elle n'a pas le monopole des Ciseaux. |
| `commentatrice_duel_esprits_05_feuille.mp3` | Il n'a pas le monopole de la Feuille. |
| `commentatrice_duel_esprits_05_feuille_f.mp3` | Elle n'a pas le monopole de la Feuille. |
| `commentatrice_duel_esprits_06.mp3` | Laissez du temps au temps. |
| `commentatrice_duel_esprits_07.mp3` | Ennuyeux. |
| `commentatrice_duel_esprits_08.mp3` | Ils ont exactement la même idée. Inquiétant. |
| `commentatrice_duel_esprits_09.mp3` | Personne ne veut prendre de risque aujourd'hui. |
| `commentatrice_duel_esprits_10.mp3` | Encore la même chose. Ça sent le duel interminable. |
| `commentatrice_lecture_subie_01.mp3` | Lu comme un livre ouvert. |
| `commentatrice_lecture_subie_02.mp3` | Trop prévisible. |
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
| `commentatrice_tension_04.mp3` | Toute une carrière pour ce point. Aucune pression. |
| `commentatrice_point_decisif_01.mp3` | Ici, pas de deuxième chance. Comme dans la vie. |
| `commentatrice_set_ecrasant_01.mp3` | Sèche correction. |
| `commentatrice_set_ecrasant_02.mp3` | Il n'y a pas eu de match dans ce set. |
| `commentatrice_set_ecrasant_03.mp3` | Il aurait dû rester au vestiaire. |
| `commentatrice_set_ecrasant_04.mp3` | Vous êtes le maillon faible. Au revoir ! |
| `commentatrice_set_ecrasant_05.mp3` | Un set à oublier. Je l'ai déjà oublié. |
| `commentatrice_set_ecrasant_06.mp3` | Qu'on m'apporte un café. Et un autre match. |
| `commentatrice_set_ecrasant_07.mp3` | Bref. Il a perdu le set. |
| `commentatrice_set_ecrasant_07_f.mp3` | Bref. Elle a perdu le set. |
| `commentatrice_set_couteau_01.mp3` | Arraché. Mérité, on en reparlera. |
| `commentatrice_set_couteau_02.mp3` | Il fallait des nerfs solides pour conclure celui-là. Il y en avait. Juste assez. |
| `commentatrice_set_couteau_03.mp3` | Personne ne méritait de le perdre. L'un des deux l'a quand même perdu. |
| `commentatrice_set_couteau_04.mp3` | La goutte d'eau qui fait déborder la Feuille. |
| `commentatrice_resume_set_01.mp3` | L'un a pris les commandes. À l'autre de réagir. S'il sait comment. |
| `commentatrice_resume_set_02.mp3` | Il faudra changer de plan. Ou en avoir un. |
| `commentatrice_resume_set_03.mp3` | Le rapport de force est clair. Pour l'instant. |
| `commentatrice_set_decisif_01.mp3` | Les statistiques ne servent plus à rien. C'est le caractère qui parle. Quand il y en a. |
| `commentatrice_set_decisif_02.mp3` | Un set pour un titre. Je reste calme. Pour deux. |
| `commentatrice_set_decisif_03.mp3` | Winter is coming. |
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
| `commentatrice_balle_match_convertie_12.mp3` | Un tour de plus. Ne nous emballons pas. |
| `commentatrice_balle_match_convertie_13.mp3` | Un titre. Enfin quelque chose à accrocher au frigo. |
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
| `commentatrice_defaite_07.mp3` | La sentence est irrévocable. |
| `commentatrice_defaite_08.mp3` | Il a le seum. Comme disent les jeunes. |
| `commentatrice_defaite_08_f.mp3` | Elle a le seum. Comme disent les jeunes. |
| `commentatrice_domination_01.mp3` | Je suis ton père. |
| `commentatrice_huees_01.mp3` | Je vous demande de vous arrêter. |
| `commentatrice_humain_01.mp3` | Ils se connaissent. Et ça se voit. |
| `commentatrice_humain_02.mp3` | Entre amis, il n'y a pas de pitié. |
| `commentatrice_dialogue_avant_match_01.mp3` | On sent surtout deux personnes devant leur téléphone. Mais oui. |
| `commentatrice_dialogue_avant_match_02.mp3` | Trois signes. Il n'y en a jamais eu que trois. |
| `commentatrice_dialogue_avant_match_03.mp3` | Je ne fais pas de pronostic. Je constate… après. |
| `commentatrice_dialogue_avant_match_04.mp3` | Long. Très long… |
| `commentatrice_dialogue_avant_match_05.mp3` | C'est pas faux. |
| `commentatrice_dialogue_avant_match_06.mp3` | Bonsoir. Commençons, Roland. |
| `commentatrice_dialogue_avant_match_07.mp3` | Roland. Le match. |
| `commentatrice_dialogue_avant_match_08.mp3` | Je pronostique un vainqueur. Et un perdant. |
| `commentatrice_dialogue_avant_match_09.mp3` | Le public, c'est vous et moi, Roland. |
| `commentatrice_dialogue_avant_match_10.mp3` | On vous l'annonce à chaque match. |
| `commentatrice_dialogue_avant_match_11.mp3` | Trois. Je les ai comptés. |
| `commentatrice_dialogue_avant_match_12.mp3` | Oui. Je ne le dirai jamais. |
| `commentatrice_dialogue_avant_match_13.mp3` | Ils regardent leur téléphone, Roland. |
| `commentatrice_dialogue_avant_match_14.mp3` | On s'échauffe les mains, maintenant. On aura tout vu. |
| `commentatrice_dialogue_avant_match_15.mp3` | Ne jouez pas Pierre. Ou jouez Pierre. Je ne sais plus. |
| `commentatrice_dialogue_avant_bot_01.mp3` | La machine a l'air plus détendue. |
| `commentatrice_dialogue_avant_finale_01.mp3` | J'avais entendu la première fois. |
| `commentatrice_dialogue_avant_revanche_01.mp3` | Oui. Et ils ne s'aiment pas beaucoup. |
| `commentatrice_dialogue_avant_nuit_01.mp3` | Moi si. Normalement. |
| `commentatrice_dialogue_figure_triple_loop_01.mp3` | Trois fois la même idée. On appelle ça de l'entêtement. |
| `commentatrice_dialogue_figure_triple_loop_02.mp3` | Oui. Un geste typique de l'école lyonnaise. |
| `commentatrice_dialogue_figure_double_boucle_01.mp3` | Un changement d'avis. Rien de plus. |
| `commentatrice_dialogue_figure_double_boucle_02.mp3` | Un pur produit de l'école hongroise. Très propre. |
| `commentatrice_dialogue_figure_valse_01.mp3` | La fin était à deux temps. Il faudra revoir le solfège. |
| `commentatrice_dialogue_figure_valse_02.mp3` | Un classique de l'école viennoise. Évidemment. |
| `commentatrice_dialogue_figure_tour_01.mp3` | Les trois signes, dans l'ordre. Ça s'appelle compter. |
| `commentatrice_dialogue_figure_tour_02.mp3` | Une marque de fabrique de l'école suisse. Ponctuelle. |
| `commentatrice_dialogue_figure_retro_01.mp3` | Ça existe, ça ? |
| `commentatrice_dialogue_figure_retro_02.mp3` | Très prisé à l'école finlandaise. Ils jouent tout à l'envers, là-bas. |
| `commentatrice_dialogue_figure_ascenseur_01.mp3` | Aller, retour. Rez-de-chaussée. |
| `commentatrice_dialogue_figure_ascenseur_02.mp3` | Typique de l'école de Tourcoing. On y revient toujours. |
| `commentatrice_dialogue_figure_boomerang_01.mp3` | Comme les mauvaises idées. Sauf que celle-là marche. |
| `commentatrice_dialogue_figure_boomerang_02.mp3` | Un héritage de l'école australienne. Forcément. |
| `commentatrice_dialogue_figure_miroir_01.mp3` | Copier son adversaire. À l'école, on appelle ça tricher. |
| `commentatrice_dialogue_figure_miroir_02.mp3` | Une spécialité de l'école vénitienne. Les miroirs, c'est leur affaire. |
| `commentatrice_dialogue_figure_marteau_01.mp3` | Les voisins vont se plaindre. |
| `commentatrice_dialogue_figure_marteau_02.mp3` | Un pur produit de l'école soviétique des années 80. Rien ne bouge, tout cogne. |
| `commentatrice_dialogue_figure_parapluie_01.mp3` | Après l'orage, forcément. |
| `commentatrice_dialogue_figure_parapluie_02.mp3` | Très britannique. L'école de Cambridge, sans aucun doute. |
| `commentatrice_dialogue_buse_01.mp3` | C'est surtout inconscient. |
| `commentatrice_dialogue_buse_02.mp3` | Heureusement. |
| `commentatrice_dialogue_avant_entrainement_01.mp3` | Exactement. Un entraînement. Vous pouvez respirer, Roland. |
| `commentatrice_dialogue_avant_entrainement_02.mp3` | Voilà. Essayez de vous en souvenir. |
| `commentatrice_dialogue_avant_entrainement_03.mp3` | Ou simplement deux joueurs qui s'entraînent. |
| `commentatrice_dialogue_avant_entrainement_04.mp3` | C'est à ça que servent les entraînements. |
| `commentatrice_dialogue_avant_entrainement_05.mp3` | Ou la fin d'un très mauvais échauffement. |
| `commentatrice_dialogue_avant_entrainement_06.mp3` | Roland… c'est un entraînement. |
| `commentatrice_dialogue_avant_entrainement_07.mp3` | Le public attend surtout que ça commence. |
| `commentatrice_dialogue_avant_entrainement_08.mp3` | Pas vraiment. Il n'y a rien à gagner. |
| `commentatrice_dialogue_avant_entrainement_09.mp3` | Pour l'instant, qu'ils montrent déjà ce qu'ils ont dans la main. |
| `commentatrice_dialogue_avant_entrainement_10.mp3` | Doucement. C'est un entraînement. |
| `commentatrice_dialogue_avant_tournoi_premiers_01.mp3` | Oui. Et il va falloir commencer par gagner ce match. |
| `commentatrice_dialogue_avant_tournoi_premiers_02.mp3` | Première étape vers le tour suivant, surtout. |
| `commentatrice_dialogue_avant_tournoi_premiers_03.mp3` | C'est un premier tour, Roland. |
| `commentatrice_dialogue_avant_tournoi_premiers_04.mp3` | Ils pourraient déjà commencer par marquer un point. |
| `commentatrice_dialogue_avant_tournoi_premiers_05.mp3` | Aujourd'hui peut surtout commencer un tournoi. |
| `commentatrice_dialogue_avant_tournoi_premiers_06.mp3` | Avec efficacité, ce serait déjà pas mal. |
| `commentatrice_dialogue_avant_tournoi_premiers_07.mp3` | C'est généralement comme ça que fonctionnent les tournois. |
| `commentatrice_dialogue_avant_tournoi_premiers_08.mp3` | Les joueurs veulent surtout éviter l'élimination. |
| `commentatrice_dialogue_avant_tournoi_quarts_01.mp3` | Voilà surtout les choses sérieuses. |
| `commentatrice_dialogue_avant_tournoi_quarts_02.mp3` | Une défaite et ils sont à portée de sortie. |
| `commentatrice_dialogue_avant_tournoi_quarts_03.mp3` | C'est généralement le principe du Pierre-Feuille-Ciseaux. |
| `commentatrice_dialogue_avant_tournoi_quarts_04.mp3` | Chez vous surtout. |
| `commentatrice_dialogue_avant_tournoi_quarts_05.mp3` | Et à une défaite de rentrer chez eux. |
| `commentatrice_dialogue_avant_tournoi_quarts_06.mp3` | Nous entrons surtout en quart de finale. |
| `commentatrice_dialogue_avant_tournoi_quarts_07.mp3` | Oui. Maintenant, il faut vraiment savoir jouer. |
| `commentatrice_dialogue_avant_tournoi_quarts_08.mp3` | Trois signes suffiront largement. |
| `commentatrice_dialogue_avant_tournoi_demis_01.mp3` | Et une seule défaite les en sépare aussi. |
| `commentatrice_dialogue_avant_tournoi_demis_02.mp3` | Pas encore. Ils sont en demi-finale. |
| `commentatrice_dialogue_avant_tournoi_demis_03.mp3` | Il faudra encore le gagner. |
| `commentatrice_dialogue_avant_tournoi_demis_04.mp3` | Vous êtes absolument incroyable, surtout. |
| `commentatrice_dialogue_avant_tournoi_demis_05.mp3` | Ou être oublié demain matin. |
| `commentatrice_dialogue_avant_tournoi_demis_06.mp3` | Enfin une information intéressante. |
| `commentatrice_dialogue_avant_tournoi_demis_07.mp3` | La victoire aussi. Il faut juste choisir la bonne. |
| `commentatrice_dialogue_avant_tournoi_demis_08.mp3` | À condition qu'ils jouent exceptionnellement bien. |
| `commentatrice_dialogue_avant_tournoi_finale_01.mp3` | Oui Roland. Enfin. |
| `commentatrice_dialogue_avant_tournoi_finale_02.mp3` | Pour une fois, vous avez réussi à compter correctement. |
| `commentatrice_dialogue_avant_tournoi_finale_03.mp3` | Encore faut-il avoir la bonne main. |
| `commentatrice_dialogue_avant_tournoi_finale_04.mp3` | C'est effectivement le principe d'une finale. |
| `commentatrice_dialogue_avant_tournoi_finale_05.mp3` | Non. La partie se joue maintenant. |
| `commentatrice_dialogue_avant_tournoi_finale_06.mp3` | Ils vont surtout essayer de gagner. |
| `commentatrice_dialogue_avant_majeur_quarts_01.mp3` | Vous pourriez déjà retenir le vôtre. |
| `commentatrice_dialogue_avant_majeur_quarts_02.mp3` | C'est toujours la même table, Roland. |
| `commentatrice_dialogue_avant_majeur_quarts_03.mp3` | Oui. C'est justement pour ça qu'il faut bien la jouer. |
| `commentatrice_dialogue_avant_majeur_quarts_04.mp3` | Il est surtout meilleur que celui des premiers tours. |
| `commentatrice_dialogue_avant_majeur_quarts_05.mp3` | Vous dites ça depuis le début du tournoi. |
| `commentatrice_dialogue_avant_majeur_quarts_06.mp3` | Pour les joueurs, peut-être. |
| `commentatrice_dialogue_avant_majeur_quarts_07.mp3` | Ça, au moins, c'est vrai. |
| `commentatrice_dialogue_avant_majeur_quarts_08.mp3` | Pour l'instant, c'est surtout un quart de finale. |
| `commentatrice_dialogue_avant_majeur_demis_01.mp3` | Vous l'avez déjà dit. |
| `commentatrice_dialogue_avant_majeur_demis_02.mp3` | Avec une pierre, une feuille et des ciseaux. Restons mesurés. |
| `commentatrice_dialogue_avant_majeur_demis_03.mp3` | Et c'est celle qui compte maintenant. |
| `commentatrice_dialogue_avant_majeur_demis_04.mp3` | L'histoire attend surtout le vainqueur. |
| `commentatrice_dialogue_avant_majeur_demis_05.mp3` | Alors arrêtez de la supporter à leur place. |
| `commentatrice_dialogue_avant_majeur_demis_06.mp3` | Une mauvaise main, et ils en seront à une victoire de moins. |
| `commentatrice_dialogue_avant_majeur_finale_01.mp3` | Je ne savais pas que l'humanité avait été consultée. |
| `commentatrice_dialogue_avant_majeur_finale_02.mp3` | C'est une finale, Roland. Pas une guerre. |
| `commentatrice_dialogue_avant_majeur_finale_03.mp3` | Et trois signes possibles. N'oubliez pas l'essentiel. |
| `commentatrice_dialogue_avant_majeur_finale_04.mp3` | Le monde du HandSlam, peut-être. Moi, j'attends surtout de voir le choix. |
| `commentatrice_dialogue_avant_majeur_finale_05.mp3` | Il peut déjà commencer par devenir champion. |
| `commentatrice_dialogue_avant_majeur_finale_06.mp3` | Ils jouent surtout pour gagner cette finale. |
| `commentatrice_dialogue_avant_majeur_finale_07.mp3` | C'est généralement comme ça qu'on appelle une main quand on veut faire peur aux gens. |
| `commentatrice_dialogue_avant_majeur_finale_08.mp3` | Oui. Et maintenant, taisez-vous deux secondes. |
| `commentatrice_dialogue_avant_majeur_finale_09.mp3` | Non. Que le meilleur gagne. La taille n'a rien à voir là-dedans. |
| `commentatrice_dialogue_avant_majeur_finale_10.mp3` | Elle s'écrira surtout dans le classement. |
| `commentatrice_dialogue_apres_entrainement_victoire_01.mp3` | Un entraînement réussi, surtout. |
| `commentatrice_dialogue_apres_entrainement_victoire_02.mp3` | C'était un entraînement, Roland. |
| `commentatrice_dialogue_apres_entrainement_victoire_03.mp3` | Ou pas. Il n'y avait rien à perdre. |
| `commentatrice_dialogue_apres_entrainement_victoire_04.mp3` | Correcte. |
| `commentatrice_dialogue_apres_entrainement_victoire_05.mp3` | Il faudra confirmer quand il y aura quelque chose à gagner. |
| `commentatrice_dialogue_apres_entrainement_victoire_06.mp3` | À leur adversaire d'entraînement, surtout. |
| `commentatrice_dialogue_apres_entrainement_victoire_07.mp3` | Pas longtemps. |
| `commentatrice_dialogue_apres_entrainement_victoire_08.mp3` | C'était une sortie d'entraînement, surtout. |
| `commentatrice_dialogue_apres_entrainement_defaite_01.mp3` | Justement. C'est à ça que servent les entraînements. |
| `commentatrice_dialogue_apres_entrainement_defaite_02.mp3` | Voilà enfin quelque chose de sensé. |
| `commentatrice_dialogue_apres_tournoi_premiers_victoire_01.mp3` | Premier tour validé. |
| `commentatrice_dialogue_apres_tournoi_premiers_victoire_02.mp3` | Il a gagné son premier match. |
| `commentatrice_dialogue_apres_tournoi_premiers_victoire_02_f.mp3` | Elle a gagné son premier match. |
| `commentatrice_dialogue_apres_tournoi_premiers_victoire_03.mp3` | La concurrence n'a probablement pas tremblé. |
| `commentatrice_dialogue_apres_tournoi_premiers_victoire_04.mp3` | Suffisamment maîtrisée pour passer au tour suivant. |
| `commentatrice_dialogue_apres_tournoi_premiers_victoire_05.mp3` | Il lui reste quelques matchs avant ça. |
| `commentatrice_dialogue_apres_tournoi_premiers_victoire_06.mp3` | Démonstration est un grand mot. |
| `commentatrice_dialogue_apres_tournoi_premiers_defaite_01.mp3` | Pas vraiment. Il a perdu. Ça arrive. |
| `commentatrice_dialogue_apres_tournoi_premiers_defaite_01_f.mp3` | Pas vraiment. Elle a perdu. Ça arrive. |
| `commentatrice_dialogue_apres_tournoi_premiers_defaite_02.mp3` | Pour lui, oui. Pour le tournoi, non. |
| `commentatrice_dialogue_apres_tournoi_premiers_defaite_02_f.mp3` | Pour elle, oui. Pour le tournoi, non. |
| `commentatrice_dialogue_apres_tournoi_premiers_defaite_03.mp3` | Il faudra faire mieux au prochain tournoi. |
| `commentatrice_dialogue_apres_tournoi_premiers_defaite_04.mp3` | Terrible, non. Décevante, oui. |
| `commentatrice_dialogue_apres_tournoi_quarts_victoire_01.mp3` | Oui. Il a gagné son quart. |
| `commentatrice_dialogue_apres_tournoi_quarts_victoire_01_f.mp3` | Oui. Elle a gagné son quart. |
| `commentatrice_dialogue_apres_tournoi_quarts_victoire_02.mp3` | Serrée, surtout. |
| `commentatrice_dialogue_apres_tournoi_quarts_victoire_03.mp3` | Et c'est la prochaine qu'il doit gagner. |
| `commentatrice_dialogue_apres_tournoi_quarts_victoire_03_f.mp3` | Et c'est la prochaine qu'elle doit gagner. |
| `commentatrice_dialogue_apres_tournoi_quarts_victoire_04.mp3` | Il a fait ce qu'il fallait. |
| `commentatrice_dialogue_apres_tournoi_quarts_victoire_04_f.mp3` | Elle a fait ce qu'il fallait. |
| `commentatrice_dialogue_apres_tournoi_quarts_victoire_05.mp3` | Elle change surtout le prochain adversaire. |
| `commentatrice_dialogue_apres_tournoi_quarts_victoire_06.mp3` | Un quart de finale, Roland. |
| `commentatrice_dialogue_apres_tournoi_quarts_defaite_01.mp3` | Il était à une victoire de la demi-finale. Il n'a pas réussi. |
| `commentatrice_dialogue_apres_tournoi_quarts_defaite_01_f.mp3` | Elle était à une victoire de la demi-finale. Elle n'a pas réussi. |
| `commentatrice_dialogue_apres_tournoi_quarts_defaite_02.mp3` | Pour aujourd'hui, oui. |
| `commentatrice_dialogue_apres_tournoi_quarts_defaite_03.mp3` | Pas assez proche pour gagner. |
| `commentatrice_dialogue_apres_tournoi_quarts_defaite_04.mp3` | Une défaite en quart. Ça fait partie du sport. |
| `commentatrice_dialogue_apres_tournoi_demis_victoire_01.mp3` | Et maintenant, il va falloir la gagner. |
| `commentatrice_dialogue_apres_tournoi_demis_victoire_02.mp3` | Une très bonne victoire, oui. |
| `commentatrice_dialogue_apres_tournoi_demis_victoire_03.mp3` | Attention à ne pas le toucher trop tôt. |
| `commentatrice_dialogue_apres_tournoi_demis_victoire_04.mp3` | C'est exactement ce qu'on attend d'un joueur à ce niveau. |
| `commentatrice_dialogue_apres_tournoi_demis_victoire_05.mp3` | Il vient surtout de gagner sa demi-finale. |
| `commentatrice_dialogue_apres_tournoi_demis_victoire_05_f.mp3` | Elle vient surtout de gagner sa demi-finale. |
| `commentatrice_dialogue_apres_tournoi_demis_victoire_06.mp3` | Pour encore un match. |
| `commentatrice_dialogue_apres_tournoi_demis_defaite_01.mp3` | Il était à une victoire de la finale. C'est forcément décevant. |
| `commentatrice_dialogue_apres_tournoi_demis_defaite_01_f.mp3` | Elle était à une victoire de la finale. C'est forcément décevant. |
| `commentatrice_dialogue_apres_tournoi_demis_defaite_02.mp3` | Il faudra se relever. |
| `commentatrice_dialogue_apres_tournoi_demis_defaite_03.mp3` | Et pourtant si loin. |
| `commentatrice_dialogue_apres_tournoi_demis_defaite_04.mp3` | Les demi-finales ne pardonnent pas. |
| `commentatrice_dialogue_apres_tournoi_finale_victoire_01.mp3` | Oui. Cette fois, vous pouvez vous emballer. |
| `commentatrice_dialogue_apres_tournoi_finale_victoire_02.mp3` | Une victoire méritée. |
| `commentatrice_dialogue_apres_tournoi_finale_victoire_03.mp3` | Il vient surtout de gagner le tournoi. |
| `commentatrice_dialogue_apres_tournoi_finale_victoire_03_f.mp3` | Elle vient surtout de gagner le tournoi. |
| `commentatrice_dialogue_apres_tournoi_finale_victoire_04.mp3` | Pour le classement, déjà. |
| `commentatrice_dialogue_apres_tournoi_finale_victoire_05.mp3` | Il a fait ce qu'il fallait au bon moment. |
| `commentatrice_dialogue_apres_tournoi_finale_victoire_05_f.mp3` | Elle a fait ce qu'il fallait au bon moment. |
| `commentatrice_dialogue_apres_tournoi_finale_victoire_06.mp3` | Et personne ne pourra le lui enlever. |
| `commentatrice_dialogue_apres_tournoi_finale_defaite_01.mp3` | Une finale perdue, ça fait toujours mal. |
| `commentatrice_dialogue_apres_tournoi_finale_defaite_02.mp3` | Et son adversaire était plus proche encore. |
| `commentatrice_dialogue_apres_tournoi_finale_defaite_03.mp3` | C'est précisément pour ça qu'on joue les finales. |
| `commentatrice_dialogue_apres_tournoi_finale_defaite_04.mp3` | Oui. Mais deuxième d'un tournoi, ce n'est pas exactement une catastrophe. |
| `commentatrice_dialogue_apres_majeur_quarts_victoire_01.mp3` | Une victoire en quart. C'est important, oui. |
| `commentatrice_dialogue_apres_majeur_quarts_victoire_02.mp3` | Il a été solide. |
| `commentatrice_dialogue_apres_majeur_quarts_victoire_02_f.mp3` | Elle a été solide. |
| `commentatrice_dialogue_apres_majeur_quarts_victoire_03.mp3` | À deux victoires du titre, surtout. |
| `commentatrice_dialogue_apres_majeur_quarts_victoire_04.mp3` | Et lui peut commencer à respirer. |
| `commentatrice_dialogue_apres_majeur_quarts_victoire_04_f.mp3` | Et elle peut commencer à respirer. |
| `commentatrice_dialogue_apres_majeur_quarts_victoire_05.mp3` | Peut-être. Gagnons déjà le prochain. |
| `commentatrice_dialogue_apres_majeur_quarts_defaite_01.mp3` | Oui. Mais il atteint quand même les quarts d'un gros tournoi. |
| `commentatrice_dialogue_apres_majeur_quarts_defaite_01_f.mp3` | Oui. Mais elle atteint quand même les quarts d'un gros tournoi. |
| `commentatrice_dialogue_apres_majeur_quarts_defaite_02.mp3` | Il s'arrête en quart. Ce n'est pas rien. |
| `commentatrice_dialogue_apres_majeur_quarts_defaite_02_f.mp3` | Elle s'arrête en quart. Ce n'est pas rien. |
| `commentatrice_dialogue_apres_majeur_quarts_defaite_03.mp3` | Il a perdu contre un meilleur joueur aujourd'hui. |
| `commentatrice_dialogue_apres_majeur_quarts_defaite_03_f.mp3` | Elle a perdu contre un meilleur joueur aujourd'hui. |
| `commentatrice_dialogue_apres_majeur_demis_victoire_01.mp3` | Et là, oui, c'est une vraie performance. |
| `commentatrice_dialogue_apres_majeur_demis_victoire_02.mp3` | Une belle page. Mais le livre n'est pas terminé. |
| `commentatrice_dialogue_apres_majeur_demis_victoire_03.mp3` | C'était très solide. |
| `commentatrice_dialogue_apres_majeur_demis_victoire_04.mp3` | Une victoire, oui. Éternelle, on verra. |
| `commentatrice_dialogue_apres_majeur_demis_victoire_05.mp3` | Il a gagné. C'est le principal. |
| `commentatrice_dialogue_apres_majeur_demis_victoire_05_f.mp3` | Elle a gagné. C'est le principal. |
| `commentatrice_dialogue_apres_majeur_demis_defaite_01.mp3` | Il perd en demi-finale d'un gros tournoi. Ça reste une très belle performance. |
| `commentatrice_dialogue_apres_majeur_demis_defaite_01_f.mp3` | Elle perd en demi-finale d'un gros tournoi. Ça reste une très belle performance. |
| `commentatrice_dialogue_apres_majeur_demis_defaite_02.mp3` | Et son adversaire aussi. |
| `commentatrice_dialogue_apres_majeur_demis_defaite_03.mp3` | Cruelle, oui. Mais pas injuste. |
| `commentatrice_dialogue_apres_majeur_finale_victoire_01.mp3` | Là, Roland… vous pouvez crier. |
| `commentatrice_dialogue_apres_majeur_finale_victoire_02.mp3` | Aujourd'hui, oui. Il l'a mérité. |
| `commentatrice_dialogue_apres_majeur_finale_victoire_02_f.mp3` | Aujourd'hui, oui. Elle l'a mérité. |
| `commentatrice_dialogue_apres_majeur_finale_victoire_03.mp3` | Une finale parfaitement maîtrisée. |
| `commentatrice_dialogue_apres_majeur_finale_victoire_04.mp3` | Non. Sa main a simplement été meilleure. |
| `commentatrice_dialogue_apres_majeur_finale_victoire_05.mp3` | Et cette fois, je suis d'accord avec vous. |
| `commentatrice_dialogue_apres_majeur_finale_victoire_06.mp3` | Une victoire qui restera longtemps, oui. |
| `commentatrice_dialogue_apres_majeur_finale_victoire_07.mp3` | Et il peut profiter. Ce genre de victoire ne se présente pas tous les jours. |
| `commentatrice_dialogue_apres_majeur_finale_victoire_07_f.mp3` | Et elle peut profiter. Ce genre de victoire ne se présente pas tous les jours. |
| `commentatrice_dialogue_apres_majeur_finale_victoire_08.mp3` | Oui. Et pour une fois, je vous laisse le dire. |
| `commentatrice_dialogue_apres_majeur_finale_defaite_01.mp3` | Perdre une grande finale fait mal. Mais arriver jusqu'ici reste remarquable. |
| `commentatrice_dialogue_apres_majeur_finale_defaite_02.mp3` | Et son adversaire avait exactement la même main. |
| `commentatrice_dialogue_apres_majeur_finale_defaite_03.mp3` | C'est le principe d'une finale. Un seul repart avec. |
| `commentatrice_dialogue_apres_majeur_finale_defaite_04.mp3` | Deuxième d'un grand tournoi. Il y a pire comme fin. |
| `commentatrice_dialogue_apres_majeur_finale_defaite_05.mp3` | Roland… il a perdu une finale, pas son bras. |
| `commentatrice_dialogue_apres_majeur_finale_defaite_05_f.mp3` | Roland… elle a perdu une finale, pas son bras. |
| `commentatrice_dialogue_apres_majeur_finale_defaite_06.mp3` | Et maintenant il touchera probablement son réveil demain matin. |
| `commentatrice_dialogue_apres_majeur_finale_defaite_06_f.mp3` | Et maintenant elle touchera probablement son réveil demain matin. |
| `commentatrice_dialogue_fin_set_01.mp3` | Solide. Sans génie. Mais solide. |
| `commentatrice_dialogue_fin_set_02.mp3` | N'en parlons pas. |
| `commentatrice_dialogue_fin_set_03.mp3` | Tout. Ou rien. C'est ça, le HandSlam. |
| `commentatrice_dialogue_fin_set_04.mp3` | Vaste programme. |
| `commentatrice_dialogue_set_decisif_01.mp3` | Un set pour ce soir. Ce sera déjà bien. |
| `commentatrice_dialogue_titre_01.mp3` | Pas d'enflammade. Pas d'enflammade. |
| `commentatrice_dialogue_fin_match_01.mp3` | Si. Un peu quand même. |
| `commentatrice_dialogue_cri_01.mp3` | On l'avait entendu. |
| `commentatrice_dialogue_cri_02.mp3` | Attention que ça ne vous arrive pas. |
| `commentatrice_dialogue_cri_03.mp3` | La prochaine fois, prévoyez les boules Quies. |
| `commentatrice_dialogue_cri_04.mp3` | C'est Ronaldo sans les abdos. |

## Speaker — voix de salle, voyelles étirées (184 répliques)

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
| `speaker_surnom_la_loutre_01.mp3` | La Loutre… |
| `speaker_surnom_la_limace_01.mp3` | La Limace… |
| `speaker_surnom_la_buse_01.mp3` | La Buse… |
| `speaker_surnom_le_cacatoes_01.mp3` | Le Cacatoès… |
| `speaker_surnom_le_dindon_01.mp3` | Le Dindon… |
| `speaker_surnom_le_pigeon_01.mp3` | Le Pigeon… |
| `speaker_surnom_le_cobra_01.mp3` | Le Cobra… |
| `speaker_surnom_le_scorpion_01.mp3` | Le Scorpion… |
| `speaker_surnom_le_requin_01.mp3` | Le Requin… |
| `speaker_surnom_le_faucon_01.mp3` | Le Faucon… |
| `speaker_surnom_le_tigre_01.mp3` | Le Tigre… |
| `speaker_surnom_la_panthere_01.mp3` | La Panthère… |
| `speaker_surnom_le_bison_01.mp3` | Le Bison… |
| `speaker_surnom_le_pitbull_01.mp3` | Le Pitbull… |
| `speaker_surnom_le_croque_monsieur_01.mp3` | Le Croque-Monsieur… |
| `speaker_surnom_la_saucisse_01.mp3` | La Saucisse… |
| `speaker_surnom_la_quiche_01.mp3` | La Quiche… |
| `speaker_surnom_le_cepe_01.mp3` | Le Cèpe… |
| `speaker_surnom_la_truffe_01.mp3` | La Truffe… |
| `speaker_surnom_le_poing_01.mp3` | Le Poing… |
| `speaker_surnom_la_main_01.mp3` | La Main… |
| `speaker_surnom_le_marteau_01.mp3` | Le Marteau… |
| `speaker_surnom_le_bulldozer_01.mp3` | Le Bulldozer… |
| `speaker_surnom_le_tank_01.mp3` | Le Tank… |
| `speaker_surnom_la_foudre_01.mp3` | La Foudre… |
| `speaker_surnom_la_tornade_01.mp3` | La Tornade… |
| `speaker_surnom_l_ouragan_01.mp3` | L'Ouragan… |
| `speaker_surnom_le_gladiateur_01.mp3` | Le Gladiateur… |
| `speaker_surnom_le_cogneur_01.mp3` | Le Cogneur… |
| `speaker_surnom_le_barbare_01.mp3` | Le Barbare… |
| `speaker_surnom_le_viking_01.mp3` | Le Viking… |
| `speaker_surnom_le_samourai_01.mp3` | Le Samouraï… |
| `speaker_surnom_le_ninja_01.mp3` | Le Ninja… |
| `speaker_surnom_le_menhir_01.mp3` | Le Menhir… |
| `speaker_surnom_le_secateur_01.mp3` | Le Sécateur… |
| `speaker_surnom_l_origami_01.mp3` | L'Origami… |
| `speaker_surnom_le_boss_01.mp3` | Le Boss… |
| `speaker_surnom_le_taulier_01.mp3` | Le Taulier… |
| `speaker_surnom_le_maitre_01.mp3` | Le Maître… |
| `speaker_surnom_le_champion_01.mp3` | Le Champion… |
| `speaker_surnom_le_crack_01.mp3` | Le Crack… |
| `speaker_surnom_la_machine_01.mp3` | La Machine… |
| `speaker_surnom_du_dimanche_01.mp3` | du Dimanche… |
| `speaker_surnom_de_l_apero_01.mp3` | de l'Apéro… |
| `speaker_surnom_du_comptoir_01.mp3` | du Comptoir… |
| `speaker_surnom_du_pmu_01.mp3` | du PMU… |
| `speaker_surnom_de_la_cantine_01.mp3` | de la Cantine… |
| `speaker_surnom_du_bureau_01.mp3` | du Bureau… |
| `speaker_surnom_du_parking_01.mp3` | du Parking… |
| `speaker_surnom_du_supermarche_01.mp3` | du Supermarché… |
| `speaker_surnom_du_camping_01.mp3` | du Camping… |
| `speaker_surnom_de_la_sieste_01.mp3` | de la Sieste… |
| `speaker_surnom_du_canape_01.mp3` | du Canapé… |
| `speaker_surnom_du_barbecue_01.mp3` | du Barbecue… |
| `speaker_surnom_du_rond_point_01.mp3` | du Rond-Point… |
| `speaker_surnom_de_la_plage_01.mp3` | de la Plage… |
| `speaker_surnom_du_quartier_01.mp3` | du Quartier… |
| `speaker_surnom_de_la_rue_01.mp3` | de la Rue… |
| `speaker_surnom_de_la_street_01.mp3` | de la Street… |
| `speaker_surnom_du_bitume_01.mp3` | du Bitume… |
| `speaker_surnom_de_la_cite_01.mp3` | de la Cité… |
| `speaker_surnom_du_ring_01.mp3` | du Ring… |
| `speaker_surnom_de_l_arene_01.mp3` | de l'Arène… |
| `speaker_surnom_de_la_jungle_01.mp3` | de la Jungle… |
| `speaker_surnom_du_desert_01.mp3` | du Désert… |
| `speaker_surnom_des_iles_01.mp3` | des Îles… |
| `speaker_surnom_du_village_01.mp3` | du Village… |
| `speaker_surnom_d_acier_01.mp3` | d'Acier… |
| `speaker_surnom_de_titane_01.mp3` | de Titane… |
| `speaker_surnom_de_beton_01.mp3` | de Béton… |
| `speaker_surnom_de_marbre_01.mp3` | de Marbre… |
| `speaker_surnom_de_plomb_01.mp3` | de Plomb… |
| `speaker_surnom_de_cristal_01.mp3` | de Cristal… |
| `speaker_surnom_de_velours_01.mp3` | de Velours… |
| `speaker_surnom_de_soie_01.mp3` | de Soie… |
| `speaker_surnom_d_or_01.mp3` | d'Or… |
| `speaker_surnom_en_dentelle_01.mp3` | en Dentelle… |
| `speaker_surnom_a_paillettes_01.mp3` | à Paillettes… |
| `speaker_surnom_de_feu_01.mp3` | de Feu… |
| `speaker_surnom_de_glace_01.mp3` | de Glace… |
| `speaker_surnom_de_lave_01.mp3` | de Lave… |
| `speaker_surnom_de_braise_01.mp3` | de Braise… |
| `speaker_surnom_de_givre_01.mp3` | de Givre… |
| `speaker_surnom_de_tempete_01.mp3` | de Tempête… |
| `speaker_surnom_de_brume_01.mp3` | de Brume… |
| `speaker_surnom_de_lune_01.mp3` | de Lune… |
| `speaker_surnom_redoutable_01.mp3` | Redoutable… |
| `speaker_surnom_implacable_01.mp3` | Implacable… |
| `speaker_surnom_impitoyable_01.mp3` | Impitoyable… |
| `speaker_surnom_invincible_01.mp3` | Invincible… |
| `speaker_surnom_inarretable_01.mp3` | Inarrêtable… |
| `speaker_surnom_intraitable_01.mp3` | Intraitable… |
| `speaker_surnom_terrible_01.mp3` | Terrible… |
| `speaker_surnom_sauvage_01.mp3` | Sauvage… |
| `speaker_surnom_de_la_nuit_01.mp3` | de la Nuit… |
| `speaker_surnom_de_l_ombre_01.mp3` | de l'Ombre… |
| `speaker_surnom_du_chaos_01.mp3` | du Chaos… |
| `speaker_surnom_des_titans_01.mp3` | des Titans… |
| `speaker_surnom_des_legendes_01.mp3` | des Légendes… |
| `speaker_surnom_des_immortels_01.mp3` | des Immortels… |
| `speaker_surnom_des_champions_01.mp3` | des Champions… |
| `speaker_surnom_de_l_eternite_01.mp3` | de l'Éternité… |
| `speaker_surnom_de_la_gloire_01.mp3` | de la Gloire… |
| `speaker_surnom_du_destin_01.mp3` | du Destin… |
| `speaker_surnom_de_l_empire_01.mp3` | de l'Empire… |

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
