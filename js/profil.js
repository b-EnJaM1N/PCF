// Fiche joueur : carte d'identité sportive qui se remplit toute seule au fil des matchs.
// Pour l'instant elle est gardée sur le téléphone (voir stockage.js).
import { CRI_DEFAUT, criValide } from "./celebrations.js";
import { possede, gesteValide, celebrationValide, cadreValide } from "./catalogue.js";
import { additionner, compterMatch } from "./lecture-adversaire.js";

export const ELO_DEPART = 1200;
export const K_ELO = 32;

// Les trophées (appelés « titres » dans le code), rangés par familles. Les plus durs de chaque famille
// débloquent un élément d'avatar (objet : [type, clé] de avatar.js).
export const FAMILLES = [
  { id: "fairplay", nom: "Fair-play", icone: "🤝" },
  { id: "remontees", nom: "Remontées", icone: "🔥" },
  { id: "series", nom: "Séries", icone: "⚡" },
  { id: "endurance", nom: "Endurance et habitudes", icone: "⏱️" },
  { id: "tournois", nom: "Tournois", icone: "🏆" },
  { id: "cercles", nom: "Cercles", icone: "👥" },
  { id: "duels", nom: "Duels", icone: "⚔️" },
];
export const TITRES = [
  { id: "gentleman", famille: "fairplay", nom: "Gentleman", desc: "Serrer la main franchement ou normalement 10 fois." },
  { id: "main_tendue", famille: "fairplay", nom: "Main tendue", desc: "Serrer chaleureusement la main après 10 défaites." },
  { id: "glacon", famille: "fairplay", nom: "Glaçon", desc: "Serrer la main froidement 10 fois. Monique approuve." },
  { id: "fairplay", famille: "fairplay", nom: "Fair-play", desc: "Serrer chaleureusement la main 50 fois.", debloque: "le gant bicolore", objet: ["gantMotif", "bicolore"] },
  { id: "jusquau_bout", famille: "fairplay", nom: "Jusqu'au bout", desc: "Jouer 25 duels en ligne sans abandonner." },

  { id: "sangfroid", famille: "remontees", nom: "Sang-froid", desc: "Sauver une balle de match.", debloque: "le poignet or", objet: ["poignet", "or"] },
  { id: "remontada", famille: "remontees", nom: "Remontada", desc: "Gagner après avoir perdu le premier set.", debloque: "le motif étoile", objet: ["motif", "etoile"] },
  { id: "phenix", famille: "remontees", nom: "Phénix", desc: "Gagner un match après avoir sauvé une balle de match." },
  { id: "lazare", famille: "remontees", nom: "Lazare", desc: "Gagner un set après avoir eu 5 points de retard." },
  { id: "houdini", famille: "remontees", nom: "Houdini", desc: "Sauver 10 balles de match au total.", debloque: "le poignet argent", objet: ["poignet", "argent"] },

  { id: "premier", famille: "series", nom: "Première victoire", desc: "Gagner un match." },
  { id: "rouleau", famille: "series", nom: "Rouleau compresseur", desc: "Gagner 6 points d'affilée.", debloque: "le motif éclair", objet: ["motif", "eclair"] },
  { id: "implacable", famille: "series", nom: "Implacable", desc: "Gagner 10 points d'affilée." },
  { id: "invincible", famille: "series", nom: "Invincible", desc: "Gagner 3 matchs d'affilée.", debloque: "le fond or", objet: ["fond", "or"] },
  { id: "intouchable", famille: "series", nom: "Intouchable", desc: "Gagner 5 matchs d'affilée." },
  { id: "legende", famille: "series", nom: "Légende vivante", desc: "Gagner 10 matchs d'affilée.", debloque: "les coutures dorées", objet: ["gantMotif", "coutures"] },
  { id: "fanny", famille: "series", nom: "Fanny", desc: "Gagner un set 11–0." },

  { id: "habitue", famille: "endurance", nom: "Habitué", desc: "Jouer 10 matchs." },
  { id: "pilier", famille: "endurance", nom: "Pilier", desc: "Jouer 100 matchs.", debloque: "le gant argent", objet: ["gant", "argent"] },
  { id: "marathon", famille: "endurance", nom: "Marathonien", desc: "Jouer un match de 60 coups ou plus." },
  { id: "oiseau_de_nuit", famille: "endurance", nom: "Oiseau de nuit", desc: "Jouer 10 matchs entre 23 h et 5 h." },
  { id: "leve_tot", famille: "endurance", nom: "Lève-tôt", desc: "Jouer 10 matchs entre 5 h et 9 h." },

  { id: "vainqueur", famille: "tournois", nom: "Vainqueur du HandSlam Open", desc: "Remporter un HandSlam Open." },
  { id: "grand_chelem", famille: "tournois", nom: "Grand Chelem", desc: "Remporter 4 HandSlam Open.", debloque: "le bandeau de champion", objet: ["gantMotif", "bandeau"] },
  { id: "finaliste", famille: "tournois", nom: "Finaliste", desc: "Jouer la finale d'un tournoi en ligne." },
  { id: "roi_sng", famille: "tournois", nom: "Roi du Sit & Go", desc: "Remporter un Sit & Go." },
  { id: "champion_dimanche", famille: "tournois", nom: "Champion du dimanche", desc: "Remporter le Grand Chelem du dimanche soir." },
  { id: "organisateur", famille: "tournois", nom: "Organisateur", desc: "Organiser un tournoi de cercle joué jusqu'au bout." },

  { id: "fondateur", famille: "cercles", nom: "Fondateur", desc: "Créer un cercle." },
  { id: "rassembleur", famille: "cercles", nom: "Rassembleur", desc: "Être responsable d'un cercle de 10 membres.", debloque: "le fond minuit", objet: ["fond", "minuit"] },
  { id: "patron", famille: "cercles", nom: "Patron", desc: "Être 1er du classement d'un cercle d'au moins 5 membres." },
  { id: "derby", famille: "cercles", nom: "Derby", desc: "Jouer 10 duels contre les membres d'un de tes cercles." },

  { id: "imprevisible", famille: "duels", nom: "Imprévisible", desc: "Gagner un match en étant prévisible moins de 30 % du temps.", debloque: "le gant or", objet: ["gant", "or"] },
  { id: "tueur_geant", famille: "duels", nom: "Tueur de géant", desc: "Gagner un duel officiel contre un joueur qui a 200 points de niveau de plus que toi.", debloque: "le fond rubis", objet: ["fond", "rubis"] },
  { id: "revanche", famille: "duels", nom: "Revanche", desc: "Battre un joueur juste après avoir perdu contre lui." },
];
export const titreParId = id => TITRES.find(t => t.id === id) || null;

// Donne les trophées demandés qui ne sont pas encore obtenus. Renvoie les nouveaux.
export function accorderTitres(P, ids, date = Date.now()) {
  const nouveaux = [];
  for (const id of ids) { const t = titreParId(id); if (t && !P.titres[id]) { P.titres[id] = date; nouveaux.push(t); } }
  return nouveaux;
}

// Les trophées des cercles et des tournois en ligne, d'après ce que renvoie le serveur :
//   cercles : mes cercles ({ role, membres, rang }) ; tournois : mes tournois récents ;
//   duelsCercle : mes duels contre les membres du cercle ouvert ; cree : je viens de créer un cercle.
export function titresEnLigne({ cercles = [], tournois = [], duelsCercle = 0, cree = false } = {}) {
  const ids = [];
  if (cree) ids.push("fondateur");
  if (cercles.some(c => c.role === "admin" && c.membres >= 10)) ids.push("rassembleur");
  if (cercles.some(c => c.rang === 1 && c.membres >= 5)) ids.push("patron");
  if (duelsCercle >= 10) ids.push("derby");
  if (tournois.some(t => t.createur && t.cercle && t.phase === "termine")) ids.push("organisateur");
  return ids;
}

// Titre qui débloque un élément d'avatar (ou undefined si l'élément est libre).
export const verrouDe = (type, cle) => TITRES.find(t => t.objet && t.objet[0] === type && t.objet[1] === cle);
// Verrouillé : réservé à un trophée pas encore obtenu, ou article de la boutique pas encore acheté.
export const estVerrouille = (P, type, cle) => { const t = verrouDe(type, cle); return (!!t && !P.titres[t.id]) || !possede(P, type, cle); };

export function profilParDefaut() {
  return {
    v: 1, pseudo: "", drapeau: "🇫🇷",
    av: { symbole: "pierre", fond: "court", gant: "blanc", poignet: "rouge", motif: "uni", gantMotif: "uni" },
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
    // Pour les surnoms et les commentaires (voir surnoms.js)
    genre: "m",                               // « il » ou « elle » dans la bouche des commentateurs
    surnom: null,                             // { nom, complement } : le nom et le qualificatif choisis (sinon un surnom de départ)
    rangMax: 1,                               // le plus haut rang de carte atteint (il ouvre des familles de surnoms)
    egalites: 0, autos: 0, fannys: 0, ballesDeMatchSauvees: 0, lecturesReussies: 0,
    heures: { nuit: 0, matin: 0, dimanche: 0 },
    poignee: "normale",                       // ma poignée de main habituelle (si je ne choisis pas à temps)
    poignees: { franche: 0, normale: 0, legere: 0, froide: 0 },
    cri: CRI_DEFAUT,                          // mon cri de victoire (voir celebrations.js)
    mainsTendues: 0,                          // poignées chaleureuses après une défaite
    duelsFinis: 0,                            // duels en ligne joués sans abandonner
    // La boutique (voir catalogue.js) : les articles achetés et ceux qu'on utilise.
    achats: [], geste: "poing", celebration: "confettis", cadre: "aucun",
  };
}

// Complète une fiche lue depuis le stockage avec les champs manquants.
export function normaliserProfil(brut) {
  const d = profilParDefaut();
  if (!brut || typeof brut !== "object") return d;
  const P = { ...d, ...brut, av: { ...d.av, ...(brut.av || {}) }, heures: { ...d.heures, ...(brut.heures || {}) }, poignees: { ...d.poignees, ...(brut.poignees || {}) } };
  if (P.genre !== "f") P.genre = "m";
  if (!["franche", "normale", "legere", "froide"].includes(P.poignee)) P.poignee = "normale";
  P.cri = criValide(P.cri);
  P.geste = gesteValide(P.geste); P.celebration = celebrationValide(P.celebration); P.cadre = cadreValide(P.cadre);
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
// r = { match, stats, devines, lisibles, adversaire: { id, elo, nom }, finaleTournoi, date, compteNiveau }
// compteNiveau = false : duel entre humains, sans effet sur le niveau (étape 4).
// Pour les trophées des duels : abandon (j'ai abandonné ou quitté le duel), officiel, niveauMoi / niveauAdv
// (niveaux officiels avant le match), finaleEnLigne (finale d'un tournoi en ligne), sitAndGo, grandChelem.
export function enregistrerMatch(P, r) {
  const { match, stats } = r, c = match.coups, n = c.length, gagne = match.vainqueur === 0;
  // Revanche : le match précédent, perdu contre le même joueur humain.
  const precedent = P.derniers[0], humain = String(r.adversaire.id).startsWith("h:");
  const revanche = gagne && humain && !!precedent && precedent.adv === r.adversaire.id && !precedent.gagne;
  if (humain && !r.abandon) P.duelsFinis = (P.duelsFinis || 0) + 1;
  P.matchs++; if (gagne) P.victoires++;
  P.serieEnCours = gagne ? P.serieEnCours + 1 : 0;
  P.meilleureSerieVictoires = Math.max(P.meilleureSerieVictoires, P.serieEnCours);
  P.sets[0] += match.sets[0]; P.sets[1] += match.sets[1]; P.coups += n;
  c.forEach(x => { P.signes[x.a]++; P.signesAdv[x.b]++; });
  const f = (P.faceAFace[r.adversaire.id] ||= { v: 0, d: 0, signes: [0, 0, 0] });
  gagne ? f.v++ : f.d++; c.forEach(x => f.signes[x.b]++);
  f.lect = additionner(f.lect, compterMatch(c));   // ses habitudes, pour son dossier d'avant-match
  const tournoi = !!(r.finaleTournoi && gagne); if (tournoi) P.tournoisGagnes++;
  for (let i = 1; i < n; i++) {
    const p = c[i - 1];
    if (p.gagnant === 0) { P.apresVictoire++; if (c[i].a === p.a) P.memeApresVictoire++; }
    else if (p.gagnant === 1) { P.apresDefaite++; if (c[i].a === p.a) P.memeApresDefaite++; }
  }
  P.devines += r.devines; P.lisibles += r.lisibles;
  P.ballesObtenues += stats.ballesObtenues; P.ballesConverties += stats.ballesConverties;
  P.ballesSubies += stats.ballesSubies; P.ballesSauvees += stats.ballesSauvees;
  if (match.format.setsGagnants > 1 && match.scoresSets.length === 2 * match.format.setsGagnants - 1) { P.decisifsJoues++; if (gagne) P.decisifsGagnes++; }
  if (stats.premierSetPerdu && gagne) P.remontadas++;
  P.meilleureSeriePoints = Math.max(P.meilleureSeriePoints, stats.meilleureSerie);
  P.meilleureRemontee = Math.max(P.meilleureRemontee, stats.meilleureRemontee);
  P.plusLongMatch = Math.max(P.plusLongMatch, n);
  P.egalites += c.filter(x => x.gagnant === null).length;
  P.autos += c.filter(x => x.auto && x.auto[0]).length;
  P.fannys += match.scoresSets.filter(([a, b]) => Math.max(a, b) === 11 && Math.min(a, b) === 0).length;
  P.ballesDeMatchSauvees += stats.ballesDeMatchSauvees || 0;
  P.lecturesReussies += stats.lecturesReussies || 0;
  const quand = new Date(r.date ?? Date.now()), h = quand.getHours(), jour = quand.getDay();
  P.heures = { ...P.heures };
  if (h >= 23 || h < 5) P.heures.nuit++;
  else if (h >= 5 && h < 9) P.heures.matin++;
  if (jour === 0 || jour === 6) P.heures.dimanche++;
  if (r.compteNiveau !== false) {
    P.elo = nouvelElo(P.elo, r.adversaire.elo, gagne);
    P.historiqueElo.push(P.elo); if (P.historiqueElo.length > 60) P.historiqueElo.shift();
  }
  P.derniers.unshift({ date: r.date ?? Date.now(), adv: r.adversaire.id, nomAdv: r.adversaire.nom, gagne, sets: `${match.sets[0]}–${match.sets[1]}`, detail: match.scoresSets.map(([a, b]) => `${a}–${b}`).join(", ") });
  P.derniers = P.derniers.slice(0, 8);

  const taux = r.lisibles ? r.devines / r.lisibles : 1;
  const po = P.poignees || {}, chaleureuses = (po.franche || 0) + (po.normale || 0);
  const conditions = {
    premier: gagne,
    gentleman: chaleureuses >= 10, main_tendue: P.mainsTendues >= 10, glacon: (po.froide || 0) >= 10, fairplay: chaleureuses >= 50,
    jusquau_bout: P.duelsFinis >= 25,
    sangfroid: stats.ballesDeMatchSauvees > 0, remontada: stats.premierSetPerdu && gagne,
    phenix: gagne && stats.ballesDeMatchSauvees > 0, lazare: stats.meilleureRemontee >= 5, houdini: P.ballesDeMatchSauvees >= 10,
    rouleau: stats.meilleureSerie >= 6, implacable: stats.meilleureSerie >= 10,
    invincible: P.serieEnCours >= 3, intouchable: P.serieEnCours >= 5, legende: P.serieEnCours >= 10,
    fanny: match.scoresSets.some(([a, b]) => a === 11 && b === 0),
    habitue: P.matchs >= 10, pilier: P.matchs >= 100, marathon: n >= 60,
    oiseau_de_nuit: P.heures.nuit >= 10, leve_tot: P.heures.matin >= 10,
    vainqueur: tournoi, grand_chelem: P.tournoisGagnes >= 4,
    finaliste: !!r.finaleEnLigne, roi_sng: !!(r.finaleEnLigne && r.sitAndGo && gagne),
    champion_dimanche: !!(r.finaleEnLigne && r.grandChelem && gagne),
    imprevisible: gagne && r.lisibles >= 10 && taux < 0.3,
    tueur_geant: gagne && !!r.officiel && r.niveauAdv - r.niveauMoi >= 200,
    revanche,
  };
  return accorderTitres(P, TITRES.filter(t => conditions[t.id]).map(t => t.id), r.date ?? Date.now());
}

// Remise à zéro : on garde le pseudo, le pays et l'avatar (sans les éléments à débloquer).
export function remettreAZero(P) {
  const N = profilParDefaut();
  N.pseudo = P.pseudo; N.drapeau = P.drapeau;
  // Les achats de la boutique sont gardés (ils sont aussi enregistrés sur le serveur) ; les éléments des trophées repartent.
  N.achats = [...(P.achats || [])];
  for (const k of Object.keys(N.av)) N.av[k] = verrouDe(k, P.av[k]) || !possede(N, k, P.av[k]) ? N.av[k] : P.av[k];
  for (const k of ["cri", "geste", "celebration", "cadre"]) N[k] = P[k] ?? N[k];
  return N;
}
