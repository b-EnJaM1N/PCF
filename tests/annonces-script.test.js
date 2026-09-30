import { test } from "node:test";
import assert from "node:assert/strict";
import { CATALOGUE, replique, repliqueScore, repliquePartout, POOLS, DIALOGUES_IDS } from "../app/js/voix/script.js";
import { annoncerCoup, annonceDebutSet, nouvelEtatAnnonces, annoncesAvantMatch, interview, etiquetteDe } from "../app/js/annonces.js";
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
  assert.equal(replique("commentatrice_dialogue_fin_set_02").texte, "Nous n'en parlerons pas.");
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
  assert.ok(coms > 0 && coms < coups / 8, `${coms} commentaires pour ${coups} coups`);
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
  const moi = { surnom: surnomDe(P), genre: "f", etiquette: etiquetteDe(P) };
  const { speaker, commentaires } = annoncesAvantMatch({ moi, adv: { bot: "rocky" }, tour: "finale" }, () => 0);
  assert.deepEqual(speaker.map(l => l.id), ["speaker_finale_01", "speaker_coin_jaune_01", "speaker_debutant_01",
    "speaker_surnom_le_bleu_01", "speaker_surnom_de_l_ombre_01", "speaker_coin_rouge_01", "speaker_bot_rocky_01", "speaker_cloture_01"]);
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
