# Les Cahiers du HandSlam : articles en réserve

Textes prêts, pas encore publiés (décision du porteur du projet, 29 octobre). Pour en publier un : copier
`app/revue-modele.html` en `app/revue-<titre>.html`, y mettre le texte, ajouter une ligne à la liste `ARTICLES` de
`app/revue.html` (rubrique : philosophie, technique ou chroniques) et le fichier à `app/sw.js`. La page range l'article dans sa
rubrique et l'affiche dans « Les dernières contributions » (les 3 plus récentes).
Les phrases de Monique Latour sont inventées (c'est un personnage du jeu).

---

## 1. ~~Pourquoi perd-on si souvent contre un débutant ?~~ — *publié le 3 novembre* (`app/revue-perdre-contre-un-debutant.html`)

---

## 2. Miroir, ou l'anti-Narcisse (Chroniques du court central · Portrait)

*Narcisse aimait son reflet ; face à Miroir, il faut apprendre à le combattre.*

> Gant blanc, poignet bleu, un nom qui dit tout. Miroir est classé parmi les joueurs les plus modestes du circuit. Il n'a ni stratégie, ni signe préféré, ni cri à lui. Il a pourtant fait douter les meilleurs.

### Ce qu'il fait

Le jeu de Miroir tient en une ligne : trois fois sur quatre, il rejoue le signe que vous venez de jouer. Le reste du temps, il s'en remet au hasard.

Il ne s'arrête pas là. Quand il gagne, il pousse votre cri de victoire. Quand il vous serre la main, il vous rend la vôtre : franche si vous êtes franc, molle si vous êtes mou. On ne sait rien de lui, sinon ce qu'il sait de vous.

### La prophétie de Tirésias

Ovide raconte, dans les *Métamorphoses*, qu'on demanda un jour au devin Tirésias si le petit Narcisse vivrait longtemps. Sa réponse : oui, s'il ne se connaît pas.

On connaît la suite. Le jeune homme, penché sur une source, découvre son reflet, en tombe amoureux, ne peut ni l'étreindre ni s'en détacher, et finit par en mourir. Se connaître l'a perdu, comme annoncé.

Miroir propose le contrat exactement inverse. Contre lui, celui qui ne se connaît pas est perdu. Celui qui rejoue sans y penser son signe préféré, qui revient toujours à la Pierre quand il a peur, qui répète ce qui vient de marcher, voit ses propres coups lui revenir et le battre. Il n'y a qu'une façon de gagner : savoir exactement ce qu'on vient de faire, et refuser de le refaire.

À Delphes, au-dessus du temple d'Apollon, on pouvait lire : *Connais-toi toi-même.* Narcisse en est mort. Contre Miroir, c'est la seule façon de survivre.

### Le reflet qui ne flatte pas

Narcisse avait de la chance, d'une certaine manière. Son reflet était beau. Celui que tend Miroir ne l'est pas toujours : on y voit ses manies, ses refuges, ce petit signe qu'on rejoue dès que le score se resserre. Rien de ce qu'on aimerait montrer, tout ce qu'on croyait cacher.

Le joueur qui découvre cela traverse en général trois étapes. D'abord l'amusement : *tiens, il me copie.* Puis le malaise, quand il comprend qu'il perd contre lui-même. Enfin, s'il est honnête, une forme de gratitude. Aucun entraîneur ne lui aurait montré ses habitudes aussi vite.

### Battre son propre reflet

La méthode, sur le papier, est enfantine. J'ai joué la Pierre ; Miroir jouera probablement la Pierre ; je joue donc la Feuille. Mais regardez ce qu'elle exige, coup après coup : contredire celui qu'on vient d'être. Ne jamais s'aimer assez pour se répéter.

C'est là que se situe l'anti-Narcisse. Le héros d'Ovide ne pouvait pas quitter son image des yeux. Le joueur face à Miroir doit la quitter sans cesse, s'en détourner à chaque coup, la laisser derrière lui comme une peau qu'on abandonne. Gagner contre Miroir, c'est accepter de ne jamais se ressembler deux fois.

Il y a d'ailleurs un piège pour les plus malins. À force de contredire mécaniquement leur coup précédent, ils deviennent prévisibles d'une autre manière, et c'est alors la part de hasard de Miroir qui les punit. Une fois sur quatre, le reflet bouge tout seul. Même un miroir a ses moments d'absence.

### Ce qu'en dit Monique

Monique Latour commente rarement les joueurs de ce niveau. Elle a pourtant eu ce mot à son sujet : « Miroir n'a jamais battu personne. Il a seulement présenté chacun à lui-même. Certains ne s'en sont pas remis. »

### Faut-il le craindre ?

Sans doute pas, si l'on s'en tient au classement. Mais c'est peut-être le mauvais critère. Miroir est moins un adversaire qu'un exercice : celui qui le bat facilement a appris à ne pas se répéter, et celui qui perd contre lui sait désormais, avec une précision cruelle, à quoi il ressemble.

Narcisse s'est noyé dans son image. Contre Miroir, on apprend à nager à contre-courant de la sienne. Et si, à la fin, il pousse votre cri de victoire, ne lui en voulez pas : il ne fait que vous le rendre.

*Exact pour le jeu : Miroir rejoue le dernier signe 3 fois sur 4 (sinon au hasard), copie le cri et la poignée de main (`app/js/bots.js`, `celebrations.js`, `poignee.js`). Tirésias : Ovide, Métamorphoses, livre III.*
