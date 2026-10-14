// Les jetons : monnaie fictive du jeu, gérée par le serveur (supabase/etape-13-jetons.sql).
// Jamais achetable avec de l'argent réel, jamais échangeable entre joueurs, aucun avantage en match.
// Ici, seulement l'affichage (testé automatiquement).
import { dotations } from "./programmes-logique.js";

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

// Version courte, à côté du solde : « 🔥 3 j » (jours d'affilée), rien sans série.
export const serieCourte = e => (e && e.serie > 0 ? `🔥 ${e.serie} j` : "");

// ---------------------------------------------------------------- les mises (supabase/etape-14-mises.sql)
export const MISES = [0, 50, 100, 200, 500, 1000];       // 0 = sans mise
export const COMMISSION = 0.10;
// Duel : le gagnant remporte 1,8 fois la mise.
export const gainDuel = mise => Math.floor(2 * mise * (1 - COMMISSION));
// Sit & Go à mise (8 joueurs) : façon poker (la grille de programmes-logique.js), 65 % au 1er et 35 % au 2e, après la commission.
export function gainsSng(mise, joueurs = 8) {
  return dotations(Math.floor(mise * joueurs * (1 - COMMISSION)), joueurs).map(d => d.montant);
}
export const texteMise = m => (m ? `${m.toLocaleString("fr-FR").replace(/\s/g, " ")} jetons` : "Sans mise");
