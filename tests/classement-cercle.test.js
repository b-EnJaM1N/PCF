import { test } from "node:test";
import assert from "node:assert/strict";
import { classementCercle, gainCercle, podiumCercle, DEPART_CERCLE } from "../app/js/classement-cercle.js";

const m = (id, classement = 1200) => ({ id, pseudo: id, classement });
const d = (j0, j1, vainqueur, quand) => ({ j0, j1, vainqueur, quand });

test("le niveau du cercle : tout le monde part de 1000, seuls les duels entre membres comptent", () => {
  const c = classementCercle([m("a"), m("b"), m("c")], []);
  assert.ok(c.every(x => x.points === DEPART_CERCLE && x.rang === null && x.joues === 0));
  assert.equal(Math.round(gainCercle(1000, 1000)), 16, "à égalité : 16 points");
  assert.ok(gainCercle(900, 1100) > gainCercle(1100, 900), "battre plus fort que soi rapporte plus");
});

test("battre le premier rapporte plus que battre le dernier ; on ne grimpe pas en battant toujours le même faible", () => {
  // F (le faible) perd 10 fois contre T ; puis S bat deux fois le premier (le fort, X, qui a battu tout le monde)
  const membres = [m("X", 1000), m("T", 1300), m("F", 1300), m("S", 1100), m("Y", 1050)];
  const duels = [];
  for (let i = 0; i < 10; i++) duels.push(d("T", "F", "T", `2026-11-01T10:${String(i).padStart(2, "0")}`));
  for (const [k, o] of ["T", "F", "Y"].entries()) duels.push(d("X", o, "X", `2026-11-02T10:0${k}`), d("X", o, "X", `2026-11-02T11:0${k}`));
  duels.push(d("S", "X", "S", "2026-11-03T10:00"), d("S", "X", "S", "2026-11-03T11:00"));
  const c = classementCercle(membres, duels);
  const de = id => c.find(x => x.id === id);
  assert.equal(de("T").v, 10); assert.equal(de("S").v, 2);
  assert.ok(de("S").points - DEPART_CERCLE > (de("T").points - DEPART_CERCLE) / 10 * 2, "2 victoires contre le premier valent bien plus que 2 victoires contre le dernier");
  assert.equal(de("F").rang, c.length, "le faible est dernier");
  assert.equal(de("S").pct, 100);
  assert.deepEqual(c.map(x => x.rang), [1, 2, 3, 4, 5]);
});

test("le classement est le même quel que soit l'ordre reçu (rangé par date), et ignore les anciens membres", () => {
  const membres = [m("a"), m("b"), m("c", 1500)];
  const duels = [d("a", "b", "a", "2026-11-02"), d("b", "a", "b", "2026-11-01"), d("a", "parti", "a", "2026-11-03")];
  const c1 = classementCercle(membres, duels), c2 = classementCercle(membres, [...duels].reverse());
  assert.deepEqual(c1.map(x => [x.id, x.points]), c2.map(x => [x.id, x.points]));
  assert.equal(c1.find(x => x.id === "a").joues, 2, "le duel contre un ancien membre ne compte pas");
  assert.equal(c1.at(-1).id, "c", "sans duel dans le cercle : à la fin, sans rang");
  assert.equal(c1.at(-1).rang, null);
  assert.deepEqual(podiumCercle(c1).map(x => x.id), ["a", "b"], "le podium : seulement les classés");
});

test("le vainqueur comme dans la base : 0 (j0) ou 1 (j1) (14 novembre : tous les duels étaient ignorés)", () => {
  const membres = [m("a"), m("b"), m("c")];
  const duels = [{ j0: "a", j1: "b", vainqueur: 0, quand: "2026-11-01" }, { j0: "c", j1: "a", vainqueur: 1, quand: "2026-11-02" }, { j0: "b", j1: "c", vainqueur: 1, quand: "2026-11-03" }];
  const c = classementCercle(membres, duels), de = id => c.find(x => x.id === id);
  assert.equal(de("a").v, 2); assert.equal(de("a").d, 0); assert.equal(de("a").rang, 1);
  assert.equal(de("b").d, 2); assert.equal(de("c").v, 1);
  assert.ok(c.every(x => x.rang), "tout le monde est classé");
});
