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
