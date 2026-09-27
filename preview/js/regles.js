// Règles officielles du PCF. Ce module ne dépend ni de l'écran ni du son :
// il est couvert par les tests automatiques (dossier tests/).
//
// Joueurs : 0 = côté jaune (toi), 1 = côté rouge (l'adversaire).

export const PIERRE = 0, CISEAUX = 1, FEUILLE = 2;
export const EMOJI = ["🪨", "✂️", "📄"];
export const NOM = ["Pierre", "Ciseaux", "Feuille"];
export const DUREE_COUP_MS = 5000;
// Trois étages : le point, le jeu, le set. Un jeu se gagne en 11 points (ou 7) avec 2 points
// d'écart ; un set se gagne au premier à 1 jeu (format classique : le set EST le jeu) ou à 3 jeux ;
// le match se gagne en 1, 2 ou 3 sets.
export const POINTS_PAR_SET = [11, 7];      // points pour gagner un jeu : 11 = format officiel, 7 = option
export const JEUX_PAR_SET = [1, 3];
export const SETS_GAGNANTS = [1, 2, 3];
export const COTE = ["jaune", "rouge"];

// Le format en toutes lettres : « Sets de 11 points · 2 sets gagnants »,
// « Jeux de 11 points · sets en 3 jeux · match en 1 set »…
export function texteFormat({ pointsParSet = 11, setsGagnants = 2, jeuxParSet = 1 } = {}) {
  const sets = setsGagnants === 1 ? "match en 1 set" : `${setsGagnants} sets gagnants`;
  return jeuxParSet === 1 ? `Sets de ${pointsParSet} points · ${sets}` : `Jeux de ${pointsParSet} points · sets en ${jeuxParSet} jeux · ${sets}`;
}

// Pierre bat Ciseaux, Ciseaux bat Feuille, Feuille bat Pierre.
export const bat = (a, b) => (a + 1) % 3 === b;
// Le signe qui bat m.
export const contre = m => (m + 2) % 3;
export const signeAuHasard = (rng = Math.random) => Math.floor(rng() * 3);

export function nouveauMatch({ pointsParSet = 11, setsGagnants = 2, jeuxParSet = 1 } = {}) {
  if (!POINTS_PAR_SET.includes(pointsParSet)) throw new Error(`Jeux de ${pointsParSet} points non autorisés`);
  if (!SETS_GAGNANTS.includes(setsGagnants)) throw new Error(`${setsGagnants} sets gagnants non autorisés`);
  if (!JEUX_PAR_SET.includes(jeuxParSet)) throw new Error(`${jeuxParSet} jeux par set non autorisés`);
  return {
    format: { pointsParSet, setsGagnants, jeuxParSet },
    points: [0, 0],        // score du jeu en cours
    jeux: [0, 0],          // jeux gagnés dans le set en cours
    sets: [0, 0],          // sets gagnés
    scoresJeux: [],        // scores (en points) de tous les jeux terminés
    scoresSets: [],        // scores des sets terminés : en points s'il n'y a qu'un jeu par set, ex. [[11, 8], [9, 11]] ;
                           // sinon en jeux, ex. [[3, 1], [2, 3]]
    coups: [],             // { a, b, gagnant: 0|1|null, auto: [bool, bool] }
    debutsSet: [0],        // index du premier coup de chaque set
    debutsJeu: [0],        // index du premier coup de chaque jeu
    termine: false,
    vainqueur: null,
  };
}

// 0 si a gagne, 1 si b gagne, null en cas d'égalité.
export function gagnantCoup(a, b) {
  if (a === b) return null;
  return bat(a, b) ? 0 : 1;
}

// Un jeu (le set, s'il n'y a qu'un jeu par set) est gagné à pointsParSet points, avec 2 points d'écart.
export function vainqueurSet(pa, pb, pointsParSet) {
  if (Math.max(pa, pb) < pointsParSet || Math.abs(pa - pb) < 2) return null;
  return pa > pb ? 0 : 1;
}

// Qui a une balle de jeu, de set ou de match en ce moment ? null si personne.
export function balle(match) {
  if (match.termine) return null;
  const { pointsParSet: len, setsGagnants, jeuxParSet = 1 } = match.format;
  for (const j of [0, 1]) {
    const a = match.points[j], b = match.points[1 - j];
    if (a >= len - 1 && a - b >= 1) {
      if ((match.jeux?.[j] ?? 0) < jeuxParSet - 1) return { joueur: j, type: "jeu" };
      return { joueur: j, type: match.sets[j] === setsGagnants - 1 ? "match" : "set" };
    }
  }
  return null;
}

// Égalité en fin de set (10 partout, 11 partout…) : il faut 2 points d'écart.
export const egaliteFinDeSet = match =>
  !match.termine && match.points[0] === match.points[1] && match.points[0] >= match.format.pointsParSet - 1;

export const numeroSetEnCours = match => match.scoresSets.length + 1;
// Dernier jeu d'un set en plusieurs jeux (2 jeux partout avec des sets en 3 jeux).
export const jeuDecisif = match => {
  const n = match.format.jeuxParSet || 1;
  return n > 1 && match.jeux[0] === n - 1 && match.jeux[1] === n - 1;
};
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
  // finJeu est vrai à chaque jeu gagné, y compris celui qui termine le set.
  const evt = { a, b, gagnant, egalite: gagnant === null, balleAvant, finJeu: false, finSet: false, finMatch: false, scoreJeu: null, scoreSet: null };

  if (gagnant !== null) {
    match.points[gagnant]++;
    const v = vainqueurSet(match.points[0], match.points[1], match.format.pointsParSet);
    if (v !== null) {
      evt.finJeu = true;
      evt.scoreJeu = [...match.points];
      match.scoresJeux.push([...match.points]);
      match.points = [0, 0];
      match.jeux[v]++;
      if (match.jeux[v] === match.format.jeuxParSet) {
        evt.finSet = true;
        evt.scoreSet = match.format.jeuxParSet === 1 ? evt.scoreJeu : [...match.jeux];
        match.scoresSets.push([...evt.scoreSet]);
        match.sets[v]++;
        match.jeux = [0, 0];
        if (match.sets[v] === match.format.setsGagnants) {
          match.termine = true;
          match.vainqueur = v;
          evt.finMatch = true;
        } else {
          match.debutsSet.push(match.coups.length);
        }
      }
      if (!match.termine) match.debutsJeu.push(match.coups.length);
    }
  }
  evt.balleApres = balle(match);
  return evt;
}
