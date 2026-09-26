// Carte « Mon compte » de la fiche joueur : connexion par code reçu par e-mail,
// choix du pseudo, sauvegarde automatique de la fiche en ligne, déconnexion, suppression.
import * as compte from "./compte.js";
import { choisirFiche, pseudoValide, pseudoComplet } from "./synchro.js";
import { lire, ecrire } from "./stockage.js";

const $ = id => document.getElementById(id);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const heure = d => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

// ctx : { lireP(), remplacerP(fiche), sauverLocal(), rafraichir() }
export function installerCompte(ctx) {
  let session = null, email = lire("compteEmail", ""), minuterie = 0, occupe = false;

  const montrer = etat => {
    for (const [id, e] of [["compteHors", "hors"], ["compteCode", "code"], ["comptePseudo", "pseudo"], ["compteOn", "on"]]) $(id).hidden = etat !== e;
    $("supprimerCompte").hidden = etat !== "on";
    $("infoConnexion").hidden = etat === "on";
  };
  const dire = (t, erreur = false) => { $("compteMsg").textContent = t; $("compteMsg").classList.toggle("erreur", erreur); };
  const attendre = async (bouton, f) => {
    if (occupe) return; occupe = true; bouton.disabled = true; dire("");
    try { await f(); } catch (e) { dire(e.message, true); } finally { occupe = false; bouton.disabled = false; }
  };

  function afficherConnecte() {
    const P = ctx.lireP();
    $("compteNom").textContent = `✅ Connecté : ${pseudoComplet(P)}`;
    $("compteEmailAff").textContent = session?.user?.email || "";
    montrer("on");
  }

  // Envoie la fiche du téléphone en ligne.
  async function envoyer() {
    if (!session) return;
    const P = ctx.lireP();
    if (!pseudoValide(P.pseudo)) { $("compteEtat").textContent = "⚠️ Pseudo invalide (2 à 16 caractères, sans « # ») : ta fiche n'est pas sauvegardée en ligne."; return; }
    try {
      const ligne = await compte.enregistrerFiche(P, session.user.id);
      const Q = ctx.lireP(); Q.pseudo = ligne.pseudo; Q.numero = ligne.numero; ctx.sauverLocal(); ctx.rafraichir();
      ecrire("synchroEnAttente", false);
      $("compteEtat").textContent = `☁️ Fiche sauvegardée en ligne à ${heure(new Date())}.`;
      afficherConnecte();
    } catch (e) {
      ecrire("synchroEnAttente", true);
      $("compteEtat").textContent = `⏳ ${e.message} Ta fiche sera sauvegardée dès que possible.`;
    }
  }
  const planifier = () => { if (!session) return; clearTimeout(minuterie); minuterie = setTimeout(envoyer, 1500); };

  // Juste après la connexion : on choisit la fiche à garder, puis on synchronise.
  async function apresConnexion(s) {
    session = s;
    const ligne = await compte.lireFiche(s.user.id);
    if (!ligne && !pseudoValide(ctx.lireP().pseudo)) { $("inPseudoCompte").value = ctx.lireP().pseudo || ""; montrer("pseudo"); return; }
    const choix = choisirFiche(ctx.lireP(), ligne);
    ctx.remplacerP(choix.fiche);
    afficherConnecte();
    if (choix.envoyer) await envoyer();
    else $("compteEtat").textContent = "☁️ Fiche en ligne retrouvée et chargée sur ce téléphone.";
  }

  $("btnCode").addEventListener("click", () => attendre($("btnCode"), async () => {
    const e = $("inEmail").value.trim().toLowerCase();
    if (!EMAIL.test(e)) throw new Error("Cette adresse e-mail ne semble pas valide.");
    await compte.envoyerCode(e);
    email = e; ecrire("compteEmail", e);
    $("codeInfo").textContent = `Code envoyé à ${e}. Regarde tes e-mails (et les indésirables) : il peut mettre une minute à arriver.`;
    $("inCode").value = ""; montrer("code"); $("inCode").focus();
  }));
  $("btnValider").addEventListener("click", () => attendre($("btnValider"), async () => {
    const code = $("inCode").value.replace(/\D/g, "");
    if (code.length < 6) throw new Error("Le code contient 6 chiffres (parfois 8).");
    await apresConnexion(await compte.validerCode(email, code));
  }));
  $("inCode").addEventListener("input", e => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 8); });
  $("btnRenvoyer").addEventListener("click", () => attendre($("btnRenvoyer"), async () => {
    await compte.envoyerCode(email); dire("Nouveau code envoyé.");
  }));
  $("btnAutreEmail").addEventListener("click", () => { dire(""); montrer("hors"); $("inEmail").focus(); });
  $("btnCreer").addEventListener("click", () => attendre($("btnCreer"), async () => {
    const p = $("inPseudoCompte").value.trim();
    if (!pseudoValide(p)) throw new Error("Choisis un pseudo de 2 à 16 caractères, sans « # ».");
    const P = ctx.lireP(); P.pseudo = p; ctx.sauverLocal(); $("inPseudo").value = p;
    await apresConnexion(session);
  }));
  $("btnDeco").addEventListener("click", () => attendre($("btnDeco"), async () => {
    if (!confirm("Te déconnecter ? Ta fiche reste sur ce téléphone et en ligne.")) return;
    await compte.deconnecter().catch(() => {});
    session = null; delete ctx.lireP().numero; ctx.sauverLocal(); ctx.remplacerP(ctx.lireP());
    montrer("hors"); dire("Déconnecté.");
  }));
  $("supprimerCompte").addEventListener("click", () => attendre($("supprimerCompte"), async () => {
    if (!confirm("Supprimer définitivement ton compte et ta fiche en ligne ?\n\nTa fiche restera seulement sur ce téléphone.")) return;
    await compte.supprimerCompte();
    session = null; delete ctx.lireP().numero; ctx.sauverLocal(); ctx.remplacerP(ctx.lireP());
    montrer("hors"); dire("Ton compte a été supprimé.");
  }));
  window.addEventListener("online", () => { if (lire("synchroEnAttente", false)) envoyer(); });

  // Au démarrage : reprendre la session si le joueur était connecté.
  $("inEmail").value = email;
  montrer("hors");
  compte.sessionActuelle().then(async s => {
    if (!s) return;
    try { await apresConnexion(s); } catch (e) { session = s; afficherConnecte(); $("compteEtat").textContent = `⏳ ${e.message}`; }
  });
  compte.surChangement(s => { if (!s && session) { session = null; montrer("hors"); } });

  return { planifier, connecte: () => !!session };
}
