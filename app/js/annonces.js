// Décide ce que disent les voix : l'arbitre après chaque coup, le commentateur et la commentatrice
// (rarement, à bon escient), le speaker avant le match, le journaliste après une finale.
//
// Les commentateurs ont une « réserve de parole » : elle se remplit doucement au fil des coups
// (plus vite quand le match est chaud) et chaque commentaire la vide. Ils se taisent donc la
// plupart du temps, et leurs dialogues sont réservés aux temps morts (fin de set, fin de match).
// Ils parlent toujours du joueur côté jaune (celui qui tient le téléphone) : « il » ou « elle ».
import { COTE, ecartRequis, pointDecisif } from "./regles.js";
import { lectureReussie, indiceImprevisibilite } from "./analyse.js";
import {
  replique, repliqueScore, repliquePartout, ORDINAUX, slug,
  POOLS, ligneMoment, DIALOGUES_IDS, ligneDialogue, ligneSpeaker, nbSpeaker, ligneJournaliste, CATALOGUE,
} from "./voix/script.js";
import { JOURNALISTE, REPONSES_INTERVIEW, REPONSES_DEFAITE } from "./voix/repliques.js";
import { idPartie } from "./surnoms.js";

const RESERVE_MAX = 2;

export function nouvelEtatAnnonces({ humain = false, genre = "m", finale = false } = {}) {
  return {
    humain, genre, finale,
    reserve: 1,                   // un premier commentaire est possible
    dernierCom: -99,              // numéro du coup du dernier commentaire
    dits: new Set(),              // répliques déjà dites dans ce match (id de base)
    dialoguesDits: new Set(),
    cine: false,                  // un seul clin d'œil de cinéma par match
    serie: { joueur: null, n: 0 },
    serieMaxSet: [0, 0],
    egalitesDeSuite: 0,
    ecartMin: 0,                  // plus gros retard du joueur dans le set (négatif)
    obstine: false,               // on a relevé son obstination : on attend qu'il change
  };
}

// ---------------------------------------------------------------- choisir une réplique
const CONDITIONS = {
  onze_zero: c => c.onzeZero, serie6: c => c.serie6, trois_zero: c => c.troisZero, cinq_egalites: c => c.cinqEgalites,
  balle_match: c => c.balleMatch, balle_contre: c => c.balleContre, un_partout: c => c.unPartout, finale: c => c.finale,
};

// Choisit une réplique d'un moment : jamais deux fois la même dans un match, les répliques
// « spéciales » (condition remplie) d'abord, les clins d'œil plus rarement (cinéma : une fois par match).
function choisir(etat, moment, ctx = {}, rng = Math.random) {
  const pool = POOLS[moment];
  if (!pool) return null;
  // Les jeux de mots sur un signe (« seul ») ne se disent que si le joueur vient de jouer ce signe.
  const valides = pool.filter(e => !etat.dits.has(e.base) && (!e.si || CONDITIONS[e.si]?.(ctx)) && (e.seul === undefined || e.seul === ctx.signe) && (e.clin !== "cine" || !etat.cine));
  if (!valides.length) return null;
  // Les répliques « spéciales » passent en priorité : une condition remplie (7 fois sur 10),
  // un jeu de mots sur le signe joué (4 fois sur 10, pour qu'il reste une surprise).
  const conditions = valides.filter(e => e.si), jeux = valides.filter(e => !e.si && e.seul !== undefined);
  const speciales = [...conditions, ...jeux];
  let item;
  if (conditions.length && rng() < 0.7) item = conditions[Math.floor(rng() * conditions.length)];
  else if (jeux.length && rng() < 0.4) item = jeux[Math.floor(rng() * jeux.length)];
  else {
    const groupes = { cine: [], sport: [], normal: [] };
    valides.filter(e => !e.si && e.seul === undefined).forEach(e => groupes[e.clin || "normal"].push(e));
    const r = rng();
    const ordre = r < 0.2 ? ["cine", "sport", "normal"] : r < 0.5 ? ["sport", "normal", "cine"] : ["normal", "sport", "cine"];
    const g = ordre.map(k => groupes[k]).find(x => x.length) || speciales;
    if (!g.length) return null;
    item = g[Math.floor(rng() * g.length)];
  }
  etat.dits.add(item.base);
  if (item.clin === "cine") etat.cine = true;
  return ligneMoment(item, { genre: etat.genre, signe: ctx.signe ?? 0, signeAdv: ctx.signeAdv ?? 0 });
}

// Un dialogue pas encore joué dans ce match (liste de deux répliques), ou null.
function dialogue(etat, moment, rng) {
  const dispo = DIALOGUES_IDS[moment].map((_, k) => k).filter(k => !etat.dialoguesDits.has(`${moment}_${k}`));
  if (!dispo.length) return null;
  const k = dispo[Math.floor(rng() * dispo.length)];
  etat.dialoguesDits.add(`${moment}_${k}`);
  return ligneDialogue(moment, k, etat.genre);
}

// ---------------------------------------------------------------- après chaque coup
// match : l'état après le coup ; evt : ce que renvoie jouerCoup.
// recents : les 10 derniers « le modèle avait-il deviné ton coup ? » ; auto : mon coup joué d'office.
// Renvoie { lignes, commentaire, dialogue, public, ambiance } :
//   lignes : tout ce qui est dit, dans l'ordre (arbitre, puis commentaire ou dialogue)
//   commentaire : la réplique pendant le jeu ; dialogue : les répliques du temps mort (fin de set, de match)
export function annoncerCoup(match, evt, etat, { recents = [], auto = false } = {}, rng = Math.random) {
  const lignes = [], n = match.coups.length, len = match.format.pointsParSet, court = ecartRequis(len) === 1;   // sets de 3 et 1 point
  const c = match.coups, dernier = c[n - 1];
  let pub = null, commentaire = null, dialogueFin = [];
  const ctx = { signe: dernier.a, signeAdv: dernier.b };

  // Le match chauffe : balle de set ou de match, fin de set serrée.
  const chaud = !!(evt.balleAvant || evt.balleApres) || (!court && Math.max(...match.points) >= len - 3);
  etat.reserve = Math.min(RESERVE_MAX, etat.reserve + (chaud ? 1 / 5 : 1 / 8));
  const peutCommenter = (ecart, seuil = 1) => n >= 3 && etat.reserve >= seuil && n - etat.dernierCom >= ecart;
  let moment = null;

  if (evt.egalite) {
    etat.egalitesDeSuite++;
    if ((etat.egalitesDeSuite === 3 || etat.egalitesDeSuite === 5) && peutCommenter(3)) {
      moment = "duel_esprits"; ctx.cinqEgalites = etat.egalitesDeSuite === 5;
    }
  } else {
    etat.egalitesDeSuite = 0;
    const g = evt.gagnant, cote = COTE[g];
    etat.serie = etat.serie.joueur === g ? { joueur: g, n: etat.serie.n + 1 } : { joueur: g, n: 1 };
    etat.serieMaxSet[g] = Math.max(etat.serieMaxSet[g], etat.serie.n);

    if (evt.finMatch) {
      const [a, b] = [match.sets[g], match.sets[1 - g]];
      const mot = k => slug(["zéro", "un", "deux", "trois"][k]);
      lignes.push(replique(`arbitre_jeu_set_et_match_${cote}_01`));
      if (match.format.setsGagnants > 1) lignes.push(replique(`arbitre_sets_${mot(a)}_a_${mot(b)}_01`));
      else lignes.push(repliqueScore(Math.max(...evt.scoreSet), Math.min(...evt.scoreSet)));   // match en un set : le score du set
      dialogueFin = finDeMatch(match, evt, etat, ctx, rng);
      pub = g === 0 ? "ovation" : "set";
    } else if (evt.finSet) {
      const [pa, pb] = evt.scoreSet, haut = Math.max(pa, pb), bas = Math.min(pa, pb);
      lignes.push(replique(`arbitre_${slug(ORDINAUX[match.scoresSets.length - 1])}_set_${cote}_01`));
      lignes.push(repliqueScore(haut, bas));
      dialogueFin = finDeSet(match, evt, etat, { ...ctx, haut, bas, court }, rng);
      pub = "set";
    } else {
      const [a, b] = match.points, h = evt.balleApres;
      if (h) lignes.push(replique(`arbitre_balle_de_${h.type}_${COTE[h.joueur]}_01`));
      else if (pointDecisif(match)) lignes.push(replique("arbitre_point_decisif_01"));
      else if (!court && a === b && a >= len - 1) lignes.push(repliquePartout(a));

      etat.ecartMin = Math.min(etat.ecartMin, a - b);
      const obstination = n >= 3 && c[n - 1].a === c[n - 2].a && c[n - 2].a === c[n - 3].a && (n < 4 || c[n - 4].a !== c[n - 1].a);
      if (evt.balleAvant && evt.balleAvant.joueur !== g && peutCommenter(3, 0.5)) {
        moment = evt.balleAvant.joueur === 0 ? "craquage" : "balle_sauvee";
        if (moment === "balle_sauvee" && evt.balleAvant.type === "match" && rng() < 0.5) moment = "main_legendaire";
      } else if (a === b && a >= 4 && etat.ecartMin <= -4 && peutCommenter(3, 0.5)) {
        moment = "remontee"; etat.ecartMin = 0;
      } else if ((etat.serie.n === 4 || etat.serie.n === 6) && peutCommenter(4) && rng() < 0.7) {
        moment = g === 0 ? "serie_pour" : "serie_contre"; ctx.serie6 = etat.serie.n === 6;
      } else if (auto && peutCommenter(4) && rng() < 0.6) {
        moment = "temps_ecoule"; ctx.balleMatch = evt.balleAvant?.type === "match";
      } else if (etat.obstine && c[n - 1].a !== c[n - 2].a && peutCommenter(2) && rng() < 0.5) {
        moment = "changement"; etat.obstine = false;
      } else if (obstination && peutCommenter(4) && rng() < 0.6) {
        moment = "obstination"; etat.obstine = true;
      } else if (g === 1 && recents.length >= 8 && recents.filter(Boolean).length >= 6 && peutCommenter(6) && rng() < 0.5) {
        moment = "lecture_subie";
      } else if (lectureReussie(c) && peutCommenter(5) && rng() < 0.5) {
        moment = "lecture_reussie";
      } else if (h && h.type === "match" && peutCommenter(3, 0.5) && rng() < 0.5) {
        moment = "tension"; ctx.balleContre = h.joueur === 1;
      } else if (!h && pointDecisif(match) && peutCommenter(3, 0.5) && rng() < 0.5) {
        moment = "point_decisif";
      }
    }
    // Le public applaudit une série de 4 points d'affilée (puis 8, 12…), mais se tait avant une balle de match.
    if (!evt.finSet && etat.serie.n % 4 === 0 && !(evt.balleApres && evt.balleApres.type === "match")) pub = "serie";
    if (evt.finSet) { etat.ecartMin = 0; etat.serieMaxSet = [0, 0]; }
  }
  // Sur une égalité, il peut aussi avoir changé de signe : on n'attend plus.
  if (evt.egalite && etat.obstine && n >= 2 && c[n - 1].a !== c[n - 2].a) etat.obstine = false;

  if (moment) {
    commentaire = choisir(etat, moment, ctx, rng);
    if (commentaire) { lignes.push(commentaire); etat.dernierCom = n; etat.reserve = Math.max(0, etat.reserve - 1); }
  }
  lignes.push(...dialogueFin);

  const ambiance = match.termine ? "fin" : evt.balleApres && evt.balleApres.type === "match" ? "silence" : "murmure";
  return { lignes, commentaire, dialogue: dialogueFin, public: pub, ambiance };
}

// Temps mort de fin de set : une réplique ou un dialogue, et un mot si le set suivant est décisif.
function finDeSet(match, evt, etat, ctx, rng) {
  const out = [], { haut, bas, court } = ctx, len = match.format.pointsParSet;
  const decisifEnSuite = match.sets[0] === match.format.setsGagnants - 1 && match.sets[1] === match.format.setsGagnants - 1;
  const ajoute = x => { if (x) Array.isArray(x) ? out.push(...x) : out.push(x); };
  if (!court) {
    if (haut - bas >= 6) ajoute(choisir(etat, "set_ecrasant", { ...ctx, onzeZero: haut === 11 && bas === 0 }, rng));
    else if (bas >= len - 1) ajoute(choisir(etat, "set_couteau", ctx, rng));
    else if (etat.serieMaxSet[0] >= 6 && !etat.dialoguesDits.has("serie_0")) ajoute(dialogue(etat, "serie", rng));
    else if (rng() < 0.5) ajoute(dialogue(etat, "fin_set", rng) || choisir(etat, "resume_set", ctx, rng));
    else ajoute(choisir(etat, "resume_set", { ...ctx, unPartout: match.sets[0] === 1 && match.sets[1] === 1 }, rng));
  }
  if (decisifEnSuite && match.format.setsGagnants > 1) {
    ajoute(rng() < 0.4 ? dialogue(etat, "set_decisif", rng) : choisir(etat, "set_decisif", ctx, rng));
  }
  return out;
}

// Temps mort de fin de match.
function finDeMatch(match, evt, etat, ctx, rng) {
  const out = [], ajoute = x => { if (x) Array.isArray(x) ? out.push(...x) : out.push(x); };
  if (evt.gagnant === 0) {
    const premierPerdu = match.scoresSets.length > 1 && match.scoresSets[0][0] < match.scoresSets[0][1];
    const troisZero = match.sets[0] === 3 && match.sets[1] === 0;
    if (premierPerdu) ajoute(choisir(etat, "renversement", ctx, rng));
    else if (troisZero || rng() < 0.5) ajoute(choisir(etat, "balle_match_convertie", { ...ctx, troisZero }, rng));
    if (etat.finale) {
      if (!out.length) ajoute(choisir(etat, "main_legendaire", ctx, rng));
      ajoute(rng() < 0.5 ? dialogue(etat, "titre", rng) : choisir(etat, "victoire", { ...ctx, finale: true }, rng));
    } else if (!out.length || rng() < 0.4) ajoute(choisir(etat, "victoire", ctx, rng));
  } else if (rng() < 0.3) ajoute(dialogue(etat, "fin_match", rng));
  else ajoute(choisir(etat, "defaite", ctx, rng));
  return out;
}

// Annonce du début d'un set : « Premier set. », « Set décisif. »…
export function annonceDebutSet(match) {
  if (match.format.setsGagnants === 1) return replique("arbitre_set_unique_01");
  const decisif = match.sets[0] === match.format.setsGagnants - 1 && match.sets[1] === match.format.setsGagnants - 1;
  if (decisif) return match.format.setsGagnants === 2 ? replique("arbitre_troisieme_et_dernier_set_01") : replique("arbitre_set_decisif_01");
  return replique(`arbitre_${slug(ORDINAUX[match.scoresSets.length])}_set_01`);
}

// ---------------------------------------------------------------- avant le match : le speaker
// Ce que le speaker peut dire d'un joueur, du plus marquant au plus banal.
// rel : { advId (pour la revanche), niveauMoi, niveauAdv }
export function etiquettesDe(P, { advId = null, niveauMoi = null, niveauAdv = null } = {}) {
  if (!P || !P.matchs) return ["debutant"];
  const out = [], contreLui = advId ? (P.derniers || []).find(d => d.adv === advId) : null;
  if (contreLui && !contreLui.gagne) out.push("laver_affront");
  if (niveauMoi !== null && niveauAdv !== null && niveauMoi - niveauAdv >= 150) out.push("patron");
  if (P.serieEnCours >= 5) out.push("serie");
  else if (P.serieEnCours >= 3) out.push("invaincu");
  if (P.tournoisGagnes >= 1) out.push("trophee");
  if (P.derniers?.[0] && !P.derniers[0].gagne && !out.includes("laver_affront")) out.push("faim");
  if (P.lisibles >= 30 && indiceImprevisibilite(P.devines / P.lisibles) >= 80) out.push("imprevisible");
  if (P.matchs >= 100) out.push("habitue");
  return out;
}
// Une seule étiquette : souvent la plus marquante, parfois une autre, et parfois rien (sauf pour un début).
export function etiquetteDe(P, rel = {}, rng = Math.random) {
  const l = etiquettesDe(P, rel);
  if (l[0] === "debutant") return "debutant";
  if (!l.length) return rng() < 0.3 ? "figuration" : null;
  if (rng() < 0.2) return null;
  return rng() < 0.6 ? l[0] : l[Math.floor(rng() * l.length)];
}

// Les situations du match que le speaker peut relever.
export function situationsDuMatch({ humain = false, dejaJoues = false, niveauMoi = null, niveauAdv = null, memePays = false,
  date = new Date(), rapide = false, officiel = false, setsGagnants = 2 } = {}) {
  const s = [], h = date.getHours();
  if (humain && dejaJoues) s.push("revanche");
  if (niveauMoi !== null && niveauAdv !== null) {
    if (niveauAdv - niveauMoi >= 150) s.push("david_goliath");
    else if (humain && Math.abs(niveauAdv - niveauMoi) <= 15) s.push("coude_a_coude");
  }
  if (humain && memePays) s.push("compatriotes");
  if (h >= 23 || h < 5) s.push("nuit");
  else if (h >= 5 && h < 9) s.push("matin");
  if (date.getDay() === 0) s.push("dimanche");
  if (rapide) s.push("partie_rapide");
  if (officiel) s.push("officiel");
  if (setsGagnants === 1) s.push("un_set");
  if (setsGagnants >= 3) s.push("marathon");
  if (!humain) s.push("contre_bot");
  return s;
}
// Les plus rares d'abord : une revanche ou un David contre Goliath se remarquent plus qu'un match du dimanche.
const RARES = ["revanche", "david_goliath", "compatriotes", "coude_a_coude", "nuit", "matin", "partie_rapide"];

const TOURS = ["huitiemes", "quarts", "demis", "finale"];
const partiesSurnom = s => (s ? [CATALOGUE.get(idPartie(s.nom)), CATALOGUE.get(idPartie(s.complement))] : []);

// moi, adv : { surnom (voir surnomDe), genre, etiquette, bot (id d'un bot) }.
// tour : "huitiemes", "quarts", "demis", "finale" (ou null) ; sng : premier tour d'un Sit & Go.
// situations : situationsDuMatch() ; recents : les phrases dites aux derniers matchs (on évite de les répéter).
// Renvoie { speaker, commentaires } : les deux listes de répliques, dans l'ordre.
export function annoncesAvantMatch({ moi = {}, adv = {}, tour = null, sng = false, humain = false, domination = false, genre = "m",
  situations = [], recents = [] } = {}, rng = Math.random) {
  const deja = new Set(recents);
  // Une version de la phrase, en évitant celles déjà entendues récemment.
  const dire = (cle, g = "m") => {
    const n = nbSpeaker(cle), ks = [...Array(n).keys()];
    const neuves = ks.filter(k => !deja.has(ligneSpeaker(cle, k, g).id));
    const k = (neuves.length ? neuves : ks)[Math.floor(rng() * (neuves.length || n))];
    return ligneSpeaker(cle, k, g);
  };
  const sp = [];
  if (sng) sp.push(ligneSpeaker("sit_and_go", 0));
  else if (TOURS.includes(tour)) sp.push(ligneSpeaker(tour, 0));
  else sp.push(dire("bienvenue"));
  if (situations.length) {
    const rares = situations.filter(x => RARES.includes(x));
    const liste = rares.length && rng() < 0.7 ? rares : situations;
    sp.push(dire(liste[Math.floor(rng() * liste.length)]));
  }
  sp.push(dire("coin_jaune"));
  if (moi.etiquette) sp.push(ligneSpeaker(moi.etiquette, 0, moi.genre));
  sp.push(...partiesSurnom(moi.surnom));
  sp.push(dire("coin_rouge", moi.genre));
  if (adv.bot && CATALOGUE.has(`speaker_bot_${adv.bot}_01`)) sp.push(CATALOGUE.get(`speaker_bot_${adv.bot}_01`));
  else {
    if (adv.etiquette) sp.push(ligneSpeaker(adv.etiquette, 0, adv.genre));
    sp.push(...partiesSurnom(adv.surnom));
  }
  if (humain && moi.surnom && adv.surnom && moi.surnom.texte === adv.surnom.texte) sp.push(dire("miroir"));
  sp.push(dire("cloture"));

  // Les commentateurs lancent le match (en évitant, eux aussi, ce qu'ils ont dit récemment).
  const etat = nouvelEtatAnnonces({ humain, genre });
  recents.forEach(id => { const m = /^commentat(?:eur|rice)_dialogue_avant_match_(\d\d)/.exec(id); if (m) etat.dialoguesDits.add(`avant_match_${+m[1] - 1}`); });
  let com = null;
  if (domination) com = choisir(etat, "domination", {}, rng);
  else if (humain && rng() < 0.5) com = choisir(etat, "humain", {}, rng);
  const commentaires = com ? [com] : rng() < 0.6 ? dialogue(etat, "avant_match", rng) || [] : [];
  return { speaker: sp.filter(Boolean), commentaires };
}

// ---------------------------------------------------------------- après une finale : l'interview
// gagne : le joueur a remporté la finale. Renvoie la question (réplique du journaliste),
// trois réponses au choix (texte seulement) et le mot de la fin.
export function interview(gagne, rng = Math.random) {
  const cle = gagne ? "question" : "question_defaite";
  const question = ligneJournaliste(cle, Math.floor(rng() * JOURNALISTE[cle].length));
  const reste = [...(gagne ? REPONSES_INTERVIEW : REPONSES_DEFAITE)];
  const reponses = [];
  while (reponses.length < 3 && reste.length) reponses.push(reste.splice(Math.floor(rng() * reste.length), 1)[0]);
  const conclusion = ligneJournaliste("conclusion", Math.floor(rng() * JOURNALISTE.conclusion.length));
  return { champion: gagne ? ligneSpeaker("champion", 0) : null, question, reponses, conclusion };
}
