// Les chants de supporters personnalisés (3 novembre, essai du porteur du projet avec son testeur le plus actif, d'accord pour
// que son pseudo soit chanté) : le public chante le pseudo d'un joueur, seulement dans ses matchs (contre un bot, et en duel,
// où son adversaire l'entend aussi) : au début de ses matchs, et à la pause entre les sets en alternance avec les chants habituels.
// Fichiers créés avec ElevenLabs Music, dans app/audio/. Piste pour une offre premium.

// « pseudo#numero » (en minuscules) → les fichiers de ses chants.
export const CHANTS_PERSO = {
  "le chiromancien#6047": ["chant_perso_chiromancien_01", "chant_perso_chiromancien_02", "chant_perso_chiromancien_03", "chant_perso_chiromancien_04", "chant_perso_chiromancien_05"],
  "benja-main#3528": ["chant_perso_benjamain_01", "chant_perso_benjamain_02"],   // (le porteur du projet, 6 novembre)
  "kikou#1743": ["chant_perso_kikou_01"],   // (un testeur, 10 novembre)
};

// Les cris courts (« Allez le Chiromancien ! »), pendant le match, aux moments forts (une balle de set ou de match sauvée).
export const COURTS_PERSO = {
  "le chiromancien#6047": ["cri_perso_chiromancien_01"],
};

export const clePseudo = (pseudo, numero) => (pseudo && numero ? `${String(pseudo).trim().toLowerCase()}#${numero}` : null);
// Les chants des joueurs du match ({ pseudo, numero } ou null).
// En duel entre deux joueurs qui ont leurs chants, les deux listes alternent (un chant de l'un, un chant de l'autre…) : chacun
// entend aussi le chant de son adversaire (6 novembre, demande du porteur du projet). Seulement entre amis : entre inconnus
// (partie rapide, tournois…), chacun n'entend que ses chants à lui (joueursDuMatch, dans app.js).
export const chantsPerso = (...joueurs) => {
  const listes = joueurs.map(j => (j ? CHANTS_PERSO[clePseudo(j.pseudo, j.numero)] || [] : [])), l = [];
  for (let i = 0; i < Math.max(0, ...listes.map(x => x.length)); i++) for (const x of listes) if (x[i]) l.push(x[i]);
  return l;
};
export const courtsPerso = (...joueurs) => joueurs.flatMap(j => (j ? COURTS_PERSO[clePseudo(j.pseudo, j.numero)] || [] : []));
// Le joueur du match que le public soutient (le premier qui a des chants), ou null : pour les répliques (« pour lui », « pour elle »).
export const soutenu = (...joueurs) => joueurs.find(j => j && CHANTS_PERSO[clePseudo(j.pseudo, j.numero)]) || null;

// En duel, les deux téléphones font le même tirage pour les chants (6 novembre) : un nombre tiré du numéro du duel et du moment,
// et les deux joueurs rangés dans le même ordre (par pseudo) des deux côtés.
export const hashTexte = t => { let h = 2166136261; for (const c of String(t)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
export const chantsPersoCommuns = (...joueurs) => chantsPerso(...joueurs.filter(Boolean).sort((x, y) => (clePseudo(x.pseudo, x.numero) < clePseudo(y.pseudo, y.numero) ? -1 : 1)));
