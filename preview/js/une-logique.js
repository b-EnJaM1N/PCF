// « La Une » : l'histoire du match racontée comme la une d'un journal sportif.
// Ici, seulement les mots (titre, chapô, chiffre, citation) : testé automatiquement.
// Le dessin de l'image est dans une.js.

import { MARQUE } from "./marque.js";
const MAJ = t => t.toLocaleUpperCase("fr-FR");
const setsTexte = (a, b) => `${a} set${a > 1 ? "s" : ""} à ${b}`;

// m : le match terminé ; stats : stats-match.js ; moi / adv : { nom, surnom (texte), genre }
// contexte : { etape (« Finale du PCF Open », « Duel officiel »…), finale, citations (répliques dites pendant le match) }
export function histoireDuMatch(m, stats, moi, adv, { etape = "Match amical", finale = false, citations = [] } = {}, rng = Math.random) {
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

  const detail = sets.map(([a, b]) => `${a}–${b}`).join(", ");
  const verbe = gagne ? "s'impose" : "s'incline";
  const qui = j => (j.surnom ? `${j.nom}, « ${j.surnom} »,` : j.nom);
  const chapo = unSet
    ? `${qui(moi)} ${verbe} ${detail} face à ${qui(adv).replace(/,$/, "")}.`
    : `${qui(moi)} ${verbe} ${setsTexte(m.sets[0], m.sets[1])} face à ${qui(adv).replace(/,$/, "")} (${detail}).`;

  return { etape, titre, chapo, chiffre: chiffreDuMatch(m, stats), citation: citationDuMatch(citations), gagne };
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
