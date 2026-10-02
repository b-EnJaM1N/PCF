// Ambiance du court : coup de raquette à chaque coup, applaudissements comme au tennis,
// et un murmure de fond qui baisse pendant l'échange et reprend entre les points.
// La raquette et les applaudissements sont fabriqués par le code (sons.js), sauf si un vrai
// enregistrement portant leur nom est déposé dans app/audio/ (ex. public_ovation_01.mp3).
// Le murmure de fond, la tension et le « ooh » n'existent qu'en enregistrement : sans fichier, rien.
import { applaudissements, coupDeRaquette, echoStade, FOULES, normaliser, creteDe } from "./sons.js";

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
// Le coup de raquette : un son par signe (0 Pierre, 1 Ciseaux, 2 Feuille), et une version forte pour les grands moments
// (balle de set ou de match, point décisif) : [normal, fort].
export const FICHIERS_RAQUETTE_SIGNE = [
  ["raquette_pierre_01", "raquette_pierre_fort_01"],
  ["raquette_ciseaux_01", "raquette_ciseaux_fort_01"],
  ["raquette_feuille_01", "raquette_feuille_fort_01"],
];
export const FICHIERS_RAQUETTE = FICHIERS_RAQUETTE_SIGNE.flat();

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
// Crête sous laquelle un enregistrement est jugé muet (environ −26 dB).
export const SEUIL_MUET = 0.05;
const HAUTEUR = [0.8, 1.4, 1];   // Pierre grave, Ciseaux aigu, Feuille entre les deux

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
    for (const [k, ids] of FICHIERS_RAQUETTE_SIGNE.entries()) {
      for (const [f, id] of ids.entries()) {
        if (!this.fichiers.includes(id)) continue;
        try {
          // Tous les coups au même niveau (les enregistrements n'ont pas le même volume) : la version forte claque vraiment plus fort.
          const b = await charger(id), canaux = Array.from({ length: b.numberOfChannels }, (_, c) => b.getChannelData(c));
          // Un enregistrement presque muet (ça arrive avec ElevenLabs) : on garde le son fabriqué plutôt que d'amplifier du souffle.
          if (creteDe(canaux) < SEUIL_MUET) continue;
          normaliser(canaux, 0.95);
          (this.raquettesFichiers[k] ||= [])[f] = b;
        } catch { /* son indisponible : le son fabriqué */ }
      }
    }
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

  // Le coup de raquette, quand on choisit son signe : l'enregistrement de ce signe (sa version forte dans les grands moments),
  // sinon le son fabriqué (plus fort dans les grands moments).
  raquette(signe = 2, fort = false) {
    const f = this.raquettesFichiers[signe] || [];
    const b = (fort && f[1]) || f[0];
    if (b) this.jouer(b, fort && f[1] ? 1 : 0.7, false, { vitesse: 0.98 + Math.random() * 0.04 });
    else this.jouer(this.raquettes[signe], fort ? 0.9 : 0.7, true);
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
