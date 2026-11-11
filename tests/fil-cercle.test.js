import { test } from "node:test";
import assert from "node:assert/strict";
import { evenementsDuFil, scoreDuDuel, ilYA, matchDuDuel, hasardFixe, etapeDuDuel } from "../app/js/fil-cercle.js";
import { nouveauMatch, jouerCoup } from "../app/js/regles.js";
import { nouvellesStats, suivreCoup } from "../app/js/stats-match.js";
import { histoireDuMatch } from "../app/js/une-logique.js";

const T = h => new Date(Date.UTC(2026, 10, 11, h)).toISOString();
const duel = (id, j0, j1, vainqueur, h, extra = {}) => ({ id, j0, j1, vainqueur, quand: T(h), fin: "score", scores_sets: [[7, 5], [7, 4]], sets: [2, 0], ...extra });

test("le fil : les duels, les arrivées et le champion, du plus récent au plus ancien", () => {
  const fil = { duels: [duel("d1", "A", "B", 0, 8), duel("d2", "B", "C", 1, 10)], arrivees: [{ joueur: "C", quand: T(6) }, { joueur: "X", quand: T(7) }] };
  const e = evenementsDuFil(fil, { champion: { id: "B", quand: T(9) }, membres: new Set(["A", "B", "C"]) });
  assert.deepEqual(e.map(x => x.type), ["duel", "champion", "duel", "arrivee"]);
  assert.ok(!e.some(x => x.joueur === "X"), "un ancien membre n'apparaît plus");
});

test("le fil : les séries de victoires dans le cercle, à 3 et 5", () => {
  const duels = [1, 2, 3, 4, 5].map(h => duel(`d${h}`, "A", "B", 0, h));
  duels.push(duel("d6", "C", "A", 0, 6));   // A perd : sa série s'arrête
  duels.push(...[7, 8, 9].map(h => duel(`e${h}`, "A", "C", 0, h)));
  const series = evenementsDuFil({ duels }).filter(x => x.type === "serie");
  assert.deepEqual(series.map(x => [x.joueur, x.n]), [["A", 3], ["A", 5], ["A", 3]]);
  const e = evenementsDuFil({ duels: duels.slice(0, 3) });
  assert.equal(e[0].type, "serie", "la série juste au-dessus du duel qui l'a faite");
});

test("le fil : le score vu du gagnant, le temps écoulé, l'étape", () => {
  assert.equal(scoreDuDuel({ vainqueur: 1, scores_sets: [[5, 7], [4, 7]] }), "7–5, 7–4");
  const maintenant = Date.parse(T(12));
  assert.equal(ilYA(T(12), maintenant), "à l'instant");
  assert.equal(ilYA(T(10), maintenant), "il y a 2 h");
  assert.equal(ilYA(new Date(maintenant - 3 * 86400000).toISOString(), maintenant), "il y a 3 jours");
  assert.equal(etapeDuDuel({ classe: false }), "Duel amical");
  assert.equal(etapeDuDuel({ tournoi: true }), "Tournoi en ligne");
});

test("la Une du fil : refaite à partir des coups, c'est la même que celle du joueur qui l'a publiée", () => {
  // Un duel joué : le joueur 1 (Bob) gagne, en un set de 7. Les coups du serveur : a = joueur 0, b = joueur 1, g = qui gagne.
  const coupsBob = [[0, 1], [2, 0], [2, 0], [0, 0], [1, 2], [2, 0], [0, 1], [2, 0], [1, 2], [0, 1], [2, 0]];   // [Bob, Alice]
  const mBob = nouveauMatch({ pointsParSet: 7, setsGagnants: 1 }), stBob = nouvellesStats();
  for (const [a, b] of coupsBob) { if (mBob.termine) break; suivreCoup(stBob, mBob, jouerCoup(mBob, a, b)); }
  assert.equal(mBob.vainqueur, 0, "(le duel d'essai : Bob gagne)");
  const coups = mBob.coups.map(c => ({ a: c.b, b: c.a, g: c.gagnant === null ? null : 1 - c.gagnant }));
  const d = { id: "d1", j0: "A", j1: "B", vainqueur: 1, points_par_set: 7, sets_gagnants: 1, sets: [0, 1],
    scores_sets: mBob.scoresSets.map(([x, y]) => [y, x]), une: { par: 1, graine: 1234, coups } };
  const { m, stats } = matchDuDuel(d, 1);
  assert.deepEqual(m.scoresSets, mBob.scoresSets);
  assert.deepEqual(stats, stBob);
  const moi = { nom: "Bob", genre: "m" }, adv = { nom: "Alice", genre: "f" };
  const h1 = histoireDuMatch(mBob, stBob, moi, adv, {}, hasardFixe(1234)), h2 = histoireDuMatch(m, stats, moi, adv, {}, hasardFixe(1234));
  assert.equal(h2.titre, h1.titre);
  assert.equal(h2.chapo, h1.chapo);
});

test("le hasard fixe : la même graine, la même suite", () => {
  const a = hasardFixe(42), b = hasardFixe(42), c = hasardFixe(43);
  const x = [a(), a(), a()];
  assert.deepEqual([b(), b(), b()], x);
  assert.notDeepEqual([c(), c(), c()], x);
  assert.ok(x.every(v => v >= 0 && v < 1));
});

test("le fil : le dernier championnat terminé (champion, 1er de la saison, celui qui s'y colle)", async () => {
  const { evenementsChampionnat } = await import("../app/js/fil-cercle.js");
  const ts = [
    { mode: "championnat", phase: "termine", fini_le: T(5), vainqueur: { id: "A" }, premier_saison: { id: "A" } },
    { mode: "championnat", phase: "termine", fini_le: T(9), playoffs: true, enjeu: "Le dernier paie", vainqueur: { id: "B" }, premier_saison: { id: "C" }, dernier: { id: "D" } },
    { mode: "libre", phase: "termine", fini_le: T(11), vainqueur: { id: "E" } },
  ];
  const r = evenementsChampionnat(ts);
  assert.deepEqual(r.champion, { id: "B", quand: T(9) });
  assert.deepEqual(r.autres.map(e => [e.type, e.joueur]), [["saison", "C"], ["gage", "D"]]);
  assert.equal(r.autres[1].playouts, true);
  assert.deepEqual(evenementsChampionnat([ts[0]]).autres, [], "champion et 1er de la saison : un seul événement");
  const e = evenementsDuFil({ duels: [] }, { champion: r.champion, autres: r.autres, membres: new Set(["B", "C", "D"]) });
  assert.deepEqual(e.map(x => x.type).sort(), ["champion", "gage", "saison"]);
});
