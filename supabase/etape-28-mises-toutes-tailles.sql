-- HandSlam — Étape 28 : Sit & Go à mise dans toutes les tailles (2, 8, 16, 32, 64).
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 27. Peut être relancé sans risque.
-- Si on relance un jour l'étape 27, il faut relancer celle-ci ensuite.
--
-- Décision du porteur du projet : on peut miser dans toutes les salles. La cagnotte (entrées moins 10 %) se partage
-- comme au poker selon le nombre de joueurs (étape 19) : à 2, tout au gagnant ; à 8 et 16, 65 % / 35 % ;
-- à 32, 50 % / 25 % / 12,5 % aux deux demi-finalistes ; à 64, 40 % / 22 % / 11 % / 4 % aux quarts de finalistes.

-- S'inscrire dans une salle (remplace la version de l'étape 27) : la mise est possible dans toutes les tailles.
create or replace function public.rejoindre_sit_and_go(p_taille int, p_mise int default 0) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.tournois; mien public.tournois; m int := coalesce(p_mise, 0);
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton compte'; end if;
  perform _verifier_mise(m);
  if not (p_taille = any (_tailles_sng()) or p_taille = 2) then raise exception 'Taille de tournoi invalide'; end if;
  perform _nettoyer_salles();
  mien := _mon_sng();
  if mien.id is not null then raise exception 'Un seul Sit & Go à la fois : termine (ou quitte) celui en cours'; end if;
  perform _assez_pour(m);
  t := _salle(p_taille, m);
  insert into inscrits_tournoi (tournoi_id, joueur, vu) values (t.id, auth.uid(), now());
  if (select count(*) from inscrits_tournoi where tournoi_id = t.id) >= t.taille then perform _lancer_direct(t.id); end if;
  select * into t from tournois where id = t.id;
  return _resume_tournoi(t);
end $$;

-- Les salles (remplace la version de l'étape 27) : avec le nombre d'inscrits de chaque salle à mise, pour chaque taille.
create or replace function public.salles_sit_and_go() returns jsonb
language plpgsql security definer set search_path = public as $$
declare mien public.tournois; dernier public.tournois;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  perform _nettoyer_salles();
  select t.* into dernier from tournois t join inscrits_tournoi i on i.tournoi_id = t.id and i.joueur = auth.uid()
  where t.mode = 'direct' and t.freeroll is null and t.programme is null and t.phase in ('en_cours', 'termine') and t.lance_le > now() - interval '3 hours'
  order by t.lance_le desc limit 1;
  if dernier.id is not null and dernier.phase = 'en_cours' then perform _avancer_tournoi(dernier.id); select * into dernier from tournois where id = dernier.id; end if;
  mien := _mon_sng();
  if mien.id is not null and mien.phase = 'en_cours' then perform _avancer_tournoi(mien.id); mien := _mon_sng(); end if;
  return jsonb_build_object(
    'salles', (select jsonb_agg(jsonb_build_object('taille', n,
        'inscrits', (select count(*) from inscrits_tournoi i join tournois t on t.id = i.tournoi_id
                     where t.mode = 'direct' and t.freeroll is null and t.programme is null and t.phase = 'inscriptions' and t.taille = n and t.mise = 0)) order by n)
      from unnest(_tailles_sng()) n),
    'salles_mise', (select jsonb_agg(jsonb_build_object('mise', x, 'taille', 8,
        'inscrits', (select count(*) from inscrits_tournoi i join tournois t on t.id = i.tournoi_id
                     where t.mode = 'direct' and t.freeroll is null and t.programme is null and t.phase = 'inscriptions' and t.taille = 8 and t.mise = x)) order by x)
      from unnest(_mises()) x),
    'heads_up', (select jsonb_agg(jsonb_build_object('mise', x, 'taille', 2,
        'inscrits', (select count(*) from inscrits_tournoi i join tournois t on t.id = i.tournoi_id
                     where t.mode = 'direct' and t.freeroll is null and t.programme is null and t.phase = 'inscriptions' and t.taille = 2 and t.mise = x)) order by x)
      from unnest(array[0] || _mises()) x),
    'salles_mises', (select jsonb_agg(jsonb_build_object('taille', n, 'mise', x,
        'inscrits', (select count(*) from inscrits_tournoi i join tournois t on t.id = i.tournoi_id
                     where t.mode = 'direct' and t.freeroll is null and t.programme is null and t.phase = 'inscriptions' and t.taille = n and t.mise = x)) order by x, n)
      from unnest(_mises()) x, unnest(array[2] || _tailles_sng()) n),
    'mien', case when mien.id is not null then _resume_tournoi(mien) end,
    'dernier', case when dernier.id is not null and dernier.id is distinct from mien.id then _resume_tournoi(dernier) end);
end $$;

revoke all on function public.rejoindre_sit_and_go(int, int), public.salles_sit_and_go() from public, anon;
grant execute on function public.rejoindre_sit_and_go(int, int), public.salles_sit_and_go() to authenticated;
