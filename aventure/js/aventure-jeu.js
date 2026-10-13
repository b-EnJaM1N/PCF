// Le Mode Aventure, version pixel art (page à part : aventure.html, sans lien depuis l'appli HandSlam).
// La carte du monde, la mission de Monique, le combat animé sur le décor de la forêt, la fin du combat.
// Les règles sont dans aventure-logique.js (testées) ; la progression est gardée sur le téléphone (« aventure »).
import { lire, ecrire } from "./stockage.js";
import {
  MONDES, POUVOIRS, MAX_POUVOIRS, GAIN, normaliser, heros, ouvert, termine, etoilesDe, apresVictoire,
  nouveauCombat, signeAdversaire, indiceLoupe, peutUtiliser, utiliser, jouer, piqueAuHasard,
} from "./aventure-logique.js";
import { LARGEUR, HAUTEUR, ETAPES, trajet, position, dessinerCarte } from "./aventure-carte.js";

const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pause = ms => new Promise(r => setTimeout(r, ms));
const M = MONDES[0];
const HEROS_IMG = "img/aventure/heros.png";
// 0 Pierre, 1 Ciseaux, 2 Feuille (comme regles.js) ; les boutons dans l'ordre Pierre, Feuille, Ciseaux.
const EMO = ["🪨", "✂️", "✋"], NOMS = ["Pierre", "Ciseaux", "Feuille"];
const BOUTONS = [{ s: 0, c: "bleu" }, { s: 2, c: "vert" }, { s: 1, c: "rouge" }];

let P = normaliser(lire("aventure"));
const sauver = () => ecrire("aventure", P);

// ---------------------------------------------------------------- les émojis, dessinés en gros pixels
// (les adversaires sans dessin, les signes, Monique) : l'émoji est dessiné tout petit, puis agrandi sans lissage.
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
// Monique parle dans une boîte de dialogue, lettre par lettre (toucher la boîte affiche tout).
const dialogue = texte => `<div class="dialogue" data-texte="${esc(texte)}"><div class="dia-nom">Monique Latouffe</div><div class="dia-corps">${imgPix("🎙️", "dia-av", 16)}<p class="dia-texte"></p></div><span class="dia-suite">▼</span></div>`;
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
  <div class="combattant moi" id="fMoi"><img class="sprite" src="${HEROS_IMG}" alt="Toi"><div class="signe-bulle" id="bMoi"></div></div>
  <div class="combattant lui ${a.image ? "" : "emoji miroir"} ${classesPose(a)}" id="fLui">${sprite(a)}<div class="signe-bulle" id="bLui"></div></div>
  ${contenu}
</div>`;

let ecran = "carte", adv = null, C = null, occupe = false, fin = null;
const jeu = $("jeu");
function afficher(html) { jeu.innerHTML = html; animerDialogues(); window.scrollTo(0, 0); }

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
      <canvas id="carteFond" aria-hidden="true"></canvas>
      ${noeuds}
      <div class="heros-pion" id="pion" style="${pct(position(pos))}"><img class="sprite" src="${HEROS_IMG}" alt="Toi"></div>
      <p class="carte-aide" id="carteAide">${P.introVue ? (prochaine >= 0 ? `Touche l'étape ${prochaine + 1} pour avancer.` : "Touche une étape pour rejouer le combat.") : ""}</p>
    </div>
    <div class="cadre heros-carte">
      <span class="tete heros-tete"></span>
      <div><b>Toi</b><small>vie ${h.vie} · force ${h.force}</small><div class="sac">${sac()}<span class="discret">${P.pouvoirs.length}/${MAX_POUVOIRS}</span></div></div>
    </div>
    ${termine(P, M) ? `<div class="cadre gant">${imgPix("🏆", "", 16)} Tu as repris le Gant d'Or ! Le Monde 2 arrive bientôt. Rejoue les combats pour avoir 3 étoiles partout.</div>` : ""}
    <details class="cadre regles"><summary>Comment ça marche ?</summary>
      <p>Chaque combat se joue à la barre de vie. Coup gagné : l'adversaire perd ta force. Coup perdu : tu perds la sienne. Égalité : rien ne se passe.</p>
      <p>Chaque adversaire a une manie : observe ses coups pour la deviner. Monique te donne un indice avant le combat.</p>
      <p>Un adversaire battu pour la première fois te rend plus fort (+${GAIN.vie} de vie, +${GAIN.force} de force). Chaque victoire rapporte un pouvoir (${MAX_POUVOIRS} au plus, chacun ne sert qu'une fois).</p>
      ${Object.values(POUVOIRS).map(x => `<p>${imgPix(x.emoji, "", 12)} <b>${x.nom}</b> : ${esc(x.effet)}</p>`).join("")}
      <p>Étoiles : ★ la victoire, ★★ plus de la moitié de ta vie, ★★★ plus de 80 %.</p>
      <p><button class="lien" data-av="zero">Recommencer l'aventure à zéro</button></p>
    </details>
    <div class="barre-bas"><button class="pbtn bois petit" data-av="son">${sonOn ? "🔊 Son" : "🔇 Son"}</button></div>
  </div>`);
  dessinerCarte($("carteFond"));
  if (P.introVue) $("pion").scrollIntoView({ block: "center" });
  if (allerVers !== null) setTimeout(() => marcher(allerVers), 400);
}

// Le héros marche le long du chemin jusqu'à l'étape i, puis on passe à la mission.
async function marcher(i) {
  if (enMarche || ecran !== "carte") return;
  const points = trajet(pos, i), pion = $("pion");
  enMarche = true; document.querySelectorAll(".noeud").forEach(b => b.classList.add("attente"));
  $("carteAide").textContent = `En route vers ${M.adversaires[i].nom}…`;
  pion.classList.add("marche");
  let [x, y] = [position(pos).x, position(pos).y];
  for (const [nx, ny] of points) {
    if (nx !== x) pion.classList.toggle("gauche", nx < x);
    const ms = Math.max(120, Math.hypot(nx - x, ny - y) * 14);
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
        <div class="cadre hud-j"><span class="tete heros-tete"></span><div><b>Toi</b><small id="forceMoi"></small><div id="pvMoi"></div></div></div>
        <div class="cadre hud-j">${tete(adv)}<div><b>${esc(adv.court || adv.nom)}</b><small id="forceLui"></small><div id="pvLui"></div></div></div>
      </div>
      <div class="pancarte petite"><b>Monde ${M.numero}</b><span>${adv.boss ? "Le boss" : `Combat ${i + 1} / ${M.adversaires.length}`}</span></div>
      <p class="bulle-parole" id="parole">${esc(adv.replique)}</p>
      <div class="cadre statut" id="statut" aria-live="polite">Choisis ton coup !</div>`)}
    <div class="commandes">
      <p class="info" id="info"></p>
      <div class="coups">${BOUTONS.map(b => `<button class="pbtn ${b.c} coup" data-av="signe" data-s="${b.s}">${imgPix(EMO[b.s], "", 20)}<span>${NOMS[b.s]}</span></button>`).join("")}</div>
      <div class="pouvoirs" id="pouvoirs"></div>
      <div class="barre-bas"><button class="pbtn bois petit" data-av="abandon">🗺️ Fuir</button><div class="histo" id="histo"></div><button class="pbtn bois petit" data-av="son">${sonOn ? "🔊" : "🔇"}</button></div>
    </div>
    <div class="voile" id="voile" hidden></div>
  </div>`);
  majCombat();
}

function majCombat() {
  $("forceMoi").textContent = `force ${C.force[0]}`;
  $("forceLui").textContent = `force ${C.force[1]}`;
  $("pvMoi").innerHTML = pv(C.vie[0], C.max[0]);
  $("pvLui").innerHTML = pv(C.vie[1], C.max[1]);
  const infos = [];
  if (C.loupe > 0 && !C.fin) { const l = indiceLoupe(adv, C); infos.push(`👁️ ${esc(adv.nom)} prépare plutôt ${EMO[l.signe]} ${NOMS[l.signe]} (${l.pourcent} %) · encore ${C.loupe} coup${C.loupe > 1 ? "s" : ""}`); }
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
  document.querySelectorAll("[data-av=signe]").forEach(b => { b.disabled = occupe || !!C.fin; });
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
  if (occupe || C.fin) return;
  occupe = true; majCombat();
  son("clic");
  $("parole").hidden = true;
  // « Pierre… feuille… ciseaux ! » : les deux poings tremblent, puis les signes apparaissent.
  bulle("bMoi", null); bulle("bLui", null);
  anime($("bMoi"), "secoue"); anime($("bLui"), "secoue");
  $("statut").textContent = "Pierre… Feuille… Ciseaux…";
  await pause(600);
  const lui = signeAdversaire(adv, C);
  const r = jouer(C, adv, moi, lui); C = r.combat;
  const k = r.coup;
  bulle("bMoi", k.moi); bulle("bLui", k.lui);
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
    texte = k.effets.includes("double") ? `Frappe du Sanglier ! −${k.degats[1]}` : `Touché ! −${k.degats[1]}`;
  } else if (k.gagnant === 1) {
    anime($("fLui"), "attaque");
    await pause(170);
    if (k.effets.includes("bouclier")) { anime($("fMoi"), "bloque"); nombre("fMoi", "Bloqué !", "bleu"); son("bloque"); texte = "L'Écorce de Chêne te protège !"; }
    else {
      anime($("fMoi"), "touche"); anime($("scene"), "tremble");
      nombre("fMoi", `-${k.degats[0]}`, k.effets.includes("morsure") ? "gros" : "");
      son("aie");
      texte = k.effets.includes("morsure") ? `Morsure ! −${k.degats[0]}` : `Aïe ! −${k.degats[0]}`;
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
  }
  await pause(450);
  occupe = false;
  if (C.fin) {
    anime($(C.fin === "victoire" ? "fLui" : "fMoi"), "ko");
    $("statut").textContent = C.fin === "victoire" ? "K.-O. ! Victoire !" : "K.-O. …";
    await pause(900);
    finir();
  } else { $("statut").textContent += " · À toi !"; majCombat(); }
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
  if (act !== "signe" && act !== "pouvoir") son("clic");
  if (act === "intro") { P.introVue = true; sauver(); carte({ allerVers: 0 }); }
  else if (act === "aller") marcher(Number(b.dataset.i));
  else if (act === "suivant") carte({ allerVers: Number(b.dataset.i) });
  else if (act === "combattre") combat();
  else if (act === "carte") carte();
  else if (act === "signe") jouerCoup(Number(b.dataset.s));
  else if (act === "pouvoir") utiliserPouvoir(Number(b.dataset.i));
  else if (act === "abandon") { if (!occupe && confirm("Fuir le combat ? Les pouvoirs déjà utilisés sont perdus.")) mission(); }
  else if (act === "choix") { Object.assign(fin, recompenser(b.dataset.k), { choisir: false }); voile(); }
  else if (act === "son") { sonOn = !sonOn; ecrire("aventureSon", sonOn); b.textContent = b.textContent.replace(/🔊|🔇/, sonOn ? "🔊" : "🔇"); son("clic"); }
  else if (act === "zero") { if (confirm("Recommencer l'aventure à zéro ? Tes étoiles et tes pouvoirs seront effacés.")) { P = normaliser(null); sauver(); pos = -1; ecrire("aventurePos", pos); carte(); } }
});

carte();
