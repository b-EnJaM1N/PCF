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

// Le plus fort échantillon (0 : silence, 1 : le maximum).
export function creteDe(canaux) {
  let m = 0;
  for (const c of canaux) for (let i = 0; i < c.length; i++) m = Math.max(m, Math.abs(c[i]));
  return m;
}
export function normaliser(canaux, crete = 0.9) {
  const m = creteDe(canaux);
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

// Le début d'un enregistrement (en échantillons) : certains ont un long silence avant le son (le coup des Ciseaux : 0,6 s),
// qui le faisait arriver trop tard, couvert par les commentateurs. On le joue à partir du premier vrai bruit.
export function debutDuSon(canaux, seuil = 0.1, marge = 0) {
  const crete = creteDe(canaux);
  if (!crete) return 0;
  let d = Infinity;
  for (const c of canaux) for (let i = 0; i < c.length && i < d; i++) if (Math.abs(c[i]) >= crete * seuil) { d = i; break; }
  return d === Infinity ? 0 : Math.max(0, d - marge);
}

// Le smash gagnant des Ciseaux (11 novembre, demande du porteur du projet) : un craquement sec, puis la toile qui se déchire.
export function dechirure(fs, rng = Math.random) {
  const duree = 0.45, len = Math.floor(fs * duree), s = new Float32Array(len);
  const aigu = passeBande(fs, 3200, 0.8), medium = passeBande(fs, 1400, 1.2), craque = passeBande(fs, 2200, 0.6);
  // le craquement : un claquement large, avec un coup sourd en dessous
  for (let i = 0; i < Math.floor(fs * 0.05); i++) {
    const t = i / fs;
    s[i] += craque((rng() * 2 - 1) * Math.exp(-t / 0.004)) * 2.5 + Math.sin(2 * Math.PI * 140 * t) * Math.exp(-t / 0.015) * 0.6;
  }
  // la déchirure : des centaines de petits crépitements, de plus en plus serrés puis qui s'espacent, dans un souffle qui s'éteint
  let t = 0.02;
  while (t < duree - 0.03) {
    const env = Math.min(1, (t - 0.02) / 0.04) * Math.exp(-(t - 0.06) / 0.16);
    const i0 = Math.floor(t * fs), n = Math.floor(fs * (0.0008 + rng() * 0.0015)), amp = env * (1.5 + rng() * 2);
    for (let i = 0; i < n && i0 + i < len; i++) s[i0 + i] += (rng() * 2 - 1) * amp * (1 - i / n);
    t += 0.0008 + rng() * 0.0025 * (1 + t * 6);
  }
  for (let i = 0; i < len; i++) {
    const t2 = i / fs, souffle = (rng() * 2 - 1) * 0.25 * Math.exp(-t2 / 0.12) * Math.min(1, t2 / 0.01);
    s[i] = aigu(s[i] + souffle) * 1.2 + medium(s[i]) * 0.7;
  }
  for (let i = 0; i < 24; i++) s[i] *= i / 24;
  for (let i = 0; i < fs * 0.03; i++) s[len - 1 - i] *= i / (fs * 0.03);   // fin en douceur
  return normaliser([s])[0];
}

// Le smash bloqué (même signe : l'adversaire le renvoie) : un impact sourd, et la balle qui rebondit deux fois.
export function smashBloque(fs, rng = Math.random) {
  const len = Math.floor(fs * 0.5), s = new Float32Array(len), filtre = passeBande(fs, 900, 0.9);
  for (const [debut, amp, f] of [[0, 1, 150], [0.17, 0.45, 190], [0.29, 0.2, 210]]) {
    const i0 = Math.floor(debut * fs);
    for (let i = 0; i < fs * 0.12 && i0 + i < len; i++) {
      const t = i / fs;
      s[i0 + i] += amp * (Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.025) + (rng() * 2 - 1) * Math.exp(-t / 0.004) * 0.8);
    }
  }
  for (let i = 0; i < len; i++) s[i] = s[i] * 0.7 + filtre(s[i]) * 0.6;
  for (let i = 0; i < 24; i++) s[i] *= i / 24;
  return normaliser([s], 0.8)[0];
}

// Le smash raté (l'adversaire gagne le point) : le bras qui fend l'air, dans le vide (un souffle qui descend).
export function smashRate(fs, rng = Math.random) {
  const len = Math.floor(fs * 0.4), s = new Float32Array(len);
  let w1 = 0, w2 = 0;
  for (let i = 0; i < len; i++) {
    const t = i / fs, p = t / 0.4;
    const f = 2600 * Math.pow(0.25, p);                                   // de l'aigu vers le grave
    const k = 1 - Math.exp(-2 * Math.PI * f / fs);
    w1 += k * ((rng() * 2 - 1) - w1); w2 += k * (w1 - w2);              // souffle filtré, qui s'assombrit
    s[i] = (w1 - w2) * Math.sin(Math.PI * Math.min(1, p * 1.15)) ** 2;  // monte puis s'éteint
  }
  return normaliser([s], 0.7)[0];
}

// Le smash gagnant de la Feuille (12 novembre, demande du porteur du projet : « intensifier ») : une grosse claque, comme un drap
// qu'on fait claquer, avec un coup sourd dessous et le froissement qui suit.
export function claqueFeuille(fs, rng = Math.random) {
  const len = Math.floor(fs * 0.42), s = new Float32Array(len);
  const claque = passeBande(fs, 1800, 0.55), corps = passeBande(fs, 420, 0.9), froisse = passeBande(fs, 3600, 1.1);
  for (let i = 0; i < len; i++) {
    const t = i / fs;
    const bruit = rng() * 2 - 1;
    const c = claque(bruit * Math.exp(-t / 0.006)) * 5;                                   // le claquement sec
    const b = corps(bruit * Math.exp(-t / 0.03)) * 2.2;                                    // la toile qui frappe
    const sourd = Math.sin(2 * Math.PI * (110 - 50 * Math.min(1, t / 0.08)) * t) * Math.exp(-t / 0.045) * 1.1;   // le coup sourd
    // le froissement : de petites rafales qui s'éteignent (la feuille qui vibre après le choc)
    const rafale = t > 0.03 ? Math.max(0, Math.sin(2 * Math.PI * 28 * t)) ** 3 * Math.exp(-(t - 0.03) / 0.09) : 0;
    s[i] = c + b + sourd + froisse(bruit) * rafale * 1.4;
  }
  for (let i = 0; i < 24; i++) s[i] *= i / 24;
  for (let i = 0; i < fs * 0.03; i++) s[len - 1 - i] *= i / (fs * 0.03);
  return normaliser([s])[0];
}
