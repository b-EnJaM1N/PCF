// Les coupes et les boucliers de la carrière (décision du porteur du projet, 22 octobre) : à exposer, pas à utiliser.
// Une coupe par circuit (vainqueur des playoffs), de plus en plus belle : bronze, argent, or, cristal, et la Coupe HandSlam
// de l'Élite ; la Coupe Monique-Latour (toutes divisions confondues) : une coupe d'or sur un bouclier rubis. Le bouclier : 1er de la saison régulière.
// Pas encore gagnés : en ombre grise.

// Les matières : [corps, reflet, ombre].
export const MATIERES = [
  { nom: "bronze", couleurs: ["#CD7F32", "#EDB27A", "#8C5220"] },
  { nom: "argent", couleurs: ["#C9CED6", "#F4F6F9", "#858D99"] },
  { nom: "or", couleurs: ["#E9C046", "#FFE89A", "#A9821A"] },
  { nom: "cristal", couleurs: ["#8FDDF5", "#E6FAFF", "#4A9FC4"] },
  { nom: "or et diamants", couleurs: ["#F2C230", "#FFF1B0", "#A57A0E"] },
];
const GRIS = ["#4A5468", "#5E6880", "#353D4D"];
export const NOMS_COUPES = ["Coupe de bronze", "Coupe d'argent", "Coupe d'or", "Coupe de cristal", "Coupe HandSlam", "Coupe Monique-Latour"];

let n = 0;
// La coupe du circuit k (0 : Amateur … 4 : Élite).
export function coupeSVG(k, gagnee = true) {
  const [c, r, o] = gagnee ? MATIERES[k].couleurs : GRIS, id = "cp" + (++n), elite = k === 4;
  const verre = gagnee && k === 3 ? ' fill-opacity=".85"' : "";
  const diamants = elite && gagnee ? [[30, 24], [22, 20], [38, 20]].map(([x, y]) => `<path d="M${x} ${y - 3} L${x + 2.6} ${y} L${x} ${y + 3} L${x - 2.6} ${y} Z" fill="#9BE7FF" stroke="#fff" stroke-width=".6"/>`).join("") : "";
  const couronne = elite ? `<path d="M19 9 L22 3 L26 7 L30 1 L34 7 L38 3 L41 9 Z" fill="url(#${id})" stroke="${o}" stroke-width="1"/>` : "";
  return `<svg viewBox="0 0 60 70" class="coupe" role="img" aria-label="${NOMS_COUPES[k]}${gagnee ? "" : " (pas encore gagnée)"}">`
    + `<defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${o}"/><stop offset=".35" stop-color="${r}"/><stop offset=".6" stop-color="${c}"/><stop offset="1" stop-color="${o}"/></linearGradient></defs>`
    + couronne
    // les anses
    + `<path d="M15 14 C3 14 3 32 19 34" fill="none" stroke="${o}" stroke-width="${elite ? 4 : 3.2}"/><path d="M45 14 C57 14 57 32 41 34" fill="none" stroke="${o}" stroke-width="${elite ? 4 : 3.2}"/>`
    // la coupe, le pied, le socle
    + `<path d="M13 10 H47 C47 30 41 40 30 42 C19 40 13 30 13 10 Z" fill="url(#${id})"${verre} stroke="${o}" stroke-width="1"/>`
    + `<path d="M27 42 H33 L34 52 H26 Z" fill="url(#${id})" stroke="${o}" stroke-width="1"/>`
    + `<rect x="18" y="52" width="24" height="6" rx="1.5" fill="url(#${id})" stroke="${o}" stroke-width="1"/>`
    + `<rect x="14" y="58" width="32" height="8" rx="2" fill="${gagnee ? (elite ? "#3A2A5C" : "#4A3424") : "#2E3442"}" stroke="${o}" stroke-width="1"/>`
    + `<rect x="12" y="10" width="36" height="3" rx="1.5" fill="${r}" opacity=".9"/>`
    + `<path d="M19 15 C19 26 22 33 26 37" fill="none" stroke="#fff" stroke-width="1.6" opacity="${gagnee ? 0.55 : 0.15}" stroke-linecap="round"/>`
    + diamants + `</svg>`;
}

// Le bouclier du circuit k : 1er de la saison régulière.
export function bouclierSVG(k, gagne = true) {
  const [c, r, o] = gagne ? MATIERES[k].couleurs : GRIS, id = "bc" + (++n);
  return `<svg viewBox="0 0 60 70" class="coupe" role="img" aria-label="Bouclier ${k + 1}${gagne ? "" : " (pas encore gagné)"}">`
    + `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${r}"/><stop offset=".5" stop-color="${c}"/><stop offset="1" stop-color="${o}"/></linearGradient></defs>`
    + `<path d="M30 4 L52 11 V32 C52 48 42 58 30 66 C18 58 8 48 8 32 V11 Z" fill="url(#${id})" stroke="${o}" stroke-width="1.5"/>`
    + `<path d="M30 10 L46 15 V32 C46 44 39 52 30 58 C21 52 14 44 14 32 V15 Z" fill="none" stroke="${gagne ? "#fff" : "#6E788C"}" stroke-width="1.2" opacity=".6"/>`
    + `<text x="30" y="42" text-anchor="middle" font-family="Barlow Condensed, sans-serif" font-weight="800" font-size="24" fill="${gagne ? o : "#2E3442"}">1</text>`
    + `</svg>`;
}

// La Coupe Monique-Latour (choix C du porteur du projet) : une coupe d'or, monogramme « ML », posée sur un bouclier rubis
// entouré de lauriers.
export function coupeMLSVG(gagnee = true) {
  const id = "ml" + (++n), [o1, o2, o3] = gagnee ? ["#A57A0E", "#FFF1B0", "#F2C230"] : ["#353D4D", "#5E6880", "#4A5468"];
  const [r1, r2, r3] = gagnee ? ["#F47C95", "#C2183A", "#6E0B20"] : ["#5E6880", "#4A5468", "#353D4D"];
  const laurier = sens => [...Array(6)].map((_, i) => {
    const d = sens * (40 + i * 18), a = d * Math.PI / 180, x = (60 + 34 * Math.sin(a)).toFixed(1), y = (66 + 34 * Math.cos(a)).toFixed(1);
    return `<ellipse cx="${x}" cy="${y}" rx="2.2" ry="5" fill="url(#${id}o)" transform="rotate(${90 * sens - d} ${x} ${y})"/>`;
  }).join("");
  return `<svg viewBox="0 0 120 140" class="coupe" role="img" aria-label="Coupe Monique-Latour${gagnee ? "" : " (pas encore gagnée)"}">`
    + `<defs><linearGradient id="${id}o" x1="0" x2="1"><stop offset="0" stop-color="${o1}"/><stop offset=".35" stop-color="${o2}"/><stop offset=".6" stop-color="${o3}"/><stop offset="1" stop-color="${o1}"/></linearGradient>`
    + `<linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${r1}"/><stop offset=".5" stop-color="${r2}"/><stop offset="1" stop-color="${r3}"/></linearGradient></defs>`
    + `<path d="M60 6 L104 18 V62 C104 100 84 118 60 132 C36 118 16 100 16 62 V18 Z" fill="url(#${id}r)" stroke="url(#${id}o)" stroke-width="4"/>`
    + `<path d="M60 14 L96 24 V62 C96 95 79 110 60 122 C41 110 24 95 24 62 V24 Z" fill="none" stroke="${o2}" stroke-width="1" opacity=".7"/>`
    + laurier(1) + laurier(-1)
    + `<path d="M44 40 C32 40 32 58 47 60" fill="none" stroke="url(#${id}o)" stroke-width="3.5"/><path d="M76 40 C88 40 88 58 73 60" fill="none" stroke="url(#${id}o)" stroke-width="3.5"/>`
    + `<path d="M42 34 H78 C78 58 72 68 60 70 C48 68 42 58 42 34 Z" fill="url(#${id}o)" stroke="${o1}"/>`
    + `<text x="60" y="54" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-weight="700" font-size="11" fill="${gagnee ? "#C2183A" : "#353D4D"}">ML</text>`
    + `<path d="M57 70 H63 L64 82 H56 Z" fill="url(#${id}o)"/><rect x="47" y="82" width="26" height="6" rx="1.5" fill="url(#${id}o)"/>`
    + `<rect x="43" y="88" width="34" height="8" rx="2" fill="${gagnee ? "#4A2A12" : "#2E3442"}" stroke="url(#${id}o)"/>`
    + `<text x="60" y="110" text-anchor="middle" font-family="Georgia, serif" font-size="6" font-weight="700" fill="${o2}" textLength="44" lengthAdjust="spacingAndGlyphs">MONIQUE-LATOUR</text>`
    + `</svg>`;
}
