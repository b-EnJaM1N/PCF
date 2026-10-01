-- Tests de supabase/etape-17-boutique.sql : achat, vitrine du jour, achat définitif et unique, solde insuffisant.
\set QUIET on
\echo Tests de la base de données (étape 17 : boutique)

insert into auth.users values ('00000000-0000-0000-0000-000000000001', 'a@x.fr');
insert into profils (id, pseudo, numero) values ('00000000-0000-0000-0000-000000000001', 'Alice', 0);

create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;
create or replace function pg_temp.interdit(sql text, msg text) returns void language plpgsql as $$
begin
  begin execute sql; exception when others then raise notice 'ok : %', msg; return; end;
  raise exception 'ÉCHEC : accepté alors que ça devait être refusé : %', msg;
end $$;

do $$
declare r jsonb; hors text; v text; prix_v int;
begin
  perform set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
  set role authenticated;
  r := boutique();
  perform pg_temp.verifier((r->>'solde')::int = 1000 and jsonb_array_length(r->'achats') = 0 and jsonb_array_length(r->'vitrine') = 3, 'boutique : 1 000 jetons, rien d''acheté, 3 articles en vitrine');
  v := r->'vitrine'->0->>'id'; prix_v := (r->'vitrine'->0->>'prix_remise')::int;
  perform pg_temp.verifier(prix_v = (round((r->'vitrine'->0->>'prix')::int * 0.7 / 10) * 10)::int, 'vitrine à −30 %');
  reset role;
  select id into hors from _catalogue() where prix = 300 and id not in (select id from _vitrine(_aujourdhui())) limit 1;
  set role authenticated;
  r := acheter(hors);
  perform pg_temp.verifier((r->>'solde')::int = 700 and r->'achats' ? hors, 'achat d''un article à 300');
  perform pg_temp.interdit(format('select acheter(%L)', hors), 'on n''achète pas deux fois le même article');
  perform pg_temp.interdit('select acheter(''gant:licorne'')', 'article inconnu refusé');
  perform pg_temp.interdit('select acheter(''fond:galaxie'')', 'pas assez de jetons pour la galaxie (5 000)');
  if prix_v <= 700 then
    r := acheter(v);
    perform pg_temp.verifier((r->>'prix')::int = prix_v, 'article de la vitrine payé au prix remisé');
  end if;
  perform pg_temp.interdit('insert into achats (joueur, article, prix) values (auth.uid(), ''fond:galaxie'', 0)', 'impossible de s''offrir un article directement');
  reset role;
end $$;
