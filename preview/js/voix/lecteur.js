// Lit les répliques de l'arbitre et du commentateur.
// Pour chaque réplique : si le fichier audio/<id>.mp3 existe, on le joue ;
// sinon, si l'option est activée, on utilise la voix de synthèse du téléphone.
// Sans fichier ni synthèse, la réplique reste seulement affichée par écrit.
// La liste des fichiers présents (audio/index.json) est créée automatiquement
// à chaque mise en ligne, il suffit donc de déposer les fichiers dans app/audio/.

const synth = typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;

export class LecteurVoix {
  constructor({ dossier = "audio/" } = {}) {
    this.dossier = dossier;
    this.fichiers = new Map();   // id → élément <audio> préchargé
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
      for (const id of ids) {
        const a = new Audio(); a.preload = "auto"; a.src = `${this.dossier}${id}.mp3`;
        this.fichiers.set(id, a);
      }
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
    if (!this.actif || !repliques.length) return;
    this.arreter();
    const jeton = this.jeton;
    let premiere = true;
    const suivante = i => {
      if (jeton !== this.jeton || i >= repliques.length) return;
      const r = repliques[i];
      const debut = () => { if (premiere) { premiere = false; auDebut?.(); } };
      const fin = () => suivante(i + 1);
      const audio = this.fichiers.get(r.id);
      if (audio) this.jouerFichier(audio, debut, fin, () => this.parler(r, debut, fin));
      else if (!this.synthese) fin();
      else this.parler(r, debut, fin);
    };
    suivante(0);
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
    if (r.role === "arbitre") { u.rate = 0.88; u.pitch = 0.8; } else { u.rate = 1.08; u.pitch = 1.05; }
    u.onstart = debut; u.onend = fin; u.onerror = fin;
    synth.speak(u);
  }
}
