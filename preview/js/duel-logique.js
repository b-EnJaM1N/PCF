// Duel en ligne : ce que le téléphone déduit de l'état envoyé par le serveur.
// Aucune connexion réseau ici : ces fonctions sont testées automatiquement.
//
// Sur le serveur, joueur 0 = celui qui a lancé le défi. À l'écran, on est
// toujours le côté 0 (jaune) : on retourne donc les coups si on est le joueur 1.
import { nouveauMatch, jouerCoup, EMOJI, NOM, texteFormat } from "./regles.js";
import { indiceImprevisibilite } from "./analyse.js";
import { normaliserProfil, signeFavori, dernierTitre, titresObtenus } from "./profil.js";
import { surnomDe } from "./surnoms.js";

export const maPlace = (duel, uid) => (duel.j0 === uid ? 0 : duel.j1 === uid ? 1 : null);
export const adversaireDe = (duel, uid) => (duel.j0 === uid ? duel.j1 : duel.j0);
export const vuDe = (paire, moi) => (moi === 0 ? [paire[0], paire[1]] : [paire[1], paire[0]]);

// Un coup révélé par le serveur, vu de mon côté : a = mon signe, b = celui de l'adversaire.
export function coupVuDe(c, moi) {
  const auto = c.auto || [false, false];
  return moi === 0 ? { a: c.a, b: c.b, auto: [!!auto[0], !!auto[1]] } : { a: c.b, b: c.a, auto: [!!auto[1], !!auto[0]] };
}

// Rejoue tous les coups révélés avec les règles de l'application.
// Renvoie le match (de mon point de vue) et les événements de chaque coup.
export function rejouer(duel, moi) {
  const match = nouveauMatch(formatDuel(duel));
  const evenements = (duel.coups || []).map(c => { const v = coupVuDe(c, moi); return jouerCoup(match, v.a, v.b, v.auto); });
  return { match, evenements };
}

// Le score calculé par le téléphone est-il bien celui du serveur ?
export function coherent(match, duel, moi) {
  const memes = (x, y) => x[0] === y[0] && x[1] === y[1];
  return memes(match.points, vuDe(duel.points, moi)) && memes(match.sets, vuDe(duel.sets, moi));
}

// Un adversaire humain, décrit comme un bot pour réutiliser l'écran de présentation.
export function adversaireHumain(ligne) {
  const P = normaliserProfil(ligne.fiche);
  const fav = signeFavori(P.signes);
  return {
    id: `h:${ligne.id}`, uid: ligne.id, humain: true,
    nom: ligne.pseudo, numero: ligne.numero,
    style: `${ligne.drapeau || "🌍"} ${dernierTitre(P)}`,
    desc: P.matchs ? `${P.victoires} V – ${P.matchs - P.victoires} D · ${Math.round(100 * P.victoires / P.matchs)} % de victoires` : "Premier match",
    elo: P.elo,
    classement: ligne.classement ?? null,          // niveau officiel (duels entre humains)
    specialite: fav === null ? "–" : `${EMOJI[fav]} ${NOM[fav]}`,
    imprevisibilite: P.lisibles >= 10 ? indiceImprevisibilite(P.devines / P.lisibles) : null,
    titres: titresObtenus(P).length,
    av: { ...P.av, ...(ligne.avatar || {}) },
    // Pour le speaker et les commentateurs
    surnom: surnomDe(P), genre: P.genre, fiche: P, drapeau: ligne.drapeau || null,
  };
}

// Temps restant pour jouer (en ms), d'après l'heure du serveur.
export function tempsRestant(echeance, decalageMs, maintenant = Date.now()) {
  if (!echeance) return null;
  return new Date(echeance).getTime() - (maintenant + decalageMs);
}

// Liens d'invitation : https://…/PCF/?duel=CODE
// Rendez-vous (supabase/etape-37-rendez-vous.sql) : défi accepté, match pas encore commencé ; annulé au bout de 24 heures.
export const ATTENTE_RDV_MS = 24 * 3600 * 1000;
export const enRendezVous = (d, maintenant = Date.now()) => d?.phase === "attente" && !!d.accepte_le && maintenant - Date.parse(d.accepte_le) < ATTENTE_RDV_MS;
// Temps qu'il reste pour se retrouver : « 23 h », « 45 min ».
export function texteRdvRestant(d, maintenant = Date.now()) {
  const min = Math.max(0, Math.floor((Date.parse(d.accepte_le) + ATTENTE_RDV_MS - maintenant) / 60000));
  return min >= 60 ? `${Math.floor(min / 60)} h` : `${min} min`;
}

export const lienDefi = (base, code) => `${base}?duel=${encodeURIComponent(code)}`;
export const codeDepuisAdresse = recherche => {
  const c = new URLSearchParams(recherche || "").get("duel");
  return c && /^[a-z0-9]{6,20}$/i.test(c) ? c : null;
};

// Formats courts (match en 1 set, sets de 3 ou 1 point) : toujours amicaux en duel.
export const formatCourt = (points, sets) => sets === 1 || points < 7;

// Le format d'un duel (colonnes du serveur) pour les règles de l'application.
export const formatDuel = d => ({ pointsParSet: d.points_par_set, setsGagnants: d.sets_gagnants });
export const FORMAT = d => `${texteFormat(formatDuel(d))}${d.classe === false ? " · amical" : " · officiel"}${d.mise ? ` · 🪙 mise de ${d.mise} jetons` : ""}`;

// Face-à-face avec un joueur : le bilan de tous nos duels terminés (vus de mon côté ; derniers : tous, du plus récent au plus ancien).
// duels : lignes de la table « duels » (j0, j1, vainqueur, fin, scores_sets, coups, classe, tournoi_id, maj_le).
export function statsFaceAFace(duels, uid) {
  const r = { matchs: 0, v: 0, d: 0, officiels: 0, sets: [0, 0], points: [0, 0], egalites: 0,
    mesSignes: [0, 0, 0], sesSignes: [0, 0, 0],
    // Après un point gagné, combien de fois chacun rejoue le même signe (moi, lui).
    rejoueApresVictoire: [{ meme: 0, total: 0 }, { meme: 0, total: 0 }],
    // Après un point perdu, combien de fois chacun change de signe (moi, lui).
    changeApresDefaite: [{ change: 0, total: 0 }, { change: 0, total: 0 }], serie: null, derniers: [] };
  const tries = [...duels].filter(x => maPlace(x, uid) !== null && x.vainqueur !== null && x.vainqueur !== undefined)
    .sort((x, y) => Date.parse(y.maj_le) - Date.parse(x.maj_le));
  for (const duel of tries) {
    const moi = maPlace(duel, uid), gagne = duel.vainqueur === moi;
    r.matchs++; gagne ? r.v++ : r.d++;
    if (duel.classe) r.officiels++;
    const scores = (duel.scores_sets || []).map(s => vuDe(s, moi));
    for (const [a, b] of scores) r.sets[a > b ? 0 : 1]++;
    const coups = (duel.coups || []).map(c => ({ ...coupVuDe(c, moi), g: c.g === null || c.g === undefined ? null : c.g === moi ? 0 : 1 }));
    coups.forEach((c, i) => {
      r.mesSignes[c.a]++; r.sesSignes[c.b]++;
      if (c.g === null) r.egalites++; else r.points[c.g]++;
      // Les réflexes : après un point gagné, le gagnant rejoue-t-il le même signe ?
      const prec = coups[i - 1];
      if (prec && prec.g !== null) {
        const x = r.rejoueApresVictoire[prec.g];
        x.total++; if ((prec.g === 0 ? c.a === prec.a : c.b === prec.b)) x.meme++;
      }
      // Après un point perdu (par moi : g = 1 ; par lui : g = 0), le perdant change-t-il de signe ?
      if (prec && prec.g !== null) {
        const perdant = 1 - prec.g, x = r.changeApresDefaite[perdant];
        x.total++; if ((perdant === 0 ? c.a !== prec.a : c.b !== prec.b)) x.change++;
      }
    });
    {
      r.derniers.push({ gagne, scores, date: duel.maj_le, fin: duel.fin,
        type: duel.tournoi_id ? "tournoi" : duel.rapide ? "partie rapide" : duel.classe ? "officiel" : "amical" });
    }
  }
  // La série en cours (les duels sont du plus récent au plus ancien).
  for (const duel of tries) {
    const gagne = duel.vainqueur === maPlace(duel, uid);
    if (!r.serie) r.serie = { gagne, n: 1 }; else if (r.serie.gagne === gagne) r.serie.n++; else break;
  }
  const favori = t => { const n = t[0] + t[1] + t[2]; if (!n) return null; const s = t.indexOf(Math.max(...t)); return { signe: s, pct: Math.round(100 * t[s] / n) }; };
  r.monFavori = favori(r.mesSignes); r.sonFavori = favori(r.sesSignes);
  return r;
}
