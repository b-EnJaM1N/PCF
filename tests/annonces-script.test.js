import { test } from "node:test";
import assert from "node:assert/strict";
import { CATALOGUE, replique, repliqueScore, repliquePartout, versions, SITUATIONS_COMMENTATEUR } from "../app/js/voix/script.js";
import { annoncerCoup, annonceDebutSet, nouvelEtatAnnonces } from "../app/js/annonces.js";
import { nouveauMatch, jouerCoup, PIERRE, CISEAUX, FEUILLE } from "../app/js/regles.js";
import { rngFixe } from "./outils.js";

test("chaque réplique a un nom de fichier valide : role_situation_NN", () => {
  for (const [id, r] of CATALOGUE) {
    assert.match(id, /^(arbitre|commentateur)_[a-z0-9_]+_\d{2}$/, id);
    assert.ok(id.startsWith(r.role + "_"), id);
    assert.ok(r.texte.length > 3, id);
  }
});

test("exemples de noms de répliques", () => {
  assert.equal(replique("commentateur_craquage_02").role, "commentateur");
  assert.equal(repliqueScore(11, 9).id, "arbitre_score_onze_a_neuf_01");
  assert.equal(repliqueScore(11, 9).texte, "Onze à neuf.");
  assert.equal(repliqueScore(17, 15).id, "arbitre_score_dix_sept_a_quinze_01");
  assert.equal(repliquePartout(10).texte, "Dix partout. Deux points d'écart.");
  assert.ok(CATALOGUE.has(repliqueScore(20, 18).id));
  // hors catalogue : toujours une réplique, lue par la voix de synthèse
  assert.equal(repliqueScore(25, 23).texte, "Vingt-cinq à vingt-trois.");
  assert.throws(() => replique("arbitre_inexistant_01"));
});

test("chaque situation du commentateur a au moins deux versions", () => {
  for (const s of SITUATIONS_COMMENTATEUR) assert.ok(versions(s).length >= 2, s);
});

// Joue un match complet au hasard et vérifie que toutes les annonces existent.
test("un match complet ne produit que des répliques connues", () => {
  const rng = rngFixe(11);
  for (const [len, win] of [[11, 2], [11, 3], [7, 2], [7, 3]]) {
    for (let k = 0; k < 20; k++) {
      const m = nouveauMatch({ pointsParSet: len, setsGagnants: win }), etat = nouvelEtatAnnonces();
      assert.equal(annonceDebutSet(m).id, "arbitre_premier_set_01");
      while (!m.termine) {
        const e = jouerCoup(m, Math.floor(rng() * 3), Math.floor(rng() * 3));
        const a = annoncerCoup(m, e, etat, { recents: [true, true, true, true, true, true, true, true] }, rng);
        for (const l of a.lignes) {
          assert.ok(l.id && l.texte && l.role, JSON.stringify(l));
          if (!l.id.startsWith("arbitre_score_") && !l.id.startsWith("arbitre_partout_")) assert.ok(CATALOGUE.has(l.id), l.id);
        }
        if (e.finSet && !e.finMatch) assert.ok(annonceDebutSet(m).id);
      }
    }
  }
});

test("l'arbitre annonce la balle de match, puis le silence se fait", () => {
  const m = nouveauMatch({ pointsParSet: 7, setsGagnants: 2 }), etat = nouvelEtatAnnonces(), rng = () => 0.99;
  for (let i = 0; i < 7; i++) annoncerCoup(m, jouerCoup(m, PIERRE, CISEAUX), etat, {}, rng);
  let a;
  for (let i = 0; i < 6; i++) a = annoncerCoup(m, jouerCoup(m, PIERRE, CISEAUX), etat, {}, rng);
  assert.equal(a.lignes[0].id, "arbitre_balle_de_match_jaune_01");
  assert.equal(a.ambiance, "silence");
  a = annoncerCoup(m, jouerCoup(m, CISEAUX, PIERRE), etat, {}, rng);
  assert.ok(a.lignes.some(l => l.id.startsWith("commentateur_balle_sauvee_")) === false, "c'est le rouge qui sauve");
  a = annoncerCoup(m, jouerCoup(m, PIERRE, CISEAUX), etat, {}, rng);
  assert.deepEqual(a.lignes.slice(0, 2).map(l => l.id), ["arbitre_jeu_set_et_match_jaune_01", "arbitre_sets_deux_a_zero_01"]);
  assert.equal(a.public, "ovation");
  assert.equal(a.ambiance, "fin");
});

test("fin de set : set remporté, score, et 10 partout", () => {
  const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), etat = nouvelEtatAnnonces(), rng = () => 0.99;
  let a;
  for (let i = 0; i < 10; i++) annoncerCoup(m, jouerCoup(m, PIERRE, CISEAUX), etat, {}, rng);
  for (let i = 0; i < 10; i++) a = annoncerCoup(m, jouerCoup(m, CISEAUX, PIERRE), etat, {}, rng);
  assert.equal(a.lignes[0].id, "arbitre_partout_dix_01");
  annoncerCoup(m, jouerCoup(m, FEUILLE, PIERRE), etat, {}, rng);
  a = annoncerCoup(m, jouerCoup(m, FEUILLE, PIERRE), etat, {}, rng);
  assert.deepEqual(a.lignes.slice(0, 2).map(l => l.id), ["arbitre_premier_set_jaune_01", "arbitre_score_douze_a_dix_01"]);
  assert.equal(annonceDebutSet(m).id, "arbitre_deuxieme_set_01");
});

test("le commentateur ne se répète pas et reste rare", () => {
  const rng = rngFixe(5), m = nouveauMatch({ pointsParSet: 11, setsGagnants: 3 }), etat = nouvelEtatAnnonces();
  let coms = 0, prec = null;
  while (!m.termine) {
    const a = annoncerCoup(m, jouerCoup(m, Math.floor(rng() * 3), Math.floor(rng() * 3)), etat, {}, rng);
    if (a.commentaire) { coms++; if (!m.termine) assert.notEqual(a.commentaire.id, prec); prec = a.commentaire.id; }
  }
  assert.ok(coms < m.coups.length / 3, `${coms} commentaires pour ${m.coups.length} coups`);
});

test("le public applaudit 4 points d'affilée, la fin d'un set et du match, pas chaque point", () => {
  const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), etat = nouvelEtatAnnonces(), rng = () => 0.99;
  const pubs = [];
  const suite = "aaabaaaabbbbaaaaaaa";  // a = point pour moi, b = pour l'adversaire
  for (const c of suite) pubs.push(annoncerCoup(m, c === "a" ? jouerCoup(m, PIERRE, CISEAUX) : jouerCoup(m, CISEAUX, PIERRE), etat, {}, rng).public);
  // 3 points puis 1 perdu : rien ; 4 d'affilée ; 4 pour l'adversaire ; la série suivante finit le set 11–5 ; puis 3 points : rien
  assert.deepEqual(pubs.map((p, i) => p && `${i}:${p}`).filter(Boolean), ["7:serie", "11:serie", "15:set"]);
});
