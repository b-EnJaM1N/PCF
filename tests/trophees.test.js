import { test } from "node:test";
import assert from "node:assert/strict";
import { TITRES, FAMILLES, profilParDefaut, enregistrerMatch, accorderTitres, titresEnLigne, estVerrouille, verrouDe } from "../app/js/profil.js";
import { compterPoignee } from "../app/js/poignee.js";
import { nouvellesStats, suivreCoup } from "../app/js/stats-match.js";
import { nouveauMatch, jouerCoup, PIERRE, CISEAUX } from "../app/js/regles.js";
import { FONDS, GANTS, POIGNETS, MOTIFS, MOTIFS_GANT, SYMBOLES, avatarSVG } from "../app/js/avatar.js";

const TABLES = { fond: FONDS, gant: GANTS, poignet: POIGNETS, motif: MOTIFS, gantMotif: MOTIFS_GANT, symbole: SYMBOLES };

// Un match joué : "a" = point pour moi, "b" = pour l'adversaire.
// Un seul point : match en 1 set de 1 point (sinon, 1 set de 11 points).
function match(suite) {
  const m = nouveauMatch({ pointsParSet: suite.length === 1 ? 1 : 11, setsGagnants: 1 }), st = nouvellesStats();
  for (const c of suite) suivreCoup(st, m, c === "a" ? jouerCoup(m, PIERRE, CISEAUX) : jouerCoup(m, CISEAUX, PIERRE));
  return { match: m, stats: st };
}
const fin = (P, suite, extra = {}) => enregistrerMatch(P, { ...match(suite), devines: 0, lisibles: 0, adversaire: { id: "rocky", elo: 850, nom: "Rocky" }, date: 1, ...extra }).map(t => t.id);

test("34 trophées en 7 familles, chaque élément à débloquer existe dans l'avatar", () => {
  assert.equal(TITRES.length, 34);
  assert.equal(new Set(TITRES.map(t => t.id)).size, 34);
  for (const t of TITRES) assert.ok(FAMILLES.some(f => f.id === t.famille), t.id);
  for (const t of TITRES.filter(x => x.objet)) assert.ok(TABLES[t.objet[0]]?.[t.objet[1]], `${t.id} : ${t.objet}`);
  // chaque famille a au moins un trophée qui débloque quelque chose
  for (const f of FAMILLES) assert.ok(TITRES.some(t => t.famille === f.id && t.objet), f.id);
});

test("les nouveaux motifs de gant se dessinent, et les plus rares sont verrouillés", () => {
  for (const g of Object.keys(MOTIFS_GANT)) assert.match(avatarSVG({ symbole: "feuille", gant: "rouge", poignet: "blanc", gantMotif: g }), /<svg/);
  const P = profilParDefaut();
  assert.equal(P.av.gantMotif, "uni");
  assert.ok(!estVerrouille(P, "gantMotif", "rayures") && !estVerrouille(P, "gantMotif", "pois"));
  for (const k of ["bicolore", "coutures", "bandeau"]) assert.ok(estVerrouille(P, "gantMotif", k), k);
  assert.equal(verrouDe("gantMotif", "coutures").id, "legende");
});

test("fair-play : poignées de main chaleureuses, froides, et main tendue après une défaite", () => {
  const P = profilParDefaut();
  for (let i = 0; i < 10; i++) compterPoignee(P, "franche", true);
  for (let i = 0; i < 10; i++) compterPoignee(P, "froide", true);
  assert.equal(P.mainsTendues, 10, "seules les poignées chaleureuses comptent");
  const ids = fin(P, "a");
  for (const id of ["gentleman", "main_tendue", "glacon"]) assert.ok(ids.includes(id), id);
  assert.ok(!ids.includes("fairplay"));
  for (let i = 0; i < 40; i++) compterPoignee(P, "normale");
  assert.ok(fin(P, "a").includes("fairplay"));
});

test("séries et fanny", () => {
  const P = profilParDefaut();
  const ids = fin(P, "aaaaaaaaaaa");
  for (const id of ["premier", "rouleau", "implacable", "fanny"]) assert.ok(ids.includes(id), id);
  for (let i = 0; i < 3; i++) fin(P, "a");
  assert.ok(fin(P, "a").includes("intouchable"), "5 victoires d'affilée");
  P.serieEnCours = 9;
  assert.ok(fin(P, "a").includes("legende"));
  assert.ok(!estVerrouille(P, "gantMotif", "coutures"));
});

test("endurance, habitudes et Grand Chelem", () => {
  const P = profilParDefaut();
  P.matchs = 99; P.heures.nuit = 10; P.heures.matin = 9; P.tournoisGagnes = 4;
  const ids = fin(P, "b");
  for (const id of ["pilier", "oiseau_de_nuit", "grand_chelem"]) assert.ok(ids.includes(id), id);
  assert.ok(!ids.includes("leve_tot"));
});

test("duels : jusqu'au bout, tueur de géant, revanche, finale et Sit & Go", () => {
  const P = profilParDefaut(), h = { id: "h:abc", elo: 1200, nom: "Ami#1" };
  P.duelsFinis = 23;
  fin(P, "b", { adversaire: h, abandon: true });
  assert.equal(P.duelsFinis, 23, "un abandon ne compte pas");
  fin(P, "b", { adversaire: h });
  let ids = fin(P, "a", { adversaire: h, officiel: true, niveauMoi: 1200, niveauAdv: 1400 });
  for (const id of ["jusquau_bout", "tueur_geant", "revanche"]) assert.ok(ids.includes(id), id);
  ids = fin(P, "a", { adversaire: { id: "h:xyz", elo: 1200 }, finaleEnLigne: true, sitAndGo: true });
  assert.ok(ids.includes("finaliste") && ids.includes("roi_sng"));
  // contre un bot, pas de revanche
  const Q = profilParDefaut();
  fin(Q, "b"); assert.ok(!fin(Q, "a").includes("revanche"));
});

test("cercles et tournois en ligne, d'après les données du serveur", () => {
  assert.deepEqual(titresEnLigne({ cree: true }), ["fondateur"]);
  assert.deepEqual(titresEnLigne({ cercles: [{ role: "admin", membres: 10, rang: 3 }, { role: "membre", membres: 5, rang: 1 }] }), ["rassembleur", "patron"]);
  assert.deepEqual(titresEnLigne({ cercles: [{ role: "membre", membres: 12, rang: 1 }] }), ["patron"]);
  assert.deepEqual(titresEnLigne({ cercles: [{ role: "admin", membres: 4, rang: 1 }] }), []);
  assert.deepEqual(titresEnLigne({ duelsCercle: 10 }), ["derby"]);
  assert.deepEqual(titresEnLigne({ tournois: [{ createur: true, cercle: { id: 1 }, phase: "termine" }, { createur: true, cercle: null, phase: "termine" }] }), ["organisateur"]);
  const P = profilParDefaut();
  assert.deepEqual(accorderTitres(P, ["fondateur", "inconnu"], 5).map(t => t.id), ["fondateur"]);
  assert.deepEqual(accorderTitres(P, ["fondateur"]), [], "déjà obtenu");
});
