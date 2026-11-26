# L'appli Android de HandSlam (version WebView)

Depuis le 25 novembre 2026, l'appli du Play Store n'est plus fabriquée avec PWABuilder (TWA) mais ici, dans `android/`.
Pourquoi : dans une TWA, l'appli ne fait que lancer Chrome ; Android compte le temps de jeu pour Chrome, et la Play Console ne
voyait que quelques secondes d'utilisation par jour pour tous les testeurs (d'où les refus « testeurs pas assez engagés »).
Ici, l'appli affiche https://handslam.fr/ dans sa propre fenêtre (WebView) : le temps de jeu est compté pour HandSlam.

## Ce que fait l'appli
- Affiche https://handslam.fr/ ; les liens du site restent dans l'appli, les autres (e-mail, réseaux…) s'ouvrent ailleurs.
- Bouton retour : page précédente, sinon l'appli passe en arrière-plan.
- Partage (`navigator.share`) et « Enregistrer l'image » branchés sur Android (le pont `HandSlamAndroid` dans `MainActivity.java`).
- Ajoute « HandSlamApp/1.1.0 » à la carte d'identité du navigateur : le site compte ces visites comme « android »
  (`app/js/visites.js`).
- Pas de notifications (une WebView n'a pas les notifications du web) : elles restent sur le site et l'appli installée depuis
  le navigateur.
- Les données du jeu ne sont pas partagées avec Chrome : il faut se reconnecter une fois (e-mail et code).

## Construction (GitHub, `.github/workflows/android.yml`)
À chaque changement du dossier `android/` (ou à la main : Actions › « Appli Android » › Run workflow) :
- **handslam-essai** : un `.apk` à installer directement sur un téléphone, à côté de l'appli du Play Store
  (nom « HandSlam essai », paquet `fr.handslam.app.essai`) ;
- **handslam-play-store** : le `.aab` signé à déposer dans la Play Console, seulement si la clé est dans les secrets.

Les fichiers se téléchargent en bas de la page du « run » (rubrique Artifacts), en `.zip` à décompresser.

## La clé de signature (jamais dans le dépôt)
La même clé que celle donnée à PWABuilder (« Use mine »). Dans GitHub : Settings › Secrets and variables › Actions ›
New repository secret :
- `ANDROID_CLE_BASE64` : le fichier de la clé (`.keystore` ou `.jks`) converti en texte base64 ;
- `ANDROID_CLE_MOT_DE_PASSE` : le mot de passe de la clé (« store password ») ;
- `ANDROID_CLE_ALIAS` : l'alias (« key alias ») ;
- `ANDROID_CLE_MOT_DE_PASSE_ALIAS` : le mot de passe de l'alias (« key password », souvent le même).

## Nouvelle version
Augmenter `versionCode` (et `versionName`) dans `android/app/build.gradle` : 6 = 1.1.0 (première version WebView ; le
paquet 5, 1.0.0.4, était le dernier de PWABuilder).
