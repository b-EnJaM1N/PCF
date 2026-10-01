// Échanges avec le serveur pour les duels (fonctions de supabase/etape-3-duels.sql)
// et mises à jour en direct (Realtime).
import { clientSupabase as client, verifier, essayer } from "./compte.js";
import { classements } from "./social-serveur.js";
import { CLASSEMENT_DEPART } from "./social-logique.js";
import { formatCourt } from "./duel-logique.js";

const rpc = (nom, args) => essayer(async () => verifier(await client().rpc(nom, args)));

export const chercher = texte => rpc("chercher_joueurs", { p_texte: texte });
// classe = false : duel amical, sans effet sur le niveau officiel.
// Les formats courts (match en 1 set, sets de 3 ou 1 point) sont toujours amicaux.
// mise : en jetons (0 = sans mise), prélevée à chacun quand le match commence ; le gagnant remporte 1,8 fois la mise.
export const creer = (adversaire, points, sets, classe = true, mise = 0) =>
  rpc("lancer_defi", { p_adversaire: adversaire, p_points: points, p_sets: sets, p_classe: classe && !formatCourt(points, sets), p_mise: mise || 0 });
export const rejoindre = code => rpc("rejoindre_duel", { p_code: code });
export const repondre = (id, accepte) => rpc("repondre_duel", { p_id: id, p_accepte: accepte });
export const annuler = id => rpc("annuler_duel", { p_id: id });
export const pret = id => rpc("pret", { p_id: id });
export const jouer = (id, manche, signe) => rpc("jouer", { p_id: id, p_manche: manche, p_signe: signe });
export const reclamer = id => rpc("reclamer", { p_id: id });      // → { maintenant, duel }
export const abandonner = id => rpc("abandonner", { p_id: id });
export const serrerLaMain = (id, style) => rpc("serrer_la_main", { p_id: id, p_style: style });   // → le duel (avec poignee0, poignee1)

// Mes duels en cours ou en attente (la base ne renvoie que ceux qui me concernent).
export const mesDuels = () => essayer(async () => verifier(await client().from("duels")
  .select("*").in("phase", ["attente", "presentation", "jeu", "entre_sets"]).order("cree_le", { ascending: false }).limit(30)));

export const lireDuel = id => essayer(async () => verifier(await client().from("duels").select("*").eq("id", id).single()));

// Fiches des joueurs, avec leur niveau officiel (champ « classement »).
export const profils = ids => essayer(async () => {
  if (!ids.length) return [];
  const lignes = verifier(await client().from("profils").select("id,pseudo,numero,drapeau,avatar,fiche,visible_recherche").in("id", ids));
  const cl = await classements(ids).catch(() => new Map());
  return lignes.map(p => ({ ...p, classement: cl.get(p.id)?.points ?? CLASSEMENT_DEPART }));
});

export const changerVisibilite = (uid, visible) => essayer(async () =>
  verifier(await client().from("profils").update({ visible_recherche: visible }).eq("id", uid).select("visible_recherche").single()));

// Écoute les changements d'un ou plusieurs duels. filtre : « id=eq.… », « j1=eq.… »…
// Renvoie une fonction pour arrêter l'écoute.
export function ecouter(nom, filtre, rappel) {
  try {
    const canal = client().channel(`${nom}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "duels", filter: filtre }, p => { if (p.new && p.new.id) rappel(p.new); })
      .subscribe();
    return () => { try { client().removeChannel(canal); } catch { /* rien */ } };
  } catch { return () => {}; }
}
