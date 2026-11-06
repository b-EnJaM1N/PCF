-- Tests de supabase/etape-59-premier-match-lance.sql : premier match lancé, premier coup joué.
\set QUIET on
\echo Tests de la base de données (étape 59 : premier match lancé)

create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
delete from parcours;

set role anon;
select compter_parcours('site', (now() at time zone 'Europe/Paris')::date, 'arrive');
select compter_parcours('site', (now() at time zone 'Europe/Paris')::date, 'premier_lance');
select compter_parcours('site', (now() at time zone 'Europe/Paris')::date, 'premier_coup');
select compter_parcours('android', (now() at time zone 'Europe/Paris')::date - 2, 'premier_lance');
-- refusés : trop ancien, dans le futur
select compter_parcours('site', (now() at time zone 'Europe/Paris')::date - 31, 'premier_lance');
select compter_parcours('site', (now() at time zone 'Europe/Paris')::date + 1, 'premier_coup');
reset role;

do $$ declare j date := (now() at time zone 'Europe/Paris')::date; begin
  perform pg_temp.verifier((select nouveaux = 1 and premier_lance = 1 and premier_coup = 1 and premier_match = 0 from parcours where arrivee = j and origine = 'site'), 'arrivé aujourd''hui : lancé, un coup joué, pas fini');
  perform pg_temp.verifier((select premier_lance = 1 and nouveaux = 0 from parcours where arrivee = j - 2 and origine = 'android'), 'arrivé avant-hier, lancé aujourd''hui');
  perform pg_temp.verifier((select count(*) = 2 from parcours), 'les envois incohérents sont ignorés');
end $$;
delete from parcours;
