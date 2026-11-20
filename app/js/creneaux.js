// Programmer un match de tournoi (20 novembre, idée et choix du porteur du projet ; étape SQL 84) : les plages proposées, le rendez-vous.
// Ici, seulement les calculs et les textes (testés) ; l'écran est dans ecran-tournois.js.
// Les heures sont celles du téléphone (les joueurs sont en France).

const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const debutJour = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const heure = d => `${d.getHours()} h${d.getMinutes() ? ` ${String(d.getMinutes()).padStart(2, "0")}` : ""}`;

// « aujourd'hui », « demain », ou « jeudi 26 » (au-delà d'une semaine : « jeudi 26 novembre »).
export function jour(d, maintenant = new Date()) {
  const ecart = Math.round((debutJour(d) - debutJour(maintenant)) / 864e5);
  if (ecart === 0) return "aujourd'hui";
  if (ecart === 1) return "demain";
  return ecart < 7 ? `${JOURS[d.getDay()]} ${d.getDate()}` : `${JOURS[d.getDay()]} ${d.getDate()} ${d.toLocaleDateString("fr-FR", { month: "long" })}`;
}
// Une heure fixe (20 novembre, demande du porteur du projet) : une plage d'un quart d'heure exactement ; l'autre n'a que cette heure
// à accepter.
export const heureFixe = p => new Date(p.fin) - new Date(p.debut) === 15 * 60e3;
// « demain 20 h – 22 h » ; une heure fixe : « demain à 21 h ».
export const textePlage = (p, maintenant = new Date()) => {
  const d = new Date(p.debut), f = new Date(p.fin);
  return heureFixe(p) ? `${jour(d, maintenant)} à ${heure(d)}` : `${jour(d, maintenant)} ${heure(d)} – ${heure(f)}`;
};
// « jeudi 26 à 21 h » (le rendez-vous).
export const texteRdv = (rdv, maintenant = new Date()) => { const d = new Date(rdv); return `${jour(d, maintenant)} à ${heure(d)}`; };

// Les jours qu'on peut proposer : d'aujourd'hui jusqu'à la date limite (14 au plus). → [{ valeur: "AAAA-MM-JJ", texte }]
export function joursPossibles(echeance, maintenant = new Date()) {
  const fin = echeance ? new Date(echeance) : new Date(maintenant.getTime() + 7 * 864e5), r = [];
  for (let d = debutJour(maintenant), i = 0; d < fin && i < 14; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1), i++) {
    r.push({ valeur: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`, texte: jour(d, maintenant) });
  }
  return r;
}
// Les heures d'une journée, de demi-heure en demi-heure : ["00:00", "00:30", … "23:30"].
export const HEURES = Array.from({ length: 48 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`);
export const texteHeure = hh => { const [h, m] = hh.split(":"); return `${Number(h)} h${m === "00" ? "" : ` ${m}`}`; };

// Une plage d'après le jour et les heures choisis (« 24:00 » ou une fin avant le début : jusqu'au lendemain).
// a = "fixe" : une heure fixe (un quart d'heure).
export function plage(jourIso, de, a) {
  const [y, mo, j] = jourIso.split("-").map(Number), [h1, m1] = de.split(":").map(Number);
  const debut = new Date(y, mo - 1, j, h1, m1);
  if (a === "fixe") return { debut: debut.toISOString(), fin: new Date(debut.getTime() + 15 * 60e3).toISOString() };
  const [h2, m2] = a.split(":").map(Number), fin = new Date(y, mo - 1, j, h2, m2);
  if (fin <= debut) fin.setDate(fin.getDate() + 1);
  return { debut: debut.toISOString(), fin: fin.toISOString() };
}

// Les plages rapides (« Ce soir 20 h – 22 h »…), si elles sont encore possibles avant la date limite.
export function plagesRapides(echeance, maintenant = new Date()) {
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const auj = debutJour(maintenant), dem = new Date(auj.getFullYear(), auj.getMonth(), auj.getDate() + 1);
  const r = [
    { texte: "Ce soir 20 h – 22 h", p: plage(iso(auj), "20:00", "22:00") },
    { texte: "Demain midi 12 h – 14 h", p: plage(iso(dem), "12:00", "14:00") },
    { texte: "Demain soir 20 h – 22 h", p: plage(iso(dem), "20:00", "22:00") },
  ];
  const fin = echeance ? new Date(echeance) : null;
  return r.filter(x => new Date(x.p.fin) > new Date(maintenant.getTime() + 15 * 60e3) && (!fin || new Date(x.p.debut) < fin));
}

// Les heures qu'on peut choisir dans une plage, tous les quarts d'heure (pas dans le passé). → [{ valeur: ISO, texte: "20 h 15" }]
export function heuresDansPlage(p, maintenant = new Date()) {
  if (heureFixe(p)) { const d = new Date(p.debut); return d > maintenant ? [{ valeur: d.toISOString(), texte: heure(d) }] : []; }
  const r = [], fin = new Date(p.fin);
  let d = new Date(p.debut);
  d.setSeconds(0, 0);
  if (d.getMinutes() % 15) d.setMinutes(d.getMinutes() + 15 - (d.getMinutes() % 15));
  for (; d <= fin && r.length < 49; d = new Date(d.getTime() + 15 * 60e3)) if (d > maintenant) r.push({ valeur: d.toISOString(), texte: heure(d) });
  return r;
}

// Où en est le rendez-vous, de mon côté : « aucun », « j_ai_propose », « a_choisir », « decline_par_lui », « j_ai_decline », « fixe ».
// c : ce que renvoie creneaux_de (.creneaux) ; uid : moi.
export function etatRdv(c, uid) {
  if (!c) return "aucun";
  if (c.statut === "fixe") return "fixe";
  if (c.statut === "decline") return c.propose_par === uid ? "decline_par_lui" : "j_ai_decline";
  return c.propose_par === uid ? "j_ai_propose" : "a_choisir";
}
// Le forfait est-il réclamable ? (15 minutes après l'heure ; j'étais là depuis 15 minutes avant l'heure, pas lui)
export function forfaitPossible(c, maintenant = new Date()) {
  if (!c || c.statut !== "fixe" || !c.rdv) return false;
  const rdv = new Date(c.rdv).getTime(), la = x => x && new Date(x).getTime() >= rdv - 15 * 60e3;
  return maintenant.getTime() >= rdv + 15 * 60e3 && la(c.moi_la) && !la(c.adv_la);
}
