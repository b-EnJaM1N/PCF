-- Tests de supabase/etape-28-mises-toutes-tailles.sql : Sit & Go à mise dans toutes les tailles.
\set QUIET on
\echo Tests de la base de données (étape 28 : mises dans toutes les tailles)

insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 6) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'Joueur' || i, 0 from generate_series(1, 6) i;

create or replace function pg_temp.u(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid $$;
create or replace function pg_temp.en_tant_que(uid text) returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', uid, false);
  execute format('set role %I', case when uid = '' then 'anon' else 'authenticated' end);
end $$;
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
create or replace function pg_temp.interdit(sql text, msg text) returns void language plpgsql as $$
begin
  begin execute sql; exception when others then raise notice 'ok : %', msg; return; end;
  raise exception 'ÉCHEC : accepté alors que ça devait être refusé : %', msg;
end $$;
create or replace function pg_temp.solde(i int) returns int language sql security definer as $$ select coalesce((select solde from public.jetons where joueur = pg_temp.u(i)), 1000) $$;

do $$
declare r jsonb; t public.tournois; s jsonb;
begin
  -- 1. Une salle de 16 à 50 jetons : acceptée, listée à part.
  perform pg_temp.en_tant_que(pg_temp.u(1)::text);
  r := rejoindre_sit_and_go(16, 50);
  perform pg_temp.verifier((r ->> 'taille')::int = 16 and (r ->> 'mise')::int = 50, 'salle de 16 à 50 jetons');
  s := salles_sit_and_go();
  perform pg_temp.verifier((select (x ->> 'inscrits')::int from jsonb_array_elements(s -> 'salles_mises') x where (x ->> 'taille')::int = 16 and (x ->> 'mise')::int = 50) = 1
    and (select (x ->> 'inscrits')::int from jsonb_array_elements(s -> 'salles_mises') x where (x ->> 'taille')::int = 8 and (x ->> 'mise')::int = 50) = 0,
    'la liste donne les inscrits de chaque taille à chaque mise');
  perform pg_temp.verifier(jsonb_array_length(s -> 'salles_mises') = 25, '5 tailles × 5 mises');
  perform pg_temp.interdit('select rejoindre_sit_and_go(12, 50)', 'taille de 12 refusée');
  execute 'reset role';
  perform pg_temp.verifier(pg_temp.solde(1) = 950, 'entrée de 50 payée');

  -- 2. Seul depuis 3 minutes : 15 bots faibles complètent la salle ; le joueur gagne : 65 % de 16 × 50 − 10 % = 468.
  select * into t from tournois where id = (r ->> 'id')::uuid;
  update inscrits_tournoi set inscrit_le = now() - interval '3 minutes' where tournoi_id = t.id;
  perform _veille_tournois();
  select * into t from tournois where id = t.id;
  perform pg_temp.verifier(t.phase = 'en_cours' and (select count(*) from inscrits_tournoi where tournoi_id = t.id) = 16, 'la salle de 16 démarre avec 15 bots');
  delete from duels where tournoi_id = t.id;
  update matchs_tournoi set vainqueur = coalesce(j0, j1), fin = 'score' where tournoi_id = t.id;
  update tournois set phase = 'termine', vainqueur = pg_temp.u(1), fini_le = now() where id = t.id;
  perform pg_temp.verifier(pg_temp.solde(1) = 950 + 468, format('le vainqueur touche 468 (solde %s)', pg_temp.solde(1)));
  perform pg_temp.verifier(not exists (select 1 from mouvements_jetons m join bots_en_ligne b on b.joueur = m.joueur), 'les bots ne gagnent jamais de jetons');
end $$;
