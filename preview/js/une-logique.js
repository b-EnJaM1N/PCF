// « La Une » : l'histoire du match racontée comme la une d'un journal sportif.
// Ici, seulement les mots (titre, chapô, chiffre, citation) : testé automatiquement.
// Le dessin de l'image est dans une.js.

import { MARQUE } from "./marque.js";
const MAJ = t => t.toLocaleUpperCase("fr-FR");
const setsTexte = (a, b) => `${a} set${a > 1 ? "s" : ""} à ${b}`;

// m : le match terminé ; stats : stats-match.js ; moi / adv : { nom, surnom (texte), genre }
// contexte : { etape (« Finale du PCF Open », « Duel officiel »…), finale, citations (répliques dites pendant le match),
//   enjeu (le gage d'un défi entre amis : le perdant s'y colle) }
export function histoireDuMatch(m, stats, moi, adv, { etape = "Match amical", finale = false, citations = [], enjeu = null } = {}, rng = Math.random) {
  const gagne = m.vainqueur === 0, f = moi.genre === "f";
  const [A, B] = [MAJ(moi.nom), MAJ(adv.nom)];
  const sets = m.scoresSets, unSet = m.format.setsGagnants === 1;
  const ecarts = sets.map(([a, b]) => a - b);
  const decisif = !unSet && m.sets[0] + m.sets[1] === 2 * m.format.setsGagnants - 1;
  const fanny = sets.some(([a, b]) => a >= 7 && b === 0) ? "moi" : sets.some(([a, b]) => b >= 7 && a === 0) ? "adv" : null;
  const au = (liste) => liste[Math.floor(rng() * liste.length)];

  let titre;
  if (gagne) {
    if (finale) titre = `${A} ${f ? "SACRÉE" : "SACRÉ"} !`;
    else if (stats.ballesDeMatchSauvees > 0) titre = `${A} REVIENT D'ENTRE LES MORTS`;
    else if (stats.premierSetPerdu && !unSet) titre = `LA REMONTADA DE ${A}`;
    else if (fanny === "moi") titre = `${B} EMBRASSE FANNY`;
    else if (ecarts.every(e => e >= 5)) titre = `${A} ÉCRASE ${B}`;
    else if (decisif) titre = `${A} AU BOUT DU SUSPENSE`;
    else titre = au([`${A} FAIT TOMBER ${B}`, `${A} DOMPTE ${B}`, `${A} S'IMPOSE FACE À ${B}`]);
  } else {
    if (finale) titre = `${A} ${f ? "TOMBÉE" : "TOMBÉ"} EN FINALE`;
    else if (fanny === "adv") titre = `${A} EMBRASSE FANNY`;
    else if (decisif) titre = `${A} Y ÉTAIT PRESQUE`;
    else if (ecarts.every(e => e <= -5)) titre = `SOIRÉE NOIRE POUR ${A}`;
    else titre = au([`${B} FAIT PLIER ${A}`, `${A} ${f ? "BATTUE" : "BATTU"} PAR ${B}`]);
  }

  // Un défi avec enjeu (10 novembre, demande du porteur du projet) : le gros titre, c'est l'enjeu (« BENJA-MAIN SORT LES POUBELLES »).
  const te = enjeu ? titreEnjeu(enjeu, gagne ? B : A, gagne ? A : B) : null;
  if (te) titre = te;

  const detail = sets.map(([a, b]) => `${a}–${b}`).join(", ");
  const verbe = gagne ? "s'impose" : "s'incline";
  const qui = j => (j.surnom ? `${j.nom}, « ${j.surnom} »,` : j.nom);
  const chapo = unSet
    ? `${qui(moi)} ${verbe} ${detail} face à ${qui(adv).replace(/,$/, "")}.`
    : `${qui(moi)} ${verbe} ${setsTexte(m.sets[0], m.sets[1])} face à ${qui(adv).replace(/,$/, "")} (${detail}).`;
  // L'enjeu du défi (25 octobre) : le journal dit qui s'y colle.
  const gage = enjeu ? ` L'enjeu était « ${enjeu.replace(/[.!?\s]+$/, "")} » : c'est ${gagne ? adv.nom : moi.nom} qui s'y colle !` : "";

  return { etape, titre, chapo: chapo + gage, chiffre: chiffreDuMatch(m, stats), citation: citationDuMatch(citations), gagne };
}

// Le titre d'un enjeu : PERDANT et GAGNANT (en majuscules) ; null si l'enjeu ne se laisse pas tourner en titre.
//   « Qui sort les poubelles ? »      → BENJA-MAIN SORT LES POUBELLES
//   « Le perdant paie le café »        → BENJA-MAIN PAIE LE CAFÉ (« la perdante », « celui qui perd »… aussi)
//   « Le gagnant choisit le film »     → LE CHIROMANCIEN CHOISIT LE FILM
//   « Sortir les poubelles »           → BENJA-MAIN DOIT SORTIR LES POUBELLES
//   autre chose (« Les poubelles »)    → BENJA-MAIN S'Y COLLE : « LES POUBELLES »
export function titreEnjeu(enjeu, PERDANT, GAGNANT) {
  const t = String(enjeu || "").replace(/\s+/g, " ").trim().replace(/[\s.!?…]+$/, "");
  if (!t) return null;
  const reste = (re) => { const x = t.match(re); return x ? x[1].trim() : null; };
  const suite = s => MAJ(s);
  let r;
  if ((r = reste(/^(?:qui|lequel|laquelle|lequel de nous)\s+(.+)$/i))) return `${PERDANT} ${suite(r)}`;
  if ((r = reste(/^(?:le|la)\s+(?:perdant|perdante|vaincu|vaincue|loser)\s+(.+)$/i)) || (r = reste(/^(?:celui|celle)\s+qui\s+perd\s+(.+)$/i))) return `${PERDANT} ${suite(r)}`;
  if ((r = reste(/^(?:le|la)\s+(?:gagnant|gagnante|vainqueur|vainqueure)\s+(.+)$/i)) || (r = reste(/^(?:celui|celle)\s+qui\s+gagne\s+(.+)$/i))) return `${GAGNANT} ${suite(r)}`;
  // un verbe à l'infinitif en tête (« sortir les poubelles », « se lever tôt », « faire la vaisselle »)
  if (/^(?:se\s+|s'|m'|me\s+)?[a-zàâçéèêëîïôûùüÿœ-]+(?:er|ir|re|oir)\b/i.test(t) && !/^(?:le|la|les|un|une|des|du|mon|ma|mes|ton|ta|tes|notre|votre)\b/i.test(t)) return `${PERDANT} DOIT ${suite(t)}`;
  return `${PERDANT} S'Y COLLE : « ${suite(t)} »`;
}

// Le chiffre à retenir : le plus remarquable du match.
export function chiffreDuMatch(m, stats) {
  const egalites = m.coups.filter(c => c.gagnant === null).length;
  if (stats.ballesDeMatchSauvees > 0) return { valeur: stats.ballesDeMatchSauvees, legende: stats.ballesDeMatchSauvees > 1 ? "balles de match sauvées" : "balle de match sauvée" };
  if (stats.meilleureSerie >= 5) return { valeur: stats.meilleureSerie, legende: "points d'affilée" };
  if (stats.ballesSauvees >= 2) return { valeur: stats.ballesSauvees, legende: "balles de set sauvées" };
  if (stats.lecturesReussies >= 3) return { valeur: stats.lecturesReussies, legende: "réflexes adverses lus et punis" };
  if (egalites >= 8) return { valeur: egalites, legende: "égalités : les esprits se sont croisés" };
  return { valeur: m.coups.length, legende: m.coups.length > 1 ? "coups joués" : "coup joué" };
}

// La phrase du match : la dernière de la commentatrice, sinon la dernière du commentateur.
export function citationDuMatch(citations) {
  for (const role of ["commentatrice", "commentateur"]) {
    const r = [...citations].reverse().find(l => l.role === role && l.texte.length <= 90);
    if (r) return { texte: r.texte, auteur: MARQUE[role] };
  }
  return null;
}
