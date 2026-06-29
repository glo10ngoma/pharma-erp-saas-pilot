# Pilot Data Preparation

Date: 28/06/2026

## Objectif

Preparer une base propre pour une pharmacie pilote, sans exposer les donnees techniques creees par les scripts de validation.

## Regle principale

Ne jamais lancer les scripts suivants sur une base pilote:

```bash
npm run validate:mvp -- all
npm run validate:v1
npm run validate:rc1
```

Ces scripts creent volontairement des donnees de test pour verifier les workflows:

- articles;
- lots;
- achats;
- ventes;
- stocks;
- mouvements;
- caisse;
- creances;
- inventaires;
- roles/utilisateurs techniques.

Ils doivent etre executes uniquement sur une base DEV/STAGING/TEST.

## Donnees ciblees par le nettoyage

Le script `database/cleanup_validation_data.sql` cible uniquement les donnees techniques du tenant `DEMO` avec marqueurs explicites:

- prefixes `MVP-`, `V1ART`, `V1LOT`, `V1ROLE`, `V1SUP`, `V1CLI`, `V1ORG`, `V1PLAN`;
- anciens prefixes `S5-`, `S7-`, `S8-`, `S9-`;
- libelles contenant `Sprint`;
- libelles contenant `Debug`;
- libelles contenant `Test validation`;
- libelles contenant `Validation V1` ou `validation MVP`;
- articles de validation inventaire `GAIN` / `LOSS`.

## Donnees preservees

Le nettoyage ne doit pas supprimer:

- vrais articles pharmacie;
- categories metier;
- formes galeniques;
- voies d'administration;
- types produits;
- utilisateurs admin reels;
- roles ADMIN et permissions;
- sites;
- parametres;
- taux de change;
- configuration entreprise.

## Procedure avant pilote

1. Creer une base pilote separee de la base de validation.
2. Appliquer le schema et les migrations.
3. Appliquer uniquement les seeds necessaires au pilote.
4. Importer les articles reels ou le catalogue pilote valide.
5. Verifier admin, tenant, site, role et permissions.
6. Executer le nettoyage si la base a deja servi aux validations:

```bash
psql "$DATABASE_URL" -f database/cleanup_validation_data.sql
```

7. Verifier le SELECT final:
   - `remaining_test_articles_by_code = 0`;
   - `remaining_test_articles_by_name = 0`.
8. Controler manuellement:
   - articles reels visibles;
   - stocks reels conserves;
   - POS affiche les produits pilote;
   - dashboard BI ne contient pas de donnees de validation.

## Import articles reels

Options recommandees:

- utiliser `database/imports/catalogue_articles_template.csv`;
- utiliser `database/seed_articles_catalogue.sql` si le catalogue SQL est valide;
- importer progressivement par lot de produits;
- verifier code article, DCI, dosage, forme, voie, categorie, prix, seuil stock min.

## Validation apres nettoyage

Sur la base pilote:

- ne pas lancer `validate:*`;
- tester manuellement login, articles, achat, stock, POS, caisse.

Sur la base test/staging:

```bash
cd backend
npm run validate:rc1
```

## Rollback

Le script supprime des donnees de validation. Avant execution sur une base ayant servi a des tests:

- faire un backup Supabase;
- exporter les donnees importantes;
- confirmer que les donnees marquees validation ne sont pas necessaires.

