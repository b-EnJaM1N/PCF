import { test } from "node:test";
import assert from "node:assert/strict";
import { notesDe, rangDe, texteRang, carteDe, RANGS, diversification, noteBareme, BAREMES, avecPreuves, generale, comparer } from "../app/js/carte-logique.js";
import { profilParDefaut } from "../app/js/profil.js";

const note = (P, code) => notesDe(P).find(n => n.code === code).valeur;

test("un nouveau joueur : carte en bois, des tirets, niveau d'entraînement", () => {
  const P = profilParDefaut(), c = carteDe(P);
  assert.equal(c.rarete, "bois");
  assert.equal(c.niveau, 1200); assert.equal(c.typeNiveau, "NIVEAU");
  assert.equal(c.signe, null);
  assert.deepEqual(c.notes.map(n => n.code), ["IMP", "PUN", "POL", "SGF", "FLA", "RÉS"]);
  assert.ok(c.notes.every(n => n.valeur === "–"), "pas de match contre des joueurs : des tirets");
});

test("les stats de la carte : seulement contre les joueurs, en pourcentages", () => {
  const P = profilParDefaut();
  Object.assign(P, { matchs: 100, victoires: 90 });   // (le total, avec les bots, ne compte pas)
  P.parAdv = { humains: { matchs: 10, victoires: 6, signes: [40, 30, 30], apresVictoire: 50, apresDefaite: 40, devines: 0, lisibles: 0,
    ballesObtenues: 10, ballesConverties: 5, ballesSubies: 8, ballesSauvees: 3, decisifsJoues: 2, decisifsGagnes: 2, flairTentees: 40, flairReussies: 30, endChaines: 6, endGagnees: 5 } };
  assert.equal(note(P, "POL"), "70");              // 40 / 30 / 30
  assert.equal(note(P, "SGF"), "70");              // (5 + 3 + 2) / (10 + 8 + 2) = 50 % : la moyenne
  assert.equal(note(P, "FLA"), "82");              // 30 sur 40 = 75 % (99), mais 40 lectures sur 100 : 70 + 29 × 0,4
  assert.equal(note(P, "RÉS"), "–", "les égalités pas encore comptées : pas de note");
  assert.equal(note(P, "PUN"), "–", "le Punch aussi a besoin des égalités");
  P.parAdv.humains.egalites = 54;                  // marqués : 56 ; perdus : 40 + 10 - 6 = 44
  assert.equal(note(P, "PUN"), "73");              // 56 sur 154 coups = 36,4 % (79), 154 coups sur 500 : 70 + 9 × 0,308
  assert.equal(note(P, "RÉS"), "73");              // 54 sur 98 = 55,1 % (80), 98 sur 300 : 70 + 10 × 0,327
  assert.equal(avecPreuves(90, 20, 100), 74); assert.equal(avecPreuves(90, 50, 100), 80); assert.equal(avecPreuves(90, 300, 100), 90);
  assert.equal(note(P, "IMP"), "–", "pas encore assez de coups lus");
  assert.equal(diversification([100, 100, 100]), 100);
  assert.equal(diversification([1001, 1000, 999]), 100, "33,3 % partout, au dixième près");
  assert.equal(diversification([101, 100, 99]), 98, "33,7 / 33,3 / 33,0 : pas encore 100");
  assert.equal(diversification([60, 20, 20]), 0);
  // le barème façon FIFA : 50 = le hasard, 99 au repère, 1 autant en dessous
  // les trois paliers : 70 = la moyenne (le hasard), 90 = excellent, 99 = hors norme
  assert.equal(noteBareme(100 / 3, BAREMES.PUN), 70); assert.equal(noteBareme(40, BAREMES.PUN), 90); assert.equal(noteBareme(45, BAREMES.PUN), 99);
  assert.equal(noteBareme(60, BAREMES.PUN), 99); assert.equal(noteBareme(15, BAREMES.PUN), 1); assert.equal(noteBareme(20, BAREMES.RES), 1);
  // l'imprévisibilité (la part de coups devinés) : 1 sur 3 = 90 (choix du porteur du projet), 99 seulement à 20 %
  assert.deepEqual([20, 100 / 3, 45, 50, 60].map(p => noteBareme(p, BAREMES.IMP)), [99, 90, 70, 60, 35]);
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

test("la note générale : coefficients (Punch ×3, Imprévisibilité et Flair ×2, les autres ×1), une note « – » compte 70", () => {
  const n = v => [["IMP", v[0]], ["PUN", v[1]], ["POL", v[2]], ["SGF", v[3]], ["FLA", v[4]], ["RÉS", v[5]]].map(([code, valeur]) => ({ code, nom: code, valeur: String(valeur) }));
  // (2×70 + 3×88 + 95 + 80 + 2×75 + 72) ÷ 10 = 80,1
  assert.equal(generale(n([70, 88, 95, 80, 75, 72])), 80);
  assert.equal(generale(n([90, 90, 90, 90, "–", "–"])), 84, "(2×90 + 3×90 + 90 + 90 + 2×70 + 70) ÷ 10 = 84");
  assert.equal(generale(n(["–", "–", "–", "–", "–", "–"])), null, "aucun match contre un joueur");
  assert.equal(carteDe(profilParDefaut()).generale, null);
  // la comparaison, vue de A : une note « – » ne compte pour personne
  const r = comparer(n([80, 88, 95, 70, "–", 72]), n([75, 90, 95, 60, 80, 70]));
  assert.deepEqual(r.lignes.map(l => l.mieux), [0, 1, null, 0, null, 0]);
  assert.deepEqual([r.gagnees, r.perdues, r.egalites], [3, 1, 1]);
  assert.deepEqual(r.generales, [generale(n([80, 88, 95, 70, "–", 72])), generale(n([75, 90, 95, 60, 80, 70]))]);
});
