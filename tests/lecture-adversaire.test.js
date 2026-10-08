import { test } from "node:test";
import assert from "node:assert/strict";
import { repartition, habitudes, piste, lecturesReussies, quiBat } from "../app/js/lecture-adversaire.js";

// Signes : 0 = Pierre, 1 = Ciseaux, 2 = Feuille. a : moi, b : lui ; gagnant 0 = moi, 1 = lui.
const gagnant = (a, b) => (a === b ? null : (a + 1) % 3 === b ? 0 : 1);
const match = paires => paires.map(([a, b]) => ({ a, b, gagnant: gagnant(a, b) }));

test("qui bat quoi", () => {
  assert.equal(quiBat(0), 2, "la Feuille bat la Pierre");
  assert.equal(quiBat(1), 0, "la Pierre bat les Ciseaux");
  assert.equal(quiBat(2), 1, "les Ciseaux battent la Feuille");
});

test("la répartition de ses signes", () => {
  assert.deepEqual(repartition(match([[0, 0], [1, 0], [2, 2]])), [2, 0, 1]);
});

test("pas de conclusion trop tôt", () => {
  assert.deepEqual(habitudes(match([[0, 0], [1, 0], [2, 0]])), []);
  assert.equal(piste(match([[0, 0], [1, 0], [2, 0]])), null);
});

test("un adversaire qui adore la Pierre : la piste, c'est la Feuille", () => {
  const c = match([[1, 0], [1, 0], [2, 0], [1, 2], [1, 0], [0, 0]]);
  assert.equal(habitudes(c)[0].cle, "favori");
  assert.equal(piste(c).signe, 2);
  assert.match(piste(c).texte, /la Pierre : la Feuille le bat/);
});

test("un adversaire qui tourne en boucle (Pierre, Feuille, Ciseaux) : on contre le suivant", () => {
  const c = match([[1, 0], [1, 2], [1, 1], [1, 0], [1, 2], [1, 1]]);
  assert.ok(habitudes(c).some(h => h.cle === "boucle"));
  assert.equal(piste(c).signe, quiBat(0), "après les Ciseaux vient la Pierre : la Feuille");
});

test("un adversaire qui ne rejoue jamais le même signe : la piste ne peut pas perdre", () => {
  const c = match([[0, 0], [0, 2], [0, 1], [0, 2], [0, 0], [0, 1]]);
  const p = piste(c);
  assert.ok(habitudes(c).some(h => h.cle === "jamais_deux"));
  // Dernier signe : Ciseaux ; il jouera Pierre ou Feuille ; la Feuille bat la Pierre et fait égalité avec la Feuille.
  assert.equal(p.signe, 2);
  assert.match(p.texte, /gagnes ou tu fais égalité/);
});

test("les lectures réussies se comptent à la fin du match", () => {
  const c = match([[1, 0], [1, 0], [2, 0], [1, 0], [2, 0], [2, 0]]);
  assert.ok(lecturesReussies(c) >= 1);
  assert.equal(lecturesReussies(match([[0, 1], [1, 2], [2, 0]])), 0);
});

// ---------------------------------------------------------------- le dossier de l'adversaire
import { compterMatch, additionner, dossier, compteVide } from "../app/js/lecture-adversaire.js";

test("le dossier : rien tant qu'on n'a pas assez de coups", () => {
  assert.equal(dossier(compteVide()), null);
  assert.equal(dossier(compterMatch(match([[0, 0], [1, 0], [2, 0]]))), null);
  assert.equal(dossier(null), null);
});

test("le dossier : additionner plusieurs matchs, sans compter le passage d'un match à l'autre", () => {
  const m = match([[1, 0], [1, 0], [2, 0], [1, 2], [1, 0], [0, 0]]);
  const k = additionner(compterMatch(m), compterMatch(m));
  assert.equal(k.matchs, 2);
  assert.equal(k.coups, 12);
  assert.equal(k.transitions, 10, "5 passages par match, pas de passage entre les deux matchs");
  assert.deepEqual(k.premiers, [2, 0, 0]);
  assert.deepEqual(additionner(k, { coups: "abîmé", signes: [1] }).signes, [11, 0, 2]);
});

test("le dossier d'un adversaire qui adore la Pierre et ouvre toujours par elle", () => {
  const m = match([[1, 0], [1, 0], [2, 0], [1, 2], [1, 0], [0, 0], [2, 0], [1, 1]]);
  let k = compteVide();
  for (let i = 0; i < 4; i++) k = additionner(k, compterMatch(m));
  const d = dossier(k);
  assert.equal(d.matchs, 4);
  assert.equal(d.repartition.reduce((a, b) => a + b, 0) >= 99, true);
  assert.match(d.habitudes.join(" | "), /Son signe préféré : la Pierre/);
  assert.match(d.habitudes.join(" | "), /premier coup, il joue souvent la Pierre \(4 matchs sur 4\)/);
  assert.ok(d.habitudes.length <= 4);
});

test("le dossier d'une joueuse parle d'elle", () => {
  const m = match([[0, 0], [0, 2], [0, 1], [0, 2], [0, 0], [0, 1], [0, 0], [0, 2], [0, 1], [0, 0], [0, 2]]);
  const d = dossier(additionner(compterMatch(m), compterMatch(m)), { elle: true });
  assert.ok(d.habitudes.length > 0);
  assert.ok(d.habitudes.every(h => !/\bil\b/.test(h)));
  assert.match(d.habitudes.join(" "), /\belle\b/);
});
