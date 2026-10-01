import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { texteJetons, bonusDuJour, texteSerie, serieCourte } from "../app/js/jetons-logique.js";

test("affichage des jetons", () => {
  assert.equal(texteJetons(1), "1 jeton");
  assert.equal(texteJetons(0), "0 jeton");
  assert.equal(texteJetons(1250), "1 250 jetons");
  assert.equal(texteJetons(-5), "0 jeton");
});

test("le bonus quotidien grimpe de 50 à 200, comme sur le serveur", () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 30].map(bonusDuJour), [50, 75, 100, 125, 150, 175, 200, 200, 200]);
  const sql = readFileSync(new URL("../supabase/etape-13-jetons.sql", import.meta.url), "utf8");
  assert.match(sql, /least\(200, 25 \+ 25 \* greatest\(serie, 1\)\)/, "même formule côté serveur");
});

test("la ligne de la série", () => {
  assert.match(texteSerie({ bonus_dispo: true, serie: 0 }), /200 jetons/);
  assert.equal(texteSerie({ bonus_dispo: true, serie: 3 }), "Série : 3 jours d'affilée. Ne la perds pas !");
  assert.equal(texteSerie({ bonus_dispo: false, serie: 1, bonus_montant: 75 }), "Série : 1 jour d'affilée · demain : +75");
});

test("la série en version courte", () => {
  assert.equal(serieCourte({ serie: 3 }), "🔥 3 j");
  assert.equal(serieCourte({ serie: 0 }), "");
  assert.equal(serieCourte(null), "");
});

test("les mises : duel à 1,8 fois la mise, Sit & Go partagé façon poker (65 / 35) après 10 %", async () => {
  const { MISES, gainDuel, gainsSng, texteMise } = await import("../app/js/jetons-logique.js");
  assert.deepEqual(MISES, [0, 50, 100, 200, 500, 1000]);
  assert.deepEqual([50, 100, 200, 500, 1000].map(gainDuel), [90, 180, 360, 900, 1800]);
  assert.deepEqual(gainsSng(50), [234, 126]);
  assert.deepEqual(gainsSng(1000), [4680, 2520]);
  assert.equal(texteMise(0), "Sans mise");
  assert.equal(texteMise(1000), "1 000 jetons");
  const sql = readFileSync(new URL("../supabase/etape-14-mises.sql", import.meta.url), "utf8");
  assert.match(sql, /array\[50, 100, 200, 500, 1000\]/, "mêmes mises côté serveur");
  assert.match(sql, /select 0\.10/, "même commission côté serveur");
});
