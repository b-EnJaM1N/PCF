// Vérifications de cohérence du projet (fichiers hors ligne, script des annonces, secrets).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { scriptMarkdown } from "../outils/generer-script.js";

const APP = new URL("../app/", import.meta.url).pathname;
const tous = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? tous(p) : [p]; });

test("le service worker garde tous les fichiers de l'application", () => {
  const sw = readFileSync(join(APP, "sw.js"), "utf8");
  const liste = [...sw.matchAll(/^\s*"([^"]+)",$/gm)].map(m => m[1]);
  for (const f of liste) if (f !== "./") assert.ok(existsSync(join(APP, f)), `fichier absent : ${f}`);
  const aGarder = tous(APP).map(p => relative(APP, p)).filter(f => /\.(js|css|html|woff2)$/.test(f) && f !== "sw.js");
  for (const f of aGarder) assert.ok(liste.includes(f), `à ajouter dans sw.js : ${f}`);
});

test("docs/script-des-annonces.md est à jour (sinon : npm run script-voix)", () => {
  const doc = readFileSync(new URL("../docs/script-des-annonces.md", import.meta.url), "utf8");
  assert.equal(doc, scriptMarkdown());
});

test("aucune clé secrète dans le code", () => {
  const motifs = [/service_role/i, /sb_secret_[A-Za-z0-9]{8,}/, /sk_live_/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /eyJhbGciOi[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\./];
  for (const p of tous(APP).filter(f => /\.(js|html|json|webmanifest)$/.test(f))) {
    const s = readFileSync(p, "utf8");
    for (const m of motifs) assert.ok(!m.test(s), `${relative(APP, p)} contient peut-être un secret (${m})`);
  }
});

test("la clé Supabase du code est bien la clé publique", async () => {
  const { SUPABASE_URL, SUPABASE_CLE_PUBLIQUE } = await import("../app/js/config.js");
  assert.match(SUPABASE_URL, /^https:\/\/[a-z0-9]+\.supabase\.co$/);
  assert.match(SUPABASE_CLE_PUBLIQUE, /^sb_publishable_/);
});
