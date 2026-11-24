// L'écran du calendrier de l'Avent (24 novembre, choix du porteur du projet : le grand sapin et ses 24 portes ; avent-logique.js).
// Le calendrier vit sur le serveur (supabase/etape-89-calendrier-avent.sql). Sur la version de test, avant décembre, un essai
// sur le téléphone seulement, avec un jour simulé (rien n'est enregistré sur le serveur, les jetons ne sont pas versés).
import * as social from "./social-serveur.js";
import { avatarSVG, GANTS, FONDS, POIGNETS } from "./avatar.js";
import { CELEBRATIONS, CADRES } from "./catalogue.js";
import { versionDeTest } from "./nouveautes.js";
import { jourParis } from "./match-du-jour.js";
import { NB_CASES, cadeauDe, defiDe, DEFI_DU_JOUR, gardienDe, jourAvent, statutCase, rattrapagesRestants, nbOuvertes, calendrierComplet,
  resultatAvent, casesGagnees, compterMatchDuJour, RATTRAPAGES_PAR_JOUR } from "./avent-logique.js";

const $ = id => document.getElementById(id);
const esc = t => String(t ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const NOMS_GARDIENS = { neige: "le Bonhomme de neige", renne: "Comète, le renne", lutin: "le Lutin", perenoel: "le Père Noël" };
const BOTS_DEFI = { battre_neige: "neige", battre_renne: "renne", battre_lutin: "lutin", pere_noel: "perenoel", bot_noel: null };

// Le nom et l'aperçu d'un cadeau.
export function decrireCadeau(c) {
  if (!c) return { nom: "", apercu: "" };
  if (c.type === "jetons") return { nom: `${c.n} jetons`, apercu: `<span class="avent-gros">🪙</span>` };
  if (c.type === "gant") return { nom: c.cle === "perenoel" ? "le Gant du Père Noël" : `le gant « ${GANTS[c.cle]?.[0] || c.cle} »`, apercu: avatarSVG({ symbole: "feuille", gant: c.cle, fond: "court" }) };
  if (c.type === "poignet") return { nom: `le poignet « ${POIGNETS[c.cle]?.[0] || c.cle} »`, apercu: avatarSVG({ symbole: "pierre", gant: "blanc", poignet: c.cle, fond: "court" }) };
  if (c.type === "fond") return { nom: `le fond « ${FONDS[c.cle]?.[0] || c.cle} »`, apercu: avatarSVG({ symbole: "pierre", gant: "rouge", fond: c.cle }) };
  if (c.type === "celebration") return { nom: `la célébration « ${CELEBRATIONS[c.cle]?.nom || c.cle} »`, apercu: `<span class="avent-gros">❄️</span>` };
  if (c.type === "cadre") return { nom: `le cadre de carte « ${CADRES[c.cle]?.nom || c.cle} »`, apercu: `<span class="avent-gros">🪪</span>` };
  if (c.type === "poignee") return { nom: "la poignée de main givrée", apercu: `<span class="avent-gros">🤝❄️</span>` };
  return { nom: c.id, apercu: "🎁" };
}

// Le grand sapin : sept rangées de portes (1, 2, 3, 4, 4, 5, 5), dans un ordre mélangé comme un vrai calendrier.
const RANGEES = [1, 2, 3, 4, 4, 5, 5];
const ORDRE = [24, 7, 15, 3, 19, 11, 22, 1, 9, 17, 5, 13, 20, 2, 16, 8, 23, 12, 4, 18, 10, 21, 6, 14];
const ETAGES = [[5, 17, 30], [15, 29, 50], [32, 40, 70], [50, 49, 91]];   // (sommet, demi-largeur à la base, base) : les étages du sapin
function places() {
  const res = []; let k = 0;
  RANGEES.forEach((n, r) => {
    const y = 19 + r * 10.6;
    for (let i = 0; i < n; i++) res.push({ num: ORDRE[k++], x: 50 + (i - (n - 1) / 2) * 14.5, y });
  });
  return res;
}
const SAPIN = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
  <rect x="45" y="88" width="10" height="10" fill="#6B3E22"/>
  ${ETAGES.map(([y, l, b]) => `<path d="M50 ${y} L${50 + l} ${b} H${50 - l} Z" fill="#1E8C3A" stroke="#0F5A24" stroke-width=".6"/>`).join("")}
  <path d="M50 1 L51.6 4.4 L55.2 4.6 L52.4 6.8 L53.3 10.3 L50 8.4 L46.7 10.3 L47.6 6.8 L44.8 4.6 L48.4 4.4 Z" fill="#F4C542"/>
</svg>`;

// ctx : { compte, lireP, sauverP, apresChangement, jouerGardien(num), jouerContre(botId), aller(vue), titres(P) }
export function installerAvent(ctx) {
  let uid = null, etat = null, choisie = null, charge = false;
  const essai = () => versionDeTest() && !jourAvent(jourParis());
  const lireEssai = () => { try { return JSON.parse(localStorage.getItem("pcf:aventEssai")) || { jourSimule: Math.min(24, new Date().getDate()), cases: {}, rattrapages: {} }; } catch { return { jourSimule: 24, cases: {}, rattrapages: {} }; } };
  const ecrireEssai = e => { try { localStorage.setItem("pcf:aventEssai", JSON.stringify(e)); } catch { /* sans stockage */ } };
  const lireCompteur = () => { try { return JSON.parse(localStorage.getItem("pcf:aventMatchs")); } catch { return null; } };

  function etatEssai() {
    const e = lireEssai();
    return { jour: e.jourSimule, cases: e.cases, rattrapagesDuJour: e.rattrapages?.[e.jourSimule] || 0, essai: true };
  }
  async function charger() {
    if (essai()) { etat = etatEssai(); charge = true; render(); return; }
    if (!uid) { etat = null; charge = true; render(); return; }
    try {
      const r = await social.monAvent();
      etat = { jour: r.jour, cases: r.cases || {}, rattrapagesDuJour: r.rattrapages_du_jour || 0 };
      recopierAchats(r.achats);
    } catch { etat = etat || null; }
    charge = true; render();
  }
  // Les objets gagnés sont des achats à 0 jeton : on les recopie dans la fiche (comme la boutique).
  function recopierAchats(achats) {
    if (!achats) return;
    const P = ctx.lireP(), a = [...new Set(achats)];
    if (JSON.stringify(a) !== JSON.stringify(P.achats || [])) { P.achats = a; ctx.sauverP(); ctx.apresChangement(); }
  }

  ctx.compte.surConnexion(s => { uid = s?.user?.id || null; if (!$("viewAvent").hidden) charger(); });
  uid = ctx.compte.session()?.user?.id || null;

  function render() {
    const zone = $("aventSapin"), msg = $("aventMsg");
    $("aventEssai").hidden = !essai();
    if (essai()) $("aventJourSimule").value = String(lireEssai().jourSimule);
    if (!etat) {
      zone.innerHTML = SAPIN; $("aventCase").hidden = true;
      msg.textContent = !charge ? "Chargement du calendrier…" : !uid ? "Crée ton compte (gratuit, sans mot de passe) pour ouvrir le calendrier : tes cadeaux seront gardés." : "Le calendrier n'est pas joignable pour l'instant. Réessaie dans un moment.";
      return;
    }
    const j = etat.jour;
    msg.textContent = !j ? "Le calendrier s'ouvre le 1er décembre. Une case par jour jusqu'au 24 !"
      : `${nbOuvertes(etat)} case${nbOuvertes(etat) > 1 ? "s" : ""} ouverte${nbOuvertes(etat) > 1 ? "s" : ""} sur ${NB_CASES}${j > NB_CASES ? " · Les cases ratées se rattrapent jusqu'au 31 décembre." : ""} · Rattrapages aujourd'hui : ${rattrapagesRestants(etat)} sur ${RATTRAPAGES_PAR_JOUR}`
      + (calendrierComplet(etat) ? " · 🏅 Calendrier complet !" : "");
    zone.innerHTML = SAPIN + places().map(p => {
      const st = statutCase(etat, p.num), c = cadeauDe(p.num);
      const dedans = st === "ouverte" ? (c.type === "jetons" ? "🪙" : c.type === "gant" ? "🧤" : "🎁") : p.num;
      return `<button class="avent-porte ${st}${choisie === p.num ? " choisie" : ""}" data-n="${p.num}" style="left:${p.x}%;top:${p.y}%" aria-label="Case ${p.num}, ${libelle(st)}">${dedans}</button>`;
    }).join("");
    zone.querySelectorAll(".avent-porte").forEach(b => b.addEventListener("click", () => { choisie = Number(b.dataset.n); render(); $("aventCase").scrollIntoView?.({ block: "nearest", behavior: "smooth" }); }));
    if (!choisie && j) choisie = Math.min(j, NB_CASES);
    renderCase();
  }
  const libelle = st => ({ ouverte: "ouverte", aujourdhui: "à ouvrir aujourd'hui", rattrapage: "à rattraper", fermee: "pas encore", perdue: "ratée" }[st]);

  function renderCase() {
    const el = $("aventCase");
    if (!choisie || !etat) { el.hidden = true; return; }
    el.hidden = false;
    const n = choisie, st = statutCase(etat, n), c = cadeauDe(n), d = decrireCadeau(c), defi = defiDe(n), g = gardienDe(n);
    let corps = "";
    if (st === "ouverte") corps = `<div class="avent-cadeau">${d.apercu}</div><p>Ouverte : tu as gagné <b>${esc(d.nom)}</b>.</p>`;
    else if (st === "aujourdhui") {
      const bot = BOTS_DEFI[DEFI_DU_JOUR[n]];
      corps = `<div class="avent-cadeau mystere">🎁</div><p><b>Le défi du jour :</b> ${esc(defi.texte)}</p>`
        + `<button class="btn" id="aventJouer" data-bot="${bot || ""}">${bot ? `Affronter ${esc(NOMS_GARDIENS[bot])}` : DEFI_DU_JOUR[n] === "bot_noel" ? "Choisir un bot de Noël" : "Jouer"}</button>`
        + `<p class="hint">La case s'ouvre toute seule dès que le défi est réussi.</p>`;
    } else if (st === "rattrapage") {
      const reste = rattrapagesRestants(etat);
      corps = `<div class="avent-cadeau mystere">🎁</div><p>Case à rattraper : bats <b>${esc(NOMS_GARDIENS[g])}</b>, qui la garde, en un set de 7 points${n === NB_CASES ? " (contre le Père Noël, l'affronter suffit)" : ""}.</p>`
        + (reste ? `<button class="btn" id="aventGardien">Affronter ${esc(NOMS_GARDIENS[g])}</button>` : `<p class="hint">Deux rattrapages par jour au plus : reviens demain !</p>`);
    } else if (st === "perdue") corps = `<p>Cette case n'a pas été ouverte à temps.</p>`;
    else corps = `<div class="avent-cadeau mystere">🔒</div><p>Patience : cette case s'ouvre le ${n} décembre.</p>`;
    el.innerHTML = `<h3>🎄 Case ${n}</h3>${corps}`;
    $("aventJouer")?.addEventListener("click", e => { const b = e.currentTarget.dataset.bot; if (b) ctx.jouerContre(b); else ctx.aller(DEFI_DU_JOUR[n] === "bot_noel" || DEFI_DU_JOUR[n] === "en_ligne" ? (DEFI_DU_JOUR[n] === "en_ligne" ? "viewRapide" : "viewMatch") : "viewJouer"); });
    $("aventGardien")?.addEventListener("click", () => ctx.jouerGardien(n, g));
  }

  // Après chaque match : les cases que ce match ouvre. info : { match, adv, botNoel, duel, smashsReussis, meilleureSerie, matchDuJour,
  // rattrapage, abandon }.
  async function apresMatch(info) {
    const date = jourParis(), compteur = compterMatchDuJour(lireCompteur(), date);
    try { localStorage.setItem("pcf:aventMatchs", JSON.stringify(compteur)); } catch { /* sans stockage */ }
    if (!etat || etat.essai !== essai()) { if (essai() || uid) await charger(); }
    if (!etat || !etat.jour) return;
    const r = resultatAvent(info.match, info.adv, info);
    const gagnees = casesGagnees(etat, r, compteur);
    for (const { num, via } of gagnees) {
      try {
        if (etat.essai) {
          const e = lireEssai(); e.cases[num] = { via, le: Date.now() };
          if (via === "rattrapage") (e.rattrapages ||= {})[e.jourSimule] = (e.rattrapages[e.jourSimule] || 0) + 1;
          ecrireEssai(e); etat = etatEssai();
          const c = cadeauDe(num);
          if (c.type !== "jetons") { const P = ctx.lireP(); P.aventEssai = [...new Set([...(P.aventEssai || []), c.id])]; ctx.sauverP(); ctx.apresChangement(); }
        } else {
          const res = await social.ouvrirCaseAvent(num, via);
          etat = { jour: res.jour, cases: res.cases || {}, rattrapagesDuJour: res.rattrapages_du_jour || 0 };
          recopierAchats(res.achats);
        }
        montrerCadeau(num, via);
      } catch { /* déjà ouverte, ou hors ligne : on réessaiera au prochain match */ }
    }
    if (gagnees.length && calendrierComplet(etat)) ctx.titres?.(["avent_complet"]);
    if (gagnees.length) render();
  }

  // La porte s'ouvre : le cadeau apparaît.
  function montrerCadeau(num, via) {
    const d = decrireCadeau(cadeauDe(num)), ov = $("aventOuverture");
    $("aventOuvTitre").textContent = `🎄 Case ${num} ouverte !`;
    $("aventOuvCadeau").innerHTML = d.apercu;
    $("aventOuvTexte").innerHTML = `${via === "rattrapage" ? "Rattrapage réussi ! " : "Défi du jour réussi ! "}Tu gagnes <b>${esc(d.nom)}</b>${etat?.essai && cadeauDe(num).type === "jetons" ? " (essai : pas de jetons versés)" : ""}.`;
    ov.hidden = false; ov.classList.remove("ouvre"); void ov.offsetWidth; ov.classList.add("ouvre");
  }
  $("aventOuvOk")?.addEventListener("click", () => { $("aventOuverture").hidden = true; });

  // L'essai (version de test, avant décembre) : choisir le jour simulé, tout effacer.
  $("aventJourSimule")?.addEventListener("change", e => { const x = lireEssai(); x.jourSimule = Number(e.target.value); ecrireEssai(x); etat = etatEssai(); choisie = null; render(); });
  $("aventEffacer")?.addEventListener("click", () => { ecrireEssai(null); const P = ctx.lireP(); P.aventEssai = []; ctx.sauverP(); ctx.apresChangement(); etat = etatEssai(); choisie = null; render(); });
  if ($("aventJourSimule")) $("aventJourSimule").innerHTML = Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}">${i + 1} décembre</option>`).join("");

  return { rafraichir: charger, apresMatch };
}
