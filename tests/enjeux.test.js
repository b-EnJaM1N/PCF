import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ENJEU_MAX, SUGGESTIONS, MOTS_INTERDITS, nettoyerEnjeu, erreurEnjeu, annonceEnjeu } from "../app/js/enjeux.js";

test("les idées toutes prêtes sont toutes acceptées", () => {
  for (const s of SUGGESTIONS) assert.equal(erreurEnjeu(s), null, s);
});

test("un enjeu court et propre est accepté, les espaces en trop sont retirés", () => {
  assert.equal(erreurEnjeu("  Qui tond la pelouse   chez mamie ?  "), null);
  assert.equal(nettoyerEnjeu("  Qui   tond  "), "Qui tond");
});

test("trop court, trop long, argent, lien et gros mots sont refusés", () => {
  assert.match(erreurEnjeu("ok"), /trop court/);
  assert.match(erreurEnjeu("x".repeat(ENJEU_MAX + 1)), /trop long/);
  assert.match(erreurEnjeu("Le perdant donne 10 €"), /argent/);
  assert.match(erreurEnjeu("Le perdant paie 20 euros"), /argent/);
  assert.match(erreurEnjeu("Le perdant file 5 balles"), /argent/);
  assert.match(erreurEnjeu("Va voir www.exemple.com"), /lien/);
  assert.match(erreurEnjeu("Le perdant est un CONNARD"), /mot interdit/);
  assert.match(erreurEnjeu("Le perdant est un enculé"), /mot interdit/);
  assert.equal(erreurEnjeu("Concours de pâtisserie"), null, "un mot qui contient « con » n'est pas un gros mot");
});

test("l'annonce de fin dit qui s'y colle", () => {
  assert.equal(annonceEnjeu("Qui fait la vaisselle ?", true, "Julie"), "🎯 « Qui fait la vaisselle ? » — C'est Julie qui s'y colle !");
  assert.equal(annonceEnjeu("Qui fait la vaisselle ?", false, "Julie"), "🎯 « Qui fait la vaisselle ? » — C'est toi qui t'y colles !");
});

test("les mêmes règles sur le serveur", () => {
  const sql = readFileSync(new URL("../supabase/etape-34-enjeux.sql", import.meta.url), "utf8");
  const liste = sql.match(/_mots_interdits_enjeu\(\) returns text\[\][^$]*\$\$ select array\[([^\]]*)\]/);
  assert.ok(liste, "liste des mots interdits du serveur");
  assert.deepEqual([...liste[1].matchAll(/'([a-z0-9]+)'/g)].map(x => x[1]), MOTS_INTERDITS);
  assert.match(sql, new RegExp(`char_length\\(t\\) > ${ENJEU_MAX}`));
});
