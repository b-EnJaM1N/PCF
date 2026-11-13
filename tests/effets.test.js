import { test } from "node:test";
import assert from "node:assert/strict";
import { nouveauFeu, noterFeu, feuDe, niveauFeu, egalitesDeSuite, effetDouble, feuSVG, trembleDe, EGALITES_ETINCELLE } from "../app/js/effets.js";

test("la main en feu : 3, 5 puis 7 points de suite", () => {
  assert.deepEqual([0, 2, 3, 4, 5, 6, 7, 12].map(niveauFeu), [0, 0, 1, 1, 2, 2, 3, 3]);
  const e = nouveauFeu();
  noterFeu(e, 0); noterFeu(e, 0);
  assert.deepEqual(noterFeu(e, 0), [{ joueur: 0, de: 0, a: 1 }], "3e point : la main fume");
  noterFeu(e, 0);
  assert.deepEqual(noterFeu(e, 0), [{ joueur: 0, de: 1, a: 2 }], "5e point : la flamme");
  noterFeu(e, 0);
  assert.deepEqual(noterFeu(e, 0), [{ joueur: 0, de: 2, a: 3 }], "7e point : en feu");
  assert.equal(feuDe(e, 0), 3); assert.equal(feuDe(e, 1), 0);
});

test("une égalité baisse le feu d'un niveau ; un point perdu l'éteint", () => {
  const e = nouveauFeu();
  for (let i = 0; i < 5; i++) noterFeu(e, 1);
  assert.deepEqual(noterFeu(e, null), [{ joueur: 1, de: 2, a: 1 }], "de la flamme à la fumée");
  noterFeu(e, 1);
  assert.deepEqual(noterFeu(e, 1), [{ joueur: 1, de: 1, a: 2 }], "2 points suffisent pour retrouver la flamme");
  assert.deepEqual(noterFeu(e, null), [{ joueur: 1, de: 2, a: 1 }]);
  assert.deepEqual(noterFeu(e, null), [{ joueur: 1, de: 1, a: 0 }], "de la fumée à rien");
  assert.deepEqual(noterFeu(e, null), [], "sans feu, une égalité ne change rien");
  for (let i = 0; i < 4; i++) noterFeu(e, 0);
  assert.equal(feuDe(e, 0), 1);
  assert.deepEqual(noterFeu(e, 1), [{ joueur: 0, de: 1, a: 0 }], "point perdu : éteint");
  assert.equal(feuDe(null, 0), 0);
});

test("les égalités d'affilée, et le double smash avec le même signe", () => {
  const c = g => ({ gagnant: g });
  assert.equal(egalitesDeSuite([c(0), c(null), c(null)]), 2);
  assert.equal(egalitesDeSuite([c(null), c(1)]), 0);
  assert.equal(egalitesDeSuite([]), 0);
  assert.equal(effetDouble([true, true], 0, 0), "seisme");
  assert.equal(effetDouble([true, true], 2, 2), "vent");
  assert.equal(effetDouble([true, true], 1, 1), "etincelles");
  assert.equal(effetDouble([true, false], 1, 1), null, "un seul smash : rien");
  assert.equal(effetDouble([true, true], 1, 2), null, "signes différents : rien");
});

test("le dessin du feu : rien sans feu, fumée, flamme, en feu, bouffée", () => {
  assert.equal(feuSVG(0), "");
  assert.match(feuSVG(1), /fumee/); assert.doesNotMatch(feuSVG(1), /<animate/);
  assert.match(feuSVG(2), /<animate/); assert.equal((feuSVG(3).match(/<animate/g) || []).length, 4, "en feu : 4 couches de flammes");
  assert.doesNotMatch(feuSVG(2, { anime: false }), /<animate/, "moins d'animations : les flammes immobiles");
  assert.match(feuSVG(2, { id: "h1" }), /url\(#h1-flou\)/, "un filtre par main");
  assert.ok(feuSVG(3).length > feuSVG(2).length, "en feu : plus grand que la flamme");
  assert.match(feuSVG("fin"), /bouffee/);
  assert.doesNotMatch(feuSVG(3), /NaN|undefined/);
});

test("les égalités en chaîne : le tremblement commence à la 2e égalité, l'étincelle à la 4e", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 6].map(trembleDe), [0, 0, 1, 2, 3, 3]);
  assert.equal(EGALITES_ETINCELLE, 4);
});
