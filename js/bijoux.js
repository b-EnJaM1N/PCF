// Les bijoux (10 novembre, redessinés et diversifiés à la demande du porteur du projet) : les bracelets et les bagues, avec des
// reflets de métal. Chaque entrée de BRACELETS et de BAGUES (avatar.js) porte sa description ; ici, le dessin.
let k = 0;
export const METAUX = {
  or: ["#FFF1B8", "#E9C046", "#A9801A"], argent: ["#FFFFFF", "#C9CED6", "#7E8794"], bronze: ["#F3C79A", "#C27A3A", "#7A4519"],
  orrose: ["#FFE0D6", "#E8A08A", "#A5604C"], noir: ["#6B707A", "#2B2E34", "#111215"],
};
const degrade = (id, [c1, c2, c3]) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset=".45" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></linearGradient>`;
const ICONES = {
  pierre: c => `<rect x="1" y="2" width="8" height="6.5" rx="2.2" fill="${c}"/>`,
  feuille: c => `<rect x="2" y="5" width="6.5" height="4.5" rx="1.5" fill="${c}"/>${[2, 3.7, 5.4, 7.1].map((x, i) => `<rect x="${x}" y="${[1.2, .5, .9, 1.9][i]}" width="1.4" height="5" rx=".7" fill="${c}"/>`).join("")}`,
  ciseaux: c => `<rect x="2.5" y="5.5" width="5.5" height="4" rx="1.4" fill="${c}"/><path d="M4 6 L2.7 .9 M6.6 6 L7.9 .9" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/>`,
};
const icone = (s, cx, cy, taille, c) => `<g transform="translate(${cx - taille / 2} ${cy - taille / 2}) scale(${taille / 10})">${ICONES[s](c)}</g>`;
const OMBRE = `stroke="rgba(0,0,0,.35)" stroke-width=".8"`;

// Un bracelet b ({ type, metal, couleur, couleurs, signe }) posé en (x, y), de largeur w (6 de haut). c : la couleur choisie
// par le joueur (cuir et perles), ou null.
export function braceletSVG(b, x, y, w, c = null) {
  if (!b) return "";
  const id = "bj" + (++k), h = 6, cy = y + h / 2, M = METAUX[b.metal] || METAUX.or;
  if (b.type === "metal") return `<defs>${degrade(id, M)}</defs><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="url(#${id})" ${OMBRE}/><rect x="${x + 2}" y="${y + 1}" width="${w - 4}" height="1" rx=".5" fill="#fff" opacity=".6"/>`;
  if (b.type === "jonc") return `<defs>${degrade(id, M)}</defs>${[0, 2.3, 4.6].map(d => `<rect x="${x + d * .2}" y="${y + d - .4}" width="${w - d * .4}" height="2.2" rx="1.1" fill="url(#${id})" ${OMBRE}/>`).join("")}`;
  if (b.type === "cuir" || b.type === "clous") {
    const cuir = c || b.couleur || "#6B3E22";
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${cuir}" ${OMBRE}/><rect x="${x}" y="${y}" width="${w}" height="1.6" rx="1" fill="#fff" opacity=".18"/>`
      + (b.type === "cuir" ? `<path d="M${x + 1.5} ${cy} H${x + w - 1.5}" stroke="#fff" stroke-opacity=".55" stroke-width=".6" stroke-dasharray="1.4 1.1"/>`
        : `<defs><radialGradient id="${id}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="${M[1]}"/><stop offset="1" stop-color="${M[2]}"/></radialGradient></defs>`
          + Array.from({ length: Math.floor((w - 3) / 4.2) + 1 }, (_, i) => `<circle cx="${x + 2.6 + i * 4.2}" cy="${cy}" r="1.45" fill="url(#${id})" stroke="rgba(0,0,0,.4)" stroke-width=".35"/>`).join(""));
  }
  if (b.type === "gourmette") {
    const n = Math.floor(w / 3.3), maillon = (i, trait) => `<ellipse cx="${x + 1.9 + i * 3.3}" cy="${cy}" rx="2.4" ry="${i % 2 ? 2.1 : 2.8}" fill="none" ${trait}/>`;
    return `<defs>${degrade(id, M)}</defs>` + Array.from({ length: n }, (_, i) => maillon(i, `stroke="url(#${id})" stroke-width="1.5"`)).join("")
      + Array.from({ length: n }, (_, i) => maillon(i, `stroke="rgba(0,0,0,.35)" stroke-width=".3"`)).join("");
  }
  if (b.type === "perles") {
    const cs = c ? [c] : b.couleurs || ["#EFE9DA"], n = Math.floor(w / 4.2);
    return `<defs>${cs.map((x2, i) => `<radialGradient id="${id}${i}" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${x2}"/><stop offset="1" stop-color="${x2}" stop-opacity=".85"/></radialGradient>`).join("")}</defs>`
      + Array.from({ length: n }, (_, i) => `<circle cx="${x + 2.1 + i * 4.2}" cy="${cy}" r="2.3" fill="url(#${id}${i % cs.length})" stroke="rgba(0,0,0,.3)" stroke-width=".5"/>`).join("");
  }
  if (b.type === "tresse") {
    const [a, c2, c3] = b.couleurs;
    return `<defs><pattern id="${id}" width="4.5" height="6" patternUnits="userSpaceOnUse" patternTransform="skewX(-35)"><rect width="1.5" height="6" fill="${a}"/><rect x="1.5" width="1.5" height="6" fill="${c2}"/><rect x="3" width="1.5" height="6" fill="${c3}"/></pattern></defs><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2.5" fill="url(#${id})" ${OMBRE}/><rect x="${x}" y="${y}" width="${w}" height="1.4" rx=".7" fill="#fff" opacity=".2"/>`;
  }
  if (b.type === "breloque") {
    const mx = x + w / 2;
    return `<defs>${degrade(id, M)}</defs><rect x="${x}" y="${y + 1}" width="${w}" height="2.6" rx="1.3" fill="url(#${id})" ${OMBRE}/><circle cx="${mx}" cy="${y + 7.2}" r="4.1" fill="url(#${id})" ${OMBRE}/><circle cx="${mx}" cy="${y + 7.2}" r="3.1" fill="#1D2330"/>${icone(b.signe, mx, y + 7.2, 4.6, M[1])}`;
  }
  if (b.type === "montre") {   // la montre de sport : un bracelet en caoutchouc et un cadran rond
    const mx = x + w / 2, bande = b.couleur || "#23262B";
    return `<rect x="${x}" y="${y + .5}" width="${w}" height="${h - 1}" rx="2.4" fill="${bande}" ${OMBRE}/><circle cx="${mx}" cy="${cy}" r="4.6" fill="#3A3E45" ${OMBRE}/><circle cx="${mx}" cy="${cy}" r="3.6" fill="#F5F7FA"/>`
      + `<path d="M${mx} ${cy} V${cy - 2.6} M${mx} ${cy} H${mx + 1.9}" stroke="#1D2330" stroke-width=".7" stroke-linecap="round"/><circle cx="${mx}" cy="${cy}" r=".5" fill="#E8574A"/>`;
  }
  if (b.type === "capitaine") {   // le brassard de capitaine : une bande jaune avec un « C »
    const mx = x + w / 2;
    return `<rect x="${x - 1}" y="${y - .5}" width="${w + 2}" height="${h + 1}" rx="1.6" fill="#F4C542" ${OMBRE}/><rect x="${x - 1}" y="${y - .5}" width="${w + 2}" height="1.4" fill="#fff" opacity=".35"/>`
      + `<text x="${mx}" y="${cy + 2.1}" text-anchor="middle" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-weight="800" font-size="6.2" fill="#1D2330">C</text>`;
  }
  return "";
}

// Une bague g ({ type, metal, couleur, signe }) : l'anneau en (x, y), de w × h, et son chaton au milieu. chaton : le dessin
// d'un chaton déjà prêt (la chevalière HandSlam, avatar.js), ou null.
export function bagueSVG(g, x, y, w = 11.5, h = 4.2, chaton = null) {
  if (!g) return "";
  const id = "bg" + (++k), M = METAUX[g.metal] || METAUX.or, cx = x + w / 2, cy = y + h / 2;
  let s = `<defs>${degrade(id, M)}</defs><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.8" fill="url(#${id})" stroke="rgba(0,0,0,.35)" stroke-width=".7"/>`;
  if (g.type === "pierre") s += `<defs><radialGradient id="${id}g" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="${g.couleur}"/><stop offset="1" stop-color="${g.couleur}"/></radialGradient></defs><circle cx="${cx}" cy="${cy}" r="3.2" fill="url(#${id})" stroke="rgba(0,0,0,.4)" stroke-width=".5"/><circle cx="${cx}" cy="${cy}" r="2.3" fill="url(#${id}g)"/><circle cx="${cx - .8}" cy="${cy - .8}" r=".6" fill="#fff" opacity=".9"/>`;
  if (g.type === "signe") s += `<circle cx="${cx}" cy="${cy}" r="3.9" fill="url(#${id})" stroke="rgba(0,0,0,.4)" stroke-width=".5"/><circle cx="${cx}" cy="${cy}" r="3.1" fill="#1D2330"/>${icone(g.signe, cx, cy, 4.4, M[1])}`;
  if (g.type === "champion") s += `<rect x="${cx - 4}" y="${cy - 3.6}" width="8" height="7.2" rx="1.6" fill="url(#${id})" stroke="rgba(0,0,0,.4)" stroke-width=".5"/><rect x="${cx - 2.8}" y="${cy - 2.4}" width="5.6" height="4.8" rx="1" fill="#1F4FB8"/><circle cx="${cx}" cy="${cy}" r="1.3" fill="#fff"/>${[-3.2, 3.2].map(d => `<circle cx="${cx + d}" cy="${cy - 3.3}" r=".55" fill="#fff"/>`).join("")}`;
  if (chaton) s += chaton(cx, cy);
  return s;
}
