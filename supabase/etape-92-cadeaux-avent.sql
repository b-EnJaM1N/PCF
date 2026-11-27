-- PCF — Étape 92 : les nouveaux cadeaux du calendrier de l'Avent (27 novembre, demande du porteur du projet).
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Peut être relancé sans risque. Après l'étape 89,
-- et avant le 1er décembre.
--
-- Les 5 cases de jetons deviennent des objets de Noël (breloques, fonds), et 11 cases deviennent doubles (« a+b » : deux cadeaux),
-- avec les autres breloques, fonds et poignets de Noël (app/js/avent-logique.js : les mêmes cadeaux, un test le vérifie).

create or replace function public._cadeau_avent(p_num int) returns text language sql immutable as $$
  select c from (values
    (1, 'gant:pullmoche+bracelet:breloque_sucre'), (2, 'bracelet:breloque_flocon'), (3, 'gant:pullsapin+bracelet:breloque_sapin'), (4, 'poignet:sucreorge'),
    (5, 'gant:pullneige+poignet:jacquard'), (6, 'fond:chuteneige'), (7, 'gant:pullrenne+poignet:rennes'), (8, 'celebration:neige'),
    (9, 'gant:pullpere+bracelet:breloque_cloche'), (10, 'bracelet:breloque_bonhomme'), (11, 'gant:pullcadeau+bracelet:breloque_cadeau'), (12, 'fond:nuitnoel'),
    (13, 'gant:pullsucre+fond:papiercadeau'), (14, 'fond:sapin'), (15, 'gant:pullpingouin'), (16, 'poignee:givree+poignet:houx'),
    (17, 'gant:pullchaussette'), (18, 'poignet:fourrure'), (19, 'gant:pullboule+bracelet:breloque_boule'), (20, 'fond:guirlandes'),
    (21, 'gant:pullpain+poignet:guirlande'), (22, 'cadre:guirlande'), (23, 'gant:pullhandslam'), (24, 'gant:perenoel+bracelet:breloque_etoile')
  ) as t (n, c) where n = p_num
$$;

-- Ouvrir une case : comme à l'étape 89, mais une case peut donner deux cadeaux.
create or replace function public.ouvrir_case_avent(p_num int, p_via text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare j int := _jour_avent(); a int := extract(year from _aujourdhui())::int; c text; x text; n int;
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
  return mon_avent() || jsonb_build_object('ouverte', p_num, 'cadeau', c);
end $$;

revoke all on function public._cadeau_avent(int) from public, anon, authenticated;
revoke all on function public.ouvrir_case_avent(int, text) from public, anon;
grant execute on function public.ouvrir_case_avent(int, text) to authenticated;
