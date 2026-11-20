import { test } from "node:test";
import assert from "node:assert/strict";
import { jour, textePlage, texteRdv, joursPossibles, plage, plagesRapides, heuresDansPlage, etatRdv, forfaitPossible } from "../app/js/creneaux.js";

const maintenant = new Date(2026, 10, 20, 15, 10);   // vendredi 20 novembre 2026, 15 h 10

test("les textes des plages et du rendez-vous", () => {
  assert.equal(jour(new Date(2026, 10, 20, 21), maintenant), "aujourd'hui");
  assert.equal(jour(new Date(2026, 10, 21, 9), maintenant), "demain");
  assert.equal(jour(new Date(2026, 10, 24, 9), maintenant), "mardi 24");
  const p = plage("2026-11-21", "20:00", "22:30");
  assert.equal(textePlage(p, maintenant), "demain 20 h – 22 h 30");
  assert.equal(texteRdv(new Date(2026, 10, 24, 21, 15).toISOString(), maintenant), "mardi 24 à 21 h 15");
  assert.equal(new Date(plage("2026-11-21", "23:00", "01:00").fin).getDate(), 22, "jusqu'au lendemain");
});

test("les jours, les plages rapides et les heures à choisir", () => {
  const j = joursPossibles(new Date(2026, 10, 23, 12).toISOString(), maintenant);
  assert.deepEqual(j.map(x => x.texte), ["aujourd'hui", "demain", "dimanche 22", "lundi 23"]);
  assert.deepEqual(plagesRapides(new Date(2026, 10, 21, 13).toISOString(), maintenant).map(x => x.texte), ["Ce soir 20 h – 22 h", "Demain midi 12 h – 14 h"], "pas après la date limite");
  const h = heuresDansPlage(plage("2026-11-20", "15:00", "16:00"), maintenant);
  assert.deepEqual(h.map(x => x.texte), ["15 h 15", "15 h 30", "15 h 45", "16 h"], "pas dans le passé, tous les quarts d'heure");
});

test("où en est le rendez-vous, et le forfait", () => {
  assert.equal(etatRdv(null, "moi"), "aucun");
  assert.equal(etatRdv({ statut: "propose", propose_par: "moi" }, "moi"), "j_ai_propose");
  assert.equal(etatRdv({ statut: "propose", propose_par: "lui" }, "moi"), "a_choisir");
  assert.equal(etatRdv({ statut: "decline", propose_par: "moi" }, "moi"), "decline_par_lui");
  assert.equal(etatRdv({ statut: "fixe", propose_par: "lui" }, "moi"), "fixe");
  const rdv = new Date(2026, 10, 20, 14, 50).toISOString();
  assert.ok(forfaitPossible({ statut: "fixe", rdv, moi_la: new Date(2026, 10, 20, 14, 45).toISOString(), adv_la: null }, maintenant));
  assert.ok(!forfaitPossible({ statut: "fixe", rdv, moi_la: null, adv_la: null }, maintenant), "je n'étais pas là");
  assert.ok(!forfaitPossible({ statut: "fixe", rdv, moi_la: rdv, adv_la: rdv }, maintenant), "il était là aussi");
  assert.ok(!forfaitPossible({ statut: "fixe", rdv: new Date(2026, 10, 20, 15).toISOString(), moi_la: rdv }, maintenant), "pas encore 15 minutes");
});
