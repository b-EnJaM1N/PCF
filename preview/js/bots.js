// Les sept bots du mode solo. Les plus faibles ont une faille exploitable :
// la découvrir en lisant l'historique fait partie du plaisir.
import { contre, signeAuHasard, PIERRE, FEUILLE, CISEAUX } from "./regles.js";
import { Lecteur } from "./analyse.js";

export const BOTS = [
  { id: "rocky", nom: "Rocky", style: "L'agressif", desc: "adore la Pierre. Beaucoup trop.", elo: 1050, av: { symbole: "pierre", fond: "terre", gant: "rouge", poignet: "noir", motif: "uni" } },
  { id: "miroir", nom: "Miroir", style: "Le copieur", desc: "rejoue souvent ton dernier coup.", elo: 1100, av: { symbole: "feuille", fond: "court", gant: "blanc", poignet: "bleu", motif: "rayures" } },
  { id: "cyclo", nom: "Cyclo", style: "Le mécanique", desc: "tourne en boucle : Pierre, Feuille, Ciseaux.", elo: 1150, av: { symbole: "ciseaux", fond: "gazon", gant: "jaune", poignet: "blanc", motif: "rayures" } },
  { id: "boomerang", nom: "Boomerang", style: "Le réactif", desc: "garde son signe quand il gagne, en change quand il perd.", elo: 1200, av: { symbole: "pierre", fond: "violet", gant: "jaune", poignet: "rouge", motif: "etoile" } },
  { id: "chaos", nom: "Chaos", style: "L'imprévisible", desc: "joue au hasard total. Impossible à lire, impossible à piéger.", elo: 1250, av: { symbole: "ciseaux", fond: "court", gant: "vert", poignet: "jaune", motif: "eclair" } },
  { id: "stratege", nom: "Stratège", style: "Le lecteur", desc: "analyse tes habitudes et les contre.", elo: 1300, av: { symbole: "feuille", fond: "ardoise", gant: "rouge", poignet: "noir", motif: "eclair" } },
  { id: "professeur", nom: "Professeur", style: "Le maître", desc: "lit tes réflexes plus vite que son ombre.", elo: 1400, av: { symbole: "feuille", fond: "or", gant: "blanc", poignet: "noir", motif: "etoile" } },
];

export const botParId = id => BOTS.find(b => b.id === id) || null;

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

// hist : coups vus par le bot, { moi, adv, res: "g"|"p"|"e" }.
export function choisirCoup(bot, hist, rng = Math.random) {
  const n = hist.length, dernier = hist[n - 1], R = rng();
  switch (bot.id) {
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
  return signeAuHasard(rng);
}
