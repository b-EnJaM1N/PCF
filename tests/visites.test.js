// Le compteur de visites : l'origine, et une seule fois par jour (jamais sur la version de test).
import { test } from "node:test";
import assert from "node:assert/strict";
import { origineVisite, aCompter } from "../app/js/visites.js";

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
