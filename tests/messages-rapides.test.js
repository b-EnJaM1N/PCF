import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MESSAGES, LONGUEUR_MAX, messagesPossibles, momentApres, texteMessage } from "../app/js/messages-rapides.js";

test("chaque message tient dans une bulle et chaque identifiant est unique à son moment", () => {
  for (const [moment, m] of Object.entries(MESSAGES)) {
    const ids = [...m.tous, ...m.amis].map(([id]) => id);
    assert.equal(new Set(ids).size, ids.length, moment);
    for (const [id, texte] of [...m.tous, ...m.amis]) assert.ok(texte.length <= LONGUEUR_MAX, `${id} : ${texte.length} caractères`);
  }
});

test("les mêmes messages dans l'appli et sur le serveur", () => {
  const sql = readFileSync(new URL("../supabase/etape-22-messages-rapides.sql", import.meta.url), "utf8");
  for (const [moment, m] of Object.entries(MESSAGES)) {
    for (const [registre, amis] of [["tous", false], ["amis", true]]) {
      const ligne = sql.match(new RegExp(`p_moment = '${moment}' and ${amis ? "" : "not "}p_amis then array\\[([^\\]]*)\\]`));
      assert.ok(ligne, `${moment} ${registre}`);
      assert.deepEqual([...ligne[1].matchAll(/'([a-z_]+)'/g)].map(x => x[1]), m[registre].map(([id]) => id), `${moment} ${registre}`);
    }
  }
});

test("le chambrage n'est proposé qu'entre amis", () => {
  assert.ok(messagesPossibles("avant").every(x => !x.amis));
  assert.ok(messagesPossibles("avant", true).some(x => x.amis && x.texte === "Tu vas finir en slip."));
  assert.deepEqual(messagesPossibles("inconnu"), []);
});

test("après le match, le vainqueur et le vaincu n'ont pas les mêmes messages", () => {
  assert.equal(momentApres(true), "vainqueur");
  assert.equal(momentApres(false), "vaincu");
  assert.equal(texteMessage("vainqueur", "deculottee"), "Déculottée !");
  assert.equal(texteMessage("vaincu", "deculottee"), null);
  assert.equal(texteMessage("vaincu", "chatoune"), "Quelle chatoune !");
});
