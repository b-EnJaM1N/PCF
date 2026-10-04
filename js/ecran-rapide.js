// Partie rapide (menu Jouer › Partie rapide) : un adversaire de mon niveau, en un clic.
// Tant qu'on attend, on redemande toutes les 2,5 s (c'est aussi le signe de vie : il faut rester sur l'écran).
// Au bout de 30 s sans adversaire, on propose honnêtement un bot, sans arrêter de chercher un humain.
import * as social from "./social-serveur.js";
import * as serveur from "./duel-serveur.js";
import { FORMATS_RAPIDES, ATTENTE_AVANT_BOT_S, chrono, texteFile } from "./rapide-logique.js";
import { MISES, gainDuel } from "./jetons-logique.js";
import { lire, ecrire } from "./stockage.js";

const $ = id => document.getElementById(id);

// ctx : { compte, lancerDuel(duel, profilAdversaire), duelEnCours(), jouerBot(format) }
export function installerRapide(ctx) {
  let uid = null, format = null, minuterie = 0, horloge = 0, debut = 0, enCours = false, file = null;
  let mise = MISES.includes(lire("rapideMise", 0)) ? lire("rapideMise", 0) : 0;
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
  // Combien attendent, pour la mise choisie.
  function renderFile() {
    document.querySelectorAll("#rapideMise button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.v === mise)));
    $("rapideMiseTexte").textContent = mise ? `Chacun paie ${mise} jetons au début du match ; le gagnant en remporte ${gainDuel(mise)}. Si ton adversaire n'arrive pas, tu es remboursé.` : "";
    if (!file) return;
    const nb = k => (mise ? file.mises?.[`${k}_${mise}`] : file[k]) || 0;
    for (const k of Object.keys(FORMATS_RAPIDES)) $(`rapideNb_${k}`).textContent = nb(k) ? `${nb(k)} en attente` : "";
    $("rapideFile").textContent = texteFile(Object.keys(FORMATS_RAPIDES).reduce((a, k) => a + nb(k), 0));
  }
  document.querySelectorAll("#rapideMise button").forEach(b => b.addEventListener("click", () => { if (format) return; mise = +b.dataset.v; ecrire("rapideMise", mise); renderFile(); }));
  renderFile();

  function afficher() {
    $("rapideChoix").hidden = !!format; $("rapideAttente").hidden = !format;
    if (format) $("rapideFormat").textContent = `${FORMATS_RAPIDES[format].nom} · ${FORMATS_RAPIDES[format].detail}${mise ? ` · 🪙 mise de ${mise} jetons` : ""}`;
  }

  async function chercher() {
    if (!format || enCours) return;
    enCours = true;
    try {
      const r = await social.chercherPartie(format, mise);
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
      $("rapideChrono").textContent = chrono(s);
      if (s >= ATTENTE_AVANT_BOT_S && $("rapideBot").hidden) {
        $("rapideBotTexte").textContent = mise
          ? `Personne n'est disponible pour l'instant. Tu peux jouer contre un bot à ta mise de ${mise} jetons : si tu gagnes, tu remportes ${gainDuel(mise)} jetons ; si le bot gagne, tu perds ta mise. Ce sera un bot, pas un humain, et le match ne comptera pas pour ton niveau officiel.`
          : "Personne n'est disponible pour l'instant. Tu peux jouer contre un bot en attendant : ce sera un bot, pas un humain, sans mise, et le match ne comptera pas pour ton niveau officiel.";
        $("rapideBot").hidden = false;
      }
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
  $("rapideBotGo").addEventListener("click", async () => {
    const f = format;
    if (!mise) { arreter({ quitter: true }); ctx.jouerBot(f); return; }
    // Avec une mise : un vrai duel contre un bot, joué sur le serveur (la mise est prélevée, le gagnant remporte 1,8 fois la mise).
    $("rapideBotGo").disabled = true;
    try {
      const duel = await social.jouerBotRapide(f, mise);
      arreter();
      const [p] = await serveur.profils([duel.j1]).catch(() => []);
      if (p && !ctx.duelEnCours()) ctx.lancerDuel(duel, p);
    } catch (e) {
      const m = String(e?.message || e);
      dire(/jetons|adversaire|duel en cours/.test(m) ? m : "Impossible de lancer le match contre un bot. Vérifie ta connexion et réessaie.", true);
    } finally { $("rapideBotGo").disabled = false; }
  });

  return {
    // On quitte l'écran : on arrête de chercher.
    quitterEcran: () => { if (format) { arreter({ quitter: true }); dire("Recherche arrêtée : il faut rester sur cet écran pendant la recherche."); } },
    // L'adversaire n'est jamais arrivé : la partie a été annulée.
    annulee: () => dire(`Ton adversaire n'est pas arrivé : la partie est annulée, sans effet sur ton niveau${mise ? " (ta mise t'est rendue)" : ""}. Tu peux relancer une recherche.`, true),
    rafraichir: compter,
  };
}
