// Le compteur de visites : l'origine, et une seule fois par jour (jamais sur la version de test).
import { test } from "node:test";
import assert from "node:assert/strict";
import { origineVisite, aCompter, veille, ecartJours, retoursParcours } from "../app/js/visites.js";

test("origine : appli Android, appli installée, site", () => {
  assert.equal(origineVisite({ referrer: "android-app://fr.handslam.app/" }), "android");
  assert.equal(origineVisite({ androidVu: true, standalone: true }), "android");
  assert.equal(origineVisite({ standalone: true }), "installee");
  assert.equal(origineVisite({ referrer: "https://www.google.com/" }), "site");
});

test("une seule fois par jour, et pas sur la version de test", () => {
  const ici = { chemin: "/", hote: "handslam.fr" };
  assert.equal(aCompter({ ...ici, dernierJour: null, jour: "2026-10-12" }), true);
  assert.equal(aCompter({ ...ici, dernierJour: "2026-10-12", jour: "2026-10-12" }), false);
  assert.equal(aCompter({ ...ici, dernierJour: "2026-10-11", jour: "2026-10-12" }), true);
  assert.equal(aCompter({ chemin: "/preview/", hote: "handslam.fr", dernierJour: null, jour: "2026-10-12" }), false);
  assert.equal(aCompter({ chemin: "/", hote: "localhost", dernierJour: null, jour: "2026-10-12" }), false);
});

test("la veille d'un jour (pour savoir si le joueur est revenu), y compris en changeant de mois ou d'année", () => {
  assert.equal(veille("2026-10-20"), "2026-10-19");
  assert.equal(veille("2026-11-01"), "2026-10-31");
  assert.equal(veille("2027-01-01"), "2026-12-31");
  assert.equal(veille("2028-03-01"), "2028-02-29");
});

test("le parcours des nouveaux : écart en jours, retour le lendemain, retour une semaine plus tard (une seule fois)", () => {
  assert.equal(ecartJours("2026-11-03", "2026-11-10"), 7);
  assert.equal(ecartJours("2026-10-31", "2026-11-01"), 1);
  assert.equal(ecartJours("2026-10-24", "2026-10-26"), 2);   // (passage à l'heure d'hiver)
  assert.deepEqual(retoursParcours({ arrivee: null, jour: "2026-11-04" }), []);
  assert.deepEqual(retoursParcours({ arrivee: "2026-11-03", jour: "2026-11-04" }), ["retour_1j"]);
  assert.deepEqual(retoursParcours({ arrivee: "2026-11-03", jour: "2026-11-05" }), []);
  assert.deepEqual(retoursParcours({ arrivee: "2026-11-03", jour: "2026-11-09" }), []);
  assert.deepEqual(retoursParcours({ arrivee: "2026-11-03", jour: "2026-11-10" }), ["retour_7j"]);
  assert.deepEqual(retoursParcours({ arrivee: "2026-11-03", jour: "2026-11-16" }), ["retour_7j"]);
  assert.deepEqual(retoursParcours({ arrivee: "2026-11-03", jour: "2026-11-17" }), []);
  assert.deepEqual(retoursParcours({ arrivee: "2026-11-03", jour: "2026-11-12", retour7Fait: true }), []);
});
