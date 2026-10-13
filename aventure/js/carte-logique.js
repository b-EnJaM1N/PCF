// La carte de joueur : les notes sur 99 et la rareté, calculées d'après la fiche.
// Ici, seulement les calculs (testés automatiquement). Le dessin est dans carte.js.
import { indiceImprevisibilite } from "./analyse.js";
import { titresObtenus, signeFavori } from "./profil.js";

const borne = x => Math.max(1, Math.min(99, Math.round(x)));
// Un taux comparé au hasard (une chance sur deux) : 50 % → 50, 100 % → 99.
// Avec peu d'occasions, la note reste proche de 50 : il faut des preuves pour monter (ou descendre).
function note(reussis, total, confiance) {
  if (!total) return 50;
  const brut = 50 + (reussis / total - 0.5) * 100;
  return borne(50 + (brut - 50) * Math.min(1, total / confiance));
}

// Les six notes de la carte, avec leur explication.
export function notesDe(P) {
  const lecture = P.lisibles >= 30 ? indiceImprevisibilite(P.devines / P.lisibles) : 50;
  return [
    { code: "VIC", nom: "Victoires", valeur: note(P.victoires, P.matchs, 20), aide: "ton taux de victoires" },
    { code: "FIN", nom: "Finition", valeur: note(P.ballesConverties, P.ballesObtenues, 20), aide: "tes balles de set et de match converties" },
    { code: "MEN", nom: "Mental", valeur: note(P.ballesSauvees, P.ballesSubies, 20), aide: "les balles de set et de match que tu sauves" },
    { code: "DÉC", nom: "Sets décisifs", valeur: note(P.decisifsGagnes, P.decisifsJoues, 8), aide: "tes sets décisifs gagnés" },
    { code: "IMP", nom: "Imprévisibilité", valeur: borne(50 + (lecture - 50) * Math.min(1, P.lisibles / 100)), aide: "à quel point ton jeu est difficile à lire" },
    { code: "EXP", nom: "Expérience", valeur: borne(14 * Math.log(1 + P.matchs)), aide: "le nombre de matchs joués" },
  ];
}

// Les 10 rangs de la carte, du plus courant au plus rare. On monte les premiers en jouant,
// les suivants demandent du niveau officiel (les tournois gagnés contre les bots ne mènent pas plus haut que Platine).
export const RANGS = [
  { id: "bois", nom: "Bois", condition: "nouveau joueur", ok: () => true },
  { id: "bronze", nom: "Bronze", condition: "5 matchs", ok: P => P.matchs >= 5 },
  { id: "argent", nom: "Argent", condition: "15 matchs", ok: P => P.matchs >= 15 },
  { id: "or", nom: "Or", condition: "30 matchs et 3 titres", ok: (P, n, t) => P.matchs >= 30 && t >= 3 },
  { id: "platine", nom: "Platine", condition: "niveau officiel 1300, ou un tournoi gagné et 30 matchs", ok: (P, n) => n >= 1300 || (P.tournoisGagnes >= 1 && P.matchs >= 30) },
  { id: "diamant", nom: "Diamant", condition: "niveau officiel 1400", ok: (P, n) => n >= 1400 },
  { id: "rubis", nom: "Rubis", condition: "niveau officiel 1500", ok: (P, n) => n >= 1500 },
  { id: "maitre", nom: "Maître", condition: "niveau officiel 1600", ok: (P, n) => n >= 1600 },
  { id: "grand_maitre", nom: "Grand Maître", condition: "niveau officiel 1750", ok: (P, n) => n >= 1750 },
  { id: "legende", nom: "Légende", condition: "niveau officiel 1900", ok: (P, n) => n >= 1900 },
];

// Le rang de la carte (le plus haut atteint) et le suivant.
// niveauOfficiel : le niveau des duels entre humains (null si inconnu).
export function rangDe(P, niveauOfficiel = null) {
  const n = niveauOfficiel ?? 0, t = titresObtenus(P).length;
  let i = 0;
  RANGS.forEach((r, k) => { if (r.ok(P, n, t)) i = k; });
  return { rang: RANGS[i], numero: i + 1, suivant: RANGS[i + 1] || null };
}
export function texteRang({ rang, numero, suivant }) {
  return `Carte ${rang.nom} (rang ${numero} sur ${RANGS.length}). ` + (suivant ? `Prochain rang, ${suivant.nom} : ${suivant.condition}.` : "Tu es au sommet. Reste-y.");
}

// Tout ce que la carte affiche. niveauOfficiel : le niveau des duels entre humains, s'il est connu.
export function carteDe(P, { niveauOfficiel = null, provisoire = false, surnom = "", titre = "" } = {}) {
  const fav = P.matchs ? signeFavori(P.signes) : null;
  return {
    rarete: rangDe(P, niveauOfficiel).rang.id, rang: rangDe(P, niveauOfficiel),
    niveau: niveauOfficiel ?? P.elo,
    typeNiveau: niveauOfficiel === null || niveauOfficiel === undefined ? "NIVEAU" : provisoire ? "NIVEAU PROVISOIRE" : "NIVEAU OFFICIEL",
    signe: fav,                        // 0 Pierre, 1 Ciseaux, 2 Feuille, ou null
    notes: notesDe(P),
    surnom, titre,
    titres: titresObtenus(P).length, matchs: P.matchs,
  };
}
