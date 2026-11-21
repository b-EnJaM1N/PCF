import { test } from "node:test";
import assert from "node:assert/strict";
import { momentDuCoup, tempsForts, tempsFortsMatch, momentDuSet } from "../app/js/replay.js";
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
  // (19 novembre) une action de celui qui a gagné le set d'abord ; celle du perdant seulement s'il n'en a aucune
  const set0 = ms.filter(x => x.set === 0);
  for (const g of [0, 1]) {
    const mo = momentDuSet(ms, 0, g);
    if (set0.some(x => x.gagnant === g)) assert.equal(mo.gagnant, g); else assert.ok(mo);
  }
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
  // Je joue toujours Pierre, puis je casse l'habitude avec Ciseaux et je gagne contre Feuille : depuis le 18 novembre, c'est le
  // piège (3 fois le même signe ou plus, puis le changement qui marque).
  const piege = palette([[0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [1, 2]]);
  assert.equal(piege.verdict, "piege");
  assert.deepEqual(piege.piege, { joueur: 0, n: 6, repete: 0, signe: 1 });
  // Il tourne en boucle (Pierre, Feuille, Ciseaux…) et continue ; je gagne avec un autre signe que celui conseillé : mauvais choix.
  const v = palette([[2, 0], [1, 2], [0, 1], [2, 0], [1, 2], [0, 1], [2, 0]]).verdict;
  assert.ok(["pertinent", "mauvais"].includes(v), v);
});

test("la palette : rien à lire en début de match, rien pour une égalité", () => {
  assert.equal(palette([[0, 1], [2, 0]]).verdict, "pas_la");
  // (18 novembre) « Le jeu n'était pas là » : on parle du perdant du point, qui a fait le mauvais choix (ici, l'adversaire)
  assert.equal(palette([[0, 1], [2, 0]]).joueur, 1);
  assert.equal(palette([[0, 1], [0, 0]]), null);
});

test("la palette : le piège (3 fois le même signe ou plus, puis le changement qui marque), le smash", async () => {
  const { paletteDuPoint, piegeDuPoint } = await import("../app/js/replay.js");
  const { gagnantCoup } = await import("../app/js/regles.js");
  const cs = l => l.map(([a, b]) => ({ a, b, gagnant: gagnantCoup(a, b) }));
  // 3 Pierres (deux égalités et un point perdu), puis Ciseaux qui battent Feuille
  assert.deepEqual(piegeDuPoint(cs([[0, 0], [0, 2], [0, 0], [1, 2]])), { joueur: 0, n: 3, repete: 0, signe: 1 });
  assert.equal(piegeDuPoint(cs([[0, 2], [0, 2], [1, 2]])), null);            // seulement 2 fois
  assert.equal(piegeDuPoint(cs([[0, 0], [0, 2], [0, 0], [0, 1]])), null);    // pas de changement
  assert.equal(piegeDuPoint(cs([[0, 0], [0, 2], [0, 0], [1, 0]])), null);    // le changement ne marque pas
  assert.equal(paletteDuPoint(cs([[0, 1], [2, 0]]), { smashGagne: true }).verdict, "smash");
});

test("les temps forts du match : surtout le vainqueur, une action du perdant au plus (21 novembre)", () => {
  const m = (coup, gagnant, priorite) => ({ coup, gagnant, priorite });
  const ms = [m(1, 1, 9), m(2, 1, 8), m(3, 1, 7), m(4, 0, 5), m(5, 0, 4), m(6, 0, 10)];
  // le vainqueur (0) a 3 actions : 2 de lui au moins, une seule du perdant, la plus forte
  assert.deepEqual(tempsFortsMatch(ms, 0).map(x => x.coup), [1, 4, 6]);
  // le vainqueur n'a qu'une action : on complète avec celles du perdant
  assert.deepEqual(tempsFortsMatch([m(1, 1, 9), m(2, 1, 8), m(6, 0, 10)], 0).map(x => x.coup), [1, 2, 6]);
  assert.deepEqual(tempsFortsMatch(ms, null).map(x => x.coup), tempsForts(ms).map(x => x.coup));
});

test("le score du point : bascule, relance, fin serrée, avance, début (21 novembre)", async () => {
  const { situationsDuSet, marquerSet } = await import("../app/js/replay.js");
  // une suite de gagnants (0 ou 1) → les points avec leur score
  const suite = gs => { const sc = [0, 0]; return gs.map((g, i) => { sc[g]++; return { gagnant: g, score: [...sc], coup: i, set: 0 }; }); };
  // 0-3, puis 0 revient et gagne 11-8 : la relance au plus fort du retard (0-3), la bascule à 9-8 (après 8-8)
  const pts = suite([1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0]);
  const r = situationsDuSet(pts, 11, 0);
  assert.equal(r.relance, 3, "le premier point marqué à 0-3");
  assert.deepEqual(pts[r.bascule].score, [9, 8]);
  assert.equal(r.situations[0], "debut");
  assert.equal(r.situations[1], "debut");
  assert.equal(r.situations[14], "mene_perd", "1 marque à 8-6 : mené de 2, il perd le set");
  // 7-7 → 8-7 (le gagnant du set) : fin serrée
  const serre = suite([0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0]);
  const s2 = situationsDuSet(serre, 11, 0);
  assert.equal(s2.situations[16], "bascule", "8-8 → 9-8");
  assert.equal(s2.situations[12], "serre", "6-6 → 7-6");
  // une large avance : 6-2 → 7-2, il gagne
  const av = suite([0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0]);
  assert.equal(situationsDuSet(av, 11, 0).situations[8], "avance");
  assert.equal(situationsDuSet(av, 11, 0).bascule, null, "il a mené de bout en bout");
  // marquerSet : la bascule devient un moment, et la bascule du set décisif est celle du match
  const moments = [{ ...pts[18], type: "set", priorite: 6 }];
  marquerSet(moments, pts.map(p => ({ ...p, type: "point", priorite: 0 })), 11, 0, true);
  assert.ok(moments.some(m => m.type === "bascule_match" && m.score[0] === 9 && m.score[1] === 8));
  assert.ok(moments.some(m => m.type === "relance"));
});

test("une balle sauvée n'est gardée que si elle a servi : le set (balle de set) ou le match (balle de match) gagné (21 novembre)", async () => {
  const { marquerSet } = await import("../app/js/replay.js");
  const pts = [0, 0, 1].map((g, i) => ({ gagnant: g, score: [i < 2 ? i + 1 : 2, i === 2 ? 1 : 0], coup: i, set: 1, type: "point", priorite: 0 }));
  const ms = [
    { set: 1, coup: 0, gagnant: 1, type: "sauvee_set", priorite: 8 },     // sauvée par 1, qui perd le set : retirée
    { set: 1, coup: 1, gagnant: 0, type: "sauvee_set", priorite: 8 },     // sauvée par 0, qui gagne le set : gardée
    { set: 0, coup: 9, gagnant: 1, type: "sauvee_match", priorite: 9 },   // set d'avant, sauvée par 1, qui perd le match : retirée à la fin
  ];
  marquerSet(ms, pts, 3, 0, false, null);
  assert.deepEqual(ms.map(m => m.coup), [1, 9]);
  marquerSet(ms, pts, 3, 0, true, 0);
  assert.deepEqual(ms.filter(m => m.type.startsWith("sauvee")).map(m => m.coup), [1]);
});

test("une réplique qui parle des signes n'est dite que si l'historique la confirme (21 novembre)", async () => {
  const { signesOK } = await import("../app/js/replay.js");
  const avant = [{ a: 0, b: 1 }, { a: 2, b: 1 }, { a: 0, b: 1 }, { a: 2, b: 1 }];
  assert.equal(signesOK("meme", avant, { a: 1, b: 1 }, 1), true, "il a rejoué Ciseaux");
  assert.equal(signesOK("meme", avant, { a: 1, b: 2 }, 1), false, "il a changé : pas « encore le même signe »");
  assert.equal(signesOK("change", avant, { a: 1, b: 2 }, 1), true);
  assert.equal(signesOK("trois", avant, { a: 1, b: 1 }, 1), true);
  assert.equal(signesOK("trois", avant, { a: 2, b: 1 }, 0), false);
  assert.equal(signesOK("alterne", avant, { a: 1, b: 1 }, 0), true, "Pierre, Feuille, Pierre, Feuille");
  assert.equal(signesOK("alterne", avant, { a: 1, b: 1 }, 1), false);
  assert.equal(signesOK(undefined, [], { a: 0, b: 0 }, 0), true);
});
