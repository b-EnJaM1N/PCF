// Lire l'adversaire : ce que montrent ses coups depuis le début du match (répartition, réflexes),
// et la piste qui en découle pour le prochain coup. Tout se déduit de l'historique, visible des deux joueurs.
// Les coups : { a: mon signe, b: son signe, gagnant: 0 (moi), 1 (lui) ou null (égalité) }.
// Les signes : 0 = Pierre, 1 = Ciseaux, 2 = Feuille ; x bat y quand (x + 1) % 3 === y.

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
const s_applique = (h, dernier) => (h.cle === "rejoue_victoire" ? dernier.gagnant === 1 : h.cle === "change_defaite" ? dernier.gagnant === 0 : true);

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
