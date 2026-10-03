import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { texteVoix, aFaire } from "../outils/generer-voix.js";
import { CATALOGUE } from "../app/js/voix/script.js";

const config = JSON.parse(readFileSync(new URL("../outils/voix.json", import.meta.url), "utf8"));

test("les voix : un identifiant ElevenLabs pour chaque rôle, et aucune clé secrète dans le projet", () => {
  for (const [role, r] of Object.entries(config.roles)) assert.match(r.voice_id, /^[A-Za-z0-9]{20}$/, role);
  assert.ok(!/sk_[A-Za-z0-9]{20,}/.test(readFileSync(new URL("../outils/voix.json", import.meta.url), "utf8")), "pas de clé API dans voix.json");
});

test("le texte pour la voix : l'indication de jeu du personnage, puis la réplique", () => {
  const monique = [...CATALOGUE.values()].find(r => r.texte === "Muscle ton jeu, Robert. Muscle ton jeu.");
  assert.equal(texteVoix(monique), "[sarcastic] Muscle ton jeu, Robert. Muscle ton jeu.", "Monique cassante sur une série de points perdus");
  assert.match(texteVoix(CATALOGUE.get("commentatrice_dialogue_avant_match_01")), /^\[deadpan\] /, "sinon, son ton par défaut");
  assert.match(texteVoix(CATALOGUE.get("commentateur_balle_match_convertie_03")), /^\[excited\] \[shouting\] /, "Roland enflammé sur la balle de match");
  assert.match(texteVoix(CATALOGUE.get("commentateur_tension_01")), /^\[nervous\] \[whispers\] /, "Roland fébrile dans la tension");
  assert.match(texteVoix(CATALOGUE.get("commentatrice_craquage_02")), /^\[sarcastic\] /, "Monique cassante quand un joueur craque");
  assert.match(texteVoix(CATALOGUE.get("commentatrice_defaite_02")), /^\[sighs\] \[bored\] /, "Monique blasée sur une défaite");
  assert.ok(!texteVoix(CATALOGUE.get("commentatrice_dialogue_set_decisif_01") ?? CATALOGUE.get("commentatrice_set_decisif_01")).includes("[bored]"), "« set_decisif » n'est pas pris pour « set_ecrasant »");
  const arbitre = CATALOGUE.get("arbitre_set_decisif_01");
  assert.equal(texteVoix(arbitre), "Set décisif.", "l'arbitre, sans indication");
  assert.equal(texteVoix(arbitre, { ...config, textes: { arbitre_set_decisif_01: "Set… décisif." } }), "Set… décisif.", "un texte spécial l'emporte");
});

test("ce qu'il reste à générer : les rôles choisis, sans refaire les fichiers déjà là", () => {
  const roles = ["commentateur", "commentatrice", "arbitre"];
  const tout = aFaire({ roles, existe: () => false });
  assert.ok(tout.length > 350 && tout.every(r => roles.includes(r.role)));
  assert.ok(!tout.some(r => r.id.startsWith("arbitre_balle_de_")), "l'arbitre n'annonce plus les balles de set et de match");
  assert.equal(aFaire({ roles, existe: () => true }).length, 0, "tout est déjà enregistré");
  assert.equal(aFaire({ roles, limite: 10, existe: () => false }).length, 10);
  assert.equal(aFaire({ ids: ["arbitre_set_decisif_01"], refaire: true, existe: () => true }).length, 1, "refaire une réplique précise");
  assert.ok(aFaire({ roles: ["commentatrice"], refaire: true, existe: () => true }).length > 100, "tout refaire pour un rôle");
  assert.equal(aFaire({ ids: ["speaker_bienvenue_01"], existe: () => false }).length, 0, "pas de voix choisie pour le speaker : rien");
});

test("les bruitages : les noms attendus par l'appli, des durées permises, le fond en boucle", async () => {
  const { SONS, sonsAFaire } = await import("../outils/generer-sons.js");
  const { FICHIERS_AMBIANCE: FICHIERS_PUBLIC, FICHIERS_RAQUETTE } = await import("../app/js/ambiance.js");
  const attendus = [...Object.values(FICHIERS_PUBLIC), ...FICHIERS_RAQUETTE].sort();
  assert.deepEqual(Object.keys(SONS).sort(), attendus);
  for (const [id, s] of Object.entries(SONS)) assert.ok(s.texte && s.duree >= 0.5 && s.duree <= 30, id);
  assert.equal(SONS.public_fond_01.boucle, true);
  assert.equal(sonsAFaire({ existe: () => true }).length, 0, "rien à refaire");
  assert.equal(sonsAFaire({ ids: ["raquette_pierre_01"], refaire: true, existe: () => true }).length, 1);
});

test("un coup de raquette enregistré presque muet n'est pas amplifié", async () => {
  const { creteDe } = await import("../app/js/sons.js");
  const { SEUIL_MUET } = await import("../app/js/ambiance.js");
  assert.ok(creteDe([new Float32Array([0, 0.001, -0.002])]) < SEUIL_MUET, "un fichier muet (−54 dB) est écarté");
  assert.ok(creteDe([new Float32Array([0, 0.3, -0.6])]) >= SEUIL_MUET, "un vrai coup est gardé");
});

test("la liste à refaire (robot, choix « liste ») ne contient que des répliques qui existent", () => {
  const ids = readFileSync(new URL("../outils/a-refaire.txt", import.meta.url), "utf8").split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("#"));
  for (const id of ids) assert.ok(CATALOGUE.has(id), id);
  assert.ok(!texteVoix(CATALOGUE.get("commentateur_dialogue_cri_02")).includes("[laughs]"), "Roland n'est plus amusé : excité");
});
