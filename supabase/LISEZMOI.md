# Réglages du projet Supabase de PCF

Projet : `https://fvfdcyglwngosxfougje.supabase.co` (région Europe, Paris).
Tous ces réglages se font une seule fois, depuis le site supabase.com (le navigateur du téléphone suffit).

## 1. Créer la base de données (étape 2)

1. Ouvre https://supabase.com/dashboard/project/fvfdcyglwngosxfougje/sql/new
2. Copie **tout** le contenu du fichier [`etape-2-comptes.sql`](etape-2-comptes.sql) et colle-le dans l'éditeur.
3. Touche **Run**. Le message attendu est « Success. No rows returned ».

Le script peut être relancé sans risque. Il est testé automatiquement (`tests/base-de-donnees/`).

## 1 bis. Duels en ligne (étape 3)

Même manipulation avec le fichier [`etape-3-duels.sql`](etape-3-duels.sql), **après** celui de l'étape 2 :
SQL Editor → New query → coller tout le fichier → **Run** (confirmer si Supabase affiche
« Potential issue detected »). Le script active aussi les mises à jour en direct (Realtime) des duels.

## 1 ter. Niveau officiel, amis et cercles (étape 4)

Même manipulation avec le fichier [`etape-4-classement.sql`](etape-4-classement.sql), **après** celui de l'étape 3.
Il ajoute le niveau officiel (calculé par le serveur à la fin de chaque duel officiel), les amis et les cercles.
À relancer après l'étape 3 si celle-ci est relancée un jour (la recherche afficherait sinon l'ancien niveau).

## 1 quater. Formats courts (match en 1 set, sets de 3 et 1 point)

Même manipulation avec le fichier [`etape-4b-formats.sql`](etape-4b-formats.sql), **après** celui de l'étape 4.
Si un jour on relance les étapes 3 ou 4, il faut relancer ensuite celui-ci.

## 2. Adresses du site (connexion par lien)

Sans service d'envoi personnel (« custom SMTP »), Supabase n'autorise pas à modifier les e-mails :
le joueur reçoit donc l'e-mail par défaut « Your sign-in link » et touche **« Sign in »**.
Le lien le ramène dans PCF, connecté. Il faut autoriser les adresses de retour :

1. Ouvre https://supabase.com/dashboard/project/fvfdcyglwngosxfougje/auth/url-configuration
2. **Site URL** : `https://b-enjam1n.github.io/PCF/` → **Save**.
3. **Redirect URLs** → **Add URL** : `https://b-enjam1n.github.io/PCF/**` → **Save**.
   (Les deux étoiles couvrent aussi la version de test `/PCF/preview/`.)

## 3. Plus tard : code à 6 chiffres et e-mails en français

Une fois un service d'envoi branché (**Authentication → Emails → Set up SMTP**), on pourra modifier
les modèles « Magic Link » et « Confirm signup » pour envoyer un code en français :

- **Subject** : `Ton code PCF : {{ .Token }}`
- **Body** :

```html
<h2>Ton code de connexion à PCF</h2>
<p style="font-size:32px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
<p>Tape-le dans l'application. Il est valable une heure.</p>
```

L'application accepte déjà les deux : le lien et le code.

## Bon à savoir

- **Limite d'e-mails** : le service d'envoi inclus gratuitement est limité à quelques e-mails par heure,
  et peut n'accepter que les adresses des membres du projet Supabase (utilise celle de ton compte Supabase).
  Suffisant pour tester ; avant d'ouvrir l'application au public, il faudra brancher un service
  d'envoi (plusieurs sont gratuits jusqu'à quelques milliers d'e-mails par mois).
- **Pause** : un projet gratuit sans aucune activité pendant une semaine est mis en pause ;
  on le relance d'un clic depuis le tableau de bord.
- **Clés** : seule la clé publique (`sb_publishable_…`) figure dans le code (`app/js/config.js`).
  La clé secrète et le mot de passe de la base ne doivent **jamais** être écrits dans le projet.
