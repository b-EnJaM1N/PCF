-- HandSlam — Étape 70 : le pseudo est définitif.
-- À coller dans Supabase : « SQL Editor » → « New query » → coller → « Run »
-- (Supabase peut afficher « Potential issue detected » : c'est normal, confirmer).
-- Nécessite les étapes 2 à 69. Peut être relancé sans risque.
--
-- Décision du porteur du projet (12 novembre) : on ne change plus de pseudo. Il se choisit (ou se confirme) à la création du
-- compte, puis il est fixé pour toujours (le surnom, le pays et l'avatar, eux, se changent toujours).
-- Une seule exception : un pseudo retiré par la modération (il devient « Joueur ») ; le joueur en choisit alors un nouveau,
-- une seule fois (colonne pseudo_libre).
-- Une demande de changement est ignorée sans erreur (le pseudo reste l'ancien) : la fiche, envoyée avec le pseudo, est quand
-- même sauvegardée, même depuis une ancienne version de l'appli.

alter table public.profils add column if not exists pseudo_libre boolean not null default false;

create or replace function public._pseudo_fixe() returns trigger
language plpgsql as $$
begin
  -- Le retrait par la modération (_retirer_pseudo) : le joueur pourra choisir un nouveau pseudo, une fois.
  if coalesce(current_setting('pcf.retrait_pseudo', true), '') = 'on' then
    new.pseudo_libre := true;
    return new;
  end if;
  if new.pseudo is distinct from old.pseudo then
    if old.pseudo_libre then new.pseudo_libre := false;      -- le nouveau pseudo, choisi une fois : il est définitif
    else new.pseudo := old.pseudo; new.pseudo_libre := false; -- définitif : on garde l'ancien
    end if;
  else
    new.pseudo_libre := old.pseudo_libre;                    -- (personne ne se le donne lui-même)
  end if;
  return new;
end $$;

-- (avant le trigger qui attribue le numéro : « profils_a_… » passe avant « profils_numero », dans l'ordre alphabétique)
drop trigger if exists profils_a_pseudo_fixe on public.profils;
create trigger profils_a_pseudo_fixe
  before update on public.profils
  for each row execute function public._pseudo_fixe();

-- Retirer un pseudo (remplace la version de l'étape 10) : en plus, le joueur pourra en choisir un nouveau, une fois.
create or replace function public._retirer_pseudo(p_joueur uuid) returns void
language plpgsql security definer set search_path = public as $$
declare ancien text;
begin
  select pseudo_min into ancien from profils where id = p_joueur;
  if ancien is null then return; end if;
  if ancien <> 'joueur' then insert into pseudos_interdits (pseudo_min) values (ancien) on conflict do nothing; end if;
  perform set_config('pcf.retrait_pseudo', 'on', true);
  update profils set pseudo = 'Joueur', maj_le = now() where id = p_joueur;
  perform set_config('pcf.retrait_pseudo', '', true);
  update signalements set traite = true where joueur = p_joueur and motif = 'pseudo';
end $$;
revoke all on function public._retirer_pseudo(uuid), public._pseudo_fixe() from public, anon, authenticated;

-- Les pseudos déjà retirés (« Joueur ») : ils peuvent en choisir un nouveau.
do $$ begin
  perform set_config('pcf.retrait_pseudo', 'on', true);
  update public.profils set pseudo_libre = true where lower(pseudo) = 'joueur' and not pseudo_libre;
  perform set_config('pcf.retrait_pseudo', '', true);
end $$;
