// Échanges avec le serveur pour le classement, les amis et les cercles
// (fonctions de supabase/etape-4-classement.sql).
import { clientSupabase as client, verifier, essayer } from "./compte.js";

const rpc = (nom, args = {}) => essayer(async () => verifier(await client().rpc(nom, args)));

// Niveau officiel d'un ou plusieurs joueurs : Map id → { points, joues, gagnes, meilleur }.
export const classements = ids => essayer(async () => new Map(ids.length
  ? verifier(await client().from("classements").select("joueur,points,joues,gagnes,meilleur,division").in("joueur", ids)).map(c => [c.joueur, c])
  : []));

export const mesAmis = () => rpc("mes_amis");
export const demanderAmi = id => rpc("demander_ami", { p_joueur: id });            // → "envoyee" ou "amis"
export const repondreAmi = (id, accepte) => rpc("repondre_ami", { p_joueur: id, p_accepte: accepte });
export const retirerAmi = id => rpc("retirer_ami", { p_joueur: id });

// Le dossier d'un joueur (supabase/etape-32-dossier.sql) : les coups de ses 50 derniers matchs en ligne, vus de son côté.
export const dossierJoueur = id => rpc("dossier_joueur", { p_joueur: id });

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
// Championnat du cercle (supabase/etape-35-championnat.sql) : p_jours = 3, 7 ou 14 ; enjeu facultatif.
export const creerChampionnat = (nom, cercle, points, sets, jours, allerRetour, enjeu = null) =>
  rpc("creer_championnat", { p_nom: nom, p_cercle: cercle, p_points: points, p_sets: sets, p_jours: jours, p_aller_retour: allerRetour, p_enjeu: enjeu });   // → { id, code }
export const effacerEnjeuTournoi = id => rpc("effacer_enjeu_tournoi", { p_id: id });

// Sit & Go publics (supabase/etape-6-sit-and-go.sql).
export const sallesSng = () => rpc("salles_sit_and_go");                         // → { salles: [{ taille, inscrits }], mien }
export const rejoindreSng = (taille, mise = 0) => rpc("rejoindre_sit_and_go", { p_taille: taille, p_mise: mise });
export const presenceSng = () => rpc("presence_sit_and_go");                    // → mon Sit & Go, ou null
export const quitterSng = () => rpc("quitter_sit_and_go");

// Partie rapide (supabase/etape-7-partie-rapide.sql)
export const chercherPartie = (format, mise = 0) => rpc("chercher_partie", { p_format: format, p_mise: mise });   // → { duel } ou { attente, depuis, en_attente, maintenant }
export const quitterPartie = () => rpc("quitter_partie");
export const fileRapide = () => rpc("file_partie_rapide");                            // → { officiel, eclair } : joueurs en attente

// Signaler un joueur (supabase/etape-10-moderation.sql) : motif « pseudo », « avatar » ou « comportement ».
export const signalerJoueur = (id, motif, detail) => rpc("signaler_joueur", { p_joueur: id, p_motif: motif, p_detail: detail || null });   // → "envoye" ou "deja"

// Freeroll de 20 h, défis du jour, classement du mois (supabase/etape-15-freeroll.sql).
export const freeroll = () => rpc("freeroll_du_jour");
export const inscrireFreeroll = () => rpc("inscrire_freeroll");
export const desinscrireFreeroll = () => rpc("desinscrire_freeroll");
export const defisDuJour = () => rpc("defis_du_jour");
export const validerDefi = id => rpc("valider_defi", { p_defi: id });
export const classementMois = () => rpc("classement_mois");
// Le classement d'une division (0 Bronze … 4 Diamant), avec ma place (supabase/etape-31-divisions.sql).
export const classementDivision = d => rpc("classement_division", { p_division: d });

// Les tournois programmés (supabase/etape-18-tournois-programmes.sql) : { maintenant, tournois, tenant }.
export const programmes = () => rpc("tournois_programmes");
export const inscrireProgramme = cle => rpc("inscrire_programme", { p_cle: cle });
export const desinscrireProgramme = cle => rpc("desinscrire_programme", { p_cle: cle });

// La boutique (supabase/etape-17-boutique.sql) : { achats, vitrine, solde } ; acheter → la même chose, avec l'article acheté.
export const boutique = () => rpc("boutique");
export const acheter = id => rpc("acheter", { p_article: id });
