// Génère les fichiers audio des répliques avec ElevenLabs (lancé par le robot GitHub « Voix », voir .github/workflows/voix.yml).
// Usage : ELEVENLABS_API_KEY=… node outils/generer-voix.js [--roles commentateur,commentatrice,arbitre] [--limite 10] [--ids id1,id2] [--refaire]
// - les fichiers déjà présents dans app/audio/ ne sont pas refaits (sauf --refaire avec --ids) : on peut relancer sans repayer ;
// - --limite : seulement les N premières répliques à faire (pour un essai) ;
// - la clé n'est jamais écrite dans le code : elle vient de l'environnement (secret GitHub).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { CATALOGUE } from "../app/js/voix/script.js";

const arg = (nom, defaut) => { const i = process.argv.indexOf(`--${nom}`); return i < 0 ? defaut : (process.argv[i + 1] ?? ""); };
const config = JSON.parse(readFileSync(new URL("voix.json", import.meta.url), "utf8"));
const dossier = new URL("../app/audio/", import.meta.url);

// Le texte envoyé à la voix : l'indication de jeu du personnage, puis la réplique (ou son texte spécial).
export function texteVoix(r, cfg = config) {
  const special = cfg.textes?.[r.id];
  if (special) return special;
  const ind = cfg.roles[r.role]?.indication;
  return ind ? `${ind} ${r.texte}` : r.texte;
}

// Les répliques à générer, dans l'ordre du catalogue.
export function aFaire({ roles, ids, refaire = false, limite = Infinity, existe = id => existsSync(new URL(`${id}.mp3`, dossier)) } = {}) {
  const liste = [...CATALOGUE.values()].filter(r => (ids ? ids.includes(r.id) : roles.includes(r.role)) && config.roles[r.role]);
  return liste.filter(r => (refaire && ids) || !existe(r.id)).slice(0, limite);
}

async function generer(r, cle) {
  const role = config.roles[r.role];
  const reponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${role.voice_id}?output_format=${config.format}`, {
    method: "POST",
    headers: { "xi-api-key": cle, "content-type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify({ text: texteVoix(r), model_id: config.modele, language_code: "fr", voice_settings: { stability: role.stability } }),
  });
  if (!reponse.ok) throw new Error(`${r.id} : erreur ${reponse.status} ${(await reponse.text()).slice(0, 300)}`);
  writeFileSync(new URL(`${r.id}.mp3`, dossier), Buffer.from(await reponse.arrayBuffer()));
}

async function principal() {
  const cle = process.env.ELEVENLABS_API_KEY;
  if (!cle) { console.error("Il manque la clé ELEVENLABS_API_KEY (secret GitHub)."); process.exit(1); }
  const ids = arg("ids", "") ? arg("ids").split(",").map(x => x.trim()).filter(Boolean) : null;
  const roles = arg("roles", "commentateur,commentatrice,arbitre").split(",").map(x => x.trim());
  const limite = Number(arg("limite", "0")) || Infinity;
  const liste = aFaire({ roles, ids, refaire: process.argv.includes("--refaire"), limite });
  const caracteres = liste.reduce((n, r) => n + texteVoix(r).length, 0);
  console.log(`${liste.length} réplique(s) à générer, environ ${caracteres} caractères.`);
  let faits = 0;
  for (const r of liste) {
    try { await generer(r, cle); faits++; console.log(`✅ ${r.id} : ${texteVoix(r)}`); }
    catch (e) {
      console.error(`❌ ${e.message}`);
      if (/401|402|quota|credits/i.test(e.message)) break;   // clé refusée ou crédits épuisés : inutile de continuer
    }
  }
  console.log(`${faits} fichier(s) créé(s) sur ${liste.length}.`);
  if (faits < liste.length) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) principal();
