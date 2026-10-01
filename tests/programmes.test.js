import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PROGRAMME, texteDepart, GRILLES, placesPayees, dotations, texteDotations, enJeu, aSignaler } from "../app/js/programmes-logique.js";

test("le programme : Le Midi et L'Apéro à 100, Le Nocturne à 200, le Grand Chelem à 1 000 (5 000 garantis)", () => {
  assert.deepEqual(PROGRAMME.map(p => [p.cle, p.mise]), [["midi", 100], ["apero", 100], ["nocturne", 200], ["grand_chelem", 1000]]);
  assert.equal(PROGRAMME.find(p => p.cle === "grand_chelem").garantie, 5000);
});

test("le départ, en heure de Paris : aujourd'hui, demain ou le jour de la semaine", () => {
  const maintenant = Date.parse("2026-10-01T08:00:00Z");   // jeudi 1er octobre, 10 h à Paris
  assert.equal(texteDepart("2026-10-01T10:30:00Z", maintenant), "aujourd'hui à 12 h 30");
  assert.equal(texteDepart("2026-10-02T16:00:00Z", maintenant), "demain à 18 h");
  assert.equal(texteDepart("2026-10-04T19:00:00Z", maintenant), "dimanche à 21 h");
  assert.equal(texteDepart("2026-12-06T20:00:00Z", Date.parse("2026-12-05T12:00:00Z")), "demain à 21 h", "heure d'hiver");
});

test("dotations façon poker : 10 à 15 % des joueurs payés, en paliers", () => {
  assert.deepEqual([4, 26, 27, 53, 54, 106, 107, 214, 427, 5000].map(placesPayees), [2, 2, 4, 4, 8, 8, 16, 32, 64, 64]);
  for (const [p, g] of Object.entries(GRILLES)) {
    const total = g.reduce((s, x, k) => s + x * (k < 2 ? 1 : 2 ** (k - 1)), 0);
    assert.equal(total, 10000, `grille de ${p} places : 100 %`);
  }
  assert.deepEqual(dotations(5000, 4).map(d => d.montant), [3250, 1750]);
  assert.deepEqual(dotations(2700, 30).map(d => [d.places, d.nb, d.montant]), [["1er", 1, 1350], ["2e", 1, 675], ["3e-4e", 2, 337]]);
  assert.equal(texteDotations(2700, 30), "4 premiers payés · 1er : 1\u00a0350, 2e : 675, 3e-4e : 337");
});

test("le plus petit gain vaut au moins 1,5 fois l'entrée (cagnotte : entrées moins 10 %)", () => {
  for (let n = 4; n <= 2000; n++) {
    const d = dotations(Math.floor(n * 100 * 0.9), n);
    assert.ok(d.at(-1).montant >= 150 || (n < 8 && d.at(-1).montant >= 120), `${n} joueurs : ${d.at(-1).montant}`);
  }
});

test("la grille de l'appli est celle du serveur", () => {
  const sql = readFileSync(new URL("../supabase/etape-19-dotations.sql", import.meta.url), "utf8");
  for (const [p, g] of Object.entries(GRILLES)) {
    const ligne = p === "64" ? `else array[${g.join(", ")}]` : `when ${p} then array[${g.join(", ")}]`;
    assert.ok(sql.includes(ligne), `grille de ${p} places dans le SQL`);
  }
});

test("surveillance et alerte : inscrit près du départ, ou encore en lice", () => {
  const m = Date.parse("2026-10-01T10:00:00Z");
  const t = { inscrit: true, phase: "inscriptions", depart: "2026-10-01T10:02:00Z" };
  assert.equal(enJeu(t, m), true);
  assert.equal(enJeu({ ...t, depart: "2026-10-01T11:00:00Z" }, m), false);
  assert.equal(enJeu({ ...t, inscrit: false }, m), false);
  assert.equal(enJeu({ inscrit: true, phase: "en_cours", elimine: true }, m), false);
  assert.equal(aSignaler([{ ...t, depart: "2026-10-01T10:20:00Z", nom: "Le Midi" }], m).nom, "Le Midi");
  assert.equal(aSignaler([{ ...t, depart: "2026-10-01T12:00:00Z" }], m), null);
  assert.equal(aSignaler([{ inscrit: true, phase: "en_cours", elimine: false, nom: "L'Apéro" }], m).nom, "L'Apéro");
});
