// Tout ce qui est gardé sur le téléphone (localStorage).
// À l'étape 2, la fiche joueur sera aussi sauvegardée en ligne.
const PREFIXE = "pcf:";

export function lire(cle, defaut = null) {
  try { const v = localStorage.getItem(PREFIXE + cle); return v === null ? defaut : JSON.parse(v); } catch { return defaut; }
}
export function ecrire(cle, valeur) {
  try { valeur === null ? localStorage.removeItem(PREFIXE + cle) : localStorage.setItem(PREFIXE + cle, JSON.stringify(valeur)); } catch { /* stockage indisponible */ }
}
