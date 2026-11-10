-- Tests de supabase/etape-63-avis.sql : on peut donner son avis (avec ou sans compte), personne ne peut le lire depuis l'appli.
\set QUIET on
\echo Tests de la base de données (étape 63 : les avis)

create or replace function pg_temp.verifier(ok boolean, msg text) returns void language plpgsql as $$
begin if not coalesce(ok, false) then raise exception 'ÉCHEC : %', msg; end if; raise notice 'ok : %', msg; end $$;

do $$ declare refuse boolean;
begin
  delete from avis;
  perform donner_avis(5, '  Super appli !  ', 'Testeur', 'android', '2026.11.10');
  perform pg_temp.verifier((select texte from avis) = 'Super appli !' and (select note from avis) = 5 and (select origine from avis) = 'android', 'un avis complet, le mot nettoyé');
  perform donner_avis(3, null);
  perform donner_avis(null, 'Juste un mot');
  perform pg_temp.verifier((select count(*) from avis) = 3, 'une note seule, ou un mot seul');
  begin perform donner_avis(null, '   '); refuse := false; exception when others then refuse := true; end;
  perform pg_temp.verifier(refuse, 'ni note ni mot : refusé');
  perform donner_avis(9, 'Note impossible', null, 'ailleurs');
  perform pg_temp.verifier((select note is null and origine is null from avis where texte = 'Note impossible'), 'une note ou une origine bizarre est ignorée');
  perform pg_temp.verifier(not has_table_privilege('anon', 'public.avis', 'select') and not has_table_privilege('authenticated', 'public.avis', 'select'), 'personne ne lit les avis depuis l''appli');
  perform pg_temp.verifier(has_function_privilege('anon', 'public.donner_avis(int, text, text, text, text)', 'execute'), 'on peut donner son avis sans compte');
end $$;
