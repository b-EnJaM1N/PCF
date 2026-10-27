# La bible sonore de HandSlam (brouillon à valider)

Demande du porteur du projet (27 octobre 2026) : d'après les testeurs, l'ambiance sonore fait « artisanal », pas homogène.
But : que tout sonne comme **un seul lieu, un seul soir, une seule retransmission**. Rien n'est enregistré : on valide
cette page, puis on fait un **essai de 4 sons**, puis le reste, quand les crédits ElevenLabs le permettront.

## 1. Pourquoi ça ne sonne pas homogène aujourd'hui
Les descriptions envoyées à ElevenLabs (`outils/sons.json`) racontent des lieux différents :
- « tennis stadium », « basketball arena », « football stadium », et des sons « close-up » (sans écho) à côté de sons
  « with stadium reverb » ;
- des applaudissements polis de tennis à côté de l'orgue de basket, de la corne de brume, des vuvuzelas et des « Olé ! » ;
- chaque son a été fabriqué à part, avec sa propre salle et son propre volume.

## 2. Le choix de l'univers : **A, décidé le 27 octobre**
**A. Le court central couvert, un soir de finale** (conseil de Claude). C'est l'univers du jeu : sets, balles de match,
arbitre, « Silence, s'il vous plaît », Roland et Monique en cabine. Public nombreux et passionné, mais qui se tait pendant
l'échange. Les sons de stade gardés : seulement ceux qui vont avec (la fanfare de victoire, peut-être la montée d'orgue
avant une balle de match) ; pas de vuvuzelas, d'« Olé ! » ni de corne de brume.

**B. L'arène multisport, façon NBA.** Plus d'énergie : orgue, tambours, « Dé-fense ! ». Mais ça va moins bien avec
l'arbitre de tennis, les sets et le silence pendant l'échange : il faudrait revoir aussi ces moments-là.

## 3. La phrase commune (à mettre au début de chaque description)
Pour l'univers A :
> *Same venue for every sound: a large indoor tennis arena with about 5,000 spectators, evening final, warm natural hall reverb,
> heard from the TV broadcast microphones near the court, consistent loudness, no music.*

Puis la description propre au son, courte. Les sons du geste (« raquette ») gardent la même salle, mais entendus de près.

## 4. Les sons à refaire (univers A)
| Son | Description propre (après la phrase commune) | Durée |
|---|---|---|
| `public_fond_01` | Crowd murmur between points, calm, steady, seamless loop | 30 s |
| `public_tension_01` | The crowd goes quiet and nervous before a match point, a few whispers | 6 s |
| `public_ooh_01` | The whole crowd reacts "ooh" to a very close point | 2 s |
| `public_point_01` | Short applause after a point, medium | 3 s |
| `public_clameur_01` | Big cheer after a great point, then applause | 3 s |
| `public_set_01` | Warm applause with cheers at the end of a set | 5 s |
| `public_ovation_01` | Standing ovation for the champion, huge cheers and applause | 8 s |
| `public_allez_01` à `_03` | A French spectator (or a few) shouting "Allez !" in the stands | 1,5 à 2 s |
| `public_bravo_01`, `_02` | A French spectator calling "Bravo !", a few claps | 2 s |
| `public_oh_decu_01`, `_02` | The crowd groans in disappointment, "ohhh" | 2 s |
| `public_brouhaha_01`, `_02` | The crowd chatters excitedly after a long rally, then settles | 4 s |
| `public_rires_01`, `_02` | The crowd laughs warmly together, then settles | 2,5 s |
| `raquette_*` (6 sons) | Mêmes idées qu'aujourd'hui (Pierre grave, Ciseaux qui claquent, Feuille qui souffle), entendus de près, dans la même salle | 1 à 1,5 s |
| `stade_fanfare_victoire_01` | Short triumphant brass fanfare played in the arena after the final point | 5 s |

**Le geste garde un son de raquette** (décidé le 27 octobre). Les descriptions sont prêtes dans `outils/sons.json` : la phrase
commune y est ajoutée automatiquement (`_salle`) ; les autres sons de stade (orgue, corne, vuvuzelas…) n'y ont pas droit et ne
seront pas joués.

## 5. L'ordre
1. ~~Le choix de l'univers et de la raquette~~ : A et raquette (27 octobre).
2. **Essai de 4 sons** : robot « Voix », choix « sons », avec ces noms : `public_fond_01,public_point_01,public_ovation_01,raquette_pierre_01`
   (ils remplacent les anciens). Il écoute sur la version de test.
3. Si ça lui plaît : le reste des sons du tableau, en un seul lot (robot « Voix », choix « sons », avec la liste des noms).
4. Les nouveaux commentaires (banque `docs/repliques-banque-brouillon.md`), eux aussi en un seul lot, avec les mêmes réglages
   de voix que les anciens (`docs/voix-elevenlabs.md`).

## 6. Côté code (sans crédits)
- **Fait le 27 octobre** : la salle baisse sous la voix de Roland, Monique et des autres voix, comme à la télévision ; le coup
  de raquette reste au même niveau (`SOUS_LA_VOIX` dans `app/js/ambiance.js`).
- Après les nouveaux sons : régler les volumes ensemble, à l'écoute, sur la version de test.
- Plus tard, à essayer : une légère couleur « micro de télévision » sur les voix des commentateurs.
