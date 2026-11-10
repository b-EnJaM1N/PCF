import { test } from "node:test";
import assert from "node:assert/strict";
import { avatarSVG, MOTIF_COULEURS, MOTIFS_COLORABLES, MOTIFS_GANT } from "../app/js/avatar.js";
import { profilParDefaut } from "../app/js/profil.js";

test("la couleur du motif du gant : par défaut celle du poignet, sinon celle choisie", () => {
  const av = { ...profilParDefaut().av, gant: "blanc", poignet: "rouge", gantMotif: "rayures" };
  assert.equal(av.gantMotifCouleur, "defaut");
  assert.match(avatarSVG(av), /#D63A2F/, "par défaut : la couleur du poignet");
  const bleu = avatarSVG({ ...av, gantMotifCouleur: "bleu" });
  assert.match(bleu, /fill="#2C6FD1"/, "la couleur choisie");
  assert.match(avatarSVG({ ...av, gantMotif: "signe_feuille" }), /#E9C046/, "les signes : en or par défaut");
  assert.match(avatarSVG({ ...av, gantMotif: "signe_feuille", gantMotifCouleur: "violet" }), /#9B6BD6/, "les signes : dans la couleur choisie");
  for (const m of MOTIFS_COLORABLES) assert.ok(MOTIFS_GANT[m], m);
  assert.ok(Object.keys(MOTIF_COULEURS).length >= 10);
});
