import test from "node:test";
import assert from "node:assert/strict";
import { dossierDetaille, debutsDeSet } from "../app/js/lecture-adversaire.js";

// Ses coups vus de son côté : b = son signe, a = celui d'en face, g = 1 s'il gagne le point (0 = Pierre, 1 = Ciseaux, 2 = Feuille).
const coup = (b, a, s = false) => ({ b, a, g: b === a ? null : (b + 1) % 3 === a ? 1 : 0, ...(s ? { s: true } : {}) });

test("les débuts de set, en rejouant le score", () => {
  // set de 7 : il gagne 7 points d'affilée (Pierre contre Ciseaux), puis le 2e set commence
  const c = [...Array(7)].map(() => coup(0, 1)).map(x => ({ ...x, gagnant: x.g }));
  c.push({ ...coup(2, 0), gagnant: 1 });
  assert.deepEqual(debutsDeSet(c, { pointsParSet: 7, setsGagnants: 2 }), [0, 7]);
});

test("le dossier détaillé : réflexes chiffrés, égalités, débuts, smashs, forme, conseils", () => {
  // Il joue la Pierre en ouverture, rejoue toujours après un point gagné, et smashe avec la Feuille.
  const unMatch = () => {
    const m = [coup(0, 1), coup(0, 1), coup(0, 0), coup(0, 2), coup(2, 0, true), coup(2, 0), coup(1, 1), coup(1, 2), coup(1, 2)];
    m[0] = { ...m[0], p: 11, n: 2 };
    return m;
  };
  const d = dossierDetaille([...Array(16)].map(unMatch));
  assert.equal(d.matchs, 16);
  const rv = d.reflexes.find(r => r.cle === "rejoue_victoire");
  assert.equal(rv.pct, 80); assert.equal(rv.niveau, "rouge");
  assert.ok(d.egalite && d.egalite.vus >= 6);
  assert.equal(d.ouverture.favori, 0); assert.ok(d.ouverture.sets);
  assert.deepEqual(d.ouverture.resultats, [100, 0, 0], "ses ouvertures (Pierre contre Ciseaux) : toutes gagnées");
  assert.equal(d.smash.favori, 2); assert.equal(d.smash.total, 16);
  assert.deepEqual(d.smash.repartition, [0, 0, 100]); assert.equal(d.smash.resultats.reduce((a, b) => a + b, 0), 100);
  assert.ok(d.forme);
  assert.equal(d.sangFroid.length, 3); assert.ok(d.sangFroid.every(([p, n]) => p <= n));
  assert.ok(d.conseils.length >= 1 && d.conseils.length <= 3);
  assert.ok(d.conseils.some(t => /vient de gagner/.test(t)));
  assert.match(dossierDetaille([...Array(16)].map(unMatch), { elle: true }).conseils.join(" "), /\belle\b/);
  assert.equal(dossierDetaille([[coup(0, 1)]]), null, "pas assez de coups");
});

test("mon propre dossier : au « tu », avec mes failles", () => {
  const coup = (b, a) => ({ b, a, g: b === a ? null : (b + 1) % 3 === a ? 1 : 0 });
  const m = () => [coup(0, 1), coup(0, 1), coup(0, 1), coup(0, 2), coup(0, 1), coup(0, 1)];
  const d = dossierDetaille([...Array(5)].map(m), { toi: true });
  assert.ok(d.reflexes.every(r => /\btu\b|\bTu\b/.test(r.texte)), "les réflexes au « tu »");
  assert.ok(d.conseils.length && d.conseils.every(t => typeof t === "string" && /\btu\b|\bTu\b/.test(t)), d.conseils.join(" | "));
});

test("le sang-froid du dossier : le point qui suit 2, 3, 4 points perdus ou plus (26 novembre)", () => {
  // g : 1 = il marque, 0 = il perd, null = égalité. Perdu, perdu, marqué ; perdu ×4, marqué ; perdu, perdu, égalité ; perdu, égalité, perdu, perdu
  const g = [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, null, 0, null, 0, 0, 1];
  const m = g.map(x => ({ a: 0, b: x === 1 ? 0 : x === 0 ? 1 : 0, g: x }));
  const d = dossierDetaille([m]);
  // après 2 : coups 2 (marqué), 5 (perdu), 10 (égalité), 15 (marqué) ; après 3 : coup 6 (perdu) ; après 4 ou plus : coup 7 (marqué)
  assert.deepEqual(d.sangFroid, [[2, 4], [0, 1], [1, 1]]);
});
