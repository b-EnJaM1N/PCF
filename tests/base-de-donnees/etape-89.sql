-- Tests de supabase/etape-89-calendrier-avent.sql : le calendrier de l'Avent (dates, rattrapages, cadeaux).
\set QUIET on
\echo Tests de la base de données (étape 89 : le calendrier de l’Avent)

insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 2) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'J' || i, 0 from generate_series(1, 2) i;

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
-- La date du jour, réglée par le test (test.jour)
create or replace function public._aujourdhui() returns date language sql stable as $$
  select coalesce(nullif(current_setting('test.jour', true), '')::date, (now() at time zone 'Europe/Paris')::date)
$$;
create or replace function pg_temp.le(d text) returns void language plpgsql as $$ begin perform set_config('test.jour', d, false); end $$;
create or replace function pg_temp.solde() returns int language sql as $$ select solde from jetons where joueur = '00000000-0000-0000-0000-000000000001' $$;

select pg_temp.en_tant_que('00000000-0000-0000-0000-000000000001');
select pg_temp.le('2026-11-30');
select pg_temp.verifier((mon_avent()->>'jour')::int = 0, 'en novembre : jour 0');
select pg_temp.interdit('select ouvrir_case_avent(1, ''jour'')', 'en novembre : fermé');

select pg_temp.le('2026-12-03');
select pg_temp.interdit('select ouvrir_case_avent(4, ''jour'')', 'pas encore la case 4');
select pg_temp.interdit('select ouvrir_case_avent(2, ''jour'')', 'la case 2 n''est pas la case du jour');
select pg_temp.interdit('select ouvrir_case_avent(3, ''rattrapage'')', 'la case du jour ne se rattrape pas');
select pg_temp.verifier((ouvrir_case_avent(3, 'jour')->>'cadeau') = 'gant:pullsapin', 'case 3 : le pull Sapin');
reset role;
select pg_temp.verifier((select count(*) = 1 from achats where joueur = '00000000-0000-0000-0000-000000000001' and article = 'gant:pullsapin' and prix = 0), 'le pull : un achat à 0 jeton');
select pg_temp.en_tant_que('00000000-0000-0000-0000-000000000001');
select pg_temp.interdit('select ouvrir_case_avent(3, ''jour'')', 'déjà ouverte');
reset role;
create temp table t (cle text primary key, val int); grant all on t to public;
insert into t values ('avant', pg_temp.solde());
select pg_temp.en_tant_que('00000000-0000-0000-0000-000000000001');
select pg_temp.verifier((ouvrir_case_avent(2, 'rattrapage')->>'cadeau') = 'jetons:100', 'rattrapage de la case 2 : 100 jetons');
reset role;
select pg_temp.verifier(pg_temp.solde() = (select val from t where cle = 'avant') + 100, '100 jetons crédités');
select pg_temp.en_tant_que('00000000-0000-0000-0000-000000000001');
select ouvrir_case_avent(1, 'rattrapage');
select pg_temp.verifier((mon_avent()->>'rattrapages_du_jour')::int = 2, 'deux rattrapages aujourd''hui');

-- le 28 : plus de case du jour, encore des rattrapages ; le 24 aussi se rattrape
select pg_temp.le('2026-12-28');
select pg_temp.interdit('select ouvrir_case_avent(24, ''jour'')', 'le 28 : plus de case du jour');
select pg_temp.verifier((ouvrir_case_avent(24, 'rattrapage')->>'cadeau') = 'gant:perenoel', 'le 28 : la case 24 rattrapée, le Gant du Père Noël');
select ouvrir_case_avent(5, 'rattrapage');
select pg_temp.interdit('select ouvrir_case_avent(6, ''rattrapage'')', 'deux rattrapages par jour au plus');
select pg_temp.verifier((select count(*) from jsonb_object_keys(mon_avent()->'cases')) = 5, 'cinq cases ouvertes (3, 2, 1, 24, 5)');

-- l'autre joueur ne voit pas mes cases
select pg_temp.en_tant_que('00000000-0000-0000-0000-000000000002');
select pg_temp.verifier(mon_avent()->'cases' = '{}'::jsonb, 'chacun son calendrier');
select pg_temp.le('2027-01-01');
select pg_temp.interdit('select ouvrir_case_avent(1, ''rattrapage'')', 'en janvier : fermé');

reset role;
select pg_temp.le('');
create or replace function public._aujourdhui() returns date language sql stable as $$
  select (now() at time zone 'Europe/Paris')::date
$$;
