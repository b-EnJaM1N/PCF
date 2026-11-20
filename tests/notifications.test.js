import { test } from "node:test";
import assert from "node:assert/strict";
import { message, texteFormat, texteCreneauParis } from "../supabase/functions/notifier/index.ts";

test("les messages des notifications", () => {
  const duel = { id: "d1", points_par_set: 11, sets_gagnants: 2, classe: true, phase: "attente" }, adv = { pseudo: "Bob", numero: 4821 };
  assert.deepEqual(message("defi", duel, adv), {
    titre: "⚔️ Bob#4821 te défie !", texte: "Sets de 11 points · 2 sets gagnants · duel officiel. Touche pour répondre.", url: "./?ouvrir=duels", tag: "duel-d1",
  });
  assert.equal(message("accepte", duel, adv).titre, "✅ Bob#4821 a accepté ton défi !");
  assert.match(message("accepte", duel, adv).texte, /salle d'attente/);
  assert.equal(message("attend", duel, adv).titre, "⏳ Bob#4821 t'attend !");
  assert.equal(message("attend", duel, adv).url, "./?ouvrir=duels");
  assert.equal(message("tournoi", { ...duel, phase: "presentation" }, adv).texte, "Contre Bob#4821. Tu as 60 secondes pour arriver !");
  assert.equal(message("tournoi", duel, adv).texte, "Bob#4821 t'attend pour votre match.");
  // l'invitation à un tournoi de cercle (étape 76) : adv est celui qui invite
  assert.deepEqual(message("invitation", null, adv, { nom: "Coupe du vendredi", mode: "libre" }), {
    titre: "📨 Bob#4821 t'invite au tournoi Coupe du vendredi", texte: "Touche pour t'inscrire (ou dire « Non merci »).",
    url: "./?ouvrir=invitations", tag: "invitation-Coupe du vendredi",
  });
  assert.equal(message("invitation", null, adv, { nom: "Ligue", mode: "championnat" }).titre, "📨 Bob#4821 t'invite au championnat Ligue");
  // les amis et les cercles (étape 79)
  assert.equal(message("ami_demande", null, adv).titre, "🤝 Bob#4821 veut être ton ami");
  assert.equal(message("ami_demande", null, adv).url, "./?ouvrir=amis");
  assert.equal(message("ami_accepte", null, adv).titre, "✅ Bob#4821 a accepté ta demande d'ami");
  assert.equal(message("invitation_cercle", null, adv, undefined, { nom: "FIAC CLUB" }).titre, "🏰 Bob#4821 t'invite dans le cercle FIAC CLUB");
  // programmer un match ou un défi (étapes 84 à 86)
  const t = { nom: "Coupe test" }, maintenant = new Date("2026-11-20T12:00:00Z");
  assert.equal(texteCreneauParis({ debut: "2026-11-20T18:00:00Z", fin: "2026-11-20T18:15:00Z" }, maintenant), "aujourd'hui à 19 h");
  assert.equal(texteCreneauParis({ debut: "2026-11-21T19:00:00Z", fin: "2026-11-21T21:00:00Z" }, maintenant), "demain entre 20 h et 22 h");
  assert.match(message("creneaux", null, adv, undefined, undefined, undefined, [{ debut: "2026-11-24T18:00:00Z", fin: "2026-11-24T18:15:00Z" }], "d9").titre, /^📅 Bob#4821 te propose un défi .+ à 19 h$/);
  assert.equal(message("creneaux", null, adv, undefined, undefined, undefined, [{ debut: "x", fin: "y" }, { debut: "x", fin: "y" }], "d9").titre, "📅 Bob#4821 te propose un défi : 2 créneaux");
  assert.equal(message("creneaux", null, adv, undefined, undefined, undefined, [], "d9").tag, "duel-d9", "elle remplace « X te défie » sur le téléphone");
  assert.equal(message("rdv_decline", null, adv).titre, "❌ Bob#4821 a décliné ton défi");
  assert.equal(message("rdv_heure", null, adv, t).url, "./?ouvrir=tournois");
  assert.equal(message("rdv_heure", null, adv).url, "./?ouvrir=duels", "un défi programmé ouvre « Défis »");
  assert.equal(message("rdv_rappel", null, adv, t, undefined, "2026-11-26T20:30:00Z").texte, "Contre Bob#4821, à 21 h 30 (Coupe test). Prépare-toi !");
  assert.equal(texteFormat(7, 1), "Sets de 7 points · match en 1 set");
  assert.equal(texteFormat(1, 1), "Sets de 1 point · match en 1 set");
});

test("la clé publique est convertie en octets", async () => {
  const { octetsDepuisBase64Url } = await import("../app/js/notifications.js");
  assert.deepEqual([...octetsDepuisBase64Url("AQID_-8")], [1, 2, 3, 255, 239]);
  assert.equal(octetsDepuisBase64Url("B".repeat(87)).length, 65);   // une clé publique P-256 fait 65 octets
});

test("la notification de test", () => {
  assert.equal(message("test", null, { pseudo: "x", numero: 0 }).titre, "🔔 Notification de test");
});

test("le texte du résultat de la notification de test", async () => {
  const { texteTest } = await import("../app/js/notifications.js");
  assert.match(texteTest({ ok: true, resultat: "1 appareil sur 1" }), /^✅ Notification envoyée \(1 appareil sur 1\)/);
  assert.match(texteTest({ ok: false, resultat: null }), /Verify JWT/);
  assert.match(texteTest({ ok: false, resultat: "0 appareil sur 1 (refus 403)" }), /refus 403/);
});

test("la notification du freeroll de 20 h", () => {
  const m = message("freeroll", null, { pseudo: "x", numero: 0 });
  assert.equal(m.titre, "🌙 Le freeroll commence dans 10 minutes");
  assert.equal(m.url, "./?ouvrir=freeroll");
});

test("la notification d'un tournoi programmé, avec son nom et son heure", () => {
  const m = message("programme", null, { pseudo: "x", numero: 0 }, { nom: "Le Midi", depart: "2026-10-01T10:30:00Z" });
  assert.equal(m.titre, "🗓️ Le Midi commence dans 10 minutes");
  assert.match(m.texte, /démarre à 12 h 30 /);
  assert.equal(m.url, "./?ouvrir=programmes");
  assert.match(message("programme", null, { pseudo: "x", numero: 0 }, { nom: "L'Apéro", depart: "2026-12-01T17:00:00Z" }).texte, /à 18 h avec/);
});
