// Quelles notes de la carte vont avec les victoires ? (26 novembre, idée du porteur du projet)
// Lancer avec : node outils/simuler-notes.js [nombre de tours, 4 par défaut]
// Tous les bots s'affrontent (sets de 11, 2 sets gagnants), chaque match enregistré comme à la fin d'un vrai match (profil.js) ;
// puis, pour chaque note, son lien avec le pourcentage de victoires (corrélation : 1 = lien parfait, 0 = aucun lien).
// Le 26 novembre (4 tours, 252 matchs par bot) : Punch 0,93 ; Flair (nouveau) 0,91 ; Sang-froid 0,91 ; Polyvalence 0,90
// (trompeur : les bots faibles sont conçus pour s'accrocher à un signe) ; Entame 0,52 ; Imprévisibilité 0,51 ; Résistance 0,30.
// À refaire avec de vrais matchs entre joueurs quand il y en aura assez.
import { TOUS_LES_BOTS, choisirCoup, contexteBot } from "../app/js/bots.js";
import { nouveauMatch, jouerCoup } from "../app/js/regles.js";
import { profilParDefaut, enregistrerMatch } from "../app/js/profil.js";
import { nouvellesStats, suivreCoup } from "../app/js/stats-match.js";
import { Suivi } from "../app/js/analyse.js";
import { diversification } from "../app/js/carte-logique.js";

let graine = 7;
const rng = () => { graine = (graine * 1103515245 + 12345) % 2147483648; return graine / 2147483648; };
const bots = TOUS_LES_BOTS.filter(b => !b.modele);
const fiches = new Map(bots.map(b => [b.id, profilParDefaut()]));
const tours = Number(process.argv[2] || 4);
const res = (g, j) => (g === null ? "e" : g === j ? "g" : "p");

function jouer(b0, b1) {
  const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), st = nouvellesStats(), su = [new Suivi(), new Suivi()];
  while (!m.termine && m.coups.length < 400) {
    const h0 = m.coups.map(c => ({ moi: c.a, adv: c.b, res: res(c.gagnant, 0) }));
    const h1 = m.coups.map(c => ({ moi: c.b, adv: c.a, res: res(c.gagnant, 1) }));
    const ctx1 = contexteBot(m), ctx0 = { ...ctx1, points: [m.points[0], m.points[1]] };
    const a = choisirCoup(b0, h0, rng, ctx0), b = choisirCoup(b1, h1, rng, ctx1);
    su[0].figer(); su[1].figer();
    const e = jouerCoup(m, a, b);
    suivreCoup(st, m, e);
    su[0].enregistrer(a, res(e.gagnant, 0)); su[1].enregistrer(b, res(e.gagnant, 1));
  }
  if (!m.termine) return;
  // le même match vu de l'autre côté
  const mm = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), st1 = nouvellesStats();
  for (const c of m.coups) suivreCoup(st1, mm, jouerCoup(mm, c.b, c.a));
  const adv = b => ({ id: `h:${b.id}`, nom: b.nom || b.id, elo: 1200 });
  enregistrerMatch(fiches.get(b0.id), { match: m, stats: st, devines: su[0].devines, lisibles: su[0].lisibles, adversaire: adv(b1), compteNiveau: false, date: 1 });
  enregistrerMatch(fiches.get(b1.id), { match: mm, stats: st1, devines: su[1].devines, lisibles: su[1].lisibles, adversaire: adv(b0), compteNiveau: false, date: 1 });
}
for (let k = 0; k < tours; k++) for (let i = 0; i < bots.length; i++) for (let j = i + 1; j < bots.length; j++) (k % 2 ? jouer(bots[j], bots[i]) : jouer(bots[i], bots[j]));

const lignes = bots.map(b => {
  const h = fiches.get(b.id).parAdv.humains;
  const gagnes = h.apresVictoire + h.victoires, perdus = h.apresDefaite + h.matchs - h.victoires, o = h.ouvertures;
  return { id: b.id, v: {
    VIC: (100 * h.victoires) / h.matchs,
    PUN: (100 * gagnes) / (gagnes + perdus + h.egalites),
    IMP: (-100 * h.devines) / h.lisibles,   // (moins deviné, c'est mieux)
    POL: diversification(h.signes),
    SGF: (100 * (h.ballesConverties + h.ballesSauvees + h.decisifsGagnes)) / (h.ballesObtenues + h.ballesSubies + h.decisifsJoues),
    FLA: (100 * h.flairPoints) / h.flairOccasions,
    RES: (100 * h.egalites) / (h.egalites + perdus),
    ENT: (100 * o[0]) / (o[0] + o[1] + o[2]),
  } };
});
const correlation = (xs, ys) => {
  const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  let sxy = 0, sx = 0, sy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sx += (xs[i] - mx) ** 2; sy += (ys[i] - my) ** 2; }
  return sxy / Math.sqrt(sx * sy);
};
console.log(`${bots.length} bots, ${lignes.length && fiches.get(bots[0].id).parAdv.humains.matchs} matchs chacun`);
for (const c of ["PUN", "FLA", "SGF", "POL", "ENT", "IMP", "RES"]) {
  const l = lignes.filter(x => Number.isFinite(x.v[c]));
  console.log(`${c} : ${correlation(l.map(x => x.v[c]), l.map(x => x.v.VIC)).toFixed(2)}`);
}
const tri = [...lignes].sort((a, b) => b.v.VIC - a.v.VIC), f = x => String(Math.round(x)).padStart(4);
console.log(`\n${"bot".padEnd(12)}  VIC  PUN  FLA  SGF  POL  ENT  IMP  RES`);
for (const x of [...tri.slice(0, 8), ...tri.slice(-5)]) console.log(`${x.id.padEnd(12)}${["VIC", "PUN", "FLA", "SGF", "POL", "ENT", "IMP", "RES"].map(c => f(x.v[c])).join(" ")}`);
