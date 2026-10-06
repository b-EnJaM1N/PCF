import test from "node:test";
import assert from "node:assert/strict";
import { variationClassement, texteClassementFin, normaliserBlason, blasonSVG, erreurNomCercle, lienCercle, codeCercleDepuisAdresse, rang } from "../app/js/social-logique.js";
import { nouvelElo } from "../app/js/profil.js";
import { FORMAT } from "../app/js/duel-logique.js";

test("variation du niveau officiel : mêmes valeurs que le serveur (tests/base-de-donnees/etape-4.sql)", () => {
  assert.equal(variationClassement(1200, 1200), 16);
  assert.equal(variationClassement(1400, 1200), 8);
  assert.equal(variationClassement(1200, 1400), 24);
  // et la même formule que le niveau d'entraînement
  for (const [g, p] of [[1200, 1200], [1350, 1180], [1000, 1600], [1600, 1000]]) assert.equal(g + variationClassement(g, p), nouvelElo(g, p, true));
});

test("texte du classement en fin de duel", () => {
  const d = { classement_avant: [1200, 1230], classement_apres: [1183, 1247] };
  assert.equal(texteClassementFin(d, 0), "Niveau officiel : 1200 → 1183 (−17)");
  assert.equal(texteClassementFin(d, 1), "Niveau officiel : 1230 → 1247 (+17)");
  assert.match(texteClassementFin({ classement_motif: "amical" }, 0), /amical/);
  assert.match(texteClassementFin({ classement_motif: "limite" }, 1), /5 duels officiels/);
  assert.match(texteClassementFin({ classement_motif: "non_dispute" }, 1), /Aucun coup/);
  assert.equal(texteClassementFin({}, 0), "");
  assert.equal(texteClassementFin(null, 0), "");
});

test("blasons : seules les valeurs de la liste sont utilisées", () => {
  assert.deepEqual(normaliserBlason({ embleme: "loup", fond: "or" }), { embleme: "loup", fond: "or" });
  assert.deepEqual(normaliserBlason({ embleme: "<script>", fond: "\"x" }), { embleme: "lion", fond: "court" });
  assert.deepEqual(normaliserBlason(null), { embleme: "lion", fond: "court" });
  const svg = blasonSVG({ embleme: "<img onerror=alert(1)>" });
  assert.ok(!svg.includes("<img"), "rien d'injecté dans le dessin");
  assert.ok(svg.includes("🦁"));
});

test("nom de cercle", () => {
  assert.equal(erreurNomCercle("La Famille"), null);
  assert.match(erreurNomCercle(" x "), /au moins 2/);
  assert.match(erreurNomCercle("x".repeat(31)), /au plus 30/);
});

test("liens d'invitation dans un cercle", () => {
  const l = lienCercle("https://b-enjam1n.github.io/PCF/", "a1b2c3d4e5");
  assert.equal(l, "https://b-enjam1n.github.io/PCF/?cercle=a1b2c3d4e5");
  assert.equal(codeCercleDepuisAdresse(new URL(l).search), "a1b2c3d4e5");
  assert.equal(codeCercleDepuisAdresse("?cercle=<b>"), null);
  assert.equal(codeCercleDepuisAdresse("?duel=a1b2c3d4e5"), null);
});

test("format d'un duel : classé ou amical", () => {
  assert.equal(FORMAT({ points_par_set: 11, sets_gagnants: 2, classe: true }), "Sets de 11 points · 2 sets gagnants · officiel");
  assert.equal(FORMAT({ points_par_set: 7, sets_gagnants: 3, classe: false }), "Sets de 7 points · 3 sets gagnants · amical");
});

test("rangs", () => { assert.equal(rang(1), "1er"); assert.equal(rang(2), "2e"); assert.equal(rang(11), "11e"); });

test("calibrage : le niveau est provisoire pendant les 10 premiers duels officiels", async () => {
  const { texteNiveau, texteCalibrage, provisoire } = await import("../app/js/social-logique.js");
  assert.equal(texteNiveau(1200, 0), "1200 ?"); assert.equal(texteNiveau(1264, 9), "1264 ?"); assert.equal(texteNiveau(1264, 10), "1264");
  assert.ok(provisoire(undefined)); assert.ok(!provisoire(12));
  assert.match(texteCalibrage(9), /encore 1 duel officiel de calibrage/); assert.equal(texteCalibrage(10), "");
});

test("divisions : seuils, montée dès le seuil, descente seulement 20 points sous le seuil", async () => {
  const { divisionDe, texteDivision } = await import("../app/js/social-logique.js");
  assert.deepEqual([1099, 1100, 1200, 1250, 1400, 1550].map(p => divisionDe(p)), [0, 1, 1, 2, 3, 4]);
  assert.equal(divisionDe(1250, 1), 2, "Argent à 1 250 : promu en Or");
  assert.equal(divisionDe(1230, 2), 2, "Or à 1 230 : reste en Or");
  assert.equal(divisionDe(1229, 2), 1, "Or à 1 229 : redescend");
  assert.equal(texteDivision(2), "🥇 Or");
});
