// La bulle « 🟢 N en ligne » en haut à droite (26 novembre, demande du porteur du projet ; sur la version de test d'abord,
// nouveautes.js « enLigne »). Chaque appli ouverte et à l'écran se signale sur un canal de présence Supabase (en temps réel,
// sans table ni étape SQL), avec ou sans compte ; un téléphone compte une fois, même avec plusieurs onglets. Toutes les versions
// se signalent (pour que le nombre soit juste) ; seule la version de test affiche la bulle pour l'instant.
// Ici, le calcul (testé) et le branchement au serveur ; l'affichage est dans app.js.
export const CANAL_EN_LIGNE = "en-ligne";

// L'état de présence de Supabase ({ clé: [ { … }, … ] }) → le nombre de téléphones en ligne.
export const compterEnLigne = etat => Object.values(etat || {}).filter(l => Array.isArray(l) && l.length).length;

function cleAppareil() {
  try {
    let id = localStorage.getItem("hs_appareil_en_ligne");
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("hs_appareil_en_ligne", id); }
    return id;
  } catch { return Math.random().toString(36).slice(2); }
}

// client : le client Supabase ; surNombre(n) : à chaque changement. Renvoie une fonction pour arrêter.
export function suivreEnLigne(client, surNombre) {
  let canal = null, abonne = false;
  try {
    canal = client.channel(CANAL_EN_LIGNE, { config: { presence: { key: cleAppareil() } } });
    canal.on("presence", { event: "sync" }, () => surNombre(compterEnLigne(canal.presenceState())));
    const signaler = () => {
      if (!abonne) return;
      if (document.hidden) canal.untrack().catch(() => {});
      else canal.track({ depuis: Date.now() }).catch(() => {});
    };
    canal.subscribe(statut => { if (statut === "SUBSCRIBED") { abonne = true; signaler(); } });
    document.addEventListener("visibilitychange", signaler);
    return () => { document.removeEventListener("visibilitychange", signaler); try { client.removeChannel(canal); } catch { /* rien */ } };
  } catch { return () => {}; }
}
