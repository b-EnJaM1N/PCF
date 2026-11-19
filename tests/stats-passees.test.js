import test from "node:test";
import assert from "node:assert/strict";
import { jeuDepuisDuels, jeuMoins, estBotEnLigne } from "../app/js/stats-passees.js";
import { profilParDefaut } from "../app/js/profil.js";

test("Mon jeu contre les joueurs, retrouvé dans les duels passés (les bots en ligne à part)", () => {
  const duels = [
    // moi en j0 : Pierre gagnant, Pierre encore (égalité), Feuille avec un smash gagnant
    { j0: "moi", j1: "ami", coups: [{ a: 0, b: 1, g: 0 }, { a: 0, b: 0, g: null }, { a: 2, b: 0, g: 0, smash: [true, false] }] },
    // moi en j1 : Ciseaux perdant, puis Ciseaux encore
    { j0: "amie", j1: "moi", coups: [{ a: 0, b: 1, g: 0 }, { a: 2, b: 1, g: 1 }] },
    { j0: "moi", j1: "rocky", coups: [{ a: 0, b: 1, g: 0 }] },   // un bot en ligne : pas compté
  ];
  const h = jeuDepuisDuels(duels, "moi", new Set(["rocky"]));
  assert.equal(h.matchs, 2);
  assert.deepEqual(h.signes, [2, 2, 1]);
  assert.equal(h.apresVictoire, 1); assert.equal(h.memeApresVictoire, 1);
  assert.equal(h.apresDefaite, 1); assert.equal(h.memeApresDefaite, 1);
  assert.equal(h.smashsTentes, 1); assert.equal(h.smashsReussis, 1);
  assert.ok(h.lisibles >= 0 && h.devines <= h.lisibles);
  assert.ok(estBotEnLigne("Rocky 🤖")); assert.ok(!estBotEnLigne("Benja-Main"));
  const P = { ...profilParDefaut(), matchs: 10, signes: [10, 10, 10], apresVictoire: 5, devines: 3, lisibles: 9 };
  const b = jeuMoins(P, h);
  assert.equal(b.matchs, 8); assert.deepEqual(b.signes, [8, 8, 9]); assert.equal(b.apresVictoire, 4); assert.equal(b.smashsTentes, 0, "jamais en dessous de zéro");
});
