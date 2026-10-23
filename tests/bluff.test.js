// Le Bluff (Chifoumania, version d'essai) : règles, tables de l'abattage et ordinateur.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PAR_SIGNE, MONTRE, PAQUET_VU, CARACTERES, bat, resultat, compte, force, tirages, nouvelleDonne, inconnues, forceEstimee,
  iaOuvre, iaRepond, iaDevoile, iaJoue, strategie, repartitions,
} from "../docs/prototypes/bluff/logique.js";

test("le paquet : 21 cartes, 7 de chaque ; 5 cartes chacun, 11 dans le paquet", () => {
  const d = nouvelleDonne();
  assert.equal(d.cache.length, 5); assert.equal(d.ouvert.length, 5); assert.equal(d.paquet.length, 11);
  assert.deepEqual(compte([...d.cache, ...d.ouvert, ...d.paquet]), [PAR_SIGNE, PAR_SIGNE, PAR_SIGNE]);
  assert.deepEqual(MONTRE, [2, 3, 4]); assert.deepEqual(PAQUET_VU, [3, 5, 6]);
});

test("pierre bat ciseaux, ciseaux battent feuille, feuille bat pierre", () => {
  assert.ok(bat(0, 2) && bat(2, 1) && bat(1, 0));
  assert.equal(resultat(1, 1), 0); assert.equal(resultat(0, 1), -1);
});

test("les tables de l'abattage : valeurs symétriques, stratégies complètes", () => {
  for (const a of repartitions(5)) for (const b of repartitions(5)) {
    assert.ok(Math.abs(force(a, b) + force(b, a)) < 1e-3, `${a} contre ${b}`);
    for (const d of [0]) {
      const s = strategie(a, b, 3, d);
      assert.ok(Math.abs(s.reduce((x, y) => x + y, 0) - 1) < 1e-3);
      s.forEach((q, i) => { if (!a[i]) assert.equal(q, 0); });
    }
  }
  assert.equal(force([5, 0, 0], [0, 5, 0]), -1);   // 5 pierres contre 5 feuilles : perdu d'avance
  assert.equal(force([2, 2, 1], [2, 2, 1]), 0);
});

test("les probabilités des tirages font 1, et la force estimée tient compte de ce qu'on voit", () => {
  const t = tirages([5, 4, 3], 5);
  assert.ok(Math.abs(t.reduce((s, [, p]) => s + p, 0) - 1) < 1e-9);
  // si on voit les 5 cartes adverses, l'estimation est la force exacte
  assert.equal(forceEstimee([3, 1, 1], [0, 4, 1], [0, 0, 0]), force([3, 1, 1], [0, 4, 1]));
  // ce qu'on ne voit pas : 7 de chaque, moins sa main, ce qu'on voit de l'autre, le paquet dévoilé
  assert.deepEqual(inconnues({ main: [2, 2, 1], vuAdverse: [1, 1, 0], paquetVu: [3, 0, 2] }), [1, 4, 4]);
});

test("l'ordinateur mise avec une bonne main, se couche face à une grosse mise avec une mauvaise", () => {
  const c = CARACTERES.prudent, rien = () => 0.99;
  assert.ok(iaOuvre(c, 0.7, 3, rien) >= 2);
  assert.equal(iaOuvre(c, -0.5, 3, rien), 0);
  assert.equal(iaRepond(c, -0.8, 3, 10, true, rien), -1);
  assert.equal(iaRepond(c, 0.1, 1, 6, true, rien), 0);
  assert.ok(iaRepond(c, 0.9, 1, 6, true, rien) > 0);
  assert.equal(iaDevoile([0, 1, 2, 0, 1]).length, 5);
});

test("au duel, l'ordinateur ne joue jamais un signe qu'il n'a plus", () => {
  for (let k = 0; k < 200; k++) {
    const s = iaJoue({ reste: [0, 2, 1], connu: [1, 1, 1], paquetVu: [2, 1, 3], mainDepart: [1, 2, 2], joueesAdverse: [1, 0, 0], coups: 3, ecart: 0 });
    assert.ok(s === 1 || s === 2);
  }
  // avec une seule sorte de signe, il la joue
  assert.equal(iaJoue({ reste: [0, 0, 3], connu: [0, 0, 0], paquetVu: [0, 0, 0], mainDepart: [2, 0, 3], joueesAdverse: [0, 0, 0], coups: 3, ecart: 0 }), 2);
});
