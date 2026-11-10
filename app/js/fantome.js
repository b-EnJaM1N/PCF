// Le fantôme d'un ami (6 novembre, idée retenue par le porteur du projet) : un bot qui joue comme lui, d'après les coups de ses
// derniers matchs en ligne (son dossier, étape 32). On le défie quand on veut, en un set de 7 ; le match compte dans le total
// de matchs joués, mais ni dans le niveau, ni dans les duels, ni dans le classement.
//
// Le modèle garde ses manies telles qu'il les a jouées :
//   - son ouverture (le premier coup de ses matchs) ;
//   - après un point gagné, perdu ou une égalité : ce qu'il fait par rapport à son propre signe (le garder, passer au suivant…)
//     ou par rapport au signe d'en face (le copier, jouer ce qui le bat…), selon ce qui décrit le mieux ses habitudes.
// Il tire ses coups au hasard selon ces fréquences (comme lui, il n'est pas une machine), avec un peu de hasard pur en plus.

import { ouvert } from "./nouveautes.js";

export const MATCHS_MIN = 3, COUPS_MIN = 40;
const BRUIT = 0.08;

// Visible sur la version de test (et en local), et partout une fois ouvert (nouveautes.js).
export const fantomeVisible = loc => ouvert("fantome", loc);

const RES = g => (g === 1 ? "g" : g === 0 ? "p" : "e");

// matchs : le dossier du joueur, une liste de matchs, chacun une liste de coups { b: son signe, a: celui d'en face, g: 1 s'il a
// gagné le point, 0 s'il l'a perdu, null pour une égalité }. Renvoie null s'il n'y a pas assez de matchs.
export function modeleFantome(matchs) {
  const ms = (matchs || []).filter(m => Array.isArray(m) && m.length);
  const coups = ms.reduce((n, m) => n + m.length, 0);
  if (ms.length < MATCHS_MIN || coups < COUPS_MIN) return null;
  const ouverture = [1, 1, 1], signes = [0, 0, 0];
  const lui = { g: [0, 0, 0], p: [0, 0, 0], e: [0, 0, 0] }, face = { g: [0, 0, 0], p: [0, 0, 0], e: [0, 0, 0] };
  for (const m of ms) {
    ouverture[m[0].b]++;
    m.forEach(c => signes[c.b]++);
    for (let i = 1; i < m.length; i++) {
      const avant = m[i - 1], r = RES(avant.g), b = m[i].b;
      lui[r][(b - avant.b + 3) % 3]++;
      face[r][(b - avant.a + 3) % 3]++;
    }
  }
  // Pour chaque situation, la référence qui décrit le mieux ses choix (la plus marquée).
  const part = c => Math.max(...c) / Math.max(1, c[0] + c[1] + c[2]);
  const apres = {};
  for (const r of ["g", "p", "e"]) {
    const base = part(face[r]) > part(lui[r]) ? "face" : "lui";
    apres[r] = { base, compte: (base === "face" ? face : lui)[r].map(x => x + 0.5) };
  }
  return { ouverture, apres, favori: signes.indexOf(Math.max(...signes)), matchs: ms.length, coups };
}

const tirer = (poids, rng) => {
  let x = rng() * poids.reduce((s, p) => s + p, 0);
  for (let i = 0; i < poids.length; i++) { x -= poids[i]; if (x < 0) return i; }
  return poids.length - 1;
};

// hist : les coups vus par le fantôme, { moi, adv, res: "g"|"p"|"e" } (comme pour les autres bots).
export function coupFantome(modele, hist, rng = Math.random) {
  if (rng() < BRUIT) return Math.floor(rng() * 3);
  const dernier = hist[hist.length - 1];
  if (!dernier) return tirer(modele.ouverture, rng);
  const a = modele.apres[dernier.res] || modele.apres.e;
  return ((a.base === "face" ? dernier.adv : dernier.moi) + tirer(a.compte, rng)) % 3;
}
