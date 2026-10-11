-- HandSlam — Étape 41 : personne ne lance ni n'annule un tournoi automatique.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ».
-- Nécessite les étapes 2 à 40. Peut être relancé sans risque.
--
-- Correction (11 octobre) : un tournoi sans créateur était « organisé » par n'importe lequel de ses inscrits.
-- C'est voulu pour un tournoi entre amis dont le créateur a supprimé son compte, mais pas pour les tournois
-- créés par le serveur (Sit & Go, freeroll, tournois programmés comme le Grand Chelem) : un inscrit pouvait
-- les lancer avant l'heure, ou les annuler pour tout le monde (sans rendre les entrées). Ils partent tout seuls.
-- Et pour un tournoi sans créateur, la réponse était « inconnue » (null) au lieu de « non » pour un non-inscrit,
-- ce que les vérifications laissaient passer : n'importe qui pouvait l'annuler. Désormais, c'est « non ».

-- Qui peut lancer ou annuler (remplace la version de l'étape 5) : le créateur ; s'il n'existe plus, le responsable
-- du cercle ou un inscrit. Jamais pour un tournoi automatique (mode « direct »).
create or replace function public._organise(t public.tournois) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(t.mode is distinct from 'direct' and (t.createur = auth.uid()
    or (t.createur is null and ((t.cercle_id is not null and _role(t.cercle_id) = 'admin')
        or exists (select 1 from inscrits_tournoi where tournoi_id = t.id and joueur = auth.uid())))), false)
$$;
revoke all on function public._organise(public.tournois) from public, anon, authenticated;

-- Même défaut, même correction (remplacent les versions des étapes 35 et 36) : « inconnu » vaut « non ».
create or replace function public.effacer_enjeu_tournoi(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  select * into t from tournois where id = p_id for update;
  if t.id is null or not _voit_tournoi(t) then raise exception 'Tournoi introuvable'; end if;
  if not coalesce(t.createur = auth.uid() or (t.cercle_id is not null and _role(t.cercle_id) = 'admin'), false) then
    raise exception 'Seul l''organisateur ou le responsable du cercle peut effacer l''enjeu';
  end if;
  update tournois set enjeu = null where id = p_id;
end $$;

create or replace function public.arreter_serie(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  select * into t from tournois where id = p_id;
  if t.id is null or not _voit_tournoi(t) then raise exception 'Tournoi introuvable'; end if;
  if not coalesce(t.createur = auth.uid() or (t.cercle_id is not null and _role(t.cercle_id) = 'admin'), false) then
    raise exception 'Seul l''organisateur ou le responsable du cercle peut arrêter la répétition';
  end if;
  update tournois set hebdo = false where serie = t.serie and phase in ('inscriptions', 'en_cours');
end $$;
