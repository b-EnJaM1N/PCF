// Décide ce que disent l'arbitre et le commentateur après chaque coup.
// L'arbitre annonce les moments clés ; le commentateur parle rarement,
// à bon escient, en s'appuyant sur les vraies données du match.
import { COTE } from "./regles.js";
import { replique, repliqueScore, repliquePartout, versions, ORDINAUX, slug } from "./voix/script.js";

export function nouvelEtatAnnonces() {
  return {
    serie: { joueur: null, n: 0 },
    egalitesDeSuite: 0,
    ecartMin: 0,                  // plus gros retard du joueur dans le set (négatif)
    dernierCom: -99,              // numéro du coup du dernier commentaire
    ballesSubies: [false, false], // chaque côté a-t-il fait face à une balle de set dans ce set ?
    derniereVersion: {},
  };
}

// Choisit une version d'une situation, sans répéter la précédente.
function versionDe(etat, situation, rng) {
  const ids = versions(situation);
  const dispo = ids.length > 1 ? ids.filter(id => id !== etat.derniereVersion[situation]) : ids;
  const id = dispo[Math.floor(rng() * dispo.length)];
  etat.derniereVersion[situation] = id;
  return replique(id);
}

const SIGNE_SLUG = ["pierre", "ciseaux", "feuille"];

// match : l'état après le coup ; evt : ce que renvoie jouerCoup.
// lisibles : les 10 derniers « le modèle avait-il deviné ton coup ? ».
// Renvoie { lignes, commentaire, public, ambiance }.
export function annoncerCoup(match, evt, etat, { recents = [] } = {}, rng = Math.random) {
  const lignes = [], n = match.coups.length, len = match.format.pointsParSet;
  const peutCommenter = ecart => n - etat.dernierCom >= ecart;
  let com = null, pub = null;

  if (evt.egalite) {
    etat.egalitesDeSuite++;
    if (etat.egalitesDeSuite === 3 && peutCommenter(3)) com = "egalites";
  } else {
    etat.egalitesDeSuite = 0;
    const g = evt.gagnant, cote = COTE[g];
    etat.serie = etat.serie.joueur === g ? { joueur: g, n: etat.serie.n + 1 } : { joueur: g, n: 1 };
    if (evt.balleAvant && evt.balleAvant.joueur !== g) etat.ballesSubies[g] = true;

    if (evt.finMatch) {
      const [a, b] = [match.sets[g], match.sets[1 - g]];
      lignes.push(replique(`arbitre_jeu_set_et_match_${cote}_01`));
      lignes.push(replique(`arbitre_sets_${slug(["zéro", "un", "deux", "trois"][a])}_a_${slug(["zéro", "un", "deux", "trois"][b])}_01`));
      com = g === 0 ? (match.sets[1] > 0 ? "victoire_combat" : "victoire_nette") : "defaite";
      pub = g === 0 ? "ovation" : "set";
    } else if (evt.finSet) {
      const [pa, pb] = evt.scoreSet, haut = Math.max(pa, pb), bas = Math.min(pa, pb);
      const ordinal = slug(ORDINAUX[match.scoresSets.length - 1]);
      lignes.push(replique(`arbitre_${ordinal}_set_${cote}_01`));
      lignes.push(repliqueScore(haut, bas));
      if (etat.ballesSubies[g]) com = `set_renverse_${cote}`;
      else if (haut - bas >= 6) com = `set_ecrasant_${cote}`;
      else if (bas >= len - 1) com = "set_arrache";
      pub = "set";
    } else {
      const [a, b] = match.points, h = evt.balleApres;
      if (h) lignes.push(replique(`arbitre_balle_de_${h.type}_${COTE[h.joueur]}_01`));
      else if (a === b && a >= len - 1) lignes.push(repliquePartout(a));

      etat.ecartMin = Math.min(etat.ecartMin, a - b);
      if (evt.balleAvant && evt.balleAvant.joueur !== g && peutCommenter(2)) {
        com = evt.balleAvant.joueur === 0 ? "craquage" : "balle_sauvee";
      } else if (a === b && a >= 4 && etat.ecartMin <= -4 && peutCommenter(4)) {
        com = "remontee"; etat.ecartMin = 0;
      } else if (etat.serie.n === 4 && peutCommenter(4) && rng() < 0.7) {
        com = `serie_${cote}`;
      } else if (g === 1 && recents.length >= 8 && recents.filter(Boolean).length >= 6 && peutCommenter(6) && rng() < 0.5) {
        com = "lisible";
      }
    }
    // Le public applaudit une série de 4 points d'affilée (puis 8, 12…), mais se tait avant une balle de match.
    if (!evt.finSet && etat.serie.n % 4 === 0 && !(evt.balleApres && evt.balleApres.type === "match")) pub = "serie";
    if (evt.finSet) { etat.ecartMin = 0; etat.ballesSubies = [false, false]; }
  }

  // Le même signe trois fois de suite (pas quatre : on ne le dit qu'une fois).
  const c = match.coups;
  if (!com && n >= 3 && c[n - 1].a === c[n - 2].a && c[n - 2].a === c[n - 3].a && (n < 4 || c[n - 4].a !== c[n - 1].a) && peutCommenter(4) && rng() < 0.6) {
    com = `obstination_${SIGNE_SLUG[c[n - 1].a]}`;
  }

  let commentaire = null;
  if (com) { commentaire = versionDe(etat, com, rng); lignes.push(commentaire); etat.dernierCom = n; }

  const ambiance = match.termine ? "fin" : evt.balleApres && evt.balleApres.type === "match" ? "silence" : "murmure";
  return { lignes, commentaire, public: pub, ambiance };
}

// Annonce du début d'un set : « Premier set. », « Set décisif. »…
export function annonceDebutSet(match) {
  const decisif = match.sets[0] === match.format.setsGagnants - 1 && match.sets[1] === match.format.setsGagnants - 1;
  if (decisif) return replique("arbitre_set_decisif_01");
  return replique(`arbitre_${slug(ORDINAUX[match.scoresSets.length])}_set_01`);
}
