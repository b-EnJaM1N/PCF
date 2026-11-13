// Les nouveautés : d'abord sur la version de test (et en local), puis ouvertes à tous, une par une.
// (10 novembre : Google demande 14 jours de test fermé de plus, avec des mises à jour qui suivent l'avis des testeurs ; le porteur
// du projet a choisi d'ouvrir les nouveautés au fil de ces 14 jours.)
//   serie : la série de jours du match du jour et ses trophées ;  fantome : le fantôme d'un ami ;  replay : le moment du set et
//   les temps forts ;  hymne : l'écran titre avec l'hymne ;  club : les objets du club et le trophée « Fondé en 2026 » ;
//   fil : le fil d'actualité du cercle et « Publier la Une » (11 novembre ; à ouvrir avec le fantôme le 13 novembre) ;
//   poules : le championnat du cercle avec poules, playoffs et playouts (11 novembre, étape SQL 66) ;
//   avis : la carte « Ton avis ? » à la fin d'un match, une seule fois après le 5e match (11 novembre) ;
//   fiche : la fiche complète d'un joueur en ligne, stats, face-à-face, historique (11 novembre, étape SQL 68).
//   records : les records du cercle, tous les duels ou les tournois seulement (13 novembre, étape SQL 74).
//   dossard : le Dossard 1, gant jaune du tenant du titre d'un cercle, son annonce dans le fil, le trophée de la coupe (12 novembre, étape SQL 71).
// (13 novembre, comme validé par le porteur du projet le 11 : le fantôme, le fil du cercle, le championnat avec poules, la carte
// « Ton avis ? » et la fiche d'un joueur ouverts à tous ; le Dossard 1 reste en test, décision du 12 novembre.)
export const OUVERTES = new Set(["serie", "fantome", "fil", "poules", "avis", "fiche"]);

export function versionDeTest(loc = typeof location !== "undefined" ? location : null) {
  if (!loc) return false;
  return /\/preview\//.test(loc.pathname) || /^(localhost|127\.)/.test(loc.hostname);
}
export const ouvert = (nom, loc) => OUVERTES.has(nom) || versionDeTest(loc);

// La carte « Ton avis ? » (11 novembre, choix du porteur du projet) : à la fin d'un match, une seule fois, à partir du 5e match,
// si le joueur n'a pas déjà donné son avis (Options › 💬).
export const MATCHS_AVANT_AVIS = 5;
export const proposerAvis = ({ matchs = 0, dejaProposee = false, dejaDonne = false } = {}) => matchs >= MATCHS_AVANT_AVIS && !dejaProposee && !dejaDonne;
