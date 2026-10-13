// Les jetons : le solde en haut à droite de l'écran (il mène à la boutique) ; en haut du menu « Jouer »,
// seulement ce qu'il y a à prendre (bonus du jour, renflouement) ou l'invitation à créer un compte.
import { clientSupabase as client, verifier, essayer } from "./compte.js";
import { texteSerie } from "./jetons-logique.js";

const $ = id => document.getElementById(id);
const rpc = nom => essayer(async () => verifier(await client().rpc(nom)));

// ctx : { compte (installerCompte) }
export function installerJetons(ctx) {
  let etat = null, connecte = false;
  const dire = (t, erreur = false) => { $("jetonsMsg").textContent = t; $("jetonsMsg").classList.toggle("erreur", erreur); };

  function render() {
    const msg = !!$("jetonsMsg").textContent;
    $("jetonsHaut").hidden = !connecte;
    $("jetonsHors").hidden = connecte;
    $("jetonsDedans").hidden = !connecte;
    $("jetonsBonus").hidden = !etat?.bonus_dispo;
    $("jetonsRenfl").hidden = !etat?.renflouement_dispo;
    $("jetonsCarte").hidden = connecte && !etat?.bonus_dispo && !etat?.renflouement_dispo && !msg;
    if (!connecte) return;
    $("jetonsSolde").textContent = etat ? Math.max(0, Math.round(Number(etat.solde) || 0)).toLocaleString("fr-FR").replace(/\s/g, " ") : "…";
    $("jetonsHaut").title = `Tes jetons (fictifs : ils ne s'achètent pas et ne s'échangent pas)${etat?.serie > 0 ? ` · ${texteSerie(etat)}` : ""} · touche pour la boutique`;
    if (etat?.bonus_dispo) { $("jetonsBonus").textContent = `🎁 Bonus du jour : +${etat.bonus_montant} jetons`; $("jetonsBonus").title = texteSerie(etat); }
  }

  async function rafraichir() {
    if (!connecte) { render(); return; }
    try { etat = await rpc("mes_jetons"); dire(""); }
    catch (e) { dire(/mes_jetons|function/i.test(e.message) ? "Les jetons arrivent bientôt." : e.message, true); }
    render();
  }

  async function reclamer(bouton, nom, texte) {
    bouton.disabled = true;
    try { etat = await rpc(nom); dire(texte(etat.gagne)); }
    catch (e) { dire(e.message, true); }
    bouton.disabled = false; render();
  }
  $("jetonsBonus").addEventListener("click", () => reclamer($("jetonsBonus"), "prendre_bonus_quotidien", g => `+${g} jetons ! ${texteSerie(etat)}`));
  $("jetonsRenfl").addEventListener("click", () => reclamer($("jetonsRenfl"), "renflouer", g => `+${g} jetons pour repartir.`));

  ctx.compte.surConnexion(session => { connecte = !!session?.user; etat = null; rafraichir(); });
  connecte = !!ctx.compte.session()?.user;
  rafraichir();

  return {
    rafraichir,
    // Une victoire contre un bot : quelques jetons (plafonnés chaque jour par le serveur). Renvoie le montant gagné.
    async gagnerEntrainement() {
      if (!connecte) return 0;
      try { etat = await rpc("gain_entrainement"); render(); return etat.gagne || 0; } catch { return 0; }
    },
  };
}
