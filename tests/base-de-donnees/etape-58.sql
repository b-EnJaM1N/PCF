-- Tests de supabase/etape-58-parcours-nouveaux.sql : le parcours des nouveaux joueurs, anonyme.
\set QUIET on
\echo Tests de la base de données (étape 58 : parcours des nouveaux)

create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
delete from parcours;

set role anon;
-- aujourd'hui (heure de Paris), hier, il y a 8 jours
select compter_parcours('site', (now() at time zone 'Europe/Paris')::date, 'arrive');
select compter_parcours('site', (now() at time zone 'Europe/Paris')::date, 'arrive');
select compter_parcours('site', (now() at time zone 'Europe/Paris')::date, 'premier_match');
select compter_parcours('site', (now() at time zone 'Europe/Paris')::date - 1, 'retour_1j');
select compter_parcours('android', (now() at time zone 'Europe/Paris')::date - 8, 'retour_7j');
-- refusés : arrivée dans le futur ou trop ancienne, étape inconnue, origine inconnue, retour au mauvais jour
select compter_parcours('site', (now() at time zone 'Europe/Paris')::date + 1, 'arrive');
select compter_parcours('site', (now() at time zone 'Europe/Paris')::date - 1, 'arrive');
select compter_parcours('site', (now() at time zone 'Europe/Paris')::date - 31, 'premier_match');
select compter_parcours('site', (now() at time zone 'Europe/Paris')::date - 3, 'retour_1j');
select compter_parcours('site', (now() at time zone 'Europe/Paris')::date - 6, 'retour_7j');
select compter_parcours('site', (now() at time zone 'Europe/Paris')::date - 14, 'retour_7j');
select compter_parcours('site', (now() at time zone 'Europe/Paris')::date, 'pirate');
select compter_parcours('pirate', (now() at time zone 'Europe/Paris')::date, 'arrive');
select compter_parcours('site', null, 'arrive');
reset role;

do $$ declare j date := (now() at time zone 'Europe/Paris')::date; begin
  perform pg_temp.verifier((select nouveaux = 2 and premier_match = 1 from parcours where arrivee = j and origine = 'site'), 'arrivés aujourd''hui : 2 nouveaux, 1 premier match fini');
  perform pg_temp.verifier((select retour_1j = 1 and nouveaux = 0 from parcours where arrivee = j - 1), 'arrivé hier, revenu aujourd''hui');
  perform pg_temp.verifier((select retour_7j = 1 from parcours where arrivee = j - 8 and origine = 'android'), 'arrivé il y a 8 jours, revenu');
  perform pg_temp.verifier((select count(*) = 3 from parcours), 'les envois incohérents sont ignorés');
end $$;

set role anon;
do $$ begin
  begin perform * from parcours; raise exception 'ÉCHEC : lecture directe permise';
  exception when insufficient_privilege then raise notice 'ok : personne ne lit le tableau directement'; end;
end $$;
reset role;
delete from parcours;
