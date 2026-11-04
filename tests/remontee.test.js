// La remontée en cours de set : mené de 4 points, je reviens à un point ; Roland ou Monique le relèvent.
import { test } from "node:test";
import assert from "node:assert/strict";
import { nouveauMatch, jouerCoup } from "../app/js/regles.js";
import { nouvelEtatAnnonces, annoncerCoup } from "../app/js/annonces.js";

test("de 1-5 à 6-5 : un commentaire de remontée (dès 4-5, ou un peu après si un autre commentaire vient d'être dit)", () => {
  let vu = 0, graine = 11;
  const rng = () => (graine = (graine * 16807) % 2147483647) / 2147483647;   // (hasard fixe : le test donne toujours le même résultat)
  for (let essai = 0; essai < 20; essai++) {
    const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 1 }), etat = nouvelEtatAnnonces({});
    const ids = [];
    // (0 : Pierre, 1 : Ciseaux, 2 : Feuille) je gagne le 1er point, je perds les 5 suivants (1-5), puis j'en gagne 5 (6-5)
    for (const [a, b] of [[0, 1], [0, 2], [0, 2], [0, 2], [0, 2], [0, 2], [2, 0], [2, 0], [2, 0], [2, 0], [2, 0]]) {
      const evt = jouerCoup(m, a, b, [false, false]);
      const l = annoncerCoup(m, evt, etat, { recents: [], auto: false, smash: [false, false] }, rng).lignes.map(x => x.id);
      if (m.points[0] >= 4) ids.push(...l);
    }
    assert.deepEqual(m.points, [6, 5]);
    if (ids.some(id => id.includes("remontee"))) vu++;
  }
  assert.ok(vu >= 10, `remontée commentée ${vu} fois sur 20`);
});
