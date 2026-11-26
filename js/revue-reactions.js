// Les réactions sous les articles des Cahiers du HandSlam (26 novembre, exception validée par le porteur du projet) :
// 👍 👎 😂 🔥 👏, pour tout le monde, même sans compte (supabase/etape-91-reactions-revue.sql). Chaque navigateur garde un
// identifiant tiré au hasard : une réaction de chaque sorte par article, qu'on retire en touchant à nouveau ; 👍 et 👎 s'excluent.
import { SUPABASE_URL, SUPABASE_CLE_PUBLIQUE } from "./config.js";

export const REACTIONS = [
  ["pouce_haut", "👍", "J'aime"], ["pouce_bas", "👎", "Je n'aime pas"], ["rire", "😂", "Ça me fait rire"],
  ["feu", "🔥", "Génial"], ["bravo", "👏", "Bravo"],
];

// Les lignes du serveur ([{ cle, nombre, mien }]) → { cle: { n, mien } } pour chaque réaction.
export function etatReactions(lignes) {
  const e = Object.fromEntries(REACTIONS.map(([c]) => [c, { n: 0, mien: false }]));
  for (const l of lignes || []) if (e[l.cle]) e[l.cle] = { n: Number(l.nombre) || 0, mien: !!l.mien };
  return e;
}

// Le nom de l'article : la page officielle (canonical) sans « .html » (« revue-humain-trop-humain »).
export const nomArticle = adresse => (String(adresse || "").split("/").pop() || "").replace(/\.html$/, "");

function appareil() {
  try {
    let id = localStorage.getItem("hs_appareil_revue");
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("hs_appareil_revue", id); }
    return id;
  } catch { return crypto.randomUUID(); }   // (sans stockage : un identifiant le temps de la visite)
}

async function appel(fonction, corps) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fonction}`, {
    method: "POST", headers: { apikey: SUPABASE_CLE_PUBLIQUE, "Content-Type": "application/json" }, body: JSON.stringify(corps),
  });
  const donnees = await r.json().catch(() => null);
  if (!r.ok) throw new Error(donnees?.message || "Le serveur n'a pas répondu.");
  return donnees;
}

function installer(zone) {
  const article = nomArticle(document.querySelector('link[rel="canonical"]')?.href || location.pathname);
  const boutons = zone.querySelector(".reactions-boutons"), msg = zone.querySelector(".reactions-msg");
  const moi = appareil();
  let etat = etatReactions([]), occupe = false;
  const dire = t => { msg.textContent = t; msg.hidden = !t; };
  const dessiner = () => {
    boutons.innerHTML = REACTIONS.map(([c, emoji, titre]) =>
      `<button type="button" class="reaction${etat[c].mien ? " on" : ""}" data-cle="${c}" aria-pressed="${etat[c].mien}" aria-label="${titre} (${etat[c].n})" title="${titre}">`
      + `<span aria-hidden="true">${emoji}</span><b>${etat[c].n || ""}</b></button>`).join("");
  };
  dessiner();
  appel("compteurs_revue", { p_article: article, p_appareil: moi }).then(l => { etat = etatReactions(l); dessiner(); }).catch(() => {});
  boutons.addEventListener("click", async e => {
    const b = e.target.closest(".reaction");
    if (!b || occupe) return;
    const cle = b.dataset.cle, on = !etat[cle].mien;
    occupe = true; dire("");
    try { etat = etatReactions(await appel("reagir_revue", { p_article: article, p_appareil: moi, p_reaction: cle, p_on: on })); dessiner(); }
    catch (err) { dire(/fetch|network|failed/i.test(err?.message || "") ? "Pas de connexion : réessaie plus tard." : err.message); }
    occupe = false;
  });
}

if (typeof document !== "undefined") { const z = document.getElementById("reactions"); if (z) installer(z); }
