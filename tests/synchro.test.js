import { test } from "node:test";
import assert from "node:assert/strict";
import { pseudoValide, pseudoComplet, ligneDepuisProfil, profilDepuisLigne, choisirFiche } from "../app/js/synchro.js";
import { profilParDefaut } from "../app/js/profil.js";

const profil = extra => Object.assign(profilParDefaut(), extra);

test("pseudos : mêmes règles que la base de données", () => {
  for (const p of ["Benji", "Jo", "Benji-Pierre", "Élodie 2", "1234567890123456"]) assert.ok(pseudoValide(p), p);
  for (const p of ["", "A", "Benji#12", " Benji", "Benji ", "12345678901234567", "a\tb", null]) assert.ok(!pseudoValide(p), String(p));
});

test("pseudo complet avec numéro", () => {
  assert.equal(pseudoComplet(profil({ pseudo: "Benji", numero: 4821 })), "Benji#4821");
  assert.equal(pseudoComplet(profil({ pseudo: "Benji" })), "Benji");
});

test("aller-retour fiche → ligne en ligne → fiche", () => {
  const P = profil({ pseudo: "Benji", numero: 4821, matchs: 7, drapeau: "🇧🇪", av: { symbole: "ciseaux", fond: "or", gant: "blanc", poignet: "rouge", motif: "uni" } });
  const ligne = ligneDepuisProfil(P, "uid");
  assert.equal(ligne.id, "uid"); assert.equal(ligne.pseudo, "Benji"); assert.equal(ligne.avatar.symbole, "ciseaux");
  assert.ok(!("numero" in ligne), "le numéro est choisi par le serveur, jamais envoyé");
  assert.ok(!("numero" in ligne.fiche));
  const retour = profilDepuisLigne({ ...ligne, numero: 4821 });
  assert.equal(retour.matchs, 7); assert.equal(retour.numero, 4821); assert.equal(retour.drapeau, "🇧🇪"); assert.equal(retour.av.symbole, "ciseaux");
});

test("première connexion : la fiche du téléphone part en ligne", () => {
  const L = profil({ pseudo: "Benji", matchs: 3 });
  assert.deepEqual(choisirFiche(L, null), { fiche: L, source: "locale", envoyer: true });
});

test("nouveau téléphone (fiche vide) : on retrouve la fiche en ligne", () => {
  const r = choisirFiche(profil(), { pseudo: "Benji", numero: 4821, fiche: profil({ matchs: 12 }) });
  assert.equal(r.source, "distante"); assert.equal(r.fiche.matchs, 12); assert.equal(r.fiche.numero, 4821); assert.equal(r.envoyer, false);
});

test("deux fiches remplies : on garde la plus avancée", () => {
  const ligne = { pseudo: "Benji", numero: 4821, fiche: profil({ matchs: 12 }) };
  assert.equal(choisirFiche(profil({ matchs: 5 }), ligne).source, "distante");
  const r = choisirFiche(profil({ pseudo: "Autre", matchs: 20 }), ligne);
  assert.equal(r.source, "locale"); assert.equal(r.envoyer, true);
  assert.equal(r.fiche.pseudo, "Benji", "le pseudo du compte l'emporte"); assert.equal(r.fiche.numero, 4821);
  assert.equal(choisirFiche(profil({ matchs: 12, majLe: 200 }), { ...ligne, fiche: profil({ matchs: 12, majLe: 100 }) }).source, "locale");
});
