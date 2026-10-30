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
  assert.equal(vainqueurSet(15, 14, 11), 0, "à 14 partout, point décisif : 15–14 gagne");
  assert.equal(vainqueurSet(14, 15, 11), 1);
});

test("un set de 7 (option) se gagne à 7 points avec 2 points d'écart", () => {
  assert.equal(vainqueurSet(7, 5, 7), 0);
  assert.equal(vainqueurSet(7, 6, 7), null);
  assert.equal(vainqueurSet(9, 7, 7), 0);
  assert.equal(vainqueurSet(9, 8, 7), null);
  assert.equal(vainqueurSet(10, 9, 7), 0, "à 9 partout, point décisif : 10–9 gagne");
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

test("le temps pour jouer un coup est le même dans l'appli et sur le serveur (dernière étape SQL qui le fixe)", async () => {
  const { readdirSync, readFileSync } = await import("node:fs");
  const { DUREE_COUP_MS } = await import("../app/js/regles.js");
  const dossier = new URL("../supabase/", import.meta.url), num = f => +f.match(/etape-(\d+)/)[1];
  const etapes = readdirSync(dossier).filter(f => /^etape-\d+[a-z]?-.*\.sql$/.test(f)).sort((a, b) => num(a) - num(b));
  let secondes = null;
  for (const f of etapes) {
    const m = readFileSync(new URL(f, dossier), "utf8").match(/function public\._duree_coup\(\)[^$]*\$\$ select interval '(\d+) seconds' \$\$/);
    if (m) secondes = +m[1];
  }
  assert.equal(secondes * 1000, DUREE_COUP_MS);
});

test("la réserve de temps : avertissement d'abord, puis un point de pénalité à chaque fois (le point va à l'autre)", async () => {
  const { RESERVE_MS, depassement, penaliser } = await import("../app/js/regles.js");
  const m = nouveauMatch({ pointsParSet: 3, setsGagnants: 2 });
  assert.deepEqual(m.reserve, [RESERVE_MS, RESERVE_MS]);
  assert.equal(RESERVE_MS, 20000);
  assert.equal(depassement(m, 0), "avertissement");
  assert.equal(m.reserve[0], 0);
  assert.equal(depassement(m, 0), "penalite");
  assert.equal(depassement(m, 0), "penalite", "à chaque fois");
  assert.equal(depassement(m, 1), "avertissement", "chacun a son avertissement");
  pointA(m);
  const e = penaliser(m, 0);
  assert.equal(e.gagnant, 1); assert.equal(e.penalite, 0); assert.equal(e.a, null);
  assert.deepEqual(m.points, [1, 1]);
  assert.equal(m.coups.length, 1, "une pénalité n'est pas un coup");
  assert.deepEqual(m.penalites, [{ apres: 1, fautif: 0 }]);
  penaliser(m, 0); const f = penaliser(m, 0);
  assert.ok(f.finSet, "une pénalité peut finir le set");
  assert.deepEqual(m.scoresSets, [[1, 3]]);
});

test("le smash : un par set et par joueur, pour le spectacle (le point ne change pas)", async () => {
  const { peutSmasher, noterSmash } = await import("../app/js/regles.js");
  const m = nouveauMatch({ pointsParSet: 3, setsGagnants: 2 });
  assert.ok(peutSmasher(m, 0) && peutSmasher(m, 1));
  noterSmash(m, 0);
  assert.ok(!peutSmasher(m, 0), "déjà smashé dans ce set");
  assert.ok(peutSmasher(m, 1), "l'adversaire a le sien");
  repeter(3, () => pointA(m));
  assert.deepEqual(m.scoresSets, [[3, 0]]);
  assert.ok(peutSmasher(m, 0), "nouveau set : un nouveau smash");
});
