import { test } from "node:test";
import assert from "node:assert/strict";

test("le panneau de fin de match : points, signes, égalités, changements après une égalité, même signe après un point, smashs, séries", async () => {
  const { statsDuMatch } = await import("../app/js/stats-match.js");
  const c = [{ a: 0, b: 0, gagnant: null }, { a: 2, b: 0, gagnant: 0 }, { a: 2, b: 1, gagnant: 1, smash: [false, true] },
    { a: 1, b: 1, gagnant: null }, { a: 0, b: 1, gagnant: 0, smash: [true, false] }, { a: 0, b: 2, gagnant: 1 }];
  const s = statsDuMatch(c);
  assert.deepEqual(s.points, [2, 2]);
  assert.deepEqual(s.signes, [[3, 1, 2], [2, 3, 1]]);
  assert.equal(s.egalites, 2);
  assert.deepEqual(s.changeApresEgalite, [[2, 2], [0, 2]]);   // après chaque égalité, je change de signe ; lui, jamais
  assert.deepEqual(s.memeApresGain, [[2, 2], [1, 1]]);
  assert.deepEqual(s.smashs, [[1, 1], [1, 1]]);
  assert.deepEqual(s.serie, [1, 1]);
  assert.deepEqual(s.reussite, [[2, 4], [2, 4]], "sans les égalités");
  assert.deepEqual(s.apresEgalite, [2, 0], "les deux points gagnés juste après une égalité : les miens");
  assert.deepEqual(s.imprevisibilite, [null, null], "trop peu de coups");
  const long = statsDuMatch(Array.from({ length: 30 }, (_, i) => ({ a: 0, b: i % 3, gagnant: [null, 0, 1][i % 3] })));
  assert.ok(long.imprevisibilite[0] < 30 && long.imprevisibilite[1] < 60, String(long.imprevisibilite));   // toujours Pierre : très lisible
});

test("le commentaire des statistiques : les situations de CE match, comparées à ses habitudes", async () => {
  const { statsDuMatch } = await import("../app/js/stats-match.js");
  const { situationsStats, commentaireStats } = await import("../app/js/annonces.js");
  // Il joue Pierre 15 fois sur 20 dans ce match ; l'adversaire varie.
  const c = Array.from({ length: 20 }, (_, i) => { const a = i % 4 === 3 ? 2 : 0, b = i % 3; return { a, b, gagnant: a === b ? null : (a + 1) % 3 === b ? 0 : 1 }; });
  const st = statsDuMatch(c);
  const pools = info => situationsStats({ st, ...info }).map(x => x.pool);
  assert.ok(pools({ carriere: { signes: [400, 300, 300] } }).includes("stats_signe_habitude"), "comme d'habitude");
  assert.ok(pools({ carriere: { signes: [100, 450, 450] } }).includes("stats_signe_inhabituel"), "lui qui en joue si peu");
  assert.ok(pools({ carriere: { signes: [5, 5, 5] } }).includes("stats_signe_inconnu"), "ses premiers matchs");
  assert.ok(pools({ carriere: { signes: [100, 450, 450] } }).includes("stats_entete") || st.repetition[0].n < 4);
  const sit = situationsStats({ st, carriere: { signes: [100, 450, 450] } }).find(x => x.pool === "stats_signe_inhabituel");
  assert.equal(sit.signe, 0, "avec le bon signe : la Pierre");
  assert.equal(pools({}).at(-1), "stats_rien");
  // Le favori oublié : il adore les Ciseaux, il n'en a joué aucun dans ce match.
  const oubli = situationsStats({ st, carriere: { signes: [200, 600, 200] } }).find(x => x.pool === "stats_favori_oublie");
  assert.equal(oubli?.signe, 1);
  // Le dialogue : Roland lance, puis l'analyse ; une fois sur deux.
  const d = commentaireStats({ st, carriere: { signes: [100, 450, 450] } }, { rng: () => 0.1 });
  assert.equal(d.length, 2); assert.match(d[0].id, /^commentateur_stats_lance_/); assert.match(d[1].id, /_stats_/);
  assert.equal(commentaireStats({ st }, { rng: () => 0.9 }), null);
});
