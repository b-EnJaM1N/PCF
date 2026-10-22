// Les quinze bots du mode solo, du plus facile au plus fort. Leurs niveaux viennent de simulations
// (outils/calibrer-bots.js : contre des joueurs types, et les bots entre eux). Les plus faibles ont une faille exploitable :
// la découvrir en lisant l'historique fait partie du plaisir.
import { contre, signeAuHasard, balle as balleDe, PIERRE, FEUILLE, CISEAUX } from "./regles.js";
import { Lecteur } from "./analyse.js";

export const BOTS = [
  { id: "rocky", nom: "Rocky", style: "L'agressif", desc: "adore la Pierre. Beaucoup trop.", elo: 850, specialite: "La Pierre", imprevisibilite: 30, av: { symbole: "pierre", fond: "terre", gant: "rouge", poignet: "noir", motif: "uni" } },
  { id: "papyrus", nom: "Papyrus", style: "Le studieux", desc: "adore la Feuille. Vraiment beaucoup.", elo: 900, specialite: "La Feuille", imprevisibilite: 30, av: { symbole: "feuille", fond: "terre", gant: "blanc", poignet: "rouge", motif: "uni" } },
  { id: "bambi", nom: "Bambi", style: "Le débutant", desc: "rejoue le même signe tant qu'il n'a pas perdu deux fois de suite.", elo: 950, specialite: "L'entêtement", imprevisibilite: 15, av: { symbole: "pierre", fond: "gazon", gant: "blanc", poignet: "jaune", motif: "uni" } },
  { id: "miroir", nom: "Miroir", style: "Le copieur", desc: "rejoue souvent ton dernier coup.", elo: 1000, specialite: "La copie", imprevisibilite: 45, av: { symbole: "feuille", fond: "court", gant: "blanc", poignet: "bleu", motif: "rayures" } },
  { id: "boomerang", nom: "Boomerang", style: "Le réactif", desc: "garde son signe quand il gagne, en change quand il perd.", elo: 1050, specialite: "La réaction", imprevisibilite: 50, av: { symbole: "pierre", fond: "violet", gant: "jaune", poignet: "rouge", motif: "etoile" } },
  { id: "cyclo", nom: "Cyclo", style: "Le mécanique", desc: "tourne en boucle : Pierre, Feuille, Ciseaux.", elo: 1100, specialite: "La boucle", imprevisibilite: 40, av: { symbole: "ciseaux", fond: "gazon", gant: "jaune", poignet: "blanc", motif: "rayures" } },
  { id: "tictac", nom: "Tic-Tac", style: "L'indécis", desc: "ne rejoue jamais deux fois de suite le même signe.", elo: 1150, specialite: "Le changement", imprevisibilite: 45, av: { symbole: "ciseaux", fond: "violet", gant: "bleu", poignet: "blanc", motif: "rayures" } },
  { id: "chaos", nom: "Chaos", style: "L'imprévisible", desc: "joue au hasard total. Impossible à lire, impossible à piéger.", elo: 1200, specialite: "Le hasard", imprevisibilite: 100, av: { symbole: "ciseaux", fond: "court", gant: "vert", poignet: "jaune", motif: "eclair" } },
  { id: "rancune", nom: "Rancune", style: "La revancharde", desc: "rejoue souvent le signe qui vient de la battre.", elo: 1250, specialite: "La vengeance", imprevisibilite: 60, av: { symbole: "ciseaux", fond: "terre", gant: "rouge", poignet: "noir", motif: "eclair" } },
  { id: "bluffeur", nom: "Bluffeur", style: "Le menteur", desc: "installe une fausse habitude, puis la casse au moment clé.", elo: 1300, specialite: "Le bluff", imprevisibilite: 70, av: { symbole: "feuille", fond: "violet", gant: "jaune", poignet: "noir", motif: "etoile" } },
  { id: "nemesis", nom: "Némésis", style: "L'adaptative", desc: "teste plusieurs façons de te lire et garde celle qui marche.", elo: 1350, specialite: "L'adaptation", imprevisibilite: 90, av: { symbole: "pierre", fond: "ardoise", gant: "bleu", poignet: "or", motif: "eclair" } },
  { id: "mante", nom: "La Mante", style: "La patiente", desc: "joue au hasard en début de set, puis frappe sur tes réflexes en fin de set.", elo: 1400, specialite: "La fin de set", imprevisibilite: 90, av: { symbole: "ciseaux", fond: "gazon", gant: "vert", poignet: "noir", motif: "eclair" } },
  { id: "stratege", nom: "Stratège", style: "Le lecteur", desc: "analyse tes habitudes et les contre.", elo: 1450, specialite: "La lecture", imprevisibilite: 80, av: { symbole: "feuille", fond: "ardoise", gant: "rouge", poignet: "noir", motif: "eclair" } },
  { id: "professeur", nom: "Professeur", style: "Le maître", desc: "lit tes réflexes plus vite que son ombre.", elo: 1500, specialite: "La lecture éclair", imprevisibilite: 90, av: { symbole: "feuille", fond: "or", gant: "blanc", poignet: "noir", motif: "etoile" } },
  { id: "titan", nom: "Titan", style: "Le boss final", desc: "change complètement de stratégie à chaque set.", elo: 1600, specialite: "Tout", imprevisibilite: 95, av: { symbole: "pierre", fond: "or", gant: "or", poignet: "noir", motif: "etoile" } },
];

// Les 49 autres bots (ceux des tournois en ligne, supabase/etape-33-64-bots.sql) : ils jouent selon leur niveau, comme sur le
// serveur (voir choisirCoup). Ils servent dans la carrière (carriere-logique.js), pas à l'entraînement.
export const AUTRES_BOTS = [
  { id: "pantoufle", nom: "Pantoufle", style: "Le casanier", desc: "ne quitte jamais sa Feuille. Ou presque.", elo: 800, specialite: "La Feuille", imprevisibilite: 15, favori: 2, av: { symbole: "feuille", fond: "violet", gant: "rose", poignet: "blanc", motif: "uni" } },
  { id: "tamagotchi", nom: "Tamagotchi", style: "Le capricieux", desc: "réclame ses Ciseaux toutes les deux minutes.", elo: 850, specialite: "Les Ciseaux", imprevisibilite: 15, favori: 1, av: { symbole: "ciseaux", fond: "gazon", gant: "jaune", poignet: "bleu", motif: "uni" } },
  { id: "flanby", nom: "Flanby", style: "Le tremblotant", desc: "se cache derrière sa Feuille.", elo: 900, specialite: "La Feuille", imprevisibilite: 18, favori: 2, av: { symbole: "feuille", fond: "or", gant: "jaune", poignet: "blanc", motif: "uni" } },
  { id: "gaston", nom: "Gaston", style: "Le gaffeur", desc: "sort la Pierre sans réfléchir.", elo: 950, specialite: "La Pierre", imprevisibilite: 23, favori: 0, av: { symbole: "pierre", fond: "court", gant: "rouge", poignet: "blanc", motif: "uni" } },
  { id: "mollasson", nom: "Mollasson", style: "Le paresseux", desc: "garde la Pierre : ça fatigue moins.", elo: 1000, specialite: "La Pierre", imprevisibilite: 27, favori: 0, av: { symbole: "pierre", fond: "violet", gant: "bleu", poignet: "jaune", motif: "rayures" } },
  { id: "rubik", nom: "Rubik", style: "Le cube", desc: "combine, combine… et finit aux Ciseaux.", elo: 1080, specialite: "Les Ciseaux", imprevisibilite: 35, favori: 1, av: { symbole: "ciseaux", fond: "court", gant: "rouge", poignet: "jaune", motif: "rayures" } },
  { id: "origami", nom: "Origami", style: "Le plieur", desc: "plie le match à coups de Feuille, et commence à te lire.", elo: 1130, specialite: "La Feuille", imprevisibilite: 39, favori: 2, av: { symbole: "feuille", fond: "gazon", gant: "blanc", poignet: "bleu", motif: "etoile" } },
  { id: "silex", nom: "Silex", style: "Le tranchant", desc: "aime la Pierre et commence à lire ton jeu.", elo: 1180, specialite: "La Pierre", imprevisibilite: 44, favori: 0, av: { symbole: "pierre", fond: "terre", gant: "argent", poignet: "noir", motif: "rayures" } },
  { id: "tondeuse", nom: "Tondeuse", style: "La coupe rase", desc: "tond aux Ciseaux, puis contre ton signe préféré.", elo: 1230, specialite: "La lecture", imprevisibilite: 48, favori: 1, av: { symbole: "ciseaux", fond: "gazon", gant: "vert", poignet: "noir", motif: "rayures" } },
  { id: "comete", nom: "Comète", style: "La filante", desc: "passe vite, Feuille en tête, l'œil sur tes habitudes.", elo: 1280, specialite: "La lecture", imprevisibilite: 53, favori: 2, av: { symbole: "feuille", fond: "minuit", gant: "jaune", poignet: "bleu", motif: "etoile" } },
  { id: "shuriken", nom: "Shuriken", style: "Le ninja", desc: "lit ton jeu dans l'ombre.", elo: 1330, specialite: "La lecture", imprevisibilite: 57, favori: 1, av: { symbole: "ciseaux", fond: "ardoise", gant: "noir", poignet: "rouge", motif: "eclair" } },
  { id: "sphinx", nom: "Le Sphinx", style: "L'énigme", desc: "pose des questions et lit tes réponses.", elo: 1420, specialite: "La lecture", imprevisibilite: 65, favori: 2, av: { symbole: "feuille", fond: "or", gant: "jaune", poignet: "noir", motif: "eclair" } },
  { id: "oracle", nom: "L'Oracle", style: "Le visionnaire", desc: "voit tes habitudes avant toi.", elo: 1480, specialite: "La lecture", imprevisibilite: 71, favori: 0, av: { symbole: "pierre", fond: "galaxie", gant: "blanc", poignet: "or", motif: "etoile" } },
  { id: "glacon97", nom: "Glaçon 97", style: "Le sang-froid", desc: "lit ton jeu sans trembler.", elo: 1510, specialite: "La lecture", imprevisibilite: 74, favori: 1, av: { symbole: "ciseaux", fond: "minuit", gant: "argent", poignet: "blanc", motif: "etoile" } },
  { id: "mentaliste", nom: "Mentaliste", style: "Le liseur de pensées", desc: "sait ce que tu vas jouer.", elo: 1550, specialite: "La lecture", imprevisibilite: 77, favori: 2, av: { symbole: "feuille", fond: "ardoise", gant: "violet", poignet: "or", motif: "etoile" } },
  { id: "kaiser", nom: "Le Kaiser", style: "L'empereur", desc: "règne en lisant ton jeu.", elo: 1650, specialite: "La lecture", imprevisibilite: 86, favori: 0, av: { symbole: "pierre", fond: "ardoise", gant: "rouge", poignet: "or", motif: "eclair" } },
  { id: "boss", nom: "Boss Final", style: "Le boss final", desc: "le dernier obstacle. Il lit tout.", elo: 1700, specialite: "La lecture", imprevisibilite: 91, favori: 1, av: { symbole: "ciseaux", fond: "stade", gant: "noir", poignet: "or", motif: "eclair" } },
  { id: "doudou", nom: "Doudou", style: "Le câlin", desc: "joue la Feuille pour faire des bisous.", elo: 820, specialite: "La Feuille", imprevisibilite: 15, favori: 2, av: { symbole: "feuille", fond: "violet", gant: "rose", poignet: "blanc", motif: "uni" } },
  { id: "chamalou", nom: "Chamalou", style: "Le tout mou", desc: "se rabat sur la Pierre dès qu'il a peur.", elo: 860, specialite: "La Pierre", imprevisibilite: 15, favori: 0, av: { symbole: "pierre", fond: "coucher", gant: "rose", poignet: "blanc", motif: "uni" } },
  { id: "biscotte", nom: "Biscotte", style: "Le friable", desc: "coupe tout aux Ciseaux, puis s'effrite.", elo: 880, specialite: "Les Ciseaux", imprevisibilite: 16, favori: 1, av: { symbole: "ciseaux", fond: "terre", gant: "jaune", poignet: "rouge", motif: "uni" } },
  { id: "scarabee", nom: "Petit Scarabée", style: "L'apprenti", desc: "répète la Pierre, comme son maître le lui a appris.", elo: 920, specialite: "La Pierre", imprevisibilite: 20, favori: 0, av: { symbole: "pierre", fond: "gazon", gant: "vert", poignet: "jaune", motif: "uni" } },
  { id: "guimauve", nom: "Guimauve", style: "La douceur", desc: "glisse une Feuille dès qu'elle peut.", elo: 960, specialite: "La Feuille", imprevisibilite: 24, favori: 2, av: { symbole: "feuille", fond: "neon", gant: "rose", poignet: "bleu", motif: "uni" } },
  { id: "croquette", nom: "Croquette", style: "La gourmande", desc: "croque tout aux Ciseaux.", elo: 990, specialite: "Les Ciseaux", imprevisibilite: 26, favori: 1, av: { symbole: "ciseaux", fond: "terre", gant: "or", poignet: "noir", motif: "rayures" } },
  { id: "brindille", nom: "Brindille", style: "La fragile", desc: "plie, mais garde sa Feuille.", elo: 1020, specialite: "La Feuille", imprevisibilite: 29, favori: 2, av: { symbole: "feuille", fond: "gazon", gant: "vert", poignet: "blanc", motif: "rayures" } },
  { id: "toupie", nom: "Toupie", style: "La virevoltante", desc: "tourne autour de la Pierre.", elo: 1040, specialite: "La Pierre", imprevisibilite: 31, favori: 0, av: { symbole: "pierre", fond: "court", gant: "turquoise", poignet: "jaune", motif: "etoile" } },
  { id: "zigzag", nom: "Zigzag", style: "Le slalomeur", desc: "zigzague, mais revient toujours aux Ciseaux.", elo: 1060, specialite: "Les Ciseaux", imprevisibilite: 33, favori: 1, av: { symbole: "ciseaux", fond: "neon", gant: "jaune", poignet: "noir", motif: "eclair" } },
  { id: "galet", nom: "Galet", style: "Le roc", desc: "ne lâche pas sa Pierre facilement.", elo: 1090, specialite: "La Pierre", imprevisibilite: 35, favori: 0, av: { symbole: "pierre", fond: "ardoise", gant: "argent", poignet: "bleu", motif: "uni" } },
  { id: "pivert", nom: "Pivert", style: "Le têtu", desc: "tape et retape aux Ciseaux.", elo: 1120, specialite: "Les Ciseaux", imprevisibilite: 38, favori: 1, av: { symbole: "ciseaux", fond: "gazon", gant: "rouge", poignet: "noir", motif: "rayures" } },
  { id: "ricochet", nom: "Ricochet", style: "Le rebondissant", desc: "rebondit sur la Pierre et guette tes habitudes.", elo: 1160, specialite: "La Pierre", imprevisibilite: 42, favori: 0, av: { symbole: "pierre", fond: "court", gant: "bleu", poignet: "blanc", motif: "etoile" } },
  { id: "sardine", nom: "Sardine", style: "La serrée", desc: "se faufile à la Feuille et lit parfois ton jeu.", elo: 1190, specialite: "La Feuille", imprevisibilite: 45, favori: 2, av: { symbole: "feuille", fond: "court", gant: "argent", poignet: "bleu", motif: "rayures" } },
  { id: "pistache", nom: "Pistache", style: "La croquante", desc: "aime les Ciseaux, et repère tes habitudes.", elo: 1220, specialite: "La lecture", imprevisibilite: 47, favori: 1, av: { symbole: "ciseaux", fond: "gazon", gant: "vert", poignet: "rouge", motif: "etoile" } },
  { id: "lasso", nom: "Lasso", style: "Le cow-boy", desc: "attrape ton signe préféré au lasso.", elo: 1260, specialite: "La lecture", imprevisibilite: 51, favori: 2, av: { symbole: "feuille", fond: "terre", gant: "or", poignet: "rouge", motif: "rayures" } },
  { id: "moustique", nom: "Moustique", style: "Le piqueur", desc: "pique là où tu as l'habitude d'aller.", elo: 1290, specialite: "La lecture", imprevisibilite: 54, favori: 1, av: { symbole: "ciseaux", fond: "minuit", gant: "noir", poignet: "jaune", motif: "eclair" } },
  { id: "scorpion", nom: "Scorpion", style: "Le venimeux", desc: "attend ton signe préféré, puis pique.", elo: 1310, specialite: "La lecture", imprevisibilite: 55, favori: 1, av: { symbole: "ciseaux", fond: "terre", gant: "noir", poignet: "rouge", motif: "eclair" } },
  { id: "vautour", nom: "Vautour", style: "Le charognard", desc: "tourne au-dessus de tes habitudes.", elo: 1340, specialite: "La lecture", imprevisibilite: 58, favori: 0, av: { symbole: "pierre", fond: "ardoise", gant: "noir", poignet: "blanc", motif: "eclair" } },
  { id: "mirage", nom: "Mirage", style: "Le trompeur", desc: "te montre une Feuille, puis te lit.", elo: 1370, specialite: "La lecture", imprevisibilite: 61, favori: 2, av: { symbole: "feuille", fond: "coucher", gant: "or", poignet: "blanc", motif: "etoile" } },
  { id: "sablier", nom: "Sablier", style: "Le patient", desc: "laisse filer le temps et repère tes manies.", elo: 1390, specialite: "La lecture", imprevisibilite: 63, favori: 0, av: { symbole: "pierre", fond: "or", gant: "or", poignet: "noir", motif: "rayures" } },
  { id: "faucon", nom: "Faucon", style: "Le rapace", desc: "fond sur ton signe préféré.", elo: 1430, specialite: "La lecture", imprevisibilite: 66, favori: 1, av: { symbole: "ciseaux", fond: "minuit", gant: "argent", poignet: "or", motif: "eclair" } },
  { id: "typhon", nom: "Typhon", style: "Le tourbillon", desc: "emporte tout ce que tu répètes.", elo: 1460, specialite: "La lecture", imprevisibilite: 69, favori: 2, av: { symbole: "feuille", fond: "minuit", gant: "turquoise", poignet: "blanc", motif: "eclair" } },
  { id: "sorciere", nom: "La Sorcière", style: "La sorcière", desc: "devine ton prochain signe dans sa boule.", elo: 1470, specialite: "La lecture", imprevisibilite: 70, favori: 1, av: { symbole: "ciseaux", fond: "galaxie", gant: "violet", poignet: "noir", motif: "etoile" } },
  { id: "notaire", nom: "Le Notaire", style: "Le méticuleux", desc: "note chacun de tes coups.", elo: 1490, specialite: "La lecture", imprevisibilite: 72, favori: 2, av: { symbole: "feuille", fond: "ardoise", gant: "blanc", poignet: "noir", motif: "uni" } },
  { id: "devin", nom: "Le Devin", style: "Le devin", desc: "lit ton jeu comme un livre ouvert.", elo: 1520, specialite: "La lecture", imprevisibilite: 75, favori: 0, av: { symbole: "pierre", fond: "galaxie", gant: "argent", poignet: "or", motif: "etoile" } },
  { id: "baron", nom: "Le Baron", style: "L'aristocrate", desc: "contre tes habitudes avec élégance.", elo: 1560, specialite: "La lecture", imprevisibilite: 78, favori: 2, av: { symbole: "feuille", fond: "rubis", gant: "blanc", poignet: "or", motif: "rayures" } },
  { id: "minotaure", nom: "Minotaure", style: "Le colosse", desc: "t'enferme dans ton propre labyrinthe.", elo: 1590, specialite: "La lecture", imprevisibilite: 81, favori: 0, av: { symbole: "pierre", fond: "terre", gant: "rouge", poignet: "or", motif: "eclair" } },
  { id: "comtesse", nom: "La Comtesse", style: "La redoutable", desc: "ne laisse rien passer de tes manies.", elo: 1620, specialite: "La lecture", imprevisibilite: 84, favori: 2, av: { symbole: "feuille", fond: "rubis", gant: "violet", poignet: "or", motif: "etoile" } },
  { id: "pharaon", nom: "Le Pharaon", style: "L'éternel", desc: "a tout vu, surtout tes habitudes.", elo: 1660, specialite: "La lecture", imprevisibilite: 87, favori: 1, av: { symbole: "ciseaux", fond: "or", gant: "or", poignet: "bleu", motif: "etoile" } },
  { id: "hydre", nom: "Hydre", style: "L'insaisissable", desc: "coupe une de tes habitudes, il en repousse deux.", elo: 1690, specialite: "La lecture", imprevisibilite: 90, favori: 1, av: { symbole: "ciseaux", fond: "stade", gant: "vert", poignet: "noir", motif: "eclair" } },
  { id: "bigbang", nom: "Big Bang", style: "L'explosif", desc: "fait exploser tes habitudes.", elo: 1720, specialite: "La lecture", imprevisibilite: 93, favori: 0, av: { symbole: "pierre", fond: "galaxie", gant: "or", poignet: "noir", motif: "eclair" } },
  { id: "reinemere", nom: "La Reine Mère", style: "La souveraine", desc: "la plus forte de toutes. Respect.", elo: 1750, specialite: "La lecture", imprevisibilite: 95, favori: 2, av: { symbole: "feuille", fond: "stade", gant: "or", poignet: "or", motif: "etoile" } },
];
export const TOUS_LES_BOTS = [...BOTS, ...AUTRES_BOTS];

export const botParId = id => TOUS_LES_BOTS.find(b => b.id === id) || null;

// Cycle de Cyclo : Pierre, Feuille, Ciseaux.
const CYCLE = [PIERRE, FEUILLE, CISEAUX];

// Bot lecteur : prédit le prochain signe de l'adversaire et joue ce qui le bat.
// `bruit` = part de coups joués au hasard pour rester battable.
function lecteur(hist, bruit, rng) {
  if (hist.length < 3) return signeAuHasard(rng);
  const l = new Lecteur();
  hist.forEach(h => l.apprendre(h.adv, inverse(h.res)));
  const p = l.predire();
  if (p === null || rng() < bruit) return signeAuHasard(rng);
  return contre(p);
}
// Résultat vu de l'autre côté.
export const inverse = r => (r === "g" ? "p" : r === "p" ? "g" : "e");

// Némésis : plusieurs façons de prédire ton prochain signe ; on garde celle qui aurait marché le plus souvent
// sur les 12 derniers coups.
const PREDICTEURS = {
  frequent: h => { const c = [0, 0, 0]; h.slice(-10).forEach(x => c[x.adv]++); return c.indexOf(Math.max(...c)); },
  copie: h => h[h.length - 1].adv,                                   // tu rejoues ton dernier signe
  rotation: h => contre(h[h.length - 1].adv),                        // tu joues ce qui battait ton dernier signe
  // tu gardes ton signe après une victoire ; après une défaite, tu joues ce qui battait mon signe
  reflexe: h => { const d = h[h.length - 1]; return d.res === "g" ? contre(d.moi) : d.adv; },
  habitudes: h => { const l = new Lecteur(); h.forEach(x => l.apprendre(x.adv, inverse(x.res))); return l.predire(); },
};
function adaptatif(hist, bruit, rng) {
  if (hist.length < 4 || rng() < bruit) return signeAuHasard(rng);
  let meilleur = null, score = -1, essais = 0;
  for (const [nom, predire] of Object.entries(PREDICTEURS)) {
    let s = 0; essais = 0;
    for (let i = Math.max(1, hist.length - 12); i < hist.length; i++, essais++) if (predire(hist.slice(0, i)) === hist[i].adv) s++;
    if (s > score) { score = s; meilleur = nom; }
  }
  // Aucune lecture ne marche mieux que le hasard : on joue au hasard (pour ne pas devenir prévisible soi-même).
  const p = PREDICTEURS[meilleur](hist);
  if (p === null || score <= essais * 0.4) return signeAuHasard(rng);
  return contre(p);
}
// Fin de set : le prochain point peut être décisif (balle de set, ou score serré près de la fin).
// Le score vu par le bot (côté 1 du match), pour choisirCoup.
export const contexteBot = m => ({ points: [m.points[1], m.points[0]], pointsParSet: m.format.pointsParSet, set: m.scoresSets.length, balle: !!balleDe(m) });
const finDeSet = ctx => !!ctx && (ctx.balle || Math.max(...ctx.points) >= ctx.pointsParSet - 2);

// hist : coups vus par le bot, { moi, adv, res: "g"|"p"|"e" }.
// ctx (facultatif) : { points: [bot, adversaire], pointsParSet, set (0 pour le premier), balle } — pour les bots qui tiennent compte du score.
export function choisirCoup(bot, hist, rng = Math.random, ctx = null) {
  const n = hist.length, dernier = hist[n - 1], R = rng();
  switch (bot.id) {
    case "bambi": {
      if (!n) return signeAuHasard(rng);
      const deuxDefaites = n >= 2 && hist[n - 1].res === "p" && hist[n - 2].res === "p";
      if (!deuxDefaites) return dernier.moi;
      const autres = [0, 1, 2].filter(x => x !== dernier.moi);
      return autres[Math.floor(rng() * 2)];
    }
    case "papyrus": return R < 0.55 ? FEUILLE : signeAuHasard(rng);
    case "tictac": {
      if (!n) return signeAuHasard(rng);
      const autres = [0, 1, 2].filter(x => x !== dernier.moi);
      return autres[Math.floor(rng() * 2)];
    }
    case "rancune": return n && dernier.res === "p" && R < 0.7 ? dernier.adv : lecteur(hist, 0.5, rng);
    case "bluffeur": {
      // L'habitude affichée : rejouer son signe. Au moment clé, il joue ce qui bat ta parade.
      if (!n) return signeAuHasard(rng);
      if (finDeSet(ctx)) return R < 0.8 ? contre(contre(dernier.moi)) : signeAuHasard(rng);
      return R < 0.4 ? dernier.moi : lecteur(hist, 0.06, rng);
    }
    case "mante": return finDeSet(ctx) || (ctx && Math.max(...ctx.points) >= ctx.pointsParSet / 2) ? lecteur(hist, 0.03, rng) : signeAuHasard(rng);
    case "nemesis": return adaptatif(hist, 0.06, rng);
    case "titan": {
      // Le boss : il rejoue en pensée les derniers coups avec chacune de ses méthodes (lire tes habitudes,
      // s'adapter, jouer au hasard) et garde celle qui aurait le mieux marché contre toi.
      if (n < 6) return signeAuHasard(rng);
      const gains = { lecteur: 0, adaptatif: 0 };
      for (let i = Math.max(4, n - 12); i < n; i++) {
        const passe = hist.slice(0, i), vrai = hist[i].adv;
        const l = new Lecteur(); passe.forEach(h => l.apprendre(h.adv, inverse(h.res)));
        const pl = l.predire(); if (pl !== null) gains.lecteur += pl === vrai ? 1 : contre(pl) === vrai ? -1 : 0;
        const pa = adaptatif(passe, 0, () => 0.5); gains.adaptatif += contre(pa) === vrai ? -1 : contre(vrai) === pa ? 1 : 0;
      }
      const [meilleur, g] = Object.entries(gains).sort((x, y) => y[1] - x[1])[0];
      if (g <= 0) return signeAuHasard(rng);                 // aucune méthode ne marche : le hasard, imprenable
      return meilleur === "lecteur" ? lecteur(hist, finDeSet(ctx) ? 0 : 0.03, rng) : adaptatif(hist, 0.02, rng);
    }
    case "rocky": return R < 0.5 ? PIERRE : signeAuHasard(rng);
    case "miroir": return n && R < 0.75 ? dernier.adv : signeAuHasard(rng);
    case "cyclo": {
      if (!n || R < 0.15) return signeAuHasard(rng);
      return CYCLE[(CYCLE.indexOf(dernier.moi) + 1) % 3];
    }
    case "boomerang": {
      if (!n || R < 0.15 || dernier.res === "e") return signeAuHasard(rng);
      return dernier.res === "g" ? dernier.moi : contre(dernier.adv);
    }
    case "chaos": return signeAuHasard(rng);
    case "stratege": return lecteur(hist, 0.12, rng);
    case "professeur": return lecteur(hist, 0.04, rng);
  }
  if (bot.favori !== undefined) return selonNiveau(bot, hist, rng);
  return signeAuHasard(rng);
}

// Les autres bots jouent comme sur le serveur (supabase/etape-24-bots-par-niveau.sql, _coup_bot) : les faibles jouent
// très souvent leur signe favori ; à partir du niveau 1 150, ils repèrent parfois ton signe préféré sur tes 6 derniers
// coups et jouent ce qui le bat (jusqu'à 45 % du temps pour les plus forts).
export function selonNiveau(bot, hist, rng = Math.random) {
  const lecture = Math.max(0, Math.min(0.45, (bot.elo - 1150) / 1100)), biais = Math.max(0.05, Math.min(0.6, (1500 - bot.elo) / 1200));
  if (hist.length >= 3 && rng() < lecture) {
    const c = [0, 0, 0]; hist.slice(-6).forEach(h => c[h.adv]++);
    return contre(c.indexOf(Math.max(...c)));
  }
  return rng() < biais ? bot.favori : signeAuHasard(rng);
}
