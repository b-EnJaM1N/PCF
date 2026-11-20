// Le Flair et l'Endurance (20 novembre, choix du porteur du projet), d'après les coups d'un match.
// Les coups sont vus du côté du joueur étudié : a = son signe, b = celui de l'adversaire, gagnant = 0 (lui), 1 (l'adversaire) ou null.
// Signes : 0 = Pierre, 1 = Ciseaux, 2 = Feuille ; x bat (x + 1) % 3.
//
// Le Flair : lire une habitude de l'adversaire et la punir. Une habitude ne compte que si l'adversaire l'a déjà montrée dans ce
// match, au moins 4 fois et au moins 6 fois sur 10 (sinon, ce serait de la chance). Six habitudes, comme dans le Dossier :
// rejouer après un point gagné, changer après un point perdu, rejouer un signe déjà joué deux fois de suite, tourner en boucle,
// copier le dernier signe d'en face, jouer ce qui battait le dernier signe d'en face. Une lecture : je joue ce qui bat ce que son
// habitude annonce (pour « il change », le signe qui ne peut pas perdre) ; réussie si je gagne le point, ratée si je le perds.
//
// L'Endurance : dans les égalités en chaîne (2 ou plus d'affilée), qui gagne le point qui suit.
const quiBat = x => (x + 2) % 3;          // le signe qui bat x
const battu = x => (x + 1) % 3;           // le signe que x bat
export const MIN_VUS = 4, MIN_PART = 0.6;

// Les habitudes possibles avant le coup i : { cle, applique(i) → vrai si elle dit quelque chose, prevu(i) → le signe à jouer pour la punir,
// confirme(i) → vrai si l'adversaire l'a suivie au coup i }.
function habitudes(c) {
  return [
    { cle: "rejoue_victoire", applique: i => c[i - 1].gagnant === 1, jouer: i => quiBat(c[i - 1].b), confirme: i => c[i].b === c[i - 1].b },
    // (il change après un point perdu : il jouera l'un des deux autres signes ; « battu » de son ancien signe gagne ou fait égalité)
    { cle: "change_defaite", applique: i => c[i - 1].gagnant === 0, jouer: i => battu(c[i - 1].b), confirme: i => c[i].b !== c[i - 1].b },
    { cle: "repete", applique: i => i >= 2 && c[i - 1].b === c[i - 2].b, jouer: i => quiBat(c[i - 1].b), confirme: i => c[i].b === c[i - 1].b },
    { cle: "boucle", applique: () => true, jouer: i => quiBat(quiBat(c[i - 1].b)), confirme: i => c[i].b === quiBat(c[i - 1].b) },
    { cle: "copie", applique: () => true, jouer: i => quiBat(c[i - 1].a), confirme: i => c[i].b === c[i - 1].a },
    { cle: "contre", applique: () => true, jouer: i => quiBat(quiBat(c[i - 1].a)), confirme: i => c[i].b === quiBat(c[i - 1].a) },
  ];
}

// → { tentees, reussies } (le Flair), { chaines, gagnees } (l'Endurance).
export function flairEtEndurance(coups) {
  const c = (coups || []).filter(x => x && x.a !== undefined && x.b !== undefined);
  const r = { tentees: 0, reussies: 0, chaines: 0, gagnees: 0 };
  const hs = habitudes(c), vus = hs.map(() => 0), oui = hs.map(() => 0);
  let egalites = 0;
  for (let i = 0; i < c.length; i++) {
    // L'Endurance : le point décisif après 2 égalités ou plus.
    if (c[i].gagnant === null || c[i].gagnant === undefined) egalites++;
    else { if (egalites >= 2) { r.chaines++; if (c[i].gagnant === 0) r.gagnees++; } egalites = 0; }
    if (i === 0) continue;
    // Le Flair : avant de regarder le coup i, les habitudes confirmées jusqu'ici (la plus nette d'abord).
    let meilleure = -1, part = 0;
    hs.forEach((h, k) => {
      if (!h.applique(i) || vus[k] < MIN_VUS) return;
      const p = oui[k] / vus[k];
      if (p >= MIN_PART && p > part) { meilleure = k; part = p; }
    });
    if (meilleure >= 0 && c[i].a === hs[meilleure].jouer(i) && c[i].gagnant !== null && c[i].gagnant !== undefined) {
      r.tentees++; if (c[i].gagnant === 0) r.reussies++;
    }
    // Puis on apprend : ce coup confirme-t-il chaque habitude qui s'appliquait ?
    hs.forEach((h, k) => { if (h.applique(i)) { vus[k]++; if (h.confirme(i)) oui[k]++; } });
  }
  return r;
}
