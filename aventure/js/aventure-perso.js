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
// La peau du dessin, sûre : rose-orangé, avec assez de bleu (l'or des ornements n'en a presque pas), sans le blanc.
const estPeau = (r, g, b, a) => a > 0 && r > g && g > b && b >= 0.36 * g && !(g > 150 && b < 70)
  && ((r > 150 && g > 95 && b > 70 && r - b > 40) || (r >= 225 && g >= 100 && r - b > 60));
// Ses ombres, gagnées de proche en proche à partir de la peau sûre.
const ombrePeau = (r, g, b, a) => a > 0 && r >= 165 && r > g && g > b && g >= 0.45 * r && r - b > 45 && b >= 0.36 * g && !(g > 150 && b < 70);
// Les cheveux, sûrs : brun ou roux (le vert nettement au-dessus du bleu), ni le contour, ni la cape rouge, ni l'or.
const estCheveu = (r, g, b, a) => a > 0 && !estPeau(r, g, b, a) && lum(r, g, b) > 18 && r < 252 && r > g && g >= b + 8 && g > r * 0.22 && !(g > 150 && b < 90);
// Leurs mèches sombres, gagnées de proche en proche (dans la zone des cheveux seulement).
// ecart : l'écart minimal entre vert et bleu (la cape rouge a un vert et un bleu presque égaux) ; plus bas quand la zone évite la cape.
const ombreCheveu = (ecart = 0.3) => (r, g, b, a) => a > 0 && lum(r, g, b) > 13 && r > g && g - b >= Math.max(3, ecart * g) && !(g > 150 && b < 90);
// Les iris : dans le rectangle des yeux, ni la peau, ni le blanc de l'œil, ni le noir du contour et de la pupille.
const estIris = (r, g, b, a) => a > 0 && !estPeau(r, g, b, a) && Math.min(r, g, b) < 190 && lum(r, g, b) > 30;
const dans = (zones, x, y) => zones.some(z => x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h);
const mediane = cols => [0, 1, 2].map(k => { const v = cols.map(c => c[k]).sort((a, b) => a - b); return v[Math.floor(v.length / 2)] || 0; });
const CHEV = 1, PEAU = 2, IRIS = 3;

// Qui est quoi dans le dessin : les zones sûres, puis leurs ombres voisines (cheveux d'abord, puis peau),
// sans les petites taches isolées de « peau » (des reflets dorés).
function etiquettes(d, W, H, zones) {
  const lab = new Uint8Array(W * H), px = i => [d[i * 4], d[i * 4 + 1], d[i * 4 + 2], d[i * 4 + 3]];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = y * W + x, p = px(k);
    if (dans(zones.yeux, x, y) && estIris(...p)) lab[k] = IRIS;
    else if (dans(zones.cheveux, x, y) && estCheveu(...p)) lab[k] = CHEV;
    else if (estPeau(...p)) lab[k] = PEAU;
  }
  const etendre = (cl, test, zone) => {
    const file = []; for (let k = 0; k < W * H; k++) if (lab[k] === cl) file.push(k);
    while (file.length) {
      const k = file.pop(), x = k % W, y = (k / W) | 0;
      for (const [u, v] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if (u < 0 || v < 0 || u >= W || v >= H) continue;
        const q = v * W + u;
        if (!lab[q] && (!zone || dans(zone, u, v)) && test(...px(q))) { lab[q] = cl; file.push(q); }
      }
    }
  };
  etendre(CHEV, ombreCheveu(zones.ecartMeches), zones.cheveux);
  etendre(PEAU, ombrePeau, null);
  const vu = new Uint8Array(W * H);
  for (let k = 0; k < W * H; k++) {
    if (lab[k] !== PEAU || vu[k]) continue;
    const tache = [k], pile = [k]; vu[k] = 1;
    while (pile.length) {
      const j = pile.pop(), x = j % W, y = (j / W) | 0;
      for (const [u, v] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if (u < 0 || v < 0 || u >= W || v >= H) continue;
        const q = v * W + u; if (lab[q] === PEAU && !vu[q]) { vu[q] = 1; pile.push(q); tache.push(q); }
      }
    }
    if (tache.length < 20) for (const j of tache) lab[j] = 0;
  }
  return lab;
}

// corps : l'image du héros ; zones : { cheveux: [...], yeux: [...], ecartMeches } (rectangles, en px du dessin) ; choix : { peau, cheveux, yeux }.
export function personnaliser(corps, zones, choix) {
  const c = document.createElement("canvas"); c.width = corps.width; c.height = corps.height;
  const g = c.getContext("2d"); g.drawImage(corps, 0, 0);
  if (estOrigine(choix)) return c;
  const W = c.width, H = c.height, data = g.getImageData(0, 0, W, H), d = data.data, lab = etiquettes(d, W, H, zones);
  const liste = cl => { const l = []; for (let k = 0; k < W * H; k++) if (lab[k] === cl) l.push(k * 4); return l; };
  const repeindre = (l, cible) => {
    if (!l.length) return;
    const lm = lum(...mediane(l.map(i => [d[i], d[i + 1], d[i + 2]]))) || 1;
    for (const i of l) {
      // plus clair ou plus sombre que la teinte moyenne, mais adouci : la couleur choisie domine, même dans les ombres
      const f = Math.max(0.55, Math.min(1.5, 1 + (lum(d[i], d[i + 1], d[i + 2]) / lm - 1) * 0.6));
      for (let k = 0; k < 3; k++) d[i + k] = Math.max(0, Math.min(255, Math.round(cible[k] * f)));
    }
  };
  if (choix.peau >= 0) repeindre(liste(PEAU), PEAUX[choix.peau].rgb);
  if (choix.cheveux >= 0) repeindre(liste(CHEV), CHEVEUX[choix.cheveux].rgb);
  if (choix.yeux >= 0) repeindre(liste(IRIS), YEUX[choix.yeux].rgb);
  g.putImageData(data, 0, 0);
  return c;
}
