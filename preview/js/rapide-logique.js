// Partie rapide : les deux formats, et le bot proposé quand personne n'est disponible.
// Aucune connexion réseau ici : testé automatiquement.

export const FORMATS_RAPIDES = {
  officiel: { nom: "Classique", pointsParSet: 11, setsGagnants: 2, detail: "Sets de 11, 2 sets gagnants · amicale" },   // (la clé « officiel » est celle du serveur)
  eclair: { nom: "Éclair", pointsParSet: 7, setsGagnants: 1, detail: "Un set de 7 · amicale" },
};

// Au bout de ce temps sans adversaire, on propose un bot (en continuant de chercher un humain).
export const ATTENTE_AVANT_BOT_S = 30;

// Le bot au niveau le plus proche du mien.
export const botProche = (elo, bots) => [...bots].sort((a, b) => Math.abs(a.elo - elo) - Math.abs(b.elo - elo))[0];

// « 0:07 », « 1:32 »
export const chrono = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// Combien de joueurs attendent déjà (hors moi).
export function texteFile(n) {
  if (!n) return "Personne n'attend pour l'instant : lance la recherche, le premier qui arrive sera ton adversaire.";
  return n === 1 ? "1 joueur attend un adversaire en ce moment." : `${n} joueurs attendent un adversaire en ce moment.`;
}
