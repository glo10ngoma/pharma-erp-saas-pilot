# Guide Installation et Deploiement - ERP Pharmaceutique SaaS V1.0 RC1

## Prerequis

- Node.js 20+.
- npm.
- PostgreSQL ou Supabase.
- Compte Supabase.
- Railway ou Render pour backend.
- Vercel pour frontend.

## Structure

- `backend/` : API NestJS.
- `frontend/` : React + Vite.
- `database/` : schema, seeds, migrations.
- `docs/` : documentation.

## Variables backend

Fichier : `backend/.env`.

Exemple public : `backend/.env.example`.

Variables principales :

- `APP_ENV`
- `APP_PORT`
- `PORT`
- `CORS_ORIGINS`
- `FRONTEND_URL`
- `DATABASE_URL`
- `DATABASE_SSL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

Ne jamais commiter `.env`.

## Variables frontend

Fichier local : `frontend/.env`.

Exemple :

```text
VITE_API_URL=http://localhost:3000/api/v1
```

En Vercel :

```text
VITE_API_URL=https://backend.example.com/api/v1
```

## Supabase

1. Creer projet Supabase.
2. Executer `database/schema.sql`.
3. Executer le seed cible :
   - `database/seed_dev.sql`
   - `database/seed_staging.sql`
   - `database/seed_staging_supabase_editor.sql`
   - `database/seed_demo_pharmacy.sql`
4. Verifier tenant, site, admin, permissions.

## Backend Railway / Render

Commandes :

```bash
cd backend
npm install
npm run build
npm start
```

Configurer :

- `PORT` fourni par la plateforme.
- `DATABASE_URL`.
- `JWT_SECRET`.
- `CORS_ORIGINS`.
- variables Supabase.

## Frontend Vercel

Commandes :

```bash
cd frontend
npm install
npm run build
```

Configurer :

- `VITE_API_URL`.

Les routes React doivent etre servies en fallback SPA par Vercel.

## Seeds

DEV :

- tenant DEMO.
- admin local.
- donnees minimales.

STAGING :

- tenant STAGING.
- admin staging.
- permissions V1.

DEMO PHARMACY :

- pharmacie demo.
- produits.
- ventes.
- stocks.
- donnees BI.

## Migrations

Les migrations SQL doivent etre idempotentes lorsque possible.

Ne pas modifier le schema sans justification.

## Validations

Depuis `backend/` :

```bash
npm run build
npm run validate:mvp -- all
npm run validate:v1
npm run validate:rc1
```

Depuis `frontend/` :

```bash
npm run build
```

## Troubleshooting

### Login impossible

- Verifier seed admin.
- Verifier `JWT_SECRET`.
- Verifier permissions ADMIN.
- Verifier URL API frontend.

### CORS

- Verifier `CORS_ORIGINS`.
- Ajouter domaine Vercel.

### Dashboard vide

- Verifier donnees demo.
- Verifier reports endpoints.
- Verifier permissions `reports.*`.

### POS sans article

- Verifier stock disponible.
- Verifier lots non expires/non bloques.
- Verifier site utilisateur.

### Supabase SQL Editor

Utiliser les scripts compatibles Supabase Editor quand ils existent. Ne pas utiliser de syntaxe psql `:variable` dans l'editeur Supabase.

## Limites connues RC1

- PDF desactive.
- Bordereaux/litiges assurance V2 en `localStorage`.
- Certaines analyses estimatives.
- Stock a date limite par historique mouvements.
