// Compte joueur en ligne (Supabase) : connexion par e-mail (lien « Sign in » ou code),
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
    // Le lien reçu par e-mail ramène sur l'application avec la session dans l'adresse (#access_token=…) :
    // flowType « implicit » fonctionne même si le lien s'ouvre dans un autre navigateur que la demande.
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "implicit", storageKey: "pcf:session" },
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

// Au retour du lien de l'e-mail : l'adresse contient la session, ou une erreur (lien expiré…).
export function retourDeLien() {
  if (typeof location === "undefined") return null;
  const h = new URLSearchParams(location.hash.slice(1));
  if (h.get("access_token")) return { ok: true };
  if (h.get("error") || h.get("error_code")) {
    const expire = /expired|invalid/i.test(`${h.get("error_code")} ${h.get("error_description")}`);
    return { ok: false, message: expire ? "Ce lien a expiré ou a déjà servi. Redemande un e-mail de connexion." : `Connexion impossible : ${h.get("error_description") || h.get("error")}` };
  }
  return null;
}
// Adresse où le lien de l'e-mail doit ramener (la version de test ou la version officielle).
export const adresseRetour = () => (typeof location === "undefined" ? undefined : location.origin + location.pathname);

export async function sessionActuelle() {
  try { const { data } = await sb().auth.getSession(); return data.session; } catch { return null; }
}
export function surChangement(rappel) {
  try { sb().auth.onAuthStateChange((_evt, session) => rappel(session)); } catch { /* hors ligne */ }
}

export const envoyerCode = email => essayer(async () =>
  verifier(await sb().auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: adresseRetour() } })));

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
