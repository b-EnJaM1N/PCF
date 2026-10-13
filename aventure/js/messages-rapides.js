// Les messages rapides : un mot à l'adversaire avant le duel (pendant la présentation) et un après (sur l'écran de fin).
// Des phrases toutes faites, rien à écrire : pas de modération nécessaire.
// « tous » : avec n'importe quel joueur ; « amis » (le chambrage) : seulement si l'adversaire est un ami dans l'appli.
// Les mêmes identifiants sont vérifiés par le serveur (supabase/etape-22-messages-rapides.sql ; un test vérifie qu'ils sont identiques).

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

// Le texte d'un message reçu (null s'il est inconnu : version de l'appli plus ancienne que celle de l'adversaire).
export function texteMessage(moment, id) {
  const m = MESSAGES[moment];
  const x = m && [...m.tous, ...m.amis].find(([i]) => i === id);
  return x ? x[1] : null;
}
