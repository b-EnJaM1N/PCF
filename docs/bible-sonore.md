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

## 5 bis. Où on en est (28 octobre)
- Essai de 3 sons (applaudissements après un point, ovation, raquette Pierre) : environ 11 crédits par seconde de son.
- Avis du porteur du projet : la raquette, oui ; le reste ne change pas assez, il veut une vraie ambiance de stade, homogène et
  réaliste (applaudissements, « Allez ! », huées, rires). D'où le lot complet du 28 octobre : tous les sons du public et de la
  raquette, avec la phrase commune, plus 2 nouveaux applaudissements (`public_point_02`, `_03`) et des huées avec sifflets
  (`stade_sifflet_01`, refait dans la même salle). La fanfare attend (c'est de la musique : « no music » dans la phrase commune).
- 9 sons du lot sont sortis presque muets (3 « Allez ! », un « ohhh » déçu, le « ooh », 4 raquettes) : leur volume a été remonté
  à la main (ffmpeg, crête à -1,5 dB). Si l'un d'eux sonne mal à l'écoute, on le refait après le 2 novembre.
- À l'écoute (porteur du projet) : plus de public du tout, la raquette trop forte. Cause : ElevenLabs a rendu tout le lot bien plus
  faible que les anciens sons (murmure de fond à -40 dB au lieu de -34). Tous les sons du public ramenés au niveau des anciens
  (murmure un peu plus fort : -29 dB ; réactions vers -20 dB ; ffmpeg avec limiteur), raquette un peu moins forte dans l'appli.
  Pour les prochains sons : vérifier le niveau de chaque fichier généré, et l'ajuster avant de le proposer à l'écoute.

## 6. Côté code (sans crédits)
- **Fait le 27 octobre** : la salle baisse sous la voix de Roland, Monique et des autres voix, comme à la télévision ; le coup
  de raquette reste au même niveau (`SOUS_LA_VOIX` dans `app/js/ambiance.js`).
- **28 octobre** : les sifflets (`stade_sifflet_01`) sont joués, rarement, après un « ooh » ; l'arbitre rappelle alors le public
  à l'ordre (« Je vous demande de vous arrêter »).
- **28 octobre** : le public réagit plus souvent après un point (applaudissements 3 fois sur 10 au lieu de 8 sur 100, plus
  de brouhaha, de « Allez ! » et de « Bravo ! » ; jamais deux points de suite), et les applaudissements durent 2 secondes, un peu
  plus fort.
- Après les nouveaux sons : régler les volumes ensemble, à l'écoute, sur la version de test.
- Plus tard, à essayer : une légère couleur « micro de télévision » sur les voix des commentateurs.
