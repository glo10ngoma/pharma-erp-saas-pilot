-- Migration: remove Demo prefix from reference labels.
--
-- Stability rules:
-- - Does not modify ids, UUIDs, codes, tenant_id, or foreign keys.
-- - Only label columns are updated.
-- - Idempotent: can be executed multiple times.
-- - Handles the current V1 schema where some labels are globally UNIQUE.
--
-- Conflict strategy:
-- If "Demo Antalgiques" should become "Antalgiques" but another row already
-- owns the globally-unique label "Antalgiques", the existing owner is renamed
-- to "Antalgiques [xxxxxxxx]" using its own stable id suffix. The row that
-- started with "Demo " then receives the clean business label.

BEGIN;

-- Categories: category_name is globally unique in schema V3.
WITH demo_rows AS (
  SELECT
    c.category_id AS demo_id,
    regexp_replace(c.category_name, '^Demo\s+', '', 'i') AS clean_label
  FROM categories c
  WHERE c.category_name ~* '^Demo\s+'
),
conflicts AS (
  SELECT
    existing.category_id AS conflict_id,
    d.clean_label
  FROM demo_rows d
  JOIN categories existing
    ON existing.category_name = d.clean_label
   AND existing.category_id <> d.demo_id
)
UPDATE categories c
SET category_name = left(conflicts.clean_label, 137) || ' [' || left(conflicts.conflict_id::text, 8) || ']'
FROM conflicts
WHERE c.category_id = conflicts.conflict_id;

UPDATE categories c
SET category_name = regexp_replace(c.category_name, '^Demo\s+', '', 'i')
WHERE c.category_name ~* '^Demo\s+'
  AND NOT EXISTS (
    SELECT 1
    FROM categories existing
    WHERE existing.category_name = regexp_replace(c.category_name, '^Demo\s+', '', 'i')
      AND existing.category_id <> c.category_id
  );

-- Sub-categories: uniqueness is scoped by category_id.
WITH demo_rows AS (
  SELECT
    sc.sub_category_id AS demo_id,
    sc.category_id,
    regexp_replace(sc.sub_category_name, '^Demo\s+', '', 'i') AS clean_label
  FROM sub_categories sc
  WHERE sc.sub_category_name ~* '^Demo\s+'
),
conflicts AS (
  SELECT
    existing.sub_category_id AS conflict_id,
    d.clean_label
  FROM demo_rows d
  JOIN sub_categories existing
    ON existing.category_id = d.category_id
   AND existing.sub_category_name = d.clean_label
   AND existing.sub_category_id <> d.demo_id
)
UPDATE sub_categories sc
SET sub_category_name = left(conflicts.clean_label, 137) || ' [' || left(conflicts.conflict_id::text, 8) || ']'
FROM conflicts
WHERE sc.sub_category_id = conflicts.conflict_id;

UPDATE sub_categories sc
SET sub_category_name = regexp_replace(sc.sub_category_name, '^Demo\s+', '', 'i')
WHERE sc.sub_category_name ~* '^Demo\s+'
  AND NOT EXISTS (
    SELECT 1
    FROM sub_categories existing
    WHERE existing.category_id = sc.category_id
      AND existing.sub_category_name = regexp_replace(sc.sub_category_name, '^Demo\s+', '', 'i')
      AND existing.sub_category_id <> sc.sub_category_id
  );

-- Galenic forms: form_name is globally unique in schema V3.
WITH demo_rows AS (
  SELECT
    gf.form_id AS demo_id,
    regexp_replace(gf.form_name, '^Demo\s+', '', 'i') AS clean_label
  FROM galenic_forms gf
  WHERE gf.form_name ~* '^Demo\s+'
),
conflicts AS (
  SELECT
    existing.form_id AS conflict_id,
    d.clean_label
  FROM demo_rows d
  JOIN galenic_forms existing
    ON existing.form_name = d.clean_label
   AND existing.form_id <> d.demo_id
)
UPDATE galenic_forms gf
SET form_name = left(conflicts.clean_label, 87) || ' [' || left(conflicts.conflict_id::text, 8) || ']'
FROM conflicts
WHERE gf.form_id = conflicts.conflict_id;

UPDATE galenic_forms gf
SET form_name = regexp_replace(gf.form_name, '^Demo\s+', '', 'i')
WHERE gf.form_name ~* '^Demo\s+'
  AND NOT EXISTS (
    SELECT 1
    FROM galenic_forms existing
    WHERE existing.form_name = regexp_replace(gf.form_name, '^Demo\s+', '', 'i')
      AND existing.form_id <> gf.form_id
  );

-- Administration routes: route_name is globally unique in schema V3.
WITH demo_rows AS (
  SELECT
    ar.route_id AS demo_id,
    regexp_replace(ar.route_name, '^Demo\s+', '', 'i') AS clean_label
  FROM administration_routes ar
  WHERE ar.route_name ~* '^Demo\s+'
),
conflicts AS (
  SELECT
    existing.route_id AS conflict_id,
    d.clean_label
  FROM demo_rows d
  JOIN administration_routes existing
    ON existing.route_name = d.clean_label
   AND existing.route_id <> d.demo_id
)
UPDATE administration_routes ar
SET route_name = left(conflicts.clean_label, 87) || ' [' || left(conflicts.conflict_id::text, 8) || ']'
FROM conflicts
WHERE ar.route_id = conflicts.conflict_id;

UPDATE administration_routes ar
SET route_name = regexp_replace(ar.route_name, '^Demo\s+', '', 'i')
WHERE ar.route_name ~* '^Demo\s+'
  AND NOT EXISTS (
    SELECT 1
    FROM administration_routes existing
    WHERE existing.route_name = regexp_replace(ar.route_name, '^Demo\s+', '', 'i')
      AND existing.route_id <> ar.route_id
  );

-- Product types: type_name is globally unique in schema V3.
WITH demo_rows AS (
  SELECT
    pt.product_type_id AS demo_id,
    regexp_replace(pt.type_name, '^Demo\s+', '', 'i') AS clean_label
  FROM product_types pt
  WHERE pt.type_name ~* '^Demo\s+'
),
conflicts AS (
  SELECT
    existing.product_type_id AS conflict_id,
    d.clean_label
  FROM demo_rows d
  JOIN product_types existing
    ON existing.type_name = d.clean_label
   AND existing.product_type_id <> d.demo_id
)
UPDATE product_types pt
SET type_name = left(conflicts.clean_label, 87) || ' [' || left(conflicts.conflict_id::text, 8) || ']'
FROM conflicts
WHERE pt.product_type_id = conflicts.conflict_id;

UPDATE product_types pt
SET type_name = regexp_replace(pt.type_name, '^Demo\s+', '', 'i')
WHERE pt.type_name ~* '^Demo\s+'
  AND NOT EXISTS (
    SELECT 1
    FROM product_types existing
    WHERE existing.type_name = regexp_replace(pt.type_name, '^Demo\s+', '', 'i')
      AND existing.product_type_id <> pt.product_type_id
  );

COMMIT;

SELECT
  'categories' AS table_name,
  COUNT(*) AS remaining_demo_prefixes
FROM categories
WHERE category_name ~* '^Demo\s+'
UNION ALL
SELECT 'sub_categories', COUNT(*) FROM sub_categories WHERE sub_category_name ~* '^Demo\s+'
UNION ALL
SELECT 'galenic_forms', COUNT(*) FROM galenic_forms WHERE form_name ~* '^Demo\s+'
UNION ALL
SELECT 'administration_routes', COUNT(*) FROM administration_routes WHERE route_name ~* '^Demo\s+'
UNION ALL
SELECT 'product_types', COUNT(*) FROM product_types WHERE type_name ~* '^Demo\s+';
