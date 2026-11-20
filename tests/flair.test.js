import { test } from "node:test";
import assert from "node:assert/strict";
import { flairEtEndurance } from "../app/js/flair.js";

// a : mon signe, b : le sien ; 0 = Pierre, 1 = Ciseaux, 2 = Feuille ; x bat (x + 1) % 3.
const coup = (a, b) => ({ a, b, gagnant: a === b ? null : (a + 1) % 3 === b ? 0 : 1 });

test("le Flair : seulement une habitude déjà confirmée dans le match", () => {
  // Il copie toujours mon dernier signe. Les 5 premiers coups l'installent (4 fois confirmée), puis je le punis.
  const c = [coup(0, 1), coup(1, 0), coup(2, 1), coup(0, 2), coup(1, 0), coup(1, 1)];
  // coup 6 : il copie mon 1 (Ciseaux) → je joue ce qui bat Ciseaux (Pierre, 0)
  c.push(coup(0, 1));
  const r = flairEtEndurance(c);
  assert.ok(r.tentees >= 1 && r.reussies >= 1, JSON.stringify(r));
  assert.deepEqual(flairEtEndurance(c.slice(0, 3)), { tentees: 0, reussies: 0, chaines: 0, gagnees: 0 }, "pas encore d'habitude confirmée");
});

test("l'Endurance : le point qui suit 2 égalités ou plus", () => {
  const c = [coup(0, 0), coup(1, 1), coup(0, 1), coup(2, 2), coup(2, 0), coup(1, 1), coup(1, 1), coup(1, 1), coup(1, 0)];
  const r = flairEtEndurance(c);
  assert.equal(r.chaines, 2, "deux chaînes d'au moins 2 égalités (une seule égalité ne compte pas)");
  assert.equal(r.gagnees, 1);
});
