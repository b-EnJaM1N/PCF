import { test } from "node:test";
import assert from "node:assert/strict";
import { notesDe, rangDe, texteRang, carteDe, RANGS } from "../app/js/carte-logique.js";
import { profilParDefaut } from "../app/js/profil.js";

const note = (P, code) => notesDe(P).find(n => n.code === code).valeur;

test("un nouveau joueur : carte bronze, notes à 50, niveau d'entraînement", () => {
  const P = profilParDefaut(), c = carteDe(P);
  assert.equal(c.rarete, "bois");
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

test("les 10 rangs : on monte en jouant, puis avec le niveau officiel", () => {
  assert.equal(RANGS.length, 10);
  const P = profilParDefaut(), rang = (n = null) => rangDe(P, n).rang.id;
  assert.equal(rang(), "bois");
  P.matchs = 5; assert.equal(rang(), "bronze");
  P.matchs = 15; assert.equal(rang(), "argent");
  P.matchs = 30; assert.equal(rang(), "argent", "l'or demande aussi 3 titres");
  P.tournoisGagnes = 1; assert.equal(rang(), "platine", "un tournoi gagné et 30 matchs");
  P.tournoisGagnes = 50; assert.equal(rang(), "platine", "les tournois contre les bots ne mènent pas plus haut");
  assert.equal(rang(1450), "diamant"); assert.equal(rang(1500), "rubis"); assert.equal(rang(1600), "maitre");
  assert.equal(rang(1750), "grand_maitre"); assert.equal(rang(1900), "legende");
  assert.equal(texteRang(rangDe(profilParDefaut())), "Carte Bois (rang 1 sur 10). Prochain rang, Bronze : 5 matchs.");
  assert.match(texteRang(rangDe(P, 2000)), /Légende \(rang 10 sur 10\)\. Tu es au sommet/);
});

test("le niveau officiel remplace le niveau d'entraînement quand il est connu", () => {
  const c = carteDe(profilParDefaut(), { niveauOfficiel: 1264 });
  assert.equal(c.niveau, 1264); assert.equal(c.typeNiveau, "NIVEAU OFFICIEL");
});
