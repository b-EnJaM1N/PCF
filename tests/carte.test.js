import { test } from "node:test";
import assert from "node:assert/strict";
import { notesDe, rangDe, texteRang, carteDe, RANGS, diversification, noteFifa } from "../app/js/carte-logique.js";
import { profilParDefaut } from "../app/js/profil.js";

const note = (P, code) => notesDe(P).find(n => n.code === code).valeur;

test("un nouveau joueur : carte en bois, des tirets, niveau d'entraînement", () => {
  const P = profilParDefaut(), c = carteDe(P);
  assert.equal(c.rarete, "bois");
  assert.equal(c.niveau, 1200); assert.equal(c.typeNiveau, "NIVEAU");
  assert.equal(c.signe, null);
  assert.deepEqual(c.notes.map(n => n.code), ["IMP", "RÉU", "DIV", "VIC", "SGF", "FLA"]);
  assert.ok(c.notes.every(n => n.valeur === "–"), "pas de match contre des joueurs : des tirets");
});

test("les stats de la carte : seulement contre les joueurs, en pourcentages", () => {
  const P = profilParDefaut();
  Object.assign(P, { matchs: 100, victoires: 90 });   // (le total, avec les bots, ne compte pas)
  P.parAdv = { humains: { matchs: 10, victoires: 6, signes: [40, 30, 30], apresVictoire: 50, apresDefaite: 40, devines: 0, lisibles: 0,
    ballesObtenues: 10, ballesConverties: 5, ballesSubies: 8, ballesSauvees: 3, decisifsJoues: 2, decisifsGagnes: 2, lecturesReussies: 15, lecturesRatees: 5 } };
  assert.equal(note(P, "VIC"), "66");              // 60 % : 50 + 10 × 49 / 30
  assert.equal(note(P, "RÉU"), "70");              // 56 % : (50 + 6) / (50 + 40 + 10)
  assert.equal(note(P, "DIV"), "75");
  assert.equal(note(P, "SGF"), "50");              // 50 % : le hasard              // (5 + 3 + 2) / (10 + 8 + 2)
  assert.equal(note(P, "FLA"), "91");              // 75 % : 50 + 25 × 49 / 30
  assert.equal(note(P, "IMP"), "–", "pas encore assez de coups lus");
  assert.equal(diversification([100, 100, 100]), 100);
  assert.equal(diversification([1001, 1000, 999]), 100, "33,3 % partout, au dixième près");
  assert.equal(diversification([101, 100, 99]), 98, "33,7 / 33,3 / 33,0 : pas encore 100");
  assert.equal(diversification([60, 20, 20]), 0);
  // le barème façon FIFA : 50 = le hasard, 99 au repère, 1 autant en dessous
  assert.equal(noteFifa(50, 65), 50); assert.equal(noteFifa(65, 65), 99); assert.equal(noteFifa(80, 65), 99);
  assert.equal(noteFifa(35, 65), 1); assert.equal(noteFifa(57, 65), 73); assert.equal(noteFifa(65, 80), 75);
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
