-- HandSlam — Étape 84 : caler un match de tournoi (les créneaux et le rendez-vous).
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Peut être relancé sans risque. Nécessite les étapes 2 à 83.
-- Puis mettre à jour la fonction « Notifier » (supabase/functions/notifier/index.ts : les notifications des créneaux).
--
-- 20 novembre (idée et choix du porteur du projet) : dans un tournoi ou un championnat à date limite, les deux joueurs doivent
-- être là en même temps. « 📅 Caler le match » : un joueur propose des plages (« jeudi 20 h – 22 h », jusqu'à 5) avant la date
-- limite ; l'autre choisit une heure précise dans une plage (le rendez-vous est fixé), propose d'autres plages, ou décline.
-- Chacun peut reproposer des plages tant que le match n'est pas joué. Rappels : 10 minutes avant, puis à l'heure (minuteur).
-- 15 minutes après l'heure du rendez-vous, celui qui était là (« J'y suis », de 15 minutes avant à maintenant) et dont
-- l'adversaire n'est pas venu peut réclamer la victoire par forfait. Pas pour les Sit & Go (en direct).

create table if not exists public.creneaux_match (
  match_id uuid primary key references public.matchs_tournoi (id) on delete cascade,
  propose_par uuid references public.profils (id) on delete set null,   -- qui a proposé les plages en cours
  plages jsonb not null default '[]'::jsonb,                             -- [{ "debut": …, "fin": … }]
  statut text not null default 'propose' check (statut in ('propose', 'fixe', 'decline')),
  rdv timestamptz,                                                       -- l'heure du rendez-vous (statut « fixe »)
  la0 timestamptz, la1 timestamptz,                                      -- « J'y suis » de chaque joueur (j0, j1 du match)
  rappel_avant boolean not null default false, rappel_heure boolean not null default false,
  maj_le timestamptz not null default now()
);
alter table public.creneaux_match enable row level security;
revoke all on public.creneaux_match from public, anon, authenticated;

-- Les notifications des créneaux : qui (de), quel tournoi (tournoi_id), et l'heure du rendez-vous (quand).
alter table public.notifications add column if not exists quand timestamptz;
alter table public.notifications drop constraint if exists notifications_evenement_check;
alter table public.notifications add constraint notifications_evenement_check
  check (evenement in ('defi', 'accepte', 'tournoi', 'test', 'freeroll', 'programme', 'attend', 'invitation',
                       'ami_demande', 'ami_accepte', 'invitation_cercle',
                       'creneaux', 'rdv_fixe', 'rdv_decline', 'rdv_rappel', 'rdv_heure'));

-- Envoie une notification de créneau (rien ici ne doit empêcher l'action du joueur).
create or replace function public._notifier_creneau(p_joueur uuid, p_evenement text, p_de uuid, p_tournoi uuid, p_quand timestamptz default null) returns void
language plpgsql security definer set search_path = public as $$
declare n bigint;
begin
  if p_joueur is null then return; end if;
  insert into notifications (duel_id, joueur, evenement, de, tournoi_id, quand) values (null, p_joueur, p_evenement, p_de, p_tournoi, p_quand) returning id into n;
  if exists (select 1 from abonnements_push where joueur = p_joueur) then perform _appeler_notifier(n); end if;
exception when others then
  raise notice 'notification non envoyée : %', sqlerrm;
end $$;

-- Le match p_match, s'il est à caler par moi : renvoie le match, le tournoi et ma place (0 ou 1).
create or replace function public._match_a_caler(p_match uuid, out m public.matchs_tournoi, out t public.tournois, out moi smallint)
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  select * into m from matchs_tournoi where id = p_match;
  if m.id is null then raise exception 'Match introuvable'; end if;
  select * into t from tournois where id = m.tournoi_id;
  if auth.uid() = m.j0 then moi := 0; elsif auth.uid() = m.j1 then moi := 1; else raise exception 'Ce match ne te concerne pas'; end if;
  if t.mode = 'direct' then raise exception 'Ce match se joue en direct'; end if;
  if t.phase <> 'en_cours' or m.tour <> t.tour or m.fin is not null or m.j0 is null or m.j1 is null then raise exception 'Ce match n''est plus à jouer'; end if;
  if exists (select 1 from duels d where d.id = m.duel_id and d.phase in ('presentation', 'jeu', 'entre_sets')) then raise exception 'Ce match est en cours'; end if;
end $$;

-- Ce qu'on sait des créneaux d'un match (pour l'appli) : null s'il n'y en a pas encore.
create or replace function public.creneaux_de(p_match uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare c public.creneaux_match; m public.matchs_tournoi; t public.tournois;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  select * into m from matchs_tournoi where id = p_match;
  if m.id is null or auth.uid() not in (m.j0, m.j1) then raise exception 'Ce match ne te concerne pas'; end if;
  select * into t from tournois where id = m.tournoi_id;
  select * into c from creneaux_match where match_id = p_match;
  return jsonb_build_object('echeance', t.echeance, 'mode', t.mode,
    'creneaux', case when c.match_id is null then null else jsonb_build_object('propose_par', c.propose_par, 'plages', c.plages, 'statut', c.statut,
      'rdv', c.rdv, 'moi_la', case when auth.uid() = m.j0 then c.la0 else c.la1 end, 'adv_la', case when auth.uid() = m.j0 then c.la1 else c.la0 end) end);
end $$;

-- Proposer des plages (ou en reproposer : elles remplacent les précédentes, et un rendez-vous fixé est à refaire).
create or replace function public.proposer_creneaux(p_match uuid, p_plages jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare z record; vm public.matchs_tournoi; vt public.tournois; vmoi smallint; p jsonb; d timestamptz; f timestamptz; propres jsonb := '[]'::jsonb; adv uuid;
begin
  select * into z from _match_a_caler(p_match); vm := z.m; vt := z.t; vmoi := z.moi;
  if p_plages is null or jsonb_typeof(p_plages) <> 'array' or jsonb_array_length(p_plages) = 0 then raise exception 'Propose au moins une plage'; end if;
  if jsonb_array_length(p_plages) > 5 then raise exception 'Cinq plages au plus'; end if;
  for p in select * from jsonb_array_elements(p_plages) loop
    begin d := (p->>'debut')::timestamptz; f := (p->>'fin')::timestamptz;
    exception when others then raise exception 'Plage invalide'; end;
    if d is null or f is null or f <= d then raise exception 'Plage invalide'; end if;
    if f - d < interval '15 minutes' or f - d > interval '12 hours' then raise exception 'Une plage dure de 15 minutes à 12 heures'; end if;
    if f < now() + interval '5 minutes' then raise exception 'Cette plage est déjà passée'; end if;
    if vt.echeance is not null and d >= vt.echeance then raise exception 'Cette plage est après la date limite du tour'; end if;
    propres := propres || jsonb_build_array(jsonb_build_object('debut', greatest(d, now()), 'fin', least(f, coalesce(vt.echeance, f))));
  end loop;
  insert into creneaux_match (match_id, propose_par, plages, statut, rdv, la0, la1, rappel_avant, rappel_heure, maj_le)
  values (p_match, auth.uid(), propres, 'propose', null, null, null, false, false, now())
  on conflict (match_id) do update set propose_par = excluded.propose_par, plages = excluded.plages, statut = 'propose', rdv = null,
    la0 = null, la1 = null, rappel_avant = false, rappel_heure = false, maj_le = now();
  adv := case when vmoi = 0 then vm.j1 else vm.j0 end;
  perform _notifier_creneau(adv, 'creneaux', auth.uid(), vt.id);
  return creneaux_de(p_match);
end $$;

-- Choisir une heure précise dans une des plages proposées par l'autre : le rendez-vous est fixé.
create or replace function public.choisir_creneau(p_match uuid, p_heure timestamptz) returns jsonb
language plpgsql security definer set search_path = public as $$
declare z record; vm public.matchs_tournoi; vt public.tournois; vmoi smallint; c public.creneaux_match;
begin
  select * into z from _match_a_caler(p_match); vm := z.m; vt := z.t; vmoi := z.moi;
  select * into c from creneaux_match where match_id = p_match for update;
  if c.match_id is null or c.statut <> 'propose' then raise exception 'Pas de créneau à choisir'; end if;
  if c.propose_par = auth.uid() then raise exception 'C''est à ton adversaire de choisir'; end if;
  if p_heure is null or p_heure < now() - interval '1 minute' then raise exception 'Cette heure est déjà passée'; end if;
  if not exists (select 1 from jsonb_array_elements(c.plages) e where p_heure between (e->>'debut')::timestamptz and (e->>'fin')::timestamptz) then
    raise exception 'Choisis une heure dans une des plages proposées';
  end if;
  update creneaux_match set statut = 'fixe', rdv = p_heure, rappel_avant = p_heure < now() + interval '10 minutes', rappel_heure = false, maj_le = now()
  where match_id = p_match;
  perform _notifier_creneau(c.propose_par, 'rdv_fixe', auth.uid(), vt.id, p_heure);
  return creneaux_de(p_match);
end $$;

-- Décliner les plages proposées par l'autre.
create or replace function public.decliner_creneaux(p_match uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare z record; vm public.matchs_tournoi; vt public.tournois; vmoi smallint; c public.creneaux_match;
begin
  select * into z from _match_a_caler(p_match); vm := z.m; vt := z.t; vmoi := z.moi;
  select * into c from creneaux_match where match_id = p_match for update;
  if c.match_id is null or c.statut <> 'propose' then raise exception 'Pas de créneau à décliner'; end if;
  if c.propose_par = auth.uid() then raise exception 'Ce sont tes propres créneaux'; end if;
  update creneaux_match set statut = 'decline', maj_le = now() where match_id = p_match;
  perform _notifier_creneau(c.propose_par, 'rdv_decline', auth.uid(), vt.id);
  return creneaux_de(p_match);
end $$;

-- « J'y suis » : j'arrive au rendez-vous (l'appli l'appelle quand je lance le match).
create or replace function public.present_rdv(p_match uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare z record; vm public.matchs_tournoi; vt public.tournois; vmoi smallint;
begin
  select * into z from _match_a_caler(p_match); vm := z.m; vt := z.t; vmoi := z.moi;
  if vmoi = 0 then update creneaux_match set la0 = now() where match_id = p_match and statut = 'fixe';
  else update creneaux_match set la1 = now() where match_id = p_match and statut = 'fixe'; end if;
  return creneaux_de(p_match);
end $$;

-- 15 minutes après l'heure du rendez-vous : j'étais là (« J'y suis » depuis 15 minutes avant l'heure), pas lui : je gagne par forfait.
create or replace function public.forfait_rdv(p_match uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare z record; vm public.matchs_tournoi; vt public.tournois; vmoi smallint; c public.creneaux_match; moi_la timestamptz; adv_la timestamptz; d public.duels;
begin
  select * into z from _match_a_caler(p_match); vm := z.m; vt := z.t; vmoi := z.moi;
  select * into c from creneaux_match where match_id = p_match for update;
  if c.match_id is null or c.statut <> 'fixe' then raise exception 'Pas de rendez-vous fixé'; end if;
  if now() < c.rdv + interval '15 minutes' then raise exception 'Attends 15 minutes après l''heure du rendez-vous'; end if;
  moi_la := case when vmoi = 0 then c.la0 else c.la1 end; adv_la := case when vmoi = 0 then c.la1 else c.la0 end;
  if moi_la is null or moi_la < c.rdv - interval '15 minutes' then raise exception 'Tu n''étais pas au rendez-vous'; end if;
  if adv_la is not null and adv_la >= c.rdv - interval '15 minutes' then raise exception 'Ton adversaire était là aussi : jouez le match'; end if;
  select * into d from duels where id = vm.duel_id for update;
  if d.id is not null and d.phase = 'attente' then
    perform set_config('pcf.interne', '1', true);
    update duels set phase = 'annule', maj_le = now() where id = d.id;
    perform set_config('pcf.interne', '', true);
  end if;
  update matchs_tournoi set vainqueur = auth.uid(), fin = 'forfait' where id = p_match;
  perform _avancer_tournoi(vt.id);
  return jsonb_build_object('ok', true);
end $$;

-- Les rappels (minuteur, chaque minute) : 10 minutes avant le rendez-vous, puis à l'heure, aux deux joueurs.
create or replace function public._rappels_rdv() returns void
language plpgsql security definer set search_path = public as $$
declare c record;
begin
  for c in select cm.*, m.j0, m.j1, m.tournoi_id from creneaux_match cm join matchs_tournoi m on m.id = cm.match_id
           where cm.statut = 'fixe' and m.fin is null and cm.rdv between now() - interval '5 minutes' and now() + interval '10 minutes' loop
    if not c.rappel_avant and c.rdv > now() then
      update creneaux_match set rappel_avant = true where match_id = c.match_id;
      perform _notifier_creneau(c.j0, 'rdv_rappel', c.j1, c.tournoi_id, c.rdv);
      perform _notifier_creneau(c.j1, 'rdv_rappel', c.j0, c.tournoi_id, c.rdv);
    elsif not c.rappel_heure and c.rdv <= now() then
      update creneaux_match set rappel_heure = true, rappel_avant = true where match_id = c.match_id;
      perform _notifier_creneau(c.j0, 'rdv_heure', c.j1, c.tournoi_id, c.rdv);
      perform _notifier_creneau(c.j1, 'rdv_heure', c.j0, c.tournoi_id, c.rdv);
    end if;
  end loop;
end $$;

do $$ begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job where jobname = 'rappels-rdv';
  perform cron.schedule('rappels-rdv', '* * * * *', 'select public._rappels_rdv()');
exception when others then
  raise notice 'pg_cron indisponible ici : pas de rappels des rendez-vous (%)', sqlerrm;
end $$;

-- ---------------------------------------------------------------- sécurité
revoke all on function public._notifier_creneau(uuid, text, uuid, uuid, timestamptz), public._match_a_caler(uuid), public._rappels_rdv()
  from public, anon, authenticated;
revoke all on function public.creneaux_de(uuid), public.proposer_creneaux(uuid, jsonb), public.choisir_creneau(uuid, timestamptz),
  public.decliner_creneaux(uuid), public.present_rdv(uuid), public.forfait_rdv(uuid) from public, anon;
grant execute on function public.creneaux_de(uuid), public.proposer_creneaux(uuid, jsonb), public.choisir_creneau(uuid, timestamptz),
  public.decliner_creneaux(uuid), public.present_rdv(uuid), public.forfait_rdv(uuid) to authenticated;
