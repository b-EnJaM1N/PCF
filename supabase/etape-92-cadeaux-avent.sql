-- PCF — Étape 92 : les nouveaux cadeaux du calendrier de l'Avent (27 novembre, demande du porteur du projet).
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Peut être relancé sans risque. Après l'étape 89,
-- et avant le 1er décembre.
--
-- Les 5 cases de jetons deviennent des objets de Noël (breloques, fonds). Et des cadeaux d'assiduité : la case du jour ouverte
-- le jour même 3, 5, 7… 23 jours de suite (un rattrapage ne compte pas) : une breloque, un fond ou un poignet de Noël en plus.
-- (app/js/avent-logique.js : CADEAUX et SERIES, les mêmes cadeaux, un test le vérifie.)

create or replace function public._cadeau_avent(p_num int) returns text language sql immutable as $$
  select c from (values
    (1, 'gant:pullmoche'), (2, 'bracelet:breloque_flocon'), (3, 'gant:pullsapin'), (4, 'poignet:sucreorge'),
    (5, 'gant:pullneige'), (6, 'fond:chuteneige'), (7, 'gant:pullrenne'), (8, 'celebration:neige'),
    (9, 'gant:pullpere'), (10, 'bracelet:breloque_bonhomme'), (11, 'gant:pullcadeau'), (12, 'fond:nuitnoel'),
    (13, 'gant:pullsucre'), (14, 'fond:sapin'), (15, 'gant:pullpingouin'), (16, 'poignee:givree'),
    (17, 'gant:pullchaussette'), (18, 'poignet:fourrure'), (19, 'gant:pullboule'), (20, 'fond:guirlandes'),
    (21, 'gant:pullpain'), (22, 'cadre:guirlande'), (23, 'gant:pullhandslam'), (24, 'gant:perenoel')
  ) as t (n, c) where n = p_num
$$;

-- Les cadeaux d'assiduité : la série (en jours de suite) → le cadeau, ou null.
create or replace function public._prime_avent(p_serie int) returns text language sql immutable as $$
  select c from (values
    (3, 'bracelet:breloque_sucre'), (5, 'poignet:jacquard'), (7, 'bracelet:breloque_sapin'), (9, 'poignet:houx'),
    (11, 'bracelet:breloque_cloche'), (13, 'poignet:rennes'), (15, 'bracelet:breloque_cadeau'), (17, 'fond:papiercadeau'),
    (19, 'bracelet:breloque_boule'), (21, 'poignet:guirlande'), (23, 'bracelet:breloque_etoile')
  ) as t (n, c) where n = p_serie
$$;

-- Ouvrir une case : comme à l'étape 89 (une case pourrait donner deux cadeaux, « a+b ») ; la case du jour compte la série et donne
-- le cadeau d'assiduité d'un palier atteint (une fois : on conflict do nothing).
create or replace function public.ouvrir_case_avent(p_num int, p_via text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare j int := _jour_avent(); a int := extract(year from _aujourdhui())::int; c text; x text; n int; s int := 0; b text;
begin
  if auth.uid() is null then raise exception 'Connecte-toi pour ouvrir le calendrier'; end if;
  perform _mon_portefeuille();
  if j = 0 then raise exception 'Le calendrier de l''Avent est fermé'; end if;
  if p_num is null or p_num < 1 or p_num > 24 then raise exception 'Case inconnue'; end if;
  if p_num > j then raise exception 'Cette case ne s''ouvre pas encore'; end if;
  if p_via = 'jour' then
    if p_num <> j then raise exception 'Ce n''est pas la case du jour'; end if;
  elsif p_via = 'rattrapage' then
    if p_num = j then raise exception 'C''est la case du jour'; end if;
    if (select count(*) from avent where joueur = auth.uid() and annee = a and via = 'rattrapage' and jour = _aujourdhui()) >= 2 then
      raise exception 'Deux rattrapages par jour au plus : reviens demain';
    end if;
  else raise exception 'Ouverture inconnue';
  end if;
  if exists (select 1 from avent where joueur = auth.uid() and annee = a and num = p_num) then raise exception 'Case déjà ouverte'; end if;
  insert into avent (joueur, annee, num, via, jour) values (auth.uid(), a, p_num, p_via, _aujourdhui());
  c := _cadeau_avent(p_num);
  foreach x in array string_to_array(c, '+') loop
    if x like 'jetons:%' then
      n := split_part(x, ':', 2)::int;
      perform _crediter(auth.uid(), n, 'avent');
    else
      insert into achats (joueur, article, prix) values (auth.uid(), x, 0) on conflict do nothing;
    end if;
  end loop;
  if p_via = 'jour' then
    while exists (select 1 from avent where joueur = auth.uid() and annee = a and num = p_num - s and via = 'jour') loop s := s + 1; end loop;
    b := _prime_avent(s);
    if b is not null then insert into achats (joueur, article, prix) values (auth.uid(), b, 0) on conflict do nothing; end if;
  end if;
  return mon_avent() || jsonb_build_object('ouverte', p_num, 'cadeau', c, 'serie', s, 'prime', b);
end $$;

revoke all on function public._cadeau_avent(int), public._prime_avent(int) from public, anon, authenticated;
revoke all on function public.ouvrir_case_avent(int, text) from public, anon;
grant execute on function public.ouvrir_case_avent(int, text) to authenticated;
