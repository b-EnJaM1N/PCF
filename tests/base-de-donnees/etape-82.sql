-- Tests de supabase/etape-82-dossier-complet.sql : le dossier avec ses smashs et le format du match.
\set QUIET on
\echo Tests de la base de données (étape 82 : dossier complet)

insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 2) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'Joueur' || i, 0 from generate_series(1, 2) i;
create or replace function pg_temp.u(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid $$;
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;

-- Joueur 2 est j1 : il smashe au 2e coup (avec la Feuille, point gagné).
insert into duels (j0, j1, points_par_set, sets_gagnants, phase, coups, vainqueur, fin, maj_le) values
  (pg_temp.u(1), pg_temp.u(2), 11, 2, 'termine', '[{"a":0,"b":0,"g":null,"smash":[true,false]},{"a":0,"b":2,"g":1,"smash":[false,true]}]', 1, 'score', now());

do $$
declare r jsonb;
begin
  perform set_config('request.jwt.claim.sub', pg_temp.u(1)::text, false);
  set role authenticated;
  r := dossier_joueur(pg_temp.u(2));
  reset role;
  perform pg_temp.verifier(r->0->0 = '{"b":0,"a":0,"g":null,"p":11,"n":2}'::jsonb, 'le premier coup porte le format, pas de smash pour lui (celui d''en face ne compte pas)');
  perform pg_temp.verifier(r->0->1 = '{"b":2,"a":0,"g":1,"s":true}'::jsonb, 'son smash gagnant, vu de son côté');
end $$;
reset role;
