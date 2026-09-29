import { test } from "node:test";
import assert from "node:assert/strict";
import { notesDe, rareteDe, carteDe } from "../app/js/carte-logique.js";
import { profilParDefaut } from "../app/js/profil.js";

const note = (P, code) => notesDe(P).find(n => n.code === code).valeur;

test("un nouveau joueur : carte bronze, notes à 50, niveau d'entraînement", () => {
  const P = profilParDefaut(), c = carteDe(P);
  assert.equal(c.rarete, "bronze");
  assert.equal(c.niveau, 1200); assert.equal(c.typeNiveau, "NIVEAU");
  assert.equal(c.signe, null);
  assert.deepEqual(c.notes.map(n => n.valeur), [50, 50, 50, 50, 50, 1]);
});

test("les notes : 50 = le hasard, et il faut des preuves pour s'en éloigner", () => {
  const P = profilParDefaut();
  Object.assign(P, { matchs: 2, victoires: 2 });
  assert.equal(note(P, "VIC"), 55);            // 2 sur 2 : encore peu de preuves
  Object.assign(P, { matchs: 40, victoires: 30 });
  assert.equal(note(P, "VIC"), 75);
  Object.assign(P, { ballesObtenues: 40, ballesConverties: 40 });
  assert.equal(note(P, "FIN"), 99);
  Object.assign(P, { ballesSubies: 40, ballesSauvees: 0 });
  assert.equal(note(P, "MEN"), 1);
  for (const n of notesDe(P)) assert.ok(n.valeur >= 1 && n.valeur <= 99, n.code);
});

test("la rareté : argent à 10 matchs, or avec un tournoi, légende avec 5", () => {
  const P = profilParDefaut();
  P.matchs = 10; assert.equal(rareteDe(P), "argent");
  P.tournoisGagnes = 1; assert.equal(rareteDe(P), "or");
  P.tournoisGagnes = 5; assert.equal(rareteDe(P), "legende");
});

test("le niveau officiel remplace le niveau d'entraînement quand il est connu", () => {
  const c = carteDe(profilParDefaut(), { niveauOfficiel: 1264 });
  assert.equal(c.niveau, 1264); assert.equal(c.typeNiveau, "NIVEAU OFFICIEL");
});
