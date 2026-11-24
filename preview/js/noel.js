// L'événement de Noël (24 novembre, idée et choix du porteur du projet ; exception à « seulement l'amélioration de l'existant »,
// validée le 24 novembre) : le court décoré, les flocons, puis les bots, les gants, le chant… Sur la version de test, toujours ;
// sur handslam.fr, du 1er décembre au 6 janvier seulement, sans rien à faire.
import { versionDeTest } from "./nouveautes.js";

// Noël est-il là ? (maintenant : la date ; loc : l'adresse de la page)
export function noelActif(maintenant = new Date(), loc = typeof location !== "undefined" ? location : null) {
  if (versionDeTest(loc)) return true;
  const mois = maintenant.getMonth(), jour = maintenant.getDate();
  return mois === 11 || (mois === 0 && jour <= 6);
}

// Le houx, bien touffu (24 novembre, demande du porteur du projet) : cinq feuilles en éventail et une grappe de baies (dessin).
const FEUILLE = (r, c) => `<path transform="rotate(${r} 40 40)" d="M40 40 C34 28 32 14 40 2 C42 8 48 8 47 14 C52 15 52 21 48 23 C53 26 51 32 46 32 C47 36 44 39 40 40Z" fill="${c}" stroke="#0b3d1b" stroke-width="1.6"/>`;
// (24 novembre, encore plus touffu : neuf feuilles sur deux rangs, et une grosse grappe de baies)
const HOUX = `<svg viewBox="0 0 80 80" aria-hidden="true">${[-100, -60, -20, 20, 60, 100].map((r, i) => FEUILLE(r, i % 2 ? "#2a8f47" : "#1f7a3a")).join("")}`
  + `${[-80, -40, 0, 40, 80].map((r, i) => `<g transform="translate(40 40) scale(.78) translate(-40 -40)">${FEUILLE(r + 20, i % 2 ? "#36a557" : "#2a8f47")}</g>`).join("")}`
  + `<circle cx="33" cy="43" r="6" fill="#c8102e"/><circle cx="47" cy="43" r="6" fill="#d7263d"/><circle cx="40" cy="35" r="6" fill="#e8384f"/>`
  + `<circle cx="40" cy="49" r="5.5" fill="#b80d27"/><circle cx="31" cy="33" r="5" fill="#d7263d"/><circle cx="49" cy="33" r="5" fill="#c8102e"/>`
  + `<circle cx="38" cy="33" r="1.7" fill="#fff" opacity=".75"/><circle cx="31" cy="41" r="1.5" fill="#fff" opacity=".6"/><circle cx="47" cy="31" r="1.4" fill="#fff" opacity=".6"/></svg>`;

// Pose le décor sur l'écran du match (une seule fois) : la guirlande lumineuse et le houx sur le tableau de score, le sapin au fond
// du court, les flocons qui tombent (pas avec « mouvements réduits » : voir le style).
export function installerNoel(doc = document) {
  if (!noelActif() || doc.body.classList.contains("noel")) return;
  doc.body.classList.add("noel");
  const board = doc.querySelector("#viewMatch .board");
  if (board) {
    // (24 novembre, demande du porteur du projet : la guirlande tout autour du cadre, le houx touffu aux quatre coins)
    const guirlandes = ["haut", "bas", "gauche", "droite"].map(c => `<span class="noel-guirlande ${c}" aria-hidden="true"></span>`).join("");
    const houx = ["hg", "hd", "bg", "bd"].map(c => `<span class="noel-houx ${c}" aria-hidden="true">${HOUX}</span>`).join("");
    board.insertAdjacentHTML("afterbegin", guirlandes + houx);
  }
  const vue = doc.getElementById("viewMatch");
  if (vue) {
    const flocons = Array.from({ length: 22 }, (_, i) => {
      const x = (i * 47) % 100, duree = 7 + ((i * 13) % 7), retard = -((i * 29) % 11), taille = 8 + ((i * 7) % 10);
      return `<i style="left:${x}%;animation-duration:${duree}s;animation-delay:${retard}s;font-size:${taille}px">❄</i>`;
    }).join("");
    vue.insertAdjacentHTML("afterbegin", `<div class="noel-flocons" aria-hidden="true">${flocons}</div>`);
  }
}

// ---------------------------------------------------------------- les pouvoirs des bots de Noël (24 novembre, idée du porteur du projet)
// Quand un bot de Noël réussit son smash, le joueur est sonné comme d'habitude (4 secondes), avec l'effet du bot : sur l'écran, et
// sur le gant du joueur. Le Lutin, en plus, mélange les trois boutons pour le coup suivant (sa farce).
// (dessinés dans les coordonnées de la main, vue de dos : le dos de la main est centré en 50, 60 ; 24 novembre, demande du porteur
// du projet : le ruban et le sabot centrés sur le dos de la main)
const RUBAN = `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M46.5 44 H53.5 V77 H46.5 Z M30 56.5 H70 V63.5 H30 Z" fill="#D7263D" stroke="#9E0C24" stroke-width=".8"/>`
  + `<path d="M50 60 C42 47 32 50 34 57 C36 63 45 62 50 60 Z M50 60 C58 47 68 50 66 57 C64 63 55 62 50 60 Z" fill="#E8384F" stroke="#9E0C24" stroke-width="1.2"/>`
  + `<circle cx="50" cy="60" r="3.6" fill="#B80D27"/><path d="M48.5 62.5 L44 72 M51.5 62.5 L56 72" stroke="#D7263D" stroke-width="3" stroke-linecap="round"/></svg>`;
const PEINTURE = `<svg viewBox="0 0 100 100" aria-hidden="true">${[[40, 52, 7, "#E3122F"], [60, 58, 6.5, "#1E9E48"], [48, 68, 6, "#1E9E48"], [62, 70, 4.5, "#E3122F"], [44, 34, 4.5, "#E3122F"], [58, 40, 4, "#1E9E48"]]
  .map(([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity=".88"/><circle cx="${x + r}" cy="${y - r * .6}" r="${r * .3}" fill="${c}" opacity=".88"/><circle cx="${x - r * .9}" cy="${y + r * .7}" r="${r * .25}" fill="${c}" opacity=".88"/>`).join("")}</svg>`;
const SABOT = `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="#3B2412" opacity=".82"><path d="M47 49 C40 49 37 58 39 66 C40.5 71 46 72 48 69 C49.5 64 49.5 54 47 49 Z"/>`
  + `<path d="M53 49 C60 49 63 58 61 66 C59.5 71 54 72 52 69 C50.5 64 50.5 54 53 49 Z"/></g></svg>`;
// (le givre : les glaçons pendent vers le bas de l'écran, c'est-à-dire vers la droite du dessin, la main étant tournée)
const GIVRE = `<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="28" y="22" width="44" height="58" rx="11" fill="#BFE6FF" opacity=".5"/>`
  + `${[32, 42, 52, 62, 72].map((y, i) => `<path d="M71 ${y - 3} L${71 + (i % 2 ? 6 : 9)} ${y} L71 ${y + 3} Z" fill="#E8F7FF" stroke="#8CC8EE" stroke-width=".8"/>`).join("")}`
  + `${[[38, 32], [60, 34], [50, 52], [38, 68], [62, 66]].map(([x, y]) => `<text x="${x}" y="${y}" font-size="8" text-anchor="middle" fill="#fff">❄</text>`).join("")}</svg>`;
export const POUVOIRS_NOEL = {
  perenoel: { nom: "Avalanche de cadeaux", gant: RUBAN, pluie: "🎁" },
  lutin: { nom: "La farce du Lutin : tes boutons sont mélangés", gant: PEINTURE, pluie: "🎨", melange: true },
  renne: { nom: "Coup de sabot", gant: SABOT, pluie: "⭐", comete: true },
  neige: { nom: "Gelé", gant: GIVRE, pluie: "❄️" },
};

// Mélange les trois boutons (jamais dans le même ordre) ; remis en place par remettreBoutons.
export function melangerBoutons(doc = document, rng = Math.random) {
  const moves = doc.getElementById("moves"); if (!moves) return;
  const b = [...moves.children], ordres = [[1, 0, 2], [0, 2, 1], [2, 1, 0], [1, 2, 0], [2, 0, 1]];
  ordres[Math.floor(rng() * ordres.length)].forEach(i => moves.appendChild(b[i]));
  moves.classList.add("melange");
}
export function remettreBoutons(doc = document) {
  const moves = doc.getElementById("moves"); if (!moves || !moves.classList.contains("melange")) return;
  [...moves.children].sort((x, y) => ORDRE_BOUTONS.indexOf(x.dataset.m) - ORDRE_BOUTONS.indexOf(y.dataset.m)).forEach(b => moves.appendChild(b));
  moves.classList.remove("melange");
}
const ORDRE_BOUTONS = ["0", "2", "1"];   // (Pierre, Feuille, Ciseaux : l'ordre d'index.html)

// L'effet du pouvoir, pendant ms (le temps où le joueur est sonné). Renvoie le texte du pouvoir (pour le verdict), ou null.
export function pouvoirNoel(botId, ms, doc = document) {
  const p = POUVOIRS_NOEL[botId]; if (!p) return null;
  const main = doc.getElementById("hMe"), vue = doc.getElementById("viewMatch");
  const poser = (parent, html) => { if (!parent) return; parent.insertAdjacentHTML("beforeend", html); const el = parent.lastElementChild; setTimeout(() => el.remove(), ms); };
  poser(main?.querySelector(".poing-av") || main, `<span class="noel-pouvoir-gant">${p.gant}</span>`);   // (sur la main, tournée comme elle)
  const pluie = Array.from({ length: 10 }, (_, i) => `<i style="left:${(i * 37 + 7) % 92}%;animation-delay:${(i % 5) * 0.18}s">${p.pluie}</i>`).join("");
  poser(vue, `<div class="noel-pouvoir${p.comete ? " comete" : ""}" aria-hidden="true">${p.comete ? `<i class="trainee">☄️</i>` : pluie}</div>`);
  if (p.melange) melangerBoutons(doc);
  return p.nom;
}
