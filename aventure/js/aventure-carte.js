// La carte du monde, vue de dessus façon premiers Mario : un chemin à angles droits, une étape par adversaire,
// le campement au départ et le bosquet du boss tout en haut. Le décor est dessiné en gros pixels dans un canevas
// (toujours le même, grâce à un hasard réglé) ; les étapes et le héros sont posés par-dessus par aventure-jeu.js.

export const LARGEUR = 180, HAUTEUR = 300;
export const DEPART = { x: 90, y: 286 };
// Les étapes, dans l'ordre des adversaires, avec le chemin depuis l'étape précédente (ou le campement).
export const ETAPES = [
  { x: 36, y: 256, chemin: [[90, 286], [90, 256], [36, 256]] },
  { x: 144, y: 222, chemin: [[36, 256], [36, 222], [144, 222]] },
  { x: 40, y: 188, chemin: [[144, 222], [144, 188], [40, 188]] },
  { x: 140, y: 132, chemin: [[40, 188], [40, 148], [140, 148], [140, 132]] },
  { x: 40, y: 98, chemin: [[140, 132], [140, 112], [40, 112], [40, 98]] },
  { x: 92, y: 44, chemin: [[40, 98], [40, 70], [92, 70], [92, 44]] },
];
const RIVIERE = { haut: 158, bas: 170 };

// Le trajet du héros entre deux positions (-1 : le campement ; 0 à 5 : les étapes), point par point.
export function trajet(de, vers) {
  if (de === vers) return [];
  if (vers > de) return ETAPES.slice(de + 1, vers + 1).flatMap(e => e.chemin.slice(1));
  return ETAPES.slice(vers + 1, de + 1).reverse().flatMap(e => e.chemin.slice(0, -1).reverse());
}
export const position = i => (i < 0 ? DEPART : ETAPES[i]);

// Un hasard toujours le même, pour que la carte ne change pas d'une visite à l'autre.
function hasard(graine) {
  return () => { graine |= 0; graine = (graine + 0x6D2B79F5) | 0; let t = Math.imul(graine ^ (graine >>> 15), 1 | graine); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const segments = () => ETAPES.flatMap(e => e.chemin.slice(1).map((p, i) => [e.chemin[i], p]));
function distanceAuChemin(x, y) {
  let d = Infinity;
  for (const [[x1, y1], [x2, y2]] of segments()) {
    const cx = Math.max(Math.min(x1, x2), Math.min(Math.max(x1, x2), x)), cy = Math.max(Math.min(y1, y2), Math.min(Math.max(y1, y2), y));
    d = Math.min(d, Math.hypot(x - cx, y - cy));
  }
  return d;
}
const riviereA = x => Math.round(Math.sin(x / 11) * 2);

export function dessinerCarte(canvas) {
  canvas.width = LARGEUR; canvas.height = HAUTEUR;
  const g = canvas.getContext("2d"), r = hasard(1997);
  const px = (x, y, c, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };

  // L'herbe, plus sombre vers le haut (la Forêt des Ombres).
  px(0, 0, "#4f9a36", LARGEUR, HAUTEUR);
  for (let y = 0; y < HAUTEUR; y++) for (let x = 0; x < LARGEUR; x++) {
    const v = r();
    if (v < 0.07) px(x, y, "#3f8a2c"); else if (v < 0.1) px(x, y, "#62ad45");
  }
  for (let y = 0; y < 120; y++) px(0, y, `rgba(8, 28, 18, ${((120 - y) / 120) * 0.5})`, LARGEUR, 1);
  // Quelques fleurs.
  for (let i = 0; i < 90; i++) { const x = r() * LARGEUR, y = 120 + r() * (HAUTEUR - 120); if (distanceAuChemin(x, y) > 7) px(x, y, ["#f4d06f", "#ff7b7b", "#ffffff"][i % 3]); }

  // La rivière, avec ses berges.
  for (let x = 0; x < LARGEUR; x++) {
    const o = riviereA(x);
    px(x, RIVIERE.haut - 1 + o, "#2c5e3a"); px(x, RIVIERE.bas + 1 + o, "#2c5e3a");
    for (let y = RIVIERE.haut; y <= RIVIERE.bas; y++) px(x, y + o, r() < 0.08 ? "#8fc0ff" : y < RIVIERE.haut + 3 ? "#4a8be0" : "#3a7bd5");
  }

  // Le chemin de terre (bord sombre, puis l'intérieur moucheté).
  for (const [[x1, y1], [x2, y2]] of segments()) {
    const x = Math.min(x1, x2), y = Math.min(y1, y2), w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
    px(x - 5, y - 5, "#8a5a2b", w + 10, h + 10);
  }
  for (const [[x1, y1], [x2, y2]] of segments()) {
    const x = Math.min(x1, x2), y = Math.min(y1, y2), w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
    px(x - 4, y - 4, "#d9a35c", w + 8, h + 8);
    for (let i = 0; i < (w + h) / 3; i++) px(x - 3 + r() * (w + 6), y - 3 + r() * (h + 6), "#c48a46");
  }
  // Le pont, là où le chemin traverse la rivière.
  for (const [[x1, y1], [x2, y2]] of segments()) {
    if (x1 !== x2 || Math.min(y1, y2) > RIVIERE.haut || Math.max(y1, y2) < RIVIERE.bas) continue;
    const o = riviereA(x1);
    for (let y = RIVIERE.haut - 3 + o; y <= RIVIERE.bas + 3 + o; y++) px(x1 - 6, y, y % 2 ? "#a8743a" : "#7a4a1e", 13, 1);
    px(x1 - 7, RIVIERE.haut - 4 + o, "#4a2a10", 1, RIVIERE.bas - RIVIERE.haut + 9); px(x1 + 7, RIVIERE.haut - 4 + o, "#4a2a10", 1, RIVIERE.bas - RIVIERE.haut + 9);
  }

  // Le campement du départ : une tente.
  const tente = (x, y) => {
    for (let i = 0; i < 8; i++) { px(x - i, y - 8 + i, "#3a1a0a"); px(x + i, y - 8 + i, "#3a1a0a"); px(x - i + 1, y - 8 + i, "#c8322f", Math.max(0, 2 * i - 1), 1); }
    px(x - 8, y, "#3a1a0a", 17, 1); px(x - 1, y - 4, "#3a1a0a", 2, 4);
  };
  tente(70, 292);

  // Les arbres : feuillus en bas, sapins sombres dans la Forêt des Ombres ; jamais sur le chemin ni dans l'eau.
  const arbres = [];
  for (let essai = 0; essai < 900 && arbres.length < 120; essai++) {
    const x = 4 + r() * (LARGEUR - 8), y = 6 + r() * (HAUTEUR - 10);
    const sapin = y < 125, dense = y < 125 ? 0.95 : 0.5;
    if (r() > dense) continue;
    if (distanceAuChemin(x, y) < 11 || (y > RIVIERE.haut - 10 && y < RIVIERE.bas + 6) || Math.hypot(x - 70, y - 288) < 12) continue;
    if (ETAPES.some(e => Math.hypot(x - e.x, y - e.y) < 14) || arbres.some(a => Math.hypot(x - a.x, y - a.y) < 8)) continue;
    arbres.push({ x: Math.round(x), y: Math.round(y), sapin });
  }
  arbres.sort((a, b) => a.y - b.y);
  for (const { x, y, sapin } of arbres) {
    px(x - 3, y + 4, "rgba(0, 0, 0, .25)", 7, 2);                       // l'ombre
    if (sapin) {
      for (let i = 0; i < 9; i++) { const l = Math.floor(i / 2) + 1; px(x - l - 1, y - 6 + i, "#0e2a1a", 2 * l + 3, 1); px(x - l, y - 6 + i, i % 3 === 0 ? "#2f6b3f" : "#1f5232", 2 * l + 1, 1); }
      px(x - 1, y + 3, "#4a2a10", 2, 2);
    } else {
      px(x - 1, y + 1, "#5a3414", 2, 4);
      for (const [dx, dy, w] of [[-2, -6, 5], [-4, -5, 9], [-5, -4, 11], [-5, -3, 11], [-5, -2, 11], [-4, -1, 9], [-2, 0, 5]]) { px(x + dx - 1, y + dy, "#1f4d1f", w + 2, 1); px(x + dx, y + dy, "#2f7a2f", w, 1); }
      px(x - 2, y - 4, "#4fa24f", 2, 1); px(x - 3, y - 3, "#4fa24f", 1, 1);
    }
  }

  // Les plots des étapes (le bouton est posé par-dessus), et le bosquet du boss.
  for (const [i, e] of ETAPES.entries()) {
    const rayon = i === ETAPES.length - 1 ? 9 : 7;
    for (let dy = -rayon; dy <= rayon; dy++) {
      const w = Math.round(Math.sqrt(rayon * rayon - dy * dy));
      px(e.x - w - 1, e.y + dy, "#3a2210", 2 * w + 3, 1);
      px(e.x - w, e.y + dy, i === ETAPES.length - 1 ? "#8b2d2d" : "#f0d9a0", 2 * w + 1, 1);
    }
  }
}
