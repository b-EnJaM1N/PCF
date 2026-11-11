import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MESSAGES, LONGUEUR_MAX, messagesPossibles, momentApres, texteMessage, erreurMessageLibre, PREFIXE_LIBRE } from "../app/js/messages-rapides.js";
import { MOTS_INTERDITS } from "../app/js/enjeux.js";

test("chaque message tient dans une bulle et chaque identifiant est unique à son moment", () => {
  for (const [moment, m] of Object.entries(MESSAGES)) {
    const ids = [...(m.annonces || []), ...m.tous, ...m.amis].map(([id]) => id);
    assert.equal(new Set(ids).size, ids.length, moment);
    for (const [id, texte] of [...(m.annonces || []), ...m.tous, ...m.amis]) assert.ok(texte.length <= LONGUEUR_MAX, `${id} : ${texte.length} caractères`);
  }
});

test("les mêmes messages dans l'appli et sur le serveur", () => {
  // (la liste la plus récente : étape 53, qui ajoute les annonces et la pause entre les sets ; les annonces comptent parmi « tous »)
  const sql = readFileSync(new URL("../supabase/etape-53-messages-entre-sets.sql", import.meta.url), "utf8");
  for (const [moment, m] of Object.entries(MESSAGES)) {
    for (const [registre, amis] of [["tous", false], ["amis", true]]) {
      const ligne = sql.match(new RegExp(`p_moment = '${moment}' and ${amis ? "" : "not "}p_amis then array\\[([^\\]]*)\\]`));
      assert.ok(ligne, `${moment} ${registre}`);
      // (les messages retirés de l'appli le 11 novembre restent acceptés par le serveur : on compare sans l'ordre)
      const attendus = (registre === "tous" ? [...(m.annonces || []), ...m.tous] : [...m.amis, ...(m.retires || [])]).map(([id]) => id);
      assert.deepEqual([...ligne[1].matchAll(/'([a-z_]+)'/g)].map(x => x[1]).sort(), attendus.sort(), `${moment} ${registre}`);
    }
  }
});

test("le chambrage n'est proposé qu'entre amis", () => {
  assert.ok(messagesPossibles("avant").every(x => !x.amis));
  assert.ok(messagesPossibles("avant", true).some(x => x.amis && x.texte === "Tu vas finir en slip."));
  assert.deepEqual(messagesPossibles("inconnu"), []);
});

test("après le match, le vainqueur et le vaincu n'ont pas les mêmes messages", () => {
  assert.equal(momentApres(true), "vainqueur");
  assert.equal(momentApres(false), "vaincu");
  assert.equal(texteMessage("vainqueur", "deculottee"), "Déculottée !");
  assert.equal(texteMessage("vaincu", "deculottee"), null);
  assert.equal(texteMessage("vaincu", "chatoune"), "Quelle chatoune !", "un message retiré reçu d'une ancienne version s'affiche encore");
  assert.ok(!messagesPossibles("vaincu", true).some(x => ["chatoune", "faux_rebond"].includes(x.id)), "chatoune et faux rebond ne sont plus proposés");
  assert.ok(!messagesPossibles("vainqueur", true).some(x => ["ton_pere", "padawan", "deculottee"].includes(x.id)), "ni ton père, padawan, déculottée");
});

test("le message écrit entre amis : les garde-fous de l'enjeu, et le même préfixe que le serveur", () => {
  assert.equal(erreurMessageLibre("Rendez-vous dimanche !"), null);
  assert.match(erreurMessageLibre("a"), /trop court/);
  assert.match(erreurMessageLibre("a".repeat(61)), /trop long/);
  assert.match(erreurMessageLibre("Tu me dois 10 euros"), /argent/);
  assert.match(erreurMessageLibre("va sur www.exemple.com"), /lien/);
  assert.match(erreurMessageLibre("Espèce d'ENCULÉ"), /interdit/);
  assert.equal(texteMessage("vaincu", PREFIXE_LIBRE + "Revanche demain !"), "Revanche demain !");
  const sql = readFileSync(new URL("../supabase/etape-48-message-ecrit.sql", import.meta.url), "utf8");
  assert.ok(sql.includes(`p_message like '${PREFIXE_LIBRE}%'`) && sql.includes("> 60") && sql.includes("_mots_interdits_enjeu()"));
  assert.ok(MOTS_INTERDITS.length > 10);
});
