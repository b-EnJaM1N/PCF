// Ambiance du court : coup de raquette à chaque coup, applaudissements comme au tennis,
// et un murmure de fond qui baisse pendant l'échange et reprend entre les points.
// La raquette et les applaudissements sont fabriqués par le code (sons.js), sauf si un vrai
// enregistrement portant leur nom est déposé dans app/audio/ (ex. public_ovation_01.mp3).
// Le murmure de fond, la tension et le « ooh » n'existent qu'en enregistrement : sans fichier, rien.
import { applaudissements, coupDeRaquette, echoStade, FOULES } from "./sons.js";

const AC = typeof window !== "undefined" ? window.AudioContext || window.webkitAudioContext : null;

// Nom du fichier audio qui peut remplacer chaque son fabriqué.
export const FICHIERS_AMBIANCE = {
  point: "public_point_01",
  clameur: "public_clameur_01",
  set: "public_set_01",
  ovation: "public_ovation_01",
  fond: "public_fond_01",           // en boucle pendant le match
  tension: "public_tension_01",     // balles de set et de match
  ooh: "public_ooh_01",             // point disputé
};
// Quatre variantes du coup de raquette, tirées au hasard (celles qui sont déposées).
export const FICHIERS_RAQUETTE = ["raquette_01", "raquette_02", "raquette_03", "raquette_04"];

// Volume du murmure de fond : entre les points, et pendant l'échange (le public se tait).
export const FOND = { entrePoints: 0.22, echange: 0.06 };

// Les réactions du public après un coup. evt : ce que renvoie jouerCoup ;
// egalitesAvant : le nombre d'égalités d'affilée juste avant ce coup.
//   tension : la prochaine balle est une balle de set ou de match ;
//   ooh : point disputé (balle de set ou de match sauvée, ou point arraché après 2 égalités ou plus).
export function reactionsPublic(evt, egalitesAvant = 0) {
  if (!evt || evt.egalite || evt.finSet || evt.finMatch) return { tension: false, ooh: false };
  const sauvee = !!(evt.balleAvant && evt.balleAvant.joueur !== evt.gagnant);
  return { tension: !!evt.balleApres, ooh: sauvee || egalitesAvant >= 2 };
}
// Égalités d'affilée juste avant le dernier coup du match.
export function egalitesAvantDernier(coups) {
  let n = 0;
  for (let i = coups.length - 2; i >= 0 && coups[i].gagnant === null; i--) n++;
  return n;
}
// Pierre plus grave, Ciseaux plus aigu : une nuance à peine perceptible.
const HAUTEUR = [0.92, 1.08, 1];

export class Ambiance {
  constructor() {
    this.ctx = null; this.master = null; this.echo = null; this.buf = {}; this.raquettes = []; this.raquettesFichiers = []; this.fichiers = []; this.actif = true;
    this.fondVoulu = false; this.fondSource = null; this.fondGain = null; this.dernierTension = -99;
  }

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

    // La fabrication des sons prend un moment : on la fait juste après, sans bloquer l'écran.
    const etapes = [
      () => { this.raquettes = HAUTEUR.map(h => this.tampon([coupDeRaquette(fs, h)])); },
      ...["set", "clameur", "point"].map(type => () => { this.buf[type] = this.tampon(applaudissements(fs, FOULES[type])); }),
      () => this.chargerFichiers(),
    ];
    const suite = () => { const e = etapes.shift(); if (!e) return; try { e(); } catch { /* son indisponible */ } setTimeout(suite, 0); };
    setTimeout(suite, 0);
  }

  tampon(canaux) {
    const b = this.ctx.createBuffer(canaux.length, canaux[0].length, this.ctx.sampleRate);
    canaux.forEach((c, i) => b.getChannelData(i).set(c));
    return b;
  }

  // Remplace les sons fabriqués par les vrais enregistrements disponibles.
  async chargerFichiers() {
    const charger = async id => {
      const r = await fetch(`audio/${id}.mp3`);
      return this.ctx.decodeAudioData(await r.arrayBuffer());
    };
    for (const [type, id] of Object.entries(FICHIERS_AMBIANCE)) {
      if (!this.fichiers.includes(id) || this.charges?.has(id)) continue;
      try { this.buf[type] = await charger(id); (this.charges ||= new Set()).add(id); } catch { /* on garde le son fabriqué (ou rien) */ }
    }
    const raquettes = [];
    for (const id of FICHIERS_RAQUETTE) {
      if (!this.fichiers.includes(id)) continue;
      try { raquettes.push(await charger(id)); } catch { /* variante indisponible */ }
    }
    if (raquettes.length) this.raquettesFichiers = raquettes;
    if (this.fondVoulu) this.fond(true);   // le murmure arrive pendant le match : on le lance
  }

  activer(on) {
    this.actif = on;
    if (on) this.initialiser();
    if (this.master) this.master.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.05);
  }

  jouer(buffer, vol, echo, { delai = 0, vitesse = 1 } = {}) {
    const ctx = this.ctx; if (!ctx || !buffer) return;
    try {
      const src = ctx.createBufferSource(); src.buffer = buffer; src.playbackRate.value = vitesse;
      const g = ctx.createGain(); g.gain.value = vol;
      src.connect(g); g.connect(this.master); if (echo) g.connect(this.echo);
      src.start(ctx.currentTime + delai);
    } catch { /* un son raté ne doit jamais bloquer le match */ }
  }

  // Le coup de raquette, quand on choisit son signe : un enregistrement au hasard s'il y en a.
  raquette(signe = 2) {
    const f = this.raquettesFichiers;
    if (f.length) this.jouer(f[Math.floor(Math.random() * f.length)], 0.7, false, { vitesse: 0.97 + Math.random() * 0.06 });
    else this.jouer(this.raquettes[signe], 0.7, true);
  }

  // Le murmure du public, en boucle pendant le match (seulement avec l'enregistrement).
  fond(on) {
    this.fondVoulu = on;
    const ctx = this.ctx;
    if (!ctx) return;
    try {
      if (on && !this.fondSource && this.buf.fond) {
        const src = ctx.createBufferSource(); src.buffer = this.buf.fond; src.loop = true;
        const g = ctx.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(FOND.entrePoints, ctx.currentTime, 0.8);
        src.connect(g); g.connect(this.master); src.start();
        this.fondSource = src; this.fondGain = g;
      } else if (!on && this.fondSource) {
        this.fondGain.gain.setTargetAtTime(0, ctx.currentTime, 0.6);
        this.fondSource.stop(ctx.currentTime + 3);
        this.fondSource = null; this.fondGain = null;
      }
    } catch { /* sans murmure */ }
  }
  // Pendant l'échange, le public baisse la voix ; entre les points, il reprend.
  calmer(echange) {
    if (!this.fondGain) return;
    try { this.fondGain.gain.setTargetAtTime(echange ? FOND.echange : FOND.entrePoints, this.ctx.currentTime, echange ? 0.25 : 0.6); } catch { /* rien */ }
  }
  // Le brouhaha des balles de set et de match (pas deux fois de suite en quelques secondes).
  tension() {
    if (!this.ctx || !this.buf.tension || this.ctx.currentTime - this.dernierTension < 5) return;
    this.dernierTension = this.ctx.currentTime;
    this.jouer(this.buf.tension, 0.45, false);
  }
  // Le « ooh » sur un point disputé.
  ooh() { this.jouer(this.buf.ooh, 0.5, true, { delai: 0.15 }); }
  // (si un son n'est pas encore prêt, il est simplement ignoré)

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
