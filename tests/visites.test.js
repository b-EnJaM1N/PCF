// Le compteur de visites : l'origine, et une seule fois par jour (jamais sur la version de test).
import { test } from "node:test";
import assert from "node:assert/strict";
import { origineVisite, aCompter, veille, ecartJours, retoursParcours } from "../app/js/visites.js";

test("origine : appli Android, appli installée, site", () => {
  assert.equal(origineVisite({ referrer: "android-app://fr.handslam.app/" }), "android");
  assert.equal(origineVisite({ androidVu: true, standalone: true }), "android");
  assert.equal(origineVisite({ standalone: true }), "installee");
  assert.equal(origineVisite({ referrer: "https://www.google.com/" }), "site");
});

test("une seule fois par jour, et pas sur la version de test", () => {
  const ici = { chemin: "/", hote: "handslam.fr" };
  assert.equal(aCompter({ ...ici, dernierJour: null, jour: "2026-10-12" }), true);
  assert.equal(aCompter({ ...ici, dernierJour: "2026-10-12", jour: "2026-10-12" }), false);
  assert.equal(aCompter({ ...ici, dernierJour: "2026-10-11", jour: "2026-10-12" }), true);
  assert.equal(aCompter({ chemin: "/preview/", hote: "handslam.fr", dernierJour: null, jour: "2026-10-12" }), false);
  assert.equal(aCompter({ chemin: "/", hote: "localhost", dernierJour: null, jour: "2026-10-12" }), false);
  assert.equal(aCompter({ ...ici, robot: true, dernierJour: null, jour: "2026-10-12" }), false, "un robot ne compte pas");
});

test("la veille d'un jour (pour savoir si le joueur est revenu), y compris en changeant de mois ou d'année", () => {
  assert.equal(veille("2026-10-20"), "2026-10-19");
  assert.equal(veille("2026-11-01"), "2026-10-31");
  assert.equal(veille("2027-01-01"), "2026-12-31");
  assert.equal(veille("2028-03-01"), "2028-02-29");
});

test("le parcours des nouveaux : écart en jours, retour le lendemain, retour une semaine plus tard (une seule fois)", () => {
  assert.equal(ecartJours("2026-11-03", "2026-11-10"), 7);
  assert.equal(ecartJours("2026-10-31", "2026-11-01"), 1);
  assert.equal(ecartJours("2026-10-24", "2026-10-26"), 2);   // (passage à l'heure d'hiver)
  assert.deepEqual(retoursParcours({ arrivee: null, jour: "2026-11-04" }), []);
  assert.deepEqual(retoursParcours({ arrivee: "2026-11-03", jour: "2026-11-04" }), ["retour_1j"]);
  assert.deepEqual(retoursParcours({ arrivee: "2026-11-03", jour: "2026-11-05" }), []);
  assert.deepEqual(retoursParcours({ arrivee: "2026-11-03", jour: "2026-11-09" }), []);
  assert.deepEqual(retoursParcours({ arrivee: "2026-11-03", jour: "2026-11-10" }), ["retour_7j"]);
  assert.deepEqual(retoursParcours({ arrivee: "2026-11-03", jour: "2026-11-16" }), ["retour_7j"]);
  assert.deepEqual(retoursParcours({ arrivee: "2026-11-03", jour: "2026-11-17" }), []);
  assert.deepEqual(retoursParcours({ arrivee: "2026-11-03", jour: "2026-11-12", retour7Fait: true }), []);
});

test("les robots connus ne comptent pas comme visiteurs ; les vrais téléphones, si", async () => {
  const { estRobot } = await import("../app/js/visites.js");
  const robots = [
    "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36 Chrome-Lighthouse",
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "WhatsApp/2.23.20.0",
    "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)",
    "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
  ];
  for (const ua of robots) assert.equal(estRobot({ ua }), true, ua);
  assert.equal(estRobot({ ua: "Mozilla/5.0", webdriver: true }), true, "navigateur piloté par un programme");
  const vrais = [
    "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 13; CUBOT_X70) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
    "Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.0.0 Mobile Safari/537.36",
  ];
  for (const ua of vrais) assert.equal(estRobot({ ua }), false, ua);
});
