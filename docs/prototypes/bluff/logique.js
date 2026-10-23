// Le Bluff (Chifoumania) : les règles et l'ordinateur, sans rien à l'écran (testé par tests/bluff.test.js).
// Signes : 0 Pierre, 1 Feuille, 2 Ciseaux. Une main = [pierres, feuilles, ciseaux].
// Règles des essais (docs/mini-jeux.md) : paquet de 21 cartes (7 de chaque), 5 cartes chacun ; le Caché garde ses cartes
// fermées et parle en premier ; l'Ouvert montre 2, puis 3, puis 4 cartes de son choix ; le paquet dévoile 3, puis 2, puis 1 carte ;
// après chaque dévoilement, un tour de mises « no limit » façon Texas Hold'em (100 jetons chacun ; blinds 1 et 2 :
// l'Ouvert paie la petite, le Caché la grosse ; au 1er tour l'Ouvert parle en premier, ensuite le Caché) ; abattage : duel en 3 coups.
import { FORCE, STRAT } from "./tables.js";

export const PAR_SIGNE = 7, CARTES = 5;
export const MONTRE = [2, 3, 4];            // cartes de l'Ouvert visibles après chaque tour
export const PAQUET_VU = [3, 5, 6];         // cartes du paquet dévoilées (3, puis 2, puis 1)
export const JETONS_DEPART = 100;
// les blinds montent toutes les DONNES_PAR_NIVEAU donnes (comme en tournoi), pour qu'une partie finisse
export const BLINDS = [[1, 2], [2, 4], [3, 6], [5, 10], [10, 20], [15, 30], [25, 50], [50, 100]];
export const DONNES_PAR_NIVEAU = 8;
export const blindsDe = donne => BLINDS[Math.min(BLINDS.length - 1, Math.floor((donne - 1) / DONNES_PAR_NIVEAU))];
export const NOMS = ["Pierre", "Feuille", "Ciseaux"];
export const bat = (a, b) => (a === 0 && b === 2) || (a === 2 && b === 1) || (a === 1 && b === 0);
export const resultat = (a, b) => (a === b ? 0 : bat(a, b) ? 1 : -1);

const plus = (a, b) => a.map((x, k) => x + b[k]);
const moins = (a, b) => a.map((x, k) => x - b[k]);
export const compte = cartes => [0, 1, 2].map(s => cartes.filter(c => c === s).length);
export const cle = m => m.join("");
export const force = (moi, lui) => FORCE[cle(moi) + cle(lui)];

const FACT = [1];
for (let i = 1; i <= 25; i++) FACT[i] = FACT[i - 1] * i;
const comb = (n, k) => (k < 0 || k > n ? 0 : FACT[n] / (FACT[k] * FACT[n - k]));
// toutes les répartitions de n cartes en 3 signes
export function repartitions(n) {
  const out = [];
  for (let p = 0; p <= n; p++) for (let f = 0; f <= n - p; f++) out.push([p, f, n - p - f]);
  return out;
}
// n cartes tirées au hasard parmi « reste » : chaque répartition possible et sa probabilité
export function tirages(reste, n) {
  const tot = comb(reste[0] + reste[1] + reste[2], n);
  if (!tot) return [];
  return repartitions(n)
    .map(x => [x, comb(reste[0], x[0]) * comb(reste[1], x[1]) * comb(reste[2], x[2]) / tot])
    .filter(([, p]) => p > 0);
}

// ---------------------------------------------------------------- une donne
export function melanger(rng = Math.random) {
  const p = [];
  for (let s = 0; s < 3; s++) for (let i = 0; i < PAR_SIGNE; i++) p.push(s);
  for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  return p;
}
export function nouvelleDonne(rng = Math.random) {
  const p = melanger(rng);
  return { cache: p.slice(0, 5), ouvert: p.slice(5, 10), paquet: p.slice(10) };
}

// ---------------------------------------------------------------- ce que chacun sait
// Les cartes qu'un joueur ne voit pas (ni dans sa main, ni montrées, ni dévoilées du paquet, ni déjà jouées par l'autre).
export function inconnues({ main, vuAdverse = [0, 0, 0], paquetVu = [0, 0, 0] }) {
  return moins(moins(moins([PAR_SIGNE, PAR_SIGNE, PAR_SIGNE], main), vuAdverse), paquetVu);
}
// La force estimée de sa main (de -1 à 1) : moyenne sur toutes les mains adverses possibles.
// vuAdverse : les cartes adverses connues (montrées) ; il en reste CARTES - vues à deviner parmi les inconnues.
export function forceEstimee(main, vuAdverse, paquetVu) {
  const reste = inconnues({ main, vuAdverse, paquetVu });
  const n = CARTES - vuAdverse.reduce((a, b) => a + b, 0);
  let e = 0;
  for (const [x, p] of tirages(reste, n)) e += p * force(main, plus(vuAdverse, x));
  return e;
}

// ---------------------------------------------------------------- l'ordinateur : ses caractères
export const CARACTERES = {
  prudent: { nom: "La Prudente", emoji: "🦉", bluff: 0.05, seuil: 0.28, desc: "Mise seulement avec une bonne main, bluffe très peu." },
  malin: { nom: "Le Malin", emoji: "🦊", bluff: 0.2, seuil: 0.2, desc: "Mise selon sa main et bluffe de temps en temps." },
  bluffeur: { nom: "Le Bluffeur", emoji: "🃏", bluff: 0.45, seuil: 0.15, desc: "Mise souvent, bluffe beaucoup." },
};
// ---------------------------------------------------------------- les mises « no limit »
// Les montants sont en jetons ajoutés maintenant.
// aPayer : ce qu'il faut ajouter pour suivre ; pot : tout ce qu'il y a au milieu ; min : le minimum à ajouter pour relancer
// (suivre + la dernière relance, ou la grosse blind) ; max : le maximum qu'on peut ajouter (son tapis, limité au tapis de l'autre).
export function bornesRelance({ aPayer, min, max }) {
  if (max <= aPayer) return null;                 // on ne peut que suivre (ou se coucher)
  return { min: Math.min(min, max), max };        // si le minimum dépasse le tapis : tapis
}
// L'ordinateur décide : { action: "couche" | "parole" | "suit" | "relance", montant (jetons ajoutés) }.
// relances : combien de fois il a déjà relancé dans ce tour (au plus 2).
export function iaDecide(car, e, { aPayer, pot, min, max, relances = 0 }, rng = Math.random) {
  const p = (1 + e) / 2, bornes = relances < 2 ? bornesRelance({ aPayer, min, max }) : null;
  const relance = combien => ({ action: "relance", montant: Math.round(Math.max(bornes.min, Math.min(bornes.max, combien))) });
  if (aPayer === 0) {
    if (bornes && e > car.seuil) return relance(pot * (e > car.seuil + 0.4 ? 1 : e > car.seuil + 0.2 ? 0.75 : 0.5));
    if (bornes && rng() < car.bluff) return relance(pot * 0.5);
    return { action: "parole", montant: 0 };
  }
  if (bornes && e > car.seuil + 0.3) return relance(aPayer + pot);            // grosse main : relance de la taille du pot
  if (p * pot - (1 - p) * aPayer > 0) return { action: "suit", montant: Math.min(aPayer, max) };   // la cote est bonne
  if (bornes && rng() < car.bluff * 0.4) return relance(aPayer + pot * 0.75); // relance de bluff
  return { action: "couche", montant: 0 };
}
// L'ordinateur Ouvert choisit la carte qu'il garde cachée et l'ordre dans lequel il montre les autres.
export function iaDevoile(main, rng = Math.random) {
  const ordre = [...main.keys()];
  for (let i = ordre.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [ordre[i], ordre[j]] = [ordre[j], ordre[i]]; }
  return ordre;   // les 4 premiers seront montrés dans cet ordre, le dernier reste caché
}

// ---------------------------------------------------------------- l'abattage : duel en 3 coups
// La stratégie exacte (tables) quand on connaît la main de l'autre.
export const strategie = (moi, lui, coups, ecart) => STRAT[cle(moi) + cle(lui) + coups + (ecart >= 0 ? "+" : "") + ecart];
// L'ordinateur ne connaît pas toujours la main de l'autre : il fait la moyenne des stratégies exactes
// sur toutes les mains adverses possibles (pondérées par leur probabilité), puis tire son signe.
// connu : cartes adverses connues au départ du duel (montrées) ; joueesAdverse : cartes que l'autre a déjà jouées dans le duel.
export function iaJoue({ reste, connu, paquetVu, mainDepart, joueesAdverse, coups, ecart }, rng = Math.random) {
  const inconnu = inconnues({ main: mainDepart, vuAdverse: connu, paquetVu });
  const n = CARTES - connu.reduce((a, b) => a + b, 0);
  const moy = [0, 0, 0]; let tot = 0;
  for (const [x, p] of tirages(inconnu, n)) {
    const depart = plus(connu, x), restant = moins(depart, joueesAdverse);
    if (restant.some(v => v < 0)) continue;                 // incompatible avec ce qu'il a déjà joué
    const s = strategie(reste, restant, coups, ecart);
    if (!s) continue;
    s.forEach((q, i) => { moy[i] += p * q; }); tot += p;
  }
  // jamais un signe qu'on n'a plus
  for (let i = 0; i < 3; i++) if (!reste[i]) moy[i] = 0;
  const somme = moy.reduce((a, b) => a + b, 0);
  if (!tot || somme <= 0) return [0, 1, 2].find(i => reste[i] > 0);
  let t = rng() * somme;
  for (let i = 0; i < 3; i++) { if (t < moy[i]) return i; t -= moy[i]; }
  return [2, 1, 0].find(i => reste[i] > 0);
}
