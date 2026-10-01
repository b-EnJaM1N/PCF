import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { texteJetons, bonusDuJour, texteSerie } from "../app/js/jetons-logique.js";

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
