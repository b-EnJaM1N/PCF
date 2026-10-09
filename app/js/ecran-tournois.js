// Tournois en ligne (menu Jouer › Tournois, ou page d'un cercle) : liste, création, inscriptions,
// tableau à élimination directe ou championnat du cercle (chacun contre tous, classement), et « Jouer mon match ».
import * as social from "./social-serveur.js";
import { avatarSVG } from "./avatar.js";
import { blasonSVG } from "./social-logique.js";
import { texteFormat, POINTS_PAR_SET } from "./regles.js";
import { formatCourt } from "./duel-logique.js";
import { nomTour, monTour, DUREES, texteDuree, texteReste, texteFin, monMatch, attente, tableau, resume, lienTournoi, codeTournoiDepuisAdresse,
  mesMatchsRestants, DUREES_CHAMPIONNAT, MAX_CHAMPIONNAT, matchsParJoueur, texteDureeChampionnat, dernierDuClassement, texteDepart } from "./tournoi-logique.js";
import { SUGGESTIONS, erreurEnjeu, nettoyerEnjeu, annonceEnjeu } from "./enjeux.js";
import { lire, ecrire } from "./stockage.js";

const $ = id => document.getElementById(id);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const nomComplet = p => `${esc(p.pseudo)}<small>#${p.numero}</small>`;

// ctx : { uid(), montrer(vue), retour(), lancerDuel(duel, profilAdversaire), profils(ids), apresChangement() }
export function installerTournois(ctx) {
  let ouvert = null, detail = null, decalage = 0, minuterie = 0, cercleForm = null;
  const dire = (t, erreur = false, id = "tMsg") => {
    $(id).textContent = t; $(id).classList.toggle("erreur", erreur);
    if (t) $(id).scrollIntoView({ block: "nearest", behavior: "smooth" });
  };
  const base = () => location.origin + location.pathname;

  // ------------------------------------------------ une liste de tournois (mes tournois, tournois d'un cercle)
  function liste(el, tournois) {
    el.innerHTML = tournois.map(t => `<div class="joueur cliquable${t.a_jouer ? " a-jouer" : ""}" data-tournoi="${t.id}" role="button" tabindex="0">
      <span class="mini">${t.cercle ? blasonSVG(t.cercle.blason) : '<span class="trophee">🏆</span>'}</span>
      <div style="min-width:0"><div class="jn">${esc(t.nom)}</div><div class="jd">${esc(resume(t))}${t.cercle ? ` · ${esc(t.cercle.nom)}` : ""}</div></div>
      <div class="actions"><button class="petit ${t.a_jouer ? "" : "alt"}" data-a="voir">${t.a_jouer ? "Jouer" : "Voir"}</button></div></div>`).join("");
  }
  const ouvrirDepuisListe = e => { const l = e.target.closest("[data-tournoi]"); if (l && (e.type === "click" || e.key === "Enter")) ouvrir(l.dataset.tournoi); };
  ["socTournois", "cTournois"].forEach(z => { $(z).addEventListener("click", ouvrirDepuisListe); $(z).addEventListener("keydown", ouvrirDepuisListe); });

  // ------------------------------------------------ créer un tournoi
  const form = { len: 11, win: 2, duree: 60, type: "libre", ar: 0, jours: 7, hebdo: 0 };
  const champ = () => !!cercleForm && form.type === "championnat";
  function renderForm() {
    const ch = champ();
    $("tnTypeBox").hidden = !cercleForm; $("tnFormuleBox").hidden = !ch; $("tnEnjeuZone").hidden = !ch;
    $("tnType").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.v === form.type));
    $("tnFormule").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", +b.dataset.v === form.ar));
    $("tnRepet").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", +b.dataset.v === form.hebdo));
    const hebdo = ch && !!form.hebdo;   // chaque semaine : la durée est fixe (du lundi 12 h au dimanche 22 h)
    $("tnDureeLbl").hidden = hebdo; $("tnDuree").hidden = hebdo;
    $("tnLen").innerHTML = POINTS_PAR_SET.map(v => `<button data-v="${v}" aria-pressed="${v === form.len}">${v}</button>`).join("");
    $("tnWin").innerHTML = [[1, "1 set"], [2, "2 sets gagnants"], [3, "3 sets gagnants"]].map(([v, l]) => `<button data-v="${v}" aria-pressed="${v === form.win}">${l}</button>`).join("");
    $("tnDureeLbl").textContent = ch ? "Durée du championnat" : "Durée de chaque tour";
    $("tnDuree").innerHTML = (ch ? DUREES_CHAMPIONNAT : DUREES).map(([v, l]) => `<button data-v="${v}" aria-pressed="${v === (ch ? form.jours : form.duree)}">${l}</button>`).join("");
    $("inTNom").placeholder = ch ? "Ex. Le championnat de la semaine" : "Ex. L'Open de la Famille";
    $("tnCreer").textContent = ch ? "Créer le championnat" : "Créer le tournoi";
    $("tnNomLbl").textContent = ch ? "Nom du championnat" : "Nom du tournoi";
    const format = `${texteFormat({ pointsParSet: form.len, setsGagnants: form.win })}. `
      + (formatCourt(form.len, form.win) ? "Format court : les matchs seront amicaux (sans effet sur le niveau officiel). " : "Les matchs compteront pour le niveau officiel. ");
    $("tnHint").textContent = ch
      ? format + `Chacun joue contre tous${form.ar ? " deux fois (aller-retour)" : ""}, quand il veut ${hebdo
          ? "du lundi 12 h au dimanche 22 h. Chaque semaine, une nouvelle édition repart avec les mêmes joueurs (chacun peut se désinscrire jusqu'au lundi midi) : "
          : `pendant ${texteDureeChampionnat(form.jours * 1440)} : `}`
        + `à 6 joueurs, ${matchsParJoueur(6, form.ar)} matchs chacun. De 3 à ${MAX_CHAMPIONNAT} joueurs. Victoire : 2 points. `
        + "Un match pas joué à la fin est gagné par celui qui a essayé de le jouer, perdu pour les deux si personne n'a essayé."
      : format + `Chaque tour dure ${texteDuree(form.duree)} : les deux joueurs jouent leur match quand ils veulent pendant ce temps.`
        + (form.duree <= 15 ? " Idéal quand tout le monde est là." : "");
  }
  [["tnLen", "len"], ["tnWin", "win"], ["tnFormule", "ar"], ["tnRepet", "hebdo"]].forEach(([id, cle]) => $(id).addEventListener("click", e => {
    const b = e.target.closest("button"); if (b) { form[cle] = +b.dataset.v; renderForm(); }
  }));
  $("tnDuree").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { form[champ() ? "jours" : "duree"] = +b.dataset.v; renderForm(); } });
  $("tnType").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { form.type = b.dataset.v; renderForm(); } });
  // L'enjeu du championnat (facultatif) : mêmes idées et mêmes règles que le défi entre amis.
  $("tnEnjeuOn").addEventListener("change", e => { $("tnEnjeuBox").hidden = !e.target.checked; if (e.target.checked) $("tnEnjeu").focus(); });
  $("tnEnjeuIdees").innerHTML = SUGGESTIONS.map((x, i) => `<button type="button" data-i="${i}">${esc(x)}</button>`).join("");
  $("tnEnjeuIdees").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { $("tnEnjeu").value = SUGGESTIONS[+b.dataset.i]; $("tnEnjeu").focus(); } });
  const enjeuChoisi = () => {
    if (!$("tnEnjeuOn").checked) return null;
    const err = erreurEnjeu($("tnEnjeu").value);
    if (err) throw new Error(err);
    return nettoyerEnjeu($("tnEnjeu").value);
  };
  function nouveau(cercle = null) {
    cercleForm = cercle;
    $("tnTitre").textContent = cercle ? `Tournoi du cercle « ${cercle.nom} »` : "Tournoi privé (par lien)";
    $("tnPrecision").textContent = cercle ? "Seuls les membres du cercle pourront s'inscrire." : "Tu inviteras les joueurs en leur envoyant le lien du tournoi.";
    $("inTNom").value = ""; dire("", false, "tnMsg");
    form.type = "libre"; form.hebdo = 0; $("tnEnjeuOn").checked = false; $("tnEnjeuBox").hidden = true; $("tnEnjeu").value = "";
    renderForm();
    ctx.montrer("socTournoiNouveau");
  }
  $("tnRetour").addEventListener("click", () => ctx.retour());
  $("tnCreer").addEventListener("click", async () => {
    const nom = $("inTNom").value.trim();
    if (nom.length < 2) return dire("Donne un nom au tournoi (au moins 2 caractères).", true, "tnMsg");
    $("tnCreer").disabled = true;
    try {
      const ch = champ();
      const t = ch ? await social.creerChampionnat(nom, cercleForm.id, form.len, form.win, form.hebdo ? 7 : form.jours, !!form.ar, enjeuChoisi(), !!form.hebdo)
        : await social.creerTournoi(nom, cercleForm?.id ?? null, form.len, form.win, form.duree);
      ctx.apresChangement();
      await ouvrir(t.id, ch ? `Championnat créé ! Les membres du cercle peuvent maintenant s'inscrire.${form.hebdo ? " Il partira tout seul lundi à 12 h s'il y a au moins 3 joueurs (ou plus tôt si tu le lances)." : ""}`
        : cercleForm ? "Tournoi créé ! Les membres du cercle peuvent maintenant s'inscrire." : "Tournoi créé ! Envoie le lien aux joueurs pour qu'ils s'inscrivent.");
    } catch (e) { dire(e.message, true, "tnMsg"); }
    $("tnCreer").disabled = false;
  });

  // ------------------------------------------------ la page d'un tournoi
  async function ouvrir(id, message = "") {
    ouvert = id; detail = null;
    $("tNom").textContent = "…"; $("tInfo").textContent = ""; $("tEtat").textContent = "";
    ["tMonMatch", "tInscriptions", "tTableauCarte", "tClassementCarte", "tEnjeuCarte", "tSerieCarte"].forEach(x => { $(x).hidden = true; });
    dire(message);
    ctx.montrer("socTournoi"); window.scrollTo(0, 0);
    clearInterval(minuterie);
    await charger();
    // Sit & Go en direct : mise à jour plus fréquente.
    if (ouvert === id) { clearInterval(minuterie); minuterie = setInterval(() => { if (!$("socTournoi").hidden && !document.hidden) charger(); }, detail?.mode === "direct" ? 4000 : 10000); }
  }
  function fermer() { ouvert = null; detail = null; clearInterval(minuterie); }
  $("tRetour").addEventListener("click", () => { fermer(); ctx.retour(); });

  async function charger() {
    const id = ouvert; if (!id) return;
    let t;
    try { t = await social.voirTournoi(id); } catch (e) { if (ouvert === id) dire(e.message, true); return; }
    if (ouvert !== id) return;
    decalage = Date.parse(t.maintenant) - Date.now();
    detail = t;
    render();
  }

  function render() {
    const t = detail, uid = ctx.uid(), maintenant = Date.now() + decalage;
    $("tIcone").innerHTML = t.cercle ? blasonSVG(t.cercle.blason) : '<span class="trophee grand">🏆</span>';
    $("tNom").textContent = t.nom;
    const direct = t.mode === "direct";   // Sit & Go : matchs lancés automatiquement, sans date limite
    const ch = t.mode === "championnat";   // chacun contre tous, avec un classement
    const format = `${texteFormat({ pointsParSet: t.points_par_set, setsGagnants: t.sets_gagnants })}${formatCourt(t.points_par_set, t.sets_gagnants) ? " · amical" : " · officiel"}`;
    if (ch) $("tInfo").textContent = `Championnat du cercle « ${t.cercle?.nom ?? ""} » · ${t.aller_retour ? "aller-retour" : "aller simple"} · ${format} · ${t.serie ? `semaine n°\u00a0${t.edition}` : texteDureeChampionnat(t.duree_minutes)}`;
    else $("tInfo").textContent = `${t.programme ? "Tournoi programmé · " : t.freeroll ? "Freeroll · " : direct ? "Sit & Go public · " : t.cercle ? `Cercle « ${t.cercle.nom} » · ` : "Tournoi privé · "}${texteFormat({ pointsParSet: t.points_par_set, setsGagnants: t.sets_gagnants })}`
      + `${formatCourt(t.points_par_set, t.sets_gagnants) ? " · amical" : " · officiel"}${direct ? "" : ` · tours de ${texteDuree(t.duree_minutes)}`}${t.finale_sets ? ` · finale en ${t.finale_sets} sets gagnants` : ""}`;
    const reste = texteReste(t.echeance, maintenant);
    $("tEtat").textContent = ch ? (t.phase === "inscriptions" ? `Inscriptions ouvertes · ${t.joueurs.length} joueur${t.joueurs.length > 1 ? "s" : ""} (de 3 à ${MAX_CHAMPIONNAT})${t.depart ? ` · départ ${texteDepart(t.depart)}` : ""}`
        : t.phase === "en_cours" ? `Championnat en cours · ${reste ? `fin dans ${reste}` : "fin passée, résultats en cours"}`
        : t.phase === "termine" ? (t.vainqueur ? `🏆 Champion du cercle : ${t.vainqueur.pseudo}#${t.vainqueur.numero}` : "Championnat terminé, sans vainqueur (aucun match joué)") : "Championnat annulé")
      : t.phase === "inscriptions" ? `Inscriptions ouvertes · ${t.joueurs.length} joueur${t.joueurs.length > 1 ? "s" : ""} (de 3 à 32)`
      : t.phase === "en_cours" ? (direct ? `${nomTour(t.tour, t.nb_tours)} · en direct` : `${nomTour(t.tour, t.nb_tours)} · ${reste ? `date limite dans ${reste}` : "date limite passée, résultats en cours"}`)
      : t.phase === "termine" ? (t.vainqueur ? `🏆 Vainqueur : ${t.vainqueur.pseudo}#${t.vainqueur.numero}` : "Tournoi terminé") : "Tournoi annulé";

    // L'enjeu : annoncé pendant le championnat, le dernier désigné à la fin.
    $("tEnjeuCarte").hidden = !t.enjeu;
    if (t.enjeu) {
      const dernier = t.phase === "termine" ? dernierDuClassement(t.classement) : null;
      $("tEnjeu").textContent = dernier ? annonceEnjeu(t.enjeu, dernier.id !== uid, dernier.pseudo) : `🎯 Enjeu : « ${t.enjeu} » — le dernier s'y colle\u00a0!`;
      $("tEnjeuEffacer").hidden = !t.efface_enjeu || t.phase === "termine";
    }

    // La série (championnat de chaque semaine) : la règle, le palmarès, et l'arrêt.
    $("tSerieCarte").hidden = !(ch && t.serie);
    if (ch && t.serie) {
      $("tSerieTexte").textContent = t.hebdo
        ? `Semaine n°\u00a0${t.edition}. Chaque édition se joue du lundi 12 h au dimanche 22 h. À la fin, la suivante est créée avec les mêmes joueurs : chacun peut se désinscrire, et les autres membres s'inscrire, jusqu'au lundi 12 h. Elle part toute seule s'il y a au moins 3 joueurs.`
        : `Semaine n°\u00a0${t.edition}. La répétition est arrêtée : c'est la dernière édition.`;
      $("tPalmares").innerHTML = (t.palmares || []).length ? `<p class="hint" style="margin:8px 0 4px"><b>Palmarès</b></p>` + t.palmares.map(e => `<div class="joueur cliquable" data-tournoi="${e.id}" role="button" tabindex="0">
        <span class="mini"><span class="trophee">🏆</span></span>
        <div style="min-width:0"><div class="jn">Semaine n°\u00a0${e.edition} : ${e.vainqueur ? esc(e.vainqueur.pseudo) : "personne"}</div>
          <div class="jd">${e.dernier ? `${t.enjeu ? "🎯 " : ""}Dernier : ${esc(e.dernier.pseudo)}` : ""}</div></div><span></span></div>`).join("") : "";
      $("tSerieArreter").hidden = !t.arrete_serie;
    }

    // Mon match à jouer
    const mm = monMatch(t, uid), att = mm ? null : attente(t, uid);
    $("tMonMatch").hidden = !mm && !att;
    if (att) {
      // En direct : j'ai gagné, j'attends le vainqueur du match voisin (avec son score en direct).
      const v = att.voisin, d = v?.duel;
      const joueurs = v && v.j0 && v.j1 ? `<b>${nomComplet(v.j0)}</b> contre <b>${nomComplet(v.j1)}</b>` : null;
      const score = d && ["jeu", "entre_sets"].includes(d.phase)
        ? `${(d.sets || [0, 0]).join("–")} en sets${d.phase === "jeu" ? ` · ${(d.points || [0, 0]).join("–")} dans le set` : ""}` : null;
      $("tMonMatchTitre").textContent = `⏳ Bravo ! En attente de ${monTour(att.tour, t.nb_tours)}`;
      $("tMonMatchCorps").innerHTML = joueurs
        ? `<p class="hint">Ton prochain adversaire sortira du match ${joueurs}.</p>
           <p class="sndnote">${score ? `En direct : ${score}.` : d ? "Le match commence." : "Le match va se lancer."} Attente estimée : environ ${att.minutes} min.</p>
           <p class="hint">Reste dans l'appli : ton match se lance tout seul dès que le vainqueur est connu (60 secondes pour le rejoindre).</p>`
        : `<p class="hint">Ton prochain adversaire sortira d'un match qui n'a pas encore commencé : le tableau avance. Reste dans l'appli, ton match se lancera tout seul.</p>`;
    }
    if (mm) {
      const adv = mm.adversaire, duel = mm.match.duel;
      const enCours = duel && ["presentation", "jeu", "entre_sets"].includes(duel.phase);
      const attendMoi = duel && duel.phase === "attente" && duel.j0 !== uid;
      const jattends = duel && duel.phase === "attente" && duel.j0 === uid;
      const restants = mesMatchsRestants(t, uid).length;
      $("tMonMatchTitre").textContent = ch ? `À toi de jouer${restants > 1 ? ` · ${restants} matchs restants` : " · ton dernier match"}` : `À toi de jouer : ${monTour(t.tour, t.nb_tours)}`;
      if (direct) {
        // Sit & Go : le serveur lance le match ; on le rejoint (60 secondes pour arriver).
        $("tMonMatchCorps").innerHTML = `<div class="joueur"><span class="mini">${avatarSVG(adv.avatar || {})}</span>
          <div style="min-width:0"><div class="jn">${esc(adv.drapeau || "")} ${nomComplet(adv)}</div><div class="jd">Niveau ${adv.classement}${adv.tete ? ` · tête de série n°\u00a0${adv.tete}` : ""}</div></div><span></span></div>
          <p class="hint">${duel ? "Ton match est lancé : tu as 60 secondes pour le rejoindre, sinon c'est perdu par forfait." : "Ton match va se lancer tout seul. Reste dans l'appli."}</p>
          ${duel ? `<button class="btn" id="tJouer">Rejoindre le match</button>` : ""}`;
        $("tJouer")?.addEventListener("click", () => jouerMonMatch(mm));
      } else {
      $("tMonMatchCorps").innerHTML = `<div class="joueur"><span class="mini">${avatarSVG(adv.avatar || {})}</span>
        <div style="min-width:0"><div class="jn">${esc(adv.drapeau || "")} ${nomComplet(adv)}</div><div class="jd">Niveau ${adv.classement}${adv.tete ? ` · tête de série n°\u00a0${adv.tete}` : ""}</div></div><span></span></div>
        <p class="hint">${enCours ? "Votre match est en cours." : attendMoi ? `${esc(adv.pseudo)} t'attend pour jouer !`
          : jattends ? `Invitation envoyée : le match démarre dès que ${esc(adv.pseudo)} touche « Jouer mon match ». Garde l'appli ouverte.`
          : `Retrouvez-vous pour jouer avant la date limite${reste ? ` (dans ${reste})` : ""}. Si un seul de vous deux essaie de jouer, la victoire lui revient par forfait.`}</p>
        <button class="btn" id="tJouer" ${jattends ? "disabled" : ""}>${enCours ? "Reprendre le match" : attendMoi ? "Jouer maintenant" : jattends ? `En attente de ${esc(adv.pseudo)}…` : "Jouer mon match"}</button>`;
      $("tJouer").addEventListener("click", () => jouerMonMatch(mm));
      // Championnat : mes autres matchs, jouables dans n'importe quel ordre.
      const autres = ch ? mesMatchsRestants(t, uid).filter(m => m.id !== mm.match.id) : [];
      if (autres.length) {
        $("tMonMatchCorps").insertAdjacentHTML("beforeend", `<p class="hint" style="margin-top:12px">Mes autres matchs, dans l'ordre que tu veux :</p>`
          + autres.map(m => { const a = m.j0?.id === uid ? m.j1 : m.j0, attend = m.duel?.phase === "attente" && m.duel.j0 !== uid;
            return `<div class="joueur"><span class="mini">${avatarSVG(a.avatar || {})}</span>
              <div style="min-width:0"><div class="jn">${nomComplet(a)}</div><div class="jd">${attend ? `${esc(a.pseudo)} t'attend !` : `Niveau ${a.classement}`}</div></div>
              <div class="actions"><button class="petit ${attend ? "" : "alt"}" data-m="${m.id}">Jouer</button></div></div>`; }).join(""));
        $("tMonMatchCorps").querySelectorAll("button[data-m]").forEach(b => b.addEventListener("click", () => {
          const m = autres.find(x => x.id === b.dataset.m), moi = m.j0?.id === uid ? 0 : 1;
          b.disabled = true; jouerMonMatch({ match: m, moi, adversaire: moi === 0 ? m.j1 : m.j0 });
        }));
      }
      }
    }
    $("tRegleAbsence").textContent = direct
      ? "Chaque match se lance dès que les deux joueurs sont libres. Un joueur absent au bout de 60 secondes perd par forfait ; si aucun des deux ne vient, le mieux classé passe."
      : "Un match non joué à la date limite revient à la personne qui a essayé de le jouer ; si personne ne s'est manifesté, au mieux classé.";
    if (ch) $("tRegleAbsence").textContent = "Un match pas joué à la fin du championnat est gagné par celui qui a essayé de le jouer ; si personne n'a essayé, il est perdu pour les deux.";
    else $("tRegleAbsence").textContent += " Le tableau est tiré au sort, comme au tennis : les meilleurs niveaux sont têtes de série (la moitié du tableau, 32 au plus) et ne peuvent pas se croiser trop tôt ; tous les autres joueurs sont placés au hasard.";

    // Inscriptions
    const insc = t.phase === "inscriptions";
    $("tInscriptions").hidden = !insc;
    if (insc) {
      $("tInscrits").innerHTML = t.joueurs.map(j => `<div class="joueur"><span class="mini">${avatarSVG(j.avatar || {})}</span>
        <div style="min-width:0"><div class="jn">${esc(j.drapeau || "")} ${nomComplet(j)}${j.id === uid ? " <small>(toi)</small>" : ""}</div><div class="jd">Niveau ${j.classement}</div></div><span></span></div>`).join("");
      $("tActions").innerHTML = [
        !t.inscrit ? `<button class="btn" data-a="inscrire">${t.enjeu ? "M'inscrire et accepter l'enjeu" : "M'inscrire"}</button>` : "",
        ch && t.joueurs.length >= 3 ? `<p class="hint">À ${t.joueurs.length} joueurs : ${matchsParJoueur(t.joueurs.length, t.aller_retour)} matchs chacun.</p>` : "",
        `<button class="btn alt" data-a="partager">Inviter avec le lien (WhatsApp, SMS…)</button>`,
        t.organise ? `<button class="btn" data-a="lancer" ${t.joueurs.length < 3 ? "disabled" : ""}>Lancer le ${ch ? "championnat" : "tournoi"} (${t.joueurs.length} joueurs)</button>` : "",
        t.organise && t.joueurs.length < 3 ? `<p class="hint">Il faut au moins 3 joueurs pour lancer le ${ch ? "championnat" : "tournoi"}.</p>` : "",
        t.inscrit && !t.createur ? `<button class="linkbtn" data-a="desinscrire">Me désinscrire</button>` : "",
        t.organise ? `<button class="linkbtn" data-a="annuler">Annuler le ${ch ? "championnat" : "tournoi"}</button>` : "",
      ].filter(Boolean).join("");
    }

    // Classement (championnat)
    $("tClassementCarte").hidden = !ch || !t.classement;
    if (ch && t.classement) {
      const fini = t.phase === "termine", dernier = dernierDuClassement(t.classement);
      $("tClassement").innerHTML = `<tr><th></th><th></th><th title="Points">Pts</th><th title="Victoires">V</th><th title="Défaites">D</th><th title="Sets gagnés">Sets</th></tr>`
        + t.classement.map(l => `<tr class="${l.joueur.id === uid ? "moi" : ""}"><td>${l.rang}</td>
          <td><span class="cl-nom">${esc(l.joueur.pseudo)}${l.joueur.id === uid ? " (toi)" : ""}${fini && l.rang === 1 && l.v > 0 ? " 🏆" : ""}${fini && t.enjeu && l.joueur.id === dernier?.id ? " 🎯" : ""}</span></td>
          <td><b>${l.points}</b></td><td>${l.v}</td><td>${l.d}</td><td>${l.sets}</td></tr>`).join("");
    }

    // Tableau (ou la liste des matchs d'un championnat)
    const tours = tableau(t);
    $("tTableauCarte").hidden = !tours.length;
    $("tTableauTitre").textContent = ch ? "Les matchs" : "Tableau";
    if (ch) { $("tTableau").innerHTML = (tours[0] || []).map(m => ligneMatch(m, uid)).join(""); return; }
    $("tTableau").innerHTML = tours.map((ms, i) => `<div class="rnd">${nomTour(i + 1, t.nb_tours)}</div>` + ms.map(m => ligneMatch(m, uid)).join("")).join("")
      + (t.phase === "en_cours" ? tours.length < t.nb_tours ? `<p class="hint">La suite du tableau apparaît à la fin de chaque tour.</p>` : "" : "");
  }

  function ligneMatch(m, uid) {
    const cote = (j, gagne) => j
      ? `<div class="bp ${m.fin ? (gagne ? "win" : "lose") : ""}"><span class="mini">${avatarSVG(j.avatar || {})}</span><span class="bn">${esc(j.pseudo)}${j.id === uid ? " (toi)" : ""}</span></div>`
      : `<div class="bp lose"><span class="bn">${m.fin === "exempt" ? "—" : "?"}</span></div>`;
    let score = "vs";
    if (m.fin === "score" && m.duel) {
      const s = m.duel.sets, dans = m.duel.j0 === m.j0?.id ? s : [s[1], s[0]];
      score = `${dans[0]}–${dans[1]}`;
    } else if (m.fin) score = texteFin(m.fin);
    else if (m.duel && ["presentation", "jeu", "entre_sets"].includes(m.duel.phase)) score = "en cours";
    const g0 = m.vainqueur && m.vainqueur === m.j0?.id, g1 = m.vainqueur && m.vainqueur === m.j1?.id;
    const mien = [m.j0?.id, m.j1?.id].includes(uid) ? " mine" : "";
    return `<div class="bm${mien}">${cote(m.j0, g0)}<div class="bs">${esc(score)}</div>${cote(m.j1, g1).replace('class="bp', 'class="bp r')}</div>`;
  }

  $("tActions").addEventListener("click", async e => {
    const b = e.target.closest("button"); if (!b || !detail) return;
    const a = b.dataset.a, id = detail.id;
    if (a === "partager") return partager();
    const quoi = detail.mode === "championnat" ? "championnat" : "tournoi";
    if (a === "annuler" && !confirm(`Annuler le ${quoi} « ${detail.nom} » ?`)) return;
    if (a === "lancer" && !confirm(`Lancer le ${quoi} avec ${detail.joueurs.length} joueurs ? Les inscriptions seront closes.`)) return;
    b.disabled = true;
    try {
      if (a === "inscrire") { await social.inscrireTournoi(id); dire("Inscription enregistrée !"); }
      if (a === "desinscrire") { await social.desinscrireTournoi(id); dire("Inscription annulée."); }
      if (a === "lancer") { await social.lancerTournoi(id); dire(quoi === "championnat" ? "C'est parti ! Tous les matchs peuvent se jouer, dans l'ordre que vous voulez." : "C'est parti ! Le premier tour commence."); }
      if (a === "annuler") { await social.annulerTournoi(id); dire(quoi === "championnat" ? "Championnat annulé." : "Tournoi annulé."); }
      ctx.apresChangement();
    } catch (err) { dire(err.message, true); }
    charger();
  });

  $("tPalmares").addEventListener("click", e => { const l = e.target.closest("[data-tournoi]"); if (l) ouvrir(l.dataset.tournoi); });
  $("tSerieArreter").addEventListener("click", async () => {
    if (!detail || !confirm("Arrêter la répétition ? Cette semaine se joue jusqu'au bout, mais il n'y aura pas de semaine suivante.")) return;
    try { await social.arreterSerie(detail.id); dire("Répétition arrêtée : cette édition est la dernière."); } catch (err) { dire(err.message, true); }
    charger();
  });
  $("tEnjeuEffacer").addEventListener("click", async () => {
    if (!detail || !confirm("Effacer l'enjeu de ce championnat ?")) return;
    try { await social.effacerEnjeuTournoi(detail.id); dire("Enjeu effacé."); } catch (err) { dire(err.message, true); }
    charger();
  });

  async function partager() {
    const url = lienTournoi(base(), detail.code);
    const texte = `Inscris-toi au ${detail.mode === "championnat" ? "championnat" : "tournoi"} « ${detail.nom} » sur HandSlam, le Pierre-Feuille-Ciseaux en sets de 11 :`;
    try { if (navigator.share) { await navigator.share({ title: `Tournoi ${detail.nom}`, text: texte, url }); return; } }
    catch (e) { if (e && e.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(url); dire("Lien copié ! Colle-le dans WhatsApp ou un SMS."); } catch { dire(""); }
    $("tMsg").insertAdjacentHTML("beforeend", `<span class="lien-partage">${esc(url)}</span>`);
  }

  async function jouerMonMatch(mm) {
    if ($("tJouer")) $("tJouer").disabled = true;
    try {
      const duel = await social.jouerMatchTournoi(mm.match.id);
      if (duel.phase === "attente") { dire(`Invitation envoyée à ${mm.adversaire.pseudo} : le match démarre dès son arrivée.`); return charger(); }
      const [p] = await ctx.profils([mm.adversaire.id]);
      ctx.lancerDuel(duel, p);
    } catch (err) { dire(err.message, true); charger(); }
  }

  // ------------------------------------------------ arrivée par un lien « ?tournoi=CODE »
  const codeLien = codeTournoiDepuisAdresse(location.search);
  if (codeLien) ecrire("tournoiLien", codeLien);
  async function rejoindreLienEnAttente() {
    const code = lire("tournoiLien", null);
    if (!code || !ctx.uid()) return;
    ecrire("tournoiLien", null);
    if (codeTournoiDepuisAdresse(location.search)) history.replaceState(null, "", location.pathname + location.hash);
    try {
      const t = await social.rejoindreTournoi(code);
      ctx.apresChangement();
      await ouvrir(t.id, `Inscription au tournoi « ${t.nom} » enregistrée !`);
    } catch (err) { dire(err.message, true, "socMsg"); }
  }

  return { liste, nouveau, ouvrir, fermer, rafraichir: () => { if (ouvert) charger(); }, rejoindreLienEnAttente, lienEnAttente: () => !!codeLien };
}
