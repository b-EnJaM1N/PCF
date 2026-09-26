// Compte joueur en ligne (Supabase) : connexion par code reçu par e-mail,
// lecture et sauvegarde de la fiche, déconnexion, suppression du compte.
// La bibliothèque Supabase est chargée par index.html (vendor/supabase.js).
import { SUPABASE_URL, SUPABASE_CLE_PUBLIQUE } from "./config.js";
import { ligneDepuisProfil } from "./synchro.js";

let client = null;
function sb() {
  if (client) return client;
  const lib = typeof window !== "undefined" ? window.supabase : null;
  if (!lib) throw new Error("Connexion au serveur indisponible (hors ligne ?)");
  client = lib.createClient(SUPABASE_URL, SUPABASE_CLE_PUBLIQUE, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: "pcf:session" },
  });
  return client;
}

// Messages d'erreur compréhensibles.
function message(e) {
  const t = String(e?.message || e || "");
  if (/rate limit|too many|security purposes/i.test(t)) return "Trop de demandes d'affilée. Attends quelques minutes avant de redemander un code.";
  if (/expired|invalid.*(otp|token)|token.*(expired|invalid)/i.test(t)) return "Code incorrect ou expiré. Vérifie le dernier e-mail reçu, ou redemande un code.";
  if (/invalid.*email|email.*invalid|unable to validate email/i.test(t)) return "Cette adresse e-mail ne semble pas valide.";
  if (/pseudo_valide|check constraint/i.test(t)) return "Ce pseudo n'est pas accepté : 2 à 16 caractères, sans « # ».";
  if (/fetch|network|hors ligne|Failed to/i.test(t)) return "Pas de connexion au serveur. Vérifie ton réseau et réessaie.";
  return t || "Une erreur inattendue est survenue.";
}
const verifier = ({ data, error }) => { if (error) throw new Error(message(error)); return data; };
async function essayer(f) { try { return await f(); } catch (e) { throw new Error(message(e)); } }

export async function sessionActuelle() {
  try { const { data } = await sb().auth.getSession(); return data.session; } catch { return null; }
}
export function surChangement(rappel) {
  try { sb().auth.onAuthStateChange((_evt, session) => rappel(session)); } catch { /* hors ligne */ }
}

export const envoyerCode = email => essayer(async () =>
  verifier(await sb().auth.signInWithOtp({ email, options: { shouldCreateUser: true } })));

export const validerCode = (email, code) => essayer(async () =>
  verifier(await sb().auth.verifyOtp({ email, token: code, type: "email" })).session);

export const deconnecter = () => essayer(async () => verifier(await sb().auth.signOut()));

// La fiche en ligne du joueur connecté, ou null s'il n'en a pas encore.
export const lireFiche = uid => essayer(async () =>
  verifier(await sb().from("profils").select("*").eq("id", uid).maybeSingle()));

// Crée ou met à jour la fiche en ligne. Renvoie la ligne enregistrée (avec le numéro).
export const enregistrerFiche = (P, uid) => essayer(async () => {
  const ligne = ligneDepuisProfil(P, uid);
  const maj = verifier(await sb().from("profils").update(ligne).eq("id", uid).select().maybeSingle());
  return maj || verifier(await sb().from("profils").insert(ligne).select().single());
});

export const supprimerCompte = () => essayer(async () => {
  verifier(await sb().rpc("supprimer_mon_compte"));
  await sb().auth.signOut({ scope: "local" }).catch(() => {});
});
