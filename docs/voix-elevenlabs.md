# Les voix ElevenLabs : choix et réglages

Page à ouvrir **sur l'ordinateur** pendant la séance : chaque phrase de test est prête à copier-coller dans
ElevenLabs › Text to Speech. Modèle : **Eleven v3**. Les indications entre crochets (`[deadpan]`…) sont jouées, pas lues.

Abonnement : Starter (1,11 € le premier mois, puis 6,67 €/mois) — **penser à résilier le renouvellement**.

## Décision
On commence par **les deux commentateurs** : 353 répliques, environ 14 200 caractères. Le speaker (171 répliques, dont les surnoms)
et la journaliste (8) attendront qu'il y ait du monde dans l'appli ; leurs répliques restent affichées par écrit.

## Les voix choisies

| Rôle | Voix | Voice ID | Réglages | Indication |
|---|---|---|---|---|
| Monique Latouffe (commentatrice) | **Camille Martin** ✅ | `hFgOzpmS0CMtL2to8sAl` | Stability haute (70-80 %), Style bas (≈ 0) | `[deadpan]` |
| Roland Pignon (commentateur) | ✅ (nom à préciser) | `pwONJQic3ZwHTFG8D6uM` | Stability basse, Style plus haut | `[excited]` |
| Speaker | ⏸ plus tard (quand il y aura du monde et des finales) | | Stability moyenne, un peu lent | `[shouting]` ou rien |
| Arbitre | ✅ | `lm3gOYJiClKJc7YaR3r1` | Stability haute, Style 0 | aucune |
| Journaliste | ⏸ plus tard | | Stability moyenne | aucune |

## La génération automatique (le robot « Voix »)
- Les réglages sont dans `outils/voix.json` (Voice ID, indication de jeu par personnage, textes spéciaux pour une réplique).
- **Tons selon la situation** (`tons` dans `outils/voix.json`), réglage « créatif » (stability 0) pour plus de variété :
  - Roland : enflammé `[excited] [shouting]` (balle de match, victoire, remontée…), fébrile `[nervous] [whispers]` (tension, set décisif), amusé `[laughs]` (craquage, obstination), déçu `[sighs] [disappointed]` (défaite), sinon `[excited]` ;
  - Monique : imperturbable `[calm] [deadpan]` (grands moments, tension), cassante `[sarcastic]` (craquage, série perdue…), blasée `[sighs] [bored]` (défaite, set écrasant), sinon `[deadpan]`.
  - Robot : « essai » refait 10 répliques variées ; « tout-refaire » refait les rôles choisis en entier.
- Le programme `outils/generer-voix.js` envoie chaque réplique à ElevenLabs et range le fichier dans `app/audio/` sous le bon nom.
  Il ne refait jamais un fichier déjà présent : on peut relancer sans repayer.
- Le robot GitHub `.github/workflows/voix.yml` le lance : onglet **Actions → Voix → Run workflow**, choisir la branche,
  puis « essai » (10 répliques) ou « tout ». Il enregistre les fichiers et relance la mise en ligne.
- La clé ElevenLabs est rangée dans le coffre-fort de GitHub (**Settings → Secrets and variables → Actions**, nom
  `ELEVENLABS_API_KEY`) : elle n'est jamais écrite dans le code.
- Pour refaire une réplique ratée : dans « ids », mettre son identifiant (le nom du fichier sans `.mp3`).
- Total pour les trois voix : 443 répliques, environ 19 800 caractères (indications de jeu comprises).

## Les bruitages du court
- Réglages : `outils/sons.json` (13 sons : un coup de raquette par signe, en version normale et forte pour les balles de set et de match, murmure du public en boucle, tension, « ooh », applaudissements, clameur, fin de set, ovation).
- Robot « Voix » : choisir **sons-essai** (Pierre normal et fort, applaudissements) puis **sons** (tous). Pour refaire un son : **sons** + son nom dans « ids ».

## Phrases de test

### Monique (validée)
```
[deadpan] C'est une dinguerie… Comme disent les jeunes.
```
```
[deadpan] Muscle ton jeu, Robert. Muscle ton jeu.
```

### Roland Pignon : un commentateur sportif qui s'emballe
```
[excited] Il a craqué son slip !
```
```
[excited] La main du siècle ! Qui va réussir à l'arrêter ?
```
```
[excited] Des pierres, des pierres, des pierres, des pierres, des pierres !
```

### Speaker : grandiloquent, comme un présentateur de boxe
```
[shouting] Mesdames et messieurs… bienvenue pour ce duel !
```
```
À ma gauche… Le Cobra… du PMU !
```

### Arbitre : sobre, neutre, arbitre de tennis
```
Balle de match, côté jaune.
```
```
Set décisif.
```

### Journaliste : interview télé après une finale
```
Félicitations. Que ressentez-vous ?
```

### Un dialogue pour vérifier que Roland et Monique vont bien ensemble
Roland :
```
[excited] Il a craqué son slip !
```
Monique :
```
[deadpan] Attention que ça ne vous arrive pas.
```
