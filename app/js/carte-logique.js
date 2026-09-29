// La carte de joueur : les notes sur 99 et la rareté, calculées d'après la fiche.
// Ici, seulement les calculs (testés automatiquement). Le dessin est dans carte.js.
import { indiceImprevisibilite } from "./analyse.js";
import { titresObtenus, signeFavori, TITRES } from "./profil.js";

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

// La rareté de la carte, et ce qu'il faut pour passer au palier suivant.
export const RARETES = {
  bronze: { nom: "Bronze", suivant: "Joue 10 matchs pour passer en argent." },
  argent: { nom: "Argent", suivant: "Obtiens 5 titres ou gagne un tournoi pour passer en or." },
  or: { nom: "Or", suivant: `Obtiens les ${TITRES.length} titres ou gagne 5 tournois pour devenir une légende.` },
  legende: { nom: "Légende", suivant: "Tu es au sommet. Reste-y." },
};
export function rareteDe(P) {
  const titres = titresObtenus(P).length;
  if (titres >= TITRES.length || P.tournoisGagnes >= 5) return "legende";
  if (titres >= 5 || P.tournoisGagnes >= 1) return "or";
  if (P.matchs >= 10) return "argent";
  return "bronze";
}

// Tout ce que la carte affiche. niveauOfficiel : le niveau des duels entre humains, s'il est connu.
export function carteDe(P, { niveauOfficiel = null, surnom = "", titre = "" } = {}) {
  const fav = P.matchs ? signeFavori(P.signes) : null;
  return {
    rarete: rareteDe(P),
    niveau: niveauOfficiel ?? P.elo,
    typeNiveau: niveauOfficiel !== null && niveauOfficiel !== undefined ? "NIVEAU OFFICIEL" : "NIVEAU",
    signe: fav,                        // 0 Pierre, 1 Ciseaux, 2 Feuille, ou null
    notes: notesDe(P),
    surnom, titre,
    titres: titresObtenus(P).length, matchs: P.matchs,
  };
}
