// Fiche joueur : carte d'identité sportive qui se remplit toute seule au fil des matchs.
// Pour l'instant elle est gardée sur le téléphone (voir stockage.js).

export const ELO_DEPART = 1200;
export const K_ELO = 32;

export const TITRES = [
  { id: "premier", nom: "Première victoire", desc: "Gagner un match." },
  { id: "habitue", nom: "Habitué", desc: "Jouer 10 matchs." },
  { id: "sangfroid", nom: "Sang-froid", desc: "Sauver une balle de match.", debloque: "le poignet or", objet: ["poignet", "or"] },
  { id: "remontada", nom: "Remontada", desc: "Gagner après avoir perdu le premier set.", debloque: "le motif étoile", objet: ["motif", "etoile"] },
  { id: "rouleau", nom: "Rouleau compresseur", desc: "Gagner 6 points d'affilée.", debloque: "le motif éclair", objet: ["motif", "eclair"] },
  { id: "imprevisible", nom: "Imprévisible", desc: "Gagner un match en étant prévisible moins de 30 % du temps.", debloque: "le gant or", objet: ["gant", "or"] },
  { id: "invincible", nom: "Invincible", desc: "Gagner 3 matchs d'affilée.", debloque: "le fond or", objet: ["fond", "or"] },
  { id: "marathon", nom: "Marathonien", desc: "Jouer un match de 60 coups ou plus." },
  { id: "vainqueur", nom: "Vainqueur du PCF Open", desc: "Remporter un tournoi." },
];

// Titre qui débloque un élément d'avatar (ou undefined si l'élément est libre).
export const verrouDe = (type, cle) => TITRES.find(t => t.objet && t.objet[0] === type && t.objet[1] === cle);
export const estVerrouille = (P, type, cle) => { const t = verrouDe(type, cle); return !!t && !P.titres[t.id]; };

export function profilParDefaut() {
  return {
    v: 1, pseudo: "", drapeau: "🇫🇷",
    av: { symbole: "pierre", fond: "court", gant: "blanc", poignet: "rouge", motif: "uni" },
    elo: ELO_DEPART, historiqueElo: [ELO_DEPART],
    matchs: 0, victoires: 0, serieEnCours: 0, meilleureSerieVictoires: 0,
    sets: [0, 0], coups: 0, signes: [0, 0, 0], signesAdv: [0, 0, 0],
    faceAFace: {}, tournoisGagnes: 0,
    memeApresVictoire: 0, apresVictoire: 0, memeApresDefaite: 0, apresDefaite: 0,
    devines: 0, lisibles: 0,
    ballesObtenues: 0, ballesConverties: 0, ballesSubies: 0, ballesSauvees: 0,
    decisifsJoues: 0, decisifsGagnes: 0, remontadas: 0,
    meilleureSeriePoints: 0, meilleureRemontee: 0, plusLongMatch: 0,
    derniers: [], titres: {},
  };
}

// Complète une fiche lue depuis le stockage avec les champs manquants.
export function normaliserProfil(brut) {
  const d = profilParDefaut();
  if (!brut || typeof brut !== "object") return d;
  const P = { ...d, ...brut, av: { ...d.av, ...(brut.av || {}) } };
  for (const k of Object.keys(d)) if (Array.isArray(d[k]) && !Array.isArray(P[k])) P[k] = d[k];
  return P;
}

export function nouvelElo(elo, eloAdv, gagne, k = K_ELO) {
  const attendu = 1 / (1 + Math.pow(10, (eloAdv - elo) / 400));
  return Math.round(elo + k * ((gagne ? 1 : 0) - attendu));
}

export const nomAffiche = P => P.pseudo || "Toi";
export const titresObtenus = P => TITRES.filter(t => P.titres[t.id]).sort((a, b) => P.titres[b.id] - P.titres[a.id]);
export const dernierTitre = P => (titresObtenus(P)[0] || { nom: "Espoir du circuit" }).nom;
export const signeFavori = c => (c.reduce((a, b) => a + b, 0) ? c.indexOf(Math.max(...c)) : null);

// Met la fiche à jour à la fin d'un match. Renvoie les titres obtenus pendant ce match.
// r = { match, stats, devines, lisibles, adversaire: { id, elo }, finaleTournoi, date }
export function enregistrerMatch(P, r) {
  const { match, stats } = r, c = match.coups, n = c.length, gagne = match.vainqueur === 0;
  P.matchs++; if (gagne) P.victoires++;
  P.serieEnCours = gagne ? P.serieEnCours + 1 : 0;
  P.meilleureSerieVictoires = Math.max(P.meilleureSerieVictoires, P.serieEnCours);
  P.sets[0] += match.sets[0]; P.sets[1] += match.sets[1]; P.coups += n;
  c.forEach(x => { P.signes[x.a]++; P.signesAdv[x.b]++; });
  const f = (P.faceAFace[r.adversaire.id] ||= { v: 0, d: 0, signes: [0, 0, 0] });
  gagne ? f.v++ : f.d++; c.forEach(x => f.signes[x.b]++);
  const tournoi = !!(r.finaleTournoi && gagne); if (tournoi) P.tournoisGagnes++;
  for (let i = 1; i < n; i++) {
    const p = c[i - 1];
    if (p.gagnant === 0) { P.apresVictoire++; if (c[i].a === p.a) P.memeApresVictoire++; }
    else if (p.gagnant === 1) { P.apresDefaite++; if (c[i].a === p.a) P.memeApresDefaite++; }
  }
  P.devines += r.devines; P.lisibles += r.lisibles;
  P.ballesObtenues += stats.ballesObtenues; P.ballesConverties += stats.ballesConverties;
  P.ballesSubies += stats.ballesSubies; P.ballesSauvees += stats.ballesSauvees;
  if (match.scoresSets.length === 2 * match.format.setsGagnants - 1) { P.decisifsJoues++; if (gagne) P.decisifsGagnes++; }
  if (stats.premierSetPerdu && gagne) P.remontadas++;
  P.meilleureSeriePoints = Math.max(P.meilleureSeriePoints, stats.meilleureSerie);
  P.meilleureRemontee = Math.max(P.meilleureRemontee, stats.meilleureRemontee);
  P.plusLongMatch = Math.max(P.plusLongMatch, n);
  P.elo = nouvelElo(P.elo, r.adversaire.elo, gagne);
  P.historiqueElo.push(P.elo); if (P.historiqueElo.length > 60) P.historiqueElo.shift();
  P.derniers.unshift({ date: r.date ?? Date.now(), adv: r.adversaire.id, gagne, sets: `${match.sets[0]}–${match.sets[1]}`, detail: match.scoresSets.map(([a, b]) => `${a}–${b}`).join(", ") });
  P.derniers = P.derniers.slice(0, 8);

  const taux = r.lisibles ? r.devines / r.lisibles : 1;
  const conditions = {
    premier: gagne, habitue: P.matchs >= 10, sangfroid: stats.ballesDeMatchSauvees > 0,
    remontada: stats.premierSetPerdu && gagne, rouleau: stats.meilleureSerie >= 6,
    imprevisible: gagne && r.lisibles >= 10 && taux < 0.3, invincible: P.serieEnCours >= 3,
    marathon: n >= 60, vainqueur: tournoi,
  };
  const nouveaux = [];
  TITRES.forEach(t => { if (conditions[t.id] && !P.titres[t.id]) { P.titres[t.id] = r.date ?? Date.now(); nouveaux.push(t); } });
  return nouveaux;
}

// Remise à zéro : on garde le pseudo, le pays et l'avatar (sans les éléments à débloquer).
export function remettreAZero(P) {
  const N = profilParDefaut();
  N.pseudo = P.pseudo; N.drapeau = P.drapeau;
  for (const k of Object.keys(N.av)) N.av[k] = verrouDe(k, P.av[k]) ? N.av[k] : P.av[k];
  return N;
}
