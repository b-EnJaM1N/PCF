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
  // (24 novembre, choix du porteur du projet : l'hymne, le club et le cœur ouverts à tous pour le lancement)
  for (const nom of ["hymne", "club", "coeur"]) assert.ok(ouvert(nom, officielle), nom);
  assert.ok(ouvert("replay", officielle), "le replay, ouvert à tous le 18 novembre");
});

test("14 novembre : le Dossard 1 (et le gant du FIAC Club) et les invitations ouverts à tous, puis la page du cercle rangée", () => {
  const officielle = { pathname: "/", hostname: "handslam.fr" };
  for (const nom of ["dossard", "invitations", "classementCercle", "pageCercle", "records"]) assert.ok(ouvert(nom, officielle), nom);
});

test("Noël : sur la version de test toujours ; sur handslam.fr du 1er décembre au 6 janvier (24 novembre)", async () => {
  const { noelActif } = await import("../app/js/noel.js");
  const officielle = { pathname: "/", hostname: "handslam.fr" }, test = { pathname: "/preview/", hostname: "handslam.fr" };
  assert.equal(noelActif(new Date(2026, 10, 30), officielle), false, "30 novembre : pas encore");
  assert.equal(noelActif(new Date(2026, 11, 1), officielle), true, "1er décembre");
  assert.equal(noelActif(new Date(2027, 0, 6), officielle), true, "6 janvier : encore");
  assert.equal(noelActif(new Date(2027, 0, 7), officielle), false, "7 janvier : fini");
  assert.equal(noelActif(new Date(2026, 6, 14), test), true, "la version de test : toujours");
});

test("Noël : le court rouge seulement les 24 et 25 décembre (24 novembre au soir)", async () => {
  const { noelGrandJour } = await import("../app/js/noel.js");
  const officielle = { pathname: "/", hostname: "handslam.fr" };
  assert.equal(noelGrandJour(new Date(2026, 11, 23), officielle), false);
  assert.equal(noelGrandJour(new Date(2026, 11, 24), officielle), true);
  assert.equal(noelGrandJour(new Date(2026, 11, 25), officielle), true);
  assert.equal(noelGrandJour(new Date(2026, 11, 26), officielle), false);
});
