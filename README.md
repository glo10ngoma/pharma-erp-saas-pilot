# Pharma ERP SaaS V1.0 RC1

ERP pharmaceutique SaaS multi-tenant pour pharmacies, depots, cliniques et reseaux de pharmacies en RDC / Afrique centrale.

## Statut

Version actuelle : **V1.0 RC1**.

La release candidate couvre les workflows metier principaux :

- Authentification JWT.
- Administration utilisateurs, roles, permissions, sites, caisses.
- Referentiel pharmaceutique.
- Achats, lots, stocks, transferts et inventaires.
- POS caisse rapide, barcode-ready, paiements USD/FC.
- Caisse.
- Assurances et creances.
- Comptabilite simplifiee.
- Dashboard BI, rapports, notifications et analyses.

## Stack

- Backend : NestJS + TypeScript.
- Frontend : React + TypeScript + Vite.
- Database : PostgreSQL / Supabase.
- Auth : JWT.
- API : REST + Swagger.
- Deploiement : Railway/Render backend, Vercel frontend, Supabase DB.

## Modules disponibles

### Socle

- Auth.
- Users / Roles / Permissions.
- Sites.
- Parametres.
- Taux de change USD/CDF.
- Audit.

### Referentiel

- Articles.
- Categories.
- Sous-categories.
- Formes galeniques.
- Voies d'administration.
- Types produits.
- Fournisseurs.
- Clients.

### Approvisionnement / Stock

- Achats multi-lignes.
- Lots.
- Stocks.
- Stock a date.
- Transferts inter-sites.
- Inventaires physiques.
- FEFO Intelligence.
- Rotation des rayons.

### Vente / Caisse

- POS rapide.
- Mode caisse.
- Barcode-ready.
- Paiement FC/USD/mixte.
- Facture imprimable.
- Affichage client.
- Sessions caisse.
- Depenses caisse.

### Assurances / Creances

- Organisations.
- Plans assurance.
- Memberships.
- Ventes assurance.
- Creances.
- Paiements de creance.
- Dashboard assurance.
- Bordereaux V2 frontend.
- Litiges V2 frontend.
- Relances.

### Finance

- Plan comptable.
- Journaux.
- Ecritures.
- Grand livre.
- Balance.
- Ecritures automatiques ventes, caisse, creances.

### Pilotage

- Dashboard BI.
- Rapports imprimables.
- Notifications.
- Analyses avancees : ABC/Pareto, rotation, dormants, marges, fournisseurs, vendeurs.

## Prerequis locaux

- Node.js 20+.
- npm.
- PostgreSQL ou Supabase.
- Schema applique depuis `database/schema.sql`.
- Seed DEV ou STAGING applique.

## Initialiser la base DEV

```bash
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seed_dev.sql
```

Le seed DEV cree notamment :

```text
Email: admin@demo.local
Password: admin123
```

Ne jamais commiter de mot de passe reel ni de secret.

## Lancer le backend

```bash
cd backend
npm install
copy .env.example .env
npm run start:dev
```

API locale :

```text
http://localhost:3000/api/v1
http://localhost:3000/docs
```

## Lancer le frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev -- --host 127.0.0.1
```

Application locale :

```text
http://127.0.0.1:5173
```

`VITE_API_URL` pointe vers le backend :

```text
VITE_API_URL=http://localhost:3000/api/v1
```

## Validation

Depuis `frontend/` :

```bash
npm run build
```

Depuis `backend/` :

```bash
npm run build
npm run validate:mvp -- all
npm run validate:v1
npm run validate:rc1
```

`validate:mvp` couvre le noyau historique :

- auth.
- articles.
- achat vers stock.
- vente FEFO.
- session caisse.

`validate:v1` couvre :

- users/roles/sites.
- referentiel.
- achat-stock.
- vente-caisse.
- assurance-creance.
- inventaire.
- comptabilite.
- reporting.

`validate:rc1` orchestre :

- `validate:mvp -- all`.
- `validate:v1`.
- audit de routes critiques frontend.

## Documentation

Guides utilisateurs et techniques :

- [Manuel administrateur](docs/manuals/ADMIN_MANUAL.md)
- [Manuel pharmacien / responsable](docs/manuals/PHARMACIST_MANUAL.md)
- [Manuel caissier](docs/manuals/CASHIER_MANUAL.md)
- [Manuel magasinier](docs/manuals/STOCK_MANAGER_MANUAL.md)
- [Manuel comptable](docs/manuals/ACCOUNTANT_MANUAL.md)
- [Manuel assurances & creances](docs/manuals/INSURANCE_MANUAL.md)
- [Manuel rapports / BI / analyses](docs/manuals/REPORTS_AND_ANALYTICS_MANUAL.md)
- [Guide installation / deploiement](docs/manuals/INSTALLATION_DEPLOYMENT_GUIDE.md)
- [Guide developpeur](docs/manuals/DEVELOPER_GUIDE.md)
- [Vue d'ensemble API](docs/manuals/API_OVERVIEW.md)

Documentation complementaire :

- [UI/UX Guidelines](docs/UI_UX_GUIDELINES.md)
- [Deploiement staging](docs/DEPLOYMENT_STAGING.md)
- [Plan de test RC1](docs/tests/RC1_TEST_PLAN.md)
- [Scenarios RC1](docs/tests/RC1_TEST_SCENARIOS.md)
- [Resultats RC1](docs/tests/RC1_TEST_RESULTS.md)
- [Checklist regression RC1](docs/tests/RC1_REGRESSION_CHECKLIST.md)

## Limites connues V1.0 RC1

- Bordereaux et litiges assurance V2 sont stockes en `localStorage` cote frontend tant que le schema dedie n'existe pas.
- Exports PDF desactives.
- Certaines analyses avancees sont estimatives selon les donnees disponibles.
- Stock a date limite par l'historique `stock_movements`.
- Comptabilite en devise de base USD ; FC utilise pour affichage/encaissement POS avec conversion.
- Taux USD/CDF configurable par tenant.

## Regles critiques

- `tenant_id` vient toujours du JWT.
- `site_id` est controle cote backend.
- Ne jamais modifier le stock sans `stock_movements`.
- Les ventes sortent le stock en FEFO.
- Les lots expires ou bloques ne sont pas vendables.
- Les validations achat/vente/inventaire sont transactionnelles.
- Les actions sensibles creent des `audit_logs`.
- Aucun secret ne doit etre commite.
