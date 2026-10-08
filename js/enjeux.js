// L'enjeu d'un défi entre amis (décision du porteur du projet, 8 octobre) : un texte court, facultatif,
// que l'ami accepte avec le défi (« Qui fait la vaisselle ce soir ? »). Le perdant est annoncé à la fin du match.
// Garde-fous : seulement entre amis, court, sans gros mots ni argent (des gages, pas des paris), sans lien.
// Les mêmes règles sont vérifiées par le serveur (supabase/etape-34-enjeux.sql) ; un test compare les deux listes.

export const ENJEU_MAX = 60;

// Des idées toutes prêtes, à toucher puis à modifier si on veut.
export const SUGGESTIONS = [
  "Qui fait la vaisselle ce soir ?",
  "Le perdant ramène les chocolatines",
  "Le perdant paie le café",
  "Qui sort les poubelles ?",
  "Le gagnant choisit le film",
  "Le perdant conduit au retour",
  "Le perdant appelle l'autre « Champion » toute la journée",
  "Qui débarrasse la table ?",
];

// Les gros mots refusés (écrits sans accents ; on compare des mots entiers, sans accents ni majuscules).
export const MOTS_INTERDITS = ["connard", "connasse", "conasse", "salope", "pute", "putain", "encule", "enculer", "nique", "niquer", "ntm",
  "fdp", "batard", "pd", "pede", "tapette", "gouine", "negre", "bougnoule", "youpin", "salaud", "pouffiasse", "petasse"];

const sansAccents = t => t.normalize("NFD").replace(/[̀-ͯ]/g, "");
const ARGENT = /€|\$|£|\beuros?\b|\bdollars?\b|\d+\s*(?:balles|e)\b/i;
const LIEN = /https?:|www\.|\.(?:com|fr|net|org)\b/i;

// Le texte rangé : espaces en trop retirés.
export const nettoyerEnjeu = t => String(t ?? "").replace(/\s+/g, " ").trim();

// null si l'enjeu est accepté, sinon la raison du refus (en clair, pour le joueur).
export function erreurEnjeu(brut) {
  const t = nettoyerEnjeu(brut);
  if (t.length < 3) return "L'enjeu est trop court.";
  if (t.length > ENJEU_MAX) return `L'enjeu est trop long (${ENJEU_MAX} caractères au plus).`;
  if (ARGENT.test(sansAccents(t))) return "Pas d'argent dans un enjeu : un gage entre amis, pas un pari.";
  if (LIEN.test(t)) return "Pas de lien dans un enjeu.";
  const mots = sansAccents(t).toLowerCase().split(/[^a-z0-9]+/);
  if (mots.some(m => MOTS_INTERDITS.includes(m))) return "Cet enjeu contient un mot interdit.";
  return null;
}

// À la fin du match : qui s'y colle (le perdant), en une phrase. moi : ai-je gagné ? adversaire : son nom.
export function annonceEnjeu(enjeu, gagne, adversaire) {
  return `🎯 « ${nettoyerEnjeu(enjeu)} » — ${gagne ? `C'est ${adversaire} qui s'y colle !` : "C'est toi qui t'y colles !"}`;
}
