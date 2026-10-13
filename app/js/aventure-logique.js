// Le Mode Aventure (solo, contre l'ordinateur, sans compte) : des mondes d'adversaires de plus en plus forts.
// Chaque combat se joue à la barre de vie : un coup gagné enlève sa force à l'adversaire, une égalité ne fait rien.
// Ici, seulement les règles (testées automatiquement) ; l'écran est dans ecran-aventure.js. Scénario : docs/aventure-monde-1.md.
import { PIERRE, CISEAUX, FEUILLE, bat, contre } from "./regles.js";

export const HEROS = { vie: 100, force: 10 };          // au départ
export const GAIN = { vie: 10, force: 3 };             // à chaque adversaire battu (la première fois)
export const MAX_POUVOIRS = 3;

export const POUVOIRS = {
  loupe: { emoji: "🔍", nom: "Loupe", effet: "Pendant 3 coups, montre le signe que l'adversaire prépare le plus souvent." },
  bouclier: { emoji: "🛡️", nom: "Bouclier", effet: "Si tu perds le prochain coup, tu ne perds pas de vie." },
  double: { emoji: "⚔️", nom: "Coup double", effet: "Si tu gagnes le prochain coup, il fait deux fois plus de dégâts." },
  potion: { emoji: "🧪", nom: "Potion", effet: "Rend 30 de vie tout de suite." },
};
export const SOIN_POTION = 30, COUPS_LOUPE = 3, POISON = 5, FORCE_RAGE = 30, COUPS_RACINES = 2;

const unSur = (m, p) => { const t = [0, 0, 0]; t[m] = p; return t; };
const repartir = (p, sauf) => [0, 1, 2].map(s => (s === sauf ? 0 : p / 2));
const somme = (...ts) => [0, 1, 2].map(s => ts.reduce((n, t) => n + t[s], 0));
const UNIFORME = [1 / 3, 1 / 3, 1 / 3];

// Chaque adversaire a une manie : probabilites(c) donne ses chances de jouer Pierre, Ciseaux, Feuille au prochain coup
// (c : le combat en cours, avec c.coups = [{ moi, lui, gagnant }]). La Loupe montre le signe le plus probable.
export const MONDES = [{
  id: "foret", numero: 1, nom: "La Forêt des Ombres", emoji: "🌲", surnom: "petit scarabée",
  intro: "Bonjour, petit scarabée. Tu veux devenir un as de la discipline ? Alors suis mes conseils. J'ai été championne en 1997. Toi, pour l'instant, tu n'es rien. Le Roi des Gobelins a volé le Gant d'Or : va le chercher au fond de la Forêt des Ombres. Et tiens-toi droit.",
  adversaires: [
    {
      id: "bambi", nom: "Bambi", titre: "le faon timide", emoji: "🦌", image: "img/aventure/bambi.png", vie: 30, force: 12, recompense: "loupe",
      replique: "Euh… on peut faire ami-ami ?",
      mission: "Commence par Bambi. Il est têtu : il rejoue le même signe tant qu'il n'a pas perdu deux fois. Même toi, tu devrais y arriver.",
      bravo: "Bien. Tiens, une Loupe. Elle te montre ce que l'autre prépare. Ne la gaspille pas.",
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
      id: "gobelin", nom: "Le Gobelin", titre: "à la massue", emoji: "👺", image: "img/aventure/gobelin.png", vie: 50, force: 18, recompense: "bouclier",
      replique: "Hé hé… tu ne vas pas gagner si facilement !",
      mission: "Le Gobelin ne lâche jamais sa massue. Réfléchis deux secondes à ce que ça veut dire.",
      bravo: "Pas mal. Prends ce Bouclier, tu en auras besoin.",
      // La Pierre (sa massue) un coup sur deux.
      probabilites: () => somme(unSur(PIERRE, 0.5), repartir(0.5, PIERRE)),
    },
    {
      id: "pipistrelle", nom: "Pipistrelle", titre: "la chauve-souris", feminin: true, emoji: "🦇", image: "img/aventure/pipistrelle.png", vie: 60, force: 20, recompense: "double",
      replique: "Tu ne me vois pas venir !",
      mission: "La chauve-souris ne tient pas en place : jamais deux fois le même signe. Sers-toi de ta tête.",
      bravo: "Correct. Voici un Coup double. Frappe fort, pour une fois.",
      // Jamais deux fois de suite le même signe.
      probabilites: c => (c.coups.length ? repartir(1, c.coups.at(-1).lui) : UNIFORME),
    },
    {
      id: "amanite", nom: "L'Amanite", titre: "champignon vénéneux", feminin: true, emoji: "🍄", image: "img/aventure/amanite.png", vie: 70, force: 20, recompense: "potion", poison: POISON,
      replique: "Approche… je ne suis pas si toxique.",
      mission: "L'Amanite t'imite, comme un mauvais élève. Et méfie-toi des égalités : elles empoisonnent.",
      bravo: "Tu as encore tes deux mains ? Bien. Une Potion, au cas où.",
      // Copie ton coup précédent (presque toujours).
      probabilites: c => (c.coups.length ? somme(unSur(c.coups.at(-1).moi, 0.85), repartir(0.15, c.coups.at(-1).moi)) : UNIFORME),
    },
    {
      id: "loup", nom: "Le Loup gris", titre: "le rusé", emoji: "🐺", image: "img/aventure/loup.png", vie: 90, force: 22, recompense: "choix", morsure: true,
      replique: "Je sens ta peur d'ici.",
      mission: "Le Loup sent la peur. Quand il gagne, il insiste. Quand il perd, il change. Ne lui laisse pas deux victoires d'affilée.",
      bravo: "Choisis ton pouvoir. Et réfléchis, cette fois.",
      // Gagne : il rejoue le même signe. Perd : il prend le signe qui bat le tien. Égalité : au hasard.
      probabilites(c) {
        const d = c.coups.at(-1);
        if (!d || d.gagnant === null) return UNIFORME;
        return d.gagnant === 1 ? somme(unSur(d.lui, 0.8), repartir(0.2, d.lui)) : somme(unSur(contre(d.moi), 0.8), repartir(0.2, contre(d.moi)));
      },
    },
    {
      id: "grok", nom: "Grok", titre: "le Roi des Gobelins", emoji: "👑", image: "img/aventure/grok.png", vie: 160, force: 24, recompense: "gant", boss: true, rage: true, racines: true,
      replique: "Le Gant d'Or est à moi !", repliqueRage: "ASSEZ JOUÉ !",
      mission: "Grok. Il cogne avec la Pierre et les Ciseaux… et quand il se fâche, il lit dans ton jeu. Ne sois pas prévisible.",
      bravo: "… Pas mal, petit scarabée. Pas mal du tout. Ne le répète à personne.",
      // Calme : surtout Pierre et Ciseaux. En rage : le signe qui bat ton dernier coup (le plus souvent).
      probabilites(c) {
        if (c.enRage && c.coups.length) return somme(unSur(contre(c.coups.at(-1).moi), 0.7), [0.1, 0.1, 0.1]);
        return [0.45, 0.45, 0.1];
      },
    },
  ],
}];

export const PIQUES = [
  "Muscle ton jeu.",
  "En 1997, j'aurais gagné les yeux fermés.",
  "C'est tout ? Recommence.",
  "Tu as regardé ses coups, au moins ?",
  "Même ma grand-mère l'aurait lu, celui-là.",
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
    etoiles: Object.fromEntries(Object.entries(p.etoiles || {}).filter(([, e]) => [1, 2, 3].includes(e))),
    pouvoirs: (Array.isArray(p.pouvoirs) ? p.pouvoirs : []).filter(k => POUVOIRS[k]).slice(0, MAX_POUVOIRS),
  };
}
export const victoires = (p, m) => m.adversaires.filter(a => p.etoiles[a.id]).length;
// Le héros grandit à chaque adversaire battu (la première fois seulement).
export const heros = (p, m) => ({ vie: HEROS.vie + GAIN.vie * victoires(p, m), force: HEROS.force + GAIN.force * victoires(p, m) });
// On ouvre un combat en battant le précédent.
export const ouvert = (p, m, i) => i === 0 || !!p.etoiles[m.adversaires[i - 1].id];
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
  };
}

// Les chances de l'adversaire pour le prochain coup, et le signe qu'il tire (rng : hasard, remplaçable dans les tests).
export const chancesDe = (adv, c) => adv.probabilites(c);
export function signeAdversaire(adv, c, rng = Math.random) {
  const t = chancesDe(adv, c), total = t[0] + t[1] + t[2];
  let x = rng() * total;
  for (const s of [PIERRE, CISEAUX, FEUILLE]) { if (x < t[s]) return s; x -= t[s]; }
  return FEUILLE;
}
// Ce que montre la Loupe : le signe le plus probable et sa chance (en %).
export function indiceLoupe(adv, c) {
  const t = chancesDe(adv, c), total = t[0] + t[1] + t[2];
  const s = [0, 1, 2].reduce((a, b) => (t[b] > t[a] ? b : a), 0);
  return { signe: s, pourcent: Math.round((100 * t[s]) / total) };
}

// Utiliser un pouvoir de son sac (avant de choisir son signe). Renvoie le combat mis à jour, ou une erreur.
export function peutUtiliser(c, cle) {
  if (c.fin) return "Le combat est fini.";
  if (c.racines > 0) return "Les racines de Grok bloquent tes pouvoirs.";
  if (cle === "loupe" && c.loupe > 0) return "La Loupe est déjà active.";
  if (cle === "bouclier" && c.bouclier) return "Le Bouclier est déjà levé.";
  if (cle === "double" && c.double) return "Le Coup double est déjà prêt.";
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

// Un coup : moi et lui (0 Pierre, 1 Ciseaux, 2 Feuille). Renvoie { combat, coup } ;
// coup : { moi, lui, gagnant (0 moi, 1 lui, null égalité), degats: [perdus par moi, perdus par lui], effets: ["bouclier", "double", "poison", "morsure", "rage", "racines"] }.
export function jouer(c, adv, moi, lui) {
  if (c.fin) throw new Error("Le combat est fini.");
  const d = { ...c, vie: [...c.vie], force: [...c.force], coups: [...c.coups] };
  const gagnant = moi === lui ? null : bat(moi, lui) ? 0 : 1;
  const degats = [0, 0], effets = [];
  if (gagnant === 0) {
    degats[1] = d.force[0] * (d.double ? 2 : 1);
    if (d.double) effets.push("double");
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
  // Grok entre en rage sous la moitié de sa vie : plus fort, et ses racines bloquent tes pouvoirs pendant 2 coups.
  if (adv.rage && !d.enRage && d.vie[1] > 0 && d.vie[1] <= d.max[1] / 2) {
    d.enRage = true; d.force[1] = FORCE_RAGE; effets.push("rage");
    if (adv.racines && !d.racinesFaites) { d.racines = COUPS_RACINES; d.racinesFaites = true; effets.push("racines"); }
  }
  if (d.vie[1] <= 0) d.fin = "victoire";
  else if (d.vie[0] <= 0) d.fin = "defaite";
  return { combat: d, coup: { moi, lui, gagnant, degats, effets } };
}

export const piqueAuHasard = (rng = Math.random) => PIQUES[Math.floor(rng() * PIQUES.length)];
