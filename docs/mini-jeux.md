# Chifoumania — Mini-jeux

Les idées de mini-jeux de l'onglet **Mini-jeux** du menu Chifoumania (voir [`invaders.md`](invaders.md)).
Rien n'est programmé pour l'instant : ce fichier garde les règles décidées avec le porteur du projet.

## L'Arène Pierre-Feuille-Ciseaux (idée du porteur du projet, 23 octobre)

Un duel de réflexion : on prépare son arsenal en secret, on en montre une partie, on compte ce que l'adversaire a déjà joué et on choisit le bon moment pour utiliser la loupe. Environ 2 minutes par partie.

### Les règles décidées (23 octobre)
1. **L'arsenal** : avant le duel, chaque joueur choisit **9 signes**, pierre, feuille ou ciseaux, avec **au moins un de chaque**. Toutes les répartitions sont permises tant qu'il y a au moins un de chaque : 3-3-3, 5-2-2, et même 1-1-7.
2. **La révélation** : chaque joueur **montre obligatoirement 3 signes** de son arsenal à l'adversaire, choisis par lui. Ce sont de vrais signes de son arsenal. Les 6 autres restent secrets. Les signes montrés ne sont pas forcément joués en premier.
3. **Le combat** : **7 coups**. À chaque coup, chacun choisit un signe de son arsenal, les deux sont dévoilés en même temps, et le résultat suit les règles classiques (la pierre bat les ciseaux, les ciseaux battent la feuille, la feuille bat la pierre). Un signe joué est dépensé. Les **2 signes qui restent** à la fin ne sont jamais montrés : le doute dure jusqu'au dernier coup.
4. **La victoire** : 1 point par coup gagné ; une égalité ne rapporte rien (les deux signes sont quand même dépensés). Le joueur qui a le plus de points après les 7 coups gagne.
5. **En cas d'égalité à la fin** : on rejoue avec **les 2 signes qui restent** à chacun (jusqu'à 2 coups de plus). Si c'est encore égal, on finit en **pierre-feuille-ciseaux classique** (libre choix) jusqu'à ce que quelqu'un gagne un coup.
6. **La loupe** : une seule fois par partie, elle **révèle un signe de l'adversaire qu'il n'a pas encore montré** (ni révélé au départ, ni joué). Elle ne retire pas ce signe et ne le bloque pas : l'adversaire peut même le garder parmi ses 2 signes qui ne seront pas joués.
7. **L'adversaire** : **l'ordinateur d'abord**, puis **le jeu en ligne** ensuite. Pas de jeu à deux sur le même téléphone (décision du porteur du projet).

### À décider
- **Jusqu'à quand la loupe est permise** : interdite pendant les **2** derniers coups (permise jusqu'au coup 5) ou pendant les **3** derniers (jusqu'au coup 4). Conseil de Claude : **2**. Avec 7 coups sur 9 signes, il reste toujours 2 signes qui ne seront pas joués, donc même tard l'information n'est pas une certitude ; avec 3, on ne pourrait s'en servir qu'au début, quand elle apporte peu, et tout le monde la jouerait au coup 4.
- **La loupe pendant les coups de départage** : conseil de Claude, non (ce sont des coups bonus).
- **Le jeu en ligne** : il faudra un serveur et des comptes de joueurs (celui de HandSlam pourrait servir). Décision qui coûte du travail et qui est difficile à défaire : à prendre avec le porteur du projet le moment venu.

### Conseils pour la réalisation (avis de Claude, 23 octobre)
- **Montrer l'arsenal connu de l'adversaire** à l'écran : ses 3 signes révélés, les signes qu'il a déjà joués (barrés) et le nombre de signes encore inconnus. Le jeu doit être une affaire de réflexion, pas de mémoire.
- **L'ordinateur** : lui donner plusieurs caractères, par exemple le prudent (3-3-3), le bourrin (beaucoup de pierres), le bluffeur (il révèle exprès ses signes les plus nombreux, ou au contraire les plus rares), le compteur (il joue ce qui bat les signes qu'il te reste).
- Plus tard, on pourra ajouter d'autres pouvoirs que la loupe.

## Le Duel à découvert (idée du porteur du projet, 23 octobre ; nom provisoire)

Un mini-jeu à part, de la même famille que l'Arène : **les deux joueurs reçoivent le même arsenal de 9 signes, imposé et tiré au sort à chaque partie** (par exemple 6 pierres, 2 feuilles et 1 ciseau pour les deux). Pas de phase de préparation : on joue tout de suite.

### Les règles de base
1. **L'arsenal** : le jeu tire au sort une répartition de 9 signes (au moins un de chaque) et la donne aux deux joueurs.
2. **Le combat** : 7 coups, comme dans l'Arène. Un signe joué est dépensé ; 2 signes restent à la fin.
3. **La victoire et l'égalité** : comme dans l'Arène (1 point par coup gagné ; en cas d'égalité, départage avec les signes restants, puis pierre-feuille-ciseaux classique).
4. **Tout est connu** : chacun sait exactement ce qu'il reste à l'autre à chaque coup. Il n'y a ni révélation ni loupe : c'est un pur duel de calcul et de lecture de l'adversaire.

### Variante proposée : 2 signes écartés en secret
Pour retrouver le bluff et la loupe : au début, **chaque joueur écarte en secret 2 de ses 9 signes**, puis joue les 7 autres. L'adversaire ne sait pas lesquels ont été écartés. Une fois par partie, la **loupe** révèle un des signes écartés par l'autre. Pas encore calculé (les informations cachées rendent le calcul exact beaucoup plus lourd), mais c'est la version qui semble la plus stratégique.

### Ce que disent les calculs (Claude, 23 octobre)
Calcul exact de la meilleure façon de jouer (théorie des jeux), pour chaque arsenal imposé :

| Arsenal imposé (P-F-C) | Un joueur parfait gagne contre un joueur qui pioche au hasard… |
|---|---|
| 7-1-1 | 80 % des parties |
| 6-2-1 | 73 % |
| 5-2-2 | 70 % |
| 4-4-1 et 5-3-1 | 69 % |
| 4-3-2 | 66 % |
| 3-3-3 | 64 % |

- **Plus l'arsenal est déséquilibré, plus la réflexion compte** (avec 7 pierres sur 9, chacun doit en jouer au moins 5 en 7 coups : savoir quand placer sa feuille et son ciseau devient une énigme). Les tirages déséquilibrés donnent les parties les plus riches.
- **Être prévisible est puni** : un joueur qui suit une règle fixe (par exemple « je joue toujours ce qui bat son signe le plus nombreux ») perd toutes ses parties contre un joueur qui l'a compris.
- Entre deux joueurs parfaits, c'est 50/50 (mêmes signes des deux côtés) : le jeu est parfaitement équitable.

### Points forts
- Équitable (mêmes signes pour les deux), simple à expliquer, et chaque partie est différente.
- Le **défi du jour** en découle naturellement : le même arsenal pour tout le monde, chaque jour.
- Comme pour l'Arène : contre l'ordinateur d'abord ; le jeu en ligne plus tard.

## La Conquête (proposition de Claude, 23 octobre ; retenue par le porteur du projet)

Un mini-jeu de logique et de stratégie inspiré du **Goofspiel** (« jeu de stratégie pure », étudié par le mathématicien Merrill Flood dans les années 1950 ; le jeu de société *Raj* / *Hol's der Geier* d'Alex Randolph en est une version connue). Les deux joueurs se disputent des trophées de valeurs différentes : la question n'est plus seulement « quel signe jouer ? », mais **« quand jouer quel signe »**.

### Les règles
1. **L'arsenal** : les deux joueurs reçoivent **le même arsenal de 9 signes**, tiré au sort (au moins un de chaque), comme dans le Duel à découvert. Tout est connu : chacun sait ce qu'il reste à l'autre.
2. **Les trophées** : **7 trophées de 1 à 7 points**, mélangés. À chaque tour, on retourne celui du dessus : tout le monde voit sa valeur avant de jouer.
3. **Le coup** : chacun choisit un signe en même temps ; le gagnant prend le trophée. Un signe joué est dépensé (7 coups, 2 signes restent).
4. **La cagnotte** : en cas d'égalité, le trophée reste en jeu et **s'ajoute au suivant** (égalité sur le 3, puis le 6 est retourné : le coup suivant vaut 9). Au dernier tour, une égalité fait perdre le trophée.
5. **La victoire** : 28 points en tout ; **le premier à 15 points gagne**, même avant la fin. À 14 partout : départage comme dans l'Arène (avec les signes restants, puis pierre-feuille-ciseaux classique).

### Ce qui en fait un jeu de logique
- **Le signe imprenable** : quand l'adversaire n'a plus de ciseaux, ta feuille ne peut plus perdre (seulement gagner ou faire égalité). Il faut provoquer ces situations et les garder pour les gros trophées.
- **Le sacrifice** : perdre exprès un petit trophée avec un signe peu utile, pour garder ses bons signes.
- **La cagnotte** : faire égalité exprès pour faire grossir le coup suivant, quand on sera mieux placé ensuite.
- **La course aux 15** : à 12 points, un trophée de 3 suffit ; l'écart au score change la bonne façon de jouer.

### Ce que disent les calculs (Claude, 23 octobre)
Stratégie parfaite calculée exactement (théorie des jeux), arsenal 3-3-3 :
- **Avec 7 trophées de 1 à 7** : un joueur parfait gagne **70 %** des parties contre un joueur qui joue au hasard (65 % avec 5 trophées ; 64 % dans le Duel à découvert sans trophées, même arsenal). Les trophées ajoutent donc de la stratégie. Entre deux joueurs parfaits : 50/50, le jeu est équitable.
- Au premier coup, la stratégie parfaite joue chaque signe une fois sur trois (les deux joueurs ont exactement les mêmes signes) ; les vraies décisions arrivent dès que les arsenaux restants diffèrent.
- **La bonne décision dépend du trophée en jeu** (exemple calculé sur la version à 5 trophées) : l'adversaire n'a plus de ciseaux, ta feuille est imprenable ; sur un trophée de 1, la stratégie parfaite joue la pierre à 100 % (elle garde la feuille) ; sur un trophée de 5, la feuille à 75 %.
- **Elle dépend aussi du score** : dans une même position, avec le même trophée de 5, on ne joue pas pareil selon qu'on mène ou qu'on est mené de 4 points.

### Pour plus tard
- **Le trophée maudit** (idée tirée de *Raj*) : un trophée de **−3 points**, que prend **le perdant du coup**. Pour une fois, tout le monde veut perdre : la logique s'inverse.
- **L'ordinateur** : le jeu est assez petit pour calculer la stratégie parfaite exacte, d'où de vrais niveaux : facile (au hasard), moyen (mélange), expert (stratégie parfaite, imbattable sur la durée mais battable sur une partie).
- Comme pour l'Arène : contre l'ordinateur d'abord ; le jeu en ligne plus tard.
