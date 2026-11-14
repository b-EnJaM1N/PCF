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

test("au 2e smash du set, l'usure grandit : lames ébréchées (ou bleu et pansement), lambeau de gant qui pend", () => {
  const base = { gant: "rouge", poignet: "rouge", sansFond: true };
  const lames = n => avatarSVG({ ...base, symbole: "ciseaux-dos", degats: { tordu: n } });
  assert.notEqual(lames(2), lames(1));
  assert.match(lames(2), /rgba\(25,12,8,\.85\)/, "les entailles");
  assert.match(avatarSVG({ ...base, gant: "nu", symbole: "ciseaux-dos", degats: { tordu: 2 } }), /rgba\(110,60,150/, "main nue : un bleu");
  const feuille = n => avatarSVG({ ...base, symbole: "feuille-dos", degats: { dechire: n } });
  assert.ok(feuille(2).length > feuille(1).length + 200, "le lambeau qui pend");
  assert.doesNotMatch(lames(2) + feuille(2), /NaN|undefined/);
});

test("les coutures : une par pièce du gant, à la même distance du bord (14 novembre)", async () => {
  const { cousu } = await import("../app/js/avatar.js");
  const piece = '<rect x="29" y="40" width="42" height="36" rx="11" fill="#FFD34D" stroke="rgba(0,0,0,.22)" stroke-width="1.5"/>';
  const doigt = '<rect x="31" y="19" width="10.5" height="31" rx="5.2" fill="#FFD34D" stroke="rgba(0,0,0,.22)" stroke-width="1.5" transform="rotate(-12 36 50)"/>';
  const ongle = '<rect x="33.6" y="20" width="5.3" height="5.5" rx="2.4" fill="none" stroke="#000" stroke-width="1.1"/>';
  const s = cousu(piece + doigt + ongle, "#B8860B");
  assert.equal((s.match(/stroke-dasharray/g) || []).length, 2, "une couture par pièce, pas sur l'ongle");
  assert.match(s, /<rect x="31.2" y="42.2" width="37.6" height="31.6" rx="8.8" fill="none" stroke="#B8860B"/, "la paume : 2,2 en retrait");
  assert.match(s, /stroke-dasharray="2.2 2" transform="rotate\(-12 36 50\)"/, "le doigt penché : sa couture penche avec lui");
  assert.ok(s.indexOf(doigt) > s.indexOf("y=\"42.2\""), "chaque couture juste après sa pièce : la pièce suivante la recouvre");
});
