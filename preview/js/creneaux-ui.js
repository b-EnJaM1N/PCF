// Le panneau « 📅 Programmer » d'un défi (20 novembre ; étape SQL 85) : proposer des plages, ou choisir une heure dans celles de
// l'autre, proposer d'autres plages, décliner. Les calculs sont dans creneaux.js. (Les matchs de tournoi ont le leur, ecran-tournois.js.)
import { heureFixe, textePlage, texteRdv, joursPossibles, HEURES, texteHeure, plage, plagesRapides, heuresDansPlage, etatRdv } from "./creneaux.js";

// Chaque ligne : « Une plage » (de … à …) ou « Une heure fixe » (20 novembre, demande du porteur du projet : l'heure fixe, cachée
// dans l'heure de fin, ne se trouvait pas).
export const MODES = `<div class="rdv-mode"><button type="button" class="petit on" data-mode="plage">Une plage</button><button type="button" class="petit alt" data-mode="fixe">Une heure fixe</button></div>`;
export function changerMode(b) {
  const l = b.closest(".rdv-ligne"), fixe = b.dataset.mode === "fixe";
  l.dataset.mode = fixe ? "fixe" : "plage";
  l.querySelectorAll("[data-mode]").forEach(x => { const on = x === b; x.classList.toggle("on", on); x.classList.toggle("alt", !on); });
  l.querySelectorAll(".rfin, .ra").forEach(x => { x.hidden = fixe; });
}
export const finDe = l => (l.dataset.mode === "fixe" ? "fixe" : l.querySelector(".ra").value);

const esc = t => String(t ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// La petite ligne d'état sous un défi (ou "" s'il n'est pas programmé).
export function etatCourt(c, uid, adv) {
  const e = etatRdv(c, uid), a = esc(adv);
  const lesPlages = () => (c.plages.length === 1 ? esc(textePlage(c.plages[0])) : `${c.plages.length} créneaux`);
  if (e === "fixe") return `📅 Rendez-vous ${esc(texteRdv(c.rdv))}${Date.now() < Date.parse(c.rdv) - 5 * 60e3 ? " · la salle d'attente ouvre 5 min avant" : ""}`;
  if (e === "j_ai_propose") return `📅 Tu as proposé ${lesPlages()} · en attente de ${a}`;
  if (e === "a_choisir") return `📅 <b>${a} propose ${lesPlages()}</b>`;
  if (e === "decline_par_lui") return `📅 ${a} ne peut pas sur tes créneaux`;
  if (e === "j_ai_decline") return "📅 Tu as décliné ses créneaux";
  return "";
}

// zone : l'élément où ouvrir le panneau ; c : les créneaux (ou null) ; uid : moi ; adv : son pseudo ;
// actions : { proposer(plages), choisir(heure), decliner() } (des promesses) ; fini(message) : après une action réussie.
// (fenêtre « Défier » : texteEnvoyer, le texte du bouton d'envoi ; fermer(), quand on annule)
export function ouvrirPanneau(zone, { c, uid, adv, actions, fini, texteEnvoyer = "📅 Envoyer mes créneaux", texteFermer = "Annuler", fermer = () => {}, sansFermer = false,
  texteDecliner = "Décliner", confirmerDecliner = null }) {
  const etat = etatRdv(c, uid), a = esc(adv);
  const msg = (t, erreur = false) => { const m = zone.querySelector(".rdv-msg"); if (m) { m.textContent = t; m.classList.toggle("erreur", erreur); } };
  const agir = async (f, ok) => { try { await f(); fini(ok); } catch (e) { msg(e.message, true); } };
  zone.hidden = false;
  // (20 novembre, parcours validé par le porteur du projet) Chaque proposition, avec son bouton « ✅ Accepter » (pour une plage :
  // « À quelle heure ? ») ; puis « 🕐 Proposer un autre horaire » et « Décliner ».
  if (etat === "a_choisir") {
    const blocs = c.plages.map((p, i) => {
      const h = heuresDansPlage(p), plage = !heureFixe(p);
      if (!h.length) return `<div class="rdv-prop passee"><b>${esc(textePlage(p))}</b><span class="hint"> · passé</span></div>`;
      return `<div class="rdv-prop"><b>${esc(textePlage(p))}</b>`
        + (plage ? `<label class="rdv-choix">À quelle heure ? <select class="rdv-heure" data-i="${i}">${h.map(o => `<option value="${esc(o.valeur)}">${esc(o.texte)}</option>`).join("")}</select></label>` : "")
        + `<button class="btn" data-accepter="${i}" data-heure="${esc(h[0].valeur)}">✅ Accepter</button></div>`;
    }).join("");
    zone.innerHTML = blocs + `<div class="rdv-actions"><button class="btn alt" data-r="autres">🕐 Proposer un autre horaire</button><button class="btn alt danger" data-r="decliner">${esc(texteDecliner)}</button></div>`
      + (sansFermer ? "" : `<button class="linkbtn" data-r="fermer">Fermer</button>`) + `<p class="hint rdv-msg"></p>`;
    zone.querySelectorAll("[data-accepter]").forEach(b => b.addEventListener("click", () => {
      const sel = zone.querySelector(`.rdv-heure[data-i="${b.dataset.accepter}"]`);
      b.disabled = true;
      agir(() => actions.choisir(sel ? sel.value : b.dataset.heure), "C'est accepté : il est prévenu. Rendez-vous à l'heure !").finally(() => { b.disabled = false; });
    }));
    zone.querySelector("[data-r=decliner]").addEventListener("click", () => { if (!confirmerDecliner || confirm(confirmerDecliner)) agir(() => actions.decliner(), "C'est décliné : il est prévenu."); });
    zone.querySelector("[data-r=autres]").addEventListener("click", () => formulaire());
    zone.querySelector("[data-r=fermer]")?.addEventListener("click", () => { zone.hidden = true; zone.innerHTML = ""; });
    return;
  }
  formulaire();

  // Le formulaire des plages (jusqu'à 5, dans les 14 jours).
  function formulaire() {
    const echeance = new Date(Date.now() + 14 * 864e5).toISOString(), jours = joursPossibles(echeance), rapides = plagesRapides(echeance);
    const opts = (liste, val) => liste.map(o => `<option value="${o.valeur}"${o.valeur === val ? " selected" : ""}>${o.texte}</option>`).join("");
    const heures = HEURES.map(h => ({ valeur: h, texte: texteHeure(h) }));
    const ligne = () => `<div class="rdv-ligne" data-mode="plage">${MODES}<select class="rj">${opts(jours)}</select><select class="rd">${opts(heures, "20:00")}</select><span class="rfin">à</span><select class="ra">${opts(heures, "22:00")}</select><button class="petit alt rx" aria-label="Retirer cette plage">✕</button></div>`;
    zone.innerHTML = `<p><b>📅 Programmer le défi</b>${etat === "fixe" ? ` · rendez-vous actuel ${esc(texteRdv(c.rdv))}` : ""}</p><p class="hint">Tes créneaux pour ${a} (5 au plus) : une plage, où il choisira l'heure, ou une heure fixe.</p>`
      + (rapides.length ? `<div class="rdv-rapides">${rapides.map((r, i) => `<button class="petit alt" data-rapide="${i}">+ ${r.texte}</button>`).join("")}</div>` : "")
      + `<div class="rdv-lignes">${ligne()}</div><button class="petit alt" data-r="plus">+ Une autre plage</button>
         <div class="rdv-actions"><button class="petit" data-r="envoyer">${esc(texteEnvoyer)}</button><button class="petit alt" data-r="fermer">${esc(texteFermer)}</button></div><p class="hint rdv-msg"></p>`;
    const lignes = () => [...zone.querySelectorAll(".rdv-ligne")];
    const remplir = (l, j, de, a2) => { changerMode(l.querySelector('[data-mode="plage"]')); l.querySelector(".rj").value = j; l.querySelector(".rd").value = de; l.querySelector(".ra").value = a2; l.dataset.rempli = "1"; };
    zone.onclick = e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.classList.contains("rx")) { b.closest(".rdv-ligne").remove(); return; }
      if (b.dataset.mode) { changerMode(b); return; }
      if (b.dataset.r === "plus") { if (lignes().length < 5) zone.querySelector(".rdv-lignes").insertAdjacentHTML("beforeend", ligne()); return; }
      if (b.dataset.r === "fermer") { zone.onclick = null; zone.hidden = true; zone.innerHTML = ""; fermer(); return; }
      if (b.dataset.rapide !== undefined) {
        const p = rapides[+b.dataset.rapide].p, d = new Date(p.debut), x = new Date(p.fin), hh = z => `${String(z.getHours()).padStart(2, "0")}:${String(z.getMinutes()).padStart(2, "0")}`;
        const j = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        let l = lignes().find(y => !y.dataset.rempli);
        if (!l && lignes().length < 5) { zone.querySelector(".rdv-lignes").insertAdjacentHTML("beforeend", ligne()); l = lignes().at(-1); }
        if (l) remplir(l, j, hh(d), hh(x));
        return;
      }
      if (b.dataset.r === "envoyer") {
        const plages = lignes().map(l => plage(l.querySelector(".rj").value, l.querySelector(".rd").value, finDe(l)));
        if (!plages.length) { msg("Ajoute au moins une plage.", true); return; }
        b.disabled = true;
        agir(() => actions.proposer(plages), "Créneaux envoyés : il est prévenu.").finally(() => { b.disabled = false; });
      }
    };
    zone.onchange = e => { const l = e.target.closest(".rdv-ligne"); if (l) l.dataset.rempli = "1"; };
  }
}
