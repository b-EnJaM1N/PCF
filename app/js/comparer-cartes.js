// Comparer deux cartes de joueur (21 novembre, demande du porteur du projet) : depuis ma carte, « ⚖️ Comparer » (un ami ou un
// pseudo) ; depuis la carte d'un autre joueur, « ⚖️ Comparer avec moi ». En haut, les deux notes générales ; puis les six notes,
// la meilleure de chaque ligne en couleur ; en bas, le score. Les calculs sont dans carte-logique.js (comparer).
import { comparer } from "./carte-logique.js";

const $ = id => document.getElementById(id);
const esc = t => String(t ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const nomDe = p => `${p.pseudo}${p.numero ? `#${p.numero}` : ""}`;

// Le tableau de la comparaison. moi, lui : { nom, notes, typeNiveau, niveau }.
export function htmlComparaison(moi, lui) {
  const r = comparer(moi.notes, lui.notes), [ga, gb] = r.generales;
  const gen = (g, autre, qui) => `<div class="cmp-joueur${g !== null && (autre === null || g > autre) ? " mieux" : ""}"><b class="cmp-gen">${g ?? "–"}</b><span>${esc(qui)}</span></div>`;
  const cell = (v, m) => `<td class="cmp-n${m ? " mieux" : ""}">${esc(v)}</td>`;
  const nbNotes = r.lignes.length, egal = r.egalites ? ` · ${r.egalites} égalité${r.egalites > 1 ? "s" : ""}` : "";
  return `<div class="cmp-generales">${gen(ga, gb, "Toi")}<span class="cmp-vs">GÉNÉRAL</span>${gen(gb, ga, lui.nom)}</div>
    <p class="hint cmp-niv">${esc(moi.typeNiveau.toLowerCase())} ${moi.niveau} · ${esc(lui.typeNiveau.toLowerCase())} ${lui.niveau}</p>
    <table class="cmp-table"><thead><tr><th>Toi</th><th></th><th>${esc(lui.nom)}</th></tr></thead><tbody>
    ${r.lignes.map(l => `<tr>${cell(l.a, l.mieux === 0)}<td class="cmp-code"><b>${esc(l.code)}</b><small>${esc(l.nom)}</small></td>${cell(l.b, l.mieux === 1)}</tr>`).join("")}
    </tbody></table>
    <p class="cmp-score">Tu gagnes <b>${r.gagnees} note${r.gagnees > 1 ? "s" : ""} sur ${nbNotes}</b> · ${esc(lui.nom)} en gagne ${r.perdues}${egal}</p>`;
}

// ctx : { maCarte() → { nom, notes, typeNiveau, niveau } ; carteEnLigne(uid) → la même chose, ou un message (texte) si elle ne
// peut pas être montrée ; mesAmis() ; chercher(texte) ; monId() }
export function installerComparaison(ctx) {
  let recherche = 0;
  const msg = (t, erreur = false) => { $("cmpMsg").textContent = t; $("cmpMsg").classList.toggle("erreur", erreur); };
  const choisir = () => { $("cmpChoix").hidden = false; $("cmpResultat").hidden = true; $("cmpAutre").hidden = true; msg(""); };
  const ligne = p => `<button class="btn alt cmp-ligne" data-id="${esc(p.id)}">${esc(nomDe(p))}${p.niveau ? `<small> · niveau ${esc(p.niveau)}</small>` : ""}</button>`;

  async function montrer(uid) {
    msg("Chargement…");
    let lui;
    try { lui = await ctx.carteEnLigne(uid); } catch { lui = "Impossible de charger sa carte. Vérifie ta connexion."; }
    if (typeof lui === "string") { msg(lui, true); return; }
    $("cmpChoix").hidden = true; $("cmpResultat").hidden = false; $("cmpAutre").hidden = false; msg("");
    $("cmpResultat").innerHTML = htmlComparaison(ctx.maCarte(), lui);
  }

  // Ouvre la fenêtre : avec un joueur déjà choisi (uid), ou pour en choisir un.
  async function ouvrir(uid = null) {
    $("comparer").classList.add("show");
    $("cmpPseudo").value = ""; $("cmpResultats").innerHTML = "";
    if (uid) { $("cmpChoix").hidden = true; $("cmpResultat").hidden = true; $("cmpAutre").hidden = true; await montrer(uid); return; }
    choisir();
    $("cmpAmis").innerHTML = `<p class="hint">Chargement…</p>`;
    try {
      const amis = (await ctx.mesAmis()).filter(a => a.statut === "amis").sort((a, b) => nomDe(a).localeCompare(nomDe(b), "fr"));
      $("cmpAmis").innerHTML = amis.length ? amis.map(ligne).join("") : `<p class="hint">Pas encore d'amis : cherche un pseudo.</p>`;
    } catch { $("cmpAmis").innerHTML = `<p class="hint">Tes amis n'ont pas pu être chargés. Cherche un pseudo.</p>`; }
  }

  $("cmpPseudo").addEventListener("input", () => {
    clearTimeout(recherche);
    const t = $("cmpPseudo").value.trim();
    if (t.replace(/#.*/, "").length < 2) { $("cmpResultats").innerHTML = ""; return; }
    recherche = setTimeout(async () => {
      try {
        const res = (await ctx.chercher(t)).filter(p => p.id !== ctx.monId());
        if ($("cmpPseudo").value.trim() !== t) return;
        $("cmpResultats").innerHTML = res.length ? res.map(ligne).join("") : `<p class="hint">Aucun joueur trouvé.</p>`;
      } catch (e) { msg(e.message, true); }
    }, 350);
  });
  $("comparer").addEventListener("click", e => { const b = e.target.closest(".cmp-ligne"); if (b) montrer(b.dataset.id); });
  $("cmpAutre").addEventListener("click", () => ouvrir());
  $("cmpFermer").addEventListener("click", () => $("comparer").classList.remove("show"));
  return { ouvrir };
}
