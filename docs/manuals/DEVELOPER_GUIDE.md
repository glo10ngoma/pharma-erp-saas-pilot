# Guide Developpeur - ERP Pharmaceutique SaaS V1.0 RC1

## Architecture

Application SaaS multi-tenant pour pharmacies, depots, cliniques et reseaux.

Stack :

- Backend : NestJS + TypeScript.
- Frontend : React + TypeScript + Vite.
- Database : PostgreSQL / Supabase.
- Auth : JWT.
- API : REST + Swagger.

## Backend NestJS

Structure :

- `src/auth`
- `src/users`
- `src/roles`
- `src/permissions`
- `src/sites`
- `src/articles`
- `src/purchases`
- `src/lots`
- `src/stocks`
- `src/sales`
- `src/cash`
- `src/receivables`
- `src/accounting`
- `src/reports`
- `src/settings`

Regles :

- `tenant_id` vient du JWT.
- Le frontend ne doit pas fournir `tenant_id` comme source de verite.
- `site_id` est controle backend.
- Les permissions sont verifiees par guard.
- Les validations critiques sont backend.
- Les operations stock sont transactionnelles.

## Frontend React

Structure :

- `src/modules` : pages metier.
- `src/services` : clients API.
- `src/layouts` : layout principal.
- `src/components` : composants partages.
- `src/utils` : formatage, exports.

Conventions :

- Utiliser `formatMoney`.
- Utiliser `formatDate`.
- Garder les tables compactes.
- Respecter light/dark.
- Creation simple en modal.
- Flux complexe en page complete.

## Supabase / PostgreSQL

Principes :

- tables metier avec `tenant_id`.
- stocks modifies uniquement via mouvements.
- ventes en FEFO.
- lots expires/bloques non vendables.
- audit logs pour actions sensibles.

## Auth JWT

Endpoints :

- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/change-password`

Le frontend stocke :

- accessToken.
- currentUser.

Au reload, `/auth/me` restaure les permissions.

## Permissions

Exemples :

- `articles.read`
- `purchases.validate`
- `sales.create`
- `cash_sessions.open`
- `receivables.pay`
- `accounting.read`
- `reports.dashboard`
- `settings.exchange_rate.update`

Ne pas afficher une action frontend sans permission, mais toujours valider cote backend.

## Scripts

Backend :

```bash
npm run build
npm run validate:mvp -- all
npm run validate:v1
npm run validate:rc1
```

Frontend :

```bash
npm run build
```

## Regles de non-regression

- Ne pas casser POS.
- Ne pas casser Achats.
- Ne pas casser Stocks.
- Ne pas casser Inventaires.
- Ne pas casser Finance.
- Ne pas casser Dashboard BI.
- Ne pas casser Rapports.
- Ne pas casser Notifications.
- Ne pas casser Analyses.

Avant merge :

1. Build frontend.
2. Build backend.
3. validate:mvp.
4. validate:v1.
5. validate:rc1.

## Limites connues

- Bordereaux/litiges assurance V2 sont frontend localStorage.
- PDF desactive.
- Analyses V1.1 estimatives.
- Stock a date limite par historique mouvements.
- Multi-devise comptable complet non implemente : USD reste base.

## Bonnes pratiques

- Correction minimale en phase RC.
- Pas de refactor sans demande explicite.
- Documenter tout bug avant correction.
- Ne jamais commiter secrets.
- Ne pas modifier le schema sans justification.
