// La boutique : uniquement de l'apparence, achetée avec des jetons (jamais avec de l'argent réel, jamais d'avantage en match).
// Ici, le catalogue (les prix sont aussi sur le serveur : supabase/etape-17-boutique.sql, un test vérifie qu'ils correspondent).
// type : le réglage concerné (gant, gantMotif, fond, poignet de l'avatar ; cri ; celebration ; geste ; cadre de la carte).

export const RARETES = {
  courant: { nom: "Courant", prix: 300 },
  rare: { nom: "Rare", prix: 800 },
  epique: { nom: "Épique", prix: 2000 },
  legendaire: { nom: "Légendaire", prix: 5000 },
};
export const CATEGORIES = [
  { id: "avatar", nom: "🧤 Avatar" },
  { id: "cri", nom: "📣 Cris" },
  { id: "geste", nom: "✊ Gestes" },
  { id: "celebration", nom: "🎉 Célébrations" },
  { id: "cadre", nom: "🪪 Cadres" },
];

const a = (type, cle, nom, rarete, categorie = "avatar") => ({ id: `${type}:${cle}`, type, cle, nom, rarete, categorie, prix: RARETES[rarete].prix });
export const ARTICLES = [
  a("gant", "rose", "Gant rose", "courant"), a("gant", "violet", "Gant violet", "courant"), a("gant", "noir", "Gant noir mat", "courant"), a("gant", "turquoise", "Gant turquoise", "courant"),
  a("gantMotif", "damier", "Gant à damier", "rare"), a("gantMotif", "flammes", "Gant en flammes", "rare"), a("gantMotif", "tigre", "Gant tigré", "rare"),
  a("gantMotif", "zebre", "Gant zébré", "rare"), a("gantMotif", "coeurs", "Gant à cœurs", "rare"), a("gantMotif", "etoiles", "Gant étoilé", "rare"),
  a("gantMotif", "camouflage", "Gant camouflage", "rare"), a("gantMotif", "carbone", "Gant carbone", "rare"),
  a("fond", "roland", "Fond terre de Roland", "rare"), a("fond", "londres", "Fond gazon de Londres", "rare"),
  a("fond", "neon", "Fond néon", "epique"), a("fond", "coucher", "Fond coucher de soleil", "epique"), a("fond", "stade", "Fond stade de nuit", "epique"),
  a("fond", "galaxie", "Fond galaxie", "legendaire"),
  a("poignet", "tricolore", "Poignet tricolore", "courant"), a("poignet", "arcenciel", "Poignet arc-en-ciel", "rare"), a("poignet", "leopard", "Poignet léopard", "rare"),
  a("cri", "jeu_set_et_main", "« Jeu, set et main ! »", "rare", "cri"), a("cri", "trop_facile", "« Trop facile. »", "rare", "cri"),
  a("cri", "ole", "« Olé ! »", "rare", "cri"), a("cri", "boum", "« Boum ! »", "rare", "cri"), a("cri", "le_metier", "« C'est le métier qui rentre ! »", "rare", "cri"),
  a("cri", "sayonara", "« Sayonara ! »", "rare", "cri"), a("cri", "ca_fait_mal", "« Et ça fait mal ! »", "rare", "cri"),
  a("cri", "le_patron", "« Le patron, c'est moi. »", "rare", "cri"), a("cri", "qui_le_patron", "« C'est qui le patron ?! »", "rare", "cri"),
  a("geste", "poing_tremble", "Le poing qui tremble", "rare", "geste"), a("geste", "poing_leve", "Le poing levé", "rare", "geste"),
  a("geste", "salut", "Le salut de la main", "rare", "geste"), a("geste", "v_victoire", "Le V de la victoire", "epique", "geste"),
  a("geste", "pouce_leve", "Le pouce levé", "epique", "geste"), a("geste", "doigt_leve", "Le doigt levé (numéro 1)", "epique", "geste"),
  a("geste", "uppercut", "L'uppercut", "legendaire", "geste"),
  a("celebration", "etoiles", "Pluie d'étoiles", "epique", "celebration"), a("celebration", "coeurs", "Pluie de cœurs", "epique", "celebration"),
  a("celebration", "eclairs", "Éclairs", "epique", "celebration"), a("celebration", "feu", "Feu d'artifice", "epique", "celebration"),
  a("celebration", "or", "Pluie d'or", "legendaire", "celebration"),
  a("cadre", "bronze", "Cadre bronze", "courant", "cadre"), a("cadre", "argent", "Cadre argent", "rare", "cadre"),
  a("cadre", "neon", "Cadre néon", "epique", "cadre"), a("cadre", "or", "Cadre or", "legendaire", "cadre"),
];
const PAR_ID = new Map(ARTICLES.map(x => [x.id, x]));
export const article = id => PAR_ID.get(id) || null;
export const articleDe = (type, cle) => PAR_ID.get(`${type}:${cle}`) || null;
// Un élément gratuit (pas dans la boutique) ou acheté.
export const possede = (P, type, cle) => { const x = articleDe(type, cle); return !x || (P.achats || []).includes(x.id); };

// La vitrine du jour : 3 articles à −30 %, les mêmes pour tous (même tirage que le serveur, voir prixDuJour).
export const REMISE = 0.3;
export const prixRemise = prix => Math.round(prix * (1 - REMISE) / 10) * 10;

// Les gestes de victoire : la forme de la main et son animation (classe CSS « geste-… »).
export const GESTES = {
  poing: { nom: "Le poing serré", symbole: "pierre" },
  poing_tremble: { nom: "Le poing qui tremble", symbole: "pierre" },
  poing_leve: { nom: "Le poing levé", symbole: "pierre" },
  salut: { nom: "Le salut de la main", symbole: "feuille" },
  v_victoire: { nom: "Le V de la victoire", symbole: "ciseaux" },
  pouce_leve: { nom: "Le pouce levé", symbole: "pouce" },
  doigt_leve: { nom: "Le doigt levé", symbole: "index" },
  uppercut: { nom: "L'uppercut", symbole: "pierre" },
};
export const gesteValide = g => (GESTES[g] ? g : "poing");

// Les célébrations de fin de match : la forme et les couleurs des confettis.
export const CELEBRATIONS = {
  confettis: { nom: "Confettis aux couleurs du gant" },
  etoiles: { nom: "Pluie d'étoiles", formes: ["★"], couleurs: ["#FFD34D", "#FFFFFF", "#FFE89A"] },
  coeurs: { nom: "Pluie de cœurs", formes: ["♥"], couleurs: ["#E8395E", "#F28DB2", "#FFFFFF"] },
  eclairs: { nom: "Éclairs", formes: ["⚡"], couleurs: ["#FFD34D", "#4DA3FF"] },
  feu: { nom: "Feu d'artifice", formes: ["✦", "✸", "•"], couleurs: ["#FF3EA5", "#22D3EE", "#FFD34D", "#6BD49A"] },
  or: { nom: "Pluie d'or", formes: ["●", "◆"], couleurs: ["#FFD34D", "#E0B12A", "#FFF1B8"] },
};
export const celebrationValide = c => (CELEBRATIONS[c] ? c : "confettis");

// Les cadres de la carte de joueur : la couleur du liseré.
export const CADRES = { aucun: { nom: "Selon le rang" }, bronze: { nom: "Bronze", couleur: "#C27A3A" }, argent: { nom: "Argent", couleur: "#D3D9E2" }, neon: { nom: "Néon", couleur: "#FF3EA5" }, or: { nom: "Or", couleur: "#FFD34D" } };
export const cadreValide = c => (CADRES[c] ? c : "aucun");
