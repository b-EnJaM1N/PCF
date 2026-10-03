-- HandSlam — Étape 25 : partie rapide à mise contre un bot.
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 24. Peut être relancé sans risque.
--
-- Principe : en partie rapide à mise, si personne n'arrive, le joueur peut jouer contre un bot POUR DE VRAI :
-- le match se joue sur le serveur (le bot joue ses signes lui-même, comme dans les tournois), la mise est prélevée
-- au début, et le joueur qui gagne remporte 1,8 fois la mise. Si le bot gagne, la mise est perdue.
-- Le bot est choisi selon la mise, comme dans les Sit & Go : 50 des faibles, 100-200 des moyens, 500-1 000 des forts.
-- Les bots n'ont pas de jetons : ils ne paient rien et ne gagnent rien. Le match ne compte pas pour le niveau officiel.

-- Les niveaux de bots voulus pour une mise.
create or replace function public._niveaux_bots_mise(p_mise int) returns int4range
language sql immutable as $$
  select case when coalesce(p_mise, 0) = 0 then null
              when p_mise <= 50 then int4range(0, 1100, '[]')
              when p_mise <= 200 then int4range(1000, 1350, '[]')
              else int4range(1250, null) end
$$;

-- Le prélèvement et le règlement des mises (remplace la version de l'étape 14) : un bot ne paie rien et ne gagne rien.
create or replace function public._mise_duel() returns trigger
language plpgsql security definer set search_path = public as $$
declare gain int; i int; joueurs uuid[];
begin
  if new.mise <= 0 then return new; end if;
  joueurs := array[new.j0, new.j1];
  -- Le match commence : les mises sont prélevées.
  if new.phase = 'presentation' and not new.mise_payee and new.j1 is not null then
    for i in 1 .. 2 loop
      continue when _est_bot(joueurs[i]);
      if _solde(joueurs[i]) < new.mise then
        raise exception '%', case when joueurs[i] = auth.uid() then format('Pas assez de jetons pour une mise de %s', new.mise)
                                  else format('Ton adversaire n''a plus assez de jetons pour une mise de %s', new.mise) end;
      end if;
    end loop;
    for i in 1 .. 2 loop
      continue when _est_bot(joueurs[i]);
      perform _crediter(joueurs[i], -new.mise, 'mise de duel');
    end loop;
    new.mise_payee := true;
  end if;
  -- Le match est fini : le gagnant prend la cagnotte (moins la commission). Annulé : chacun récupère sa mise.
  if new.mise_payee and not new.mise_reglee and new.phase in ('termine', 'annule', 'refuse') then
    if new.phase = 'termine' and new.vainqueur is not null then
      if not _est_bot(joueurs[new.vainqueur + 1]) then
        gain := floor(2 * new.mise * (1 - _commission()));
        perform _crediter(joueurs[new.vainqueur + 1], gain, 'gain de duel');
      end if;
    else
      for i in 1 .. 2 loop
        continue when _est_bot(joueurs[i]);
        perform _crediter(joueurs[i], new.mise, 'mise rendue');
      end loop;
    end if;
    new.mise_reglee := true;
  end if;
  return new;
end $$;
drop trigger if exists duels_mise on public.duels;
create trigger duels_mise before insert or update on public.duels for each row execute function public._mise_duel();

-- Partie rapide à mise contre un bot : le duel commence tout de suite (présentation).
create or replace function public.jouer_bot_rapide(p_format text, p_mise int) returns public.duels
language plpgsql security definer set search_path = public as $$
declare moi uuid := auth.uid(); m int := coalesce(p_mise, 0); r int4range; bot uuid; d public.duels;
begin
  if moi is null then raise exception 'Non connecté'; end if;
  if p_format is null or p_format not in ('officiel', 'eclair') then raise exception 'Format inconnu'; end if;
  perform _verifier_mise(m);
  if m <= 0 then raise exception 'Sans mise, le match contre un bot se joue dans l''appli'; end if;
  perform pg_advisory_xact_lock(hashtext('pcf_file_rapide'));
  -- Un adversaire humain m'a trouvé entre-temps : on le laisse gagner la priorité.
  if exists (select 1 from file_rapide where joueur = moi and duel_id is not null) then
    raise exception 'Un adversaire vient d''arriver : relance la recherche';
  end if;
  if exists (select 1 from duels where moi in (j0, j1) and phase in ('presentation', 'jeu', 'entre_sets')) then
    raise exception 'Tu as déjà un duel en cours';
  end if;
  perform _assez_pour(m);
  delete from file_rapide where joueur = moi;

  perform _assurer_bots(0);
  r := _niveaux_bots_mise(m);
  select b.joueur into bot from bots_en_ligne b
  where b.actif
  order by case when r @> b.elo then 0
                when upper(r) is not null and b.elo > upper(r) then b.elo - upper(r)
                else coalesce(lower(r), 0) - b.elo end,
           random()
  limit 1;
  if bot is null then raise exception 'Aucun bot disponible'; end if;

  insert into duels (j0, j1, points_par_set, sets_gagnants, classe, rapide, phase, echeance, mise)
  values (moi, bot, case when p_format = 'officiel' then 11 else 7 end, case when p_format = 'officiel' then 2 else 1 end,
          false, true, 'presentation', now() + _arrivee_rapide(), m)
  returning * into d;
  return d;
end $$;

-- Un joueur a quitté son match contre un bot (plus de signe de vie depuis 90 secondes) : forfait.
-- Remplace la version de l'étape 21 : vaut aussi pour la partie rapide contre un bot.
create or replace function public._veille_bots() returns void
language plpgsql security definer set search_path = public as $$
declare d public.duels; h smallint; vu timestamptz;
begin
  for d in select x.* from duels x where x.phase in ('presentation', 'jeu', 'entre_sets') and (x.tournoi_id is not null or x.rapide)
           and exists (select 1 from bots_en_ligne b where b.joueur in (x.j0, x.j1)) loop
    h := case when _est_bot(d.j0) then 1 else 0 end;
    select p.vu into vu from presences p where p.duel_id = d.id and p.joueur = h;
    if coalesce(vu, d.cree_le) < now() - interval '90 seconds' then
      update duels set phase = 'termine', vainqueur = 1 - h, fin = 'forfait', echeance = null, pause_depuis = null, maj_le = now() where id = d.id;
    end if;
  end loop;
end $$;

revoke all on function public._niveaux_bots_mise(int), public._mise_duel(), public._veille_bots() from public, anon, authenticated;
revoke all on function public.jouer_bot_rapide(text, int) from public, anon;
grant execute on function public.jouer_bot_rapide(text, int) to authenticated;
