// Script des annonces et commentaires.
//
// Chaque réplique a un identifiant qui est AUSSI le nom de son fichier audio :
//   commentateur_craquage_02  →  app/audio/commentateur_craquage_02.mp3
// Tant que le fichier n'existe pas, la réplique est lue par la voix de
// synthèse du téléphone. Nom = qui parle _ situation _ numéro de version.
//
// L'arbitre ne prononce jamais de pseudo : il nomme les joueurs par leur
// côté (« côté jaune », « côté rouge »), pour que tout puisse être enregistré.

const NOMBRES = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix",
  "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf", "vingt",
  "vingt et un", "vingt-deux", "vingt-trois", "vingt-quatre", "vingt-cinq", "vingt-six", "vingt-sept",
  "vingt-huit", "vingt-neuf", "trente"];
export const enLettres = n => NOMBRES[n] ?? String(n);
// Version sans accents ni espaces, pour les noms de fichiers.
export const slug = t => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const maj = t => t.charAt(0).toUpperCase() + t.slice(1);

export const ORDINAUX = ["premier", "deuxième", "troisième", "quatrième", "cinquième"];

// ---------------------------------------------------------------- arbitre
// Répliques fixes, écrites à la main.
const ARBITRE = {
  arbitre_premier_set_01: "Premier set.",
  arbitre_deuxieme_set_01: "Deuxième set.",
  arbitre_troisieme_set_01: "Troisième set.",
  arbitre_quatrieme_set_01: "Quatrième set.",
  arbitre_set_decisif_01: "Set décisif.",
  arbitre_balle_de_set_jaune_01: "Balle de set, côté jaune.",
  arbitre_balle_de_set_rouge_01: "Balle de set, côté rouge.",
  arbitre_balle_de_match_jaune_01: "Balle de match, côté jaune.",
  arbitre_balle_de_match_rouge_01: "Balle de match, côté rouge.",
  arbitre_premier_set_jaune_01: "Premier set remporté par le côté jaune.",
  arbitre_premier_set_rouge_01: "Premier set remporté par le côté rouge.",
  arbitre_deuxieme_set_jaune_01: "Deuxième set remporté par le côté jaune.",
  arbitre_deuxieme_set_rouge_01: "Deuxième set remporté par le côté rouge.",
  arbitre_troisieme_set_jaune_01: "Troisième set remporté par le côté jaune.",
  arbitre_troisieme_set_rouge_01: "Troisième set remporté par le côté rouge.",
  arbitre_quatrieme_set_jaune_01: "Quatrième set remporté par le côté jaune.",
  arbitre_quatrieme_set_rouge_01: "Quatrième set remporté par le côté rouge.",
  arbitre_jeu_set_et_match_jaune_01: "Jeu, set et match, côté jaune.",
  arbitre_jeu_set_et_match_rouge_01: "Jeu, set et match, côté rouge.",
  arbitre_sets_deux_a_zero_01: "Deux sets à zéro.",
  arbitre_sets_deux_a_un_01: "Deux sets à un.",
  arbitre_sets_trois_a_zero_01: "Trois sets à zéro.",
  arbitre_sets_trois_a_un_01: "Trois sets à un.",
  arbitre_sets_trois_a_deux_01: "Trois sets à deux.",
};

// Répliques de l'arbitre construites à partir d'un score.
export const scoreSet = (g, p) => ({ id: `arbitre_score_${slug(enLettres(g))}_a_${slug(enLettres(p))}_01`, texte: `${maj(enLettres(g))} à ${enLettres(p)}.` });
export const partout = n => ({ id: `arbitre_partout_${slug(enLettres(n))}_01`, texte: `${maj(enLettres(n))} partout. Deux points d'écart.` });

// Les scores de fin de set possibles jusqu'à 20–18, pour les sets de 7 et de 11.
function scoresCourants() {
  const s = [];
  for (const len of [7, 11]) for (let p = 0; p <= len - 2; p++) s.push([len, p]);
  for (let p = 6; p <= 18; p++) s.push([p + 2, p]);
  const vus = new Set();
  return s.filter(([g, p]) => { const k = `${g}-${p}`; if (vus.has(k)) return false; vus.add(k); return true; })
    .sort((x, y) => x[0] - y[0] || x[1] - y[1]);
}

// ---------------------------------------------------------------- commentateur
// Plusieurs versions par situation, pour éviter les répétitions.
// « jaune » = le joueur, « rouge » = la machine (mode solo).
const COMMENTATEUR = {
  egalites: [
    "Trois égalités de suite. Ils se lisent dans les pensées.",
    "Encore le même signe ! On tourne en rond sur ce court.",
    "Troisième égalité d'affilée. Personne ne veut lâcher le morceau.",
  ],
  balle_sauvee: [
    "Balle sauvée ! Quel sang-froid.",
    "Sauvée ! Il ne tremble pas quand ça compte.",
    "Il écarte la balle. Des nerfs d'acier.",
  ],
  craquage: [
    "La main a tremblé. Balle envolée, la pression fait son œuvre.",
    "Oh, la balle lui échappe ! Le bras s'est crispé.",
    "Il avait la balle en main… et elle file. La pression, toujours la pression.",
  ],
  remontee: [
    "Mené de quatre points, et le voilà revenu. Tout est à refaire !",
    "Quelle remontée ! Le retard a fondu comme neige au soleil.",
    "Il était dos au mur, il est revenu à hauteur. Le public se réveille !",
  ],
  serie_jaune: [
    "Quatre points d'affilée. La machine vacille.",
    "Quatre de suite ! Il a trouvé la faille.",
    "Il enchaîne. La machine ne sait plus où donner de la tête.",
  ],
  serie_rouge: [
    "La machine déroule. Quatre points de suite.",
    "Quatre points d'affilée pour la machine. Il faut réagir, et vite.",
    "La machine s'envole. Il est temps de changer quelque chose.",
  ],
  lisible: [
    "La machine a flairé le coup. Encore. Il devient lisible.",
    "Elle l'a vu venir de loin. Ses habitudes le trahissent.",
    "Trop prévisible en ce moment. La machine lit dans son jeu.",
  ],
  obstination_pierre: [
    "Troisième Pierre de suite… c'est audacieux.",
    "Encore la Pierre ! Il s'entête, ou il bluffe ?",
  ],
  obstination_ciseaux: [
    "Troisièmes Ciseaux de suite… c'est audacieux.",
    "Toujours les Ciseaux ! Il a de la suite dans les idées.",
  ],
  obstination_feuille: [
    "Troisième Feuille de suite… c'est audacieux.",
    "Encore la Feuille ! Une obstination qui intrigue.",
  ],
  set_renverse_jaune: [
    "Il a renversé la situation au meilleur moment !",
    "Balle de set sauvée, et le set avec ! Quel retournement.",
  ],
  set_renverse_rouge: [
    "La balle de set lui a filé entre les doigts.",
    "Il tenait ce set… et la machine le lui arrache.",
  ],
  set_ecrasant_jaune: [
    "Une leçon. La machine va devoir se remettre en question.",
    "Set à sens unique. Démonstration de force.",
  ],
  set_ecrasant_rouge: [
    "Sèche correction. Il va falloir changer de plan.",
    "Rien n'a fonctionné dans ce set. Il faut tout remettre à plat.",
  ],
  set_arrache: [
    "Un set arraché au bout du suspense.",
    "Quel set ! Décidé au bout du bout.",
  ],
  victoire_combat: [
    "Un combat de tous les instants. Le public est debout.",
    "Quelle bataille ! Une victoire gagnée à la sueur du front.",
  ],
  victoire_nette: [
    "Démonstration. La machine n'a rien vu venir.",
    "Victoire sans trembler. Du grand art.",
  ],
  defaite: [
    "La machine l'emporte. Il faudra revoir ses habitudes.",
    "La machine a été la plus lucide aujourd'hui. Place à l'analyse.",
  ],
};
const num2 = i => String(i + 1).padStart(2, "0");

// ---------------------------------------------------------------- catalogue
// Toutes les répliques connues : id → { id, role, texte }.
export const CATALOGUE = new Map();
const ajouter = (id, role, texte) => CATALOGUE.set(id, { id, role, texte });
Object.entries(ARBITRE).forEach(([id, t]) => ajouter(id, "arbitre", t));
scoresCourants().forEach(([g, p]) => { const r = scoreSet(g, p); ajouter(r.id, "arbitre", r.texte); });
for (let n = 6; n <= 20; n++) { const r = partout(n); ajouter(r.id, "arbitre", r.texte); }
Object.entries(COMMENTATEUR).forEach(([cat, lignes]) => lignes.forEach((t, i) => ajouter(`commentateur_${cat}_${num2(i)}`, "commentateur", t)));

// Les versions disponibles d'une situation du commentateur.
export const versions = situation => (COMMENTATEUR[situation] || []).map((_, i) => `commentateur_${situation}_${num2(i)}`);
export const SITUATIONS_COMMENTATEUR = Object.keys(COMMENTATEUR);

// Retrouve une réplique, y compris un score hors catalogue (lu par la voix de synthèse).
export function replique(id) {
  const r = CATALOGUE.get(id);
  if (!r) throw new Error(`Réplique inconnue : ${id}`);
  return r;
}
export function repliqueScore(g, p) {
  const r = scoreSet(g, p);
  return CATALOGUE.get(r.id) || { ...r, role: "arbitre" };
}
export function repliquePartout(n) {
  const r = partout(n);
  return CATALOGUE.get(r.id) || { ...r, role: "arbitre" };
}
