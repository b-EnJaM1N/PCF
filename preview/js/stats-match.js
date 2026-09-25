// Statistiques « mental » et records d'un match, du point de vue du joueur (côté 0).

export function nouvellesStats() {
  return {
    ballesObtenues: 0, ballesConverties: 0,   // balles de set et de match
    ballesSubies: 0, ballesSauvees: 0, ballesDeMatchSauvees: 0,
    serie: { joueur: null, n: 0 }, meilleureSerie: 0,
    retardMaxSet: 0, meilleureRemontee: 0,
    premierSetPerdu: false,
  };
}

export function suivreCoup(st, match, evt) {
  if (evt.egalite) return st;
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
