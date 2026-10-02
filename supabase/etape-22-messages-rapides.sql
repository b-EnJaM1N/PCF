-- HandSlam — Étape 22 : les messages rapides en duel.
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 21. Peut être relancé sans risque.
--
-- Principe : chaque joueur peut envoyer un message tout fait à son adversaire, un avant le match
-- (pendant la présentation) et un après (match terminé). Pas de texte libre : rien à modérer.
-- Le chambrage (« amis ») n'est permis qu'entre amis (demande d'ami acceptée).
-- La liste est la même que dans l'appli (app/js/messages-rapides.js ; un test vérifie qu'elles sont identiques).

alter table public.duels add column if not exists message_avant0 text;
alter table public.duels add column if not exists message_avant1 text;
alter table public.duels add column if not exists message_apres0 text;
alter table public.duels add column if not exists message_apres1 text;

-- Les messages permis à un moment donné : tout public, ou réservés aux amis.
create or replace function public._messages_rapides(p_moment text, p_amis boolean) returns text[]
language sql immutable set search_path = public as $$
  select case
    when p_moment = 'avant' and not p_amis then array['bonne_chance', 'bon_match', 'meilleur_gagne', 'a_toi', 'bon_duel', 'on_y_va']
    when p_moment = 'avant' and p_amis then array['besoin', 'par_coeur', 'fumer', 'slip', 'souffrir']
    when p_moment = 'vainqueur' and not p_amis then array['merci_match', 'beau_duel', 'toi_aussi', 'serre', 'revanche', 'gg']
    when p_moment = 'vainqueur' and p_amis then array['et_oui', 'boss', 'ton_pere', 'padawan', 'regles', 'deculottee']
    when p_moment = 'vaincu' and not p_amis then array['bien_joue', 'bravo', 'beau_duel', 'bravo_victoire', 'merci_duel', 'meritee']
    when p_moment = 'vaincu' and p_amis then array['chatoune', 'laisse_gagner', 'une_main', 'bug', 'faux_rebond', 'tactile']
    else array[]::text[]
  end
$$;

-- Envoyer un message : une seule fois avant le match (présentation), une seule fois après (match terminé).
-- Après le match, le vainqueur et le vaincu n'ont pas les mêmes messages.
create or replace function public.envoyer_message(p_id uuid, p_message text) returns public.duels
language plpgsql security definer set search_path = public as $$
declare d public.duels; moi smallint; v_moment text;
begin
  select * into d from duels where id = p_id for update;
  if d.id is null then raise exception 'Duel introuvable'; end if;
  moi := _ma_place(d);
  if d.phase = 'presentation' then v_moment := 'avant';
  elsif d.phase = 'termine' and d.vainqueur is not null then v_moment := case when d.vainqueur = moi then 'vainqueur' else 'vaincu' end;
  else raise exception 'Les messages s''envoient avant ou après le match';
  end if;
  if p_message = any(_messages_rapides(v_moment, true)) then
    if not exists (select 1 from amities where a = least(d.j0, d.j1) and b = greatest(d.j0, d.j1) and statut = 'amis') then
      raise exception 'Ce message est réservé aux amis';
    end if;
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

revoke all on function public._messages_rapides(text, boolean) from public, anon, authenticated;
revoke all on function public.envoyer_message(uuid, text) from public, anon;
grant execute on function public.envoyer_message(uuid, text) to authenticated;
