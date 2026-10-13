// Niveau officiel, amis et cercles : ce que le téléphone calcule ou affiche lui-même.
// Aucune connexion réseau ici : ces fonctions sont testées automatiquement.
import { FONDS } from "./avatar.js";
import { K_ELO } from "./profil.js";

export const CLASSEMENT_DEPART = 1200;

// Les divisions du niveau officiel (les mêmes que sur le serveur, supabase/etape-31-divisions.sql).
// On monte dès le seuil ; on ne redescend que 20 points sous le seuil de sa division.
export const DIVISIONS = [
  { nom: "Bronze", emoji: "🥉", seuil: 0 }, { nom: "Argent", emoji: "🥈", seuil: 1100 }, { nom: "Or", emoji: "🥇", seuil: 1250 },
  { nom: "Platine", emoji: "💎", seuil: 1400 }, { nom: "Diamant", emoji: "👑", seuil: 1550 },
];
export const MARGE_DIVISION = 20;
export function divisionDe(points, avant = null) {
  let d = avant ?? DIVISIONS.reduce((k, x, i) => (points >= x.seuil ? i : k), 0);
  while (d < 4 && points >= DIVISIONS[d + 1].seuil) d++;
  while (d > 0 && points < DIVISIONS[d].seuil - MARGE_DIVISION) d--;
  return d;
}
export const texteDivision = d => `${DIVISIONS[d].emoji} ${DIVISIONS[d].nom}`;
export const LIMITE_PAIRE = 5;   // duels officiels par jour entre les deux mêmes joueurs (voir supabase/etape-4-classement.sql)

// Points gagnés par le vainqueur et perdus par le perdant (même calcul que le serveur).
export const variationClassement = (gagnant, perdant) =>
  Math.round(K_ELO * (1 - 1 / (1 + Math.pow(10, (perdant - gagnant) / 400))));

// Ce que le joueur « moi » (0 ou 1) voit à la fin d'un duel.
// Les 10 premiers duels officiels : le niveau est « provisoire » (il bouge deux fois plus vite, voir supabase/etape-8-calibrage.sql).
export const CALIBRAGE = 10;
export const provisoire = joues => (joues ?? 0) < CALIBRAGE;
export const texteNiveau = (points, joues) => (provisoire(joues) ? `${points} ?` : `${points}`);
export function texteCalibrage(joues) {
  const reste = CALIBRAGE - (joues ?? 0);
  if (reste <= 0) return "";
  return `Niveau provisoire : encore ${reste} duel${reste > 1 ? "s" : ""} officiel${reste > 1 ? "s" : ""} de calibrage, pendant lesquels ton niveau bouge deux fois plus vite.`;
}

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

// ---------------------------------------------------------------- qui est en ligne (étape 39)
// presence (dans la carte d'un ami ou d'un membre de cercle) : 'ligne', 'match' ou null.
export const PRESENCES = { ligne: "En ligne", match: "En match" };
export const pointPresence = p => (PRESENCES[p?.presence] ? `<span class="presence ${p.presence}" title="${PRESENCES[p.presence]}" aria-label="${PRESENCES[p.presence]}"></span>` : "");
export const textePresence = p => (PRESENCES[p?.presence] ? `${PRESENCES[p.presence]} · ` : "");
// Les amis en ligne d'abord, puis en match, puis les autres (sans changer l'ordre à l'intérieur).
export const parPresence = liste => [...liste].sort((a, b) => ({ ligne: 0, match: 1 }[a.presence] ?? 2) - ({ ligne: 0, match: 1 }[b.presence] ?? 2));
