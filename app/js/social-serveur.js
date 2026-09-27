// Échanges avec le serveur pour le classement, les amis et les cercles
// (fonctions de supabase/etape-4-classement.sql).
import { clientSupabase as client, verifier, essayer } from "./compte.js";

const rpc = (nom, args = {}) => essayer(async () => verifier(await client().rpc(nom, args)));

// Niveau officiel d'un ou plusieurs joueurs : Map id → { points, joues, gagnes, meilleur }.
export const classements = ids => essayer(async () => new Map(ids.length
  ? verifier(await client().from("classements").select("joueur,points,joues,gagnes,meilleur").in("joueur", ids)).map(c => [c.joueur, c])
  : []));

export const mesAmis = () => rpc("mes_amis");
export const demanderAmi = id => rpc("demander_ami", { p_joueur: id });            // → "envoyee" ou "amis"
export const repondreAmi = (id, accepte) => rpc("repondre_ami", { p_joueur: id, p_accepte: accepte });
export const retirerAmi = id => rpc("retirer_ami", { p_joueur: id });

export const mesCercles = () => rpc("mes_cercles");                                  // → { cercles, invitations }
export const voirCercle = id => rpc("voir_cercle", { p_id: id });
export const creerCercle = (nom, blason) => rpc("creer_cercle", { p_nom: nom, p_blason: blason });
export const modifierCercle = (id, nom, blason) => rpc("modifier_cercle", { p_id: id, p_nom: nom, p_blason: blason });
export const inviterCercle = (id, joueur) => rpc("inviter_cercle", { p_id: id, p_joueur: joueur });
export const repondreCercle = (id, accepte) => rpc("repondre_cercle", { p_id: id, p_accepte: accepte });
export const rejoindreCercle = code => rpc("rejoindre_cercle", { p_code: code });   // → { id, nom }
export const quitterCercle = id => rpc("quitter_cercle", { p_id: id });
export const exclureCercle = (id, joueur) => rpc("exclure_cercle", { p_id: id, p_joueur: joueur });
export const nommerResponsable = (id, joueur) => rpc("nommer_responsable", { p_id: id, p_joueur: joueur });
export const nouveauLienCercle = id => rpc("nouveau_lien_cercle", { p_id: id });
export const supprimerCercle = id => rpc("supprimer_cercle", { p_id: id });

// Tournois (supabase/etape-5-tournois.sql).
export const mesTournois = () => rpc("mes_tournois");
export const tournoisCercle = id => rpc("tournois_cercle", { p_cercle: id });
export const voirTournoi = id => rpc("voir_tournoi", { p_id: id });
export const creerTournoi = (nom, cercle, points, sets, duree) =>
  rpc("creer_tournoi", { p_nom: nom, p_cercle: cercle, p_points: points, p_sets: sets, p_duree: duree });   // → { id, code }
export const inscrireTournoi = id => rpc("inscrire_tournoi", { p_id: id });
export const rejoindreTournoi = code => rpc("rejoindre_tournoi", { p_code: code });                         // → { id, nom }
export const desinscrireTournoi = id => rpc("desinscrire_tournoi", { p_id: id });
export const lancerTournoi = id => rpc("lancer_tournoi", { p_id: id });
export const annulerTournoi = id => rpc("annuler_tournoi", { p_id: id });
export const jouerMatchTournoi = id => rpc("jouer_match_tournoi", { p_match: id });                        // → le duel
