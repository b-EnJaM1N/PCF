-- Tests de supabase/etape-55-surnoms-voix.sql : le stockage public des surnoms, la table des enregistrements fermée aux joueurs.
\set QUIET on
\echo Tests de la base de données (étape 55 : les voix des surnoms)
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
create or replace function pg_temp.interdit(sql text, msg text) returns void language plpgsql as $$
begin
  begin execute sql; exception when others then raise notice 'ok : %', msg; return; end;
  raise exception 'ÉCHEC : accepté alors que ça devait être refusé : %', msg;
end $$;
select pg_temp.verifier((select public from storage.buckets where id = 'surnoms'), 'le stockage « surnoms » est public');
set role authenticated;
select pg_temp.interdit('select count(*) from surnoms_voix', 'un joueur ne lit pas la table des enregistrements');
select pg_temp.interdit($$insert into surnoms_voix (cle) values ('la_quiche__du_pmu')$$, 'un joueur n''écrit pas dans la table');
reset role;
