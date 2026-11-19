// Le replay (6 novembre, idée du porteur du projet) : pendant la pause entre les sets, « le moment du set » ; à la fin du match,
// « les temps forts » (3 actions marquantes, rejouées au ralenti avec le score du moment et le bandeau REPLAY).
// Sur la version de test, et partout une fois ouvert (nouveautes.js).
import { ouvert } from "./nouveautes.js";
import { habitudes, piste, s_applique } from "./lecture-adversaire.js";

export const replayVisible = loc => ouvert("replay", loc);

// Ce qui rend une action marquante, du plus fort au moins fort.
export const PRIORITES = { match: 10, sauvee_match: 9, sauvee_set: 8, smash: 7, set: 6, piege: 5, serie: 5, egalites: 4 };
export const TITRES = {
  match: "Balle de match !", sauvee_match: "Balle de match sauvée !", sauvee_set: "Balle de set sauvée !",
  smash: "💥 Le smash !", piege: "🪤 Le piège !", set: "Balle de set !", serie: "Cinq points d'affilée !", egalites: "Enfin, après les égalités !",
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
    : piegeDuPoint(coups) ? "piege"
    : serie === 5 ? "serie"
    : egalites >= 3 ? "egalites" : null;
  if (!type) return null;
  return { type, priorite: PRIORITES[type], a: evt.a, b: evt.b, gagnant: evt.gagnant, smash: [!!smash[0], !!smash[1]],
    score: evt.finSet ? [...evt.scoreSet] : score ? [...score] : null, egalites, set, coup: coups.length - 1, palette: paletteDuPoint(coups, { smashGagne }) };
}

// Les n actions les plus marquantes (à priorité égale, la plus tardive), remises dans l'ordre du match.
export function tempsForts(moments, n = 3) {
  return [...moments].sort((x, y) => y.priorite - x.priorite || y.coup - x.coup).slice(0, n).sort((x, y) => x.coup - y.coup);
}
// L'action marquante d'un set (la plus forte), ou null.
// (19 novembre, remarque du porteur du projet : on revoyait un point du perdant du set, qui n'avait rien changé) gagnant : celui qui
// a gagné le set ; on rejoue d'abord une de ses actions, celle du perdant seulement s'il n'en a aucune.
export const momentDuSet = (moments, set, gagnant = null) => {
  const du = moments.filter(m => m.set === set), siens = gagnant === null ? du : du.filter(m => m.gagnant === gagnant);
  return tempsForts(siens.length ? siens : du, 1)[0] || null;
};

// ---------------------------------------------------------------- la palette (11 novembre, idée du porteur du projet)
// Sous le replay, les 5 coups qui ont précédé le point, l'habitude qui comptait, et le verdict de Monique :
//   pertinent : le gagnant a joué le signe que conseillait la lecture de l'adversaire (« Lire l'adversaire ») ;
//   propre    : le gagnant avait une habitude et l'a cassée au bon moment ;
//   mauvais   : le perdant a suivi son habitude, et l'a payé ;
//   pas_la    : le perdant a pris la mauvaise décision (rien d'autre ne l'explique : « Le jeu n'était pas là »).
export const TAILLE_PALETTE = 5;
export const VERDICTS = {
  pertinent: "Tactiquement pertinent", propre: "Techniquement très propre", mauvais: "Mauvais choix", pas_la: "Le jeu n'était pas là",
  piege: "Le piège parfait", smash: "Un smash qui fait mal", smash_subi: "Un smash qui laisse des traces",
};
// (18 novembre, idées et répliques choisies par le porteur du projet)
//   piege      : le gagnant avait joué au moins 3 fois de suite le même signe, puis il en change, et marque ;
//   smash      : le point marqué d'un smash (Monique parle du smasheur) ;
//   smash_subi : le même, quand le smasheur a ensuite gagné le set (Monique parle de celui qui l'a subi ; choisi au replay).
export const PIEGE_MIN = 3;
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

// Le piège du dernier coup : son gagnant avait joué n fois de suite le même signe (au moins PIEGE_MIN, égalités comprises),
// et il en change pour marquer. → { joueur, n, repete, signe } ou null.
export function piegeDuPoint(coups) {
  const dernier = coups.at(-1);
  if (!dernier || (dernier.gagnant !== 0 && dernier.gagnant !== 1)) return null;
  const w = dernier.gagnant, s = c => (w === 0 ? c.a : c.b), avant = coups.slice(0, -1), repete = avant.length ? s(avant.at(-1)) : null;
  let n = 0;
  for (let i = avant.length - 1; i >= 0 && s(avant[i]) === repete; i--) n++;
  return n >= PIEGE_MIN && s(dernier) !== repete ? { joueur: w, n, repete, signe: s(dernier) } : null;
}

// La palette du dernier coup de la liste (le point rejoué), ou null pour une égalité.
// { verdict, joueur : de qui parle Monique (0 ou 1), habitude : { cle, compte, joueur } ou null, coups : les 5 d'avant }.
export function paletteDuPoint(coups, { smashGagne = false } = {}) {
  const dernier = coups.at(-1);
  if (!dernier || dernier.gagnant === null || dernier.gagnant === undefined) return null;
  const avant = coups.slice(0, -1), w = dernier.gagnant, l = 1 - w;
  const signe = x => (x === 0 ? dernier.a : dernier.b);
  const res = (verdict, joueur, h, de) => ({ verdict, joueur, habitude: h ? { cle: h.cle, compte: h.compte, joueur: de } : null,
    coups: avant.slice(-TAILLE_PALETTE).map(c => ({ a: c.a, b: c.b, gagnant: c.gagnant })) });
  if (smashGagne) return { ...res("smash", w, null, null), smasheur: w };
  const lu = piste(vue(avant, l)), hl = reflexe(vue(avant, l)), hw = reflexe(vue(avant, w));
  if (lu && signe(w) === lu.signe && hl) return res("pertinent", w, hl, l);
  // (le piège passe après la lecture de l'adversaire, et avant le simple changement d'habitude, dont il est le cas le plus beau)
  const pg = piegeDuPoint(coups);
  if (pg) return { ...res("piege", w, null, null), piege: pg };
  if (hw && !suit(hw.prevu, signe(w))) return res("propre", w, hw, w);
  if (hl && suit(hl.prevu, signe(l))) return res("mauvais", l, hl, l);
  // (18 novembre, précision du porteur du projet) « Le jeu n'était pas là » : le perdant a pris la mauvaise décision.
  return res("pas_la", l, null, null);
}
