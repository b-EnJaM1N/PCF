-- HandSlam — Étape 53 : les messages entre les sets, et les annonces.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 52. Peut être relancé sans risque.
--
-- Décision du porteur du projet (1er novembre) :
--  * pendant la pause entre deux sets, chacun peut envoyer un message (une phrase toute faite, ou, entre amis, son propre message) ;
--    ouvrir la fenêtre des messages repousse le départ du set suivant à 30 secondes au moins (une fois par pause) ;
--  * des « annonces » au début de chaque set (avant le match et entre les sets), avec n'importe quel joueur :
--    « J'ouvre avec Pierre. », « Je sais : tu ouvres avec Ciseaux. », « Ne joue pas Feuille. », « Joue Pierre ! »…
-- Les listes sont les mêmes que dans app/js/messages-rapides.js (un test vérifie qu'elles sont identiques).

-- Un message par pause : le message de chacun et le numéro de la pause (le nombre de sets déjà joués) où il a été envoyé.
alter table public.duels add column if not exists message_set0 text;
alter table public.duels add column if not exists message_set1 text;
alter table public.duels add column if not exists message_set_n smallint[] not null default '{-1,-1}';
alter table public.duels add column if not exists ecrit_set_n smallint[] not null default '{-1,-1}';   -- le temps d'écrire, déjà accordé

-- Les messages permis à un moment donné : tout public (annonces comprises), ou réservés aux amis. Remplace la version de l'étape 22.
create or replace function public._messages_rapides(p_moment text, p_amis boolean) returns text[]
language sql immutable set search_path = public as $$
  select case
    when p_moment = 'avant' and not p_amis then array['ouvre_p', 'ouvre_f', 'ouvre_c', 'sais_p', 'sais_f', 'sais_c', 'pas_p', 'pas_f', 'pas_c', 'joue_p', 'joue_f', 'joue_c', 'bonne_chance', 'bon_match', 'meilleur_gagne', 'a_toi', 'bon_duel', 'on_y_va']
    when p_moment = 'avant' and p_amis then array['besoin', 'par_coeur', 'fumer', 'slip', 'souffrir']
    when p_moment = 'entre_sets' and not p_amis then array['ouvre_p', 'ouvre_f', 'ouvre_c', 'sais_p', 'sais_f', 'sais_c', 'pas_p', 'pas_f', 'pas_c', 'joue_p', 'joue_f', 'joue_c', 'set_bien_joue', 'pas_fini', 'on_y_retourne', 'beau_set', 'concentre']
    when p_moment = 'entre_sets' and p_amis then array['regretter', 'echauffement', 'vrai_match', 'profite', 'chaud']
    when p_moment = 'vainqueur' and not p_amis then array['merci_match', 'beau_duel', 'toi_aussi', 'serre', 'revanche', 'gg']
    when p_moment = 'vainqueur' and p_amis then array['et_oui', 'boss', 'ton_pere', 'padawan', 'regles', 'deculottee']
    when p_moment = 'vaincu' and not p_amis then array['bien_joue', 'bravo', 'beau_duel', 'bravo_victoire', 'merci_duel', 'meritee']
    when p_moment = 'vaincu' and p_amis then array['chatoune', 'laisse_gagner', 'une_main', 'bug', 'faux_rebond', 'tactile']
    else array[]::text[]
  end
$$;

-- Envoyer un message : une fois avant le match (présentation), une fois par pause entre les sets, une fois après (match terminé).
-- Remplace la version de l'étape 48 : en plus, la pause entre les sets.
create or replace function public.envoyer_message(p_id uuid, p_message text) returns public.duels
language plpgsql security definer set search_path = public as $fn$
declare d public.duels; moi smallint; v_moment text; amis boolean; n smallint;
begin
  select * into d from duels where id = p_id for update;
  if d.id is null then raise exception 'Duel introuvable'; end if;
  moi := _ma_place(d);
  if d.phase = 'presentation' then v_moment := 'avant';
  elsif d.phase = 'entre_sets' then v_moment := 'entre_sets';
  elsif d.phase = 'termine' and d.vainqueur is not null then v_moment := case when d.vainqueur = moi then 'vainqueur' else 'vaincu' end;
  else raise exception 'Les messages s''envoient avant le match, entre les sets ou après le match';
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
  elsif v_moment = 'entre_sets' then
    n := jsonb_array_length(d.scores_sets);
    if d.message_set_n[moi + 1] = n then return d; end if;   -- (un seul message par pause)
    if moi = 0 then update duels set message_set0 = p_message, message_set_n[1] = n, maj_le = now() where id = p_id returning * into d;
    else update duels set message_set1 = p_message, message_set_n[2] = n, maj_le = now() where id = p_id returning * into d; end if;
  else
    if moi = 0 then update duels set message_apres0 = coalesce(message_apres0, p_message), maj_le = now() where id = p_id returning * into d;
    else update duels set message_apres1 = coalesce(message_apres1, p_message), maj_le = now() where id = p_id returning * into d; end if;
  end if;
  return d;
end $fn$;

-- « J'écris un message » : l'adversaire le voit ; avant le match, un peu plus de temps avant le départ automatique ;
-- entre les sets, le set suivant attend 30 secondes au moins (une fois par pause et par joueur). Remplace la version de l'étape 48.
create or replace function public.j_ecris(p_id uuid) returns public.duels
language plpgsql security definer set search_path = public as $fn$
declare d public.duels; moi smallint; n smallint;
begin
  select * into d from duels where id = p_id for update;
  if d.id is null then raise exception 'Duel introuvable'; end if;
  moi := _ma_place(d);
  if d.phase = 'presentation' then
    if (case when moi = 0 then d.message_avant0 else d.message_avant1 end) is null and d.rallonges < 3 then
      update duels set echeance = greatest(echeance, now() + interval '40 seconds'), rallonges = rallonges + 1 where id = p_id;
    end if;
  elsif d.phase = 'entre_sets' then
    n := jsonb_array_length(d.scores_sets);
    if d.message_set_n[moi + 1] <> n and d.ecrit_set_n[moi + 1] <> n then
      if moi = 0 then update duels set echeance = greatest(echeance, now() + interval '30 seconds'), ecrit_set_n[1] = n where id = p_id;
      else update duels set echeance = greatest(echeance, now() + interval '30 seconds'), ecrit_set_n[2] = n where id = p_id; end if;
    end if;
  elsif d.phase <> 'termine' then raise exception 'Les messages s''envoient avant le match, entre les sets ou après le match';
  end if;
  if moi = 0 then update duels set ecrit0 = now(), maj_le = now() where id = p_id returning * into d;
  else update duels set ecrit1 = now(), maj_le = now() where id = p_id returning * into d; end if;
  return d;
end $fn$;

revoke all on function public.j_ecris(uuid) from public, anon;
grant execute on function public.j_ecris(uuid) to authenticated;
revoke all on function public.envoyer_message(uuid, text) from public, anon;
grant execute on function public.envoyer_message(uuid, text) to authenticated;
