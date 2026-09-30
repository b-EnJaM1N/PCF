-- PCF — Étape 8 : la période de calibrage du niveau officiel.
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 7. Peut être relancé sans risque.
-- Si on relance un jour l'étape 4, il faut relancer celle-ci ensuite.
--
-- Principe : pendant ses 10 premiers duels officiels, le niveau d'un joueur bouge deux fois plus vite
-- (il est « provisoire »). Chacun trouve ainsi sa vraie place en une dizaine de matchs.
-- Seul le joueur en calibrage bouge plus vite : son adversaire gagne ou perd comme d'habitude.

create or replace function public._calibrage() returns int language sql immutable as $$ select 10 $$;

-- À la fin d'un duel : mise à jour du niveau des deux joueurs (remplace la version de l'étape 4).
create or replace function public._fin_de_duel() returns trigger
language plpgsql security definer set search_path = public as $$
declare g uuid; p uuid; eg int; ep int; jg int; jp int; v int; vg int; vp int; recents int;
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
  select points, joues into eg, jg from classements where joueur = g;
  select points, joues into ep, jp from classements where joueur = p;
  v := _variation(eg, ep);
  vg := v * case when jg < _calibrage() then 2 else 1 end;   -- le gagnant est en calibrage : il monte deux fois plus vite
  vp := v * case when jp < _calibrage() then 2 else 1 end;   -- le perdant est en calibrage : il descend deux fois plus vite
  update classements set points = eg + vg, joues = joues + 1, gagnes = gagnes + 1, meilleur = greatest(meilleur, eg + vg), maj_le = now() where joueur = g;
  update classements set points = ep - vp, joues = joues + 1, maj_le = now() where joueur = p;
  new.classement_avant := case when new.vainqueur = 0 then array[eg, ep] else array[ep, eg] end;
  new.classement_apres := case when new.vainqueur = 0 then array[eg + vg, ep - vp] else array[ep - vp, eg + vg] end;
  new.classement_motif := null;
  return new;
end $$;

revoke all on function public._fin_de_duel(), public._calibrage() from public, anon, authenticated;
