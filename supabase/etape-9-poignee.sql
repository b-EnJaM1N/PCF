-- PCF — Étape 9 : la poignée de main de fin de match.
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 8. Peut être relancé sans risque.
--
-- Principe : à la fin d'un duel, chaque joueur choisit comment il serre la main
-- (franche, normale, légère ou froide). Son adversaire voit son choix.

alter table public.duels add column if not exists poignee0 text check (poignee0 in ('franche', 'normale', 'legere', 'froide'));
alter table public.duels add column if not exists poignee1 text check (poignee1 in ('franche', 'normale', 'legere', 'froide'));

-- Serrer la main : une seule fois, après un duel terminé au score (pas après un forfait ou un abandon).
create or replace function public.serrer_la_main(p_id uuid, p_style text) returns public.duels
language plpgsql security definer set search_path = public as $$
declare d public.duels; moi smallint;
begin
  if p_style is null or p_style not in ('franche', 'normale', 'legere', 'froide') then raise exception 'Poignée de main inconnue'; end if;
  select * into d from duels where id = p_id for update;
  if d.id is null then raise exception 'Duel introuvable'; end if;
  moi := _ma_place(d);
  if d.phase <> 'termine' or d.fin is distinct from 'score' then raise exception 'La poignée de main se fait à la fin du match'; end if;
  if moi = 0 then update duels set poignee0 = coalesce(poignee0, p_style), maj_le = now() where id = p_id returning * into d;
  else update duels set poignee1 = coalesce(poignee1, p_style), maj_le = now() where id = p_id returning * into d; end if;
  return d;
end $$;

revoke all on function public.serrer_la_main(uuid, text) from public, anon;
grant execute on function public.serrer_la_main(uuid, text) to authenticated;
