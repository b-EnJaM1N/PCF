// Les ouvertures (25 novembre, exception validée par le porteur du projet) : le premier coup de chaque set, gagné, à égalité ou
// perdu. Dans « Mon jeu » (et « Son jeu » sur la fiche d'un joueur) et dans le face-à-face entre deux joueurs.
// Les compteurs : [gagnées, égalités, perdues]. Aucune connexion réseau ici : ces fonctions sont testées automatiquement.
import { nouveauMatch, jouerCoup, penaliser } from "./regles.js";

export const ouverturesVides = () => [0, 0, 0];

// coups : [{ gagnant: 0 (moi), 1 (l'autre) ou null }] ; debutsSet : l'index du premier coup de chaque set (regles.js).
// Un set commencé par une pénalité a pour ouverture son premier coup joué.
export function compterOuvertures(coups, debutsSet = [0]) {
  const o = ouverturesVides();
  for (const i of new Set(debutsSet)) {
    const c = coups?.[i];
    if (!c) continue;
    o[c.gagnant === 0 ? 0 : c.gagnant === 1 ? 2 : 1]++;
  }
  return o;
}

export const ajouterOuvertures = (a, b) => [0, 1, 2].map(k => (a?.[k] || 0) + (b?.[k] || 0));

// Un duel du serveur (coups { a, b, g } vus du joueur 0, penalites, points_par_set, sets_gagnants) : on rejoue le score pour
// savoir où commence chaque set. → l'index du premier coup de chaque set.
export function debutsSetDuel(d) {
  const coups = d?.coups || [];
  if (!d?.points_par_set) return [0];
  const m = nouveauMatch({ pointsParSet: d.points_par_set, setsGagnants: d.sets_gagnants || 2 });
  const pens = Array.isArray(d.penalites) ? d.penalites : [];
  let k = 0;
  try {
    for (let i = 0; i <= coups.length && !m.termine; i++) {
      while (k < pens.length && (pens[k].apres ?? 0) <= i && !m.termine) penaliser(m, pens[k++].fautif);
      if (i === coups.length || m.termine) break;
      const c = coups[i], g = c.g === 0 || c.g === 1 ? c.g : null;
      // (un signe manquant : on garde seulement qui a gagné le point)
      const [a, b] = c.a !== null && c.a !== undefined && c.b !== null && c.b !== undefined ? [c.a, c.b] : g === 0 ? [0, 1] : g === 1 ? [1, 0] : [0, 0];
      jouerCoup(m, a, b);
    }
  } catch { /* un duel qu'on ne sait pas rejouer : les débuts trouvés jusque-là */ }
  return m.debutsSet;
}

// Les ouvertures d'un duel, vues du joueur moi (0 ou 1).
export function ouverturesDuel(d, moi) {
  const coups = (d?.coups || []).map(c => ({ gagnant: c.g === 0 || c.g === 1 ? (c.g === moi ? 0 : 1) : null }));
  return compterOuvertures(coups, debutsSetDuel(d));
}
