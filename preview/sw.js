// Service worker : permet d'ouvrir PCF sans réseau.
// Stratégie « réseau d'abord » : en ligne, on prend toujours la dernière
// version publiée ; hors ligne, on sert la copie gardée sur le téléphone.
const CACHE = "pcf-" + new URL(self.registration.scope).pathname;

// Fichiers gardés dès la première visite (un test vérifie que la liste est complète).
const FICHIERS = [
  "./",
  "index.html",
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
  "js/sons.js",
  "js/stockage.js",
  "js/version.js",
  "js/voix/script.js",
  "js/voix/lecteur.js",
  "fonts/barlow-latin-400-normal.woff2",
  "fonts/barlow-latin-400-italic.woff2",
  "fonts/barlow-latin-500-normal.woff2",
  "fonts/barlow-latin-600-normal.woff2",
  "fonts/barlow-condensed-latin-500-normal.woff2",
  "fonts/barlow-condensed-latin-700-normal.woff2",
  "fonts/barlow-condensed-latin-800-normal.woff2",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/apple-touch-icon.png",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS.map(f => new Request(f, { cache: "no-cache" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => { e.waitUntil(self.clients.claim()); });

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
