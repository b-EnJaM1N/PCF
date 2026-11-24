import { test } from "node:test";
import assert from "node:assert/strict";
import { CATALOGUE, replique, repliqueScore, repliquePartout, POOLS, DIALOGUES_IDS, nbDialogues } from "../app/js/voix/script.js";
import { annoncerCoup, annonceDebutSet, nouvelEtatAnnonces, annoncesAvantMatch, interview, etiquetteDe, niveauEnjeu, baseDe, silenceAvantBalle, contexteJeu, figureDe } from "../app/js/annonces.js";
import { surnomDe } from "../app/js/surnoms.js";
import { profilParDefaut } from "../app/js/profil.js";
import { nouveauMatch, jouerCoup, PIERRE, CISEAUX, FEUILLE } from "../app/js/regles.js";
import { rngFixe } from "./outils.js";

test("chaque réplique a un nom de fichier valide : role_situation_NN", () => {
  for (const [id, r] of CATALOGUE) {
    assert.match(id, /^(arbitre|commentateur|commentatrice|speaker|journaliste)_[a-z0-9_]+_\d{2}(_(pierre|ciseaux|feuille))?(_f)?$/, id);
    assert.ok(id.startsWith(r.role + "_"), id);
    assert.ok(r.texte.length > 3, id);
  }
});

test("exemples de noms de répliques", () => {
  assert.equal(replique("commentateur_craquage_02").role, "commentateur");
  assert.equal(replique("commentatrice_craquage_01").role, "commentatrice");
  assert.equal(repliqueScore(11, 9).id, "arbitre_score_onze_a_neuf_01");
  assert.equal(repliqueScore(11, 9).texte, "Onze à neuf.");
  assert.equal(repliqueScore(17, 15).id, "arbitre_score_dix_sept_a_quinze_01");
  assert.equal(repliquePartout(10).texte, "Dix partout. Deux points d'écart.");
  assert.ok(CATALOGUE.has(repliqueScore(20, 18).id));
  // hors catalogue : toujours une réplique, lue par la voix de synthèse
  assert.equal(repliqueScore(25, 23).texte, "Vingt-cinq à vingt-trois.");
  assert.throws(() => replique("arbitre_inexistant_01"));
});

test("chaque moment du match a au moins une réplique, et les dialogues ont deux voix", () => {
  for (const [m, pool] of Object.entries(POOLS)) assert.ok(pool.length >= 1, m);
  for (const [m, ds] of Object.entries(DIALOGUES_IDS)) for (const d of ds) {
    assert.deepEqual(d.map(id => CATALOGUE.get(id).role), ["commentateur", "commentatrice"], m);
  }
  assert.equal(replique("commentateur_craquage_01").texte, "Il est en train de craquer sous la pression !");
  assert.equal(replique("commentateur_craquage_01_f").texte, "Elle est en train de craquer sous la pression !");
  assert.equal(replique("commentatrice_obstination_01_ciseaux").texte, "Encore Ciseaux. C'est de la provocation.");
  assert.equal(replique("commentatrice_dialogue_fin_set_02").texte, "N'en parlons pas.");
});

test("la commentatrice n'évoque jamais 1997", () => {
  for (const r of CATALOGUE.values()) if (r.role === "commentatrice") assert.ok(!/1997/.test(r.texte), r.texte);
});

// Joue un match complet au hasard et vérifie que toutes les annonces existent.
test("un match complet ne produit que des répliques connues", () => {
  const rng = rngFixe(11);
  for (const [len, win] of [[11, 2], [11, 3], [7, 2], [7, 3]]) {
    for (let k = 0; k < 20; k++) {
      const m = nouveauMatch({ pointsParSet: len, setsGagnants: win }), etat = nouvelEtatAnnonces();
      assert.equal(annonceDebutSet(m).id, "arbitre_premier_set_01");
      while (!m.termine) {
        const e = jouerCoup(m, Math.floor(rng() * 3), Math.floor(rng() * 3));
        const a = annoncerCoup(m, e, etat, { recents: [true, true, true, true, true, true, true, true] }, rng);
        for (const l of a.lignes) {
          assert.ok(l.id && l.texte && l.role, JSON.stringify(l));
          if (!l.id.startsWith("arbitre_score_") && !l.id.startsWith("arbitre_partout_")) assert.ok(CATALOGUE.has(l.id), l.id);
        }
        if (e.finSet && !e.finMatch) assert.ok(annonceDebutSet(m).id);
      }
    }
  }
});

test("l'arbitre annonce la balle de match, puis le silence se fait", () => {
  const m = nouveauMatch({ pointsParSet: 7, setsGagnants: 2 }), etat = nouvelEtatAnnonces(), rng = () => 0.99;
  for (let i = 0; i < 7; i++) annoncerCoup(m, jouerCoup(m, PIERRE, CISEAUX), etat, {}, rng);
  let a;
  for (let i = 0; i < 6; i++) a = annoncerCoup(m, jouerCoup(m, PIERRE, CISEAUX), etat, {}, rng);
  assert.equal(a.lignes[0].id, "arbitre_balle_de_match_jaune_01");
  assert.equal(a.ambiance, "silence");
  a = annoncerCoup(m, jouerCoup(m, CISEAUX, PIERRE), etat, {}, rng);
  assert.ok(a.lignes.some(l => l.id.startsWith("commentateur_balle_sauvee_")) === false, "c'est le rouge qui sauve");
  a = annoncerCoup(m, jouerCoup(m, PIERRE, CISEAUX), etat, {}, rng);
  assert.deepEqual(a.lignes.slice(0, 2).map(l => l.id), ["arbitre_jeu_set_et_match_jaune_01", "arbitre_sets_deux_a_zero_01"]);
  assert.equal(a.public, "ovation");
  assert.equal(a.ambiance, "fin");
});

test("fin de set : set remporté, score, et 10 partout", () => {
  const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), etat = nouvelEtatAnnonces(), rng = () => 0.99;
  let a;
  for (let i = 0; i < 10; i++) annoncerCoup(m, jouerCoup(m, PIERRE, CISEAUX), etat, {}, rng);
  for (let i = 0; i < 10; i++) a = annoncerCoup(m, jouerCoup(m, CISEAUX, PIERRE), etat, {}, rng);
  assert.equal(a.lignes[0].id, "arbitre_partout_dix_01");
  annoncerCoup(m, jouerCoup(m, FEUILLE, PIERRE), etat, {}, rng);
  a = annoncerCoup(m, jouerCoup(m, FEUILLE, PIERRE), etat, {}, rng);
  assert.deepEqual(a.lignes.slice(0, 2).map(l => l.id), ["arbitre_premier_set_jaune_01", "arbitre_score_douze_a_dix_01"]);
  assert.equal(annonceDebutSet(m).id, "arbitre_deuxieme_set_01");
});

test("le commentateur ne se répète pas et reste rare", () => {
  const rng = rngFixe(5), m = nouveauMatch({ pointsParSet: 11, setsGagnants: 3 }), etat = nouvelEtatAnnonces();
  let coms = 0, prec = null;
  while (!m.termine) {
    const a = annoncerCoup(m, jouerCoup(m, Math.floor(rng() * 3), Math.floor(rng() * 3)), etat, {}, rng);
    if (a.commentaire) { coms++; if (!m.termine) assert.notEqual(a.commentaire.id, prec); prec = a.commentaire.id; }
  }
  assert.ok(coms < m.coups.length / 3, `${coms} commentaires pour ${m.coups.length} coups`);
});

test("le public applaudit 4 points d'affilée, la fin d'un set et du match, pas chaque point", () => {
  const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), etat = nouvelEtatAnnonces(), rng = () => 0.99;
  const pubs = [];
  const suite = "aaabaaaabbbbaaaaaaa";  // a = point pour moi, b = pour l'adversaire
  for (const c of suite) pubs.push(annoncerCoup(m, c === "a" ? jouerCoup(m, PIERRE, CISEAUX) : jouerCoup(m, CISEAUX, PIERRE), etat, {}, rng).public);
  // 3 points puis 1 perdu : rien ; 4 d'affilée ; 4 pour l'adversaire ; la série suivante finit le set 11–5 ; puis 3 points : rien
  assert.deepEqual(pubs.map((p, i) => p && `${i}:${p}`).filter(Boolean), ["7:serie", "11:serie", "15:set"]);
});

test("contre un humain, le commentateur ne parle jamais de « la machine »", () => {
  const rng = rngFixe(21);
  for (let k = 0; k < 30; k++) {
    const m = nouveauMatch({ pointsParSet: 7, setsGagnants: 2 }), etat = nouvelEtatAnnonces({ humain: true });
    while (!m.termine) {
      const a = annoncerCoup(m, jouerCoup(m, Math.floor(rng() * 3), Math.floor(rng() * 3)), etat, { recents: Array(10).fill(true) }, rng);
      for (const l of a.lignes) assert.ok(!/machine/i.test(l.texte), l.texte);
    }
  }
});

test("la réserve de parole : les commentateurs parlent peu pendant le jeu", () => {
  const rng = rngFixe(8);
  let coms = 0, coups = 0;
  for (let k = 0; k < 20; k++) {
    const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), etat = nouvelEtatAnnonces();
    const vus = new Set();
    while (!m.termine) {
      const a = annoncerCoup(m, jouerCoup(m, Math.floor(rng() * 3), Math.floor(rng() * 3)), etat, {}, rng);
      coups++;
      if (a.commentaire) { coms++; assert.ok(!vus.has(a.commentaire.id), "jamais deux fois la même"); vus.add(a.commentaire.id); }
      if (!a.commentaire && !a.dialogue.length) assert.ok(a.lignes.every(l => l.role === "arbitre"));
    }
  }
  // (décision du 28 octobre : 3 à 4 commentaires par set, soit un peu moins d'un tous les 6 coups ; 5 à 6 plus tard)
  assert.ok(coms > 0 && coms < coups / 6, `${coms} commentaires pour ${coups} coups`);
});

test("la version au féminin et le signe joué sont respectés", () => {
  const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), etat = nouvelEtatAnnonces({ genre: "f" }), rng = () => 0.1;
  const toutes = [];
  for (let i = 0; i < 11; i++) toutes.push(...annoncerCoup(m, jouerCoup(m, FEUILLE, PIERRE), etat, {}, rng).lignes);
  for (const l of toutes) {
    if (CATALOGUE.has(`${l.id}_f`)) assert.fail(`version masculine choisie : ${l.id}`);
    if (/_(pierre|ciseaux)(_f)?$/.test(l.id)) assert.fail(`mauvais signe : ${l.id}`);
  }
});

test("fin de set et fin de match : un temps mort avec commentaire ou dialogue", () => {
  const rng = rngFixe(3);
  let avecDialogue = 0;
  for (let k = 0; k < 30; k++) {
    const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), etat = nouvelEtatAnnonces({ finale: k % 2 === 0 });
    let a;
    while (!m.termine) a = annoncerCoup(m, jouerCoup(m, Math.floor(rng() * 3), Math.floor(rng() * 3)), etat, {}, rng);
    assert.ok(a.dialogue.length >= 1, "un mot à la fin du match");
    if (a.dialogue.length >= 2) avecDialogue++;
    for (const l of a.dialogue) assert.ok(CATALOGUE.has(l.id), l.id);
  }
  assert.ok(avecDialogue > 0);
});

test("le speaker présente les joueurs par leur côté et leur surnom", () => {
  const P = profilParDefaut();
  P.surnom = { nom: "le_cobra", complement: "du_pmu" };
  const moi = { surnom: surnomDe(P), genre: "f", etiquette: etiquetteDe(P) };
  const { speaker, commentaires } = annoncesAvantMatch({ moi, adv: { bot: "rocky" }, tour: "finale" }, () => 0);
  assert.deepEqual(speaker.map(l => l.id), ["speaker_finale_01", "speaker_coin_jaune_01", "speaker_debutant_01",
    "speaker_coin_rouge_01", "speaker_bot_rocky_01", "speaker_cloture_01"]);
  assert.ok(speaker.every(l => l.role === "speaker"));
  assert.ok(commentaires.every(l => CATALOGUE.has(l.id)));
  // deux joueurs au même surnom : le speaker le remarque
  const m2 = annoncesAvantMatch({ moi, adv: { surnom: surnomDe(P) }, humain: true }, () => 0);
  assert.ok(m2.speaker.some(l => l.id.startsWith("speaker_miroir_")));
});

test("l'interview d'après finale : une question, trois réponses, le mot de la fin", () => {
  const i = interview(true, rngFixe(4));
  assert.equal(i.question.role, "journaliste");
  assert.equal(i.reponses.length, 3);
  assert.equal(new Set(i.reponses).size, 3);
  assert.equal(i.champion.id, "speaker_champion_01");
  assert.equal(interview(false, rngFixe(4)).question.id, "journaliste_question_defaite_01");
});

test("un jeu de mots sur un signe n'est dit que si le joueur vient de jouer ce signe", () => {
  const rng = rngFixe(13);
  for (let k = 0; k < 200; k++) {
    const m = nouveauMatch({ pointsParSet: 3, setsGagnants: 2 }), etat = nouvelEtatAnnonces();
    let a;
    while (!m.termine) a = annoncerCoup(m, jouerCoup(m, Math.floor(rng() * 3), Math.floor(rng() * 3)), etat, {}, rng);
    const dernier = m.coups[m.coups.length - 1].a;
    for (const l of a.dialogue) {
      const item = POOLS.balle_match_convertie.find(e => l.id.startsWith(e.base));
      if (item && item.seul !== undefined) assert.equal(item.seul, dernier, `${l.texte} après ${dernier}`);
    }
  }
});

test("le speaker relève la situation du match", async () => {
  const { situationsDuMatch } = await import("../app/js/annonces.js");
  const dimancheSoir = new Date(2026, 8, 27, 23, 30);   // un dimanche, 23 h 30
  assert.deepEqual(situationsDuMatch({ humain: true, dejaJoues: true, niveauMoi: 1200, niveauAdv: 1400, memePays: true, date: dimancheSoir, rapide: true, officiel: true }),
    ["revanche", "david_goliath", "compatriotes", "nuit", "dimanche", "partie_rapide", "officiel"]);
  const mardiMidi = new Date(2026, 8, 29, 12, 0);
  assert.deepEqual(situationsDuMatch({ niveauMoi: 1200, niveauAdv: 1210, date: mardiMidi, setsGagnants: 3 }), ["marathon", "contre_bot"]);
});

test("ce que le speaker dit d'un joueur", async () => {
  const { etiquettesDe } = await import("../app/js/annonces.js");
  const P = profilParDefaut();
  assert.deepEqual(etiquettesDe(P), ["debutant"]);
  Object.assign(P, { matchs: 120, serieEnCours: 6, tournoisGagnes: 1, derniers: [{ adv: "h:bob", gagne: true }, { adv: "h:zoe", gagne: false }] });
  assert.deepEqual(etiquettesDe(P, { advId: "h:zoe", niveauMoi: 1500, niveauAdv: 1300 }), ["laver_affront", "patron", "serie", "trophee", "habitue"]);
});

test("le speaker ne répète pas les phrases des derniers matchs", () => {
  const P = profilParDefaut(), moi = { surnom: surnomDe(P) };
  let recents = [];
  const accueils = new Set();
  for (let k = 0; k < 8; k++) {
    const { speaker } = annoncesAvantMatch({ moi, adv: { bot: "rocky" }, recents }, rngFixe(k));
    accueils.add(speaker[0].id);
    recents = [...speaker.map(l => l.id), ...recents].slice(0, 80);
  }
  assert.equal(accueils.size, 8, "8 matchs, 8 accueils différents");
});

test("sur une balle de match, on ne parle pas de « set »", () => {
  // Troisième set décisif : le joueur a une balle de match et la laisse filer, plusieurs fois.
  for (let k = 0; k < 40; k++) {
    const m = nouveauMatch({ pointsParSet: 7, setsGagnants: 2 }), etat = nouvelEtatAnnonces(), rng = rngFixe(k);
    const coup = g => annoncerCoup(m, g ? jouerCoup(m, PIERRE, CISEAUX) : jouerCoup(m, CISEAUX, PIERRE), etat, {}, rng);
    for (let i = 0; i < 7; i++) coup(true);           // 1er set pour moi
    for (let i = 0; i < 7; i++) coup(false);          // 2e set pour l'adversaire
    for (let i = 0; i < 6; i++) coup(true);           // 6–0 : balle de match
    for (let i = 0; i < 6; i++) {                     // l'adversaire les sauve une à une
      const a = coup(false);
      if (a.commentaire) assert.ok(!/\bset\b/.test(a.commentaire.texte), a.commentaire.texte);
    }
  }
});

test("les grandes phrases (« Un point pour l'Éternité ») sont réservées aux matchs à enjeu", () => {
  assert.equal(niveauEnjeu({ tour: "finale" }), "finale");
  assert.equal(niveauEnjeu({ tour: "demis" }), "tableau");
  assert.equal(niveauEnjeu({ tour: "huitiemes" }), null);
  assert.equal(niveauEnjeu({ tour: "huitiemes", grandChelem: true }), "tableau");
  assert.equal(niveauEnjeu(), null, "match amical ou contre un bot");
  const enjeu = new Set([...Object.values(POOLS)].flat().filter(e => ["enjeu", "tableau", "finale_tournoi"].includes(e.si)).map(e => e.base));
  const entendues = niveau => {
    const rng = rngFixe(7), dites = new Set();
    for (let k = 0; k < 150; k++) {
      const m = nouveauMatch({ pointsParSet: 7, setsGagnants: 2 }), etat = nouvelEtatAnnonces({ enjeu: niveau });
      while (!m.termine) {
        const a = annoncerCoup(m, jouerCoup(m, Math.floor(rng() * 3), Math.floor(rng() * 3)), etat, {}, rng);
        for (const l of a.lignes) if ([...enjeu].some(b => l.id.startsWith(b))) dites.add(l.id);
      }
    }
    return dites;
  };
  assert.equal(entendues(null).size, 0, "jamais dans un match sans enjeu");
  const finale = entendues("finale");
  assert.ok([...finale].some(id => id.startsWith("commentateur_tension_04")), "« Un point pour l'Éternité » en finale");
  assert.ok(![...finale].some(id => id.startsWith("commentateur_balle_match_convertie_19")), "pas de « Qualifié ! » en finale");
});

test("avant le match, Roland et Monique parlent encore après des dizaines de matchs", () => {
  const P = profilParDefaut(), moi = { surnom: surnomDe(P) }, rng = rngFixe(3);
  let recents = [], parles = 0;
  for (let k = 0; k < 40; k++) {
    const av = annoncesAvantMatch({ moi, adv: { bot: "rocky" }, recents }, rng);
    if (av.commentaires.length) parles++;
    recents = av.commentaires.map(l => l.id).concat(recents).slice(0, 80);   // comme l'appli
  }
  assert.ok(parles >= 25, `${parles} matchs sur 40 avec un dialogue`);
});

test("d'un match à l'autre, les commentateurs évitent ce qu'ils viennent de dire", () => {
  assert.equal(baseDe("commentateur_lecture_reussie_03_feuille"), "commentateur_lecture_reussie_03");
  assert.equal(baseDe("commentatrice_serie_contre_12_f"), "commentatrice_serie_contre_12");
  assert.equal(baseDe("commentateur_dialogue_fin_set_02"), "commentateur_dialogue_fin_set_02");
  // Comme l'appli : on retient les 120 dernières répliques entendues et on les donne au match suivant.
  const repetitions = memoire => {
    const rng = rngFixe(5), hist = [];
    let recents = [], rep = 0, tot = 0;
    for (let k = 0; k < 300; k++) {
      const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), etat = nouvelEtatAnnonces({ anciens: memoire ? recents : [] }), dits = [];
      while (!m.termine) {
        const ids = annoncerCoup(m, jouerCoup(m, Math.floor(rng() * 3), Math.floor(rng() * 3)), etat, {}, rng).lignes.filter(l => l.role !== "arbitre").map(l => baseDe(l.id));
        dits.push(...ids); recents = [...new Set([...ids, ...recents])].slice(0, 120);
      }
      const avant = new Set(hist.slice(-3).flat());
      for (const id of dits.slice(0, 3)) { tot++; if (avant.has(id)) rep++; }
      hist.push(dits);
    }
    return rep / tot;
  };
  const sans = repetitions(false), avec = repetitions(true);
  assert.ok(avec < 0.15 && avec < sans / 1.5, `début de match déjà entendu aux 3 matchs précédents : ${Math.round(100 * avec)} % (sans mémoire : ${Math.round(100 * sans)} %)`);
});

test("une réplique retirée ne se dit plus, sans décaler les numéros (donc les enregistrements) des suivantes", () => {
  assert.ok(!CATALOGUE.has("commentateur_duel_esprits_02"), "« Télépathie sur le court ! » retirée");
  assert.equal(CATALOGUE.get("commentateur_duel_esprits_03").texte, "Surplace sur la piste ! Personne ne veut lancer le sprint !", "la suivante garde son numéro");
  assert.ok(!POOLS.duel_esprits.some(e => e.base === "commentateur_duel_esprits_02"));
  assert.match(CATALOGUE.get("commentateur_craquage_09").texte, /^Oh non, pas ça !/, "déplacée en balle de match ratée");
});

test("avant le match : un dialogue selon la situation (finale, revanche, nuit, contre un bot), pas à chaque fois", () => {
  const P = profilParDefaut(), moi = { surnom: surnomDe(P) };
  const ids = (opts, graine) => annoncesAvantMatch({ moi, adv: { bot: "rocky" }, ...opts }, rngFixe(graine)).commentaires.map(l => l.id);
  let finale = 0, bot = 0;
  for (let k = 0; k < 40; k++) {
    if (ids({ tour: "finale", situations: ["contre_bot"] }, k).includes("commentateur_dialogue_avant_finale_01")) finale++;
    if (ids({ situations: ["contre_bot"] }, k).includes("commentateur_dialogue_avant_bot_01")) bot++;
  }
  assert.ok(finale > 8 && finale < 32, `finale : ${finale} sur 40`);
  assert.ok(bot > 8 && bot < 32, `contre un bot : ${bot} sur 40`);
  assert.ok(!ids({ situations: ["contre_bot"], recents: ["commentatrice_dialogue_avant_bot_01", "commentateur_dialogue_avant_bot_01"] }, 1).includes("commentateur_dialogue_avant_bot_01")
    && [...Array(30).keys()].every(k => !ids({ situations: ["contre_bot"], recents: ["commentateur_dialogue_avant_bot_01"] }, k).includes("commentateur_dialogue_avant_bot_01")),
    "pas deux fois de suite (entendu aux derniers matchs)");
  assert.equal(nbDialogues("avant_match"), 15);
});

test("« Silence » avant les balles de match : souvent, mais au plus 3 par match, 2 par set, et une pause après 2 d'affilée", () => {
  // Toujours oui au tirage : 2 d'affilée, puis une pause de 2 ou 3 balles, puis encore une (la 3e), puis plus rien.
  const etat = { total: 0, parSet: {}, suite: 0, pause: 0 };
  const dits = Array.from({ length: 10 }, () => silenceAvantBalle(etat, 2, () => 0));
  assert.deepEqual(dits.slice(0, 2), [true, true]);
  assert.deepEqual(dits.slice(2, 4), [false, false]);
  assert.equal(dits.filter(Boolean).length, 2, "2 par set au plus");
  const e2 = { total: 0, parSet: {}, suite: 0, pause: 0 }, d2 = [];
  for (let k = 0; k < 12; k++) d2.push(silenceAvantBalle(e2, k < 4 ? 1 : 2, () => 0));
  assert.equal(d2.filter(Boolean).length, 3, "3 par match au plus");
  // Au hasard, sur un match très serré (10 balles de match) : jamais plus de 2 d'affilée.
  for (let n = 0; n < 200; n++) {
    const e = { total: 0, parSet: {}, suite: 0, pause: 0 }, d = Array.from({ length: 10 }, (_, k) => silenceAvantBalle(e, k < 5 ? 1 : 2));
    assert.ok(!d.join().includes("true,true,true"));
  }
});

test("fin de match : un seul commentaire (une réplique ou un dialogue), pas d'enchaînement", () => {
  const rng = rngFixe(77);
  for (let k = 0; k < 300; k++) {
    const m = nouveauMatch({ pointsParSet: 3, setsGagnants: 2 }), etat = nouvelEtatAnnonces({ finale: k % 3 === 0 });
    let a;
    while (!m.termine) {
      const [x, y] = rng() < 0.5 ? [PIERRE, CISEAUX] : [CISEAUX, PIERRE];
      a = annoncerCoup(m, jouerCoup(m, x, y), etat, {}, rng);
    }
    const coms = a.lignes.filter(l => l.role === "commentateur" || l.role === "commentatrice");
    assert.ok(coms.length >= 1, "un commentaire de fin de match");
    if (coms.length > 1) assert.ok(coms.every(l => /_dialogue_/.test(l.id)), `un seul dialogue, pas une suite de phrases : ${coms.map(l => l.id)}`);
    if (coms.length > 1) assert.equal(new Set(coms.map(l => l.id.replace(/^(commentateur|commentatrice)_/, "").replace(/_f$/, ""))).size, 1, "un seul dialogue");
  }
});

test("commentaires selon l'enjeu : le contexte, l'avant-match et l'après-match adaptés", () => {
  assert.equal(contexteJeu({ entrainement: true }), "entrainement");
  assert.equal(contexteJeu({ tournoi: "petit", tour: "huitiemes" }), "tournoi_premiers");
  assert.equal(contexteJeu({ tournoi: "petit", tour: "demis" }), "tournoi_demis");
  assert.equal(contexteJeu({ tournoi: "gros", tour: null }), "tournoi_premiers", "les premiers tours du Grand Chelem : ceux d'un petit tournoi");
  assert.equal(contexteJeu({ tournoi: "gros", tour: "finale" }), "majeur_finale");
  assert.equal(contexteJeu({}), null, "Sit & Go, duels : rien de spécial");
  // Avant une grande finale : toujours un dialogue de grande finale.
  for (let k = 0; k < 20; k++) {
    const { commentaires } = annoncesAvantMatch({ jeu: "majeur_finale", recents: [] }, rngFixe(k));
    assert.ok(commentaires.some(l => /^commentateur_dialogue_avant_majeur_finale_\d\d$/.test(l.id)), commentaires.map(l => l.id).join());
  }
  // Après une finale de petit tournoi perdue (joueuse) : un dialogue de finale perdue, au féminin quand il le faut.
  const rng = rngFixe(9);
  let vus = 0;
  for (let k = 0; k < 40; k++) {
    const m = nouveauMatch({ pointsParSet: 1, setsGagnants: 1 }), etat = nouvelEtatAnnonces({ genre: "f" });
    etat.jeu = "tournoi_finale";
    const a = annoncerCoup(m, jouerCoup(m, CISEAUX, PIERRE), etat, {}, rng);
    const com = a.lignes.filter(l => l.role === "commentateur" || l.role === "commentatrice");
    assert.ok(com.every(l => /_dialogue_apres_tournoi_finale_defaite_\d\d(_f)?$/.test(l.id)), com.map(l => l.id).join());
    if (com.some(l => /_f$/.test(l.id))) vus++;
  }
  assert.ok(vus > 0, "des versions au féminin");
});

test("figures techniques : chaque enchaînement gagnant a son nom", () => {
  // a : mon signe (Pierre 0, Ciseaux 1, Feuille 2) ; g : gagnant du point (0 moi, 1 lui, null égalité).
  const coups = l => l.map(([a, g, b = 0]) => ({ a, b, gagnant: g }));
  assert.equal(figureDe(coups([[2, 1], [2, 1], [2, 0]])), "triple_loop");
  assert.equal(figureDe(coups([[0, 1], [0, 1], [0, 1], [0, 0]])), "marteau");
  assert.equal(figureDe(coups([[2, 1], [2, 1], [2, 1], [1, 1], [1, 0]])), "valse", "trois Feuilles puis deux Ciseaux");
  assert.equal(figureDe(coups([[0, 1], [2, 1], [1, 0]])), "tour", "Pierre, Feuille, Ciseaux");
  assert.equal(figureDe(coups([[1, 1], [2, 1], [0, 0]])), "retro", "Ciseaux, Feuille, Pierre");
  assert.equal(figureDe(coups([[0, 1], [0, 1], [2, 0]])), "double_boucle");
  assert.equal(figureDe(coups([[0, 1], [1, 1], [0, 0]])), "ascenseur");
  assert.equal(figureDe(coups([[1, 0], [0, 1], [0, 0]])), "boomerang");
  assert.equal(figureDe(coups([[1, 0], [0, 0, 2], [2, 0]])), "miroir", "je joue la Feuille qu'il vient de jouer");
  assert.equal(figureDe(coups([[1, 0], [0, null], [2, null], [1, null], [0, 0]])), "parapluie");
  assert.equal(figureDe(coups([[2, 1], [2, 1], [2, 1]])), null, "un point perdu : pas de figure");
});

test("la banque du 1er novembre : rien de muet, rien de trop long pendant l'échange, et les nouveaux moments", async () => {
  const { troisPierres, REPLIQUE_COURTE, annoncesAvantMatch } = await import("../app/js/annonces.js");
  // Trois points gagnés d'affilée avec la Pierre (les égalités ne comptent pas).
  const P = (a, b, g) => ({ a, b, gagnant: g });
  assert.ok(troisPierres([P(0, 1, 0), P(2, 2, null), P(0, 1, 0), P(0, 1, 0)]));
  assert.ok(!troisPierres([P(0, 1, 0), P(1, 2, 0), P(0, 1, 0)]));
  // Sans voix enregistrée, aucun commentaire n'est choisi (plutôt qu'un silence) ; pendant l'échange, jamais de réplique trop longue.
  const rng = rngFixe(3);
  let muets = 0, trop = 0, coms = 0;
  for (let k = 0; k < 30; k++) {
    const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 });
    const sansVoix = nouvelEtatAnnonces(), avecVoix = nouvelEtatAnnonces();
    sansVoix.audible = () => false;
    const m2 = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 });
    while (!m.termine) {
      const a = Math.floor(rng() * 3), b = Math.floor(rng() * 3);
      if (annoncerCoup(m, jouerCoup(m, a, b), sansVoix, {}, rng).commentaire) muets++;
      if (!m2.termine) {
        const evt = jouerCoup(m2, a, b), r = annoncerCoup(m2, evt, avecVoix, {}, rng);
        if (r.commentaire) { coms++; if (!evt.finSet && r.commentaire.texte.length > REPLIQUE_COURTE) trop++; }
      }
    }
  }
  assert.equal(muets, 0, "pas de voix : pas de commentaire");
  assert.ok(coms > 0); assert.equal(trop, 0, "rien de trop long pendant l'échange");
  // Avant un duel entre amis, parfois une seule phrase « entre amis ».
  const amis = new Set();
  for (let k = 0; k < 200; k++) annoncesAvantMatch({ humain: true, situations: [] }, rngFixe(k)).commentaires.forEach(l => amis.add(baseDe(l.id).replace(/_\d\d$/, "")));
  assert.ok([...amis].some(x => /avant_seul_amis$/.test(x)), [...amis].join(", "));
});

test("le ciseau retourné : seulement quand je gagne avec les Ciseaux juste après les Ciseaux de l'adversaire", async () => {
  const { POOLS } = await import("../app/js/voix/script.js");
  const item = POOLS.beau_coup.find(e => e.t === "Magnifique ciseau retourné !");
  assert.equal(item.si, "ciseau_retourne");
  const vu = (coups) => {
    const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 });
    let dit = false;
    for (let k = 0; k < 200 && !dit; k++) {
      const m2 = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), etat = nouvelEtatAnnonces(), rng = rngFixe(k);
      etat.reserve = 2;
      let r;
      for (const [a, b] of coups) r = annoncerCoup(m2, jouerCoup(m2, a, b), etat, {}, rng);
      if (r.commentaire?.texte === "Magnifique ciseau retourné !") dit = true;
    }
    return dit;
  };
  // (trois points avant, pour que les commentateurs puissent parler)
  assert.ok(vu([[0, 1], [2, 0], [0, 0], [2, 1], [1, 2]]), "Ciseaux gagnants après les Ciseaux de l'adversaire : possible");
  assert.ok(!vu([[0, 1], [2, 0], [0, 0], [2, 0], [1, 2]]), "sinon : jamais");
});

test("les commentaires du smash : réussi, sonné, raté, bloqué ; jamais « il a tout raté » pour le smash de l'adversaire", () => {
  const vus = new Map(), rng = rngFixe(11);
  for (let k = 0; k < 400; k++) {
    const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), etat = nouvelEtatAnnonces();
    const a = Math.floor(rng() * 3), b = Math.floor(rng() * 3), smash = [rng() < 0.5, rng() < 0.5];
    const r = annoncerCoup(m, jouerCoup(m, a, b), etat, { smash }, rng);
    if (!r.commentaire) continue;
    const mo = baseDe(r.commentaire.id).replace(/^(commentateur|commentatrice)_/, "").replace(/_\d\d$/, "");
    if (!mo.startsWith("smash")) continue;
    vus.set(mo, (vus.get(mo) || 0) + 1);
    if (smash[1] && !smash[0]) assert.ok(!/raté|vide|mur\. Le mur/.test(r.commentaire.texte), r.commentaire.texte);
    if (smash[0] && smash[1]) assert.equal(mo, "smash_double");
  }
  for (const mo of ["smash_reussi", "smash_sonne", "smash_rate", "smash_bloque", "smash_double"]) assert.ok(vus.get(mo) > 0, mo);
});


test("« mauvais départ » : pas dès le premier point perdu, seulement à 0-3 en début de match", () => {
  const depart = /mauvais départ|Ça commence mal/;
  for (let k = 0; k < 200; k++) {
    const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), etat = nouvelEtatAnnonces(), rng = rngFixe(k);
    const textes = [];
    for (let i = 0; i < 3; i++) textes.push(annoncerCoup(m, jouerCoup(m, CISEAUX, PIERRE), etat, {}, rng).lignes.map(l => l.texte).join(" | "));
    assert.ok(!depart.test(textes[0]) && !depart.test(textes[1]), `trop tôt : ${textes.join(" / ")}`);
    assert.ok(!/Premier point pour l'adversaire|Kolodrov/.test(textes[2]), `plus le premier point : ${textes[2]}`);
  }
});

test("l'ouverture de Kolodrov : après le 3e coup, ouverture Pierre, Feuille, Ciseaux, s'il ne mène pas et que le 3e coup ne lui donne pas le point", () => {
  let vu = 0;
  for (let k = 0; k < 50; k++) {
    const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), etat = nouvelEtatAnnonces(), rng = rngFixe(k);
    const textes = [[PIERRE, FEUILLE], [FEUILLE, CISEAUX], [CISEAUX, PIERRE]].map(([a, b]) => annoncerCoup(m, jouerCoup(m, a, b), etat, {}, rng).lignes.map(l => l.texte).join(" | "));
    assert.ok(!/Kolodrov/.test(textes[0] + textes[1]), "pas avant le 3e coup");
    if (/Kolodrov/.test(textes[2])) vu++;
  }
  assert.equal(vu, 50, "à chaque fois");
  // à égalité (1–1) avec un 3e coup nul : oui
  for (let k = 0; k < 20; k++) {
    const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), etat = nouvelEtatAnnonces(), rng = rngFixe(k);
    const t = [[PIERRE, CISEAUX], [FEUILLE, CISEAUX], [CISEAUX, CISEAUX]].map(([a, b]) => annoncerCoup(m, jouerCoup(m, a, b), etat, {}, rng).lignes.map(l => l.texte).join(" | "));
    assert.ok(/Kolodrov/.test(t[2]), t.join(" / "));
  }
  for (let k = 0; k < 60; k++) {   // une autre ouverture, en tête, ou un 3e coup qui lui donne le point (même s'il reste mené) : jamais
    const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), etat = nouvelEtatAnnonces(), rng = rngFixe(k);
    const coups = [[[PIERRE, CISEAUX], [FEUILLE, PIERRE], [CISEAUX, FEUILLE]], [[FEUILLE, CISEAUX], [PIERRE, FEUILLE], [CISEAUX, PIERRE]],
      [[PIERRE, FEUILLE], [FEUILLE, CISEAUX], [CISEAUX, FEUILLE]]][k % 3];
    const t = coups.map(([a, b]) => annoncerCoup(m, jouerCoup(m, a, b), etat, {}, rng).lignes.map(l => l.texte).join(" | ")).join(" / ");
    assert.ok(!/Kolodrov/.test(t), t);
  }
});

test("le feu des mains pour les commentateurs : ma main prend feu à 8 points de suite, une flamme qui s'éteint", async () => {
  const { feuDuCoup } = await import("../app/js/annonces.js");
  const g = s => [...s].map(x => ({ gagnant: x === "=" ? null : +x }));
  assert.deepEqual(feuDuCoup(g("0000000")), { allume: false, flamme: [false, false], eteint: false });
  assert.deepEqual(feuDuCoup(g("00000000")), { allume: true, flamme: [false, false], eteint: false });     // 8 points de suite
  assert.deepEqual(feuDuCoup(g("000000000")), { allume: false, flamme: [false, false], eteint: false });   // (seulement au moment où elle prend)
  assert.deepEqual(feuDuCoup(g("000000")), { allume: false, flamme: [true, false], eteint: false });     // la petite flamme (pour le Chiromancien)
  assert.deepEqual(feuDuCoup(g("111111")), { allume: false, flamme: [false, true], eteint: false });
  assert.deepEqual(feuDuCoup(g("1111111")), { allume: false, flamme: [false, false], eteint: false });     // (l'adversaire : pas « Il est en feu »)
  assert.deepEqual(feuDuCoup(g("0000001")), { allume: false, flamme: [false, false], eteint: true });      // la flamme (6 points) s'éteint
  assert.deepEqual(feuDuCoup(g("00001")), { allume: false, flamme: [false, false], eteint: false });       // (la fumée seulement : on ne dit rien)
  assert.deepEqual(feuDuCoup(g("1111110")), { allume: false, flamme: [false, false], eteint: true });      // chez l'adversaire aussi
});

test("le point décisif : à 14 partout du set décisif, puis après le 15e point (finale : deux répliques de Roland)", () => {
  // un match au set décisif, 14 partout, après 14-13 (j'étais mené : balle de match sauvée)
  const a14 = () => {
    const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 });
    Object.assign(m, { sets: [1, 1], scoresSets: [[11, 5], [5, 11]], points: [13, 14] });
    return m;
  };
  const ids = l => l.map(x => x.id).join(" ");
  for (let k = 0; k < 20; k++) {
    const rng = rngFixe(100 + k);
    // en finale : le point décisif est toujours commenté, avec ses grandes phrases
    const m = a14(), etat = nouvelEtatAnnonces({ finale: true });
    const a = annoncerCoup(m, jouerCoup(m, PIERRE, CISEAUX), etat, {}, rng);   // 14-14
    assert.ok(a.commentaire && POOLS.point_decisif.some(e => e.base === baseDe(a.commentaire.id)), `14-14 en finale : ${ids(a.lignes)}`);
    const b = annoncerCoup(m, jouerCoup(m, PIERRE, CISEAUX), etat, {}, rng);   // 15-14 : le titre
    const sacre = b.lignes.filter(l => POOLS.sacre_point_decisif.some(e => e.base === baseDe(l.id)));
    assert.equal(sacre.length, 2, `finale gagnée 15-14 : ${ids(b.lignes)}`);
    assert.notEqual(sacre[0].id, sacre[1].id);
    // hors finale, perdu 15-14
    const m2 = a14(), e2 = nouvelEtatAnnonces();
    annoncerCoup(m2, jouerCoup(m2, PIERRE, CISEAUX), e2, {}, rng);
    const c = annoncerCoup(m2, jouerCoup(m2, CISEAUX, PIERRE), e2, {}, rng);
    assert.ok(c.lignes.some(l => POOLS.match_perdu_point_decisif.some(e => e.base === baseDe(l.id))), `perdu 15-14 : ${ids(c.lignes)}`);
  }
  // pas de grandes phrases de finale hors finale
  const finale = POOLS.point_decisif.filter(e => e.si === "en_finale" || e.si === "quatorze_finale").map(e => e.base);
  for (let k = 0; k < 40; k++) {
    const m = a14(), etat = nouvelEtatAnnonces(), a = annoncerCoup(m, jouerCoup(m, PIERRE, CISEAUX), etat, {}, rngFixe(300 + k));
    assert.ok(!a.commentaire || !finale.includes(baseDe(a.commentaire.id)));
  }
});

test("la leçon (6 points d'avance ou plus) et le temps additionnel (11 partout ou plus) : dits parfois, jamais à tort", () => {
  const de = (moment, l) => l.some(x => POOLS[moment].some(e => e.base === baseDe(x.id)));
  let lecon = 0, prolong = 0;
  for (let k = 0; k < 60; k++) {
    // je mène 6-0 (après des égalités, pour qu'il y ait assez de coups), et je marque : 7-0
    const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), etat = nouvelEtatAnnonces(), rng = rngFixe(500 + k);
    for (let i = 0; i < 4; i++) jouerCoup(m, PIERRE, PIERRE);
    Object.assign(m, { points: [6, 0] });
    if (de("lecon", annoncerCoup(m, jouerCoup(m, PIERRE, CISEAUX), etat, {}, rng).lignes)) lecon++;
    // 10-11, j'égalise : 11 partout
    const m2 = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), e2 = nouvelEtatAnnonces();
    for (let i = 0; i < 4; i++) jouerCoup(m2, PIERRE, PIERRE);
    Object.assign(m2, { points: [10, 11] });
    if (de("prolongations", annoncerCoup(m2, jouerCoup(m2, PIERRE, CISEAUX), e2, {}, rng).lignes)) prolong++;
    // 4-0 → 5-0 : pas de leçon ; 9-9 → 10-9 : pas de temps additionnel
    const m3 = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), e3 = nouvelEtatAnnonces();
    for (let i = 0; i < 4; i++) jouerCoup(m3, PIERRE, PIERRE);
    Object.assign(m3, { points: [4, 0] });
    assert.ok(!de("lecon", annoncerCoup(m3, jouerCoup(m3, PIERRE, CISEAUX), e3, {}, rng).lignes));
  }
  assert.ok(lecon > 10 && prolong > 5, `leçon ${lecon}, temps additionnel ${prolong}`);
});

test("la fin du premier set selon l'écart (3-4, 5-6, 7 et plus), dite parfois ; jamais à 2 points d'écart ni au 2e set", () => {
  const de = (moment, l) => l.some(x => POOLS[moment].some(e => e.base === baseDe(x.id)));
  const finSet = (moi, lui, sets = [0, 0], scoresSets = []) => {
    const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 });
    for (let i = 0; i < 4; i++) jouerCoup(m, PIERRE, PIERRE);
    Object.assign(m, { points: [10, lui], sets, scoresSets });
    return m;
  };
  let vus = { premier_set_net: 0, premier_set_large: 0, premier_set_ecrase: 0 };
  for (let k = 0; k < 60; k++) {
    for (const [lui, pool] of [[7, "premier_set_net"], [5, "premier_set_large"], [2, "premier_set_ecrase"]]) {
      const m = finSet(10, lui), a = annoncerCoup(m, jouerCoup(m, PIERRE, CISEAUX), nouvelEtatAnnonces(), {}, rngFixe(700 + k));
      if (de(pool, a.lignes)) vus[pool]++;
    }
    const m2 = finSet(10, 9), a2 = annoncerCoup(m2, jouerCoup(m2, PIERRE, CISEAUX), nouvelEtatAnnonces(), {}, rngFixe(800 + k));
    assert.ok(!["premier_set_net", "premier_set_large", "premier_set_ecrase"].some(p => de(p, a2.lignes)));
    const m3 = finSet(10, 2, [1, 0], [[11, 5]]), a3 = annoncerCoup(m3, jouerCoup(m3, PIERRE, CISEAUX), nouvelEtatAnnonces(), {}, rngFixe(900 + k));
    assert.ok(!["premier_set_net", "premier_set_large", "premier_set_ecrase"].some(p => de(p, a3.lignes)));
  }
  for (const n of Object.values(vus)) assert.ok(n > 10, JSON.stringify(vus));
});

test("avant le match, Roland interroge Monique, après « Bienvenue… » (bonsoir le soir, bonjour le jour)", () => {
  let vu = 0;
  for (let k = 0; k < 80; k++) {
    for (const [heure, mot] of [[21, "bonsoir"], [10, "bonjour"]]) {
      const a = annoncesAvantMatch({ moi: {}, adv: {}, heure }, rngFixe(1000 + k));
      const i = a.commentaires.findIndex(l => /^commentateur_dialogue_avant_monique_/.test(l.id));
      if (i < 0) continue;
      vu++;
      const intro = a.commentaires[i - 1];
      assert.ok(POOLS.presentation_direct.some(e => e.base === baseDe(intro.id)), intro.id);
      assert.match(intro.texte, /court central/);
      assert.ok(!new RegExp(mot === "bonsoir" ? "bonjour" : "bonsoir", "i").test(intro.texte), intro.texte);   // (jamais la mauvaise salutation)
      assert.match(a.commentaires[i + 1].id, /^commentatrice_(dialogue_avant_monique_|monique_porte_bonheur_)/);   // (ou une autre réponse au signe porte-bonheur)
    }
  }
  assert.ok(vu > 10, `vu ${vu} fois`);
  assert.ok(DIALOGUES_IDS.avant_monique.flat().every(id => !/1997/.test(CATALOGUE.get(id).texte)));   // (jamais un mot de 1997)
});

test("le signe porte-bonheur de Monique : Feuille, Pierre ou Ciseaux, à peu près une fois sur trois chacun", () => {
  const vus = { Feuille: 0, Pierre: 0, Ciseaux: 0 };
  for (let k = 0; k < 3000; k++) {
    const a = annoncesAvantMatch({ moi: {}, adv: {}, heure: 21 }, rngFixe(5000 + k));
    const i = a.commentaires.findIndex(l => l.id === "commentateur_dialogue_avant_monique_03");
    if (i < 0) continue;
    const r = a.commentaires[i + 1].texte;
    for (const s of Object.keys(vus)) if (r.startsWith(`L${s === "Ciseaux" ? "es" : "a"} ${s}`)) vus[s]++;
  }
  const n = vus.Feuille + vus.Pierre + vus.Ciseaux;
  assert.ok(n > 20, JSON.stringify(vus));
  for (const v of Object.values(vus)) assert.ok(v > n / 6, JSON.stringify(vus));
});

test("le signe abîmé : rejoué plus tard dans le set et perdu ; pas après un autre signe, pas au set suivant", async () => {
  const { signeAbime } = await import("../app/js/annonces.js");
  const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 });
  jouerCoup(m, CISEAUX, PIERRE); m.coups.at(-1).smash = [false, true];   // son smash Pierre abîme mes Ciseaux
  jouerCoup(m, FEUILLE, PIERRE);
  assert.equal(signeAbime(m), null);                                       // (il a perdu, mais pas avec ses Ciseaux)
  jouerCoup(m, CISEAUX, PIERRE);
  assert.deepEqual(signeAbime(m), { joueur: 0, signe: CISEAUX });
  jouerCoup(m, PIERRE, CISEAUX);
  assert.equal(signeAbime(m), null);                                       // (l'adversaire n'a rien d'abîmé)
  m.debutsSet.push(m.coups.length);                                        // set suivant : les mains sont réparées
  jouerCoup(m, CISEAUX, PIERRE);
  assert.equal(signeAbime(m), null);
});

test("gros lot 3 : signe fétiche, match qui n'en finit pas, David contre Goliath, premier match d'un joueur", () => {
  const de = (moment, l) => l.some(x => POOLS[moment]?.some(e => e.base === baseDe(x.id)));
  let fet = 0, long = 0, david = 0, favori = 0, exploit = 0, debut = 0;
  for (let k = 0; k < 120; k++) {
    // 5e point du set gagné avec la Pierre
    const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), e = nouvelEtatAnnonces(), rng = rngFixe(2000 + k);
    for (let i = 0; i < 4; i++) annoncerCoup(m, jouerCoup(m, PIERRE, CISEAUX), e, {}, rng);
    if (de("signe_fetiche", annoncerCoup(m, jouerCoup(m, PIERRE, CISEAUX), e, {}, rng).lignes)) fet++;
    // le 60e coup
    const m2 = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), e2 = nouvelEtatAnnonces();
    for (let i = 0; i < 59; i++) jouerCoup(m2, PIERRE, PIERRE);
    if (de("match_long", annoncerCoup(m2, jouerCoup(m2, PIERRE, CISEAUX), e2, {}, rng).lignes)) long++;
    // je suis le moins bien classé, je mène 4-1 : David mène ; l'adversaire est le moins bien classé : le favori mène
    for (const [o, compte] of [[0, "d"], [1, "f"]]) {
      const m3 = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), e3 = nouvelEtatAnnonces({ outsider: o });
      for (let i = 0; i < 4; i++) jouerCoup(m3, PIERRE, PIERRE);
      Object.assign(m3, { points: [3, 1] });
      const l = annoncerCoup(m3, jouerCoup(m3, FEUILLE, PIERRE), e3, {}, rng).lignes;
      if (compte === "d" && de("david_mene", l)) david++;
      if (compte === "f" && de("favori_mene", l)) favori++;
      assert.ok(!de(compte === "d" ? "favori_mene" : "david_mene", l));
    }
    // David gagne le match
    const m4 = nouveauMatch({ pointsParSet: 11, setsGagnants: 1 }), e4 = nouvelEtatAnnonces({ outsider: 0 });
    Object.assign(m4, { points: [10, 3] });
    if (de("david_gagne", annoncerCoup(m4, jouerCoup(m4, PIERRE, CISEAUX), e4, {}, rng).lignes)) exploit++;
    // premier match d'un joueur, en duel
    const a = annoncesAvantMatch({ moi: {}, adv: { etiquette: "debutant" }, humain: true }, rng);
    if (a.commentaires.some(l => /^commentateur_dialogue_avant_debutant_/.test(l.id))) debut++;
  }
  assert.ok(fet > 2, `fétiche : ${fet}`);   // (rare exprès : 35 % des fois, si les commentateurs ont de la réserve)
  for (const [nom, n] of Object.entries({ long, david, favori, exploit, debut })) assert.ok(n > 10, `${nom} : ${n}`);   // (le match long : une fois sur deux)
});

test("un set partout : à la fin du 2e set d'un match en 2 sets gagnants, souvent ; jamais en 3 sets gagnants", () => {
  const de = l => l.some(x => POOLS.un_set_partout.some(e => e.base === baseDe(x.id)));
  let vu = 0;
  for (let k = 0; k < 60; k++) {
    const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 });
    Object.assign(m, { sets: [0, 1], scoresSets: [[5, 11]], points: [10, 4] });
    if (de(annoncerCoup(m, jouerCoup(m, PIERRE, CISEAUX), nouvelEtatAnnonces(), {}, rngFixe(3000 + k)).lignes)) vu++;
    const m3 = nouveauMatch({ pointsParSet: 11, setsGagnants: 3 });
    Object.assign(m3, { sets: [0, 1], scoresSets: [[5, 11]], points: [10, 4] });
    assert.ok(!de(annoncerCoup(m3, jouerCoup(m3, PIERRE, CISEAUX), nouvelEtatAnnonces(), {}, rngFixe(3000 + k)).lignes));
  }
  assert.ok(vu > 25, `vu ${vu}`);
});

// (18 novembre) les répliques personnalisées du Chiromancien : seulement dans ses matchs, des deux côtés (moi ou l'adversaire)
test("le Chiromancien : ses répliques seulement dans ses matchs, sur ses séries, ses sets et sa fin de match", async () => {
  const { persoCommente } = await import("../app/js/chants-perso.js");
  assert.deepEqual(persoCommente({ pseudo: "Le Chiromancien", numero: 6047 }, null), { nom: "chiromancien", joueur: 0 });
  assert.deepEqual(persoCommente({ pseudo: "Kikou", numero: 1743 }, { pseudo: "le chiromancien", numero: 6047 }), { nom: "chiromancien", joueur: 1 });
  assert.equal(persoCommente({ pseudo: "Le Chiromancien", numero: 1 }, null), null, "le numéro compte");
  const perso = id => /_perso_chiromancien_/.test(id);
  for (const joueur of [0, 1, null]) {
    const rng = rngFixe(joueur === null ? 3 : joueur + 1), vus = new Set();
    for (let k = 0; k < 60; k++) {
      const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), etat = nouvelEtatAnnonces();
      if (joueur !== null) etat.perso = { nom: "chiromancien", joueur };
      while (!m.termine) {
        const e = jouerCoup(m, Math.floor(rng() * 3), Math.floor(rng() * 3));
        const a = annoncerCoup(m, e, etat, {}, rng);
        for (const l of a.lignes.filter(x => perso(x.id))) {
          assert.ok(CATALOGUE.has(l.id), l.id);
          const pool = /_perso_chiromancien_(\w+?)_\d\d/.exec(l.id)[1];
          if (pool === "lecture") assert.ok(e.finSet ? e.gagnant === joueur : etat.serie.joueur === joueur && etat.serie.n >= 3, `${l.id} : c'est lui qui gagne`);
          if (pool === "perd") assert.ok(etat.serie.joueur !== joueur && etat.serie.n >= 3 && !e.finSet, `${l.id} : c'est lui qui perd`);
          if (pool === "victoire") assert.ok(e.finMatch && e.gagnant === joueur, l.id);
          if (pool === "defaite") assert.ok(e.finMatch && e.gagnant !== joueur, l.id);
          if (!e.finSet) assert.ok(l.texte.length <= 62, `${l.id} : assez courte pour l'échange`);
          vus.add(pool);
        }
      }
    }
    if (joueur === null) assert.equal(vus.size, 0, "pas dans les matchs des autres");
    else for (const p of ["defaite", "lecture", "perd", "victoire"]) assert.ok(vus.has(p), `joueur ${joueur} : ${[...vus]}`);   // (« feu » : test à part)
  }
  // avant le match : sa présentation ou un dialogue sur lui, de temps en temps
  const dits = new Set();
  for (let k = 0; k < 200; k++) {
    const av = annoncesAvantMatch({ perso: { nom: "chiromancien", joueur: 0 } }, rngFixe(k));
    av.commentaires.filter(l => perso(l.id)).forEach(l => dits.add(baseDe(l.id)));
    // (sa présentation tient lieu d'ouverture : pas de « Mesdames et messieurs » en plus ; 19 novembre)
    if (av.commentaires.some(l => perso(l.id))) assert.ok(!av.commentaires.some(l => /avant_ouverture/.test(l.id)), av.commentaires.map(l => l.id).join());
  }
  assert.ok(dits.size >= 4 && [...dits].some(id => id.includes("_dialogue_")), [...dits].join());
  for (let k = 0; k < 100; k++) assert.ok(!annoncesAvantMatch({}, rngFixe(k)).commentaires.some(l => perso(l.id)));
});

test("le Chiromancien : Roland s'emballe quand sa main s'enflamme (6 points de suite), qu'il soit moi ou l'adversaire", () => {
  for (const joueur of [0, 1]) {
    let entendu = null;
    for (let k = 0; k < 30 && !entendu; k++) {
      const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), etat = nouvelEtatAnnonces(), rng = rngFixe(k);
      etat.perso = { nom: "chiromancien", joueur };
      for (let p = 0; p < 6; p++) {
        const e = joueur === 0 ? jouerCoup(m, 0, 1) : jouerCoup(m, 1, 0);
        const l = annoncerCoup(m, e, etat, {}, rng).lignes.find(x => /perso_chiromancien_feu/.test(x.id));
        if (l) { assert.equal(p, 5, "au 6e point"); entendu = l; }
      }
    }
    assert.ok(entendu, `joueur ${joueur}`);
  }
});

test("victoire en deux sets à zéro (match en 2 sets gagnants) : parfois l'analyse de Monique", () => {
  let dit = 0;
  for (let k = 0; k < 40; k++) {
    const m = nouveauMatch({ pointsParSet: 3, setsGagnants: 2 }), etat = nouvelEtatAnnonces(), rng = rngFixe(k);
    let a = null;
    while (!m.termine) a = annoncerCoup(m, jouerCoup(m, 0, 1), etat, {}, rng);
    if (a.lignes.some(l => /victoire_deux_zero/.test(l.id))) dit++;
  }
  assert.ok(dit >= 10 && dit <= 35, `${dit} fois sur 40`);
});

test("le Chiromancien en duel : ses répliques aux mêmes moments sur les deux téléphones (tirage commun)", async () => {
  const { hashTexte } = await import("../app/js/chants-perso.js");
  let total = 0;
  for (let k = 0; k < 40; k++) {
    const tirage = cle => hashTexte(`duel${k}:com:${cle}`) / 4294967296;
    const m1 = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), m2 = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 });
    const e1 = Object.assign(nouvelEtatAnnonces(), { perso: { nom: "chiromancien", joueur: 0 }, tirage });
    const e2 = Object.assign(nouvelEtatAnnonces(), { perso: { nom: "chiromancien", joueur: 1 }, tirage });
    const r1 = rngFixe(100 + k), r2 = rngFixe(900 + k), jeu = rngFixe(k);   // (chaque téléphone a son propre hasard)
    while (!m1.termine) {
      const a = Math.floor(jeu() * 3), b = Math.floor(jeu() * 3);
      const x1 = annoncerCoup(m1, jouerCoup(m1, a, b), e1, {}, r1), x2 = annoncerCoup(m2, jouerCoup(m2, b, a), e2, {}, r2);
      const p = x => x.lignes.filter(l => /_perso_/.test(l.id)).map(l => /_perso_chiromancien_(\w+?)_\d\d/.exec(l.id)[1]).join();
      assert.equal(p(x1), p(x2), `duel ${k}, coup ${m1.coups.length}`);
      if (p(x1)) total++;
    }
  }
  assert.ok(total >= 20, `${total} répliques personnalisées`);
});

test("l'avant-match dure 10 à 15 secondes (estimé d'après le texte), avec l'ouverture de Roland si besoin", () => {
  const duree = l => l.texte.length / (l.role === "commentatrice" ? 21 : 24) + 0.5;
  let ouvertures = 0;
  for (let k = 0; k < 300; k++) {
    const av = annoncesAvantMatch({ humain: k % 3 === 0, recents: [], situations: k % 4 ? [] : ["revanche"] }, rngFixe(k));
    const t = av.commentaires.reduce((x, l) => x + duree(l), 0);
    assert.ok(t >= 9 && t <= 15, `${t.toFixed(1)} s : ${av.commentaires.map(l => l.id).join()}`);
    if (av.commentaires.some(l => /avant_ouverture/.test(l.id))) ouvertures++;
  }
  assert.ok(ouvertures > 150, `${ouvertures} ouvertures`);
});

test("l'accueil du nouveau joueur : la bienvenue avant le 1er match, ses premiers points expliqués, la fin du 1er et du 3e match", () => {
  const av = annoncesAvantMatch({ accueil: 1 }, rngFixe(1));
  assert.equal(av.commentaires.length, 6);
  assert.ok(av.commentaires.every(l => /_dialogue_accueil_bienvenue_/.test(l.id)));
  assert.ok(annoncesAvantMatch({ accueil: 2 }, rngFixe(2)).commentaires.some(l => /accueil_deuxieme/.test(l.id)));
  const m = nouveauMatch({ pointsParSet: 7, setsGagnants: 1 }), etat = Object.assign(nouvelEtatAnnonces(), { accueil: 1 }), rng = rngFixe(3);
  const dits = [];
  const coups = [[0, 0], [0, 1], [0, 2], [1, 2], [2, 0], [0, 1], [1, 2], [2, 0], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]];
  let fin = null;
  for (const [a, b] of coups) { if (m.termine) break; const r = annoncerCoup(m, jouerCoup(m, a, b), etat, {}, rng); dits.push(...r.lignes.map(l => l.id)); if (m.termine) fin = r; }
  for (const k of ["egalite", "point_gagne", "point_perdu", "lecture", "smash"]) assert.ok(dits.some(id => id.includes(`_accueil_${k}_`)), k);
  assert.ok(fin && fin.lignes.some(l => /_dialogue_accueil_victoire_/.test(l.id)), "la fin du premier match");
  // le 4e match : plus rien de l'accueil
  assert.ok(!annoncesAvantMatch({ accueil: 0 }, rngFixe(4)).commentaires.some(l => /accueil/.test(l.id)));
});

// (24 novembre) les bots de Noël : leurs répliques comme un joueur, plus leur pouvoir sur leur smash réussi ; l'ambiance des fêtes
test("les bots de Noël : présentation, pouvoir du smash réussi, fin du match ; l'ambiance de Noël une fois par match au plus", () => {
  for (const nom of ["perenoel", "lutin", "renne", "neige"]) {
    assert.ok(POOLS[`perso_${nom}_presentation`]?.length && POOLS[`perso_${nom}_smash`]?.length, nom);
    let presente = 0;
    for (let k = 0; k < 50; k++) if (annoncesAvantMatch({ perso: { nom, joueur: 1, bot: true } }, rngFixe(k)).commentaires.some(l => l.id.includes(`_perso_${nom}_presentation_`))) presente++;
    assert.ok(presente >= 35, `${nom} : présenté ${presente} fois sur 50`);
  }
  const rng = rngFixe(11);
  let smashs = 0, pouvoirs = 0, ambiances = 0;
  for (let k = 0; k < 40; k++) {
    const m = nouveauMatch({ pointsParSet: 11, setsGagnants: 2 }), etat = nouvelEtatAnnonces();
    Object.assign(etat, { perso: { nom: "lutin", joueur: 1, bot: true }, noel: true });
    let ambianceMatch = 0;
    while (!m.termine) {
      const smash = [false, rng() < 0.08];
      const e = jouerCoup(m, Math.floor(rng() * 3), Math.floor(rng() * 3));
      const a = annoncerCoup(m, e, etat, { smash }, rng);
      const gagne = smash[1] && e.gagnant === 1 && !e.finMatch;
      if (gagne) smashs++;
      for (const l of a.lignes) {
        if (l.id.includes("_perso_lutin_smash_")) { assert.ok(gagne, `${l.id} : seulement sur son smash réussi`); pouvoirs++; }
        if (l.id.includes("_noel_ambiance_")) ambianceMatch++;
      }
    }
    assert.ok(ambianceMatch <= 1, "l'ambiance de Noël : une fois par match au plus"); ambiances += ambianceMatch;
  }
  assert.ok(pouvoirs >= smashs * 0.6, `pouvoir dit ${pouvoirs} fois sur ${smashs} smashs réussis`);
  assert.ok(ambiances > 5, `ambiance de Noël : ${ambiances}`);
});

// (24 novembre, remarque du porteur du projet : « Huit partout » dit à 5-5 dans un set de 7)
test("« Huit partout » : seulement à 8-8, jamais à 5-5 dans un set de 7", () => {
  const huit = new Set(POOLS.money_time.filter(e => e.huit).map(e => e.base));
  assert.equal(huit.size, 2);
  const dits = pts => {
    const rng = rngFixe(pts), vus = [];
    for (let k = 0; k < 150; k++) {
      const m = nouveauMatch({ pointsParSet: pts, setsGagnants: 1 }), etat = nouvelEtatAnnonces();
      while (!m.termine) { const e = jouerCoup(m, Math.floor(rng() * 3), Math.floor(rng() * 3)); vus.push(...annoncerCoup(m, e, etat, {}, rng).lignes.map(l => l.id)); }
    }
    return vus.filter(id => [...huit].some(b => id.startsWith(b)));
  };
  assert.equal(dits(7).length, 0, "set de 7 : jamais");
  assert.ok(dits(11).length > 0, "set de 11 : oui, à 8-8");
});
