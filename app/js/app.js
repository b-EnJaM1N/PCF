// Écran principal : relie les règles, les bots, les annonces, le son et la fiche joueur.
import { EMOJI, NOM, DUREE_COUP_MS, nouveauMatch, jouerCoup, balle, egaliteFinDeSet, pointDecisif, setDecisif, signeAuHasard, texteFormat, POINTS_PAR_SET } from "./regles.js";
import { BOTS, botParId, choisirCoup, contexteBot } from "./bots.js";
import { Suivi, indiceImprevisibilite } from "./analyse.js";
import { nouvelEtatAnnonces, annoncerCoup, annonceDebutSet, annoncesAvantMatch, interview, etiquetteDe, situationsDuMatch } from "./annonces.js";
import { surnomDe, NOMS, COMPLEMENTS, debloques, aDebloquer } from "./surnoms.js";
import { voirTournoi } from "./social-serveur.js";
import { histoireDuMatch } from "./une-logique.js";
import { dessinerUne } from "./une.js";
import { carteDe, notesDe, texteRang } from "./carte-logique.js";
import { dessinerCarte } from "./carte.js";
import { STYLES, DELAI_CHOIX_MS, styleValide, styleDuBot, rencontre, compterPoignee } from "./poignee.js";
import { installerRapide } from "./ecran-rapide.js";
import { installerSignalement } from "./ecran-signaler.js";
import { etatNotifications, activerNotifications, desactiverNotifications, rattacherAbonnement, testerNotification, texteTest } from "./notifications.js";
import { FORMATS_RAPIDES, botProche } from "./rapide-logique.js";
import { MARQUE } from "./marque.js";
import { nouvellesStats, suivreCoup } from "./stats-match.js";
import { TITRES, FAMILLES, accorderTitres, titresEnLigne, normaliserProfil, enregistrerMatch, remettreAZero, verrouDe, estVerrouille, nomAffiche, titresObtenus, dernierTitre, signeFavori } from "./profil.js";
import { tourDe, nouveauTournoi, monMatch, enregistrerMonMatch, terminerTour } from "./tournoi.js";
import { presentation, etatPasser } from "./presentation.js";
import { avatarSVG, SYMBOLES, FONDS, GANTS, POIGNETS, MOTIFS, MOTIFS_GANT, PAYS } from "./avatar.js";
import { LecteurVoix } from "./voix/lecteur.js";
import { CATALOGUE, ligneDialogue } from "./voix/script.js";
import { Ambiance, reactionsPublic, egalitesAvantDernier } from "./ambiance.js";
import { CRIS, libelleCri, criValide, criDuBot, celebration, commenterCri, couleursConfettis } from "./celebrations.js";
import { lire, ecrire } from "./stockage.js";
import { VERSION } from "./version.js";
import { installerCompte } from "./ecran-compte.js";
import { installerDuels } from "./ecran-duel.js";
import { installerCercles } from "./ecran-cercles.js";
import { installerSng } from "./ecran-sng.js";
import { installerJetons } from "./ecran-jetons.js";
import { installerFreeroll } from "./ecran-freeroll.js";
import { installerDefis } from "./ecran-defis.js";
import { gainDuel } from "./jetons-logique.js";
import { texteClassementFin, texteNiveau, provisoire } from "./social-logique.js";
import * as serveur from "./duel-serveur.js";
import { maPlace, coupVuDe, rejouer, coherent, adversaireHumain, tempsRestant, formatDuel } from "./duel-logique.js";

const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ORD = ["Premier", "Deuxième", "Troisième", "Quatrième", "Cinquième"];
const reduitMouvement = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------------- état
const fmt = { len: 11, win: 2, ...(lire("format") || {}) };
if (!POINTS_PAR_SET.includes(fmt.len)) fmt.len = 11;
if (![1, 2, 3].includes(fmt.win)) fmt.win = 2;
const lenTournoi = () => (fmt.len >= 7 ? fmt.len : 11);   // le tournoi se joue en sets de 11 ou de 7 points
let WIN = fmt.win;                               // sets gagnants du match en cours (le tournoi l'impose)
let amicalId = botParId(lire("adversaire")) ? lire("adversaire") : "tictac";   // un adversaire proche du niveau de départ (1200)
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
let duelsUI = null, cerclesUI = null, sngUI = null, rapideUI = null, jetonsUI = null, freerollUI = null, defisUI = null;
let monClassement = null, mesDuelsOfficiels = 0;
// « Niveau officiel : 1232 ? · provisoire, encore 9 duels de calibrage »
const texteNiveauFiche = (points, joues) => `Niveau officiel : ${texteNiveau(points, joues)}` +
  (provisoire(joues) ? ` · provisoire, encore ${10 - joues} duel${10 - joues > 1 ? "s" : ""} de calibrage` : "");   // niveau officiel (duels entre humains), connu une fois connecté
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
    note("Tu dois entendre un coup de raquette puis des applaudissements. Si ce n'est pas le cas, vérifie le volume et le mode silencieux. Les voix (arbitre, commentateurs, speaker) sont coupées en attendant les vrais enregistrements : leurs annonces s'affichent par écrit.");
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
// Des répliques affichées par écrit, chacune avec l'icône de qui parle.
function afficherRepliques(el, lignes) {
  el.textContent = "";
  lignes.forEach(l => { const d = document.createElement("div"); d.className = l.role; d.textContent = l.texte; el.append(d); });
  el.hidden = !lignes.length;
}

// ---------------------------------------------------------------- panneaux
let panneauGo = null;
function ouvrirPanneau({ kick = "", big = "", bigCls = "", sc = "", tally = "", com = "", next = "", go, onGo, resteOuvert = false }) {
  $("iKick").textContent = kick; $("iBig").textContent = big; $("iBig").className = "big " + bigCls;
  $("iSc").textContent = sc; $("iTally").textContent = tally; $("iNext").textContent = next;
  afficherRepliques($("iCom"), com || []);
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
  ambiance.calmer(true);                                   // l'échange commence : le public baisse la voix
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

// Solo : décompte « 3, 2, 1 » avant le premier coup de chaque set, comme en duel.
const DECOMPTE_S = 3;
function decompteSolo() {
  const seance = S;
  S.occupe = true; boutons(false); arreterMinuteur(); $("bar").style.transform = "scaleX(1)"; $("timer").classList.remove("urgent");
  let n = DECOMPTE_S;
  const pas = () => {
    if (S !== seance) return;                               // match abandonné entre-temps
    if (n > 0) { $("verdict").textContent = `Premier coup dans ${n}…`; n--; S.decompte = setTimeout(pas, 1000); return; }
    $("verdict").textContent = "À toi de jouer !";
    S.occupe = false; boutons(true); lancerMinuteur();
  };
  pas();
}
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
  const signeBot = choisirCoup(OPP, histBot, Math.random, contexteBot(m));
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
  const a = annoncerCoup(m, evt, S.annonces, { recents: S.suivi.recents, auto: !!auto[0] });
  (S.citations ||= []).push(...a.lignes.filter(l => l.role !== "arbitre"));   // pour « La Une »
  // Balle de match sauvée : le cri de fin de set sera plus fort.
  if (evt.balleAvant?.type === "match" && evt.gagnant !== null && evt.gagnant !== evt.balleAvant.joueur) (S.sauvee ||= [false, false])[evt.gagnant] = true;
  const sauvee = evt.finSet && !!S.sauvee?.[evt.gagnant];
  if (evt.finSet) S.sauvee = [false, false];
  if (silencieux) return evt;

  // Le public : il reprend entre les points, « ooh » sur un point disputé, brouhaha avant une balle de set ou de match.
  ambiance.calmer(false);
  const rp = reactionsPublic(evt, egalitesAvantDernier(m.coups));
  if (rp.ooh) ambiance.ooh();
  if (rp.tension) setTimeout(() => ambiance.tension(), 500);
  // Le cri du vainqueur du set (ou du match) ; les commentateurs réagissent parfois.
  const cel = evt.finSet ? { ...celebration(criDe(evt.gagnant), { finMatch: m.termine, sauvee }), joueur: evt.gagnant } : null;
  if (cel && commenterCri(S.criCommente, cel)) {
    S.criCommente = true;
    const reaction = ligneDialogue("cri", 0), i = a.lignes.findIndex(l => l.role !== "arbitre");
    a.lignes.splice(i < 0 ? a.lignes.length : i, 0, ...reaction);
    a.dialogue.unshift(...reaction);
  }

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

  if (m.termine) { S.dialogueFin = a.dialogue; setTimeout(() => criEnGrand(cel, () => poigneeDeMain(finir)), 600); return evt; }
  if (cel) setTimeout(() => criEnBulle(cel), 250);
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
      com: a.dialogue,
      next: suivant.texte.replace(/\.$/, ""),
      go: `Lancer le ${decisif ? "set décisif" : ORD[n].toLowerCase() + " set"}`,
      resteOuvert: !!S.duel,
      onGo: S.duel ? duelPret : () => { nouveauSet(); decompteSolo(); },
    });
      if (S.duel) majBoutonsPret();
    }, cel ? 2400 : 1200);                                  // on laisse le temps de voir le cri
    return evt;
  }
  setTimeout(() => {
    if (S.duel) { duelReprendre(); return; }
    S.occupe = false; boutons(true); lancerMinuteur();
  }, 900);
  return evt;
}

// ---------------------------------------------------------------- célébrations (le cri du vainqueur)
// joueur 0 : moi ; 1 : l'adversaire (humain : son cri choisi dans sa fiche ; bot : le sien).
const criDe = g => (g === 0 ? P.cri : OPP.humain ? criValide(OPP.fiche?.cri) : (S.criBot ||= criDuBot(OPP.id, P.cri)));
const avDe = g => (g === 0 ? P.av : OPP.av);
const poingDe = g => avatarSVG({ ...avDe(g), symbole: "pierre" });   // le gant qui serre le poing
let bulleT = 0;
function criEnBulle(cel) {
  const b = $("criBulle"); clearTimeout(bulleT);
  $("criPoing").innerHTML = poingDe(cel.joueur); $("criTexte").textContent = cel.texte;
  b.className = "cri-bulle" + (cel.joueur === 1 ? " adv" : "") + (cel.fort ? " fort" : "");
  b.setAttribute("aria-label", `${cel.joueur === 0 ? "Toi" : OPP.nom} : ${cel.silence ? "le poing serré, en silence" : cel.texte}`);
  b.hidden = false;
  bulleT = setTimeout(() => { b.hidden = true; }, 2300);
}
// Fin du match : le cri en grand, avec des confettis aux couleurs du gant.
function criEnGrand(cel, apres) {
  const seance = S, ov = $("celebration"), vite = reduitMouvement();
  if (!cel) { apres(); return; }
  const couleurs = couleursConfettis(avDe(cel.joueur)), hasard = (a, b) => a + Math.random() * (b - a);
  $("celAv").innerHTML = poingDe(cel.joueur); $("celCri").textContent = cel.texte;
  ov.style.setProperty("--c", couleurs[0]); ov.classList.toggle("fort", cel.fort);
  ov.setAttribute("aria-label", `${cel.joueur === 0 ? "Toi" : OPP.nom} : ${cel.silence ? "le poing serré, en silence" : cel.texte}`);
  $("celConfettis").innerHTML = vite ? "" : Array.from({ length: cel.fort ? 90 : 60 }, (_, i) =>
    `<i style="left:${hasard(0, 100).toFixed(1)}%;background:${couleurs[i % couleurs.length]};--d:${hasard(1.8, 3.2).toFixed(2)}s;--r:${hasard(0, 0.7).toFixed(2)}s;--x:${Math.round(hasard(-80, 80))}px;--t:${Math.round(hasard(360, 900))}deg"></i>`).join("");
  $("criBulle").hidden = true; ov.hidden = false;
  setTimeout(() => { ov.hidden = true; $("celConfettis").innerHTML = ""; if (S === seance) apres(); }, vite ? 1500 : 2600);
}

// ---------------------------------------------------------------- affichage du match
function render() {
  const m = S.match;
  majModeMatch();
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
  else if (pointDecisif(m)) { st.textContent = `Point décisif : le prochain point gagne le ${m.sets[0] === m.format.setsGagnants - 1 && m.sets[1] === m.format.setsGagnants - 1 ? "match" : "set"}`; st.classList.add("hot"); }
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
    : m.format.setsGagnants === 1 ? `${gagne ? "Victoire" : "Défaite"} ${m.scoresSets[0]?.join("–") ?? ""}`
    : `${gagne ? "Victoire" : "Défaite"} ${m.sets[0]} sets à ${m.sets[1]}`;
  const egalites = c.filter(x => x.gagnant === null).length;
  $("endLine").textContent = n ? `Sets : ${m.scoresSets.map(([a, b]) => `${a}–${b}`).join(", ") || "aucun terminé"}. ${n} coups joués, dont ${egalites} égalité${egalites > 1 ? "s" : ""}. Ta répartition :` : "Aucun coup joué.";
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
  afficherRepliques($("endVoix"), S.dialogueFin || []);
  $("endRead").textContent = `Ton coup était prévisible ${Math.round(100 * (S.suivi.taux || 0))} % du temps.${habitude}`;
  $("end").hidden = false;
  $("bar").style.transform = "scaleX(0)";

  const enTournoi = !!(S.tour !== null && T && !S.duel);
  if (enTournoi) { enregistrerMonMatch(T, gagne, m.sets); sauverT(); }
  // Un duel compte dans la fiche (statistiques, historique, titres) mais pas dans le niveau.
  const nouveaux = n ? enregistrerMatch(P, {
    match: m, stats: S.stats, devines: S.suivi.devines, lisibles: S.suivi.lisibles,
    adversaire: { id: OPP.id, elo: OPP.elo, nom: S.duel ? `${OPP.nom}#${OPP.numero}` : OPP.nom },
    finaleTournoi: enTournoi && tourDe(T, S.tour).finale, compteNiveau: !S.duel,
    abandon: !!special && !gagne, officiel: !!(S.duel && D?.duel?.classe), niveauMoi: monClassement ?? 1200, niveauAdv: OPP.classement ?? 1200,
    finaleEnLigne: !!(S.duel && D?.tourVoix === "finale"), sitAndGo: !!(S.duel && D?.direct),
  }) : [];
  sauverP(); rafraichirAvatars(); afficherBilan();
  // « La Une » : on garde de quoi raconter ce match.
  S.pourUne = n && !special ? {
    etape: S.contreBotRapide ? "Partie rapide contre un bot" : S.duel && D?.duel?.rapide ? `Partie rapide ${D.duel.classe ? "officielle" : "éclair"}` : S.duel ? (D?.duel?.tournoi_id ? (D.tourVoix === "finale" ? "Finale du tournoi" : "Tournoi en ligne") : D?.duel?.classe === false ? "Duel amical" : "Duel officiel")
      : enTournoi ? `${tourDe(T, S.tour).singulier} du HandSlam Open` : "Match d'entraînement",
    finale: !!S.annonces.finale, numero: P.matchs,
  } : null;
  $("btnUne").hidden = !S.pourUne;
  $("again").hidden = enTournoi || !!S.duel; $("tNext").hidden = !enTournoi;
  const tournoiId = S.duel && D ? D.duel.tournoi_id : null;   // match de tournoi en ligne
  const rapide = !!(S.duel && D?.duel?.rapide) || !!S.contreBotRapide;
  $("revanche").hidden = !S.duel || !!tournoiId; $("retourDuels").hidden = !S.duel || !!tournoiId || rapide; $("revanche").disabled = false;
  $("encoreRapide").hidden = !rapide;
  if (S.contreBotRapide) $("again").hidden = true;
  $("voirTournoi").hidden = !tournoiId;
  $("signalerZone").hidden = !(S.duel && OPP.humain);
  if (!S.duel) $("endClassement").hidden = true;
  $("abandonDuelZone").hidden = true;
  if (enTournoi) $("tNext").textContent = gagne ? (tourDe(T, S.tour).finale ? "Voir le palmarès" : "Continuer le tournoi") : "Voir la suite du tournoi";
  $("news").textContent = nouveaux.length ? "Nouveau titre : " + nouveaux.map(t => t.nom + (t.debloque ? ` (débloque ${t.debloque})` : "")).join(", ") + " !" : "";
  // Duel à mise : ce qu'on gagne ou perd (le serveur a déjà réglé les jetons).
  if (S.duel && D?.duel?.mise) {
    $("news").textContent = `${gagne ? `🪙 +${gainDuel(D.duel.mise)} jetons` : `🪙 −${D.duel.mise} jetons`}. ${$("news").textContent}`.trim();
    setTimeout(() => jetonsUI?.rafraichir(), 1500);
  }
  // Les défis du jour avancent.
  defisUI?.match({ gagne, coups: n, ballesSauvees: S.stats.ballesSauvees, meilleureSerie: S.stats.meilleureSerie, scoresSets: m.scoresSets,
    pointsParSet: m.format.pointsParSet, duel: !!S.duel, termineAuScore: !!S.duel && !special, eloBot: S.duel ? 0 : OPP.elo });
  // Une victoire contre un bot rapporte quelques jetons (avec un compte).
  if (n && gagne && !S.duel) jetonsUI?.gagnerEntrainement().then(g => { if (g) $("news").textContent = `🪙 +${g} jetons. ${$("news").textContent}`.trim(); });
  $("end").scrollIntoView({ behavior: reduitMouvement() ? "auto" : "smooth", block: "start" });
  // Après une finale (tournoi solo ou en ligne) : l'interview du journaliste.
  if (n && !special && S.annonces.finale) setTimeout(() => ouvrirInterview(gagne), 2500);
}

// ---------------------------------------------------------------- la poignée de main
// 3 secondes pour choisir (sinon, mon style habituel), puis une courte animation, puis l'écran de fin.
// Contre un humain, on envoie son choix et on attend un peu celui de l'adversaire (sinon, son style habituel).
function poigneeDeMain(apres) {
  const seance = S;
  if (!S || (S.duel && (!D || D.finSpeciale))) { apres(); return; }
  const ov = $("poignee"), scene = $("pmScene"), choix = $("pmChoix");
  $("pmMoi").innerHTML = avatarSVG(P.av); $("pmAdv").innerHTML = avatarSVG(OPP.av);
  $("pmStyleMoi").textContent = ""; $("pmStyleAdv").textContent = ""; $("pmCom").textContent = "";
  scene.className = "pm-scene"; choix.hidden = false; $("pmTemps").hidden = false;
  choix.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.s === P.poignee)));
  const barre = $("pmTemps"); barre.classList.remove("court"); void barre.offsetWidth; barre.classList.add("court");
  ov.classList.add("show");
  let fait = false, fini = false;
  const terminer = () => { if (fini) return; fini = true; ov.classList.remove("show"); ov.onclick = null; if (S === seance) apres(); };
  const minuterie = setTimeout(() => choisir(P.poignee), DELAI_CHOIX_MS);
  async function choisir(style) {
    if (fait) return; fait = true; clearTimeout(minuterie);
    style = styleValide(style);
    choix.hidden = true; $("pmTemps").hidden = true;
    compterPoignee(P, style, S.match.vainqueur === 1); sauverP(); defisUI?.poignee(style);
    let adv;
    if (S.duel && D) adv = await styleAdversaire(style);
    else adv = styleDuBot(OPP.id, style);
    montrer(style, adv);
  }
  function montrer(moi, adv) {
    const r = rencontre(moi, adv), ligne = CATALOGUE.get(r.ligne);
    $("pmStyleMoi").textContent = `${STYLES[moi].icone} ${STYLES[moi].nom}`;
    $("pmStyleAdv").textContent = `${STYLES[adv].icone} ${STYLES[adv].nom}`;
    $("pmMain").textContent = "🤝";
    scene.classList.add("go", r.animation);
    if (ligne) { $("pmCom").innerHTML = ""; afficherRepliques($("pmCom"), [ligne]); setTimeout(() => voix.dire([ligne]), 500); }
    (S.citations ||= []).push(...(ligne && ligne.role !== "arbitre" ? [ligne] : []));
    ov.onclick = terminer;                                   // toucher l'écran : on passe
    setTimeout(terminer, reduitMouvement() ? 1200 : 2400);
  }
  choix.onclick = e => { const b = e.target.closest("button[data-s]"); if (b) choisir(b.dataset.s); };
}
// Duel : j'envoie ma poignée de main, puis je regarde (jusqu'à ~2 s) si l'adversaire a choisi.
async function styleAdversaire(moi) {
  const id = D.id, sa = D.moi === 0 ? "poignee1" : "poignee0";
  const habituel = styleValide(OPP.fiche?.poignee);
  try {
    let d = await serveur.serrerLaMain(id, moi);
    for (let k = 0; !d?.[sa] && k < 3; k++) { await new Promise(ok => setTimeout(ok, 700)); d = await serveur.lireDuel(id); }
    return d?.[sa] ? styleValide(d[sa]) : habituel;
  } catch { return habituel; }
}

// ---------------------------------------------------------------- images à partager (La Une, la carte)
// Aperçu, bouton « Partager » (si le téléphone sait partager une image) et lien « Enregistrer ».
async function preparerPartage(canvas, { img, partager, enregistrer, msg, fichier, alt, titre }) {
  const blob = await new Promise(ok => canvas.toBlob(ok, "image/png"));
  if (img.dataset.url) URL.revokeObjectURL(img.dataset.url);
  const url = URL.createObjectURL(blob), f = new File([blob], fichier, { type: "image/png" });
  img.dataset.url = url; img.src = url; img.alt = alt; enregistrer.href = url;
  const ok = !!navigator.canShare?.({ files: [f] });
  partager.hidden = !ok;
  msg.textContent = ok ? "" : "Enregistre l'image, puis partage-la depuis ta galerie.";
  partager.onclick = async () => {
    try { await navigator.share({ files: [f], title: titre }); }
    catch (e) { if (e?.name !== "AbortError") msg.textContent = "Le partage n'a pas marché : enregistre l'image, puis partage-la depuis ta galerie."; }
  };
}

// ---------------------------------------------------------------- La Une
$("btnUne").addEventListener("click", async () => {
  const u = S?.pourUne; if (!u) return;
  const m = S.match, unSet = m.format.setsGagnants === 1;
  const sn = surnomDe(P).texte, snAdv = OPP.humain ? OPP.surnom?.texte : null;
  const moi = { nom: nomAffiche(P), surnom: sn, legende: sn, genre: P.genre, av: avatarSVG(P.av) };
  const adv = { nom: OPP.nom, surnom: snAdv, legende: snAdv || OPP.style, genre: OPP.genre, av: avatarSVG(OPP.av) };
  const h = histoireDuMatch(m, S.stats, moi, adv, { etape: u.etape, finale: u.finale, citations: S.citations || [] });
  $("uneMsg").textContent = "Impression en cours…"; $("uneImg").removeAttribute("src");
  $("une").classList.add("show");
  const adresse = (location.host + location.pathname).replace(/index\.html$/, "").replace(/preview\/$/, "");
  const canvas = await dessinerUne(document.createElement("canvas"), h, { moi, adv }, {
    sets: unSet ? m.scoresSets[0].join(" – ") : `${m.sets[0]} – ${m.sets[1]}`,
    detail: unSet ? "Set unique" : m.scoresSets.map(([a, b]) => `${a}–${b}`).join(" · "),
    numero: u.numero, date: new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }), adresse,
  });
  await preparerPartage(canvas, { img: $("uneImg"), partager: $("unePartager"), enregistrer: $("uneEnregistrer"), msg: $("uneMsg"),
    fichier: "la-une.png", alt: `La Une : ${h.titre}. ${h.chapo}`, titre: MARQUE.journal });
});
$("uneFermer").addEventListener("click", () => $("une").classList.remove("show"));

// ---------------------------------------------------------------- la carte de joueur (Ma fiche)
let carteT = 0, carteJeton = 0;
function renderCarte() {
  clearTimeout(carteT);
  carteT = setTimeout(async () => {
    const jeton = ++carteJeton;
    const c = carteDe(P, { niveauOfficiel: monClassement, provisoire: monClassement !== null && provisoire(mesDuelsOfficiels), surnom: surnomDe(P).texte, titre: P.matchs ? dernierTitre(P) : "" });
    const canvas = await dessinerCarte(document.createElement("canvas"), c, { nom: nomAffiche(P), numero: P.numero, drapeau: P.drapeau, av: avatarSVG(P.av) });
    if (jeton !== carteJeton) return;
    $("carteRarete").textContent = texteRang(c.rang);
    $("carteNotes").innerHTML = notesDe(P).map(n => `<li><b>${n.code} ${n.valeur}</b> · ${esc(n.nom)} : ${esc(n.aide)}</li>`).join("");
    await preparerPartage(canvas, { img: $("carteImg"), partager: $("cartePartager"), enregistrer: $("carteEnregistrer"), msg: $("carteMsg"),
      fichier: "ma-carte.png", alt: `Carte de joueur de ${nomAffiche(P)} : ${c.typeNiveau.toLowerCase()} ${c.niveau}, ${c.notes.map(n => `${n.nom} ${n.valeur}`).join(", ")}.`, titre: MARQUE.nom });
  }, 250);
}

// ---------------------------------------------------------------- interview d'après-finale
function ouvrirInterview(gagne) {
  const iv = interview(gagne);
  $("ivChamp").textContent = iv.champion ? `📣 ${iv.champion.texte}` : "";
  $("ivQ").textContent = iv.question.texte;
  $("ivRep").innerHTML = iv.reponses.map((r, i) => `<button data-i="${i}">${esc(r)}</button>`).join("");
  $("ivRep").hidden = false; $("ivMoi").hidden = true; $("ivFin").hidden = true; $("ivGo").hidden = true;
  $("ivRep").onclick = e => {
    const b = e.target.closest("button[data-i]"); if (!b) return;
    $("ivRep").hidden = true;
    $("ivMoi").textContent = iv.reponses[+b.dataset.i]; $("ivMoi").hidden = false;
    $("ivFin").textContent = iv.conclusion.texte; $("ivFin").hidden = false;
    $("ivGo").hidden = false; $("ivGo").focus();
    voix.dire([iv.conclusion]);
  };
  $("interview").classList.add("show");
  voix.dire([iv.champion, iv.question].filter(Boolean));
}
$("ivGo").addEventListener("click", () => $("interview").classList.remove("show"));

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
  voix.arreter(); arreterMinuteur(); if (S) clearTimeout(S.decompte);
  const mm = monMatch(T);
  if (mm) { WIN = tourDe(T).sets; OPP = botParId(mm.a === "moi" ? mm.b : mm.a); }
  else if (!T) { WIN = fmt.win; OPP = botParId(amicalId); }
  S = {
    match: nouveauMatch({ pointsParSet: T ? lenTournoi() : fmt.len, setsGagnants: WIN }),
    stats: nouvellesStats(), annonces: nouvelEtatAnnonces({ genre: P.genre }), suivi: new Suivi(),
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
  $("band").innerHTML = `<div class="idle">Les annonces de l'arbitre et des commentateurs s'afficheront ici.</div>`; $("band").classList.remove("stale");
  $("tape").innerHTML = `<p class="empty">Les coups apparaîtront ici. Observe-les : ton adversaire le fait.</p>`;
  $("read").textContent = "L'analyse de ton jeu démarre au premier coup.";
  $("end").hidden = true; $("bar").style.transform = "scaleX(1)"; $("timer").classList.remove("urgent"); $("criBulle").hidden = true;
  render(); $("status").textContent = "Choisis ton premier coup";
  boutons(false); afficherBilan(); window.scrollTo(0, 0);
  $("revanche").hidden = true; $("retourDuels").hidden = true; $("encoreRapide").hidden = true; $("abandonDuelZone").hidden = true; $("signalerZone").hidden = true;
}

function renderFormat() {
  document.querySelectorAll("#segLen button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.v === fmt.len)));
  document.querySelectorAll("#segWin button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.v === fmt.win)));
  // Durée : coups par set (égalités comprises), du plus court au plus long match possible.
  const parSet = { 11: 20, 7: 12, 3: 5, 1: 1.5 }[fmt.len], w = fmt.win;
  const arrondi = x => (x >= 20 ? Math.round(x / 5) * 5 : Math.max(1, Math.round(x)));
  const court = arrondi(w * parSet), long = arrondi((2 * w - 1) * parSet * 1.25);
  const officiel = fmt.len === 11;
  $("fmtHint").textContent = `${texteFormat({ pointsParSet: fmt.len, setsGagnants: w })}${officiel ? " (format officiel)" : ""}, environ ${court} à ${long} coups.${officiel ? "" : " Tu peux revenir au format officiel dans les Options (⚙️)."}`;
  $("ruleTxt").textContent = texteFormat({ pointsParSet: T ? lenTournoi() : fmt.len, setsGagnants: WIN });
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
let minuteriesIntro = [], voixIntro = 0;
function ouvrirFaceAFace() {
  $("startCard").hidden = true; $("tourCard").hidden = true;
  try { ambiance.initialiser(); } catch { /* le match se joue aussi sans son */ } // geste de l'utilisateur : le son peut démarrer
  const pr = presentation(P, OPP, { tour: S.tour !== null && T ? tourDe(T, S.tour).singulier : null, pointsParSet: S.match.format.pointsParSet, setsGagnants: WIN, classementMoi: monClassement, classe: D?.duel?.classe !== false, tournoi: !!D?.duel?.tournoi_id });
  $("foGo").disabled = false; $("foGo").textContent = "Commencer";
  $("foPasser").disabled = false; $("foPasser").textContent = "Passer ⏭"; $("foPasser").classList.remove("appel"); $("foAttente").hidden = true;
  $("foBack").textContent = S.duel ? "Abandonner le duel" : "Retour";
  $("foStage").textContent = pr.bandeau; $("foFmt").textContent = pr.format;
  if (D?.duel?.mise) $("foFmt").textContent += ` · 🪙 mise de ${D.duel.mise} jetons, le gagnant en remporte ${gainDuel(D.duel.mise)}`;
  if (S.contreBotRapide) $("foStage").textContent = "Partie rapide · 🤖 contre un bot";
  else if (D?.duel?.rapide) $("foStage").textContent = `Partie rapide ${D.duel.classe ? "officielle" : "éclair"}`;
  $("foAvMe").innerHTML = avatarSVG(P.av); $("foAvBot").innerHTML = avatarSVG(OPP.av);
  $("foNameMe").textContent = pr.joueur.nom; $("foSubMe").textContent = pr.joueur.sous; $("foRecMe").textContent = pr.joueur.bilan;
  $("foNameBot").textContent = pr.adversaire.nom; $("foSubBot").textContent = pr.adversaire.sous; $("foRecBot").textContent = pr.adversaire.bilan;
  const cellule = (texte, n, adv) => `<span class="${adv ? "adv" : ""}${n === undefined && texte.length > 3 ? " txt" : ""}"${n !== null && n !== undefined ? ` data-n="${n}"` : ""}>${esc(texte)}</span>`;
  $("foRows").innerHTML = pr.lignes.map((l, i) => `<div class="fo-row" style="--i:${i}">${cellule(l.g, l.gn, l.avantage === "g")}<span>${l.label}</span>${cellule(l.d, l.dn, l.avantage === "d")}</div>`).join("");
  $("foKey").innerHTML = `${esc(pr.cle)} Tu joues <b>côté jaune</b>.`;
  $("foSurMe").textContent = surnomDe(P).texte;
  $("foSurBot").textContent = OPP.humain && OPP.surnom ? OPP.surnom.texte : "";
  if (!S.duel) S.annonces.finale = S.tour !== null && !!T && tourDe(T, S.tour).finale;
  presenterSpeaker();

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
// Le speaker présente les joueurs (et les commentateurs lancent le match), par écrit et à voix haute.
function presenterSpeaker() {
  const f = P.faceAFace[OPP.id], humain = !!OPP.humain;
  const niveauMoi = humain ? monClassement ?? 1200 : P.elo, niveauAdv = humain ? OPP.classement ?? 1200 : OPP.elo;
  const monId = `h:${compteUI.session()?.user?.id}`;
  let recents = []; try { recents = lire("speakerRecents", []) || []; } catch { /* rien */ }
  const av = annoncesAvantMatch({
    moi: { surnom: surnomDe(P), genre: P.genre, etiquette: etiquetteDe(P, { advId: OPP.id, niveauMoi, niveauAdv }) },
    adv: humain ? { surnom: OPP.surnom, genre: OPP.genre, etiquette: etiquetteDe(OPP.fiche, { advId: monId, niveauMoi: niveauAdv, niveauAdv: niveauMoi }) } : { bot: OPP.id },
    tour: S.duel ? D?.tourVoix ?? null : S.tour !== null && T ? tourDe(T, S.tour).cle : null, sng: !!(S.duel && D?.sng),
    humain, domination: !!(f && f.d >= f.v + 3), genre: P.genre,
    situations: situationsDuMatch({
      humain, dejaJoues: !!(f && f.v + f.d > 0), niveauMoi, niveauAdv, memePays: humain && OPP.drapeau === P.drapeau,
      rapide: !!(D?.duel?.rapide || S.contreBotRapide), officiel: !!(S.duel && D?.duel?.classe), setsGagnants: S.match.format.setsGagnants,
    }),
    recents,
  });
  // On retient les phrases dites, pour ne pas les répéter aux prochains matchs.
  ecrire("speakerRecents", [...av.speaker, ...av.commentaires].map(l => l.id).concat(recents).slice(0, 80));
  const el = $("foSpeaker"); el.textContent = "";
  const sp = document.createElement("div"); sp.className = "speaker"; sp.textContent = av.speaker.map(l => l.texte).join(" "); el.append(sp);
  av.commentaires.forEach(l => { const d = document.createElement("div"); d.className = l.role; d.textContent = l.texte; el.append(d); });
  clearTimeout(voixIntro);
  voixIntro = setTimeout(() => { if (faceAFaceOuvert && !S.passe) voix.dire([...av.speaker, ...av.commentaires]); }, reduitMouvement() ? 0 : 1300);
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
  commencerSolo();
});
function commencerSolo() {
  $("faceoff").classList.remove("show"); faceAFaceOuvert = false;
  S.enJeu = true; majModeMatch();
  $("status").textContent = "Set 1, coup 1";
  annoncer([annonceDebutSet(S.match)]);
  decompteSolo();
}
// « Passer » : on coupe le speaker. Contre un bot, le match commence tout de suite ;
// en duel, il faut que les deux joueurs aient appuyé (le serveur lance le match).
$("foPasser").addEventListener("click", () => {
  if (!faceAFaceOuvert) return;
  S.passe = true; voix.arreter(); clearTimeout(voixIntro);
  $("faceoff").classList.add("vite"); minuteriesIntro.splice(1).forEach(clearTimeout);
  if (S.duel) { try { ambiance.initialiser(); } catch { /* sans son */ } duelPret(); return; }
  commencerSolo();
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

// Mon surnom : un nom et un complément, parmi ceux débloqués ; « il » ou « elle ».
function renderSurnom() {
  const sn = surnomDe(P), noms = debloques(NOMS, P), comps = debloques(COMPLEMENTS, P);
  $("surnomApercu").textContent = sn.texte;
  $("inSurnomNom").innerHTML = noms.map(x => `<option value="${x.id}"${x.id === sn.nom.id ? " selected" : ""}>${esc(x.t)}</option>`).join("");
  $("inSurnomComp").innerHTML = comps.map(x => `<option value="${x.id}"${x.id === sn.complement.id ? " selected" : ""}>${esc(x.t)}</option>`).join("");
  $("surnomCompte").textContent = `${noms.length} nom${noms.length > 1 ? "s" : ""} sur ${NOMS.length} et ${comps.length} complément${comps.length > 1 ? "s" : ""} sur ${COMPLEMENTS.length} débloqués.`;
  // Ce qu'il reste à débloquer, et comment.
  const restants = [...aDebloquer(NOMS, P), ...aDebloquer(COMPLEMENTS, P)];
  $("surnomVerrouTitre").textContent = `Surnoms à débloquer (${restants.length})`;
  const bloc = (titre, liste) => liste.length ? `<p class="lbl">${titre}</p><ul>${liste.map(x => `<li><b>${esc(x.t)}</b> · ${esc(x.aide)}</li>`).join("")}</ul>` : "";
  $("surnomVerrou").innerHTML = bloc("Noms", aDebloquer(NOMS, P)) + bloc("Compléments", aDebloquer(COMPLEMENTS, P));
  document.querySelectorAll("#segGenre button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === P.genre)));
  document.querySelectorAll("#segPoignee button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === P.poignee)));
  $("inCri").innerHTML = CRIS.map(c => `<option value="${c.id}"${c.id === P.cri ? " selected" : ""}>${esc(libelleCri(c.id))}</option>`).join("");
}
const choisirSurnom = () => { P.surnom = { nom: $("inSurnomNom").value, complement: $("inSurnomComp").value }; sauverP(); renderSurnom(); };
$("inSurnomNom").addEventListener("change", choisirSurnom);
$("inSurnomComp").addEventListener("change", choisirSurnom);
document.querySelectorAll("#segGenre button").forEach(b => b.addEventListener("click", () => { P.genre = b.dataset.v; sauverP(); renderSurnom(); }));
document.querySelectorAll("#segPoignee button").forEach(b => b.addEventListener("click", () => { P.poignee = b.dataset.v; sauverP(); renderSurnom(); }));
$("inCri").addEventListener("change", e => { P.cri = criValide(e.target.value); sauverP(); });

function renderFiche() {
  renderSurnom(); renderCarte();
  $("pAv").innerHTML = avatarSVG(P.av);
  afficherNomFiche();
  $("pTitle").textContent = dernierTitre(P);
  $("pElo").textContent = `Niveau d'entraînement : ${P.elo}`;
  $("pClassement").hidden = monClassement === null; $("pClassement").textContent = monClassement === null ? "" : texteNiveauFiche(monClassement, mesDuelsOfficiels);
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
  // Le palmarès : les trophées, famille par famille.
  const obtenus = TITRES.filter(t => P.titres[t.id]).length;
  $("palmaresCompte").textContent = `${obtenus} trophée${obtenus > 1 ? "s" : ""} sur ${TITRES.length}`;
  $("badges").innerHTML = FAMILLES.map(f => {
    const liste = TITRES.filter(t => t.famille === f.id), n = liste.filter(t => P.titres[t.id]).length;
    return `<h3 class="famille">${f.icone} ${f.nom} <small>${n} / ${liste.length}</small></h3>` + liste.map(t => {
      const on = !!P.titres[t.id];
      return `<div class="badge ${on ? "on" : "off"}"><div class="bn">${on ? "🏅" : "🔒"} ${t.nom}</div><div class="bd">${t.desc}</div>${t.debloque ? `<div class="bu">Débloque ${t.debloque}</div>` : ""}</div>`;
    }).join("");
  }).join("");
  renderEditeur();
}

function renderEditeur() {
  $("avApercu").innerHTML = avatarSVG(P.av);             // l'aperçu reste visible pendant qu'on fait défiler les choix
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
  mk($("swSymbole"), "symbole", SYMBOLES, true); mk($("swBg"), "fond", FONDS); mk($("swGlove"), "gant", GANTS); mk($("swWrist"), "poignet", POIGNETS); mk($("swMotif"), "motif", MOTIFS, true); mk($("swGantMotif"), "gantMotif", MOTIFS_GANT, true);
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

// ---------------------------------------------------------------- navigation
// Trois onglets (Jouer, Cercles, Ma fiche) et la roue des Options. L'onglet « Jouer » est un menu
// qui mène aux pages Défier un ami, Sit & Go, Tournois et Entraînement (l'écran de match).
const VUES = ["viewJouer", "viewRapide", "viewMatch", "viewDuel", "viewSng", "viewFreeroll", "viewTournois", "socTournoi", "socTournoiNouveau", "viewCercles", "viewProfile", "viewOptions"];
const ONGLET_DE = { viewJouer: "jouer", viewRapide: "jouer", viewMatch: "jouer", viewDuel: "jouer", viewSng: "jouer", viewFreeroll: "jouer", viewTournois: "jouer", viewCercles: "cercles", viewProfile: "profile" };
let vueCourante = "viewJouer", avantOptions = "viewJouer";
function aller(vue) {
  if (!VUES.includes(vue)) return;
  if (vue === "viewOptions" && vueCourante !== "viewOptions") avantOptions = vueCourante;
  if (vueCourante === "viewRapide" && vue !== "viewRapide") rapideUI?.quitterEcran();   // la recherche demande de rester sur l'écran
  if (vue === "viewRapide") rapideUI?.rafraichir();
  VUES.forEach(v => { $(v).hidden = v !== vue; });
  vueCourante = vue;
  const onglet = ONGLET_DE[vue];
  if (onglet || vue === "viewOptions") document.querySelectorAll(".tabs button").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.v === onglet)));
  $("lenLock").hidden = true;
  if (vue === "viewProfile") renderFiche();
  if (vue === "viewDuel") duelsUI?.rafraichir();
  if (vue === "viewCercles" || vue === "viewTournois") cerclesUI?.rafraichir();
  if (vue === "viewSng") sngUI?.rafraichir();
  if (vue === "viewJouer") { jetonsUI?.rafraichir(); defisUI?.rafraichir(); }
  if (vue === "viewFreeroll") freerollUI?.rafraichir();
  window.scrollTo(0, 0);
}
document.querySelectorAll(".tabs button").forEach(b => b.addEventListener("click", () => aller({ jouer: "viewJouer", cercles: "viewCercles", profile: "viewProfile" }[b.dataset.v])));
document.addEventListener("click", e => { const b = e.target.closest("[data-aller]"); if (b) aller(b.dataset.aller); });
$("btnOptions").addEventListener("click", () => aller(vueCourante === "viewOptions" ? avantOptions : "viewOptions"));
$("optionsRetour").addEventListener("click", () => aller(avantOptions));

// Les alertes en haut du menu « Jouer » (et la pastille de l'onglet).
const alertes = { duels: { recus: 0, enCours: 0 }, tournois: [], sng: null, freeroll: null };
function signaler(cle, valeur) { alertes[cle] = valeur; renderAlertes(); }
function renderAlertes() {
  const a = alertes, carte = (attr, icone, titre, texte) => `<button class="hub alerte" ${attr}><span class="hub-i">${icone}</span><span><b>${titre}</b><small>${texte}</small></span></button>`;
  $("hubAlertes").innerHTML = [
    a.duels.enCours ? carte('data-aller="viewDuel"', "▶️", "Duel en cours", "Touche pour le reprendre") : "",
    a.duels.recus ? carte('data-aller="viewDuel"', "📨", `${a.duels.recus} défi${a.duels.recus > 1 ? "s" : ""} reçu${a.duels.recus > 1 ? "s" : ""}`, "Accepte ou refuse") : "",
    ...a.tournois.map(t => carte(`data-tournoi="${t.id}"`, "🏆", "Ton match de tournoi t'attend", esc(t.nom))),
    a.freeroll ? carte('data-aller="viewFreeroll"', "🌙", a.freeroll.phase === "en_cours" ? "Le freeroll est en cours" : "Le freeroll commence à 20 h", "Garde l'appli ouverte : ton match se lance tout seul") : "",
    a.sng ? carte('data-aller="viewSng"', "⚡", a.sng.phase === "inscriptions" ? "Tu es en salle de Sit & Go" : "Ton Sit & Go est en cours", "Garde l'appli ouverte") : "",
  ].join("");
  const n = a.duels.recus + a.tournois.length;
  $("pastilleJouer").hidden = !n; $("pastilleJouer").textContent = n;
}
$("hubAlertes").addEventListener("click", e => { const b = e.target.closest("[data-tournoi]"); if (b) cerclesUI.ouvrirTournoi(b.dataset.tournoi); });

// Pendant un match, l'écran de jeu prend toute la place (pas d'onglets).
function majModeMatch() {
  const enMatch = !!(S && S.enJeu && !S.match.termine);
  document.body.classList.toggle("en-match", enMatch);
  ambiance.fond(enMatch);                                  // le murmure du public, pendant tout le match
  $("quitterSoloZone").hidden = !enMatch || !!S.duel;
}
$("quitterSolo").addEventListener("click", () => {
  if (!confirm("Quitter le match ? Il ne sera pas compté.")) return;
  nouvelleSeance();
});

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
    h += `<div class="rnd">${tourDe(T, ri).nom}</div>`;
    R.forEach(m => {
      const A = infoJoueur(m.a), B = infoJoueur(m.b), cls = x => (m.v === x ? "win" : m.v ? "lose" : ""), mien = m.a === "moi" || m.b === "moi" ? " mine" : "";
      h += `<div class="bm${mien}"><div class="bp ${cls(m.a)}"><span class="mini">${avatarSVG(A.av)}</span><span class="bn">${esc(A.nom)}</span></div><div class="bs">${m.score || "vs"}</div><div class="bp r ${cls(m.b)}"><span class="bn">${esc(B.nom)}</span><span class="mini">${avatarSVG(B.av)}</span></div></div>`;
    });
  });
  $("bracket").innerHTML = h;
  const mm = monMatch(T);
  if (T.fini) {
    $("tMsg").textContent = T.champion === "moi" ? "🏆 Tu remportes le HandSlam Open ! Le titre est à toi."
      : `🏆 ${infoJoueur(T.champion).nom} remporte le HandSlam Open.` + (T.elimine ? ` Ton parcours s'arrête en ${tourDe(T, T.tourElimination).nom.toLowerCase()}.` : "");
    $("tPlay").textContent = "Nouveau tournoi"; $("tQuit").textContent = "Retour à l'accueil";
  } else if (mm) {
    const adv = infoJoueur(mm.a === "moi" ? mm.b : mm.a);
    const tr = tourDe(T);
    $("tMsg").textContent = `${tr.singulier} contre ${adv.nom}, ${adv.style.toLowerCase()}. ${tr.sets} sets gagnants.`;
    $("tPlay").textContent = `Jouer ${tr.mon}`;
    $("tQuit").textContent = "Abandonner le tournoi";
  }
}
// Le HandSlam Open à 8 ou à 16 joueurs.
let tailleOpen = lire("tailleOpen", 8) === 16 ? 16 : 8;
const renderTailleOpen = () => document.querySelectorAll("#segOpen button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.v === tailleOpen)));
document.querySelectorAll("#segOpen button").forEach(b => b.addEventListener("click", () => { tailleOpen = +b.dataset.v; ecrire("tailleOpen", tailleOpen); renderTailleOpen(); }));
renderTailleOpen();
$("tourBtn").addEventListener("click", () => { T = nouveauTournoi(P.elo, tailleOpen); sauverT(); nouvelleSeance(); });
$("tPlay").addEventListener("click", () => {
  if (T.fini) { T = nouveauTournoi(P.elo, T.taille || tailleOpen); sauverT(); nouvelleSeance(); return; }
  const mm = monMatch(T); if (!mm) return;
  OPP = botParId(mm.a === "moi" ? mm.b : mm.a); WIN = tourDe(T).sets;
  S.match = nouveauMatch({ pointsParSet: lenTournoi(), setsGagnants: WIN });
  S.tour = T.tour; renderFormat(); render(); rafraichirAvatars(); ouvrirFaceAFace();
});
$("tQuit").addEventListener("click", () => {
  if (!T.fini && !confirm("Abandonner le tournoi en cours ?")) return;
  T = null; sauverT(); nouvelleSeance();
});
$("tNext").addEventListener("click", () => {
  terminerTour(T, lenTournoi()); if (T.elimine) while (!T.fini) terminerTour(T, lenTournoi());
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
  ouvrirFiche: () => aller("viewProfile"),
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
// Ancien nom des pages (utilisé par les modules) : match, duel, cercles, profile…
const ouvrirOnglet = v => aller({ match: "viewMatch", duel: "viewDuel", cercles: "viewCercles", profile: "viewProfile", options: "viewOptions", jouer: "viewJouer", sng: "viewSng", tournois: "viewTournois" }[v] || v);

function lancerDuel(duel, ligneAdv) {
  if (!duel || !ligneAdv) return;
  if (D && D.id === duel.id) { ouvrirOnglet("match"); majDuel(duel); return; }
  const uid = compteUI.session()?.user?.id, moi = maPlace(duel, uid);
  if (moi === null) return;
  quitterDuel({ solo: false });
  OPP = adversaireHumain(ligneAdv); WIN = duel.sets_gagnants;
  S = {
    match: nouveauMatch(formatDuel(duel)),
    stats: nouvellesStats(), annonces: nouvelEtatAnnonces({ humain: true, genre: P.genre }), suivi: new Suivi(),
    tour: null, occupe: false, enJeu: false, duel: true,
  };
  D = { id: duel.id, moi, duel, decalage: 0, mancheEnvoyee: null, presente: false, fini: false, apresPanneau: null, finSpeciale: null };
  preparerEcranMatch();
  $("startCard").hidden = true; $("tourCard").hidden = true; $("abandonDuelZone").hidden = false;
  $("ruleTxt").textContent = `Duel · ${texteFormat(formatDuel(duel))}`;
  rafraichirAvatars(); render();
  ouvrirOnglet("match");
  if (duel.tournoi_id) reperesTournoi(duel);
  D.arret = serveur.ecouter("duel", `id=eq.${duel.id}`, majDuel);
  D.boucle = setInterval(battement, 1000);
  majDuel(duel); battement();
}

// Match de tournoi en ligne : quel tour ? (le speaker l'annonce, et la finale se termine par une interview)
async function reperesTournoi(duel) {
  try {
    const t = await voirTournoi(duel.tournoi_id);
    const m = (t?.matchs || []).find(x => x.id === duel.tournoi_match);
    if (!D || D.id !== duel.id || !m) return;
    D.tourVoix = { 0: "finale", 1: "demis", 2: "quarts", 3: "huitiemes" }[t.nb_tours - m.tour] ?? null;
    D.sng = t.mode === "direct" && m.tour === 1;
    D.direct = t.mode === "direct" && !t.freeroll;   // (le trophée « Roi du Sit & Go » ne vaut pas pour le freeroll)
    S.annonces.finale = D.tourVoix === "finale";
    if (faceAFaceOuvert) presenterSpeaker();
  } catch { /* sans réseau : présentation simple */ }
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
    // Set suivant lancé par le serveur : on ferme le panneau et on reprend la main tout de suite
    // (sinon le premier coup du set pouvait partir au hasard).
    const reprise = !!panneauOuvert;
    if (panneauOuvert) { fermerPanneau(); D.apresPanneau?.(); D.apresPanneau = null; }
    S.enJeu = true; majModeMatch();
    if (!S.occupe || reprise) duelReprendre();
  } else if (duel.phase === "termine") {
    terminerDuel(duel);
  } else if (duel.phase === "annule" || duel.phase === "refuse") {
    if (duel.rapide) { quitterDuel(); aller("viewRapide"); rapideUI?.annulee(); return; }   // l'adversaire n'est jamais arrivé
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
  ambiance.calmer(true);
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
  if (faceAFaceOuvert && d.phase === "presentation") {
    const e = etatPasser(d.prets, D.moi);
    $("foGo").disabled = !!pret; if (pret) $("foGo").textContent = attente;
    $("foPasser").disabled = !!pret; $("foPasser").textContent = pret ? "En attente…" : "Passer ⏭";
    $("foPasser").classList.toggle("appel", e === "adversaire");
    $("foAttente").textContent = e === "attente" ? "En attente de l'adversaire…" : e === "adversaire" ? "L'adversaire veut passer. Appuie sur « Passer » pour commencer tout de suite." : "";
    $("foAttente").hidden = !$("foAttente").textContent;
  }
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
  let cl = texteClassementFin(duel, D.moi);
  if (cl && duel.classement_apres && provisoire(mesDuelsOfficiels)) cl += " · calibrage : ta variation compte double";
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
$("encoreRapide").addEventListener("click", () => { quitterDuel(); if (!D) nouvelleSeance(); aller("viewRapide"); });
$("voirTournoi").addEventListener("click", () => { const id = D?.duel?.tournoi_id; quitterDuel(); if (id) cerclesUI.ouvrirTournoi(id); });
$("revanche").addEventListener("click", async () => {
  const f = S.match.format, adv = OPP.uid;
  $("revanche").disabled = true;
  try {
    await serveur.creer(adv, f.pointsParSet, f.setsGagnants, D?.duel?.classe !== false, D?.duel?.mise || 0);
    quitterDuel(); ouvrirOnglet("duel");
    $("duelMsg").textContent = `Revanche proposée à ${OPP.nom} ! La partie démarre dès que ${OPP.nom} accepte.`;
  } catch (e) { $("revanche").disabled = false; $("verdict").textContent = e.message; }
});

duelsUI = installerDuels({
  compte: compteUI,
  signaler,
  lancerDuel,
  duelEnCours: () => !!D && !D.fini,
  ouvrirOnglet,
});

// ---------------------------------------------------------------- amis et cercles
cerclesUI = installerCercles({
  compte: compteUI,
  signaler, aller, vueCourante: () => vueCourante,
  ouvrirOnglet,
  defier: p => duelsUI.defier(p),
  lancerDuel,
  trophees: donnees => gagnerTrophees(accorderTitres(P, titresEnLigne(donnees))),
  surClassement: (points, joues = 0) => {
    monClassement = points; mesDuelsOfficiels = joues;
    $("pClassement").hidden = points === null;
    $("pClassement").textContent = points === null ? "" : texteNiveauFiche(points, joues);
    renderCarte();
  },
});

// Des trophées gagnés hors d'un match (cercles, tournois en ligne) : on le dit dans un bandeau.
let toastT = 0;
function gagnerTrophees(nouveaux) {
  if (!nouveaux.length) return;
  sauverP(); if (vueCourante === "viewProfile") renderFiche();
  const t = $("toast");
  t.textContent = `🏅 Nouveau trophée : ${nouveaux.map(x => x.nom + (x.debloque ? ` (débloque ${x.debloque})` : "")).join(", ")} !`;
  t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 5000);
}
$("toast").addEventListener("click", () => { $("toast").hidden = true; });

// ---------------------------------------------------------------- Sit & Go
// Partie rapide : personne n'est disponible, on joue contre le bot du niveau le plus proche (et on le dit).
function jouerBotRapide(format) {
  if (D && !D.fini) return;
  const f = FORMATS_RAPIDES[format] || FORMATS_RAPIDES.officiel;
  voix.arreter(); arreterMinuteur(); if (S) clearTimeout(S.decompte);
  OPP = botProche(P.elo, BOTS); WIN = f.setsGagnants;
  S = {
    match: nouveauMatch({ pointsParSet: f.pointsParSet, setsGagnants: f.setsGagnants }),
    stats: nouvellesStats(), annonces: nouvelEtatAnnonces({ genre: P.genre }), suivi: new Suivi(),
    tour: null, occupe: false, enJeu: false, contreBotRapide: true,
  };
  preparerEcranMatch();
  $("startCard").hidden = true; $("tourCard").hidden = true;
  $("ruleTxt").textContent = `Partie rapide contre un bot (${OPP.nom}) · ${texteFormat(S.match.format)}`;
  rafraichirAvatars(); render();
  aller("viewMatch");
  ouvrirFaceAFace();
}
const ouvrirSignalement = installerSignalement();
$("signalerAdv").addEventListener("click", () => { if (OPP?.humain) ouvrirSignalement({ id: OPP.uid, pseudo: OPP.nom, numero: OPP.numero }); });
rapideUI = installerRapide({
  compte: compteUI,
  lancerDuel,
  duelEnCours: () => !!D && !D.fini,
  jouerBot: jouerBotRapide,
});

jetonsUI = installerJetons({ compte: compteUI });
defisUI = installerDefis({ compte: compteUI, jetons: () => jetonsUI?.rafraichir() });
freerollUI = installerFreeroll({
  compte: compteUI, signaler,
  ouvrirTournoi: id => cerclesUI.ouvrirTournoi(id),
  chercherMatch: () => { if (!D || D.fini) duelsUI.rafraichir(); },
  jetons: () => jetonsUI?.rafraichir(),
});
sngUI = installerSng({
  jetons: () => jetonsUI?.rafraichir(),
  signaler,
  compte: compteUI,
  ouvrirTournoi: id => cerclesUI.ouvrirTournoi(id),
  chercherMatch: () => { if (!D || D.fini) duelsUI.rafraichir(); },   // mon match suivant est-il lancé ?
});

// ---------------------------------------------------------------- démarrage
renderAdversaires();
renderVoixInfo();
nouvelleSeance();
compteUI.surConnexion(session => { $("hubHors").hidden = !!session?.user; if (session?.user) rattacherAbonnement(); renderNotifs(); });

// ---------------------------------------------------------------- notifications
async function renderNotifs(message = "") {
  const connecte = !!compteUI.session()?.user, etat = await etatNotifications().catch(() => "indisponible");
  const b = $("btnNotifs"), m = $("notifsMsg");
  b.hidden = !connecte || etat === "indisponible" || etat === "refuse";
  b.textContent = etat === "actif" ? "Désactiver les notifications" : "Activer les notifications";
  b.classList.toggle("alt", etat === "actif");
  $("btnTestNotif").hidden = !connecte || etat !== "actif";
  m.classList.remove("erreur");
  m.textContent = message || (!connecte ? "Les notifications demandent un compte : connecte-toi dans « Ma fiche »."
    : etat === "indisponible" ? "Ce navigateur ne permet pas les notifications. Sur iPhone, ajoute d'abord l'appli à l'écran d'accueil (bouton Partager → « Sur l'écran d'accueil »)."
    : etat === "refuse" ? "Tu as refusé les notifications. Pour les réactiver : touche le cadenas à côté de l'adresse → Autorisations → Notifications."
    : etat === "actif" ? "✅ Notifications activées sur ce téléphone." : "");
}
$("btnNotifs").addEventListener("click", async () => {
  const b = $("btnNotifs"); b.disabled = true;
  try {
    const avant = await etatNotifications();
    const apres = avant === "actif" ? await desactiverNotifications() : await activerNotifications();
    await renderNotifs(apres === "actif" ? "✅ C'est fait : tu recevras une notification quand on te défie." : apres === "inactif" && avant === "actif" ? "Notifications désactivées sur ce téléphone." : "");
  } catch (e) { await renderNotifs(); $("notifsMsg").textContent = e.message; $("notifsMsg").classList.add("erreur"); }
  finally { b.disabled = false; }
});
$("btnTestNotif").addEventListener("click", async () => {
  const b = $("btnTestNotif"), m = $("notifsMsg");
  b.disabled = true; m.classList.remove("erreur"); m.textContent = "⏳ Envoi en cours… Tu peux fermer l'appli pour voir la notification arriver.";
  try { const r = await testerNotification(); m.textContent = texteTest(r); m.classList.toggle("erreur", !r.ok); }
  catch (e) { m.textContent = e.message; m.classList.add("erreur"); }
  finally { b.disabled = false; }
});
// Ouvrir l'appli depuis une notification : ?ouvrir=duels ou ?ouvrir=tournois (ou message du service worker si elle est déjà ouverte).
const ouvrirDepuisNotification = cible => { if (cible === "duels") aller("viewDuel"); else if (cible === "tournois") aller("viewTournois"); else if (cible === "freeroll") aller("viewFreeroll"); };
{
  const cible = new URLSearchParams(location.search).get("ouvrir");
  if (cible) { ouvrirDepuisNotification(cible); history.replaceState(null, "", location.pathname + location.hash); }
  navigator.serviceWorker?.addEventListener?.("message", e => ouvrirDepuisNotification(e.data?.ouvrir));
}
renderNotifs();
$("hubHors").hidden = !!compteUI.session()?.user;
