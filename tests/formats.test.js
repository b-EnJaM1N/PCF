import test from "node:test";
import assert from "node:assert/strict";
import { nouveauMatch, jouerCoup, balle, pointDecisif, egaliteFinDeSet, texteFormat, PIERRE, CISEAUX } from "../app/js/regles.js";
import { annoncerCoup, annonceDebutSet, nouvelEtatAnnonces } from "../app/js/annonces.js";
import { formatCourt } from "../app/js/duel-logique.js";
import { rngFixe } from "./outils.js";

const gagneJaune = (m, n) => { let e; for (let i = 0; i < n; i++) e = jouerCoup(m, PIERRE, CISEAUX); return e; };
const gagneRouge = (m, n) => { let e; for (let i = 0; i < n; i++) e = jouerCoup(m, CISEAUX, PIERRE); return e; };

test("sets de 1 point : le premier point gagne le set", () => {
  const m = nouveauMatch({ pointsParSet: 1, setsGagnants: 2 });
  assert.ok(pointDecisif(m)); assert.equal(balle(m), null);
  jouerCoup(m, PIERRE, PIERRE);   // une égalité ne compte pas
  assert.deepEqual(m.points, [0, 0]);
  const e = gagneRouge(m, 1);
  assert.ok(e.finSet); assert.deepEqual(m.scoresSets, [[0, 1]]);
  gagneJaune(m, 2);
  assert.ok(m.termine); assert.equal(m.vainqueur, 0); assert.deepEqual(m.scoresSets, [[0, 1], [1, 0], [1, 0]]);
});

test("sets de 3 points : 3–2 suffit, pas besoin de 2 points d'écart", () => {
  const m = nouveauMatch({ pointsParSet: 3, setsGagnants: 2 });
  gagneRouge(m, 2);
  assert.deepEqual(balle(m), { joueur: 1, type: "set" });
  gagneJaune(m, 2);
  assert.ok(pointDecisif(m)); assert.ok(!egaliteFinDeSet(m));
  const e = gagneJaune(m, 1);
  assert.ok(e.finSet); assert.deepEqual(e.scoreSet, [3, 2]);
});

test("les sets de 11 et 7 gardent les 2 points d'écart", () => {
  const m = nouveauMatch({ pointsParSet: 7, setsGagnants: 2 });
  gagneRouge(m, 6); gagneJaune(m, 7);
  assert.deepEqual(m.points, [7, 6]); assert.equal(m.scoresSets.length, 0);
  assert.ok(!pointDecisif(m));
  assert.throws(() => nouveauMatch({ pointsParSet: 5 }));
});

test("match en 1 set : terminé dès le premier set", () => {
  const m = nouveauMatch({ pointsParSet: 7, setsGagnants: 1 });
  gagneJaune(m, 6);
  assert.deepEqual(balle(m), { joueur: 0, type: "match" }, "balle de match dès le premier set");
  const e = gagneJaune(m, 1);
  assert.ok(e.finMatch); assert.deepEqual(m.scoresSets, [[7, 0]]); assert.equal(m.vainqueur, 0);
  assert.throws(() => nouveauMatch({ setsGagnants: 4 }));
});

test("l'arbitre : « Set unique », « Point décisif », puis le score du set", () => {
  let m = nouveauMatch({ pointsParSet: 7, setsGagnants: 1 }), etat = nouvelEtatAnnonces(), a;
  assert.equal(annonceDebutSet(m).id, "arbitre_set_unique_01");
  for (let i = 0; i < 7; i++) a = annoncerCoup(m, jouerCoup(m, PIERRE, CISEAUX), etat, {}, rngFixe(0));
  assert.deepEqual(a.lignes.slice(0, 2).map(l => l.id), ["arbitre_jeu_set_et_match_jaune_01", "arbitre_score_sept_a_zero_01"]);

  m = nouveauMatch({ pointsParSet: 3, setsGagnants: 2 }); etat = nouvelEtatAnnonces();
  const ids = [];
  for (const [x, y] of [[PIERRE, CISEAUX], [PIERRE, CISEAUX], [CISEAUX, PIERRE], [CISEAUX, PIERRE], [PIERRE, CISEAUX]]) {
    ids.push(...annoncerCoup(m, jouerCoup(m, x, y), etat, {}, rngFixe(0)).lignes.map(l => l.id));
  }
  assert.ok(ids.includes("arbitre_balle_de_set_jaune_01"));
  assert.ok(ids.includes("arbitre_point_decisif_01"));
  assert.ok(!ids.some(id => id.startsWith("arbitre_partout")), "pas de « deux partout, deux points d'écart »");
  assert.ok(ids.includes("arbitre_score_trois_a_deux_01"));
});

test("formats courts : toujours amicaux en duel", () => {
  assert.ok(formatCourt(11, 1)); assert.ok(formatCourt(3, 2)); assert.ok(formatCourt(1, 3));
  assert.ok(!formatCourt(11, 2)); assert.ok(!formatCourt(7, 3));
});

test("le format en toutes lettres", () => {
  assert.equal(texteFormat({ pointsParSet: 11, setsGagnants: 2 }), "Sets de 11 points · 2 sets gagnants");
  assert.equal(texteFormat({ pointsParSet: 1, setsGagnants: 1 }), "Sets de 1 point · match en 1 set");
  assert.equal(texteFormat({ pointsParSet: 3, setsGagnants: 3 }), "Sets de 3 points · 3 sets gagnants");
});
