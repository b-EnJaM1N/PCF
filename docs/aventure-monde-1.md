# Mode Aventure — Monde 1 : la Forêt des Ombres (projet)

Idée du porteur du projet (13 octobre). **Projet à part, hors de l'appli HandSlam** (décision du 13 octobre : le ton
« aventure » ne va pas avec la simulation sportive ; peut-être jamais ajouté). Il vit sur la branche `aventure-experimentale`,
mise en ligne automatiquement à l'adresse https://handslam.fr/aventure/aventure.html (aucun lien depuis l'appli).

Version pixel art (13 octobre), d'après la maquette du porteur du projet : le décor de la forêt (`app/img/aventure/foret.webp`),
le héros et le Gobelin découpés dans la maquette (`heros.png`, `gobelin.png`), police pixel Jersey 10, cadres dorés, gros
boutons bleu / vert / rouge, sons façon console 8 bits. Animations : les combattants respirent, foncent sur l'autre, clignotent
quand ils sont touchés, tombent au K.-O. ; les dégâts s'envolent en chiffres. Tous les adversaires ont leur dessin (14 octobre :
Bambi, Pipistrelle, l'Amanite, le Loup gris et le boss, un golem de bois et de pierre, fournis par le porteur du projet,
damier du fond retiré) ; Bambi et Pipistrelle sont retournés pour regarder le héros, Pipistrelle vole, le boss est plus grand. Monique parle dans une boîte de dialogue, lettre par lettre (voix plus tard).
Fichiers : `app/aventure.html`, `app/css/aventure.css`, `app/js/aventure-jeu.js` (écran), `app/js/aventure-logique.js` (règles, testées). Un mode solo façon RPG, contre l'ordinateur,
sans serveur (jouable sans compte). 5 ou 6 mondes à terme ; on commence par un seul monde pour voir si les joueurs accrochent.
Les dessins (style pixel art) viendront après.

## L'histoire

Le Roi des Gobelins, **Grok**, a volé le Gant d'Or, le trophée du HandSlam, et s'est caché au fond de la Forêt des Ombres.
Le héros traverse la forêt, affronte ses habitants un par un, et gagne en force à chaque victoire, jusqu'au duel final.

## Monique, la mentore (idée du 13 octobre)

C'est **Monique Latouffe**, la commentatrice glaciale, championne de 1997, qui ouvre l'aventure et donne les missions.
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
- **Étoiles** : 1 étoile pour la victoire, 2 s'il te reste plus de la moitié de ta vie, 3 s'il te reste plus de 80 % de ta vie
  (choix du 13 octobre). On garde le meilleur score. De quoi rejouer les combats pour faire mieux.
- Pas de minuteur : on prend le temps d'observer l'adversaire.

## Le héros

- Au départ : **100 de vie, 10 de force**.
- Chaque adversaire battu **pour la première fois** : **+3 de force et +10 de vie** (rejouer un combat ne rend pas plus fort).
- À l'arrivée devant le boss : 150 de vie et 25 de force.

## Les pouvoirs

On gagne un pouvoir à chaque victoire (y compris en rejouant un combat), s'il reste de la place : on peut en garder
**3 au maximum**, et chacun ne sert qu'une fois (perdu même si on abandonne le combat). On l'active avant de choisir son signe.
Le Bouclier et le Coup double restent prêts tant que le coup se termine par une égalité.

| Pouvoir | Effet |
|---|---|
| 🔍 **Loupe** | pendant 3 coups, montre le signe que l'adversaire préfère en ce moment |
| 🛡️ **Bouclier** | si tu perds le prochain coup, tu ne perds pas de vie |
| ⚔️ **Coup double** | si tu gagnes le prochain coup, il fait deux fois plus de dégâts |
| 🧪 **Potion** | rend 30 de vie tout de suite |

## Les 6 combats

| | Adversaire | Vie | Force | Sa façon de jouer | Récompense |
|---|---|---|---|---|---|
| 1 | 🦌 **Bambi**, le faon timide | 30 | 12 | Rejoue le même signe tant qu'il n'a pas perdu deux fois de suite (comme le bot actuel). Le combat pour apprendre. | 🔍 Loupe |
| 2 | 👺 **Le Gobelin** à la massue | 50 | 18 | Adore la **Pierre** (sa massue) : il la joue un coup sur deux. | 🛡️ Bouclier |
| 3 | 🦇 **Pipistrelle**, la chauve-souris | 60 | 20 | Très agitée : ne joue **jamais deux fois de suite le même signe**. | ⚔️ Coup double |
| 4 | 🍄 **L'Amanite**, champignon vénéneux | 70 | 20 | **Copie ton coup précédent** (85 % du temps). Spécialité : le **poison**, chaque égalité te fait perdre 5 de vie. | 🧪 Potion |
| 5 | 🐺 **Le Loup gris** | 90 | 22 | Rusé (80 % du temps) : s'il gagne, il rejoue le même signe ; s'il perd, il prend le signe qui bat le tien. **Morsure** : après 2 coups gagnés d'affilée, son coup suivant fait double dégâts. | au choix, 1 des 4 pouvoirs |
| 👑 | **Grok, le Roi des Gobelins** (boss) | 160 | 24 | **Phase 1** : joue surtout Pierre et Ciseaux (45 % chacun). **Phase 2, en rage** (à la moitié de sa vie) : force 30, et il joue ce qui bat ton dernier signe (70 % du temps). En entrant en rage, **Racines** : tes pouvoirs sont bloqués pendant 2 coups. | 🏆 le Gant d'Or, et l'accès au Monde 2 |

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

- Les chiffres exacts (à régler en jouant). Réglage du 13 octobre, par simulation : en jouant au hasard, on bat Bambi
  presque toujours, le Gobelin 8 fois sur 10, le Loup 2 fois sur 3 et Grok 4 fois sur 10 ; en lisant les manies, on gagne
  presque à coup sûr.
- Ce qu'on gagne en plus : jetons, un surnom (« le Tueur de Gobelins »), un trophée, une tenue pour l'avatar.
- Le style des dessins (pixel art) et d'où ils viennent : images par IA retouchées, pack acheté, ou dessinateur.
- Les mondes suivants (idées : le Désert, les Glaces, le Volcan, le Château, le monde final).
