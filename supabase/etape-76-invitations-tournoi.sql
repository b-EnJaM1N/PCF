-- HandSlam — Étape 76 : inviter des membres à un tournoi (ou un championnat) de cercle.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Peut être relancé sans risque. Nécessite les étapes 2 à 75.
-- Puis mettre à jour la fonction « Notifier » (supabase/functions/notifier/index.ts : la notification « invitation »).
--
-- Demande du porteur du projet (14 novembre) : « je préfère inviter plutôt qu'inscrire d'office » (choix B : l'organisateur
-- choisit qui inviter). Sur la page d'un tournoi de cercle encore en inscriptions, son créateur touche « 📨 Inviter des
-- membres », coche des membres du cercle (ou « Tous ») et envoie. Chaque invité reçoit une notification « X t'invite au
-- tournoi … », et voit l'invitation en haut du menu Jouer et sur la page du cercle, avec « M'inscrire » et « Non merci ».
-- Personne n'est inscrit sans l'avoir choisi. Une seule notification par invité et par tournoi (même si on le réinvite).

create table if not exists public.invitations_tournoi (
  tournoi_id uuid not null references public.tournois (id) on delete cascade,
  joueur uuid not null references public.profils (id) on delete cascade,
  de uuid references public.profils (id) on delete set null,          -- qui a invité
  cree_le timestamptz not null default now(),
  refusee boolean not null default false,                              -- « Non merci »
  primary key (tournoi_id, joueur)
);
create index if not exists invitations_tournoi_joueur on public.invitations_tournoi (joueur);
alter table public.invitations_tournoi enable row level security;
revoke all on public.invitations_tournoi from public, anon, authenticated;

-- La notification « invitation » : qui invite (de) et à quel tournoi (tournoi_id, colonne de l'étape 18).
alter table public.notifications add column if not exists de uuid references public.profils (id) on delete set null;
alter table public.notifications drop constraint if exists notifications_evenement_check;
alter table public.notifications add constraint notifications_evenement_check
  check (evenement in ('defi', 'accepte', 'tournoi', 'test', 'freeroll', 'programme', 'attend', 'invitation'));

-- Le tournoi p_id, si j'en suis le créateur, qu'il est d'un cercle et encore en inscriptions.
create or replace function public._tournoi_a_inviter(p_id uuid) returns public.tournois
language plpgsql stable security definer set search_path = public as $$
declare t public.tournois;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  select * into t from tournois where id = p_id;
  if t.id is null or t.cercle_id is null then raise exception 'Tournoi introuvable'; end if;
  if t.createur is distinct from auth.uid() then raise exception 'Seul l''organisateur peut inviter'; end if;
  if t.phase <> 'inscriptions' then raise exception 'Les inscriptions à ce tournoi sont closes'; end if;
  return t;
end $$;

-- Les membres du cercle que l'organisateur peut inviter, avec où ils en sont :
-- « inscrit », « invite » (en attente de réponse), « refuse » (« Non merci »), ou null (pas encore invité).
create or replace function public.invitables_tournoi(p_id uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare t public.tournois;
begin
  t := _tournoi_a_inviter(p_id);
  return coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'pseudo', p.pseudo, 'numero', p.numero, 'avatar', p.avatar,
      'etat', case when exists (select 1 from inscrits_tournoi i where i.tournoi_id = t.id and i.joueur = p.id) then 'inscrit'
                   when it.refusee then 'refuse' when it.joueur is not null then 'invite' end)
      order by (exists (select 1 from inscrits_tournoi i where i.tournoi_id = t.id and i.joueur = p.id)), lower(p.pseudo))
    from membres_cercle m join profils p on p.id = m.joueur
    left join invitations_tournoi it on it.tournoi_id = t.id and it.joueur = p.id
    where m.cercle_id = t.cercle_id and p.id <> auth.uid()), '[]'::jsonb);
end $$;

-- Invite des membres du cercle (les déjà inscrits sont ignorés ; un « Non merci » peut être réinvité).
-- Chaque invité reçoit une notification, une seule fois par tournoi. Renvoie le nombre de nouvelles invitations.
create or replace function public.inviter_tournoi(p_id uuid, p_joueurs uuid[]) returns int
language plpgsql security definer set search_path = public as $$
declare t public.tournois; j uuid; n bigint; nouveaux int := 0;
begin
  t := _tournoi_a_inviter(p_id);
  if coalesce(array_length(p_joueurs, 1), 0) = 0 then raise exception 'Choisis au moins un membre à inviter'; end if;
  if array_length(p_joueurs, 1) > 200 then raise exception 'Trop de joueurs d''un coup'; end if;
  for j in select distinct x from unnest(p_joueurs) x loop
    continue when j = auth.uid()
      or not exists (select 1 from membres_cercle where cercle_id = t.cercle_id and joueur = j)
      or exists (select 1 from inscrits_tournoi where tournoi_id = t.id and joueur = j)
      or exists (select 1 from invitations_tournoi where tournoi_id = t.id and joueur = j and not refusee);
    insert into invitations_tournoi (tournoi_id, joueur, de) values (t.id, j, auth.uid())
    on conflict (tournoi_id, joueur) do update set refusee = false, de = excluded.de, cree_le = now();
    nouveaux := nouveaux + 1;
    -- la notification (une seule par invité et par tournoi) ; rien ici ne doit empêcher l'invitation
    begin
      if not exists (select 1 from notifications where joueur = j and evenement = 'invitation' and tournoi_id = t.id) then
        insert into notifications (duel_id, joueur, evenement, tournoi_id, de) values (null, j, 'invitation', t.id, auth.uid()) returning id into n;
        if exists (select 1 from abonnements_push where joueur = j) then perform _appeler_notifier(n); end if;
      end if;
    exception when others then
      raise notice 'notification non envoyée : %', sqlerrm;
    end;
  end loop;
  return nouveaux;
end $$;

-- Mes invitations en attente : tournoi encore en inscriptions, pas encore inscrit, pas refusée, toujours membre du cercle.
create or replace function public.mes_invitations() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('tournoi', t.id, 'nom', t.nom, 'mode', t.mode, 'cercle', c.id, 'cercle_nom', c.nom,
      'de', case when p.id is null then null else jsonb_build_object('pseudo', p.pseudo, 'numero', p.numero) end,
      'enjeu', t.enjeu, 'quand', it.cree_le) order by it.cree_le desc), '[]'::jsonb)
  from invitations_tournoi it
  join tournois t on t.id = it.tournoi_id
  join cercles c on c.id = t.cercle_id
  left join profils p on p.id = it.de
  where it.joueur = auth.uid() and not it.refusee and t.phase = 'inscriptions'
    and exists (select 1 from membres_cercle m where m.cercle_id = t.cercle_id and m.joueur = auth.uid())
    and not exists (select 1 from inscrits_tournoi i where i.tournoi_id = t.id and i.joueur = auth.uid())
$$;

-- « Non merci » : l'invitation disparaît (l'organisateur le voit ; il peut réinviter).
create or replace function public.refuser_invitation(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  update invitations_tournoi set refusee = true where tournoi_id = p_id and joueur = auth.uid();
end $$;

-- ---------------------------------------------------------------- sécurité
revoke all on function public._tournoi_a_inviter(uuid) from public, anon, authenticated;
revoke all on function public.invitables_tournoi(uuid), public.inviter_tournoi(uuid, uuid[]), public.mes_invitations(),
  public.refuser_invitation(uuid) from public, anon;
grant execute on function public.invitables_tournoi(uuid), public.inviter_tournoi(uuid, uuid[]), public.mes_invitations(),
  public.refuser_invitation(uuid) to authenticated;
