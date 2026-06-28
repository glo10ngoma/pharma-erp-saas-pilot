# Manuel Administrateur - ERP Pharmaceutique SaaS V1.0 RC1

## Public

Ce manuel s'adresse aux administrateurs tenant, managers techniques et responsables de deploiement local.

## Connexion

1. Ouvrir l'application frontend.
2. Saisir l'email et le mot de passe fournis.
3. Apres connexion, un administrateur arrive normalement sur le Dashboard BI.
4. En cas de session expiree, se reconnecter depuis `/login`.

Bonnes pratiques :

- Ne jamais partager un compte administrateur.
- Changer les mots de passe temporaires.
- Se deconnecter sur poste partage.

## Utilisateurs

Menu : `Administration > Utilisateurs`.

Fonctions disponibles :

- Consulter la liste des utilisateurs.
- Rechercher par nom, email, role ou site.
- Creer un utilisateur si permission accordee.
- Associer un utilisateur a un role et a un site.
- Exporter les donnees en Excel, CSV ou JSON.

Regles importantes :

- Le site affecte limite les donnees visibles lorsque le backend applique `site_id`.
- Ne jamais creer deux comptes pour une meme personne sans justification.
- Desactiver un utilisateur sorti de l'organisation plutot que reutiliser son compte.

## Roles

Menu : `Administration > Roles`.

Un role regroupe des permissions metier. Exemple : `ADMIN`, `MANAGER`, `VENDEUR`.

Verifier :

- Nom du role.
- Nombre de permissions.
- Permissions sensibles : ventes, caisse, finance, parametrage.

## Permissions

Menu : `Administration > Permissions`.

Les permissions controlent l'affichage des menus et les endpoints backend.

Exemples :

- `articles.read`
- `sales.create`
- `cash_sessions.open`
- `accounting.read`
- `reports.dashboard`
- `settings.exchange_rate.update`

Bonne pratique :

- Donner le minimum necessaire.
- Limiter `accounting.*`, `settings.*` et `permissions.*` aux profils de confiance.

## Sites

Menu : `Administration > Sites`.

Un site represente une pharmacie, un depot ou une antenne.

Verifier :

- Code site.
- Nom site.
- Statut actif.
- Utilisateurs rattaches.

Le POS utilise le `siteId` du profil utilisateur. Le vendeur ne doit pas choisir manuellement son site a chaque vente.

## Caisses

Menu : `Administration > Caisses`.

Permet de consulter les caisses disponibles, leur site et leur devise.

Points de controle :

- Une caisse active par site au minimum.
- Devise coherente.
- Sessions ouvertes visibles dans le module Caisse.

## Taux de change

Menu : `Administration > Taux de change` ou `Parametres > Taux de change`.

Le taux USD/CDF est configurable par tenant.

Regle V1.0 RC1 :

- Comptabilite interne en USD.
- POS affiche et encaisse aussi en FC.
- Le taux courant est utilise par le POS pour convertir les montants FC/USD.

Seuls ADMIN/MANAGER ou profils autorises doivent modifier ce taux.

## Parametres generaux

Menu : `Administration > Parametres generaux`.

V1.0 RC1 expose surtout des informations de configuration :

- Devise de base : USD.
- Devise client RDC : CDF/FC.
- Nom application.
- Parametres disponibles selon environnement.

## Audit

Menu : `Administration > Journaux audit`.

Les logs d'audit aident a suivre les actions sensibles :

- Validations achat.
- Validations vente.
- Paiements creance.
- Inventaires.
- Modifications sensibles.

Utiliser la recherche et les filtres pour investiguer un evenement.

## Sauvegardes

Menu : `Administration > Sauvegardes`.

V1.0 RC1 ne declenche pas de dump base complet depuis le frontend.

Les sauvegardes reelles dependent de Supabase/Railway ou de l'environnement d'hebergement.

La page peut exporter une configuration applicative non sensible.

## Bonnes pratiques administrateur

- Appliquer les seeds uniquement sur l'environnement cible prevu.
- Ne jamais commiter `.env` ni secrets.
- Tester `validate:mvp`, `validate:v1` et `validate:rc1` avant release.
- Garder les permissions ADMIN limitees.
- Verifier les comptes inactifs chaque mois.
- Verifier le taux USD/CDF avant ouverture caisse.
- Conserver les guides dans `docs/manuals/` a jour.

## Limites connues

- Les bordereaux et litiges assurance V2 sont stockes localement cote frontend tant que le schema dedie n'existe pas.
- Les exports PDF sont desactives.
- Certaines analyses avancees sont estimatives.
- Le stock a date depend de l'historique disponible dans `stock_movements`.
