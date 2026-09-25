import { test } from "node:test";
import assert from "node:assert/strict";
import { profilParDefaut, normaliserProfil, enregistrerMatch, nouvelElo, remettreAZero, estVerrouille, dernierTitre } from "../app/js/profil.js";
import { nouvellesStats, suivreCoup } from "../app/js/stats-match.js";
import { nouveauTournoi, monMatch, enregistrerMonMatch, terminerTour, simulerMatch, SETS_PAR_TOUR } from "../app/js/tournoi.js";
import { nouveauMatch, jouerCoup, PIERRE, CISEAUX } from "../app/js/regles.js";
import { rngFixe } from "./outils.js";

// Joue une suite de points : "a" = point pour moi, "b" = pour l'adversaire.
function jouer(m, st, suite) {
  for (const c of suite) suivreCoup(st, m, c === "a" ? jouerCoup(m, PIERRE, CISEAUX) : jouerCoup(m, CISEAUX, PIERRE));
}

test("ELO : battre plus fort rapporte plus", () => {
  assert.equal(nouvelElo(1200, 1200, true), 1216);
  assert.equal(nouvelElo(1200, 1200, false), 1184);
  assert.ok(nouvelElo(1200, 1400, true) - 1200 > nouvelElo(1200, 1050, true) - 1200);
});

test("stats du match : balles, séries, remontée", () => {
  const m = nouveauMatch({ pointsParSet: 7, setsGagnants: 2 }), st = nouvellesStats();
  jouer(m, st, "bbbbbbb");                 // premier set perdu 0–7
  assert.ok(st.premierSetPerdu);
  jouer(m, st, "bbbbb" + "aaaaaaa");       // 7–5 après avoir été mené 0–5
  assert.equal(st.meilleureRemontee, 5);
  assert.equal(st.meilleureSerie, 7);
  jouer(m, st, "bbbbbb");                  // 0–6 : balle de match pour lui
  jouer(m, st, "aaaaaaaa");                // je sauve 6 balles de match et gagne 8–6
  assert.equal(st.ballesDeMatchSauvees, 6);
  assert.ok(m.termine); assert.equal(m.vainqueur, 0);
});

test("fin de match : la fiche et les titres se mettent à jour", () => {
  const P = profilParDefaut(), m = nouveauMatch({ pointsParSet: 7, setsGagnants: 2 }), st = nouvellesStats();
  jouer(m, st, "bbbbbbb" + "bbbbbaaaaaaa" + "bbbbbb" + "aaaaaaaa");
  const nouveaux = enregistrerMatch(P, { match: m, stats: st, devines: 5, lisibles: 30, adversaire: { id: "rocky", elo: 1050 }, date: 1 });
  assert.equal(P.matchs, 1); assert.equal(P.victoires, 1); assert.equal(P.serieEnCours, 1);
  assert.deepEqual(P.sets, [2, 1]);
  assert.equal(P.faceAFace.rocky.v, 1);
  assert.ok(P.elo > 1200);
  assert.deepEqual(nouveaux.map(t => t.id).sort(), ["imprevisible", "premier", "remontada", "rouleau", "sangfroid"]);
  assert.equal(P.derniers[0].detail, "0–7, 7–5, 8–6");
  assert.equal(P.decisifsJoues, 1); assert.equal(P.decisifsGagnes, 1);
  assert.ok(!estVerrouille(P, "poignet", "or"));
  assert.ok(estVerrouille(P, "fond", "or"));
  assert.notEqual(dernierTitre(P), "Espoir du circuit");
});

test("remise à zéro : on garde pseudo et pays, on retire les éléments à débloquer", () => {
  const P = profilParDefaut(); P.pseudo = "Benji"; P.drapeau = "🇧🇪"; P.matchs = 4; P.av.poignet = "or"; P.av.gant = "jaune";
  const N = remettreAZero(P);
  assert.equal(N.pseudo, "Benji"); assert.equal(N.drapeau, "🇧🇪"); assert.equal(N.matchs, 0);
  assert.equal(N.av.poignet, "rouge"); assert.equal(N.av.gant, "jaune");
});

test("une fiche abîmée ou ancienne est complétée", () => {
  assert.equal(normaliserProfil(null).elo, 1200);
  const P = normaliserProfil({ pseudo: "X", av: { gant: "vert" }, signes: "oups" });
  assert.equal(P.pseudo, "X"); assert.equal(P.av.gant, "vert"); assert.equal(P.av.fond, "court"); assert.deepEqual(P.signes, [0, 0, 0]);
});

test("tournoi : 8 joueurs, têtes de série, quarts en 2 sets, finale en 3", () => {
  assert.deepEqual(SETS_PAR_TOUR, [2, 2, 3]);
  const T = nouveauTournoi(1200);
  assert.equal(T.tours[0].length, 4);
  const joueurs = T.tours[0].flatMap(m => [m.a, m.b]);
  assert.equal(new Set(joueurs).size, 8);
  assert.deepEqual([T.tours[0][0].a, T.tours[0][0].b], ["professeur", "rocky"], "tête de série 1 contre 8");
  assert.ok(monMatch(T));
});

test("tournoi complet en gagnant tout", () => {
  const rng = rngFixe(9), T = nouveauTournoi(1200);
  for (let tour = 0; tour < 3; tour++) {
    enregistrerMonMatch(T, true, [SETS_PAR_TOUR[tour], 0]);
    terminerTour(T, 11, rng);
  }
  assert.ok(T.fini); assert.equal(T.champion, "moi");
});

test("tournoi : éliminé en quart, le reste est simulé", () => {
  const rng = rngFixe(4), T = nouveauTournoi(1200);
  enregistrerMonMatch(T, false, [1, 2]);
  assert.ok(T.elimine); assert.equal(T.tourElimination, 0);
  while (!T.fini) terminerTour(T, 11, rng);
  assert.notEqual(T.champion, "moi");
  assert.throws(() => terminerTour(nouveauTournoi(1200), 11, rng), /pas encore joué/);
});

test("match simulé entre bots : un vainqueur et un score valide", () => {
  const r = simulerMatch("rocky", "professeur", 3, 11, rngFixe(1));
  assert.ok(["rocky", "professeur"].includes(r.v));
  assert.match(r.score, /^(3–[012]|[012]–3)$/);
});

test("symbole de l'avatar : Pierre par défaut, ajouté aux anciennes fiches", () => {
  assert.equal(profilParDefaut().av.symbole, "pierre");
  assert.equal(normaliserProfil({ av: { gant: "vert" } }).av.symbole, "pierre");
  assert.equal(normaliserProfil({ av: { symbole: "ciseaux" } }).av.symbole, "ciseaux");
});
