-- HandSlam — Étape 56 : retrait des surnoms dits par Roland (abandonnés le 3 novembre, décision du porteur du projet ;
-- les surnoms restent écrits dans l'appli). Défait l'étape 55.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Peut être relancé sans risque.

drop table if exists public.surnoms_voix;
-- Le stockage « surnoms » (vide : la fonction n'a jamais enregistré de surnom), seulement s'il ne contient aucun fichier.
delete from storage.buckets where id = 'surnoms' and not exists (select 1 from storage.objects where bucket_id = 'surnoms');
