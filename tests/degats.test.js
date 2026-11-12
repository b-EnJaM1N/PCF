import { test } from "node:test";
import assert from "node:assert/strict";
import { nouveauxDegats, noterDegats, degatsDe } from "../app/js/degats.js";
import { avatarSVG } from "../app/js/avatar.js";

test("les marques du smash : sur la main du perdant, selon le signe du smash gagnant, jusqu'à la fin du set", () => {
  const e = nouveauxDegats();
  assert.equal(noterDegats(e, { set: 0, gagnant: 0, signes: [1, 2], smashGagnant: false }), null, "sans smash gagnant : rien");
  assert.deepEqual(noterDegats(e, { set: 0, gagnant: 0, signes: [1, 2], smashGagnant: true }), { joueur: 1, marque: "dechire" }, "Ciseaux bat Feuille : gant déchiré");
  assert.deepEqual(noterDegats(e, { set: 0, gagnant: 1, signes: [1, 0], smashGagnant: true }), { joueur: 0, marque: "tordu" }, "Pierre bat Ciseaux : lames tordues");
  assert.deepEqual(noterDegats(e, { set: 0, gagnant: 0, signes: [2, 0], smashGagnant: true }), { joueur: 1, marque: "fissure" }, "Feuille bat Pierre : fissure");
  noterDegats(e, { set: 0, gagnant: 0, signes: [1, 2], smashGagnant: true });
  noterDegats(e, { set: 0, gagnant: 0, signes: [1, 2], smashGagnant: true });
  assert.deepEqual(degatsDe(e, 1, 0), { dechire: 2, fissure: 1 }, "deux smashs : la marque grandit, au plus 2");
  assert.deepEqual(degatsDe(e, 0, 0), { tordu: 1 });
  assert.equal(noterDegats(e, { set: 0, gagnant: null, signes: [1, 1], smashGagnant: true }), null, "égalité : rien");
  noterDegats(e, { set: 1, gagnant: 1, signes: [0, 1], smashGagnant: false });
  assert.equal(degatsDe(e, 1, 1), null, "nouveau set : les mains sont réparées");
  assert.equal(degatsDe(e, 0, 0), null, "(les marques d'un set fini ne comptent plus)");
});

test("les marques se dessinent sur le gant et sur la main nue", () => {
  const base = { gant: "rouge", poignet: "rouge", sansFond: true };
  assert.notEqual(avatarSVG({ ...base, symbole: "dos", degats: { fissure: 1 } }), avatarSVG({ ...base, symbole: "dos" }));
  assert.notEqual(avatarSVG({ ...base, symbole: "ciseaux-dos", degats: { tordu: 1 } }), avatarSVG({ ...base, symbole: "ciseaux-dos" }));
  assert.match(avatarSVG({ ...base, gant: "nu", symbole: "feuille-dos", degats: { dechire: 1 } }), /F1CF9E/, "main nue : un pansement");
  for (const symbole of ["dos", "ciseaux-dos", "feuille-dos"]) assert.match(avatarSVG({ ...base, symbole, degats: { fissure: 1 } }), /ellipse/, `la fissure aussi en ${symbole}`);
});
