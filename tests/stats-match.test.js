import { test } from "node:test";
import assert from "node:assert/strict";

test("le panneau de fin de match : points, signes, égalités, changements après une égalité, même signe après un point, smashs, séries", async () => {
  const { statsDuMatch } = await import("../app/js/stats-match.js");
  const c = [{ a: 0, b: 0, gagnant: null }, { a: 2, b: 0, gagnant: 0 }, { a: 2, b: 1, gagnant: 1, smash: [false, true] },
    { a: 1, b: 1, gagnant: null }, { a: 0, b: 1, gagnant: 0, smash: [true, false] }, { a: 0, b: 2, gagnant: 1 }];
  const s = statsDuMatch(c);
  assert.deepEqual(s.points, [2, 2]);
  assert.deepEqual(s.signes, [[3, 1, 2], [2, 3, 1]]);
  assert.equal(s.egalites, 2);
  assert.deepEqual(s.changeApresEgalite, [[2, 2], [0, 2]]);   // après chaque égalité, je change de signe ; lui, jamais
  assert.deepEqual(s.memeApresGain, [[2, 2], [1, 1]]);
  assert.deepEqual(s.smashs, [[1, 1], [1, 1]]);
  assert.deepEqual(s.serie, [1, 1]);
  assert.deepEqual(s.reussite, [[2, 4], [2, 4]], "sans les égalités");
  assert.deepEqual(s.apresEgalite, [2, 0], "les deux points gagnés juste après une égalité : les miens");
  assert.deepEqual(s.imprevisibilite, [null, null], "trop peu de coups");
  const long = statsDuMatch(Array.from({ length: 30 }, (_, i) => ({ a: 0, b: i % 3, gagnant: [null, 0, 1][i % 3] })));
  assert.ok(long.imprevisibilite[0] < 30 && long.imprevisibilite[1] < 60, String(long.imprevisibilite));   // toujours Pierre : très lisible
});
