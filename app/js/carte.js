// Dessine la carte de joueur (1080 × 1512, le format d'une carte à collectionner).
// Les valeurs viennent de carte-logique.js ; ici, seulement la mise en page.
import { MARQUE } from "./marque.js";

const L = 1080, H = 1512;
const MAJ = t => String(t).toLocaleUpperCase("fr-FR");
const COND = "\"Barlow Condensed\", sans-serif", TEXTE = "Barlow, sans-serif";
const SIGNES = ["PIERRE", "CISEAUX", "FEUILLE"];

// Les couleurs de chaque rang : dégradé du fond, encre, liseré ; « eclat » ajoute des étincelles (rangs rares).
const TEINTES = {
  bois: { fond: ["#5A3B22", "#9C6B41", "#4E3220"], encre: "#F3E2CC", lisere: "#C99A6B" },
  bronze: { fond: ["#6E4424", "#C98A52", "#7A4B28"], encre: "#2A1608", lisere: "#F0C08E" },
  argent: { fond: ["#5E6873", "#DDE3EA", "#6F7A86"], encre: "#1C232B", lisere: "#FFFFFF" },
  or: { fond: ["#8A6A12", "#F4D06F", "#9C7A1E"], encre: "#2B2003", lisere: "#FFF1B8" },
  platine: { fond: ["#6C8F94", "#E6F0F0", "#7FA3A8"], encre: "#12302F", lisere: "#FFFFFF" },
  diamant: { fond: ["#1E5F8C", "#A9E4FF", "#1B4F78"], encre: "#062238", lisere: "#E6F8FF", eclat: true },
  rubis: { fond: ["#5C0715", "#D7263D", "#4A0510"], encre: "#FFE3E6", lisere: "#FF9AA8", eclat: true },
  maitre: { fond: ["#2E1352", "#7B3FC4", "#24103F"], encre: "#F1E6FF", lisere: "#C9A6FF", eclat: true },
  grand_maitre: { fond: ["#12060A", "#8C1C2B", "#0B0306"], encre: "#FFD9A0", lisere: "#FF6B5A", eclat: true },
  legende: { fond: ["#0B0D12", "#2A2F3A", "#07080B"], encre: "#F4D06F", lisere: "#F4D06F", eclat: true },
};

async function chargerPolices() {
  if (!document.fonts) return;
  try {
    await Promise.all(["800 80px \"Barlow Condensed\"", "700 40px \"Barlow Condensed\"", "500 30px \"Barlow Condensed\"",
      "italic 400 30px Barlow", "600 30px Barlow"].map(f => document.fonts.load(f)));
  } catch { /* police de secours */ }
}
function image(svg) {
  return new Promise(ok => {
    const img = new Image();
    img.onload = () => ok(img); img.onerror = () => ok(null);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.replace("<svg ", "<svg width=\"600\" height=\"600\" "));
  });
}
function arrondi(ctx, x, y, l, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + l, y, x + l, y + h, r); ctx.arcTo(x + l, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + l, y, r); ctx.closePath();
}
// Réduit la police jusqu'à ce que le texte tienne dans la largeur.
function ajuster(ctx, texte, largeur, poids, max, min, famille = COND) {
  let t = max;
  do { ctx.font = `${poids} ${t}px ${famille}`; t -= 2; } while (ctx.measureText(texte).width > largeur && t >= min);
}

// c : carteDe() ; j : { nom, numero, drapeau, av (SVG) }
export async function dessinerCarte(canvas, c, j) {
  await chargerPolices();
  canvas.width = L; canvas.height = H;
  const ctx = canvas.getContext("2d"), T = TEINTES[c.rarete] || TEINTES.bronze;
  ctx.clearRect(0, 0, L, H);

  // Le fond de la carte, avec son liseré
  const g = ctx.createLinearGradient(0, 0, L, H);
  g.addColorStop(0, T.fond[0]); g.addColorStop(0.45, T.fond[1]); g.addColorStop(1, T.fond[2]);
  arrondi(ctx, 0, 0, L, H, 70); ctx.fillStyle = g; ctx.fill();
  // reflets
  ctx.save(); arrondi(ctx, 0, 0, L, H, 70); ctx.clip();
  ctx.globalAlpha = 0.12; ctx.fillStyle = "#fff";
  for (let i = -2; i < 8; i++) { ctx.beginPath(); ctx.moveTo(i * 220, 0); ctx.lineTo(i * 220 + 90, 0); ctx.lineTo(i * 220 - 410, H); ctx.lineTo(i * 220 - 500, H); ctx.fill(); }
  ctx.restore();
  // Le liseré : la couleur du rang, ou celle du cadre acheté à la boutique (j.cadre).
  if (j.cadre) { ctx.save(); ctx.shadowColor = j.cadre; ctx.shadowBlur = 30; ctx.lineWidth = 16; ctx.strokeStyle = j.cadre; arrondi(ctx, 30, 30, L - 60, H - 60, 50); ctx.stroke(); ctx.restore(); }
  else { ctx.lineWidth = 10; ctx.strokeStyle = T.lisere; arrondi(ctx, 34, 34, L - 68, H - 68, 48); ctx.stroke(); }
  if (T.eclat) {
    // Des étincelles, toujours au même endroit (la carte ne change pas d'un affichage à l'autre).
    let graine = 7; const hasard = () => ((graine = (graine * 16807) % 2147483647) / 2147483647);
    ctx.fillStyle = T.lisere;
    for (let k = 0; k < 26; k++) {
      const x = 60 + hasard() * (L - 120), y = 60 + hasard() * (H - 120), r = 4 + hasard() * 10;
      ctx.globalAlpha = 0.25 + hasard() * 0.5;
      ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r * 0.25, y - r * 0.25); ctx.lineTo(x + r, y); ctx.lineTo(x + r * 0.25, y + r * 0.25);
      ctx.lineTo(x, y + r); ctx.lineTo(x - r * 0.25, y + r * 0.25); ctx.lineTo(x - r, y); ctx.lineTo(x - r * 0.25, y - r * 0.25); ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // En haut à gauche : le niveau, le signe favori, le drapeau
  ctx.fillStyle = T.encre; ctx.textAlign = "center";
  ctx.font = `800 170px ${COND}`; ctx.fillText(String(c.niveau), 215, 250);
  ctx.font = `700 34px ${COND}`; ctx.fillText(c.typeNiveau, 215, 296);
  ctx.fillRect(135, 322, 160, 4);
  ctx.font = `800 46px ${COND}`; ctx.fillText(c.signe === null ? "—" : SIGNES[c.signe], 215, 384);
  ctx.font = `500 26px ${COND}`; ctx.fillText("SIGNE FAVORI", 215, 416);
  if (j.drapeau) { ctx.font = `90px ${TEXTE}`; ctx.fillText(j.drapeau, 215, 530); }

  // L'avatar
  const av = await image(j.av), cx = 680, cy = 400, r = 270;
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r + 14, 0, Math.PI * 2); ctx.fillStyle = T.lisere; ctx.fill(); ctx.restore();
  if (av) { ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(av, cx - r, cy - r, 2 * r, 2 * r); ctx.restore(); }

  // Le nom et le surnom
  let y = 800;
  ctx.fillStyle = T.encre; ajuster(ctx, MAJ(j.nom), L - 200, 800, 140, 70);
  ctx.fillText(MAJ(j.nom), L / 2, y);
  if (j.numero) { ctx.font = `500 34px ${COND}`; ctx.globalAlpha = 0.75; ctx.fillText(`#${j.numero}`, L / 2, y + 44); ctx.globalAlpha = 1; }
  if (c.surnom) { ajuster(ctx, c.surnom, L - 200, "italic 400", 44, 28, TEXTE); ctx.fillText(c.surnom, L / 2, y + 100); }
  y += 140; ctx.fillRect(140, y, L - 280, 4);

  // Les six notes, en deux colonnes
  const cols = [260, 690];
  c.notes.forEach((n, i) => {
    const x = cols[i % 2], yy = y + 110 + Math.floor(i / 2) * 110;
    ctx.textAlign = "right"; ctx.font = `800 88px ${COND}`; ctx.fillText(String(n.valeur), x + 70, yy);
    ctx.textAlign = "left"; ctx.font = `700 50px ${COND}`; ctx.fillText(n.code, x + 96, yy);
  });
  ctx.fillRect(L / 2 - 2, y + 30, 4, 320);

  // Le pied de carte : rareté, titres, marque
  ctx.textAlign = "center"; ctx.font = `700 34px ${COND}`;
  const pied = [`CARTE ${MAJ(c.rang ? c.rang.rang.nom : c.rarete)}`,
    `${c.titres} TITRE${c.titres > 1 ? "S" : ""}`, `${c.matchs} MATCH${c.matchs > 1 ? "S" : ""}`].join("  ·  ");
  ctx.fillText(pied, L / 2, H - 140);
  if (c.titre) { ctx.font = `italic 400 30px ${TEXTE}`; ctx.fillText(c.titre, L / 2, H - 96); }
  ctx.font = `800 30px ${COND}`; ctx.globalAlpha = 0.7; ctx.fillText(MAJ(MARQUE.nom), L / 2, H - 56); ctx.globalAlpha = 1;
  return canvas;
}
