// L'arbitre demande le calme de plusieurs façons, jamais deux fois de suite la même ; « Merci » à la reprise si la phrase ne le dit pas.
import { test } from "node:test";
import assert from "node:assert/strict";
import { choisirSilence, SILENCES_ARBITRE, MERCIS_ARBITRE } from "../app/js/annonces.js";
import { CATALOGUE } from "../app/js/voix/script.js";
import { ditAVoixHaute } from "../app/js/voix/lecteur.js";

test("les phrases de l'arbitre existent et sont dites à voix haute", () => {
  for (const id of [...SILENCES_ARBITRE, ...MERCIS_ARBITRE, "arbitre_huees_01"]) {
    assert.ok(CATALOGUE.get(id), id);
    assert.ok(ditAVoixHaute(CATALOGUE.get(id)), id);
  }
});

test("pas deux fois de suite la même ; sans enregistrements, l'ancienne phrase", () => {
  const tout = () => true;
  for (let i = 0; i < 50; i++) assert.notEqual(choisirSilence(tout, "arbitre_silence_02").id, "arbitre_silence_02");
  assert.deepEqual(choisirSilence(id => id === "arbitre_silence_01", "arbitre_silence_01"), { id: "arbitre_silence_01", merci: true });
  assert.equal(choisirSilence(() => false).id, "arbitre_silence_01");
  assert.equal(choisirSilence(id => id === "arbitre_silence_03").merci, false);   // « S'il vous plaît… Merci. »
});
