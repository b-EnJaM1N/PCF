// Les messages rapides : un mot à l'adversaire avant le duel (pendant la présentation), un entre chaque set (pendant la pause,
// étape 53) et un après (sur l'écran de fin).
// Des phrases toutes faites ; entre amis seulement, on peut aussi écrire le sien (décision du 22 octobre, étape 48),
// avec les garde-fous de l'enjeu : court, sans gros mots, sans argent, sans lien.
// « tous » : avec n'importe quel joueur ; « amis » (le chambrage) : seulement si l'adversaire est un ami dans l'appli.
// Les mêmes identifiants sont vérifiés par le serveur (supabase/etape-22-messages-rapides.sql ; un test vérifie qu'ils sont identiques).
import { MOTS_INTERDITS, ARGENT, LIEN, sansAccents } from "./enjeux.js";

// Les annonces (décision du 1er novembre) : du bluff ou de la vérité, au début de chaque set (avant le match et entre les sets),
// avec n'importe quel joueur.
const ANNONCES = [
  ["ouvre_p", "J'ouvre avec Pierre."], ["ouvre_f", "J'ouvre avec Feuille."], ["ouvre_c", "J'ouvre avec Ciseaux."],
  ["sais_p", "Je sais : tu ouvres avec Pierre."], ["sais_f", "Je sais : tu ouvres avec Feuille."], ["sais_c", "Je sais : tu ouvres avec Ciseaux."],
  ["pas_p", "Ne joue pas Pierre."], ["pas_f", "Ne joue pas Feuille."], ["pas_c", "Ne joue pas Ciseaux."],
  ["joue_p", "Joue Pierre !"], ["joue_f", "Joue Feuille !"], ["joue_c", "Joue Ciseaux !"],
];

export const MESSAGES = {
  avant: {
    annonces: ANNONCES,
    tous: [
      ["bonne_chance", "Bonne chance !"], ["bon_match", "Bon match !"], ["meilleur_gagne", "Que le meilleur gagne !"],
      ["a_toi", "À toi de jouer !"], ["bon_duel", "Je te souhaite un bon duel !"], ["on_y_va", "On y va ?"],
    ],
    amis: [
      ["besoin", "Bonne chance… tu en auras besoin."], ["par_coeur", "Je te connais par cœur."], ["fumer", "Je vais te fumer."],
      ["slip", "Tu vas finir en slip."], ["souffrir", "Prépare-toi à souffrir."], ["pleurer", "Tu vas pleurer."],   // (pleurer : étape 67)
    ],
  },
  // Pendant la pause entre deux sets (étape 53).
  entre_sets: {
    annonces: ANNONCES,
    tous: [
      ["set_bien_joue", "Bien joué ce set !"], ["pas_fini", "Ce n'est pas fini !"], ["on_y_retourne", "Allez, on y retourne !"],
      ["beau_set", "Beau set !"], ["concentre", "Je reste concentré."],
    ],
    amis: [
      ["regretter", "Tu vas regretter ce set."], ["echauffement", "C'était l'échauffement."], ["vrai_match", "Le vrai match commence."],
      ["profite", "Profite, ça ne durera pas."], ["chaud", "Je commence à peine à chauffer."],
    ],
  },
  vainqueur: {
    tous: [
      ["merci_match", "Merci pour le match !"], ["beau_duel", "Beau duel !"], ["toi_aussi", "Bien joué à toi aussi !"],
      ["serre", "C'était serré !"], ["revanche", "Revanche quand tu veux !"], ["gg", "GG !"],
    ],
    amis: [["et_oui", "Et oui !!!"], ["boss", "C'est qui le boss ?"], ["regles", "Tu connais les règles ?"]],
    // Retirés le 11 novembre (demande du porteur du projet) : plus proposés, mais encore affichés s'ils arrivent d'une ancienne
    // version de l'appli (le serveur les accepte toujours : étape 53).
    retires: [["ton_pere", "Je suis ton père !"], ["padawan", "Bien joué jeune padawan."], ["deculottee", "Déculottée !"]],
  },
  vaincu: {
    tous: [
      ["bien_joue", "Bien joué !"], ["bravo", "Bravo !"], ["beau_duel", "Beau duel !"],
      ["bravo_victoire", "Bravo pour ta victoire !"], ["merci_duel", "Merci pour le duel !"], ["meritee", "Victoire méritée !"],
    ],
    amis: [["laisse_gagner", "Je t'ai laissé gagner."], ["une_main", "Je jouais d'une main."], ["bug", "J'ai eu un bug."], ["tactile", "Mon tactile déconne."]],
    retires: [["chatoune", "Quelle chatoune !"], ["faux_rebond", "Il y avait un faux rebond !"]],   // (11 novembre, voir plus haut)
  },
};

export const LONGUEUR_MAX = 35;

// Les messages proposés à ce moment-là ({ id, texte, amis, annonce }) : les annonces, les messages tout public, puis le chambrage
// entre amis. (Pour le serveur, les annonces font partie des messages tout public.)
export function messagesPossibles(moment, ami = false) {
  const m = MESSAGES[moment];
  if (!m) return [];
  return [...(m.annonces || []).map(([id, texte]) => ({ id, texte, amis: false, annonce: true })),
    ...m.tous.map(([id, texte]) => ({ id, texte, amis: false })), ...(ami ? m.amis.map(([id, texte]) => ({ id, texte, amis: true })) : [])];
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
  const x = m && [...(m.annonces || []), ...m.tous, ...m.amis, ...(m.retires || [])].find(([i]) => i === id);
  return x ? x[1] : null;
}
