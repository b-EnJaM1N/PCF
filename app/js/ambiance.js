// Ambiance du court, synthétisée avec Web Audio (aucun fichier) :
// murmure du public, applaudissements, ovation, clameur, et le « toc » du coup.

const AC = typeof window !== "undefined" ? window.AudioContext || window.webkitAudioContext : null;
export const MURMURE = 0.05;

export class Ambiance {
  constructor() { this.ctx = null; this.master = null; this.murmure = null; this.buf = {}; this.actif = true; }

  // À appeler après un geste de l'utilisateur (règle des navigateurs mobiles).
  initialiser() {
    if (this.ctx || !AC) { if (this.ctx && this.ctx.state === "suspended") this.ctx.resume(); return; }
    try { this.ctx = new AC(); } catch { this.ctx = null; return; }
    const ctx = this.ctx;
    this.master = ctx.createGain(); this.master.gain.value = this.actif ? 1 : 0; this.master.connect(ctx.destination);
    const sr = ctx.sampleRate;
    // bruit rose en boucle pour le murmure du public
    const len = sr * 6, nb = ctx.createBuffer(1, len, sr), d = nb.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
    }
    for (let i = 0; i < 2000; i++) { const k = i / 2000; d[i] = d[i] * k + d[len - 2000 + i] * (1 - k); }
    this.murmure = ctx.createGain(); this.murmure.gain.value = 0; this.murmure.connect(this.master);
    [[350, 1.2], [700, 1.5], [1400, 2]].forEach(([f, q], i) => {
      const src = ctx.createBufferSource(); src.buffer = nb; src.loop = true; src.loopStart = 0; src.loopEnd = 6;
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = f; bp.Q.value = q;
      const g = ctx.createGain(); g.gain.value = [1, 0.7, 0.35][i];
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.13 + i * 0.07; lg.gain.value = 0.35 * [1, 0.7, 0.35][i];
      lfo.connect(lg); lg.connect(g.gain); lfo.start();
      src.connect(bp); bp.connect(g); g.connect(this.murmure); src.start(0, i * 1.7);
    });
    this.buf.applause = this.applaudissements(3.2, 140, 0.25, 0.45);
    this.buf.ovation = this.applaudissements(5, 260, 0.35, 0.4);
    this.buf.clameur = this.applaudissements(1.6, 90, 0.1, 0.5);
  }

  activer(on) {
    this.actif = on;
    if (on) this.initialiser();
    if (this.master) this.master.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.05);
  }

  applaudissements(dur, rate, att, rel) {
    const ctx = this.ctx, sr = ctx.sampleRate, len = Math.floor(dur * sr), b = ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch), n = Math.floor(dur * rate);
      for (let c = 0; c < n; c++) {
        const t = Math.random() * dur;
        const env = t < att ? t / att : t > dur * (1 - rel) ? Math.max(0, (dur - t) / (dur * rel)) : 1;
        const amp = (0.25 + Math.random() * 0.75) * env, start = Math.floor(t * sr), L = Math.floor(sr * (0.008 + Math.random() * 0.01)), tau = sr * (0.0025 + Math.random() * 0.002);
        let lp = 0; const k = 0.35 + Math.random() * 0.4;
        for (let i = 0; i < L && start + i < len; i++) { const w = Math.random() * 2 - 1; lp = lp + k * (w - lp); d[start + i] += lp * amp * Math.exp(-i / tau); }
      }
      let m = 0; for (let i = 0; i < len; i++) m = Math.max(m, Math.abs(d[i]));
      if (m > 0) for (let i = 0; i < len; i++) d[i] = d[i] / m * 0.9;
    }
    return b;
  }

  // "applause", "ovation" ou "clameur"
  public(type, vol = 0.5) {
    const ctx = this.ctx; if (!ctx || !this.buf[type]) return;
    const src = ctx.createBufferSource(); src.buffer = this.buf[type];
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 500;
    const pk = ctx.createBiquadFilter(); pk.type = "peaking"; pk.frequency.value = 2200; pk.gain.value = 4;
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(hp); hp.connect(pk); pk.connect(g); g.connect(this.master); src.start();
    if (type === "clameur") { // un « oh » sous les applaudissements
      const o = ctx.createBufferSource(); o.buffer = this.buf.clameur;
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 450; bp.Q.value = 0.8;
      const og = ctx.createGain(), t = ctx.currentTime;
      og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(vol * 1.4, t + 0.35); og.gain.linearRampToValueAtTime(0, t + 1.5);
      o.connect(bp); bp.connect(og); og.connect(this.master); o.start();
    }
  }

  toc() {
    const ctx = this.ctx; if (!ctx) return; const t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "sine";
    o.frequency.setValueAtTime(1100, t); o.frequency.exponentialRampToValueAtTime(600, t + 0.06);
    g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.1);
  }

  // Niveau du murmure : MURMURE en jeu, 0 pour le silence avant une balle de match.
  niveau(v, secondes = 1) {
    const ctx = this.ctx; if (!ctx || !this.murmure) return; const t = ctx.currentTime;
    this.murmure.gain.cancelScheduledValues(t); this.murmure.gain.setValueAtTime(this.murmure.gain.value, t);
    this.murmure.gain.linearRampToValueAtTime(v, t + secondes);
  }
}
