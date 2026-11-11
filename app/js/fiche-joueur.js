// La fiche complète d'un joueur en ligne (11 novembre, choix du porteur du projet ; supabase/etape-68-fiche-joueur.sql) :
// 📊 ses stats (tous ses duels contre des joueurs, jamais contre un bot), 🤝 ses face-à-face, 📜 son historique.
// Ici, seulement la mise en forme (testée) : les données viennent de fiche_joueur.
import { ouvert } from "./nouveautes.js";

export const ficheVisible = loc => ouvert("fiche", loc);

const esc = t => String(t ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pct = (k, n) => (n ? Math.round((100 * k) / n) : 0);
export const dateCourte = q => new Date(q).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

// Les stats en lignes : [[libellé, valeur]].
export function lignesStats(s) {
  if (!s?.joues) return [];
  return [
    ["Duels joués", `${s.joues}`],
    ["Victoires", `${s.v} – ${s.d} (${pct(s.v, s.joues)} %)`],
    ["Duels officiels", s.officiels ? `${s.officiels_v} – ${s.officiels - s.officiels_v} (${pct(s.officiels_v, s.officiels)} %)` : "aucun"],
    ["Sets", `${s.sets_g} gagnés, ${s.sets_p} perdus`],
    ["Série en cours", s.serie ? `${s.serie} victoire${s.serie > 1 ? "s" : ""} d'affilée` : "—"],
    ["Meilleure série", `${s.meilleure_serie} victoire${s.meilleure_serie > 1 ? "s" : ""}`],
    ["Smashs réussis", s.smashs ? `${s.smashs_reussis} sur ${s.smashs} (${pct(s.smashs_reussis, s.smashs)} %)` : "aucun smash"],
  ];
}

// Les 3 onglets (sans script : trois boutons radio, comme « Contre toi / Tous ses matchs »).
// f : ce que renvoie fiche_joueur ; nom : son pseudo ; x : un numéro unique pour les boutons ; avatar(av) → SVG.
export function htmlFiche(f, nom, x, avatar = () => "") {
  const n = esc(nom), s = lignesStats(f?.stats);
  const stats = s.length ? `<table class="fiche-stats">${s.map(([l, v]) => `<tr><td>${l}</td><td><b>${esc(v)}</b></td></tr>`).join("")}</table>`
    + `<p class="hint">Tous ses duels contre des joueurs en ligne (jamais contre un bot).</p>`
    : `<p class="hint">${n} n'a pas encore joué de duel contre un autre joueur.</p>`;
  const cache = `<p class="hint">${n} a choisi de cacher ses adversaires.</p>`;
  const ligneAdv = (a, droite, detail = "") => `<div class="joueur"><span class="mini">${avatar(a?.avatar || {})}</span>
    <div style="min-width:0"><div class="jn">${esc(a?.pseudo || "?")}<small>#${esc(a?.numero ?? "")}</small></div>${detail ? `<div class="jd">${detail}</div>` : ""}</div>${droite}</div>`;
  const faces = f?.cache ? cache : (f?.face_a_face || []).length
    ? f.face_a_face.map(x => ligneAdv(x.adversaire, `<b class="fiche-bilan">${x.v} – ${x.d}</b>`, `${x.joues} duel${x.joues > 1 ? "s" : ""} · dernier le ${dateCourte(x.dernier)}`)).join("")
    : `<p class="hint">Pas encore de face-à-face.</p>`;
  const histo = f?.cache ? cache : (f?.historique || []).length
    ? f.historique.map(h => ligneAdv(h.adversaire, `<b class="fiche-bilan ${h.gagne ? "gagne" : "perdu"}">${h.gagne ? "V" : "D"}</b>`,
        `${(h.scores || []).map(([a, b]) => `${a}–${b}`).join(", ")}${h.fin === "abandon" ? " (abandon)" : h.fin === "forfait" ? " (forfait)" : ""} · ${dateCourte(h.quand)}${h.officiel ? " · officiel" : " · amical"}${h.tournoi ? " · tournoi" : ""}`)).join("")
    : `<p class="hint">Pas encore de duel terminé.</p>`;
  return `<h3 class="ff-titre">🧾 Sa fiche</h3><div class="ff-choix trois">`
    + `<input type="radio" name="fj${x}" id="fjS${x}" checked><label for="fjS${x}">📊 Stats</label>`
    + `<input type="radio" name="fj${x}" id="fjF${x}"><label for="fjF${x}">🤝 Face-à-face</label>`
    + `<input type="radio" name="fj${x}" id="fjH${x}"><label for="fjH${x}">📜 Historique</label>`
    + `<div class="ff-v1">${stats}</div><div class="ff-v2">${faces}</div><div class="ff-v3">${histo}</div></div>`;
}
