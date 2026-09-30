// Vérifie la force réelle des bots en les faisant jouer contre des « joueurs types » humains.
// Lancer avec : node outils/calibrer-bots.js
// Chaque bot joue des centaines de matchs (sets de 11, 2 sets gagnants) contre quatre profils de joueurs ;
// son taux de victoire donne un niveau estimé (50 % de victoires = 1200).
import { BOTS, choisirCoup, contexteBot, inverse } from "../app/js/bots.js";
import { nouveauMatch, jouerCoup, contre, signeAuHasard, PIERRE } from "../app/js/regles.js";
import { Lecteur } from "../app/js/analyse.js";

// Des joueurs humains typiques. h : coups vus par le joueur { moi, adv, res }.
const JOUEURS = {
  // Réflexes courants : on garde le signe qui vient de gagner, on change après une défaite ; Pierre au départ.
  reflexes: (h, r) => {
    const d = h[h.length - 1];
    if (!d) return r() < 0.4 ? PIERRE : signeAuHasard(r);
    if (r() < 0.3) return signeAuHasard(r);
    return d.res === "g" ? d.moi : d.res === "p" ? contre(d.adv) : signeAuHasard(r);
  },
  // Un joueur qui observe et apprend les habitudes de son adversaire.
  apprenant: (h, r) => {
    if (h.length < 3 || r() < 0.3) return signeAuHasard(r);
    const l = new Lecteur(); h.forEach(x => l.apprendre(x.adv, inverse(x.res)));
    const p = l.predire(); return p === null ? signeAuHasard(r) : contre(p);
  },
  // Quelqu'un qui joue au hasard (le plus difficile à battre sur la durée).
  hasard: (h, r) => signeAuHasard(r),
  // Un joueur qui a un signe préféré et tourne un peu.
  prefere: (h, r) => (r() < 0.45 ? PIERRE : h.length && r() < 0.5 ? contre(h[h.length - 1].moi) : signeAuHasard(r)),
};

function rng(graine) { let s = graine >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; }; }

function match(bot, joueur, r) {
  const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), hb = [], hj = [];
  while (!m.termine) {
    const sj = joueur(hj, r), sb = choisirCoup(bot, hb, r, contexteBot(m));
    const e = jouerCoup(m, sj, sb), res = e.gagnant === null ? "e" : e.gagnant === 0 ? "g" : "p";
    hj.push({ moi: sj, adv: sb, res }); hb.push({ moi: sb, adv: sj, res: inverse(res) });
  }
  return m.vainqueur === 1;
}

export function calibrer(n = 300) {
  return BOTS.map(bot => {
    let v = 0, total = 0;
    for (const [k, joueur] of Object.entries(JOUEURS)) {
      const r = rng(k.length * 7919 + bot.id.length);
      for (let i = 0; i < n; i++) { if (match(bot, joueur, r)) v++; total++; }
    }
    const p = Math.min(0.99, Math.max(0.01, v / total));
    return { id: bot.id, affiche: bot.elo, victoires: Math.round(100 * p), estime: Math.round(1200 + 400 * Math.log10(p / (1 - p))) };
  });
}

if (process.argv[1]?.endsWith("calibrer-bots.js")) {
  for (const r of calibrer()) console.log(`${r.id.padEnd(11)} affiché ${r.affiche}  ·  ${String(r.victoires).padStart(2)} % de victoires  ·  estimé ${r.estime}`);
}
