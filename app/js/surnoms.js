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

const trophees = P => Object.keys(P.titres || {}).length;
const titre = (P, id) => !!P.titres?.[id];
const chaleureuses = P => (P.poignees?.franche || 0) + (P.poignees?.normale || 0);

// Dans chaque liste, l'ordre compte : par défaut, on prend le dernier débloqué (le plus rare).
// Les premiers sont libres (au choix dès le départ) ; « aide » dit comment débloquer les autres.
const LIBRE = { ok: () => true, aide: "Libre" };
export const NOMS = [
  // libres
  ...[["le_renard", "Le Renard"], ["le_chat", "Le Chat"], ["le_requin", "Le Requin"], ["le_cobra", "Le Cobra"], ["la_fusee", "La Fusée"],
    ["la_tornade", "La Tornade"], ["la_comete", "La Comète"], ["l_artiste", "L'Artiste"], ["le_magicien", "Le Magicien"],
    ["le_funambule", "Le Funambule"], ["le_gladiateur", "Le Gladiateur"], ["le_phenomene", "Le Phénomène"]].map(([id, t]) => ({ id, t, ...LIBRE })),
  { id: "le_bleu", t: "Le Bleu", ok: () => true, aide: "Libre" },
  { id: "la_recrue", t: "La Recrue", ok: P => P.matchs >= 3, aide: "3 matchs" },
  { id: "la_jeune_pousse", t: "La Jeune Pousse", ok: P => P.matchs >= 6, aide: "6 matchs" },
  { id: "le_roc", t: "Le Roc", ok: P => favori(P, 0), aide: "Pierre en signe favori (10 matchs)" },
  { id: "le_bloc", t: "Le Bloc", ok: P => favori(P, 0) && P.matchs >= 20, aide: "Pierre en signe favori, 20 matchs" },
  { id: "le_granit", t: "Le Granit", ok: P => favori(P, 0) && P.matchs >= 40, aide: "Pierre en signe favori, 40 matchs" },
  { id: "le_menhir", t: "Le Menhir", ok: P => favori(P, 0) && P.matchs >= 70, aide: "Pierre en signe favori, 70 matchs" },
  { id: "le_belier", t: "Le Bélier", ok: P => favori(P, 0) && P.matchs >= 100, aide: "Pierre en signe favori, 100 matchs" },
  { id: "la_lame", t: "La Lame", ok: P => favori(P, 1), aide: "Ciseaux en signe favori (10 matchs)" },
  { id: "le_secateur", t: "Le Sécateur", ok: P => favori(P, 1) && P.matchs >= 20, aide: "Ciseaux en signe favori, 20 matchs" },
  { id: "le_barbier", t: "Le Barbier", ok: P => favori(P, 1) && P.matchs >= 40, aide: "Ciseaux en signe favori, 40 matchs" },
  { id: "le_tailleur", t: "Le Tailleur", ok: P => favori(P, 1) && P.matchs >= 70, aide: "Ciseaux en signe favori, 70 matchs" },
  { id: "la_guillotine", t: "La Guillotine", ok: P => favori(P, 1) && P.matchs >= 100, aide: "Ciseaux en signe favori, 100 matchs" },
  { id: "le_papetier", t: "Le Papetier", ok: P => favori(P, 2), aide: "Feuille en signe favori (10 matchs)" },
  { id: "le_buvard", t: "Le Buvard", ok: P => favori(P, 2) && P.matchs >= 20, aide: "Feuille en signe favori, 20 matchs" },
  { id: "l_enveloppe", t: "L'Enveloppe", ok: P => favori(P, 2) && P.matchs >= 40, aide: "Feuille en signe favori, 40 matchs" },
  { id: "le_parchemin", t: "Le Parchemin", ok: P => favori(P, 2) && P.matchs >= 70, aide: "Feuille en signe favori, 70 matchs" },
  { id: "l_origami", t: "L'Origami", ok: P => favori(P, 2) && P.matchs >= 100, aide: "Feuille en signe favori, 100 matchs" },
  { id: "le_duelliste", t: "Le Duelliste", ok: P => (P.duelsFinis || 0) >= 10, aide: "10 duels en ligne joués jusqu'au bout" },
  { id: "le_diplomate", t: "Le Diplomate", ok: P => chaleureuses(P) >= 30, aide: "30 poignées de main chaleureuses" },
  { id: "l_iceberg", t: "L'Iceberg", ok: P => (P.poignees?.froide || 0) >= 10, aide: "10 poignées de main froides" },
  { id: "le_metronome", t: "Le Métronome", ok: P => P.apresVictoire >= 30 && taux(P.memeApresVictoire, P.apresVictoire) <= 0.2, aide: "Changer presque toujours de signe après une victoire (30 fois)" },
  { id: "l_horloger", t: "L'Horloger", ok: P => P.apresVictoire >= 100 && taux(P.memeApresVictoire, P.apresVictoire) <= 0.2, aide: "Changer presque toujours de signe après une victoire (100 fois)" },
  { id: "le_comptable", t: "Le Comptable", ok: P => P.apresVictoire >= 200 && taux(P.memeApresVictoire, P.apresVictoire) <= 0.2, aide: "Changer presque toujours de signe après une victoire (200 fois)" },
  { id: "le_taureau", t: "Le Taureau", ok: P => P.matchs >= 10 && partFavori(P) >= 0.45, aide: "Jouer ton signe favori 45 % du temps (10 matchs)" },
  { id: "la_mule", t: "La Mule", ok: P => P.matchs >= 20 && partFavori(P) >= 0.5, aide: "Jouer ton signe favori la moitié du temps (20 matchs)" },
  { id: "le_bulldozer", t: "Le Bulldozer", ok: P => P.matchs >= 30 && partFavori(P) >= 0.55, aide: "Jouer ton signe favori 55 % du temps (30 matchs)" },
  { id: "la_machine", t: "La Machine", ok: P => P.meilleureSeriePoints >= 10, aide: "10 points d'affilée" },
  { id: "le_jumeau", t: "Le Jumeau", ok: P => P.egalites >= 500, aide: "500 égalités" },
  { id: "le_cameleon", t: "Le Caméléon", ok: P => imprevisibilite(P) >= 70, aide: "Imprévisibilité de 70 sur 100" },
  { id: "le_joker", t: "Le Joker", ok: P => imprevisibilite(P) >= 75, aide: "Imprévisibilité de 75 sur 100" },
  { id: "le_fantome", t: "Le Fantôme", ok: P => imprevisibilite(P) >= 80, aide: "Imprévisibilité de 80 sur 100" },
  { id: "l_enigme", t: "L'Énigme", ok: P => imprevisibilite(P) >= 85, aide: "Imprévisibilité de 85 sur 100" },
  { id: "le_sphinx", t: "Le Sphinx", ok: P => imprevisibilite(P) >= 90, aide: "Imprévisibilité de 90 sur 100" },
  { id: "le_mentaliste", t: "Le Mentaliste", ok: P => P.lecturesReussies >= 100, aide: "Lire et contrer 100 réflexes adverses" },
  { id: "le_phenix", t: "Le Phénix", ok: P => P.remontadas >= 5, aide: "5 matchs gagnés après avoir perdu le 1er set" },
  { id: "l_evade", t: "L'Évadé", ok: P => P.ballesDeMatchSauvees >= 5, aide: "Sauver 5 balles de match" },
  { id: "l_insubmersible", t: "L'Insubmersible", ok: P => P.ballesDeMatchSauvees >= 15, aide: "Sauver 15 balles de match" },
  { id: "le_bourreau", t: "Le Bourreau", ok: P => P.fannys >= 3, aide: "3 sets à 11–0" },
  { id: "le_tacticien", t: "Le Tacticien", ok: P => P.elo >= 1400, aide: "Niveau d'entraînement de 1400" },
  { id: "le_grand_maitre", t: "Le Grand Maître", ok: P => P.elo >= 1600, aide: "Niveau d'entraînement de 1600" },
  { id: "le_mousquetaire", t: "Le Mousquetaire", ok: P => (P.duelsFinis || 0) >= 50, aide: "50 duels en ligne joués jusqu'au bout" },
  { id: "le_fondateur", t: "Le Fondateur", ok: P => titre(P, "fondateur"), aide: "Créer un cercle" },
  { id: "le_parrain", t: "Le Parrain", ok: P => titre(P, "patron"), aide: "Être 1er du classement d'un cercle d'au moins 5 membres" },
  { id: "le_croupier", t: "Le Croupier", ok: P => titre(P, "roi_sng"), aide: "Remporter un Sit & Go" },
  { id: "le_champion", t: "Le Champion", ok: P => P.tournoisGagnes >= 2, aide: "Remporter 2 HandSlam Open" },
  { id: "le_maitre_du_circuit", t: "Le Maître du circuit", ok: P => P.tournoisGagnes >= 5, aide: "Remporter 5 HandSlam Open" },
  { id: "le_collectionneur", t: "Le Collectionneur", ok: P => trophees(P) >= 10, aide: "10 trophées" },
  { id: "le_musee", t: "Le Musée", ok: P => trophees(P) >= 25, aide: "25 trophées" },
  { id: "le_conquerant", t: "Le Conquérant", ok: P => P.victoires >= 50, aide: "50 victoires" },
  { id: "l_ancien", t: "L'Ancien", ok: P => P.matchs >= 100, aide: "100 matchs" },
  { id: "l_empereur", t: "L'Empereur", ok: P => P.victoires >= 150, aide: "150 victoires" },
  { id: "le_veteran", t: "Le Vétéran", ok: P => P.matchs >= 250, aide: "250 matchs" },
  { id: "le_monument", t: "Le Monument", ok: P => P.victoires >= 300, aide: "300 victoires" },
  { id: "l_immortel", t: "L'Immortel", ok: P => P.matchs >= 500, aide: "500 matchs" },
];

export const COMPLEMENTS = [
  // libres
  ...[["du_quartier", "du quartier"], ["du_vestiaire", "du vestiaire"], ["du_club", "du club"], ["du_fond_du_court", "du fond du court"],
    ["de_la_tribune", "de la tribune"], ["du_coin_de_la_rue", "du coin de la rue"], ["au_grand_coeur", "au grand cœur"],
    ["aux_doigts_agiles", "aux doigts agiles"], ["a_la_main_leste", "à la main leste"], ["aux_mille_signes", "aux mille signes"],
    ["aux_semelles_de_vent", "aux semelles de vent"], ["sans_peur", "sans peur"]].map(([id, t]) => ({ id, t, ...LIBRE })),
  { id: "de_l_ombre", t: "de l'ombre", ok: () => true, aide: "Libre" },
  { id: "en_devenir", t: "en devenir", ok: P => P.matchs >= 3, aide: "3 matchs" },
  { id: "qui_monte", t: "qui monte", ok: P => P.victoires >= 5, aide: "5 victoires" },
  { id: "au_poing_ferme", t: "au poing fermé", ok: P => favori(P, 0), aide: "Pierre en signe favori (10 matchs)" },
  { id: "aux_deux_doigts", t: "aux deux doigts", ok: P => favori(P, 1), aide: "Ciseaux en signe favori (10 matchs)" },
  { id: "a_la_main_ouverte", t: "à la main ouverte", ok: P => favori(P, 2), aide: "Feuille en signe favori (10 matchs)" },
  { id: "du_grand_nord", t: "du Grand Nord", ok: P => NORD.includes(P.drapeau), aide: "Pays : Belgique, Suisse, Canada, Luxembourg, Allemagne ou Royaume-Uni" },
  { id: "du_sud", t: "du Sud", ok: P => SUD.includes(P.drapeau), aide: "Pays : Maroc, Algérie, Tunisie, Sénégal, Côte d'Ivoire, Espagne, Italie ou Brésil" },
  { id: "de_l_etranger", t: "de l'étranger", ok: P => !!P.drapeau && P.drapeau !== "🇫🇷" && !NORD.includes(P.drapeau) && !SUD.includes(P.drapeau), aide: "Pays : un autre pays (États-Unis, Japon…)" },
  { id: "du_dimanche", t: "du dimanche", ok: P => P.heures.dimanche >= 5, aide: "5 matchs le week-end" },
  { id: "du_petit_matin", t: "du petit matin", ok: P => P.heures.matin >= 5, aide: "5 matchs entre 5 h et 9 h" },
  { id: "de_minuit", t: "de minuit", ok: P => P.heures.nuit >= 5, aide: "5 matchs entre 23 h et 5 h" },
  { id: "des_nuits_blanches", t: "des nuits blanches", ok: P => P.heures.nuit >= 20, aide: "20 matchs entre 23 h et 5 h" },
  { id: "du_chronometre", t: "du chronomètre", ok: P => P.autos >= 20, aide: "Laisser filer le temps 20 fois" },
  { id: "des_mains_qui_hesitent", t: "des mains qui hésitent", ok: P => P.autos >= 50, aide: "Laisser filer le temps 50 fois" },
  { id: "des_egalites", t: "des égalités", ok: P => P.egalites >= 100, aide: "100 égalités" },
  { id: "du_miroir", t: "du miroir", ok: P => P.egalites >= 300, aide: "300 égalités" },
  { id: "du_fair_play", t: "du fair-play", ok: P => (P.mainsTendues || 0) >= 10, aide: "Serrer chaleureusement la main après 10 défaites" },
  { id: "au_gant_de_velours", t: "au gant de velours", ok: P => chaleureuses(P) >= 50, aide: "50 poignées de main chaleureuses" },
  { id: "a_la_poignee_glaciale", t: "à la poignée glaciale", ok: P => (P.poignees?.froide || 0) >= 10, aide: "10 poignées de main froides" },
  { id: "des_duels", t: "des duels", ok: P => (P.duelsFinis || 0) >= 10, aide: "10 duels en ligne joués jusqu'au bout" },
  { id: "de_la_revanche", t: "de la revanche", ok: P => titre(P, "revanche"), aide: "Battre un joueur juste après avoir perdu contre lui" },
  { id: "du_cercle", t: "du cercle", ok: P => titre(P, "derby"), aide: "10 duels contre les membres d'un de tes cercles" },
  { id: "des_marathons", t: "des marathons", ok: P => P.plusLongMatch >= 60, aide: "Un match de 60 coups" },
  { id: "de_l_endurance", t: "de l'endurance", ok: P => P.plusLongMatch >= 100, aide: "Un match de 100 coups" },
  { id: "sans_defaite", t: "sans défaite", ok: P => P.meilleureSerieVictoires >= 5, aide: "5 victoires d'affilée" },
  { id: "des_series", t: "des séries", ok: P => P.meilleureSerieVictoires >= 8, aide: "8 victoires d'affilée" },
  { id: "au_sommet", t: "au sommet", ok: P => P.meilleureSerieVictoires >= 10, aide: "10 victoires d'affilée" },
  { id: "qui_ne_lache_rien", t: "qui ne lâche rien", ok: P => P.meilleureSeriePoints >= 10, aide: "10 points d'affilée" },
  { id: "du_set_decisif", t: "du set décisif", ok: P => P.decisifsGagnes >= 1, aide: "Gagner un set décisif" },
  { id: "du_grand_soir", t: "du grand soir", ok: P => P.decisifsGagnes >= 5, aide: "Gagner 5 sets décisifs" },
  { id: "des_balles_de_match", t: "des balles de match", ok: P => P.ballesDeMatchSauvees >= 1, aide: "Sauver une balle de match" },
  { id: "de_la_derniere_chance", t: "de la dernière chance", ok: P => P.ballesSauvees >= 10, aide: "Sauver 10 balles de set ou de match" },
  { id: "de_la_remontada", t: "de la remontada", ok: P => P.remontadas >= 1, aide: "Gagner après avoir perdu le 1er set" },
  { id: "qui_ne_meurt_jamais", t: "qui ne meurt jamais", ok: P => P.remontadas >= 3, aide: "Gagner 3 fois après avoir perdu le 1er set" },
  { id: "des_miracles", t: "des miracles", ok: P => P.remontadas >= 5, aide: "Gagner 5 fois après avoir perdu le 1er set" },
  { id: "a_la_main_de_fer", t: "à la main de fer", ok: P => P.ballesObtenues >= 10 && taux(P.ballesConverties, P.ballesObtenues) >= 0.6, aide: "Convertir 60 % de tes balles de set et de match (10 balles)" },
  { id: "sans_pitie", t: "sans pitié", ok: P => P.ballesObtenues >= 20 && taux(P.ballesConverties, P.ballesObtenues) >= 0.75, aide: "Convertir 75 % de tes balles de set et de match (20 balles)" },
  { id: "aux_nerfs_d_acier", t: "aux nerfs d'acier", ok: P => P.ballesSauvees >= 5, aide: "Sauver 5 balles de set ou de match" },
  { id: "au_sang_froid", t: "au sang-froid", ok: P => P.decisifsGagnes >= 3, aide: "Gagner 3 sets décisifs" },
  { id: "au_regard_de_glace", t: "au regard de glace", ok: P => P.ballesSauvees >= 3 && imprevisibilite(P) >= 80, aide: "Sauver 3 balles et avoir une imprévisibilité de 80" },
  { id: "qui_lit_dans_les_pensees", t: "qui lit dans les pensées", ok: P => P.lecturesReussies >= 20, aide: "Lire et contrer 20 réflexes adverses" },
  { id: "au_troisieme_oeil", t: "au troisième œil", ok: P => P.lecturesReussies >= 50, aide: "Lire et contrer 50 réflexes adverses" },
  { id: "de_la_fanny", t: "de la Fanny", ok: P => P.fannys >= 1, aide: "Un set à 11–0" },
  { id: "du_onze_a_zero", t: "du onze à zéro", ok: P => P.fannys >= 3, aide: "3 sets à 11–0" },
  { id: "qui_fait_tomber_les_geants", t: "qui fait tomber les géants", ok: P => titre(P, "tueur_geant"), aide: "Battre en duel officiel un joueur qui a 200 points de plus" },
  { id: "du_haut_du_classement", t: "du haut du classement", ok: P => P.elo >= 1500, aide: "Niveau d'entraînement de 1500" },
  { id: "des_grandes_finales", t: "des grandes finales", ok: P => titre(P, "finaliste"), aide: "Jouer la finale d'un tournoi en ligne" },
  { id: "des_sit_and_go", t: "des Sit & Go", ok: P => titre(P, "roi_sng"), aide: "Remporter un Sit & Go" },
  { id: "des_tournois", t: "des tournois", ok: P => P.tournoisGagnes >= 1, aide: "Remporter un HandSlam Open" },
  { id: "au_trophee", t: "au trophée", ok: P => P.tournoisGagnes >= 3, aide: "Remporter 3 HandSlam Open" },
  { id: "au_palmares", t: "au palmarès", ok: P => trophees(P) >= 10, aide: "10 trophées" },
  { id: "a_la_vitrine_pleine", t: "à la vitrine pleine", ok: P => trophees(P) >= 25, aide: "25 trophées" },
  { id: "aux_cent_victoires", t: "aux cent victoires", ok: P => P.victoires >= 100, aide: "100 victoires" },
  { id: "aux_cinq_cents_matchs", t: "aux cinq cents matchs", ok: P => P.matchs >= 500, aide: "500 matchs" },
];

export const debloques = (liste, P) => liste.filter(x => x.ok(P));
export const aDebloquer = (liste, P) => liste.filter(x => !x.ok(P));

// Le surnom porté : celui choisi s'il est toujours débloqué, sinon le plus rare.
export function surnomDe(P) {
  const noms = debloques(NOMS, P), comps = debloques(COMPLEMENTS, P);
  const nom = noms.find(x => x.id === P.surnom?.nom) || noms[noms.length - 1];
  const comp = comps.find(x => x.id === P.surnom?.complement) || comps[comps.length - 1];
  return { nom, complement: comp, texte: `${nom.t} ${comp.t}` };
}

// Nom du fichier audio d'une partie de surnom.
export const idPartie = partie => `speaker_surnom_${partie.id}_01`;
