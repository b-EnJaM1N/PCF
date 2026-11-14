// Le classement interne d'un cercle (14 novembre, choix A du porteur du projet) : le « niveau du cercle », calculé seulement
// sur les duels entre membres (amicaux, officiels et matchs de tournoi), depuis la création du cercle.
// Tout le monde part de 1000 points ; à chaque duel, le gagnant prend des points au perdant, d'autant plus que le perdant
// était mieux classé que lui (le même principe que le niveau officiel, système Elo). Battre le premier rapporte beaucoup,
// battre le dernier presque rien : on ne peut pas grimper en choisissant ses adversaires.
// duels : ceux des records du cercle (records_cercle : { j0, j1, vainqueur, quand }, du plus ancien au plus récent).

export const DEPART_CERCLE = 1000;
export const K_CERCLE = 32;

// Le gain du vainqueur (et la perte du perdant) quand a (pa points) bat b (pb points).
export const gainCercle = (pa, pb) => K_CERCLE * (1 - 1 / (1 + 10 ** ((pb - pa) / 400)));

// membres : [{ id, … }] (la page du cercle) → les membres avec { points, v, d, joues, pct, rang }, du premier au dernier.
// Ceux qui n'ont encore joué aucun duel dans le cercle viennent après, sans rang (rang : null), par niveau officiel.
export function classementCercle(membres, duels) {
  const pts = new Map((membres || []).map(m => [m.id, { points: DEPART_CERCLE, v: 0, d: 0 }]));
  const tries = [...(duels || [])].sort((x, y) => String(x.quand || "").localeCompare(String(y.quand || "")));
  for (const du of tries) {
    const a = pts.get(du.j0), b = pts.get(du.j1);
    if (!a || !b || (du.vainqueur !== du.j0 && du.vainqueur !== du.j1)) continue;   // (un ancien membre, ou pas de vainqueur)
    const [g, p] = du.vainqueur === du.j0 ? [a, b] : [b, a];
    const delta = gainCercle(g.points, p.points);
    g.points += delta; p.points -= delta; g.v++; p.d++;
  }
  const liste = (membres || []).map(m => {
    const s = pts.get(m.id), joues = s.v + s.d;
    return { ...m, points: Math.round(s.points), v: s.v, d: s.d, joues, pct: joues ? Math.round(100 * s.v / joues) : null };
  });
  const classes = liste.filter(m => m.joues).sort((x, y) => y.points - x.points || y.v - x.v || (y.classement || 0) - (x.classement || 0));
  const autres = liste.filter(m => !m.joues).sort((x, y) => (y.classement || 0) - (x.classement || 0));
  classes.forEach((m, i) => { m.rang = i + 1; });
  autres.forEach(m => { m.rang = null; });
  return [...classes, ...autres];
}

// Le podium : les 3 premiers classés (au plus).
export const podiumCercle = classement => (classement || []).filter(m => m.rang).slice(0, 3);
