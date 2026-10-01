// Le freeroll de 20 h (menu Jouer › Freeroll) et le classement des gains du mois.
// Inscription dans la journée ; à 20 h, il faut être dans l'appli : le tournoi démarre avec les présents.
import * as social from "./social-serveur.js";
import { avatarSVG } from "./avatar.js";
import { texteJetons } from "./jetons-logique.js";
import { resume } from "./tournoi-logique.js";
import { texteDotations } from "./programmes-logique.js";

const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const dans = ms => { const m = Math.max(0, Math.round(ms / 60000)); return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}` : `${m} min`; };

// ctx : { compte, ouvrirTournoi(id), chercherMatch(), signaler(cle, valeur), jetons() }
export function installerFreeroll(ctx) {
  let uid = null, etat = null, minuterie = 0, derniere = 0, phaseAvant = null, decalage = 0;
  const dire = (t, erreur = false) => { $("freeMsg").textContent = t; $("freeMsg").classList.toggle("erreur", erreur); };

  function surSession(session) {
    uid = session?.user?.id || null; etat = null;
    $("freeCard").hidden = !uid; $("freeHors").hidden = !!uid; $("classementCard").hidden = !uid;
    if (!uid) { ctx.signaler("freeroll", null); return; }
    rafraichir();
  }
  ctx.compte.surConnexion(surSession);

  // Toutes les secondes, on décide s'il faut redemander l'état : souvent près de 20 h et pendant le tournoi, sinon rarement.
  clearInterval(minuterie);
  minuterie = setInterval(() => {
    if (!uid || document.hidden) return;
    const maintenant = Date.now() + decalage, depart = etat ? Date.parse(etat.depart) : 0;
    const enJeu = etat?.inscrit && (etat.phase === "en_cours" ? !etat.elimine : etat.phase === "inscriptions" && depart - maintenant < 3 * 60000);
    const pas = enJeu ? 5000 : !$("viewFreeroll").hidden ? 15000 : 60000;
    if (Date.now() - derniere >= pas) rafraichir();
    else if (!$("viewFreeroll").hidden) render();   // le compte à rebours
  }, 1000);

  async function rafraichir() {
    if (!uid) return;
    derniere = Date.now();
    try { etat = await social.freeroll(); decalage = Date.parse(etat.maintenant) - Date.now(); } catch { return; }
    if (etat.inscrit && etat.phase === "en_cours" && phaseAvant === "inscriptions") ctx.ouvrirTournoi(etat.id);
    if (etat.phase === "termine" && phaseAvant === "en_cours") ctx.jetons?.();
    phaseAvant = etat.phase;
    if (etat.inscrit && etat.phase === "en_cours" && !etat.elimine) ctx.chercherMatch();
    const depart = Date.parse(etat.depart), proche = depart - (Date.now() + decalage) < 30 * 60000;
    ctx.signaler("freeroll", etat.inscrit && ((etat.phase === "inscriptions" && proche) || (etat.phase === "en_cours" && !etat.elimine)) ? etat : null);
    render();
  }

  function render() {
    if (!etat) return;
    const t = etat, maintenant = Date.now() + decalage, depart = Date.parse(t.depart), cagnotte = t.cagnotte;
    let statut;
    if (t.phase === "inscriptions") statut = `<b>Ce soir à 20 h</b> · départ dans ${dans(depart - maintenant)} · ${t.inscrits} inscrit${t.inscrits > 1 ? "s" : ""}<br>Cagnotte : <b>${texteJetons(cagnotte)}</b> <br><small>${texteDotations(cagnotte, Math.max(t.inscrits - (t.bots || 0), 2))}</small>`;
    else if (t.phase === "en_cours") statut = `<b>Le freeroll est en cours</b> · ${esc(resume(t))}`;
    else if (t.phase === "termine") statut = `<b>Freeroll terminé</b> · ${t.vainqueur ? `🏆 ${esc(t.vainqueur.pseudo)}#${t.vainqueur.numero}` : ""}. Rendez-vous demain à 20 h !`;
    else statut = "Pas assez de joueurs présents ce soir (il en faut 2). Rendez-vous demain à 20 h !";
    $("freeStatut").innerHTML = statut;
    const ouvert = t.phase === "inscriptions" && depart > maintenant;
    $("freeInscrire").hidden = !ouvert || t.inscrit;
    $("freeDesinscrire").hidden = !ouvert || !t.inscrit;
    $("freeVoir").hidden = t.phase !== "en_cours" && t.phase !== "termine";
    $("freeInfo").textContent = t.inscrit && ouvert ? "✅ Tu es inscrit. À 20 h, sois dans l'appli (n'importe quel écran) : le tournoi démarre avec les présents, et ton premier match se lance tout seul." : "";
  }

  $("freeInscrire").addEventListener("click", async () => {
    $("freeInscrire").disabled = true;
    try { etat = await social.inscrireFreeroll(); phaseAvant = etat.phase; dire("Inscription enregistrée. Rendez-vous à 20 h !"); render(); }
    catch (e) { dire(e.message, true); }
    $("freeInscrire").disabled = false;
  });
  $("freeDesinscrire").addEventListener("click", async () => {
    try { etat = await social.desinscrireFreeroll(); dire("Tu n'es plus inscrit au freeroll de ce soir."); render(); }
    catch (e) { dire(e.message, true); }
  });
  $("freeVoir").addEventListener("click", () => etat && ctx.ouvrirTournoi(etat.id));

  // ------------------------------------------------ le classement des gains du mois
  async function classement() {
    if (!uid) return;
    let c;
    try { c = await social.classementMois(); } catch { return; }
    const mois = new Date(`${c.mois}-01T12:00:00`).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    $("classementTitre").textContent = `Classement des gains · ${mois}`;
    const signe = n => (n > 0 ? `+${texteJetons(n)}` : n < 0 ? `−${texteJetons(-n)}` : texteJetons(0));
    $("classementListe").innerHTML = c.top.length ? c.top.map(j => `<li class="${j.id === uid ? "moi" : ""}">
        <span class="cl-rang">${j.rang}</span><span class="mini">${avatarSVG(j.avatar || {})}</span>
        <div style="min-width:0"><div class="jn">${esc(j.pseudo)}<small>#${j.numero}</small></div></div><b class="cl-points">${signe(j.benefice)}</b></li>`).join("")
      : `<p class="hint">Personne n'a encore joué de partie à mise ce mois-ci. À toi d'ouvrir le bal !</p>`;
    $("classementMoi").textContent = c.moi ? `Toi : ${c.moi.rang}${c.moi.rang === 1 ? "er" : "e"} avec ${signe(c.moi.benefice)}.` : "Tu n'es pas encore classé ce mois-ci : joue un duel à mise, un Sit & Go à mise ou le freeroll.";
  }

  surSession(ctx.compte.session());
  return { rafraichir: () => { rafraichir(); classement(); } };
}
