-- PCF — Étape 4 : Niveau officiel entre joueurs humains, amis et cercles.
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite d'avoir lancé etape-2-comptes.sql et etape-3-duels.sql avant. Peut être relancé sans risque.
--
-- Principes :
--  * le niveau officiel est calculé UNIQUEMENT par le serveur, à la fin d'un duel officiel
--    (formule ELO, départ à 1200, les points gagnés par l'un sont perdus par l'autre) ;
--    il est séparé du niveau d'entraînement contre les bots, qui reste sur le téléphone ;
--  * personne ne peut modifier un classement, une amitié ou un cercle directement :
--    tout passe par les fonctions ci-dessous, qui vérifient qui appelle ;
--  * anti-arrangement : au plus 5 duels officiels par jour entre les deux mêmes joueurs,
--    et un duel sans aucun coup joué ne compte pas.

-- ---------------------------------------------------------------- le niveau officiel
create table if not exists public.classements (
  joueur uuid primary key references public.profils (id) on delete cascade,
  points int not null default 1200,
  joues int not null default 0,
  gagnes int not null default 0,
  meilleur int not null default 1200,
  maj_le timestamptz not null default now()
);

alter table public.duels add column if not exists classe boolean not null default true;   -- match officiel ou amical
alter table public.duels add column if not exists classement_avant int[];                -- [joueur 0, joueur 1]
alter table public.duels add column if not exists classement_apres int[];
alter table public.duels add column if not exists classement_motif text;                 -- pourquoi il n'a pas compté

create or replace function public._classement_depart() returns int language sql immutable as $$ select 1200 $$;
create or replace function public._k() returns int language sql immutable as $$ select 32 $$;
create or replace function public._limite_paire() returns int language sql immutable as $$ select 5 $$;

-- Points gagnés par le vainqueur (et perdus par le perdant), comme nouvelElo() dans l'application.
create or replace function public._variation(p_gagnant int, p_perdant int) returns int
language sql immutable as $$
  select round((public._k() * (1 - 1 / (1 + power(10::float8, (p_perdant - p_gagnant) / 400.0))))::numeric)::int
$$;

-- À la fin d'un duel : mise à jour du classement des deux joueurs (une seule fois).
create or replace function public._fin_de_duel() returns trigger
language plpgsql security definer set search_path = public as $$
declare g uuid; p uuid; eg int; ep int; v int; recents int;
begin
  if new.phase <> 'termine' or old.phase = 'termine' or new.vainqueur is null or new.j1 is null then return new; end if;
  if not new.classe then new.classement_motif := 'amical'; return new; end if;
  if jsonb_array_length(new.coups) = 0 then new.classement_motif := 'non_dispute'; return new; end if;
  select count(*) into recents from duels
  where id <> new.id and classement_apres is not null and maj_le > now() - interval '24 hours'
    and ((j0 = new.j0 and j1 = new.j1) or (j0 = new.j1 and j1 = new.j0));
  if recents >= _limite_paire() then new.classement_motif := 'limite'; return new; end if;

  insert into classements (joueur) values (new.j0), (new.j1) on conflict do nothing;
  perform 1 from classements where joueur in (new.j0, new.j1) order by joueur for update;
  if new.vainqueur = 0 then g := new.j0; p := new.j1; else g := new.j1; p := new.j0; end if;
  select points into eg from classements where joueur = g;
  select points into ep from classements where joueur = p;
  v := _variation(eg, ep);
  update classements set points = eg + v, joues = joues + 1, gagnes = gagnes + 1, meilleur = greatest(meilleur, eg + v), maj_le = now() where joueur = g;
  update classements set points = ep - v, joues = joues + 1, maj_le = now() where joueur = p;
  new.classement_avant := case when new.vainqueur = 0 then array[eg, ep] else array[ep, eg] end;
  new.classement_apres := case when new.vainqueur = 0 then array[eg + v, ep - v] else array[ep - v, eg + v] end;
  new.classement_motif := null;
  return new;
end $$;

drop trigger if exists duels_fin on public.duels;
create trigger duels_fin before update on public.duels for each row execute function public._fin_de_duel();

-- Lancer un défi, classé ou amical (remplace creer_duel dans l'application).
create or replace function public.lancer_defi(p_adversaire uuid, p_points int, p_sets int, p_classe boolean default true)
returns public.duels language plpgsql security definer set search_path = public as $$
declare d public.duels;
begin
  d := creer_duel(p_adversaire, p_points, p_sets);
  update duels set classe = coalesce(p_classe, true) where id = d.id returning * into d;
  return d;
end $$;

-- La recherche affiche désormais le niveau officiel.
create or replace function public.chercher_joueurs(p_texte text)
returns table (id uuid, pseudo text, numero smallint, drapeau text, avatar jsonb, niveau int)
language plpgsql stable security definer set search_path = public as $$
declare t text := lower(btrim(coalesce(p_texte, ''))); n text;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if position('#' in t) > 0 then n := split_part(t, '#', 2); t := split_part(t, '#', 1); end if;
  if char_length(t) < 2 then return; end if;
  return query
    select p.id, p.pseudo, p.numero, p.drapeau, p.avatar, coalesce(c.points, _classement_depart())
    from profils p left join classements c on c.joueur = p.id
    where p.visible_recherche and p.id <> auth.uid()
      and p.pseudo_min like replace(replace(t, '%', ''), '_', '\_') || '%'
      and (n is null or n = '' or p.numero::text like n || '%')
    order by (p.pseudo_min = t) desc, p.pseudo_min, p.numero
    limit 20;
end $$;

-- Fiche publique d'un joueur (pseudo, avatar, classement) en JSON.
create or replace function public._carte(p_id uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('id', p.id, 'pseudo', p.pseudo, 'numero', p.numero, 'drapeau', p.drapeau, 'avatar', p.avatar,
    'classement', coalesce(c.points, _classement_depart()), 'joues', coalesce(c.joues, 0), 'gagnes', coalesce(c.gagnes, 0))
  from profils p left join classements c on c.joueur = p.id where p.id = p_id
$$;

-- ---------------------------------------------------------------- les amis
-- Une ligne par paire de joueurs (a < b) : demande en attente, puis amis.
create table if not exists public.amities (
  a uuid not null references public.profils (id) on delete cascade,
  b uuid not null references public.profils (id) on delete cascade,
  demandeur uuid not null,
  statut text not null default 'attente' check (statut in ('attente', 'amis')),
  cree_le timestamptz not null default now(),
  primary key (a, b),
  constraint paire_ordonnee check (a < b),
  constraint demandeur_de_la_paire check (demandeur in (a, b))
);
create index if not exists amities_b on public.amities (b);

create or replace function public.demander_ami(p_joueur uuid) returns text
language plpgsql security definer set search_path = public as $$
declare moi uuid := auth.uid(); x uuid; y uuid; l public.amities;
begin
  if moi is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = moi) then raise exception 'Crée d''abord ton compte'; end if;
  if p_joueur is null or p_joueur = moi then raise exception 'Tu ne peux pas être ton propre ami'; end if;
  if not exists (select 1 from profils where id = p_joueur) then raise exception 'Joueur introuvable'; end if;
  x := least(moi, p_joueur); y := greatest(moi, p_joueur);
  select * into l from amities where a = x and b = y for update;
  if l.a is not null then
    if l.statut = 'amis' then return 'amis'; end if;
    if l.demandeur = moi then return 'envoyee'; end if;
    update amities set statut = 'amis' where a = x and b = y;   -- il m'avait déjà demandé : on devient amis
    return 'amis';
  end if;
  if (select count(*) from amities where a = moi or b = moi) >= 300 then raise exception 'Tu as atteint la limite de 300 amis et demandes'; end if;
  if (select count(*) from amities where demandeur = moi and statut = 'attente') >= 50 then
    raise exception 'Tu as déjà 50 demandes d''ami en attente';
  end if;
  insert into amities (a, b, demandeur) values (x, y, moi);
  return 'envoyee';
end $$;

create or replace function public.repondre_ami(p_joueur uuid, p_accepte boolean) returns text
language plpgsql security definer set search_path = public as $$
declare moi uuid := auth.uid(); x uuid := least(auth.uid(), p_joueur); y uuid := greatest(auth.uid(), p_joueur);
begin
  if moi is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from amities where a = x and b = y and statut = 'attente' and demandeur = p_joueur) then
    raise exception 'Cette demande n''existe plus';
  end if;
  if p_accepte then update amities set statut = 'amis' where a = x and b = y; return 'amis'; end if;
  delete from amities where a = x and b = y;
  return 'refusee';
end $$;

-- Retirer un ami, ou annuler une demande envoyée.
create or replace function public.retirer_ami(p_joueur uuid) returns void
language sql security definer set search_path = public as $$
  delete from amities where a = least(auth.uid(), p_joueur) and b = greatest(auth.uid(), p_joueur);
$$;

-- Mes amis et demandes, avec leur classement : [{…carte, statut, recue}]
create or replace function public.mes_amis() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare moi uuid := auth.uid();
begin
  if moi is null then raise exception 'Non connecté'; end if;
  return coalesce((
    select jsonb_agg(_carte(case when l.a = moi then l.b else l.a end)
             || jsonb_build_object('statut', l.statut, 'recue', l.statut = 'attente' and l.demandeur <> moi)
           order by l.statut, (select coalesce(points, _classement_depart()) from classements where joueur = case when l.a = moi then l.b else l.a end) desc nulls last)
    from amities l where l.a = moi or l.b = moi), '[]'::jsonb);
end $$;

-- ---------------------------------------------------------------- les cercles
create table if not exists public.cercles (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  blason jsonb not null default '{}'::jsonb,       -- { "embleme": "…", "fond": "…" } : choisis dans une liste par l'application
  code text not null unique default substr(md5(gen_random_uuid()::text), 1, 10),   -- pour le lien d'invitation
  cree_le timestamptz not null default now(),
  constraint nom_valide check (char_length(nom) between 2 and 30 and nom = btrim(nom) and nom !~ '[[:cntrl:]]'),
  constraint blason_leger check (pg_column_size(blason) < 400)
);
create table if not exists public.membres_cercle (
  cercle_id uuid not null references public.cercles (id) on delete cascade,
  joueur uuid not null references public.profils (id) on delete cascade,
  role text not null default 'membre' check (role in ('admin', 'membre')),
  rejoint_le timestamptz not null default now(),
  primary key (cercle_id, joueur)
);
create index if not exists membres_cercle_joueur on public.membres_cercle (joueur);
create table if not exists public.invitations_cercle (
  cercle_id uuid not null references public.cercles (id) on delete cascade,
  invite uuid not null references public.profils (id) on delete cascade,
  par uuid references public.profils (id) on delete cascade,
  cree_le timestamptz not null default now(),
  primary key (cercle_id, invite)
);
create index if not exists invitations_cercle_invite on public.invitations_cercle (invite);

create or replace function public._limite_membres() returns int language sql immutable as $$ select 100 $$;
create or replace function public._limite_cercles() returns int language sql immutable as $$ select 20 $$;

-- Quand un membre part (ou supprime son compte) : si plus aucun responsable, le plus ancien
-- membre le devient ; un cercle vide est supprimé.
create or replace function public._apres_depart() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from membres_cercle where cercle_id = old.cercle_id) then
    delete from cercles where id = old.cercle_id;
  elsif not exists (select 1 from membres_cercle where cercle_id = old.cercle_id and role = 'admin') then
    update membres_cercle set role = 'admin'
    where (cercle_id, joueur) = (select cercle_id, joueur from membres_cercle where cercle_id = old.cercle_id order by rejoint_le, joueur limit 1);
  end if;
  return null;
end $$;
drop trigger if exists membres_depart on public.membres_cercle;
create trigger membres_depart after delete on public.membres_cercle for each row execute function public._apres_depart();

create or replace function public._role(p_cercle uuid) returns text
language sql stable security definer set search_path = public as $$
  select role from membres_cercle where cercle_id = p_cercle and joueur = auth.uid()
$$;

create or replace function public._verifier_nom_blason(p_nom text, p_blason jsonb) returns void
language plpgsql immutable as $$
begin
  if p_nom is null or char_length(btrim(p_nom)) not between 2 and 30 then raise exception 'Le nom du cercle doit faire entre 2 et 30 caractères'; end if;
  if p_blason is not null and (jsonb_typeof(p_blason) <> 'object' or pg_column_size(p_blason) >= 400) then raise exception 'Blason invalide'; end if;
end $$;

create or replace function public._rejoindre(p_cercle uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from membres_cercle where cercle_id = p_cercle and joueur = auth.uid()) then
    delete from invitations_cercle where cercle_id = p_cercle and invite = auth.uid();
    return;
  end if;
  if (select count(*) from membres_cercle where joueur = auth.uid()) >= _limite_cercles() then
    raise exception 'Tu fais déjà partie de % cercles', _limite_cercles();
  end if;
  if (select count(*) from membres_cercle where cercle_id = p_cercle) >= _limite_membres() then
    raise exception 'Ce cercle est complet (% membres)', _limite_membres();
  end if;
  insert into membres_cercle (cercle_id, joueur) values (p_cercle, auth.uid()) on conflict do nothing;
  delete from invitations_cercle where cercle_id = p_cercle and invite = auth.uid();
end $$;

create or replace function public.creer_cercle(p_nom text, p_blason jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare c public.cercles;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton compte'; end if;
  perform _verifier_nom_blason(p_nom, p_blason);
  if (select count(*) from membres_cercle where joueur = auth.uid()) >= _limite_cercles() then
    raise exception 'Tu fais déjà partie de % cercles', _limite_cercles();
  end if;
  insert into cercles (nom, blason) values (btrim(p_nom), coalesce(p_blason, '{}'::jsonb)) returning * into c;
  insert into membres_cercle (cercle_id, joueur, role) values (c.id, auth.uid(), 'admin');
  return jsonb_build_object('id', c.id, 'code', c.code, 'nom', c.nom);
end $$;

create or replace function public.modifier_cercle(p_id uuid, p_nom text, p_blason jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if _role(p_id) is distinct from 'admin' then raise exception 'Seul le responsable du cercle peut le modifier'; end if;
  perform _verifier_nom_blason(p_nom, p_blason);
  update cercles set nom = btrim(p_nom), blason = coalesce(p_blason, blason) where id = p_id;
end $$;

-- Inviter un joueur (tout membre peut inviter).
create or replace function public.inviter_cercle(p_id uuid, p_joueur uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if _role(p_id) is null then raise exception 'Tu ne fais pas partie de ce cercle'; end if;
  if not exists (select 1 from profils where id = p_joueur) then raise exception 'Joueur introuvable'; end if;
  if exists (select 1 from membres_cercle where cercle_id = p_id and joueur = p_joueur) then raise exception 'Ce joueur fait déjà partie du cercle'; end if;
  if (select count(*) from membres_cercle where cercle_id = p_id) + (select count(*) from invitations_cercle where cercle_id = p_id) >= _limite_membres() + 50 then
    raise exception 'Trop d''invitations en attente pour ce cercle';
  end if;
  insert into invitations_cercle (cercle_id, invite, par) values (p_id, p_joueur, auth.uid()) on conflict do nothing;
end $$;

create or replace function public.repondre_cercle(p_id uuid, p_accepte boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from invitations_cercle where cercle_id = p_id and invite = auth.uid()) then raise exception 'Cette invitation n''existe plus'; end if;
  if p_accepte then perform _rejoindre(p_id);
  else delete from invitations_cercle where cercle_id = p_id and invite = auth.uid(); end if;
end $$;

-- Rejoindre par un lien « ?cercle=CODE ».
create or replace function public.rejoindre_cercle(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare c public.cercles;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton compte'; end if;
  select * into c from cercles where code = p_code;
  if c.id is null then raise exception 'Ce lien de cercle n''est plus valable'; end if;
  perform _rejoindre(c.id);
  return jsonb_build_object('id', c.id, 'nom', c.nom);
end $$;

create or replace function public.quitter_cercle(p_id uuid) returns void
language sql security definer set search_path = public as $$
  delete from membres_cercle where cercle_id = p_id and joueur = auth.uid();
$$;

create or replace function public.exclure_cercle(p_id uuid, p_joueur uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if _role(p_id) is distinct from 'admin' then raise exception 'Seul le responsable du cercle peut retirer un membre'; end if;
  if p_joueur = auth.uid() then raise exception 'Pour partir, utilise « Quitter le cercle »'; end if;
  delete from membres_cercle where cercle_id = p_id and joueur = p_joueur;
  delete from invitations_cercle where cercle_id = p_id and invite = p_joueur;
end $$;

-- Donner le rôle de responsable à un autre membre.
create or replace function public.nommer_responsable(p_id uuid, p_joueur uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if _role(p_id) is distinct from 'admin' then raise exception 'Seul le responsable du cercle peut le faire'; end if;
  if not exists (select 1 from membres_cercle where cercle_id = p_id and joueur = p_joueur) then raise exception 'Ce joueur ne fait pas partie du cercle'; end if;
  update membres_cercle set role = 'admin' where cercle_id = p_id and joueur = p_joueur;
  update membres_cercle set role = 'membre' where cercle_id = p_id and joueur = auth.uid() and p_joueur <> auth.uid();
end $$;

-- Nouveau lien d'invitation (l'ancien ne marche plus).
create or replace function public.nouveau_lien_cercle(p_id uuid) returns text
language plpgsql security definer set search_path = public as $$
declare c text;
begin
  if _role(p_id) is distinct from 'admin' then raise exception 'Seul le responsable du cercle peut changer le lien'; end if;
  update cercles set code = substr(md5(gen_random_uuid()::text), 1, 10) where id = p_id returning code into c;
  return c;
end $$;

create or replace function public.supprimer_cercle(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if _role(p_id) is distinct from 'admin' then raise exception 'Seul le responsable du cercle peut le supprimer'; end if;
  delete from cercles where id = p_id;
end $$;

-- Mes cercles (avec mon rang dans chacun) et mes invitations.
create or replace function public.mes_cercles() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare moi uuid := auth.uid();
begin
  if moi is null then raise exception 'Non connecté'; end if;
  return jsonb_build_object(
    'cercles', coalesce((
      select jsonb_agg(jsonb_build_object('id', c.id, 'nom', c.nom, 'blason', c.blason, 'role', m.role,
        'membres', (select count(*) from membres_cercle x where x.cercle_id = c.id),
        'rang', 1 + (select count(*) from membres_cercle x left join classements k on k.joueur = x.joueur
                     where x.cercle_id = c.id and coalesce(k.points, _classement_depart()) >
                       coalesce((select points from classements where joueur = moi), _classement_depart())))
        order by c.nom)
      from membres_cercle m join cercles c on c.id = m.cercle_id where m.joueur = moi), '[]'::jsonb),
    'invitations', coalesce((
      select jsonb_agg(jsonb_build_object('id', c.id, 'nom', c.nom, 'blason', c.blason,
        'membres', (select count(*) from membres_cercle x where x.cercle_id = c.id),
        'par', (select jsonb_build_object('pseudo', p.pseudo, 'numero', p.numero) from profils p where p.id = i.par))
        order by i.cree_le desc)
      from invitations_cercle i join cercles c on c.id = i.cercle_id where i.invite = moi), '[]'::jsonb));
end $$;

-- Un cercle : ses membres rangés par niveau officiel, et les duels joués entre membres.
create or replace function public.voir_cercle(p_id uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare c public.cercles; r text := _role(p_id);
begin
  if r is null then raise exception 'Tu ne fais pas partie de ce cercle'; end if;
  select * into c from cercles where id = p_id;
  return jsonb_build_object('id', c.id, 'nom', c.nom, 'blason', c.blason, 'code', c.code, 'role', r, 'cree_le', c.cree_le,
    'matchs', (select count(*) from duels d where d.phase = 'termine' and d.vainqueur is not null and d.cree_le >= c.cree_le
                 and d.j0 in (select joueur from membres_cercle where cercle_id = p_id)
                 and d.j1 in (select joueur from membres_cercle where cercle_id = p_id)),
    'membres', (select jsonb_agg(x.carte order by (x.carte->>'classement')::int desc, (x.carte->>'joues')::int desc, x.carte->>'pseudo')
      from (select _carte(m.joueur) || jsonb_build_object('role', m.role,
              'v', (select count(*) from duels d where d.phase = 'termine' and d.cree_le >= c.cree_le
                      and ((d.j0 = m.joueur and d.vainqueur = 0) or (d.j1 = m.joueur and d.vainqueur = 1))
                      and d.j0 in (select joueur from membres_cercle where cercle_id = p_id)
                      and d.j1 in (select joueur from membres_cercle where cercle_id = p_id)),
              'd', (select count(*) from duels d where d.phase = 'termine' and d.cree_le >= c.cree_le
                      and ((d.j0 = m.joueur and d.vainqueur = 1) or (d.j1 = m.joueur and d.vainqueur = 0))
                      and d.j0 in (select joueur from membres_cercle where cercle_id = p_id)
                      and d.j1 in (select joueur from membres_cercle where cercle_id = p_id))) as carte
            from membres_cercle m where m.cercle_id = p_id) x));
end $$;

-- ---------------------------------------------------------------- sécurité
alter table public.classements enable row level security;
alter table public.amities enable row level security;
alter table public.cercles enable row level security;
alter table public.membres_cercle enable row level security;
alter table public.invitations_cercle enable row level security;

-- Le classement de chacun est public (pour les joueurs connectés), en lecture seule.
drop policy if exists "classements visibles" on public.classements;
create policy "classements visibles" on public.classements for select to authenticated using (true);

revoke all on public.classements, public.amities, public.cercles, public.membres_cercle, public.invitations_cercle from anon, authenticated;
grant select on public.classements to authenticated;

revoke all on function public._variation(int, int), public._fin_de_duel(), public._carte(uuid), public._apres_depart(),
  public._role(uuid), public._verifier_nom_blason(text, jsonb), public._rejoindre(uuid) from public, anon, authenticated;
revoke all on function public.lancer_defi(uuid, int, int, boolean), public.demander_ami(uuid), public.repondre_ami(uuid, boolean),
  public.retirer_ami(uuid), public.mes_amis(), public.creer_cercle(text, jsonb), public.modifier_cercle(uuid, text, jsonb),
  public.inviter_cercle(uuid, uuid), public.repondre_cercle(uuid, boolean), public.rejoindre_cercle(text), public.quitter_cercle(uuid),
  public.exclure_cercle(uuid, uuid), public.nommer_responsable(uuid, uuid), public.nouveau_lien_cercle(uuid),
  public.supprimer_cercle(uuid), public.mes_cercles(), public.voir_cercle(uuid) from public, anon;
grant execute on function public.lancer_defi(uuid, int, int, boolean), public.demander_ami(uuid), public.repondre_ami(uuid, boolean),
  public.retirer_ami(uuid), public.mes_amis(), public.creer_cercle(text, jsonb), public.modifier_cercle(uuid, text, jsonb),
  public.inviter_cercle(uuid, uuid), public.repondre_cercle(uuid, boolean), public.rejoindre_cercle(text), public.quitter_cercle(uuid),
  public.exclure_cercle(uuid, uuid), public.nommer_responsable(uuid, uuid), public.nouveau_lien_cercle(uuid),
  public.supprimer_cercle(uuid), public.mes_cercles(), public.voir_cercle(uuid) to authenticated;
