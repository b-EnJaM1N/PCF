// Présentation d'avant-match, façon boxe : les deux fiches face à face
// et quelques statistiques marquantes, ligne par ligne.
import { EMOJI, NOM, texteFormat } from "./regles.js";
import { indiceImprevisibilite } from "./analyse.js";
import { nomAffiche, dernierTitre, titresObtenus, signeFavori } from "./profil.js";

const pourcent = (a, b) => (b ? Math.round(100 * a / b) : null);

// Renvoie { bandeau, format, joueur, adversaire, lignes, cle }.
// Chaque ligne : { label, g, d } (texte à gauche et à droite) ; pour les nombres,
// gn / dn donnent la valeur (animée à l'écran) et `avantage` le côté mis en valeur.
// Duel : classementMoi = mon niveau officiel (s'il est connu), classe = false pour un duel amical.
export function presentation(P, bot, { tour = null, pointsParSet = 11, setsGagnants = 2, classementMoi = null, classe = true, tournoi = false } = {}) {
  const f = P.faceAFace[bot.id] || { v: 0, d: 0, signes: [0, 0, 0] };
  const fav = signeFavori(P.signes);
  const imp = P.lisibles >= 10 ? indiceImprevisibilite(P.devines / P.lisibles) : null;
  const titres = titresObtenus(P).length;
  const nombre = (label, gn, dn, suffixe = "") => ({
    label, gn, dn, g: gn === null ? "–" : `${gn}${suffixe}`, d: dn === null ? "–" : `${dn}${suffixe}`,
    avantage: gn === null || dn === null || gn === dn ? null : gn > dn ? "g" : "d",
  });
  const lignes = [
    bot.humain ? nombre("Niveau officiel", classementMoi ?? null, bot.classement ?? null) : nombre("Niveau", P.elo, bot.elo),
    nombre("Face-à-face", f.v, f.d),
    { label: "Arme favorite", g: fav === null ? "–" : `${EMOJI[fav]} ${NOM[fav]}`, d: bot.specialite, avantage: null },
    nombre("Imprévisibilité", imp, bot.imprevisibilite, "/100"),
    bot.humain ? nombre("Titres", titres, bot.titres) : { label: "Titres", g: String(titres), d: bot.id === "professeur" ? "Légende" : "–", avantage: null },
  ];
  const pct = pourcent(P.victoires, P.matchs);
  return {
    bandeau: bot.humain ? (tournoi ? "Tournoi en ligne" : classe ? "Duel officiel" : "Duel amical") : tour === null ? "Match amical" : `HandSlam Open · ${tour}`,
    format: texteFormat({ pointsParSet, setsGagnants }),
    joueur: {
      nom: nomAffiche(P), sous: `${P.drapeau} ${dernierTitre(P)}`,
      bilan: P.matchs ? `${P.victoires} V – ${P.matchs - P.victoires} D · ${pct} % de victoires` : "Premier match officiel",
    },
    adversaire: { nom: bot.nom, sous: bot.style, bilan: bot.humain ? bot.desc : `« ${bot.desc.charAt(0).toUpperCase() + bot.desc.slice(1)} »` },
    lignes,
    cle: f.v + f.d ? `${f.v + f.d}ᵉ face-à-face.` : "Premier face-à-face.",
  };
}
