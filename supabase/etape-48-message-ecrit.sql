-- HandSlam — Étape 48 : écrire son propre message à un ami, avant ou après le duel.
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 47. Peut être relancé sans risque.
--
-- Décision du porteur du projet (22 octobre) : en plus des phrases toutes faites (étape 22), on peut écrire son message,
-- seulement entre amis (amitié acceptée). Mêmes garde-fous que l'enjeu (étape 34) : 60 caractères au plus, sans argent,
-- sans lien, sans gros mots (mêmes règles que app/js/messages-rapides.js). Il voyage avec le préfixe « libre: ».
-- L'adversaire peut toujours masquer les messages (option de l'appli) et signaler un joueur.

-- Le message écrit, rangé (espaces en trop retirés), ou une erreur claire.
create or replace function public._message_libre_propre(p_texte text) returns text
language plpgsql immutable set search_path = public as $$
declare t text := btrim(regexp_replace(coalesce(p_texte, ''), '\s+', ' ', 'g'));
        s text;
begin
  s := lower(translate(t, 'àâäáãåçéèêëíìîïñóòôöõúùûüýÿÀÂÄÁÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝ', 'aaaaaaceeeeiiiinooooouuuuyyaaaaaaceeeeiiiinooooouuuuy'));
  if char_length(t) < 2 then raise exception 'Le message est trop court.'; end if;
  if char_length(t) > 60 then raise exception 'Le message est trop long (60 caractères au plus).'; end if;
  if s ~ '[€$£]' or s ~ '\yeuros?\y' or s ~ '\ydollars?\y' or s ~ '\d+\s*(balles|e)\y' then raise exception 'Pas d''argent dans un message.'; end if;
  if s ~ 'https?:|www\.|\.(com|fr|net|org)\y' then raise exception 'Pas de lien dans un message.'; end if;
  if exists (select 1 from unnest(regexp_split_to_array(s, '[^a-z0-9]+')) m where m = any (_mots_interdits_enjeu())) then
    raise exception 'Ce message contient un mot interdit.';
  end if;
  return t;
end $$;

-- Envoyer un message : une seule fois avant le match (présentation), une seule fois après (match terminé).
-- Remplace la version de l'étape 22 : en plus, le message écrit entre amis (« libre:… »).
create or replace function public.envoyer_message(p_id uuid, p_message text) returns public.duels
language plpgsql security definer set search_path = public as $$
declare d public.duels; moi smallint; v_moment text; amis boolean;
begin
  select * into d from duels where id = p_id for update;
  if d.id is null then raise exception 'Duel introuvable'; end if;
  moi := _ma_place(d);
  if d.phase = 'presentation' then v_moment := 'avant';
  elsif d.phase = 'termine' and d.vainqueur is not null then v_moment := case when d.vainqueur = moi then 'vainqueur' else 'vaincu' end;
  else raise exception 'Les messages s''envoient avant ou après le match';
  end if;
  amis := exists (select 1 from amities where a = least(d.j0, d.j1) and b = greatest(d.j0, d.j1) and statut = 'amis');
  if p_message like 'libre:%' then
    if not amis then raise exception 'Les messages écrits sont réservés aux amis'; end if;
    p_message := 'libre:' || _message_libre_propre(substr(p_message, 7));
  elsif p_message = any(_messages_rapides(v_moment, true)) then
    if not amis then raise exception 'Ce message est réservé aux amis'; end if;
  elsif p_message is null or not (p_message = any(_messages_rapides(v_moment, false))) then
    raise exception 'Message inconnu';
  end if;
  if v_moment = 'avant' then
    if moi = 0 then update duels set message_avant0 = coalesce(message_avant0, p_message), maj_le = now() where id = p_id returning * into d;
    else update duels set message_avant1 = coalesce(message_avant1, p_message), maj_le = now() where id = p_id returning * into d; end if;
  else
    if moi = 0 then update duels set message_apres0 = coalesce(message_apres0, p_message), maj_le = now() where id = p_id returning * into d;
    else update duels set message_apres1 = coalesce(message_apres1, p_message), maj_le = now() where id = p_id returning * into d; end if;
  end if;
  return d;
end $$;

revoke all on function public._message_libre_propre(text) from public, anon, authenticated;
revoke all on function public.envoyer_message(uuid, text) from public, anon;
grant execute on function public.envoyer_message(uuid, text) to authenticated;
