// La carrière : 5 circuits de 12 joueurs (toi et 59 bots), de l'Amateur à l'Élite. Décisions du porteur du projet (22 octobre) :
// - la saison : chacun rencontre une fois les 11 autres (11 journées), 2 points par victoire ;
// - places 1 à 8 : les playoffs, à élimination directe. Le vainqueur monte ; le finaliste joue un barrage contre
//   un joueur du circuit du dessus qui joue son maintien ;
// - places 9 à 12 (pas en Amateur) : les playoffs du maintien, à 4. Les vainqueurs des demi-finales sont maintenus ;
//   les deux perdants se rencontrent : le perdant descend, le gagnant joue un barrage contre le finaliste du circuit du dessous.
// - l'Amateur, plus court (décision du 22 octobre) : 2 poules de 6 (5 journées), les 4 premiers de chaque poule en quarts
//   de finale croisés (1er A – 4e B, 2e B – 3e A, 1er B – 4e A, 2e A – 3e B), puis élimination directe ; pas de maintien ;
// - la Coupe Monique-Latour (décision du 22 octobre) : 64 joueurs toutes divisions confondues (toi et 63 bots), tirage au sort
//   intégral à chaque tour, sans avantage pour le petit poucet ; un tour toutes les deux journées, la finale avant les playoffs.
// Les matchs entre bots sont simulés selon leur niveau. Ici, seulement les règles (testées automatiquement) ; l'écran est dans app.js.
import { TOUS_LES_BOTS, botParId, choisirCoup } from "./bots.js";
import { contre } from "./regles.js";

export const CIRCUITS = ["Circuit Amateur", "Circuit Régional", "Circuit National", "Circuit Pro", "Circuit Élite"];
export const TAILLE = 12, QUALIFIES = 8;
export const JOURNEES = TAILLE - 1;
export const FORMAT_SAISON = { pointsParSet: 11, setsGagnants: 1 };
// En Amateur, la saison se joue en un set de 7 (décision du 22 octobre : contre les bots faibles, un set de 11 traînait).
export const formatSaison = k => (k === 0 ? { pointsParSet: 7, setsGagnants: 1 } : FORMAT_SAISON);

// Le renfort des bots faibles, en carrière seulement (décision du 22 octobre : « rehausser un poil » les plus faibles).
// De temps en temps, ils repèrent ton signe préféré sur tes 6 derniers coups et jouent ce qui le bat :
// 25 % des coups sous le niveau 1 000, 12 % sous 1 150, rien au-dessus. Leur jeu habituel (Rocky et sa Pierre…) reste le même.
export const renfort = bot => (bot.elo < 1000 ? 0.25 : bot.elo < 1150 ? 0.12 : 0);
export function coupCarriere(bot, hist, rng = Math.random, ctx = null) {
  if (hist.length >= 3 && rng() < renfort(bot)) {
    const c = [0, 0, 0]; hist.slice(-6).forEach(h => c[h.adv]++);
    return contre(c.indexOf(Math.max(...c)));
  }
  return choisirCoup(bot, hist, rng, ctx);
}
export const FORMAT_FINALES = { pointsParSet: 11, setsGagnants: 2 };   // playoffs, maintien et barrages
const DERNIER = CIRCUITS.length - 1;

const niveau = id => (id === "moi" ? 0 : botParId(id)?.elo ?? 1000);
// Les chances de a contre b, d'après leurs niveaux (400 points d'écart : environ 10 contre 1).
export const chances = (a, b) => 1 / (1 + 10 ** ((niveau(b) - niveau(a)) / 400));

// Un match entre deux bots : { a, b, v (le vainqueur), scores: [[pa, pb]…] }.
export function simuler(a, b, setsGagnants = 1, rng = Math.random, pts = 11) {
  const p = chances(a, b), sets = [0, 0], scores = [];
  while (Math.max(...sets) < setsGagnants) {
    const g = rng() < p ? 0 : 1, perdant = pts === 7 ? 1 + Math.floor(rng() * 5) : 2 + Math.floor(rng() * 8);
    scores.push(g === 0 ? [pts, perdant] : [perdant, pts]); sets[g]++;
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
  const autres = ids.filter(x => x !== "moi").sort((a, b) => niveau(b) - niveau(a));
  const t = ids.includes("moi") ? ["moi", ...autres] : autres, n = t.length, J = [];
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

// Les 2 poules de l'Amateur : réparties en serpentin selon le niveau (1, 4, 5, 8, 9, 12 d'un côté), toi dans la poule A.
export function poules(ids) {
  const t = [...ids].sort((a, b) => (a === "moi" ? -1 : b === "moi" ? 1 : niveau(b) - niveau(a)));
  const A = [], B = [];
  t.forEach((id, i) => ([0, 3].includes(i % 4) ? A : B).push(id));
  return [A, B];
}
// Les quarts croisés des poules (rangés pour le tableau : 1er A – 4e B et 2e B – 3e A d'un côté, 1er B – 4e A et 2e A – 3e B de l'autre).
const tetesCroisees = (a, b) => [a[0], a[1], b[0], b[1], a[2], a[3], b[2], b[3]];
// Un circuit entièrement joué par des bots : sa saison, ses playoffs et son maintien.
export function simulerCircuit(ids, k, rng = Math.random) {
  const pts = formatSaison(k).pointsParSet, rencontres = l => {
    const r = []; for (let i = 0; i < l.length; i++) for (let j = i + 1; j < l.length; j++) r.push(simuler(l[i], l[j], 1, rng, pts)); return r;
  };
  if (k === 0) {
    const [A, B] = poules(ids), a = classementDe(A, rencontres(A)).map(l => l.id), b = classementDe(B, rencontres(B)).map(l => l.id);
    return issueDe(finirTableau(nouveauTableau("playoffs", tetesCroisees(a, b)), rng));
  }
  const resultats = rencontres(ids);
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
  C.ou = k; C.phase = "saison"; C.journee = 0; C.resultats = [];
  if (k === 0) { C.poules = poules(C.circuits[0]); const [a, b] = C.poules.map(calendrier); C.journees = a.map((j, i) => [...j, ...b[i]]); }
  else { C.poules = null; C.journees = calendrier(C.circuits[k]); }
  C.tableau = null; C.autreTableau = null; C.barrage = null; C.bilan = null; C.place = null; C.sortie = null;
  // Les autres circuits se jouent pendant ce temps (on en connaît l'issue d'avance, on la révèle à la fin).
  C.issues = {};
  C.circuits.forEach((ids, j) => { if (j !== k) C.issues[j] = simulerCircuit(ids, j, rng); });
  C.coupe = nouvelleCoupe(rng);
  return C;
}

// ---------------------------------------------------------------- la Coupe Monique-Latour
export const TOURS_COUPE = [
  { nom: "32es de finale", singulier: "32e de finale", cle: null, apres: 2 },
  { nom: "16es de finale", singulier: "16e de finale", cle: null, apres: 4 },
  { nom: "8es de finale", singulier: "8e de finale", cle: null, apres: 6 },
  { nom: "Quarts de finale", singulier: "Quart de finale", cle: "quarts", apres: 8 },
  { nom: "Demi-finales", singulier: "Demi-finale", cle: "demis", apres: 10 },
  { nom: "Finale", singulier: "Finale", cle: "finale", apres: JOURNEES },   // (apres : le tour se joue une fois ce nombre de journées joué)
];
export const formatCoupe = tour => (tour >= 3 ? FORMAT_FINALES : FORMAT_SAISON);
function melanger(t, rng) { for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; } return t; }
const tirage = (ids, rng) => { const t = melanger([...ids], rng), R = []; for (let i = 0; i < t.length; i += 2) R.push({ a: t[i], b: t[i + 1], v: null, score: "" }); return R; };
// 64 joueurs : toi et 63 des 64 bots (un bot tiré au sort reste au repos).
function nouvelleCoupe(rng) {
  const bots = melanger(TOUS_LES_BOTS.map(b => b.id), rng).slice(0, 63);
  return { tour: 0, tours: [tirage(["moi", ...bots], rng)], elimine: null, vainqueur: null, finaliste: null };
}
const monMatchCoupe = K => K?.tours[K.tour]?.find(m => (m.a === "moi" || m.b === "moi") && !m.v) || null;
const journeesJouees = C => C.journee;
// Le tour de coupe se joue une fois ce nombre de journées joué (en Amateur, 5 journées : un tour après chacune, la finale avec la demie).
export const coupeApres = (C, tour) => (C?.journees?.length === 5 ? [1, 2, 3, 4, 5, 5][tour] : TOURS_COUPE[tour].apres);
// Fait avancer la coupe : les tours dus sont joués (simulés) tant que je n'y ai pas de match en attente.
function avancerCoupe(C, rng) {
  const K = C.coupe; if (!K) return;
  while (!K.vainqueur && journeesJouees(C) >= coupeApres(C, K.tour) && !monMatchCoupe(K)) {
    const sets = formatCoupe(K.tour).setsGagnants;
    for (const m of K.tours[K.tour]) if (!m.v) { const r = simuler(m.a, m.b, sets, rng); m.v = r.v; m.score = scoreTexte(r, sets); }
    if (K.tour === TOURS_COUPE.length - 1) { const f = K.tours[K.tour][0]; K.vainqueur = f.v; K.finaliste = perdantDe(f); return; }
    K.tours.push(tirage(K.tours[K.tour].map(m => m.v), rng)); K.tour++;
  }
}
// Mon match de coupe, s'il est dû (sinon null).
export function matchDeCoupe(C) {
  const K = C?.coupe; if (!K || K.vainqueur) return null;
  const m = monMatchCoupe(K);
  if (!m || journeesJouees(C) < coupeApres(C, K.tour)) return null;
  return { adv: m.a === "moi" ? m.b : m.a, format: formatCoupe(K.tour), etape: `Coupe Monique-Latour · ${TOURS_COUPE[K.tour].singulier}`, cle: TOURS_COUPE[K.tour].cle, coupe: true,
    voix: K.tour === 0 ? "premiers" : TOURS_COUPE[K.tour].cle };
}
// Mon parcours en coupe, en une phrase.
export function texteCoupe(C) {
  const K = C?.coupe; if (!K) return "";
  if (K.vainqueur === "moi") return "🏆 Vainqueur de la Coupe Monique-Latour !";
  if (K.elimine !== null) return K.elimine === TOURS_COUPE.length - 1 ? "🥈 Finaliste de la Coupe Monique-Latour." : `Éliminé en ${TOURS_COUPE[K.elimine].singulier.toLowerCase()} de la Coupe Monique-Latour.`;
  return `Qualifié pour les ${TOURS_COUPE[K.tour].nom.toLowerCase()} de la Coupe Monique-Latour.`;
}
// La saison ne peut se terminer qu'une fois la coupe jouée jusqu'au bout.
export const coupeEnCours = C => !!(C?.coupe && !C.coupe.vainqueur);

export const classement = (C, poule = 0) => classementDe(C.poules ? C.poules[poule] : C.circuits[C.ou], C.resultats);

// Le prochain match du joueur : { adv, format, etape, cle, voix }, ou null.
// cle : "quarts", "demis", "finale" ou null (l'enjeu, pour la tension des commentaires) ;
// voix : le tour de tournoi que Roland et Monique peuvent commenter avant et après le match (annonces.js, contexteJeu) :
// seulement quand leurs répliques collent (« premier tour » au 1er tour de coupe, quarts, demies et finales) ;
// null pour le championnat, le maintien et les barrages (sinon : « il gagne son premier tour » à chaque journée).
export function prochainMatch(C) {
  if (!C) return null;
  const mc = matchDeCoupe(C); if (mc) return mc;   // le match de coupe passe avant le reste
  if (C.phase === "saison") {
    const m = C.journees[C.journee].find(p => p.includes("moi"));
    return { adv: m[0] === "moi" ? m[1] : m[0], format: formatSaison(C.ou), etape: `Journée ${C.journee + 1} sur ${C.journees.length}`, cle: null, voix: null };
  }
  if (C.phase === "playoffs" || C.phase === "maintien") {
    const m = C.tableau.tours[C.tableau.tour].find(x => (x.a === "moi" || x.b === "moi") && !x.v);
    if (!m) return null;
    const t = NOMS_TOURS[C.tableau.type][C.tableau.tour];
    return { adv: m.a === "moi" ? m.b : m.a, format: FORMAT_FINALES, etape: t.singulier, cle: t.cle, voix: C.tableau.type === "playoffs" ? t.cle : null };
  }
  if (C.phase === "barrage") return { adv: C.barrage.adv, format: FORMAT_FINALES, etape: C.barrage.haut ? "Barrage d'accession" : "Barrage du maintien", cle: "finale", voix: null };
  return null;
}

// Le résultat de mon match. scores : les sets, de mon point de vue ([[moi, lui]…]).
export function enregistrerMonMatch(C, gagne, scores, rng = Math.random) {
  const pm = prochainMatch(C); if (!pm) return C;
  const v = gagne ? "moi" : pm.adv;
  if (pm.coupe) {
    const K = C.coupe, m = monMatchCoupe(K), s = [0, 0]; scores.forEach(([x, y]) => s[x > y ? 0 : 1]++);
    m.v = v; m.score = pm.format.setsGagnants === 1 ? (m.a === "moi" ? scores[0] : [scores[0][1], scores[0][0]]).join("–") : (m.a === "moi" ? s : [s[1], s[0]]).join("–");
    if (!gagne) K.elimine = K.tour;
    avancerCoupe(C, rng);
    return C;
  }
  if (C.phase === "saison") {
    C.resultats.push({ a: "moi", b: pm.adv, v, scores });
    for (const [a, b] of C.journees[C.journee]) if (a !== "moi" && b !== "moi") C.resultats.push(simuler(a, b, 1, rng, formatSaison(C.ou).pointsParSet));
    C.journee++;
    if (C.journee === C.journees.length) finDeSaisonReguliere(C, rng);
    avancerCoupe(C, rng);
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
  const k = C.ou;
  if (C.poules) {   // l'Amateur : les 4 premiers de chaque poule, en quarts croisés
    const [a, b] = C.poules.map(p => classementDe(p, C.resultats).map(l => l.id));
    C.place = a.indexOf("moi") + 1; C.issues[k] = {};
    const haut = nouveauTableau("playoffs", tetesCroisees(a, b));
    if (C.place <= 4) { C.phase = "playoffs"; C.tableau = haut; }
    else { C.autreTableau = finirTableau(haut, rng); Object.assign(C.issues[k], issueDe(haut)); terminer(C, 0); }
    return;
  }
  const cl = classement(C).map(l => l.id);
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
  if (!t) return `${C.place}e ${C.poules ? "de ta poule" : "de la saison"}, pas de playoffs : tu restes en ${CIRCUITS[k]}.`;
  if (t.type === "maintien") return `✅ Maintenu en ${CIRCUITS[k]} !`;
  if (C.sortie === nbTours("playoffs") - 1) return `🥈 Finaliste des playoffs du ${CIRCUITS[k]}.`;
  return `Éliminé en ${NOMS_TOURS.playoffs[C.sortie].nom.toLowerCase().replace(/s de finale$/, " de finale").replace(/^demi-finales$/, "demi-finale")} des playoffs : tu restes en ${CIRCUITS[k]}.`;
}

// La saison suivante : les montées et descentes entre chaque paire de circuits, puis une nouvelle saison.
// Entre k et k+1 : le champion de k monte, le relégué de k+1 descend ; le finaliste de k et le barragiste de k+1 jouent
// le barrage (le joueur l'a joué s'il y était ; sinon, simulé).
export function saisonSuivante(C, rng = Math.random) {
  if (C.phase !== "fin" || coupeEnCours(C)) return C;
  // Le palmarès de la saison : mon parcours, et pour chaque circuit son champion, son finaliste, qui monte et qui descend.
  const resume = C.circuits.map((_, k) => ({ champion: C.issues[k].champion, finaliste: C.issues[k].finaliste, montes: [], descendus: [] }));
  C.palmares.push({ saison: C.saison, circuit: C.ou, place: C.place, texte: texteBilan(C), mouvement: C.bilan.mouvement, titre: C.bilan.titre, circuits: resume,
    coupe: resume[C.ou].champion === "moi", bouclier: C.place === 1,
    coupeML: C.coupe ? { vainqueur: C.coupe.vainqueur, finaliste: C.coupe.finaliste, texte: texteCoupe(C) } : null });
  // La carrière voyage dans la fiche en ligne (taille limitée) : le détail des circuits n'est gardé que pour les 10 dernières saisons.
  C.palmares.slice(0, -10).forEach(p => delete p.circuits);
  const N = C.circuits.map(c => [...c]);
  const deplacer = (id, de, vers) => { N[de].splice(N[de].indexOf(id), 1); N[vers].push(id); resume[de][vers > de ? "montes" : "descendus"].push(id); };
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

// La vitrine : pour chaque circuit, les saisons où j'ai gagné la coupe (vainqueur des playoffs) et le bouclier
// (1er de la saison régulière). La saison en cours compte dès que c'est acquis.
export function vitrine(C) {
  const v = CIRCUITS.map(() => ({ coupes: [], boucliers: [] }));
  if (!C) return v;
  for (const p of C.palmares) { if (p.coupe) v[p.circuit].coupes.push(p.saison); if (p.bouclier) v[p.circuit].boucliers.push(p.saison); }
  if (C.issues?.[C.ou]?.champion === "moi" && C.phase === "fin") v[C.ou].coupes.push(C.saison);
  if (C.place === 1) v[C.ou].boucliers.push(C.saison);
  return v;
}

// Les saisons où j'ai gagné la Coupe Monique-Latour.
export function coupesML(C) {
  if (!C) return [];
  const l = C.palmares.filter(p => p.coupeML?.vainqueur === "moi").map(p => p.saison);
  if (C.coupe?.vainqueur === "moi") l.push(C.saison);
  return l;
}

// Les trophées de la carrière (profil.js, famille « carriere ») déjà mérités : chaque montée, la coupe, le bouclier, le titre de l'Élite.
export function titresCarriere(C) {
  if (!C) return [];
  const atteint = Math.max(C.ou + (C.phase === "fin" ? Math.max(0, C.bilan?.mouvement || 0) : 0), ...C.palmares.map(p => p.circuit + Math.max(0, p.mouvement || 0)));
  const v = vitrine(C), ids = ["promu", "national", "professionnel", "elite"].filter((_, i) => atteint > i);
  if (coupesML(C).length) ids.push("vainqueur_coupe");
  if (v.some(x => x.boucliers.length)) ids.push("leader");
  if (v[CIRCUITS.length - 1].coupes.length) ids.push("champion_elite");
  return ids;
}

// Une saison d'Amateur commencée avant les poules (11 journées) : on la relance en poules (même numéro de saison).
export function migrerCarriere(C, rng = Math.random) {
  if (C && C.ou === 0 && C.phase === "saison" && !C.poules && C.journees?.length === JOURNEES) { C.saison--; demarrerSaison(C, rng); return true; }
  return false;
}
