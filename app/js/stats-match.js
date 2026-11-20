import { lectureReussie, lectureRatee, Suivi, indiceImprevisibilite } from "./analyse.js";
// Statistiques « mental » et records d'un match, du point de vue du joueur (côté 0).

export function nouvellesStats() {
  return {
    ballesObtenues: 0, ballesConverties: 0,   // balles de set et de match
    ballesSubies: 0, ballesSauvees: 0, ballesDeMatchSauvees: 0,
    serie: { joueur: null, n: 0 }, meilleureSerie: 0,
    retardMaxSet: 0, meilleureRemontee: 0,
    premierSetPerdu: false,
    lecturesReussies: 0,                      // réflexes de l'adversaire lus et contrés
    lecturesRatees: 0,                        // (20 novembre, pour le flair de la carte) la même lecture tentée, mais il a changé
    smashsTentes: 0, smashsReussis: 0,        // mes smashs, et ceux qui ont gagné le point
  };
}

export function suivreCoup(st, match, evt) {
  if (evt.egalite) return st;
  if (lectureReussie(match.coups)) st.lecturesReussies++;
  if (lectureRatee(match.coups)) st.lecturesRatees++;
  const g = evt.gagnant, ba = evt.balleAvant;
  st.serie = st.serie.joueur === g ? { joueur: g, n: st.serie.n + 1 } : { joueur: g, n: 1 };
  if (ba) {
    if (ba.joueur === 0) { st.ballesObtenues++; if (g === 0) st.ballesConverties++; }
    else { st.ballesSubies++; if (g === 0) { st.ballesSauvees++; if (ba.type === "match") st.ballesDeMatchSauvees++; } }
  }
  if (g === 0) st.meilleureSerie = Math.max(st.meilleureSerie, st.serie.n);
  const pts = evt.finSet ? evt.scoreSet : match.points;
  st.retardMaxSet = Math.min(st.retardMaxSet, pts[0] - pts[1]);
  if (evt.finSet) {
    if (g === 0) st.meilleureRemontee = Math.max(st.meilleureRemontee, -st.retardMaxSet);
    st.retardMaxSet = 0;
    if (match.scoresSets.length === 1 && g === 1) st.premierSetPerdu = true;
  }
  return st;
}

// Le panneau des statistiques de fin de match (19 novembre, idée du porteur du projet : comme au tennis à la télé), pour les deux
// joueurs [moi, l'adversaire], d'après les coups du match (a : mon signe, b : le sien ; gagnant : 0, 1 ou null ; smash : [moi, lui]).
// Renvoie { points, signes ([Pierre, Ciseaux, Feuille] pour chacun), coups, egalites, changeApresEgalite et memeApresGain
// ([fait, occasions] pour chacun), smashs ([réussis, tentés]), serie (la plus longue suite de points gagnés), reussite ([points
// gagnés, coups décisifs] : sans les égalités), apresEgalite (points gagnés juste après une égalité), imprevisibilite (0 à 100,
// comme sur la fiche : la part de ses coups qu'un lecteur n'a pas devinés ; null s'il y a trop peu de coups) }.
export function statsDuMatch(coups = []) {
  const r = { points: [0, 0], signes: [[0, 0, 0], [0, 0, 0]], coups: coups.length, egalites: 0,
    changeApresEgalite: [[0, 0], [0, 0]], memeApresGain: [[0, 0], [0, 0]], smashs: [[0, 0], [0, 0]], serie: [0, 0],
    reussite: [[0, 0], [0, 0]], apresEgalite: [0, 0], imprevisibilite: [null, null],
    // (19 novembre, pour le commentaire des statistiques) changement de signe d'un coup à l'autre [fait, occasions], le même signe
    // le plus longtemps d'affilée { n, signe }, changement après un point perdu [fait, occasions], les gagnants des premiers points
    changeSigne: [[0, 0], [0, 0]], repetition: [{ n: 0, signe: null }, { n: 0, signe: null }], changeApresPerte: [[0, 0], [0, 0]], premiersPoints: [],
    coupsContre: [[0, 0], [0, 0], [0, 0]] };   // (pour chaque signe de l'adversaire : [mes points gagnés, ses coups avec ce signe])
  const rep = [{ n: 0, signe: null }, { n: 0, signe: null }];
  let suite = { j: null, n: 0 };
  const suivis = [new Suivi(), new Suivi()];
  coups.forEach((c, i) => {
    const s = [c.a, c.b], prec = coups[i - 1];
    [0, 1].forEach(j => {
      if (s[j] >= 0 && s[j] <= 2) r.signes[j][s[j]]++;
      if (c.smash?.[j]) { r.smashs[j][1]++; if (c.gagnant === j) r.smashs[j][0]++; }
      rep[j] = rep[j].signe === s[j] ? { n: rep[j].n + 1, signe: s[j] } : { n: 1, signe: s[j] };
      if (rep[j].n > r.repetition[j].n) r.repetition[j] = { ...rep[j] };
      if (prec) {
        const p = [prec.a, prec.b];
        r.changeSigne[j][1]++; if (s[j] !== p[j]) r.changeSigne[j][0]++;
        if (prec.gagnant === 1 - j) { r.changeApresPerte[j][1]++; if (s[j] !== p[j]) r.changeApresPerte[j][0]++; }
        if (prec.gagnant === null || prec.gagnant === undefined) { r.changeApresEgalite[j][1]++; if (s[j] !== p[j]) r.changeApresEgalite[j][0]++; }
        else if (prec.gagnant === j) { r.memeApresGain[j][1]++; if (s[j] === p[j]) r.memeApresGain[j][0]++; }
      }
    });
    if (c.b >= 0 && c.b <= 2) { r.coupsContre[c.b][1]++; if (c.gagnant === 0) r.coupsContre[c.b][0]++; }
    [0, 1].forEach(j => { suivis[j].figer(); suivis[j].enregistrer(s[j], c.gagnant === null || c.gagnant === undefined ? "e" : c.gagnant === j ? "g" : "p"); });
    if (c.gagnant === 0 || c.gagnant === 1) {
      r.points[c.gagnant]++;
      r.reussite[0][1]++; r.reussite[1][1]++; r.reussite[c.gagnant][0]++;
      if (r.premiersPoints.length < 3) r.premiersPoints.push(c.gagnant);
      if (prec && (prec.gagnant === null || prec.gagnant === undefined)) r.apresEgalite[c.gagnant]++;
      suite = suite.j === c.gagnant ? { j: c.gagnant, n: suite.n + 1 } : { j: c.gagnant, n: 1 };
      r.serie[c.gagnant] = Math.max(r.serie[c.gagnant], suite.n);
    } else r.egalites++;
  });
  r.imprevisibilite = suivis.map(x => (x.lisibles >= 6 ? indiceImprevisibilite(x.devines / x.lisibles) : null));
  return r;
}
