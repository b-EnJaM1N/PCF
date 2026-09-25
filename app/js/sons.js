// Fabrication des sons du court, sans fichier : applaudissements et coup de raquette.
// Fonctions « pures » (elles ne font que calculer des échantillons), testables hors navigateur.
// Un vrai enregistrement déposé dans app/audio/ remplace le son fabriqué (voir ambiance.js).

// Filtre passe-bande (formule classique « RBJ »), appliqué échantillon par échantillon.
function passeBande(fs, f, q) {
  const w = 2 * Math.PI * f / fs, alpha = Math.sin(w) / (2 * q), a0 = 1 + alpha;
  const b0 = alpha / a0, b2 = -alpha / a0, a1 = -2 * Math.cos(w) / a0, a2 = (1 - alpha) / a0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return x => { const y = b0 * x + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; };
}

function normaliser(canaux, crete = 0.9) {
  let m = 0;
  for (const c of canaux) for (let i = 0; i < c.length; i++) m = Math.max(m, Math.abs(c[i]));
  if (m > 0) for (const c of canaux) for (let i = 0; i < c.length; i++) c[i] = c[i] / m * crete;
  return canaux;
}

// Un battement de mains : un bref souffle d'air filtré autour du « timbre » de la personne.
function clap(L, R, debut, fs, { f, q, amp, pan }, rng) {
  const n = Math.floor(fs * 0.03), att = fs * 0.0006, tau = fs * (0.003 + rng() * 0.004);
  const filtre = passeBande(fs, f, q), doux = passeBande(fs, f * 1.9, 0.9), gl = Math.cos(pan * Math.PI / 2) * amp, gr = Math.sin(pan * Math.PI / 2) * amp;
  for (let i = 0; i < n && debut + i < L.length; i++) {
    const env = i < att ? i / att : Math.exp(-(i - att) / tau);
    const x = (rng() * 2 - 1) * env, y = filtre(x) * 0.8 + doux(x) * 0.25;
    L[debut + i] += y * gl; R[debut + i] += y * gr;
  }
}

// Applaudissements d'une foule : chaque spectateur a sa cadence, son timbre,
// sa distance et sa place dans les gradins, et s'arrête à son propre moment.
export function applaudissements(fs, { duree = 3, spectateurs = 120, cadence = [3.5, 5.5], arret = [0.45, 1] } = {}, rng = Math.random) {
  const len = Math.floor(duree * fs), L = new Float32Array(len), R = new Float32Array(len);
  for (let s = 0; s < spectateurs; s++) {
    const distance = rng();
    const p = {
      f: (900 + Math.pow(rng(), 1.5) * 1600) * (1 - 0.3 * distance),
      q: 1.2 + rng() * 2,
      amp: 1 - 0.75 * distance,
      pan: 0.1 + rng() * 0.8,
    };
    const rythme = cadence[0] + rng() * (cadence[1] - cadence[0]);
    const fin = duree * (arret[0] + rng() * (arret[1] - arret[0]));
    let t = Math.abs(rng() + rng() - 1) * 0.25;         // tout le monde ne démarre pas en même temps
    while (t < fin) {
      const baisse = t > fin - 0.5 ? Math.max(0, (fin - t) / 0.5) : 1;
      clap(L, R, Math.floor(t * fs), fs, { ...p, amp: p.amp * baisse * (0.8 + rng() * 0.4) }, rng);
      t += (1 / rythme) * (0.85 + rng() * 0.3);
    }
  }
  return normaliser([L, R]);
}

// Coup de raquette : le « pock » de la balle sur le cordage.
// `hauteur` fait varier légèrement le son selon le signe joué.
export function coupDeRaquette(fs, hauteur = 1, rng = Math.random) {
  const len = Math.floor(fs * 0.16), s = new Float32Array(len), filtre = passeBande(fs, 1500, 0.7);
  const fCorde = 620 * hauteur, fPing = 1400 * hauteur;
  let phase = 0;
  for (let i = 0; i < len; i++) {
    const t = i / fs;
    const claque = filtre((rng() * 2 - 1) * Math.exp(-t / 0.003)) * 7;           // impact
    phase += 2 * Math.PI * fCorde * (1 + 0.08 * Math.exp(-t / 0.005)) / fs;
    const corde = Math.sin(phase) * Math.exp(-t / 0.013) * 0.7;                            // cordage
    const sourd = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t / 0.02) * 0.35;     // corps de la balle
    const ping = Math.sin(2 * Math.PI * fPing * t) * Math.exp(-t / 0.01) * 0.6;
    s[i] = claque + corde + sourd + ping;
  }
  for (let i = 0; i < 24; i++) s[i] *= i / 24;                                        // pas de clic numérique
  return normaliser([s])[0];
}

// Écho d'un stade : bruit qui s'éteint en ~1,5 s, de plus en plus sourd.
export function echoStade(fs, duree = 1.6, rng = Math.random) {
  const len = Math.floor(duree * fs), canaux = [new Float32Array(len), new Float32Array(len)];
  for (const c of canaux) {
    let lp = 0;
    for (let i = 0; i < len; i++) {
      const t = i / fs, k = 0.6 * Math.exp(-t / 0.5) + 0.05;
      lp += k * ((rng() * 2 - 1) - lp);
      c[i] = lp * Math.exp(-t / 0.32) * (i < fs * 0.012 ? 0 : 1);
    }
  }
  return normaliser(canaux, 0.5);
}

// Les différents applaudissements du match.
export const FOULES = {
  point: { duree: 1.6, spectateurs: 35, arret: [0.35, 0.9] },          // après chaque point, comme au tennis
  clameur: { duree: 2.4, spectateurs: 110, cadence: [4.5, 6.5], arret: [0.5, 1] }, // balle sauvée, remontée…
  set: { duree: 3.4, spectateurs: 170, arret: [0.5, 1] },               // fin de set
};
// L'ovation de fin de match superpose les applaudissements de set et la clameur (voir ambiance.js).
