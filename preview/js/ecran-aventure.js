// L'écran du Mode Aventure (Jouer › Aventure) : la carte du monde, la mission de Monique, le combat, la fin du combat.
// Tout se passe sur le téléphone, sans compte ni serveur ; la progression est gardée avec lire/ecrire (« aventure »).
import { EMOJI, NOM } from "./regles.js";
import { lire, ecrire } from "./stockage.js";
import {
  MONDES, POUVOIRS, MAX_POUVOIRS, GAIN, normaliser, heros, ouvert, termine, etoilesDe, apresVictoire,
  nouveauCombat, signeAdversaire, indiceLoupe, peutUtiliser, utiliser, jouer, piqueAuHasard,
} from "./aventure-logique.js";

const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const SIGNES = [0, 2, 1];   // l'ordre des boutons : Pierre, Feuille, Ciseaux (comme au match)

// ctx : { sons: { coup(signe), public(type, vol), ooh() } }
export function installerAventure(ctx = {}) {
  const M = MONDES[0];
  let P = normaliser(lire("aventure"));
  let ecran = "carte", adv = null, C = null, dernier = null, fin = null, attente = false;
  const sauver = () => ecrire("aventure", P);
  const son = (f, ...a) => { try { ctx.sons?.[f]?.(...a); } catch { /* un son raté ne bloque rien */ } };
  const pleinEcran = on => { document.body.classList.toggle("en-match", on); document.body.classList.toggle("en-aventure", on); };

  const monique = texte => `<div class="av-monique"><span class="av-mo-av" aria-hidden="true">🎙️</span><div><b>Monique Latouffe</b><p>« ${esc(texte)} »</p></div></div>`;
  const portrait = (a, grand = false) => a.image
    ? `<img class="av-portrait${grand ? " grand" : ""}" src="${a.image}" alt="${esc(a.nom)}">`
    : `<span class="av-portrait emoji${grand ? " grand" : ""}" aria-hidden="true">${a.emoji}</span>`;
  const etoiles = n => `<span class="av-etoiles" aria-label="${n} étoile${n > 1 ? "s" : ""} sur 3">${"★".repeat(n)}<i>${"★".repeat(3 - n)}</i></span>`;
  const barre = (vie, max, cote) => `<div class="av-barre ${cote}"><i style="width:${Math.round((100 * vie) / max)}%"></i><span>❤️ ${vie} / ${max}</span></div>`;
  const sac = () => P.pouvoirs.length
    ? P.pouvoirs.map(k => `<span class="av-pouvoir" title="${esc(POUVOIRS[k].effet)}">${POUVOIRS[k].emoji} ${POUVOIRS[k].nom}</span>`).join("")
    : `<span class="hint">vide pour l'instant</span>`;

  // ---------------------------------------------------------------- la carte du monde
  function htmlCarte() {
    const h = heros(P, M);
    if (!P.introVue) return `<section class="card av-carte">
      <h2>${M.emoji} Monde ${M.numero} · ${esc(M.nom)}</h2>
      ${monique(M.intro)}
      <button class="btn" data-av="intro">C'est parti</button>
    </section>`;
    const liste = M.adversaires.map((a, i) => {
      const ok = ouvert(P, M, i), e = P.etoiles[a.id] || 0;
      return `<button class="av-etape${a.boss ? " boss" : ""}${e ? " faite" : ""}" data-av="choisir" data-id="${a.id}" ${ok ? "" : "disabled"}>
        <span class="av-num">${a.boss ? "👑" : i + 1}</span>
        ${ok ? portrait(a) : `<span class="av-portrait emoji" aria-hidden="true">🔒</span>`}
        <span class="av-nom"><b>${ok ? esc(a.nom) : "???"}</b><small>${ok ? `${esc(a.titre)} · ❤️ ${a.vie} · 💪 ${a.force}` : "Bats l'adversaire précédent"}</small></span>
        ${e ? etoiles(e) : ""}
      </button>`;
    }).join("");
    return `<section class="card av-carte">
      <h2>${M.emoji} Monde ${M.numero} · ${esc(M.nom)}</h2>
      <p class="av-heros">🧑 Toi : <b>❤️ ${h.vie}</b> de vie · <b>💪 ${h.force}</b> de force</p>
      <p class="av-sac"><span>🎒 Pouvoirs (${P.pouvoirs.length}/${MAX_POUVOIRS}) :</span> ${sac()}</p>
      <div class="av-etapes">${liste}</div>
      ${termine(P, M) ? `<p class="av-gant">🏆 Tu as repris le Gant d'Or ! Le Monde 2 arrive bientôt. Tu peux rejouer les combats pour gagner 3 étoiles partout.</p>` : ""}
      <details class="av-regles"><summary>ℹ️ Comment ça marche ?</summary>
        <p class="hint">Chaque combat se joue à la barre de vie. Coup gagné : l'adversaire perd ta force. Coup perdu : tu perds la sienne. Égalité : rien ne se passe. Le premier à 0 a perdu.</p>
        <p class="hint">Chaque adversaire a une manie : observe ses coups pour la deviner. Monique te donne un indice avant chaque combat.</p>
        <p class="hint">Chaque adversaire battu pour la première fois te rend plus fort (+${GAIN.vie} de vie, +${GAIN.force} de force). Chaque victoire rapporte un pouvoir (${MAX_POUVOIRS} au plus, chacun ne sert qu'une fois) : ${Object.values(POUVOIRS).map(x => `${x.emoji} ${x.nom} : ${x.effet.charAt(0).toLowerCase()}${x.effet.slice(1)}`).join(" ")}</p>
        <p class="hint">Étoiles : ★ la victoire, ★★ s'il te reste plus de la moitié de ta vie, ★★★ plus de 80 %. Perdu ? Tu recommences autant que tu veux.</p>
        <p class="hint"><button class="linkbtn" data-av="recommencer">Recommencer l'aventure à zéro</button></p>
      </details>
    </section>`;
  }

  // ---------------------------------------------------------------- avant le combat : la mission
  function htmlMission() {
    return `<section class="card av-mission">
      <div class="av-face">${portrait(adv, true)}<div><h2>${esc(adv.nom)}</h2><p class="hint">${esc(adv.titre)} · ❤️ ${adv.vie} · 💪 ${adv.force}</p></div></div>
      ${monique(adv.mission)}
      <p class="av-sac"><span>🎒 Tes pouvoirs :</span> ${sac()}</p>
      <button class="btn" data-av="combattre">⚔️ Combattre</button>
      <button class="btn alt" data-av="carte">← La carte</button>
    </section>`;
  }

  // ---------------------------------------------------------------- le combat
  function htmlCombat() {
    const effets = [
      C.loupe > 0 ? `🔍 ${C.loupe}` : "", C.bouclier ? "🛡️ levé" : "", C.double ? "⚔️ prêt" : "",
      C.racines > 0 ? `🌿 racines (${C.racines})` : "", C.enRage ? "😡 en rage" : "",
    ].filter(Boolean);
    const loupe = C.loupe > 0 && !C.fin ? (() => { const l = indiceLoupe(adv, C); return `<p class="av-loupe">🔍 ${esc(adv.nom)} prépare plutôt ${EMOJI[l.signe]} ${NOM[l.signe]} (${l.pourcent} %)</p>`; })() : "";
    const bulle = !C.coups.length ? adv.replique : dernier?.effets.includes("rage") ? adv.repliqueRage : "";
    let verdict = "Choisis ton signe.";
    if (dernier) {
      const d = dernier, mots = [];
      if (d.gagnant === 0) mots.push(`✅ Touché ! ${esc(adv.nom)} perd ${d.degats[1]}${d.effets.includes("double") ? " (coup double)" : ""}.`);
      else if (d.gagnant === 1) mots.push(d.effets.includes("bouclier") ? "🛡️ Le Bouclier te protège : pas de dégâts." : `❌ Aïe ! Tu perds ${d.degats[0]}${d.effets.includes("morsure") ? " (morsure du Loup)" : ""}.`);
      else mots.push(d.effets.includes("poison") ? `🍄 Égalité empoisonnée : tu perds ${d.degats[0]}.` : "🤝 Égalité : rien ne se passe.");
      if (d.effets.includes("rage")) mots.push(`😡 ${esc(adv.nom)} entre en rage : sa force passe à ${C.force[1]} !`);
      if (d.effets.includes("racines")) mots.push("🌿 Des racines bloquent tes pouvoirs pendant 2 coups.");
      verdict = mots.join(" ");
    }
    const serieLoup = adv.morsure && C.coups.length >= 2 && C.coups.at(-1).gagnant === 1 && C.coups.at(-2).gagnant === 1;
    if (serieLoup && !C.fin) verdict += " 🐺 Attention : sa morsure est prête !";
    const pouvoirs = P.pouvoirs.map((k, i) => {
      const non = peutUtiliser(C, k);
      return `<button class="av-pbtn" data-av="pouvoir" data-i="${i}" ${non || attente ? "disabled" : ""} title="${esc(non || POUVOIRS[k].effet)}">${POUVOIRS[k].emoji}<small>${POUVOIRS[k].nom}</small></button>`;
    }).join("");
    const histo = C.coups.slice(-10).map(k => `<span class="${k.gagnant === 0 ? "g" : k.gagnant === 1 ? "p" : "e"}">${EMOJI[k.moi]}<small>${EMOJI[k.lui]}</small></span>`).join("");
    return `<section class="av-combat">
      <div class="av-adv">
        ${portrait(adv)}
        <div class="av-adv-info"><b>${esc(adv.nom)}</b> <small>💪 ${C.force[1]}</small>${barre(C.vie[1], C.max[1], "lui")}</div>
        ${bulle ? `<p class="av-bulle">« ${esc(bulle)} »</p>` : ""}
      </div>
      <div class="arena av-arene"><div class="hand ${dernier?.gagnant === 0 ? "win" : dernier?.gagnant === 1 ? "lose" : ""}">${dernier ? EMOJI[dernier.moi] : "❔"}</div><div class="vs">contre</div><div class="hand ${dernier?.gagnant === 1 ? "win" : dernier?.gagnant === 0 ? "lose" : ""}">${dernier ? EMOJI[dernier.lui] : "❔"}</div></div>
      <p class="av-verdict" aria-live="polite">${verdict}</p>
      ${loupe}
      <div class="av-moi"><b>🧑 Toi</b> <small>💪 ${C.force[0]}</small>${barre(C.vie[0], C.max[0], "moi")}</div>
      ${effets.length ? `<p class="av-effets">${effets.join(" · ")}</p>` : ""}
      ${pouvoirs ? `<div class="av-pouvoirs">${pouvoirs}</div>` : ""}
      <div class="moves">${SIGNES.map(s => `<button data-av="signe" data-s="${s}" ${attente ? "disabled" : ""}><span class="e">${EMOJI[s]}</span><span class="l">${NOM[s]}</span></button>`).join("")}</div>
      ${histo ? `<div class="av-histo" aria-label="Les derniers coups (toi en grand, lui en petit)">${histo}</div>` : ""}
      <p style="text-align:center;margin:14px 0 0"><button class="linkbtn" data-av="abandon">Abandonner le combat</button></p>
    </section>`;
  }

  // ---------------------------------------------------------------- la fin du combat
  function htmlFin() {
    if (fin.defaite) return `<section class="card av-fin">
      <h2>💥 Perdu contre ${esc(adv.nom)}</h2>
      ${monique(fin.pique)}
      <p class="hint">Tu ne perds rien : recommence autant de fois que tu veux. Observe bien ses coups.</p>
      <button class="btn" data-av="combattre">🔁 Recommencer</button>
      <button class="btn alt" data-av="carte">← La carte</button>
    </section>`;
    if (fin.choisir) return `<section class="card av-fin">
      <h2>🏅 ${esc(adv.nom)} est battu${adv.feminin ? "e" : ""} !</h2>
      <p class="av-grandes-etoiles">${etoiles(fin.etoiles)}</p>
      ${monique(adv.bravo)}
      <div class="av-choix">${Object.entries(POUVOIRS).map(([k, x]) => `<button class="btn alt" data-av="choix" data-k="${k}">${x.emoji} ${x.nom}<small>${esc(x.effet)}</small></button>`).join("")}</div>
    </section>`;
    const i = M.adversaires.indexOf(adv), suivant = M.adversaires[i + 1];
    const gain = [];
    if (fin.nouveau && !adv.boss) gain.push(`💪 Tu deviens plus fort : +${GAIN.vie} de vie, +${GAIN.force} de force.`);
    if (fin.pouvoir) gain.push(`🎒 Nouveau pouvoir : ${POUVOIRS[fin.pouvoir].emoji} ${POUVOIRS[fin.pouvoir].nom}.`);
    else if (adv.recompense !== "gant" && fin.pleinAvant) gain.push(`🎒 Ton sac est plein (${MAX_POUVOIRS} pouvoirs) : pas de nouveau pouvoir.`);
    if (fin.record) gain.push("⭐ Nouveau record d'étoiles !");
    return `<section class="card av-fin">
      <h2>${adv.boss ? "🏆 Le Gant d'Or est à toi !" : `🏅 ${esc(adv.nom)} est battu${adv.feminin ? "e" : ""} !`}</h2>
      <p class="av-grandes-etoiles">${etoiles(fin.etoiles)}</p>
      ${monique(adv.bravo)}
      ${gain.map(t => `<p class="av-gain">${t}</p>`).join("")}
      ${adv.boss ? `<p class="hint">Le Monde 2 arrive bientôt. En attendant, rejoue les combats pour décrocher 3 étoiles partout.</p>` : ""}
      ${suivant ? `<button class="btn" data-av="choisir" data-id="${suivant.id}">Combat suivant : ${suivant.emoji} ${esc(suivant.nom)}</button>` : ""}
      <button class="btn alt" data-av="carte">← La carte</button>
    </section>`;
  }

  function render() {
    pleinEcran(ecran === "combat");
    $("avContenu").innerHTML = { carte: htmlCarte, mission: htmlMission, combat: htmlCombat, fin: htmlFin }[ecran]();
  }

  function demarrer() { C = nouveauCombat(adv, heros(P, M)); dernier = null; attente = false; ecran = "combat"; render(); window.scrollTo(0, 0); }

  function finir() {
    if (C.fin === "defaite") { fin = { defaite: true, pique: piqueAuHasard() }; son("ooh"); }
    else {
      const e = etoilesDe(C.vie[0], C.max[0]);
      fin = { etoiles: e, record: !!P.etoiles[adv.id] && e > P.etoiles[adv.id], pleinAvant: P.pouvoirs.length >= MAX_POUVOIRS };
      if (adv.recompense === "choix" && !fin.pleinAvant) fin.choisir = true;
      else Object.assign(fin, recompenser(null));
      son("public", adv.boss ? "ovation" : "set", 0.5);
    }
    ecran = "fin"; render(); window.scrollTo(0, 0);
  }
  function recompenser(choix) {
    const r = apresVictoire(P, adv, fin.etoiles, choix);
    P = r.progression; sauver();
    return { nouveau: r.nouveau, pouvoir: r.pouvoir };
  }

  function jouerSigne(moi) {
    if (attente || C.fin) return;
    attente = true;
    son("coup", moi);
    const lui = signeAdversaire(adv, C);
    const r = jouer(C, adv, moi, lui);
    C = r.combat; dernier = r.coup;
    if (dernier.gagnant !== null) son("public", "point", 0.35);
    attente = !!C.fin;                     // le combat est fini : on laisse voir le dernier coup, puis l'écran de fin
    render();
    if (C.fin) setTimeout(finir, 900);
  }

  $("avContenu").addEventListener("click", e => {
    const b = e.target.closest("[data-av]"); if (!b || b.disabled) return;
    const act = b.dataset.av;
    if (act === "intro") { P.introVue = true; sauver(); render(); }
    else if (act === "choisir") { adv = M.adversaires.find(a => a.id === b.dataset.id); ecran = "mission"; render(); window.scrollTo(0, 0); }
    else if (act === "combattre") demarrer();
    else if (act === "carte") { ecran = "carte"; render(); window.scrollTo(0, 0); }
    else if (act === "signe") jouerSigne(Number(b.dataset.s));
    else if (act === "pouvoir") {
      const i = Number(b.dataset.i), k = P.pouvoirs[i];
      if (peutUtiliser(C, k)) return;
      C = utiliser(C, k);
      P.pouvoirs.splice(i, 1); sauver();   // un pouvoir utilisé est perdu, même si on abandonne ensuite
      render();
    } else if (act === "abandon") {
      if (!confirm("Abandonner le combat ? Les pouvoirs déjà utilisés sont perdus.")) return;
      ecran = "mission"; render();
    } else if (act === "choix") { Object.assign(fin, recompenser(b.dataset.k), { choisir: false }); render(); }
    else if (act === "recommencer") {
      if (!confirm("Recommencer l'aventure à zéro ? Tes étoiles et tes pouvoirs seront effacés.")) return;
      P = normaliser(null); sauver(); render();
    }
  });

  return {
    // En revenant sur l'écran : là où on en était (un combat interrompu repart de la mission).
    ouvrir() { if (ecran === "combat" && !C?.fin) ecran = "mission"; render(); },
    quitter() { pleinEcran(false); },
  };
}
