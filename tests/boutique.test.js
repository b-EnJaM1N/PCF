import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ARTICLES, RARETES, articleDe, possede, prixRemise, GESTES, CELEBRATIONS, CADRES } from "../app/js/catalogue.js";
import { FONDS, GANTS, POIGNETS, MOTIFS_GANT, avatarSVG } from "../app/js/avatar.js";
import { CRIS } from "../app/js/celebrations.js";
import { profilParDefaut, normaliserProfil, estVerrouille, remettreAZero } from "../app/js/profil.js";

test("les prix de l'appli et du serveur correspondent", () => {
  // le catalogue le plus récent du serveur (étape 47, qui remplace celui de l'étape 17)
  const sql = readFileSync(new URL("../supabase/etape-47-nouveaux-gestes.sql", import.meta.url), "utf8");
  const serveur = new Map([...sql.matchAll(/\('([a-zA-Z]+:[a-z_]+)', (\d+)\)/g)].map(m => [m[1], +m[2]]));
  assert.equal(serveur.size, ARTICLES.length);
  for (const x of ARTICLES) assert.equal(serveur.get(x.id), x.prix, x.id);
  assert.deepEqual(Object.values(RARETES).map(r => r.prix), [300, 800, 2000, 5000]);
});

test("chaque article existe vraiment dans l'appli", () => {
  const tables = { gant: GANTS, gantMotif: MOTIFS_GANT, fond: FONDS, poignet: POIGNETS, geste: GESTES, celebration: CELEBRATIONS, cadre: CADRES };
  for (const x of ARTICLES) {
    if (x.type === "cri") assert.ok(CRIS.find(c => c.id === x.cle && c.boutique), x.id);
    else assert.ok(tables[x.type][x.cle], x.id);
  }
  for (const x of ARTICLES.filter(y => y.categorie === "avatar")) assert.match(avatarSVG({ ...profilParDefaut().av, [x.type]: x.cle }), /<svg/, x.id);
  for (const g of Object.values(GESTES)) assert.match(avatarSVG({ ...profilParDefaut().av, symbole: g.symbole }), /<svg/);
  assert.ok(CRIS.find(c => c.t === "C'est qui le patron ?!"));
});

test("un article de la boutique est verrouillé tant qu'il n'est pas acheté", () => {
  const P = profilParDefaut();
  assert.ok(estVerrouille(P, "gant", "rose"));
  assert.ok(estVerrouille(P, "gant", "rouge") && !estVerrouille(P, "gant", "nu"), "avant le premier match : la main nue seulement");
  P.matchs = 1;
  assert.ok(!estVerrouille(P, "gant", "rouge"), "les couleurs de base restent libres (après le premier match)");
  assert.ok(!possede(P, "cri", "qui_le_patron") && possede(P, "cri", "vamos"));
  P.achats = ["gant:rose", "geste:uppercut"];
  assert.ok(!estVerrouille(P, "gant", "rose") && possede(P, "geste", "uppercut"));
  assert.equal(articleDe("fond", "galaxie").prix, 5000);
  assert.equal(prixRemise(800), 560);
  assert.equal(prixRemise(2000), 1400);
});

test("la fiche garde les achats et les choix, même après une remise à zéro", () => {
  const P = normaliserProfil({ achats: ["gant:rose", "celebration:or"], geste: "inconnu", celebration: "or", cadre: "or" });
  assert.equal(P.geste, "poing"); assert.equal(P.celebration, "or"); assert.equal(P.cadre, "or");
  P.av.gant = "rose";
  const N = remettreAZero(P);
  assert.deepEqual(N.achats, ["gant:rose", "celebration:or"]);
  assert.equal(N.av.gant, "rose", "un article acheté reste équipé");
  assert.equal(N.celebration, "or");
});

test("nouveaux gestes : trois à la boutique, deux gagnés avec un trophée", () => {
  const P = profilParDefaut();
  for (const g of ["coeur", "salut_militaire", "micro"]) { assert.ok(articleDe("geste", g), g); assert.ok(estVerrouille(P, "geste", g), g); }
  for (const g of ["check", "non_non"]) { assert.equal(articleDe("geste", g), null, g); assert.ok(estVerrouille(P, "geste", g), `${g} : verrouillé sans le trophée`); }
  P.titres = { gentleman: 1, phenix: 1 };
  assert.ok(!estVerrouille(P, "geste", "check") && !estVerrouille(P, "geste", "non_non"));
  assert.ok(!estVerrouille(P, "geste", "poing"), "le poing serré reste libre");
});

test("main nue : toutes les peaux et les petits accessoires sont gratuits, et se dessinent", async () => {
  const { PEAUX, ONGLES, BRACELETS, BAGUES } = await import("../app/js/avatar.js");
  const P = profilParDefaut();
  assert.equal(P.av.gant, "nu", "un nouveau joueur commence main nue");
  for (const [type, table] of [["peau", PEAUX], ["ongles", ONGLES], ["bracelet", BRACELETS], ["bague", BAGUES]])
    for (const k of Object.keys(table)) { assert.ok(!estVerrouille(P, type, k), `${type} ${k} : gratuit`); assert.equal(articleDe(type, k), null, `${type} ${k} : pas à la boutique`); }
  for (const symbole of ["pierre", "feuille", "ciseaux", "index", "pouce", "dos", "ciseaux-dos", "feuille-dos"]) {
    const svg = avatarSVG({ ...P.av, symbole, peau: "brune", ongles: "rouge", bracelet: "perles", bague: "rubis" });
    assert.match(svg, /#7A4A2A/, `${symbole} : la peau`); assert.match(svg, /#C2183A/, `${symbole} : la bague`);
  }
  assert.match(avatarSVG({ ...P.av, symbole: "feuille", ongles: "rouge" }), /#D7263D/, "le vernis sur la main nue");
  assert.doesNotMatch(avatarSVG({ ...P.av, gant: "blanc", symbole: "feuille", ongles: "rouge" }), /#D7263D/, "pas de vernis sur un gant");
});
