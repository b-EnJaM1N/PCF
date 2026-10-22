// Les célébrations : le cri du joueur à la fin d'un set gagné (une bulle et le poing serré)
// et à la fin du match (en grand, avec des confettis aux couleurs du gant).
// Ici, seulement les règles (testées automatiquement) ; l'écran est dans app.js.
import { GANTS, POIGNETS } from "./avatar.js";

// t : ce qui s'affiche ; le dernier est un poing serré, sans un mot.
export const CRIS = [
  { id: "vamos", t: "Vamos !" }, { id: "allez", t: "Allez !" }, { id: "come_on", t: "Come on !" }, { id: "hija", t: "Hija !" },
  { id: "yes", t: "Yes !" }, { id: "lets_go", t: "Let's go !" }, { id: "forza", t: "Forza !" }, { id: "andiamo", t: "Andiamo !" },
  { id: "dale", t: "Dale !" }, { id: "kom_igen", t: "Kom igen !" }, { id: "davai", t: "Davai !" }, { id: "auf_gehts", t: "Auf geht's !" },
  { id: "ouiii", t: "Ouiii !" }, { id: "voila", t: "Voilààà !" }, { id: "cest_ca", t: "C'est ça !" }, { id: "je_suis_la", t: "Je suis là !" },
  { id: "allez_allez", t: "Allez, allez, allez !" }, { id: "ciseaux_bebe", t: "Ciseaux, bébé !" }, { id: "caillou", t: "Caillou !" },
  { id: "pas_aujourdhui", t: "Pas aujourd'hui !" }, { id: "main_chaude", t: "La main est chaude !" }, { id: "merci", t: "Merci." },
  { id: "suivant", t: "Suivant." }, { id: "silence", t: "", nom: "✊ Le poing serré, en silence" },
  // Les cris de la boutique (à acheter avec des jetons : voir catalogue.js).
  { id: "jeu_set_et_main", t: "Jeu, set et main !", boutique: true }, { id: "trop_facile", t: "Trop facile.", boutique: true },
  { id: "ole", t: "Olé !", boutique: true }, { id: "boum", t: "Boum !", boutique: true }, { id: "le_metier", t: "C'est le métier qui rentre !", boutique: true },
  { id: "sayonara", t: "Sayonara !", boutique: true }, { id: "ca_fait_mal", t: "Et ça fait mal !", boutique: true },
  { id: "le_patron", t: "Le patron, c'est moi.", boutique: true }, { id: "qui_le_patron", t: "C'est qui le patron ?!", boutique: true },
];
export const CRI_DEFAUT = "allez";
const PAR_ID = new Map(CRIS.map(c => [c.id, c]));
export const criValide = id => (PAR_ID.has(id) ? id : CRI_DEFAUT);
export const texteCri = id => PAR_ID.get(criValide(id)).t;
// Le nom dans la liste de « Ma fiche ».
export const libelleCri = id => { const c = PAR_ID.get(criValide(id)); return c.nom || c.t; };

// Chaque bot a son cri, selon son caractère. Miroir copie le tien ; Chaos, au hasard.
const DES_BOTS = {
  rocky: "caillou", papyrus: "voila", bambi: "ouiii", boomerang: "dale", cyclo: "allez_allez", tictac: "come_on",
  rancune: "pas_aujourdhui", bluffeur: "ciseaux_bebe", nemesis: "davai", mante: "silence", stratege: "merci",
  professeur: "suivant", titan: "je_suis_la",
};
export function criDuBot(botId, monCri, rng = Math.random) {
  if (botId === "miroir") return criValide(monCri);
  if (botId === "chaos") { const libres = CRIS.filter(c => !c.boutique); return libres[Math.floor(rng() * libres.length)].id; }
  return DES_BOTS[botId] || CRI_DEFAUT;
}

// Ce qu'on montre quand un joueur gagne un set ou le match.
// sauvee : il a sauvé une balle de match dans ce set → le cri est plus fort.
// Renvoie { taille: "bulle" | "grand", fort, texte, silence }.
export function celebration(cri, { finMatch = false, sauvee = false } = {}) {
  const id = criValide(cri);
  return { taille: finMatch ? "grand" : "bulle", fort: !!sauvee, texte: texteCri(id), silence: id === "silence" };
}

// Les commentateurs réagissent parfois (une fois par match au plus, jamais à un poing silencieux) :
// plus souvent au cri de la fin du match ou après une balle de match sauvée.
export function commenterCri(dejaCommente, c, rng = Math.random) {
  if (dejaCommente || c.silence) return false;
  const chance = c.fort ? 0.6 : c.taille === "grand" ? 0.35 : 0.15;
  return rng() < chance;
}

// Les confettis : aux couleurs du gant et du poignet, un peu de blanc pour l'éclat.
export function couleursConfettis(av = {}) {
  const gant = (GANTS[av.gant] || GANTS.blanc)[1], poignet = (POIGNETS[av.poignet] || POIGNETS.rouge)[1];
  return [gant, gant, poignet, "#FFFFFF"];
}
