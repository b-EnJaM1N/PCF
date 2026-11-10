import { test } from "node:test";
import assert from "node:assert/strict";
import { OUVERTES, ouvert, versionDeTest } from "../app/js/nouveautes.js";

test("les nouveautés : toutes sur la version de test, seulement les ouvertes sur la version officielle", () => {
  const officielle = { pathname: "/", hostname: "handslam.fr" }, test_ = { pathname: "/preview/", hostname: "handslam.fr" };
  assert.ok(versionDeTest(test_) && !versionDeTest(officielle));
  for (const nom of ["serie", "fantome", "replay", "hymne", "club"]) assert.ok(ouvert(nom, test_), nom);
  assert.ok(ouvert("serie", officielle), "la série de jours est ouverte à tous (10 novembre)");
  for (const nom of ["fantome", "replay", "hymne", "club"]) assert.equal(ouvert(nom, officielle), OUVERTES.has(nom), nom);
});
