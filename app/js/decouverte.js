// La première visite : un match tout de suite contre Bambi (sans compte), puis le menu « Jouer » s'ouvre au fil des matchs.
// Ici, seulement les règles (testées automatiquement) ; l'écran est dans app.js.

// Ce qui s'ouvre après combien de matchs joués (tous les matchs : bots, duels, tournois).
// Au départ : le premier match, Défier un ami et l'Entraînement.
export const PALIERS = [
  { matchs: 1, texte: "⚡ Nouveau : la Partie rapide, un adversaire de ton niveau en un clic." },
  { matchs: 3, texte: "🪙 Nouveau : les jetons, les défis du jour et la boutique." },
  { matchs: 5, texte: "🏆 Nouveau : les tournois (Sit & Go, freeroll du soir, Grand Chelem du dimanche)." },
];

// Le palier atteint (0, 1, 3 ou 5) ; « complet » : le joueur a demandé à tout voir.
export function palier(matchs = 0, complet = false) {
  if (complet) return PALIERS.at(-1).matchs;
  let p = 0;
  for (const x of PALIERS) if (matchs >= x.matchs) p = x.matchs;
  return p;
}

// Ce qui vient de s'ouvrir entre deux nombres de matchs.
export const nouveautes = (avant, apres) => PALIERS.filter(p => avant < p.matchs && apres >= p.matchs).map(p => p.texte);

// Le premier match : contre Bambi (le débutant), un set de 7 points.
export const PREMIER_MATCH = { bot: "bambi", pointsParSet: 7, setsGagnants: 1 };

// Le conseil affiché pendant le premier match, selon le nombre de coups joués et le résultat du dernier
// (gagnant : 0 = moi, 1 = le bot, null = égalité).
export function conseil(coups, gagnant) {
  if (coups === 0) return "👉 Touche Pierre, Feuille ou Ciseaux avant la fin de la barre (5 secondes). Pierre bat Ciseaux, Ciseaux bat Feuille, Feuille bat Pierre.";
  if (coups <= 3) {
    if (gagnant === null) return "🤝 Égalité : même signe des deux côtés, le coup est rejoué.";
    return `${gagnant === 0 ? "✅ Point pour toi !" : "❌ Point pour Bambi."} Le premier à 7 points, avec 2 points d'écart, gagne le set.`;
  }
  if (coups <= 9) return "🔎 Regarde l'historique en bas de l'écran : Bambi rejoue le même signe tant qu'il n'a pas perdu deux fois de suite. À toi de le lire !";
  return "🧠 Les bots plus forts te lisent aussi : si tu joues toujours pareil, ils le verront. Varie tes coups !";
}
