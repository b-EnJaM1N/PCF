// Les tournois programmés (menu Jouer › Tournois programmés) : Le Midi, L'Apéro, Le Nocturne, le Grand Chelem du dimanche.
// Payants en jetons ; à l'heure du départ, il faut être dans l'appli : le tournoi démarre avec les présents.
import * as social from "./social-serveur.js";
import { texteJetons } from "./jetons-logique.js";
import { resume } from "./tournoi-logique.js";
import { icone, texteDepart, texteDotations, enJeu, aSignaler } from "./programmes-logique.js";

const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const dans = ms => { const m = Math.max(0, Math.round(ms / 60000)); return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}` : `${m} min`; };

// ctx : { compte, ouvrirTournoi(id), chercherMatch(), signaler(cle, valeur), jetons() }
export function installerProgrammes(ctx) {
  let uid = null, etat = null, derniere = 0, decalage = 0, enCoursAvant = new Set();
  const dire = (t, erreur = false) => { $("progMsg").textContent = t; $("progMsg").classList.toggle("erreur", erreur); };
  const liste = () => etat?.tournois || [];

  function surSession(session) {
    uid = session?.user?.id || null; etat = null;
    $("progCard").hidden = !uid; $("progTenant").hidden = true;
    if (!uid) { ctx.signaler("programme", null); return; }
    rafraichir();
  }
  ctx.compte.surConnexion(surSession);

  // Toutes les secondes : faut-il redemander l'état ? Souvent près d'un départ où je suis inscrit, et pendant le tournoi.
  setInterval(() => {
    if (!uid || document.hidden) return;
    const maintenant = Date.now() + decalage;
    const pas = liste().some(t => enJeu(t, maintenant)) ? 5000 : !$("viewFreeroll").hidden ? 15000 : 60000;
    if (Date.now() - derniere >= pas) rafraichir();
    else if (!$("viewFreeroll").hidden) render();   // les comptes à rebours
  }, 1000);

  function prendre(e) {
    etat = e; decalage = Date.parse(e.maintenant) - Date.now();
    const maintenant = Date.now() + decalage;
    for (const t of liste()) {
      // Le départ vient d'avoir lieu : on ouvre le tableau ; fin du tournoi : le solde a pu changer.
      if (t.inscrit && t.phase === "en_cours" && !enCoursAvant.has(t.id) && derniere) ctx.ouvrirTournoi(t.id);
      if (t.phase !== "en_cours" && enCoursAvant.has(t.id)) ctx.jetons?.();
    }
    enCoursAvant = new Set(liste().filter(t => t.inscrit && t.phase === "en_cours").map(t => t.id));
    if (liste().some(t => t.inscrit && t.phase === "en_cours" && !t.elimine)) ctx.chercherMatch();
    ctx.signaler("programme", aSignaler(liste(), maintenant));
    render();
  }

  async function rafraichir() {
    if (!uid) return;
    const premiere = !derniere;
    derniere = Date.now();
    try {
      const e = await social.programmes();
      if (premiere) enCoursAvant = new Set((e.tournois || []).filter(t => t.inscrit && t.phase === "en_cours").map(t => t.id));
      prendre(e);
    } catch { /* sans réseau : on réessaiera */ }
  }

  function render() {
    if (!etat) return;
    const maintenant = Date.now() + decalage, ten = etat.tenant;
    $("progTenant").hidden = !ten;
    if (ten) $("progTenant").innerHTML = `🏆 <b>Tenant du titre du Grand Chelem :</b> ${esc(ten.pseudo)}<small>#${ten.numero}</small>`;
    $("progListe").innerHTML = liste().map(t => {
      const depart = Date.parse(t.depart), ouvert = t.phase === "inscriptions" && depart > maintenant;
      let etatTxt;
      if (t.phase === "inscriptions") etatTxt = `${texteDepart(t.depart, maintenant)}${depart - maintenant < 6 * 3600000 ? ` · dans ${dans(depart - maintenant)}` : ""} · ${t.inscrits} inscrit${t.inscrits > 1 ? "s" : ""}`;
      else if (t.phase === "en_cours") etatTxt = `En cours · ${esc(resume(t))}`;
      else if (t.phase === "termine") etatTxt = `Terminé${t.vainqueur ? ` · 🏆 ${esc(t.vainqueur.pseudo)}#${t.vainqueur.numero}` : ""}`;
      else etatTxt = "Annulé : moins de 4 joueurs présents (entrées rendues)";
      const cagnotte = `Entrée ${texteJetons(t.mise)} · cagnotte ${texteJetons(t.cagnotte)}${t.garantie ? " (garantie)" : ""} · ${texteDotations(t.cagnotte, Math.max(t.inscrits, 4))}${t.finale_sets ? ` · finale en ${t.finale_sets} sets gagnants` : ""}`;
      const action = ouvert ? (t.inscrit ? `<button class="petit alt" data-a="sortir">Me désinscrire</button>` : `<button class="petit" data-a="entrer">M'inscrire</button>`)
        : t.phase === "en_cours" || t.phase === "termine" ? `<button class="petit alt" data-a="voir">Tableau</button>` : "";
      return `<div class="joueur${t.inscrit && t.phase !== "termine" && t.phase !== "annule" ? " a-jouer" : ""}" data-cle="${esc(t.cle)}" data-id="${esc(t.id)}">
        <span class="mini"><span class="trophee">${icone(t.cle)}</span></span>
        <div style="min-width:0"><div class="jn">${esc(t.nom)}${t.inscrit && ouvert ? " · ✅ inscrit" : ""}</div><div class="jd">${etatTxt}</div><div class="jd">${cagnotte}</div></div>
        <div class="actions">${action}</div></div>`;
    }).join("");
  }

  $("progListe").addEventListener("click", async e => {
    const b = e.target.closest("button[data-a]"), ligne = e.target.closest("[data-cle]");
    if (!b || !ligne) return;
    const cle = ligne.dataset.cle, t = liste().find(x => x.cle === cle);
    if (b.dataset.a === "voir") { ctx.ouvrirTournoi(ligne.dataset.id); return; }
    b.disabled = true;
    try {
      if (b.dataset.a === "entrer") {
        prendre(await social.inscrireProgramme(cle));
        dire(`Inscription à ${t?.nom || "ce tournoi"} enregistrée (${texteJetons(t?.mise || 0)}). Au départ, sois dans l'appli : ton premier match se lance tout seul.`);
      } else {
        prendre(await social.desinscrireProgramme(cle));
        dire(`Tu n'es plus inscrit à ${t?.nom || "ce tournoi"} : ton entrée t'est rendue.`);
      }
      ctx.jetons?.();
    } catch (err) { dire(err.message, true); b.disabled = false; }
  });

  surSession(ctx.compte.session());
  return { rafraichir };
}
