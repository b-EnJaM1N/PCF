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

## 1 quinquies. Tournois en ligne (étape 5)

Même manipulation avec le fichier [`etape-5-tournois.sql`](etape-5-tournois.sql), **après** ceux des étapes 4 et 4b.

## 1 sexies. Sit & Go publics (étape 6)

Même manipulation avec le fichier [`etape-6-sit-and-go.sql`](etape-6-sit-and-go.sql), **après** celui de l'étape 5.
Si un jour on relance les étapes 3 ou 5, il faut relancer celui-ci ensuite.

## 1 septies. Partie rapide (étape 7)

Même manipulation avec le fichier [`etape-7-partie-rapide.sql`](etape-7-partie-rapide.sql), **après** celui de l'étape 6.
Si un jour on relance les étapes 3, 5 ou 6, il faut relancer celui-ci ensuite.

## 1 octies. Calibrage du niveau officiel (étape 8)

Même manipulation avec le fichier [`etape-8-calibrage.sql`](etape-8-calibrage.sql), **après** celui de l'étape 7.
Si un jour on relance l'étape 4, il faut relancer celui-ci ensuite.

## 1 nonies. Poignée de main (étape 9)

Même manipulation avec le fichier [`etape-9-poignee.sql`](etape-9-poignee.sql), **après** celui de l'étape 8.

## 1 decies. Signalements et réveil quotidien (étape 10)

Même manipulation avec le fichier [`etape-10-moderation.sql`](etape-10-moderation.sql), **après** celui de l'étape 9.

**Voir les signalements** : dans Supabase, **Table Editor** → dans la liste à gauche, **signalements_a_traiter**.
Chaque ligne indique le motif, le pseudo signalé, les précisions éventuelles et qui a signalé.

**Retirer un pseudo toi-même** (sans attendre 3 signalements) : copie l'« identifiant_du_joueur » de la ligne,
puis dans **SQL Editor** : `select moderer_pseudo('colle-l-identifiant-ici');` → **Run**.
Le pseudo devient « Joueur » et ne pourra plus être repris.

**Classer un signalement** (comportement, avatar) une fois traité : dans **SQL Editor** :
`update signalements set traite = true where id = 12;` (le numéro est la colonne « id » de la vue).

**Réveil quotidien** : chaque jour, GitHub appelle Supabase pour éviter la mise en pause du projet gratuit
(onglet **Actions** du dépôt → « Réveil de Supabase »). Rien à faire.

## 1 undecies. Notifications (étape 11)

Deux choses à faire, dans cet ordre :

1. **Le fichier SQL** : même manipulation que d'habitude avec [`etape-11-notifications.sql`](etape-11-notifications.sql).
2. **La fonction « notifier »** (le petit programme qui envoie les notifications) :
   1. Dans Supabase, menu de gauche : **Edge Functions** → **Deploy a new function** → **Via Editor**.
   2. Nom de la fonction : `notifier` (exactement).
   3. Efface l'exemple, puis colle tout le contenu de
      [`functions/notifier/index.ts`](functions/notifier/index.ts)
      (version brute : https://raw.githubusercontent.com/b-EnJaM1N/PCF/main/supabase/functions/notifier/index.ts).
   4. **Deploy function**.
   5. Dans la page de la fonction : **Details** (ou **Settings**) → désactive **Verify JWT with legacy secret**
      (ou « Enforce JWT verification ») → **Save**. Sans ça, la base ne peut pas l'appeler.

Aucune clé à copier : la fonction crée elle-même ses clés d'envoi au premier appel et les garde dans la base.
Pour vérifier : dans l'appli, **Options (⚙️)** → **Notifications** → **Activer les notifications**.

## 1 duodecies. Notification de test (étape 12)

1. Même manipulation que d'habitude avec [`etape-12-test-notification.sql`](etape-12-test-notification.sql).
2. **Mettre à jour la fonction « notifier »** : **Edge Functions** → **notifier** → onglet **Code** →
   remplace tout le code par la nouvelle version de [`functions/notifier/index.ts`](functions/notifier/index.ts) →
   **Deploy** (les réglages, dont « Verify JWT » désactivé, sont conservés).

Ensuite, dans l'appli : **Options (⚙️)** → **Notifications** → **Envoyer une notification de test**.

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
