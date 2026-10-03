-- Tests de supabase/etape-19-dotations.sql : la grille façon poker (environ 10 à 15 % des joueurs payés).
\set QUIET on
\echo Tests de la base de données (étape 19 : dotations)

insert into auth.users select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'j' || i || '@x.fr' from generate_series(1, 30) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid, 'Joueur' || i, 0 from generate_series(1, 30) i;

create or replace function pg_temp.u(i int) returns uuid language sql as $$ select ('00000000-0000-0000-0000-0000000000' || lpad(i::text, 2, '0'))::uuid $$;
create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
create or replace function pg_temp.solde(i int) returns int language sql security definer as $$ select coalesce((select solde from public.jetons where joueur = pg_temp.u(i)), 1000) $$;

do $$
declare t public.tournois; k int; somme int := 0; g int[];
begin
  -- Places payées : 2 jusqu'à 26 joueurs, 4 de 27 à 53, 8 de 54 à 106… au plus 64.
  perform pg_temp.verifier(_places_payees(4) = 2 and _places_payees(26) = 2 and _places_payees(27) = 4 and _places_payees(53) = 4
    and _places_payees(54) = 8 and _places_payees(107) = 16 and _places_payees(214) = 32 and _places_payees(427) = 64 and _places_payees(5000) = 64,
    'places payées : 10 à 15 % des joueurs, en paliers');
  -- Chaque grille distribue toute la cagnotte (100 %).
  foreach k in array array[2, 4, 8, 16, 32, 64] loop
    g := _grille(k); somme := g[1];
    for i in 2 .. array_length(g, 1) loop somme := somme + g[i] * (case when i = 2 then 1 else 2 ^ (i - 2) end)::int; end loop;
    perform pg_temp.verifier(somme = 10000, format('grille de %s places : 100 %% de la cagnotte', k));
  end loop;

  -- Tournoi programmé de 30 joueurs (Midi, 100 jetons) + 2 bots : cagnotte 2 880 (étape 24 : les bots comptent), 4 payés : 1 440, 720, 360 et 360.
  t := _tournoi_programme('midi', _aujourdhui() - 1);
  for k in 1 .. 30 loop perform _portefeuille_de(pg_temp.u(k)); insert into inscrits_tournoi (tournoi_id, joueur, vu) values (t.id, pg_temp.u(k), t.depart - interval '10 seconds'); end loop;
  perform _lancer_programme(t.id);
  select * into t from tournois where id = t.id;
  perform pg_temp.verifier(t.taille = 32 and t.nb_tours = 5 and _cagnotte_programme(t) = 2880, '30 joueurs + 2 bots : tableau de 32, cagnotte 2 880');
  delete from duels where tournoi_id = t.id;
  delete from matchs_tournoi where tournoi_id = t.id;
  insert into matchs_tournoi (tournoi_id, tour, position, j0, j1, vainqueur, fin) values
    (t.id, 3, 1, pg_temp.u(1), pg_temp.u(5), pg_temp.u(1), 'score'),
    (t.id, 4, 1, pg_temp.u(1), pg_temp.u(4), pg_temp.u(1), 'score'),
    (t.id, 4, 2, pg_temp.u(2), pg_temp.u(3), pg_temp.u(2), 'score'),
    (t.id, 5, 1, pg_temp.u(1), pg_temp.u(2), pg_temp.u(1), 'score');
  update tournois set phase = 'termine', vainqueur = pg_temp.u(1), fini_le = now() where id = t.id;
  perform pg_temp.verifier(pg_temp.solde(1) = 2340 and pg_temp.solde(2) = 1620 and pg_temp.solde(3) = 1260 and pg_temp.solde(4) = 1260,
    '4 payés : 1 440, 720, 360, 360');
  perform pg_temp.verifier(pg_temp.solde(5) = 900, 'le quart de finaliste n''est pas payé (30 joueurs)');
  perform pg_temp.verifier((select count(*) from mouvements_jetons where motif = 'tournoi : demi-finale') = 2, 'motif « tournoi : demi-finale »');
end $$;
