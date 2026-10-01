-- PCF — Étape 13 : les jetons (monnaie fictive, jamais achetable ni échangeable).
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Nécessite les étapes précédentes.
-- Peut être relancé sans risque.
--
-- Tout se passe sur le serveur : l'appli ne peut que demander (bonus du jour, renflouement…), jamais fixer un solde.
--   - 1 000 jetons offerts à l'ouverture du portefeuille (premier passage avec un compte) ;
--   - bonus quotidien en série : 50 le 1er jour, puis +25 par jour d'affilée, jusqu'à 200 (un jour manqué : la série repart à 1) ;
--   - renflouement : sous 100 jetons, +200, une fois par jour ;
--   - entraînement : +10 par victoire contre un bot, 100 par jour au plus.
-- Les journées sont comptées à l'heure de Paris.

create table if not exists public.jetons (
  joueur uuid primary key references public.profils (id) on delete cascade,
  solde int not null default 0 check (solde >= 0),
  serie int not null default 0,                 -- jours d'affilée avec le bonus quotidien
  dernier_bonus date,
  dernier_renflouement date,
  jour_entrainement date,
  gains_entrainement int not null default 0,    -- gagnés contre les bots ce jour-là
  cree_le timestamptz not null default now()
);
-- Le journal : chaque mouvement de jetons, avec son motif.
create table if not exists public.mouvements_jetons (
  id bigint generated always as identity primary key,
  joueur uuid not null references public.profils (id) on delete cascade,
  montant int not null,
  motif text not null,
  cree_le timestamptz not null default now()
);
create index if not exists mouvements_jetons_joueur on public.mouvements_jetons (joueur, cree_le desc);

-- Personne ne lit ni n'écrit ces tables directement : tout passe par les fonctions ci-dessous.
alter table public.jetons enable row level security;
alter table public.mouvements_jetons enable row level security;
revoke all on public.jetons, public.mouvements_jetons from anon, authenticated;

create or replace function public._aujourdhui() returns date language sql stable as $$
  select (now() at time zone 'Europe/Paris')::date
$$;
create or replace function public._bonus_du_jour(serie int) returns int language sql immutable as $$
  select least(200, 25 + 25 * greatest(serie, 1))
$$;

-- Ajoute (ou retire, montant négatif) des jetons, et le note au journal. Refuse un solde négatif.
create or replace function public._crediter(p_joueur uuid, p_montant int, p_motif text) returns int
language plpgsql security definer set search_path = public as $$
declare s int;
begin
  update jetons set solde = solde + p_montant where joueur = p_joueur returning solde into s;
  if s is null then raise exception 'Portefeuille introuvable'; end if;
  insert into mouvements_jetons (joueur, montant, motif) values (p_joueur, p_montant, p_motif);
  return s;
exception when check_violation then
  raise exception 'Pas assez de jetons';
end $$;

-- Mon portefeuille, créé (avec les 1 000 jetons de bienvenue) au premier passage.
create or replace function public._mon_portefeuille() returns public.jetons
language plpgsql security definer set search_path = public as $$
declare j public.jetons;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  if not exists (select 1 from profils where id = auth.uid()) then raise exception 'Crée d''abord ton profil'; end if;
  insert into jetons (joueur) values (auth.uid()) on conflict (joueur) do nothing;
  if found then perform _crediter(auth.uid(), 1000, 'bienvenue'); end if;
  select * into j from jetons where joueur = auth.uid() for update;
  return j;
end $$;

-- Ce que l'appli affiche : solde, série, et ce qu'on peut réclamer aujourd'hui.
create or replace function public._etat_jetons(j public.jetons) returns jsonb language sql stable as $$
  select jsonb_build_object(
    'solde', j.solde,
    'serie', case when j.dernier_bonus >= _aujourdhui() - 1 then j.serie else 0 end,
    'bonus_dispo', j.dernier_bonus is distinct from _aujourdhui(),
    'bonus_montant', _bonus_du_jour(case when j.dernier_bonus = _aujourdhui() - 1 then j.serie + 1
                                         when j.dernier_bonus = _aujourdhui() then j.serie + 1 else 1 end),
    'renflouement_dispo', j.solde < 100 and j.dernier_renflouement is distinct from _aujourdhui(),
    'entrainement_restant', 100 - case when j.jour_entrainement = _aujourdhui() then j.gains_entrainement else 0 end)
$$;

create or replace function public.mes_jetons() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  return _etat_jetons(_mon_portefeuille());
end $$;

-- Le bonus quotidien. Renvoie l'état, avec « gagne » : le montant reçu.
create or replace function public.prendre_bonus_quotidien() returns jsonb
language plpgsql security definer set search_path = public as $$
declare j public.jetons; n int; m int;
begin
  j := _mon_portefeuille();
  if j.dernier_bonus = _aujourdhui() then raise exception 'Bonus déjà pris aujourd''hui : reviens demain !'; end if;
  n := case when j.dernier_bonus = _aujourdhui() - 1 then j.serie + 1 else 1 end;
  m := _bonus_du_jour(n);
  update jetons set serie = n, dernier_bonus = _aujourdhui() where joueur = j.joueur;
  perform _crediter(j.joueur, m, 'bonus du jour');
  select * into j from jetons where joueur = j.joueur;
  return _etat_jetons(j) || jsonb_build_object('gagne', m);
end $$;

-- Le renflouement : sous 100 jetons, +200, une fois par jour.
create or replace function public.renflouer() returns jsonb
language plpgsql security definer set search_path = public as $$
declare j public.jetons;
begin
  j := _mon_portefeuille();
  if j.solde >= 100 then raise exception 'Le renflouement est réservé aux soldes de moins de 100 jetons'; end if;
  if j.dernier_renflouement = _aujourdhui() then raise exception 'Renflouement déjà pris aujourd''hui'; end if;
  update jetons set dernier_renflouement = _aujourdhui() where joueur = j.joueur;
  perform _crediter(j.joueur, 200, 'renflouement');
  select * into j from jetons where joueur = j.joueur;
  return _etat_jetons(j) || jsonb_build_object('gagne', 200);
end $$;

-- Une victoire à l'entraînement contre un bot : +10, 100 par jour au plus.
create or replace function public.gain_entrainement() returns jsonb
language plpgsql security definer set search_path = public as $$
declare j public.jetons; deja int; m int;
begin
  j := _mon_portefeuille();
  deja := case when j.jour_entrainement = _aujourdhui() then j.gains_entrainement else 0 end;
  m := least(10, 100 - deja);
  if m > 0 then
    update jetons set jour_entrainement = _aujourdhui(), gains_entrainement = deja + m where joueur = j.joueur;
    perform _crediter(j.joueur, m, 'entraînement');
  end if;
  select * into j from jetons where joueur = j.joueur;
  return _etat_jetons(j) || jsonb_build_object('gagne', m);
end $$;

-- Les fonctions internes ne sont pas appelables depuis l'appli.
revoke execute on function public._crediter(uuid, int, text), public._mon_portefeuille(), public._etat_jetons(public.jetons) from public, anon, authenticated;
revoke execute on function public.mes_jetons(), public.prendre_bonus_quotidien(), public.renflouer(), public.gain_entrainement() from public, anon;
grant execute on function public.mes_jetons(), public.prendre_bonus_quotidien(), public.renflouer(), public.gain_entrainement() to authenticated;
