// La carte de joueur : les notes sur 99 et la rareté, calculées d'après la fiche.
// Ici, seulement les calculs (testés automatiquement). Le dessin est dans carte.js.
import { titresObtenus, signeFavori } from "./profil.js";

// (20 novembre, choix du porteur du projet) Six stats en vrais pourcentages, seulement contre de vrais joueurs (« Mon jeu » contre
// les joueurs, P.parAdv.humains) : avant, six notes sur 99 (victoires, finition, mental, sets décisifs, imprévisibilité, expérience).
// Tant qu'un joueur n'a aucun match en ligne, « – ».
// (20 novembre, deuxième version, choix du porteur du projet : toutes les stats sans décimale ni signe « % » ;
// le sang-froid s'écrit SGF ; le flair devient le pourcentage de lectures réussies.)
const pc = (a, b) => (b ? `${Math.round((100 * a) / b)}` : "–");
// (20 novembre, barème validé par le porteur du projet) Les notes de 1 à 99, en trois paliers : 50 = le hasard, 90 = excellent,
// 99 = hors norme (très difficile à atteindre). Entre deux repères, une règle de trois ; en dessous du hasard, jusqu'à 1.
// Chaque barème : [[pourcentage, note], …], dans l'ordre. Les repères se changent ici (à caler sur les vrais chiffres des joueurs).
export const BAREMES = {
  PUN: [[35, 1], [50, 50], [60, 90], [66, 99]],
  SGF: [[25, 1], [50, 50], [65, 90], [75, 99]],
  FLA: [[20, 1], [50, 50], [65, 90], [80, 99]],
  END: [[20, 1], [50, 50], [60, 90], [66, 99]],
  // l'imprévisibilité : la part de tes coups que l'analyse devine (moins, c'est mieux ; 33 % = le hasard)
  IMP: [[20, 99], [25, 96], [30, 92], [100 / 3, 90], [40, 75], [50, 50], [60, 20], [70, 1]],
  // la diversification (son score de 0 à 100, voir diversification) : 40 / 30 / 30 = 75 ; 35 / 33 / 32 = 90 ; 33,3 % partout = 99
  DIV: [[0, 1], [75, 75], [93.75, 90], [99, 98], [100, 99]],
};
// Assez de preuves pour une note (sinon « – ») : 30 lectures tentées pour le Flair, 50 coups non gagnés pour l'Endurance.
export const MINIMUM = { FLA: 30, END: 50 };
export function noteBareme(p, bareme) {
  if (p === null || p === undefined || Number.isNaN(p)) return null;
  const b = bareme;
  let n;
  if (p <= b[0][0]) n = b[0][1];
  else if (p >= b.at(-1)[0]) n = b.at(-1)[1];
  else for (let k = 1; k < b.length; k++) if (p <= b[k][0]) { const [x0, y0] = b[k - 1], [x1, y1] = b[k]; n = y0 + ((p - x0) * (y1 - y0)) / (x1 - x0); break; }
  return Math.max(1, Math.min(99, Math.round(n)));
}
const notePc = (a, b, bareme) => (b ? `${noteBareme((100 * a) / b, bareme)}` : "–");
// Les repères, en clair (« Le détail du calcul », sous la carte).
const reperes = (b, unite = " %") => b.filter(([, n]) => [50, 90, 99].includes(n)).map(([x, n]) => `${Math.round(x)}${unite} = ${n}`).join(" · ");

// La diversification : l'équilibre entre les trois signes, sur un barème serré. 100 seulement quand les trois signes sont à 33,3 %
// chacun (au dixième près) ; sinon, au plus 99 (40 / 30 / 30 : 75 ; 50 / 25 / 25 : 37 ; 60 / 20 / 20 ou pire : 0).
export function diversification(signes) {
  const t = (signes || []).reduce((a, b) => a + b, 0);
  if (!t) return null;
  const parts = signes.map(s => Math.round((1000 * s) / t) / 10);
  if (parts.every(p => p >= 33.3 && p <= 33.4)) return 100;
  const ecart = signes.reduce((e, s) => e + Math.abs(s / t - 1 / 3), 0);
  return Math.min(99, Math.max(0, Math.floor(100 - 187.5 * ecart)));
}
export function notesDe(P) {
  const h = P.parAdv?.humains;
  const ok = !!h?.matchs, rien = "–";
  const div = ok ? diversification(h.signes) : null;
  const imp = ok && h.lisibles >= 30 ? (100 * h.devines) / h.lisibles : null;   // (la part de coups devinés, en %)
  const points = ok ? [(h.apresVictoire || 0) + (h.victoires || 0), (h.apresVictoire || 0) + (h.apresDefaite || 0) + h.matchs] : [0, 0];
  const sgf = ok ? [(h.ballesConverties || 0) + (h.ballesSauvees || 0) + (h.decisifsGagnes || 0), (h.ballesObtenues || 0) + (h.ballesSubies || 0) + (h.decisifsJoues || 0)] : [0, 0];
  const lectures = ok && (h.flairTentees || 0) >= MINIMUM.FLA ? [h.flairReussies || 0, h.flairTentees] : [0, 0];
  // (l'Endurance, deuxième version : ne pas perdre le point quand on ne le gagne pas, égalités ÷ (égalités + points perdus))
  const perdus = ok ? (h.apresDefaite || 0) + h.matchs - (h.victoires || 0) : 0, nonGagnes = (h?.egalites || 0) + perdus;
  const endurance = ok && h.egalites !== undefined && nonGagnes >= MINIMUM.END ? [h.egalites, nonGagnes] : [0, 0];
  // (20 novembre : une phrase courte par note ; le calcul, à déplier à part)
  return [
    { code: "IMP", nom: "Imprévisibilité", valeur: imp === null ? rien : `${noteBareme(imp, BAREMES.IMP)}`, aide: "ton jeu est-il difficile à lire ?",
      calcul: `la part de tes coups que l'analyse devine (moins, c'est mieux) : ${reperes(BAREMES.IMP)} ; à partir de 30 coups lus` },
    { code: "PUN", nom: "Punch", valeur: notePc(...points, BAREMES.PUN), aide: "les points que tu gagnes hors égalités",
      calcul: `points gagnés ÷ points joués sans les égalités : ${reperes(BAREMES.PUN)}` },
    { code: "DIV", nom: "Diversification", valeur: div === null ? rien : `${noteBareme(div, BAREMES.DIV)}`, aide: "l'équilibre entre tes trois signes",
      calcul: "40 / 30 / 30 % = 75 · 35 / 33 / 32 % = 90 · 33,3 % chacun = 99" },
    { code: "SGF", nom: "Sang-froid", valeur: notePc(...sgf, BAREMES.SGF), aide: "les moments décisifs que tu réussis",
      calcul: `balles de set et de match converties et sauvées, sets décisifs gagnés : ${reperes(BAREMES.SGF)}` },
    { code: "FLA", nom: "Flair", valeur: notePc(...lectures, BAREMES.FLA), aide: "les habitudes de ton adversaire que tu punis",
      calcul: `quand il a une habitude bien installée dans le match et que tu joues ce qui la bat, le point est pour toi : ${reperes(BAREMES.FLA)} ; à partir de ${MINIMUM.FLA} lectures` },
    { code: "END", nom: "Endurance", valeur: notePc(...endurance, BAREMES.END), aide: "ne pas perdre le point quand tu ne le gagnes pas",
      calcul: `la part d'égalités parmi les points que tu ne gagnes pas : ${reperes(BAREMES.END)} ; à partir de ${MINIMUM.END} coups` },
  ];
}

// Les 10 rangs de la carte, du plus courant au plus rare. On monte les premiers en jouant,
// les suivants demandent du niveau officiel (les tournois gagnés contre les bots ne mènent pas plus haut que Platine).
export const RANGS = [
  { id: "bois", nom: "Bois", condition: "nouveau joueur", ok: () => true },
  { id: "bronze", nom: "Bronze", condition: "5 matchs", ok: P => P.matchs >= 5 },
  { id: "argent", nom: "Argent", condition: "15 matchs", ok: P => P.matchs >= 15 },
  { id: "or", nom: "Or", condition: "30 matchs et 3 titres", ok: (P, n, t) => P.matchs >= 30 && t >= 3 },
  { id: "platine", nom: "Platine", condition: "niveau officiel 1300, ou un tournoi gagné et 30 matchs", ok: (P, n) => n >= 1300 || (P.tournoisGagnes >= 1 && P.matchs >= 30) },
  { id: "diamant", nom: "Diamant", condition: "niveau officiel 1400", ok: (P, n) => n >= 1400 },
  { id: "rubis", nom: "Rubis", condition: "niveau officiel 1500", ok: (P, n) => n >= 1500 },
  { id: "maitre", nom: "Maître", condition: "niveau officiel 1600", ok: (P, n) => n >= 1600 },
  { id: "grand_maitre", nom: "Grand Maître", condition: "niveau officiel 1750", ok: (P, n) => n >= 1750 },
  { id: "legende", nom: "Légende", condition: "niveau officiel 1900", ok: (P, n) => n >= 1900 },
];

// Le rang de la carte (le plus haut atteint) et le suivant.
// niveauOfficiel : le niveau des duels entre humains (null si inconnu).
export function rangDe(P, niveauOfficiel = null) {
  const n = niveauOfficiel ?? 0, t = titresObtenus(P).length;
  let i = 0;
  RANGS.forEach((r, k) => { if (r.ok(P, n, t)) i = k; });
  return { rang: RANGS[i], numero: i + 1, suivant: RANGS[i + 1] || null };
}
export function texteRang({ rang, numero, suivant }) {
  return `Carte ${rang.nom} (rang ${numero} sur ${RANGS.length}). ` + (suivant ? `Prochain rang, ${suivant.nom} : ${suivant.condition}.` : "Tu es au sommet. Reste-y.");
}

// Tout ce que la carte affiche. niveauOfficiel : le niveau des duels entre humains, s'il est connu.
export function carteDe(P, { niveauOfficiel = null, provisoire = false, surnom = "", titre = "" } = {}) {
  const fav = P.matchs ? signeFavori(P.signes) : null;
  return {
    rarete: rangDe(P, niveauOfficiel).rang.id, rang: rangDe(P, niveauOfficiel),
    niveau: niveauOfficiel ?? P.elo,
    typeNiveau: niveauOfficiel === null || niveauOfficiel === undefined ? "NIVEAU" : provisoire ? "NIVEAU PROVISOIRE" : "NIVEAU OFFICIEL",
    signe: fav,                        // 0 Pierre, 1 Ciseaux, 2 Feuille, ou null
    notes: notesDe(P),
    surnom, titre,
    titres: titresObtenus(P).length, matchs: P.matchs,
  };
}
