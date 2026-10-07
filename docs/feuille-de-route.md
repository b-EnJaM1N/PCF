# Feuille de route de HandSlam

Appli : https://handslam.fr/ · version de test : https://handslam.fr/preview/ · contact : contact.handslam@gmail.com

## En bref (6 octobre 2026)

**À faire ensuite, dans l'ordre** (pas de précipitation, faire les choses bien) :
1. **Valider** tout ce qui est marqué « à valider » ci-dessous (sur la version de test).
2. **Tests avec les proches** : 10 à 20 personnes dans un cercle « Testeurs HandSlam », invitées par petites vagues, avec une soirée freeroll (message d'invitation déjà préparé dans une conversation précédente).
3. **Google Play Store** (plan ci-dessous) : le test fermé de 14 jours sert aussi de test avec les proches.
4. Puis : réactiver Le Midi, L'Apéro et Le Nocturne quand il y aura du monde ; finir le passage de « PCF » à « HandSlam » dans le code ; classement du match du jour ; enregistrer les voix des surnoms (liste version 3) et les dialogues du Grand Chelem (au renouvellement des crédits ElevenLabs).

**Fait, à valider** (détails plus bas) :
- tournois programmés, bots dans les tournois et programme allégé (étapes 18, 19, 21) ;
- tirage au sort des tableaux (étape 23) ;
- 32 bots choisis selon la mise, puis échelle des bots (étapes 24 et 29) ;
- partie rapide amicale et heads-up en Sit & Go (étape 27), toutes les tailles de salle avec mise (étape 28), 3 minutes de patience en salle (étape 30) ;
- plus de sets à rallonge (étape 26) ;
- divisions et classement par division (étape 31) ;
- messages rapides (étape 22) ;
- jetons, bonus, freeroll, défis du jour, boutique (étapes 13 à 17) ;
- première visite guidée, match du jour, « Lire l'adversaire » ;
- surnoms version 3 ; face-à-face avec un ami ; trophées et avatars ;
- navigation allégée (carte « Tournois » unique, « Ma fiche » repliée).

**Fait et validé** : mode solo, comptes, duel en ligne, niveau officiel, amis, cercles, tournois en ligne, Sit & Go, navigation en trois onglets, voix ElevenLabs (demande n° 59).

## Étapes

### 1. Mode solo — *fait et validé*
Bots, fiche joueur, tournoi, statistiques gardées sur le téléphone.

### 2. Comptes joueurs — *fait et validé*
Inscription, pseudo, avatar, fiche joueur sauvegardée en ligne. Service : Supabase (projet en Europe, Paris). Compte facultatif ; la fiche du téléphone est transférée à la création du compte. Connexion par e-mail avec un code à 6 chiffres (voir « Décisions »).

### 3. Duel en ligne — *fait et validé*
Un serveur vérifie les coups (anti-triche) ; pause de 60 s après une déconnexion, puis forfait ; arbitre et commentateurs avec répliques adaptées.
- **Défier un ami** avec une barre de recherche (avatar, niveau, bouton « Défier ») ; l'ami reçoit l'invitation dans l'appli.
- **Défi par lien**, pour inviter quelqu'un qui n'a pas encore l'appli.
- Option « Ne pas apparaître dans la recherche ».

### 4. Niveau officiel, amis et cercles — *fait et validé*
- **Deux niveaux séparés** : le **niveau officiel** (calculé par le serveur, uniquement avec les duels entre humains, départ à 1200) et le niveau d'entraînement contre les bots.
- **Calibrage** (étape 8) : pendant les 10 premiers duels officiels, le niveau bouge deux fois plus vite et s'affiche « 1200 ? ».
- Duel **officiel par défaut**, avec une case pour un match amical. Anti-arrangement : au plus 5 duels officiels par jour entre les deux mêmes joueurs ; un duel sans aucun coup joué ne compte pas.
- **Amis** : demande puis acceptation.
- **Cercle** : un nom, un blason (emblème + couleur), des invitations par lien ou parmi ses amis, un responsable (👑) qui peut renommer, retirer un membre, changer le lien ou supprimer le cercle. Le **classement du cercle** range les membres par niveau officiel, avec leurs victoires et défaites entre membres. 20 cercles au plus par joueur, 100 membres au plus par cercle.
- **Formats** (étape 4b), en solo et en duel : match en **1 set**, sets de **3** ou **1 point** en plus de 7 et 11. Sans écart de 2 points pour 3 et 1 (3–2 gagne ; à 1 point, le premier point gagne le set). En duel, ces formats courts sont toujours amicaux.
- **Face-à-face avec un ami** — *à valider* : dans Cercles › Mes amis, toucher un ami ouvre le bilan de tous nos duels (victoires, sets, points, signes préférés, série en cours, son réflexe après un point gagné, 5 derniers duels) et un bouton Défier. Sans nouvelle étape SQL.
- **Divisions** — *à valider*, étape 31 : Bronze, Argent (1 100), Or (1 250), Platine (1 400), Diamant (1 550), marge de 20 points pour redescendre ; classement dans chaque division (onglet Cercles), 10 duels officiels minimum, masqué après 30 jours sans duel officiel.

### 5. Tournois en ligne et tournois de cercle — *fait et validé*
- **Élimination directe**, de 3 à 32 joueurs, en sets de 11 ou 7.
- **Tournois de cercle** (tout membre peut en organiser un, réservé aux membres) et **tournois privés** par lien.
- **Chaque tour a une date limite** (15 min, 1 h, 24 h ou 3 jours) ; les joueurs jouent leur match quand ils veulent ; le tour suivant commence dès que tous les matchs sont joués.
- **Match non joué à temps** : il revient à la personne qui a essayé de le jouer ; si personne, à la meilleure tête de série.
- L'organisateur choisit le format ; au format officiel, les matchs comptent pour le niveau officiel.

### 6. Tournois en direct, façon poker
Tout le monde est présent, les matchs s'enchaînent automatiquement, on reste connecté tant qu'on est en lice. **Jamais d'argent en jeu** (réglementation des jeux d'argent).

**Sit & Go** — *fait et validé* (étape 6), complété ensuite :
- salles **publiques**, départ dès que la salle est pleine ; un seul Sit & Go à la fois par joueur ;
- chaque match démarre dès que les deux joueurs sont libres ; **60 secondes pour arriver**, sinon forfait (si aucun des deux ne vient : la meilleure tête de série passe) ;
- format officiel, compte pour le niveau officiel ;
- **3 minutes de patience en salle** — *à valider*, étape 30 : un inscrit sans signe de vie est retiré au bout de 3 minutes (au lieu de 45 s), pour qu'un téléphone mis en veille ne fasse plus échouer la salle avant l'arrivée des bots ;
- **une rangée de mises, toutes les tailles** — *à valider*, étape 28 : en haut, la mise (sans mise, 50 à 1 000) ; en dessous, les salles de 2 (heads-up) à 64 joueurs, toutes possibles avec mise ; partage façon poker selon la taille ;
- **heads-up** — *à valider*, étape 27 : salles à deux, sans mise ou de 50 à 1 000 jetons ; le gagnant prend 1,8 fois la mise ; un bot complète la salle au bout de 2 minutes.

**Tirage au sort des tableaux** — *à valider*, étape 23, pour tous les tournois en ligne :
- têtes de série façon tennis, la moitié du tableau, 32 au plus (4 sur 8, 8 sur 16, 16 sur 32, 32 à partir de 64) ;
- têtes de série placées par groupes tirés au sort (1 ; 2 ; 3-4 ; 5-8 ; 9-16 ; 17-32) pour ne pas se croiser trop tôt ; places vides et bots face aux meilleurs ; tous les autres au hasard ; à niveau égal, le hasard départage ;
- écran d'attente en direct : le match d'où sortira le prochain adversaire, son score en direct et une estimation de l'attente ;
- pas de format plus court dans les premiers tours.

**Tournois programmés** — *à valider*, étape 18 (+ mise à jour de « Notifier ») :
- menu Jouer › Tournois › Tournois programmés (avec le freeroll de 20 h et le classement du mois) ;
- programme complet (heure de Paris) : **Le Midi** 12 h 30 (100 jetons), **L'Apéro** 18 h (100), **Le Nocturne** 21 h 30 du lundi au samedi (200), **Le Grand Chelem** le dimanche à 21 h (1 000, cagnotte garantie 5 000, finale en 3 sets gagnants) ;
- **programme allégé en ce moment** (étape 21) : freeroll chaque soir à 20 h + Grand Chelem le dimanche ; Le Midi, L'Apéro et Le Nocturne sont en pause (`_programmes_actifs()` dans l'étape 21) ;
- sets de 11, 2 sets gagnants (officiel) ; entrées illimitées ; désinscription remboursée avant le départ ; un absent n'est pas remboursé (son entrée reste dans la cagnotte) ; cagnotte : entrées moins 10 % ;
- rappel par notification 10 minutes avant (pg_cron toutes les 5 min) ;
- le vainqueur du Grand Chelem gagne le trophée « Champion du dimanche » et s'affiche en « Tenant du titre ».

**Dotations façon poker** (étape 19 pour les tournois programmés et le freeroll, étape 20 pour les Sit & Go à mise) :
- places payées = la plus grande puissance de 2 qui ne dépasse pas 15 % des joueurs (2 jusqu'à 26 joueurs, 4 de 27 à 53, 8 de 54 à 106… au plus 64), par tour éliminé (1er, 2e, 3e-4e, 5e-8e…) ;
- le 1er touche de 65 % (petit tournoi) à 23 % (très gros) ; le plus petit gain vaut au moins 1,5 fois l'entrée ; à 8 joueurs : 65 / 35 ;
- grille dans `app/js/programmes-logique.js` et `supabase/etape-19-dotations.sql` (un test vérifie qu'elles sont identiques).

**Bots dans les tournois** — *à valider*, étapes 21, 24 et 29 :
- freeroll et tournois programmés : départ dès 2 joueurs présents, tableau d'au moins 8 complété par des bots (dernières têtes de série) ;
- Sit & Go : 2 minutes après le premier arrivé, des bots complètent la salle ; un seul humain suffit ;
- minuteur pg_cron chaque minute (`veille-tournois`) : les tournois partent à l'heure même si personne n'a l'appli ouverte ;
- les bots jouent sur le serveur ; deux bots qui se rencontrent : résultat tiré au sort selon leur niveau ; match contre un bot : amical ; joueur parti pendant son match contre un bot : forfait au bout de 90 s ;
- **32 bots** (étape 24, dont 17 nouveaux : Pantoufle, Flanby, Glaçon 97, Boss Final…), plus ou moins forts contre les humains (les faibles jouent souvent leur signe favori, les forts lisent le joueur) ;
- **échelle des bots** (étape 29), une marche par mise : 50 : 850-1 050 ; 100 : 1 000-1 200 ; 200 : 1 150-1 350 ; 500 : 1 300-1 500 ; 1 000 et Grand Chelem : 1 450 et plus ; sans mise : n'importe lesquels ;
- les bots ne gagnent jamais de jetons ; ils comptent dans la cagnotte (sauf freeroll) et les gains vont aux humains selon leur vraie place.

**Plus de sets à rallonge** — *à valider*, étape 26 : à 14 partout (sets de 11) ou 9 partout (sets de 7), point décisif : le premier à 15 (ou 10) gagne le set. Un set sur 100 environ allait au-delà et bloquait les tournois.

**À surveiller** : au-delà de quelques centaines de joueurs connectés en même temps, l'offre gratuite de Supabase ne suffira plus (environ 25 $/mois).

### 7. Navigation — *faite et validée* (allègement *à valider*)
- Trois onglets (🎮 Jouer, 👥 Cercles, 🧑 Ma fiche) et la roue ⚙️ des Options. « Jouer » est un menu de grandes cartes : défis reçus et matchs à jouer en haut, puis Partie rapide, Défier un ami, Tournois, Entraînement. Le match se joue en plein écran.
- *Allègement (à valider)* :
  - une seule carte « 🏆 Tournois » mène à Tournois programmés, Sit & Go et Mes tournois ;
  - la carte « Aujourd'hui » tient sur une ligne (match du jour + bouton Jouer, puis 📤 pour partager) ; les défis du jour sont repliés en dessous (ils s'ouvrent seuls quand une récompense est à encaisser) ;
  - solde de jetons en haut à droite (🪙 1 250, mène à la boutique), à côté de 🔊/🔇 et de ⚙️ ; en haut de « Jouer » ne reste que ce qu'il y a à prendre (bonus du jour, renflouement) ;
  - en-tête : logo et nom plus grands ; la ligne du format n'apparaît que pendant un match ;
  - « Ma fiche » : l'identité et les chiffres en haut, la carte de joueur en vignette (on la touche pour l'agrandir et la partager), tous les autres blocs repliés avec un résumé ; dans l'avatar, un réglage déplié à la fois ; « Mon compte » reste ouvert tant qu'on n'est pas connecté ;
  - même principe ailleurs (on replie ce qu'on lit rarement, jamais ce qui sert à agir) : règlements sous « ℹ️ Comment ça marche ? », classement du mois replié, rubriques des Options repliées ;
  - onglet Cercles : commence par les invitations, les cercles et les amis ; le niveau officiel est dans « Ma fiche », avec « D'où vient ce niveau ? » replié.
- Plus tard peut-être : les rayons de la boutique.

### 8. Partie rapide — *à valider*
- Deux files : **classique** (sets de 11, 2 sets gagnants) et **éclair** (un set de 7).
- Depuis l'étape 27 (décision du 4 octobre) : la partie rapide est **toujours amicale et sans mise** ; les mises se jouent en Sit & Go (heads-up). L'étape 25 (mise contre un bot en partie rapide) n'est plus utilisée par l'appli.
- Adversaire du niveau le plus proche ; il faut rester sur l'écran. Au bout de 30 s sans adversaire, un bot est proposé, annoncé clairement comme un bot. Adversaire jamais arrivé : partie annulée, sans effet.

### 9. Jetons fictifs et boutique — *à valider*
Trois règles d'or : **jamais d'achat de jetons avec de l'argent réel ni de revente** (sinon : jeu d'argent) ; la boutique ne vend que de l'apparence, jamais d'avantage en jeu ; tout est géré par le serveur.
1. **Portefeuille** (étape 13) : 1 000 jetons à la création du compte ; bonus quotidien en série (50, 75, 100… jusqu'à 200 au 7e jour, la série repart à zéro après un jour manqué) ; renflouement sous 100 jetons (+200, une fois par jour) ; +10 par victoire contre un bot (100 par jour au plus).
2. **Mises** (étape 14) : défi entre amis avec ou sans mise (le gagnant prend 1,8 fois la mise) ; Sit & Go à mise ; 5 niveaux : 50, 100, 200, 500, 1 000 ; 10 % de commission sur les cagnottes (pour que les jetons gardent leur valeur).
3. **Freeroll et défis** (étapes 15 et 16) : freeroll gratuit chaque soir à 20 h (sets de 11 en 2 sets gagnants, cagnotte 1 000 + 50 par joueur répartie façon poker), rappel vers 19 h 50 ; 3 défis du jour (les mêmes pour tous) ; classement du mois sur le bénéfice des jeux à mise et du freeroll.
4. **Boutique d'apparence** (étape 17) : 46 articles (gants, motifs, fonds, poignets, 9 cris dont « C'est qui le patron ?! », 7 gestes de victoire animés, 5 célébrations, 4 cadres de carte), prix par rareté 300 / 800 / 2 000 / 5 000, vitrine du jour à −30 %, achats définitifs vérifiés par le serveur.

### 10. Le spectacle — *en cours*
- **Script des voix** validé (`docs/script-v2-brouillon.md`) : speaker, arbitre, commentateurs, journaliste d'après-finale ; surnoms en deux parties ; fausse histoire de la discipline. Toutes les répliques s'affichent aussi par écrit.
- **Voix ElevenLabs** — *faites et fusionnées* (demande n° 59, abonnement Starter pris le 2 octobre 2026) : Roland, Monique (Camille Martin, `[deadpan]`) et l'arbitre, tons selon la situation, commentaires selon l'enjeu, bruitages du court ; speaker et journaliste reportés. Génération automatique par le robot GitHub « Voix » (clé dans les secrets GitHub), fichiers chargés à la demande. Détails : `docs/voix-elevenlabs.md`.
- **Commentaires selon l'enjeu et figures techniques** — *fait* : 144 dialogues d'avant et d'après match (entraînement, petit tournoi, Grand Chelem — ce dernier à enregistrer) ; 10 figures inventées (triple loop, double boucle piqué, valse à trois temps…) annoncées par Roland quand un enchaînement gagne le point ; Monique plutôt cassante (écoles hongroise, soviétique et lyonnaise régulières, les autres très rares) ; la triple buse inversée, au hasard en fin de set ; plus de répliques de Monique sur la poignée de main.
- **La Une** : à la fin de chaque match, une image façon journal sportif à partager.
- **Carte de joueur** : dans « Ma fiche », une carte à collectionner en 10 rangs (Bois, Bronze, Argent, Or, Platine, Diamant, Rubis, Maître, Grand Maître, Légende) avec le niveau, le signe favori, le surnom et six notes sur 99, à partager.
- **Surnoms, version 3** — *à valider* (`docs/surnoms-v3-tri.md`) : un nom + un qualificatif (31 noms, 61 qualificatifs, plus de 1 800 combinaisons), dans « Ma fiche » › Mon surnom, avec un bouton 🎲 ; les familles s'ouvrent avec le rang de la carte (Novice/Bois : noms et humour ; Bronze : lieux ; Argent : matières ; Or : éléments ; Platine : titres, caractère, ombre ; Diamant : prestige), le plus haut rang atteint est retenu et l'écran de fin annonce chaque palier ; Le Menhir, Le Sécateur et L'Origami selon le signe favori ; un nouveau joueur reçoit un surnom de départ au hasard. Voix à enregistrer.
- **Messages rapides** — *à valider*, étape 22 : en duel contre un humain, phrases toutes faites (6 par liste, écrites par le porteur du projet, `docs/messages-rapides-brouillon.md`) : un message avant le match, un après au moment de la poignée de main, listes différentes pour le gagnant et le perdant ; vérifiées par le serveur (un test compare `app/js/messages-rapides.js` et le serveur) ; option « Masquer les messages de mes adversaires » dans Options › Messages rapides. **Pas de messagerie libre** (modération impossible seul, obligations légales et Google Play). Plus tard : messages des bots, réactions des commentateurs, messages en plus à la boutique.
- **Célébrations et cérémonie** (fait) : bouton « Passer » la présentation (en duel, les deux joueurs doivent appuyer) ; cri de victoire en bulle en fin de set, en grand avec confettis en fin de match, plus fort après une balle de match sauvée ; poignée de main (étape 9 : franche, normale, légère ou froide, 3 secondes pour choisir, comptée dans la fiche pour un futur titre fair-play). Cris : « Vamos ! », « Allez ! », « Come on ! », « Hija ! » (orthographe à confirmer), « Yes ! », « Let's go ! », « Forza ! », « Andiamo ! », « Dale ! », « Kom igen ! », « Davai ! », « Auf geht's ! », « Ouiii ! », « Voilààà ! », « C'est ça ! », « Je suis là ! », « Allez, allez, allez ! », « Ciseaux, bébé ! », « Caillou ! », « Pas aujourd'hui ! », « La main est chaude ! », « Merci. », « Suivant. », et le poing serré en silence.

### Pour accrocher les nouveaux joueurs — *à valider*
- **Première visite guidée** (`app/js/decouverte.js`) : écran de bienvenue, premier match contre Bambi (un set de 7, sans compte) avec des conseils ; le menu « Jouer » s'ouvre au fil des matchs (1 : Partie rapide ; 3 : jetons, défis du jour, boutique ; 5 : tournois), avec une annonce à chaque ouverture ; lien « Tout afficher » pour les pressés.
- **Le match du jour**, façon Wordle (`app/js/match-du-jour.js`) : chaque jour (heure de Paris) le même bot et le même tirage pour tout le monde, un set de 7, un seul essai (quitter = abandon), de plus en plus dur dans la semaine (le dimanche : Titan) ; résultat à partager avec une grille 🟩🟥⬜ et la série de jours joués ; gardé sur le téléphone. Visible après 3 matchs, dans la carte « Aujourd'hui ». Plus tard : un classement du jour sur le serveur.
- **Lire l'adversaire** (`app/js/lecture-adversaire.js`) : encadré « 🔎 Lire l'adversaire » pendant le match (répartition de ses signes, ses réflexes avec « X fois sur Y », piste 💡), et à la fin « Tu as lu l'adversaire N fois » ; repliable ; caché pendant les matchs officiels (affiché à la fin), visible partout ailleurs.
- **Trophées et avatars** : 35 trophées en 7 familles (fair-play, remontées, séries, endurance, tournois, cercles, duels), dans « Ma fiche » › Palmarès. Le plus dur de chaque famille débloque un élément d'avatar (gant bicolore, poignet argent, coutures dorées, gant argent, bandeau de champion, fonds minuit et rubis). Motifs libres : rayé, à pois. Les trophées des cercles et des tournois en ligne sont donnés en ouvrant l'onglet Cercles. « Derby » : 10 duels contre les membres d'un même cercle.

## Google Play Store : plan décidé (3 octobre)
1. Le porteur du projet trouve une quinzaine de testeurs, dont au moins 12 sur Android.
2. Compte développeur personnel (25 $ une fois, vérification d'identité) — à faire valider par le porteur du projet.
3. Claude prépare l'appli Android (TWA qui ouvre handslam.fr en plein écran, avec PWABuilder ; fichier `.well-known/assetlinks.json` sur le site ; clé de signature gardée hors de GitHub), une page web de suppression de compte (*faite, à valider* : `app/suppression-compte.html`, lien à donner à Google : https://handslam.fr/suppression-compte.html), une icône adaptée aux ronds d'Android (*faite, à valider* : `app/icons/icon-maskable-*.png`), la fiche du Store (*faite, à valider* : `docs/play-store/`, textes, 6 captures, bannière, icône) et les réponses aux questionnaires (données, classification par âge, « jeux d'argent simulés » : jetons fictifs, ni achat ni revente).
4. Test fermé Google de 14 jours avec les testeurs Android (les testeurs iPhone restent sur le site).
5. Corrections, puis demande de publication.

## Décisions prises
- **Nom : HandSlam** (marque vérifiée à l'INPI). C'est le nom de l'appli et des compétitions (HandSlam Open, L'Écho du HandSlam) ; le sport reste le Pierre-Feuille-Ciseaux dans la bouche des commentateurs. Le code dit encore « PCF » par endroits (à finir).
- **Nom de domaine** : handslam.fr (OVH ; handslam.com était pris). Zone DNS OVH : 4 lignes A vers GitHub Pages + www en CNAME ; GitHub : Custom domain + HTTPS. Mentions légales et confidentialité : `app/mentions.html`.
- **Service en ligne** : Supabase (gratuit au démarrage).
- **Connexion** : par e-mail, sans mot de passe, code à 6 chiffres ; compte facultatif. E-mails envoyés par **Brevo** (gratuit, 300 par jour) depuis noreply@handslam.fr, en français (voir `supabase/LISEZMOI.md`). Reste, facultatif : redéployer « Notifier » pour la nouvelle adresse (l'ancienne redirige).
- **Pseudos** : pseudo avec numéro (ex. « Benji#4821 »).
- **Groupe privé** : le **Cercle**.
- **Langue** : français seulement au lancement (l'anglais sera une réécriture, pas une traduction).
- **Voix** : ElevenLabs (synthèse), un comédien plus tard si le concept prend.
- **Vocabulaire** : un **niveau** est un chiffre (ex. 1200) ; un **classement** est une place (1er, 2e…). Un duel qui compte est **officiel**, sinon **amical**.
- **Commentateurs** : Roland Pignon et Monique Latouffe.
- **Cérémonie** : pas de temps mort ni de réclamation, pour garder le rythme. Le spectacle se concentre sur le début (présentation), le milieu (entre les sets) et la fin (poignée de main, La Une, interview).
- **Logo** : médaillon vert et or, « Club de Pierre · Feuille · Ciseaux — Fondé en 2026 », gant blanc qui fait le V des Ciseaux, nom en écriture attachée (Pinyon Script). L'icône du téléphone ne garde que la main dans le médaillon. Fichiers : `app/icons/logo.svg` et `app/icons/icon.svg`.
- **Lancement** : signalement des joueurs et réveil quotidien de Supabase (étape 10) ; notifications (étape 11).

## Idées notées en chemin
- **Mode carrière contre les bots** (3 octobre, plus tard) : le joueur monte l'échelle en battant des bots de plus en plus forts (les 32 bots). Pistes : une saison de tournois, un classement, des bots à débloquer (y compris à l'entraînement selon son niveau), les commentateurs qui suivent sa progression.
- Applaudissements à l'entrée des joueurs : à garder ou à retirer.

## Annexe : sons du court
Les sons se créent avec ElevenLabs (Sound Effects) **sur un ordinateur** (le site ne génère pas les sons depuis le téléphone). Fichiers à déposer dans `app/audio/` (voir `app/audio/LISEZMOI.md`) ; sans fichier, l'appli utilise un son fabriqué ou rien. Texte à donner à ElevenLabs :

| Fichier | Quand | Durée | Texte pour ElevenLabs |
|---|---|---|---|
| raquette_01 à 04 | chaque coup | 1 s | Single tennis ball hit with a racket, crisp pop, close-up, no crowd |
| public_fond_01 | fond, en boucle | 30 s | Tennis stadium crowd ambience, quiet murmurs, soft whispers, calm, seamless loop |
| public_tension_01 | balles de set et de match | 6 s | Tennis crowd murmuring nervously, rising tension, buzzing anticipation |
| public_ooh_01 | point disputé | 2 s | Tennis crowd "ooh" reaction to a near miss |
| public_point_01 | point gagné | 3 s | Polite tennis applause, short |
| public_clameur_01 | point spectaculaire | 3 s | Tennis crowd cheering burst after a great point |
| public_set_01 | fin de set | 5 s | Warm tennis crowd applause with a few cheers |
| public_ovation_01 | fin de match | 8 s | Standing ovation in a tennis stadium, loud cheers and whistles |
