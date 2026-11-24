-- PCF — Étape 89 : le calendrier de l'Avent (24 novembre, idée et choix du porteur du projet ; app/js/avent-logique.js).
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Nécessite les étapes 13 (jetons) et 17 (boutique).
-- Peut être relancé sans risque.
--
-- Du 1er au 24 décembre, une case par jour, ouverte en réussissant le défi du jour (vérifié par l'appli, comme les trophées).
-- Une case ratée se rattrape jusqu'au 31 décembre (en battant son gardien, un bot de Noël), deux rattrapages par jour au plus.
-- Les cadeaux : des jetons, ou un objet de Noël enregistré comme un achat à 0 jeton (il n'est pas en vente à la boutique).

create table if not exists public.avent (
  joueur uuid not null references public.profils (id) on delete cascade,
  annee int not null,
  num int not null check (num between 1 and 24),
  via text not null check (via in ('jour', 'rattrapage')),
  ouverte_le timestamptz not null default now(),
  jour date not null default (now() at time zone 'Europe/Paris')::date,
  primary key (joueur, annee, num)
);
alter table public.avent enable row level security;
revoke all on public.avent from anon, authenticated;

-- Les cadeaux, case par case (les mêmes que l'appli : un test le vérifie).
create or replace function public._cadeau_avent(p_num int) returns text language sql immutable as $$
  select c from (values
    (1, 'gant:pullmoche'), (2, 'jetons:100'), (3, 'gant:pullsapin'), (4, 'poignet:sucreorge'), (5, 'gant:pullneige'), (6, 'jetons:150'),
    (7, 'gant:pullrenne'), (8, 'celebration:neige'), (9, 'gant:pullpere'), (10, 'jetons:200'), (11, 'gant:pullcadeau'), (12, 'fond:nuitnoel'),
    (13, 'gant:pullsucre'), (14, 'jetons:250'), (15, 'gant:pullpingouin'), (16, 'poignee:givree'), (17, 'gant:pullchaussette'), (18, 'poignet:fourrure'),
    (19, 'gant:pullboule'), (20, 'jetons:300'), (21, 'gant:pullpain'), (22, 'cadre:guirlande'), (23, 'gant:pullhandslam'), (24, 'gant:perenoel')
  ) as t (n, c) where n = p_num
$$;

-- Le jour du calendrier : 1 à 31 en décembre, 0 en dehors.
create or replace function public._jour_avent() returns int language sql stable as $$
  select case when extract(month from _aujourdhui()) = 12 then extract(day from _aujourdhui())::int else 0 end
$$;

-- Mon calendrier : le jour, mes cases ouvertes, mes rattrapages d'aujourd'hui, mes objets (achats) et mon solde.
create or replace function public.mon_avent() returns jsonb
language plpgsql security definer set search_path = public as $$
declare a int := extract(year from _aujourdhui())::int;
begin
  if auth.uid() is null then raise exception 'Connecte-toi pour ouvrir le calendrier'; end if;
  return jsonb_build_object(
    'jour', _jour_avent(),
    'cases', coalesce((select jsonb_object_agg(num::text, jsonb_build_object('via', via, 'le', ouverte_le)) from avent where joueur = auth.uid() and annee = a), '{}'::jsonb),
    'rattrapages_du_jour', (select count(*) from avent where joueur = auth.uid() and annee = a and via = 'rattrapage' and jour = _aujourdhui()),
    'achats', coalesce((select jsonb_agg(article order by cree_le) from achats where joueur = auth.uid()), '[]'::jsonb),
    'solde', (_mon_portefeuille()).solde);
end $$;

-- Ouvrir une case : la case du jour (via « jour »), ou une case ratée (via « rattrapage », jusqu'au 31, deux par jour).
create or replace function public.ouvrir_case_avent(p_num int, p_via text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare j int := _jour_avent(); a int := extract(year from _aujourdhui())::int; c text; n int;
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
  if c like 'jetons:%' then
    n := split_part(c, ':', 2)::int;
    perform _crediter(auth.uid(), n, 'avent');
  else
    insert into achats (joueur, article, prix) values (auth.uid(), c, 0) on conflict do nothing;
  end if;
  return mon_avent() || jsonb_build_object('ouverte', p_num, 'cadeau', c);
end $$;

revoke all on function public._cadeau_avent(int), public._jour_avent() from public, anon, authenticated;
revoke all on function public.mon_avent(), public.ouvrir_case_avent(int, text) from public, anon;
grant execute on function public.mon_avent(), public.ouvrir_case_avent(int, text) to authenticated;
