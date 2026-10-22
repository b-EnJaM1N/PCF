// Les coupes et les boucliers de la carrière (décision du porteur du projet, 22 octobre) : à exposer, pas à utiliser.
// Une coupe par circuit (vainqueur des playoffs), de plus en plus belle : bronze, argent, or, cristal, et la Coupe HandSlam
// de l'Élite. Le bouclier : 1er de la saison régulière. Pas encore gagnés : en ombre grise.

// Les matières : [corps, reflet, ombre].
export const MATIERES = [
  { nom: "bronze", couleurs: ["#CD7F32", "#EDB27A", "#8C5220"] },
  { nom: "argent", couleurs: ["#C9CED6", "#F4F6F9", "#858D99"] },
  { nom: "or", couleurs: ["#E9C046", "#FFE89A", "#A9821A"] },
  { nom: "cristal", couleurs: ["#8FDDF5", "#E6FAFF", "#4A9FC4"] },
  { nom: "or et diamants", couleurs: ["#F2C230", "#FFF1B0", "#A57A0E"] },
];
const GRIS = ["#4A5468", "#5E6880", "#353D4D"];
export const NOMS_COUPES = ["Coupe de bronze", "Coupe d'argent", "Coupe d'or", "Coupe de cristal", "Coupe HandSlam"];

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
