-- Tests de supabase/etape-30-patience-en-salle.sql : un joueur sans signe de vie depuis 2 minutes reste en salle.
-- un seul humain suffit ; les bots comptent dans la cagnotte, chacun est payé selon sa vraie place.
\set QUIET on
\echo Tests de la base de données (étape 30 : patience en salle)

insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 5) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'Joueur' || i, 0 from generate_series(1, 5) i;

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
  perform pg_temp.en_tant_que(pg_temp.u(1)::text);
  perform rejoindre_sit_and_go(64, 0);
  execute 'reset role';
  select t2.* into t from tournois t2 join inscrits_tournoi i on i.tournoi_id = t2.id where i.joueur = pg_temp.u(1) and t2.phase = 'inscriptions';
  -- Inscrit il y a 3 minutes, dernier signe de vie il y a 2 minutes (téléphone en veille) : il reste, et les bots arrivent.
  update inscrits_tournoi set inscrit_le = now() - interval '3 minutes', vu = now() - interval '2 minutes' where tournoi_id = t.id;
  perform _veille_tournois();
  select * into t from tournois where id = t.id;
  perform pg_temp.verifier(t.phase = 'en_cours' and exists (select 1 from inscrits_tournoi where tournoi_id = t.id and joueur = pg_temp.u(1)),
    'salle de 64 : le joueur, en veille depuis 2 minutes, est toujours là et la salle démarre avec les bots');
  -- Absent depuis plus de 3 minutes : retiré.
  perform pg_temp.en_tant_que(pg_temp.u(2)::text);
  perform rejoindre_sit_and_go(8, 0);
  execute 'reset role';
  update inscrits_tournoi set vu = now() - interval '4 minutes' where joueur = pg_temp.u(2);
  perform _veille_tournois();
  perform pg_temp.verifier(not exists (select 1 from inscrits_tournoi i join tournois t2 on t2.id = i.tournoi_id where i.joueur = pg_temp.u(2) and t2.phase = 'inscriptions'),
    'absent depuis 4 minutes : retiré de la salle');
end $$;
