-- HandSlam — Étape 73 : le geste « Le pouce levé » retiré de la vente.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Nécessite l'étape 72. Peut être relancé sans risque.
--
-- Décision du porteur du projet (12 novembre) : le dessin du pouce levé n'était pas assez beau ; on le retire de la boutique.
-- Ceux qui l'ont déjà acheté le gardent (rien n'est supprimé). Il ne passe plus dans la vitrine du jour et ne s'achète plus.

-- Les articles retirés de la vente (ils restent au catalogue, pour ceux qui les ont).
create or replace function public._retires() returns setof text language sql immutable as $$
  values ('geste:pouce_leve')
$$;

-- La vitrine du jour (remplace celle de l'étape 72) : sans les articles retirés.
create or replace function public._vitrine(p_jour date) returns table (id text, prix int, prix_remise int) language sql immutable as $$
  select id, prix, (round(prix * 0.7 / 10) * 10)::int from _catalogue()
  where id not in ('gantMotif:club', 'bague:symbole', 'poignet:club',
                   'gantMotif:signe_pierre', 'gantMotif:signe_feuille', 'gantMotif:signe_ciseaux')
    and id not in (select _retires())
  order by md5(id || p_jour::text) limit 3
$$;

-- Acheter (remplace la version de l'étape 17) : un article retiré ne s'achète plus.
create or replace function public.acheter(p_article text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare j public.jetons; p int;
begin
  j := _mon_portefeuille();
  if p_article in (select _retires()) then raise exception 'Cet article n''est plus en vente'; end if;
  select coalesce(v.prix_remise, c.prix) into p from _catalogue() c left join _vitrine(_aujourdhui()) v on v.id = c.id where c.id = p_article;
  if p is null then raise exception 'Article inconnu'; end if;
  if exists (select 1 from achats where joueur = auth.uid() and article = p_article) then raise exception 'Tu as déjà cet article'; end if;
  if j.solde < p then raise exception 'Pas assez de jetons : il t''en faut % (tu en as %)', p, j.solde; end if;
  insert into achats (joueur, article, prix) values (auth.uid(), p_article, p);
  perform _crediter(auth.uid(), -p, 'boutique');
  return boutique() || jsonb_build_object('achete', p_article, 'prix', p);
end $$;

revoke all on function public._retires(), public._catalogue(), public._vitrine(date) from public, anon, authenticated;
revoke all on function public.boutique(), public.acheter(text) from public, anon;
grant execute on function public.boutique(), public.acheter(text) to authenticated;
