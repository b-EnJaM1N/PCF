// Le compteur de visites (supabase/etape-43-visites.sql et etape-44-fidelite.sql) : au plus une fois par jour, ce téléphone
// dit « j'ai ouvert l'appli », avec son origine (site, appli Android, appli installée), s'il s'agit de la toute première fois
// et s'il était déjà venu la veille ; et, une seule fois, « je viens de jouer mon 3e match ».
// Rien d'autre n'est envoyé : ni compte, ni identifiant.
import { lire, ecrire } from "./stockage.js";
import { jourParis } from "./match-du-jour.js";

// D'où vient la visite : l'appli Android du Play Store, l'appli installée depuis le navigateur, ou le site.
export function origineVisite({ referrer = "", standalone = false, androidVu = false } = {}) {
  if (androidVu || referrer.startsWith("android-app://")) return "android";
  return standalone ? "installee" : "site";
}

// Faut-il compter cette ouverture ? Pas deux fois le même jour, ni sur la version de test ou en local.
export function aCompter({ dernierJour, jour, chemin = "/", hote = "" }) {
  if (/\/preview\//.test(chemin) || /^(localhost|127\.|0\.0\.0\.0)/.test(hote)) return false;
  return dernierJour !== jour;
}

// Le jour d'avant (« 2026-10-20 » → « 2026-10-19 »).
export function veille(jour) {
  const d = new Date(`${jour}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
// D'où vient ce téléphone (on se souvient de l'appli Android, qui ne l'indique qu'à la première page).
function origineIci() {
  if (document.referrer.startsWith("android-app://")) ecrire("visiteAndroid", true);
  return origineVisite({ referrer: document.referrer, standalone: matchMedia("(display-mode: standalone)").matches, androidVu: !!lire("visiteAndroid", false) });
}

// envoyer(origine, nouveau, revenu) : l'appel au serveur ; premiereFois : aucune fiche sur ce téléphone au démarrage.
export function compterVisite(envoyer, premiereFois) {
  try {
    const jour = jourParis(), dernierJour = lire("visiteJour", null);
    if (!aCompter({ dernierJour, jour, chemin: location.pathname, hote: location.hostname })) return;
    envoyer(origineIci(), dernierJour === null && premiereFois, dernierJour === veille(jour)).then(() => ecrire("visiteJour", jour)).catch(() => {});
  } catch { /* sans réseau ou sans stockage : tant pis */ }
}

// Le 3e match joué sur ce téléphone : signalé une seule fois (envoyer(origine) : l'appel au serveur).
export function compterTroisMatchs(envoyer) {
  try {
    if (lire("visite3Matchs", false) || !aCompter({ dernierJour: null, jour: "", chemin: location.pathname, hote: location.hostname })) return;
    envoyer(origineIci()).then(() => ecrire("visite3Matchs", true)).catch(() => {});
  } catch { /* sans réseau ou sans stockage : tant pis */ }
}
