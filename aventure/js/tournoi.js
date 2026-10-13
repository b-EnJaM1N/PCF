// Le PCF Open : 8 ou 16 joueurs en élimination directe, têtes de série selon le niveau.
// À 8 : toi + les 7 bots les plus proches de ton niveau. À 16 : toi + les 15 bots.
// Tous les tours en 2 sets gagnants, la finale en 3 sets gagnants.
import { BOTS, botParId, choisirCoup, inverse, contexteBot } from "./bots.js";
import { nouveauMatch, jouerCoup } from "./regles.js";

// Les tours, nommés d'après le nombre de tours restants (le dernier est la finale).
const ROUNDS = [
  { cle: "huitiemes", nom: "Huitièmes de finale", singulier: "Huitième de finale", mon: "mon huitième de finale" },
  { cle: "quarts", nom: "Quarts de finale", singulier: "Quart de finale", mon: "mon quart de finale" },
  { cle: "demis", nom: "Demi-finales", singulier: "Demi-finale", mon: "ma demi-finale" },
  { cle: "finale", nom: "Finale", singulier: "Finale", mon: "la finale" },
];
export const TAILLES_OPEN = [8, 16];
export const nbTours = T => T.tours.length;
// Le tour t du tournoi T : { cle, nom, singulier, mon, sets, finale }.
export function tourDe(T, t = T.tour) {
  const n = nbTours(T), r = ROUNDS[ROUNDS.length - (n - t)] || ROUNDS[0];
  return { ...r, sets: t === n - 1 ? 3 : 2, finale: t === n - 1 };
}

// Place des têtes de série dans le tableau (1 contre 8, 4 contre 5… ; 1 contre 16, 8 contre 9…).
const PLACEMENT = {
  8: [1, 8, 4, 5, 3, 6, 2, 7],
  16: [1, 16, 8, 9, 5, 12, 4, 13, 3, 14, 6, 11, 7, 10, 2, 15],
};

export function nouveauTournoi(eloJoueur, taille = 8) {
  if (!TAILLES_OPEN.includes(taille)) taille = 8;
  const proches = [...BOTS].sort((a, b) => Math.abs(a.elo - eloJoueur) - Math.abs(b.elo - eloJoueur)).slice(0, taille - 1);
  const elo = id => (id === "moi" ? eloJoueur : botParId(id).elo);
  const tableau = ["moi", ...proches.map(b => b.id)].sort((a, b) => elo(b) - elo(a));
  const premier = [], place = PLACEMENT[taille];
  for (let i = 0; i < taille; i += 2) premier.push({ a: tableau[place[i] - 1], b: tableau[place[i + 1] - 1], v: null, score: "" });
  const tours = [premier]; for (let k = taille / 2; k > 1; k /= 2) tours.push([]);
  return { taille, tour: 0, tours, elimine: false, tourElimination: null, fini: false, champion: null };
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
    const ctxB = contexteBot(m), ctxA = { ...ctxB, points: [m.points[0], m.points[1]] };
    const sa = choisirCoup(A, ha, rng, ctxA), sb = choisirCoup(B, hb, rng, ctxB);
    const e = jouerCoup(m, sa, sb);
    const res = e.gagnant === null ? "e" : e.gagnant === 0 ? "g" : "p";
    ha.push({ moi: sa, adv: sb, res }); hb.push({ moi: sb, adv: sa, res: inverse(res) });
  }
  return { v: m.vainqueur === 0 ? a : b, score: `${m.sets[0]}–${m.sets[1]}` };
}

// Termine le tour en cours (matchs entre bots simulés) et prépare le suivant.
export function terminerTour(T, pointsParSet, rng = Math.random) {
  const R = T.tours[T.tour];
  R.forEach(m => { if (!m.v && m.a !== "moi" && m.b !== "moi") Object.assign(m, simulerMatch(m.a, m.b, tourDe(T).sets, pointsParSet, rng)); });
  if (R.some(m => !m.v)) throw new Error("Ton match n'est pas encore joué");
  if (tourDe(T).finale) { T.champion = R[0].v; T.fini = true; return T; }
  const suivant = [];
  for (let i = 0; i < R.length; i += 2) suivant.push({ a: R[i].v, b: R[i + 1].v, v: null, score: "" });
  T.tour++; T.tours[T.tour] = suivant;
  return T;
}
