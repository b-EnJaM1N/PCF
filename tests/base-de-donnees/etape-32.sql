-- Tests de supabase/etape-32-dossier.sql : le dossier de l'adversaire (coups de ses derniers matchs, vus de son côté).
\set QUIET on
\echo Tests de la base de données (étape 32 : dossier de l adversaire)

insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 3) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'Joueur' || i, 0 from generate_series(1, 3) i;

create or replace function pg_temp.u(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid $$;
create or replace function pg_temp.en_tant_que(uid text) returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', uid, false);
  execute format('set role %I', case when uid = '' then 'anon' else 'authenticated' end);
end $$;
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;

-- Joueur 1 contre joueur 2 (1 est j0) : il joue Pierre puis Feuille ; joueur 2 Ciseaux puis Feuille.
-- Joueur 3 contre joueur 1 (1 est j1) : il joue Ciseaux ; joueur 3 Pierre.
insert into duels (j0, j1, points_par_set, sets_gagnants, phase, coups, vainqueur, fin, maj_le) values
  (pg_temp.u(1), pg_temp.u(2), 7, 2, 'termine', '[{"a":0,"b":1,"g":0},{"a":2,"b":2,"g":null}]', 0, 'score', now() - interval '1 hour'),
  (pg_temp.u(3), pg_temp.u(1), 7, 2, 'termine', '[{"a":0,"b":1,"g":0}]', 0, 'score', now()),
  (pg_temp.u(1), pg_temp.u(2), 7, 2, 'jeu', '[{"a":1,"b":1,"g":null}]', null, null, now()),
  (pg_temp.u(2), pg_temp.u(3), 7, 2, 'termine', '[{"a":2,"b":0,"g":1}]', 1, 'score', now());

do $$
declare r jsonb;
begin
  perform pg_temp.en_tant_que('');
  begin
    perform dossier_joueur(pg_temp.u(1));
    perform pg_temp.verifier(false, 'sans compte : refusé');
  exception when others then
    perform pg_temp.verifier(sqlerrm <> 'ÉCHEC : sans compte : refusé', 'sans compte : refusé');
  end;

  perform pg_temp.en_tant_que(pg_temp.u(2)::text);
  r := dossier_joueur(pg_temp.u(1));
  perform pg_temp.verifier(jsonb_array_length(r) = 2, 'deux matchs terminés (le duel en cours et le match des autres ne comptent pas)');
  perform pg_temp.verifier(r->0 = '[{"b":1,"a":0,"g":0}]'::jsonb, 'le plus récent d''abord, vu de son côté (il était j1 : Ciseaux contre Pierre, point perdu)');
  perform pg_temp.verifier(r->1 = '[{"b":0,"a":1,"g":1},{"b":2,"a":2,"g":null}]'::jsonb, 'quand il était j0 : Pierre contre Ciseaux gagné, puis égalité');
  perform pg_temp.verifier(dossier_joueur(gen_random_uuid()) = '[]'::jsonb, 'joueur inconnu : dossier vide');
end $$;

reset role;
