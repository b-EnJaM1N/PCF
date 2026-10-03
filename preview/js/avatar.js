// Avatar : une main stylisée (pas de photo), personnalisable.
// Le symbole est au choix : poing fermé (Pierre), main ouverte (Feuille) ou V de la victoire (Ciseaux) ;
// les gestes de victoire (boutique) ajoutent le doigt levé (« index ») et le pouce levé (« pouce »).
// Chaque couleur : [nom, couleur de base, aperçu CSS facultatif (dégradé, pour le choix dans « Ma fiche »)].
// Les éléments de la boutique (catalogue.js) se débloquent en les achetant avec des jetons.
export const FONDS = { court: ["Court", "#1F5FA8"], gazon: ["Gazon", "#2E8B57"], terre: ["Terre battue", "#C8643B"], violet: ["Violet", "#6A4C93"], ardoise: ["Ardoise", "#3B4556"], or: ["Or", "#C9971C"], minuit: ["Minuit", "#1B2140"], rubis: ["Rubis", "#9B1B30"],
  roland: ["Terre de Roland", "#C8643B"], londres: ["Gazon de Londres", "#3E9B4F", "repeating-linear-gradient(90deg,#3E9B4F 0 6px,#358A44 6px 12px)"],
  neon: ["Néon", "#1A0B33", "radial-gradient(circle,#1A0B33 55%,#FF3EA5 60%,#22D3EE 70%)"], coucher: ["Coucher de soleil", "#F2784B", "linear-gradient(#FFB347,#F2784B,#8E3B8E)"],
  stade: ["Stade de nuit", "#0B1B33", "radial-gradient(circle at 50% 0,#FFF6C8,#0B1B33 60%)"], galaxie: ["Galaxie", "#120A2A", "radial-gradient(circle at 30% 30%,#5B2A86,#120A2A 70%)"] };
export const GANTS = { blanc: ["Blanc", "#F5F7FA"], jaune: ["Jaune", "#F4C542"], rouge: ["Rouge", "#E8574A"], bleu: ["Bleu", "#4DA3FF"], vert: ["Vert", "#6BD49A"], or: ["Or", "#FFD34D"], argent: ["Argent", "#C9CED6"],
  rose: ["Rose", "#F28DB2"], violet: ["Violet", "#9B6BD6"], noir: ["Noir mat", "#33363D"], turquoise: ["Turquoise", "#2EC4B6"] };
export const POIGNETS = { rouge: ["Rouge", "#D63A2F"], blanc: ["Blanc", "#F5F7FA"], bleu: ["Bleu", "#2C6FD1"], jaune: ["Jaune", "#F4C542"], noir: ["Noir", "#23262B"], or: ["Or", "#E0B12A"], argent: ["Argent", "#AEB6C2"],
  tricolore: ["Tricolore", "#F5F7FA", "linear-gradient(90deg,#2C5CC5 33%,#F5F7FA 33% 66%,#E1342B 66%)"],
  arcenciel: ["Arc-en-ciel", "#F4C542", "linear-gradient(90deg,#E8574A,#F4C542,#6BD49A,#4DA3FF,#9B6BD6)"],
  leopard: ["Léopard", "#E2A74B", "radial-gradient(circle at 30% 40%,#3A2A1A 18%,transparent 20%),radial-gradient(circle at 70% 65%,#3A2A1A 18%,transparent 20%),#E2A74B"] };
export const SYMBOLES = { pierre: "✊ Pierre", feuille: "✋ Feuille", ciseaux: "✌️ Ciseaux" };
export const MOTIFS = { uni: "Uni", rayures: "Rayures", etoile: "Étoile", eclair: "Éclair" };
// Le motif du gant (la seconde couleur est celle du poignet).
export const MOTIFS_GANT = { uni: "Uni", rayures: "Rayé", pois: "À pois", bicolore: "Bicolore", coutures: "Coutures dorées", bandeau: "Bandeau de champion",
  damier: "Damier", flammes: "Flammes", tigre: "Tigré", zebre: "Zébré", coeurs: "Cœurs", etoiles: "Étoiles", camouflage: "Camouflage", carbone: "Carbone" };
export const PAYS = [["🇫🇷", "France"], ["🇧🇪", "Belgique"], ["🇨🇭", "Suisse"], ["🇨🇦", "Canada"], ["🇱🇺", "Luxembourg"], ["🇲🇦", "Maroc"], ["🇩🇿", "Algérie"], ["🇹🇳", "Tunisie"], ["🇸🇳", "Sénégal"], ["🇨🇮", "Côte d'Ivoire"], ["🇪🇸", "Espagne"], ["🇮🇹", "Italie"], ["🇩🇪", "Allemagne"], ["🇬🇧", "Royaume-Uni"], ["🇺🇸", "États-Unis"], ["🇧🇷", "Brésil"], ["🇯🇵", "Japon"], ["🌍", "Autre"]];

let n = 0;
// sansFond : seulement le gant et le poignet (le poing qui se secoue pendant un coup).
export function avatarSVG(a) {
  const fond = (FONDS[a.fond] || FONDS.court)[1], gant = (GANTS[a.gant] || GANTS.blanc)[1], poignet = (POIGNETS[a.poignet] || POIGNETS.rouge)[1];
  const cle = a.poignet in POIGNETS ? a.poignet : "rouge";
  const id = "av" + (++n), ink = "rgba(0,0,0,.22)", gm = a.gantMotif;
  // Gant rayé, à pois ou bicolore : on le remplit avec un motif SVG.
  const remplissage = {
    rayures: `<pattern id="${id}g" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="8" height="8" fill="${gant}"/><rect width="3" height="8" fill="${poignet}"/></pattern>`,
    pois: `<pattern id="${id}g" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="${gant}"/><circle cx="4.5" cy="4.5" r="1.9" fill="${poignet}"/></pattern>`,
    bicolore: `<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="0"><stop offset=".5" stop-color="${gant}"/><stop offset=".5" stop-color="${poignet}"/></linearGradient>`,
    damier: `<pattern id="${id}g" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${gant}"/><rect width="5" height="5" fill="${poignet}"/><rect x="5" y="5" width="5" height="5" fill="${poignet}"/></pattern>`,
    flammes: `<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="0" y1="80" x2="0" y2="10"><stop offset="0" stop-color="#E8574A"/><stop offset=".45" stop-color="#F28C28"/><stop offset=".75" stop-color="#F4C542"/><stop offset="1" stop-color="${gant}"/></linearGradient>`,
    tigre: `<pattern id="${id}g" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)"><rect width="12" height="12" fill="#F28C28"/><path d="M0 2 Q6 5 12 2 M0 8 Q6 11 12 8" stroke="#2B1D10" stroke-width="2" fill="none"/></pattern>`,
    zebre: `<pattern id="${id}g" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(25)"><rect width="12" height="12" fill="#F5F7FA"/><path d="M0 3 Q6 6 12 3 M0 9 Q6 12 12 9" stroke="#1E2024" stroke-width="2.6" fill="none"/></pattern>`,
    coeurs: `<pattern id="${id}g" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="${gant}"/><path d="M6 9 L2.6 5.6 A1.8 1.8 0 0 1 6 3.4 A1.8 1.8 0 0 1 9.4 5.6 Z" fill="#E8395E"/></pattern>`,
    etoiles: `<pattern id="${id}g" width="13" height="13" patternUnits="userSpaceOnUse"><rect width="13" height="13" fill="${gant}"/><path d="M6.5 2 L7.7 5.3 L11 5.4 L8.4 7.4 L9.3 10.6 L6.5 8.7 L3.7 10.6 L4.6 7.4 L2 5.4 L5.3 5.3 Z" fill="#FFD34D"/></pattern>`,
    camouflage: `<pattern id="${id}g" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#6B7B4A"/><circle cx="6" cy="6" r="5" fill="#4A5632"/><circle cx="16" cy="14" r="6" fill="#8E9A63"/><circle cx="4" cy="18" r="3.5" fill="#3B2F22"/></pattern>`,
    carbone: `<pattern id="${id}g" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#26292E"/><rect width="3" height="3" fill="#3A3E45"/><rect x="3" y="3" width="3" height="3" fill="#3A3E45"/></pattern>`,
  }[gm] || "";
  // Poignets et fonds spéciaux (boutique).
  const poignetDef = {
    tricolore: `<linearGradient id="${id}p" x1="0" x2="1"><stop offset=".33" stop-color="#2C5CC5"/><stop offset=".33" stop-color="#F5F7FA"/><stop offset=".66" stop-color="#F5F7FA"/><stop offset=".66" stop-color="#E1342B"/></linearGradient>`,
    arcenciel: `<linearGradient id="${id}p" x1="0" x2="1"><stop offset="0" stop-color="#E8574A"/><stop offset=".25" stop-color="#F4C542"/><stop offset=".5" stop-color="#6BD49A"/><stop offset=".75" stop-color="#4DA3FF"/><stop offset="1" stop-color="#9B6BD6"/></linearGradient>`,
    leopard: `<pattern id="${id}p" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#E2A74B"/><circle cx="2.5" cy="2.5" r="1.6" fill="#3A2A1A"/><circle cx="6" cy="6" r="1.4" fill="#3A2A1A"/></pattern>`,
  }[cle] || "";
  const fillPoignet = poignetDef ? `url(#${id}p)` : poignet;
  const fondDef = {
    coucher: `<linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB347"/><stop offset=".55" stop-color="#F2784B"/><stop offset="1" stop-color="#8E3B8E"/></linearGradient>`,
    stade: `<radialGradient id="${id}f" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#FFF6C8"/><stop offset=".35" stop-color="#2A4A7A"/><stop offset="1" stop-color="#0B1B33"/></radialGradient>`,
    galaxie: `<radialGradient id="${id}f" cx=".3" cy=".3" r=".9"><stop offset="0" stop-color="#5B2A86"/><stop offset=".6" stop-color="#1E1240"/><stop offset="1" stop-color="#0A0618"/></radialGradient>`,
  }[a.fond] || "";
  const fillFond = fondDef ? `url(#${id}f)` : fond;
  let decorFond = "";
  if (a.fond === "galaxie") decorFond = [[22, 30], [70, 20], [80, 55], [30, 70], [55, 82], [15, 52], [62, 40]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? 0.9 : 1.5}" fill="#fff" opacity=".85"/>`).join("");
  if (a.fond === "neon") decorFond = `<circle cx="50" cy="50" r="42" fill="none" stroke="#FF3EA5" stroke-width="2.5" opacity=".9"/><circle cx="50" cy="50" r="38" fill="none" stroke="#22D3EE" stroke-width="1.5" opacity=".8"/>`;
  if (a.fond === "roland") decorFond = `<g clip-path="url(#${id})" stroke="#fff" stroke-width="2" opacity=".6" fill="none"><path d="M18 0 V100 M82 0 V100 M0 50 H100"/></g>`;
  if (a.fond === "londres") decorFond = `<g clip-path="url(#${id})" opacity=".18">${[...Array(7)].map((_, i) => `<rect x="${i * 16}" y="0" width="8" height="100" fill="#fff"/>`).join("")}</g>`;
  if (a.fond === "stade") decorFond = `<g clip-path="url(#${id})" fill="#FFF6C8" opacity=".25"><path d="M10 0 L40 100 L30 100 Z"/><path d="M90 0 L60 100 L70 100 Z"/></g>`;
  const fillGant = remplissage ? `url(#${id}g)` : gant;
  let deco = "";
  if (gm === "coutures") deco = `<g stroke-dasharray="2.2 2" transform="translate(50 52) scale(.84) translate(-50 -52)">${main(a.symbole, "none", "#E7C04A")}</g>`;
  if (gm === "bandeau") deco = `<rect x="28" y="64" width="44" height="7" rx="2" fill="#E0B12A" stroke="${ink}" stroke-width="1.5"/><rect x="28" y="67" width="44" height="1.4" fill="rgba(255,255,255,.7)"/>`;
  let motif = "";
  if (a.motif === "rayures") motif = `<g clip-path="url(#${id})" opacity=".16">${[...Array(9)].map((_, i) => `<rect x="${i * 16 - 40}" y="-10" width="7" height="140" fill="#fff" transform="rotate(30 50 50)"/>`).join("")}</g>`;
  if (a.motif === "etoile") motif = `<path d="M50 6 L61 38 L95 38 L67 58 L78 92 L50 71 L22 92 L33 58 L5 38 L39 38 Z" fill="#fff" opacity=".14"/>`;
  if (a.motif === "eclair") motif = `<path d="M60 2 L28 54 L48 54 L36 98 L76 40 L54 40 L68 2 Z" fill="#fff" opacity=".16"/>`;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><clipPath id="${id}"><circle cx="50" cy="50" r="48"/></clipPath>${remplissage}${poignetDef}${fondDef}</defs>
    ${a.sansFond ? "" : `<circle cx="50" cy="50" r="48" fill="${fillFond}"/>${decorFond}${motif}
    <circle cx="50" cy="50" r="46.5" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3"/>`}
    <rect x="37" y="72" width="26" height="16" rx="3" fill="${fillPoignet}" stroke="${ink}" stroke-width="1.5"/>
    <rect x="37" y="78" width="26" height="3" fill="rgba(255,255,255,.55)"/>
    ${main(a.symbole, fillGant, ink)}${deco}
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
  // Doigt levé (l'index, « numéro 1 ») et pouce levé : les gestes de victoire de la boutique.
  // L'index est à gauche, côté pouce (comme pour la pierre) ; le pouce replié passe devant.
  if (symbole === "index") return `
    ${doigt(40, 36, 18, gant, ink)}${doigt(50.5, 37, 17, gant, ink)}${doigt(61, 40, 15, gant, ink)}
    ${paume(44, gant, ink)}
    ${doigt(29.5, 7, 48, gant, ink)}
    <path d="M33 11.5 q2.2 -2 4.4 0" fill="none" stroke="${ink}" stroke-width="1.2" stroke-linecap="round" opacity=".55"/>
    <path d="M31.5 30 h7.5" fill="none" stroke="${ink}" stroke-width="1.2" stroke-linecap="round" opacity=".55"/>
    <rect x="24" y="52" width="36" height="12" rx="6" fill="${gant}" stroke="${ink}" stroke-width="1.5"/>
    <path d="M58 68 q5 2.5 10 0" fill="none" stroke="${ink}" stroke-width="1.5" stroke-linecap="round"/>`;
  // Le poing vu de côté : les doigts repliés empilés, le pouce bien dressé au-dessus.
  if (symbole === "pouce") return `
    <rect x="30" y="40" width="30" height="36" rx="10" fill="${gant}" stroke="${ink}" stroke-width="1.5"/>
    ${[0, 1, 2, 3].map(i => `<rect x="${i === 0 ? 40 : 43}" y="${41 + i * 8.5}" width="${[32, 28, 26, 23][i]}" height="9.5" rx="4.75" fill="${gant}" stroke="${ink}" stroke-width="1.5"/>`).join("")}
    <path d="M30 48 C28.5 38 30.5 26 34.5 16.5 C37 11 45.5 11.5 46.5 17.5 C47.5 25 48.5 35 49 43 C49 47 46 48.5 41 48.5 Z" fill="${gant}" stroke="${ink}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M36.5 18.5 q4 -2.5 7.5 0.5 l0 5.5 q-3.5 1.5 -7.5 0 z" fill="none" stroke="${ink}" stroke-width="1.2" stroke-linejoin="round" opacity=".55"/>
    <path d="M33 34 q6.5 2 13.5 0" fill="none" stroke="${ink}" stroke-width="1.2" stroke-linecap="round" opacity=".55"/>`;
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
