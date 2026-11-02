// Roland dit les surnoms d'un trait (décision du porteur du projet, 2 novembre). Chaque surnom porté est enregistré une
// seule fois par la fonction « Surnoms » (supabase/functions/surnom/index.ts), dans le stockage public « surnoms », puis
// servi à tous ceux qui le portent. Ici : l'adresse du fichier, la réplique à dire, et savoir s'il est déjà enregistré.
import { SUPABASE_URL } from "./config.js";

// s : un surnom comme le donne surnomDe ({ nom: { id, t }, complement: { id, t }, texte }).
export const cleSurnom = s => (s?.nom?.id && s?.complement?.id ? `${s.nom.id}__${s.complement.id}` : null);
export const adresseSurnom = s => `${SUPABASE_URL}/storage/v1/object/public/surnoms/${cleSurnom(s)}.mp3`;
// La réplique (voix de Roland, rôle « speaker ») ; url : le fichier à lire, hors de app/audio/.
export const repliqueSurnom = s => (cleSurnom(s) ? { id: `surnom:${cleSurnom(s)}`, role: "speaker", texte: `${s.texte} !`, url: adresseSurnom(s) } : null);

// Déjà enregistré ? (une seule question par fichier et par séance, sauf après une demande d'enregistrement)
const connus = new Map();
export function fichierPresent(url) {
  if (!connus.has(url)) connus.set(url, fetch(url, { method: "HEAD" }).then(r => r.ok).catch(() => false));
  return connus.get(url);
}
export const surnomEnregistre = s => (cleSurnom(s) ? fichierPresent(adresseSurnom(s)) : Promise.resolve(false));

// Demande l'enregistrement de mon surnom (joueur connecté seulement ; client : le client Supabase). Sans attendre :
// il sera prêt pour le match suivant.
const demandes = new Set();
export async function demanderSurnom(s, client) {
  const cle = cleSurnom(s);
  if (!cle || demandes.has(cle) || await surnomEnregistre(s)) return;
  demandes.add(cle);
  try {
    const { data } = await client.functions.invoke("Surnoms", { body: { nom: s.nom.id, complement: s.complement.id } });
    if (data?.adresse) connus.set(adresseSurnom(s), Promise.resolve(true));
  } catch { /* pas de réseau, limite du jour : ce sera pour une autre fois */ }
}
