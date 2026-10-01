import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PALIERS, palier, nouveautes, conseil, PREMIER_MATCH } from "../app/js/decouverte.js";
import { botParId } from "../app/js/bots.js";

test("le menu s'ouvre au fil des matchs : 1 (Partie rapide), 3 (jetons, défis, boutique), 5 (tournois)", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 40].map(n => palier(n)), [0, 1, 1, 3, 3, 5, 5]);
  assert.equal(palier(0, true), 5, "« Tout afficher »");
  assert.equal(palier(), 0, "nouveau joueur");
});

test("les nouveautés s'annoncent une seule fois, au bon match", () => {
  assert.equal(nouveautes(0, 1).length, 1);
  assert.match(nouveautes(0, 1)[0], /Partie rapide/);
  assert.deepEqual(nouveautes(1, 2), []);
  assert.match(nouveautes(2, 3)[0], /boutique/);
  assert.match(nouveautes(4, 5)[0], /tournois/);
  assert.equal(nouveautes(0, 5).length, 3);
  assert.deepEqual(nouveautes(12, 13), []);
});

test("le premier match : contre Bambi, un set de 7 points, avec des conseils", () => {
  assert.equal(botParId(PREMIER_MATCH.bot).nom, "Bambi");
  assert.deepEqual([PREMIER_MATCH.pointsParSet, PREMIER_MATCH.setsGagnants], [7, 1]);
  assert.match(conseil(0, null), /5 secondes/);
  assert.match(conseil(1, 0), /Point pour toi/);
  assert.match(conseil(2, 1), /Point pour Bambi/);
  assert.match(conseil(3, null), /Égalité/);
  assert.match(conseil(6, 0), /historique/);
  assert.match(conseil(12, 1), /Varie/);
});

test("chaque palier masque bien ses éléments du menu (index.html et style.css)", () => {
  const html = readFileSync(new URL("../app/index.html", import.meta.url), "utf8");
  const css = readFileSync(new URL("../app/css/style.css", import.meta.url), "utf8");
  for (const p of PALIERS) assert.ok(html.includes(`data-palier="${p.matchs}"`), `éléments du palier ${p.matchs}`);
  for (const [n, caches] of [[0, [1, 3, 5]], [1, [3, 5]], [3, [5]]])
    for (const c of caches) assert.ok(css.includes(`body[data-decouverte="${n}"] [data-palier="${c}"]`), `palier ${c} caché au niveau ${n}`);
});
