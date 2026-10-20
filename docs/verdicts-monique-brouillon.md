# Le verdict de Monique — brouillon (à retravailler par le porteur du projet)

**Le problème** : en duel entre deux humains, chaque téléphone tire ses commentaires de son côté. La phrase de Monique
reprise sur La Une n'a donc été entendue que par un des deux joueurs.

**La solution retenue (A, 20 octobre)** : à la fin d'un duel entre humains, Monique prononce un **verdict** sur les deux
téléphones, juste après « Jeu, set et match ». La phrase est la même des deux côtés (tirée au sort à partir du numéro du duel),
et c'est elle qui apparaît sur La Une, dans l'encadré « LE VERDICT ». Contre les bots, rien ne change.

**Contraintes d'écriture** : ni « il » ni « elle », aucun nom (les phrases sont enregistrées une fois pour toutes) ;
courtes (90 caractères au plus pour La Une) ; le ton de Monique : glaciale, élégante, jamais impressionnée.

**Ordre des situations** (la première qui correspond au match l'emporte), avec la première proposition de Claude,
**non validée** (« ça ne me convient pas », 20 octobre) :

1. **Balles de match sauvées par le vainqueur**
   - Le match était perdu. Quelqu'un a oublié de le dire au vainqueur.
   - À un point de la sortie. Et pourtant.
   - Sauver une balle de match, c'est bien. Gagner ensuite, c'est mieux.
   - Il fallait oser. Il fallait surtout survivre.
2. **Remontée** (premier set perdu, match gagné)
   - Mené, puis vainqueur. Ce n'est pas élégant, mais ça compte.
   - Un premier set pour rien. Les suivants pour tout.
   - On croyait l'affaire pliée. Elle a été dépliée.
   - Je déteste les remontées. Celle-ci était méritée.
3. **Set blanc** (un set gagné sans perdre un point)
   - Un set sans un seul point concédé. C'est rare. C'est cruel.
   - Un set blanc. Je n'en parlerai pas. Le perdant non plus, j'imagine.
4. **Victoire écrasante** (aucun set perdu, peu de points concédés)
   - Aucun suspense. Mais c'était propre.
   - Une leçon. Espérons qu'elle a été prise en notes.
   - Je n'ai rien à ajouter. Le score a tout dit.
   - Expéditif. On aurait presque pu ne pas venir.
   - Une démonstration. L'autre côté du filet a surtout regardé.
5. **Match serré** (set décisif, ou sets gagnés de 2 points)
   - Deux points d'écart. Autant dire un cheveu.
   - Ça s'est joué à rien. Le rien a choisi son camp.
   - Personne n'a démérité. Une seule personne a gagné.
   - Les nerfs ont parlé. Pas tous dans la même langue.
   - Tendu de bout en bout. J'ai failli lever un sourcil.
6. **Beaucoup d'égalités**
   - Deux esprits identiques. Un seul vainqueur.
   - Ils pensaient pareil. Le vainqueur a pensé une seconde plus tôt.
   - Tant d'égalités. J'ai cru à un miroir.
7. **Tous les autres matchs**
   - Un match. Un vainqueur. C'est ainsi que ça marche.
   - Correct. Rien de plus, rien de moins.
   - Le meilleur a gagné. Aujourd'hui.
   - J'ai vu pire. J'ai vu mieux. J'ai surtout vu un vainqueur.
   - Bien joué. Je ne le dirai pas deux fois.
   - La revanche ? Je serai là. Je suis toujours là.
   - Bon match. Ne vous y habituez pas, je dis rarement ça.

**Ensuite** : quand la liste est validée, Claude code le verdict (choix commun aux deux téléphones, affichage, La Une),
puis les phrases sont enregistrées avec le robot « Voix ».
