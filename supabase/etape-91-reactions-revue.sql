-- HandSlam — Étape 91 : les réactions sous les articles des Cahiers du HandSlam (👍 👎 😂 🔥 👏).
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Peut être relancé sans risque.
--
-- 26 novembre (exception validée par le porteur du projet) : tout le monde peut réagir, même sans compte. Chaque navigateur tire
-- au hasard un identifiant qu'il garde (app/js/revue-reactions.js) : une réaction de chaque sorte par article et par navigateur,
-- qu'on peut retirer ; 👍 et 👎 s'excluent. Personne ne lit la table directement : seulement les compteurs, par les fonctions.

create table if not exists public.reactions_revue (
  article text not null check (article ~ '^revue-[a-z0-9-]{1,80}$'),   -- le nom de la page, sans « .html »
  appareil uuid not null,
  reaction text not null check (reaction in ('pouce_haut', 'pouce_bas', 'rire', 'feu', 'bravo')),
  cree_le timestamptz not null default now(),
  primary key (article, appareil, reaction)
);
create index if not exists reactions_revue_jour on public.reactions_revue (cree_le);
alter table public.reactions_revue enable row level security;   -- aucune règle : ni lecture ni écriture directe depuis l'appli
revoke all on public.reactions_revue from anon, authenticated;

-- Les compteurs d'un article, et les réactions déjà données par ce navigateur (mien).
create or replace function public.compteurs_revue(p_article text, p_appareil uuid default null)
returns table (cle text, nombre bigint, mien boolean) language sql stable security definer set search_path = public as $$
  select r.reaction, count(*), coalesce(bool_or(r.appareil = p_appareil), false)
  from reactions_revue r where r.article = p_article group by r.reaction
$$;
revoke all on function public.compteurs_revue(text, uuid) from public;
grant execute on function public.compteurs_revue(text, uuid) to anon, authenticated;

-- Donner (p_on = true) ou retirer une réaction ; renvoie les compteurs à jour.
create or replace function public.reagir_revue(p_article text, p_appareil uuid, p_reaction text, p_on boolean)
returns table (cle text, nombre bigint, mien boolean) language plpgsql security definer set search_path = public as $$
begin
  if p_article is null or p_article !~ '^revue-[a-z0-9-]{1,80}$' or p_appareil is null
     or p_reaction is null or p_reaction not in ('pouce_haut', 'pouce_bas', 'rire', 'feu', 'bravo') then
    raise exception 'Réaction invalide.';
  end if;
  if coalesce(p_on, false) then
    -- garde-fous contre les envois en rafale
    if (select count(*) from reactions_revue r where r.cree_le > now() - interval '1 day') >= 3000 then
      raise exception 'Trop de réactions aujourd''hui : réessaie demain.';
    end if;
    if (select count(*) from reactions_revue r where r.appareil = p_appareil and r.cree_le > now() - interval '1 day') >= 100 then
      raise exception 'Tu as déjà beaucoup réagi aujourd''hui : reviens demain.';
    end if;
    if p_reaction in ('pouce_haut', 'pouce_bas') then
      delete from reactions_revue r where r.article = p_article and r.appareil = p_appareil
        and r.reaction = case p_reaction when 'pouce_haut' then 'pouce_bas' else 'pouce_haut' end;
    end if;
    insert into reactions_revue (article, appareil, reaction) values (p_article, p_appareil, p_reaction) on conflict do nothing;
  else
    delete from reactions_revue r where r.article = p_article and r.appareil = p_appareil and r.reaction = p_reaction;
  end if;
  return query select x.cle, x.nombre, x.mien from public.compteurs_revue(p_article, p_appareil) x;
end $$;
revoke all on function public.reagir_revue(text, uuid, text, boolean) from public;
grant execute on function public.reagir_revue(text, uuid, text, boolean) to anon, authenticated;
