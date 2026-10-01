import { test } from "node:test";
import assert from "node:assert/strict";
import { CRIS, CRI_DEFAUT, criValide, texteCri, libelleCri, criDuBot, celebration, commenterCri, couleursConfettis } from "../app/js/celebrations.js";
import { etatPasser } from "../app/js/presentation.js";
import { BOTS } from "../app/js/bots.js";
import { profilParDefaut, normaliserProfil } from "../app/js/profil.js";
import { ligneDialogue } from "../app/js/voix/script.js";
import { rngFixe } from "./outils.js";

test("les 24 cris validés, dont le poing serré en silence", () => {
  assert.equal(CRIS.filter(c => !c.boutique).length, 24);
  assert.equal(new Set(CRIS.map(c => c.id)).size, CRIS.length);
  assert.equal(texteCri("vamos"), "Vamos !");
  assert.equal(texteCri("silence"), "");
  assert.match(libelleCri("silence"), /silence/);
  assert.equal(criValide("n_importe_quoi"), CRI_DEFAUT);
});

test("la fiche garde le cri choisi, et remet le cri par défaut s'il est inconnu", () => {
  assert.equal(profilParDefaut().cri, CRI_DEFAUT);
  assert.equal(normaliserProfil({ cri: "forza" }).cri, "forza");
  assert.equal(normaliserProfil({ cri: "???" }).cri, CRI_DEFAUT);
  assert.equal(normaliserProfil({}).cri, CRI_DEFAUT, "anciennes fiches");
});

test("chaque bot a son cri ; Miroir copie le mien, Chaos crie au hasard", () => {
  for (const b of BOTS) assert.equal(criValide(criDuBot(b.id, "forza", rngFixe(1))), criDuBot(b.id, "forza", rngFixe(1)), b.id);
  assert.equal(criDuBot("rocky"), "caillou");
  assert.equal(criDuBot("mante"), "silence");
  assert.equal(criDuBot("miroir", "dale"), "dale");
  assert.ok(CRIS.some(c => c.id === criDuBot("chaos", "yes", rngFixe(7))));
});

test("une bulle à la fin d'un set, en grand à la fin du match, plus fort après une balle de match sauvée", () => {
  assert.deepEqual(celebration("yes"), { taille: "bulle", fort: false, texte: "Yes !", silence: false });
  assert.equal(celebration("yes", { finMatch: true }).taille, "grand");
  assert.equal(celebration("yes", { sauvee: true }).fort, true);
  assert.equal(celebration("silence").silence, true);
});

test("les commentateurs réagissent parfois, une fois par match au plus", () => {
  const toujours = () => 0, jamais = () => 0.99;
  assert.equal(commenterCri(false, celebration("yes", { sauvee: true }), toujours), true);
  assert.equal(commenterCri(true, celebration("yes", { sauvee: true }), toujours), false);
  assert.equal(commenterCri(false, celebration("silence", { sauvee: true }), toujours), false);
  assert.equal(commenterCri(false, celebration("yes"), jamais), false);
  const [roland, monique] = ligneDialogue("cri", 0);
  assert.equal(roland.texte, "Ah, il y a de la voix !");
  assert.equal(monique.texte, "On l'avait entendu.");
});

test("les confettis sont aux couleurs du gant", () => {
  const c = couleursConfettis({ gant: "rouge", poignet: "noir" });
  assert.ok(c.includes("#E8574A") && c.includes("#23262B"));
  assert.equal(couleursConfettis().length, 4);
});

test("passer la présentation en duel : il faut les deux joueurs", () => {
  assert.equal(etatPasser([false, false], 0), "aucun");
  assert.equal(etatPasser([true, false], 0), "attente");
  assert.equal(etatPasser([true, false], 1), "adversaire");
  assert.equal(etatPasser([true, true], 1), "go");
  assert.equal(etatPasser(undefined, 0), "aucun");
});
