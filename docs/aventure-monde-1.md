# Aventure — Monde 1 : la Forêt des Ombres (Chifoumania)

## Où on en est (23 octobre) : l'Aventure entre dans Chifoumania
Décision du porteur du projet (23 octobre) : l'Aventure fait partie de **Chifoumania** (famille de jeux à part de HandSlam), et elle est retravaillée.
- **Le jeu** : `docs/prototypes/aventure/` (page `index.html`, règles dans `js/aventure-logique.js`, testées par `tests/aventure.test.js`). Repris de la branche `aventure-experimentale` (13 octobre, à ne plus utiliser) ; il ne dépend plus de l'appli HandSlam (règles, stockage et police copiés dans le dossier). On l'ouvre depuis l'onglet **Aventure** du menu Chifoumania (bouton « Jouer ») ; « ‹ Menu Chifoumania » sur l'écran titre pour revenir. Il est publié avec le menu sur la page privée Claude (voir [`invaders.md`](invaders.md)).
- **Ce qui existait déjà** (13 octobre) : écran titre « La Quête du Gant d'Or », choix du héros (Héros ou Héroïne) et personnalisation (peau, cheveux, yeux), carte du monde où le héros marche, 6 adversaires dessinés en pixel art avec leur manie (Bambi, le Gobelin, Pipistrelle, l'Amanite, le Loup gris, et le boss **le Gardien de la Forêt**, golem de bois et de pierre, à la place de Grok), 4 pouvoirs (Œil de Lynx, Écorce de Chêne, Frappe du Sanglier, Sève de Vie), étoiles, sons 8 bits.
- **L'Enchanteresse 🔮 remplace Monique** (choix du porteur du projet, 23 octobre : un nom mystérieux façon RPG, sans prénom ; essais écartés : « Maître Hibou », puis « Tante Pia ») : une magicienne de la forêt qui lit les signes dans sa boule de cristal, voix douce et un peu énigmatique. Elle appelle le héros « jeune âme » et donne un indice sur la manie de chaque adversaire. Plus aucune trace de HandSlam dans les textes (ni Monique, ni 1997, ni « trophée du HandSlam ») : le Gant d'Or est « celui qui donne la maîtrise du chifoumi ».
- **Des combats plus vivants** (choix du porteur du projet : « les deux ») :
  - **L'intention** : avant chaque coup, l'adversaire annonce ce qu'il prépare (une bulle avec le signe et un « ? »), mais il peut **bluffer**. Franchise : Bambi ne ment jamais, le Gobelin 80 %, Pipistrelle 70 %, l'Amanite 60 %, le Loup 50 %, le Gardien 65 % (40 % en rage). L'**Œil de Lynx** dit maintenant, pendant 3 coups, si l'intention est vraie ou du bluff.
  - **Le temps limité** : une barre de temps se vide ; trop lent, le coup est perdu. Bambi 5 s, le Gobelin 4,5 s, Pipistrelle et l'Amanite 4 s, le Loup et le Gardien 3,5 s (2,6 s en rage) ; jamais moins de 1,8 s. Le temps s'arrête si on quitte l'appli.
  - **L'énergie et les coups spéciaux** : chaque coup gagné remplit la jauge (3 cases). Pleine, on peut **armer un coup spécial** ; s'il gagne : Pierre = **Coup de massue** (×2 dégâts), Feuille = **Tornade de feuilles** (dégâts et +20 de vie), Ciseaux = **Lame étourdissante** (dégâts, et la prochaine intention de l'adversaire est forcément vraie). Perdu ou égalité : l'énergie est perdue (un pari).
- **Bulles de dialogue** (23 octobre, demande du porteur du projet : elles cachaient le haut des personnages) : avant le combat, la réplique de l'adversaire se place toujours au-dessus de la tête la plus haute ; pendant le combat, ses répliques (au début, et « LA FORÊT SE RÉVEILLE ! ») s'affichent dans le cadre du bas de la scène, entre guillemets.
- **À faire ensuite** : régler les chiffres en jouant ; mettre l'Aventure aux couleurs de Chifoumania (pas demandé pour l'instant) ; le monde 2.

*Ce qui suit est le scénario d'origine (13 octobre, époque HandSlam), gardé pour mémoire : Monique, Grok et certains chiffres ont changé depuis (voir ci-dessus et `js/aventure-logique.js`).*

## Le projet d'origine (13 octobre)

Idée du porteur du projet (13 octobre), *rien de programmé pour l'instant*. Un mode solo façon RPG, contre l'ordinateur,
sans serveur (jouable sans compte). 5 ou 6 mondes à terme ; on commence par un seul monde pour voir si les joueurs accrochent.
Les dessins (style pixel art) viendront après.

## L'histoire

Le Roi des Gobelins, **Grok**, a volé le Gant d'Or, le trophée du HandSlam, et s'est caché au fond de la Forêt des Ombres.
Le héros traverse la forêt, affronte ses habitants un par un, et gagne en force à chaque victoire, jusqu'au duel final.

## Monique, la mentore (idée du 13 octobre)

C'est **Monique Latour**, la commentatrice glaciale, championne de 1997, qui ouvre l'aventure et donne les missions.
Elle garde son caractère : sèche, exigeante, un compliment par monde au maximum. Sa voix existe déjà (ElevenLabs).

**Introduction** (au premier lancement du mode Aventure) :
> « Bonjour, petit scarabée. Tu veux devenir un as de la discipline ? Alors suis mes conseils.
> J'ai été championne en 1997. Toi, pour l'instant, tu n'es rien. Le Roi des Gobelins a volé le Gant d'Or :
> va le chercher au fond de la Forêt des Ombres. Et tiens-toi droit. »

**Les missions**, une avant chaque combat (le conseil donne l'indice sur la manie de l'adversaire) :

| Combat | Mission de Monique | Après la victoire |
|---|---|---|
| 🦌 Bambi | « Commence par Bambi. Il est têtu : il rejoue le même signe tant qu'il n'a pas perdu deux fois. Même toi, tu devrais y arriver. » | « Bien. Tiens, une Loupe. Elle te montre ce que l'autre prépare. Ne la gaspille pas. » |
| 👺 Gobelin | « Le Gobelin ne lâche jamais sa massue. Réfléchis deux secondes à ce que ça veut dire. » | « Pas mal. Prends ce Bouclier, tu en auras besoin. » |
| 🦇 Pipistrelle | « La chauve-souris ne tient pas en place : jamais deux fois le même signe. Sers-toi de ta tête. » | « Correct. Voici un Coup double. Frappe fort, pour une fois. » |
| 🍄 Amanite | « L'Amanite t'imite, comme un mauvais élève. Et méfie-toi des égalités : elles empoisonnent. » | « Tu as encore tes deux mains ? Bien. Une Potion, au cas où. » |
| 🐺 Loup gris | « Le Loup sent la peur. Quand il gagne, il insiste. Quand il perd, il change. Ne lui laisse pas deux victoires d'affilée. » | « Choisis ton pouvoir. Et réfléchis, cette fois. » |
| 👑 Grok | « Grok. Il cogne avec la Pierre et les Ciseaux… et quand il se fâche, il lit dans ton jeu. Ne sois pas prévisible. » | « … Pas mal, petit scarabée. Pas mal du tout. Ne le répète à personne. » |

En cas de défaite, une pique courte (« Muscle ton jeu. », « En 1997, j'aurais gagné les yeux fermés. ») puis on recommence.

**Comment Monique t'appelle** (choix du porteur du projet, 13 octobre) : le surnom évolue au fil des mondes,
pour montrer qu'elle te prend peu à peu au sérieux.

| Moment | Elle t'appelle |
|---|---|
| Monde 1 | « petit scarabée » |
| Monde 2 | « le débutant » |
| Mondes 3 et 4 | « jeune espoir » (avec ironie) |
| Monde 5 | « champion », du bout des lèvres |
| Après le boss final | ton vrai pseudo, pour la première fois |

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
