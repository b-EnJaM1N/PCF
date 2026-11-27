// Comparer deux cartes de joueur (21 novembre, demande du porteur du projet) : depuis ma carte, « ⚖️ Comparer » (un ami ou un
// pseudo) ; depuis la carte d'un autre joueur, « ⚖️ Comparer avec moi ». (27 novembre, choix du porteur du projet : le
// face-à-face) En haut, les deux mains face à face, « VS », les notes générales ; puis chaque note avec une barre de chaque côté,
// le meilleur en couleur (or pour moi, corail pour l'autre). Les calculs sont dans carte-logique.js (comparer).
import { comparer } from "./carte-logique.js";
import { MARQUE } from "./marque.js";

const $ = id => document.getElementById(id);
const esc = t => String(t ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const nomDe = p => `${p.pseudo}${p.numero ? `#${p.numero}` : ""}`;

// La longueur d'une barre (une note sur 100), en %.
const largeur = v => Math.max(0, Math.min(100, Number(v) || 0));

// La comparaison. moi, lui : { nom, notes, typeNiveau, niveau, av (le dessin de la main, avatarSVG) }.
export function htmlComparaison(moi, lui) {
  const r = comparer(moi.notes, lui.notes), [ga, gb] = r.generales;
  const joueur = (g, autre, qui, j, cote) => `<div class="cmp-joueur ${cote}${g !== null && (autre === null || g > autre) ? " mieux" : ""}">`
    + `<div class="cmp-main">${j.av || ""}</div><b class="cmp-gen">${g ?? "–"}</b><span class="cmp-nom">${esc(qui)}</span>`
    + `<small>${esc(j.typeNiveau.toLowerCase())} ${esc(j.niveau)}</small></div>`;
  const barre = (v, m, cote) => `<div class="cmp-barre ${cote}"><i style="width:${largeur(v)}%"${m ? ` class="mieux"` : ""}></i></div>`;
  return `<div class="cmp-generales">${joueur(ga, gb, "Toi", moi, "moi")}<span class="cmp-vs">VS</span>${joueur(gb, ga, lui.nom, lui, "lui")}</div>
    <div class="cmp-lignes">${r.lignes.map(l => `<div class="cmp-ligne-note">`
      + `<b class="cmp-n moi${l.mieux === 0 ? " mieux" : ""}">${esc(l.a)}</b>${barre(l.a, l.mieux === 0, "moi")}`
      + `<span class="cmp-code"><b>${esc(l.code)}</b><small>${esc(l.nom)}</small></span>`
      + `${barre(l.b, l.mieux === 1, "lui")}<b class="cmp-n lui${l.mieux === 1 ? " mieux" : ""}">${esc(l.b)}</b></div>`).join("")}</div>`;
    // (21 novembre, demande du porteur du projet : sans « Tu gagnes 2 notes sur 6 », qui n'apportait rien)
}
// Le dessin d'une main en image (pour l'image à partager).
function image(svg) {
  return new Promise(ok => {
    if (!svg) { ok(null); return; }
    const img = new Image();
    img.onload = () => ok(img); img.onerror = () => ok(null);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.replace("<svg ", "<svg width=\"600\" height=\"600\" "));
  });
}

// L'image à partager (21 novembre, demande du porteur du projet ; 27 novembre : le face-à-face) : 1080 × 1520, avec les deux
// pseudos (pas « Toi »).
export async function dessinerComparaison(canvas, moi, lui) {
  const L = 1080, H = 1520, CORAIL = "#F0846E", COND = "\"Barlow Condensed\", sans-serif", TXT = "Barlow, sans-serif", OR = "#F4C542", GRIS = "#9DB4D3", BLANC = "#F5F7FA";
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
  ecrire("⚖️ COMPARAISON DES CARTES", L / 2, 110, `800 60px ${COND}`, OR);
  // Les deux mains face à face, « VS », les notes générales
  const xa = 270, xb = L - 270, mieuxA = ga !== null && (gb === null || ga > gb), mieuxB = gb !== null && (ga === null || gb > ga);
  const [ia, ib] = await Promise.all([image(moi.av), image(lui.av)]), R = 125, ym = 300;
  [[ia, xa], [ib, xb]].forEach(([img, x]) => {
    if (!img) return;
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
    ctx.beginPath(); ctx.arc(x, ym, R, 0, Math.PI * 2); ctx.fillStyle = "#0A2140"; ctx.fill(); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.arc(x, ym, R, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(img, x - R, ym - R, 2 * R, 2 * R); ctx.restore();
  });
  ctx.save(); ctx.shadowColor = "rgba(244,197,66,.7)"; ctx.shadowBlur = 24; ecrire("VS", L / 2, ym + 30, `800 90px ${COND}`, OR); ctx.restore();
  ecrire(String(ga ?? "–"), xa, 560, `800 140px ${COND}`, mieuxA ? OR : BLANC);
  ecrire(String(gb ?? "–"), xb, 560, `800 140px ${COND}`, mieuxB ? OR : BLANC);
  ecrire("GÉNÉRAL", L / 2, 530, `700 36px ${COND}`, GRIS);
  ecrire(moi.nom.toLocaleUpperCase("fr-FR"), xa, 620, `700 46px ${COND}`, BLANC, "center", 420);
  ecrire(lui.nom.toLocaleUpperCase("fr-FR"), xb, 620, `700 46px ${COND}`, BLANC, "center", 420);
  ecrire(`${moi.typeNiveau.toLowerCase()} ${moi.niveau}`, xa, 662, `500 28px ${TXT}`, GRIS, "center", 420);
  ecrire(`${lui.typeNiveau.toLowerCase()} ${lui.niveau}`, xb, 662, `500 28px ${TXT}`, GRIS, "center", 420);
  // Les notes : le chiffre, une barre de chaque côté (le meilleur en couleur), le nom de la note au milieu
  const BL = 250, BH = 18, ba = 200, bb = L - 200 - BL, pas = r.lignes.length > 6 ? 84 : 100;
  const barre = (x, v, couleur, versLaDroite) => {
    const w = (BL * largeur(v)) / 100, y0 = y + 38;
    ctx.fillStyle = "rgba(255,255,255,.1)"; arrondi(ctx, x, y0, BL, BH, BH / 2); ctx.fill();
    ctx.fillStyle = couleur; arrondi(ctx, versLaDroite ? x : x + BL - w, y0, w, BH, BH / 2); ctx.fill();
  };
  let y = 710;
  r.lignes.forEach(l => {
    ecrire(String(l.a), 140, y + 66, `800 62px ${COND}`, l.mieux === 0 ? OR : BLANC);
    ecrire(String(l.b), L - 140, y + 66, `800 62px ${COND}`, l.mieux === 1 ? CORAIL : BLANC);
    barre(ba, l.a, l.mieux === 0 ? OR : "#5D7799", false);
    barre(bb, l.b, l.mieux === 1 ? CORAIL : "#5D7799", true);
    ecrire(l.code, L / 2, y + 48, `700 40px ${COND}`, BLANC);
    ecrire(l.nom, L / 2, y + 76, `500 22px ${TXT}`, GRIS);
    y += pas;
  });
  ecrire(MARQUE.nom.toLocaleUpperCase("fr-FR"), L / 2, H - 56, `800 34px ${COND}`, OR);
  return canvas;
}

function arrondi(ctx, x, y, l, h, r) {
  r = Math.min(r, l / 2, h / 2);
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + l, y, x + l, y + h, r); ctx.arcTo(x + l, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + l, y, r); ctx.closePath();
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
