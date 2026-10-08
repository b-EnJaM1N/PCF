-- HandSlam — Étape 34 : le défi avec enjeu, entre amis.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ».
-- Nécessite les étapes 2 à 33. Peut être relancé sans risque.
--
-- Décision du porteur du projet (8 octobre) : en défiant un ami, on peut ajouter un enjeu (facultatif), un texte court
-- (« Qui fait la vaisselle ce soir ? »). L'ami le voit avant d'accepter : accepter le défi, c'est accepter l'enjeu.
-- Le perdant est annoncé à la fin du match. L'enjeu repose sur l'honneur : l'appli annonce, elle ne vérifie pas.
-- Garde-fous : seulement entre amis (amitié acceptée), 60 caractères au plus, sans argent, sans lien, sans gros mots
-- (mêmes règles que app/js/enjeux.js ; un test compare les listes). Seuls les deux joueurs voient l'enjeu.

alter table public.duels add column if not exists enjeu text;

-- Les gros mots refusés (sans accents ; mots entiers).
create or replace function public._mots_interdits_enjeu() returns text[] language sql immutable as $$ select array['connard', 'connasse', 'conasse', 'salope', 'pute', 'putain', 'encule', 'enculer', 'nique', 'niquer', 'ntm', 'fdp', 'batard', 'pd', 'pede', 'tapette', 'gouine', 'negre', 'bougnoule', 'youpin', 'salaud', 'pouffiasse', 'petasse'] $$;

-- L'enjeu rangé (espaces en trop retirés), ou une erreur claire.
create or replace function public._enjeu_propre(p_enjeu text) returns text
language plpgsql immutable set search_path = public as $$
declare t text := btrim(regexp_replace(coalesce(p_enjeu, ''), '\s+', ' ', 'g'));
        s text;
begin
  s := lower(translate(t, 'àâäáãåçéèêëíìîïñóòôöõúùûüýÿÀÂÄÁÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝ', 'aaaaaaceeeeiiiinooooouuuuyyaaaaaaceeeeiiiinooooouuuuy'));
  if char_length(t) < 3 then raise exception 'L''enjeu est trop court.'; end if;
  if char_length(t) > 60 then raise exception 'L''enjeu est trop long (60 caractères au plus).'; end if;
  if s ~ '[€$£]' or s ~ '\yeuros?\y' or s ~ '\ydollars?\y' or s ~ '\d+\s*(balles|e)\y' then
    raise exception 'Pas d''argent dans un enjeu : un gage entre amis, pas un pari.';
  end if;
  if s ~ 'https?:|www\.|\.(com|fr|net|org)\y' then raise exception 'Pas de lien dans un enjeu.'; end if;
  if exists (select 1 from unnest(regexp_split_to_array(s, '[^a-z0-9]+')) m where m = any (_mots_interdits_enjeu())) then
    raise exception 'Cet enjeu contient un mot interdit.';
  end if;
  return t;
end $$;

-- Défier un ami avec un enjeu : le défi habituel (étape 14 : format, officiel ou amical, mise), plus l'enjeu.
create or replace function public.lancer_defi_avec_enjeu(p_adversaire uuid, p_points int, p_sets int, p_classe boolean default true,
  p_mise int default 0, p_enjeu text default null) returns public.duels
language plpgsql security definer set search_path = public as $$
declare d public.duels; e text := _enjeu_propre(p_enjeu);
begin
  if p_adversaire is null or not exists (select 1 from amities where a = least(auth.uid(), p_adversaire) and b = greatest(auth.uid(), p_adversaire) and statut = 'amis') then
    raise exception 'Un enjeu se lance seulement entre amis : ajoute-le d''abord en ami.';
  end if;
  d := lancer_defi(p_adversaire, p_points, p_sets, p_classe, p_mise);
  update duels set enjeu = e where id = d.id returning * into d;
  return d;
end $$;

revoke all on function public._mots_interdits_enjeu(), public._enjeu_propre(text) from public, anon, authenticated;
revoke all on function public.lancer_defi_avec_enjeu(uuid, int, int, boolean, int, text) from public, anon;
grant execute on function public.lancer_defi_avec_enjeu(uuid, int, int, boolean, int, text) to authenticated;
