# PCF — Pierre-Ciseaux-Feuille, le sport numérique

Des matchs en sets de 11 points, un arbitre, un commentateur, un public, une fiche joueur et des tournois.
La vision complète est dans `PCF-document-de-projet.pdf` ; le prototype d'origine dans `pcf-prototype.html`.

## Jouer

L'application a trois onglets : **Jouer** (Défier un ami, Sit & Go, Tournois, Entraînement contre les bots),
**Cercles** (amis et groupes privés) et **Ma fiche** ; les Options sont derrière la roue ⚙️. Pendant un match,
l'écran de jeu prend toute la place.


- **Version validée** (branche `main`) : https://b-enjam1n.github.io/PCF/
- **Version à tester** (dernière branche de travail) : https://b-enjam1n.github.io/PCF/preview/

Pour l'installer comme une application : ouvre le lien dans Safari (iPhone) ou Chrome (Android),
puis « Sur l'écran d'accueil » / « Installer l'application ». Le détail est dans les Options (roue ⚙️ en haut à droite).

## Règles officielles

| Règle | Valeur |
|---|---|
| Points par set | 11, avec 2 points d'écart (options : 7 avec 2 points d'écart ; 3 ou 1 sans écart, le premier au total gagne le set) |
| Égalités (même signe) | Ne comptent pas, le point est rejoué |
| Nombre de sets | 2 ou 3 sets gagnants, choisi avant le match (ou un match en 1 set). En duel, les formats courts (1 set, sets de 3 ou 1 point) sont toujours amicaux |
| Temps par coup | 5 secondes, sinon un signe est joué au hasard |
| Historique | Visible pendant tout le match |
| Pendant l'échange | Aucune animation : révélation immédiate des signes |

Ces règles sont écrites dans `app/js/regles.js` et vérifiées par les tests automatiques (`tests/`).

## Valider une étape depuis le téléphone

1. Ouvre le lien **Version à tester** et joue.
2. Sur GitHub (application mobile ou navigateur), ouvre la **Pull request** de l'étape.
3. Onglet « Checks » : une coche verte ✅ veut dire que tous les tests passent.
4. Si tout te convient : bouton **Merge pull request**, puis **Confirm merge**.
   Environ 1 minute plus tard, la **Version validée** est à jour.
5. Le numéro de version affiché en bas des Options (⚙️) permet de vérifier que tu vois bien la dernière version.

## Voix de l'arbitre et du commentateur

Chaque réplique a un nom, qui est aussi le nom de son fichier audio (ex. `commentateur_craquage_02.mp3`).
La liste complète est dans [`docs/script-des-annonces.md`](docs/script-des-annonces.md).
Pour ajouter un enregistrement : dépose le fichier MP3 dans `app/audio/` (sur GitHub : « Add file » → « Upload files »).
Tant qu'un fichier manque, la réplique est seulement affichée par écrit. La voix de synthèse du téléphone,
jugée trop robotique, est coupée par défaut ; on peut la réactiver dans les Options (⚙️).

## Compte joueur (étape 2)

Le compte est facultatif : on peut toujours jouer en solo sans compte. Avec un compte (e-mail + lien ou code reçu par e-mail,
sans mot de passe), la fiche est sauvegardée en ligne et retrouvée sur n'importe quel téléphone.
Chaque joueur a un pseudo suivi d'un numéro attribué par le serveur (ex. `Benji#4821`).
Réglages du projet Supabase : [`supabase/LISEZMOI.md`](supabase/LISEZMOI.md).

## Duel en ligne (étape 3)

**Jouer › Défier un ami** (compte nécessaire) : chercher un joueur par pseudo (`Benji` ou `Benji#4821`) et le défier,
ou envoyer un lien d'invitation (WhatsApp, SMS…). Le serveur arbitre : chaque signe reste secret jusqu'à ce
que les deux aient joué, le score est calculé par la base de données (mêmes règles que l'application, vérifié
par un test qui compare 40 matchs), 5 secondes par coup. Si un joueur perd la connexion : pause, puis forfait
après 60 secondes. Les duels comptent dans la fiche (statistiques, historique, titres) mais pas dans le niveau.

## Niveau officiel, amis et cercles (étape 4)

Le **niveau officiel** se calcule uniquement sur les duels officiels entre joueurs (formule ELO, départ à 1200,
32 points en jeu), par le serveur : personne ne peut modifier le sien. Le niveau contre les bots reste un
niveau d'entraînement, à part. Au moment du défi, on peut décocher « Match officiel » pour un match amical.
Onglet **Cercles** : ses amis, ses cercles et leurs tournois. Le niveau officiel est affiché dans **Ma fiche**. Détail : son classement, ses amis (demande puis acceptation) et ses **cercles**, des groupes privés
(famille, travail…) avec un blason, un lien d'invitation et leur propre classement.

## Tournois en ligne (étape 5)

Dans **Jouer › Tournois** (ou la page d'un cercle) : un tournoi à élimination directe (de 3 à 32 joueurs), soit dans un cercle (réservé
aux membres), soit privé avec un lien d'invitation. Les têtes de série sont placées selon le niveau officiel.
Chaque tour a une date limite (15 min, 1 h, 24 h ou 3 jours) : les deux joueurs jouent leur match quand ils veulent.
Match non joué à temps : il revient à la personne qui a essayé de le jouer, sinon à la meilleure tête de série.
Au format officiel, les matchs comptent pour le niveau officiel. Tout est arbitré par le serveur.

## Sit & Go (étape 6)

Dans **Jouer › Sit & Go** : des tournois publics de 8, 16, 32 ou 64 joueurs, qui démarrent dès que la salle est pleine.
Il faut rester dans l'application : un inscrit absent plus de 45 s est retiré de la salle. Pendant le tournoi,
chaque match se lance tout seul dès que les deux joueurs sont libres ; 60 secondes pour le rejoindre, sinon forfait.
Format officiel (sets de 11, 2 sets gagnants) : les matchs comptent pour le niveau officiel.

## Organisation du code

```
app/                  l'application publiée (HTML, CSS, JavaScript, sans étape de compilation)
  js/regles.js        règles du jeu (score, sets, fin de match)
  js/bots.js          les 7 bots
  js/analyse.js       lecture des habitudes, indice d'imprévisibilité
  js/annonces.js      ce que disent l'arbitre et le commentateur
  js/voix/script.js   le texte de chaque réplique
  js/voix/lecteur.js  lecture : fichier audio, sinon voix de synthèse
  js/profil.js        fiche joueur, titres, niveau ELO
  js/tournoi.js       le PCF Open
  js/app.js           l'écran
  js/compte.js        connexion et fiche en ligne (Supabase)
  js/synchro.js       règles de synchronisation (quelle fiche garder)
  js/ecran-compte.js  la carte « Mon compte »
  js/duel-logique.js  duel : ce que le téléphone déduit de l'état du serveur
  js/duel-serveur.js  duel : échanges avec le serveur et mises à jour en direct
  js/ecran-duel.js    la page « Défier un ami » (recherche, défis, liens)
  js/social-logique.js  classement, blasons, liens de cercle (sans réseau, testé)
  js/social-serveur.js  classement, amis et cercles : échanges avec le serveur
  js/ecran-cercles.js l'onglet « Cercles » (classement, amis, cercles)
  js/tournoi-logique.js  tournois en ligne : noms des tours, temps restant… (sans réseau, testé)
  js/ecran-tournois.js   tournois en ligne : création, inscriptions, tableau, « Jouer mon match »
  js/ecran-sng.js        Sit & Go : les salles publiques (menu Jouer)
  js/config.js        adresse et clé PUBLIQUE du projet Supabase
  vendor/             bibliothèque Supabase (copie locale)
  sw.js               fonctionnement hors ligne
supabase/             script de la base de données et réglages du projet
tests/                tests automatiques (npm test ; base de données : tests/base-de-donnees/)
outils/               petits scripts (génération du script des annonces, liste des fichiers audio)
.github/workflows/    tests et mise en ligne automatiques à chaque envoi
```

Sur ordinateur : `npm test` lance les tests, `npm run demarrer` lance l'application en local.

## Sécurité

Le dépôt est public : aucun mot de passe ni clé secrète ne doit être écrit dans le code.
Un test automatique vérifie l'absence des clés secrètes les plus courantes.
