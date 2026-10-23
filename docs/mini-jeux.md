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
