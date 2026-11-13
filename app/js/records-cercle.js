// Les records du cercle (13 novembre, idée et choix du porteur du projet ; supabase/etape-74-records-cercle.sql).
// Le serveur donne, pour chaque duel du cercle, qui a gagné chaque point (jamais les signes) : on rejoue le match avec les règles
// du jeu (regles.js) pour retrouver les séries, les remontées et les balles de match.
// Les matchs gagnés par abandon ou forfait comptent pour les séries de victoires, pas pour les records de match (pas allés au bout).
// Ici, seulement le calcul (testé) ; l'affichage est dans ecran-cercles.js.
import { nouveauMatch, jouerCoup, penaliser, balle } from "./regles.js";

export const recordsVisibles = ouvert => ouvert("records");

// Deux signes qui donnent ce gagnant (0 : le joueur 0, 1 : le joueur 1, null : égalité). Pierre (0) bat Ciseaux (1).
const SIGNES_DE = g => (g === 0 ? [0, 1] : g === 1 ? [1, 0] : [0, 0]);

// Rejoue un duel : → { coups, serie: { joueur, n }, remontee: { joueur, n }, ballesSauvees: [n0, n1], ecart, perdus }
// (serie : la plus longue série de points gagnés d'affilée ; remontee : le plus gros retard rattrapé dans un set gagné ;
// ecart : points du vainqueur moins points du perdant, tous sets confondus ; perdus : points marqués par le perdant).
export function rejouerDuel(d) {
  const m = nouveauMatch({ pointsParSet: d.points_par_set, setsGagnants: d.sets_gagnants });
  const g = d.g || [], pens = Array.isArray(d.penalites) ? d.penalites : [];
  let serie = { joueur: null, n: 0 }, courant = { joueur: null, n: 0 }, remontee = { joueur: null, n: 0 };
  const ballesSauvees = [0, 0];
  let pire = [0, 0];   // le plus gros retard de chacun dans le set en cours
  const finDuSet = (evt) => {
    if (!evt.finSet) return;
    const v = evt.gagnant;
    if ((v === 0 || v === 1) && pire[v] > remontee.n) remontee = { joueur: v, n: pire[v] };
    pire = [0, 0];
  };
  const apresPoint = () => {
    for (const j of [0, 1]) pire[j] = Math.max(pire[j], m.points[1 - j] - m.points[j]);
  };
  let k = 0;
  try {
    for (let i = 0; i <= g.length && !m.termine; i++) {
      while (k < pens.length && (pens[k].apres ?? 0) <= i && !m.termine) {
        const e = penaliser(m, pens[k++].fautif); apresPoint(); finDuSet(e);
      }
      if (i === g.length || m.termine) break;
      const avant = balle(m), [a, b] = SIGNES_DE(g[i]);
      const e = jouerCoup(m, a, b);
      if (e.gagnant === 0 || e.gagnant === 1) {
        courant = courant.joueur === e.gagnant ? { joueur: e.gagnant, n: courant.n + 1 } : { joueur: e.gagnant, n: 1 };
        if (courant.n > serie.n) serie = { ...courant };
        if (avant?.type === "match" && e.gagnant !== avant.joueur) ballesSauvees[1 - avant.joueur]++;
      }
      apresPoint(); finDuSet(e);
    }
  } catch { /* un duel incohérent : on garde ce qu'on a pu rejouer */ }
  const v = d.vainqueur, tot = [0, 0];
  for (const [x, y] of d.scores_sets || []) { tot[0] += x; tot[1] += y; }
  return { coups: g.length, serie, remontee, ballesSauvees, ecart: v === 0 || v === 1 ? tot[v] - tot[1 - v] : 0, perdus: v === 0 || v === 1 ? tot[1 - v] : 0 };
}

const idDe = (d, j) => (j === 0 ? d.j0 : d.j1);
export const SMASHS_MIN = 5;   // (le taux de smashs réussis : seulement à partir de 5 smashs tentés, sinon 1 sur 1 = 100 %)

// Tous les records. donnees : ce que renvoie records_cercle. → { match: [...], cercle: [...] } ; chaque record :
// { cle, titre, joueur, autre, valeur, duel (id), quand, detail } ; null quand personne ne l'a encore.
export function calculerRecords(donnees) {
  const duels = [...(donnees?.duels || [])].sort((a, b) => Date.parse(a.quand) - Date.parse(b.quand));
  const rec = {};
  const garder = (cle, valeur, r, mieux = (x, y) => x > y) => { if (valeur > 0 && (!rec[cle] || mieux(valeur, rec[cle].valeur))) rec[cle] = { ...r, valeur }; };
  // Les séries de victoires et de défaites, les rivalités, le nombre de duels, les smashs : tous les duels.
  const serieV = new Map(), serieD = new Map(), joues = new Map(), paires = new Map(), smashs = new Map(), tentes = new Map();
  for (const d of duels) {
    const gagnant = idDe(d, d.vainqueur), perdant = idDe(d, 1 - d.vainqueur);
    for (const id of [d.j0, d.j1]) joues.set(id, (joues.get(id) || 0) + 1);
    serieV.set(gagnant, (serieV.get(gagnant) || 0) + 1); serieV.set(perdant, 0);
    serieD.set(perdant, (serieD.get(perdant) || 0) + 1); serieD.set(gagnant, 0);
    garder("victoires", serieV.get(gagnant), { joueur: gagnant, quand: d.quand });
    garder("defaites", serieD.get(perdant), { joueur: perdant, quand: d.quand });
    const cle = [d.j0, d.j1].sort().join("|"), p = paires.get(cle) || { a: [d.j0, d.j1].sort()[0], b: [d.j0, d.j1].sort()[1], n: 0, va: 0, dernier: d.quand };
    p.n++; if (gagnant === p.a) p.va++; p.dernier = d.quand; paires.set(cle, p);
    (d.smash || []).forEach((s, i) => {
      const w = d.g?.[i];
      for (const j of [0, 1]) if (s?.[j]) { const id = idDe(d, j); tentes.set(id, (tentes.get(id) || 0) + 1); if (w === j) smashs.set(id, (smashs.get(id) || 0) + 1); }
    });
    // Les records de match : seulement les matchs allés au bout.
    if (d.fin !== "score") continue;
    const r = rejouerDuel(d);
    if (r.serie.joueur !== null) garder("serie_points", r.serie.n, { joueur: idDe(d, r.serie.joueur), autre: idDe(d, 1 - r.serie.joueur), duel: d.id, quand: d.quand });
    garder("raclee", r.ecart * 1000 - r.perdus, { joueur: gagnant, autre: perdant, duel: d.id, quand: d.quand, detail: (d.scores_sets || []).map(([x, y]) => (d.vainqueur === 0 ? `${x}–${y}` : `${y}–${x}`)).join(", ") });
    if (r.remontee.joueur !== null) garder("remontee", r.remontee.n, { joueur: idDe(d, r.remontee.joueur), autre: idDe(d, 1 - r.remontee.joueur), duel: d.id, quand: d.quand });
    garder("long", r.coups, { joueur: d.j0, autre: d.j1, duel: d.id, quand: d.quand });
    for (const j of [0, 1]) garder("balles", r.ballesSauvees[j], { joueur: idDe(d, j), autre: idDe(d, 1 - j), duel: d.id, quand: d.quand });
  }
  for (const [id, n] of smashs) garder("smashs", n, { joueur: id });
  // Le meilleur taux de smashs réussis (13 novembre, demande du porteur du projet) : à partir de SMASHS_MIN smashs tentés.
  for (const [id, t] of tentes) if (t >= SMASHS_MIN) garder("taux_smash", Math.round(100 * (smashs.get(id) || 0) / t), { joueur: id, detail: `${smashs.get(id) || 0} sur ${t}` });
  for (const [id, n] of joues) garder("pilier", n, { joueur: id });
  for (const p of paires.values()) if (p.n >= 2) garder("rivalite", p.n, { joueur: p.a, autre: p.b, detail: `${p.va}–${p.n - p.va}`, quand: p.dernier });
  if (rec.raclee) rec.raclee.valeur = Math.floor((rec.raclee.valeur + 999) / 1000);   // (l'écart de points, sans le départage)
  const s = donnees?.signes || [0, 0, 0], total = s[0] + s[1] + s[2];
  const signes = total ? s.map(n => Math.round(100 * n / total)) : null;
  return {
    match: ["serie_points", "raclee", "remontee", "long", "balles"].map(cle => (rec[cle] ? { cle, ...rec[cle] } : { cle, vide: true })),
    cercle: ["victoires", "defaites", "smashs", "taux_smash", "rivalite", "pilier"].map(cle => (rec[cle] ? { cle, ...rec[cle] } : { cle, vide: true })),
    signes, duels: duels.length,
  };
}
