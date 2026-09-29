// Dessine « La Une » : une image au format 4:5 (1080 × 1350), prête à partager.
// Les mots viennent de une-logique.js ; ici, seulement la mise en page.
import { MARQUE } from "./marque.js";

const L = 1080, H = 1350, M = 64;                  // largeur, hauteur, marge
const PAPIER = "#F2ECDF", ENCRE = "#15171C", GRIS = "#5E6168", JAUNE = "#F4C542", ROUGE = "#D8412F", COURT = "#173F73";
const MAJ = t => String(t).toLocaleUpperCase("fr-FR");
const COND = "\"Barlow Condensed\", sans-serif", TEXTE = "Barlow, sans-serif";

// Les polices doivent être chargées avant de dessiner.
async function chargerPolices() {
  if (!document.fonts) return;
  try {
    await Promise.all(["800 80px \"Barlow Condensed\"", "700 40px \"Barlow Condensed\"", "500 30px \"Barlow Condensed\"",
      "400 30px Barlow", "italic 400 30px Barlow", "600 30px Barlow"].map(f => document.fonts.load(f)));
  } catch { /* on dessine avec la police de secours */ }
}

// Un avatar (SVG) devient une image dessinable.
function image(svg) {
  return new Promise(ok => {
    const img = new Image();
    img.onload = () => ok(img); img.onerror = () => ok(null);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.replace("<svg ", "<svg width=\"300\" height=\"300\" "));
  });
}

// Coupe un texte en lignes qui tiennent dans la largeur.
function lignes(ctx, texte, largeur) {
  const mots = texte.split(/\s+/), out = [];
  let l = "";
  for (const m of mots) {
    const essai = l ? `${l} ${m}` : m;
    if (ctx.measureText(essai).width > largeur && l) { out.push(l); l = m; } else l = essai;
  }
  if (l) out.push(l);
  return out;
}

// Le plus grand corps de police pour que le titre tienne dans la place (3 lignes au plus).
function titreAjuste(ctx, texte, largeur, hauteur, max = 140, min = 56) {
  for (let t = max; t >= min; t -= 4) {
    ctx.font = `800 ${t}px ${COND}`;
    const ls = lignes(ctx, texte, largeur);
    if (ls.length <= 3 && ls.length * t * 0.92 <= hauteur && ls.every(x => ctx.measureText(x).width <= largeur)) return { taille: t, lignes: ls };
  }
  ctx.font = `800 ${min}px ${COND}`;
  return { taille: min, lignes: lignes(ctx, texte, largeur) };
}

const filet = (ctx, y, ep = 3) => { ctx.fillStyle = ENCRE; ctx.fillRect(M, y, L - 2 * M, ep); };

// h : histoireDuMatch() ; joueurs : { moi, adv } avec { nom, surnom, av (SVG) } ; score : { sets, detail, numero, date, adresse }
export async function dessinerUne(canvas, h, joueurs, score) {
  await chargerPolices();
  canvas.width = L; canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = PAPIER; ctx.fillRect(0, 0, L, H);
  ctx.textBaseline = "alphabetic";

  // Le bandeau du journal
  let y = 70;
  filet(ctx, y, 6); filet(ctx, y + 12, 2);
  ctx.fillStyle = ENCRE; ctx.textAlign = "center";
  ctx.font = `800 104px ${COND}`; ctx.fillText(MAJ(MARQUE.journal), L / 2, y + 122);
  y += 146; filet(ctx, y, 2);
  ctx.font = `500 28px ${COND}`; ctx.fillStyle = GRIS;
  ctx.textAlign = "left"; ctx.fillText(`N° ${score.numero}`, M, y + 36);
  ctx.textAlign = "center"; ctx.fillText(MAJ(score.date), L / 2, y + 36);
  ctx.textAlign = "right"; ctx.fillText("ÉDITION SPÉCIALE", L - M, y + 36);
  y += 52; filet(ctx, y, 6);

  // En partant du bas : pied de page, colonnes, chapô, photo. Le titre prend la place qui reste.
  const hPhoto = 340, basColonnes = H - 110, hautColonnes = basColonnes - 250;
  ctx.font = `600 34px ${TEXTE}`;
  const chapo = lignes(ctx, h.chapo, L - 2 * M).slice(0, 3);
  const hautChapo = hautColonnes - 26 - chapo.length * 44 + 8;
  const hautPhoto = hautChapo - 50 - hPhoto;

  // L'étape (en rouge) et le grand titre
  y += 62;
  ctx.textAlign = "left"; ctx.fillStyle = ROUGE; ctx.font = `700 36px ${COND}`;
  ctx.fillText(MAJ(h.etape), M, y);
  const t = titreAjuste(ctx, h.titre, L - 2 * M, hautPhoto - 30 - (y + 10));
  ctx.fillStyle = ENCRE;
  const hTitre = t.lignes.length * t.taille * 0.92, place = hautPhoto - 30 - y;
  y += Math.max(0, (place - hTitre) / 2);          // le titre est centré dans sa place
  t.lignes.forEach(l => { y += t.taille * 0.92; ctx.fillText(l, M, y); });

  // La « photo » : le court, les deux joueurs et le score
  y = hautPhoto;
  ctx.fillStyle = COURT; ctx.fillRect(M, y, L - 2 * M, hPhoto);
  ctx.strokeStyle = "rgba(245,247,250,.25)"; ctx.lineWidth = 3;
  ctx.strokeRect(M + 18, y + 18, L - 2 * M - 36, hPhoto - 36);
  const [avMoi, avAdv] = await Promise.all([image(joueurs.moi.av), image(joueurs.adv.av)]);
  const joueur = (img, x, couleur, j) => {
    const r = 80, cy = y + 120;
    ctx.save(); ctx.beginPath(); ctx.arc(x, cy, r + 8, 0, Math.PI * 2); ctx.fillStyle = couleur; ctx.fill(); ctx.restore();
    if (img) { ctx.save(); ctx.beginPath(); ctx.arc(x, cy, r, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(img, x - r, cy - r, 2 * r, 2 * r); ctx.restore(); }
    ctx.textAlign = "center"; ctx.fillStyle = couleur; ctx.font = `800 48px ${COND}`;
    ctx.fillText(MAJ(j.nom).slice(0, 16), x, cy + r + 58);
    if (j.legende) { ctx.fillStyle = "#F5F7FA"; ctx.font = `italic 400 24px ${TEXTE}`; ctx.fillText(j.legende.slice(0, 34), x, cy + r + 90); }
  };
  joueur(avMoi, M + 170, JAUNE, joueurs.moi);
  joueur(avAdv, L - M - 170, ROUGE, joueurs.adv);
  ctx.textAlign = "center"; ctx.fillStyle = "#F5F7FA";
  ctx.font = `800 120px ${COND}`; ctx.fillText(score.sets, L / 2, y + 162);
  ctx.font = `500 30px ${COND}`; ctx.fillStyle = "#C9D6E8";
  lignes(ctx, score.detail, 220).slice(0, 3).forEach((l, i) => ctx.fillText(l, L / 2, y + 212 + i * 34));

  // Le chapô
  y = hautChapo;
  ctx.textAlign = "left"; ctx.fillStyle = ENCRE; ctx.font = `600 34px ${TEXTE}`;
  chapo.forEach(l => { ctx.fillText(l, M, y); y += 44; });

  // Deux colonnes : la phrase du match, le chiffre du match
  filet(ctx, hautColonnes, 2);
  const haut = hautColonnes + 20, col = (L - 2 * M - 40) / 2, x2 = M + col + 40;
  ctx.fillStyle = "rgba(21,23,28,.25)"; ctx.fillRect(M + col + 19, haut, 2, basColonnes - haut - 10);
  ctx.fillStyle = ROUGE; ctx.font = `700 28px ${COND}`;
  ctx.fillText("LA PHRASE DU MATCH", M, haut + 30);
  ctx.fillText("LE CHIFFRE", x2, haut + 30);
  if (h.citation) {
    ctx.fillStyle = ENCRE; ctx.font = `italic 400 31px ${TEXTE}`;
    let yc = haut + 76;
    lignes(ctx, `« ${h.citation.texte} »`, col).slice(0, 4).forEach(l => { ctx.fillText(l, M, yc); yc += 40; });
    ctx.fillStyle = GRIS; ctx.font = `500 26px ${COND}`; ctx.fillText(`— ${h.citation.auteur}`, M, yc + 6);
  } else {
    ctx.fillStyle = GRIS; ctx.font = `italic 400 31px ${TEXTE}`; ctx.fillText("Les commentateurs", M, haut + 76); ctx.fillText("sont restés sans voix.", M, haut + 116);
  }
  ctx.fillStyle = ENCRE; ctx.font = `800 110px ${COND}`; ctx.fillText(String(h.chiffre.valeur), x2, haut + 150);
  ctx.font = `500 30px ${COND}`; ctx.fillStyle = GRIS;
  lignes(ctx, MAJ(h.chiffre.legende), col).slice(0, 2).forEach((l, i) => ctx.fillText(l, x2, haut + 196 + i * 34));

  // Le pied de page
  filet(ctx, H - 96, 6);
  ctx.textAlign = "center"; ctx.fillStyle = ENCRE; ctx.font = `700 32px ${COND}`;
  ctx.fillText(MAJ(`Viens me défier : ${score.adresse}`), L / 2, H - 44);
  return canvas;
}

