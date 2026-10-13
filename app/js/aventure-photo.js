// « Toi en héros » : le visage d'une photo, redessiné dans les couleurs et les gros pixels d'un héros dessiné.
// Tout se passe sur le téléphone (dans un canevas) : la photo n'est envoyée nulle part.

export const CADRE = 240, RAYON = 100;   // l'éditeur : un carré de 240 px, le visage dans un rond de 100 px de rayon

export const chargerImage = src => new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; });

// La place de la photo dans l'éditeur : zoom (1 = la photo remplit le carré) et décalage (en px de l'éditeur).
export function placement(img, zoom, dx, dy) {
  const s = (CADRE / Math.min(img.width, img.height)) * zoom;
  return { s, x: CADRE / 2 - (img.width * s) / 2 + dx, y: CADRE / 2 - (img.height * s) / 2 + dy };
}

// L'éditeur : la photo, assombrie hors du rond.
export function dessinerEditeur(canvas, img, zoom, dx, dy) {
  canvas.width = canvas.height = CADRE;
  const g = canvas.getContext("2d"), p = placement(img, zoom, dx, dy);
  g.fillStyle = "#0b0f1d"; g.fillRect(0, 0, CADRE, CADRE);
  g.drawImage(img, p.x, p.y, img.width * p.s, img.height * p.s);
  g.fillStyle = "rgba(0, 0, 0, .6)";
  g.beginPath(); g.rect(0, 0, CADRE, CADRE); g.arc(CADRE / 2, CADRE / 2, RAYON, 0, Math.PI * 2, true); g.fill();
  g.strokeStyle = "#f4d06f"; g.lineWidth = 3; g.beginPath(); g.arc(CADRE / 2, CADRE / 2, RAYON, 0, Math.PI * 2); g.stroke();
}

// « À tes couleurs » : on lit sur la photo la couleur de la peau (les joues) et celle des cheveux (le haut du rond),
// puis on repeint le héros dessiné avec ces couleurs, en gardant ses ombres et ses lumières : le dessin reste intact.
const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
// La peau du dessin, ombres comprises (les ombres orangées sont très claires en rouge), sans les ornements dorés.
const estPeau = (r, g, b, a) => a > 0 && r > g && g > b && !(g > 150 && b < 70)
  && ((r > 150 && g > 95 && b > 70 && r - b > 40) || (r >= 225 && g >= 100 && r - b > 60));
// Les cheveux du dessin : brun ou roux (le vert est nettement au-dessus du bleu), ni la peau, ni le contour noir,
// ni la cape rouge (vert et bleu à égalité), ni les ornements dorés.
const estCheveu = (r, g, b, a) => a > 0 && !estPeau(r, g, b, a) && lum(r, g, b) > 18 && r < 225 && r > g && g >= b + 8 && g > r * 0.22 && !(g > 150 && b < 90);
const mediane = cols => [0, 1, 2].map(k => { const v = cols.map(c => c[k]).sort((a, b) => a - b); return v[Math.floor(v.length / 2)] || 0; });

export function couleursPhoto(img, zoom, dx, dy) {
  const p = placement(img, zoom, dx, dy), cx = (CADRE / 2 - p.x) / p.s, cy = (CADRE / 2 - p.y) / p.s, r = RAYON / p.s;
  const N = 40, c = document.createElement("canvas"); c.width = c.height = N;
  const g = c.getContext("2d"); g.drawImage(img, cx - r, cy - r, 2 * r, 2 * r, 0, 0, N, N);
  const d = g.getImageData(0, 0, N, N).data, zone = (x0, x1, y0, y1) => {
    const out = [];
    for (let y = Math.floor(y0 * N); y < y1 * N; y++) for (let x = Math.floor(x0 * N); x < x1 * N; x++) { const i = (y * N + x) * 4; out.push([d[i], d[i + 1], d[i + 2]]); }
    return mediane(out);
  };
  return { peau: zone(0.3, 0.7, 0.5, 0.72), cheveux: zone(0.3, 0.7, 0.03, 0.17) };
}

// cheveux : les rectangles du dessin où se trouvent les cheveux.
export function teinter(corps, couleurs, cheveux) {
  const c = document.createElement("canvas"); c.width = corps.width; c.height = corps.height;
  const g = c.getContext("2d"); g.drawImage(corps, 0, 0);
  const W = c.width, H = c.height, data = g.getImageData(0, 0, W, H), d = data.data;
  const dansCheveux = (x, y) => cheveux.some(z => x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h);
  const peau = [], chev = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, px = [d[i], d[i + 1], d[i + 2], d[i + 3]];
    if (estPeau(...px)) peau.push(i); else if (dansCheveux(x, y) && estCheveu(...px)) chev.push(i);
  }
  // Chaque teinte du dessin est déplacée vers la couleur voulue, en gardant son ombre ou sa lumière (rapport à la teinte moyenne).
  const repeindre = (liste, cible) => {
    if (!liste.length) return;
    const moy = mediane(liste.map(i => [d[i], d[i + 1], d[i + 2]])), lm = lum(...moy) || 1;
    for (const i of liste) {
      const f = lum(d[i], d[i + 1], d[i + 2]) / lm;                  // plus clair ou plus sombre que la moyenne
      for (let k = 0; k < 3; k++) d[i + k] = Math.max(0, Math.min(255, Math.round(cible[k] * f)));
    }
  };
  repeindre(peau, couleurs.peau);
  repeindre(chev, couleurs.cheveux);
  g.putImageData(data, 0, 0);
  return c;
}
