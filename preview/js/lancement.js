// La version de lancement : tant qu'il y a peu de joueurs, on cache ce qui a besoin de monde pour être bien
// (Grand Chelem, grandes salles de Sit & Go, grosses mises, divisions, classement du mois). Rien n'est supprimé :
// le jour où il y aura du monde, passer « actif » à false réaffiche tout.
// Dans la page : un élément marqué class="cache-lancement" est caché tant que la version de lancement est active.
export const LANCEMENT = { actif: true };

// Les mises proposées (duels et Sit & Go) et les tailles de Sit & Go montrées.
export const misesVisibles = mises => LANCEMENT.actif ? mises.filter(m => m <= 100) : mises;
export const taillesVisibles = tailles => LANCEMENT.actif ? tailles.filter(n => n === 2 || n === 8) : tailles;
