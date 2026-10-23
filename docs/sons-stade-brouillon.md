# Les sons de stade (brouillon à valider)

Proposés le 23 octobre 2026, à la demande du porteur du projet : des petites ambiances d'instruments entre les points, comme
dans un stade ou en NBA. **Rien n'est enregistré** : à valider, puis à générer avec ElevenLabs Sound Effects
(robot GitHub « Voix », choix « sons » ; les descriptions iront dans `outils/sons.json`).

Règles : jamais pendant le choix du coup, seulement entre les points ; chaque son reste rare (pas plus d'une fois par set
pour la plupart) ; des airs **originaux** dans l'esprit des stades, jamais une musique connue et protégée ; un réglage pour
les couper (Options › Son).

| # | Son (identifiant) | Ce qu'on entend | Quand | Durée |
|---|---|---|---|---|
| 1 | `stade_charge_01` | Trompette de stade qui sonne la charge (« ta-ta-ta-taaa… »), puis la foule crie « Charge ! » | Après 3 points gagnés d'affilée (une fois par set au plus) | 4 s |
| 2 | `stade_orgue_montee_01` | Orgue de salle de basket : petite mélodie qui monte, qui monte… | Juste avant une balle de set ou de match pour moi | 4 s |
| 3 | `stade_orgue_defense_01` | Orgue puis foule qui scande « Dé-fense ! » en rythme, deux fois | Quand l'adversaire a une balle de set ou de match | 4 s |
| 4 | `stade_corne_01` | Corne de brume de stade (« POUUUET »), longue et grave | À la fin d'un set gagné | 2,5 s |
| 5 | `stade_tambour_01` | Gros tambour des tribunes : « boum, boum… clap ! », trois fois | Quand je suis mené de 3 points ou plus (une fois par set) | 5 s |
| 6 | `stade_orgue_entree_01` | Petit air d'orgue joyeux et entraînant | À l'entrée des joueurs (présentation du match), de temps en temps | 5 s |
| 7 | `stade_vuvuzela_01` | Quelques vuvuzelas qui soufflent ensemble, un peu ridicules | Après un point très disputé (5 égalités d'affilée), rarement | 3 s |
| 8 | `stade_ole_01` | La foule qui chante « Olé ! » trois fois | Après 5 points gagnés d'affilée | 4 s |
| 9 | `stade_fanfare_victoire_01` | Petite fanfare de cuivres triomphale, courte | Fin d'un match gagné en finale (playoffs, coupe) | 5 s |
| 10 | `stade_sifflet_01` | Sifflets moqueurs et « Bouuuh » léger et bon enfant | Quand l'adversaire rate une balle de match | 3 s |

**Descriptions pour ElevenLabs (en anglais)**
1. Stadium trumpet playing the classic short "charge" bugle call, then a big crowd shouting "Charge!", arena reverb
2. Basketball arena organ playing a short rising chromatic build-up, tension, arena reverb, no crowd voices
3. Arena organ riff followed by a big crowd chanting "De-fense! De-fense!" rhythmically, basketball arena
4. Loud deep stadium air horn blast, single long blast, arena reverb
5. Stadium crowd stomping on bleachers and clapping, big drum, "boom boom clap" rhythm three times, arena reverb
6. Upbeat cheerful arena organ jingle, short, catchy, sports arena
7. A few vuvuzelas blowing together in a stadium, short, slightly comical
8. Football stadium crowd chanting "Olé! Olé! Olé!", short
9. Short triumphant brass fanfare, stadium celebration, bright and joyful
10. Stadium crowd playful whistling and light good-natured booing, short

**Coût** : ElevenLabs compte les bruitages selon leur durée ; une quarantaine de secondes en tout (à vérifier sur la page des
crédits). On peut commencer par 2 ou 3 sons en essai (choix « sons-essai »).
