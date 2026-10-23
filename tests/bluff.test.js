// Le Bluff (Chifoumania, version d'essai) : règles, tables de l'abattage et ordinateur.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PAR_SIGNE, MONTRE, PAQUET_VU, CARACTERES, bat, resultat, compte, force, tirages, nouvelleDonne, inconnues, forceEstimee,
  iaDecide, bornesRelance, blindsDe, JETONS_DEPART, iaDevoile, iaJoue, strategie, repartitions,
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

test("les mises « no limit » : 100 jetons, blinds 1-2 qui montent toutes les 8 donnes, relance bornée par les tapis", () => {
  assert.equal(JETONS_DEPART, 100);
  assert.deepEqual(blindsDe(1), [1, 2]); assert.deepEqual(blindsDe(8), [1, 2]); assert.deepEqual(blindsDe(9), [2, 4]);
  assert.deepEqual(blindsDe(500), [50, 100]);
  assert.equal(bornesRelance({ aPayer: 10, min: 20, max: 10 }), null);            // tapis trop court : suivre seulement
  assert.deepEqual(bornesRelance({ aPayer: 4, min: 8, max: 6 }), { min: 6, max: 6 });   // relance = tapis
  assert.deepEqual(bornesRelance({ aPayer: 0, min: 2, max: 98 }), { min: 2, max: 98 });
});

test("l'ordinateur relance avec une bonne main, se couche face à une grosse mise avec une mauvaise, et respecte les bornes", () => {
  const c = CARACTERES.prudent, rien = () => 0.99;
  const r = iaDecide(c, 0.8, { aPayer: 0, pot: 10, min: 2, max: 90 }, rien);
  assert.equal(r.action, "relance"); assert.ok(r.montant >= 2 && r.montant <= 90);
  assert.equal(iaDecide(c, -0.5, { aPayer: 0, pot: 10, min: 2, max: 90 }, rien).action, "parole");
  assert.equal(iaDecide(c, -0.8, { aPayer: 30, pot: 40, min: 60, max: 90 }, rien).action, "couche");
  assert.equal(iaDecide(c, 0.1, { aPayer: 2, pot: 8, min: 4, max: 90 }, rien).action, "suit");
  const gros = iaDecide(c, 0.9, { aPayer: 2, pot: 8, min: 4, max: 5 }, rien);
  assert.equal(gros.action, "relance"); assert.equal(gros.montant, 5);           // jamais plus que son tapis
  assert.equal(iaDecide(c, 0.9, { aPayer: 2, pot: 8, min: 4, max: 90, relances: 2 }, rien).action, "suit");   // 2 relances au plus
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
