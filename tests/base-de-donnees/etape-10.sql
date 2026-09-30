-- Tests de supabase/etape-10-moderation.sql : signalements, retrait automatique d'un pseudo, ping.
\set QUIET on
\echo Tests de la base de données (étape 10 : signalements)

insert into auth.users select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'j' || i || '@x.fr' from generate_series(1, 5) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'Joueur' || i, 0 from generate_series(1, 4) i;
insert into profils (id, pseudo, numero) values ('00000000-0000-0000-0000-000000000005', 'Grossier', 0);

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
declare r text;
begin
  perform pg_temp.en_tant_que(pg_temp.j(1)::text);
  r := signaler_joueur(pg_temp.j(5), 'pseudo', 'insulte');
  perform pg_temp.verifier(r = 'envoye', 'signalement envoyé');
  perform pg_temp.verifier(signaler_joueur(pg_temp.j(5), 'pseudo') = 'deja', 'une seule fois par motif');
  perform pg_temp.verifier(signaler_joueur(pg_temp.j(5), 'comportement') = 'envoye', 'un autre motif, c''est permis');
  perform pg_temp.interdit(format('select signaler_joueur(%L, ''pseudo'')', pg_temp.j(1)), 'on ne se signale pas soi-même');
  perform pg_temp.interdit(format('select signaler_joueur(%L, ''couleur'')', pg_temp.j(5)), 'motif inconnu refusé');
  perform pg_temp.interdit('select * from signalements', 'les signalements ne sont pas lisibles par les joueurs');
  perform pg_temp.interdit('select * from signalements_a_traiter', 'la vue d''administration non plus');
  perform pg_temp.interdit(format('select moderer_pseudo(%L)', pg_temp.j(5)), 'un joueur ne peut pas modérer');

  perform pg_temp.en_tant_que(pg_temp.j(2)::text); perform signaler_joueur(pg_temp.j(5), 'pseudo');
  execute 'reset role';
  perform pg_temp.verifier((select pseudo from profils where id = pg_temp.j(5)) = 'Grossier', 'deux signalements : le pseudo reste');
  perform pg_temp.en_tant_que(pg_temp.j(3)::text); perform signaler_joueur(pg_temp.j(5), 'pseudo');
  execute 'reset role';
  perform pg_temp.verifier((select pseudo from profils where id = pg_temp.j(5)) = 'Joueur', 'trois joueurs : le pseudo est retiré');
  perform pg_temp.verifier(exists (select 1 from pseudos_interdits where pseudo_min = 'grossier'), 'le pseudo est interdit');
  perform pg_temp.verifier((select count(*) from signalements_a_traiter where motif = 'pseudo') = 0, 'signalements de pseudo traités');
  perform pg_temp.verifier((select count(*) from signalements_a_traiter) = 1, 'le signalement de comportement reste à traiter');

  perform pg_temp.en_tant_que(pg_temp.j(5)::text);
  perform pg_temp.interdit(format('update profils set pseudo = ''GROSSIER'' where id = %L', pg_temp.j(5)), 'impossible de reprendre le pseudo retiré');
  update profils set pseudo = 'Poli' where id = pg_temp.j(5);
  execute 'reset role';
  perform pg_temp.verifier((select pseudo from profils where id = pg_temp.j(5)) = 'Poli', 'un autre pseudo est accepté');
  perform pg_temp.interdit(format('insert into profils (id, pseudo, numero) values (%L, ''grossier'', 0)', pg_temp.j(4)), 'ni à la création d''un compte');

  -- L'administrateur retire un pseudo lui-même.
  perform moderer_pseudo(pg_temp.j(4));
  perform pg_temp.verifier((select pseudo from profils where id = pg_temp.j(4)) = 'Joueur', 'retrait par l''administrateur');

  perform pg_temp.en_tant_que('');
  perform pg_temp.verifier(ping() = 'pong', 'ping accessible sans compte');
  perform pg_temp.interdit(format('select signaler_joueur(%L, ''pseudo'')', pg_temp.j(5)), 'visiteur refusé');
  execute 'reset role';
end $$;
-- Les pseudos interdits ne dépendent pas des comptes : on les efface pour les séries de tests suivantes.
delete from pseudos_interdits;
