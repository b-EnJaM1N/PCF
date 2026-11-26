// La carte de joueur : les notes sur 99 et la rareté, calculées d'après la fiche.
// Ici, seulement les calculs (testés automatiquement). Le dessin est dans carte.js.
import { titresObtenus, signeFavori, jeuVide } from "./profil.js";
import { jeuMoins } from "./stats-passees.js";

// (20 novembre, choix du porteur du projet) Six stats en vrais pourcentages, seulement contre de vrais joueurs (« Mon jeu » contre
// les joueurs, P.parAdv.humains) : avant, six notes sur 99 (victoires, finition, mental, sets décisifs, imprévisibilité, expérience).
// Tant qu'un joueur n'a aucun match en ligne, « – ».
// (20 novembre, deuxième version, choix du porteur du projet : toutes les stats sans décimale ni signe « % » ;
// le sang-froid s'écrit SGF ; le flair devient le pourcentage de lectures réussies.)
const pc = (a, b) => (b ? `${Math.round((100 * a) / b)}` : "–");
// (20 novembre, barème validé par le porteur du projet) Les notes de 1 à 99, en trois paliers : 70 = la moyenne (le hasard), 90 = excellent,
// 99 = hors norme (très difficile à atteindre). Entre deux repères, une règle de trois ; en dessous du hasard, jusqu'à 50
// (24 novembre, choix du porteur du projet : le plus bas à 50 et non plus à 1 ; les valeurs sous 70 resserrées en proportion).
// Chaque barème : [[pourcentage, note], …], dans l'ordre. Les repères se changent ici (à caler sur les vrais chiffres des joueurs).
export const BAREMES = {
  // (20 novembre au soir, choix du porteur du projet : 70 = la moyenne, le niveau du hasard ; 90 = excellent ; 99 = hors norme)
  // le Punch : la part de TOUS les coups (égalités comprises) qui marquent le point ; au hasard, 1 sur 3
  PUN: [[15, 50], [100 / 3, 70], [40, 90], [45, 99]],
  SGF: [[20, 50], [50, 70], [60, 90], [70, 99]],
  // (26 novembre) le Flair : les points marqués quand l'adversaire a une habitude installée ; au hasard, 1 sur 3 (meilleurs bots : 45 %)
  FLA: [[0, 50], [100 / 3, 70], [40, 90], [46, 99]],
  // la Résistance : quand on ne marque pas, la part d'égalités (plutôt que de points perdus) ; au hasard, la moitié
  RES: [[20, 50], [50, 70], [60, 90], [66.7, 99]],
  // l'imprévisibilité : la part de tes coups que l'analyse devine (moins, c'est mieux) ; 1 sur 3 (le hasard) = 90, choix du porteur du projet
  IMP: [[20, 99], [100 / 3, 90], [45, 70], [50, 67], [60, 60], [70, 50]],
  // la diversification (son score de 0 à 100, voir diversification) : 40 / 30 / 30 = 70 ; 35 / 33 / 32 = 90 ; un tiers chacun = 99
  DIV: [[0, 50], [75, 70], [93.75, 90], [99, 98], [100, 99]],
  // (26 novembre, demande du porteur du projet : 0 % = 50, la moyenne = 70, excellent = 90, au-delà = exceptionnel)
  // l'Entame : les ouvertures (le 1er coup de chaque set) gagnées ; au hasard, 1 sur 3, comme le Punch
  ENT: [[0, 50], [100 / 3, 70], [40, 90], [45, 99]],
  // les Victoires : les matchs gagnés ; la moyenne, la moitié
  VIC: [[0, 50], [50, 70], [60, 90], [70, 99]],
};
// Assez de preuves pour une note (sinon « – ») : 30 lectures tentées pour le Flair, 50 coups non gagnés pour la Résistance.
export const MINIMUM = { FLA: 50, RES: 50 };   // (26 novembre : 50 occasions pour le Flair, au lieu de 30 lectures)
export const NOTE_MIN = 50;   // (24 novembre) la note la plus basse
export function noteBareme(p, bareme) {
  if (p === null || p === undefined || Number.isNaN(p)) return null;
  const b = bareme;
  let n;
  if (p <= b[0][0]) n = b[0][1];
  else if (p >= b.at(-1)[0]) n = b.at(-1)[1];
  else for (let k = 1; k < b.length; k++) if (p <= b[k][0]) { const [x0, y0] = b[k - 1], [x1, y1] = b[k]; n = y0 + ((p - x0) * (y1 - y0)) / (x1 - x0); break; }
  return Math.max(NOTE_MIN, Math.min(99, Math.round(n)));
}
// Le poids des preuves (20 novembre, validé par le porteur du projet) : la note part de 70 et ne rejoint sa vraie valeur qu'avec
// assez de situations (sinon, un joueur chanceux sur peu de matchs aurait 90) : on garde n ÷ PREUVES de l'écart à 70.
export const PREUVES = { IMP: 300, PUN: 500, POL: 300, SGF: 100, FLA: 200, RES: 300, ENT: 100, VIC: 50 };
export const avecPreuves = (note, n, besoin) => (note === null ? null : Math.round(70 + (note - 70) * Math.min(1, n / besoin)));
const notePc = (a, b, bareme, besoin) => (b ? `${avecPreuves(noteBareme((100 * a) / b, bareme), b, besoin)}` : "–");
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
// (21 novembre, demande du porteur du projet) Sans match contre de vrais joueurs, la carte prend les matchs contre les bots ; leur
// poids baisse à chaque match contre un joueur, et disparaît après HUMAINS_POUR_CARTE matchs contre des joueurs.
export const HUMAINS_POUR_CARTE = 20;
// La part des matchs contre les bots dans la carte (de 1 à 0).
export const partBots = P => Math.max(0, 1 - (P.parAdv?.humains?.matchs || 0) / HUMAINS_POUR_CARTE);
// Les compteurs de la carte : ceux contre les joueurs, plus ceux contre les bots, pondérés par partBots.
export function jeuPourCarte(P) {
  const h = P.parAdv?.humains || null, k = partBots(P);
  if (k <= 0) return h;
  const b = P.parAdv?.bots || jeuMoins(P, h || jeuVide());
  if (!h?.matchs) return b;
  const r = {};
  for (const c of new Set([...Object.keys(h), ...Object.keys(b)])) {
    const x = h[c], y = b[c];
    r[c] = Array.isArray(x) || Array.isArray(y) ? (x || [0, 0, 0]).map((v, i) => v + k * ((y || [])[i] || 0))
      : typeof x === "number" || typeof y === "number" ? (x || 0) + k * (y || 0) : x ?? y;
  }
  // (les égalités : comptées seulement si elles le sont des deux côtés, sinon le Punch et la Résistance seraient faussés)
  if (h.egalites === undefined || (b.matchs && b.egalites === undefined)) delete r.egalites;
  return r;
}
export function notesDe(P) {
  const h = jeuPourCarte(P);
  const ok = !!h?.matchs, rien = "–";
  const div = ok ? diversification(h.signes) : null;
  const imp = ok && h.lisibles >= 30 ? (100 * h.devines) / h.lisibles : null;   // (la part de coups devinés, en %)
  // (le Punch : les coups qui marquent le point ÷ tous les coups, égalités comprises ; il faut les égalités comptées)
  const gagnes = ok ? (h.apresVictoire || 0) + (h.victoires || 0) : 0, perdusTous = ok ? (h.apresDefaite || 0) + h.matchs - (h.victoires || 0) : 0;
  const points = ok && h.egalites !== undefined ? [gagnes, gagnes + perdusTous + h.egalites] : [0, 0];
  const sgf = ok ? [(h.ballesConverties || 0) + (h.ballesSauvees || 0) + (h.decisifsGagnes || 0), (h.ballesObtenues || 0) + (h.ballesSubies || 0) + (h.decisifsJoues || 0)] : [0, 0];
  const lectures = ok && (h.flairOccasions || 0) >= MINIMUM.FLA ? [h.flairPoints || 0, h.flairOccasions] : [0, 0];   // (26 novembre)
  // (la Résistance, ex-Endurance : ne pas perdre le point quand on ne le gagne pas, égalités ÷ (égalités + points perdus))
  const perdus = ok ? (h.apresDefaite || 0) + h.matchs - (h.victoires || 0) : 0, nonGagnes = (h?.egalites || 0) + perdus;
  const resistance = ok && h.egalites !== undefined && nonGagnes >= MINIMUM.RES ? [h.egalites, nonGagnes] : [0, 0];
  // (26 novembre) l'Entame (ouvertures gagnées ÷ ouvertures) et les Victoires (matchs gagnés ÷ matchs)
  const ouv = ok && Array.isArray(h.ouvertures) ? [h.ouvertures[0] || 0, (h.ouvertures[0] || 0) + (h.ouvertures[1] || 0) + (h.ouvertures[2] || 0)] : [0, 0];
  const vic = ok ? [h.victoires || 0, h.matchs] : [0, 0];
  // (20 novembre : une phrase courte par note ; le calcul, à déplier à part ; textes validés par le porteur du projet)
  return [
    { code: "IMP", nom: "Imprévisibilité", valeur: imp === null ? rien : `${avecPreuves(noteBareme(imp, BAREMES.IMP), h.lisibles, PREUVES.IMP)}`, aide: "ton jeu est-il difficile à deviner ?",
      calcul: "l'appli essaie de deviner ton prochain coup à partir de tes habitudes. Moins elle y arrive, mieux c'est. Deviné 7 coups sur 10 ou plus → 50 · 1 sur 2 → 67 · un peu moins d'1 sur 2 → 70 · 1 sur 3 (comme le hasard) → 90 · 1 sur 5 → 99" },
    { code: "PUN", nom: "Punch", valeur: notePc(...points, BAREMES.PUN, PREUVES.PUN), aide: "combien de tes coups marquent le point",
      calcul: "sur tous tes coups, égalités comprises, combien marquent le point. 1 sur 3 (le hasard) → 70 · 4 sur 10 → 90 · 45 sur 100 → 99" },
    { code: "POL", nom: "Polyvalence", valeur: div === null ? rien : `${avecPreuves(noteBareme(div, BAREMES.DIV), h.signes.reduce((x, y) => x + y, 0), PREUVES.POL)}`, aide: "l'équilibre entre tes trois signes",
      calcul: "tes trois signes sont-ils joués autant les uns que les autres ? 40 % / 30 % / 30 % → 70 · 35 / 33 / 32 → 90 · exactement un tiers chacun → 99 · un signe joué 60 % du temps ou plus → 50" },
    { code: "SGF", nom: "Sang-froid", valeur: notePc(...sgf, BAREMES.SGF, PREUVES.SGF), aide: "les moments décisifs que tu remportes",
      calcul: "dans les moments décisifs (tes balles de set et de match, celles de ton adversaire, les sets décisifs), combien tu en remportes. La moitié → 70 · 6 sur 10 → 90 · 7 sur 10 → 99" },
    { code: "FLA", nom: "Flair", valeur: notePc(...lectures, BAREMES.FLA, PREUVES.FLA), aide: "les points que tu marques quand ton adversaire a une habitude",
      calcul: `quand ton adversaire a une habitude bien installée dans le match (par exemple, il rejoue le signe qui vient de gagner), combien de ces coups-là te donnent le point. 1 sur 3 (le hasard) → 70 · 4 sur 10 → 90 · 46 sur 100 → 99 · à partir de ${MINIMUM.FLA} occasions` },
    { code: "RÉS", nom: "Résistance", valeur: notePc(...resistance, BAREMES.RES, PREUVES.RES), aide: "éviter de perdre le point quand tu ne le marques pas",
      calcul: `quand tu ne marques pas le point, combien de fois tu évites de le perdre (une égalité plutôt qu'un point perdu). La moitié (le hasard) → 70 · 6 sur 10 → 90 · 2 sur 3 → 99 · à partir de ${MINIMUM.RES} coups` },
    { code: "ENT", nom: "Entame", valeur: notePc(...ouv, BAREMES.ENT, PREUVES.ENT), aide: "les ouvertures (1er coup d'un set) que tu gagnes",
      calcul: "sur le premier coup de chaque set, combien tu en gagnes. Aucune → 50 · 1 sur 3 (le hasard) → 70 · 4 sur 10 → 90 · 45 sur 100 → 99" },
    { code: "VIC", nom: "Victoires", valeur: notePc(...vic, BAREMES.VIC, PREUVES.VIC), aide: "les matchs que tu gagnes",
      calcul: "sur tous tes matchs, combien tu en gagnes. Aucun → 50 · la moitié → 70 · 6 sur 10 → 90 · 7 sur 10 → 99" },
  ];
}

// La note générale (21 novembre, choix du porteur du projet) : la moyenne des six notes, avec des coefficients (total 9) ;
// une note pas encore calculée (« – ») compte 70, le hasard. Aucune note du tout (pas de match contre un joueur) : null.
// (26 novembre, d'après la simulation entre bots, validé par le porteur du projet) Punch ×3 ; Flair, Victoires, Imprévisibilité ×2.
export const COEFS = { IMP: 2, PUN: 3, POL: 1, SGF: 1, FLA: 2, "RÉS": 1, ENT: 1, VIC: 2 };
export function generale(notes) {
  const nb = n => (Number.isFinite(Number(n.valeur)) && n.valeur !== "" ? Number(n.valeur) : null);
  if (!notes.some(n => nb(n) !== null)) return null;
  let s = 0, t = 0;
  for (const n of notes) { const k = COEFS[n.code] ?? 1; s += k * (nb(n) ?? 70); t += k; }
  return Math.round(s / t);
}
export const texteCoefs = () => "Punch ×3 · Imprévisibilité, Flair et Victoires ×2 · Polyvalence, Sang-froid, Résistance et Entame ×1";

// Comparer deux cartes (21 novembre, demande du porteur du projet) : notes de A et de B (notesDe). → { lignes : [{ code, nom, a, b,
// mieux : 0 (A), 1 (B) ou null }], generales : [a, b], gagnees, perdues, egalites } (vu de A ; une note « – » ne compte pour personne).
export function comparer(notesA, notesB) {
  const nb = v => (Number.isFinite(Number(v)) && v !== "" ? Number(v) : null);
  const r = { lignes: [], generales: [generale(notesA), generale(notesB)], gagnees: 0, perdues: 0, egalites: 0 };
  notesA.forEach((n, i) => {
    const m = notesB.find(x => x.code === n.code) || notesB[i], a = nb(n.valeur), b = nb(m?.valeur);
    let mieux = null;
    if (a !== null && b !== null) { if (a > b) { mieux = 0; r.gagnees++; } else if (b > a) { mieux = 1; r.perdues++; } else r.egalites++; }
    r.lignes.push({ code: n.code, nom: n.nom, a: n.valeur, b: m?.valeur ?? "–", mieux });
  });
  return r;
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
  const fav = P.matchs ? signeFavori(P.signes) : null, notes = notesDe(P);
  return {
    rarete: rangDe(P, niveauOfficiel).rang.id, rang: rangDe(P, niveauOfficiel),
    niveau: niveauOfficiel ?? P.elo,
    typeNiveau: niveauOfficiel === null || niveauOfficiel === undefined ? "NIVEAU" : provisoire ? "NIVEAU PROVISOIRE" : "NIVEAU OFFICIEL",
    signe: fav,                        // 0 Pierre, 1 Ciseaux, 2 Feuille, ou null
    notes, generale: generale(notes),
    surnom, titre,
    titres: titresObtenus(P).length, matchs: P.matchs,
  };
}
