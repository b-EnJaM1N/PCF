// L'écran du calendrier de l'Avent (24 novembre, choix du porteur du projet : le grand sapin et ses 24 portes ; avent-logique.js).
// Le calendrier vit sur le serveur (supabase/etape-89-calendrier-avent.sql). Sur la version de test, avant décembre, un essai
// sur le téléphone seulement, avec un jour simulé (rien n'est enregistré sur le serveur, les jetons ne sont pas versés).
import * as social from "./social-serveur.js";
import { avatarSVG, GANTS, FONDS, POIGNETS } from "./avatar.js";
import { CELEBRATIONS, CADRES } from "./catalogue.js";
import { versionDeTest } from "./nouveautes.js";
import { noelActif } from "./noel.js";
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

// Le grand sapin (24 novembre, choix du porteur du projet) : 24 boules de Noël accrochées, qui font office de cases : couleurs, formes
// et tailles variées (petites en haut, plus grosses en bas), dans un ordre mélangé comme un vrai calendrier ; une guirlande dorée,
// de la neige sur les branches, l'étoile au sommet et des cadeaux au pied.
const RANGEES = [1, 2, 3, 4, 4, 5, 5];
const ORDRE = [24, 7, 15, 3, 19, 11, 22, 1, 9, 17, 5, 13, 20, 2, 16, 8, 23, 12, 4, 18, 10, 21, 6, 14];
const COULEURS = [["#D7192E", "#fff"], ["#E9B92F", "#6B4A05"], ["#1B3A8C", "#FFE27A"], ["#7B3FB8", "#fff"], ["#C9D1DC", "#2B3240"],
  ["#5BBF3A", "#123D0A"], ["#F06AA8", "#fff"], ["#1FA9A0", "#fff"]];
const FORMES = ["ronde", "ovale", "goutte", "toupie", "cotes"];
function places() {
  const res = []; let k = 0;
  RANGEES.forEach((n, r) => {
    const y = 13 + r * 9.4;
    for (let i = 0; i < n; i++) {
      const num = ORDRE[k++], decale = ((num * 7) % 5 - 2) * 0.7;
      res.push({ num, x: 50 + (i - (n - 1) / 2) * 14.2 + decale, y: y + (i % 2 ? 1.6 : -0.6), taille: 10 + r * 0.55 + ((num * 3) % 3) * 0.7,
        forme: FORMES[(num * 3) % FORMES.length], couleur: COULEURS[(num * 5) % COULEURS.length] });
    }
  });
  return res;
}
// Une boule (dessin 40 × 50 : l'attache en haut, la boule dessous), avec son numéro et un reflet.
function boule(p, ouverte) {
  const [c, t] = p.couleur, f = p.forme;
  const corps = f === "ovale" ? `<ellipse cx="20" cy="30" rx="13" ry="17" fill="${c}"/>`
    : f === "goutte" ? `<path d="M20 11 C29 21 35 28 35 34 A15 13 0 0 1 5 34 C5 28 11 21 20 11 Z" fill="${c}"/>`
    : f === "toupie" ? `<path d="M20 12 C32 18 36 25 36 29 C36 35 27 41 20 49 C13 41 4 35 4 29 C4 25 8 18 20 12 Z" fill="${c}"/>`
    : f === "cotes" ? `<circle cx="20" cy="30" r="16" fill="${c}"/><path d="M20 14 V46 M12 16 C8 26 8 34 12 44 M28 16 C32 26 32 34 28 44" stroke="rgba(255,255,255,.35)" stroke-width="1.4" fill="none"/>`
    : `<circle cx="20" cy="30" r="16" fill="${c}"/>`;
  return `<svg viewBox="0 0 40 52" aria-hidden="true"><path d="M20 1 a3 3 0 1 1 -.01 0" fill="none" stroke="#C9A24A" stroke-width="1.4"/>`
    + `<rect x="15" y="7" width="10" height="6" rx="1.5" fill="#E9C046" stroke="#9A7410" stroke-width=".8"/>${corps}`
    + `<ellipse cx="13" cy="23" rx="4" ry="6" fill="#fff" opacity=".45" transform="rotate(25 13 23)"/>`
    + `<text x="20" y="${f === "toupie" ? 33 : 35}" text-anchor="middle" font-size="13" font-weight="800" fill="${t}" font-family="inherit">${p.num}</text>${ouverte ? `<text x="33" y="20" font-size="11" text-anchor="middle">✨</text>` : ""}</svg>`;
}
// Le sapin lui-même (dessin 300 × 400 : 3 × 4, comme sa boîte).
const ETAGES = [[18, 112, 58], [62, 178, 92], [118, 248, 122], [178, 318, 146]];   // (sommet, base, demi-largeur) : les étages
const festons = (y, l) => { let d = `L${150 + l} ${y}`; const n = 6; for (let i = n; i > 0; i--) { const x1 = 150 - l + (2 * l * i) / n, x0 = 150 - l + (2 * l * (i - 1)) / n; d += ` Q${(x1 + x0) / 2} ${y + 10} ${x0} ${y}`; } return d; };
const SAPIN = `<svg viewBox="0 0 300 400" aria-hidden="true">
  <rect x="134" y="312" width="32" height="40" rx="3" fill="#6B3E22"/>
  ${ETAGES.map(([h, b, l], i) => `<path d="M150 ${h} ${festons(b, l)} Z" fill="${i % 2 ? "#1E8C3A" : "#22994A"}" stroke="#0F5A24" stroke-width="2"/>`
    + `<path d="M${150 - l + 8} ${b - 2} ${Array.from({ length: 6 }, (_, k) => { const x = 150 - l + (2 * l * (k + .5)) / 6; return `Q${x} ${b + 9} ${x + l / 6} ${b - 1}`; }).join(" ")}" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".9"/>`).join("")}
  ${[[108, 92, 192, 86], [86, 160, 216, 150], [66, 226, 238, 214], [48, 292, 258, 282]].map(([x1, y1, x2, y2]) => `<path d="M${x1} ${y1} Q150 ${y1 + 26} ${x2} ${y2}" fill="none" stroke="#E9C046" stroke-width="2.6" stroke-dasharray="1 7" stroke-linecap="round"/><path d="M${x1} ${y1} Q150 ${y1 + 26} ${x2} ${y2}" fill="none" stroke="#C9A24A" stroke-width=".9" opacity=".8"/>`).join("")}
  <path d="M150 0 L156 14 L171 15 L159 24 L163 39 L150 31 L137 39 L141 24 L129 15 L144 14 Z" fill="#F4C542" stroke="#C99A1E" stroke-width="1.5"/>
  <rect x="62" y="330" width="56" height="44" rx="4" fill="#D7192E"/><rect x="86" y="330" width="8" height="44" fill="#F4C542"/><rect x="62" y="346" width="56" height="8" fill="#F4C542"/>
  <path d="M90 330 C80 318 70 322 76 330 Z M90 330 C100 318 110 322 104 330 Z" fill="#F4C542"/>
  <rect x="182" y="338" width="48" height="36" rx="4" fill="#1B3A8C"/><rect x="202" y="338" width="8" height="36" fill="#fff"/><rect x="182" y="352" width="48" height="7" fill="#fff"/>
  <rect x="122" y="350" width="34" height="26" rx="3" fill="#5BBF3A"/><rect x="136" y="350" width="6" height="26" fill="#D7192E"/>
</svg>`;

// Le texte de la ligne du calendrier, sous les défis du jour.
export function texteLigne(etat) {
  const t = "🎄 Calendrier de l'Avent";
  if (!etat) return `${t} ›`;
  const j = etat.jour;
  if (!j) return `${t} : il s'ouvre le 1er décembre ›`;
  let ratt = 0; for (let n = 1; n <= Math.min(j, NB_CASES); n++) if (statutCase(etat, n) === "rattrapage") ratt++;
  const r = ratt && rattrapagesRestants(etat) ? ` · ${ratt} à rattraper` : "";
  if (j <= NB_CASES && statutCase(etat, j) === "aujourdhui") return `${t} · Case ${j} à ouvrir aujourd'hui${r} ›`;
  if (calendrierComplet(etat)) return `${t} · 🏅 Complet ! ›`;
  return j <= NB_CASES ? `${t} · ✓ Case du jour ouverte${r} ›` : `${t}${r || " · Rattrapages jusqu'au 31 décembre"} ›`;
}

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
      const st = statutCase(etat, p.num);
      return `<button class="avent-porte ${st}${choisie === p.num ? " choisie" : ""}" data-n="${p.num}" style="left:${p.x}%;top:${p.y}%;width:${p.taille}%" aria-label="Case ${p.num}, ${libelle(st)}">${boule(p, st === "ouverte")}</button>`;
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

  // La ligne sous les défis du jour (24 novembre, choix du porteur du projet) : ce qui attend dans le calendrier.
  let ligneChargee = false;
  function ligne() {
    const el = $("aventLigne"); if (!el) return;
    el.hidden = !noelActif();
    if (el.hidden) return;
    if (!ligneChargee && !etat) { ligneChargee = true; charger().then(ligne); }
    el.textContent = texteLigne(etat);
  }
  return { rafraichir: () => charger().then(ligne), apresMatch: async i => { await apresMatch(i); ligne(); }, ligne };
}
