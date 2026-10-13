// Règles de synchronisation entre la fiche du téléphone et la fiche en ligne.
// Aucune connexion réseau ici : ces fonctions sont testées automatiquement.
import { normaliserProfil } from "./profil.js";

// Mêmes règles que la base de données : 2 à 16 caractères, pas de « # », pas d'espace au bord.
export function pseudoValide(p) {
  return typeof p === "string" && p.length >= 2 && p.length <= 16 && p === p.trim() && !/[#\u0000-\u001f\u007f]/.test(p);
}
export const pseudoComplet = P => (P.numero ? `${P.pseudo}#${P.numero}` : P.pseudo);

// Ce qu'on envoie en ligne. La fiche complète voyage dans « fiche » ;
// pseudo, pays et avatar sont aussi à part, pour la recherche et le face-à-face.
export function ligneDepuisProfil(P, id) {
  const { numero, ...fiche } = P;
  return { id, pseudo: P.pseudo, drapeau: P.drapeau, avatar: P.av, fiche };
}

export function profilDepuisLigne(ligne) {
  const P = normaliserProfil(ligne.fiche);
  P.pseudo = ligne.pseudo; P.numero = ligne.numero; P.drapeau = ligne.drapeau || P.drapeau;
  if (ligne.avatar && Object.keys(ligne.avatar).length) P.av = { ...P.av, ...ligne.avatar };
  return P;
}

const vide = P => !P || (!P.matchs && !Object.keys(P.titres || {}).length);

// À la connexion : quelle fiche garder ?
// - pas encore de fiche en ligne : on envoie celle du téléphone ;
// - fiche du téléphone vide : on reprend celle en ligne ;
// - sinon : la plus avancée (plus de matchs), puis la plus récente.
// Renvoie { fiche, source: "locale" | "distante", envoyer: bool }.
export function choisirFiche(locale, ligne) {
  if (!ligne) return { fiche: locale, source: "locale", envoyer: true };
  const distante = profilDepuisLigne(ligne);
  if (vide(locale)) return { fiche: distante, source: "distante", envoyer: false };
  const garderLocale = locale.matchs > distante.matchs ||
    (locale.matchs === distante.matchs && (locale.majLe || 0) > (distante.majLe || 0));
  if (!garderLocale) return { fiche: distante, source: "distante", envoyer: false };
  return { fiche: { ...locale, pseudo: distante.pseudo, numero: distante.numero }, source: "locale", envoyer: true };
}
