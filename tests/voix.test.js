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
