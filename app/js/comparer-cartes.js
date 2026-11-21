// Comparer deux cartes de joueur (21 novembre, demande du porteur du projet) : depuis ma carte, « ⚖️ Comparer » (un ami ou un
// pseudo) ; depuis la carte d'un autre joueur, « ⚖️ Comparer avec moi ». En haut, les deux notes générales ; puis les six notes,
// la meilleure de chaque ligne en couleur ; en bas, le score. Les calculs sont dans carte-logique.js (comparer).
import { comparer } from "./carte-logique.js";
import { MARQUE } from "./marque.js";

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

// L'image à partager (21 novembre, demande du porteur du projet) : 1080 × 1420, avec les deux pseudos (pas « Toi »).
export async function dessinerComparaison(canvas, moi, lui) {
  const L = 1080, H = 1420, COND = "\"Barlow Condensed\", sans-serif", TXT = "Barlow, sans-serif", OR = "#F4C542", GRIS = "#9DB4D3", BLANC = "#F5F7FA";
  try { await Promise.all(["800 80px \"Barlow Condensed\"", "700 40px \"Barlow Condensed\"", "500 30px Barlow", "700 30px Barlow"].map(f => document.fonts.load(f))); } catch { /* police de secours */ }
  canvas.width = L; canvas.height = H;
  const ctx = canvas.getContext("2d"), r = comparer(moi.notes, lui.notes), [ga, gb] = r.generales;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#173F73"); g.addColorStop(1, "#0A2140");
  ctx.fillStyle = g; ctx.fillRect(0, 0, L, H);
  ctx.strokeStyle = OR; ctx.lineWidth = 8; ctx.strokeRect(24, 24, L - 48, H - 48);
  const ecrire = (t, x, y, police, couleur = BLANC, align = "center", largeur = 0) => {
    ctx.font = police; ctx.fillStyle = couleur; ctx.textAlign = align;
    if (largeur) { let taille = parseInt(police.match(/(\d+)px/)[1], 10); while (ctx.measureText(t).width > largeur && taille > 20) { taille -= 2; ctx.font = police.replace(/\d+px/, `${taille}px`); } }
    ctx.fillText(t, x, y);
  };
  ecrire("⚖️ COMPARAISON DES CARTES", L / 2, 120, `800 64px ${COND}`, OR);
  // Les deux notes générales
  const xa = 270, xb = L - 270, mieuxA = ga !== null && (gb === null || ga > gb), mieuxB = gb !== null && (ga === null || gb > ga);
  ecrire(String(ga ?? "–"), xa, 330, `800 190px ${COND}`, mieuxA ? OR : BLANC);
  ecrire(String(gb ?? "–"), xb, 330, `800 190px ${COND}`, mieuxB ? OR : BLANC);
  ecrire("GÉNÉRAL", L / 2, 270, `700 40px ${COND}`, GRIS);
  ecrire(moi.nom.toLocaleUpperCase("fr-FR"), xa, 400, `700 50px ${COND}`, BLANC, "center", 420);
  ecrire(lui.nom.toLocaleUpperCase("fr-FR"), xb, 400, `700 50px ${COND}`, BLANC, "center", 420);
  ecrire(`${moi.typeNiveau.toLowerCase()} ${moi.niveau}`, xa, 445, `500 30px ${TXT}`, GRIS, "center", 420);
  ecrire(`${lui.typeNiveau.toLowerCase()} ${lui.niveau}`, xb, 445, `500 30px ${TXT}`, GRIS, "center", 420);
  // Les six notes
  let y = 520;
  r.lignes.forEach(l => {
    ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.fillRect(110, y, L - 220, 2);
    ecrire(String(l.a), xa, y + 88, `800 80px ${COND}`, l.mieux === 0 ? OR : BLANC);
    ecrire(String(l.b), xb, y + 88, `800 80px ${COND}`, l.mieux === 1 ? OR : BLANC);
    ecrire(l.code, L / 2, y + 62, `700 46px ${COND}`, BLANC);
    ecrire(l.nom, L / 2, y + 100, `500 28px ${TXT}`, GRIS);
    y += 115;
  });
  ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.fillRect(110, y, L - 220, 2);
  // Le score
  const egal = r.egalites ? ` · ${r.egalites} ÉGALITÉ${r.egalites > 1 ? "S" : ""}` : "";
  ecrire(`NOTES GAGNÉES : ${r.gagnees} – ${r.perdues}${egal}`, L / 2, y + 80, `700 48px ${COND}`, BLANC, "center", L - 200);
  ecrire(MARQUE.nom.toLocaleUpperCase("fr-FR"), L / 2, H - 56, `800 34px ${COND}`, OR);
  return canvas;
}

// ctx : { maCarte() → { nom, notes, typeNiveau, niveau } ; carteEnLigne(uid) → la même chose, ou un message (texte) si elle ne
// peut pas être montrée ; mesAmis() ; chercher(texte) ; monId() }
export function installerComparaison(ctx) {
  let recherche = 0, courante = null;
  const msg = (t, erreur = false) => { $("cmpMsg").textContent = t; $("cmpMsg").classList.toggle("erreur", erreur); };
  const choisir = () => { $("cmpChoix").hidden = false; $("cmpResultat").hidden = true; $("cmpAutre").hidden = true; $("cmpPartager").hidden = true; msg(""); };
  const ligne = p => `<button class="btn alt cmp-ligne" data-id="${esc(p.id)}">${esc(nomDe(p))}${p.niveau ? `<small> · niveau ${esc(p.niveau)}</small>` : ""}</button>`;

  async function montrer(uid) {
    msg("Chargement…");
    let lui;
    try { lui = await ctx.carteEnLigne(uid); } catch { lui = "Impossible de charger sa carte. Vérifie ta connexion."; }
    if (typeof lui === "string") { msg(lui, true); return; }
    $("cmpChoix").hidden = true; $("cmpResultat").hidden = false; $("cmpAutre").hidden = false; msg("");
    const moi = ctx.maCarte();
    $("cmpResultat").innerHTML = htmlComparaison(moi, lui);
    courante = { moi, lui }; $("cmpPartager").hidden = false;
  }

  // Ouvre la fenêtre : avec un joueur déjà choisi (uid), ou pour en choisir un.
  async function ouvrir(uid = null) {
    $("comparer").classList.add("show");
    $("cmpPseudo").value = ""; $("cmpResultats").innerHTML = "";
    if (uid) { $("cmpChoix").hidden = true; $("cmpResultat").hidden = true; $("cmpAutre").hidden = true; $("cmpPartager").hidden = true; await montrer(uid); return; }
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
  // Partager l'image (ou l'enregistrer, si le téléphone ne sait pas la partager)
  $("cmpPartager").addEventListener("click", async () => {
    if (!courante) return;
    const b = $("cmpPartager"); b.disabled = true;
    try {
      const canvas = await dessinerComparaison(document.createElement("canvas"), courante.moi, courante.lui);
      const blob = await new Promise(ok => canvas.toBlob(ok, "image/png")), f = new File([blob], "comparaison-des-cartes.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [f] })) {
        try { await navigator.share({ files: [f], title: MARQUE.nom }); } catch (e) { if (e?.name !== "AbortError") msg("Le partage n'a pas marché.", true); }
      } else {
        const a = document.createElement("a"), url = URL.createObjectURL(blob);
        a.href = url; a.download = f.name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10e3);
        msg("Image enregistrée : partage-la depuis ta galerie.");
      }
    } finally { b.disabled = false; }
  });
  $("cmpFermer").addEventListener("click", () => $("comparer").classList.remove("show"));
  return { ouvrir };
}
