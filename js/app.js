// Écran principal : relie les règles, les bots, les annonces, le son et la fiche joueur.
import { EMOJI, NOM, DUREE_COUP_MS, RESERVE_MS, SONNE_MS, nouveauMatch, jouerCoup, penaliser, depassement, peutSmasher, noterSmash, recupererSmash, issueSmash, gagnantCoup, balle, egaliteFinDeSet, pointDecisif, setDecisif, texteFormat, POINTS_PAR_SET } from "./regles.js";
import { BOTS, BOTS_NOEL, TOUS_LES_BOTS, CATEGORIES_BOTS, categorieDe, botDisponible, derniersBots, botParId, choisirCoup, contexteBot } from "./bots.js";
import { Suivi, indiceImprevisibilite } from "./analyse.js";
import { nouvelEtatAnnonces, annoncerCoup, annonceDebutSet, annoncesAvantMatch, interview, etiquetteDe, situationsDuMatch, niveauEnjeu, contexteJeu, baseDe, silenceAvantBalle, choisirSilence, commentaireMemoire, commentaireMemeOuverture, annoncerPenalite, annonceAvertissement, commentaireStats } from "./annonces.js";
import { surnomDe, NOMS, QUALIFICATIFS, FAMILLES as FAMILLES_SURNOM, debloques, aDebloquer, monterRang, surnomAuHasard, surnomValide, texteDeblocage } from "./surnoms.js";
import { voirTournoi, mesAmis, classements, dossierJoueur, jeSuisLa, reglerPresence, maPresenceVisible, compterVisite as envoyerVisite, compterTroisMatchs as envoyerTroisMatchs, compterMatch as envoyerMatch, compterParcours as envoyerParcours, donnerAvis, publierUne, ficheJoueur, reglerHistorique, monHistoriqueCache, mesDossards } from "./social-serveur.js";
import { ficheVisible, htmlStatsEnLigne, htmlFacesAutres, htmlHistorique } from "./fiche-joueur.js";
import { nouveauxDegats, noterDegats, degatsDe } from "./degats.js";
import { nouveauFeu, noterFeu, feuDe, feuSVG, egalitesDeSuite, trembleDe, EGALITES_ETINCELLE, effetDouble, niveauCoeur, BPM_COEUR } from "./effets.js";
import { compterVisite, compterTroisMatchs, compterMatchJoue, compterPremierMatch, compterEtapePremier, origineIci } from "./visites.js";
import { histoireDuMatch } from "./une-logique.js";
import { filVisible, matchDuDuel, hasardFixe, etapeDuDuel } from "./fil-cercle.js";
import { dessinerUne } from "./une.js";
import { dessinerStats } from "./image-stats.js";
import { carteDe, notesDe, texteRang, rangDe, texteCoefs, partBots, HUMAINS_POUR_CARTE } from "./carte-logique.js";
import { dessinerCarte } from "./carte.js";
import { installerComparaison } from "./comparer-cartes.js";
import { installerNoel, noelActif, pouvoirNoel, remettreBoutons, jourDeNoel } from "./noel.js";
import { STYLES, DELAI_CHOIX_MS, styleValide, styleDuBot, rencontre, compterPoignee, situationPoignee, normaleDe } from "./poignee.js";
import { installerRapide } from "./ecran-rapide.js";
import { installerAvent } from "./ecran-avent.js";
import { FORMAT_GARDIEN } from "./avent-logique.js";
import { installerSignalement } from "./ecran-signaler.js";
import { etatNotifications, activerNotifications, desactiverNotifications, rattacherAbonnement, testerNotification, texteTest } from "./notifications.js";
import { FORMATS_RAPIDES, botProche } from "./rapide-logique.js";
import { MARQUE } from "./marque.js";
import { nouvellesStats, suivreCoup, statsDuMatch } from "./stats-match.js";
import { estFiac } from "./profil.js";
import { jouerRoutine } from "./routines.js";
import { TITRES, FAMILLES, accorderTitres, compterMatchNoel, titresAnnee, titresEnLigne, normaliserProfil, enregistrerMatch, remettreAZero, verrouDe, estVerrouille, gantAttendPremierMatch, reserveAuTenant, nomAffiche, titresObtenus, dernierTitre, signeFavori, tauxSmash, jeuVide } from "./profil.js";
import { tourDe, nouveauTournoi, monMatch, enregistrerMonMatch, terminerTour } from "./tournoi.js";
import { CIRCUITS, QUALIFIES, BARRAGISTE, FORMULE, deuxMontent, NOMS_TOURS, coupeApres, nouvelleCarriere, prochainMatch, enregistrerMonMatch as enregistrerCarriere, classement as classementCarriere, saisonSuivante, texteBilan, bilanCarriere, resumePalmares, resumeCoupe, vitrine, TOURS_COUPE, texteCoupe, coupesML, titresCarriere, coupCarriere, migrerCarriere } from "./carriere-logique.js";
import { coupeSVG, bouclierSVG, coupeMLSVG } from "./coupes.js";
import { presentation, etatPasser } from "./presentation.js";
import { avatarSVG, SYMBOLES, FONDS, GANTS, GANTS_DESSINES, POIGNET_ASSORTI, POIGNETS, MOTIFS, MOTIFS_GANT, MOTIF_COULEURS, MOTIFS_COLORABLES, BRACELETS_COLORABLES, PAYS, PEAUX, ONGLES, BRACELETS, BAGUES } from "./avatar.js";
import { LecteurVoix } from "./voix/lecteur.js";
import { CATALOGUE, ligneDialogue, nbDialogues, DIALOGUES_IDS, POOLS, ligneMoment } from "./voix/script.js";
import { Ambiance, reactionsPublic, egalitesAvantDernier, reactionPoint, intensiteMatch, series } from "./ambiance.js";
import { CRIS, libelleCri, criValide, criDuBot, celebration, commenterCri, couleursConfettis } from "./celebrations.js";
import { lire, ecrire } from "./stockage.js";
import { noterMain, mainDuel, mainDossier, htmlMains, MAX_MAINS, memoireDuDernier, classeCoup, contenuCoup } from "./historique-mains.js";
import { messagesPossibles, momentApres, texteMessage, erreurMessageLibre, nettoyerMessage, PREFIXE_LIBRE, MESSAGE_LIBRE_MAX } from "./messages-rapides.js";
import { VERSION } from "./version.js";
import { installerCompte } from "./ecran-compte.js";
import { clientSupabase } from "./compte.js";
import { suivreEnLigne } from "./en-ligne.js";
import { installerDuels } from "./ecran-duel.js";
import { installerCercles, renderFaceAFace } from "./ecran-cercles.js";
import { duelsAvec, profils as profilsEnLigne, mesDuelsTermines, chercher as chercherJoueurs } from "./duel-serveur.js";
import { jeuDepuisDuels, jeuMoins, estBotEnLigne } from "./stats-passees.js";
import { ajouterOuvertures } from "./ouvertures.js";
import { profilDepuisLigne, etatPseudo, pseudoValide } from "./synchro.js";
import { installerSng } from "./ecran-sng.js";
import { installerJetons } from "./ecran-jetons.js";
import { installerFreeroll } from "./ecran-freeroll.js";
import { installerProgrammes } from "./ecran-programmes.js";
import { palier, nouveautes, conseil, PREMIER_MATCH } from "./decouverte.js";
import { installerTutos } from "./tutos.js";
import { chantsPerso, courtsPerso, soutenu, clePseudo, hashTexte, chantsPersoCommuns, persoCommente } from "./chants-perso.js";
import { LANCEMENT } from "./lancement.js";
import { annonceEnjeu } from "./enjeux.js";
import { repartition, habitudes, piste, lecturesReussies, EMOJIS, NOMS as NOMS_SIGNES, compteVide, compterMatch, additionner, dossier, dossierDetaille } from "./lecture-adversaire.js";
import { modeleFantome } from "./fantome.js";
import { ouvert, proposerAvis } from "./nouveautes.js";   // (les nouveautés : sur la version de test, puis ouvertes à tous une par une)
import { replayVisible, momentDuCoup, tempsFortsMatch, momentDuSet, marquerSet, signesOK, TITRES as TITRES_REPLAY, VERDICTS, texteHabitude } from "./replay.js";
import { FORMAT_DU_JOUR, jourParis, matchDuJour, hasardGraine, grille, serie, texteAPartager, garder, titresSerie, prochainPalier } from "./match-du-jour.js";
import { installerDefis } from "./ecran-defis.js";
import { installerBoutique } from "./ecran-boutique.js";
import { GESTES, CELEBRATIONS, CADRES, ROUTINES, gesteValide, celebrationValide, routineChoisie, articleDe, possede } from "./catalogue.js";
import { gainDuel, exploitsDuMatch, EXPLOITS } from "./jetons-logique.js";
import { texteClassementFin, texteNiveau, provisoire, divisionDe, texteDivision } from "./social-logique.js";
import * as serveur from "./duel-serveur.js";
import { maPlace, vuDe, evenementsDuel, nbEvenements, rejouer, coherent, adversaireHumain, tempsRestant, formatDuel, statsFaceAFace } from "./duel-logique.js";
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
// Une page gardée en mémoire par le téléphone (version d'avant une mise en ligne) avec le programme de la nouvelle version : les
// boutons nouveaux manquent (10 novembre, bandeau « Cannot read properties of null » chez un testeur). On recharge alors la page,
// une seule fois, pour avoir la page et le programme de la même version.
{
  const v = document.querySelector('meta[name="version"]')?.content;
  if (v && v !== VERSION && VERSION !== "dev") {
    let deja = false; try { deja = sessionStorage.getItem("rechargeVersion") === VERSION; sessionStorage.setItem("rechargeVersion", VERSION); } catch { /* sans stockage */ }
    if (!deja) location.reload();
  }
}
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const ORD = ["Premier", "Deuxième", "Troisième", "Quatrième", "Cinquième"];
const reduitMouvement = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------------- état
const fmt = { len: 11, win: 2, ...(lire("format") || {}) };
if (!POINTS_PAR_SET.includes(fmt.len)) fmt.len = 11;
if (![1, 2, 3].includes(fmt.win)) fmt.win = 2;
const lenTournoi = () => (fmt.len >= 7 ? fmt.len : 11);   // le tournoi se joue en sets de 11 ou de 7 points
let WIN = fmt.win;                               // sets gagnants du match en cours (le tournoi l'impose)

const premiereFois = lire("profil") === null;   // (pour le compteur de visites : un téléphone qui découvre HandSlam)
let P = normaliserProfil(lire("profil"));
// (un bot de Noël : pendant les fêtes ; un bot de la carrière : une fois battu)
let amicalId = botParId(lire("adversaire")) && (!botParId(lire("adversaire")).noel || noelActif()) && botDisponible(botParId(lire("adversaire")), P.faceAFace || {}) ? lire("adversaire") : "tictac";   // un adversaire proche du niveau de départ (1200)
let OPP = botParId(amicalId);
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
let aventUI = null, duelsUI = null, cerclesUI = null, sngUI = null, rapideUI = null, jetonsUI = null, freerollUI = null, programmesUI = null, defisUI = null, boutiqueUI = null;
let monClassement = null, mesDuelsOfficiels = 0, maDivision = null;
// « Niveau officiel : 1232 ? · provisoire, encore 9 duels de calibrage »
const texteNiveauFiche = (points, joues, division = null) => `Niveau officiel : ${texteNiveau(points, joues)}` + (LANCEMENT.actif ? "" : ` · ${texteDivision(division ?? divisionDe(points))}`) +
  (provisoire(joues) ? ` · provisoire, encore ${10 - joues} duel${10 - joues > 1 ? "s" : ""} de calibrage` : "");   // niveau officiel (duels entre humains), connu une fois connecté
let panneauOuvert = null, faceAFaceOuvert = false;

// ---------------------------------------------------------------- son
// Les commentaires ne choisissent que des dialogues déjà enregistrés (voir dialogue() dans annonces.js).
const avecAudible = etat => Object.assign(etat, { audible: id => !voix.fichiers.size || voix.fichiers.has(id) });
const voix = new LecteurVoix();
voix.surParole = on => ambiance.parole(on);   // la salle baisse sous la voix des commentateurs
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
// L'introduction instrumentale de l'hymne à l'ouverture (8 novembre, demande du porteur du projet ; 4 s à 20 s de « La Main
// sacrée ») : au premier toucher (un téléphone n'accepte pas de son avant), une fois par jour, si le son et les bruitages sont
// allumés ; elle s'éteint dès qu'un match commence. Sur la version de test, et partout une fois ouvert (ouvert("hymne")).
let introHymne = null;
function jouerIntroHymne() {
  const jour = jourParis();
  if (!ouvert("hymne") || !sonActif || !bruitagesActifs || lire("introHymneJour", null) === jour) return;
  ecrire("introHymneJour", jour);
  try { const a = new Audio("audio/stade_intro_01.mp3"); a.volume = 0.6; a.play().catch(() => {}); introHymne = a; } catch { /* sans son */ }
}
function arreterIntroHymne() {
  const a = introHymne; if (!a) return;
  introHymne = null;
  let v = a.volume; const t = setInterval(() => { v -= 0.1; if (v <= 0) { clearInterval(t); a.pause(); } else a.volume = v; }, 60);
}
document.addEventListener("pointerdown", jouerIntroHymne, { once: true, capture: true });
// L'écran titre (8 novembre, demande du porteur du projet) : à la première ouverture de la journée, le grand logo du démarrage
// reste à l'écran (« Touche l'écran pour entrer ») ; au toucher, l'hymne démarre, le logo reste quelques secondes en musique,
// puis s'efface et l'accueil apparaît.
(function ecranTitre() {
  const el = $("demarrage");
  // (« ?titre » dans l'adresse : l'écran titre et l'hymne quand même, pour les essayer ; version de test seulement)
  const force = ouvert("hymne") && new URLSearchParams(location.search).has("titre");
  if (force) ecrire("introHymneJour", null);
  if (!el || !ouvert("hymne") || !sonActif || !bruitagesActifs || lire("introHymneJour", null) === jourParis()) return;
  el.classList.add("titre"); el.setAttribute("aria-hidden", "false"); el.setAttribute("role", "button"); el.tabIndex = 0;
  el.querySelector(".demarrage-entrer").hidden = false;
  const entrer = () => {
    if (el.classList.contains("entre")) return;
    el.classList.add("entre");
    jouerIntroHymne();
    setTimeout(() => { el.classList.add("part"); setTimeout(() => { el.hidden = true; }, 950); }, reduitMouvement() ? 300 : 2800);
  };
  el.addEventListener("click", entrer);
  el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") entrer(); });
})();
// Le 25 décembre (24 novembre, répliques choisies par le porteur du projet) : au premier toucher de la journée, Roland et Monique
// souhaitent un joyeux Noël, une fois par an (après l'hymne de l'écran titre, s'il joue).
document.addEventListener("pointerdown", () => {
  const annee = new Date().getFullYear();
  if (!jourDeNoel() || lire("noel25Dit", null) === annee) return;
  ecrire("noel25Dit", annee);
  setTimeout(() => {
    if (S?.enJeu || voix.occupe) return;
    const l = (POOLS.noel_25 || []).map(it => ligneMoment(it, { genre: P.genre })).filter(x => x && voix.fichiers.has(x.id));
    if (l.length) voix.dire(l);
  }, 3500);
}, { once: true, capture: true });
// (La voix de synthèse du téléphone, robotique, n'est plus proposée : les répliques sont enregistrées.)
voix.synthese = false;
$("snd").checked = sonActif;
voix.charger().then(() => { ambiance.utiliserFichiers([...voix.fichiers.keys()]); });

$("snd").addEventListener("change", e => {
  sonActif = e.target.checked; ecrire("son", sonActif); if (!sonActif) arreterIntroHymne();
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
// depuis le 20 octobre : 55 caractères, environ 3 secondes à la vitesse des voix ; 62 depuis le 1er novembre ; à 32, une centaine de répliques
// enregistrées n'étaient jamais entendues).
const REPLIQUE_COURTE = 62;   // (la même valeur dans annonces.js : les commentaires trop longs ne sont plus choisis pendant l'échange)
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
// La bronca (gros sifflets, puis l'arbitre demande le calme) : moins rare depuis le 4 novembre (demande du porteur du projet) :
// jamais deux fois en moins de 30 minutes (même d'un match à l'autre), dès le premier match.
const HUEES_ECART_MS = 30 * 60 * 1000;
let matchsDepuisOuverture = 0;
function hueesPermises() { try { return Date.now() - (Number(lire("hueesLe", 0)) || 0) > HUEES_ECART_MS; } catch { return true; } }
// (seulement les répliques vraiment dites : une réplique écartée faute de temps n'est pas « déjà entendue »)
function retenirCommentaires(lignes) {
  const ids = lignes.filter(l => l.role === "commentateur" || l.role === "commentatrice").map(l => baseDe(l.id));
  if (ids.length) try { ecrire("commentairesRecents", [...new Set([...ids, ...commentairesRecents()])].slice(0, 120)); } catch { /* rien */ }
}
function annoncer(lignes, silencieux = false, { enJeu = false, coup = 0 } = {}) {
  if (!lignes.length || silencieux) return;
  if (!enJeu) { retenirCommentaires(lignes); voix.dire(lignes); return; }
  const recent = S && coup - (S.commentaireAuCoup ?? -9) < 2;
  // (les répliques personnalisées passent même juste après un commentaire : en duel, les deux joueurs doivent les entendre)
  // (et l'accueil des nouveaux joueurs, même long : c'est leur premier match, ils ont le temps ; 19 novembre)
  const dites = lignes.filter(l => l.role === "arbitre" || l.id.includes("_accueil_") || ((!recent || l.id.includes("_perso_")) && l.texte.length <= REPLIQUE_COURTE));
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
function fermerPanneau() {
  $("inter").classList.remove("show"); panneauOuvert = null; panneauGo = null;
  for (const id of ["iMsg", "iMsgMoi", "iMsgAdv", "iEcrit"]) $(id).hidden = true;
}

// ---------------------------------------------------------------- minuteur (8 s par coup, puis la réserve de temps)
let raf = 0, tDebut = 0;
function lancerMinuteur() {
  cancelAnimationFrame(raf); tDebut = performance.now(); $("timer").classList.remove("urgent", "reserve");
  ambiance.calmer(true);                                   // l'échange commence : le public baisse la voix
  const m = S.match; m.reserve ||= [RESERVE_MS, RESERVE_MS];
  const reserveDebut = m.reserve[0];
  afficherReserve(reserveDebut);
  // Sonné par le smash réussi du bot : 4 secondes sans pouvoir jouer (la barre, elle, avance).
  if (S.sonne) {
    S.sonne = false; sonner(SONNE_MS, () => { if (S?.match === m && !S.occupe && !m.termine) boutons(true); });
    // (le smash d'un bot de Noël : son pouvoir ; noel.js)
    if (OPP?.noel && !S.carriere) { const nom = pouvoirNoel(OPP.id, SONNE_MS); if (nom) $("verdict").textContent = `💫 ${nom} ! Encore un instant…`; }
  }
  const tick = t => {
    const ecoule = t - tDebut;
    if (ecoule < DUREE_COUP_MS) {
      const reste = 1 - ecoule / DUREE_COUP_MS;
      $("bar").style.transform = `scaleX(${reste})`;
      if (reste < 0.3) $("timer").classList.add("urgent");
    } else {
      // Les 8 secondes sont passées : on puise dans la réserve.
      // (au premier match d'un nouveau joueur, la première fois, Monique l'explique ; 19 novembre)
      if (S?.annonces?.accueil === 1 && !S.annonces.accueilDit.has("reserve")) {
        S.annonces.accueilDit.add("reserve");
        const l = (POOLS.accueil_reserve || []).map(it => ligneMoment(it, { genre: P.genre })).find(x => x && voix.fichiers.has(x.id));
        if (l) voix.dire([l]);
      }
      const r = Math.max(0, reserveDebut - (ecoule - DUREE_COUP_MS));
      m.reserve[0] = r;
      $("timer").classList.add("urgent", "reserve");
      $("bar").style.transform = `scaleX(${r / RESERVE_MS})`;
      afficherReserve(r, true);
      if (r <= 0) { if (S?.match === m && !S.occupe && !m.termine) tempsDepasse(); return; }
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}
// Solo : ma réserve est épuisée. La première fois, un avertissement (et 8 secondes de plus) ; ensuite, un point de pénalité.
function tempsDepasse() {
  if (depassement(S.match, 0) === "avertissement") { avertir(0); lancerMinuteur(); return; }
  S.occupe = true; boutons(false); arreterMinuteur();
  afficherPenalite(0);
}
// Sonné par un smash réussi : les boutons grisés et tremblants, le téléphone qui vibre par petites secousses, pendant ms ;
// puis reprise() (qui rend les boutons, si c'est toujours à moi de jouer). L'écran du match est flou, puis redevient net
// peu à peu pendant ces ms (le message « Sonné » reste net).
let sonneT = 0;
function flouSonne(ms) {
  const doux = matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  for (const el of document.querySelectorAll("#viewMatch .board, #viewMatch .arena, #timer, #reserve, #moves")) {
    try {
      el.getAnimations?.().forEach(a => { if (a.id === "flou-sonne") a.cancel(); });
      const a = el.animate([{ filter: `blur(${doux ? 3 : 7}px)` }, { filter: "blur(0)" }], { duration: ms, easing: "ease-in" });
      a.id = "flou-sonne";
    } catch { /* navigateur sans animations : pas de flou */ }
  }
}
function sonner(ms, reprise) {
  boutons(false); $("moves").classList.add("sonne"); flouSonne(ms);
  S.sonneJusqu = performance.now() + ms;
  $("verdict").textContent = "💫 Sonné ! Encore un instant…";
  try { const n = Math.max(1, Math.round(ms / 500)); navigator.vibrate?.(Array.from({ length: 2 * n - 1 }, (_, i) => (i % 2 ? 300 : 200))); } catch { /* sans vibration */ }
  clearTimeout(sonneT);
  sonneT = setTimeout(() => {
    $("moves").classList.remove("sonne");
    if ($("verdict").textContent.startsWith("💫")) $("verdict").textContent = "À toi de jouer !";
    reprise();
  }, ms);
}

// Le petit compteur sous la barre : ma réserve de temps (enCours : on y puise en ce moment).
function afficherReserve(ms, enCours = false) {
  const el = $("reserve");
  if (ms === null || ms === undefined) { el.hidden = true; return; }
  el.hidden = false; el.textContent = `⏱️ Réserve : ${Math.ceil(ms / 1000)} s`;
  el.classList.toggle("en-cours", enCours); el.classList.toggle("vide", ms <= 0);
}
// L'avertissement de l'arbitre (fautif : 0 moi, 1 l'adversaire).
function avertir(fautif) {
  annoncer([annonceAvertissement(fautif)]);
  $("verdict").textContent = fautif === 0 ? "Avertissement : temps dépassé. La prochaine fois, c'est un point de pénalité."
    : `Avertissement pour ${OPP.nom} : temps dépassé.`;
}
// Un point de pénalité (fautif : 0 moi, 1 l'adversaire) : l'arbitre l'annonce, le point va à l'autre, sans signes montrés.
function afficherPenalite(fautif, { silencieux = false } = {}) {
  const m = S.match, evt = penaliser(m, fautif);
  if (silencieux) return evt;
  ambiance.intensite(intensiteMatch(m)); ambiance.calmer(false);
  ambiance.huees({ court: true, delai: 0.4, vol: 0.3, coupe: 3 });   // le public hue le point de pénalité
  const a = annoncerPenalite(m, evt, S.annonces);
  const cel = evt.finSet ? { ...celebration(criDe(evt.gagnant), { finMatch: m.termine, sauvee: false }), joueur: evt.gagnant } : null;
  document.querySelectorAll("#moves button.choisi").forEach(b => b.classList.remove("choisi"));
  $("hMe").textContent = "⏱️"; $("hBot").textContent = "⏱️"; $("hMe").className = "hand"; $("hBot").className = "hand";
  $("verdict").textContent = fautif === 0 ? `Temps dépassé : point de pénalité, le point va à ${OPP.nom}.`
    : `${OPP.nom} a dépassé son temps : point de pénalité, le point est pour toi.`;
  return apresPoint(evt, a, cel, null);
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

// smash : appui long sur le signe (un par set, pour le spectacle seulement ; voir peutSmasher).
function jouer(signe, auto = false, smash = false) {
  if (S?.sonneJusqu && performance.now() < S.sonneJusqu) return;   // (sonné : même au clavier, pas de coup)
  // (19 novembre) le temps mis à jouer, pour le commentaire des statistiques (« Il a joué vite dans ce match »)
  if (S && !S.duel && !auto && tDebut && S.enJeu && !S.occupe) (S.tempsReponse ||= []).push(performance.now() - tDebut);
  if (S && S.duel) return jouerDuel(signe, smash);
  if (!S || !S.enJeu || S.occupe || S.match.termine || panneauOuvert || faceAFaceOuvert) return;
  S.occupe = true; arreterMinuteur(); boutons(false); remettreBoutons();   // (la farce du Lutin ne dure qu'un coup)
  const m = S.match;
  // (le parcours des nouveaux, anonyme : un premier coup joué ; « lancé » aussi, s'il est venu par un autre chemin)
  if (!m.coups.length && !P.matchs) { compterEtapePremier(envoyerParcours, "premier_lance"); compterEtapePremier(envoyerParcours, "premier_coup"); }
  smash = !!smash && peutSmasher(m, 0);
  // Le bot smashe lui aussi, une fois par set au plus, de temps en temps.
  // (24 novembre au soir, choix du porteur du projet : les bots de Noël smashent deux fois plus souvent, pour qu'on voie leur pouvoir)
  const smashBot = peutSmasher(m, 1) && Math.random() < (OPP?.noel ? 0.2 : 0.1);
  // Le bot choisit sans connaître le coup du joueur.
  const histBot = m.coups.map(c => ({ moi: c.b, adv: c.a, res: c.gagnant === null ? "e" : c.gagnant === 1 ? "g" : "p" }));
  const signeBot = (S.carriere ? coupCarriere : choisirCoup)(OPP, histBot, S.hasard || Math.random, contexteBot(m));   // (carrière : les bots faibles renforcés)   // (match du jour : le même tirage pour tout le monde)
  const reveler = () => { sonDuCoup(signe, signeBot, [smash, smashBot], m); afficherCoup(signe, signeBot, [auto, false], { smash: [smash, smashBot] }); };
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
// Les marques du smash (degats.js) : celles du set en cours (set : celui du coup qu'on révèle) ; pas dans le replay (marques = false).
// Les effets du match (effets.js, 13 novembre ; d'abord sur la version de test) : la main en feu derrière la main (eteint : la
// bouffée de fumée du feu qui vient de s'éteindre).
const effetsActifs = () => ouvert("effets");
// (degats : les marques à dessiner, quand ce ne sont pas celles du moment : le replay ; 18 novembre)
// (feu : le niveau du feu à dessiner, quand ce n'est pas celui du moment : le replay montre celui du point rejoué)
const mainGantee = (g, signe, nom, { marques = true, set = S?.match?.scoresSets.length, eteint = false, degats, feu } = {}) => {
  const main = `<span class="poing-av" role="img" aria-label="${nom}">${avatarSVG({ ...avDe(g), symbole: SYMBOLE_SIGNE[signe], sansFond: true, degats: degats !== undefined ? degats : marques ? degatsDe(S?.degats, g, set) : null })}</span>`;
  const n = marques && effetsActifs() ? (feu !== undefined ? feu : feuDe(S?.feu, g)) : 0;
  if (!n && !eteint) return main;
  return `<span class="main-feu${n ? ` feu-${n}` : ""}"><span class="feu">${feuSVG(n || "fin", { id: `feu${g}`, anime: !reduitMouvement() })}</span>${main}</span>`;
};
function secouerLesPoings() {
  [["hMe", 0], ["hBot", 1]].forEach(([id, g]) => { $(id).innerHTML = mainGantee(g, 0, "Poing serré"); $(id).className = "hand secoue"; });
}

// Révèle un coup (solo ou duel) et enchaîne : annonces, score, fin de set ou de match.
// silencieux : on met seulement l'état à jour (rattrapage de plusieurs coups en duel).
function afficherCoup(signe, signeAdv, auto, { silencieux = false, smash = [false, false] } = {}) {
  const m = S.match;
  S.suivi.figer();
  smash.forEach((x, j) => { if (x) noterSmash(m, j); });
  const setDuCoup = m.scoresSets.length, evt = jouerCoup(m, signe, signeAdv, auto);
  if (smash[0] || smash[1]) m.coups[m.coups.length - 1].smash = [!!smash[0], !!smash[1]];   // (pour l'historique : le coup smashé entouré)
  // Les marques du smash gagnant sur la main de celui qui perd le point, jusqu'à la fin du set (12 novembre ; degats.js).
  // (celles d'avant le coup, gardées pour le replay : on y revoit la main s'abîmer ; 18 novembre)
  const copieDegats = () => [0, 1].map(j => { const d = degatsDe(S.degats, j, setDuCoup); return d ? { ...d } : null; });
  const degatsAvant = copieDegats();
  const marque = noterDegats(S.degats ||= nouveauxDegats(), { set: setDuCoup, gagnant: evt.gagnant, signes: [signe, signeAdv], smashGagnant: issueSmash(smash, evt.gagnant) === "gagne",
    noel: !S.duel && !S.carriere && OPP?.noel ? OPP.id : null });   // (un bot de Noël : sa marque à lui ; noel.js)
  // La main en feu (effets.js) : 4, 6, 8 points de suite ; une égalité baisse le feu, un point perdu l'éteint.
  const feuAvant = [0, 1].map(j => feuDe(S.feu, j));   // (pour le replay : le feu au moment précis du point ; 18 novembre)
  const feuChg = noterFeu(S.feu ||= nouveauFeu(), evt.gagnant);
  // Double smash : le gagnant du point récupère un smash pour la suite du set (pas annoncé s'il vient de finir le set).
  const recup = recupererSmash(m, smash, evt.gagnant, setDuCoup);
  // Le replay (replay.js) : on garde les actions marquantes du match.
  if (replayVisible()) {
    const mo = momentDuCoup(evt, m.coups, { smash, smashGagne: issueSmash(smash, evt.gagnant) === "gagne", serie: series(m.coups).serie,
      set: m.scoresSets.length - (evt.finSet ? 1 : 0), score: m.points, tous: true });
    // (21 novembre) Tous les points du set sont gardés (S.pointsSet) : à la fin du set, le score de chacun donne sa situation, et la
    // bascule et la relance du set deviennent des moments (replay.js, marquerSet).
    if (mo) {
      const plein = { ...mo, degatsAvant, degatsApres: copieDegats(), marque, feuAvant, feuApres: [0, 1].map(j => feuDe(S.feu, j)) };
      (S.pointsSet ||= []).push(plein);
      if (mo.type !== "point") (S.moments ||= []).push(plein);
    }
    if (evt.finSet) {
      const sg = m.format.setsGagnants, decisif = evt.finMatch && (sg === 1 || m.scoresSets.length === 2 * sg - 1);
      marquerSet(S.moments ||= [], S.pointsSet || [], m.format.pointsParSet, evt.gagnant, decisif, evt.finMatch ? evt.gagnant : null);
      S.pointsSet = [];
    }
  }
  S.suivi.enregistrer(signe, evt.gagnant === null ? "e" : evt.gagnant === 0 ? "g" : "p");
  suivreCoup(S.stats, m, evt);
  const a = annoncerCoup(m, evt, S.annonces, { recents: S.suivi.recents, auto: !!auto[0], smash });
  // Au premier coup : il rejoue la même ouverture qu'au dernier match, ou il en change (Roland ou Monique le relève).
  if (m.coups.length === 1 && !silencieux) {
    const mo = commentaireMemeOuverture(S.memoire, signeAdv, { genreAdv: S.genreAdv, audible: id => !voix.fichiers.size || voix.fichiers.has(id) });
    if (mo && !a.lignes.some(l => l.role !== "arbitre")) a.lignes.push(...mo);
  }
  (S.citations ||= []).push(...a.lignes.filter(l => l.role !== "arbitre"));   // pour « La Une »
  // Balle de match sauvée : le cri de fin de set sera plus fort.
  if (evt.balleAvant?.type === "match" && evt.gagnant !== null && evt.gagnant !== evt.balleAvant.joueur) (S.sauvee ||= [false, false])[evt.gagnant] = true;
  const sauvee = evt.finSet && !!S.sauvee?.[evt.gagnant];
  if (evt.finSet) S.sauvee = [false, false];
  if (silencieux) return evt;

  // Le public : il reprend entre les points, « ooh » sur un point disputé ; il s'agite selon l'enjeu (intensiteMatch).
  // (19 novembre : à la balle de match, le stade ne retombe pas d'un coup ; il bouillonne pour une victoire)
  ambiance.intensite(m.termine ? (m.vainqueur === 0 ? 1 : 0.5) : intensiteMatch(m)); ambiance.calmer(false);
  // (au premier point, le son est prêt : on charge les chants personnalisés des joueurs, pour la pause entre les sets)
  if (!S.persoCharge) {
    S.persoCharge = true; ambiance.prechargerPerso([...persoDuMatch(), ...courtsPerso(...joueursDuMatch())]);
    if (S.duel && D) for (let p = 1; p < 2 * WIN - 1; p++) ambiance.preparerChant(chantPauseDuel(p));   // (les chants des pauses du duel)
    // (les chants chargés à la demande : le prochain de chaque tour, et l'hymne si on joue un grand match ; 5 novembre)
    ambiance.prechargerChants({ hymne: !!S.annonces?.enjeu || !!S.carriere });
  }
  const rp = reactionsPublic(evt, egalitesAvantDernier(m.coups));
  if (rp.ooh) ambiance.ooh();
  // Après le « ooh », parfois, le public siffle et l'arbitre le rappelle à l'ordre (pas plus d'une fois en 12 heures) :
  // il parle à la fin des sifflets (une de ses façons de demander le calme ; « Je vous demande de vous arrêter » retiré le
  // 4 novembre), et c'est le seul commentaire de ce point.
  const chaud = intensiteMatch(m);
  // (18 novembre, demande du porteur du projet : l'arbitre demande le silence une fois par set au plus, tous les cas confondus
  // (sifflets, trompette ou « Olé » avant une balle, balle de match), et le jeu repart plus vite)
  const silenceDispo = !(S.silenceSet ||= new Set()).has(m.scoresSets.length);
  if (rp.ooh && silenceDispo && hueesPermises() && Math.random() < 0.25 && voix.fichiers.has("arbitre_silence_01")) {
    const duree = ambiance.sifflets(0.9);
    if (duree) {
      S.silenceSet.add(m.scoresSets.length);
      try { ecrire("hueesLe", Date.now()); } catch { /* rien */ }
      // Contre un bot, le coup suivant attend la fin des sifflets et de l'arbitre ; en duel, le serveur tient le temps : le jeu continue.
      if (!S.duel) S.silenceJusqu = Date.now() + (0.9 + duree * 0.6 + 2) * 1000;
      if (!S.duel) S.arretAfficheA = Date.now() + (0.9 + duree * 0.6) * 1000;   // « Jeu arrêté » quand l'arbitre intervient
      // La bronca (sifflets et huées de tout le stade) avec les sifflets, qui se tait quand l'arbitre a parlé (4 novembre : plus forte
      // que les anciennes huées, demande du porteur du projet).
      ambiance.bronca({ delai: 0.6, vol: 0.45, coupe: duree * 0.6 + 1.8 });
      for (let k = a.lignes.length - 1; k >= 0; k--) if (a.lignes[k].role !== "arbitre") a.lignes.splice(k, 1);
      const seance = S, calme = silenceArbitre();
      setTimeout(() => { if (S === seance && !S.match.termine) voix.dire([calme]); }, (0.9 + duree * 0.6) * 1000);
    }
  } else if ((rp.ooh || evt.balleAvant) && chaud >= 0.5 && !(S.siffletsSet ||= new Set()).has(m.scoresSets.length) && Math.random() < 0.6) {
    // Aux moments chauds (point disputé, balle sauvée), le public s'agite : quelques sifflets courts, sans l'arbitre
    // (une fois par set au plus ; demande du porteur du projet, 3 novembre).
    S.siffletsSet.add(m.scoresSets.length);
    if (Math.random() < 0.5) ambiance.siffletsCourts(0.5); else ambiance.huees({ court: true, delai: 0.5, vol: 0.25, coupe: 2.5 });
  }
  // (le brouhaha des balles de set et de match : la couche « tension » du public, réglée par intensiteMatch)
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
  const eteint = j => effetsActifs() && feuChg.some(c => c.joueur === j && c.de && !c.a);
  hMe.innerHTML = mainGantee(0, signe, NOM[signe], { set: setDuCoup, eteint: eteint(0) }); hBot.innerHTML = mainGantee(1, signeAdv, NOM[signeAdv], { set: setDuCoup, eteint: eteint(1) });
  document.querySelectorAll("#moves button.choisi").forEach(b => b.classList.remove("choisi"));
  // Les deux mains s'ouvrent à la même taille ; une demi-seconde plus tard, le gagnant grossit et le perdant s'efface.
  hMe.className = "hand ouvre"; hBot.className = "hand ouvre";
  const coupVu = m.coups.length;
  setTimeout(() => {
    if (S?.match !== m || m.coups.length !== coupVu) return;   // un autre coup (ou un autre match) a pris la place
    if (evt.gagnant === 0) { hMe.classList.add("win"); hBot.classList.add("lose"); }
    if (evt.gagnant === 1) { hBot.classList.add("win"); hMe.classList.add("lose"); }
    if (marque && !silencieux) (marque.joueur === 0 ? hMe : hBot).classList.add("abime");   // (la main touchée tremble)
  }, silencieux || reduitMouvement() ? 0 : 500);
  $("verdict").textContent = (auto[0] ? "Temps écoulé, coup joué au hasard. " : "") + (auto[1] ? `${OPP.nom} n'a pas joué à temps : coup au hasard. ` : "") +
    (evt.egalite ? "Égalité, on rejoue" : evt.gagnant === 0 ? `${NOM[signe]} bat ${NOM[signeAdv]}` : `${NOM[signeAdv]} bat ${NOM[signe]}`);
  if (smash[0] || smash[1]) effetSmash(smash, evt.gagnant, evt.finSet ? null : recup);
  if (effetsActifs()) effetsDuCoup(evt, feuChg, effetDouble(smash, signe, signeAdv), [hMe, hBot]);
  // Mes smashs, pour la fiche ; un smash réussi « sonne » l'adversaire au coup suivant, sauf s'il donne le set (en solo ici ; en duel, le serveur le dit).
  if (smash[0]) { S.stats.smashsTentes++; if (evt.gagnant === 0) S.stats.smashsReussis++; }
  if (!S.duel) S.sonne = issueSmash(smash, evt.gagnant) === "gagne" && evt.gagnant === 1 && !evt.finSet;   // (pas de KO au début du set suivant)
  return apresPoint(evt, a, cel, rp);
}

// ---------------------------------------------------------------- le replay (replay.js)
// Chaque action : les deux poings se secouent au ralenti, puis les signes s'ouvrent ; le score du moment et le bandeau REPLAY.
// Les répliques du replay (replay_intro, replay_sauvee…) : une au hasard parmi celles qui sont enregistrées.
const POOL_REPLAY = { match: "replay_set", set: "replay_set", sauvee_match: "replay_sauvee", sauvee_set: "replay_sauvee", smash: "replay_smash", piege: "replay_serie", serie: "replay_serie", egalites: "replay_serie",
  bascule: "replay_sit_bascule", relance: "replay_sit_relance", bascule_match: "replay_sit_bascule_match", point: "replay_generique" };
// (21 novembre) Le score du point (replay.js, situationsDuSet) : les situations où l'on peut parler de tournant du set.
const SIT_TOURNANT = ["serre", "bascule", "relance"];
// role : seulement Roland (« commentateur ») quand la palette suit : c'est Monique qui donne le verdict.
// type : le temps fort rejoué (une réplique marquée « type » n'est dite que pour lui : « Cinq points d'affilée », pas pour des égalités)
// (21 novembre) Sur un point du perdant du set (ou du match), pas de réplique qui laisse croire que le point a tout changé
// (« gagnantSet » dans repliques.js) : replayDuPerdant est réglé pour chaque action rejouée.
let replayDuPerdant = false;
const pasTrompeur = it => !(it.gagnantSet && replayDuPerdant);
function ligneReplay(pool, genre = "m", role = null, type = null, garder = () => true) {
  return auHasard((POOLS[pool] || []).filter(it => (!it.type || it.type === type) && pasTrompeur(it) && garder(it)).map(it => ligneMoment(it, { genre })).filter(x => x && voix.fichiers.has(x.id) && (!role || x.role === role)));
}
const genreJoueur = j => (j === 0 ? P.genre : OPP.humain ? OPP.genre : botAuFeminin(OPP) ? "f" : "m");
// La palette (replay.js) : les 5 coups d'avant, l'habitude surlignée, le verdict de Monique.
// Décision du porteur du projet (11 novembre) : pas de palette sans la voix de Monique ; elle n'apparaît que si la réplique du
// verdict est enregistrée (elle viendra d'elle-même avec les fichiers audio, version de test comprise).
// (18 novembre) le piège : la réplique écrite pour ces deux signes et ce nombre de coups ; le signe dit : celui du joueur dont on parle.
const pourPalette = pa => it => (!it.cle || it.cle === pa.habitude?.cle)
  && (!it.paire || (pa.piege && it.paire[0] === pa.piege.repete && it.paire[1] === pa.piege.signe))
  && (it.n === undefined || (pa.piege && it.n === Math.min(6, pa.piege.n)));
const lignesPalette = (pool, pa, mo, role = null) => (POOLS[pool] || []).filter(it => pourPalette(pa)(it) && signesOK(it.signes, pa.coups, mo, pa.joueur) && pasTrompeur(it))
  .map(it => ligneMoment(it, { genre: genreJoueur(pa.joueur), signe: pa.joueur === 0 ? mo.a : mo.b }))
  .filter(x => x && voix.fichiers.has(x.id) && (!role || x.role === role));
// Une réplique au hasard, en évitant celles déjà dites dans les replays de ce match (18 novembre, demande du porteur du projet :
// aux temps forts, Roland disait trois fois la même phrase) ; s'il n'y en a plus de neuve, une déjà dite plutôt qu'un silence.
function auHasard(l) {
  if (!l.length) return null;
  const dits = S ? (S.replayDits ||= new Set()) : new Set(), neuves = l.filter(x => !dits.has(baseDe(x.id))), g = neuves.length ? neuves : l;
  const x = g[Math.floor(Math.random() * g.length)];
  dits.add(baseDe(x.id));
  return x;
}
// Le smash : une fois sur deux, si le smasheur a gagné ce set, Monique parle de celui qui l'a subi (« il ne s'en est jamais remis »).
function paletteDuReplay(pa, mo) {
  if (pa?.verdict !== "smash") return pa;
  const set = S?.match?.scoresSets?.[mo.set], gagnantSet = set ? (set[0] > set[1] ? 0 : 1) : null;
  return gagnantSet === pa.joueur && Math.random() < 0.5 ? { ...pa, verdict: "smash_subi", joueur: 1 - pa.joueur } : pa;
}
function lignePalette(pa, mo) { return auHasard(lignesPalette(`replay_palette_${pa.verdict}`, pa, mo)); }
// La palette s'affiche avec le replay, dès le début de l'action (18 novembre) : le point rejoué reste caché (❔) jusqu'au dévoilement.
// Pas de texte des commentaires : seulement les titres (18 novembre, demande du porteur du projet).
// Un dialogue du replay (19 novembre, bibliothèque du porteur du projet) : un pas encore dit dans les replays de ce match, et
// enregistré ; ou null.
// (21 novembre, en attendant le grand tri des commentaires du replay : les dialogues qui jugent la suite du set, « C'est ici que
// tout a basculé ! », sont mis de côté ; ceux-ci restent)
// (21 novembre, avec le score du point : ils reviennent quand le point est vraiment un tournant, voir SIT_TOURNANT ; tous : tous permis)
const DIALOGUES_REPLAY_GARDES = { replay_moment: [1, 5, 7] };
function dialogueReplay(nom, genre = "m", tous = false) {
  const garde = tous ? null : DIALOGUES_REPLAY_GARDES[nom];
  const ids = DIALOGUES_IDS[nom] || [], ok = ids.map((_, k) => k).filter(k => ids[k].every(id => voix.fichiers.has(id)) && (!garde || garde.includes(k)));
  if (!ok.length) return null;
  const dits = S ? (S.replayDits ||= new Set()) : new Set(), neufs = ok.filter(k => !dits.has(`${nom}:${k}`)), g = neufs.length ? neufs : ok;
  if (!neufs.length && nom.startsWith("tf_")) return null;   // (un dialogue d'action déjà dit dans ce match : pas deux fois ; 19 novembre)
  const k = g[Math.floor(Math.random() * g.length)];
  dits.add(`${nom}:${k}`);
  return ligneDialogue(nom, k, genre);
}
function montrerPalette(pa, mo, devoile = false) {
  const nom = j => (j === 0 ? nomAffiche(P) : OPP.nom), hab = pa.habitude;
  const ligne = (j, cle) => `<div class="pal-ligne${hab?.joueur === j ? " pal-lue" : ""}"><span class="pal-nom">${esc(nom(j))}</span>`
    + pa.coups.map(c => `<span class="pal-case${c.gagnant === j ? " pal-g" + j : ""}">${EMOJIS[c[cle]]}</span>`).join("")
    + (devoile ? `<span class="pal-case pal-point${mo.gagnant === j ? " pal-g" + j : ""}">${EMOJIS[j === 0 ? mo.a : mo.b]}</span>` : `<span class="pal-case pal-point">❔</span>`) + "</div>";
  $("rpPalCoups").innerHTML = ligne(0, "a") + ligne(1, "b") + (devoile ? `<span class="pal-cercle" aria-hidden="true"></span>` : "");
  const pg = pa.piege;
  $("rpPalHab").textContent = pg ? `${nom(pg.joueur)} : ${pg.n} fois ${NOM[pg.repete]}, puis ${NOM[pg.signe]}`
    : pa.verdict === "smash" || pa.verdict === "smash_subi" ? `💥 Le smash de ${nom(pa.smasheur ?? 1 - pa.joueur)}`
    : hab ? texteHabitude(hab, nom(hab.joueur)) : "Aucune habitude à lire.";
  $("rpPalEtiquette").textContent = VERDICTS[pa.verdict]; $("rpPalEtiquette").className = `pal-etiquette pal-${pa.verdict}`;
  $("rpPalCom").textContent = ""; $("rpPalCom").hidden = true;
  $("rpPalette").hidden = false;
}
// Le volet (18 novembre, version de test : « volet », nouveautes.js) : la bande balaie l'écran ; change() est appelé quand elle
// le couvre (on change d'écran derrière). Sans le volet, ou mouvements réduits : change() tout de suite.
let voletT = 0;
function volet(change) {
  const el = $("volet");
  if (!ouvert("volet") || reduitMouvement() || !el) { change(); return; }
  clearTimeout(voletT); el.hidden = false; el.classList.remove("passe"); void el.offsetWidth; el.classList.add("passe");
  setTimeout(change, 500);   // (la bande couvre l'écran de 0,4 s à 1 s : on change d'écran derrière)
  voletT = setTimeout(() => { el.hidden = true; el.classList.remove("passe"); }, 1500);
}
function jouerReplay(liste, apres = () => {}) {
  if (!liste.length) { apres(); return () => {}; }
  voix.arreter();
  const ov = $("replay"), vite = reduitMouvement();
  let i = 0, t = null, fini = false, conclu = false;
  const fermer = () => { if (fini) return; fini = true; clearTimeout(t); voix.arreter(); volet(() => { ov.hidden = true; $("rpIntro").hidden = true; apres(); }); };
  // (couper : arrêter net, sans la suite ; en duel, quand le set repart pendant le replay de la pause)
  const couper = () => { if (fini) return; fini = true; clearTimeout(t); ov.hidden = true; $("rpIntro").hidden = true; voix.arreter(); };
  // (19 novembre, demande du porteur du projet) Les temps forts commencent par leur annonce : l'icône « replay » qui tourne et le
  // jingle, pendant que Roland (ou Roland et Monique) les annonce ; la première action ne part qu'ensuite.
  const introTempsForts = () => {
    const el = $("rpIntro"); el.hidden = false;
    try { ambiance.jingle(); } catch { /* sans son */ }
    const d = Math.random() < 0.5 ? dialogueReplay("temps_forts_intro") : null, l = !d && ligneReplay("replay_debut", "m", "commentateur");
    const debut = Date.now();
    t = setTimeout(() => {
      if (d) voix.dire(d); else if (l) voix.dire([l]);
      voix.finiDeParler(() => {
        if (fini) return;
        t = setTimeout(() => { if (fini) return; el.hidden = true; afficherAction(); }, Math.max(vite ? 0 : 400, 2200 - (Date.now() - debut)));
      }, 15000);
    }, vite ? 0 : 900);
  };
  $("rpPasser").onclick = fermer;
  $("rpNomMoi").textContent = nomAffiche(P); $("rpNomAdv").textContent = OPP.nom;
  $("rpMiniMoi").innerHTML = avatarSVG(avMoi()); $("rpMiniAdv").innerHTML = avatarSVG(avAdv());
  volet(() => { if (!fini) ov.hidden = false; });
  // Entre deux temps forts (18 novembre, demande du porteur du projet : un fondu plus marqué) : l'action s'efface tout à fait,
  // un temps au noir, puis la suivante apparaît.
  const boite = ov.querySelector(".replay-boite");
  boite.classList.remove("rp-sortie", "rp-entree");
  const montrer = () => {
    if (fini) return;
    if (i >= liste.length) {
      // (19 novembre) les temps forts finissent sur une conclusion de Roland et Monique (« Trois images qui resteront dans les
      // mémoires ! »), puis on ferme ; « Roland, ils ont joué trois manches… » seulement après un match en trois sets.
      if (liste.length > 1 && !conclu) {
        conclu = true;
        const fin = dialogueReplay(S?.match?.scoresSets?.length === 3 && Math.random() < 0.5 ? "temps_forts_fin_trois" : "temps_forts_fin");
        if (fin) { voix.dire(fin); voix.finiDeParler(() => { if (!fini) fermer(); }, 15000); return; }
      }
      fermer(); return;
    }
    if (i === 0) { if (liste.length > 1) introTempsForts(); else afficherAction(); return; }
    boite.classList.remove("rp-entree"); boite.classList.add("rp-sortie");
    t = setTimeout(() => {
      if (fini) return;
      boite.classList.remove("rp-sortie"); void boite.offsetWidth; boite.classList.add("rp-entree");
      afficherAction();
    }, vite ? 250 : 550);   // (19 novembre : plus rapide, 1,1 s avant)
  };
  const afficherAction = () => {
    const mo = liste[i++], moi = $("rpMoi"), adv = $("rpAdv");
    // Le score juste avant le point, puis le point marqué au dévoilement (comme pendant le match).
    const apresPt = mo.score || [0, 0], avant = apresPt.map((v, j) => (j === mo.gagnant ? v - 1 : v));
    $("rpTitre").textContent = TITRES_REPLAY[mo.type];
    $("rpScoreMoi").textContent = avant[0]; $("rpScoreAdv").textContent = avant[1];
    $("rpStatus").textContent = `Set ${mo.set + 1}`;
    $("rpCompte").textContent = liste.length > 1 ? `${i} / ${liste.length}` : "";
    $("rpVerdict").textContent = ""; $("rpCom").textContent = ""; $("rpPalette").hidden = true;
    // (19 novembre, bibliothèque du porteur du projet) Les dialogues du replay : entre les sets, une fois sur trois, un dialogue
    // remplace l'intro et les répliques habituelles, sans la palette (« Et voici certainement le tournant de ce set ! ») ; aux
    // temps forts, 4 fois sur 10, un dialogue selon l'action (la 1re du 1er set, la 2e, la balle de match, une balle sauvée par le
    // perdant du match, une action perdue, ou le tournant), la palette restant à l'écran.
    const plusieurs = liste.length > 1, dernier = i === liste.length, genre = genreJoueur(mo.gagnant);
    const perdantMatch = S?.match?.vainqueur === 0 || S?.match?.vainqueur === 1 ? 1 - S.match.vainqueur : null;
    // (21 novembre, règle du porteur du projet) Le point rejoué est-il du perdant du set (entre les sets) ou du match (temps forts) ?
    // Alors Monique le dit : « Il n'a pas démérité… mais ça n'a pas suffi ». Les dialogues qui jugent la suite (le tournant, le
    // premier coup qui a fait mal, l'action qui a coûté cher) sont mis de côté en attendant le grand tri des commentaires.
    const sc = S?.match?.scoresSets?.[mo.set], gagnantSet = sc && sc[0] !== sc[1] ? (sc[0] > sc[1] ? 0 : 1) : null;
    const reference = plusieurs ? (perdantMatch === null ? null : 1 - perdantMatch) : gagnantSet;
    const duPerdant = reference !== null && mo.gagnant !== reference;
    replayDuPerdant = duPerdant;
    // (21 novembre, choix du porteur du projet) Le score du point : mo.situation (replay.js, situationsDuSet). La bascule, la relance
    // et la bascule du match sont commentées d'après le score ; un tournant (fin serrée, bascule, relance) gagné par le gagnant du
    // set permet de nouveau les dialogues « C'est ici que tout a basculé ! ».
    const sit = mo.situation || null, tournant = !duPerdant && SIT_TOURNANT.includes(sit);
    const forcerSit = ["bascule", "relance", "bascule_match"].includes(mo.type);
    const poolSit = mo.type === "bascule_match" ? "replay_sit_bascule_match" : sit ? `replay_sit_${sit}` : null;
    const candidats = duPerdant ? (plusieurs && (mo.type === "sauvee_match" || mo.type === "sauvee_set") && Math.random() < 0.4 ? ["tf_defense"] : [])
      : !plusieurs ? (Math.random() < 1 / 3 ? ["replay_moment"] : [])
      : Math.random() < 0.4 ? [i === 2 && "tf_deuxieme", dernier && mo.type === "match" && "tf_balle", mo.type === "bascule_match" && "tf_tournant"].filter(Boolean) : [];
    const dlgNom = candidats[Math.floor(Math.random() * candidats.length)], dlg = dlgNom ? dialogueReplay(dlgNom, genre, tournant) : null;
    const pa0 = mo.palette && !(dlg && !plusieurs) ? paletteDuReplay(mo.palette, mo) : null, lp = pa0 ? lignePalette(pa0, mo) : null, pa = lp ? pa0 : null;
    // (le mot de Monique : sur le perdant (son smash, son retard, ou « il n'a pas démérité »), ou sur le gagnant (le score du point,
    // ou « il a été le plus solide ») ; Roland parle d'abord)
    const smashPerdant = duPerdant && !!mo.smash?.[mo.gagnant];
    const motFin = dlg ? null
      : duPerdant ? (smashPerdant && ligneReplay(plusieurs ? "replay_smash_perdant_match" : "replay_smash_perdant_set", genre, "commentatrice"))
        // (21 novembre) un beau point, d'après la palette : « Belle lecture de sa part… mais ça n'a pas suffi »
        || (pa && ligneReplay(plusieurs ? "replay_verdict_perdant_match" : "replay_verdict_perdant_set", genre, "commentatrice", null, it => it.verdict === pa.verdict))
        || (sit === "mene_perd" && ligneReplay("replay_sit_mene_perd", genre, "commentatrice"))
        || ligneReplay(plusieurs ? "replay_perdant_match" : "replay_perdant_set", genre, "commentatrice")
      : (poolSit && (forcerSit || (!pa && Math.random() < 0.7)) && ligneReplay(poolSit, genre, "commentatrice"))
        || (!pa && reference !== null && Math.random() < 0.5 ? ligneReplay(plusieurs ? "replay_gagnant_match" : "replay_gagnant_set", genre, "commentatrice") : null);
    const roland = pa || dlg || motFin ? "commentateur" : null;
    if (pa) montrerPalette(pa, mo);   // (la palette arrive avec le replay)
    // (les marques du smash et le feu de la main : ceux du moment rejoué, pas ceux de la fin du match ; 18 novembre)
    const dAvant = mo.degatsAvant || [null, null], dApres = mo.degatsApres || [null, null], fAvant = mo.feuAvant || [0, 0], fApres = mo.feuApres || [0, 0];
    [[moi, 0], [adv, 1]].forEach(([el, g]) => { el.innerHTML = mainGantee(g, 0, "Poing serré", { degats: dAvant[g], feu: fAvant[g] }); el.className = "hand secoue"; });
    // Roland ou Monique : « Revoyons ça ! » pour la première action, puis un mot sur l'action au dévoilement ; avec la palette,
    // Monique donne ensuite son verdict. Chacun finit sa phrase avant que l'autre parle, et l'action suivante attend la fin
    // des commentaires (18 novembre, demande du porteur du projet : Roland était coupé par Monique) ; « Passer » pour jouer.
    const action = i;
    const encore = () => !fini && action === i;
    const parler = (l, ensuite) => voix.finiDeParler(() => {
      if (!encore()) return;
      if (l) voix.dire([l]);
      voix.finiDeParler(() => { if (encore()) ensuite(); }, 20000);
    }, 20000);
    // Les temps forts de fin de match (plusieurs actions) : Roland les annonce l'une après l'autre (« D'abord… », « Ensuite… »,
    // « Et enfin… » : replay_debut, replay_ensuite, replay_enfin ; 18 novembre), avec un fondu entre deux actions.
    // (un dialogue qui annonce déjà l'ordre, « Deuxième séquence… », « Et enfin, la balle de match ! », ou le dialogue du set :
    // pas d'annonce en plus ; aux temps forts, une fois sur deux, l'introduction en dialogue : « Allez, on se repasse les trois
    // grands moments de cette rencontre ! »)
    const sansAnnonce = ["tf_deuxieme", "tf_balle"].includes(dlgNom) || (dlg && !plusieurs);
    const annonce = sansAnnonce ? null : !plusieurs ? (i === 1 ? "replay_intro" : null) : i === 1 ? "replay_debut" : dernier ? "replay_enfin" : "replay_ensuite";
    // (aux temps forts, la première action a déjà été annoncée : voir introTempsForts)
    const la = !(plusieurs && i === 1) && annonce && (ligneReplay(annonce, "m", "commentateur") || (i === 1 ? ligneReplay("replay_intro", "m", roland) : null));
    if (la) voix.dire([la]);
    t = setTimeout(() => {
      if (!encore()) return;
      const devoile = Date.now();
      // (la main ouverte garde les marques d'avant ; celles du smash gagnant apparaissent quand le point est marqué)
      moi.innerHTML = mainGantee(0, mo.a, NOM[mo.a], { degats: dAvant[0], feu: fAvant[0] }); adv.innerHTML = mainGantee(1, mo.b, NOM[mo.b], { degats: dAvant[1], feu: fAvant[1] });
      moi.className = "hand ouvre"; adv.className = "hand ouvre";
      const [w, l] = mo.gagnant === 0 ? [mo.a, mo.b] : [mo.b, mo.a];
      $("rpVerdict").textContent = `${mo.smash[mo.gagnant] ? "💥 Smash ! " : ""}${NOM[w]} bat ${NOM[l]}`;
      if (pa) montrerPalette(pa, mo, true);
      setTimeout(() => {
        if (!encore()) return;
        (mo.gagnant === 0 ? moi : adv).classList.add("win"); (mo.gagnant === 0 ? adv : moi).classList.add("lose");
        $("rpScoreMoi").textContent = apresPt[0]; $("rpScoreAdv").textContent = apresPt[1];
        try { ambiance.public("clameur", 0.4); } catch { /* sans son */ }
        // Le smash gagnant : la main touchée s'abîme sous nos yeux (degats.js), et tremble.
        if (mo.marque) {
          const el = mo.marque.joueur === 0 ? moi : adv, sg = mo.marque.joueur === 0 ? mo.a : mo.b;
          el.innerHTML = mainGantee(mo.marque.joueur, sg, NOM[sg], { degats: dApres[mo.marque.joueur], feu: fApres[mo.marque.joueur] });
          el.classList.add("abime");
        }
        // Le feu qui change sur ce point (la main qui s'enflamme, ou qui s'éteint) : comme pendant le match.
        [[moi, 0, mo.a], [adv, 1, mo.b]].forEach(([el, g, sg]) => {
          if (fApres[g] !== fAvant[g] && !(mo.marque && mo.marque.joueur === g)) { const cls = el.className; el.innerHTML = mainGantee(g, sg, NOM[sg], { degats: dApres[g], feu: fApres[g] }); el.className = cls; }
        });
      }, vite ? 0 : 700);
      // (avec la palette : Roland décrit d'abord l'action à sa façon, replay_r_… ; sinon, la réplique habituelle du replay)
      // (19 novembre, commentaires d'un testeur) Selon l'action, parfois : le double smash, le smash selon son signe, la balle
      // ratée (« il » : celui qui l'a ratée), le point réussi (avec la palette « pertinent », « propre » ou « piège »).
      const signeG = mo.gagnant === 0 ? mo.a : mo.b, sauvee = mo.type === "sauvee_set" || mo.type === "sauvee_match";
      const piocher = (pool, g, garder = () => true) => auHasard((POOLS[pool] || []).filter(it => garder(it) && signesOK(it.signes, mo.palette?.coups, mo, mo.gagnant) && pasTrompeur(it)).map(it => ligneMoment(it, { genre: g, signe: signeG }))
        .filter(x => x && voix.fichiers.has(x.id) && (!roland || x.role === roland)));
      const variante = dlg ? null
        : mo.type === "smash" && mo.smash[0] && mo.smash[1] && Math.random() < 0.5 ? piocher("replay_double", genre)
        : mo.type === "smash" && Math.random() < 0.5 ? piocher("replay_smash_signe", genre, it => it.seul === signeG)
        : sauvee && Math.random() < 0.5 ? piocher("replay_balle_ratee", genreJoueur(1 - mo.gagnant))
        : pa && ["pertinent", "propre", "piege"].includes(pa.verdict) && Math.random() < 0.35 ? piocher("replay_reussite", genre) : null;
      // (21 novembre : une fois sur deux, sans la palette, un commentaire générique, qui passe pour n'importe quel point)
      const generique = !dlg && !variante && !pa && Math.random() < 0.5 ? ligneReplay("replay_generique", genre, roland) : null;
      // (21 novembre) Roland, d'après le score : toujours pour la bascule et la relance, sinon une fois sur deux sans la palette
      const parScore = !dlg && poolSit && (forcerSit || (!pa && !variante && Math.random() < 0.5)) ? ligneReplay(poolSit, genre, "commentateur") : null;
      // (« Tout s'est joué là », sur la balle de set : seulement si le set s'est vraiment joué là, sinon un commentaire générique)
      const poolType = (mo.type === "set" || mo.type === "match") && !SIT_TOURNANT.includes(sit) ? "replay_generique" : POOL_REPLAY[mo.type];
      const c = dlg ? dlg[0] : parScore || variante || (pa && auHasard(lignesPalette(`replay_r_${pa.verdict}`, pa, mo, "commentateur"))) || generique || ligneReplay(poolType, genre, roland, mo.type) || ligneReplay("replay_generique", genre, roland);
      // (le temps de regarder, même sans le son : 3 secondes au moins, 6 avec la palette)
      // (19 novembre : un peu plus rapide entre deux actions ; 1,5 s, 6,5 s et 3,2 s avant)
      const suite = () => { t = setTimeout(montrer, Math.max(vite ? 600 : 800, (pa ? 5000 : 2600) - (Date.now() - devoile))); };
      const reponse = dlg ? dlg[1] : motFin || (pa ? lp : null);
      parler(c, () => (reponse ? parler(reponse, suite) : suite()));
    // (21 novembre, demande du porteur du projet : au premier temps fort, Roland mettait 2 à 3 secondes à parler) Sans annonce
    // à dire (« Ensuite… »), le point se dévoile presque tout de suite, et Roland le commente aussitôt.
    }, vite ? 300 : la ? 2000 : 700);
  };
  montrer();
  return couper;
}
// (19 novembre, demande du porteur du projet : après les temps forts, on restait sur l'écran du match) Ensuite, le panneau des
// statistiques revient, puis l'écran de fin (la Une, le menu, continuer…).
$("btnTempsForts").addEventListener("click", () => {
  if (!S?.moments?.length) return;
  const seance = S;
  jouerReplay(tempsFortsMatch(S.moments, S.match?.vainqueur), () => {
    if (S !== seance) return;
    const versFin = () => { if (S === seance && !$("end").hidden) $("end").scrollIntoView({ behavior: reduitMouvement() ? "auto" : "smooth", block: "start" }); };
    try { montrerStatsFin(versFin, { silencieux: true }); } catch { versFin(); }
  });
});

// Le son du coup, au moment où les deux signes se dévoilent : le coup de raquette ; pour un smash qui gagne le point, le gros son
// (avec le signe gagnant : la déchirure des Ciseaux) ; pour un smash bloqué ou raté (11 novembre), la raquette puis son bruit.
function sonDuCoup(a, b, smash, m) {
  const g = gagnantCoup(a, b), issue = issueSmash(smash, g);
  if (issue === "gagne") { ambiance.smash(g === 0 ? a : b); return; }
  ambiance.raquette(a, grandMoment(m));
  if (issue) ambiance.smashManque(issue);
  const double = effetsActifs() && effetDouble(smash, a, b);   // (le double smash avec le même signe : effets.js)
  if (double) ambiance.effet(double);
}

// Le smash : selon ce qu'il donne (voir issueSmash), un verdict et une vibration (Android ; l'iPhone ne vibre pas depuis une
// page web). Gagnant : « 💥 Smash ! », grande vibration et secousse de l'arène ; perdu : « 💨 Smash raté ! » ; égalité :
// « 🧱 Smash bloqué ! » (sans vibration, depuis le 3 novembre).
// Double smash gagné (11 novembre) : « 🔄 Smash récupéré ! » pour celui qui gagne le point, s'il reste du jeu dans le set.
function effetSmash(smash, gagnant, recup = null) {
  const issue = issueSmash(smash, gagnant), double = smash[0] && smash[1];
  const de = j => (j === 0 ? "" : ` de ${OPP.nom}`);
  const sonneAdv = `${OPP.nom} est ${OPP.genre === "f" ? "sonnée" : "sonné"} ! `;
  const texte = issue === "gagne" ? (double ? `💥 Double smash ! ${gagnant === 0 ? sonneAdv : ""}` : gagnant === 0 ? `💥 Smash ! ${sonneAdv}` : `💥 Smash${de(gagnant)} ! `)
    : issue === "bloque" ? (double ? "🧱 Double smash bloqué ! " : `🧱 Smash${de(smash[0] ? 0 : 1)} bloqué ! `)
    : `💨 Smash raté${de(smash[0] ? 0 : 1)} ! `;
  const recupTexte = recup === 0 ? "🔄 Smash récupéré ! " : recup === 1 ? `🔄 ${OPP.nom} récupère un smash ! ` : "";
  $("verdict").textContent = `${texte}${recupTexte}${$("verdict").textContent}`;
  // La vibration seulement quand le smash marque le point (3 novembre, demande du porteur du projet ; plus rien pour un smash
  // raté ou bloqué), plus longue qu'avant.
  if (issue !== "gagne") return;
  try { if (document.visibilityState === "visible") navigator.vibrate?.(double ? [200, 70, 200, 70, 350] : [250, 80, 400]); } catch { /* sans vibration */ }
  if (reduitMouvement()) return;
  const arene = document.querySelector(".arena");
  arene?.classList.remove("smash"); void arene?.offsetWidth; arene?.classList.add("smash");
}

// Les effets du match (effets.js ; 13 novembre) : le feu qui prend ou s'éteint (son), les égalités en chaîne (les mains tremblent
// de plus en plus ; à la 3e, une étincelle), le double smash avec le même signe (séisme, coup de vent, étincelles).
function effetsDuCoup(evt, feuChg, double, mains) {
  if (feuChg.some(c => c.a > c.de)) ambiance.effet("crepitement");
  if (feuChg.some(c => c.de && !c.a)) ambiance.effet("pschitt");
  const vite = reduitMouvement(), arene = document.querySelector(".arena");
  if (!arene) return;
  arene.querySelectorAll(".effet-couche").forEach(x => x.remove());
  const couche = (cls, html) => { const d = document.createElement("div"); d.className = `effet-couche ${cls}`; d.setAttribute("aria-hidden", "true"); d.innerHTML = html; arene.append(d); setTimeout(() => d.remove(), 2600); };
  const relancer = (el, cls) => { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), 2600); };
  if (double) {
    if (vite) return;
    const tableau = document.querySelector(".board");
    if (double === "seisme") {
      relancer(arene, "seisme"); relancer(tableau, "vacille");
      try { if (document.visibilityState === "visible") navigator.vibrate?.([140, 50, 140, 50, 120, 60, 90, 70, 60]); } catch { /* sans vibration */ }
    } else if (double === "vent") {
      relancer(tableau, "bat-au-vent");
      couche("effet-vent", Array.from({ length: 20 }, (_, i) => `<span class="${i % 4 ? "poussiere" : "trait-vent"}" style="top:${8 + ((i * 29) % 84)}%;animation-delay:${(i * 0.07) % 0.9}s"></span>`).join(""));
    } else if (double === "etincelles") {
      couche("effet-etincelles", Array.from({ length: 24 }, (_, i) => `<span style="--angle:${i * 15 + (i % 2) * 9}deg;--loin:${38 + (i % 3) * 16}px;animation-delay:${(i % 4) * 0.18}s"></span>`).join(""));
    }
    return;
  }
  if (!evt.egalite) return;
  const e = egalitesDeSuite(S.match.coups), n = trembleDe(e);   // (à partir de la 2e égalité de suite ; l'étincelle à la 4e)
  if (!n) return;
  if (!vite) mains.forEach(h => { h.classList.remove("tremble-1", "tremble-2", "tremble-3"); void h.offsetWidth; h.classList.add(`tremble-${n}`); });
  if (e >= EGALITES_ETINCELLE) {
    ambiance.effet("etincelle");
    if (!vite) couche("effet-etincelles petite", Array.from({ length: 8 }, (_, i) => `<span style="--angle:${i * 45 + 20}deg;--loin:${22 + (i % 2) * 10}px"></span>`).join(""));
  }
}

// Le cœur qui bat (effets.js, niveauCoeur ; 16 novembre) : le son, la vibration et les bords de l'écran qui battent en rouge.
// Il s'arrête net au point gagnant, ou quand on quitte le match.
function majCoeur() {
  const n = S?.match && S.enJeu && effetsActifs() && ouvert("coeur") ? niveauCoeur(S.match) : 0;
  ambiance.coeur(n, { vibrer: true });
  const bord = $("coeurBord");
  bord.className = n ? `coeur-bord bat coeur-${n}` : "coeur-bord";
  if (n) bord.style.setProperty("--battement", `${(60 / BPM_COEUR[n]).toFixed(3)}s`);
}

// Après un coup ou un point de pénalité : le public, les annonces, le score, puis la fin du set, du match ou le coup suivant.
// rp : les réactions du public à ce coup (null après une pénalité : pas de réaction).
function apresPoint(evt, a, cel, rp) {
  const m = S.match;
  majCoeur();
  // Applaudissements : série de 4 points, fin de set, fin de match. Jamais pendant l'échange.
  // (fin de match perdue : le public applaudit quand même les deux joueurs, un peu moins fort ; avant, les applaudissements du set)
  if (a.public) {
    const type = a.public === "serie" ? "clameur" : a.public === "set" && m.termine ? "ovation" : a.public;
    const vol = a.public === "set" && m.termine ? (m.vainqueur === 0 ? 0.85 : 0.55) : { serie: 0.45, set: 0.6, ovation: 0.8 }[a.public];
    // (19 novembre : la balle de match gagnée, le grand stade explose d'abord, puis l'ovation)
    const explose = m.termine && evt.gagnant === 0 && ambiance.explosion();
    setTimeout(() => ambiance.public(type, vol), explose ? 1200 : 250);
  }
  // Sinon, parfois, une réaction du public : applaudissements, « Allez ! », « Bravo ! », « Ohhh… » ou brouhaha (voir reactionPoint).
  else if (rp && !rp.ooh) { const r = reactionPoint(S.bravos ||= {}, evt, m.coups, Math.random, intensiteMatch(m)); if (r) setTimeout(() => ambiance.reagir(r === "applaudir" && egalitesAvantDernier(m.coups) >= 1 ? "applaudirFort" : r), 300); }
  // Avant une balle de set ou de match, de temps en temps (une fois par set au plus) : la trompette ou « Olé, olé », puis l'arbitre
  // demande le silence et le public se tait (demande du porteur du projet, 3 novembre). Contre un bot, le coup suivant attend.
  const nSet = m.scoresSets.length, chant = evt.balleApres && !m.termine && !evt.finSet && !(S.chantSet ||= new Set()).has(nSet) && !(S.silenceSet ||= new Set()).has(nSet) && Math.random() < 0.35
    ? (evt.balleApres.type === "match" && Math.random() < 0.5 ? "ole" : "charge") : null;
  const coupe = chant === "ole" ? (S.duel ? 2.5 : 3) : 2.4;   // (18 novembre : 4 et 3,2 secondes avant, trop long)
  if (chant && ambiance.stade(chant, { vol: chant === "ole" ? 0.85 : 0.6, delai: 0.4, coupe, salle: false })) {   // (plus fort le 3 novembre : on l'entendait à peine)
    S.chantSet.add(nSet); S.silenceSet.add(nSet);
    for (let k = a.lignes.length - 1; k >= 0; k--) if (a.lignes[k].id.startsWith("arbitre_silence_")) a.lignes.splice(k, 1);
    const seance = S, silence = silenceArbitre();
    // (si Roland ou Monique parlent encore, l'arbitre attend un peu qu'ils aient fini)
    setTimeout(() => voix.finiDeParler(() => { if (S === seance && !S.match.termine) voix.dire([silence]); }, 1500), (0.4 + coupe) * 1000);
    if (!S.duel) S.silenceJusqu = Date.now() + (0.4 + coupe + 2.2) * 1000;
    if (!S.duel) S.arretAfficheA = Date.now() + (0.4 + coupe) * 1000;   // « Jeu arrêté » quand l'arbitre intervient
  } else if (evt.balleApres && evt.balleApres.joueur === 1 && !m.termine && !evt.finSet && !(S.defenseSet ||= new Set()).has(nSet)
    && ambiance.buf?.defense && Math.random() < 0.5) {
    // « Défense ! » : je dois sauver une balle de set ou de match, le public me pousse (une fois par set au plus ; 3 novembre).
    S.defenseSet.add(nSet);
    ambiance.stade("defense", { vol: 0.7, delai: 0.4, coupe: 6, salle: false });
  } else if (evt.balleApres?.type === "match" && !m.termine && !S.silenceSet.has(nSet) && silenceAvantBalle(S.silence ||= { total: 0, parSet: {}, suite: 0, pause: 0 }, m.scoresSets.length)) {
    // Sinon, parfois, avant une balle de match, l'arbitre demande le silence (sans le répéter à chaque balle).
    S.silenceSet.add(nSet);
    a.lignes.unshift(silenceArbitre());
  } else if (!evt.finSet && !m.termine && evt.gagnant !== null && series(m.coups).serie === 5 && !(S.oleSet ||= new Set()).has(nSet) && Math.random() < 0.6) {
    // « Olé ! » : le public salue une série de 5 points d'affilée (une fois par set au plus).
    S.oleSet.add(nSet);
    ambiance.stade("ole", { vol: 0.75, delai: 0.5, coupe: 5, salle: false });
  } else if (!evt.finSet && !m.termine && evt.balleAvant && evt.gagnant !== null && evt.gagnant !== evt.balleAvant.joueur
    && !(S.chantCourtSet ||= new Set()).has(nSet) && Math.random() < 0.5) {
    // Une balle de set ou de match sauvée : les supporters entonnent quelques secondes de leur chant (une fois par set au plus).
    S.chantCourtSet.add(nSet);
    // (« Allez le Chiromancien ! » : le cri court du joueur soutenu, s'il en a un ; sinon un extrait des chants habituels)
    const courts = courtsPerso(joueursDuMatch()[evt.gagnant]).filter(id => ambiance.persoBuf?.[id]);   // (seulement si c'est lui qui a sauvé la balle)
    if (courts.length) ambiance.jouerPerso(courts[Math.floor(Math.random() * courts.length)], { vol: 0.7, delai: 0.4 });
    else {
      // (les extraits tournent ; « Pierre, feuille, ciseaux… » en premier, 4 novembre)
      const extraits = ["chantCourt3", "chantCourt1", "chantCourt2"].filter(c => ambiance.buf?.[c]);
      S.chantCourt = extraits[(extraits.indexOf(S.chantCourt) + 1) % (extraits.length || 1)];
      ambiance.stade(S.chantCourt, { vol: 0.65, delai: 0.4, salle: false });
    }
  } else if (!evt.finSet && !m.termine && evt.gagnant !== null && series(m.coups).serie === 3 && !(S.clapSet ||= new Set()).has(nSet)
    && Math.random() < 0.4 && ambiance.clappements()) {
    // Les clappements en rythme du grand stade : 3 points d'affilée (une fois par set au plus ; 19 novembre).
    S.clapSet.add(nSet);
  } else if (!evt.finSet && !m.termine && evt.gagnant !== null && (S.pointsSansChant || 0) >= 5 && Math.random() < 0.25 + 0.35 * intensiteMatch(m)
    && ambiance.extraitMatch()) {
    // Les supporters chantent quelques secondes entre deux points (au moins 5 points d'écart, plus souvent quand ça chauffe ;
    // 4 novembre, demande du porteur du projet).
    S.pointsSansChant = 0;
  }
  if (evt.gagnant !== null) S.pointsSansChant = (S.pointsSansChant || 0) + 1;
  // (19 novembre) à la fin du match, l'arbitre tout de suite ; le commentaire d'après-match, lui, attend le panneau des
  // statistiques (après le cri et la poignée de main ; voir montrerStatsFin)
  // (19 novembre, après la coupe Monique Latour gagnée par le porteur du projet : « Roland a mis très longtemps à exulter » : une
  // victoire, Roland et Monique la commentent tout de suite, pendant le cri ; une défaite attend toujours le panneau)
  if (m.termine && m.vainqueur === 0) { S.commentairesFin = []; annoncer(a.lignes); }
  else if (m.termine) { S.commentairesFin = a.lignes.filter(l => l.role !== "arbitre"); annoncer(a.lignes.filter(l => l.role === "arbitre")); }
  // (une fin de set : l'annonce du set décisif attend la fin du replay ; voir ouvrirPause)
  else if (evt.finSet) { S.apresReplay = a.lignes.filter(l => l.apresReplay); annoncer(a.lignes.filter(l => !l.apresReplay)); }
  else annoncer(a.lignes, false, { enJeu: !evt.finSet && !m.termine, coup: m.coups.length });
  render(); renderHistorique(); renderLecture();
  if (S.premier) $("coach").textContent = conseil(m.coups.length, evt.gagnant);

  // Dernier point : on laisse le temps de voir les deux signes avant la célébration et le score final.
  // (l'écran de match reste en place pendant cette pause : S.pauseFin)
  if (m.termine) {
    const seance = S;
    S.pauseFin = true; render();
    // (la poignée de main attend que le commentaire de fin de match soit fini : demande du porteur du projet, 25 octobre)
    // (19 novembre, choix du porteur du projet) Le cri, puis la poignée de main tout de suite, puis les statistiques du match pendant
    // le commentaire d'après-match ; enfin, l'écran de fin.
    setTimeout(() => { if (S === seance) criEnGrand(cel, () => voix.finiDeParler(() => { if (S === seance) poigneeDeMain(() => { if (S === seance) montrerStatsFin(finir); }); }, m.vainqueur === 0 ? 10000 : 4000)); }, reduitMouvement() ? 900 : 1800);
    return evt;
  }
  if (cel) setTimeout(() => criEnBulle(cel), 250);
  if (evt.finSet) {
    // La pause entre les sets : une fois sur deux, les supporters chantent (le chant baisse sous les commentaires, s'éteint au
    // premier échange du set suivant ; 3 novembre).
    // (3 fois sur 4 ; un chant personnalisé d'abord, puis un habituel, en alternance : 6 novembre, demande du porteur du projet)
    // (19 novembre : de temps en temps, la ola du grand stade d'abord, et le chant ensuite ; en duel, le même tirage des deux côtés)
    const veutOla = S.duel && D ? tirageDuel(`ola${m.scoresSets.length}`) % 3 === 0 : Math.random() < 0.35, ola = veutOla && ambiance.ola();
    const delaiChant = (S.duel && D ? veutOla : ola) ? 7.3 : 2.5;   // (la ola dure 8 secondes : le chant sort de la foule à sa fin)
    if (S.duel && D) { const id = chantPauseDuel(m.scoresSets.length); if (id) ambiance.chanterChoisi(id, { vol: 0.5, delai: delaiChant }); }
    else if (Math.random() < 0.75) ambiance.chanter({ vol: 0.5, delai: delaiChant, perso: persoDuMatch(), alterner: true });
    const [pa, pb] = evt.scoreSet, g = evt.gagnant, n = m.scoresSets.length;
    const suivant = annonceDebutSet(m), decisif = setDecisif(m);
    const nouveauSet = () => {
      $("hMe").textContent = "❔"; $("hBot").textContent = "❔"; $("hMe").className = "hand"; $("hBot").className = "hand"; $("verdict").textContent = "";
      annoncer([suivant]);
    };
    // En duel, le set suivant démarre quand les deux joueurs sont prêts (le serveur décide).
    if (S.duel) D.apresPanneau = nouveauSet;
    // Le moment du set, au ralenti (replay.js ; en solo : en duel, la pause est chronométrée) : il passe d'abord, une fois les
    // commentaires de fin de set terminés, et l'écran « Lancer le set suivant » n'apparaît qu'à la fin du replay (18 novembre,
    // demande du porteur du projet : on le voyait passer furtivement avant le replay).
    // (18 novembre, demande du porteur du projet) En duel aussi : la pause dure 15 secondes de plus pour le replay (étape SQL 81),
    // qui passe s'il reste au moins 20 secondes ; si le set repart pendant le replay, il s'arrête net.
    const moSet = replayVisible() ? momentDuSet(S.moments || [], n - 1, g, { smashPerdant: Math.random() < 0.25 }) : null, seanceSet = S;
    const ouvrirPause = () => {
      if (S !== seanceSet) return;
      // (après le replay : l'annonce du set décisif par Roland ou Monique, quand les commentaires sont finis)
      const apresReplay = S.apresReplay || []; S.apresReplay = null;
      if (apresReplay.length) voix.finiDeParler(() => { if (S === seanceSet) annoncer(apresReplay); }, 15000);
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
      if (S.duel) { majBoutonsPret(); afficherMessages(D.duel); }   // (le bouton des messages de la pause, étape 53)
    };
    setTimeout(() => {
      if (S.duel && (!D || D.duel.phase !== "entre_sets")) { if (D) { D.apresPanneau = null; nouveauSet(); duelReprendre(); } return; }
      if (moSet && S.duel) {
        voix.finiDeParler(() => {
          if (S !== seanceSet || !D || D.duel.phase !== "entre_sets") return;
          if (tempsRestant(D.duel.echeance, D.decalage) < 20000) { ouvrirPause(); return; }
          const d = D;
          d.replayEnCours = jouerReplay([moSet], () => { d.replayEnCours = null; if (S === seanceSet && D === d && D.duel.phase === "entre_sets") ouvrirPause(); });
        }, 4000);
      } else if (moSet) voix.finiDeParler(() => { if (S === seanceSet) jouerReplay([moSet], ouvrirPause); }, 25000);   // (25 s au plus : 10 avant, le replay pouvait couper le résumé)
      else ouvrirPause();
    }, cel ? 2400 : 1200);                                  // on laisse le temps de voir le cri
    return evt;
  }
  // Après de gros sifflets, le jeu est arrêté le temps que l'arbitre rappelle le public à l'ordre (demande du porteur du projet).
  const seance = S, attente = S.duel ? 900 : Math.max(900, (S.silenceJusqu || 0) - Date.now());
  // (le texte n'apparaît qu'au moment où l'arbitre intervient, pour ne pas gâcher la surprise des sifflets ou de la trompette)
  let repris = false;
  if (attente > 900) setTimeout(() => { if (S === seance && !repris) $("verdict").textContent = "🤫 Jeu arrêté : l'arbitre rappelle le public à l'ordre…"; },
    Math.max(0, (S.arretAfficheA || 0) - Date.now()));
  setTimeout(() => {
    repris = true;
    if (S !== seance) return;
    if (S.duel) { duelReprendre(); return; }
    if ($("verdict").textContent.startsWith("🤫")) $("verdict").textContent = "À toi de jouer !";
    S.occupe = false; boutons(true); lancerMinuteur();
  }, attente);
  return evt;
}

// L'arbitre demande le calme (une phrase tirée au hasard, pas deux fois de suite la même).
let dernierSilence = null;
function silenceArbitre() {
  dernierSilence = choisirSilence(i => voix.fichiers.has(i), dernierSilence);
  return CATALOGUE.get(dernierSilence);
}

// ---------------------------------------------------------------- célébrations (le cri du vainqueur)
// joueur 0 : moi ; 1 : l'adversaire (humain : son cri choisi dans sa fiche ; bot : le sien).
const criDe = g => (g === 0 ? P.cri : OPP.humain ? criValide(OPP.fiche?.cri) : (S.criBot ||= criDuBot(OPP.id, P.cri)));
// (avec la clé de leur broderie : le pseudo brodé sur le poignet, gants-brodes.js)
const avMoi = () => ({ ...P.av, brode: clePseudo(P.pseudo, P.numero) });
const avAdv = () => (OPP?.humain ? { ...OPP.av, brode: clePseudo(OPP.nom, OPP.numero) } : OPP.av);
const avDe = g => (g === 0 ? avMoi() : avAdv());
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
  const m = S.match, c = m.coups, debuts = new Set(m.debutsSet), pens = m.penalites || [];
  // (18 novembre, demandes du porteur du projet : un coup joué en smash est entouré ; un point de pénalité, une croix à sa place)
  const elements = [];
  c.forEach((x, i) => { pens.filter(p => p.apres === i).forEach(p => elements.push({ penalite: p.fautif, i })); elements.push({ ...x, i }); });
  pens.filter(p => p.apres === c.length).forEach(p => elements.push({ penalite: p.fautif, i: c.length }));
  const vus = new Set();
  const ligne = (cle, label) => { vus.clear(); return `<tr><th>${esc(label)}</th>` + elements.map(x => {
    const debut = x.i > 0 && debuts.has(x.i) && !vus.has(x.i); vus.add(x.i);
    const cls = [classeCoup(x, cle), debut ? "newset" : "", cle === "a" && x.auto?.[0] ? "auto" : ""].join(" ").trim();
    return `<td class="${cls}">${contenuCoup(x, cle)}</td>`;
  }).join("") + "</tr>"; };
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
  $("btnTempsForts").hidden = !(replayVisible() && (S.moments || []).length);   // le replay des temps forts (replay.js)
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
    finaleTournoi: enTournoi && tourDe(T, S.tour).finale, compteNiveau: !S.duel && !S.contreFantome,   // (le fantôme : ni niveau ni duel)
    abandon: !!special && !gagne, officiel: !!(S.duel && D?.duel?.classe), niveauMoi: monClassement ?? 1200, niveauAdv: OPP.classement ?? 1200,
    finaleEnLigne: !!(S.duel && D?.tourVoix === "finale"), sitAndGo: !!(S.duel && D?.direct), grandChelem: !!(S.duel && D?.grandChelem),
  }) : [];
  // L'historique des mains contre cet adversaire (bot ou joueur en ligne), gardé sur le téléphone : la fiche de l'adversaire
  // et la mémoire des commentateurs (balles de match sauvées comprises).
  if (n) ecrire("mains", noterMain(lire("mains"), OPP.id, { gagne, detail: m.scoresSets.map(([a, b]) => `${a}–${b}`).join(", "), coups: c, debutsSet: m.debutsSet, penalites: m.penalites, balles: S.stats.ballesDeMatchSauvees || 0 }));
  // Le premier gant : offert après le premier match (avant, la main nue).
  const premierGant = matchsAvant === 0 && P.matchs > 0 && (P.av.gant === "nu" || P.av.gant === "debutant") && !P.premierGant;
  if (premierGant) { P.av.gant = "blanc"; P.premierGant = true; }
  // Les trophées de la carrière (montées, coupe, bouclier, Élite) : ils débloquent des objets et des surnoms.
  if (enCarriere) nouveaux.push(...accorderTitres(P, titresCarriere(C)));
  sauverP(); rafraichirAvatars(); afficherBilan();
  $("coach").hidden = true;
  if (S.matchJour && n) noterMatchDuJour({ gagne, score: m.scoresSets[0] || [0, 0], grille: grille(c) });
  // (24 novembre) les matchs joués pendant les fêtes : « Esprit de Noël » au 12e
  if (n && noelActif()) { const t = accorderTitres(P, compterMatchNoel(P)); nouveaux.push(...t); sauverP(); }
  // Le calendrier de l'Avent (ecran-avent.js) : ce match ouvre-t-il une case ?
  if (n && noelActif()) aventUI?.apresMatch({ match: m, adv: OPP.id, botNoel: !!OPP.noel, duel: !!S.duel, smashsReussis: S.stats.smashsReussis || 0,
    meilleureSerie: S.stats.meilleureSerie || 0, matchDuJour: !!S.matchJour, rattrapage: S.aventRattrapage || null, abandon: !!special });
  // La série de jours (match-du-jour.js) : ses paliers donnent un trophée et un objet (nouveautes.js : « serie »).
  const serieFin = S.matchJour && n && ouvert("serie") ? serie(resultatsDuJour(), jourParis()) : 0;
  if (serieFin) { nouveaux.push(...accorderTitres(P, titresSerie(serieFin))); sauverP(); }
  // « Fondé en 2026 » : 50 matchs joués avant la fin de 2026 (nouveautes.js : « club »).
  if (n && ouvert("club")) { const t = accorderTitres(P, titresAnnee(P)); if (t.length) { nouveaux.push(...t); sauverP(); } }
  // La première visite : ce qui vient de s'ouvrir dans le menu.
  const menusOuverts = menuComplet() ? [] : nouveautes(matchsAvant, P.matchs);
  if (matchsAvant < 3 && P.matchs >= 3) compterTroisMatchs(envoyerTroisMatchs);   // pour savoir si les nouveaux joueurs accrochent (anonyme)
  if (n) compterMatchJoue(envoyerMatch);   // le nombre de matchs joués chaque jour (anonyme)
  if (n && !special) compterPremierMatch(envoyerParcours);   // le parcours des nouveaux : premier match fini, sans abandon (anonyme, une seule fois)
  // « La Une » : on garde de quoi raconter ce match.
  S.pourUne = n && !special ? {
    etape: S.carriere ? S.carriere.coupe ? S.carriere.etape.replace(" · ", ", ") : `${CIRCUITS[S.carriere.circuit]}, ${S.carriere.etape.charAt(0).toLowerCase()}${S.carriere.etape.slice(1)}` : S.contreBotRapide ? "Partie rapide contre un bot" : S.contreFantome ? "Contre un fantôme" : S.duel && D?.duel?.rapide ? `Partie rapide ${D.duel.points_par_set === 11 ? "classique" : "éclair"}` : S.duel ? (D?.duel?.tournoi_id ? (D.direct ? (D.tourVoix === "finale" && D.nbTours > 1 ? "Finale de Sit & Go" : "Sit & Go") : D.championnat ? "Championnat du cercle" : D.tourVoix === "finale" ? "Finale du tournoi" : "Tournoi en ligne") : D?.duel?.classe === false ? "Duel amical" : "Duel officiel")
      : enTournoi ? `${tourDe(T, S.tour).singulier} du HandSlam Open` : "Match d'entraînement",
    finale: !!S.annonces.finale, numero: P.matchs, enjeu: S.duel ? D?.duel?.enjeu || null : null,
  } : null;
  $("btnUne").hidden = !S.pourUne;
  // « Ton avis ? » : une seule fois, à partir du 5e match (nouveautes.js : « avis »).
  const avisCarte = !!n && ouvert("avis") && proposerAvis({ matchs: P.matchs, dejaProposee: !!lire("avisPropose"), dejaDonne: !!lire("avisDonne") });
  $("avisCarte").hidden = !avisCarte;
  if (avisCarte) ecrire("avisPropose", Date.now());
  $("again").hidden = enTournoi || !!S.duel; $("tNext").hidden = !enTournoi;
  const tournoiId = S.duel && D ? D.duel.tournoi_id : null;   // match de tournoi en ligne
  const rapide = !!(S.duel && D?.duel?.rapide) || !!S.contreBotRapide;
  $("revanche").hidden = !S.duel || !!tournoiId; $("retourDuels").hidden = !S.duel || !!tournoiId || rapide; $("revanche").disabled = false;
  $("revanche").textContent = D?.duel?.enjeu ? "🔁 Revanche, même enjeu" : "🔁 Revanche";   // en un geste, avec le même format et le même enjeu
  $("encoreRapide").hidden = !rapide;
  if (S.contreBotRapide || S.matchJour || S.carriere || S.contreFantome) $("again").hidden = true;
  $("carSuite").hidden = !S.carriere;
  $("mdjPartagerFin").hidden = !S.matchJour;
  $("voirTournoi").hidden = !tournoiId;
  $("signalerZone").hidden = !(S.duel && OPP.humain);
  if (!S.duel) $("endClassement").hidden = true;
  $("abandonDuelZone").hidden = true;
  if (enTournoi) $("tNext").textContent = gagne ? (tourDe(T, S.tour).finale ? "Voir le palmarès" : "Continuer le tournoi") : "Voir la suite du tournoi";
  $("news").textContent = nouveaux.length ? "Nouveau titre : " + nouveaux.map(t => t.nom + (texteDeblocage(t) ? ` (débloque ${texteDeblocage(t)})` : "")).join(", ") + " !" : "";
  if (serieFin > 1) $("news").textContent = `🔥 Série : ${serieFin} jours d'affilée ! ${$("news").textContent}`.trim();
  const paliers = retenirRang();
  if (paliers.length) $("news").textContent = `${$("news").textContent} ${paliers.join(" ")}`.trim();
  if (menusOuverts.length) $("news").textContent = `${S.premier ? "🎉 Ton premier match est joué ! " : ""}${menusOuverts.join(" ")} ${$("news").textContent}`.trim();
  // Un titre : la cérémonie de la coupe, peu après l'écran de fin.
  // La montée sans le titre : finaliste de l'Amateur, ou barrage d'accession gagné.
  if (enCarriere && !S.carriere.coupe && C.phase === "fin" && C.bilan?.mouvement === 1 && C.issues?.[C.ou]?.champion !== "moi") {
    const seance = S, finaliste = phaseAvant === "playoffs";
    setTimeout(() => { if (S === seance) ouvrirCeremonie({ sur: CIRCUITS[C.ou], titre: "Promu !", sous: `${finaliste ? "Finaliste des playoffs" : "Barrage gagné"} : tu montes en ${CIRCUITS[C.ou + 1]} !` }); }, 1400);
  }
  if (enCarriere && gagne) {
    let ceremonie = null;
    if (S.carriere.coupe && C.coupe?.vainqueur === "moi") ceremonie = { sur: "Coupe Monique-Latour", titre: "Vainqueur !", sous: "Ton nom est gravé sur la Coupe Monique-Latour.", coupe: coupeMLSVG(true), voix: "speaker_champion_01" };
    else if (!S.carriere.coupe && phaseAvant === "playoffs" && C.issues?.[C.ou]?.champion === "moi") ceremonie = { sur: CIRCUITS[C.ou], titre: "Champion !",
      sous: C.ou < CIRCUITS.length - 1 ? `Tu montes en ${CIRCUITS[C.ou + 1]} !` : "Champion de l'Élite : le sommet du HandSlam !", coupe: coupeSVG(C.ou, true), voix: "speaker_champion_01" };
    const seance = S;
    if (ceremonie) setTimeout(() => { if (S === seance) ouvrirCeremonie(ceremonie); }, 1400);
  }
  // Une élimination (ou une descente) dans un match décisif : un écran sobre, pour marquer le coup aussi (23 octobre).
  if (enCarriere && !gagne) {
    const e = eliminationCarriere(phaseAvant), seance = S;
    if (e) setTimeout(() => { if (S === seance) ouvrirCeremonie({ ...e, triste: true }); }, 1400);
  }
  if (enCarriere && S.carriere.coupe) $("news").textContent = `🏆 ${gagne ? texteCoupe(C) : `Éliminé de la Coupe Monique-Latour.`} ${$("news").textContent}`.trim();
  else if (enCarriere && C.phase !== phaseAvant) $("news").textContent = `🏅 ${C.phase === "fin" ? `Fin de saison : ${texteBilan(C)}` : C.phase === "barrage" ? `Direction le barrage contre ${botParId(C.barrage.adv).nom} !` : C.phase === "petite" ? `Direction le match pour la 3e place contre ${botParId(C.petite.adv).nom} !` : phaseAvant === "saison" ? `Saison terminée à la ${C.place}${C.place === 1 ? "re" : "e"} place${C.poules ? " de ta poule" : ""} : ${C.phase === "playoffs" ? "qualifié pour les playoffs !" : C.phase === "maintien7" ? `le match pour le maintien contre ${botParId(C.duel.adv).nom}.` : "place au maintien."}` : ""} ${$("news").textContent}`.trim();
  if (premierGant) $("news").textContent = `🧤 Fini le « A » du débutant : ton premier vrai gant t'est offert ! Change sa couleur (ou passe à la main nue) dans Ma fiche › Vestiaire. ${$("news").textContent}`.trim();
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
  // Chaque match terminé rapporte des jetons (avec un compte) : selon le résultat et les exploits (étape 57 ; pas pour un
  // forfait ou un abandon).
  if (n && !special) {
    const exploits = exploitsDuMatch({ stats: S.stats, m, matchJour: !!S.matchJour });
    jetonsUI?.gagnerMatch(gagne, exploits).then(g => { if (g) $("news").textContent = `🪙 +${g} jetons${exploits.length ? ` (${exploits.map(x => EXPLOITS[x].nom).join(", ")})` : ""}. ${$("news").textContent}`.trim(); });
  }
  $("end").scrollIntoView({ behavior: reduitMouvement() ? "auto" : "smooth", block: "start" });
  // L'interview d'après-finale : seulement pour les tournois programmés (pas les Sit & Go, ni les tournois d'entraînement ou entre amis).
  if (n && !special && S.annonces.finale && S.duel && D?.programme) setTimeout(() => ouvrirInterview(gagne), 2500);
}

// ---------------------------------------------------------------- la poignée de main
// 5 secondes pour choisir (sinon, mon style habituel ; DELAI_CHOIX_MS), puis une courte animation, puis l'écran de fin.
// Contre un humain, on envoie son choix et on attend un peu celui de l'adversaire (sinon, son style habituel).
// Le panneau des statistiques du match (19 novembre, idée du porteur du projet : comme au tennis à la télé), après la poignée de
// main : Roland et Monique y font leur commentaire d'après-match (gardé depuis le dernier point). Il reste au moins 6 secondes, et
// jusqu'à la fin des commentaires (25 secondes au plus) ; « Continuer » pour passer.
// silencieux : sans les commentaires (le panneau revient après les temps forts ; 19 novembre)
function montrerStatsFin(apres, { silencieux = false } = {}) {
  const m = S.match, st = statsDuMatch(m.coups), mes = S.stats || {}, ov = $("statsFin"), seance = S;
  const pc = (x, n) => (n ? `${Math.round((100 * x) / n)} %` : "–"), sur = ([a, b]) => (b ? `${a}/${b}` : null), enPc = ([a, b]) => pc(a, b);
  const donnees = [];   // (les mêmes lignes, pour l'image à partager)
  // rg, rd : le rapport, sous le pourcentage (20 novembre : le pourcentage en avant, le rapport entre parenthèses)
  const ligne = (titre, g, d, vg = null, vd = null, { rg = null, rd = null } = {}) => {
    const tg = vg ?? Number.parseFloat(g) ?? 0, td = vd ?? Number.parseFloat(d) ?? 0, tot = (tg || 0) + (td || 0);
    donnees.push({ titre, g, d, tg: tg || 0, td: td || 0, rg, rd });
    const barre = tot > 0 ? `<div class="sf-barre"><i style="width:${(100 * (tg || 0)) / tot}%"></i><i style="width:${(100 * (td || 0)) / tot}%"></i></div>` : "";
    const rap = x => (x ? `<small class="sf-ratio">(${x})</small>` : "");
    return `<div class="sf-ligne"><b>${g}${rap(rg)}</b><div class="sf-milieu">${esc(titre)}${barre}</div><b>${d}${rap(rd)}</b></div>`;
  };
  const nb = j => st.signes[j][0] + st.signes[j][1] + st.signes[j][2];
  const ballesAdv = [Math.max(0, (mes.ballesSubies || 0) - (mes.ballesSauvees || 0)), mes.ballesSubies || 0];
  $("sfMoi").textContent = nomAffiche(P); $("sfAdv").textContent = OPP.nom;
  $("sfScore").textContent = m.scoresSets.map(([a, b]) => `${a}–${b}`).join("  ");
  const favSigne = j => st.signes[j].indexOf(Math.max(...st.signes[j])), fav = j => (nb(j) ? st.signes[j][favSigne(j)] / nb(j) : 0);
  const prefere = j => (nb(j) ? `${EMOJI[favSigne(j)]} ${pc(st.signes[j][favSigne(j)], nb(j))}` : "–");
  // (19 novembre, choix du porteur du projet : sans « Points gagnés », qui doublait le score ; le % de réussite sans les égalités)
  // (26 novembre, demande du porteur du projet) le punch : les points marqués sur tous les coups, égalités comprises
  $("sfLignes").innerHTML = ligne("Punch", pc(st.points[0], st.coups), pc(st.points[1], st.coups), st.points[0], st.points[1], { rg: sur([st.points[0], st.coups]), rd: sur([st.points[1], st.coups]) })
    // (27 novembre, demande du porteur du projet : la Résistance à la place de l'Imprévisibilité, souvent proche de 100 sur un seul
    // match et peu liée à la victoire ; elle reste sur la carte) les égalités plutôt que des points perdus, sur les points non gagnés
    + ligne("Résistance", pc(st.egalites, st.egalites + st.points[1]), pc(st.egalites, st.egalites + st.points[0]),
      st.egalites / ((st.egalites + st.points[1]) || 1), st.egalites / ((st.egalites + st.points[0]) || 1),
      { rg: sur([st.egalites, st.egalites + st.points[1]]), rd: sur([st.egalites, st.egalites + st.points[0]]) })
    // (19 novembre, le porteur du projet trouvait le panneau trop chargé : 7 lignes ; le signe préféré sur une seule ligne, sans
    // « Change de signe après une égalité » ni « Meilleure série », que Monique commente quand ils comptent)
    + ligne("Signe préféré", prefere(0), prefere(1), fav(0), fav(1))
    + ligne("Points gagnés juste après une égalité", st.apresEgalite[0], st.apresEgalite[1])
    + ligne("Garde son signe après un point gagné", pc(...st.memeApresGain[0]), pc(...st.memeApresGain[1]), st.memeApresGain[0][0] / (st.memeApresGain[0][1] || 1), st.memeApresGain[1][0] / (st.memeApresGain[1][1] || 1), { rg: sur(st.memeApresGain[0]), rd: sur(st.memeApresGain[1]) })
    // (19 novembre au soir, demande du porteur du projet : on la rajoute)
    + ligne("Change de signe après un point perdu", pc(...st.changeApresPerte[0]), pc(...st.changeApresPerte[1]), st.changeApresPerte[0][0] / (st.changeApresPerte[0][1] || 1), st.changeApresPerte[1][0] / (st.changeApresPerte[1][1] || 1), { rg: sur(st.changeApresPerte[0]), rd: sur(st.changeApresPerte[1]) })
    + ligne("Smashs gagnants", enPc(st.smashs[0]), enPc(st.smashs[1]), st.smashs[0][0], st.smashs[1][0], { rg: sur(st.smashs[0]), rd: sur(st.smashs[1]) })
    + ligne("Balles de set et de match converties", enPc([mes.ballesConverties || 0, mes.ballesObtenues || 0]), enPc(ballesAdv), mes.ballesConverties || 0, ballesAdv[0],
      { rg: sur([mes.ballesConverties || 0, mes.ballesObtenues || 0]), rd: sur(ballesAdv) })
    + `<p class="sf-seul">${st.coups} coups joués · ${st.egalites} égalité${st.egalites > 1 ? "s" : ""}</p>`;
  ov.hidden = false;
  const debut = Date.now(), coms = S.commentairesFin || [];
  S.commentairesFin = null;
  let fait = false;
  const fin = () => { if (fait) return; fait = true; ov.hidden = true; voix.arreter(); if (S === seance) apres(); };
  $("sfContinuer").onclick = fin;
  // Partager l'image des statistiques (19 novembre, demande du porteur du projet) ; le panneau reste alors ouvert.
  let garde = false;
  const pied = `${st.coups} coups joués · ${st.egalites} égalité${st.egalites > 1 ? "s" : ""}`;
  $("sfPartager").onclick = async () => {
    garde = true;
    try {
      const cv = dessinerStats(document.createElement("canvas"), { moi: nomAffiche(P), adv: OPP.nom, score: $("sfScore").textContent, lignes: donnees, pied });
      const blob = await new Promise(ok => cv.toBlob(ok, "image/png")), f = new File([blob], "handslam-statistiques.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [f] })) { await navigator.share({ files: [f], title: "Les statistiques de mon match HandSlam" }); return; }
      const a = document.createElement("a"), url = URL.createObjectURL(blob);
      a.href = url; a.download = f.name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e) { if (e?.name !== "AbortError") console.warn("partage des statistiques", e); }
  };
  if (silencieux) return;
  // Puis Roland et Monique commentent les chiffres de ce match, comparés à ses habitudes (une fois sur deux ; commentaireStats).
  const tr = S.tempsReponse || [];
  const dlgStats = commentaireStats({
    st, mes, gagne: m.vainqueur === 0, outsider: S.annonces?.outsider ?? null, scoresSets: m.scoresSets, pointsParSet: m.format.pointsParSet,
    carriere: { signes: P.signes, devines: P.devines, lisibles: P.lisibles }, reserveUtilisee: RESERVE_MS - (m.reserve?.[0] ?? RESERVE_MS),
    tempsMoyen: tr.length >= 8 ? tr.reduce((a, b) => a + b, 0) / tr.length : null,
  }, { genre: P.genre, audible: id => voix.fichiers.has(id), anciens: commentairesRecents() });
  voix.finiDeParler(() => {
    if (fait) return;
    if (coms.length) annoncer(coms);
    voix.finiDeParler(() => {
      if (fait) return;
      if (dlgStats) annoncer(dlgStats);
      voix.finiDeParler(() => setTimeout(() => { if (!garde) fin(); }, Math.max(1500, 6000 - (Date.now() - debut))), 20000);
    }, 25000);
  }, 4000);
}
function poigneeDeMain(apres) {
  const seance = S;
  if (!S || (S.duel && (!D || D.finSpeciale))) { apres(); return; }
  const ov = $("poignee"), scene = $("pmScene"), choix = $("pmChoix");
  $("pmMoi").innerHTML = avatarSVG(avMoi()); $("pmAdv").innerHTML = avatarSVG(avAdv());
  $("pmStyleMoi").textContent = ""; $("pmStyleAdv").textContent = "";
  scene.className = "pm-scene"; choix.hidden = false; $("pmTemps").hidden = false;
  choix.querySelector('[data-s="givree"]').hidden = !possede(P, "poignee", "givree");   // (la poignée givrée : calendrier de l'Avent)
  choix.classList.toggle("cinq", possede(P, "poignee", "givree"));
  choix.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.s === P.poignee)));
  const barre = $("pmTemps"); barre.classList.remove("court"); void barre.offsetWidth; barre.classList.add("court");
  ov.classList.add("show");
  let fait = false, fini = false;
  const terminer = () => { if (fini) return; fini = true; ov.classList.remove("show"); ov.onclick = null; if (S === seance) apres(); };
  const debut = Date.now(), minuterie = setTimeout(() => choisir(P.poignee), DELAI_CHOIX_MS);
  async function choisir(style) {
    if (fait) return; fait = true; clearTimeout(minuterie);
    style = styleValide(style);
    choix.hidden = true; $("pmTemps").hidden = true;
    compterPoignee(P, style, S.match.vainqueur === 1); sauverP(); defisUI?.poignee(normaleDe(style));
    let adv;
    if (S.duel && D) adv = await styleAdversaire(style, debut);
    else adv = styleDuBot(OPP.id, style);
    montrer(style, adv);
  }
  function montrer(moi, adv) {
    const r = rencontre(moi, adv), ligne = CATALOGUE.get(r.ligne);
    $("pmStyleMoi").textContent = `${STYLES[moi].icone} ${STYLES[moi].nom}`;
    $("pmStyleAdv").textContent = `${STYLES[adv].icone} ${STYLES[adv].nom}`;
    $("pmMain").textContent = "🤝";
    scene.classList.add("go", r.animation);
    // Roland ou Monique commentent la poignée (pas une normale), seulement avec une réplique enregistrée.
    const moment = situationPoignee(moi, adv);
    const cands = moment ? (POOLS[moment] || []).map(it => ligneMoment(it)).filter(l => l && voix.fichiers.has(l.id)) : [];
    const com = cands.length ? cands[Math.floor(Math.random() * cands.length)] : null;
    // (21 novembre, remarque du porteur du projet : la poignée coupait le commentaire de fin de match) seulement si plus personne
    // ne parle : sinon, on laisse Roland et Monique finir.
    if (com || ligne) setTimeout(() => { if (!voix.occupe) voix.dire([ligne, com].filter(Boolean)); }, 500);
    (S.citations ||= []).push(...[ligne, com].filter(l => l && l.role !== "arbitre"));
    ov.onclick = terminer;                                   // toucher l'écran : on passe
    // (avec un commentaire, on laisse le temps de l'entendre)
    setTimeout(terminer, reduitMouvement() ? 1200 : com ? 3600 : 2400);
  }
  choix.onclick = e => { const b = e.target.closest("button[data-s]"); if (b) choisir(b.dataset.s); };
}
// Duel : j'envoie ma poignée de main, puis je regarde (jusqu'à ~2 s) si l'adversaire a choisi.
// (on attend l'adversaire jusqu'à la fin de son temps de choix, et au moins 2 secondes après mon choix)
async function styleAdversaire(moi, debut = Date.now()) {
  const id = D.id, sa = D.moi === 0 ? "poignee1" : "poignee0";
  const habituel = styleValide(OPP.fiche?.poignee);
  try {
    let d = await serveur.serrerLaMain(id, normaleDe(moi));   // (la givrée : une normale pour le serveur)
    const jusqua = Math.max(Date.now() + 2100, debut + DELAI_CHOIX_MS + 700);
    while (!d?.[sa] && Date.now() < jusqua) { await new Promise(ok => setTimeout(ok, 700)); d = await serveur.lireDuel(id); }
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
function verifierAmi() {
  const d = D;
  if (!d) return;
  d.amiPret = verifierAmiDe(d);
}
// (la présentation attend la réponse, au plus 1,5 s : les chants des deux amis en dépendent ; 6 novembre)
const attendreAmi = () => (S?.duel && D?.amiPret ? Promise.race([D.amiPret, new Promise(ok => setTimeout(ok, 1500))]) : Promise.resolve());
async function verifierAmiDe(d) {
  try { const amis = await mesAmis(); if (D === d) { d.ami = amis.some(a => a.id === OPP.uid && a.statut === "amis"); afficherMessages(d.duel); } }
  catch { /* sans la liste, pas de chambrage */ }
}
const momentAvecMoi = duel => (duel.phase === "presentation" ? "avant" : duel.phase === "entre_sets" ? "entre_sets" : duel.phase === "termine" && duel.vainqueur !== null && duel.vainqueur !== undefined ? momentApres(duel.vainqueur === D.moi) : null);
// Un seul bouton à l'écran ; il ouvre la fenêtre des messages (décision du 22 octobre : les rangées de puces encombraient).
function puces(zone, moment) {
  zone.innerHTML = `<button class="btn alt msg-ouvrir" data-moment="${moment}">💬 Envoyer un message à ${esc(OPP.nom)}</button>`;
}
// La fenêtre : les phrases fair-play, puis, entre amis, le chambrage et le message écrit soi-même.
// Les annonces bien alignées (6 novembre, demande du porteur du projet) : une ligne par annonce (« J'ouvre avec… »), puis les trois signes.
const LIGNES_ANNONCES = [["ouvre", "J'ouvre avec…"], ["sais", "Je sais : tu ouvres avec…"], ["pas", "Ne joue pas…"], ["joue", "Joue… !"]];
const SIGNES_ANNONCES = [["p", "🪨", "Pierre"], ["f", "📄", "Feuille"], ["c", "✂️", "Ciseaux"]];
function grilleAnnonces(annonces) {
  const ids = new Set(annonces.map(m => m.id)), texte = id => annonces.find(m => m.id === id)?.texte || "";
  return `<div class="msg-annonces">` + LIGNES_ANNONCES.filter(([l]) => SIGNES_ANNONCES.some(([s]) => ids.has(`${l}_${s}`))).map(([l, titre]) =>
    `<span class="msg-annonce-titre">${esc(titre)}</span>` + SIGNES_ANNONCES.map(([s, emoji, nom]) => ids.has(`${l}_${s}`)
      ? `<button data-msg="${l}_${s}" aria-label="${esc(texte(`${l}_${s}`))}"><span aria-hidden="true">${emoji}</span> ${nom}</button>` : "<span></span>").join("")).join("") + `</div>`;
}
function ouvrirMessages(moment) {
  if (!D) return;
  const ami = !!D.ami, liste = messagesPossibles(moment, ami), rubrique = (titre, l) => `<p class="msg-rubrique">${titre}</p><div class="msg-puces">`
    + l.map(m => `<button class="${m.amis ? "amis" : ""}" data-msg="${m.id}">${esc(m.texte)}</button>`).join("") + `</div>`;
  $("msgFenetreTitre").textContent = `💬 Un mot pour ${OPP.nom}`;
  // (le message écrit en premier, entre amis : avant, il fallait faire défiler jusqu'en bas de la fenêtre ; puis les annonces)
  const annonces = liste.filter(m => m.annonce);
  $("msgFenetreCorps").innerHTML = (ami ? `<p class="msg-rubrique">✍️ Écrire mon message</p><div class="msg-libre"><input type="text" id="msgLibre" maxlength="${MESSAGE_LIBRE_MAX}" placeholder="Ton message (${MESSAGE_LIBRE_MAX} max.)" autocomplete="off"><button class="btn" id="msgLibreEnvoyer">Envoyer</button></div>` : "")
    + (annonces.length ? `<p class="msg-rubrique">🧠 Annonces (vraies ou fausses…)</p>` + grilleAnnonces(annonces) : "")
    + rubrique("😊 Fair-play", liste.filter(m => !m.amis && !m.annonce && !m.smiley))
    // (les smileys, avec n'importe quel joueur : 18 novembre)
    + `<p class="msg-rubrique">😀 Smileys</p><div class="msg-smileys">` + liste.filter(m => m.smiley).map(m => `<button data-msg="${m.id}">${m.texte}</button>`).join("") + `</div>`
    + (ami ? rubrique("😈 Chambrage, entre amis", liste.filter(m => m.amis))
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
// Au début du set suivant, les messages de la pause sortent des avatars (6 secondes), comme ceux d'avant le match.
function bullesSet(duel) {
  const moi = D.moi, adv = 1 - moi, n = (duel.scores_sets || []).length;
  const duSet = j => (duel.message_set_n?.[j] === n ? texteMessage("entre_sets", duel[`message_set${j}`]) : null);
  const m = duSet(moi), a = masquerMessages() ? null : duSet(adv);
  if (!m && !a) return;
  bulle($("bulleSideMe"), m); bulle($("bulleSideAdv"), a);
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
  // Pendant la pause entre deux sets (étape 53) : un message chacun, dans la fenêtre de fin de set.
  const n = (duel.scores_sets || []).length, duSet = j => (duel.message_set_n?.[j] === n ? duel[`message_set${j}`] : null);
  const pause = duel.phase === "entre_sets" && !!panneauOuvert, setMoi = duSet(moi), setAdv = duSet(adv);
  bulle($("iMsgMoi"), pause && setMoi ? `Toi : ${texteMessage("entre_sets", setMoi) || "…"}` : null);
  bulle($("iMsgAdv"), pause && !cache && setAdv ? `${OPP.nom} : ${texteMessage("entre_sets", setAdv) || "…"}` : null);
  $("iMsg").hidden = !(pause && !setMoi);
  if (!$("iMsg").hidden && D.pucesSet !== `${n}${!!D.ami}`) { puces($("iMsg"), "entre_sets"); D.pucesSet = `${n}${!!D.ami}`; }
  signalEcrit($("iEcrit"), pause && ecrit(setAdv));
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
for (const id of ["foMsgPuces", "finMsgPuces", "iMsg"]) $(id).addEventListener("click", e => { const b = e.target.closest("button[data-moment]"); if (b) ouvrirMessages(b.dataset.moment); });
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

// ---------------------------------------------------------------- Mon jeu (Ma fiche › Stats)
// Contre les joueurs, contre les bots, ou en tout (19 novembre, demande du porteur du projet ; par défaut, contre les joueurs).
// Les deux premiers ne sont comptés qu'à partir du 19 novembre : avant, rien ne les distinguait.
let vueJeu = "humains";
try { vueJeu = localStorage.getItem("hs_vue_jeu") || "humains"; } catch { /* rien */ }
// Une seule fois, avec un compte : « Mon jeu » contre les joueurs retrouvé dans les duels passés gardés par le serveur ; contre
// les bots, le total moins ces matchs-là.
let recupEnCours = false;
async function recupererJeuPasse() {
  const uid = compteUI?.session()?.user?.id;
  if (P.parAdvVersion >= 11 || recupEnCours || !uid) return;
  recupEnCours = true;
  try {
    const duels = [];
    for (let debut = 0; debut < 20000; debut += 1000) {
      const page = await mesDuelsTermines(debut);
      duels.push(...(page || []));
      if (!page || page.length < 1000) break;
    }
    const advs = [...new Set(duels.map(d => (d.j0 === uid ? d.j1 : d.j0)).filter(Boolean))], bots = new Set();
    for (let i = 0; i < advs.length; i += 150) for (const p of await profilsEnLigne(advs.slice(i, i + 150))) if (estBotEnLigne(p.pseudo)) bots.add(p.id);
    const h = jeuDepuisDuels(duels, uid, bots);
    // (27 novembre) le Sang-froid sans les égalités : celui compté contre les bots avec l'ancienne règle repart de zéro
    if (!(P.parAdvVersion >= 10) && P.parAdv?.bots) { P.parAdv.bots.calmeOccasions = 0; P.parAdv.bots.calmePoints = 0; }
    P.parAdv = { humains: h, bots: jeuMoins(P, h) }; P.parAdvRecupere = Date.now(); P.parAdvVersion = 11;   // (2 : avec les victoires ; 3 : les balles, les sets décisifs, les lectures ; 4 : les lectures ratées ; 5 : le Flair ; 6 : l'Endurance, les égalités ; 7 : les ouvertures ; 8 : le nouveau Flair ; 9 : le Sang-froid ; 10 : le Sang-froid sans les égalités ; 11 : l'entêtement)
    sauverP();
  } catch (e) { console.warn("Mon jeu : matchs passés", e); }
  recupEnCours = false;
  if (!$("viewProfile").hidden) renderMonJeu();
}
function renderMonJeu() {
  if (!(P.parAdvVersion >= 11) && compteUI?.session()?.user) recupererJeuPasse();
  // (sans compte et sans duel joué : tous les matchs passés étaient contre des bots)
  else if (!(P.parAdvVersion >= 11) && !compteUI?.session()?.user && !P.duelsFinis) {
    if (!(P.parAdvVersion >= 10) && P.parAdv?.bots) { P.parAdv.bots.calmeOccasions = 0; P.parAdv.bots.calmePoints = 0; }
    const h = P.parAdv?.humains || jeuVide();
    P.parAdv = { humains: h, bots: jeuMoins(P, h) }; P.parAdvRecupere = Date.now(); P.parAdvVersion = 11; sauverP();
  }
  $("gameBody").innerHTML = htmlJeu(P, vueJeu, { enCours: recupEnCours, connecte: !!compteUI?.session()?.user });
  $("gameBody").querySelectorAll(".jeu-vue").forEach(b => b.addEventListener("click", () => {
    vueJeu = b.dataset.vue; try { localStorage.setItem("hs_vue_jeu", vueJeu); } catch { /* rien */ }
    renderMonJeu();
  }));
}
// « Mon jeu » (ou « Son jeu », sur la fiche d'un autre joueur ; 19 novembre) : Q, une fiche de joueur ; vue : humains, bots ou total.
// Sans la séparation joueurs / bots (une fiche d'un joueur qui n'a pas encore la dernière version), seulement le total.
function htmlJeu(Q, vue, { enCours = false, connecte = true, autre = null } = {}) {
  const separe = !autre || !!Q.parAdvRecupere;
  if (!separe) vue = "total";
  const V = vue === "total" ? Q : (Q.parAdv?.[vue] || jeuVide());
  const choix = [["humains", "👥 Joueurs"], ["bots", "🤖 Bots"], ["total", "Tout"]]
    .map(([k, t]) => `<button type="button" class="jeu-vue${k === vue ? " on" : ""}" data-vue="${k}" aria-pressed="${k === vue}">${t}</button>`).join("");
  const entete = separe ? `<div class="jeu-vues" role="group" aria-label="Contre qui">${choix}</div>`
    : `<p class="hint">Tous ses matchs, contre les joueurs et les bots (la séparation viendra quand ${esc(autre)} aura la dernière version de l'appli).</p>`;
  const vide = vue === "total" ? !Q.matchs : !V.matchs;
  if (vide && enCours) return `${entete}<p class="hint">Je retrouve tes matchs passés…</p>`;
  if (vide) return `${entete}<p class="hint">${vue === "humains" ? "Aucun match contre un joueur" : vue === "bots" ? "Aucun match contre un bot" : "Aucun match"} pour l'instant${autre || Q.parAdvRecupere || !connecte ? "" : " depuis le 19 novembre"}.${vue === "total" ? "" : " « Tout » montre l'ensemble des matchs."}</p>`;
  const tot = V.signes.reduce((a, b) => a + b, 0), fav = signeFavori(V.signes);
  const taux = V.lisibles ? V.devines / V.lisibles : 1 / 3, ind = indiceImprevisibilite(taux);
  const mv = V.apresVictoire ? Math.round(100 * V.memeApresVictoire / V.apresVictoire) : null;
  const md = V.apresDefaite ? Math.round(100 * V.memeApresDefaite / V.apresDefaite) : null;
  const nbMatchs = vue === "total" ? "" : `<p class="hint">${V.matchs} match${V.matchs > 1 ? "s" : ""} ${vue === "humains" ? "contre des joueurs" : "contre des bots"}${autre || Q.parAdvRecupere ? "" : ", depuis le 19 novembre"}.</p>`;
  return `${entete}${nbMatchs}<div class="bars">${barres(V.signes, tot)}</div>
      <div class="lines">
        <div class="ln"><span>Signe favori</span><span>${fav === null ? "–" : `${EMOJI[fav]} ${NOM[fav]}`}</span></div>
        ${lnInfo("Taux de réussite", (() => { const [g, t] = pointsDe(V); return pcRatio(g, t, "–"); })(), "Les points gagnés sur les points joués, sans compter les égalités. Au hasard : 50 % (autant de points gagnés que perdus).")}
        ${lnInfo("Punch", (() => { const [g, t] = pointsDe(V); return V.egalites === undefined ? "–" : pcRatio(g, t + V.egalites, "–"); })(), "Les points marqués sur tous les coups joués : ni égalité, ni point perdu. Au hasard : 33 %.")}
        ${lnInfo("Sang-froid", (() => { const c = calmeDe(Q, vue, V); return pcRatio(c[0], c[1], "–"); })(), "Après deux points perdus d'affilée, le point suivant gagné quand même (beaucoup paniquent et deviennent prévisibles). Les égalités ne comptent pas. Au hasard : 50 %. Contre les bots, compté depuis le 27 novembre 2026.")}
        <div class="ln"><span>Ouvertures gagnées</span><span>${(() => { const o = ouverturesDe(Q, vue, V) || []; return pcRatio(o[0] || 0, (o[0] || 0) + (o[1] || 0) + (o[2] || 0)); })()}</span></div>
        <div class="ln"><span>Smashs gagnants</span><span>${pcRatio(V.smashsReussis, V.smashsTentes, "Aucun pour l'instant")}</span></div>
        <div class="ln"><span>Même signe après une victoire</span><span>${mv === null ? "–" : mv + " %"}</span></div>
        <div class="ln"><span>Même signe après une défaite</span><span>${md === null ? "–" : md + " %"}</span></div>
        ${lnInfo("Ténacité", (() => { const [c, n] = vue === "total" ? ["coupsSeries", "seriesSignes"].map(k => (Q.parAdv?.humains?.[k] || 0) + (Q.parAdv?.bots?.[k] || 0)) : [V.coupsSeries || 0, V.seriesSignes || 0]; return n ? `<b>${(c / n).toFixed(1).replace(".", ",")} coup${c / n >= 2 ? "s" : ""}</b>` : "–"; })(), "Combien de coups d'affilée tu restes sur le même signe, en moyenne. Au hasard : 1,5. Le détail par signe et ta plus longue série sont dans ton dossier. Contre les bots, compté depuis le 27 novembre 2026.")}
      </div>
      <p class="hint">Un joueur parfaitement imprévisible rejoue le même signe environ 33 % du temps. Touche ⓘ pour l'explication d'une stat.</p>
      <h2 style="margin-top:16px">Indice d'imprévisibilité</h2>
      <div class="big">${ind}<span style="font-size:1rem;color:var(--muted)"> / 100</span></div>
      <div class="gauge"><div style="width:${ind}%"></div></div>
      <p class="hint">L'analyse a deviné <b>${V.devines} coups sur ${V.lisibles}</b>, soit ${(taux * 100).toFixed(1).replace(".", ",")} %. Le hasard pur donnerait 33 % : 100 sur 100, 40 % : 80, 50 % : 50, 60 % : 20.</p>`;
}
// Les ouvertures (25 novembre, exception validée par le porteur du projet) : le 1er coup de chaque set ; « Mon jeu » montre la part
// gagnée. Contre les joueurs, retrouvées dans tous les duels passés ; contre les bots, comptées depuis le 25 novembre (ouvertures.js).
// (26 novembre) le Sang-froid : [points marqués, occasions] après deux points perdus d'affilée ; « Tout » = joueurs + bots.
const calmeDe = (Q, vue, V) => (vue === "total"
  ? ["calmePoints", "calmeOccasions"].map(k => (Q.parAdv?.humains?.[k] || 0) + (Q.parAdv?.bots?.[k] || 0))
  : [V.calmePoints || 0, V.calmeOccasions || 0]);
const ouverturesDe = (Q, vue, V) => (vue === "total" ? (Q.parAdv ? ajouterOuvertures(Q.parAdv.humains?.ouvertures, Q.parAdv.bots?.ouvertures) : null) : V.ouvertures);
// Une ligne de stat qui s'explique quand on la touche (26 novembre, demande du porteur du projet : les explications entre
// parenthèses brouillaient la lecture).
const lnInfo = (titre, valeur, explication) => `<details class="ln-info"><summary class="ln"><span>${titre} <i class="ln-i" aria-hidden="true">ⓘ</i></span><span>${valeur}</span></summary><p class="ln-explication">${explication}</p></details>`;
// Le punch (26 novembre, demande du porteur du projet) : les points marqués sur tous les coups joués, égalités comprises
// (au hasard : 33 %) ; avant, le « taux de réussite » ne comptait pas les égalités (au hasard : 50 %).
// Les points gagnés et joués (sans les égalités) d'une fiche, exacts : après chaque point, on sait s'il était gagné (apresVictoire,
// apresDefaite) ; seul manque le dernier point de chaque match, toujours gagné par le vainqueur du match (20 novembre).
const pointsDe = V => [(V.apresVictoire || 0) + (V.victoires || 0), (V.apresVictoire || 0) + (V.apresDefaite || 0) + (V.matchs || 0)];
// (20 novembre, demande du porteur du projet) Le pourcentage en avant, en gras, et le rapport entre parenthèses : « 67 % (2/3) ».
const pcRatio = (a, b, vide = "–") => (b ? `<b>${Math.round((100 * a) / b)} %</b> <span class="ratio">(${a}/${b})</span>` : vide);
// Le mental et les records d'une fiche (les miens dans Ma fiche, ceux d'un autre joueur sur sa fiche).
function htmlMental(Q) {
  const pc = (a, b) => pcRatio(a, b, "Aucune pour l'instant");
  return `
      ${lnInfo("Finition", pc(Q.ballesConverties, Q.ballesObtenues), "Les balles de set et de match converties : quand on peut conclure le set ou le match, combien de fois on le fait.")}
      <div class="ln"><span>Balles adverses sauvées</span><span>${pc(Q.ballesSauvees, Q.ballesSubies)}</span></div>
      <div class="ln"><span>Sets décisifs gagnés</span><span>${pcRatio(Q.decisifsGagnes, Q.decisifsJoues, "Aucun joué")}</span></div>
      <div class="ln"><span>Matchs gagnés après avoir perdu le 1er set</span><span>${Q.remontadas}</span></div>`;
}
function htmlRecords(Q) {
  return `
      <div class="ln"><span>Plus longue série de points</span><span>${Q.meilleureSeriePoints}</span></div>
      <div class="ln"><span>Plus belle remontée dans un set</span><span>${Q.meilleureRemontee ? Q.meilleureRemontee + " points de retard" : "–"}</span></div>
      <div class="ln"><span>Meilleure série de victoires</span><span>${Q.meilleureSerieVictoires}</span></div>
      <div class="ln"><span>Plus long match</span><span>${Q.plusLongMatch} coups</span></div>
      <div class="ln"><span>Sets gagnés / perdus</span><span>${Q.sets[0]} / ${Q.sets[1]}</span></div>`;
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
  // (La Une sans les surnoms, 10 novembre ; sous la main d'un bot, son style de jeu reste)
  const moi = { nom: nomAffiche(P), surnom: sn, legende: null, genre: P.genre, av: avatarSVG(avMoi()) };
  const adv = { nom: OPP.nom, surnom: snAdv, legende: OPP.humain ? null : OPP.style, genre: OPP.genre, av: avatarSVG(avAdv()) };
  // (un hasard qui se rejoue : la même Une, titre compris, sur le téléphone de ceux qui la verront dans le fil du cercle)
  u.graine ??= Math.floor(Math.random() * 10000);
  const h = histoireDuMatch(m, S.stats, moi, adv, { etape: u.etape, finale: u.finale, citations: S.citations || [], enjeu: u.enjeu }, hasardFixe(u.graine));
  // Publier la Une dans le fil du cercle (fil-cercle.js) : après un duel contre un joueur, allé au bout.
  const duelId = S.duel && OPP.humain ? D?.duel?.id : null;
  $("unePublier").hidden = !(filVisible() && duelId); $("unePublier").disabled = false;
  $("unePublier").onclick = async () => {
    $("unePublier").disabled = true;
    try {
      const r = await publierUne(duelId, u.graine, h.citation?.id);
      $("uneMsg").textContent = !r.cercles ? "Vous n'avez aucun cercle en commun : cette Une n'apparaîtra dans aucun fil."
        : r.publiee ? `📰 Publiée dans le fil ${r.cercles > 1 ? `de vos ${r.cercles} cercles communs` : "de votre cercle"} !`
        : "La Une de ce match est déjà dans le fil de votre cercle.";
    } catch (e) { $("uneMsg").textContent = e.message; $("unePublier").disabled = false; }
  };
  await montrerUne(h, { moi, adv }, {
    sets: unSet ? m.scoresSets[0].join(" – ") : `${m.sets[0]} – ${m.sets[1]}`,
    detail: unSet ? "Set unique" : m.scoresSets.map(([a, b]) => `${a}–${b}`).join(" · "),
    numero: u.numero, date: new Date(),
  });
});
async function montrerUne(h, joueurs, score) {
  $("uneMsg").textContent = "Impression en cours…"; $("uneImg").removeAttribute("src");
  $("uneComparer").hidden = true;
  $("une").classList.add("show");
  const adresse = (location.host + location.pathname).replace(/index\.html$/, "").replace(/preview\/$/, "");
  const canvas = await dessinerUne(document.createElement("canvas"), h, joueurs, { ...score, adresse,
    date: score.date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) });
  await preparerPartage(canvas, { img: $("uneImg"), partager: $("unePartager"), enregistrer: $("uneEnregistrer"), msg: $("uneMsg"),
    fichier: "la-une.png", alt: `La Une : ${h.titre}. ${h.chapo}`, titre: MARQUE.journal });
}
// La Une d'un duel du fil du cercle, refaite à partir des coups (fil-cercle.js) : membres = Map id → carte du membre.
function uneDuFil(d, membres) {
  const par = d.une.par, ids = par === 0 ? [d.j0, d.j1] : [d.j1, d.j0];
  const [a, b] = ids.map(id => membres.get(id) || { pseudo: "?", avatar: {} });
  const joueur = x => ({ nom: x.pseudo, surnom: null, legende: null, genre: x.genre === "f" ? "f" : "m", av: avatarSVG(x.avatar || {}) });
  const moi = joueur(a), adv = joueur(b), { m, stats } = matchDuDuel(d, par), unSet = m.format.setsGagnants === 1;
  const ligne = d.une.citation ? CATALOGUE.get(d.une.citation) : null;
  const citations = ligne && /^commentat/.test(ligne.role) ? [ligne] : [];
  const h = histoireDuMatch(m, stats, moi, adv, { etape: etapeDuDuel(d), citations, enjeu: d.une.enjeu || null }, hasardFixe(d.une.graine));
  const score = {
    sets: unSet ? (m.scoresSets[0] || [0, 0]).join(" – ") : `${m.sets[0]} – ${m.sets[1]}`,
    detail: unSet ? "Set unique" : m.scoresSets.map(([x, y]) => `${x}–${y}`).join(" · "),
    numero: parseInt(String(d.id).slice(0, 4), 16) % 1000 || 1, date: new Date(d.quand),
  };
  return { h, joueurs: { moi, adv }, score };
}
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
        <h3 class="ff-titre">🖐️ Historique des mains</h3>${htmlMains(lire("mains")?.[b.id], { noms: ["Toi", b.nom], vide: "Les coups de vos prochains matchs apparaîtront ici." })}
        <p class="hint mains-note">Tes ${MAX_MAINS} derniers matchs contre ${esc(b.nom)}, coup par coup (en jaune : le point est pour toi).</p>
        ${contre.length ? `<h3 class="ff-titre">Derniers affrontements</h3><ul class="ff-derniers">${contre.map(x => `<li>${x.gagne ? "✅ Victoire" : "❌ Défaite"} · ${esc(x.detail)} · ${new Date(x.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</li>`).join("")}</ul>` : ""}`
      : `<p class="hint">Tu n'as encore jamais affronté ${esc(b.nom)}.</p><h3 class="ff-titre">📁 Son dossier</h3>${corpsDossierBot(b)}`;
  } else {
    const court = String(nom || "").replace(/#\d+$/, "");
    $("faAv").textContent = /🤖/.test(nom) ? "🤖" : "🧑";
    $("faNom").textContent = court || "Adversaire";
    $("faInfo").textContent = /🤖/.test(nom) ? "Bot en ligne" : "Joueur en ligne";
    const uid = String(id).replace(/^h:/, ""), moi = compteUI?.session()?.user?.id;
    $("faCarte").hidden = !moi || /🤖/.test(nom); $("faCarte").dataset.uid = uid;
    // Son vrai gant (avec son pseudo brodé, s'il en a un), dès que sa fiche en ligne est arrivée (4 novembre).
    if (!/🤖/.test(nom)) profilsEnLigne([uid]).then(([l]) => {
      if (l && demande === ficheDemande) $("faAv").innerHTML = avatarSVG({ ...profilDepuisLigne(l).av, brode: clePseudo(l.pseudo, l.numero) });
    }).catch(() => { /* on garde le petit bonhomme */ });
    const v = f?.v || 0, d = f?.d || 0;
    const local = v + d ? `<div class="ff-tete"><span>Toi</span><b>${v} – ${d}</b><span>${esc(court)}</span></div>` : `<p class="hint">Pas encore de duel enregistré contre ${esc(court)}.</p>`;
    if (moi) ongletsJoueur($("faCorps"), uid, court, { encore: () => demande === ficheDemande, bot: /🤖/.test(nom) });
    else $("faCorps").innerHTML = local;
  }
  $("ficheAdv").classList.add("show");
}
// La fiche d'un joueur en ligne, en 4 onglets (19 novembre, choix du porteur du projet) : 📊 Stats (ouvert d'abord : les mêmes
// que dans Ma fiche, d'après sa fiche enregistrée en ligne, et ses chiffres en ligne), 🤝 Contre toi (notre face-à-face et l'historique
// des mains de nos duels), 📁 Dossier (ses habitudes d'après ses 50 derniers matchs en ligne),
// 📜 Ses matchs (ses derniers duels, ses adversaires les plus fréquents, le coup par coup). Pour tous les joueurs en ligne (amis ou non).
// el : où l'écrire ; encore() : la fiche est-elle toujours ouverte ? ; bot : un bot des tournois en ligne (pas de fiche de jeu).
let nOngletsMains = 0;
async function ongletsJoueur(el, uid, nom, { encore = () => true, bot = false } = {}) {
  const moi = compteUI?.session()?.user?.id, n = esc(nom), x = ++nOngletsMains;
  // (le symbole centré, le mot en dessous : 19 novembre, demande du porteur du projet)
  const onglets = [["S", "📊", "Stats"], ["C", "🤝", "Contre toi"], ["D", "📁", "Dossier"], ["H", "📜", "Ses matchs"]];
  el.innerHTML = `<div class="ff-choix quatre">${onglets.map(([k, ico, t], i) => `<input type="radio" name="fo${x}" id="fo${k}${x}"${i ? "" : " checked"}><label for="fo${k}${x}"><span class="fo-ico" aria-hidden="true">${ico}</span><span>${t}</span></label>`).join("")}`
    + `${[1, 2, 3, 4].map(k => `<div class="ff-v${k}"><p class="hint">Chargement…</p></div>`).join("")}</div>`;
  const zone = k => el.querySelector(`.ff-v${k}`);
  const [ligne, duels, matchs, fiche] = await Promise.all([
    bot ? null : profilsEnLigne([uid]).then(l => l[0] || null).catch(() => null),
    moi ? duelsAvec(uid).catch(() => undefined) : null,
    dossierJoueur(uid).catch(() => null),
    ficheVisible() ? ficheJoueur(uid).catch(e => ({ erreur: e?.message || String(e) })) : null]);
  if (!encore() || !zone(1)) return;
  const Q = ligne ? profilDepuisLigne(ligne) : null, elle = Q?.genre === "f", il = elle ? "Elle" : "Il";
  // 📊 Stats
  const ficheOk = fiche && !fiche.erreur;
  const enLigne = ficheOk ? `<h3 class="ff-titre">🌐 En ligne</h3>${htmlStatsEnLigne(fiche, nom)}` : "";
  if (Q?.matchs) {
    let vue = Q.parAdvRecupere ? "humains" : "total";
    const pctV = Math.round((100 * Q.victoires) / Q.matchs);
    zone(1).innerHTML = `<div class="fa-chiffres"><div><b>${Q.matchs}</b><span>matchs</span></div><div><b>${pctV} %</b><span>victoires</span></div><div><b>${Q.serieEnCours}</b><span>série en cours</span></div></div>`
      + `<h3 class="ff-titre">📊 Son jeu</h3><div class="fa-jeu"></div>`
      + `<h3 class="ff-titre">🧠 Son mental</h3><div class="lines">${htmlMental(Q)}</div>`
      + `<h3 class="ff-titre">🏅 Ses records</h3><div class="lines">${htmlRecords(Q)}</div>${enLigne}`;
    const jeu = zone(1).querySelector(".fa-jeu");
    const dessiner = () => {
      jeu.innerHTML = htmlJeu(Q, vue, { autre: nom });
      jeu.querySelectorAll(".jeu-vue").forEach(b => b.addEventListener("click", () => { vue = b.dataset.vue; dessiner(); }));
    };
    dessiner();
  } else zone(1).innerHTML = (bot ? "" : `<p class="hint">${n} n'a pas encore de statistiques de jeu.</p>`) + (enLigne || (bot ? `<p class="hint">Pas de statistiques pour un bot.</p>` : ""));
  // 🤝 Contre toi
  if (!moi) zone(2).innerHTML = `<p class="hint">Connecte-toi pour voir vos duels.</p>`;
  else if (duels === undefined) zone(2).innerHTML = `<p class="hint">Le détail de vos duels n'a pas pu être chargé. Vérifie ta connexion.</p>`;
  else {
    const rf = statsFaceAFace(duels || [], moi);
    const contre = (duels || []).filter(d => maPlace(d, moi) !== null && d.vainqueur != null && d.coups?.length)
      .sort((a, b) => Date.parse(b.maj_le) - Date.parse(a.maj_le)).slice(0, MAX_MAINS)
      .map(d => { const p = maPlace(d, moi); try { return mainDuel(d, rejouer(d, p).match, p); } catch { return null; } }).filter(Boolean);
    zone(2).innerHTML = rf.matchs
      ? renderFaceAFace(rf, nom, { duels, uid: moi }) + `<h3 class="ff-titre">🖐️ Historique des mains</h3>${htmlMains(contre, { noms: ["Toi", nom], vide: `Pas encore de duel contre ${nom}.` })}`
        + `<p class="hint mains-note">Vos ${MAX_MAINS} derniers duels, coup par coup (en jaune : le point est pour toi).</p>`
      : `<p class="hint">Vous ne vous êtes pas encore affrontés en ligne.</p>`;
  }
  // 📁 Dossier (19 novembre : détaillé)
  const dos = matchs ? htmlDossierDetaille(dossierDetaille(matchs, { elle }), elle) : `<p class="hint">Dossier indisponible pour l'instant.</p>`;
  // (19 novembre, choix du porteur du projet : le Dossier, seulement ses habitudes ; tout ce qui raconte ses matchs dans « Ses matchs »)
  zone(3).innerHTML = dos;
  // 📜 Ses matchs : ses derniers duels, ses adversaires les plus fréquents, puis le coup par coup
  const tous = (matchs || []).slice(0, MAX_MAINS).map(mainDossier).filter(e => e.c);
  const histo = ficheOk
    ? `<h3 class="ff-titre">Ses derniers duels</h3>${htmlHistorique(fiche, nom, avatarSVG)}<h3 class="ff-titre">Ses adversaires les plus fréquents</h3>${htmlFacesAutres(fiche, nom, avatarSVG)}`
    : `<p class="hint">Historique indisponible pour l'instant.${fiche?.erreur ? ` (${esc(fiche.erreur)})` : ""}</p>`;
  zone(4).innerHTML = histo + `<h3 class="ff-titre">🖐️ Coup par coup</h3>${htmlMains(tous, { noms: [nom, "Adversaire"], gagneTexte: [`✅ ${il} gagne`, `❌ ${il} perd`], vide: "Pas encore de match en ligne terminé." })}`
    + `<p class="hint mains-note">Ses ${MAX_MAINS} derniers matchs en ligne, coup par coup (en jaune : le point est pour ${n}).</p>`;
}
// Le dossier détaillé d'un joueur en ligne (lecture-adversaire.js, dossierDetaille ; 19 novembre, demande du porteur du projet).
// toi : mon propre dossier (Ma fiche › Stats, 20 novembre) : au « tu », avec mes failles.
function htmlDossierDetaille(d, elle, { toi = false } = {}) {
  if (!d) return `<p class="hint">Pas encore assez de matchs en ligne pour établir ${toi ? "ton" : "son"} dossier.</p>`;
  const il = toi ? "tu" : elle ? "elle" : "il", s = (k, n) => `${EMOJIS[k]} ${NOMS_SIGNES[k]}${n === undefined ? "" : ` ${n} %`}`;
  const ses = toi ? "Tes" : "Ses", sa = toi ? "Ta" : "Sa", ses_ = toi ? "tes" : "ses";
  const point = { rouge: "🔴", jaune: "🟡", vert: "🟢" };
  const conseils = d.conseils.length ? `<ul class="dossier-conseils">${d.conseils.map(t => `<li>${esc(t)}</li>`).join("")}</ul>`
    : `<p class="hint">${toi ? "Aucune faille nette : ton jeu est bien varié. Bravo !" : `Aucune faille nette : son jeu est bien varié. Lis-${elle ? "la" : "le"} pendant le match.`}</p>`;
  const reflexes = d.reflexes.length ? `<div class="lines">${d.reflexes.map(x => `<div class="ln"><span>${esc(x.texte)}</span><span>${x.pct} % ${point[x.niveau]}</span></div>`).join("")}</div>`
    + `<p class="hint">Le hasard donnerait 33 % (67 % pour « change de signe après un point perdu »). 🔴 très marqué · 🟡 un peu · 🟢 comme le hasard.</p>` : "";
  const egalite = d.egalite ? `<h3 class="ff-titre">🤝 Après une égalité</h3><div class="lines">
      <div class="ln"><span>${toi ? "Tu gardes" : elle ? "Elle garde" : "Il garde"} le même signe</span><span>${d.egalite.garde} %</span></div>
      <div class="ln"><span>${toi ? "Tu joues" : elle ? "Elle joue" : "Il joue"} le plus souvent</span><span>${s(d.egalite.favori, d.egalite.favoriPct)}</span></div></div>` : "";
  const ouverture = d.ouverture ? `<h3 class="ff-titre">🎬 ${ses} ouvertures</h3>`
    + `<p class="dossier-signes dossier-ouv">${d.ouverture.repartition.map((p, k) => `<span>${EMOJIS[k]} ${p} %</span>`).join("")}</p>`
    // (25 novembre, demande du porteur du projet) le résultat de ces ouvertures, sur une ligne, centré
    + (d.ouverture.resultats ? `<p class="dossier-signes dossier-ouv">${["✅", "🟰", "❌"].map((e, k) => `<span>${e} ${d.ouverture.resultats[k]} %</span>`).join("")}</p>` : "")
    + `<p class="hint">L'ouverture, c'est le premier coup ${d.ouverture.sets ? "de chaque set" : "du match"}${d.ouverture.resultats ? " : ✅ gagnée, 🟰 égalité, ❌ perdue" : ""}. D'après ${d.ouverture.vus} ouvertures.</p>` : "";
  // (26 novembre, demande du porteur du projet) les smashs comme les ouvertures : les signes, puis le résultat, centrés
  const smash = d.smash ? `<h3 class="ff-titre">💥 ${ses} smashs</h3>`
    + `<p class="dossier-signes dossier-ouv">${d.smash.repartition.map((p, k) => `<span>${EMOJIS[k]} ${p} %</span>`).join("")}</p>`
    + `<p class="dossier-signes dossier-ouv">${["✅", "🟰", "❌"].map((e, k) => `<span>${e} ${d.smash.resultats[k]} %</span>`).join("")}</p>`
    + `<p class="hint">Le signe de chaque smash et son résultat : ✅ gagnant, 🟰 égalité, ❌ perdant. D'après ${d.smash.total} smash${d.smash.total > 1 ? "s" : ""}.</p>`
    : `<h3 class="ff-titre">💥 ${ses} smashs</h3><p class="hint">Pas de smash dans ${ses_} derniers matchs (ou pas encore enregistré).</p>`;
  // (20 novembre) Le flair et l'endurance, comme sur la carte (assez de preuves, sinon on le dit).
  const pcR = (x, n) => `<b>${Math.round((100 * x) / n)} %</b> <span class="ratio">(${x}/${n})</span>`;
  const fl = d.flair, en = d.endurance;
  const flairEnd = `<h3 class="ff-titre">🔍 ${toi ? "Ton" : "Son"} flair et ${toi ? "ta" : "sa"} résistance</h3><div class="lines">
      <div class="ln"><span>Points marqués quand l'adversaire a une habitude installée</span><span>${fl && fl.occasions >= 50 ? pcR(fl.points, fl.occasions) : `pas encore assez (${fl?.occasions || 0} sur 50)`}</span></div>
      <div class="ln"><span>Quand ${toi ? "tu ne gagnes" : elle ? "elle ne gagne" : "il ne gagne"} pas le point : égalité plutôt que point perdu</span><span>${en && en.nonGagnes >= 50 ? pcR(en.egalites, en.nonGagnes) : `pas encore assez (${en?.nonGagnes || 0} coups sur 50)`}</span></div></div>`;
  // (26 novembre, demande du porteur du projet) le sang-froid en détail : le point qui suit une série de points perdus
  const sf = d.sangFroid, sfTot = sf ? sf.reduce((a, x) => a + x[1], 0) : 0;
  const sangFroid = sf && sfTot ? `<h3 class="ff-titre">🧊 ${toi ? "Ton" : "Son"} sang-froid</h3><div class="lines">${["2 points perdus d'affilée", "3 points perdus d'affilée", "4 points perdus d'affilée ou plus"]
    .map((t, k) => `<div class="ln"><span>Après ${t}</span><span>${sf[k][1] ? pcR(sf[k][0], sf[k][1]) : "–"}</span></div>`).join("")}</div>`
    + `<p class="hint">Le point suivant gagné quand même. Les égalités ne comptent pas. Au hasard : 50 %.</p>` : "";
  // (27 novembre, demande du porteur du projet) la ténacité (d'abord appelée entêtement) : combien de coups d'affilée sur le même signe, en moyenne
  const en2 = d.entetement, virgule = x => x.toFixed(1).replace(".", ",");
  const entete = en2 ? `<h3 class="ff-titre">🪨 ${toi ? "Ta" : "Sa"} ténacité</h3><div class="lines">`
    + `<div class="ln"><span>${toi ? "Tu restes" : elle ? "Elle reste" : "Il reste"} sur le même signe, en moyenne</span><span><b>${virgule(en2.moyenne)} coup${en2.moyenne >= 2 ? "s" : ""}</b></span></div>`
    + `<div class="ln"><span>Plus longue série</span><span>${en2.record.n} × ${EMOJIS[en2.record.signe]} ${NOMS_SIGNES[en2.record.signe]}</span></div></div>`
    + `<p class="dossier-signes dossier-ouv">${en2.parSigne.map((x, k) => `<span>${EMOJIS[k]} ${x === null ? "–" : virgule(x)}</span>`).join("")}</p>`
    + `<p class="hint">Combien de coups d'affilée sur le même signe, en tout puis pour chaque signe. Au hasard : 1,5.</p>` : "";
  const f = d.forme;
  const forme = f ? `<h3 class="ff-titre">📈 ${sa} forme récente</h3><p class="hint">${Math.abs(f.ecart) >= 6
    ? `Sur ${ses_} 10 derniers matchs, ${il} ${toi ? "joues" : "joue"} ${f.ecart > 0 ? "plus" : "moins"} ${NOMS_SIGNES[f.signe] === "Ciseaux" ? "les Ciseaux" : `la ${NOMS_SIGNES[f.signe]}`} : ${f.recent[f.signe]} % contre ${f.avant[f.signe]} % avant.`
    : `Pas de changement net sur ${ses_} 10 derniers matchs.`}</p>` : "";
  return `<h3 class="ff-titre">🎯 ${toi ? "Tes failles" : `Pour ${elle ? "la" : "le"} battre`}</h3>${conseils}`
    + `<p class="dossier-source">D'après ${ses_} ${d.matchs} dernier${d.matchs > 1 ? "s" : ""} match${d.matchs > 1 ? "s" : ""} en ligne (${d.coups} coups).${toi ? " C'est ce que tes adversaires voient de toi." : ""}</p>`
    + `<p class="dossier-signes">${d.repartition.map((p, k) => `<span>${EMOJIS[k]} ${p} %</span>`).join("")}</p>`
    + `<h3 class="ff-titre">🧠 ${ses} réflexes</h3>${reflexes}${egalite}${ouverture}${smash}${flairEnd}${sangFroid}${entete}${forme}`;
}
// Mon dossier (Ma fiche › Stats ; 20 novembre, demande du porteur du projet) : avec un compte, d'après mes 50 derniers matchs en
// ligne, ce que voient mes adversaires. Chargé à l'ouverture de la carte, puis gardé jusqu'au prochain match.
let monDossier = null, monDossierPour = null;
async function renderMonDossier() {
  const uid = compteUI?.session()?.user?.id, carte = $("cDossier");
  carte.hidden = !uid || !P.matchs;
  if (!uid || !carte.open) return;
  const cle = `${uid}:${P.matchs}`;
  if (monDossierPour !== cle) {
    $("dossierBody").innerHTML = `<p class="hint">Chargement…</p>`;
    try { monDossier = await dossierJoueur(uid); monDossierPour = cle; }
    catch { $("dossierBody").innerHTML = `<p class="hint">Ton dossier n'a pas pu être chargé. Vérifie ta connexion.</p>`; return; }
  }
  $("dossierBody").innerHTML = htmlDossierDetaille(dossierDetaille(monDossier, { toi: true }), P.genre === "f", { toi: true });
}
$("cDossier").addEventListener("toggle", () => renderMonDossier());
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
    if (ouvert("serie")) c.serie = serie(resultatsDuJour(), jourParis());   // (ma série de jours, au pied de ma carte)
    const canvas = await dessinerCarte(document.createElement("canvas"), c, { nom: nomAffiche(P), numero: P.numero, drapeau: P.drapeau, av: avatarSVG(avMoi()), cadre: CADRES[P.cadre]?.couleur, cadreInterieur: CADRES[P.cadre]?.interieur, cadreFlammes: CADRES[P.cadre]?.flammes, cadreGuirlande: CADRES[P.cadre]?.guirlande });
    if (jeton !== carteJeton) return;
    $("carteRarete").textContent = texteRang(c.rang);
    const notes = notesDe(P);
    // (21 novembre) la part des bots dans les notes, tant que le joueur a moins de 20 matchs contre de vrais joueurs
    const kb = partBots(P), nh = P.parAdv?.humains?.matchs || 0;
    $("carteNotes").innerHTML = (kb > 0 && c.generale !== null ? `<li>🤖 Tes matchs contre les bots comptent encore pour ${Math.round(100 * kb)} % (${nh} match${nh > 1 ? "s" : ""} contre des joueurs sur ${HUMAINS_POUR_CARTE}).</li>` : "")
      + `<li><b>GÉNÉRAL ${c.generale ?? "–"}</b> · la moyenne de tes huit notes (${esc(texteCoefs())} ; une note pas encore calculée compte 70)</li>`
      + notes.map(n => `<li><b>${n.code} ${n.valeur}</b> · ${esc(n.nom)} : ${esc(n.aide)}</li>`).join("");
    $("carteCalcul").innerHTML = notes.map(n => `<li><b>${esc(n.nom)}</b> : ${esc(n.calcul)}</li>`).join("");   // (« Le détail du calcul »)
    await preparerPartage(canvas, { img: $("carteImg"), partager: $("cartePartager"), enregistrer: $("carteEnregistrer"), msg: $("carteMsg"),
      fichier: "ma-carte.png", alt: `Carte de joueur de ${nomAffiche(P)} : ${c.typeNiveau.toLowerCase()} ${c.niveau}, ${c.notes.map(n => `${n.nom} ${n.valeur}`).join(", ")}.`, titre: MARQUE.nom });
  }, 250);
}

// La carte d'un autre joueur (page d'un ami, derniers matchs), d'après sa fiche en ligne ; sauf s'il a choisi de la cacher.
// Renvoie un message si elle ne peut pas être montrée.
// (21 novembre) La carte d'un autre joueur, calculée : { ligne, J, c, nom }, ou un message si elle ne peut pas être montrée.
async function carteDeJoueur(uid) {
  let ligne;
  try { [ligne] = await profilsEnLigne([uid]); } catch { return "Impossible de charger sa carte. Vérifie ta connexion."; }
  if (!ligne) return "Ce joueur n'existe plus.";
  const J = profilDepuisLigne(ligne);
  if (J.carteCachee) return "🙈 Ce joueur a choisi de ne pas montrer sa carte.";
  let cl = null;
  try { cl = (await classements([uid])).get(uid) || null; } catch { /* sans niveau officiel */ }
  const nom = `${ligne.pseudo}${ligne.numero ? `#${ligne.numero}` : ""}`;
  return { ligne, J, nom, c: carteDe(J, { niveauOfficiel: cl ? cl.points : null, provisoire: !!cl && provisoire(cl.joues), surnom: surnomDe(J).texte, titre: J.matchs ? dernierTitre(J) : "" }) };
}
async function voirCarteDe(uid) {
  const x = await carteDeJoueur(uid);
  if (typeof x === "string") return x;
  const { ligne, J, nom, c } = x;
  $("uneMsg").textContent = "Impression en cours…"; $("uneImg").removeAttribute("src");
  $("uneComparer").hidden = uid === compteUI?.session()?.user?.id; $("uneComparer").dataset.uid = uid;   // (21 novembre : « ⚖️ Comparer avec moi »)
  $("une").classList.add("show");
  const canvas = await dessinerCarte(document.createElement("canvas"), c, { nom: ligne.pseudo, numero: ligne.numero, drapeau: ligne.drapeau, av: avatarSVG({ ...J.av, brode: clePseudo(ligne.pseudo, ligne.numero) }), cadre: CADRES[J.cadre]?.couleur, cadreInterieur: CADRES[J.cadre]?.interieur, cadreFlammes: CADRES[J.cadre]?.flammes, cadreGuirlande: CADRES[J.cadre]?.guirlande });
  await preparerPartage(canvas, { img: $("uneImg"), partager: $("unePartager"), enregistrer: $("uneEnregistrer"), msg: $("uneMsg"),
    fichier: "carte-de-joueur.png", alt: `Carte de joueur de ${nom} : ${c.typeNiveau.toLowerCase()} ${c.niveau}, ${c.notes.map(n => `${n.nom} ${n.valeur}`).join(", ")}.`, titre: MARQUE.nom });
  return null;
}
// Comparer ma carte (comparer-cartes.js).
const maCarteCalculee = () => carteDe(P, { niveauOfficiel: monClassement, provisoire: monClassement !== null && provisoire(mesDuelsOfficiels) });
const comparaison = installerComparaison({
  maCarte: () => { const c = maCarteCalculee(); return { nom: nomAffiche(P), notes: c.notes, typeNiveau: c.typeNiveau, niveau: c.niveau, av: avatarSVG(avMoi()) }; },
  carteEnLigne: async id => { const x = await carteDeJoueur(id); return typeof x === "string" ? x : { nom: x.ligne.pseudo, notes: x.c.notes, typeNiveau: x.c.typeNiveau, niveau: x.c.niveau,
    av: avatarSVG({ ...x.J.av, brode: clePseudo(x.ligne.pseudo, x.ligne.numero) }) }; },
  mesAmis: () => mesAmis(), chercher: t => chercherJoueurs(t), monId: () => compteUI?.session()?.user?.id,
});
$("carteComparer").addEventListener("click", () => { if (!compteUI?.session()?.user?.id) { $("carteMsg").textContent = "Connecte-toi pour comparer ta carte."; return; } comparaison.ouvrir(); });
$("uneComparer").addEventListener("click", () => { $("une").classList.remove("show"); comparaison.ouvrir($("uneComparer").dataset.uid); });

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
  $("matchEnjeu").hidden = true;   // (l'enjeu d'un défi : remis par lancerDuel)
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
// Les routines d'entrée (routines.js ; 15 novembre, idée d'un testeur) : sur l'écran de présentation, la main de chaque joueur
// fait sa routine (la mienne : choisie dans le Vestiaire ; en duel, celle de l'adversaire, d'après sa fiche ; un bot : la sienne,
// toujours la même). Le fond reste immobile, seule la main bouge. Mes « crac » et « clac » s'entendent.
let arretsRoutines = [];
function arreterRoutines() { arretsRoutines.forEach(f => f()); arretsRoutines = []; }
const LISTE_ROUTINES = Object.keys(ROUTINES);
const routineDe = g => (g === 0 ? routineChoisie(P.routine) : OPP.humain || OPP.fiche?.routine ? routineChoisie(OPP.fiche?.routine)
  : LISTE_ROUTINES[hashTexte(String(OPP.id || OPP.nom || "")) % LISTE_ROUTINES.length]);
function entreeJoueur(el, av, g) {
  if (!ouvert("routines")) { el.innerHTML = avatarSVG(av); return; }
  el.innerHTML = `<span class="fo-routine">${avatarSVG({ ...av, sansMain: true })}<span class="fo-routine-main"></span></span>`;
  const sons = g === 0 ? s => { if (/^feuille-c|^ciseaux-ferme$/.test(s)) ambiance.effet("etincelle"); } : null;
  arretsRoutines.push(jouerRoutine(el.querySelector(".fo-routine-main"), routineDe(g), s => avatarSVG({ ...av, symbole: s, sansFond: true }), { reduit: reduitMouvement(), surImage: sons }));
}
function ouvrirFaceAFace() {
  arreterIntroHymne();
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
  else if (S.contreFantome) $("foStage").textContent = "👻 Contre un fantôme";
  else if (D?.duel?.rapide) $("foStage").textContent = /🤖$/.test(OPP.nom || "") ? "Partie rapide · 🤖 contre un bot" : `Partie rapide ${D.duel.points_par_set === 11 ? "classique" : "éclair"}`;
  arreterRoutines(); entreeJoueur($("foAvMe"), avMoi(), 0); entreeJoueur($("foAvBot"), avAdv(), 1);
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
  if (adv.fantome) { montrer(dossier(adv.dossierK, { elle: false }), d => `Le fantôme joue comme lui, d'après ses ${d.matchs} derniers matchs en ligne (${d.coups} coups).`, ""); return; }
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
// Les chants de supporters personnalisés des joueurs de ce match (moi, et mon adversaire en duel) : voir chants-perso.js.
// (l'adversaire compte pour les chants personnalisés seulement entre amis : entre inconnus, chacun n'entend que les siens ; 6 novembre)
const joueursDuMatch = () => [{ pseudo: P.pseudo, numero: P.numero, genre: P.genre }, OPP?.humain && D?.ami ? { pseudo: OPP.nom, numero: OPP.numero, genre: OPP.genre } : null];
const persoDuMatch = () => chantsPerso(...joueursDuMatch());
// En duel, les deux téléphones font le même tirage pour les chants (6 novembre) : le numéro du duel et le moment, et les deux
// joueurs rangés dans le même ordre (par pseudo) des deux côtés.
const tirageDuel = cle => hashTexte(`${D?.duel?.id}:${cle}`);
const persoDuelCommun = () => chantsPersoCommuns(...joueursDuMatch());
// Le chant d'une pause du duel (p : 1 pour la première), ou null si le stade se tait : 3 fois sur 4 ; un chant personnalisé d'abord,
// puis un habituel, en alternance (comme en solo).
function chantPauseDuel(p) {
  if (tirageDuel(`pause${p}`) % 100 >= 75) return null;
  const perso = persoDuelCommun();
  if (perso.length && p % 2 === 1) return perso[(tirageDuel("debut") + p) % perso.length];
  const l = ambiance.listePause();
  return l.length ? l[tirageDuel(`pauseChant${p}`) % l.length] : null;
}
// Les commentateurs lancent le match, à voix haute (pas de speaker : sa présentation n'est ni dite ni affichée ; les surnoms
// dits par Roland ont été abandonnés le 3 novembre).
function presenterSpeaker() {
  const f = P.faceAFace[OPP.id], humain = !!OPP.humain;
  const niveauMoi = humain ? monClassement ?? 1200 : P.elo, niveauAdv = humain ? OPP.classement ?? 1200 : OPP.elo;
  // (18 novembre) David contre Goliath : le joueur bien moins classé (200 points d'écart ou plus), pour les commentateurs
  if (S.annonces) S.annonces.outsider = Math.abs(niveauMoi - niveauAdv) >= 200 ? (niveauMoi < niveauAdv ? 0 : 1) : null;
  // (18 novembre) le joueur du match qui a ses répliques personnalisées (« Le Chiromancien ») ; en duel, l'adversaire compte
  // une fois qu'on sait que c'est un ami (voir plus bas, attendreAmi)
  // (24 novembre) un bot de Noël a ses répliques, comme un joueur (noel.js) ; et pendant les fêtes, l'ambiance de Noël
  const persoCom = persoCommente(...joueursDuMatch()) || (!S.duel && OPP?.noel ? { nom: OPP.id, joueur: 1, bot: true } : null);
  if (S.annonces) S.annonces.noel = noelActif();
  // (en duel, le tirage commun aux deux téléphones pour ces répliques : le numéro du duel et le moment ; 18 novembre)
  const tirageCommun = S.duel && D?.duel?.id ? cle => tirageDuel(`com:${cle}`) / 4294967296 : null;
  if (S.annonces) { S.annonces.perso = persoCom; S.annonces.tirage = tirageCommun; }
  // (19 novembre) l'accueil des nouveaux joueurs : leurs 3 premiers matchs (1, 2 ou 3), commentés pour eux
  const accueil = (P.matchs || 0) < 3 ? (P.matchs || 0) + 1 : 0;
  if (S.annonces) S.annonces.accueil = accueil;
  // (19 novembre) mes séries de victoires et de défaites avant ce match, pour les dialogues d'après-match (« Il est intouchable ! »)
  if (S.annonces) S.annonces.serieAvant = { victoires: P.serieEnCours || 0, defaites: P.defaitesEnCours || 0 };
  const monId = `h:${compteUI.session()?.user?.id}`;
  let recents = []; try { recents = lire("speakerRecents", []) || []; } catch { /* rien */ }
  // La mémoire du dernier match contre le même adversaire (gardée pour le premier coup : la même ouverture ?).
  const audible = id => !voix.fichiers.size || voix.fichiers.has(id), genreAdv = humain ? OPP.genre : botAuFeminin(OPP) ? "f" : "m";
  S.memoire = memoireDuDernier(lire("mains")?.[OPP.id], f); S.genreAdv = genreAdv;
  const av = annoncesAvantMatch({
    moi: { surnom: surnomDe(P), genre: P.genre, etiquette: etiquetteDe(P, { advId: OPP.id, niveauMoi, niveauAdv }) },
    adv: humain ? { surnom: OPP.surnom, genre: OPP.genre, etiquette: etiquetteDe(OPP.fiche, { advId: monId, niveauMoi: niveauAdv, niveauAdv: niveauMoi }) } : { bot: OPP.id },
    tour: S.duel ? D?.tourCommente ?? null : S.tour !== null && T ? tourDe(T, S.tour).cle : null, sng: !!(S.duel && D?.sng),
    humain, genre: P.genre, jeu: S.annonces?.jeu ?? null, audible,
    memoire: commentaireMemoire(S.memoire, { genreMoi: P.genre, genreAdv, audible }),
    situations: situationsDuMatch({
      humain, dejaJoues: !!(f && f.v + f.d > 0), niveauMoi, niveauAdv, memePays: humain && OPP.drapeau === P.drapeau,
      rapide: !!(D?.duel?.rapide || S.contreBotRapide), officiel: !!(S.duel && D?.duel?.classe), setsGagnants: S.match.format.setsGagnants,
    }),
    recents, perso: persoCom, tirage: tirageCommun, accueil,
  });
  // On retient les phrases dites, pour ne pas les répéter aux prochains matchs.
  ecrire("speakerRecents", av.commentaires.map(l => l.id).concat(recents).slice(0, 80));
  clearTimeout(voixIntro);
  // Avant un grand match (quarts, demies, finale, match décisif de la carrière) : les supporters chantent pendant la présentation,
  // et Roland ou Monique en parlent d'abord (3 novembre, idée du porteur du projet).
  // Un joueur du match a ses chants personnalisés (chants-perso.js) : son chant au début de chacun de ses matchs, et Roland ou
  // Monique parlent de ses supporters.
  const perso = persoDuMatch(), fan = soutenu(...joueursDuMatch());
  const unDe = (moment, genre = "m") => {
    const l = (POOLS[moment] || []).map(it => ligneMoment(it, { genre })).filter(x => x && voix.fichiers.has(x.id));
    return l.length ? l[Math.floor(Math.random() * l.length)] : null;
  };
  if (S.annonces?.enjeu === "finale" && ambiance.hymne({ vol: 0.5, delai: 0.3, attendre: true, encore: () => faceAFaceOuvert && !S.passe })) {
    // Avant une finale : le stade chante l'hymne « Que vivent nos héros » (3 novembre, choix du porteur du projet).
    const l = unDe("avant_ambiance");
    if (l) av.commentaires.unshift(l);
  } else if (S.duel && D) {
    // En duel : le même chant au même moment sur les deux téléphones (tirage commun, 6 novembre). On attend de savoir si
    // l'adversaire est un ami (ses chants comptent alors aussi), puis : un chant personnalisé s'il y en a, sinon, 6 fois sur 10,
    // le stade du début de match (ou un chant entier avant un grand match).
    const encore = () => faceAFaceOuvert && !S.passe;
    attendreAmi().then(() => {
      if (S.annonces) S.annonces.perso = persoCommente(...joueursDuMatch());
      if (!encore()) return;
      const perso = persoDuelCommun(), f = soutenu(...joueursDuMatch());
      let id = null, ligne = null, vol = 0.5, fondu = 1.5;
      if (perso.length) { id = perso[tirageDuel("debut") % perso.length]; ligne = f && unDe("perso_supporters", f.genre); }
      else if (S.annonces?.enjeu) { const l = ambiance.listePause(); id = l.length ? l[tirageDuel("debutChant") % l.length] : null; ligne = unDe("avant_ambiance"); }
      else if (tirageDuel("debutChante") % 100 < 60) { const l = ambiance.listeDebut(); id = l.length ? l[tirageDuel("debutChant") % l.length] : null; vol = 0.4; fondu = 1.2; ligne = Math.random() < 0.5 ? unDe("avant_ambiance") : null; }
      if (id) ambiance.chanterChoisi(id, { vol, delai: 0.3, fondu, encore });
      if (ligne) voix.finiDeParler(() => { if (encore()) voix.dire([ligne]); }, 4000);
    });
  } else if (fan) {
    const l = unDe("perso_supporters", fan.genre);
    if (l) av.commentaires.unshift(l);
    // (seulement le chant qui va passer, pour qu'il soit prêt avant la fin de la présentation ; les autres au premier point)
    ambiance.prechargerPerso([ambiance.persoProchain(perso)].filter(Boolean)).then(() => { if (faceAFaceOuvert && !S.passe) ambiance.chanter({ vol: 0.5, delai: 0.3, perso }); });
  } else if (S.annonces?.enjeu && ambiance.chanter({ vol: 0.5, delai: 0.3 })) {
    const l = unDe("avant_ambiance");
    if (l) av.commentaires.unshift(l);
  } else if (Math.random() < 0.6 && ambiance.debutMatch({ vol: 0.4, delai: 0.3 })) {
    // Un match ordinaire : souvent, le stade chante ou gronde pendant la présentation (4 novembre, demande du porteur du projet) ;
    // une fois sur deux, Roland ou Monique en parlent.
    const l = Math.random() < 0.5 ? unDe("avant_ambiance") : null;
    if (l) av.commentaires.unshift(l);
  }
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
function fermerFaceAFace() { $("faceoff").classList.remove("show"); faceAFaceOuvert = false; minuteriesIntro.forEach(clearTimeout); arreterRoutines(); }
$("foGo").addEventListener("click", () => {
  if (S.duel) { try { ambiance.initialiser(); } catch { /* sans son */ } duelPret(); return; }   // on attend que l'adversaire soit prêt
  commencerSolo();
});
// Le match commence : les boutons des signes doivent être à l'écran (la page a pu rester descendue sur l'écran de fin).
function montrerSignes() { window.scrollTo(0, 0); $("moves").scrollIntoView({ block: "nearest" }); }
// (le volet passe entre la présentation et le match)
function commencerSolo() {
  if (!faceAFaceOuvert || S.depart) return;   // (un seul départ, même en touchant deux fois)
  S.depart = true; volet(commencerSoloMaintenant);
}
function commencerSoloMaintenant() {
  $("faceoff").classList.remove("show"); faceAFaceOuvert = false; arreterRoutines(); montrerSignes();
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
  $("faceoff").classList.remove("show"); faceAFaceOuvert = false; minuteriesIntro.forEach(clearTimeout); arreterRoutines();
  const carriere = !!S.carriere;
  S.tour = null; nouvelleSeance();
  if (carriere) aller("viewCarriere");
});

// ---------------------------------------------------------------- fiche joueur
function rafraichirAvatars() {
  $("miniBot").innerHTML = avatarSVG(avAdv()); $("botName").textContent = OPP.nom;
  $("miniAv").innerHTML = avatarSVG(avMoi()); $("pseudoMe").textContent = nomAffiche(P);
  majDecouverte();   // (la fiche a pu changer : le menu s'ouvre au fil des matchs)
}

// ---------------------------------------------------------------- Ma fiche : 3 sous-onglets (Ma carte, Mes stats, Palmarès)
function ongletFiche(o) {
  document.querySelectorAll("#ficheOnglets button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.o === o)));
  [["carte", "ficheCarte"], ["vestiaire", "ficheVestiaire"], ["stats", "ficheStats"], ["palmares", "fichePalmares"]].forEach(([k, id]) => { $(id).hidden = k !== o; });
  ecrire("ongletFiche", o);
}
$("ficheOnglets").addEventListener("click", e => { const b = e.target.closest("button[data-o]"); if (b) ongletFiche(b.dataset.o); });
ongletFiche(["carte", "vestiaire", "stats", "palmares"].includes(lire("ongletFiche", "carte")) ? lire("ongletFiche", "carte") : "carte");

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
// Le menu « Jouer » s'ouvre au fil des matchs ; au tout début, un écran de bienvenue propose un premier match contre Boomerang.
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
  $("mdjTitre").textContent = m.noel ? `🎅 Match du jour de Noël` : `📅 Match du jour n° ${m.numero}`;   // (le 25 décembre : le Père Noël)
  $("mdjJouer").hidden = !!r; $("mdjPartager").hidden = !r;
  const enValeur = ouvert("serie");   // (la série mise en valeur)
  const feu = !enValeur && s > 1 ? ` · 🔥 ${s} jours` : "";
  $("mdjEtat").textContent = r ? `${r.abandon ? "🏳️ Abandon" : `${r.gagne ? "✅ Victoire" : "❌ Défaite"} ${r.score.join("–")}`}${feu} · nouveau match demain`
    : `Contre ${b.nom} 🤖 · un set de 7, un seul essai${!enValeur && s ? ` · 🔥 ${s} jour${s > 1 ? "s" : ""}` : ""}`;
  // La série : le badge et le prochain palier (« encore 2 jours pour le poignet Braise »).
  const p = prochainPalier(s), badge = $("mdjSerie");
  badge.hidden = !enValeur || (!s && r);
  badge.innerHTML = !s ? `🔥 ${p.jours} jours d'affilée : ${esc(p.objet)}`
    : `<b>🔥 ${s} jour${s > 1 ? "s" : ""}</b>${p ? ` · encore ${p.jours - s} pour ${esc(p.objet)}` : " · tous les paliers atteints !"}`;
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
  compterEtapePremier(envoyerParcours, "premier_lance");   // le parcours des nouveaux (anonyme, une seule fois ; étape 59)
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
  $("routineZone").hidden = !ouvert("routines");   // (les routines d'entrée : routines.js, 15 novembre)
  $("inRoutine").innerHTML = options("routine", ROUTINES, P.routine);
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
$("inRoutine").addEventListener("change", e => { P.routine = routineChoisie(e.target.value); sauverP(); });
$("inCelebration").addEventListener("change", e => { P.celebration = celebrationValide(e.target.value); sauverP(); });
$("inCadre").addEventListener("change", e => { P.cadre = e.target.value in CADRES ? e.target.value : "aucun"; sauverP(); renderCarte(); });

function renderFiche() {
  renderSurnom(); renderCarte();
  $("vitrineFiche").innerHTML = vitrineHTML() + (C ? "" : `<p class="hint">Gagne-les dans Jouer › 🏅 Carrière solo.</p>`);
  $("pAv").innerHTML = avatarSVG(avMoi());
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
    renderMonJeu();
    renderMonDossier();
    $("mentalBody").innerHTML = htmlMental(P);
    $("recBody").innerHTML = htmlRecords(P);
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
      const qui = !nom ? "" : String(d.adv).startsWith("fantome:") ? ` contre ${esc(nom)}`   // (un fantôme : pas de fiche à ouvrir)
        : ` contre <button class="linkbtn nom-adv" data-adv="${esc(d.adv)}" data-nom="${esc(nom)}">${esc(nom)}</button>`;
      return `<div class="ln"><span>${d.gagne ? "✅ Victoire" : "❌ Défaite"} ${d.sets}${qui}</span><span style="font-weight:400;color:var(--muted)">${esc(d.detail)}</span></div>`;
    }).join("");
  }
  // Le palmarès : les trophées, famille par famille.
  const visibles = TITRES.filter(t => (!t.bientot || ouvert(t.bientot)) && (!t.noel || noelActif() || P.titres[t.id]));   // (Noël : pendant les fêtes, ou obtenu)   // (les trophées des nouveautés pas encore ouvertes : version de test seulement)
  const obtenus = visibles.filter(t => P.titres[t.id]).length;
  $("palmaresCompte").textContent = `${obtenus} trophée${obtenus > 1 ? "s" : ""} sur ${visibles.length}`;
  $("badges").innerHTML = FAMILLES.map(f => {
    const liste = visibles.filter(t => t.famille === f.id), n = liste.filter(t => P.titres[t.id]).length;
    if (!liste.length) return "";   // (une famille sans trophée visible : Noël, hors des fêtes)
    return `<h3 class="famille">${f.icone} ${f.nom} <small>${n} / ${liste.length}</small></h3>` + liste.map(t => {
      const on = !!P.titres[t.id];
      return `<div class="badge ${on ? "on" : "off"}"><div class="bn">${on ? "🏅" : "🔒"} ${t.nom}</div><div class="bd">${t.desc}</div>${texteDeblocage(t) ? `<div class="bu">Débloque ${esc(texteDeblocage(t))}</div>` : ""}</div>`;
    }).join("");
  }).join("");
  renderEditeur();
}

function renderEditeur() {
  $("avApercu").innerHTML = avatarSVG(avMoi());             // l'aperçu reste visible pendant qu'on fait défiler les choix
  const mk = (el, type, table, texte) => {
    // (les objets « bientôt » : seulement sur la version de test, sauf s'il les a déjà)
    el.innerHTML = Object.keys(table).filter(k => !(type === "gant" && k === "fiac" && !P.tenantFiac && P.av.gant !== "fiac") && !(type === "gant" && ["lutin", "renne", "neige", "debutant"].includes(k) && P.av.gant !== k)
      // (les cadeaux du calendrier de l'Avent : visibles, avec un cadenas, pendant les fêtes ; sinon seulement s'il les a)
      && !(articleDe(type, k)?.avent && !noelActif() && !possede(P, type, k) && P.av[type] !== k)).filter(k => { const b = articleDe(type, k)?.bientot || verrouDe(type, k)?.bientot || (type === "gant" && k === "dossard" ? "dossard" : null); return !b || ouvert(b) || P.av[type] === k; }).map(k => {
      const ferme = estVerrouille(P, type, k), label = texte ? table[k] : table[k][0];
      return `<button data-k="${k}" class="${texte ? "txt " : ""}${ferme ? "locked" : ""}${articleDe(type, k) ? " boutique" : ""}" aria-pressed="${choisi(type, k)}" aria-label="${label}${ferme ? ", verrouillé" : ""}" title="${label}" ${texte ? "" : `style="background:${table[k][2] || table[k][1]}"`}>${texte ? label : ""}</button>`;
    }).join("");
    el.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
      const k = b.dataset.k, t = verrouDe(type, k);
      if (estVerrouille(P, type, k)) {
        const x = articleDe(type, k);
        $("lockNote").innerHTML = gantAttendPremierMatch(P, type, k) ? "🧤 Les gants de couleur se débloquent après ton premier match. En attendant : le gant du débutant (ou la main nue) !"
          : reserveAuTenant(P, type, k) && k === "fiac" ? "🏆 Le gant en or du FIAC Club se porte seulement quand tu es tenant du titre du FIAC Club : gagne son prochain tournoi !"
          : reserveAuTenant(P, type, k) ? "🟨 Le Dossard 1 se porte seulement quand tu es tenant du titre d'un de tes cercles : gagne le prochain tournoi de ton cercle, il est à toi jusqu'au tournoi suivant !"
          : x?.avent ? `🎄 « ${esc(x.nom || (type === "gant" ? GANTS[k][0] : k))} » est à gagner dans le calendrier de l'Avent. <button class="linkbtn" data-aller="viewAvent">Voir le calendrier</button>`
          : t ? `Verrouillé. Obtiens le titre « ${esc(t.nom)} » : ${esc(t.desc.charAt(0).toLowerCase() + t.desc.slice(1))}`
          : `🛍️ « ${esc(x.nom)} » est en vente à la boutique : ${x.prix} jetons. <button class="linkbtn" data-aller="viewBoutique">Voir la boutique</button>`;
        return;
      }
      $("lockNote").textContent = "";
      // (27 novembre) les gants de Noël : « Assorti au gant » en les enfilant ; un autre poignet se met par-dessus le leur
      if (type === "poignet") { P.av.poignetSurGant = k !== "assorti"; if (k !== "assorti") P.av.poignet = k; }
      else { if (type === "gant" && GANTS_DESSINES.has(k)) P.av.poignetSurGant = false; P.av[type] = k; }   // (même s'il le portait déjà : le gant complet)
      sauverP(); renderFiche(); rafraichirAvatars();
    }));
  };
  const surGantDessine = GANTS_DESSINES.has(P.av.gant);
  const choisi = (type, k) => type !== "poignet" || !surGantDessine ? P.av[type] === k : k === "assorti" ? !P.av.poignetSurGant : !!P.av.poignetSurGant && P.av.poignet === k;
  mk($("swSymbole"), "symbole", SYMBOLES, true); mk($("swBg"), "fond", FONDS); mk($("swGlove"), "gant", GANTS); mk($("swWrist"), "poignet", surGantDessine ? { assorti: POIGNET_ASSORTI, ...POIGNETS } : POIGNETS); mk($("swMotif"), "motif", MOTIFS, true); mk($("swGantMotif"), "gantMotif", MOTIFS_GANT, true);
  if ($("swMotifCouleur")) { mk($("swMotifCouleur"), "gantMotifCouleur", MOTIF_COULEURS); $("choixMotifCouleur").hidden = P.av.gant === "nu" || GANTS_DESSINES.has(P.av.gant) || !MOTIFS_COLORABLES.has(P.av.gantMotif); }   // (seulement pour les motifs qui ont une couleur)
  $("choixPoignet").hidden = P.av.gant === "nu";   // pas de bandeau sur la main nue
  for (const [id, nue] of [["choixGantMotif", false], ["choixPeau", true], ["choixOngles", true]]) if ($(id)) $(id).hidden = (P.av.gant === "nu") !== nue;
  if ($("choixGantMotif") && GANTS_DESSINES.has(P.av.gant)) $("choixGantMotif").hidden = true;   // (un pull moche, un gant de Noël : tout dessiné)   // (la peau et le vernis : main nue ; le motif : avec un gant)
  mk($("swPeau"), "peau", PEAUX); mk($("swOngles"), "ongles", ONGLES); mk($("swBracelet"), "bracelet", BRACELETS); mk($("swBague"), "bague", BAGUES);
  if ($("swBraceletCouleur")) { mk($("swBraceletCouleur"), "braceletCouleur", MOTIF_COULEURS); $("choixBraceletCouleur").hidden = !BRACELETS_COLORABLES.has(P.av.bracelet); }   // (cuir et perles : la couleur au choix)
}
$("inFlag").innerHTML = PAYS.map(([f, n]) => `<option value="${f}">${f} ${n}</option>`).join("");
$("inFlag").value = P.drapeau;
$("inFlag").addEventListener("change", e => { P.drapeau = e.target.value; sauverP(); renderFiche(); });
$("inPseudo").value = P.pseudo;
// Le pseudo est définitif une fois le compte créé (12 novembre ; voir etatPseudo). Sans compte, il se change librement ;
// après un retrait par la modération, on en choisit un nouveau, une fois, avec le bouton « Valider ».
function majPseudo() {
  const etat = etatPseudo(P), info = $("pseudoInfo");
  $("inPseudo").disabled = etat === "fixe";
  if (etat === "fixe" || document.activeElement !== $("inPseudo")) $("inPseudo").value = P.pseudo;
  $("okPseudo").hidden = etat !== "une-fois";
  info.hidden = etat === "libre";
  info.textContent = etat === "fixe" ? "Ton pseudo est définitif : il ne se change plus. (Ton surnom, ton pays et ta main, si.)"
    : "Ton pseudo a été retiré par la modération : choisis-en un nouveau. Attention, il sera ensuite définitif.";
}
$("inPseudo").addEventListener("input", e => {
  const propre = e.target.value.replace(/[#\u0000-\u001f]/g, "");
  if (propre !== e.target.value) e.target.value = propre;
  if (etatPseudo(P) !== "libre") return;   // (retiré par la modération : seulement avec le bouton « Valider »)
  P.pseudo = propre.slice(0, 16).trim(); sauverP();
  afficherNomFiche(); rafraichirAvatars();
});
$("okPseudo").addEventListener("click", () => {
  const nom = $("inPseudo").value.slice(0, 16).trim();
  if (!pseudoValide(nom) || nom.toLowerCase() === "joueur") { alert("Choisis un pseudo de 2 à 16 caractères, sans « # »."); $("inPseudo").focus(); return; }
  if (!confirm(`Ton nouveau pseudo sera « ${nom} », pour toujours. On continue ?`)) return;
  P.pseudo = nom; sauverP(); afficherNomFiche(); rafraichirAvatars(); majPseudo();
});
majPseudo();
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
const VUES = ["viewJouer", "viewCompet", "viewCarriere", "viewRapide", "viewMatch", "viewDuel", "viewSng", "viewFreeroll", "viewBoutique", "viewAvent", "viewTournois", "socTournoi", "socTournoiNouveau", "viewCercles", "viewProfile", "viewOptions"];
const ONGLET_DE = { viewJouer: "jouer", viewCompet: "jouer", viewCarriere: "jouer", viewRapide: "jouer", viewMatch: "jouer", viewDuel: "jouer", viewSng: "jouer", viewFreeroll: "jouer", viewBoutique: "profile", viewAvent: "jouer", viewTournois: "jouer", viewCercles: "cercles", viewProfile: "profile" };
let vueCourante = "viewJouer", avantOptions = "viewJouer", parHistorique = false;
function aller(vue) {
  if (!VUES.includes(vue)) return;
  if (vue === "viewOptions" && vueCourante !== "viewOptions") avantOptions = vueCourante;
  if (vueCourante === "viewRapide" && vue !== "viewRapide") rapideUI?.quitterEcran();   // la recherche demande de rester sur l'écran
  if (vue === "viewRapide") rapideUI?.rafraichir();
  VUES.forEach(v => { $(v).hidden = v !== vue; });
  // (le bouton retour du téléphone : chaque changement d'écran est noté dans l'historique ; voir plus bas)
  if (vue !== vueCourante && !parHistorique) { try { history.pushState({ vue }, "", location.href); } catch { /* sans historique */ } }
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
  if (vue === "viewJouer") { defisUI?.rafraichir(); renderMatchDuJour(); aventUI?.ligne(); }
  if (vue === "viewAvent") aventUI?.rafraichir();   // (le calendrier de l'Avent, 24 novembre)
  if (vue === "viewFreeroll") { freerollUI?.rafraichir(); programmesUI?.rafraichir(); }
  if (vue === "viewBoutique") boutiqueUI?.rafraichir();
  window.scrollTo(0, 0);
}
// Le bouton retour du téléphone (12 novembre : des testeurs se plaignaient qu'il quittait l'appli). Chaque changement d'écran
// est noté dans l'historique du navigateur : « retour » ramène à l'écran d'avant ; depuis le premier écran, il quitte l'appli
// comme d'habitude. Pendant un match, il ne fait rien (un message dit comment quitter le match).
try { history.replaceState({ ...(history.state || {}), vue: vueCourante }, "", location.href); } catch { /* sans historique */ }
window.addEventListener("popstate", e => {
  if (document.body.classList.contains("en-match")) {
    try { history.pushState({ vue: vueCourante }, "", location.href); } catch { /* rien */ }
    const t = $("toast");
    t.textContent = S?.duel ? "⏸️ Le match continue ! Pour l'arrêter : « Abandonner le duel », sous le terrain." : "⏸️ Le match continue ! Pour l'arrêter : « Quitter le match », sous le terrain.";
    t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 4000);
    return;
  }
  parHistorique = true;
  try { aller(e.state?.vue && VUES.includes(e.state.vue) ? e.state.vue : "viewJouer"); } finally { parHistorique = false; }
});
document.querySelectorAll(".tabs button").forEach(b => b.addEventListener("click", () => aller({ jouer: "viewJouer", cercles: "viewCercles", profile: "viewProfile" }[b.dataset.v])));
document.addEventListener("click", e => { const b = e.target.closest("[data-aller]"); if (b) aller(b.dataset.aller); });
$("btnOptions").addEventListener("click", () => aller(vueCourante === "viewOptions" ? avantOptions : "viewOptions"));
// La carte « Ton avis ? » de l'écran de fin : elle ouvre « 💬 Ton avis sur HandSlam » dans les Options.
$("avisCarteOui").addEventListener("click", () => {
  $("avisCarte").hidden = true; aller("viewOptions");
  $("cAvis").open = true; setTimeout(() => $("cAvis").scrollIntoView({ block: "start", behavior: "smooth" }), 50);
});
$("avisCarteNon").addEventListener("click", () => { $("avisCarte").hidden = true; });
$("optionsRetour").addEventListener("click", () => aller(avantOptions));

// Les alertes en haut du menu « Jouer » (et la pastille de l'onglet).
const alertes = { duels: { recus: 0, enCours: 0, rdv: 0, rdvNouveaux: 0 }, tournois: [], invitations: [], sng: null, freeroll: null, programme: null };
function signaler(cle, valeur) { alertes[cle] = valeur; renderAlertes(); }
function renderAlertes() {
  const a = alertes, carte = (attr, icone, titre, texte) => `<button class="hub alerte" ${attr}><span class="hub-i">${icone}</span><span><b>${titre}</b><small>${texte}</small></span></button>`;
  $("hubAlertes").innerHTML = [
    a.duels.enCours ? carte('data-aller="viewDuel"', "▶️", "Duel en cours", "Touche pour le reprendre") : "",
    a.duels.rdv ? carte('data-aller="viewDuel"', "✅", `${a.duels.rdv > 1 ? `${a.duels.rdv} défis acceptés` : "Défi accepté"} : à jouer`, "Touche « Rejoindre » : le match démarre quand vous êtes là tous les deux") : "",
    a.duels.recus ? carte('data-aller="viewDuel"', "📨", `${a.duels.recus} défi${a.duels.recus > 1 ? "s" : ""} reçu${a.duels.recus > 1 ? "s" : ""}`, "Accepte ou refuse") : "",
    ...a.tournois.map(t => carte(`data-tournoi="${t.id}"`, "🏆", "Ton match de tournoi t'attend", esc(t.nom))),
    // (étape 76 : une invitation à un tournoi de cercle ; la page du tournoi propose « M'inscrire » et « Non merci »)
    ...a.invitations.map(i => carte(`data-tournoi="${esc(i.tournoi)}"`, "📨", `Invitation : ${esc(i.nom)}`, `${esc(i.de?.pseudo || "L'organisateur")} t'invite · cercle ${esc(i.cercle_nom || "")}`)),
    a.freeroll ? carte('data-aller="viewFreeroll"', "🌙", a.freeroll.phase === "en_cours" ? "Le freeroll est en cours" : "Le freeroll commence à 20 h", "Garde l'appli ouverte : ton match se lance tout seul") : "",
    a.programme ? carte('data-aller="viewFreeroll"', "🗓️", a.programme.phase === "en_cours" ? `${esc(a.programme.nom)} est en cours` : `${esc(a.programme.nom)} commence bientôt`, "Garde l'appli ouverte : ton match se lance tout seul") : "",
    a.sng ? carte('data-aller="viewSng"', "⚡", a.sng.phase === "inscriptions" ? "Tu es en salle de Sit & Go" : "Ton Sit & Go est en cours", "Garde l'appli ouverte") : "",
  ].join("");
  // (la carte « Défi accepté » reste, sans pastille une fois vu ; 21 novembre, demande du porteur du projet : un match de tournoi
  // à jouer garde sa carte « Ton match de tournoi t'attend », mais ne met plus de pastille sur l'onglet Jouer)
  const n = a.duels.recus + (a.duels.rdvNouveaux || 0) + a.invitations.length;
  $("pastilleJouer").hidden = !n; $("pastilleJouer").textContent = n;
}
$("hubAlertes").addEventListener("click", e => { const b = e.target.closest("[data-tournoi]"); if (b) cerclesUI.ouvrirTournoi(b.dataset.tournoi); });

// Pendant un match, l'écran de jeu prend toute la place (pas d'onglets).
function majModeMatch() {
  const enMatch = !!(S && S.enJeu && (!S.match.termine || S.pauseFin));
  document.body.classList.toggle("en-match", enMatch);
  document.body.classList.toggle("match-noel", enMatch && !S.duel && !!OPP?.noel);   // (un match contre un bot de Noël : le court rouge, le sapin, les flocons)
  ambiance.fond(enMatch);                                  // le murmure du public, pendant tout le match
  if (!enMatch) majCoeur();                                // (le cœur s'arrête quand on quitte le match)
  $("quitterSoloZone").hidden = !enMatch || !!S.duel;
}
$("quitterSolo").addEventListener("click", () => {
  if (!confirm("Quitter le match ? Il ne sera pas compté.")) return;
  const carriere = !!S.carriere;
  nouvelleSeance();
  if (carriere) aller("viewCarriere");
});

// ---------------------------------------------------------------- choix de l'adversaire
// (24 novembre au soir, choix du porteur du projet) en haut, les 3 derniers bots affrontés ; dessous, les bots par catégorie
// (Débutants, Confirmés, Experts ; pendant les fêtes, les bots de Noël), repliées ; ceux de la carrière pas encore battus,
// grisés avec un cadenas.
const categoriesOuvertes = new Set();
function renderAdversaires() {
  const ff = P.faceAFace || {};
  const bouton = b => {
    const libre = botDisponible(b, ff);
    return `<button class="opp${b.noel ? " opp-noel" : ""}${libre ? "" : " verrou"}" data-id="${b.id}" aria-pressed="${b.id === amicalId}"${libre ? "" : ` aria-label="${b.nom}, à débloquer en carrière"`}><span class="oa">${avatarSVG(b.av)}</span><span class="on">${libre ? "" : "🔒 "}${b.nom}</span><span class="ol">Niveau ${b.elo}</span></button>`;
  };
  // (le bot choisi y est toujours, en premier s'il n'a pas été affronté récemment : on le voit même catégories repliées)
  const choisi = botParId(amicalId), recents = derniersBots(P.derniers, ff);
  const derniers = (choisi && !recents.includes(choisi) ? [choisi, ...recents] : recents).slice(0, 3);
  const tous = [...TOUS_LES_BOTS].sort((x, y) => x.elo - y.elo);
  const categorie = (id, titre, liste, compte) => `<details class="opps-cat" data-cat="${id}"${categoriesOuvertes.has(id) ? " open" : ""}><summary>${titre}<small>${compte}</small></summary><div class="opps">${liste.map(bouton).join("")}</div></details>`;
  $("opps").innerHTML = (derniers.length ? `<p class="opps-titre">Ton adversaire et tes derniers</p><div class="opps">${derniers.map(bouton).join("")}</div>` : "")
    + CATEGORIES_BOTS.map(c => { const l = tous.filter(b => categorieDe(b) === c), n = l.filter(b => botDisponible(b, ff)).length;
      return categorie(c.id, `${c.icone} ${c.nom}`, l, `${n} / ${l.length} débloqués`); }).join("")
    + (noelActif() ? categorie("noel", "🎄 Les bots de Noël", BOTS_NOEL, `${BOTS_NOEL.length} bots`) : "");
  $("opps").querySelectorAll("details").forEach(d => d.addEventListener("toggle", () => { d.open ? categoriesOuvertes.add(d.dataset.cat) : categoriesOuvertes.delete(d.dataset.cat); }));
  $("opps").querySelectorAll("button.opp").forEach(x => x.addEventListener("click", () => {
    const b = botParId(x.dataset.id);
    if (!botDisponible(b, P.faceAFace || {})) { $("oppDesc").textContent = `🔒 ${b.nom} (niveau ${b.elo}) : bats-le en carrière pour le débloquer à l'entraînement.`; return; }
    amicalId = b.id; ecrire("adversaire", amicalId);
    OPP = b; renderAdversaires(); rafraichirAvatars();
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
  // (Les 2 finalistes montent : la demi-finale fait monter, sauf à l'Élite.)
  const amateur = deuxMontent(C) && k < CIRCUITS.length - 1;
  if (C.phase === "playoffs") return { sur: `Playoffs · ${CIRCUITS[k]}`, titre: { quarts: "Quart de finale", demis: "Demi-finale", finale: "Finale" }[pm.cle],
    sous: { quarts: "Gagne, et tu es en demi-finale.", demis: amateur ? `Gagne, et tu montes en ${CIRCUITS[k + 1]} !` : "Gagne, et tu joues la finale.",
      finale: amateur ? `Tu es déjà promu${P.genre === "f" ? "e" : ""} : gagne, et la coupe est à toi !` : monte }[pm.cle], voix: `speaker_${pm.cle}_01` };
  if (C.phase === "petite") return { sur: `Playoffs · ${CIRCUITS[k]}`, titre: "Match pour la 3e place", sous: `Gagne, et tu joues le barrage d'accession pour monter en ${CIRCUITS[k + 1]}.` };
  if (C.phase === "maintien7") return { sur: `Maintien · ${CIRCUITS[k]}`, titre: "Match pour le maintien", sous: `Gagne, et tu restes en ${CIRCUITS[k]}. Perds, et c'est le barrage.` };
  if (C.phase === "maintien") return pm.cle === "finale"
    ? { sur: `Maintien · ${CIRCUITS[k]}`, titre: "Match pour le maintien", sous: `Perds, et tu descends en ${CIRCUITS[k - 1]}.` }
    : { sur: `Maintien · ${CIRCUITS[k]}`, titre: "Demi-finale du maintien", sous: `Gagne, et tu restes en ${CIRCUITS[k]}.` };
  if (C.phase === "barrage") return C.barrage.haut ? { sur: "Barrage d'accession", titre: "Barrage", sous: `Gagne, et tu montes en ${CIRCUITS[k + 1]} !` }
    : { sur: "Barrage du maintien", titre: "Barrage", sous: `Gagne, et tu restes en ${CIRCUITS[k]}.` };
  return null;
}
// Après une défaite dans un match décisif : ce qu'elle veut dire (ou null pour un match de championnat ou un petit tour de coupe).
function eliminationCarriere(phaseAvant) {
  const k = C.ou, tour = S.carriere.etape.replace(/^Coupe Monique-Latour · /, ""), e = P.genre === "f" ? "e" : "";   // (Éliminée, Reléguée)
  if (S.carriere.coupe) return S.carriere.cle ? { sur: "Coupe Monique-Latour", titre: `Éliminé${e}`, sous: `Ton parcours en coupe s'arrête en ${tour.toLowerCase()}.`, coupe: coupeMLSVG(false) } : null;
  if (phaseAvant === "saison") return C.bilan?.mouvement === -1 ? { sur: CIRCUITS[k], titre: `Relégué${e}`, sous: `${C.place}e ${C.poules ? "de ta poule" : "de la saison"} : direction le ${CIRCUITS[k - 1]}. On remonte plus fort !` } : null;
  if (phaseAvant === "playoffs") {
    if (C.bilan?.mouvement === 1) return null;   // (finaliste : promu quand même, la cérémonie le dit)
    if (C.phase === "petite") return { sur: `Playoffs · ${CIRCUITS[k]}`, titre: "Demi-finale perdue", sous: `Il reste une chance : le match pour la 3e place, puis un barrage pour monter en ${CIRCUITS[k + 1]} !`, coupe: coupeSVG(k, false) };
    if (C.phase === "barrage") return { sur: `Playoffs · ${CIRCUITS[k]}`, titre: "Finale perdue", sous: `Il reste une chance : le barrage, pour monter en ${CIRCUITS[k + 1]} !`, coupe: coupeSVG(k, false) };
    return { sur: `Playoffs · ${CIRCUITS[k]}`, titre: `Éliminé${e}`, sous: `Défaite en ${tour.toLowerCase()}. ${k === CIRCUITS.length - 1 && /^Finale/.test(tour) ? `Vice-champion${e ? "ne" : ""} de l'Élite.` : `Tu restes en ${CIRCUITS[k]} : rendez-vous la saison prochaine !`}`, coupe: coupeSVG(k, false) };
  }
  if (phaseAvant === "maintien") return C.bilan?.mouvement === -1 ? { sur: `Maintien · ${CIRCUITS[k]}`, titre: `Relégué${e}`, sous: `Direction le ${CIRCUITS[k - 1]}. On remonte plus fort !` }
    : C.phase === "maintien" ? { sur: `Maintien · ${CIRCUITS[k]}`, titre: "Demi-finale perdue", sous: "Encore un match pour sauver ta place." } : null;
  if (phaseAvant === "petite") return { sur: "Match pour la 3e place", titre: "Match perdu", sous: `Tu restes en ${CIRCUITS[k]}. Ce n'est que partie remise !` };
  if (phaseAvant === "maintien7") return { sur: `Maintien · ${CIRCUITS[k]}`, titre: "Match perdu", sous: "Il reste une chance : le barrage, pour sauver ta place." };
  if (phaseAvant === "barrage") return C.barrage?.haut ? { sur: "Barrage d'accession", titre: "Barrage perdu", sous: `Tu restes en ${CIRCUITS[k]}. Ce n'est que partie remise !` }
    : { sur: "Barrage du maintien", titre: `Relégué${e}`, sous: `Direction le ${CIRCUITS[k - 1]}. On remonte plus fort !` };
  return null;
}
// L'écran en grand : l'enjeu (avant le match) ou la cérémonie de la coupe (après un titre). apres : à la fermeture.
function ouvrirCeremonie({ sur = "", titre, sous = "", coupe = "", voix: ligne = null, enjeu = false, triste = false }, apres = () => {}) {
  const ov = $("ceremonie"), vite = reduitMouvement();
  ov.classList.toggle("enjeu", enjeu); ov.classList.toggle("triste", triste);
  $("cerSur").textContent = sur; $("cerTitre").textContent = titre; $("cerSous").textContent = sous;
  // Un titre gagné : les deux mains du champion (son gant) soulèvent la coupe, et la brandissent (3 novembre, idée du porteur du projet).
  const champion = coupe && !enjeu && !triste, poing = () => avatarSVG({ ...avMoi(), symbole: "pierre", sansFond: true });
  $("cerCoupe").innerHTML = champion ? `<div class="cer-brandir"><span class="cer-main g">${poing()}</span>${coupe}<span class="cer-main d">${poing()}</span></div>` : coupe;
  $("cerCoupe").classList.toggle("brandie", !!champion);
  $("cerOk").textContent = enjeu ? "Au match !" : "Continuer";
  const hasard = (a, b) => a + Math.random() * (b - a), couleurs = ["#FFD34D", "#F4C542", "#FFFFFF", "#E8574A", "#4DA3FF"];
  $("cerConfettis").innerHTML = enjeu || triste || vite ? "" : Array.from({ length: 80 }, (_, i) =>
    `<i style="left:${hasard(0, 100).toFixed(1)}%;background:${couleurs[i % couleurs.length]};--d:${hasard(2.2, 3.6).toFixed(2)}s;--r:${hasard(0, 1.2).toFixed(2)}s;--x:${Math.round(hasard(-80, 80))}px;--t:${Math.round(hasard(360, 900))}deg"></i>`).join("");
  ov.hidden = false; $("cerOk").focus();
  // (la cérémonie du champion : l'ovation, puis le stade chante l'hymne « Que vivent nos héros », jusqu'à « Continuer »)
  try { ambiance.initialiser(); if (triste) ambiance.reagir("ohDecu"); else if (!enjeu) { ambiance.public("ovation", 0.85); ambiance.hymne({ vol: 0.55, delai: 2.5, attendre: true }); } } catch { /* sans son */ }
  if (ligne && CATALOGUE.has(ligne)) setTimeout(() => { if (!ov.hidden) voix.dire([CATALOGUE.get(ligne)]); }, 400);
  let fini = false;
  const fermer = () => { if (fini) return; fini = true; ov.hidden = true; $("cerConfettis").innerHTML = ""; if (!enjeu && !triste) ambiance.arreterChant(); apres(); };
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
// Dans la carrière, le nom d'un bot se touche : sa fiche (notre face-à-face, son dossier, l'historique des mains).
const nomTouchable = (id, nom) => `<button class="linkbtn nom-adv" data-adv="${esc(id)}" data-nom="${esc(nom)}">${esc(nom)}</button>`;
["carClassement", "carCalendrier"].forEach(c => $(c).addEventListener("click", e => {
  const x = e.target.closest(".nom-adv"); if (x) ouvrirFicheAdv(x.dataset.adv, x.dataset.nom, { jouer: false });
}));
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
  const place = C.place ? `${C.place}${C.place === 1 ? "re" : "e"} ${C.poules ? "de ta poule" : "de la saison"}. ` : "";
  const sets = pm?.format.setsGagnants === 1 ? `Un set de ${pm.format.pointsParSet} points.` : "2 sets gagnants.";
  $("carMsg").textContent = pm?.coupe ? `${pm.etape} contre ${adv.nom} (niveau ${adv.elo}, ${circuitDe(adv.id)}). ${sets}`
    : C.phase === "fin" ? texteBilan(C)
    : C.phase === "saison" ? `${pm.etape} : contre ${adv.nom} (niveau ${adv.elo}), ${adv.style.charAt(0).toLowerCase()}${adv.style.slice(1)}. ${sets}`
    : C.phase === "barrage" ? (C.barrage.haut ? `${C.petite ? "3e place gagnée" : "Finaliste des playoffs"} ! Barrage d'accession contre ${adv.nom}, qui joue son maintien en ${CIRCUITS[k + 1]} : gagne, et tu montes. 2 sets gagnants.`
      : `Barrage du maintien contre ${adv.nom}, ${C.duel || C.formule >= FORMULE ? "3e des playoffs" : "finaliste"} du ${CIRCUITS[k - 1]} : gagne, et tu restes en ${CIRCUITS[k]}. 2 sets gagnants.`)
    : C.phase === "petite" ? `Demi-finale perdue : match pour la 3e place contre ${adv.nom} (niveau ${adv.elo}). Gagne, et tu joues le barrage d'accession pour monter. 2 sets gagnants.`
    : C.phase === "maintien7" ? `${place}Match pour le maintien contre ${adv.nom} (niveau ${adv.elo}), 7e de la poule B : gagne, et tu restes. Perds, et c'est le barrage. 2 sets gagnants.`
    : `${place}${pm.etape} contre ${adv.nom} (niveau ${adv.elo}). 2 sets gagnants.`;
  // En bref : ma place et ma coupe.
  const maPlace = C.phase === "saison" && C.journee > 0 ? classementCarriere(C).findIndex(l => l.id === "moi") + 1 : null, K0 = C.coupe;
  $("carResume").textContent = [maPlace && `📊 ${maPlace}${maPlace === 1 ? "er" : "e"} ${C.poules ? "de ta poule" : "du classement"}`,
    K0 && `🏆 Coupe : ${K0.vainqueur === "moi" ? "vainqueur !" : K0.elimine !== null ? "éliminé" : `en ${TOURS_COUPE[K0.tour].nom.toLowerCase()}`}`].filter(Boolean).join(" · ");
  $("carJouer").textContent = pm?.coupe ? `Jouer : ${TOURS_COUPE[C.coupe.tour].singulier.toLowerCase()} de la coupe` : C.phase === "fin" ? `Commencer la saison ${C.saison + 1}` : C.phase === "saison" ? `Jouer la journée ${C.journee + 1}` : `Jouer : ${pm.etape.charAt(0).toLowerCase()}${pm.etape.slice(1)}`;
  // Le tableau des playoffs (ou du maintien), et le barrage.
  let h = "";
  if (C.tableau) C.tableau.tours.forEach((R, i) => {
    h += `<div class="rnd">${NOMS_TOURS[C.tableau.type][i].nom}</div>` + R.map(m => ligneMatch(m)).join("");
    // Les playoffs à 6 : les 1er et 2e attendent en demi-finales.
    if (i === 0 && C.tableau.exempts) h += `<p class="car-legende">Directement en demi-finales : ${C.tableau.exempts.map(id => esc(infoJoueur(id).nom)).join(" et ")}.</p>`;
  });
  if (C.petite) h += `<div class="rnd">Match pour la 3e place</div>` + ligneMatch({ a: "moi", b: C.petite.adv, v: C.petite.v });
  if (C.duel) h += `<div class="rnd">Match pour le maintien (les 7es)</div>` + ligneMatch({ a: "moi", b: C.duel.adv, v: C.duel.v });
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
    return ligneCal(m.v ? "jouee" : prochain ? "prochain" : "", adv, `🏆 ${titre}<br><span class="car-cal-adv">${nomTouchable(adv.id, adv.nom)} <small>(${adv.elo})</small></span>`, etat, true);
  };
  $("carCalendrier").innerHTML = `<div class="car-calendrier"><ol>`
    + C.journees.map((j, i) => {
      const adv = j.find(p => p.includes("moi")).find(x => x !== "moi"), b = botParId(adv), r = C.resultats.find(x => x.a === "moi" && x.b === adv);
      const prochain = i === C.journee && C.phase === "saison" && !pm?.coupe;
      const etat = r ? resultat(r.v === "moi", r.scores.map(x => x.join("–")).join(", ")) : prochain ? "👉 Prochain match" : "À jouer";
      return ligneCal(r ? "jouee" : prochain ? "prochain" : "", b, `J${i + 1} · ${nomTouchable(b.id, b.nom)} <small>(${b.elo})</small>`, etat)
        + (C.coupe ? TOURS_COUPE.map((T, t) => (coupeApres(C, t) === i + 1 ? ligneCoupe(t) : "")).join("") : "");
    }).join("") + `</ol></div>`;
  // Le classement de la saison (en Amateur : les 2 poules).
  const nouvelle = C.formule >= FORMULE, zones = k > 0, bas = C.poules ? 6 : nouvelle ? BARRAGISTE - 1 : 8, qualifies = C.poules ? 4 : nouvelle ? QUALIFIES : 8, nbJ = C.journees.length;
  const tableau = (lignes, titre) => (titre ? `<p class="car-poule">${titre}</p>` : "")
    + `<table class="car-classement"><thead><tr><th>#</th><th>Joueur</th><th>J</th><th>V</th><th>D</th><th>+/−</th><th>Pts</th></tr></thead><tbody>`
    + lignes.map((l, i) => {
      const A = infoJoueur(l.id), d = l.pm - l.pc, cls = [l.id === "moi" ? "moi" : "", i < qualifies ? "zone-po" : zones && i >= bas ? "zone-bas" : ""].join(" ").trim();
      return `<tr class="${cls}"><td>${i + 1}</td><td><span class="mini">${avatarSVG(A.av)}</span>${l.id === "moi" ? `<span>${esc(A.nom)}</span>` : nomTouchable(l.id, A.nom)}</td><td>${l.j}</td><td>${l.v}</td><td>${l.d}</td><td>${d > 0 ? "+" : ""}${d}</td><td>${l.pts}</td></tr>`;
    }).join("") + `</tbody></table>`;
  $("carClassement").innerHTML = `<div class="rnd">Classement · ${C.journee} journée${C.journee > 1 ? "s" : ""} sur ${nbJ}</div>`
    + (C.poules ? tableau(classementCarriere(C, 0), "Ma poule (A)") + tableau(classementCarriere(C, 1), "Poule B")
      + `<p class="car-legende">🟩 Les 4 premiers de chaque poule : quarts de finale croisés (1er A – 4e B…). ${k === 0
        ? "Les 2 finalistes montent ; le 3e (match pour la 3e place) joue un barrage d'accession contre un joueur du Future."
        : `${deuxMontent(C) ? "Les 2 finalistes montent ; le 3e joue un barrage d'accession." : "Le vainqueur monte ; le finaliste joue un barrage d'accession."} 🟥 Les 7es se rencontrent (le perdant joue un barrage du maintien) ; les 8es descendent.`}</p>`
      : tableau(classementCarriere(C)) + `<p class="car-legende">${!nouvelle ? "🟩 Places 1 à 8 : playoffs, le vainqueur monte. 🟥 Places 9 à 12 : le maintien."
        : `🟩 Places 1 à 6 : playoffs (les 2 premiers directement en demi-finales, les 3e à 6e en quarts)${k < CIRCUITS.length - 1 ? " ; les 2 finalistes montent, le 3e joue un barrage d'accession" : " ; le vainqueur est champion de l'Élite"}. 🟥 10e : barrage du maintien ; 11e et 12e : descente.`}</p>`);
  $("carVitrine").innerHTML = `<div class="rnd">Ma vitrine</div>${vitrineHTML()}`;
  // Le palmarès.
  if (C.palmares.length) {
    const b = bilanCarriere(C);
    $("carPalmares").innerHTML = `<div class="rnd">Mon palmarès</div><p class="hint" style="margin:0">Meilleur circuit atteint : ${CIRCUITS[b.meilleur]}${b.titres ? ` · 🏆 ${b.titres} titre${b.titres > 1 ? "s" : ""} de champion de l'Élite` : ""}</p>`
      + (coupesML(C).length ? `<p class="hint" style="margin:4px 0 0">🏆 Coupe Monique-Latour : saison${coupesML(C).length > 1 ? "s" : ""} ${coupesML(C).join(", ")}</p>` : "")
      // (7 novembre, demande du porteur du projet : un tableau simple, une ligne par saison)
      + `<table class="car-palmares-tab"><thead><tr><th>Saison</th><th>Circuit</th><th>Class.</th><th>Playoffs</th><th>Coupe</th></tr></thead><tbody>`
      + [...C.palmares].reverse().map(p => `<tr${resumePalmares(p).includes("Champion") ? ' class="titre"' : ""}><td>${p.saison}</td><td>${CIRCUITS[p.circuit].replace("Circuit ", "")}</td>`
        + `<td>${p.place ? `${p.place}${p.place === 1 ? "er" : "e"}` : "–"}</td><td>${resumePalmares(p)}${p.mouvement === 1 ? " ⬆️" : p.mouvement === -1 ? " ⬇️" : ""}</td><td>${resumeCoupe(p)}</td></tr>`).join("")
      + `</tbody></table><p class="hint" style="margin:6px 0 0">Class. : le classement de la saison régulière (dans ta poule en Amateur et en Future). ⬆️ promu, ⬇️ relégué. Coupe : le tour atteint en Coupe Monique-Latour.</p>`
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
// Un appui long (près d'une demi-seconde) sur un signe : un smash, s'il en reste un dans ce set (le bouton grossit quand il est prêt).
const APPUI_LONG_MS = 380;
const smashPossible = () => !!(S && S.enJeu && !S.occupe && S.match && peutSmasher(S.match, 0));
// (sur un vrai téléphone, le « clic » ne suit pas toujours un appui long, et un doigt qui bouge un peu faisait croire à un
// défilement : le coup smashé part donc dès qu'on lâche, ou si le téléphone annule le geste une fois le smash prêt)
document.querySelectorAll("#moves button").forEach(b => {
  let minuterie = 0, long = false, sansClic = false;
  const smasher = () => { long = false; sansClic = true; b.classList.remove("charge"); jouer(+b.dataset.m, false, true); };
  b.addEventListener("pointerdown", () => {
    clearTimeout(minuterie); long = false; sansClic = false;
    if (b.disabled || !smashPossible()) return;
    minuterie = setTimeout(() => { long = true; b.classList.add("charge"); try { navigator.vibrate?.(20); } catch { /* rien */ } }, APPUI_LONG_MS);
  });
  b.addEventListener("pointerup", () => { clearTimeout(minuterie); if (long) smasher(); });
  b.addEventListener("pointercancel", () => { clearTimeout(minuterie); if (long) smasher(); else b.classList.remove("charge"); });
  b.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") { clearTimeout(minuterie); long = false; b.classList.remove("charge"); } });
  b.addEventListener("contextmenu", e => e.preventDefault());   // (Android : pas de menu sur l'appui long)
  b.addEventListener("click", () => { if (sansClic) { sansClic = false; return; } jouer(+b.dataset.m); });
});
document.addEventListener("keydown", e => {
  if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  const k = { p: 0, c: 1, f: 2 }[e.key.toLowerCase()];
  if (k !== undefined) jouer(k);
});

// ---------------------------------------------------------------- application installable
$("version").textContent = `Version ${VERSION}`;
// « Ton avis sur HandSlam » (Options) : une note de 1 à 5 et/ou un petit mot, avec ou sans compte (étape 63).
{
  let note = null;
  $("avisNotes")?.addEventListener("click", e => {
    const b = e.target.closest("[data-note]"); if (!b) return;
    note = note === +b.dataset.note ? null : +b.dataset.note;
    $("avisNotes").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(+x.dataset.note === note)));
  });
  $("avisEnvoyer")?.addEventListener("click", async () => {
    const texte = $("avisTexte").value.trim();
    if (!note && !texte) { $("avisMsg").textContent = "Choisis une note ou écris un petit mot."; return; }
    $("avisEnvoyer").disabled = true; $("avisMsg").textContent = "Envoi…";
    try {
      await donnerAvis({ note, texte, pseudo: P.pseudo || "", origine: origineIci(), version: VERSION });
      $("avisMsg").textContent = "Merci ! Ton avis est bien arrivé. 🙏"; ecrire("avisDonne", Date.now());
      $("avisTexte").value = ""; note = null; $("avisNotes").querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", "false"));
    } catch (err) { $("avisMsg").textContent = /donner_avis|function/i.test(err.message) ? "L'envoi des avis ouvre bientôt." : err.message; }
    $("avisEnvoyer").disabled = false;
  });
}
setTimeout(() => { const d = $("demarrage"); if (d && !d.classList.contains("titre")) d.remove(); }, 3600);   // l'écran de démarrage a fini de s'effacer (sauf l'écran titre, qui attend le toucher)
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
  rafraichir: () => { afficherNomFiche(); rafraichirAvatars(); majPseudo(); },
  ouvrirFiche: () => aller("viewProfile"),
  remplacerP: fiche => {
    P = normaliserProfil(fiche); sauverLocal(); C = P.carriere || null;
    if (assurerSurnom()) sauverP();
    if (vueCourante === "viewCarriere") renderCarriere();
    $("inPseudo").value = P.pseudo; $("inFlag").value = P.drapeau; majPseudo();
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
  // L'enjeu du défi, en bandeau pendant tout le match.
  $("matchEnjeu").hidden = !duel.enjeu; $("matchEnjeu").textContent = duel.enjeu ? `🎯 Enjeu : ${duel.enjeu}` : "";
  rafraichirAvatars(); render();
  ouvrirOnglet("match");
  if (duel.tournoi_id) reperesTournoi(duel);
  D.arret = serveur.ecouter("duel", `id=eq.${duel.id}`, majDuel, ok => { if (D) D.enDirect = ok; });
  // (24 novembre, avant l'ouverture au public ; décision du 13 novembre) Un signe de vie toutes les 3 secondes au lieu de chaque
  // seconde : l'écoute en direct apporte les coups de l'adversaire tout de suite, et un signe de vie part aussi pile à la fin de
  // chaque délai (voir prevoirEcheance), pour que le serveur l'applique sans attendre.
  // (27 novembre, un testeur trouve que les duels rament) Tant que l'écoute en direct ne marche pas (pas encore branchée, coupée,
  // bloquée par le réseau), un signe de vie chaque seconde : sinon, le coup de l'adversaire pouvait mettre jusqu'à 3 secondes.
  let tic = 0;
  D.boucle = setInterval(() => { tic++; if (!D?.enDirect || tic % (BATTEMENT_MS / 1000) === 0) battement(); }, 1000);
  verifierAmi();
  majDuel(duel); battement();
}

// Match de tournoi en ligne : quel tour ? (le speaker l'annonce, et la finale se termine par une interview)
async function reperesTournoi(duel) {
  try {
    const t = await voirTournoi(duel.tournoi_id);
    const m = (t?.matchs || []).find(x => x.id === duel.tournoi_match);
    if (!D || D.id !== duel.id || !m) return;
    // (championnat : tous les matchs sont au « tour 1 sur 1 », ce n'est pas une finale)
    D.championnat = t.mode === "championnat";
    D.tourVoix = D.championnat ? null : { 0: "finale", 1: "demis", 2: "quarts", 3: "huitiemes" }[t.nb_tours - m.tour] ?? null;
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
const BATTEMENT_MS = 3000;
// Un signe de vie juste après la fin du délai en cours (coup, pause entre les sets, présentation…), pour que le serveur l'applique
// tout de suite, sans attendre le prochain signe de vie régulier.
function prevoirEcheance(duel) {
  if (!D) return;
  clearTimeout(D.echeanceT);
  const fin = duel?.echeance ? Date.parse(duel.echeance) : NaN;
  if (!Number.isFinite(fin)) return;
  const ms = fin - (Date.now() + (D.decalage || 0)) + 300;
  if (ms > 0 && ms < 10 * 60e3) D.echeanceT = setTimeout(battement, ms);
}
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
  if (resteSecousse > 0 && evenementsDuel(duel, D.moi).length > nbEvenements(S.match)) {
    D.enAttente = duel; clearTimeout(D.secoueT);
    D.secoueT = setTimeout(() => { D && (D.secoueFin = 0, majDuel(D.enAttente)); }, resteSecousse);
    return;
  }
  D.duel = duel;
  prevoirEcheance(duel);
  afficherMessages(duel);
  const m = S.match, ev = evenementsDuel(duel, D.moi), n = ev.length;
  // Un avertissement pour dépassement de temps, depuis la dernière fois (pas ceux d'avant mon arrivée dans le match).
  const avertis = Array.isArray(duel.avertis) ? vuDe(duel.avertis, D.moi) : [false, false];
  if (D.avertisVus) [0, 1].forEach(k => { if (avertis[k] && !D.avertisVus[k]) avertir(k); });
  D.avertisVus = avertis;

  // 1. Les coups révélés (et les points de pénalité) depuis la dernière fois (rattrapage si plusieurs).
  const montrer = (e, opts) => (e.coup ? afficherCoup(e.coup.a, e.coup.b, e.coup.auto, { ...opts, smash: e.coup.smash }) : afficherPenalite(e.penalite, opts));
  if (nbEvenements(m) < n && !m.termine) {
    while (nbEvenements(m) < n - 1) montrer(ev[nbEvenements(m)], { silencieux: true });
    const e = ev[n - 1];
    S.occupe = true; arreterMinuteur(); boutons(false);
    if (e.coup) sonDuCoup(e.coup.a, e.coup.b, e.coup.smash, m);   // le coup de raquette au moment où les deux signes se dévoilent
    montrer(e, {});
    if (!coherent(m, duel, D.moi)) {   // ne devrait jamais arriver : on se recale sur le serveur
      const r = rejouer(duel, D.moi); S.match = r.match; render(); renderHistorique();
    }
  }

  // 2. La phase du duel. Un match en cours reste à l'écran (filet de sécurité : si un autre écran s'est ouvert par-dessus).
  if (["presentation", "jeu", "entre_sets"].includes(duel.phase) && vueCourante !== "viewMatch") ouvrirOnglet("match");
  if (duel.phase === "presentation") {
    if (!D.presente) { D.presente = true; ouvrirFaceAFace(); }
  } else if (duel.phase === "jeu") {
    if (faceAFaceOuvert) { faceAFaceOuvert = false; volet(() => { fermerFaceAFace(); montrerSignes(); annoncer([annonceDebutSet(S.match)]); bullesDepart(duel); }); }
    if (!$("msgFenetre").hidden && $("msgFenetre").dataset.moment === "avant") fermerMessages();   // le match commence : trop tard pour le mot d'avant-match
    // Set suivant lancé par le serveur : on ferme le panneau et on reprend la main tout de suite
    // (sinon le premier coup du set pouvait partir au hasard).
    const reprise = !!panneauOuvert || !!D.replayEnCours;
    // (le set repart pendant le replay de la pause : on l'arrête net ; 18 novembre)
    if (D.replayEnCours) { D.replayEnCours(); D.replayEnCours = null; D.apresPanneau?.(); D.apresPanneau = null; bullesSet(duel); }
    if (panneauOuvert) { fermerPanneau(); D.apresPanneau?.(); D.apresPanneau = null; bullesSet(duel); }
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
  // Sonné par le smash réussi de l'adversaire (étape 54) : pas de coup pendant les 4 premières secondes du coup.
  const resteSonne = d.sonne === D.moi && d.sonne_manche === d.manche ? tempsRestant(d.echeance, D.decalage) - (DUREE_COUP_MS - SONNE_MS) : 0;
  if (resteSonne > 100) {
    lancerMinuteurDuel();
    if (D.sonneManche !== d.manche) {
      D.sonneManche = d.manche;
      sonner(resteSonne + 150, () => { if (D && !D.fini && D.duel.manche === d.manche && D.mancheEnvoyee !== d.manche && !panneauOuvert) boutons(true); });
    } else boutons(false);
    return;
  }
  boutons(true); lancerMinuteurDuel();
}

function lancerMinuteurDuel() {
  cancelAnimationFrame(raf); $("timer").classList.remove("urgent", "reserve");
  ambiance.calmer(true);
  const manche = D.duel.manche;
  const tick = () => {
    if (!D || D.fini || D.duel.manche !== manche || D.duel.pause_depuis) return;
    const reste = tempsRestant(D.duel.echeance, D.decalage);
    // Ma réserve de temps (étape 49 ; null : serveur pas encore à jour, l'ancienne règle s'applique).
    const reserve = Array.isArray(D.duel.reserve) ? Number(D.duel.reserve[D.moi]) * 1000 : null;
    if (reste > 0) {
      const k = Math.max(0, Math.min(1, reste / DUREE_COUP_MS));
      $("bar").style.transform = `scaleX(${k})`;
      if (k < 0.3) $("timer").classList.add("urgent");
      afficherReserve(reserve);
    } else if (reserve !== null && D.mancheEnvoyee !== manche && reste + reserve > 0) {
      // Les 8 secondes sont passées : je puise dans ma réserve.
      const r = reste + reserve;
      $("timer").classList.add("urgent", "reserve");
      $("bar").style.transform = `scaleX(${r / RESERVE_MS})`;
      afficherReserve(r, true);
    } else {
      // Temps dépassé : le serveur décide (avertissement, puis point de pénalité).
      if (D.mancheEnvoyee !== manche) { boutons(false); $("verdict").textContent = "Temps dépassé…"; if (reserve !== null) afficherReserve(0); }
      setTimeout(battement, TOLERANCE_MS);
      return;
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}

function jouerDuel(signe, smash = false) {
  if (!D || D.fini || S.occupe || panneauOuvert || faceAFaceOuvert) return;
  const d = D.duel;
  smash = !!smash && peutSmasher(S.match, 0);
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
  serveur.jouer(D.id, d.manche, signe, smash).then(majDuel).catch(e => {
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
  D.arret?.(); clearInterval(D.boucle); clearTimeout(D.echeanceT); clearTimeout(D.decompte); arreterMinuteur(); boutons(false);
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
  D.arret?.(); clearInterval(D.boucle); clearTimeout(D.echeanceT); clearInterval(D.guetteFin); clearTimeout(D.decompte); arreterMinuteur();
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

try { installerNoel(); } catch { /* sans décor de Noël */ }   // (24 novembre : le court de Noël, noel.js)
duelsUI = installerDuels({
  compte: compteUI,
  apresDefis: () => cerclesUI?.majDefiAmi?.(),   // (21 novembre : le bouton de la page d'un ami dit l'horaire du défi programmé)
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
  defier: (p, o) => duelsUI.defier(p, o),
  dejaDefie: id => !!duelsUI?.dejaDefie(id),
  texteDefiProgramme: id => duelsUI?.texteDefiProgramme?.(id) || "",
  annulerDefi: id => duelsUI.annulerDefi(id),
  voirCarte: id => voirCarteDe(id),
  ongletsJoueur: (el, uid, nom, o) => ongletsJoueur(el, uid, nom, o),
  fantomeDe: id => chargerFantome(id).then(f => !!f),
  titreUneFil: (d, membres) => { try { return uneDuFil(d, membres).h.titre; } catch { return null; } },
  ouvrirUneFil: (d, membres) => { const u = uneDuFil(d, membres); $("unePublier").hidden = true; return montrerUne(u.h, u.joueurs, u.score); },
  jouerFantome,
  lancerDuel,
  trophees: donnees => { gagnerTrophees(accorderTitres(P, titresEnLigne(donnees))); majDossard(); },
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
// Le Dossard 1 (étape 71) : suis-je tenant du titre d'un de mes cercles ? P.tenantTitre : les noms de ces cercles (ou null).
// Le titre perdu : le gant redevient jaune simple. Le titre gagné : un message (le gant attend dans le Vestiaire).
function majDossard() {
  if (!compteUI?.connecte() || !ouvert("dossard")) return;
  mesDossards().then(liste => {
    const avant = P.tenantTitre || null, cercles = (liste || []).map(x => x.cercle?.nom).filter(Boolean);
    P.tenantTitre = cercles.length ? cercles : null;
    if (!P.tenantTitre && P.av.gant === "dossard") P.av.gant = "jaune";
    // (le gant en or du FIAC Club : pour le tenant du titre du FIAC Club seulement)
    const fiacAvant = !!P.tenantFiac;
    P.tenantFiac = (liste || []).some(x => estFiac(x.cercle?.id));
    if (!P.tenantFiac && P.av.gant === "fiac") P.av.gant = "jaune";
    if (P.tenantFiac !== fiacAvant) {
      sauverP(); rafraichirAvatars(); if (vueCourante === "viewProfile") renderFiche();
      const t = $("toast");
      t.textContent = P.tenantFiac ? "🏆 Tu es tenant du titre du FIAC Club : le gant en or brodé « Fiac Club » t'attend dans le Vestiaire !"
        : "🏆 Un autre joueur a pris le gant en or du FIAC Club. Gagne le prochain tournoi pour le reprendre !";
      t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 6000);
      return;   // (ce message-là plutôt que celui du Dossard 1 jaune)
    }
    if (JSON.stringify(avant) === JSON.stringify(P.tenantTitre)) return;
    sauverP(); rafraichirAvatars(); if (vueCourante === "viewProfile") renderFiche();
    const t = $("toast"), nouveau = cercles.find(n => !(avant || []).includes(n));
    if (!nouveau && P.tenantTitre) return;
    t.textContent = nouveau ? `🟨 Tu es tenant du titre du cercle « ${nouveau} » : le Dossard 1 t'attend dans le Vestiaire !`
      : "🟨 Un autre joueur a pris ton Dossard 1. Gagne le prochain tournoi de ton cercle pour le reprendre !";
    t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 6000);
  }).catch(() => {});
}
compteUI.surConnexion(session => { if (session?.user) majDossard(); });
// (20 novembre, demande du porteur du projet : les stats des adversaires séparées joueurs / bots, comme les miennes) « Mon jeu »
// contre les joueurs et contre les bots est retrouvé dès l'ouverture de l'appli (et plus seulement en ouvrant Ma fiche › Stats) :
// enregistré dans la fiche en ligne, il apparaît aussitôt sur la fiche que voient les autres. (8 secondes : après la synchronisation)
compteUI.surConnexion(session => { if (session?.user) setTimeout(() => { recupererJeuPasse(); }, 8000); });
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") majDossard(); });

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
// ---------------------------------------------------------------- le fantôme d'un ami (fantome.js)
// Un bot qui joue comme lui, d'après ses derniers matchs en ligne ; un set de 7. Le match compte dans le total de matchs joués,
// mais ni dans le niveau, ni dans les duels, ni dans le classement (6 novembre, décisions du porteur du projet).
const fantomes = new Map();
async function chargerFantome(id) {
  if (fantomes.has(id)) return fantomes.get(id);
  let matchs = null;
  try { matchs = await dossierJoueur(id); } catch { return null; }   // (sans réseau : on réessaiera)
  const modele = modeleFantome(matchs);
  let k = compteVide();
  for (const m of matchs || []) k = additionner(k, compterMatch(m.map(c => ({ a: c.a, b: c.b, gagnant: c.g ?? null }))));
  const f = modele ? { modele, k } : null;
  fantomes.set(id, f);
  return f;
}
async function jouerFantome(a) {
  if (D && !D.fini) return;
  const f = await chargerFantome(a.id); if (!f) return;
  voix.arreter(); arreterMinuteur(); if (S) clearTimeout(S.decompte);
  const nom = String(a.pseudo || "").replace(/#\d+$/, "");
  OPP = {
    id: `fantome:${a.id}`, fantome: true, modele: f.modele, dossierK: f.k, nom: `Fantôme de ${nom}`, style: "👻 Le fantôme",
    desc: `joue comme ${nom}, d'après ses ${f.modele.matchs} derniers matchs en ligne`, elo: a.classement ?? 1200,
    specialite: `${EMOJI[f.modele.favori]} ${NOM[f.modele.favori]}`, imprevisibilite: null, av: { ...(a.avatar || {}), fantome: true },
  };
  WIN = 1;
  S = {
    match: nouveauMatch({ pointsParSet: 7, setsGagnants: 1 }),
    stats: nouvellesStats(), annonces: avecAudible(nouvelEtatAnnonces({ anciens: commentairesRecents(), genre: P.genre })), suivi: new Suivi(),
    tour: null, occupe: false, enJeu: false, contreFantome: true,
  };
  preparerEcranMatch();
  $("startCard").hidden = true; $("tourCard").hidden = true;
  $("ruleTxt").textContent = `Contre le fantôme de ${nom} · ${texteFormat(S.match.format)}`;
  rafraichirAvatars(); render();
  aller("viewMatch");
  ouvrirFaceAFace();
}
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
boutiqueUI = installerBoutique({ compte: compteUI, lireP: () => P, sauverP, nouveautes: cle => ouvert(cle || "club"), jetons: () => jetonsUI?.rafraichir(),
  apresChangement: () => { rafraichirAvatars(); if (vueCourante === "viewProfile") renderFiche(); } });
// Le calendrier de l'Avent (24 novembre ; ecran-avent.js) : sa ligne sous les défis du jour, pendant les fêtes ; un rattrapage contre le gardien
// de la case (un set de 7 points) ; un défi contre un bot de Noël (il est choisi dans l'entraînement).
function jouerGardien(num, botId) {
  if (D && !D.fini) return;
  voix.arreter(); arreterMinuteur(); if (S) clearTimeout(S.decompte);
  OPP = botParId(botId); WIN = FORMAT_GARDIEN.setsGagnants;
  S = {
    match: nouveauMatch({ ...FORMAT_GARDIEN }),
    stats: nouvellesStats(), annonces: avecAudible(nouvelEtatAnnonces({ anciens: commentairesRecents(), genre: P.genre })), suivi: new Suivi(),
    tour: null, occupe: false, enJeu: false, aventRattrapage: num,
  };
  preparerEcranMatch();
  $("startCard").hidden = true; $("tourCard").hidden = true;
  $("ruleTxt").textContent = `🎄 Calendrier de l'Avent : rattrapage de la case ${num} contre ${OPP.nom} · ${texteFormat(S.match.format)}`;
  rafraichirAvatars(); render();
  aller("viewMatch");
  ouvrirFaceAFace();
}
aventUI = installerAvent({ compte: compteUI, lireP: () => P, sauverP, aller,
  // (27 novembre, choix du porteur du projet : « grelots et glockenspiel ») la petite musique du cadeau, si les bruitages sont allumés
  musiqueCadeau: () => { if (!sonActif || !bruitagesActifs) return; try { const a = new Audio("audio/noel_cadeau_01.mp3"); a.volume = 0.7; a.play().catch(() => {}); } catch { /* sans son */ } },
  apresChangement: () => { rafraichirAvatars(); if (vueCourante === "viewProfile") renderFiche(); },
  jouerGardien,
  jouerContre: botId => { amicalId = botId; ecrire("adversaire", amicalId); OPP = botParId(amicalId); renderAdversaires(); rafraichirAvatars(); aller("viewMatch"); },
  titres: ids => { const t = accorderTitres(P, ids); if (t.length) { sauverP(); renderFiche(); } },
});
aventUI.ligne();
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
compterVisite(envoyerVisite, premiereFois, envoyerParcours);
document.addEventListener("visibilitychange", () => { if (!document.hidden) compterVisite(envoyerVisite, false, envoyerParcours); });   // (appli restée ouverte jusqu'au lendemain)

// ---------------------------------------------------------------- la bulle « 🟢 N en ligne » (26 novembre ; en-ligne.js)
// Toutes les versions se signalent ; la bulle ne s'affiche que sur la version de test pour l'instant (nouveautes.js « enLigne »).
// (pas pour un navigateur piloté par un programme, comme les matchs d'essai du robot de mise en ligne)
let enLigneN = 0;
if (!navigator.webdriver) {
  try {
    suivreEnLigne(clientSupabase(), n => {
      enLigneN = n;
      if (!ouvert("enLigne")) return;
      $("enLigneN").textContent = n; $("enLigne").hidden = !n;
      $("enLigne").setAttribute("aria-label", `${n} joueur${n > 1 ? "s" : ""} en ligne`);
    });
  } catch { /* hors ligne : pas de bulle */ }
}
$("enLigne").addEventListener("click", () => {
  const t = $("toast");
  t.textContent = enLigneN > 1 ? `🟢 ${enLigneN} joueurs sur HandSlam en ce moment, toi compris.` : "🟢 Tu es seul sur HandSlam en ce moment. Lance la partie rapide : un bot de ton niveau t'attend !";
  t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 4000);
});

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
  $("presenceZone").hidden = !session?.user; $("carteCacheeZone").hidden = !session?.user; $("historiqueZone").hidden = true;
  $("carteCachee").checked = !!P.carteCachee;
  if (!session?.user) return;
  signalerPresence();
  maPresenceVisible().then(v => { $("presenceVisible").checked = v !== false; }).catch(() => {});
  $("historiqueZone").hidden = !ficheVisible();
  if (ficheVisible()) monHistoriqueCache().then(v => { $("historiqueCache").checked = !!v; }).catch(() => {});
}
compteUI.surConnexion(surSessionPresence);
surSessionPresence(compteUI.session());
$("carteCachee").addEventListener("change", e => { P.carteCachee = e.target.checked; sauverP(); });   // gardé dans la fiche en ligne
$("historiqueCache").addEventListener("change", async e => {   // (étape 68)
  try { await reglerHistorique(e.target.checked); }
  catch { e.target.checked = !e.target.checked; }
});
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
const ouvrirDepuisNotification = cible => { if (cible === "avent") aller("viewAvent"); /* (étape 90 : le calendrier de l'Avent est ouvert) */ else if (cible === "duels") aller("viewDuel"); else if (cible === "tournois") aller("viewTournois"); else if (cible === "invitations") { aller("viewJouer"); cerclesUI?.proposerInvitation(); }
  else if (cible === "amis") { aller("viewCercles"); cerclesUI?.montrerDemandes(); } /* (étape 79 : demandes d'ami, invitations dans un cercle) */ else if (cible === "freeroll" || cible === "programmes") aller("viewFreeroll"); };
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

// ---------------------------------------------------------------- les tutos (app/js/tutos.js)
// Pas pendant un match ni par-dessus une autre fenêtre (sauf la fenêtre « Défier », qui a son tuto).
const tutos = installerTutos({
  lire, ecrire,
  occupe: () => !!(vueCourante === "viewMatch" || faceAFaceOuvert || document.querySelector(".inter.show") || document.querySelector(".fenetre-fond:not([hidden]):not(#defiFenetre)")),
});
$("tutosRevoir").addEventListener("click", () => { tutos.revoir(); $("tutosMsg").textContent = "C'est noté : les bulles reviendront en ouvrant ces écrans."; });
// Revoir un tuto tout de suite : on l'oublie, et on ouvre son écran (il s'affiche un instant plus tard).
$("tutosListe").addEventListener("click", e => {
  const b = e.target.closest("[data-tuto]"); if (!b) return;
  tutos.revoir(b.dataset.tuto); $("tutosMsg").textContent = "";
  aller(b.dataset.vue);
});
