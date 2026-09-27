// Tournois « Sit & Go » (onglet Duel) : salles publiques de 8 à 64 joueurs,
// départ dès que c'est plein, matchs lancés automatiquement.
import * as social from "./social-serveur.js";
import { TAILLES_SNG, dureeSng, resume } from "./tournoi-logique.js";

const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// ctx : { compte, ouvrirTournoi(id), chercherMatch() (lance le duel s'il y en a un qui m'attend) }
export function installerSng(ctx) {
  let uid = null, minuterie = 0, etat = null, dernierePhase = null;
  const dire = (t, erreur = false) => { $("sngMsg").textContent = t; $("sngMsg").classList.toggle("erreur", erreur); };

  function surSession(session) {
    uid = session?.user?.id || null;
    clearInterval(minuterie); etat = null;
    $("sngCard").hidden = !uid;
    if (!uid) return;
    rafraichir();
    // En salle ou en course : toutes les 4 s (signe de vie, départ, match suivant) ; sinon, seulement onglet Duel affiché.
    minuterie = setInterval(() => { if (etat?.mien || !$("viewDuel").hidden) rafraichir(); }, 4000);
  }
  ctx.compte.surConnexion(surSession);

  async function rafraichir() {
    if (!uid) return;
    try {
      if (etat?.mien?.phase === "inscriptions") await social.presenceSng();   // signe de vie en salle
      etat = await social.sallesSng();
    } catch { return; }
    const mien = etat.mien;
    // Le tournoi vient de démarrer : on montre le tableau, et le premier match arrive.
    if (mien?.phase === "en_cours" && dernierePhase === "inscriptions") { ctx.ouvrirTournoi(mien.id); }
    dernierePhase = mien?.phase ?? null;
    if (mien?.phase === "en_cours") ctx.chercherMatch();
    render();
  }

  function render() {
    const mien = etat?.mien;
    $("sngSalles").innerHTML = TAILLES_SNG.map(n => {
      const s = etat?.salles?.find(x => x.taille === n) || { inscrits: 0 };
      const ici = mien?.phase === "inscriptions" && mien.taille === n;
      return `<div class="joueur${ici ? " a-jouer" : ""}" data-taille="${n}">
        <span class="mini"><span class="trophee">${n}</span></span>
        <div style="min-width:0"><div class="jn">${n} joueurs</div><div class="jd">${s.inscrits}/${n} en salle · environ ${dureeSng(n)}</div></div>
        <div class="actions">${ici ? `<button class="petit alt" data-a="quitter">Quitter</button>` : mien ? "" : `<button class="petit" data-a="entrer">Entrer</button>`}</div></div>`;
    }).join("");
    const dernier = etat?.dernier;
    $("sngMien").hidden = !mien && !dernier;
    if (!mien && dernier) {
      $("sngMien").innerHTML = `<b>Ton dernier Sit & Go (${dernier.taille} joueurs) :</b> ${dernier.phase === "termine"
        ? (dernier.vainqueur?.id === uid ? "tu l'as remporté ! 🏆" : `remporté par ${esc(dernier.vainqueur?.pseudo ?? "?")}.`)
        : "ton parcours est terminé, le tournoi continue."} <button class="linkbtn" id="sngVoir">Voir le tableau</button>`;
      $("sngVoir").addEventListener("click", () => ctx.ouvrirTournoi(dernier.id));
    }
    if (mien) {
      const s = etat.salles.find(x => x.taille === mien.taille);
      $("sngMien").innerHTML = mien.phase === "inscriptions"
        ? `<b>En salle : ${s ? s.inscrits : "?"}/${mien.taille} joueurs.</b> Garde l'appli ouverte : le tournoi démarre dès que la salle est pleine, et ton premier match se lance tout seul.`
        : `<b>${esc(mien.nom)} : ${esc(resume(mien))}.</b> Reste dans l'appli : ton prochain match se lance tout seul (60 secondes pour le rejoindre). <button class="linkbtn" id="sngVoir">Voir le tableau</button>`;
      $("sngVoir")?.addEventListener("click", () => ctx.ouvrirTournoi(mien.id));
    }
  }

  $("sngSalles").addEventListener("click", async e => {
    const b = e.target.closest("button"); if (!b) return;
    const taille = +b.closest("[data-taille]").dataset.taille;
    b.disabled = true;
    try {
      if (b.dataset.a === "entrer") {
        const t = await social.rejoindreSng(taille);
        dire(t.phase === "en_cours" ? "La salle est pleine : c'est parti !" : "Te voilà en salle. Le tournoi démarre dès qu'elle est pleine.");
        dernierePhase = "inscriptions";
      } else { await social.quitterSng(); dire("Tu as quitté la salle."); }
    } catch (err) { dire(err.message, true); }
    rafraichir();
  });

  surSession(ctx.compte.session());
  return { rafraichir };
}
