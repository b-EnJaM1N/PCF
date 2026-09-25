# PCF — Pierre-Ciseaux-Feuille, le sport numérique

Des matchs en sets de 11 points, un arbitre, un commentateur, un public, une fiche joueur et des tournois.
La vision complète est dans `PCF-document-de-projet.pdf` ; le prototype d'origine dans `pcf-prototype.html`.

## Jouer

- **Version validée** (branche `main`) : https://b-enjam1n.github.io/PCF/
- **Version à tester** (dernière branche de travail) : https://b-enjam1n.github.io/PCF/preview/

Pour l'installer comme une application : ouvre le lien dans Safari (iPhone) ou Chrome (Android),
puis « Sur l'écran d'accueil » / « Installer l'application ». Le détail est dans l'onglet Options.

## Règles officielles

| Règle | Valeur |
|---|---|
| Points par set | 11, avec 2 points d'écart (7 possible dans les Options) |
| Égalités (même signe) | Ne comptent pas, le point est rejoué |
| Nombre de sets | 2 ou 3 sets gagnants, choisi avant le match |
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
5. Le numéro de version affiché en bas de l'onglet Options permet de vérifier que tu vois bien la dernière version.

## Voix de l'arbitre et du commentateur

Chaque réplique a un nom, qui est aussi le nom de son fichier audio (ex. `commentateur_craquage_02.mp3`).
La liste complète est dans [`docs/script-des-annonces.md`](docs/script-des-annonces.md).
Pour ajouter un enregistrement : dépose le fichier MP3 dans `app/audio/` (sur GitHub : « Add file » → « Upload files »).
Tant qu'un fichier manque, c'est la voix de synthèse du téléphone qui lit la réplique.

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
  sw.js               fonctionnement hors ligne
tests/                tests automatiques (npm test)
outils/               petits scripts (génération du script des annonces, liste des fichiers audio)
.github/workflows/    tests et mise en ligne automatiques à chaque envoi
```

Sur ordinateur : `npm test` lance les tests, `npm run demarrer` lance l'application en local.

## Sécurité

Le dépôt est public : aucun mot de passe ni clé secrète ne doit être écrit dans le code.
Un test automatique vérifie l'absence des clés secrètes les plus courantes.
