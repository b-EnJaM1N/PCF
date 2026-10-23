// L'Aventure de Chifoumania : manies des adversaires, combat à la barre de vie, pouvoirs, étoiles et progression.
import { test } from "node:test";
import assert from "node:assert/strict";
import { PIERRE, CISEAUX, FEUILLE } from "../docs/prototypes/aventure/js/regles.js";
import {
  MONDES, POUVOIRS, MAX_POUVOIRS, HEROS, GAIN, FORCE_RAGE, nouvelleProgression, normaliser, heros, ouvert, termine,
  etoilesDe, apresVictoire, nouveauCombat, chancesDe, signeAdversaire, indiceLoupe, peutUtiliser, utiliser, jouer,
  intentionDe, tempsDe, peutArmer, armer, ENERGIE_MAX, SOIN_FEUILLE, TEMPS_MIN, PIQUES,
} from "../docs/prototypes/aventure/js/aventure-logique.js";

const M = MONDES[0];
const A = id => M.adversaires.find(a => a.id === id);
const H = { vie: 100, force: 10 };
// Joue une suite de coups [moi, lui] et renvoie le combat.
const suite = (adv, coups, c = nouveauCombat(adv, H)) => coups.reduce((x, [m, l]) => jouer(x, adv, m, l).combat, c);
const prefere = (adv, c) => indiceLoupe(adv, c).signe;

test("le Monde 1 : 6 combats, le dernier est le Gardien de la Forêt (le boss), chacun avec sa mission et sa récompense", () => {
  assert.equal(M.adversaires.length, 6);
  assert.deepEqual(M.adversaires.map(a => a.id), ["bambi", "gobelin", "pipistrelle", "amanite", "loup", "gardien"]);
  assert.ok(A("gardien").boss);
  for (const a of M.adversaires) {
    assert.ok(a.mission && a.bravo && a.replique, a.id);
    assert.ok(POUVOIRS[a.recompense] || ["choix", "gant"].includes(a.recompense), a.id);
    const t = chancesDe(a, nouveauCombat(a, H));
    assert.ok(Math.abs(t[0] + t[1] + t[2] - 1) < 1e-9, `${a.id} : chances = 1`);
  }
  assert.ok(A("gobelin").image, "le Gobelin a son dessin");
});

test("les manies : Bambi têtu, le Gobelin et sa massue, Pipistrelle jamais deux fois, l'Amanite copie", () => {
  const bambi = A("bambi");
  let c = suite(bambi, [[FEUILLE, PIERRE]]);                       // Bambi perd une fois : il garde la Pierre
  assert.deepEqual(chancesDe(bambi, c), [1, 0, 0]);
  c = suite(bambi, [[FEUILLE, PIERRE]], c);                        // deux fois de suite : il change
  assert.equal(chancesDe(bambi, c)[PIERRE], 0);
  c = suite(bambi, [[PIERRE, CISEAUX]], c);                        // nouveau signe, une défaite : il le garde
  assert.deepEqual(chancesDe(bambi, c), [0, 1, 0]);
  assert.equal(chancesDe(A("gobelin"), c)[PIERRE], 0.5);
  const pip = A("pipistrelle");
  assert.equal(chancesDe(pip, suite(pip, [[PIERRE, FEUILLE]]))[FEUILLE], 0);
  const am = A("amanite");
  assert.equal(prefere(am, suite(am, [[CISEAUX, PIERRE]])), CISEAUX);
});

test("le Loup insiste quand il gagne et prend le signe qui te bat quand il perd", () => {
  const loup = A("loup");
  assert.equal(prefere(loup, suite(loup, [[CISEAUX, PIERRE]])), PIERRE);
  assert.equal(prefere(loup, suite(loup, [[PIERRE, CISEAUX]])), FEUILLE);
});

test("un combat : coup gagné = sa vie baisse de ta force, coup perdu = l'inverse, égalité = rien", () => {
  const g = A("gobelin");
  let { combat: c, coup } = jouer(nouveauCombat(g, H), g, FEUILLE, PIERRE);
  assert.equal(coup.gagnant, 0); assert.equal(c.vie[1], g.vie - H.force);
  ({ combat: c, coup } = jouer(c, g, CISEAUX, PIERRE));
  assert.equal(coup.gagnant, 1); assert.equal(c.vie[0], H.vie - g.force);
  ({ combat: c, coup } = jouer(c, g, PIERRE, PIERRE));
  assert.equal(coup.gagnant, null); assert.deepEqual(c.vie, [H.vie - g.force, g.vie - H.force]);
  c = suite(g, Array(4).fill([FEUILLE, PIERRE]), c);
  assert.equal(c.fin, "victoire"); assert.equal(c.vie[1], 0);
  assert.throws(() => jouer(c, g, FEUILLE, PIERRE));
});

test("le poison de l'Amanite et la morsure du Loup", () => {
  const am = A("amanite");
  const { coup } = jouer(nouveauCombat(am, H), am, PIERRE, PIERRE);
  assert.equal(coup.degats[0], am.poison); assert.ok(coup.effets.includes("poison"));
  const loup = A("loup");
  const c = suite(loup, [[CISEAUX, PIERRE], [CISEAUX, PIERRE]]);
  const r = jouer(c, loup, CISEAUX, PIERRE);
  assert.equal(r.coup.degats[0], 2 * loup.force); assert.ok(r.coup.effets.includes("morsure"));
});

test("le Gardien entre en rage sous la moitié de sa vie : force plus grande, racines qui bloquent les pouvoirs", () => {
  const boss = A("gardien"), fort = { vie: 150, force: 40 };
  let c = nouveauCombat(boss, fort);
  let r = jouer(c, boss, PIERRE, CISEAUX); c = r.combat;
  assert.ok(!c.enRage);
  r = jouer(c, boss, PIERRE, CISEAUX); c = r.combat;              // 160 − 80 = 80 : la moitié
  assert.ok(c.enRage); assert.equal(c.force[1], FORCE_RAGE);
  assert.ok(r.coup.effets.includes("rage") && r.coup.effets.includes("racines"));
  assert.match(peutUtiliser(c, "loupe"), /racines/);
  c = suite(boss, [[PIERRE, PIERRE], [PIERRE, PIERRE]], c);
  assert.equal(peutUtiliser(c, "loupe"), null);
  assert.equal(prefere(boss, c), FEUILLE, "en rage, il joue ce qui bat ton dernier signe");
});

test("les pouvoirs : Bouclier, Coup double, Potion, Loupe", () => {
  const g = A("gobelin");
  let c = utiliser(nouveauCombat(g, H), "bouclier");
  let r = jouer(c, g, PIERRE, PIERRE); assert.ok(r.combat.bouclier, "une égalité ne consomme pas le bouclier");
  r = jouer(r.combat, g, CISEAUX, PIERRE);
  assert.equal(r.combat.vie[0], H.vie); assert.ok(!r.combat.bouclier);
  c = utiliser(r.combat, "double");
  r = jouer(c, g, FEUILLE, PIERRE); assert.equal(r.combat.vie[1], g.vie - 2 * H.force);
  assert.match(peutUtiliser(r.combat, "potion"), /pleine/);
  c = suite(g, [[CISEAUX, PIERRE]], r.combat);
  c = utiliser(c, "potion"); assert.equal(c.vie[0], H.vie);
  c = utiliser(c, "loupe"); assert.equal(c.loupe, 3);
  assert.deepEqual(indiceLoupe(g, c), { signe: PIERRE, pourcent: 50 });
  c = suite(g, [[PIERRE, PIERRE], [PIERRE, PIERRE], [PIERRE, PIERRE]], c);
  assert.equal(c.loupe, 0);
});

test("le signe tiré suit les chances de l'adversaire", () => {
  const pip = A("pipistrelle"), c = suite(pip, [[PIERRE, FEUILLE]]);
  for (const x of [0, 0.3, 0.6, 0.99]) assert.notEqual(signeAdversaire(pip, c, () => x), FEUILLE);
});

test("étoiles : 1 pour la victoire, 2 au-dessus de la moitié de la vie, 3 au-dessus de 80 %", () => {
  assert.equal(etoilesDe(0, 100), 0);
  assert.equal(etoilesDe(30, 100), 1);
  assert.equal(etoilesDe(60, 100), 2);
  assert.equal(etoilesDe(81, 100), 3);
});

test("progression : combats ouverts un par un, le héros grandit, 3 pouvoirs au plus, meilleur score gardé", () => {
  let p = nouvelleProgression();
  assert.deepEqual(heros(p, M), HEROS);
  assert.ok(ouvert(p, M, 0)); assert.ok(!ouvert(p, M, 1));
  let r = apresVictoire(p, A("bambi"), 2); p = r.progression;
  assert.ok(r.nouveau); assert.equal(r.pouvoir, "loupe"); assert.ok(ouvert(p, M, 1));
  assert.deepEqual(heros(p, M), { vie: HEROS.vie + GAIN.vie, force: HEROS.force + GAIN.force });
  r = apresVictoire(p, A("bambi"), 1); p = r.progression;
  assert.ok(!r.nouveau); assert.equal(p.etoiles.bambi, 2, "on garde le meilleur score");
  assert.deepEqual(heros(p, M), { vie: HEROS.vie + GAIN.vie, force: HEROS.force + GAIN.force }, "rejouer ne rend pas plus fort");
  p = apresVictoire(p, A("gobelin"), 3).progression;
  assert.equal(p.pouvoirs.length, MAX_POUVOIRS);
  r = apresVictoire(p, A("pipistrelle"), 3);
  assert.equal(r.pouvoir, null, "sac plein"); p = r.progression;
  p.pouvoirs = []; p = apresVictoire(p, A("amanite"), 3).progression;
  assert.equal(apresVictoire(p, A("loup"), 3, "double").pouvoir, "double", "le Loup : pouvoir au choix");
  p = apresVictoire(apresVictoire(p, A("loup"), 3, "double").progression, A("gardien"), 1).progression;
  assert.ok(termine(p, M));
  const trou = { ...nouvelleProgression(), etoiles: { loup: 3 } };
  assert.ok(!ouvert(trou, M, 5), "une étoile isolée sur le Loup n'ouvre pas le boss");
  assert.ok(ouvert(trou, M, 0) && !ouvert(trou, M, 1));
});

test("une progression abîmée est remise d'aplomb", () => {
  assert.deepEqual(normaliser(null), nouvelleProgression());
  const p = normaliser({ introVue: 1, etoiles: { bambi: 3, gobelin: 7 }, pouvoirs: ["loupe", "fusée", "potion", "double", "bouclier"] });
  assert.deepEqual(p, { introVue: true, etoiles: { bambi: 3 }, pouvoirs: ["loupe", "potion", "double"] });
  assert.deepEqual(normaliser({ etoiles: { grok: 2 } }).etoiles, { gardien: 2 }, "l'ancien nom du boss");
});

// ---------------------------------------------------------------- le combat vivant (23 octobre)
test("l'intention : un adversaire franc annonce son vrai signe, un bluffeur en annonce un autre ; étourdi, il ne ment pas", () => {
  const bambi = A("bambi"), loup = A("loup"), c = nouveauCombat(loup, H);
  for (const s of [PIERRE, CISEAUX, FEUILLE]) assert.equal(intentionDe(bambi, nouveauCombat(bambi, H), s, () => 0.99), s);
  assert.equal(intentionDe(loup, c, PIERRE, () => 0.1), PIERRE);           // tirage sous sa franchise : vrai
  assert.notEqual(intentionDe(loup, c, PIERRE, () => 0.9), PIERRE);        // au-dessus : bluff
  assert.equal(intentionDe(loup, { ...c, etourdi: true }, PIERRE, () => 0.99), PIERRE);
  for (const a of M.adversaires) assert.ok(a.franchise > 0 && a.franchise <= 1 && a.temps >= TEMPS_MIN, a.id);
});

test("le temps : chacun le sien, le Gardien en rage presse plus ; trop lent = coup perdu", () => {
  const g = A("gardien"), c = nouveauCombat(g, H);
  assert.ok(tempsDe(g, { ...c, enRage: true }) < tempsDe(g, c));
  assert.ok(tempsDe(A("bambi"), c) > tempsDe(A("loup"), c));
  const { combat, coup } = jouer(c, g, null, PIERRE);
  assert.equal(coup.gagnant, 1); assert.ok(coup.effets.includes("lent"));
  assert.equal(combat.vie[0], H.vie - g.force);
});

test("l'énergie : +1 par coup gagné, 3 au plus ; le coup spécial s'arme seulement plein", () => {
  const g = A("gobelin");
  let c = suite(g, [[FEUILLE, PIERRE], [PIERRE, PIERRE], [FEUILLE, PIERRE]]);
  assert.equal(c.energie, 2); assert.equal(peutArmer(c), false);
  assert.throws(() => armer(c));
  c = suite(g, [[FEUILLE, PIERRE], [FEUILLE, PIERRE]], c);
  assert.equal(c.energie, ENERGIE_MAX);
  assert.equal(armer(c).arme, true); assert.equal(armer(armer(c)).arme, false);
});

test("les coups spéciaux : Pierre ×2, Feuille soigne, Ciseaux étourdit ; raté, l'énergie est perdue", () => {
  const g = A("gobelin"), plein = { ...nouveauCombat(g, H), energie: ENERGIE_MAX, arme: true };
  let r = jouer(plein, g, PIERRE, CISEAUX);
  assert.equal(r.coup.special, PIERRE); assert.equal(r.combat.vie[1], g.vie - 2 * H.force); assert.equal(r.combat.energie, 0);
  r = jouer({ ...plein, vie: [60, g.vie] }, g, FEUILLE, PIERRE);
  assert.equal(r.coup.soin, SOIN_FEUILLE); assert.equal(r.combat.vie[0], 60 + SOIN_FEUILLE);
  r = jouer(plein, g, CISEAUX, FEUILLE);
  assert.equal(r.combat.etourdi, true);
  assert.equal(jouer(r.combat, g, PIERRE, PIERRE).combat.etourdi, false);   // ça ne dure qu'un coup
  r = jouer(plein, g, CISEAUX, PIERRE);
  assert.equal(r.coup.special, null); assert.equal(r.combat.energie, 0); assert.equal(r.combat.arme, false);
});

test("L'Enchanteresse remplace Monique : plus de trace de HandSlam dans les textes", () => {
  const textes = [M.intro, ...M.adversaires.flatMap(a => [a.mission, a.bravo]), ...PIQUES].join(" ");
  assert.doesNotMatch(textes, /1997|Monique|HandSlam|scarabée|Hibou|Pia/);
  assert.match(M.intro, /Enchanteresse/);
});
