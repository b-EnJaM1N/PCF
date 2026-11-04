// Le pseudo brodé sur le poignet : seulement pour les joueurs prévus, jamais sur la main nue.
import { test } from "node:test";
import assert from "node:assert/strict";
import { avatarSVG } from "../app/js/avatar.js";
import { clePseudo } from "../app/js/chants-perso.js";
import { BRODERIES } from "../app/js/gants-brodes.js";

const av = { fond: "violet", gant: "blanc", gantMotif: "zebre", poignet: "bleu", symbole: "pierre" };
test("le gant du Chiromancien porte son pseudo brodé, sur un poignet élargi", () => {
  const cle = clePseudo("Le Chiromancien", 6047);
  assert.ok(BRODERIES[cle]);
  const s = avatarSVG({ ...av, brode: cle });
  assert.match(s, /or"/); assert.match(s, /<rect x="31" y="70" width="38" height="20"/);
});
test("les autres joueurs et la main nue : rien de brodé", () => {
  assert.doesNotMatch(avatarSVG({ ...av, brode: clePseudo("Benji", 12) }), /width="38" height="20"/);
  assert.doesNotMatch(avatarSVG(av), /width="38" height="20"/);
  assert.doesNotMatch(avatarSVG({ ...av, gant: "nu", brode: clePseudo("Le Chiromancien", 6047) }), /stop-color="#FFE9A3"/);
});
