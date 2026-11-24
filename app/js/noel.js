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
const HOUX = `<svg viewBox="0 0 80 80" aria-hidden="true">${FEUILLE(-80, "#1f7a3a")}${FEUILLE(-40, "#2a8f47")}${FEUILLE(0, "#1f7a3a")}${FEUILLE(40, "#2a8f47")}${FEUILLE(80, "#1f7a3a")}`
  + `<circle cx="34" cy="42" r="6" fill="#c8102e"/><circle cx="46" cy="42" r="6" fill="#d7263d"/><circle cx="40" cy="34" r="6" fill="#e8384f"/><circle cx="40" cy="48" r="5.5" fill="#b80d27"/>`
  + `<circle cx="38" cy="32" r="1.7" fill="#fff" opacity=".75"/><circle cx="32" cy="40" r="1.5" fill="#fff" opacity=".6"/></svg>`;

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
