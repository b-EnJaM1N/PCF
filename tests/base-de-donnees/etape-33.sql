-- Tests de supabase/etape-33-64-bots.sql : 64 bots en ligne, une salle de 64 se complète avec 63 bots différents.
-- (Mêmes outils que les tests de l'étape 24.)
\set QUIET on
\echo Tests de la base de données (étape 33 : 64 bots)

insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 4) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'Joueur' || i, 0 from generate_series(1, 4) i;

create or replace function pg_temp.u(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid $$;
create or replace function pg_temp.en_tant_que(uid text) returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', uid, false);
  execute format('set role %I', case when uid = '' then 'anon' else 'authenticated' end);
end $$;
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
create or replace function pg_temp.solde(i int) returns int language sql security definer as $$ select coalesce((select solde from public.jetons where joueur = pg_temp.u(i)), 1000) $$;
-- Un joueur seul dans une salle de Sit & Go, qui attend depuis 3 minutes : la salle se complète.
create or replace function pg_temp.salle_seul(i int, p_taille int, p_mise int) returns public.tournois language plpgsql as $$
declare t public.tournois;
begin
  perform pg_temp.en_tant_que(pg_temp.u(i)::text);
  perform rejoindre_sit_and_go(p_taille, p_mise);
  execute 'reset role';
  select t2.* into t from tournois t2 join inscrits_tournoi x on x.tournoi_id = t2.id where x.joueur = pg_temp.u(i) and t2.phase = 'inscriptions';
  update inscrits_tournoi set inscrit_le = now() - interval '3 minutes' where tournoi_id = t.id;
  perform _veille_tournois();
  select * into t from tournois where id = t.id;
  return t;
end $$;

do $$
declare t public.tournois;
begin
  perform _assurer_bots(0);
  perform pg_temp.verifier((select count(*) from _modeles_bots()) = 64 and (select count(*) from bots_en_ligne where actif) = 64, '64 bots en service');
  perform pg_temp.verifier((select count(distinct p.pseudo) from bots_en_ligne b join profils p on p.id = b.joueur where b.actif) = 64, '64 noms différents');
  perform pg_temp.verifier(exists (select 1 from bots_en_ligne b join profils p on p.id = b.joueur where b.actif and p.pseudo = 'Petit Scarabée 🤖' and b.elo = 920), 'Petit Scarabée est là (niveau 920)');
  perform pg_temp.verifier(exists (select 1 from bots_en_ligne b join profils p on p.id = b.joueur where b.actif and p.pseudo = 'Glaçon 97 🤖'
    and b.joueur = 'b0700000-0000-4000-8000-000000000128'::uuid), 'les anciens bots gardent leur compte (Glaçon 97)');
  -- Seul dans une salle de 64 : 63 bots, tous différents.
  t := pg_temp.salle_seul(1, 64, 0);
  perform pg_temp.verifier((select count(*) from inscrits_tournoi where tournoi_id = t.id) = 64
    and (select count(distinct b.modele) from inscrits_tournoi i join bots_en_ligne b on b.joueur = i.joueur where i.tournoi_id = t.id) = 63,
    'seul dans une salle de 64 : 63 bots, tous différents');
end $$;

reset role;
