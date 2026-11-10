import { test } from "node:test";
import assert from "node:assert/strict";
import { amisEnTete, compterEchanges, AMIS_EN_TETE } from "../app/js/social-logique.js";

test("Mes amis : en tête, les 3 avec qui je joue le plus ; les autres et mes demandes, à déplier", () => {
  const moi = "m";
  const duels = [{ j0: "m", j1: "a" }, { j0: "b", j1: "m" }, { j0: "b", j1: "m" }, { j0: "m", j1: "c" }, { j0: "c", j1: "m" }, { j0: "c", j1: "m" }, { j0: "x", j1: "y" }];
  const n = compterEchanges(duels, moi);
  assert.deepEqual([n.get("a"), n.get("b"), n.get("c"), n.get("x")], [1, 2, 3, undefined]);
  const amis = [
    { id: "a", statut: "amis" }, { id: "d", statut: "amis", presence: "ligne" }, { id: "b", statut: "amis" }, { id: "c", statut: "amis" },
    { id: "e", statut: "envoyee" }, { id: "f", statut: "amis", recue: true },
  ];
  const { devant, autres } = amisEnTete(amis, n);
  assert.equal(AMIS_EN_TETE, 3);
  assert.deepEqual(devant.map(a => a.id), ["c", "b", "a"], "les plus joués d'abord");
  assert.deepEqual(autres.map(a => a.id), ["d", "e"], "puis les autres amis, puis mes demandes envoyées (pas les demandes reçues)");
  // sans aucun duel : ceux qui sont en ligne d'abord
  assert.equal(amisEnTete(amis).devant[0].id, "d");
});
