// Écrit app/audio/index.json : la liste des répliques enregistrées (fichiers .mp3),
// et app/audio/ecoute.json : leur texte, leur personnage et leur ton, pour la page d'écoute (app/ecoute.html).
// Lancé automatiquement à chaque mise en ligne.
import { readdirSync, writeFileSync } from "node:fs";
import { CATALOGUE } from "../app/js/voix/script.js";
import { tonDe } from "./generer-voix.js";
import { ditAVoixHaute } from "../app/js/voix/lecteur.js";
const dossier = new URL("../app/audio/", import.meta.url);
const ids = readdirSync(dossier).filter(f => f.endsWith(".mp3")).map(f => f.slice(0, -4)).sort();
writeFileSync(new URL("index.json", dossier), JSON.stringify(ids) + "\n");
// Seulement ce qui est dit à voix haute, dans l'ordre du catalogue (les répliques d'une même situation se suivent).
const presents = new Set(ids);
const ecoute = [...CATALOGUE.values()].filter(r => presents.has(r.id) && ditAVoixHaute(r)).map(r => ({ id: r.id, role: r.role, texte: r.texte, ton: tonDe(r) }));
writeFileSync(new URL("ecoute.json", dossier), JSON.stringify(ecoute) + "\n");
console.log(`${ids.length} fichier(s) audio, ${ecoute.length} réplique(s) sur la page d'écoute`);
