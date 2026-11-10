// Le replay (6 novembre, idée du porteur du projet) : pendant la pause entre les sets, « le moment du set » ; à la fin du match,
// « les temps forts » (3 actions marquantes, rejouées au ralenti avec le score du moment et le bandeau REPLAY).
// Sur la version de test, et partout une fois ouvert (nouveautes.js).
import { ouvert } from "./nouveautes.js";

export const replayVisible = loc => ouvert("replay", loc);

// Ce qui rend une action marquante, du plus fort au moins fort.
export const PRIORITES = { match: 10, sauvee_match: 9, sauvee_set: 8, smash: 7, set: 6, serie: 5, egalites: 4 };
export const TITRES = {
  match: "Balle de match !", sauvee_match: "Balle de match sauvée !", sauvee_set: "Balle de set sauvée !",
  smash: "💥 Le smash !", set: "Balle de set !", serie: "Cinq points d'affilée !", egalites: "Enfin, après les égalités !",
};

// L'action marquante d'un coup, ou null. evt : ce que renvoie jouerCoup ; coups : les coups du match (celui-ci compris) ;
// smash : [moi, l'adversaire] ; score : le score du set après ce point ; serie : la série de points en cours après ce coup (series(coups).serie).
export function momentDuCoup(evt, coups, { smash = [false, false], smashGagne = false, serie = 0, set = 0, score = null } = {}) {
  if (evt.gagnant === null || evt.gagnant === undefined) return null;
  let egalites = 0;
  for (let i = coups.length - 2; i >= 0 && coups[i].gagnant === null; i--) egalites++;
  const b = evt.balleAvant;
  const type = evt.finMatch ? "match"
    : b && evt.gagnant !== b.joueur ? (b.type === "match" ? "sauvee_match" : "sauvee_set")
    : smashGagne ? "smash"
    : evt.finSet ? "set"
    : serie === 5 ? "serie"
    : egalites >= 3 ? "egalites" : null;
  if (!type) return null;
  return { type, priorite: PRIORITES[type], a: evt.a, b: evt.b, gagnant: evt.gagnant, smash: [!!smash[0], !!smash[1]],
    score: evt.finSet ? [...evt.scoreSet] : score ? [...score] : null, egalites, set, coup: coups.length - 1 };
}

// Les n actions les plus marquantes (à priorité égale, la plus tardive), remises dans l'ordre du match.
export function tempsForts(moments, n = 3) {
  return [...moments].sort((x, y) => y.priorite - x.priorite || y.coup - x.coup).slice(0, n).sort((x, y) => x.coup - y.coup);
}
// L'action marquante d'un set (la plus forte), ou null.
export const momentDuSet = (moments, set) => tempsForts(moments.filter(m => m.set === set), 1)[0] || null;
