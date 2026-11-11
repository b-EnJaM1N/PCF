// Les nouveautés : d'abord sur la version de test (et en local), puis ouvertes à tous, une par une.
// (10 novembre : Google demande 14 jours de test fermé de plus, avec des mises à jour qui suivent l'avis des testeurs ; le porteur
// du projet a choisi d'ouvrir les nouveautés au fil de ces 14 jours.)
//   serie : la série de jours du match du jour et ses trophées ;  fantome : le fantôme d'un ami ;  replay : le moment du set et
//   les temps forts ;  hymne : l'écran titre avec l'hymne ;  club : les objets du club et le trophée « Fondé en 2026 » ;
//   fil : le fil d'actualité du cercle et « Publier la Une » (11 novembre ; à ouvrir avec le fantôme le 13 novembre).
export const OUVERTES = new Set(["serie"]);

export function versionDeTest(loc = typeof location !== "undefined" ? location : null) {
  if (!loc) return false;
  return /\/preview\//.test(loc.pathname) || /^(localhost|127\.)/.test(loc.hostname);
}
export const ouvert = (nom, loc) => OUVERTES.has(nom) || versionDeTest(loc);
