-- Tests de supabase/etape-40-rappel-rdv.sql : « X t'attend », au bon moment et pas trop souvent.
\set QUIET on
\echo Tests de la base de données (étape 40 : rappel du rendez-vous)

insert into auth.users select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'j' || i || '@x.fr' from generate_series(1, 2) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'Joueur' || i, 0 from generate_series(1, 2) i;

create or replace function pg_temp.j(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-00000000000' || i)::uuid $$;
create or replace function pg_temp.en_tant_que(uid text) returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', uid, false);
  execute format('set role %I', case when uid = '' then 'anon' else 'authenticated' end);
end $$;
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
create or replace function pg_temp.nb(e text, qui int) returns int language sql as $$
  select count(*)::int from notifications where evenement = e and joueur = pg_temp.j(qui) $$;

do $$
declare d public.duels;
begin
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  d := lancer_defi(pg_temp.j(2), 11, 2);
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  d := repondre_duel(d.id, true);
  execute 'reset role';
  perform pg_temp.verifier(pg_temp.nb('accepte', 1) = 1 and pg_temp.nb('attend', 1) = 0, 'accepté : « accepté », pas de rappel en double juste après');
  -- 15 minutes plus tard, joueur 2 revient dans la salle d'attente : joueur 1 est prévenu qu'on l'attend.
  update notifications set cree_le = now() - interval '15 minutes';
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  d := rendez_vous(d.id);
  execute 'reset role';
  perform pg_temp.verifier(pg_temp.nb('attend', 1) = 1, 'joueur 2 attend : « joueur 2 t''attend » pour joueur 1');
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  d := rendez_vous(d.id);
  execute 'reset role';
  perform pg_temp.verifier(pg_temp.nb('attend', 1) = 1, 'pas de nouveau rappel toutes les 3 secondes');
  -- Encore 15 minutes : un nouveau rappel est possible.
  update notifications set cree_le = now() - interval '15 minutes';
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  d := rendez_vous(d.id);
  execute 'reset role';
  perform pg_temp.verifier((select count(*) = 1 and bool_and(cree_le > now() - interval '1 minute') from notifications where evenement = 'attend' and joueur = pg_temp.j(1)), 'nouveau rappel après 10 minutes');
  -- Joueur 1 arrive : le match commence, personne d'autre n'est prévenu.
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  d := rendez_vous(d.id);
  execute 'reset role';
  perform pg_temp.verifier(d.phase = 'presentation' and pg_temp.nb('attend', 2) = 0, 'les deux sont là : le match commence, pas de rappel');
end $$;
