-- HandSlam — Étape 67 : un message de chambrage de plus avant le match, « Tu vas pleurer. ».
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Peut être relancé sans risque.
--
-- 11 novembre (demande du porteur du projet) : à côté de « Prépare-toi à souffrir. », pour que la fenêtre des messages,
-- rangée en deux colonnes, soit pleine. Les messages retirés de l'appli le même jour (chatoune, faux rebond, ton père, padawan,
-- déculottée) restent acceptés : une ancienne version de l'appli peut encore les envoyer.

-- Les messages permis à un moment donné : tout public (annonces comprises), ou réservés aux amis. Remplace la version de l'étape 53.
create or replace function public._messages_rapides(p_moment text, p_amis boolean) returns text[]
language sql immutable set search_path = public as $$
  select case
    when p_moment = 'avant' and not p_amis then array['ouvre_p', 'ouvre_f', 'ouvre_c', 'sais_p', 'sais_f', 'sais_c', 'pas_p', 'pas_f', 'pas_c', 'joue_p', 'joue_f', 'joue_c', 'bonne_chance', 'bon_match', 'meilleur_gagne', 'a_toi', 'bon_duel', 'on_y_va']
    when p_moment = 'avant' and p_amis then array['besoin', 'par_coeur', 'fumer', 'slip', 'souffrir', 'pleurer']
    when p_moment = 'entre_sets' and not p_amis then array['ouvre_p', 'ouvre_f', 'ouvre_c', 'sais_p', 'sais_f', 'sais_c', 'pas_p', 'pas_f', 'pas_c', 'joue_p', 'joue_f', 'joue_c', 'set_bien_joue', 'pas_fini', 'on_y_retourne', 'beau_set', 'concentre']
    when p_moment = 'entre_sets' and p_amis then array['regretter', 'echauffement', 'vrai_match', 'profite', 'chaud']
    when p_moment = 'vainqueur' and not p_amis then array['merci_match', 'beau_duel', 'toi_aussi', 'serre', 'revanche', 'gg']
    when p_moment = 'vainqueur' and p_amis then array['et_oui', 'boss', 'ton_pere', 'padawan', 'regles', 'deculottee']
    when p_moment = 'vaincu' and not p_amis then array['bien_joue', 'bravo', 'beau_duel', 'bravo_victoire', 'merci_duel', 'meritee']
    when p_moment = 'vaincu' and p_amis then array['chatoune', 'laisse_gagner', 'une_main', 'bug', 'faux_rebond', 'tactile']
    else array[]::text[]
  end
$$;
revoke all on function public._messages_rapides(text, boolean) from public, anon, authenticated;
