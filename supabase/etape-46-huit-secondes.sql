-- HandSlam — Étape 46 : 8 secondes pour jouer un coup (au lieu de 5).
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ».
-- Nécessite l'étape 3. Peut être relancé sans risque.
--
-- Décision du porteur du projet (20 octobre), après les remarques de deux testeurs (« pas le temps de réfléchir ») :
-- 8 secondes par coup partout. À coller AVANT de valider la nouvelle version de l'appli : sinon, en ligne,
-- le serveur jouerait un coup au hasard au bout de 5 secondes alors que la barre de l'appli n'est pas finie.

create or replace function public._duree_coup() returns interval language sql immutable as $$ select interval '8 seconds' $$;
