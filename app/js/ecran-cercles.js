// Onglet « Amis » (anciennement « Cercles ») : mon niveau officiel, mes amis, et mes cercles
// (groupes privés avec leur propre classement).
import * as social from "./social-serveur.js";
import { chercher, duelsAvec, mesDuelsRecents } from "./duel-serveur.js";
import { statsFaceAFace, texteDefie } from "./duel-logique.js";
import { EMOJI, NOM } from "./regles.js";
import { avatarSVG, FONDS } from "./avatar.js";
import { DIVISIONS, texteDivision, divisionDe, pointPresence, textePresence, amisEnTete, compterEchanges } from "./social-logique.js";
import { EMBLEMES, blasonSVG, normaliserBlason, blasonParDefaut, erreurNomCercle, lienCercle, codeCercleDepuisAdresse, rang, CLASSEMENT_DEPART, texteNiveau, texteCalibrage, provisoire } from "./social-logique.js";
import { lire, ecrire } from "./stockage.js";
import { clePseudo } from "./chants-perso.js";
import { installerTournois } from "./ecran-tournois.js";
import { fantomeVisible } from "./fantome.js";
import { ouvert } from "./nouveautes.js";
import { calculerRecords, htmlRecords } from "./records-cercle.js";
import { filVisible, evenementsDuFil, evenementsChampionnat, evenementsDossard, scoreDuDuel, ilYA, REACTIONS } from "./fil-cercle.js";
import { championDuCercle } from "./tournoi-logique.js";
import { profils } from "./duel-serveur.js";

const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const nomComplet = p => `${esc(p.pseudo)}<small>#${p.numero}</small>`;
const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? "s" : ""}`;

// ctx : { compte, ouvrirOnglet(nom), defier(profil) → texte, surClassement(points ou null), lancerDuel(duel, profil),
//         trophees(donnees) : trophées des cercles et tournois en ligne (voir titresEnLigne dans profil.js) }
// Le bilan de nos duels avec un joueur (ami, ou adversaire en ligne touché dans « Derniers matchs »).
// Avec des duels officiels et d'autres : deux onglets, « Tous les duels » et « Duels officiels » (sans script : deux boutons radio).
let nFaceAFace = 0;
export function renderFaceAFace(r, nom) {
  if (!r.matchs) return `<p class="hint">Vous ne vous êtes encore jamais affrontés. Lance-lui un défi !</p>`;
  const o = r.officiel;
  if (!o || !o.matchs || o.matchs === r.matchs) return corpsFaceAFace(r, nom);
  const k = ++nFaceAFace;
  return `<div class="ff-choix"><input type="radio" name="ffc${k}" id="ffTous${k}" checked><label for="ffTous${k}">Tous les duels (${r.matchs})</label>`
    + `<input type="radio" name="ffc${k}" id="ffOff${k}"><label for="ffOff${k}">Duels officiels (${o.matchs})</label>`
    + `<div class="ff-vue-tous">${corpsFaceAFace(r, nom)}</div><div class="ff-vue-off">${corpsFaceAFace(o, nom, true)}</div></div>`;
}
// La forme : les 5 derniers duels (du plus ancien au plus récent), 🟩 gagné, 🟥 perdu, et la part de victoires (24 octobre).
export function forme(derniers) {
  const cinq = derniers.slice(0, 5).reverse(); if (!cinq.length) return "";
  const v = cinq.filter(m => m.gagne).length;
  return `<p class="ff-forme"><span>Forme (${cinq.length} dernier${cinq.length > 1 ? "s" : ""})</span><span class="ff-cases" aria-label="${v} victoire${v > 1 ? "s" : ""} sur ${cinq.length}">${cinq.map(m => (m.gagne ? "🟩" : "🟥")).join("")}</span><b>${Math.round(100 * v / cinq.length)} %</b></p>`;
}
function corpsFaceAFace(r, nom, officiels = false) {
  const n = esc(nom), pct = (x, y) => (x + y ? `${Math.round(100 * x / (x + y))} %` : "–");
  const ligne = (moi, label, lui) => `<div class="ff-ligne"><b>${moi}</b><span>${label}</span><b>${lui}</b></div>`;
  // La part de chaque signe joué, de chaque côté.
  const part = (t, k) => { const tot = t[0] + t[1] + t[2]; return tot ? `${Math.round(100 * t[k] / tot)} %` : "–"; };
  const signes = [0, 1, 2].map(k => ligne(part(r.mesSignes, k), `${EMOJI[k]} ${NOM[k]}`, part(r.sesSignes, k))).join("");
  const taux = (x, k) => (x.total ? `${Math.round(100 * x[k] / x.total)} %` : "–");
  const serie = r.serie.n >= 2 ? `<p class="hint">🔥 ${r.serie.n} ${r.serie.gagne ? "victoires" : "défaites"} de suite ${r.serie.gagne ? "pour toi" : `face à ${n}`}.</p>` : "";
  const date = d => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  const duelLigne = m => `<li>${m.gagne ? "✅ Victoire" : "❌ Défaite"}${m.scores.length ? ` · ${m.scores.map(([x, y]) => `${x}–${y}`).join(", ")}` : ""}${m.fin === "forfait" ? " · forfait" : m.fin === "abandon" ? " · abandon" : ""} · ${m.type} · ${date(m.date)}</li>`;
  // Les 3 derniers affrontements ; les autres en touchant « Voir tous ».
  const derniers = r.derniers.slice(0, 3).map(duelLigne).join("");
  const autres = r.derniers.length > 3
    ? `<details class="ff-tous"><summary>Voir tous (${r.derniers.length})</summary><ul class="ff-derniers">${r.derniers.slice(3).map(duelLigne).join("")}</ul></details>` : "";
  return `<div class="ff-tete"><span>Toi</span><b>${r.v} – ${r.d}</b><span>${n}</span></div>
    <p class="hint" style="text-align:center;margin-top:0">${officiels ? `${pluriel(r.matchs, "duel")} officiel${r.matchs > 1 ? "s" : ""}` : `${pluriel(r.matchs, "duel")}${r.officiels ? `, dont ${r.officiels} officiel${r.officiels > 1 ? "s" : ""}` : ""}`} · ${pct(r.v, r.d)} de victoires pour toi</p>
    ${forme(r.derniers)}
    ${ligne(r.sets[0], "Sets gagnés", r.sets[1])}
    ${ligne(r.points[0], "Points gagnés", r.points[1])}
    <h3 class="ff-titre">Signes joués</h3>
    ${signes}
    ${ligne(taux(r.rejoueApresVictoire[0], "meme"), "Rejoue le même signe après un point gagné", taux(r.rejoueApresVictoire[1], "meme"))}
    ${ligne(taux(r.changeApresDefaite[0], "change"), "Change de signe après un point perdu", taux(r.changeApresDefaite[1], "change"))}
    ${serie}
    <h3 class="ff-titre">Derniers affrontements</h3><ul class="ff-derniers">${derniers}</ul>${autres}`;
}

export function installerCercles(ctx) {
  let uid = null, minuterie = 0, recherche = 0, amis = [], echanges = new Map(), cercleOuvert = null, detail = null;
  const base = () => location.origin + location.pathname;
  const dire = (id, t, erreur = false) => {
    $(id).textContent = t; $(id).classList.toggle("erreur", erreur);
    if (t) $(id).scrollIntoView({ block: "nearest", behavior: "smooth" });
  };
  const visible = () => !$("viewCercles").hidden;

  // ------------------------------------------------ choix du blason (création et gestion)
  function choixBlason(idEmb, idFond, idApercu) {
    const etat = blasonParDefaut();
    const rendre = () => {
      $(idEmb).innerHTML = Object.entries(EMBLEMES).map(([k, e]) => `<button type="button" class="txt" data-k="${k}" aria-pressed="${k === etat.embleme}">${e}</button>`).join("");
      $(idFond).innerHTML = Object.entries(FONDS).map(([k, [nom, c]]) => `<button type="button" data-k="${k}" aria-pressed="${k === etat.fond}" aria-label="${nom}" title="${nom}" style="background:${c}"></button>`).join("");
      $(idApercu).innerHTML = blasonSVG(etat);
    };
    $(idEmb).addEventListener("click", e => { const b = e.target.closest("button"); if (b) { etat.embleme = b.dataset.k; rendre(); } });
    $(idFond).addEventListener("click", e => { const b = e.target.closest("button"); if (b) { etat.fond = b.dataset.k; rendre(); } });
    rendre();
    return { lire: () => ({ ...etat }), ecrire: b => { Object.assign(etat, normaliserBlason(b)); rendre(); } };
  }
  // Les pages : dans l'onglet Cercles, la liste ou un cercle ; ailleurs, un tournoi ou sa création
  // (ouverts depuis un cercle ou depuis « Jouer › Tournois » : le retour ramène d'où l'on vient).
  let origine = null;
  const montrer = vue => {
    if (vue === "socTournoi" || vue === "socTournoiNouveau") {
      const ici = ctx.vueCourante();
      if (ici !== "socTournoi" && ici !== "socTournoiNouveau") origine = ici;
      ctx.aller(vue); return;
    }
    ctx.aller("viewCercles");
    ["socListe", "socCercle", "socAmi"].forEach(v => { $(v).hidden = v !== vue; });
    window.scrollTo(0, 0);
  };
  const retour = () => {
    if (origine && origine !== "viewCercles") { ctx.aller(origine); rafraichir(); return; }
    if (cercleOuvert) { montrer("socCercle"); chargerCercle(); } else { montrer("socListe"); rafraichir(); }
  };
  const tournois = installerTournois({
    uid: () => uid, montrer, retour, lancerDuel: (d, p) => ctx.lancerDuel(d, p), profils,
    apresChangement: () => { rafraichir(); if (cercleOuvert) chargerCercle(); },
  });

  const blasonNouveau = choixBlason("cercleEmblemes", "cercleFonds", "cercleApercu");
  const blasonGestion = choixBlason("cEmblemes", "cFonds", "cApercu");

  // ------------------------------------------------ connecté ou pas
  function surSession(session) {
    uid = session?.user?.id || null;
    $("socHors").hidden = !!uid; $("socOn").hidden = !uid;
    clearInterval(minuterie);
    $("tournoisCard").hidden = !uid; $("tournoisHors").hidden = !!uid;
    if (!uid) { $("pastilleCercles").hidden = true; ctx.signaler("tournois", []); ctx.surClassement(null); fermerCercle(); return; }
    minuterie = setInterval(() => { rafraichir(); if (cercleOuvert && visible() && !$("socCercle").hidden) chargerCercle(); }, 20000);
    rafraichir();
    rejoindreLienEnAttente();
    tournois.rejoindreLienEnAttente();
  }
  ctx.compte.surConnexion(surSession);
  $("socVersCompte").addEventListener("click", () => ctx.ouvrirOnglet("profile"));

  // ------------------------------------------------ la page principale
  async function rafraichir() {
    if (!uid) return;
    const [cl, listeAmis, cercles, mesTournois, recents] = await Promise.all([
      social.classements([uid]).catch(() => null), social.mesAmis().catch(() => null), social.mesCercles().catch(() => null),
      social.mesTournois().catch(() => null), mesDuelsRecents().catch(() => null),
    ]);
    if (recents) echanges = compterEchanges(recents, uid);
    if (mesTournois) {
      $("socTournoisVide").hidden = mesTournois.length > 0;
      tournois.liste($("socTournois"), mesTournois);
      ctx.signaler("tournois", mesTournois.filter(t => t.a_jouer));
    }
    if (cl) {
      const c = cl.get(uid);
      $("clDetail").textContent = c && c.joues
        ? `${pluriel(c.joues, "duel officiel")} · ${c.gagnes} V – ${c.joues - c.gagnes} D · meilleur : ${c.meilleur}`
        : `Aucun duel officiel pour l'instant : tout le monde démarre à ${CLASSEMENT_DEPART}.`;
      if (provisoire(c?.joues)) $("clDetail").textContent += ` ${texteCalibrage(c?.joues)}`;
      ctx.surClassement(c ? c.points : CLASSEMENT_DEPART, c?.joues ?? 0, c?.division ?? null);
      const maDiv = c?.division ?? divisionDe(c ? c.points : CLASSEMENT_DEPART);
      if (divVue === null) chargerDivision(maDiv);
      $("divResume").textContent = `Ta division : ${texteDivision(maDiv)}`;   // visible même replié
    }
    if (listeAmis) { amis = listeAmis; renderAmis(); }
    if (cercles) renderCercles(cercles);
    if (cercles || mesTournois) ctx.trophees?.({ cercles: cercles?.cercles || [], tournois: mesTournois || [] });
    if (listeAmis && cercles) {
      const n = amis.filter(a => a.recue).length + cercles.invitations.length;
      $("pastilleCercles").hidden = !n; $("pastilleCercles").textContent = n;
      $("socInvitCard").hidden = !n;
      $("socInvit").innerHTML = amis.filter(a => a.recue).map(a => ligneJoueur(a, "Demande d'ami",
        `<button class="petit" data-a="ami-oui">Accepter</button><button class="petit alt" data-a="ami-non">Refuser</button>`)).join("")
        + cercles.invitations.map(c => `<div class="joueur" data-cercle="${c.id}">
            <span class="mini">${blasonSVG(c.blason)}</span>
            <div style="min-width:0"><div class="jn">${esc(c.nom)}</div><div class="jd">Cercle · ${pluriel(c.membres, "membre")}${c.par ? ` · invité par ${esc(c.par.pseudo)}` : ""}</div></div>
            <div class="actions"><button class="petit" data-a="cercle-oui">Rejoindre</button><button class="petit alt" data-a="cercle-non">Non</button></div></div>`).join("");
    }
  }

  // « Défier », ou « Défié ✓ » tant que mon défi à ce joueur attend (on ne relance pas un deuxième défi par erreur).
  const boutonDefier = p => ctx.dejaDefie?.(p.id) ? `<button class="petit alt" data-a="defie" disabled>${texteDefie(p)}</button>` : `<button class="petit" data-a="defier">Défier</button>`;
  // Dans « Mes amis » : à côté, « Annuler » pour retirer un défi en attente (10 novembre : la croix qui retirait l'ami est partie,
  // trop de fausses manips ; on retire un ami en bas de sa page).
  const boutonsAmi = p => boutonDefier(p) + (ctx.dejaDefie?.(p.id) ? `<button class="petit alt" data-a="annuler-defi">Annuler</button>` : "");
  const marquerDefie = (b, p) => { b.textContent = texteDefie(p); b.classList.add("alt"); b.dataset.a = "defie"; b.disabled = true; };
  const texteAttente = p => `${texteDefie(p)} (en attente de sa réponse)`;
  const ligneJoueur = (p, sous, boutons) => `<div class="joueur" data-id="${p.id}">
    <span class="mini">${avatarSVG(p.avatar || {})}</span>
    <div style="min-width:0"><div class="jn">${esc(p.drapeau || "")} ${nomComplet(p)}${pointPresence(p)}</div><div class="jd">${sous}</div></div>
    <div class="actions">${boutons}</div></div>`;

  let tousLesAmis = false;   // la liste dépliée (gardée tant que l'appli reste ouverte)
  function renderAmis() {
    const { devant, autres } = amisEnTete(amis, echanges);
    const ligne = a => a.statut === "amis"
      ? ligneJoueur(a, `${textePresence(a)}Niveau ${texteNiveau(a.classement, a.joues)}${a.joues ? ` · ${pluriel(a.joues, "duel officiel")}` : ""}`, boutonsAmi(a))
      : ligneJoueur(a, "Demande envoyée", `<button class="petit alt" data-a="annuler">Annuler</button>`);
    $("socAmisVide").hidden = devant.length + autres.length > 0;
    const nAmis = autres.filter(a => a.statut === "amis").length, nDemandes = autres.length - nAmis;
    const titre = [nAmis && pluriel(nAmis, "autre ami"), nDemandes && `${nDemandes} ${nDemandes > 1 ? "demandes envoyées" : "demande envoyée"}`].filter(Boolean).join(" · ");
    $("socAmis").innerHTML = devant.map(ligne).join("")
      + (autres.length ? `<details class="amis-autres"${tousLesAmis ? " open" : ""}><summary>Voir ${titre}</summary>${autres.map(ligne).join("")}</details>` : "");
    $("socAmis").querySelector(".amis-autres")?.addEventListener("toggle", e => { tousLesAmis = e.target.open; });
  }

  // ---------------------------------------------------------------- le classement par division
  let divVue = null;
  async function chargerDivision(d) {
    divVue = d;
    document.querySelectorAll("#divSeg button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.d === d)));
    $("divListe").innerHTML = ""; $("divMoi").textContent = "Chargement…";
    let r;
    try { r = await social.classementDivision(d); } catch { if (divVue === d) $("divMoi").textContent = "Classement indisponible pour l'instant."; return; }
    if (divVue !== d) return;
    const moi = r.moi, ici = moi && moi.division === d, ligne = r.joueurs.find(j => j.moi);
    $("divMoi").innerHTML = `<b>${texteDivision(d)}</b> · ${pluriel(r.joueurs.length, "joueur classé")}` + (!moi ? "" : ici
      ? (ligne ? ` · tu es <b>${ligne.rang}e</b>` : moi.manque ? ` · encore ${pluriel(moi.manque, "duel officiel")} pour y figurer` : moi.inactif ? " · joue un duel officiel pour y réapparaître" : "")
      : ` · ta division : ${texteDivision(moi.division)}`);
    $("divListe").innerHTML = r.joueurs.length ? r.joueurs.map(j => `<li class="${j.moi ? "moi" : ""}" data-id="${j.id}">
      <span class="cl-rang">${j.rang}</span>
      <span class="mini">${avatarSVG(j.avatar || {})}</span>
      <div style="min-width:0"><div class="jn">${esc(j.drapeau || "")} ${nomComplet(j)}${j.moi ? " <small>(toi)</small>" : ""}</div><div class="jd">${pluriel(j.joues, "duel officiel")}</div></div>
      <b class="cl-points">${j.points}</b><span></span></li>`).join("")
      : `<li class="vide"><span></span><span></span><div class="jd">Personne n'est encore classé dans cette division.</div><span></span><span></span></li>`;
  }
  $("divSeg").addEventListener("click", e => { const b = e.target.closest("button[data-d]"); if (b) chargerDivision(+b.dataset.d); });

  // ---------------------------------------------------------------- face-à-face avec un ami
  let amiOuvert = null;
  async function ouvrirAmi(id) {
    const a = amis.find(x => x.id === id); if (!a) return;
    amiOuvert = id;
    montrer("socAmi");
    $("aAvatar").innerHTML = avatarSVG({ ...(a.avatar || {}), brode: clePseudo(a.pseudo, a.numero) });   // (avec son pseudo brodé, s'il en a un)
    $("aNom").innerHTML = `${esc(a.drapeau || "")} ${nomComplet(a)}`;
    $("aInfo").textContent = `${textePresence(a)}Niveau ${texteNiveau(a.classement, a.joues)}${a.joues ? ` · ${pluriel(a.joues, "duel officiel")}` : ""}`;
    $("aStats").innerHTML = `<p class="hint">Chargement…</p>`; dire("aMsg", "");
    const deja = !!ctx.dejaDefie?.(id);
    $("aDefier").disabled = deja; $("aDefier").textContent = deja ? texteAttente(a) : "Défier"; if ($("aAnnulerDefi")) $("aAnnulerDefi").hidden = !deja;
    // Son fantôme (fantome.js) : un bot qui joue comme lui, d'après ses matchs en ligne (pour l'instant sur la version de test).
    $("aFantome").hidden = true;
    if (fantomeVisible() && ctx.fantomeDe) ctx.fantomeDe(id).then(ok => {
      if (amiOuvert !== id) return;
      $("aFantome").hidden = false; $("aFantome").disabled = !ok;
      $("aFantome").textContent = ok ? "👻 Défier son fantôme" : "👻 Son fantôme : pas encore assez de matchs en ligne";
    });
    let duels = null;
    try {
      duels = await duelsAvec(id); const r = statsFaceAFace(duels, uid);
      if (amiOuvert === id) $("aStats").innerHTML = renderFaceAFace(r, a.pseudo);
    } catch { if (amiOuvert === id) $("aStats").innerHTML = `<p class="hint">Impossible de charger vos duels. Vérifie ta connexion.</p>`; }
    // Son dossier et l'historique des mains (contre toi, et tous ses matchs).
    const suite = await ctx.dossierEtMains?.(id, a.pseudo, duels);
    if (amiOuvert === id && suite) $("aStats").insertAdjacentHTML("beforeend", suite);
  }
  // Ouvert depuis Jouer › Défier un ami : le retour y ramène.
  let origineAmi = null;
  $("amiRetour").addEventListener("click", () => {
    amiOuvert = null;
    if (origineAmi) { const o = origineAmi; origineAmi = null; montrer("socListe"); ctx.aller(o); return; }
    montrer("socListe"); rafraichir();
  });
  $("aCarte").addEventListener("click", async () => {
    if (!amiOuvert) return;
    $("aCarte").disabled = true;
    const msg = await ctx.voirCarte(amiOuvert);
    $("aCarte").disabled = false;
    if (msg) dire("aMsg", msg);
  });
  $("aAnnulerDefi")?.addEventListener("click", async () => {
    const a = amis.find(x => x.id === amiOuvert); if (!a || !confirm(`Annuler ton défi à ${a.pseudo} ?`)) return;
    $("aAnnulerDefi").disabled = true;
    try { await ctx.annulerDefi?.(a.id); dire("aMsg", `Défi à ${a.pseudo} annulé.`); $("aDefier").disabled = false; $("aDefier").textContent = "Défier"; $("aAnnulerDefi").hidden = true; }
    catch (err) { dire("aMsg", err.message, true); }
    $("aAnnulerDefi").disabled = false;
  });
  // Retirer un ami : seulement en bas de sa page, avec confirmation (10 novembre, demande du porteur du projet).
  $("aRetirer")?.addEventListener("click", async () => {
    const a = amis.find(x => x.id === amiOuvert); if (!a) return;
    if (!confirm(`Retirer ${a.pseudo}#${a.numero} de tes amis ? Vous ne pourrez plus vous défier depuis « Mes amis » (il faudra lui renvoyer une demande).`)) return;
    $("aRetirer").disabled = true;
    try { await social.retirerAmi(a.id); amiOuvert = null; montrer("socListe"); dire("socMsg", `${a.pseudo} ne fait plus partie de tes amis.`); await rafraichir(); }
    catch (err) { dire("aMsg", err.message, true); }
    $("aRetirer").disabled = false;
  });
  $("aFantome").addEventListener("click", () => { const a = amis.find(x => x.id === amiOuvert); if (a) ctx.jouerFantome?.(a); });
  $("aDefier").addEventListener("click", async () => {
    const a = amis.find(x => x.id === amiOuvert); if (!a) return;
    $("aDefier").disabled = true;
    try { const t = await ctx.defier(a); if (t) { dire("aMsg", t); $("aDefier").textContent = texteAttente(a); if ($("aAnnulerDefi")) $("aAnnulerDefi").hidden = false; return; } }
    catch (err) { dire("aMsg", err.message, true); }
    $("aDefier").disabled = false;
  });

  function renderCercles({ cercles }) {
    $("socCerclesVide").hidden = cercles.length > 0;
    $("socCercles").innerHTML = cercles.map(c => `<div class="joueur cliquable" data-cercle="${c.id}" role="button" tabindex="0">
      <span class="mini">${blasonSVG(c.blason)}</span>
      <div style="min-width:0"><div class="jn">${esc(c.nom)}${c.role === "admin" ? " 👑" : ""}</div><div class="jd">${pluriel(c.membres, "membre")} · tu es ${rang(c.rang)}</div></div>
      <div class="actions"><button class="petit alt" data-a="voir">Voir</button></div></div>`).join("");
  }

  // Tous les boutons des listes (un seul écouteur par zone).
  const actionsListe = async e => {
    const b = e.target.closest("button"), ligne = e.target.closest(".joueur");
    if (!ligne) return;
    // Toucher un ami (ailleurs que sur ses boutons) : notre face-à-face.
    if (!b && ligne.closest("#socAmis") && amis.find(x => x.id === ligne.dataset.id)?.statut === "amis") return ouvrirAmi(ligne.dataset.id);
    if (ligne.dataset.cercle && (!b || b.dataset.a === "voir")) return ouvrirCercle(ligne.dataset.cercle);
    if (!b) return;
    const id = ligne.dataset.id, cercle = ligne.dataset.cercle, a = b.dataset.a;
    const joueur = amis.find(x => x.id === id);
    if (a === "annuler-defi" && !confirm(`Annuler ton défi à ${joueur.pseudo} ?`)) return;
    b.disabled = true;
    try {
      if (a === "annuler-defi") { await ctx.annulerDefi?.(id); dire("socMsg", `Défi à ${joueur.pseudo} annulé.`); return renderAmis(); }
      if (a === "defier") { const t = await ctx.defier(joueur); if (!t) { b.disabled = false; return; } dire("socMsg", t); return marquerDefie(b, joueur); }
      if (a === "annuler") await social.retirerAmi(id);
      if (a === "ami-oui") { await social.repondreAmi(id, true); dire("socMsg", `${joueur.pseudo} et toi êtes maintenant amis.`); }
      if (a === "ami-non") await social.repondreAmi(id, false);
      if (a === "cercle-oui") { await social.repondreCercle(cercle, true); await rafraichir(); return ouvrirCercle(cercle); }
      if (a === "cercle-non") await social.repondreCercle(cercle, false);
    } catch (err) { dire("socMsg", err.message, true); b.disabled = false; return; }
    rafraichir();
  };
  ["socInvit", "socAmis", "socCercles"].forEach(z => $(z).addEventListener("click", actionsListe));
  $("socCercles").addEventListener("keydown", e => { if (e.key === "Enter" && e.target.dataset.cercle) ouvrirCercle(e.target.dataset.cercle); });

  // ------------------------------------------------ ajouter un ami
  $("inAmi").addEventListener("input", () => {
    clearTimeout(recherche);
    const t = $("inAmi").value.trim();
    if (t.replace(/#.*/, "").length < 2) { $("amiResultats").innerHTML = ""; return; }
    recherche = setTimeout(async () => {
      try {
        const res = await chercher(t);
        if ($("inAmi").value.trim() !== t) return;
        $("amiResultats").innerHTML = res.length ? res.map(p => {
          const deja = amis.find(a => a.id === p.id);
          const etat = !deja ? `<button class="petit" data-a="demander">Ajouter</button>`
            : `<span class="jd">${deja.statut === "amis" ? "Déjà ami ✓" : deja.recue ? "T'a demandé" : "Demandé ✓"}</span>`;
          return ligneJoueur(p, `Niveau ${p.niveau}`, etat);
        }).join("") : `<p class="hint">Aucun joueur trouvé.</p>`;
      } catch (err) { dire("socMsg", err.message, true); }
    }, 350);
  });
  $("amiResultats").addEventListener("click", async e => {
    const b = e.target.closest("button[data-a=demander]"); if (!b) return;
    const ligne = b.closest(".joueur");
    b.disabled = true;
    try {
      const r = await social.demanderAmi(ligne.dataset.id);
      b.replaceWith(Object.assign(document.createElement("span"), { className: "jd", textContent: r === "amis" ? "Amis ✓" : "Demandé ✓" }));
      dire("socMsg", r === "amis" ? "Vous êtes maintenant amis." : "Demande envoyée : elle apparaîtra dans son onglet Amis.");
      rafraichir();
    } catch (err) { dire("socMsg", err.message, true); b.disabled = false; }
  });

  // ------------------------------------------------ créer un cercle
  $("cercleNouveau").addEventListener("click", () => { $("cercleForm").hidden = false; $("cercleNouveau").hidden = true; $("inCercleNom").focus(); });
  $("cercleCreer").addEventListener("click", async () => {
    const nom = $("inCercleNom").value.trim(), erreur = erreurNomCercle(nom);
    if (erreur) return dire("socMsg", erreur, true);
    $("cercleCreer").disabled = true;
    try {
      const c = await social.creerCercle(nom, blasonNouveau.lire());
      ctx.trophees?.({ cree: true });
      $("inCercleNom").value = ""; $("cercleForm").hidden = true; $("cercleNouveau").hidden = false; dire("socMsg", "");
      await rafraichir();
      ouvrirCercle(c.id, "Cercle créé ! Invite maintenant tes proches avec le lien.");
    } catch (err) { dire("socMsg", err.message, true); }
    $("cercleCreer").disabled = false;
  });

  // ------------------------------------------------ la page d'un cercle
  function ouvrirCercle(id, message = "") {
    cercleOuvert = id; detail = null;
    montrer("socCercle");
    $("cNom").textContent = "…"; $("cInfo").textContent = ""; $("cClassement").innerHTML = ""; $("cAmis").innerHTML = ""; $("cGestion").hidden = true;
    $("cFilCarte").hidden = true; $("cFil").innerHTML = ""; dire("cFilMsg", ""); fil = null; championFil = null; filDeplie = false;
    $("cRecordsCarte").hidden = !ouvert("records"); $("cRecordsCarte").open = false; $("cRecordsListe").innerHTML = ""; dire("cRecordsMsg", ""); recordsCharges = null;
    recordsFiltre = "tous"; $("cRecordsFiltre").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.v === "tous")));
    dire("cMsg", message); dire("cInvMsg", "");
    window.scrollTo(0, 0);
    chargerCercle();
  }
  function fermerCercle() {
    cercleOuvert = null; detail = null;
    ["socListe", "socCercle", "socAmi"].forEach(v => { $(v).hidden = v !== "socListe"; });
  }
  $("cercleRetour").addEventListener("click", () => { fermerCercle(); rafraichir(); });

  async function chargerCercle() {
    const id = cercleOuvert;
    let c;
    try { c = await social.voirCercle(id); } catch (err) {
      if (cercleOuvert !== id) return;
      fermerCercle(); dire("socMsg", err.message, true); rafraichir(); return;
    }
    if (cercleOuvert !== id) return;
    const premiere = !detail;
    detail = c;
    social.tournoisCercle(id).then(ts => {
      if (cercleOuvert !== id) return;
      $("cTournoisVide").hidden = ts.length > 0;
      tournois.liste($("cTournois"), ts);
      // Le champion du cercle (dernier championnat terminé) : 🏆 à côté de son nom, jusqu'au championnat suivant.
      const champion = championDuCercle(ts);
      // (pour le fil : le dernier championnat terminé, son champion, le 1er de la saison et celui qui s'y colle)
      const ec = evenementsChampionnat(ts);
      if (ec.champion) { championFil = ec; renderFil(); }
      const ligne = champion && $("cClassement").querySelector(`li[data-id="${champion.id}"] .jn`);
      if (ligne && !ligne.querySelector(".champion")) ligne.insertAdjacentHTML("beforeend", ' <span class="champion" title="Champion du cercle">🏆</span>');
    }).catch(() => {});
    const membres = c.membres || [];
    chargerFil(id);
    const moi = membres.find(m => m.id === uid);
    if (moi) ctx.trophees?.({ duelsCercle: (moi.v || 0) + (moi.d || 0) });
    $("cBlason").innerHTML = blasonSVG(c.blason);
    $("cNom").textContent = c.nom;
    $("cInfo").textContent = `${pluriel(membres.length, "membre")} · ${pluriel(c.matchs, "duel")} entre membres`;
    $("cClassement").innerHTML = membres.map((m, i) => `<li class="${m.id === uid ? "moi" : ""}" data-id="${m.id}">
      <span class="cl-rang">${i + 1}</span>
      <span class="mini">${avatarSVG(m.avatar || {})}</span>
      <div style="min-width:0"><div class="jn">${nomComplet(m)}${pointPresence(m)}${m.role === "admin" ? ' <span title="Responsable du cercle">👑</span>' : ""}${m.id === uid ? " <small>(toi)</small>" : ""}</div>
        <div class="jd">${m.v} V – ${m.d} D dans le cercle</div></div>
      <b class="cl-points">${m.classement}</b>
      ${m.id === uid ? "<span></span>" : boutonDefier(m)}
    </li>`).join("");
    const dedans = new Set(membres.map(m => m.id));
    const aInviter = amis.filter(a => a.statut === "amis" && !dedans.has(a.id));
    // (les amis déjà invités, retenus sur le téléphone : le rafraîchissement de la page ne remet pas « Inviter »)
    const deja = new Set(lire(`invitesCercle:${c.id}`, []) || []);
    $("cAmis").innerHTML = aInviter.length
      ? `<p class="hint" style="margin:0">Ou invite directement un ami :</p>` + aInviter.map(a => ligneJoueur(a, `Niveau ${a.classement}`,
        deja.has(a.id) ? `<span class="jd">Invité ✓</span>` : `<button class="petit alt" data-a="inviter">Inviter</button>`)).join("")
      : "";
    const admin = c.role === "admin";
    $("cGestion").hidden = !admin;
    $("cQuitter").textContent = "Quitter le cercle";
    if (admin) {
      if (premiere) { $("inCNom").value = c.nom; blasonGestion.ecrire(c.blason); }
      $("cMembresGestion").innerHTML = membres.filter(m => m.id !== uid).map(m => ligneJoueur(m, m.role === "admin" ? "Responsable" : "Membre",
        `${m.role === "admin" ? "" : `<button class="petit alt" data-a="responsable" aria-label="Nommer responsable" title="Nommer responsable">👑</button>`}<button class="petit alt danger" data-a="exclure">Retirer</button>`)).join("");
    }
  }

  // ---------------------------------------------------------------- les records du cercle (records-cercle.js ; 13 novembre)
  // Chargés seulement quand on ouvre le bloc ; « Tous les duels » ou « Tournois du cercle ».
  // filtre : "tous" (les duels entre membres) ou "tournois" (les tournois du cercle) ; les records d'un tournoi sont sur sa page.
  let recordsCharges = null, recordsFiltre = "tous";
  async function chargerRecords() {
    const id = cercleOuvert, cle = `${id}:${recordsFiltre}`;
    if (!id || recordsCharges === cle) return;
    recordsCharges = cle; dire("cRecordsMsg", "Calcul des records…");
    try {
      const r = calculerRecords(await social.recordsCercle(id, recordsFiltre === "tournois"));
      if (cercleOuvert !== id || recordsCharges !== cle) return;
      renderRecords(r); dire("cRecordsMsg", r.duels ? `D'après ${r.duels} duel${r.duels > 1 ? "s" : ""}${recordsFiltre === "tournois" ? " des tournois du cercle" : " entre membres"} (les plus récents).` : "");
    } catch (err) { if (cercleOuvert === id) { recordsCharges = null; dire("cRecordsMsg", err.message, true); } }
  }
  function renderRecords(r) {
    const membres = new Map((detail?.membres || []).map(m => [m.id, m]));
    $("cRecordsListe").innerHTML = htmlRecords(r, id => (membres.has(id) ? esc(membres.get(id).pseudo) : null), { blocCercle: "Records du cercle" });
  }
  $("cRecordsCarte").addEventListener("toggle", () => { if ($("cRecordsCarte").open) chargerRecords(); });
  $("cRecordsFiltre").addEventListener("click", e => {
    const b = e.target.closest("button[data-v]"); if (!b) return;
    recordsFiltre = b.dataset.v;
    $("cRecordsFiltre").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    chargerRecords();
  });

  // ---------------------------------------------------------------- le fil d'actualité du cercle (fil-cercle.js)
  let fil = null, championFil = null, dossardFil = null, filDeplie = false;   // (plié : les 3 dernières infos ; demande du porteur du projet, 11 novembre)
  const FIL_PLIE = 3;
  async function chargerFil(id) {
    if (!filVisible()) return;
    // (le Dossard 1, étape 71 : s'il manque côté serveur, le fil s'affiche quand même, sans lui)
    try { const [f, d] = await Promise.all([social.filCercle(id), (ouvert("dossard") ? social.dossardDuCercle(id) : Promise.resolve(null)).catch(() => null)]); if (cercleOuvert !== id) return; fil = f; dossardFil = d; renderFil(); }
    catch (err) { if (cercleOuvert === id) { $("cFilCarte").hidden = false; dire("cFilMsg", err.message, true); } }
  }
  function renderFil() {
    if (!fil || !detail) return;
    const membres = new Map((detail.membres || []).map(m => [m.id, m]));
    const nom = id => { const m = membres.get(id); return m ? `<b>${esc(m.pseudo)}</b>` : "<b>?</b>"; };
    const evts = evenementsDuFil(fil, { champion: championFil?.champion, autres: [...(championFil?.autres || []), ...evenementsDossard(dossardFil)], membres: new Set(membres.keys()) });
    const elle = id => membres.get(id)?.genre === "f";
    // Le tenant du titre, en tête du fil.
    const tenant = dossardFil?.tenant;
    $("cDossard").hidden = !tenant;
    if (tenant) $("cDossard").innerHTML = `🟨 <b>Dossard 1</b> : ${esc(tenant.pseudo)}${dossardFil.depuis ? ` <span class="fil-quand">depuis ${ilYA(dossardFil.depuis).replace(/^il y a /, "").replace("à l'instant", "un instant")}</span>` : ""}`;
    $("cFilCarte").hidden = false; $("cFilVide").hidden = evts.length > 0;
    const plus = evts.length - FIL_PLIE;
    $("cFilPlus").hidden = plus <= 0;
    $("cFilPlus").textContent = filDeplie ? "Replier le fil" : `Voir tout le fil (${plus} de plus)`;
    $("cFil").innerHTML = evts.slice(0, filDeplie ? evts.length : FIL_PLIE).map(e => {
      const quand = `<span class="fil-quand">${ilYA(e.quand)}</span>`;
      if (e.type === "arrivee") return `<div class="fil-item"><span class="fil-ic">👋</span><div class="fil-corps"><div>${nom(e.joueur)} a rejoint le cercle</div></div>${quand}</div>`;
      if (e.type === "champion") return `<div class="fil-item fil-fort"><span class="fil-ic">🏆</span><div class="fil-corps"><div>${nom(e.joueur)} est champion${membres.get(e.joueur)?.genre === "f" ? "ne" : ""} du cercle !</div></div>${quand}</div>`;
      if (e.type === "saison") return `<div class="fil-item"><span class="fil-ic">🥇</span><div class="fil-corps"><div>${nom(e.joueur)} a fini la saison en tête</div></div>${quand}</div>`;
      if (e.type === "gage") return `<div class="fil-item fil-fort"><span class="fil-ic">😬</span><div class="fil-corps"><div>${nom(e.joueur)} ${e.playouts ? "perd le match des derniers" : `finit dernier${elle(e.joueur) ? "e" : ""}`} : c'est ${elle(e.joueur) ? "elle" : "lui"} qui s'y colle ! « ${esc(e.enjeu)} »</div></div>${quand}</div>`;
      if (e.type === "dossard") return `<div class="fil-item fil-fort"><span class="fil-ic">🟨</span><div class="fil-corps"><div>${nom(e.joueur)} ${!e.avant ? "prend le Dossard 1 !" : e.avant === e.joueur ? "garde le Dossard 1 !" : `prend le Dossard 1 à ${nom(e.avant)} !`}</div></div>${quand}</div>`;
      if (e.type === "serie") return `<div class="fil-item fil-fort"><span class="fil-ic">🔥</span><div class="fil-corps"><div>${nom(e.joueur)} enchaîne ${e.n} victoires d'affilée dans le cercle</div></div>${quand}</div>`;
      const d = e.duel, g = d.vainqueur === 0 ? d.j0 : d.j1, p = d.vainqueur === 0 ? d.j1 : d.j0;
      const titre = d.une ? ctx.titreUneFil?.(d, membres) : null;
      const reac = REACTIONS.map(([cle, emo]) => {
        const n = d.reactions?.[cle] || 0;
        return `<button class="fil-r${d.ma_reaction === cle ? " mienne" : ""}" data-r="${cle}" aria-label="Réagir ${emo}" aria-pressed="${d.ma_reaction === cle}">${emo}${n ? ` <small>${n}</small>` : ""}</button>`;
      }).join("");
      return `<div class="fil-item" data-duel="${esc(d.id)}"><span class="fil-ic">⚔️</span><div class="fil-corps">
        <div>${nom(g)} bat ${nom(p)} <span class="fil-score">${d.fin === "score" ? scoreDuDuel(d) : d.fin === "forfait" ? "par forfait" : "par abandon"}</span></div>
        ${titre ? `<button class="fil-une" data-une="${esc(d.id)}"><small>📰 La Une</small><b>${esc(titre)}</b></button>` : ""}
        <div class="fil-reacs">${reac}</div></div>${quand}</div>`;
    }).join("");
  }
  $("cFilPlus").addEventListener("click", () => { filDeplie = !filDeplie; renderFil(); });
  $("cFil").addEventListener("click", async e => {
    const une = e.target.closest("[data-une]"), r = e.target.closest("button[data-r]");
    const d = fil?.duels?.find(x => x.id === (une || r)?.closest("[data-duel]")?.dataset.duel);
    if (!d) return;
    if (une) { ctx.ouvrirUneFil?.(d, new Map((detail?.membres || []).map(m => [m.id, m]))); return; }
    r.disabled = true;
    try { await social.reagirFil(cercleOuvert, d.id, r.dataset.r); await chargerFil(cercleOuvert); }
    catch (err) { dire("cFilMsg", err.message, true); r.disabled = false; }
  });

  $("cClassement").addEventListener("click", async e => {
    const b = e.target.closest("button[data-a=defier]"); if (!b || !detail) return;
    const m = detail.membres.find(x => x.id === b.closest("li").dataset.id);
    b.disabled = true;
    try { const t = await ctx.defier(m); if (t) { dire("cMsg", t); return marquerDefie(b, m); } } catch (err) { dire("cMsg", err.message, true); }
    b.disabled = false;
  });
  $("cAmis").addEventListener("click", async e => {
    const b = e.target.closest("button[data-a=inviter]"); if (!b) return;
    const a = amis.find(x => x.id === b.closest(".joueur").dataset.id);
    b.disabled = true;
    try {
      await social.inviterCercle(cercleOuvert, a.id);
      const cle = `invitesCercle:${cercleOuvert}`; ecrire(cle, [...new Set([...(lire(cle, []) || []), a.id])]);
      b.replaceWith(Object.assign(document.createElement("span"), { className: "jd", textContent: "Invité ✓" }));
      dire("cInvMsg", `✉️ Invitation envoyée à ${a.pseudo} : elle apparaît dans son onglet Amis, où il peut l'accepter.`);
    } catch (err) { dire("cInvMsg", err.message, true); b.disabled = false; }
  });
  $("cMembresGestion").addEventListener("click", async e => {
    const b = e.target.closest("button"); if (!b || !detail) return;
    const m = detail.membres.find(x => x.id === b.closest(".joueur").dataset.id);
    const question = b.dataset.a === "exclure" ? `Retirer ${m.pseudo} du cercle ?`
      : `Donner le rôle de responsable à ${m.pseudo} ? Tu deviendras simple membre.`;
    if (!confirm(question)) return;
    b.disabled = true;
    try {
      if (b.dataset.a === "exclure") await social.exclureCercle(cercleOuvert, m.id);
      else await social.nommerResponsable(cercleOuvert, m.id);
      dire("cMsg", "");
    } catch (err) { dire("cMsg", err.message, true); }
    chargerCercle();
  });

  $("cEnregistrer").addEventListener("click", async () => {
    const nom = $("inCNom").value.trim(), erreur = erreurNomCercle(nom);
    if (erreur) return dire("cMsg", erreur, true);
    $("cEnregistrer").disabled = true;
    try { await social.modifierCercle(cercleOuvert, nom, blasonGestion.lire()); dire("cMsg", "Cercle mis à jour."); await chargerCercle(); }
    catch (err) { dire("cMsg", err.message, true); }
    $("cEnregistrer").disabled = false;
  });

  async function partagerCercle(code) {
    const url = lienCercle(base(), code);
    const texte = `Rejoins mon cercle « ${detail.nom} » sur HandSlam, le Pierre-Feuille-Ciseaux en sets de 11 :`;
    try { if (navigator.share) { await navigator.share({ title: `Cercle ${detail.nom}`, text: texte, url }); return; } }
    catch (e) { if (e && e.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(url); dire("cMsg", "Lien copié ! Colle-le dans WhatsApp ou un SMS."); } catch { dire("cMsg", ""); }
    $("cMsg").insertAdjacentHTML("beforeend", `<span class="lien-partage">${esc(url)}</span>`);
  }
  $("cPartager").addEventListener("click", () => { if (detail) partagerCercle(detail.code); });
  $("cNouveauTournoi").addEventListener("click", () => { if (detail) tournois.nouveau({ id: detail.id, nom: detail.nom }); });
  $("tournoiPrive").addEventListener("click", () => tournois.nouveau(null));
  $("cNouveauLien").addEventListener("click", async () => {
    if (!confirm("Créer un nouveau lien d'invitation ? L'ancien ne fonctionnera plus.")) return;
    try { detail.code = await social.nouveauLienCercle(cercleOuvert); dire("cMsg", "Nouveau lien créé. Touche « Envoyer le lien d'invitation » pour le partager."); }
    catch (err) { dire("cMsg", err.message, true); }
  });
  $("cSupprimer").addEventListener("click", async () => {
    if (!detail || !confirm(`Supprimer définitivement le cercle « ${detail.nom} » ? Les membres ne garderont que leur niveau officiel.`)) return;
    try { await social.supprimerCercle(cercleOuvert); fermerCercle(); dire("socMsg", "Cercle supprimé."); rafraichir(); }
    catch (err) { dire("cMsg", err.message, true); }
  });
  $("cQuitter").addEventListener("click", async () => {
    if (!detail) return;
    const seul = detail.membres.length === 1, admin = detail.role === "admin";
    const question = seul ? `Tu es le dernier membre : quitter « ${detail.nom} » le supprimera. Continuer ?`
      : admin ? `Quitter « ${detail.nom} » ? Le membre le plus ancien deviendra responsable.` : `Quitter le cercle « ${detail.nom} » ?`;
    if (!confirm(question)) return;
    try { await social.quitterCercle(cercleOuvert); fermerCercle(); dire("socMsg", "Tu as quitté le cercle."); rafraichir(); }
    catch (err) { dire("cMsg", err.message, true); }
  });

  // ------------------------------------------------ arrivée par un lien « ?cercle=CODE »
  const codeLien = codeCercleDepuisAdresse(location.search);
  if (tournois.lienEnAttente()) {
    ctx.ouvrirOnglet("cercles");
    $("socHorsTexte").innerHTML = "<b>Invitation à un tournoi !</b> Pour t'inscrire, crée ton compte gratuit ou connecte-toi (sans mot de passe). Tu reviendras ici ensuite.";
  }
  if (codeLien) {
    ecrire("cercleLien", codeLien);
    ctx.ouvrirOnglet("cercles");
    $("socHorsTexte").innerHTML = "<b>Invitation dans un cercle !</b> Pour le rejoindre, crée ton compte gratuit ou connecte-toi (sans mot de passe). Tu reviendras ici ensuite.";
  }
  async function rejoindreLienEnAttente() {
    const code = lire("cercleLien", null);
    if (!code || !uid) return;
    ecrire("cercleLien", null);
    if (codeCercleDepuisAdresse(location.search)) history.replaceState(null, "", location.pathname + location.hash);
    ctx.ouvrirOnglet("cercles");
    try {
      const c = await social.rejoindreCercle(code);
      await rafraichir();
      ouvrirCercle(c.id, `Bienvenue dans le cercle « ${c.nom} » !`);
    } catch (err) { dire("socMsg", err.message, true); }
  }

  surSession(ctx.compte.session());
  return {
    rafraichir: () => { rafraichir(); if (!$("socTournoi").hidden) tournois.rafraichir(); else if (cercleOuvert) chargerCercle(); },
    ouvrirTournoi: id => tournois.ouvrir(id),
    // Notre face-à-face avec un ami (depuis un autre écran, ex. Défier un ami).
    ouvrirAmi: async id => {
      const depuis = ctx.vueCourante();
      if (!amis.some(a => a.id === id)) await rafraichir();
      if (!amis.some(a => a.id === id)) return;
      cercleOuvert = null; ouvrirAmi(id);
      origineAmi = depuis !== "viewCercles" ? depuis : null;
    },
  };
}
