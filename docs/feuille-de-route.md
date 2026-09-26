# Feuille de route de PCF

## Étapes

1. **Mode solo** : bots, fiche joueur, tournoi, statistiques gardées sur le téléphone. *Fait, en attente de validation.*
2. **Comptes joueurs** : inscription, pseudo, avatar, fiche joueur sauvegardée en ligne. Service proposé : Supabase (à valider).
3. **Duel en ligne** : un serveur vérifie les coups (anti-triche), gestion des déconnexions.
   - **Défier un ami avec une barre de recherche** : on tape un pseudo, les joueurs correspondants s'affichent (avatar, niveau), bouton « Défier » ; l'ami reçoit l'invitation dans l'application.
   - **Défi par lien**, pour inviter quelqu'un qui n'a pas encore l'application.
   - Option « Ne pas apparaître dans la recherche ».
4. **Niveau ELO entre joueurs humains, amis et groupes privés.**
   - **Groupe privé**, nom retenu : **Cercle** ou **Club** (choix final à faire). Un nom, un blason, des invitations par lien ou par la recherche, la liste des membres et le **classement du cercle**. Un joueur peut être dans plusieurs cercles (famille, travail, amis). Il remplace le « classement entre amis ».
5. **Tournois en ligne**, dont les **tournois de cercle**.

## Décisions à prendre

- **Service en ligne** pour les comptes, la base de données et le temps réel : Supabase proposé (gratuit au démarrage).
- **Pseudos** : ✅ décidé — **pseudo avec numéro** (ex. « Benji#4821 »). Plusieurs joueurs peuvent choisir le même pseudo ; le numéro les distingue.
- **Nom du groupe privé** : **Cercle** (préféré) ou **Club**.

## Idées notées en chemin

- Remplacer les sons fabriqués et la voix par de vrais enregistrements (noms des fichiers dans `script-des-annonces.md`).
- Applaudissements à l'entrée des joueurs : à garder ou à retirer.
