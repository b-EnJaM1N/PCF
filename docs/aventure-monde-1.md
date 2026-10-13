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
**Écran titre** (14 octobre, idée 1 choisie par le porteur du projet) : « La Quête du Gant d'Or » en lettres pixel dorées sur le
décor de la forêt, le Gant d'Or qui flotte et brille, le héros sur le chemin, un bouton « Commencer » (14 octobre) et un petit générique 8 bits.
**Choix du héros** (14 octobre) : à la première partie, écran « Choisis ton héros » : le Héros, l'Héroïne (dessin du porteur
du projet, damier retiré) (« Toi en héros », à partir d'une photo, essayé puis retiré le 14 octobre à la demande du porteur du projet : un visage en
photo collé dans un rond faisait « artisanal », un visage redessiné n'était plus ressemblant, et le héros repeint aux couleurs
de la photo ne convainquait pas non plus ; une version par intelligence artificielle serait payante) ; ensuite on va droit à la carte, avec « Changer de héros » sur l'écran titre. Idée pour plus tard : une mini-BD de 4 images avant la première partie (le Gant d'Or
sur son socle, les racines qui l'emportent, Monique au micro, le héros qui part du campement).

**Carte du monde façon premiers Mario** (14 octobre) : le dessin du porteur du projet (`app/img/aventure/carte.webp` : forêt,
rivière et pont, chemin de terre à angles droits, triangle rouge au départ), une étape par adversaire avec son
visage et ses étoiles ; le héros marche le long du chemin jusqu'à l'étape touchée, puis Monique donne la mission. Après une
victoire, « En route vers… » le fait avancer tout seul jusqu'à l'adversaire suivant. Place des étapes et trajets sur le dessin : `app/js/aventure-carte.js`. Les combattants sont posés sur le chemin du décor (14 octobre).
Fichiers : `app/aventure.html`, `app/js/aventure-carte.js`, `app/css/aventure.css`, `app/js/aventure-jeu.js` (écran), `app/js/aventure-logique.js` (règles, testées).

Un mode solo façon RPG, contre l'ordinateur,
sans serveur (jouable sans compte). 5 ou 6 mondes à terme ; on commence par un seul monde pour voir si les joueurs accrochent.
Les dessins (style pixel art) viendront après.

## L'histoire

Le Gant d'Or, le trophée du HandSlam, a disparu dans la Forêt des Ombres. Le **Gardien de la Forêt**, un vieux golem de bois
et de pierre, l'a trouvé et ne veut plus le rendre (décision du 14 octobre : le boss est ce golem, d'après le dessin du
porteur du projet, au lieu de Grok, le Roi des Gobelins).
Le héros traverse la forêt, affronte ses habitants un par un, et gagne en force à chaque victoire, jusqu'au duel final.

## Monique, la mentore (idée du 13 octobre)

C'est **Monique Latouffe**, la commentatrice glaciale, championne de 1997, qui ouvre l'aventure et donne les missions.
Elle garde son caractère : sèche, exigeante, un compliment par monde au maximum. Sa voix existe déjà (ElevenLabs).

**Introduction** (au premier lancement du mode Aventure) :
> « Bonjour, petit scarabée. Tu veux devenir un as de la discipline ? Alors suis mes conseils.
> J'ai été championne en 1997. Toi, pour l'instant, tu n'es rien. Le Gant d'Or a disparu dans la Forêt des Ombres.
> Le Gardien de la Forêt, un vieux golem de bois et de pierre, l'a trouvé et ne veut plus le rendre. Va le chercher. Et tiens-toi droit. »

**Les missions**, une avant chaque combat (le conseil donne l'indice sur la manie de l'adversaire) :

| Combat | Mission de Monique | Après la victoire |
|---|---|---|
| 🦌 Bambi | « Commence par Bambi. Il est têtu : il rejoue le même signe tant qu'il n'a pas perdu deux fois. Même toi, tu devrais y arriver. » | « Bien. Tiens, un Œil de Lynx. Il te montre ce que l'autre prépare. Ne le gaspille pas. » |
| 👺 Gobelin | « Le Gobelin ne lâche jamais sa massue. Réfléchis deux secondes à ce que ça veut dire. » | « Pas mal. Prends cette Écorce de Chêne, tu en auras besoin. » |
| 🦇 Pipistrelle | « La chauve-souris ne tient pas en place : jamais deux fois le même signe. Sers-toi de ta tête. » | « Correct. Voici la Frappe du Sanglier. Frappe fort, pour une fois. » |
| 🍄 Amanite | « L'Amanite t'imite, comme un mauvais élève. Et méfie-toi des égalités : elles empoisonnent. » | « Tu as encore tes deux mains ? Bien. Un peu de Sève de Vie, au cas où. » |
| 🐺 Loup gris | « Le Loup sent la peur. Quand il gagne, il insiste. Quand il perd, il change. Ne lui laisse pas deux victoires d'affilée. » | « Choisis ton pouvoir. Et réfléchis, cette fois. » |
| 🌳 Le Gardien | « Le Gardien de la Forêt. Des poings de pierre, des branches qui coupent comme des ciseaux… et quand son cœur s'allume, il lit dans ton jeu. Ne sois pas prévisible. » | « … Pas mal, petit scarabée. Pas mal du tout. Ne le répète à personne. » |

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

Noms choisis par le porteur du projet le 14 octobre (au lieu de Loupe, Bouclier, Coup double, Potion).

On gagne un pouvoir à chaque victoire (y compris en rejouant un combat), s'il reste de la place : on peut en garder
**3 au maximum**, et chacun ne sert qu'une fois (perdu même si on abandonne le combat). On l'active avant de choisir son signe.
L'Écorce de Chêne et la Frappe du Sanglier restent prêtes tant que le coup se termine par une égalité.

| Pouvoir | Effet |
|---|---|
| 👁️ **Œil de Lynx** | pendant 3 coups, montre le signe que l'adversaire préfère en ce moment |
| 🪵 **Écorce de Chêne** | si tu perds le prochain coup, tu ne perds pas de vie |
| 🐗 **Frappe du Sanglier** | si tu gagnes le prochain coup, il fait deux fois plus de dégâts |
| 🌿 **Sève de Vie** | rend 30 de vie tout de suite |

## Les 6 combats

| | Adversaire | Vie | Force | Sa façon de jouer | Récompense |
|---|---|---|---|---|---|
| 1 | 🦌 **Bambi**, le faon timide | 30 | 12 | Rejoue le même signe tant qu'il n'a pas perdu deux fois de suite (comme le bot actuel). Le combat pour apprendre. | 👁️ Œil de Lynx |
| 2 | 👺 **Le Gobelin** à la massue | 50 | 18 | Adore la **Pierre** (sa massue) : il la joue un coup sur deux. | 🪵 Écorce de Chêne |
| 3 | 🦇 **Pipistrelle**, la chauve-souris | 60 | 20 | Très agitée : ne joue **jamais deux fois de suite le même signe**. | 🐗 Frappe du Sanglier |
| 4 | 🍄 **L'Amanite**, champignon vénéneux | 70 | 20 | **Copie ton coup précédent** (85 % du temps). Spécialité : le **poison**, chaque égalité te fait perdre 5 de vie. | 🌿 Sève de Vie |
| 5 | 🐺 **Le Loup gris** | 90 | 22 | Rusé (80 % du temps) : s'il gagne, il rejoue le même signe ; s'il perd, il prend le signe qui bat le tien. **Morsure** : après 2 coups gagnés d'affilée, son coup suivant fait double dégâts. | au choix, 1 des 4 pouvoirs |
| 🌳 | **Le Gardien de la Forêt**, golem de bois et de pierre (boss) | 160 | 24 | **Phase 1** : joue surtout Pierre (ses poings) et Ciseaux (ses branches), 45 % chacun. **Phase 2, son cœur s'allume** (à la moitié de sa vie) : force 30, et il joue ce qui bat ton dernier signe (70 % du temps). En entrant en rage, **Racines** : tes pouvoirs sont bloqués pendant 2 coups. | 🏆 le Gant d'Or, et l'accès au Monde 2 |

Quelques idées de répliques (bulles, et voix des commentateurs plus tard) :
- Bambi : « Euh… on peut faire ami-ami ? »
- Le Gobelin : « Hé hé… tu ne vas pas gagner si facilement ! »
- Pipistrelle : « Tu ne me vois pas venir ! »
- L'Amanite : « Approche… je ne suis pas si toxique. »
- Le Loup gris : « Je sens ta peur d'ici. »
- Le Gardien : « Nul ne quitte ma forêt avec le Gant d'Or. » ; en rage : « LA FORÊT SE RÉVEILLE ! »

## Pourquoi c'est un vrai jeu, pas seulement de la chance

Chaque adversaire a une habitude à découvrir : Pierre pour le Gobelin, jamais deux fois le même signe pour Pipistrelle,
copier ton coup pour l'Amanite… Le joueur qui observe gagne plus vite et avec plus de vie. Les pouvoirs ajoutent des choix
(garder l'Écorce de Chêne pour le boss ou s'en servir tout de suite ?).

## À décider plus tard

- Les chiffres exacts (à régler en jouant). Réglage du 13 octobre, par simulation : en jouant au hasard, on bat Bambi
  presque toujours, le Gobelin 8 fois sur 10, le Loup 2 fois sur 3 et le Gardien 4 fois sur 10 ; en lisant les manies, on gagne
  presque à coup sûr.
- Ce qu'on gagne en plus : jetons, un surnom (« le Bûcheron »), un trophée, une tenue pour l'avatar.
- Le style des dessins (pixel art) et d'où ils viennent : images par IA retouchées, pack acheté, ou dessinateur.
- Les mondes suivants (idées : le Désert, les Glaces, le Volcan, le Château, le monde final).
