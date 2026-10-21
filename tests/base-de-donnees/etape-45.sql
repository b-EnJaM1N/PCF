-- Tests de supabase/etape-45-bots-panaches.sql : sans mise, à 50 et à 100, des bots de tous les niveaux.
\set QUIET on
\echo Tests de la base de données (étape 45 : bots panachés)

insert into auth.users select ('00000000-0000-0000-0045-0000000000' || lpad(i::text, 2, '0'))::uuid, 'p' || i || '@x.fr' from generate_series(1, 3) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0045-0000000000' || lpad(i::text, 2, '0'))::uuid, 'Panache' || i, 0 from generate_series(1, 3) i;
create or replace function pg_temp.u(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0045-0000000000' || lpad(i::text, 2, '0'))::uuid $$;
create or replace function pg_temp.en_tant_que(uid text) returns void language plpgsql as $$
begin execute 'reset role'; perform set_config('request.jwt.claim.sub', uid, false); execute 'set role authenticated'; end $$;
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;

do $$
declare t public.tournois; k int; m int; mises int[] := array[0, 50, 100];
begin
  perform _assurer_bots(0);
  perform pg_temp.verifier(_niveaux_bots_mise(50) is null and _niveaux_bots_mise(100) is null, '50 et 100 : bots panachés');
  perform pg_temp.verifier(lower(_niveaux_bots_mise(200)) = 1150 and lower(_niveaux_bots_mise(1000)) = 1450, '200 à 1 000 : la marche de l''étape 29 ne change pas');
  for k in 1 .. 3 loop
    m := mises[k];
    perform pg_temp.en_tant_que(pg_temp.u(k)::text);
    perform rejoindre_sit_and_go(8, m);
    execute 'reset role';
    select t2.* into t from tournois t2 join inscrits_tournoi x on x.tournoi_id = t2.id where x.joueur = pg_temp.u(k) and t2.phase = 'inscriptions';
    update inscrits_tournoi set inscrit_le = now() - interval '3 minutes' where tournoi_id = t.id;
    perform _veille_tournois();
    -- les 7 bots couvrent les 4 quarts de niveau (débutants, moyens, forts, redoutables)
    perform pg_temp.verifier((
      with q as (select joueur, ntile(4) over (order by elo) quart from bots_en_ligne where actif)
      select count(distinct q.quart) = 4 and count(*) = 7 from inscrits_tournoi i join q on q.joueur = i.joueur where i.tournoi_id = t.id),
      format('salle de 8 à %s jetons : 7 bots de tous les niveaux', m));
    update tournois set phase = 'annule', fini_le = now() where id = t.id;
  end loop;
end $$;
