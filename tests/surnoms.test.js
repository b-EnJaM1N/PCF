import { test } from "node:test";
import assert from "node:assert/strict";
import { NOMS, QUALIFICATIFS, FAMILLES, PALIERS, surnomDe, surnomValide, surnomAuHasard, debloques, aDebloquer, monterRang, idPartie } from "../app/js/surnoms.js";
import { profilParDefaut, normaliserProfil } from "../app/js/profil.js";
import { CATALOGUE } from "../app/js/voix/script.js";

test("un nom + un qualificatif, choisis par le joueur", () => {
  const P = profilParDefaut();
  P.surnom = { nom: "le_cobra", complement: "du_pmu" };
  assert.equal(surnomDe(P).texte, "Le Cobra du PMU");
  P.surnom = { nom: "la_tornade", complement: "implacable" };
  assert.equal(surnomDe(P).texte, "La Tornade Implacable", "les qualificatifs ne s'accordent pas");
});

test("un nouveau joueur a un surnom de départ : un nom Novice et un qualificatif humour", () => {
  for (let k = 0; k < 50; k++) {
    const s = surnomAuHasard(profilParDefaut(), { depart: true });
    assert.equal(NOMS.find(x => x.id === s.nom).palier, "novice");
    assert.equal(QUALIFICATIFS.find(x => x.id === s.complement).famille, "humour");
  }
});

test("un surnom de l'ancienne liste n'est plus valide : un surnom de départ, le même des deux côtés", () => {
  const P = normaliserProfil({ pseudo: "Benji", surnom: { nom: "le_bleu", complement: "de_l_ombre" } });
  assert.equal(surnomValide(P), false);
  const a = surnomDe(P), b = surnomDe(normaliserProfil({ pseudo: "Benji", surnom: null }));
  assert.equal(a.texte, b.texte, "toujours le même pour un pseudo donné");
  assert.equal(a.complement.famille, "humour");
});

test("les familles s'ouvrent avec les rangs de la carte", () => {
  const P = profilParDefaut();
  const familles = (liste, rang) => new Set(debloques(liste, P, rang).map(x => x.famille));
  assert.deepEqual([...familles(QUALIFICATIFS, 1)], ["humour"]);
  assert.deepEqual([...familles(QUALIFICATIFS, 2)], ["humour", "lieu"]);
  assert.ok(familles(QUALIFICATIFS, 4).has("element") && !familles(QUALIFICATIFS, 4).has("caractere"));
  assert.ok(familles(NOMS, 5).has("titre") && familles(QUALIFICATIFS, 5).has("ombre") && !familles(QUALIFICATIFS, 5).has("prestige"));
  assert.ok(familles(QUALIFICATIFS, 6).has("prestige"));
  assert.equal(debloques(NOMS, P, 1).length + aDebloquer(NOMS, P, 1).length, NOMS.length);
  assert.ok(debloques(NOMS, P, 1).length >= 20 && debloques(QUALIFICATIFS, P, 1).length >= 14);
});

test("monter de rang : les paliers s'annoncent une fois, et on ne perd jamais un surnom débloqué", () => {
  const P = profilParDefaut();
  assert.equal(monterRang(P, 1).length, 0);
  const a = monterRang(P, 3);
  assert.equal(a.length, 2);
  assert.ok(a[0].includes("lieux") && a[1].includes("matières"));
  assert.equal(monterRang(P, 3).length, 0, "déjà annoncé");
  assert.equal(monterRang(P, 2).length, 0);
  assert.ok(debloques(QUALIFICATIFS, P).some(x => x.famille === "matiere"), "le rang le plus haut est retenu");
  assert.ok(monterRang(P, 6).some(t => t.includes("prestige")));
});

test("les noms spécial HandSlam : selon le signe favori", () => {
  const P = profilParDefaut();
  Object.assign(P, { matchs: 12, signes: [60, 20, 20] });
  const ids = debloques(NOMS, P, 1).map(x => x.id);
  assert.ok(ids.includes("le_menhir") && !ids.includes("le_secateur") && !ids.includes("l_origami"));
});

test("chaque partie de surnom a son fichier audio, un id unique et une aide", () => {
  const ids = [...NOMS, ...QUALIFICATIFS].map(x => x.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const p of [...NOMS, ...QUALIFICATIFS]) {
    assert.ok(CATALOGUE.has(idPartie(p)), p.id);
    assert.ok(p.aide && FAMILLES[p.famille], p.id);
    if (p.palier) assert.ok(PALIERS[p.palier], p.id);
  }
});
