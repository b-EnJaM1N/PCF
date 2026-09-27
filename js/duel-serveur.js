// Échanges avec le serveur pour les duels (fonctions de supabase/etape-3-duels.sql)
// et mises à jour en direct (Realtime).
import { clientSupabase as client, verifier, essayer } from "./compte.js";

const rpc = (nom, args) => essayer(async () => verifier(await client().rpc(nom, args)));

export const chercher = texte => rpc("chercher_joueurs", { p_texte: texte });
export const creer = (adversaire, points, sets) => rpc("creer_duel", { p_adversaire: adversaire, p_points: points, p_sets: sets });
export const rejoindre = code => rpc("rejoindre_duel", { p_code: code });
export const repondre = (id, accepte) => rpc("repondre_duel", { p_id: id, p_accepte: accepte });
export const annuler = id => rpc("annuler_duel", { p_id: id });
export const pret = id => rpc("pret", { p_id: id });
export const jouer = (id, manche, signe) => rpc("jouer", { p_id: id, p_manche: manche, p_signe: signe });
export const reclamer = id => rpc("reclamer", { p_id: id });      // → { maintenant, duel }
export const abandonner = id => rpc("abandonner", { p_id: id });

// Mes duels en cours ou en attente (la base ne renvoie que ceux qui me concernent).
export const mesDuels = () => essayer(async () => verifier(await client().from("duels")
  .select("*").in("phase", ["attente", "presentation", "jeu", "entre_sets"]).order("cree_le", { ascending: false }).limit(30)));

export const lireDuel = id => essayer(async () => verifier(await client().from("duels").select("*").eq("id", id).single()));

export const profils = ids => essayer(async () => ids.length
  ? verifier(await client().from("profils").select("id,pseudo,numero,drapeau,avatar,fiche,visible_recherche").in("id", ids))
  : []);

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
