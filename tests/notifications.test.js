import { test } from "node:test";
import assert from "node:assert/strict";
import { message, texteFormat } from "../supabase/functions/notifier/index.ts";

test("les messages des notifications", () => {
  const duel = { id: "d1", points_par_set: 11, sets_gagnants: 2, classe: true, phase: "attente" }, adv = { pseudo: "Bob", numero: 4821 };
  assert.deepEqual(message("defi", duel, adv), {
    titre: "⚔️ Bob#4821 te défie !", texte: "Sets de 11 points · 2 sets gagnants · duel officiel. Touche pour répondre.", url: "./?ouvrir=duels", tag: "duel-d1",
  });
  assert.equal(message("accepte", duel, adv).titre, "✅ Bob#4821 a accepté ton défi !");
  assert.equal(message("tournoi", { ...duel, phase: "presentation" }, adv).texte, "Contre Bob#4821. Tu as 60 secondes pour arriver !");
  assert.equal(message("tournoi", duel, adv).texte, "Bob#4821 t'attend pour votre match.");
  assert.equal(texteFormat(7, 1), "Sets de 7 points · match en 1 set");
  assert.equal(texteFormat(1, 1), "Sets de 1 point · match en 1 set");
});

test("la clé publique est convertie en octets", async () => {
  const { octetsDepuisBase64Url } = await import("../app/js/notifications.js");
  assert.deepEqual([...octetsDepuisBase64Url("AQID_-8")], [1, 2, 3, 255, 239]);
  assert.equal(octetsDepuisBase64Url("B".repeat(87)).length, 65);   // une clé publique P-256 fait 65 octets
});
