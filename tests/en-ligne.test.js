import test from "node:test";
import assert from "node:assert/strict";
import { compterEnLigne } from "../app/js/en-ligne.js";

test("la bulle « en ligne » : un téléphone compte une fois", () => {
  assert.equal(compterEnLigne({}), 0);
  assert.equal(compterEnLigne(null), 0);
  assert.equal(compterEnLigne({ a: [{ depuis: 1 }], b: [{ depuis: 2 }, { depuis: 3 }], c: [] }), 2, "b : deux onglets du même téléphone ; c : parti");
});
