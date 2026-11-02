// Les tutos (décision du porteur du projet, 2 novembre) : la première fois qu'un écran s'ouvre, 2 à 4 bulles, l'une après
// l'autre, montrent un bouton et l'expliquent en une phrase (« Suivant », « Passer »). Chaque tuto n'est montré qu'une fois ;
// « Revoir les tutos » (Options) les remet à zéro. Le smash reste un secret (choix du porteur du projet) : pas de tuto.
// Les règles (testées automatiquement) en haut ; l'affichage (installerTutos) n'est appelé que dans le navigateur.

// quand : les éléments qui doivent être à l'écran pour lancer le tuto ; etapes : { cible (sélecteur), texte }.
// Une étape dont la cible n'est pas à l'écran est sautée.
export const TUTOS = [
  {
    id: "duel", nom: "Défier un ami", quand: ["#viewDuel", "#duelOn"],
    etapes: [
      { cible: "#inRecherche", texte: "🔎 Cherche ton ami par son pseudo, puis touche son nom pour le défier." },
      { cible: "#duelLien", texte: "🔗 Il n'a pas encore HandSlam ? Envoie-lui un lien par WhatsApp ou SMS : il arrive directement sur ton défi." },
    ],
  },
  {
    id: "defi", nom: "Envoyer un défi", quand: ["#defiFenetre"],
    etapes: [
      { cible: "#duelPresets", texte: "⏱️ Choisis le format : Éclair (1 set de 7) pour une partie vite faite, Classique pour un vrai match." },
      { cible: "label:has(#duelClasse)", texte: "📈 Un match officiel compte pour ton niveau. Décoche pour un match amical, juste pour le plaisir." },
      { cible: "#duelEnjeuZone", texte: "🎯 Ajoute un enjeu : le perdant s'y colle (le café, la vaisselle…). Ton ami le voit avant d'accepter." },
      { cible: "#defiEnvoyer", texte: "📨 Envoie ! Ton ami reçoit le défi dans « Défier un ami ». Le match démarre quand vous êtes là tous les deux." },
    ],
  },
  {
    id: "cercles", nom: "Amis et cercles", quand: ["#viewCercles", "#socOn", "#socListe"],
    etapes: [
      { cible: "#cercleNouveau", texte: "👪 Crée ton cercle : la famille, les collègues, la bande d'amis… Il a son propre classement." },
      { cible: "#inAmi", texte: "🤝 Ajoute tes amis par leur pseudo : tu pourras les défier en un geste." },
    ],
  },
  {
    id: "cercle", nom: "La page d'un cercle", quand: ["#viewCercles", "#socCercle"],
    etapes: [
      { cible: "#cPartager", texte: "📲 Invite tes proches : envoie le lien par WhatsApp ou SMS, ils rejoignent le cercle en un geste." },
      { cible: "section:has(#cClassement)", texte: "🏅 Le classement du cercle : qui est le meilleur de la bande ?" },
      { cible: "#cNouveauTournoi", texte: "🏆 Organise un tournoi du cercle : élimination directe, ou championnat où chacun rencontre tous les autres." },
    ],
  },
  {
    id: "championnat", nom: "Organiser un championnat", quand: ["#socTournoiNouveau", "#tnTypeBox"],
    etapes: [
      { cible: "#tnType", texte: "🏆 Championnat : chacun rencontre tous les autres (de 3 à 10 joueurs), quand il veut pendant la période. 2 points par victoire." },
      { cible: "#tnDuree", texte: "📅 La durée : le temps qu'ont les joueurs pour jouer leurs matchs." },
      { cible: "#tnEnjeuZone", texte: "🎯 Un enjeu ? Le dernier s'y colle !" },
    ],
  },
  {
    id: "carriere", nom: "Carrière solo", quand: ["#viewCarriere", "#carOnglets"],
    etapes: [
      { cible: "#carEntete", texte: "🏅 5 circuits, de l'Amateur à l'Élite : chaque saison, les 2 finalistes des playoffs montent au circuit du dessus." },
      { cible: "#carJouer", texte: "▶️ Ton prochain match. Joue quand tu veux, autant que tu veux." },
      { cible: "#carOnglets", texte: "📊 Le classement, ton calendrier, la Coupe Monique-Latour (64 joueurs de tous les circuits) et ton palmarès." },
    ],
  },
];

// Le tuto à montrer maintenant (ou null) : le premier pas encore vu dont tous les éléments « quand » sont à l'écran.
// vus : les identifiants déjà vus ; visible(sélecteur) : vrai si l'élément est affiché.
export function tutoAMontrer(vus, visible) {
  const deja = new Set(vus || []);
  return TUTOS.find(t => !deja.has(t.id) && t.quand.every(visible)) || null;
}
// Les étapes à montrer (celles dont la cible est à l'écran).
export const etapesVisibles = (tuto, visible) => tuto.etapes.filter(e => visible(e.cible));

// ---------------------------------------------------------------- l'affichage
// lire, ecrire : le stockage du téléphone ; occupe() : vrai quand il ne faut pas déranger (match en cours, autre fenêtre).
export function installerTutos({ lire, ecrire, occupe = () => false }) {
  const CLE = "tutosVus";
  const visible = sel => {
    let el; try { el = document.querySelector(sel); } catch { return false; }
    if (!el || el.closest("[hidden]")) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  let enCours = false, attente = 0;

  function montrer(tuto) {
    const etapes = etapesVisibles(tuto, visible);
    ecrire(CLE, [...new Set([...(lire(CLE, []) || []), tuto.id])]);
    if (!etapes.length) return;
    enCours = true;
    const fond = document.createElement("div"); fond.className = "tuto-fond";
    const cadre = document.createElement("div"); cadre.className = "tuto-cadre";
    const bulle = document.createElement("div"); bulle.className = "tuto-bulle"; bulle.setAttribute("role", "dialog"); bulle.setAttribute("aria-live", "polite");
    fond.append(cadre, bulle); document.body.append(fond);
    let k = 0, cible = null;
    const placer = () => {
      if (!cible) return;
      const r = cible.getBoundingClientRect(), m = 6;
      Object.assign(cadre.style, { left: `${r.left - m}px`, top: `${r.top - m}px`, width: `${r.width + 2 * m}px`, height: `${r.height + 2 * m}px` });
      const h = bulle.offsetHeight, bas = r.bottom + m + 12;
      bulle.style.top = `${bas + h < innerHeight - 8 ? bas : Math.max(8, r.top - m - 12 - h)}px`;
    };
    const fermer = () => { enCours = false; fond.remove(); removeEventListener("resize", placer); removeEventListener("scroll", placer, true); planifier(); };
    const etape = () => {
      const e = etapes[k];
      cible = document.querySelector(e.cible);
      if (!cible || !visible(e.cible)) { k++; return k < etapes.length ? etape() : fermer(); }
      const dernier = k === etapes.length - 1;
      bulle.innerHTML = `<p></p><div class="tuto-actions"><button type="button" class="linkbtn tuto-passer"${dernier ? " hidden" : ""}>Passer</button>` +
        `<button type="button" class="btn tuto-suivant">${dernier ? "C'est compris !" : `Suivant (${k + 1}/${etapes.length})`}</button></div>`;
      bulle.querySelector("p").textContent = e.texte;
      bulle.querySelector(".tuto-passer").onclick = fermer;
      bulle.querySelector(".tuto-suivant").onclick = () => { k++; k < etapes.length ? etape() : fermer(); };
      cible.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      placer(); setTimeout(placer, 350);
      bulle.querySelector(".tuto-suivant").focus({ preventScroll: true });
    };
    addEventListener("resize", placer); addEventListener("scroll", placer, true);
    etape();
  }

  // Un écran vient de s'ouvrir (ou de changer) : on regarde, un instant plus tard, s'il y a un tuto à montrer.
  function planifier() {
    clearTimeout(attente);
    attente = setTimeout(() => {
      if (enCours || occupe()) return;
      const t = tutoAMontrer(lire(CLE, []), visible);
      if (t) montrer(t);
    }, 700);
  }
  new MutationObserver(planifier).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["hidden"] });
  planifier();
  return { revoir() { ecrire(CLE, []); } };
}
