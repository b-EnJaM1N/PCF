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
export const texteFin = fin => ({ score: "", forfait: "forfait", abandon: "abandon", exempt: "exempt", tete_de_serie: "non joué : tête de série", double_forfait: "non joué" }[fin] ?? "");

// Mon match à jouer (ou null), avec mon côté et mon adversaire. En direct, les tours ne sont pas synchronisés :
// mon match peut être d'un tour plus ancien que le tour le plus avancé du tableau.
// En championnat, tous mes matchs sont jouables : d'abord celui en cours, puis celui où l'on m'attend.
export function monMatch(t, uid) {
  if (!t || t.phase !== "en_cours") return null;
  const urgence = x => !x.duel ? 2 : ["presentation", "jeu", "entre_sets"].includes(x.duel.phase) ? 0 : x.duel.phase === "attente" && x.duel.j0 !== uid ? 1 : 2;
  const m = mesMatchsRestants(t, uid).sort((a, b) => a.tour - b.tour || urgence(a) - urgence(b) || a.position - b.position)[0];
  if (!m) return null;
  const moi = m.j0?.id === uid ? 0 : 1;
  return { match: m, moi, adversaire: moi === 0 ? m.j1 : m.j0, essai: moi === 0 ? m.essai0 : m.essai1, essaiAdv: moi === 0 ? m.essai1 : m.essai0 };
}

// Mes matchs pas encore décidés.
export const mesMatchsRestants = (t, uid) => (t?.matchs || []).filter(x => !x.fin && [x.j0?.id, x.j1?.id].includes(uid));

// Les matchs rangés par tour : [[tour 1…], [tour 2…], …]
export function tableau(t) {
  const tours = [];
  for (const m of t.matchs || []) (tours[m.tour - 1] ||= []).push(m);
  return tours.map(ms => ms.sort((a, b) => a.position - b.position));
}

// Une ligne de résumé pour les listes.
export function resume(t, maintenant = Date.now()) {
  if (t.phase === "inscriptions" && t.mode === "championnat" && t.depart) return `Semaine n° ${t.edition} · inscriptions ouvertes · ${t.inscrits} joueur${t.inscrits > 1 ? "s" : ""} · départ ${texteDepart(t.depart)}`;
  if (t.phase === "inscriptions") return `Inscriptions ouvertes · ${t.inscrits} joueur${t.inscrits > 1 ? "s" : ""}`;
  if (t.phase === "annule") return "Annulé";
  if (t.phase === "termine") return t.vainqueur ? `🏆 ${t.vainqueur.pseudo}#${t.vainqueur.numero}` : "Terminé";
  const reste = texteReste(t.echeance, maintenant);
  if (t.mode === "championnat") return `${t.hebdo || t.serie ? `Semaine n° ${t.edition} · ` : ""}Championnat en cours${reste ? ` · reste ${reste}` : ""}${t.a_jouer ? " · des matchs à jouer" : ""}`;
  return `${nomTour(t.tour, t.nb_tours)}${reste ? ` · reste ${reste}` : ""}${t.a_jouer ? " · à toi de jouer !" : t.elimine ? " · parcours terminé" : ""}`;
}

// ---------------------------------------------------------------- le championnat du cercle
export const DUREES_CHAMPIONNAT = [[3, "3 jours"], [7, "1 semaine"], [14, "2 semaines"]];
export const MAX_CHAMPIONNAT = 10;   // comme _max_championnat() dans supabase/etape-35-championnat.sql
// Nombre de matchs de chaque joueur, et au total.
export const matchsParJoueur = (n, allerRetour) => (n - 1) * (allerRetour ? 2 : 1);
export const matchsTotal = (n, allerRetour) => n * (n - 1) / 2 * (allerRetour ? 2 : 1);
export const texteDureeChampionnat = minutes => (DUREES_CHAMPIONNAT.find(([j]) => j * 1440 === minutes) || [, `${Math.round(minutes / 1440)} jours`])[1];
// Le champion du cercle : le vainqueur du dernier championnat terminé (liste dans l'ordre du serveur, ou n'importe quel ordre).
export function championDuCercle(tournois) {
  const finis = (tournois || []).filter(t => t.mode === "championnat" && t.phase === "termine" && t.vainqueur);
  finis.sort((a, b) => Date.parse(b.fini_le || 0) - Date.parse(a.fini_le || 0));
  return finis[0]?.vainqueur || null;
}
// Le départ d'une édition de la semaine, à l'heure de Paris : « lundi 12 octobre à 12 h ».
export const texteDepart = depart => `${new Date(depart).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" })} à 12 h`;
// Le dernier du classement (celui qui s'y colle), ou null.
export const dernierDuClassement = classement => (classement?.length ? classement[classement.length - 1].joueur : null);

// Liens d'invitation : https://…/PCF/?tournoi=CODE
export const lienTournoi = (base, code) => `${base}?tournoi=${encodeURIComponent(code)}`;
export const codeTournoiDepuisAdresse = recherche => {
  const c = new URLSearchParams(recherche || "").get("tournoi");
  return c && /^[a-z0-9]{6,20}$/i.test(c) ? c : null;
};

// Sit & Go : durée approximative (matchs en sets de 11, 2 sets gagnants, environ 5 min chacun).
export const TAILLES_SNG = [2, 8, 16, 32, 64];   // 2 : le heads-up (un seul match)
export const dureeSng = taille => ({ 2: "5 à 10 min", 8: "15 à 20 min", 16: "20 à 25 min", 32: "25 à 35 min", 64: "30 à 40 min" }[taille] || "");

// En direct : j'ai gagné mon match et j'attends mon prochain adversaire. Renvoie null sinon, ou
// { tour (le tour de mon prochain match), voisin (le match d'où sortira mon adversaire, s'il existe), minutes (estimation) }.
export function attente(t, uid) {
  if (!t || t.phase !== "en_cours" || t.mode !== "direct" || monMatch(t, uid)) return null;
  const miens = (t.matchs || []).filter(m => [m.j0?.id, m.j1?.id].includes(uid)).sort((a, b) => b.tour - a.tour);
  const der = miens[0];
  if (!der || der.vainqueur !== uid || der.tour >= t.nb_tours) return null;
  if ((t.matchs || []).some(m => m.tour === der.tour + 1 && m.position === Math.ceil(der.position / 2))) return null;
  const pos = der.position % 2 ? der.position + 1 : der.position - 1;
  const voisin = (t.matchs || []).find(m => m.tour === der.tour && m.position === pos) || null;
  return { tour: der.tour + 1, voisin, minutes: voisin ? minutesRestantes(voisin, t) : null };
}

// Estimation grossière du temps qu'il reste à un match (en minutes, au moins 1) : environ 2 min 30 par set de 11 points.
export function minutesRestantes(m, t) {
  const parSet = 2.5 * (t.points_par_set || 11) / 11, sg = t.sets_gagnants || 2;
  const d = m.duel;
  if (!d || d.phase === "attente" || d.phase === "presentation") return Math.max(1, Math.round((sg + 0.5) * parSet + 0.5));
  const sets = d.sets || [0, 0], pts = d.points || [0, 0];
  const restants = sg - Math.max(...sets), fait = Math.min(0.9, Math.max(...pts) / (t.points_par_set || 11));
  return Math.max(1, Math.round((restants - fait) * parSet));
}
