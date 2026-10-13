// La carte du monde, vue de dessus façon premiers Mario (dessin : app/img/aventure/carte.webp, 1024 × 1536).
// Ici, la place des étapes sur le chemin et le trajet du héros entre elles, en pixels de l'image ;
// aventure-jeu.js pose les étapes et le héros par-dessus le dessin.

export const IMAGE = "img/aventure/carte.webp";
export const LARGEUR = 1024, HAUTEUR = 1536;
export const DEPART = { x: 507, y: 1452 };        // le triangle rouge, en bas
// Les étapes, dans l'ordre des adversaires, avec le chemin (à angles droits) depuis l'étape précédente ou le départ.
export const ETAPES = [
  { x: 388, y: 1315, chemin: [[507, 1452], [507, 1315], [388, 1315]] },
  { x: 600, y: 1135, chemin: [[388, 1315], [268, 1315], [268, 1135], [600, 1135]] },
  { x: 520, y: 945, chemin: [[600, 1135], [780, 1135], [780, 945], [520, 945]] },
  { x: 600, y: 735, chemin: [[520, 945], [294, 945], [294, 735], [600, 735]] },        // par le pont
  { x: 480, y: 545, chemin: [[600, 735], [807, 735], [807, 545], [480, 545]] },
  { x: 433, y: 140, chemin: [[480, 545], [255, 545], [255, 350], [590, 350], [590, 190], [433, 190], [433, 140]] },
];
export const MS_PAR_PIXEL = 2.6;                   // la vitesse de marche du héros

// Le trajet du héros entre deux positions (-1 : le départ ; 0 à 5 : les étapes), point par point.
export function trajet(de, vers) {
  if (de === vers) return [];
  if (vers > de) return ETAPES.slice(de + 1, vers + 1).flatMap(e => e.chemin.slice(1));
  return ETAPES.slice(vers + 1, de + 1).reverse().flatMap(e => e.chemin.slice(0, -1).reverse());
}
export const position = i => (i < 0 ? DEPART : ETAPES[i]);
