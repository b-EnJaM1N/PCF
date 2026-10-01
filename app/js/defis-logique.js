// Les défis du jour : 3 par jour, tirés au sort par le serveur (supabase/etape-15-freeroll.sql), les mêmes pour tous.
// Ici : leur texte, et le suivi de la journée sur le téléphone (testé automatiquement).
// « serveur » : le serveur vérifie lui-même (duel en ligne, freeroll) ; les autres font confiance à l'appli.

export const DEFIS = {
  gagner_3: { texte: "Gagne 3 matchs", but: 3, mesure: e => e.gagnes },
  jouer_5: { texte: "Joue 5 matchs", but: 5, mesure: e => e.joues },
  duel_en_ligne: { texte: "Termine un duel en ligne", but: 1, mesure: e => e.duels, serveur: true },
  balle_sauvee: { texte: "Sauve une balle de set ou de match", but: 1, mesure: e => e.ballesSauvees },
  set_net: { texte: "Gagne un set en laissant 3 points au plus", but: 1, mesure: e => e.setsNets },
  poignees_franches: { texte: "Serre la main franchement 3 fois", but: 3, mesure: e => e.franches },
  serie_4: { texte: "Gagne 4 points d'affilée", but: 1, mesure: e => e.series4 },
  bot_fort: { texte: "Bats un bot de niveau 1 300 ou plus", but: 1, mesure: e => e.botsForts },
  freeroll: { texte: "Participe au freeroll de 20 h", but: 1, mesure: e => e.freerolls, serveur: true },
};

// Le jour à l'heure de Paris (« 2026-10-01 »), comme sur le serveur.
export const jourDeParis = (date = new Date()) => date.toLocaleDateString("fr-CA", { timeZone: "Europe/Paris" });

export function journeeVide(jour) {
  return { jour, gagnes: 0, joues: 0, duels: 0, ballesSauvees: 0, setsNets: 0, franches: 0, series4: 0, botsForts: 0, freerolls: 0 };
}
// La journée gardée sur le téléphone, remise à zéro si on a changé de jour.
export const journee = (garde, jour) => (garde && garde.jour === jour ? { ...journeeVide(jour), ...garde } : journeeVide(jour));

// Après un match. r = { gagne, coups, ballesSauvees, meilleureSerie, scoresSets, pointsParSet, duel, eloBot }
export function suivreMatch(e, r) {
  if (!r.coups) return e;
  e.joues++;
  if (r.gagne) e.gagnes++;
  if (r.duel && r.termineAuScore) e.duels++;
  if (r.ballesSauvees > 0) e.ballesSauvees++;
  if (r.meilleureSerie >= 4) e.series4++;
  if (r.pointsParSet >= 7 && (r.scoresSets || []).some(([a, b]) => a > b && b <= 3)) e.setsNets++;
  if (!r.duel && r.gagne && r.eloBot >= 1300) e.botsForts++;
  return e;
}
export function suivrePoignee(e, style) { if (style === "franche") e.franches++; return e; }

// Où en est un défi : { texte, fait (déjà encaissé), reussi (réussi, encaissé ou non), pret (on peut tenter d'encaisser),
// progression : « 2/3 » }. Un défi vérifié par le serveur est toujours « pret » : le serveur dira s'il est réussi.
export function etatDefi(d, e) {
  const def = DEFIS[d.id];
  if (!def) return { texte: d.id, fait: !!d.fait, reussi: !!d.fait, pret: false, progression: "" };
  const n = Math.min(def.but, def.mesure(e) || 0);
  return { texte: def.texte, fait: !!d.fait, reussi: !!d.fait || n >= def.but, pret: !d.fait && (def.serveur || n >= def.but), progression: def.but > 1 ? `${n}/${def.but}` : "" };
}
