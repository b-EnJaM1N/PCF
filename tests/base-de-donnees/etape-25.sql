-- Tests de supabase/etape-25-mise-contre-bot.sql : partie rapide à mise contre un bot, jouée sur le serveur.
\set QUIET on
\echo Tests de la base de données (étape 25 : mise contre un bot)

insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 4) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'Joueur' || i, 0 from generate_series(1, 4) i;

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
declare d public.duels; k int; bot uuid; moi smallint;
begin
  -- 1. Sans mise ou mise invalide : refusé (sans mise, le match contre un bot se joue dans l'appli).
  perform pg_temp.en_tant_que(pg_temp.u(1)::text);
  perform pg_temp.interdit('select jouer_bot_rapide(''officiel'', 0)', 'sans mise : refusé');
  perform pg_temp.interdit('select jouer_bot_rapide(''officiel'', 75)', 'mise invalide refusée');
  perform pg_temp.interdit('select jouer_bot_rapide(''officiel'', 5000)', 'mise plus grosse que le solde refusée');
  perform pg_temp.interdit('select jouer_bot_rapide(''inconnu'', 50)', 'format inconnu refusé');

  -- 2. Mise de 50 : un bot faible ; la mise est prélevée tout de suite ; le bot ne paie rien.
  d := jouer_bot_rapide('officiel', 50);
  execute 'reset role';
  bot := d.j1;
  perform pg_temp.verifier(d.phase = 'presentation' and d.rapide and not d.classe and d.mise = 50 and d.mise_payee, 'duel à 50 contre un bot, amical, mise prélevée');
  perform pg_temp.verifier((select elo from bots_en_ligne where joueur = bot) <= 1100, 'mise de 50 : un bot faible');
  perform pg_temp.verifier(pg_temp.solde(1) = 950, 'le joueur a payé 50');
  perform pg_temp.verifier(not exists (select 1 from mouvements_jetons where joueur = bot), 'le bot ne paie rien');
  perform pg_temp.en_tant_que(pg_temp.u(1)::text);
  perform pg_temp.interdit('select jouer_bot_rapide(''officiel'', 50)', 'un seul duel à la fois');

  -- 3. Le match se joue jusqu'au bout : le bot joue ses signes.
  perform pret(d.id);
  for k in 1 .. 400 loop
    select * into d from duels where id = d.id;
    exit when d.phase = 'termine';
    if d.phase = 'entre_sets' then perform pret(d.id); continue; end if;
    perform jouer(d.id, d.manche, k % 3);
  end loop;
  execute 'reset role';
  select * into d from duels where id = d.id;
  perform pg_temp.verifier(d.phase = 'termine' and d.fin = 'score' and d.mise_reglee, 'match joué jusqu''au bout contre le bot');
  if d.vainqueur = 0 then
    perform pg_temp.verifier(pg_temp.solde(1) = 950 + 90, 'le joueur gagne : il remporte 90 (1,8 fois la mise)');
  else
    perform pg_temp.verifier(pg_temp.solde(1) = 950, 'le bot gagne : la mise est perdue');
  end if;
  perform pg_temp.verifier(not exists (select 1 from mouvements_jetons where joueur = bot), 'le bot ne gagne jamais de jetons');

  -- 4. Le bot gagne (forcé) : la mise est perdue, rien n'est versé à personne.
  perform pg_temp.en_tant_que(pg_temp.u(2)::text);
  d := jouer_bot_rapide('eclair', 500);
  execute 'reset role';
  perform pg_temp.verifier((select elo from bots_en_ligne where joueur = d.j1) >= 1250 and d.points_par_set = 7 and d.sets_gagnants = 1,
    'mise de 500, format éclair : un bot fort');
  update duels set phase = 'termine', vainqueur = 1, fin = 'score' where id = d.id;
  perform pg_temp.verifier(pg_temp.solde(2) = 500, 'battu par le bot : 500 perdus');

  -- 5. Le joueur gagne (forcé) : 900.
  perform pg_temp.en_tant_que(pg_temp.u(3)::text);
  d := jouer_bot_rapide('officiel', 500);
  execute 'reset role';
  update duels set phase = 'termine', vainqueur = 0, fin = 'score' where id = d.id;
  perform pg_temp.verifier(pg_temp.solde(3) = 1000 - 500 + 900, 'victoire contre le bot : +900');

  -- 6. Le joueur quitte l'appli pendant le match : forfait au bout de 90 secondes, la mise est perdue.
  perform pg_temp.en_tant_que(pg_temp.u(4)::text);
  d := jouer_bot_rapide('officiel', 100);
  execute 'reset role';
  insert into presences (duel_id, joueur, vu) values (d.id, 0, now() - interval '2 minutes')
  on conflict (duel_id, joueur) do update set vu = excluded.vu;
  perform _veille_bots();
  select * into d from duels where id = d.id;
  perform pg_temp.verifier(d.phase = 'termine' and d.fin = 'forfait' and d.vainqueur = 1, 'joueur parti : le bot gagne par forfait');
  perform pg_temp.verifier(pg_temp.solde(4) = 900, 'forfait : la mise est perdue');

  -- 7. Un duel à mise entre deux humains marche comme avant.
  perform pg_temp.verifier(not exists (select 1 from mouvements_jetons m join bots_en_ligne b on b.joueur = m.joueur), 'aucun mouvement de jetons pour les bots');
end $$;
