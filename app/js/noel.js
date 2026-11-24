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

// Le houx : deux feuilles et trois baies (dessin).
const HOUX = `<svg viewBox="0 0 64 40" aria-hidden="true"><path d="M30 22 C22 6 8 6 2 10 C8 12 6 18 10 20 C6 24 10 30 14 28 C16 34 24 30 30 22Z" fill="#1f7a3a" stroke="#0f4d22" stroke-width="1.5"/><path d="M34 22 C42 6 56 6 62 10 C56 12 58 18 54 20 C58 24 54 30 50 28 C48 34 40 30 34 22Z" fill="#2a8f47" stroke="#0f4d22" stroke-width="1.5"/><circle cx="28" cy="25" r="5" fill="#d7263d"/><circle cx="36" cy="25" r="5" fill="#d7263d"/><circle cx="32" cy="18" r="5" fill="#e8384f"/><circle cx="30.5" cy="16.5" r="1.4" fill="#fff" opacity=".7"/></svg>`;

// Pose le décor sur l'écran du match (une seule fois) : la guirlande lumineuse et le houx sur le tableau de score, le sapin au fond
// du court, les flocons qui tombent (pas avec « mouvements réduits » : voir le style).
export function installerNoel(doc = document) {
  if (!noelActif() || doc.body.classList.contains("noel")) return;
  doc.body.classList.add("noel");
  const board = doc.querySelector("#viewMatch .board");
  if (board) {
    board.insertAdjacentHTML("afterbegin", `<span class="noel-guirlande" aria-hidden="true"></span><span class="noel-houx g" aria-hidden="true">${HOUX}</span><span class="noel-houx d" aria-hidden="true">${HOUX}</span>`);
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
