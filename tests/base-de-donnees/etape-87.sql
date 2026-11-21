-- Tests de supabase/etape-87-calendrier-championnat.sql : le calendrier choisi par l'organisateur, le décalage, le rappel.
\set QUIET on
\echo Tests de la base de données (étape 87 : le calendrier du championnat)

insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 8) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'J' || i, 0 from generate_series(1, 8) i;

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
create or replace function pg_temp.j(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid $$;
create temp table t (cle text primary key, val text);
grant all on t to public;
create or replace function pg_temp.v(k text) returns text language sql as $$ select val from t where cle = k $$;
create or replace function pg_temp.tournoi(tid uuid) returns public.tournois language sql as $$ select * from tournois where id = tid $$;
-- Un championnat de n joueurs (J1 à Jn) créé par J1 (p_jours, options), lancé.
create or replace function pg_temp.championnat(n int, jours int, opts jsonb) returns uuid language plpgsql as $$
declare tid uuid; i int;
begin
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  tid := (creer_championnat('Ligue', pg_temp.v('cercle')::uuid, 1, 1, jours, false, null, false, opts)->>'id')::uuid;
  for i in 2 .. n loop perform pg_temp.en_tant_que(pg_temp.j(i)::text); perform inscrire_tournoi(tid); end loop;
  execute 'reset role';
  perform _lancer_championnat(tid);
  return tid;
end $$;
create or replace function public._limite_tournois() returns int language sql immutable as $$ select 100 $$;

select pg_temp.en_tant_que(pg_temp.j(1)::text);
insert into t select 'cercle', creer_cercle('Le Club', '{}')->>'id';
reset role; insert into t select 'code', code from cercles where id = pg_temp.v('cercle')::uuid;
do $$ begin for i in 2 .. 8 loop perform pg_temp.en_tant_que(pg_temp.j(i)::text); perform rejoindre_cercle(pg_temp.v('code')); end loop; end $$;

-- 1. Les durées : de 1 à 30 jours
select pg_temp.en_tant_que(pg_temp.j(1)::text);
select pg_temp.interdit(format('select creer_championnat(''L'', %L, 7, 1, 0)', pg_temp.v('cercle')), '0 jour : refusé');
select pg_temp.interdit(format('select creer_championnat(''L'', %L, 7, 1, 31)', pg_temp.v('cercle')), '31 jours : refusé');
select pg_temp.interdit(format('select creer_championnat(''L'', %L, 7, 1, 5, false, null, false, ''{"playoffs": true, "jours_playoffs": 0}'')', pg_temp.v('cercle')),
  'des playoffs de 0 jour : refusés');

-- 2. Une poule de 6, façon Top 14 (3 tours), poules 5 jours, playoffs 2 jours : 16 h par tour
reset role;
insert into t select 'top14', pg_temp.championnat(6, 5, '{"playoffs": true, "jours_playoffs": 2}');
select pg_temp.verifier((select nb_tours = 4 and jours_playoffs = 2 and echeance - lance_le = interval '5 days' and tranche_ko = interval '16 hours'
  and fin_prevue - echeance = interval '48 hours' from pg_temp.tournoi(pg_temp.v('top14')::uuid)),
  'poules 5 jours, puis 3 tours de playoffs en 2 jours (16 h chacun), plus de minimum de 10 jours');

-- 3. Playoffs d'un jour pour 3 tours : 12 heures par tour au moins (le championnat dure un peu plus)
insert into t select 'court', pg_temp.championnat(6, 3, '{"playoffs": true, "jours_playoffs": 1}');
select pg_temp.verifier((select tranche_ko = interval '12 hours' and fin_prevue - echeance = interval '36 hours' and echeance - lance_le = interval '3 days'
  from pg_temp.tournoi(pg_temp.v('court')::uuid)), 'au moins 12 heures par tour de playoffs');

-- 4. Sans playoffs : la durée choisie, au jour près
insert into t select 'simple', pg_temp.championnat(4, 4, '{}');
select pg_temp.verifier((select not playoffs and jours_playoffs is null and echeance = fin_prevue and fin_prevue - lance_le = interval '4 days'
  from pg_temp.tournoi(pg_temp.v('simple')::uuid)), 'sans playoffs : 4 jours, tout le championnat');

-- 5. Avancer ou reculer la date limite des poules
select pg_temp.en_tant_que(pg_temp.j(2)::text);
select pg_temp.interdit(format('select decaler_calendrier(%L, 1)', pg_temp.v('top14')), 'seul l''organisateur change le calendrier');
select pg_temp.en_tant_que(pg_temp.j(1)::text);
select pg_temp.interdit(format('select decaler_calendrier(%L, -5)', pg_temp.v('top14')), 'la date limite ne peut pas passer à moins de 12 heures');
select pg_temp.interdit(format('select decaler_calendrier(%L, 0)', pg_temp.v('top14')), '0 jour : refusé');
select decaler_calendrier(pg_temp.v('top14')::uuid, 2);
reset role;
select pg_temp.verifier((select echeance - lance_le = interval '7 days' and fin_prevue - lance_le = interval '9 days' from pg_temp.tournoi(pg_temp.v('top14')::uuid)),
  '+2 jours : les poules et les playoffs se décalent');
select pg_temp.verifier((select count(*) = 5 from notifications where tournoi_id = pg_temp.v('top14')::uuid and evenement = 'calendrier'),
  'les 5 autres joueurs sont prévenus');
select pg_temp.en_tant_que(pg_temp.j(1)::text);
select decaler_calendrier(pg_temp.v('top14')::uuid, -3);
reset role;
select pg_temp.verifier((select echeance - lance_le = interval '4 days' from pg_temp.tournoi(pg_temp.v('top14')::uuid)), '-3 jours : raccourci');

-- 6. Le rappel, 24 heures avant la fin des poules, à ceux qui ont encore un match à jouer (une seule fois)
update matchs_tournoi set vainqueur = j0, fin = 'score' where tournoi_id = pg_temp.v('simple')::uuid and tour = 1 and pg_temp.j(4) not in (j0, j1);
update tournois set echeance = now() + interval '20 hours', fin_prevue = now() + interval '20 hours' where id = pg_temp.v('simple')::uuid;
select _veille_championnats();
select _veille_championnats();
select pg_temp.verifier((select count(*) = 4 and count(*) filter (where joueur = pg_temp.j(4)) = 1 from notifications
  where tournoi_id = pg_temp.v('simple')::uuid and evenement = 'poules_24h'), 'rappel : J4 et ses 3 adversaires (leurs matchs restent à jouer), une seule fois');
select pg_temp.verifier((select rappel_echeance from pg_temp.tournoi(pg_temp.v('simple')::uuid)), 'le rappel est noté');

-- 7. Les anciens championnats (sans durée de playoffs) gardent leur calendrier
insert into t select 'ancien', pg_temp.championnat(6, 7, '{"playoffs": true}');
select pg_temp.verifier((select jours_playoffs is null and fin_prevue - lance_le >= interval '10 days' from pg_temp.tournoi(pg_temp.v('ancien')::uuid)),
  'sans durée de playoffs : l''ancien calendrier (10 jours au moins avec 3 tours)');

create or replace function public._limite_tournois() returns int language sql immutable as $$ select 5 $$;
