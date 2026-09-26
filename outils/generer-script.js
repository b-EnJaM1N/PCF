// Génère docs/script-des-annonces.md à partir de app/js/voix/script.js.
// Lancer avec : npm run script-voix
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CATALOGUE } from "../app/js/voix/script.js";
import { FICHIERS_AMBIANCE } from "../app/js/ambiance.js";

export function scriptMarkdown() {
  const roles = { arbitre: "Arbitre — grave et sobre", commentateur: "Commentateur — vif et décalé" };
  let md = `# Script des annonces et commentaires

Ce fichier est généré automatiquement à partir de \`app/js/voix/script.js\`
(commande \`npm run script-voix\`). Ne pas le modifier à la main.

**Pour enregistrer une réplique** : crée un fichier MP3 portant exactement le
nom indiqué, et dépose-le dans \`app/audio/\`. Exemple :
\`commentateur_craquage_02.mp3\`. Tant qu'un fichier manque, la réplique est
seulement affichée par écrit (voix de synthèse activable dans les Options).

Nom d'un fichier = qui parle _ situation _ numéro de version.
L'arbitre ne prononce jamais de pseudo : il nomme les joueurs par leur côté
(jaune = le joueur, rouge = l'adversaire). Les scores rares au-delà de 20–18
restent lus par la voix de synthèse.

`;
  for (const role of Object.keys(roles)) {
    const lignes = [...CATALOGUE.values()].filter(r => r.role === role);
    md += `## ${roles[role]} (${lignes.length} répliques)\n\n| Fichier | Texte |\n|---|---|\n`;
    for (const r of lignes) md += `| \`${r.id}.mp3\` | ${r.texte} |\n`;
    md += "\n";
  }
  const sons = { raquette: "Coup de raquette, à chaque signe joué", point: "Applaudissements courts, après chaque point",
    clameur: "Clameur et applaudissements nourris (balle sauvée, remontée…)", set: "Applaudissements de fin de set", ovation: "Ovation de fin de match" };
  md += `## Sons du court (${Object.keys(sons).length} sons)\n\nFabriqués par le code en attendant. Un vrai enregistrement portant ce nom les remplace.\n\n| Fichier | Son |\n|---|---|\n`;
  for (const [k, id] of Object.entries(FICHIERS_AMBIANCE)) md += `| \`${id}.mp3\` | ${sons[k]} |\n`;
  return md;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(new URL("../docs/script-des-annonces.md", import.meta.url), scriptMarkdown());
  console.log(`docs/script-des-annonces.md : ${CATALOGUE.size} répliques`);
}
