// Lecture de l'adversaire : un modèle tente de prédire le prochain signe
// d'un joueur à partir de ses habitudes. Quatre prédicteurs sont en
// concurrence, le plus fiable récemment l'emporte :
//   0. le signe favori
//   1. l'enchaînement après le dernier signe
//   2. l'enchaînement après les deux derniers signes
//   3. la réaction au dernier résultat (garder, monter, descendre)
// Les résultats sont notés "g" (gagné), "p" (perdu) ou "e" (égalité),
// du point de vue du joueur analysé.

const argmax = a => { let b = -1, i = -1; a.forEach((v, k) => { if (v > b) { b = v; i = k; } }); return b > 0 ? i : null; };

export class Lecteur {
  constructor() {
    this.hist = [];               // { signe, res }
    this.freq = [0, 0, 0];
    this.m1 = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    this.m2 = {};
    this.oc = {};
    this.scores = [0, 0, 0, 0];
  }
  predictions() {
    const h = this.hist, n = h.length, p = [argmax(this.freq), null, null, null];
    if (n >= 1) p[1] = argmax(this.m1[h[n - 1].signe]);
    if (n >= 2) { const k = `${h[n - 2].signe}${h[n - 1].signe}`; if (this.m2[k]) p[2] = argmax(this.m2[k]); }
    if (n >= 1) { const o = this.oc[h[n - 1].res]; if (o) { const s = argmax(o); if (s !== null) p[3] = (h[n - 1].signe + s) % 3; } }
    return p;
  }
  // Le signe le plus probable pour le prochain coup, ou null.
  predire() {
    let best = null, bs = -1;
    this.predictions().forEach((x, i) => { if (x !== null && this.scores[i] > bs) { bs = this.scores[i]; best = x; } });
    return best;
  }
  // Enregistre le signe réellement joué et son résultat.
  apprendre(signe, res) {
    const h = this.hist, n = h.length;
    this.predictions().forEach((x, i) => { this.scores[i] = this.scores[i] * 0.8 + (x === signe ? 1 : 0); });
    this.freq[signe]++;
    if (n >= 1) this.m1[h[n - 1].signe][signe]++;
    if (n >= 2) { const k = `${h[n - 2].signe}${h[n - 1].signe}`; (this.m2[k] ||= [0, 0, 0])[signe]++; }
    if (n >= 1) (this.oc[h[n - 1].res] ||= [0, 0, 0])[(signe - h[n - 1].signe + 3) % 3]++;
    h.push({ signe, res });
  }
}

// Indice d'imprévisibilité sur 100, à partir de la part de coups devinés.
// 33 % (le hasard) = 100, 40 % = 80, 50 % = 50, 60 % = 20.
export function indiceImprevisibilite(taux) {
  return Math.round(Math.max(0, Math.min(100, 100 - (taux - 1 / 3) * 300)));
}

// Suit, coup après coup, la part des coups du joueur que le modèle avait devinés.
export class Suivi {
  constructor() { this.lecteur = new Lecteur(); this.devines = 0; this.lisibles = 0; this.recents = []; }
  // À appeler avant de révéler le coup : fige la prédiction.
  figer() { this.prediction = this.lecteur.predire(); return this.prediction; }
  enregistrer(signe, res) {
    if (this.prediction !== null && this.prediction !== undefined) {
      this.lisibles++;
      const ok = this.prediction === signe;
      if (ok) this.devines++;
      this.recents.push(ok); if (this.recents.length > 10) this.recents.shift();
    }
    this.prediction = null;
    this.lecteur.apprendre(signe, res);
  }
  get taux() { return this.lisibles ? this.devines / this.lisibles : null; }
}
