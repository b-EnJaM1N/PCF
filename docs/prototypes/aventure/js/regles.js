// Les règles de base du pierre-feuille-ciseaux (Chifoumania).
export const PIERRE = 0, CISEAUX = 1, FEUILLE = 2;
// Pierre bat Ciseaux, Ciseaux bat Feuille, Feuille bat Pierre.
export const bat = (a, b) => (a + 1) % 3 === b;
// Le signe qui bat m.
export const contre = m => (m + 2) % 3;
