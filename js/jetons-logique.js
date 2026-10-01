// Les jetons : monnaie fictive du jeu, gérée par le serveur (supabase/etape-13-jetons.sql).
// Jamais achetable avec de l'argent réel, jamais échangeable entre joueurs, aucun avantage en match.
// Ici, seulement l'affichage (testé automatiquement).

// « 1 jeton », « 1 250 jetons » (espace des milliers à la française).
export function texteJetons(n) {
  const v = Math.max(0, Math.round(Number(n) || 0));
  return `${v.toLocaleString("fr-FR").replace(/\s/g, " ")} jeton${v > 1 ? "s" : ""}`;
}

// Le bonus quotidien selon le jour de la série (même règle que le serveur) : 50, 75, 100… jusqu'à 200.
export const bonusDuJour = serie => Math.min(200, 25 + 25 * Math.max(1, serie));

// La ligne sous le solde. e : ce que renvoie le serveur ({ solde, serie, bonus_dispo, bonus_montant, … }).
export function texteSerie(e) {
  if (!e) return "";
  if (e.bonus_dispo) return e.serie > 0 ? `Série : ${e.serie} jour${e.serie > 1 ? "s" : ""} d'affilée. Ne la perds pas !` : "Reviens chaque jour : le bonus grimpe jusqu'à 200 jetons.";
  return `Série : ${e.serie} jour${e.serie > 1 ? "s" : ""} d'affilée · demain : +${e.bonus_montant}`;
}
