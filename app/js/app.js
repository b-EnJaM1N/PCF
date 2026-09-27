// Écran principal : relie les règles, les bots, les annonces, le son et la fiche joueur.
import { EMOJI, NOM, DUREE_COUP_MS, nouveauMatch, jouerCoup, balle, egaliteFinDeSet, setDecisif, signeAuHasard } from "./regles.js";
import { BOTS, botParId, choisirCoup } from "./bots.js";
import { Suivi, indiceImprevisibilite } from "./analyse.js";
import { nouvelEtatAnnonces, annoncerCoup, annonceDebutSet } from "./annonces.js";
import { nouvellesStats, suivreCoup } from "./stats-match.js";
import { TITRES, normaliserProfil, enregistrerMatch, remettreAZero, verrouDe, estVerrouille, nomAffiche, titresObtenus, dernierTitre, signeFavori } from "./profil.js";
import { TOURS, TOUR_SINGULIER, SETS_PAR_TOUR, nouveauTournoi, monMatch, enregistrerMonMatch, terminerTour } from "./tournoi.js";
import { presentation } from "./presentation.js";
import { avatarSVG, SYMBOLES, FONDS, GANTS, POIGNETS, MOTIFS, PAYS } from "./avatar.js";
import { LecteurVoix } from "./voix/lecteur.js";
import { CATALOGUE } from "./voix/script.js";
import { Ambiance } from "./ambiance.js";
import { lire, ecrire } from "./stockage.js";
import { VERSION } from "./version.js";
import { installerCompte } from "./ecran-compte.js";
import { installerDuels } from "./ecran-duel.js";
import { installerCercles } from "./ecran-cercles.js";
import { texteClassementFin } from "./social-logique.js";
import * as serveur from "./duel-serveur.js";
import { maPlace, coupVuDe, rejouer, coherent, adversaireHumain, tempsRestant } from "./duel-logique.js";

const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ORD = ["Premier", "Deuxième", "Troisième", "Quatrième", "Cinquième"];
const reduitMouvement = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------------- état
const fmt = { len: 11, win: 2, ...(lire("format") || {}) };
if (![7, 11].includes(fmt.len)) fmt.len = 11;
if (![2, 3].includes(fmt.win)) fmt.win = 2;
let WIN = fmt.win;                               // sets gagnants du match en cours (le tournoi l'impose)
let amicalId = botParId(lire("adversaire")) ? lire("adversaire") : "stratege";
let OPP = botParId(amicalId);
let P = normaliserProfil(lire("profil"));
let T = lire("tournoi");
const sauverLocal = () => ecrire("profil", P);
let compteUI = null;
// Chaque changement de la fiche est gardé sur le téléphone, puis envoyé en ligne si on est connecté.
const sauverP = () => { P.majLe = Date.now(); sauverLocal(); compteUI?.planifier(); };
const sauverT = () => ecrire("tournoi", T);
let S;              // la séance de match en cours
let D = null;       // le duel en ligne en cours (null en solo)
let duelsUI = null, cerclesUI = null;
let monClassement = null;   // Classement PCF (duels entre humains), connu une fois connecté
let panneauOuvert = null, faceAFaceOuvert = false;

// ---------------------------------------------------------------- son
const voix = new LecteurVoix();
const ambiance = new Ambiance();
let sonActif = lire("son", true) !== false;
voix.actif = ambiance.actif = sonActif;
// La voix de synthèse sonne robotique : elle reste coupée tant qu'on ne l'active pas dans les Options.
voix.synthese = lire("voixSynthese", false) === true;
$("synthese").checked = voix.synthese;
$("synthese").addEventListener("change", e => { voix.synthese = e.target.checked; ecrire("voixSynthese", voix.synthese); if (!voix.synthese) voix.arreter(); renderVoixInfo(); });
$("snd").checked = sonActif;
voix.charger().then(() => { ambiance.utiliserFichiers([...voix.fichiers.keys()]); renderVoixInfo(); });

$("snd").addEventListener("change", e => {
  sonActif = e.target.checked; ecrire("son", sonActif);
  voix.actif = sonActif; if (!sonActif) voix.arreter();
  ambiance.activer(sonActif);
});
const note = t => { $("sndNote").textContent = t; $("sndNote").hidden = !t; };
$("testSnd").addEventListener("click", () => {
  if (!sonActif) { sonActif = true; $("snd").checked = true; ecrire("son", true); voix.actif = true; }
  ambiance.activer(true); ambiance.raquette(); setTimeout(() => ambiance.public("point", 0.5), 400);
  const test = CATALOGUE.get("arbitre_balle_de_match_jaune_01");
  if (!voix.peutDire(test)) {
    note("Tu dois entendre un coup de raquette puis des applaudissements. Si ce n'est pas le cas, vérifie le volume et le mode silencieux. Les voix de l'arbitre et du commentateur sont coupées en attendant les vrais enregistrements : leurs annonces s'affichent par écrit.");
    setTimeout(() => note(""), 8000); return;
  }
  let demarre = false;
  note("Test en cours…");
  voix.dire([test], () => {
    demarre = true; note("Le son fonctionne. Si tu n'entends rien, vérifie le volume, le mode silencieux et tes écouteurs Bluetooth.");
    setTimeout(() => note(""), 6000);
  });
  setTimeout(() => { if (!demarre) note(`Aucune voix n'a démarré (${voix.nbVoix} voix trouvées sur l'appareil). Vérifie que le mode silencieux est désactivé, puis réessaie. Si tu as ouvert le lien depuis une autre application, ouvre-le dans Safari ou Chrome.`); }, 2500);
});

function renderVoixInfo() {
  const total = CATALOGUE.size, faits = [...voix.fichiers.keys()].filter(id => CATALOGUE.has(id)).length;
  $("voixInfo").innerHTML = `<b>${faits} réplique${faits > 1 ? "s" : ""} enregistrée${faits > 1 ? "s" : ""} sur ${total}.</b> ${voix.synthese ? "Les autres sont lues par la voix de synthèse du téléphone." : "Les autres ne sont pas lues à voix haute, en attendant les vrais enregistrements."} Tout ce qui est dit s'affiche aussi par écrit, et la case « Son » coupe tout.`;
}

// ---------------------------------------------------------------- annonces
let fanerT = 0;
function annoncer(lignes, silencieux = false) {
  if (!lignes.length) return;
  const band = $("band"); band.textContent = ""; band.classList.remove("stale");
  lignes.forEach(l => { const d = document.createElement("div"); d.className = l.role; d.textContent = l.texte; band.append(d); });
  clearTimeout(fanerT); fanerT = setTimeout(() => band.classList.add("stale"), 4000);
  if (!silencieux) voix.dire(lignes);
}

// ---------------------------------------------------------------- panneaux
let panneauGo = null;
function ouvrirPanneau({ kick = "", big = "", bigCls = "", sc = "", tally = "", com = "", next = "", go, onGo, resteOuvert = false }) {
  $("iKick").textContent = kick; $("iBig").textContent = big; $("iBig").className = "big " + bigCls;
  $("iSc").textContent = sc; $("iTally").textContent = tally; $("iCom").textContent = com; $("iNext").textContent = next;
  $("iGo").textContent = go;
  $("iGo").disabled = false;
  panneauGo = () => { if (!resteOuvert) fermerPanneau(); onGo && onGo(); };
  panneauOuvert = true; $("inter").classList.add("show"); $("iGo").focus();
}
$("iGo").addEventListener("click", () => panneauGo && panneauGo());
function fermerPanneau() { $("inter").classList.remove("show"); panneauOuvert = null; panneauGo = null; }

// ---------------------------------------------------------------- minuteur (5 s par coup)
let raf = 0, tDebut = 0;
function lancerMinuteur() {
  cancelAnimationFrame(raf); tDebut = performance.now(); $("timer").classList.remove("urgent");
  const tick = t => {
    const reste = Math.max(0, 1 - (t - tDebut) / DUREE_COUP_MS);
    $("bar").style.transform = `scaleX(${reste})`;
    if (reste < 0.3) $("timer").classList.add("urgent");
    if (reste <= 0) { if (!S.occupe && !S.match.termine) jouer(signeAuHasard(), true); return; }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}
function arreterMinuteur() { cancelAnimationFrame(raf); }
// En solo, si on quitte l'application en plein match, le minuteur repart de zéro au retour.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  if (D) { battement(); return; }   // duel : le serveur fait foi, on se resynchronise
  if (S && S.enJeu && !S.occupe && !S.match.termine && !panneauOuvert) lancerMinuteur();
});

// ---------------------------------------------------------------- un coup
const boutons = on => document.querySelectorAll("#moves button").forEach(b => { b.disabled = !on; });

function jouer(signe, auto = false) {
  if (S && S.duel) return jouerDuel(signe);
  if (!S || !S.enJeu || S.occupe || S.match.termine || panneauOuvert || faceAFaceOuvert) return;
  S.occupe = true; arreterMinuteur(); boutons(false);
  const m = S.match;
  // Le bot choisit sans connaître le coup du joueur.
  const histBot = m.coups.map(c => ({ moi: c.b, adv: c.a, res: c.gagnant === null ? "e" : c.gagnant === 1 ? "g" : "p" }));
  const signeBot = choisirCoup(OPP, histBot);
  ambiance.raquette(signe);
  afficherCoup(signe, signeBot, [auto, false]);
}

// Révèle un coup (solo ou duel) et enchaîne : annonces, score, fin de set ou de match.
// silencieux : on met seulement l'état à jour (rattrapage de plusieurs coups en duel).
function afficherCoup(signe, signeAdv, auto, { silencieux = false } = {}) {
  const m = S.match;
  S.suivi.figer();
  const evt = jouerCoup(m, signe, signeAdv, auto);
  S.suivi.enregistrer(signe, evt.gagnant === null ? "e" : evt.gagnant === 0 ? "g" : "p");
  suivreCoup(S.stats, m, evt);
  const a = annoncerCoup(m, evt, S.annonces, { recents: S.suivi.recents });
  if (silencieux) return evt;

  // Révélation immédiate des deux signes : aucun effet pendant l'échange.
  const hMe = $("hMe"), hBot = $("hBot");
  hMe.textContent = EMOJI[signe]; hBot.textContent = EMOJI[signeAdv];
  hMe.className = "hand" + (evt.gagnant === 0 ? " win" : evt.gagnant === 1 ? " lose" : "");
  hBot.className = "hand" + (evt.gagnant === 1 ? " win" : evt.gagnant === 0 ? " lose" : "");
  $("verdict").textContent = (auto[0] ? "Temps écoulé, coup joué au hasard. " : "") + (auto[1] ? `${OPP.nom} n'a pas joué à temps : coup au hasard. ` : "") +
    (evt.egalite ? "Égalité, on rejoue" : evt.gagnant === 0 ? `${NOM[signe]} bat ${NOM[signeAdv]}` : `${NOM[signeAdv]} bat ${NOM[signe]}`);

  // Applaudissements : série de 4 points, fin de set, fin de match. Jamais pendant l'échange.
  if (a.public) setTimeout(() => ambiance.public(a.public === "serie" ? "clameur" : a.public, { serie: 0.45, set: 0.55, ovation: 0.6 }[a.public]), 250);
  annoncer(a.lignes);
  render(); renderHistorique(); renderLecture();

  if (m.termine) { setTimeout(finir, 1100); return evt; }
  if (evt.finSet) {
    const [pa, pb] = evt.scoreSet, g = evt.gagnant, n = m.scoresSets.length;
    const suivant = annonceDebutSet(m), decisif = setDecisif(m);
    const nouveauSet = () => {
      $("hMe").textContent = "❔"; $("hBot").textContent = "❔"; $("hMe").className = "hand"; $("hBot").className = "hand"; $("verdict").textContent = "";
      annoncer([suivant]);
    };
    // En duel, le set suivant démarre quand les deux joueurs sont prêts (le serveur décide).
    if (S.duel) D.apresPanneau = nouveauSet;
    setTimeout(() => {
      if (S.duel && (!D || D.duel.phase !== "entre_sets")) { if (D) { D.apresPanneau = null; nouveauSet(); duelReprendre(); } return; }
      ouvrirPanneau({
      kick: `Fin du ${ORD[n - 1].toLowerCase()} set`,
      big: g === 0 ? "Set pour toi" : `Set pour ${OPP.nom}`, bigCls: g === 0 ? "me" : "bot",
      sc: `${pa}–${pb}`,
      tally: `Sets : toi ${m.sets[0]}, ${OPP.nom} ${m.sets[1]}`,
      com: a.commentaire ? a.commentaire.texte : "",
      next: suivant.texte.replace(/\.$/, ""),
      go: `Lancer le ${decisif ? "set décisif" : ORD[n].toLowerCase() + " set"}`,
      resteOuvert: !!S.duel,
      onGo: S.duel ? duelPret : () => { nouveauSet(); S.occupe = false; boutons(true); lancerMinuteur(); },
    });
      if (S.duel) majBoutonsPret();
    }, 1200);
    return evt;
  }
  setTimeout(() => {
    if (S.duel) { duelReprendre(); return; }
    S.occupe = false; boutons(true); lancerMinuteur();
  }, 900);
  return evt;
}

// ---------------------------------------------------------------- affichage du match
function render() {
  const m = S.match;
  $("sMe").textContent = m.termine ? m.sets[0] : m.points[0];
  $("sBot").textContent = m.termine ? m.sets[1] : m.points[1];
  const points = k => Array.from({ length: WIN }, (_, i) => `<i class="${m.sets[k] > i ? "on" : ""}"></i>`).join("");
  $("setsMe").innerHTML = points(0); $("setsBot").innerHTML = points(1);
  $("doneSets").textContent = m.scoresSets.length ? "Sets : " + m.scoresSets.map(([a, b]) => `${a}–${b}`).join("  ") : "";
  const st = $("status"); st.classList.remove("hot");
  const h = balle(m);
  if (m.termine) st.textContent = m.vainqueur === 0 ? "Match gagné" : "Match perdu";
  else if (h) { st.textContent = `Balle de ${h.type} pour ${h.joueur === 0 ? "toi" : OPP.nom}`; st.classList.add("hot"); }
  else if (egaliteFinDeSet(m)) st.textContent = "Égalité, il faut 2 points d'écart";
  else st.textContent = `Set ${m.scoresSets.length + 1}, coup ${m.coups.length + 1}`;
}

function renderHistorique() {
  const c = S.match.coups, debuts = new Set(S.match.debutsSet);
  const ligne = (cle, label) => `<tr><th>${esc(label)}</th>` + c.map((x, i) => {
    const cls = [x.gagnant === 0 ? "w-me" : x.gagnant === 1 ? "w-bot" : "", i > 0 && debuts.has(i) ? "newset" : "", cle === "a" && x.auto[0] ? "auto" : ""].join(" ").trim();
    return `<td class="${cls}">${EMOJI[x[cle]]}</td>`;
  }).join("") + "</tr>";
  $("tape").innerHTML = `<table>${ligne("a", "Toi")}${ligne("b", OPP.nom)}</table>`;
  const t = $("tape"); t.scrollLeft = t.scrollWidth;
}

function renderLecture() {
  const s = S.suivi;
  if (s.lisibles < 3) { $("read").textContent = "L'analyse observe tes premiers coups."; return; }
  const pct = Math.round(100 * s.taux);
  const ton = pct >= 45 ? "Tu es lisible en ce moment." : pct <= 28 ? "Il ne te cerne pas : tu es imprévisible." : "Il te lit un peu mieux que le hasard.";
  $("read").innerHTML = `Ton coup était prévisible <b>${s.devines} fois sur ${s.lisibles}</b> (${pct} %, le hasard donnerait 33 %). ${ton}`;
}

function finir() {
  const m = S.match, gagne = m.vainqueur === 0, c = m.coups, n = c.length;
  const special = S.duel && D ? D.finSpeciale : null;   // duel gagné ou perdu par forfait ou abandon
  $("endTitle").textContent = special === "forfait" ? (gagne ? `Victoire par forfait : ${OPP.nom} a quitté le duel` : "Défaite par forfait")
    : special === "abandon" ? (gagne ? `Victoire : ${OPP.nom} a abandonné` : "Tu as abandonné")
    : `${gagne ? "Victoire" : "Défaite"} ${m.sets[0]} sets à ${m.sets[1]}`;
  const egalites = c.filter(x => x.gagnant === null).length;
  $("endLine").textContent = n ? `Sets : ${m.scoresSets.map(([a, b]) => `${a}–${b}`).join(", ") || "aucun terminé"}. ${n} coups joués, dont ${egalites} égalités. Ta répartition :` : "Aucun coup joué.";
  const cpt = [0, 0, 0]; c.forEach(x => cpt[x.a]++);
  $("bars").innerHTML = barres(cpt, n);
  let meme = 0, apresV = 0;
  for (let i = 1; i < n; i++) if (c[i - 1].gagnant === 0) { apresV++; if (c[i].a === c[i - 1].a) meme++; }
  let habitude = "";
  if (apresV >= 3) {
    const p = Math.round(100 * meme / apresV);
    habitude = p >= 50 ? ` Après une victoire, tu rejoues le même signe ${p} % du temps : c'est exploitable.`
      : p <= 15 ? ` Après une victoire, tu changes presque toujours de signe (${100 - p} %) : c'est aussi un schéma.` : "";
  }
  $("endRead").textContent = `Ton coup était prévisible ${Math.round(100 * (S.suivi.taux || 0))} % du temps.${habitude}`;
  $("end").hidden = false;
  $("bar").style.transform = "scaleX(0)";

  const enTournoi = !!(S.tour !== null && T && !S.duel);
  if (enTournoi) { enregistrerMonMatch(T, gagne, m.sets); sauverT(); }
  // Un duel compte dans la fiche (statistiques, historique, titres) mais pas dans le niveau.
  const nouveaux = n ? enregistrerMatch(P, {
    match: m, stats: S.stats, devines: S.suivi.devines, lisibles: S.suivi.lisibles,
    adversaire: { id: OPP.id, elo: OPP.elo, nom: S.duel ? `${OPP.nom}#${OPP.numero}` : OPP.nom },
    finaleTournoi: enTournoi && S.tour === 2, compteNiveau: !S.duel,
  }) : [];
  sauverP(); rafraichirAvatars(); afficherBilan();
  $("again").hidden = enTournoi || !!S.duel; $("tNext").hidden = !enTournoi;
  $("revanche").hidden = !S.duel; $("retourDuels").hidden = !S.duel; $("revanche").disabled = false;
  if (!S.duel) $("endClassement").hidden = true;
  $("abandonDuelZone").hidden = true;
  if (enTournoi) $("tNext").textContent = gagne ? (S.tour === 2 ? "Voir le palmarès" : "Continuer le tournoi") : "Voir la suite du tournoi";
  $("news").textContent = nouveaux.length ? "Nouveau titre : " + nouveaux.map(t => t.nom + (t.debloque ? ` (débloque ${t.debloque})` : "")).join(", ") + " !" : "";
  $("end").scrollIntoView({ behavior: reduitMouvement() ? "auto" : "smooth", block: "start" });
}

const barres = (cpt, total) => [0, 2, 1].map(s => {
  const p = total ? Math.round(100 * cpt[s] / total) : 0;
  return `<div class="bar"><span>${EMOJI[s]} ${NOM[s]}</span><div class="t"><div style="width:${p}%"></div></div><span>${p} %</span></div>`;
}).join("");

function afficherBilan() {
  const f = Object.entries(P.faceAFace).filter(([id]) => !id.startsWith("h:")).map(([, x]) => x);
  const v = f.reduce((a, x) => a + x.v, 0), d = f.reduce((a, x) => a + x.d, 0);
  $("record").textContent = v + d ? `Ton bilan contre les bots : ${v} victoire${v > 1 ? "s" : ""}, ${d} défaite${d > 1 ? "s" : ""}` : "";
}

// ---------------------------------------------------------------- nouvelle séance
function nouvelleSeance() {
  voix.arreter(); arreterMinuteur();
  const mm = monMatch(T);
  if (mm) { WIN = SETS_PAR_TOUR[T.tour]; OPP = botParId(mm.a === "moi" ? mm.b : mm.a); }
  else if (!T) { WIN = fmt.win; OPP = botParId(amicalId); }
  S = {
    match: nouveauMatch({ pointsParSet: fmt.len, setsGagnants: WIN }),
    stats: nouvellesStats(), annonces: nouvelEtatAnnonces(), suivi: new Suivi(),
    tour: null, occupe: false, enJeu: false,
  };
  preparerEcranMatch();
  $("startCard").hidden = !!T; $("again").hidden = false; $("tNext").hidden = true;
  renderFormat(); renderTableau(); rafraichirAvatars();
}

// Remet l'écran de match à zéro (solo ou duel).
function preparerEcranMatch() {
  $("hMe").textContent = "❔"; $("hBot").textContent = "❔"; $("hMe").className = "hand"; $("hBot").className = "hand";
  $("verdict").textContent = "";
  $("band").innerHTML = `<div class="idle">Les annonces de l'arbitre et du commentateur s'afficheront ici.</div>`; $("band").classList.remove("stale");
  $("tape").innerHTML = `<p class="empty">Les coups apparaîtront ici. Observe-les : ton adversaire le fait.</p>`;
  $("read").textContent = "L'analyse de ton jeu démarre au premier coup.";
  $("end").hidden = true; $("bar").style.transform = "scaleX(1)"; $("timer").classList.remove("urgent");
  render(); $("status").textContent = "Choisis ton premier coup";
  boutons(false); afficherBilan(); window.scrollTo(0, 0);
  $("revanche").hidden = true; $("retourDuels").hidden = true; $("abandonDuelZone").hidden = true;
}

function renderFormat() {
  document.querySelectorAll("#segLen button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.v === fmt.len)));
  document.querySelectorAll("#segWin button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.v === fmt.win)));
  const est = { 7: { 2: "30 à 45", 3: "45 à 70" }, 11: { 2: "50 à 75", 3: "75 à 110" } }[fmt.len][fmt.win];
  $("fmtHint").textContent = `Sets de ${fmt.len} points${fmt.len === 11 ? " (format officiel)" : ""}, environ ${est} coups.${fmt.len === 11 ? "" : " Tu peux revenir au format officiel dans les Options."}`;
  $("ruleTxt").textContent = `Sets de ${fmt.len}, ${WIN} sets gagnants`;
}
const matchEnCours = () => S && S.enJeu && S.match.coups.length > 0 && !S.match.termine;
const sauverFormat = () => ecrire("format", { len: fmt.len, win: fmt.win });
document.querySelectorAll("#segLen button").forEach(b => b.addEventListener("click", () => {
  if (matchEnCours() || T || D) { $("lenLock").hidden = false; return; }
  fmt.len = +b.dataset.v; sauverFormat(); nouvelleSeance();
}));
document.querySelectorAll("#segWin button").forEach(b => b.addEventListener("click", () => {
  if (matchEnCours() || D) return;
  fmt.win = WIN = +b.dataset.v; sauverFormat(); nouvelleSeance();
}));

// ---------------------------------------------------------------- face-à-face
let minuteriesIntro = [];
function ouvrirFaceAFace() {
  $("startCard").hidden = true; $("tourCard").hidden = true;
  try { ambiance.initialiser(); } catch { /* le match se joue aussi sans son */ } // geste de l'utilisateur : le son peut démarrer
  const pr = presentation(P, OPP, { tour: S.tour, pointsParSet: S.match.format.pointsParSet, setsGagnants: WIN, classementMoi: monClassement, classe: D?.duel?.classe !== false });
  $("foGo").disabled = false; $("foGo").textContent = "Commencer";
  $("foBack").textContent = S.duel ? "Abandonner le duel" : "Retour";
  $("foStage").textContent = pr.bandeau; $("foFmt").textContent = pr.format;
  $("foAvMe").innerHTML = avatarSVG(P.av); $("foAvBot").innerHTML = avatarSVG(OPP.av);
  $("foNameMe").textContent = pr.joueur.nom; $("foSubMe").textContent = pr.joueur.sous; $("foRecMe").textContent = pr.joueur.bilan;
  $("foNameBot").textContent = pr.adversaire.nom; $("foSubBot").textContent = pr.adversaire.sous; $("foRecBot").textContent = pr.adversaire.bilan;
  const cellule = (texte, n, adv) => `<span class="${adv ? "adv" : ""}${n === undefined && texte.length > 3 ? " txt" : ""}"${n !== null && n !== undefined ? ` data-n="${n}"` : ""}>${esc(texte)}</span>`;
  $("foRows").innerHTML = pr.lignes.map((l, i) => `<div class="fo-row" style="--i:${i}">${cellule(l.g, l.gn, l.avantage === "g")}<span>${l.label}</span>${cellule(l.d, l.dn, l.avantage === "d")}</div>`).join("");
  $("foKey").innerHTML = `${esc(pr.cle)} Tu joues <b>côté jaune</b>.`;

  // Chorégraphie : bandeau, entrée des joueurs, VS (et le public applaudit), puis les stats une à une.
  const ov = $("faceoff"), debutStats = 1.6, pas = 0.28, fin = debutStats + pr.lignes.length * pas + 0.3;
  ov.style.setProperty("--fin", `${fin}s`);
  ov.classList.remove("show", "vite"); void ov.offsetWidth;
  faceAFaceOuvert = true; ov.classList.add("show");
  minuteriesIntro.forEach(clearTimeout);
  const vite = reduitMouvement();
  minuteriesIntro = [setTimeout(() => ambiance.public("set", 0.4), vite ? 0 : 1150)];
  ov.querySelectorAll("[data-n]").forEach(el => {
    const i = +el.parentElement.style.getPropertyValue("--i");
    if (!vite) minuteriesIntro.push(setTimeout(() => compter(el), (debutStats + i * pas) * 1000));
  });
  if (!vite) minuteriesIntro.push(setTimeout(() => $("foGo").focus(), fin * 1000));
  else $("foGo").focus();
  // Filet de sécurité : quoi qu'il arrive à l'animation, tout est affiché peu après.
  minuteriesIntro.push(setTimeout(() => ov.classList.add("vite"), (fin + 0.8) * 1000));
}
// Les nombres défilent jusqu'à leur valeur, comme au tableau d'affichage.
function compter(el) {
  const cible = +el.dataset.n, texte = el.textContent, suffixe = texte.slice(String(cible).length), t0 = performance.now();
  const pas = t => {
    const k = Math.min(1, (t - t0) / 700), v = Math.round(cible * (1 - Math.pow(1 - k, 3)));
    el.textContent = `${v}${suffixe}`;
    if (k < 1 && !$("faceoff").classList.contains("vite")) requestAnimationFrame(pas); else el.textContent = texte;
  };
  requestAnimationFrame(pas);
}
// Toucher l'écran pendant l'animation : on passe directement à la fin.
$("faceoff").addEventListener("click", e => {
  if (e.target.closest("button")) return;
  const ov = $("faceoff"); if (ov.classList.contains("vite")) return;
  ov.classList.add("vite");
  minuteriesIntro.splice(1).forEach(clearTimeout);   // on garde les applaudissements
  $("foGo").focus();
});
function fermerFaceAFace() { $("faceoff").classList.remove("show"); faceAFaceOuvert = false; minuteriesIntro.forEach(clearTimeout); }
$("foGo").addEventListener("click", () => {
  if (S.duel) { try { ambiance.initialiser(); } catch { /* sans son */ } duelPret(); return; }   // on attend que l'adversaire soit prêt
  $("faceoff").classList.remove("show"); faceAFaceOuvert = false;
  S.enJeu = true;
  boutons(true); $("status").textContent = "Set 1, coup 1"; lancerMinuteur();
  annoncer([annonceDebutSet(S.match)]);
});
$("foBack").addEventListener("click", () => {
  if (S.duel) { abandonnerDuel(); return; }
  $("faceoff").classList.remove("show"); faceAFaceOuvert = false; minuteriesIntro.forEach(clearTimeout);
  S.tour = null; nouvelleSeance();
});

// ---------------------------------------------------------------- fiche joueur
function rafraichirAvatars() {
  $("miniBot").innerHTML = avatarSVG(OPP.av); $("botName").textContent = OPP.nom;
  $("miniAv").innerHTML = avatarSVG(P.av); $("pseudoMe").textContent = nomAffiche(P);
}

function renderFiche() {
  $("pAv").innerHTML = avatarSVG(P.av);
  afficherNomFiche();
  $("pTitle").textContent = dernierTitre(P);
  $("pElo").textContent = `Niveau d'entraînement : ${P.elo}`;
  $("pClassement").hidden = monClassement === null; $("pClassement").textContent = `Classement PCF : ${monClassement}`;
  $("kM").textContent = P.matchs;
  $("kW").textContent = P.matchs ? Math.round(100 * P.victoires / P.matchs) + " %" : "–";
  $("kS").textContent = P.serieEnCours;
  $("pEmpty").textContent = P.matchs ? "" : "Joue ton premier match pour remplir ta fiche.";
  ["cGame", "cMental", "cRecords", "cElo", "cLast"].forEach(id => { $(id).hidden = !P.matchs; });

  if (P.matchs) {
    const tot = P.signes.reduce((a, b) => a + b, 0), fav = signeFavori(P.signes);
    const taux = P.lisibles ? P.devines / P.lisibles : 1 / 3, ind = indiceImprevisibilite(taux);
    const mv = P.apresVictoire ? Math.round(100 * P.memeApresVictoire / P.apresVictoire) : null;
    const md = P.apresDefaite ? Math.round(100 * P.memeApresDefaite / P.apresDefaite) : null;
    $("gameBody").innerHTML = `<div class="bars">${barres(P.signes, tot)}</div>
      <div class="lines">
        <div class="ln"><span>Signe favori</span><span>${fav === null ? "–" : `${EMOJI[fav]} ${NOM[fav]}`}</span></div>
        <div class="ln"><span>Même signe après une victoire</span><span>${mv === null ? "–" : mv + " %"}</span></div>
        <div class="ln"><span>Même signe après une défaite</span><span>${md === null ? "–" : md + " %"}</span></div>
      </div>
      <p class="hint">Un joueur parfaitement imprévisible rejoue le même signe environ 33 % du temps.</p>
      <h2 style="margin-top:16px">Indice d'imprévisibilité</h2>
      <div class="big">${ind}<span style="font-size:1rem;color:var(--muted)"> / 100</span></div>
      <div class="gauge"><div style="width:${ind}%"></div></div>
      <p class="hint">L'analyse a deviné <b>${P.devines} coups sur ${P.lisibles}</b>, soit ${(taux * 100).toFixed(1).replace(".", ",")} %. Le hasard pur donnerait 33 % : 100 sur 100, 40 % : 80, 50 % : 50, 60 % : 20.</p>`;
    const pc = (a, b) => (b ? `${a} sur ${b} (${Math.round(100 * a / b)} %)` : "Aucune pour l'instant");
    $("mentalBody").innerHTML = `
      <div class="ln"><span>Balles de set et de match converties</span><span>${pc(P.ballesConverties, P.ballesObtenues)}</span></div>
      <div class="ln"><span>Balles adverses sauvées</span><span>${pc(P.ballesSauvees, P.ballesSubies)}</span></div>
      <div class="ln"><span>Sets décisifs gagnés</span><span>${P.decisifsJoues ? `${P.decisifsGagnes} sur ${P.decisifsJoues}` : "Aucun joué"}</span></div>
      <div class="ln"><span>Matchs gagnés après avoir perdu le 1er set</span><span>${P.remontadas}</span></div>`;
    $("recBody").innerHTML = `
      <div class="ln"><span>Plus longue série de points</span><span>${P.meilleureSeriePoints}</span></div>
      <div class="ln"><span>Plus belle remontée dans un set</span><span>${P.meilleureRemontee ? P.meilleureRemontee + " points de retard" : "–"}</span></div>
      <div class="ln"><span>Meilleure série de victoires</span><span>${P.meilleureSerieVictoires}</span></div>
      <div class="ln"><span>Plus long match</span><span>${P.plusLongMatch} coups</span></div>
      <div class="ln"><span>Sets gagnés / perdus</span><span>${P.sets[0]} / ${P.sets[1]}</span></div>`;
    const h = P.historiqueElo, lo = Math.min(...h) - 20, hi = Math.max(...h) + 20, W = 300, H = 80;
    const y = v => H - 5 - ((v - lo) / (hi - lo)) * (H - 10);
    const pts = h.map((v, i) => `${h.length === 1 ? W / 2 : i * (W - 10) / (h.length - 1) + 5},${y(v)}`).join(" ");
    $("spark").innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Évolution du niveau d'entraînement, de ${h[0]} à ${h[h.length - 1]}">
      <line x1="0" x2="${W}" y1="${y(1200)}" y2="${y(1200)}" stroke="rgba(255,255,255,.2)" stroke-dasharray="4 4"/>
      <polyline points="${pts}" fill="none" stroke="var(--me)" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`;
    $("lastBody").innerHTML = P.derniers.map(d => {
      const adv = botParId(d.adv);
      const nom = adv ? adv.nom : d.nomAdv;
      return `<div class="ln"><span>${d.gagne ? "✅ Victoire" : "❌ Défaite"} ${d.sets}${nom ? ` contre ${esc(nom)}` : ""}</span><span style="font-weight:400;color:var(--muted)">${esc(d.detail)}</span></div>`;
    }).join("");
  }
  $("badges").innerHTML = TITRES.map(t => {
    const on = !!P.titres[t.id];
    return `<div class="badge ${on ? "on" : "off"}"><div class="bn">${on ? "🏅" : "🔒"} ${t.nom}</div><div class="bd">${t.desc}</div>${t.debloque ? `<div class="bu">Débloque ${t.debloque}</div>` : ""}</div>`;
  }).join("");
  renderEditeur();
}

function renderEditeur() {
  const mk = (el, type, table, texte) => {
    el.innerHTML = Object.keys(table).map(k => {
      const ferme = estVerrouille(P, type, k), label = texte ? table[k] : table[k][0];
      return `<button data-k="${k}" class="${texte ? "txt " : ""}${ferme ? "locked" : ""}" aria-pressed="${P.av[type] === k}" aria-label="${label}${ferme ? ", verrouillé" : ""}" title="${label}" ${texte ? "" : `style="background:${table[k][1]}"`}>${texte ? label : ""}</button>`;
    }).join("");
    el.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
      const k = b.dataset.k, t = verrouDe(type, k);
      if (estVerrouille(P, type, k)) { $("lockNote").textContent = `Verrouillé. Obtiens le titre « ${t.nom} » : ${t.desc.charAt(0).toLowerCase() + t.desc.slice(1)}`; return; }
      $("lockNote").textContent = ""; P.av[type] = k; sauverP(); renderFiche(); rafraichirAvatars();
    }));
  };
  mk($("swSymbole"), "symbole", SYMBOLES, true); mk($("swBg"), "fond", FONDS); mk($("swGlove"), "gant", GANTS); mk($("swWrist"), "poignet", POIGNETS); mk($("swMotif"), "motif", MOTIFS, true);
}
$("inFlag").innerHTML = PAYS.map(([f, n]) => `<option value="${f}">${f} ${n}</option>`).join("");
$("inFlag").value = P.drapeau;
$("inFlag").addEventListener("change", e => { P.drapeau = e.target.value; sauverP(); renderFiche(); });
$("inPseudo").value = P.pseudo;
$("inPseudo").addEventListener("input", e => {
  const propre = e.target.value.replace(/[#\u0000-\u001f]/g, "");
  if (propre !== e.target.value) e.target.value = propre;
  P.pseudo = propre.slice(0, 16).trim(); sauverP();
  afficherNomFiche(); rafraichirAvatars();
});
$("resetProfile").addEventListener("click", () => {
  if (!confirm("Remettre ta fiche à zéro ? Tes statistiques et titres seront effacés.")) return;
  P = remettreAZero(P); sauverP(); renderFiche(); rafraichirAvatars(); afficherBilan();
});

// ---------------------------------------------------------------- onglets
document.querySelectorAll(".tabs button").forEach(b => b.addEventListener("click", () => {
  const v = b.dataset.v;
  document.querySelectorAll(".tabs button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
  $("viewMatch").hidden = v !== "match"; $("viewProfile").hidden = v !== "profile"; $("viewOptions").hidden = v !== "options"; $("viewDuel").hidden = v !== "duel";
  $("viewCercles").hidden = v !== "cercles";
  $("lenLock").hidden = true;
  if (v === "profile") renderFiche();
  if (v === "duel") duelsUI?.rafraichir();
  if (v === "cercles") cerclesUI?.rafraichir();
  window.scrollTo(0, 0);
}));

// ---------------------------------------------------------------- choix de l'adversaire
function renderAdversaires() {
  $("opps").innerHTML = BOTS.map(b => `<button class="opp" data-id="${b.id}" aria-pressed="${b.id === amicalId}"><span class="oa">${avatarSVG(b.av)}</span><span class="on">${b.nom}</span><span class="ol">Niveau ${b.elo}</span></button>`).join("");
  $("opps").querySelectorAll("button").forEach(x => x.addEventListener("click", () => {
    amicalId = x.dataset.id; ecrire("adversaire", amicalId);
    OPP = botParId(amicalId); renderAdversaires(); rafraichirAvatars();
    if (!matchEnCours()) renderHistoriqueVide();
  }));
  const b = botParId(amicalId); $("oppDesc").textContent = `${b.nom}, ${b.style.toLowerCase()} : ${b.desc}`;
}
const renderHistoriqueVide = () => { if (!S.match.coups.length) $("tape").innerHTML = `<p class="empty">Les coups apparaîtront ici. Observe-les : ton adversaire le fait.</p>`; };
document.querySelectorAll("#segMode button").forEach(b => b.addEventListener("click", () => {
  const v = b.dataset.v;
  document.querySelectorAll("#segMode button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
  $("amicalBox").hidden = v !== "amical"; $("tourBox").hidden = v !== "tournoi";
}));
$("startBtn").addEventListener("click", () => { S.tour = null; OPP = botParId(amicalId); WIN = fmt.win; renderFormat(); ouvrirFaceAFace(); });
$("again").addEventListener("click", () => nouvelleSeance());

// ---------------------------------------------------------------- tournoi
const infoJoueur = id => (id === "moi" ? { nom: nomAffiche(P), av: P.av, elo: P.elo } : botParId(id));
function renderTableau() {
  $("tourCard").hidden = !T; if (!T) return;
  let h = "";
  T.tours.forEach((R, ri) => {
    if (!R.length) return;
    h += `<div class="rnd">${TOURS[ri]}</div>`;
    R.forEach(m => {
      const A = infoJoueur(m.a), B = infoJoueur(m.b), cls = x => (m.v === x ? "win" : m.v ? "lose" : ""), mien = m.a === "moi" || m.b === "moi" ? " mine" : "";
      h += `<div class="bm${mien}"><div class="bp ${cls(m.a)}"><span class="mini">${avatarSVG(A.av)}</span><span class="bn">${esc(A.nom)}</span></div><div class="bs">${m.score || "vs"}</div><div class="bp r ${cls(m.b)}"><span class="bn">${esc(B.nom)}</span><span class="mini">${avatarSVG(B.av)}</span></div></div>`;
    });
  });
  $("bracket").innerHTML = h;
  const mm = monMatch(T);
  if (T.fini) {
    $("tMsg").textContent = T.champion === "moi" ? "🏆 Tu remportes le PCF Open ! Le titre est à toi."
      : `🏆 ${infoJoueur(T.champion).nom} remporte le PCF Open.` + (T.elimine ? ` Ton parcours s'arrête en ${TOURS[T.tourElimination].toLowerCase()}.` : "");
    $("tPlay").textContent = "Nouveau tournoi"; $("tQuit").textContent = "Retour à l'accueil";
  } else if (mm) {
    const adv = infoJoueur(mm.a === "moi" ? mm.b : mm.a);
    $("tMsg").textContent = `${TOUR_SINGULIER[T.tour]} contre ${adv.nom}, ${adv.style.toLowerCase()}. ${SETS_PAR_TOUR[T.tour]} sets gagnants.`;
    $("tPlay").textContent = `Jouer ${T.tour === 2 ? "la finale" : T.tour === 1 ? "ma demi-finale" : "mon quart de finale"}`;
    $("tQuit").textContent = "Abandonner le tournoi";
  }
}
$("tourBtn").addEventListener("click", () => { T = nouveauTournoi(P.elo); sauverT(); nouvelleSeance(); });
$("tPlay").addEventListener("click", () => {
  if (T.fini) { T = nouveauTournoi(P.elo); sauverT(); nouvelleSeance(); return; }
  const mm = monMatch(T); if (!mm) return;
  OPP = botParId(mm.a === "moi" ? mm.b : mm.a); WIN = SETS_PAR_TOUR[T.tour];
  S.match = nouveauMatch({ pointsParSet: fmt.len, setsGagnants: WIN });
  S.tour = T.tour; renderFormat(); render(); rafraichirAvatars(); ouvrirFaceAFace();
});
$("tQuit").addEventListener("click", () => {
  if (!T.fini && !confirm("Abandonner le tournoi en cours ?")) return;
  T = null; sauverT(); nouvelleSeance();
});
$("tNext").addEventListener("click", () => {
  terminerTour(T, fmt.len); if (T.elimine) while (!T.fini) terminerTour(T, fmt.len);
  sauverT(); nouvelleSeance();
});

// ---------------------------------------------------------------- clavier (ordinateur)
document.querySelectorAll("#moves button").forEach(b => b.addEventListener("click", () => jouer(+b.dataset.m)));
document.addEventListener("keydown", e => {
  if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  const k = { p: 0, c: 1, f: 2 }[e.key.toLowerCase()];
  if (k !== undefined) jouer(k);
});

// ---------------------------------------------------------------- application installable
$("version").textContent = `Version ${VERSION}`;
let invitation = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); invitation = e; $("installBtn").hidden = false; });
$("installBtn").addEventListener("click", async () => { if (!invitation) return; invitation.prompt(); await invitation.userChoice; invitation = null; $("installBtn").hidden = true; });
if (matchMedia("(display-mode: standalone)").matches || navigator.standalone) $("installCard").hidden = true;
if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});

// ---------------------------------------------------------------- compte en ligne
function afficherNomFiche() {
  $("pName").innerHTML = `${esc(nomAffiche(P))}${P.numero ? `<span class="num">#${P.numero}</span>` : ""} ${P.drapeau}`;
}
compteUI = installerCompte({
  lireP: () => P,
  sauverLocal,
  rafraichir: () => { afficherNomFiche(); rafraichirAvatars(); },
  ouvrirFiche: () => document.querySelector('.tabs button[data-v="profile"]').click(),
  remplacerP: fiche => {
    P = normaliserProfil(fiche); sauverLocal();
    $("inPseudo").value = P.pseudo; $("inFlag").value = P.drapeau;
    renderFiche(); rafraichirAvatars(); afficherBilan();
  },
});

// ---------------------------------------------------------------- duel en ligne
// Le serveur arbitre : on lui envoie son signe, il révèle les deux quand les deux ont joué.
// Le téléphone rejoue les coups révélés avec les mêmes règles pour l'affichage et les annonces.
const TOLERANCE_MS = 1600;
const ouvrirOnglet = v => document.querySelector(`.tabs button[data-v="${v}"]`).click();

function lancerDuel(duel, ligneAdv) {
  if (!duel || !ligneAdv) return;
  if (D && D.id === duel.id) { ouvrirOnglet("match"); majDuel(duel); return; }
  const uid = compteUI.session()?.user?.id, moi = maPlace(duel, uid);
  if (moi === null) return;
  quitterDuel({ solo: false });
  OPP = adversaireHumain(ligneAdv); WIN = duel.sets_gagnants;
  S = {
    match: nouveauMatch({ pointsParSet: duel.points_par_set, setsGagnants: duel.sets_gagnants }),
    stats: nouvellesStats(), annonces: nouvelEtatAnnonces({ humain: true }), suivi: new Suivi(),
    tour: null, occupe: false, enJeu: false, duel: true,
  };
  D = { id: duel.id, moi, duel, decalage: 0, mancheEnvoyee: null, presente: false, fini: false, apresPanneau: null, finSpeciale: null };
  preparerEcranMatch();
  $("startCard").hidden = true; $("tourCard").hidden = true; $("abandonDuelZone").hidden = false;
  $("ruleTxt").textContent = `Duel · sets de ${duel.points_par_set}, ${duel.sets_gagnants} sets gagnants`;
  rafraichirAvatars(); render();
  ouvrirOnglet("match");
  D.arret = serveur.ecouter("duel", `id=eq.${duel.id}`, majDuel);
  D.boucle = setInterval(battement, 1000);
  majDuel(duel); battement();
}

// Signe de vie + application des délais par le serveur ; donne aussi l'heure du serveur.
async function battement() {
  if (!D || D.fini) return;
  const id = D.id, t0 = Date.now();
  try {
    const r = await serveur.reclamer(id);
    if (!D || D.id !== id) return;
    D.decalage = Date.parse(r.maintenant) - (t0 + Date.now()) / 2;
    D.horsLigne = false;
    majDuel(r.duel);
  } catch { if (D && D.id === id) { D.horsLigne = true; afficherEtatDuel(); } }
}

function majDuel(duel) {
  if (!D || !duel || duel.id !== D.id || D.fini) return;
  if (D.duel && Date.parse(duel.maj_le) < Date.parse(D.duel.maj_le)) return;   // information périmée
  D.duel = duel;
  const m = S.match, n = (duel.coups || []).length;

  // 1. Les coups révélés depuis la dernière fois (rattrapage si plusieurs).
  if (m.coups.length < n && !m.termine) {
    while (m.coups.length < n - 1) { const c = coupVuDe(duel.coups[m.coups.length], D.moi); afficherCoup(c.a, c.b, c.auto, { silencieux: true }); }
    const c = coupVuDe(duel.coups[n - 1], D.moi);
    S.occupe = true; arreterMinuteur(); boutons(false);
    afficherCoup(c.a, c.b, c.auto);
    if (!coherent(m, duel, D.moi)) {   // ne devrait jamais arriver : on se recale sur le serveur
      const r = rejouer(duel, D.moi); S.match = r.match; render(); renderHistorique();
    }
  }

  // 2. La phase du duel.
  if (duel.phase === "presentation") {
    if (!D.presente) { D.presente = true; ouvrirFaceAFace(); }
  } else if (duel.phase === "jeu") {
    if (faceAFaceOuvert) { fermerFaceAFace(); annoncer([annonceDebutSet(S.match)]); }
    if (panneauOuvert) { fermerPanneau(); D.apresPanneau?.(); D.apresPanneau = null; }
    S.enJeu = true;
    if (!S.occupe) duelReprendre();
  } else if (duel.phase === "termine") {
    terminerDuel(duel);
  } else if (duel.phase === "annule" || duel.phase === "refuse") {
    quitterDuel(); ouvrirOnglet("duel");
  }
  majBoutonsPret();
  afficherEtatDuel();
}

// Après un coup (ou une pause) : à moi de jouer, si le serveur l'attend.
function duelReprendre() {
  if (!D || D.fini) return;
  S.occupe = false;
  const d = D.duel;
  if (d.phase !== "jeu" || d.pause_depuis || D.mancheEnvoyee === d.manche || panneauOuvert || faceAFaceOuvert) { if (D.mancheEnvoyee !== d.manche) boutons(false); return; }
  // Début de set : décompte « 3, 2, 1 » donné par le serveur, identique sur les deux téléphones.
  const avantDepart = tempsRestant(d.echeance, D.decalage) - DUREE_COUP_MS;
  clearTimeout(D.decompte);
  if (avantDepart > 250) {
    boutons(false); arreterMinuteur(); $("bar").style.transform = "scaleX(1)";
    $("verdict").textContent = `Premier coup dans ${Math.ceil(avantDepart / 1000)}…`;
    D.decompte = setTimeout(duelReprendre, Math.min(avantDepart, (avantDepart % 1000) || 1000));
    return;
  }
  if ($("verdict").textContent.startsWith("Premier coup dans")) $("verdict").textContent = "À toi de jouer !";
  boutons(true); lancerMinuteurDuel();
}

function lancerMinuteurDuel() {
  cancelAnimationFrame(raf); $("timer").classList.remove("urgent");
  const manche = D.duel.manche;
  const tick = () => {
    if (!D || D.fini || D.duel.manche !== manche || D.duel.pause_depuis) return;
    const reste = tempsRestant(D.duel.echeance, D.decalage);
    const k = Math.max(0, Math.min(1, reste / DUREE_COUP_MS));
    $("bar").style.transform = `scaleX(${k})`;
    if (k < 0.3) $("timer").classList.add("urgent");
    if (reste <= 0) {
      // Temps écoulé : le serveur jouera au hasard pour celui qui n'a pas joué.
      if (D.mancheEnvoyee !== manche) { boutons(false); $("verdict").textContent = "Temps écoulé…"; }
      setTimeout(battement, TOLERANCE_MS);
      return;
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}

function jouerDuel(signe) {
  if (!D || D.fini || S.occupe || panneauOuvert || faceAFaceOuvert) return;
  const d = D.duel;
  if (d.phase !== "jeu" || d.pause_depuis || D.mancheEnvoyee === d.manche) return;
  D.mancheEnvoyee = d.manche; boutons(false);
  ambiance.raquette(signe);
  $("hMe").textContent = EMOJI[signe]; $("hMe").className = "hand"; $("hBot").textContent = "⏳"; $("hBot").className = "hand";
  $("verdict").textContent = `En attente de ${OPP.nom}…`;
  serveur.jouer(D.id, d.manche, signe).then(majDuel).catch(e => {
    if (!D) return;
    if (/déjà terminé|déjà joué|Temps écoulé/.test(e.message)) { battement(); return; }
    D.mancheEnvoyee = null; $("verdict").textContent = e.message; duelReprendre();
  });
}

function duelPret() {
  if (!D) return;
  serveur.pret(D.id).then(majDuel).catch(e => { $("verdict").textContent = e.message; });
  const d = D.duel, prets = [...d.prets]; prets[D.moi] = true;
  majBoutonsPret({ ...d, prets });
}
// « Commencer » / « Lancer le set suivant » : on attend que l'adversaire soit prêt aussi.
function majBoutonsPret(d = D?.duel) {
  if (!D || !d) return;
  const pret = d.prets && d.prets[D.moi];
  const attente = `En attente de ${OPP.nom}…`;
  if (faceAFaceOuvert && d.phase === "presentation") { $("foGo").disabled = !!pret; if (pret) $("foGo").textContent = attente; }
  if (panneauOuvert && d.phase === "entre_sets") { $("iGo").disabled = !!pret; if (pret) $("iGo").textContent = attente; }
}

function afficherEtatDuel() {
  if (!D || D.fini) return;
  const d = D.duel, st = $("status");
  if (D.horsLigne) { st.textContent = "⚠️ Connexion au serveur perdue… nouvelle tentative"; st.classList.add("hot"); return; }
  if (d.phase === "jeu" && d.pause_depuis) {
    const ecoule = (Date.now() + D.decalage - Date.parse(d.pause_depuis)) / 1000;
    const reste = Math.max(0, Math.ceil(60 - ecoule));
    st.textContent = `⏸ ${OPP.nom} a perdu la connexion. Sans retour dans ${reste} s, victoire par forfait.`;
    st.classList.add("hot"); boutons(false); arreterMinuteur();
    D.enPause = true;
    return;
  }
  if (D.enPause) { D.enPause = false; render(); duelReprendre(); }
  else if (st.textContent.startsWith("⚠️")) render();
}

function terminerDuel(duel) {
  if (D.fini) return;
  D.fini = true;
  D.arret?.(); clearInterval(D.boucle); clearTimeout(D.decompte); arreterMinuteur(); boutons(false);
  if (faceAFaceOuvert) fermerFaceAFace();
  if (panneauOuvert) fermerPanneau();
  const cl = texteClassementFin(duel, D.moi);
  $("endClassement").textContent = cl; $("endClassement").hidden = !cl;
  cerclesUI?.rafraichir();
  if (duel.fin !== "score" || !S.match.termine) {
    // Forfait ou abandon : le match s'arrête là.
    D.finSpeciale = duel.fin;
    S.match.termine = true; S.match.vainqueur = duel.vainqueur === D.moi ? 0 : 1;
    render(); finir();
  }
}

function quitterDuel({ solo = true } = {}) {
  if (!D) return;
  D.arret?.(); clearInterval(D.boucle); clearTimeout(D.decompte); arreterMinuteur();
  if (faceAFaceOuvert) fermerFaceAFace();
  if (panneauOuvert) fermerPanneau();
  D = null;
  if (solo) nouvelleSeance();
}

function abandonnerDuel() {
  if (!D || D.fini) return;
  if (!confirm(`Abandonner le duel contre ${OPP.nom} ? Ce sera une défaite.`)) return;
  serveur.abandonner(D.id).then(majDuel).catch(e => { $("verdict").textContent = e.message; });
}
$("abandonDuel").addEventListener("click", abandonnerDuel);
$("retourDuels").addEventListener("click", () => { quitterDuel(); ouvrirOnglet("duel"); });
$("revanche").addEventListener("click", async () => {
  const f = S.match.format, adv = OPP.uid;
  $("revanche").disabled = true;
  try {
    await serveur.creer(adv, f.pointsParSet, f.setsGagnants, D?.duel?.classe !== false);
    quitterDuel(); ouvrirOnglet("duel");
    $("duelMsg").textContent = `Revanche proposée à ${OPP.nom} ! La partie démarre dès que ${OPP.nom} accepte.`;
  } catch (e) { $("revanche").disabled = false; $("verdict").textContent = e.message; }
});

duelsUI = installerDuels({
  compte: compteUI,
  lancerDuel,
  duelEnCours: () => !!D && !D.fini,
  ouvrirOnglet,
});

// ---------------------------------------------------------------- amis et cercles
cerclesUI = installerCercles({
  compte: compteUI,
  ouvrirOnglet,
  defier: p => duelsUI.defier(p),
  surClassement: points => {
    monClassement = points;
    $("pClassement").hidden = points === null; $("pClassement").textContent = `Classement PCF : ${points}`;
  },
});

// ---------------------------------------------------------------- démarrage
renderAdversaires();
renderVoixInfo();
nouvelleSeance();
