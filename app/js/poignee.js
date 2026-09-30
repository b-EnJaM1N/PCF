// La poignée de main de fin de match : quatre styles, choisis en 3 secondes (sinon, le style habituel).
// Ici, seulement les règles (testées automatiquement) ; l'écran est dans app.js.

export const STYLES = {
  franche: { nom: "Franche", icone: "💪", chaleur: 3 },
  normale: { nom: "Normale", icone: "🤝", chaleur: 2 },
  legere: { nom: "Légère", icone: "🤏", chaleur: 1 },
  froide: { nom: "Froide", icone: "🧊", chaleur: 0 },
};
export const DELAI_CHOIX_MS = 3000;
export const styleValide = s => (STYLES[s] ? s : "normale");

// Chaque bot serre la main selon son caractère. Miroir copie ton style ; Chaos, au hasard.
const DES_BOTS = {
  rocky: "franche", papyrus: "normale", bambi: "franche", boomerang: "normale", cyclo: "normale", tictac: "legere",
  rancune: "froide", bluffeur: "franche", nemesis: "legere", mante: "froide", stratege: "normale", professeur: "normale", titan: "legere",
};
export function styleDuBot(botId, monStyle, rng = Math.random) {
  if (botId === "miroir") return styleValide(monStyle);
  if (botId === "chaos") return Object.keys(STYLES)[Math.floor(rng() * 4)];
  return DES_BOTS[botId] || "normale";
}

// Les deux styles ensemble : l'animation (celle du plus froid des deux) et ce qu'on en dit.
// Renvoie { animation, ligne } ; ligne = { role, id } d'une réplique du catalogue.
export function rencontre(moi, lui) {
  const a = STYLES[styleValide(moi)], b = STYLES[styleValide(lui)];
  const froid = a.chaleur <= b.chaleur ? styleValide(moi) : styleValide(lui);
  let ligne;
  if (froid === "froide" && Math.max(a.chaleur, b.chaleur) >= 2) ligne = "commentatrice_poignee_contraste_01";
  else if (froid === "froide") ligne = "commentatrice_poignee_froide_01";
  else if (froid === "legere") ligne = "arbitre_poignee_legere_01";
  else if (froid === "franche") ligne = "arbitre_poignee_franche_01";
  else ligne = "arbitre_poignee_de_main_01";
  return { animation: froid, ligne };
}

// Le compte des poignées de main dans la fiche (pour les trophées fair-play).
// defaite : le match vient d'être perdu (une poignée chaleureuse compte alors comme « main tendue »).
export function compterPoignee(P, style, defaite = false) {
  P.poignees = { franche: 0, normale: 0, legere: 0, froide: 0, ...(P.poignees || {}) };
  const s = styleValide(style);
  P.poignees[s]++;
  if (defaite && (s === "franche" || s === "normale")) P.mainsTendues = (P.mainsTendues || 0) + 1;
}
