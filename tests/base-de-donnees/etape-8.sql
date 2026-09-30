-- Tests de supabase/etape-8-calibrage.sql : le niveau bouge deux fois plus vite pendant les 10 premiers duels officiels.
\set QUIET on
\echo Tests de la base de données (étape 8 : calibrage)

insert into auth.users select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'j' || i || '@x.fr' from generate_series(1, 3) i;
insert into profils (id, pseudo, numero) select ('00000000-0000-0000-0000-00000000000' || i)::uuid, 'Joueur' || i, 0 from generate_series(1, 3) i;
-- Joueur 1 : confirmé (20 duels) ; joueurs 2 et 3 : nouveaux.
insert into classements (joueur, points, joues) values ('00000000-0000-0000-0000-000000000001', 1200, 20);

create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
-- Un duel officiel terminé entre g (gagnant, joueur 0) et p, écrit directement (le déclencheur fait le calcul).
create or replace function pg_temp.duel(g int, p int) returns uuid language plpgsql as $$
declare d uuid;
begin
  insert into duels (j0, j1, points_par_set, sets_gagnants, classe, phase, coups)
  values (('00000000-0000-0000-0000-00000000000' || g)::uuid, ('00000000-0000-0000-0000-00000000000' || p)::uuid, 11, 2, true, 'jeu', '[{"a":0,"b":1}]')
  returning id into d;
  update duels set phase = 'termine', vainqueur = 0, fin = 'score' where id = d;
  return d;
end $$;

do $$
declare d uuid; x public.duels;
begin
  -- 1. Un nouveau (en calibrage) bat un confirmé : il gagne 32, le confirmé ne perd que 16.
  d := pg_temp.duel(2, 1); select * into x from duels where id = d;
  perform pg_temp.verifier(x.classement_apres = '{1232,1184}', 'nouveau bat confirmé : +32 pour le nouveau, −16 pour le confirmé');
  -- 2. Deux nouveaux : ±32 chacun (et le total reste le même).
  d := pg_temp.duel(3, 2); select * into x from duels where id = d;
  perform pg_temp.verifier(x.classement_avant = '{1200,1232}' and x.classement_apres[1] - 1200 = 1232 - x.classement_apres[2], 'deux nouveaux : la même variation, doublée, des deux côtés');
  -- 3. Après 10 duels officiels, le calibrage est fini : variations normales.
  update classements set joues = 10 where joueur = '00000000-0000-0000-0000-000000000003';
  d := pg_temp.duel(3, 1); select * into x from duels where id = d;
  perform pg_temp.verifier(x.classement_apres[1] - x.classement_avant[1] = x.classement_avant[2] - x.classement_apres[2], 'après 10 duels : gain et perte identiques');
  perform pg_temp.verifier(x.classement_apres[1] - x.classement_avant[1] < 32, 'après 10 duels : plus de variation doublée');
end $$;
