-- HandSlam — Étape 80 : les smileys dans les messages du duel.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Peut être relancé sans risque. Nécessite les étapes 2 à 79.
--
-- 18 novembre (demande du porteur du projet) :
-- 1. Neuf smileys tout faits (👏 🔥 😂 😱 😎 😤 💪 🙏 🤝), à tous les moments du duel, avec n'importe quel joueur (tout public).
-- 2. Entre amis, un message écrit fait d'un seul smiley est accepté (il était refusé comme « trop court » : un smiley compte
--    pour un caractère ici, pour deux sur le téléphone). Un seul caractère ordinaire (une lettre, un chiffre) reste trop court.

-- Les messages permis à un moment donné : tout public (annonces et smileys compris), ou réservés aux amis. Remplace l'étape 67.
create or replace function public._messages_rapides(p_moment text, p_amis boolean) returns text[]
language sql immutable set search_path = public as $$
  select case
    when p_moment = 'avant' and not p_amis then array['ouvre_p', 'ouvre_f', 'ouvre_c', 'sais_p', 'sais_f', 'sais_c', 'pas_p', 'pas_f', 'pas_c', 'joue_p', 'joue_f', 'joue_c', 'bonne_chance', 'bon_match', 'meilleur_gagne', 'a_toi', 'bon_duel', 'on_y_va', 's_bravo', 's_feu', 's_rire', 's_choc', 's_cool', 's_rage', 's_force', 's_merci', 's_main']
    when p_moment = 'avant' and p_amis then array['besoin', 'par_coeur', 'fumer', 'slip', 'souffrir', 'pleurer']
    when p_moment = 'entre_sets' and not p_amis then array['ouvre_p', 'ouvre_f', 'ouvre_c', 'sais_p', 'sais_f', 'sais_c', 'pas_p', 'pas_f', 'pas_c', 'joue_p', 'joue_f', 'joue_c', 'set_bien_joue', 'pas_fini', 'on_y_retourne', 'beau_set', 'concentre', 's_bravo', 's_feu', 's_rire', 's_choc', 's_cool', 's_rage', 's_force', 's_merci', 's_main']
    when p_moment = 'entre_sets' and p_amis then array['regretter', 'echauffement', 'vrai_match', 'profite', 'chaud']
    when p_moment = 'vainqueur' and not p_amis then array['merci_match', 'beau_duel', 'toi_aussi', 'serre', 'revanche', 'gg', 's_bravo', 's_feu', 's_rire', 's_choc', 's_cool', 's_rage', 's_force', 's_merci', 's_main']
    when p_moment = 'vainqueur' and p_amis then array['et_oui', 'boss', 'ton_pere', 'padawan', 'regles', 'deculottee']
    when p_moment = 'vaincu' and not p_amis then array['bien_joue', 'bravo', 'beau_duel', 'bravo_victoire', 'merci_duel', 'meritee', 's_bravo', 's_feu', 's_rire', 's_choc', 's_cool', 's_rage', 's_force', 's_merci', 's_main']
    when p_moment = 'vaincu' and p_amis then array['chatoune', 'laisse_gagner', 'une_main', 'bug', 'faux_rebond', 'tactile']
    else array[]::text[]
  end
$$;
revoke all on function public._messages_rapides(text, boolean) from public, anon, authenticated;

-- Le message écrit (entre amis) : remplace la version de l'étape 48 (seule la longueur minimale change).
create or replace function public._message_libre_propre(p_texte text) returns text
language plpgsql immutable set search_path = public as $$
declare t text := btrim(regexp_replace(coalesce(p_texte, ''), '\s+', ' ', 'g'));
        s text;
begin
  s := lower(translate(t, 'àâäáãåçéèêëíìîïñóòôöõúùûüýÿÀÂÄÁÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝ', 'aaaaaaceeeeiiiinooooouuuuyyaaaaaaceeeeiiiinooooouuuuy'));
  if char_length(t) = 0 or (char_length(t) = 1 and ascii(t) < 128) then raise exception 'Le message est trop court.'; end if;
  if char_length(t) > 60 then raise exception 'Le message est trop long (60 caractères au plus).'; end if;
  if s ~ '[€$£]' or s ~ '\yeuros?\y' or s ~ '\ydollars?\y' or s ~ '\d+\s*(balles|e)\y' then raise exception 'Pas d''argent dans un message.'; end if;
  if s ~ 'https?:|www\.|\.(com|fr|net|org)\y' then raise exception 'Pas de lien dans un message.'; end if;
  if exists (select 1 from unnest(regexp_split_to_array(s, '[^a-z0-9]+')) m where m = any (_mots_interdits_enjeu())) then
    raise exception 'Ce message contient un mot interdit.';
  end if;
  return t;
end $$;
revoke all on function public._message_libre_propre(text) from public, anon, authenticated;
