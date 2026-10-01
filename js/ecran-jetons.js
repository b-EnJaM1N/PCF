// Les jetons, en petit en haut du menu « Jouer » : solde, série, bonus du jour, renflouement.
import { clientSupabase as client, verifier, essayer } from "./compte.js";
import { texteJetons, texteSerie, serieCourte } from "./jetons-logique.js";

const $ = id => document.getElementById(id);
const rpc = nom => essayer(async () => verifier(await client().rpc(nom)));

// ctx : { compte (installerCompte) }
export function installerJetons(ctx) {
  let etat = null, connecte = false;
  const dire = (t, erreur = false) => { $("jetonsMsg").textContent = t; $("jetonsMsg").classList.toggle("erreur", erreur); };

  function render() {
    $("jetonsCarte").hidden = false;
    $("jetonsHors").hidden = connecte;
    $("jetonsDedans").hidden = !connecte;
    if (!connecte) return;
    $("jetonsSolde").textContent = etat ? texteJetons(etat.solde) : "…";
    $("jetonsSerie").textContent = serieCourte(etat);
    $("jetonsSerie").title = texteSerie(etat);
    $("jetonsBonus").hidden = !etat?.bonus_dispo;
    if (etat?.bonus_dispo) { $("jetonsBonus").textContent = `🎁 +${etat.bonus_montant}`; $("jetonsBonus").title = `Bonus du jour : +${etat.bonus_montant} jetons`; }
    $("jetonsRenfl").hidden = !etat?.renflouement_dispo;
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
