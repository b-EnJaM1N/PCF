// Ambiance du court : coup de raquette à chaque coup, applaudissements comme au tennis,
// et un murmure de fond qui baisse pendant l'échange et reprend entre les points.
// La raquette et les applaudissements sont fabriqués par le code (sons.js), sauf si un vrai
// enregistrement portant leur nom est déposé dans app/audio/ (ex. public_ovation_01.mp3).
// Le murmure de fond, la tension et le « ooh » n'existent qu'en enregistrement : sans fichier, rien.
import { applaudissements, coupDeRaquette, echoStade, FOULES, normaliser, creteDe } from "./sons.js";
import { balle, pointDecisif } from "./regles.js";

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
  sifflets: "stade_sifflet_01",     // le public siffle (rare ; l'arbitre le rappelle à l'ordre)
  // Les huées (vrais sons de foule, Pixabay, choisis par le porteur du projet le 3 novembre) : longues (avec les gros sifflets),
  // courtes (un point de pénalité, un moment chaud).
  huees: "public_huees_01",
  hueesCourtes: "public_huees_02",
};
// Les réactions variées du public après un point (plusieurs versions de chacune, pour ne pas se répéter).
export const FICHIERS_REACTIONS = {
  allez: ["public_allez_01"],   // (28 octobre : le « Allez ! » n° 1 de l'essai, gardé à l'écoute ; les anciens sont dans l'historique)
  ohDecu: ["public_oh_decu_01", "public_oh_decu_02", "public_oh_decu_03"],   // (le 3 : un vrai son de foule, Pixabay)
  bravo: ["public_bravo_01", "public_bravo_02"],
  brouhaha: ["public_brouhaha_01", "public_brouhaha_02"],
  rires: ["public_rires_01", "public_rires_02"],
};
// La force moyenne d'un enregistrement (racine de la moyenne des carrés), et celle visée pour les réactions du public.
export const forceMoyenne = canaux => { let t = 0, n = 0; for (const c of canaux) for (let i = 0; i < c.length; i++) { t += c[i] * c[i]; n++; } return n ? Math.sqrt(t / n) : 0; };
const FORCE_REACTION = 0.12;
const VOLUME_REACTION = { allez: 0.55, ohDecu: 0.42, bravo: 0.38, brouhaha: 0.3, rires: 0.36, applaudir: 0.22 };
// Le coup de raquette : un son par signe (0 Pierre, 1 Ciseaux, 2 Feuille), et une version forte pour les grands moments
// (balle de set ou de match, point décisif) : [normal, fort].
export const FICHIERS_RAQUETTE_SIGNE = [
  ["raquette_pierre_01", "raquette_pierre_fort_01"],
  ["raquette_ciseaux_01", "raquette_ciseaux_fort_01"],
  ["raquette_feuille_01", "raquette_feuille_fort_01"],
];
export const FICHIERS_RAQUETTE = FICHIERS_RAQUETTE_SIGNE.flat();
// Les sons de stade, entre les points (décision du 23 octobre ; brouillon : docs/sons-stade-brouillon.md). En essai : les quatre
// premiers générés (orgue qui monte, corne, fanfare, sifflets) ; seuls ceux de STADE_JOUES sont joués par l'appli.
export const FICHIERS_STADE = {
  charge: "stade_charge_01", orgueMontee: "stade_orgue_montee_01", orgueDefense: "stade_orgue_defense_01", corne: "stade_corne_01",
  tambour: "stade_tambour_01", orgueEntree: "stade_orgue_entree_01", vuvuzela: "stade_vuvuzela_01", ole: "stade_ole_01",
  fanfare: "stade_fanfare_victoire_01",
  defense: "stade_defense_01",     // « Défense ! » (ElevenLabs, essai du 3 novembre, choisi par le porteur du projet)
  // Les chants de supporters « Hand-Slam » (ElevenLabs Music, créés par le porteur du projet le 3 novembre) : en entier pendant
  // la pause entre les sets et avant les grands matchs ; un extrait court pendant le match (une balle sauvée).
  chant1: "stade_chant_01", chant2: "stade_chant_02", chantCourt1: "stade_chant_court_01", chantCourt2: "stade_chant_court_02",
};

// Ceux qui sont joués : la trompette (« charge ») et le « Olé », avant une balle de set ou de match (et le « Olé » après une série) ;
// « Défense ! » quand je dois sauver une balle de set ou de match.
export const STADE_JOUES = ["charge", "ole", "defense", "chant1", "chant2", "chantCourt1", "chantCourt2"];

// Volume du murmure de fond : entre les points, et pendant l'échange (le public baisse la voix, sans se taire tout à fait :
// les commentaires ne doivent jamais sortir du silence).
// (3 novembre, remarque du porteur du projet : on l'entendait peu ; 0,34 et 0,15 avant.) Il monte avec l'enjeu (voir intensiteMatch) :
// jusqu'à « monte » fois plus fort quand le moment est décisif.
export const FOND = { entrePoints: 0.55, echange: 0.25, monte: 1.1 };   // (un peu plus fort le 3 novembre, après le vrai murmure : 0,45 et 0,2)   // (« monte » : 0,7 le 3 novembre, puis plus fort en fin de match)
// La couche « tension » : le brouhaha agité, en boucle, qui monte par-dessus le murmure quand le moment devient chaud
// (à partir de « des » d'intensité, jusqu'au volume « max » ; pendant l'échange, il baisse lui aussi).
export const TENSION = { des: 0.45, max: 0.45, echange: 0.4 };

// L'intensité du moment, de 0 (début de set, rien en jeu) à 1 (point décisif) : le public s'agite peu à peu en fin de set quand
// le score est serré, encore plus au set décisif, aux balles de set et de match (demande du porteur du projet, 3 novembre).
export function intensiteMatch(m) {
  if (!m || m.termine) return 0;
  const [a, b] = m.points, n = m.format.pointsParSet, sg = m.format.setsGagnants;
  const avance = Math.min(1, Math.max(a, b) / n), ecart = Math.abs(a - b);
  const serre = ecart <= 1 ? 1 : ecart === 2 ? 0.7 : ecart === 3 ? 0.45 : 0.25;
  let i = Math.pow(avance, 1.6) * serre * 0.7;
  if (sg > 1 && m.sets[0] === sg - 1 && m.sets[1] === sg - 1) i += 0.25;   // le set décisif
  else if (sg > 1 && Math.max(m.sets[0], m.sets[1]) === sg - 1) i += 0.1;   // un joueur n'est plus qu'à un set de la victoire
  const h = balle(m);
  if (h) i = Math.max(i, h.type === "match" ? 0.95 : 0.8);
  if (pointDecisif(m)) i = 1;
  return Math.min(1, Math.round(i * 100) / 100);
}
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
// « Ohhh… » (une série de 4 points ou plus vient d'être brisée) ou un brouhaha. Jamais deux points de suite (sauf le « Ohhh… »).
// Sur une égalité : seulement des rires, à la 4e égalité d'affilée (les deux joueurs s'obstinent sur le même signe), puis à la 7e.
// etat : { dernier } (gardé d'un point à l'autre) ; coups : les coups du match, celui-ci compris.
// intensite : celle du moment (intensiteMatch) : le public réagit moins en début de match, plus quand ça chauffe (× 0,6 à × 1,6).
export function reactionPoint(etat, evt, coups, rng = Math.random, intensite = 0.4) {
  if (!evt) return null;
  if (evt.egalite) { const n = egalitesAvantDernier(coups) + 1; return n === 4 || n === 7 ? "rires" : null; }
  const { serie, brisee } = series(coups), egalites = egalitesAvantDernier(coups);
  const f = 0.6 + intensite;
  let r = null;
  const x = rng();
  if (brisee >= 4 && x < 0.45) r = "ohDecu";                                         // une belle série vient d'être brisée
  else if (!etat.dernier) {
    // (3 novembre, remarque du porteur du projet : trop rares ; avant : 0,35/0,6, 0,4/0,55 et 0,08/0,15/0,19)
    if (egalites >= 1) r = x < 0.35 * f ? "bravo" : x < 0.65 * f ? "applaudir" : null;      // un point arraché après des égalités
    else if (serie >= 3) r = x < 0.4 * f ? "allez" : x < 0.62 * f ? "applaudir" : null;    // une série qui se construit
    else r = x < 0.16 * f ? "applaudir" : x < 0.22 * f ? "brouhaha" : x < 0.27 * f ? "allez" : null;
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
// Quand Roland, Monique (ou une autre voix) parlent, la salle baisse (le public, les applaudissements, l'écho), comme à la télévision
// sous la voix des commentateurs ; le coup de raquette, lui, reste au même niveau. Descente rapide, remontée en douceur.
export const SOUS_LA_VOIX = { niveau: 0.5, descente: 0.08, remontee: 0.45 };
// Crête sous laquelle un enregistrement est jugé muet (environ −26 dB).
export const SEUIL_MUET = 0.05;
const HAUTEUR = [0.8, 1.4, 1];   // Pierre grave, Ciseaux aigu, Feuille entre les deux

export class Ambiance {
  constructor() {
    this.ctx = null; this.master = null; this.echo = null; this.buf = {}; this.raquettes = []; this.raquettesFichiers = []; this.reactions = {}; this.fichiers = []; this.actif = true;
    this.fondVoulu = false; this.fondSource = null; this.fondGain = null; this.dernierTension = -99;
    this.niveau = 0; this.enEchange = false; this.tensionSource = null; this.tensionGain = null;
  }

  // Liste des enregistrements disponibles (lue dans audio/index.json).
  utiliserFichiers(ids) { this.fichiers = ids; if (this.ctx) this.chargerFichiers(); }

  // À appeler après un geste de l'utilisateur (règle des navigateurs mobiles).
  initialiser() {
    if (this.ctx || !AC) { if (this.ctx && this.ctx.state === "suspended") this.ctx.resume(); return; }
    try { this.ctx = new AC(); } catch { this.ctx = null; return; }
    const ctx = this.ctx, fs = ctx.sampleRate;
    this.master = ctx.createGain(); this.master.gain.value = this.actif ? 1 : 0; this.master.connect(ctx.destination);
    // La salle (tout sauf le coup de raquette) : elle baisse sous la voix des commentateurs.
    this.salle = ctx.createGain(); this.salle.gain.value = this.parleMaintenant ? SOUS_LA_VOIX.niveau : 1; this.salle.connect(this.master);
    // l'écho du stade, mélangé au son direct
    this.echo = ctx.createConvolver(); this.echo.buffer = this.tampon(echoStade(fs));
    const retour = ctx.createGain(); retour.gain.value = 0.35; this.echo.connect(retour); retour.connect(this.salle);

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
    // Les sons de stade joués par l'appli (3 novembre : la trompette et le « Olé », vrais sons choisis par le porteur du projet).
    for (const type of STADE_JOUES) {
      const id = FICHIERS_STADE[type];
      if (!this.fichiers.includes(id) || this.charges?.has(id)) continue;
      try { this.buf[type] = await charger(id); (this.charges ||= new Set()).add(id); } catch { /* sans ce son */ }
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

  // Une voix parle (true) ou se tait (false) : la salle baisse, puis remonte.
  parole(on) {
    this.parleMaintenant = on;
    if (!this.salle) return;
    try { this.salle.gain.setTargetAtTime(on ? SOUS_LA_VOIX.niveau : 1, this.ctx.currentTime, on ? SOUS_LA_VOIX.descente : SOUS_LA_VOIX.remontee); } catch { /* rien */ }
  }

  jouer(buffer, vol, echo, { delai = 0, vitesse = 1, salle = true } = {}) {
    const ctx = this.ctx; if (!ctx || !buffer) return null;
    try {
      const src = ctx.createBufferSource(); src.buffer = buffer; src.playbackRate.value = vitesse;
      const g = ctx.createGain(); g.gain.value = vol;
      src.connect(g); g.connect(salle ? this.salle : this.master); if (echo) g.connect(this.echo);
      src.start(ctx.currentTime + delai);
      return { src, g };
    } catch { return null; /* un son raté ne doit jamais bloquer le match */ }
  }

  // Le coup de raquette, quand on choisit son signe : l'enregistrement de ce signe (sa version forte dans les grands moments ;
  // sans version forte, la normale, plus fort et avec l'écho du stade), sinon le son fabriqué (plus fort dans les grands moments).
  raquette(signe = 2, fort = false) {
    const f = this.raquettesFichiers[signe] || [];
    const b = (fort && f[1]) || f[0];
    if (b) this.jouer(b, fort ? 1 : 0.7, fort && !f[1], { vitesse: 0.98 + Math.random() * 0.04, salle: false });
    else this.jouer(this.raquettes[signe], fort ? 0.9 : 0.7, true, { salle: false });
  }

  // Le smash gagnant (3 novembre, demande du porteur du projet : un son plus fort) : la raquette, version forte, doublée d'un
  // second impact avec l'écho du stade, et la clameur du public juste après.
  smash(signe = 2) {
    const f = this.raquettesFichiers[signe] || [], b = f[1] || f[0] || this.raquettes[signe];
    if (b) { this.jouer(b, 1, true, { salle: false }); this.jouer(b, 0.6, true, { delai: 0.06, vitesse: 0.85, salle: false }); }
    if (this.buf.clameur) this.jouer(this.buf.clameur, 0.55, true, { delai: 0.25 });
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
        const g = ctx.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(this.volumeFond(), ctx.currentTime, 0.8);
        g.connect(this.salle);
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
        this.arreterChant();
        this.fondGain.gain.setTargetAtTime(0, ctx.currentTime, 0.6);
        for (const src of this.fondSource) src.stop(ctx.currentTime + 3);
        this.fondSource = null; this.fondGain = null;
        if (this.tensionGain) {
          this.tensionGain.gain.setTargetAtTime(0, ctx.currentTime, 0.6);
          for (const src of this.tensionSource) src.stop(ctx.currentTime + 3);
          this.tensionSource = null; this.tensionGain = null;
        }
        this.niveau = 0;
      }
      if (on && this.fondSource && !this.tensionSource) this.lancerTension();
    } catch { /* sans murmure */ }
  }
  // La couche « tension » (le brouhaha agité), en boucle, muette tant que le moment n'est pas chaud.
  lancerTension() {
    const ctx = this.ctx;
    if (!ctx || !this.buf.tension) return;
    const gt = ctx.createGain(); gt.gain.value = 0; gt.connect(this.salle);
    const dt = this.buf.tension.duration;
    this.tensionSource = [[-0.3, 1, 0], [0.3, 0.96, dt / 2]].map(([cote, vitesse, depart]) => {
      const src = ctx.createBufferSource(); src.buffer = this.buf.tension; src.loop = true; src.playbackRate.value = vitesse;
      let sortie = src;
      if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = cote; src.connect(p); sortie = p; }
      sortie.connect(gt); src.start(ctx.currentTime, depart % dt);
      return src;
    });
    this.tensionGain = gt;
    this.appliquer();
  }
  // Pendant l'échange, le public baisse la voix ; entre les points, il reprend.
  calmer(echange) {
    // L'échange commence : la réaction du point précédent ne déborde pas sur le suivant. Les applaudissements et le brouhaha
    // s'éteignent en douceur ; les cris (« Allez ! », « Bravo ! », « Ohhh… ») vont au bout de leur mot, un peu moins fort.
    if (echange && this.bravos) {
      const { son, parle } = this.bravos;
      try { son.g.gain.setTargetAtTime(parle ? son.g.gain.value * 0.55 : 0, this.ctx.currentTime, parle ? 0.15 : 0.3); } catch { /* rien */ }
      this.bravos = null;
    }
    this.enEchange = echange;
    if (echange) this.arreterChant();   // (le chant de supporters s'éteint quand le jeu reprend)
    this.appliquer(echange ? 0.25 : 0.6);
  }
  // L'intensité du moment (intensiteMatch) : le murmure et la couche « tension » suivent, en douceur.
  intensite(i) { this.niveau = Math.max(0, Math.min(1, i || 0)); this.appliquer(1.2); }
  // (un chant de stade en cours : le public reste au niveau d'entre les points, même si l'échange a commencé)
  enEchangeCalme() { return this.enEchange && !(this.ctx && this.ctx.currentTime < (this.porteJusqu || 0)); }
  volumeFond() { return (this.enEchangeCalme() ? FOND.echange : FOND.entrePoints) * (1 + FOND.monte * this.niveau); }
  volumeTension() {
    const t = Math.max(0, (this.niveau - TENSION.des) / (1 - TENSION.des));
    return TENSION.max * t * (this.enEchangeCalme() ? TENSION.echange : 1);
  }
  appliquer(lissage = 0.6) {
    if (!this.ctx) return;
    try {
      if (this.fondGain) this.fondGain.gain.setTargetAtTime(this.volumeFond(), this.ctx.currentTime, lissage);
      if (this.tensionGain) this.tensionGain.gain.setTargetAtTime(this.volumeTension(), this.ctx.currentTime, lissage);
    } catch { /* rien */ }
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
    // Les cris enregistrés vont jusqu'au bout ; les applaudissements (et le brouhaha) s'éteignent au bout d'un moment.
    const parle = versions.length > 0 && type !== "brouhaha" && type !== "applaudir";
    const duree = parle || type === "brouhaha" ? buffer.duration / vitesse : APPLAUDIR.duree;
    try { son.g.gain.setTargetAtTime(0, this.ctx.currentTime + delai + duree, 0.25); son.src.stop(this.ctx.currentTime + delai + duree + 1.5); } catch { /* rien */ }
    this.bravos = { son, parle };
  }
  // Le « ooh » sur un point disputé.
  ooh() { this.jouer(this.buf.ooh, 0.5, true, { delai: 0.15 }); }
  // Les sifflets du public (renvoie leur durée en secondes, 0 s'ils ne sont pas prêts).
  // Un chant de supporters en entier (pause entre les sets, avant un grand match) : il baisse sous les commentaires, et s'éteint
  // en douceur dès que l'échange commence (calmer) ou qu'un autre chant démarre. On alterne les deux chants.
  chanter({ vol = 0.55, delai = 0.6 } = {}) {
    this.arreterChant();
    this.chantSuivant = this.chantSuivant === "chant1" ? "chant2" : "chant1";
    const b = this.buf[this.chantSuivant] || this.buf.chant1, son = b && this.jouer(b, vol, true, { delai });
    if (son) this.chantEnCours = son;
    return !!son;
  }
  arreterChant(lissage = 0.8) {
    const c = this.chantEnCours; if (!c) return;
    this.chantEnCours = null;
    try { c.g.gain.setTargetAtTime(0, this.ctx.currentTime, lissage); c.src.stop(this.ctx.currentTime + lissage * 6); } catch { /* rien */ }
  }
  // Un son de stade (la trompette, le « Olé ») ; coupe : le faire taire en douceur au bout de tant de secondes. Renvoie sa durée
  // (0 s'il n'est pas prêt).
  // salle : false : il ne baisse pas sous la voix des commentateurs (le chant doit s'entendre).
  stade(type, { vol = 0.4, delai = 0.3, coupe = null, salle = true } = {}) {
    const b = this.buf[type], son = b && this.jouer(b, vol, true, { delai, salle });
    if (!son) return 0;
    // Pendant le chant, le murmure ne baisse pas pour l'échange (sinon, un creux juste avant le chant : on aurait dit une coupure).
    const fin = delai + (coupe ?? b.duration);
    this.porteJusqu = this.ctx.currentTime + fin;
    this.appliquer(0.3);
    clearTimeout(this.finPorte); this.finPorte = setTimeout(() => this.appliquer(0.8), fin * 1000);
    if (coupe !== null) try { son.g.gain.setTargetAtTime(0, this.ctx.currentTime + delai + coupe, 0.4); son.src.stop(this.ctx.currentTime + delai + coupe + 3); } catch { /* rien */ }
    return b.duration;
  }
  // Les huées : courtes (environ 6 secondes) ou longues ; coupe : les faire taire en douceur au bout de tant de secondes
  // (l'arbitre a parlé).
  huees({ court = true, delai = 0.3, vol = 0.35, coupe = null } = {}) {
    const son = this.jouer(court ? this.buf.hueesCourtes : this.buf.huees, vol, true, { delai, vitesse: 0.97 + Math.random() * 0.06 });
    if (!son || coupe === null) return !!son;
    try { son.g.gain.setTargetAtTime(0, this.ctx.currentTime + delai + coupe, 0.5); son.src.stop(this.ctx.currentTime + delai + coupe + 4); } catch { /* rien */ }
    return true;
  }
  // Quelques sifflets courts, sans l'arbitre : le public s'agite à un moment chaud (ils s'éteignent au bout d'environ une seconde).
  siffletsCourts(delai = 0.3) {
    const son = this.buf.sifflets && this.jouer(this.buf.sifflets, 0.3, true, { delai, vitesse: 0.95 + Math.random() * 0.1 });
    if (!son) return;
    try { son.g.gain.setTargetAtTime(0, this.ctx.currentTime + delai + 1.1, 0.25); son.src.stop(this.ctx.currentTime + delai + 3); } catch { /* rien */ }
  }
  sifflets(delai = 0) { return this.buf.sifflets && this.jouer(this.buf.sifflets, 0.45, true, { delai }) ? this.buf.sifflets.duration : 0; }
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
