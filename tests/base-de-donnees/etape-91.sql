-- Tests de supabase/etape-91-reactions-revue.sql : les réactions sous les articles des Cahiers.
\set QUIET on
\echo Tests de la base de données (étape 91 : les réactions des Cahiers)

create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
create or replace function pg_temp.n(a text, c text) returns bigint language sql as $$
  select coalesce((select nombre from compteurs_revue(a) where cle = c), 0)
$$;
delete from reactions_revue;

set role anon;
select count(*) from reagir_revue('revue-essai', '00000000-0000-0000-0000-00000000000a', 'pouce_haut', true);
select count(*) from reagir_revue('revue-essai', '00000000-0000-0000-0000-00000000000a', 'rire', true);
select count(*) from reagir_revue('revue-essai', '00000000-0000-0000-0000-00000000000a', 'rire', true);
select count(*) from reagir_revue('revue-essai', '00000000-0000-0000-0000-00000000000b', 'pouce_haut', true);
select pg_temp.verifier(pg_temp.n('revue-essai', 'pouce_haut') = 2, 'deux 👍 (deux navigateurs)');
select pg_temp.verifier(pg_temp.n('revue-essai', 'rire') = 1, 'un seul 😂 par navigateur');
-- 👎 remplace 👍 pour ce navigateur
select count(*) from reagir_revue('revue-essai', '00000000-0000-0000-0000-00000000000a', 'pouce_bas', true);
select pg_temp.verifier(pg_temp.n('revue-essai', 'pouce_haut') = 1 and pg_temp.n('revue-essai', 'pouce_bas') = 1, '👍 et 👎 s''excluent');
select pg_temp.verifier((select mien from compteurs_revue('revue-essai', '00000000-0000-0000-0000-00000000000a') where cle = 'pouce_bas'), 'mes réactions marquées');
select pg_temp.verifier(not (select mien from compteurs_revue('revue-essai', '00000000-0000-0000-0000-00000000000b') where cle = 'pouce_bas'), 'pas celles des autres');
-- retirer
select count(*) from reagir_revue('revue-essai', '00000000-0000-0000-0000-00000000000a', 'rire', false);
select pg_temp.verifier(pg_temp.n('revue-essai', 'rire') = 0, 'réaction retirée');
select pg_temp.verifier(pg_temp.n('revue-autre', 'pouce_haut') = 0, 'chaque article a ses compteurs');
-- refus
do $$ begin perform reagir_revue('pas-un-article', '00000000-0000-0000-0000-00000000000a', 'feu', true); raise exception 'aurait dû refuser'; exception when others then if sqlerrm not like 'Réaction invalide%' then raise; end if; end $$;
do $$ begin perform reagir_revue('revue-essai', '00000000-0000-0000-0000-00000000000a', 'coeur', true); raise exception 'aurait dû refuser'; exception when others then if sqlerrm not like 'Réaction invalide%' then raise; end if; end $$;
select pg_temp.verifier(not has_table_privilege('anon', 'public.reactions_revue', 'select'), 'la table ne se lit pas directement');
reset role;
delete from reactions_revue;
