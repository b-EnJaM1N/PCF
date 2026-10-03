// Écrit app/audio/index.json : la liste des répliques enregistrées (fichiers .mp3),
// et app/audio/ecoute.json : leur texte, leur personnage et leur ton, pour la page d'écoute (app/ecoute.html).
// Lancé automatiquement à chaque mise en ligne.
import { readdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { CATALOGUE } from "../app/js/voix/script.js";
import { tonDe } from "./generer-voix.js";
import { ditAVoixHaute } from "../app/js/voix/lecteur.js";
const dossier = new URL("../app/audio/", import.meta.url);
const ids = readdirSync(dossier).filter(f => f.endsWith(".mp3")).map(f => f.slice(0, -4)).sort();
writeFileSync(new URL("index.json", dossier), JSON.stringify(ids) + "\n");
// Seulement ce qui est dit à voix haute, dans l'ordre du catalogue (les répliques d'une même situation se suivent).
const presents = new Set(ids);
// Chaque réplique garde son numéro pour toujours (app/audio/numeros.json) : une réplique retirée laisse un trou,
// une nouvelle prend le numéro suivant. Les remarques du porteur du projet (« n° 57 ») restent ainsi valables.
const fichierNumeros = new URL("numeros.json", dossier);
const numeros = existsSync(fichierNumeros) ? JSON.parse(readFileSync(fichierNumeros, "utf8")) : {};
let dernier = Math.max(0, ...Object.values(numeros));
const ecoute = [...CATALOGUE.values()].filter(r => presents.has(r.id) && ditAVoixHaute(r))
  .map(r => ({ n: (numeros[r.id] ??= ++dernier), id: r.id, role: r.role, texte: r.texte, ton: tonDe(r) }));
writeFileSync(fichierNumeros, JSON.stringify(numeros) + "\n");
writeFileSync(new URL("ecoute.json", dossier), JSON.stringify(ecoute) + "\n");
console.log(`${ids.length} fichier(s) audio, ${ecoute.length} réplique(s) sur la page d'écoute`);
