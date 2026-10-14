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

test("mon résultat dans un tournoi terminé : place et gain, comme le serveur les verse", async () => {
  const { monResultat, gainsSng, gainDuel, cagnotteVersee } = await import("../app/js/jetons-logique.js");
  const { dotations } = await import("../app/js/programmes-logique.js");
  const J = id => ({ id }), M = (tour, a, b, v) => ({ tour, fin: "score", j0: J(a), j1: J(b), vainqueur: v });
  const huit = ["moi", "b1", "b2", "b3", "b4", "b5", "b6", "b7"].map(J);
  const matchs = [M(1, "moi", "b2", "moi"), M(1, "b1", "b3", "b1"), M(1, "b4", "b5", "b4"), M(1, "b6", "b7", "b6"),
    M(2, "moi", "b4", "moi"), M(2, "b1", "b6", "b1"), M(3, "moi", "b1", "b1")];
  const sng = { phase: "termine", mode: "direct", mise: 100, inscrits: 8, bots: 7, nb_tours: 3, vainqueur: J("b1"), joueurs: huit, matchs };
  assert.deepEqual(monResultat(sng, "moi"), { place: "2e", rang: 2, gain: gainsSng(100, 8)[1], payees: 2 });
  assert.deepEqual(monResultat({ ...sng, vainqueur: J("moi"), matchs: [...matchs.slice(0, 6), M(3, "moi", "b1", "moi")] }, "moi").gain, gainsSng(100, 8)[0]);
  // éliminé en demi-finale : 3e-4e, hors des 2 places payées
  const demi = [...matchs.slice(0, 4), M(2, "moi", "b4", "b4"), M(2, "b1", "b6", "b1"), M(3, "b4", "b1", "b1")];
  assert.deepEqual(monResultat({ ...sng, matchs: demi }, "moi"), { place: "3e-4e", rang: 3, gain: 0, payees: 2 });
  // sans mise : la place seulement
  assert.deepEqual(monResultat({ ...sng, mise: 0, matchs: demi }, "moi"), { place: "3e-4e", rang: 3, gain: null });
  // heads-up à 50 : le gagnant prend 1,8 fois la mise
  const hu = { phase: "termine", mode: "direct", mise: 50, inscrits: 2, bots: 1, nb_tours: 1, vainqueur: J("moi"), joueurs: [J("moi"), J("b")], matchs: [M(1, "moi", "b", "moi")] };
  assert.equal(monResultat(hu, "moi").gain, gainDuel(50));
  // freeroll : cagnotte offerte selon les humains ; 3e-4e se partagent leurs deux parts
  const fr = { ...sng, mise: 0, freeroll: true, inscrits: 8, bots: 5, matchs: demi };
  assert.equal(cagnotteVersee(fr), 1150);
  assert.equal(monResultat(fr, "moi").gain, 0, "8 joueurs : 2 premiers payés");
  // pas fini, championnat, ou pas inscrit : rien
  assert.equal(monResultat({ ...sng, phase: "en_cours" }, "moi"), null);
  assert.equal(monResultat(sng, "inconnu"), null);
  assert.ok(dotations(1000, 8).length === 2);
});
