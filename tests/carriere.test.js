import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CIRCUITS, TAILLE, TAILLES, JOURNEES, compositionDeDepart, calendrier, nouvelleCarriere, prochainMatch, enregistrerMonMatch,
  classement, saisonSuivante, texteBilan, circuitDuJoueur, chances, simulerCircuit, vitrine, TOURS_COUPE, texteCoupe, coupesML, coupeEnCours, titresCarriere, migrerCarriere,
} from "../app/js/carriere-logique.js";
import { botParId, TOUS_LES_BOTS, choisirCoup } from "../app/js/bots.js";
import { hasardGraine } from "../app/js/match-du-jour.js";

const rng = hasardGraine(42);
// Le championnat : les matchs de coupe qui se présentent sont perdus d'abord (la coupe se joue ensuite sans moi).
const perdreCoupe = (C, r = rng) => { while (prochainMatch(C)?.coupe) enregistrerMonMatch(C, false, prochainMatch(C).format.setsGagnants === 1 ? [[6, 11]] : [[6, 11], [8, 11]], r); };
const gagner = (C, oui, r = rng) => perdreCoupe(C, r) || enregistrerMonMatch(C, oui, prochainMatch(C).format.setsGagnants === 1 ? [oui ? [11, 6] : [6, 11]] : [oui ? [11, 6] : [6, 11], oui ? [11, 8] : [8, 11]], r);

test("64 bots dans l'appli, tous différents, et chacun sait jouer", () => {
  assert.equal(TOUS_LES_BOTS.length, 64);
  assert.equal(new Set(TOUS_LES_BOTS.map(b => b.id)).size, 64);
  for (const b of TOUS_LES_BOTS) {
    assert.ok(b.nom && b.style && b.desc && b.av && b.elo, b.id);
    const s = choisirCoup(b, [{ moi: 0, adv: 1, res: "g" }, { moi: 0, adv: 1, res: "g" }, { moi: 2, adv: 1, res: "p" }], rng);
    assert.ok([0, 1, 2].includes(s), b.id);
  }
});

test("5 circuits (12, 16, 12, 12, 12 joueurs) : toi en Amateur, les plus faibles en bas, les plus forts en haut", () => {
  const c = compositionDeDepart();
  assert.equal(c.length, CIRCUITS.length);
  c.forEach((x, k) => assert.equal(x.length, TAILLES[k]));
  assert.ok(c[0].includes("moi"));
  assert.equal(new Set(c.flat()).size, 64);
  const moyenne = x => x.filter(id => id !== "moi").reduce((s, id) => s + botParId(id).elo, 0) / x.filter(id => id !== "moi").length;
  for (let k = 1; k < c.length; k++) assert.ok(moyenne(c[k]) > moyenne(c[k - 1]));
  assert.ok(c[4].includes("reinemere") && c[4].includes("titan"));
});

test("le calendrier : 11 journées, chacun rencontre chaque autre une fois, adversaires de plus en plus forts", () => {
  const ids = compositionDeDepart()[2], J = calendrier(ids);
  assert.equal(J.length, JOURNEES);
  const paires = new Set(J.flat().map(([a, b]) => [a, b].sort().join("-")));
  assert.equal(paires.size, TAILLE * (TAILLE - 1) / 2);
  J.forEach(j => assert.equal(new Set(j.flat()).size, TAILLE));
  const M = calendrier(["moi", ...ids.slice(1)]), advs = M.map(j => j.find(p => p.includes("moi")).find(x => x !== "moi"));
  for (let i = 1; i < advs.length; i++) assert.ok(botParId(advs[i]).elo >= botParId(advs[i - 1]).elo);
});

test("les chances suivent le niveau", () => {
  assert.ok(chances("reinemere", "pantoufle") > 0.95);
  assert.equal(Math.round(chances("rocky", "rocky") * 100), 50);
});

test("tout gagner : saison, playoffs, et on monte", () => {
  const C = nouvelleCarriere(hasardGraine(1));
  for (let j = 0, n = C.journees.length; j < n; j++) gagner(C, true);
  assert.equal(C.place, 1); assert.equal(C.phase, "playoffs");
  assert.equal(classement(C)[0].pts, 10);   // (Amateur : 5 journées en poule)
  assert.equal(prochainMatch(C).etape, "Quart de finale des playoffs");
  gagner(C, true); gagner(C, true); assert.equal(prochainMatch(C).cle, "finale"); gagner(C, true);
  assert.equal(C.phase, "fin"); assert.equal(C.bilan.mouvement, 1);
  assert.match(texteBilan(C), /promu en Circuit Future/);
  saisonSuivante(C, rng);
  assert.equal(circuitDuJoueur(C), 1); assert.equal(C.saison, 2); assert.equal(C.phase, "saison");
  C.circuits.forEach((x, k) => assert.equal(x.length, TAILLES[k]));
  assert.equal(new Set(C.circuits.flat()).size, 64);
  assert.equal(C.poules.length, 2); C.poules.forEach(p => assert.equal(p.length, 8)); assert.equal(C.journees.length, 7);
  assert.equal(C.palmares.length, 1);
});

test("Amateur : finaliste, on monte aussi, sans barrage", () => {
  const C = nouvelleCarriere(hasardGraine(2));
  for (let j = 0, n = C.journees.length; j < n; j++) gagner(C, true);
  gagner(C, true); gagner(C, true); gagner(C, false);
  assert.equal(C.phase, "fin"); assert.equal(C.bilan.mouvement, 1);
  assert.match(texteBilan(C), /Finaliste des playoffs : promu en Circuit Future/);
  const champion = C.issues[0].champion;
  saisonSuivante(C, rng);
  assert.equal(circuitDuJoueur(C), 1); assert.ok(C.circuits[1].includes(champion));
});

test("Amateur : demi-finale perdue, barrage des demi-finalistes, puis barrage d'accession contre le barragiste du Future", () => {
  const C = nouvelleCarriere(hasardGraine(20));
  for (let j = 0, n = C.journees.length; j < n; j++) gagner(C, true);
  gagner(C, true); gagner(C, false);
  assert.equal(C.phase, "petite"); assert.equal(prochainMatch(C).etape, "Barrage des demi-finalistes");
  const D = structuredClone(C);
  gagner(C, true);
  assert.equal(C.phase, "barrage"); assert.equal(prochainMatch(C).etape, "Barrage d'accession");
  const adv = C.issues[1].barragiste; assert.equal(prochainMatch(C).adv, adv);
  gagner(C, true); assert.equal(C.bilan.mouvement, 1); assert.match(texteBilan(C), /Barrage gagné : promu/);
  saisonSuivante(C, rng);
  assert.equal(circuitDuJoueur(C), 1); assert.ok(C.circuits[0].includes(adv));   // le barragiste descend à sa place
  C.circuits.forEach((x, k) => assert.equal(x.length, TAILLES[k]));
  // Le barrage des demi-finalistes perdu : on reste.
  gagner(D, false); assert.equal(D.phase, "fin"); assert.equal(D.bilan.mouvement, 0); assert.match(texteBilan(D), /demi-finalistes perdu/);
  saisonSuivante(D, rng); assert.equal(circuitDuJoueur(D), 0);
});

test("tout perdre en Amateur : pas de playoffs, on reste", () => {
  const C = nouvelleCarriere(hasardGraine(3));
  for (let j = 0, n = C.journees.length; j < n; j++) gagner(C, false);
  assert.equal(C.place, 6); assert.equal(C.phase, "fin"); assert.equal(C.bilan.mouvement, 0);
  assert.match(texteBilan(C), /pas de playoffs/);
  saisonSuivante(C, rng); assert.equal(circuitDuJoueur(C), 0);
});

// Monter en Future (champion de l'Amateur), puis la saison du Future avec mes résultats (true : gagné).
const monter = C => { while (C.phase !== "fin") gagner(C, true); saisonSuivante(C, rng); };
const saisonFuture = (C, res) => res.forEach(oui => gagner(C, oui));

test("Future : 2 poules de 8, 7 journées, quarts croisés ; le vainqueur monte, le finaliste joue le barrage du Challenger", () => {
  const C = nouvelleCarriere(hasardGraine(4)); monter(C);
  assert.equal(C.ou, 1); assert.equal(C.journees.length, 7);
  C.journees.forEach(j => assert.equal(new Set(j.flat()).size, 16));
  saisonFuture(C, Array(7).fill(true));
  assert.equal(C.place, 1); assert.equal(C.phase, "playoffs");
  const a = classement(C, 0).map(l => l.id), b = classement(C, 1).map(l => l.id);
  assert.deepEqual(C.tableau.tours[0].map(m => [m.a, m.b]), [[a[0], b[3]], [b[1], a[2]], [b[0], a[3]], [a[1], b[2]]]);
  assert.deepEqual(C.issues[1].relegues, [a[7], b[7]]); assert.ok(C.issues[1].barragiste);
  gagner(C, true); gagner(C, true); gagner(C, false);
  assert.equal(C.phase, "barrage"); assert.equal(prochainMatch(C).adv, C.issues[2].barragiste);
});

test("Future : 8e de sa poule, on descend", () => {
  const C = nouvelleCarriere(hasardGraine(21)); monter(C);
  saisonFuture(C, Array(7).fill(false));
  assert.equal(C.place, 8); assert.equal(C.phase, "fin"); assert.equal(C.bilan.mouvement, -1);
  assert.match(texteBilan(C), /8e de ta poule : relégué en Circuit Amateur/);
  saisonSuivante(C, rng); assert.equal(circuitDuJoueur(C), 0);
  C.circuits.forEach((x, k) => assert.equal(x.length, TAILLES[k]));
  assert.equal(new Set(C.circuits.flat()).size, 64);
});

test("Future : 7e, le match pour le maintien ; perdu, le barrage contre le gagnant du barrage des demi-finalistes de l'Amateur", () => {
  // Une victoire contre le plus faible (1re journée) : 7e.
  let C;
  for (let g = 22; ; g++) { C = nouvelleCarriere(hasardGraine(g)); monter(C); saisonFuture(C, [true, false, false, false, false, false, false]); if (C.place === 7) break; }
  assert.equal(C.phase, "maintien7"); assert.equal(prochainMatch(C).etape, "Match pour le maintien");
  const D = structuredClone(C);
  gagner(C, true); assert.equal(C.phase, "fin"); assert.equal(C.bilan.mouvement, 0); assert.match(texteBilan(C), /maintien gagné/);
  saisonSuivante(C, rng); assert.equal(circuitDuJoueur(C), 1);
  gagner(D, false);
  assert.equal(D.phase, "barrage"); assert.equal(prochainMatch(D).etape, "Barrage du maintien");
  assert.equal(prochainMatch(D).adv, D.issues[0].troisieme);
  const E = structuredClone(D);
  gagner(D, true); assert.equal(D.bilan.mouvement, 0); assert.match(texteBilan(D), /maintenu/);
  saisonSuivante(D, rng); assert.equal(circuitDuJoueur(D), 1);
  gagner(E, false); assert.equal(E.bilan.mouvement, -1);
  saisonSuivante(E, rng); assert.equal(circuitDuJoueur(E), 0);
  E.circuits.forEach((x, k) => assert.equal(x.length, TAILLES[k]));
});

test("le maintien du Challenger : perdre la demi et le match pour le maintien, on descend ; le gagner, barrage", () => {
  const C = nouvelleCarriere(hasardGraine(4)); monter(C); monter(C);
  assert.equal(C.ou, 2);
  const D = structuredClone(C);
  for (let j = 0, n = C.journees.length; j < n; j++) gagner(C, false);
  assert.equal(C.phase, "maintien"); assert.equal(prochainMatch(C).etape, "Demi-finale du maintien");
  gagner(C, false); assert.equal(prochainMatch(C).etape, "Match pour le maintien");
  gagner(C, false); assert.equal(C.bilan.mouvement, -1);
  saisonSuivante(C, rng); assert.equal(circuitDuJoueur(C), 1);

  for (let j = 0, n = D.journees.length; j < n; j++) gagner(D, false);
  gagner(D, false); gagner(D, true);
  assert.equal(D.phase, "barrage"); assert.equal(prochainMatch(D).adv, D.issues[1].finaliste);
  gagner(D, true); assert.equal(D.bilan.mouvement, 0); assert.match(texteBilan(D), /maintenu/);
  saisonSuivante(D, rng); assert.equal(circuitDuJoueur(D), 2);
});

test("gagner sa demi-finale du maintien suffit", () => {
  const C = nouvelleCarriere(hasardGraine(5)); monter(C); monter(C);
  for (let j = 0, n = C.journees.length; j < n; j++) gagner(C, false);
  gagner(C, true);
  assert.equal(C.phase, "fin"); assert.equal(C.bilan.mouvement, 0); assert.match(texteBilan(C), /Maintenu/);
});

test("éliminé en quart : on reste, le texte le dit", () => {
  const C = nouvelleCarriere(hasardGraine(6));
  for (let j = 0, n = C.journees.length; j < n; j++) gagner(C, true);
  gagner(C, false);
  assert.equal(C.bilan.mouvement, 0); assert.match(texteBilan(C), /Éliminé en quart de finale/);
  assert.ok(C.issues[0].champion && C.issues[0].finaliste);
});

test("champion de l'Élite après 4 montées ; les circuits gardent leur taille", () => {
  const C = nouvelleCarriere(hasardGraine(7));
  for (let s = 0; s < 5; s++) {
    while (C.phase !== "fin") gagner(C, true);
    if (s < 4) { assert.equal(C.bilan.mouvement, 1); saisonSuivante(C, rng); }
  }
  assert.equal(C.ou, 4); assert.equal(C.bilan.titre, "champion"); assert.match(texteBilan(C), /Champion du Circuit Élite/);
  saisonSuivante(C, rng);
  assert.equal(circuitDuJoueur(C), 4);
  C.circuits.forEach((x, k) => assert.equal(x.length, TAILLES[k]));
  assert.equal(new Set(C.circuits.flat()).size, 64);
});

test("une carrière commencée avec 5 circuits de 12 : le Future passe à 16 à la saison suivante", () => {
  const C = nouvelleCarriere(hasardGraine(30));
  const libres = C.circuits[1].splice(12);   // l'ancienne formule : 12 partout, 4 bots libres
  assert.equal(libres.length, 4);
  while (C.phase !== "fin" || coupeEnCours(C)) { const pm = prochainMatch(C); enregistrerMonMatch(C, false, pm.format.setsGagnants === 1 ? [[3, 7]] : [[6, 11], [6, 11]], rng); }
  saisonSuivante(C, rng);
  C.circuits.forEach((x, k) => assert.equal(x.length, TAILLES[k]));
  assert.equal(new Set(C.circuits.flat()).size, 64);
});

test("un circuit de bots donne un champion, un finaliste, un relégué et un barragiste distincts", () => {
  const ids = compositionDeDepart()[2], r = simulerCircuit(ids, 2, rng);
  assert.equal(new Set([r.champion, r.finaliste, r.relegue, r.barragiste]).size, 4);
  const a = simulerCircuit(compositionDeDepart()[0].map(x => x === "moi" ? "pantoufle" : x), 0, rng);
  assert.equal(new Set([a.champion, a.finaliste, a.troisieme]).size, 3);
  const g = simulerCircuit(compositionDeDepart()[1], 1, rng);
  assert.equal(new Set([g.champion, g.finaliste, g.barragiste, ...g.relegues]).size, 5);
});

test("le palmarès de la saison : champion de chaque circuit, montées et descentes", () => {
  const C = nouvelleCarriere(hasardGraine(8));
  for (let j = 0, n = C.journees.length; j < n; j++) gagner(C, true); for (let i = 0; i < 3; i++) gagner(C, true);
  saisonSuivante(C, rng);
  const p = C.palmares[0];
  assert.equal(p.circuits.length, CIRCUITS.length);
  assert.equal(p.circuits[0].champion, "moi");
  assert.ok(p.circuits[0].montes.includes("moi"));
  assert.equal(p.circuits[4].montes.length, 0); assert.equal(p.circuits[0].descendus.length, 0);
  assert.ok(p.circuits[0].montes.length >= 2);
  for (let k = 0; k < 4; k++) assert.equal(p.circuits[k].montes.length, p.circuits[k + 1].descendus.length);
  p.circuits.forEach(c => assert.ok(c.champion && c.finaliste));
});

test("la vitrine : coupe et bouclier, dès qu'ils sont acquis, puis gardés au palmarès", () => {
  const C = nouvelleCarriere(hasardGraine(9));
  assert.deepEqual(vitrine(C)[0], { coupes: [], boucliers: [] });
  for (let j = 0, n = C.journees.length; j < n; j++) gagner(C, true);
  assert.deepEqual(vitrine(C)[0], { coupes: [], boucliers: [1] });   // 1er de la saison : le bouclier tout de suite
  for (let i = 0; i < 3; i++) gagner(C, true);
  assert.deepEqual(vitrine(C)[0], { coupes: [1], boucliers: [1] });
  saisonSuivante(C, rng);
  assert.deepEqual(vitrine(C)[0], { coupes: [1], boucliers: [1] });
  assert.deepEqual(vitrine(C)[1], { coupes: [], boucliers: [] });
});

test("la Coupe Monique-Latour : 64 joueurs, un tour toutes les deux journées, la finale avant les playoffs", () => {
  const C = nouvelleCarriere(hasardGraine(10));
  assert.equal(C.coupe.tours[0].length, 32);
  assert.equal(new Set(C.coupe.tours[0].flatMap(m => [m.a, m.b])).size, 64);
  // Tout gagner, la coupe comprise.
  const joues = [];
  while (C.phase !== "fin" || coupeEnCours(C)) {
    const pm = prochainMatch(C); joues.push(pm.coupe ? "C" : "S");
    enregistrerMonMatch(C, true, pm.format.setsGagnants === 1 ? [[11, 5]] : [[11, 5], [11, 7]], rng);
  }
  // Amateur : 5 journées de poule et 3 tours de playoffs, et 6 tours de coupe : un après chaque journée, la finale avec la demie.
  assert.equal(joues.join(""), "SCSCSCSCSCCSSS");
  assert.equal(C.coupe.vainqueur, "moi");
  assert.match(texteCoupe(C), /Vainqueur/);
  assert.deepEqual(coupesML(C), [1]);
  saisonSuivante(C, rng);
  assert.deepEqual(coupesML(C), [1]);
  assert.equal(C.coupe.tour, 0); assert.equal(C.coupe.vainqueur, null);
});

test("éliminé de la coupe : elle va au bout sans moi, au rythme des journées", () => {
  const C = nouvelleCarriere(hasardGraine(11));
  gagner(C, true);
  assert.ok(prochainMatch(C).coupe);
  assert.equal(prochainMatch(C).etape, "Coupe Monique-Latour · 32e de finale");
  enregistrerMonMatch(C, false, [[8, 11]], rng);
  assert.equal(C.coupe.elimine, 0); assert.match(texteCoupe(C), /32e de finale/);
  assert.equal(C.coupe.tour, 1);                       // les 16es sont tirés, ils attendent la 2e journée
  assert.ok(C.coupe.tours[1].every(m => !m.v));
  gagner(C, true); gagner(C, true);
  assert.equal(C.coupe.tour, 3);
  for (let j = 3, n = C.journees.length; j < n; j++) gagner(C, true);
  assert.ok(C.coupe.vainqueur && C.coupe.vainqueur !== "moi");
  assert.equal(C.coupe.tours.length, TOURS_COUPE.length);
});

test("les trophées de la carrière : une montée, le bouclier, la coupe, puis l'Élite", () => {
  const C = nouvelleCarriere(hasardGraine(12));
  assert.deepEqual(titresCarriere(C), []);
  for (let j = 0, n = C.journees.length; j < n; j++) gagner(C, true);
  assert.deepEqual(titresCarriere(C), ["leader"]);
  for (let i = 0; i < 3; i++) gagner(C, true);
  assert.deepEqual(titresCarriere(C), ["promu", "leader"]);   // promu dès les playoffs gagnés
  saisonSuivante(C, rng);
  for (let s = 0; s < 3; s++) { for (let j = 0, n = C.journees.length; j < n; j++) gagner(C, true); for (let i = 0; i < 3; i++) gagner(C, true); saisonSuivante(C, rng); }
  assert.equal(C.ou, 4);
  assert.deepEqual(titresCarriere(C), ["promu", "national", "professionnel", "elite", "leader"]);
});

test("en Amateur, la saison se joue en un set de 7 ; les bots faibles sont un peu renforcés en carrière", async () => {
  const { formatSaison, renfort, coupCarriere } = await import("../app/js/carriere-logique.js");
  const C = nouvelleCarriere(hasardGraine(13));
  assert.deepEqual(prochainMatch(C).format, { pointsParSet: 7, setsGagnants: 1 });
  assert.deepEqual(formatSaison(1), { pointsParSet: 11, setsGagnants: 1 });
  gagner(C, true);
  C.resultats.filter(m => m.a !== "moi").forEach(m => assert.equal(Math.max(...m.scores[0]), 7));
  assert.equal(renfort(botParId("pantoufle")), 0.25); assert.equal(renfort(botParId("cyclo")), 0.12); assert.equal(renfort(botParId("titan")), 0);
  // Renforcé, Rocky (qui adore la Pierre) contre celui qui joue toujours Pierre : il joue Feuille bien plus souvent.
  const hist = Array.from({ length: 6 }, () => ({ moi: 1, adv: 0, res: "p" }));
  let feuilles = 0; for (let i = 0; i < 2000; i++) if (coupCarriere(botParId("rocky"), hist, Math.random) === 2) feuilles++;
  assert.ok(feuilles > 2000 * 0.3);
});

test("l'Amateur : 2 poules de 6, 5 journées, quarts croisés (1er A – 4e B…), les 5e et 6e s'arrêtent là", () => {
  const C = nouvelleCarriere(hasardGraine(14));
  assert.equal(C.poules.length, 2); C.poules.forEach(p => assert.equal(p.length, 6));
  assert.ok(C.poules[0].includes("moi"));
  assert.equal(C.journees.length, 5);
  C.journees.forEach(j => assert.equal(new Set(j.flat()).size, 12));
  for (let j = 0; j < 5; j++) gagner(C, true);
  const a = classement(C, 0).map(l => l.id), b = classement(C, 1).map(l => l.id), q = C.tableau.tours[0];
  assert.deepEqual(q.map(m => [m.a, m.b]), [[a[0], b[3]], [b[1], a[2]], [b[0], a[3]], [a[1], b[2]]]);
  // En Future : 2 poules de 8 ; au Challenger, on revient à la saison de 11 journées.
  for (let i = 0; i < 3; i++) gagner(C, true);
  saisonSuivante(C, rng);
  assert.equal(C.poules.length, 2); assert.equal(C.journees.length, 7);
  while (C.phase !== "fin") gagner(C, true);
  saisonSuivante(C, rng);
  assert.equal(C.ou, 2); assert.equal(C.poules, null); assert.equal(C.journees.length, 11);
});

test("une saison d'Amateur commencée en 11 journées repart en poules", () => {
  const C = nouvelleCarriere(hasardGraine(15));
  C.poules = null; C.journees = calendrier(C.circuits[0]); C.journee = 3;
  assert.equal(migrerCarriere(C), true);
  assert.equal(C.saison, 1); assert.equal(C.journees.length, 5); assert.equal(C.journee, 0);
  assert.equal(migrerCarriere(C), false);
});

test("les commentaires d'avant et d'après match collent à la situation", () => {
  const C = nouvelleCarriere(hasardGraine(16));
  assert.equal(prochainMatch(C).voix, null);                          // une journée de championnat : pas de « premier tour »
  gagner(C, true);
  const mc = prochainMatch(C);
  assert.ok(mc.coupe); assert.equal(mc.voix, "premiers");            // le 1er tour de coupe
  enregistrerMonMatch(C, true, [[7, 3]], rng);
  gagner(C, true);
  assert.equal(prochainMatch(C).coupe && prochainMatch(C).voix, null);   // 16es : ni premier tour, ni quart
  const M = nouvelleCarriere(hasardGraine(17)); M.phase = "maintien"; M.tableau = { type: "maintien", tour: 0, tours: [[{ a: "moi", b: "rocky", v: null, score: "" }]] }; M.coupe = null;
  assert.equal(prochainMatch(M).voix, null);                          // le maintien : pas les répliques d'une demi-finale de tournoi
});
