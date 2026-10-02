import test from "node:test";
import assert from "node:assert/strict";
import { nomTour, monTour, texteDuree, texteReste, texteFin, monMatch, tableau, resume, lienTournoi, codeTournoiDepuisAdresse } from "../app/js/tournoi-logique.js";

test("noms des tours", () => {
  assert.equal(nomTour(3, 3), "Finale"); assert.equal(nomTour(2, 3), "Demi-finales"); assert.equal(nomTour(1, 3), "Quarts de finale");
  assert.equal(nomTour(1, 5), "Seizièmes de finale"); assert.equal(nomTour(1, 6), "Tour 1");
  assert.equal(monTour(1, 3), "ton quart de finale"); assert.equal(monTour(3, 3), "ta finale");
});

test("durées et temps restant", () => {
  assert.equal(texteDuree(15), "15 min"); assert.equal(texteDuree(4320), "3 jours");
  const t0 = Date.parse("2026-01-01T10:00:00Z");
  assert.equal(texteReste("2026-01-01T10:00:40Z", t0), "40 s");
  assert.equal(texteReste("2026-01-01T10:12:00Z", t0), "12 min");
  assert.equal(texteReste("2026-01-01T13:05:00Z", t0), "3 h 05");
  assert.equal(texteReste("2026-01-03T14:00:00Z", t0), "2 j 4 h");
  assert.equal(texteReste("2026-01-01T09:00:00Z", t0), null);
  assert.equal(texteFin("tete_de_serie"), "non joué : tête de série"); assert.equal(texteFin("score"), "");
});

const j = (id, pseudo) => ({ id, pseudo, numero: 1000 });
const T = {
  phase: "en_cours", tour: 2, nb_tours: 3, inscrits: 5, echeance: null,
  matchs: [
    { id: "m2", tour: 1, position: 2, j0: j("d", "Dan"), j1: j("e", "Emma"), fin: "score", vainqueur: "d" },
    { id: "m1", tour: 1, position: 1, j0: j("a", "Alice"), j1: null, fin: "exempt", vainqueur: "a" },
    { id: "m5", tour: 2, position: 1, j0: j("a", "Alice"), j1: j("d", "Dan"), fin: null, essai0: false, essai1: true },
  ],
};

test("mon match du tour en cours", () => {
  const mm = monMatch(T, "a");
  assert.equal(mm.match.id, "m5"); assert.equal(mm.moi, 0); assert.equal(mm.adversaire.pseudo, "Dan");
  assert.equal(mm.essai, false); assert.equal(mm.essaiAdv, true);
  assert.equal(monMatch(T, "e"), null, "éliminé : plus de match");
  assert.equal(monMatch({ ...T, phase: "termine" }, "a"), null);
});

test("tableau rangé par tour et par position", () => {
  const tb = tableau(T);
  assert.equal(tb.length, 2); assert.deepEqual(tb[0].map(m => m.id), ["m1", "m2"]); assert.deepEqual(tb[1].map(m => m.id), ["m5"]);
});

test("résumé d'un tournoi pour les listes", () => {
  assert.equal(resume({ phase: "inscriptions", inscrits: 1 }), "Inscriptions ouvertes · 1 joueur");
  assert.equal(resume({ phase: "termine", vainqueur: { pseudo: "Bob", numero: 4821 } }), "🏆 Bob#4821");
  assert.equal(resume({ ...T, a_jouer: true }), "Demi-finales · à toi de jouer !");
  assert.equal(resume({ ...T, elimine: true }), "Demi-finales · parcours terminé");
});

test("liens d'invitation à un tournoi", () => {
  const l = lienTournoi("https://b-enjam1n.github.io/PCF/", "0a1b2c3d4e");
  assert.equal(l, "https://b-enjam1n.github.io/PCF/?tournoi=0a1b2c3d4e");
  assert.equal(codeTournoiDepuisAdresse(new URL(l).search), "0a1b2c3d4e");
  assert.equal(codeTournoiDepuisAdresse("?tournoi=<x>"), null);
});

test("Sit & Go : tailles et durées annoncées", async () => {
  const { TAILLES_SNG, dureeSng } = await import("../app/js/tournoi-logique.js");
  assert.deepEqual(TAILLES_SNG, [8, 16, 32, 64]);
  assert.equal(dureeSng(8), "15 à 20 min"); assert.equal(dureeSng(64), "30 à 40 min");
});

test("en direct : l'attente du prochain adversaire, avec le match voisin et une estimation", async () => {
  const { attente, minutesRestantes, monMatch } = await import("../app/js/tournoi-logique.js");
  const j = id => ({ id, pseudo: id, numero: 1 });
  const t = { phase: "en_cours", mode: "direct", nb_tours: 3, tour: 2, points_par_set: 11, sets_gagnants: 2, matchs: [
    { tour: 1, position: 1, j0: j("moi"), j1: j("b"), vainqueur: "moi", fin: "score" },
    { tour: 1, position: 2, j0: j("c"), j1: j("d"), fin: null, duel: { phase: "jeu", sets: [1, 0], points: [5, 3] } },
    { tour: 1, position: 3, j0: j("e"), j1: j("f"), vainqueur: "e", fin: "score" },
    { tour: 1, position: 4, j0: j("g"), j1: j("h"), vainqueur: "g", fin: "score" },
    { tour: 2, position: 2, j0: j("e"), j1: j("g"), fin: null },
  ] };
  assert.equal(monMatch(t, "moi"), null, "pas de match à jouer pour l'instant");
  const a = attente(t, "moi");
  assert.equal(a.tour, 2);
  assert.equal(a.voisin.position, 2, "mon adversaire sortira du match C contre D");
  assert.ok(a.minutes >= 1 && a.minutes <= 3, `environ 2 min (${a.minutes})`);
  assert.equal(attente(t, "b"), null, "un joueur éliminé n'attend rien");
  assert.ok(monMatch(t, "e"), "le match de tour 2 d'un autre joueur est bien trouvé");
  assert.equal(attente({ ...t, mode: "libre" }, "moi"), null, "seulement en direct");
  assert.ok(minutesRestantes({ duel: null }, t) >= minutesRestantes(t.matchs[1], t), "un match pas commencé dure plus longtemps");
});
