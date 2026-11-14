import { test } from "node:test";
import assert from "node:assert/strict";
import { ROUTINES, routineValide, signesDe, dureeDe } from "../app/js/routines.js";
import { avatarSVG } from "../app/js/avatar.js";

test("les routines d'entrée : 6, chacune avec ses images de la main", () => {
  assert.deepEqual(Object.keys(ROUTINES), ["salut", "shadow", "pianiste", "viens", "claque", "trois"]);
  assert.equal(routineValide("pianiste"), "pianiste"); assert.equal(routineValide("moonwalk"), null);
  assert.deepEqual(signesDe("trois"), ["pierre", "feuille", "ciseaux"]);
  assert.ok(dureeDe("pianiste") > 500);
  for (const r of Object.keys(ROUTINES)) for (const s of signesDe(r)) {
    const svg = avatarSVG({ gant: "jaune", poignet: "rouge", symbole: s, sansFond: true });
    assert.match(svg, /<rect/, `${r} : la main « ${s} » est dessinée`);
    assert.doesNotMatch(svg, /NaN|undefined/, `${r} : ${s}`);
  }
  // les nouvelles mains sont bien différentes de celles d'origine
  const d = s => avatarSVG({ gant: "jaune", symbole: s, sansFond: true });
  assert.notEqual(d("feuille-p0"), d("feuille")); assert.notEqual(d("ciseaux-ferme"), d("ciseaux")); assert.notEqual(d("index-plie"), d("index"));
});
