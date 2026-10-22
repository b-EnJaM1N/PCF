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
  return signeAuHasard(rng);
}
