-- Tests de supabase/etape-41-tournois-automatiques.sql : un inscrit ne lance ni n'annule un tournoi automatique.
\set QUIET on
\echo Tests de la base de données (étape 41 : tournois automatiques)

insert into auth.users select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'j' || i || '@x.fr' from generate_series(1, 4) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'Joueur' || i, 0 from generate_series(1, 4) i;

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

do $$
declare t public.tournois; p public.tournois; k int; c uuid; code text;
begin
  -- Le Grand Chelem de dimanche prochain, avec 3 inscrits.
  t := _tournoi_programme('grand_chelem', _aujourdhui() + 7);
  for k in 1 .. 3 loop insert into inscrits_tournoi (tournoi_id, joueur, vu) values (t.id, pg_temp.j(k), now()); end loop;
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  perform pg_temp.verifier(not (voir_tournoi(t.id)->>'organise')::boolean, 'un inscrit n''est pas l''organisateur du Grand Chelem');
  perform pg_temp.interdit(format('select annuler_tournoi(%L)', t.id), 'un inscrit ne peut pas annuler le Grand Chelem');
  perform pg_temp.interdit(format('select lancer_tournoi(%L)', t.id), 'un inscrit ne peut pas lancer le Grand Chelem avant l''heure');
  perform pg_temp.en_tant_que(pg_temp.j(4)::text);
  perform pg_temp.interdit(format('select annuler_tournoi(%L)', t.id), 'un non-inscrit non plus');
  execute 'reset role';
  select * into t from tournois where id = t.id;
  perform pg_temp.verifier(t.phase = 'inscriptions', 'le Grand Chelem attend toujours son heure');

  -- Un tournoi entre amis dont le créateur a disparu : un inscrit peut toujours le lancer ou l'annuler.
  insert into tournois (nom, createur, points_par_set, sets_gagnants, duree_tour) values ('Entre amis', null, 11, 2, interval '1 day') returning * into p;
  for k in 1 .. 3 loop insert into inscrits_tournoi (tournoi_id, joueur) values (p.id, pg_temp.j(k)); end loop;
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  perform pg_temp.verifier((voir_tournoi(p.id)->>'organise')::boolean, 'tournoi entre amis sans créateur : un inscrit l''organise');
  perform pg_temp.en_tant_que(pg_temp.j(4)::text);
  perform pg_temp.interdit(format('select annuler_tournoi(%L)', p.id), 'un non-inscrit ne peut pas l''annuler');
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  perform annuler_tournoi(p.id);
  execute 'reset role';
  perform pg_temp.verifier((select phase from tournois where id = p.id) = 'annule', 'un inscrit l''a annulé');

  -- Un championnat dont le créateur a disparu : un simple membre du cercle n'efface pas l'enjeu, n'arrête pas la série.
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  c := (creer_cercle('Famille', '{}')->>'id')::uuid;
  execute 'reset role';
  select cercles.code into code from cercles where id = c;
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  perform rejoindre_cercle(code);
  execute 'reset role';
  insert into tournois (nom, cercle_id, createur, points_par_set, sets_gagnants, duree_tour, mode, enjeu, hebdo, serie)
  values ('Ligue', c, null, 11, 2, interval '7 days', 'championnat', 'Le perdant fait la vaisselle', true, gen_random_uuid()) returning * into p;
  perform pg_temp.en_tant_que(pg_temp.j(2)::text);
  perform pg_temp.interdit(format('select effacer_enjeu_tournoi(%L)', p.id), 'un simple membre n''efface pas l''enjeu');
  perform pg_temp.interdit(format('select arreter_serie(%L)', p.id), 'un simple membre n''arrête pas la série');
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  perform effacer_enjeu_tournoi(p.id);
  perform arreter_serie(p.id);
  execute 'reset role';
  perform pg_temp.verifier((select enjeu is null and not hebdo from tournois where id = p.id), 'le responsable du cercle, lui, peut');
end $$;
