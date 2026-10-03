-- HandSlam — Étape 24 : 32 bots, plus ou moins forts, choisis selon la mise ; un seul humain suffit.
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 23. Peut être relancé sans risque.
-- Si on relance un jour l'étape 21, il faut relancer celle-ci ensuite.
--
-- Principes (décidés avec le porteur du projet) :
--  * 32 bots tous différents (les 15 de l'entraînement + 17 nouveaux) : dans un tableau de 32, aucun doublon ;
--  * contre un humain, un bot joue selon son niveau : les faibles jouent très souvent leur signe favori (faciles à lire),
--    les forts sont presque imprévisibles et certains repèrent le signe préféré de l'humain pour le contrer ;
--  * les bots sont choisis selon la mise : sans mise et freeroll, n'importe lesquels ; 50 jetons, des faibles ;
--    100 et 200, des moyens ; 500, 1 000 et les tournois programmés payants (Grand Chelem), des forts ;
--  * un seul humain suffit : le freeroll et les tournois programmés démarrent avec 1 présent ;
--    un Sit & Go se complète 2 minutes après l'arrivée du premier joueur, même s'il est seul ;
--  * solution A : les bots comptent dans la cagnotte comme s'ils avaient payé leur entrée (sauf le freeroll, dont la
--    cagnotte est offerte : 1 000 + 50 par humain). Les bots ne gagnent toujours jamais de jetons ;
--  * chaque humain est payé selon sa vraie place dans le tableau (bots compris) : la part d'une place prise par un bot
--    n'est versée à personne.

-- ---------------------------------------------------------------- les 32 bots
alter table public.bots_en_ligne add column if not exists actif boolean not null default true;

-- Les modèles, du plus faible au plus fort (les 15 de l'entraînement, app/js/bots.js, et 17 bots des tournois en ligne).
create or replace function public._modeles_bots() returns table (cle text, nom text, favori smallint, elo int, avatar jsonb)
language sql immutable as $$
  values ('pantoufle', 'Pantoufle', 2::smallint, 800, '{"symbole":"feuille","fond":"violet","gant":"rose","poignet":"blanc","motif":"uni"}'::jsonb),
         ('rocky', 'Rocky', 0, 850, '{"symbole":"pierre","fond":"terre","gant":"rouge","poignet":"noir","motif":"uni"}'),
         ('tamagotchi', 'Tamagotchi', 1, 850, '{"symbole":"ciseaux","fond":"gazon","gant":"jaune","poignet":"bleu","motif":"uni"}'),
         ('papyrus', 'Papyrus', 2, 900, '{"symbole":"feuille","fond":"terre","gant":"blanc","poignet":"rouge","motif":"uni"}'),
         ('flanby', 'Flanby', 2, 900, '{"symbole":"feuille","fond":"or","gant":"jaune","poignet":"blanc","motif":"uni"}'),
         ('bambi', 'Bambi', 0, 950, '{"symbole":"pierre","fond":"gazon","gant":"blanc","poignet":"jaune","motif":"uni"}'),
         ('gaston', 'Gaston', 0, 950, '{"symbole":"pierre","fond":"court","gant":"rouge","poignet":"blanc","motif":"uni"}'),
         ('miroir', 'Miroir', 2, 1000, '{"symbole":"feuille","fond":"court","gant":"blanc","poignet":"bleu","motif":"rayures"}'),
         ('mollasson', 'Mollasson', 0, 1000, '{"symbole":"pierre","fond":"violet","gant":"bleu","poignet":"jaune","motif":"rayures"}'),
         ('boomerang', 'Boomerang', 0, 1050, '{"symbole":"pierre","fond":"violet","gant":"jaune","poignet":"rouge","motif":"etoile"}'),
         ('rubik', 'Rubik', 1, 1080, '{"symbole":"ciseaux","fond":"court","gant":"rouge","poignet":"jaune","motif":"rayures"}'),
         ('cyclo', 'Cyclo', 1, 1100, '{"symbole":"ciseaux","fond":"gazon","gant":"jaune","poignet":"blanc","motif":"rayures"}'),
         ('origami', 'Origami', 2, 1130, '{"symbole":"feuille","fond":"gazon","gant":"blanc","poignet":"bleu","motif":"etoile"}'),
         ('tictac', 'Tic-Tac', 1, 1150, '{"symbole":"ciseaux","fond":"violet","gant":"bleu","poignet":"blanc","motif":"rayures"}'),
         ('silex', 'Silex', 0, 1180, '{"symbole":"pierre","fond":"terre","gant":"argent","poignet":"noir","motif":"rayures"}'),
         ('chaos', 'Chaos', 1, 1200, '{"symbole":"ciseaux","fond":"court","gant":"vert","poignet":"jaune","motif":"eclair"}'),
         ('tondeuse', 'Tondeuse', 1, 1230, '{"symbole":"ciseaux","fond":"gazon","gant":"vert","poignet":"noir","motif":"rayures"}'),
         ('rancune', 'Rancune', 1, 1250, '{"symbole":"ciseaux","fond":"terre","gant":"rouge","poignet":"noir","motif":"eclair"}'),
         ('comete', 'Comète', 2, 1280, '{"symbole":"feuille","fond":"minuit","gant":"jaune","poignet":"bleu","motif":"etoile"}'),
         ('bluffeur', 'Bluffeur', 2, 1300, '{"symbole":"feuille","fond":"violet","gant":"jaune","poignet":"noir","motif":"etoile"}'),
         ('shuriken', 'Shuriken', 1, 1330, '{"symbole":"ciseaux","fond":"ardoise","gant":"noir","poignet":"rouge","motif":"eclair"}'),
         ('nemesis', 'Némésis', 0, 1350, '{"symbole":"pierre","fond":"ardoise","gant":"bleu","poignet":"or","motif":"eclair"}'),
         ('mante', 'La Mante', 1, 1400, '{"symbole":"ciseaux","fond":"gazon","gant":"vert","poignet":"noir","motif":"eclair"}'),
         ('sphinx', 'Le Sphinx', 2, 1420, '{"symbole":"feuille","fond":"or","gant":"jaune","poignet":"noir","motif":"eclair"}'),
         ('stratege', 'Stratège', 2, 1450, '{"symbole":"feuille","fond":"ardoise","gant":"rouge","poignet":"noir","motif":"eclair"}'),
         ('oracle', 'L''Oracle', 0, 1480, '{"symbole":"pierre","fond":"galaxie","gant":"blanc","poignet":"or","motif":"etoile"}'),
         ('professeur', 'Professeur', 2, 1500, '{"symbole":"feuille","fond":"or","gant":"blanc","poignet":"noir","motif":"etoile"}'),
         ('glacon97', 'Glaçon 97', 1, 1510, '{"symbole":"ciseaux","fond":"minuit","gant":"argent","poignet":"blanc","motif":"etoile"}'),
         ('mentaliste', 'Mentaliste', 2, 1550, '{"symbole":"feuille","fond":"ardoise","gant":"violet","poignet":"or","motif":"etoile"}'),
         ('titan', 'Titan', 0, 1600, '{"symbole":"pierre","fond":"or","gant":"or","poignet":"noir","motif":"etoile"}'),
         ('kaiser', 'Le Kaiser', 0, 1650, '{"symbole":"pierre","fond":"ardoise","gant":"rouge","poignet":"or","motif":"eclair"}'),
         ('boss', 'Boss Final', 1, 1700, '{"symbole":"ciseaux","fond":"stade","gant":"noir","poignet":"or","motif":"eclair"}')
$$;

-- Un compte par modèle (remplace la version de l'étape 21, qui faisait tourner les 15 modèles : on pouvait croiser deux Rocky).
-- Les anciens doublons restent (leurs matchs passés y renvoient) mais ne sont plus choisis. Le paramètre ne sert plus.
create or replace function public._assurer_bots(p_nb int) returns void
language plpgsql security definer set search_path = public, auth as $$
declare m record; k int := 0; v_id uuid;
begin
  if (select count(*) from bots_en_ligne b where b.actif and b.modele in (select cle from _modeles_bots()))
     = (select count(*) from _modeles_bots())
     and not exists (select 1 from bots_en_ligne b where b.actif and b.modele not in (select cle from _modeles_bots())) then
    return;
  end if;
  -- les doublons d'un même modèle : on garde le premier
  update bots_en_ligne b set actif = false
  where exists (select 1 from bots_en_ligne b2 where b2.modele = b.modele and b2.joueur < b.joueur);
  for m in select * from _modeles_bots() loop
    k := k + 1;
    if exists (select 1 from bots_en_ligne where modele = m.cle) then
      update bots_en_ligne set favori = m.favori, elo = m.elo where modele = m.cle;
      continue;
    end if;
    v_id := ('b0700000-0000-4000-8000-' || lpad((100 + k)::text, 12, '0'))::uuid;
    insert into auth.users (id, email) values (v_id, 'bot-' || m.cle || '@bots.handslam.fr') on conflict (id) do nothing;
    insert into profils (id, pseudo, numero, avatar, visible_recherche) values (v_id, m.nom || ' 🤖', 1000, m.avatar, false)
    on conflict (id) do nothing;
    insert into bots_en_ligne (joueur, modele, favori, elo, actif) values (v_id, m.cle, m.favori, m.elo, true)
    on conflict (joueur) do update set actif = true;
  end loop;
end $$;

-- Les niveaux de bots voulus pour un tournoi (null : n'importe lesquels).
create or replace function public._niveaux_bots(t public.tournois) returns int4range
language sql immutable as $$
  select case when t.freeroll is not null or coalesce(t.mise, 0) = 0 then null
              when t.mise <= 50 then int4range(0, 1100, '[]')
              when t.mise <= 200 then int4range(1000, 1350, '[]')
              else int4range(1250, null) end
$$;

-- Ajoute p_nb bots (pas encore inscrits) à un tournoi : ceux du niveau voulu d'abord (au hasard parmi eux),
-- puis, s'il en manque, les plus proches de ce niveau. Remplace la version de l'étape 21.
create or replace function public._ajouter_bots(p_id uuid, p_nb int) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; r int4range;
begin
  if p_nb <= 0 then return; end if;
  perform _assurer_bots(0);
  select * into t from tournois where id = p_id;
  r := _niveaux_bots(t);
  insert into inscrits_tournoi (tournoi_id, joueur, vu)
  select p_id, b.joueur, now() from bots_en_ligne b
  where b.actif and not exists (select 1 from inscrits_tournoi i where i.tournoi_id = p_id and i.joueur = b.joueur)
  order by case when r is null or r @> b.elo then 0
                when upper(r) is not null and b.elo > upper(r) then b.elo - upper(r)
                else coalesce(lower(r), 0) - b.elo end,
           random()
  limit p_nb;
end $$;

-- ---------------------------------------------------------------- le jeu d'un bot contre un humain
-- p_coups : les coups déjà joués du duel ({"a": signe de j0, "b": signe de j1}) ; p_place : la place du bot (0 ou 1).
-- Les faibles jouent souvent leur signe favori (58 % du temps en plus du hasard à 800, 5 % à 1 500 et plus).
-- À partir de 1 150, un bot repère parfois le signe préféré de l'humain sur ses 6 derniers coups et joue ce qui le bat
-- (jusqu'à 45 % du temps pour les plus forts).
create or replace function public._coup_bot(p_bot uuid, p_coups jsonb, p_place smallint) returns smallint
language plpgsql volatile security definer set search_path = public as $$
declare b public.bots_en_ligne; lecture numeric; biais numeric; prefere smallint; n int := jsonb_array_length(coalesce(p_coups, '[]'));
begin
  select * into b from bots_en_ligne where joueur = p_bot;
  if b.joueur is null then return floor(random() * 3)::smallint; end if;
  lecture := greatest(0, least(0.45, (b.elo - 1150) / 1100.0));
  biais := greatest(0.05, least(0.6, (1500 - b.elo) / 1200.0));
  if n >= 3 and random() < lecture then
    select (c ->> case when p_place = 0 then 'b' else 'a' end)::smallint into prefere
    from jsonb_array_elements(p_coups) with ordinality as x(c, k)
    where k > n - 6
    group by 1 order by count(*) desc, max(k) desc limit 1;
    if prefere is not null then return ((prefere + 2) % 3)::smallint; end if;   -- ce qui bat ce signe
  end if;
  if random() < biais then return b.favori; end if;
  return floor(random() * 3)::smallint;
end $$;

-- Le bot joue son signe dès que le coup commence. Remplace la version de l'étape 21 (le bot voit les coups passés).
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
    values (new.id, new.manche, place, _coup_bot(case when place = 0 then new.j0 else new.j1 end, new.coups, place)) on conflict do nothing;
    if found and (select count(*) from coups_secrets where duel_id = new.id and manche = new.manche) = 2 then perform _resoudre(new.id); end if;
  end if;
  return null;
end $$;

-- ---------------------------------------------------------------- un seul humain suffit
create or replace function public._freeroll_min() returns int language sql immutable as $$ select 1 $$;
create or replace function public._programme_min() returns int language sql immutable as $$ select 1 $$;

-- Sit & Go : 2 minutes après le premier arrivé, des bots complètent la salle, même avec un seul joueur.
-- Remplace la version de l'étape 21.
create or replace function public._completer_salles() returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois;
begin
  for t in select * from tournois where mode = 'direct' and freeroll is null and programme is null and phase = 'inscriptions'
           and (select min(inscrit_le) from inscrits_tournoi where tournoi_id = tournois.id) < now() - _attente_bots()
           for update skip locked loop
    continue when not exists (select 1 from inscrits_tournoi i where i.tournoi_id = t.id and not _est_bot(i.joueur));
    perform _ajouter_bots(t.id, t.taille - (select count(*)::int from inscrits_tournoi where tournoi_id = t.id));
    perform _lancer_direct(t.id);
  end loop;
end $$;

-- Tournois programmés : remplace la version de l'étape 21 (les bots ajoutés comptent comme des entrées : solution A).
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
  -- les entrées : tous les inscrits (un absent a payé et n'est pas remboursé) + les bots qui complètent le tableau
  update tournois set entrees = (select count(*) from inscrits_tournoi where tournoi_id = p_id) + _taille_tableau(n) - n where id = p_id;
  perform set_config('pcf.sans_remboursement', 'on', true);
  delete from inscrits_tournoi where tournoi_id = p_id and vu < t.depart - interval '90 seconds';
  perform set_config('pcf.sans_remboursement', 'off', true);
  update tournois set taille = _taille_tableau(n) where id = p_id;
  perform _ajouter_bots(p_id, _taille_tableau(n) - n);
  perform _lancer_direct(p_id);
end $$;

-- ---------------------------------------------------------------- les gains : la vraie place, bots compris
-- Verse la cagnotte aux humains selon leur vraie place dans le tableau (bots compris) ; des joueurs éliminés au même
-- tour se partagent les parts de leurs places (la part d'un bot n'est versée à personne). Remplace la version de l'étape 21.
create or replace function public._verser_dotations(p_id uuid, p_pot int, p_joueurs int, p_jeu text) returns void
language plpgsql security definer set search_path = public as $$
declare t public.tournois; np int := _places_payees(p_joueurs); g int[] := _grille(_places_payees(p_joueurs)); r record; k int; parts int;
begin
  select * into t from tournois where id = p_id;
  for r in with h as (
      select i.joueur, _est_bot(i.joueur) as bot,
             case when i.joueur = t.vainqueur then t.nb_tours + 1
                  else coalesce((select max(m.tour) from matchs_tournoi m where m.tournoi_id = p_id and m.fin is not null
                                 and i.joueur in (m.j0, m.j1) and m.vainqueur is distinct from i.joueur), 0) end as etape
      from inscrits_tournoi i where i.tournoi_id = p_id),
    classes as (select joueur, bot, (rank() over (order by etape desc))::int as rg, (count(*) over (partition by etape))::int as nb from h)
    select * from classes where not bot loop
    continue when r.rg > np;
    parts := 0;
    for k in r.rg .. least(r.rg + r.nb - 1, np) loop parts := parts + g[_palier(k)]; end loop;
    perform _portefeuille_de(r.joueur);
    perform _crediter(r.joueur, floor(p_pot * parts / (10000.0 * r.nb))::int, p_jeu || ' : ' || (_noms_places())[_palier(r.rg)]);
  end loop;
end $$;

-- Sit & Go à mise : la cagnotte compte tous les joueurs, bots compris (solution A). Remplace la version de l'étape 21.
create or replace function public._gains_tournoi() returns trigger
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if coalesce(new.mise, 0) <= 0 or new.programme is not null or new.phase = old.phase then return new; end if;
  if new.phase = 'annule' and old.phase in ('inscriptions', 'en_cours') then
    perform _crediter(i.joueur, new.mise, 'entrée rendue') from inscrits_tournoi i where i.tournoi_id = new.id and not _est_bot(i.joueur);
  elsif new.phase = 'termine' then
    n := (select count(*)::int from inscrits_tournoi where tournoi_id = new.id);
    perform _verser_dotations(new.id, floor(new.mise * n * (1 - _commission()))::int, n, 'Sit & Go');
  end if;
  return new;
end $$;

-- Tournois programmés : les places payées se comptent sur tout le tableau. Remplace la version de l'étape 21.
create or replace function public._gains_programme() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.programme is null or new.phase = old.phase then return new; end if;
  if new.phase = 'annule' and old.phase = 'inscriptions' then
    perform _crediter(i.joueur, new.mise, 'entrée rendue') from inscrits_tournoi i where i.tournoi_id = new.id and not _est_bot(i.joueur);
  elsif new.phase = 'termine' then
    perform _verser_dotations(new.id, _cagnotte_programme(new), (select count(*)::int from inscrits_tournoi where tournoi_id = new.id), 'tournoi');
  end if;
  return new;
end $$;

-- Freeroll : cagnotte offerte (1 000 + 50 par humain), places payées comptées sur tout le tableau. Remplace la version de l'étape 21.
create or replace function public._gains_freeroll() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.freeroll is null or new.phase <> 'termine' or old.phase = 'termine' then return new; end if;
  perform _verser_dotations(new.id, 1000 + 50 * _humains(new.id), (select count(*)::int from inscrits_tournoi where tournoi_id = new.id), 'freeroll');
  return new;
end $$;

do $$ begin perform public._assurer_bots(0); end $$;

revoke all on function public._assurer_bots(int), public._niveaux_bots(public.tournois), public._ajouter_bots(uuid, int),
  public._coup_bot(uuid, jsonb, smallint), public._duel_bot_apres(), public._completer_salles(), public._lancer_programme(uuid),
  public._verser_dotations(uuid, int, int, text), public._gains_tournoi(), public._gains_programme(), public._gains_freeroll()
  from public, anon, authenticated;
