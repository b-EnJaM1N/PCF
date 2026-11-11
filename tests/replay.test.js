import { test } from "node:test";
import assert from "node:assert/strict";
import { momentDuCoup, tempsForts, momentDuSet } from "../app/js/replay.js";
import { nouveauMatch, jouerCoup } from "../app/js/regles.js";

// Joue une suite de coups ([moi, lui]) et garde les actions marquantes.
function jouer(coups, format = { pointsParSet: 3, setsGagnants: 2 }, smashs = {}) {
  const m = nouveauMatch(format), moments = [];
  coups.forEach(([a, b], i) => {
    const evt = jouerCoup(m, a, b);
    const mo = momentDuCoup(evt, m.coups, { smashGagne: !!smashs[i], set: m.scoresSets.length - (evt.finSet ? 1 : 0), score: m.points });
    if (mo) moments.push(mo);
  });
  return { m, moments };
}
// (Pierre 0, Ciseaux 1, Feuille 2 : 0 bat 1, 1 bat 2, 2 bat 0)
const G = [0, 1], P = [1, 0], E = [0, 0];

test("le replay : la balle de match sauvée, le set, la balle de match", () => {
  // Set de 3 : je mène 2-0 (balle de set), il revient à 2-2 (balle de set sauvée), je gagne 4-2… puis le 2e set.
  const { moments } = jouer([G, G, P, P, G, G, P, P, G, G]);
  const types = moments.map(x => x.type);
  assert.ok(types.includes("sauvee_set"), types.join(","));
  assert.ok(types.includes("set"));
  assert.equal(types.at(-1), "match");
});

test("le replay : un point gagné après 3 égalités, un smash", () => {
  const { moments } = jouer([E, E, E, G], { pointsParSet: 11, setsGagnants: 1 });
  assert.equal(moments[0].type, "egalites");
  const s = jouer([G], { pointsParSet: 11, setsGagnants: 1 }, { 0: true });
  assert.equal(s.moments[0].type, "smash");
  assert.equal(jouer([G], { pointsParSet: 11, setsGagnants: 1 }).moments.length, 0, "un point ordinaire n'est pas marquant");
});

test("le replay : les 3 temps forts, dans l'ordre du match ; le moment de chaque set", () => {
  const ms = [
    { type: "serie", priorite: 5, coup: 3, set: 0 }, { type: "smash", priorite: 7, coup: 8, set: 0 }, { type: "set", priorite: 6, coup: 12, set: 0 },
    { type: "egalites", priorite: 4, coup: 15, set: 1 }, { type: "match", priorite: 10, coup: 30, set: 1 },
  ];
  assert.deepEqual(tempsForts(ms).map(x => x.coup), [8, 12, 30]);
  assert.equal(momentDuSet(ms, 0).type, "smash");
  assert.equal(momentDuSet(ms, 1).type, "match");
  assert.equal(momentDuSet(ms, 2), null);
});

// ---------------------------------------------------------------- la palette (11 novembre)
import { paletteDuPoint, texteHabitude } from "../app/js/replay.js";
const coup = ([a, b]) => ({ a, b, gagnant: a === b ? null : (a + 1) % 3 === b ? 0 : 1 });
const palette = suite => paletteDuPoint(suite.map(coup));

test("la palette : tactiquement pertinent (le gagnant a lu l'habitude de l'autre)", () => {
  // Il joue toujours Pierre (0) ; je finis par jouer Feuille (2), qui le bat.
  const pa = palette([[1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [2, 0]]);
  assert.equal(pa.verdict, "pertinent");
  assert.equal(pa.joueur, 0);
  assert.equal(pa.habitude.joueur, 1);
  assert.equal(pa.coups.length, 5);
  assert.match(texteHabitude(pa.habitude, "Galet"), /^Galet joue souvent/);
  assert.match(texteHabitude(pa.habitude, "Toi"), /^Tu joues souvent/);
});

test("la palette : mauvais choix (le perdant suit son habitude) et techniquement propre (le gagnant casse la sienne)", () => {
  // Je joue toujours Pierre et je perds contre Feuille : il me lit… il gagne avec Feuille → pertinent pour lui.
  assert.equal(palette([[0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 2]]).verdict, "pertinent");
  // Je joue toujours Pierre, puis je casse l'habitude avec Ciseaux et je gagne contre Feuille.
  const propre = palette([[0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [1, 2]]);
  assert.equal(propre.verdict, "propre");
  assert.equal(propre.habitude.joueur, 0);
  // Il tourne en boucle (Pierre, Feuille, Ciseaux…) et continue ; je gagne avec un autre signe que celui conseillé : mauvais choix.
  const v = palette([[2, 0], [1, 2], [0, 1], [2, 0], [1, 2], [0, 1], [2, 0]]).verdict;
  assert.ok(["pertinent", "mauvais"].includes(v), v);
});

test("la palette : rien à lire en début de match, rien pour une égalité", () => {
  assert.equal(palette([[0, 1], [2, 0]]).verdict, "pas_la");
  assert.equal(palette([[0, 1], [0, 0]]), null);
});
