-- Tests de supabase/etape-76-invitations-tournoi.sql : inviter des membres à un tournoi de cercle.
\set QUIET on
\echo Tests de la base de données (étape 76 : les invitations à un tournoi de cercle)

insert into auth.users select ('00000000-0000-0000-0000-0000000076' || lpad(i::text, 2, '0'))::uuid, 'i' || i || '@x.fr' from generate_series(1, 6) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000076' || lpad(i::text, 2, '0'))::uuid, 'Invite' || i, 0 from generate_series(1, 6) i;

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
create or replace function pg_temp.j(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-0000000076' || lpad(i::text, 2, '0'))::uuid $$;
create temp table t (cle text primary key, val text);
grant all on t to public;
create or replace function pg_temp.v(k text) returns text language sql as $$ select val from t where cle = k $$;

-- Un cercle de 5 (I1 responsable) ; I6 n'en fait pas partie. I1 crée un tournoi du cercle.
select pg_temp.en_tant_que(pg_temp.j(1)::text);
insert into t select 'cercle', creer_cercle('Les Invités', '{}')->>'id';
reset role; insert into t select 'code', code from cercles where id = pg_temp.v('cercle')::uuid;
do $$ begin for i in 2 .. 5 loop perform pg_temp.en_tant_que(pg_temp.j(i)::text); perform rejoindre_cercle(pg_temp.v('code')); end loop; end $$;
select pg_temp.en_tant_que(pg_temp.j(1)::text);
insert into t select 'tournoi', creer_tournoi('Coupe du vendredi', pg_temp.v('cercle')::uuid, 3, 1, 1440)->>'id';
-- I2 s'inscrit tout seul.
select pg_temp.en_tant_que(pg_temp.j(2)::text);
select inscrire_tournoi(pg_temp.v('tournoi')::uuid);

-- 1. Qui peut inviter, et qui
select pg_temp.interdit($$select inviter_tournoi(pg_temp.v('tournoi')::uuid, array[pg_temp.j(3)])$$, 'un membre qui n''a pas créé le tournoi ne peut pas inviter');
select pg_temp.interdit($$select invitables_tournoi(pg_temp.v('tournoi')::uuid)$$, 'ni voir la liste des membres à inviter');
select pg_temp.en_tant_que(pg_temp.j(1)::text);
select pg_temp.verifier(jsonb_array_length(invitables_tournoi(pg_temp.v('tournoi')::uuid)) = 4, 'l''organisateur voit les 4 autres membres');
select pg_temp.verifier((select x->>'etat' from jsonb_array_elements(invitables_tournoi(pg_temp.v('tournoi')::uuid)) x where x->>'pseudo' = 'Invite2') = 'inscrit', 'I2 apparaît comme inscrit');
select pg_temp.interdit($$select inviter_tournoi(pg_temp.v('tournoi')::uuid, array[]::uuid[])$$, 'il faut choisir au moins un membre');
select pg_temp.verifier(inviter_tournoi(pg_temp.v('tournoi')::uuid, array[pg_temp.j(2), pg_temp.j(3), pg_temp.j(4), pg_temp.j(6), pg_temp.j(1)]) = 2,
  '2 invitations : I3 et I4 (I2 déjà inscrit, I6 pas du cercle, l''organisateur lui-même : ignorés)');
select pg_temp.verifier(inviter_tournoi(pg_temp.v('tournoi')::uuid, array[pg_temp.j(3)]) = 0, 'réinviter quelqu''un qui n''a pas encore répondu ne change rien');
reset role;
select pg_temp.verifier((select count(*) from notifications where evenement = 'invitation' and tournoi_id = pg_temp.v('tournoi')::uuid) = 2, 'une notification par invité');
select pg_temp.verifier((select bool_and(de = pg_temp.j(1)) from notifications where evenement = 'invitation' and tournoi_id = pg_temp.v('tournoi')::uuid), 'la notification dit qui invite');
select pg_temp.verifier((select count(*) from inscrits_tournoi where tournoi_id = pg_temp.v('tournoi')::uuid) = 2, 'personne n''est inscrit d''office (I1 et I2 seulement)');

-- 2. L'invité répond
select pg_temp.en_tant_que(pg_temp.j(3)::text);
select pg_temp.verifier(jsonb_array_length(mes_invitations()) = 1, 'I3 voit son invitation');
select pg_temp.verifier(mes_invitations()->0->>'nom' = 'Coupe du vendredi' and mes_invitations()->0->'de'->>'pseudo' = 'Invite1'
  and mes_invitations()->0->>'cercle_nom' = 'Les Invités', 'avec le tournoi, le cercle et qui l''invite');
select inscrire_tournoi(pg_temp.v('tournoi')::uuid);
select pg_temp.verifier(jsonb_array_length(mes_invitations()) = 0, 'une fois inscrit, l''invitation disparaît');
select pg_temp.en_tant_que(pg_temp.j(4)::text);
select refuser_invitation(pg_temp.v('tournoi')::uuid);
select pg_temp.verifier(jsonb_array_length(mes_invitations()) = 0, '« Non merci » : l''invitation disparaît');
reset role;
select pg_temp.verifier(not exists (select 1 from inscrits_tournoi where tournoi_id = pg_temp.v('tournoi')::uuid and joueur = pg_temp.j(4)), 'et I4 n''est pas inscrit');
select pg_temp.en_tant_que(pg_temp.j(5)::text);
select pg_temp.verifier(jsonb_array_length(mes_invitations()) = 0, 'I5, pas invité, ne voit rien');

-- 3. L'organisateur voit les réponses, et peut réinviter
select pg_temp.en_tant_que(pg_temp.j(1)::text);
select pg_temp.verifier((select jsonb_object_agg(x->>'pseudo', coalesce(x->>'etat', '-')) from jsonb_array_elements(invitables_tournoi(pg_temp.v('tournoi')::uuid)) x)
  = '{"Invite2": "inscrit", "Invite3": "inscrit", "Invite4": "refuse", "Invite5": "-"}'::jsonb, 'inscrit, inscrit, refusé, pas invité');
select pg_temp.verifier(inviter_tournoi(pg_temp.v('tournoi')::uuid, array[pg_temp.j(4)]) = 1, 'un « Non merci » peut être réinvité');
reset role;
select pg_temp.verifier((select count(*) from notifications where evenement = 'invitation' and joueur = pg_temp.j(4)) = 1, 'sans seconde notification');
select pg_temp.en_tant_que(pg_temp.j(4)::text);
select pg_temp.verifier(jsonb_array_length(mes_invitations()) = 1, 'I4 revoit l''invitation');

-- 4. Tournoi lancé ou hors cercle : plus d'invitation
select pg_temp.en_tant_que(pg_temp.j(1)::text);
select lancer_tournoi(pg_temp.v('tournoi')::uuid);
select pg_temp.interdit($$select inviter_tournoi(pg_temp.v('tournoi')::uuid, array[pg_temp.j(5)])$$, 'tournoi lancé : on n''invite plus');
select pg_temp.en_tant_que(pg_temp.j(4)::text);
select pg_temp.verifier(jsonb_array_length(mes_invitations()) = 0, 'tournoi lancé : l''invitation disparaît');
select pg_temp.en_tant_que(pg_temp.j(1)::text);
insert into t select 'prive', creer_tournoi('Entre potes', null, 3, 1, 1440)->>'id';
select pg_temp.interdit($$select inviter_tournoi(pg_temp.v('prive')::uuid, array[pg_temp.j(2)])$$, 'un tournoi hors cercle se partage par lien');
select pg_temp.en_tant_que('');
select pg_temp.interdit($$select mes_invitations()$$, 'un visiteur n''a pas accès');
reset role;
