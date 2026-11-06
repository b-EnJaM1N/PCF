import { test } from "node:test";
import assert from "node:assert/strict";
import { modeleFantome, coupFantome, fantomeVisible, MATCHS_MIN } from "../app/js/fantome.js";
import { contre, gagnantCoup } from "../app/js/regles.js";
import { rngFixe } from "./outils.js";

// Un joueur aux manies nettes : il ouvre avec Pierre ; après un point gagné, il garde son signe ; après un point perdu, il joue
// ce qui bat le signe d'en face ; après une égalité, au hasard.
function joueurManies(rng, n = 25) {
  const coups = [];
  for (let i = 0; i < n; i++) {
    const d = coups[i - 1];
    const b = !d ? 0 : d.g === 1 ? d.b : d.g === 0 ? contre(d.a) : Math.floor(rng() * 3);
    const a = Math.floor(rng() * 3), w = gagnantCoup(b, a);
    coups.push({ b, a, g: w === null ? null : w === 0 ? 1 : 0 });
  }
  return coups;
}

test("le fantôme : pas assez de matchs, pas de fantôme", () => {
  assert.equal(modeleFantome([]), null);
  assert.equal(modeleFantome(null), null);
  const rng = rngFixe(3);
  assert.equal(modeleFantome(Array.from({ length: MATCHS_MIN - 1 }, () => joueurManies(rng))), null, "trop peu de matchs");
  assert.equal(modeleFantome(Array.from({ length: MATCHS_MIN }, () => joueurManies(rng, 5))), null, "trop peu de coups");
});

test("le fantôme reprend les manies du joueur", () => {
  const rng = rngFixe(7);
  const m = modeleFantome(Array.from({ length: 12 }, () => joueurManies(rng)));
  assert.ok(m);
  assert.equal(m.favori !== null, true);
  // L'ouverture : Pierre, la plupart du temps.
  let pierre = 0;
  for (let i = 0; i < 400; i++) if (coupFantome(m, [], rng) === 0) pierre++;
  assert.ok(pierre > 300, `ouvre avec Pierre (${pierre} sur 400)`);
  // Après un point gagné : il garde son signe ; après un point perdu : ce qui bat le signe d'en face.
  let garde = 0, bat = 0;
  for (let i = 0; i < 400; i++) {
    if (coupFantome(m, [{ moi: 1, adv: 2, res: "g" }], rng) === 1) garde++;
    if (coupFantome(m, [{ moi: 1, adv: 0, res: "p" }], rng) === contre(0)) bat++;
  }
  assert.ok(garde > 300, `garde son signe après un point gagné (${garde} sur 400)`);
  assert.ok(bat > 300, `joue ce qui bat le signe d'en face après un point perdu (${bat} sur 400)`);
});

test("le fantôme : visible seulement sur la version de test", () => {
  assert.equal(fantomeVisible({ pathname: "/preview/", hostname: "handslam.fr" }), true);
  assert.equal(fantomeVisible({ pathname: "/", hostname: "handslam.fr" }), false);
  assert.equal(fantomeVisible({ pathname: "/", hostname: "localhost" }), true);
});
