-- Tests de supabase/etape-16-rappel-freeroll.sql : le rappel de 19 h 50 (seulement entre 19 h 45 et 20 h à Paris).
\set QUIET on
\echo Tests de la base de données (étape 16 : rappel du freeroll)

insert into auth.users values ('00000000-0000-0000-0000-000000000001', 'a@x.fr'), ('00000000-0000-0000-0000-000000000002', 'b@x.fr');
insert into profils (id, pseudo, numero) values ('00000000-0000-0000-0000-000000000001', 'Alice', 0), ('00000000-0000-0000-0000-000000000002', 'Bob', 0);

create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;

do $$
declare t public.tournois; j date := _aujourdhui();
begin
  t := _freeroll(j);
  insert into inscrits_tournoi (tournoi_id, joueur) values (t.id, '00000000-0000-0000-0000-000000000001'), (t.id, '00000000-0000-0000-0000-000000000002');
  insert into abonnements_push (endpoint, joueur, p256dh, auth) values ('https://push.exemple/1', '00000000-0000-0000-0000-000000000001', 'k', 'a');
  perform pg_temp.verifier(rappel_freeroll((j + time '18:30') at time zone 'Europe/Paris') = 0, 'à 18 h 30 : pas encore de rappel');
  perform pg_temp.verifier(rappel_freeroll((j + time '19:50') at time zone 'Europe/Paris') = 1, 'à 19 h 50 : l''inscrit abonné est prévenu');
  perform pg_temp.verifier((select count(*) from notifications where evenement = 'freeroll') = 2, 'la notification est notée pour les deux inscrits (le second n''a pas d''appareil abonné)');
  perform pg_temp.verifier(rappel_freeroll((j + time '19:52') at time zone 'Europe/Paris') = 0, 'une seule fois');
  perform pg_temp.verifier(rappel_freeroll((j + time '20:05') at time zone 'Europe/Paris') = 0, 'après 20 h : plus de rappel');
end $$;
