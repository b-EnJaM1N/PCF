-- Tests de supabase/etape-36-championnat-hebdo.sql : le championnat du cercle, chaque semaine.
\set QUIET on
\echo Tests de la base de données (étape 36 : championnat chaque semaine)

insert into auth.users values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'a@x.fr'), ('bbbbbbbb-0000-0000-0000-000000000002', 'b@x.fr'),
  ('cccccccc-0000-0000-0000-000000000003', 'c@x.fr'), ('dddddddd-0000-0000-0000-000000000004', 'd@x.fr'),
  ('eeeeeeee-0000-0000-0000-000000000005', 'e@x.fr');
insert into profils (id, pseudo, numero) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Alice', 0), ('bbbbbbbb-0000-0000-0000-000000000002', 'Bob', 0),
  ('cccccccc-0000-0000-0000-000000000003', 'Chloé', 0), ('dddddddd-0000-0000-0000-000000000004', 'Dan', 0),
  ('eeeeeeee-0000-0000-0000-000000000005', 'Emma', 0);

create or replace function pg_temp.en_tant_que(uid text) returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', uid, false);
  execute format('set role %I', case when uid = '' then 'anon' else 'authenticated' end);
end $$;
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
create or replace function pg_temp.interdit(sql text, msg text) returns void language plpgsql as $$
begin
  begin execute sql; exception when others then raise notice 'ok : %', msg; return; end;
  raise exception 'ÉCHEC : accepté alors que ça devait être refusé : %', msg;
end $$;
create temp table t (cle text primary key, val text);
grant all on t to public;
create or replace function pg_temp.v(k text) returns text language sql as $$ select val from t where cle = k $$;
create or replace function pg_temp.match(tid text, x text, y text) returns uuid language sql as $$
  select id from matchs_tournoi where tournoi_id = tid::uuid and fin is null and x::uuid in (j0, j1) and y::uuid in (j0, j1) order by position limit 1
$$;
-- Un match du championnat, joué point par point (sets de 1 point) : « G » = point du gagnant, « P » = point du perdant.
create or replace function pg_temp.jouer_match(tid text, gagnant text, perdant text, points text) returns void language plpgsql as $$
declare mid uuid; d uuid; m int; c text;
begin
  execute 'reset role'; mid := pg_temp.match(tid, gagnant, perdant);
  perform pg_temp.en_tant_que(gagnant); d := (jouer_match_tournoi(mid)).id;
  perform pg_temp.en_tant_que(perdant); perform jouer_match_tournoi(mid);
  foreach c in array regexp_split_to_array(points, '') loop
    perform pg_temp.en_tant_que(gagnant); perform pret(d);
    perform pg_temp.en_tant_que(perdant); perform pret(d);
    m := (select manche from duels where id = d);
    perform pg_temp.en_tant_que(gagnant); perform jouer(d, m, case when c = 'G' then 0 else 1 end);
    perform pg_temp.en_tant_que(perdant); perform jouer(d, m, case when c = 'G' then 1 else 0 end);
  end loop;
  execute 'reset role';
end $$;
\set A 'aaaaaaaa-0000-0000-0000-000000000001'
\set B 'bbbbbbbb-0000-0000-0000-000000000002'
\set C 'cccccccc-0000-0000-0000-000000000003'
\set D 'dddddddd-0000-0000-0000-000000000004'
\set E 'eeeeeeee-0000-0000-0000-000000000005'

-- 0. Les heures de Paris
select pg_temp.verifier(_prochain_lundi_midi('2026-10-09 10:00+00') = '2026-10-12 10:00+00', 'vendredi : départ le lundi suivant à 12 h (heure d''été)');
select pg_temp.verifier(_prochain_lundi_midi('2026-10-12 10:00+00') = '2026-10-19 10:00+00', 'lundi 12 h pile : le lundi d''après');
select pg_temp.verifier(_prochain_lundi_midi('2026-10-30 12:00+00') = '2026-11-02 11:00+00', 'heure d''hiver : lundi 12 h = 11 h UTC');
select pg_temp.verifier(_fin_semaine('2026-10-12 10:00+00') = '2026-10-18 20:00+00', 'parti lundi : fin le dimanche 22 h');
select pg_temp.verifier(_fin_semaine('2026-10-09 10:00+00') = '2026-10-18 20:00+00', 'parti vendredi : moins de 3 jours, fin le dimanche d''après');

-- 1. Un cercle et un championnat de chaque semaine
select pg_temp.en_tant_que(:'A');
insert into t select 'cercle', creer_cercle('Famille', '{}')->>'id';
reset role; insert into t select 'code_cercle', code from cercles where id = pg_temp.v('cercle')::uuid;
select pg_temp.en_tant_que(:'B'); select rejoindre_cercle(pg_temp.v('code_cercle'));
select pg_temp.en_tant_que(:'C'); select rejoindre_cercle(pg_temp.v('code_cercle'));
select pg_temp.en_tant_que(:'D'); select rejoindre_cercle(pg_temp.v('code_cercle'));
select pg_temp.en_tant_que(:'B');
insert into t select 's1', creer_championnat('Ligue du lundi', pg_temp.v('cercle')::uuid, 1, 1, 3, false, 'Le dernier paie les croissants', true)->>'id';
select pg_temp.verifier((select (x->>'hebdo')::boolean and (x->>'edition')::int = 1 and (x->>'duree_minutes')::int = 10080
  and x->>'serie' = pg_temp.v('s1') from voir_tournoi(pg_temp.v('s1')::uuid) x), 'chaque semaine : édition 1, une semaine');
reset role; select pg_temp.verifier((select depart = _prochain_lundi_midi(now()) from tournois where id = pg_temp.v('s1')::uuid), 'départ prévu lundi 12 h');
select pg_temp.en_tant_que(:'B');
select pg_temp.verifier((select (x->>'arrete_serie')::boolean from voir_tournoi(pg_temp.v('s1')::uuid) x), 'l''organisateur peut arrêter la série');
select pg_temp.en_tant_que(:'C');
select pg_temp.verifier((select not (x->>'arrete_serie')::boolean from voir_tournoi(pg_temp.v('s1')::uuid) x), 'un simple membre ne peut pas l''arrêter');
select pg_temp.interdit(format('select arreter_serie(%L)', pg_temp.v('s1')), 'arrêt refusé à un simple membre');
select inscrire_tournoi(pg_temp.v('s1')::uuid);
-- Ancien appel de l'appli (sans p_hebdo) : toujours accepté, une seule fois.
insert into t select 'unique', creer_championnat('Une fois', pg_temp.v('cercle')::uuid, 1, 1, 3)->>'id';
select pg_temp.verifier((select not (x->>'hebdo')::boolean and x->>'serie' is null and (x->>'duree_minutes')::int = 4320 from voir_tournoi(pg_temp.v('unique')::uuid) x), 'sans répétition : comme avant');

-- 2. Lundi midi : seulement 2 joueurs, le départ attend une semaine
reset role; update tournois set depart = now() - interval '1 minute' where id = pg_temp.v('s1')::uuid;
select _veille_championnats();
select pg_temp.verifier((select phase = 'inscriptions' and depart = _prochain_lundi_midi(now()) from tournois where id = pg_temp.v('s1')::uuid), 'moins de 3 joueurs : départ reporté au lundi suivant');
select pg_temp.en_tant_que(:'D'); select inscrire_tournoi(pg_temp.v('s1')::uuid);
reset role; update tournois set depart = now() - interval '1 minute' where id = pg_temp.v('s1')::uuid;
select _veille_championnats();
select pg_temp.verifier((select phase = 'en_cours' and echeance = _fin_semaine(lance_le) from tournois where id = pg_temp.v('s1')::uuid), 'lundi midi, 3 joueurs : départ automatique, fin le dimanche 22 h');
select pg_temp.verifier((select count(*) = 3 from matchs_tournoi where tournoi_id = pg_temp.v('s1')::uuid), '3 joueurs : 3 matchs');

-- 3. La semaine : Bob bat Chloé, Bob bat Dan ; Chloé contre Dan pas joué. Dimanche soir : fin.
select pg_temp.jouer_match(pg_temp.v('s1'), :'B', :'C', 'G');
select pg_temp.jouer_match(pg_temp.v('s1'), :'B', :'D', 'G');
reset role; update tournois set echeance = now() - interval '1 second' where id = pg_temp.v('s1')::uuid;
select _veille_championnats();
select pg_temp.verifier((select phase = 'termine' and vainqueur = :'B' from tournois where id = pg_temp.v('s1')::uuid), 'dimanche soir : édition 1 terminée, Bob champion');
insert into t select 's2', id from tournois where serie = pg_temp.v('s1')::uuid and edition = 2;
select pg_temp.verifier((select phase = 'inscriptions' and hebdo and enjeu = 'Le dernier paie les croissants' and points_par_set = 1 and depart = _prochain_lundi_midi(now())
  and createur = :'B' from tournois where id = pg_temp.v('s2')::uuid), 'édition 2 créée : mêmes réglages, même enjeu, départ lundi 12 h');
select pg_temp.verifier((select string_agg(p.pseudo, ',' order by i.inscrit_le, p.pseudo) = 'Bob,Chloé,Dan' from inscrits_tournoi i join profils p on p.id = i.joueur
  where i.tournoi_id = pg_temp.v('s2')::uuid), 'les mêmes joueurs sont inscrits d''office');
select _avancer_championnat(pg_temp.v('s1')::uuid);
select pg_temp.verifier((select count(*) = 2 from tournois where serie = pg_temp.v('s1')::uuid), 'une seule édition suivante, même si on repasse');
select pg_temp.en_tant_que(:'C');
select pg_temp.verifier((select (x->'palmares'->0->>'edition')::int = 1 and x->'palmares'->0->'vainqueur'->>'pseudo' = 'Bob'
  and x->'palmares'->0->'dernier'->>'pseudo' = 'Dan' from voir_tournoi(pg_temp.v('s2')::uuid) x), 'palmarès de la série : édition 1, Bob champion, Dan dernier');
-- Chloé ne veut pas jouer cette semaine ; Alice (la responsable) s'inscrit.
select desinscrire_tournoi(pg_temp.v('s2')::uuid);
select pg_temp.en_tant_que(:'A'); select inscrire_tournoi(pg_temp.v('s2')::uuid);
-- L'organisateur lance plus tôt.
select pg_temp.en_tant_que(:'B'); select lancer_tournoi(pg_temp.v('s2')::uuid);
reset role;
select pg_temp.verifier((select phase = 'en_cours' and echeance = _fin_semaine(lance_le) from tournois where id = pg_temp.v('s2')::uuid), 'lancée à la main : fin le dimanche 22 h (au moins 3 jours)');

-- 4. La responsable arrête la série : l'édition en cours se joue, pas de suivante.
select pg_temp.en_tant_que(:'A'); select arreter_serie(pg_temp.v('s2')::uuid);
select pg_temp.jouer_match(pg_temp.v('s2'), :'A', :'B', 'G');
reset role; update tournois set echeance = now() - interval '1 second' where id = pg_temp.v('s2')::uuid;
select _veille_championnats();
select pg_temp.verifier((select phase = 'termine' from tournois where id = pg_temp.v('s2')::uuid), 'édition 2 terminée');
select pg_temp.verifier((select count(*) = 2 from tournois where serie = pg_temp.v('s1')::uuid), 'série arrêtée : pas d''édition 3');

-- 5. Une semaine où personne ne joue : la série s'arrête toute seule.
select pg_temp.en_tant_que(:'C');
insert into t select 'v1', creer_championnat('Ligue fantôme', pg_temp.v('cercle')::uuid, 1, 1, 7, false, null, true)->>'id';
select pg_temp.en_tant_que(:'A'); select inscrire_tournoi(pg_temp.v('v1')::uuid);
select pg_temp.en_tant_que(:'D'); select inscrire_tournoi(pg_temp.v('v1')::uuid);
reset role; update tournois set depart = now() - interval '1 minute' where id = pg_temp.v('v1')::uuid;
select _veille_championnats();
update tournois set echeance = now() - interval '1 second' where id = pg_temp.v('v1')::uuid;
select _veille_championnats();
select pg_temp.verifier((select phase = 'termine' and not hebdo from tournois where id = pg_temp.v('v1')::uuid)
  and not exists (select 1 from tournois where serie = pg_temp.v('v1')::uuid and edition = 2), 'aucun match joué de la semaine : la série s''arrête');
