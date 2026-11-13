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
// Une langue de feu : sa base (x, y), sa hauteur h, sa largeur w.
const langue = (x, y, h, w, fill, cls = "langue") =>
  `<path class="${cls}" d="M${x} ${y} C${x - w * 0.62} ${y - h * 0.18} ${x - w * 0.5} ${y - h * 0.62} ${x} ${y - h} C${x + w * 0.5} ${y - h * 0.62} ${x + w * 0.62} ${y - h * 0.18} ${x} ${y} Z" fill="${fill}"/>`;
const braises = n => Array.from({ length: n }, (_, i) =>
  `<circle class="braise" cx="${30 + ((i * 37) % 40)}" cy="${78 - (i % 3) * 6}" r="${1.6 + (i % 2) * 0.8}" fill="${i % 2 ? "#FFB43A" : "#FF7A1A"}" style="animation-delay:${(i * 0.37) % 1.4}s"/>`).join("");
const fumees = n => Array.from({ length: n }, (_, i) =>
  `<circle class="fumee" cx="${38 + i * 12}" cy="62" r="${6 + (i % 2) * 2}" fill="rgba(150,150,150,.55)" style="animation-delay:${i * 0.45}s"/>`).join("");

// niveau : 1 la fumée, 2 la flamme, 3 en feu ; « fin » : la bouffée de fumée quand le feu s'éteint.
export function feuSVG(niveau) {
  const svg = c => `<svg viewBox="0 0 100 130" aria-hidden="true">${c}</svg>`;
  if (niveau === "fin") return svg(Array.from({ length: 4 }, (_, i) => `<circle class="bouffee" cx="${36 + i * 9}" cy="${66 - (i % 2) * 8}" r="9" fill="rgba(170,170,170,.7)" style="animation-delay:${i * 0.06}s"/>`).join(""));
  if (niveau === 1) return svg(fumees(3) + braises(3));
  if (niveau === 2) return svg([[34, 22, 18], [50, 34, 22], [66, 24, 18]].map(([x, h, w], i) =>
    `<g class="danse" style="animation-delay:${i * 0.12}s">${langue(x, 88, h + 18, w, "#FF6A1A")}${langue(x, 88, h + 4, w * 0.55, "#FFD23F", "coeur")}</g>`).join("") + braises(4));
  if (niveau === 3) return svg(`<g class="danse lente">${langue(50, 124, 112, 112, "rgba(255,90,20,.85)")}</g>`
    + [[16, 50, 22], [36, 72, 26], [62, 78, 26], [84, 52, 22]].map(([x, h, w], i) =>
      `<g class="danse" style="animation-delay:${i * 0.09}s">${langue(x, 100, h, w, "#FF8A1F")}${langue(x, 100, h * 0.6, w * 0.5, "#FFE066", "coeur")}</g>`).join("") + braises(7));
  return "";
}
