// Niveau officiel, amis et cercles : ce que le téléphone calcule ou affiche lui-même.
// Aucune connexion réseau ici : ces fonctions sont testées automatiquement.
import { FONDS } from "./avatar.js";
import { K_ELO } from "./profil.js";

export const CLASSEMENT_DEPART = 1200;
export const LIMITE_PAIRE = 5;   // duels officiels par jour entre les deux mêmes joueurs (voir supabase/etape-4-classement.sql)

// Points gagnés par le vainqueur et perdus par le perdant (même calcul que le serveur).
export const variationClassement = (gagnant, perdant) =>
  Math.round(K_ELO * (1 - 1 / (1 + Math.pow(10, (perdant - gagnant) / 400))));

// Ce que le joueur « moi » (0 ou 1) voit à la fin d'un duel.
export function texteClassementFin(duel, moi) {
  if (!duel) return "";
  if (duel.classement_avant && duel.classement_apres) {
    const avant = duel.classement_avant[moi], apres = duel.classement_apres[moi], d = apres - avant;
    return `Niveau officiel : ${avant} → ${apres} (${d >= 0 ? "+" : "−"}${Math.abs(d)})`;
  }
  switch (duel.classement_motif) {
    case "amical": return "Match amical : le niveau officiel ne change pas.";
    case "non_dispute": return "Aucun coup joué : le niveau officiel ne change pas.";
    case "limite": return `Déjà ${LIMITE_PAIRE} duels officiels entre vous aujourd'hui : celui-ci ne compte pas pour le niveau officiel.`;
    default: return "";
  }
}

// Les blasons des cercles : un emblème sur un écu de couleur.
export const EMBLEMES = {
  lion: "🦁", loup: "🐺", aigle: "🦅", ours: "🐻", renard: "🦊", requin: "🦈", dragon: "🐉", licorne: "🦄",
  couronne: "👑", eclair: "⚡", flamme: "🔥", etoile: "⭐", trophee: "🏆", cible: "🎯", poing: "✊", ciseaux: "✌️",
};
export const blasonParDefaut = () => ({ embleme: "lion", fond: "court" });
export function normaliserBlason(b) {
  const x = b && typeof b === "object" ? b : {};
  return { embleme: EMBLEMES[x.embleme] ? x.embleme : "lion", fond: FONDS[x.fond] ? x.fond : "court" };
}
export function blasonSVG(b) {
  const { embleme, fond } = normaliserBlason(b);
  return `<svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M50 4 L92 18 V52 C92 80 72 98 50 106 C28 98 8 80 8 52 V18 Z" fill="${FONDS[fond][1]}" stroke="rgba(255,255,255,.8)" stroke-width="4"/>
    <path d="M50 12 L84 23 V52 C84 74 68 89 50 96" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="3"/>
    <text x="50" y="62" text-anchor="middle" dominant-baseline="middle" font-size="46">${EMBLEMES[embleme]}</text>
  </svg>`;
}

// Nom de cercle : entre 2 et 30 caractères. Renvoie un message d'erreur, ou null si le nom va.
export function erreurNomCercle(nom) {
  const n = String(nom || "").trim();
  if (n.length < 2) return "Le nom du cercle doit faire au moins 2 caractères.";
  if (n.length > 30) return "Le nom du cercle doit faire au plus 30 caractères.";
  if (/[\u0000-\u001f\u007f]/.test(n)) return "Ce nom contient des caractères interdits.";
  return null;
}

// Liens d'invitation dans un cercle : https://…/PCF/?cercle=CODE
export const lienCercle = (base, code) => `${base}?cercle=${encodeURIComponent(code)}`;
export const codeCercleDepuisAdresse = recherche => {
  const c = new URLSearchParams(recherche || "").get("cercle");
  return c && /^[a-z0-9]{6,20}$/i.test(c) ? c : null;
};

// « 1er », « 2e », « 3e »…
export const rang = n => (n === 1 ? "1er" : `${n}e`);
