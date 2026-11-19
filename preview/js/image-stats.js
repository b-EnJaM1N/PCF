// L'image des statistiques du match, à partager (19 novembre, demande du porteur du projet) : le panneau de fin de match, comme
// à la télé, dessiné sur une image carrée-haute (1080 de large) : moi à gauche en jaune, l'adversaire à droite en rouge.
// donnees : { moi, adv, score, lignes: [{ titre, g, d, tg, td }], pied }
export const COULEURS_STATS = { me: "#F4C542", bot: "#E8574A", texte: "#F5F7FA", muted: "#9DB4D3", haut: "#173F73", bas: "#0A162C" };

export function hauteurStats(n) { return 330 + n * 112 + 150; }

export function dessinerStats(canvas, { moi, adv, score, lignes, pied }) {
  const C = COULEURS_STATS, L = 1080, H = hauteurStats(lignes.length);
  canvas.width = L; canvas.height = H;
  const x = canvas.getContext("2d");
  const fond = x.createRadialGradient(L / 2, H * 0.3, 40, L / 2, H * 0.3, H);
  fond.addColorStop(0, C.haut); fond.addColorStop(1, C.bas);
  x.fillStyle = fond; x.fillRect(0, 0, L, H);
  const police = (taille, gras = 700, cond = true) => `${gras} ${taille}px ${cond ? "'Barlow Condensed', " : "'Barlow', "}sans-serif`;
  // l'en-tête
  x.textBaseline = "middle"; x.textAlign = "center"; x.fillStyle = C.texte; x.font = police(78, 800);
  x.fillText("📊 Statistiques du match", L / 2, 90);
  const court = (t, max) => { let s = t; x.font = police(52, 700, false); while (s.length > 3 && x.measureText(s).width > max) s = s.slice(0, -2); return s === t ? t : `${s}…`; };
  x.font = police(52, 700, false);
  x.textAlign = "left"; x.fillStyle = C.me; x.fillText(court(moi, 330), 70, 200);
  x.textAlign = "right"; x.fillStyle = C.bot; x.fillText(court(adv, 330), L - 70, 200);
  x.textAlign = "center"; x.fillStyle = C.texte; x.font = police(60, 800); x.fillText(score, L / 2, 200);
  // les lignes
  let y = 330;
  for (const l of lignes) {
    x.font = police(58, 800); x.textAlign = "left"; x.fillStyle = C.me; x.fillText(String(l.g), 70, y);
    x.textAlign = "right"; x.fillStyle = C.bot; x.fillText(String(l.d), L - 70, y);
    x.textAlign = "center"; x.fillStyle = C.muted; x.font = police(36, 500, false); x.fillText(l.titre, L / 2, y - 14);
    const tot = (l.tg || 0) + (l.td || 0), bx = 290, bl = L - 580, by = y + 22, bh = 12;
    x.fillStyle = "rgba(255,255,255,.12)"; x.fillRect(bx, by, bl, bh);
    if (tot > 0) {
      x.fillStyle = C.me; x.fillRect(bx, by, (bl * (l.tg || 0)) / tot, bh);
      const wd = (bl * (l.td || 0)) / tot; x.fillStyle = C.bot; x.fillRect(bx + bl - wd, by, wd, bh);
    }
    y += 112;
  }
  // le pied
  x.fillStyle = C.muted; x.font = police(36, 500, false); x.fillText(pied, L / 2, y + 10);
  x.fillStyle = C.me; x.font = police(46, 800); x.fillText("handslam.fr", L / 2, y + 85);
  return canvas;
}
