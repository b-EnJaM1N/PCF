# Mode Aventure — Monde 1 : la Forêt des Ombres (projet)

Idée du porteur du projet (13 octobre), *rien de programmé pour l'instant*. Un mode solo façon RPG, contre l'ordinateur,
sans serveur (jouable sans compte). 5 ou 6 mondes à terme ; on commence par un seul monde pour voir si les joueurs accrochent.
Les dessins (style pixel art) viendront après.

## L'histoire

Le Roi des Gobelins, **Grok**, a volé le Gant d'Or, le trophée du HandSlam, et s'est caché au fond de la Forêt des Ombres.
Le héros traverse la forêt, affronte ses habitants un par un, et gagne en force à chaque victoire, jusqu'au duel final.

## Les règles d'un combat

- **Vie** : chacun a une barre de vie. On la retrouve pleine au début de chaque combat.
- **Force** : les dégâts d'un coup gagné. Coup gagné : l'adversaire perd ta force. Coup perdu : tu perds la sienne.
- **Égalité** : personne ne perd de vie (sauf exception, voir l'Amanite).
- Le premier dont la vie tombe à 0 a perdu.
- **Défaite** : on recommence ce combat, autant de fois qu'on veut (on ne perd pas sa progression).
- **Étoiles** : 1 étoile pour la victoire, 2 s'il te reste plus de la moitié de ta vie, 3 si tu n'as utilisé aucun pouvoir
  ou s'il te reste plus de 80 % de ta vie (à choisir). De quoi rejouer les combats pour faire mieux.

## Le héros

- Au départ : **100 de vie, 10 de force**.
- Chaque victoire : **+3 de force et +10 de vie**.
- À l'arrivée devant le boss : environ 115 de vie et 25 de force.

## Les pouvoirs

On gagne un pouvoir à chaque victoire. On peut en garder **3 au maximum**, et chacun ne sert qu'une fois.
On l'active avant de choisir son signe.

| Pouvoir | Effet |
|---|---|
| 🔍 **Loupe** | pendant 3 coups, montre le signe que l'adversaire préfère en ce moment |
| 🛡️ **Bouclier** | si tu perds le prochain coup, tu ne perds pas de vie |
| ⚔️ **Coup double** | si tu gagnes le prochain coup, il fait deux fois plus de dégâts |
| 🧪 **Potion** | rend 30 de vie tout de suite |

## Les 6 combats

| | Adversaire | Vie | Force | Sa façon de jouer | Récompense |
|---|---|---|---|---|---|
| 1 | 🦌 **Bambi**, le faon timide | 30 | 5 | Rejoue le même signe tant qu'il n'a pas perdu deux fois de suite (comme le bot actuel). Le combat pour apprendre. | 🔍 Loupe |
| 2 | 👺 **Le Gobelin** à la massue | 50 | 8 | Adore la **Pierre** (sa massue) : il la joue un coup sur deux. | 🛡️ Bouclier |
| 3 | 🦇 **Pipistrelle**, la chauve-souris | 60 | 10 | Très agitée : ne joue **jamais deux fois de suite le même signe**. | ⚔️ Coup double |
| 4 | 🍄 **L'Amanite**, champignon vénéneux | 70 | 10 | **Copie ton coup précédent**. Spécialité : le **poison**, chaque égalité te fait perdre 5 de vie. | 🧪 Potion |
| 5 | 🐺 **Le Loup gris** | 90 | 12 | Rusé : s'il gagne, il rejoue le même signe ; s'il perd, il change. **Morsure** : après 2 coups gagnés d'affilée, son coup suivant fait double dégâts. | au choix, 1 des 4 pouvoirs |
| 👑 | **Grok, le Roi des Gobelins** (boss) | 160 | 15 | **Phase 1** : joue surtout Pierre et Ciseaux. **Phase 2, en rage** (sous la moitié de sa vie) : force 20, et il joue ce qui bat ton dernier signe. Une fois par combat, **Racines** : tes pouvoirs sont bloqués pendant 2 coups. | 🏆 le Gant d'Or, et l'accès au Monde 2 |

Quelques idées de répliques (bulles, et voix des commentateurs plus tard) :
- Bambi : « Euh… on peut faire ami-ami ? »
- Le Gobelin : « Hé hé… tu ne vas pas gagner si facilement ! »
- Pipistrelle : « Tu ne me vois pas venir ! »
- L'Amanite : « Approche… je ne suis pas si toxique. »
- Le Loup gris : « Je sens ta peur d'ici. »
- Grok : « Le Gant d'Or est à moi ! » ; en rage : « ASSEZ JOUÉ ! »

## Pourquoi c'est un vrai jeu, pas seulement de la chance

Chaque adversaire a une habitude à découvrir : Pierre pour le Gobelin, jamais deux fois le même signe pour Pipistrelle,
copier ton coup pour l'Amanite… Le joueur qui observe gagne plus vite et avec plus de vie. Les pouvoirs ajoutent des choix
(garder le Bouclier pour le boss ou s'en servir tout de suite ?).

## À décider plus tard

- Les chiffres exacts (à régler en jouant).
- Ce qu'on gagne en plus : jetons, un surnom (« le Tueur de Gobelins »), un trophée, une tenue pour l'avatar.
- Le style des dessins (pixel art) et d'où ils viennent : images par IA retouchées, pack acheté, ou dessinateur.
- Les mondes suivants (idées : le Désert, les Glaces, le Volcan, le Château, le monde final).
