import { test } from "node:test";
import assert from "node:assert/strict";
import { styleDuBot, rencontre, compterPoignee, styleValide, STYLES } from "../app/js/poignee.js";
import { BOTS } from "../app/js/bots.js";
import { CATALOGUE } from "../app/js/voix/script.js";
import { profilParDefaut, normaliserProfil } from "../app/js/profil.js";

test("chaque bot serre la main selon son caractère", () => {
  for (const b of BOTS) assert.ok(STYLES[styleDuBot(b.id, "normale", () => 0.5)], b.id);
  assert.equal(styleDuBot("rocky", "froide"), "franche");
  assert.equal(styleDuBot("rancune", "franche"), "froide");
  assert.equal(styleDuBot("miroir", "legere"), "legere", "Miroir copie ton style");
});

test("la rencontre de deux styles : l'animation du plus froid, et la bonne réplique", () => {
  assert.deepEqual(rencontre("franche", "franche"), { animation: "franche", ligne: "arbitre_poignee_franche_01" });
  assert.deepEqual(rencontre("normale", "franche"), { animation: "normale", ligne: "arbitre_poignee_de_main_01" });
  assert.deepEqual(rencontre("franche", "legere"), { animation: "legere", ligne: "arbitre_poignee_legere_01" });
  assert.deepEqual(rencontre("froide", "legere"), { animation: "froide", ligne: "arbitre_poignee_legere_01" }, "plus de commentaire de Monique");
  assert.deepEqual(rencontre("franche", "froide"), { animation: "froide", ligne: "arbitre_poignee_legere_01" });
  for (const a of Object.keys(STYLES)) for (const b of Object.keys(STYLES)) assert.ok(CATALOGUE.has(rencontre(a, b).ligne), `${a}/${b}`);
});

test("style habituel et compte des poignées de main dans la fiche", () => {
  assert.equal(profilParDefaut().poignee, "normale");
  assert.equal(normaliserProfil({ poignee: "molle" }).poignee, "normale");
  assert.equal(styleValide(undefined), "normale");
  const P = normaliserProfil({});
  compterPoignee(P, "froide"); compterPoignee(P, "froide"); compterPoignee(P, "franche");
  assert.deepEqual(P.poignees, { franche: 1, normale: 0, legere: 0, froide: 2 });
});
