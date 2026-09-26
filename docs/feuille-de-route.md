# Feuille de route de PCF

## Étapes

1. **Mode solo** : bots, fiche joueur, tournoi, statistiques gardées sur le téléphone. *Fait, en attente de validation.*
2. **Comptes joueurs** : inscription, pseudo, avatar, fiche joueur sauvegardée en ligne. Service proposé : Supabase (à valider).
3. **Duel en ligne** : un serveur vérifie les coups (anti-triche), gestion des déconnexions.
   - **Défier un ami avec une barre de recherche** : on tape un pseudo, les joueurs correspondants s'affichent (avatar, niveau), bouton « Défier » ; l'ami reçoit l'invitation dans l'application.
   - **Défi par lien**, pour inviter quelqu'un qui n'a pas encore l'application.
   - Option « Ne pas apparaître dans la recherche ».
4. **Niveau ELO entre joueurs humains, amis et groupes privés.**
   - **Groupe privé**, nom envisagé : **Club** (autres idées : Cercle, Ligue, Écurie). Un nom, un blason, des invitations par lien ou par la recherche, la liste des membres et le **classement du club**. Un joueur peut être dans plusieurs clubs (famille, travail, amis). Le club remplace le « classement entre amis ».
5. **Tournois en ligne**, dont les **tournois de club**.

## Décisions à prendre

- **Service en ligne** pour les comptes, la base de données et le temps réel : Supabase proposé (gratuit au démarrage).
- **Pseudos** (à décider à l'étape 2) : pseudo unique (premier arrivé) ou pseudo avec numéro (ex. « Benji#4821 ») ?
- **Nom du groupe privé** : Club, Cercle, Ligue ou Écurie ?

## Idées notées en chemin

- Remplacer les sons fabriqués et la voix par de vrais enregistrements (noms des fichiers dans `script-des-annonces.md`).
- Applaudissements à l'entrée des joueurs : à garder ou à retirer.
