// Onglet « Cercles » : mon niveau officiel, mes amis, et mes cercles
// (groupes privés avec leur propre classement).
import * as social from "./social-serveur.js";
import { chercher, duelsAvec } from "./duel-serveur.js";
import { statsFaceAFace } from "./duel-logique.js";
import { EMOJI, NOM } from "./regles.js";
import { avatarSVG, FONDS } from "./avatar.js";
import { DIVISIONS, texteDivision, divisionDe } from "./social-logique.js";
import { EMBLEMES, blasonSVG, normaliserBlason, blasonParDefaut, erreurNomCercle, lienCercle, codeCercleDepuisAdresse, rang, CLASSEMENT_DEPART, texteNiveau, texteCalibrage, provisoire } from "./social-logique.js";
import { lire, ecrire } from "./stockage.js";
import { installerTournois } from "./ecran-tournois.js";
import { championDuCercle } from "./tournoi-logique.js";
import { profils } from "./duel-serveur.js";

const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const nomComplet = p => `${esc(p.pseudo)}<small>#${p.numero}</small>`;
const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? "s" : ""}`;

// ctx : { compte, ouvrirOnglet(nom), defier(profil) → texte, surClassement(points ou null), lancerDuel(duel, profil),
//         trophees(donnees) : trophées des cercles et tournois en ligne (voir titresEnLigne dans profil.js) }
export function installerCercles(ctx) {
  let uid = null, minuterie = 0, recherche = 0, amis = [], cercleOuvert = null, detail = null;
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
    const [cl, listeAmis, cercles, mesTournois] = await Promise.all([
      social.classements([uid]).catch(() => null), social.mesAmis().catch(() => null), social.mesCercles().catch(() => null),
      social.mesTournois().catch(() => null),
    ]);
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

  const ligneJoueur = (p, sous, boutons) => `<div class="joueur" data-id="${p.id}">
    <span class="mini">${avatarSVG(p.avatar || {})}</span>
    <div style="min-width:0"><div class="jn">${esc(p.drapeau || "")} ${nomComplet(p)}</div><div class="jd">${sous}</div></div>
    <div class="actions">${boutons}</div></div>`;

  function renderAmis() {
    const liste = amis.filter(a => !a.recue);
    $("socAmisVide").hidden = liste.length > 0;
    $("socAmis").innerHTML = liste.map(a => a.statut === "amis"
      ? ligneJoueur(a, `Niveau ${texteNiveau(a.classement, a.joues)}${a.joues ? ` · ${pluriel(a.joues, "duel officiel")}` : ""}`,
        `<button class="petit" data-a="defier">Défier</button><button class="petit alt" data-a="retirer" aria-label="Retirer de mes amis">✕</button>`)
      : ligneJoueur(a, "Demande envoyée", `<button class="petit alt" data-a="annuler">Annuler</button>`)).join("");
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
    $("aAvatar").innerHTML = avatarSVG(a.avatar || {});
    $("aNom").innerHTML = `${esc(a.drapeau || "")} ${nomComplet(a)}`;
    $("aInfo").textContent = `Niveau ${texteNiveau(a.classement, a.joues)}${a.joues ? ` · ${pluriel(a.joues, "duel officiel")}` : ""}`;
    $("aStats").innerHTML = `<p class="hint">Chargement…</p>`; dire("aMsg", "");
    try {
      const r = statsFaceAFace(await duelsAvec(id), uid);
      if (amiOuvert === id) $("aStats").innerHTML = renderFaceAFace(r, a.pseudo);
    } catch { if (amiOuvert === id) $("aStats").innerHTML = `<p class="hint">Impossible de charger vos duels. Vérifie ta connexion.</p>`; }
  }
  function renderFaceAFace(r, nom) {
    if (!r.matchs) return `<p class="hint">Vous ne vous êtes encore jamais affrontés. Lance-lui un défi !</p>`;
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
      <p class="hint" style="text-align:center;margin-top:0">${pluriel(r.matchs, "duel")}${r.officiels ? `, dont ${r.officiels} officiel${r.officiels > 1 ? "s" : ""}` : ""} · ${pct(r.v, r.d)} de victoires pour toi</p>
      ${ligne(r.sets[0], "Sets gagnés", r.sets[1])}
      ${ligne(r.points[0], "Points gagnés", r.points[1])}
      <h3 class="ff-titre">Signes joués</h3>
      ${signes}
      ${ligne(taux(r.rejoueApresVictoire[0], "meme"), "Rejoue le même signe après un point gagné", taux(r.rejoueApresVictoire[1], "meme"))}
      ${ligne(taux(r.changeApresDefaite[0], "change"), "Change de signe après un point perdu", taux(r.changeApresDefaite[1], "change"))}
      ${serie}
      <h3 class="ff-titre">Derniers affrontements</h3><ul class="ff-derniers">${derniers}</ul>${autres}`;
  }
  $("amiRetour").addEventListener("click", () => { amiOuvert = null; montrer("socListe"); rafraichir(); });
  $("aDefier").addEventListener("click", async () => {
    const a = amis.find(x => x.id === amiOuvert); if (!a) return;
    $("aDefier").disabled = true;
    try { dire("aMsg", await ctx.defier(a)); } catch (err) { dire("aMsg", err.message, true); }
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
    if (a === "retirer" && !confirm(`Retirer ${joueur.pseudo} de tes amis ?`)) return;
    b.disabled = true;
    try {
      if (a === "defier") dire("socMsg", await ctx.defier(joueur));
      if (a === "retirer" || a === "annuler") await social.retirerAmi(id);
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
      dire("socMsg", r === "amis" ? "Vous êtes maintenant amis." : "Demande envoyée : elle apparaîtra dans son onglet Cercles.");
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
      const ligne = champion && $("cClassement").querySelector(`li[data-id="${champion.id}"] .jn`);
      if (ligne && !ligne.querySelector(".champion")) ligne.insertAdjacentHTML("beforeend", ' <span class="champion" title="Champion du cercle">🏆</span>');
    }).catch(() => {});
    const membres = c.membres || [];
    const moi = membres.find(m => m.id === uid);
    if (moi) ctx.trophees?.({ duelsCercle: (moi.v || 0) + (moi.d || 0) });
    $("cBlason").innerHTML = blasonSVG(c.blason);
    $("cNom").textContent = c.nom;
    $("cInfo").textContent = `${pluriel(membres.length, "membre")} · ${pluriel(c.matchs, "duel")} entre membres`;
    $("cClassement").innerHTML = membres.map((m, i) => `<li class="${m.id === uid ? "moi" : ""}" data-id="${m.id}">
      <span class="cl-rang">${i + 1}</span>
      <span class="mini">${avatarSVG(m.avatar || {})}</span>
      <div style="min-width:0"><div class="jn">${nomComplet(m)}${m.role === "admin" ? ' <span title="Responsable du cercle">👑</span>' : ""}${m.id === uid ? " <small>(toi)</small>" : ""}</div>
        <div class="jd">${m.v} V – ${m.d} D dans le cercle</div></div>
      <b class="cl-points">${m.classement}</b>
      ${m.id === uid ? "<span></span>" : `<button class="petit" data-a="defier">Défier</button>`}
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

  $("cClassement").addEventListener("click", async e => {
    const b = e.target.closest("button[data-a=defier]"); if (!b || !detail) return;
    const m = detail.membres.find(x => x.id === b.closest("li").dataset.id);
    b.disabled = true;
    try { dire("cMsg", await ctx.defier(m)); } catch (err) { dire("cMsg", err.message, true); }
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
      dire("cInvMsg", `✉️ Invitation envoyée à ${a.pseudo} : elle apparaît dans son onglet Cercles, où il peut l'accepter.`);
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
  };
}
