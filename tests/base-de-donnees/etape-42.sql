-- Tests de supabase/etape-42-salles-sit-and-go.sql : un Sit & Go de 64 n'envoie ni au Grand Chelem ni au freeroll.
\set QUIET on
\echo Tests de la base de données (étape 42 : salles de Sit & Go)

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

do $$
declare gc public.tournois; fr public.tournois; r jsonb;
begin
  -- Le Grand Chelem de dimanche (64 places, 1 000 jetons), où joueur 1 est inscrit, et le freeroll de ce soir (64, sans mise).
  gc := _tournoi_programme('grand_chelem', _aujourdhui() + 7);
  fr := _freeroll(_aujourdhui());
  perform _portefeuille_de(pg_temp.j(1)); perform _portefeuille_de(pg_temp.j(2));
  insert into inscrits_tournoi (tournoi_id, joueur, vu) values (gc.id, pg_temp.j(1), now());
  update jetons set solde = 5000 where joueur = pg_temp.j(1);

  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  r := rejoindre_sit_and_go(64, 1000);
  perform pg_temp.verifier((r->>'id')::uuid <> gc.id and (r->>'taille')::int = 64 and (r->>'mise')::int = 1000,
    'Sit & Go de 64 à 1 000 jetons : une vraie salle, pas le Grand Chelem (plus d''erreur « duplicate key »)');
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  r := rejoindre_sit_and_go(64, 0);
  perform pg_temp.verifier((r->>'id')::uuid <> fr.id, 'Sit & Go de 64 sans mise : pas le freeroll');
  execute 'reset role';
  perform pg_temp.verifier((select count(*) from inscrits_tournoi where tournoi_id = gc.id) = 1
    and not exists (select 1 from inscrits_tournoi where tournoi_id = fr.id), 'ni le Grand Chelem ni le freeroll n''ont reçu d''inscrit en trop');
end $$;
