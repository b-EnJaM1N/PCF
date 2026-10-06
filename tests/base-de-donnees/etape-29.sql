-- Tests de supabase/etape-29-echelle-des-bots.sql : une marche de bots par mise.
-- un seul humain suffit ; les bots comptent dans la cagnotte, chacun est payé selon sa vraie place.
\set QUIET on
\echo Tests de la base de données (étape 29 : échelle des bots)

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
declare t public.tournois; k int; m int; lo int; hi int;
  attendu int[][] := array[[50, 850, 1050], [100, 1000, 1200], [200, 1150, 1350], [500, 1300, 1500], [1000, 1450, 99999]];
begin
  perform _assurer_bots(0);
  -- Une salle de 8 par mise, chacune avec un joueur seul depuis 3 minutes : 7 bots du bon niveau.
  for k in 1 .. 5 loop
    m := attendu[k][1]; lo := attendu[k][2]; hi := attendu[k][3];
    t := pg_temp.salle_seul(k, 8, m);
    perform pg_temp.verifier(t.phase = 'en_cours' and (select bool_and(b.elo between lo and hi) and count(*) = 7
      from inscrits_tournoi i join bots_en_ligne b on b.joueur = i.joueur where i.tournoi_id = t.id),
      format('mise de %s : 7 bots entre %s et %s', m, lo, least(hi, 1700)));
    update tournois set phase = 'annule', fini_le = now() where id = t.id;
  end loop;
  -- Plus la mise monte, plus le niveau moyen des bots monte.
  perform pg_temp.verifier((select bool_and(lower(_niveaux_bots_mise(x)) < lower(_niveaux_bots_mise(y)))
    from (values (50, 100), (100, 200), (200, 500), (500, 1000)) v(x, y)), 'chaque mise a des bots plus forts que la précédente');
  perform pg_temp.verifier(_niveaux_bots_mise(0) is null, 'sans mise : n''importe lesquels');

  -- Sans le minuteur du serveur : c'est l'écran Sit & Go du joueur (toutes les 4 s) qui fait venir les bots.
  perform pg_temp.en_tant_que(pg_temp.u(5)::text);
  perform rejoindre_sit_and_go(8, 0);
  execute 'reset role';
  select t2.* into t from tournois t2 join inscrits_tournoi i on i.tournoi_id = t2.id where i.joueur = pg_temp.u(5) and t2.phase = 'inscriptions';
  update inscrits_tournoi set inscrit_le = now() - interval '3 minutes' where tournoi_id = t.id;
  perform pg_temp.en_tant_que(pg_temp.u(5)::text);
  perform presence_sit_and_go();
  perform salles_sit_and_go();
  execute 'reset role';
  select * into t from tournois where id = t.id;
  perform pg_temp.verifier(t.phase = 'en_cours' and (select count(*) from inscrits_tournoi where tournoi_id = t.id) = 8,
    'seul en salle de 8 depuis 3 minutes : l''écran Sit & Go fait venir 7 bots et la salle démarre');
end $$;
