// Le robot qui joue de vrais matchs dans un navigateur (5 novembre, accord du porteur du projet, après « chaud is not defined »
// en plein match) : il ouvre l'appli comme un nouveau joueur, joue le premier match contre Bambi, puis un match d'entraînement
// en un set de 11 points, en touchant les signes au hasard. Il échoue à la moindre erreur dans la page (le bandeau rouge
// « Oups, un problème »), ou si un match ne se termine pas. Lancé avant chaque mise en ligne (npm run test:navigateur).
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright";

const RACINE = new URL("../../app/", import.meta.url).pathname;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".mp3": "audio/mpeg",
  ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json" };
const serveur = createServer(async (req, res) => {
  const chemin = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  try {
    const fichier = chemin.endsWith("/") ? chemin + "index.html" : chemin;
    const corps = await readFile(join(RACINE, fichier));
    res.writeHead(200, { "content-type": TYPES[extname(fichier)] || "application/octet-stream", "content-length": corps.length }); res.end(corps);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(ok => serveur.listen(0, ok));
const adresse = `http://localhost:${serveur.address().port}/`;

const navigateur = await chromium.launch();
const page = await navigateur.newPage({ viewport: { width: 400, height: 860 }, reducedMotion: "reduce" });
const erreurs = [];
page.on("pageerror", e => erreurs.push(`erreur dans la page : ${e.message}`));
// (pour information : ce que pèsent les sons téléchargés pendant le premier match d'un nouveau joueur)
let sons = 0, sonsPremierMatch = null;
page.on("response", async r => { if (r.url().endsWith(".mp3")) sons += Number(r.headers()["content-length"] || 0); });
// (le serveur en ligne n'est pas joignable ici : on coupe ces appels, sans que ce soit une erreur de l'appli)
await page.route(url => !url.href.startsWith(adresse), route => route.abort());

async function jouerJusquALaFin(nom, limite) {
  const fin = Date.now() + limite;
  let coups = 0;
  while (Date.now() < fin) {
    if (await page.locator("#end").isVisible()) { console.log(`  ok : ${nom} terminé (${coups} coups)`); return; }
    if (erreurs.length) return;
    // (une fenêtre par-dessus le jeu : présentation du match, fin de set, poignée de main… on avance)
    for (const id of ["#foGo", "#iGo", "#pmChoix button"]) {
      const b = page.locator(id).first();
      if (await b.isVisible().catch(() => false)) await b.click({ timeout: 1000 }).catch(() => {});
    }
    const signes = page.locator("button[data-m]:not([disabled])");
    if (await signes.count()) {
      await signes.nth(Math.floor(Math.random() * await signes.count())).click({ timeout: 1000 }).catch(() => {});
      coups++;
    }
    await page.waitForTimeout(250);
  }
  erreurs.push(`${nom} : pas terminé au bout de ${limite / 1000} secondes`);
}

try {
  await page.goto(adresse);
  await page.locator("#premierMatch").click({ timeout: 15000 });
  await jouerJusquALaFin("premier match contre Bambi", 240000);
  sonsPremierMatch = sons;
  if (!erreurs.length) {
    // Un match d'entraînement en un set de 11 points (assez long pour passer par toutes les ambiances du match).
    await page.goto(adresse + "#");
    await page.evaluate(() => { localStorage.setItem("pcf:menuComplet", "true"); });
    await page.reload();
    await page.locator('[data-aller="viewMatch"]').first().click({ timeout: 15000 });
    await page.locator('#segLen button[data-v="11"]').click();
    await page.locator('#segWin button[data-v="1"]').click();
    await page.locator("#startBtn").click();
    await jouerJusquALaFin("match d'entraînement en 11 points", 360000);
  }
  const bandeau = await page.locator("#erreur").textContent().catch(() => null);
  if (bandeau) erreurs.push(`bandeau rouge : ${bandeau}`);
} catch (e) {
  erreurs.push(`le robot n'a pas pu jouer : ${e.message.split("\n")[0]}`);
} finally {
  await navigateur.close(); serveur.close();
}
if (erreurs.length) { console.error("ÉCHEC :\n" + erreurs.map(e => "  " + e).join("\n")); process.exit(1); }
console.log(`  (sons téléchargés : ${(sonsPremierMatch / 1e6).toFixed(1)} Mo au premier match, ${(sons / 1e6).toFixed(1)} Mo en tout)`);
console.log("Les matchs dans le navigateur se sont joués sans erreur.");
