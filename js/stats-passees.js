// Retrouver « Mon jeu » contre les joueurs dans les matchs passés (19 novembre, demande du porteur du projet) : le serveur garde
// les coups de chaque duel terminé ; on refait le compte comme à la fin d'un match (profil.js, enregistrerMatch), une seule fois.
// Les bots des tournois en ligne (« Rocky 🤖 »…) ne comptent pas comme des joueurs.
import { Suivi } from "./analyse.js";
import { jeuVide, calmeApres2 } from "./profil.js";
import { nouveauMatch, jouerCoup } from "./regles.js";
import { nouvellesStats, suivreCoup } from "./stats-match.js";
import { flairEtEndurance } from "./flair.js";
import { ouverturesDuel, ajouterOuvertures } from "./ouvertures.js";

export const estBotEnLigne = pseudo => String(pseudo || "").includes("🤖");

// duels : les duels terminés (j0, j1, coups, vainqueur, points_par_set, sets_gagnants) ; uid : moi ; bots : l'ensemble des identifiants des bots.
export function jeuDepuisDuels(duels, uid, bots = new Set()) {
  const j = jeuVide();
  for (const d of duels || []) {
    const moi = d.j0 === uid ? 0 : d.j1 === uid ? 1 : -1, adv = moi === 0 ? d.j1 : d.j0;
    const coups = d.coups || [];
    if (moi < 0 || !coups.length || bots.has(adv)) continue;
    j.matchs++; if (d.vainqueur === moi) j.victoires++;
    const suivi = new Suivi();
    let prec = null;
    for (const c of coups) {
      const mien = moi === 0 ? c.a : c.b, g = c.g === null || c.g === undefined ? null : c.g === moi ? 0 : 1;
      if (mien === null || mien === undefined) continue;
      j.signes[mien]++;
      if (prec) {
        if (prec.g === 0) { j.apresVictoire++; if (mien === prec.mien) j.memeApresVictoire++; }
        else if (prec.g === 1) { j.apresDefaite++; if (mien === prec.mien) j.memeApresDefaite++; }
      }
      if (c.smash?.[moi]) { j.smashsTentes++; if (g === 0) j.smashsReussis++; }
      suivi.figer(); suivi.enregistrer(mien, g === null ? "e" : g === 0 ? "g" : "p");
      prec = { mien, g };
    }
    j.devines += suivi.devines; j.lisibles += suivi.lisibles;
    // (20 novembre) le Flair et l'Endurance, vus de mon côté
    const fe = flairEtEndurance(coups.map(c => ({ a: moi === 0 ? c.a : c.b, b: moi === 0 ? c.b : c.a, gagnant: c.g === null || c.g === undefined ? null : c.g === moi ? 0 : 1 })));
    j.egalites += coups.filter(c => c.g === null || c.g === undefined).length;
    j.ouvertures = ajouterOuvertures(j.ouvertures, ouverturesDuel(d, moi));   // (25 novembre : le 1er coup de chaque set)
    j.flairTentees += fe.tentees; j.flairReussies += fe.reussies; j.flairOccasions += fe.occasions; j.flairPoints += fe.points;
    const ca = calmeApres2(coups.map(c => ({ gagnant: c.g === null || c.g === undefined ? null : c.g === moi ? 0 : 1 }))); j.calmePoints += ca[0]; j.calmeOccasions += ca[1]; j.endChaines += fe.chaines; j.endGagnees += fe.gagnees;
    // (20 novembre) Les balles de set et de match, les sets décisifs et les lectures réussies : on rejoue le score du match.
    if (d.points_par_set) {
      try {
        const m = nouveauMatch({ pointsParSet: d.points_par_set, setsGagnants: d.sets_gagnants || 2 }), st = nouvellesStats();
        for (const c of coups) {
          if (m.termine) break;
          const mien = moi === 0 ? c.a : c.b, sien = moi === 0 ? c.b : c.a;
          if (mien === null || mien === undefined || sien === null || sien === undefined) continue;
          suivreCoup(st, m, jouerCoup(m, mien, sien));
        }
        for (const k of ["ballesObtenues", "ballesConverties", "ballesSubies", "ballesSauvees", "lecturesReussies", "lecturesRatees"]) j[k] += st[k];
        const sg = d.sets_gagnants || 2;
        if (sg > 1 && m.scoresSets.length === 2 * sg - 1) { j.decisifsJoues++; if (d.vainqueur === moi) j.decisifsGagnes++; }
      } catch { /* un match qu'on ne sait pas rejouer : sans ces compteurs */ }
    }
  }
  return j;
}

// Contre les bots : le total moins ce qui a été joué contre les joueurs (jamais en dessous de zéro).
// Les ouvertures (25 novembre) n'ont pas de total : celles contre les bots, comptées depuis ce jour-là, sont gardées telles quelles.
export function jeuMoins(P, h) {
  const b = jeuVide(), pos = x => Math.max(0, x);
  if (Array.isArray(P.parAdv?.bots?.ouvertures)) b.ouvertures = [...P.parAdv.bots.ouvertures];
  // (26 novembre) le nouveau Flair non plus : compté contre les bots à partir de ce jour-là
  for (const k of ["flairOccasions", "flairPoints", "calmeOccasions", "calmePoints"]) b[k] = P.parAdv?.bots?.[k] || 0;
  b.matchs = pos(P.matchs - h.matchs); b.victoires = pos((P.victoires || 0) - (h.victoires || 0));
  b.signes = P.signes.map((x, i) => pos(x - h.signes[i]));
  for (const k of ["smashsTentes", "smashsReussis", "apresVictoire", "memeApresVictoire", "apresDefaite", "memeApresDefaite", "devines", "lisibles",
    "ballesObtenues", "ballesConverties", "ballesSubies", "ballesSauvees", "decisifsJoues", "decisifsGagnes", "lecturesReussies", "lecturesRatees", "flairTentees", "flairReussies", "endChaines", "endGagnees", "egalites"]) b[k] = pos((P[k] || 0) - (h[k] || 0));
  return b;
}
