// Duel en ligne : ce que le téléphone déduit de l'état envoyé par le serveur.
// Aucune connexion réseau ici : ces fonctions sont testées automatiquement.
//
// Sur le serveur, joueur 0 = celui qui a lancé le défi. À l'écran, on est
// toujours le côté 0 (jaune) : on retourne donc les coups si on est le joueur 1.
import { nouveauMatch, jouerCoup, EMOJI, NOM } from "./regles.js";
import { indiceImprevisibilite } from "./analyse.js";
import { normaliserProfil, signeFavori, dernierTitre, titresObtenus } from "./profil.js";

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
  const match = nouveauMatch({ pointsParSet: duel.points_par_set, setsGagnants: duel.sets_gagnants });
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
    desc: P.matchs ? `${P.victoires} V – ${P.matchs - P.victoires} D · ${Math.round(100 * P.victoires / P.matchs)} % de victoires` : "Premier match officiel",
    elo: P.elo,
    specialite: fav === null ? "–" : `${EMOJI[fav]} ${NOM[fav]}`,
    imprevisibilite: P.lisibles >= 10 ? indiceImprevisibilite(P.devines / P.lisibles) : null,
    titres: titresObtenus(P).length,
    av: { ...P.av, ...(ligne.avatar || {}) },
  };
}

// Temps restant pour jouer (en ms), d'après l'heure du serveur.
export function tempsRestant(echeance, decalageMs, maintenant = Date.now()) {
  if (!echeance) return null;
  return new Date(echeance).getTime() - (maintenant + decalageMs);
}

// Liens d'invitation : https://…/PCF/?duel=CODE
export const lienDefi = (base, code) => `${base}?duel=${encodeURIComponent(code)}`;
export const codeDepuisAdresse = recherche => {
  const c = new URLSearchParams(recherche || "").get("duel");
  return c && /^[a-z0-9]{6,20}$/i.test(c) ? c : null;
};

export const FORMAT = d => `Sets de ${d.points_par_set} points · ${d.sets_gagnants} sets gagnants`;
