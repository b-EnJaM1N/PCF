-- Tests de supabase/etape-39-en-ligne.sql : 🟢 en ligne / 🟠 en match, seulement pour les amis et le cercle.
\set QUIET on
\echo Tests de la base de données (étape 39 : en ligne)

insert into auth.users select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'j' || i || '@x.fr' from generate_series(1, 4) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'Joueur' || i, 0 from generate_series(1, 4) i;
-- 1 et 2 sont amis ; 1 et 3 sont dans le même cercle ; 4 est un inconnu.
insert into amities (a, b, demandeur, statut) values ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'amis');

create or replace function pg_temp.j(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-00000000000' || i)::uuid $$;
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
-- Ce que « qui » voit de la présence de « de » (dans la carte, comme dans mes amis ou un cercle).
create or replace function pg_temp.vue(qui int, de int) returns text language plpgsql as $$
declare r text;
begin
  -- (en administrateur, mais vu par « qui » : auth.uid() lit l'identité de la requête)
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', pg_temp.j(qui)::text, false);
  r := _carte(pg_temp.j(de))->>'presence';
  return r;
end $$;

do $$
declare c jsonb;
begin
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  c := creer_cercle('Famille', '{}');
  execute 'reset role';
  insert into membres_cercle (cercle_id, joueur, role) values ((c->>'id')::uuid, pg_temp.j(3), 'membre');

  perform pg_temp.verifier(pg_temp.vue(2, 1) is null, 'pas encore venu : pas de point');
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  perform je_suis_la(false);
  perform pg_temp.verifier(pg_temp.vue(2, 1) = 'ligne', 'un ami voit 🟢 en ligne');
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  perform pg_temp.verifier((select bool_or(x->>'presence' = 'ligne') from jsonb_array_elements(mes_amis()) x), 'dans « mes amis » aussi');
  perform pg_temp.verifier(pg_temp.vue(3, 1) = 'ligne', 'un membre du même cercle aussi');
  perform pg_temp.verifier(pg_temp.vue(4, 1) is null, 'un inconnu ne voit rien');
  perform pg_temp.verifier(pg_temp.vue(1, 1) is null, 'pas de point sur soi-même');
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  perform je_suis_la(true);
  perform pg_temp.verifier(pg_temp.vue(2, 1) = 'match', 'en match : 🟠');
  -- Plus de signe de vie depuis 2 minutes : plus en ligne.
  update presences_joueurs set vu_le = now() - interval '3 minutes' where joueur = pg_temp.j(1);
  perform pg_temp.verifier(pg_temp.vue(2, 1) is null, 'appli fermée depuis 3 minutes : plus de point');
  -- L'option « ne pas montrer ».
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  perform je_suis_la(false);
  perform pg_temp.verifier(ma_presence_visible(), 'montré par défaut');
  perform regler_presence(false);
  perform pg_temp.verifier(not ma_presence_visible(), 'option enregistrée');
  perform pg_temp.verifier(pg_temp.vue(2, 1) is null, 'présence masquée : l''ami ne voit rien');
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  perform regler_presence(true);
  perform pg_temp.verifier(pg_temp.vue(2, 1) = 'ligne', 'présence remontrée');
  -- La table ne se lit pas directement (l'heure exacte reste cachée).
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  perform pg_temp.interdit('select * from presences_joueurs', 'la table des présences n''est pas lisible');
  perform pg_temp.en_tant_que('');
  perform pg_temp.interdit('select je_suis_la(false)', 'un visiteur ne signale rien');
end $$;
