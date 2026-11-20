// Retrouver « Mon jeu » contre les joueurs dans les matchs passés (19 novembre, demande du porteur du projet) : le serveur garde
// les coups de chaque duel terminé ; on refait le compte comme à la fin d'un match (profil.js, enregistrerMatch), une seule fois.
// Les bots des tournois en ligne (« Rocky 🤖 »…) ne comptent pas comme des joueurs.
import { Suivi } from "./analyse.js";
import { jeuVide } from "./profil.js";

export const estBotEnLigne = pseudo => String(pseudo || "").includes("🤖");

// duels : les duels terminés (j0, j1, coups, vainqueur) ; uid : moi ; bots : l'ensemble des identifiants des bots.
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
  }
  return j;
}

// Contre les bots : le total moins ce qui a été joué contre les joueurs (jamais en dessous de zéro).
export function jeuMoins(P, h) {
  const b = jeuVide(), pos = x => Math.max(0, x);
  b.matchs = pos(P.matchs - h.matchs); b.victoires = pos((P.victoires || 0) - (h.victoires || 0));
  b.signes = P.signes.map((x, i) => pos(x - h.signes[i]));
  for (const k of ["smashsTentes", "smashsReussis", "apresVictoire", "memeApresVictoire", "apresDefaite", "memeApresDefaite", "devines", "lisibles"]) b[k] = pos((P[k] || 0) - h[k]);
  return b;
}
