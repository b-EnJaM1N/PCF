// Le replay (6 novembre, idée du porteur du projet) : pendant la pause entre les sets, « le moment du set » ; à la fin du match,
// « les temps forts » (3 actions marquantes, rejouées au ralenti avec le score du moment et le bandeau REPLAY).
// Sur la version de test, et partout une fois ouvert (nouveautes.js).
import { ouvert } from "./nouveautes.js";
import { habitudes, piste, s_applique } from "./lecture-adversaire.js";

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
    score: evt.finSet ? [...evt.scoreSet] : score ? [...score] : null, egalites, set, coup: coups.length - 1, palette: paletteDuPoint(coups) };
}

// Les n actions les plus marquantes (à priorité égale, la plus tardive), remises dans l'ordre du match.
export function tempsForts(moments, n = 3) {
  return [...moments].sort((x, y) => y.priorite - x.priorite || y.coup - x.coup).slice(0, n).sort((x, y) => x.coup - y.coup);
}
// L'action marquante d'un set (la plus forte), ou null.
export const momentDuSet = (moments, set) => tempsForts(moments.filter(m => m.set === set), 1)[0] || null;

// ---------------------------------------------------------------- la palette (11 novembre, idée du porteur du projet)
// Sous le replay, les 5 coups qui ont précédé le point, l'habitude qui comptait, et le verdict de Monique :
//   pertinent : le gagnant a joué le signe que conseillait la lecture de l'adversaire (« Lire l'adversaire ») ;
//   propre    : le gagnant avait une habitude et l'a cassée au bon moment ;
//   mauvais   : le perdant a suivi son habitude, et l'a payé ;
//   pas_la    : rien à lire (trop peu de coups, ou pas d'habitude), c'était un pari.
export const TAILLE_PALETTE = 5;
export const VERDICTS = {
  pertinent: "Tactiquement pertinent", propre: "Techniquement très propre", mauvais: "Mauvais choix", pas_la: "Le jeu n'était pas là",
};
// L'habitude, écrite pour la palette ({n} : le nom du joueur).
const HABITUDES = {
  favori: "{n} joue souvent le même signe",
  rejoue_victoire: "Après un point gagné, {n} rejoue le même signe",
  change_defaite: "Après un point perdu, {n} change de signe",
  jamais_deux: "{n} ne joue jamais deux fois de suite le même signe",
  boucle: "{n} tourne en boucle : Pierre, Feuille, Ciseaux…",
  copie: "{n} rejoue souvent le dernier signe d'en face",
  contre: "{n} joue souvent ce qui battait le dernier signe d'en face",
};
// (le joueur sans pseudo s'appelle « Toi » : on lui parle à la 2e personne)
const HABITUDES_TOI = {
  favori: "Tu joues souvent le même signe", rejoue_victoire: "Après un point gagné, tu rejoues le même signe",
  change_defaite: "Après un point perdu, tu changes de signe", jamais_deux: "Tu ne joues jamais deux fois de suite le même signe",
  boucle: "Tu tournes en boucle : Pierre, Feuille, Ciseaux…", copie: "Tu rejoues souvent le dernier signe d'en face",
  contre: "Tu joues souvent ce qui battait le dernier signe d'en face",
};
export const texteHabitude = (h, nom) => (h
  ? `${nom === "Toi" ? HABITUDES_TOI[h.cle] : HABITUDES[h.cle].replace("{n}", nom)}${h.compte ? ` (${h.compte})` : ""}` : "");

// Les coups vus du côté du joueur x (0 : moi, 1 : l'adversaire) : b = son signe, gagnant = 1 quand il gagne (lecture-adversaire.js).
const vue = (coups, x) => (x === 1 ? coups : coups.map(c => ({ a: c.b, b: c.a, gagnant: c.gagnant === null ? null : 1 - c.gagnant })));
// Son réflexe qui s'appliquait à ce coup-là, et ce qu'il prévoyait (un signe, ou deux possibles).
function reflexe(coupsVus) {
  if (coupsVus.length < 4) return null;
  const h = habitudes(coupsVus).find(x => s_applique(x, coupsVus.at(-1)));
  return h ? { cle: h.cle, compte: (h.texte.match(/\((\d+ fois sur \d+)\)/) || [])[1] || "", prevu: h.prevision(coupsVus) } : null;
}
const suit = (prevu, s) => (Array.isArray(prevu) ? prevu.includes(s) : prevu === s);

// La palette du dernier coup de la liste (le point rejoué), ou null pour une égalité.
// { verdict, joueur : de qui parle Monique (0 ou 1), habitude : { cle, compte, joueur } ou null, coups : les 5 d'avant }.
export function paletteDuPoint(coups) {
  const dernier = coups.at(-1);
  if (!dernier || dernier.gagnant === null || dernier.gagnant === undefined) return null;
  const avant = coups.slice(0, -1), w = dernier.gagnant, l = 1 - w;
  const signe = x => (x === 0 ? dernier.a : dernier.b);
  const res = (verdict, joueur, h, de) => ({ verdict, joueur, habitude: h ? { cle: h.cle, compte: h.compte, joueur: de } : null,
    coups: avant.slice(-TAILLE_PALETTE).map(c => ({ a: c.a, b: c.b, gagnant: c.gagnant })) });
  const lu = piste(vue(avant, l)), hl = reflexe(vue(avant, l)), hw = reflexe(vue(avant, w));
  if (lu && signe(w) === lu.signe && hl) return res("pertinent", w, hl, l);
  if (hw && !suit(hw.prevu, signe(w))) return res("propre", w, hw, w);
  if (hl && suit(hl.prevu, signe(l))) return res("mauvais", l, hl, l);
  return res("pas_la", w, null, null);
}
