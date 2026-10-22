// Les messages rapides : un mot à l'adversaire avant le duel (pendant la présentation) et un après (sur l'écran de fin).
// Des phrases toutes faites ; entre amis seulement, on peut aussi écrire le sien (décision du 22 octobre, étape 48),
// avec les garde-fous de l'enjeu : court, sans gros mots, sans argent, sans lien.
// « tous » : avec n'importe quel joueur ; « amis » (le chambrage) : seulement si l'adversaire est un ami dans l'appli.
// Les mêmes identifiants sont vérifiés par le serveur (supabase/etape-22-messages-rapides.sql ; un test vérifie qu'ils sont identiques).
import { MOTS_INTERDITS, ARGENT, LIEN, sansAccents } from "./enjeux.js";

export const MESSAGES = {
  avant: {
    tous: [
      ["bonne_chance", "Bonne chance !"], ["bon_match", "Bon match !"], ["meilleur_gagne", "Que le meilleur gagne !"],
      ["a_toi", "À toi de jouer !"], ["bon_duel", "Je te souhaite un bon duel !"], ["on_y_va", "On y va ?"],
    ],
    amis: [
      ["besoin", "Bonne chance… tu en auras besoin."], ["par_coeur", "Je te connais par cœur."], ["fumer", "Je vais te fumer."],
      ["slip", "Tu vas finir en slip."], ["souffrir", "Prépare-toi à souffrir."],
    ],
  },
  vainqueur: {
    tous: [
      ["merci_match", "Merci pour le match !"], ["beau_duel", "Beau duel !"], ["toi_aussi", "Bien joué à toi aussi !"],
      ["serre", "C'était serré !"], ["revanche", "Revanche quand tu veux !"], ["gg", "GG !"],
    ],
    amis: [
      ["et_oui", "Et oui !!!"], ["boss", "C'est qui le boss ?"], ["ton_pere", "Je suis ton père !"],
      ["padawan", "Bien joué jeune padawan."], ["regles", "Tu connais les règles ?"], ["deculottee", "Déculottée !"],
    ],
  },
  vaincu: {
    tous: [
      ["bien_joue", "Bien joué !"], ["bravo", "Bravo !"], ["beau_duel", "Beau duel !"],
      ["bravo_victoire", "Bravo pour ta victoire !"], ["merci_duel", "Merci pour le duel !"], ["meritee", "Victoire méritée !"],
    ],
    amis: [
      ["chatoune", "Quelle chatoune !"], ["laisse_gagner", "Je t'ai laissé gagner."], ["une_main", "Je jouais d'une main."],
      ["bug", "J'ai eu un bug."], ["faux_rebond", "Il y avait un faux rebond !"], ["tactile", "Mon tactile déconne."],
    ],
  },
};

export const LONGUEUR_MAX = 35;

// Les messages proposés à ce moment-là ({ id, texte, amis }) : les messages tout public, puis le chambrage entre amis.
export function messagesPossibles(moment, ami = false) {
  const m = MESSAGES[moment];
  if (!m) return [];
  return [...m.tous.map(([id, texte]) => ({ id, texte, amis: false })), ...(ami ? m.amis.map(([id, texte]) => ({ id, texte, amis: true })) : [])];
}

// Le moment d'un message après le match, selon le résultat.
export const momentApres = gagne => (gagne ? "vainqueur" : "vaincu");

// Le message écrit soi-même (entre amis) : il voyage avec ce préfixe (« libre:Rendez-vous dimanche ! »).
export const PREFIXE_LIBRE = "libre:", MESSAGE_LIBRE_MAX = 60;
export const nettoyerMessage = t => String(t ?? "").replace(/\s+/g, " ").trim();
// null si le message écrit est accepté, sinon la raison du refus (mêmes règles que le serveur, étape 48).
export function erreurMessageLibre(brut) {
  const t = nettoyerMessage(brut);
  if (t.length < 2) return "Le message est trop court.";
  if (t.length > MESSAGE_LIBRE_MAX) return `Le message est trop long (${MESSAGE_LIBRE_MAX} caractères au plus).`;
  if (ARGENT.test(sansAccents(t))) return "Pas d'argent dans un message.";
  if (LIEN.test(t)) return "Pas de lien dans un message.";
  if (sansAccents(t).toLowerCase().split(/[^a-z0-9]+/).some(m => MOTS_INTERDITS.includes(m))) return "Ce message contient un mot interdit.";
  return null;
}

// Le texte d'un message reçu (null s'il est inconnu : version de l'appli plus ancienne que celle de l'adversaire).
export function texteMessage(moment, id) {
  if (typeof id === "string" && id.startsWith(PREFIXE_LIBRE)) return id.slice(PREFIXE_LIBRE.length);
  const m = MESSAGES[moment];
  const x = m && [...m.tous, ...m.amis].find(([i]) => i === id);
  return x ? x[1] : null;
}
