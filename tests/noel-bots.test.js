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

test("le smash d'un bot de Noël : sa marque à lui jusqu'à la fin du set, au lieu de l'accroc et de la fissure ; les lames tordues restent", async () => {
  const { nouveauxDegats, noterDegats, degatsDe } = await import("../app/js/degats.js");
  const e = nouveauxDegats();
  // Ciseaux (1) du bot contre Feuille (2) : d'habitude l'accroc ; ici, le ruban du Père Noël
  assert.deepEqual(noterDegats(e, { set: 0, gagnant: 1, signes: [2, 1], smashGagnant: true, noel: "perenoel" }), { joueur: 0, marque: "noel" });
  assert.deepEqual(degatsDe(e, 0, 0), { noel: "perenoel" });
  // Pierre (0) du bot contre Ciseaux (1) : les lames tordues, en plus
  assert.deepEqual(noterDegats(e, { set: 0, gagnant: 1, signes: [1, 0], smashGagnant: true, noel: "perenoel" }), { joueur: 0, marque: "tordu" });
  assert.deepEqual(degatsDe(e, 0, 0), { noel: "perenoel", tordu: 1 });
  // le set suivant : réparé
  noterDegats(e, { set: 1, gagnant: 0, signes: [0, 1], smashGagnant: false, noel: "perenoel" });
  assert.equal(degatsDe(e, 0, 1), null);
  // le smash du joueur sur le bot de Noël : les marques habituelles
  assert.deepEqual(noterDegats(e, { set: 1, gagnant: 0, signes: [1, 2], smashGagnant: true, noel: "perenoel" }), { joueur: 1, marque: "dechire" });
});

test("l'entraînement : trois catégories ; les bots de la carrière débloqués une fois battus ; les derniers adversaires", async () => {
  const { CATEGORIES_BOTS, categorieDe, botDisponible, derniersBots, AUTRES_BOTS } = await import("../app/js/bots.js");
  assert.deepEqual(CATEGORIES_BOTS.map(c => c.nom), ["Débutants", "Confirmés", "Experts"]);
  assert.equal(categorieDe(botParId("rocky")).id, "debutants");
  assert.equal(categorieDe(botParId("tictac")).id, "confirmes");
  assert.equal(categorieDe(botParId("titan")).id, "experts");
  for (const b of BOTS) assert.ok(botDisponible(b, {}), `${b.id} : de base`);
  const p = AUTRES_BOTS[0];
  assert.equal(botDisponible(p, {}), false, "pas encore battu");
  assert.equal(botDisponible(p, { [p.id]: { v: 0, d: 3 } }), false, "seulement perdu");
  assert.equal(botDisponible(p, { [p.id]: { v: 1, d: 0 } }), true, "battu une fois");
  assert.deepEqual(derniersBots([{ adv: "rocky" }, { adv: "h:x" }, { adv: p.id }, { adv: "rocky" }, { adv: "chaos" }, { adv: "bambi" }]).map(b => b.id), ["rocky", "chaos", "bambi"],
    "les humains, les doublons et les bots verrouillés ne comptent pas");
});

test("un pull moche garde son tricot, même avec un motif de gant choisi (remarque du 24 novembre)", async () => {
  const { avatarSVG } = await import("../app/js/avatar.js");
  const sans = avatarSVG({ symbole: "feuille", gant: "pullcadeau", fond: "court" }).replace(/av\d+/g, "x");
  const avec = avatarSVG({ symbole: "feuille", gant: "pullcadeau", fond: "court", gantMotif: "pois", gantMotifCouleur: "vert" }).replace(/av\d+/g, "x");
  assert.equal(avec, sans);
});
