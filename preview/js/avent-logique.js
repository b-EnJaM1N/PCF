// Le calendrier de l'Avent (24 novembre, idée et choix du porteur du projet ; événement de Noël, noel.js) : du 1er au 24 décembre,
// une case par jour, qui s'ouvre en réussissant le défi du jour. Une case ratée se rattrape jusqu'au 31 décembre, en battant le
// bot de Noël qui la garde (un set de 7 points), deux rattrapages par jour au plus. Les cadeaux : les pulls moches, des jetons,
// des objets de Noël, et le 24, le Gant du Père Noël. Le serveur enregistre les cases et donne les cadeaux
// (supabase/etape-89-calendrier-avent.sql : mêmes cadeaux, mêmes règles de dates).
// Ici, seulement les règles (testées automatiquement) ; l'écran est dans ecran-avent.js.

export const NB_CASES = 24;
export const DERNIER_JOUR = 31;            // les rattrapages : jusqu'au 31 décembre
export const RATTRAPAGES_PAR_JOUR = 2;
export const FORMAT_GARDIEN = { pointsParSet: 7, setsGagnants: 1 };

// Les cadeaux, case par case (« jetons:N », ou un objet « type:clé » du catalogue : catalogue.js, CADEAUX_AVENT ; « a+b » : deux
// cadeaux, possible mais plus utilisé). (27 novembre, demande du porteur du projet : plus de jetons, des breloques, des fonds et
// des poignets de Noël à la place ; un cadeau par case, les autres récompensent l'assiduité : SERIES.)
export const CADEAUX = [null,
  "gant:pullmoche", "bracelet:breloque_flocon", "gant:pullsapin", "poignet:sucreorge",
  "gant:pullneige", "fond:chuteneige", "gant:pullrenne", "celebration:neige",
  "gant:pullpere", "bracelet:breloque_bonhomme", "gant:pullcadeau", "fond:nuitnoel",
  "gant:pullsucre", "fond:sapin", "gant:pullpingouin", "poignee:givree",
  "gant:pullchaussette", "poignet:fourrure", "gant:pullboule", "fond:guirlandes",
  "gant:pullpain", "cadre:guirlande", "gant:pullhandslam", "gant:perenoel"];
// Les cadeaux d'assiduité (27 novembre, demande du porteur du projet) : la case du jour ouverte N jours de suite (le jour même ;
// un rattrapage ne compte pas, un jour raté casse la série) : un cadeau en plus à 3, 5, 7… 23 jours. Chacun ne se gagne qu'une fois.
export const SERIES = { 3: "bracelet:breloque_sucre", 5: "poignet:jacquard", 7: "bracelet:breloque_sapin", 9: "poignet:houx",
  11: "bracelet:breloque_cloche", 13: "poignet:rennes", 15: "bracelet:breloque_cadeau", 17: "fond:papiercadeau",
  19: "bracelet:breloque_boule", 21: "poignet:guirlande", 23: "bracelet:breloque_etoile" };
export const PALIERS = Object.keys(SERIES).map(Number);
const unCadeau = c => { const [type, cle] = c.split(":"); return type === "jetons" ? { type, n: Number(cle), id: c } : { type, cle, id: c }; };
// Les cadeaux d'une case (un ou deux).
export const cadeauxDe = num => (CADEAUX[num] ? CADEAUX[num].split("+").map(unCadeau) : []);
// Le premier cadeau d'une case.
export const cadeauDe = num => cadeauxDe(num)[0] || null;
// Le cadeau d'assiduité d'un palier (3, 5, 7…), ou null.
export const primeDe = palier => (SERIES[palier] ? unCadeau(SERIES[palier]) : null);

// La série qui finit à la case num : les cases du jour (ouvertes le jour même) qui se suivent jusqu'à elle.
export function serieA(etat, num) { let k = 0; while (num - k >= 1 && etat.cases?.[num - k]?.via === "jour") k++; return k; }
// La série en cours : jusqu'à aujourd'hui si la case du jour est ouverte, sinon jusqu'à hier (elle peut encore continuer).
export function serieEnCours(etat) {
  const j = etat.jour || 0;
  if (!j || j > NB_CASES) return 0;
  return etat.cases?.[j]?.via === "jour" ? serieA(etat, j) : serieA(etat, j - 1);
}
// La plus longue série (les paliers atteints : ceux qu'elle dépasse ou égale).
export function meilleureSerie(etat) { let m = 0; for (let n = 1; n <= NB_CASES; n++) m = Math.max(m, serieA(etat, n)); return m; }
export const paliersAtteints = etat => PALIERS.filter(p => meilleureSerie(etat) >= p);
// Le prochain cadeau d'assiduité encore possible : { palier, manque } (les jours de suite qui manquent), ou null.
export function prochainPalier(etat) {
  const j = etat.jour || 0, s = serieEnCours(etat), m = meilleureSerie(etat);
  if (!j || j > NB_CASES) return null;
  const aujourdhuiFait = etat.cases?.[j]?.via === "jour", restants = NB_CASES - j + (aujourdhuiFait ? 0 : 1);
  const p = PALIERS.find(x => x > m);
  return p && p - s <= restants ? { palier: p, manque: p - s } : null;
}

// Les défis du jour. r : le résultat du match qui vient de finir (resultatAvent) ; jour : { matchs } (les matchs joués aujourd'hui).
export const DEFIS = {
  victoire: { texte: "Gagne un match.", test: r => r.gagne },
  bot_noel: { texte: "Gagne un match contre un bot de Noël.", test: r => r.gagne && r.botNoel },
  smash: { texte: "Réussis un smash pendant un match.", test: r => r.smashsReussis >= 1 },
  trois_matchs: { texte: "Joue 3 matchs dans la journée.", test: (r, jour) => (jour?.matchs || 0) >= 3 },
  set_net: { texte: "Gagne un set sans aucune égalité.", test: r => r.setSansEgalite },
  match_du_jour: { texte: "Joue le match du jour.", test: r => r.matchDuJour },
  en_ligne: { texte: "Joue un match en ligne contre un joueur.", test: r => r.duel },
  serie5: { texte: "Gagne 5 points d'affilée pendant un match.", test: r => r.meilleureSerie >= 5 },
  battre_neige: { texte: "Bats le Bonhomme de neige.", test: r => r.gagne && r.adv === "neige" },
  battre_renne: { texte: "Bats Comète, le renne.", test: r => r.gagne && r.adv === "renne" },
  battre_lutin: { texte: "Bats le Lutin.", test: r => r.gagne && r.adv === "lutin" },
  pere_noel: { texte: "Affronte le Père Noël (pas besoin de gagner !).", test: r => r.adv === "perenoel" },
};
export const DEFI_DU_JOUR = [null,
  "victoire", "smash", "bot_noel", "trois_matchs", "battre_neige", "set_net", "match_du_jour", "serie5",
  "en_ligne", "battre_renne", "smash", "victoire", "bot_noel", "set_net", "trois_matchs", "battre_renne",
  "serie5", "match_du_jour", "battre_lutin", "en_ligne", "bot_noel", "set_net", "battre_lutin", "pere_noel"];
export const defiDe = num => DEFIS[DEFI_DU_JOUR[num]] || null;

// Le bot de Noël qui garde une case ratée : de plus en plus fort au fil du calendrier.
export const gardienDe = num => (num >= 24 ? "perenoel" : num >= 17 ? "lutin" : num >= 9 ? "renne" : "neige");

// Le jour du calendrier (1 à 31 en décembre ; 0 en dehors). d : la date du jour à Paris, « AAAA-MM-JJ » (jourParis).
export const jourAvent = d => { const [, m, j] = String(d || "").split("-").map(Number); return m === 12 ? j : 0; };

// etat : { jour, cases: { num: { via, le } }, rattrapagesDuJour }.
// Le statut d'une case : « ouverte », « aujourdhui » (à ouvrir avec le défi du jour), « rattrapage » (ratée, encore rattrapable),
// « fermee » (à venir), « perdue » (ratée, trop tard).
export function statutCase(etat, num) {
  if (etat.cases?.[num]) return "ouverte";
  const j = etat.jour || 0;
  if (!j) return "fermee";
  if (num === j && j <= NB_CASES) return "aujourdhui";
  if (num > j) return "fermee";
  return j <= DERNIER_JOUR ? "rattrapage" : "perdue";
}
export const rattrapagesRestants = etat => Math.max(0, RATTRAPAGES_PAR_JOUR - (etat.rattrapagesDuJour || 0));
export const nbOuvertes = etat => Object.keys(etat.cases || {}).length;
export const calendrierComplet = etat => nbOuvertes(etat) >= NB_CASES;

// Le résultat d'un match, pour le calendrier. m : le match (regles.js) ; adv : l'identifiant de l'adversaire ; o : { botNoel, duel,
// smashsReussis, meilleureSerie, matchDuJour, rattrapage (la case qu'on rattrape), abandon }.
export function resultatAvent(m, adv, o = {}) {
  // (un set gagné sans égalité : les coups de chaque set, d'après les scores des sets)
  const sets = decouperSets(m);
  const setSansEgalite = sets.some(s => s.gagnant === 0 && s.coups.every(c => c.gagnant !== null));
  return { gagne: m.vainqueur === 0 && !o.abandon, adv, botNoel: !!o.botNoel, duel: !!o.duel, smashsReussis: o.smashsReussis || 0,
    meilleureSerie: o.meilleureSerie || 0, matchDuJour: !!o.matchDuJour, rattrapage: o.rattrapage || null, abandon: !!o.abandon,
    setSansEgalite, format: m.format };
}
// Les coups de chaque set terminé, avec son vainqueur (d'après les scores des sets).
function decouperSets(m) {
  const res = [], c = m.coups;
  let i = 0;
  for (const [a, b] of m.scoresSets || []) {
    const coups = [];
    let pa = 0, pb = 0;
    while (i < c.length && (pa !== a || pb !== b)) { const x = c[i++]; coups.push(x); if (x.gagnant === 0) pa++; else if (x.gagnant === 1) pb++; }
    res.push({ gagnant: a > b ? 0 : 1, coups });
  }
  return res;
}

// Les cases que ce match ouvre : [{ num, via }] (via : « jour » ou « rattrapage »). jour : { matchs } (les matchs d'aujourd'hui).
export function casesGagnees(etat, r, jour = {}) {
  if (!etat.jour || r.abandon) return [];
  const res = [], j = etat.jour;
  if (j <= NB_CASES && statutCase(etat, j) === "aujourdhui" && defiDe(j)?.test(r, jour)) res.push({ num: j, via: "jour" });
  const n = r.rattrapage;
  if (n && n !== j && statutCase(etat, n) === "rattrapage" && rattrapagesRestants(etat) > 0 && r.adv === gardienDe(n)
    && (n === NB_CASES || r.gagne) && r.format?.pointsParSet === FORMAT_GARDIEN.pointsParSet && r.format?.setsGagnants === FORMAT_GARDIEN.setsGagnants) {
    res.push({ num: n, via: "rattrapage" });
  }
  return res;
}

// Les matchs joués aujourd'hui (pour « Joue 3 matchs dans la journée »), gardés sur le téléphone : { date, matchs }.
export const compterMatchDuJour = (compteur, date) => (compteur?.date === date ? { date, matchs: (compteur.matchs || 0) + 1 } : { date, matchs: 1 });
