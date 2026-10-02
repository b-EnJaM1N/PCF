import { test } from "node:test";
import assert from "node:assert/strict";
import { LecteurVoix } from "../app/js/voix/lecteur.js";
import { CATALOGUE } from "../app/js/voix/script.js";

test("sans enregistrement ni voix de synthèse, rien n'est lu à voix haute", () => {
  const v = new LecteurVoix(), r = CATALOGUE.get("arbitre_premier_set_01");
  assert.equal(v.synthese, false, "voix de synthèse coupée par défaut");
  assert.equal(v.peutDire(r), false);
  v.fichiers.set(r.id, {});
  assert.equal(v.peutDire(r), true, "un vrai enregistrement est joué");
  v.actif = false;
  assert.equal(v.peutDire(r), false, "la case Son coupe tout");
});

test("une réplique coupée pendant son chargement ne laisse pas la suivante parler par-dessus", async () => {
  // De faux éléments <audio> : play() attend qu'on le décide, pause() fait échouer un play() en attente.
  const crees = [];
  class FauxAudio {
    constructor() { this.joue = false; crees.push(this); }
    play() { return new Promise((ok, ko) => { this.ok = () => { this.joue = true; ok(); }; this.ko = ko; }); }
    pause() { this.joue = false; this.ko?.(new Error("AbortError")); }
  }
  const avant = globalThis.Audio; globalThis.Audio = FauxAudio;
  try {
    const v = new LecteurVoix(), a = CATALOGUE.get("arbitre_silence_01"), b = CATALOGUE.get("arbitre_premier_set_01"), c = CATALOGUE.get("arbitre_set_decisif_01");
    for (const r of [a, b, c]) v.fichiers.set(r.id, null);
    v.dire([a]);                 // « Silence » se charge…
    v.dire([b]);                 // …et une autre réplique arrive avant
    const [fa, fb] = crees;
    fb.ok(); await new Promise(r => setTimeout(r, 0));   // l'échec de « Silence » arrive après coup
    v.dire([c]);                 // la réplique suivante doit couper la précédente
    assert.equal(fa.joue, false);
    assert.equal(fb.joue, false, "la réplique précédente est bien coupée");
  } finally { globalThis.Audio = avant; }
});
