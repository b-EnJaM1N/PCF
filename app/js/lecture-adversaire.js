// Lire l'adversaire : ce que montrent ses coups depuis le début du match (répartition, réflexes),
// et la piste qui en découle pour le prochain coup. Tout se déduit de l'historique, visible des deux joueurs.
// Les coups : { a: mon signe, b: son signe, gagnant: 0 (moi), 1 (lui) ou null (égalité) }.
// Les signes : 0 = Pierre, 1 = Ciseaux, 2 = Feuille ; x bat y quand (x + 1) % 3 === y.

import { nouveauMatch, jouerCoup } from "./regles.js";
import { flairEtEndurance } from "./flair.js";
export const NOMS = ["Pierre", "Ciseaux", "Feuille"];
export const EMOJIS = ["🪨", "✂️", "📄"];
const NOMS_LE = ["la Pierre", "les Ciseaux", "la Feuille"];
export const quiBat = x => (x + 2) % 3;          // le signe qui bat x
const pct = (k, n) => Math.round((100 * k) / n);

// Combien de fois il a joué chaque signe.
export function repartition(coups) {
  const r = [0, 0, 0];
  for (const c of coups) r[c.b]++;
  return r;
}

// Ses réflexes repérés : { cle, texte, force, prevision(coups) → son prochain signe probable (ou une liste) }.
// force : de 0 à 1 (la régularité du réflexe), il faut l'avoir vu assez souvent pour le citer.
export function habitudes(coups) {
  const n = coups.length, liste = [];
  if (n < 4) return liste;
  const ajouter = (cle, vus, oui, seuil, texte, prevision) => {
    if (vus >= 3 && oui / vus >= seuil) liste.push({ cle, texte: `${texte} (${oui} fois sur ${vus})`, force: (oui / vus) * Math.min(1, vus / 6), prevision });
  };
  // Son signe favori.
  const r = repartition(coups), fav = r.indexOf(Math.max(...r));
  if (n >= 6 && r[fav] / n >= 0.5) liste.push({ cle: "favori", texte: `Il joue beaucoup ${NOMS_LE[fav]} (${pct(r[fav], n)} %)`, force: r[fav] / n, prevision: () => fav });
  // Ce qu'il fait après une victoire, après une défaite, et d'un coup à l'autre.
  let vV = 0, rejoueV = 0, vD = 0, changeD = 0, rep = 0, boucle = 0, copie = 0, contre = 0;
  for (let i = 1; i < n; i++) {
    const p = coups[i - 1], c = coups[i];
    if (p.gagnant === 1) { vV++; if (c.b === p.b) rejoueV++; }
    if (p.gagnant === 0) { vD++; if (c.b !== p.b) changeD++; }
    if (c.b === p.b) rep++;
    if (c.b === quiBat(p.b)) boucle++;                 // Pierre → Feuille → Ciseaux → Pierre…
    if (c.b === p.a) copie++;                          // il rejoue mon dernier signe
    if (c.b === quiBat(p.a)) contre++;                 // il joue ce qui battait mon dernier signe
  }
  const t = n - 1;
  ajouter("rejoue_victoire", vV, rejoueV, 0.6, "Après une victoire, il rejoue le même signe", cs => cs.at(-1).b);
  ajouter("change_defaite", vD, changeD, 0.8, "Après une défaite, il change de signe", cs => [0, 1, 2].filter(s => s !== cs.at(-1).b));
  if (t >= 5 && rep === 0) liste.push({ cle: "jamais_deux", texte: "Il ne rejoue jamais deux fois de suite le même signe", force: Math.min(1, t / 8), prevision: cs => [0, 1, 2].filter(s => s !== cs.at(-1).b) });
  ajouter("boucle", t, boucle, 0.7, "Il tourne en boucle : Pierre, Feuille, Ciseaux…", cs => quiBat(cs.at(-1).b));
  ajouter("copie", t, copie, 0.6, "Il rejoue souvent ton dernier signe", cs => cs.at(-1).a);
  ajouter("contre", t, contre, 0.6, "Il joue souvent ce qui battait ton dernier signe", cs => quiBat(cs.at(-1).a));
  return liste.sort((x, y) => y.force - x.force);
}

// Le réflexe qui s'applique au prochain coup (« après une victoire » ne vaut que s'il vient de gagner…).
export const s_applique = (h, dernier) => (h.cle === "rejoue_victoire" ? dernier.gagnant === 1 : h.cle === "change_defaite" ? dernier.gagnant === 0 : true);

// La piste pour le prochain coup, ou null : { signe à jouer, texte }.
export function piste(coups) {
  if (coups.length < 4) return null;
  const dernier = coups.at(-1), h = habitudes(coups).find(x => s_applique(x, dernier));
  if (!h) return null;
  const prevu = h.prevision(coups);
  if (Array.isArray(prevu)) {
    // Il va jouer l'un de deux signes : celui des deux qui bat l'autre ne peut pas perdre.
    const [x, y] = prevu, sur = (x + 1) % 3 === y ? x : y;
    return { signe: sur, texte: `Il devrait éviter ${NOMS_LE[dernier.b]} : avec ${NOMS_LE[sur]}, tu gagnes ou tu fais égalité.` };
  }
  const jouer = quiBat(prevu);
  return { signe: jouer, texte: `S'il garde ce réflexe, il va jouer ${NOMS_LE[prevu]} : ${NOMS_LE[jouer]} le bat.` };
}

// À la fin du match : combien de fois j'ai contré la piste (j'ai joué le signe conseillé et gagné le point).
export function lecturesReussies(coups) {
  let k = 0;
  for (let i = 4; i < coups.length; i++) {
    const p = piste(coups.slice(0, i));
    if (p && coups[i].a === p.signe && coups[i].gagnant === 0) k++;
  }
  return k;
}

// ---------------------------------------------------------------- le dossier de l'adversaire (avant le match)
// On résume ses matchs passés en compteurs (petits, faciles à additionner et à garder dans la fiche),
// puis on en tire ses habitudes. Les coups sont vus de son côté comme ci-dessus : b = son signe, a = celui d'en face,
// gagnant = 1 quand c'est lui qui gagne le point.
export const compteVide = () => ({ matchs: 0, coups: 0, signes: [0, 0, 0], premiers: [0, 0, 0],
  apresVictoire: 0, rejoueVictoire: 0, apresDefaite: 0, changeDefaite: 0, transitions: 0, repete: 0, boucle: 0, copie: 0, contre: 0 });

// Les compteurs d'un match.
export function compterMatch(coups) {
  const k = compteVide();
  if (!coups || !coups.length) return k;
  k.matchs = 1; k.coups = coups.length; k.premiers[coups[0].b]++;
  coups.forEach((c, i) => {
    k.signes[c.b]++;
    const p = coups[i - 1];
    if (!p) return;
    k.transitions++;
    if (p.gagnant === 1) { k.apresVictoire++; if (c.b === p.b) k.rejoueVictoire++; }
    if (p.gagnant === 0) { k.apresDefaite++; if (c.b !== p.b) k.changeDefaite++; }
    if (c.b === p.b) k.repete++;
    if (c.b === quiBat(p.b)) k.boucle++;
    if (c.b === p.a) k.copie++;
    if (c.b === quiBat(p.a)) k.contre++;
  });
  return k;
}

// La somme de deux résumés (un résumé abîmé ou absent compte pour zéro).
export function additionner(x, y) {
  const r = compteVide(), ok = v => (Number.isFinite(v) && v > 0 ? v : 0);
  for (const cle of Object.keys(r)) {
    if (Array.isArray(r[cle])) r[cle] = r[cle].map((_, i) => ok(x?.[cle]?.[i]) + ok(y?.[cle]?.[i]));
    else r[cle] = ok(x?.[cle]) + ok(y?.[cle]);
  }
  return r;
}

// Le dossier : la répartition de ses signes (en %), et ses habitudes les plus nettes, de la plus forte à la plus faible.
// null s'il n'y a pas encore assez de coups pour dire quoi que ce soit. elle : on parle d'une joueuse (ou d'une bot).
export function dossier(k, { max = 4, elle = false } = {}) {
  if (!k || k.coups < 10) return null;
  const n = k.coups, liste = [];
  const ajouter = (texte, vus, oui, seuil) => {
    if (vus >= 6 && oui / vus >= seuil) liste.push({ texte: `${texte} (${oui} fois sur ${vus})`, force: (oui / vus) * Math.min(1, vus / 12) });
  };
  const fav = k.signes.indexOf(Math.max(...k.signes));
  if (k.signes[fav] / n >= 0.4) liste.push({ texte: `Son signe préféré : ${NOMS_LE[fav]} (${pct(k.signes[fav], n)} % de ses coups)`, force: k.signes[fav] / n });
  const p1 = k.premiers.indexOf(Math.max(...k.premiers));
  if (k.matchs >= 3 && k.premiers[p1] / k.matchs >= 0.6) liste.push({ texte: `Pour son premier coup, il joue souvent ${NOMS_LE[p1]} (${k.premiers[p1]} matchs sur ${k.matchs})`, force: k.premiers[p1] / k.matchs });
  ajouter("Après un point gagné, il rejoue le même signe", k.apresVictoire, k.rejoueVictoire, 0.55);
  ajouter("Après un point perdu, il change de signe", k.apresDefaite, k.changeDefaite, 0.75);
  ajouter("Il rejoue rarement deux fois de suite le même signe", k.transitions, k.transitions - k.repete, 0.85);
  ajouter("Il tourne souvent en boucle : Pierre, Feuille, Ciseaux…", k.transitions, k.boucle, 0.55);
  ajouter("Il rejoue souvent le dernier signe de son adversaire", k.transitions, k.copie, 0.5);
  ajouter("Il joue souvent ce qui battait le dernier signe de son adversaire", k.transitions, k.contre, 0.5);
  return {
    matchs: k.matchs, coups: n,
    repartition: k.signes.map(s => pct(s, n)),
    habitudes: liste.sort((x, y) => y.force - x.force).slice(0, max).map(h => (elle ? h.texte.replace(/\bil\b/g, "elle") : h.texte)),
  };
}

// ---------------------------------------------------------------- le dossier détaillé (19 novembre, demande du porteur du projet)
// « L'onglet Dossier n'est pas un peu léger ? » : à partir de ses derniers matchs en ligne (le plus récent d'abord ; coups vus de
// son côté, avec « s » quand il smashe, et « p », « n » le format du match sur le premier coup, étape SQL 82), tous ses réflexes
// avec leur pourcentage comparé au hasard, ce qu'il fait après une égalité, ses débuts de set, ses smashs, sa forme récente, et
// quelques conseils pour le battre.
const ILS = (t, elle) => (elle ? t.replace(/\bIl\b/g, "Elle").replace(/\bil\b/g, "elle").replace(/\bqu'il\b/g, "qu'elle") : t);
const NIVEAU = ecart => (ecart >= 18 ? "rouge" : ecart >= 8 ? "jaune" : "vert");
const bat = x => (x + 1) % 3;                    // le signe que x bat

// Les indices des premiers coups de chaque set d'un match (en rejouant le score ; les points de pénalité ne sont pas dans les coups).
export function debutsDeSet(coups, format) {
  const m = nouveauMatch(format), r = [];
  for (let i = 0; i < coups.length && !m.termine; i++) {
    if (m.points[0] === 0 && m.points[1] === 0 && (i === 0 || coups[i - 1].gagnant !== null)) r.push(i);
    jouerCoup(m, coups[i].b, coups[i].a);
  }
  return r;
}
// toi : mon propre dossier (Ma fiche › Stats, 20 novembre) : tout au « tu », et des failles à la place des conseils.
export function dossierDetaille(matchs, { elle = false, toi = false } = {}) {
  const liste = (matchs || []).filter(m => Array.isArray(m) && m.length);
  const coupsDe = m => m.map(c => ({ a: c.a, b: c.b, gagnant: c.g ?? null, s: !!c.s }));
  let k = compteVide();
  for (const m of liste) k = additionner(k, compterMatch(coupsDe(m)));
  if (k.coups < 10) return null;
  const n = k.coups, P = (x, y) => (y ? Math.round((100 * x) / y) : null);
  // Ses réflexes, avec leur part et ce que donnerait le hasard (base).
  const reflexes = [
    { cle: "rejoue_victoire", texte: toi ? "Après un point gagné, tu rejoues le même signe" : "Après un point gagné, il rejoue le même signe", oui: k.rejoueVictoire, vus: k.apresVictoire, base: 33 },
    { cle: "change_defaite", texte: toi ? "Après un point perdu, tu changes de signe" : "Après un point perdu, il change de signe", oui: k.changeDefaite, vus: k.apresDefaite, base: 67 },
    { cle: "repete", texte: toi ? "Tu rejoues deux fois de suite le même signe" : "Il rejoue deux fois de suite le même signe", oui: k.repete, vus: k.transitions, base: 33 },
    { cle: "boucle", texte: toi ? "Tu tournes en boucle (Pierre, Feuille, Ciseaux…)" : "Il tourne en boucle (Pierre, Feuille, Ciseaux…)", oui: k.boucle, vus: k.transitions, base: 33 },
    { cle: "copie", texte: toi ? "Tu rejoues le dernier signe de ton adversaire" : "Il rejoue le dernier signe de son adversaire", oui: k.copie, vus: k.transitions, base: 33 },
    { cle: "contre", texte: toi ? "Tu joues ce qui battait le dernier signe de ton adversaire" : "Il joue ce qui battait le dernier signe de son adversaire", oui: k.contre, vus: k.transitions, base: 33 },
  ].filter(r => r.vus >= 6).map(r => { const pct = P(r.oui, r.vus); return { ...r, texte: ILS(r.texte, elle), pct, niveau: NIVEAU(Math.abs(pct - r.base)) }; });
  // Après une égalité : il garde son signe ou il change, et ce qu'il joue.
  let apresEg = 0, gardeEg = 0; const signeEg = [0, 0, 0];
  // Ses smashs, ses débuts de set (sinon de match).
  const smashs = [0, 0, 0], smashsGagnes = [0, 0, 0], debuts = [0, 0, 0], resultatsDeb = [0, 0, 0], resultatsSmash = [0, 0, 0];   // (25 et 26 novembre) [gagné(e)s, égalités, perdu(e)s]
  let avecFormat = false;
  for (const m of liste) {
    const c = coupsDe(m);
    for (let i = 1; i < c.length; i++) if (c[i - 1].gagnant === null) { apresEg++; signeEg[c[i].b]++; if (c[i].b === c[i - 1].b) gardeEg++; }
    for (const x of c) if (x.s) { smashs[x.b]++; if (x.gagnant === 1) smashsGagnes[x.b]++; resultatsSmash[x.gagnant === 1 ? 0 : x.gagnant === 0 ? 2 : 1]++; }
    const f = m[0]?.p ? { pointsParSet: m[0].p, setsGagnants: m[0].n || 2 } : null;
    let idx = [0];
    if (f) { try { idx = debutsDeSet(c, f); avecFormat = true; } catch { idx = [0]; } }
    for (const i of idx) if (c[i]) { debuts[c[i].b]++; resultatsDeb[c[i].gagnant === 1 ? 0 : c[i].gagnant === 0 ? 2 : 1]++; }
  }
  const favEg = signeEg.indexOf(Math.max(...signeEg)), totDeb = debuts[0] + debuts[1] + debuts[2], favDeb = debuts.indexOf(Math.max(...debuts));
  const egalite = apresEg >= 6 ? { vus: apresEg, garde: P(gardeEg, apresEg), favori: favEg, favoriPct: P(signeEg[favEg], apresEg) } : null;
  const ouverture = totDeb >= 4 ? { vus: totDeb, sets: avecFormat, repartition: debuts.map(x => P(x, totDeb)), favori: favDeb, favoriPct: P(debuts[favDeb], totDeb),
    resultats: resultatsDeb.map(x => P(x, totDeb)) } : null;
  const totSmash = smashs[0] + smashs[1] + smashs[2];
  const smash = totSmash ? { total: totSmash, gagnes: smashsGagnes.reduce((a, b) => a + b, 0), parSigne: smashs, favori: smashs.indexOf(Math.max(...smashs)),
    repartition: smashs.map(x => P(x, totSmash)), resultats: resultatsSmash.map(x => P(x, totSmash)) } : null;   // (26 novembre : comme les ouvertures)
  // Sa forme récente : ses 10 derniers matchs comparés aux précédents.
  let forme = null;
  if (liste.length >= 15) {
    const rep = ms => { const r = [0, 0, 0]; for (const m of ms) for (const x of m) r[x.b]++; const t = r[0] + r[1] + r[2]; return r.map(v => P(v, t)); };
    const recent = rep(liste.slice(0, 10)), avant = rep(liste.slice(10));
    const ecarts = recent.map((v, i) => v - avant[i]), i = ecarts.map(Math.abs).indexOf(Math.max(...ecarts.map(Math.abs)));
    forme = { recent, avant, signe: i, ecart: ecarts[i] };
  }
  // Pour le battre : les failles les plus nettes, de la plus forte à la plus faible (3 au plus).
  const conseils = [];
  const rep = k.signes.map(x => P(x, n)), fav = rep.indexOf(Math.max(...rep));
  // (pour moi, la faille vue par mes adversaires : « tu » …, et ce qu'ils peuvent en faire)
  const ajouter = (force, texte, tu) => conseils.push({ force, texte: toi ? tu : ILS(texte, elle) });
  if (rep[fav] >= 40) ajouter(rep[fav] - 33, `Il joue beaucoup ${NOMS_LE[fav]} (${rep[fav]} %) : ${NOMS_LE[quiBat(fav)]} ${fav === 1 ? "les" : "la"} bat.`,
    `Tu joues beaucoup ${NOMS_LE[fav]} (${rep[fav]} %) : un adversaire attentif jouera ${NOMS_LE[quiBat(fav)]}.`);
  for (const r of reflexes) {
    const e = Math.abs(r.pct - r.base);
    if (e < 8) continue;
    if (r.cle === "rejoue_victoire" && r.pct > r.base) ajouter(e, "Quand il vient de gagner un point, il rejoue souvent le même signe : joue ce qui le bat.", "Quand tu viens de gagner un point, tu rejoues souvent le même signe : facile à contrer.");
    if (r.cle === "change_defaite" && r.pct > r.base) ajouter(e, "Quand il vient de perdre un point, il change de signe : rejoue ce qui bat ton dernier signe (tu gagnes ou tu fais égalité).", "Quand tu viens de perdre un point, tu changes presque toujours de signe : ton adversaire peut jouer sans risque de perdre.");
    if (r.cle === "change_defaite" && r.pct < r.base) ajouter(e, "Quand il vient de perdre un point, il s'entête : rejoue le signe qui vient de gagner.", "Quand tu viens de perdre un point, tu t'entêtes : ton adversaire n'a qu'à rejouer le signe qui vient de gagner.");
    if (r.cle === "repete" && r.pct < r.base) ajouter(e, "Il rejoue rarement le même signe : joue le signe que son dernier coup bat (tu gagnes ou tu fais égalité).", "Tu rejoues rarement le même signe : ton adversaire peut écarter ton dernier coup et jouer sans risque de perdre.");
    if (r.cle === "repete" && r.pct > r.base) ajouter(e, "Il rejoue souvent le même signe : joue ce qui bat son dernier coup.", "Tu rejoues souvent le même signe : ton adversaire n'a qu'à jouer ce qui bat ton dernier coup.");
    if (r.cle === "boucle" && r.pct > r.base) ajouter(e, "Il tourne en boucle (Pierre, Feuille, Ciseaux…) : joue le signe que son dernier coup bat.", "Tu tournes en boucle (Pierre, Feuille, Ciseaux…) : ton prochain signe se devine.");
    if (r.cle === "copie" && r.pct > r.base) ajouter(e, "Il rejoue souvent ton dernier signe : joue ce qui bat ton propre dernier signe.", "Tu rejoues souvent le dernier signe de ton adversaire : il peut l'anticiper.");
    if (r.cle === "contre" && r.pct > r.base) ajouter(e, "Il joue souvent ce qui battait ton dernier signe : joue le signe que ton dernier signe bat.", "Tu joues souvent ce qui battait le dernier signe de ton adversaire : il peut l'anticiper.");
  }
  if (egalite && Math.abs(egalite.garde - 33) >= 8) ajouter(Math.abs(egalite.garde - 33), egalite.garde > 33
    ? "Après une égalité, il garde souvent son signe : joue ce qui le bat."
    : "Après une égalité, il change presque toujours : joue le signe que votre signe commun bat (tu gagnes ou tu fais égalité).",
    egalite.garde > 33 ? "Après une égalité, tu gardes souvent ton signe : facile à contrer."
    : "Après une égalité, tu changes presque toujours : ton adversaire peut jouer sans risque de perdre.");
  if (ouverture && ouverture.vus >= 8 && ouverture.favoriPct >= 42) ajouter(ouverture.favoriPct - 33, `En ouverture, il joue souvent ${NOMS_LE[ouverture.favori]} : commence par ${NOMS_LE[quiBat(ouverture.favori)]}.`,
    `En ouverture, tu joues souvent ${NOMS_LE[ouverture.favori]} : un adversaire attentif commencera par ${NOMS_LE[quiBat(ouverture.favori)]}.`);
  // (20 novembre) Son flair et son endurance : les coups vus de son côté (a = lui, gagnant 0 = lui).
  const fe = { tentees: 0, reussies: 0, chaines: 0, gagnees: 0 };
  for (const m of liste) {
    const x = flairEtEndurance(m.map(c => ({ a: c.b, b: c.a, gagnant: c.g === null || c.g === undefined ? null : c.g === 1 ? 0 : 1 })));
    for (const k of Object.keys(fe)) fe[k] += x[k];
  }
  return {
    matchs: liste.length, coups: n, repartition: rep, reflexes, egalite, ouverture, smash, forme,
    // (l'endurance : ne pas perdre le point quand on ne le gagne pas, égalités ÷ (égalités + points perdus))
    flair: { tentees: fe.tentees, reussies: fe.reussies },
    endurance: (() => { let e = 0, p = 0; for (const m of liste) for (const c of m) { if (c.g === null || c.g === undefined) e++; else if (c.g === 0) p++; } return { egalites: e, nonGagnes: e + p }; })(),
    conseils: conseils.sort((x, y) => y.force - x.force).slice(0, 3).map(c => c.texte),
  };
}
// (pour les tests : le signe que x bat)
export const signeBattu = bat;
