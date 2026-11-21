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

## Arbitre — grave et sobre (97 répliques)

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
| `arbitre_silence_02.mp3` | Mesdames et messieurs, s'il vous plaît. |
| `arbitre_silence_05.mp3` | Mesdames et messieurs, les joueurs sont prêts. |
| `arbitre_silence_06.mp3` | Merci de respecter les joueurs. |
| `arbitre_temps_01.mp3` | Temps. |
| `arbitre_coup_joue_d_office_01.mp3` | Coup joué d'office. |
| `arbitre_avertissement_jaune_01.mp3` | Avertissement, dépassement de temps, côté jaune. |
| `arbitre_avertissement_rouge_01.mp3` | Avertissement, dépassement de temps, côté rouge. |
| `arbitre_penalite_jaune_01.mp3` | Point de pénalité, côté jaune. |
| `arbitre_penalite_rouge_01.mp3` | Point de pénalité, côté rouge. |
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

## Commentateur — vif, enthousiaste, plein de références (1369 répliques)

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
| `commentateur_craquage_07.mp3` | Il avait le match au bout des doigts… et il l'a laissé filer ! |
| `commentateur_craquage_07_f.mp3` | Elle avait le match au bout des doigts… et elle l'a laissé filer ! |
| `commentateur_craquage_08.mp3` | Chute à l'avant ! Il avait le match en poche ! |
| `commentateur_craquage_08_f.mp3` | Chute à l'avant ! Elle avait le match en poche ! |
| `commentateur_craquage_09.mp3` | Oh non, pas ça ! Pas aujourd'hui ! Pas comme ça ! Pas après tout ce que tu as fait… |
| `commentateur_craquage_10.mp3` | Attaque audacieuse… et riposte de maître ! |
| `commentateur_craquage_11.mp3` | Erreur tactique ! Il a perdu la main ! |
| `commentateur_craquage_11_f.mp3` | Erreur tactique ! Elle a perdu la main ! |
| `commentateur_craquage_12.mp3` | Oh non… Il a tremblé au pire moment ! |
| `commentateur_craquage_12_f.mp3` | Oh non… Elle a tremblé au pire moment ! |
| `commentateur_craquage_13.mp3` | Aïe ! Il se prend les pieds dans le tapis, là ! |
| `commentateur_craquage_13_f.mp3` | Aïe ! Elle se prend les pieds dans le tapis, là ! |
| `commentateur_craquage_14.mp3` | Oula, il avait le set dans les mains ! |
| `commentateur_craquage_14_f.mp3` | Oula, elle avait le set dans les mains ! |
| `commentateur_main_legendaire_01.mp3` | La main du siècle ! |
| `commentateur_main_legendaire_02.mp3` | Une main pour l'histoire ! |
| `commentateur_main_legendaire_03.mp3` | La main du destin ! |
| `commentateur_main_legendaire_04.mp3` | Une main qui entre dans la légende ! |
| `commentateur_main_legendaire_05.mp3` | Arrêtez tout ! Nous venons d'assister à un moment d'histoire ! |
| `commentateur_main_legendaire_06.mp3` | On pourra parler de cette main pendant des années ! |
| `commentateur_main_legendaire_07.mp3` | Mesdames et mesdames… quelle main ! |
| `commentateur_main_legendaire_08.mp3` | Dans cinquante ans, on racontera encore cette main ! |
| `commentateur_main_legendaire_09.mp3` | On a assisté à quelque chose d'unique ! |
| `commentateur_main_legendaire_10.mp3` | Oh, la main du siècle, peut-être même du millénaire ! |
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
| `commentateur_balle_sauvee_09.mp3` | Une riposte fulgurante, aucune chance pour son adversaire ! |
| `commentateur_balle_sauvee_10.mp3` | Oh, il n'est pas mort ! Il n'est pas mort ! |
| `commentateur_balle_sauvee_10_f.mp3` | Oh, elle n'est pas morte ! Elle n'est pas morte ! |
| `commentateur_balle_sauvee_11.mp3` | Ah ! Il ressuscite ! Le public n'en revient pas ! |
| `commentateur_balle_sauvee_11_f.mp3` | Ah ! Elle ressuscite ! Le public n'en revient pas ! |
| `commentateur_balle_sauvee_12.mp3` | Ouf ! Le danger est écarté ! |
| `commentateur_balle_sauvee_13.mp3` | Sauvée sur la ligne ! |
| `commentateur_balle_sauvee_14.mp3` | Et coup de tonnerre avec ce point, qui lui permet de rester dans la course ! |
| `commentateur_balle_sauvee_15.mp3` | Attention, il ne baisse pas la garde ! |
| `commentateur_balle_sauvee_15_f.mp3` | Attention, elle ne baisse pas la garde ! |
| `commentateur_balle_sauvee_16.mp3` | Sauvée ! Le public est debout ! |
| `commentateur_remontee_01.mp3` | Quelle remontée extraordinaire ! |
| `commentateur_remontee_02.mp3` | On l'avait enterré un peu trop vite ! |
| `commentateur_remontee_02_f.mp3` | On l'avait enterrée un peu trop vite ! |
| `commentateur_remontee_03.mp3` | Le vent a tourné, mesdames et mesdames ! |
| `commentateur_remontee_04.mp3` | De l'enfer au paradis en quelques coups ! |
| `commentateur_remontee_05.mp3` | La cabane est tombée sur le chien ! |
| `commentateur_remontee_06.mp3` | Il a fait l'élastique, et le revoilà dans la roue ! |
| `commentateur_remontee_06_f.mp3` | Elle a fait l'élastique, et la revoilà dans la roue ! |
| `commentateur_remontee_07.mp3` | C'est dingue ! C'est dingue ! |
| `commentateur_remontee_08.mp3` | Il était au fond du trou, le revoilà à la surface ! |
| `commentateur_remontee_08_f.mp3` | Elle était au fond du trou, la revoilà à la surface ! |
| `commentateur_remontee_09.mp3` | Magnifique remontada ! |
| `commentateur_remontee_10.mp3` | Encore un point ! Le doute change de camp ! |
| `commentateur_remontee_11.mp3` | Il est revenu du diable Vauvert ! |
| `commentateur_remontee_11_f.mp3` | Elle est revenue du diable Vauvert ! |
| `commentateur_remontee_12.mp3` | Il revient de nulle part ! |
| `commentateur_remontee_12_f.mp3` | Elle revient de nulle part ! |
| `commentateur_remontee_13.mp3` | Nous assistons à une véritable remontada ! |
| `commentateur_remontee_14.mp3` | C'est un retour d'entre les morts ! |
| `commentateur_remontee_15.mp3` | Et voilà, il recolle au score ! |
| `commentateur_remontee_15_f.mp3` | Et voilà, elle recolle au score ! |
| `commentateur_remontee_16.mp3` | Il revient de nulle part ! |
| `commentateur_remontee_16_f.mp3` | Elle revient de nulle part ! |
| `commentateur_serie_pour_01.mp3` | Plus rien ne l'arrête ! |
| `commentateur_serie_pour_02.mp3` | Quatre à la suite ! |
| `commentateur_serie_pour_03.mp3` | Ça déroule, ça déroule ! |
| `commentateur_serie_pour_04.mp3` | Il a mis une mine, ça explose derrière ! |
| `commentateur_serie_pour_04_f.mp3` | Elle a mis une mine, ça explose derrière ! |
| `commentateur_serie_pour_05.mp3` | C'est du Pierre-Feuille-Ciseaux champagne ! |
| `commentateur_serie_pour_08.mp3` | Il marche sur son adversaire ! |
| `commentateur_serie_pour_08_f.mp3` | Elle marche sur son adversaire ! |
| `commentateur_serie_pour_09.mp3` | Qui va réussir à l'arrêter ? |
| `commentateur_serie_pour_10.mp3` | La main est chaude ! Très chaude ! |
| `commentateur_serie_pour_11.mp3` | Il est lancé ! |
| `commentateur_serie_pour_11_f.mp3` | Elle est lancée ! |
| `commentateur_serie_pour_12.mp3` | Il est en train de prendre le contrôle de ce match ! |
| `commentateur_serie_pour_12_f.mp3` | Elle est en train de prendre le contrôle de ce match ! |
| `commentateur_serie_pour_13.mp3` | Rien ne semble pouvoir l'arrêter ! |
| `commentateur_serie_pour_14.mp3` | Il commence sérieusement à donner une leçon ! |
| `commentateur_serie_pour_14_f.mp3` | Elle commence sérieusement à donner une leçon ! |
| `commentateur_serie_pour_15.mp3` | C'est un récital ! |
| `commentateur_serie_pour_16.mp3` | Mais qui va pouvoir l'arrêter ?! |
| `commentateur_serie_pour_17.mp3` | Il est en état de grâce ! |
| `commentateur_serie_pour_17_f.mp3` | Elle est en état de grâce ! |
| `commentateur_serie_pour_18.mp3` | C'est une démonstration ! |
| `commentateur_serie_pour_19.mp3` | Il est en train de ridiculiser son adversaire ! |
| `commentateur_serie_pour_19_f.mp3` | Elle est en train de ridiculiser son adversaire ! |
| `commentateur_serie_pour_20.mp3` | C'est le Mozart du chifoumi ! |
| `commentateur_serie_pour_21.mp3` | Ce n'est plus un match, c'est une légende ! |
| `commentateur_serie_pour_22.mp3` | Il est en feu ! |
| `commentateur_serie_pour_22_f.mp3` | Elle est en feu ! |
| `commentateur_serie_pour_23.mp3` | Il martyrise son adversaire ! |
| `commentateur_serie_pour_23_f.mp3` | Elle martyrise son adversaire ! |
| `commentateur_serie_pour_24.mp3` | Il est en train de produire son effort ! |
| `commentateur_serie_pour_24_f.mp3` | Elle est en train de produire son effort ! |
| `commentateur_serie_pour_25.mp3` | Il est en jambes ! |
| `commentateur_serie_pour_25_f.mp3` | Elle est en jambes ! |
| `commentateur_serie_pour_26.mp3` | Il est en train de nous faire un sacré numéro ! |
| `commentateur_serie_pour_26_f.mp3` | Elle est en train de nous faire un sacré numéro ! |
| `commentateur_serie_pour_27.mp3` | Il creuse l'écart ! |
| `commentateur_serie_pour_27_f.mp3` | Elle creuse l'écart ! |
| `commentateur_serie_pour_28.mp3` | Il dicte le tempo ! |
| `commentateur_serie_pour_28_f.mp3` | Elle dicte le tempo ! |
| `commentateur_serie_pour_29.mp3` | Ça déroule ! |
| `commentateur_serie_pour_30.mp3` | Oh, il est sur un nuage ! |
| `commentateur_serie_pour_30_f.mp3` | Oh, elle est sur un nuage ! |
| `commentateur_serie_pour_31.mp3` | Rien ne lui résiste ce soir ! |
| `commentateur_serie_pour_32.mp3` | Il garde la main ! |
| `commentateur_serie_pour_32_f.mp3` | Elle garde la main ! |
| `commentateur_serie_pour_33.mp3` | Ah, il travaille au corps son adversaire ! |
| `commentateur_serie_pour_33_f.mp3` | Ah, elle travaille au corps son adversaire ! |
| `commentateur_serie_pour_34.mp3` | Et là, il passe à la vitesse supérieure ! |
| `commentateur_serie_pour_34_f.mp3` | Et là, elle passe à la vitesse supérieure ! |
| `commentateur_serie_pour_35.mp3` | Il s'est mis en danseuse et a déposé son adversaire ! |
| `commentateur_serie_pour_35_f.mp3` | Elle s'est mise en danseuse et a déposé son adversaire ! |
| `commentateur_serie_pour_36.mp3` | Course en tête pour lui ! |
| `commentateur_serie_pour_36_f.mp3` | Course en tête pour elle ! |
| `commentateur_serie_pour_37.mp3` | Pas le moindre espace pour son adversaire ! |
| `commentateur_serie_pour_38.mp3` | Oh, il est inarrêtable ! |
| `commentateur_serie_pour_38_f.mp3` | Oh, elle est inarrêtable ! |
| `commentateur_serie_pour_39.mp3` | Il enchaîne, il enchaîne ! |
| `commentateur_serie_pour_39_f.mp3` | Elle enchaîne, elle enchaîne ! |
| `commentateur_serie_pour_40.mp3` | Il a trouvé la clé ! |
| `commentateur_serie_pour_40_f.mp3` | Elle a trouvé la clé ! |
| `commentateur_serie_contre_01.mp3` | Quelqu'un peut arrêter ça ?! |
| `commentateur_serie_contre_02.mp3` | Il est dans les cordes ! Il faut réagir ! |
| `commentateur_serie_contre_02_f.mp3` | Elle est dans les cordes ! Il faut réagir ! |
| `commentateur_serie_contre_07.mp3` | Il est en train de perdre le fil ! |
| `commentateur_serie_contre_07_f.mp3` | Elle est en train de perdre le fil ! |
| `commentateur_serie_contre_08.mp3` | Attention, il se fait acculer ! |
| `commentateur_serie_contre_08_f.mp3` | Attention, elle se fait acculer ! |
| `commentateur_serie_contre_09.mp3` | Ça tourne au cauchemar ! |
| `commentateur_serie_contre_10.mp3` | Il n'y arrive plus ! |
| `commentateur_serie_contre_10_f.mp3` | Elle n'y arrive plus ! |
| `commentateur_serie_contre_11.mp3` | Arrêtez le massacre ! |
| `commentateur_serie_contre_12.mp3` | C'est une boucherie ! |
| `commentateur_serie_contre_13.mp3` | Appelez les secours, il ne répond plus ! |
| `commentateur_serie_contre_13_f.mp3` | Appelez les secours, elle ne répond plus ! |
| `commentateur_serie_contre_14.mp3` | Il pédale avec les oreilles ! |
| `commentateur_serie_contre_14_f.mp3` | Elle pédale avec les oreilles ! |
| `commentateur_serie_contre_15.mp3` | C'est terrible ! |
| `commentateur_serie_contre_16.mp3` | C'est un long chemin de croix ! |
| `commentateur_serie_contre_17.mp3` | Le calvaire se poursuit ! |
| `commentateur_serie_contre_18.mp3` | Il est à la peine ! |
| `commentateur_serie_contre_18_f.mp3` | Elle est à la peine ! |
| `commentateur_serie_contre_19.mp3` | Et un vieux ciseau rouillé pour finir : attention au tétanos ! |
| `commentateur_serie_contre_20.mp3` | Oula… il prend l'eau ! |
| `commentateur_serie_contre_20_f.mp3` | Oula… elle prend l'eau ! |
| `commentateur_serie_contre_21.mp3` | Il subit, il subit ! |
| `commentateur_serie_contre_21_f.mp3` | Elle subit, elle subit ! |
| `commentateur_serie_contre_22.mp3` | Aïe, il a perdu la main ! |
| `commentateur_serie_contre_22_f.mp3` | Aïe, elle a perdu la main ! |
| `commentateur_serie_contre_23.mp3` | Oula, il est en train de prendre le bouillon ! |
| `commentateur_serie_contre_23_f.mp3` | Oula, elle est en train de prendre le bouillon ! |
| `commentateur_serie_contre_24.mp3` | Oula, rien ne va plus pour lui ! |
| `commentateur_serie_contre_24_f.mp3` | Oula, rien ne va plus pour elle ! |
| `commentateur_serie_contre_25.mp3` | L'adversaire déroule, et lui subit ! |
| `commentateur_serie_contre_25_f.mp3` | L'adversaire déroule, et elle subit ! |
| `commentateur_serie_contre_26.mp3` | Aïe, la série noire continue ! |
| `commentateur_serie_contre_27.mp3` | Il y a des jours où la main ne répond plus. |
| `commentateur_obstination_01_pierre.mp3` | Troisième Pierre d'affilée ! C'est audacieux ! |
| `commentateur_obstination_01_ciseaux.mp3` | Troisièmes Ciseaux d'affilée ! C'est audacieux ! |
| `commentateur_obstination_01_feuille.mp3` | Troisième Feuille d'affilée ! C'est audacieux ! |
| `commentateur_obstination_02.mp3` | Soit c'est du génie, soit c'est de l'entêtement ! |
| `commentateur_obstination_03_pierre.mp3` | Sa Pierre… son précieux… |
| `commentateur_obstination_03_ciseaux.mp3` | Ses Ciseaux… son précieux… |
| `commentateur_obstination_03_feuille.mp3` | Sa Feuille… son précieux… |
| `commentateur_obstination_04.mp3` | Tous les chemins mènent à la Pierre ! |
| `commentateur_changement_01.mp3` | Le changement, c'est maintenant ! |
| `commentateur_changement_02.mp3` | Il change enfin de signe ! |
| `commentateur_changement_02_f.mp3` | Elle change enfin de signe ! |
| `commentateur_changement_03.mp3` | Magnifique dégagement ! |
| `commentateur_changement_04.mp3` | Il renverse complètement le jeu ! |
| `commentateur_changement_04_f.mp3` | Elle renverse complètement le jeu ! |
| `commentateur_changement_05_pierre.mp3` | Belle transition vers la Pierre ! |
| `commentateur_changement_05_ciseaux.mp3` | Belle transition vers les Ciseaux ! |
| `commentateur_changement_05_feuille.mp3` | Belle transition vers la Feuille ! |
| `commentateur_changement_06.mp3` | Ah ! Il a enfin trouvé les autres boutons ! |
| `commentateur_changement_06_f.mp3` | Ah ! Elle a enfin trouvé les autres boutons ! |
| `commentateur_changement_07_pierre.mp3` | Contre toute attente, il revient Pierre ! |
| `commentateur_changement_07_pierre_f.mp3` | Contre toute attente, elle revient Pierre ! |
| `commentateur_changement_07_ciseaux.mp3` | Contre toute attente, il revient Ciseaux ! |
| `commentateur_changement_07_ciseaux_f.mp3` | Contre toute attente, elle revient Ciseaux ! |
| `commentateur_changement_07_feuille.mp3` | Contre toute attente, il revient Feuille ! |
| `commentateur_changement_07_feuille_f.mp3` | Contre toute attente, elle revient Feuille ! |
| `commentateur_duel_esprits_01.mp3` | Ils se lisent dans les pensées ! |
| `commentateur_duel_esprits_03.mp3` | Surplace sur la piste ! Personne ne veut lancer le sprint ! |
| `commentateur_duel_esprits_04.mp3` | Coude à coude ! Impossible de les séparer ! |
| `commentateur_duel_esprits_05.mp3` | Cinq égalités ! On n'avait pas vu ça depuis le schisme de la Feuille ! |
| `commentateur_duel_esprits_06.mp3` | Deux mains, zéro vainqueur ! |
| `commentateur_duel_esprits_07.mp3` | Égalité ! Les cerveaux sont connectés ! |
| `commentateur_duel_esprits_08.mp3` | Ils se regardent… et ils recommencent ! |
| `commentateur_duel_esprits_09.mp3` | Égalité parfaite ! La tension monte ! |
| `commentateur_duel_esprits_10.mp3` | Ils se rendent coup pour coup ! |
| `commentateur_duel_esprits_11.mp3` | Une nouvelle égalité sur le central ! |
| `commentateur_duel_esprits_12.mp3` | Ils se regardent, ils se jaugent… Qui va craquer ? |
| `commentateur_duel_esprits_13.mp3` | Les adversaires se jaugent ! |
| `commentateur_duel_esprits_14.mp3` | Ils se regardent en chiens de faïence ! |
| `commentateur_duel_esprits_15.mp3` | On assiste à une rencontre très fermée ! |
| `commentateur_duel_esprits_16.mp3` | Une véritable partie de poker menteur ! |
| `commentateur_duel_esprits_17.mp3` | Il y a du KO dans l'air ! |
| `commentateur_duel_esprits_18.mp3` | Personne ne lâche rien ! |
| `commentateur_duel_esprits_19.mp3` | Ça bataille au milieu du terrain ! |
| `commentateur_duel_esprits_20.mp3` | Ils avancent main dans la main ! |
| `commentateur_duel_esprits_21.mp3` | Les deux adversaires sont sur le fil, ils se regardent droit dans les yeux ! |
| `commentateur_duel_esprits_22.mp3` | Ils se neutralisent encore ! |
| `commentateur_duel_esprits_23.mp3` | Oula, personne ne passe ! |
| `commentateur_lecture_subie_01.mp3` | Le bluff du siècle ! L'autre n'a pas cillé ! |
| `commentateur_lecture_reussie_01.mp3` | Il l'attendait ! Il l'attendait ! |
| `commentateur_lecture_reussie_01_f.mp3` | Elle l'attendait ! Elle l'attendait ! |
| `commentateur_lecture_reussie_03_pierre.mp3` | Second poteau, la Pierre ! |
| `commentateur_lecture_reussie_03_ciseaux.mp3` | Second poteau, les Ciseaux ! |
| `commentateur_lecture_reussie_03_feuille.mp3` | Second poteau, la Feuille ! |
| `commentateur_lecture_reussie_04.mp3` | Il vous a compris ! |
| `commentateur_lecture_reussie_04_f.mp3` | Elle vous a compris ! |
| `commentateur_lecture_reussie_05.mp3` | Il est entré dans son cerveau ! |
| `commentateur_lecture_reussie_05_f.mp3` | Elle est entrée dans son cerveau ! |
| `commentateur_lecture_reussie_06.mp3` | Il l'attendait dans le zig, il lui a mis dans le zag ! |
| `commentateur_lecture_reussie_06_f.mp3` | Il l'attendait dans le zig, elle lui a mis dans le zag ! |
| `commentateur_lecture_reussie_07.mp3` | Mais quelle lecture ! Il a vu le coup venir avant même l'adversaire ! |
| `commentateur_lecture_reussie_07_f.mp3` | Mais quelle lecture ! Elle a vu le coup venir avant même l'adversaire ! |
| `commentateur_lecture_reussie_08.mp3` | Pris la main dans le sac ! |
| `commentateur_temps_ecoule_01.mp3` | Il a oublié de jouer ! |
| `commentateur_temps_ecoule_01_f.mp3` | Elle a oublié de jouer ! |
| `commentateur_temps_ecoule_02.mp3` | Calé sur la grille de départ ! |
| `commentateur_temps_ecoule_02_f.mp3` | Calée sur la grille de départ ! |
| `commentateur_temps_ecoule_03.mp3` | Faux départ… enfin, pas de départ du tout ! |
| `commentateur_temps_ecoule_04.mp3` | Oula ! Il est resté sur le banc de touche ! |
| `commentateur_temps_ecoule_04_f.mp3` | Oula ! Elle est restée sur le banc de touche ! |
| `commentateur_temps_ecoule_05.mp3` | Carton jaune pour la lenteur ! |
| `commentateur_temps_ecoule_06.mp3` | Oh, il a laissé filer le temps ! |
| `commentateur_temps_ecoule_06_f.mp3` | Oh, elle a laissé filer le temps ! |
| `commentateur_tension_01.mp3` | Silence dans la salle… |
| `commentateur_tension_02.mp3` | Tout un match… pour un seul signe. |
| `commentateur_tension_03.mp3` | Le côté jaune a peur. |
| `commentateur_tension_04.mp3` | Un point pour l'Éternité… |
| `commentateur_tension_05.mp3` | Le titre est au bout de ce point… |
| `commentateur_tension_06.mp3` | C'est irrespirable ! |
| `commentateur_tension_07.mp3` | Et le voilà à un signe du paradis ! |
| `commentateur_tension_07_f.mp3` | Et la voilà à un signe du paradis ! |
| `commentateur_tension_08.mp3` | Balle de match ! Le stade retient son souffle ! |
| `commentateur_tension_09.mp3` | C'est maintenant ou jamais ! |
| `commentateur_tension_10.mp3` | Allez ! Il a le match en main ! |
| `commentateur_tension_10_f.mp3` | Allez ! Elle a le match en main ! |
| `commentateur_tension_11.mp3` | Attention : plus le choix, il faut marquer pour rester en vie ! |
| `commentateur_tension_12.mp3` | Le moment de vérité ! |
| `commentateur_point_decisif_01.mp3` | Un point. Un seul. Pour tout ! |
| `commentateur_point_decisif_02.mp3` | Un point pour entrer dans l'Histoire ! |
| `commentateur_point_decisif_03.mp3` | Il ne peut en rester qu'un ! |
| `commentateur_point_decisif_04.mp3` | Quatorze partout ! Le prochain point écrit l'histoire ! |
| `commentateur_point_decisif_05.mp3` | Mort subite ! |
| `commentateur_point_decisif_06.mp3` | Celui qui marque gagne ! |
| `commentateur_point_decisif_07.mp3` | Tout le match tient dans cette main ! |
| `commentateur_point_decisif_08.mp3` | On n'a jamais été aussi près… des deux côtés ! |
| `commentateur_point_decisif_09.mp3` | Quatorze partout en finale ! Mesdames et mesdames, levez-vous ! |
| `commentateur_point_decisif_10.mp3` | Un point pour un titre ! Un point pour l'éternité ! |
| `commentateur_point_decisif_11.mp3` | La main du sacre est peut-être dans ce point ! |
| `commentateur_point_decisif_12.mp3` | Je n'ai jamais vu ça ! Jamais ! En trente ans de carrière ! |
| `commentateur_point_decisif_13.mp3` | Les livres d'histoire attendent ce point ! |
| `commentateur_point_decisif_14.mp3` | Quatorze partout : c'est désormais la mort subite ! |
| `commentateur_set_point_decisif_01.mp3` | Quinze à quatorze ! Ça passe sur le fil ! |
| `commentateur_set_point_decisif_02.mp3` | Oh ! Il arrache le point décisif ! |
| `commentateur_set_point_decisif_02_f.mp3` | Oh ! Elle arrache le point décisif ! |
| `commentateur_match_point_decisif_01.mp3` | Au bout du bout ! Il l'a fait ! |
| `commentateur_match_point_decisif_01_f.mp3` | Au bout du bout ! Elle l'a fait ! |
| `commentateur_match_point_decisif_02.mp3` | Au point décisif ! Quelle main ! |
| `commentateur_match_perdu_point_decisif_01.mp3` | Oh non… Il s'incline sur le point décisif ! Cruel ! |
| `commentateur_match_perdu_point_decisif_01_f.mp3` | Oh non… Elle s'incline sur le point décisif ! Cruel ! |
| `commentateur_match_perdu_point_decisif_02.mp3` | La main a tremblé au pire moment ! |
| `commentateur_sacre_point_decisif_01.mp3` | LA MAIN DU SACRE ! |
| `commentateur_sacre_point_decisif_02.mp3` | La main de Dieu ! |
| `commentateur_sacre_point_decisif_03.mp3` | Un moment pour l'éternité ! |
| `commentateur_sacre_point_decisif_04.mp3` | Il est champion ! Il est champion ! Sur le point décisif ! |
| `commentateur_sacre_point_decisif_04_f.mp3` | Elle est championne ! Elle est championne ! Sur le point décisif ! |
| `commentateur_sacre_point_decisif_05.mp3` | Gravez son nom ! Gravez-le dans le marbre ! |
| `commentateur_sacre_point_decisif_06.mp3` | Le plus beau jour de ma vie de commentateur ! |
| `commentateur_sacre_point_decisif_07.mp3` | Que les cloches sonnent ! Nous avons un champion ! |
| `commentateur_sacre_point_decisif_07_f.mp3` | Que les cloches sonnent ! Nous avons une championne ! |
| `commentateur_finale_perdue_point_decisif_01.mp3` | Si près… si près du sacre ! |
| `commentateur_finale_perdue_point_decisif_02.mp3` | Pourtant, il a tout donné ! Absolument tout ! |
| `commentateur_finale_perdue_point_decisif_02_f.mp3` | Pourtant, elle a tout donné ! Absolument tout ! |
| `commentateur_set_ecrasant_01.mp3` | Une leçon ! Une démonstration de force ! |
| `commentateur_set_ecrasant_02.mp3` | Au tapis ! L'arbitre peut compter jusqu'à dix ! |
| `commentateur_set_ecrasant_03.mp3` | Fanny ! Onze à zéro, il va falloir embrasser Fanny ! |
| `commentateur_set_ecrasant_04.mp3` | Une démonstration ! |
| `commentateur_set_ecrasant_05.mp3` | Sans appel ! |
| `commentateur_set_ecrasant_06.mp3` | Haut la main ! |
| `commentateur_set_ecrasant_07.mp3` | Oh, il est passé complètement à travers ! |
| `commentateur_set_ecrasant_07_f.mp3` | Oh, elle est passée complètement à travers ! |
| `commentateur_set_couteau_01.mp3` | Irrespirable ! |
| `commentateur_set_couteau_02.mp3` | Quel set, mesdames et messieurs ! |
| `commentateur_set_couteau_03.mp3` | Photo-finish ! Il faut la photo pour les départager ! |
| `commentateur_set_couteau_04.mp3` | Arrivée au sprint, et ça passe d'un boyau ! |
| `commentateur_set_couteau_05.mp3` | Oula, ça s'est joué à un souffle ! |
| `commentateur_set_couteau_06.mp3` | Ça passe… et de justesse ! |
| `commentateur_set_couteau_07.mp3` | Le suspense est insoutenable, même pour ceux qui ne comprennent pas les règles ! |
| `commentateur_un_set_partout_01.mp3` | Nous sommes désormais à un set partout. Il a su rectifier le tir pour rester dans la course. |
| `commentateur_un_set_partout_01_f.mp3` | Nous sommes désormais à un set partout. Elle a su rectifier le tir pour rester dans la course. |
| `commentateur_un_set_partout_02.mp3` | Ce second set s'achève sur un score de parité. C'est le moment d'inventer la séquence qui surprendra l'adversaire, pour prendre une option sur la victoire. |
| `commentateur_un_set_partout_03.mp3` | Les deux mains rentrent aux vestiaires sans un regard. Il faut rester concentré, et ne rien montrer que l'adversaire puisse exploiter pour sa prochaine ouverture. |
| `commentateur_un_set_partout_04.mp3` | Un retour qui fait du bien au moral, et un troisième set qui s'annonce très disputé. On se retrouve dans un instant sur HandSlam TV pour le dénouement de ce duel. |
| `commentateur_un_set_partout_05.mp3` | Il a su produire son effort pour revenir à hauteur de la main adverse. Il faut à présent supporter la pression, et donner son meilleur chifoumi, sans oublier les fondamentaux. |
| `commentateur_un_set_partout_05_f.mp3` | Elle a su produire son effort pour revenir à hauteur de la main adverse. Il faut à présent supporter la pression, et donner son meilleur chifoumi, sans oublier les fondamentaux. |
| `commentateur_premier_set_net_01.mp3` | Un set bien maîtrisé. Son adversaire doit maintenant réagir. |
| `commentateur_premier_set_net_02_pierre.mp3` | Ce premier set prend fin sur une Pierre bien sentie. La main adverse n'a pas su réellement l'inquiéter. |
| `commentateur_premier_set_net_02_ciseaux.mp3` | Ce premier set prend fin sur des Ciseaux bien sentis. La main adverse n'a pas su réellement l'inquiéter. |
| `commentateur_premier_set_net_02_feuille.mp3` | Ce premier set prend fin sur une Feuille bien sentie. La main adverse n'a pas su réellement l'inquiéter. |
| `commentateur_premier_set_large_01.mp3` | Une victoire sans bavure, et une piètre prestation de la main adverse. Il faut se remobiliser, sans quoi la messe est dite. |
| `commentateur_premier_set_large_02.mp3` | Entame de match parfaite. S'il reste en rythme pour le second set, la victoire ne lui échappera pas. |
| `commentateur_premier_set_large_02_f.mp3` | Entame de match parfaite. Si elle reste en rythme pour le second set, la victoire ne lui échappera pas. |
| `commentateur_premier_set_large_03.mp3` | Large sourire d'un côté et soupe à la grimace de l'autre. Il faudra montrer un autre visage pour rester au contact et renverser la vapeur. |
| `commentateur_premier_set_ecrase_01.mp3` | Une victoire en mode rouleau compresseur. Il n'a laissé que des miettes à un adversaire dépassé par l'enjeu. |
| `commentateur_premier_set_ecrase_01_f.mp3` | Une victoire en mode rouleau compresseur. Elle n'a laissé que des miettes à un adversaire dépassé par l'enjeu. |
| `commentateur_premier_set_ecrase_02.mp3` | Chifoumi champagne ce soir sur le central. Les séquences se sont enchaînées comme à l'entraînement, face à une main fantomatique. |
| `commentateur_resume_set_01.mp3` | Set bouclé, et quelle bataille ! |
| `commentateur_resume_set_02.mp3` | Un set maîtrisé de bout en bout ! |
| `commentateur_resume_set_03.mp3` | Un set partout, tout se jouera maintenant ! |
| `commentateur_resume_set_04.mp3` | Le public retient son souffle avant la suite ! |
| `commentateur_resume_set_05.mp3` | Attention, je crois qu'il s'est foulé le poignet… non, rien de grave a priori. |
| `commentateur_resume_set_05_f.mp3` | Attention, je crois qu'elle s'est foulé le poignet… non, rien de grave a priori. |
| `commentateur_resume_set_06.mp3` | Un set plein, bien construit, de bout en bout ! |
| `commentateur_resume_set_07.mp3` | Ah, quel set ! On a vu de tout ! |
| `commentateur_resume_set_08.mp3` | Il a su accélérer au bon moment ! |
| `commentateur_resume_set_08_f.mp3` | Elle a su accélérer au bon moment ! |
| `commentateur_resume_set_09.mp3` | Je me souviens d'une finale en 1997 où vous aviez réalisé le même geste, Madame ! |
| `commentateur_set_decisif_01.mp3` | Set décisif ! Tout se joue maintenant ! |
| `commentateur_set_decisif_02.mp3` | C'est la der des ders ! |
| `commentateur_set_decisif_03.mp3` | Set décisif, et une place dans l'Histoire en jeu ! |
| `commentateur_set_decisif_04.mp3` | Un set ! Un seul ! Tout ce qu'ils ont, c'est maintenant ! |
| `commentateur_set_decisif_05.mp3` | Les compteurs sont remis à zéro ! |
| `commentateur_set_decisif_06.mp3` | Tout se jouera dans ce dernier set ! |
| `commentateur_set_decisif_07.mp3` | Oh, le parfum des grands soirs ! Un set pour tout décider ! |
| `commentateur_renversement_01.mp3` | Mené un set à zéro, il renverse tout ! |
| `commentateur_renversement_01_f.mp3` | Menée un set à zéro, elle renverse tout ! |
| `commentateur_renversement_02.mp3` | Le retour du siècle ! |
| `commentateur_renversement_03.mp3` | Il était dans les cordes, c'est l'autre qui finit au tapis ! |
| `commentateur_renversement_03_f.mp3` | Elle était dans les cordes, c'est l'autre qui finit au tapis ! |
| `commentateur_renversement_04.mp3` | Tête-à-queue complet dans ce match ! |
| `commentateur_renversement_05.mp3` | C'est la remontada ! |
| `commentateur_renversement_06.mp3` | Personne n'y croyait, sauf lui ! |
| `commentateur_renversement_06_f.mp3` | Personne n'y croyait, sauf elle ! |
| `commentateur_renversement_07.mp3` | Mené, et pourtant il a tout retourné ! |
| `commentateur_renversement_07_f.mp3` | Menée, et pourtant elle a tout retourné ! |
| `commentateur_renversement_08.mp3` | Quel retournement de situation ! |
| `commentateur_renversement_09.mp3` | Oh, la remontée fantastique ! |
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
| `commentateur_balle_match_convertie_20.mp3` | Jeu, set et match ! |
| `commentateur_balle_match_convertie_21.mp3` | C'est terminé ! Il l'a fait ! |
| `commentateur_balle_match_convertie_21_f.mp3` | C'est terminé ! Elle l'a fait ! |
| `commentateur_balle_match_convertie_22.mp3` | Victoire haut la main ! |
| `commentateur_balle_match_convertie_23.mp3` | Et c'est fini ! Il conclut avec autorité ! |
| `commentateur_balle_match_convertie_23_f.mp3` | Et c'est fini ! Elle conclut avec autorité ! |
| `commentateur_balle_match_convertie_24.mp3` | Oh, la balle de match est transformée ! |
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
| `commentateur_victoire_19.mp3` | Et il lève les mains au ciel ! |
| `commentateur_victoire_19_f.mp3` | Et elle lève les mains au ciel ! |
| `commentateur_victoire_20.mp3` | Victoire ! Et quelle victoire ! |
| `commentateur_victoire_21.mp3` | Le travail paie ! Bravo ! |
| `commentateur_victoire_22.mp3` | Oh, la joie du vainqueur ! |
| `commentateur_victoire_23.mp3` | Victoire ! C'est historique ! |
| `commentateur_victoire_24.mp3` | Il l'a fait ! Il l'a vraiment fait ! |
| `commentateur_victoire_24_f.mp3` | Elle l'a fait ! Elle l'a vraiment fait ! |
| `commentateur_victoire_25.mp3` | Quel champion ! Quel mental ! Quelle main ! |
| `commentateur_victoire_25_f.mp3` | Quelle championne ! Quel mental ! Quelle main ! |
| `commentateur_victoire_26.mp3` | Il entre dans la légende du chifoumi ! |
| `commentateur_victoire_26_f.mp3` | Elle entre dans la légende du chifoumi ! |
| `commentateur_victoire_27.mp3` | On ne joue pas avec le destin, on le prend à pleine main ! |
| `commentateur_victoire_28.mp3` | C'est une victoire qui va laisser des traces dans les annales du sport ! |
| `commentateur_defaite_01.mp3` | Battu, mais pas abattu ! |
| `commentateur_defaite_01_f.mp3` | Battue, mais pas abattue ! |
| `commentateur_defaite_04.mp3` | Défaite, oui, mais avec les honneurs ! |
| `commentateur_defaite_05.mp3` | Il s'incline, mais la tête haute ! |
| `commentateur_defaite_05_f.mp3` | Elle s'incline, mais la tête haute ! |
| `commentateur_defaite_06.mp3` | Il n'a pas à rougir ! Il s'est battu jusqu'au bout ! |
| `commentateur_defaite_06_f.mp3` | Elle n'a pas à rougir ! Elle s'est battue jusqu'au bout ! |
| `commentateur_defaite_07.mp3` | Oula, la soirée a été difficile… |
| `commentateur_defaite_08.mp3` | Aïe aïe aïe ! Le couperet est tombé ! |
| `commentateur_defaite_09.mp3` | Quelle désillusion ! On y croyait pourtant ! |
| `commentateur_defaite_10.mp3` | C'est terrible ! Il était si près du bonheur ! |
| `commentateur_defaite_10_f.mp3` | C'est terrible ! Elle était si près du bonheur ! |
| `commentateur_defaite_11.mp3` | Un silence assourdissant dans le camp des perdants ! |
| `commentateur_memoire_ouverture_01_pierre.mp3` | La dernière fois, il avait ouvert avec la Pierre ! |
| `commentateur_memoire_ouverture_01_pierre_f.mp3` | La dernière fois, elle avait ouvert avec la Pierre ! |
| `commentateur_memoire_ouverture_01_ciseaux.mp3` | La dernière fois, il avait ouvert avec les Ciseaux ! |
| `commentateur_memoire_ouverture_01_ciseaux_f.mp3` | La dernière fois, elle avait ouvert avec les Ciseaux ! |
| `commentateur_memoire_ouverture_01_feuille.mp3` | La dernière fois, il avait ouvert avec la Feuille ! |
| `commentateur_memoire_ouverture_01_feuille_f.mp3` | La dernière fois, elle avait ouvert avec la Feuille ! |
| `commentateur_memoire_meme_ouverture_01.mp3` | Il rouvre comme au dernier match ! Il ose ! Il ose ! |
| `commentateur_memoire_meme_ouverture_01_f.mp3` | Elle rouvre comme au dernier match ! Elle ose ! Elle ose ! |
| `commentateur_memoire_change_ouverture_01.mp3` | Nouvelle ouverture ! Il a préparé ce match ! |
| `commentateur_memoire_change_ouverture_01_f.mp3` | Nouvelle ouverture ! Elle a préparé ce match ! |
| `commentateur_memoire_habitues_01.mp3` | Ces deux-là se connaissent par cœur ! Et ça promet ! |
| `commentateur_memoire_mene_01.mp3` | Il mène dans leurs confrontations ! L'autre veut sa revanche ! |
| `commentateur_memoire_mene_01_f.mp3` | Elle mène dans leurs confrontations ! L'autre veut sa revanche ! |
| `commentateur_memoire_jamais_battu_01.mp3` | Il n'a jamais battu cet adversaire ! Ce soir, peut-être ? |
| `commentateur_memoire_jamais_battu_01_f.mp3` | Elle n'a jamais battu cet adversaire ! Ce soir, peut-être ? |
| `commentateur_memoire_retrouvailles_01.mp3` | Ils se retrouvent pour la première fois depuis un moment ! |
| `commentateur_memoire_dernier_gagne_01.mp3` | Il reste sur une victoire contre lui ! Il veut la confirmer ! |
| `commentateur_memoire_dernier_gagne_01_f.mp3` | Elle reste sur une victoire ! Elle veut la confirmer ! |
| `commentateur_memoire_dernier_perdu_01.mp3` | La dernière fois, il avait perdu ! Il revient pour se venger ! |
| `commentateur_memoire_dernier_perdu_01_f.mp3` | La dernière fois, elle avait perdu ! Elle revient pour se venger ! |
| `commentateur_memoire_renverse_01.mp3` | La dernière fois, il avait renversé le match ! Le public n'a pas oublié ! |
| `commentateur_memoire_renverse_01_f.mp3` | La dernière fois, elle avait renversé le match ! Le public n'a pas oublié ! |
| `commentateur_memoire_defaite_seche_01.mp3` | Le dernier match s'était soldé par une défaite sèche… l'heure de la revanche a sonné ! |
| `commentateur_memoire_balle_sauvee_01.mp3` | Au dernier match, il avait sauvé une balle de match ! Le public s'en souvient ! |
| `commentateur_memoire_balle_sauvee_01_f.mp3` | Au dernier match, elle avait sauvé une balle de match ! Le public s'en souvient ! |
| `commentateur_memoire_serre_01.mp3` | Leur dernier match s'était joué sur un fil ! Ça promet ! |
| `commentateur_memoire_belle_01.mp3` | Égalité parfaite dans leurs face-à-face : c'est la belle, mesdames et messieurs ! |
| `commentateur_memoire_habitude_01.mp3` | Il a gagné les trois derniers ! Peut-on l'arrêter ? |
| `commentateur_memoire_habitude_01_f.mp3` | Elle a gagné les trois derniers ! Peut-on l'arrêter ? |
| `commentateur_avant_ambiance_01.mp3` | Écoutez-moi cette ambiance ! Les supporters sont déchaînés ce soir ! |
| `commentateur_avant_ambiance_02.mp3` | Vous entendez ça, Madame ? Le public est déjà chaud bouillant ! |
| `commentateur_avant_ambiance_03.mp3` | Quelle ferveur ! On se croirait en finale de Coupe du monde ! |
| `commentateur_avant_ambiance_04.mp3` | Les supporters sont chauds bouillants aujourd'hui ! |
| `commentateur_avant_ambiance_05.mp3` | Les supporters se sont déplacés en masse, et ça s'entend ! |
| `commentateur_avant_ambiance_06.mp3` | Chaude ambiance ce soir dans les gradins ! |
| `commentateur_avant_ambiance_07.mp3` | Les tribunes sont pleines à craquer ! Quel accueil pour les joueurs ! |
| `commentateur_avant_ambiance_08.mp3` | Ça chante dans tous les coins du stade ! Les joueurs vont avoir des frissons ! |
| `commentateur_avant_ambiance_09.mp3` | Le virage est en feu, et on n'a pas encore joué un seul point ! |
| `commentateur_avant_ambiance_10.mp3` | Les supporters donnent de la voix avant même le premier signe ! |
| `commentateur_perso_supporters_01.mp3` | Écoutez ça ! Les supporters ont fait le déplacement pour lui ! |
| `commentateur_perso_supporters_01_f.mp3` | Écoutez ça ! Les supporters ont fait le déplacement pour elle ! |
| `commentateur_perso_supporters_02.mp3` | Ils sont venus nombreux pour le soutenir ce soir ! Quelle ferveur ! |
| `commentateur_perso_supporters_02_f.mp3` | Ils sont venus nombreux pour la soutenir ce soir ! Quelle ferveur ! |
| `commentateur_perso_supporters_03.mp3` | Tout le public scande son nom ! Il joue à domicile ce soir ! |
| `commentateur_perso_supporters_03_f.mp3` | Tout le public scande son nom ! Elle joue à domicile ce soir ! |
| `commentateur_perso_chiromancien_presentation_01.mp3` | Mesdames et mesdames… celui qui lit dans les mains de ses adversaires… le Chiromancien ! |
| `commentateur_perso_chiromancien_presentation_02.mp3` | Il a vu votre défaite dans les lignes de votre main… Accueillez le Chiromancien ! |
| `commentateur_perso_chiromancien_lecture_01.mp3` | Le Chiromancien l'avait lu dans sa main ! |
| `commentateur_perso_chiromancien_lecture_02.mp3` | Encore une prédiction réussie pour le Chiromancien ! |
| `commentateur_perso_chiromancien_lecture_03.mp3` | Le Chiromancien voit tout venir ! |
| `commentateur_perso_chiromancien_perd_01.mp3` | Oula, le Chiromancien n'avait pas vu celle-là venir ! |
| `commentateur_perso_chiromancien_victoire_01.mp3` | Le Chiromancien l'avait prédit ! Victoire ! |
| `commentateur_perso_chiromancien_victoire_02.mp3` | Le Chiromancien est un vrai magicien ! |
| `commentateur_perso_chiromancien_feu_01.mp3` | Mesdames et mesdames, le Chiromancien est en feu ! |
| `commentateur_replay_intro_01.mp3` | Revoyons ça ! |
| `commentateur_replay_intro_02.mp3` | On le revoit au ralenti… Regardez-moi ça ! |
| `commentateur_replay_intro_03.mp3` | Attention, on revoit l'action ! |
| `commentateur_replay_intro_04.mp3` | Attention, ça va repasser au ralenti ! |
| `commentateur_replay_intro_05.mp3` | Revivons ce moment ensemble ! |
| `commentateur_replay_intro_06.mp3` | On rembobine ! Regardez bien ! |
| `commentateur_replay_intro_07.mp3` | Et maintenant, place aux images ! |
| `commentateur_replay_intro_08.mp3` | Ce point mérite bien un deuxième visionnage ! |
| `commentateur_replay_intro_09.mp3` | Quel moment de sport ! On ne s'en lasse pas ! |
| `commentateur_replay_debut_01.mp3` | On revoit les moments forts de ce match ! D'abord, celui-ci ! |
| `commentateur_replay_debut_02.mp3` | Les temps forts de ce match ! On commence par ce coup-là ! |
| `commentateur_replay_debut_03.mp3` | Revivons les grands moments de ce match ! Le premier… |
| `commentateur_replay_ensuite_01.mp3` | Ensuite, il y a eu ce coup ! |
| `commentateur_replay_ensuite_02.mp3` | Et puis, il y a eu ce moment-là ! |
| `commentateur_replay_ensuite_03.mp3` | Un peu plus tard, regardez bien ! |
| `commentateur_replay_enfin_01.mp3` | Et enfin, on revoit ce coup ! |
| `commentateur_replay_enfin_02.mp3` | Et pour finir, le moment que tout le monde attendait ! |
| `commentateur_replay_enfin_03.mp3` | Enfin, le dernier temps fort de ce match ! |
| `commentateur_replay_sauvee_01.mp3` | Regardez ce sang-froid ! Il était au bord du gouffre ! |
| `commentateur_replay_sauvee_01_f.mp3` | Regardez ce sang-froid ! Elle était au bord du gouffre ! |
| `commentateur_replay_sauvee_02.mp3` | On revoit la balle sauvée ! Quel sang-froid ! |
| `commentateur_replay_sauvee_03.mp3` | Il a bien résisté à la pression adverse, et s'est dégagé magistralement ! |
| `commentateur_replay_sauvee_03_f.mp3` | Elle a bien résisté à la pression adverse, et s'est dégagée magistralement ! |
| `commentateur_replay_smash_01.mp3` | Regardez cette belle technique ! Le geste était parfait ! |
| `commentateur_replay_smash_02.mp3` | Revoyons ce smash ! Quelle frappe ! |
| `commentateur_replay_smash_03.mp3` | On revoit ce choc : il n'y est pas allé de main morte ! |
| `commentateur_replay_smash_03_f.mp3` | On revoit ce choc : elle n'y est pas allée de main morte ! |
| `commentateur_replay_set_01.mp3` | Le coup qui a fait basculer le set ! |
| `commentateur_replay_set_02.mp3` | Le point du set, au ralenti ! |
| `commentateur_replay_serie_01.mp3` | Il n'a rien lâché ! |
| `commentateur_replay_serie_01_f.mp3` | Elle n'a rien lâché ! |
| `commentateur_replay_serie_02.mp3` | Regardez cette série ! Il n'a rien lâché ! |
| `commentateur_replay_serie_02_f.mp3` | Regardez cette série ! Elle n'a rien lâché ! |
| `commentateur_replay_r_piege_01.mp3` | On voit le coup : il a enchaîné les Pierres, et il est venu cueillir son adversaire avec les Ciseaux. Magnifique mouvement ! |
| `commentateur_replay_r_piege_01_f.mp3` | On voit le coup : elle a enchaîné les Pierres, et elle est venue cueillir son adversaire avec les Ciseaux. Magnifique mouvement ! |
| `commentateur_replay_r_piege_02.mp3` | On voit le coup : il a enchaîné les Pierres, et il est venu cueillir son adversaire avec la Feuille. Magnifique mouvement ! |
| `commentateur_replay_r_piege_02_f.mp3` | On voit le coup : elle a enchaîné les Pierres, et elle est venue cueillir son adversaire avec la Feuille. Magnifique mouvement ! |
| `commentateur_replay_r_piege_03.mp3` | On voit le coup : il a enchaîné les Ciseaux, et il est venu cueillir son adversaire avec la Pierre. Magnifique mouvement ! |
| `commentateur_replay_r_piege_03_f.mp3` | On voit le coup : elle a enchaîné les Ciseaux, et elle est venue cueillir son adversaire avec la Pierre. Magnifique mouvement ! |
| `commentateur_replay_r_piege_04.mp3` | On voit le coup : il a enchaîné les Ciseaux, et il est venu cueillir son adversaire avec la Feuille. Magnifique mouvement ! |
| `commentateur_replay_r_piege_04_f.mp3` | On voit le coup : elle a enchaîné les Ciseaux, et elle est venue cueillir son adversaire avec la Feuille. Magnifique mouvement ! |
| `commentateur_replay_r_piege_05.mp3` | On voit le coup : il a enchaîné les Feuilles, et il est venu cueillir son adversaire avec la Pierre. Magnifique mouvement ! |
| `commentateur_replay_r_piege_05_f.mp3` | On voit le coup : elle a enchaîné les Feuilles, et elle est venue cueillir son adversaire avec la Pierre. Magnifique mouvement ! |
| `commentateur_replay_r_piege_06.mp3` | On voit le coup : il a enchaîné les Feuilles, et il est venu cueillir son adversaire avec les Ciseaux. Magnifique mouvement ! |
| `commentateur_replay_r_piege_06_f.mp3` | On voit le coup : elle a enchaîné les Feuilles, et elle est venue cueillir son adversaire avec les Ciseaux. Magnifique mouvement ! |
| `commentateur_replay_r_piege_07.mp3` | Regardez bien : Pierre, Pierre, Pierre… et là, les Ciseaux ! L'adversaire n'a rien vu venir ! |
| `commentateur_replay_r_piege_08.mp3` | Regardez bien : Pierre, Pierre, Pierre… et là, la Feuille ! L'adversaire n'a rien vu venir ! |
| `commentateur_replay_r_piege_09.mp3` | Regardez bien : Ciseaux, Ciseaux, Ciseaux… et là, la Pierre ! L'adversaire n'a rien vu venir ! |
| `commentateur_replay_r_piege_10.mp3` | Regardez bien : Ciseaux, Ciseaux, Ciseaux… et là, la Feuille ! L'adversaire n'a rien vu venir ! |
| `commentateur_replay_r_piege_11.mp3` | Regardez bien : Feuille, Feuille, Feuille… et là, la Pierre ! L'adversaire n'a rien vu venir ! |
| `commentateur_replay_r_piege_12.mp3` | Regardez bien : Feuille, Feuille, Feuille… et là, les Ciseaux ! L'adversaire n'a rien vu venir ! |
| `commentateur_replay_r_pertinent_01.mp3` | Oh, regardez : il avait repéré l'habitude, et il a frappé au bon moment ! |
| `commentateur_replay_r_pertinent_01_f.mp3` | Oh, regardez : elle avait repéré l'habitude, et elle a frappé au bon moment ! |
| `commentateur_replay_r_pertinent_02.mp3` | Il l'avait vu venir de loin ! Lecture parfaite ! |
| `commentateur_replay_r_pertinent_02_f.mp3` | Elle l'avait vu venir de loin ! Lecture parfaite ! |
| `commentateur_replay_r_pertinent_03.mp3` | Ah, regardez-moi ça ! Il a lu dans son jeu comme dans un livre ouvert ! |
| `commentateur_replay_r_pertinent_03_f.mp3` | Ah, regardez-moi ça ! Elle a lu dans son jeu comme dans un livre ouvert ! |
| `commentateur_replay_r_pertinent_04.mp3` | Et voilà le travail ! Il attendait ce moment depuis trois coups ! |
| `commentateur_replay_r_pertinent_04_f.mp3` | Et voilà le travail ! Elle attendait ce moment depuis trois coups ! |
| `commentateur_replay_r_pertinent_05.mp3` | Oh, la patience ! Il a attendu, attendu… et paf ! |
| `commentateur_replay_r_pertinent_05_f.mp3` | Oh, la patience ! Elle a attendu, attendu… et paf ! |
| `commentateur_replay_r_propre_01.mp3` | Et là, il a tout changé ! L'adversaire attendait encore la même chose ! |
| `commentateur_replay_r_propre_01_f.mp3` | Et là, elle a tout changé ! L'adversaire attendait encore la même chose ! |
| `commentateur_replay_r_propre_02.mp3` | Et là, surprise ! Personne ne s'y attendait ! |
| `commentateur_replay_r_propre_03.mp3` | Oh, le changement de rythme ! L'adversaire a été pris à contre-pied ! |
| `commentateur_replay_r_propre_04.mp3` | Ah, il a senti le moment ! Il a changé, et ça a payé ! |
| `commentateur_replay_r_propre_04_f.mp3` | Ah, elle a senti le moment ! Elle a changé, et ça a payé ! |
| `commentateur_replay_r_propre_05.mp3` | Il a cassé la routine au moment parfait ! Superbe ! |
| `commentateur_replay_r_propre_05_f.mp3` | Elle a cassé la routine au moment parfait ! Superbe ! |
| `commentateur_replay_r_mauvais_01.mp3` | Oula… Il est retombé dans ses travers, et ça s'est payé cash ! |
| `commentateur_replay_r_mauvais_01_f.mp3` | Oula… Elle est retombée dans ses travers, et ça s'est payé cash ! |
| `commentateur_replay_r_mauvais_02.mp3` | Aïe… Encore le même signe ! L'adversaire n'attendait que ça ! |
| `commentateur_replay_r_mauvais_03.mp3` | Oula, il s'est fait cueillir ! Trop prévisible ! |
| `commentateur_replay_r_mauvais_03_f.mp3` | Oula, elle s'est fait cueillir ! Trop prévisible ! |
| `commentateur_replay_r_mauvais_04.mp3` | Oh non… Il a répété une fois de trop ! |
| `commentateur_replay_r_mauvais_04_f.mp3` | Oh non… Elle a répété une fois de trop ! |
| `commentateur_replay_r_mauvais_05.mp3` | Et voilà le prix de l'habitude ! Ça ne pardonne pas ! |
| `commentateur_replay_r_smash_01.mp3` | Ce smash, c'est un message : le patron, c'est moi ! |
| `commentateur_replay_r_smash_02.mp3` | Revoyez-moi cette frappe ! Ça fait mal rien qu'à regarder ! |
| `commentateur_replay_r_smash_03.mp3` | Oh, le smash ! Au ralenti, c'est encore plus violent ! |
| `commentateur_replay_r_smash_04.mp3` | Quel coup de massue ! L'adversaire n'a rien vu venir ! |
| `commentateur_replay_r_smash_subi_01.mp3` | Oula, il l'a pris en pleine figure, ce smash ! |
| `commentateur_replay_r_smash_subi_01_f.mp3` | Oula, elle l'a pris en pleine figure, ce smash ! |
| `commentateur_replay_r_smash_subi_02.mp3` | Aïe, aïe, aïe ! Regardez ses doigts, il ne s'en est pas remis ! |
| `commentateur_replay_r_smash_subi_02_f.mp3` | Aïe, aïe, aïe ! Regardez ses doigts, elle ne s'en est pas remise ! |
| `commentateur_replay_r_smash_subi_03.mp3` | Oula, ce smash, il va le sentir encore demain ! |
| `commentateur_replay_r_smash_subi_03_f.mp3` | Oula, ce smash, elle va le sentir encore demain ! |
| `commentateur_replay_r_smash_subi_04.mp3` | Il a encaissé… et il n'a jamais vraiment récupéré ! |
| `commentateur_replay_r_smash_subi_04_f.mp3` | Elle a encaissé… et elle n'a jamais vraiment récupéré ! |
| `commentateur_replay_r_pas_la_04.mp3` | Oh là là, mauvais choix ! Il ne fallait pas faire ça ! |
| `commentateur_replay_r_pas_la_05.mp3` | Oula, c'était évident ! Il ne fallait surtout pas jouer ce coup-là ! |
| `commentateur_replay_r_pas_la_06.mp3` | Aïe, aïe, aïe… La mauvaise décision au pire moment ! |
| `commentateur_replay_r_pas_la_07.mp3` | Mais qu'est-ce qu'il a fait ? Tout le monde l'avait vu venir, sauf lui ! |
| `commentateur_replay_r_pas_la_07_f.mp3` | Mais qu'est-ce qu'elle a fait ? Tout le monde l'avait vu venir, sauf elle ! |
| `commentateur_replay_r_pas_la_08_pierre.mp3` | Oh non, pas la Pierre ! Pas là ! |
| `commentateur_replay_r_pas_la_08_ciseaux.mp3` | Oh non, pas les Ciseaux ! Pas là ! |
| `commentateur_replay_r_pas_la_08_feuille.mp3` | Oh non, pas la Feuille ! Pas là ! |
| `commentateur_replay_r_pas_la_09.mp3` | Aïe… Il n'a pas été attentif, et il s'est fait surprendre ! |
| `commentateur_replay_r_pas_la_09_f.mp3` | Aïe… Elle n'a pas été attentive, et elle s'est fait surprendre ! |
| `commentateur_memoire_serie_3_01.mp3` | Trois victoires de suite ! Il arrive en confiance ! |
| `commentateur_memoire_serie_3_01_f.mp3` | Trois victoires de suite ! Elle arrive en confiance ! |
| `commentateur_memoire_serie_4_01.mp3` | Quatre victoires d'affilée ! Qui va enfin l'arrêter ? |
| `commentateur_memoire_serie_5_01.mp3` | Cinq victoires de suite contre lui ! C'est une série historique ! |
| `commentateur_memoire_serie_plus_01.mp3` | Une série incroyable ! Il est intouchable dans ce face-à-face ! |
| `commentateur_memoire_serie_plus_01_f.mp3` | Une série incroyable ! Elle est intouchable dans ce face-à-face ! |
| `commentateur_beau_coup_01.mp3` | Il l'a pétrifié ! |
| `commentateur_beau_coup_01_f.mp3` | Elle l'a pétrifié ! |
| `commentateur_beau_coup_02.mp3` | Pierre après pierre, il bâtit sa légende ! |
| `commentateur_beau_coup_02_f.mp3` | Pierre après pierre, elle bâtit sa légende ! |
| `commentateur_beau_coup_03.mp3` | Il lui jette la pierre, Pierre ! |
| `commentateur_beau_coup_03_f.mp3` | Elle lui jette la pierre, Pierre ! |
| `commentateur_beau_coup_04.mp3` | Un coup magnifiquement ciselé ! |
| `commentateur_beau_coup_05.mp3` | C'est l'effet ciseaux ! |
| `commentateur_beau_coup_06.mp3` | Un coup de ciseaux chirurgical ! |
| `commentateur_beau_coup_07.mp3` | Magnifique ciseau retourné ! |
| `commentateur_beau_coup_08.mp3` | Une coupe parfaite ! Sanction immédiate ! |
| `commentateur_beau_coup_09.mp3` | Il vient de raccourcir les ambitions de son rival ! |
| `commentateur_beau_coup_09_f.mp3` | Elle vient de raccourcir les ambitions de son rival ! |
| `commentateur_beau_coup_10.mp3` | La feuille est en deux, et les espoirs aussi ! |
| `commentateur_beau_coup_11.mp3` | Et c'est le coup du millefeuille ! |
| `commentateur_beau_coup_12.mp3` | La Feuille enveloppe tout ! |
| `commentateur_beau_coup_13.mp3` | Un coup tout en douceur ! La Feuille a parlé ! |
| `commentateur_beau_coup_14.mp3` | Il reste solide sur ses appuis ! |
| `commentateur_beau_coup_14_f.mp3` | Elle reste solide sur ses appuis ! |
| `commentateur_beau_coup_15.mp3` | Oh, quel geste ! |
| `commentateur_beau_coup_16.mp3` | Du grand art ! |
| `commentateur_beau_coup_17.mp3` | Somptueux ! |
| `commentateur_beau_coup_18.mp3` | Une main de fer dans un gant de velours ! |
| `commentateur_beau_coup_19.mp3` | De main de maître ! |
| `commentateur_beau_coup_20.mp3` | Ah, la main heureuse ! |
| `commentateur_beau_coup_21.mp3` | Un geste de grande classe ! |
| `commentateur_beau_coup_22.mp3` | Ah, la belle inspiration ! |
| `commentateur_beau_coup_23.mp3` | Il a sorti une pierre ! Une pierre de caractère ! |
| `commentateur_beau_coup_23_f.mp3` | Elle a sorti une pierre ! Une pierre de caractère ! |
| `commentateur_trois_pierres_01.mp3` | Il opte pour une défense en catenaccio ! |
| `commentateur_trois_pierres_01_f.mp3` | Elle opte pour une défense en catenaccio ! |
| `commentateur_trois_pierres_02.mp3` | Trois Pierres, trois points ! Du béton armé ! |
| `commentateur_trois_ciseaux_01.mp3` | Trois fois les Ciseaux ! Ça coupe, ça coupe, ça coupe ! |
| `commentateur_trois_ciseaux_02.mp3` | Oh, trois Ciseaux d'affilée ! Coupe nette ! |
| `commentateur_trois_feuilles_01.mp3` | Trois Feuilles gagnantes ! Il écrit son roman ! |
| `commentateur_trois_feuilles_01_f.mp3` | Trois Feuilles gagnantes ! Elle écrit son roman ! |
| `commentateur_trois_feuilles_02.mp3` | Trois Feuilles gagnantes ! Il enveloppe tout ! |
| `commentateur_trois_feuilles_02_f.mp3` | Trois Feuilles gagnantes ! Elle enveloppe tout ! |
| `commentateur_premiere_egalite_01.mp3` | Premier coup… même signe ! Ils se neutralisent ! |
| `commentateur_premiere_egalite_02.mp3` | Même idée dès le premier coup ! Ça promet ! |
| `commentateur_premiere_egalite_03.mp3` | Ah, ils pensent pareil ! Ça va être long ! |
| `commentateur_premiere_egalite_04.mp3` | Oh, même idée dès le départ ! |
| `commentateur_premiere_egalite_05.mp3` | Ils se sont lus avant même de commencer ! |
| `commentateur_apres_egalites_gagne_01.mp3` | Une feinte, une parade, une riposte ! Quel échange ! |
| `commentateur_apres_egalites_gagne_02.mp3` | Il a fini par trouver la faille ! |
| `commentateur_apres_egalites_gagne_02_f.mp3` | Elle a fini par trouver la faille ! |
| `commentateur_apres_egalites_gagne_03.mp3` | Enfin ! Le duel d'esprits a un vainqueur ! |
| `commentateur_apres_egalites_gagne_04.mp3` | Il a lu dans ses pensées ! |
| `commentateur_apres_egalites_gagne_04_f.mp3` | Elle a lu dans ses pensées ! |
| `commentateur_apres_egalites_gagne_05.mp3` | Ah, enfin ! Le verrou saute ! |
| `commentateur_apres_egalites_gagne_06.mp3` | Après la guerre des nerfs, la délivrance ! |
| `commentateur_apres_egalites_gagne_07.mp3` | Un pari ! Un pur pari ! Et ça passe ! |
| `commentateur_apres_egalites_gagne_08.mp3` | Rien à lire, tout à risquer ! Et il ose ! |
| `commentateur_apres_egalites_gagne_08_f.mp3` | Rien à lire, tout à risquer ! Et elle ose ! |
| `commentateur_apres_egalites_gagne_09.mp3` | Ah, à pile ou face, et il tombe du bon côté ! |
| `commentateur_apres_egalites_gagne_09_f.mp3` | Ah, à pile ou face, et elle tombe du bon côté ! |
| `commentateur_apres_egalites_perdu_01.mp3` | Oh, la feinte de la feinte de la feinte… ça a failli passer ! |
| `commentateur_apres_egalites_perdu_02.mp3` | Le duel d'esprits a tourné court ! |
| `commentateur_apres_egalites_perdu_03.mp3` | Oula, il a craqué le premier ! |
| `commentateur_apres_egalites_perdu_03_f.mp3` | Oula, elle a craqué la première ! |
| `commentateur_apres_egalites_perdu_04.mp3` | Le duel d'esprits a choisi son camp, et ce n'est pas le sien ! |
| `commentateur_cueilli_a_froid_01.mp3` | Il a cueilli à froid son adversaire ! |
| `commentateur_cueilli_a_froid_01_f.mp3` | Elle a cueilli à froid son adversaire ! |
| `commentateur_cueilli_a_froid_02.mp3` | Il vient de climatiser l'arène ! |
| `commentateur_cueilli_a_froid_02_f.mp3` | Elle vient de climatiser l'arène ! |
| `commentateur_cueilli_a_froid_03.mp3` | Une ouverture magistrale : ça fait trois à zéro ! |
| `commentateur_cueilli_a_froid_04.mp3` | Quelle entame ! Il part pied au plancher ! |
| `commentateur_cueilli_a_froid_04_f.mp3` | Quelle entame ! Elle part pied au plancher ! |
| `commentateur_cueilli_a_froid_05.mp3` | Oh, le départ canon ! |
| `commentateur_ouverture_egalites_01.mp3` | On est en plein round d'observation ! |
| `commentateur_ouverture_egalites_02.mp3` | Duel à haute intensité ! |
| `commentateur_ouverture_egalites_03.mp3` | Personne ne recule ! |
| `commentateur_ouverture_egalites_04.mp3` | Ça se jauge, ça se renifle ! |
| `commentateur_ouverture_egalites_05.mp3` | Prudence de part et d'autre ! |
| `commentateur_contre_cours_01.mp3` | Il marque contre le cours du jeu ! |
| `commentateur_contre_cours_01_f.mp3` | Elle marque contre le cours du jeu ! |
| `commentateur_contre_cours_02.mp3` | Ah, il reprend la main ! |
| `commentateur_contre_cours_02_f.mp3` | Ah, elle reprend la main ! |
| `commentateur_contre_cours_03.mp3` | Ah ! Le point qui casse la série adverse ! |
| `commentateur_contre_cours_04.mp3` | Il stoppe l'hémorragie ! Et au bon moment ! |
| `commentateur_contre_cours_04_f.mp3` | Elle stoppe l'hémorragie ! Et au bon moment ! |
| `commentateur_contre_cours_05.mp3` | La série est brisée ! Tout est relancé ! |
| `commentateur_riposte_01.mp3` | La réponse du berger à la bergère ! |
| `commentateur_riposte_02.mp3` | Il répond du tac au tac ! |
| `commentateur_riposte_02_f.mp3` | Elle répond du tac au tac ! |
| `commentateur_riposte_03.mp3` | Retour à l'envoyeur ! |
| `commentateur_riposte_04.mp3` | Il répond immédiatement ! |
| `commentateur_riposte_04_f.mp3` | Elle répond immédiatement ! |
| `commentateur_riposte_05.mp3` | Pas le temps de gamberger, il recolle aussitôt ! |
| `commentateur_riposte_05_f.mp3` | Pas le temps de gamberger, elle recolle aussitôt ! |
| `commentateur_riposte_06.mp3` | Coup pour coup ! Quel duel ! |
| `commentateur_cadrage_01.mp3` | Cadrage avec la Feuille et débordement avec la Pierre ! |
| `commentateur_cadrage_02.mp3` | La Feuille pour fixer, la Pierre pour conclure ! Du grand classique ! |
| `commentateur_cadrage_03.mp3` | Oh, le une-deux parfait ! |
| `commentateur_quatre_meme_01.mp3` | Encore ! Il ne veut plus le lâcher, ce signe ! |
| `commentateur_quatre_meme_01_f.mp3` | Encore ! Elle ne veut plus le lâcher, ce signe ! |
| `commentateur_quatre_meme_02.mp3` | Oh, la même chose, encore et encore ! |
| `commentateur_chasse_patate_01.mp3` | Il est en chasse-patate ! |
| `commentateur_chasse_patate_01_f.mp3` | Elle est en chasse-patate ! |
| `commentateur_chasse_patate_02.mp3` | Il reste dans la roue de son adversaire ! |
| `commentateur_chasse_patate_02_f.mp3` | Elle reste dans la roue de son adversaire ! |
| `commentateur_chasse_patate_03.mp3` | Il ne lâche pas l'affaire ! Il revient encore ! |
| `commentateur_chasse_patate_03_f.mp3` | Elle ne lâche pas l'affaire ! Elle revient encore ! |
| `commentateur_chasse_patate_04.mp3` | Toujours à la poursuite, jamais distancé ! |
| `commentateur_chasse_patate_04_f.mp3` | Toujours à la poursuite, jamais distancée ! |
| `commentateur_money_time_01.mp3` | On entre dans le money time, chaque main compte ! |
| `commentateur_money_time_02.mp3` | Ils sont à la lutte, au coude à coude ! |
| `commentateur_money_time_03.mp3` | On arrive dans le dur ! Chaque point vaut de l'or ! |
| `commentateur_money_time_04.mp3` | Huit partout ! Le set entre dans sa dernière ligne droite ! |
| `commentateur_money_time_05.mp3` | Oh, ça se resserre ! Plus personne ne peut se permettre la moindre erreur ! |
| `commentateur_money_time_06.mp3` | Le money time, mesdames et messieurs ! Accrochez-vous ! |
| `commentateur_money_time_07.mp3` | Attention ! Ça peut basculer à tout moment ! |
| `commentateur_rate_money_time_01.mp3` | Oh non, pas ça, pas maintenant ! |
| `commentateur_rate_money_time_02.mp3` | Aïe ! Le point qui fait mal au pire moment ! |
| `commentateur_rate_money_time_03.mp3` | Oula, ça, ça peut coûter le set ! |
| `commentateur_rate_money_time_04.mp3` | Le coup est rude ! Il va falloir réagir tout de suite ! |
| `commentateur_le_break_01.mp3` | Il fait le break ! |
| `commentateur_le_break_01_f.mp3` | Elle fait le break ! |
| `commentateur_le_break_02.mp3` | Et un nouveau point : il a désormais deux longueurs d'avance ! |
| `commentateur_le_break_02_f.mp3` | Et un nouveau point : elle a désormais deux longueurs d'avance ! |
| `commentateur_lecon_01.mp3` | Ah, c'est une leçon qu'il est en train de lui donner ! |
| `commentateur_lecon_01_f.mp3` | Ah, c'est une leçon qu'elle est en train de lui donner ! |
| `commentateur_lecon_02.mp3` | C'est un récital ! |
| `commentateur_lecon_03.mp3` | Il dicte le tempo, l'autre a du mal à suivre ! |
| `commentateur_lecon_03_f.mp3` | Elle dicte le tempo, l'autre a du mal à suivre ! |
| `commentateur_lecon_04.mp3` | C'est un cavalier seul ! |
| `commentateur_lecon_05.mp3` | Oula, l'écart se creuse dangereusement ! |
| `commentateur_prolongations_01.mp3` | Oh, on est dans le temps additionnel ! |
| `commentateur_prolongations_02.mp3` | Ça ne veut pas finir ! Quel set ! |
| `commentateur_prolongations_03.mp3` | Personne ne veut lâcher ce set ! |
| `commentateur_tout_a_refaire_01.mp3` | Il avait fait le plus dur, et tout est à refaire ! |
| `commentateur_tout_a_refaire_01_f.mp3` | Elle avait fait le plus dur, et tout est à refaire ! |
| `commentateur_tout_a_refaire_02.mp3` | Retour à la case départ ! |
| `commentateur_tout_a_refaire_03.mp3` | Oula, tout le bénéfice s'envole ! |
| `commentateur_faille_ratee_01.mp3` | Il a tenté le coup de maître… raté ! |
| `commentateur_faille_ratee_01_f.mp3` | Elle a tenté le coup de maître… raté ! |
| `commentateur_faille_ratee_02.mp3` | Oula, il s'est fait lire à son tour ! |
| `commentateur_faille_ratee_02_f.mp3` | Oula, elle s'est fait lire à son tour ! |
| `commentateur_divers_01.mp3` | Il alterne bien son jeu ! |
| `commentateur_divers_01_f.mp3` | Elle alterne bien son jeu ! |
| `commentateur_divers_02.mp3` | Il varie bien son jeu ! |
| `commentateur_divers_02_f.mp3` | Elle varie bien son jeu ! |
| `commentateur_divers_03.mp3` | Il est en rythme, en jambes ! |
| `commentateur_divers_03_f.mp3` | Elle est en rythme, en jambes ! |
| `commentateur_divers_04.mp3` | Un enchaînement parfaitement exécuté ! |
| `commentateur_divers_05.mp3` | Il se bat comme un beau diable ! |
| `commentateur_divers_05_f.mp3` | Elle se bat comme un beau diable ! |
| `commentateur_divers_06.mp3` | Il joue juste, gros QI chi-fou-mi sur le central ! |
| `commentateur_divers_06_f.mp3` | Elle joue juste, gros QI chi-fou-mi sur le central ! |
| `commentateur_divers_07.mp3` | Le joueur affiche une très belle attitude. |
| `commentateur_divers_07_f.mp3` | La joueuse affiche une très belle attitude. |
| `commentateur_divers_08.mp3` | Si vous n'aimez pas ça, vous n'aimez pas le chi-fou-mi ! |
| `commentateur_divers_09.mp3` | Quelle ambiance ce soir sur le central ! |
| `commentateur_divers_10.mp3` | Le chifoumi, c'est la vie ! |
| `commentateur_divers_11.mp3` | On ne s'ennuie pas une seconde ! |
| `commentateur_divers_12.mp3` | Ah, quel plaisir de commenter un tel match ! |
| `commentateur_divers_13.mp3` | Quelle audace ! Quelle prise de risque ! |
| `commentateur_divers_14.mp3` | Les mains ont parlé ! |
| `commentateur_divers_15.mp3` | Quel duel psychologique ! On est à deux doigts du génie ! |
| `commentateur_divers_16.mp3` | Il a joué sa carte… enfin, sa main ! |
| `commentateur_divers_16_f.mp3` | Elle a joué sa carte… enfin, sa main ! |
| `commentateur_divers_17.mp3` | Le destin vient de choisir son camp ! |
| `commentateur_premier_point_perdu_01.mp3` | Premier point pour l'adversaire ! Rien n'est joué ! |
| `commentateur_premier_point_perdu_02.mp3` | Il se fait surprendre ! |
| `commentateur_premier_point_perdu_02_f.mp3` | Elle se fait surprendre ! |
| `commentateur_premier_point_perdu_03.mp3` | Ce n'est qu'un point ! Le match est long ! |
| `commentateur_premier_point_perdu_04.mp3` | Oula, il démarre au ralenti ! |
| `commentateur_premier_point_perdu_04_f.mp3` | Oula, elle démarre au ralenti ! |
| `commentateur_presentation_direct_01.mp3` | Bienvenue ! Nous sommes en direct du court central. Mesdames et messieurs, bonsoir ! |
| `commentateur_presentation_direct_02.mp3` | Bienvenue ! Nous sommes en direct du court central. Mesdames et messieurs, bonjour ! |
| `commentateur_presentation_direct_03.mp3` | Nous sommes en direct du court central. Bonsoir ! |
| `commentateur_presentation_direct_04.mp3` | Nous sommes en direct du court central. Bonjour ! |
| `commentateur_presentation_direct_05.mp3` | Bienvenue pour ce match de gala, en direct du court central. Mesdames et messieurs, bonsoir ! |
| `commentateur_presentation_direct_06.mp3` | Bienvenue pour ce match de gala, en direct du court central. Mesdames et messieurs, bonjour ! |
| `commentateur_presentation_direct_07.mp3` | Mesdames et messieurs, bonsoir, et bienvenue sur le court central ! |
| `commentateur_presentation_direct_08.mp3` | Mesdames et messieurs, bonjour, et bienvenue sur le court central ! |
| `commentateur_presentation_direct_09.mp3` | Bonsoir à toutes et à tous ! Nous voici en direct du court central. |
| `commentateur_presentation_direct_10.mp3` | Bonjour à toutes et à tous ! Nous voici en direct du court central. |
| `commentateur_presentation_direct_11.mp3` | Le court central est plein à craquer. Bonsoir, et bienvenue ! |
| `commentateur_presentation_direct_12.mp3` | Le court central est plein à craquer. Bonjour, et bienvenue ! |
| `commentateur_presentation_direct_13.mp3` | En direct du court central, bonsoir et bienvenue dans ce rendez-vous du HandSlam ! |
| `commentateur_presentation_direct_14.mp3` | En direct du court central, bonjour et bienvenue dans ce rendez-vous du HandSlam ! |
| `commentateur_presentation_direct_15.mp3` | Bonsoir et bienvenue ! Les lumières sont allumées sur le court central. |
| `commentateur_presentation_direct_16.mp3` | Bonjour et bienvenue ! Les lumières sont allumées sur le court central. |
| `commentateur_presentation_direct_17.mp3` | Bienvenue sur le court central ! |
| `commentateur_presentation_direct_18.mp3` | Bienvenue à vous qui nous rejoignez en direct du court central ! |
| `commentateur_presentation_direct_19.mp3` | Bienvenue au cœur du court central, où tout est prêt pour le spectacle ! |
| `commentateur_presentation_direct_20.mp3` | Mesdames et messieurs, installez-vous : nous sommes en direct du court central ! |
| `commentateur_avant_seul_01.mp3` | Affrontement sous haute tension ! |
| `commentateur_avant_seul_02.mp3` | Les deux joueurs entrent dans l'arène. Pas un sourire. Pas un regard de trop. |
| `commentateur_avant_seul_03.mp3` | Les mains sont prêtes, les esprits sont affûtés. Le spectacle peut commencer ! |
| `commentateur_avant_seul_04.mp3` | La pression monte, les poignets sont chauds ! |
| `commentateur_avant_seul_05.mp3` | Les supporters adverses, qui ont fait le déplacement, font entendre leur voix. Un dispositif de sécurité renforcé a été déployé, et toutes les mains à l'effigie des Ciseaux ont été retirées. |
| `commentateur_avant_seul_06.mp3` | C'est l'heure de vérité pour les deux compétiteurs qui entrent en lice. On va voir si les séances vidéo, l'analyse des data et les gammes répétées tout au long de la semaine vont porter leurs fruits. |
| `commentateur_avant_seul_grand_01.mp3` | Parfum de Ligue des champions ce soir ! |
| `commentateur_avant_seul_grand_02.mp3` | La victoire ou la misère : pas d'autre alternative pour les deux mains qui rejoignent le central. |
| `commentateur_avant_seul_grand_03.mp3` | Bienvenue pour notre match grand format. Le central est à guichet fermé, pour une rencontre au parfum de Ligue des champions. |
| `commentateur_avant_seul_revanche_01.mp3` | Rencontre de gala ce soir sur le central, avec deux adversaires qui se connaissent parfaitement. |
| `commentateur_avant_seul_amis_01.mp3` | Amis dans la vie, ennemis dans l'arène ! Enfin, c'est ce qu'ils racontent avant le premier coup. |
| `commentateur_smash_reussi_01.mp3` | QUEL SMASH ! |
| `commentateur_smash_reussi_02.mp3` | Il a tout mis dans ce coup ! |
| `commentateur_smash_reussi_02_f.mp3` | Elle a tout mis dans ce coup ! |
| `commentateur_smash_reussi_03.mp3` | Le smash est passé ! Imparable ! |
| `commentateur_smash_reussi_04.mp3` | Ça, c'est un coup de massue ! |
| `commentateur_smash_reussi_05.mp3` | Avec autorité ! |
| `commentateur_smash_reussi_06.mp3` | Il monte au filet, et ça paye ! |
| `commentateur_smash_reussi_06_f.mp3` | Elle monte au filet, et ça paye ! |
| `commentateur_smash_reussi_07.mp3` | C'est le point du K.-O. ! |
| `commentateur_smash_reussi_08.mp3` | Il éteint son adversaire ! |
| `commentateur_smash_reussi_08_f.mp3` | Elle éteint son adversaire ! |
| `commentateur_smash_reussi_09.mp3` | Il fait montre de tout son talent ! |
| `commentateur_smash_reussi_09_f.mp3` | Elle fait montre de tout son talent ! |
| `commentateur_smash_reussi_10.mp3` | Il est en train de rentrer dans la tête de son adversaire ! |
| `commentateur_smash_reussi_10_f.mp3` | Elle est en train de rentrer dans la tête de son adversaire ! |
| `commentateur_smash_reussi_11.mp3` | La feuille A4 ! Format grand smash ! |
| `commentateur_smash_reussi_12.mp3` | La cisaille ! Il a tout tranché ! |
| `commentateur_smash_reussi_12_f.mp3` | La cisaille ! Elle a tout tranché ! |
| `commentateur_smash_reussi_13.mp3` | Le rocher dévale ! Rien ne l'arrête ! |
| `commentateur_smash_reussi_14.mp3` | Il secoue le cocotier ! |
| `commentateur_smash_reussi_14_f.mp3` | Elle secoue le cocotier ! |
| `commentateur_smash_reussi_15.mp3` | Il tape du poing sur la table ! |
| `commentateur_smash_reussi_15_f.mp3` | Elle tape du poing sur la table ! |
| `commentateur_smash_reussi_16.mp3` | Coup de canon ! |
| `commentateur_smash_reussi_17.mp3` | Imparable ! |
| `commentateur_smash_reussi_18.mp3` | Oula ! Il n'y est pas allé de main morte ! |
| `commentateur_smash_reussi_18_f.mp3` | Oula ! Elle n'y est pas allée de main morte ! |
| `commentateur_smash_reussi_19.mp3` | Oh, le smash spectaculaire ! Il épate la galerie ! |
| `commentateur_smash_reussi_19_f.mp3` | Oh, le smash spectaculaire ! Elle épate la galerie ! |
| `commentateur_smash_reussi_20.mp3` | C'était à quitte ou double : ce sera double ! |
| `commentateur_smash_reussi_21.mp3` | Un gros smash qui lui claque en pleine figure ! |
| `commentateur_smash_reussi_22.mp3` | Oula, le smash lui claque en pleine face ! |
| `commentateur_smash_reussi_23.mp3` | Quelle frappe ! |
| `commentateur_smash_reussi_24.mp3` | Oh, le smash dévastateur ! |
| `commentateur_smash_sonne_01.mp3` | Il est sonné ! Il cherche ses repères ! |
| `commentateur_smash_sonne_01_f.mp3` | Elle est sonnée ! Elle cherche ses repères ! |
| `commentateur_smash_sonne_02.mp3` | Il titube ! Il est groggy ! |
| `commentateur_smash_sonne_02_f.mp3` | Elle titube ! Elle est groggy ! |
| `commentateur_smash_sonne_03.mp3` | Oula, il accuse le coup ! |
| `commentateur_smash_sonne_03_f.mp3` | Oula, elle accuse le coup ! |
| `commentateur_smash_sonne_04.mp3` | Il est touché ! Il doit se reprendre ! |
| `commentateur_smash_sonne_04_f.mp3` | Elle est touchée ! Elle doit se reprendre ! |
| `commentateur_smash_sonne_05.mp3` | Il doit secouer la tête et repartir ! |
| `commentateur_smash_sonne_05_f.mp3` | Elle doit secouer la tête et repartir ! |
| `commentateur_smash_rate_01.mp3` | Il a tout tenté… et tout raté ! |
| `commentateur_smash_rate_01_f.mp3` | Elle a tout tenté… et tout raté ! |
| `commentateur_smash_rate_02.mp3` | Le smash finit dans le filet ! |
| `commentateur_smash_rate_03.mp3` | Le smash s'envole dans les tribunes ! |
| `commentateur_smash_rate_04.mp3` | Raté ! Il a voulu forcer le passage ! |
| `commentateur_smash_rate_04_f.mp3` | Raté ! Elle a voulu forcer le passage ! |
| `commentateur_smash_rate_05.mp3` | Et le smash fait pschitt ! |
| `commentateur_smash_bloque_01.mp3` | Bloqué ! Le mur a tenu ! |
| `commentateur_smash_bloque_02.mp3` | Smash contré ! Quelle lecture ! |
| `commentateur_smash_bloque_03.mp3` | Contre monumental ! |
| `commentateur_smash_bloque_04.mp3` | La main ferme pour stopper le smash ! |
| `commentateur_smash_bloque_05.mp3` | Rien ne passe ! Le mur a tenu ! |
| `commentateur_smash_bloque_06.mp3` | Oh, le smash s'écrase sur une défense de fer ! |
| `commentateur_smash_double_01.mp3` | Double smash ! Ça tape de partout ! |
| `commentateur_smash_double_02.mp3` | Les deux smashent en même temps ! C'est la guerre totale ! |
| `commentateur_smash_double_03.mp3` | Choc des titans au milieu du court ! |
| `commentateur_smash_double_04.mp3` | Ils en viennent aux mains ! |
| `commentateur_smash_double_05.mp3` | Les deux en même temps ! Ça fait des étincelles ! |
| `commentateur_smash_double_06.mp3` | Oula, quel fracas au milieu du court ! |
| `commentateur_smash_double_07.mp3` | Ils accélèrent ensemble… et personne ne prend le dessus ! |
| `commentateur_signe_abime_01.mp3` | Il n'impressionne plus vraiment avec ses Ciseaux tout pétés ! |
| `commentateur_signe_abime_01_f.mp3` | Elle n'impressionne plus vraiment avec ses Ciseaux tout pétés ! |
| `commentateur_signe_abime_02.mp3` | Oula, ces Ciseaux tout cabossés ne font plus peur à personne ! |
| `commentateur_signe_abime_03.mp3` | Il n'impressionne plus vraiment avec sa Pierre fissurée ! |
| `commentateur_signe_abime_03_f.mp3` | Elle n'impressionne plus vraiment avec sa Pierre fissurée ! |
| `commentateur_signe_abime_04.mp3` | Oh, cette Pierre en morceaux ne fait plus trembler personne ! |
| `commentateur_signe_abime_05.mp3` | Il n'impressionne plus vraiment avec sa Feuille déchirée ! |
| `commentateur_signe_abime_05_f.mp3` | Elle n'impressionne plus vraiment avec sa Feuille déchirée ! |
| `commentateur_signe_abime_06.mp3` | Ah, cette Feuille toute froissée ne fait plus illusion ! |
| `commentateur_signe_fetiche_01_pierre.mp3` | Encore la Pierre ! C'est son arme fatale ce soir ! |
| `commentateur_signe_fetiche_01_ciseaux.mp3` | Encore les Ciseaux ! C'est son arme fatale ce soir ! |
| `commentateur_signe_fetiche_01_feuille.mp3` | Encore la Feuille ! C'est son arme fatale ce soir ! |
| `commentateur_signe_fetiche_02_pierre.mp3` | Oh, la Pierre, toujours la Pierre ! Et ça marche ! |
| `commentateur_signe_fetiche_02_ciseaux.mp3` | Oh, les Ciseaux, toujours les Ciseaux ! Et ça marche ! |
| `commentateur_signe_fetiche_02_feuille.mp3` | Oh, la Feuille, toujours la Feuille ! Et ça marche ! |
| `commentateur_signe_fetiche_03.mp3` | Ah, ce signe-là, il le maîtrise sur le bout des doigts ! |
| `commentateur_signe_fetiche_03_f.mp3` | Ah, ce signe-là, elle le maîtrise sur le bout des doigts ! |
| `commentateur_match_long_01.mp3` | Quel marathon, mesdames et messieurs ! |
| `commentateur_match_long_02.mp3` | Oula, ce match est interminable ! Et on adore ça ! |
| `commentateur_match_long_03.mp3` | Les deux refusent de céder ! Quel combat ! |
| `commentateur_david_mene_01.mp3` | Le petit est en train de faire trembler le grand ! |
| `commentateur_favori_mene_01.mp3` | Oh, la logique est respectée pour l'instant ! |
| `commentateur_david_gagne_01.mp3` | Quel exploit ! David a terrassé Goliath ! |
| `commentateur_main_en_feu_01.mp3` | Attention, il est en feu ! Appelez les pompiers ! |
| `commentateur_main_en_feu_01_f.mp3` | Attention, elle est en feu ! Appelez les pompiers ! |
| `commentateur_main_en_feu_02.mp3` | Oh, la main chaude ! |
| `commentateur_main_en_feu_03.mp3` | Ça brûle ! Il est intouchable ! |
| `commentateur_main_en_feu_03_f.mp3` | Ça brûle ! Elle est intouchable ! |
| `commentateur_main_en_feu_04.mp3` | Oh, il met le feu au court central ! |
| `commentateur_main_en_feu_04_f.mp3` | Oh, elle met le feu au court central ! |
| `commentateur_feu_eteint_01.mp3` | Le feu s'éteint ! L'adversaire a trouvé l'extincteur ! |
| `commentateur_poignee_franche_01.mp3` | Ça, c'est du respect ! Deux vraies poignées de main ! |
| `commentateur_poignee_franche_02.mp3` | Une vraie poignée de main d'hommes ! Et de femmes ! |
| `commentateur_poignee_franche_03.mp3` | Bel exemple de fair-play sur le central ! |
| `commentateur_poignee_contraste_01.mp3` | Très belle accolade… |
| `commentateur_poignee_contraste_02.mp3` | Oh, pas le même enthousiasme des deux côtés ! |
| `commentateur_poignee_froide_01.mp3` | Brrr… un vent de fraîcheur sur le court, Madame ! |
| `commentateur_poignee_froide_02.mp3` | Oula, il fait froid tout à coup ! |
| `commentateur_poignee_legere_01.mp3` | Une poignée de main… minimaliste ! |
| `commentateur_poignee_legere_02.mp3` | Une poignée de main du bout des doigts ! |
| `commentateur_humain_01.mp3` | C'est un duel ! Un vrai ! Les yeux dans les yeux ! |
| `commentateur_avant_ouverture_01.mp3` | Mesdames et messieurs, ils sont deux, ils n'ont que leurs mains, mais ils vont tout donner ! |
| `commentateur_avant_ouverture_02.mp3` | Mesdames et messieurs, c'est le choc du soir ! Le public retient son souffle… Enfin, ceux qui regardent. |
| `commentateur_avant_ouverture_03.mp3` | C'est un grand jour pour le sport, Monique ! La tension monte, et on n'a pas encore joué un seul coup ! |
| `commentateur_avant_ouverture_04.mp3` | Mesdames et messieurs, c'est le choc du soir ! On sent une tension absolument phénoménale ! |
| `commentateur_avant_ouverture_05.mp3` | Deux joueurs, trois possibilités, une seule vérité ! Mesdames et messieurs, la tension monte ! |
| `commentateur_avant_ouverture_06.mp3` | L'histoire est en marche ! Enfin… elle attend le premier geste. Mais elle est en marche ! |
| `commentateur_avant_ouverture_07.mp3` | Mesdames et messieurs, bonsoir ! Le court central est plein, et l'ambiance est électrique ! |
| `commentateur_avant_ouverture_08.mp3` | Mesdames et messieurs, installez-vous : ça va commencer, et ça va chauffer ! |
| `commentateur_avant_ouverture_09.mp3` | Mesdames et messieurs, bonsoir et bienvenue ! Les mains sont échauffées, le public est chaud : c'est le choc du soir ! |
| `commentateur_avant_ouverture_10.mp3` | Mesdames et messieurs, les lumières s'allument sur le court central… La tension monte ! |
| `commentateur_avant_ouverture_11.mp3` | Ah, mesdames et messieurs, quelle soirée ! Le chifoumi est à l'honneur, et le court central est en ébullition ! |
| `commentateur_avant_ouverture_12.mp3` | Mesdames et messieurs, il y a des matchs qu'on attend toute une saison. Celui-ci en fait partie ! |
| `commentateur_avant_ouverture_13.mp3` | Bonsoir à tous ! Deux mains, un seul vainqueur, et des millions de possibilités ! |
| `commentateur_avant_ouverture_14.mp3` | Mesdames et messieurs, retenez votre souffle : le grand frisson est pour maintenant ! |
| `commentateur_avant_ouverture_15.mp3` | Oh, quelle ambiance ! Mesdames et messieurs, on va vivre un grand moment de sport ! |
| `commentateur_avant_ouverture_16.mp3` | Mesdames et messieurs, les gradins tremblent ! Le match peut commencer d'une seconde à l'autre ! |
| `commentateur_avant_ouverture_17.mp3` | Mesdames et messieurs, posez vos téléphones… Enfin, non, gardez-les : c'est là que ça se passe ! |
| `commentateur_avant_ouverture_18.mp3` | Bienvenue sur le central ! Pierre, Feuille, Ciseaux : trois armes, deux joueurs, une seule gloire ! |
| `commentateur_avant_ouverture_19.mp3` | Mesdames et messieurs, c'est l'heure ! Les mains sont prêtes, les cœurs battent, la tension est à son comble ! |
| `commentateur_avant_ouverture_20.mp3` | Ah, mesdames et messieurs, je le sens : ce soir, il va se passer quelque chose ! |
| `commentateur_avant_ouverture_21.mp3` | Mesdames et messieurs, l'arbitre est en place, les joueurs aussi… L'histoire peut s'écrire ! |
| `commentateur_avant_ouverture_22.mp3` | Mesdames et mesdames, bonsoir ! On m'annonce un duel de très haute volée ! |
| `commentateur_avant_ouverture_23.mp3` | Mesdames et messieurs, le central est plein à craquer ! On n'a jamais vu ça… depuis hier soir ! |
| `commentateur_avant_ouverture_24.mp3` | Bonsoir et bienvenue ! Monique est à mes côtés, le public est en feu : tout est réuni pour un grand match ! |
| `commentateur_avant_ouverture_25.mp3` | Mesdames et messieurs, on y est ! Le moment que tout le monde attendait ! |
| `commentateur_avant_ouverture_26.mp3` | Mesdames et messieurs, faites du bruit pour les deux joueurs ! Le choc peut commencer ! |
| `commentateur_avant_ouverture_27.mp3` | Ah, le parfum des grands soirs ! Mesdames et messieurs, bienvenue sur le court central ! |
| `commentateur_avant_ouverture_28.mp3` | Mesdames et messieurs, accrochez-vous à vos sièges : ça va secouer ! |
| `commentateur_avant_lancement_01.mp3` | Les mains sont prêtes… C'est parti ! |
| `commentateur_avant_lancement_02.mp3` | Que le meilleur gagne ! Place au jeu ! |
| `commentateur_avant_lancement_03.mp3` | Silence sur le central… Le match commence ! |
| `commentateur_avant_lancement_04.mp3` | Allez, place au chifoumi ! |
| `commentateur_avant_lancement_05.mp3` | Que le spectacle commence ! |
| `commentateur_avant_lancement_06.mp3` | C'est l'heure de vérité ! |
| `commentateur_avant_lancement_07.mp3` | Les mains sont en position… Le match commence ! |
| `commentateur_avant_lancement_08.mp3` | Trois, deux, un… C'est parti ! |
| `commentateur_avant_lancement_09.mp3` | Attention, ça commence, ne quittez pas ! |
| `commentateur_avant_lancement_10.mp3` | Le match est lancé, mesdames et messieurs ! |
| `commentateur_avant_lancement_11.mp3` | En avant pour un grand moment de HandSlam ! |
| `commentateur_decale_r_01.mp3` | Quelle attaque ! Une main exceptionnelle ! |
| `commentateur_decale_r_02.mp3` | Il a sorti le grand jeu ! |
| `commentateur_decale_r_02_f.mp3` | Elle a sorti le grand jeu ! |
| `commentateur_replay_reussite_01.mp3` | Regardez ! Voyez comment il a installé sa séquence pour finalement porter l'estocade ! |
| `commentateur_replay_reussite_01_f.mp3` | Regardez ! Voyez comment elle a installé sa séquence pour finalement porter l'estocade ! |
| `commentateur_replay_reussite_02.mp3` | Ah, c'est à ce moment-là qu'il a trompé la main adverse ! |
| `commentateur_replay_reussite_02_f.mp3` | Ah, c'est à ce moment-là qu'elle a trompé la main adverse ! |
| `commentateur_replay_reussite_03.mp3` | Il a renversé le jeu, et son adversaire n'a pu que constater les dégâts ! |
| `commentateur_replay_reussite_03_f.mp3` | Elle a renversé le jeu, et son adversaire n'a pu que constater les dégâts ! |
| `commentateur_replay_reussite_04.mp3` | Oh, voyez avec quelle virtuosité il a contrecarré la main adverse ! |
| `commentateur_replay_reussite_04_f.mp3` | Oh, voyez avec quelle virtuosité elle a contrecarré la main adverse ! |
| `commentateur_replay_reussite_05.mp3` | Son adversaire a mordu à l'hameçon, et il n'a plus eu qu'à remonter la prise ! |
| `commentateur_replay_reussite_05_f.mp3` | Son adversaire a mordu à l'hameçon, et elle n'a plus eu qu'à remonter la prise ! |
| `commentateur_replay_reussite_06.mp3` | Il a attiré la main adverse sur un signe pour mieux la prendre à contre-pied ! |
| `commentateur_replay_reussite_06_f.mp3` | Elle a attiré la main adverse sur un signe pour mieux la prendre à contre-pied ! |
| `commentateur_replay_reussite_07.mp3` | Oula ! Il l'a littéralement fusillé à bout portant ! |
| `commentateur_replay_reussite_07_f.mp3` | Oula ! Elle l'a littéralement fusillé à bout portant ! |
| `commentateur_replay_balle_ratee_01.mp3` | Oh, une main en forme de prière… mais les dieux du HandSlam sont restés sourds à son appel ! |
| `commentateur_replay_balle_ratee_02.mp3` | Le geste du désespoir, contré sans pitié par la main adverse ! |
| `commentateur_replay_smash_signe_01.mp3` | Il a vu la main adverse se tendre, et il a tranché dans le vif ! |
| `commentateur_replay_smash_signe_01_f.mp3` | Elle a vu la main adverse se tendre, et elle a tranché dans le vif ! |
| `commentateur_replay_smash_signe_02.mp3` | Ah ! Il a anticipé un déploiement, et n'a pas hésité à lui couper la feuille sous le pied ! |
| `commentateur_replay_smash_signe_02_f.mp3` | Ah ! Elle a anticipé un déploiement, et n'a pas hésité à lui couper la feuille sous le pied ! |
| `commentateur_replay_smash_signe_03.mp3` | Les ciseaux adverses sont venus se casser les dents sur une pierre jouée avec une grande assurance ! |
| `commentateur_replay_smash_signe_04.mp3` | Regardez cette action : l'adversaire s'est recroquevillé sur la pierre, et a reçu immédiatement la sanction redoutée ! |
| `commentateur_replay_smash_signe_05.mp3` | Oh, un plat de la main cinglant, qui est venu ébrécher une pierre très hasardeuse ! |
| `commentateur_replay_double_01.mp3` | Les deux mains se sont engagées dans le choc, mais l'une d'elles en a fait les frais ! |
| `commentateur_replay_double_02.mp3` | Il a asséné un coup au moral de son adversaire, totalement déséquilibré par l'impact ! |
| `commentateur_replay_double_02_f.mp3` | Elle a asséné un coup au moral de son adversaire, totalement déséquilibré par l'impact ! |
| `commentateur_replay_generique_01.mp3` | Revoyons ce point au ralenti ! |
| `commentateur_replay_generique_02.mp3` | Regardez bien les deux mains ! |
| `commentateur_replay_generique_03.mp3` | Voilà un point bien construit ! |
| `commentateur_replay_generique_04.mp3` | Admirez le geste ! |
| `commentateur_replay_sit_serre_01.mp3` | À ce stade du set, chaque point pesait une tonne ! |
| `commentateur_replay_sit_serre_02.mp3` | Dans le money time, il a trouvé la solution ! |
| `commentateur_replay_sit_serre_02_f.mp3` | Dans le money time, elle a trouvé la solution ! |
| `commentateur_replay_sit_avance_01.mp3` | Il a creusé l'écart, tranquillement ! |
| `commentateur_replay_sit_avance_01_f.mp3` | Elle a creusé l'écart, tranquillement ! |
| `commentateur_replay_sit_avance_02.mp3` | Et un point de plus ! Il a déroulé ! |
| `commentateur_replay_sit_avance_02_f.mp3` | Et un point de plus ! Elle a déroulé ! |
| `commentateur_replay_sit_relance_01.mp3` | Et là, il s'est relancé ! |
| `commentateur_replay_sit_relance_01_f.mp3` | Et là, elle s'est relancée ! |
| `commentateur_replay_sit_relance_02.mp3` | Mené, il a refusé de lâcher ! Et tout est reparti de là ! |
| `commentateur_replay_sit_relance_02_f.mp3` | Menée, elle a refusé de lâcher ! Et tout est reparti de là ! |
| `commentateur_replay_sit_mene_perd_01.mp3` | Il s'est accroché ! Il ne voulait pas lâcher ce set ! |
| `commentateur_replay_sit_mene_perd_01_f.mp3` | Elle s'est accrochée ! Elle ne voulait pas lâcher ce set ! |
| `commentateur_replay_sit_bascule_01.mp3` | Là, il est passé devant ! Et il n'a plus jamais été rejoint ! |
| `commentateur_replay_sit_bascule_01_f.mp3` | Là, elle est passée devant ! Et elle n'a plus jamais été rejointe ! |
| `commentateur_replay_sit_bascule_02.mp3` | Le point de la bascule ! Tout est parti de là ! |
| `commentateur_replay_sit_bascule_match_01.mp3` | Le point qui a fait basculer le match ! |
| `commentateur_replay_sit_debut_01.mp3` | Il a bien lancé son set ! |
| `commentateur_replay_sit_debut_01_f.mp3` | Elle a bien lancé son set ! |
| `commentateur_replay_sit_debut_02.mp3` | Premier coup de semonce dans ce set ! |
| `commentateur_fin_trois_sets_01.mp3` | Au bout du suspense, ce match a trouvé un vainqueur ! Les mains ont beaucoup donné et sont épuisées : séance de manucure demain, en prévision du prochain match ! |
| `commentateur_fin_trois_sets_02.mp3` | Les supporters peuvent libérer leur joie : leur champion a su trouver le chemin de la victoire ! Le kop adverse peine à cacher sa déception : ils y ont cru jusqu'au bout ! |
| `commentateur_fin_trois_sets_02_f.mp3` | Les supporters peuvent libérer leur joie : leur championne a su trouver le chemin de la victoire ! Le kop adverse peine à cacher sa déception : ils y ont cru jusqu'au bout ! |
| `commentateur_accueil_point_gagne_01.mp3` | Oh, le premier point de sa carrière ! On s'en souviendra ! |
| `commentateur_accueil_point_gagne_02.mp3` | Et voilà ! Premier point, et déjà le goût de la victoire ! |
| `commentateur_accueil_point_perdu_01.mp3` | Pas de panique, il y a encore le temps de se rattraper ! |
| `commentateur_accueil_lecture_01.mp3` | L'historique en bas de l'écran, c'est le trésor des grands joueurs ! |
| `commentateur_accueil_smash_01.mp3` | Et n'oubliez pas le smash : un appui long sur le signe, une fois par set ! Ça ne change pas le point, mais quel spectacle ! |
| `commentateur_stats_lance_01.mp3` | Jetons un œil aux statistiques de ce match, Monique ! |
| `commentateur_stats_lance_02.mp3` | Les chiffres du match, Madame ! Qu'est-ce qu'ils nous disent ? |
| `commentateur_stats_lance_03.mp3` | Monique, vous qui aimez les statistiques… Que retenez-vous de ce match ? |
| `commentateur_stats_insaisissable_01.mp3` | Quel feu follet ! Dans ce match, impossible de savoir où il allait frapper ! |
| `commentateur_stats_insaisissable_01_f.mp3` | Quel feu follet ! Dans ce match, impossible de savoir où elle allait frapper ! |
| `commentateur_stats_lecture_01.mp3` | Quelle lecture du jeu dans ce match ! Il voyait tout venir ! |
| `commentateur_stats_lecture_01_f.mp3` | Quelle lecture du jeu dans ce match ! Elle voyait tout venir ! |
| `commentateur_stats_renverse_01.mp3` | Mené d'un set dans ce match, et pourtant vainqueur ! Quel caractère ! |
| `commentateur_stats_renverse_01_f.mp3` | Menée d'un set dans ce match, et pourtant victorieuse ! Quel caractère ! |
| `commentateur_stats_reaction_01.mp3` | Un départ difficile dans ce match… et quelle réaction ensuite ! |
| `commentateur_stats_exploit_01.mp3` | Dans ce match, il a fait mentir le classement ! Superbe performance ! |
| `commentateur_stats_exploit_01_f.mp3` | Dans ce match, elle a fait mentir le classement ! Superbe performance ! |
| `commentateur_dialogue_perso_chiromancien_avant_01.mp3` | Le Chiromancien est sur le central, Madame ! |
| `commentateur_dialogue_perso_chiromancien_avant_02.mp3` | Madame, croyez-vous aux pouvoirs du Chiromancien ? |
| `commentateur_dialogue_avant_debutant_01.mp3` | Un nouveau venu sur le central ! Bienvenue ! |
| `commentateur_dialogue_avant_debutant_02.mp3` | Son tout premier match officiel, Madame ! |
| `commentateur_dialogue_avant_debutant_03.mp3` | Un baptême du feu pour ce joueur ! |
| `commentateur_dialogue_avant_monique_01.mp3` | Monique, aviez-vous un rituel d'avant-match ? |
| `commentateur_dialogue_avant_monique_02.mp3` | Monique, que mangiez-vous avant une finale ? |
| `commentateur_dialogue_avant_monique_03.mp3` | Monique, vous aviez un signe porte-bonheur ? |
| `commentateur_dialogue_avant_monique_04.mp3` | Monique, vous étiez nerveuse avant vos grands matchs ? |
| `commentateur_dialogue_avant_monique_05.mp3` | Monique, vous échauffiez vos doigts comment ? |
| `commentateur_dialogue_avant_monique_06.mp3` | Monique, un conseil pour nos deux joueurs ce soir ? |
| `commentateur_dialogue_avant_monique_07.mp3` | Monique, qu'est-ce qui fait un grand joueur, selon vous ? |
| `commentateur_dialogue_avant_monique_08.mp3` | Monique, faut-il regarder son adversaire dans les yeux ? |
| `commentateur_dialogue_avant_monique_09.mp3` | Monique, le hasard existe-t-il au chifoumi ? |
| `commentateur_dialogue_avant_monique_10.mp3` | Monique, vous sentez la tension monter ? |
| `commentateur_dialogue_avant_monique_11.mp3` | Monique, vous avez vu l'ambiance ce soir ? |
| `commentateur_dialogue_avant_monique_12.mp3` | Monique, un pronostic ? |
| `commentateur_dialogue_avant_monique_13.mp3` | Monique, comment occupiez-vous vos jours de repos ? |
| `commentateur_dialogue_avant_monique_14.mp3` | Monique, avez-vous déjà perdu contre un débutant ? |
| `commentateur_dialogue_avant_monique_15.mp3` | Monique, quel est le secret d'une bonne ouverture ? |
| `commentateur_dialogue_avant_monique_16.mp3` | Monique, que dites-vous aux jeunes qui commencent ? |
| `commentateur_dialogue_avant_monique_17.mp3` | Monique, le chifoumi a-t-il changé depuis votre époque ? |
| `commentateur_dialogue_avant_monique_18.mp3` | Monique, vous jouez encore, parfois ? |
| `commentateur_dialogue_avant_monique_19.mp3` | Monique, une superstition ? |
| `commentateur_dialogue_avant_match_01.mp3` | Madame, la tension est palpable. |
| `commentateur_dialogue_avant_match_02.mp3` | Deux styles, deux écoles ! |
| `commentateur_dialogue_avant_match_03.mp3` | Un pronostic, Madame ? |
| `commentateur_dialogue_avant_match_04.mp3` | Vous le sentez comment, ce match ? |
| `commentateur_dialogue_avant_match_05.mp3` | La Pierre, c'est la base, Madame ! |
| `commentateur_dialogue_avant_match_06.mp3` | Bonsoir à tous ! Roland Pignon, en direct du court central, aux côtés de la légendaire Monique Latour ! |
| `commentateur_dialogue_avant_match_07.mp3` | Monique Latour, la finale de 1997, les trois Ciseaux… |
| `commentateur_dialogue_avant_match_08.mp3` | Monique, votre pronostic pour ce soir ? |
| `commentateur_dialogue_avant_match_09.mp3` | Quelle ambiance, Madame ! Le public est chaud bouillant ! |
| `commentateur_dialogue_avant_match_10.mp3` | On m'annonce un match historique ! |
| `commentateur_dialogue_avant_match_11.mp3` | Trois signes, Madame ! Seulement trois ! Et pourtant, quelle richesse ! |
| `commentateur_dialogue_avant_match_12.mp3` | Vous avez un signe fétiche, Monique ? |
| `commentateur_dialogue_avant_match_13.mp3` | Les deux joueurs se regardent droit dans les yeux… |
| `commentateur_dialogue_avant_match_14.mp3` | Échauffement terminé, les mains sont prêtes ! |
| `commentateur_dialogue_avant_match_15.mp3` | Un conseil pour nos joueurs, Madame ? |
| `commentateur_dialogue_premiere_egalite_01.mp3` | Premier coup, première égalité ! |
| `commentateur_dialogue_premiere_egalite_02.mp3` | Même signe dès le départ ! |
| `commentateur_dialogue_changement_01.mp3` | Il casse enfin la série ! |
| `commentateur_dialogue_changement_01_f.mp3` | Elle casse enfin la série ! |
| `commentateur_dialogue_changement_02.mp3` | Il change enfin de signe, Madame ! |
| `commentateur_dialogue_changement_02_f.mp3` | Elle change enfin de signe, Madame ! |
| `commentateur_dialogue_balle_de_match_01.mp3` | Une victoire le sépare de l'immortalité ! |
| `commentateur_dialogue_balle_de_match_01_f.mp3` | Une victoire la sépare de l'immortalité ! |
| `commentateur_dialogue_balle_de_match_02.mp3` | Balle de match, Madame ! |
| `commentateur_dialogue_avant_bot_01.mp3` | Un humain contre une machine, Madame ! |
| `commentateur_dialogue_avant_bot_02.mp3` | Un humain contre un bot, Madame ! |
| `commentateur_dialogue_memoire_meme_ouverture_01.mp3` | Il rouvre comme au dernier match ! Quelle audace ! |
| `commentateur_dialogue_memoire_meme_ouverture_01_f.mp3` | Elle rouvre comme au dernier match ! Quelle audace ! |
| `commentateur_dialogue_memoire_revanche_01.mp3` | Une revanche, Madame ! Une vraie ! |
| `commentateur_dialogue_memoire_habitues_01.mp3` | Ils se connaissent, ils se jaugent, ils se respectent ! |
| `commentateur_dialogue_memoire_marquant_01.mp3` | La dernière fois, quel match, Madame ! |
| `commentateur_dialogue_avant_finale_01.mp3` | Une finale, Madame ! Une FINALE ! |
| `commentateur_dialogue_avant_finale_02.mp3` | Une finale, Madame ! La plus belle des scènes ! |
| `commentateur_dialogue_avant_revanche_01.mp3` | Ils se connaissent, ces deux-là ! |
| `commentateur_dialogue_avant_revanche_02.mp3` | Une revanche, Madame ! Ça sent la poudre ! |
| `commentateur_dialogue_avant_nuit_01.mp3` | Il est tard, Madame, mais le HandSlam ne dort jamais ! |
| `commentateur_dialogue_avant_nuit_02.mp3` | Il est tard, Madame, mais ils jouent encore ! |
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
| `commentateur_dialogue_apres_entrainement_defaite_03.mp3` | Ce n'était qu'un entraînement, Madame ! |
| `commentateur_dialogue_apres_entrainement_defaite_04.mp3` | Une défaite à l'entraînement, ça compte ? |
| `commentateur_dialogue_apres_entrainement_defaite_05.mp3` | Le bot a été plus fort aujourd'hui ! |
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
| `commentateur_dialogue_apres_tournoi_premiers_defaite_05.mp3` | Éliminé dès le premier tour, Madame… |
| `commentateur_dialogue_apres_tournoi_premiers_defaite_05_f.mp3` | Éliminée dès le premier tour, Madame… |
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
| `commentateur_dialogue_apres_tournoi_quarts_defaite_05.mp3` | Le parcours s'arrête en quart de finale ! |
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
| `commentateur_dialogue_apres_tournoi_demis_defaite_05.mp3` | La demi-finale lui échappe ! |
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
| `commentateur_dialogue_apres_tournoi_finale_defaite_05.mp3` | Finale perdue, Madame… |
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
| `commentateur_dialogue_fin_set_05.mp3` | Madame, que retenez-vous de ce set ? |
| `commentateur_dialogue_fin_set_06.mp3` | Un set d'une rare intensité, Madame ! |
| `commentateur_dialogue_fin_set_07.mp3` | Le perdant peut-il encore revenir ? |
| `commentateur_dialogue_fin_set_08.mp3` | Ce set a-t-il changé quelque chose, Madame ? |
| `commentateur_dialogue_set_decisif_01.mp3` | Un set pour l'éternité, Madame ! |
| `commentateur_dialogue_titre_01.mp3` | Madame, c'est historique ! |
| `commentateur_dialogue_titre_02.mp3` | Il est champion, Madame ! Champion ! |
| `commentateur_dialogue_titre_02_f.mp3` | Elle est championne, Madame ! Championne ! |
| `commentateur_dialogue_titre_03.mp3` | Un titre, Madame ! Un vrai titre ! |
| `commentateur_dialogue_fin_match_01.mp3` | Il n'a pas démérité ! |
| `commentateur_dialogue_fin_match_01_f.mp3` | Elle n'a pas démérité ! |
| `commentateur_dialogue_fin_match_02.mp3` | Quel combat, Madame ! |
| `commentateur_dialogue_fin_match_03.mp3` | Il peut sortir la tête haute ! |
| `commentateur_dialogue_fin_match_03_f.mp3` | Elle peut sortir la tête haute ! |
| `commentateur_dialogue_fin_match_04.mp3` | Une défaite qui fait mal, Madame ? |
| `commentateur_dialogue_fin_match_05.mp3` | Il reviendra plus fort, j'en suis sûr ! |
| `commentateur_dialogue_fin_match_05_f.mp3` | Elle reviendra plus forte, j'en suis sûr ! |
| `commentateur_dialogue_fin_match_06.mp3` | Madame, un mot pour le vaincu ? |
| `commentateur_dialogue_fin_match_07.mp3` | Quelle intelligence tactique ! |
| `commentateur_dialogue_cri_01.mp3` | Ah, il y a de la voix ! |
| `commentateur_dialogue_cri_02.mp3` | Il a craqué son slip ! |
| `commentateur_dialogue_cri_02_f.mp3` | Elle a craqué son slip ! |
| `commentateur_dialogue_cri_03.mp3` | Il éructe de joie ! |
| `commentateur_dialogue_cri_03_f.mp3` | Elle éructe de joie ! |
| `commentateur_dialogue_cri_04.mp3` | Siuuuu ! |
| `commentateur_dialogue_cri_05.mp3` | Quel cri, Madame ! |
| `commentateur_dialogue_cri_06.mp3` | Il exulte ! |
| `commentateur_dialogue_cri_06_f.mp3` | Elle exulte ! |
| `commentateur_dialogue_titans_01.mp3` | On assiste à un véritable combat de titans ! |
| `commentateur_dialogue_resultat_surprise_01.mp3` | Le coup de tonnerre ! |
| `commentateur_dialogue_resultat_favori_01.mp3` | Le patron a parlé ! |
| `commentateur_dialogue_resultat_grosse_defaite_01.mp3` | C'est la catastrophe ! |
| `commentateur_dialogue_resultat_serre_01.mp3` | On ne respire plus ! |
| `commentateur_dialogue_resultat_serie_victoires_01.mp3` | Il est intouchable ! |
| `commentateur_dialogue_resultat_serie_victoires_01_f.mp3` | Elle est intouchable ! |
| `commentateur_dialogue_resultat_serie_defaites_01.mp3` | Il faut sauver ce qui peut l'être ! |
| `commentateur_dialogue_replay_moment_01.mp3` | Et voici certainement le tournant de ce set ! |
| `commentateur_dialogue_replay_moment_02.mp3` | Regardez-moi ça ! Quel moment ! |
| `commentateur_dialogue_replay_moment_03.mp3` | C'est ici que tout a basculé ! |
| `commentateur_dialogue_replay_moment_04.mp3` | On repasse les images de ce moment décisif ! |
| `commentateur_dialogue_replay_moment_05.mp3` | Quel coup de tonnerre dans cette manche ! |
| `commentateur_dialogue_replay_moment_06.mp3` | Il fallait oser ! Et il l'a fait ! |
| `commentateur_dialogue_replay_moment_06_f.mp3` | Il fallait oser ! Et elle l'a fait ! |
| `commentateur_dialogue_replay_moment_07.mp3` | C'est peut-être le plus beau point de ce set ! |
| `commentateur_dialogue_replay_moment_08.mp3` | Revoyons cette action qui a fait vibrer les supporters ! |
| `commentateur_dialogue_temps_forts_intro_01.mp3` | Allez, on se repasse les trois grands moments de cette rencontre ! |
| `commentateur_dialogue_temps_forts_intro_02.mp3` | Installez-vous confortablement, voici le résumé de cette bataille ! |
| `commentateur_dialogue_temps_forts_intro_03.mp3` | Trois moments, trois émotions, une seule rencontre ! |
| `commentateur_dialogue_tf_premier_01.mp3` | Premier moment fort : ce coup du premier set qui a fait très mal à son adversaire ! |
| `commentateur_dialogue_tf_deuxieme_01.mp3` | Deuxième séquence : regardez-moi ce geste technique ! |
| `commentateur_dialogue_tf_balle_01.mp3` | Et enfin, la balle de match ! |
| `commentateur_dialogue_tf_cher_01.mp3` | On revient sur cette action qui a peut-être coûté très cher ! |
| `commentateur_dialogue_tf_defense_01.mp3` | Quelle défense ! Il a tout donné sur cette séquence ! |
| `commentateur_dialogue_tf_defense_01_f.mp3` | Quelle défense ! Elle a tout donné sur cette séquence ! |
| `commentateur_dialogue_tf_tournant_01.mp3` | Et voici le moment où le match a définitivement changé de visage ! |
| `commentateur_dialogue_temps_forts_fin_01.mp3` | Trois images qui resteront dans les mémoires ! |
| `commentateur_dialogue_temps_forts_fin_02.mp3` | Voilà, vous avez revécu les grands moments de cette rencontre ! |
| `commentateur_dialogue_temps_forts_fin_trois_01.mp3` | Quel spectacle ! Quel match ! Quelle intensité ! |
| `commentateur_dialogue_accueil_bienvenue_01.mp3` | Mesdames et messieurs, un nouveau joueur fait son entrée sur le court central ! Bienvenue au HandSlam ! |
| `commentateur_dialogue_accueil_bienvenue_01_f.mp3` | Mesdames et messieurs, une nouvelle joueuse fait son entrée sur le court central ! Bienvenue au HandSlam ! |
| `commentateur_dialogue_accueil_bienvenue_02.mp3` | Monique, on lui explique comment gagner ? |
| `commentateur_dialogue_accueil_bienvenue_03.mp3` | Et en face, c'est Boomerang ! Il a l'air gentil… en principe ! |
| `commentateur_dialogue_accueil_victoire_01.mp3` | Victoire pour son premier match ! Une étoile est née, mesdames et messieurs ! |
| `commentateur_dialogue_accueil_victoire_02.mp3` | Quel baptême du feu ! Il a battu Boomerang dès son premier match ! |
| `commentateur_dialogue_accueil_victoire_02_f.mp3` | Quel baptême du feu ! Elle a battu Boomerang dès son premier match ! |
| `commentateur_dialogue_accueil_defaite_01.mp3` | Boomerang l'emporte… mais quelle découverte, mesdames et messieurs ! |
| `commentateur_dialogue_accueil_defaite_02.mp3` | Ce n'est que partie remise ! La revanche est à un clic ! |
| `commentateur_dialogue_accueil_deuxieme_01.mp3` | Le revoilà sur le central ! Deuxième match, on prend ses marques ! |
| `commentateur_dialogue_accueil_troisieme_01.mp3` | Troisième match ! Mesdames et messieurs, un habitué est en train de naître ! |
| `commentateur_dialogue_accueil_troisieme_01_f.mp3` | Troisième match ! Mesdames et messieurs, une habituée est en train de naître ! |
| `commentateur_dialogue_accueil_fin_troisieme_01.mp3` | Trois matchs ! Les jetons, les défis du jour et la boutique sont ouverts ! |

## Commentatrice — glaciale, cinglante, jamais impressionnée (1174 répliques)

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
| `commentatrice_craquage_08.mp3` | L'estocade ? Non : cueilli sur la riposte. |
| `commentatrice_craquage_08_f.mp3` | L'estocade ? Non : cueillie sur la riposte. |
| `commentatrice_craquage_09.mp3` | La main a tremblé. |
| `commentatrice_craquage_10.mp3` | L'enjeu le paralyse. Ça se voit d'ici. |
| `commentatrice_craquage_10_f.mp3` | L'enjeu la paralyse. Ça se voit d'ici. |
| `commentatrice_craquage_11.mp3` | Tout était bien… sauf le dernier geste. |
| `commentatrice_craquage_12.mp3` | Le bras a tremblé au moment de conclure. |
| `commentatrice_main_legendaire_01.mp3` | Je note l'heure. Pour les archives. |
| `commentatrice_main_legendaire_02.mp3` | Dinguerie ! Comme disent les jeunes. |
| `commentatrice_main_legendaire_03.mp3` | C'est un vrai banger. Comme disent les jeunes. |
| `commentatrice_balle_sauvee_01.mp3` | Glacial. Absolument glacial. J'approuve. |
| `commentatrice_balle_sauvee_02.mp3` | Tout le monde la voyait perdue. Sauf lui. C'est touchant. |
| `commentatrice_balle_sauvee_02_f.mp3` | Tout le monde la voyait perdue. Sauf elle. C'est touchant. |
| `commentatrice_balle_sauvee_03.mp3` | Des nerfs d'acier. Ou aucune conscience du danger. On ne saura jamais. |
| `commentatrice_balle_sauvee_04.mp3` | Tiens. Il aime vivre dangereusement. |
| `commentatrice_balle_sauvee_04_f.mp3` | Tiens. Elle aime vivre dangereusement. |
| `commentatrice_balle_sauvee_05.mp3` | Le dos rond… et c'est passé. |
| `commentatrice_balle_sauvee_06.mp3` | Il refuse de partir. Têtu, en plus d'être doué. |
| `commentatrice_balle_sauvee_06_f.mp3` | Elle refuse de partir. Têtue, en plus d'être douée. |
| `commentatrice_remontee_01.mp3` | Personne n'y croyait. Lui, si. C'est bien le seul. |
| `commentatrice_remontee_01_f.mp3` | Personne n'y croyait. Elle, si. C'est bien la seule. |
| `commentatrice_remontee_02.mp3` | Ne jamais enterrer un joueur de Pierre. Jamais. |
| `commentatrice_remontee_02_f.mp3` | Ne jamais enterrer une joueuse de Pierre. Jamais. |
| `commentatrice_remontee_03.mp3` | Son adversaire a avalé la trompette. |
| `commentatrice_remontee_04.mp3` | Un match n'est jamais fini. Surtout quand on joue mal. |
| `commentatrice_remontee_05.mp3` | C'est abracadabrantesque. |
| `commentatrice_remontee_06.mp3` | Tiens, tiens. Le match est relancé. |
| `commentatrice_serie_pour_01.mp3` | Il a trouvé la faille. Il appuie dessus. Enfin quelqu'un de sérieux. |
| `commentatrice_serie_pour_01_f.mp3` | Elle a trouvé la faille. Elle appuie dessus. Enfin quelqu'un de sérieux. |
| `commentatrice_serie_pour_02.mp3` | Il gagne dans un fauteuil. |
| `commentatrice_serie_pour_02_f.mp3` | Elle gagne dans un fauteuil. |
| `commentatrice_serie_pour_03.mp3` | Une démonstration. Je note. |
| `commentatrice_serie_pour_04.mp3` | Il ne joue plus. Il distribue des corrections. |
| `commentatrice_serie_pour_04_f.mp3` | Elle ne joue plus. Elle distribue des corrections. |
| `commentatrice_serie_pour_05.mp3` | Six points d'affilée. Ça devient indécent. |
| `commentatrice_serie_pour_06.mp3` | Il lui fait la musique. |
| `commentatrice_serie_pour_06_f.mp3` | Elle lui fait la musique. |
| `commentatrice_serie_pour_07.mp3` | Dans sa bulle. Personne ne le dérange. |
| `commentatrice_serie_pour_07_f.mp3` | Dans sa bulle. Personne ne la dérange. |
| `commentatrice_serie_pour_08.mp3` | Tout lui sourit. Même ses erreurs. |
| `commentatrice_serie_pour_09.mp3` | Une série comme ça, on la garde en mémoire. Et en vidéo. |
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
| `commentatrice_serie_contre_12.mp3` | Il est en PLS. Comme disent les jeunes. |
| `commentatrice_serie_contre_12_f.mp3` | Elle est en PLS. Comme disent les jeunes. |
| `commentatrice_serie_contre_13.mp3` | Le doute commence sérieusement à s'installer. |
| `commentatrice_serie_contre_14.mp3` | La main ferme. Le cerveau en bouillie. |
| `commentatrice_serie_contre_15.mp3` | Il va falloir appeler du renfort. |
| `commentatrice_serie_contre_16.mp3` | Ce n'est plus un match, c'est une exécution. |
| `commentatrice_serie_contre_17.mp3` | Il doit avoir le moral dans les chaussettes. |
| `commentatrice_serie_contre_17_f.mp3` | Elle doit avoir le moral dans les chaussettes. |
| `commentatrice_serie_contre_18.mp3` | Il tend le bâton pour se faire battre. |
| `commentatrice_serie_contre_18_f.mp3` | Elle tend le bâton pour se faire battre. |
| `commentatrice_serie_contre_19.mp3` | Ciseaux mal affûtés, échec assuré. |
| `commentatrice_serie_contre_20.mp3` | Il faut arrêter l'hémorragie. |
| `commentatrice_serie_contre_21.mp3` | Il a besoin d'un temps mort. Il n'y en a pas. |
| `commentatrice_serie_contre_21_f.mp3` | Elle a besoin d'un temps mort. Il n'y en a pas. |
| `commentatrice_serie_contre_22.mp3` | Il cherche sa main. Elle est partie sans lui. |
| `commentatrice_serie_contre_22_f.mp3` | Elle cherche sa main. Elle est partie sans elle. |
| `commentatrice_serie_contre_23.mp3` | C'est le moment d'arrêter les frais. |
| `commentatrice_serie_contre_24.mp3` | Pour le moment, sa stratégie ne paie pas. |
| `commentatrice_serie_contre_25.mp3` | La ligne d'arrivée est encore loin, mais attention à ne pas se laisser distancer. |
| `commentatrice_serie_contre_26.mp3` | Hmm. Il est en train de déjouer. |
| `commentatrice_serie_contre_26_f.mp3` | Hmm. Elle est en train de déjouer. |
| `commentatrice_serie_contre_27.mp3` | Il est en difficulté, son jeu est trop stéréotypé. |
| `commentatrice_serie_contre_27_f.mp3` | Elle est en difficulté, son jeu est trop stéréotypé. |
| `commentatrice_serie_contre_28.mp3` | Il cherche des solutions. Il n'en trouve pas. |
| `commentatrice_serie_contre_28_f.mp3` | Elle cherche des solutions. Elle n'en trouve pas. |
| `commentatrice_serie_contre_29.mp3` | Il va falloir sortir de ce trou. Vite. |
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
| `commentatrice_obstination_11.mp3` | Bon. Il est décidé à mourir avec ses idées. |
| `commentatrice_obstination_11_f.mp3` | Bon. Elle est décidée à mourir avec ses idées. |
| `commentatrice_obstination_12.mp3` | Il faut savoir varier ses sorties. |
| `commentatrice_changement_01.mp3` | Il a changé. Il était temps. |
| `commentatrice_changement_01_f.mp3` | Elle a changé. Il était temps. |
| `commentatrice_changement_02.mp3` | Une autre idée. Enfin. |
| `commentatrice_changement_03.mp3` | Tiens, il découvre qu'il existe trois signes. Bonne nouvelle. |
| `commentatrice_changement_03_f.mp3` | Tiens, elle découvre qu'il existe trois signes. Bonne nouvelle. |
| `commentatrice_changement_04.mp3` | Le joueur a manifestement voulu surprendre son adversaire. |
| `commentatrice_changement_04_f.mp3` | La joueuse a manifestement voulu surprendre son adversaire. |
| `commentatrice_duel_esprits_01.mp3` | Deux esprits. Une seule idée. Jamais la bonne. |
| `commentatrice_duel_esprits_02.mp3` | On pourrait rester là toute la nuit. Je préférerais éviter. |
| `commentatrice_duel_esprits_03.mp3` | Une partie d'échecs à trois pièces. Sans les échecs. |
| `commentatrice_duel_esprits_05_pierre.mp3` | Il n'a pas le monopole de la Pierre. |
| `commentatrice_duel_esprits_05_pierre_f.mp3` | Elle n'a pas le monopole de la Pierre. |
| `commentatrice_duel_esprits_05_ciseaux.mp3` | Il n'a pas le monopole des Ciseaux. |
| `commentatrice_duel_esprits_05_ciseaux_f.mp3` | Elle n'a pas le monopole des Ciseaux. |
| `commentatrice_duel_esprits_05_feuille.mp3` | Il n'a pas le monopole de la Feuille. |
| `commentatrice_duel_esprits_05_feuille_f.mp3` | Elle n'a pas le monopole de la Feuille. |
| `commentatrice_duel_esprits_07.mp3` | Ennuyeux. |
| `commentatrice_duel_esprits_08.mp3` | Ils ont exactement la même idée. Inquiétant. |
| `commentatrice_duel_esprits_09.mp3` | Personne ne veut prendre de risque aujourd'hui. |
| `commentatrice_duel_esprits_10.mp3` | Encore la même chose. Ça sent le duel interminable. |
| `commentatrice_duel_esprits_11.mp3` | Même signe. Une prolongation que personne n'a demandée. |
| `commentatrice_duel_esprits_12_pierre.mp3` | Deux Pierres, égalité. Trois semaines d'étude pour ça… |
| `commentatrice_duel_esprits_12_ciseaux.mp3` | Deux Ciseaux, égalité. Trois semaines d'étude pour ça… |
| `commentatrice_duel_esprits_12_feuille.mp3` | Deux Feuilles, égalité. Trois semaines d'étude pour ça… |
| `commentatrice_duel_esprits_13.mp3` | Les supporters s'impatientent. |
| `commentatrice_duel_esprits_14.mp3` | Deux murs face à face. |
| `commentatrice_duel_esprits_15.mp3` | Deux esprits qui se lisent. Ou deux esprits qui ne lisent rien. |
| `commentatrice_duel_esprits_16.mp3` | On pourrait jouer comme ça toute la nuit. Je préférerais pas. |
| `commentatrice_lecture_subie_01.mp3` | Lu comme un livre ouvert. |
| `commentatrice_lecture_subie_02.mp3` | Trop prévisible. |
| `commentatrice_lecture_subie_03.mp3` | Ses tics sont en train de le trahir. |
| `commentatrice_lecture_subie_03_f.mp3` | Ses tics sont en train de la trahir. |
| `commentatrice_lecture_subie_04.mp3` | C'était écrit. En gros caractères. |
| `commentatrice_lecture_subie_05.mp3` | Défense sicilienne, un classique. Mais ça ne lui réussit pas. |
| `commentatrice_lecture_subie_06.mp3` | Trois coups d'avance. Sauf celui de l'adversaire. |
| `commentatrice_lecture_subie_07.mp3` | Il avait tout anticipé. Sauf ça. |
| `commentatrice_lecture_subie_07_f.mp3` | Elle avait tout anticipé. Sauf ça. |
| `commentatrice_lecture_subie_08.mp3` | C'était téléphoné. Mais il était en mode avion. |
| `commentatrice_lecture_subie_08_f.mp3` | C'était téléphoné. Mais elle était en mode avion. |
| `commentatrice_lecture_subie_09.mp3` | Il veut lire le jeu adverse. Qu'il commence par le sien. |
| `commentatrice_lecture_subie_09_f.mp3` | Elle veut lire le jeu adverse. Qu'elle commence par le sien. |
| `commentatrice_lecture_subie_10.mp3` | Les mêmes causes produisent les mêmes effets. |
| `commentatrice_lecture_subie_11.mp3` | Complètement à côté de son sujet. |
| `commentatrice_lecture_subie_12.mp3` | Son jeu manque de variation, il est encore sur les vieux schémas de la veille. |
| `commentatrice_lecture_subie_12_f.mp3` | Son jeu manque de variation, elle est encore sur les vieux schémas de la veille. |
| `commentatrice_lecture_subie_13.mp3` | C'est une erreur tactique assez élémentaire. |
| `commentatrice_lecture_subie_14.mp3` | La pierre est souvent surestimée dans les milieux amateurs. |
| `commentatrice_lecture_subie_15.mp3` | Il existe une école japonaise qui aurait désapprouvé ce geste. |
| `commentatrice_lecture_subie_16.mp3` | Ce joueur manque cruellement de culture tactique. |
| `commentatrice_lecture_subie_16_f.mp3` | Cette joueuse manque cruellement de culture tactique. |
| `commentatrice_lecture_reussie_01.mp3` | Coup de maître. |
| `commentatrice_lecture_reussie_02.mp3` | Bien vu l'aveugle. |
| `commentatrice_lecture_reussie_03.mp3` | Il joue aux échecs. L'autre joue aux dames. |
| `commentatrice_lecture_reussie_03_f.mp3` | Elle joue aux échecs. L'autre joue aux dames. |
| `commentatrice_lecture_reussie_04.mp3` | Il y a une vraie lecture du jeu. |
| `commentatrice_temps_ecoule_01.mp3` | Le chrono ne pardonne pas. Moi non plus. |
| `commentatrice_temps_ecoule_02.mp3` | Trop de réflexion tue la réflexion. |
| `commentatrice_temps_ecoule_04.mp3` | L'affaire du chronomètre. On n'en parle pas. |
| `commentatrice_temps_ecoule_05.mp3` | Le ridicule ne tue pas. Heureusement pour lui. |
| `commentatrice_temps_ecoule_05_f.mp3` | Le ridicule ne tue pas. Heureusement pour elle. |
| `commentatrice_temps_ecoule_06.mp3` | Il réfléchit encore. On lui enverra le résultat par courrier. |
| `commentatrice_temps_ecoule_06_f.mp3` | Elle réfléchit encore. On lui enverra le résultat par courrier. |
| `commentatrice_temps_ecoule_07.mp3` | L'horloge, elle, ne s'arrête jamais. |
| `commentatrice_temps_ecoule_08.mp3` | Il réfléchissait encore. Le chrono, lui, a décidé. |
| `commentatrice_temps_ecoule_08_f.mp3` | Elle réfléchissait encore. Le chrono, lui, a décidé. |
| `commentatrice_temps_ecoule_09.mp3` | La montre a joué pour lui. Pas sûr qu'elle joue bien. |
| `commentatrice_temps_ecoule_09_f.mp3` | La montre a joué pour elle. Pas sûr qu'elle joue bien. |
| `commentatrice_tension_01.mp3` | C'est maintenant que les champions se révèlent. Et les autres aussi. |
| `commentatrice_tension_02.mp3` | Pas de Pierre ici. Tout le monde attend la Pierre. |
| `commentatrice_tension_03.mp3` | Pas d'enflammade, pas d'enflammade. |
| `commentatrice_tension_04.mp3` | Toute une carrière pour ce point. Aucune pression. |
| `commentatrice_tension_05.mp3` | Il a la victoire au bout des doigts. Littéralement. |
| `commentatrice_tension_05_f.mp3` | Elle a la victoire au bout des doigts. Littéralement. |
| `commentatrice_tension_06.mp3` | Que la force soit avec lui. Il va en avoir besoin. |
| `commentatrice_tension_06_f.mp3` | Que la force soit avec elle. Elle va en avoir besoin. |
| `commentatrice_tension_07.mp3` | C'est le moment de ne pas jouer Pierre. Ou de jouer Pierre. Je ne sais plus. |
| `commentatrice_tension_08.mp3` | Les mains sont moites. |
| `commentatrice_tension_09.mp3` | Maintenant, il faut marquer pour continuer à espérer. |
| `commentatrice_point_decisif_01.mp3` | Ici, pas de deuxième chance. Comme dans la vie. |
| `commentatrice_point_decisif_02.mp3` | Celui qui cligne des yeux a perdu. |
| `commentatrice_point_decisif_03.mp3` | Respirez. Moi, j'ai arrêté il y a trois points. |
| `commentatrice_point_decisif_04.mp3` | J'entends mon cœur. Ou le sien. Peut-être les deux. |
| `commentatrice_point_decisif_05.mp3` | Le prochain qui bouge a perdu. Ou gagné. |
| `commentatrice_point_decisif_06.mp3` | Respirez. Non, ne respirez pas. C'est irrespirable. |
| `commentatrice_match_point_decisif_01.mp3` | Le genre de match qu'on raconte à ses petits-enfants. |
| `commentatrice_match_perdu_point_decisif_01.mp3` | Le sport est cruel. Ce soir, très cruel. |
| `commentatrice_finale_perdue_point_decisif_01.mp3` | Perdre une finale à quinze-quatorze… Il y a des cicatrices qui ne se referment pas. |
| `commentatrice_set_ecrasant_01.mp3` | Sèche correction. |
| `commentatrice_set_ecrasant_02.mp3` | Il n'y a pas eu de match dans ce set. |
| `commentatrice_set_ecrasant_03.mp3` | Il aurait dû rester au vestiaire. |
| `commentatrice_set_ecrasant_05.mp3` | Un set à oublier. Je l'ai déjà oublié. |
| `commentatrice_set_ecrasant_06.mp3` | Qu'on m'apporte un café. Et un autre match. |
| `commentatrice_set_ecrasant_07.mp3` | Bref. Il a perdu le set. |
| `commentatrice_set_ecrasant_07_f.mp3` | Bref. Elle a perdu le set. |
| `commentatrice_set_ecrasant_08.mp3` | Un set vite expédié, pas de chichifoumi. |
| `commentatrice_set_ecrasant_09.mp3` | Le coup du berger. Plié en quelques coups. |
| `commentatrice_set_ecrasant_10.mp3` | Rien à redire. Ou si peu. |
| `commentatrice_set_ecrasant_11.mp3` | C'est une parodie de chifoumi à laquelle nous assistons. |
| `commentatrice_set_couteau_01.mp3` | Arraché. Mérité, on en reparlera. |
| `commentatrice_set_couteau_02.mp3` | Il fallait des nerfs solides pour conclure celui-là. Il y en avait. Juste assez. |
| `commentatrice_set_couteau_03.mp3` | Personne ne méritait de le perdre. L'un des deux l'a quand même perdu. |
| `commentatrice_set_couteau_04.mp3` | La goutte d'eau qui fait déborder la Feuille. |
| `commentatrice_set_couteau_05.mp3` | Les deux méritaient. Un seul l'emporte. C'est le sport. |
| `commentatrice_un_set_partout_01.mp3` | Bien malin qui pourra prédire maintenant l'issue de cette rencontre. |
| `commentatrice_un_set_partout_02.mp3` | Le début de la troisième manche sera crucial. |
| `commentatrice_un_set_partout_03.mp3` | Un deuxième set très bien négocié pour continuer d'y croire. À l'aube de ce troisième set, c'est l'heure d'ajuster ses séquences et d'affirmer son caractère, en évitant tout péché d'orgueil. |
| `commentatrice_premier_set_net_01.mp3` | Patiemment, il a assis sa victoire, sans laisser à son adversaire le temps d'installer sa riposte. |
| `commentatrice_premier_set_net_01_f.mp3` | Patiemment, elle a assis sa victoire, sans laisser à son adversaire le temps d'installer sa riposte. |
| `commentatrice_premier_set_large_01.mp3` | Au terme de ce set, une classe d'écart semble séparer les deux mains. Il doit repenser complètement ses séquences et se montrer plus agressif dans les duels. |
| `commentatrice_premier_set_large_01_f.mp3` | Au terme de ce set, une classe d'écart semble séparer les deux mains. Elle doit repenser complètement ses séquences et se montrer plus agressive dans les duels. |
| `commentatrice_premier_set_ecrase_01.mp3` | Un premier set dominé de la tête et des épaules. Aucun répit pour son adversaire, qui doit à présent se ressaisir s'il veut exister à nouveau dans cette rencontre. |
| `commentatrice_resume_set_01.mp3` | L'un a pris les commandes. À l'autre de réagir. S'il sait comment. |
| `commentatrice_resume_set_02.mp3` | Il faudra changer de plan. Ou en avoir un. |
| `commentatrice_resume_set_03.mp3` | Le rapport de force est clair. Pour l'instant. |
| `commentatrice_resume_set_04.mp3` | Il revient bien depuis la tendinite qui l'a éloigné du central pendant plusieurs mois. |
| `commentatrice_resume_set_04_f.mp3` | Elle revient bien depuis la tendinite qui l'a éloignée du central pendant plusieurs mois. |
| `commentatrice_resume_set_05.mp3` | Un set propre. Pas spectaculaire, mais propre. |
| `commentatrice_resume_set_06.mp3` | Le vainqueur a fait moins d'erreurs. C'est souvent comme ça que ça marche. |
| `commentatrice_resume_set_07.mp3` | Dans ce genre de situation, l'expérience fait toute la différence. |
| `commentatrice_resume_set_08.mp3` | C'est typiquement le genre de point qu'on travaille à l'entraînement. |
| `commentatrice_resume_set_09.mp3` | C'est précisément pour ce genre de situation que la préparation mentale existe. |
| `commentatrice_set_decisif_01.mp3` | Les statistiques ne servent plus à rien. C'est le caractère qui parle. Quand il y en a. |
| `commentatrice_set_decisif_02.mp3` | Un set pour un titre. Je reste calme. Pour deux. |
| `commentatrice_set_decisif_04.mp3` | Rien ne va plus. Faites vos jeux. |
| `commentatrice_set_decisif_05.mp3` | Deux sets pour s'échauffer. Le vrai match commence. |
| `commentatrice_set_decisif_06.mp3` | La fatigue va parler. Et la tête aussi. |
| `commentatrice_set_decisif_07.mp3` | On efface tout. Il ne reste que l'essentiel. |
| `commentatrice_set_decisif_08.mp3` | Maintenant, on va voir qui a le plus envie. |
| `commentatrice_renversement_01.mp3` | Il a perdu une bataille. Il gagne la guerre. Classique. |
| `commentatrice_renversement_01_f.mp3` | Elle a perdu une bataille. Elle gagne la guerre. Classique. |
| `commentatrice_renversement_02.mp3` | Comme quoi, un match n'est jamais fini. |
| `commentatrice_renversement_03.mp3` | Il était parti pour perdre. Il a changé d'avis. |
| `commentatrice_renversement_03_f.mp3` | Elle était partie pour perdre. Elle a changé d'avis. |
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
| `commentatrice_balle_match_convertie_14.mp3` | Une balle de match, une seule. Efficace. |
| `commentatrice_victoire_deux_zero_01.mp3` | Une victoire sans trembler. Il n'a jamais réellement été mis en difficulté et a su maintenir son avance tout au long de la rencontre. Pour son adversaire, il faudra un sursaut lors du prochain rendez-vous. |
| `commentatrice_victoire_deux_zero_01_f.mp3` | Une victoire sans trembler. Elle n'a jamais réellement été mise en difficulté et a su maintenir son avance tout au long de la rencontre. Pour son adversaire, il faudra un sursaut lors du prochain rendez-vous. |
| `commentatrice_victoire_deux_zero_02.mp3` | Victoire logique, contre une main qui n'a pas su contrarier ses offensives. Il a pris le contrôle du match et joué une partition bien rodée. |
| `commentatrice_victoire_deux_zero_02_f.mp3` | Victoire logique, contre une main qui n'a pas su contrarier ses offensives. Elle a pris le contrôle du match et joué une partition bien rodée. |
| `commentatrice_victoire_deux_zero_03.mp3` | Un set qui conclut une rencontre à sens unique. Il a su prendre l'initiative dès le premier set, sans laisser son opposant revenir dans le rythme de la rencontre. |
| `commentatrice_victoire_deux_zero_03_f.mp3` | Un set qui conclut une rencontre à sens unique. Elle a su prendre l'initiative dès le premier set, sans laisser son opposant revenir dans le rythme de la rencontre. |
| `commentatrice_victoire_deux_zero_04.mp3` | Une victoire et beaucoup de confiance après une prestation impeccable. Pour son adversaire, le manque d'engagement et l'attentisme ont rendu l'issue prévisible. |
| `commentatrice_victoire_01.mp3` | Rideau. |
| `commentatrice_victoire_02.mp3` | Mission accomplie. Sans éclat, mais accomplie. |
| `commentatrice_victoire_03.mp3` | Rien à dire. Et je trouve toujours quelque chose à dire. |
| `commentatrice_victoire_04.mp3` | Propre. Net. Sans bavure. |
| `commentatrice_victoire_05.mp3` | On ne reverra peut-être jamais ça. Tant mieux, j'ai eu mon compte. |
| `commentatrice_victoire_06.mp3` | Une victoire construite point par point. |
| `commentatrice_victoire_07.mp3` | Il l'a voulue, il l'a eue. |
| `commentatrice_victoire_07_f.mp3` | Elle l'a voulue, elle l'a eue. |
| `commentatrice_victoire_08.mp3` | Une victoire méritée. Je le dis rarement, profitez-en. |
| `commentatrice_victoire_09.mp3` | La victoire est méritée, même si le déroulement reste discutable. |
| `commentatrice_victoire_10.mp3` | Une bonne décision au bon moment. |
| `commentatrice_victoire_11.mp3` | Il a su exploiter la faiblesse adverse. |
| `commentatrice_victoire_11_f.mp3` | Elle a su exploiter la faiblesse adverse. |
| `commentatrice_victoire_12.mp3` | C'est une victoire qui récompense une certaine discipline. |
| `commentatrice_defaite_02.mp3` | Il faudra revoir ce match. Ou l'oublier. Je conseille l'oubli. |
| `commentatrice_defaite_03.mp3` | On apprend plus d'une défaite. Il a beaucoup appris, ce soir. |
| `commentatrice_defaite_03_f.mp3` | On apprend plus d'une défaite. Elle a beaucoup appris, ce soir. |
| `commentatrice_defaite_04.mp3` | Quelqu'un peut lui expliquer les règles ? |
| `commentatrice_defaite_06.mp3` | Il va falloir se remettre en question. Ou changer de main. |
| `commentatrice_defaite_07.mp3` | La sentence est irrévocable. |
| `commentatrice_defaite_08.mp3` | Il a le seum. Comme disent les jeunes. |
| `commentatrice_defaite_08_f.mp3` | Elle a le seum. Comme disent les jeunes. |
| `commentatrice_defaite_09.mp3` | Le vainqueur repart avec la gloire. Le vaincu repart avec une remise en question existentielle. |
| `commentatrice_defaite_10.mp3` | Vous êtes le maillon faible. Au revoir ! |
| `commentatrice_defaite_11.mp3` | Le résultat est sévère. Mais juste. Surtout juste. |
| `commentatrice_defaite_12.mp3` | Ce n'était pas son jour. |
| `commentatrice_defaite_13.mp3` | Il y a eu match. Mais pas assez longtemps. |
| `commentatrice_defaite_14.mp3` | Une défaite, ce n'est pas une fin. C'est une leçon. Coûteuse. |
| `commentatrice_defaite_15.mp3` | Il rentrera chez lui en refaisant le match. Plusieurs fois. |
| `commentatrice_defaite_15_f.mp3` | Elle rentrera chez elle en refaisant le match. Plusieurs fois. |
| `commentatrice_defaite_16.mp3` | Il y a des jours où rien ne veut sortir. C'était celui-là. |
| `commentatrice_defaite_17.mp3` | Une défaite qui était malheureusement prévisible. |
| `commentatrice_defaite_18.mp3` | Il a manqué de lucidité. |
| `commentatrice_defaite_18_f.mp3` | Elle a manqué de lucidité. |
| `commentatrice_defaite_19.mp3` | Ce choix était une faute technique. |
| `commentatrice_defaite_20.mp3` | Il faudra revoir les fondamentaux. |
| `commentatrice_defaite_21.mp3` | Il n'a pas su lire le jeu adverse. |
| `commentatrice_defaite_21_f.mp3` | Elle n'a pas su lire le jeu adverse. |
| `commentatrice_defaite_22.mp3` | C'est le genre de défaite qui doit faire réfléchir. |
| `commentatrice_memoire_ouverture_01_pierre.mp3` | Il avait ouvert avec la Pierre la dernière fois. Il a peut-être appris. Peut-être. |
| `commentatrice_memoire_ouverture_01_pierre_f.mp3` | Elle avait ouvert avec la Pierre la dernière fois. Elle a peut-être appris. Peut-être. |
| `commentatrice_memoire_ouverture_01_ciseaux.mp3` | Il avait ouvert avec les Ciseaux la dernière fois. Il a peut-être appris. Peut-être. |
| `commentatrice_memoire_ouverture_01_ciseaux_f.mp3` | Elle avait ouvert avec les Ciseaux la dernière fois. Elle a peut-être appris. Peut-être. |
| `commentatrice_memoire_ouverture_01_feuille.mp3` | Il avait ouvert avec la Feuille la dernière fois. Il a peut-être appris. Peut-être. |
| `commentatrice_memoire_ouverture_01_feuille_f.mp3` | Elle avait ouvert avec la Feuille la dernière fois. Elle a peut-être appris. Peut-être. |
| `commentatrice_memoire_meme_ouverture_02.mp3` | Il rejoue la même ouverture que la dernière fois. Simple habitude, ou piège ? |
| `commentatrice_memoire_meme_ouverture_02_f.mp3` | Elle rejoue la même ouverture que la dernière fois. Simple habitude, ou piège ? |
| `commentatrice_memoire_meme_ouverture_03.mp3` | Même ouverture. Il assume. |
| `commentatrice_memoire_meme_ouverture_03_f.mp3` | Même ouverture. Elle assume. |
| `commentatrice_memoire_meme_ouverture_04.mp3` | La même ouverture que la dernière fois. Il teste la mémoire de son adversaire. |
| `commentatrice_memoire_meme_ouverture_04_f.mp3` | La même ouverture que la dernière fois. Elle teste la mémoire de son adversaire. |
| `commentatrice_memoire_meme_ouverture_05.mp3` | Une ouverture assez prévisible. |
| `commentatrice_memoire_change_ouverture_01.mp3` | Il change d'ouverture. La dernière fois lui a servi de leçon. |
| `commentatrice_memoire_change_ouverture_01_f.mp3` | Elle change d'ouverture. La dernière fois lui a servi de leçon. |
| `commentatrice_memoire_habitues_01.mp3` | Ils se connaissent par cœur. Ça va être un match d'échecs. |
| `commentatrice_memoire_mene_01.mp3` | Il mène dans leurs face-à-face. Mais ça ne veut rien dire. Enfin, un peu. |
| `commentatrice_memoire_mene_01_f.mp3` | Elle mène dans leurs face-à-face. Mais ça ne veut rien dire. Enfin, un peu. |
| `commentatrice_memoire_jamais_battu_01.mp3` | Jamais battu cet adversaire. Il y a un début à tout. |
| `commentatrice_memoire_retrouvailles_01.mp3` | Ça fait un moment qu'ils ne se sont pas vus. Ils ont eu le temps de réviser. |
| `commentatrice_memoire_dernier_gagne_01.mp3` | Il avait gagné la dernière fois. Le plus dur, c'est de recommencer. |
| `commentatrice_memoire_dernier_gagne_01_f.mp3` | Elle avait gagné la dernière fois. Le plus dur, c'est de recommencer. |
| `commentatrice_memoire_dernier_gagne_02.mp3` | La dernière fois, il avait gagné. Il aimerait bien que ça continue. |
| `commentatrice_memoire_dernier_gagne_02_f.mp3` | La dernière fois, elle avait gagné. Elle aimerait bien que ça continue. |
| `commentatrice_memoire_dernier_perdu_01.mp3` | Il reste sur une défaite contre lui. Il a eu le temps d'y penser. |
| `commentatrice_memoire_dernier_perdu_01_f.mp3` | Elle reste sur une défaite. Elle a eu le temps d'y penser. |
| `commentatrice_memoire_renverse_01.mp3` | La dernière fois, il avait renversé le match. L'autre s'en souvient. |
| `commentatrice_memoire_renverse_01_f.mp3` | La dernière fois, elle avait renversé le match. L'autre s'en souvient. |
| `commentatrice_memoire_favori_01_pierre.mp3` | La dernière fois, il avait beaucoup joué la Pierre. Il a dû y repenser. |
| `commentatrice_memoire_favori_01_pierre_f.mp3` | La dernière fois, elle avait beaucoup joué la Pierre. Elle a dû y repenser. |
| `commentatrice_memoire_favori_01_ciseaux.mp3` | La dernière fois, il avait beaucoup joué les Ciseaux. Il a dû y repenser. |
| `commentatrice_memoire_favori_01_ciseaux_f.mp3` | La dernière fois, elle avait beaucoup joué les Ciseaux. Elle a dû y repenser. |
| `commentatrice_memoire_favori_01_feuille.mp3` | La dernière fois, il avait beaucoup joué la Feuille. Il a dû y repenser. |
| `commentatrice_memoire_favori_01_feuille_f.mp3` | La dernière fois, elle avait beaucoup joué la Feuille. Elle a dû y repenser. |
| `commentatrice_memoire_long_01.mp3` | Leur dernier match a duré une éternité. J'ai prévu un thermos. |
| `commentatrice_memoire_long_02.mp3` | Leur dernier match a duré une éternité. J'ai prévu un coussin. |
| `commentatrice_memoire_defaite_seche_01.mp3` | La dernière fois, c'était une correction. On espère un match, cette fois. |
| `commentatrice_memoire_serre_01.mp3` | La dernière fois, ça s'était joué à un point. Prévoyez du temps. |
| `commentatrice_memoire_belle_01.mp3` | Égalité dans leurs confrontations. Il faut bien que quelqu'un passe devant. |
| `commentatrice_memoire_habitude_01.mp3` | Il a gagné les derniers face-à-face. À ce stade, ce n'est plus un duel, c'est une habitude. |
| `commentatrice_memoire_habitude_01_f.mp3` | Elle a gagné les derniers face-à-face. À ce stade, ce n'est plus un duel, c'est une habitude. |
| `commentatrice_avant_ambiance_01.mp3` | On ne s'entend plus. C'est presque agréable. |
| `commentatrice_avant_ambiance_02.mp3` | Autant de bruit pour trois signes. J'adore ce sport. |
| `commentatrice_avant_ambiance_03.mp3` | Beaucoup d'énergie dans les tribunes. Espérons qu'il en reste sur le court. |
| `commentatrice_avant_ambiance_04.mp3` | Ils ont plus de souffle que certains joueurs. |
| `commentatrice_avant_ambiance_05.mp3` | Le public est prêt. Les joueurs, on verra. |
| `commentatrice_avant_ambiance_06.mp3` | Ça chante faux, mais avec conviction. |
| `commentatrice_avant_ambiance_07.mp3` | Tout ce monde pour trois signes. J'en suis presque émue. |
| `commentatrice_perso_supporters_01.mp3` | Il a son fan-club. Je me demande combien il les paie. |
| `commentatrice_perso_supporters_01_f.mp3` | Elle a son fan-club. Je me demande combien elle les paie. |
| `commentatrice_perso_supporters_02.mp3` | Des supporters rien que pour lui. Il ne faudra pas les décevoir. |
| `commentatrice_perso_supporters_02_f.mp3` | Des supporters rien que pour elle. Il ne faudra pas les décevoir. |
| `commentatrice_perso_supporters_03.mp3` | Un chant à son nom. Moi, à mes débuts, j'avais juste un thermos. |
| `commentatrice_perso_chiromancien_presentation_01.mp3` | Le Chiromancien. Il prétend connaître l'avenir. Moi, je connais déjà son ouverture. |
| `commentatrice_perso_chiromancien_lecture_01.mp3` | Les lignes de la main ne mentent pas. Celles de son adversaire, en tout cas. |
| `commentatrice_perso_chiromancien_perd_01.mp3` | Même les voyants ont des jours sans. |
| `commentatrice_perso_chiromancien_victoire_01.mp3` | Il savait comment ça finirait. Nous, on a dû attendre. |
| `commentatrice_perso_chiromancien_defaite_01.mp3` | Sa boule de cristal était embuée ce soir. |
| `commentatrice_replay_intro_01.mp3` | Revoyons les images. Calmement. |
| `commentatrice_replay_intro_02.mp3` | Au ralenti, c'est encore plus clair. |
| `commentatrice_replay_intro_03.mp3` | Une séquence riche en enseignements techniques. |
| `commentatrice_replay_intro_04.mp3` | Voilà pourquoi il ne faut jamais relâcher sa concentration. |
| `commentatrice_replay_sauvee_01.mp3` | Au ralenti, on voit la peur. Et puis non. |
| `commentatrice_replay_sauvee_02.mp3` | Au ralenti, on voit tout. Même ce qu'il ne fallait pas faire. |
| `commentatrice_replay_sauvee_03.mp3` | Face à un adversaire trop sûr de lui, il a joué juste et il est resté en vie. |
| `commentatrice_replay_sauvee_03_f.mp3` | Face à un adversaire trop sûr de lui, elle a joué juste et elle est restée en vie. |
| `commentatrice_replay_smash_01.mp3` | Toute la puissance est dans le poignet. |
| `commentatrice_replay_smash_02.mp3` | Même au ralenti, ça va vite. |
| `commentatrice_replay_smash_03.mp3` | Bonne lecture, qui lui a permis de marquer son territoire. |
| `commentatrice_replay_smash_04.mp3` | Au ralenti, l'impact est encore plus impressionnant. |
| `commentatrice_replay_set_01.mp3` | Tout s'est joué là. |
| `commentatrice_replay_set_02.mp3` | Tout s'est joué là. À une main près. |
| `commentatrice_replay_serie_01.mp3` | La patience a payé. |
| `commentatrice_replay_serie_02.mp3` | Cinq points d'affilée. Ça ne s'improvise pas. |
| `commentatrice_replay_palette_pertinent_01.mp3` | Il l'avait lu. Après une défaite, l'autre changeait toujours. |
| `commentatrice_replay_palette_pertinent_01_f.mp3` | Elle l'avait lu. Après une défaite, l'autre changeait toujours. |
| `commentatrice_replay_palette_pertinent_02.mp3` | Tout était sur la palette. Il n'a eu qu'à se servir. |
| `commentatrice_replay_palette_pertinent_02_f.mp3` | Tout était sur la palette. Elle n'a eu qu'à se servir. |
| `commentatrice_replay_palette_pertinent_03.mp3` | Tout était écrit dans les coups d'avant. Il a su lire entre les lignes. |
| `commentatrice_replay_palette_pertinent_03_f.mp3` | Tout était écrit dans les coups d'avant. Elle a su lire entre les lignes. |
| `commentatrice_replay_palette_pertinent_04.mp3` | Il connaissait la réponse avant que la question soit posée. |
| `commentatrice_replay_palette_pertinent_04_f.mp3` | Elle connaissait la réponse avant que la question soit posée. |
| `commentatrice_replay_palette_propre_01.mp3` | Il a cassé sa propre habitude au bon moment. Très propre. |
| `commentatrice_replay_palette_propre_01_f.mp3` | Elle a cassé sa propre habitude au bon moment. Très propre. |
| `commentatrice_replay_palette_propre_02.mp3` | Il a cassé son propre rythme juste quand il fallait. Rien à redire. |
| `commentatrice_replay_palette_propre_02_f.mp3` | Elle a cassé son propre rythme juste quand il fallait. Rien à redire. |
| `commentatrice_replay_palette_propre_03.mp3` | Il a changé au bon moment. C'est tout un art. |
| `commentatrice_replay_palette_propre_03_f.mp3` | Elle a changé au bon moment. C'est tout un art. |
| `commentatrice_replay_palette_propre_04.mp3` | L'habitude, il l'a créée exprès. Pour mieux la casser. |
| `commentatrice_replay_palette_propre_04_f.mp3` | L'habitude, elle l'a créée exprès. Pour mieux la casser. |
| `commentatrice_replay_palette_mauvais_01.mp3` | Il a rejoué la même chose. On ne peut pas faire ça à ce niveau. |
| `commentatrice_replay_palette_mauvais_01_f.mp3` | Elle a rejoué la même chose. On ne peut pas faire ça à ce niveau. |
| `commentatrice_replay_palette_mauvais_02_pierre.mp3` | Il n'a pas senti le coup. Le jeu n'était clairement pas là : choisir la Pierre n'était pas la bonne option dans cette situation. |
| `commentatrice_replay_palette_mauvais_02_pierre_f.mp3` | Elle n'a pas senti le coup. Le jeu n'était clairement pas là : choisir la Pierre n'était pas la bonne option dans cette situation. |
| `commentatrice_replay_palette_mauvais_02_ciseaux.mp3` | Il n'a pas senti le coup. Le jeu n'était clairement pas là : choisir les Ciseaux n'était pas la bonne option dans cette situation. |
| `commentatrice_replay_palette_mauvais_02_ciseaux_f.mp3` | Elle n'a pas senti le coup. Le jeu n'était clairement pas là : choisir les Ciseaux n'était pas la bonne option dans cette situation. |
| `commentatrice_replay_palette_mauvais_02_feuille.mp3` | Il n'a pas senti le coup. Le jeu n'était clairement pas là : choisir la Feuille n'était pas la bonne option dans cette situation. |
| `commentatrice_replay_palette_mauvais_02_feuille_f.mp3` | Elle n'a pas senti le coup. Le jeu n'était clairement pas là : choisir la Feuille n'était pas la bonne option dans cette situation. |
| `commentatrice_replay_palette_mauvais_03.mp3` | Il a joué ce que tout le monde attendait. Son adversaire le premier. |
| `commentatrice_replay_palette_mauvais_03_f.mp3` | Elle a joué ce que tout le monde attendait. Son adversaire le premier. |
| `commentatrice_replay_palette_mauvais_04.mp3` | Une fois, c'est une idée. Trois fois, c'est une habitude. Et l'adversaire l'a vue. |
| `commentatrice_replay_palette_pas_la_06.mp3` | Le jeu n'était pas là. Tout indiquait un autre signe. |
| `commentatrice_replay_palette_pas_la_07.mp3` | Il a joué ce qu'il avait envie de jouer. Pas ce que le match demandait. |
| `commentatrice_replay_palette_pas_la_07_f.mp3` | Elle a joué ce qu'elle avait envie de jouer. Pas ce que le match demandait. |
| `commentatrice_replay_palette_pas_la_08_pierre.mp3` | La Pierre, ici ? Non. Le jeu n'était clairement pas là. |
| `commentatrice_replay_palette_pas_la_08_ciseaux.mp3` | Les Ciseaux, ici ? Non. Le jeu n'était clairement pas là. |
| `commentatrice_replay_palette_pas_la_08_feuille.mp3` | La Feuille, ici ? Non. Le jeu n'était clairement pas là. |
| `commentatrice_replay_palette_pas_la_09.mp3` | Il s'est entêté. Le bon coup était sous ses yeux. |
| `commentatrice_replay_palette_pas_la_09_f.mp3` | Elle s'est entêtée. Le bon coup était sous ses yeux. |
| `commentatrice_replay_palette_pas_la_10.mp3` | Une décision difficile à défendre. Même pour moi. |
| `commentatrice_replay_palette_pas_la_11.mp3` | Un mauvais réflexe, et le point qui lui était promis lui a échappé. |
| `commentatrice_replay_palette_piege_01.mp3` | Il l'a amené exactement où il voulait. |
| `commentatrice_replay_palette_piege_01_f.mp3` | Elle l'a amené exactement où elle voulait. |
| `commentatrice_replay_palette_piege_02.mp3` | Magnifique changement de rythme, qui a laissé son adversaire sur place. |
| `commentatrice_replay_palette_piege_03.mp3` | Trois coups pour endormir, un pour frapper. C'est du travail d'orfèvre. |
| `commentatrice_replay_palette_piege_04.mp3` | Quatre coups pour endormir, un pour frapper. C'est du travail d'orfèvre. |
| `commentatrice_replay_palette_piege_05.mp3` | Cinq coups pour endormir, un pour frapper. C'est du travail d'orfèvre. |
| `commentatrice_replay_palette_piege_06.mp3` | Six coups pour endormir, un pour frapper. C'est du travail d'orfèvre. |
| `commentatrice_replay_palette_piege_07.mp3` | Il a fait semblant d'être prévisible. C'est tout un art. |
| `commentatrice_replay_palette_piege_07_f.mp3` | Elle a fait semblant d'être prévisible. C'est tout un art. |
| `commentatrice_replay_palette_smash_01.mp3` | Il a marqué son territoire, et il a fait mal psychologiquement à son adversaire. |
| `commentatrice_replay_palette_smash_01_f.mp3` | Elle a marqué son territoire, et elle a fait mal psychologiquement à son adversaire. |
| `commentatrice_replay_palette_smash_02.mp3` | Il a pris le dessus mentalement après ce point. |
| `commentatrice_replay_palette_smash_02_f.mp3` | Elle a pris le dessus mentalement après ce point. |
| `commentatrice_replay_palette_smash_03.mp3` | Un smash au bon moment, ça vaut plus qu'un point. Ça laisse des traces. |
| `commentatrice_replay_palette_smash_subi_01.mp3` | Il a été marqué par ce smash. Il ne s'en est jamais vraiment remis. |
| `commentatrice_replay_palette_smash_subi_01_f.mp3` | Elle a été marquée par ce smash. Elle ne s'en est jamais vraiment remise. |
| `commentatrice_replay_palette_smash_subi_02.mp3` | Après ça, il a joué avec la peur au ventre. Et ça s'est vu. |
| `commentatrice_replay_palette_smash_subi_02_f.mp3` | Après ça, elle a joué avec la peur au ventre. Et ça s'est vu. |
| `commentatrice_replay_palette_smash_subi_03.mp3` | Ce smash-là, ses doigts s'en souviendront. |
| `commentatrice_memoire_serie_3_01.mp3` | Il reste sur trois victoires d'affilée contre lui. |
| `commentatrice_memoire_serie_3_01_f.mp3` | Elle reste sur trois victoires d'affilée contre lui. |
| `commentatrice_memoire_serie_4_01.mp3` | Quatre de suite. L'autre commence à le prendre personnellement. |
| `commentatrice_memoire_serie_5_01.mp3` | Cinq victoires d'affilée. À ce niveau, ce n'est plus une série, c'est un abonnement. |
| `commentatrice_memoire_serie_plus_01.mp3` | Il a gagné tous leurs derniers matchs. J'ai arrêté de compter. Lui, non. |
| `commentatrice_memoire_serie_plus_01_f.mp3` | Elle a gagné tous leurs derniers matchs. J'ai arrêté de compter. Elle, non. |
| `commentatrice_memoire_defaites_3_01.mp3` | Il reste sur trois défaites consécutives contre lui. |
| `commentatrice_memoire_defaites_3_01_f.mp3` | Elle reste sur trois défaites consécutives contre lui. |
| `commentatrice_memoire_defaites_4_01.mp3` | Il reste sur quatre défaites consécutives contre lui. |
| `commentatrice_memoire_defaites_4_01_f.mp3` | Elle reste sur quatre défaites consécutives contre lui. |
| `commentatrice_memoire_defaites_5_01.mp3` | Il reste sur cinq défaites consécutives contre lui. |
| `commentatrice_memoire_defaites_5_01_f.mp3` | Elle reste sur cinq défaites consécutives contre lui. |
| `commentatrice_memoire_defaites_plus_01.mp3` | Il reste sur une longue série de défaites contre lui. On a arrêté de compter. |
| `commentatrice_memoire_defaites_plus_01_f.mp3` | Elle reste sur une longue série de défaites contre lui. On a arrêté de compter. |
| `commentatrice_beau_coup_01.mp3` | Sur cette pierre, il bâtit son église. |
| `commentatrice_beau_coup_01_f.mp3` | Sur cette pierre, elle bâtit son église. |
| `commentatrice_beau_coup_02.mp3` | Un roc. Et un adversaire en miettes. |
| `commentatrice_beau_coup_03.mp3` | Il a sorti les lames. Et pas pour couper le gâteau. |
| `commentatrice_beau_coup_03_f.mp3` | Elle a sorti les lames. Et pas pour couper le gâteau. |
| `commentatrice_beau_coup_04.mp3` | Il taille dans le vif et découpe les espoirs adverses. |
| `commentatrice_beau_coup_04_f.mp3` | Elle taille dans le vif et découpe les espoirs adverses. |
| `commentatrice_beau_coup_05.mp3` | Il lui coupe l'herbe sous le pied ! |
| `commentatrice_beau_coup_05_f.mp3` | Elle lui coupe l'herbe sous le pied ! |
| `commentatrice_beau_coup_06.mp3` | Certains écrivent l'histoire, lui la découpe aux ciseaux. |
| `commentatrice_beau_coup_06_f.mp3` | Certains écrivent l'histoire, elle la découpe aux ciseaux. |
| `commentatrice_beau_coup_07.mp3` | Il vient de mettre son adversaire sous pli. |
| `commentatrice_beau_coup_07_f.mp3` | Elle vient de mettre son adversaire sous pli. |
| `commentatrice_beau_coup_08.mp3` | Une feuille. Et la pierre n'y peut rien. |
| `commentatrice_beau_coup_10.mp3` | Propre. Net. Sans bavure. |
| `commentatrice_beau_coup_11.mp3` | On connaît ses qualités chifoumistiques. |
| `commentatrice_beau_coup_12.mp3` | Une belle séquence, à enseigner dans les écoles de chifoumi. |
| `commentatrice_beau_coup_13.mp3` | Un geste peu académique, mais ça passe. |
| `commentatrice_beau_coup_14.mp3` | Joli. Je n'ai rien d'autre à ajouter. |
| `commentatrice_beau_coup_15.mp3` | Celui-là, on le mettra dans le résumé. |
| `commentatrice_beau_coup_16.mp3` | Classique, mais efficace. |
| `commentatrice_trois_pierres_01.mp3` | Pierre qui roule n'amasse pas mousse. |
| `commentatrice_trois_pierres_02.mp3` | La Pierre, encore et toujours. Ça a le mérite d'être solide. |
| `commentatrice_trois_ciseaux_01.mp3` | Trois Ciseaux, trois points. Le coiffeur est en forme. |
| `commentatrice_trois_ciseaux_02.mp3` | Trois Ciseaux gagnants. On sent le travail de précision. |
| `commentatrice_trois_feuilles_01.mp3` | Trois Feuilles, trois points. On tourne la page. |
| `commentatrice_trois_feuilles_02.mp3` | Trois Feuilles. Il a dû recevoir une ramette pour son anniversaire. |
| `commentatrice_trois_feuilles_02_f.mp3` | Trois Feuilles. Elle a dû recevoir une ramette pour son anniversaire. |
| `commentatrice_premiere_egalite_01.mp3` | Ça commence bien. Enfin, ça ne commence pas. |
| `commentatrice_premiere_egalite_02.mp3` | Premier coup, premier match nul. |
| `commentatrice_premiere_egalite_03.mp3` | Deux esprits, une seule idée. C'est rare. Surtout ici. |
| `commentatrice_premiere_egalite_04.mp3` | Le premier coup ne dit rien. Sauf qu'ils pensent pareil. |
| `commentatrice_apres_egalites_gagne_01.mp3` | Il fallait bien que quelqu'un se décide. |
| `commentatrice_apres_egalites_gagne_02.mp3` | La patience a payé. Pour une fois. |
| `commentatrice_apres_egalites_gagne_03.mp3` | Il fallait bien que quelqu'un change d'avis. Ce fut lui. |
| `commentatrice_apres_egalites_gagne_03_f.mp3` | Il fallait bien que quelqu'un change d'avis. Ce fut elle. |
| `commentatrice_apres_egalites_gagne_04.mp3` | La patience paie. Parfois. Là, oui. |
| `commentatrice_apres_egalites_gagne_05.mp3` | Un pari. Réussi, mais un pari. |
| `commentatrice_apres_egalites_gagne_06.mp3` | Il n'y avait rien à voir. Il a joué quand même. |
| `commentatrice_apres_egalites_gagne_06_f.mp3` | Il n'y avait rien à voir. Elle a joué quand même. |
| `commentatrice_apres_egalites_gagne_07.mp3` | Honnêtement ? Il n'y avait rien à lire. Il a eu raison d'oser. |
| `commentatrice_apres_egalites_gagne_07_f.mp3` | Honnêtement ? Il n'y avait rien à lire. Elle a eu raison d'oser. |
| `commentatrice_apres_egalites_perdu_01.mp3` | Il a cligné le premier. |
| `commentatrice_apres_egalites_perdu_01_f.mp3` | Elle a cligné la première. |
| `commentatrice_apres_egalites_perdu_02.mp3` | À force d'attendre, il s'est fait prendre. |
| `commentatrice_apres_egalites_perdu_02_f.mp3` | À force d'attendre, elle s'est fait prendre. |
| `commentatrice_apres_egalites_perdu_03.mp3` | L'autre a tenu un coup de plus. |
| `commentatrice_apres_egalites_perdu_04.mp3` | Il a changé d'idée une seconde trop tôt. |
| `commentatrice_apres_egalites_perdu_04_f.mp3` | Elle a changé d'idée une seconde trop tôt. |
| `commentatrice_cueilli_a_froid_01.mp3` | Il est entré dans le match avant l'autre. C'est un avantage. |
| `commentatrice_cueilli_a_froid_01_f.mp3` | Elle est entrée dans le match avant l'autre. C'est un avantage. |
| `commentatrice_ouverture_egalites_01.mp3` | Personne ne veut se dévoiler. Ça pourrait durer. |
| `commentatrice_ouverture_egalites_02.mp3` | Deux joueurs qui se regardent en chiens de faïence. |
| `commentatrice_contre_cours_01.mp3` | Les mouches ont changé d'âne. |
| `commentatrice_contre_cours_02.mp3` | Enfin un point. Il commençait à oublier la sensation. |
| `commentatrice_contre_cours_02_f.mp3` | Enfin un point. Elle commençait à oublier la sensation. |
| `commentatrice_contre_cours_03.mp3` | Un point qui ne compte qu'un, mais qui pèse lourd. |
| `commentatrice_riposte_01.mp3` | Un point perdu, un point repris. L'équilibre est rétabli. |
| `commentatrice_cadrage_01.mp3` | Il prépare avec la Feuille, il finit avec la Pierre. Propre. |
| `commentatrice_cadrage_01_f.mp3` | Elle prépare avec la Feuille, elle finit avec la Pierre. Propre. |
| `commentatrice_quatre_meme_01.mp3` | Il s'enferme dans un jeu stéréotypé. |
| `commentatrice_quatre_meme_01_f.mp3` | Elle s'enferme dans un jeu stéréotypé. |
| `commentatrice_quatre_meme_02.mp3` | Il est en panne d'inspiration. |
| `commentatrice_quatre_meme_02_f.mp3` | Elle est en panne d'inspiration. |
| `commentatrice_quatre_meme_03.mp3` | Quatre fois. Il a trouvé un signe qui lui plaît. |
| `commentatrice_quatre_meme_03_f.mp3` | Quatre fois. Elle a trouvé un signe qui lui plaît. |
| `commentatrice_quatre_meme_04.mp3` | Soit c'est une stratégie, soit c'est une habitude. On le saura bientôt. |
| `commentatrice_quatre_meme_05.mp3` | L'adversaire n'a plus qu'à se servir. S'il regarde. |
| `commentatrice_chasse_patate_01.mp3` | Il colle au score comme un chewing-gum à une semelle. |
| `commentatrice_chasse_patate_01_f.mp3` | Elle colle au score comme un chewing-gum à une semelle. |
| `commentatrice_money_time_01.mp3` | C'est maintenant que les jambes tremblent. Enfin, les mains. |
| `commentatrice_money_time_02.mp3` | Huit partout. Les calculatrices sont rangées, place au caractère. |
| `commentatrice_rate_money_time_01_pierre.mp3` | Une Pierre qui fait très mal à ce moment de la partie. |
| `commentatrice_rate_money_time_01_ciseaux.mp3` | Des Ciseaux qui font très mal à ce moment de la partie. |
| `commentatrice_rate_money_time_01_feuille.mp3` | Une Feuille qui fait très mal à ce moment de la partie. |
| `commentatrice_rate_money_time_02.mp3` | Mauvais timing. Très mauvais timing. |
| `commentatrice_rate_money_time_03.mp3` | On ne perd pas ce point-là. Et pourtant. |
| `commentatrice_rate_money_time_04.mp3` | J'ai déjà vu cette erreur en finale de championnat du monde. |
| `commentatrice_le_break_01.mp3` | Voilà une option sérieuse sur la victoire. |
| `commentatrice_le_break_02.mp3` | Ce choix traduit probablement une volonté de contrôle. |
| `commentatrice_lecon_01.mp3` | Il joue à domicile, même quand il est à l'extérieur. |
| `commentatrice_lecon_01_f.mp3` | Elle joue à domicile, même quand elle est à l'extérieur. |
| `commentatrice_lecon_02.mp3` | On commence à avoir de la peine pour l'autre. |
| `commentatrice_prolongations_01.mp3` | Ils jouent les prolongations. J'espère qu'ils ont pris une collation. |
| `commentatrice_prolongations_02.mp3` | Deux points d'écart. Ça a l'air simple, dit comme ça. |
| `commentatrice_tout_a_refaire_01.mp3` | Deux pas en avant, deux pas en arrière. Ça s'appelle danser. |
| `commentatrice_tout_a_refaire_02.mp3` | Il avait de l'avance. Il l'a rendue. Avec les intérêts. |
| `commentatrice_tout_a_refaire_02_f.mp3` | Elle avait de l'avance. Elle l'a rendue. Avec les intérêts. |
| `commentatrice_faille_ratee_01.mp3` | Il a vu la faille, mais ça n'a pas souri. |
| `commentatrice_faille_ratee_01_f.mp3` | Elle a vu la faille, mais ça n'a pas souri. |
| `commentatrice_faille_ratee_02.mp3` | Son adversaire n'a pas mordu à l'hameçon. |
| `commentatrice_faille_ratee_03.mp3` | Bien pensé. Mal tombé. |
| `commentatrice_faille_ratee_04.mp3` | L'idée était bonne. L'adversaire, meilleur. |
| `commentatrice_divers_01.mp3` | Il a faux, et ça lui réussit. |
| `commentatrice_divers_01_f.mp3` | Elle a faux, et ça lui réussit. |
| `commentatrice_divers_02.mp3` | Le chi-fou-mi, c'est très simple et c'est très compliqué. |
| `commentatrice_divers_03.mp3` | Le public est connaisseur. Il applaudit au bon moment. |
| `commentatrice_divers_04.mp3` | J'ai vu des matchs plus spectaculaires. Mais rarement plus serrés. |
| `commentatrice_divers_05.mp3` | Les deux mains sont vraiment très concentrées. Leurs propriétaires aussi, j'espère. |
| `commentatrice_divers_06.mp3` | J'aurais personnellement joué différemment. |
| `commentatrice_premier_point_perdu_01.mp3` | L'ouverture de Kolodrov, 1956… mais ça ne lui sourit pas. |
| `commentatrice_premier_point_perdu_02.mp3` | Un mauvais départ. Il reste du temps. Heureusement. |
| `commentatrice_premier_point_perdu_03.mp3` | Ça commence mal. On a déjà vu pire. Rarement. |
| `commentatrice_premier_point_perdu_04.mp3` | Un peu de retard à l'allumage. |
| `commentatrice_premier_point_perdu_05.mp3` | Un point. Ce n'est rien. Sauf si ça continue. |
| `commentatrice_monique_porte_bonheur_01.mp3` | La Pierre. Elle ne bouge jamais. Comme mes convictions. |
| `commentatrice_monique_porte_bonheur_02.mp3` | Les Ciseaux. Parce qu'ils découpent les ambitions de l'adversaire. |
| `commentatrice_avant_seul_01.mp3` | Ce soir, il n'y aura qu'un vainqueur. Et probablement un mauvais perdant. |
| `commentatrice_avant_seul_02.mp3` | Deux joueurs, trois signes, un seul objectif : humilier son prochain. |
| `commentatrice_avant_seul_03.mp3` | Ce soir, on ne règle pas ses comptes. On les découpe. |
| `commentatrice_avant_seul_grand_01.mp3` | Match sous haute tension. Les deux adversaires ont beaucoup à perdre. On risque d'assister à une entame très crispée, les deux mains ne voulant pas être poussées à la faute. |
| `commentatrice_avant_seul_revanche_01.mp3` | Ils se connaissent par cœur. Malheureusement, ils se connaissent aussi les défauts. |
| `commentatrice_avant_seul_revanche_02.mp3` | Une vieille rivalité, quelques rancœurs, et trois signes pour régler tout ça. |
| `commentatrice_avant_seul_revanche_03.mp3` | Il paraît qu'ils ne s'apprécient guère. Heureusement, le chifoumi ne nécessite aucun dialogue. |
| `commentatrice_avant_seul_amis_01.mp3` | Il paraît qu'ils sont très bons amis. On va voir combien de temps cette amitié résiste à une défaite. |
| `commentatrice_avant_seul_amis_02.mp3` | Ils sont venus ensemble, ils repartiront ensemble… enfin, si le perdant accepte de suivre. |
| `commentatrice_avant_seul_amis_03.mp3` | Les meilleurs amis du monde. Jusqu'au moment où l'un des deux sort une pierre avec un sourire suspect. |
| `commentatrice_avant_seul_amis_04.mp3` | Ils se connaissent, ils s'apprécient, ils se respectent. Enfin, pour l'instant. |
| `commentatrice_avant_seul_amis_05.mp3` | Il y a des amitiés qui durent toute une vie. Et puis il y a celles qui se terminent sur un ciseau mal anticipé. |
| `commentatrice_smash_reussi_01.mp3` | Un smash. Et un adversaire en morceaux. |
| `commentatrice_smash_reussi_02.mp3` | Il a frappé fort. Pour une fois, il a frappé juste. |
| `commentatrice_smash_reussi_02_f.mp3` | Elle a frappé fort. Pour une fois, elle a frappé juste. |
| `commentatrice_smash_reussi_03.mp3` | Un point d'exclamation sur sa victoire. |
| `commentatrice_smash_reussi_04.mp3` | Retour à l'école pour son adversaire ! |
| `commentatrice_smash_reussi_05.mp3` | Il amuse la galerie. |
| `commentatrice_smash_reussi_05_f.mp3` | Elle amuse la galerie. |
| `commentatrice_smash_reussi_06.mp3` | Celui-là, c'était pour les photographes. |
| `commentatrice_smash_reussi_07.mp3` | Une feuille A4. Pliée en quatre, l'adversaire. |
| `commentatrice_smash_reussi_08.mp3` | La cisaille. Net et sans bavure. |
| `commentatrice_smash_reussi_09.mp3` | Un rocher. L'adversaire ne s'en relèvera pas tout de suite. |
| `commentatrice_smash_reussi_10.mp3` | Bon. Il a tapé comme une mule. |
| `commentatrice_smash_reussi_10_f.mp3` | Bon. Elle a tapé comme une mule. |
| `commentatrice_smash_reussi_11.mp3` | Il a eu la main lourde. Pour l'autre, surtout. |
| `commentatrice_smash_reussi_11_f.mp3` | Elle a eu la main lourde. Pour l'autre, surtout. |
| `commentatrice_smash_reussi_12.mp3` | Ça claque. Et ça compte. |
| `commentatrice_smash_reussi_13.mp3` | Il fallait le sortir. Il l'a sorti. |
| `commentatrice_smash_reussi_13_f.mp3` | Il fallait le sortir. Elle l'a sorti. |
| `commentatrice_smash_sonne_01.mp3` | Il voit des étoiles. Moi aussi, parfois. |
| `commentatrice_smash_sonne_01_f.mp3` | Elle voit des étoiles. Moi aussi, parfois. |
| `commentatrice_smash_sonne_02.mp3` | Comptez jusqu'à quatre. Il revient. |
| `commentatrice_smash_sonne_02_f.mp3` | Comptez jusqu'à quatre. Elle revient. |
| `commentatrice_smash_sonne_03.mp3` | Ça résonne encore dans ses doigts. |
| `commentatrice_smash_sonne_04.mp3` | Un smash comme ça, ça laisse des traces. Et des bleus. |
| `commentatrice_smash_rate_01.mp3` | Beaucoup d'élan. Peu de résultat. |
| `commentatrice_smash_rate_02.mp3` | Frapper fort, c'est bien. Frapper juste, c'est mieux. |
| `commentatrice_smash_rate_03.mp3` | Il a smashé dans le vide. Le vide a gagné. |
| `commentatrice_smash_rate_03_f.mp3` | Elle a smashé dans le vide. Le vide a gagné. |
| `commentatrice_smash_rate_04.mp3` | Il a frappé comme un sourd. Et visé comme un aveugle. |
| `commentatrice_smash_rate_04_f.mp3` | Elle a frappé comme une sourde. Et visé comme une aveugle. |
| `commentatrice_smash_rate_05.mp3` | Trop appuyé. |
| `commentatrice_smash_rate_06.mp3` | Ça manque un peu de percussion. |
| `commentatrice_smash_bloque_01.mp3` | Il a smashé dans un mur. Le mur ne s'est pas excusé. |
| `commentatrice_smash_bloque_01_f.mp3` | Elle a smashé dans un mur. Le mur ne s'est pas excusé. |
| `commentatrice_smash_bloque_02.mp3` | Tout ce bruit pour une égalité. |
| `commentatrice_smash_bloque_03.mp3` | Enfoncer la porte, c'était l'idée. La porte était blindée. |
| `commentatrice_smash_bloque_04.mp3` | Main de fer. Le smash s'est cassé les dents. |
| `commentatrice_smash_bloque_05.mp3` | Toute cette énergie pour une égalité. Quel gâchis. |
| `commentatrice_smash_double_01.mp3` | Deux smashs. Aucune finesse. Beaucoup de bruit. |
| `commentatrice_smash_double_02.mp3` | Deux marteaux, zéro clou. |
| `commentatrice_smash_double_03.mp3` | Tout en délicatesse. |
| `commentatrice_smash_double_04.mp3` | Deux smashs. Personne ne voulait être poli. |
| `commentatrice_smash_double_05.mp3` | Les deux mains ont la même inspiration, et se neutralisent. |
| `commentatrice_signe_abime_01.mp3` | Des Ciseaux ébréchés, ça ne coupe plus grand-chose. |
| `commentatrice_signe_abime_02.mp3` | Une Pierre fêlée, c'est déjà presque du gravier. |
| `commentatrice_signe_abime_03.mp3` | Une Feuille en lambeaux, ça n'enveloppe plus rien. |
| `commentatrice_signe_fetiche_01_pierre.mp3` | La Pierre lui réussit. Il aurait tort de s'en priver. Pour l'instant. |
| `commentatrice_signe_fetiche_01_pierre_f.mp3` | La Pierre lui réussit. Elle aurait tort de s'en priver. Pour l'instant. |
| `commentatrice_signe_fetiche_01_ciseaux.mp3` | Les Ciseaux lui réussissent. Il aurait tort de s'en priver. Pour l'instant. |
| `commentatrice_signe_fetiche_01_ciseaux_f.mp3` | Les Ciseaux lui réussissent. Elle aurait tort de s'en priver. Pour l'instant. |
| `commentatrice_signe_fetiche_01_feuille.mp3` | La Feuille lui réussit. Il aurait tort de s'en priver. Pour l'instant. |
| `commentatrice_signe_fetiche_01_feuille_f.mp3` | La Feuille lui réussit. Elle aurait tort de s'en priver. Pour l'instant. |
| `commentatrice_signe_fetiche_02_pierre.mp3` | Cinq points avec la Pierre. L'adversaire devrait peut-être s'en apercevoir. |
| `commentatrice_signe_fetiche_02_ciseaux.mp3` | Cinq points avec les Ciseaux. L'adversaire devrait peut-être s'en apercevoir. |
| `commentatrice_signe_fetiche_02_feuille.mp3` | Cinq points avec la Feuille. L'adversaire devrait peut-être s'en apercevoir. |
| `commentatrice_match_long_01.mp3` | On a commencé ce match en automne. Je crois qu'on est en hiver. |
| `commentatrice_match_long_02.mp3` | Ils ont dû oublier qu'il y a un vainqueur à la fin. |
| `commentatrice_match_long_03.mp3` | Je propose une pause. Personne ne m'écoute. |
| `commentatrice_david_mene_01.mp3` | Le classement, c'est sur le papier. Le papier ne joue pas. |
| `commentatrice_favori_mene_01.mp3` | Le favori fait son travail. Sans éclat, mais il le fait. |
| `commentatrice_david_gagne_01.mp3` | Un résultat qui va faire parler dans les vestiaires. |
| `commentatrice_main_en_feu_01.mp3` | Quelqu'un a un extincteur ? |
| `commentatrice_main_en_feu_02.mp3` | Attention, ça chauffe. Je recule ma chaise. |
| `commentatrice_feu_eteint_01.mp3` | Et le feu s'éteint. Il restera un peu de fumée. |
| `commentatrice_feu_eteint_02.mp3` | Et pschitt. Il ne reste que la fumée. |
| `commentatrice_feu_eteint_03.mp3` | Les flammes sont retombées. Les cendres, elles, restent. |
| `commentatrice_poignee_franche_01.mp3` | Une belle poignée de main, on sent un grand respect mutuel. |
| `commentatrice_poignee_franche_02.mp3` | Une poignée de main sincère. Ça se fait rare. |
| `commentatrice_poignee_contraste_01.mp3` | Un des deux avait envie de serrer. L'autre, non. |
| `commentatrice_poignee_contraste_02.mp3` | La chaleur humaine, à sens unique. |
| `commentatrice_poignee_contraste_03.mp3` | L'un serre, l'autre glisse. C'est toute une histoire. |
| `commentatrice_poignee_froide_01.mp3` | Ils ne partiront pas en vacances ensemble. |
| `commentatrice_poignee_froide_02.mp3` | Ils se serrent la main comme on signe un constat. |
| `commentatrice_poignee_legere_01.mp3` | Du bout des doigts. Le strict minimum. |
| `commentatrice_poignee_legere_02.mp3` | Effleurée. À peine. |
| `commentatrice_humain_01.mp3` | Ils se connaissent. Et ça se voit. |
| `commentatrice_humain_02.mp3` | Entre amis, il n'y a pas de pitié. |
| `commentatrice_humain_03.mp3` | Ils se connaissent. Les surprises seront rares. Ou nombreuses. |
| `commentatrice_humain_04.mp3` | Un duel entre amis. Les plus cruels. |
| `commentatrice_avant_coeur_01.mp3` | Il faut observer attentivement la posture des doigts. Tout commence là. |
| `commentatrice_avant_coeur_02.mp3` | Le premier lancer est souvent révélateur, mais rarement décisif. Patience. |
| `commentatrice_avant_coeur_03.mp3` | Dans ma carrière, j'ai appris à me méfier des joueurs trop confiants. On verra ce soir qui l'est trop. |
| `commentatrice_avant_coeur_04.mp3` | Le chifoumi est un sport mental avant d'être digital. Retenez bien ça. |
| `commentatrice_avant_coeur_05.mp3` | La précipitation est l'ennemie de la stratégie. On va voir qui l'a compris. |
| `commentatrice_avant_coeur_06.mp3` | Le premier signe donne souvent le ton. Pas toujours la fin. |
| `commentatrice_avant_coeur_07.mp3` | On croit que c'est le hasard. Ce n'est presque jamais le hasard. |
| `commentatrice_avant_coeur_08.mp3` | Il faudra rester froid. Le chifoumi punit les impatients. |
| `commentatrice_avant_coeur_09.mp3` | Regardez les poignets. Ils parlent avant les mains. |
| `commentatrice_avant_coeur_10.mp3` | Un match se gagne souvent sur trois ou quatre coups. Encore faut-il savoir lesquels. |
| `commentatrice_avant_coeur_11.mp3` | Celui qui garde le même signe trop longtemps finira par le payer. |
| `commentatrice_avant_coeur_12.mp3` | J'ai vu des favoris tomber pour moins que ça. Restons prudents. |
| `commentatrice_avant_coeur_13.mp3` | Le public est bruyant. Les meilleurs, eux, n'entendent rien. |
| `commentatrice_avant_coeur_14.mp3` | L'important, ce n'est pas de deviner. C'est de ne pas être deviné. |
| `commentatrice_avant_coeur_15.mp3` | Ce soir, on va surtout voir qui sait changer d'avis au bon moment. |
| `commentatrice_avant_lancement_01.mp3` | Bien. Assez parlé. Jouons. |
| `commentatrice_avant_lancement_02.mp3` | Bien. Voyons ce qu'ils ont dans le ventre. Et dans les mains. |
| `commentatrice_avant_lancement_03.mp3` | Silence. On joue. |
| `commentatrice_decale_m_01_pierre.mp3` | Roland, il a simplement fait une pierre. |
| `commentatrice_decale_m_01_pierre_f.mp3` | Roland, elle a simplement fait une pierre. |
| `commentatrice_decale_m_01_ciseaux.mp3` | Roland, il a simplement fait des ciseaux. |
| `commentatrice_decale_m_01_ciseaux_f.mp3` | Roland, elle a simplement fait des ciseaux. |
| `commentatrice_decale_m_01_feuille.mp3` | Roland, il a simplement fait une feuille. |
| `commentatrice_decale_m_01_feuille_f.mp3` | Roland, elle a simplement fait une feuille. |
| `commentatrice_decale_m_02_pierre.mp3` | C'était une pierre. |
| `commentatrice_decale_m_02_ciseaux.mp3` | C'étaient des ciseaux. |
| `commentatrice_decale_m_02_feuille.mp3` | C'était une feuille. |
| `commentatrice_replay_reussite_01.mp3` | C'est très finement joué : il a poussé son adversaire à la faute. |
| `commentatrice_replay_reussite_01_f.mp3` | C'est très finement joué : elle a poussé son adversaire à la faute. |
| `commentatrice_replay_reussite_02.mp3` | Un très beau geste technique, que peu maîtrisent aussi bien que lui. |
| `commentatrice_replay_reussite_02_f.mp3` | Un très beau geste technique, que peu maîtrisent aussi bien qu'elle. |
| `commentatrice_replay_reussite_03.mp3` | Peu auraient choisi de jouer ainsi, mais c'est bien le signe fort qui lui a donné le point. |
| `commentatrice_replay_reussite_04.mp3` | Bonne alternance sur deux signes avant de convertir la séquence. |
| `commentatrice_replay_reussite_05.mp3` | Une prime à l'audace sur cet enchaînement, qui a laissé son adversaire impuissant. |
| `commentatrice_replay_balle_ratee_01.mp3` | Une faute de main au plus mauvais moment, qui lui a coûté très cher. |
| `commentatrice_replay_balle_ratee_02.mp3` | Il n'a pas respecté le jeu, et l'adversaire n'a plus eu qu'à conclure dans un fauteuil. |
| `commentatrice_replay_balle_ratee_02_f.mp3` | Elle n'a pas respecté le jeu, et l'adversaire n'a plus eu qu'à conclure dans un fauteuil. |
| `commentatrice_replay_smash_signe_01.mp3` | La main adverse s'est détendue… et s'est fait hacher menu. |
| `commentatrice_replay_smash_signe_02.mp3` | Son adversaire avait anticipé une feuille, mais il a fini avec des ciseaux en piteux état. |
| `commentatrice_replay_smash_signe_03.mp3` | Ces enveloppements, toujours risqués, restent très impressionnants. |
| `commentatrice_replay_double_01.mp3` | Un fort engagement de part et d'autre, mais une main est restée au tapis. |
| `commentatrice_replay_generique_01.mp3` | On voit toute la concentration des deux joueurs. |
| `commentatrice_replay_generique_02.mp3` | À ce niveau, chaque point se mérite. |
| `commentatrice_replay_generique_03.mp3` | Une séquence intéressante, à revoir calmement. |
| `commentatrice_replay_perdant_set_01.mp3` | Il n'a pas démérité sur ce set, comme le montre ce point… mais ça n'a pas suffi pour le remporter. |
| `commentatrice_replay_perdant_set_01_f.mp3` | Elle n'a pas démérité sur ce set, comme le montre ce point… mais ça n'a pas suffi pour le remporter. |
| `commentatrice_replay_perdant_set_02.mp3` | Un beau point de sa part. Malheureusement pour lui, le set lui a échappé. |
| `commentatrice_replay_perdant_set_02_f.mp3` | Un beau point de sa part. Malheureusement pour elle, le set lui a échappé. |
| `commentatrice_replay_perdant_set_03.mp3` | Il a montré de belles choses. Il lui a juste manqué un petit quelque chose pour prendre ce set. |
| `commentatrice_replay_perdant_set_03_f.mp3` | Elle a montré de belles choses. Il lui a juste manqué un petit quelque chose pour prendre ce set. |
| `commentatrice_replay_perdant_match_01.mp3` | Il n'a pas démérité. Mais ça n'a pas suffi pour remporter le match. |
| `commentatrice_replay_perdant_match_01_f.mp3` | Elle n'a pas démérité. Mais ça n'a pas suffi pour remporter le match. |
| `commentatrice_replay_perdant_match_02.mp3` | Il a eu ses moments, comme celui-ci. Il lui a manqué un peu de réussite pour aller au bout. |
| `commentatrice_replay_perdant_match_02_f.mp3` | Elle a eu ses moments, comme celui-ci. Il lui a manqué un peu de réussite pour aller au bout. |
| `commentatrice_replay_perdant_match_03.mp3` | Une très belle action… qui n'a malheureusement pas suffi à faire basculer le match. |
| `commentatrice_replay_gagnant_set_01.mp3` | Il a été le plus solide dans ce set, et ce point le montre bien. |
| `commentatrice_replay_gagnant_set_01_f.mp3` | Elle a été la plus solide dans ce set, et ce point le montre bien. |
| `commentatrice_replay_gagnant_set_02.mp3` | Il a su faire la différence quand il le fallait. |
| `commentatrice_replay_gagnant_set_02_f.mp3` | Elle a su faire la différence quand il le fallait. |
| `commentatrice_replay_gagnant_match_01.mp3` | Ce point montre bien pourquoi il a remporté ce match. |
| `commentatrice_replay_gagnant_match_01_f.mp3` | Ce point montre bien pourquoi elle a remporté ce match. |
| `commentatrice_replay_gagnant_match_02.mp3` | Il a su faire la différence quand il le fallait. |
| `commentatrice_replay_gagnant_match_02_f.mp3` | Elle a su faire la différence quand il le fallait. |
| `commentatrice_replay_sit_serre_01.mp3` | Dans une fin de set aussi serrée, c'est ce genre de point qui a fait la différence. |
| `commentatrice_replay_sit_serre_02.mp3` | Il a pris l'ascendant au moment où tout se jouait. |
| `commentatrice_replay_sit_serre_02_f.mp3` | Elle a pris l'ascendant au moment où tout se jouait. |
| `commentatrice_replay_sit_serre_03.mp3` | Quand tout était serré, il a eu les nerfs les plus solides. |
| `commentatrice_replay_sit_serre_03_f.mp3` | Quand tout était serré, elle a eu les nerfs les plus solides. |
| `commentatrice_replay_sit_avance_01.mp3` | Avec une telle avance, il a pu jouer libéré. Et ça s'est vu. |
| `commentatrice_replay_sit_avance_01_f.mp3` | Avec une telle avance, elle a pu jouer libérée. Et ça s'est vu. |
| `commentatrice_replay_sit_avance_02.mp3` | Il a confirmé sa domination dans ce set. |
| `commentatrice_replay_sit_avance_02_f.mp3` | Elle a confirmé sa domination dans ce set. |
| `commentatrice_replay_sit_avance_03.mp3` | Pas de relâchement malgré l'avance. C'est la marque des grands. |
| `commentatrice_replay_sit_relance_01.mp3` | C'est ce point qui lui a permis de se relancer. Et il a pris l'ascendant. |
| `commentatrice_replay_sit_relance_01_f.mp3` | C'est ce point qui lui a permis de se relancer. Et elle a pris l'ascendant. |
| `commentatrice_replay_sit_relance_02.mp3` | Le début de la remontée. Son adversaire ne le savait pas encore. |
| `commentatrice_replay_sit_relance_03.mp3` | Il était dos au mur. Ce point a tout changé. |
| `commentatrice_replay_sit_relance_03_f.mp3` | Elle était dos au mur. Ce point a tout changé. |
| `commentatrice_replay_sit_mene_perd_01.mp3` | Il a réduit l'écart… mais le retard était trop important. |
| `commentatrice_replay_sit_mene_perd_01_f.mp3` | Elle a réduit l'écart… mais le retard était trop important. |
| `commentatrice_replay_sit_mene_perd_02.mp3` | Une belle réaction, qui n'a malheureusement pas suffi pour revenir. |
| `commentatrice_replay_sit_mene_perd_03.mp3` | Il a essayé de revenir. Il lui a manqué un peu de temps. |
| `commentatrice_replay_sit_mene_perd_03_f.mp3` | Elle a essayé de revenir. Il lui a manqué un peu de temps. |
| `commentatrice_replay_sit_bascule_01.mp3` | C'est ce point qui l'a fait passer devant pour de bon. |
| `commentatrice_replay_sit_bascule_02.mp3` | À partir de là, son adversaire a couru après le score. |
| `commentatrice_replay_sit_bascule_match_01.mp3` | Dans ce set décisif, c'est ce point qui l'a fait passer devant. Il n'a plus jamais été rejoint. |
| `commentatrice_replay_sit_bascule_match_01_f.mp3` | Dans ce set décisif, c'est ce point qui l'a fait passer devant. Elle n'a plus jamais été rejointe. |
| `commentatrice_replay_sit_bascule_match_02.mp3` | Tout le match s'est joué sur ce point. |
| `commentatrice_replay_sit_debut_01.mp3` | Un bon départ, ça l'a mis en confiance. |
| `commentatrice_replay_sit_debut_01_f.mp3` | Un bon départ, ça l'a mise en confiance. |
| `commentatrice_replay_sit_debut_02.mp3` | Il a posé les bases dès le début du set. |
| `commentatrice_replay_sit_debut_02_f.mp3` | Elle a posé les bases dès le début du set. |
| `commentatrice_replay_smash_perdant_set_01.mp3` | Malgré ce beau smash, ça n'a pas suffi à déstabiliser son adversaire, et il a perdu le set. |
| `commentatrice_replay_smash_perdant_set_01_f.mp3` | Malgré ce beau smash, ça n'a pas suffi à déstabiliser son adversaire, et elle a perdu le set. |
| `commentatrice_replay_smash_perdant_match_01.mp3` | Malgré ce beau smash, ça n'a pas suffi à déstabiliser son adversaire, et il a perdu le match. |
| `commentatrice_replay_smash_perdant_match_01_f.mp3` | Malgré ce beau smash, ça n'a pas suffi à déstabiliser son adversaire, et elle a perdu le match. |
| `commentatrice_replay_verdict_perdant_set_01.mp3` | Belle lecture de sa part… mais ça n'a pas suffi pour remporter le set. |
| `commentatrice_replay_verdict_perdant_set_02.mp3` | Il a cassé son habitude au bon moment… mais ça n'a pas suffi pour remporter le set. |
| `commentatrice_replay_verdict_perdant_set_02_f.mp3` | Elle a cassé son habitude au bon moment… mais ça n'a pas suffi pour remporter le set. |
| `commentatrice_replay_verdict_perdant_set_03.mp3` | Un très joli piège… mais ça n'a pas suffi pour remporter le set. |
| `commentatrice_replay_verdict_perdant_match_01.mp3` | Belle lecture de sa part… mais ça n'a pas suffi pour remporter le match. |
| `commentatrice_replay_verdict_perdant_match_02.mp3` | Il a cassé son habitude au bon moment… mais ça n'a pas suffi pour remporter le match. |
| `commentatrice_replay_verdict_perdant_match_02_f.mp3` | Elle a cassé son habitude au bon moment… mais ça n'a pas suffi pour remporter le match. |
| `commentatrice_replay_verdict_perdant_match_03.mp3` | Un très joli piège… mais ça n'a pas suffi pour remporter le match. |
| `commentatrice_fin_trois_sets_01.mp3` | Nous avons assisté à une belle rencontre, et les deux mains ont su se hisser à la hauteur de l'événement. Rendez-vous est pris pour une revanche qui s'annonce palpitante. |
| `commentatrice_fin_trois_sets_02.mp3` | L'arbitre siffle la fin de la rencontre sur cet ultime point. On peut se satisfaire du spectacle proposé par les deux mains, dans cette passe d'armes aux allures de chassé-croisé. |
| `commentatrice_accueil_point_perdu_01.mp3` | Un point pour Boomerang. Ce n'est rien : on apprend en perdant. |
| `commentatrice_accueil_egalite_01.mp3` | Même signe des deux côtés : on rejoue le coup. C'est la règle. |
| `commentatrice_accueil_lecture_01.mp3` | Un conseil : regardez ce que Boomerang vient de jouer. Quand il gagne, il recommence. |
| `commentatrice_accueil_reserve_01.mp3` | Attention au temps. Après huit secondes, on puise dans sa réserve. Et elle ne se remplit pas. |
| `commentatrice_stats_signe_habitude_01_pierre.mp3` | Beaucoup de Pierre dans ce match… Comme d'habitude. Ses adversaires finiront par le savoir. |
| `commentatrice_stats_signe_habitude_01_ciseaux.mp3` | Beaucoup de Ciseaux dans ce match… Comme d'habitude. Ses adversaires finiront par le savoir. |
| `commentatrice_stats_signe_habitude_01_feuille.mp3` | Beaucoup de Feuille dans ce match… Comme d'habitude. Ses adversaires finiront par le savoir. |
| `commentatrice_stats_signe_inhabituel_01_pierre.mp3` | Beaucoup de Pierre dans ce match, lui qui en joue si peu d'habitude. Un vrai changement de plan. |
| `commentatrice_stats_signe_inhabituel_01_pierre_f.mp3` | Beaucoup de Pierre dans ce match, elle qui en joue si peu d'habitude. Un vrai changement de plan. |
| `commentatrice_stats_signe_inhabituel_01_ciseaux.mp3` | Beaucoup de Ciseaux dans ce match, lui qui en joue si peu d'habitude. Un vrai changement de plan. |
| `commentatrice_stats_signe_inhabituel_01_ciseaux_f.mp3` | Beaucoup de Ciseaux dans ce match, elle qui en joue si peu d'habitude. Un vrai changement de plan. |
| `commentatrice_stats_signe_inhabituel_01_feuille.mp3` | Beaucoup de Feuille dans ce match, lui qui en joue si peu d'habitude. Un vrai changement de plan. |
| `commentatrice_stats_signe_inhabituel_01_feuille_f.mp3` | Beaucoup de Feuille dans ce match, elle qui en joue si peu d'habitude. Un vrai changement de plan. |
| `commentatrice_stats_signe_inconnu_01_pierre.mp3` | Il a beaucoup joué la Pierre dans ce match. Un choix de stratégie, ou un réflexe ? On le saura la prochaine fois. |
| `commentatrice_stats_signe_inconnu_01_pierre_f.mp3` | Elle a beaucoup joué la Pierre dans ce match. Un choix de stratégie, ou un réflexe ? On le saura la prochaine fois. |
| `commentatrice_stats_signe_inconnu_01_ciseaux.mp3` | Il a beaucoup joué les Ciseaux dans ce match. Un choix de stratégie, ou un réflexe ? On le saura la prochaine fois. |
| `commentatrice_stats_signe_inconnu_01_ciseaux_f.mp3` | Elle a beaucoup joué les Ciseaux dans ce match. Un choix de stratégie, ou un réflexe ? On le saura la prochaine fois. |
| `commentatrice_stats_signe_inconnu_01_feuille.mp3` | Il a beaucoup joué la Feuille dans ce match. Un choix de stratégie, ou un réflexe ? On le saura la prochaine fois. |
| `commentatrice_stats_signe_inconnu_01_feuille_f.mp3` | Elle a beaucoup joué la Feuille dans ce match. Un choix de stratégie, ou un réflexe ? On le saura la prochaine fois. |
| `commentatrice_stats_favori_oublie_01_pierre.mp3` | Lui qui adore la Pierre, il l'a presque oubliée dans ce match. Il a changé ses habitudes pour surprendre. |
| `commentatrice_stats_favori_oublie_01_pierre_f.mp3` | Elle qui adore la Pierre, elle l'a presque oubliée dans ce match. Elle a changé ses habitudes pour surprendre. |
| `commentatrice_stats_favori_oublie_01_ciseaux.mp3` | Lui qui adore les Ciseaux, il les a presque oubliés dans ce match. Il a changé ses habitudes pour surprendre. |
| `commentatrice_stats_favori_oublie_01_ciseaux_f.mp3` | Elle qui adore les Ciseaux, elle les a presque oubliés dans ce match. Elle a changé ses habitudes pour surprendre. |
| `commentatrice_stats_favori_oublie_01_feuille.mp3` | Lui qui adore la Feuille, il l'a presque oubliée dans ce match. Il a changé ses habitudes pour surprendre. |
| `commentatrice_stats_favori_oublie_01_feuille_f.mp3` | Elle qui adore la Feuille, elle l'a presque oubliée dans ce match. Elle a changé ses habitudes pour surprendre. |
| `commentatrice_stats_equilibre_inhabituel_01.mp3` | D'habitude, il a son signe préféré. Cette fois, il a tout mélangé. Impossible à lire. |
| `commentatrice_stats_equilibre_inhabituel_01_f.mp3` | D'habitude, elle a son signe préféré. Cette fois, elle a tout mélangé. Impossible à lire. |
| `commentatrice_stats_equilibre_01.mp3` | Dans ce match, il a parfaitement équilibré ses trois signes. Impossible à lire. |
| `commentatrice_stats_equilibre_01_f.mp3` | Dans ce match, elle a parfaitement équilibré ses trois signes. Impossible à lire. |
| `commentatrice_stats_plus_imprevisible_01.mp3` | Dans ce match, il a été bien plus difficile à lire que d'habitude. Ça s'est vu au score. |
| `commentatrice_stats_plus_imprevisible_01_f.mp3` | Dans ce match, elle a été bien plus difficile à lire que d'habitude. Ça s'est vu au score. |
| `commentatrice_stats_plus_lisible_01.mp3` | Lui d'habitude si imprévisible, il a été très lisible dans ce match. |
| `commentatrice_stats_plus_lisible_01_f.mp3` | Elle d'habitude si imprévisible, elle a été très lisible dans ce match. |
| `commentatrice_stats_reussite_01.mp3` | Dans ce match, quand il n'y avait pas égalité, il gagnait presque à chaque fois. Remarquable. |
| `commentatrice_stats_reussite_01_f.mp3` | Dans ce match, quand il n'y avait pas égalité, elle gagnait presque à chaque fois. Remarquable. |
| `commentatrice_stats_change_egalite_01.mp3` | Dans ce match, après chaque égalité, il a changé de signe. Une stratégie… ou une habitude qui se lit ? |
| `commentatrice_stats_change_egalite_01_f.mp3` | Dans ce match, après chaque égalité, elle a changé de signe. Une stratégie… ou une habitude qui se lit ? |
| `commentatrice_stats_apres_egalite_01.mp3` | C'est lui qui sortait gagnant des duels d'esprits, dans ce match. Les égalités lui ont souri. |
| `commentatrice_stats_apres_egalite_01_f.mp3` | C'est elle qui sortait gagnante des duels d'esprits, dans ce match. Les égalités lui ont souri. |
| `commentatrice_stats_egalites_01.mp3` | Beaucoup d'égalités dans ce match. Deux joueurs qui ont pensé pareil du début à la fin. |
| `commentatrice_stats_insiste_01.mp3` | Dans ce match, quand ça marchait, il insistait. Son adversaire ne l'a pas vu venir. Ou trop tard. |
| `commentatrice_stats_insiste_01_f.mp3` | Dans ce match, quand ça marchait, elle insistait. Son adversaire ne l'a pas vu venir. Ou trop tard. |
| `commentatrice_stats_smashs_01.mp3` | Ses smashs ont pesé lourd dans ce match. Bien choisis, bien placés. |
| `commentatrice_stats_balles_converties_01.mp3` | Dans ce match, les balles importantes, il les a toutes converties. C'est la marque des grands. |
| `commentatrice_stats_balles_converties_01_f.mp3` | Dans ce match, les balles importantes, elle les a toutes converties. C'est la marque des grandes. |
| `commentatrice_stats_balles_gachees_01.mp3` | Des balles de set, il en a eu dans ce match. Il en a laissé filer beaucoup trop. |
| `commentatrice_stats_balles_gachees_01_f.mp3` | Des balles de set, elle en a eu dans ce match. Elle en a laissé filer beaucoup trop. |
| `commentatrice_stats_serie_01.mp3` | La série de points de ce match a tout changé. Après ça, il n'y avait plus qu'un joueur. |
| `commentatrice_stats_serie_01_f.mp3` | La série de points de ce match a tout changé. Après ça, il n'y avait plus qu'une joueuse. |
| `commentatrice_stats_serre_01.mp3` | Si peu de points d'écart au total dans ce match. Il aurait pu basculer de l'autre côté. |
| `commentatrice_stats_domination_01.mp3` | Les chiffres de ce match sont sans appel. Il n'y a pas eu de match. |
| `commentatrice_stats_rien_01.mp3` | Des chiffres sans surprise pour ce match. Un duel honnête, de bout en bout. |
| `commentatrice_stats_insaisissable_01.mp3` | Dans ce match, il a été insaisissable. Jamais deux fois le même signe, ou presque. |
| `commentatrice_stats_insaisissable_01_f.mp3` | Dans ce match, elle a été insaisissable. Jamais deux fois le même signe, ou presque. |
| `commentatrice_stats_insaisissable_02.mp3` | Il a changé de signe sans arrêt dans ce match. Son adversaire a couru après lui toute la partie. |
| `commentatrice_stats_insaisissable_02_f.mp3` | Elle a changé de signe sans arrêt dans ce match. Son adversaire a couru après elle toute la partie. |
| `commentatrice_stats_entete_01_pierre.mp3` | Dans ce match, il s'est entêté. La Pierre, encore et encore, quitte à se faire lire. |
| `commentatrice_stats_entete_01_pierre_f.mp3` | Dans ce match, elle s'est entêtée. La Pierre, encore et encore, quitte à se faire lire. |
| `commentatrice_stats_entete_01_ciseaux.mp3` | Dans ce match, il s'est entêté. Les Ciseaux, encore et encore, quitte à se faire lire. |
| `commentatrice_stats_entete_01_ciseaux_f.mp3` | Dans ce match, elle s'est entêtée. Les Ciseaux, encore et encore, quitte à se faire lire. |
| `commentatrice_stats_entete_01_feuille.mp3` | Dans ce match, il s'est entêté. La Feuille, encore et encore, quitte à se faire lire. |
| `commentatrice_stats_entete_01_feuille_f.mp3` | Dans ce match, elle s'est entêtée. La Feuille, encore et encore, quitte à se faire lire. |
| `commentatrice_stats_entete_02.mp3` | Il a joué le même signe quatre, cinq fois d'affilée dans ce match. Du courage… ou de l'obstination. |
| `commentatrice_stats_entete_02_f.mp3` | Elle a joué le même signe quatre, cinq fois d'affilée dans ce match. Du courage… ou de l'obstination. |
| `commentatrice_stats_change_perte_01.mp3` | Dans ce match, après chaque point perdu, il a changé de signe. Un réflexe que son adversaire aurait pu exploiter. |
| `commentatrice_stats_change_perte_01_f.mp3` | Dans ce match, après chaque point perdu, elle a changé de signe. Un réflexe que son adversaire aurait pu exploiter. |
| `commentatrice_stats_garde_perte_01.mp3` | Même après un point perdu, il gardait son signe dans ce match. Têtu, mais cohérent. |
| `commentatrice_stats_garde_perte_01_f.mp3` | Même après un point perdu, elle gardait son signe dans ce match. Têtue, mais cohérente. |
| `commentatrice_stats_lecture_01.mp3` | Dans ce match, il a lu son adversaire comme un livre ouvert. Les habitudes de l'autre, il les a toutes punies. |
| `commentatrice_stats_lecture_01_f.mp3` | Dans ce match, elle a lu son adversaire comme un livre ouvert. Les habitudes de l'autre, elle les a toutes punies. |
| `commentatrice_stats_adv_contre_01_pierre.mp3` | Son adversaire a beaucoup joué la Pierre dans ce match. Lui l'a vu, et l'a puni. |
| `commentatrice_stats_adv_contre_01_pierre_f.mp3` | Son adversaire a beaucoup joué la Pierre dans ce match. Elle l'a vu, et l'a puni. |
| `commentatrice_stats_adv_contre_01_ciseaux.mp3` | Son adversaire a beaucoup joué les Ciseaux dans ce match. Lui l'a vu, et l'a puni. |
| `commentatrice_stats_adv_contre_01_ciseaux_f.mp3` | Son adversaire a beaucoup joué les Ciseaux dans ce match. Elle l'a vu, et l'a puni. |
| `commentatrice_stats_adv_contre_01_feuille.mp3` | Son adversaire a beaucoup joué la Feuille dans ce match. Lui l'a vu, et l'a puni. |
| `commentatrice_stats_adv_contre_01_feuille_f.mp3` | Son adversaire a beaucoup joué la Feuille dans ce match. Elle l'a vu, et l'a puni. |
| `commentatrice_stats_adv_ignore_01_pierre.mp3` | Son adversaire a joué la Pierre encore et encore dans ce match. Et lui ne l'a jamais vraiment contrée. |
| `commentatrice_stats_adv_ignore_01_pierre_f.mp3` | Son adversaire a joué la Pierre encore et encore dans ce match. Et elle ne l'a jamais vraiment contrée. |
| `commentatrice_stats_adv_ignore_01_ciseaux.mp3` | Son adversaire a joué les Ciseaux encore et encore dans ce match. Et lui ne les a jamais vraiment contrés. |
| `commentatrice_stats_adv_ignore_01_ciseaux_f.mp3` | Son adversaire a joué les Ciseaux encore et encore dans ce match. Et elle ne les a jamais vraiment contrés. |
| `commentatrice_stats_adv_ignore_01_feuille.mp3` | Son adversaire a joué la Feuille encore et encore dans ce match. Et lui ne l'a jamais vraiment contrée. |
| `commentatrice_stats_adv_ignore_01_feuille_f.mp3` | Son adversaire a joué la Feuille encore et encore dans ce match. Et elle ne l'a jamais vraiment contrée. |
| `commentatrice_stats_meme_favori_01.mp3` | Dans ce match, ils avaient le même signe préféré. Forcément, beaucoup d'égalités. |
| `commentatrice_stats_styles_01.mp3` | Deux styles opposés dans ce match : un joueur insaisissable, l'autre très lisible. Ça s'est vu au score. |
| `commentatrice_stats_remontee_01.mp3` | Dans ce match, il est revenu de loin. Mené de plusieurs points, il n'a jamais lâché. |
| `commentatrice_stats_remontee_01_f.mp3` | Dans ce match, elle est revenue de loin. Menée de plusieurs points, elle n'a jamais lâché. |
| `commentatrice_stats_fins_serrees_01.mp3` | Dans ce match, c'est dans les fins de set serrées qu'il a fait la différence. Les nerfs, ça ne s'apprend pas. |
| `commentatrice_stats_fins_serrees_01_f.mp3` | Dans ce match, c'est dans les fins de set serrées qu'elle a fait la différence. Les nerfs, ça ne s'apprend pas. |
| `commentatrice_stats_sans_smash_01.mp3` | Pas un seul smash dans ce match. Prudent. Peut-être trop. |
| `commentatrice_stats_smashs_rates_01.mp3` | Dans ce match, ses smashs sont tombés à côté. L'audace, ça se paie aussi. |
| `commentatrice_stats_depart_01.mp3` | Il est entré dans ce match plus vite que son adversaire. Les premiers points ont donné le ton. |
| `commentatrice_stats_depart_01_f.mp3` | Elle est entrée dans ce match plus vite que son adversaire. Les premiers points ont donné le ton. |
| `commentatrice_stats_reflechi_01.mp3` | Dans ce match, il a pris son temps. Beaucoup de réflexion, parfois trop. |
| `commentatrice_stats_reflechi_01_f.mp3` | Dans ce match, elle a pris son temps. Beaucoup de réflexion, parfois trop. |
| `commentatrice_stats_vite_01.mp3` | Il a joué vite dans ce match. Très vite. Ça a mis la pression sur son adversaire. |
| `commentatrice_stats_vite_01_f.mp3` | Elle a joué vite dans ce match. Très vite. Ça a mis la pression sur son adversaire. |
| `commentatrice_stats_favori_souffre_01.mp3` | Favori sur le papier, il a beaucoup souffert dans ce match. Les classements ne jouent pas. |
| `commentatrice_stats_favori_souffre_01_f.mp3` | Favorite sur le papier, elle a beaucoup souffert dans ce match. Les classements ne jouent pas. |
| `commentatrice_dialogue_perso_chiromancien_avant_01.mp3` | J'ai caché mes mains. On ne sait jamais. |
| `commentatrice_dialogue_perso_chiromancien_avant_02.mp3` | Je crois surtout à ses statistiques. |
| `commentatrice_dialogue_avant_debutant_01.mp3` | On sera indulgents. Pendant trois coups. |
| `commentatrice_dialogue_avant_debutant_02.mp3` | Il y a toujours une première fois. Espérons qu'elle ne soit pas la dernière. |
| `commentatrice_dialogue_avant_debutant_03.mp3` | Les mains tremblent un peu. C'est normal. Les miennes aussi, en 1981. |
| `commentatrice_dialogue_avant_monique_01.mp3` | Je ne mettais mon gant qu'à la dernière seconde. Pour que l'adversaire ne sache pas de quelle main je jouais. |
| `commentatrice_dialogue_avant_monique_02.mp3` | Rien. Un champion joue le ventre vide et l'esprit plein. Enfin, c'est ce qu'on disait à mon époque. |
| `commentatrice_dialogue_avant_monique_03.mp3` | La Feuille. Elle couvre tout. Même mes erreurs de jeunesse. |
| `commentatrice_dialogue_avant_monique_04.mp3` | Jamais. Sauf avant les petits. Les grands, on sait pourquoi on les perd. |
| `commentatrice_dialogue_avant_monique_05.mp3` | Au piano. Trois gammes, deux arpèges, et une Pierre pour finir. |
| `commentatrice_dialogue_avant_monique_06.mp3` | Respirer. Et ne pas commencer par la Pierre. Tout le monde commence par la Pierre. |
| `commentatrice_dialogue_avant_monique_07.mp3` | La patience. Et une bonne mémoire. Surtout celle des erreurs des autres. |
| `commentatrice_dialogue_avant_monique_08.mp3` | Dans les yeux, non. Dans les mains, oui. Les yeux mentent, les poignets jamais. |
| `commentatrice_dialogue_avant_monique_09.mp3` | Le hasard, c'est le nom qu'on donne à ce qu'on n'a pas su lire. |
| `commentatrice_dialogue_avant_monique_10.mp3` | Je sens surtout le courant d'air, Roland. Quelqu'un a laissé la porte ouverte. |
| `commentatrice_dialogue_avant_monique_11.mp3` | J'ai vu. J'ai entendu, surtout. Votre micro est trop fort, Roland. |
| `commentatrice_dialogue_avant_monique_12.mp3` | L'un des deux va gagner. Je prends peu de risques, c'est ce qui a fait ma carrière. |
| `commentatrice_dialogue_avant_monique_13.mp3` | Je regardais les autres jouer. Et je prenais des notes. |
| `commentatrice_dialogue_avant_monique_14.mp3` | Non, jamais. Je me suis battue moi-même, en sa présence. |
| `commentatrice_dialogue_avant_monique_15.mp3` | Ne pas avoir de secret. Sinon, tout le monde le connaît. |
| `commentatrice_dialogue_avant_monique_16.mp3` | Qu'il y a trois signes, et que c'est déjà beaucoup. |
| `commentatrice_dialogue_avant_monique_17.mp3` | Les règles, non. Les commentateurs, oui. Ils parlent plus fort. |
| `commentatrice_dialogue_avant_monique_18.mp3` | Tous les jours. Pour savoir qui fait la vaisselle. |
| `commentatrice_dialogue_avant_monique_19.mp3` | Jamais deux fois la même chaise. Ça vous étonne ? |
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
| `commentatrice_dialogue_premiere_egalite_01.mp3` | Et pas la dernière, à mon avis. |
| `commentatrice_dialogue_premiere_egalite_02.mp3` | Ils ont dû réviser ensemble. |
| `commentatrice_dialogue_changement_01.mp3` | Oui. Dégagement très propre. |
| `commentatrice_dialogue_changement_02.mp3` | L'audace, à petites doses. |
| `commentatrice_dialogue_balle_de_match_01.mp3` | Enfin… de la victoire du jour. Restons mesurés. |
| `commentatrice_dialogue_balle_de_match_02.mp3` | Je retiens mon souffle. Ça ne se voit pas, mais je le retiens. |
| `commentatrice_dialogue_avant_bot_01.mp3` | La machine a l'air plus détendue. |
| `commentatrice_dialogue_avant_bot_02.mp3` | Le bot ne transpire pas. C'est déjà un avantage. |
| `commentatrice_dialogue_memoire_meme_ouverture_01.mp3` | Ou quel manque d'imagination. On saura à la fin du match. |
| `commentatrice_dialogue_memoire_revanche_01.mp3` | Ils ont dû la préparer toute la semaine. |
| `commentatrice_dialogue_memoire_habitues_01.mp3` | Ils se méfient, surtout. |
| `commentatrice_dialogue_memoire_marquant_01.mp3` | On en reparle à la fin de celui-ci. |
| `commentatrice_dialogue_avant_finale_01.mp3` | J'avais entendu la première fois. |
| `commentatrice_dialogue_avant_finale_02.mp3` | Et la plus cruelle. Il n'y a qu'un gagnant. |
| `commentatrice_dialogue_avant_revanche_01.mp3` | Oui. Et ils ne s'aiment pas beaucoup. |
| `commentatrice_dialogue_avant_revanche_02.mp3` | Et la rancune. Un peu. |
| `commentatrice_dialogue_avant_nuit_01.mp3` | Moi si. Normalement. |
| `commentatrice_dialogue_avant_nuit_02.mp3` | Le chifoumi n'a pas d'heure. |
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
| `commentatrice_dialogue_apres_entrainement_defaite_03.mp3` | Justement. C'est là qu'on apprend à perdre sans témoins. |
| `commentatrice_dialogue_apres_entrainement_defaite_04.mp3` | Non. Mais ça se voit. |
| `commentatrice_dialogue_apres_entrainement_defaite_05.mp3` | Le bot ne dort pas, ne mange pas et ne doute jamais. C'est injuste, mais c'est comme ça. |
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
| `commentatrice_dialogue_apres_tournoi_premiers_defaite_05.mp3` | Au moins, il aura sa soirée de libre. |
| `commentatrice_dialogue_apres_tournoi_premiers_defaite_05_f.mp3` | Au moins, elle aura sa soirée de libre. |
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
| `commentatrice_dialogue_apres_tournoi_quarts_defaite_05.mp3` | Un quart, c'est déjà un quart de gloire. |
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
| `commentatrice_dialogue_apres_tournoi_demis_defaite_05.mp3` | Si près de la finale. On s'en souviendra. Lui surtout. |
| `commentatrice_dialogue_apres_tournoi_demis_defaite_05_f.mp3` | Si près de la finale. On s'en souviendra. Elle surtout. |
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
| `commentatrice_dialogue_apres_tournoi_finale_defaite_05.mp3` | On ne perd pas une finale. On la laisse à l'autre. C'est plus élégant. |
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
| `commentatrice_dialogue_fin_set_05.mp3` | Qu'il est fini. C'est déjà beaucoup. |
| `commentatrice_dialogue_fin_set_06.mp3` | Rare, je ne sais pas. Intense, sûrement. |
| `commentatrice_dialogue_fin_set_07.mp3` | Tant que le match n'est pas fini, tout le monde peut revenir. Même vous. |
| `commentatrice_dialogue_fin_set_08.mp3` | Le score. C'est déjà pas mal. |
| `commentatrice_dialogue_set_decisif_01.mp3` | Un set pour ce soir. Ce sera déjà bien. |
| `commentatrice_dialogue_titre_01.mp3` | Pas d'enflammade. Pas d'enflammade. |
| `commentatrice_dialogue_titre_02.mp3` | Je sais, Roland. J'étais là. |
| `commentatrice_dialogue_titre_03.mp3` | Oui. Et maintenant, le plus dur commence : le garder. |
| `commentatrice_dialogue_fin_match_01.mp3` | Si. Un peu quand même. |
| `commentatrice_dialogue_fin_match_02.mp3` | Un combat. Perdu. Mais un combat. |
| `commentatrice_dialogue_fin_match_03.mp3` | Il peut sortir. C'est déjà ça. |
| `commentatrice_dialogue_fin_match_03_f.mp3` | Elle peut sortir. C'est déjà ça. |
| `commentatrice_dialogue_fin_match_04.mp3` | Toutes les défaites font mal. Certaines font aussi réfléchir. |
| `commentatrice_dialogue_fin_match_05.mp3` | Ou pareil. Mais avec de l'expérience. |
| `commentatrice_dialogue_fin_match_06.mp3` | Courage. Et du repos. |
| `commentatrice_dialogue_fin_match_07.mp3` | Il a perdu, Roland. |
| `commentatrice_dialogue_fin_match_07_f.mp3` | Elle a perdu, Roland. |
| `commentatrice_dialogue_cri_01.mp3` | On l'avait entendu. |
| `commentatrice_dialogue_cri_02.mp3` | Attention que ça ne vous arrive pas. |
| `commentatrice_dialogue_cri_03.mp3` | La prochaine fois, prévoyez les boules Quies. |
| `commentatrice_dialogue_cri_04.mp3` | C'est Ronaldo sans les abdos. |
| `commentatrice_dialogue_cri_05.mp3` | On l'a entendu jusqu'au parking. |
| `commentatrice_dialogue_cri_06.mp3` | Qu'il en profite, ça ne durera pas. |
| `commentatrice_dialogue_cri_06_f.mp3` | Qu'elle en profite, ça ne durera pas. |
| `commentatrice_dialogue_titans_01.mp3` | Ils jouent depuis deux minutes, Roland. |
| `commentatrice_dialogue_resultat_surprise_01.mp3` | Un résultat statistiquement possible. |
| `commentatrice_dialogue_resultat_favori_01.mp3` | La hiérarchie est respectée. |
| `commentatrice_dialogue_resultat_grosse_defaite_01.mp3` | Une faillite technique. |
| `commentatrice_dialogue_resultat_serre_01.mp3` | Le niveau est relativement équilibré. |
| `commentatrice_dialogue_resultat_serie_victoires_01.mp3` | Attention à l'excès de confiance. |
| `commentatrice_dialogue_resultat_serie_defaites_01.mp3` | Il serait peut-être temps de travailler les fondamentaux. |
| `commentatrice_dialogue_replay_moment_01.mp3` | Absolument. Ce coup a pesé lourd dans la suite de la manche. |
| `commentatrice_dialogue_replay_moment_02.mp3` | Un geste parfaitement exécuté, au moment où il le fallait. |
| `commentatrice_dialogue_replay_moment_03.mp3` | Oui, ce point a clairement changé la dynamique du set. |
| `commentatrice_dialogue_replay_moment_04.mp3` | Une séquence qui mérite effectivement d'être revue. |
| `commentatrice_dialogue_replay_moment_05.mp3` | Son adversaire ne s'en est visiblement pas remis. |
| `commentatrice_dialogue_replay_moment_06.mp3` | Une prise de risque parfaitement récompensée. |
| `commentatrice_dialogue_replay_moment_07.mp3` | En tout cas, l'un des plus importants. |
| `commentatrice_dialogue_replay_moment_08.mp3` | Il y a beaucoup à apprendre de cette séquence. |
| `commentatrice_dialogue_temps_forts_intro_01.mp3` | Trois séquences qui résument parfaitement les enjeux de ce match. |
| `commentatrice_dialogue_temps_forts_intro_02.mp3` | Et certaines images méritent effectivement toute notre attention. |
| `commentatrice_dialogue_temps_forts_intro_03.mp3` | Avec notamment un tournant qui a pesé très lourd dans la balance. |
| `commentatrice_dialogue_tf_premier_01.mp3` | Une action déterminante. Il a immédiatement pris l'ascendant psychologique. |
| `commentatrice_dialogue_tf_premier_01_f.mp3` | Une action déterminante. Elle a immédiatement pris l'ascendant psychologique. |
| `commentatrice_dialogue_tf_deuxieme_01.mp3` | Une exécution remarquable. C'est exactement ce qu'on attend d'un joueur de ce niveau. |
| `commentatrice_dialogue_tf_balle_01.mp3` | Très bien négociée. Il a su garder son sang-froid au moment décisif. |
| `commentatrice_dialogue_tf_balle_01_f.mp3` | Très bien négociée. Elle a su garder son sang-froid au moment décisif. |
| `commentatrice_dialogue_tf_cher_01.mp3` | Une erreur d'appréciation qui n'a malheureusement pas été sans conséquence. |
| `commentatrice_dialogue_tf_defense_01.mp3` | Il a fait preuve d'une belle résistance, mais cela n'a pas suffi. |
| `commentatrice_dialogue_tf_defense_01_f.mp3` | Elle a fait preuve d'une belle résistance, mais cela n'a pas suffi. |
| `commentatrice_dialogue_tf_tournant_01.mp3` | On voit très bien ici le changement d'attitude des deux joueurs. |
| `commentatrice_dialogue_temps_forts_fin_01.mp3` | Une rencontre qui aura offert quelques belles leçons de chifoumi. |
| `commentatrice_dialogue_temps_forts_fin_02.mp3` | Et maintenant, place à la prochaine confrontation. |
| `commentatrice_dialogue_temps_forts_fin_trois_01.mp3` | Roland, ils ont joué trois manches de pierre-feuille-ciseaux. |
| `commentatrice_dialogue_accueil_bienvenue_01.mp3` | Bienvenue. Les règles sont simples : Pierre bat Ciseaux, Ciseaux bat Feuille, Feuille bat Pierre. |
| `commentatrice_dialogue_accueil_bienvenue_02.mp3` | Huit secondes pour choisir un signe. Le premier à sept points, avec deux points d'écart, remporte le set. |
| `commentatrice_dialogue_accueil_bienvenue_03.mp3` | Boomerang a ses petites habitudes. Regardez l'historique en bas de l'écran. |
| `commentatrice_dialogue_accueil_victoire_01.mp3` | Bien joué. Le prochain adversaire sera moins gentil. Revenez quand même. |
| `commentatrice_dialogue_accueil_victoire_02.mp3` | Un bon début. Un deuxième match, et la Partie rapide s'ouvre. |
| `commentatrice_dialogue_accueil_defaite_01.mp3` | Tout le monde perd contre Boomerang la première fois. Enfin, presque. On recommence ? |
| `commentatrice_dialogue_accueil_defaite_02.mp3` | Maintenant, vous connaissez ses habitudes. Profitez-en. |
| `commentatrice_dialogue_accueil_deuxieme_01.mp3` | Cette fois, regardez bien l'historique. C'est là que tout se joue. |
| `commentatrice_dialogue_accueil_troisieme_01.mp3` | Encore une victoire ou une défaite, et la boutique vous ouvre ses portes. |
| `commentatrice_dialogue_accueil_fin_troisieme_01.mp3` | Vous voilà joueur à part entière. Bienvenue au club. |
| `commentatrice_dialogue_accueil_fin_troisieme_01_f.mp3` | Vous voilà joueuse à part entière. Bienvenue au club. |

## Speaker — voix de salle, voyelles étirées (79 répliques)

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

## Sons du court (8 sons)

Fabriqués par le code en attendant. Un vrai enregistrement portant ce nom les remplace.

| Fichier | Son |
|---|---|
| `public_point_01.mp3` | Applaudissements courts, après chaque point |
| `public_clameur_01.mp3` | Clameur et applaudissements nourris (balle sauvée, remontée…) |
| `public_set_01.mp3` | Applaudissements de fin de set |
| `public_ovation_01.mp3` | Ovation de fin de match |
| `public_fond_01.mp3` | undefined |
| `public_fond_calme_01.mp3` | undefined |
| `public_fond_nerveux_01.mp3` | undefined |
| `public_fond_bouillant_01.mp3` | undefined |
| `public_tension_01.mp3` | undefined |
| `public_ooh_01.mp3` | undefined |
| `stade_sifflet_01.mp3` | undefined |
| `public_huees_01.mp3` | undefined |
| `public_huees_02.mp3` | undefined |
| `public_bronca_01.mp3` | undefined |
| `public_bronca_02.mp3` | undefined |
| `public_applaudissements_faibles_01.mp3` | Applaudissements faibles du grand stade (un point ordinaire) |
| `public_applaudissements_forts_01.mp3` | Applaudissements forts du grand stade (point arraché, smash, fin de set) |
| `public_ooh_02.mp3` | « Ooh » de surprise du grand stade (point disputé) |
