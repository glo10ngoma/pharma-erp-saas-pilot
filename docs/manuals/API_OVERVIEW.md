# Vue d'ensemble API - ERP Pharmaceutique SaaS V1.0 RC1

Base locale :

```text
http://localhost:3000/api/v1
```

Swagger :

```text
http://localhost:3000/docs
```

## Auth

- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/change-password`

## Articles / Referentiel

- `GET /articles`
- `POST /articles`
- `GET /articles/:id`
- `GET /categories`
- `POST /categories`
- `GET /sub-categories`
- `POST /sub-categories`
- `GET /galenic-forms`
- `GET /administration-routes`
- `GET /product-types`
- `GET /suppliers`
- `GET /customers`

## Achats

- `GET /purchases`
- `POST /purchases`
- `GET /purchases/:id`
- `PATCH /purchases/:id`
- `POST /purchases/:id/items`
- `DELETE /purchases/:id/items/:itemId`
- `POST /purchases/:id/validate`

## Lots / Stocks

- `GET /lots`
- `GET /lots/:id`
- `POST /lots/:id/block`
- `POST /lots/:id/unblock`
- `GET /stocks`
- `GET /stocks/articles/:articleId`
- `GET /stock-movements`

## Transferts

- `GET /transfers`
- `POST /transfers`
- `GET /transfers/:id`
- `POST /transfers/:id/items`
- `POST /transfers/:id/validate`

## Ventes / POS

- `GET /sales`
- `POST /sales`
- `GET /sales/:id`
- `PATCH /sales/:id`
- `POST /sales/:id/items/fefo`
- `DELETE /sales/:id/items/:itemId`
- `POST /sales/:id/apply-insurance`
- `POST /sales/:id/validate`
- `POST /sales/:id/cancel`

## Paiements

- `GET /payments`
- `GET /payments/sale/:saleId`

## Caisse

- `GET /cash/sessions`
- `POST /cash/sessions/open`
- `GET /cash/sessions/current`
- `POST /cash/sessions/:id/close`
- `GET /cash/movements`
- `POST /cash/expenses`

## Inventaires

- `GET /inventories`
- `POST /inventories`
- `GET /inventories/:id`
- `POST /inventories/:id/start`
- `POST /inventories/:id/close`
- `POST /inventories/:id/validate`
- `GET /inventories/:id/items`
- `POST /inventories/:id/items`
- `PATCH /inventories/:id/items/:itemId`

## Finance

- `GET /accounting/accounts`
- `POST /accounting/accounts`
- `GET /accounting/journals`
- `POST /accounting/journals`
- `GET /accounting/entries`
- `GET /accounting/entries/:id`
- `POST /accounting/entries/:id/post`
- `GET /accounting/trial-balance`
- `GET /accounting/general-ledger`

## Assurances / Creances

- `GET /organizations`
- `POST /organizations`
- `GET /organizations/:id`
- `PATCH /organizations/:id`
- `POST /organizations/:id/disable`
- `GET /insurance-plans`
- `POST /insurance-plans`
- `GET /memberships`
- `POST /memberships`
- `GET /customers/:customerId/memberships`
- `GET /receivables`
- `GET /receivables/:id`
- `POST /receivables/:id/pay`
- `GET /receivables/summary`

Note : bordereaux et litiges assurance V2 sont frontend/localStorage en RC1.

## Reports

- `GET /reports/dashboard`
- `GET /reports/sales`
- `GET /reports/stock`
- `GET /reports/margins`
- `GET /reports/cash`
- `GET /reports/receivables`
- `GET /reports/expiry`
- `GET /reports/top-products`

## Settings

- `GET /settings/exchange-rate`
- `PUT /settings/exchange-rate`

## Audit

- `GET /audit`

## Code Generator

- `GET /code-generator/next?entity=...`

## Securite API

- Toutes les routes sauf `/auth/login` sont protegees.
- `tenant_id` vient du JWT.
- `site_id` est controle backend.
- Permissions requises selon module.
