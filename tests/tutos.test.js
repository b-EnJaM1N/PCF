import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { TUTOS, tutoAMontrer, etapesVisibles } from "../app/js/tutos.js";

test("tutos : chacun une fois, seulement quand son écran est affiché ; pas de tuto du smash (il reste un secret)", () => {
  const ecran = new Set(["#viewCarriere", "#carOnglets"]);
  const visible = sel => ecran.has(sel) || sel.startsWith("#car");
  assert.equal(tutoAMontrer([], visible).id, "carriere");
  assert.equal(tutoAMontrer(["carriere"], visible), null, "déjà vu : plus montré");
  assert.equal(tutoAMontrer([], () => false), null, "aucun écran : rien");
  assert.ok(!JSON.stringify(TUTOS).toLowerCase().includes("smash"));
  assert.equal(new Set(TUTOS.map(t => t.id)).size, TUTOS.length);
  TUTOS.forEach(t => assert.ok(t.etapes.length >= 2 && t.etapes.length <= 4, t.id));
});

test("tutos : une étape dont le bouton n'est pas à l'écran est sautée", () => {
  const t = TUTOS.find(x => x.id === "championnat");
  assert.deepEqual(etapesVisibles(t, sel => sel !== "#tnEnjeuZone").map(e => e.cible), ["#tnType", "#tnDuree"]);
});

test("tutos : chaque élément visé existe dans la page", () => {
  const html = readFileSync(new URL("../app/index.html", import.meta.url), "utf8");
  for (const t of TUTOS) for (const sel of [...t.quand, ...t.etapes.map(e => e.cible)]) {
    const id = /#([\w-]+)/.exec(sel)[1];
    assert.ok(html.includes(`id="${id}"`), `${t.id} : ${sel}`);
  }
});
