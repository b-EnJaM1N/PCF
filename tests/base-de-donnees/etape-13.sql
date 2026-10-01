-- Tests de supabase/etape-13-jetons.sql : bienvenue, bonus quotidien en série, renflouement, entraînement.
\set QUIET on
\echo Tests de la base de données (étape 13 : jetons)

insert into auth.users select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'j' || i || '@x.fr' from generate_series(1, 2) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'Joueur' || i, 0 from generate_series(1, 2) i;

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
declare e jsonb; u uuid := '00000000-0000-0000-0000-000000000001';
begin
  perform pg_temp.en_tant_que(u::text);
  e := mes_jetons();
  perform pg_temp.verifier((e->>'solde')::int = 1000, '1 000 jetons de bienvenue');
  e := mes_jetons();
  perform pg_temp.verifier((e->>'solde')::int = 1000, 'la bienvenue n''est donnée qu''une fois');
  perform pg_temp.verifier((e->>'bonus_dispo')::boolean and (e->>'bonus_montant')::int = 50, 'bonus du jour disponible : 50');
  e := prendre_bonus_quotidien();
  perform pg_temp.verifier((e->>'gagne')::int = 50 and (e->>'solde')::int = 1050 and (e->>'serie')::int = 1, 'bonus du 1er jour : +50');
  perform pg_temp.interdit('select prendre_bonus_quotidien()', 'un seul bonus par jour');

  -- On recule d'un jour : la série continue.
  execute 'reset role';
  update jetons set dernier_bonus = _aujourdhui() - 1 where joueur = u;
  perform pg_temp.en_tant_que(u::text);
  e := prendre_bonus_quotidien();
  perform pg_temp.verifier((e->>'gagne')::int = 75 and (e->>'serie')::int = 2, '2e jour d''affilée : +75');
  -- Série de 9 jours : plafond à 200.
  execute 'reset role';
  update jetons set dernier_bonus = _aujourdhui() - 1, serie = 8 where joueur = u;
  perform pg_temp.en_tant_que(u::text);
  perform pg_temp.verifier((prendre_bonus_quotidien()->>'gagne')::int = 200, 'plafond de 200 par jour');
  -- Un jour manqué : la série repart à 1.
  execute 'reset role';
  update jetons set dernier_bonus = _aujourdhui() - 2, serie = 5 where joueur = u;
  perform pg_temp.en_tant_que(u::text);
  e := mes_jetons();
  perform pg_temp.verifier((e->>'serie')::int = 0 and (e->>'bonus_montant')::int = 50, 'série perdue après un jour manqué');

  -- Renflouement.
  perform pg_temp.interdit('select renflouer()', 'pas de renflouement avec plus de 100 jetons');
  execute 'reset role';
  update jetons set solde = 40 where joueur = u;
  perform pg_temp.en_tant_que(u::text);
  e := renflouer();
  perform pg_temp.verifier((e->>'solde')::int = 240 and not (e->>'renflouement_dispo')::boolean, 'renflouement : +200');
  execute 'reset role';
  update jetons set solde = 40 where joueur = u;
  perform pg_temp.en_tant_que(u::text);
  perform pg_temp.interdit('select renflouer()', 'un seul renflouement par jour');

  -- Entraînement : +10 par victoire, 100 par jour.
  for i in 1 .. 12 loop e := gain_entrainement(); end loop;
  perform pg_temp.verifier((e->>'solde')::int = 140 and (e->>'gagne')::int = 0 and (e->>'entrainement_restant')::int = 0, 'entraînement plafonné à 100 par jour');

  -- Personne ne touche aux tables directement.
  perform pg_temp.interdit('update jetons set solde = 999999', 'modifier son solde directement est refusé');
  perform pg_temp.interdit('select * from jetons', 'lire les portefeuilles directement est refusé');
  perform pg_temp.interdit(format('select _crediter(%L, 1000, ''triche'')', u), 'la fonction interne est inaccessible');
  perform pg_temp.en_tant_que('');
  perform pg_temp.interdit('select mes_jetons()', 'un visiteur n''a pas de portefeuille');
  execute 'reset role';
  perform pg_temp.verifier((select count(*) from mouvements_jetons where joueur = u and motif = 'bienvenue') = 1
    and (select count(*) from mouvements_jetons where joueur = u and motif = 'entraînement') = 10, 'chaque mouvement est noté au journal');
end $$;
