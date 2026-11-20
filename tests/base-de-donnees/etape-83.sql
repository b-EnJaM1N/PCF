-- Tests de supabase/etape-83-dossier-humains.sql : le dossier sans les matchs contre les bots en ligne.
\set QUIET on
\echo Tests de la base de données (étape 83 : dossier contre de vrais joueurs)

insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 3) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'Joueur' || i, 0 from generate_series(1, 3) i;
create or replace function pg_temp.u(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid $$;
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;

-- Joueur 3 est un bot en ligne. Joueur 1 a joué contre 2 (humain) et contre 3 (bot).
insert into bots_en_ligne (joueur, modele, favori, elo) values (pg_temp.u(3), 'rocky', 0, 850);
insert into duels (j0, j1, points_par_set, sets_gagnants, phase, coups, vainqueur, fin, maj_le) values
  (pg_temp.u(1), pg_temp.u(2), 7, 2, 'termine', '[{"a":0,"b":1,"g":0}]', 0, 'score', now() - interval '1 hour'),
  (pg_temp.u(1), pg_temp.u(3), 7, 2, 'termine', '[{"a":2,"b":1,"g":1}]', 1, 'score', now());

do $$
declare r jsonb;
begin
  perform set_config('request.jwt.claim.sub', pg_temp.u(2)::text, false);
  set role authenticated;
  r := dossier_joueur(pg_temp.u(1));
  perform pg_temp.verifier(jsonb_array_length(r) = 1, 'le dossier d''un joueur : seulement le match contre un vrai joueur');
  r := dossier_joueur(pg_temp.u(3));
  perform pg_temp.verifier(jsonb_array_length(r) = 1, 'le dossier d''un bot en ligne : ses matchs comptent toujours');
  reset role;
end $$;
reset role;
