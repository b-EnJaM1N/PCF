-- HandSlam — Étape 63 : « Donner ton avis » (Options › 💬 Ton avis sur HandSlam).
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Peut être relancé sans risque.
--
-- 10 novembre : Google demande 14 jours de test fermé de plus et veut voir qu'on recueille l'avis des testeurs. Chacun, avec ou sans
-- compte, peut envoyer une note (de 1 à 5) et/ou un petit mot. Seul le porteur du projet les lit (éditeur SQL) ; personne d'autre
-- ne peut les lire depuis l'appli.

create table if not exists public.avis (
  id bigserial primary key,
  cree_le timestamptz not null default now(),
  joueur uuid,                                   -- (avec un compte) ; sinon vide
  pseudo text,
  note smallint check (note between 1 and 5),
  texte text check (char_length(texte) <= 1000),
  origine text,                                  -- site, android ou installee (comme les visites)
  version text
);
alter table public.avis enable row level security;   -- aucune règle : ni lecture ni écriture directe depuis l'appli
revoke all on public.avis from anon, authenticated;

create or replace function public.donner_avis(p_note int, p_texte text, p_pseudo text default null, p_origine text default null, p_version text default null)
returns void language plpgsql security definer set search_path = public as $$
declare t text := nullif(btrim(coalesce(p_texte, '')), '');
begin
  if (p_note is null or p_note not between 1 and 5) and t is null then raise exception 'Écris un petit mot ou choisis une note.'; end if;
  if p_note is not null and p_note not between 1 and 5 then p_note := null; end if;
  -- garde-fous contre les envois en rafale
  if auth.uid() is not null and (select count(*) from avis where joueur = auth.uid() and cree_le > now() - interval '1 day') >= 10 then
    raise exception 'Merci ! Tu as déjà envoyé beaucoup d''avis aujourd''hui : reviens demain.';
  end if;
  if (select count(*) from avis where cree_le > now() - interval '1 day') >= 500 then raise exception 'Trop d''avis aujourd''hui : réessaie demain.'; end if;
  insert into avis (joueur, pseudo, note, texte, origine, version)
  values (auth.uid(), left(nullif(btrim(coalesce(p_pseudo, '')), ''), 40), p_note, left(t, 1000),
          case when p_origine in ('site', 'android', 'installee') then p_origine end, left(p_version, 20));
end $$;
revoke all on function public.donner_avis(int, text, text, text, text) from public;
grant execute on function public.donner_avis(int, text, text, text, text) to anon, authenticated;
