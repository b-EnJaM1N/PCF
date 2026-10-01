-- PCF — Étape 21 : des bots pour remplir les tournois, et un programme allégé.
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 20. Peut être relancé sans risque.
-- Si on relance un jour les étapes 6, 14, 15, 18, 19 ou 20, il faut relancer celle-ci ensuite.
--
-- Principes :
--  * des comptes « bots » (Rocky 🤖, Papyrus 🤖…) créés par le serveur, invisibles dans la recherche ;
--  * freeroll et tournois programmés : départ dès 2 joueurs présents ; les places vides du tableau
--    (au moins 8) sont prises par des bots, placés en dernières têtes de série ;
--  * Sit & Go : 2 minutes après l'arrivée du premier joueur, s'il y a au moins 2 joueurs (et au moins un quart
--    de la salle), des bots complètent la salle et le tournoi démarre ;
--  * un bot joue sur le serveur (pas de triche possible) : il a un signe favori, qu'il joue un peu trop souvent ;
--    deux bots qui se rencontrent : le résultat est tiré au sort tout de suite (selon leur niveau) ;
--  * un match contre un bot est amical (il ne compte pas pour le niveau officiel) ;
--  * les bots ne paient pas d'entrée et ne gagnent jamais de jetons : les gains vont aux humains, classés selon
--    leur parcours (le meilleur humain prend la part du 1er, etc.) ;
--  * un minuteur (chaque minute) lance les tournois à l'heure, même si personne n'a l'appli ouverte ;
--  * programme allégé : chaque soir le freeroll de 20 h, et le dimanche le Grand Chelem de 21 h
--    (Le Midi, L'Apéro et Le Nocturne sont en pause ; les inscriptions déjà prises sont remboursées).

-- ---------------------------------------------------------------- les bots
create table if not exists public.bots_en_ligne (
  joueur uuid primary key references public.profils (id) on delete cascade,
  modele text not null,
  favori smallint not null check (favori between 0 and 2),   -- 0 = Pierre, 1 = Ciseaux, 2 = Feuille
  elo int not null
);
alter table public.bots_en_ligne enable row level security;
revoke all on public.bots_en_ligne from anon, authenticated;

create or replace function public._est_bot(p_joueur uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from bots_en_ligne where joueur = p_joueur)
$$;

-- Les modèles : les 15 bots de l'entraînement (app/js/bots.js), avec leur signe favori et leur avatar.
create or replace function public._modeles_bots() returns table (cle text, nom text, favori smallint, elo int, avatar jsonb)
language sql immutable as $$
  values ('rocky', 'Rocky', 0::smallint, 850, '{"symbole":"pierre","fond":"terre","gant":"rouge","poignet":"noir","motif":"uni"}'::jsonb),
         ('papyrus', 'Papyrus', 2, 900, '{"symbole":"feuille","fond":"terre","gant":"blanc","poignet":"rouge","motif":"uni"}'),
         ('bambi', 'Bambi', 0, 950, '{"symbole":"pierre","fond":"gazon","gant":"blanc","poignet":"jaune","motif":"uni"}'),
         ('miroir', 'Miroir', 2, 1000, '{"symbole":"feuille","fond":"court","gant":"blanc","poignet":"bleu","motif":"rayures"}'),
         ('boomerang', 'Boomerang', 0, 1050, '{"symbole":"pierre","fond":"violet","gant":"jaune","poignet":"rouge","motif":"etoile"}'),
         ('cyclo', 'Cyclo', 1, 1100, '{"symbole":"ciseaux","fond":"gazon","gant":"jaune","poignet":"blanc","motif":"rayures"}'),
         ('tictac', 'Tic-Tac', 1, 1150, '{"symbole":"ciseaux","fond":"violet","gant":"bleu","poignet":"blanc","motif":"rayures"}'),
         ('chaos', 'Chaos', 1, 1200, '{"symbole":"ciseaux","fond":"court","gant":"vert","poignet":"jaune","motif":"eclair"}'),
         ('rancune', 'Rancune', 1, 1250, '{"symbole":"ciseaux","fond":"terre","gant":"rouge","poignet":"noir","motif":"eclair"}'),
         ('bluffeur', 'Bluffeur', 2, 1300, '{"symbole":"feuille","fond":"violet","gant":"jaune","poignet":"noir","motif":"etoile"}'),
         ('nemesis', 'Némésis', 0, 1350, '{"symbole":"pierre","fond":"ardoise","gant":"bleu","poignet":"or","motif":"eclair"}'),
         ('mante', 'La Mante', 1, 1400, '{"symbole":"ciseaux","fond":"gazon","gant":"vert","poignet":"noir","motif":"eclair"}'),
         ('stratege', 'Stratège', 2, 1450, '{"symbole":"feuille","fond":"ardoise","gant":"rouge","poignet":"noir","motif":"eclair"}'),
         ('professeur', 'Professeur', 2, 1500, '{"symbole":"feuille","fond":"or","gant":"blanc","poignet":"noir","motif":"etoile"}'),
         ('titan', 'Titan', 0, 1600, '{"symbole":"pierre","fond":"or","gant":"or","poignet":"noir","motif":"etoile"}')
$$;

-- Crée les bots n° 1 à p_nb s'ils n'existent pas encore (un compte sans e-mail réel ni mot de passe : personne ne peut s'y connecter).
create or replace function public._assurer_bots(p_nb int) returns void
language plpgsql security definer set search_path = public, auth as $$
declare k int; v_id uuid; m record;
begin
  for k in 1 .. p_nb loop
    v_id := ('b0700000-0000-4000-8000-' || lpad(k::text, 12, '0'))::uuid;
    continue when exists (select 1 from bots_en_ligne where joueur = v_id);
    select * into m from _modeles_bots() order by elo offset (k - 1) % 15 limit 1;
    insert into auth.users (id, email) values (v_id, 'bot-' || k || '@bots.handslam.fr') on conflict (id) do nothing;
    insert into profils (id, pseudo, numero, avatar, visible_recherche) values (v_id, m.nom || ' 🤖', 1000, m.avatar, false)
    on conflict (id) do nothing;
    insert into bots_en_ligne (joueur, modele, favori, elo) values (v_id, m.cle, m.favori, m.elo) on conflict (joueur) do nothing;
  end loop;
end $$;

-- Ajoute p_nb bots (pas encore inscrits) à un tournoi.
create or replace function public._ajouter_bots(p_id uuid, p_nb int) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_nb <= 0 then return; end if;
  perform _assurer_bots(p_nb + (select count(*)::int from inscrits_tournoi i join bots_en_ligne b on b.joueur = i.joueur where i.tournoi_id = p_id));
  insert into inscrits_tournoi (tournoi_id, joueur, vu)
  select p_id, b.joueur, now() from bots_en_ligne b
  where not exists (select 1 from inscrits_tournoi i where i.tournoi_id = p_id and i.joueur = b.joueur)
  order by random() limit p_nb;
end $$;

-- Le signe d'un bot : son favori un peu trop souvent (45 % du temps en plus du hasard), sinon au hasard.
create or replace function public._coup_bot(p_bot uuid) returns smallint
language sql volatile security definer set search_path = public as $$
  select case when random() < 0.45 then (select favori from bots_en_ligne where joueur = p_bot)
              else floor(random() * 3)::smallint end
$$;

-- ---------------------------------------------------------------- les bots dans les matchs
-- Un match contre un bot : amical, le bot est toujours prêt et serre la main à la fin.
create or replace function public._duel_bot_avant() returns trigger
language plpgsql security definer set search_path = public as $$
declare b0 boolean := _est_bot(new.j0); b1 boolean := _est_bot(new.j1); pr boolean[] := new.prets;
begin
  if not (b0 or b1) then return new; end if;
  if tg_op = 'INSERT' then new.classe := false; end if;
  if b0 then pr[1] := true; end if;
  if b1 then pr[2] := true; end if;
  new.prets := pr;
  if new.phase = 'termine' and new.fin = 'score' then
    if b0 then new.poignee0 := coalesce(new.poignee0, 'normale'); end if;
    if b1 then new.poignee1 := coalesce(new.poignee1, 'normale'); end if;
  end if;
  return new;
end $$;
drop trigger if exists duels_bot_avant on public.duels;
create trigger duels_bot_avant before insert or update on public.duels for each row execute function public._duel_bot_avant();

-- Le bot est toujours là, et joue son signe dès que le coup commence (le joueur ne peut pas le voir).
create or replace function public._duel_bot_apres() returns trigger
language plpgsql security definer set search_path = public as $$
declare place smallint;
begin
  place := case when _est_bot(new.j0) then 0 when _est_bot(new.j1) then 1 end;
  if place is null then return null; end if;
  if tg_op = 'INSERT' then
    insert into presences (duel_id, joueur, vu) values (new.id, place, 'infinity') on conflict (duel_id, joueur) do update set vu = 'infinity';
  end if;
  if new.phase = 'jeu' then
    insert into coups_secrets (duel_id, manche, joueur, signe)
    values (new.id, new.manche, place, _coup_bot(case when place = 0 then new.j0 else new.j1 end)) on conflict do nothing;
    if found and (select count(*) from coups_secrets where duel_id = new.id and manche = new.manche) = 2 then perform _resoudre(new.id); end if;
  end if;
  return null;
end $$;
drop trigger if exists duels_bot_apres on public.duels;
create trigger duels_bot_apres after insert or update on public.duels for each row execute function public._duel_bot_apres();

-- Deux bots se rencontrent : résultat tiré au sort tout de suite, selon leur niveau.
create or replace function public._match_bots() returns trigger
language plpgsql security definer set search_path = public as $$
declare e0 int; e1 int;
begin
  if new.fin is not null or new.j0 is null or new.j1 is null then return new; end if;
  select elo into e0 from bots_en_ligne where joueur = new.j0;
  select elo into e1 from bots_en_ligne where joueur = new.j1;
  if e0 is null or e1 is null then return new; end if;
  new.vainqueur := case when random() < 1 / (1 + power(10, (e1 - e0) / 400.0)) then new.j0 else new.j1 end;
  new.fin := 'score';
  return new;
end $$;
drop trigger if exists matchs_bots on public.matchs_tournoi;
create trigger matchs_bots before insert on public.matchs_tournoi for each row execute function public._match_bots();

-- Un joueur a quitté son match contre un bot (plus de signe de vie depuis 90 secondes) : forfait.
create or replace function public._veille_bots() returns void
language plpgsql security definer set search_path = public as $$
declare d public.duels; h smallint; vu timestamptz;
begin
  for d in select x.* from duels x where x.phase in ('presentation', 'jeu', 'entre_sets') and x.tournoi_id is not null
           and exists (select 1 from bots_en_ligne b where b.joueur in (x.j0, x.j1)) loop
    h := case when _est_bot(d.j0) then 1 else 0 end;
    select p.vu into vu from presences p where p.duel_id = d.id and p.joueur = h;
    if coalesce(vu, d.cree_le) < now() - interval '90 seconds' then
      update duels set phase = 'termine', vainqueur = 1 - h, fin = 'forfait', echeance = null, pause_depuis = null, maj_le = now() where id = d.id;
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------- départ des tournois
-- Les têtes de série : les humains d'abord (selon leur niveau), les bots ensuite. Remplace la version de l'étape 6.
create or replace function public._lancer_direct(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; o int[]; p int; a uuid; b uuid;
begin
  select * into t from tournois where id = p_id for update;
  update inscrits_tournoi i set tete = r.rang
  from (select x.joueur, row_number() over (order by (bo.joueur is not null), coalesce(c.points, _classement_depart()) desc, x.inscrit_le, x.joueur) as rang
        from inscrits_tournoi x left join classements c on c.joueur = x.joueur left join bots_en_ligne bo on bo.joueur = x.joueur
        where x.tournoi_id = p_id) r
  where i.tournoi_id = p_id and i.joueur = r.joueur;
  o := _ordre_tableau(t.taille);
  for p in 1 .. t.taille / 2 loop
    select joueur into a from inscrits_tournoi where tournoi_id = p_id and tete = o[2 * p - 1];
    select joueur into b from inscrits_tournoi where tournoi_id = p_id and tete = o[2 * p];
    insert into matchs_tournoi (tournoi_id, tour, position, j0, j1) values (p_id, 1, p, a, b);
    a := null; b := null;
  end loop;
  update tournois set phase = 'en_cours', tour = 1, nb_tours = round(log(2, t.taille))::int, echeance = null, lance_le = now() where id = p_id;
  perform _avancer_tournoi(p_id);
end $$;

-- La taille du tableau pour n humains : au moins 8, la puissance de 2 suivante sinon.
create or replace function public._taille_tableau(p_n int) returns int language plpgsql immutable as $$
declare t int := 8;
begin
  while t < p_n loop t := t * 2; end loop;
  return t;
end $$;

create or replace function public._freeroll_min() returns int language sql immutable as $$ select 2 $$;
create or replace function public._programme_min() returns int language sql immutable as $$ select 2 $$;

-- Freeroll : remplace la version de l'étape 15.
create or replace function public._lancer_freeroll(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; n int;
begin
  select * into t from tournois where id = p_id for update;
  if t.phase <> 'inscriptions' or now() < _heure_freeroll(t.freeroll) then return; end if;
  delete from inscrits_tournoi where tournoi_id = p_id and vu < _heure_freeroll(t.freeroll) - interval '90 seconds';
  n := (select count(*) from inscrits_tournoi where tournoi_id = p_id);
  if n < _freeroll_min() then
    update tournois set phase = 'annule', fini_le = now() where id = p_id;
    return;
  end if;
  update tournois set taille = _taille_tableau(n) where id = p_id;
  perform _ajouter_bots(p_id, _taille_tableau(n) - n);
  perform _lancer_direct(p_id);
end $$;

-- Tournois programmés : remplace la version de l'étape 18.
create or replace function public._lancer_programme(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; n int;
begin
  select * into t from tournois where id = p_id for update;
  if t.phase <> 'inscriptions' or now() < t.depart then return; end if;
  n := (select count(*) from inscrits_tournoi where tournoi_id = p_id and vu >= t.depart - interval '90 seconds');
  if n < _programme_min() then
    update tournois set phase = 'annule', fini_le = now() where id = p_id;
    return;
  end if;
  update tournois set entrees = (select count(*) from inscrits_tournoi where tournoi_id = p_id) where id = p_id;
  perform set_config('pcf.sans_remboursement', 'on', true);
  delete from inscrits_tournoi where tournoi_id = p_id and vu < t.depart - interval '90 seconds';
  perform set_config('pcf.sans_remboursement', 'off', true);
  update tournois set taille = _taille_tableau(n) where id = p_id;
  perform _ajouter_bots(p_id, _taille_tableau(n) - n);
  perform _lancer_direct(p_id);
end $$;

-- Sit & Go : 2 minutes après le premier arrivé, des bots complètent la salle (au moins 2 joueurs, et un quart de la salle).
create or replace function public._attente_bots() returns interval language sql immutable as $$ select interval '2 minutes' $$;
create or replace function public._completer_salles() returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; h int;
begin
  for t in select * from tournois where mode = 'direct' and freeroll is null and programme is null and phase = 'inscriptions'
           and (select min(inscrit_le) from inscrits_tournoi where tournoi_id = tournois.id) < now() - _attente_bots()
           for update skip locked loop
    h := (select count(*) from inscrits_tournoi i where i.tournoi_id = t.id and not _est_bot(i.joueur));
    continue when h < greatest(2, t.taille / 4);
    perform _ajouter_bots(t.id, t.taille - (select count(*)::int from inscrits_tournoi where tournoi_id = t.id));
    perform _lancer_direct(t.id);
  end loop;
end $$;

-- Remplace la version de l'étape 18 : on retire les absents, puis on complète les salles qui attendent.
create or replace function public._nettoyer_salles() returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from inscrits_tournoi i using tournois t
  where t.id = i.tournoi_id and t.mode = 'direct' and t.freeroll is null and t.programme is null
    and t.phase = 'inscriptions' and i.vu < now() - _absence_salle() and not _est_bot(i.joueur);
  perform _completer_salles();
end $$;

-- ---------------------------------------------------------------- les jetons : jamais pour les bots
-- L'entrée : les bots ne paient pas. Remplace la version de l'étape 18.
create or replace function public._mise_inscription() returns trigger
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  if _est_bot(case when tg_op = 'INSERT' then new.joueur else old.joueur end) then
    return case when tg_op = 'INSERT' then new else old end;
  end if;
  if tg_op = 'INSERT' then
    select * into t from tournois where id = new.tournoi_id;
    if coalesce(t.mise, 0) > 0 then
      if _solde(new.joueur) < t.mise then raise exception 'Pas assez de jetons pour une entrée de %', t.mise; end if;
      perform _crediter(new.joueur, -t.mise, case when t.programme is not null then 'entrée de tournoi' else 'entrée de Sit & Go' end);
    end if;
    return new;
  end if;
  select * into t from tournois where id = old.tournoi_id;
  if coalesce(t.mise, 0) > 0 and t.phase = 'inscriptions' and coalesce(current_setting('pcf.sans_remboursement', true), '') <> 'on'
     and exists (select 1 from jetons where joueur = old.joueur) then
    perform _crediter(old.joueur, t.mise, 'entrée rendue');
  end if;
  return old;
end $$;

-- Le palier d'une place : 1 (1er), 2 (2e), 3 (3e-4e), 4 (5e-8e)…
create or replace function public._palier(p_place int) returns int language plpgsql immutable as $$
declare k int := 1;
begin
  while (1 << (k - 1)) < p_place loop k := k + 1; end loop;
  return k;
end $$;

-- Verse la cagnotte aux humains, classés selon leur parcours (vainqueur, puis le tour où ils ont perdu) ;
-- des humains éliminés au même tour se partagent les parts de leurs places. Remplace la version de l'étape 19.
create or replace function public._verser_dotations(p_id uuid, p_pot int, p_joueurs int, p_jeu text) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; np int := _places_payees(p_joueurs); g int[] := _grille(_places_payees(p_joueurs)); r record; k int; parts int;
begin
  select * into t from tournois where id = p_id;
  for r in with h as (
      select i.joueur, case when i.joueur = t.vainqueur then t.nb_tours + 1
                            else coalesce((select max(m.tour) from matchs_tournoi m where m.tournoi_id = p_id and m.fin is not null
                                           and i.joueur in (m.j0, m.j1) and m.vainqueur is distinct from i.joueur), 0) end as etape
      from inscrits_tournoi i where i.tournoi_id = p_id and not _est_bot(i.joueur))
    select joueur, (rank() over (order by etape desc))::int as rg, (count(*) over (partition by etape))::int as nb from h loop
    continue when r.rg > np;
    parts := 0;
    for k in r.rg .. least(r.rg + r.nb - 1, np) loop parts := parts + g[_palier(k)]; end loop;
    perform _portefeuille_de(r.joueur);
    perform _crediter(r.joueur, floor(p_pot * parts / (10000.0 * r.nb))::int, p_jeu || ' : ' || (_noms_places())[_palier(r.rg)]);
  end loop;
end $$;

-- Les joueurs humains d'un tournoi.
create or replace function public._humains(p_id uuid) returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from inscrits_tournoi i where i.tournoi_id = p_id and not _est_bot(i.joueur)
$$;

-- Remplace la version de l'étape 20 : la cagnotte ne compte que les entrées des humains.
create or replace function public._gains_tournoi() returns trigger
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if coalesce(new.mise, 0) <= 0 or new.programme is not null or new.phase = old.phase then return new; end if;
  if new.phase = 'annule' and old.phase in ('inscriptions', 'en_cours') then
    perform _crediter(i.joueur, new.mise, 'entrée rendue') from inscrits_tournoi i where i.tournoi_id = new.id and not _est_bot(i.joueur);
  elsif new.phase = 'termine' then
    n := _humains(new.id);
    perform _verser_dotations(new.id, floor(new.mise * n * (1 - _commission()))::int, n, 'Sit & Go');
  end if;
  return new;
end $$;

-- Remplace la version de l'étape 19.
create or replace function public._gains_programme() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.programme is null or new.phase = old.phase then return new; end if;
  if new.phase = 'annule' and old.phase = 'inscriptions' then
    perform _crediter(i.joueur, new.mise, 'entrée rendue') from inscrits_tournoi i where i.tournoi_id = new.id and not _est_bot(i.joueur);
  elsif new.phase = 'termine' then
    perform _verser_dotations(new.id, _cagnotte_programme(new), _humains(new.id), 'tournoi');
  end if;
  return new;
end $$;

-- Remplace la version de l'étape 19 (cagnotte offerte : 1 000 + 50 par joueur humain).
create or replace function public._gains_freeroll() returns trigger
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if new.freeroll is null or new.phase <> 'termine' or old.phase = 'termine' then return new; end if;
  n := _humains(new.id);
  perform _verser_dotations(new.id, 1000 + 50 * n, n, 'freeroll');
  return new;
end $$;

-- Remplace la version de l'étape 18 (pendant les inscriptions, il n'y a pas encore de bots).
create or replace function public._cagnotte_programme(t public.tournois) returns int
language sql stable security definer set search_path = public as $$
  select greatest(t.garantie, floor(t.mise * coalesce(t.entrees, _humains(t.id)) * (1 - _commission()))::int)
$$;

-- Le résumé d'un tournoi : avec le nombre de bots. Remplace la version de l'étape 18.
create or replace function public._resume_tournoi(t public.tournois) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', t.id, 'mode', t.mode, 'taille', t.taille, 'nom', t.nom, 'phase', t.phase, 'tour', t.tour, 'nb_tours', t.nb_tours, 'echeance', t.echeance,
    'points_par_set', t.points_par_set, 'sets_gagnants', t.sets_gagnants, 'duree_minutes', extract(epoch from t.duree_tour)::int / 60,
    'mise', t.mise, 'freeroll', t.freeroll, 'programme', t.programme, 'depart', t.depart, 'garantie', t.garantie, 'finale_sets', t.finale_sets,
    'cercle', (select jsonb_build_object('id', c.id, 'nom', c.nom, 'blason', c.blason) from cercles c where c.id = t.cercle_id),
    'inscrits', (select count(*) from inscrits_tournoi where tournoi_id = t.id),
    'bots', (select count(*) from inscrits_tournoi i join bots_en_ligne b on b.joueur = i.joueur where i.tournoi_id = t.id),
    'inscrit', exists (select 1 from inscrits_tournoi where tournoi_id = t.id and joueur = auth.uid()),
    'createur', t.createur = auth.uid(),
    'vainqueur', case when t.vainqueur is not null then _carte(t.vainqueur) end,
    'a_jouer', exists (select 1 from matchs_tournoi m where m.tournoi_id = t.id and m.tour = t.tour and m.fin is null
                         and t.phase = 'en_cours' and auth.uid() in (m.j0, m.j1)),
    'elimine', t.phase = 'en_cours' and exists (select 1 from matchs_tournoi m where m.tournoi_id = t.id and m.fin is not null
                         and auth.uid() in (m.j0, m.j1) and m.vainqueur is distinct from auth.uid()))
$$;

-- Le freeroll du jour : la cagnotte ne compte que les humains. Remplace la version de l'étape 15.
create or replace function public.freeroll_du_jour() returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.tournois; j date := _aujourdhui();
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  t := _freeroll(j);
  update inscrits_tournoi set vu = now() where tournoi_id = t.id and joueur = auth.uid();
  if t.phase = 'inscriptions' and now() >= _heure_freeroll(j) then perform _lancer_freeroll(t.id); end if;
  if t.phase in ('inscriptions', 'en_cours') then perform _veille_bots(); perform _avancer_tournoi(t.id); end if;
  select * into t from tournois where id = t.id;
  return _resume_tournoi(t) || jsonb_build_object('depart', _heure_freeroll(j), 'maintenant', now(), 'cagnotte', 1000 + 50 * _humains(t.id));
end $$;

-- ---------------------------------------------------------------- le programme allégé
create or replace function public._programmes_actifs() returns text[] language sql immutable as $$ select array['grand_chelem'] $$;

-- Les inscriptions déjà prises aux tournois mis en pause sont annulées (et remboursées).
update public.tournois set phase = 'annule', fini_le = now()
where programme is not null and not (programme = any (public._programmes_actifs())) and phase = 'inscriptions';

-- Remplace la version de l'étape 18 : seulement les tournois actifs.
create or replace function public.tournois_programmes() returns jsonb
language plpgsql security definer set search_path = public as $$
declare p record; t public.tournois; liste jsonb := '[]'::jsonb; dernier public.tournois;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  update inscrits_tournoi i set vu = now() from tournois t2
  where t2.id = i.tournoi_id and i.joueur = auth.uid() and t2.programme is not null and t2.phase = 'inscriptions';
  perform _veille_tournois();
  for p in select * from _programme() where cle = any (_programmes_actifs()) loop
    t := _prochain_programme(p.cle);
    continue when t.id is null;
    if t.phase = 'inscriptions' and now() >= t.depart then perform _lancer_programme(t.id); end if;
    if t.phase in ('inscriptions', 'en_cours') then perform _avancer_tournoi(t.id); end if;
    select * into t from tournois where id = t.id;
    liste := liste || jsonb_build_array(_resume_tournoi(t) || jsonb_build_object('cle', p.cle, 'cagnotte', _cagnotte_programme(t)));
  end loop;
  select * into dernier from tournois where programme = 'grand_chelem' and phase = 'termine' and vainqueur is not null order by depart desc limit 1;
  return jsonb_build_object('maintenant', now(),
    'tournois', coalesce((select jsonb_agg(x order by x->>'depart') from jsonb_array_elements(liste) x), '[]'::jsonb),
    'tenant', case when dernier.id is not null then _carte(dernier.vainqueur) || jsonb_build_object('depart', dernier.depart) end);
end $$;

-- Remplace la version de l'étape 18 : seulement les tournois actifs.
create or replace function public.inscrire_programme(p_cle text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton compte'; end if;
  if not (p_cle = any (_programmes_actifs())) then raise exception 'Ce tournoi n''est pas au programme en ce moment'; end if;
  t := _prochain_programme(p_cle);
  if t.id is null or t.phase <> 'inscriptions' or now() >= t.depart then raise exception 'Les inscriptions à ce tournoi sont closes'; end if;
  if exists (select 1 from inscrits_tournoi where tournoi_id = t.id and joueur = auth.uid()) then return tournois_programmes(); end if;
  perform _assez_pour(t.mise);
  insert into inscrits_tournoi (tournoi_id, joueur, vu) values (t.id, auth.uid(), now());
  return tournois_programmes();
end $$;

-- ---------------------------------------------------------------- le minuteur : chaque minute
-- Lance les tournois à l'heure, fait avancer ceux en cours, complète les salles de Sit & Go, surveille les matchs contre les bots.
create or replace function public._veille_tournois() returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  perform _veille_bots();
  for t in select * from tournois where programme is not null and phase = 'inscriptions' and depart <= now() loop
    perform _lancer_programme(t.id);
  end loop;
  for t in select * from tournois where freeroll is not null and phase = 'inscriptions' and _heure_freeroll(freeroll) <= now() loop
    perform _lancer_freeroll(t.id);
  end loop;
  for t in select * from tournois where mode = 'direct' and phase = 'en_cours' and lance_le > now() - interval '6 hours' loop
    perform _avancer_tournoi(t.id);
  end loop;
  perform _nettoyer_salles();
end $$;

do $$ begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job where jobname = 'veille-tournois';
  perform cron.schedule('veille-tournois', '* * * * *', 'select public._veille_tournois()');
exception when others then
  raise notice 'pg_cron indisponible ici : pas de minuteur des tournois (%)', sqlerrm;
end $$;

-- ---------------------------------------------------------------- sécurité
revoke all on function public._est_bot(uuid), public._modeles_bots(), public._assurer_bots(int), public._ajouter_bots(uuid, int),
  public._coup_bot(uuid), public._duel_bot_avant(), public._duel_bot_apres(), public._match_bots(), public._veille_bots(),
  public._lancer_direct(uuid), public._taille_tableau(int), public._lancer_freeroll(uuid), public._lancer_programme(uuid),
  public._completer_salles(), public._nettoyer_salles(), public._mise_inscription(), public._palier(int),
  public._verser_dotations(uuid, int, int, text), public._humains(uuid), public._gains_tournoi(), public._gains_programme(),
  public._gains_freeroll(), public._cagnotte_programme(public.tournois), public._resume_tournoi(public.tournois),
  public._programmes_actifs(), public._veille_tournois() from public, anon, authenticated;
revoke all on function public.freeroll_du_jour(), public.tournois_programmes(), public.inscrire_programme(text) from public, anon;
grant execute on function public.freeroll_du_jour(), public.tournois_programmes(), public.inscrire_programme(text) to authenticated;
