// Les records d'un face-à-face entre deux joueurs (17 novembre, idée et choix du porteur du projet : « je suis bien pour tout
// regarder »). Sous le bilan d'un face-à-face, « 🏅 Nos records » se déplie : chaque record, ma valeur contre la sienne.
// Calculés dans l'appli à partir de nos duels (on rejoue chaque match avec les règles : records-cercle.js, rejouerDuel).
// Les matchs gagnés par abandon ou forfait comptent pour les séries de victoires, pas pour les records de match.
// Ici, seulement le calcul (testé) ; l'affichage est dans ecran-cercles.js. Sur la version de test d'abord (nouveautes.js).
import { rejouerDuel, SMASHS_MIN } from "./records-cercle.js";
import { maPlace } from "./duel-logique.js";
import { plafondSet } from "./regles.js";
import { ouvert } from "./nouveautes.js";

export const recordsFaceAFaceVisibles = loc => ouvert("recordsFaceAFace", loc);

// Un duel (ligne de la table « duels ») au format de rejouerDuel.
const pourRejouer = d => ({ ...d, g: (d.coups || []).map(c => (c.g === 0 || c.g === 1 ? c.g : null)),
  smash: (d.coups || []).map(c => c.smash || [false, false]), penalites: d.penalites || [] });

// → { lignes: [{ cle, titre, valeurs: [moi, lui] (nombres ou null), textes: [moi, lui], mieux: 0 | 1 | null }],
//     partages: [{ cle, titre, texte }] } ; null s'il n'y a aucun duel. (Vu de mon côté : 0 c'est moi, 1 c'est lui.)
export function recordsFaceAFace(duels, uid) {
  const tries = [...(duels || [])].filter(d => maPlace(d, uid) !== null && (d.vainqueur === 0 || d.vainqueur === 1))
    .sort((a, b) => Date.parse(a.maj_le) - Date.parse(b.maj_le));
  if (!tries.length) return null;
  const max = [{}, {}];
  const garder = (j, cle, valeur, texte = String(valeur)) => { if (valeur > 0 && (!max[j][cle] || valeur > max[j][cle].v)) max[j][cle] = { v: valeur, t: texte }; };
  const compter = (j, cle, n = 1) => { max[j][cle] = { v: (max[j][cle]?.v || 0) + n }; max[j][cle].t = String(max[j][cle].v); };
  const tentes = [0, 0], reussis = [0, 0];
  let long = null, serre = null, egal = null, egalSerie = null;
  const series = [0, 0];
  const an = new Date().getFullYear();
  const date = d => { const x = new Date(d.maj_le); return x.toLocaleDateString("fr-FR", { day: "numeric", month: "short", ...(x.getFullYear() !== an ? { year: "numeric" } : {}) }); };
  for (const d of tries) {
    const moi = maPlace(d, uid), vu = j => (moi === 0 ? j : 1 - j);   // vu(j du duel) → 0 moi, 1 lui
    const g = vu(d.vainqueur);
    series[g]++; series[1 - g] = 0; garder(g, "victoires", series[g]);
    (d.coups || []).forEach(c => { for (const j of [0, 1]) if (c.smash?.[j]) { tentes[vu(j)]++; if (c.g === j) reussis[vu(j)]++; } });
    if (d.fin !== "score") continue;
    const r = rejouerDuel(pourRejouer(d)), sets = (d.scores_sets || []).map(([x, y]) => (moi === 0 ? [x, y] : [y, x]));
    const tot = sets.reduce((s, [x, y]) => [s[0] + x, s[1] + y], [0, 0]);
    const score = sets.map(([x, y]) => (g === 0 ? `${x}–${y}` : `${y}–${x}`)).join(", ");
    for (const j of [0, 1]) {
      const jd = moi === 0 ? j : 1 - j;   // (j vu de moi → j du duel)
      garder(j, "points", tot[j]);
      garder(j, "serie", r.serieJ[jd]);
      garder(j, "serie_nette", r.serieNetteJ[jd]);
      garder(j, "remontee", r.remonteeJ[jd]);
      garder(j, "balles", r.ballesSauvees[jd]);
      garder(j, "smashs", r.smashsReussis[jd]);
    }
    // la victoire la plus sèche : le plus gros écart de points (départage : le moins de points concédés)
    garder(g, "seche", (tot[g] - tot[1 - g]) * 1000 + (999 - tot[1 - g]), score);
    // les sets « bulle » (11-0, 7-0) et les sets gagnés au point décisif (15-14, 10-9)
    const plafond = plafondSet(d.points_par_set);
    for (const [x, y] of sets) {
      const v = x > y ? 0 : 1, [h, b] = v === 0 ? [x, y] : [y, x];
      if (b === 0 && d.points_par_set >= 7) compter(v, "bulle");
      if (plafond !== null && h === plafond && b === plafond - 1) compter(v, "decisifs");
    }
    if (sets.length > 1 && (sets[0][0] > sets[0][1] ? 0 : 1) !== g) compter(g, "renversements");
    if (!long || r.coups > long.n) long = { n: r.coups, d };
    // le plus serré : d'abord un match allé jusqu'au set décisif, puis le moins d'écart dans le dernier set, puis au total
    const ecart = Math.abs(tot[0] - tot[1]), dernier = sets[sets.length - 1] || [0, 0];
    const auBout = sets.length === 2 * d.sets_gagnants - 1;
    const cle = (auBout ? 0 : 1) * 1e6 + Math.abs(dernier[0] - dernier[1]) * 1e3 + ecart;
    if (!serre || cle < serre.cle) serre = { cle, d, score, g };
    if (r.egalites && (!egal || r.egalites > egal.n)) egal = { n: r.egalites, d };
    if (r.serieEgalites && (!egalSerie || r.serieEgalites > egalSerie.n)) egalSerie = { n: r.serieEgalites, d };
  }
  for (const j of [0, 1]) if (tentes[j] >= SMASHS_MIN) max[j].taux = { v: Math.round(100 * reussis[j] / tentes[j]), t: `${Math.round(100 * reussis[j] / tentes[j])} % (${reussis[j]}/${tentes[j]})` };
  const TITRES = [["points", "Le plus de points dans un match"], ["serie", "La plus longue série de points (égalités comprises)"], ["serie_nette", "La plus longue série de points sans égalité"], ["seche", "La victoire la plus sèche"],
    ["remontee", "La plus grosse remontée dans un set"], ["balles", "Le plus de balles de match sauvées"], ["smashs", "Le plus de smashs réussis dans un match"],
    ["taux", `Smashs gagnants contre l'autre (dès ${SMASHS_MIN} tentés)`], ["victoires", "La plus longue série de victoires"],
    ["bulle", "Sets gagnés sans concéder un point"], ["decisifs", "Sets gagnés au point décisif"], ["renversements", "Matchs gagnés après avoir perdu le 1er set"]];
  const lignes = TITRES.map(([cle, titre]) => {
    const valeurs = [max[0][cle]?.v ?? null, max[1][cle]?.v ?? null], textes = [max[0][cle]?.t ?? "–", max[1][cle]?.t ?? "–"];
    const [a, b] = valeurs.map(v => v ?? 0);
    return { cle, titre, valeurs, textes, mieux: a === b ? null : a > b ? 0 : 1 };
  });
  const premier = tries[0], qui = j => (j === 0 ? "toi" : "{adv}");   // ({adv} : son pseudo, mis à l'affichage)
  // (17 novembre, demande du porteur du projet : avec le score, vu du vainqueur)
  function premierTexte() {
    const v = premier.vainqueur, sc = (premier.scores_sets || []).map(([x, y]) => (v === 0 ? `${x}–${y}` : `${y}–${x}`)).join(", ");
    const fin = premier.fin === "abandon" ? " (abandon)" : premier.fin === "forfait" ? " (forfait)" : "";
    return `${sc ? `${sc}${fin} · ` : ""}gagné par ${qui(maPlace(premier, uid) === v ? 0 : 1)} · ${date(premier)}`;
  }
  const partages = [
    long && { cle: "long", titre: "Le match le plus long", texte: `${long.n} coups · ${date(long.d)}` },
    serre && { cle: "serre", titre: "Le match le plus serré", texte: `${serre.score} · gagné par ${qui(serre.g)} · ${date(serre.d)}` },
    egal && { cle: "egalites", titre: "Le plus d'égalités dans un match", texte: `${egal.n} · ${date(egal.d)}` },
    egalSerie && { cle: "egalites_serie", titre: "La plus longue série d'égalités", texte: `${egalSerie.n} d'affilée · ${date(egalSerie.d)}` },
    { cle: "premier", titre: "Votre premier match", texte: premierTexte() },
  ].filter(Boolean);
  return { lignes, partages };
}
