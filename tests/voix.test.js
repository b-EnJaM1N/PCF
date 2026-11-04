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

test("la salle baisse sous la voix : un seul signal pour deux répliques qui s'enchaînent, puis le silence", async () => {
  const v = new LecteurVoix(), recu = [];
  v.surParole = on => recu.push(on);
  v.parole(true); v.parole(false); v.parole(true);   // fin de la 1re réplique, début de la 2e
  assert.deepEqual(recu, [true]);
  v.parole(false);
  await new Promise(r => setTimeout(r, 450));
  assert.deepEqual(recu, [true, false]);
});

test("attendre la fin des commentaires (avant la poignée de main) : tout de suite si rien n'est dit, sinon à la fin de la suite", async () => {
  const crees = [];
  class FauxAudio {
    constructor() { crees.push(this); }
    play() { return Promise.resolve(); }
    pause() {}
  }
  const avant = globalThis.Audio; globalThis.Audio = FauxAudio;
  try {
    const v = new LecteurVoix(), a = CATALOGUE.get("arbitre_silence_01"), b = CATALOGUE.get("arbitre_premier_set_01");
    for (const r of [a, b]) v.fichiers.set(r.id, null);
    let appele = 0;
    v.finiDeParler(() => appele++);
    assert.equal(appele, 1, "rien n'est dit : tout de suite");
    v.dire([a, b]);
    v.finiDeParler(() => appele++, 5000);
    await new Promise(ok => setTimeout(ok, 50));
    assert.equal(appele, 1, "la suite est en cours : on attend");
    crees[0].onended(); await new Promise(ok => setTimeout(ok, 10)); crees[1].onended();
    await new Promise(ok => setTimeout(ok, 450));
    assert.equal(appele, 2, "la suite est finie : la poignée de main peut venir");
    v.dire([a]); v.finiDeParler(() => appele++, 300);
    await new Promise(ok => setTimeout(ok, 500));
    assert.equal(appele, 3, "au bout du temps maximal, on n'attend plus");
  } finally { globalThis.Audio = avant; }
});

test("l'arbitre dit à voix haute ses demandes de calme", async () => {
  const { ditAVoixHaute } = await import("../app/js/voix/lecteur.js");
  assert.ok(ditAVoixHaute(CATALOGUE.get("arbitre_silence_06")));
  assert.ok(!ditAVoixHaute(CATALOGUE.get("arbitre_poignee_franche_01")), "ses autres annonces restent écrites");
});
