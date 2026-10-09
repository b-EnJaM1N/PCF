-- Tests de supabase/etape-34-enjeux.sql : le défi avec enjeu, seulement entre amis, avec des garde-fous.
\set QUIET on
\echo Tests de la base de données (étape 34 : défi avec enjeu)

insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 3) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'Joueur' || i, 0 from generate_series(1, 3) i;
-- 1 et 2 sont amis ; 3 est un inconnu.
insert into amities (a, b, demandeur, statut) values ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'amis');

create or replace function pg_temp.u(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid $$;
create or replace function pg_temp.en_tant_que(uid text) returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', uid, false);
  execute format('set role %I', case when uid = '' then 'anon' else 'authenticated' end);
end $$;
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
-- Le message d'erreur d'un défi avec enjeu (ou '' s'il passe).
create or replace function pg_temp.erreur(adv int, enjeu text) returns text language plpgsql as $$
begin
  perform lancer_defi_avec_enjeu(pg_temp.u(adv), 7, 2, false, 0, enjeu);
  return '';
exception when others then return sqlerrm;
end $$;

do $$
declare d public.duels;
begin
  perform pg_temp.en_tant_que(pg_temp.u(1)::text);
  d := lancer_defi_avec_enjeu(pg_temp.u(2), 7, 2, false, 0, '  Qui fait   la vaisselle ce soir ?  ');
  perform pg_temp.verifier(d.enjeu = 'Qui fait la vaisselle ce soir ?' and d.j1 = pg_temp.u(2) and d.phase = 'attente', 'défi avec enjeu entre amis : enregistré, espaces rangés');
  perform pg_temp.verifier(pg_temp.erreur(3, 'Qui fait la vaisselle ?') like '%seulement entre amis%', 'avec un inconnu : refusé');
  perform pg_temp.verifier(pg_temp.erreur(2, 'ok') like '%trop court%', 'trop court : refusé');
  perform pg_temp.verifier(pg_temp.erreur(2, repeat('x', 61)) like '%trop long%', 'trop long : refusé');
  perform pg_temp.verifier(pg_temp.erreur(2, 'Le perdant donne 10 €') like '%argent%' and pg_temp.erreur(2, 'Le perdant paie 20 euros') like '%argent%'
    and pg_temp.erreur(2, 'Le perdant file 5 balles') like '%argent%', 'argent : refusé');
  perform pg_temp.verifier(pg_temp.erreur(2, 'Va voir www.exemple.com') like '%lien%', 'lien : refusé');
  perform pg_temp.verifier(pg_temp.erreur(2, 'Le perdant est un enculé') like '%mot interdit%' and pg_temp.erreur(2, 'Le perdant est un CONNARD') like '%mot interdit%', 'gros mots : refusés');
  perform pg_temp.verifier(pg_temp.erreur(2, 'Concours de pâtisserie') = '', 'un mot qui contient « con » passe');

  -- L'ami voit l'enjeu ; accepter le défi, c'est accepter l'enjeu.
  perform pg_temp.en_tant_que(pg_temp.u(2)::text);
  perform pg_temp.verifier((select enjeu from duels where id = d.id) = 'Qui fait la vaisselle ce soir ?', 'l''ami voit l''enjeu');
  perform repondre_duel(d.id, true);
  perform pg_temp.verifier((select accepte_le from duels where id = d.id) is not null and (select enjeu from duels where id = d.id) is not null, 'défi accepté : l''enjeu reste');
  -- Un inconnu ne le voit pas.
  perform pg_temp.en_tant_que(pg_temp.u(3)::text);
  perform pg_temp.verifier(not exists (select 1 from duels where id = d.id), 'un autre joueur ne voit ni le duel ni l''enjeu');
end $$;

reset role;
