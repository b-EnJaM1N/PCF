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

// Les grands jours (24 novembre au soir, choix du porteur du projet) : le réveillon et Noël, le 24 et le 25 décembre, le court
// rouge et le grand sapin derrière « contre ». Les autres jours des fêtes, le court bleu habituel, avec la guirlande, le houx et
// les flocons. Sur la version de test : quand le jour simulé du calendrier de l'Avent (ecran-avent.js) est le 24 ou le 25.
export function noelGrandJour(maintenant = new Date(), loc = typeof location !== "undefined" ? location : null) {
  if (versionDeTest(loc)) { try { return [24, 25].includes(JSON.parse(localStorage.getItem("pcf:aventEssai"))?.jourSimule); } catch { return false; } }
  return maintenant.getMonth() === 11 && [24, 25].includes(maintenant.getDate());
}
export const majGrandJour = (doc = document) => doc.body.classList.toggle("noel-fete", noelActif() && noelGrandJour());

// Le houx, bien touffu (24 novembre, demande du porteur du projet) : cinq feuilles en éventail et une grappe de baies (dessin).
const FEUILLE = (r, c) => `<path transform="rotate(${r} 40 40)" d="M40 40 C34 28 32 14 40 2 C42 8 48 8 47 14 C52 15 52 21 48 23 C53 26 51 32 46 32 C47 36 44 39 40 40Z" fill="${c}" stroke="#0b3d1b" stroke-width="1.6"/>`;
// (24 novembre, encore plus touffu : neuf feuilles sur deux rangs, et une grosse grappe de baies)
const HOUX = `<svg viewBox="0 0 80 80" aria-hidden="true">${[-100, -60, -20, 20, 60, 100].map((r, i) => FEUILLE(r, i % 2 ? "#2a8f47" : "#1f7a3a")).join("")}`
  + `${[-80, -40, 0, 40, 80].map((r, i) => `<g transform="translate(40 40) scale(.78) translate(-40 -40)">${FEUILLE(r + 20, i % 2 ? "#36a557" : "#2a8f47")}</g>`).join("")}`
  + `<circle cx="33" cy="43" r="6" fill="#c8102e"/><circle cx="47" cy="43" r="6" fill="#d7263d"/><circle cx="40" cy="35" r="6" fill="#e8384f"/>`
  + `<circle cx="40" cy="49" r="5.5" fill="#b80d27"/><circle cx="31" cy="33" r="5" fill="#d7263d"/><circle cx="49" cy="33" r="5" fill="#c8102e"/>`
  + `<circle cx="38" cy="33" r="1.7" fill="#fff" opacity=".75"/><circle cx="31" cy="41" r="1.5" fill="#fff" opacity=".6"/><circle cx="47" cy="31" r="1.4" fill="#fff" opacity=".6"/></svg>`;

// Pose le décor (une seule fois) : le bonnet sur le logo ; sur l'écran du match, la guirlande lumineuse et le houx sur le tableau de score, le sapin au fond
// du court, les flocons qui tombent (pas avec « mouvements réduits » : voir le style).
export function installerNoel(doc = document) {
  if (!noelActif() || doc.body.classList.contains("noel")) return;
  doc.body.classList.add("noel");
  majGrandJour(doc);
  const board = doc.querySelector("#viewMatch .board");
  if (board) {
    // (24 novembre, demande du porteur du projet : la guirlande tout autour du cadre, le houx touffu aux quatre coins)
    const guirlandes = ["haut", "bas", "gauche", "droite"].map(c => `<span class="noel-guirlande ${c}" aria-hidden="true"></span>`).join("");
    const houx = ["hg", "hd", "bg", "bd"].map(c => `<span class="noel-houx ${c}" aria-hidden="true">${HOUX}</span>`).join("");
    board.insertAdjacentHTML("afterbegin", guirlandes + houx);
  }
  // (24 novembre au soir, choix du porteur du projet) le bonnet de Noël sur le logo, en haut de l'écran
  const marque = doc.querySelector(".marque");
  if (marque) marque.insertAdjacentHTML("afterbegin", `<svg class="noel-bonnet" viewBox="0 0 60 46" aria-hidden="true">`
    + `<path d="M8 36 C12 18 26 4 44 6 C52 7 56 14 54 22 C50 16 44 14 40 18 C36 24 38 32 40 36 Z" fill="#D7192E" stroke="#8E0B20" stroke-width="1.4" stroke-linejoin="round"/>`
    + `<path d="M24 14 C30 9 38 8 44 10" fill="none" stroke="#fff" stroke-width="1.6" opacity=".35" stroke-linecap="round"/>`
    + `<rect x="4" y="32" width="40" height="11" rx="5.5" fill="#fff" stroke="#DADDE2" stroke-width="1"/>`
    + `<circle cx="54" cy="24" r="6" fill="#fff" stroke="#DADDE2" stroke-width="1"/></svg>`);
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
// Quand un bot de Noël réussit son smash, le joueur est sonné comme d'habitude (4 secondes), avec l'effet du bot sur l'écran ; sa
// marque reste sur le gant du joueur jusqu'à la fin du set (degats.js, dessinée par avatar.js). Le Lutin, en plus, mélange les
// trois boutons pour le coup suivant (sa farce).
export const POUVOIRS_NOEL = {
  perenoel: { nom: "Avalanche de cadeaux", pluie: "🎁" },
  lutin: { nom: "La farce du Lutin : tes boutons sont mélangés", pluie: "🎨", melange: true },
  renne: { nom: "Coup de sabot", pluie: "⭐", comete: true },
  neige: { nom: "Gelé", pluie: "❄️" },
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
  // (24 novembre au soir, choix du porteur du projet) le bonnet de Noël sur le logo, en haut de l'écran
  const marque = doc.querySelector(".marque");
  if (marque) marque.insertAdjacentHTML("afterbegin", `<svg class="noel-bonnet" viewBox="0 0 60 46" aria-hidden="true">`
    + `<path d="M8 36 C12 18 26 4 44 6 C52 7 56 14 54 22 C50 16 44 14 40 18 C36 24 38 32 40 36 Z" fill="#D7192E" stroke="#8E0B20" stroke-width="1.4" stroke-linejoin="round"/>`
    + `<path d="M24 14 C30 9 38 8 44 10" fill="none" stroke="#fff" stroke-width="1.6" opacity=".35" stroke-linecap="round"/>`
    + `<rect x="4" y="32" width="40" height="11" rx="5.5" fill="#fff" stroke="#DADDE2" stroke-width="1"/>`
    + `<circle cx="54" cy="24" r="6" fill="#fff" stroke="#DADDE2" stroke-width="1"/></svg>`);
  const vue = doc.getElementById("viewMatch");
  const poser = (parent, html) => { if (!parent) return; parent.insertAdjacentHTML("beforeend", html); const el = parent.lastElementChild; setTimeout(() => el.remove(), ms); };
  const pluie = Array.from({ length: 10 }, (_, i) => `<i style="left:${(i * 37 + 7) % 92}%;animation-delay:${(i % 5) * 0.18}s">${p.pluie}</i>`).join("");
  poser(vue, `<div class="noel-pouvoir${p.comete ? " comete" : ""}" aria-hidden="true">${p.comete ? `<i class="trainee">☄️</i>` : pluie}</div>`);
  if (p.melange) melangerBoutons(doc);
  return p.nom;
}
