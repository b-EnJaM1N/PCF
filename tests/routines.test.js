import { test } from "node:test";
import assert from "node:assert/strict";
import { ROUTINES, routineValide, signesDe, dureeDe } from "../app/js/routines.js";
import { avatarSVG } from "../app/js/avatar.js";

test("les routines d'entrée : 10, chacune avec ses images de la main", () => {
  assert.deepEqual(Object.keys(ROUTINES), ["salut", "shadow", "pianiste", "viens", "claque", "trois", "chut", "craquer", "vague", "montre"]);
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

test("la bague reste sur son doigt pendant les routines, et le suit (14 novembre)", () => {
  // (l'anneau : le rectangle de 11,5 × 4,2 ; avec la rotation du doigt s'il y en a une)
  const bague = s => { const svg = avatarSVG({ gant: "jaune", symbole: s, sansFond: true, bague: "rubis" }), i = svg.lastIndexOf('height="4.2"');
    return svg.slice(svg.lastIndexOf("<g", i), i); };
  const y = s => +(/<rect x="[\d.]+" y="([\d.]+)" width="11.5"/.exec(bague(s)) || [])[1];
  assert.equal(y("feuille-p0"), y("feuille"), "un autre doigt s'abaisse : la bague ne bouge pas");
  assert.ok(y("feuille-p2") > y("feuille"), "son doigt s'abaisse : la bague descend avec lui");
  assert.notEqual(bague("ciseaux-ferme"), bague("pierre"), "ciseaux fermés : la bague sur un doigt des ciseaux, pas à la place du poing");
  assert.notEqual(bague("index-plie"), bague("pierre"));
});
