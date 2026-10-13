// « Toi en héros » : une photo devient un visage en gros pixels, posé sur la tête d'un héros dessiné.
// Tout se passe sur le téléphone (dans un canevas) : la photo n'est envoyée nulle part.

export const CADRE = 240, RAYON = 100;   // l'éditeur : un carré de 240 px, le visage dans un rond de 100 px de rayon
const PIXELS = 22;                       // le visage fait 22 × 22 gros pixels

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

// Le visage en gros pixels : le rond de la photo réduit à 22 × 22, couleurs simplifiées, contour sombre.
export function visagePixel(img, zoom, dx, dy) {
  const p = placement(img, zoom, dx, dy), c = document.createElement("canvas");
  c.width = c.height = PIXELS;
  const g = c.getContext("2d");
  const cx = (CADRE / 2 - p.x) / p.s, cy = (CADRE / 2 - p.y) / p.s, r = RAYON / p.s;
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high";
  g.drawImage(img, cx - r, cy - r, 2 * r, 2 * r, 0, 0, PIXELS, PIXELS);
  const d = g.getImageData(0, 0, PIXELS, PIXELS), m = PIXELS / 2;
  for (let y = 0; y < PIXELS; y++) for (let x = 0; x < PIXELS; x++) {
    const i = (y * PIXELS + x) * 4, dist = Math.hypot(x + 0.5 - m, y + 0.5 - m);
    if (dist > m) { d.data[i + 3] = 0; continue; }
    if (dist > m - 1.2) { d.data.set([26, 12, 6, 255], i); continue; }          // le contour, comme les dessins
    for (let k = 0; k < 3; k++) {
      const v = (d.data[i + k] - 128) * 1.15 + 128;                              // un peu plus de contraste
      d.data[i + k] = Math.max(0, Math.min(255, Math.round(v / 36) * 36));       // moins de nuances : effet pixel art
    }
    d.data[i + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  return c;
}

// Le héros complet : le corps dessiné, avec le visage à la place de la tête. tete : { x, y, r } en px du dessin.
export function composer(corps, visage, tete) {
  const c = document.createElement("canvas");
  c.width = corps.width; c.height = corps.height;
  const g = c.getContext("2d");
  g.drawImage(corps, 0, 0);
  g.imageSmoothingEnabled = false;
  g.drawImage(visage, tete.x - tete.r, tete.y - tete.r, 2 * tete.r, 2 * tete.r);
  return c;
}
