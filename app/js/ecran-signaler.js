// Signaler un joueur : pseudo choquant, avatar, ou comportement. Trois signalements du même pseudo
// par des joueurs différents le retirent automatiquement (voir supabase/etape-10-moderation.sql).
import * as social from "./social-serveur.js";

const $ = id => document.getElementById(id);

export function installerSignalement() {
  let joueur = null, motif = null;
  const dire = (t, erreur = false) => { $("sgMsg").textContent = t; $("sgMsg").classList.toggle("erreur", erreur); };
  const fermer = () => { $("signaler").classList.remove("show"); joueur = null; };

  document.querySelectorAll("#sgMotifs button").forEach(b => b.addEventListener("click", () => {
    motif = b.dataset.m;
    document.querySelectorAll("#sgMotifs button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    $("sgEnvoyer").disabled = false;
  }));
  $("sgAnnuler").addEventListener("click", fermer);
  $("sgEnvoyer").addEventListener("click", async () => {
    if (!joueur || !motif) return;
    $("sgEnvoyer").disabled = true; dire("Envoi…");
    try {
      const r = await social.signalerJoueur(joueur.id, motif, $("sgDetail").value.trim());
      dire(r === "deja" ? "Tu as déjà signalé ce joueur pour ce motif. Merci !" : "Merci : ton signalement a bien été envoyé.");
      $("sgEnvoyer").hidden = true; $("sgAnnuler").textContent = "Fermer";
    } catch (e) { dire(e.message, true); $("sgEnvoyer").disabled = false; }
  });

  // j : { id (identifiant du compte), pseudo, numero }
  return function ouvrir(j) {
    joueur = j; motif = null;
    $("sgQui").textContent = `${j.pseudo}${j.numero ? `#${j.numero}` : ""}`;
    document.querySelectorAll("#sgMotifs button").forEach(x => x.setAttribute("aria-pressed", "false"));
    $("sgDetail").value = ""; dire("");
    $("sgEnvoyer").hidden = false; $("sgEnvoyer").disabled = true; $("sgAnnuler").textContent = "Annuler";
    $("signaler").classList.add("show");
  };
}
