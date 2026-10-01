import { test } from "node:test";
import assert from "node:assert/strict";
import { FORMAT_DU_JOUR, jourParis, matchDuJour, hasardGraine, grille, serie, texteAPartager, garder, veille } from "../app/js/match-du-jour.js";
import { botParId } from "../app/js/bots.js";

test("le jour est celui de Paris", () => {
  assert.equal(jourParis(new Date("2026-10-01T21:30:00Z")), "2026-10-01");
  assert.equal(jourParis(new Date("2026-10-01T22:30:00Z")), "2026-10-02", "minuit passé à Paris (heure d'été)");
  assert.equal(jourParis(new Date("2026-12-31T23:30:00Z")), "2027-01-01", "minuit passé à Paris (heure d'hiver)");
  assert.equal(veille("2026-03-01"), "2026-02-28");
});

test("un match par jour : numéroté, le même pour tout le monde, de plus en plus dur dans la semaine", () => {
  assert.equal(matchDuJour("2026-10-01").numero, 1);
  assert.equal(matchDuJour("2026-10-12").numero, 12);
  assert.deepEqual(matchDuJour("2026-10-05"), matchDuJour("2026-10-05"));
  assert.equal(matchDuJour("2026-10-04").bot, "titan", "le dimanche, c'est Titan");
  for (let d = 0; d < 60; d++) {
    const jour = new Date(Date.UTC(2026, 9, 1 + d)).toISOString().slice(0, 10);
    assert.ok(botParId(matchDuJour(jour).bot), jour);
  }
  const lundi = botParId(matchDuJour("2026-10-05").bot).elo, samedi = botParId(matchDuJour("2026-10-10").bot).elo;
  assert.ok(lundi < samedi);
  assert.deepEqual(FORMAT_DU_JOUR, { pointsParSet: 7, setsGagnants: 1 });
});

test("le tirage du bot est le même pour tout le monde (même graine, même suite)", () => {
  const a = hasardGraine(42), b = hasardGraine(42), c = hasardGraine(43);
  const sa = Array.from({ length: 5 }, a), sb = Array.from({ length: 5 }, b), sc = Array.from({ length: 5 }, c);
  assert.deepEqual(sa, sb);
  assert.notDeepEqual(sa, sc);
  assert.ok(sa.every(x => x >= 0 && x < 1));
});

test("la grille et le texte à partager", () => {
  const g = grille([{ gagnant: 0 }, { gagnant: 1 }, { gagnant: null }, { gagnant: 0 }]);
  assert.equal(g, "🟩🟥⬜🟩");
  const r = { numero: 12, bot: "stratege", gagne: true, score: [7, 4], grille: "🟩".repeat(7) + "🟥".repeat(4) + "⬜" };
  assert.equal(texteAPartager(r, { nomBot: "Stratège", serie: 3 }),
    "HandSlam · Match du jour n° 12 · 🤖 Stratège\n✅ Victoire 7–4 en 12 coups · 🔥 3 jours de suite\n🟩🟩🟩🟩🟩🟩🟩🟥🟥🟥\n🟥⬜\nhandslam.fr");
  assert.match(texteAPartager({ numero: 2, abandon: true }, { nomBot: "Bambi" }), /Abandon/);
});

test("la série de jours joués, et on garde 60 jours", () => {
  const res = { "2026-10-03": {}, "2026-10-04": {}, "2026-10-05": {} };
  assert.equal(serie(res, "2026-10-05"), 3);
  assert.equal(serie(res, "2026-10-06"), 3, "pas encore joué aujourd'hui : la série tient");
  assert.equal(serie(res, "2026-10-07"), 0, "un jour manqué : la série repart à zéro");
  const vieux = garder({ "2026-01-01": {} }, "2026-10-05", {});
  assert.deepEqual(Object.keys(vieux), ["2026-10-05"]);
});
