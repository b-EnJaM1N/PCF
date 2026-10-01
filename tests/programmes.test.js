import { test } from "node:test";
import assert from "node:assert/strict";
import { PROGRAMME, texteDepart, gainsCagnotte, enJeu, aSignaler } from "../app/js/programmes-logique.js";

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

test("les gains : 50 / 30 / 10 / 10 % de la cagnotte", () => {
  assert.deepEqual(gainsCagnotte(5000), [2500, 1500, 500]);
  assert.deepEqual(gainsCagnotte(540), [270, 162, 54]);
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
