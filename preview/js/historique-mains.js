// L'historique des mains : la suite des coups de chaque match, pour la fiche d'un adversaire (24 octobre, demande du porteur
// du projet). « Contre moi » : mes 10 derniers matchs contre lui (bots : gardés sur le téléphone ; joueurs en ligne : lus sur
// le serveur) ; « Tous ses matchs » (joueurs en ligne) : ses 10 derniers matchs en ligne, sans le nom de ses adversaires.
// Les coups vus de mon côté : a = mon signe, b = le sien ; 0 = Pierre, 1 = Ciseaux, 2 = Feuille ; x bat y quand (x + 1) % 3 === y.

export const MAX_MAINS = 10;
const EMOJIS = ["🪨", "✂️", "📄"];
const gagnant = (a, b) => (a === b ? null : (a + 1) % 3 === b ? 0 : 1);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Un match en peu de place : un chiffre par coup (3 × mon signe + le sien), « | » entre les sets.
// (18 novembre, demande du porteur du projet) Après le chiffre, le smash : « * » le mien, « + » le sien, « # » les deux ;
// les points de pénalité, à leur place : « x » contre moi, « y » contre lui (penalites : [{ apres, fautif }], regles.js).
// (les anciens matchs, sans ces marques, se lisent toujours)
const MARQUE_SMASH = { "1,0": "*", "0,1": "+", "1,1": "#" };
export function encoderCoups(coups, debutsSet = [0], penalites = []) {
  const debuts = new Set(debutsSet.filter(i => i > 0)), pens = Array.isArray(penalites) ? penalites : [];
  const pen = i => pens.filter(p => (p.apres ?? 0) === i).map(p => (p.fautif === 0 ? "x" : "y")).join("");
  return coups.map((c, i) => (debuts.has(i) ? "|" : "") + pen(i) + (3 * c.a + c.b) + (c.smash ? MARQUE_SMASH[`${+!!c.smash[0]},${+!!c.smash[1]}`] || "" : "")).join("")
    + pen(coups.length);
}
// → les sets, chacun une liste d'éléments : un coup { a, b, gagnant, smash? } ou un point de pénalité { penalite: 0 ou 1 }.
export function decoderHistorique(texte) {
  return String(texte || "").split("|").map(set => {
    const l = [];
    for (const x of set) {
      if (x >= "0" && x <= "8") { const k = +x, a = Math.floor(k / 3), b = k % 3; l.push({ a, b, gagnant: gagnant(a, b) }); }
      else if (x === "x" || x === "y") l.push({ penalite: x === "x" ? 0 : 1 });
      else if ("*+#".includes(x) && l.at(-1) && !("penalite" in l.at(-1))) l.at(-1).smash = [x !== "+", x !== "*"];
    }
    return l;
  }).filter(s => s.length);
}
// → les sets, chacun une liste de coups { a, b, gagnant } (sans les pénalités).
export const decoderCoups = texte => decoderHistorique(texte).map(set => set.filter(x => !("penalite" in x))).filter(s => s.length);

// Ajoute un match en tête de la liste (la plus récente d'abord), 10 au plus.
// m : { date, gagne, detail (« 11–7, 9–11 »), coups, debutsSet, balles (balles de match que j'ai sauvées) }.
export function ajouterMain(liste, m) {
  const entree = { d: m.date ?? Date.now(), g: !!m.gagne, s: m.detail || "", c: encoderCoups(m.coups, m.debutsSet, m.penalites), ...(m.balles ? { b: m.balles } : {}) };
  return [entree, ...(Array.isArray(liste) ? liste : [])].slice(0, MAX_MAINS);
}

// Les mains gardées sur le téléphone : { [id du bot]: [entrées] } ; on ne garde que les 80 adversaires les plus récents.
export function noterMain(toutes, id, m) {
  const t = { ...(toutes && typeof toutes === "object" ? toutes : {}) };
  t[id] = ajouterMain(t[id], m);
  const ids = Object.keys(t).sort((x, y) => (t[y][0]?.d || 0) - (t[x][0]?.d || 0));
  for (const x of ids.slice(80)) delete t[x];
  return t;
}

// Un duel en ligne (déjà rejoué de mon côté : match.coups, match.debutsSet) → une entrée.
export function mainDuel(duel, match, moi) {
  return { d: Date.parse(duel.maj_le) || 0, g: duel.vainqueur === moi, s: match.scoresSets.map(([a, b]) => `${a}–${b}`).join(", "),
    c: encoderCoups(match.coups, match.debutsSet, match.penalites) };
}
// Un match du dossier (vu de son côté par le serveur : b = son signe, a = celui d'en face) → une entrée, lui en premier.
export function mainDossier(coups) {
  const cs = (coups || []).filter(c => [0, 1, 2].includes(c.a) && [0, 1, 2].includes(c.b)).map(c => ({ a: c.b, b: c.a }));
  const pts = [0, 0]; cs.forEach(c => { const g = gagnant(c.a, c.b); if (g !== null) pts[g]++; });
  return { d: null, g: pts[0] > pts[1], s: `${cs.length} coups`, c: encoderCoups(cs) };
}

// La couleur d'un signe dans le bandeau des coups (16 novembre, idée d'un testeur) : vert s'il a gagné le point, rouge s'il
// l'a perdu, blanc pour une égalité. cle : "a" (la première ligne, le joueur 0) ou "b" (la deuxième, le joueur 1).
export const classeCoup = (x, cle) => ("penalite" in x ? ((x.penalite === 0) === (cle === "a") ? "perd penalite" : "penalite")
  : x.gagnant === null || x.gagnant === undefined ? "egal" : (x.gagnant === 0) === (cle === "a") ? "gagne" : "perd");

// Ce qu'on voit dans la case d'un coup (18 novembre) : le signe, entouré s'il a été joué en smash ; un point de pénalité : une
// croix chez le fautif (la case de l'autre reste vide).
export function contenuCoup(x, cle) {
  if ("penalite" in x) return (x.penalite === 0) === (cle === "a") ? `<span class="coup-penalite" title="Point de pénalité">❌</span>` : "";
  const e = EMOJIS[x[cle]];
  return x.smash?.[cle === "a" ? 0 : 1] ? `<span class="coup-smash" title="Smash">${e}</span>` : e;
}

// L'affichage : un match par ligne (touché, il s'ouvre sur le bandeau des coups, set par set).
// noms : [la première ligne du bandeau, la deuxième] ; gagneTexte : [victoire, défaite] de la première ligne.
export function htmlMains(entrees, { noms = ["Toi", "Lui"], gagneTexte = ["✅ Victoire", "❌ Défaite"], vide = "" } = {}) {
  if (!entrees?.length) return `<p class="hint">${esc(vide)}</p>`;
  const date = d => (d ? ` · ${new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}` : "");
  return `<div class="mains">` + entrees.map((e, i) => {
    const sets = decoderHistorique(e.c);
    const ligne = (cle, nom) => `<tr><th>${esc(nom)}</th>` + sets.map((set, k) => set.map((x, j) =>
      `<td class="${[classeCoup(x, cle), k > 0 && j === 0 ? "newset" : ""].join(" ").trim()}">${contenuCoup(x, cle)}</td>`).join("")).join("") + "</tr>";
    return `<details class="main-match"${i === 0 ? " open" : ""}><summary>${e.g ? gagneTexte[0] : gagneTexte[1]}${e.s ? ` · ${esc(e.s)}` : ""}${date(e.d)}</summary>`
      + `<div class="tape"><table>${ligne("a", noms[0])}${ligne("b", noms[1])}</table></div></details>`;
  }).join("") + `</div>`;
}

// La mémoire du dernier match contre le même adversaire, pour les commentateurs (28 octobre).
// entrees : ses matchs gardés (le plus récent d'abord) ; face : notre bilan { v, d }.
// Renvoie { ouverture (son premier signe au dernier match, ou null), defaiteSeche, balleSauvee, serre, belle, habitude (null,
// "moi" ou "lui" : qui a gagné les 3 derniers), gagne (ai-je gagné le dernier ?), renverse (le vainqueur du dernier match avait
// perdu le premier set), favori ({ signe, part } : son signe le plus joué au dernier match), long (40 coups ou plus), jours (depuis
// le dernier match), v, d (notre bilan) }, ou null s'il n'y a pas de match précédent.
export function memoireDuDernier(entrees, face = null, maintenant = Date.now()) {
  const e = entrees?.[0]; if (!e) return null;
  const sets = String(e.s || "").split(",").map(x => x.split("–").map(Number)).filter(x => x.length === 2 && x.every(Number.isFinite));
  const premier = decoderCoups(e.c)[0]?.[0];
  const dernierSet = sets.at(-1);
  const trois = entrees.slice(0, 3), coups = decoderCoups(e.c).flat(), sien = [0, 0, 0];
  coups.forEach(c => sien[c.b]++);
  const fav = sien.indexOf(Math.max(...sien));
  return {
    gagne: !!e.g, v: face?.v ?? 0, d: face?.d ?? 0,
    renverse: sets.length >= 2 && (e.g ? sets[0][0] < sets[0][1] : sets[0][0] > sets[0][1]),
    favori: coups.length >= 8 ? { signe: fav, part: sien[fav] / coups.length } : null,
    long: coups.length >= 40,
    jours: e.d ? Math.floor((maintenant - e.d) / 86400000) : 0,
    ouverture: premier ? premier.b : null,
    defaiteSeche: !e.g && sets.length > 0 && sets.every(([a, b]) => b - a >= 5),
    balleSauvee: (e.b || 0) > 0,
    serre: !!dernierSet && Math.abs(dernierSet[0] - dernierSet[1]) <= 2,
    belle: !!face && face.v === face.d && face.v >= 2,
    habitude: trois.length === 3 && trois.every(x => x.g === trois[0].g) ? (trois[0].g ? "moi" : "lui") : null,
    // La série en cours (3 matchs ou plus gagnés d'affilée par le même joueur) : { n, gagnant: "moi" | "lui" }, ou null.
    serie: (() => { let n = 0; while (n < entrees.length && !!entrees[n].g === !!e.g) n++; return n >= 3 ? { n, gagnant: e.g ? "moi" : "lui" } : null; })(),
  };
}
