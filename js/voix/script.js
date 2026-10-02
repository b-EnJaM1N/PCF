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

import { MOMENTS, DIALOGUES, SPEAKER, NOMS_BOTS, JOURNALISTE } from "./repliques.js";
import { NOMS, QUALIFICATIFS, idPartie } from "../surnoms.js";

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
  // Match en un seul set, sets de 3 et 1 point.
  arbitre_set_unique_01: "Set unique.",
  arbitre_point_decisif_01: "Point décisif.",
  arbitre_les_joueurs_sont_prets_01: "Les joueurs sont prêts. Premier set.",
  arbitre_troisieme_et_dernier_set_01: "Troisième et dernier set.",
  arbitre_silence_01: "Silence, s'il vous plaît.",
  arbitre_temps_01: "Temps.",
  arbitre_coup_joue_d_office_01: "Coup joué d'office.",
  // Pour les prochaines cérémonies (temps mort, réclamation, poignée de main, forfait).
  arbitre_temps_mort_jaune_01: "Temps mort, côté jaune.",
  arbitre_temps_mort_rouge_01: "Temps mort, côté rouge.",
  arbitre_reprise_du_jeu_01: "Reprise du jeu.",
  arbitre_reclamation_rejetee_01: "Réclamation rejetée.",
  arbitre_reclamation_rejetee_02: "Réclamation rejetée. Le signe était valide.",
  arbitre_reclamation_rejetee_03: "Réclamation rejetée. L'arbitre a vu.",
  arbitre_poignee_de_main_01: "Les joueurs se serrent la main.",
  arbitre_poignee_franche_01: "Belle poignée de main.",
  arbitre_poignee_legere_01: "Poignée de main… discrète.",
  arbitre_forfait_jaune_01: "Victoire par forfait, côté jaune.",
  arbitre_forfait_rouge_01: "Victoire par forfait, côté rouge.",
  arbitre_abandon_01: "Abandon. Le match est terminé.",
};

// Répliques de l'arbitre construites à partir d'un score.
export const scoreSet = (g, p) => ({ id: `arbitre_score_${slug(enLettres(g))}_a_${slug(enLettres(p))}_01`, texte: `${maj(enLettres(g))} à ${enLettres(p)}.` });
export const partout = n => ({ id: `arbitre_partout_${slug(enLettres(n))}_01`, texte: `${maj(enLettres(n))} partout. Deux points d'écart.` });

// Les scores de fin de set possibles jusqu'à 20–18, pour les sets de 7 et de 11, et ceux des sets de 3 et 1 point.
function scoresCourants() {
  const s = [];
  for (const len of [7, 11]) for (let p = 0; p <= len - 2; p++) s.push([len, p]);
  for (let p = 6; p <= 18; p++) s.push([p + 2, p]);
  s.push([1, 0], [3, 0], [3, 1], [3, 2]);          // sets de 1 et 3 points (un point d'écart suffit)
  const vus = new Set();
  return s.filter(([g, p]) => { const k = `${g}-${p}`; if (vus.has(k)) return false; vus.add(k); return true; })
    .sort((x, y) => x[0] - y[0] || x[1] - y[1]);
}

// ---------------------------------------------------------------- catalogue
// Toutes les répliques connues : id → { id, role, texte }.
export const CATALOGUE = new Map();
const ajouter = (id, role, texte) => CATALOGUE.set(id, { id, role, texte });
Object.entries(ARBITRE).forEach(([id, t]) => ajouter(id, "arbitre", t));
scoresCourants().forEach(([g, p]) => { const r = scoreSet(g, p); ajouter(r.id, "arbitre", r.texte); });
for (let n = 6; n <= 20; n++) { const r = partout(n); ajouter(r.id, "arbitre", r.texte); }

const num2 = i => String(i + 1).padStart(2, "0");
export const SIGNES_FICHIER = ["pierre", "ciseaux", "feuille"];   // même ordre que regles.js
const ROLE = { c: "commentateur", d: "commentatrice" };
const texteDe = (x, fem) => (typeof x === "string" ? x : fem && x.f ? x.f : x.t);

// Une entrée (moment ou réplique du speaker) devient une ou plusieurs répliques :
// une par signe si le texte en a trois, et une au féminin si elle existe.
function declinaisons(base, role, e) {
  const t = e.t, f = e.f;
  const variantes = Array.isArray(t) ? t.map((x, s) => [`_${SIGNES_FICHIER[s]}`, x, Array.isArray(f) ? f[s] : null]) : [["", t, f || null]];
  for (const [suffixe, texte, fem] of variantes) {
    ajouter(`${base}${suffixe}`, role, texte);
    if (fem) ajouter(`${base}${suffixe}_f`, role, fem);
  }
}

// Les moments du commentaire : pour chacun, la liste des répliques possibles (avec leur id de base).
export const POOLS = {};
for (const [moment, entrees] of Object.entries(MOMENTS)) {
  const compte = { c: 0, d: 0 };
  POOLS[moment] = entrees.map(e => {
    const role = ROLE[e.r], base = `${role}_${moment}_${num2(compte[e.r]++)}`;
    declinaisons(base, role, e);
    return { ...e, role, base, parSigne: Array.isArray(e.t), fem: !!e.f };
  });
}
// La réplique à dire, selon le signe et le genre du joueur dont on parle.
export function ligneMoment(item, { genre = "m", signe = 0, signeAdv = 0 } = {}) {
  let id = item.base;
  if (item.parSigne) id += `_${SIGNES_FICHIER[item.signe === "adv" ? signeAdv : signe] ?? "pierre"}`;
  if (genre === "f" && item.fem && CATALOGUE.has(`${id}_f`)) id += "_f";
  return CATALOGUE.get(id);
}

// Les dialogues : commentateur puis commentatrice.
export const DIALOGUES_IDS = {};
for (const [moment, liste] of Object.entries(DIALOGUES)) {
  DIALOGUES_IDS[moment] = liste.map((d, k) => d.map((x, i) => {
    const role = i === 0 ? "commentateur" : "commentatrice", id = `${role}_dialogue_${moment}_${num2(k)}`;
    ajouter(id, role, texteDe(x, false));
    if (typeof x !== "string" && x.f) ajouter(`${id}_f`, role, x.f);
    return id;
  }));
}
export const nbDialogues = moment => DIALOGUES_IDS[moment].length;
export function ligneDialogue(moment, k, genre = "m") {
  return DIALOGUES_IDS[moment][k].map(id => (genre === "f" && CATALOGUE.has(`${id}_f`) ? CATALOGUE.get(`${id}_f`) : CATALOGUE.get(id)));
}

// Le speaker, les bots, les parties de surnom, le journaliste.
for (const [cle, liste] of Object.entries(SPEAKER)) liste.forEach((e, k) => declinaisons(`speaker_${cle}_${num2(k)}`, "speaker", typeof e === "string" ? { t: e } : e));
export function ligneSpeaker(cle, k = 0, genre = "m") {
  const id = `speaker_${cle}_${num2(k)}`;
  return genre === "f" && CATALOGUE.has(`${id}_f`) ? CATALOGUE.get(`${id}_f`) : CATALOGUE.get(id);
}
export const nbSpeaker = cle => SPEAKER[cle].length;
for (const [id, t] of Object.entries(NOMS_BOTS)) ajouter(`speaker_bot_${id}_01`, "speaker", t);
for (const p of [...NOMS, ...QUALIFICATIFS]) ajouter(idPartie(p), "speaker", `${p.t}…`);
for (const [cle, liste] of Object.entries(JOURNALISTE)) liste.forEach((t, k) => ajouter(`journaliste_${cle}_${num2(k)}`, "journaliste", t));
export const ligneJournaliste = (cle, k) => CATALOGUE.get(`journaliste_${cle}_${num2(k)}`);

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
