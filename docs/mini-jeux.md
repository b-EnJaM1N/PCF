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

## Le Duel à mises (idée du porteur du projet, 23 octobre)

Un mini-jeu pensé pour **jouer contre un humain** : repérer ses habitudes et miser gros quand on est presque sûr de ce qu'il va jouer.

### Les règles retenues (23 octobre)
1. **Un match en 15 points**, en un seul set : chaque coup gagné rapporte **1 point** ; le premier à 15 gagne.
2. **3 coups doubles** par joueur pour tout le match : en même temps que son signe, on peut annoncer un **×2** (révélé avec les signes).
3. **Avec risque** : un coup où au moins un joueur a annoncé un ×2 vaut **2 points pour celui qui le gagne**, même si c'est l'adversaire qui avait sorti le jeton. Se tromper coûte cher.
4. **Égalité** : personne ne marque, et un ×2 annoncé est rendu (il n'est pas perdu).
5. **À l'écran** : les coups doubles qui restent à chacun, et l'historique des derniers signes de l'adversaire (c'est ce qui permet de le « lire »).

### Comment on en est arrivé là (analyse de Claude, 23 octobre)
- **La première idée** (signe + mise de 1, 2 ou 3 à chaque manche, premier à 10) : contre un adversaire qui varie ses signes au hasard, on a toujours 1 chance sur 3 de gagner, quelle que soit la mise ; la mise ne change que la taille des gains et des pertes. Le calcul exact montre qu'il y a presque toujours une seule bonne mise selon le score (mené : 3 ; en tête : 2 ; proche de 0 : 1) : plus de vraie décision. Testé sans succès : « égalité de signe, la plus grosse mise gagne » (tout le monde mise 3), mises de 3 limitées (change à peine les chances), mises avec un arsenal limité (tout le monde mise 3).
- **La bonne direction** (idée du porteur du projet) : le jeu sert à **lire un humain**, et **limiter les grosses mises** oblige à choisir ses moments de certitude.
- **Le choix de la formule** (simulation de 120 000 matchs entre deux joueurs aussi bons lecteurs l'un que l'autre, l'un plaçant ses jetons sur ses moments de certitude, l'autre au hasard ; modèle simplifié, pour comparer les formules entre elles) :

| Formule (match en 11) | Le joueur qui place bien ses jetons gagne | Remontées (vainqueur mené de 3 ou plus) | Coups décidés |
|---|---|---|---|
| aucun jeton | 50 % | 19 % | 18 |
| ×2 + ×3 | 60 % | 26 % | 13 |
| **×2 ×2 ×2** | **61 %** | 23 % | 14 |
| ×2 ×2 ×2 ×2 | 63 % | 24 % | 13 |
| ×3 ×3 | 63 % | 28 % | 12 |

  Plus il y a de jetons, plus leur bon usage paie, mais plus le match raccourcit et plus les jetons écrasent les coups normaux. **3 jetons de 2** : aussi bien que ×2 + ×3, plus simple (tous pareils : la seule question est *quand*), et le match reste un vrai match.
- **Match en 15 plutôt qu'en 11** (choix du porteur du projet, pour un match un peu plus long) : avec 3 coups doubles, environ **21 coups décidés** (14 en 11 points), le bon usage des jetons rapporte toujours (**59 %** contre 50 %), et il y a plus de remontées (**30 %**).

### Variantes possibles
- **Mode « Folie »** : ×2 ×2 ×3 (plus de suspense, matchs plus courts).
- **Version courte** : 5 manches, départ à 10 points, 2 « jetons d'or » (mise 3), les autres manches à 2 ; le plus de points gagne (un bon lecteur passe de 56 % à 66 % de victoires en gardant ses jetons pour ses moments de certitude).

### Pour l'ordinateur
Il ne doit pas jouer parfaitement au hasard (impossible à lire) : lui donner des **habitudes humaines** repérables (rejouer le signe qui vient de gagner, changer après une défaite, préférer la pierre sous pression, sortir ses coups doubles quand il est mené…), avec des niveaux selon qu'il les cache plus ou moins bien.

## Dégaine ! (idée du porteur du projet, 23 octobre ; nom proposé par Claude)

Un mini-jeu **de hasard et de lecture**, rapide, dans un **décor de Far West** : le joueur rencontre des adversaires l'un après l'autre et les affronte en **un seul coup** de pierre-feuille-ciseaux. Le but : **aller le plus loin possible** et battre son record. Facile à programmer : un bon premier mini-jeu pour lancer l'onglet.

### Les règles
1. **Un duel = un coup** : chacun dégaine un signe en même temps. **Égalité : on rejoue.**
2. **Gagné** : l'adversaire est éliminé et un nouveau se présente. **Perdu** : on perd une vie.
3. **3 vies** (3 chapeaux) ; la partie s'arrête quand on n'en a plus. Bonus possible : « un verre au saloon » rend une vie tous les 5 adversaires battus.
4. **Le score** : le nombre d'adversaires battus ; le record est gardé sur le téléphone.
5. **L'historique visible des deux côtés** (idée du porteur du projet) : quand un nouvel adversaire arrive, on voit les signes qu'il a joués dans ses derniers duels ; et lui voit les tiens. C'est ce qui transforme le hasard en lecture.

### Les maths (Claude, 23 octobre)
- Contre un adversaire qui joue au hasard (égalité rejouée), chaque duel se gagne **1 fois sur 2**. Avec une seule vie : la moitié des parties s'arrêtent au premier duel, 1 adversaire battu en moyenne, 5 d'affilée dans 3 % des parties, 10 d'affilée dans 1 partie sur 1 000 (de vrais exploits à partager, mais des parties très courtes).
- **Avec 3 vies** : 3 adversaires battus en moyenne par partie, moins décourageant.

### Les adversaires (l'ordinateur)
- Chacun a **une habitude** qu'on peut deviner en regardant son historique : le Shérif rejoue toujours son signe gagnant, la Joueuse de poker change après chaque victoire, le Bandit préfère la pierre quand il est pressé, etc. Plus on avance, mieux ils cachent leurs habitudes.
- Ils **lisent aussi ton historique** : si tu joues toujours pierre, les suivants finiront par sortir la feuille. Il faut varier.

### Pour plus tard
- **Les « fantômes »** (en ligne) : l'adversaire rencontré est la vraie partie enregistrée d'un autre joueur, avec ses vrais coups. Du multijoueur sans être connectés en même temps ; il faudra un serveur (à décider le moment venu).
- **Le duel à mort** (idée tirée des trois portes, facultative) : avant certains duels, choisir entre un duel normal (égalité = on rejoue) et un duel à mort (égalité = perdu) qui compte double pour le record.

## Idée écartée : les trois portes (23 octobre)
Trois portes (pierre, feuille, ciseaux), on choisit une porte et un signe ; si on gagne, porte suivante ; le premier échec arrête la partie. **Écartée d'un commun accord** : si on voit le signe des portes, on gagne à tous les coups ; s'il est caché, choisir la porte ne sert à rien (1 chance sur 3 quelle que soit la porte) ; un indice (« ce n'est pas la pierre ») laisse toujours un signe qui ne peut pas perdre. Corrigée (portes bois, fer et or, de risques différents mais de même gain moyen), elle devient surtout un jeu de prise de risque, et elle ferait doublon avec Dégaine !. Seule l'idée du choix du risque est gardée, comme option de Dégaine ! (le duel à mort).

## Le Bluff (idée du porteur du projet, 23 octobre) — jeu à expérimenter

Un face-à-face façon poker (« heads-up ») avec des cartes pierre, feuille et ciseaux : un joueur garde ses cartes fermées, l'autre doit les dévoiler peu à peu, et on mise à chaque étape. Le plus riche des mini-jeux, mais aussi le plus dur à équilibrer : à tester avant de le programmer pour de bon.

### Les règles pour les premiers essais
1. **Le paquet** : **21 cartes** (7 pierres, 7 feuilles, 7 ciseaux), mélangées à chaque donne ; **5 cartes chacun** (au départ, 30 cartes ; passé à 21 avec le dévoilement du paquet, voir plus bas).
2. **Les jetons** : 20 chacun au départ. Mise obligatoire à chaque donne : **à régler pendant les essais**, en partant de 2 jetons pour le Caché et 1 pour l'Ouvert (celui qui a l'information paie plus cher), ou 1 et 1 (le dévoilement du paquet aide l'Ouvert ; voir les essais).
3. **Les rôles**, inversés à chaque donne : **le Caché** garde ses 5 cartes fermées et parle en premier à chaque tour de mise ; **l'Ouvert** dévoile ses cartes.
4. **Le dévoilement** : l'Ouvert montre **2 cartes de son choix**, puis une **3ᵉ**, puis une **4ᵉ** ; il choisit lui-même **la carte qui reste cachée** (son arme de bluff).
   **En même temps, on dévoile des cartes du paquet** (idée du porteur du projet) : **3**, puis **2**, puis **1**. Elles ne sont dans aucune main : en les comptant, chacun peut déduire peu à peu la main adverse.
5. **Les mises** (après chaque dévoilement) : le Caché passe ou mise (1 à 3 jetons) ; l'Ouvert **suit, relance une fois, ou se couche** ; si le Caché a passé, l'Ouvert peut miser à son tour. Celui qui se couche perd ce qu'il a misé.
6. **L'abattage** : si personne ne s'est couché, **duel en 3 coups** : chacun joue 3 de ses 5 cartes, une par une, face cachée et en même temps ; celui qui gagne le plus de coups prend les mises ; égalité : on partage.
7. **La fin** : quand un joueur n'a plus de jetons, ou après un nombre de donnes fixé (le plus de jetons gagne).

Les corrections 1 à 3 sont des propositions de Claude acceptées par le porteur du projet : l'Ouvert choisit ce qu'il dévoile, il peut relancer, et l'abattage se joue en 3 coups (au lieu d'un seul coup de chifoumi).

### Les essais (simulation de Claude, 23 octobre)
Des milliers de parties entre joueurs virtuels : un « stratège » (il mise selon la force de sa main et bluffe 1 fois sur 5), un joueur au hasard, un joueur qui suit toujours. La force d'une main est calculée exactement (théorie des jeux).
- **L'abattage en 3 coups donne une vraie force aux mains** : la main la plus forte l'est nettement dans 18 % des donnes (1 % avec un abattage à un seul coup, où la moitié des donnes sont presque du pile ou face).
- **La stratégie l'emporte** : le stratège bat le joueur au hasard **64 %** du temps et celui qui suit toujours **66 %** (59 % et 53 % avec l'abattage à un coup).
- **Le rôle de Caché donnait trop d'avantage** : avec la même mise obligatoire (1 jeton chacun), le Caché gagnait en moyenne +0,43 jeton par donne. Avec **2 jetons pour le Caché et 1 pour l'Ouvert**, c'est équilibré (−0,06 jeton par donne). D'où la règle 2.
- **Des mises plus grosses** (jusqu'à la taille du pot) : parties plus courtes (environ 13 donnes au lieu de 18) et suiveurs plus punis (70 %), mais un peu moins d'écart avec le hasard (60 %). À essayer.
- **Ce que la simulation ne sait pas mesurer** : le bluff et la lecture de l'adversaire. Les joueurs virtuels se couchent rarement (3 % des donnes), parce que l'Ouvert ne sait presque rien de la main du Caché et suit donc selon la cote des mises ; du coup, le bluff ne rapporte rien entre eux. Entre humains, ce sera différent : c'est ce qu'il faut tester en vrai. Si l'Ouvert manque d'indices, une piste : **le Caché montre 1 carte** au début (abandons doublés dans la simulation ; il faudra alors revoir les mises obligatoires).
- Quelle carte l'Ouvert a intérêt à garder cachée : pas de conclusion fiable (la simulation ne modélise pas assez finement l'abattage).

### Le dévoilement du paquet (idée du porteur du projet, essais du 23 octobre)
Dévoiler aussi des cartes du paquet répond au défaut trouvé plus haut : l'Ouvert ne savait presque rien de la main du Caché. Tout dépend de la taille du paquet (essais entre joueurs virtuels, mêmes règles par ailleurs) :

| Paquet | Cartes du paquet dévoilées | Abandons entre stratèges | Le stratège contre celui qui suit toujours |
|---|---|---|---|
| 30 cartes | aucune | 3 % | 60 % |
| 30 cartes | 3, puis 1, puis 1 | 3 % | 62 % |
| 21 cartes | 3, puis 1, puis 1 | 4 % | 59 % |
| **21 cartes** | **3, puis 2, puis 1** | **5 %** | **62 %** |
| 18 cartes | 3, puis 1, puis 1 | 6 % | 62 % |

- Avec 30 cartes, dévoiler le paquet apprend peu (il reste trop de cartes inconnues).
- **Retenu (choix du porteur du projet) : 21 cartes, dévoilement 3-2-1.** Autant de déduction qu'avec 18 cartes, mais il reste plus d'inconnu à la fin (pour l'Ouvert : les 5 cartes du Caché et 5 autres, contre 3 avec 18 cartes) : le meilleur équilibre entre compter les cartes et bluffer. (18 cartes en 3-1-1 donnerait plutôt un jeu de déduction, où l'on reconstitue presque la main adverse.)
- Les cartes dévoilées aident surtout l'Ouvert : dans ces essais, la mise obligatoire 2/1 penche un peu vers lui (le Caché perd environ 0,3 à 0,4 jeton par donne). Ces réglages dépendent de la façon de jouer : à ajuster en vraies parties (peut-être revenir à 1 et 1).
- Exemple de déduction (paquet de 18 pour simplifier) : l'Ouvert a pierre, pierre, feuille, ciseaux, ciseaux ; le paquet dévoile 4 feuilles et 1 pierre ; il ne reste qu'une seule feuille parmi les cartes qu'il ne voit pas, donc le Caché a au plus une feuille : jouer pierre devient beaucoup moins risqué.

### Pour tester sans programmer
Un jeu de cartes classique (par exemple cœur = pierre, carreau = feuille, pique = ciseaux, 7 de chaque) et des allumettes pour les jetons : quelques parties entre amis diront vite si le jeu fonctionne, si le bluff marche et combien de temps dure une partie.

### Plus tard
- Contre l'ordinateur : difficile (un ordinateur qui bluffe intelligemment est complexe) ; commencer par des caractères simples (prudent, bluffeur, agressif). Le vrai plaisir viendra entre humains, en ligne.
