# L'événement de Noël (préparé le 24 novembre 2026)

Exception validée par le porteur du projet à la règle « seulement l'amélioration de l'existant ». Actif sur la version de test
toujours, sur handslam.fr du 1er décembre au 6 janvier (`app/js/noel.js`). Cadeau du tournoi : **virtuel**.

## Fait
- **Lot 1 (24 nov.)** : le court décoré (guirlande lumineuse et houx sur le tableau de score, sapin en fond du court) et les
  flocons. **En attente du test du porteur du projet** avant la suite.

- **Lot 3, les quatre bots (24 nov.)** : leurs gants (dessinés et validés un par un), leurs niveaux (Père Noël 2000, Lutin 1800,
  Comète 1400, Bonhomme de neige 1100 ; force vérifiée par `outils/calibrer-bots.js` : le Père Noël est le plus fort de tous les
  bots), leur façon de jouer, et le pouvoir de leur smash réussi (le joueur sonné 4 secondes, comme d'habitude, avec l'effet du
  bot) : Avalanche de cadeaux (gant emballé d'un ruban), La farce (gant barbouillé, et les trois boutons mélangés pour le coup
  suivant), Coup de sabot (une comète traverse l'écran, l'empreinte du sabot sur le gant), Gelé (le gant givré). Dans la liste du
  mode solo seulement pendant les fêtes, ni en carrière ni en tournoi. Leur marque (ruban, peinture, sabot, givre) reste sur le gant du joueur jusqu'à la fin du set, au lieu de l'accroc et de la
  fissure ; les lames tordues restent (choix du porteur du projet). Leurs répliques (31, dont celles des pouvoirs et
  l'ambiance des fêtes, validées le 24 novembre) sont branchées comme les répliques personnalisées d'un joueur, plus le smash.

- **Calendrier de l'Avent (24 nov.)** : le grand sapin et ses 24 portes (`app/js/ecran-avent.js`, règles dans
  `app/js/avent-logique.js`, serveur : étape SQL 89). Défi du jour pour ouvrir la case ; rattrapage jusqu'au 31 décembre en
  battant le gardien de la case en un set de 7 (Bonhomme de neige 1-8, Comète 9-16, Lutin 17-23, Père Noël 24 : l'affronter
  suffit), deux par jour. Cadeaux : les 12 pulls moches, 5 fois des jetons (100 à 300), célébration « Boule de neige »,
  poignée de main givrée, cadre « Guirlande », fond « Nuit de Noël », poignets « Sucre d'orge » et « Fourrure », et le 24 le
  Gant du Père Noël. Les 24 cases : trophée « Calendrier complet ». Sur la version de test avant décembre : un essai sur le
  téléphone, avec un jour simulé.

- **Décor revu (24 nov. au soir)** : l'appli garde son visuel de base (sortie prévue vers le 1er décembre) ; un bonnet de
  Noël sur le logo ; en match, la guirlande et le houx sur le court bleu ; le court rouge, le grand sapin et les flocons
  pour les matchs contre un bot de Noël (dont ceux du calendrier), et pour tous les matchs les 24 et 25 décembre.

## Textes validés le 24 novembre (à créer après le test du décor)

### Les bots
| Bot | Style | Habitude | Niveau |
|---|---|---|---|
| Le Père Noël 🎅 | Le généreux | « Il sait si tu as été sage : il lit tout ce que tu joues. Il emballe volontiers tout dans du papier cadeau, et sort le charbon quand il est mené. » | 2 000 |
| Le Lutin 🧝 | L'espiègle | « Imite tes coups pour t'endormir… puis te fait une farce au moment où tu t'y attends le moins. » | 1 800 |
| Comète, le renne 🦌 | Le fonceur | « Tourne en boucle à toute allure : Pierre, Feuille, Ciseaux… et change de sens dès que tu l'as repéré. » | 1 400 |
| Le Bonhomme de neige ⛄ | Le figé | « Tient à sa boule de neige, mais fond et change de signe quand tu l'as trop bien lu. » | 1 100 |

(Niveaux et phrases revus le 24 novembre à la demande du porteur du projet ; il garde le nom « Comète » pour le renne, affiché
« Comète, le renne » pour ne pas le confondre avec Comète, la filante.)

### Les répliques (R = Roland, M = Monique) — environ 1 300 crédits
- Présentation contre le Père Noël : R « Ho ho ho ! Le Père Noël en personne descend sur le court central ! » ; M « Il a vérifié sa liste. Deux fois. Son adversaire est sur la mauvaise. »
- Smash gagnant du Père Noël : R « Et un gros smash au visage… Joyeux Noël ! » ; R « Et en cadeau, un gros smash bien senti ! » ; M « Il distribue des cadeaux. Pas ceux qu'on attendait. »
- Point du Père Noël : R « Ho ho ho ! Le Père Noël est en pleine distribution ! » ; M « Le traîneau est chargé, et il n'a pas l'intention de repartir à vide. »
- Point contre le Père Noël : M « Quelqu'un vient de se faire rayer de la liste des enfants sages. » (la réplique de Roland « On vient de déballer le Père Noël » est retirée)
- Fin du match : R (victoire du joueur) « Incroyable ! Le Père Noël est battu ! Il repart en traîneau, la hotte vide ! » ; M (victoire du joueur) « Il y aura du charbon dans certaines chaussettes cette année. » ; R (défaite) « Le Père Noël l'emporte ! Il a été très sage cette année ! » ; M (défaite) « Il faudra écrire une lettre plus convaincante l'an prochain. »
- Présentation des autres bots : R « Le Bonhomme de neige entre sur le court… et il a l'air de fondre de trac ! » ; M « Il ne bouge pas beaucoup. C'est souvent le cas des bonshommes de neige. » ; R « Attention, voici Comète, le renne le plus rapide du Pôle Nord ! » ; R « Le Lutin entre sur le court… méfiez-vous, il adore les farces ! »
- Ambiance des matchs de décembre (de temps en temps) : R « Les flocons tombent sur le court central, quelle ambiance ! » ; M « Même en décembre, le chifoumi ne prend pas de vacances. »

### Les objets
- Gants : « Gant du Père Noël » (rouge, bord blanc fourré), « Pull moche » (motif rennes et flocons, couleurs criardes).
- Célébration « Boule de neige » ; poignée de main « Poignée givrée » ; cadre de carte « Guirlande ».
- Trophées : « Esprit de Noël » (12 matchs pendant les fêtes), « Champion de Noël » (vainqueur du tournoi de Noël → gant d'or de Noël, exclusif).

### Aussi gardés (idées du 24 novembre)
Calendrier de l'Avent (défis du jour de Noël, du 1er au 24 décembre), match du jour du 25 décembre contre le Père Noël, grand
tournoi de Noël (cadeau virtuel).

### Répliques ajoutées le 24 novembre (validées)
- Pouvoirs : Lutin R « Oh, le coquin ! Il a mélangé tous les boutons ! », R « Une farce du Lutin ! Attention où vous mettez les doigts ! », M « Pierre, Feuille, Ciseaux… mais plus dans le même ordre. » ; Comète R « Un coup de sabot à la vitesse de la lumière ! », R « Une comète vient de traverser le court central ! », M « Ça laisse une trace. Au sens propre. » ; Bonhomme de neige R « Brrr ! Le gant est complètement gelé ! », R « Un smash glacial du Bonhomme de neige ! », M « Il fallait prévoir des moufles. » ; Père Noël R « Le gant est emballé, il ne manque plus que l'étiquette ! », M « Joli paquet. On l'ouvre à la fin du set. »
- Présentations (Monique) : Lutin « Il a l'air innocent. C'est justement ça, le problème. » ; Comète « Il paraît qu'il ne connaît pas la marche arrière. Enfin… sauf quand on l'a repéré. »

### Plus tard
Le chant de supporters de Noël (sur l'air de *Jingle Bells*, proposé le 24 novembre, à revoir).
