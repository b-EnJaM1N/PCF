import { test } from "node:test";
import assert from "node:assert/strict";
import { recordsFaceAFace } from "../app/js/records-face-a-face.js";
import { htmlRecordsFaceAFace } from "../app/js/ecran-cercles.js";

// Un duel en sets de 11 : chaque set écrit en points gagnés par j0 (« 0 ») ou j1 (« 1 »), « = » pour une égalité.
const MOI = "moi", LUI = "lui";
function duel(sets, { j0 = MOI, j1 = LUI, quand = "2026-11-01", fin = "score", smash = {} } = {}) {
  const coups = [], scores = [];
  for (const s of sets) {
    const p = [0, 0];
    for (const x of s) { const g = x === "=" ? null : +x; coups.push({ a: 0, b: 0, g, ...(smash[coups.length] ? { smash: smash[coups.length] } : {}) }); if (g !== null) p[g]++; }
    scores.push(p);
  }
  const sets0 = scores.filter(([a, b]) => a > b).length;
  return { j0, j1, vainqueur: sets0 > scores.length - sets0 ? 0 : 1, fin, scores_sets: scores, coups, points_par_set: 11, sets_gagnants: 2, penalites: [], maj_le: quand };
}
const r = (rec, cle) => rec.lignes.find(l => l.cle === cle);
const p = (rec, cle) => rec.partages.find(l => l.cle === cle);

test("les records d'un face-à-face, vus de mon côté (que je sois j0 ou j1)", () => {
  const net = "0".repeat(11);                                     // 11-0
  const lui8 = "1".repeat(8) + "0".repeat(11);                     // il mène 0-8, je gagne 11-8 : remontée de 8
  const serre = "01".repeat(14) + "0";                             // 15-14 au point décisif
  const d1 = duel([net, net], { quand: "2026-11-01" });
  const d2 = duel(["1".repeat(11), lui8, serre], { quand: "2026-11-02", smash: { 0: [false, true], 12: [true, false] } });
  // le 3e : je suis j1 (il est j0) ; il gagne 11-9, 11-9 avec des égalités
  const d3 = duel(["==" + "0".repeat(11) + "1".repeat(9), "=".repeat(5) + "0".repeat(11) + "1".repeat(9)], { j0: LUI, j1: MOI, quand: "2026-11-03" });
  const rec = recordsFaceAFace([d3, d1, d2], MOI);
  assert.deepEqual(r(rec, "serie").textes, ["22", "19"]);   // (une série continue d'un set à l'autre)
  assert.equal(r(rec, "remontee").valeurs[0], 8);
  assert.equal(r(rec, "seche").textes[0], "11–0, 11–0");
  assert.equal(r(rec, "seche").mieux, 0);
  assert.equal(r(rec, "bulle").valeurs[0], 2);
  assert.equal(r(rec, "bulle").valeurs[1], 1);                    // (son 11-0 du 2e match)
  assert.equal(r(rec, "decisifs").valeurs[0], 1);
  assert.equal(r(rec, "renversements").valeurs[0], 1);           // (2e match : 1er set perdu, gagné)
  assert.equal(r(rec, "victoires").valeurs[0], 2);
  assert.equal(r(rec, "victoires").valeurs[1], 1);
  assert.equal(r(rec, "smashs").valeurs[1], 1);                   // son smash du 1er coup du 2e match a marqué
  assert.equal(p(rec, "egalites").texte.split(" ")[0], "7");   // (2 + 5 dans le même match)
  assert.equal(p(rec, "egalites_serie").texte.split(" ")[0], "5");
  assert.match(p(rec, "serre").texte, /^0–11, 11–8, 15–14 · gagné par toi/);
  assert.match(p(rec, "premier").texte, /gagné par toi/);
  assert.match(htmlRecordsFaceAFace(rec, "Emi"), /Nos records/);
  assert.match(p(rec, "egalites").texte, /^7/);
  assert.match(htmlRecordsFaceAFace({ lignes: [], partages: [{ cle: "x", titre: "t", texte: "gagné par {adv}" }] }, "Emi"), /gagné par Emi/);
});

test("les records d'un face-à-face : les abandons comptent pour les séries de victoires, pas pour les records de match", () => {
  const ab = duel(["0".repeat(3)], { fin: "abandon" });
  ab.vainqueur = 0;
  const rec = recordsFaceAFace([ab], MOI);
  assert.equal(r(rec, "victoires").valeurs[0], 1);
  assert.equal(r(rec, "points").valeurs[0], null);
  assert.equal(recordsFaceAFace([], MOI), null);
});
