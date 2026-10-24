import test from "node:test";
import assert from "node:assert/strict";
import { encoderCoups, decoderCoups, ajouterMain, noterMain, mainDossier, htmlMains, MAX_MAINS } from "../app/js/historique-mains.js";

const coups = [{ a: 0, b: 1 }, { a: 2, b: 2 }, { a: 1, b: 0 }, { a: 2, b: 0 }];

test("un match se garde en un chiffre par coup, avec les sets, et se relit à l'identique", () => {
  const t = encoderCoups(coups, [0, 2]);
  assert.equal(t, "18|36");
  const sets = decoderCoups(t);
  assert.equal(sets.length, 2);
  assert.deepEqual(sets.flat().map(c => [c.a, c.b, c.gagnant]), [[0, 1, 0], [2, 2, null], [1, 0, 1], [2, 0, 0]]);
});

test("10 matchs au plus par adversaire, le plus récent d'abord ; 80 adversaires au plus", () => {
  let l = [];
  for (let i = 0; i < 12; i++) l = ajouterMain(l, { date: i, gagne: i % 2, detail: `${i}`, coups });
  assert.equal(l.length, MAX_MAINS);
  assert.equal(l[0].d, 11);
  let t = {};
  for (let i = 0; i < 85; i++) t = noterMain(t, `b${i}`, { date: i, gagne: true, coups });
  assert.equal(Object.keys(t).length, 80);
  assert.ok(t.b84 && !t.b0);
});

test("un match du dossier (vu de son côté) : lui en premier, et le nombre de coups", () => {
  const e = mainDossier([{ a: 1, b: 0, g: 1 }, { a: 0, b: 2, g: 1 }, { a: 2, b: null }]);
  assert.equal(e.c, "16"); assert.equal(e.g, true); assert.equal(e.s, "2 coups");
});

test("l'affichage : un bandeau par match, ou le message s'il n'y en a pas", () => {
  assert.match(htmlMains([], { vide: "Rien <encore>" }), /Rien &lt;encore&gt;/);
  const h = htmlMains([{ d: 0, g: true, s: "11–7", c: "18|36" }], { noms: ["Toi", "Zoé"] });
  assert.match(h, /✅ Victoire · 11–7/);
  assert.equal((h.match(/<td/g) || []).length, 8);
  assert.equal((h.match(/newset/g) || []).length, 2);
});
