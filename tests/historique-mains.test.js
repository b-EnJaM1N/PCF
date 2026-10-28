import test from "node:test";
import assert from "node:assert/strict";
import { encoderCoups, decoderCoups, ajouterMain, noterMain, mainDossier, htmlMains, MAX_MAINS } from "../app/js/historique-mains.js";

const coups = [{ a: 0, b: 1 }, { a: 2, b: 2 }, { a: 1, b: 0 }, { a: 2, b: 0 }];

test("un match se garde en un chiffre par coup, avec les sets, et se relit à l'identique", () => {
  const t = encoderCoups(coups, [0, 2]);
  assert.equal(t, "18|36");
  const sets = decoderCoups(t);
  assert.equal(sets.length, 2);
  assert.deepEqual(sets.flat().map(c => [c.a, c.b, c.gagnant]), [[0, 1, 0], [2, 2, null], [1, 0, 1], [2, 0, 0]]);
});

test("10 matchs au plus par adversaire, le plus récent d'abord ; 80 adversaires au plus", () => {
  let l = [];
  for (let i = 0; i < 12; i++) l = ajouterMain(l, { date: i, gagne: i % 2, detail: `${i}`, coups });
  assert.equal(l.length, MAX_MAINS);
  assert.equal(l[0].d, 11);
  let t = {};
  for (let i = 0; i < 85; i++) t = noterMain(t, `b${i}`, { date: i, gagne: true, coups });
  assert.equal(Object.keys(t).length, 80);
  assert.ok(t.b84 && !t.b0);
});

test("un match du dossier (vu de son côté) : lui en premier, et le nombre de coups", () => {
  const e = mainDossier([{ a: 1, b: 0, g: 1 }, { a: 0, b: 2, g: 1 }, { a: 2, b: null }]);
  assert.equal(e.c, "16"); assert.equal(e.g, true); assert.equal(e.s, "2 coups");
});

test("l'affichage : un bandeau par match, ou le message s'il n'y en a pas", () => {
  assert.match(htmlMains([], { vide: "Rien <encore>" }), /Rien &lt;encore&gt;/);
  const h = htmlMains([{ d: 0, g: true, s: "11–7", c: "18|36" }], { noms: ["Toi", "Zoé"] });
  assert.match(h, /✅ Victoire · 11–7/);
  assert.equal((h.match(/<td/g) || []).length, 8);
  assert.equal((h.match(/newset/g) || []).length, 2);
});

test("la mémoire du dernier match : ouverture, défaite sèche, balle sauvée, match serré, belle, habitude", async () => {
  const { memoireDuDernier } = await import("../app/js/historique-mains.js");
  assert.equal(memoireDuDernier([]), null);
  // son premier signe : la Feuille (coup 3 × moi + lui : 0 Pierre contre 2 Feuille → « 2 »)
  const m = memoireDuDernier([{ g: false, s: "4–11", c: "21|0", b: 1 }, { g: false, s: "", c: "" }, { g: false, s: "", c: "" }], { v: 2, d: 2 });
  assert.equal(m.ouverture, 2); assert.equal(m.defaiteSeche, true); assert.equal(m.balleSauvee, true);
  assert.equal(m.serre, false); assert.equal(m.belle, true); assert.equal(m.habitude, "lui");
  const n = memoireDuDernier([{ g: true, s: "11–9", c: "1" }]);
  assert.equal(n.serre, true); assert.equal(n.defaiteSeche, false); assert.equal(n.habitude, null);
});

test("les commentateurs se souviennent : des répliques enregistrées, au bon genre, et l'ouverture relevée", async () => {
  const { commentaireMemoire, commentaireMemeOuverture } = await import("../app/js/annonces.js");
  const [l] = commentaireMemoire({ ouverture: 1, defaiteSeche: false, balleSauvee: false, serre: false, belle: false, habitude: null }, { genreAdv: "f" }, () => 0);
  assert.match(l.id, /^commentateur_memoire_ouverture_01_ciseaux_f$/);
  assert.match(l.texte, /elle avait ouvert avec les Ciseaux/);
  const [b] = commentaireMemoire({ ouverture: 0, balleSauvee: true }, {}, () => 0.1);
  assert.match(b.id, /memoire_balle_sauvee/);
  assert.equal(commentaireMemoire({ ouverture: 0 }, { audible: () => false }, () => 0), null, "pas de voix : rien");
  // Une revanche : le dialogue Roland → Monique.
  const r = commentaireMemoire({ ouverture: null, gagne: false, v: 0, d: 1 }, {}, () => 0, );
  assert.ok(r.length >= 1);
  const rev = commentaireMemoire({ ouverture: null, gagne: false }, { audible: id => /memoire_revanche/.test(id) }, () => 0);
  assert.deepEqual(rev.map(x => x.id), ["commentateur_dialogue_memoire_revanche_01", "commentatrice_dialogue_memoire_revanche_01"]);
  // Le bilan : elle mène 3–1 (je suis l'adversaire, au masculin).
  const mene = commentaireMemoire({ ouverture: null, v: 1, d: 3 }, { genreAdv: "f", audible: id => /memoire_mene/.test(id) }, () => 0);
  assert.match(mene[0].texte, /^Elle mène/);
  // « contre lui » : jamais pour une adversaire.
  for (let i = 0; i < 50; i++) {
    const x = commentaireMemoire({ ouverture: null, gagne: true, v: 1, d: 0 }, { genreAdv: "f" }, Math.random);
    assert.ok(!x || !x.some(y => /contre lui/.test(y.texte)), x?.map(y => y.texte).join(" "));
  }
  // Son signe favori.
  const fav = commentaireMemoire({ ouverture: null, favori: { signe: 2, part: 0.6 } }, { audible: id => /memoire_favori/.test(id) }, () => 0);
  assert.match(fav[0].texte, /beaucoup joué la Feuille/);
  // Au premier coup : la même ouverture (jamais la réplique retirée), ou une nouvelle, une fois sur deux.
  for (let i = 0; i < 30; i++) {
    const m = commentaireMemeOuverture({ ouverture: 2 }, 2, {}, Math.random);
    assert.ok(m.length >= 1 && !m.some(y => /pas son fort/.test(y.texte)));
    assert.match(m.map(y => y.texte).join(" "), /même ouverture|Même ouverture|rouvre/);
  }
  assert.match(commentaireMemeOuverture({ ouverture: 2 }, 2, { genreAdv: "f" }, () => 0)[0].texte, /^Elle rejoue/);
  assert.match(commentaireMemeOuverture({ ouverture: 2 }, 1, {}, () => 0)[0].texte, /ouverture/);
  assert.equal(commentaireMemeOuverture({ ouverture: 2 }, 1, {}, () => 0.9), null);
});
