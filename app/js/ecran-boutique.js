// La boutique (Ma fiche › Boutique, ou la pastille 🛍️ des jetons) : de l'apparence, achetée avec des jetons.
// Un achat est définitif (ni remboursement, ni cadeau) ; la vitrine du jour propose 3 articles à −30 %.
import * as social from "./social-serveur.js";
import { ARTICLES, CATEGORIES, RARETES, article, GESTES, CELEBRATIONS, CADRES } from "./catalogue.js";
import { avatarSVG } from "./avatar.js";
import { texteJetons } from "./jetons-logique.js";
import { texteCri } from "./celebrations.js";

const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// L'aperçu d'un article, dessiné avec l'avatar du joueur.
export function apercu(x, av) {
  if (x.categorie === "avatar") return avatarSVG({ ...av, [x.type]: x.cle });
  if (x.type === "geste") return `<span class="geste-${x.cle}">${avatarSVG({ ...av, symbole: GESTES[x.cle].symbole })}</span>`;
  if (x.type === "cri") return `<span class="ap-cri">${esc(texteCri(x.cle))}</span>`;
  if (x.type === "celebration") { const c = CELEBRATIONS[x.cle]; return `<span class="ap-celeb">${c.formes.map((f, i) => `<i style="color:${c.couleurs[i % c.couleurs.length]}">${f}</i>`).join("")}${c.formes.length < 3 ? `<i style="color:${c.couleurs[1]}">${c.formes[0]}</i>` : ""}</span>`; }
  if (x.type === "cadre") return `<span class="ap-cadre" style="--c:${CADRES[x.cle].couleur}">${avatarSVG(av)}</span>`;
  return "";
}

// ctx : { compte, lireP(), sauverP(), apresChangement(), jetons() }
export function installerBoutique(ctx) {
  let uid = null, etat = null, categorie = "avatar";
  const dire = (t, erreur = false) => { $("boutiqueMsg").textContent = t; $("boutiqueMsg").classList.toggle("erreur", erreur); };

  // Les achats enregistrés sur le serveur font foi : on les recopie dans la fiche.
  function retenir(e) {
    etat = e; const P = ctx.lireP();
    const achats = [...new Set(e.achats || [])];
    if (JSON.stringify(achats) !== JSON.stringify(P.achats || [])) { P.achats = achats; ctx.sauverP(); ctx.apresChangement(); }
  }
  async function rafraichir() {
    if (!uid) { render(); return; }
    try { retenir(await social.boutique()); dire(""); }
    catch (e) { dire(/boutique|function/i.test(e.message) ? "La boutique ouvre bientôt." : e.message, true); }
    render();
  }

  const utilise = (P, x) => (x.categorie === "avatar" ? P.av[x.type] === x.cle : P[x.type] === x.cle);
  function carte(x, prixVitrine) {
    const P = ctx.lireP(), a = (P.achats || []).includes(x.id), prix = prixVitrine ?? x.prix;
    const bouton = !uid ? "" : a ? (utilise(P, x) ? `<button class="petit alt" disabled>Utilisé ✓</button>` : `<button class="petit" data-utiliser="${x.id}">Utiliser</button>`)
      : `<button class="petit" data-acheter="${x.id}">🪙 ${prix}</button>`;
    return `<div class="article ${x.rarete}">
      <div class="ap">${apercu(x, P.av)}</div>
      <div class="art-nom">${esc(x.nom)}</div>
      <div class="art-rarete">${RARETES[x.rarete].nom}${prixVitrine ? ` · <s>${x.prix}</s> −30 %` : ""}</div>
      ${bouton}</div>`;
  }

  function render() {
    $("boutiqueHors").hidden = !!uid;
    $("boutiqueSolde").textContent = uid && etat ? texteJetons(etat.solde) : "";
    $("boutiqueVitrine").innerHTML = uid && etat?.vitrine ? etat.vitrine.map(v => article(v.id) && carte(article(v.id), v.prix_remise)).join("") : "";
    $("boutiqueVitrineCarte").hidden = !(uid && etat?.vitrine);
    $("boutiqueOnglets").innerHTML = CATEGORIES.map(c => `<button data-cat="${c.id}" aria-pressed="${c.id === categorie}">${c.nom}</button>`).join("");
    $("boutiqueArticles").innerHTML = ARTICLES.filter(x => x.categorie === categorie).map(x => carte(x)).join("");
  }

  $("boutiqueOnglets").addEventListener("click", e => { const b = e.target.closest("[data-cat]"); if (b) { categorie = b.dataset.cat; render(); } });
  $("viewBoutique").addEventListener("click", async e => {
    const achat = e.target.closest("[data-acheter]"), util = e.target.closest("[data-utiliser]");
    if (util) {
      const x = article(util.dataset.utiliser), P = ctx.lireP();
      if (x.categorie === "avatar") P.av[x.type] = x.cle; else P[x.type] = x.cle;
      ctx.sauverP(); ctx.apresChangement(); dire(`${x.nom} : c'est équipé !`); render(); return;
    }
    if (!achat) return;
    const x = article(achat.dataset.acheter), v = etat?.vitrine?.find(y => y.id === x.id), prix = v ? v.prix_remise : x.prix;
    if (!confirm(`Acheter « ${x.nom} » pour ${prix} jetons ? L'achat est définitif.`)) return;
    achat.disabled = true;
    try {
      retenir(await social.acheter(x.id));
      const P = ctx.lireP();
      if (x.categorie === "avatar") P.av[x.type] = x.cle; else P[x.type] = x.cle;   // on l'utilise tout de suite
      ctx.sauverP(); ctx.apresChangement(); ctx.jetons?.();
      dire(`Bravo, « ${x.nom} » est à toi, et déjà équipé !`);
    } catch (err) { dire(err.message, true); }
    render();
  });

  ctx.compte.surConnexion(session => { uid = session?.user?.id || null; etat = null; rafraichir(); });
  uid = ctx.compte.session()?.user?.id || null;
  render();
  return { rafraichir };
}
