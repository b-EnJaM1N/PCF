-- Tests de supabase/etape-90-annonce-avent.sql : l'annonce du calendrier de l'Avent, une fois par an, aux abonnés.
\set QUIET on
\echo Tests de la base de données (étape 90 : l’annonce du calendrier)

insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 3) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'J' || i, 0 from generate_series(1, 3) i;
insert into abonnements_push (endpoint, joueur, p256dh, auth) values ('https://e/1', '00000000-0000-0000-0000-000000000001', 'x', 'y'), ('https://e/1b', '00000000-0000-0000-0000-000000000001', 'x', 'y'),
  ('https://e/2', '00000000-0000-0000-0000-000000000002', 'x', 'y');

create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
create or replace function public._aujourdhui() returns date language sql stable as $$
  select coalesce(nullif(current_setting('test.jour', true), '')::date, (now() at time zone 'Europe/Paris')::date)
$$;
delete from annonces_avent;

select set_config('test.jour', '2026-11-30', false);
select pg_temp.verifier(_annoncer_avent() = 0, 'le 30 novembre : rien');
select set_config('test.jour', '2026-12-01', false);
select pg_temp.verifier(_annoncer_avent() = 2, 'le 1er décembre : les 2 joueurs abonnés (une fois chacun)');
select pg_temp.verifier((select count(*) = 2 from notifications where evenement = 'avent'), '2 notifications');
select pg_temp.verifier(_annoncer_avent() = 0, 'une seule fois');
select set_config('test.jour', '2027-12-02', false);
select pg_temp.verifier(_annoncer_avent() = 2, 'l''année suivante : à nouveau');

select set_config('test.jour', '', false);
create or replace function public._aujourdhui() returns date language sql stable as $$
  select (now() at time zone 'Europe/Paris')::date
$$;
