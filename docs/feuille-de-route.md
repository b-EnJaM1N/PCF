# Feuille de route de PCF

## Étapes

1. **Mode solo** : bots, fiche joueur, tournoi, statistiques gardées sur le téléphone. *Fait et validé.*
2. **Comptes joueurs** : inscription, pseudo, avatar, fiche joueur sauvegardée en ligne. Service : Supabase (projet en Europe, Paris). Connexion par lien reçu par e-mail (code à 6 chiffres quand un service d'envoi sera branché), compte facultatif. *Fait et validé.*
3. **Duel en ligne** : un serveur vérifie les coups (anti-triche), gestion des déconnexions. *Fait et validé.* Choix validés : pause de 60 s puis forfait ; invitation dans l'appli + lien (notifications plus tard) ; les duels comptent dans la fiche mais pas dans le niveau ; arbitre et commentateur avec répliques adaptées.
   - **Défier un ami avec une barre de recherche** : on tape un pseudo, les joueurs correspondants s'affichent (avatar, niveau), bouton « Défier » ; l'ami reçoit l'invitation dans l'application.
   - **Défi par lien**, pour inviter quelqu'un qui n'a pas encore l'application.
   - Option « Ne pas apparaître dans la recherche ».
4. **Niveau officiel entre joueurs humains, amis et cercles.** *Fait et validé.* Choix validés :
   - **deux niveaux séparés** : le **niveau officiel** (calculé par le serveur, uniquement avec les duels entre humains, départ à 1200) et le niveau d'entraînement contre les bots ;
   - duel **officiel par défaut**, avec une case pour un match amical ; anti-arrangement : au plus 5 duels officiels par jour entre les deux mêmes joueurs, et un duel sans aucun coup joué ne compte pas ;
   - **amis** : demande puis acceptation ;
   - **Cercle** (nom retenu) : un nom, un blason (emblème + couleur), des invitations par lien ou parmi ses amis, un responsable (👑) qui peut renommer, retirer un membre, changer le lien ou supprimer le cercle. Le **classement du cercle** range les membres par niveau officiel, avec leurs victoires et défaites entre membres. Un joueur peut être dans 20 cercles, un cercle compte jusqu'à 100 membres.
5. **Tournois en ligne**, dont les **tournois de cercle**. *Fait et validé.* Choix validés :
   - **élimination directe**, de 3 à 32 joueurs, têtes de série selon le niveau officiel (les meilleures sont exemptées du premier tour s'il manque des joueurs) ;
   - **tournois de cercle** (tout membre peut en organiser un, réservé aux membres) et **tournois privés** par lien ;
   - **chaque tour a une date limite** choisie par l'organisateur (15 min, 1 h, 24 h ou 3 jours), les joueurs jouent leur match quand ils veulent ; le tour suivant commence dès que tous les matchs sont joués ;
   - **match non joué à temps** : il revient à la personne qui a essayé de le jouer ; si personne, à la meilleure tête de série ;
   - l'organisateur choisit le format ; au format officiel, les matchs comptent pour le niveau officiel.

   - **Nouveaux formats** (demandés pendant l'étape 4), en solo et en duel : match en **1 set**, et sets de **3** ou **1 point** en plus de 7 et 11. Sans écart de 2 points pour 3 et 1 (3–2 gagne ; à 1 point, le premier point gagne le set). En duel, ces formats courts sont toujours amicaux. Le tournoi se joue en sets de 11 ou 7.

6. **Tournois en direct, façon poker.** Tout le monde est présent, les matchs s'enchaînent automatiquement, on reste connecté tant qu'on est en lice.
   - **Sit & Go** : *fait et validé.* Salles **publiques** de 8, 16, 32 ou 64 joueurs, départ dès que la salle est pleine. Il faut rester dans l'appli (inscrit absent plus de 45 s : retiré de la salle). Chaque match démarre dès que les deux joueurs sont libres ; **60 secondes pour arriver**, sinon forfait (si aucun des deux ne vient : la meilleure tête de série passe). Format officiel, compte pour le niveau officiel. Un seul Sit & Go à la fois par joueur.
   - **Tournois programmés (MTT)** : *à faire plus tard.* Départ à heure fixe (ex. 20 h) avec les inscrits présents, exempts s'il manque des joueurs. Durée estimée : 30 à 40 min pour 64 joueurs (1 h 30 même pour 1 000). Il faudra probablement les **notifications** (« ton match commence ») et un minuteur côté serveur pour le départ à l'heure.
   - À surveiller : au-delà de quelques centaines de joueurs connectés en même temps, l'offre gratuite de Supabase ne suffira plus (environ 25 $/mois). Façon poker, mais **jamais d'argent en jeu** (réglementation des jeux d'argent).

7. **Navigation simplifiée** : *fait et validé.* Trois onglets (🎮 Jouer, 👥 Cercles, 🧑 Ma fiche) et la roue ⚙️ des Options. « Jouer » est un menu de grandes cartes : défis reçus et matchs à jouer en haut, puis Défier un ami, Sit & Go, Tournois, Entraînement. Le match se joue en plein écran.
8. **Partie rapide** : *faite (à valider).* Deux files : officielle (sets de 11, 2 sets gagnants, compte pour le niveau officiel) et éclair (un set de 7, amicale). Adversaire du niveau le plus proche ; il faut rester sur l'écran. Au bout de 30 s sans adversaire, un bot est proposé, annoncé clairement comme un bot. Adversaire jamais arrivé : partie annulée, sans effet.
9. **Jetons fictifs et boutique** : *plus tard, quand il y aura des joueurs réguliers.* Jetons gagnés (départ + bonus quotidien), droits d'entrée des Sit & Go en jetons et cagnotte partagée, tables selon le niveau officiel, boutique. Trois règles d'or : jamais d'achat de jetons avec de l'argent réel ni de revente (sinon : jeu d'argent) ; la boutique ne vend que de l'apparence (gants, blasons, voix d'arbitre, animations…), jamais d'avantage en jeu ; tout est géré par le serveur.

10. **Le spectacle** : *en cours.* Script des voix validé (`docs/script-v2-brouillon.md`) : speaker, arbitre, commentateur, commentatrice glaciale, journaliste d'après-finale ; surnoms en deux parties ; fausse histoire de la discipline. L'appli est prête : toutes les répliques s'affichent par écrit (réserve de parole, dialogues aux temps morts, présentation du speaker, interview après une finale, surnom au choix dans « Ma fiche »). Voix : ElevenLabs, à enregistrer ensuite (environ 580 fichiers, liste dans `docs/script-des-annonces.md`). « La Une » faite : à la fin de chaque match, une image façon journal sportif à partager (titre selon l'histoire du match, phrase de la commentatrice, chiffre du match). La carte de joueur aussi : dans « Ma fiche », une carte à collectionner en 10 rangs (Bois, Bronze, Argent, Or, Platine, Diamant, Rubis, Maître, Grand Maître, Légende) avec le niveau, le signe favori, le surnom et six notes sur 99, à partager.

## Décisions à prendre

- **Service en ligne** : ✅ décidé — Supabase (gratuit au démarrage).
- **Connexion** : ✅ par e-mail, sans mot de passe : lien « Sign in » pour l'instant (Supabase gratuit ne permet pas de modifier l'e-mail), code à 6 chiffres ensuite. Compte facultatif ; la fiche du téléphone est transférée à la création du compte.
- **Envoi d'e-mails** : à brancher avant l'ouverture au public (limite du service inclus).
- **Pseudos** : ✅ décidé — **pseudo avec numéro** (ex. « Benji#4821 »). Plusieurs joueurs peuvent choisir le même pseudo ; le numéro les distingue.
- **Nom du groupe privé** : ✅ décidé — **Cercle**.
- **Niveau entre humains** : ✅ décidé — **niveau officiel** séparé du niveau d'entraînement contre les bots.
- **Langue** : ✅ français seulement au lancement (l'anglais sera une réécriture, pas une traduction).
- **Voix** : ✅ ElevenLabs (synthèse), un comédien plus tard si le concept prend.
- **Vocabulaire** : ✅ un **niveau** est un chiffre (ex. 1200) ; un **classement** est une place (1er, 2e…). Un duel qui compte est un duel **officiel**, sinon **amical**.
- **Nom de l'application** : à choisir. Idées : **Handslam**, **Hand Up**, **Hand to Hand**, **Mano**. On garde PCF en attendant, puis on renommera tout d'un coup. Avant de choisir : vérifier que le nom est libre (marques à l'INPI, stores, nom de domaine).

## Idées notées en chemin

- Remplacer les sons fabriqués et la voix par de vrais enregistrements (noms des fichiers dans `script-des-annonces.md`).
- Applaudissements à l'entrée des joueurs : à garder ou à retirer.
- Notifications sur le téléphone quand on reçoit un défi (appli fermée).
- **Calibrage du niveau officiel** (étape 8, fait) : départ à 1200 ; pendant les 10 premiers duels officiels, le niveau bouge deux fois plus vite et s'affiche « 1200 ? ».
- **Cérémonie** (décision) : pas de temps mort ni de réclamation, pour garder le rythme rapide des échanges. Le spectacle se concentre sur le début (présentation), le milieu (entre les sets) et la fin du match (poignée de main, La Une, interview).
- **Poignée de main** (étape 9, faite) : 3 secondes pour choisir (franche, normale, légère, froide), sinon le style habituel réglé dans « Ma fiche » ; les bots serrent la main selon leur caractère ; en ligne, chacun voit le choix de l'autre. Les poignées sont comptées dans la fiche (pour un futur titre fair-play).
- **Lancement** : signalement des joueurs et réveil quotidien de Supabase (étape 10, fait) ; notifications (étape 11, fait) ; mentions légales (en attente de l'adresse e-mail de contact) ; e-mails en français (après le choix du nom et d'un domaine).
