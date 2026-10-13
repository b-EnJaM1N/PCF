// Tournois « Sit & Go » (menu Jouer › Sit & Go) : salles publiques de 8 à 64 joueurs,
// départ dès que c'est plein, matchs lancés automatiquement.
import * as social from "./social-serveur.js";
import { TAILLES_SNG, dureeSng, resume } from "./tournoi-logique.js";
import { gainsSng, gainDuel, MISES } from "./jetons-logique.js";
import { lire, ecrire } from "./stockage.js";

const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// ctx : { compte, ouvrirTournoi(id), chercherMatch() (lance le duel s'il y en a un qui m'attend), signaler(cle, valeur) }
export function installerSng(ctx) {
  let uid = null, minuterie = 0, etat = null, dernierePhase = null;
  let mise = [0, ...MISES].includes(lire("sngMise", 0)) ? lire("sngMise", 0) : 0;
  const dire = (t, erreur = false) => { $("sngMsg").textContent = t; $("sngMsg").classList.toggle("erreur", erreur); };

  function surSession(session) {
    uid = session?.user?.id || null;
    clearInterval(minuterie); etat = null;
    $("sngCard").hidden = !uid; $("sngHors").hidden = !!uid;
    if (!uid) { ctx.signaler("sng", null); return; }
    rafraichir();
    // En salle ou en course : toutes les 4 s (signe de vie, départ, match suivant) ; sinon, seulement quand le menu Jouer ou la page Sit & Go est affiché.
    minuterie = setInterval(() => { if (etat?.mien || !$("viewSng").hidden || !$("viewJouer").hidden) rafraichir(); }, 4000);
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
    ctx.signaler("sng", mien || null);
    if (mien?.phase === "en_cours") ctx.chercherMatch();
    render();
  }

  // La salle d'une taille et d'une mise (à mise : la liste de l'étape 28 ; sans mise à 2 : celle du heads-up, étape 27).
  const salle = (taille, mise) => mise ? (etat?.salles_mises || []).find(x => x.taille === taille && x.mise === mise)
    : taille === 2 ? (etat?.heads_up || []).find(x => x.mise === 0) : (etat?.salles || []).find(x => x.taille === taille);
  // Ce qu'on gagne dans une salle à mise : tout au gagnant à 2 ; sinon les places payées, comme au poker.
  const NOMS = ["1er", "2e", "3e-4e", "5e-8e"];
  const gainsSalle = (taille, mise) => (taille === 2 ? `le gagnant remporte ${gainDuel(mise)}`
    : gainsSng(mise, taille).map((g, i) => `${NOMS[i]} : ${g}`).join(", "));

  function render() {
    const mien = etat?.mien;
    // Les salles de la mise choisie, de 2 (heads-up) à 64 joueurs.
    document.querySelectorAll("#sngMise button").forEach(x => x.setAttribute("aria-pressed", String(+x.dataset.v === mise)));
    $("sngSalles").innerHTML = TAILLES_SNG.map(n => {
      const s = salle(n, mise) || { inscrits: 0 };
      const ici = mien?.phase === "inscriptions" && mien.taille === n && (mien.mise || 0) === mise;
      const gains = mise ? gainsSalle(n, mise) : `environ ${dureeSng(n)}`;
      return `<div class="joueur${ici ? " a-jouer" : ""}" data-taille="${n}" data-mise="${mise}">
        <span class="mini"><span class="trophee">${n}</span></span>
        <div style="min-width:0"><div class="jn">${n === 2 ? "Heads-up · 2 joueurs" : `${n} joueurs`}</div><div class="jd">${s.inscrits}/${n} en salle · ${gains}</div></div>
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
      const s = salle(mien.taille, mien.mise || 0);
      $("sngMien").innerHTML = mien.phase === "inscriptions"
        ? `<b>En salle : ${s ? s.inscrits : "?"}/${mien.taille} joueurs.</b> Garde l'appli ouverte : le tournoi démarre dès que la salle est pleine, et ton premier match se lance tout seul.`
        : `<b>${esc(mien.nom)} : ${esc(resume(mien))}.</b> Reste dans l'appli : ton prochain match se lance tout seul (60 secondes pour le rejoindre). <button class="linkbtn" id="sngVoir">Voir le tableau</button>`;
      $("sngVoir")?.addEventListener("click", () => ctx.ouvrirTournoi(mien.id));
    }
  }

  const entrer = async e => {
    const b = e.target.closest("button"); if (!b) return;
    const ligne = b.closest("[data-taille]"), taille = +ligne.dataset.taille, mise = +(ligne.dataset.mise || 0);
    b.disabled = true;
    try {
      if (b.dataset.a === "entrer") {
        const t = await social.rejoindreSng(taille, mise);
        dire(t.phase === "en_cours" ? "La salle est pleine : c'est parti !" : "Te voilà en salle. Le tournoi démarre dès qu'elle est pleine.");
        dernierePhase = "inscriptions";
      } else { await social.quitterSng(); dire(mise ? "Tu as quitté la salle : ton entrée t'est rendue." : "Tu as quitté la salle."); }
    } catch (err) { dire(err.message, true); }
    rafraichir(); ctx.jetons?.();
  };
  $("sngSalles").addEventListener("click", entrer);
  // Le choix de la mise (gardé sur le téléphone).
  $("sngMise").addEventListener("click", e => {
    const b = e.target.closest("button[data-v]"); if (!b) return;
    mise = +b.dataset.v; ecrire("sngMise", mise); render();
  });

  surSession(ctx.compte.session());
  return { rafraichir };
}
