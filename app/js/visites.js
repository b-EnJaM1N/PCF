// Le compteur de visites (supabase/etape-43-visites.sql) : au plus une fois par jour, ce téléphone dit « j'ai ouvert
// l'appli », avec son origine (site, appli Android, appli installée) et s'il s'agit de la toute première fois.
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

// envoyer(origine, nouveau) : l'appel au serveur ; premiereFois : aucune fiche sur ce téléphone au démarrage.
export function compterVisite(envoyer, premiereFois) {
  try {
    const jour = jourParis(), dernierJour = lire("visiteJour", null);
    if (!aCompter({ dernierJour, jour, chemin: location.pathname, hote: location.hostname })) return;
    // L'appli Android n'indique son origine qu'à la première page : on s'en souvient pour la suite.
    if (document.referrer.startsWith("android-app://")) ecrire("visiteAndroid", true);
    const origine = origineVisite({ referrer: document.referrer, standalone: matchMedia("(display-mode: standalone)").matches, androidVu: !!lire("visiteAndroid", false) });
    envoyer(origine, dernierJour === null && premiereFois).then(() => ecrire("visiteJour", jour)).catch(() => {});
  } catch { /* sans réseau ou sans stockage : tant pis */ }
}
