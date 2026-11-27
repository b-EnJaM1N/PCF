// Partie rapide (menu Jouer › Partie rapide) : un adversaire de mon niveau, en un clic.
// Tant qu'on attend, on redemande toutes les 2,5 s (c'est aussi le signe de vie).
// Au bout de 30 s sans adversaire, on propose honnêtement un bot, sans arrêter de chercher un humain.
// (27 novembre, demande du porteur du projet) Pendant la recherche, on peut se promener dans l'appli : un bandeau « 🔎 Recherche…
// 0:42 » reste visible partout (le toucher ramène ici) et le match se lance dès qu'un adversaire arrive. La recherche s'arrête
// si on lance un autre match (contre un bot, le match du jour, la carrière…).
import * as social from "./social-serveur.js";
import * as serveur from "./duel-serveur.js";
import { FORMATS_RAPIDES, ATTENTE_AVANT_BOT_S, chrono, texteFile } from "./rapide-logique.js";

const $ = id => document.getElementById(id);

// ctx : { compte, lancerDuel(duel, profilAdversaire), duelEnCours(), jouerBot(format), surEcran() (l'écran Partie rapide est affiché),
// allerIci() }
export function installerRapide(ctx) {
  let uid = null, format = null, minuterie = 0, horloge = 0, debut = 0, enCours = false, file = null;
  const dire = (t, erreur = false) => { $("rapideMsg").textContent = t; $("rapideMsg").classList.toggle("erreur", erreur); };

  function surSession(session) {
    uid = session?.user?.id || null;
    arreter();
    $("rapideCard").hidden = !uid; $("rapideHors").hidden = !!uid;
    if (uid) compter();
  }
  ctx.compte.surConnexion(surSession);
  surSession(ctx.compte.session());   // tout de suite, sans attendre le serveur : l'écran n'est jamais vide

  // Combien de joueurs attendent dans chaque file.
  async function compter() {
    if (!uid || format) return;
    try { file = await social.fileRapide(); renderFile(); } catch { /* hors ligne */ }
  }
  // Combien attendent, dans chaque format.
  function renderFile() {
    if (!file) return;
    const nb = k => file[k] || 0;
    for (const k of Object.keys(FORMATS_RAPIDES)) $(`rapideNb_${k}`).textContent = nb(k) ? `${nb(k)} en attente` : "";
    $("rapideFile").textContent = texteFile(Object.keys(FORMATS_RAPIDES).reduce((a, k) => a + nb(k), 0));
  }
  renderFile();

  // Le bandeau de la recherche, sur les autres écrans.
  function bandeau() {
    const b = $("rapideBandeau"); if (!b) return;
    b.hidden = !format || ctx.surEcran();
    if (format) $("rapideBandeauChrono").textContent = chrono((Date.now() - debut) / 1000);
  }
  $("rapideBandeau")?.addEventListener("click", () => ctx.allerIci());

  function afficher() {
    bandeau();
    $("rapideChoix").hidden = !!format; $("rapideAttente").hidden = !format;
    if (format) $("rapideFormat").textContent = `${FORMATS_RAPIDES[format].nom} · ${FORMATS_RAPIDES[format].detail}`;
  }

  async function chercher() {
    if (!format || enCours) return;
    enCours = true;
    try {
      const r = await social.chercherPartie(format, 0);
      if (!format) return;
      if (r.duel) {
        const duel = r.duel, adv = duel.j0 === uid ? duel.j1 : duel.j0;
        arreter();
        dire("Adversaire trouvé ! Le match commence.");
        const [p] = await serveur.profils([adv]).catch(() => []);
        if (p && !ctx.duelEnCours()) ctx.lancerDuel(duel, p);
        return;
      }
      // Si quelqu'un d'autre attendait, on aurait déjà été associés : je suis donc le seul dans cette file.
      $("rapideEtat").textContent = "Personne d'autre ne cherche pour l'instant. Le premier joueur qui arrive sera ton adversaire.";
    } catch (e) {
      arreter();
      const m = String(e?.message || e);
      dire(m.includes("déjà un duel") ? "Tu as déjà un duel en cours : termine-le d'abord (menu Jouer)."
        : /jetons/.test(m) ? m : "Recherche impossible pour l'instant. Vérifie ta connexion et réessaie.", true);
    } finally { enCours = false; }
  }

  function lancer(f) {
    if (ctx.duelEnCours()) { dire("Tu as déjà un duel en cours : termine-le d'abord.", true); return; }
    format = f; debut = Date.now(); dire("");
    $("rapideBot").hidden = true; $("rapideEtat").textContent = "Recherche d'un adversaire…";
    afficher();
    chercher();
    minuterie = setInterval(chercher, 2500);
    horloge = setInterval(() => {
      const s = (Date.now() - debut) / 1000;
      $("rapideChrono").textContent = chrono(s); bandeau();
      if (s >= ATTENTE_AVANT_BOT_S) $("rapideBot").hidden = false;
    }, 250);
  }

  // Arrête de chercher (et quitte la file si on y était).
  function arreter({ quitter = false } = {}) {
    clearInterval(minuterie); clearInterval(horloge);
    const etait = format; format = null;
    if (quitter && etait && uid) social.quitterPartie().catch(() => {});
    afficher(); $("rapideChrono").textContent = "0:00";
    compter();
  }

  document.querySelectorAll("#rapideChoix [data-format]").forEach(b => b.addEventListener("click", () => lancer(b.dataset.format)));
  $("rapideAnnuler").addEventListener("click", () => { arreter({ quitter: true }); dire("Recherche annulée."); });
  $("rapideBotGo").addEventListener("click", () => { const f = format; arreter({ quitter: true }); ctx.jouerBot(f); });

  return {
    // On change d'écran : la recherche continue, le bandeau la montre (ou la cache, de retour ici).
    changerEcran: bandeau,
    // Un autre match commence (bot, match du jour, carrière…) : on arrête de chercher.
    autreMatch: () => { if (format) { arreter({ quitter: true }); dire("Recherche arrêtée : tu as lancé un autre match."); } },
    // L'adversaire n'est jamais arrivé : la partie a été annulée.
    annulee: () => dire(`Ton adversaire n'est pas arrivé : la partie est annulée, sans effet sur ton niveau. Tu peux relancer une recherche.`, true),
    rafraichir: compter,
  };
}
