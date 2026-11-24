// Les bots de Noël (24 novembre) : à part (ni carrière ni tournoi), des coups valides, la boucle de Comète, la fonte du Bonhomme
// de neige, et la farce du Lutin (les boutons mélangés puis remis en place).
import { test } from "node:test";
import assert from "node:assert/strict";
import { BOTS, BOTS_NOEL, TOUS_LES_BOTS, botParId, choisirCoup } from "../app/js/bots.js";
import { PIERRE, FEUILLE, CISEAUX, contre } from "../app/js/regles.js";
import { rngFixe } from "./outils.js";

test("les bots de Noël : à part, retrouvés par leur nom, dans l'ordre des niveaux choisis", () => {
  assert.deepEqual(BOTS_NOEL.map(b => [b.id, b.elo]), [["perenoel", 2000], ["lutin", 1800], ["renne", 1400], ["neige", 1100]]);
  for (const b of BOTS_NOEL) {
    assert.ok(!TOUS_LES_BOTS.includes(b) && !BOTS.includes(b), `${b.id} : ni en carrière ni en tournoi`);
    assert.equal(botParId(b.id), b);
    assert.ok(b.noel);
  }
});

test("les bots de Noël jouent toujours un signe valide", () => {
  const r = rngFixe(7);
  for (const b of BOTS_NOEL) {
    const hist = [];
    for (let i = 0; i < 40; i++) {
      const s = choisirCoup(b, hist, r, { points: [i % 7, (i + 3) % 9], pointsParSet: 11, set: 0, balle: false });
      assert.ok([PIERRE, FEUILLE, CISEAUX].includes(s), `${b.id} : coup ${i}`);
      const adv = i % 3, res = s === adv ? "e" : contre(adv) === s ? "g" : "p";
      hist.push({ moi: s, adv, res });
    }
  }
});

test("le Bonhomme de neige fond après deux points perdus : il joue ce qui bat ton dernier signe", () => {
  const neige = botParId("neige");
  const hist = [{ moi: PIERRE, adv: FEUILLE, res: "p" }, { moi: PIERRE, adv: FEUILLE, res: "p" }];
  for (let i = 0; i < 10; i++) assert.equal(choisirCoup(neige, hist, Math.random), CISEAUX);
});

test("la farce du Lutin : les trois boutons mélangés, puis remis dans l'ordre", async () => {
  const { melangerBoutons, remettreBoutons } = await import("../app/js/noel.js");
  const boutons = ["0", "2", "1"].map(m => ({ dataset: { m } }));
  const moves = { children: boutons, classList: new Set(), appendChild(b) { this.children = [...this.children.filter(x => x !== b), b]; } };
  moves.classList.contains = moves.classList.has; moves.classList.remove = moves.classList.delete;
  const doc = { getElementById: () => moves };
  melangerBoutons(doc, () => 0.1);
  assert.notDeepEqual(moves.children.map(b => b.dataset.m), ["0", "2", "1"], "mélangés");
  remettreBoutons(doc);
  assert.deepEqual(moves.children.map(b => b.dataset.m), ["0", "2", "1"], "remis en place");
});
