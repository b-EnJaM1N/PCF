import { test } from "node:test";
import assert from "node:assert/strict";
import { OUVERTES, ouvert, versionDeTest } from "../app/js/nouveautes.js";

test("les nouveautés : toutes sur la version de test, seulement les ouvertes sur la version officielle", () => {
  const officielle = { pathname: "/", hostname: "handslam.fr" }, test_ = { pathname: "/preview/", hostname: "handslam.fr" };
  assert.ok(versionDeTest(test_) && !versionDeTest(officielle));
  for (const nom of ["serie", "fantome", "replay", "hymne", "club"]) assert.ok(ouvert(nom, test_), nom);
  assert.ok(ouvert("serie", officielle), "la série de jours est ouverte à tous (10 novembre)");
  assert.ok(ouvert("effets", officielle), "les effets du match sont ouverts à tous (13 novembre)");
  for (const nom of ["fantome", "replay", "hymne", "club", "fil", "poules", "avis", "fiche", "dossard"]) assert.equal(ouvert(nom, officielle), OUVERTES.has(nom), nom);
});

test("la carte « Ton avis ? » : une seule fois, à partir du 5e match, si l'avis n'est pas déjà donné", async () => {
  const { proposerAvis } = await import("../app/js/nouveautes.js");
  assert.equal(proposerAvis({ matchs: 4 }), false);
  assert.equal(proposerAvis({ matchs: 5 }), true);
  assert.equal(proposerAvis({ matchs: 9, dejaProposee: true }), false);
  assert.equal(proposerAvis({ matchs: 9, dejaDonne: true }), false);
});

test("13 novembre : le fantôme, le fil, les poules, la carte « Ton avis ? » et la fiche ouverts à tous ; le Dossard 1 reste en test", () => {
  const officielle = { pathname: "/", hostname: "handslam.fr" };
  for (const nom of ["serie", "fantome", "fil", "poules", "avis", "fiche"]) assert.ok(ouvert(nom, officielle), nom);
  for (const nom of ["replay", "hymne", "club"]) assert.ok(!ouvert(nom, officielle), nom);
});

test("14 novembre : le Dossard 1 (et le gant du FIAC Club) et les invitations ouverts à tous, puis la page du cercle rangée", () => {
  const officielle = { pathname: "/", hostname: "handslam.fr" };
  for (const nom of ["dossard", "invitations", "classementCercle", "pageCercle", "records"]) assert.ok(ouvert(nom, officielle), nom);
});
