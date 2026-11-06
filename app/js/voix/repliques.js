// Les répliques des voix (texte validé : docs/script-v2-brouillon.md, version 6).
//
// Chaque entrée : { r, t, f?, clin?, si?, signe? }
//   r     : qui parle — "c" le commentateur, "d" la commentatrice
//   t     : le texte ; ou un tableau de 3 textes, un par signe [Pierre, Ciseaux, Feuille] (ordre de regles.js)
//   f     : la version quand le joueur dont on parle est une joueuse (même forme que t)
//   clin  : "sport" ou "cine" — clin d'œil, tiré plus rarement
//   si    : condition — "onze_zero", "serie6", "trois_zero", "cinq_egalites", "balle_match", "balle_contre", "un_partout", "finale"
//   quand : "set" ou "match" — dit seulement sur une balle de set, ou seulement sur une balle de match
//   seul  : jeu de mots sur un signe — dit seulement si le joueur vient de jouer ce signe (0 Pierre, 1 Ciseaux, 2 Feuille)
//   signe : pour les textes par signe, le signe de qui — "moi" (défaut) ou "adv"
//
// Le moteur (annonces.js) choisit la réplique ; script.js en fait des fichiers audio nommés
// qui_moment_NN (+ _pierre / _ciseaux / _feuille pour les signes, + _f pour la version au féminin).

// ---------------------------------------------------------------- les moments du match
export const MOMENTS = {
  craquage: [
    { r: "c", t: "Il est en train de craquer sous la pression !", f: "Elle est en train de craquer sous la pression !" },
    { r: "c", t: "Il avait le set au bout des doigts… et il l'a laissé filer !", f: "Elle avait le set au bout des doigts… et elle l'a laissé filer !", quand: "set" },
    { r: "c", t: "Chute à l'avant ! Il avait le set en poche !", f: "Chute à l'avant ! Elle avait le set en poche !", clin: "sport", quand: "set" },
    { r: "c", t: "Coiffé sur le poteau !", f: "Coiffée sur le poteau !", clin: "sport" },
    { r: "c", t: "Il enfourche la dernière porte !", f: "Elle enfourche la dernière porte !", clin: "sport" },
    { r: "c", t: "J'ai glissé, chef !", clin: "cine" },
    { r: "d", t: "Oh… la main a tremblé." },
    { r: "d", t: "Elle était là, cette balle. Juste là." },
    { r: "d", t: "La tête a dit Pierre. Le cœur a dit Feuille. Le cœur a tort, en général." },
    { r: "d", t: "Quand l'enjeu monte, la lucidité s'en va. Chez certains." },
    { r: "d", t: "Quel mental de chips.", clin: "sport" },
    { r: "d", t: "Il a vu la ligne d'arrivée. Et il a freiné. Fascinant.", f: "Elle a vu la ligne d'arrivée. Et elle a freiné. Fascinant." },
    { r: "d", t: "Il ne faut jamais vendre la Feuille avant de l'avoir jouée." },
    { r: "c", t: "Il avait le match au bout des doigts… et il l'a laissé filer !", f: "Elle avait le match au bout des doigts… et elle l'a laissé filer !", quand: "match" },
    { r: "c", t: "Chute à l'avant ! Il avait le match en poche !", f: "Chute à l'avant ! Elle avait le match en poche !", clin: "sport", quand: "match" },
    { r: "c", t: "Oh non, pas ça ! Pas aujourd'hui ! Pas comme ça ! Pas après tout ce que tu as fait…", quand: "match" },
    // (banque de commentaires du porteur du projet, branchée le 1er novembre : docs/repliques-banque-brouillon.md)
    { r: "c", t: "Attaque audacieuse… et riposte de maître !", clin: "sport" },
    { r: "c", t: "Erreur tactique ! Il a perdu la main !", f: "Erreur tactique ! Elle a perdu la main !", clin: "sport" },
    { r: "d", t: "L'estocade ? Non : cueilli sur la riposte.", f: "L'estocade ? Non : cueillie sur la riposte.", clin: "sport" },
  ],
  // Une balle de match sauvée, ou le point qui donne le titre : la main entre dans la légende.
  main_legendaire: [
    { r: "c", t: "La main du siècle !" },
    { r: "c", t: "Une main pour l'histoire !" },
    { r: "c", t: "La main du destin !" },
    { r: "c", t: "Une main qui entre dans la légende !" },
    { r: "c", t: "Arrêtez tout ! Nous venons d'assister à un moment d'histoire !" },
    { r: "c", t: "On pourra parler de cette main pendant des années !" },
    { r: "c", t: "Mesdames et mesdames… quelle main !" },
    { r: "c", t: "Dans cinquante ans, on racontera encore cette main !" },
    { r: "d", t: "Je note l'heure. Pour les archives." },
    { r: "d", t: "Dinguerie ! Comme disent les jeunes." },
    { r: "d", t: "C'est un vrai banger. Comme disent les jeunes." },
  ],
  balle_sauvee: [
    { r: "c", t: "Sauvée ! Quel sang-froid !" },
    { r: "c", t: "Pas aujourd'hui ! Pas comme ça ! Pas après tout ce que tu as fait…", retiree: true },   // déplacée : balle de match ratée (craquage)
    { r: "c", t: "Il refuse de mourir ! Encore en vie ! Toujours en vie !", f: "Elle refuse de mourir ! Encore en vie ! Toujours en vie !" },
    { r: "c", t: ["Sauvé par le gong ! Enfin… par la Pierre !", "Sauvé par le gong ! Enfin… par les Ciseaux !", "Sauvé par le gong ! Enfin… par la Feuille !"],
      f: ["Sauvée par le gong ! Enfin… par la Pierre !", "Sauvée par le gong ! Enfin… par les Ciseaux !", "Sauvée par le gong ! Enfin… par la Feuille !"], clin: "sport" },
    { r: "c", t: "Il était dans les cordes, et il en sort !", f: "Elle était dans les cordes, et elle en sort !", clin: "sport" },
    { r: "c", t: ["Parade réflexe ! Il a vu la Pierre arriver !", "Parade réflexe ! Il a vu les Ciseaux arriver !", "Parade réflexe ! Il a vu la Feuille arriver !"],
      f: ["Parade réflexe ! Elle a vu la Pierre arriver !", "Parade réflexe ! Elle a vu les Ciseaux arriver !", "Parade réflexe ! Elle a vu la Feuille arriver !"], clin: "sport", signe: "adv" },
    { r: "d", t: "Glacial. Absolument glacial. J'approuve." },
    { r: "d", t: "Tout le monde la voyait perdue. Sauf lui. C'est touchant.", f: "Tout le monde la voyait perdue. Sauf elle. C'est touchant." },
    { r: "d", t: "Des nerfs d'acier. Ou aucune conscience du danger. On ne saura jamais." },
    { r: "c", t: "Madame, vous n'auriez pas fait mieux ! Enfin… sauf en 1997 !" },
    { r: "c", t: "Vous ne passerez pas !", clin: "cine" },
    // (banque de commentaires du porteur du projet, branchée le 1er novembre : docs/repliques-banque-brouillon.md)
    { r: "c", t: "Une riposte fulgurante, aucune chance pour son adversaire !", clin: "sport" },
  ],
  remontee: [
    { r: "c", t: "Quelle remontée extraordinaire !" },
    { r: "c", t: "On l'avait enterré un peu trop vite !", f: "On l'avait enterrée un peu trop vite !" },
    { r: "c", t: "Le vent a tourné, mesdames et mesdames !" },
    { r: "c", t: "De l'enfer au paradis en quelques coups !" },
    { r: "c", t: "La cabane est tombée sur le chien !", clin: "sport" },
    { r: "c", t: "Il a fait l'élastique, et le revoilà dans la roue !", f: "Elle a fait l'élastique, et la revoilà dans la roue !", clin: "sport" },
    { r: "c", t: "C'est dingue ! C'est dingue !" },
    { r: "d", t: "Personne n'y croyait. Lui, si. C'est bien le seul.", f: "Personne n'y croyait. Elle, si. C'est bien la seule." },
    { r: "d", t: "Ne jamais enterrer un joueur de Pierre. Jamais.", f: "Ne jamais enterrer une joueuse de Pierre. Jamais." },
    { r: "d", t: "Son adversaire a avalé la trompette.", clin: "sport" },
    { r: "d", t: "Un match n'est jamais fini. Surtout quand on joue mal." },
    { r: "d", t: "C'est abracadabrantesque.", clin: "cine" },
    // (banque de commentaires du porteur du projet, branchée le 1er novembre : docs/repliques-banque-brouillon.md)
    { r: "c", t: "Il était au fond du trou, le revoilà à la surface !", f: "Elle était au fond du trou, la revoilà à la surface !" },
    { r: "c", t: "Magnifique remontada !" },
    { r: "c", t: "Encore un point ! Le doute change de camp !" },
    // (5 novembre, répliques du porteur du projet)
    { r: "c", t: "Il est revenu du diable Vauvert !", f: "Elle est revenue du diable Vauvert !" },
    { r: "c", t: "Il revient de nulle part !", f: "Elle revient de nulle part !" },
    { r: "c", t: "Nous assistons à une véritable remontada !" },
    { r: "c", t: "C'est un retour d'entre les morts !" },
  ],
  serie_pour: [
    { r: "c", t: "Plus rien ne l'arrête !" },
    { r: "c", t: "Quatre à la suite !", si: "pile4" },
    { r: "c", t: "Ça déroule, ça déroule !" },
    { r: "c", t: "Il a mis une mine, ça explose derrière !", f: "Elle a mis une mine, ça explose derrière !", clin: "sport" },
    { r: "c", t: "C'est du Pierre-Feuille-Ciseaux champagne !", clin: "sport" },
    { r: "c", t: "Vers l'infini et au-delà !", clin: "cine", retiree: true },
    { r: "c", t: "Cours, Forrest, cours !", clin: "cine", si: "serie6" },
    { r: "d", t: "Il a trouvé la faille. Il appuie dessus. Enfin quelqu'un de sérieux.", f: "Elle a trouvé la faille. Elle appuie dessus. Enfin quelqu'un de sérieux." },
    { r: "d", t: "Il gagne dans un fauteuil.", f: "Elle gagne dans un fauteuil.", clin: "sport" },
    { r: "d", t: "Une démonstration. Je note." },
    { r: "c", t: "Il marche sur son adversaire !", f: "Elle marche sur son adversaire !", long: 5 },
    { r: "c", t: "Qui va réussir à l'arrêter ?" },
    { r: "c", t: "La main est chaude ! Très chaude !" },
    { r: "d", t: "Il ne joue plus. Il distribue des corrections.", f: "Elle ne joue plus. Elle distribue des corrections." },
    { r: "d", t: "Six points d'affilée. Ça devient indécent.", si: "serie6" },
    // (banque de commentaires du porteur du projet, branchée le 1er novembre : docs/repliques-banque-brouillon.md)
    { r: "c", t: "Il est lancé !", f: "Elle est lancée !", long: 3 },
    { r: "c", t: "Il est en train de prendre le contrôle de ce match !", f: "Elle est en train de prendre le contrôle de ce match !", long: 3 },
    { r: "c", t: "Rien ne semble pouvoir l'arrêter !", long: 4 },
    { r: "c", t: "Il commence sérieusement à donner une leçon !", f: "Elle commence sérieusement à donner une leçon !", long: 4 },
    { r: "d", t: "Il lui fait la musique.", f: "Elle lui fait la musique.", long: 4 },
    { r: "c", t: "C'est un récital !", long: 5 },
    { r: "c", t: "Mais qui va pouvoir l'arrêter ?!", long: 6 },
    { r: "c", t: "Il est en état de grâce !", f: "Elle est en état de grâce !", long: 6 },
    { r: "c", t: "C'est une démonstration !", long: 7 },
    { r: "c", t: "Il est en train de ridiculiser son adversaire !", f: "Elle est en train de ridiculiser son adversaire !", long: 7 },
    { r: "c", t: "C'est le Mozart du chifoumi !", long: 8 },
    { r: "c", t: "Ce n'est plus un match, c'est une légende !", long: 8 },
    // (5 novembre, répliques du porteur du projet)
    { r: "c", t: "Il est en feu !", f: "Elle est en feu !", long: 3 },
    { r: "c", t: "Il martyrise son adversaire !", f: "Elle martyrise son adversaire !", long: 3 },
    { r: "c", t: "Il est en train de produire son effort !", f: "Elle est en train de produire son effort !", long: 3 },
    { r: "c", t: "Il est en jambes !", f: "Elle est en jambes !", long: 3 },
    { r: "c", t: "Il est en train de nous faire un sacré numéro !", f: "Elle est en train de nous faire un sacré numéro !", long: 3 },
    { r: "c", t: "Il creuse l'écart !", f: "Elle creuse l'écart !", long: 3 },
    { r: "c", t: "Il dicte le tempo !", f: "Elle dicte le tempo !", long: 3 },
  ],
  serie_contre: [
    { r: "c", t: "Quelqu'un peut arrêter ça ?!" },
    { r: "c", t: "Il est dans les cordes ! Il faut réagir !", f: "Elle est dans les cordes ! Il faut réagir !", clin: "sport" },
    { r: "c", t: "Allez, petit bonhomme !", f: "Allez, petite bonne femme !", retiree: true },   // (retirée le 5 novembre)
    { r: "c", t: "Oublie que t'as aucune chance, vas-y, fonce !!", clin: "cine", retiree: true },   // (retirée le 5 novembre)
    { r: "d", t: "Ça commence à ressembler à une correction." },
    { r: "d", t: "Muscle ton jeu, Robert. Muscle ton jeu.", clin: "sport" },
    { r: "d", t: "Jusqu'ici, tout va bien… jusqu'ici.", clin: "cine" },
    { r: "d", t: "Sur un malentendu, ça peut marcher.", clin: "cine" },
    { r: "d", t: "Sa maison brûle, et il regarde ailleurs.", f: "Sa maison brûle, et elle regarde ailleurs.", clin: "cine" },
    { r: "d", t: "Il faudrait peut-être arrêter pour aujourd'hui." },
    { r: "d", t: "Son adversaire connaît maintenant son jeu par cœur." },
    { r: "d", t: "Une série noire. Absolument magnifique." },
    { r: "d", t: "Il faudrait peut-être essayer… autre chose." },
    { r: "d", t: "Fidèle à lui-même : toujours du mauvais côté.", f: "Fidèle à elle-même : toujours du mauvais côté." },
    { r: "d", t: "Les calculs sont pas bons, Kevin.", clin: "cine" },
    { r: "c", t: "T'es pas venu ici pour souffrir, ok ?", f: "T'es pas venue ici pour souffrir, ok ?", clin: "cine" },
    { r: "c", t: "Houston, on a un problème !", clin: "cine", retiree: true },
    { r: "d", t: "Il est en PLS. Comme disent les jeunes.", f: "Elle est en PLS. Comme disent les jeunes." },
    // (banque de commentaires du porteur du projet, branchée le 1er novembre : docs/repliques-banque-brouillon.md)
    { r: "c", t: "Il est en train de perdre le fil !", f: "Elle est en train de perdre le fil !", long: 3 },
    { r: "d", t: "Le doute commence sérieusement à s'installer.", long: 3 },
    { r: "c", t: "Attention, il se fait acculer !", f: "Attention, elle se fait acculer !", long: 4 },
    { r: "c", t: "Ça tourne au cauchemar !", long: 5 },
    { r: "c", t: "Il n'y arrive plus !", f: "Elle n'y arrive plus !", long: 5 },
    { r: "d", t: "La main ferme. Le cerveau en bouillie.", long: 5 },
    { r: "c", t: "Arrêtez le massacre !", long: 6 },
    { r: "d", t: "Il va falloir appeler du renfort.", long: 6 },
    { r: "c", t: "C'est une boucherie !", long: 7 },
    { r: "d", t: "Ce n'est plus un match, c'est une exécution.", long: 7 },
    { r: "c", t: "Appelez les secours, il ne répond plus !", f: "Appelez les secours, elle ne répond plus !", long: 8 },
    // (5 novembre, répliques du porteur du projet)
    { r: "c", t: "Il pédale avec les oreilles !", f: "Elle pédale avec les oreilles !", long: 3 },
    { r: "c", t: "C'est terrible !", long: 3 },
    { r: "c", t: "C'est un long chemin de croix !", long: 3 },
    { r: "c", t: "Le calvaire se poursuit !", long: 3 },
    { r: "c", t: "Il est à la peine !", f: "Elle est à la peine !", long: 3 },
    { r: "d", t: "Il doit avoir le moral dans les chaussettes.", f: "Elle doit avoir le moral dans les chaussettes.", long: 3 },
    { r: "d", t: "Il tend le bâton pour se faire battre.", f: "Elle tend le bâton pour se faire battre.", long: 3 },
    { r: "c", t: "Et un vieux ciseau rouillé pour finir : attention au tétanos !", long: 3, seul: 1 },
    { r: "d", t: "Ciseaux mal affûtés, échec assuré.", long: 3, seul: 1 },
  ],
  obstination: [
    { r: "c", t: ["Troisième Pierre d'affilée ! C'est audacieux !", "Troisièmes Ciseaux d'affilée ! C'est audacieux !", "Troisième Feuille d'affilée ! C'est audacieux !"] },
    { r: "c", t: "Soit c'est du génie, soit c'est de l'entêtement !" },
    { r: "c", t: ["Sa Pierre… son précieux…", "Ses Ciseaux… son précieux…", "Sa Feuille… son précieux…"], clin: "cine" },
    { r: "d", t: ["Encore Pierre. C'est de la provocation.", "Encore Ciseaux. C'est de la provocation.", "Encore Feuille. C'est de la provocation."] },
    { r: "d", t: "Culot ou manque d'imagination ? Je penche pour l'imagination." },
    { r: "d", t: ["Il gare le bus devant sa Pierre.", "Il gare le bus devant ses Ciseaux.", "Il gare le bus devant sa Feuille."],
      f: ["Elle gare le bus devant sa Pierre.", "Elle gare le bus devant ses Ciseaux.", "Elle gare le bus devant sa Feuille."], clin: "sport" },
    { r: "d", t: ["La Pierre, ça ose tout. C'est même à ça qu'on la reconnaît.", "Les Ciseaux, ça ose tout. C'est même à ça qu'on les reconnaît.", "La Feuille, ça ose tout. C'est même à ça qu'on la reconnaît."], clin: "cine" },
    { r: "d", t: ["C'est une bonne situation, ça, Pierre ?", "C'est une bonne situation, ça, Ciseaux ?", "C'est une bonne situation, ça, Feuille ?"], clin: "cine" },
    { r: "d", t: "Le Mur de Clermont aurait approuvé. Moi, non." },
    { r: "d", t: "C'est de la poudre de perlimpinpin.", clin: "cine" },
    { r: "c", t: "Tous les chemins mènent à la Pierre !", seul: 0 },
    { r: "d", t: "Quand on veut, on peut. Quand on peut, on choisit Pierre, apparemment.", seul: 0 },
    { r: "d", t: "Mieux vaut une Feuille en main que deux Ciseaux dans le pot. C'est sa philosophie.", seul: 2 },
    { r: "c", t: ["Des pierres, des pierres, des pierres, des pierres, des pierres !", "Ciseaux, ciseaux, ciseaux, ciseaux, ciseaux !", "Des feuilles, des feuilles, des feuilles, des feuilles, des feuilles !"], clin: "cine" },
    { r: "d", t: "Allô ? Non mais allô, quoi !", clin: "cine" },
  ],
  // Il change enfin de signe après une obstination.
  changement: [
    { r: "c", t: "Le changement, c'est maintenant !", clin: "cine" },
    { r: "c", t: "Il change enfin de signe !", f: "Elle change enfin de signe !" },
    { r: "c", t: "Magnifique dégagement !" },
    { r: "d", t: "Il a changé. Il était temps.", f: "Elle a changé. Il était temps." },
    { r: "d", t: "Une autre idée. Enfin." },
    // (5 novembre, répliques du porteur du projet)
    { r: "c", t: "Il renverse complètement le jeu !", f: "Elle renverse complètement le jeu !" },
    { r: "c", t: ["Belle transition vers la Pierre !", "Belle transition vers les Ciseaux !", "Belle transition vers la Feuille !"] },
  ],
  duel_esprits: [
    { r: "c", t: "Ils se lisent dans les pensées !" },
    { r: "c", t: "Télépathie sur le court !", retiree: true },
    { r: "c", t: "Surplace sur la piste ! Personne ne veut lancer le sprint !", clin: "sport" },
    { r: "c", t: "Coude à coude ! Impossible de les séparer !", clin: "sport" },
    { r: "c", t: "Cinq égalités ! On n'avait pas vu ça depuis le schisme de la Feuille !", si: "cinq_egalites" },
    { r: "d", t: "Deux esprits. Une seule idée. Jamais la bonne." },
    { r: "d", t: "On pourrait rester là toute la nuit. Je préférerais éviter." },
    { r: "d", t: "Une partie d'échecs à trois pièces. Sans les échecs." },
    { r: "d", t: "À ce niveau, l'égalité, c'est de la politesse.", retiree: true },
    { r: "d", t: ["Il n'a pas le monopole de la Pierre.", "Il n'a pas le monopole des Ciseaux.", "Il n'a pas le monopole de la Feuille."],
      f: ["Elle n'a pas le monopole de la Pierre.", "Elle n'a pas le monopole des Ciseaux.", "Elle n'a pas le monopole de la Feuille."], clin: "cine" },
    { r: "d", t: "Laissez du temps au temps.", clin: "cine", retiree: true },   // (retirée le 2 novembre, à la demande du porteur du projet)
    { r: "d", t: "Ennuyeux." },
    { r: "c", t: "Deux mains, zéro vainqueur !" },
    { r: "c", t: "Égalité ! Les cerveaux sont connectés !" },
    { r: "c", t: "Ils se regardent… et ils recommencent !" },
    { r: "c", t: "Égalité parfaite ! La tension monte !" },
    { r: "d", t: "Ils ont exactement la même idée. Inquiétant." },
    { r: "d", t: "Personne ne veut prendre de risque aujourd'hui." },
    { r: "d", t: "Encore la même chose. Ça sent le duel interminable." },
    // (banque de commentaires du porteur du projet, branchée le 1er novembre : docs/repliques-banque-brouillon.md)
    { r: "c", t: "Ils se rendent coup pour coup !" },
    { r: "c", t: "Une nouvelle égalité sur le central !" },
    { r: "c", t: "Ils se regardent, ils se jaugent… Qui va craquer ?" },
    { r: "d", t: "Même signe. Une prolongation que personne n'a demandée." },
    { r: "d", t: ["Deux Pierres, égalité. Trois semaines d'étude pour ça…", "Deux Ciseaux, égalité. Trois semaines d'étude pour ça…", "Deux Feuilles, égalité. Trois semaines d'étude pour ça…"] },
    // (5 novembre, répliques du porteur du projet)
    { r: "c", t: "Les adversaires se jaugent !" },
    { r: "c", t: "Ils se regardent en chiens de faïence !" },
    { r: "c", t: "On assiste à une rencontre très fermée !" },
    { r: "c", t: "Une véritable partie de poker menteur !" },
    { r: "c", t: "Il y a du KO dans l'air !" },
    { r: "d", t: "Les supporters s'impatientent." },
  ],
  // L'adversaire a lu mon réflexe.
  lecture_subie: [
    { r: "d", t: "Lu comme un livre ouvert." },
    { r: "d", t: "Trop prévisible." },
    { r: "d", t: "Ses tics sont en train de le trahir.", f: "Ses tics sont en train de la trahir." },
    { r: "d", t: "C'était écrit. En gros caractères." },
    // (banque de commentaires du porteur du projet, branchée le 1er novembre : docs/repliques-banque-brouillon.md)
    { r: "d", t: "Défense sicilienne, un classique. Mais ça ne lui réussit pas.", clin: "sport" },
    { r: "d", t: "Trois coups d'avance. Sauf celui de l'adversaire.", clin: "sport" },
    { r: "d", t: "Il avait tout anticipé. Sauf ça.", f: "Elle avait tout anticipé. Sauf ça." },
    { r: "d", t: "C'était téléphoné. Mais il était en mode avion.", f: "C'était téléphoné. Mais elle était en mode avion.", clin: "sport" },
    { r: "d", t: "Il veut lire le jeu adverse. Qu'il commence par le sien.", f: "Elle veut lire le jeu adverse. Qu'elle commence par le sien.", clin: "sport" },
    { r: "c", t: "Le bluff du siècle ! L'autre n'a pas cillé !", clin: "sport" },
  ],
  // J'ai lu le réflexe de l'adversaire.
  lecture_reussie: [
    { r: "c", t: "Il l'attendait ! Il l'attendait !", f: "Elle l'attendait ! Elle l'attendait !" },
    // (retirées le 28 octobre, énervantes à l'usage : « Pleine lucarne ! », « Second poteau » avec la Pierre et les Ciseaux ;
    // « Second poteau, la Feuille ! » reste, mais très rare)
    { r: "c", t: "Pleine lucarne !", clin: "sport", retiree: true },
    { r: "c", t: ["Second poteau, la Pierre !", "Second poteau, les Ciseaux !", "Second poteau, la Feuille !"], clin: "sport", seul: 2, rare: 0.08 },
    { r: "c", t: "Il vous a compris !", f: "Elle vous a compris !", clin: "cine" },
    { r: "c", t: "Il est entré dans son cerveau !", f: "Elle est entrée dans son cerveau !", si: "serie4" },   // seulement après 4 points d'affilée ou plus
    { r: "d", t: "Coup de maître.", clin: "sport", rare: true },
    // (banque de commentaires du porteur du projet, branchée le 1er novembre : docs/repliques-banque-brouillon.md)
    { r: "d", t: "Bien vu l'aveugle.", clin: "sport" },
    // (4 novembre, réplique du porteur du projet)
    { r: "c", t: "Il l'attendait dans le zig, il lui a mis dans le zag !", f: "Il l'attendait dans le zig, elle lui a mis dans le zag !" },
  ],
  temps_ecoule: [
    { r: "c", t: "Il a oublié de jouer !", f: "Elle a oublié de jouer !" },
    { r: "c", t: "Calé sur la grille de départ !", f: "Calée sur la grille de départ !", clin: "sport" },
    { r: "c", t: "Faux départ… enfin, pas de départ du tout !", clin: "sport" },
    { r: "d", t: "Le chrono ne pardonne pas. Moi non plus." },
    { r: "d", t: "Trop de réflexion tue la réflexion." },
    { r: "d", t: "Jouer au hasard, c'est avouer qu'on n'a plus de plan.", retiree: true },   // (retirée le 28 octobre : plus de coup au hasard)
    { r: "d", t: "L'affaire du chronomètre. On n'en parle pas." },
    { r: "d", t: "Le ridicule ne tue pas. Heureusement pour lui.", f: "Le ridicule ne tue pas. Heureusement pour elle.", si: "balle_match" },
  ],
  // Balle de match (dite à voix basse, avant le point).
  tension: [
    { r: "c", t: "Silence dans la salle…" },
    { r: "c", t: "Tout un match… pour un seul signe." },
    { r: "d", t: "C'est maintenant que les champions se révèlent. Et les autres aussi." },
    { r: "d", t: "Pas de Pierre ici. Tout le monde attend la Pierre." },
    { r: "d", t: "Pas d'enflammade, pas d'enflammade.", clin: "sport" },
    { r: "c", t: "Le côté jaune a peur.", clin: "cine", si: "balle_contre" },
    { r: "c", t: "Un point pour l'Éternité…", si: "enjeu" },
    { r: "c", t: "Le titre est au bout de ce point…", si: "finale_tournoi" },
    { r: "d", t: "Toute une carrière pour ce point. Aucune pression.", si: "enjeu" },
    // (banque de commentaires du porteur du projet, branchée le 1er novembre : docs/repliques-banque-brouillon.md)
    { r: "c", t: "C'est irrespirable !" },
    { r: "d", t: "Il a la victoire au bout des doigts. Littéralement.", f: "Elle a la victoire au bout des doigts. Littéralement.", si: "balle_pour" },
  ],
  point_decisif: [
    { r: "c", t: "Un point. Un seul. Pour tout !" },
    { r: "d", t: "Ici, pas de deuxième chance. Comme dans la vie." },
    { r: "c", t: "Un point pour entrer dans l'Histoire !", si: "enjeu" },
  ],
  // Temps morts : fin de set, fin de match.
  set_ecrasant: [
    { r: "c", t: "Une leçon ! Une démonstration de force !" },
    { r: "c", t: "Au tapis ! L'arbitre peut compter jusqu'à dix !", clin: "sport" },
    { r: "c", t: "Fanny ! Onze à zéro, il va falloir embrasser Fanny !", clin: "sport", si: "onze_zero" },
    { r: "d", t: "Sèche correction." },
    { r: "d", t: "Il n'y a pas eu de match dans ce set." },
    { r: "d", t: "Il aurait dû rester au vestiaire." },
    { r: "d", t: "Vous êtes le maillon faible. Au revoir !", clin: "cine", retiree: true },   // (déplacée en fin de match, « defaite », le 3 novembre)
    { r: "d", t: "Un set à oublier. Je l'ai déjà oublié." },
    { r: "d", t: "Qu'on m'apporte un café. Et un autre match." },
    { r: "d", t: "Bref. Il a perdu le set.", f: "Bref. Elle a perdu le set.", clin: "cine" },
    // (banque de commentaires du porteur du projet, branchée le 1er novembre : docs/repliques-banque-brouillon.md)
    { r: "d", t: "Un set vite expédié, pas de chichifoumi.", net: true },
    { r: "d", t: "Le coup du berger. Plié en quelques coups.", net: true },
  ],
  set_couteau: [
    { r: "c", t: "Irrespirable !" },
    { r: "c", t: "Quel set, mesdames et messieurs !" },
    { r: "c", t: "Photo-finish ! Il faut la photo pour les départager !", clin: "sport" },
    { r: "c", t: "Arrivée au sprint, et ça passe d'un boyau !", clin: "sport" },
    { r: "d", t: "Arraché. Mérité, on en reparlera." },
    { r: "d", t: "Il fallait des nerfs solides pour conclure celui-là. Il y en avait. Juste assez." },
    { r: "d", t: "Personne ne méritait de le perdre. L'un des deux l'a quand même perdu." },
    { r: "d", t: "La goutte d'eau qui fait déborder la Feuille." },
  ],
  resume_set: [
    { r: "c", t: "Set bouclé, et quelle bataille !" },
    { r: "c", t: "Un set maîtrisé de bout en bout !" },
    { r: "c", t: "Un set partout, tout se jouera maintenant !", si: "un_partout" },
    { r: "c", t: "Le public retient son souffle avant la suite !" },
    { r: "d", t: "L'un a pris les commandes. À l'autre de réagir. S'il sait comment." },
    { r: "d", t: "Il faudra changer de plan. Ou en avoir un." },
    { r: "d", t: "Le rapport de force est clair. Pour l'instant." },
    // (5 novembre, répliques du porteur du projet)
    { r: "c", t: "Attention, je crois qu'il s'est foulé le poignet… non, rien de grave a priori.", f: "Attention, je crois qu'elle s'est foulé le poignet… non, rien de grave a priori.", rare: "true" },
    { r: "d", t: "Il revient bien depuis la tendinite qui l'a éloigné du central pendant plusieurs mois.", f: "Elle revient bien depuis la tendinite qui l'a éloignée du central pendant plusieurs mois.", rare: "true" },
  ],
  set_decisif: [
    { r: "c", t: "Set décisif ! Tout se joue maintenant !" },
    { r: "d", t: "Les statistiques ne servent plus à rien. C'est le caractère qui parle. Quand il y en a." },
    { r: "c", t: "C'est la der des ders !" },
    { r: "c", t: "Set décisif, et une place dans l'Histoire en jeu !", si: "enjeu" },
    { r: "d", t: "Un set pour un titre. Je reste calme. Pour deux.", si: "finale_tournoi" },
    { r: "d", t: "Winter is coming.", clin: "cine" },
  ],
  renversement: [
    { r: "c", t: "Mené un set à zéro, il renverse tout !", f: "Menée un set à zéro, elle renverse tout !" },
    { r: "c", t: "Le retour du siècle !" },
    { r: "c", t: "Il était dans les cordes, c'est l'autre qui finit au tapis !", f: "Elle était dans les cordes, c'est l'autre qui finit au tapis !", clin: "sport" },
    { r: "c", t: "Tête-à-queue complet dans ce match !", clin: "sport" },
    { r: "d", t: "Il a perdu une bataille. Il gagne la guerre. Classique.", f: "Elle a perdu une bataille. Elle gagne la guerre. Classique." },
    { r: "c", t: "C'est la remontada !", clin: "sport" },
  ],
  balle_match_convertie: [
    { r: "c", t: ["Pieeeeerre ! Pierre ! Pierre !", "Ciseaaaaux ! Ciseaux ! Ciseaux !", "Feuiiiiille ! Feuille ! Feuille !"], clin: "sport", retiree: true },   // (retirée le 5 novembre)
    { r: "c", t: "Il franchit la ligne les bras levés !", f: "Elle franchit la ligne les bras levés !", clin: "sport" },
    { r: "c", t: "Après avoir vu ça, on peut dormir tranquille !", clin: "sport" },
    { r: "d", t: "Échec et mat.", clin: "sport" },
    { r: "d", t: "Hasta la vista, baby.", clin: "cine" },
    { r: "d", t: "C'est tout." },
    { r: "c", t: "Et un, et deux, et trois sets à zéro !", clin: "sport", si: "trois_zero" },
    { r: "c", t: "Une victoire gravée dans la Pierre !", seul: 0 },
    { r: "c", t: "Un coup de Pierre, un coup de maître !", seul: 0 },
    { r: "c", t: "Pierre de taille, victoire de taille !", seul: 0 },
    { r: "c", t: "Il a jeté la Pierre… et elle a fait mouche !", f: "Elle a jeté la Pierre… et elle a fait mouche !", seul: 0 },
    { r: "c", t: "C'est du solide !", seul: 0 },
    { r: "d", t: "La Pierre a parlé. Elle n'a demandé l'avis de personne.", seul: 0 },
    { r: "d", t: "La Pierre angulaire de la victoire. Évidemment.", seul: 0 },
    { r: "d", t: "On ne fait pas d'omelette sans casser des Ciseaux.", seul: 0 },
    { r: "c", t: "Il a tourné la page de son adversaire !", f: "Elle a tourné la page de son adversaire !", seul: 2 },
    { r: "c", t: "Il a écrit l'histoire… sur une belle Feuille !", f: "Elle a écrit l'histoire… sur une belle Feuille !", seul: 2 },
    { r: "c", t: "Il vient de découper son adversaire en deux !", f: "Elle vient de découper son adversaire en deux !", seul: 1 },
    { r: "c", t: "Il a taillé son adversaire en pièces !", f: "Elle a taillé son adversaire en pièces !", seul: 1 },
    { r: "c", t: "Il a coupé l'herbe sous le pied de son adversaire !", f: "Elle a coupé l'herbe sous le pied de son adversaire !", seul: 1 },
    { r: "c", t: "Il vient de couper les ponts avec la défaite !", f: "Elle vient de couper les ponts avec la défaite !", seul: 1 },
    { r: "c", t: "Il a pris les choses en main… et les Ciseaux aussi !", f: "Elle a pris les choses en main… et les Ciseaux aussi !", seul: 1 },
    { r: "d", t: "Il a tranché la question.", f: "Elle a tranché la question.", seul: 1 },
    { r: "d", t: "Il a coupé court au suspense. Merci.", f: "Elle a coupé court au suspense. Merci.", seul: 1 },
    { r: "d", t: "Une victoire taillée sur mesure.", seul: 1 },
    { r: "d", t: "Une victoire au scalpel.", seul: 1 },
    { r: "d", t: "Quelle violence… pour une Feuille.", seul: 1 },
    { r: "c", t: ["La lumière est venue de la Pierre !", "La lumière est venue des Ciseaux !", "La lumière est venue de la Feuille !"], clin: "sport" },
    { r: "c", t: "Il entre dans la légende !", f: "Elle entre dans la légende !", si: "finale_tournoi" },
    { r: "c", t: "Qualifié ! Le tableau tremble !", f: "Qualifiée ! Le tableau tremble !", si: "tableau" },
    { r: "d", t: "Un tour de plus. Ne nous emballons pas.", si: "tableau" },
    { r: "d", t: "Un titre. Enfin quelque chose à accrocher au frigo.", si: "finale_tournoi" },
  ],
  victoire: [
    { r: "c", t: "C'est fini ! Quel combat !" },
    { r: "c", t: "Il l'a fait !", f: "Elle l'a fait !" },
    { r: "c", t: "Et c'est la délivrance !" },
    { r: "c", t: "Un match qui fera date !" },
    { r: "c", t: "Bravo aux deux joueurs, quel spectacle !" },
    { r: "d", t: "Rideau." },
    { r: "d", t: "Mission accomplie. Sans éclat, mais accomplie." },
    { r: "d", t: "Rien à dire. Et je trouve toujours quelque chose à dire." },
    { r: "c", t: "Et c'est gagné ! Quelle démonstration de maîtrise !" },
    { r: "c", t: "Il l'a vu venir à trois kilomètres !", f: "Elle l'a vu venir à trois kilomètres !" },
    { r: "c", t: "Quel match ! Quelle audace ! Quel poignet !" },
    { r: "c", t: "Une victoire qui ne souffre d'aucune contestation !" },
    { r: "c", t: "Il avait la bonne main au bon moment !", f: "Elle avait la bonne main au bon moment !" },
    { r: "c", t: "Masterclass !" },
    { r: "c", t: "Ça, c'est du Pierre-Feuille-Ciseaux de très haut niveau !" },
    { r: "c", t: "Mesdames et messieurs, quel duel !" },
    { r: "c", t: "Ce duel va rester dans les mémoires !" },
    { r: "c", t: "Une main en or, une victoire en béton !" },
    { r: "c", t: "Une victoire en trois actes : Pierre. Feuille. Ciseaux. Légende." },
    { r: "c", t: "Ce n'était pas un simple duel. C'était une bataille pour l'éternité !", si: "finale" },
    { r: "c", t: "Il vient peut-être de changer l'histoire du Pierre-Feuille-Ciseaux !", f: "Elle vient peut-être de changer l'histoire du Pierre-Feuille-Ciseaux !", si: "finale" },
    { r: "d", t: "Propre. Net. Sans bavure." },
    { r: "d", t: "On ne reverra peut-être jamais ça. Tant mieux, j'ai eu mon compte." },
  ],
  defaite: [
    { r: "d", t: "Au revoir.", clin: "cine", retiree: true },
    { r: "c", t: "Battu, mais pas abattu !", f: "Battue, mais pas abattue !" },
    { r: "c", t: "Il reviendra !", f: "Elle reviendra !", clin: "cine" },
    { r: "d", t: "Il faudra revoir ce match. Ou l'oublier. Je conseille l'oubli." },
    { r: "d", t: "On apprend plus d'une défaite. Il a beaucoup appris, ce soir.", f: "On apprend plus d'une défaite. Elle a beaucoup appris, ce soir." },
    { r: "d", t: "Quelqu'un peut lui expliquer les règles ?" },
    { r: "d", t: "C'est officiel : la stratégie n'était pas au rendez-vous.", retiree: true },   // (retirée le 28 octobre)
    { r: "d", t: "Il va falloir se remettre en question. Ou changer de main." },
    { r: "c", t: "Il cherche encore où il a perdu la Feuille !", f: "Elle cherche encore où elle a perdu la Feuille !", seul: 2, retiree: true },
    { r: "d", t: "La sentence est irrévocable.", clin: "cine" },
    { r: "d", t: "Il a le seum. Comme disent les jeunes.", f: "Elle a le seum. Comme disent les jeunes." },
    // (banque de commentaires du porteur du projet, branchée le 1er novembre : docs/repliques-banque-brouillon.md)
    { r: "d", t: "Le vainqueur repart avec la gloire. Le vaincu repart avec une remise en question existentielle." },
    // (le 3 novembre : seulement en fin de match, à la demande du porteur du projet ; avant, en fin de set écrasant)
    { r: "d", t: "Vous êtes le maillon faible. Au revoir !", clin: "cine" },
  ],
  // (« domination », « Je suis ton père », dit avant le match quand l'adversaire dominait nos face-à-face : retiré le 2 novembre,
  // à la demande du porteur du projet)
  // (« Je vous demande de vous arrêter », de Monique, est retirée le 28 octobre : c'est désormais l'arbitre qui le dit, après
  // les sifflets du public ; retirée aussi chez lui le 4 novembre : il demande le calme)
  // La mémoire du dernier match entre les deux mêmes joueurs (28 octobre, idée du porteur du projet) : dite avant le match,
  // une fois de temps en temps (annonces.js, memoireAvantMatch). « Il » : le joueur dont on parle (voir chaque moment).
  // L'ouverture de l'adversaire au dernier match (par signe : celui qu'il avait joué en premier).
  memoire_ouverture: [
    { r: "c", t: ["La dernière fois, il avait ouvert avec la Pierre !", "La dernière fois, il avait ouvert avec les Ciseaux !", "La dernière fois, il avait ouvert avec la Feuille !"],
      f: ["La dernière fois, elle avait ouvert avec la Pierre !", "La dernière fois, elle avait ouvert avec les Ciseaux !", "La dernière fois, elle avait ouvert avec la Feuille !"], signe: "adv" },
    { r: "d", t: ["Il avait ouvert avec la Pierre la dernière fois. Il a peut-être appris. Peut-être.", "Il avait ouvert avec les Ciseaux la dernière fois. Il a peut-être appris. Peut-être.", "Il avait ouvert avec la Feuille la dernière fois. Il a peut-être appris. Peut-être."],
      f: ["Elle avait ouvert avec la Pierre la dernière fois. Elle a peut-être appris. Peut-être.", "Elle avait ouvert avec les Ciseaux la dernière fois. Elle a peut-être appris. Peut-être.", "Elle avait ouvert avec la Feuille la dernière fois. Elle a peut-être appris. Peut-être."], signe: "adv" },
  ],
  // L'adversaire rejoue la même ouverture qu'au dernier match (dit après le premier coup).
  // (la première, « La mémoire, ce n'est pas son fort », est retirée le 28 octobre : rejouer la même ouverture peut être un choix)
  memoire_meme_ouverture: [
    { r: "d", t: "Il rejoue la même ouverture que la dernière fois. La mémoire, ce n'est pas son fort.", retiree: true },
    { r: "d", t: "Il rejoue la même ouverture que la dernière fois. Simple habitude, ou piège ?", f: "Elle rejoue la même ouverture que la dernière fois. Simple habitude, ou piège ?" },
    { r: "d", t: "Même ouverture. Il assume.", f: "Même ouverture. Elle assume." },
    { r: "d", t: "La même ouverture que la dernière fois. Il teste la mémoire de son adversaire.", f: "La même ouverture que la dernière fois. Elle teste la mémoire de son adversaire." },
    { r: "c", t: "Il rouvre comme au dernier match ! Il ose ! Il ose !", f: "Elle rouvre comme au dernier match ! Elle ose ! Elle ose !" },
  ],
  // Il change d'ouverture par rapport au dernier match (dit après le premier coup, une fois sur deux).
  memoire_change_ouverture: [
    { r: "d", t: "Il change d'ouverture. La dernière fois lui a servi de leçon.", f: "Elle change d'ouverture. La dernière fois lui a servi de leçon." },
    { r: "c", t: "Nouvelle ouverture ! Il a préparé ce match !", f: "Nouvelle ouverture ! Elle a préparé ce match !" },
  ],
  // Beaucoup de matchs entre eux (5 ou plus).
  memoire_habitues: [{ r: "c", t: "Ces deux-là se connaissent par cœur ! Et ça promet !" }],
  // « Il » mène dans leurs face-à-face (3 matchs ou plus).
  memoire_mene: [{ r: "d", t: "Il mène dans leurs face-à-face. Mais ça ne veut rien dire. Enfin, un peu.", f: "Elle mène dans leurs face-à-face. Mais ça ne veut rien dire. Enfin, un peu." }],
  // Je n'ai jamais battu cet adversaire (2 défaites ou plus).
  memoire_jamais_battu: [
    { r: "c", t: "Il n'a jamais battu cet adversaire ! Ce soir, peut-être ?", f: "Elle n'a jamais battu cet adversaire ! Ce soir, peut-être ?" },
    { r: "d", t: "Jamais battu cet adversaire. Il y a un début à tout." },
  ],
  // Le dernier match remonte à plus d'une semaine.
  memoire_retrouvailles: [{ r: "c", t: "Ils se retrouvent pour la première fois depuis un moment !" }],
  // « Il » avait gagné le dernier match.
  memoire_dernier_gagne: [
    { r: "d", t: "Il avait gagné la dernière fois. Le plus dur, c'est de recommencer.", f: "Elle avait gagné la dernière fois. Le plus dur, c'est de recommencer." },
    { r: "c", t: "Il reste sur une victoire contre lui ! Il veut la confirmer !", f: "Elle reste sur une victoire ! Elle veut la confirmer !" },
  ],
  // « Il » avait perdu le dernier match.
  memoire_dernier_perdu: [{ r: "d", t: "Il reste sur une défaite contre lui. Il a eu le temps d'y penser.", f: "Elle reste sur une défaite. Elle a eu le temps d'y penser." }],
  // Le vainqueur du dernier match l'avait renversé (premier set perdu).
  memoire_renverse: [{ r: "c", t: "La dernière fois, il avait renversé le match ! Le public n'a pas oublié !", f: "La dernière fois, elle avait renversé le match ! Le public n'a pas oublié !" }],
  // Son signe le plus joué au dernier match (45 % ou plus).
  memoire_favori: [
    { r: "d", t: ["La dernière fois, il avait beaucoup joué la Pierre. Il a dû y repenser.", "La dernière fois, il avait beaucoup joué les Ciseaux. Il a dû y repenser.", "La dernière fois, il avait beaucoup joué la Feuille. Il a dû y repenser."],
      f: ["La dernière fois, elle avait beaucoup joué la Pierre. Elle a dû y repenser.", "La dernière fois, elle avait beaucoup joué les Ciseaux. Elle a dû y repenser.", "La dernière fois, elle avait beaucoup joué la Feuille. Elle a dû y repenser."], signe: "adv" },
  ],
  // Le dernier match avait été très long (40 coups ou plus).
  memoire_long: [{ r: "d", t: "Leur dernier match a duré une éternité. J'ai prévu un thermos." }],
  // J'avais perdu nettement le dernier match.
  memoire_defaite_seche: [
    { r: "c", t: "Le dernier match s'était soldé par une défaite sèche… l'heure de la revanche a sonné !" },
    { r: "d", t: "La dernière fois, c'était une correction. On espère un match, cette fois." },
  ],
  // J'avais sauvé une balle de match au dernier match.
  memoire_balle_sauvee: [
    { r: "c", t: "Au dernier match, il avait sauvé une balle de match ! Le public s'en souvient !", f: "Au dernier match, elle avait sauvé une balle de match ! Le public s'en souvient !" },
  ],
  // Le dernier match s'était joué de très peu.
  memoire_serre: [{ r: "d", t: "La dernière fois, ça s'était joué à un point. Prévoyez du temps." }],
  // Égalité dans nos face-à-face (au moins 2 victoires chacun).
  memoire_belle: [{ r: "c", t: "Égalité parfaite dans leurs face-à-face : c'est la belle, mesdames et messieurs !" }],
  // Le même joueur a gagné les 3 derniers face-à-face (« il » : ce joueur).
  memoire_habitude: [
    { r: "d", t: "Il a gagné les derniers face-à-face. À ce stade, ce n'est plus un duel, c'est une habitude.", f: "Elle a gagné les derniers face-à-face. À ce stade, ce n'est plus un duel, c'est une habitude." },
  ],
  // Avant un grand match, le chant des supporters (3 novembre, répliques choisies par le porteur du projet).
  avant_ambiance: [
    { r: "c", t: "Écoutez-moi cette ambiance ! Les supporters sont déchaînés ce soir !" },
    { r: "c", t: "Vous entendez ça, Madame ? Le public est déjà chaud bouillant !" },
    { r: "d", t: "On ne s'entend plus. C'est presque agréable." },
    { r: "d", t: "Autant de bruit pour trois signes. J'adore ce sport." },
    { r: "c", t: "Quelle ferveur ! On se croirait en finale de Coupe du monde !" },
    // (4 novembre, choisies par le porteur du projet : aussi au début d'un match ordinaire quand le stade chante)
    { r: "c", t: "Les supporters sont chauds bouillants aujourd'hui !" },
    { r: "c", t: "Les supporters se sont déplacés en masse, et ça s'entend !" },
    { r: "c", t: "Chaude ambiance ce soir dans les gradins !" },
    { r: "c", t: "Les tribunes sont pleines à craquer ! Quel accueil pour les joueurs !" },
    { r: "c", t: "Ça chante dans tous les coins du stade ! Les joueurs vont avoir des frissons !" },
    { r: "c", t: "Le virage est en feu, et on n'a pas encore joué un seul point !" },
    { r: "c", t: "Les supporters donnent de la voix avant même le premier signe !" },
    { r: "d", t: "Beaucoup d'énergie dans les tribunes. Espérons qu'il en reste sur le court." },
    { r: "d", t: "Ils ont plus de souffle que certains joueurs." },
    { r: "d", t: "Le public est prêt. Les joueurs, on verra." },
    { r: "d", t: "Ça chante faux, mais avec conviction." },
    { r: "d", t: "Tout ce monde pour trois signes. J'en suis presque émue." },
  ],
  // Un joueur a ses chants de supporters personnalisés (chants-perso.js) : dit au début de ses matchs, pendant son chant
  // (3 novembre, répliques validées par le porteur du projet). « Il » : le joueur que le public soutient.
  perso_supporters: [
    { r: "c", t: "Écoutez ça ! Les supporters ont fait le déplacement pour lui !", f: "Écoutez ça ! Les supporters ont fait le déplacement pour elle !" },
    { r: "c", t: "Ils sont venus nombreux pour le soutenir ce soir ! Quelle ferveur !", f: "Ils sont venus nombreux pour la soutenir ce soir ! Quelle ferveur !" },
    { r: "c", t: "Tout le public scande son nom ! Il joue à domicile ce soir !", f: "Tout le public scande son nom ! Elle joue à domicile ce soir !" },
    { r: "d", t: "Il a son fan-club. Je me demande combien il les paie.", f: "Elle a son fan-club. Je me demande combien elle les paie." },
    { r: "d", t: "Des supporters rien que pour lui. Il ne faudra pas les décevoir.", f: "Des supporters rien que pour elle. Il ne faudra pas les décevoir." },
    { r: "d", t: "Un chant à son nom. Moi, à mes débuts, j'avais juste un thermos." },
  ],
  // La série en cours dans leurs face-à-face (3 novembre, répliques validées par le porteur du projet) : victoires d'affilée
  // (« il » : le joueur qui enchaîne) et défaites d'affilée (« il » : le joueur qui les subit), à 3, 4, 5 et plus.
  memoire_serie_3: [
    { r: "d", t: "Il reste sur trois victoires d'affilée contre lui.", f: "Elle reste sur trois victoires d'affilée contre lui." },
    { r: "c", t: "Trois victoires de suite ! Il arrive en confiance !", f: "Trois victoires de suite ! Elle arrive en confiance !" },
  ],
  memoire_serie_4: [
    { r: "c", t: "Quatre victoires d'affilée ! Qui va enfin l'arrêter ?" },
    { r: "d", t: "Quatre de suite. L'autre commence à le prendre personnellement." },
  ],
  memoire_serie_5: [
    { r: "c", t: "Cinq victoires de suite contre lui ! C'est une série historique !" },
    { r: "d", t: "Cinq victoires d'affilée. À ce niveau, ce n'est plus une série, c'est un abonnement." },
  ],
  memoire_serie_plus: [
    { r: "d", t: "Il a gagné tous leurs derniers matchs. J'ai arrêté de compter. Lui, non.", f: "Elle a gagné tous leurs derniers matchs. J'ai arrêté de compter. Elle, non." },
    { r: "c", t: "Une série incroyable ! Il est intouchable dans ce face-à-face !", f: "Une série incroyable ! Elle est intouchable dans ce face-à-face !" },
  ],
  memoire_defaites_3: [{ r: "d", t: "Il reste sur trois défaites consécutives contre lui.", f: "Elle reste sur trois défaites consécutives contre lui." }],
  memoire_defaites_4: [{ r: "d", t: "Il reste sur quatre défaites consécutives contre lui.", f: "Elle reste sur quatre défaites consécutives contre lui." }],
  memoire_defaites_5: [{ r: "d", t: "Il reste sur cinq défaites consécutives contre lui.", f: "Elle reste sur cinq défaites consécutives contre lui." }],
  memoire_defaites_plus: [{ r: "d", t: "Il reste sur une longue série de défaites contre lui. On a arrêté de compter.", f: "Elle reste sur une longue série de défaites contre lui. On a arrêté de compter." }],
  // ---------------------------------------------------------------- banque du porteur du projet (branchée le 1er novembre)
  // Un point gagné avec un signe (« beau coup ») : de temps en temps, quand rien d'autre n'est à dire ; le texte dépend du signe
  // gagnant (seul : 0 Pierre, 1 Ciseaux, 2 Feuille). « Il » : moi.
  beau_coup: [
    { r: "c", t: "Il l'a pétrifié !", f: "Elle l'a pétrifié !", seul: 0 },
    { r: "d", t: "Sur cette pierre, il bâtit son église.", f: "Sur cette pierre, elle bâtit son église.", seul: 0 },
    { r: "c", t: "Pierre après pierre, il bâtit sa légende !", f: "Pierre après pierre, elle bâtit sa légende !", seul: 0 },
    { r: "d", t: "Un roc. Et un adversaire en miettes.", seul: 0 },
    { r: "c", t: "Il lui jette la pierre, Pierre !", f: "Elle lui jette la pierre, Pierre !", seul: 0, clin: "cine" },
    { r: "c", t: "Un coup magnifiquement ciselé !", seul: 1 },
    { r: "c", t: "C'est l'effet ciseaux !", seul: 1 },
    { r: "c", t: "Un coup de ciseaux chirurgical !", seul: 1 },
    { r: "c", t: "Magnifique ciseau retourné !", seul: 1, clin: "sport", si: "ciseau_retourne" },   // (Ciseaux gagnants juste après les Ciseaux de l'adversaire)
    { r: "c", t: "Une coupe parfaite ! Sanction immédiate !", seul: 1 },
    { r: "c", t: "Il vient de raccourcir les ambitions de son rival !", f: "Elle vient de raccourcir les ambitions de son rival !", seul: 1 },
    { r: "c", t: "La feuille est en deux, et les espoirs aussi !", seul: 1 },
    { r: "d", t: "Il a sorti les lames. Et pas pour couper le gâteau.", f: "Elle a sorti les lames. Et pas pour couper le gâteau.", seul: 1 },
    { r: "d", t: "Il taille dans le vif et découpe les espoirs adverses.", f: "Elle taille dans le vif et découpe les espoirs adverses.", seul: 1 },
    { r: "d", t: "Il lui coupe l'herbe sous le pied !", f: "Elle lui coupe l'herbe sous le pied !", seul: 1 },
    { r: "d", t: "Certains écrivent l'histoire, lui la découpe aux ciseaux.", f: "Certains écrivent l'histoire, elle la découpe aux ciseaux.", seul: 1 },
    { r: "c", t: "Et c'est le coup du millefeuille !", seul: 2 },
    { r: "d", t: "Il vient de mettre son adversaire sous pli.", f: "Elle vient de mettre son adversaire sous pli.", seul: 2 },
    { r: "c", t: "La Feuille enveloppe tout !", seul: 2 },
    { r: "c", t: "Un coup tout en douceur ! La Feuille a parlé !", seul: 2 },
    { r: "d", t: "Une feuille. Et la pierre n'y peut rien.", seul: 2 },
    { r: "d", t: "Emballé, c'est pesé.", seul: 2, retiree: true },   // (retirée le 5 novembre, à la demande du porteur du projet)
    // (5 novembre, répliques du porteur du projet)
    { r: "c", t: "Il reste solide sur ses appuis !", f: "Elle reste solide sur ses appuis !", seul: 0 },
  ],
  // Trois points d'affilée gagnés avec la Pierre.
  trois_pierres: [
    { r: "d", t: "Pierre qui roule n'amasse pas mousse." },
    // (5 novembre, répliques du porteur du projet)
    { r: "c", t: "Il opte pour une défense en catenaccio !", f: "Elle opte pour une défense en catenaccio !" },
  ],
  // Trois points d'affilée gagnés avec les Ciseaux, avec la Feuille.
  trois_ciseaux: [{ r: "d", t: "Trois Ciseaux, trois points. Le coiffeur est en forme." }],
  trois_feuilles: [
    { r: "c", t: "Trois Feuilles gagnantes ! Il écrit son roman !", f: "Trois Feuilles gagnantes ! Elle écrit son roman !" },
    { r: "d", t: "Trois Feuilles, trois points. On tourne la page." },
  ],
  // Le tout premier coup du match est une égalité.
  premiere_egalite: [
    { r: "c", t: "Premier coup… même signe ! Ils se neutralisent !" },
    { r: "c", t: "Même idée dès le premier coup ! Ça promet !" },
    { r: "d", t: "Ça commence bien. Enfin, ça ne commence pas." },
    { r: "d", t: "Premier coup, premier match nul." },
  ],
  // Un point enfin gagné après des égalités (2 ou plus) : par moi, ou par l'adversaire.
  apres_egalites_gagne: [
    { r: "c", t: "Une feinte, une parade, une riposte ! Quel échange !" },
    { r: "c", t: "Il a fini par trouver la faille !", f: "Elle a fini par trouver la faille !" },
    { r: "c", t: "Enfin ! Le duel d'esprits a un vainqueur !" },
    { r: "c", t: "Il a lu dans ses pensées !", f: "Elle a lu dans ses pensées !" },
    { r: "d", t: "Il fallait bien que quelqu'un se décide." },
    { r: "d", t: "La patience a payé. Pour une fois." },
  ],
  apres_egalites_perdu: [
    { r: "c", t: "Oh, la feinte de la feinte de la feinte… ça a failli passer !" },
    { r: "c", t: "Le duel d'esprits a tourné court !" },
    { r: "d", t: "Il a cligné le premier.", f: "Elle a cligné la première." },
    { r: "d", t: "À force d'attendre, il s'est fait prendre.", f: "À force d'attendre, elle s'est fait prendre." },
    { r: "d", t: "L'autre a tenu un coup de plus." },
  ],
  // Le premier point du match perdu (de temps en temps). L'ouverture Kolodrov est inventée : l'érudition de Monique.
  // « Mauvais départ » et « Ça commence mal » : seulement à 0-3 au début du match, pas dès le premier point (remarque du
  // porteur du projet, 3 novembre : perdre le premier coup n'est pas forcément un mauvais départ).
  // Situations ajoutées le 5 novembre (répliques du porteur du projet). « Il » : moi, sauf mention.
  // 1 ou 2 points gagnés d'entrée de match.
  cueilli_a_froid: [
    { r: "c", t: "Il a cueilli à froid son adversaire !", f: "Elle a cueilli à froid son adversaire !" },
    { r: "c", t: "Il vient de climatiser l'arène !", f: "Elle vient de climatiser l'arène !" },
  ],
  // Égalités sur les premiers coups du match.
  ouverture_egalites: [
    { r: "c", t: "On est en plein round d'observation !" },
    { r: "c", t: "Duel à haute intensité !" },
    { r: "c", t: "Personne ne recule !" },
  ],
  // Un point gagné alors que l'adversaire venait d'en gagner 3 ou plus d'affilée.
  contre_cours: [
    { r: "c", t: "Il marque contre le cours du jeu !", f: "Elle marque contre le cours du jeu !" },
  ],
  // Un point repris juste après en avoir perdu un.
  riposte: [
    { r: "c", t: "La réponse du berger à la bergère !" },
    { r: "c", t: "Il répond du tac au tac !", f: "Elle répond du tac au tac !" },
    { r: "c", t: "Retour à l'envoyeur !" },
  ],
  // Feuille gagnante, puis Pierre gagnante.
  cadrage: [
    { r: "c", t: "Cadrage avec la Feuille et débordement avec la Pierre !" },
  ],
  // Quatre fois le même signe d'affilée.
  quatre_meme: [
    { r: "d", t: "Il s'enferme dans un jeu stéréotypé.", f: "Elle s'enferme dans un jeu stéréotypé." },
    { r: "d", t: "Il est en panne d'inspiration.", f: "Elle est en panne d'inspiration." },
  ],
  // Revenu plusieurs fois à égalité dans le set.
  chasse_patate: [
    { r: "c", t: "Il est en chasse-patate !", f: "Elle est en chasse-patate !" },
    { r: "c", t: "Il reste dans la roue de son adversaire !", f: "Elle reste dans la roue de son adversaire !" },
  ],
  // 8-8 (5-5 dans un set de 7).
  money_time: [
    { r: "c", t: "On entre dans le money time, chaque main compte !" },
  ],
  // Un point perdu à 8-8 (5-5 dans un set de 7).
  rate_money_time: [
    { r: "c", t: "Oh non, pas ça, pas maintenant !" },
  ],
  // Deux points d'avance pour la première fois du set.
  le_break: [
    { r: "c", t: "Il fait le break !", f: "Elle fait le break !" },
  ],
  // Gagné, gagné, perdu, perdu.
  tout_a_refaire: [
    { r: "c", t: "Il avait fait le plus dur, et tout est à refaire !", f: "Elle avait fait le plus dur, et tout est à refaire !" },
  ],
  // J'avais lu le réflexe de l'adversaire (il rejoue son signe), il a changé : point perdu.
  faille_ratee: [
    { r: "d", t: "Il a vu la faille, mais ça n'a pas souri.", f: "Elle a vu la faille, mais ça n'a pas souri." },
  ],
  // Quand rien d'autre n'est à dire (rarement) ; « varie » : mes trois derniers signes sont différents ; « mene » : je suis mené.
  divers: [
    { r: "c", t: "Il alterne bien son jeu !", f: "Elle alterne bien son jeu !", si: "varie" },
    { r: "c", t: "Il varie bien son jeu !", f: "Elle varie bien son jeu !", si: "varie" },
    { r: "c", t: "Il est en rythme, en jambes !", f: "Elle est en rythme, en jambes !" },
    { r: "c", t: "Un enchaînement parfaitement exécuté !" },
    { r: "c", t: "Il se bat comme un beau diable !", f: "Elle se bat comme un beau diable !", si: "mene" },
    { r: "c", t: "Il joue juste, gros QI chi-fou-mi sur le central !", f: "Elle joue juste, gros QI chi-fou-mi sur le central !" },
    { r: "c", t: "Le joueur affiche une très belle attitude.", f: "La joueuse affiche une très belle attitude." },
    { r: "c", t: "Si vous n'aimez pas ça, vous n'aimez pas le chi-fou-mi !" },
    { r: "d", t: "Il a faux, et ça lui réussit.", f: "Elle a faux, et ça lui réussit." },
    { r: "d", t: "Le chi-fou-mi, c'est très simple et c'est très compliqué." },
  ],
  premier_point_perdu: [
    { r: "d", t: "L'ouverture de Kolodrov, 1956… mais ça ne lui sourit pas.", clin: "sport", si: "premier_point" },
    { r: "c", t: "Premier point pour l'adversaire ! Rien n'est joué !", si: "premier_point" },
    { r: "d", t: "Un mauvais départ. Il reste du temps. Heureusement.", si: "depart_rate" },
    { r: "d", t: "Ça commence mal. On a déjà vu pire. Rarement.", si: "depart_rate" },
    // (5 novembre, répliques du porteur du projet)
    { r: "c", t: "Il se fait surprendre !", f: "Elle se fait surprendre !", si: "premier_point" },
  ],
  // Avant le match, parfois une seule phrase au lieu d'un dialogue : tous les matchs, les grands matchs, une revanche, entre amis.
  avant_seul: [
    { r: "c", t: "Affrontement sous haute tension !" },
    { r: "c", t: "Les deux joueurs entrent dans l'arène. Pas un sourire. Pas un regard de trop." },
    { r: "c", t: "Les mains sont prêtes, les esprits sont affûtés. Le spectacle peut commencer !" },
    { r: "c", t: "La pression monte, les poignets sont chauds !" },
    { r: "d", t: "Ce soir, il n'y aura qu'un vainqueur. Et probablement un mauvais perdant." },
    { r: "d", t: "Deux joueurs, trois signes, un seul objectif : humilier son prochain." },
    { r: "d", t: "Ce soir, on ne règle pas ses comptes. On les découpe." },
  ],
  avant_seul_grand: [{ r: "c", t: "Parfum de Ligue des champions ce soir !", clin: "sport" }],
  avant_seul_revanche: [
    { r: "d", t: "Ils se connaissent par cœur. Malheureusement, ils se connaissent aussi les défauts." },
    { r: "d", t: "Une vieille rivalité, quelques rancœurs, et trois signes pour régler tout ça." },
    { r: "d", t: "Il paraît qu'ils ne s'apprécient guère. Heureusement, le chifoumi ne nécessite aucun dialogue." },
  ],
  avant_seul_amis: [
    { r: "c", t: "Amis dans la vie, ennemis dans l'arène ! Enfin, c'est ce qu'ils racontent avant le premier coup." },
    { r: "d", t: "Il paraît qu'ils sont très bons amis. On va voir combien de temps cette amitié résiste à une défaite." },
    { r: "d", t: "Ils sont venus ensemble, ils repartiront ensemble… enfin, si le perdant accepte de suivre." },
    { r: "d", t: "Les meilleurs amis du monde. Jusqu'au moment où l'un des deux sort une pierre avec un sourire suspect." },
    { r: "d", t: "Ils se connaissent, ils s'apprécient, ils se respectent. Enfin, pour l'instant." },
    { r: "d", t: "Il y a des amitiés qui durent toute une vie. Et puis il y a celles qui se terminent sur un ciseau mal anticipé." },
  ],
  // ---------------------------------------------------------------- le smash (validé le 1er novembre)
  // « Il » : moi. deMoi : la phrase parle du smasheur, donc seulement pour mes smashs (pour ceux de l'adversaire, les autres).
  // Mon smash gagne le point (l'adversaire est sonné).
  smash_reussi: [
    { r: "c", t: "QUEL SMASH !" },
    { r: "c", t: "Il a tout mis dans ce coup !", f: "Elle a tout mis dans ce coup !" },
    { r: "c", t: "Le smash est passé ! Imparable !" },
    { r: "c", t: "Ça, c'est un coup de massue !" },
    { r: "d", t: "Un smash. Et un adversaire en morceaux." },
    { r: "d", t: "Il a frappé fort. Pour une fois, il a frappé juste.", f: "Elle a frappé fort. Pour une fois, elle a frappé juste." },
    // (idées d'un testeur, validées le 1er novembre ; seul : selon le signe du smash)
    { r: "c", t: "Avec autorité !" },
    { r: "c", t: "Il monte au filet, et ça paye !", f: "Elle monte au filet, et ça paye !" },
    { r: "c", t: "C'est le point du K.-O. !" },
    { r: "c", t: "Il éteint son adversaire !", f: "Elle éteint son adversaire !" },
    { r: "c", t: "Il fait montre de tout son talent !", f: "Elle fait montre de tout son talent !" },
    { r: "c", t: "Il est en train de rentrer dans la tête de son adversaire !", f: "Elle est en train de rentrer dans la tête de son adversaire !" },
    { r: "d", t: "Un point d'exclamation sur sa victoire." },
    { r: "d", t: "Retour à l'école pour son adversaire !" },
    { r: "d", t: "Il amuse la galerie.", f: "Elle amuse la galerie." },
    { r: "d", t: "Celui-là, c'était pour les photographes." },
    { r: "c", t: "La feuille A4 ! Format grand smash !", seul: 2 },
    { r: "d", t: "Une feuille A4. Pliée en quatre, l'adversaire.", seul: 2 },
    { r: "c", t: "La cisaille ! Il a tout tranché !", f: "La cisaille ! Elle a tout tranché !", seul: 1 },
    { r: "d", t: "La cisaille. Net et sans bavure.", seul: 1 },
    { r: "c", t: "Le rocher dévale ! Rien ne l'arrête !", seul: 0 },
    { r: "d", t: "Un rocher. L'adversaire ne s'en relèvera pas tout de suite.", seul: 0 },
    // (5 novembre, répliques du porteur du projet)
    { r: "c", t: "Il secoue le cocotier !", f: "Elle secoue le cocotier !", si: "apres_egalites" },
    { r: "c", t: "Il tape du poing sur la table !", f: "Elle tape du poing sur la table !", si: "apres_egalites" },
  ],
  // Le smash de l'adversaire gagne le point : je suis sonné.
  smash_sonne: [
    { r: "c", t: "Il est sonné ! Il cherche ses repères !", f: "Elle est sonnée ! Elle cherche ses repères !" },
    { r: "c", t: "Il titube ! Il est groggy !", f: "Elle titube ! Elle est groggy !" },
    { r: "d", t: "Il voit des étoiles. Moi aussi, parfois.", f: "Elle voit des étoiles. Moi aussi, parfois." },
    { r: "d", t: "Comptez jusqu'à quatre. Il revient.", f: "Comptez jusqu'à quatre. Elle revient." },
  ],
  // Un smash qui perd le point.
  smash_rate: [
    { r: "c", t: "Il a tout tenté… et tout raté !", f: "Elle a tout tenté… et tout raté !", deMoi: true },
    { r: "c", t: "Le smash finit dans le filet !" },
    { r: "d", t: "Beaucoup d'élan. Peu de résultat." },
    { r: "d", t: "Frapper fort, c'est bien. Frapper juste, c'est mieux." },
    { r: "d", t: "Il a smashé dans le vide. Le vide a gagné.", f: "Elle a smashé dans le vide. Le vide a gagné.", deMoi: true },
  ],
  // Un smash sur une égalité.
  smash_bloque: [
    { r: "c", t: "Bloqué ! Le mur a tenu !" },
    { r: "c", t: "Smash contré ! Quelle lecture !" },
    { r: "d", t: "Il a smashé dans un mur. Le mur ne s'est pas excusé.", f: "Elle a smashé dans un mur. Le mur ne s'est pas excusé.", deMoi: true },
    { r: "d", t: "Tout ce bruit pour une égalité." },
  ],
  // Les deux joueurs smashent le même coup.
  smash_double: [
    { r: "c", t: "Double smash ! Ça tape de partout !" },
    { r: "d", t: "Deux smashs. Aucune finesse. Beaucoup de bruit." },
  ],
  // La poignée de main (2 novembre, répliques choisies par le porteur du projet ; voir poignee.js : situationPoignee).
  // Une poignée normale n'est pas commentée.
  poignee_franche: [
    { r: "c", t: "Ça, c'est du respect ! Deux vraies poignées de main !" },
    { r: "d", t: "Une belle poignée de main, on sent un grand respect mutuel." },
  ],
  poignee_contraste: [
    { r: "c", t: "Très belle accolade…" },
    { r: "d", t: "Un des deux avait envie de serrer. L'autre, non." },
    { r: "d", t: "La chaleur humaine, à sens unique." },
  ],
  poignee_froide: [
    { r: "c", t: "Brrr… un vent de fraîcheur sur le court, Madame !" },
    { r: "d", t: "Ils ne partiront pas en vacances ensemble." },
  ],
  poignee_legere: [
    { r: "d", t: "Du bout des doigts. Le strict minimum." },
    { r: "c", t: "Une poignée de main… minimaliste !" },
  ],
  humain: [
    { r: "c", t: "C'est un duel ! Un vrai ! Les yeux dans les yeux !" },
    { r: "d", t: "Ils se connaissent. Et ça se voit." },
    { r: "d", t: "Entre amis, il n'y a pas de pitié." },
  ],
};

// ---------------------------------------------------------------- les dialogues (temps morts)
// Chaque dialogue : une réplique du commentateur, puis la réponse de la commentatrice
// (texte, ou { t, f } quand la version au féminin diffère).
export const DIALOGUES = {
  avant_match: [
    ["Madame, la tension est palpable.", "On sent surtout deux personnes devant leur téléphone. Mais oui."],
    ["Deux styles, deux écoles !", "Trois signes. Il n'y en a jamais eu que trois."],
    ["Un pronostic, Madame ?", "Je ne fais pas de pronostic. Je constate… après."],
    ["Vous le sentez comment, ce match ?", "Long. Très long…"],
    ["La Pierre, c'est la base, Madame !", "C'est pas faux."],
    ["Bonsoir à tous ! Roland Pignon, en direct du court central, aux côtés de la légendaire Monique Latour !", "Bonsoir. Commençons, Roland."],
    ["Monique Latour, la finale de 1997, les trois Ciseaux…", "Roland. Le match."],
    ["Monique, votre pronostic pour ce soir ?", "Je pronostique un vainqueur. Et un perdant."],
    ["Quelle ambiance, Madame ! Le public est chaud bouillant !", "Le public, c'est vous et moi, Roland."],
    ["On m'annonce un match historique !", "On vous l'annonce à chaque match."],
    ["Trois signes, Madame ! Seulement trois ! Et pourtant, quelle richesse !", "Trois. Je les ai comptés."],
    ["Vous avez un signe fétiche, Monique ?", "Oui. Je ne le dirai jamais."],
    ["Les deux joueurs se regardent droit dans les yeux…", "Ils regardent leur téléphone, Roland."],
    ["Échauffement terminé, les mains sont prêtes !", "On s'échauffe les mains, maintenant. On aura tout vu."],
    ["Un conseil pour nos joueurs, Madame ?", "Ne jouez pas Pierre. Ou jouez Pierre. Je ne sais plus."],
  ],
  // Avant le match, selon la situation (contre un bot, en finale, une revanche, tard le soir).
  // Sur une balle de match, de temps en temps (banque du 1er novembre) : Roland s'enflamme, Monique le calme. « Le » : moi.
  // La première égalité du match (de temps en temps à la place d'une réplique) ; il change enfin de signe : le dégagement.
  premiere_egalite: [["Premier coup, première égalité !", "Et pas la dernière, à mon avis."]],
  changement: [[{ t: "Il casse enfin la série !", f: "Elle casse enfin la série !" }, "Oui. Dégagement très propre."]],
  balle_de_match: [[{ t: "Une victoire le sépare de l'immortalité !", f: "Une victoire la sépare de l'immortalité !" }, "Enfin… de la victoire du jour. Restons mesurés."]],
  avant_bot: [["Un humain contre une machine, Madame !", "La machine a l'air plus détendue."]],
  // La mémoire du dernier match (28 octobre) : il rejoue la même ouverture ; une revanche (j'avais perdu) ; des habitués ;
  // un dernier match marquant (serré ou long).
  memoire_meme_ouverture: [[{ t: "Il rouvre comme au dernier match ! Quelle audace !", f: "Elle rouvre comme au dernier match ! Quelle audace !" }, "Ou quel manque d'imagination. On saura à la fin du match."]],
  memoire_revanche: [["Une revanche, Madame ! Une vraie !", "Ils ont dû la préparer toute la semaine."]],
  memoire_habitues: [["Ils se connaissent, ils se jaugent, ils se respectent !", "Ils se méfient, surtout."]],
  memoire_marquant: [["La dernière fois, quel match, Madame !", "On en reparle à la fin de celui-ci."]],
  avant_finale: [["Une finale, Madame ! Une FINALE !", "J'avais entendu la première fois."]],
  avant_revanche: [["Ils se connaissent, ces deux-là !", "Oui. Et ils ne s'aiment pas beaucoup."]],
  avant_nuit: [["Il est tard, Madame, mais le HandSlam ne dort jamais !", "Moi si. Normalement."]],
  // Les figures techniques (inventées) : Roland les nomme, Monique répond, une fois cassante (1er dialogue),
  // une fois sérieuse comme une experte (2e dialogue, une « école » imaginaire). Voir figureDe dans annonces.js.
  figure_triple_loop: [
    ["UN TRIPLE LOOP ! Trois fois le même signe !", "Trois fois la même idée. On appelle ça de l'entêtement."],
    ["Le triple loop, Madame ! Et réceptionné !", "Oui. Un geste typique de l'école lyonnaise."],
  ],
  figure_double_boucle: [
    ["DOUBLE BOUCLE PIQUÉ !", "Un changement d'avis. Rien de plus."],
    ["Un double boucle piqué d'une pureté rare !", "Un pur produit de l'école hongroise. Très propre."],
  ],
  figure_valse: [
    ["LA VALSE À TROIS TEMPS !", "La fin était à deux temps. Il faudra revoir le solfège."],
    ["Trois, puis deux ! La valse, Madame !", "Un classique de l'école viennoise. Évidemment."],
  ],
  figure_tour: [
    ["LE TOUR DU PROPRIÉTAIRE ! Pierre, Feuille, Ciseaux !", "Les trois signes, dans l'ordre. Ça s'appelle compter."],
    ["Le tour du propriétaire, exécuté à la perfection !", "Une marque de fabrique de l'école suisse. Ponctuelle."],
  ],
  figure_retro: [
    ["LE RÉTRO INVERSÉ !", "Ça existe, ça ?"],
    ["Ciseaux, Feuille, Pierre ! Le rétro inversé !", "Très prisé à l'école finlandaise. Ils jouent tout à l'envers, là-bas."],
  ],
  figure_ascenseur: [
    ["L'ASCENSEUR ÉMOTIONNEL !", "Aller, retour. Rez-de-chaussée."],
    ["Un aller-retour d'une audace folle !", "Typique de l'école de Tourcoing. On y revient toujours."],
  ],
  figure_boomerang: [
    ["LE BOOMERANG ! Le signe revient !", "Comme les mauvaises idées. Sauf que celle-là marche."],
    ["Le boomerang, Madame ! Le signe perdant revient gagner !", "Un héritage de l'école australienne. Forcément."],
  ],
  figure_miroir: [
    ["LE MIROIR TOXIQUE !", "Copier son adversaire. À l'école, on appelle ça tricher."],
    ["Le miroir toxique ! Quelle insolence !", "Une spécialité de l'école vénitienne. Les miroirs, c'est leur affaire."],
  ],
  figure_marteau: [
    ["LE MARTEAU-PIQUEUR ! Encore et encore !", "Les voisins vont se plaindre."],
    ["Quatre fois le même signe ! Le marteau-piqueur !", "Un pur produit de l'école soviétique des années 80. Rien ne bouge, tout cogne."],
  ],
  figure_parapluie: [
    ["LE COUP DU PARAPLUIE !", "Après l'orage, forcément."],
    ["Trois égalités, puis le coup du parapluie !", "Très britannique. L'école de Cambridge, sans aucun doute."],
  ],
  // N'importe quand en fin de set, sans explication : personne ne sait ce que c'est.
  buse: [
    ["Une triple buse inversée ! C'est osé à ce moment-là de la partie !", "C'est surtout inconscient."],
    ["Attention… une triple buse inversée ! On n'en voit pas tous les jours !", "Heureusement."],
  ],
  // Avant et après le match, selon l'enjeu (proposition du porteur du projet) : l'entraînement, un petit tournoi
  // (HandSlam Open, tournois entre amis, Midi, Apéro, Nocturne, freeroll) ou un gros tournoi (« majeur » : le Grand Chelem),
  // et le tour (premiers tours, quarts, demi-finales, finale). Voir contexteJeu dans annonces.js.
  avant_entrainement: [
    ["Et c'est parti pour un petit entraînement !", "Exactement. Un entraînement. Vous pouvez respirer, Roland."],
    ["Pas de pression aujourd'hui… enfin, normalement !", "Voilà. Essayez de vous en souvenir."],
    ["Une rencontre qui pourrait déjà révéler de grands talents !", "Ou simplement deux joueurs qui s'entraînent."],
    ["Pas de trophée à la clé, mais une belle occasion de progresser !", "C'est à ça que servent les entraînements."],
    ["Peut-être le début d'une incroyable carrière !", "Ou la fin d'un très mauvais échauffement."],
    ["Une rencontre qui pourrait entrer dans l'Histoire !", "Roland… c'est un entraînement."],
    ["Le public attend beaucoup de cette rencontre !", "Le public attend surtout que ça commence."],
    ["Chaque main compte !", "Pas vraiment. Il n'y a rien à gagner."],
    ["L'heure est venue de montrer ce qu'ils ont dans le ventre !", "Pour l'instant, qu'ils montrent déjà ce qu'ils ont dans la main."],
    ["Que le spectacle commence !", "Doucement. C'est un entraînement."],
  ],
  avant_tournoi_premiers: [
    ["Le tournoi commence !", "Oui. Et il va falloir commencer par gagner ce match."],
    ["Première étape vers la gloire !", "Première étape vers le tour suivant, surtout."],
    ["Première bataille !", "C'est un premier tour, Roland."],
    ["Ils veulent marquer les esprits dès le premier tour !", "Ils pourraient déjà commencer par marquer un point."],
    ["Aujourd'hui peut naître une légende !", "Aujourd'hui peut surtout commencer un tournoi."],
    ["Il faut entrer dans ce tournoi avec panache !", "Avec efficacité, ce serait déjà pas mal."],
    ["Chaque victoire nous rapproche du titre !", "C'est généralement comme ça que fonctionnent les tournois."],
    ["Le public veut du spectacle !", "Les joueurs veulent surtout éviter l'élimination."],
  ],
  avant_tournoi_quarts: [
    ["ET NOUS Y VOILÀ ! Les quarts de finale !", "Voilà surtout les choses sérieuses."],
    ["Une victoire et les demi-finales sont à portée de main !", "Une défaite et ils sont à portée de sortie."],
    ["Le moindre geste peut tout changer !", "C'est généralement le principe du Pierre-Feuille-Ciseaux."],
    ["La tension monte !", "Chez vous surtout."],
    ["Ils ne sont plus qu'à deux victoires du titre !", "Et à une défaite de rentrer chez eux."],
    ["Nous entrons dans une nouvelle dimension !", "Nous entrons surtout en quart de finale."],
    ["Le tournoi prend une toute autre dimension !", "Oui. Maintenant, il faut vraiment savoir jouer."],
    ["Le moment est venu de sortir les grandes armes !", "Trois signes suffiront largement."],
  ],
  avant_tournoi_demis: [
    ["UNE SEULE VICTOIRE LES SÉPARE DE LA FINALE !", "Et une seule défaite les en sépare aussi."],
    ["Ils touchent au but !", "Pas encore. Ils sont en demi-finale."],
    ["Le titre commence à se rapprocher !", "Il faudra encore le gagner."],
    ["La tension est absolument incroyable !", "Vous êtes absolument incroyable, surtout."],
    ["Ce match pourrait entrer dans les mémoires !", "Ou être oublié demain matin."],
    ["Ils jouent pour une place en finale !", "Enfin une information intéressante."],
    ["Le rêve est à portée de main !", "La victoire aussi. Il faut juste choisir la bonne."],
    ["Nous sommes à deux doigts de vivre un moment exceptionnel !", "À condition qu'ils jouent exceptionnellement bien."],
  ],
  avant_tournoi_finale: [
    ["MESDAMES ET MESSIEURS… LA FINALE !", "Oui Roland. Enfin."],
    ["Deux joueurs ! Une victoire ! Un champion !", "Pour une fois, vous avez réussi à compter correctement."],
    ["La gloire est à portée de main !", "Encore faut-il avoir la bonne main."],
    ["Il n'en restera qu'un !", "C'est effectivement le principe d'une finale."],
    ["Le destin se joue maintenant !", "Non. La partie se joue maintenant."],
    ["Ils vont entrer dans la légende !", "Ils vont surtout essayer de gagner."],
  ],
  avant_majeur_quarts: [
    ["MESDAMES ET MESSIEURS, LE MONDE DU HANDSLAM RETIENT SON SOUFFLE !", "Vous pourriez déjà retenir le vôtre."],
    ["NOUS ENTRONS DANS UNE AUTRE DIMENSION !", "C'est toujours la même table, Roland."],
    ["CHAQUE MAIN PEUT CHANGER LE DESTIN DE CE TOURNOI !", "Oui. C'est justement pour ça qu'il faut bien la jouer."],
    ["LE NIVEAU EST EXCEPTIONNEL !", "Il est surtout meilleur que celui des premiers tours."],
    ["NOUS ASSISTONS À UN MOMENT HISTORIQUE !", "Vous dites ça depuis le début du tournoi."],
    ["LA PRESSION EST MONUMENTALE !", "Pour les joueurs, peut-être."],
    ["LE MOINDRE FAUX PAS SERA FATAL !", "Ça, au moins, c'est vrai."],
    ["LES QUARTS DE FINALE D'UN TOURNOI LÉGENDAIRE !", "Pour l'instant, c'est surtout un quart de finale."],
  ],
  avant_majeur_demis: [
    ["C'EST HISTORIQUE !", "Vous l'avez déjà dit."],
    ["LE DESTIN EST EN TRAIN DE S'ÉCRIRE SOUS NOS YEUX !", "Avec une pierre, une feuille et des ciseaux. Restons mesurés."],
    ["UNE SEULE VICTOIRE AVANT LA FINALE !", "Et c'est celle qui compte maintenant."],
    ["L'HISTOIRE ATTEND SON HÉROS !", "L'histoire attend surtout le vainqueur."],
    ["LA PRESSION EST INSOUTENABLE !", "Alors arrêtez de la supporter à leur place."],
    ["NOUS SOMMES À UNE MAIN DU SOMMET !", "Une mauvaise main, et ils en seront à une victoire de moins."],
  ],
  avant_majeur_finale: [
    ["MESDAMES ET MESSIEURS… LE MOMENT QUE L'HUMANITÉ ATTENDAIT !", "Je ne savais pas que l'humanité avait été consultée."],
    ["L'ULTIME COMBAT !", "C'est une finale, Roland. Pas une guerre."],
    ["DEUX CHAMPIONS ! UNE COURONNE ! UNE DESTINÉE !", "Et trois signes possibles. N'oubliez pas l'essentiel."],
    ["LE MONDE DU HANDSLAM EST SUSPENDU À CETTE MAIN !", "Le monde du HandSlam, peut-être. Moi, j'attends surtout de voir le choix."],
    ["CE SOIR, UN JOUEUR DEVIENDRA UNE LÉGENDE !", "Il peut déjà commencer par devenir champion."],
    ["ILS NE JOUENT PLUS POUR LA GLOIRE… ILS JOUENT POUR L'ÉTERNITÉ !", "Ils jouent surtout pour gagner cette finale."],
    ["LA MAIN DU DESTIN VA S'ABATTRE !", "C'est généralement comme ça qu'on appelle une main quand on veut faire peur aux gens."],
    ["NOUS Y SOMMES ! LE SOMMET ABSOLU DU HANDSLAM !", "Oui. Et maintenant, taisez-vous deux secondes."],
    ["QUE LE PLUS GRAND GAGNE !", "Non. Que le meilleur gagne. La taille n'a rien à voir là-dedans."],
    ["L'HISTOIRE VA S'ÉCRIRE !", "Elle s'écrira surtout dans le classement."],
  ],
  apres_entrainement_victoire: [
    ["Et voilà ! Une victoire pour commencer !", "Un entraînement réussi, surtout."],
    ["Quelle démonstration !", "C'était un entraînement, Roland."],
    ["Une victoire qui va donner énormément de confiance !", "Ou pas. Il n'y avait rien à perdre."],
    ["Magnifique prestation !", "Correcte."],
    ["Quel talent !", "Il faudra confirmer quand il y aura quelque chose à gagner."],
    ["Ils ont envoyé un message !", "À leur adversaire d'entraînement, surtout."],
    ["Une victoire qui restera dans les mémoires !", "Pas longtemps."],
    ["Quelle entrée en matière !", "C'était une sortie d'entraînement, surtout."],
  ],
  apres_entrainement_defaite: [
    ["Et quelle défaite !", "Justement. C'est à ça que servent les entraînements."],
    ["Il va falloir travailler après cette contre-performance !", "Voilà enfin quelque chose de sensé."],
  ],
  apres_tournoi_premiers_victoire: [
    ["ET C'EST UNE VICTOIRE !", "Premier tour validé."],
    ["Quelle entrée fracassante dans ce tournoi !", { t: "Il a gagné son premier match.", f: "Elle a gagné son premier match." }],
    ["Le message est envoyé à toute la concurrence !", "La concurrence n'a probablement pas tremblé."],
    ["Une victoire parfaitement maîtrisée !", "Suffisamment maîtrisée pour passer au tour suivant."],
    [{ t: "Le voilà lancé vers le titre !", f: "La voilà lancée vers le titre !" }, "Il lui reste quelques matchs avant ça."],
    ["Quelle démonstration !", "Démonstration est un grand mot."],
  ],
  apres_tournoi_premiers_defaite: [
    ["Une défaite dès le premier tour ! Quel coup de tonnerre !", { t: "Pas vraiment. Il a perdu. Ça arrive.", f: "Pas vraiment. Elle a perdu. Ça arrive." }],
    ["C'est déjà terminé !", { t: "Pour lui, oui. Pour le tournoi, non.", f: "Pour elle, oui. Pour le tournoi, non." }],
    ["Quel dommage !", "Il faudra faire mieux au prochain tournoi."],
    ["Une élimination terrible !", "Terrible, non. Décevante, oui."],
  ],
  apres_tournoi_quarts_victoire: [
    [{ t: "IL EST EN DEMI-FINALE !", f: "ELLE EST EN DEMI-FINALE !" }, { t: "Oui. Il a gagné son quart.", f: "Oui. Elle a gagné son quart." }],
    ["Quelle bataille incroyable !", "Serrée, surtout."],
    [{ t: "Il n'est plus qu'à une victoire de la finale !", f: "Elle n'est plus qu'à une victoire de la finale !" }, { t: "Et c'est la prochaine qu'il doit gagner.", f: "Et c'est la prochaine qu'elle doit gagner." }],
    ["Quel sang-froid exceptionnel !", { t: "Il a fait ce qu'il fallait.", f: "Elle a fait ce qu'il fallait." }],
    ["Une victoire qui pourrait tout changer !", "Elle change surtout le prochain adversaire."],
    [{ t: "Il vient de franchir un obstacle monumental !", f: "Elle vient de franchir un obstacle monumental !" }, "Un quart de finale, Roland."],
  ],
  apres_tournoi_quarts_defaite: [
    ["Quelle terrible élimination en quarts !", { t: "Il était à une victoire de la demi-finale. Il n'a pas réussi.", f: "Elle était à une victoire de la demi-finale. Elle n'a pas réussi." }],
    ["Le rêve s'arrête ici !", "Pour aujourd'hui, oui."],
    [{ t: "Il était si proche !", f: "Elle était si proche !" }, "Pas assez proche pour gagner."],
    ["Une énorme désillusion !", "Une défaite en quart. Ça fait partie du sport."],
  ],
  apres_tournoi_demis_victoire: [
    [{ t: "IL EST EN FINALE !", f: "ELLE EST EN FINALE !" }, "Et maintenant, il va falloir la gagner."],
    ["QUEL EXPLOIT !", "Une très bonne victoire, oui."],
    [{ t: "Il touche le titre du bout des doigts !", f: "Elle touche le titre du bout des doigts !" }, "Attention à ne pas le toucher trop tôt."],
    ["Quelle maîtrise dans ce moment décisif !", "C'est exactement ce qu'on attend d'un joueur à ce niveau."],
    [{ t: "Il vient de renverser le tournoi !", f: "Elle vient de renverser le tournoi !" }, { t: "Il vient surtout de gagner sa demi-finale.", f: "Elle vient surtout de gagner sa demi-finale." }],
    ["LE RÊVE CONTINUE !", "Pour encore un match."],
  ],
  apres_tournoi_demis_defaite: [
    ["Quelle terrible défaite !", { t: "Il était à une victoire de la finale. C'est forcément décevant.", f: "Elle était à une victoire de la finale. C'est forcément décevant." }],
    ["Le rêve s'effondre !", "Il faudra se relever."],
    ["Si près du but !", "Et pourtant si loin."],
    ["Une élimination cruelle !", "Les demi-finales ne pardonnent pas."],
  ],
  apres_tournoi_finale_victoire: [
    [{ t: "IL EST CHAMPION !", f: "ELLE EST CHAMPIONNE !" }, "Oui. Cette fois, vous pouvez vous emballer."],
    ["QUEL TRIOMPHE !", "Une victoire méritée."],
    [{ t: "IL ENTRE DANS LA LÉGENDE !", f: "ELLE ENTRE DANS LA LÉGENDE !" }, { t: "Il vient surtout de gagner le tournoi.", f: "Elle vient surtout de gagner le tournoi." }],
    ["UNE VICTOIRE POUR L'ÉTERNITÉ !", "Pour le classement, déjà."],
    [{ t: "QUELLE FINALE ! QUEL CHAMPION !", f: "QUELLE FINALE ! QUELLE CHAMPIONNE !" }, { t: "Il a fait ce qu'il fallait au bon moment.", f: "Elle a fait ce qu'il fallait au bon moment." }],
    [{ t: "LE TROPHÉE EST À LUI !", f: "LE TROPHÉE EST À ELLE !" }, "Et personne ne pourra le lui enlever."],
  ],
  apres_tournoi_finale_defaite: [
    ["Quel terrible dénouement !", "Une finale perdue, ça fait toujours mal."],
    [{ t: "Il était si proche de la gloire !", f: "Elle était si proche de la gloire !" }, "Et son adversaire était plus proche encore."],
    ["Le rêve s'écroule au dernier moment !", "C'est précisément pour ça qu'on joue les finales."],
    ["Quelle désillusion !", "Oui. Mais deuxième d'un tournoi, ce n'est pas exactement une catastrophe."],
  ],
  apres_majeur_quarts_victoire: [
    [{ t: "IL VIENT DE RÉALISER UN EXPLOIT MAJEUR !", f: "ELLE VIENT DE RÉALISER UN EXPLOIT MAJEUR !" }, "Une victoire en quart. C'est important, oui."],
    ["QUELLE PERFORMANCE EXCEPTIONNELLE !", { t: "Il a été solide.", f: "Elle a été solide." }],
    [{ t: "IL EST DÉSORMAIS À DEUX MATCHS DE L'IMMORTALITÉ !", f: "ELLE EST DÉSORMAIS À DEUX MATCHS DE L'IMMORTALITÉ !" }, "À deux victoires du titre, surtout."],
    ["LE PUBLIC EST EN DÉLIRE !", { t: "Et lui peut commencer à respirer.", f: "Et elle peut commencer à respirer." }],
    ["CETTE VICTOIRE VA RESTER DANS L'HISTOIRE !", "Peut-être. Gagnons déjà le prochain."],
  ],
  apres_majeur_quarts_defaite: [
    ["QUELLE ÉLIMINATION ! LE TOURNOI EST TERMINÉ !", { t: "Oui. Mais il atteint quand même les quarts d'un gros tournoi.", f: "Oui. Mais elle atteint quand même les quarts d'un gros tournoi." }],
    ["LE RÊVE S'ARRÊTE BRUTALEMENT !", { t: "Il s'arrête en quart. Ce n'est pas rien.", f: "Elle s'arrête en quart. Ce n'est pas rien." }],
    ["QUELLE TERRIBLE DÉSILLUSION !", { t: "Il a perdu contre un meilleur joueur aujourd'hui.", f: "Elle a perdu contre un meilleur joueur aujourd'hui." }],
  ],
  apres_majeur_demis_victoire: [
    [{ t: "IL EST EN FINALE D'UN TOURNOI MAJEUR !", f: "ELLE EST EN FINALE D'UN TOURNOI MAJEUR !" }, "Et là, oui, c'est une vraie performance."],
    [{ t: "IL VIENT D'ÉCRIRE UNE PAGE DE L'HISTOIRE DU HANDSLAM !", f: "ELLE VIENT D'ÉCRIRE UNE PAGE DE L'HISTOIRE DU HANDSLAM !" }, "Une belle page. Mais le livre n'est pas terminé."],
    ["QUEL EXPLOIT ABSOLUMENT EXTRAORDINAIRE !", "C'était très solide."],
    [{ t: "IL N'EST PLUS QU'À UNE VICTOIRE DE LA GLOIRE ÉTERNELLE !", f: "ELLE N'EST PLUS QU'À UNE VICTOIRE DE LA GLOIRE ÉTERNELLE !" }, "Une victoire, oui. Éternelle, on verra."],
    [{ t: "IL A SURVÉCU À UNE DEMI-FINALE DANTESQUE !", f: "ELLE A SURVÉCU À UNE DEMI-FINALE DANTESQUE !" }, { t: "Il a gagné. C'est le principal.", f: "Elle a gagné. C'est le principal." }],
  ],
  apres_majeur_demis_defaite: [
    ["QUELLE DÉFAITE ! LE RÊVE EST BRISÉ !", { t: "Il perd en demi-finale d'un gros tournoi. Ça reste une très belle performance.", f: "Elle perd en demi-finale d'un gros tournoi. Ça reste une très belle performance." }],
    [{ t: "IL ÉTAIT À UNE SEULE VICTOIRE DE LA FINALE !", f: "ELLE ÉTAIT À UNE SEULE VICTOIRE DE LA FINALE !" }, "Et son adversaire aussi."],
    ["UNE ÉLIMINATION TERRIBLEMENT CRUELLE !", "Cruelle, oui. Mais pas injuste."],
  ],
  apres_majeur_finale_victoire: [
    [{ t: "IL EST CHAMPION ! CHAMPION DU MONDE DU HANDSLAM !", f: "ELLE EST CHAMPIONNE ! CHAMPIONNE DU MONDE DU HANDSLAM !" }, "Là, Roland… vous pouvez crier."],
    [{ t: "IL VIENT D'ENTRER DANS LA LÉGENDE !", f: "ELLE VIENT D'ENTRER DANS LA LÉGENDE !" }, { t: "Aujourd'hui, oui. Il l'a mérité.", f: "Aujourd'hui, oui. Elle l'a mérité." }],
    [{ t: "QUEL TRIOMPHE ! QUELLE PERFORMANCE ! QUEL CHAMPION !", f: "QUEL TRIOMPHE ! QUELLE PERFORMANCE ! QUELLE CHAMPIONNE !" }, "Une finale parfaitement maîtrisée."],
    ["LA MAIN DU DESTIN A PARLÉ !", "Non. Sa main a simplement été meilleure."],
    [{ t: "IL A ÉCRIT L'HISTOIRE SOUS NOS YEUX !", f: "ELLE A ÉCRIT L'HISTOIRE SOUS NOS YEUX !" }, "Et cette fois, je suis d'accord avec vous."],
    ["UNE VICTOIRE POUR L'ÉTERNITÉ !", "Une victoire qui restera longtemps, oui."],
    ["LE PUBLIC EST EN FUSION ! LE HANDSLAM EST EN FÊTE !", { t: "Et il peut profiter. Ce genre de victoire ne se présente pas tous les jours.", f: "Et elle peut profiter. Ce genre de victoire ne se présente pas tous les jours." }],
    ["QUELLE SOIRÉE HISTORIQUE !", "Oui. Et pour une fois, je vous laisse le dire."],
  ],
  apres_majeur_finale_defaite: [
    ["QUELLE DÉFAITE ! QUELLE DÉSILLUSION !", "Perdre une grande finale fait mal. Mais arriver jusqu'ici reste remarquable."],
    [{ t: "IL ÉTAIT À UNE MAIN DU SACRE !", f: "ELLE ÉTAIT À UNE MAIN DU SACRE !" }, "Et son adversaire avait exactement la même main."],
    ["LE TROPHÉE LUI ÉCHAPPE AU DERNIER MOMENT !", "C'est le principe d'une finale. Un seul repart avec."],
    ["UNE FIN TERRIBLE POUR UN PARCOURS EXCEPTIONNEL !", "Deuxième d'un grand tournoi. Il y a pire comme fin."],
    ["LE MONDE DU HANDSLAM EST EN DEUIL !", { t: "Roland… il a perdu une finale, pas son bras.", f: "Roland… elle a perdu une finale, pas son bras." }],
    [{ t: "IL TOUCHAIT DU DOIGT L'IMMORTALITÉ !", f: "ELLE TOUCHAIT DU DOIGT L'IMMORTALITÉ !" }, { t: "Et maintenant il touchera probablement son réveil demain matin.", f: "Et maintenant elle touchera probablement son réveil demain matin." }],
  ],
  fin_set: [
    ["Madame, un mot sur ce set ?", "Solide. Sans génie. Mais solide."],
    ["Un set parfait ! Comme vous en 1997, Madame !", "N'en parlons pas."],
    [{ t: "Qu'est-ce qu'il doit changer ?", f: "Qu'est-ce qu'elle doit changer ?" }, "Tout. Ou rien. C'est ça, le HandSlam."],
    [{ t: "Il doit tout changer, Madame !", f: "Elle doit tout changer, Madame !" }, "Vaste programme."],
  ],
  set_decisif: [
    ["Un set pour l'éternité, Madame !", "Un set pour ce soir. Ce sera déjà bien."],
  ],
  titre: [
    ["Madame, c'est historique !", "Pas d'enflammade. Pas d'enflammade."],
  ],
  // après une défaite
  fin_match: [
    [{ t: "Il n'a pas démérité !", f: "Elle n'a pas démérité !" }, "Si. Un peu quand même."],
    ["Quel combat, Madame !", "Un combat. Perdu. Mais un combat."],
    [{ t: "Il peut sortir la tête haute !", f: "Elle peut sortir la tête haute !" }, { t: "Il peut sortir. C'est déjà ça.", f: "Elle peut sortir. C'est déjà ça." }],
  ],
  // Un joueur vient de pousser son cri de victoire (voir celebrations.js).
  cri: [
    ["Ah, il y a de la voix !", "On l'avait entendu."],
    [{ t: "Il a craqué son slip !", f: "Elle a craqué son slip !" }, "Attention que ça ne vous arrive pas."],
    [{ t: "Il éructe de joie !", f: "Elle éructe de joie !" }, "La prochaine fois, prévoyez les boules Quies."],
    ["Siuuuu !", "C'est Ronaldo sans les abdos."],
  ],
};

// ---------------------------------------------------------------- le speaker
// Les joueurs sont présentés par leur côté et leur surnom (voir surnoms.js).
export const SPEAKER = {
  // A. L'accueil (docs/speaker-brouillon.md, validé)
  bienvenue: [
    "Mesdaaames et messieuuurs… bienvenue pour ce duel !",
    "Mesdames et messieurs, veuillez regagner vos places. Le match va commencer.",
    "Mesdames et messieurs… bonsoir, et bienvenue sur le court central !",
    "Le public est là… les joueurs sont là… il ne manque plus que le premier signe !",
    "Mesdames et messieurs… éteignez vos téléphones. Enfin… pas celui-là.",
    "Bienvenue dans le temple du Pierre-Feuille-Ciseaux !",
    "Mesdames et messieurs, faites du bruit pour le prochain duel !",
    "Silence dans les tribunes… les joueurs entrent sur le court.",
  ],
  // B. La situation du match (juste après l'accueil, quand elle s'applique)
  revanche: ["Ils se sont déjà affrontés… et ils se retrouvent ce soir !", "Le match retour, mesdames et messieurs !", "Une revanche est dans l'air…"],
  david_goliath: ["David… contre Goliath !", "Sur le papier, c'est déséquilibré. Mais on ne joue pas sur le papier !"],
  coude_a_coude: ["Deux joueurs au coude à coude au classement… impossible de faire un pronostic !"],
  compatriotes: ["Un duel entre compatriotes ! Il n'y aura pas de jaloux."],
  nuit: ["Il est tard, mesdames et messieurs… mais le Pierre-Feuille-Ciseaux ne dort jamais !", "Bienvenue aux noctambules !"],
  matin: ["Un duel au lever du soleil ! Les champions se lèvent tôt."],
  dimanche: ["Le match du dimanche, mesdames et messieurs !"],
  partie_rapide: ["Deux joueurs… un appariement… et c'est parti !", "Ils ne se connaissaient pas il y a trente secondes. Ils vont s'affronter maintenant !"],
  officiel: ["Attention : ce match compte pour le classement officiel !", "Des points de niveau sont en jeu ce soir…"],
  un_set: ["Un seul set… aucune seconde chance !"],
  marathon: ["Trois sets gagnants… installez-vous confortablement, ce sera un marathon !"],
  contre_bot: ["Un humain… contre la machine !"],
  // C. Les coins
  coin_jaune: ["Dans le coin jaaaune…", "À ma gauche… dans le coin jaaaune…", "Côté jaune… accueillez…"],
  coin_rouge: ["Et dans le coin rouuuge…", "Et à ma droite… dans le coin rouuuge…", { t: "Face à lui… côté rouge…", f: "Face à elle… côté rouge…" }],
  // (C bis : « Côté jaune, on retrouve… », la présentation des surnoms par Roland, abandonnée le 3 novembre.)
  // D. Ce qu'on dit d'un joueur (avant son surnom)
  debutant: [{ t: "Pour son tout premier match officiel…" }],
  invaincu: [{ t: "Invaincu depuis trois rencontres…", f: "Invaincue depuis trois rencontres…" }],
  serie: ["Sur une série de victoires impressionnante…"],
  imprevisible: [{ t: "On le dit imprévisible. On le dit dangereux…", f: "On la dit imprévisible. On la dit dangereuse…" }],
  figuration: [{ t: "Il ne vient pas pour faire de la figuration…", f: "Elle ne vient pas pour faire de la figuration…" }],
  trophee: [{ t: "Il a déjà soulevé un trophée…", f: "Elle a déjà soulevé un trophée…" }],
  habitue: ["Un habitué des grands rendez-vous…"],
  laver_affront: [{ t: "Il revient pour laver l'affront…", f: "Elle revient pour laver l'affront…" }],
  patron: ["Le patron de la soirée…"],
  faim: [{ t: "Il a faim de victoire…", f: "Elle a faim de victoire…" }],
  // E. La clôture
  cloture: ["Que le meilleur gagne !", "Que le spectacle commence !", "Joueurs… à vos mains !", "Trois signes… deux joueurs… un seul vainqueur !",
    "Mesdames et messieurs… que le duel commence !", "Pierre… Feuille… Ciseaux… c'est parti !"],
  // F. Inchangé
  miroir: ["Mesdames et messieurs… ce soir, c'est un duel de jumeaux.", "Même surnom… même ambition… un seul vainqueur !", "Deux surnoms identiques. Il n'en restera qu'un."],
  huitiemes: ["Place aux huitièmes de finale !"],
  quarts: ["Place aux quarts de finale !"],
  demis: ["Place aux demi-finales !"],
  finale: ["Mesdames et messieurs… voici… la finaaale !"],
  sit_and_go: ["Les portes sont fermées. Le tournoi commence. Un seul sortira vainqueur."],
  champion: ["Mesdames et messieurs… votre champion !"],
};
// Les bots, annoncés par leur nom.
export const NOMS_BOTS = { bambi: "Bambi !", papyrus: "Papyrus !", tictac: "Tic-Tac !", rancune: "Rancune !", bluffeur: "Le Bluffeur !",
  mante: "La Mante !", nemesis: "Némésis !", titan: "Titan !", rocky: "Rocky !", miroir: "Miroir !", cyclo: "Cyclo !", boomerang: "Boomerang !", chaos: "Chaos !", stratege: "Stratège !", professeur: "Le Professeur !" };

// ---------------------------------------------------------------- le journaliste (après une finale gagnée)
export const JOURNALISTE = {
  question: [
    "Félicitations. Que ressentez-vous ?",
    "À quel moment avez-vous senti que le titre était pour vous ?",
    "Un mot pour votre adversaire ?",
    "On vous a vu jouer beaucoup de signes ce soir. C'était prévu ?",
    "Qu'allez-vous faire maintenant ?",
  ],
  // au finaliste battu
  question_defaite: ["Une finale perdue… Que retiendrez-vous de cette soirée ?"],
  conclusion: ["Merci. Et encore bravo.", "C'était… un honneur. À vous les studios."],
};
// Les réponses du joueur (texte seulement, pas de voix).
export const REPONSES_INTERVIEW = [
  "Je n'ai fait que jouer mon jeu.",
  "Le Pierre, c'est une philosophie.",
  "Je dédie cette victoire à ma mère.",
  "Je dédie cette victoire à ma grand-mère.",
  "Je dédie cette victoire à mon chat.",
  "Je dédie cette victoire à mon chien.",
  "Je savais. Depuis le premier signe, je savais.",
  "Respect à mon adversaire. Digne. Pas assez, mais digne.",
  "Je ne commente pas les Ciseaux.",
  "C'est une victoire collective. Même en solo.",
  "Je vous ai compris.",
];
export const REPONSES_DEFAITE = [
  "Non, je ne regrette rien.",
  "Je reviendrai.",
  "Bravo à mon adversaire. Enfin… bravo.",
  "Je n'ai pas envie d'en parler.",
];
