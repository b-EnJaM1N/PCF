// Dessine « La phrase de Monique » : une image carrée (1080 × 1080) aux couleurs du club, prête à partager.
// La phrase vient de une-logique.js (phraseDeMonique) ; ici, seulement la mise en page.
import { MARQUE } from "./marque.js";

const C = 1080, M = 90;
const VERT = "#0F3D2B", OR = "#C9A24A", CREME = "#F5EFE0";
const COND = "\"Barlow Condensed\", sans-serif", TEXTE = "Barlow, sans-serif";
const MAJ = t => String(t).toLocaleUpperCase("fr-FR");

async function chargerPolices() {
  if (!document.fonts) return;
  try { await Promise.all(["700 40px \"Barlow Condensed\"", "500 30px \"Barlow Condensed\"", "italic 400 60px Barlow"].map(f => document.fonts.load(f))); }
  catch { /* police de secours */ }
}
function image(src) {
  return new Promise(ok => { const img = new Image(); img.onload = () => ok(img); img.onerror = () => ok(null); img.src = src; });
}
function lignes(ctx, texte, largeur) {
  const out = []; let l = "";
  for (const m of texte.split(/\s+/)) {
    const essai = l ? `${l} ${m}` : m;
    if (ctx.measureText(essai).width > largeur && l) { out.push(l); l = m; } else l = essai;
  }
  if (l) out.push(l);
  return out;
}

// phrase : le texte ; match : { ligne : « Benji 2 – 1 Rocky », etape : « Match d'entraînement » }
export async function dessinerPhrase(canvas, phrase, match) {
  await chargerPolices();
  canvas.width = C; canvas.height = C;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = VERT; ctx.fillRect(0, 0, C, C);
  ctx.strokeStyle = OR; ctx.lineWidth = 6; ctx.strokeRect(36, 36, C - 72, C - 72);
  ctx.lineWidth = 2; ctx.strokeRect(52, 52, C - 104, C - 104);

  ctx.textAlign = "center"; ctx.fillStyle = OR;
  ctx.font = `700 34px ${COND}`; ctx.fillText(MAJ("La phrase du match").split("").join(" "), C / 2, 150);
  ctx.font = `700 150px ${COND}`; ctx.fillText("«", C / 2, 300);

  // La phrase, en grand : la plus grande taille qui tient en 6 lignes.
  let t = 74, ls;
  do { ctx.font = `italic 400 ${t}px ${TEXTE}`; ls = lignes(ctx, phrase, C - 2 * M - 40); t -= 2; } while ((ls.length > 6 || ls.length * t * 1.25 > 430) && t > 36);
  const h = t * 1.25, y0 = 560 - (ls.length - 1) * h / 2;
  ctx.fillStyle = CREME; ls.forEach((l, i) => ctx.fillText(l, C / 2, y0 + i * h));

  ctx.fillStyle = OR; ctx.font = `700 46px ${COND}`; ctx.fillText(`— ${MARQUE.commentatrice}`, C / 2, 860);
  ctx.fillStyle = CREME; ctx.globalAlpha = 0.8; ctx.font = `500 32px ${COND}`;
  ctx.fillText([match.ligne, match.etape].filter(Boolean).join(" · "), C / 2, 910); ctx.globalAlpha = 1;

  // Le logo et le nom, en bas
  const logo = await image("icons/icon.svg");
  if (logo) { ctx.save(); ctx.beginPath(); ctx.arc(C / 2 - 120, 978, 30, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(logo, C / 2 - 150, 948, 60, 60); ctx.restore(); }
  ctx.fillStyle = OR; ctx.textAlign = "left"; ctx.font = `700 36px ${COND}`; ctx.fillText(`${MARQUE.nom} · handslam.fr`, C / 2 - 78, 991);
  return canvas;
}
