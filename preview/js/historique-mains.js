// L'historique des mains : la suite des coups de chaque match, pour la fiche d'un adversaire (24 octobre, demande du porteur
// du projet). « Contre moi » : mes 10 derniers matchs contre lui (bots : gardés sur le téléphone ; joueurs en ligne : lus sur
// le serveur) ; « Tous ses matchs » (joueurs en ligne) : ses 10 derniers matchs en ligne, sans le nom de ses adversaires.
// Les coups vus de mon côté : a = mon signe, b = le sien ; 0 = Pierre, 1 = Ciseaux, 2 = Feuille ; x bat y quand (x + 1) % 3 === y.

export const MAX_MAINS = 10;
const EMOJIS = ["🪨", "✂️", "📄"];
const gagnant = (a, b) => (a === b ? null : (a + 1) % 3 === b ? 0 : 1);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Un match en peu de place : un chiffre par coup (3 × mon signe + le sien), « | » entre les sets.
export function encoderCoups(coups, debutsSet = [0]) {
  const debuts = new Set(debutsSet.filter(i => i > 0));
  return coups.map((c, i) => (debuts.has(i) ? "|" : "") + (3 * c.a + c.b)).join("");
}
// → les sets, chacun une liste de coups { a, b, gagnant }.
export function decoderCoups(texte) {
  return String(texte || "").split("|").map(set => [...set].filter(x => x >= "0" && x <= "8")
    .map(x => { const k = +x, a = Math.floor(k / 3), b = k % 3; return { a, b, gagnant: gagnant(a, b) }; })).filter(s => s.length);
}

// Ajoute un match en tête de la liste (la plus récente d'abord), 10 au plus.
// m : { date, gagne, detail (« 11–7, 9–11 »), coups, debutsSet }.
export function ajouterMain(liste, m) {
  const entree = { d: m.date ?? Date.now(), g: !!m.gagne, s: m.detail || "", c: encoderCoups(m.coups, m.debutsSet) };
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
    c: encoderCoups(match.coups, match.debutsSet) };
}
// Un match du dossier (vu de son côté par le serveur : b = son signe, a = celui d'en face) → une entrée, lui en premier.
export function mainDossier(coups) {
  const cs = (coups || []).filter(c => [0, 1, 2].includes(c.a) && [0, 1, 2].includes(c.b)).map(c => ({ a: c.b, b: c.a }));
  const pts = [0, 0]; cs.forEach(c => { const g = gagnant(c.a, c.b); if (g !== null) pts[g]++; });
  return { d: null, g: pts[0] > pts[1], s: `${cs.length} coups`, c: encoderCoups(cs) };
}

// L'affichage : un match par ligne (touché, il s'ouvre sur le bandeau des coups, set par set).
// noms : [la première ligne du bandeau, la deuxième] ; gagneTexte : [victoire, défaite] de la première ligne.
export function htmlMains(entrees, { noms = ["Toi", "Lui"], gagneTexte = ["✅ Victoire", "❌ Défaite"], vide = "" } = {}) {
  if (!entrees?.length) return `<p class="hint">${esc(vide)}</p>`;
  const date = d => (d ? ` · ${new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}` : "");
  return `<div class="mains">` + entrees.map((e, i) => {
    const sets = decoderCoups(e.c);
    const ligne = (cle, nom) => `<tr><th>${esc(nom)}</th>` + sets.map((set, k) => set.map((x, j) =>
      `<td class="${[x.gagnant === 0 ? "w-me" : x.gagnant === 1 ? "w-bot" : "", k > 0 && j === 0 ? "newset" : ""].join(" ").trim()}">${EMOJIS[x[cle]]}</td>`).join("")).join("") + "</tr>";
    return `<details class="main-match"${i === 0 ? " open" : ""}><summary>${e.g ? gagneTexte[0] : gagneTexte[1]}${e.s ? ` · ${esc(e.s)}` : ""}${date(e.d)}</summary>`
      + `<div class="tape"><table>${ligne("a", noms[0])}${ligne("b", noms[1])}</table></div></details>`;
  }).join("") + `</div>`;
}
