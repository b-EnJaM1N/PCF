// Les tournois programmés (supabase/etape-18-tournois-programmes.sql) : ce que le téléphone déduit de l'état du serveur.
// Aucune connexion réseau ici : ces fonctions sont testées automatiquement.

// Le programme, pour l'affichage (le serveur fait foi : heures de Paris, entrées, garantie).
export const PROGRAMME = [
  { cle: "midi", icone: "🥪", nom: "Le Midi", quand: "Tous les jours à 12 h 30", mise: 100 },
  { cle: "apero", icone: "🌆", nom: "L'Apéro", quand: "Tous les jours à 18 h", mise: 100 },
  { cle: "nocturne", icone: "🌙", nom: "Le Nocturne", quand: "Du lundi au samedi à 21 h 30", mise: 200 },
  { cle: "grand_chelem", icone: "🏆", nom: "Le Grand Chelem", quand: "Le dimanche à 21 h", mise: 1000, garantie: 5000 },
];
export const icone = cle => PROGRAMME.find(p => p.cle === cle)?.icone || "🗓️";

const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const paris = d => {
  const p = Object.fromEntries(new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })
    .formatToParts(d).map(x => [x.type, x.value]));
  return { jour: `${p.year}-${p.month}-${p.day}`, h: Number(p.hour) % 24, m: p.minute };
};

// « aujourd'hui à 12 h 30 », « demain à 18 h », « dimanche à 21 h » (heure de Paris).
export function texteDepart(depart, maintenant = Date.now()) {
  const d = new Date(depart), a = paris(d), n = paris(new Date(maintenant));
  const heure = `${a.h} h${a.m === "00" ? "" : ` ${a.m}`}`;
  const ecart = Math.round((Date.parse(`${a.jour}T12:00:00Z`) - Date.parse(`${n.jour}T12:00:00Z`)) / 86400000);
  const jour = ecart === 0 ? "aujourd'hui" : ecart === 1 ? "demain" : JOURS[new Date(`${a.jour}T12:00:00Z`).getUTCDay()];
  return `${jour} à ${heure}`;
}

// Les gains d'après la cagnotte : 50 % au 1er, 30 % au 2e, 10 % aux deux demi-finalistes.
export const gainsCagnotte = c => [0.5, 0.3, 0.1].map(p => Math.floor(c * p));

// Faut-il surveiller ce tournoi de près (signe de vie fréquent) ? Inscrit, départ dans moins de 3 minutes, ou en lice.
export const enJeu = (t, maintenant = Date.now()) => !!t?.inscrit && (t.phase === "en_cours" ? !t.elimine
  : t.phase === "inscriptions" && Date.parse(t.depart) - maintenant < 3 * 60000);

// Le tournoi qui mérite une alerte en haut du menu Jouer : inscrit, départ dans moins de 30 minutes, ou en lice.
export function aSignaler(tournois = [], maintenant = Date.now()) {
  return tournois.find(t => t.inscrit && ((t.phase === "inscriptions" && Date.parse(t.depart) - maintenant < 30 * 60000)
    || (t.phase === "en_cours" && !t.elimine))) || null;
}
