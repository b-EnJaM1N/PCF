import { test } from "node:test";
import assert from "node:assert/strict";
import { maPlace, adversaireDe, coupVuDe, rejouer, coherent, adversaireHumain, tempsRestant, lienDefi, codeDepuisAdresse } from "../app/js/duel-logique.js";
import { nouveauMatch, jouerCoup, PIERRE, CISEAUX, FEUILLE } from "../app/js/regles.js";
import { profilParDefaut, enregistrerMatch } from "../app/js/profil.js";
import { nouvellesStats } from "../app/js/stats-match.js";
import { presentation } from "../app/js/presentation.js";
import { rngFixe } from "./outils.js";

const duel = coups => ({ j0: "A", j1: "B", points_par_set: 7, sets_gagnants: 2, coups, points: [0, 0], sets: [0, 0] });

test("chaque joueur se voit côté jaune", () => {
  const d = duel([]);
  assert.equal(maPlace(d, "A"), 0); assert.equal(maPlace(d, "B"), 1); assert.equal(maPlace(d, "Z"), null);
  assert.equal(adversaireDe(d, "A"), "B"); assert.equal(adversaireDe(d, "B"), "A");
  const c = { a: PIERRE, b: FEUILLE, g: 1, auto: [false, true] };
  assert.deepEqual(coupVuDe(c, 0), { a: PIERRE, b: FEUILLE, auto: [false, true] });
  assert.deepEqual(coupVuDe(c, 1), { a: FEUILLE, b: PIERRE, auto: [true, false] });
});

test("rejouer les coups du serveur donne le même score des deux côtés", () => {
  const rng = rngFixe(8), serveur = nouveauMatch({ pointsParSet: 7, setsGagnants: 2 }), coups = [];
  while (!serveur.termine) {
    const a = Math.floor(rng() * 3), b = Math.floor(rng() * 3), e = jouerCoup(serveur, a, b);
    coups.push({ a, b, g: e.gagnant, auto: [false, false] });
  }
  const d = { ...duel(coups), points: serveur.points, sets: serveur.sets };
  const vuA = rejouer(d, 0), vuB = rejouer(d, 1);
  assert.ok(coherent(vuA.match, d, 0)); assert.ok(coherent(vuB.match, d, 1));
  assert.deepEqual(vuB.match.sets, [serveur.sets[1], serveur.sets[0]]);
  assert.equal(vuA.match.vainqueur, serveur.vainqueur); assert.equal(vuB.match.vainqueur, 1 - serveur.vainqueur);
  assert.equal(vuA.evenements.length, coups.length);
  assert.ok(!coherent(vuA.match, { ...d, sets: [9, 9] }, 0), "une différence est détectée");
});

test("un adversaire humain décrit pour la présentation", () => {
  const fiche = { ...profilParDefaut(), matchs: 10, victoires: 6, signes: [2, 3, 30], devines: 40, lisibles: 100, elo: 1310, titres: { premier: 1, habitue: 2 } };
  const h = adversaireHumain({ id: "uid-b", pseudo: "Bob", numero: 4821, drapeau: "🇧🇪", avatar: { symbole: "ciseaux" }, fiche, classement: 1310 });
  assert.equal(h.id, "h:uid-b"); assert.equal(h.nom, "Bob"); assert.ok(h.humain);
  assert.equal(h.specialite, "📄 Feuille"); assert.equal(h.imprevisibilite, 80); assert.equal(h.titres, 2); assert.equal(h.av.symbole, "ciseaux");
  assert.equal(h.desc, "6 V – 4 D · 60 % de victoires");
  const pr = presentation(profilParDefaut(), h, { classementMoi: 1250 });
  assert.equal(pr.bandeau, "Duel officiel");
  assert.equal(presentation(profilParDefaut(), h, { classe: false }).bandeau, "Duel amical");
  assert.equal(pr.lignes[0].label, "Niveau officiel");
  assert.equal(pr.adversaire.bilan, "6 V – 4 D · 60 % de victoires");
  assert.deepEqual([pr.lignes[0].g, pr.lignes[0].d, pr.lignes[0].avantage], ["1250", "1310", "d"]);
  assert.equal(presentation(profilParDefaut(), h).lignes[0].g, "–", "classement inconnu : un tiret");
  assert.equal(pr.lignes[4].d, "2");
  const nouveau = adversaireHumain({ id: "x", pseudo: "Neuf", numero: 1000, fiche: {} });
  assert.equal(nouveau.desc, "Premier match officiel"); assert.equal(nouveau.imprevisibilite, null); assert.equal(nouveau.specialite, "–");
});

test("un duel ne change pas le niveau, mais remplit la fiche", () => {
  const P = profilParDefaut(), m = nouveauMatch({ pointsParSet: 7, setsGagnants: 2 });
  for (let i = 0; i < 14; i++) jouerCoup(m, PIERRE, CISEAUX);
  enregistrerMatch(P, { match: m, stats: nouvellesStats(), devines: 0, lisibles: 0, adversaire: { id: "h:uid-b", nom: "Bob#4821" }, compteNiveau: false });
  assert.equal(P.elo, 1200); assert.deepEqual(P.historiqueElo, [1200]);
  assert.equal(P.matchs, 1); assert.equal(P.faceAFace["h:uid-b"].v, 1); assert.equal(P.derniers[0].nomAdv, "Bob#4821");
});

test("temps restant d'après l'heure du serveur", () => {
  assert.equal(tempsRestant(null, 0), null);
  assert.equal(tempsRestant("2026-01-01T00:00:05Z", 1000, Date.parse("2026-01-01T00:00:00Z")), 4000);
});

test("liens d'invitation", () => {
  assert.equal(lienDefi("https://x.io/PCF/", "abc123def0"), "https://x.io/PCF/?duel=abc123def0");
  assert.equal(codeDepuisAdresse("?duel=abc123def0"), "abc123def0");
  assert.equal(codeDepuisAdresse("?duel=<script>"), null);
  assert.equal(codeDepuisAdresse(""), null);
});
