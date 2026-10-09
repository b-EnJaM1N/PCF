-- HandSlam — Étape 39 : qui est en ligne (🟢) ou en match (🟠), pour ses amis et les membres de ses cercles.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ».
-- Nécessite les étapes 2 à 38. Peut être relancé sans risque.
--
-- Décision du porteur du projet (10 octobre, choix A) : seulement 🟢 « En ligne » et 🟠 « En match », pas de
-- « vu il y a… » ; option « Ne pas montrer quand je suis en ligne ».
--  * l'appli ouverte (et à l'écran) signale « je suis là » toutes les minutes ; sans signe de vie depuis 2 minutes,
--    on n'est plus en ligne ;
--  * seuls les amis et les membres d'un même cercle voient le point ; l'heure exacte n'est jamais montrée ;
--  * table à part (et pas dans les profils, lisibles par tous les joueurs connectés).

create table if not exists public.presences_joueurs (
  joueur uuid primary key references public.profils (id) on delete cascade,
  vu_le timestamptz,
  en_match boolean not null default false,
  visible boolean not null default true
);
alter table public.presences_joueurs enable row level security;
revoke all on public.presences_joueurs from anon, authenticated;

create or replace function public._fenetre_en_ligne() returns interval language sql immutable as $$ select interval '2 minutes' $$;

-- « Je suis là » (toutes les minutes, appli ouverte) ; p_en_match : je joue un match en ce moment.
create or replace function public.je_suis_la(p_en_match boolean default false) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not exists (select 1 from profils where id = auth.uid()) then return; end if;
  insert into presences_joueurs (joueur, vu_le, en_match) values (auth.uid(), now(), coalesce(p_en_match, false))
  on conflict (joueur) do update set vu_le = now(), en_match = coalesce(p_en_match, false);
end $$;

-- Montrer (ou non) aux autres quand je suis en ligne.
create or replace function public.regler_presence(p_visible boolean) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton compte'; end if;
  insert into presences_joueurs (joueur, visible) values (auth.uid(), coalesce(p_visible, true))
  on conflict (joueur) do update set visible = coalesce(p_visible, true);
  return coalesce(p_visible, true);
end $$;
create or replace function public.ma_presence_visible() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select visible from presences_joueurs where joueur = auth.uid()), true)
$$;

-- 'ligne', 'match' ou null : ce que le joueur connecté peut voir de p_id (ami, ou membre d'un même cercle).
create or replace function public._en_ligne(p_id uuid) returns text
language sql stable security definer set search_path = public as $$
  select case when x.en_match then 'match' else 'ligne' end
  from presences_joueurs x
  where x.joueur = p_id and x.visible and x.vu_le > now() - _fenetre_en_ligne()
    and auth.uid() is not null and auth.uid() <> p_id
    and (exists (select 1 from amities where a = least(auth.uid(), p_id) and b = greatest(auth.uid(), p_id) and statut = 'amis')
         or exists (select 1 from membres_cercle m1 join membres_cercle m2 on m2.cercle_id = m1.cercle_id
                    where m1.joueur = auth.uid() and m2.joueur = p_id))
$$;

-- La carte d'un joueur (remplace la version de l'étape 38) : avec sa présence (pour ses amis et son cercle).
create or replace function public._carte(p_id uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('id', p.id, 'pseudo', p.pseudo, 'numero', p.numero, 'drapeau', p.drapeau, 'avatar', p.avatar,
    'classement', coalesce(c.points, _classement_depart()), 'joues', coalesce(c.joues, 0), 'gagnes', coalesce(c.gagnes, 0),
    'genre', case when p.fiche->>'genre' = 'f' then 'f' else 'm' end,
    'presence', _en_ligne(p.id))
  from profils p left join classements c on c.joueur = p.id where p.id = p_id
$$;

revoke all on function public._fenetre_en_ligne(), public._en_ligne(uuid) from public, anon, authenticated;
revoke all on function public.je_suis_la(boolean), public.regler_presence(boolean), public.ma_presence_visible() from public, anon;
grant execute on function public.je_suis_la(boolean), public.regler_presence(boolean), public.ma_presence_visible() to authenticated;
