// Onglet « Duel » : chercher un joueur, le défier, inviter par lien,
// voir les défis reçus et envoyés, reprendre un duel en cours.
import * as serveur from "./duel-serveur.js";
import { lienDefi, codeDepuisAdresse, adversaireDe, FORMAT, formatCourt, enRendezVous, texteRdvRestant } from "./duel-logique.js";
import { avatarSVG } from "./avatar.js";
import { lire, ecrire } from "./stockage.js";
import { demanderAmi, mesAmis } from "./social-serveur.js";
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
    // Mon défi vient d'être accepté et l'appli est ouverte : j'entre dans la salle d'attente (le match démarre si l'autre y est).
    const pourMoi = rdvs.find(d => d.j0 === uid && !quittes.has(d.id));
    if (!actif && !salle && pourMoi && !document.hidden && !ctx.duelEnCours() && joueurs.get(pourMoi.j1)) entrerSalle(pourMoi, joueurs.get(pourMoi.j1));

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
  }
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
      try { amis = (await mesAmis()).filter(a => a.statut === "amis"); amisLus = Date.now(); } catch { /* on garde l'ancienne liste */ }
    }
    renderAmis();
  }
  function renderAmis() {
    const cherche = $("inRecherche").value.trim().length > 0;
    $("duelAmisZone").hidden = !uid || !amis.length || cherche;
    $("duelAmis").innerHTML = amis.map(a => `<div class="joueur" data-id="${a.id}">
      <span class="mini">${avatarSVG(a.avatar || {})}</span>
      <div style="min-width:0"><div class="jn">${esc(a.drapeau || "")} ${nomComplet(a)}</div><div class="jd">Niveau ${a.classement}</div></div>
      <div class="actions">${defiesA.has(a.id) ? `<button class="petit alt" disabled>Défié ✓</button>` : `<button class="petit" data-a="defier">Défier</button>`}</div></div>`).join("");
  }
  $("duelAmis").addEventListener("click", async e => {
    const b = e.target.closest("button[data-a=defier]"); if (!b) return;
    const a = amis.find(x => x.id === b.closest(".joueur").dataset.id); if (!a) return;
    b.disabled = true;
    try { await defier(a); renderAmis(); } catch (err) { dire(err.message, true); b.disabled = false; }
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
          try {
            await defier(p);
            $("inRecherche").value = ""; $("duelResultats").innerHTML = ""; renderAmis();
          } catch (e) { dire(e.message, true); b.disabled = false; }
        }));
      } catch (e) { dire(e.message, true); }
    }, 350);
  });

  // Défier un joueur (depuis la recherche, la liste d'amis ou un cercle), au format choisi dans « Défier un ami ».
  async function defier(p) {
    const enjeu = enjeuChoisi();
    await serveur.creer(p.id, format.len, format.win, format.classe, format.mise, enjeu);
    defiesA.add(p.id);
    if (enjeu) { $("duelEnjeuOn").checked = false; $("duelEnjeuBox").hidden = true; $("duelEnjeu").value = ""; }
    const texte = `Défi ${format.classe && !formatCourt(format.len, format.win) ? "officiel" : "amical"}${format.mise ? ` avec une mise de ${format.mise} jetons` : ""}${enjeu ? ` et l'enjeu « ${enjeu} »` : ""} envoyé à ${p.pseudo}#${p.numero} ! Il apparaîtra en haut de son menu « Jouer ». Quand il l'acceptera, tu seras prévenu : le match démarrera dès que vous serez là tous les deux.`;
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
  $("duelLien").addEventListener("click", async () => {
    $("duelLien").disabled = true;
    try { const d = await serveur.creer(null, format.len, format.win, format.classe, format.mise); await partager(d.code); rafraichir(); }
    catch (e) { dire(e.message, true); }
    $("duelLien").disabled = false;
  });

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
