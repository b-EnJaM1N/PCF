import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ARTICLES, RARETES, articleDe, possede, prixRemise, GESTES, CELEBRATIONS, CADRES } from "../app/js/catalogue.js";
import { FONDS, GANTS, POIGNETS, MOTIFS_GANT, avatarSVG } from "../app/js/avatar.js";
import { CRIS } from "../app/js/celebrations.js";
import { profilParDefaut, normaliserProfil, estVerrouille, remettreAZero } from "../app/js/profil.js";

test("les prix de l'appli et du serveur correspondent", () => {
  const sql = readFileSync(new URL("../supabase/etape-17-boutique.sql", import.meta.url), "utf8");
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
  assert.ok(!estVerrouille(P, "gant", "rouge"), "les couleurs de base restent libres");
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
