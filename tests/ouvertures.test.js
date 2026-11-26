import test from "node:test";
import assert from "node:assert/strict";
import { compterOuvertures, debutsSetDuel, ouverturesDuel, ajouterOuvertures } from "../app/js/ouvertures.js";
import { jeuDepuisDuels, jeuMoins } from "../app/js/stats-passees.js";
import { statsFaceAFace } from "../app/js/duel-logique.js";
import { profilParDefaut, enregistrerMatch, jeuVide } from "../app/js/profil.js";
import { nouveauMatch, jouerCoup } from "../app/js/regles.js";
import { nouvellesStats } from "../app/js/stats-match.js";

// Un duel en sets de 3 points, 2 sets gagnants, vu du joueur 0 : set 1 = égalité puis 3 points pour j0 ; set 2 = j1 gagne
// son 1er coup, puis j0 gagne 3 points.
const coupsDuel = [
  { a: 0, b: 0, g: null }, { a: 0, b: 1, g: 0 }, { a: 0, b: 1, g: 0 }, { a: 0, b: 1, g: 0 },
  { a: 1, b: 0, g: 1 }, { a: 0, b: 1, g: 0 }, { a: 0, b: 1, g: 0 }, { a: 0, b: 1, g: 0 },
];
const duel = { j0: "moi", j1: "ami", vainqueur: 0, fin: "score", points_par_set: 3, sets_gagnants: 2,
  scores_sets: [[3, 0], [3, 1]], maj_le: "2026-11-20T10:00:00Z", coups: coupsDuel };

test("ouvertures : le 1er coup de chaque set, gagné, à égalité ou perdu", () => {
  assert.deepEqual(compterOuvertures([{ gagnant: 0 }, { gagnant: 1 }, { gagnant: null }], [0, 1, 2]), [1, 1, 1]);
  assert.deepEqual(compterOuvertures([{ gagnant: 1 }], [0]), [0, 0, 1]);
  assert.deepEqual(compterOuvertures([], [0]), [0, 0, 0], "aucun coup");
  assert.deepEqual(ajouterOuvertures([1, 2, 3], undefined), [1, 2, 3]);
});

test("ouvertures d'un duel du serveur : on rejoue le score pour trouver le début des sets", () => {
  assert.deepEqual(debutsSetDuel(duel), [0, 4]);
  assert.deepEqual(ouverturesDuel(duel, 0), [0, 1, 1], "set 1 : égalité ; set 2 : perdu");
  assert.deepEqual(ouverturesDuel(duel, 1), [1, 1, 0], "vu de l'autre joueur");
  // Une pénalité qui gagne le 1er set : le 2e set commence au coup suivant.
  const pen = { ...duel, coups: [{ a: 0, b: 1, g: 0 }, { a: 0, b: 1, g: 0 }, { a: 1, b: 0, g: 1 }], penalites: [{ apres: 2, fautif: 1 }] };
  assert.deepEqual(debutsSetDuel(pen), [0, 2]);
  assert.deepEqual(debutsSetDuel({ coups: coupsDuel }), [0], "sans format : seulement le 1er set");
});

test("ouvertures dans Mon jeu (fin de match, duels passés) et dans le face-à-face", () => {
  const h = jeuDepuisDuels([duel], "moi");
  assert.deepEqual(h.ouvertures, [0, 1, 1]);
  // Contre les bots : gardées telles quelles (pas de total d'où les déduire).
  const P = profilParDefaut();
  P.parAdv = { humains: jeuVide(), bots: { ...jeuVide(), ouvertures: [2, 0, 1] } };
  assert.deepEqual(jeuMoins(P, h).ouvertures, [2, 0, 1]);
  // Fin d'un match contre un bot : 1er set ouvert par une victoire, 2e par une défaite.
  const m = nouveauMatch({ pointsParSet: 3, setsGagnants: 2 });
  for (const [a, b] of [[0, 1], [0, 1], [0, 1], [1, 0], [0, 1], [0, 1], [0, 1]]) jouerCoup(m, a, b);
  enregistrerMatch(P, { match: m, stats: nouvellesStats(), devines: 0, lisibles: 0, adversaire: { id: "rocky", elo: 900, nom: "Rocky" }, date: 1 });
  assert.deepEqual(P.parAdv.bots.ouvertures, [3, 0, 2]);
  // Le face-à-face : mes ouvertures (les siennes en sont l'inverse).
  assert.deepEqual(statsFaceAFace([duel], "ami").ouvertures, [1, 1, 0]);
});
