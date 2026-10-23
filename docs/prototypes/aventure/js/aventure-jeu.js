// L'Aventure de Chifoumania, en pixel art (ouverte depuis le menu Chifoumania).
// La carte du monde, la mission de l'Enchanteresse, le combat animé sur le décor de la forêt, la fin du combat.
// Le combat : l'adversaire annonce son intention (parfois du bluff), on a peu de temps pour répondre,
// et la jauge d'énergie permet un coup spécial.
// Les règles sont dans aventure-logique.js (testées) ; la progression est gardée sur le téléphone (« aventure »).
import { lire, ecrire } from "./stockage.js";
import {
  MONDES, POUVOIRS, MAX_POUVOIRS, GAIN, ENERGIE_MAX, SPECIAUX, normaliser, heros, ouvert, termine, etoilesDe, apresVictoire,
  nouveauCombat, signeAdversaire, intentionDe, tempsDe, peutArmer, armer, peutUtiliser, utiliser, jouer, piqueAuHasard,
} from "./aventure-logique.js";
import { IMAGE, LARGEUR, HAUTEUR, ETAPES, MS_PAR_PIXEL, trajet, position } from "./aventure-carte.js";
import { PEAUX, CHEVEUX, YEUX, ORIGINE, estOrigine, personnaliser } from "./aventure-perso.js";

const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pause = ms => new Promise(r => setTimeout(r, ms));
const M = MONDES[0];
// Les héros au choix, avec où se trouvent leurs cheveux et leurs yeux dans le dessin (pour les repeindre).
// Le choix et la personnalisation sont gardés sur le téléphone (« aventurePerso » : { heros, peau, cheveux, yeux, image }).
const HEROS_CHOIX = [
  { id: "cape", nom: "Le Héros", desc: "Cape rouge et poings serrés.", image: "img/aventure/heros.png", visage: ["250%", "62% 3%"],
    zones: { cheveux: [{ x: 180, y: 0, w: 196, h: 100 }, { x: 225, y: 100, w: 140, h: 18 }], ecartMeches: 0.1, yeux: [{ x: 262, y: 105, w: 22, h: 28 }, { x: 298, y: 105, w: 16, h: 28 }] } },
  { id: "heroine", nom: "L'Héroïne", desc: "Queue de cheval et regard décidé.", image: "img/aventure/heroine.png", visage: ["250%", "86% 18%"],
    zones: { cheveux: [{ x: 0, y: 0, w: 380, h: 132 }, { x: 0, y: 132, w: 305, h: 18 }, { x: 0, y: 150, w: 130, h: 60 }], yeux: [{ x: 255, y: 99, w: 24, h: 21 }, { x: 290, y: 99, w: 15, h: 21 }] } },
];
let perso = lire("aventurePerso", null);
if (!perso && HEROS_CHOIX.some(h => h.id === lire("aventureHeros", null))) perso = { heros: lire("aventureHeros"), ...ORIGINE };
if (perso && !HEROS_CHOIX.some(h => h.id === perso.heros)) perso = null;
let herosId = perso?.heros || null;
function herosChoisi() {
  const h = HEROS_CHOIX.find(x => x.id === herosId) || HEROS_CHOIX[0];
  return perso?.heros === h.id && perso.image ? { ...h, image: perso.image } : h;
}
const herosImg = () => herosChoisi().image;
const teteHeros = (h = herosChoisi()) => `<span class="tete" style="background-image:url(${h.image});background-size:${h.visage[0]} auto;background-position:${h.visage[1]}"></span>`;
// 0 Pierre, 1 Ciseaux, 2 Feuille (comme regles.js) ; les boutons dans l'ordre Pierre, Feuille, Ciseaux.
const EMO = ["🪨", "✂️", "✋"], NOMS = ["Pierre", "Ciseaux", "Feuille"];
const BOUTONS = [{ s: 0, c: "bleu" }, { s: 2, c: "vert" }, { s: 1, c: "rouge" }];

let P = normaliser(lire("aventure"));
const sauver = () => ecrire("aventure", P);

// ---------------------------------------------------------------- les émojis, dessinés en gros pixels
// (les adversaires sans dessin, les signes, l'Enchanteresse) : l'émoji est dessiné tout petit, puis agrandi sans lissage.
const cachePix = new Map();
function pix(emoji, taille = 18) {
  const k = emoji + taille;
  if (!cachePix.has(k)) {
    const c = document.createElement("canvas"); c.width = c.height = taille + 4;
    const g = c.getContext("2d");
    g.font = `${taille}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(emoji, c.width / 2, c.height / 2 + 1);
    cachePix.set(k, c.toDataURL());
  }
  return cachePix.get(k);
}
const imgPix = (emoji, cls = "", taille = 18) => `<img class="pix ${cls}" src="${pix(emoji, taille)}" alt="">`;
// La mise en scène de chaque adversaire : retourné pour regarder le héros, en vol, plus grand (le boss),
// et le cadrage de son visage dans les petites vignettes (taille de l'image, point visé).
const POSE = {
  bambi: { miroir: true, visage: ["230%", "88% 22%"] },
  gobelin: { visage: ["230%", "46% 4%"] },
  pipistrelle: { miroir: true, vol: true, visage: ["300%", "60% 52%"] },
  amanite: { visage: ["210%", "45% 72%"] },
  loup: { visage: ["250%", "24% 30%"] },
  gardien: { grand: true, visage: ["320%", "66% 18%"] },
};
const pose = a => POSE[a.id] || {};
const classesPose = a => ["miroir", "vol", "grand"].filter(k => pose(a)[k]).join(" ");
const sprite = a => (a.image ? `<img class="sprite" src="${a.image}" alt="${esc(a.nom)}">` : imgPix(a.emoji, "sprite", 22));
function tete(a) {
  if (!a.image) return `<span class="tete">${imgPix(a.emoji, "", 16)}</span>`;
  const [taille, point] = pose(a).visage || ["230%", "50% 20%"];
  return `<span class="tete ${pose(a).miroir ? "miroir" : ""}" style="background-image:url(${a.image});background-size:${taille} auto;background-position:${point}"></span>`;
}

// ---------------------------------------------------------------- les sons, façon console 8 bits
let audio = null, sonOn = lire("aventureSon", true) !== false;
const SONS = {
  clic: [[880, 0.03, "square", 0.03]],
  pas: [[140, 0.04, "triangle", 0.05]],
  coup: [[180, 0.07, "square", 0.05, 420]],
  touche: [[700, 0.09, "square", 0.08, 200]],
  aie: [[220, 0.18, "sawtooth", 0.07, 60]],
  bloque: [[1200, 0.05, "square", 0.05], [1500, 0.08, "square", 0.05]],
  egalite: [[330, 0.08, "triangle", 0.07]],
  pouvoir: [[523, 0.07], [659, 0.07], [784, 0.12]],
  rage: [[110, 0.35, "sawtooth", 0.09, 55]],
  victoire: [[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.35]],
  tic: [[1320, 0.03, "square", 0.025]],
  special: [[392, 0.06], [523, 0.06], [784, 0.06], [1047, 0.18, "sawtooth", 0.07]],
  arme: [[660, 0.05, "square", 0.04], [990, 0.08, "square", 0.04]],
  intention: [[520, 0.04, "triangle", 0.04]],
  // le petit générique de l'écran titre
  generique: [[392, 0.14], [523, 0.14], [659, 0.14], [784, 0.28], [659, 0.14], [784, 0.14], [1047, 0.5, "square", 0.07], [784, 0.12, "triangle", 0.06], [1047, 0.45, "triangle", 0.07]],
  defaite: [[392, 0.2, "triangle", 0.1], [330, 0.2, "triangle", 0.1], [262, 0.45, "triangle", 0.1]],
};
function son(nom) {
  if (!sonOn) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") audio.resume();
    let t = audio.currentTime;
    for (const [f, d, type = "square", v = 0.06, f2] of SONS[nom]) {
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t + d + 0.02);
      t += d * 0.92;
    }
  } catch { /* pas de son : tant pis */ }
}

// ---------------------------------------------------------------- les petits morceaux d'écran
const etoiles = n => `<span class="etoiles" aria-label="${n} étoile${n > 1 ? "s" : ""} sur 3">${"★".repeat(n)}<i>${"★".repeat(3 - n)}</i></span>`;
const pv = (vie, max) => `<div class="pv"><span class="coeur">${imgPix("❤️", "", 12)}</span><div class="pv-barre"><i style="width:${(100 * vie) / max}%"></i><b>${vie} / ${max}</b></div></div>`;
// L'Enchanteresse parle dans une boîte de dialogue, lettre par lettre (toucher la boîte affiche tout).
const dialogue = texte => `<div class="dialogue" data-texte="${esc(texte)}"><div class="dia-nom">L'Enchanteresse</div><div class="dia-corps">${imgPix("🔮", "dia-av", 16)}<p class="dia-texte"></p></div><span class="dia-suite">▼</span></div>`;
function animerDialogues() {
  document.querySelectorAll(".dialogue:not(.anime)").forEach(d => {
    d.classList.add("anime");
    const p = d.querySelector(".dia-texte"), t = d.dataset.texte; let i = 0;
    const tic = setInterval(() => { i += 2; p.textContent = t.slice(0, i); if (i >= t.length) { clearInterval(tic); d.classList.add("fini"); } }, 24);
    d.addEventListener("click", () => { clearInterval(tic); p.textContent = t; d.classList.add("fini"); });
  });
}
const sac = () => (P.pouvoirs.length
  ? P.pouvoirs.map(k => `<span class="puce">${imgPix(POUVOIRS[k].emoji, "", 12)} ${POUVOIRS[k].nom}</span>`).join("")
  : `<span class="discret">vide</span>`);
const pancarte = (haut, bas) => `<div class="pancarte"><b>${haut}</b><span>${bas}</span></div>`;
// La scène : le décor de la forêt, le héros à gauche, l'adversaire à droite.
const scene = (a, contenu = "") => `<div class="scene" id="scene">
  <div class="combattant moi" id="fMoi"><img class="sprite" src="${herosImg()}" alt="Toi"><div class="signe-bulle" id="bMoi"></div></div>
  <div class="combattant lui ${a.image ? "" : "emoji miroir"} ${classesPose(a)}" id="fLui">${sprite(a)}<div class="signe-bulle" id="bLui"></div></div>
  ${contenu}
</div>`;

let ecran = "carte", adv = null, C = null, occupe = false, fin = null;
// le coup en cours : le vrai signe de l'adversaire, son intention annoncée, le temps pour répondre
let T = null, minuterie = 0;
const jeu = $("jeu");
function afficher(html) { clearTimeout(minuterie); T = null; jeu.innerHTML = html; animerDialogues(); window.scrollTo(0, 0); }

// ---------------------------------------------------------------- l'écran titre
// À chaque ouverture : le titre du jeu sur le décor de la forêt, le Gant d'Or qui brille, le héros sur le chemin.
function titre() {
  ecran = "titre";
  const n = M.adversaires.filter(a => P.etoiles[a.id]).length;
  const etincelles = [[18, 22], [80, 18], [30, 40], [72, 38], [52, 12], [88, 30]]
    .map(([x, y], i) => `<i class="etincelle" style="left:${x}%;top:${y}%;animation-delay:${(i * 0.37).toFixed(2)}s"></i>`).join("");
  afficher(`<div class="titre-ecran">
    ${etincelles}
    <span class="titre-haut">
      <span class="titre-gant">${imgPix("✋", "", 20)}</span>
      <span class="titre-texte"><span class="titre-petit">La Quête</span><span class="titre-du">du</span><span class="titre-grand">Gant d'Or</span></span>
    </span>
    <img class="sprite titre-heros" src="${herosImg()}" alt="">
    <span class="titre-bas">
      <button class="pbtn vert large titre-commencer" data-av="commencer">▶ Commencer</button>
      ${n ? `<span class="titre-progres">${n} adversaire${n > 1 ? "s" : ""} battu${n > 1 ? "s" : ""} sur ${M.adversaires.length}</span>` : ""}
      ${herosId ? `<button class="lien titre-lien" data-av="choixHeros">Changer de héros</button>` : ""}
      <button class="lien titre-lien" data-av="menu">‹ Menu Chifoumania</button>
    </span>
  </div>`);
}

// ---------------------------------------------------------------- le choix du héros
// La première fois (et sur demande depuis l'écran titre) ; ensuite, on va droit à la carte.
function choixHeros() {
  ecran = "heros";
  const actuel = herosId ? herosChoisi().id : null;
  const cartes = HEROS_CHOIX.map(h => `<button class="cadre heros-choix ${h.id === actuel ? "choisi" : ""}" data-av="heros" data-id="${h.id}">
    <span class="heros-portrait"><img class="sprite" src="${perso?.heros === h.id && perso.image ? perso.image : h.image}" alt=""></span>
    <b>${esc(h.nom)}</b><small>${esc(h.desc)}</small>
  </button>`).join("");
  afficher(`<div class="page">
    ${pancarte("Choisis", "ton héros")}
    <div class="heros-grille">${cartes}</div>
    <button class="pbtn bois large" data-av="titre">← Retour</button>
  </div>`);
}

// ---------------------------------------------------------------- la personnalisation
// Peau, cheveux, yeux : des pastilles de couleurs, et le héros en grand qui change aussitôt.
let essai = null;   // { heros, peau, cheveux, yeux } en cours de réglage
const corpsCharges = {};
const corpsDe = h => (corpsCharges[h.id] ||= new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = h.image; }));
function ecranPerso(id) {
  ecran = "perso";
  const h = HEROS_CHOIX.find(x => x.id === id);
  essai = perso?.heros === id ? { heros: id, peau: perso.peau, cheveux: perso.cheveux, yeux: perso.yeux } : { heros: id, ...ORIGINE };
  const ligne = (cle, titre, couleurs) => `<div class="perso-ligne"><b>${titre}</b><div class="pastilles">
    <button class="pastille origine" data-av="teinte" data-cle="${cle}" data-i="-1" title="Comme le dessin" aria-label="Comme le dessin">✦</button>
    ${couleurs.map((c, i) => `<button class="pastille" data-av="teinte" data-cle="${cle}" data-i="${i}" style="background:rgb(${c.rgb})" title="${esc(c.nom)}" aria-label="${esc(c.nom)}"></button>`).join("")}
  </div></div>`;
  afficher(`<div class="page">
    ${pancarte("Personnalise", esc(h.nom))}
    <div class="heros-portrait perso-apercu"><canvas id="persoApercu" class="sprite"></canvas></div>
    <div class="cadre perso-reglages">
      ${ligne("peau", "Peau", PEAUX)}
      ${ligne("cheveux", "Cheveux", CHEVEUX)}
      ${ligne("yeux", "Yeux", YEUX)}
    </div>
    <button class="pbtn vert large" data-av="persoValider">✔ C'est parti !</button>
    <button class="pbtn bois large" data-av="choixHeros">← Changer de héros</button>
  </div>`);
  majPerso();
}
async function majPerso() {
  if (!essai || ecran !== "perso") return;
  document.querySelectorAll("[data-av=teinte]").forEach(b => b.classList.toggle("actif", Number(b.dataset.i) === essai[b.dataset.cle]));
  const h = HEROS_CHOIX.find(x => x.id === essai.heros), res = personnaliser(await corpsDe(h), h.zones, essai), a = $("persoApercu");
  if (!a) return;
  a.width = res.width; a.height = res.height; a.getContext("2d").drawImage(res, 0, 0);
}
async function validerPerso() {
  const h = HEROS_CHOIX.find(x => x.id === essai.heros);
  const image = estOrigine(essai) ? null : personnaliser(await corpsDe(h), h.zones, essai).toDataURL("image/png");
  perso = { ...essai, image };
  try { localStorage.setItem("chifoumania:aventurePerso", JSON.stringify(perso)); } catch { perso.image = null; ecrire("aventurePerso", perso); }
  herosId = perso.heros; ecrire("aventureHeros", herosId);
  son("pouvoir"); carte();
}

// ---------------------------------------------------------------- la carte du monde
// Où se tient le héros sur la carte : -1 au campement, sinon l'étape (jamais au-delà de ce qui est ouvert).
const dernierOuvert = () => M.adversaires.reduce((n, a, i) => (ouvert(P, M, i) ? i : n), 0);
let pos = Math.max(-1, Math.min(lire("aventurePos", -1), dernierOuvert()));
let enMarche = false;
const pct = p => `left:${(100 * p.x) / LARGEUR}%;top:${(100 * p.y) / HAUTEUR}%`;

// allerVers : l'étape où le héros doit se rendre tout seul en arrivant (après « Combat suivant »).
function carte({ allerVers = null } = {}) {
  ecran = "carte"; enMarche = false;
  pos = Math.max(-1, Math.min(pos, dernierOuvert()));
  const h = heros(P, M);
  const prochaine = M.adversaires.findIndex((a, i) => ouvert(P, M, i) && !P.etoiles[a.id]);
  const noeuds = M.adversaires.map((a, i) => {
    const ok = ouvert(P, M, i) && P.introVue, e = P.etoiles[a.id] || 0;
    return `<button class="noeud ${a.boss ? "boss" : ""} ${e ? "fait" : ""} ${i === prochaine && P.introVue ? "prochain" : ""}" style="${pct(ETAPES[i])}" data-av="aller" data-i="${i}" ${ok ? "" : "disabled"} aria-label="${ok ? esc(a.nom) : "Étape fermée"}">
      ${ok ? tete(a) : `<span class="tete">${imgPix("🔒", "", 14)}</span>`}
      <span class="noeud-num">${a.boss ? "★" : i + 1}</span>
      ${e ? `<span class="noeud-et">${etoiles(e)}</span>` : ""}
    </button>`;
  }).join("");
  afficher(`<div class="page">
    ${pancarte(`Monde ${M.numero}`, esc(M.nom))}
    ${P.introVue ? "" : `${dialogue(M.intro)}<button class="pbtn vert large" data-av="intro">C'est parti !</button>`}
    <div class="carte-monde cadre" id="carteMonde">
      <img class="carte-fond" src="${IMAGE}" alt="">
      ${noeuds}
      <div class="heros-pion" id="pion" style="${pct(position(pos))}"><img class="sprite" src="${herosImg()}" alt="Toi"></div>
    </div>
    <p class="carte-aide" id="carteAide">${P.introVue ? (prochaine >= 0 ? `Touche l'étape ${prochaine + 1} pour avancer.` : "Touche une étape pour rejouer le combat.") : ""}</p>
    <div class="cadre heros-carte">
      ${teteHeros()}
      <div><b>Toi</b><small>vie ${h.vie} · force ${h.force}</small><div class="sac">${sac()}<span class="discret">${P.pouvoirs.length}/${MAX_POUVOIRS}</span></div></div>
    </div>
    ${termine(P, M) ? `<div class="cadre gant">${imgPix("🏆", "", 16)} Tu as repris le Gant d'Or ! Le Monde 2 arrive bientôt. Rejoue les combats pour avoir 3 étoiles partout.</div>` : ""}
    <details class="cadre regles"><summary>Comment ça marche ?</summary>
      <p>Chaque combat se joue à la barre de vie. Coup gagné : l'adversaire perd ta force. Coup perdu : tu perds la sienne. Égalité : rien ne se passe.</p>
      <p>Chaque adversaire a une manie : observe ses coups pour la deviner. L'Enchanteresse te donne un indice avant le combat.</p>
      <p>Avant chaque coup, l'adversaire annonce ce qu'il prépare… mais il peut bluffer. Et tu as peu de temps pour répondre : trop lent, le coup est perdu.</p>
      <p>⚡ Chaque coup gagné remplit ta jauge d'énergie (${ENERGIE_MAX} au plus). Pleine, arme un coup spécial : s'il gagne, ${SPECIAUX.map((x, s) => `${["Pierre", "Ciseaux", "Feuille"][s]} : ${x.nom} (${x.court})`).join(", ")}. S'il perd, l'énergie est perdue.</p>
      <p>Un adversaire battu pour la première fois te rend plus fort (+${GAIN.vie} de vie, +${GAIN.force} de force). Chaque victoire rapporte un pouvoir (${MAX_POUVOIRS} au plus, chacun ne sert qu'une fois).</p>
      ${Object.values(POUVOIRS).map(x => `<p>${imgPix(x.emoji, "", 12)} <b>${x.nom}</b> : ${esc(x.effet)}</p>`).join("")}
      <p>Étoiles : ★ la victoire, ★★ plus de la moitié de ta vie, ★★★ plus de 80 %.</p>
      <p><button class="lien" data-av="zero">Recommencer l'aventure à zéro</button></p>
    </details>
    <div class="barre-bas"><button class="pbtn bois petit" data-av="son">${sonOn ? "🔊 Son" : "🔇 Son"}</button></div>
  </div>`);
  if (P.introVue) $("pion").scrollIntoView({ block: "center" });
  if (allerVers !== null) setTimeout(() => marcher(allerVers), 400);
}

// Le héros marche le long du chemin jusqu'à l'étape i, puis on passe à la mission.
async function marcher(i) {
  if (enMarche || ecran !== "carte" || !P.introVue || !ouvert(P, M, i)) return;
  const points = trajet(pos, i), pion = $("pion");
  enMarche = true; document.querySelectorAll(".noeud").forEach(b => b.classList.add("attente"));
  $("carteAide").textContent = `En route vers ${M.adversaires[i].nom}…`;
  pion.classList.add("marche");
  let [x, y] = [position(pos).x, position(pos).y];
  for (const [nx, ny] of points) {
    if (nx !== x) pion.classList.toggle("gauche", nx < x);
    const ms = Math.max(120, Math.hypot(nx - x, ny - y) * MS_PAR_PIXEL);
    pion.style.transition = `left ${ms}ms linear, top ${ms}ms linear`;
    pion.style.left = `${(100 * nx) / LARGEUR}%`; pion.style.top = `${(100 * ny) / HAUTEUR}%`;
    son("pas");
    await pause(ms);
    [x, y] = [nx, ny];
  }
  pion.classList.remove("marche", "gauche");
  pos = i; ecrire("aventurePos", pos);
  await pause(points.length ? 300 : 0);
  if (ecran !== "carte") return;
  adv = M.adversaires[i]; mission();
}

// ---------------------------------------------------------------- avant le combat : la mission
function mission() {
  ecran = "mission";
  const i = M.adversaires.indexOf(adv);
  afficher(`<div class="page">
    ${pancarte(adv.boss ? "Le boss" : `Combat ${i + 1} / ${M.adversaires.length}`, esc(adv.nom))}
    ${scene(adv, `<p class="bulle-parole">${esc(adv.replique)}</p>`)}
    <p class="fiche-adv">${esc(adv.nom)}, ${esc(adv.titre)} · vie ${adv.vie} · force ${adv.force}</p>
    ${dialogue(adv.mission)}
    <button class="pbtn rouge large" data-av="combattre">⚔️ Combattre</button>
    <button class="pbtn bois large" data-av="carte">🗺️ La carte</button>
  </div>`);
}

// ---------------------------------------------------------------- le combat
function combat() {
  ecran = "combat"; occupe = false; fin = null;
  C = nouveauCombat(adv, heros(P, M));
  const i = M.adversaires.indexOf(adv);
  afficher(`<div class="combat">
    ${scene(adv, `
      <div class="hud">
        <div class="cadre hud-j">${teteHeros()}<div><b>Toi</b><small id="forceMoi"></small><div id="pvMoi"></div></div></div>
        <div class="cadre hud-j">${tete(adv)}<div><b>${esc(adv.court || adv.nom)}</b><small id="forceLui"></small><div id="pvLui"></div></div></div>
      </div>
      <div class="pancarte petite"><b>Monde ${M.numero}</b><span>${adv.boss ? "Le boss" : `Combat ${i + 1} / ${M.adversaires.length}`}</span></div>
      <p class="bulle-parole" id="parole">${esc(adv.replique)}</p>
      <div class="cadre statut" id="statut" aria-live="polite">Choisis ton coup !</div>`)}
    <div class="commandes">
      <div class="chrono" aria-hidden="true"><i id="chrono"></i></div>
      <p class="info" id="info"></p>
      <div class="coups" id="coups">${BOUTONS.map(b => `<button class="pbtn ${b.c} coup" data-av="signe" data-s="${b.s}">${imgPix(EMO[b.s], "", 20)}<span>${NOMS[b.s]}</span><em class="sp">⚡ ${SPECIAUX[b.s].court}</em></button>`).join("")}</div>
      <div class="energie-ligne"><div class="energie" id="energie" aria-label="Énergie"></div><button class="pbtn violet petit" data-av="armer" id="btnSpecial">⚡ Coup spécial</button></div>
      <div class="pouvoirs" id="pouvoirs"></div>
      <div class="barre-bas"><button class="pbtn bois petit" data-av="abandon">🗺️ Fuir</button><div class="histo" id="histo"></div><button class="pbtn bois petit" data-av="son">${sonOn ? "🔊" : "🔇"}</button></div>
    </div>
    <div class="voile" id="voile" hidden></div>
  </div>`);
  occupe = true; majCombat();
  setTimeout(nouveauTour, 900);
}

// Un nouveau coup : l'adversaire choisit son signe, annonce son intention, et le temps file.
function nouveauTour() {
  if (ecran !== "combat" || !C || C.fin) return;
  const lui = signeAdversaire(adv, C);
  T = { lui, intention: intentionDe(adv, C, lui), duree: tempsDe(adv, C) };
  $("parole").hidden = true;   // sa réplique cacherait son intention
  $("bMoi").classList.remove("vue");
  $("bLui").innerHTML = `${imgPix(EMO[T.intention], "", 16)}<b class="q">?</b>`;
  $("bLui").classList.add("vue", "intention");
  anime($("bLui"), "apparait");
  son("intention");
  occupe = false; majCombat();
  lancerChrono();
}
function lancerChrono() {
  clearTimeout(minuterie);
  const barre = $("chrono");
  barre.style.transition = "none"; barre.style.width = "100%"; void barre.offsetWidth;
  barre.style.transition = `width ${T.duree}ms linear`; barre.style.width = "0%";
  barre.classList.toggle("presse", T.duree < 3000);
  minuterie = setTimeout(() => { if (T) jouerCoup(null); }, T.duree);
}
function arreterChrono() {
  clearTimeout(minuterie);
  const barre = $("chrono");
  if (barre) { barre.style.transition = "none"; barre.style.width = getComputedStyle(barre).width; }
}
// en quittant l'appli pendant un coup, le temps s'arrête ; au retour, il repart du début
document.addEventListener("visibilitychange", () => {
  if (ecran !== "combat" || !T) return;
  if (document.hidden) arreterChrono(); else lancerChrono();
});

function majCombat() {
  $("forceMoi").textContent = `force ${C.force[0]}`;
  $("forceLui").textContent = `force ${C.force[1]}`;
  $("pvMoi").innerHTML = pv(C.vie[0], C.max[0]);
  $("pvLui").innerHTML = pv(C.vie[1], C.max[1]);
  const infos = [];
  if (T && !C.fin) {
    const qui = esc(adv.court || adv.nom);
    let t = `${qui} annonce ${EMO[T.intention]} ${NOMS[T.intention]}…`;
    if (C.etourdi) t += " (étourdi : c'est vrai)";
    else if (C.loupe > 0) t += T.intention === T.lui ? " 👁️ C'est vrai !" : " 👁️ C'est du bluff !";
    $("statut").textContent = t;
  }
  if (C.loupe > 0 && !C.fin) infos.push(`👁️ Œil de Lynx : encore ${C.loupe} coup${C.loupe > 1 ? "s" : ""}`);
  if (C.bouclier) infos.push("🪵 Écorce de Chêne prête");
  if (C.double) infos.push("🐗 Frappe du Sanglier prête");
  if (C.racines > 0) infos.push(`🌿 Pouvoirs bloqués (${C.racines})`);
  const morsure = adv.morsure && C.coups.length >= 2 && C.coups.at(-1).gagnant === 1 && C.coups.at(-2).gagnant === 1;
  if (morsure && !C.fin) infos.push("🐺 Sa morsure est prête !");
  $("info").innerHTML = infos.join(" · ");
  $("fMoi").classList.toggle("protege", C.bouclier);
  $("fMoi").classList.toggle("charge", C.double);
  $("fLui").classList.toggle("enrage", C.enRage);
  $("pouvoirs").innerHTML = P.pouvoirs.map((k, i) => {
    const non = peutUtiliser(C, k);
    return `<button class="pbtn bois pouvoir" data-av="pouvoir" data-i="${i}" ${non || occupe ? "disabled" : ""} title="${esc(non || POUVOIRS[k].effet)}">${imgPix(POUVOIRS[k].emoji, "", 14)}<span>${POUVOIRS[k].nom}</span></button>`;
  }).join("");
  $("histo").innerHTML = C.coups.slice(-6).map(k => `<span class="${k.gagnant === 0 ? "g" : k.gagnant === 1 ? "p" : "e"}">${EMO[k.moi]}<small>${EMO[k.lui]}</small></span>`).join("");
  document.querySelectorAll("[data-av=signe]").forEach(b => { b.disabled = occupe || !!C.fin || !T; });
  $("energie").innerHTML = Array.from({ length: ENERGIE_MAX }, (_, i) => `<i class="${i < C.energie ? "plein" : ""}"></i>`).join("");
  $("energie").setAttribute("aria-label", `Énergie ${C.energie} sur ${ENERGIE_MAX}`);
  $("btnSpecial").disabled = !peutArmer(C) || occupe;
  $("btnSpecial").classList.toggle("pret", peutArmer(C) && !C.arme);
  $("btnSpecial").textContent = C.arme ? "⚡ Spécial armé !" : "⚡ Coup spécial";
  $("coups").classList.toggle("arme", C.arme);
}

// Rejoue une animation CSS sur un élément.
function anime(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
function nombre(cible, texte, cls) {
  const n = document.createElement("span");
  n.className = `nombre ${cls}`; n.textContent = texte;
  $(cible).appendChild(n); setTimeout(() => n.remove(), 1100);
}
const bulle = (id, signe) => { $(id).innerHTML = signe === null ? imgPix("✊", "", 16) : imgPix(EMO[signe], "", 16); $(id).classList.add("vue"); };

async function jouerCoup(moi) {
  if (occupe || C.fin || !T) return;
  arreterChrono();
  const lui = T.lui; T = null;
  occupe = true; majCombat();
  son("clic");
  $("parole").hidden = true;
  $("bLui").classList.remove("intention");
  // « Pierre… feuille… ciseaux ! » : les deux poings tremblent, puis les signes apparaissent.
  bulle("bMoi", null); bulle("bLui", null);
  anime($("bMoi"), "secoue"); anime($("bLui"), "secoue");
  $("statut").textContent = moi === null ? "Trop lent !" : "Pierre… Feuille… Ciseaux…";
  await pause(moi === null ? 300 : 450);
  const r = jouer(C, adv, moi, lui); C = r.combat;
  const k = r.coup;
  if (k.moi === null) { $("bMoi").innerHTML = imgPix("⌛", "", 16); $("bMoi").classList.add("vue"); } else bulle("bMoi", k.moi);
  bulle("bLui", k.lui);
  $("bMoi").classList.remove("secoue"); $("bLui").classList.remove("secoue");
  son("coup");
  await pause(280);
  let texte;
  if (k.gagnant === 0) {
    anime($("fMoi"), "attaque");
    await pause(170);
    anime($("fLui"), "touche"); anime($("scene"), "tremble");
    nombre("fLui", `-${k.degats[1]}`, k.effets.includes("double") ? "gros" : "");
    son("touche");
    if (k.special !== null) {
      son("special"); anime($("scene"), "eclair");
      if (k.soin) nombre("fMoi", `+${k.soin}`, "vert");
      if (k.special === 1) nombre("fLui", "Étourdi !", "bleu");
      texte = `${SPECIAUX[k.special].nom} ! −${k.degats[1]}${k.soin ? ` · +${k.soin} vie` : ""}`;
    } else texte = k.effets.includes("double") ? `Frappe du Sanglier ! −${k.degats[1]}` : `Touché ! −${k.degats[1]}`;
  } else if (k.gagnant === 1) {
    anime($("fLui"), "attaque");
    await pause(170);
    if (k.effets.includes("bouclier")) { anime($("fMoi"), "bloque"); nombre("fMoi", "Bloqué !", "bleu"); son("bloque"); texte = "L'Écorce de Chêne te protège !"; }
    else {
      anime($("fMoi"), "touche"); anime($("scene"), "tremble");
      nombre("fMoi", `-${k.degats[0]}`, k.effets.includes("morsure") ? "gros" : "");
      son("aie");
      texte = k.effets.includes("lent") ? `Trop lent ! −${k.degats[0]}` : k.effets.includes("morsure") ? `Morsure ! −${k.degats[0]}` : `Aïe ! −${k.degats[0]}`;
    }
  } else {
    anime($("fMoi"), "sursaut"); anime($("fLui"), "sursaut");
    if (k.effets.includes("poison")) { nombre("fMoi", `-${k.degats[0]}`, "vert"); son("aie"); texte = `Égalité empoisonnée ! −${k.degats[0]}`; }
    else { son("egalite"); texte = "Égalité !"; }
  }
  $("statut").textContent = texte;
  majCombat();
  if (k.effets.includes("rage")) {
    await pause(450);
    $("parole").textContent = adv.repliqueRage; $("parole").hidden = false;
    anime($("scene"), "tremble"); son("rage");
    $("statut").textContent = k.effets.includes("racines") ? `Son cœur s'allume : force ${C.force[1]} ! Ses racines bloquent tes pouvoirs.` : `${adv.nom} enrage !`;
    await pause(1300);   // le temps de lire avant le coup suivant
  }
  await pause(450);
  occupe = false;
  if (C.fin) {
    anime($(C.fin === "victoire" ? "fLui" : "fMoi"), "ko");
    $("statut").textContent = C.fin === "victoire" ? "K.-O. ! Victoire !" : "K.-O. …";
    await pause(900);
    finir();
  } else { occupe = true; majCombat(); await pause(650); nouveauTour(); }
}

function utiliserPouvoir(i) {
  const k = P.pouvoirs[i];
  if (occupe || peutUtiliser(C, k)) return;
  C = utiliser(C, k);
  P.pouvoirs.splice(i, 1); sauver();          // un pouvoir utilisé est perdu, même si on fuit ensuite
  son("pouvoir");
  nombre("fMoi", `${POUVOIRS[k].emoji} ${POUVOIRS[k].nom}`, "bleu");
  if (k === "potion") nombre("fMoi", "+30", "vert");
  majCombat();
}

// ---------------------------------------------------------------- la fin du combat
function finir() {
  if (C.fin === "defaite") { fin = { defaite: true, pique: piqueAuHasard() }; son("defaite"); }
  else {
    const e = etoilesDe(C.vie[0], C.max[0]);
    fin = { etoiles: e, record: !!P.etoiles[adv.id] && e > P.etoiles[adv.id], plein: P.pouvoirs.length >= MAX_POUVOIRS };
    if (adv.recompense === "choix" && !fin.plein) fin.choisir = true; else Object.assign(fin, recompenser(null));
    son("victoire");
  }
  voile();
}
function recompenser(choix) {
  const r = apresVictoire(P, adv, fin.etoiles, choix);
  P = r.progression; sauver();
  return { nouveau: r.nouveau, pouvoir: r.pouvoir };
}
function voile() {
  const v = $("voile"), i = M.adversaires.indexOf(adv), suivant = M.adversaires[i + 1];
  let html;
  if (fin.defaite) html = `<h2 class="titre-fin rouge">K.-O. !</h2>${dialogue(fin.pique)}
    <p class="petit-texte">Tu ne perds rien : recommence autant que tu veux. Observe bien ses coups.</p>
    <button class="pbtn rouge large" data-av="combattre">🔁 Recommencer</button><button class="pbtn bois large" data-av="carte">🗺️ La carte</button>`;
  else if (fin.choisir) html = `<h2 class="titre-fin">Victoire !</h2><p class="grandes-etoiles">${etoiles(fin.etoiles)}</p>${dialogue(adv.bravo)}
    <div class="choix">${Object.entries(POUVOIRS).map(([k, x]) => `<button class="pbtn bois large" data-av="choix" data-k="${k}">${imgPix(x.emoji, "", 14)} ${x.nom}<small>${esc(x.effet)}</small></button>`).join("")}</div>`;
  else {
    const gains = [];
    if (fin.nouveau && !adv.boss) gains.push(`Tu deviens plus fort : +${GAIN.vie} de vie, +${GAIN.force} de force.`);
    if (fin.pouvoir) gains.push(`Nouveau pouvoir : ${POUVOIRS[fin.pouvoir].emoji} ${POUVOIRS[fin.pouvoir].nom}.`);
    else if (adv.recompense !== "gant" && fin.plein) gains.push(`Ton sac est plein (${MAX_POUVOIRS} pouvoirs).`);
    if (fin.record) gains.push("Nouveau record d'étoiles !");
    html = `<h2 class="titre-fin">${adv.boss ? "Le Gant d'Or !" : "Victoire !"}</h2><p class="grandes-etoiles">${etoiles(fin.etoiles)}</p>${dialogue(adv.bravo)}
      ${gains.map(t => `<p class="gain">${esc(t)}</p>`).join("")}
      ${adv.boss ? `<p class="petit-texte">Le Monde 2 arrive bientôt.</p>` : ""}
      ${suivant ? `<button class="pbtn vert large" data-av="suivant" data-i="${i + 1}">En route vers ${esc(suivant.nom)}</button>` : ""}
      <button class="pbtn bois large" data-av="carte">🗺️ La carte</button>`;
  }
  v.innerHTML = `<div class="cadre fin">${html}</div>`;
  v.hidden = false; animerDialogues();
}

// ---------------------------------------------------------------- les boutons
jeu.addEventListener("click", e => {
  const b = e.target.closest("[data-av]"); if (!b || b.disabled) return;
  const act = b.dataset.av;
  if (act !== "signe" && act !== "pouvoir" && act !== "commencer") son("clic");
  if (act === "commencer") { son("generique"); document.querySelector(".titre-ecran").classList.add("part"); setTimeout(herosId ? carte : choixHeros, 650); return; }
  // retour au menu Chifoumania (la page d'avant, ou la page principale du dossier parent)
  if (act === "menu") { if (history.length > 1) history.back(); else location.href = "../"; return; }
  if (act === "choixHeros") { choixHeros(); return; }
  if (act === "titre") { titre(); return; }
  if (act === "heros") { ecranPerso(b.dataset.id); return; }
  if (act === "teinte") { essai[b.dataset.cle] = Number(b.dataset.i); majPerso(); return; }
  if (act === "persoValider") { validerPerso(); return; }
  if (act === "intro") { P.introVue = true; sauver(); carte({ allerVers: 0 }); }
  else if (act === "aller") marcher(Number(b.dataset.i));
  else if (act === "suivant") carte({ allerVers: Number(b.dataset.i) });
  else if (act === "combattre") combat();
  else if (act === "carte") carte();
  else if (act === "signe") jouerCoup(Number(b.dataset.s));
  else if (act === "pouvoir") utiliserPouvoir(Number(b.dataset.i));
  else if (act === "armer") { if (!occupe && peutArmer(C)) { C = armer(C); son("arme"); majCombat(); } }
  else if (act === "abandon") {
    if (occupe) return;
    arreterChrono();
    if (confirm("Fuir le combat ? Les pouvoirs déjà utilisés sont perdus.")) { T = null; mission(); }
    else if (T) lancerChrono();
  }
  else if (act === "choix") { Object.assign(fin, recompenser(b.dataset.k), { choisir: false }); voile(); }
  else if (act === "son") { sonOn = !sonOn; ecrire("aventureSon", sonOn); b.textContent = b.textContent.replace(/🔊|🔇/, sonOn ? "🔊" : "🔇"); son("clic"); }
  else if (act === "zero") { if (confirm("Recommencer l'aventure à zéro ? Tes étoiles et tes pouvoirs seront effacés.")) { P = normaliser(null); sauver(); pos = -1; ecrire("aventurePos", pos); carte(); } }
});

titre();
