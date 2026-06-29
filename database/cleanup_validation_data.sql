-- Nettoyage donnees techniques de validation avant pilote
--
-- Idempotent: peut etre relance plusieurs fois.
-- Scope: tenant DEMO / donnees marquees validation uniquement.
--
-- Ne supprime pas:
-- - utilisateurs, roles, permissions, sites;
-- - categories, formes, voies, types produits;
-- - parametres, taux de change, caisses;
-- - articles metier sans marqueur de validation.

BEGIN;

CREATE TEMP TABLE cleanup_test_articles(article_id UUID PRIMARY KEY) ON COMMIT DROP;
CREATE TEMP TABLE cleanup_test_lots(lot_id UUID PRIMARY KEY) ON COMMIT DROP;
CREATE TEMP TABLE cleanup_test_purchases(purchase_id UUID PRIMARY KEY) ON COMMIT DROP;
CREATE TEMP TABLE cleanup_test_sales(sale_id UUID PRIMARY KEY) ON COMMIT DROP;
CREATE TEMP TABLE cleanup_test_inventories(inventory_id UUID PRIMARY KEY) ON COMMIT DROP;
CREATE TEMP TABLE cleanup_test_transfers(transfer_id UUID PRIMARY KEY) ON COMMIT DROP;
CREATE TEMP TABLE cleanup_test_receivables(receivable_id UUID PRIMARY KEY) ON COMMIT DROP;
CREATE TEMP TABLE cleanup_test_cash_sessions(cash_session_id UUID PRIMARY KEY) ON COMMIT DROP;
CREATE TEMP TABLE cleanup_test_expenses(cash_expense_id UUID PRIMARY KEY) ON COMMIT DROP;
CREATE TEMP TABLE cleanup_test_journal_entries(entry_id UUID PRIMARY KEY) ON COMMIT DROP;
CREATE TEMP TABLE cleanup_test_prescriptions(prescription_id UUID PRIMARY KEY) ON COMMIT DROP;
CREATE TEMP TABLE cleanup_test_disposals(disposal_id UUID PRIMARY KEY) ON COMMIT DROP;

INSERT INTO cleanup_test_articles(article_id)
SELECT a.article_id
FROM articles a
JOIN tenants t ON t.tenant_id = a.tenant_id
WHERE t.tenant_code = 'DEMO'
  AND (
    a.article_code ILIKE 'MVP-%'
    OR a.article_code ILIKE 'V1ART%'
    OR a.article_code ILIKE 'S5-%'
    OR a.article_code ILIKE 'S7-%'
    OR a.article_code ILIKE 'S8-%'
    OR a.article_code ILIKE 'S9-%'
    OR a.article_code ILIKE '%GAIN%'
    OR a.article_code ILIKE '%LOSS%'
    OR a.commercial_name ILIKE '%Sprint%'
    OR a.commercial_name ILIKE '%Debug%'
    OR a.commercial_name ILIKE '%Test validation%'
    OR a.commercial_name ILIKE '%validation MVP%'
    OR a.commercial_name ILIKE '%Validation V1%'
    OR a.commercial_name ILIKE '%Inventaire%Validation%'
    OR a.commercial_name ILIKE '%Inventory%Validation%'
  )
ON CONFLICT DO NOTHING;

INSERT INTO cleanup_test_lots(lot_id)
SELECT DISTINCT l.lot_id
FROM lots l
JOIN cleanup_test_articles ta ON ta.article_id = l.article_id
ON CONFLICT DO NOTHING;

INSERT INTO cleanup_test_lots(lot_id)
SELECT DISTINCT l.lot_id
FROM lots l
JOIN tenants t ON t.tenant_id = l.tenant_id
WHERE t.tenant_code = 'DEMO'
  AND (
    l.lot_number ILIKE 'MVP-%'
    OR l.lot_number ILIKE 'V1LOT%'
    OR l.lot_number ILIKE 'S5-%'
    OR l.lot_number ILIKE 'S7-%'
    OR l.lot_number ILIKE 'S8-%'
    OR l.lot_number ILIKE 'S9-%'
    OR l.lot_number ILIKE '%Sprint%'
    OR l.lot_number ILIKE '%Debug%'
    OR l.lot_number ILIKE '%Validation%'
  )
ON CONFLICT DO NOTHING;

INSERT INTO cleanup_test_purchases(purchase_id)
SELECT DISTINCT pi.purchase_id
FROM purchase_items pi
WHERE pi.article_id IN (SELECT article_id FROM cleanup_test_articles)
   OR pi.lot_number ILIKE 'MVP-%'
   OR pi.lot_number ILIKE 'V1LOT%'
   OR pi.lot_number ILIKE 'S5-%'
   OR pi.lot_number ILIKE 'S7-%'
   OR pi.lot_number ILIKE 'S8-%'
   OR pi.lot_number ILIKE 'S9-%'
ON CONFLICT DO NOTHING;

INSERT INTO cleanup_test_purchases(purchase_id)
SELECT p.purchase_id
FROM purchases p
JOIN tenants t ON t.tenant_id = p.tenant_id
WHERE t.tenant_code = 'DEMO'
  AND (
    p.purchase_number ILIKE 'MVP-%'
    OR p.purchase_number ILIKE 'V1%'
    OR p.purchase_number ILIKE 'S5-%'
    OR p.purchase_number ILIKE 'S7-%'
    OR p.purchase_number ILIKE 'S8-%'
    OR p.purchase_number ILIKE 'S9-%'
  )
ON CONFLICT DO NOTHING;

INSERT INTO cleanup_test_sales(sale_id)
SELECT DISTINCT si.sale_id
FROM sale_items si
WHERE si.article_id IN (SELECT article_id FROM cleanup_test_articles)
   OR si.lot_id IN (SELECT lot_id FROM cleanup_test_lots)
ON CONFLICT DO NOTHING;

INSERT INTO cleanup_test_sales(sale_id)
SELECT s.sale_id
FROM sales s
JOIN tenants t ON t.tenant_id = s.tenant_id
WHERE t.tenant_code = 'DEMO'
  AND (
    s.sale_number ILIKE 'MVP-%'
    OR s.sale_number ILIKE 'V1%'
    OR s.sale_number ILIKE 'S5-%'
    OR s.sale_number ILIKE 'S7-%'
    OR s.sale_number ILIKE 'S8-%'
    OR s.sale_number ILIKE 'S9-%'
  )
ON CONFLICT DO NOTHING;

INSERT INTO cleanup_test_receivables(receivable_id)
SELECT ar.receivable_id
FROM accounts_receivable ar
WHERE ar.sale_id IN (SELECT sale_id FROM cleanup_test_sales)
   OR ar.invoice_number ILIKE 'MVP-%'
   OR ar.invoice_number ILIKE 'V1%'
   OR ar.invoice_number ILIKE 'S5-%'
   OR ar.invoice_number ILIKE 'S7-%'
   OR ar.invoice_number ILIKE 'S8-%'
   OR ar.invoice_number ILIKE 'S9-%'
ON CONFLICT DO NOTHING;

INSERT INTO cleanup_test_prescriptions(prescription_id)
SELECT DISTINCT p.prescription_id
FROM prescriptions p
LEFT JOIN prescription_items pi ON pi.prescription_id = p.prescription_id
LEFT JOIN tenants t ON t.tenant_id = p.tenant_id
WHERE p.sale_id IN (SELECT sale_id FROM cleanup_test_sales)
   OR pi.article_id IN (SELECT article_id FROM cleanup_test_articles)
   OR (
     t.tenant_code = 'DEMO'
     AND (
       p.notes ILIKE '%Validation%'
       OR p.notes ILIKE '%Sprint%'
       OR p.notes ILIKE '%Debug%'
     )
   )
ON CONFLICT DO NOTHING;

INSERT INTO cleanup_test_inventories(inventory_id)
SELECT DISTINCT ii.inventory_id
FROM inventory_items ii
JOIN inventory_sessions inv ON inv.inventory_id = ii.inventory_id
JOIN tenants t ON t.tenant_id = inv.tenant_id
WHERE ii.article_id IN (SELECT article_id FROM cleanup_test_articles)
   OR ii.lot_id IN (SELECT lot_id FROM cleanup_test_lots)
   OR (
     t.tenant_code = 'DEMO'
     AND (
       ii.reason ILIKE '%Validation%'
       OR ii.reason ILIKE '%Sprint%'
       OR ii.reason ILIKE '%Debug%'
     )
   )
ON CONFLICT DO NOTHING;

INSERT INTO cleanup_test_inventories(inventory_id)
SELECT inv.inventory_id
FROM inventory_sessions inv
JOIN tenants t ON t.tenant_id = inv.tenant_id
WHERE t.tenant_code = 'DEMO'
  AND (
    inv.inventory_number ILIKE 'MVP-%'
    OR inv.inventory_number ILIKE 'V1%'
    OR inv.inventory_number ILIKE 'S5-%'
    OR inv.inventory_number ILIKE 'S7-%'
    OR inv.inventory_number ILIKE 'S8-%'
    OR inv.inventory_number ILIKE 'S9-%'
    OR inv.notes ILIKE '%Validation%'
    OR inv.notes ILIKE '%Sprint%'
    OR inv.notes ILIKE '%Debug%'
  )
ON CONFLICT DO NOTHING;

INSERT INTO cleanup_test_transfers(transfer_id)
SELECT DISTINCT ti.transfer_id
FROM stock_transfer_items ti
WHERE ti.article_id IN (SELECT article_id FROM cleanup_test_articles)
   OR ti.lot_id IN (SELECT lot_id FROM cleanup_test_lots)
ON CONFLICT DO NOTHING;

INSERT INTO cleanup_test_disposals(disposal_id)
SELECT DISTINCT sdi.disposal_id
FROM stock_disposal_items sdi
JOIN stock_disposals sd ON sd.disposal_id = sdi.disposal_id
JOIN tenants t ON t.tenant_id = sd.tenant_id
WHERE sdi.article_id IN (SELECT article_id FROM cleanup_test_articles)
   OR sdi.lot_id IN (SELECT lot_id FROM cleanup_test_lots)
   OR (
     t.tenant_code = 'DEMO'
     AND (
       sdi.reason ILIKE '%Validation%'
       OR sdi.reason ILIKE '%Sprint%'
       OR sdi.reason ILIKE '%Debug%'
     )
   )
ON CONFLICT DO NOTHING;

INSERT INTO cleanup_test_transfers(transfer_id)
SELECT tr.transfer_id
FROM stock_transfers tr
JOIN tenants t ON t.tenant_id = tr.tenant_id
WHERE t.tenant_code = 'DEMO'
  AND (
    tr.transfer_number ILIKE 'MVP-%'
    OR tr.transfer_number ILIKE 'V1%'
    OR tr.transfer_number ILIKE 'S5-%'
    OR tr.transfer_number ILIKE 'S7-%'
    OR tr.transfer_number ILIKE 'S8-%'
    OR tr.transfer_number ILIKE 'S9-%'
    OR tr.notes ILIKE '%Validation%'
    OR tr.notes ILIKE '%Sprint%'
    OR tr.notes ILIKE '%Debug%'
  )
ON CONFLICT DO NOTHING;

INSERT INTO cleanup_test_cash_sessions(cash_session_id)
SELECT DISTINCT cm.cash_session_id
FROM cash_movements cm
JOIN tenants t ON t.tenant_id = cm.tenant_id
WHERE cm.reference_id IN (
  SELECT sale_id FROM cleanup_test_sales
  UNION
  SELECT receivable_id FROM cleanup_test_receivables
)
   OR (
     t.tenant_code = 'DEMO'
     AND (
       cm.description ILIKE '%Validation%'
       OR cm.description ILIKE '%Sprint%'
       OR cm.description ILIKE '%Debug%'
     )
   )
ON CONFLICT DO NOTHING;

INSERT INTO cleanup_test_expenses(cash_expense_id)
SELECT ce.cash_expense_id
FROM cash_expenses ce
JOIN tenants t ON t.tenant_id = ce.tenant_id
WHERE t.tenant_code = 'DEMO'
  AND (
    ce.expense_number ILIKE 'MVP-%'
    OR ce.expense_number ILIKE 'V1%'
    OR ce.expense_category ILIKE '%Validation%'
    OR ce.description ILIKE '%Validation%'
    OR ce.description ILIKE '%Sprint%'
    OR ce.description ILIKE '%Debug%'
  )
ON CONFLICT DO NOTHING;

INSERT INTO cleanup_test_cash_sessions(cash_session_id)
SELECT DISTINCT ce.cash_session_id
FROM cash_expenses ce
WHERE ce.cash_expense_id IN (SELECT cash_expense_id FROM cleanup_test_expenses)
ON CONFLICT DO NOTHING;

INSERT INTO cleanup_test_journal_entries(entry_id)
SELECT je.entry_id
FROM journal_entries je
JOIN tenants t ON t.tenant_id = je.tenant_id
WHERE je.reference_id IN (
  SELECT purchase_id FROM cleanup_test_purchases
  UNION
  SELECT sale_id FROM cleanup_test_sales
  UNION
  SELECT receivable_id FROM cleanup_test_receivables
  UNION
  SELECT inventory_id FROM cleanup_test_inventories
  UNION
  SELECT transfer_id FROM cleanup_test_transfers
  UNION
  SELECT cash_expense_id FROM cleanup_test_expenses
)
   OR (
     t.tenant_code = 'DEMO'
     AND (
       je.description ILIKE '%Validation%'
       OR je.description ILIKE '%Sprint%'
       OR je.description ILIKE '%Debug%'
     )
   )
ON CONFLICT DO NOTHING;

DELETE FROM journal_entry_lines
WHERE entry_id IN (SELECT entry_id FROM cleanup_test_journal_entries);

DELETE FROM journal_entries
WHERE entry_id IN (SELECT entry_id FROM cleanup_test_journal_entries);

DELETE FROM cash_movements
WHERE reference_id IN (
  SELECT sale_id FROM cleanup_test_sales
  UNION
  SELECT receivable_id FROM cleanup_test_receivables
  UNION
  SELECT cash_expense_id FROM cleanup_test_expenses
)
OR cash_session_id IN (SELECT cash_session_id FROM cleanup_test_cash_sessions)
OR (
  tenant_id IN (SELECT tenant_id FROM tenants WHERE tenant_code = 'DEMO')
  AND (
    description ILIKE '%Validation%'
    OR description ILIKE '%Sprint%'
    OR description ILIKE '%Debug%'
  )
);

DELETE FROM cash_expenses
WHERE cash_expense_id IN (SELECT cash_expense_id FROM cleanup_test_expenses);

DELETE FROM cash_reconciliations
WHERE cash_session_id IN (SELECT cash_session_id FROM cleanup_test_cash_sessions);

DELETE FROM cash_denominations
WHERE cash_session_id IN (SELECT cash_session_id FROM cleanup_test_cash_sessions);

DELETE FROM cash_sessions
WHERE cash_session_id IN (SELECT cash_session_id FROM cleanup_test_cash_sessions);

DELETE FROM receivable_payments
WHERE receivable_id IN (SELECT receivable_id FROM cleanup_test_receivables);

DELETE FROM accounts_receivable
WHERE receivable_id IN (SELECT receivable_id FROM cleanup_test_receivables);

DELETE FROM payments
WHERE sale_id IN (SELECT sale_id FROM cleanup_test_sales);

DELETE FROM prescription_items
WHERE prescription_id IN (SELECT prescription_id FROM cleanup_test_prescriptions)
   OR article_id IN (SELECT article_id FROM cleanup_test_articles);

DELETE FROM prescriptions
WHERE prescription_id IN (SELECT prescription_id FROM cleanup_test_prescriptions)
   OR sale_id IN (SELECT sale_id FROM cleanup_test_sales);

DELETE FROM sale_items
WHERE sale_id IN (SELECT sale_id FROM cleanup_test_sales);

DELETE FROM sales
WHERE sale_id IN (SELECT sale_id FROM cleanup_test_sales);

DELETE FROM purchase_items
WHERE purchase_id IN (SELECT purchase_id FROM cleanup_test_purchases);

DELETE FROM purchases
WHERE purchase_id IN (SELECT purchase_id FROM cleanup_test_purchases);

DELETE FROM inventory_items
WHERE inventory_id IN (SELECT inventory_id FROM cleanup_test_inventories);

DELETE FROM inventory_sessions
WHERE inventory_id IN (SELECT inventory_id FROM cleanup_test_inventories);

DELETE FROM stock_transfer_items
WHERE transfer_id IN (SELECT transfer_id FROM cleanup_test_transfers);

DELETE FROM stock_transfers
WHERE transfer_id IN (SELECT transfer_id FROM cleanup_test_transfers);

DELETE FROM stock_disposal_items
WHERE disposal_id IN (SELECT disposal_id FROM cleanup_test_disposals)
   OR article_id IN (SELECT article_id FROM cleanup_test_articles)
   OR lot_id IN (SELECT lot_id FROM cleanup_test_lots);

DELETE FROM stock_disposals
WHERE disposal_id IN (SELECT disposal_id FROM cleanup_test_disposals);

DELETE FROM stock_movements
WHERE article_id IN (SELECT article_id FROM cleanup_test_articles)
   OR lot_id IN (SELECT lot_id FROM cleanup_test_lots)
   OR reference_id IN (
     SELECT purchase_id FROM cleanup_test_purchases
     UNION
     SELECT sale_id FROM cleanup_test_sales
     UNION
     SELECT inventory_id FROM cleanup_test_inventories
     UNION
     SELECT transfer_id FROM cleanup_test_transfers
   )
   OR (
     tenant_id IN (SELECT tenant_id FROM tenants WHERE tenant_code = 'DEMO')
     AND (
       notes ILIKE '%Validation%'
       OR notes ILIKE '%Sprint%'
       OR notes ILIKE '%Debug%'
     )
   );

DELETE FROM stocks
WHERE lot_id IN (SELECT lot_id FROM cleanup_test_lots);

DELETE FROM stock_alerts
WHERE article_id IN (SELECT article_id FROM cleanup_test_articles);

DELETE FROM expiry_alerts
WHERE lot_id IN (SELECT lot_id FROM cleanup_test_lots);

DELETE FROM article_price_history
WHERE article_id IN (SELECT article_id FROM cleanup_test_articles)
   OR lot_id IN (SELECT lot_id FROM cleanup_test_lots)
   OR (
     tenant_id IN (SELECT tenant_id FROM tenants WHERE tenant_code = 'DEMO')
     AND (
       change_reason ILIKE '%Validation%'
       OR change_reason ILIKE '%Sprint%'
       OR change_reason ILIKE '%Debug%'
     )
   );

DELETE FROM lots
WHERE lot_id IN (SELECT lot_id FROM cleanup_test_lots);

DELETE FROM articles
WHERE article_id IN (SELECT article_id FROM cleanup_test_articles);

DELETE FROM customer_memberships cm
USING customers c, tenants t
WHERE cm.customer_id = c.customer_id
  AND c.tenant_id = t.tenant_id
  AND t.tenant_code = 'DEMO'
  AND (
    c.customer_code ILIKE 'V1CLI%'
    OR c.customer_name ILIKE '%Validation%'
    OR c.customer_name ILIKE '%Sprint%'
    OR c.customer_name ILIKE '%Debug%'
  );

DELETE FROM insurance_plans ip
USING organizations o, tenants t
WHERE ip.organization_id = o.organization_id
  AND o.tenant_id = t.tenant_id
  AND t.tenant_code = 'DEMO'
  AND (
    ip.plan_code ILIKE 'V1PLAN%'
    OR ip.plan_name ILIKE '%Validation%'
    OR ip.plan_name ILIKE '%Sprint%'
    OR ip.plan_name ILIKE '%Debug%'
  );

DELETE FROM organizations o
USING tenants t
WHERE o.tenant_id = t.tenant_id
  AND t.tenant_code = 'DEMO'
  AND (
    o.organization_code ILIKE 'V1ORG%'
    OR o.organization_name ILIKE '%Validation%'
    OR o.organization_name ILIKE '%Sprint%'
    OR o.organization_name ILIKE '%Debug%'
  );

DELETE FROM customers c
USING tenants t
WHERE c.tenant_id = t.tenant_id
  AND t.tenant_code = 'DEMO'
  AND (
    c.customer_code ILIKE 'V1CLI%'
    OR c.customer_name ILIKE '%Validation%'
    OR c.customer_name ILIKE '%Sprint%'
    OR c.customer_name ILIKE '%Debug%'
  );

DELETE FROM suppliers s
USING tenants t
WHERE s.tenant_id = t.tenant_id
  AND t.tenant_code = 'DEMO'
  AND (
    s.supplier_code ILIKE 'MVP-SUP-%'
    OR s.supplier_code ILIKE 'V1SUP%'
    OR s.supplier_name ILIKE '%Validation%'
    OR s.supplier_name ILIKE '%Sprint%'
    OR s.supplier_name ILIKE '%Debug%'
  );

DELETE FROM users u
USING tenants t
WHERE u.tenant_id = t.tenant_id
  AND t.tenant_code = 'DEMO'
  AND (
    u.username ILIKE 'agent.v1.%'
    OR u.email ILIKE 'agent.v1.%@demo.local'
    OR u.full_name ILIKE '%Validation V1%'
  );

DELETE FROM role_permissions rp
USING roles r, tenants t
WHERE rp.role_id = r.role_id
  AND r.tenant_id = t.tenant_id
  AND t.tenant_code = 'DEMO'
  AND r.role_name ILIKE 'V1_ROLE_%';

DELETE FROM roles r
USING tenants t
WHERE r.tenant_id = t.tenant_id
  AND t.tenant_code = 'DEMO'
  AND r.role_name ILIKE 'V1_ROLE_%';

COMMIT;

SELECT
  COUNT(*) FILTER (WHERE a.article_code ILIKE 'MVP-%' OR a.article_code ILIKE 'V1ART%' OR a.article_code ILIKE 'S5-%' OR a.article_code ILIKE 'S7-%' OR a.article_code ILIKE 'S8-%' OR a.article_code ILIKE 'S9-%') AS remaining_test_articles_by_code,
  COUNT(*) FILTER (WHERE a.commercial_name ILIKE '%Sprint%' OR a.commercial_name ILIKE '%Debug%' OR a.commercial_name ILIKE '%Test validation%' OR a.commercial_name ILIKE '%Validation V1%' OR a.commercial_name ILIKE '%validation MVP%') AS remaining_test_articles_by_name
FROM articles a
JOIN tenants t ON t.tenant_id = a.tenant_id
WHERE t.tenant_code = 'DEMO';
