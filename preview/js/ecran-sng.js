// Tournois « Sit & Go » (menu Jouer › Sit & Go) : salles publiques de 8 à 64 joueurs,
// départ dès que c'est plein, matchs lancés automatiquement.
import * as social from "./social-serveur.js";
import { TAILLES_SNG, dureeSng, resume } from "./tournoi-logique.js";
import { gainsSng, gainDuel } from "./jetons-logique.js";

const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// ctx : { compte, ouvrirTournoi(id), chercherMatch() (lance le duel s'il y en a un qui m'attend), signaler(cle, valeur) }
export function installerSng(ctx) {
  let uid = null, minuterie = 0, etat = null, dernierePhase = null;
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

  function render() {
    const mien = etat?.mien;
    $("sngSalles").innerHTML = TAILLES_SNG.map(n => {
      const s = etat?.salles?.find(x => x.taille === n) || { inscrits: 0 };
      const ici = mien?.phase === "inscriptions" && mien.taille === n && !mien.mise;
      return `<div class="joueur${ici ? " a-jouer" : ""}" data-taille="${n}">
        <span class="mini"><span class="trophee">${n}</span></span>
        <div style="min-width:0"><div class="jn">${n} joueurs</div><div class="jd">${s.inscrits}/${n} en salle · environ ${dureeSng(n)}</div></div>
        <div class="actions">${ici ? `<button class="petit alt" data-a="quitter">Quitter</button>` : mien ? "" : `<button class="petit" data-a="entrer">Entrer</button>`}</div></div>`;
    }).join("");
    $("sngMises").innerHTML = (etat?.salles_mise || []).map(s => {
      const ici = mien?.phase === "inscriptions" && mien.taille === 8 && mien.mise === s.mise, g = gainsSng(s.mise);
      return `<div class="joueur${ici ? " a-jouer" : ""}" data-taille="8" data-mise="${s.mise}">
        <span class="mini"><span class="trophee">🪙</span></span>
        <div style="min-width:0"><div class="jn">Entrée ${s.mise} jetons</div><div class="jd">${s.inscrits}/8 en salle · 1er : ${g[0]}, 2e : ${g[1]}</div></div>
        <div class="actions">${ici ? `<button class="petit alt" data-a="quitter">Quitter</button>` : mien ? "" : `<button class="petit" data-a="entrer">Entrer</button>`}</div></div>`;
    }).join("");
    $("sngHeadsUp").innerHTML = (etat?.heads_up || []).map(s => {
      const ici = mien?.phase === "inscriptions" && mien.taille === 2 && mien.mise === s.mise;
      return `<div class="joueur${ici ? " a-jouer" : ""}" data-taille="2" data-mise="${s.mise}">
        <span class="mini"><span class="trophee">${s.mise ? "🪙" : "🥊"}</span></span>
        <div style="min-width:0"><div class="jn">${s.mise ? `Mise de ${s.mise} jetons` : "Sans mise"}</div><div class="jd">${s.inscrits}/2 en salle${s.mise ? ` · le gagnant remporte ${gainDuel(s.mise)}` : ""}</div></div>
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
      const s = mien.taille === 2 ? (etat.heads_up || []).find(x => x.mise === mien.mise)
        : mien.mise ? (etat.salles_mise || []).find(x => x.mise === mien.mise) : etat.salles.find(x => x.taille === mien.taille);
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
  $("sngMises").addEventListener("click", entrer);
  $("sngHeadsUp").addEventListener("click", entrer);

  surSession(ctx.compte.session());
  return { rafraichir };
}
