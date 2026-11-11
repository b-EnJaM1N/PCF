-- HandSlam — Étape 65 : le fil d'actualité du cercle.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Peut être relancé sans risque.
--
-- 11 novembre (idée et choix du porteur du projet) : pas de chat (modération), mais un fil qui fait vivre le cercle sans aucun
-- texte libre :
--   - les résultats des duels entre membres arrivent tout seuls ;
--   - à la fin d'un duel, un des deux joueurs peut publier « La Une » du match dans le fil : on ne garde que de quoi la refaire
--     (de quel côté elle est racontée, un nombre pour le choix du titre, l'identifiant de la phrase des commentateurs) ; chaque
--     téléphone la redessine à partir des coups du duel ;
--   - des réactions (👏 🔥 😂 😱), une par joueur et par résultat ;
--   - les nouveaux membres (les champions et les séries se calculent dans l'appli).
-- Seuls les membres du cercle voient son fil. Les coups et l'enjeu d'un duel n'y apparaissent que si un des deux joueurs a publié
-- sa Une.

create table if not exists public.unes_publiees (
  duel_id uuid primary key references public.duels (id) on delete cascade,
  par smallint not null check (par in (0, 1)),                       -- la Une racontée du côté du joueur 0 ou du joueur 1 du duel
  graine int not null default 0 check (graine between 0 and 9999),   -- pour refaire le même titre partout
  citation text check (citation ~ '^[a-z0-9_]{1,80}$'),              -- l'identifiant d'une réplique enregistrée (jamais un texte)
  cree_le timestamptz not null default now()
);
create table if not exists public.reactions_fil (
  duel_id uuid not null references public.duels (id) on delete cascade,
  joueur uuid not null references public.profils (id) on delete cascade,
  emoji text not null check (emoji in ('bravo', 'feu', 'rire', 'choc')),
  cree_le timestamptz not null default now(),
  primary key (duel_id, joueur)
);
alter table public.unes_publiees enable row level security;   -- aucune règle : on passe par les fonctions ci-dessous
alter table public.reactions_fil enable row level security;
revoke all on public.unes_publiees, public.reactions_fil from anon, authenticated;

-- Un duel terminé entre deux membres du cercle, joué depuis la création du cercle (comme le classement du cercle).
create or replace function public._duel_du_cercle(p_cercle uuid, p_duel uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from duels d join cercles c on c.id = p_cercle
    where d.id = p_duel and d.phase = 'termine' and d.vainqueur is not null and d.cree_le >= c.cree_le
      and d.j0 in (select joueur from membres_cercle where cercle_id = p_cercle)
      and d.j1 in (select joueur from membres_cercle where cercle_id = p_cercle))
$$;

-- Le fil : les 40 derniers duels entre membres (60 derniers jours) et les arrivées des 60 derniers jours.
create or replace function public.fil_cercle(p_id uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare c public.cercles;
begin
  if _role(p_id) is null then raise exception 'Tu ne fais pas partie de ce cercle'; end if;
  select * into c from cercles where id = p_id;
  return jsonb_build_object(
    'duels', coalesce((select jsonb_agg(t.x order by t.quand desc) from (
      select d.maj_le as quand, jsonb_build_object('id', d.id, 'j0', d.j0, 'j1', d.j1, 'vainqueur', d.vainqueur, 'sets', d.sets,
        'scores_sets', d.scores_sets, 'points_par_set', d.points_par_set, 'sets_gagnants', d.sets_gagnants, 'fin', d.fin,
        'quand', d.maj_le, 'classe', d.classe, 'tournoi', d.tournoi_id is not null,
        'une', case when u.duel_id is null then null
          else jsonb_build_object('par', u.par, 'graine', u.graine, 'citation', u.citation, 'coups', d.coups, 'enjeu', d.enjeu) end,
        'reactions', (select coalesce(jsonb_object_agg(z.emoji, z.n), '{}'::jsonb)
                        from (select r.emoji, count(*) as n from reactions_fil r where r.duel_id = d.id group by r.emoji) z),
        'ma_reaction', (select r.emoji from reactions_fil r where r.duel_id = d.id and r.joueur = auth.uid())) as x
      from duels d left join unes_publiees u on u.duel_id = d.id
      where d.phase = 'termine' and d.vainqueur is not null and d.cree_le >= c.cree_le and d.maj_le > now() - interval '60 days'
        and d.j0 in (select joueur from membres_cercle where cercle_id = p_id)
        and d.j1 in (select joueur from membres_cercle where cercle_id = p_id)
      order by d.maj_le desc limit 40) t), '[]'::jsonb),
    'arrivees', coalesce((select jsonb_agg(jsonb_build_object('joueur', m.joueur, 'quand', m.rejoint_le) order by m.rejoint_le desc)
      from membres_cercle m where m.cercle_id = p_id and m.rejoint_le > now() - interval '60 days'), '[]'::jsonb));
end $$;

-- Publier la Une d'un duel (un des deux joueurs, une seule fois par duel, match allé au bout).
-- → { publiee : elle vient d'être publiée (false : déjà fait), cercles : le nombre de cercles où les deux joueurs sont membres }.
drop function if exists public.publier_une(uuid, int, text);
create or replace function public.publier_une(p_duel uuid, p_graine int, p_citation text default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare d public.duels; n int;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  select * into d from duels where id = p_duel;
  if d.id is null or auth.uid() not in (d.j0, d.j1) then raise exception 'Ce duel n''est pas le tien'; end if;
  if d.phase <> 'termine' or d.vainqueur is null or d.fin is distinct from 'score' then raise exception 'Seul un match allé au bout a sa Une'; end if;
  if p_citation is not null and p_citation !~ '^[a-z0-9_]{1,80}$' then p_citation := null; end if;
  insert into unes_publiees (duel_id, par, graine, citation)
  values (p_duel, case when auth.uid() = d.j0 then 0 else 1 end, greatest(0, least(9999, coalesce(p_graine, 0))), p_citation)
  on conflict (duel_id) do nothing;
  get diagnostics n = row_count;
  return jsonb_build_object('publiee', n > 0, 'cercles', (select count(*) from membres_cercle a join membres_cercle b using (cercle_id)
    where a.joueur = d.j0 and b.joueur = d.j1));
end $$;

-- Réagir à un résultat du fil (👏 bravo, 🔥 feu, 😂 rire, 😱 choc) ; la même réaction une 2e fois (ou null) la retire.
create or replace function public.reagir_fil(p_cercle uuid, p_duel uuid, p_emoji text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if _role(p_cercle) is null then raise exception 'Tu ne fais pas partie de ce cercle'; end if;
  if not _duel_du_cercle(p_cercle, p_duel) then raise exception 'Ce duel n''est pas dans le fil du cercle'; end if;
  if p_emoji is null or exists (select 1 from reactions_fil where duel_id = p_duel and joueur = auth.uid() and emoji = p_emoji) then
    delete from reactions_fil where duel_id = p_duel and joueur = auth.uid();
    return;
  end if;
  if p_emoji not in ('bravo', 'feu', 'rire', 'choc') then raise exception 'Réaction inconnue'; end if;
  insert into reactions_fil (duel_id, joueur, emoji) values (p_duel, auth.uid(), p_emoji)
  on conflict (duel_id, joueur) do update set emoji = excluded.emoji, cree_le = now();
end $$;

revoke all on function public._duel_du_cercle(uuid, uuid) from public, anon, authenticated;
revoke all on function public.fil_cercle(uuid), public.publier_une(uuid, int, text), public.reagir_fil(uuid, uuid, text) from public, anon;
grant execute on function public.fil_cercle(uuid), public.publier_une(uuid, int, text), public.reagir_fil(uuid, uuid, text) to authenticated;
