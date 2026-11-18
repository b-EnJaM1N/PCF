-- Tests de supabase/etape-80-smileys.sql : les smileys tout faits, et un smiley seul accepté dans un message écrit.
\set QUIET on
\echo Tests de la base de données (étape 80 : les smileys)
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
select pg_temp.verifier(bool_and('s_rire' = any (_messages_rapides(m, false))), 'un smiley tout fait permis à tous les moments, avec n''importe qui')
  from unnest(array['avant', 'entre_sets', 'vainqueur', 'vaincu']) m;
select pg_temp.verifier(not ('s_rire' = any (_messages_rapides('avant', true))), 'les smileys sont tout public (pas dans le chambrage)');
select pg_temp.verifier('pleurer' = any (_messages_rapides('avant', true)), 'le chambrage est toujours là');
select pg_temp.verifier(_message_libre_propre('😂') = '😂', 'un smiley seul accepté dans un message écrit');
select pg_temp.verifier(_message_libre_propre(' Bravo 👏 ') = 'Bravo 👏', 'un message avec un smiley');
do $$ begin perform _message_libre_propre('a'); raise exception 'ÉCHEC : une seule lettre aurait dû être refusée';
exception when others then if sqlerrm like 'ÉCHEC%' then raise; end if; raise notice 'ok : une seule lettre reste trop courte'; end $$;
