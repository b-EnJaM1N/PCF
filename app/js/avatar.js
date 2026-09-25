// Avatar : une main stylisée (pas de photo), personnalisable.
// Le symbole est au choix : poing fermé (Pierre), main ouverte (Feuille) ou V de la victoire (Ciseaux).
export const FONDS = { court: ["Court", "#1F5FA8"], gazon: ["Gazon", "#2E8B57"], terre: ["Terre battue", "#C8643B"], violet: ["Violet", "#6A4C93"], ardoise: ["Ardoise", "#3B4556"], or: ["Or", "#C9971C"] };
export const GANTS = { blanc: ["Blanc", "#F5F7FA"], jaune: ["Jaune", "#F4C542"], rouge: ["Rouge", "#E8574A"], bleu: ["Bleu", "#4DA3FF"], vert: ["Vert", "#6BD49A"], or: ["Or", "#FFD34D"] };
export const POIGNETS = { rouge: ["Rouge", "#D63A2F"], blanc: ["Blanc", "#F5F7FA"], bleu: ["Bleu", "#2C6FD1"], jaune: ["Jaune", "#F4C542"], noir: ["Noir", "#23262B"], or: ["Or", "#E0B12A"] };
export const SYMBOLES = { pierre: "✊ Pierre", feuille: "✋ Feuille", ciseaux: "✌️ Ciseaux" };
export const MOTIFS = { uni: "Uni", rayures: "Rayures", etoile: "Étoile", eclair: "Éclair" };
export const PAYS = [["🇫🇷", "France"], ["🇧🇪", "Belgique"], ["🇨🇭", "Suisse"], ["🇨🇦", "Canada"], ["🇱🇺", "Luxembourg"], ["🇲🇦", "Maroc"], ["🇩🇿", "Algérie"], ["🇹🇳", "Tunisie"], ["🇸🇳", "Sénégal"], ["🇨🇮", "Côte d'Ivoire"], ["🇪🇸", "Espagne"], ["🇮🇹", "Italie"], ["🇩🇪", "Allemagne"], ["🇬🇧", "Royaume-Uni"], ["🇺🇸", "États-Unis"], ["🇧🇷", "Brésil"], ["🇯🇵", "Japon"], ["🌍", "Autre"]];

let n = 0;
export function avatarSVG(a) {
  const fond = (FONDS[a.fond] || FONDS.court)[1], gant = (GANTS[a.gant] || GANTS.blanc)[1], poignet = (POIGNETS[a.poignet] || POIGNETS.rouge)[1];
  const id = "av" + (++n), ink = "rgba(0,0,0,.22)";
  let motif = "";
  if (a.motif === "rayures") motif = `<g clip-path="url(#${id})" opacity=".16">${[...Array(9)].map((_, i) => `<rect x="${i * 16 - 40}" y="-10" width="7" height="140" fill="#fff" transform="rotate(30 50 50)"/>`).join("")}</g>`;
  if (a.motif === "etoile") motif = `<path d="M50 6 L61 38 L95 38 L67 58 L78 92 L50 71 L22 92 L33 58 L5 38 L39 38 Z" fill="#fff" opacity=".14"/>`;
  if (a.motif === "eclair") motif = `<path d="M60 2 L28 54 L48 54 L36 98 L76 40 L54 40 L68 2 Z" fill="#fff" opacity=".16"/>`;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><clipPath id="${id}"><circle cx="50" cy="50" r="48"/></clipPath></defs>
    <circle cx="50" cy="50" r="48" fill="${fond}"/>${motif}
    <circle cx="50" cy="50" r="46.5" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3"/>
    <rect x="37" y="72" width="26" height="16" rx="3" fill="${poignet}" stroke="${ink}" stroke-width="1.5"/>
    <rect x="37" y="78" width="26" height="3" fill="rgba(255,255,255,.55)"/>
    ${main(a.symbole, gant, ink)}
  </svg>`;
}

const doigt = (x, y, h, gant, ink, rot = "") => `<rect x="${x}" y="${y}" width="10.5" height="${h}" rx="5.2" fill="${gant}" stroke="${ink}" stroke-width="1.5"${rot ? ` transform="rotate(${rot})"` : ""}/>`;
const paume = (y, gant, ink) => `<rect x="29" y="${y}" width="42" height="${76 - y}" rx="11" fill="${gant}" stroke="${ink}" stroke-width="1.5"/>`;
const pouce = (gant, ink) => `<rect x="25" y="50" width="28" height="12" rx="6" fill="${gant}" stroke="${ink}" stroke-width="1.5"/>`;

function main(symbole, gant, ink) {
  if (symbole === "feuille") return `
    ${doigt(29.5, 20, 34, gant, ink)}${doigt(40, 12, 40, gant, ink)}${doigt(50.5, 14, 38, gant, ink)}${doigt(61, 22, 32, gant, ink)}
    <rect x="12" y="44" width="26" height="11" rx="5.5" fill="${gant}" stroke="${ink}" stroke-width="1.5" transform="rotate(-35 34 50)"/>
    ${paume(44, gant, ink)}
    <path d="M40 60 q10 4 20 0" fill="none" stroke="${ink}" stroke-width="1.5" stroke-linecap="round"/>`;
  if (symbole === "ciseaux") return `
    ${doigt(31, 10, 40, gant, ink, "-14 36 50")}${doigt(44, 10, 40, gant, ink, "12 49 50")}
    ${paume(40, gant, ink)}
    ${doigt(50, 30, 16, gant, ink)}${doigt(60.5, 33, 14, gant, ink)}
    ${pouce(gant, ink)}
    <path d="M56 58 q6 3 12 0" fill="none" stroke="${ink}" stroke-width="1.5" stroke-linecap="round"/>`;
  return `
    ${paume(40, gant, ink)}
    ${[0, 1, 2, 3].map(i => doigt(29 + i * 10.5, 28 + (i === 0 || i === 3 ? 3 : 0), 18, gant, ink)).join("")}
    ${pouce(gant, ink)}
    <path d="M56 58 q6 3 12 0" fill="none" stroke="${ink}" stroke-width="1.5" stroke-linecap="round"/>`;
}
