import { test } from "node:test";
import assert from "node:assert/strict";
import { histoireDuMatch, chiffreDuMatch, citationDuMatch } from "../app/js/une-logique.js";
import { nouveauMatch, jouerCoup, PIERRE, CISEAUX } from "../app/js/regles.js";
import { nouvellesStats, suivreCoup } from "../app/js/stats-match.js";

// Joue une suite de points : "a" pour moi, "b" pour l'adversaire, "e" égalité.
function jouer(suite, format = { pointsParSet: 7, setsGagnants: 2 }) {
  const m = nouveauMatch(format), st = nouvellesStats();
  for (const c of suite) {
    const e = c === "a" ? jouerCoup(m, PIERRE, CISEAUX) : c === "b" ? jouerCoup(m, CISEAUX, PIERRE) : jouerCoup(m, PIERRE, PIERRE);
    suivreCoup(st, m, e);
  }
  return { m, st };
}
const moi = { nom: "Zoé", surnom: "Le Roc du Grand Nord", genre: "f" }, adv = { nom: "Rocky" };

test("une victoire écrasante : Fanny", () => {
  const { m, st } = jouer("aaaaaaa" + "aaaaaaa");
  const h = histoireDuMatch(m, st, moi, adv);
  assert.equal(h.titre, "ROCKY EMBRASSE FANNY");
  assert.equal(h.chapo, "Zoé, « Le Roc du Grand Nord », s'impose 2 sets à 0 face à Rocky (7–0, 7–0).");
  assert.deepEqual(h.chiffre, { valeur: 14, legende: "points d'affilée" });
});

test("une remontada, une finale gagnée ou perdue", () => {
  const r = jouer("bbbbbbb" + "aaaaaaa" + "ababababababaa");
  assert.equal(histoireDuMatch(r.m, r.st, moi, adv, {}, () => 0).titre, "LA REMONTADA DE ZOÉ");
  assert.equal(histoireDuMatch(r.m, r.st, moi, adv, { finale: true }).titre, "ZOÉ SACRÉE !");
  const p = jouer("bbbbbba" + "bbbbbba");
  assert.equal(histoireDuMatch(p.m, p.st, { ...moi, genre: "m" }, adv, { finale: true }).titre, "ZOÉ TOMBÉ EN FINALE");
  assert.equal(histoireDuMatch(p.m, p.st, moi, adv).titre, "SOIRÉE NOIRE POUR ZOÉ");
});

test("revenir d'une balle de match", () => {
  const r = jouer("bbbbbbb" + "bbbbbb" + "aaaaaaaa" + "aaaaaaa");
  assert.equal(histoireDuMatch(r.m, r.st, moi, adv).titre, "ZOÉ REVIENT D'ENTRE LES MORTS");
  assert.deepEqual(chiffreDuMatch(r.m, r.st), { valeur: 6, legende: "balles de match sauvées" });
});

test("match en un set : le score du set dans le chapô", () => {
  const { m, st } = jouer("aabba", { pointsParSet: 3, setsGagnants: 1 });
  assert.equal(histoireDuMatch(m, st, moi, adv).chapo, "Zoé, « Le Roc du Grand Nord », s'impose 3–2 face à Rocky.");
});

test("la phrase du match : la commentatrice d'abord", () => {
  const c = [{ role: "commentatrice", texte: "Propre. Net. Sans bavure." }, { role: "commentateur", texte: "Masterclass !" }];
  assert.deepEqual(citationDuMatch(c), { texte: "Propre. Net. Sans bavure.", auteur: "La commentatrice" });
  assert.equal(citationDuMatch([c[1]]).auteur, "Le commentateur");
  assert.equal(citationDuMatch([]), null);
});
