-- PCF — Étape 17 : la boutique (apparence seulement, achetée avec des jetons).
--
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run ». Nécessite les étapes 13 et 14.
-- Peut être relancé sans risque.
--
-- Règles : uniquement de l'apparence, jamais d'avantage en match, jamais d'argent réel. Un achat est définitif :
-- pas de remboursement, pas de cadeau à un autre joueur. Vitrine du jour : 3 articles à −30 %, les mêmes pour tous.
-- Le catalogue (noms, images) est dans l'appli : app/js/catalogue.js ; les prix sont ici, un test vérifie qu'ils correspondent.

create table if not exists public.achats (
  joueur uuid not null references public.profils (id) on delete cascade,
  article text not null,
  prix int not null,
  cree_le timestamptz not null default now(),
  primary key (joueur, article)
);
alter table public.achats enable row level security;
revoke all on public.achats from anon, authenticated;

create or replace function public._catalogue() returns table (id text, prix int) language sql immutable as $$
  values ('gant:rose', 300), ('gant:violet', 300), ('gant:noir', 300), ('gant:turquoise', 300),
         ('gantMotif:damier', 800), ('gantMotif:flammes', 800), ('gantMotif:tigre', 800), ('gantMotif:zebre', 800),
         ('gantMotif:coeurs', 800), ('gantMotif:etoiles', 800), ('gantMotif:camouflage', 800), ('gantMotif:carbone', 800),
         ('fond:roland', 800), ('fond:londres', 800), ('fond:neon', 2000), ('fond:coucher', 2000),
         ('fond:stade', 2000), ('fond:galaxie', 5000), ('poignet:tricolore', 300), ('poignet:arcenciel', 800),
         ('poignet:leopard', 800), ('cri:jeu_set_et_main', 800), ('cri:trop_facile', 800), ('cri:ole', 800),
         ('cri:boum', 800), ('cri:le_metier', 800), ('cri:sayonara', 800), ('cri:ca_fait_mal', 800),
         ('cri:le_patron', 800), ('cri:qui_le_patron', 800), ('geste:poing_tremble', 800), ('geste:poing_leve', 800),
         ('geste:salut', 800), ('geste:v_victoire', 2000), ('geste:pouce_leve', 2000), ('geste:doigt_leve', 2000),
         ('geste:uppercut', 5000), ('celebration:etoiles', 2000), ('celebration:coeurs', 2000), ('celebration:eclairs', 2000),
         ('celebration:feu', 2000), ('celebration:or', 5000), ('cadre:bronze', 300), ('cadre:argent', 800),
         ('cadre:neon', 2000), ('cadre:or', 5000)
$$;

-- La vitrine du jour : 3 articles tirés au sort, à −30 % (arrondi à la dizaine).
create or replace function public._vitrine(p_jour date) returns table (id text, prix int, prix_remise int) language sql immutable as $$
  select id, prix, (round(prix * 0.7 / 10) * 10)::int from _catalogue() order by md5(id || p_jour::text) limit 3
$$;

-- La boutique : mes achats, la vitrine du jour et mon solde.
create or replace function public.boutique() returns jsonb
language plpgsql security definer set search_path = public as $$
declare j public.jetons;
begin
  j := _mon_portefeuille();
  return jsonb_build_object(
    'achats', coalesce((select jsonb_agg(article order by cree_le) from achats where joueur = auth.uid()), '[]'::jsonb),
    'vitrine', (select jsonb_agg(jsonb_build_object('id', v.id, 'prix', v.prix, 'prix_remise', v.prix_remise)) from _vitrine(_aujourdhui()) v),
    'solde', j.solde);
end $$;

-- Acheter un article (au prix de la vitrine du jour s'il y est).
create or replace function public.acheter(p_article text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare j public.jetons; p int;
begin
  j := _mon_portefeuille();
  select coalesce(v.prix_remise, c.prix) into p from _catalogue() c left join _vitrine(_aujourdhui()) v on v.id = c.id where c.id = p_article;
  if p is null then raise exception 'Article inconnu'; end if;
  if exists (select 1 from achats where joueur = auth.uid() and article = p_article) then raise exception 'Tu as déjà cet article'; end if;
  if j.solde < p then raise exception 'Pas assez de jetons : il t''en faut % (tu en as %)', p, j.solde; end if;
  insert into achats (joueur, article, prix) values (auth.uid(), p_article, p);
  perform _crediter(auth.uid(), -p, 'boutique');
  return boutique() || jsonb_build_object('achete', p_article, 'prix', p);
end $$;

revoke all on function public._catalogue(), public._vitrine(date) from public, anon, authenticated;
revoke all on function public.boutique(), public.acheter(text) from public, anon;
grant execute on function public.boutique(), public.acheter(text) to authenticated;
