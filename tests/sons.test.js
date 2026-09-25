import { test } from "node:test";
import assert from "node:assert/strict";
import { applaudissements, coupDeRaquette, echoStade, FOULES } from "../app/js/sons.js";
import { FICHIERS_AMBIANCE } from "../app/js/ambiance.js";
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
  for (const id of Object.values(FICHIERS_AMBIANCE)) assert.match(id, /^[a-z_]+_\d{2}$/);
});
