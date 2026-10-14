import { test } from "node:test";
import assert from "node:assert/strict";
import { applaudissements, coupDeRaquette, echoStade, FOULES } from "../app/js/sons.js";
import { FICHIERS_AMBIANCE, FICHIERS_RAQUETTE, FICHIERS_REACTIONS, reactionsPublic, egalitesAvantDernier, series, reactionPoint } from "../app/js/ambiance.js";
import { rngFixe } from "./outils.js";

const valide = c => { for (const v of c) if (!Number.isFinite(v) || Math.abs(v) > 1) return false; return true; };

test("les applaudissements ont la bonne durée, deux canaux et aucun échantillon invalide", () => {
  for (const [type, f] of Object.entries(FOULES)) {
    const [L, R] = applaudissements(22050, f, rngFixe(1));
    assert.equal(L.length, Math.floor(f.duree * 22050), type);
    assert.ok(valide(L) && valide(R), type);
    assert.ok(L.some(v => Math.abs(v) > 0.5), `${type} n'est pas silencieux`);
  }
});

test("les applaudissements s'éteignent à la fin", () => {
  const [L] = applaudissements(22050, FOULES.set, rngFixe(2));
  const fin = L.subarray(L.length - 2205);
  assert.ok(Math.max(...fin.map(Math.abs)) < 0.2);
});

test("le coup de raquette est court et commence sans clic", () => {
  const s = coupDeRaquette(44100, 1, rngFixe(3));
  assert.ok(s.length < 44100 * 0.2);
  assert.ok(valide(s));
  assert.ok(Math.abs(s[0]) < 1e-9);
});

test("l'écho du stade et les noms de fichiers des sons", () => {
  const [a, b] = echoStade(22050, 1.6, rngFixe(4));
  assert.ok(valide(a) && valide(b));
  for (const id of [...Object.values(FICHIERS_AMBIANCE), ...FICHIERS_RAQUETTE]) assert.match(id, /^[a-z_]+_\d{2}$/);
});

test("le public : tension sur les balles de set et de match, « ooh » sur les points disputés", () => {
  const balle = (type, joueur) => ({ type, joueur });
  assert.deepEqual(reactionsPublic({ gagnant: 0, balleApres: balle("set", 0) }), { tension: true, ooh: false });
  // balle de match sauvée
  assert.deepEqual(reactionsPublic({ gagnant: 1, balleAvant: balle("match", 0) }), { tension: false, ooh: true });
  // balle convertie : c'est la fin du set, les applaudissements prennent le relais
  assert.deepEqual(reactionsPublic({ gagnant: 0, balleAvant: balle("set", 0), finSet: true }), { tension: false, ooh: false });
  // point arraché après deux égalités
  assert.equal(reactionsPublic({ gagnant: 0 }, 2).ooh, true);
  assert.equal(reactionsPublic({ gagnant: 0 }, 1).ooh, false);
  assert.deepEqual(reactionsPublic({ egalite: true, gagnant: null }, 3), { tension: false, ooh: false });
  const c = g => ({ gagnant: g });
  assert.equal(egalitesAvantDernier([c(0), c(null), c(null), c(1)]), 2);
  assert.equal(egalitesAvantDernier([c(null), c(0)]), 1);
  assert.equal(egalitesAvantDernier([c(0)]), 0);
});

test("les réactions du public après un point : variées, jamais deux de suite, « Ohhh… » quand une belle série est brisée", () => {
  const c = (...g) => g.map(x => ({ gagnant: x }));
  assert.deepEqual(series(c(0, 0, null, 0)), { serie: 3, brisee: 0 }, "les égalités ne coupent pas une série");
  assert.deepEqual(series(c(1, 1, 1, 0)), { serie: 1, brisee: 3 });
  const tot = () => 0, tard = () => 0.99;
  assert.equal(reactionPoint({}, { egalite: true }, c(0, null), tot), null, "jamais sur une égalité");
  assert.equal(reactionPoint({}, { gagnant: 0 }, c(1, 1, 1, 1, 0), tot), "ohDecu", "une série de 4 brisée");
  assert.equal(reactionPoint({ dernier: true }, { gagnant: 0 }, c(1, 1, 1, 1, 0), tot), "ohDecu", "même juste après une autre réaction");
  assert.equal(reactionPoint({}, { gagnant: 0 }, c(1, null, 0), tot), "bravo", "un point arraché après une égalité");
  assert.equal(reactionPoint({}, { gagnant: 0 }, c(0, 0, 0), tot), "allez", "une série qui se construit");
  assert.equal(reactionPoint({ dernier: true }, { gagnant: 0 }, c(0, 0, 0), tot), null, "jamais deux points de suite");
  assert.equal(reactionPoint({}, { gagnant: 0 }, c(1, 0), tard), null, "le plus souvent, le murmure suffit");
  const vus = new Set(); let n = 0, e = {};
  const coups = [];
  for (let i = 0; i < 4000; i++) { coups.push({ gagnant: Math.random() < 0.15 ? null : Math.random() < 0.5 ? 0 : 1 }); const r = reactionPoint(e, coups.at(-1).gagnant === null ? { egalite: true } : { gagnant: coups.at(-1).gagnant }, coups); if (r) { vus.add(r); n++; } }
  assert.deepEqual([...vus].sort(), ["allez", "applaudir", "bravo", "brouhaha", "ohDecu"]);
  assert.ok(n > 400 && n < 1300, `une réaction de temps en temps, pas à chaque point (${n} sur 4000 coups)`);
  for (const id of Object.values(FICHIERS_REACTIONS).flat()) assert.match(id, /^[a-z_]+_\d{2}$/);
});
