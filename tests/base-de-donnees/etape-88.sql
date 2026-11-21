-- Tests de supabase/etape-88-disqualifier.sql : l'organisateur disqualifie un joueur de son championnat.
\set QUIET on
\echo Tests de la base de données (étape 88 : disqualifier un joueur)

-- 8 joueurs, J1 le mieux classé.
insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 8) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'J' || i, 0 from generate_series(1, 8) i;
insert into classements (joueur, points) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 2100 - 100 * i from generate_series(1, 8) i;

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
create or replace function pg_temp.num(u uuid) returns int language sql as $$ select right(u::text, 2)::int $$;
create temp table t (cle text primary key, val text);
grant all on t to public;
create or replace function pg_temp.v(k text) returns text language sql as $$ select val from t where cle = k $$;
create or replace function pg_temp.tournoi(tid uuid) returns public.tournois language sql as $$ select * from tournois where id = tid $$;
create or replace function pg_temp.championnat(n int, opts jsonb, enjeu text default null) returns uuid language plpgsql as $$
declare tid uuid; i int;
begin
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  tid := (creer_championnat('Ligue', pg_temp.v('cercle')::uuid, 1, 1, 5, false, enjeu, false, opts)->>'id')::uuid;
  for i in 2 .. n loop perform pg_temp.en_tant_que(pg_temp.j(i)::text); perform inscrire_tournoi(tid); end loop;
  execute 'reset role';
  perform _lancer_championnat(tid);
  return tid;
end $$;
-- La saison : les matchs restants gagnés par le mieux classé.
create or replace function pg_temp.saison(tid uuid) returns void language plpgsql as $$
begin
  execute 'reset role';
  update matchs_tournoi set vainqueur = case when pg_temp.num(j0) < pg_temp.num(j1) then j0 else j1 end, fin = 'score'
  where tournoi_id = tid and tour = 1 and fin is null;
  perform _avancer_championnat(tid);
end $$;
create or replace function pg_temp.gagne(tid uuid, a int, b int) returns void language plpgsql as $$
begin
  execute 'reset role';
  update matchs_tournoi set vainqueur = pg_temp.j(a), fin = 'score'
  where tournoi_id = tid and fin is null and pg_temp.j(a) in (j0, j1) and pg_temp.j(b) in (j0, j1);
  if not found then raise exception 'ÉCHEC : pas de match J% – J% à jouer', a, b; end if;
  perform _avancer_championnat(tid);
end $$;
create or replace function pg_temp.affiches(tid uuid, ph text default 'playoff') returns text language sql as $$
  select string_agg('J' || pg_temp.num(j0) || '-J' || pg_temp.num(j1), ', ' order by position) from matchs_tournoi m
  where tournoi_id = tid and phase = ph and fin is null and tour = (select tour from tournois where id = tid)
$$;
create or replace function public._limite_tournois() returns int language sql immutable as $$ select 100 $$;

select pg_temp.en_tant_que(pg_temp.j(1)::text);
insert into t select 'cercle', creer_cercle('Le Club', '{}')->>'id';
reset role; insert into t select 'code', code from cercles where id = pg_temp.v('cercle')::uuid;
do $$ begin for i in 2 .. 8 loop perform pg_temp.en_tant_que(pg_temp.j(i)::text); perform rejoindre_cercle(pg_temp.v('code')); end loop; end $$;

-- 1. Une poule de 6 façon Top 14, avec enjeu ; J6 gagne un match (contre J5), puis ne joue plus.
reset role;
insert into t select 'top14', pg_temp.championnat(6, '{"playoffs": true, "jours_playoffs": 3}', 'Le dernier paie les croissants');
update matchs_tournoi set vainqueur = pg_temp.j(6), fin = 'score' where tournoi_id = pg_temp.v('top14')::uuid and tour = 1
  and pg_temp.j(6) in (j0, j1) and pg_temp.j(5) in (j0, j1);
select pg_temp.en_tant_que(pg_temp.j(2)::text);
select pg_temp.interdit(format('select disqualifier_joueur(%L, %L)', pg_temp.v('top14'), pg_temp.j(6)), 'seul l''organisateur disqualifie');
select pg_temp.en_tant_que(pg_temp.j(1)::text);
select pg_temp.interdit(format('select disqualifier_joueur(%L, %L)', pg_temp.v('top14'), pg_temp.j(1)), 'l''organisateur ne se disqualifie pas');
select disqualifier_joueur(pg_temp.v('top14')::uuid, pg_temp.j(6));
reset role;
select pg_temp.verifier((select count(*) = 4 from matchs_tournoi where tournoi_id = pg_temp.v('top14')::uuid and tour = 1 and fin = 'forfait'
  and pg_temp.j(6) in (j0, j1) and vainqueur <> pg_temp.j(6)), 'ses 4 matchs pas joués : gagnés par forfait par ses adversaires');
select pg_temp.verifier((select count(*) = 1 from matchs_tournoi where tournoi_id = pg_temp.v('top14')::uuid and tour = 1 and fin = 'score'
  and vainqueur = pg_temp.j(6)), 'son match déjà joué reste');
select pg_temp.verifier((select (c->>'disqualifie')::boolean and (c->>'v')::int = 1 and (c->>'forfaits')::int = 4
  and (c->'joueur'->>'id')::uuid = pg_temp.j(6) from jsonb_array_elements(_classement_championnat(pg_temp.v('top14')::uuid)) c
  order by (c->>'rang')::int desc limit 1), 'au classement : dernier, marqué disqualifié, avec 4 forfaits');
select pg_temp.verifier((select count(*) = 1 from notifications where tournoi_id = pg_temp.v('top14')::uuid and evenement = 'disqualifie'
  and joueur = pg_temp.j(6)), 'il est prévenu');
select pg_temp.verifier((select tranche_ko = (fin_prevue - echeance) / 2 from pg_temp.tournoi(pg_temp.v('top14')::uuid)),
  'à 5, les playoffs n''ont plus que 2 tours : leur temps se partage en deux');
select pg_temp.saison(pg_temp.v('top14')::uuid);
select pg_temp.verifier(pg_temp.affiches(pg_temp.v('top14')::uuid) = 'J1-J4, J2-J3', 'playoffs sans lui : demies 1-4 et 2-3 (format à 5)');
select pg_temp.verifier((select dernier = pg_temp.j(6) and nb_tours = 3 from pg_temp.tournoi(pg_temp.v('top14')::uuid)),
  'avec l''enjeu : il s''y colle d''office, pas de playouts');
select pg_temp.verifier((select count(*) = 0 from matchs_tournoi where tournoi_id = pg_temp.v('top14')::uuid and phase = 'playout'), 'pas de playouts');

-- 2. Pendant les playoffs : J4 disqualifié en demie, J1 passe ; le championnat se finit, J6 reste celui qui s'y colle
select pg_temp.en_tant_que(pg_temp.j(1)::text);
select disqualifier_joueur(pg_temp.v('top14')::uuid, pg_temp.j(4));
reset role;
select pg_temp.verifier((select vainqueur = pg_temp.j(1) and fin = 'forfait' from matchs_tournoi where tournoi_id = pg_temp.v('top14')::uuid
  and phase = 'playoff' and pg_temp.j(4) in (j0, j1)), 'demie : J4 disqualifié, J1 passe par forfait');
select pg_temp.gagne(pg_temp.v('top14')::uuid, 2, 3);
select pg_temp.gagne(pg_temp.v('top14')::uuid, 2, 1);
select pg_temp.verifier((select phase = 'termine' and vainqueur = pg_temp.j(2) and dernier = pg_temp.j(6) from pg_temp.tournoi(pg_temp.v('top14')::uuid)),
  'fini : J2 champion, J6 (le premier disqualifié) s''y colle');

-- 3. Il doit rester au moins 3 joueurs
insert into t select 'quatre', pg_temp.championnat(4, '{}');
select pg_temp.en_tant_que(pg_temp.j(1)::text);
select disqualifier_joueur(pg_temp.v('quatre')::uuid, pg_temp.j(4));
select pg_temp.interdit(format('select disqualifier_joueur(%L, %L)', pg_temp.v('quatre'), pg_temp.j(3)), 'au moins 3 joueurs restants');
select pg_temp.interdit(format('select disqualifier_joueur(%L, %L)', pg_temp.v('quatre'), pg_temp.j(4)), 'déjà disqualifié');

-- 4. Annuler un championnat en cours : les matchs joués restent, pas de champion, personne ne s'y colle, les joueurs prévenus
reset role;
insert into t select 'annule', pg_temp.championnat(5, '{}', 'Le dernier paie le café');
update matchs_tournoi set vainqueur = j0, fin = 'score' where id = (select id from matchs_tournoi where tournoi_id = pg_temp.v('annule')::uuid order by position limit 1);
select pg_temp.en_tant_que(pg_temp.j(2)::text);
select pg_temp.interdit(format('select annuler_tournoi(%L)', pg_temp.v('annule')), 'seul l''organisateur annule');
select pg_temp.en_tant_que(pg_temp.j(1)::text);
select annuler_tournoi(pg_temp.v('annule')::uuid);
reset role;
select pg_temp.verifier((select phase = 'annule' and vainqueur is null and dernier is null from pg_temp.tournoi(pg_temp.v('annule')::uuid)),
  'annulé en cours : pas de champion, personne ne s''y colle');
select pg_temp.verifier((select count(*) = 1 from matchs_tournoi where tournoi_id = pg_temp.v('annule')::uuid and fin = 'score'), 'le match joué reste');
select pg_temp.verifier((select count(*) = 4 from notifications where tournoi_id = pg_temp.v('annule')::uuid and evenement = 'tournoi_annule'),
  'les 4 autres joueurs sont prévenus');

reset role;
create or replace function public._limite_tournois() returns int language sql immutable as $$ select 5 $$;
