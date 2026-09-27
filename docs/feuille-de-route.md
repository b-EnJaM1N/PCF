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

## Décisions à prendre

- **Service en ligne** : ✅ décidé — Supabase (gratuit au démarrage).
- **Connexion** : ✅ par e-mail, sans mot de passe : lien « Sign in » pour l'instant (Supabase gratuit ne permet pas de modifier l'e-mail), code à 6 chiffres ensuite. Compte facultatif ; la fiche du téléphone est transférée à la création du compte.
- **Envoi d'e-mails** : à brancher avant l'ouverture au public (limite du service inclus).
- **Pseudos** : ✅ décidé — **pseudo avec numéro** (ex. « Benji#4821 »). Plusieurs joueurs peuvent choisir le même pseudo ; le numéro les distingue.
- **Nom du groupe privé** : ✅ décidé — **Cercle**.
- **Niveau entre humains** : ✅ décidé — **niveau officiel** séparé du niveau d'entraînement contre les bots.
- **Vocabulaire** : ✅ un **niveau** est un chiffre (ex. 1200) ; un **classement** est une place (1er, 2e…). Un duel qui compte est un duel **officiel**, sinon **amical**.
- **Nom de l'application** : probablement **Handslam** (à confirmer). On garde PCF en attendant, puis on renommera tout d'un coup.

## Idées notées en chemin

- Remplacer les sons fabriqués et la voix par de vrais enregistrements (noms des fichiers dans `script-des-annonces.md`).
- Applaudissements à l'entrée des joueurs : à garder ou à retirer.
- Notifications sur le téléphone quand on reçoit un défi (appli fermée).
