# HandSlam Invaders

Jeu à part, prévu **après le lancement de HandSlam** (voir « Seconde appli » dans [`feuille-de-route.md`](feuille-de-route.md)). Ce fichier regroupe tout ce qui concerne Invaders ; la feuille de route de HandSlam n'y renvoie que par un lien.

Prototype : [`prototypes/handslam-invaders.html`](prototypes/handslam-invaders.html), aussi en page privée Claude : https://claude.ai/artifact/Dpm6ozsstzXgemVVYb9prK (visible seulement par le porteur du projet ; c'est là qu'on le teste, pas sur https://handslam.fr/preview/).

## Le principe
Prototype jouable du 18 octobre, validé (« amusant, prometteur »). Des signes tombent ; on se place dessous et on tire celui qui les bat (contre ✌️ tirer ✊, contre ✋ tirer ✌️, contre ✊ tirer ✋).

- **Commandes retenues** : une colonne étroite sur le côté (gauche par défaut, à droite pour les gauchers) avec le score, le record et les vies en haut, et les 3 signes serrés en bas ; l'autre main glisse sur le terrain pour bouger ; le terrain prend toute la hauteur.
- **Règles** : mauvais signe = l'ennemi accélère, même signe = il recule ; 3 vies ; séries qui multiplient les points (jusqu'à ×5) ; vitesse qui monte, zigzags ; record gardé sur le téléphone.

## Ce qui est fait dans le prototype
- **Vagues** (18 octobre) : 6 + n signes, jamais deux signes collés, montée en difficulté sur 15 vagues, zigzags à partir de la vague 8, prime de fin de vague.
- **Boss toutes les 3 vagues** (18 octobre) : « la Main de Fer » change de signe en clignotant juste avant, tire des signes et des rafales de 3, riposte après un mauvais tir, barre de vie, lâche un ❤️. Réglé avec le porteur du projet pour que le premier boss soit passable : 5 points de vie, rythme calme / salve / repos, tirs isolés depuis les côtés de la main, salve de 2 signes l'un après l'autre seulement quand l'écran est vide, il s'arrête au repos (« Il fatigue : frappe ! »), pas de riposte avant le 2e boss, un 🛡️ tombe à son arrivée.
- **Objets qui tombent** (9 % des signes battus) : ❤️ vie (5 au plus), 🛡️ bouclier 10 s, ⏱️ ralenti 6 s, 🔁 tir triple 8 s, ⚡ éclair (efface l'écran, 2 dégâts au boss).
- **Mondes** (19 octobre) : 15 vagues et 5 boss chacun (vagues 3, 6, 9, 12, 15). Battre le boss de la vague 9 ouvre le monde suivant (retenu sur le téléphone), mais la partie continue dans le même monde jusqu'à la vague 15 pour battre son record (idée du porteur du projet : choisir entre améliorer son record sur le monde 1 ou passer au monde 2) ; un record par monde. Après le boss de la vague 15 : écran « Victoire ! ».
  - Monde 1 **« Le Gymnase »** (boss : la Main de Fer).
  - Monde 2 **« La Plage »** : mer et sable animés, boss : le Roi Crabe 👑 ; des objets dès la vague 1 (demande du porteur du projet, 20 octobre) : galet (dessiné, gros et rond depuis le 20 octobre) = pierre, 🦀 crabe = ciseaux, et pour la feuille une feuille de palmier (vagues 1-3, 7-9, 13-15) ou une serviette de plage rayée (4-6, 10-12), dessinées (choix du porteur du projet le 20 octobre, à la place de l'algue et de la méduse qui ne faisaient pas assez « feuille »), plus petits à partir de la vague 10 ; un crabe sur trois avance en biais et rebondit sur les bords ; difficulté de départ ≈ vague 6 du monde 1, boss plus forts.
- **Objets de sport dans le Gymnase** (idée du porteur du projet, 19 octobre) : vagues 1 à 3 avec les mains, puis toutes les 3 vagues de nouveaux objets jouent les rôles (forme reconnaissable et vraies couleurs, pas de code couleur pour l'instant ; à revoir après test si c'est trop dur) :
  - vagues 4-6, basket et athlé : 🏀 ballon orange = pierre, dossard = feuille, javelots en V pointes vers le bas = ciseaux ;
  - 7-9, foot et hockey : ⚽ = pierre, drapeau de corner = feuille, crosses croisées, réunies en haut et ouvertes vers le bas (retournées le 20 octobre) = ciseaux ;
  - 10-12, tennis, objets plus petits : 🎾 balle jaune = pierre, raquette de tennis = feuille, raquettes croisées = ciseaux ;
  - 13-15, baseball, plus petits : ⚾ balle blanche = pierre, gant de baseball = feuille, battes croisées = ciseaux.

  Les feuilles et les javelots sont dessinés, le reste en emojis. Un bandeau présente les rôles à chaque changement ; le boss prend aussi l'apparence des objets ; les boutons de tir restent ✊ ✋ ✌️.
- **Pause** : bouton ⏸ (ou touche P / Échap) ; pause automatique quand on quitte l'appli (appel, notification) ; la partie est gardée sur le téléphone et l'accueil propose « Reprendre » si la page a été fermée entre-temps.
- **Raccourcis pour tester** (à ajouter à l'adresse) : « #boss » commence à la vague 3, « #vague7 » (etc.) à une vague donnée, « #monde2 » (ou 3, 4) montre tous les mondes à l'accueil, sans les débloquer.

- **Une couleur par rôle** (idée du porteur du projet, 20 octobre ; ne change pas d'un monde à l'autre) : chaque ennemi est entouré d'un cercle de la couleur de son rôle, quel que soit l'objet : **orange = pierre**, **vert = feuille**, **rose = ciseaux**. Si on ne reconnaît pas un nouvel objet du premier coup, on reconnaît au moins la couleur. Le cercle du boss prend la couleur de son signe du moment (il clignote en blanc juste avant d'en changer). Les tirs du joueur gardent leur cercle jaune ; les boutons de tir n'ont pas de couleur (ils montrent le signe à tirer, pas celui de l'ennemi).
- **Travail monde par monde** (20 octobre) : on reprend les mondes un par un, en commençant par la Plage ; le Gymnase sera revu plus tard.
- **Règle pour les ciseaux** (demande du porteur du projet, 20 octobre) : tous les objets qui jouent les ciseaux ont le côté ouvert tourné vers le joueur, en bas (javelots, crosses, raquettes de badminton et battes réunies en haut ; pinces du crabe et du lucane vers le bas ; doigts d'alien en V vers le bas).

## Mondes 3 et 4 : la Forêt et l'Espace (19 octobre, à tester)
Le porteur du projet trouvait 2 mondes légers pour le lancement : on passe à 4. Choix du porteur du projet : les ciseaux de la Forêt sont le **lucane** (cerf-volant, ses pinces), le monde 4 est **l'Espace**. Chaque monde s'ouvre au boss de la vague 9 du précédent. L'accueil montre un bouton par monde ouvert ; « Essayer tous les mondes (démo) » les montre tous (aussi avec « #monde3 », etc., dans l'adresse).

- **Monde 3 « La Forêt »** (boss : le Vieux Chêne 🌳) : sous-bois, sapins et arbres ronds sur les côtés, rayons de soleil. Des objets dès la vague 1, qui changent toutes les 3 vagues ; les ciseaux sont toujours le lucane (dessiné) :
  - vagues 1-3, l'orée du bois : 🪨 rocher = pierre, 🍃 feuille = feuille ;
  - 4-6, les chênes : gland (dessiné) = pierre, 🍂 feuille morte = feuille ;
  - 7-9, le verger : 🍎 pomme = pierre, 🍁 feuille d'érable = feuille ;
  - 10-12, les sapins, plus petits : pomme de pin (dessinée) = pierre, 🌿 fougère = feuille ;
  - 13-15, la forêt profonde, plus petits : 🌰 châtaigne = pierre, ☘️ trèfle = feuille.

  **Spécialité** : les feuilles tombent en se balançant au vent (il faut les suivre).
- **Monde 4 « L'Espace »** (boss : la Soucoupe Mère 🛸) : ciel noir et violet, étoiles qui défilent, une grosse planète pâle au loin. Revu le 20 octobre (le satellite, la voile solaire et le vaisseau ne se reconnaissaient pas) : des extraterrestres qui jouent avec leurs mains vertes aux longs doigts. Météorite (grosse, avec sa traînée de feu) = pierre, main d'alien ouverte = feuille, doigts d'alien en V = ciseaux, tous dessinés ; les mêmes objets jusqu'à la vague 9, plus petits ensuite.

  **Spécialité** : un ennemi sur trois se téléporte un peu plus loin ; il clignote juste avant, et jamais près du gant.
- **Difficulté** : la vague 1 de la Forêt est au niveau de la vague 7 du Gymnase, celle de l'Espace au niveau de la vague 9 ; les boss sont un peu plus forts à chaque monde. Un record par monde.

## Idées pour l'étoffer (18 octobre, rien de décidé)
- **Difficulté** : vitesse ; taille des cibles (plus petites = viser plus juste) ; ennemis qui bougent : zigzag, téléporteur, caméléon (change de signe en tombant), costaud (2 ou 3 bons tirs), diviseur (se coupe en deux petits), masqué ❓ (signe révélé au dernier moment) ; vagues avec un boss à la fin (main géante qui change de signe et lance des rafales).
- **Mondes** (décor, musique, ennemi spécial) : Gymnase (décor HandSlam), Plage (crabes ✌️ en biais), Montagne (avalanches de ✊), Forêt (feuilles ✋ au vent), Espace. Le monde suivant se débloque avec un score ou en battant le boss.
- **Pièces et boutique** : des pièces à chaque partie ; acheter son gant ou sa main (gant de boxe, de chantier, main robot, squelette, dorée, couleurs de peau), des effets de tir (feu, étoiles, éclairs), des explosions (confettis, pixels). Règle : de l'apparence seulement, jamais d'avantage pour gagner.
- **Bonus qui tombent** : ❤️ vie, 🛡️ bouclier, ⏱️ ralenti, 🔁 tir triple, 🧲 tir automatique (5 secondes).
- **Pour revenir** : défi du jour (même niveau pour tous, un essai, classement du jour) ; missions (« Battre 50 ciseaux », « Série de ×20 », « Sans perdre de vie ») ; cadeau qui grossit chaque jour joué d'affilée (jour 7 = gros cadeau) ; classements entre amis et mondial ; trophées ; sensations (vibrations, sons qui montent avec la série, écran qui tremble).
- **Plus tard, à deux** : les mêmes vagues en même temps, score de l'autre en direct, des jetons pour le gagnant.
- **Ordre conseillé** : 1. vagues et boss ; 2. pièces et gants ; 3. défi du jour.

## Première version publique (avis du 19 octobre, rien de décidé)
- **Promesse** : « Les signes tombent, tire celui qui les bat : des parties de 2 minutes, réflexes et rigolades. » Ce qui ne sert pas cette promesse attend.
- **Contenu** : 1. un apprentissage joué, sans texte (1re vague : seulement des ✌️ avec une main qui montre ✊ ; 2e : on ajoute ✋ ; 3e : tout mélangé) ; 2. le Gymnase complet (15 vagues, 5 boss, objets de sport) ; 3. la Plage, la Forêt et l'Espace, chacun à débloquer au boss de la vague 9 du monde précédent ; 4. le défi du jour (même partie pour tous, un essai, score à partager : « 🏀 HandSlam Invaders, défi du 19/10 : vague 8, 2 340 points ») ; 5. records par monde sur le téléphone ; 6. confort déjà fait (pause, reprise après un appel, son, côté gaucher). *Mise à jour du 19 octobre : 4 mondes au lancement plutôt que 2.*
- **Simplicité** : un seul gros bouton « Jouer » qui relance le dernier monde joué ; aucun compte au départ ; trois écrans seulement (accueil, partie, fin).
- **Mises à jour suivantes** : 1. pièces et boutique de gants (apparence seulement) ; 2. classement en ligne (demande des comptes ; réutiliser le serveur Supabase de HandSlam, à décider) ; 3. nouveaux mondes (Montagne, etc.), un par mise à jour ; 4. défi à deux en direct.
- **Argent** : rien au lancement ; plus tard, une pub choisie par le joueur pour « continuer avec 1 vie » après une défaite, et les gants.
- **À savoir** : nouvelle fiche Play Store, donc nouveau test fermé (12 testeurs pendant 14 jours ; les testeurs de HandSlam peuvent resservir). **Nom à décider par le porteur du projet** (difficile à changer ensuite) : « HandSlam Invaders » seul (message clair, fait connaître HandSlam ; conseillé pour démarrer) ou « Shifumi en folie » (boîte à jeux avec plusieurs modes, plus dure à présenter au début).
