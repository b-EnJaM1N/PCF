// Tournois en ligne (menu Jouer › Tournois, ou page d'un cercle) : liste, création, inscriptions,
// tableau à élimination directe, et « Jouer mon match ».
import * as social from "./social-serveur.js";
import { avatarSVG } from "./avatar.js";
import { blasonSVG } from "./social-logique.js";
import { texteFormat, POINTS_PAR_SET } from "./regles.js";
import { formatCourt } from "./duel-logique.js";
import { nomTour, monTour, DUREES, texteDuree, texteReste, texteFin, monMatch, tableau, resume, lienTournoi, codeTournoiDepuisAdresse } from "./tournoi-logique.js";
import { lire, ecrire } from "./stockage.js";

const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const nomComplet = p => `${esc(p.pseudo)}<small>#${p.numero}</small>`;

// ctx : { uid(), montrer(vue), retour(), lancerDuel(duel, profilAdversaire), profils(ids), apresChangement() }
export function installerTournois(ctx) {
  let ouvert = null, detail = null, decalage = 0, minuterie = 0, cercleForm = null;
  const dire = (t, erreur = false, id = "tMsg") => {
    $(id).textContent = t; $(id).classList.toggle("erreur", erreur);
    if (t) $(id).scrollIntoView({ block: "nearest", behavior: "smooth" });
  };
  const base = () => location.origin + location.pathname;

  // ------------------------------------------------ une liste de tournois (mes tournois, tournois d'un cercle)
  function liste(el, tournois) {
    el.innerHTML = tournois.map(t => `<div class="joueur cliquable${t.a_jouer ? " a-jouer" : ""}" data-tournoi="${t.id}" role="button" tabindex="0">
      <span class="mini">${t.cercle ? blasonSVG(t.cercle.blason) : '<span class="trophee">🏆</span>'}</span>
      <div style="min-width:0"><div class="jn">${esc(t.nom)}</div><div class="jd">${esc(resume(t))}${t.cercle ? ` · ${esc(t.cercle.nom)}` : ""}</div></div>
      <div class="actions"><button class="petit ${t.a_jouer ? "" : "alt"}" data-a="voir">${t.a_jouer ? "Jouer" : "Voir"}</button></div></div>`).join("");
  }
  const ouvrirDepuisListe = e => { const l = e.target.closest("[data-tournoi]"); if (l && (e.type === "click" || e.key === "Enter")) ouvrir(l.dataset.tournoi); };
  ["socTournois", "cTournois"].forEach(z => { $(z).addEventListener("click", ouvrirDepuisListe); $(z).addEventListener("keydown", ouvrirDepuisListe); });

  // ------------------------------------------------ créer un tournoi
  const form = { len: 11, win: 2, duree: 60 };
  function renderForm() {
    $("tnLen").innerHTML = POINTS_PAR_SET.map(v => `<button data-v="${v}" aria-pressed="${v === form.len}">${v}</button>`).join("");
    $("tnWin").innerHTML = [[1, "1 set"], [2, "2 sets gagnants"], [3, "3 sets gagnants"]].map(([v, l]) => `<button data-v="${v}" aria-pressed="${v === form.win}">${l}</button>`).join("");
    $("tnDuree").innerHTML = DUREES.map(([v, l]) => `<button data-v="${v}" aria-pressed="${v === form.duree}">${l}</button>`).join("");
    $("tnHint").textContent = `${texteFormat({ pointsParSet: form.len, setsGagnants: form.win })}. `
      + (formatCourt(form.len, form.win) ? "Format court : les matchs seront amicaux (sans effet sur le niveau officiel). " : "Les matchs compteront pour le niveau officiel. ")
      + `Chaque tour dure ${texteDuree(form.duree)} : les deux joueurs jouent leur match quand ils veulent pendant ce temps.`
      + (form.duree <= 15 ? " Idéal quand tout le monde est là." : "");
  }
  [["tnLen", "len"], ["tnWin", "win"], ["tnDuree", "duree"]].forEach(([id, cle]) => $(id).addEventListener("click", e => {
    const b = e.target.closest("button"); if (b) { form[cle] = +b.dataset.v; renderForm(); }
  }));
  function nouveau(cercle = null) {
    cercleForm = cercle;
    $("tnTitre").textContent = cercle ? `Tournoi du cercle « ${cercle.nom} »` : "Tournoi privé (par lien)";
    $("tnPrecision").textContent = cercle ? "Seuls les membres du cercle pourront s'inscrire." : "Tu inviteras les joueurs en leur envoyant le lien du tournoi.";
    $("inTNom").value = ""; dire("", false, "tnMsg"); renderForm();
    ctx.montrer("socTournoiNouveau");
  }
  $("tnRetour").addEventListener("click", () => ctx.retour());
  $("tnCreer").addEventListener("click", async () => {
    const nom = $("inTNom").value.trim();
    if (nom.length < 2) return dire("Donne un nom au tournoi (au moins 2 caractères).", true, "tnMsg");
    $("tnCreer").disabled = true;
    try {
      const t = await social.creerTournoi(nom, cercleForm?.id ?? null, form.len, form.win, form.duree);
      ctx.apresChangement();
      await ouvrir(t.id, cercleForm ? "Tournoi créé ! Les membres du cercle peuvent maintenant s'inscrire." : "Tournoi créé ! Envoie le lien aux joueurs pour qu'ils s'inscrivent.");
    } catch (e) { dire(e.message, true, "tnMsg"); }
    $("tnCreer").disabled = false;
  });

  // ------------------------------------------------ la page d'un tournoi
  async function ouvrir(id, message = "") {
    ouvert = id; detail = null;
    $("tNom").textContent = "…"; $("tInfo").textContent = ""; $("tEtat").textContent = "";
    ["tMonMatch", "tInscriptions", "tTableauCarte"].forEach(x => { $(x).hidden = true; });
    dire(message);
    ctx.montrer("socTournoi"); window.scrollTo(0, 0);
    clearInterval(minuterie);
    await charger();
    // Sit & Go en direct : mise à jour plus fréquente.
    if (ouvert === id) { clearInterval(minuterie); minuterie = setInterval(() => { if (!$("socTournoi").hidden && !document.hidden) charger(); }, detail?.mode === "direct" ? 4000 : 10000); }
  }
  function fermer() { ouvert = null; detail = null; clearInterval(minuterie); }
  $("tRetour").addEventListener("click", () => { fermer(); ctx.retour(); });

  async function charger() {
    const id = ouvert; if (!id) return;
    let t;
    try { t = await social.voirTournoi(id); } catch (e) { if (ouvert === id) dire(e.message, true); return; }
    if (ouvert !== id) return;
    decalage = Date.parse(t.maintenant) - Date.now();
    detail = t;
    render();
  }

  function render() {
    const t = detail, uid = ctx.uid(), maintenant = Date.now() + decalage;
    $("tIcone").innerHTML = t.cercle ? blasonSVG(t.cercle.blason) : '<span class="trophee grand">🏆</span>';
    $("tNom").textContent = t.nom;
    const direct = t.mode === "direct";   // Sit & Go : matchs lancés automatiquement, sans date limite
    $("tInfo").textContent = `${t.programme ? "Tournoi programmé · " : t.freeroll ? "Freeroll · " : direct ? "Sit & Go public · " : t.cercle ? `Cercle « ${t.cercle.nom} » · ` : "Tournoi privé · "}${texteFormat({ pointsParSet: t.points_par_set, setsGagnants: t.sets_gagnants })}`
      + `${formatCourt(t.points_par_set, t.sets_gagnants) ? " · amical" : " · officiel"}${direct ? "" : ` · tours de ${texteDuree(t.duree_minutes)}`}${t.finale_sets ? ` · finale en ${t.finale_sets} sets gagnants` : ""}`;
    const reste = texteReste(t.echeance, maintenant);
    $("tEtat").textContent = t.phase === "inscriptions" ? `Inscriptions ouvertes · ${t.joueurs.length} joueur${t.joueurs.length > 1 ? "s" : ""} (de 3 à 32)`
      : t.phase === "en_cours" ? (direct ? `${nomTour(t.tour, t.nb_tours)} · en direct` : `${nomTour(t.tour, t.nb_tours)} · ${reste ? `date limite dans ${reste}` : "date limite passée, résultats en cours"}`)
      : t.phase === "termine" ? (t.vainqueur ? `🏆 Vainqueur : ${t.vainqueur.pseudo}#${t.vainqueur.numero}` : "Tournoi terminé") : "Tournoi annulé";

    // Mon match à jouer
    const mm = monMatch(t, uid);
    $("tMonMatch").hidden = !mm;
    if (mm) {
      const adv = mm.adversaire, duel = mm.match.duel;
      const enCours = duel && ["presentation", "jeu", "entre_sets"].includes(duel.phase);
      const attendMoi = duel && duel.phase === "attente" && duel.j0 !== uid;
      const jattends = duel && duel.phase === "attente" && duel.j0 === uid;
      $("tMonMatchTitre").textContent = `À toi de jouer : ${monTour(t.tour, t.nb_tours)}`;
      if (direct) {
        // Sit & Go : le serveur lance le match ; on le rejoint (60 secondes pour arriver).
        $("tMonMatchCorps").innerHTML = `<div class="joueur"><span class="mini">${avatarSVG(adv.avatar || {})}</span>
          <div style="min-width:0"><div class="jn">${esc(adv.drapeau || "")} ${nomComplet(adv)}</div><div class="jd">Niveau ${adv.classement} · tête de série n° ${adv.tete}</div></div><span></span></div>
          <p class="hint">${duel ? "Ton match est lancé : tu as 60 secondes pour le rejoindre, sinon c'est perdu par forfait." : "Ton match va se lancer tout seul. Reste dans l'appli."}</p>
          ${duel ? `<button class="btn" id="tJouer">Rejoindre le match</button>` : ""}`;
        $("tJouer")?.addEventListener("click", () => jouerMonMatch(mm));
      } else {
      $("tMonMatchCorps").innerHTML = `<div class="joueur"><span class="mini">${avatarSVG(adv.avatar || {})}</span>
        <div style="min-width:0"><div class="jn">${esc(adv.drapeau || "")} ${nomComplet(adv)}</div><div class="jd">Niveau ${adv.classement} · tête de série n° ${adv.tete}</div></div><span></span></div>
        <p class="hint">${enCours ? "Votre match est en cours." : attendMoi ? `${esc(adv.pseudo)} t'attend pour jouer !`
          : jattends ? `Invitation envoyée : le match démarre dès que ${esc(adv.pseudo)} touche « Jouer mon match ». Garde l'appli ouverte.`
          : `Retrouvez-vous pour jouer avant la date limite${reste ? ` (dans ${reste})` : ""}. Si un seul de vous deux essaie de jouer, la victoire lui revient par forfait.`}</p>
        <button class="btn" id="tJouer" ${jattends ? "disabled" : ""}>${enCours ? "Reprendre le match" : attendMoi ? "Jouer maintenant" : jattends ? `En attente de ${esc(adv.pseudo)}…` : "Jouer mon match"}</button>`;
      $("tJouer").addEventListener("click", () => jouerMonMatch(mm));
      }
    }
    $("tRegleAbsence").textContent = direct
      ? "Chaque match se lance dès que les deux joueurs sont libres. Un joueur absent au bout de 60 secondes perd par forfait ; si aucun des deux ne vient, la meilleure tête de série passe."
      : "Un match non joué à la date limite revient à la personne qui a essayé de le jouer ; si personne ne s'est manifesté, à la meilleure tête de série.";

    // Inscriptions
    const insc = t.phase === "inscriptions";
    $("tInscriptions").hidden = !insc;
    if (insc) {
      $("tInscrits").innerHTML = t.joueurs.map(j => `<div class="joueur"><span class="mini">${avatarSVG(j.avatar || {})}</span>
        <div style="min-width:0"><div class="jn">${esc(j.drapeau || "")} ${nomComplet(j)}${j.id === uid ? " <small>(toi)</small>" : ""}</div><div class="jd">Niveau ${j.classement}</div></div><span></span></div>`).join("");
      $("tActions").innerHTML = [
        !t.inscrit ? `<button class="btn" data-a="inscrire">M'inscrire</button>` : "",
        `<button class="btn alt" data-a="partager">Inviter avec le lien (WhatsApp, SMS…)</button>`,
        t.organise ? `<button class="btn" data-a="lancer" ${t.joueurs.length < 3 ? "disabled" : ""}>Lancer le tournoi (${t.joueurs.length} joueurs)</button>` : "",
        t.organise && t.joueurs.length < 3 ? `<p class="hint">Il faut au moins 3 joueurs pour lancer le tournoi.</p>` : "",
        t.inscrit && !t.createur ? `<button class="linkbtn" data-a="desinscrire">Me désinscrire</button>` : "",
        t.organise ? `<button class="linkbtn" data-a="annuler">Annuler le tournoi</button>` : "",
      ].filter(Boolean).join("");
    }

    // Tableau
    const tours = tableau(t);
    $("tTableauCarte").hidden = !tours.length;
    $("tTableau").innerHTML = tours.map((ms, i) => `<div class="rnd">${nomTour(i + 1, t.nb_tours)}</div>` + ms.map(m => ligneMatch(m, uid)).join("")).join("")
      + (t.phase === "en_cours" ? tours.length < t.nb_tours ? `<p class="hint">La suite du tableau apparaît à la fin de chaque tour.</p>` : "" : "");
  }

  function ligneMatch(m, uid) {
    const cote = (j, gagne) => j
      ? `<div class="bp ${m.fin ? (gagne ? "win" : "lose") : ""}"><span class="mini">${avatarSVG(j.avatar || {})}</span><span class="bn">${esc(j.pseudo)}${j.id === uid ? " (toi)" : ""}</span></div>`
      : `<div class="bp lose"><span class="bn">${m.fin === "exempt" ? "—" : "?"}</span></div>`;
    let score = "vs";
    if (m.fin === "score" && m.duel) {
      const s = m.duel.sets, dans = m.duel.j0 === m.j0?.id ? s : [s[1], s[0]];
      score = `${dans[0]}–${dans[1]}`;
    } else if (m.fin) score = texteFin(m.fin);
    else if (m.duel && ["presentation", "jeu", "entre_sets"].includes(m.duel.phase)) score = "en cours";
    const g0 = m.vainqueur && m.vainqueur === m.j0?.id, g1 = m.vainqueur && m.vainqueur === m.j1?.id;
    const mien = [m.j0?.id, m.j1?.id].includes(uid) ? " mine" : "";
    return `<div class="bm${mien}">${cote(m.j0, g0)}<div class="bs">${esc(score)}</div>${cote(m.j1, g1).replace('class="bp', 'class="bp r')}</div>`;
  }

  $("tActions").addEventListener("click", async e => {
    const b = e.target.closest("button"); if (!b || !detail) return;
    const a = b.dataset.a, id = detail.id;
    if (a === "partager") return partager();
    if (a === "annuler" && !confirm(`Annuler le tournoi « ${detail.nom} » ?`)) return;
    if (a === "lancer" && !confirm(`Lancer le tournoi avec ${detail.joueurs.length} joueurs ? Les inscriptions seront closes.`)) return;
    b.disabled = true;
    try {
      if (a === "inscrire") { await social.inscrireTournoi(id); dire("Inscription enregistrée !"); }
      if (a === "desinscrire") { await social.desinscrireTournoi(id); dire("Inscription annulée."); }
      if (a === "lancer") { await social.lancerTournoi(id); dire("C'est parti ! Le premier tour commence."); }
      if (a === "annuler") { await social.annulerTournoi(id); dire("Tournoi annulé."); }
      ctx.apresChangement();
    } catch (err) { dire(err.message, true); }
    charger();
  });

  async function partager() {
    const url = lienTournoi(base(), detail.code);
    const texte = `Inscris-toi au tournoi « ${detail.nom} » sur HandSlam, le Pierre-Feuille-Ciseaux en sets de 11 :`;
    try { if (navigator.share) { await navigator.share({ title: `Tournoi ${detail.nom}`, text: texte, url }); return; } }
    catch (e) { if (e && e.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(url); dire("Lien copié ! Colle-le dans WhatsApp ou un SMS."); } catch { dire(""); }
    $("tMsg").insertAdjacentHTML("beforeend", `<span class="lien-partage">${esc(url)}</span>`);
  }

  async function jouerMonMatch(mm) {
    $("tJouer").disabled = true;
    try {
      const duel = await social.jouerMatchTournoi(mm.match.id);
      if (duel.phase === "attente") { dire(`Invitation envoyée à ${mm.adversaire.pseudo} : le match démarre dès son arrivée.`); return charger(); }
      const [p] = await ctx.profils([mm.adversaire.id]);
      ctx.lancerDuel(duel, p);
    } catch (err) { dire(err.message, true); charger(); }
  }

  // ------------------------------------------------ arrivée par un lien « ?tournoi=CODE »
  const codeLien = codeTournoiDepuisAdresse(location.search);
  if (codeLien) ecrire("tournoiLien", codeLien);
  async function rejoindreLienEnAttente() {
    const code = lire("tournoiLien", null);
    if (!code || !ctx.uid()) return;
    ecrire("tournoiLien", null);
    if (codeTournoiDepuisAdresse(location.search)) history.replaceState(null, "", location.pathname + location.hash);
    try {
      const t = await social.rejoindreTournoi(code);
      ctx.apresChangement();
      await ouvrir(t.id, `Inscription au tournoi « ${t.nom} » enregistrée !`);
    } catch (err) { dire(err.message, true, "socMsg"); }
  }

  return { liste, nouveau, ouvrir, fermer, rafraichir: () => { if (ouvert) charger(); }, rejoindreLienEnAttente, lienEnAttente: () => !!codeLien };
}
