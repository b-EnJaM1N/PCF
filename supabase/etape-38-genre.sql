-- HandSlam — Étape 38 : le genre du joueur dans sa carte (pour accorder « Défiée ✓ », « elle »…).
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ».
-- Nécessite les étapes 2 à 37. Peut être relancé sans risque.
--
-- Demande du porteur du projet (10 octobre) : quand une amie est défiée, écrire « Défiée ✓ ».
-- Le genre est déjà dans la fiche du joueur (« il » ou « elle » pour les commentateurs) ; la carte d'un joueur
-- (amis, membres d'un cercle, tournois) le donne maintenant : 'f' ou 'm'.

-- La carte d'un joueur (remplace la version de l'étape 4) : avec le genre.
create or replace function public._carte(p_id uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('id', p.id, 'pseudo', p.pseudo, 'numero', p.numero, 'drapeau', p.drapeau, 'avatar', p.avatar,
    'classement', coalesce(c.points, _classement_depart()), 'joues', coalesce(c.joues, 0), 'gagnes', coalesce(c.gagnes, 0),
    'genre', case when p.fiche->>'genre' = 'f' then 'f' else 'm' end)
  from profils p left join classements c on c.joueur = p.id where p.id = p_id
$$;
