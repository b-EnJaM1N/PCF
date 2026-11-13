import { test } from "node:test";
import assert from "node:assert/strict";
import { rejouerDuel, calculerRecords } from "../app/js/records-cercle.js";

// Un duel d'un set de 7 : g = qui gagne chaque point (0, 1 ou null pour une égalité).
const duel = (id, j0, j1, g, extra = {}) => {
  const p = [0, 0]; for (const x of g) if (x === 0 || x === 1) p[x]++;
  return { id, j0, j1, vainqueur: p[0] > p[1] ? 0 : 1, fin: "score", points_par_set: 7, sets_gagnants: 1, scores_sets: [p], penalites: [], quand: `2026-11-${10 + id.length}T10:00:00Z`, g, smash: g.map(() => [false, false]), ...extra };
};

test("rejouer un duel : la série de points, la remontée, les balles de match sauvées", () => {
  // Bob mène 6–1 ; Alice sauve 5 balles de match, marque 6 points d'affilée (7–6), Bob égalise à 7–7, Alice gagne 9–7.
  const g = [1, 1, 1, 1, 1, 0, 1, null, 0, 0, 0, 0, 0, 0, 1, 0, 0];
  const r = rejouerDuel(duel("x", "alice", "bob", g));
  assert.equal(r.serie.n, 6, "6 points d'affilée");
  assert.equal(r.serie.joueur, 0);
  assert.equal(r.remontee.joueur, 0, "Alice a remonté");
  assert.equal(r.remontee.n, 5, "5 points de retard rattrapés (1–6)");
  assert.equal(r.ballesSauvees[0], 5, "5 balles de match sauvées par Alice (de 1–6 à 6–6)");
  assert.equal(r.coups, g.length);
});

test("les records du cercle : de match (allés au bout) et du cercle (tous les duels)", () => {
  const donnees = {
    duels: [
      duel("a", "alice", "bob", [0, 0, 0, 0, 0, 0, 0]),                       // 7–0 : la raclée, 7 points d'affilée
      duel("bb", "alice", "chloe", [0, 1, 0, 1, 0, 1, 0, 0, 0, 0]),
      duel("ccc", "bob", "chloe", [0, 0, 1], { fin: "abandon", vainqueur: 0, scores_sets: [[2, 1]], smash: [[true, false], [false, false], [false, false]] }),
      duel("dddd", "alice", "bob", [1, 1, 1, 1, 1, 1, 1]),
    ],
    signes: [10, 20, 10],
  };
  const r = calculerRecords(donnees), par = cle => [...r.match, ...r.cercle].find(x => x.cle === cle);
  assert.equal(par("raclee").joueur, "alice"); assert.equal(par("raclee").valeur, 7); assert.equal(par("raclee").detail, "7–0");
  assert.equal(par("serie_points").valeur, 7);
  assert.equal(par("victoires").joueur, "alice"); assert.equal(par("victoires").valeur, 2, "Alice : 2 victoires d'affilée");
  assert.equal(par("defaites").joueur, "chloe"); assert.equal(par("defaites").valeur, 2, "Chloé : 2 défaites d'affilée (l'abandon compte pour les séries)");
  assert.equal(par("smashs").joueur, "bob", "le smash de Bob compte, même dans un match abandonné");
  assert.equal(par("rivalite").valeur, 2); assert.equal(par("rivalite").detail, "1–1");
  assert.equal(par("pilier").valeur, 3);
  assert.deepEqual(r.signes, [25, 50, 25]);
  assert.equal(par("long").valeur, 10, "le match abandonné ne compte pas pour le plus long match");
  assert.ok(calculerRecords({ duels: [] }).match.every(x => x.vide), "pas encore de duel : pas de record");
});
