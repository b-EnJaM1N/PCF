// Les notifications sur le téléphone (« Bob te défie ! »), même quand l'appli est fermée.
// Le téléphone s'abonne auprès de son navigateur, avec la clé publique donnée par la fonction « notifier »
// (supabase/functions/notifier), puis confie son abonnement à Supabase (supabase/etape-11-notifications.sql).
import { clientSupabase, verifier, essayer } from "./compte.js";

// La clé publique (texte « base64 URL ») en octets, comme le demande le navigateur.
export function octetsDepuisBase64Url(texte) {
  const b64 = texte.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (texte.length % 4)) % 4);
  const brut = atob(b64), octets = new Uint8Array(brut.length);
  for (let i = 0; i < brut.length; i++) octets[i] = brut.charCodeAt(i);
  return octets;
}

export const notificationsPossibles = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

// « indisponible », « refuse », « actif » ou « inactif »
export async function etatNotifications() {
  if (!notificationsPossibles()) return "indisponible";
  if (Notification.permission === "denied") return "refuse";
  const reg = await navigator.serviceWorker.getRegistration();
  const abo = reg ? await reg.pushManager.getSubscription() : null;
  return abo && Notification.permission === "granted" ? "actif" : "inactif";
}

const enregistrer = abo => {
  const j = abo.toJSON();
  return essayer(async () => verifier(await clientSupabase().rpc("enregistrer_abonnement_push", { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth })));
};

// Demande la permission (il faut un geste de l'utilisateur), s'abonne, et prévient Supabase.
export async function activerNotifications() {
  if (!notificationsPossibles()) return "indisponible";
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "refuse" : "inactif";
  const { data, error } = await clientSupabase().functions.invoke("notifier", { body: { action: "cle" } });
  if (error || !data?.cle) throw new Error("Le service de notifications ne répond pas. Réessaie plus tard.");
  const reg = await navigator.serviceWorker.ready;
  let abo = await reg.pushManager.getSubscription();
  if (!abo) abo = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: octetsDepuisBase64Url(data.cle) });
  await enregistrer(abo);
  return "actif";
}

export async function desactiverNotifications() {
  const reg = await navigator.serviceWorker.getRegistration();
  const abo = reg ? await reg.pushManager.getSubscription() : null;
  if (!abo) return "inactif";
  await essayer(async () => verifier(await clientSupabase().rpc("retirer_abonnement_push", { p_endpoint: abo.endpoint }))).catch(() => {});
  await abo.unsubscribe();
  return "inactif";
}

// À chaque connexion : si ce téléphone est abonné, on le rattache au compte connecté.
export async function rattacherAbonnement() {
  if (!notificationsPossibles() || Notification.permission !== "granted") return;
  const reg = await navigator.serviceWorker.getRegistration();
  const abo = reg ? await reg.pushManager.getSubscription() : null;
  if (abo) await enregistrer(abo).catch(() => {});
}
