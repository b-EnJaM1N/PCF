-- PCF — Étape 15 : le freeroll de 20 h, les défis du jour, le classement des gains du mois.
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 14. Peut être relancé sans risque.
-- Si on relance un jour les étapes 6 ou 14, il faut relancer celle-ci ensuite.
--
-- Freeroll : tournoi gratuit chaque soir à 20 h (heure de Paris). Inscription dans la journée ; à 20 h, le tournoi
-- démarre avec les inscrits présents dans l'appli (au moins 4, au plus 64), sets de 11, 2 sets gagnants (officiel).
-- Cagnotte offerte : 1 000 jetons + 50 par joueur ; 50 % au 1er, 30 % au 2e, 10 % aux deux demi-finalistes.
-- Défis du jour : 3 par jour, les mêmes pour tous, tirés au sort ; chaque défi réussi rapporte quelques jetons.
-- Classement du mois : le bénéfice dans les jeux à mise et les freerolls (gains moins mises), remis à zéro chaque mois.

alter table public.tournois add column if not exists freeroll date unique;   -- le jour du freeroll (vide pour les autres tournois)

create or replace function public._heure_freeroll(p_jour date) returns timestamptz language sql stable as $$
  select (p_jour + time '20:00') at time zone 'Europe/Paris'
$$;
create or replace function public._freeroll_min() returns int language sql immutable as $$ select 4 $$;

-- ---------------------------------------------------------------- le freeroll ne se mélange pas aux Sit & Go
-- (remplacent les versions de l'étape 6 : un inscrit au freeroll n'est ni « en salle », ni retiré pour absence)
create or replace function public._nettoyer_salles() returns void
language sql security definer set search_path = public as $$
  delete from inscrits_tournoi i using tournois t
  where t.id = i.tournoi_id and t.mode = 'direct' and t.freeroll is null and t.phase = 'inscriptions' and i.vu < now() - _absence_salle();
$$;
create or replace function public._mon_sng() returns public.tournois
language sql stable security definer set search_path = public as $$
  select t.* from tournois t join inscrits_tournoi i on i.tournoi_id = t.id and i.joueur = auth.uid()
  where t.mode = 'direct' and t.freeroll is null and (t.phase = 'inscriptions' or (t.phase = 'en_cours' and not exists (
    select 1 from matchs_tournoi m where m.tournoi_id = t.id and m.fin is not null and auth.uid() in (m.j0, m.j1) and m.vainqueur is distinct from auth.uid())))
  order by t.cree_le desc limit 1
$$;
create or replace function public.salles_sit_and_go() returns jsonb
language plpgsql security definer set search_path = public as $$
declare mien public.tournois; dernier public.tournois;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  perform _nettoyer_salles();
  select t.* into dernier from tournois t join inscrits_tournoi i on i.tournoi_id = t.id and i.joueur = auth.uid()
  where t.mode = 'direct' and t.freeroll is null and t.phase in ('en_cours', 'termine') and t.lance_le > now() - interval '3 hours'
  order by t.lance_le desc limit 1;
  if dernier.id is not null and dernier.phase = 'en_cours' then perform _avancer_tournoi(dernier.id); select * into dernier from tournois where id = dernier.id; end if;
  mien := _mon_sng();
  if mien.id is not null and mien.phase = 'en_cours' then perform _avancer_tournoi(mien.id); mien := _mon_sng(); end if;
  return jsonb_build_object(
    'salles', (select jsonb_agg(jsonb_build_object('taille', n,
        'inscrits', (select count(*) from inscrits_tournoi i join tournois t on t.id = i.tournoi_id
                     where t.mode = 'direct' and t.freeroll is null and t.phase = 'inscriptions' and t.taille = n and t.mise = 0)) order by n)
      from unnest(_tailles_sng()) n),
    'salles_mise', (select jsonb_agg(jsonb_build_object('mise', x, 'taille', 8,
        'inscrits', (select count(*) from inscrits_tournoi i join tournois t on t.id = i.tournoi_id
                     where t.mode = 'direct' and t.freeroll is null and t.phase = 'inscriptions' and t.mise = x)) order by x)
      from unnest(_mises()) x),
    'mien', case when mien.id is not null then _resume_tournoi(mien) end,
    'dernier', case when dernier.id is not null and dernier.id is distinct from mien.id then _resume_tournoi(dernier) end);
end $$;

-- Le résumé d'un tournoi : avec sa mise et son jour de freeroll. Remplace la version de l'étape 14.
create or replace function public._resume_tournoi(t public.tournois) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', t.id, 'mode', t.mode, 'taille', t.taille, 'nom', t.nom, 'phase', t.phase, 'tour', t.tour, 'nb_tours', t.nb_tours, 'echeance', t.echeance,
    'points_par_set', t.points_par_set, 'sets_gagnants', t.sets_gagnants, 'duree_minutes', extract(epoch from t.duree_tour)::int / 60,
    'mise', t.mise, 'freeroll', t.freeroll,
    'cercle', (select jsonb_build_object('id', c.id, 'nom', c.nom, 'blason', c.blason) from cercles c where c.id = t.cercle_id),
    'inscrits', (select count(*) from inscrits_tournoi where tournoi_id = t.id),
    'inscrit', exists (select 1 from inscrits_tournoi where tournoi_id = t.id and joueur = auth.uid()),
    'createur', t.createur = auth.uid(),
    'vainqueur', case when t.vainqueur is not null then _carte(t.vainqueur) end,
    'a_jouer', exists (select 1 from matchs_tournoi m where m.tournoi_id = t.id and m.tour = t.tour and m.fin is null
                         and t.phase = 'en_cours' and auth.uid() in (m.j0, m.j1)),
    'elimine', t.phase = 'en_cours' and exists (select 1 from matchs_tournoi m where m.tournoi_id = t.id and m.fin is not null
                         and auth.uid() in (m.j0, m.j1) and m.vainqueur is distinct from auth.uid()))
$$;

-- ---------------------------------------------------------------- le freeroll
-- Le freeroll du jour (créé au premier passage de la journée).
create or replace function public._freeroll(p_jour date) returns public.tournois
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  select * into t from tournois where freeroll = p_jour;
  if t.id is null then
    insert into tournois (nom, cercle_id, createur, points_par_set, sets_gagnants, duree_tour, mode, taille, freeroll)
    values ('Freeroll de 20 h', null, null, 11, 2, interval '1 hour', 'direct', 64, p_jour)
    on conflict (freeroll) do nothing;
    select * into t from tournois where freeroll = p_jour;
  end if;
  return t;
end $$;

-- 20 h passées : on retire les absents, puis on lance (ou on annule s'il y a moins de 4 joueurs).
create or replace function public._lancer_freeroll(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; n int; n_taille int := 4;
begin
  select * into t from tournois where id = p_id for update;
  if t.phase <> 'inscriptions' or now() < _heure_freeroll(t.freeroll) then return; end if;
  delete from inscrits_tournoi where tournoi_id = p_id and vu < _heure_freeroll(t.freeroll) - interval '90 seconds';
  n := (select count(*) from inscrits_tournoi where tournoi_id = p_id);
  if n < _freeroll_min() then
    update tournois set phase = 'annule', fini_le = now() where id = p_id;
    return;
  end if;
  while n_taille < n loop n_taille := n_taille * 2; end loop;
  update tournois set taille = n_taille where id = p_id;
  perform _lancer_direct(p_id);   -- tableau à élimination directe ; les places vides font passer les meilleures têtes de série
end $$;

-- L'état du freeroll du jour (et signe de vie des inscrits). Fait avancer le tournoi.
create or replace function public.freeroll_du_jour() returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.tournois; j date := _aujourdhui();
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  t := _freeroll(j);
  update inscrits_tournoi set vu = now() where tournoi_id = t.id and joueur = auth.uid();
  if t.phase = 'inscriptions' and now() >= _heure_freeroll(j) then perform _lancer_freeroll(t.id); end if;
  if t.phase in ('inscriptions', 'en_cours') then perform _avancer_tournoi(t.id); end if;
  select * into t from tournois where id = t.id;
  return _resume_tournoi(t) || jsonb_build_object('depart', _heure_freeroll(j), 'maintenant', now(),
    'cagnotte', 1000 + 50 * (select count(*) from inscrits_tournoi where tournoi_id = t.id));
end $$;

create or replace function public.inscrire_freeroll() returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton compte'; end if;
  t := _freeroll(_aujourdhui());
  if t.phase <> 'inscriptions' or now() >= _heure_freeroll(t.freeroll) then raise exception 'Les inscriptions au freeroll de ce soir sont closes : rendez-vous demain !'; end if;
  insert into inscrits_tournoi (tournoi_id, joueur, vu) values (t.id, auth.uid(), now()) on conflict do nothing;
  return freeroll_du_jour();
end $$;

create or replace function public.desinscrire_freeroll() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  delete from inscrits_tournoi i using tournois t
  where t.id = i.tournoi_id and t.freeroll = _aujourdhui() and t.phase = 'inscriptions' and i.joueur = auth.uid();
  return freeroll_du_jour();
end $$;

-- Les gains du freeroll, à la fin : la cagnotte offerte par la maison.
create or replace function public._gains_freeroll() returns trigger
language plpgsql security definer set search_path = public as $$
declare pot int; f public.matchs_tournoi; m public.matchs_tournoi; perdant uuid;
begin
  if new.freeroll is null or new.phase <> 'termine' or old.phase = 'termine' then return new; end if;
  pot := 1000 + 50 * (select count(*) from inscrits_tournoi where tournoi_id = new.id);
  select * into f from matchs_tournoi where tournoi_id = new.id and tour = new.nb_tours and position = 1;
  if f.vainqueur is not null then perform _portefeuille_de(f.vainqueur); perform _crediter(f.vainqueur, floor(pot * 0.5)::int, 'freeroll : 1er'); end if;
  perdant := case when f.vainqueur = f.j0 then f.j1 else f.j0 end;
  if perdant is not null then perform _portefeuille_de(perdant); perform _crediter(perdant, floor(pot * 0.3)::int, 'freeroll : 2e'); end if;
  for m in select * from matchs_tournoi where tournoi_id = new.id and tour = new.nb_tours - 1 and vainqueur is not null loop
    perdant := case when m.vainqueur = m.j0 then m.j1 else m.j0 end;
    if perdant is not null then perform _portefeuille_de(perdant); perform _crediter(perdant, floor(pot * 0.1)::int, 'freeroll : demi-finale'); end if;
  end loop;
  return new;
end $$;
drop trigger if exists tournois_gains_freeroll on public.tournois;
create trigger tournois_gains_freeroll after update on public.tournois for each row execute function public._gains_freeroll();

-- ---------------------------------------------------------------- les défis du jour
create table if not exists public.defis_reussis (
  joueur uuid not null references public.profils (id) on delete cascade,
  jour date not null,
  defi text not null,
  cree_le timestamptz not null default now(),
  primary key (joueur, jour, defi)
);
alter table public.defis_reussis enable row level security;
revoke all on public.defis_reussis from anon, authenticated;

-- La liste des défis (le texte et la façon de les réussir sont dans l'appli : app/js/defis-logique.js).
create or replace function public._defis() returns table (id text, recompense int) language sql immutable as $$
  values ('gagner_3', 40), ('jouer_5', 40), ('duel_en_ligne', 50), ('balle_sauvee', 60), ('set_net', 60),
         ('poignees_franches', 30), ('serie_4', 30), ('bot_fort', 50), ('freeroll', 50)
$$;
-- Les 3 défis d'un jour : tirés au sort, les mêmes pour tout le monde.
create or replace function public._defis_du_jour(p_jour date) returns table (id text, recompense int) language sql immutable as $$
  select id, recompense from _defis() order by md5(id || p_jour::text) limit 3
$$;

create or replace function public.defis_du_jour() returns jsonb
language plpgsql security definer set search_path = public as $$
declare j date := _aujourdhui();
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  return (select jsonb_agg(jsonb_build_object('id', d.id, 'recompense', d.recompense,
            'fait', exists (select 1 from defis_reussis r where r.joueur = auth.uid() and r.jour = j and r.defi = d.id))) from _defis_du_jour(j) d);
end $$;

-- Encaisser un défi réussi. Les défis en ligne sont vérifiés par le serveur ; les autres, plafonnés, font confiance à l'appli.
create or replace function public.valider_defi(p_defi text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare j date := _aujourdhui(); r int;
begin
  perform _mon_portefeuille();
  select recompense into r from _defis_du_jour(j) where id = p_defi;
  if r is null then raise exception 'Ce défi n''est pas au programme aujourd''hui'; end if;
  if p_defi = 'duel_en_ligne' and not exists (select 1 from duels where auth.uid() in (j0, j1) and phase = 'termine' and fin = 'score'
        and (maj_le at time zone 'Europe/Paris')::date = j) then
    raise exception 'Termine d''abord un duel en ligne aujourd''hui';
  end if;
  if p_defi = 'freeroll' and not exists (select 1 from inscrits_tournoi i join tournois t on t.id = i.tournoi_id
        where t.freeroll = j and t.phase in ('en_cours', 'termine') and i.joueur = auth.uid()) then
    raise exception 'Participe d''abord au freeroll de 20 h';
  end if;
  insert into defis_reussis (joueur, jour, defi) values (auth.uid(), j, p_defi) on conflict do nothing;
  if not found then raise exception 'Défi déjà encaissé'; end if;
  perform _crediter(auth.uid(), r, 'défi du jour');
  return jsonb_build_object('gagne', r, 'defis', defis_du_jour(), 'solde', (select solde from jetons where joueur = auth.uid()));
end $$;

-- ---------------------------------------------------------------- le classement des gains du mois
create or replace function public._motifs_jeu() returns text[] language sql immutable as $$
  select array['mise de duel', 'gain de duel', 'mise rendue', 'entrée de Sit & Go', 'entrée rendue',
               'Sit & Go : 1er', 'Sit & Go : 2e', 'Sit & Go : demi-finale', 'freeroll : 1er', 'freeroll : 2e', 'freeroll : demi-finale']
$$;
create or replace function public.classement_mois() returns jsonb
language plpgsql security definer set search_path = public as $$
declare debut timestamptz := (date_trunc('month', now() at time zone 'Europe/Paris')) at time zone 'Europe/Paris';
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  return (with b as (
      select joueur, sum(montant)::int benefice from mouvements_jetons
      where cree_le >= debut and motif = any (_motifs_jeu()) group by joueur),
    r as (select joueur, benefice, rank() over (order by benefice desc) rang from b)
    select jsonb_build_object(
      'mois', to_char(debut at time zone 'Europe/Paris', 'YYYY-MM'),
      'top', coalesce((select jsonb_agg(_carte(joueur) || jsonb_build_object('rang', rang, 'benefice', benefice) order by rang, joueur)
                       from (select * from r order by rang limit 50) x), '[]'::jsonb),
      'moi', (select jsonb_build_object('rang', rang, 'benefice', benefice) from r where joueur = auth.uid())));
end $$;

-- ---------------------------------------------------------------- sécurité
revoke all on function public._freeroll(date), public._lancer_freeroll(uuid), public._gains_freeroll(), public._defis(), public._defis_du_jour(date),
  public._nettoyer_salles(), public._mon_sng(), public._resume_tournoi(public.tournois) from public, anon, authenticated;
revoke all on function public.freeroll_du_jour(), public.inscrire_freeroll(), public.desinscrire_freeroll(), public.defis_du_jour(),
  public.valider_defi(text), public.classement_mois(), public.salles_sit_and_go() from public, anon;
grant execute on function public.freeroll_du_jour(), public.inscrire_freeroll(), public.desinscrire_freeroll(), public.defis_du_jour(),
  public.valider_defi(text), public.classement_mois(), public.salles_sit_and_go() to authenticated;
