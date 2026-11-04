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

test("« Silence, s'il vous plaît » reste la plus fréquente (environ une fois sur trois)", () => {
  let dernier = null, n = 0, autres = {};
  let graine = 7; const rng = () => (graine = (graine * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let i = 0; i < 3000; i++) {
    dernier = choisirSilence(() => true, dernier, rng).id;
    if (dernier === "arbitre_silence_01") n++; else autres[dernier] = (autres[dernier] || 0) + 1;
  }
  assert.ok(n > 800 && n < 1100, `${n} fois sur 3000`);
  for (const k of Object.values(autres)) assert.ok(k < n / 2);
});
