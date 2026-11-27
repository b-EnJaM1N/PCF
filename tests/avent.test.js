// Le calendrier de l'Avent (24 novembre) : les cadeaux, les défis du jour, les rattrapages (gardiens, deux par jour, jusqu'au 31).
import { test } from "node:test";
import assert from "node:assert/strict";
import { CADEAUX, SERIES, PALIERS, serieA, serieEnCours, meilleureSerie, paliersAtteints, prochainPalier, primeDe, DEFI_DU_JOUR, DEFIS, cadeauDe, cadeauxDe, gardienDe, jourAvent, statutCase, casesGagnees, resultatAvent, compterMatchDuJour, NB_CASES, FORMAT_GARDIEN } from "../app/js/avent-logique.js";
import { CADEAUX_AVENT, articleDe } from "../app/js/catalogue.js";
import { nouveauMatch, jouerCoup, PIERRE, CISEAUX, FEUILLE } from "../app/js/regles.js";
import { readFileSync } from "node:fs";

test("24 cases : 12 pulls moches, les objets de Noël, le 24 le Gant du Père Noël ; 11 cadeaux d'assiduité (27 novembre)", () => {
  assert.equal(CADEAUX.length, NB_CASES + 1);
  const tous = [...CADEAUX.slice(1).flatMap(c => c.split("+")), ...Object.values(SERIES)];
  assert.equal(tous.filter(c => c.startsWith("gant:pull")).length, 12);
  assert.equal(tous.filter(c => c.startsWith("jetons:")).length, 0, "plus de cases de jetons");
  assert.equal(CADEAUX.slice(1).filter(c => c.includes("+")).length, 0, "un cadeau par case");
  assert.deepEqual(PALIERS, [3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]);
  assert.equal(CADEAUX[24], "gant:perenoel");
  assert.deepEqual(new Set(tous), new Set(CADEAUX_AVENT.map(x => x.id)), "chaque cadeau est dans le catalogue");
  assert.equal(tous.length, new Set(tous).size, "chaque cadeau une seule fois");
  for (const c of tous) assert.ok(articleDe(...c.split(":"))?.avent, c);
  assert.deepEqual(cadeauDe(2), { type: "bracelet", cle: "breloque_flocon", id: "bracelet:breloque_flocon" });
  assert.deepEqual(cadeauxDe(1).map(c => c.id), ["gant:pullmoche"]);
  assert.deepEqual(primeDe(3), { type: "bracelet", cle: "breloque_sucre", id: "bracelet:breloque_sucre" });
  assert.equal(primeDe(4), null);
  for (let n = 1; n <= NB_CASES; n++) assert.ok(DEFIS[DEFI_DU_JOUR[n]], `défi de la case ${n}`);
});

test("les mêmes cadeaux sur le serveur (étape 92)", () => {
  const sql = readFileSync(new URL("../supabase/etape-92-cadeaux-avent.sql", import.meta.url), "utf8");
  for (let n = 1; n <= NB_CASES; n++) assert.ok(sql.includes(`(${n}, '${CADEAUX[n]}')`), `case ${n} : ${CADEAUX[n]}`);
  for (const [p, c] of Object.entries(SERIES)) assert.ok(sql.includes(`(${p}, '${c}')`), `série de ${p} : ${c}`);
});

test("les cadeaux d'assiduité : la case du jour, N jours de suite (27 novembre)", () => {
  const cases = o => Object.fromEntries(Object.entries(o).map(([n, via]) => [n, { via }]));
  // cases du jour 1, 2, 3 ; 4 rattrapée (ne compte pas) ; 5, 6 du jour
  const e = { jour: 6, cases: cases({ 1: "jour", 2: "jour", 3: "jour", 4: "rattrapage", 5: "jour", 6: "jour" }) };
  assert.equal(serieA(e, 3), 3);
  assert.equal(serieA(e, 4), 0, "un rattrapage ne compte pas");
  assert.equal(serieEnCours(e), 2);
  assert.equal(meilleureSerie(e), 3);
  assert.deepEqual(paliersAtteints(e), [3]);
  assert.deepEqual(prochainPalier(e), { palier: 5, manque: 3 });
  // le 7, la case du jour pas encore ouverte : la série d'hier tient encore
  assert.equal(serieEnCours({ ...e, jour: 7 }), 2);
  assert.equal(serieEnCours({ ...e, jour: 8 }), 0, "un jour raté casse la série");
  // plus assez de jours pour le prochain palier
  assert.deepEqual(prochainPalier({ jour: 22, cases: cases({ 20: "jour", 21: "jour", 22: "jour" }) }), { palier: 5, manque: 2 });
  assert.equal(prochainPalier({ jour: 23, cases: cases({ 21: "jour", 22: "jour", 23: "jour" }) }), null);
  assert.deepEqual(prochainPalier({ jour: 22, cases: {} }), { palier: 3, manque: 3 });
  assert.equal(prochainPalier({ jour: 25, cases: {} }), null);
});

test("les gardiens, de plus en plus forts ; le jour du calendrier", () => {
  assert.deepEqual([1, 8, 9, 16, 17, 23, 24].map(gardienDe), ["neige", "neige", "renne", "renne", "lutin", "lutin", "perenoel"]);
  assert.equal(jourAvent("2026-12-05"), 5);
  assert.equal(jourAvent("2026-11-30"), 0);
  assert.equal(jourAvent("2027-01-02"), 0);
});

test("le statut des cases", () => {
  const e = { jour: 10, cases: { 3: { via: "jour" } } };
  assert.equal(statutCase(e, 3), "ouverte");
  assert.equal(statutCase(e, 10), "aujourdhui");
  assert.equal(statutCase(e, 4), "rattrapage");
  assert.equal(statutCase(e, 11), "fermee");
  assert.equal(statutCase({ jour: 28, cases: {} }, 24), "rattrapage", "après le 24 : on rattrape encore");
  assert.equal(statutCase({ jour: 0, cases: {} }, 1), "fermee");
});

const match = (coups, format = { pointsParSet: 3, setsGagnants: 1 }) => { const m = nouveauMatch(format); coups.forEach(([a, b]) => jouerCoup(m, a, b)); return m; };
const GAGNE = [PIERRE, CISEAUX], PERD = [CISEAUX, PIERRE], EGAL = [PIERRE, PIERRE];

test("le défi du jour ouvre la case du jour", () => {
  const m = match([GAGNE, EGAL, GAGNE, GAGNE]);
  const r = resultatAvent(m, "rocky", { smashsReussis: 0 });
  assert.equal(r.gagne, true); assert.equal(r.setSansEgalite, false);
  assert.deepEqual(casesGagnees({ jour: 1, cases: {} }, r), [{ num: 1, via: "jour" }], "jour 1 : gagner un match");
  assert.deepEqual(casesGagnees({ jour: 1, cases: { 1: {} } }, r), [], "déjà ouverte");
  assert.deepEqual(casesGagnees({ jour: 2, cases: {} }, r), [], "jour 2 : réussir un smash");
  assert.deepEqual(casesGagnees({ jour: 2, cases: {} }, { ...r, smashsReussis: 1 }), [{ num: 2, via: "jour" }]);
  assert.deepEqual(casesGagnees({ jour: 6, cases: {} }, resultatAvent(match([GAGNE, PERD, GAGNE, GAGNE]), "rocky")), [{ num: 6, via: "jour" }], "un set sans égalité");
  assert.deepEqual(casesGagnees({ jour: 4, cases: {} }, r, { matchs: 2 }), []);
  assert.deepEqual(casesGagnees({ jour: 4, cases: {} }, r, { matchs: 3 }), [{ num: 4, via: "jour" }]);
  assert.deepEqual(casesGagnees({ jour: 24, cases: {} }, resultatAvent(match([PERD, PERD, PERD]), "perenoel")), [{ num: 24, via: "jour" }], "le Père Noël : l'affronter suffit");
  assert.deepEqual(casesGagnees({ jour: 1, cases: {} }, { ...r, abandon: true }), [], "un abandon ne compte pas");
});

test("le rattrapage : battre le gardien en un set de 7, deux par jour, jusqu'au 31", () => {
  const sept = c => match(c, FORMAT_GARDIEN);
  const gagne7 = sept(Array(7).fill(GAGNE));
  const r = o => resultatAvent(gagne7, "neige", { rattrapage: 3, ...o });
  assert.deepEqual(casesGagnees({ jour: 10, cases: { 10: {} } }, r()), [{ num: 3, via: "rattrapage" }]);
  assert.deepEqual(casesGagnees({ jour: 10, cases: { 10: {} } }, resultatAvent(gagne7, "renne", { rattrapage: 3 })), [], "pas le bon gardien");
  assert.deepEqual(casesGagnees({ jour: 10, cases: { 10: {} } }, resultatAvent(sept(Array(7).fill(PERD)), "neige", { rattrapage: 3 })), [], "perdu");
  assert.deepEqual(casesGagnees({ jour: 10, cases: { 10: {} }, rattrapagesDuJour: 2 }, r()), [], "déjà deux rattrapages aujourd'hui");
  assert.deepEqual(casesGagnees({ jour: 31, cases: {} }, r()), [{ num: 3, via: "rattrapage" }], "le 31 : encore");
  assert.deepEqual(casesGagnees({ jour: 10, cases: { 10: {} } }, resultatAvent(match(Array(3).fill(GAGNE)), "neige", { rattrapage: 3 })), [], "pas le format du gardien");
  // le jour même, le match de rattrapage peut aussi réussir le défi du jour
  assert.deepEqual(casesGagnees({ jour: 12, cases: {} }, resultatAvent(gagne7, "renne", { rattrapage: 9 })), [{ num: 12, via: "jour" }, { num: 9, via: "rattrapage" }]);
});

test("le compteur des matchs du jour", () => {
  let c = compterMatchDuJour(null, "2026-12-03");
  c = compterMatchDuJour(c, "2026-12-03");
  assert.deepEqual(c, { date: "2026-12-03", matchs: 2 });
  assert.deepEqual(compterMatchDuJour(c, "2026-12-04"), { date: "2026-12-04", matchs: 1 });
});
