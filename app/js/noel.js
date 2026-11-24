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
const RUBAN = `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M44 0 H56 V100 H44 Z M0 52 H100 V64 H0 Z" fill="#D7263D" opacity=".92"/>`
  + `<path d="M50 50 C38 30 22 34 26 46 C29 56 44 54 50 50 Z M50 50 C62 30 78 34 74 46 C71 56 56 54 50 50 Z" fill="#E8384F" stroke="#9E0C24" stroke-width="2"/>`
  + `<circle cx="50" cy="50" r="6" fill="#B80D27"/><path d="M48 54 L40 72 M52 54 L60 72" stroke="#D7263D" stroke-width="5" stroke-linecap="round"/></svg>`;
const PEINTURE = `<svg viewBox="0 0 100 100" aria-hidden="true">${[[30, 34, 13, "#E3122F"], [66, 42, 11, "#1E9E48"], [44, 66, 12, "#1E9E48"], [70, 70, 9, "#E3122F"], [24, 60, 7, "#E3122F"]]
  .map(([x, y, r, c]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity=".85"/><circle cx="${x + r}" cy="${y - r * .6}" r="${r * .3}" fill="${c}" opacity=".85"/><circle cx="${x - r * .9}" cy="${y + r * .7}" r="${r * .25}" fill="${c}" opacity=".85"/>`).join("")}</svg>`;
const SABOT = `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="#3B2412" opacity=".8"><path d="M30 40 C24 54 26 70 40 74 C46 72 46 60 44 50 C42 42 36 36 30 40 Z"/>`
  + `<path d="M70 40 C76 54 74 70 60 74 C54 72 54 60 56 50 C58 42 64 36 70 40 Z"/></g></svg>`;
const GIVRE = `<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="30" fill="#BFE6FF" opacity=".55"/>`
  + `${[18, 34, 50, 66, 82].map((x, i) => `<path d="M${x - 5} 88 L${x} ${100 - (i % 2 ? 22 : 32)} L${x + 5} 88 Z" fill="#E8F7FF" stroke="#8CC8EE" stroke-width="1.2"/>`).join("")}`
  + `${[[26, 26], [72, 30], [50, 50], [30, 66], [70, 62]].map(([x, y]) => `<text x="${x}" y="${y}" font-size="14" text-anchor="middle" fill="#fff">❄</text>`).join("")}</svg>`;
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
  poser(main, `<span class="noel-pouvoir-gant">${p.gant}</span>`);
  const pluie = Array.from({ length: 10 }, (_, i) => `<i style="left:${(i * 37 + 7) % 92}%;animation-delay:${(i % 5) * 0.18}s">${p.pluie}</i>`).join("");
  poser(vue, `<div class="noel-pouvoir${p.comete ? " comete" : ""}" aria-hidden="true">${p.comete ? `<i class="trainee">☄️</i>` : pluie}</div>`);
  if (p.melange) melangerBoutons(doc);
  return p.nom;
}
