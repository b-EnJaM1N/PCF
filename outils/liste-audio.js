// Écrit app/audio/index.json : la liste des répliques enregistrées (fichiers .mp3).
// Lancé automatiquement à chaque mise en ligne.
import { readdirSync, writeFileSync } from "node:fs";
const dossier = new URL("../app/audio/", import.meta.url);
const ids = readdirSync(dossier).filter(f => f.endsWith(".mp3")).map(f => f.slice(0, -4)).sort();
writeFileSync(new URL("index.json", dossier), JSON.stringify(ids) + "\n");
console.log(`${ids.length} fichier(s) audio`);
