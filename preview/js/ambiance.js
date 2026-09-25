// Ambiance du court : coup de raquette à chaque coup, applaudissements comme au tennis.
// Pas de bruit de fond pendant l'échange : le public se tait, puis applaudit le point.
// Chaque son est fabriqué par le code (sons.js), sauf si un vrai enregistrement
// portant son nom est déposé dans app/audio/ (ex. public_ovation_01.mp3).
import { applaudissements, coupDeRaquette, echoStade, FOULES } from "./sons.js";

const AC = typeof window !== "undefined" ? window.AudioContext || window.webkitAudioContext : null;

// Nom du fichier audio qui peut remplacer chaque son fabriqué.
export const FICHIERS_AMBIANCE = {
  raquette: "raquette_01",
  point: "public_point_01",
  clameur: "public_clameur_01",
  set: "public_set_01",
  ovation: "public_ovation_01",
};
// Pierre plus grave, Ciseaux plus aigu : une nuance à peine perceptible.
const HAUTEUR = [0.92, 1.08, 1];

export class Ambiance {
  constructor() { this.ctx = null; this.master = null; this.echo = null; this.buf = {}; this.raquettes = []; this.fichiers = []; this.actif = true; }

  // Liste des enregistrements disponibles (lue dans audio/index.json).
  utiliserFichiers(ids) { this.fichiers = ids; if (this.ctx) this.chargerFichiers(); }

  // À appeler après un geste de l'utilisateur (règle des navigateurs mobiles).
  initialiser() {
    if (this.ctx || !AC) { if (this.ctx && this.ctx.state === "suspended") this.ctx.resume(); return; }
    try { this.ctx = new AC(); } catch { this.ctx = null; return; }
    const ctx = this.ctx, fs = ctx.sampleRate;
    this.master = ctx.createGain(); this.master.gain.value = this.actif ? 1 : 0; this.master.connect(ctx.destination);
    // l'écho du stade, mélangé au son direct
    this.echo = ctx.createConvolver(); this.echo.buffer = this.tampon(echoStade(fs));
    const retour = ctx.createGain(); retour.gain.value = 0.35; this.echo.connect(retour); retour.connect(this.master);

    this.raquettes = HAUTEUR.map(h => this.tampon([coupDeRaquette(fs, h)]));
    for (const type of ["point", "clameur", "set"]) this.buf[type] = this.tampon(applaudissements(fs, FOULES[type]));
    this.chargerFichiers();
  }

  tampon(canaux) {
    const b = this.ctx.createBuffer(canaux.length, canaux[0].length, this.ctx.sampleRate);
    canaux.forEach((c, i) => b.getChannelData(i).set(c));
    return b;
  }

  // Remplace les sons fabriqués par les vrais enregistrements disponibles.
  async chargerFichiers() {
    for (const [type, id] of Object.entries(FICHIERS_AMBIANCE)) {
      if (!this.fichiers.includes(id)) continue;
      try {
        const r = await fetch(`audio/${id}.mp3`);
        const b = await this.ctx.decodeAudioData(await r.arrayBuffer());
        if (type === "raquette") this.raquettes = [b, b, b]; else this.buf[type] = b;
      } catch { /* on garde le son fabriqué */ }
    }
  }

  activer(on) {
    this.actif = on;
    if (on) this.initialiser();
    if (this.master) this.master.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.05);
  }

  jouer(buffer, vol, echo, { delai = 0, vitesse = 1 } = {}) {
    const ctx = this.ctx; if (!ctx || !buffer) return;
    const src = ctx.createBufferSource(); src.buffer = buffer; src.playbackRate.value = vitesse;
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(g); g.connect(this.master); if (echo) g.connect(this.echo);
    src.start(ctx.currentTime + delai);
  }

  // Le coup de raquette, quand on choisit son signe.
  raquette(signe = 2) { this.jouer(this.raquettes[signe], 0.7, true); }

  // "point", "clameur", "set" ou "ovation"
  public(type, vol = 0.5) {
    // Sans enregistrement, l'ovation = la foule du set, relancée, et la clameur par-dessus.
    if (type === "ovation" && !this.buf.ovation) {
      this.jouer(this.buf.set, vol, true);
      this.jouer(this.buf.clameur, vol * 0.8, true, { delai: 0.15 });
      this.jouer(this.buf.set, vol * 0.9, true, { delai: 1.9, vitesse: 0.96 });
      return;
    }
    this.jouer(this.buf[type], vol, true);
  }
}
