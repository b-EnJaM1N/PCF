import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CIRCUITS, TAILLE, JOURNEES, compositionDeDepart, calendrier, nouvelleCarriere, prochainMatch, enregistrerMonMatch,
  classement, saisonSuivante, texteBilan, circuitDuJoueur, chances, simulerCircuit, vitrine,
} from "../app/js/carriere-logique.js";
import { botParId, TOUS_LES_BOTS, choisirCoup } from "../app/js/bots.js";
import { hasardGraine } from "../app/js/match-du-jour.js";

const rng = hasardGraine(42);
const gagner = (C, oui, r = rng) => enregistrerMonMatch(C, oui, prochainMatch(C).format.setsGagnants === 1 ? [oui ? [11, 6] : [6, 11]] : [oui ? [11, 6] : [6, 11], oui ? [11, 8] : [8, 11]], r);

test("64 bots dans l'appli, tous différents, et chacun sait jouer", () => {
  assert.equal(TOUS_LES_BOTS.length, 64);
  assert.equal(new Set(TOUS_LES_BOTS.map(b => b.id)).size, 64);
  for (const b of TOUS_LES_BOTS) {
    assert.ok(b.nom && b.style && b.desc && b.av && b.elo, b.id);
    const s = choisirCoup(b, [{ moi: 0, adv: 1, res: "g" }, { moi: 0, adv: 1, res: "g" }, { moi: 2, adv: 1, res: "p" }], rng);
    assert.ok([0, 1, 2].includes(s), b.id);
  }
});

test("5 circuits de 12 joueurs : toi en Amateur, les plus faibles en bas, les plus forts en haut", () => {
  const c = compositionDeDepart();
  assert.equal(c.length, CIRCUITS.length);
  c.forEach(x => assert.equal(x.length, TAILLE));
  assert.ok(c[0].includes("moi"));
  assert.equal(new Set(c.flat()).size, 60);
  const moyenne = x => x.filter(id => id !== "moi").reduce((s, id) => s + botParId(id).elo, 0) / x.filter(id => id !== "moi").length;
  for (let k = 1; k < c.length; k++) assert.ok(moyenne(c[k]) > moyenne(c[k - 1]));
  assert.ok(c[4].includes("reinemere") && c[4].includes("titan"));
});

test("le calendrier : 11 journées, chacun rencontre chaque autre une fois, adversaires de plus en plus forts", () => {
  const ids = compositionDeDepart()[0], J = calendrier(ids);
  assert.equal(J.length, JOURNEES);
  const paires = new Set(J.flat().map(([a, b]) => [a, b].sort().join("-")));
  assert.equal(paires.size, TAILLE * (TAILLE - 1) / 2);
  J.forEach(j => assert.equal(new Set(j.flat()).size, TAILLE));
  const advs = J.map(j => j.find(p => p.includes("moi")).find(x => x !== "moi"));
  for (let i = 1; i < advs.length; i++) assert.ok(botParId(advs[i]).elo >= botParId(advs[i - 1]).elo);
});

test("les chances suivent le niveau", () => {
  assert.ok(chances("reinemere", "pantoufle") > 0.95);
  assert.equal(Math.round(chances("rocky", "rocky") * 100), 50);
});

test("tout gagner : saison, playoffs, et on monte", () => {
  const C = nouvelleCarriere(hasardGraine(1));
  for (let j = 0; j < JOURNEES; j++) gagner(C, true);
  assert.equal(C.place, 1); assert.equal(C.phase, "playoffs");
  assert.equal(classement(C)[0].pts, 22);
  assert.equal(prochainMatch(C).etape, "Quart de finale des playoffs");
  gagner(C, true); gagner(C, true); assert.equal(prochainMatch(C).cle, "finale"); gagner(C, true);
  assert.equal(C.phase, "fin"); assert.equal(C.bilan.mouvement, 1);
  assert.match(texteBilan(C), /promu en Circuit Régional/);
  saisonSuivante(C, rng);
  assert.equal(circuitDuJoueur(C), 1); assert.equal(C.saison, 2); assert.equal(C.phase, "saison");
  C.circuits.forEach(x => assert.equal(x.length, TAILLE));
  assert.equal(new Set(C.circuits.flat()).size, 60);
  assert.equal(C.palmares.length, 1);
});

test("finaliste : barrage contre le barragiste du dessus ; gagné, on monte", () => {
  const C = nouvelleCarriere(hasardGraine(2));
  for (let j = 0; j < JOURNEES; j++) gagner(C, true);
  gagner(C, true); gagner(C, true); gagner(C, false);
  assert.equal(C.phase, "barrage");
  assert.equal(prochainMatch(C).adv, C.issues[1].barragiste);
  assert.equal(prochainMatch(C).etape, "Barrage d'accession");
  gagner(C, true);
  assert.equal(C.bilan.mouvement, 1);
  const adv = C.barrage.adv;
  saisonSuivante(C, rng);
  assert.equal(circuitDuJoueur(C), 1);
  assert.ok(C.circuits[0].includes(adv));   // le perdant du barrage descend à sa place
});

test("tout perdre en Amateur : pas de playoffs, on reste", () => {
  const C = nouvelleCarriere(hasardGraine(3));
  for (let j = 0; j < JOURNEES; j++) gagner(C, false);
  assert.equal(C.place, 12); assert.equal(C.phase, "fin"); assert.equal(C.bilan.mouvement, 0);
  assert.match(texteBilan(C), /pas de playoffs/);
  saisonSuivante(C, rng); assert.equal(circuitDuJoueur(C), 0);
});

test("le maintien : perdre la demi et le match pour le maintien, on descend ; le gagner, barrage", () => {
  const monter = C => { for (let j = 0; j < JOURNEES; j++) gagner(C, true); gagner(C, true); gagner(C, true); gagner(C, true); saisonSuivante(C, rng); };
  const C = nouvelleCarriere(hasardGraine(4)); monter(C);
  const D = structuredClone(C);
  for (let j = 0; j < JOURNEES; j++) gagner(C, false);
  assert.equal(C.phase, "maintien"); assert.equal(prochainMatch(C).etape, "Demi-finale du maintien");
  gagner(C, false); assert.equal(prochainMatch(C).etape, "Match pour le maintien");
  gagner(C, false); assert.equal(C.bilan.mouvement, -1);
  saisonSuivante(C, rng); assert.equal(circuitDuJoueur(C), 0);

  for (let j = 0; j < JOURNEES; j++) gagner(D, false);
  gagner(D, false); gagner(D, true);
  assert.equal(D.phase, "barrage"); assert.equal(prochainMatch(D).adv, D.issues[0].finaliste);
  gagner(D, true); assert.equal(D.bilan.mouvement, 0); assert.match(texteBilan(D), /maintenu/);
  saisonSuivante(D, rng); assert.equal(circuitDuJoueur(D), 1);
});

test("gagner sa demi-finale du maintien suffit", () => {
  const C = nouvelleCarriere(hasardGraine(5));
  for (let j = 0; j < JOURNEES; j++) gagner(C, true); for (let i = 0; i < 3; i++) gagner(C, true); saisonSuivante(C, rng);
  for (let j = 0; j < JOURNEES; j++) gagner(C, false);
  gagner(C, true);
  assert.equal(C.phase, "fin"); assert.equal(C.bilan.mouvement, 0); assert.match(texteBilan(C), /Maintenu/);
});

test("éliminé en quart : on reste, le texte le dit", () => {
  const C = nouvelleCarriere(hasardGraine(6));
  for (let j = 0; j < JOURNEES; j++) gagner(C, true);
  gagner(C, false);
  assert.equal(C.bilan.mouvement, 0); assert.match(texteBilan(C), /Éliminé en quart de finale/);
  assert.ok(C.issues[0].champion && C.issues[0].finaliste);
});

test("champion de l'Élite après 4 montées ; les circuits restent à 12", () => {
  const C = nouvelleCarriere(hasardGraine(7));
  for (let s = 0; s < 5; s++) {
    for (let j = 0; j < JOURNEES; j++) gagner(C, true);
    for (let i = 0; i < 3; i++) gagner(C, true);
    if (s < 4) { assert.equal(C.bilan.mouvement, 1); saisonSuivante(C, rng); }
  }
  assert.equal(C.ou, 4); assert.equal(C.bilan.titre, "champion"); assert.match(texteBilan(C), /Champion du Circuit Élite/);
  saisonSuivante(C, rng);
  assert.equal(circuitDuJoueur(C), 4);
  C.circuits.forEach(x => assert.equal(x.length, TAILLE));
  assert.equal(new Set(C.circuits.flat()).size, 60);
});

test("un circuit de bots donne un champion, un finaliste, un relégué et un barragiste distincts", () => {
  const ids = compositionDeDepart()[2], r = simulerCircuit(ids, 2, rng);
  assert.equal(new Set([r.champion, r.finaliste, r.relegue, r.barragiste]).size, 4);
});

test("le palmarès de la saison : champion de chaque circuit, montées et descentes", () => {
  const C = nouvelleCarriere(hasardGraine(8));
  for (let j = 0; j < JOURNEES; j++) gagner(C, true); for (let i = 0; i < 3; i++) gagner(C, true);
  saisonSuivante(C, rng);
  const p = C.palmares[0];
  assert.equal(p.circuits.length, CIRCUITS.length);
  assert.equal(p.circuits[0].champion, "moi");
  assert.ok(p.circuits[0].montes.includes("moi"));
  assert.equal(p.circuits[4].montes.length, 0); assert.equal(p.circuits[0].descendus.length, 0);
  for (let k = 0; k < 4; k++) assert.equal(p.circuits[k].montes.length, p.circuits[k + 1].descendus.length);
  p.circuits.forEach(c => assert.ok(c.champion && c.finaliste));
});

test("la vitrine : coupe et bouclier, dès qu'ils sont acquis, puis gardés au palmarès", () => {
  const C = nouvelleCarriere(hasardGraine(9));
  assert.deepEqual(vitrine(C)[0], { coupes: [], boucliers: [] });
  for (let j = 0; j < JOURNEES; j++) gagner(C, true);
  assert.deepEqual(vitrine(C)[0], { coupes: [], boucliers: [1] });   // 1er de la saison : le bouclier tout de suite
  for (let i = 0; i < 3; i++) gagner(C, true);
  assert.deepEqual(vitrine(C)[0], { coupes: [1], boucliers: [1] });
  saisonSuivante(C, rng);
  assert.deepEqual(vitrine(C)[0], { coupes: [1], boucliers: [1] });
  assert.deepEqual(vitrine(C)[1], { coupes: [], boucliers: [] });
});
