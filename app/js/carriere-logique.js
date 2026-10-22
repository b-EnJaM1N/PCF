// La carrière : 5 circuits de 12 joueurs (toi et 59 bots), de l'Amateur à l'Élite. Décisions du porteur du projet (22 octobre) :
// - la saison : chacun rencontre une fois les 11 autres (11 journées), 2 points par victoire ;
// - places 1 à 8 : les playoffs, à élimination directe. Le vainqueur monte ; le finaliste joue un barrage contre
//   un joueur du circuit du dessus qui joue son maintien ;
// - places 9 à 12 (pas en Amateur) : les playoffs du maintien, à 4. Les vainqueurs des demi-finales sont maintenus ;
//   les deux perdants se rencontrent : le perdant descend, le gagnant joue un barrage contre le finaliste du circuit du dessous.
// Les matchs entre bots sont simulés selon leur niveau. Ici, seulement les règles (testées automatiquement) ; l'écran est dans app.js.
import { TOUS_LES_BOTS, botParId } from "./bots.js";

export const CIRCUITS = ["Circuit Amateur", "Circuit Régional", "Circuit National", "Circuit Pro", "Circuit Élite"];
export const TAILLE = 12, QUALIFIES = 8;
export const JOURNEES = TAILLE - 1;
export const FORMAT_SAISON = { pointsParSet: 11, setsGagnants: 1 };
export const FORMAT_FINALES = { pointsParSet: 11, setsGagnants: 2 };   // playoffs, maintien et barrages
const DERNIER = CIRCUITS.length - 1;

const niveau = id => (id === "moi" ? 0 : botParId(id)?.elo ?? 1000);
// Les chances de a contre b, d'après leurs niveaux (400 points d'écart : environ 10 contre 1).
export const chances = (a, b) => 1 / (1 + 10 ** ((niveau(b) - niveau(a)) / 400));

// Un match entre deux bots : { a, b, v (le vainqueur), scores: [[pa, pb]…] }.
export function simuler(a, b, setsGagnants = 1, rng = Math.random) {
  const p = chances(a, b), sets = [0, 0], scores = [];
  while (Math.max(...sets) < setsGagnants) {
    const g = rng() < p ? 0 : 1, perdant = 2 + Math.floor(rng() * 8);
    scores.push(g === 0 ? [11, perdant] : [perdant, 11]); sets[g]++;
  }
  return { a, b, v: sets[0] > sets[1] ? a : b, scores };
}
const perdantDe = m => (m.v === m.a ? m.b : m.a);
const scoreTexte = (m, setsGagnants) => {
  if (setsGagnants === 1) return m.scores[0].join("–");
  const s = [0, 0]; m.scores.forEach(([x, y]) => s[x > y ? 0 : 1]++); return s.join("–");
};

// Au départ : les 59 bots rangés par niveau, répartis du plus faible (Amateur, avec toi) au plus fort (Élite).
// Il y a 64 bots : on en prend 59, pris à intervalles réguliers, pour garder les plus faibles et les plus forts.
export function compositionDeDepart() {
  const tries = [...TOUS_LES_BOTS].sort((a, b) => a.elo - b.elo || a.id.localeCompare(b.id));
  const n = CIRCUITS.length * TAILLE - 1;
  const choisis = Array.from({ length: n }, (_, i) => tries[Math.round(i * (tries.length - 1) / (n - 1))].id);
  const circuits = [["moi", ...choisis.slice(0, TAILLE - 1)]];
  for (let k = 1; k < CIRCUITS.length; k++) circuits.push(choisis.slice(TAILLE - 1 + (k - 1) * TAILLE, TAILLE - 1 + k * TAILLE));
  return circuits;
}

// Le calendrier (méthode du cercle) : toi en place fixe, les autres du plus fort au plus faible ;
// tes adversaires viennent ainsi du plus faible au plus fort au fil des journées.
export function calendrier(ids) {
  const t = ["moi", ...ids.filter(x => x !== "moi").sort((a, b) => niveau(b) - niveau(a))], n = t.length, J = [];
  for (let r = 0; r < n - 1; r++) {
    J.push(Array.from({ length: n / 2 }, (_, i) => [t[i], t[n - 1 - i]]));
    t.splice(1, 0, t.pop());
  }
  return J;
}

// Le classement : 2 points par victoire ; à égalité, la différence de points, puis les points marqués.
export function classementDe(ids, resultats) {
  const L = Object.fromEntries(ids.map(id => [id, { id, j: 0, v: 0, d: 0, pm: 0, pc: 0, pts: 0 }]));
  for (const m of resultats) {
    const pa = m.scores.reduce((s, x) => s + x[0], 0), pb = m.scores.reduce((s, x) => s + x[1], 0);
    for (const [id, pour, contre] of [[m.a, pa, pb], [m.b, pb, pa]]) {
      const l = L[id]; if (!l) continue;
      l.j++; l.pm += pour; l.pc += contre;
      if (m.v === id) { l.v++; l.pts += 2; } else l.d++;
    }
  }
  return Object.values(L).sort((x, y) => y.pts - x.pts || (y.pm - y.pc) - (x.pm - x.pc) || y.pm - x.pm || niveau(y.id) - niveau(x.id) || x.id.localeCompare(y.id));
}

// Les tableaux : les playoffs à 8 (1 contre 8, 4 contre 5, 3 contre 6, 2 contre 7) et le maintien à 4 (9 contre 12, 10 contre 11 ;
// puis les deux perdants).
const premierTourPlayoffs = s => [[s[0], s[7]], [s[3], s[4]], [s[2], s[5]], [s[1], s[6]]].map(([a, b]) => ({ a, b, v: null, score: "" }));
const premierTourMaintien = s => [[s[0], s[3]], [s[1], s[2]]].map(([a, b]) => ({ a, b, v: null, score: "" }));
export const NOMS_TOURS = {
  playoffs: [{ cle: "quarts", nom: "Quarts de finale" , singulier: "Quart de finale des playoffs" }, { cle: "demis", nom: "Demi-finales", singulier: "Demi-finale des playoffs" }, { cle: "finale", nom: "Finale", singulier: "Finale des playoffs" }],
  maintien: [{ cle: "demis", nom: "Demi-finales du maintien", singulier: "Demi-finale du maintien" }, { cle: "finale", nom: "Match pour le maintien", singulier: "Match pour le maintien" }],
};
// Le tour suivant d'un tableau, une fois le tour en cours joué.
function tourSuivant(type, tour) {
  if (type === "maintien") return [{ a: perdantDe(tour[0]), b: perdantDe(tour[1]), v: null, score: "" }];
  const R = [];
  for (let i = 0; i < tour.length; i += 2) R.push({ a: tour[i].v, b: tour[i + 1].v, v: null, score: "" });
  return R;
}
const nbTours = type => NOMS_TOURS[type].length;
// Joue (par simulation) les matchs pas encore joués du tour en cours.
function simulerTour(tab, rng) {
  for (const m of tab.tours[tab.tour]) if (!m.v) { const r = simuler(m.a, m.b, 2, rng); m.v = r.v; m.score = scoreTexte(r, 2); }
}
// Va au bout d'un tableau par simulation (le joueur n'y est plus, ou n'y a jamais été).
function finirTableau(tab, rng) {
  for (;;) {
    simulerTour(tab, rng);
    if (tab.tour === nbTours(tab.type) - 1) return tab;
    tab.tours.push(tourSuivant(tab.type, tab.tours[tab.tour])); tab.tour++;
  }
}
const nouveauTableau = (type, seeds) => ({ type, tour: 0, tours: [type === "playoffs" ? premierTourPlayoffs(seeds) : premierTourMaintien(seeds)] });
// Ce qui sort des tableaux : le champion et le finaliste ; le relégué et le barragiste (le gagnant du match pour le maintien).
function issueDe(tab) {
  const f = tab.tours[nbTours(tab.type) - 1]?.[0];
  if (!f?.v) return {};
  return tab.type === "playoffs" ? { champion: f.v, finaliste: perdantDe(f) } : { barragiste: f.v, relegue: perdantDe(f) };
}

// Un circuit entièrement joué par des bots : sa saison, ses playoffs et son maintien.
export function simulerCircuit(ids, k, rng = Math.random) {
  const resultats = [];
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) resultats.push(simuler(ids[i], ids[j], 1, rng));
  const cl = classementDe(ids, resultats).map(l => l.id);
  const issue = issueDe(finirTableau(nouveauTableau("playoffs", cl.slice(0, QUALIFIES)), rng));
  if (k > 0) Object.assign(issue, issueDe(finirTableau(nouveauTableau("maintien", cl.slice(QUALIFIES)), rng)));
  return issue;
}

// ---------------------------------------------------------------- la carrière du joueur
export function nouvelleCarriere(rng = Math.random) {
  return demarrerSaison({ version: 1, saison: 0, circuits: compositionDeDepart(), palmares: [] }, rng);
}
export const circuitDuJoueur = C => C.circuits.findIndex(c => c.includes("moi"));

export function demarrerSaison(C, rng = Math.random) {
  C.saison++;
  const k = circuitDuJoueur(C);
  C.ou = k; C.phase = "saison"; C.journees = calendrier(C.circuits[k]); C.journee = 0; C.resultats = [];
  C.tableau = null; C.autreTableau = null; C.barrage = null; C.bilan = null; C.place = null; C.sortie = null;
  // Les autres circuits se jouent pendant ce temps (on en connaît l'issue d'avance, on la révèle à la fin).
  C.issues = {};
  C.circuits.forEach((ids, j) => { if (j !== k) C.issues[j] = simulerCircuit(ids, j, rng); });
  return C;
}

export const classement = C => classementDe(C.circuits[C.ou], C.resultats);

// Le prochain match du joueur : { adv, format, etape, cle } (cle : "quarts", "demis", "finale" ou null), ou null.
export function prochainMatch(C) {
  if (!C) return null;
  if (C.phase === "saison") {
    const m = C.journees[C.journee].find(p => p.includes("moi"));
    return { adv: m[0] === "moi" ? m[1] : m[0], format: FORMAT_SAISON, etape: `Journée ${C.journee + 1} sur ${JOURNEES}`, cle: null };
  }
  if (C.phase === "playoffs" || C.phase === "maintien") {
    const m = C.tableau.tours[C.tableau.tour].find(x => (x.a === "moi" || x.b === "moi") && !x.v);
    if (!m) return null;
    const t = NOMS_TOURS[C.tableau.type][C.tableau.tour];
    return { adv: m.a === "moi" ? m.b : m.a, format: FORMAT_FINALES, etape: t.singulier, cle: t.cle };
  }
  if (C.phase === "barrage") return { adv: C.barrage.adv, format: FORMAT_FINALES, etape: C.barrage.haut ? "Barrage d'accession" : "Barrage du maintien", cle: "finale" };
  return null;
}

// Le résultat de mon match. scores : les sets, de mon point de vue ([[moi, lui]…]).
export function enregistrerMonMatch(C, gagne, scores, rng = Math.random) {
  const pm = prochainMatch(C); if (!pm) return C;
  const v = gagne ? "moi" : pm.adv;
  if (C.phase === "saison") {
    C.resultats.push({ a: "moi", b: pm.adv, v, scores });
    for (const [a, b] of C.journees[C.journee]) if (a !== "moi" && b !== "moi") C.resultats.push(simuler(a, b, 1, rng));
    C.journee++;
    if (C.journee === JOURNEES) finDeSaisonReguliere(C, rng);
    return C;
  }
  if (C.phase === "barrage") {
    C.barrage.v = v;
    return terminer(C, C.barrage.haut ? (gagne ? 1 : 0) : (gagne ? 0 : -1));
  }
  // playoffs ou maintien
  const tab = C.tableau, m = tab.tours[tab.tour].find(x => (x.a === "moi" || x.b === "moi") && !x.v);
  const s = [0, 0]; scores.forEach(([x, y]) => s[x > y ? 0 : 1]++);
  m.v = v; m.score = m.a === "moi" ? s.join("–") : [s[1], s[0]].join("–");
  simulerTour(tab, rng);
  const dernier = tab.tour === nbTours(tab.type) - 1;
  if (tab.type === "playoffs") {
    if (!gagne || dernier) {
      C.sortie = tab.tour;   // le tour où s'arrête mon parcours
      finirTableau(tab, rng); Object.assign(C.issues[C.ou], issueDe(tab));
      if (gagne) return terminer(C, C.ou < DERNIER ? 1 : 0, C.ou === DERNIER ? "champion" : null);
      if (dernier && C.ou < DERNIER) return versBarrage(C, C.issues[C.ou + 1].barragiste, true);
      return terminer(C, 0);
    }
  } else {
    if (tab.tour === 0 && gagne) { finirTableau(tab, rng); Object.assign(C.issues[C.ou], issueDe(tab)); return terminer(C, 0); }
    if (dernier) {
      Object.assign(C.issues[C.ou], issueDe(tab));
      return gagne ? versBarrage(C, C.issues[C.ou - 1].finaliste, false) : terminer(C, -1);
    }
  }
  tab.tours.push(tourSuivant(tab.type, tab.tours[tab.tour])); tab.tour++;
  return C;
}

// Fin des 11 journées : les playoffs (places 1 à 8), le maintien (9 à 12), ou rien (9 à 12 en Amateur).
function finDeSaisonReguliere(C, rng) {
  const cl = classement(C).map(l => l.id), k = C.ou;
  C.place = cl.indexOf("moi") + 1;
  const haut = nouveauTableau("playoffs", cl.slice(0, QUALIFIES)), bas = k > 0 ? nouveauTableau("maintien", cl.slice(QUALIFIES)) : null;
  C.issues[k] = {};
  if (C.place <= QUALIFIES) {
    C.phase = "playoffs"; C.tableau = haut;
    if (bas) { C.autreTableau = finirTableau(bas, rng); Object.assign(C.issues[k], issueDe(bas)); }
  } else {
    C.autreTableau = finirTableau(haut, rng); Object.assign(C.issues[k], issueDe(haut));
    if (bas) { C.phase = "maintien"; C.tableau = bas; } else terminer(C, 0);
  }
}
function versBarrage(C, adv, haut) {
  C.phase = "barrage"; C.barrage = { adv, haut, v: null };
  return C;
}
// La saison du joueur est jouée : ce qui l'attend (mouvement : 1 monte, 0 reste, -1 descend).
function terminer(C, mouvement, titre = null) {
  C.phase = "fin"; C.bilan = { mouvement, titre };
  return C;
}

// Le parcours de la saison, en une phrase (pour l'écran de fin de saison et le palmarès).
export function texteBilan(C) {
  if (!C.bilan) return "";
  const k = C.ou, { mouvement, titre } = C.bilan, b = C.barrage, t = C.tableau;
  if (titre === "champion") return `🏆 Champion du ${CIRCUITS[k]} !`;
  if (mouvement === 1) return b ? `⬆️ Barrage gagné : promu en ${CIRCUITS[k + 1]} !` : `🏆 Vainqueur des playoffs : promu en ${CIRCUITS[k + 1]} !`;
  if (mouvement === -1) return b ? `⬇️ Barrage perdu : relégué en ${CIRCUITS[k - 1]}.` : `⬇️ Relégué en ${CIRCUITS[k - 1]}.`;
  if (b?.haut) return `Barrage perdu : tu restes en ${CIRCUITS[k]}.`;
  if (b) return `✅ Barrage gagné : maintenu en ${CIRCUITS[k]} !`;
  if (!t) return `${C.place}e de la saison, pas de playoffs : tu restes en ${CIRCUITS[k]}.`;
  if (t.type === "maintien") return `✅ Maintenu en ${CIRCUITS[k]} !`;
  if (C.sortie === nbTours("playoffs") - 1) return `🥈 Finaliste des playoffs du ${CIRCUITS[k]}.`;
  return `Éliminé en ${NOMS_TOURS.playoffs[C.sortie].nom.toLowerCase().replace(/s de finale$/, " de finale").replace(/^demi-finales$/, "demi-finale")} des playoffs : tu restes en ${CIRCUITS[k]}.`;
}

// La saison suivante : les montées et descentes entre chaque paire de circuits, puis une nouvelle saison.
// Entre k et k+1 : le champion de k monte, le relégué de k+1 descend ; le finaliste de k et le barragiste de k+1 jouent
// le barrage (le joueur l'a joué s'il y était ; sinon, simulé).
export function saisonSuivante(C, rng = Math.random) {
  if (C.phase !== "fin") return C;
  C.palmares.push({ saison: C.saison, circuit: C.ou, place: C.place, texte: texteBilan(C), mouvement: C.bilan.mouvement, titre: C.bilan.titre });
  const N = C.circuits.map(c => [...c]);
  const deplacer = (id, de, vers) => { N[de].splice(N[de].indexOf(id), 1); N[vers].push(id); };
  for (let k = 0; k < DERNIER; k++) {
    const bas = C.issues[k], haut = C.issues[k + 1];
    deplacer(bas.champion, k, k + 1);
    deplacer(haut.relegue, k + 1, k);
    const f = bas.finaliste, g = haut.barragiste;
    const v = C.barrage && [f, g].includes("moi") ? C.barrage.v : simuler(f, g, 2, rng).v;
    if (v === f) { deplacer(f, k, k + 1); deplacer(g, k + 1, k); }
  }
  C.circuits = N;
  return demarrerSaison(C, rng);
}

// Le meilleur circuit atteint et le nombre de titres de champion de l'Élite.
export function bilanCarriere(C) {
  const atteints = [C.ou, ...C.palmares.map(p => p.circuit + (p.mouvement || 0))];
  return { meilleur: Math.max(...atteints), titres: C.palmares.filter(p => p.titre === "champion").length };
}
