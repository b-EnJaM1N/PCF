// La version de lancement : ce qui a besoin de monde est caché, sans rien supprimer.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LANCEMENT, misesVisibles, taillesVisibles } from "../app/js/lancement.js";
import { MISES } from "../app/js/jetons-logique.js";
import { TAILLES_SNG } from "../app/js/tournoi-logique.js";

test("version de lancement : mises jusqu'à 100, heads-up et Sit & Go à 8", () => {
  assert.equal(LANCEMENT.actif, true);
  assert.deepEqual(misesVisibles(MISES), MISES.filter(m => m <= 100));
  assert.deepEqual(taillesVisibles(TAILLES_SNG), [2, 8]);
});

test("version de lancement : Grand Chelem, classement du mois, divisions et grosses mises en Sit & Go cachés ; toutes les mises entre amis", () => {
  const html = readFileSync(new URL("../app/index.html", import.meta.url), "utf8"), css = readFileSync(new URL("../app/css/style.css", import.meta.url), "utf8");
  assert.match(css, /body\.lancement \.cache-lancement/);
  for (const id of ["progCard", "classementCard", "divCard"]) assert.match(html, new RegExp(`class="[^"]*cache-lancement[^"]*" id="${id}"`), id);
  for (const v of [200, 500, 1000]) assert.equal((html.match(new RegExp(`data-v="${v}" class="cache-lancement"`, "g")) || []).length, 1, `mise ${v} : cachée en Sit & Go seulement`);
  const defi = html.slice(html.indexOf('id="duelMise"'), html.indexOf("</div>", html.indexOf('id="duelMise"')));
  for (const v of [200, 500, 1000]) assert.match(defi, new RegExp(`data-v="${v}">`), `mise ${v} proposée entre amis`);
});
