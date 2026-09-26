# Réglages du projet Supabase de PCF

Projet : `https://fvfdcyglwngosxfougje.supabase.co` (région Europe, Paris).
Tous ces réglages se font une seule fois, depuis le site supabase.com (le navigateur du téléphone suffit).

## 1. Créer la base de données (étape 2)

1. Ouvre https://supabase.com/dashboard/project/fvfdcyglwngosxfougje/sql/new
2. Copie **tout** le contenu du fichier [`etape-2-comptes.sql`](etape-2-comptes.sql) et colle-le dans l'éditeur.
3. Touche **Run**. Le message attendu est « Success. No rows returned ».

Le script peut être relancé sans risque. Il est testé automatiquement (`tests/base-de-donnees/`).

## 2. Recevoir un code à 6 chiffres au lieu d'un lien

Par défaut, Supabase envoie un lien de connexion. PCF utilise un **code**, plus fiable sur iPhone.

1. Ouvre https://supabase.com/dashboard/project/fvfdcyglwngosxfougje/auth/templates
2. Pour **« Magic Link »** puis pour **« Confirm signup »** :
   - **Subject** : `Ton code PCF : {{ .Token }}`
   - **Body** (remplace tout le contenu) :

```html
<h2>Ton code de connexion à PCF</h2>
<p>Voici ton code :</p>
<p style="font-size:32px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
<p>Tape-le dans l'application. Il est valable une heure.</p>
<p>Si tu n'as rien demandé, ignore simplement cet e-mail.</p>
```

   - Touche **Save**.

## 3. Adresse du site

1. Ouvre https://supabase.com/dashboard/project/fvfdcyglwngosxfougje/auth/url-configuration
2. **Site URL** : `https://b-enjam1n.github.io/PCF/` → **Save**.

## Bon à savoir

- **Limite d'e-mails** : le service d'envoi inclus gratuitement est limité à quelques e-mails par heure.
  Suffisant pour tester ; avant d'ouvrir l'application au public, il faudra brancher un service
  d'envoi (plusieurs sont gratuits jusqu'à quelques milliers d'e-mails par mois).
- **Pause** : un projet gratuit sans aucune activité pendant une semaine est mis en pause ;
  on le relance d'un clic depuis le tableau de bord.
- **Clés** : seule la clé publique (`sb_publishable_…`) figure dans le code (`app/js/config.js`).
  La clé secrète et le mot de passe de la base ne doivent **jamais** être écrits dans le projet.
