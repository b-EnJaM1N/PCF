// La personnalisation du héros : couleur de peau, de cheveux et d'yeux. Le dessin reste le même ; seules ces teintes sont
// repeintes, en gardant leurs ombres et leurs lumières (chaque pixel garde sa clarté par rapport à la teinte moyenne).

export const PEAUX = [
  { nom: "Très claire", rgb: [255, 226, 200] }, { nom: "Claire", rgb: [243, 196, 160] }, { nom: "Mate", rgb: [210, 152, 108] },
  { nom: "Brune", rgb: [164, 106, 68] }, { nom: "Foncée", rgb: [108, 68, 42] },
];
export const CHEVEUX = [
  { nom: "Noirs", rgb: [44, 36, 34] }, { nom: "Bruns", rgb: [96, 60, 36] }, { nom: "Châtains", rgb: [142, 96, 56] },
  { nom: "Blonds", rgb: [228, 192, 112] }, { nom: "Roux", rgb: [196, 84, 32] }, { nom: "Blancs", rgb: [222, 222, 216] },
  { nom: "Bleus", rgb: [64, 112, 204] }, { nom: "Roses", rgb: [232, 112, 172] },
];
export const YEUX = [
  { nom: "Bleus", rgb: [60, 124, 214] }, { nom: "Verts", rgb: [70, 152, 82] }, { nom: "Marron", rgb: [112, 66, 32] },
  { nom: "Noisette", rgb: [164, 122, 52] }, { nom: "Gris", rgb: [140, 150, 162] }, { nom: "Violets", rgb: [142, 82, 192] },
];
// Un choix : { peau, cheveux, yeux }, chacun l'index de la couleur, ou -1 pour garder la couleur du dessin.
export const ORIGINE = { peau: -1, cheveux: -1, yeux: -1 };
export const estOrigine = c => c.peau < 0 && c.cheveux < 0 && c.yeux < 0;

const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
// La peau du dessin, ombres comprises (les ombres orangées restent très rouges), sans le blanc ni les ornements dorés.
const estPeau = (r, g, b, a) => a > 0 && r > g && g > b && !(g > 150 && b < 70)
  && ((r > 150 && g > 95 && b > 70 && r - b > 40) || (r >= 225 && g >= 100 && r - b > 60));
// Les cheveux : brun ou roux (le vert nettement au-dessus du bleu), ni la peau, ni le contour, ni la cape rouge, ni l'or.
const estCheveu = (r, g, b, a) => a > 0 && !estPeau(r, g, b, a) && lum(r, g, b) > 18 && r < 252 && r > g && g >= b + 8 && g > r * 0.22 && !(g > 150 && b < 90);
// Les iris : dans le rectangle des yeux, ni la peau, ni le blanc de l'œil, ni le noir du contour et de la pupille.
const estIris = (r, g, b, a) => a > 0 && !estPeau(r, g, b, a) && Math.min(r, g, b) < 190 && lum(r, g, b) > 30;
const dans = (zones, x, y) => zones.some(z => x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h);
const mediane = cols => [0, 1, 2].map(k => { const v = cols.map(c => c[k]).sort((a, b) => a - b); return v[Math.floor(v.length / 2)] || 0; });

// corps : l'image du héros ; zones : { cheveux: [...], yeux: [...] } (rectangles, en px du dessin) ; choix : { peau, cheveux, yeux }.
export function personnaliser(corps, zones, choix) {
  const c = document.createElement("canvas"); c.width = corps.width; c.height = corps.height;
  const g = c.getContext("2d"); g.drawImage(corps, 0, 0);
  if (estOrigine(choix)) return c;
  const W = c.width, H = c.height, data = g.getImageData(0, 0, W, H), d = data.data;
  const listes = { peau: [], cheveux: [], yeux: [] };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, px = [d[i], d[i + 1], d[i + 2], d[i + 3]];
    if (dans(zones.yeux, x, y) && estIris(...px)) listes.yeux.push(i);
    else if (estPeau(...px)) listes.peau.push(i);
    else if (dans(zones.cheveux, x, y) && estCheveu(...px)) listes.cheveux.push(i);
  }
  const repeindre = (liste, cible) => {
    if (!liste.length) return;
    const lm = lum(...mediane(liste.map(i => [d[i], d[i + 1], d[i + 2]]))) || 1;
    for (const i of liste) {
      const f = lum(d[i], d[i + 1], d[i + 2]) / lm;
      for (let k = 0; k < 3; k++) d[i + k] = Math.max(0, Math.min(255, Math.round(cible[k] * f)));
    }
  };
  if (choix.peau >= 0) repeindre(listes.peau, PEAUX[choix.peau].rgb);
  if (choix.cheveux >= 0) repeindre(listes.cheveux, CHEVEUX[choix.cheveux].rgb);
  if (choix.yeux >= 0) repeindre(listes.yeux, YEUX[choix.yeux].rgb);
  g.putImageData(data, 0, 0);
  return c;
}
