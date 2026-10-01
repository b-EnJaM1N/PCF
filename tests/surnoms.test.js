import { test } from "node:test";
import assert from "node:assert/strict";
import { NOMS, COMPLEMENTS, surnomDe, debloques, aDebloquer, idPartie } from "../app/js/surnoms.js";
import { profilParDefaut, normaliserProfil } from "../app/js/profil.js";
import { CATALOGUE } from "../app/js/voix/script.js";

test("un nouveau joueur est « Le Bleu de l'ombre »", () => {
  assert.equal(surnomDe(profilParDefaut()).texte, "Le Bleu de l'ombre");
});

test("par défaut le surnom le plus rare ; sinon celui choisi, s'il est débloqué", () => {
  const P = profilParDefaut();
  Object.assign(P, { matchs: 25, victoires: 12, signes: [60, 20, 20], drapeau: "🇧🇪" });
  assert.equal(surnomDe(P).nom.id, "la_mule");
  assert.equal(surnomDe(P).complement.id, "du_grand_nord");
  P.surnom = { nom: "le_roc", complement: "qui_monte" };
  assert.equal(surnomDe(P).texte, "Le Roc qui monte");
  P.surnom = { nom: "le_sphinx", complement: "au_trophee" };   // pas débloqués : on revient au plus rare
  assert.equal(surnomDe(P).texte, "La Mule du Grand Nord");
});

test("chaque partie de surnom a son fichier audio et un id unique", () => {
  const ids = [...NOMS, ...COMPLEMENTS].map(x => x.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const p of [...NOMS, ...COMPLEMENTS]) assert.ok(CATALOGUE.has(idPartie(p)), p.id);
});

test("une ancienne fiche sans les nouveaux compteurs fonctionne", () => {
  const P = normaliserProfil({ matchs: 4, victoires: 1, heures: { nuit: 6 } });
  assert.deepEqual(P.heures, { nuit: 6, matin: 0, dimanche: 0 });
  assert.equal(P.genre, "m");
  assert.ok(debloques(COMPLEMENTS, P).some(c => c.id === "de_minuit"));
  assert.ok(surnomDe(P).texte);
});

test("une douzaine de noms et de compléments libres dès le départ, et une aide pour chaque surnom à débloquer", () => {
  const P = profilParDefaut();
  assert.ok(debloques(NOMS, P).length >= 13 && debloques(COMPLEMENTS, P).length >= 13);
  for (const x of [...NOMS, ...COMPLEMENTS]) assert.ok(x.aide && typeof x.ok === "function", x.id);
  assert.equal(aDebloquer(NOMS, P).length + debloques(NOMS, P).length, NOMS.length);
  // les nouveautés : trophées, poignées de main, duels
  Object.assign(P, { titres: { fondateur: 1, roi_sng: 2 }, poignees: { franche: 0, normale: 0, legere: 0, froide: 10 }, duelsFinis: 10 });
  const ids = debloques([...NOMS, ...COMPLEMENTS], P).map(x => x.id);
  for (const id of ["le_fondateur", "le_croupier", "l_iceberg", "le_duelliste", "a_la_poignee_glaciale", "des_sit_and_go"]) assert.ok(ids.includes(id), id);
});
