// Génère les bruitages du court avec ElevenLabs Sound Effects (lancé par le robot GitHub « Voix », choix « sons »).
// Usage : ELEVENLABS_API_KEY=… node outils/generer-sons.js [--ids raquette_01,public_point_01] [--refaire]
// Les sons déjà présents dans app/audio/ ne sont pas refaits (sauf --refaire avec --ids). La clé vient de l'environnement.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const arg = nom => { const i = process.argv.indexOf(`--${nom}`); return i < 0 ? "" : (process.argv[i + 1] ?? ""); };
export const SONS = JSON.parse(readFileSync(new URL("sons.json", import.meta.url), "utf8")).sons;
const dossier = new URL("../app/audio/", import.meta.url);

export function sonsAFaire({ ids = null, refaire = false, existe = id => existsSync(new URL(`${id}.mp3`, dossier)) } = {}) {
  return Object.entries(SONS).filter(([id]) => (!ids || ids.includes(id)) && ((refaire && ids) || !existe(id))).map(([id, s]) => ({ id, ...s }));
}

async function generer(s, cle) {
  const corps = { text: s.texte, duration_seconds: s.duree, prompt_influence: 0.5, ...(s.boucle ? { loop: true } : {}) };
  const reponse = await fetch("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128", {
    method: "POST", headers: { "xi-api-key": cle, "content-type": "application/json", accept: "audio/mpeg" }, body: JSON.stringify(corps),
  });
  if (!reponse.ok) throw new Error(`${s.id} : erreur ${reponse.status} ${(await reponse.text()).slice(0, 300)}`);
  writeFileSync(new URL(`${s.id}.mp3`, dossier), Buffer.from(await reponse.arrayBuffer()));
}

async function principal() {
  const cle = process.env.ELEVENLABS_API_KEY;
  if (!cle) { console.error("Il manque la clé ELEVENLABS_API_KEY (secret GitHub)."); process.exit(1); }
  const ids = arg("ids") ? arg("ids").split(",").map(x => x.trim()).filter(Boolean) : null;
  const liste = sonsAFaire({ ids, refaire: process.argv.includes("--refaire") });
  console.log(`${liste.length} son(s) à générer, ${liste.reduce((n, s) => n + s.duree, 0)} secondes en tout.`);
  let faits = 0;
  for (const s of liste) {
    try { await generer(s, cle); faits++; console.log(`✅ ${s.id} (${s.duree} s) : ${s.texte}`); }
    catch (e) { console.error(`❌ ${e.message}`); if (/401|402|quota|credits/i.test(e.message)) break; }
  }
  console.log(`${faits} son(s) créé(s) sur ${liste.length}.`);
  if (faits < liste.length) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) principal();
