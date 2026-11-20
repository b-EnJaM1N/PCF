// La carte de joueur : les notes sur 99 et la rareté, calculées d'après la fiche.
// Ici, seulement les calculs (testés automatiquement). Le dessin est dans carte.js.
import { indiceImprevisibilite } from "./analyse.js";
import { titresObtenus, signeFavori } from "./profil.js";

// (20 novembre, choix du porteur du projet) Six stats en vrais pourcentages, seulement contre de vrais joueurs (« Mon jeu » contre
// les joueurs, P.parAdv.humains) : avant, six notes sur 99 (victoires, finition, mental, sets décisifs, imprévisibilité, expérience).
// Tant qu'un joueur n'a aucun match en ligne, « – ».
// (20 novembre, deuxième version, choix du porteur du projet : toutes les stats sans décimale ni signe « % » ;
// le sang-froid s'écrit SGF ; le flair devient le pourcentage de lectures réussies.)
const pc = (a, b) => (b ? `${Math.round((100 * a) / b)}` : "–");
// (20 novembre, barème validé par le porteur du projet : des notes façon FIFA, de 1 à 99, 50 = le hasard) Le pourcentage p devient
// une note : 50 % → 50, « top » → 99, et autant en dessous du hasard → 1 (règle de trois entre les deux). Les repères se changent ici.
export const BAREME = { RÉU: 65, VIC: 80, SGF: 75, FLA: 80 };
export function noteFifa(p, top) {
  if (p === null || p === undefined) return null;
  return Math.max(1, Math.min(99, Math.round(50 + ((p - 50) * 49) / (top - 50))));
}
const notePc = (a, b, top) => (b ? `${noteFifa((100 * a) / b, top)}` : "–");
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
  const imp = ok && h.lisibles >= 30 ? indiceImprevisibilite(h.devines / h.lisibles) : null;
  const points = ok ? [(h.apresVictoire || 0) + (h.victoires || 0), (h.apresVictoire || 0) + (h.apresDefaite || 0) + h.matchs] : [0, 0];
  const sgf = ok ? [(h.ballesConverties || 0) + (h.ballesSauvees || 0) + (h.decisifsGagnes || 0), (h.ballesObtenues || 0) + (h.ballesSubies || 0) + (h.decisifsJoues || 0)] : [0, 0];
  const lectures = ok ? [h.lecturesReussies || 0, (h.lecturesReussies || 0) + (h.lecturesRatees || 0)] : [0, 0];
  return [
    { code: "IMP", nom: "Imprévisibilité", valeur: imp === null ? rien : `${Math.min(99, imp)}`, aide: "à quel point ton jeu est difficile à lire" },
    { code: "RÉU", nom: "Taux de réussite", valeur: notePc(...points, BAREME.RÉU), aide: `les points gagnés, sans compter les égalités (50 : la moitié ; 99 : ${BAREME.RÉU} % ou plus)` },
    { code: "DIV", nom: "Diversification", valeur: div === null ? rien : `${Math.min(99, div)}`, aide: "l'équilibre entre tes trois signes (99 : 33,3 % chacun)" },
    { code: "VIC", nom: "Victoires", valeur: ok ? notePc(h.victoires || 0, h.matchs, BAREME.VIC) : rien, aide: `tes matchs gagnés (50 : la moitié ; 99 : ${BAREME.VIC} % ou plus)` },
    { code: "SGF", nom: "Sang-froid", valeur: notePc(...sgf, BAREME.SGF), aide: `les moments décisifs réussis : balles de set et de match converties et sauvées, sets décisifs gagnés (50 : la moitié ; 99 : ${BAREME.SGF} % ou plus)` },
    { code: "FLA", nom: "Flair", valeur: notePc(...lectures, BAREME.FLA), aide: `tes lectures réussies : quand tu contres un réflexe de ton adversaire, le point est pour toi (50 : la moitié ; 99 : ${BAREME.FLA} % ou plus)` },
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
