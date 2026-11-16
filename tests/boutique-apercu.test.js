import { test } from "node:test";
import assert from "node:assert/strict";
import { apercu } from "../app/js/ecran-boutique.js";
import { avatarSVG } from "../app/js/avatar.js";
import { profilParDefaut } from "../app/js/profil.js";

// (16 novembre, remarque du porteur du projet : dans la boutique, les gants de couleur montraient le motif qu'il portait, vache)
test("l'aperçu d'un gant de couleur le montre uni, sans le motif qu'on porte ; un motif garde la couleur de son gant", () => {
  const av = { ...profilParDefaut().av, gant: "noir", gantMotif: "vache" }, n = s => s.replace(/av\d+/g, "av");
  assert.equal(n(apercu({ categorie: "avatar", type: "gant", cle: "rose" }, av)), n(avatarSVG({ ...av, gant: "rose", gantMotif: "uni" })));
  assert.equal(n(apercu({ categorie: "avatar", type: "gantMotif", cle: "damier" }, av)), n(avatarSVG({ ...av, gantMotif: "damier" })));
});
