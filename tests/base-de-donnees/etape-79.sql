-- Tests de supabase/etape-79-notifications-amis-cercles.sql : les notifications des amis et des invitations dans un cercle.
\set QUIET on
\echo Tests de la base de données (étape 79 : notifications des amis et des cercles)
insert into auth.users select ('00000000-0000-0000-0000-0000000079' || lpad(i::text, 2, '0'))::uuid, 'n' || i || '@x.fr' from generate_series(1, 4) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000079' || lpad(i::text, 2, '0'))::uuid, 'Notif' || i, 0 from generate_series(1, 4) i;
create or replace function pg_temp.en_tant_que(uid text) returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claim.sub', uid, false);
  execute format('set role %I', case when uid = '' then 'anon' else 'authenticated' end);
end $$;
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
create or replace function pg_temp.j(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-0000000079' || lpad(i::text, 2, '0'))::uuid $$;
create or replace function pg_temp.notifs(j uuid, ev text) returns bigint language sql as $$ select count(*) from notifications where joueur = j and evenement = ev $$;
create temp table t (cle text primary key, val text);
grant all on t to public;

-- 1. Les amis
select pg_temp.en_tant_que(pg_temp.j(1)::text);
select demander_ami(pg_temp.j(2));
reset role;
select pg_temp.verifier(pg_temp.notifs(pg_temp.j(2), 'ami_demande') = 1, 'N2 est prévenu de la demande d''ami de N1');
select pg_temp.verifier((select de from notifications where joueur = pg_temp.j(2) and evenement = 'ami_demande') = pg_temp.j(1), 'la notification dit qui demande');
select pg_temp.verifier(pg_temp.notifs(pg_temp.j(1), 'ami_demande') = 0, 'pas le demandeur');
select pg_temp.en_tant_que(pg_temp.j(2)::text);
select repondre_ami(pg_temp.j(1), true);
reset role;
select pg_temp.verifier(pg_temp.notifs(pg_temp.j(1), 'ami_accepte') = 1, 'N1 est prévenu que N2 a accepté');
-- retirer puis redemander : pas de seconde notification
select pg_temp.en_tant_que(pg_temp.j(1)::text);
select retirer_ami(pg_temp.j(2));
select demander_ami(pg_temp.j(2));
reset role;
select pg_temp.verifier(pg_temp.notifs(pg_temp.j(2), 'ami_demande') = 1, 'redemander : pas de seconde notification');
-- les deux se demandent : on devient amis, le premier demandeur est prévenu
select pg_temp.en_tant_que(pg_temp.j(3)::text);
select demander_ami(pg_temp.j(4));
select pg_temp.en_tant_que(pg_temp.j(4)::text);
select demander_ami(pg_temp.j(3));
reset role;
select pg_temp.verifier(pg_temp.notifs(pg_temp.j(3), 'ami_accepte') = 1, 'demandes croisées : le premier demandeur est prévenu');

-- 2. Les cercles
select pg_temp.en_tant_que(pg_temp.j(1)::text);
insert into t select 'cercle', creer_cercle('Le Club Notif', '{}')->>'id';
select inviter_cercle((select val::uuid from t where cle = 'cercle'), pg_temp.j(3));
reset role;
select pg_temp.verifier(pg_temp.notifs(pg_temp.j(3), 'invitation_cercle') = 1, 'N3 est prévenu de l''invitation dans le cercle');
select pg_temp.verifier((select cercle_id from notifications where joueur = pg_temp.j(3) and evenement = 'invitation_cercle') = (select val::uuid from t where cle = 'cercle'), 'avec le cercle');
select pg_temp.en_tant_que(pg_temp.j(3)::text);
select repondre_cercle((select val::uuid from t where cle = 'cercle'), false);
select pg_temp.en_tant_que(pg_temp.j(1)::text);
select inviter_cercle((select val::uuid from t where cle = 'cercle'), pg_temp.j(3));
reset role;
select pg_temp.verifier(pg_temp.notifs(pg_temp.j(3), 'invitation_cercle') = 1, 'réinvité après un refus : pas de seconde notification');
