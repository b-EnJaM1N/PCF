-- HandSlam — Étape 31 : les divisions (Bronze, Argent, Or, Platine, Diamant) et un classement dans chaque division.
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 30. Peut être relancé sans risque.
--
-- Décisions du porteur du projet :
--  * la division dépend du niveau officiel (duels officiels entre humains ; les bots ne comptent pas) :
--      0 Bronze (moins de 1 100) · 1 Argent (1 100) · 2 Or (1 250) · 3 Platine (1 400) · 4 Diamant (1 550) ;
--  * on monte dès qu'on atteint le seuil ; on ne redescend que 20 points sous le seuil de sa division (pas de yo-yo) ;
--  * le classement d'une division ne montre que les joueurs qui ont au moins 10 duels officiels
--    et qui ont joué un duel officiel depuis 30 jours (les autres gardent leurs points, simplement masqués).

create or replace function public._seuils_divisions() returns int[] language sql immutable as $$ select array[0, 1100, 1250, 1400, 1550] $$;
create or replace function public._marge_division() returns int language sql immutable as $$ select 20 $$;
create or replace function public._duels_min_classement() returns int language sql immutable as $$ select 10 $$;

-- La division d'après les points, sans tenir compte de la division d'avant.
create or replace function public._division_brute(p_points int) returns smallint language sql immutable as $$
  select (max(k) - 1)::smallint from generate_series(1, 5) k where p_points >= (public._seuils_divisions())[k]
$$;
-- La nouvelle division : on monte dès le seuil, on ne descend que sous le seuil moins la marge.
create or replace function public._division(p_avant smallint, p_points int) returns smallint language plpgsql immutable as $$
declare d smallint := coalesce(p_avant, public._division_brute(p_points));
begin
  while d < 4 and p_points >= (public._seuils_divisions())[d + 2] loop d := d + 1; end loop;
  while d > 0 and p_points < (public._seuils_divisions())[d + 1] - public._marge_division() loop d := d - 1; end loop;
  return d;
end $$;

alter table public.classements add column if not exists division smallint;
update public.classements set division = public._division_brute(points) where division is null;

create or replace function public._classement_division() returns trigger language plpgsql as $$
begin
  new.division := public._division(case when tg_op = 'UPDATE' then old.division end, new.points);
  return new;
end $$;
drop trigger if exists classements_division on public.classements;
create trigger classements_division before insert or update of points on public.classements for each row execute function public._classement_division();

-- Le classement d'une division (0 à 4) : rang, joueur, points. Avec ma place à moi, même si je n'y figure pas encore.
create or replace function public.classement_division(p_division int) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare moi public.classements;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if p_division not between 0 and 4 then raise exception 'Division inconnue'; end if;
  select * into moi from classements where joueur = auth.uid();
  return jsonb_build_object(
    'division', p_division,
    'joueurs', coalesce((select jsonb_agg(jsonb_build_object('rang', x.rang, 'id', x.joueur, 'pseudo', x.pseudo, 'numero', x.numero, 'drapeau', x.drapeau,
                         'avatar', x.avatar, 'points', x.points, 'joues', x.joues, 'moi', x.joueur = auth.uid()) order by x.rang)
      from (select c.joueur, p.pseudo, p.numero, p.drapeau, p.avatar, c.points, c.joues,
                   rank() over (order by c.points desc, c.joues desc)::int as rang
            from classements c join profils p on p.id = c.joueur
            where c.division = p_division and c.joues >= _duels_min_classement() and c.maj_le > now() - interval '30 days'
              and not exists (select 1 from bots_en_ligne b where b.joueur = c.joueur)) x
      where x.rang <= 100 or x.joueur = auth.uid()), '[]'::jsonb),
    'moi', case when moi.joueur is null then null else jsonb_build_object('division', moi.division, 'points', moi.points, 'joues', moi.joues,
      'manque', greatest(0, _duels_min_classement() - moi.joues), 'inactif', moi.maj_le <= now() - interval '30 days') end);
end $$;

revoke all on function public._seuils_divisions(), public._marge_division(), public._duels_min_classement(), public._division_brute(int),
  public._division(smallint, int), public._classement_division() from public, anon, authenticated;
revoke all on function public.classement_division(int) from public, anon;
grant execute on function public.classement_division(int) to authenticated;
