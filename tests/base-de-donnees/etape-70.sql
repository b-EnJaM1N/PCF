-- Tests de supabase/etape-70-pseudo-definitif.sql : le pseudo est définitif, sauf après un retrait par la modération.
\set QUIET on
\echo Tests de la base de données (étape 70 : le pseudo définitif)

insert into auth.users values ('aaaaaaaa-0000-0000-0000-000000000001', 'a@x.fr');
create or replace function pg_temp.en_tant_que(uid text) returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', uid, false);
  execute format('set role %I', case when uid = '' then 'anon' else 'authenticated' end);
end $$;
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
\set A 'aaaaaaaa-0000-0000-0000-000000000001'
\set P '(select pseudo from profils where id = ''aaaaaaaa-0000-0000-0000-000000000001'')'
\set L '(select pseudo_libre from profils where id = ''aaaaaaaa-0000-0000-0000-000000000001'')'

-- 1. Le pseudo se choisit à la création du compte.
select pg_temp.en_tant_que(:'A');
insert into profils (id, pseudo, numero, fiche) values (:'A', 'Alice', 0, '{"matchs":1}');
select pg_temp.verifier(:P = 'Alice' and not :L, 'pseudo choisi à la création');
-- 2. Ensuite, il ne change plus : la demande est ignorée, le reste de la fiche est bien sauvegardé.
update profils set pseudo = 'Alicia', fiche = '{"matchs":2}', drapeau = '🇧🇪' where id = :'A';
select pg_temp.verifier(:P = 'Alice' and (select fiche->>'matchs' = '2' and drapeau = '🇧🇪' from profils where id = :'A'), 'pseudo définitif ; la fiche et le pays, si');
-- 3. On ne se libère pas soi-même.
update profils set pseudo_libre = true where id = :'A';
select pg_temp.verifier(not :L, 'pseudo_libre ne se modifie pas');
-- 4. Pseudo retiré par la modération : « Joueur », puis un nouveau pseudo, une seule fois.
reset role; select moderer_pseudo(:'A');
select pg_temp.verifier(:P = 'Joueur' and :L, 'pseudo retiré : « Joueur », et un nouveau pseudo possible');
select pg_temp.en_tant_que(:'A');
update profils set fiche = '{"matchs":3}' where id = :'A';
select pg_temp.verifier(:L, 'sauvegarder sa fiche ne consomme pas le droit');
update profils set pseudo = 'Alice2' where id = :'A';
select pg_temp.verifier(:P = 'Alice2' and not :L, 'nouveau pseudo choisi');
update profils set pseudo = 'Alice3' where id = :'A';
select pg_temp.verifier(:P = 'Alice2', 'une seule fois : il est de nouveau définitif');
reset role;
