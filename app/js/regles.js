// Règles officielles du PCF. Ce module ne dépend ni de l'écran ni du son :
// il est couvert par les tests automatiques (dossier tests/).
//
// Joueurs : 0 = côté jaune (toi), 1 = côté rouge (l'adversaire).

export const PIERRE = 0, CISEAUX = 1, FEUILLE = 2;
export const EMOJI = ["🪨", "✂️", "📄"];
export const NOM = ["Pierre", "Ciseaux", "Feuille"];
export const DUREE_COUP_MS = 5000;
export const POINTS_PAR_SET = [11, 7];      // 11 = format officiel, 7 = option
export const SETS_GAGNANTS = [2, 3];
export const COTE = ["jaune", "rouge"];

// Pierre bat Ciseaux, Ciseaux bat Feuille, Feuille bat Pierre.
export const bat = (a, b) => (a + 1) % 3 === b;
// Le signe qui bat m.
export const contre = m => (m + 2) % 3;
export const signeAuHasard = (rng = Math.random) => Math.floor(rng() * 3);

export function nouveauMatch({ pointsParSet = 11, setsGagnants = 2 } = {}) {
  if (!POINTS_PAR_SET.includes(pointsParSet)) throw new Error(`Sets de ${pointsParSet} points non autorisés`);
  if (!SETS_GAGNANTS.includes(setsGagnants)) throw new Error(`${setsGagnants} sets gagnants non autorisés`);
  return {
    format: { pointsParSet, setsGagnants },
    points: [0, 0],        // score du set en cours
    sets: [0, 0],          // sets gagnés
    scoresSets: [],        // scores des sets terminés, ex. [[11, 8], [9, 11]]
    coups: [],             // { a, b, gagnant: 0|1|null, auto: [bool, bool] }
    debutsSet: [0],        // index du premier coup de chaque set
    termine: false,
    vainqueur: null,
  };
}

// 0 si a gagne, 1 si b gagne, null en cas d'égalité.
export function gagnantCoup(a, b) {
  if (a === b) return null;
  return bat(a, b) ? 0 : 1;
}

// Un set est gagné à pointsParSet points, avec 2 points d'écart.
export function vainqueurSet(pa, pb, pointsParSet) {
  if (Math.max(pa, pb) < pointsParSet || Math.abs(pa - pb) < 2) return null;
  return pa > pb ? 0 : 1;
}

// Qui a une balle de set ou de match en ce moment ? null si personne.
export function balle(match) {
  if (match.termine) return null;
  const len = match.format.pointsParSet;
  for (const j of [0, 1]) {
    const a = match.points[j], b = match.points[1 - j];
    if (a >= len - 1 && a - b >= 1) {
      return { joueur: j, type: match.sets[j] === match.format.setsGagnants - 1 ? "match" : "set" };
    }
  }
  return null;
}

// Égalité en fin de set (10 partout, 11 partout…) : il faut 2 points d'écart.
export const egaliteFinDeSet = match =>
  !match.termine && match.points[0] === match.points[1] && match.points[0] >= match.format.pointsParSet - 1;

export const numeroSetEnCours = match => match.scoresSets.length + 1;
export const setDecisif = match =>
  match.sets[0] === match.format.setsGagnants - 1 && match.sets[1] === match.format.setsGagnants - 1;

// Joue un coup et renvoie ce qui s'est passé. `auto` indique les signes
// joués au hasard parce que le temps était écoulé.
export function jouerCoup(match, a, b, auto = [false, false]) {
  if (match.termine) throw new Error("Le match est terminé");
  for (const s of [a, b]) if (![0, 1, 2].includes(s)) throw new Error(`Signe invalide : ${s}`);

  const balleAvant = balle(match);
  const gagnant = gagnantCoup(a, b);
  match.coups.push({ a, b, gagnant, auto: [!!auto[0], !!auto[1]] });
  const evt = { a, b, gagnant, egalite: gagnant === null, balleAvant, finSet: false, finMatch: false, scoreSet: null };

  if (gagnant !== null) {
    match.points[gagnant]++;
    const v = vainqueurSet(match.points[0], match.points[1], match.format.pointsParSet);
    if (v !== null) {
      evt.finSet = true;
      evt.scoreSet = [...match.points];
      match.scoresSets.push([...match.points]);
      match.sets[v]++;
      match.points = [0, 0];
      if (match.sets[v] === match.format.setsGagnants) {
        match.termine = true;
        match.vainqueur = v;
        evt.finMatch = true;
      } else {
        match.debutsSet.push(match.coups.length);
      }
    }
  }
  evt.balleApres = balle(match);
  return evt;
}
