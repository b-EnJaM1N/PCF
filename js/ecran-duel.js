// Onglet « Duel » : chercher un joueur, le défier, inviter par lien,
// voir les défis reçus et envoyés, reprendre un duel en cours.
import * as serveur from "./duel-serveur.js";
import { lienDefi, codeDepuisAdresse, adversaireDe, FORMAT, formatCourt, enRendezVous, texteRdvRestant, texteDefie } from "./duel-logique.js";
import { avatarSVG } from "./avatar.js";
import { lire, ecrire } from "./stockage.js";
import { demanderAmi, mesAmis } from "./social-serveur.js";
import { pointPresence, textePresence, parPresence } from "./social-logique.js";
import { etatNotifications, activerNotifications } from "./notifications.js";
import { MISES, gainDuel } from "./jetons-logique.js";
import { SUGGESTIONS, erreurEnjeu, nettoyerEnjeu } from "./enjeux.js";

const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const nomComplet = p => `${esc(p.pseudo)}<small>#${p.numero}</small>`;

// ctx : { compte (installerCompte), lancerDuel(duel, profilAdversaire), duelEnCours(), ouvrirOnglet(nom), signaler(cle, valeur) }
export function installerDuels(ctx) {
  let uid = null, arrets = [], minuterie = 0, recherche = 0;
  // La salle d'attente d'un défi accepté : { duel, adv (profil), minuterie } ; quittes : les rendez-vous qu'on a quittés exprès.
  let salle = null;
  const quittes = new Set();
  // Les joueurs que j'ai défiés et qui n'ont pas encore joué (pour afficher « Défié ✓ » dans les cercles et les amis).
  let defiesA = new Set();
  // Mes amis, sous la barre de recherche (rechargés au plus une fois par minute).
  let amis = [], amisLus = 0;
  // Les défis reçus déjà montrés dans la fenêtre (une seule fois chacun, même après avoir fermé l'appli).
  const defisVus = new Set(lire("defisVus", []));
  let fenetre = null;   // { duel, adv, mode : "defi" (reçu) ou "rdv" (accepté, on m'attend) } : affiché dans la fenêtre
  // Les rendez-vous déjà proposés dans la fenêtre : id → heure (on repropose au bout de 10 minutes si l'autre attend encore).
  const rdvProposes = new Map();
  const format = { len: lire("duelLen", 11), win: lire("duelWin", 2), classe: lire("duelClasse", true), mise: MISES.includes(lire("duelMise", 0)) ? lire("duelMise", 0) : 0 };
  const dire = (t, erreur = false) => { $("duelMsg").textContent = t; $("duelMsg").classList.toggle("erreur", erreur); };
  const base = () => location.origin + location.pathname;

  // ------------------------------------------------ format du défi
  const renderFormat = () => {
    document.querySelectorAll("#duelLen button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.v === format.len)));
    document.querySelectorAll("#duelWin button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.v === format.win)));
    // Les formats courts (1 set, sets de 3 ou 1 point) sont toujours amicaux.
    const court = formatCourt(format.len, format.win);
    $("duelClasse").disabled = court; $("duelClasse").checked = format.classe && !court;
    $("duelClasseTexte").textContent = court ? `${format.win === 1 ? "Match en 1 set" : `Sets de ${format.len} point${format.len > 1 ? "s" : ""}`} : toujours amical, ton niveau officiel ne bouge pas.`
      : "Match officiel : compte pour ton niveau officiel (décoche pour un match amical)";
  };
  const renderMise = () => {
    document.querySelectorAll("#duelMise button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.v === format.mise)));
    $("duelMiseTexte").textContent = format.mise
      ? `Chacun paie ${format.mise} jetons quand le match commence ; le gagnant en remporte ${gainDuel(format.mise)}. Refusé ou annulé : personne ne paie.`
      : "Sans mise : on joue pour le plaisir (et pour le niveau officiel, si le match est officiel).";
  };
  document.querySelectorAll("#duelMise button").forEach(b => b.addEventListener("click", () => { format.mise = +b.dataset.v; ecrire("duelMise", format.mise); renderMise(); }));
  renderMise();
  document.querySelectorAll("#duelLen button").forEach(b => b.addEventListener("click", () => { format.len = +b.dataset.v; ecrire("duelLen", format.len); renderFormat(); }));
  document.querySelectorAll("#duelWin button").forEach(b => b.addEventListener("click", () => { format.win = +b.dataset.v; ecrire("duelWin", format.win); renderFormat(); }));
  renderFormat();
  $("duelClasse").addEventListener("change", e => { format.classe = e.target.checked; ecrire("duelClasse", format.classe); });


  // ------------------------------------------------ l'enjeu (facultatif, entre amis)
  $("duelEnjeuOn").addEventListener("change", e => { $("duelEnjeuBox").hidden = !e.target.checked; if (e.target.checked) $("duelEnjeu").focus(); });
  $("duelEnjeuIdees").innerHTML = SUGGESTIONS.map((s, i) => `<button type="button" data-i="${i}">${esc(s)}</button>`).join("");
  $("duelEnjeuIdees").querySelectorAll("button").forEach(b => b.addEventListener("click", () => { $("duelEnjeu").value = SUGGESTIONS[+b.dataset.i]; $("duelEnjeu").focus(); }));
  // L'enjeu choisi (null : pas d'enjeu) ; une erreur s'il n'est pas accepté.
  const enjeuChoisi = () => {
    if (!$("duelEnjeuOn").checked) return null;
    const e = erreurEnjeu($("duelEnjeu").value);
    if (e) throw new Error(e);
    return nettoyerEnjeu($("duelEnjeu").value);
  };

  // ------------------------------------------------ connecté ou pas
  function surSession(session) {
    uid = session?.user?.id || null;
    $("duelHors").hidden = !!uid; $("duelOn").hidden = !uid;
    arrets.forEach(f => f()); arrets = []; clearInterval(minuterie);
    if (!uid) { quitterSalle(); ctx.signaler("duels", { recus: 0, enCours: 0, rdv: 0 }); return; }
    // Défis reçus et envoyés : en direct, avec une vérification régulière en secours.
    arrets.push(serveur.ecouter("recus", `j1=eq.${uid}`, rafraichir), serveur.ecouter("envoyes", `j0=eq.${uid}`, rafraichir));
    minuterie = setInterval(rafraichir, 8000);
    rafraichir();
    serveur.profils([uid]).then(([p]) => { if (p) $("duelVisible").checked = p.visible_recherche; }).catch(() => {});
    rejoindreLienEnAttente();
  }
  ctx.compte.surConnexion(surSession);
  $("duelVersCompte").addEventListener("click", () => ctx.ouvrirOnglet("profile"));

  // ------------------------------------------------ listes
  async function rafraichir() {
    if (!uid) return;
    let duels;
    try { duels = await serveur.mesDuels(); } catch { return; }
    const ids = [...new Set(duels.map(d => adversaireDe(d, uid)).filter(Boolean))];
    const joueurs = new Map((await serveur.profils(ids).catch(() => [])).map(p => [p.id, p]));
    const enCours = duels.filter(d => ["presentation", "jeu", "entre_sets"].includes(d.phase));
    const recus = duels.filter(d => d.phase === "attente" && d.j1 === uid && !d.accepte_le);
    const envoyes = duels.filter(d => d.phase === "attente" && d.j0 === uid && !d.accepte_le);
    const rdvs = duels.filter(d => enRendezVous(d));
    defiesA = new Set(duels.filter(d => d.phase === "attente" && d.j0 === uid && d.j1).map(d => d.j1));
    chargerAmis();

    // Un défi vient d'être accepté (ou je reviens dans l'appli) : on y va.
    const actif = enCours[0];
    if (actif && !ctx.duelEnCours() && joueurs.get(adversaireDe(actif, uid))) { quitterSalle(); ctx.lancerDuel(actif, joueurs.get(adversaireDe(actif, uid))); }
    // Un défi reçu pas encore montré : une fenêtre s'ouvre (pas pendant un match ni dans une salle d'attente).
    const nouveau = recus.find(d => !d.tournoi_match && !defisVus.has(d.id) && joueurs.get(d.j0));
    if (nouveau && !fenetre && !salle && !actif && !ctx.duelEnCours() && !document.body.classList.contains("en-match")) montrerDefi(nouveau, joueurs.get(nouveau.j0), recus.length - 1);
    if (fenetre && ![...recus, ...rdvs].some(d => d.id === fenetre.duel.id)) fermerFenetre();   // annulé ou commencé entre-temps
    const libre = !actif && !salle && !fenetre && !document.hidden && !ctx.duelEnCours() && !document.body.classList.contains("en-match");
    // Mon défi vient d'être accepté, l'appli ouverte : j'entre tout de suite dans la salle d'attente (le match démarre si l'autre y est).
    const frais = rdvs.find(d => d.j0 === uid && !quittes.has(d.id) && Date.now() - Date.parse(d.accepte_le) < 2 * 60000 && joueurs.get(d.j1));
    if (libre && frais) { ctx.ouvrirOnglet("duel"); entrerSalle(frais, joueurs.get(frais.j1)); }
    // Sinon (j'ouvre l'appli plus tard, ou l'autre m'attend) : une fenêtre me le propose.
    else if (libre) {
      const attendu = rdvs.find(d => { const adv = joueurs.get(adversaireDe(d, uid)), vu = rdvProposes.get(d.id) || 0;
        return adv && Date.now() - vu > 10 * 60000 && (d.j0 === uid ? !defisVus.has(`${d.id}:ok`) || lAutreAttend(d) : lAutreAttend(d)); });
      if (attendu) proposerRdv(attendu, joueurs.get(adversaireDe(attendu, uid)));
    }

    const ligne = (d, p, boutons, info = "") => `<div class="joueur" data-id="${d.id}">
      <span class="mini">${p ? avatarSVG(p.avatar || {}) : "🔗"}</span>
      <div style="min-width:0"><div class="jn">${p ? nomComplet(p) : "Défi par lien"}</div><div class="jd">${d.tournoi_match ? "🏆 Match de tournoi · " : ""}${FORMAT(d)}</div>${d.enjeu ? `<div class="jd enjeu">🎯 Enjeu : « ${esc(d.enjeu)} »</div>` : ""}${info ? `<div class="jd">${info}</div>` : ""}</div>
      <div class="actions">${boutons}</div></div>`;
    $("duelEnCoursCard").hidden = !enCours.length;
    $("duelEnCours").innerHTML = enCours.map(d => ligne(d, joueurs.get(adversaireDe(d, uid)), `<button class="petit" data-a="reprendre">Reprendre</button>`)).join("");
    $("duelRdvCard").hidden = !rdvs.length;
    $("duelRdv").innerHTML = rdvs.map(d => ligne(d, joueurs.get(adversaireDe(d, uid)),
      `<button class="petit" data-a="rejoindre">${salle?.duel.id === d.id ? "En attente…" : "Rejoindre"}</button><button class="petit alt" data-a="annuler">Annuler</button>`,
      `✅ Accepté · encore ${texteRdvRestant(d)} pour vous retrouver`)).join("");
    $("duelRecusCard").hidden = !recus.length;
    $("duelRecus").innerHTML = recus.map(d => ligne(d, joueurs.get(d.j0), `<button class="petit" data-a="accepter">${d.enjeu ? "Accepter le défi et l'enjeu" : "Accepter"}</button>${d.tournoi_match ? "" : `<button class="petit alt" data-a="refuser">Refuser</button>`}`)).join("");
    $("duelEnvoyesCard").hidden = !envoyes.length;
    $("duelEnvoyes").innerHTML = envoyes.map(d => ligne(d, d.j1 ? joueurs.get(d.j1) : null,
      `${d.par_lien ? `<button class="petit alt" data-a="partager" data-code="${d.code}">Lien</button>` : ""}${d.tournoi_match ? "" : `<button class="petit alt" data-a="annuler">Annuler</button>`}`)).join("");
    ctx.signaler("duels", { recus: recus.length, enCours: enCours.length, rdv: rdvs.length });

    const actions = { refuser: id => serveur.repondre(id, false), annuler: id => serveur.annuler(id) };
    document.querySelectorAll("#viewDuel .joueur button").forEach(b => b.addEventListener("click", async () => {
      const id = b.closest(".joueur").dataset.id, a = b.dataset.a;
      if (a === "partager") return partager(b.dataset.code);
      if (a === "reprendre") { const d = enCours.find(x => x.id === id); return ctx.lancerDuel(d, joueurs.get(adversaireDe(d, uid))); }
      if (a === "rejoindre") { const d = rdvs.find(x => x.id === id); quittes.delete(id); return entrerSalle(d, joueurs.get(adversaireDe(d, uid))); }
      b.disabled = true;
      if (a === "accepter") {
        // Accepter, c'est entrer dans la salle d'attente (un match de tournoi, lui, commence tout de suite).
        const d0 = recus.find(x => x.id === id), adv = joueurs.get(d0.j0);
        try { const d = await serveur.repondre(id, true); dire(""); if (d.phase === "attente") entrerSalle(d, adv); else ctx.lancerDuel(d, adv); }
        catch (e) { dire(e.message, true); }
        return rafraichir();
      }
      if (a === "annuler" && id === salle?.duel.id) quitterSalle();
      try { await actions[a](id); dire(""); } catch (e) { dire(e.message, true); }
      rafraichir();
    }));
  }

  // ------------------------------------------------ la fenêtre « X te défie ! »
  function montrerDefi(duel, adv, autres) {
    fenetre = { duel, adv };
    defisVus.add(duel.id); ecrire("defisVus", [...defisVus].slice(-50));
    $("defiRecuTitre").textContent = `⚔️ ${adv.pseudo} te défie !`;
    $("defiRecuCorps").innerHTML = `<div class="joueur"><span class="mini">${avatarSVG(adv.avatar || {})}</span>
      <div style="min-width:0"><div class="jn">${esc(adv.drapeau || "")} ${nomComplet(adv)}</div><div class="jd">${FORMAT(duel)}</div>${duel.enjeu ? `<div class="jd enjeu">🎯 Enjeu : « ${esc(duel.enjeu)} »</div>` : ""}</div><span></span></div>
      ${autres > 0 ? `<p class="hint">Et ${autres} autre${autres > 1 ? "s" : ""} défi${autres > 1 ? "s" : ""} t'attend${autres > 1 ? "ent" : ""} dans Jouer › Défier un ami.</p>` : ""}
      <p class="hint">En acceptant, tu entres dans la salle d'attente : le match démarre dès que vous êtes là tous les deux.</p>`;
    $("defiRecuAccepter").textContent = duel.enjeu ? "Accepter le défi et l'enjeu" : "Accepter";
    $("defiRecuAccepter").disabled = $("defiRecuRefuser").disabled = false;
    $("defiRecuFenetre").hidden = false;
  }
  // L'autre est-il dans la salle d'attente en ce moment ?
  const lAutreAttend = d => { const t = d.j0 === uid ? d.rdv1 : d.rdv0; return !!t && Date.now() - Date.parse(t) < 30000; };
  // « X a accepté ton défi » ou « X t'attend » : rejoindre la salle d'attente.
  function proposerRdv(duel, adv) {
    fenetre = { duel, adv, mode: "rdv" };
    rdvProposes.set(duel.id, Date.now());
    if (duel.j0 === uid) { defisVus.add(`${duel.id}:ok`); ecrire("defisVus", [...defisVus].slice(-50)); }
    const attend = lAutreAttend(duel), elle = (adv.genre || adv.fiche?.genre) === "f";
    $("defiRecuTitre").textContent = attend ? `⏳ ${adv.pseudo} t'attend !` : `✅ ${adv.pseudo} a accepté ton défi !`;
    $("defiRecuCorps").innerHTML = `<div class="joueur"><span class="mini">${avatarSVG(adv.avatar || {})}</span>
      <div style="min-width:0"><div class="jn">${esc(adv.drapeau || "")} ${nomComplet(adv)}</div><div class="jd">${FORMAT(duel)}</div>${duel.enjeu ? `<div class="jd enjeu">🎯 Enjeu : « ${esc(duel.enjeu)} »</div>` : ""}</div><span></span></div>
      <p class="hint">${attend ? `${esc(adv.pseudo)} est dans la salle d'attente : rejoins-${elle ? "la" : "le"}, le match démarre aussitôt.`
        : `Rejoins la salle d'attente : ${esc(adv.pseudo)} sera prévenu${elle ? "e" : ""} que tu l'attends, et le match démarrera dès son arrivée.`}</p>`;
    $("defiRecuAccepter").textContent = "Rejoindre la salle d'attente";
    $("defiRecuRefuser").textContent = "Annuler le défi";
    $("defiRecuAccepter").disabled = $("defiRecuRefuser").disabled = false;
    $("defiRecuFenetre").hidden = false;
  }
  function fermerFenetre() { fenetre = null; $("defiRecuFenetre").hidden = true; $("defiRecuRefuser").textContent = "Refuser"; }
  $("defiRecuPlusTard").addEventListener("click", () => { if (fenetre?.mode === "rdv") quittes.add(fenetre.duel.id); fermerFenetre(); });
  $("defiRecuFenetre").addEventListener("click", e => { if (e.target.id === "defiRecuFenetre") fermerFenetre(); });
  $("defiRecuRefuser").addEventListener("click", async () => {
    const f = fenetre; if (!f) return;
    $("defiRecuRefuser").disabled = true;
    if (f.mode === "rdv" && !confirm(`Annuler le défi avec ${f.adv.pseudo} ?`)) { $("defiRecuRefuser").disabled = false; return; }
    try { await (f.mode === "rdv" ? serveur.annuler(f.duel.id) : serveur.repondre(f.duel.id, false)); } catch (e) { dire(e.message, true); }
    fermerFenetre(); rafraichir();
  });
  $("defiRecuAccepter").addEventListener("click", async () => {
    const f = fenetre; if (!f) return;
    $("defiRecuAccepter").disabled = true;
    if (f.mode === "rdv") { fermerFenetre(); quittes.delete(f.duel.id); ctx.ouvrirOnglet("duel"); entrerSalle(f.duel, f.adv); return; }
    try {
      const d = await serveur.repondre(f.duel.id, true);
      fermerFenetre();
      if (d.phase === "attente") { ctx.ouvrirOnglet("duel"); entrerSalle(d, f.adv); } else ctx.lancerDuel(d, f.adv);
    } catch (e) { fermerFenetre(); ctx.ouvrirOnglet("duel"); dire(e.message, true); }
    rafraichir();
  });

  // ------------------------------------------------ la salle d'attente (défi accepté, on attend l'autre)
  function entrerSalle(duel, adv) {
    if (!duel || !adv) return;
    if (salle?.duel.id === duel.id) return;
    quitterSalle();
    salle = { duel, adv, minuterie: setInterval(battre, 3000) };
    $("duelSalle").innerHTML = `<div class="joueur"><span class="mini">${avatarSVG(adv.avatar || {})}</span>
      <div style="min-width:0"><div class="jn">En attente de ${nomComplet(adv)}…</div><div class="jd">${FORMAT(duel)}</div>${duel.enjeu ? `<div class="jd enjeu">🎯 Enjeu : « ${esc(duel.enjeu)} »</div>` : ""}</div><span></span></div>`;
    $("duelSalleCard").hidden = false;
    battre();
    // Pas de notifications sur ce téléphone : on propose de les activer (pour être prévenu quand l'autre arrive).
    $("duelSalleNotif").hidden = true;
    etatNotifications().then(e => {
      if (salle?.duel.id !== duel.id || (e !== "inactif" && e !== "refuse")) return;
      $("duelSalleNotif").hidden = false;
      $("duelSalleNotifBtn").hidden = e !== "inactif";
      $("duelSalleNotifTexte").textContent = e === "inactif"
        ? `Active les notifications : si tu quittes la salle, tu seras prévenu quand ${adv.pseudo} arrive.`
        : "Les notifications sont bloquées pour HandSlam dans les réglages du téléphone : débloque-les pour être prévenu quand ton adversaire arrive.";
    }).catch(() => {});
  }
  $("duelSalleNotifBtn").addEventListener("click", async () => {
    $("duelSalleNotifBtn").disabled = true;
    try { const e = await activerNotifications(); if (e === "actif") { $("duelSalleNotif").hidden = true; dire("🔔 Notifications activées : tu seras prévenu quand on t'attend."); } }
    catch (err) { dire(err.message, true); }
    $("duelSalleNotifBtn").disabled = false;
  });
  function quitterSalle() {
    if (!salle) return;
    clearInterval(salle.minuterie);
    salle = null;
    $("duelSalleCard").hidden = true;
  }
  // Toutes les 3 secondes : « je suis là » ; le match démarre quand l'autre y est aussi.
  async function battre() {
    const s = salle; if (!s || document.hidden) return;
    let d;
    try { d = await serveur.rendezVous(s.duel.id); } catch (e) { if (salle === s) { quitterSalle(); dire(e.message, true); } return; }
    if (salle !== s) return;
    if (["presentation", "jeu", "entre_sets"].includes(d.phase)) { quitterSalle(); if (!ctx.duelEnCours()) ctx.lancerDuel(d, s.adv); return; }
    if (d.phase !== "attente") { quitterSalle(); dire(d.phase === "annule" ? `Le défi avec ${s.adv.pseudo} a été annulé.` : ""); rafraichir(); }
  }
  $("duelSalleQuitter").addEventListener("click", () => {
    if (salle) { quittes.add(salle.duel.id); dire(`Tu as quitté la salle d'attente. Le défi reste dans « Défis acceptés » : touche « Rejoindre » quand tu veux.`); }
    quitterSalle(); rafraichir();
  });

  // ------------------------------------------------ mes amis, sous la barre de recherche
  async function chargerAmis() {
    if (Date.now() - amisLus > 60000) {
      try { amis = parPresence((await mesAmis()).filter(a => a.statut === "amis")); amisLus = Date.now(); } catch { /* on garde l'ancienne liste */ }
    }
    renderAmis();
  }
  function renderAmis() {
    const cherche = $("inRecherche").value.trim().length > 0;
    $("duelAmisZone").hidden = !uid || !amis.length || cherche;
    $("duelAmis").innerHTML = amis.map(a => `<div class="joueur cliquable" data-id="${a.id}" role="button" tabindex="0">
      <span class="mini">${avatarSVG(a.avatar || {})}</span>
      <div style="min-width:0"><div class="jn">${esc(a.drapeau || "")} ${nomComplet(a)}${pointPresence(a)}</div><div class="jd">${textePresence(a)}Niveau ${a.classement}</div></div>
      <div class="actions">${defiesA.has(a.id) ? `<button class="petit alt" disabled>${texteDefie(a)}</button>` : `<button class="petit" data-a="defier">Défier</button>`}</div></div>`).join("");
  }
  $("duelAmis").addEventListener("click", async e => {
    const b = e.target.closest("button[data-a=defier]");
    // Toucher un ami (ailleurs que sur le bouton) : notre face-à-face, avec l'historique de nos duels.
    if (!b) { const l = e.target.closest(".joueur"); if (l && !e.target.closest("button")) ctx.ouvrirAmi?.(l.dataset.id); return; }
    const a = amis.find(x => x.id === b.closest(".joueur").dataset.id); if (!a) return;
    b.disabled = true;
    if (await defier(a)) renderAmis(); else b.disabled = false;
  });

  // ------------------------------------------------ recherche
  $("inRecherche").addEventListener("input", () => {
    clearTimeout(recherche);
    const t = $("inRecherche").value.trim();
    renderAmis();   // la liste d'amis s'efface pendant une recherche
    if (t.replace(/#.*/, "").length < 2) { $("duelResultats").innerHTML = ""; return; }
    recherche = setTimeout(async () => {
      try {
        const res = await serveur.chercher(t);
        if ($("inRecherche").value.trim() !== t) return;
        $("duelResultats").innerHTML = res.length ? res.map(p => `<div class="joueur" data-id="${p.id}">
            <span class="mini">${avatarSVG(p.avatar || {})}</span>
            <div style="min-width:0"><div class="jn">${esc(p.drapeau)} ${nomComplet(p)}</div><div class="jd">Niveau ${p.niveau}</div></div>
            <div class="actions"><button class="petit alt" data-a="ami" aria-label="Ajouter en ami">Ami +</button><button class="petit" data-a="defier">Défier</button></div></div>`).join("")
          : `<p class="hint">Aucun joueur trouvé. Invite-le plutôt par un lien.</p>`;
        $("duelResultats").querySelectorAll("button").forEach(b => b.addEventListener("click", async () => {
          const ligne = b.closest(".joueur"), p = res.find(x => x.id === ligne.dataset.id);
          b.disabled = true;
          if (b.dataset.a === "ami") {
            try { const r = await demanderAmi(p.id); b.textContent = r === "amis" ? "Amis ✓" : "Demandé ✓"; dire(r === "amis" ? `${p.pseudo} et toi êtes maintenant amis.` : `Demande d'ami envoyée à ${p.pseudo}#${p.numero}.`); }
            catch (e) { dire(e.message, true); b.disabled = false; }
            return;
          }
          if (!(await defier(p))) { b.disabled = false; return; }   // fenêtre fermée sans envoyer
          $("inRecherche").value = ""; $("duelResultats").innerHTML = ""; renderAmis();
        }));
      } catch (e) { dire(e.message, true); }
    }, 350);
  });

  // ------------------------------------------------ la fenêtre « Défier X » (la même partout : recherche, amis, cercles, face-à-face, lien)
  // Renvoie une promesse : le texte de confirmation une fois le défi envoyé, ou null si on ferme sans envoyer.
  let enCoursDefi = null;   // { p (null : défi par lien), resoudre }
  function defier(p) {
    return new Promise(resoudre => {
      enCoursDefi?.resoudre(null);
      enCoursDefi = { p, resoudre };
      $("defiFenetreTitre").textContent = p ? `⚔️ Défier ${p.pseudo}` : "🔗 Défier par un lien";
      $("defiFenetreAdv").innerHTML = p
        ? `<div class="joueur"><span class="mini">${avatarSVG(p.avatar || {})}</span><div style="min-width:0"><div class="jn">${esc(p.drapeau || "")} ${nomComplet(p)}</div><div class="jd">Niveau ${p.classement ?? p.niveau ?? ""}</div></div><span></span></div>`
        : `<p class="hint">Choisis le format, puis envoie le lien (WhatsApp, SMS…) : le premier qui l'ouvre devient ton adversaire.</p>`;
      $("duelEnjeuZone").hidden = !p;
      $("defiEnvoyer").textContent = p ? "Envoyer le défi" : "Créer le lien et le partager";
      $("defiEnvoyer").disabled = false;
      $("defiFenetreMsg").textContent = ""; $("defiFenetreMsg").classList.remove("erreur");
      $("defiFenetre").hidden = false;
    });
  }
  const fermerDefi = (resultat = null) => { const e = enCoursDefi; enCoursDefi = null; $("defiFenetre").hidden = true; e?.resoudre(resultat); };
  $("defiAnnuler").addEventListener("click", () => fermerDefi());
  $("defiFenetre").addEventListener("click", e => { if (e.target.id === "defiFenetre") fermerDefi(); });
  $("defiEnvoyer").addEventListener("click", async () => {
    const e = enCoursDefi; if (!e) return;
    $("defiEnvoyer").disabled = true;
    try {
      if (e.p) { const texte = await envoyerDefi(e.p); fermerDefi(texte); }
      else {
        const d = await serveur.creer(null, format.len, format.win, format.classe, format.mise);
        fermerDefi("lien"); await partager(d.code); rafraichir();
      }
    } catch (err) {
      $("defiFenetreMsg").textContent = err.message; $("defiFenetreMsg").classList.add("erreur");
      $("defiEnvoyer").disabled = false;
    }
  });

  async function envoyerDefi(p) {
    const enjeu = enjeuChoisi();
    await serveur.creer(p.id, format.len, format.win, format.classe, format.mise, enjeu);
    defiesA.add(p.id);
    if (enjeu) { $("duelEnjeuOn").checked = false; $("duelEnjeuBox").hidden = true; $("duelEnjeu").value = ""; }
    const texte = `Défi ${format.classe && !formatCourt(format.len, format.win) ? "officiel" : "amical"}${format.mise ? ` avec une mise de ${format.mise} jetons` : ""}${enjeu ? ` et l'enjeu « ${enjeu} »` : ""} envoyé à ${p.pseudo}#${p.numero} ! Il apparaîtra en haut de son menu « Jouer ». Quand ${p.genre === "f" ? "elle" : "il"} l'acceptera, tu seras prévenu : le match démarrera dès que vous serez là tous les deux.`;
    dire(texte); rafraichir();
    return texte;
  }

  // ------------------------------------------------ défi par lien
  async function partager(code) {
    const url = lienDefi(base(), code);
    const texte = "Je te défie sur HandSlam, le Pierre-Feuille-Ciseaux en sets de 11 ! Clique pour relever le défi :";
    try {
      if (navigator.share) { await navigator.share({ title: "Défi HandSlam", text: texte, url }); return; }
    } catch (e) { if (e && e.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(url); dire("Lien copié ! Colle-le dans WhatsApp ou un SMS."); }
    catch { dire(""); }
    $("duelMsg").insertAdjacentHTML("beforeend", `<span class="lien-partage">${esc(url)}</span>`);
  }
  $("duelLien").addEventListener("click", () => defier(null));

  // Arrivée par un lien « ?duel=CODE » : on garde le code jusqu'à ce que le joueur soit connecté.
  const codeLien = codeDepuisAdresse(location.search);
  if (codeLien) {
    ecrire("duelLien", codeLien);   // (l'adresse garde « ?duel=… » : le lien de connexion par e-mail le conserve)
    ctx.ouvrirOnglet("duel");
    $("duelHorsTexte").innerHTML = "<b>Tu as été défié !</b> Pour relever le défi, crée ton compte gratuit ou connecte-toi (sans mot de passe). Tu reviendras ici ensuite.";
  }
  async function rejoindreLienEnAttente() {
    const code = lire("duelLien", null);
    if (!code || !uid) return;
    ecrire("duelLien", null);
    if (codeDepuisAdresse(location.search)) history.replaceState(null, "", location.pathname + location.hash);
    try {
      const d = await serveur.rejoindre(code);
      if (d.phase === "attente" && !d.accepte_le) { dire("C'est ton propre lien : envoie-le à un ami !"); ctx.ouvrirOnglet("duel"); return; }
      const [p] = await serveur.profils([adversaireDe(d, uid)]);
      if (d.phase === "attente") { ctx.ouvrirOnglet("duel"); entrerSalle(d, p); rafraichir(); return; }
      ctx.lancerDuel(d, p);
    } catch (e) { ctx.ouvrirOnglet("duel"); dire(e.message, true); }
  }

  // ------------------------------------------------ visibilité dans la recherche
  $("duelVisible").addEventListener("change", async e => {
    try { await serveur.changerVisibilite(uid, e.target.checked); dire(e.target.checked ? "Tu apparais dans la recherche." : "Tu n'apparais plus dans la recherche."); }
    catch (err) { e.target.checked = !e.target.checked; dire(err.message, true); }
  });

  surSession(ctx.compte.session());
  return { rafraichir, defier, uid: () => uid, dejaDefie: id => defiesA.has(id) };
}
