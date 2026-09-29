// Les surnoms, annoncés par le speaker : un nom (le style de jeu) + un complément (les exploits).
// Ex. « Le Menhir aux nerfs d'acier ». Chaque partie est un fichier audio : speaker_surnom_<partie>_01.
// Les noms conviennent aux joueurs comme aux joueuses ; les compléments commencent par de, du, aux, sans…
import { signeFavori } from "./profil.js";
import { indiceImprevisibilite } from "./analyse.js";

const imprevisibilite = P => (P.lisibles >= 30 ? indiceImprevisibilite(P.devines / P.lisibles) : 0);
const partFavori = P => { const t = P.signes.reduce((a, b) => a + b, 0); return t ? Math.max(...P.signes) / t : 0; };
const favori = (P, s) => P.matchs >= 10 && signeFavori(P.signes) === s;
const taux = (a, b) => (b ? a / b : 0);
const NORD = ["🇧🇪", "🇨🇭", "🇨🇦", "🇱🇺", "🇩🇪", "🇬🇧"], SUD = ["🇲🇦", "🇩🇿", "🇹🇳", "🇸🇳", "🇨🇮", "🇪🇸", "🇮🇹", "🇧🇷"];

// Dans chaque liste, l'ordre compte : par défaut, on prend le dernier débloqué (le plus rare).
export const NOMS = [
  { id: "le_bleu", t: "Le Bleu", ok: () => true },
  { id: "la_recrue", t: "La Recrue", ok: P => P.matchs >= 3 },
  { id: "la_jeune_pousse", t: "La Jeune Pousse", ok: P => P.matchs >= 6 },
  { id: "le_roc", t: "Le Roc", ok: P => favori(P, 0) },
  { id: "le_bloc", t: "Le Bloc", ok: P => favori(P, 0) && P.matchs >= 20 },
  { id: "le_granit", t: "Le Granit", ok: P => favori(P, 0) && P.matchs >= 40 },
  { id: "le_menhir", t: "Le Menhir", ok: P => favori(P, 0) && P.matchs >= 70 },
  { id: "le_belier", t: "Le Bélier", ok: P => favori(P, 0) && P.matchs >= 100 },
  { id: "la_lame", t: "La Lame", ok: P => favori(P, 1) },
  { id: "le_secateur", t: "Le Sécateur", ok: P => favori(P, 1) && P.matchs >= 20 },
  { id: "le_barbier", t: "Le Barbier", ok: P => favori(P, 1) && P.matchs >= 40 },
  { id: "le_tailleur", t: "Le Tailleur", ok: P => favori(P, 1) && P.matchs >= 70 },
  { id: "la_guillotine", t: "La Guillotine", ok: P => favori(P, 1) && P.matchs >= 100 },
  { id: "le_papetier", t: "Le Papetier", ok: P => favori(P, 2) },
  { id: "le_buvard", t: "Le Buvard", ok: P => favori(P, 2) && P.matchs >= 20 },
  { id: "l_enveloppe", t: "L'Enveloppe", ok: P => favori(P, 2) && P.matchs >= 40 },
  { id: "le_parchemin", t: "Le Parchemin", ok: P => favori(P, 2) && P.matchs >= 70 },
  { id: "l_origami", t: "L'Origami", ok: P => favori(P, 2) && P.matchs >= 100 },
  { id: "le_metronome", t: "Le Métronome", ok: P => P.apresVictoire >= 30 && taux(P.memeApresVictoire, P.apresVictoire) <= 0.2 },
  { id: "l_horloger", t: "L'Horloger", ok: P => P.apresVictoire >= 100 && taux(P.memeApresVictoire, P.apresVictoire) <= 0.2 },
  { id: "le_comptable", t: "Le Comptable", ok: P => P.apresVictoire >= 200 && taux(P.memeApresVictoire, P.apresVictoire) <= 0.2 },
  { id: "le_taureau", t: "Le Taureau", ok: P => P.matchs >= 10 && partFavori(P) >= 0.45 },
  { id: "la_mule", t: "La Mule", ok: P => P.matchs >= 20 && partFavori(P) >= 0.5 },
  { id: "le_bulldozer", t: "Le Bulldozer", ok: P => P.matchs >= 30 && partFavori(P) >= 0.55 },
  { id: "le_cameleon", t: "Le Caméléon", ok: P => imprevisibilite(P) >= 70 },
  { id: "le_joker", t: "Le Joker", ok: P => imprevisibilite(P) >= 75 },
  { id: "le_fantome", t: "Le Fantôme", ok: P => imprevisibilite(P) >= 80 },
  { id: "l_enigme", t: "L'Énigme", ok: P => imprevisibilite(P) >= 85 },
  { id: "le_sphinx", t: "Le Sphinx", ok: P => imprevisibilite(P) >= 90 },
  { id: "l_ancien", t: "L'Ancien", ok: P => P.matchs >= 100 },
  { id: "le_veteran", t: "Le Vétéran", ok: P => P.matchs >= 250 },
];

export const COMPLEMENTS = [
  { id: "de_l_ombre", t: "de l'ombre", ok: () => true },
  { id: "en_devenir", t: "en devenir", ok: P => P.matchs >= 3 },
  { id: "qui_monte", t: "qui monte", ok: P => P.victoires >= 5 },
  { id: "du_grand_nord", t: "du Grand Nord", ok: P => NORD.includes(P.drapeau) },
  { id: "du_sud", t: "du Sud", ok: P => SUD.includes(P.drapeau) },
  { id: "de_l_etranger", t: "de l'étranger", ok: P => !!P.drapeau && P.drapeau !== "🇫🇷" && !NORD.includes(P.drapeau) && !SUD.includes(P.drapeau) },
  { id: "du_dimanche", t: "du dimanche", ok: P => P.heures.dimanche >= 5 },
  { id: "du_petit_matin", t: "du petit matin", ok: P => P.heures.matin >= 5 },
  { id: "de_minuit", t: "de minuit", ok: P => P.heures.nuit >= 5 },
  { id: "des_nuits_blanches", t: "des nuits blanches", ok: P => P.heures.nuit >= 20 },
  { id: "du_chronometre", t: "du chronomètre", ok: P => P.autos >= 20 },
  { id: "des_mains_qui_hesitent", t: "des mains qui hésitent", ok: P => P.autos >= 50 },
  { id: "des_egalites", t: "des égalités", ok: P => P.egalites >= 100 },
  { id: "du_miroir", t: "du miroir", ok: P => P.egalites >= 300 },
  { id: "des_marathons", t: "des marathons", ok: P => P.plusLongMatch >= 60 },
  { id: "de_l_endurance", t: "de l'endurance", ok: P => P.plusLongMatch >= 100 },
  { id: "sans_defaite", t: "sans défaite", ok: P => P.meilleureSerieVictoires >= 5 },
  { id: "des_series", t: "des séries", ok: P => P.meilleureSerieVictoires >= 8 },
  { id: "du_set_decisif", t: "du set décisif", ok: P => P.decisifsGagnes >= 1 },
  { id: "du_grand_soir", t: "du grand soir", ok: P => P.decisifsGagnes >= 5 },
  { id: "des_balles_de_match", t: "des balles de match", ok: P => P.ballesDeMatchSauvees >= 1 },
  { id: "de_la_derniere_chance", t: "de la dernière chance", ok: P => P.ballesSauvees >= 10 },
  { id: "de_la_remontada", t: "de la remontada", ok: P => P.remontadas >= 1 },
  { id: "qui_ne_meurt_jamais", t: "qui ne meurt jamais", ok: P => P.remontadas >= 3 },
  { id: "a_la_main_de_fer", t: "à la main de fer", ok: P => P.ballesObtenues >= 10 && taux(P.ballesConverties, P.ballesObtenues) >= 0.6 },
  { id: "sans_pitie", t: "sans pitié", ok: P => P.ballesObtenues >= 20 && taux(P.ballesConverties, P.ballesObtenues) >= 0.75 },
  { id: "aux_nerfs_d_acier", t: "aux nerfs d'acier", ok: P => P.ballesSauvees >= 5 },
  { id: "au_sang_froid", t: "au sang-froid", ok: P => P.decisifsGagnes >= 3 },
  { id: "au_regard_de_glace", t: "au regard de glace", ok: P => P.ballesSauvees >= 3 && imprevisibilite(P) >= 80 },
  { id: "qui_lit_dans_les_pensees", t: "qui lit dans les pensées", ok: P => P.lecturesReussies >= 20 },
  { id: "au_troisieme_oeil", t: "au troisième œil", ok: P => P.lecturesReussies >= 50 },
  { id: "de_la_fanny", t: "de la Fanny", ok: P => P.fannys >= 1 },
  { id: "des_tournois", t: "des tournois", ok: P => P.tournoisGagnes >= 1 },
  { id: "au_trophee", t: "au trophée", ok: P => P.tournoisGagnes >= 3 },
];

export const debloques = (liste, P) => liste.filter(x => x.ok(P));

// Le surnom porté : celui choisi s'il est toujours débloqué, sinon le plus rare.
export function surnomDe(P) {
  const noms = debloques(NOMS, P), comps = debloques(COMPLEMENTS, P);
  const nom = noms.find(x => x.id === P.surnom?.nom) || noms[noms.length - 1];
  const comp = comps.find(x => x.id === P.surnom?.complement) || comps[comps.length - 1];
  return { nom, complement: comp, texte: `${nom.t} ${comp.t}` };
}

// Nom du fichier audio d'une partie de surnom.
export const idPartie = partie => `speaker_surnom_${partie.id}_01`;
