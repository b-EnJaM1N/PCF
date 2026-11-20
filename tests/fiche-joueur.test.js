import { test } from "node:test";
import assert from "node:assert/strict";
import { lignesStats, htmlFiche } from "../app/js/fiche-joueur.js";

const f = {
  stats: { joues: 4, v: 3, d: 1, sets_g: 6, sets_p: 2, officiels: 3, officiels_v: 2, serie: 2, meilleure_serie: 2, smashs: 2, smashs_reussis: 1 },
  cache: false,
  face_a_face: [{ adversaire: { pseudo: "Bob", numero: 12 }, joues: 2, v: 2, d: 0, dernier: "2026-11-10T10:00:00Z" }],
  historique: [{ adversaire: { pseudo: "Bob", numero: 12 }, gagne: true, scores: [[7, 3]], quand: "2026-11-10T10:00:00Z", officiel: false, tournoi: false, fin: "abandon" }],
};

test("la fiche d'un joueur : les stats en lignes", () => {
  const l = Object.fromEntries(lignesStats(f.stats).map(([k, v, x]) => [k, x ? `${v} (${x})` : v]));
  assert.equal(l["Victoires"], "75 % (3 – 1)");
  assert.equal(l["Duels officiels"], "67 % (2 – 1)");
  assert.equal(l["Smashs réussis"], "50 % (1/2)");
  assert.deepEqual(lignesStats({ joues: 0 }), []);
});

test("la fiche d'un joueur : les 3 onglets, et l'historique caché", () => {
  const h = htmlFiche(f, "Alice", 1);
  assert.match(h, /📊 Stats/); assert.match(h, /Bob<small>#12/); assert.match(h, /7–3 \(abandon\)/); assert.match(h, /amical/);
  const c = htmlFiche({ ...f, cache: true, face_a_face: null, historique: null }, "Alice", 2);
  assert.match(c, /a choisi de cacher ses adversaires/);
  assert.match(c, /75 %/, "les stats chiffrées restent");
  assert.match(htmlFiche({ stats: { joues: 0 } }, "<b>", 3), /&lt;b&gt; n'a pas encore joué/);
});
