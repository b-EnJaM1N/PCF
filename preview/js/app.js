// Écran principal : relie les règles, les bots, les annonces, le son et la fiche joueur.
import { EMOJI, NOM, DUREE_COUP_MS, nouveauMatch, jouerCoup, balle, egaliteFinDeSet, pointDecisif, setDecisif, signeAuHasard, texteFormat, POINTS_PAR_SET } from "./regles.js";
import { BOTS, botParId, choisirCoup, contexteBot } from "./bots.js";
import { Suivi, indiceImprevisibilite } from "./analyse.js";
import { nouvelEtatAnnonces, annoncerCoup, annonceDebutSet, annoncesAvantMatch, interview, etiquetteDe, situationsDuMatch, niveauEnjeu, contexteJeu, baseDe, silenceAvantBalle } from "./annonces.js";
import { surnomDe, NOMS, QUALIFICATIFS, FAMILLES as FAMILLES_SURNOM, debloques, aDebloquer, monterRang, surnomAuHasard, surnomValide, texteDeblocage } from "./surnoms.js";
import { voirTournoi, mesAmis, dossierJoueur, jeSuisLa, reglerPresence, maPresenceVisible, compterVisite as envoyerVisite, compterTroisMatchs as envoyerTroisMatchs } from "./social-serveur.js";
import { compterVisite, compterTroisMatchs } from "./visites.js";
import { histoireDuMatch } from "./une-logique.js";
import { dessinerUne } from "./une.js";
import { carteDe, notesDe, texteRang, rangDe } from "./carte-logique.js";
import { dessinerCarte } from "./carte.js";
import { STYLES, DELAI_CHOIX_MS, styleValide, styleDuBot, rencontre, compterPoignee } from "./poignee.js";
import { installerRapide } from "./ecran-rapide.js";
import { installerSignalement } from "./ecran-signaler.js";
import { etatNotifications, activerNotifications, desactiverNotifications, rattacherAbonnement, testerNotification, texteTest } from "./notifications.js";
import { FORMATS_RAPIDES, botProche } from "./rapide-logique.js";
import { MARQUE } from "./marque.js";
import { nouvellesStats, suivreCoup } from "./stats-match.js";
import { TITRES, FAMILLES, accorderTitres, titresEnLigne, normaliserProfil, enregistrerMatch, remettreAZero, verrouDe, estVerrouille, gantAttendPremierMatch, nomAffiche, titresObtenus, dernierTitre, signeFavori } from "./profil.js";
import { tourDe, nouveauTournoi, monMatch, enregistrerMonMatch, terminerTour } from "./tournoi.js";
import { CIRCUITS, QUALIFIES, NOMS_TOURS, coupeApres, nouvelleCarriere, prochainMatch, enregistrerMonMatch as enregistrerCarriere, classement as classementCarriere, saisonSuivante, texteBilan, bilanCarriere, vitrine, TOURS_COUPE, texteCoupe, coupesML, titresCarriere, coupCarriere, migrerCarriere } from "./carriere-logique.js";
import { coupeSVG, bouclierSVG, coupeMLSVG } from "./coupes.js";
import { presentation, etatPasser } from "./presentation.js";
import { avatarSVG, SYMBOLES, FONDS, GANTS, POIGNETS, MOTIFS, MOTIFS_GANT, PAYS, PEAUX, ONGLES, BRACELETS, BAGUES } from "./avatar.js";
import { LecteurVoix } from "./voix/lecteur.js";
import { CATALOGUE, ligneDialogue, nbDialogues, DIALOGUES_IDS } from "./voix/script.js";
import { Ambiance, reactionsPublic, egalitesAvantDernier, reactionPoint } from "./ambiance.js";
import { CRIS, libelleCri, criValide, criDuBot, celebration, commenterCri, couleursConfettis } from "./celebrations.js";
import { lire, ecrire } from "./stockage.js";
import { messagesPossibles, momentApres, texteMessage, erreurMessageLibre, nettoyerMessage, PREFIXE_LIBRE, MESSAGE_LIBRE_MAX } from "./messages-rapides.js";
import { VERSION } from "./version.js";
import { installerCompte } from "./ecran-compte.js";
import { installerDuels } from "./ecran-duel.js";
import { installerCercles, renderFaceAFace } from "./ecran-cercles.js";
import { duelsAvec, profils as profilsEnLigne } from "./duel-serveur.js";
import { profilDepuisLigne } from "./synchro.js";
import { installerSng } from "./ecran-sng.js";
import { installerJetons } from "./ecran-jetons.js";
import { installerFreeroll } from "./ecran-freeroll.js";
import { installerProgrammes } from "./ecran-programmes.js";
import { palier, nouveautes, conseil, PREMIER_MATCH } from "./decouverte.js";
import { LANCEMENT } from "./lancement.js";
import { annonceEnjeu } from "./enjeux.js";
import { repartition, habitudes, piste, lecturesReussies, EMOJIS, compteVide, compterMatch, additionner, dossier } from "./lecture-adversaire.js";
import { FORMAT_DU_JOUR, jourParis, matchDuJour, hasardGraine, grille, serie, texteAPartager, garder } from "./match-du-jour.js";
import { installerDefis } from "./ecran-defis.js";
import { installerBoutique } from "./ecran-boutique.js";
import { GESTES, CELEBRATIONS, CADRES, gesteValide, celebrationValide, articleDe, possede } from "./catalogue.js";
import { gainDuel } from "./jetons-logique.js";
import { texteClassementFin, texteNiveau, provisoire, divisionDe, texteDivision } from "./social-logique.js";
import * as serveur from "./duel-serveur.js";
import { maPlace, coupVuDe, rejouer, coherent, adversaireHumain, tempsRestant, formatDuel, statsFaceAFace } from "./duel-logique.js";
// La version de lancement : ce qui a besoin de monde est caché pour l'instant (lancement.js).
document.body.classList.toggle("lancement", LANCEMENT.actif);

// Le caillou 🪨 est un emoji récent : certains ordinateurs (anciens Windows) l'affichent comme un point d'interrogation.
// Si l'appareil ne sait pas le dessiner en couleur, on le remplace partout par le poing ✊.
(function remplacerCaillouSiBesoin() {
  let ok = true;
  try {
    const c = document.createElement("canvas"); c.width = c.height = 24;
    const x = c.getContext("2d"); x.textBaseline = "top"; x.font = "20px sans-serif"; x.fillText("🪨", 0, 0);
    const d = x.getImageData(0, 0, 24, 24).data;
    ok = false;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0 && (Math.abs(d[i] - d[i + 1]) > 18 || Math.abs(d[i + 1] - d[i + 2]) > 18)) { ok = true; break; }
  } catch { ok = true; }
  if (ok) return;
  EMOJI[0] = "✊"; EMOJIS[0] = "✊";
  const remplacer = n => {
    if (n.nodeType === 3) { if (n.data.includes("🪨")) n.data = n.data.replaceAll("🪨", "✊"); return; }
    const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) if (w.currentNode.data.includes("🪨")) w.currentNode.data = w.currentNode.data.replaceAll("🪨", "✊");
  };
  remplacer(document.body);
  new MutationObserver(ms => ms.forEach(m => (m.type === "characterData" ? remplacer(m.target) : m.addedNodes.forEach(remplacer))))
    .observe(document.body, { childList: true, subtree: true, characterData: true });
})();

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
const premiereFois = lire("profil") === null;   // (pour le compteur de visites : un téléphone qui découvre HandSlam)
let P = normaliserProfil(lire("profil"));
let T = lire("tournoi");
const sauverLocal = () => ecrire("profil", P);
// Pas encore de surnom (ou un surnom de l'ancienne liste) : un surnom de départ tiré au hasard, à changer dans « Ma fiche ».
function assurerSurnom() { if (surnomValide(P)) return false; P.surnom = surnomAuHasard(P, { depart: true }); return true; }
if (assurerSurnom()) sauverLocal();
let compteUI = null;
// Chaque changement de la fiche est gardé sur le téléphone, puis envoyé en ligne si on est connecté.
const sauverP = () => { P.majLe = Date.now(); sauverLocal(); compteUI?.planifier(); };
const sauverT = () => ecrire("tournoi", T);
// La carrière solo contre les bots (carriere-logique.js) : gardée dans la fiche, donc sauvegardée sur le compte avec elle.
// (Avant le 22 octobre, elle n'était que sur le téléphone : on la reprend.)
if (!P.carriere && lire("carriere")) { P.carriere = lire("carriere"); sauverLocal(); ecrire("carriere", null); }
let C = P.carriere || null;
if (migrerCarriere(C)) { P.carriere = C; sauverLocal(); }   // (une saison d'Amateur commencée avant les poules repart en poules)
const sauverC = () => { P.carriere = C; sauverP(); };
let S;              // la séance de match en cours
let D = null;       // le duel en ligne en cours (null en solo)
let duelsUI = null, cerclesUI = null, sngUI = null, rapideUI = null, jetonsUI = null, freerollUI = null, programmesUI = null, defisUI = null, boutiqueUI = null;
let monClassement = null, mesDuelsOfficiels = 0, maDivision = null;
// « Niveau officiel : 1232 ? · provisoire, encore 9 duels de calibrage »
const texteNiveauFiche = (points, joues, division = null) => `Niveau officiel : ${texteNiveau(points, joues)}` + (LANCEMENT.actif ? "" : ` · ${texteDivision(division ?? divisionDe(points))}`) +
  (provisoire(joues) ? ` · provisoire, encore ${10 - joues} duel${10 - joues > 1 ? "s" : ""} de calibrage` : "");   // niveau officiel (duels entre humains), connu une fois connecté
let panneauOuvert = null, faceAFaceOuvert = false;

// ---------------------------------------------------------------- son
// Les commentaires ne choisissent que des dialogues déjà enregistrés (voir dialogue() dans annonces.js).
const avecAudible = etat => Object.assign(etat, { audible: id => !voix.fichiers.size || voix.fichiers.has(id) });
const voix = new LecteurVoix();
const ambiance = new Ambiance();
let sonActif = lire("son", true) !== false;
// Dans les Options, on peut couper seulement les commentaires (Roland, Monique et la journaliste) ou seulement les bruitages
// (raquette, public) ; le bouton 🔊 en haut coupe tout. L'arbitre reste tant que le son est allumé.
let commentairesActifs = lire("sonCommentaires", true) !== false, bruitagesActifs = lire("sonBruitages", true) !== false;
const ROLES_COMMENTAIRES = ["commentateur", "commentatrice", "journaliste"];
const appliquerReglagesSon = () => {
  voix.rolesCoupes = new Set(commentairesActifs ? [] : ROLES_COMMENTAIRES);
  ambiance.activer(sonActif && bruitagesActifs);
};
voix.actif = sonActif; ambiance.actif = sonActif && bruitagesActifs;
voix.rolesCoupes = new Set(commentairesActifs ? [] : ROLES_COMMENTAIRES);
// (La voix de synthèse du téléphone, robotique, n'est plus proposée : les répliques sont enregistrées.)
voix.synthese = false;
$("snd").checked = sonActif;
voix.charger().then(() => { ambiance.utiliserFichiers([...voix.fichiers.keys()]); });

$("snd").addEventListener("change", e => {
  sonActif = e.target.checked; ecrire("son", sonActif);
  voix.actif = sonActif; if (!sonActif) voix.arreter();
  appliquerReglagesSon();
});
$("sonCommentaires").checked = commentairesActifs;
$("sonBruitages").checked = bruitagesActifs;
$("sonCommentaires").addEventListener("change", e => {
  commentairesActifs = e.target.checked; ecrire("sonCommentaires", commentairesActifs);
  if (!commentairesActifs) voix.arreter();
  appliquerReglagesSon();
});
$("sonBruitages").addEventListener("change", e => {
  bruitagesActifs = e.target.checked; ecrire("sonBruitages", bruitagesActifs);
  appliquerReglagesSon();
});
const note = t => { $("sndNote").textContent = t; $("sndNote").hidden = !t; };
$("testSnd").addEventListener("click", () => {
  if (!sonActif) { sonActif = true; $("snd").checked = true; ecrire("son", true); voix.actif = true; }
  ambiance.activer(true); ambiance.raquette(); setTimeout(() => ambiance.public("point", 0.5), 400);
  setTimeout(appliquerReglagesSon, 3000);   // le test fait entendre les bruitages, même coupés ; on remet ensuite les réglages
  const test = CATALOGUE.get("arbitre_balle_de_match_jaune_01");
  if (!voix.peutDire(test)) {
    note("Tu dois entendre un coup de raquette puis des applaudissements. Si ce n'est pas le cas, vérifie le volume et le mode silencieux. Ensuite, Roland et Monique doivent parler.");
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

// Écouter Roland et Monique : un dialogue enregistré (commentateur puis commentatrice), sinon une réplique de chacun.
// (Pas de bouton pour écouter les commentateurs : les répliques se découvrent en match. Décision du 8 octobre.)

// ---------------------------------------------------------------- annonces
// Balle de set ou de match, point décisif : le coup de raquette claque plus fort.
const grandMoment = m => !!balle(m) || pointDecisif(m);
// Les annonces sont dites à voix haute seulement (pas d'écrit : le porteur du projet n'en veut pas).
// Pendant l'échange (enJeu), les commentateurs ne disent que des répliques courtes, et pas deux points de suite :
// une réplique longue déborderait sur les coups suivants. Les longues sont dites dans les pauses
// (avant le match, fin de set, fin de match).
// Pendant l'échange, seules les répliques assez courtes pour tenir entre deux coups sont dites (8 secondes par coup
// depuis le 20 octobre : 55 caractères, environ 3 secondes à la vitesse des voix ; à 32, une centaine de répliques
// enregistrées n'étaient jamais entendues).
const REPLIQUE_COURTE = 55;
// Le dialogue après un cri de victoire : un qu'on n'a pas entendu récemment (au hasard), sinon le plus ancien.
function dialogueCriAuChoix(hasard = Math.random) {
  const recents = commentairesRecents(), n = nbDialogues("cri");
  const age = k => { const i = recents.indexOf(baseDe(DIALOGUES_IDS.cri[k][0])); return i < 0 ? Infinity : i; };
  const frais = [...Array(n).keys()].filter(k => age(k) === Infinity);
  if (frais.length) return frais[Math.floor(hasard() * frais.length)];
  return [...Array(n).keys()].reduce((a, b) => (age(b) > age(a) ? b : a), 0);
}
// Les commentaires entendus aux derniers matchs (environ huit), pour ne pas recommencer chaque match par les mêmes.
function commentairesRecents() { try { return lire("commentairesRecents", []) || []; } catch { return []; } }
// « Je vous demande de vous arrêter » : rare. Jamais deux fois en moins de 12 heures (même d'un match à l'autre),
// et jamais pendant le premier match après l'ouverture de l'appli (sinon on l'entendait à chaque reprise).
const HUEES_ECART_MS = 12 * 60 * 60 * 1000;
let matchsDepuisOuverture = 0;
function hueesPermises() { if (matchsDepuisOuverture < 1) return false; try { return Date.now() - (Number(lire("hueesLe", 0)) || 0) > HUEES_ECART_MS; } catch { return true; } }
// (seulement les répliques vraiment dites : une réplique écartée faute de temps n'est pas « déjà entendue »)
function retenirCommentaires(lignes) {
  const ids = lignes.filter(l => l.role === "commentateur" || l.role === "commentatrice").map(l => baseDe(l.id));
  if (ids.length) try { ecrire("commentairesRecents", [...new Set([...ids, ...commentairesRecents()])].slice(0, 120)); } catch { /* rien */ }
}
function annoncer(lignes, silencieux = false, { enJeu = false, coup = 0 } = {}) {
  if (!lignes.length || silencieux) return;
  if (!enJeu) { retenirCommentaires(lignes); voix.dire(lignes); return; }
  const recent = S && coup - (S.commentaireAuCoup ?? -9) < 2;
  const dites = lignes.filter(l => l.role === "arbitre" || (!recent && l.texte.length <= REPLIQUE_COURTE));
  retenirCommentaires(dites);
  if (S && dites.some(l => l.role !== "arbitre")) S.commentaireAuCoup = coup;
  voix.dire(dites);
}

// ---------------------------------------------------------------- panneaux
let panneauGo = null;
function ouvrirPanneau({ kick = "", big = "", bigCls = "", sc = "", tally = "", next = "", go, onGo, resteOuvert = false }) {
  $("iKick").textContent = kick; $("iBig").textContent = big; $("iBig").className = "big " + bigCls;
  $("iSc").textContent = sc; $("iTally").textContent = tally; $("iNext").textContent = next;
  $("iGo").textContent = go;
  $("iGo").disabled = false;
  panneauGo = () => { if (!resteOuvert) fermerPanneau(); onGo && onGo(); };
  panneauOuvert = true; $("inter").classList.add("show"); $("iGo").focus();
}
$("iGo").addEventListener("click", () => panneauGo && panneauGo());
function fermerPanneau() { $("inter").classList.remove("show"); panneauOuvert = null; panneauGo = null; }

// ---------------------------------------------------------------- minuteur (8 s par coup)
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
const boutons = on => document.querySelectorAll("#moves button").forEach(b => { b.disabled = !on; if (on) b.classList.remove("choisi"); });

function jouer(signe, auto = false) {
  if (S && S.duel) return jouerDuel(signe);
  if (!S || !S.enJeu || S.occupe || S.match.termine || panneauOuvert || faceAFaceOuvert) return;
  S.occupe = true; arreterMinuteur(); boutons(false);
  const m = S.match;
  // Le bot choisit sans connaître le coup du joueur.
  const histBot = m.coups.map(c => ({ moi: c.b, adv: c.a, res: c.gagnant === null ? "e" : c.gagnant === 1 ? "g" : "p" }));
  const signeBot = (S.carriere ? coupCarriere : choisirCoup)(OPP, histBot, S.hasard || Math.random, contexteBot(m));   // (carrière : les bots faibles renforcés)   // (match du jour : le même tirage pour tout le monde)
  const reveler = () => { ambiance.raquette(signe, grandMoment(m)); afficherCoup(signe, signeBot, [auto, false]); };
  if (reduitMouvement()) { reveler(); return; }
  // Comme au chifoumi : les deux poings se secouent, puis les deux signes s'ouvrent ensemble (pareil en duel).
  const seance = S;
  document.querySelector(`#moves button[data-m="${signe}"]`)?.classList.add("choisi");
  secouerLesPoings();
  setTimeout(() => { if (S === seance) reveler(); }, SECOUSSE_MS);
}

// « Pierre… feuille… ciseaux… » : les deux poings se secouent trois fois avant de s'ouvrir. En duel, ils continuent
// tant que la réponse du serveur n'est pas arrivée (elle arrive presque toujours pendant la secousse).
const SECOUSSE_MS = 540;
// Chaque main a les couleurs du gant de son joueur (avatar : gant, poignet, motif) : le poing se secoue,
// puis s'ouvre en feuille, fait le V des ciseaux ou reste fermé (pierre).
const SYMBOLE_SIGNE = ["dos", "ciseaux-dos", "feuille-dos"];   // même ordre que regles.js (les mains vues de dos)
const mainGantee = (g, signe, nom) => `<span class="poing-av" role="img" aria-label="${nom}">${avatarSVG({ ...avDe(g), symbole: SYMBOLE_SIGNE[signe], sansFond: true })}</span>`;
function secouerLesPoings() {
  [["hMe", 0], ["hBot", 1]].forEach(([id, g]) => { $(id).innerHTML = mainGantee(g, 0, "Poing serré"); $(id).className = "hand secoue"; });
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
  // Après le « ooh » du public, Monique le rappelle à l'ordre (une fois sur quatre, et pas plus d'une fois en 30 minutes) :
  // elle parle à la fin du « ooh », et c'est le seul commentaire de ce point.
  if (rp.ooh && hueesPermises() && Math.random() < 0.12 && CATALOGUE.has("commentatrice_huees_01")) {
    try { ecrire("hueesLe", Date.now()); } catch { /* rien */ }
    for (let k = a.lignes.length - 1; k >= 0; k--) if (a.lignes[k].role !== "arbitre") a.lignes.splice(k, 1);
    const seance = S, huees = CATALOGUE.get("commentatrice_huees_01");
    setTimeout(() => { if (S === seance && !S.match.termine) voix.dire([huees]); }, 1300);
  }
  if (rp.tension) setTimeout(() => ambiance.tension(), 500);
  // Le cri du vainqueur du set (ou du match) ; les commentateurs réagissent parfois.
  const cel = evt.finSet ? { ...celebration(criDe(evt.gagnant), { finMatch: m.termine, sauvee }), joueur: evt.gagnant } : null;
  if (cel && !m.termine && commenterCri(S.criCommente, cel)) {   // (pas en fin de match : un seul commentaire, celui de la fin)
    S.criCommente = true;
    const genre = evt.gagnant === 0 ? P.genre : OPP.genre || "m";   // on parle de celui qui a crié
    const reaction = ligneDialogue("cri", dialogueCriAuChoix(), genre), i = a.lignes.findIndex(l => l.role !== "arbitre");
    a.lignes.splice(i < 0 ? a.lignes.length : i, 0, ...reaction);
    a.dialogue.unshift(...reaction);
  }

  // Révélation immédiate des deux signes : aucun effet pendant l'échange.
  const hMe = $("hMe"), hBot = $("hBot");
  hMe.innerHTML = mainGantee(0, signe, NOM[signe]); hBot.innerHTML = mainGantee(1, signeAdv, NOM[signeAdv]);
  document.querySelectorAll("#moves button.choisi").forEach(b => b.classList.remove("choisi"));
  // Les deux mains s'ouvrent à la même taille ; une demi-seconde plus tard, le gagnant grossit et le perdant s'efface.
  hMe.className = "hand ouvre"; hBot.className = "hand ouvre";
  const coupVu = m.coups.length;
  setTimeout(() => {
    if (S?.match !== m || m.coups.length !== coupVu) return;   // un autre coup (ou un autre match) a pris la place
    if (evt.gagnant === 0) { hMe.classList.add("win"); hBot.classList.add("lose"); }
    if (evt.gagnant === 1) { hBot.classList.add("win"); hMe.classList.add("lose"); }
  }, silencieux || reduitMouvement() ? 0 : 500);
  $("verdict").textContent = (auto[0] ? "Temps écoulé, coup joué au hasard. " : "") + (auto[1] ? `${OPP.nom} n'a pas joué à temps : coup au hasard. ` : "") +
    (evt.egalite ? "Égalité, on rejoue" : evt.gagnant === 0 ? `${NOM[signe]} bat ${NOM[signeAdv]}` : `${NOM[signeAdv]} bat ${NOM[signe]}`);

  // Applaudissements : série de 4 points, fin de set, fin de match. Jamais pendant l'échange.
  if (a.public) setTimeout(() => ambiance.public(a.public === "serie" ? "clameur" : a.public, { serie: 0.45, set: 0.55, ovation: 0.6 }[a.public]), 250);
  // Sinon, parfois, une réaction du public : applaudissements, « Allez ! », « Bravo ! », « Ohhh… » ou brouhaha (voir reactionPoint).
  else if (!rp.ooh) { const r = reactionPoint(S.bravos ||= {}, evt, m.coups); if (r) setTimeout(() => ambiance.reagir(r), 300); }
  // Parfois, avant une balle de match, l'arbitre demande le silence (sans le répéter à chaque balle).
  if (evt.balleApres?.type === "match" && !m.termine && silenceAvantBalle(S.silence ||= { total: 0, parSet: {}, suite: 0, pause: 0 }, m.scoresSets.length))
    a.lignes.unshift(CATALOGUE.get("arbitre_silence_01"));
  annoncer(a.lignes, false, { enJeu: !evt.finSet && !m.termine, coup: m.coups.length });
  render(); renderHistorique(); renderLecture();
  if (S.premier) $("coach").textContent = conseil(m.coups.length, evt.gagnant);

  // Dernier point : on laisse le temps de voir les deux signes avant la célébration et le score final.
  // (l'écran de match reste en place pendant cette pause : S.pauseFin)
  if (m.termine) {
    const seance = S;
    S.pauseFin = true; render();
    setTimeout(() => { if (S === seance) criEnGrand(cel, () => poigneeDeMain(finir)); }, reduitMouvement() ? 900 : 1800);
    return evt;
  }
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
// Le geste de victoire (boutique) : la forme de la main et son animation ; par défaut, le poing serré.
const gesteDe = g => (g === 0 ? gesteValide(P.geste) : OPP.humain ? gesteValide(OPP.fiche?.geste) : "poing");
const poingDe = g => { const geste = gesteDe(g); return `<span class="geste-${geste}">${avatarSVG({ ...avDe(g), symbole: GESTES[geste].symbole })}</span>`; };
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
  const couleursGant = couleursConfettis(avDe(cel.joueur)), hasard = (a, b) => a + Math.random() * (b - a);
  // La célébration (boutique) : étoiles, cœurs, éclairs, feu d'artifice, pluie d'or ; par défaut, des confettis aux couleurs du gant.
  const style = CELEBRATIONS[celebrationValide(cel.joueur === 0 ? P.celebration : OPP.humain ? OPP.fiche?.celebration : "confettis")];
  const couleurs = style.couleurs || couleursGant;
  $("celAv").innerHTML = poingDe(cel.joueur); $("celCri").textContent = cel.texte;
  ov.style.setProperty("--c", couleursGant[0]); ov.classList.toggle("fort", cel.fort);
  ov.setAttribute("aria-label", `${cel.joueur === 0 ? "Toi" : OPP.nom} : ${cel.silence ? "le poing serré, en silence" : cel.texte}`);
  $("celConfettis").innerHTML = vite ? "" : Array.from({ length: cel.fort ? 90 : 60 }, (_, i) =>
    style.formes
      ? `<i class="forme" style="left:${hasard(0, 100).toFixed(1)}%;color:${couleurs[i % couleurs.length]};font-size:${Math.round(hasard(14, 30))}px;--d:${hasard(1.8, 3.2).toFixed(2)}s;--r:${hasard(0, 0.7).toFixed(2)}s;--x:${Math.round(hasard(-80, 80))}px;--t:${Math.round(hasard(90, 360))}deg">${style.formes[i % style.formes.length]}</i>`
      : `<i style="left:${hasard(0, 100).toFixed(1)}%;background:${couleurs[i % couleurs.length]};--d:${hasard(1.8, 3.2).toFixed(2)}s;--r:${hasard(0, 0.7).toFixed(2)}s;--x:${Math.round(hasard(-80, 80))}px;--t:${Math.round(hasard(360, 900))}deg"></i>`).join("");
  $("criBulle").hidden = true; ov.hidden = false;
  setTimeout(() => { ov.hidden = true; $("celConfettis").innerHTML = ""; if (S === seance) apres(); }, vite ? 1500 : 2600);
}

// ---------------------------------------------------------------- affichage du match
function render() {
  const m = S.match;
  majModeMatch();
  // Pendant la pause après le dernier point, on montre encore le score du dernier set (11–9), pas déjà les sets (2–1).
  const dernierSet = S.pauseFin ? m.scoresSets[m.scoresSets.length - 1] : null;
  $("sMe").textContent = dernierSet ? dernierSet[0] : m.termine ? m.sets[0] : m.points[0];
  $("sBot").textContent = dernierSet ? dernierSet[1] : m.termine ? m.sets[1] : m.points[1];
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
  renderLectureAdversaire();
  const t = $("tape"); t.scrollLeft = t.scrollWidth;
}

// Lire l'adversaire : sa répartition et ses réflexes (d'après l'historique). Pendant le match, c'est au joueur de lire
// seul, sans aide (décision du porteur du projet, 20 octobre) : l'encadré n'apparaît qu'à la fin. Avant le match,
// son dossier reste consultable.
function renderLectureAdversaire() {
  const cache = !S.match.termine;
  $("lecture").hidden = cache; $("lectureOff").hidden = true;
  if (cache) return;
  const c = S.match.coups, n = c.length, r = repartition(c);
  $("lectureRep").innerHTML = [0, 2, 1].map(s => `<div><b>${EMOJIS[s]}</b>${n ? Math.round(100 * r[s] / n) : 0} %<i><span style="width:${n ? Math.round(100 * r[s] / n) : 0}%"></span></i></div>`).join("");
  const h = habitudes(c).slice(0, 3);
  $("lectureHab").innerHTML = n < 4 ? `<li>Observe ses premiers coups : ses réflexes s'afficheront ici.</li>`
    : h.length ? h.map(x => `<li>${esc(x.texte)}</li>`).join("") : `<li>Pas de réflexe net pour l'instant : il varie bien.</li>`;
  const p = S.match.termine ? null : piste(c);
  $("lecturePiste").hidden = !p;
  if (p) $("lecturePiste").textContent = `💡 ${p.texte}`;
}
$("lecture").open = lire("lectureOuverte") !== false;
$("lecture").addEventListener("toggle", () => ecrire("lectureOuverte", $("lecture").open));

function renderLecture() {
  const s = S.suivi;
  if (s.lisibles < 3) { $("read").textContent = "L'analyse observe tes premiers coups."; return; }
  const pct = Math.round(100 * s.taux);
  const ton = pct >= 45 ? "Tu es lisible en ce moment." : pct <= 28 ? "Il ne te cerne pas : tu es imprévisible." : "Il te lit un peu mieux que le hasard.";
  $("read").innerHTML = `Ton coup était prévisible <b>${s.devines} fois sur ${s.lisibles}</b> (${pct} %, le hasard donnerait 33 %). ${ton}`;
}

function finir() {
  S.pauseFin = false; render();   // fin de la pause : le score des sets et le menu reviennent
  // Duel : le match suivant (tournoi) ne s'ouvre qu'après la célébration, la poignée de main et un coup d'œil à l'écran de fin.
  if (S.duel && D) { D.finVue = true; const d = D; setTimeout(() => { if (D === d) duelsUI?.rafraichir(); }, 2500); }
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
  const lues = lecturesReussies(c);
  $("endRead").textContent = `Ton coup était prévisible ${Math.round(100 * (S.suivi.taux || 0))} % du temps.${habitude}${lues ? ` 🔎 Tu as lu ${OPP.nom} ${lues} fois : tu as joué la bonne piste et gagné le point.` : ""}`;
  $("end").hidden = false;
  $("nomFin").hidden = !!P.pseudo; $("inNomFin").value = "";   // pas encore de pseudo : on le propose ici
  $("compteFin").hidden = !!compteUI.session()?.user;          // pas encore de compte : on le propose aussi
  if (S.duel && D) { afficherMessages(D.duel); guetterMessageFin(); }   // le mot de la fin (messages rapides)
  $("bar").style.transform = "scaleX(0)";

  const enTournoi = !!(S.tour !== null && T && !S.duel);
  if (enTournoi) { enregistrerMonMatch(T, gagne, m.sets); sauverT(); }
  const enCarriere = !!(S.carriere && C && n && !special);   // un match de carrière quitté avant la fin ne compte pas
  const phaseAvant = C?.phase;
  if (enCarriere) { enregistrerCarriere(C, gagne, m.scoresSets); sauverC(); }
  // Un duel compte dans la fiche (statistiques, historique, titres) mais pas dans le niveau.
  const matchsAvant = P.matchs;
  matchsDepuisOuverture++;
  const nouveaux = n ? enregistrerMatch(P, {
    match: m, stats: S.stats, devines: S.suivi.devines, lisibles: S.suivi.lisibles,
    adversaire: { id: OPP.id, elo: OPP.elo, nom: S.duel ? `${OPP.nom}#${OPP.numero}` : OPP.nom },
    finaleTournoi: enTournoi && tourDe(T, S.tour).finale, compteNiveau: !S.duel,
    abandon: !!special && !gagne, officiel: !!(S.duel && D?.duel?.classe), niveauMoi: monClassement ?? 1200, niveauAdv: OPP.classement ?? 1200,
    finaleEnLigne: !!(S.duel && D?.tourVoix === "finale"), sitAndGo: !!(S.duel && D?.direct), grandChelem: !!(S.duel && D?.grandChelem),
  }) : [];
  // Le premier gant : offert après le premier match (avant, la main nue).
  const premierGant = matchsAvant === 0 && P.matchs > 0 && P.av.gant === "nu" && !P.premierGant;
  if (premierGant) { P.av.gant = "blanc"; P.premierGant = true; }
  // Les trophées de la carrière (montées, coupe, bouclier, Élite) : ils débloquent des objets et des surnoms.
  if (enCarriere) nouveaux.push(...accorderTitres(P, titresCarriere(C)));
  sauverP(); rafraichirAvatars(); afficherBilan();
  $("coach").hidden = true;
  if (S.matchJour && n) noterMatchDuJour({ gagne, score: m.scoresSets[0] || [0, 0], grille: grille(c) });
  // La première visite : ce qui vient de s'ouvrir dans le menu.
  const ouvert = menuComplet() ? [] : nouveautes(matchsAvant, P.matchs);
  if (matchsAvant < 3 && P.matchs >= 3) compterTroisMatchs(envoyerTroisMatchs);   // pour savoir si les nouveaux joueurs accrochent (anonyme)
  // « La Une » : on garde de quoi raconter ce match.
  S.pourUne = n && !special ? {
    etape: S.carriere ? S.carriere.coupe ? S.carriere.etape.replace(" · ", ", ") : `${CIRCUITS[S.carriere.circuit]}, ${S.carriere.etape.charAt(0).toLowerCase()}${S.carriere.etape.slice(1)}` : S.contreBotRapide ? "Partie rapide contre un bot" : S.duel && D?.duel?.rapide ? `Partie rapide ${D.duel.points_par_set === 11 ? "classique" : "éclair"}` : S.duel ? (D?.duel?.tournoi_id ? (D.direct ? (D.tourVoix === "finale" && D.nbTours > 1 ? "Finale de Sit & Go" : "Sit & Go") : D.tourVoix === "finale" ? "Finale du tournoi" : "Tournoi en ligne") : D?.duel?.classe === false ? "Duel amical" : "Duel officiel")
      : enTournoi ? `${tourDe(T, S.tour).singulier} du HandSlam Open` : "Match d'entraînement",
    finale: !!S.annonces.finale, numero: P.matchs,
  } : null;
  $("btnUne").hidden = !S.pourUne;
  $("again").hidden = enTournoi || !!S.duel; $("tNext").hidden = !enTournoi;
  const tournoiId = S.duel && D ? D.duel.tournoi_id : null;   // match de tournoi en ligne
  const rapide = !!(S.duel && D?.duel?.rapide) || !!S.contreBotRapide;
  $("revanche").hidden = !S.duel || !!tournoiId; $("retourDuels").hidden = !S.duel || !!tournoiId || rapide; $("revanche").disabled = false;
  $("revanche").textContent = D?.duel?.enjeu ? "🔁 Revanche, même enjeu" : "🔁 Revanche";   // en un geste, avec le même format et le même enjeu
  $("encoreRapide").hidden = !rapide;
  if (S.contreBotRapide || S.matchJour || S.carriere) $("again").hidden = true;
  $("carSuite").hidden = !S.carriere;
  $("mdjPartagerFin").hidden = !S.matchJour;
  $("voirTournoi").hidden = !tournoiId;
  $("signalerZone").hidden = !(S.duel && OPP.humain);
  if (!S.duel) $("endClassement").hidden = true;
  $("abandonDuelZone").hidden = true;
  if (enTournoi) $("tNext").textContent = gagne ? (tourDe(T, S.tour).finale ? "Voir le palmarès" : "Continuer le tournoi") : "Voir la suite du tournoi";
  $("news").textContent = nouveaux.length ? "Nouveau titre : " + nouveaux.map(t => t.nom + (texteDeblocage(t) ? ` (débloque ${texteDeblocage(t)})` : "")).join(", ") + " !" : "";
  const paliers = retenirRang();
  if (paliers.length) $("news").textContent = `${$("news").textContent} ${paliers.join(" ")}`.trim();
  if (ouvert.length) $("news").textContent = `${S.premier ? "🎉 Ton premier match est joué ! " : ""}${ouvert.join(" ")} ${$("news").textContent}`.trim();
  // Un titre : la cérémonie de la coupe, peu après l'écran de fin.
  if (enCarriere && gagne) {
    let ceremonie = null;
    if (S.carriere.coupe && C.coupe?.vainqueur === "moi") ceremonie = { sur: "Coupe Monique-Latour", titre: "Vainqueur !", sous: "Ton nom est gravé sur la Coupe Monique-Latour.", coupe: coupeMLSVG(true), voix: "speaker_champion_01" };
    else if (!S.carriere.coupe && phaseAvant === "playoffs" && C.issues?.[C.ou]?.champion === "moi") ceremonie = { sur: CIRCUITS[C.ou], titre: "Champion !",
      sous: C.ou < CIRCUITS.length - 1 ? `Tu montes en ${CIRCUITS[C.ou + 1]} !` : "Champion de l'Élite : le sommet du HandSlam !", coupe: coupeSVG(C.ou, true), voix: "speaker_champion_01" };
    const seance = S;
    if (ceremonie) setTimeout(() => { if (S === seance) ouvrirCeremonie(ceremonie); }, 1400);
  }
  if (enCarriere && S.carriere.coupe) $("news").textContent = `🏆 ${gagne ? texteCoupe(C) : `Éliminé de la Coupe Monique-Latour.`} ${$("news").textContent}`.trim();
  else if (enCarriere && C.phase !== phaseAvant) $("news").textContent = `🏅 ${C.phase === "fin" ? `Fin de saison : ${texteBilan(C)}` : C.phase === "barrage" ? `Direction le barrage contre ${botParId(C.barrage.adv).nom} !` : phaseAvant === "saison" ? `Saison terminée à la ${C.place}${C.place === 1 ? "re" : "e"} place : ${C.phase === "playoffs" ? "qualifié pour les playoffs !" : "place au maintien."}` : ""} ${$("news").textContent}`.trim();
  if (premierGant) $("news").textContent = `🧤 Ton premier gant t'est offert ! Change sa couleur (ou garde ta main nue) dans Ma fiche › Mon avatar. ${$("news").textContent}`.trim();
  // Défi avec enjeu (entre amis) : qui s'y colle, en grand.
  $("endEnjeu").hidden = !(S.duel && D?.duel?.enjeu);
  if (S.duel && D?.duel?.enjeu) $("endEnjeu").textContent = annonceEnjeu(D.duel.enjeu, gagne, OPP.nom);
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
  // L'interview d'après-finale : seulement pour les tournois programmés (pas les Sit & Go, ni les tournois d'entraînement ou entre amis).
  if (n && !special && S.annonces.finale && S.duel && D?.programme) setTimeout(() => ouvrirInterview(gagne), 2500);
}

// ---------------------------------------------------------------- la poignée de main
// 3 secondes pour choisir (sinon, mon style habituel), puis une courte animation, puis l'écran de fin.
// Contre un humain, on envoie son choix et on attend un peu celui de l'adversaire (sinon, son style habituel).
function poigneeDeMain(apres) {
  const seance = S;
  if (!S || (S.duel && (!D || D.finSpeciale))) { apres(); return; }
  const ov = $("poignee"), scene = $("pmScene"), choix = $("pmChoix");
  $("pmMoi").innerHTML = avatarSVG(P.av); $("pmAdv").innerHTML = avatarSVG(OPP.av);
  $("pmStyleMoi").textContent = ""; $("pmStyleAdv").textContent = "";
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
    if (ligne) setTimeout(() => voix.dire([ligne]), 500);
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

// ---------------------------------------------------------------- les messages rapides (duel)
// Un message tout fait avant le match (pendant la présentation) et un après (écran de fin).
// Le chambrage n'est proposé qu'entre amis ; le serveur le vérifie aussi (étape 22).
const masquerMessages = () => !!lire("masquerMessages");
$("masquerMessages").checked = masquerMessages();
$("masquerMessages").addEventListener("change", e => { ecrire("masquerMessages", e.target.checked); if (D?.duel) afficherMessages(D.duel); });

// Mon ami ? (une demande d'ami acceptée) — cherché une fois par duel.
async function verifierAmi() {
  const d = D;
  if (!d) return;
  try { const amis = await mesAmis(); if (D === d) { d.ami = amis.some(a => a.id === OPP.uid && a.statut === "amis"); afficherMessages(d.duel); } }
  catch { /* sans la liste, pas de chambrage */ }
}
const momentAvecMoi = duel => (duel.phase === "presentation" ? "avant" : duel.phase === "termine" && duel.vainqueur !== null && duel.vainqueur !== undefined ? momentApres(duel.vainqueur === D.moi) : null);
// Un seul bouton à l'écran ; il ouvre la fenêtre des messages (décision du 22 octobre : les rangées de puces encombraient).
function puces(zone, moment) {
  zone.innerHTML = `<button class="btn alt msg-ouvrir" data-moment="${moment}">💬 Envoyer un message à ${esc(OPP.nom)}</button>`;
}
// La fenêtre : les phrases fair-play, puis, entre amis, le chambrage et le message écrit soi-même.
function ouvrirMessages(moment) {
  if (!D) return;
  const ami = !!D.ami, liste = messagesPossibles(moment, ami), rubrique = (titre, l) => `<p class="msg-rubrique">${titre}</p><div class="msg-puces">`
    + l.map(m => `<button class="${m.amis ? "amis" : ""}" data-msg="${m.id}">${esc(m.texte)}</button>`).join("") + `</div>`;
  $("msgFenetreTitre").textContent = `💬 Un mot pour ${OPP.nom}`;
  $("msgFenetreCorps").innerHTML = rubrique("😊 Fair-play", liste.filter(m => !m.amis))
    + (ami ? rubrique("😈 Chambrage, entre amis", liste.filter(m => m.amis))
      + `<p class="msg-rubrique">✍️ Écrire mon message</p><div class="msg-libre"><input type="text" id="msgLibre" maxlength="${MESSAGE_LIBRE_MAX}" placeholder="Ton message (${MESSAGE_LIBRE_MAX} max.)" autocomplete="off"><button class="btn" id="msgLibreEnvoyer">Envoyer</button></div>`
      : `<p class="hint">Le chambrage et les messages écrits, c'est entre amis : ajoute ${esc(OPP.nom)} à tes amis pour en profiter.</p>`);
  $("msgFenetre").dataset.moment = moment;
  $("msgFenetreErreur").hidden = true; $("msgFenetre").hidden = false;
  // L'adversaire voit que j'écris ; avant le match, le départ automatique attend un peu (étape 48).
  const d = D; serveur.jEcris(d.id).then(duel => { if (D === d) { d.duel = { ...d.duel, ...duel }; } }).catch(() => {});
}
// Fermée : si un match de tournoi attendait derrière, il peut s'ouvrir.
const fermerMessages = () => { $("msgFenetre").hidden = true; if (D?.finVue) setTimeout(() => duelsUI?.rafraichir(), 800); };
function bulle(el, texte) { el.hidden = !texte; el.textContent = texte || ""; }
// Au début du match, les messages d'avant-match sortent des avatars, dans le tableau des scores (6 secondes).
function bullesDepart(duel) {
  const moi = D.moi, adv = 1 - moi;
  bulle($("bulleSideMe"), texteMessage("avant", duel[`message_avant${moi}`]));
  bulle($("bulleSideAdv"), masquerMessages() ? null : texteMessage("avant", duel[`message_avant${adv}`]));
  setTimeout(() => { $("bulleSideMe").hidden = true; $("bulleSideAdv").hidden = true; }, 6000);
}
function afficherMessages(duel) {
  if (!D || !duel || duel.id !== D.id) return;
  const moi = D.moi, adv = 1 - moi, cache = masquerMessages();
  const advGagne = duel.vainqueur === adv;
  // Avant le match (présentation)
  const avMoi = duel[`message_avant${moi}`], avAdv = duel[`message_avant${adv}`];
  bulle($("foBulleMoi"), texteMessage("avant", avMoi));
  bulle($("foBulleAdv"), cache ? null : texteMessage("avant", avAdv));
  const avant = duel.phase === "presentation" && !avMoi;
  $("foMsg").hidden = !avant;
  if (avant && D.pucesAvant !== !!D.ami) { puces($("foMsgPuces"), "avant"); D.pucesAvant = !!D.ami; }
  // « Julie t'écrit un message… » (étape 48) : tant qu'elle n'a rien envoyé, et pendant une minute au plus.
  const ecrit = envoye => !cache && !envoye && Date.now() - Date.parse(duel[`ecrit${adv}`] || 0) < 60000;
  const signalEcrit = (el, oui) => { el.hidden = !oui; el.textContent = oui ? `✍️ ${OPP.nom} t'écrit un message…` : ""; };
  signalEcrit($("foEcrit"), duel.phase === "presentation" && ecrit(avAdv));
  // Après le match (écran de fin)
  if (duel.phase !== "termine" || duel.vainqueur === null || duel.vainqueur === undefined) return;
  const apMoi = duel[`message_apres${moi}`], apAdv = duel[`message_apres${adv}`];
  $("finMsg").hidden = false;
  bulle($("finBulleMoi"), texteMessage(momentApres(!advGagne), apMoi));
  bulle($("finBulleAdv"), cache ? null : apAdv && `${OPP.nom} : ${texteMessage(momentApres(advGagne), apAdv) || "…"}`);
  $("finMsgZone").hidden = !!apMoi;
  signalEcrit($("finEcrit"), ecrit(apAdv));
  if (!apMoi && D.pucesApres !== !!D.ami) { puces($("finMsgPuces"), momentApres(!advGagne)); D.pucesApres = !!D.ami; }
}
async function envoyerMessage(message) {
  if (!D) return;
  const d = D, zone = $("msgFenetre"), erreur = t => { $("msgFenetreErreur").textContent = t; $("msgFenetreErreur").hidden = false; };
  zone.querySelectorAll("button, input").forEach(b => { b.disabled = true; });
  try {
    const duel = await serveur.envoyerMessage(d.id, message);
    fermerMessages();
    if (D === d) { d.duel = { ...d.duel, ...duel }; afficherMessages(d.duel); }
  } catch (e) { erreur(e?.message || "Le message n'est pas parti. Réessaie."); }
  zone.querySelectorAll("button, input").forEach(b => { b.disabled = false; });
}
for (const id of ["foMsgPuces", "finMsgPuces"]) $(id).addEventListener("click", e => { const b = e.target.closest("button[data-moment]"); if (b) ouvrirMessages(b.dataset.moment); });
$("msgFenetre").addEventListener("click", e => {
  if (e.target === $("msgFenetre") || e.target.id === "msgFenetreFermer") { fermerMessages(); return; }
  const b = e.target.closest("button[data-msg]"); if (b) { envoyerMessage(b.dataset.msg); return; }
  if (e.target.id === "msgLibreEnvoyer") {
    const t = nettoyerMessage($("msgLibre").value), refus = erreurMessageLibre(t);
    if (refus) { $("msgFenetreErreur").textContent = refus; $("msgFenetreErreur").hidden = false; return; }
    envoyerMessage(PREFIXE_LIBRE + t);
  }
});
$("msgFenetre").addEventListener("keydown", e => { if (e.key === "Enter" && e.target.id === "msgLibre") $("msgLibreEnvoyer").click(); if (e.key === "Escape") fermerMessages(); });
// Après le match, l'écoute en direct est arrêtée : on regarde de temps en temps si l'adversaire a écrit (une minute au plus).
function guetterMessageFin() {
  const d = D;
  if (!d || d.guetteFin) return;
  d.guetteFin = setInterval(async () => {
    // Trois minutes au plus (l'adversaire peut prendre le temps d'écrire son message).
    if (D !== d || (d.toursGuet = (d.toursGuet || 0) + 1) > 60 || d.duel?.[`message_apres${1 - d.moi}`]) { clearInterval(d.guetteFin); return; }
    try { const duel = await serveur.lireDuel(d.id); if (D === d) { d.duel = duel; afficherMessages(duel); } } catch { /* on réessaiera */ }
  }, 3000);
  d.toursGuet = 0;
}

// ---------------------------------------------------------------- images à partager (La Une, la carte)
// Aperçu, bouton « Partager » (si le téléphone sait partager une image) et lien « Enregistrer ».
async function preparerPartage(canvas, { img, partager, enregistrer, msg, fichier, alt, titre }) {
  const blob = await new Promise(ok => canvas.toBlob(ok, "image/png"));
  if (img.dataset.url) URL.revokeObjectURL(img.dataset.url);
  const url = URL.createObjectURL(blob), f = new File([blob], fichier, { type: "image/png" });
  img.dataset.url = url; img.src = url; img.alt = alt; enregistrer.href = url; enregistrer.download = fichier;
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

// ---------------------------------------------------------------- face-à-face avec un adversaire (touché dans « Derniers matchs »)
// Bot d'entraînement : notre bilan (gardé sur le téléphone), ses signes contre moi, son dossier, et un bouton pour le rejouer.
// Adversaire en ligne (humain ou bot du serveur) : le bilan détaillé de nos duels, comme pour un ami.
let ficheDemande = 0;
async function ouvrirFicheAdv(id, nom, { jouer = true } = {}) {
  const demande = ++ficheDemande, b = botParId(id), f = P.faceAFace[id];
  const pourcent = t => { const n = t.reduce((x, y) => x + y, 0); return n ? t.map(v => Math.round((100 * v) / n)) : null; };
  $("faJouer").hidden = !b || !jouer;   // (depuis l'entraînement, le bot est déjà choisi)
  if (b) {
    $("faAv").innerHTML = avatarSVG(b.av);
    $("faNom").textContent = b.nom;
    $("faInfo").textContent = `${b.style} · Niveau ${b.elo} · ${b.desc}`;
    $("faJouer").textContent = `Jouer contre ${b.nom}`; $("faJouer").dataset.bot = b.id;
    const v = f?.v || 0, d = f?.d || 0, sig = f ? pourcent(f.signes) : null;
    const contre = P.derniers.filter(x => x.adv === id);
    $("faCorps").innerHTML = v + d
      ? `<div class="ff-tete"><span>Toi</span><b>${v} – ${d}</b><span>${esc(b.nom)}</span></div>
        <p class="hint" style="text-align:center;margin-top:0">${v + d} match${v + d > 1 ? "s" : ""} · ${Math.round((100 * v) / (v + d))} % de victoires pour toi</p>
        ${sig ? `<h3 class="ff-titre">Ses signes contre toi</h3><p class="dossier-signes">${sig.map((p, k) => `<span>${EMOJIS[k]} ${p} %</span>`).join("")}</p>` : ""}
        <h3 class="ff-titre">📁 Son dossier</h3>${corpsDossierBot(b)}
        ${contre.length ? `<h3 class="ff-titre">Derniers affrontements</h3><ul class="ff-derniers">${contre.map(x => `<li>${x.gagne ? "✅ Victoire" : "❌ Défaite"} · ${esc(x.detail)} · ${new Date(x.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</li>`).join("")}</ul>` : ""}`
      : `<p class="hint">Tu n'as encore jamais affronté ${esc(b.nom)}.</p>`;
  } else {
    const court = String(nom || "").replace(/#\d+$/, "");
    $("faAv").textContent = /🤖/.test(nom) ? "🤖" : "🧑";
    $("faNom").textContent = court || "Adversaire";
    $("faInfo").textContent = /🤖/.test(nom) ? "Bot en ligne" : "Joueur en ligne";
    const uid = String(id).replace(/^h:/, ""), moi = compteUI?.session()?.user?.id;
    $("faCarte").hidden = !moi || /🤖/.test(nom); $("faCarte").dataset.uid = uid;
    const v = f?.v || 0, d = f?.d || 0;
    const local = v + d ? `<div class="ff-tete"><span>Toi</span><b>${v} – ${d}</b><span>${esc(court)}</span></div>` : `<p class="hint">Pas encore de duel enregistré contre ${esc(court)}.</p>`;
    $("faCorps").innerHTML = moi ? `<p class="hint">Chargement…</p>` : local;
    if (moi) {
      try { const r = statsFaceAFace(await duelsAvec(uid), moi); if (demande === ficheDemande) $("faCorps").innerHTML = r.matchs ? renderFaceAFace(r, court) : local; }
      catch { if (demande === ficheDemande) $("faCorps").innerHTML = local + `<p class="hint">Le détail de vos duels n'a pas pu être chargé. Vérifie ta connexion.</p>`; }
    }
  }
  $("ficheAdv").classList.add("show");
}
$("lastBody").addEventListener("click", e => { const x = e.target.closest(".nom-adv"); if (x) ouvrirFicheAdv(x.dataset.adv, x.dataset.nom); });
$("faCarte").addEventListener("click", async () => {
  const b = $("faCarte"); b.disabled = true;
  const msg = await voirCarteDe(b.dataset.uid);
  b.disabled = false;
  if (msg) $("faInfo").textContent = msg; else $("ficheAdv").classList.remove("show");
});
$("faFermer").addEventListener("click", () => $("ficheAdv").classList.remove("show"));
$("faJouer").addEventListener("click", () => {
  const id = $("faJouer").dataset.bot; $("ficheAdv").classList.remove("show");
  if (!botParId(id) || matchEnCours()) return;
  amicalId = id; ecrire("adversaire", amicalId); OPP = botParId(amicalId);
  aller("viewMatch"); renderAdversaires(); rafraichirAvatars();
});

// ---------------------------------------------------------------- la carte de joueur (Ma fiche)
let carteT = 0, carteJeton = 0;
function renderCarte() {
  clearTimeout(carteT);
  carteT = setTimeout(async () => {
    const jeton = ++carteJeton;
    const c = carteDe(P, { niveauOfficiel: monClassement, provisoire: monClassement !== null && provisoire(mesDuelsOfficiels), surnom: surnomDe(P).texte, titre: P.matchs ? dernierTitre(P) : "" });
    const canvas = await dessinerCarte(document.createElement("canvas"), c, { nom: nomAffiche(P), numero: P.numero, drapeau: P.drapeau, av: avatarSVG(P.av), cadre: CADRES[P.cadre]?.couleur, cadreInterieur: CADRES[P.cadre]?.interieur });
    if (jeton !== carteJeton) return;
    $("carteRarete").textContent = texteRang(c.rang);
    $("carteNotes").innerHTML = notesDe(P).map(n => `<li><b>${n.code} ${n.valeur}</b> · ${esc(n.nom)} : ${esc(n.aide)}</li>`).join("");
    await preparerPartage(canvas, { img: $("carteImg"), partager: $("cartePartager"), enregistrer: $("carteEnregistrer"), msg: $("carteMsg"),
      fichier: "ma-carte.png", alt: `Carte de joueur de ${nomAffiche(P)} : ${c.typeNiveau.toLowerCase()} ${c.niveau}, ${c.notes.map(n => `${n.nom} ${n.valeur}`).join(", ")}.`, titre: MARQUE.nom });
  }, 250);
}

// La carte d'un autre joueur (page d'un ami, derniers matchs), d'après sa fiche en ligne ; sauf s'il a choisi de la cacher.
// Renvoie un message si elle ne peut pas être montrée.
async function voirCarteDe(uid) {
  let ligne;
  try { [ligne] = await profilsEnLigne([uid]); } catch { return "Impossible de charger sa carte. Vérifie ta connexion."; }
  if (!ligne) return "Ce joueur n'existe plus.";
  const J = profilDepuisLigne(ligne);
  if (J.carteCachee) return "🙈 Ce joueur a choisi de ne pas montrer sa carte.";
  let cl = null;
  try { cl = (await classements([uid])).get(uid) || null; } catch { /* sans niveau officiel */ }
  const nom = `${ligne.pseudo}${ligne.numero ? `#${ligne.numero}` : ""}`;
  const c = carteDe(J, { niveauOfficiel: cl ? cl.points : null, provisoire: !!cl && provisoire(cl.joues), surnom: surnomDe(J).texte, titre: J.matchs ? dernierTitre(J) : "" });
  $("uneMsg").textContent = "Impression en cours…"; $("uneImg").removeAttribute("src");
  $("une").classList.add("show");
  const canvas = await dessinerCarte(document.createElement("canvas"), c, { nom: ligne.pseudo, numero: ligne.numero, drapeau: ligne.drapeau, av: avatarSVG(J.av), cadre: CADRES[J.cadre]?.couleur, cadreInterieur: CADRES[J.cadre]?.interieur });
  await preparerPartage(canvas, { img: $("uneImg"), partager: $("unePartager"), enregistrer: $("uneEnregistrer"), msg: $("uneMsg"),
    fichier: "carte-de-joueur.png", alt: `Carte de joueur de ${nom} : ${c.typeNiveau.toLowerCase()} ${c.niveau}, ${c.notes.map(n => `${n.nom} ${n.valeur}`).join(", ")}.`, titre: MARQUE.nom });
  return null;
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
    stats: nouvellesStats(), annonces: avecAudible(nouvelEtatAnnonces({ anciens: commentairesRecents(), genre: P.genre })), suivi: new Suivi(),
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
  $("tape").innerHTML = `<p class="empty">Les coups apparaîtront ici. Observe-les : ton adversaire le fait.</p>`;
  $("read").textContent = "L'analyse de ton jeu démarre au premier coup.";
  $("end").hidden = true; $("bar").style.transform = "scaleX(1)"; $("timer").classList.remove("urgent"); $("criBulle").hidden = true;
  render(); $("status").textContent = "Choisis ton premier coup";
  boutons(false); afficherBilan(); window.scrollTo(0, 0);
  $("revanche").hidden = true; $("retourDuels").hidden = true; $("encoreRapide").hidden = true; $("abandonDuelZone").hidden = true; $("signalerZone").hidden = true;
  $("coach").hidden = true; $("mdjPartagerFin").hidden = true; $("carSuite").hidden = true;
  $("finMsg").hidden = true; $("foMsg").hidden = true; $("foBulleMoi").hidden = true; $("foBulleAdv").hidden = true;
  if (S?.match) renderLectureAdversaire();
}

function renderFormat() {
  document.querySelectorAll("#segLen button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.v === fmt.len)));
  document.querySelectorAll("#segWin button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.v === fmt.win)));
  // Durée : coups par set (égalités comprises), du plus court au plus long match possible.
  const parSet = { 11: 20, 7: 12, 3: 5, 1: 1.5 }[fmt.len], w = fmt.win;
  const arrondi = x => (x >= 20 ? Math.round(x / 5) * 5 : Math.max(1, Math.round(x)));
  const court = arrondi(w * parSet), long = arrondi((2 * w - 1) * parSet * 1.25);
  const officiel = fmt.len === 11;
  $("fmtHint").textContent = `${texteFormat({ pointsParSet: fmt.len, setsGagnants: w })}${officiel ? " (format officiel)" : ""}, environ ${court} à ${long} coups.${officiel ? "" : " Le format officiel, c'est 11 points par set."}`;
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
  if (D?.duel?.enjeu) $("foFmt").textContent += ` · 🎯 Enjeu : « ${D.duel.enjeu} »`;
  if (S.carriere) $("foStage").textContent = S.carriere.coupe ? `🏆 ${S.carriere.etape}` : `🏅 ${CIRCUITS[S.carriere.circuit]} · ${S.carriere.etape}`;
  else if (S.contreBotRapide) $("foStage").textContent = "Partie rapide · 🤖 contre un bot";
  else if (D?.duel?.rapide) $("foStage").textContent = /🤖$/.test(OPP.nom || "") ? "Partie rapide · 🤖 contre un bot" : `Partie rapide ${D.duel.points_par_set === 11 ? "classique" : "éclair"}`;
  $("foAvMe").innerHTML = avatarSVG(P.av); $("foAvBot").innerHTML = avatarSVG(OPP.av);
  $("foNameMe").textContent = pr.joueur.nom; $("foSubMe").textContent = pr.joueur.sous; $("foRecMe").textContent = pr.joueur.bilan;
  $("foNameBot").textContent = pr.adversaire.nom; $("foSubBot").textContent = pr.adversaire.sous; $("foRecBot").textContent = pr.adversaire.bilan;
  const cellule = (texte, n, adv) => `<span class="${adv ? "adv" : ""}${n === undefined && texte.length > 3 ? " txt" : ""}"${n !== null && n !== undefined ? ` data-n="${n}"` : ""}>${esc(texte)}</span>`;
  $("foRows").innerHTML = pr.lignes.map((l, i) => `<div class="fo-row" style="--i:${i}">${cellule(l.g, l.gn, l.avantage === "g")}<span>${l.label}</span>${cellule(l.d, l.dn, l.avantage === "d")}</div>`).join("");
  $("foKey").innerHTML = `${esc(pr.cle)} Tu joues <b>côté jaune</b>.`;
  $("foSurMe").textContent = surnomDe(P).texte;
  afficherDossier();
  $("foSurBot").textContent = OPP.humain && OPP.surnom ? OPP.surnom.texte : "";
  if (!S.duel) {
    S.annonces.finale = S.tour !== null && !!T && tourDe(T, S.tour).finale;
    S.annonces.enjeu = niveauEnjeu({ tour: S.tour !== null && T ? tourDe(T, S.tour).cle : null });
    // Les dialogues d'avant et d'après match : l'entraînement contre un bot, ou un tour du HandSlam Open (petit tournoi).
    S.annonces.jeu = S.tour !== null && T ? contexteJeu({ tournoi: "petit", tour: tourDe(T, S.tour).cle }) : contexteJeu({ entrainement: true });
    if (S.carriere) {   // la carrière : commentée comme un tournoi (playoffs, maintien et barrages comme les grands tours)
      // L'enjeu d'après le tour vraiment commenté ; maintien et barrages : un match décisif, sans « titre » ni « tableau ».
      S.annonces.finale = S.carriere.voix === "finale"; S.annonces.enjeu = S.carriere.voix ? niveauEnjeu({ tour: S.carriere.voix }) : S.carriere.cle ? "decisif" : null;
      S.annonces.jeu = S.carriere.voix ? contexteJeu({ tournoi: "petit", tour: S.carriere.voix }) : null;   // (pas de « premier tour » à chaque journée)
    }
  }
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
// Le contenu d'un dossier : d'où il vient, la répartition de ses signes, ses habitudes (ou un message s'il est vide).
function corpsDossier(d, source, vide) {
  return d
    ? `<p class="dossier-source">${esc(source(d))}</p>`
      + `<p class="dossier-signes">${d.repartition.map((p, s) => `<span>${EMOJIS[s]} ${p} %</span>`).join("")}</p>`
      + (d.habitudes.length ? `<ul>${d.habitudes.map(h => `<li>${esc(h)}</li>`).join("")}</ul>` : `<p class="hint">Aucune habitude nette : son jeu est bien varié.</p>`)
    : `<p class="hint">${esc(vide)}</p>`;
}
const botAuFeminin = b => /^La |^L'adaptative$/.test(b.style || "");
// Le dossier d'un bot d'entraînement : d'après mes matchs contre lui (compteurs gardés dans la fiche).
function corpsDossierBot(b) {
  return corpsDossier(dossier(P.faceAFace[b.id]?.lect, { elle: botAuFeminin(b) }),
    d => `D'après tes ${d.matchs} match${d.matchs > 1 ? "s" : ""} contre ${b.nom} (${d.coups} coups).`,
    `Pas encore assez de matchs contre ${b.nom} pour établir son dossier : joue-le pour le découvrir.`);
}
// Le dossier de l'adversaire, avant le match : ses habitudes de jeu.
// Joueur en ligne (humain ou bot du serveur) : ses 50 derniers matchs en ligne (supabase/etape-32-dossier.sql) ;
// bot d'entraînement : mes matchs contre lui (compteurs gardés dans la fiche).
let dossierDemande = 0;
async function afficherDossier() {
  const bloc = $("foDossier"), corps = $("foDossierCorps"), demande = ++dossierDemande, adv = OPP;
  const elle = adv.humain ? adv.genre === "f" : botAuFeminin(adv);
  const montrer = (d, source, vide) => {
    if (demande !== dossierDemande) return;
    bloc.hidden = false; corps.innerHTML = corpsDossier(d, source, vide);
  };
  bloc.hidden = true;
  if (!adv.humain) { bloc.hidden = false; corps.innerHTML = corpsDossierBot(adv); return; }
  if (!adv.uid || !compteUI?.session()) return;
  corps.innerHTML = `<p class="hint">Ouverture du dossier…</p>`; bloc.hidden = false;
  try {
    const matchs = await dossierJoueur(adv.uid);
    let k = compteVide();
    for (const m of matchs || []) k = additionner(k, compterMatch(m.map(c => ({ a: c.a, b: c.b, gagnant: c.g ?? null }))));
    montrer(dossier(k, { elle }), d => `D'après ses ${d.matchs} dernier${d.matchs > 1 ? "s" : ""} match${d.matchs > 1 ? "s" : ""} en ligne (${d.coups} coups).`,
      "Pas encore assez de matchs en ligne pour établir son dossier.");
  } catch { montrer(null, null, "Dossier indisponible pour l'instant."); }
}
// Les commentateurs lancent le match, à voix haute (pas de speaker pour l'instant : sa présentation n'est ni dite ni affichée).
function presenterSpeaker() {
  const f = P.faceAFace[OPP.id], humain = !!OPP.humain;
  const niveauMoi = humain ? monClassement ?? 1200 : P.elo, niveauAdv = humain ? OPP.classement ?? 1200 : OPP.elo;
  const monId = `h:${compteUI.session()?.user?.id}`;
  let recents = []; try { recents = lire("speakerRecents", []) || []; } catch { /* rien */ }
  const av = annoncesAvantMatch({
    moi: { surnom: surnomDe(P), genre: P.genre, etiquette: etiquetteDe(P, { advId: OPP.id, niveauMoi, niveauAdv }) },
    adv: humain ? { surnom: OPP.surnom, genre: OPP.genre, etiquette: etiquetteDe(OPP.fiche, { advId: monId, niveauMoi: niveauAdv, niveauAdv: niveauMoi }) } : { bot: OPP.id },
    tour: S.duel ? D?.tourCommente ?? null : S.tour !== null && T ? tourDe(T, S.tour).cle : null, sng: !!(S.duel && D?.sng),
    humain, domination: !!(f && f.d >= f.v + 3), genre: P.genre, jeu: S.annonces?.jeu ?? null, audible: id => !voix.fichiers.size || voix.fichiers.has(id),
    situations: situationsDuMatch({
      humain, dejaJoues: !!(f && f.v + f.d > 0), niveauMoi, niveauAdv, memePays: humain && OPP.drapeau === P.drapeau,
      rapide: !!(D?.duel?.rapide || S.contreBotRapide), officiel: !!(S.duel && D?.duel?.classe), setsGagnants: S.match.format.setsGagnants,
    }),
    recents,
  });
  // On retient les phrases dites, pour ne pas les répéter aux prochains matchs.
  ecrire("speakerRecents", av.commentaires.map(l => l.id).concat(recents).slice(0, 80));
  clearTimeout(voixIntro);
  voixIntro = setTimeout(() => { if (faceAFaceOuvert && !S.passe) voix.dire(av.commentaires); }, reduitMouvement() ? 0 : 1300);
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
// Le match commence : les boutons des signes doivent être à l'écran (la page a pu rester descendue sur l'écran de fin).
function montrerSignes() { window.scrollTo(0, 0); $("moves").scrollIntoView({ block: "nearest" }); }
function commencerSolo() {
  $("faceoff").classList.remove("show"); faceAFaceOuvert = false; montrerSignes();
  if (S.matchJour) noterMatchDuJour({ abandon: true });   // un seul essai : quitter en route compte comme un abandon
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
  const carriere = !!S.carriere;
  S.tour = null; nouvelleSeance();
  if (carriere) aller("viewCarriere");
});

// ---------------------------------------------------------------- fiche joueur
function rafraichirAvatars() {
  $("miniBot").innerHTML = avatarSVG(OPP.av); $("botName").textContent = OPP.nom;
  $("miniAv").innerHTML = avatarSVG(P.av); $("pseudoMe").textContent = nomAffiche(P);
  majDecouverte();   // (la fiche a pu changer : le menu s'ouvre au fil des matchs)
}

// ---------------------------------------------------------------- Ma fiche : 3 sous-onglets (Ma carte, Mes stats, Palmarès)
function ongletFiche(o) {
  document.querySelectorAll("#ficheOnglets button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.o === o)));
  [["carte", "ficheCarte"], ["stats", "ficheStats"], ["palmares", "fichePalmares"]].forEach(([k, id]) => { $(id).hidden = k !== o; });
  ecrire("ongletFiche", o);
}
$("ficheOnglets").addEventListener("click", e => { const b = e.target.closest("button[data-o]"); if (b) ongletFiche(b.dataset.o); });
ongletFiche(["carte", "stats", "palmares"].includes(lire("ongletFiche", "carte")) ? lire("ongletFiche", "carte") : "carte");

// ---------------------------------------------------------------- créer son compte, facilement
// Sans compte : un bouton bien visible dans le menu Jouer, un encadré à la fin des matchs, et « Mon compte » en haut de Ma fiche.
// Connecté : « Mon compte » rejoint les Options (audit du 10 octobre, point D).
const placeCompte = $("placeCompteOptions");
function placerCompte(connecte) {
  $("hubHors").hidden = connecte;
  if (connecte) $("compteFin").hidden = true;
  if (connecte) placeCompte.after($("cCompte"));
  else $("viewProfile").querySelector("section.card").after($("cCompte"));   // juste sous l'en-tête de la fiche
}
function versCompte() {
  aller(compteUI?.session()?.user ? "viewOptions" : "viewProfile");
  $("cCompte").open = true;
  $("cCompte").scrollIntoView({ block: "start" });
  setTimeout(() => $("inEmail")?.focus(), 300);
}
$("hubHors").addEventListener("click", versCompte);
$("compteFinBtn").addEventListener("click", versCompte);

// ---------------------------------------------------------------- la première visite
// Le menu « Jouer » s'ouvre au fil des matchs ; au tout début, un écran de bienvenue propose un premier match contre Bambi.
// « Tout afficher » est gardé dans la fiche (donc avec le compte, sur tous les téléphones) et sur ce téléphone.
const menuComplet = () => !!(P.menuComplet || lire("menuComplet"));
if (lire("menuComplet") && !P.menuComplet) { P.menuComplet = true; sauverP(); }   // (un ancien « Tout afficher » rejoint le compte)
function majDecouverte() {
  const n = palier(P.matchs, menuComplet());
  document.body.dataset.decouverte = String(n);
  $("accueil").hidden = n !== 0; $("menuSuite").hidden = n >= 5;
}
// ---------------------------------------------------------------- le match du jour
// Chaque jour, le même adversaire (et le même tirage) pour tout le monde, un seul essai, un résultat à partager.
const resultatsDuJour = () => lire("matchsDuJour") || {};
function noterMatchDuJour(r) {
  const { jour, numero, bot } = S.matchJour;
  ecrire("matchsDuJour", garder(resultatsDuJour(), jour, { numero, bot, ...r }));
  renderMatchDuJour();
}
function renderMatchDuJour() {
  const jour = jourParis(), m = matchDuJour(jour), b = botParId(m.bot), res = resultatsDuJour(), r = res[jour], s = serie(res, jour);
  $("mdjAv").innerHTML = avatarSVG(b.av);
  $("mdjTitre").textContent = `📅 Match du jour n° ${m.numero}`;
  $("mdjJouer").hidden = !!r; $("mdjPartager").hidden = !r;
  const feu = s > 1 ? ` · 🔥 ${s} jours` : "";
  $("mdjEtat").textContent = r ? `${r.abandon ? "🏳️ Abandon" : `${r.gagne ? "✅ Victoire" : "❌ Défaite"} ${r.score.join("–")}`}${feu} · nouveau match demain`
    : `Contre ${b.nom} 🤖 · un set de 7, un seul essai${s ? ` · 🔥 ${s} jour${s > 1 ? "s" : ""}` : ""}`;
}
$("mdjJouer").addEventListener("click", () => {
  if (D && !D.fini) return;
  const jour = jourParis(), mj = matchDuJour(jour);
  if (resultatsDuJour()[jour]) { renderMatchDuJour(); return; }
  voix.arreter(); arreterMinuteur(); if (S) clearTimeout(S.decompte);
  OPP = botParId(mj.bot); WIN = FORMAT_DU_JOUR.setsGagnants;
  S = {
    match: nouveauMatch({ ...FORMAT_DU_JOUR }),
    stats: nouvellesStats(), annonces: avecAudible(nouvelEtatAnnonces({ anciens: commentairesRecents(), genre: P.genre })), suivi: new Suivi(),
    tour: null, occupe: false, enJeu: false, matchJour: mj, hasard: hasardGraine(mj.graine),
  };
  preparerEcranMatch();
  $("startCard").hidden = true; $("tourCard").hidden = true;
  $("ruleTxt").textContent = `Match du jour n° ${mj.numero} contre ${OPP.nom} · ${texteFormat(S.match.format)}`;
  rafraichirAvatars(); render();
  aller("viewMatch");
  ouvrirFaceAFace();
});
async function partagerMatchDuJour() {
  const jour = jourParis(), r = resultatsDuJour()[jour];
  if (!r) return;
  const texte = texteAPartager(r, { nomBot: botParId(r.bot)?.nom || r.bot, serie: serie(resultatsDuJour(), jour) });
  const t = $("toast");
  try {
    if (navigator.share) { await navigator.share({ text: texte }); return; }
    await navigator.clipboard.writeText(texte);
    t.textContent = "📋 Résultat copié : colle-le dans un message !";
  } catch (e) {
    if (e?.name === "AbortError") return;
    t.textContent = texte;
  }
  t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 6000);
}
$("mdjPartager").addEventListener("click", partagerMatchDuJour);
$("mdjPartagerFin").addEventListener("click", partagerMatchDuJour);
renderMatchDuJour();

function toutLeMenu() { ecrire("menuComplet", true); P.menuComplet = true; sauverP(); majDecouverte(); }
$("toutLeMenu").addEventListener("click", toutLeMenu);
$("toutLeMenu2").addEventListener("click", toutLeMenu);
$("premierMatch").addEventListener("click", () => {
  if (D && !D.fini) return;
  voix.arreter(); arreterMinuteur(); if (S) clearTimeout(S.decompte);
  OPP = botParId(PREMIER_MATCH.bot); WIN = PREMIER_MATCH.setsGagnants;
  S = {
    match: nouveauMatch({ pointsParSet: PREMIER_MATCH.pointsParSet, setsGagnants: PREMIER_MATCH.setsGagnants }),
    stats: nouvellesStats(), annonces: avecAudible(nouvelEtatAnnonces({ anciens: commentairesRecents(), genre: P.genre })), suivi: new Suivi(),
    tour: null, occupe: false, enJeu: false, premier: true,
  };
  preparerEcranMatch();
  $("startCard").hidden = true; $("tourCard").hidden = true;
  $("ruleTxt").textContent = `Premier match contre ${OPP.nom} · ${texteFormat(S.match.format)}`;
  $("coach").textContent = conseil(0, null); $("coach").hidden = false;
  rafraichirAvatars(); render();
  aller("viewMatch");
  ouvrirFaceAFace();
});

// Le rang de la carte ouvre des familles de surnoms : on retient le plus haut atteint (renvoie les annonces des paliers ouverts).
function retenirRang() {
  const annonces = monterRang(P, rangDe(P, monClassement).numero);
  if (annonces.length) sauverP();
  return annonces;
}
// Mon surnom : un nom et un qualificatif, parmi ceux débloqués (rangés par famille) ; « il » ou « elle ».
function renderSurnom() {
  retenirRang();
  const sn = surnomDe(P), noms = debloques(NOMS, P), quals = debloques(QUALIFICATIFS, P);
  $("surnomApercu").textContent = sn.texte;
  const optionsSurnom = (liste, actuel) => Object.keys(FAMILLES_SURNOM).map(f => {
    const l = liste.filter(x => x.famille === f);
    return l.length ? `<optgroup label="${esc(FAMILLES_SURNOM[f].titre)}">${l.map(x => `<option value="${x.id}"${x.id === actuel ? " selected" : ""}>${esc(x.t)}</option>`).join("")}</optgroup>` : "";
  }).join("");
  $("inSurnomNom").innerHTML = optionsSurnom(noms, sn.nom.id);
  $("inSurnomComp").innerHTML = optionsSurnom(quals, sn.complement.id);
  $("surnomCompte").textContent = `${noms.length} nom${noms.length > 1 ? "s" : ""} sur ${NOMS.length} et ${quals.length} qualificatif${quals.length > 1 ? "s" : ""} sur ${QUALIFICATIFS.length} débloqués : ${noms.length * quals.length} combinaisons.`;
  // Ce qu'il reste à débloquer, famille par famille, et comment.
  const restants = [...aDebloquer(NOMS, P), ...aDebloquer(QUALIFICATIFS, P)];
  $("surnomVerrouTitre").textContent = `Surnoms à débloquer (${restants.length})`;
  $("surnomVerrou").innerHTML = Object.keys(FAMILLES_SURNOM).map(f => {
    const l = restants.filter(x => x.famille === f);
    if (!l.length) return "";
    const aide = FAMILLES_SURNOM[f].palier ? `<br><small>${esc(l[0].aide)}</small>` : "";
    const mots = FAMILLES_SURNOM[f].palier ? `<p class="hint">${l.map(x => esc(x.t)).join(" · ")}</p>`
      : `<ul>${l.map(x => `<li><b>${esc(x.t)}</b> · ${esc(x.aide)}</li>`).join("")}</ul>`;
    return `<p class="lbl">${esc(FAMILLES_SURNOM[f].titre)}${aide}</p>${mots}`;
  }).join("");
  document.querySelectorAll("#segGenre button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === P.genre)));
  document.querySelectorAll("#segPoignee button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === P.poignee)));
  // Les cris gratuits, et ceux achetés à la boutique ; de même pour le geste, la célébration et le cadre.
  $("inCri").innerHTML = CRIS.filter(c => possede(P, "cri", c.id)).map(c => `<option value="${c.id}"${c.id === P.cri ? " selected" : ""}>${esc(libelleCri(c.id))}${c.boutique ? " 🛍️" : ""}</option>`).join("");
  const options = (type, table, actuel) => Object.keys(table).filter(k => !estVerrouille(P, type, k)).map(k => `<option value="${k}"${k === actuel ? " selected" : ""}>${esc(table[k].nom)}</option>`).join("");
  $("inGeste").innerHTML = options("geste", GESTES, P.geste);
  $("inCelebration").innerHTML = options("celebration", CELEBRATIONS, P.celebration);
  $("inCadre").innerHTML = options("cadre", CADRES, P.cadre);
}
const choisirSurnom = () => { P.surnom = { nom: $("inSurnomNom").value, complement: $("inSurnomComp").value }; sauverP(); renderSurnom(); };
$("surnomHasard").addEventListener("click", () => { P.surnom = surnomAuHasard(P); sauverP(); renderSurnom(); });
$("inSurnomNom").addEventListener("change", choisirSurnom);
$("inSurnomComp").addEventListener("change", choisirSurnom);
document.querySelectorAll("#segGenre button").forEach(b => b.addEventListener("click", () => { P.genre = b.dataset.v; sauverP(); renderSurnom(); }));
document.querySelectorAll("#segPoignee button").forEach(b => b.addEventListener("click", () => { P.poignee = b.dataset.v; sauverP(); renderSurnom(); }));
$("inCri").addEventListener("change", e => { P.cri = criValide(e.target.value); sauverP(); });
$("inGeste").addEventListener("change", e => { P.geste = gesteValide(e.target.value); sauverP(); });
$("inCelebration").addEventListener("change", e => { P.celebration = celebrationValide(e.target.value); sauverP(); });
$("inCadre").addEventListener("change", e => { P.cadre = e.target.value in CADRES ? e.target.value : "aucun"; sauverP(); renderCarte(); });

function renderFiche() {
  renderSurnom(); renderCarte();
  $("vitrineFiche").innerHTML = vitrineHTML() + (C ? "" : `<p class="hint">Gagne-les dans Jouer › 🏅 Carrière solo.</p>`);
  $("pAv").innerHTML = avatarSVG(P.av);
  afficherNomFiche();
  $("pTitle").textContent = dernierTitre(P);
  $("pElo").textContent = `Niveau d'entraînement : ${P.elo}`;
  $("pNiveauAide").hidden = monClassement === null;
  $("pClassement").hidden = monClassement === null; $("pClassement").textContent = monClassement === null ? "" : texteNiveauFiche(monClassement, mesDuelsOfficiels, maDivision);
  $("kM").textContent = P.matchs;
  $("kW").textContent = P.matchs ? Math.round(100 * P.victoires / P.matchs) + " %" : "–";
  $("kS").textContent = P.serieEnCours;
  $("pEmpty").textContent = P.matchs ? "" : "Joue ton premier match pour remplir ta fiche.";
  ["cGame", "cMental", "cRecords", "cElo", "cLast"].forEach(id => { $(id).hidden = !P.matchs; });
  $("ficheStatsVide").hidden = !!P.matchs;

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
      // Le nom de l'adversaire se touche : notre face-à-face.
      const qui = nom ? ` contre <button class="linkbtn nom-adv" data-adv="${esc(d.adv)}" data-nom="${esc(nom)}">${esc(nom)}</button>` : "";
      return `<div class="ln"><span>${d.gagne ? "✅ Victoire" : "❌ Défaite"} ${d.sets}${qui}</span><span style="font-weight:400;color:var(--muted)">${esc(d.detail)}</span></div>`;
    }).join("");
  }
  // Le palmarès : les trophées, famille par famille.
  const obtenus = TITRES.filter(t => P.titres[t.id]).length;
  $("palmaresCompte").textContent = `${obtenus} trophée${obtenus > 1 ? "s" : ""} sur ${TITRES.length}`;
  $("badges").innerHTML = FAMILLES.map(f => {
    const liste = TITRES.filter(t => t.famille === f.id), n = liste.filter(t => P.titres[t.id]).length;
    return `<h3 class="famille">${f.icone} ${f.nom} <small>${n} / ${liste.length}</small></h3>` + liste.map(t => {
      const on = !!P.titres[t.id];
      return `<div class="badge ${on ? "on" : "off"}"><div class="bn">${on ? "🏅" : "🔒"} ${t.nom}</div><div class="bd">${t.desc}</div>${texteDeblocage(t) ? `<div class="bu">Débloque ${esc(texteDeblocage(t))}</div>` : ""}</div>`;
    }).join("");
  }).join("");
  renderEditeur();
}

function renderEditeur() {
  $("avApercu").innerHTML = avatarSVG(P.av);             // l'aperçu reste visible pendant qu'on fait défiler les choix
  const mk = (el, type, table, texte) => {
    el.innerHTML = Object.keys(table).map(k => {
      const ferme = estVerrouille(P, type, k), label = texte ? table[k] : table[k][0];
      return `<button data-k="${k}" class="${texte ? "txt " : ""}${ferme ? "locked" : ""}${articleDe(type, k) ? " boutique" : ""}" aria-pressed="${P.av[type] === k}" aria-label="${label}${ferme ? ", verrouillé" : ""}" title="${label}" ${texte ? "" : `style="background:${table[k][2] || table[k][1]}"`}>${texte ? label : type === "gant" && k === "nu" ? "✋" : ""}</button>`;
    }).join("");
    el.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
      const k = b.dataset.k, t = verrouDe(type, k);
      if (estVerrouille(P, type, k)) {
        const x = articleDe(type, k);
        $("lockNote").innerHTML = gantAttendPremierMatch(P, type, k) ? "🧤 Les gants se débloquent après ton premier match. En attendant : la main nue !"
          : t ? `Verrouillé. Obtiens le titre « ${esc(t.nom)} » : ${esc(t.desc.charAt(0).toLowerCase() + t.desc.slice(1))}`
          : `🛍️ « ${esc(x.nom)} » est en vente à la boutique : ${x.prix} jetons. <button class="linkbtn" data-aller="viewBoutique">Voir la boutique</button>`;
        return;
      }
      $("lockNote").textContent = ""; P.av[type] = k; sauverP(); renderFiche(); rafraichirAvatars();
    }));
  };
  mk($("swSymbole"), "symbole", SYMBOLES, true); mk($("swBg"), "fond", FONDS); mk($("swGlove"), "gant", GANTS); mk($("swWrist"), "poignet", POIGNETS); mk($("swMotif"), "motif", MOTIFS, true); mk($("swGantMotif"), "gantMotif", MOTIFS_GANT, true);
  $("choixPoignet").hidden = P.av.gant === "nu";   // pas de bandeau sur la main nue
  mk($("swPeau"), "peau", PEAUX); mk($("swOngles"), "ongles", ONGLES); mk($("swBracelet"), "bracelet", BRACELETS); mk($("swBague"), "bague", BAGUES);
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
// Le pseudo, proposé sur l'écran de fin tant que le joueur n'en a pas.
$("okNomFin").addEventListener("click", () => {
  const nom = $("inNomFin").value.replace(/[#\u0000-\u001f]/g, "").slice(0, 16).trim();
  if (nom.length < 2) { $("inNomFin").focus(); return; }
  P.pseudo = nom; sauverP(); $("inPseudo").value = nom;
  afficherNomFiche(); rafraichirAvatars();
  $("nomFin").hidden = true;
});
$("inNomFin").addEventListener("keydown", e => { if (e.key === "Enter") $("okNomFin").click(); });
$("resetProfile").addEventListener("click", () => {
  if (!confirm("Remettre ta fiche à zéro ? Tes statistiques et titres seront effacés.")) return;
  P = remettreAZero(P); C = null; sauverP(); renderFiche(); rafraichirAvatars(); afficherBilan();
});

// ---------------------------------------------------------------- navigation
// Trois onglets (Jouer, Cercles, Ma fiche) et la roue des Options. L'onglet « Jouer » est un menu
// qui mène aux pages Partie rapide, Défier un ami, Tournois (Programmés, Sit & Go, Mes tournois) et Entraînement.
const VUES = ["viewJouer", "viewCompet", "viewCarriere", "viewRapide", "viewMatch", "viewDuel", "viewSng", "viewFreeroll", "viewBoutique", "viewTournois", "socTournoi", "socTournoiNouveau", "viewCercles", "viewProfile", "viewOptions"];
const ONGLET_DE = { viewJouer: "jouer", viewCompet: "jouer", viewCarriere: "jouer", viewRapide: "jouer", viewMatch: "jouer", viewDuel: "jouer", viewSng: "jouer", viewFreeroll: "jouer", viewBoutique: "profile", viewTournois: "jouer", viewCercles: "cercles", viewProfile: "profile" };
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
  if (vue === "viewMatch") majDossierBot();
  if (vue === "viewCarriere") renderCarriere();   // le bilan en bref sous le bot choisi (à jour après un match)
  if (vue === "viewDuel") duelsUI?.rafraichir();
  if (vue === "viewCercles" || vue === "viewTournois") cerclesUI?.rafraichir();
  if (vue === "viewSng") sngUI?.rafraichir();
  if (vue !== "viewMatch") jetonsUI?.rafraichir();   // le solde, en haut de l'écran, reste à jour (achats, gains)
  if (vue === "viewJouer") { defisUI?.rafraichir(); renderMatchDuJour(); }
  if (vue === "viewFreeroll") { freerollUI?.rafraichir(); programmesUI?.rafraichir(); }
  if (vue === "viewBoutique") boutiqueUI?.rafraichir();
  window.scrollTo(0, 0);
}
document.querySelectorAll(".tabs button").forEach(b => b.addEventListener("click", () => aller({ jouer: "viewJouer", cercles: "viewCercles", profile: "viewProfile" }[b.dataset.v])));
document.addEventListener("click", e => { const b = e.target.closest("[data-aller]"); if (b) aller(b.dataset.aller); });
$("btnOptions").addEventListener("click", () => aller(vueCourante === "viewOptions" ? avantOptions : "viewOptions"));
$("optionsRetour").addEventListener("click", () => aller(avantOptions));

// Les alertes en haut du menu « Jouer » (et la pastille de l'onglet).
const alertes = { duels: { recus: 0, enCours: 0, rdv: 0, rdvNouveaux: 0 }, tournois: [], sng: null, freeroll: null, programme: null };
function signaler(cle, valeur) { alertes[cle] = valeur; renderAlertes(); }
function renderAlertes() {
  const a = alertes, carte = (attr, icone, titre, texte) => `<button class="hub alerte" ${attr}><span class="hub-i">${icone}</span><span><b>${titre}</b><small>${texte}</small></span></button>`;
  $("hubAlertes").innerHTML = [
    a.duels.enCours ? carte('data-aller="viewDuel"', "▶️", "Duel en cours", "Touche pour le reprendre") : "",
    a.duels.rdv ? carte('data-aller="viewDuel"', "✅", `${a.duels.rdv > 1 ? `${a.duels.rdv} défis acceptés` : "Défi accepté"} : à jouer`, "Touche « Rejoindre » : le match démarre quand vous êtes là tous les deux") : "",
    a.duels.recus ? carte('data-aller="viewDuel"', "📨", `${a.duels.recus} défi${a.duels.recus > 1 ? "s" : ""} reçu${a.duels.recus > 1 ? "s" : ""}`, "Accepte ou refuse") : "",
    ...a.tournois.map(t => carte(`data-tournoi="${t.id}"`, "🏆", "Ton match de tournoi t'attend", esc(t.nom))),
    a.freeroll ? carte('data-aller="viewFreeroll"', "🌙", a.freeroll.phase === "en_cours" ? "Le freeroll est en cours" : "Le freeroll commence à 20 h", "Garde l'appli ouverte : ton match se lance tout seul") : "",
    a.programme ? carte('data-aller="viewFreeroll"', "🗓️", a.programme.phase === "en_cours" ? `${esc(a.programme.nom)} est en cours` : `${esc(a.programme.nom)} commence bientôt`, "Garde l'appli ouverte : ton match se lance tout seul") : "",
    a.sng ? carte('data-aller="viewSng"', "⚡", a.sng.phase === "inscriptions" ? "Tu es en salle de Sit & Go" : "Ton Sit & Go est en cours", "Garde l'appli ouverte") : "",
  ].join("");
  const n = a.duels.recus + (a.duels.rdvNouveaux || 0) + a.tournois.length;   // la carte « Défi accepté » reste, sans pastille une fois vu
  $("pastilleJouer").hidden = !n; $("pastilleJouer").textContent = n;
}
$("hubAlertes").addEventListener("click", e => { const b = e.target.closest("[data-tournoi]"); if (b) cerclesUI.ouvrirTournoi(b.dataset.tournoi); });

// Pendant un match, l'écran de jeu prend toute la place (pas d'onglets).
function majModeMatch() {
  const enMatch = !!(S && S.enJeu && (!S.match.termine || S.pauseFin));
  document.body.classList.toggle("en-match", enMatch);
  ambiance.fond(enMatch);                                  // le murmure du public, pendant tout le match
  $("quitterSoloZone").hidden = !enMatch || !!S.duel;
}
$("quitterSolo").addEventListener("click", () => {
  if (!confirm("Quitter le match ? Il ne sera pas compté.")) return;
  const carriere = !!S.carriere;
  nouvelleSeance();
  if (carriere) aller("viewCarriere");
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
  majDossierBot();
}
// Sous le bot choisi : notre bilan en bref ; le toucher ouvre le face-à-face complet (bilan, ses signes, son dossier).
function majDossierBot() {
  const f = P.faceAFace[amicalId], v = f?.v || 0, d = f?.d || 0;
  $("oppFiche").textContent = `📊 Notre face-à-face${v + d ? ` (${v} – ${d})` : ""} et son dossier`;
}
$("oppFiche").addEventListener("click", () => ouvrirFicheAdv(amicalId, botParId(amicalId).nom, { jouer: false }));
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
  S.tour = T.tour; S.passe = false;   // (avoir passé la présentation du tour précédent ne coupe pas celle-ci)
  renderFormat(); render(); rafraichirAvatars(); ouvrirFaceAFace();
});
$("tQuit").addEventListener("click", () => {
  if (!T.fini && !confirm("Abandonner le tournoi en cours ?")) return;
  T = null; sauverT(); nouvelleSeance();
});
$("tNext").addEventListener("click", () => {
  terminerTour(T, lenTournoi()); if (T.elimine) while (!T.fini) terminerTour(T, lenTournoi());
  sauverT(); nouvelleSeance();
});

// ---------------------------------------------------------------- la carrière
// 5 circuits de 12 joueurs contre les bots (règles : carriere-logique.js). Autant de matchs qu'on veut, quand on veut.
function jouerCarriere() {
  if (D && !D.fini) return;
  const pm = prochainMatch(C); if (!pm) return;
  voix.arreter(); arreterMinuteur(); if (S) clearTimeout(S.decompte);
  OPP = botParId(pm.adv); WIN = pm.format.setsGagnants;
  S = {
    match: nouveauMatch(pm.format),
    stats: nouvellesStats(), annonces: avecAudible(nouvelEtatAnnonces({ anciens: commentairesRecents(), genre: P.genre })), suivi: new Suivi(),
    tour: null, occupe: false, enJeu: false, carriere: { circuit: C.ou, etape: pm.etape, cle: pm.cle, coupe: !!pm.coupe, voix: pm.voix },
  };
  preparerEcranMatch();
  $("startCard").hidden = true; $("tourCard").hidden = true;
  $("ruleTxt").textContent = `${CIRCUITS[C.ou]} · ${pm.etape} · ${texteFormat(pm.format)}`;
  rafraichirAvatars(); render();
  aller("viewMatch");
  const e = enjeuCarriere(pm);
  if (e) ouvrirCeremonie({ ...e, enjeu: true }, () => ouvrirFaceAFace()); else ouvrirFaceAFace();
}
// L'enjeu d'un match décisif, annoncé en grand avant la présentation (quarts, demies, finales, maintien, barrages).
function enjeuCarriere(pm) {
  const k = C.ou, monte = k < CIRCUITS.length - 1 ? `Gagne, et tu montes en ${CIRCUITS[k + 1]} !` : "Gagne, et tu es champion de l'Élite !";
  if (pm.coupe) {
    if (!pm.cle) return null;
    return { sur: "Coupe Monique-Latour", titre: { quarts: "Quart de finale", demis: "Demi-finale", finale: "Finale" }[pm.cle],
      sous: { quarts: "Gagne, et tu es en demi-finale.", demis: "Gagne, et tu joues la finale.", finale: "Gagne, et la coupe est à toi !" }[pm.cle], voix: `speaker_${pm.cle}_01` };
  }
  if (C.phase === "playoffs") return { sur: `Playoffs · ${CIRCUITS[k]}`, titre: { quarts: "Quart de finale", demis: "Demi-finale", finale: "Finale" }[pm.cle],
    sous: { quarts: "Gagne, et tu es en demi-finale.", demis: "Gagne, et tu joues la finale.", finale: monte }[pm.cle], voix: `speaker_${pm.cle}_01` };
  if (C.phase === "maintien") return pm.cle === "finale"
    ? { sur: `Maintien · ${CIRCUITS[k]}`, titre: "Match pour le maintien", sous: `Perds, et tu descends en ${CIRCUITS[k - 1]}.` }
    : { sur: `Maintien · ${CIRCUITS[k]}`, titre: "Demi-finale du maintien", sous: `Gagne, et tu restes en ${CIRCUITS[k]}.` };
  if (C.phase === "barrage") return C.barrage.haut ? { sur: "Barrage d'accession", titre: "Barrage", sous: `Gagne, et tu montes en ${CIRCUITS[k + 1]} !` }
    : { sur: "Barrage du maintien", titre: "Barrage", sous: `Gagne, et tu restes en ${CIRCUITS[k]}.` };
  return null;
}
// L'écran en grand : l'enjeu (avant le match) ou la cérémonie de la coupe (après un titre). apres : à la fermeture.
function ouvrirCeremonie({ sur = "", titre, sous = "", coupe = "", voix: ligne = null, enjeu = false }, apres = () => {}) {
  const ov = $("ceremonie"), vite = reduitMouvement();
  ov.classList.toggle("enjeu", enjeu);
  $("cerSur").textContent = sur; $("cerTitre").textContent = titre; $("cerSous").textContent = sous; $("cerCoupe").innerHTML = coupe;
  $("cerOk").textContent = enjeu ? "Au match !" : "Continuer";
  const hasard = (a, b) => a + Math.random() * (b - a), couleurs = ["#FFD34D", "#F4C542", "#FFFFFF", "#E8574A", "#4DA3FF"];
  $("cerConfettis").innerHTML = enjeu || vite ? "" : Array.from({ length: 80 }, (_, i) =>
    `<i style="left:${hasard(0, 100).toFixed(1)}%;background:${couleurs[i % couleurs.length]};--d:${hasard(2.2, 3.6).toFixed(2)}s;--r:${hasard(0, 1.2).toFixed(2)}s;--x:${Math.round(hasard(-80, 80))}px;--t:${Math.round(hasard(360, 900))}deg"></i>`).join("");
  ov.hidden = false; $("cerOk").focus();
  try { ambiance.initialiser(); if (!enjeu) ambiance.public("ovation", 0.6); } catch { /* sans son */ }
  if (ligne && CATALOGUE.has(ligne)) setTimeout(() => { if (!ov.hidden) voix.dire([CATALOGUE.get(ligne)]); }, 400);
  let fini = false;
  const fermer = () => { if (fini) return; fini = true; ov.hidden = true; $("cerConfettis").innerHTML = ""; apres(); };
  $("cerOk").onclick = fermer;
}
// Le circuit d'un joueur de la carrière (pour la coupe, toutes divisions confondues).
const circuitDe = id => { const k = C?.circuits.findIndex(c => c.includes(id)); return k >= 0 ? CIRCUITS[k].replace("Circuit ", "") : "invité"; };   // (les bots qui ne jouent pas en carrière)
const ligneMatch = (m, gagnant = m.v, avecCircuit = false) => {
  const nomDe = (id, J) => esc(J.nom) + (avecCircuit && id !== "moi" ? ` <small class="car-circ">${circuitDe(id)}</small>` : "");
  const A = infoJoueur(m.a), B = infoJoueur(m.b), cls = x => (gagnant === x ? "win" : gagnant ? "lose" : ""), mien = m.a === "moi" || m.b === "moi" ? " mine" : "";
  return `<div class="bm${mien}"><div class="bp ${cls(m.a)}"><span class="mini">${avatarSVG(A.av)}</span><span class="bn">${nomDe(m.a, A)}</span></div><div class="bs">${m.score || "vs"}</div><div class="bp r ${cls(m.b)}"><span class="bn">${nomDe(m.b, B)}</span><span class="mini">${avatarSVG(B.av)}</span></div></div>`;
};
// Ma vitrine : les 5 coupes (vainqueur des playoffs) et les 5 boucliers (1er de la saison), en gris tant qu'ils ne sont pas gagnés.
function vitrineHTML() {
  const v = vitrine(C), saisons = l => (l.length ? `${l.length > 1 ? `×${l.length} · ` : ""}saison${l.length > 1 ? "s" : ""} ${l.join(", ")}` : "–");
  const rangee = (titre, f, cle) => `<p class="vitrine-titre">${titre}</p><div class="vitrine">` + CIRCUITS.map((nom, k) => {
    const l = v[k][cle];
    return `<div class="vitrine-case${l.length ? " gagnee" : ""}">${f(k, l.length > 0)}<b>${nom.replace("Circuit ", "")}</b><small>${saisons(l)}</small></div>`;
  }).join("") + `</div>`;
  const ml = coupesML(C);
  return rangee("🏆 Les coupes · vainqueur des playoffs", coupeSVG, "coupes")
    + `<p class="vitrine-titre">🏆 La Coupe Monique-Latour · toutes divisions confondues</p><div class="vitrine"><div class="vitrine-case${ml.length ? " gagnee" : ""}">${coupeMLSVG(ml.length > 0)}<small>${saisons(ml)}</small></div></div>`
    + rangee("🛡️ Les boucliers · 1er de la saison régulière", bouclierSVG, "boucliers");
}
// Les onglets de la carrière : rien d'ouvert en arrivant (le prochain match d'abord) ; on touche un onglet pour l'ouvrir.
let ongletCarriere = null;
function majOngletsCarriere() {
  $("carOnglets").hidden = !C;
  document.querySelectorAll("#carOnglets button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.o === ongletCarriere)));
  for (const o of ["classement", "calendrier", "coupe", "palmares"]) $(`carVolet-${o}`).hidden = !C || o !== ongletCarriere;
}
$("carOnglets").addEventListener("click", e => {
  const b = e.target.closest("button[data-o]"); if (!b) return;
  ongletCarriere = ongletCarriere === b.dataset.o ? null : b.dataset.o; majOngletsCarriere();
});
function renderCarriere() {
  majOngletsCarriere(); $("carResume").textContent = "";
  $("carRecommencer").hidden = !C; $("carTableau").innerHTML = ""; $("carCalendrier").innerHTML = ""; $("carVitrine").innerHTML = ""; $("carCoupe").innerHTML = ""; $("carClassement").innerHTML = ""; $("carPalmares").innerHTML = "";
  if (!C) {
    $("carEntete").textContent = "Saison 1 · Circuit Amateur";
    $("carMsg").textContent = "Tu commences en Circuit Amateur, avec 11 bots. Gagne ta place en playoffs, monte de circuit en circuit… jusqu'à l'Élite et ses 12 terreurs.";
    $("carJouer").textContent = "Commencer ma carrière"; return;
  }
  const k = C.ou, pm = prochainMatch(C), adv = pm ? botParId(pm.adv) : null;
  $("carEntete").textContent = `Saison ${C.saison} · ${CIRCUITS[k]} (${k + 1}/${CIRCUITS.length})`;
  const place = C.place ? `${C.place}${C.place === 1 ? "re" : "e"} de la saison. ` : "";
  const sets = pm?.format.setsGagnants === 1 ? `Un set de ${pm.format.pointsParSet} points.` : "2 sets gagnants.";
  $("carMsg").textContent = pm?.coupe ? `${pm.etape} contre ${adv.nom} (niveau ${adv.elo}, ${circuitDe(adv.id)}). ${sets}`
    : C.phase === "fin" ? texteBilan(C)
    : C.phase === "saison" ? `${pm.etape} : contre ${adv.nom} (niveau ${adv.elo}), ${adv.style.charAt(0).toLowerCase()}${adv.style.slice(1)}. ${sets}`
    : C.phase === "barrage" ? (C.barrage.haut ? `Finaliste des playoffs ! Barrage d'accession contre ${adv.nom}, qui joue son maintien en ${CIRCUITS[k + 1]} : gagne, et tu montes. 2 sets gagnants.`
      : `Barrage du maintien contre ${adv.nom}, finaliste du ${CIRCUITS[k - 1]} : gagne, et tu restes en ${CIRCUITS[k]}. 2 sets gagnants.`)
    : `${place}${pm.etape} contre ${adv.nom} (niveau ${adv.elo}). 2 sets gagnants.`;
  // En bref : ma place et ma coupe.
  const maPlace = C.phase === "saison" && C.journee > 0 ? classementCarriere(C).findIndex(l => l.id === "moi") + 1 : null, K0 = C.coupe;
  $("carResume").textContent = [maPlace && `📊 ${maPlace}${maPlace === 1 ? "er" : "e"} ${C.poules ? "de ta poule" : "du classement"}`,
    K0 && `🏆 Coupe : ${K0.vainqueur === "moi" ? "vainqueur !" : K0.elimine !== null ? "éliminé" : `en ${TOURS_COUPE[K0.tour].nom.toLowerCase()}`}`].filter(Boolean).join(" · ");
  $("carJouer").textContent = pm?.coupe ? `Jouer : ${TOURS_COUPE[C.coupe.tour].singulier.toLowerCase()} de la coupe` : C.phase === "fin" ? `Commencer la saison ${C.saison + 1}` : C.phase === "saison" ? `Jouer la journée ${C.journee + 1}` : `Jouer : ${pm.etape.charAt(0).toLowerCase()}${pm.etape.slice(1)}`;
  // Le tableau des playoffs (ou du maintien), et le barrage.
  let h = "";
  if (C.tableau) C.tableau.tours.forEach((R, i) => { h += `<div class="rnd">${NOMS_TOURS[C.tableau.type][i].nom}</div>` + R.map(m => ligneMatch(m)).join(""); });
  if (C.barrage) h += `<div class="rnd">${C.barrage.haut ? "Barrage d'accession" : "Barrage du maintien"}</div>` + ligneMatch({ a: "moi", b: C.barrage.adv, v: C.barrage.v });
  $("carTableau").innerHTML = h;
  // La Coupe Monique-Latour : mon parcours et les tableaux, tour par tour.
  const K = C.coupe;
  $("carCoupe").innerHTML = !K ? `<p class="hint">La Coupe Monique-Latour commence à la saison prochaine.</p>` : `<div class="rnd">🏆 Coupe Monique-Latour</div><p class="hint" style="margin:0 0 6px">${esc(texteCoupe(C))}${K.vainqueur && K.vainqueur !== "moi" ? ` Vainqueur : ${esc(infoJoueur(K.vainqueur).nom)}.` : ""}${!K.vainqueur && !pm?.coupe && K.elimine === null ? ` Prochain tour après la journée ${coupeApres(C, K.tour)}.` : ""}</p>`
    + K.tours.map((R, i) => `<details class="regles car-coupe-tour"${i === K.tours.length - 1 ? " open" : ""}><summary>${TOURS_COUPE[i].nom}${R.some(m => m.v) ? "" : " · tirage"}</summary>`
      + [...R].sort((x, y) => (y.a === "moi" || y.b === "moi") - (x.a === "moi" || x.b === "moi")).map(m => ligneMatch(m, m.v, true)).join("") + `</details>`).join("");
  // Mon calendrier : mes 11 journées, jouées (avec le score) ou à venir, et les tours de la Coupe Monique-Latour glissés entre elles.
  const ligneCal = (cls, b, nom, etat, coupe = false) => `<li class="${cls}${coupe ? " coupe" : ""}">${b ? `<span class="mini">${avatarSVG(b.av)}</span>` : `<span class="mini car-cal-trophee">🏆</span>`}<span class="car-cal-nom">${nom}</span><span class="car-cal-etat">${etat}</span></li>`;
  const resultat = (v, scores) => `${v ? "✅ Victoire" : "❌ Défaite"} ${scores}`;
  const ligneCoupe = r => {
    const K = C.coupe, T = TOURS_COUPE[r], titre = `Coupe · ${T.nom}`;
    const m = K.tours[r]?.find(x => x.a === "moi" || x.b === "moi");
    if (!m) { const elimine = K.elimine !== null && K.elimine < r; return ligneCal(elimine ? "eliminee" : "", null, titre, elimine ? "Éliminé" : "Tirage à venir", true); }
    const adv = botParId(m.a === "moi" ? m.b : m.a), prochain = pm?.coupe && K.tour === r;
    const score = m.score ? (m.a === "moi" ? m.score : m.score.split("–").reverse().join("–")) : "";
    const etat = m.v ? resultat(m.v === "moi", score) : prochain ? "👉 Prochain match" : `Après la J${coupeApres(C, r)}`;
    return ligneCal(m.v ? "jouee" : prochain ? "prochain" : "", adv, `🏆 ${titre}<br><span class="car-cal-adv">${esc(adv.nom)} <small>(${adv.elo})</small></span>`, etat, true);
  };
  $("carCalendrier").innerHTML = `<div class="car-calendrier"><ol>`
    + C.journees.map((j, i) => {
      const adv = j.find(p => p.includes("moi")).find(x => x !== "moi"), b = botParId(adv), r = C.resultats.find(x => x.a === "moi" && x.b === adv);
      const prochain = i === C.journee && C.phase === "saison" && !pm?.coupe;
      const etat = r ? resultat(r.v === "moi", r.scores.map(x => x.join("–")).join(", ")) : prochain ? "👉 Prochain match" : "À jouer";
      return ligneCal(r ? "jouee" : prochain ? "prochain" : "", b, `J${i + 1} · ${esc(b.nom)} <small>(${b.elo})</small>`, etat)
        + (C.coupe ? TOURS_COUPE.map((T, t) => (coupeApres(C, t) === i + 1 ? ligneCoupe(t) : "")).join("") : "");
    }).join("") + `</ol></div>`;
  // Le classement de la saison (en Amateur : les 2 poules).
  const zones = k > 0, qualifies = C.poules ? 4 : QUALIFIES, nbJ = C.journees.length;
  const tableau = (lignes, titre) => (titre ? `<p class="car-poule">${titre}</p>` : "")
    + `<table class="car-classement"><thead><tr><th>#</th><th>Joueur</th><th>J</th><th>V</th><th>D</th><th>+/−</th><th>Pts</th></tr></thead><tbody>`
    + lignes.map((l, i) => {
      const A = infoJoueur(l.id), d = l.pm - l.pc, cls = [l.id === "moi" ? "moi" : "", i < qualifies ? "zone-po" : zones ? "zone-bas" : ""].join(" ").trim();
      return `<tr class="${cls}"><td>${i + 1}</td><td><span class="mini">${avatarSVG(A.av)}</span><span>${esc(A.nom)}</span></td><td>${l.j}</td><td>${l.v}</td><td>${l.d}</td><td>${d > 0 ? "+" : ""}${d}</td><td>${l.pts}</td></tr>`;
    }).join("") + `</tbody></table>`;
  $("carClassement").innerHTML = `<div class="rnd">Classement · ${C.journee} journée${C.journee > 1 ? "s" : ""} sur ${nbJ}</div>`
    + (C.poules ? tableau(classementCarriere(C, 0), "Ma poule (A)") + tableau(classementCarriere(C, 1), "Poule B")
      + `<p class="car-legende">🟩 Les 4 premiers de chaque poule : quarts de finale croisés (1er A – 4e B…), le vainqueur monte.</p>`
      : tableau(classementCarriere(C)) + `<p class="car-legende">🟩 Places 1 à 8 : playoffs, le vainqueur monte.${zones ? " 🟥 Places 9 à 12 : le maintien." : ""}</p>`);
  $("carVitrine").innerHTML = `<div class="rnd">Ma vitrine</div>${vitrineHTML()}`;
  // Le palmarès.
  if (C.palmares.length) {
    const b = bilanCarriere(C);
    $("carPalmares").innerHTML = `<div class="rnd">Mon palmarès</div><p class="hint" style="margin:0">Meilleur circuit atteint : ${CIRCUITS[b.meilleur]}${b.titres ? ` · 🏆 ${b.titres} titre${b.titres > 1 ? "s" : ""} de champion de l'Élite` : ""}</p>`
      + `<ul class="car-palmares">${[...C.palmares].reverse().map(p => `<li>Saison ${p.saison} · ${CIRCUITS[p.circuit]} : ${esc(p.texte)}${p.coupeML ? ` ${esc(p.coupeML.texte)}` : ""}</li>`).join("")}</ul>`
      // Le palmarès de chaque saison : les champions, qui monte et qui descend, du haut vers le bas.
      + [...C.palmares].reverse().filter(p => p.circuits).map((p, i) => `<details class="regles car-saison"${i === 0 ? " open" : ""}><summary>🏆 Palmarès de la saison ${p.saison}</summary>`
        + (p.coupeML?.vainqueur ? `<div class="car-saison-circuit"><b>Coupe Monique-Latour</b><br>🏆 ${esc(infoJoueur(p.coupeML.vainqueur).nom)} <span class="car-sec">(finaliste : ${esc(infoJoueur(p.coupeML.finaliste).nom)})</span></div>` : "")
        + [...p.circuits.keys()].reverse().map(k => {
          const c = p.circuits[k], nom = id => esc(infoJoueur(id).nom), liste = ids => ids.map(nom).join(", ");
          return `<div class="car-saison-circuit"><b>${CIRCUITS[k]}</b><br>🏆 ${nom(c.champion)} <span class="car-sec">(finaliste : ${nom(c.finaliste)})</span>`
            + (c.montes.length ? `<br>⬆️ Montent : ${liste(c.montes)}` : "") + (c.descendus.length ? `<br>⬇️ Descendent : ${liste(c.descendus)}` : "") + `</div>`;
        }).join("") + `</details>`).join("");
  }
}
$("carJouer").addEventListener("click", () => {
  if (!C) { C = nouvelleCarriere(); sauverC(); renderCarriere(); return; }
  if (C.phase === "fin" && !prochainMatch(C)) { saisonSuivante(C); sauverC(); renderCarriere(); window.scrollTo(0, 0); return; }
  jouerCarriere();
});
$("carRecommencer").addEventListener("click", () => {
  if (!confirm("Recommencer ta carrière depuis le Circuit Amateur ? Ton palmarès sera effacé.")) return;
  C = null; sauverC(); renderCarriere();
});
$("carSuite").addEventListener("click", () => { nouvelleSeance(); aller("viewCarriere"); });

// ---------------------------------------------------------------- clavier (ordinateur)
document.querySelectorAll("#moves button").forEach(b => b.addEventListener("click", () => jouer(+b.dataset.m)));
document.addEventListener("keydown", e => {
  if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  const k = { p: 0, c: 1, f: 2 }[e.key.toLowerCase()];
  if (k !== undefined) jouer(k);
});

// ---------------------------------------------------------------- application installable
$("version").textContent = `Version ${VERSION}`;
setTimeout(() => $("demarrage")?.remove(), 3600);   // l'écran de démarrage a fini de s'effacer
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
    P = normaliserProfil(fiche); sauverLocal(); C = P.carriere || null;
    if (assurerSurnom()) sauverP();
    if (vueCourante === "viewCarriere") renderCarriere();
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
    stats: nouvellesStats(), annonces: avecAudible(nouvelEtatAnnonces({ anciens: commentairesRecents(), humain: true, genre: P.genre })), suivi: new Suivi(),
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
  verifierAmi();
  majDuel(duel); battement();
}

// Match de tournoi en ligne : quel tour ? (le speaker l'annonce, et la finale se termine par une interview)
async function reperesTournoi(duel) {
  try {
    const t = await voirTournoi(duel.tournoi_id);
    const m = (t?.matchs || []).find(x => x.id === duel.tournoi_match);
    if (!D || D.id !== duel.id || !m) return;
    D.tourVoix = { 0: "finale", 1: "demis", 2: "quarts", 3: "huitiemes" }[t.nb_tours - m.tour] ?? null;
    D.nbTours = t.nb_tours;
    D.sng = t.mode === "direct" && m.tour === 1;
    D.direct = t.mode === "direct" && !t.freeroll && !t.programme;   // (le trophée « Roi du Sit & Go » ne vaut ni pour le freeroll ni pour les tournois programmés)
    D.grandChelem = t.programme === "grand_chelem";
    D.programme = !!(t.programme || t.freeroll);   // tournoi à heure fixe (le Midi, l'Apéro, le Nocturne, le Grand Chelem, le freeroll)
    // Les commentaires de grand enjeu (« finale », « entrer dans l'Histoire »…) sont réservés aux tournois programmés :
    // en Sit & Go (heads-up compris), les commentateurs traitent chaque match comme un match normal.
    D.tourCommente = D.direct ? null : D.tourVoix;
    S.annonces.finale = D.tourCommente === "finale";
    S.annonces.enjeu = niveauEnjeu({ tour: D.tourCommente, grandChelem: D.grandChelem });
    // Les dialogues d'avant et d'après match : gros tournoi (Grand Chelem) ou petit (les autres) ; rien de spécial en Sit & Go.
    S.annonces.jeu = D.direct ? null : contexteJeu({ tournoi: D.grandChelem ? "gros" : "petit", tour: D.tourVoix });
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
  // La réponse est arrivée pendant la secousse des poings : on la dévoile à la fin de la secousse.
  const resteSecousse = (D.secoueFin || 0) - performance.now();
  if (resteSecousse > 0 && (duel.coups || []).length > S.match.coups.length) {
    D.enAttente = duel; clearTimeout(D.secoueT);
    D.secoueT = setTimeout(() => { D && (D.secoueFin = 0, majDuel(D.enAttente)); }, resteSecousse);
    return;
  }
  D.duel = duel;
  afficherMessages(duel);
  const m = S.match, n = (duel.coups || []).length;

  // 1. Les coups révélés depuis la dernière fois (rattrapage si plusieurs).
  if (m.coups.length < n && !m.termine) {
    while (m.coups.length < n - 1) { const c = coupVuDe(duel.coups[m.coups.length], D.moi); afficherCoup(c.a, c.b, c.auto, { silencieux: true }); }
    const c = coupVuDe(duel.coups[n - 1], D.moi);
    S.occupe = true; arreterMinuteur(); boutons(false);
    ambiance.raquette(c.a, grandMoment(m));   // le coup de raquette au moment où les deux signes se dévoilent
    afficherCoup(c.a, c.b, c.auto);
    if (!coherent(m, duel, D.moi)) {   // ne devrait jamais arriver : on se recale sur le serveur
      const r = rejouer(duel, D.moi); S.match = r.match; render(); renderHistorique();
    }
  }

  // 2. La phase du duel. Un match en cours reste à l'écran (filet de sécurité : si un autre écran s'est ouvert par-dessus).
  if (["presentation", "jeu", "entre_sets"].includes(duel.phase) && vueCourante !== "viewMatch") ouvrirOnglet("match");
  if (duel.phase === "presentation") {
    if (!D.presente) { D.presente = true; ouvrirFaceAFace(); }
  } else if (duel.phase === "jeu") {
    if (faceAFaceOuvert) { fermerFaceAFace(); montrerSignes(); annoncer([annonceDebutSet(S.match)]); bullesDepart(duel); }
    if (!$("msgFenetre").hidden && $("msgFenetre").dataset.moment === "avant") fermerMessages();   // le match commence : trop tard pour le mot d'avant-match
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
  // Les deux signes se dévoilent ensemble, comme contre un bot d'entraînement : en attendant la réponse du serveur,
  // les poings se secouent (au moins le temps d'une secousse complète) et le bouton choisi reste en surbrillance.
  if (reduitMouvement()) { $("hMe").textContent = "❔"; $("hMe").className = "hand attend"; $("hBot").textContent = "❔"; $("hBot").className = "hand attend"; }
  else { secouerLesPoings(); D.secoueFin = performance.now() + SECOUSSE_MS; }
  document.querySelector(`#moves button[data-m="${signe}"]`)?.classList.add("choisi");
  // Pas de texte pendant la secousse : seulement les poings. Si l'adversaire (un humain) réfléchit encore au bout
  // de 2,5 s, on l'indique, pour qu'on ne croie pas l'appli bloquée.
  const mancheJouee = d.manche;
  setTimeout(() => { if (D && !D.fini && D.mancheEnvoyee === mancheJouee && S.match.coups.length < mancheJouee) $("verdict").textContent = `En attente de ${OPP.nom}…`; }, 2500);
  serveur.jouer(D.id, d.manche, signe).then(majDuel).catch(e => {
    if (!D) return;
    if (/déjà terminé|déjà joué|Temps écoulé/.test(e.message)) { battement(); return; }
    D.mancheEnvoyee = null; D.secoueFin = 0; $("verdict").textContent = e.message;
    for (const id of ["hMe", "hBot"]) { $(id).textContent = "❔"; $(id).className = "hand"; }   // le coup n'est pas parti : on arrête les poings
    duelReprendre();
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

// Un duel est-il encore en cours ? Un duel fini compte encore tant que sa fin (célébration, poignée de main, écran de fin)
// se déroule sur l'écran de match ; si on a quitté cet écran, il ne bloque plus rien.
const duelOccupe = () => !!D && (!D.fini || (!D.finVue && vueCourante === "viewMatch") || !$("msgFenetre").hidden);   // (on finit d'écrire son message)
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
  D.arret?.(); clearInterval(D.boucle); clearInterval(D.guetteFin); clearTimeout(D.decompte); arreterMinuteur();
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
// Après n'importe quel match : retour au menu « Jouer » (le match est déjà enregistré).
$("finAccueil").addEventListener("click", () => { if (D) quitterDuel(); else nouvelleSeance(); aller("viewJouer"); });
$("encoreRapide").addEventListener("click", () => { quitterDuel(); if (!D) nouvelleSeance(); aller("viewRapide"); });
$("voirTournoi").addEventListener("click", () => { const id = D?.duel?.tournoi_id; quitterDuel(); if (id) cerclesUI.ouvrirTournoi(id); });
$("revanche").addEventListener("click", async () => {
  const f = S.match.format, adv = OPP.uid;
  $("revanche").disabled = true;
  try {
    await serveur.creer(adv, f.pointsParSet, f.setsGagnants, D?.duel?.classe !== false, D?.duel?.mise || 0, D?.duel?.enjeu || null);
    quitterDuel(); ouvrirOnglet("duel");
    $("duelMsg").textContent = `Revanche proposée à ${OPP.nom} ! La partie démarre dès que ${OPP.nom} accepte.`;
  } catch (e) { $("revanche").disabled = false; $("verdict").textContent = e.message; }
});

duelsUI = installerDuels({
  compte: compteUI,
  signaler,
  lancerDuel,
  duelEnCours: duelOccupe,
  ouvrirOnglet,
  ouvrirAmi: id => cerclesUI?.ouvrirAmi(id),
});

// ---------------------------------------------------------------- amis et cercles
cerclesUI = installerCercles({
  compte: compteUI,
  signaler, aller, vueCourante: () => vueCourante,
  ouvrirOnglet,
  defier: p => duelsUI.defier(p),
  dejaDefie: id => !!duelsUI?.dejaDefie(id),
  voirCarte: id => voirCarteDe(id),
  lancerDuel,
  trophees: donnees => gagnerTrophees(accorderTitres(P, titresEnLigne(donnees))),
  surClassement: (points, joues = 0, division = null) => {
    monClassement = points; mesDuelsOfficiels = joues; maDivision = division;
    retenirRang();
    $("pClassement").hidden = points === null; $("pNiveauAide").hidden = points === null;
    $("pClassement").textContent = points === null ? "" : texteNiveauFiche(points, joues, division);
    renderCarte();
  },
});

// Des trophées gagnés hors d'un match (cercles, tournois en ligne) : on le dit dans un bandeau.
let toastT = 0;
function gagnerTrophees(nouveaux) {
  if (!nouveaux.length) return;
  sauverP(); if (vueCourante === "viewProfile") renderFiche();
  const t = $("toast");
  t.textContent = `🏅 Nouveau trophée : ${nouveaux.map(x => x.nom + (texteDeblocage(x) ? ` (débloque ${texteDeblocage(x)})` : "")).join(", ")} !`;
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
    stats: nouvellesStats(), annonces: avecAudible(nouvelEtatAnnonces({ anciens: commentairesRecents(), genre: P.genre })), suivi: new Suivi(),
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
  duelEnCours: duelOccupe,
  jouerBot: jouerBotRapide,
});

jetonsUI = installerJetons({ compte: compteUI });
defisUI = installerDefis({ compte: compteUI, jetons: () => jetonsUI?.rafraichir() });
boutiqueUI = installerBoutique({ compte: compteUI, lireP: () => P, sauverP, jetons: () => jetonsUI?.rafraichir(),
  apresChangement: () => { rafraichirAvatars(); if (vueCourante === "viewProfile") renderFiche(); } });
// Au départ d'un Sit & Go, du freeroll ou d'un tournoi programmé, la page du tournoi s'ouvre… sauf si mon premier match
// est déjà lancé : elle passait sous la présentation du match, et « Passer » faisait alors quitter le match.
const ouvrirTournoiSiLibre = id => { if (!duelOccupe()) cerclesUI.ouvrirTournoi(id); };
freerollUI = installerFreeroll({
  compte: compteUI, signaler,
  ouvrirTournoi: ouvrirTournoiSiLibre,
  chercherMatch: () => { if (!duelOccupe()) duelsUI.rafraichir(); },
  jetons: () => jetonsUI?.rafraichir(),
});
programmesUI = installerProgrammes({
  compte: compteUI, signaler,
  ouvrirTournoi: ouvrirTournoiSiLibre,
  chercherMatch: () => { if (!duelOccupe()) duelsUI.rafraichir(); },
  jetons: () => jetonsUI?.rafraichir(),
});
sngUI = installerSng({
  jetons: () => jetonsUI?.rafraichir(),
  signaler,
  compte: compteUI,
  ouvrirTournoi: ouvrirTournoiSiLibre,
  chercherMatch: () => { if (!duelOccupe()) duelsUI.rafraichir(); },   // mon match suivant est-il lancé ?
});

// ---------------------------------------------------------------- démarrage
renderAdversaires();
nouvelleSeance();
compteUI.surConnexion(session => { placerCompte(!!session?.user); if (session?.user) rattacherAbonnement(); renderNotifs(); });

// ---------------------------------------------------------------- le compteur de visites (étape 43), anonyme
compterVisite(envoyerVisite, premiereFois);
document.addEventListener("visibilitychange", () => { if (!document.hidden) compterVisite(envoyerVisite, false); });   // (appli restée ouverte jusqu'au lendemain)

// ---------------------------------------------------------------- qui est en ligne (étape 39)
// Appli ouverte et à l'écran : « je suis là » toutes les minutes (en match ou pas) ; les amis voient 🟢 ou 🟠.
const enMatchMaintenant = () => !!(S && S.enJeu && !S.match.termine);
function signalerPresence() {
  if (!compteUI.session()?.user || document.hidden) return;
  jeSuisLa(enMatchMaintenant()).catch(() => {});
}
setInterval(signalerPresence, 60000);
document.addEventListener("visibilitychange", signalerPresence);
function surSessionPresence(session) {
  $("presenceZone").hidden = !session?.user; $("carteCacheeZone").hidden = !session?.user;
  $("carteCachee").checked = !!P.carteCachee;
  if (!session?.user) return;
  signalerPresence();
  maPresenceVisible().then(v => { $("presenceVisible").checked = v !== false; }).catch(() => {});
}
compteUI.surConnexion(surSessionPresence);
surSessionPresence(compteUI.session());
$("carteCachee").addEventListener("change", e => { P.carteCachee = e.target.checked; sauverP(); });   // gardé dans la fiche en ligne
$("presenceVisible").addEventListener("change", async e => {
  try { await reglerPresence(e.target.checked); }
  catch { e.target.checked = !e.target.checked; }
});

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
const ouvrirDepuisNotification = cible => { if (cible === "duels") aller("viewDuel"); else if (cible === "tournois") aller("viewTournois"); else if (cible === "freeroll" || cible === "programmes") aller("viewFreeroll"); };
{
  const cible = new URLSearchParams(location.search).get("ouvrir");
  if (cible) { ouvrirDepuisNotification(cible); history.replaceState(null, "", location.pathname + location.hash); }
  navigator.serviceWorker?.addEventListener?.("message", e => {
    if (e.data?.rafraichir) { duelsUI?.rafraichir(); cerclesUI?.rafraichir(); return; }   // une notification arrivée pendant qu'on est dans l'appli
    ouvrirDepuisNotification(e.data?.ouvrir);
  });
}
renderNotifs();
placerCompte(!!compteUI.session()?.user);
