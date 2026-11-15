// Les routines d'entrée (14 novembre, idée d'un testeur, choix du porteur du projet) : pendant la présentation du match, la main
// de chaque joueur fait sa routine d'avant-match, comme les gestes de victoire de la boutique.
// Une routine : une suite d'images de la main (le signe dessiné, et sa durée en millisecondes), et un mouvement d'ensemble
// (classe CSS « routine-… », voir style.css). Elle se joue en boucle pendant la présentation.

export const ROUTINES = {
  salut: { nom: "Le salut à la foule", images: [["feuille", 1000]], mouvement: "salut" },
  shadow: { nom: "Le shadow boxing", images: [["pierre", 1000]], mouvement: "shadow" },
  pianiste: { nom: "L'échauffement du pianiste", images: [["feuille-p0", 140], ["feuille-p2", 140], ["feuille-p1", 140], ["feuille-p3", 140], ["feuille", 320]] },
  viens: { nom: "« Viens par ici ! »", images: [["index", 380], ["index-plie", 260], ["index", 260], ["index-plie", 260], ["index", 700]] },
  claque: { nom: "Les ciseaux qui claquent", images: [["ciseaux", 200], ["ciseaux-ferme", 140], ["ciseaux", 200], ["ciseaux-ferme", 140], ["ciseaux", 600]] },
  trois: { nom: "Pierre, Feuille, Ciseaux !", images: [["pierre", 380], ["feuille", 380], ["ciseaux", 380], ["pierre", 600]], mouvement: "rebond" },
  // (14 novembre au soir, accord du porteur du projet : « on les fait si c'est facile »)
  chut: { nom: "« Chut ! » au public", images: [["index", 1000]], mouvement: "chut" },
  craquer: { nom: "Craquer les doigts", images: [["feuille", 300], ["feuille-c0", 220], ["feuille-c1", 220], ["feuille-c2", 220], ["feuille-c3", 300], ["feuille", 500]] },
  vague: { nom: "La vague", images: [["feuille-p0", 110], ["feuille-p1", 110], ["feuille-p2", 110], ["feuille-p3", 110], ["feuille-p2", 110], ["feuille-p1", 110], ["feuille-p0", 110], ["feuille", 400]] },
  montre: { nom: "Regarder sa montre", images: [["pierre", 1000]], mouvement: "montre" },
};
export const routineValide = r => (ROUTINES[r] ? r : null);

// Les signes à dessiner pour une routine (une image par signe différent, dans l'ordre d'apparition).
export const signesDe = r => [...new Set((ROUTINES[r]?.images || []).map(([s]) => s))];
// La durée d'un tour de la routine.
export const dureeDe = r => (ROUTINES[r]?.images || []).reduce((t, [, ms]) => t + ms, 0);

// Joue la routine r dans l'élément el (dessin : signe → SVG de la main). Renvoie une fonction pour l'arrêter.
// Sans animation (l'appareil le demande) : la première image, immobile.
// surImage(signe) : appelé à chaque nouvelle image (pour un son : le « crac » des doigts, le « clac » des ciseaux).
export function jouerRoutine(el, r, dessin, { reduit = false, surImage = null } = {}) {
  const def = ROUTINES[r];
  if (!el || !def) return () => {};
  const signes = signesDe(r);
  el.innerHTML = `<span class="routine${def.mouvement && !reduit ? ` routine-${def.mouvement}` : ""}">${signes.map((s, i) => `<span class="routine-image"${i ? " hidden" : ""} data-s="${s}">${dessin(s)}</span>`).join("")}</span>`;
  if (reduit || def.images.length < 2) return () => {};
  const images = [...el.querySelectorAll(".routine-image")];
  let i = 0, t = 0, fini = false;
  const montrer = () => {
    if (fini) return;
    const [s, ms] = def.images[i % def.images.length];
    images.forEach(x => { x.hidden = x.dataset.s !== s; });
    if (i) surImage?.(s);
    i++; t = setTimeout(montrer, ms);
  };
  montrer();
  return () => { fini = true; clearTimeout(t); };
}
