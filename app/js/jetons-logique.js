// Les jetons : monnaie fictive du jeu, gérée par le serveur (supabase/etape-13-jetons.sql).
// Jamais achetable avec de l'argent réel, jamais échangeable entre joueurs, aucun avantage en match.
// Ici, seulement l'affichage (testé automatiquement).
import { dotations, GRILLES, placesPayees } from "./programmes-logique.js";

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

// ---------------------------------------------------------------- mon résultat dans un tournoi terminé
// Ma place et mon gain, calculés comme le serveur les verse (supabase/etape-24 _verser_dotations, etape-27 _gains_tournoi) :
// chacun est classé selon le tour où il a perdu (le vainqueur devant tous), bots compris ; des joueurs éliminés au même tour
// se partagent les parts de leurs places. t : le tournoi tel que l'envoie voir_tournoi() ; uid : moi.
const NOMS_PLACES = ["1er", "2e", "3e-4e", "5e-8e", "9e-16e", "17e-32e", "33e-64e"];
const palier = place => { let k = 0; while (2 ** k < place) k++; return k; };   // 1 → 0 (1er), 2 → 1 (2e), 3-4 → 2, 5-8 → 3…
// La cagnotte versée : Sit & Go à mise (toutes les entrées, bots compris, moins la commission), freeroll (offerte : 1 000 + 50
// par joueur humain), tournoi programmé (entrées des humains moins la commission, ou la garantie). Sinon : pas de jetons en jeu.
export function cagnotteVersee(t) {
  const n = t.joueurs?.length || 0, humains = (t.inscrits ?? n) - (t.bots || 0);
  if (t.freeroll) return 1000 + 50 * humains;
  if (t.programme) return Math.max(t.garantie || 0, Math.floor((t.mise || 0) * humains * (1 - COMMISSION)));
  if (t.mise > 0) return Math.floor(t.mise * n * (1 - COMMISSION));
  return null;
}
export function monResultat(t, uid) {
  if (!t || !uid || t.phase !== "termine" || t.mode === "championnat" || !(t.joueurs || []).some(j => j.id === uid)) return null;
  const ids = t.joueurs.map(j => j.id), n = ids.length;
  const etape = id => (id === t.vainqueur?.id ? t.nb_tours + 1
    : Math.max(0, ...(t.matchs || []).filter(m => m.fin && [m.j0?.id, m.j1?.id].includes(id) && m.vainqueur !== id).map(m => m.tour)));
  const mien = etape(uid), rang = 1 + ids.filter(id => etape(id) > mien).length, nb = ids.filter(id => etape(id) === mien).length;
  const place = rang === 1 ? "1er" : nb > 1 ? `${rang}e-${rang + nb - 1}e` : `${rang}e`;
  const pot = cagnotteVersee(t);
  if (pot === null) return { place, rang, gain: null };
  // Heads-up à mise : le gagnant prend toute la cagnotte.
  if (n === 2 && !t.programme && !t.freeroll) return { place, rang, gain: rang === 1 ? gainDuel(t.mise) : 0, payees: 1 };
  const np = placesPayees(n), g = GRILLES[np];
  if (rang > np) return { place, rang, gain: 0, payees: np };
  let parts = 0;
  for (let k = rang; k <= Math.min(rang + nb - 1, np); k++) parts += g[palier(k)];
  return { place, rang, gain: Math.floor((pot * parts) / (10000 * nb)), payees: np };
}
export const nomPalier = place => NOMS_PLACES[palier(place)];
