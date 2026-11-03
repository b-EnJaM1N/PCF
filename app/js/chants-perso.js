// Les chants de supporters personnalisés (3 novembre, essai du porteur du projet avec son testeur le plus actif, d'accord pour
// que son pseudo soit chanté) : le public chante le pseudo d'un joueur, seulement dans ses matchs (contre un bot, et en duel,
// où son adversaire l'entend aussi). Fichiers créés avec ElevenLabs Music, dans app/audio/. Piste pour une offre premium.

// « pseudo#numero » (en minuscules) → les fichiers de ses chants.
export const CHANTS_PERSO = {
  "le chiromancien#6047": ["chant_perso_chiromancien_01", "chant_perso_chiromancien_02", "chant_perso_chiromancien_03"],
};

export const clePseudo = (pseudo, numero) => (pseudo && numero ? `${String(pseudo).trim().toLowerCase()}#${numero}` : null);
// Les chants des joueurs du match ({ pseudo, numero } ou null).
export const chantsPerso = (...joueurs) => joueurs.flatMap(j => (j ? CHANTS_PERSO[clePseudo(j.pseudo, j.numero)] || [] : []));
