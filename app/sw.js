// Service worker : permet d'ouvrir PCF sans réseau.
// Stratégie « réseau d'abord » : en ligne, on prend toujours la dernière
// version publiée ; hors ligne, on sert la copie gardée sur le téléphone.
const CACHE = "pcf-" + new URL(self.registration.scope).pathname;

// Fichiers gardés dès la première visite (un test vérifie que la liste est complète).
const FICHIERS = [
  "./",
  "index.html",
  "mentions.html",
  "suppression-compte.html",
  "ecoute.html",
  "manifest.webmanifest",
  "css/style.css",
  "js/app.js",
  "js/regles.js",
  "js/bots.js",
  "js/analyse.js",
  "js/annonces.js",
  "js/stats-match.js",
  "js/profil.js",
  "js/tournoi.js",
  "js/avatar.js",
  "js/ambiance.js",
  "js/presentation.js",
  "js/sons.js",
  "js/stockage.js",
  "js/version.js",
  "js/voix/script.js",
  "js/voix/lecteur.js",
  "js/voix/repliques.js",
  "js/surnoms.js",
  "js/marque.js",
  "js/une.js",
  "js/une-logique.js",
  "js/carte.js",
  "js/carte-logique.js",
  "js/config.js",
  "js/compte.js",
  "js/synchro.js",
  "js/ecran-compte.js",
  "js/duel-logique.js",
  "js/duel-serveur.js",
  "js/ecran-duel.js",
  "js/social-logique.js",
  "js/social-serveur.js",
  "js/ecran-cercles.js",
  "js/ecran-tournois.js",
  "js/ecran-sng.js",
  "js/ecran-rapide.js",
  "js/rapide-logique.js",
  "js/poignee.js",
  "js/celebrations.js",
  "js/jetons-logique.js",
  "js/ecran-jetons.js",
  "js/defis-logique.js",
  "js/ecran-defis.js",
  "js/ecran-freeroll.js",
  "js/programmes-logique.js",
  "js/ecran-programmes.js",
  "js/catalogue.js",
  "js/decouverte.js",
  "js/match-du-jour.js",
  "js/messages-rapides.js",
  "js/lecture-adversaire.js",
  "js/ecran-boutique.js",
  "js/ecran-signaler.js",
  "js/notifications.js",
  "js/tournoi-logique.js",
  "vendor/supabase.js",
  "fonts/barlow-latin-400-normal.woff2",
  "fonts/barlow-latin-400-italic.woff2",
  "fonts/barlow-latin-500-normal.woff2",
  "fonts/barlow-latin-600-normal.woff2",
  "fonts/barlow-condensed-latin-500-normal.woff2",
  "fonts/barlow-condensed-latin-700-normal.woff2",
  "fonts/barlow-condensed-latin-800-normal.woff2",
  "icons/icon.svg",
  "icons/logo.svg",
  "icons/icon-192.png",
  "icons/apple-touch-icon.png",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS.map(f => new Request(f, { cache: "no-cache" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => { e.waitUntil(self.clients.claim()); });

// Notifications (envoyées par la fonction Supabase « notifier ») : { titre, texte, url, tag }.
self.addEventListener("push", e => {
  let m = {};
  try { m = e.data ? e.data.json() : {}; } catch { m = { texte: e.data ? e.data.text() : "" }; }
  e.waitUntil((async () => {
    // L'appli est ouverte à l'écran : pas de notification sur le téléphone, l'appli se met à jour (défis reçus, match à jouer).
    const fenetres = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const visibles = fenetres.filter(c => c.visibilityState === "visible" && c.url.startsWith(self.registration.scope));
    if (visibles.length) { visibles.forEach(c => c.postMessage({ rafraichir: true })); return; }
    await self.registration.showNotification(m.titre || "HandSlam", {
      body: m.texte || "", icon: "icons/icon-192.png", badge: "icons/icon-192.png",
      tag: m.tag, renotify: !!m.tag, data: { url: m.url || "./" },
    });
  })());
});
// Toucher la notification : on ouvre l'appli (ou on revient dessus) au bon écran.
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL(e.notification.data?.url || "./", self.registration.scope);
  e.waitUntil((async () => {
    const fenetres = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const ouverte = fenetres.find(c => c.url.startsWith(self.registration.scope));
    if (ouverte) { await ouverte.focus(); ouverte.postMessage({ ouvrir: url.searchParams.get("ouvrir") }); return; }
    await self.clients.openWindow(url.href);
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const rep = await fetch(req, { cache: "no-cache" });
      if (rep.status === 200 && rep.type === "basic") cache.put(req, rep.clone());
      return rep;
    } catch (err) {
      const copie = await cache.match(req, { ignoreSearch: true });
      if (copie) return copie;
      if (req.mode === "navigate") return (await cache.match("index.html")) || Response.error();
      throw err;
    }
  })());
});
