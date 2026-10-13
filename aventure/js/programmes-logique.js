// Les tournois programmés (supabase/etape-18-tournois-programmes.sql) : ce que le téléphone déduit de l'état du serveur.
// Aucune connexion réseau ici : ces fonctions sont testées automatiquement.

// Le programme, pour l'affichage (le serveur fait foi : heures de Paris, entrées, garantie, et les tournois actifs :
// depuis l'étape 21, seulement le Grand Chelem ; les autres sont en pause en attendant plus de joueurs).
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

// Les dotations, façon poker : on paie environ 10 à 15 % des joueurs (au moins les 2 finalistes), et le plus petit gain
// vaut au moins 1,5 fois l'entrée. En élimination directe, les places payées vont par tour : 1er, 2e, 3e-4e (demi-finales),
// 5e-8e (quarts)… Chaque palier : la part de la cagnotte (en dix-millièmes) pour CHAQUE joueur du palier.
// La même grille est dans le serveur (supabase/etape-19-dotations.sql ; un test vérifie qu'elles sont identiques).
export const GRILLES = {
  2: [6500, 3500],
  4: [5000, 2500, 1250],
  8: [4000, 2200, 1100, 400],
  16: [3200, 1800, 900, 450, 175],
  32: [2612, 1500, 750, 375, 175, 93],
  64: [2280, 1300, 650, 320, 160, 80, 40],
};
const PLACES = ["1er", "2e", "3e-4e", "5e-8e", "9e-16e", "17e-32e", "33e-64e"];
// Combien de places payées pour n joueurs : la plus grande puissance de 2 qui ne dépasse pas 15 % des joueurs (de 2 à 64).
export function placesPayees(n) {
  let p = 2;
  while (p < 64 && p * 2 <= 0.15 * n) p *= 2;
  return p;
}
// [{ places: "1er", nb: 1, montant }, { places: "3e-4e", nb: 2, montant (chacun) }, …]
export const dotations = (cagnotte, n) => GRILLES[placesPayees(n)].map((bp, k) => ({
  places: PLACES[k], nb: k < 2 ? 1 : 2 ** (k - 1), montant: Math.floor((cagnotte * bp) / 10000),
}));
// « 8 premiers payés · 1er : 1 944, 2e : 1 069, 3e-4e : 534, 5e-8e : 194 »
export const texteDotations = (cagnotte, n) => `${placesPayees(n)} premiers payés · `
  + dotations(cagnotte, n).map(d => `${d.places} : ${d.montant.toLocaleString("fr-FR").replace(/\s/g, "\u00a0")}`).join(", ");

// Faut-il surveiller ce tournoi de près (signe de vie fréquent) ? Inscrit, départ dans moins de 3 minutes, ou en lice.
export const enJeu = (t, maintenant = Date.now()) => !!t?.inscrit && (t.phase === "en_cours" ? !t.elimine
  : t.phase === "inscriptions" && Date.parse(t.depart) - maintenant < 3 * 60000);

// Le tournoi qui mérite une alerte en haut du menu Jouer : inscrit, départ dans moins de 30 minutes, ou en lice.
export function aSignaler(tournois = [], maintenant = Date.now()) {
  return tournois.find(t => t.inscrit && ((t.phase === "inscriptions" && Date.parse(t.depart) - maintenant < 30 * 60000)
    || (t.phase === "en_cours" && !t.elimine))) || null;
}
