-- Tests des étapes 55 et 56 : les surnoms dits par Roland, puis leur retrait.
\set QUIET on
\echo Tests de la base de données (étape 55 : les voix des surnoms)
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
create or replace function pg_temp.interdit(sql text, msg text) returns void language plpgsql as $$
begin
  begin execute sql; exception when others then raise notice 'ok : %', msg; return; end;
  raise exception 'ÉCHEC : accepté alors que ça devait être refusé : %', msg;
end $$;
-- (l'étape 56 défait l'étape 55 : les surnoms dits par Roland sont abandonnés)
select pg_temp.verifier(to_regclass('public.surnoms_voix') is null, 'étape 56 : la table des enregistrements est retirée');
