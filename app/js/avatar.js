import { braceletSVG, bagueSVG } from "./bijoux.js";
import { BRODERIES, broderieSVG } from "./gants-brodes.js";
// Avatar : une main stylisée (pas de photo), personnalisable.
// Le symbole est au choix : poing fermé (Pierre), main ouverte (Feuille) ou V de la victoire (Ciseaux) ;
// les gestes de victoire (boutique) ajoutent le doigt levé (« index ») et le pouce levé (« pouce »).
// Chaque couleur : [nom, couleur de base, aperçu CSS facultatif (dégradé, pour le choix dans « Ma fiche »)].
// Les éléments de la boutique (catalogue.js) se débloquent en les achetant avec des jetons.
export const FONDS = { court: ["Court", "#1F5FA8"], gazon: ["Gazon", "#2E8B57"], terre: ["Terre battue", "#C8643B"], violet: ["Violet", "#6A4C93"], ardoise: ["Ardoise", "#3B4556"], or: ["Or", "#C9971C"], minuit: ["Minuit", "#1B2140"], rubis: ["Rubis", "#9B1B30"], tribunes: ["Tribunes", "#22304D", "radial-gradient(circle at 30% 30%,#E8574A 12%,transparent 14%),radial-gradient(circle at 70% 40%,#F4C542 12%,transparent 14%),radial-gradient(circle at 45% 70%,#F5F7FA 12%,transparent 14%),#22304D"],
  roland: ["Terre de Roland", "#C8643B"], londres: ["Gazon de Londres", "#3E9B4F", "repeating-linear-gradient(90deg,#3E9B4F 0 6px,#358A44 6px 12px)"],
  neon: ["Néon", "#1A0B33", "radial-gradient(circle,#1A0B33 55%,#FF3EA5 60%,#22D3EE 70%)"], coucher: ["Coucher de soleil", "#F2784B", "linear-gradient(#FFB347,#F2784B,#8E3B8E)"],
  stade: ["Stade de nuit", "#0B1B33", "radial-gradient(circle at 50% 0,#FFF6C8,#0B1B33 60%)"], galaxie: ["Galaxie", "#120A2A", "radial-gradient(circle at 30% 30%,#5B2A86,#120A2A 70%)"] };
// La main nue (« nu ») prend la couleur de peau choisie ; c'est la main des nouveaux joueurs, jusqu'à leur premier gant.
// « Sans » (main nue, sans vernis, sans bracelet, sans bague) : un rond barré d'une croix (25 octobre, demande du porteur du projet :
// les rayures et le rond multicolore ne disaient pas assez qu'on enlève l'accessoire).
const SANS = "linear-gradient(45deg,transparent 43%,#E8574A 43% 57%,transparent 57%),linear-gradient(-45deg,transparent 43%,#E8574A 43% 57%,transparent 57%),rgba(255,255,255,.14)";
export const GANTS = { nu: ["Main nue (sans gant)", null, SANS], blanc: ["Blanc", "#F5F7FA"], jaune: ["Jaune", "#F4C542"], rouge: ["Rouge", "#E8574A"], bleu: ["Bleu", "#4DA3FF"], vert: ["Vert", "#6BD49A"], or: ["Or", "#FFD34D"], argent: ["Argent", "#C9CED6"],
  rose: ["Rose", "#F28DB2"], violet: ["Violet", "#9B6BD6"], noir: ["Noir mat", "#33363D"], turquoise: ["Turquoise", "#2EC4B6"],
  elite: ["Gant de l'Élite (champion de la carrière)", "#1D1A2E", "linear-gradient(135deg,#1D1A2E 0 45%,#E9C046 45% 55%,#1D1A2E 55%)"],
  // Le Dossard 1 (12 novembre, idée du porteur du projet) : le gant jaune du tenant du titre d'un cercle, comme le maillot jaune ;
  // il passe au vainqueur du tournoi suivant du cercle (voir etape-71-dossard.sql).
  dossard: ["Dossard 1 (tenant du titre de ton cercle)", "#F4C542", "radial-gradient(circle at 50% 50%,#fff 0 28%,transparent 30%),#F4C542"] };
export const POIGNETS = { rouge: ["Rouge", "#D63A2F"], bronze: ["Bronze", "#C27A3A"], blanc: ["Blanc", "#F5F7FA"], bleu: ["Bleu", "#2C6FD1"], jaune: ["Jaune", "#F4C542"], noir: ["Noir", "#23262B"], or: ["Or", "#E0B12A"], argent: ["Argent", "#AEB6C2"],
  tricolore: ["Tricolore", "#F5F7FA", "linear-gradient(90deg,#2C5CC5 33%,#F5F7FA 33% 66%,#E1342B 66%)"],
  arcenciel: ["Arc-en-ciel", "#F4C542", "linear-gradient(90deg,#E8574A,#F4C542,#6BD49A,#4DA3FF,#9B6BD6)"],
  leopard: ["Léopard", "#E2A74B", "radial-gradient(circle at 30% 40%,#3A2A1A 18%,transparent 20%),radial-gradient(circle at 70% 65%,#3A2A1A 18%,transparent 20%),#E2A74B"],
  // Les objets du club (9 novembre, choix du porteur du projet) : le poignet Club (boutique), le poignet « Fondé en 2026 » (trophée).
  club: ["Club", "#14533A", "linear-gradient(#14533A 28%,#E9C046 28% 38%,#14533A 38% 62%,#E9C046 62% 72%,#14533A 72%)"],
  an2026: ["Fondé en 2026", "#E0B12A", "radial-gradient(circle,#5A3E06 22%,#E0B12A 26%)"],
  braise: ["Braise", "#E8572A", "linear-gradient(90deg,#7A1F12,#E8572A,#F4A93B,#E8572A,#7A1F12)"] };   // (série de jours : trophée « Le rendez-vous »)
// Les couleurs de peau de la main nue : toutes gratuites, toujours.
export const PEAUX = { neutre: ["Neutre (comme les emojis)", "#FFCC4D"], claire: ["Claire", "#F7D9C4"], rosee: ["Rosée", "#EDB894"], doree: ["Dorée", "#D49A6A"],
  mate: ["Mate", "#A86B42"], brune: ["Brune", "#7A4A2A"], ebene: ["Ébène", "#4A2C1A"] };
// Les petits accessoires (gratuits) : le vernis (sur la main nue), le bracelet et la bague.
const AUCUN = SANS;
export const ONGLES = { aucun: ["Sans vernis", null, AUCUN], rouge: ["Vernis rouge", "#D7263D"], rose: ["Vernis rose", "#F28DB2"], noir: ["Vernis noir", "#1E1E24"],
  bleu: ["Vernis bleu", "#2C6FD1"], or: ["Vernis or", "#E0B12A"] };
// Les bracelets et les bagues (10 novembre : redessinés et diversifiés, bijoux.js) : [nom, couleur, aperçu du bouton, dessin].
const metal = (c1, c2) => `linear-gradient(${c1},${c2})`;
export const BRACELETS = { aucun: ["Sans bracelet", null, AUCUN],
  or: ["Bracelet or", "#E9C046", metal("#FFF1B8", "#A9801A"), { type: "metal", metal: "or" }], argent: ["Bracelet argent", "#C9CED6", metal("#FFFFFF", "#7E8794"), { type: "metal", metal: "argent" }],
  orrose: ["Bracelet or rose", "#E8A08A", metal("#FFE0D6", "#A5604C"), { type: "metal", metal: "orrose" }], noir: ["Bracelet noir", "#2B2E34", metal("#6B707A", "#111215"), { type: "metal", metal: "noir" }],
  cuir: ["Bracelet en cuir", "#6B3E22", null, { type: "cuir", couleur: "#6B3E22" }], cuir_noir: ["Cuir noir", "#23262B", null, { type: "cuir", couleur: "#23262B" }],
  perles: ["Perles de nacre", "#EFE9DA", "radial-gradient(circle at 35% 30%,#fff 15%,#EFE9DA 45%)", { type: "perles", couleurs: ["#EFE9DA"] }],
  perles_arcenciel: ["Perles arc-en-ciel", "#F4C542", "linear-gradient(90deg,#E8574A,#F4C542,#6BD49A,#4DA3FF,#9B6BD6)", { type: "perles", couleurs: ["#E8574A", "#F4C542", "#6BD49A", "#4DA3FF", "#9B6BD6"] }],
  perles_tricolore: ["Perles bleu-blanc-rouge", "#F5F7FA", "linear-gradient(90deg,#2C5CC5 33%,#F5F7FA 33% 66%,#E1342B 66%)", { type: "perles", couleurs: ["#2C5CC5", "#F5F7FA", "#E1342B"] }],
  montre: ["Montre de sport", "#23262B", "radial-gradient(circle,#F5F7FA 30%,#3A3E45 34% 45%,#23262B 48%)", { type: "montre", couleur: "#23262B" }],
  montre_blanche: ["Montre blanche", "#F5F7FA", "radial-gradient(circle,#F5F7FA 30%,#3A3E45 34% 45%,#F5F7FA 48%)", { type: "montre", couleur: "#E9ECF1" }],
  montre_rouge: ["Montre rouge", "#D63A2F", "radial-gradient(circle,#F5F7FA 30%,#3A3E45 34% 45%,#D63A2F 48%)", { type: "montre", couleur: "#D63A2F" }],
  // à la boutique (catalogue.js)
  jonc: ["Jonc or", "#E9C046", "repeating-linear-gradient(#FFF1B8 0 3px,#A9801A 3px 6px)", { type: "jonc", metal: "or" }],
  gourmette_or: ["Gourmette or", "#E9C046", "radial-gradient(circle,transparent 30%,#E9C046 34% 55%,transparent 58%) 0 0/10px 10px,#A9801A", { type: "gourmette", metal: "or" }],
  gourmette_argent: ["Gourmette argent", "#C9CED6", "radial-gradient(circle,transparent 30%,#E6E9EE 34% 55%,transparent 58%) 0 0/10px 10px,#7E8794", { type: "gourmette", metal: "argent" }],
  clous_noir: ["Cuir clouté", "#23262B", "radial-gradient(circle,#E6E9EE 22%,transparent 26%) 0 0/9px 9px,#23262B", { type: "clous", couleur: "#23262B", metal: "argent" }],
  clous_rouge: ["Cuir rouge clouté or", "#9B1B30", "radial-gradient(circle,#E9C046 22%,transparent 26%) 0 0/9px 9px,#9B1B30", { type: "clous", couleur: "#9B1B30", metal: "or" }],
  tresse: ["Brésilien tressé", "#E8574A", "repeating-linear-gradient(-55deg,#E8574A 0 4px,#F4C542 4px 8px,#2E9E5B 8px 12px)", { type: "tresse", couleurs: ["#E8574A", "#F4C542", "#2E9E5B"] }],
  tresse_club: ["Tressé HandSlam", "#14533A", "repeating-linear-gradient(-55deg,#14533A 0 4px,#E9C046 4px 8px,#F5EFE0 8px 12px)", { type: "tresse", couleurs: ["#14533A", "#E9C046", "#F5EFE0"] }],
  breloque_pierre: ["Breloque Pierre", "#E9C046", "radial-gradient(circle,#1D2330 30%,#E9C046 34%)", { type: "breloque", metal: "or", signe: "pierre" }],
  breloque_feuille: ["Breloque Feuille", "#C9CED6", "radial-gradient(circle,#1D2330 30%,#C9CED6 34%)", { type: "breloque", metal: "argent", signe: "feuille" }],
  breloque_ciseaux: ["Breloque Ciseaux", "#E9C046", "radial-gradient(circle,#1D2330 30%,#E9C046 34%)", { type: "breloque", metal: "or", signe: "ciseaux" }],
  // gagné avec un trophée (profil.js)
  capitaine: ["Brassard de capitaine", "#F4C542", null, { type: "capitaine" }] };
// Les bracelets dont on choisit la couleur (cuir, perles).
export const BRACELETS_COLORABLES = new Set(["cuir", "cuir_noir", "perles", "clous_noir", "clous_rouge"]);
export const BAGUES = { aucune: ["Sans bague", null, AUCUN],
  or: ["Anneau or", "#E9C046", metal("#FFF1B8", "#A9801A"), { type: "anneau", metal: "or" }], argent: ["Anneau argent", "#C9CED6", metal("#FFFFFF", "#7E8794"), { type: "anneau", metal: "argent" }],
  noir: ["Anneau noir", "#2B2E34", metal("#6B707A", "#111215"), { type: "anneau", metal: "noir" }],
  rubis: ["Bague au rubis", "#E9C046", "radial-gradient(circle,#C2183A 35%,#E9C046 40%)", { type: "pierre", metal: "or", couleur: "#C2183A" }],
  // à la boutique (catalogue.js)
  saphir: ["Bague au saphir", "#C9CED6", "radial-gradient(circle,#1F4FB8 35%,#C9CED6 40%)", { type: "pierre", metal: "argent", couleur: "#1F4FB8" }],
  emeraude: ["Bague à l'émeraude", "#E9C046", "radial-gradient(circle,#108A54 35%,#E9C046 40%)", { type: "pierre", metal: "or", couleur: "#108A54" }],
  diamant: ["Bague au diamant", "#C9CED6", "radial-gradient(circle,#F2F8FF 25%,#9FC3F5 35%,#C9CED6 42%)", { type: "pierre", metal: "argent", couleur: "#DDEBFF" }],
  signe_pierre: ["Chevalière Pierre", "#E9C046", "radial-gradient(circle,#E9C046 20%,#1D2330 24% 40%,#E9C046 44%)", { type: "signe", metal: "or", signe: "pierre" }],
  signe_feuille: ["Chevalière Feuille", "#C9CED6", "radial-gradient(circle,#C9CED6 20%,#1D2330 24% 40%,#C9CED6 44%)", { type: "signe", metal: "argent", signe: "feuille" }],
  signe_ciseaux: ["Chevalière Ciseaux", "#E9C046", "radial-gradient(circle,#E9C046 20%,#1D2330 24% 40%,#E9C046 44%)", { type: "signe", metal: "or", signe: "ciseaux" }],
  symbole: ["Chevalière HandSlam", "#E9C046", "radial-gradient(circle,#F5EFE0 22%,#0F3D2B 26% 40%,#E9C046 44%)", { type: "anneau", metal: "or" }],
  // gagnée avec un trophée (profil.js)
  champion: ["Bague de champion", "#E9C046", "radial-gradient(circle,#fff 12%,#1F4FB8 16% 34%,#E9C046 38%)", { type: "champion", metal: "or" }] };
// La couleur de la main (gant ou peau), pour les dessins qui en ont besoin (confettis…).
export const couleurMain = a => a.gant === "nu" ? (PEAUX[a.peau] || PEAUX.neutre)[1] : (GANTS[a.gant] || GANTS.blanc)[1];
export const SYMBOLES = { pierre: "✊ Pierre", feuille: "✋ Feuille", ciseaux: "✌️ Ciseaux" };
export const MOTIFS = { uni: "Uni", rayures: "Rayures", etoile: "Étoile", eclair: "Éclair" };
// Le motif du gant (la seconde couleur est celle du poignet).
// La couleur du motif du gant (10 novembre, demande du porteur du projet) : « Par défaut », la couleur habituelle (celle du poignet
// pour les rayures, les pois, le bicolore et le damier ; l'or des signes, le rose des cœurs, le jaune des étoiles), ou une couleur au choix.
export const MOTIF_COULEURS = { defaut: ["Par défaut (comme le poignet)", null, "repeating-linear-gradient(45deg,#C9CED6 0 5px,#5B6270 5px 10px)"],
  blanc: ["Blanc", "#F5F7FA"], noir: ["Noir", "#23262B"], rouge: ["Rouge", "#D63A2F"], bleu: ["Bleu", "#2C6FD1"], ciel: ["Bleu ciel", "#4DA3FF"],
  vert: ["Vert", "#2E9E5B"], jaune: ["Jaune", "#F4C542"], or: ["Or", "#E9C046"], orange: ["Orange", "#F28C28"], rose: ["Rose", "#F28DB2"], violet: ["Violet", "#9B6BD6"] };
// Les motifs qui ont une couleur à choisir.
export const MOTIFS_COLORABLES = new Set(["rayures", "pois", "bicolore", "damier", "coeurs", "etoiles", "signe_pierre", "signe_feuille", "signe_ciseaux"]);
export const MOTIFS_GANT = { uni: "Uni", rayures: "Rayé", pois: "À pois", bicolore: "Bicolore", coutures: "Coutures dorées", bandeau: "Bandeau de champion",
  damier: "Damier", flammes: "Flammes", tigre: "Tigré", zebre: "Zébré", vache: "Vache", girafe: "Girafe", leopard: "Léopard", coeurs: "Cœurs", etoiles: "Étoiles", camouflage: "Camouflage", carbone: "Carbone", lauriers: "Lauriers", signe_pierre: "Pierre", signe_feuille: "Feuille", signe_ciseaux: "Ciseaux", club: "Club HandSlam" };
export const PAYS = [["🇫🇷", "France"], ["🇧🇪", "Belgique"], ["🇨🇭", "Suisse"], ["🇨🇦", "Canada"], ["🇱🇺", "Luxembourg"], ["🇲🇦", "Maroc"], ["🇩🇿", "Algérie"], ["🇹🇳", "Tunisie"], ["🇸🇳", "Sénégal"], ["🇨🇮", "Côte d'Ivoire"], ["🇪🇸", "Espagne"], ["🇮🇹", "Italie"], ["🇩🇪", "Allemagne"], ["🇬🇧", "Royaume-Uni"], ["🇺🇸", "États-Unis"], ["🇧🇷", "Brésil"], ["🇯🇵", "Japon"], ["🌍", "Autre"]];

// Le symbole de l'appli (icons/icon.svg : la main en V dans le médaillon), centré en (cx, cy), de rayon r.
export function symboleHandSlam(cx, cy, r, { anneau = true } = {}) {
  const k = r / 182, tx = cx - 256 * k, ty = cy - 256 * k;
  return `<g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${k.toFixed(4)})"><circle cx="256" cy="256" r="182" fill="#0F3D2B"/>${anneau ? `<circle cx="256" cy="256" r="178" fill="none" stroke="#C9A24A" stroke-width="5"/>` : ""}<circle cx="256" cy="256" r="150" fill="#F5EFE0" stroke="#C9A24A" stroke-width="12"/><g transform="translate(166 125) scale(1.75)"><g stroke="#0F3D2B" stroke-width="3.6" stroke-linejoin="round" fill="#FFFFFF"><rect x="27" y="4" width="16" height="64" rx="8" transform="rotate(-11 35 64)"/><rect x="45" y="0" width="16" height="66" rx="8" transform="rotate(7 53 64)"/><rect x="22" y="50" width="62" height="54" rx="17"/><rect x="59" y="47" width="13" height="24" rx="6.5"/><rect x="71" y="52" width="12" height="20" rx="6"/><rect x="12" y="66" width="44" height="15" rx="7.5" transform="rotate(-18 34 74)"/><path d="M28 100h50v26H28z"/><path d="M28 106h50v5H28z" fill="#0F3D2B" stroke="none"/><path d="M28 115h50v5H28z" fill="#C9A24A" stroke="none"/></g></g></g>`;
}
// Le chaton d'une bague (la chevalière HandSlam : le symbole de l'appli), centré en (cx, cy).
function chaton(type, cx, cy) {
  if (type === "symbole") return `<circle cx="${cx}" cy="${cy}" r="4.3" fill="#E9C046" stroke="#8A6A12" stroke-width=".6"/>` + symboleHandSlam(cx, cy, 3.6, { anneau: false });
  return "";
}

// Les petits signes dorés des gants « Pierre », « Feuille », « Ciseaux », dessinés dans une case de 10 × 10. Le signe du gant ne dépend
// pas du signe que montre la main (un gant « Ciseaux » peut montrer la feuille).
const OR_SIGNE = "#E9C046";
const ICONES_SIGNE = {
  pierre: (fond, c) => `<rect x="1" y="2" width="8" height="6.5" rx="2.2" fill="${c}"/><path d="M3.3 3 V5.2 M5 3 V5.2 M6.7 3 V5.2" stroke="${fond}" stroke-width=".7"/>`,
  feuille: (fond, c) => `<rect x="2" y="5" width="6.5" height="4.5" rx="1.5" fill="${c}"/>${[2, 3.7, 5.4, 7.1].map((x, i) => `<rect x="${x}" y="${[1.2, .5, .9, 1.9][i]}" width="1.4" height="5" rx=".7" fill="${c}"/>`).join("")}`,
  ciseaux: (fond, c) => `<rect x="2.5" y="5.5" width="5.5" height="4" rx="1.4" fill="${c}"/><path d="M4 6 L2.7 .9 M6.6 6 L7.9 .9" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/>`,
};
const icone = (signe, fond, x, y, k = 1, c = OR_SIGNE) => `<g transform="translate(${x} ${y}) scale(${k})">${ICONES_SIGNE[signe](fond, c)}</g>`;
// Un seul signe, en quinconce sur tout le gant.
const motifUnSigne = (id, signe, gant, c = OR_SIGNE) => `<pattern id="${id}g" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="${gant}"/>${icone(signe, gant, .5, .5, 1, c)}${icone(signe, gant, 11.5, 11.5, 1, c)}</pattern>`;

let n = 0;
function dessinerMain(a, fill, ink, nue) {
  const tordu = a.degats?.tordu || 0;
  if (nue) return mainNue(a.symbole, (PEAUX[a.peau] || PEAUX.neutre)[1], (ONGLES[a.ongles] || [])[1] || null, (BAGUES[a.bague] || [])[3] || null, a.bague, tordu);
  return main(a.symbole, fill, ink, tordu);
}

// ---------------------------------------------------------------- les marques du smash (degats.js ; 12 novembre)
// Par-dessus la main : le gant déchiré (ou un pansement sur la main nue) et la fissure du poing. (Les lames tordues, elles,
// changent le dessin des doigts : voir main et mainNue.) Un trait clair sous chaque trait sombre, pour les gants foncés.
const trait = (d, w = 1.3) => `<path d="${d}" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="${w + 1.4}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="rgba(30,15,10,.75)" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const ACCROC = [
  "M41 57 L44.5 53 L47.5 56.5 L51 51.5 L54 55.5 L58.5 53 L57.5 58 L60 61 L55.5 60.5 L51.5 64 L48 60 L43.5 62.5 Z",
  "M53 45 L56 42.5 L58.5 45.5 L62 43 L63.5 47 L61 49.5 L57.5 48.5 L54.5 50 Z",
];
export function marquesSVG(symbole, degats, nue) {
  if (!degats) return "";
  let s = "";
  const d = Math.min(2, degats.dechire || 0);
  if (d && nue) {   // la main nue : un pansement (deux en croix au 2e smash)
    s += [-18, 22].slice(0, d).map(rot => `<g transform="rotate(${rot} 50 60)"><rect x="38" y="56" width="24" height="8" rx="3.5" fill="#F1CF9E" stroke="rgba(90,55,20,.45)" stroke-width=".9"/>
      <rect x="45.5" y="57.2" width="9" height="5.6" rx="1.4" fill="#FBEBD2"/>${[40.5, 42.5, 57.5, 59.5].map(x => `<circle cx="${x}" cy="60" r=".55" fill="rgba(90,55,20,.4)"/>`).join("")}</g>`).join("");
  } else if (d) {   // le gant déchiré : un accroc (la peau dessous), ses fils qui dépassent
    s += ACCROC.slice(0, d).map(p => `<path d="${p}" fill="#E7B48C" stroke="rgba(30,15,10,.7)" stroke-width="1.1" stroke-linejoin="round"/>`).join("");
    s += trait("M43.5 62.5 l-1.5 3 M51.5 64 l.5 3.2 M58.5 53 l2 -2.5", .9) + (d > 1 ? trait("M62 43 l2.2 -2 M54.5 50 l-1.8 2", .9) : "");
  }
  const f = Math.min(2, degats.fissure || 0);
  if (f) {   // la fissure sur le dos de la main, depuis un petit creux : sur tous les signes (12 novembre, remarque du porteur du projet)
    s += `<ellipse cx="55" cy="56" rx="${3 + f}" ry="${2.2 + f * .7}" fill="rgba(30,15,10,.4)" stroke="rgba(255,255,255,.35)" stroke-width=".8"/>`;
    s += trait("M55 56 L51 53 L48 54 L45 50 M55 56 L59.5 60 L60.5 64 L64.5 67 M55 56 L58 50.5 L62 49.5");
    if (f > 1) s += trait("M45 50 L41 49 L38.5 45 M60.5 64 L58 70 M62 49.5 L66 45 L68.5 46 M51 53 L50.5 47 L47.5 43.5");
  }
  return s;
}

// ---------------------------------------------------------------- la vraie main (main nue), style « cartoon fin »
// Des doigts fins de longueurs différentes, des ongles, les plis des articulations, un vrai poignet ;
// le contour est la couleur de la peau, en plus foncé.
const rvb = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const melange = (a, b, t) => "#" + rvb(a).map((v, i) => Math.round(v + (rvb(b)[i] - v) * t).toString(16).padStart(2, "0")).join("");
function mainNue(symbole, peau, vernis, bague, cleBague, tordu = 0) {
  const tr = melange(peau, "#2a1608", .45), ongle = vernis || melange(melange(peau, "#ffffff", .55), "#F3B7B0", .35), T = 1.4;
  const anneau = (x, y, w) => bague ? bagueSVG(bague, x - .6, y, w + 1.2, 4, cleBague === "symbole" ? (cx, cy) => chaton("symbole", cx, cy) : null) : "";
  // un doigt tendu, de sa base (bx, by) vers le haut, longueur L, tourné de rot degrés ; avecBague : la bague à sa base
  const doigt = (bx, by, L, rot, { avecBague = false, sansOngle = false } = {}) => `<g transform="rotate(${rot} ${bx} ${by})">
    <path d="M${bx - 4.5} ${by} L${bx - 4.5} ${by - L + 4.5} A4.5 4.5 0 0 1 ${bx + 4.5} ${by - L + 4.5} L${bx + 4.5} ${by} Z" fill="${peau}" stroke="${tr}" stroke-width="${T}" stroke-linejoin="round"/>
    ${sansOngle ? "" : `<rect x="${bx - 2.9}" y="${by - L + 1.6}" width="5.8" height="${Math.min(7, L * .2)}" rx="2.7" fill="${ongle}"/>`}
    <path d="M${bx - 2.9} ${by - L * .42} q2.9 1.6 5.8 0" fill="none" stroke="${tr}" stroke-width=".8" stroke-linecap="round" opacity=".55"/>
    ${avecBague ? anneau(bx - 4.5, by - 12 - Math.max(0, by - 50) * 3, 9) : ""}</g>`;   // (un peu plus haut si la base du doigt est cachée par la paume)
  // la paume (ou le dos de la main) et le poignet, jusqu'en bas
  const paume = (y0, pli = true) => `<path d="M28 ${y0 + 6} Q28 ${y0} 34 ${y0} L66 ${y0} Q72 ${y0} 72 ${y0 + 6} L71 72 Q69 81 61 83 L61 100 L39 100 L39 83 Q31 81 29 72 Z" fill="${peau}" stroke="${tr}" stroke-width="${T}" stroke-linejoin="round"/>
    ${pli ? `<path d="M40 76 q10 4 20 0" fill="none" stroke="${tr}" stroke-width=".85" stroke-linecap="round" opacity=".45"/>` : ""}`;
  // un doigt replié vu de face (ou une jointure vue de dos)
  const replie = (x, y, w, h, { avecBague = false, pli = true } = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2.2}" fill="${peau}" stroke="${tr}" stroke-width="${T}"/>
    ${pli ? `<path d="M${x + 2} ${y + h * .55} q${w / 2 - 2} 1.5 ${w - 4} 0" fill="none" stroke="${tr}" stroke-width=".8" opacity=".5" stroke-linecap="round"/>` : ""}
    ${avecBague ? anneau(x, y + h - 9.5, w) : ""}`;
  const tendons = `<g stroke="${tr}" stroke-width=".8" stroke-linecap="round" opacity=".3" fill="none">${[0, 1, 2].map(i => `<path d="M${40 + i * 10} 50 l-${1 + i} 15"/>`).join("")}</g>`;
  if (symbole === "feuille") return doigt(33, 70, 27, -52) + paume(46) + doigt(33.5, 52, 30, -6) + doigt(44, 50, 36, -2, { avecBague: true }) + doigt(54.5, 50, 34, 2) + doigt(64.5, 53, 26, 7);
  if (symbole === "feuille-dos") return doigt(33, 52, 30, -14) + doigt(43.5, 50, 35, -5, { avecBague: true }) + doigt(54, 50, 34, 5) + doigt(64, 53, 27, 14) + paume(46, false) + tendons;
  // les ciseaux : toujours vus de dos (choix du porteur du projet), l'annulaire et l'auriculaire repliés restent cachés derrière la main
  // (les lames tordues : la base du doigt dans l'axe, le bout plié de travers ; degats.js)
  const plie = (bx, by, L, rot, pli, opts = {}) => `<g transform="rotate(${rot} ${bx} ${by})">${doigt(bx, by, L * .68, 0, { ...opts, sansOngle: true })}<g transform="rotate(${pli} ${bx} ${by - L * .62})">${doigt(bx, by - L * .62 + 3, L * .42 + 3, 0)}</g></g>`;
  if ((symbole === "ciseaux" || symbole === "ciseaux-dos") && tordu) return doigt(30, 70, 18, -25, { sansOngle: true }) + plie(37, 52, 38, -14, PLI.sens * (18 + 14 * tordu), { avecBague: true }) + plie(50, 50, 40, 9, -PLI.sens * (16 + 14 * tordu)) + paume(46, false) + tendons;
  if (symbole === "ciseaux" || symbole === "ciseaux-dos") return doigt(30, 70, 18, -25, { sansOngle: true }) + doigt(37, 52, 38, -14, { avecBague: true }) + doigt(50, 50, 40, 9) + paume(46, false) + tendons;
  if (symbole === "index") return doigt(41, 50, 40, -4, { avecBague: true }) + paume(46) + replie(46.5, 42, 9.5, 18) + replie(55.5, 43, 9, 17) + replie(64.5, 46, 8, 15) + doigt(33, 66, 26, 74);
  if (symbole === "dos") return doigt(29, 68, 20, -20, { sansOngle: true }) + paume(42, false) + [29, 39.5, 50, 60.5].map((x, i) => replie(x, [36, 34, 35, 37][i], 10.5, 14, { pli: false, avecBague: i === 2 })).join("") + tendons;
  const poing = paume(42) + [29, 39.5, 50, 60.5].map((x, i) => replie(x, [38, 35, 36, 39][i], 10.5, 22, { avecBague: i === 2 })).join("");
  if (symbole === "pouce") return poing + doigt(33, 50, 30, -10);
  return poing + doigt(31, 61, 28, 80);   // pierre : le pouce replié devant les doigts
}
// La bague sur un gant : sur le doigt du milieu, à sa base (là où il sort de la paume), selon la forme de la main ;
// pour les ciseaux, sur l'index (9 novembre, demande du porteur du projet : sur le majeur, elle chevauchait les doigts repliés).
// (Sur la main nue, elle est dessinée avec la main : voir mainNue.)
const PLACE_MEDAILLON = { pierre: [50, 69, 6.6], ciseaux: [50, 69, 6.6], feuille: [50, 62, 10], "feuille-dos": [50, 61, 10], "ciseaux-dos": [52, 60, 10], dos: [50, 60, 10], index: [52, 69.5, 6.2], pouce: [45, 61, 8] };
// (10 novembre, demande du porteur du projet : la bague remontée sur le doigt, elle était à la jointure avec la paume)
const PLACE_BAGUE = { feuille: [50.5, 34], index: [29.5, 33], pouce: [43, 57.5], dos: [50, 30.5], "ciseaux-dos": [30.75, 32.5, "-12 36 50"], "feuille-dos": [50.5, 33, "7 55 54"], ciseaux: [30.75, 29.5, "-14 36 50"], pierre: [50, 35.5] };
function accessoires(a, nue = false) {
  let s = "";
  const yb = nue ? 84 : 67;   // le bracelet : au poignet (plus bas sur la main nue, juste au-dessus du bandeau)
  const br = (BRACELETS[a.bracelet] || [])[3];
  if (br) s += braceletSVG(br, nue ? 37.5 : 35.5, yb, nue ? 25 : 29, BRACELETS_COLORABLES.has(a.bracelet) ? (MOTIF_COULEURS[a.braceletCouleur] || [])[1] || null : null);
  const bg = (BAGUES[a.bague] || [])[3];
  if (bg && !nue) {
    const [x, y, rot] = PLACE_BAGUE[a.symbole] || PLACE_BAGUE.pierre;
    s += `<g${rot ? ` transform="rotate(${rot})"` : ""}>${bagueSVG(bg, x - .5, y, 11.5, 4.2, a.bague === "symbole" ? (cx, cy) => chaton("symbole", cx, cy) : null)}</g>`;
  }
  return s;
}
// Le dossard du tenant du titre : centré en (x, y), de taille r (comme le médaillon du gant « Club »).
// Le prestige du Dossard 1 (aperçus du 12 novembre) : coutures d'or, liseré d'or autour du dossard, reflet brillant.
export const PRESTIGE = { coutures: true, lisere: true, reflet: false };
export function dossardSVG(x, y, r) {
  const k = r / 10, w = 19, h = 16;
  const epingle = (ex, ey) => `<circle cx="${ex}" cy="${ey}" r="1.15" fill="#B9C0CB" stroke="#6C7480" stroke-width=".5"/>`;
  return `<g transform="translate(${x} ${y}) scale(${k})">
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="1.6" fill="#FFFFFF" stroke="${PRESTIGE.lisere ? "#C9971C" : "rgba(0,0,0,.35)"}" stroke-width="${PRESTIGE.lisere ? 1.6 : .9}"/>
    <rect x="${-w / 2 + 1.4}" y="${-h / 2 + 1.4}" width="${w - 2.8}" height="2" fill="#E8574A" opacity=".85"/>
    <path d="M-1.4 -4.6 L1.9 -4.6 L1.9 4.6 L-1.4 4.6 Z M-1.4 -4.6 L-4.3 -2.1 L-3.4 -0.8 L-1.4 -2.4 Z M-3.6 4.6 L4.1 4.6 L4.1 6 L-3.6 6 Z" transform="translate(0 -0.4)" fill="#16181D"/>
    ${epingle(-w / 2 + 1.8, -h / 2 + 1.6)}${epingle(w / 2 - 1.8, -h / 2 + 1.6)}${epingle(-w / 2 + 1.8, h / 2 - 1.6)}${epingle(w / 2 - 1.8, h / 2 - 1.6)}
  </g>`;
}

// sansFond : seulement le gant et le poignet (le poing qui se secoue pendant un coup).
export function avatarSVG(a) {
  const fond = (FONDS[a.fond] || FONDS.court)[1], nue = a.gant === "nu", gant = couleurMain(a), poignet = (POIGNETS[a.poignet] || POIGNETS.rouge)[1];
  const cle = a.poignet in POIGNETS ? a.poignet : "rouge";
  const id = "av" + (++n), ink = "rgba(0,0,0,.22)", gm = nue ? "uni" : a.gantMotif;
  const mc = (MOTIF_COULEURS[a.gantMotifCouleur] || [])[1] || null;   // la couleur du motif choisie (sinon : la couleur habituelle)
  const brode = !nue && BRODERIES[a.brode];   // (le pseudo brodé sur le poignet : gants-brodes.js ; pas sur la main nue)   // (pas de motif de gant sur la peau)
  // Gant rayé, à pois ou bicolore : on le remplit avec un motif SVG.
  const remplissage = {
    rayures: `<pattern id="${id}g" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="8" height="8" fill="${gant}"/><rect width="3" height="8" fill="${mc || poignet}"/></pattern>`,
    pois: `<pattern id="${id}g" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="${gant}"/><circle cx="4.5" cy="4.5" r="1.9" fill="${mc || poignet}"/></pattern>`,
    bicolore: `<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="0"><stop offset=".5" stop-color="${gant}"/><stop offset=".5" stop-color="${mc || poignet}"/></linearGradient>`,
    damier: `<pattern id="${id}g" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${gant}"/><rect width="5" height="5" fill="${mc || poignet}"/><rect x="5" y="5" width="5" height="5" fill="${mc || poignet}"/></pattern>`,
    flammes: `<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="0" y1="80" x2="0" y2="10"><stop offset="0" stop-color="#E8574A"/><stop offset=".45" stop-color="#F28C28"/><stop offset=".75" stop-color="#F4C542"/><stop offset="1" stop-color="${gant}"/></linearGradient>`,
    tigre: `<pattern id="${id}g" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)"><rect width="12" height="12" fill="#F28C28"/><path d="M0 2 Q6 5 12 2 M0 8 Q6 11 12 8" stroke="#2B1D10" stroke-width="2" fill="none"/></pattern>`,
    zebre: `<pattern id="${id}g" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(25)"><rect width="12" height="12" fill="#F5F7FA"/><path d="M0 3 Q6 6 12 3 M0 9 Q6 12 12 9" stroke="#1E2024" stroke-width="2.6" fill="none"/></pattern>`,
    // (12 novembre, demande du porteur du projet : vache, girafe et léopard)
    vache: `<pattern id="${id}g" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="#FAFAF7"/><path d="M3 4 C9 -1 19 2 20 8 C21 14 15 19 9 17 C5 16 6 12 2 11 C-1 9 0 6 3 4 Z" fill="#1E1E22"/><path d="M27 22 C33 18 43 21 44 28 C45 35 38 41 31 38 C27 36 29 32 25 30 C22 28 23 24 27 22 Z" fill="#1E1E22"/><path d="M4 29 C8 26 14 28 14 33 C14 37 9 40 5 38 C2 37 1 32 4 29 Z" fill="#1E1E22"/><path d="M30 2 C34 0 38 2 37 6 C36 9 32 10 30 8 C28 6 28 4 30 2 Z" fill="#1E1E22"/></pattern>`,
    girafe: `<pattern id="${id}g" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="#F3DFAF"/><path d="M1.5 2 L10 1 L13 6 L11.5 12 L3 13 L0.5 8 Z" fill="#B8692A"/><path d="M15.5 1.5 L25 2.5 L28.5 8 L25 14 L17 13 L14.5 7 Z" fill="#A55A22"/><path d="M2 16 L9.5 15.5 L14 20 L12 28 L4 28.5 L1 22 Z" fill="#A55A22"/><path d="M16.5 16.5 L24 16 L28.5 21.5 L26.5 28.5 L18 28 L15 22.5 Z" fill="#B8692A"/></pattern>`,
    leopard: `<pattern id="${id}g" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#E2A74B"/><path d="M2.2 4.2 a2.6 2.3 0 1 1 4.6 1.4" fill="none" stroke="#2E2014" stroke-width="1.5" stroke-linecap="round"/><circle cx="4.6" cy="4.6" r="1.1" fill="#B86F22"/><path d="M10 11.5 a2.6 2.3 0 1 0 4.4 -1.8" fill="none" stroke="#2E2014" stroke-width="1.5" stroke-linecap="round"/><circle cx="12.2" cy="11" r="1.1" fill="#B86F22"/><circle cx="12.5" cy="3" r="1" fill="#2E2014"/><circle cx="3.5" cy="12.5" r=".9" fill="#2E2014"/></pattern>`,
    coeurs: `<pattern id="${id}g" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="${gant}"/><path d="M6 9 L2.6 5.6 A1.8 1.8 0 0 1 6 3.4 A1.8 1.8 0 0 1 9.4 5.6 Z" fill="${mc || "#E8395E"}"/></pattern>`,
    etoiles: `<pattern id="${id}g" width="13" height="13" patternUnits="userSpaceOnUse"><rect width="13" height="13" fill="${gant}"/><path d="M6.5 2 L7.7 5.3 L11 5.4 L8.4 7.4 L9.3 10.6 L6.5 8.7 L3.7 10.6 L4.6 7.4 L2 5.4 L5.3 5.3 Z" fill="${mc || "#FFD34D"}"/></pattern>`,
    camouflage: `<pattern id="${id}g" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#6B7B4A"/><circle cx="6" cy="6" r="5" fill="#4A5632"/><circle cx="16" cy="14" r="6" fill="#8E9A63"/><circle cx="4" cy="18" r="3.5" fill="#3B2F22"/></pattern>`,
    lauriers: `<pattern id="${id}g" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(20)"><rect width="12" height="12" fill="${gant}"/><path d="M6 1 V11" stroke="#B08A1E" stroke-width=".8"/><ellipse cx="4.3" cy="4" rx="1.3" ry="2.6" fill="#E9C046" transform="rotate(-35 4.3 4)"/><ellipse cx="7.7" cy="4" rx="1.3" ry="2.6" fill="#E9C046" transform="rotate(35 7.7 4)"/><ellipse cx="4.3" cy="8.5" rx="1.3" ry="2.6" fill="#E9C046" transform="rotate(-35 4.3 8.5)"/><ellipse cx="7.7" cy="8.5" rx="1.3" ry="2.6" fill="#E9C046" transform="rotate(35 7.7 8.5)"/></pattern>`,
    carbone: `<pattern id="${id}g" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#26292E"/><rect width="3" height="3" fill="#3A3E45"/><rect x="3" y="3" width="3" height="3" fill="#3A3E45"/></pattern>`,
    signe_pierre: motifUnSigne(id, "pierre", gant, mc || OR_SIGNE), signe_feuille: motifUnSigne(id, "feuille", gant, mc || OR_SIGNE), signe_ciseaux: motifUnSigne(id, "ciseaux", gant, mc || OR_SIGNE),
    club: `<pattern id="${id}g" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#14533A"/></pattern>`,
  }[gm] || (a.gant === "elite" ? `<linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3A3358"/><stop offset="1" stop-color="#14121F"/></linearGradient>` : "");
  // Poignets et fonds spéciaux (boutique).
  const poignetDef = {
    tricolore: `<linearGradient id="${id}p" x1="0" x2="1"><stop offset=".33" stop-color="#2C5CC5"/><stop offset=".33" stop-color="#F5F7FA"/><stop offset=".66" stop-color="#F5F7FA"/><stop offset=".66" stop-color="#E1342B"/></linearGradient>`,
    arcenciel: `<linearGradient id="${id}p" x1="0" x2="1"><stop offset="0" stop-color="#E8574A"/><stop offset=".25" stop-color="#F4C542"/><stop offset=".5" stop-color="#6BD49A"/><stop offset=".75" stop-color="#4DA3FF"/><stop offset="1" stop-color="#9B6BD6"/></linearGradient>`,
    club: `<pattern id="${id}p" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="#14533A"/><rect y="75" width="100" height="2.2" fill="#E9C046"/><rect y="82.8" width="100" height="2.2" fill="#E9C046"/></pattern>`,
    an2026: `<pattern id="${id}p" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="#E0B12A"/>${[41.5, 50, 58.5].map(x => `<path transform="translate(${x} 80) scale(.85)" d="M0 -5 L1.5 -1.5 L5 -1.5 L2.2 0.8 L3.2 4.5 L0 2.3 L-3.2 4.5 L-2.2 0.8 L-5 -1.5 L-1.5 -1.5 Z" fill="#5A3E06"/>`).join("")}</pattern>`,
    leopard: `<pattern id="${id}p" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#E2A74B"/><circle cx="2.5" cy="2.5" r="1.6" fill="#3A2A1A"/><circle cx="6" cy="6" r="1.4" fill="#3A2A1A"/></pattern>`,
    braise: `<linearGradient id="${id}p" x1="0" x2="1"><stop offset="0" stop-color="#7A1F12"/><stop offset=".3" stop-color="#E8572A"/><stop offset=".5" stop-color="#F4A93B"/><stop offset=".7" stop-color="#E8572A"/><stop offset="1" stop-color="#7A1F12"/></linearGradient>`,
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
  // Les tribunes : le public tout autour (des têtes de toutes les couleurs), la main au milieu.
  if (a.fond === "tribunes") decorFond = `<g clip-path="url(#${id})">${[...Array(42)].map((_, i) => { const r = i < 24 ? 44 : 36, a = (i < 24 ? i / 24 : (i - 24) / 18) * Math.PI * 2 + (i < 24 ? 0 : 0.17); return `<circle cx="${(50 + r * Math.cos(a)).toFixed(1)}" cy="${(50 + r * Math.sin(a)).toFixed(1)}" r="3.4" fill="${["#E8574A", "#F4C542", "#F5F7FA", "#4DA3FF", "#6BD49A", "#F28DB2"][i % 6]}" opacity=".75"/>`; }).join("")}</g>`;
  if (a.fond === "stade") decorFond = `<g clip-path="url(#${id})" fill="#FFF6C8" opacity=".25"><path d="M10 0 L40 100 L30 100 Z"/><path d="M90 0 L60 100 L70 100 Z"/></g>`;
  const fillGant = remplissage ? `url(#${id}g)` : gant;
  let deco = "";
  if (gm === "coutures") deco = `<g stroke-dasharray="2.2 2" transform="translate(50 52) scale(.84) translate(-50 -52)">${main(a.symbole, "none", "#E7C04A")}</g>`;
  if (a.gant === "elite" && gm !== "coutures") deco = `<g stroke-dasharray="2.2 2" transform="translate(50 52) scale(.84) translate(-50 -52)">${main(a.symbole, "none", "#E9C046")}</g>`;   // le gant de l'Élite : noir, coutures d'or
  // Le Dossard 1 : un dossard blanc épinglé (quatre épingles) avec un gros « 1 » noir, sur le dos de la main (ou la paume).
  if (a.gant === "dossard") deco = (PRESTIGE.coutures && gm !== "coutures" ? `<g stroke-dasharray="2.2 2" transform="translate(50 52) scale(.84) translate(-50 -52)">${main(a.symbole, "none", "#B8860B")}</g>` : "")
    + (PRESTIGE.reflet ? `<g opacity=".38" style="mix-blend-mode:screen">${main(a.symbole, `url(#${id}r)`, "none")}</g>` : "")
    + dossardSVG(...(PLACE_MEDAILLON[a.symbole] || PLACE_MEDAILLON.pierre));
  // Le gant « Club » : le symbole de l'appli cousu au milieu de la paume (ou du dos de la main), à l'écart des doigts et du pouce.
  if (gm === "club") { const [x, y, r] = PLACE_MEDAILLON[a.symbole] || PLACE_MEDAILLON.pierre; deco = symboleHandSlam(x, y, r); }
  if (gm === "bandeau") deco = `<rect x="28" y="64" width="44" height="7" rx="2" fill="#E0B12A" stroke="${ink}" stroke-width="1.5"/><rect x="28" y="67" width="44" height="1.4" fill="rgba(255,255,255,.7)"/>`;
  let motif = "";
  if (a.motif === "rayures") motif = `<g clip-path="url(#${id})" opacity=".16">${[...Array(9)].map((_, i) => `<rect x="${i * 16 - 40}" y="-10" width="7" height="140" fill="#fff" transform="rotate(30 50 50)"/>`).join("")}</g>`;
  if (a.motif === "etoile") motif = `<path d="M50 6 L61 38 L95 38 L67 58 L78 92 L50 71 L22 92 L33 58 L5 38 L39 38 Z" fill="#fff" opacity=".14"/>`;
  if (a.motif === "eclair") motif = `<path d="M60 2 L28 54 L48 54 L36 98 L76 40 L54 40 L68 2 Z" fill="#fff" opacity=".16"/>`;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"${a.fantome ? ' opacity=".55"' : ""}>
    <defs><clipPath id="${id}"><circle cx="50" cy="50" r="48"/></clipPath>${remplissage}${poignetDef}${fondDef}${a.gant === "dossard" ? `<linearGradient id="${id}r" gradientUnits="userSpaceOnUse" x1="25" y1="15" x2="70" y2="75"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="#fff" stop-opacity=".15"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset=".62" stop-color="#fff" stop-opacity="0"/></linearGradient>` : ""}</defs>
    ${a.sansFond ? "" : `<circle cx="50" cy="50" r="48" fill="${fillFond}"/>${decorFond}${motif}
    <circle cx="50" cy="50" r="46.5" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3"/>`}
    ${nue ? "" : brode ? `<rect x="31" y="70" width="38" height="20" rx="3" fill="${fillPoignet}" stroke="${ink}" stroke-width="1.5"/>
    <rect x="32" y="71.6" width="36" height="1.6" rx=".8" fill="rgba(255,255,255,.45)"/>` : `<rect x="37" y="72" width="26" height="16" rx="3" fill="${fillPoignet}" stroke="${ink}" stroke-width="1.5"/>
    ${cle === "club" || cle === "an2026" ? "" : `<rect x="37" y="78" width="26" height="3" fill="rgba(255,255,255,.55)"/>`}`}
    ${nue ? `<g${a.sansFond ? "" : ` clip-path="url(#${id})"`}>` : ""}${dessinerMain(a, fillGant, ink, nue)}${deco}${accessoires(a, nue)}${marquesSVG(a.symbole, a.degats, nue)}${nue ? "</g>" : ""}${brode ? broderieSVG(brode, id) : ""}
  </svg>`;
}

const doigt = (x, y, h, gant, ink, rot = "") => `<rect x="${x}" y="${y}" width="10.5" height="${h}" rx="5.2" fill="${gant}" stroke="${ink}" stroke-width="1.5"${rot ? ` transform="rotate(${rot})"` : ""}/>`;
const paume = (y, gant, ink) => `<rect x="29" y="${y}" width="42" height="${76 - y}" rx="11" fill="${gant}" stroke="${ink}" stroke-width="1.5"/>`;
// Vu de dos : l'ongle au bout d'un doigt, et les tendons sur le dos de la main.
const ongle = (x, y, ink, rot = "") => `<rect x="${x + 2.6}" y="${y}" width="5.3" height="5.5" rx="2.4" fill="none" stroke="${ink}" stroke-width="1.1" opacity=".5"${rot ? ` transform="rotate(${rot})"` : ""}/>`;
const dosDeMain = ink => [0, 1, 2].map(i => `<path d="M${39.5 + i * 10.5} 50 l-${1 + i} 15" fill="none" stroke="${ink}" stroke-width="1.1" stroke-linecap="round" opacity=".28"/>`).join("");
const pouce = (gant, ink) => `<rect x="25" y="50" width="28" height="12" rx="6" fill="${gant}" stroke="${ink}" stroke-width="1.5"/>`;

// Le sens du pli des lames tordues : -1, les bouts partent vers l'extérieur (version B, choisie par le porteur du projet
// le 12 novembre) ; 1, ils se croisent.
export const PLI = { sens: -1 };
// Un doigt du V plié de travers (les lames tordues) : la base dans l'axe, le bout tourné de « pli » degrés à mi-hauteur.
// (le pli aux deux tiers de la hauteur, et le bout un peu rallongé : le doigt garde sa longueur ; 12 novembre)
function lameTordue(x, y, h, gant, ink, rot, pli) {
  const mi = y + h * .38, y0 = y - 3;
  return `<g transform="rotate(${rot})"><rect x="${x}" y="${mi}" width="10.5" height="${y + h - mi}" rx="5.2" fill="${gant}" stroke="${ink}" stroke-width="1.5"/>
    <g transform="rotate(${pli} ${x + 5.25} ${mi + 2})"><rect x="${x}" y="${y0}" width="10.5" height="${mi - y0 + 4}" rx="5.2" fill="${gant}" stroke="${ink}" stroke-width="1.5"/>${ongle(x, y0 + 1.5, ink)}</g>
    <path d="M${x + 1.5} ${mi + 3} l7.5 -1.5" stroke="${ink}" stroke-width="1.2" stroke-linecap="round" opacity=".7"/></g>`;
}

function main(symbole, gant, ink, tordu = 0) {
  if (symbole === "feuille") return `
    ${doigt(29.5, 20, 34, gant, ink)}${doigt(40, 12, 40, gant, ink)}${doigt(50.5, 14, 38, gant, ink)}${doigt(61, 22, 32, gant, ink)}
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
  // Le poing vu de dos (la pierre pendant un match) : les jointures en haut, le dos de la main, le pouce sur le côté.
  if (symbole === "dos") return `
    <rect x="22" y="42" width="13" height="22" rx="6.5" fill="${gant}" stroke="${ink}" stroke-width="1.5"/>
    ${[0, 1, 2, 3].map(i => `<rect x="${29 + i * 10.5}" y="${30 + (i === 0 || i === 3 ? 3 : 0)}" width="10.5" height="16" rx="5.2" fill="${gant}" stroke="${ink}" stroke-width="1.5"/>`).join("")}
    <rect x="29" y="39" width="42" height="37" rx="11" fill="${gant}" stroke="${ink}" stroke-width="1.5"/>
    ${[0, 1, 2, 3].map(i => `<path d="M${31.5 + i * 10.5} 41 q2.75 -2.6 5.5 0" fill="none" stroke="${ink}" stroke-width="1.3" stroke-linecap="round" opacity=".6"/>`).join("")}
    ${[0, 1, 2].map(i => `<path d="M${39.5 + i * 10.5} 48 l-${1 + i} 16" fill="none" stroke="${ink}" stroke-width="1.1" stroke-linecap="round" opacity=".28"/>`).join("")}`;
  // Les ciseaux vus de dos : le V, l'annulaire et l'auriculaire repliés (leurs jointures), le pouce rangé sur le côté.
  if (symbole === "ciseaux-dos") return `
    <rect x="22" y="44" width="13" height="20" rx="6.5" fill="${gant}" stroke="${ink}" stroke-width="1.5"/>
    ${tordu ? lameTordue(31, 19, 31, gant, ink, "-12 36 50", PLI.sens * (18 + 14 * tordu)) + lameTordue(44, 18, 32, gant, ink, "10 49 50", -PLI.sens * (16 + 14 * tordu))
    : doigt(31, 19, 31, gant, ink, "-12 36 50") + doigt(44, 18, 32, gant, ink, "10 49 50")}
    ${doigt(50, 33, 14, gant, ink)}${doigt(60.5, 35, 12, gant, ink)}
    <rect x="29" y="40" width="42" height="36" rx="11" fill="${gant}" stroke="${ink}" stroke-width="1.5"/>
    ${[0, 1].map(i => `<path d="M${52.5 + i * 10.5} 42 q2.75 -2.6 5.5 0" fill="none" stroke="${ink}" stroke-width="1.3" stroke-linecap="round" opacity=".6"/>`).join("")}
    ${tordu ? "" : ongle(31, 20.5, ink, "-12 36 50") + ongle(44, 19.5, ink, "10 49 50")}
    ${dosDeMain(ink)}`;
  // La feuille vue de dos : la main grande ouverte, quatre doigts écartés en éventail (avec leurs ongles, sans pouce), pour qu'on
  // ne la confonde pas avec le poing. (Proportions d'une vraie main : le majeur le plus long, l'auriculaire le plus court.)
  if (symbole === "feuille-dos") return `
    ${doigt(30, 22, 32, gant, ink, "-20 35 54")}${doigt(40.5, 17, 37, gant, ink, "-7 45 54")}${doigt(50.5, 18, 36, gant, ink, "7 55 54")}${doigt(60, 25, 29, gant, ink, "20 65 54")}
    ${paume(44, gant, ink)}
    ${ongle(30, 23.5, ink, "-20 35 54")}${ongle(40.5, 18.5, ink, "-7 45 54")}${ongle(50.5, 19.5, ink, "7 55 54")}${ongle(60, 26.5, ink, "20 65 54")}
    ${dosDeMain(ink)}`;
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
