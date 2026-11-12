// Les marques du smash (12 novembre, idée et choix du porteur du projet) : un smash qui gagne le point abîme la main de celui
// qui perd le point, jusqu'à la fin du set (pour le décor seulement : rien ne change au jeu).
//   Ciseaux contre Feuille : le gant déchiré (sur la main nue : un pansement) ;
//   Pierre contre Ciseaux : les lames tordues (les deux doigts du V pliés de travers) ;
//   Feuille contre Pierre : une fissure qui part d'un petit creux, sur le poing.
// Deux smashs dans le même set (avec le smash récupéré) : la marque grandit (au plus 2).
// Ici, seulement la logique (testée) ; les dessins sont dans avatar.js.

// Le signe du smash gagnant (0 Pierre, 1 Ciseaux, 2 Feuille, comme regles.js) → la marque.
export const MARQUE_DU_SIGNE = ["tordu", "dechire", "fissure"];
export const MAX_MARQUE = 2;

export const nouveauxDegats = () => ({ set: 0, mains: [{}, {}] });

// Après un coup. set : le set où il a été joué (avant le point marqué) ; gagnant : 0, 1 ou null ; signes : [a, b] ;
// smashGagnant : le smash a gagné le point (issueSmash « gagne »). Renvoie la marque ajoutée ({ joueur, marque }) ou null.
export function noterDegats(etat, { set, gagnant, signes, smashGagnant }) {
  if (etat.set !== set) { etat.set = set; etat.mains = [{}, {}]; }   // nouveau set : les mains sont réparées
  if (!smashGagnant || (gagnant !== 0 && gagnant !== 1)) return null;
  const perdant = 1 - gagnant, marque = MARQUE_DU_SIGNE[signes[gagnant]];
  if (!marque) return null;
  const m = etat.mains[perdant];
  m[marque] = Math.min(MAX_MARQUE, (m[marque] || 0) + 1);
  return { joueur: perdant, marque };
}

// Les marques d'un joueur pour le set en cours ({ dechire, tordu, fissure }), ou null s'il n'en a pas.
export function degatsDe(etat, joueur, set) {
  if (!etat || etat.set !== set) return null;
  const m = etat.mains[joueur];
  return m && Object.keys(m).length ? m : null;
}
