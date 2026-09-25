import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PIERRE, CISEAUX, FEUILLE, bat, contre, gagnantCoup, vainqueurSet, nouveauMatch, jouerCoup, balle, egaliteFinDeSet, setDecisif,
} from "../app/js/regles.js";

// Helpers : faire gagner un point à un côté, ou jouer une égalité.
const pointA = m => jouerCoup(m, PIERRE, CISEAUX);
const pointB = m => jouerCoup(m, CISEAUX, PIERRE);
const egalite = m => jouerCoup(m, FEUILLE, FEUILLE);
const repeter = (n, f) => { let e; for (let i = 0; i < n; i++) e = f(); return e; };

test("Pierre bat Ciseaux, Ciseaux bat Feuille, Feuille bat Pierre", () => {
  assert.ok(bat(PIERRE, CISEAUX)); assert.ok(bat(CISEAUX, FEUILLE)); assert.ok(bat(FEUILLE, PIERRE));
  assert.ok(!bat(CISEAUX, PIERRE)); assert.ok(!bat(FEUILLE, CISEAUX)); assert.ok(!bat(PIERRE, FEUILLE));
  for (const s of [PIERRE, CISEAUX, FEUILLE]) { assert.ok(bat(contre(s), s)); assert.ok(!bat(s, s)); }
});

test("le gagnant d'un coup, et l'égalité quand les signes sont identiques", () => {
  assert.equal(gagnantCoup(PIERRE, CISEAUX), 0);
  assert.equal(gagnantCoup(PIERRE, FEUILLE), 1);
  for (const s of [PIERRE, CISEAUX, FEUILLE]) assert.equal(gagnantCoup(s, s), null);
});

test("les égalités ne comptent pas : le score ne bouge pas", () => {
  const m = nouveauMatch();
  const e = egalite(m);
  assert.equal(e.egalite, true);
  assert.deepEqual(m.points, [0, 0]);
  assert.equal(m.coups.length, 1, "le coup reste dans l'historique");
  pointA(m); repeter(5, () => egalite(m));
  assert.deepEqual(m.points, [1, 0]);
});

test("un set de 11 se gagne à 11 points avec 2 points d'écart", () => {
  assert.equal(vainqueurSet(11, 0, 11), 0);
  assert.equal(vainqueurSet(11, 9, 11), 0);
  assert.equal(vainqueurSet(11, 10, 11), null);
  assert.equal(vainqueurSet(10, 8, 11), null);
  assert.equal(vainqueurSet(12, 10, 11), 0);
  assert.equal(vainqueurSet(13, 15, 11), 1);
  assert.equal(vainqueurSet(14, 13, 11), null);
});

test("un set de 7 (option) se gagne à 7 points avec 2 points d'écart", () => {
  assert.equal(vainqueurSet(7, 5, 7), 0);
  assert.equal(vainqueurSet(7, 6, 7), null);
  assert.equal(vainqueurSet(9, 7, 7), 0);
});

test("à 10–10, il faut deux points d'écart pour gagner le set", () => {
  const m = nouveauMatch();
  repeter(10, () => pointA(m)); repeter(10, () => pointB(m));
  assert.deepEqual(m.points, [10, 10]);
  assert.ok(egaliteFinDeSet(m));
  let e = pointA(m);
  assert.equal(e.finSet, false); assert.deepEqual(m.points, [11, 10]);
  e = pointB(m);
  assert.deepEqual(m.points, [11, 11]);
  pointA(m); e = pointA(m);
  assert.equal(e.finSet, true);
  assert.deepEqual(e.scoreSet, [13, 11]);
  assert.deepEqual(m.points, [0, 0]);
  assert.deepEqual(m.sets, [1, 0]);
  assert.deepEqual(m.scoresSets, [[13, 11]]);
});

test("match en 2 sets gagnants : fin du match au 2e set gagné", () => {
  const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 });
  repeter(11, () => pointA(m));
  assert.equal(m.termine, false);
  repeter(11, () => pointB(m));
  assert.deepEqual(m.sets, [1, 1]);
  assert.ok(setDecisif(m));
  const e = repeter(11, () => pointB(m));
  assert.equal(e.finMatch, true);
  assert.equal(m.termine, true);
  assert.equal(m.vainqueur, 1);
  assert.deepEqual(m.scoresSets, [[11, 0], [0, 11], [0, 11]]);
  assert.throws(() => pointA(m), /terminé/);
});

test("match en 3 sets gagnants : il faut 3 sets", () => {
  const m = nouveauMatch({ pointsParSet: 7, setsGagnants: 3 });
  repeter(7, () => pointA(m)); repeter(7, () => pointA(m));
  assert.equal(m.termine, false);
  repeter(7, () => pointB(m)); repeter(7, () => pointB(m));
  assert.ok(setDecisif(m));
  const e = repeter(7, () => pointA(m));
  assert.ok(e.finMatch); assert.equal(m.vainqueur, 0); assert.deepEqual(m.sets, [3, 2]);
});

test("les balles de set et de match sont détectées", () => {
  const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 });
  repeter(9, () => pointA(m));
  assert.equal(balle(m), null);
  pointA(m);
  assert.deepEqual(balle(m), { joueur: 0, type: "set" });
  repeter(10, () => pointB(m));
  assert.equal(balle(m), null, "10–10 : pas de balle");
  pointB(m);
  assert.deepEqual(balle(m), { joueur: 1, type: "set" });
  pointB(m); // 10–12, set pour B
  repeter(10, () => pointB(m));
  assert.deepEqual(balle(m), { joueur: 1, type: "match" });
  const e = pointA(m);
  assert.deepEqual(e.balleAvant, { joueur: 1, type: "match" }, "balle sauvée : on sait qu'il y avait une balle");
});

test("les débuts de set sont repérés dans l'historique", () => {
  const m = nouveauMatch({ pointsParSet: 7, setsGagnants: 2 });
  egalite(m); repeter(7, () => pointA(m));
  assert.deepEqual(m.debutsSet, [0, 8]);
});

test("les signes joués au hasard (temps écoulé) sont marqués", () => {
  const m = nouveauMatch();
  jouerCoup(m, PIERRE, FEUILLE, [true, false]);
  assert.deepEqual(m.coups[0].auto, [true, false]);
});

test("formats et signes invalides refusés", () => {
  assert.throws(() => nouveauMatch({ pointsParSet: 5 }));
  assert.throws(() => nouveauMatch({ setsGagnants: 4 }));
  assert.throws(() => jouerCoup(nouveauMatch(), 3, 0));
});
