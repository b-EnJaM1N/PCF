// Le match du jour (façon Wordle) : chaque jour, le même adversaire pour tout le monde, un seul essai,
// et un résultat à partager (une case par point : 🟩 gagné, 🟥 perdu, ⬜ égalité).
// Ici, seulement les règles (testées automatiquement) ; l'écran est dans app.js.

export const FORMAT_DU_JOUR = { pointsParSet: 7, setsGagnants: 1 };
const PREMIER_JOUR = "2026-10-01";   // le match du jour n° 1

// Plus la semaine avance, plus l'adversaire est fort (comme les mots croisés du journal) : le dimanche, c'est Titan.
const ADVERSAIRES = {
  1: ["rocky", "papyrus", "bambi"],          // lundi
  2: ["miroir", "boomerang", "cyclo"],       // mardi
  3: ["tictac", "chaos", "rancune"],         // mercredi
  4: ["bluffeur", "nemesis"],                // jeudi
  5: ["mante", "stratege"],                  // vendredi
  6: ["professeur", "stratege", "nemesis"],  // samedi
  7: ["titan"],                              // dimanche
};

// Le jour à Paris : « 2026-10-01 ».
export function jourParis(date = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(date).map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
const ecartJours = (a, b) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000);
export const veille = jour => new Date(Date.parse(`${jour}T12:00:00Z`) - 86400000).toISOString().slice(0, 10);

// Un nombre tiré du texte du jour : la même graine pour tout le monde.
function hachage(texte) {
  let h = 2166136261;
  for (const c of texte) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
// Un tirage au sort qui donne toujours la même suite pour la même graine (le bot joue pareil pour tout le monde).
export function hasardGraine(graine) {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Le match d'un jour : son numéro, son adversaire, sa graine.
export function matchDuJour(jour) {
  const iso = new Date(`${jour}T12:00:00Z`).getUTCDay() || 7, liste = ADVERSAIRES[iso], graine = hachage(`handslam-${jour}`);
  return { jour, numero: ecartJours(PREMIER_JOUR, jour) + 1, bot: liste[graine % liste.length], graine };
}

// La grille à partager : une case par coup, du point de vue du joueur (gagnant : 0 = moi, 1 = le bot, null = égalité).
export const grille = coups => coups.map(c => (c.gagnant === 0 ? "🟩" : c.gagnant === 1 ? "🟥" : "⬜")).join("");

// Les jours joués d'affilée jusqu'à aujourd'hui (ou hier, si aujourd'hui n'est pas encore joué).
export function serie(resultats = {}, aujourdhui) {
  let j = resultats[aujourdhui] ? aujourdhui : veille(aujourdhui), n = 0;
  while (resultats[j]) { n++; j = veille(j); }
  return n;
}

// Le texte à partager.
export function texteAPartager(r, { nomBot, serie: s = 0, adresse = "handslam.fr" } = {}) {
  const lignes = [`HandSlam · Match du jour n° ${r.numero} · 🤖 ${nomBot}`];
  if (r.abandon) lignes.push("🏳️ Abandon");
  else lignes.push(`${r.gagne ? "✅ Victoire" : "❌ Défaite"} ${r.score[0]}–${r.score[1]} en ${[...r.grille].length} coups${s > 1 ? ` · 🔥 ${s} jours de suite` : ""}`);
  const cases = [...(r.grille || "")];
  for (let i = 0; i < cases.length; i += 10) lignes.push(cases.slice(i, i + 10).join(""));
  lignes.push(adresse);
  return lignes.join("\n");
}

// On garde les résultats des 60 derniers jours.
export function garder(resultats, jour, r) {
  const tous = { ...resultats, [jour]: r };
  return Object.fromEntries(Object.entries(tous).filter(([j]) => ecartJours(j, jour) < 60));
}
