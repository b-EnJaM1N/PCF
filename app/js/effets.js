// Les effets du match (13 novembre, idées choisies par le porteur du projet ; pour le décor seulement : rien ne change au jeu).
//   La main en feu : 3 points gagnés de suite, elle fume (niveau 1) ; 5 points, une petite flamme (2) ; 7 points, la main est
//   en feu (3). Une égalité fait baisser le feu d'un niveau (on repart du seuil du niveau d'en dessous : de la flamme à la
//   fumée, 2 points gagnés suffisent pour retrouver la flamme). Un point perdu éteint tout. Le feu reste d'un set à l'autre.
//   Les égalités en chaîne : les mains tremblent un peu plus à chaque égalité de suite ; à la 3e, une étincelle.
//   Le double smash avec le même signe : 2 Pierres, un séisme ; 2 Feuilles, un coup de vent ; 2 Ciseaux, des étincelles.
// Ici, seulement la logique (testée) ; les dessins sont dans app.js et style.css, les sons dans sons.js.

export const SEUILS_FEU = [3, 5, 7];
export const niveauFeu = n => SEUILS_FEU.filter(s => n >= s).length;
export const nouveauFeu = () => ({ series: [0, 0] });

// Après un coup (gagnant : 0, 1 ou null pour une égalité). Renvoie les changements de niveau : [{ joueur, de, a }].
export function noterFeu(etat, gagnant) {
  const avant = etat.series.map(niveauFeu);
  if (gagnant === 0 || gagnant === 1) { etat.series[gagnant]++; etat.series[1 - gagnant] = 0; }
  else etat.series = etat.series.map((n, j) => (avant[j] ? [0, ...SEUILS_FEU][avant[j] - 1] : n));
  return [0, 1].map(j => ({ joueur: j, de: avant[j], a: niveauFeu(etat.series[j]) })).filter(c => c.de !== c.a);
}
export const feuDe = (etat, joueur) => (etat ? niveauFeu(etat.series[joueur]) : 0);

// Les égalités d'affilée qui finissent le match jusqu'ici (0 si le dernier coup n'est pas une égalité).
export function egalitesDeSuite(coups) {
  let n = 0;
  for (let i = coups.length - 1; i >= 0 && coups[i].gagnant === null; i--) n++;
  return n;
}
export const MAX_TREMBLE = 3;

// Le double smash avec le même signe (0 Pierre, 1 Ciseaux, 2 Feuille, comme regles.js) : son effet, ou null.
export const EFFET_DOUBLE = ["seisme", "etincelles", "vent"];
export function effetDouble(smash, a, b) {
  return smash?.[0] && smash?.[1] && a === b ? EFFET_DOUBLE[a] || null : null;
}

// ---------------------------------------------------------------- le dessin du feu (derrière la main : il ne cache jamais le signe)
// (13 novembre : redessiné d'après le modèle du porteur du projet : des flammes qui entourent la main, rouge, orange et jaune,
// avec un halo et des braises ; la fumée en volutes.)
// La boîte du feu déborde de la main : 144 × 167, la main au milieu (x 22 à 122, y 55 à 155 ; pendant le match elle est couchée).
const r1 = v => Math.round(v * 10) / 10;
// Une boule de flammes : une ellipse (cx, cy, rx, ry) dont le haut se découpe en langues de feu (hauteurs h, en courbes qui
// ondulent) ; phase : décale les langues (pour l'animation, d'une forme à l'autre).
function flammes(cx, cy, rx, ry, h, phase = 0) {
  const n = h.length, g = cx - rx, d = cx + rx;
  const yBord = x => cy - ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2));
  const vx = k => g + (d - g) * k / n;
  let p = `M${r1(g)} ${r1(cy)}`;
  for (let k = 0; k < n; k++) {
    const x0 = vx(k), x1 = vx(k + 1), w = x1 - x0, y0 = yBord(x0), y1 = yBord(x1);
    const pente = (k + 0.5) / n - 0.5;                                   // les langues du bord penchent vers l'extérieur
    const hh = h[k] * (1 + 0.18 * Math.sin(phase + k * 1.7));
    const tx = (x0 + x1) / 2 + pente * hh * 0.5 + Math.sin(phase * 1.3 + k) * w * 0.25, ty = Math.min(y0, y1) - hh;
    // (des langues rondes, au bout qui se recourbe, comme sur le modèle)
    p += ` C${r1(x0 - w * 0.1)} ${r1(y0 - hh * 0.55)} ${r1(tx - w * 0.75)} ${r1(ty + hh * 0.3)} ${r1(tx)} ${r1(ty)}`;
    p += ` C${r1(tx + w * 0.3)} ${r1(ty + hh * 0.45)} ${r1(x1 + w * 0.1)} ${r1(y1 - hh * 0.45)} ${r1(x1)} ${r1(y1)}`;
  }
  return `${p} A${r1(rx)} ${r1(ry * 0.8)} 0 0 1 ${r1(g)} ${r1(cy)} Z`;
}
// Une couche de flammes qui bouge : la forme passe d'une phase à l'autre (anime : sinon, immobile).
const couche = (fill, f, anime, dur) => {
  const formes = [0, 2.1, 4.2].map(f);
  return `<path d="${formes[0]}" fill="${fill}">${anime ? `<animate attributeName="d" dur="${dur}s" repeatCount="indefinite" values="${[...formes, formes[0]].join(";")}"/>` : ""}</path>`;
};
const braises = (n, zone) => Array.from({ length: n }, (_, i) => {
  const [x0, y0, w, hh] = zone, x = x0 + ((i * 47) % 100) / 100 * w, y = y0 + ((i * 31) % 100) / 100 * hh;
  return `<circle class="braise" cx="${r1(x)}" cy="${r1(y)}" r="${i % 3 ? 1.1 : 1.8}" fill="${i % 2 ? "#FFD25A" : "#FF7A1A"}" style="animation-delay:${r1((i * 0.29) % 1.4)}s"/>`;
}).join("");
const volute = (x, i) => `<path class="fumee" d="M${x} 84 c-9 -10 9 -16 0 -26 c-9 -10 9 -16 0 -26 c-6 -8 6 -13 1 -20" fill="none" stroke="rgba(205,210,220,.5)" stroke-width="${9 - i * 3}" stroke-linecap="round" style="animation-delay:${i * 0.8}s"/>`;

// niveau : 1 la fumée, 2 la flamme, 3 en feu ; « fin » : la bouffée de fumée quand le feu s'éteint.
// id : pour les filtres (un par main) ; anime : les flammes bougent (pas si l'appareil demande moins d'animations).
export function feuSVG(niveau, { id = "f", anime = true } = {}) {
  const flou = `<filter id="${id}-flou" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.6"/></filter>`
    + `<filter id="${id}-halo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>`;
  const svg = c => `<svg viewBox="0 0 144 167" aria-hidden="true"><defs>${flou}</defs>${c}</svg>`;
  if (niveau === "fin") return svg(Array.from({ length: 5 }, (_, i) => `<circle class="bouffee" cx="${52 + i * 10}" cy="${84 - (i % 2) * 8}" r="9" fill="rgba(175,180,190,.7)" style="animation-delay:${i * 0.05}s"/>`).join(""));
  if (niveau === 1) return svg(`<ellipse cx="74" cy="86" rx="26" ry="9" fill="rgba(255,120,30,.7)" filter="url(#${id}-halo)"/>`
    + `<g filter="url(#${id}-flou)">${volute(68, 0)}${volute(82, 1)}</g>` + braises(16, [36, 28, 76, 66]));
  if (niveau === 2) {
    const f = k => ph => flammes(76, 110, 58 * k, 38 * k, [18, 26, 34, 30, 36, 26, 18].map(v => v * k), ph);
    return svg(`<ellipse cx="76" cy="104" rx="62" ry="44" fill="rgba(255,110,20,.6)" filter="url(#${id}-halo)"/>`
      + `<g filter="url(#${id}-flou)">${couche("#E8401C", f(1), anime, 0.9)}${couche("#FF8C1A", f(0.86), anime, 0.75)}${couche("#FFD84A", f(0.7), anime, 0.6)}</g>`
      + braises(14, [10, 30, 124, 90]));
  }
  if (niveau === 3) {
    const f = k => ph => flammes(76, 114, 74 * k, 52 * k, [30, 46, 58, 66, 56, 44, 30].map(v => v * k), ph);
    return svg(`<ellipse cx="76" cy="100" rx="78" ry="64" fill="rgba(255,90,20,.6)" filter="url(#${id}-halo)"/>`
      + `<g filter="url(#${id}-flou)">${couche("#D9301A", f(1), anime, 1)}${couche("#FF6F1A", f(0.88), anime, 0.8)}${couche("#FFA82A", f(0.75), anime, 0.7)}${couche("#FFE36A", f(0.6), anime, 0.6)}</g>`
      + braises(24, [0, 0, 144, 130]));
  }
  return "";
}
