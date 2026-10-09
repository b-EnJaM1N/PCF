// Les surnoms, annoncés par le speaker : un nom de combattant + un qualificatif, que le joueur compose lui-même.
// Ex. « Le Cobra du PMU », « La Tornade de Velours », « Le Poing des Titans ». Liste du porteur du projet (docs/surnoms-v3-tri.md).
// Chaque partie est un fichier audio : speaker_surnom_<partie>_01. Les qualificatifs ne s'accordent pas
// (« Le Cobra Implacable », « La Tornade Implacable ») : un seul enregistrement suffit.
// On débloque les familles en montant les rangs de la carte de joueur (carte-logique.js).
import { signeFavori } from "./profil.js";
import { RANGS } from "./carte-logique.js";

// Les paliers : le rang de la carte (numéro, de 1 à 10) qui les ouvre.
export const PALIERS = {
  novice: { nom: "Novice", rang: 1 },
  amateur: { nom: "Amateur", rang: 2 },
  moyen: { nom: "Moyen", rang: 3 },
  confirme: { nom: "Confirmé", rang: 4 },
  expert: { nom: "Expert", rang: 5 },
  legende: { nom: "Légende", rang: 6 },
};

// Les familles : leur titre et leur palier (null : débloquée autrement).
export const FAMILLES = {
  animal: { titre: "Animaux", palier: "novice" },
  cuisine: { titre: "Cuisine", palier: "novice" },
  force: { titre: "Forces", palier: "novice" },
  combattant: { titre: "Combattants", palier: "novice" },
  handslam: { titre: "Spécial HandSlam", palier: null },
  titre: { titre: "Titres", palier: "expert" },
  humour: { titre: "☕ La vie de tous les jours", palier: "novice" },
  lieu: { titre: "🌍 Lieux", palier: "amateur" },
  matiere: { titre: "🪨 Matières", palier: "moyen" },
  element: { titre: "🔥 Éléments", palier: "confirme" },
  caractere: { titre: "😈 Caractère", palier: "expert" },
  ombre: { titre: "🌑 Ombre", palier: "expert" },
  prestige: { titre: "👑 Prestige", palier: "legende" },
};

const aidePalier = cle => {
  const r = RANGS[PALIERS[cle].rang - 1];
  return `Palier ${PALIERS[cle].nom} : carte ${r.nom} (${r.condition})`;
};
const famille = (cle, liste) => liste.map(([id, t]) => {
  const p = FAMILLES[cle].palier;
  return { id, t, famille: cle, palier: p, ok: (P, rang) => rang >= PALIERS[p].rang, aide: aidePalier(p) };
});
const favori = (P, s) => P.matchs >= 10 && signeFavori(P.signes) === s;

export const NOMS = [
  // Les noms drôles (choix du porteur du projet, 10 octobre), rangés dans leur catégorie : le contraste fait rire (« La Quiche Implacable »).
  ...famille("animal", [["la_loutre", "La Loutre"], ["la_limace", "La Limace"], ["la_buse", "La Buse"], ["le_cacatoes", "Le Cacatoès"], ["le_dindon", "Le Dindon"], ["le_pigeon", "Le Pigeon"],
    ["le_cobra", "Le Cobra"], ["le_scorpion", "Le Scorpion"], ["le_requin", "Le Requin"], ["le_faucon", "Le Faucon"], ["le_tigre", "Le Tigre"], ["la_panthere", "La Panthère"], ["le_bison", "Le Bison"], ["le_pitbull", "Le Pitbull"]]),
  ...famille("cuisine", [["le_croque_monsieur", "Le Croque-Monsieur"], ["la_saucisse", "La Saucisse"], ["la_quiche", "La Quiche"], ["le_cepe", "Le Cèpe"], ["la_truffe", "La Truffe"]]),
  ...famille("force", [["le_poing", "Le Poing"], ["la_main", "La Main"], ["le_marteau", "Le Marteau"], ["le_bulldozer", "Le Bulldozer"], ["le_tank", "Le Tank"], ["la_foudre", "La Foudre"], ["la_tornade", "La Tornade"], ["l_ouragan", "L'Ouragan"]]),
  ...famille("combattant", [["le_gladiateur", "Le Gladiateur"], ["le_cogneur", "Le Cogneur"], ["le_barbare", "Le Barbare"], ["le_viking", "Le Viking"], ["le_samourai", "Le Samouraï"], ["le_ninja", "Le Ninja"]]),
  { id: "le_menhir", t: "Le Menhir", famille: "handslam", palier: null, ok: P => favori(P, 0), aide: "Pierre en signe favori (10 matchs)" },
  { id: "le_secateur", t: "Le Sécateur", famille: "handslam", palier: null, ok: P => favori(P, 1), aide: "Ciseaux en signe favori (10 matchs)" },
  { id: "l_origami", t: "L'Origami", famille: "handslam", palier: null, ok: P => favori(P, 2), aide: "Feuille en signe favori (10 matchs)" },
  ...famille("titre", [["le_boss", "Le Boss"], ["le_taulier", "Le Taulier"], ["le_maitre", "Le Maître"], ["le_champion", "Le Champion"], ["le_crack", "Le Crack"], ["la_machine", "La Machine"]]),
];

export const QUALIFICATIFS = [
  ...famille("humour", [["du_dimanche", "du Dimanche"], ["de_l_apero", "de l'Apéro"], ["du_comptoir", "du Comptoir"], ["du_pmu", "du PMU"], ["de_la_cantine", "de la Cantine"], ["du_bureau", "du Bureau"], ["du_parking", "du Parking"], ["du_supermarche", "du Supermarché"], ["du_camping", "du Camping"], ["de_la_sieste", "de la Sieste"], ["du_canape", "du Canapé"], ["du_barbecue", "du Barbecue"], ["du_rond_point", "du Rond-Point"], ["de_la_plage", "de la Plage"]]),
  ...famille("lieu", [["du_quartier", "du Quartier"], ["de_la_rue", "de la Rue"], ["de_la_street", "de la Street"], ["du_bitume", "du Bitume"], ["de_la_cite", "de la Cité"], ["du_ring", "du Ring"], ["de_l_arene", "de l'Arène"], ["de_la_jungle", "de la Jungle"], ["du_desert", "du Désert"], ["des_iles", "des Îles"], ["du_village", "du Village"]]),
  ...famille("matiere", [["d_acier", "d'Acier"], ["de_titane", "de Titane"], ["de_beton", "de Béton"], ["de_marbre", "de Marbre"], ["de_plomb", "de Plomb"], ["de_cristal", "de Cristal"], ["de_velours", "de Velours"], ["de_soie", "de Soie"], ["d_or", "d'Or"], ["en_dentelle", "en Dentelle"], ["a_paillettes", "à Paillettes"]]),
  ...famille("element", [["de_feu", "de Feu"], ["de_glace", "de Glace"], ["de_lave", "de Lave"], ["de_braise", "de Braise"], ["de_givre", "de Givre"], ["de_tempete", "de Tempête"], ["de_brume", "de Brume"], ["de_lune", "de Lune"]]),
  ...famille("caractere", [["redoutable", "Redoutable"], ["implacable", "Implacable"], ["impitoyable", "Impitoyable"], ["invincible", "Invincible"], ["inarretable", "Inarrêtable"], ["intraitable", "Intraitable"], ["terrible", "Terrible"], ["sauvage", "Sauvage"]]),
  ...famille("ombre", [["de_la_nuit", "de la Nuit"], ["de_l_ombre", "de l'Ombre"], ["du_chaos", "du Chaos"]]),
  ...famille("prestige", [["des_titans", "des Titans"], ["des_legendes", "des Légendes"], ["des_immortels", "des Immortels"], ["des_champions", "des Champions"], ["de_l_eternite", "de l'Éternité"], ["de_la_gloire", "de la Gloire"], ["du_destin", "du Destin"], ["de_l_empire", "de l'Empire"]]),
];

// Le rang de carte retenu pour les surnoms : le plus haut jamais atteint (on ne perd pas un surnom débloqué).
export const rangRetenu = P => Math.max(1, P.rangMax || 1);
export const debloques = (liste, P, rang = rangRetenu(P)) => liste.filter(x => x.ok(P, rang));
export const aDebloquer = (liste, P, rang = rangRetenu(P)) => liste.filter(x => !x.ok(P, rang));

// Ce qu'annonce l'ouverture d'un palier (écran de fin de match).
const ANNONCES = {
  amateur: "🌍 Nouveaux qualificatifs pour ton surnom : les lieux (du Bitume, de la Street…) !",
  moyen: "🪨 Nouveaux qualificatifs pour ton surnom : les matières (d'Acier, de Velours…) !",
  confirme: "🔥 Nouveaux qualificatifs pour ton surnom : les éléments (de Feu, de Glace…) !",
  expert: "😈 Nouveaux surnoms : les titres (Le Boss, Le Champion…), le caractère et l'ombre (Implacable, de l'Ombre…) !",
  legende: "👑 Nouveaux qualificatifs pour ton surnom : le prestige (des Titans, de l'Éternité…) !",
};
// Le joueur atteint le rang de carte « numero » : on le retient, et on renvoie les annonces des paliers qui s'ouvrent.
export function monterRang(P, numero) {
  const avant = rangRetenu(P);
  if (numero <= avant) return [];
  P.rangMax = numero;
  return Object.entries(PALIERS).filter(([, p]) => avant < p.rang && numero >= p.rang).map(([cle]) => ANNONCES[cle]).filter(Boolean);
}

// Les noms du surnom de départ : les drôles (animaux pas féroces et cuisine).
export const NOMS_DEPART = new Set(["la_loutre", "la_limace", "la_buse", "le_cacatoes", "le_dindon", "le_pigeon",
  "le_croque_monsieur", "la_saucisse", "la_quiche", "le_cepe", "la_truffe"]);

// Un surnom tiré au hasard parmi ceux débloqués ; « depart » : un nom drôle et un qualificatif de la vie de tous les jours (le surnom d'un nouveau joueur).
export function surnomAuHasard(P, { depart = false, hasard = Math.random } = {}) {
  const noms = depart ? NOMS.filter(x => NOMS_DEPART.has(x.id)) : debloques(NOMS, P);
  const quals = depart ? QUALIFICATIFS.filter(x => x.famille === "humour") : debloques(QUALIFICATIFS, P);
  const pioche = l => l[Math.floor(hasard() * l.length) % l.length];
  return { nom: pioche(noms).id, complement: pioche(quals).id };
}

// Sans surnom choisi (ou avec un surnom de l'ancienne liste) : un surnom de départ, toujours le même pour un pseudo donné,
// pour que l'adversaire voie le même que le joueur.
function surnomParDefaut(P) {
  let h = 0;
  for (const c of String(P.pseudo || "")) h = (h * 31 + c.codePointAt(0)) >>> 0;
  let k = 0;
  return surnomAuHasard(P, { depart: true, hasard: () => ((k++ ? Math.floor(h / 97) : h) % 1000) / 1000 });
}

// Le surnom choisi existe-t-il (en entier) dans la liste ? Sinon, l'appli en tire un nouveau au départ.
export const surnomValide = P => !!(NOMS.some(x => x.id === P.surnom?.nom) && QUALIFICATIFS.some(x => x.id === P.surnom?.complement));

// Le surnom porté : celui choisi (le choix se fait parmi les surnoms débloqués), sinon le surnom de départ, en entier
// (un ancien surnom dont une moitié existe encore ne garde pas cette moitié).
export function surnomDe(P) {
  const s = surnomValide(P) ? P.surnom : surnomParDefaut(P);
  const nom = NOMS.find(x => x.id === s.nom), complement = QUALIFICATIFS.find(x => x.id === s.complement);
  return { nom, complement, texte: `${nom.t} ${complement.t}` };
}

// Nom du fichier audio d'une partie de surnom.
export const idPartie = partie => `speaker_surnom_${partie.id}_01`;
