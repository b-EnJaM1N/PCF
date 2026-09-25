import { test } from "node:test";
import assert from "node:assert/strict";
import { BOTS, botParId, choisirCoup } from "../app/js/bots.js";
import { Lecteur, Suivi, indiceImprevisibilite } from "../app/js/analyse.js";
import { rngFixe } from "./outils.js";
import { PIERRE, CISEAUX, FEUILLE, contre, gagnantCoup } from "../app/js/regles.js";


test("sept bots, niveaux croissants de 1050 à 1400", () => {
  assert.equal(BOTS.length, 7);
  assert.deepEqual(BOTS.map(b => b.elo), [1050, 1100, 1150, 1200, 1250, 1300, 1400]);
  assert.equal(botParId("professeur").nom, "Professeur");
});

test("chaque bot joue toujours un signe valide", () => {
  const rng = rngFixe();
  for (const b of BOTS) {
    const hist = [];
    for (let i = 0; i < 60; i++) {
      const s = choisirCoup(b, hist, rng);
      assert.ok([0, 1, 2].includes(s), `${b.nom} a joué ${s}`);
      const adv = Math.floor(rng() * 3), g = gagnantCoup(s, adv);
      hist.push({ moi: s, adv, res: g === null ? "e" : g === 0 ? "g" : "p" });
    }
  }
});

test("Rocky joue Pierre environ une fois sur deux ou plus", () => {
  const rng = rngFixe(7); let p = 0;
  for (let i = 0; i < 3000; i++) if (choisirCoup(botParId("rocky"), [], rng) === PIERRE) p++;
  assert.ok(p / 3000 > 0.6 && p / 3000 < 0.73, `part de Pierre : ${p / 3000}`);
});

test("Cyclo tourne Pierre, Feuille, Ciseaux", () => {
  const rng = () => 0.99; // pas de hasard
  const b = botParId("cyclo");
  assert.equal(choisirCoup(b, [{ moi: PIERRE, adv: 0, res: "e" }], rng), FEUILLE);
  assert.equal(choisirCoup(b, [{ moi: FEUILLE, adv: 0, res: "e" }], rng), CISEAUX);
  assert.equal(choisirCoup(b, [{ moi: CISEAUX, adv: 0, res: "e" }], rng), PIERRE);
});

test("Boomerang garde son signe quand il gagne, joue ce qui bat l'adversaire quand il perd", () => {
  const rng = () => 0.99, b = botParId("boomerang");
  assert.equal(choisirCoup(b, [{ moi: PIERRE, adv: CISEAUX, res: "g" }], rng), PIERRE);
  assert.equal(choisirCoup(b, [{ moi: PIERRE, adv: FEUILLE, res: "p" }], rng), contre(FEUILLE));
});

test("Stratège punit un joueur qui joue toujours Pierre", () => {
  const rng = rngFixe(3), b = botParId("stratege"), hist = []; let gagnes = 0;
  for (let i = 0; i < 100; i++) {
    const s = choisirCoup(b, hist, rng), g = gagnantCoup(s, PIERRE);
    if (g === 0) gagnes++;
    hist.push({ moi: s, adv: PIERRE, res: g === null ? "e" : g === 0 ? "g" : "p" });
  }
  assert.ok(gagnes > 75, `Stratège n'a gagné que ${gagnes} points sur 100`);
});

test("le lecteur repère un cycle", () => {
  const l = new Lecteur(), cycle = [PIERRE, CISEAUX, FEUILLE];
  for (let i = 0; i < 30; i++) l.apprendre(cycle[i % 3], "e");
  assert.equal(l.predire(), cycle[30 % 3]);
});

test("le suivi compte les coups devinés", () => {
  const s = new Suivi();
  for (let i = 0; i < 20; i++) { s.figer(); s.enregistrer(PIERRE, "g"); }
  assert.ok(s.lisibles >= 18);
  assert.ok(s.taux > 0.9);
});

test("indice d'imprévisibilité : 33 % = 100, 40 % = 80, 50 % = 50, 60 % = 20", () => {
  assert.equal(indiceImprevisibilite(1 / 3), 100);
  assert.equal(indiceImprevisibilite(0.40), 80);
  assert.equal(indiceImprevisibilite(0.50), 50);
  assert.equal(indiceImprevisibilite(0.60), 20);
  assert.equal(indiceImprevisibilite(0.10), 100);
  assert.equal(indiceImprevisibilite(0.90), 0);
});
