// Le PCF Open : 8 joueurs en élimination directe, têtes de série selon le niveau.
// Quarts et demi-finales en 2 sets gagnants, finale en 3 sets gagnants.
import { BOTS, botParId, choisirCoup, inverse } from "./bots.js";
import { nouveauMatch, jouerCoup } from "./regles.js";

export const TOURS = ["Quarts de finale", "Demi-finales", "Finale"];
export const TOUR_SINGULIER = ["Quart de finale", "Demi-finale", "Finale"];
export const SETS_PAR_TOUR = [2, 2, 3];
// Place des têtes de série 1 à 8 dans le tableau : 1-8, 4-5, 3-6, 2-7.
const PLACEMENT = [0, 7, 3, 4, 2, 5, 1, 6];

export function nouveauTournoi(eloJoueur) {
  const elo = id => (id === "moi" ? eloJoueur : botParId(id).elo);
  const tableau = ["moi", ...BOTS.map(b => b.id)].sort((a, b) => elo(b) - elo(a));
  const quarts = [];
  for (let i = 0; i < 8; i += 2) quarts.push({ a: tableau[PLACEMENT[i]], b: tableau[PLACEMENT[i + 1]], v: null, score: "" });
  return { tour: 0, tours: [quarts, [], []], elimine: false, tourElimination: null, fini: false, champion: null };
}

export const monMatch = T => (T ? (T.tours[T.tour] || []).find(m => (m.a === "moi" || m.b === "moi") && !m.v) || null : null);

// Enregistre le résultat de mon match. `sets` = [mes sets, ses sets].
export function enregistrerMonMatch(T, gagne, sets) {
  const m = monMatch(T); if (!m) return;
  m.v = gagne ? "moi" : m.a === "moi" ? m.b : m.a;
  m.score = m.a === "moi" ? `${sets[0]}–${sets[1]}` : `${sets[1]}–${sets[0]}`;
  if (!gagne) { T.elimine = true; T.tourElimination = T.tour; }
}

// Match simulé entre deux bots.
export function simulerMatch(a, b, setsGagnants, pointsParSet, rng = Math.random) {
  const A = botParId(a), B = botParId(b), ha = [], hb = [];
  const m = nouveauMatch({ pointsParSet, setsGagnants });
  let garde = 0;
  while (!m.termine && garde++ < 5000) {
    const sa = choisirCoup(A, ha, rng), sb = choisirCoup(B, hb, rng);
    const e = jouerCoup(m, sa, sb);
    const res = e.gagnant === null ? "e" : e.gagnant === 0 ? "g" : "p";
    ha.push({ moi: sa, adv: sb, res }); hb.push({ moi: sb, adv: sa, res: inverse(res) });
  }
  return { v: m.vainqueur === 0 ? a : b, score: `${m.sets[0]}–${m.sets[1]}` };
}

// Termine le tour en cours (matchs entre bots simulés) et prépare le suivant.
export function terminerTour(T, pointsParSet, rng = Math.random) {
  const R = T.tours[T.tour];
  R.forEach(m => { if (!m.v && m.a !== "moi" && m.b !== "moi") Object.assign(m, simulerMatch(m.a, m.b, SETS_PAR_TOUR[T.tour], pointsParSet, rng)); });
  if (R.some(m => !m.v)) throw new Error("Ton match n'est pas encore joué");
  if (T.tour === 2) { T.champion = R[0].v; T.fini = true; return T; }
  const suivant = [];
  for (let i = 0; i < R.length; i += 2) suivant.push({ a: R[i].v, b: R[i + 1].v, v: null, score: "" });
  T.tour++; T.tours[T.tour] = suivant;
  return T;
}
