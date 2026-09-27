// Tournois en ligne : ce que le téléphone déduit de l'état envoyé par le serveur.
// Aucune connexion réseau ici : ces fonctions sont testées automatiquement.

// Nom d'un tour d'après le nombre de tours restants : « Finale », « Demi-finales »…
const TOURS = [["Finale", "la finale", "ta finale"], ["Demi-finales", "une demi-finale", "ta demi-finale"],
  ["Quarts de finale", "un quart de finale", "ton quart de finale"], ["Huitièmes de finale", "un huitième de finale", "ton huitième de finale"],
  ["Seizièmes de finale", "un seizième de finale", "ton seizième de finale"]];
export const nomTour = (tour, nbTours) => (TOURS[nbTours - tour] || [`Tour ${tour}`])[0];
export const monTour = (tour, nbTours) => (TOURS[nbTours - tour] || [, , `ton match du tour ${tour}`])[2];

export const DUREES = [[15, "15 min"], [60, "1 h"], [1440, "24 h"], [4320, "3 jours"]];
export const texteDuree = minutes => (DUREES.find(([m]) => m === minutes) || [, `${minutes} min`])[1];

// Temps restant avant la date limite : « 12 min », « 3 h 05 », « 2 j 4 h », ou null si c'est passé.
export function texteReste(echeance, maintenant = Date.now()) {
  if (!echeance) return null;
  const s = Math.floor((new Date(echeance).getTime() - maintenant) / 1000);
  if (s <= 0) return null;
  if (s < 60) return `${s} s`;
  const min = Math.floor(s / 60), h = Math.floor(min / 60), j = Math.floor(h / 24);
  if (h < 1) return `${min} min`;
  if (j < 1) return `${h} h ${String(min % 60).padStart(2, "0")}`;
  return `${j} j ${h % 24} h`;
}

// Comment un match a été décidé.
export const texteFin = fin => ({ score: "", forfait: "forfait", abandon: "abandon", exempt: "exempt", tete_de_serie: "non joué : tête de série" }[fin] ?? "");

// Mon match du tour en cours (ou null), avec mon côté et mon adversaire.
export function monMatch(t, uid) {
  if (!t || t.phase !== "en_cours") return null;
  const m = (t.matchs || []).find(x => x.tour === t.tour && !x.fin && [x.j0?.id, x.j1?.id].includes(uid));
  if (!m) return null;
  const moi = m.j0?.id === uid ? 0 : 1;
  return { match: m, moi, adversaire: moi === 0 ? m.j1 : m.j0, essai: moi === 0 ? m.essai0 : m.essai1, essaiAdv: moi === 0 ? m.essai1 : m.essai0 };
}

// Les matchs rangés par tour : [[tour 1…], [tour 2…], …]
export function tableau(t) {
  const tours = [];
  for (const m of t.matchs || []) (tours[m.tour - 1] ||= []).push(m);
  return tours.map(ms => ms.sort((a, b) => a.position - b.position));
}

// Une ligne de résumé pour les listes.
export function resume(t, maintenant = Date.now()) {
  if (t.phase === "inscriptions") return `Inscriptions ouvertes · ${t.inscrits} joueur${t.inscrits > 1 ? "s" : ""}`;
  if (t.phase === "annule") return "Annulé";
  if (t.phase === "termine") return t.vainqueur ? `🏆 ${t.vainqueur.pseudo}#${t.vainqueur.numero}` : "Terminé";
  const reste = texteReste(t.echeance, maintenant);
  return `${nomTour(t.tour, t.nb_tours)}${reste ? ` · reste ${reste}` : ""}${t.a_jouer ? " · à toi de jouer !" : t.elimine ? " · parcours terminé" : ""}`;
}

// Liens d'invitation : https://…/PCF/?tournoi=CODE
export const lienTournoi = (base, code) => `${base}?tournoi=${encodeURIComponent(code)}`;
export const codeTournoiDepuisAdresse = recherche => {
  const c = new URLSearchParams(recherche || "").get("tournoi");
  return c && /^[a-z0-9]{6,20}$/i.test(c) ? c : null;
};
