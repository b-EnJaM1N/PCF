import test from "node:test";
import assert from "node:assert/strict";
import { nouveauMatch, jouerCoup, balle, jeuDecisif, texteFormat, PIERRE, CISEAUX } from "../app/js/regles.js";
import { annoncerCoup, annonceDebutSet, nouvelEtatAnnonces } from "../app/js/annonces.js";
import { nouvellesStats, suivreCoup } from "../app/js/stats-match.js";
import { rngFixe } from "./outils.js";

const gagneJaune = (m, n) => { let e; for (let i = 0; i < n; i++) e = jouerCoup(m, PIERRE, CISEAUX); return e; };
const gagneRouge = (m, n) => { let e; for (let i = 0; i < n; i++) e = jouerCoup(m, CISEAUX, PIERRE); return e; };

test("match en 1 set : terminé dès le premier set", () => {
  const m = nouveauMatch({ pointsParSet: 7, setsGagnants: 1 });
  gagneJaune(m, 6);
  assert.deepEqual(balle(m), { joueur: 0, type: "match" }, "balle de match dès le premier set");
  const e = gagneJaune(m, 1);
  assert.ok(e.finMatch && e.finSet && e.finJeu);
  assert.deepEqual(m.scoresSets, [[7, 0]]); assert.equal(m.vainqueur, 0);
});

test("sets en 3 jeux : il faut 3 jeux pour prendre le set", () => {
  const m = nouveauMatch({ pointsParSet: 7, setsGagnants: 2, jeuxParSet: 3 });
  gagneJaune(m, 6);
  assert.deepEqual(balle(m), { joueur: 0, type: "jeu" });
  let e = gagneJaune(m, 1);
  assert.ok(e.finJeu && !e.finSet); assert.deepEqual(e.scoreJeu, [7, 0]);
  assert.deepEqual(m.jeux, [1, 0]); assert.deepEqual(m.points, [0, 0]); assert.deepEqual(m.sets, [0, 0]);
  gagneRouge(m, 7); gagneJaune(m, 7); gagneRouge(m, 7);
  assert.deepEqual(m.jeux, [2, 2]); assert.ok(jeuDecisif(m));
  gagneJaune(m, 6);
  assert.deepEqual(balle(m), { joueur: 0, type: "set" }, "au jeu décisif, la balle de jeu est une balle de set");
  e = gagneJaune(m, 1);
  assert.ok(e.finSet && !e.finMatch); assert.deepEqual(e.scoreSet, [3, 2]);
  assert.deepEqual(m.scoresSets, [[3, 2]]); assert.deepEqual(m.jeux, [0, 0]); assert.equal(m.scoresJeux.length, 5);
  assert.deepEqual(m.debutsSet, [0, 35]); assert.equal(m.debutsJeu.length, 6);
  // Deuxième set 3–0 : match gagné, avec balle de match au troisième jeu.
  gagneJaune(m, 14); gagneJaune(m, 6);
  assert.deepEqual(balle(m), { joueur: 0, type: "match" });
  e = gagneJaune(m, 1);
  assert.ok(e.finMatch); assert.deepEqual(m.scoresSets, [[3, 2], [3, 0]]);
});

test("avec 1 jeu par set, rien ne change par rapport au format classique", () => {
  const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 });
  assert.equal(m.format.jeuxParSet, 1);
  gagneJaune(m, 10);
  assert.deepEqual(balle(m), { joueur: 0, type: "set" });
  gagneJaune(m, 1);
  assert.deepEqual(m.scoresSets, [[11, 0]]); assert.deepEqual(m.jeux, [0, 0]);
  assert.throws(() => nouveauMatch({ jeuxParSet: 2 }));
  assert.throws(() => nouveauMatch({ setsGagnants: 4 }));
});

test("l'arbitre annonce les jeux, la balle de jeu et le jeu décisif", () => {
  const m = nouveauMatch({ pointsParSet: 7, setsGagnants: 2, jeuxParSet: 3 }), etat = nouvelEtatAnnonces(), rng = rngFixe(0.99);
  const ids = [];
  const jouer = (a, b) => { const e = jouerCoup(m, a, b); ids.push(...annoncerCoup(m, e, etat, {}, rng).lignes.map(l => l.id)); };
  for (let i = 0; i < 6; i++) jouer(PIERRE, CISEAUX);
  assert.ok(ids.includes("arbitre_balle_de_jeu_jaune_01"));
  jouer(PIERRE, CISEAUX);
  assert.deepEqual(ids.slice(-2), ["arbitre_jeu_jaune_01", "arbitre_jeux_un_a_zero_jaune_01"]);
  for (let i = 0; i < 7; i++) jouer(CISEAUX, PIERRE);
  assert.ok(ids.includes("arbitre_jeux_un_partout_01"));
  for (let i = 0; i < 7; i++) jouer(PIERRE, CISEAUX);
  for (let i = 0; i < 7; i++) jouer(CISEAUX, PIERRE);
  assert.deepEqual(ids.slice(-3), ["arbitre_jeu_rouge_01", "arbitre_jeux_deux_partout_01", "arbitre_jeu_decisif_01"]);
  for (let i = 0; i < 7; i++) jouer(PIERRE, CISEAUX);
  assert.ok(ids.includes("arbitre_premier_set_jaune_01") && ids.includes("arbitre_score_trois_a_deux_01"));
});

test("match en 1 set : « Set unique », puis le score du set à la fin", () => {
  const m = nouveauMatch({ pointsParSet: 7, setsGagnants: 1 }), etat = nouvelEtatAnnonces();
  assert.equal(annonceDebutSet(m).id, "arbitre_set_unique_01");
  let a;
  for (let i = 0; i < 7; i++) a = annoncerCoup(m, jouerCoup(m, PIERRE, CISEAUX), etat, {}, rngFixe(0.99));
  assert.deepEqual(a.lignes.slice(0, 2).map(l => l.id), ["arbitre_jeu_set_et_match_jaune_01", "arbitre_score_sept_a_zero_01"]);
});

test("statistiques : les balles de jeu ne comptent pas comme balles de set", () => {
  const m = nouveauMatch({ pointsParSet: 7, setsGagnants: 2, jeuxParSet: 3 }), st = nouvellesStats();
  for (let i = 0; i < 7; i++) suivreCoup(st, m, jouerCoup(m, PIERRE, CISEAUX));
  assert.equal(st.ballesObtenues, 0);
});

test("le format en toutes lettres", () => {
  assert.equal(texteFormat({ pointsParSet: 11, setsGagnants: 2 }), "Sets de 11 points · 2 sets gagnants");
  assert.equal(texteFormat({ pointsParSet: 7, setsGagnants: 1 }), "Sets de 7 points · match en 1 set");
  assert.equal(texteFormat({ pointsParSet: 11, setsGagnants: 3, jeuxParSet: 3 }), "Jeux de 11 points · sets en 3 jeux · 3 sets gagnants");
});
