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
  assert.deepEqual(TAILLES_SNG, [2, 8, 16, 32, 64]);
  assert.equal(dureeSng(2), "5 à 10 min");
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

test("championnat du cercle : résumé, matchs restants, champion, dernier", async () => {
  const { mesMatchsRestants, matchsParJoueur, matchsTotal, texteDureeChampionnat, championDuCercle, dernierDuClassement } = await import("../app/js/tournoi-logique.js");
  const a = { id: "a", pseudo: "Alice" }, b = { id: "b", pseudo: "Bob" }, c = { id: "c", pseudo: "Chloé" };
  const C = { mode: "championnat", phase: "en_cours", tour: 1, nb_tours: 1, a_jouer: true, echeance: null, matchs: [
    { id: "1", tour: 1, position: 1, j0: a, j1: b, fin: "score", vainqueur: "a" },
    { id: "2", tour: 1, position: 2, j0: a, j1: c, fin: null },
    { id: "3", tour: 1, position: 3, j0: b, j1: c, fin: null, duel: { phase: "attente", j0: "b" } },
    { id: "4", tour: 1, position: 4, j0: c, j1: a, fin: null }] };
  assert.equal(resume(C), "Championnat en cours · des matchs à jouer", "pas de « Finale » pour un championnat");
  assert.deepEqual(mesMatchsRestants(C, "a").map(m => m.id), ["2", "4"]);
  assert.equal(monMatch(C, "a").match.id, "2");
  assert.equal(monMatch(C, "c").match.id, "3", "d'abord le match où l'on m'attend");
  assert.equal(monMatch(C, "c").adversaire.id, "b");
  assert.equal(texteFin("double_forfait"), "non joué");
  assert.equal(matchsParJoueur(6, false), 5); assert.equal(matchsParJoueur(6, true), 10);
  assert.equal(matchsTotal(4, false), 6); assert.equal(matchsTotal(3, true), 6);
  assert.equal(texteDureeChampionnat(10080), "1 semaine"); assert.equal(texteDureeChampionnat(4320), "3 jours");
  assert.equal(championDuCercle([
    { mode: "championnat", phase: "termine", vainqueur: a, fini_le: "2026-10-01T10:00:00Z" },
    { mode: "championnat", phase: "termine", vainqueur: b, fini_le: "2026-10-08T10:00:00Z" },
    { mode: "libre", phase: "termine", vainqueur: c, fini_le: "2026-10-09T10:00:00Z" },
    { mode: "championnat", phase: "en_cours" }]).id, "b", "le vainqueur du dernier championnat terminé (pas d'un tournoi)");
  assert.equal(championDuCercle([{ mode: "championnat", phase: "termine", vainqueur: null }]), null);
  assert.equal(dernierDuClassement([{ joueur: a }, { joueur: c }]).id, "c");
  assert.equal(dernierDuClassement([]), null);
});

test("championnat de chaque semaine : résumé et heure de départ", async () => {
  const { texteDepart } = await import("../app/js/tournoi-logique.js");
  assert.equal(texteDepart("2026-10-12T10:00:00Z"), "lundi 12 octobre à 12 h");
  assert.equal(texteDepart("2026-11-02T11:00:00Z"), "lundi 2 novembre à 12 h", "heure d'hiver");
  assert.equal(resume({ mode: "championnat", phase: "inscriptions", inscrits: 3, edition: 2, depart: "2026-10-12T10:00:00Z" }),
    "Semaine n° 2 · inscriptions ouvertes · 3 joueurs · départ lundi 12 octobre à 12 h");
  assert.equal(resume({ mode: "championnat", phase: "en_cours", hebdo: true, edition: 4, echeance: null }), "Semaine n° 4 · Championnat en cours");
  assert.equal(resume({ mode: "championnat", phase: "en_cours", edition: null, echeance: null }), "Championnat en cours", "championnat d'une seule fois");
});
