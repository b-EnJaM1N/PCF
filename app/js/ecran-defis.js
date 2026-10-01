// Les défis du jour, en haut du menu « Jouer » (repliés sous le match du jour) : 3 défis, une coche quand c'est fait, un bouton pour encaisser.
import * as social from "./social-serveur.js";
import { jourDeParis, journee, suivreMatch, suivrePoignee, etatDefi } from "./defis-logique.js";
import { lire, ecrire } from "./stockage.js";

const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// ctx : { compte, jetons() }
export function installerDefis(ctx) {
  let uid = null, defis = null;
  const jour = () => journee(lire("defisJour", null), jourDeParis());
  const garder = e => ecrire("defisJour", e);

  async function rafraichir() {
    if (!uid) { $("defisCarte").hidden = true; return; }
    try { defis = await social.defisDuJour(); } catch { $("defisCarte").hidden = true; return; }
    render();
  }

  function render() {
    if (!defis?.length) { $("defisCarte").hidden = true; return; }
    const e = jour(), etats = defis.map(d => ({ d, ...etatDefi(d, e) }));
    const faits = etats.filter(x => x.fait).length;
    const aEncaisser = etats.some(x => x.pret && !x.fait);
    $("defisCarte").hidden = false;
    $("defisTitre").textContent = `🎯 Défis du jour · ${faits}/${defis.length}${aEncaisser ? " · 🎁 à encaisser" : ""}`;
    if (aEncaisser) $("defisCarte").open = true;   // replié le reste du temps, pour ne pas charger le menu
    $("defisListe").innerHTML = etats.map(x => `<li class="${x.fait ? "fait" : ""}">
      <span>${x.fait ? "✅" : "▫️"} ${esc(x.texte)}${x.progression && !x.fait ? ` <small>${x.progression}</small>` : ""}</span>
      ${x.fait ? `<small>+${x.d.recompense}</small>` : x.pret ? `<button class="jetons-puce" data-defi="${x.d.id}">+${x.d.recompense}</button>` : `<small>${x.d.recompense} jetons</small>`}</li>`).join("");
  }

  $("defisListe").addEventListener("click", async ev => {
    const b = ev.target.closest("button[data-defi]"); if (!b) return;
    b.disabled = true;
    try { const r = await social.validerDefi(b.dataset.defi); defis = r.defis; $("defisMsg").textContent = `+${r.gagne} jetons !`; ctx.jetons?.(); }
    catch (e) { $("defisMsg").textContent = e.message; }
    render();
  });

  ctx.compte.surConnexion(session => { uid = session?.user?.id || null; rafraichir(); });
  uid = ctx.compte.session()?.user?.id || null;
  rafraichir();

  return {
    rafraichir,
    // Après chaque match (solo ou duel) et chaque poignée de main : la journée avance.
    match: r => { garder(suivreMatch(jour(), r)); render(); },
    poignee: style => { garder(suivrePoignee(jour(), style)); render(); },
  };
}
