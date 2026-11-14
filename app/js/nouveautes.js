// Les nouveautés : d'abord sur la version de test (et en local), puis ouvertes à tous, une par une.
// (10 novembre : Google demande 14 jours de test fermé de plus, avec des mises à jour qui suivent l'avis des testeurs ; le porteur
// du projet a choisi d'ouvrir les nouveautés au fil de ces 14 jours.)
//   serie : la série de jours du match du jour et ses trophées ;  fantome : le fantôme d'un ami ;  replay : le moment du set et
//   les temps forts ;  hymne : l'écran titre avec l'hymne ;  club : les objets du club et le trophée « Fondé en 2026 » ;
//   fil : le fil d'actualité du cercle et « Publier la Une » (11 novembre ; à ouvrir avec le fantôme le 13 novembre) ;
//   poules : le championnat du cercle avec poules, playoffs et playouts (11 novembre, étape SQL 66) ;
//   avis : la carte « Ton avis ? » à la fin d'un match, une seule fois après le 5e match (11 novembre) ;
//   fiche : la fiche complète d'un joueur en ligne, stats, face-à-face, historique (11 novembre, étape SQL 68).
//   records : les records du cercle, tous les duels ou les tournois seulement (13 novembre, étape SQL 74).
//   classementCercle : le classement interne du cercle (le niveau du cercle, classement-cercle.js), sans la page rangée.
//   pageCercle : la page du cercle rangée (le fil, le podium, des boutons vers Tournois, Classement, Stats et records, Inviter,
//     Gérer) et le classement interne du cercle, le niveau du cercle (14 novembre, classement-cercle.js).
//   invitations : l'organisateur d'un tournoi de cercle invite des membres (notification, « M'inscrire » ou « Non merci »)
//     (14 novembre, étape SQL 76 et fonction « Notifier » à mettre à jour).
//   effets : la main en feu (4, 6, 8 points de suite), les égalités en chaîne, le double smash avec le même signe (séisme,
//     coup de vent, étincelles) (13 novembre, effets.js ; la fissure agrandie, elle, est pour tous).
//   dossard : le Dossard 1, gant jaune du tenant du titre d'un cercle, son annonce dans le fil, le trophée de la coupe (12 novembre, étape SQL 71).
// (13 novembre, comme validé par le porteur du projet le 11 : le fantôme, le fil du cercle, le championnat avec poules, la carte
// « Ton avis ? » et la fiche d'un joueur ouverts à tous ; le Dossard 1 reste en test, décision du 12 novembre.)
// (13 novembre au soir : les effets du match ouverts à tous, testés et validés par le porteur du projet.)
// (14 novembre : le Dossard 1, avec le gant en or du FIAC Club, et les invitations aux tournois de cercle ouverts à tous, accord du porteur du projet.)
// (14 novembre, après midi : le classement interne du cercle, puis la page du cercle rangée, ouverts à tous, accord du porteur du projet.)
export const OUVERTES = new Set(["serie", "fantome", "fil", "poules", "avis", "fiche", "effets", "dossard", "invitations", "classementCercle", "pageCercle"]);

export function versionDeTest(loc = typeof location !== "undefined" ? location : null) {
  if (!loc) return false;
  return /\/preview\//.test(loc.pathname) || /^(localhost|127\.)/.test(loc.hostname);
}
export const ouvert = (nom, loc) => OUVERTES.has(nom) || versionDeTest(loc);

// La carte « Ton avis ? » (11 novembre, choix du porteur du projet) : à la fin d'un match, une seule fois, à partir du 5e match,
// si le joueur n'a pas déjà donné son avis (Options › 💬).
export const MATCHS_AVANT_AVIS = 5;
export const proposerAvis = ({ matchs = 0, dejaProposee = false, dejaDonne = false } = {}) => matchs >= MATCHS_AVANT_AVIS && !dejaProposee && !dejaDonne;
