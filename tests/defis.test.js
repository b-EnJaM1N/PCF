import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DEFIS, jourDeParis, journee, journeeVide, suivreMatch, suivrePoignee, etatDefi } from "../app/js/defis-logique.js";

test("chaque défi du serveur a son texte dans l'appli", () => {
  const sql = readFileSync(new URL("../supabase/etape-15-freeroll.sql", import.meta.url), "utf8");
  const ids = [...sql.match(/values \('gagner_3'[\s\S]*?\n\$\$/)[0].matchAll(/\('([a-z_0-9]+)', \d+\)/g)].map(m => m[1]);
  assert.equal(ids.length, 9);
  for (const id of ids) assert.ok(DEFIS[id], id);
});

test("le jour est compté à l'heure de Paris", () => {
  assert.equal(jourDeParis(new Date("2026-10-01T21:59:00Z")), "2026-10-01");
  assert.equal(jourDeParis(new Date("2026-10-01T22:01:00Z")), "2026-10-02", "minuit à Paris (heure d'été)");
});

test("la journée repart à zéro le lendemain", () => {
  assert.equal(journee({ jour: "2026-10-01", gagnes: 2 }, "2026-10-01").gagnes, 2);
  assert.equal(journee({ jour: "2026-10-01", gagnes: 2 }, "2026-10-02").gagnes, 0);
});

test("suivi des matchs et des poignées de main", () => {
  const e = journeeVide("j");
  suivreMatch(e, { gagne: true, coups: 30, ballesSauvees: 1, meilleureSerie: 5, scoresSets: [[11, 3], [9, 11]], pointsParSet: 11, duel: false, eloBot: 1350 });
  suivreMatch(e, { gagne: false, coups: 0 });   // match sans coup : ne compte pas
  suivreMatch(e, { gagne: false, coups: 12, scoresSets: [[3, 1]], pointsParSet: 3, duel: true, termineAuScore: true });
  assert.deepEqual([e.joues, e.gagnes, e.ballesSauvees, e.series4, e.setsNets, e.botsForts, e.duels], [2, 1, 1, 1, 1, 1, 1]);
  suivrePoignee(e, "franche"); suivrePoignee(e, "froide");
  assert.equal(e.franches, 1);
});

test("état d'un défi : progression, prêt à encaisser, déjà fait", () => {
  const e = { ...journeeVide("j"), gagnes: 2 };
  assert.deepEqual(etatDefi({ id: "gagner_3", fait: false }, e), { texte: "Gagne 3 matchs", fait: false, reussi: false, pret: false, progression: "2/3" });
  e.gagnes = 4;
  assert.equal(etatDefi({ id: "gagner_3", fait: false }, e).pret, true);
  assert.equal(etatDefi({ id: "gagner_3", fait: false }, e).reussi, true, "réussi même pas encore encaissé : il compte dans « 1/3 »");
  assert.equal(etatDefi({ id: "gagner_3", fait: true }, e).pret, false);
  assert.equal(etatDefi({ id: "duel_en_ligne", fait: false }, journeeVide("j")).pret, true, "vérifié par le serveur : on peut tenter d'encaisser");
  assert.equal(etatDefi({ id: "duel_en_ligne", fait: false }, journeeVide("j")).reussi, false, "mais il n'est pas compté comme réussi");
});
