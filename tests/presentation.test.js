import { test } from "node:test";
import assert from "node:assert/strict";
import { presentation } from "../app/js/presentation.js";
import { profilParDefaut } from "../app/js/profil.js";
import { botParId } from "../app/js/bots.js";

test("présentation d'un nouveau joueur contre Rocky", () => {
  const p = presentation(profilParDefaut(), botParId("rocky"));
  assert.equal(p.bandeau, "Match amical");
  assert.equal(p.joueur.bilan, "Premier match officiel");
  assert.equal(p.cle, "Premier face-à-face.");
  const niveau = p.lignes[0];
  assert.deepEqual([niveau.g, niveau.d, niveau.avantage], ["1200", "1050", "g"]);
  assert.equal(p.lignes.find(l => l.label === "Imprévisibilité").g, "–", "pas encore assez de coups");
});

test("présentation d'un joueur confirmé en demi-finale", () => {
  const P = profilParDefaut();
  Object.assign(P, { elo: 1350, matchs: 10, victoires: 7, signes: [5, 20, 3], devines: 30, lisibles: 100, faceAFace: { professeur: { v: 2, d: 3, signes: [0, 0, 0] } } });
  const p = presentation(P, botParId("professeur"), { tour: 1, pointsParSet: 7, setsGagnants: 2 });
  assert.equal(p.bandeau, "PCF Open · Demi-finale");
  assert.equal(p.format, "Sets de 7 points · 2 sets gagnants");
  assert.equal(p.joueur.bilan, "7 V – 3 D · 70 % de victoires");
  assert.equal(p.lignes[0].avantage, "d");
  assert.deepEqual([p.lignes[1].g, p.lignes[1].d, p.lignes[1].avantage], ["2", "3", "d"]);
  assert.equal(p.lignes[2].g, "✂️ Ciseaux");
  assert.equal(p.lignes[3].g, "100/100");
  assert.equal(p.cle, "5ᵉ face-à-face.");
});
