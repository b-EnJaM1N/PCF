-- Tests de supabase/etape-38-genre.sql : la carte d'un joueur donne son genre.
\set QUIET on
\echo Tests de la base de données (étape 38 : genre dans la carte)

insert into auth.users values ('aaaaaaaa-0000-0000-0000-000000000001', 'a@x.fr'), ('bbbbbbbb-0000-0000-0000-000000000002', 'b@x.fr'),
  ('cccccccc-0000-0000-0000-000000000003', 'c@x.fr');
insert into profils (id, pseudo, numero, fiche) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Alice', 0, '{"genre": "f"}'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Bob', 0, '{"genre": "m"}'),
  ('cccccccc-0000-0000-0000-000000000003', 'Cam', 0, '{}');

create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;

select pg_temp.verifier(_carte('aaaaaaaa-0000-0000-0000-000000000001')->>'genre' = 'f', 'Alice : f');
select pg_temp.verifier(_carte('bbbbbbbb-0000-0000-0000-000000000002')->>'genre' = 'm', 'Bob : m');
select pg_temp.verifier(_carte('cccccccc-0000-0000-0000-000000000003')->>'genre' = 'm', 'sans genre dans la fiche : m');
select pg_temp.verifier(_carte('aaaaaaaa-0000-0000-0000-000000000001')->>'pseudo' = 'Alice', 'le reste de la carte ne change pas');
