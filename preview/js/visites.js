// Le compteur de visites (supabase/etape-43-visites.sql et etape-44-fidelite.sql) : au plus une fois par jour, ce téléphone
// dit « j'ai ouvert l'appli », avec son origine (site, appli Android, appli installée), s'il s'agit de la toute première fois
// et s'il était déjà venu la veille ; une seule fois, « je viens de jouer mon 3e match » ; et « un match terminé » à chaque match.
// Le parcours des nouveaux (etape-58-parcours-nouveaux.sql) : le téléphone garde son jour d'arrivée et signale, rangé à ce jour,
// le lancement de son premier match, son premier coup, la fin de son premier match, son retour le lendemain et son retour une semaine plus tard (du 7e au 13e jour).
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
// Le nombre de jours entre deux dates (« 2026-11-03 », « 2026-11-10 » → 7).
export function ecartJours(de, a) {
  return Math.round((Date.parse(`${a}T12:00:00Z`) - Date.parse(`${de}T12:00:00Z`)) / 86400000);
}

// Ce qu'une ouverture apprend du parcours d'un nouveau : revenu le lendemain, ou une semaine plus tard (une seule fois).
export function retoursParcours({ arrivee, jour, retour7Fait = false }) {
  if (!arrivee) return [];
  const e = ecartJours(arrivee, jour);
  if (e === 1) return ["retour_1j"];
  if (e >= 7 && e <= 13 && !retour7Fait) return ["retour_7j"];
  return [];
}

// D'où vient ce téléphone (on se souvient de l'appli Android, qui ne l'indique qu'à la première page).
function origineIci() {
  if (document.referrer.startsWith("android-app://")) ecrire("visiteAndroid", true);
  return origineVisite({ referrer: document.referrer, standalone: matchMedia("(display-mode: standalone)").matches, androidVu: !!lire("visiteAndroid", false) });
}

// envoyer(origine, nouveau, revenu) : l'appel au serveur ; premiereFois : aucune fiche sur ce téléphone au démarrage ;
// envoyerParcours(origine, arrivee, etape) : le parcours des nouveaux (étape 58).
export function compterVisite(envoyer, premiereFois, envoyerParcours = null) {
  try {
    const jour = jourParis(), dernierJour = lire("visiteJour", null);
    if (!aCompter({ dernierJour, jour, chemin: location.pathname, hote: location.hostname })) return;
    const origine = origineIci(), nouveau = dernierJour === null && premiereFois;
    envoyer(origine, nouveau, dernierJour === veille(jour)).then(() => {
      ecrire("visiteJour", jour);
      if (!envoyerParcours) return;
      if (nouveau) { ecrire("visiteArrivee", { jour, origine }); envoyerParcours(origine, jour, "arrive").catch(() => {}); return; }
      const a = lire("visiteArrivee", null);
      for (const etape of retoursParcours({ arrivee: a?.jour, jour, retour7Fait: !!lire("visiteRetour7", false) })) {
        envoyerParcours(a.origine, a.jour, etape).then(() => { if (etape === "retour_7j") ecrire("visiteRetour7", true); }).catch(() => {});
      }
    }).catch(() => {});
  } catch { /* sans réseau ou sans stockage : tant pis */ }
}

// Une étape du premier match d'un nouveau, signalée une seule fois, rangée à son jour d'arrivée : « premier_lance » (il touche
// « Jouer mon premier match », étape 59), « premier_coup » (il y joue un coup, étape 59), « premier_match » (il finit un match, étape 58).
const CLES_PREMIER = { premier_lance: "visitePremierLance", premier_coup: "visitePremierCoup", premier_match: "visitePremierMatch" };
export function compterEtapePremier(envoyerParcours, etape) {
  try {
    const a = lire("visiteArrivee", null), cle = CLES_PREMIER[etape];
    if (!a || !cle || lire(cle, false) || !aCompter({ dernierJour: null, jour: "", chemin: location.pathname, hote: location.hostname })) return;
    if (ecartJours(a.jour, jourParis()) > 30) { ecrire(cle, true); return; }
    ecrire(cle, true);   // (marqué tout de suite : un seul envoi, même si on touche deux fois)
    envoyerParcours(a.origine, a.jour, etape).catch(() => ecrire(cle, false));
  } catch { /* sans réseau ou sans stockage : tant pis */ }
}
export const compterPremierMatch = envoyerParcours => compterEtapePremier(envoyerParcours, "premier_match");

// Un match terminé (étape 50 : le nombre de matchs joués chaque jour, anciens joueurs compris). envoyer(origine) : l'appel au serveur.
export function compterMatchJoue(envoyer) {
  try {
    if (!aCompter({ dernierJour: null, jour: "", chemin: location.pathname, hote: location.hostname })) return;
    envoyer(origineIci()).catch(() => {});
  } catch { /* sans réseau ou sans stockage : tant pis */ }
}

// Le 3e match joué sur ce téléphone : signalé une seule fois (envoyer(origine) : l'appel au serveur).
export function compterTroisMatchs(envoyer) {
  try {
    if (lire("visite3Matchs", false) || !aCompter({ dernierJour: null, jour: "", chemin: location.pathname, hote: location.hostname })) return;
    envoyer(origineIci()).then(() => ecrire("visite3Matchs", true)).catch(() => {});
  } catch { /* sans réseau ou sans stockage : tant pis */ }
}
