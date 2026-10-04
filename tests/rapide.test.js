import { test } from "node:test";
import assert from "node:assert/strict";
import { botProche, chrono, texteFile, FORMATS_RAPIDES } from "../app/js/rapide-logique.js";
import { BOTS } from "../app/js/bots.js";

test("le bot proposé est celui dont le niveau est le plus proche", () => {
  assert.equal(botProche(1050, BOTS).id, "boomerang");
  assert.equal(botProche(1200, BOTS).id, "chaos");
  const haut = Math.max(...BOTS.map(b => b.elo));
  assert.equal(botProche(3000, BOTS).elo, haut);
});

test("chrono et file d'attente", () => {
  assert.equal(chrono(7), "0:07"); assert.equal(chrono(92), "1:32");
  assert.match(texteFile(0), /Personne/); assert.match(texteFile(1), /^1 joueur attend/); assert.match(texteFile(3), /^3 joueurs/);
});

test("formats : la classique en sets de 11, l'éclair en un set de 7", () => {
  assert.deepEqual([FORMATS_RAPIDES.officiel.pointsParSet, FORMATS_RAPIDES.officiel.setsGagnants], [11, 2]);
  assert.deepEqual([FORMATS_RAPIDES.eclair.pointsParSet, FORMATS_RAPIDES.eclair.setsGagnants], [7, 1]);
});
