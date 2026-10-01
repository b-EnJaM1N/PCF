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
   2. Nom de la fonction : `Notifier` (exactement, avec la majuscule : c'est le nom utilisé par le projet).
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

## 1 terdecies. Les jetons (étape 13)

Même manipulation que d'habitude avec [`etape-13-jetons.sql`](etape-13-jetons.sql)
(version brute : https://raw.githubusercontent.com/b-EnJaM1N/PCF/main/supabase/etape-13-jetons.sql).
Elle crée les portefeuilles : 1 000 jetons de bienvenue, bonus quotidien en série (50 à 200), renflouement
sous 100 jetons (+200, une fois par jour) et quelques jetons pour les victoires contre les bots (100 par jour au plus).

## 1 quattuordecies. Les mises en jetons (étape 14)

Même manipulation avec [`etape-14-mises.sql`](etape-14-mises.sql), **après** l'étape 13
(version brute : https://raw.githubusercontent.com/b-EnJaM1N/PCF/main/supabase/etape-14-mises.sql).
Supabase peut afficher « Potential issue detected » : c'est normal, confirmer.
Elle ajoute les mises (50, 100, 200, 500 ou 1 000 jetons) aux défis, à la Partie rapide et aux Sit & Go à 8,
avec 10 % de commission.

## 1 quindecies. Freeroll, défis du jour, classement du mois (étape 15)

Même manipulation avec [`etape-15-freeroll.sql`](etape-15-freeroll.sql), **après** l'étape 14
(version brute : https://raw.githubusercontent.com/b-EnJaM1N/PCF/main/supabase/etape-15-freeroll.sql).
Supabase peut afficher « Potential issue detected » : c'est normal, confirmer.

## 1 sedecies. Rappel du freeroll (étape 16)

1. Même manipulation avec [`etape-16-rappel-freeroll.sql`](etape-16-rappel-freeroll.sql)
   (version brute : https://raw.githubusercontent.com/b-EnJaM1N/PCF/main/supabase/etape-16-rappel-freeroll.sql).
   Elle active le minuteur du serveur (pg_cron) : chaque soir vers 19 h 50, les inscrits au freeroll sont prévenus.
2. **Mettre à jour la fonction « Notifier »** : **Edge Functions** → **Notifier** → onglet **Code** →
   remplace tout le code par la nouvelle version de [`functions/notifier/index.ts`](functions/notifier/index.ts)
   (version brute : https://raw.githubusercontent.com/b-EnJaM1N/PCF/main/supabase/functions/notifier/index.ts) → **Deploy**.

## 1 septendecies. La boutique (étape 17)

Même manipulation avec [`etape-17-boutique.sql`](etape-17-boutique.sql)
(version brute : https://raw.githubusercontent.com/b-EnJaM1N/PCF/main/supabase/etape-17-boutique.sql).

## 1 duodevicies. Les tournois programmés (étape 18)

1. Même manipulation avec [`etape-18-tournois-programmes.sql`](etape-18-tournois-programmes.sql)
   (version brute : https://raw.githubusercontent.com/b-EnJaM1N/PCF/main/supabase/etape-18-tournois-programmes.sql).
   Supabase peut afficher « Potential issue detected » : c'est normal, confirmer.
   Elle crée le programme (Le Midi, L'Apéro, Le Nocturne, le Grand Chelem du dimanche) et un minuteur (toutes les 5 minutes)
   qui prévient les inscrits 10 minutes avant le départ.
2. **Mettre à jour la fonction « Notifier »** (même manipulation qu'à l'étape 16) : le message du rappel des tournois programmés.

## 1 undevicies. Les dotations façon poker (étape 19)

Même manipulation avec [`etape-19-dotations.sql`](etape-19-dotations.sql), **après** l'étape 18
(version brute : https://raw.githubusercontent.com/b-EnJaM1N/PCF/main/supabase/etape-19-dotations.sql).

## 2. Adresses du site (connexion par lien)

Sans service d'envoi personnel (« custom SMTP »), Supabase n'autorise pas à modifier les e-mails :
le joueur reçoit donc l'e-mail par défaut « Your sign-in link » et touche **« Sign in »**.
Le lien le ramène dans PCF, connecté. Il faut autoriser les adresses de retour :

1. Ouvre https://supabase.com/dashboard/project/fvfdcyglwngosxfougje/auth/url-configuration
2. **Site URL** : `https://handslam.fr/` → **Save**.
3. **Redirect URLs** → **Add URL** : `https://handslam.fr/**` → **Save**.
   (Les deux étoiles couvrent aussi la version de test `/preview/`. On garde aussi l'ancienne adresse
   `https://b-enjam1n.github.io/PCF/**`, qui renvoie désormais vers handslam.fr.)

## 3. E-mails en français, avec un code à 6 chiffres (Brevo)

Service d'envoi : **Brevo** (gratuit jusqu'à 300 e-mails par jour), compte contact.handslam@gmail.com.

1. **Domaine** : dans Brevo, domaine handslam.fr authentifié (4 lignes dans la zone DNS d'OVH :
   TXT « brevo-code » sur @, CNAME brevo1._domainkey et brevo2._domainkey, TXT _dmarc), et une seule ligne SPF :
   `v=spf1 include:mx.ovh.com include:spf.brevo.com ~all`. Expéditeur `noreply@handslam.fr` vérifié dans Brevo
   grâce à une redirection OVH (Emails → Redirections) : noreply@ et contact@handslam.fr → contact.handslam@gmail.com.
2. **SMTP** : Brevo → https://app.brevo.com/settings/keys/smtp → clé SMTP « Supabase » (secrète : seulement dans Supabase).
   Supabase → **Authentication → Emails → SMTP Settings** : Enable Custom SMTP, Sender email `noreply@handslam.fr`,
   Sender name `HandSlam`, Host `smtp-relay.brevo.com`, Port `587`, Username = l'identifiant Brevo (`…@smtp-brevo.com`),
   Password = la clé SMTP.
3. **Modèles** : Supabase → **Authentication → Emails → Templates**, « Magic Link » et « Confirm signup » :
   - **Subject** : `Ton code HandSlam : {{ .Token }}`
   - **Body** (en une ligne) :

```html
<h2>Ton code de connexion à HandSlam</h2><p style="font-size:32px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p><p>Tape ce code dans l'application. Il est valable une heure.</p><p>Tu peux aussi <a href="{{ .ConfirmationURL }}">te connecter avec ce lien</a>.</p><p>Si tu n'as rien demandé, ignore cet e-mail.</p>
```

L'application accepte les deux : le code (conseillé, surtout pour l'appli installée sur l'écran d'accueil) et le lien.

## Bon à savoir

- **Limite d'e-mails** : Brevo gratuit envoie jusqu'à 300 e-mails par jour. Supabase limite aussi le nombre
  d'e-mails de connexion par heure (Authentication → Rate Limits), réglable si besoin.
- **Pause** : un projet gratuit sans aucune activité pendant une semaine est mis en pause ;
  on le relance d'un clic depuis le tableau de bord.
- **Clés** : seule la clé publique (`sb_publishable_…`) figure dans le code (`app/js/config.js`).
  La clé secrète et le mot de passe de la base ne doivent **jamais** être écrits dans le projet.
