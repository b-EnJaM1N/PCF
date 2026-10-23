// L'Aventure de Chifoumania (solo, contre l'ordinateur, sans compte) : des mondes d'adversaires de plus en plus forts.
// Chaque combat se joue à la barre de vie : un coup gagné enlève sa force à l'adversaire, une égalité ne fait rien.
// Avant chaque coup, l'adversaire annonce son intention (parfois du bluff) ; on a peu de temps pour répondre ;
// chaque coup gagné remplit la jauge d'énergie, qui permet un coup spécial selon le signe.
// Ici, seulement les règles (testées automatiquement) ; l'écran est dans aventure-jeu.js. Scénario : docs/aventure-monde-1.md.
import { PIERRE, CISEAUX, FEUILLE, bat, contre } from "./regles.js";

export const HEROS = { vie: 100, force: 10 };          // au départ
export const GAIN = { vie: 10, force: 3 };             // à chaque adversaire battu (la première fois)
export const MAX_POUVOIRS = 3;

export const POUVOIRS = {
  loupe: { emoji: "👁️", nom: "Œil de Lynx", effet: "Pendant 3 coups, te dit si l'intention de l'adversaire est vraie ou du bluff." },
  bouclier: { emoji: "🪵", nom: "Écorce de Chêne", effet: "Si tu perds le prochain coup, tu ne perds pas de vie." },
  double: { emoji: "🐗", nom: "Frappe du Sanglier", effet: "Si tu gagnes le prochain coup, il fait deux fois plus de dégâts." },
  potion: { emoji: "🌿", nom: "Sève de Vie", effet: "Rend 30 de vie tout de suite." },
};
export const SOIN_POTION = 30, COUPS_LOUPE = 3, POISON = 5, FORCE_RAGE = 30, COUPS_RACINES = 2;

// L'énergie : +1 par coup gagné, 3 au plus. Pleine, on peut armer un coup spécial pour le coup suivant :
// gagné, il a un effet selon ton signe ; perdu ou égalité, l'énergie est perdue (c'est un pari).
export const ENERGIE_MAX = 3, SOIN_FEUILLE = 20;
export const SPECIAUX = [
  { nom: "Coup de massue", court: "×2", effet: "Pierre gagnante : deux fois plus de dégâts." },              // Pierre
  { nom: "Lame étourdissante", court: "Étourdit", effet: "Ciseaux gagnants : dégâts, et son intention suivante sera vraie." }, // Ciseaux
  { nom: "Tornade de feuilles", court: `+${SOIN_FEUILLE} vie`, effet: `Feuille gagnante : dégâts, et tu reprends ${SOIN_FEUILLE} de vie.` }, // Feuille
];
// Le temps pour répondre (en millisecondes) : chaque adversaire a le sien, et le Gardien en rage presse encore plus.
export const TEMPS_MIN = 1800;

const unSur = (m, p) => { const t = [0, 0, 0]; t[m] = p; return t; };
const repartir = (p, sauf) => [0, 1, 2].map(s => (s === sauf ? 0 : p / 2));
const somme = (...ts) => [0, 1, 2].map(s => ts.reduce((n, t) => n + t[s], 0));
const UNIFORME = [1 / 3, 1 / 3, 1 / 3];

// Chaque adversaire a une manie : probabilites(c) donne ses chances de jouer Pierre, Ciseaux, Feuille au prochain coup
// (c : le combat en cours, avec c.coups = [{ moi, lui, gagnant }]). L'Œil de Lynx montre le signe le plus probable.
export const MONDES = [{
  id: "foret", numero: 1, nom: "La Forêt des Ombres", emoji: "🌲", surnom: "jeune âme",
  intro: "Approche, jeune âme… N'aie pas peur. On m'appelle l'Enchanteresse, et ma boule de cristal m'a montré ta venue. Le Gant d'Or, celui qui donne la maîtrise du chifoumi, a disparu : le Gardien de la Forêt, un vieux golem de bois et de pierre, l'a trouvé et ne veut plus le rendre. Traverse la Forêt des Ombres. Avant chaque coup, tes adversaires annonceront ce qu'ils préparent… mais certains mentent. Et le temps t'est compté : réponds vite. Les signes te guideront.",
  adversaires: [
    {
      id: "bambi", nom: "Bambi", titre: "le faon timide", emoji: "🦌", image: "img/aventure/bambi.png", vie: 30, force: 12, recompense: "loupe", franchise: 1, temps: 5000,
      replique: "Euh… on peut faire ami-ami ?",
      mission: "Le faon que tu vois là est têtu : il garde le même signe tant qu'on ne l'a pas battu deux fois de suite. Son cœur est pur, il ne sait pas mentir : ce qu'il annonce, il le joue.",
      bravo: "Les signes ne m'ont pas trompée… Prends cet Œil de Lynx : il te dira si l'adversaire bluffe. Garde-le pour les menteurs.",
      // Même signe tant qu'il n'a pas perdu deux fois de suite ; ensuite, un autre signe.
      probabilites(c) {
        if (!c.coups.length) return UNIFORME;
        let serie = 0, doitChanger = false;   // ses défaites de suite avec le même signe (les égalités ne comptent pas)
        for (const k of c.coups) {
          if (doitChanger) { doitChanger = false; serie = 0; }
          if (k.gagnant === 0) serie++; else if (k.gagnant === 1) serie = 0;
          if (serie >= 2) doitChanger = true;
        }
        const dernier = c.coups.at(-1).lui;
        return doitChanger ? repartir(1, dernier) : unSur(dernier, 1);
      },
    },
    {
      id: "gobelin", nom: "Le Gobelin", titre: "à la massue", emoji: "👺", image: "img/aventure/gobelin.png", vie: 50, force: 18, recompense: "bouclier", franchise: 0.8, temps: 4500,
      replique: "Hé hé… tu ne vas pas gagner si facilement !",
      mission: "Le Gobelin ne se sépare jamais de sa massue… Médite sur ce qu'elle cache. Il ment parfois, mais rarement.",
      bravo: "Bien. Cette Écorce de Chêne te protégera d'un mauvais coup.",
      // La Pierre (sa massue) un coup sur deux.
      probabilites: () => somme(unSur(PIERRE, 0.5), repartir(0.5, PIERRE)),
    },
    {
      id: "pipistrelle", nom: "Pipistrelle", titre: "la chauve-souris", feminin: true, emoji: "🦇", image: "img/aventure/pipistrelle.png", vie: 60, force: 20, recompense: "double", franchise: 0.7, temps: 4000,
      replique: "Tu ne me vois pas venir !",
      mission: "Pipistrelle ne se pose jamais deux fois sur la même branche : elle ne rejoue jamais le signe d'avant. Si elle annonce le même… méfie-toi.",
      bravo: "Le cristal brille plus fort… Voici la Frappe du Sanglier : ton prochain coup gagnant frappera deux fois plus fort.",
      // Jamais deux fois de suite le même signe.
      probabilites: c => (c.coups.length ? repartir(1, c.coups.at(-1).lui) : UNIFORME),
    },
    {
      id: "amanite", nom: "L'Amanite", titre: "champignon vénéneux", feminin: true, emoji: "🍄", image: "img/aventure/amanite.png", vie: 70, force: 20, recompense: "potion", poison: POISON, franchise: 0.6, temps: 4000,
      replique: "Approche… je ne suis pas si toxique.",
      mission: "L'Amanite est ton reflet trompeur : elle copie ton coup d'avant. Et prends garde : avec elle, les égalités empoisonnent.",
      bravo: "Tu as résisté au poison… Bois cette Sève de Vie, si la nuit devient trop sombre.",
      // Copie ton coup précédent (presque toujours).
      probabilites: c => (c.coups.length ? somme(unSur(c.coups.at(-1).moi, 0.85), repartir(0.15, c.coups.at(-1).moi)) : UNIFORME),
    },
    {
      id: "loup", nom: "Le Loup gris", titre: "le rusé", emoji: "🐺", image: "img/aventure/loup.png", vie: 90, force: 22, recompense: "choix", morsure: true, franchise: 0.5, temps: 3500,
      replique: "Je sens ta peur d'ici.",
      mission: "Le Loup est rusé : quand il gagne, il insiste ; quand il perd, il prend le signe qui t'aurait battu. Il ment une fois sur deux. Ne lui laisse pas deux victoires de suite : sa morsure est cruelle.",
      bravo: "Même le Loup s'incline devant toi. Choisis le pouvoir que ton cœur désire.",
      // Gagne : il rejoue le même signe. Perd : il prend le signe qui bat le tien. Égalité : au hasard.
      probabilites(c) {
        const d = c.coups.at(-1);
        if (!d || d.gagnant === null) return UNIFORME;
        return d.gagnant === 1 ? somme(unSur(d.lui, 0.8), repartir(0.2, d.lui)) : somme(unSur(contre(d.moi), 0.8), repartir(0.2, contre(d.moi)));
      },
    },
    {
      id: "gardien", nom: "Le Gardien de la Forêt", court: "Le Gardien", titre: "golem de bois et de pierre", emoji: "🌳", image: "img/aventure/gardien.png", vie: 160, force: 24, recompense: "gant", boss: true, rage: true, racines: true, franchise: 0.65, temps: 3500,
      replique: "Nul ne quitte ma forêt avec le Gant d'Or.", repliqueRage: "LA FORÊT SE RÉVEILLE !",
      mission: "Le Gardien de la Forêt t'attend. Des poings de pierre, des branches qui coupent comme des ciseaux… Quand son cœur s'allume, il devine ton jeu, ment davantage et te presse. Garde ton énergie pour cet instant.",
      bravo: "C'était écrit… Le Gant d'Or a choisi sa main. Va, jeune âme : d'autres mondes t'attendent.",
      // Calme : surtout Pierre (ses poings) et Ciseaux (ses branches). En rage : le signe qui bat ton dernier coup (le plus souvent).
      probabilites(c) {
        if (c.enRage && c.coups.length) return somme(unSur(contre(c.coups.at(-1).moi), 0.7), [0.1, 0.1, 0.1]);
        return [0.45, 0.45, 0.1];
      },
    },
  ],
}];

// Ce que dit l'Enchanteresse après une défaite.
export const PIQUES = [
  "La chute fait partie du chemin, jeune âme. Relève-toi.",
  "Les signes parlaient… mais tu ne les as pas écoutés. Observe ses coups.",
  "Il a menti, et tu l'as cru. La prochaine fois, regarde au-delà des mots.",
  "Le temps t'a échappé. Respire, et laisse ta main répondre.",
  "Mon cristal te voit encore victorieux. Recommence.",
];

export const monde = id => MONDES.find(m => m.id === id);
export const adversaire = (m, id) => m.adversaires.find(a => a.id === id);

// ---------------------------------------------------------------- la progression (gardée sur le téléphone)
export const nouvelleProgression = () => ({ introVue: false, etoiles: {}, pouvoirs: [] });
export function normaliser(p) {
  const n = nouvelleProgression();
  if (!p || typeof p !== "object") return n;
  return {
    introVue: !!p.introVue,
    // (le boss s'appelait « grok » avant de devenir le Gardien de la Forêt)
    etoiles: Object.fromEntries(Object.entries(p.etoiles || {}).map(([id, e]) => [id === "grok" ? "gardien" : id, e]).filter(([, e]) => [1, 2, 3].includes(e))),
    pouvoirs: (Array.isArray(p.pouvoirs) ? p.pouvoirs : []).filter(k => POUVOIRS[k]).slice(0, MAX_POUVOIRS),
  };
}
export const victoires = (p, m) => m.adversaires.filter(a => p.etoiles[a.id]).length;
// Le héros grandit à chaque adversaire battu (la première fois seulement).
export const heros = (p, m) => ({ vie: HEROS.vie + GAIN.vie * victoires(p, m), force: HEROS.force + GAIN.force * victoires(p, m) });
// On ouvre un combat en battant tous ceux d'avant (une étoile isolée, restée d'un ancien essai, n'ouvre rien).
export const ouvert = (p, m, i) => m.adversaires.slice(0, i).every(a => !!p.etoiles[a.id]);
export const termine = (p, m) => m.adversaires.every(a => p.etoiles[a.id]);

// 1 étoile pour la victoire, 2 s'il reste plus de la moitié de sa vie, 3 s'il en reste plus de 80 %.
export const etoilesDe = (vie, max) => (vie <= 0 ? 0 : vie > max * 0.8 ? 3 : vie > max / 2 ? 2 : 1);

// Après une victoire : les étoiles (on garde le meilleur score) et le pouvoir gagné (3 au plus).
// choix : pour le Loup gris, le pouvoir choisi. Renvoie { progression, nouveau (premier succès), pouvoir (gagné ou null) }.
export function apresVictoire(p, adv, etoiles, choix = null) {
  const nouveau = !p.etoiles[adv.id];
  const q = { ...p, etoiles: { ...p.etoiles, [adv.id]: Math.max(etoiles, p.etoiles[adv.id] || 0) }, pouvoirs: [...p.pouvoirs] };
  const cle = adv.recompense === "choix" ? choix : adv.recompense;
  const pouvoir = POUVOIRS[cle] && q.pouvoirs.length < MAX_POUVOIRS ? cle : null;
  if (pouvoir) q.pouvoirs.push(pouvoir);
  return { progression: q, nouveau, pouvoir };
}

// ---------------------------------------------------------------- un combat
export function nouveauCombat(adv, h) {
  return {
    adv: adv.id, vie: [h.vie, adv.vie], max: [h.vie, adv.vie], force: [h.force, adv.force],
    coups: [], loupe: 0, bouclier: false, double: false, utilises: [],
    enRage: false, racines: 0, racinesFaites: false, fin: null,
    energie: 0, arme: false, etourdi: false,
  };
}

// L'intention annoncée avant le coup : le vrai signe (lui) si l'adversaire est franc, sinon un autre (bluff).
// Étourdi par une Lame étourdissante, il ne peut pas mentir. En rage, le Gardien bluffe plus souvent.
export function intentionDe(adv, c, lui, rng = Math.random) {
  const franchise = c.etourdi ? 1 : c.enRage ? Math.min(adv.franchise ?? 1, 0.4) : adv.franchise ?? 1;
  if (rng() < franchise) return lui;
  return [PIERRE, CISEAUX, FEUILLE].filter(s => s !== lui)[rng() < 0.5 ? 0 : 1];
}
// Le temps pour répondre à ce coup (millisecondes).
export const tempsDe = (adv, c) => Math.max(TEMPS_MIN, Math.round((adv.temps ?? 4000) * (c.enRage ? 0.75 : 1)));
// Armer (ou désarmer) le coup spécial : seulement avec l'énergie pleine.
export const peutArmer = c => !c.fin && c.energie >= ENERGIE_MAX;
export function armer(c, oui = !c.arme) {
  if (oui && !peutArmer(c)) throw new Error("L'énergie n'est pas pleine.");
  return { ...c, arme: oui };
}

// Les chances de l'adversaire pour le prochain coup, et le signe qu'il tire (rng : hasard, remplaçable dans les tests).
export const chancesDe = (adv, c) => adv.probabilites(c);
export function signeAdversaire(adv, c, rng = Math.random) {
  const t = chancesDe(adv, c), total = t[0] + t[1] + t[2];
  let x = rng() * total;
  for (const s of [PIERRE, CISEAUX, FEUILLE]) { if (x < t[s]) return s; x -= t[s]; }
  return FEUILLE;
}
// Ce que montre l'Œil de Lynx : le signe le plus probable et sa chance (en %).
export function indiceLoupe(adv, c) {
  const t = chancesDe(adv, c), total = t[0] + t[1] + t[2];
  const s = [0, 1, 2].reduce((a, b) => (t[b] > t[a] ? b : a), 0);
  return { signe: s, pourcent: Math.round((100 * t[s]) / total) };
}

// Utiliser un pouvoir de son sac (avant de choisir son signe). Renvoie le combat mis à jour, ou une erreur.
export function peutUtiliser(c, cle) {
  if (c.fin) return "Le combat est fini.";
  if (c.racines > 0) return "Les racines du Gardien bloquent tes pouvoirs.";
  if (cle === "loupe" && c.loupe > 0) return "L'Œil de Lynx est déjà ouvert.";
  if (cle === "bouclier" && c.bouclier) return "L'Écorce de Chêne est déjà prête.";
  if (cle === "double" && c.double) return "La Frappe du Sanglier est déjà prête.";
  if (cle === "potion" && c.vie[0] >= c.max[0]) return "Ta vie est déjà pleine.";
  return null;
}
export function utiliser(c, cle) {
  const erreur = peutUtiliser(c, cle);
  if (erreur) throw new Error(erreur);
  const d = { ...c, vie: [...c.vie], utilises: [...c.utilises, cle] };
  if (cle === "loupe") d.loupe = COUPS_LOUPE;
  if (cle === "bouclier") d.bouclier = true;
  if (cle === "double") d.double = true;
  if (cle === "potion") d.vie[0] = Math.min(d.max[0], d.vie[0] + SOIN_POTION);
  return d;
}

// Un coup : moi et lui (0 Pierre, 1 Ciseaux, 2 Feuille ; moi = null : temps écoulé, le coup est perdu). Renvoie { combat, coup } ;
// coup : { moi, lui, gagnant (0 moi, 1 lui, null égalité), degats: [perdus par moi, perdus par lui], soin,
//   effets: ["lent", "bouclier", "double", "special", "poison", "morsure", "rage", "racines"] }.
export function jouer(c, adv, moi, lui) {
  if (c.fin) throw new Error("Le combat est fini.");
  const d = { ...c, vie: [...c.vie], force: [...c.force], coups: [...c.coups] };
  const gagnant = moi === null ? 1 : moi === lui ? null : bat(moi, lui) ? 0 : 1;
  const degats = [0, 0], effets = [];
  let soin = 0;
  if (moi === null) effets.push("lent");
  const special = d.arme && gagnant === 0 ? moi : null;
  d.etourdi = false;
  if (d.arme) { d.energie = 0; d.arme = false; }   // le coup spécial est joué : gagné ou perdu, l'énergie est dépensée
  if (gagnant === 0) {
    degats[1] = d.force[0] * (d.double ? 2 : 1) * (special === PIERRE ? 2 : 1);
    if (d.double) effets.push("double");
    if (special !== null) {
      effets.push("special");
      if (special === FEUILLE) { soin = Math.min(SOIN_FEUILLE, d.max[0] - d.vie[0]); d.vie[0] += soin; }
      if (special === CISEAUX) d.etourdi = true;
    } else d.energie = Math.min(ENERGIE_MAX, d.energie + 1);
    d.double = false; d.bouclier = false;
  } else if (gagnant === 1) {
    // La morsure du Loup : après deux coups gagnés d'affilée, le suivant fait double dégâts.
    const serie = d.coups.length >= 2 && d.coups.at(-1).gagnant === 1 && d.coups.at(-2).gagnant === 1;
    const morsure = adv.morsure && serie;
    degats[0] = d.bouclier ? 0 : d.force[1] * (morsure ? 2 : 1);
    if (d.bouclier) effets.push("bouclier"); else if (morsure) effets.push("morsure");
    d.double = false; d.bouclier = false;
  } else if (adv.poison) {
    degats[0] = adv.poison; effets.push("poison");
  }
  d.vie[0] = Math.max(0, d.vie[0] - degats[0]);
  d.vie[1] = Math.max(0, d.vie[1] - degats[1]);
  d.coups.push({ moi, lui, gagnant });
  if (d.loupe > 0) d.loupe--;
  if (d.racines > 0) d.racines--;
  // Le Gardien entre en rage sous la moitié de sa vie : plus fort, et ses racines bloquent tes pouvoirs pendant 2 coups.
  if (adv.rage && !d.enRage && d.vie[1] > 0 && d.vie[1] <= d.max[1] / 2) {
    d.enRage = true; d.force[1] = FORCE_RAGE; effets.push("rage");
    if (adv.racines && !d.racinesFaites) { d.racines = COUPS_RACINES; d.racinesFaites = true; effets.push("racines"); }
  }
  if (d.vie[1] <= 0) d.fin = "victoire";
  else if (d.vie[0] <= 0) d.fin = "defaite";
  return { combat: d, coup: { moi, lui, gagnant, degats, soin, special, effets } };
}

export const piqueAuHasard = (rng = Math.random) => PIQUES[Math.floor(rng() * PIQUES.length)];
