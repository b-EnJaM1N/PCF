import test from "node:test";
import assert from "node:assert/strict";
import { etatReactions, nomArticle, REACTIONS } from "../app/js/revue-reactions.js";

test("réactions des Cahiers : les compteurs du serveur, le nom de l'article", () => {
  assert.deepEqual(REACTIONS.map(r => r[1]), ["👍", "👎", "😂", "🔥", "👏"]);
  const e = etatReactions([{ cle: "pouce_haut", nombre: "3", mien: true }, { cle: "feu", nombre: 1, mien: false }, { cle: "inconnu", nombre: 9 }]);
  assert.deepEqual(e.pouce_haut, { n: 3, mien: true });
  assert.deepEqual(e.pouce_bas, { n: 0, mien: false });
  assert.equal(e.feu.n, 1); assert.equal(e.inconnu, undefined);
  assert.equal(nomArticle("https://handslam.fr/revue-humain-trop-humain.html"), "revue-humain-trop-humain");
  assert.equal(nomArticle("/preview/revue-modele.html"), "revue-modele");
});
