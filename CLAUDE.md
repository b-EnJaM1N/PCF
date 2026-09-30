# Consignes pour Claude (projet HandSlam)

## Le porteur du projet
- Il est français, non-développeur, sur un téléphone Android. Explique simplement, en français, une étape à la fois.
- **Demande-lui avant tout choix qui coûte de l'argent ou qui est difficile à changer ensuite.**
- **Aucun mot de passe ni clé secrète dans le code : le projet GitHub est public.** (La clé « publishable » de Supabase dans `app/js/config.js` est publique par nature.)
- Quand il faut coller du SQL dans Supabase depuis son téléphone, donne un lien `raw.githubusercontent.com` vers le fichier, ou une requête sur une seule ligne (le collage de plusieurs lignes se passe mal sur téléphone). Éditeur SQL : https://supabase.com/dashboard/project/fvfdcyglwngosxfougje/sql/new

## Façon de travailler
- On travaille sur la branche indiquée par la session, on pousse, puis on donne le lien de test https://handslam.fr/preview/ et on ouvre une demande de fusion (dépôt b-EnJaM1N/PCF). Il valide lui-même la fusion → version officielle https://handslam.fr/.
- Après une fusion, repartir de `origin/main` (même nom de branche). Toujours `git fetch` pour vérifier si la fusion a eu lieu avant de lui demander de valider.
- Avant de pousser : `npm test` (tests de l'appli). Les tests de la base (`tests/base-de-donnees/lancer.sh`) demandent un PostgreSQL local. Après un changement de répliques : `npm run script-voix`.
- Tout nouveau fichier de l'appli doit être ajouté à la liste de `app/sw.js` (un test le vérifie).
- L'appli : JavaScript sans étape de compilation (`app/`), base et serveur : Supabase (`supabase/`, étapes SQL numérotées + LISEZMOI.md), fonction « Notifier » (N majuscule).

## Où en est le projet
Voir `docs/feuille-de-route.md` (étapes faites, décisions, prochain lot à faire).
