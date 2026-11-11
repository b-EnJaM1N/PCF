// Le fil d'actualité du cercle (11 novembre, idée et choix du porteur du projet ; supabase/etape-65-fil-du-cercle.sql).
// Pas de chat (modération) : les résultats des duels entre membres, les Unes publiées, des réactions, les nouveaux membres, le
// champion du cercle et les séries de victoires. Rien n'y est écrit librement.
// Ici, seulement la logique (testée) : l'affichage est dans ecran-cercles.js, la Une redessinée dans app.js.
import { ouvert } from "./nouveautes.js";
import { nouveauMatch, jouerCoup } from "./regles.js";
import { nouvellesStats, suivreCoup } from "./stats-match.js";

export const filVisible = loc => ouvert("fil", loc);

export const REACTIONS = [["bravo", "👏"], ["feu", "🔥"], ["rire", "😂"], ["choc", "😱"]];
export const PALIERS_SERIE = [3, 5, 10];   // les séries de victoires d'affilée dans le cercle qui apparaissent dans le fil
export const MAX_FIL = 30;

// « il y a 2 h », « hier », « il y a 3 jours »…
export function ilYA(quand, maintenant = Date.now()) {
  const s = Math.max(0, (maintenant - Date.parse(quand)) / 1000);
  if (s < 90) return "à l'instant";
  if (s < 3600) return `il y a ${Math.round(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.round(s / 3600)} h`;
  const j = Math.floor(s / 86400);
  return j === 1 ? "hier" : `il y a ${j} jours`;
}

// Les événements du fil, du plus récent au plus ancien.
// fil : ce que renvoie fil_cercle ({ duels, arrivees }) ; champion : { id, quand } (dernier championnat du cercle terminé) ou null ;
// membres : les ids des membres actuels (Set).
// → [{ type: "duel", quand, duel } | { type: "arrivee", quand, joueur } | { type: "champion", quand, joueur }
//    | { type: "serie", quand, joueur, n }]
export function evenementsDuFil(fil, { champion = null, membres = null } = {}) {
  const liste = [];
  const duels = [...(fil?.duels || [])].sort((a, b) => Date.parse(a.quand) - Date.parse(b.quand));
  // Les séries : victoires d'affilée dans les duels du cercle (dans la période du fil), annoncées à 3, 5 et 10.
  const serie = new Map();
  for (const d of duels) {
    liste.push({ type: "duel", quand: d.quand, duel: d });
    const g = d.vainqueur === 0 ? d.j0 : d.j1, p = d.vainqueur === 0 ? d.j1 : d.j0;
    const n = (serie.get(g) || 0) + 1;
    serie.set(g, n); serie.set(p, 0);
    if (PALIERS_SERIE.includes(n)) liste.push({ type: "serie", quand: d.quand, joueur: g, n, apres: d.id });
  }
  for (const a of fil?.arrivees || []) liste.push({ type: "arrivee", quand: a.quand, joueur: a.joueur });
  if (champion?.id && champion.quand) liste.push({ type: "champion", quand: champion.quand, joueur: champion.id });
  const garder = e => !membres || e.type === "duel" || membres.has(e.joueur);
  // (à la même heure, la série juste au-dessus du duel qui l'a faite)
  const rang = e => (e.type === "serie" ? 1 : 0);
  return liste.filter(garder).sort((a, b) => Date.parse(b.quand) - Date.parse(a.quand) || rang(b) - rang(a)).slice(0, MAX_FIL);
}

// La ligne d'un résultat : « 7–5, 7–4 » (ou le score d'un set unique).
export const scoreDuDuel = d => (d.scores_sets || []).map(([a, b]) => (d.vainqueur === 0 ? `${a}–${b}` : `${b}–${a}`)).join(", ");

// Le match d'un duel, refait coup par coup du côté du joueur « par » (0 ou 1), avec ses statistiques : de quoi redessiner sa Une.
// coups du serveur : { a : signe du joueur 0, b : signe du joueur 1, g : 0 ou 1 (qui gagne le point) ou null }.
export function matchDuDuel(duel, par) {
  const m = nouveauMatch({ pointsParSet: duel.points_par_set, setsGagnants: duel.sets_gagnants }), stats = nouvellesStats();
  for (const c of duel.une?.coups || []) {
    if (m.termine) break;
    const [a, b] = par === 0 ? [c.a, c.b] : [c.b, c.a];
    suivreCoup(stats, m, jouerCoup(m, a, b));
  }
  // Le score officiel du serveur (avec les éventuels points de pénalité pour le temps), vu du côté « par ».
  const cote = x => (par === 0 ? x : [x[1], x[0]]);
  m.scoresSets = (duel.scores_sets || []).map(cote); m.sets = cote(duel.sets || [0, 0]);
  m.vainqueur = duel.vainqueur === par ? 0 : 1; m.termine = true;
  return { m, stats };
}

// Un hasard qui se rejoue à l'identique (pour le titre de la Une) : le même nombre donne le même titre sur tous les téléphones.
export function hasardFixe(graine) {
  let x = (Number(graine) || 0) * 2654435761 % 4294967296 || 1;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
}

// Le nom de l'étape sur la Une d'un duel du fil.
export const etapeDuDuel = d => (d.tournoi ? "Tournoi en ligne" : d.classe === false ? "Duel amical" : "Duel officiel");
