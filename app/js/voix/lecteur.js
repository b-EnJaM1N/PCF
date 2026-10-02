// Lit les répliques des voix (arbitre, commentateurs, speaker, journaliste).
// Pour chaque réplique : si le fichier audio/<id>.mp3 existe, on le joue ;
// sinon, si l'option est activée, on utilise la voix de synthèse du téléphone.
// Sans fichier ni synthèse, la réplique reste seulement affichée par écrit.
// La liste des fichiers présents (audio/index.json) est créée automatiquement
// à chaque mise en ligne, il suffit donc de déposer les fichiers dans app/audio/.

// Le volume de chaque voix (0 à 1), mesuré sur les enregistrements ElevenLabs : l'arbitre en retrait,
// Roland (enregistré plus fort) ramené au niveau de Monique.
export const VOLUMES = { arbitre: 0.55, commentateur: 0.5, commentatrice: 0.85, speaker: 0.8, journaliste: 0.8 };
// L'arbitre ne dit à voix haute que l'essentiel (décision du porteur du projet) : le début de chaque set, « Jeu, set et match »
// (ou la victoire par forfait, l'abandon) et parfois « Silence, s'il vous plaît ». Ses autres annonces (balles de set et de match,
// scores) restent seulement affichées par écrit.
const ARBITRE_PARLE = /^arbitre_((premier|deuxieme|troisieme|quatrieme)_set|set_decisif|set_unique|troisieme_et_dernier_set|les_joueurs_sont_prets|silence|abandon|(jeu_set_et_match|forfait)_(jaune|rouge))_01$/;
export const ditAVoixHaute = r => r.role !== "arbitre" || ARBITRE_PARLE.test(r.id);

// La vitesse de lecture (1 = normale) : les commentaires doivent tenir entre deux coups. La hauteur de la voix ne change pas.
export const VITESSES = { arbitre: 1, commentateur: 1.15, commentatrice: 1.3, speaker: 1, journaliste: 1 };

const synth = typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;

export class LecteurVoix {
  constructor({ dossier = "audio/" } = {}) {
    this.dossier = dossier;
    this.fichiers = new Map();   // id → élément <audio>, créé la première fois qu'on en a besoin (null avant)
    this.actif = true;
    this.synthese = false;       // voix de synthèse (robotique), désactivée par défaut
    this.voix = null;
    this.jeton = 0;              // pour interrompre une séquence en cours
    this.enCours = null;
    if (synth) { this.choisirVoix(); synth.addEventListener?.("voiceschanged", () => this.choisirVoix()); }
  }

  get syntheseDisponible() { return !!synth; }
  // Cette réplique sera-t-elle entendue ?
  peutDire(r) { return this.actif && (this.fichiers.has(r.id) || (this.synthese && !!synth)); }
  get nbVoix() { return synth ? synth.getVoices().length : 0; }

  // Charge la liste des répliques enregistrées. Sans elle, tout passe par la synthèse.
  async charger() {
    try {
      const r = await fetch(this.dossier + "index.json", { cache: "no-cache" });
      if (!r.ok) return 0;
      const ids = await r.json();
      // Rien n'est téléchargé d'avance (des centaines de fichiers) : chaque réplique se charge quand elle est dite.
      for (const id of ids) this.fichiers.set(id, null);
    } catch { /* hors ligne ou pas encore de fichiers */ }
    return this.fichiers.size;
  }

  choisirVoix() {
    if (!synth) return;
    const vs = synth.getVoices().filter(v => /^fr/i.test(v.lang));
    this.voix = vs.find(v => /fr-FR/i.test(v.lang) && /(Thomas|Google|Daniel|Amélie|Audrey|Premium|Enhanced)/i.test(v.name))
      || vs.find(v => /fr-FR/i.test(v.lang)) || vs[0] || null;
  }

  arreter() {
    this.jeton++;
    if (this.enCours) { this.enCours.pause(); this.enCours = null; }
    if (synth) try { synth.cancel(); } catch { /* rien */ }
  }

  // Dit une suite de répliques, l'une après l'autre. `auDebut` est appelé quand le son démarre.
  dire(repliques, auDebut) {
    repliques = repliques.filter(ditAVoixHaute);
    if (!this.actif || !repliques.length) return;
    this.arreter();
    const jeton = this.jeton;
    let premiere = true;
    const suivante = i => {
      if (jeton !== this.jeton || i >= repliques.length) return;
      const r = repliques[i];
      const debut = () => { if (premiere) { premiere = false; auDebut?.(); } };
      const fin = () => suivante(i + 1);
      const audio = this.audio(r.id);
      if (audio) {
        audio.volume = VOLUMES[r.role] ?? 0.8;
        audio.preservesPitch = audio.mozPreservesPitch = audio.webkitPreservesPitch = true;
        audio.defaultPlaybackRate = audio.playbackRate = VITESSES[r.role] ?? 1;
      }
      if (audio) this.jouerFichier(audio, debut, fin, () => this.parler(r, debut, fin));
      else if (!this.synthese) fin();
      else this.parler(r, debut, fin);
    };
    suivante(0);
  }

  // L'élément <audio> d'une réplique enregistrée (créé à la première utilisation), ou null.
  audio(id) {
    if (!this.fichiers.has(id)) return null;
    let a = this.fichiers.get(id);
    if (!a) { a = new Audio(); a.preload = "auto"; a.src = `${this.dossier}${id}.mp3`; this.fichiers.set(id, a); }
    return a;
  }

  jouerFichier(audio, debut, fin, secours) {
    this.enCours = audio;
    audio.currentTime = 0;
    audio.onended = () => { this.enCours = null; fin(); };
    audio.play().then(debut).catch(() => { this.enCours = null; secours(); });
  }

  parler(r, debut, fin) {
    if (!synth || !this.synthese) { fin(); return; }
    try { synth.resume(); } catch { /* rien */ }
    if (!this.voix) this.choisirVoix();
    const u = new SpeechSynthesisUtterance(r.texte.replace(/[–-]/g, " "));
    u.lang = "fr-FR"; if (this.voix) u.voice = this.voix;
    // En attendant les vraies voix, on distingue un peu les personnages.
    const [rate, pitch] = { arbitre: [0.88, 0.8], commentateur: [1.1, 1.05], commentatrice: [0.92, 1.3], speaker: [0.95, 0.9], journaliste: [1, 1.15] }[r.role] || [1, 1];
    u.rate = rate; u.pitch = pitch;
    u.onstart = debut; u.onend = fin; u.onerror = fin;
    synth.speak(u);
  }
}
