-- Correctif libelles referentiel demo/staging
-- Objectif: retirer le prefixe "Demo " des libelles metier deja inserees.
-- Ne modifie pas les codes techniques, les ids, ni les relations articles/referentiels.

BEGIN;

UPDATE categories c
SET category_name = regexp_replace(c.category_name, '^Demo\s+', '', 'i')
FROM tenants t
WHERE c.tenant_id = t.tenant_id
  AND t.tenant_code IN ('PHARMACIE_DEMO', 'STAGING')
  AND c.category_name ~* '^Demo\s+';

UPDATE sub_categories sc
SET sub_category_name = regexp_replace(sc.sub_category_name, '^Demo\s+', '', 'i')
FROM tenants t
WHERE sc.tenant_id = t.tenant_id
  AND t.tenant_code IN ('PHARMACIE_DEMO', 'STAGING')
  AND sc.sub_category_name ~* '^Demo\s+';

UPDATE galenic_forms gf
SET form_name = regexp_replace(gf.form_name, '^Demo\s+', '', 'i')
FROM tenants t
WHERE gf.tenant_id = t.tenant_id
  AND t.tenant_code IN ('PHARMACIE_DEMO', 'STAGING')
  AND gf.form_name ~* '^Demo\s+';

UPDATE administration_routes ar
SET route_name = regexp_replace(ar.route_name, '^Demo\s+', '', 'i')
FROM tenants t
WHERE ar.tenant_id = t.tenant_id
  AND t.tenant_code IN ('PHARMACIE_DEMO', 'STAGING')
  AND ar.route_name ~* '^Demo\s+';

UPDATE product_types pt
SET type_name = regexp_replace(pt.type_name, '^Demo\s+', '', 'i')
FROM tenants t
WHERE pt.tenant_id = t.tenant_id
  AND t.tenant_code IN ('PHARMACIE_DEMO', 'STAGING')
  AND pt.type_name ~* '^Demo\s+';

COMMIT;

SELECT
  t.tenant_code,
  (SELECT COUNT(*) FROM categories c WHERE c.tenant_id = t.tenant_id AND c.category_name ~* '^Demo\s+') AS demo_categories,
  (SELECT COUNT(*) FROM sub_categories sc WHERE sc.tenant_id = t.tenant_id AND sc.sub_category_name ~* '^Demo\s+') AS demo_sub_categories,
  (SELECT COUNT(*) FROM galenic_forms gf WHERE gf.tenant_id = t.tenant_id AND gf.form_name ~* '^Demo\s+') AS demo_forms,
  (SELECT COUNT(*) FROM administration_routes ar WHERE ar.tenant_id = t.tenant_id AND ar.route_name ~* '^Demo\s+') AS demo_routes,
  (SELECT COUNT(*) FROM product_types pt WHERE pt.tenant_id = t.tenant_id AND pt.type_name ~* '^Demo\s+') AS demo_product_types
FROM tenants t
WHERE t.tenant_code IN ('PHARMACIE_DEMO', 'STAGING')
ORDER BY t.tenant_code;
