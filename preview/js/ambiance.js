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
// Les réactions variées du public après un point (plusieurs versions de chacune, pour ne pas se répéter).
export const FICHIERS_REACTIONS = {
  allez: ["public_allez_01", "public_allez_02", "public_allez_03"],
  ohDecu: ["public_oh_decu_01", "public_oh_decu_02"],
  bravo: ["public_bravo_01", "public_bravo_02"],
  brouhaha: ["public_brouhaha_01", "public_brouhaha_02"],
};
// La force moyenne d'un enregistrement (racine de la moyenne des carrés), et celle visée pour les réactions du public.
export const forceMoyenne = canaux => { let t = 0, n = 0; for (const c of canaux) for (let i = 0; i < c.length; i++) { t += c[i] * c[i]; n++; } return n ? Math.sqrt(t / n) : 0; };
const FORCE_REACTION = 0.12;
const VOLUME_REACTION = { allez: 0.38, ohDecu: 0.42, bravo: 0.38, brouhaha: 0.3, applaudir: 0.22 };
// Le coup de raquette : un son par signe (0 Pierre, 1 Ciseaux, 2 Feuille), et une version forte pour les grands moments
// (balle de set ou de match, point décisif) : [normal, fort].
export const FICHIERS_RAQUETTE_SIGNE = [
  ["raquette_pierre_01", "raquette_pierre_fort_01"],
  ["raquette_ciseaux_01", "raquette_ciseaux_fort_01"],
  ["raquette_feuille_01", "raquette_feuille_fort_01"],
];
export const FICHIERS_RAQUETTE = FICHIERS_RAQUETTE_SIGNE.flat();

// Volume du murmure de fond : entre les points, et pendant l'échange (le public baisse la voix, sans se taire tout à fait :
// les commentaires ne doivent jamais sortir du silence).
export const FOND = { entrePoints: 0.34, echange: 0.15 };
// Les petits applaudissements après un point gagné, comme au tennis : volume et vitesse tirés au hasard (jamais deux fois pareils),
// courts (ils s'éteignent au bout d'une seconde environ, et tout de suite si l'échange suivant commence).
export const APPLAUDIR = { vol: [0.16, 0.26], vitesse: [0.93, 1.08], duree: 1.1 };

// Combien de points de suite le gagnant de ce coup vient d'enchaîner (égalités ignorées), et la série qu'il vient de briser.
export function series(coups) {
  const gagnes = coups.filter(c => c.gagnant !== null && c.gagnant !== undefined).map(c => c.gagnant);
  if (!gagnes.length) return { serie: 0, brisee: 0 };
  const g = gagnes.at(-1); let serie = 0, brisee = 0, i = gagnes.length - 1;
  while (i >= 0 && gagnes[i] === g) { serie++; i--; }
  while (i >= 0 && gagnes[i] !== g) { brisee++; i--; }
  return { serie, brisee };
}

// La réaction du public après un point : rien (le murmure suffit), des applaudissements, « Allez ! », « Bravo ! »,
// « Ohhh… » (une série de 4 points ou plus vient d'être brisée) ou un brouhaha. Jamais deux points de suite (sauf le « Ohhh… »),
// jamais sur une égalité. etat : { dernier } (gardé d'un point à l'autre) ; coups : les coups du match, celui-ci compris.
export function reactionPoint(etat, evt, coups, rng = Math.random) {
  if (!evt || evt.egalite) return null;
  const { serie, brisee } = series(coups), egalites = egalitesAvantDernier(coups);
  let r = null;
  const x = rng();
  if (brisee >= 4 && x < 0.45) r = "ohDecu";                                         // une belle série vient d'être brisée
  else if (!etat.dernier) {
    if (egalites >= 1) r = x < 0.35 ? "bravo" : x < 0.6 ? "applaudir" : null;      // un point arraché après des égalités
    else if (serie >= 3) r = x < 0.4 ? "allez" : x < 0.55 ? "applaudir" : null;    // une série qui se construit
    else r = x < 0.08 ? "applaudir" : x < 0.15 ? "brouhaha" : x < 0.19 ? "allez" : null;
  }
  etat.dernier = !!r;
  return r;
}

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
    this.ctx = null; this.master = null; this.echo = null; this.buf = {}; this.raquettes = []; this.raquettesFichiers = []; this.reactions = {}; this.fichiers = []; this.actif = true;
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
    for (const [type, ids] of Object.entries(FICHIERS_REACTIONS)) {
      for (const id of ids) {
        if (!this.fichiers.includes(id) || this.charges?.has(id)) continue;
        try {
          // Les enregistrements n'ont pas tous le même volume : on les ramène à la même force moyenne (sans exagérer).
          const b = await charger(id), canaux = Array.from({ length: b.numberOfChannels }, (_, c) => b.getChannelData(c));
          (this.reactions[type] ||= []).push({ b, g: Math.min(4, FORCE_REACTION / (forceMoyenne(canaux) || 1)) });
          (this.charges ||= new Set()).add(id);
        } catch { /* sans ce son */ }
      }
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
    const ctx = this.ctx; if (!ctx || !buffer) return null;
    try {
      const src = ctx.createBufferSource(); src.buffer = buffer; src.playbackRate.value = vitesse;
      const g = ctx.createGain(); g.gain.value = vol;
      src.connect(g); g.connect(this.master); if (echo) g.connect(this.echo);
      src.start(ctx.currentTime + delai);
      return { src, g };
    } catch { return null; /* un son raté ne doit jamais bloquer le match */ }
  }

  // Le coup de raquette, quand on choisit son signe : l'enregistrement de ce signe (sa version forte dans les grands moments ;
  // sans version forte, la normale, plus fort et avec l'écho du stade), sinon le son fabriqué (plus fort dans les grands moments).
  raquette(signe = 2, fort = false) {
    const f = this.raquettesFichiers[signe] || [];
    const b = (fort && f[1]) || f[0];
    if (b) this.jouer(b, fort ? 1 : 0.7, fort && !f[1], { vitesse: 0.98 + Math.random() * 0.04 });
    else this.jouer(this.raquettes[signe], fort ? 0.9 : 0.7, true);
  }

  // Le murmure du public, en boucle pendant le match (seulement avec l'enregistrement).
  fond(on) {
    this.fondVoulu = on;
    const ctx = this.ctx;
    if (!ctx) return;
    try {
      if (on && !this.fondSource && this.buf.fond) {
        // Deux couches du même enregistrement, décalées, l'une un peu à gauche et l'autre un peu à droite (et un peu plus grave) :
        // une foule plus dense et plus vivante, qui ne se répète pas à l'oreille.
        const g = ctx.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(FOND.entrePoints, ctx.currentTime, 0.8);
        g.connect(this.master);
        const duree = this.buf.fond.duration;
        const sources = [[-0.35, 1, 0, 1], [0.35, 0.94, duree / 2, 0.75]].map(([cote, vitesse, depart, vol]) => {
          const src = ctx.createBufferSource(); src.buffer = this.buf.fond; src.loop = true; src.playbackRate.value = vitesse;
          const v = ctx.createGain(); v.gain.value = vol;
          let sortie = v;
          if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = cote; v.connect(p); sortie = p; }
          src.connect(v); sortie.connect(g); src.start(ctx.currentTime, depart % duree);
          return src;
        });
        this.fondSource = sources; this.fondGain = g;
      } else if (!on && this.fondSource) {
        this.fondGain.gain.setTargetAtTime(0, ctx.currentTime, 0.6);
        for (const src of this.fondSource) src.stop(ctx.currentTime + 3);
        this.fondSource = null; this.fondGain = null;
      }
    } catch { /* sans murmure */ }
  }
  // Pendant l'échange, le public baisse la voix ; entre les points, il reprend.
  calmer(echange) {
    // l'échange commence : les applaudissements du point précédent s'éteignent aussitôt (ils ne débordent pas sur le suivant)
    if (echange && this.bravos) { try { this.bravos.g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08); } catch { /* rien */ } this.bravos = null; }
    if (!this.fondGain) return;
    try { this.fondGain.gain.setTargetAtTime(echange ? FOND.echange : FOND.entrePoints, this.ctx.currentTime, echange ? 0.25 : 0.6); } catch { /* rien */ }
  }
  // Le brouhaha des balles de set et de match (pas deux fois de suite en quelques secondes).
  tension() {
    if (!this.ctx || !this.buf.tension || this.ctx.currentTime - this.dernierTension < 5) return;
    this.dernierTension = this.ctx.currentTime;
    this.jouer(this.buf.tension, 0.45, false);
  }
  // La réaction du public après un point (voir reactionPoint). Sans l'enregistrement voulu : des applaudissements pour
  // « Bravo ! », rien pour les autres. Courte : elle s'éteint d'elle-même, et tout de suite quand l'échange suivant commence.
  reagir(type) {
    const h = (a, b) => a + Math.random() * (b - a), delai = h(0.05, 0.2);
    const versions = this.reactions[type] || [];
    let buffer = null, vitesse = 1, egal = 1;
    if (versions.length) {
      const choix = versions.filter(v => v !== this.derniereReaction), v = (choix.length ? choix : versions)[Math.floor(Math.random() * (choix.length || versions.length))];
      this.derniereReaction = v; buffer = v.b; egal = v.g; vitesse = h(0.97, 1.03);
    } else if (type === "applaudir" || type === "bravo") { buffer = this.buf.point; vitesse = h(...APPLAUDIR.vitesse); }
    if (!buffer) return;
    const vol = (type === "applaudir" || !versions.length ? h(...APPLAUDIR.vol) : VOLUME_REACTION[type]) * egal;
    const son = this.jouer(buffer, vol, true, { delai, vitesse });
    if (!son) return;
    const duree = type === "brouhaha" || type === "ohDecu" ? buffer.duration : APPLAUDIR.duree;
    try { son.g.gain.setTargetAtTime(0, this.ctx.currentTime + delai + duree, 0.25); son.src.stop(this.ctx.currentTime + delai + duree + 1.5); } catch { /* rien */ }
    this.bravos = son;
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
