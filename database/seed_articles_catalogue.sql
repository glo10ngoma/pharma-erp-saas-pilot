-- Seed catalogue articles DEV
-- Catalogue de demonstration plus realiste pour le tenant DEMO.
-- Ne modifie pas le schema. Upsert par article_code pour eviter les doublons.

BEGIN;

WITH target_tenant AS (
  SELECT tenant_id FROM tenants WHERE tenant_code = 'DEMO'
),
product_type_data(type_code, type_name) AS (
  VALUES
    ('CAT-MED', 'Medicament'),
    ('CAT-SUPP', 'Supplement'),
    ('CAT-PARA', 'Parapharmacie'),
    ('CAT-DM', 'Dispositif medical')
)
INSERT INTO product_types (tenant_id, type_code, type_name)
SELECT t.tenant_id, d.type_code, d.type_name
FROM target_tenant t
CROSS JOIN product_type_data d
ON CONFLICT (type_name) DO UPDATE
SET tenant_id = EXCLUDED.tenant_id,
    type_code = EXCLUDED.type_code;

WITH target_tenant AS (
  SELECT tenant_id FROM tenants WHERE tenant_code = 'DEMO'
),
category_data(category_code, category_name) AS (
  VALUES
    ('CAT-ANTALG', 'Antalgiques et antipyretiques'),
    ('CAT-AINS', 'Anti-inflammatoires'),
    ('CAT-ATB', 'Antibiotiques'),
    ('CAT-INFECT', 'Anti-infectieux'),
    ('CAT-PALU', 'Antipaludiques'),
    ('CAT-GASTRO', 'Gastro-enterologie'),
    ('CAT-DIAB', 'Diabete'),
    ('CAT-CARDIO', 'Cardiologie'),
    ('CAT-PNEUMO', 'Pneumologie'),
    ('CAT-ALLERG', 'Allergologie'),
    ('CAT-VIT', 'Vitamines et supplements'),
    ('CAT-ANTISEP', 'Antiseptiques'),
    ('CAT-DM-CAT', 'Dispositifs medicaux')
)
INSERT INTO categories (tenant_id, category_code, category_name, is_active)
SELECT t.tenant_id, d.category_code, d.category_name, TRUE
FROM target_tenant t
CROSS JOIN category_data d
ON CONFLICT (category_name) DO UPDATE
SET tenant_id = EXCLUDED.tenant_id,
    category_code = EXCLUDED.category_code,
    is_active = EXCLUDED.is_active;

WITH target_tenant AS (
  SELECT tenant_id FROM tenants WHERE tenant_code = 'DEMO'
),
sub_category_data(category_code, sub_category_code, sub_category_name) AS (
  VALUES
    ('CAT-ANTALG', 'CAT-ANTALG-SIMPLE', 'Antalgiques simples'),
    ('CAT-AINS', 'CAT-AINS-ORAL', 'AINS'),
    ('CAT-ATB', 'CAT-ATB-PEN', 'Penicillines'),
    ('CAT-ATB', 'CAT-ATB-PEN-ASSOC', 'Penicillines associees'),
    ('CAT-ATB', 'CAT-ATB-MAC', 'Macrolides'),
    ('CAT-INFECT', 'CAT-INFECT-NITRO', 'Nitro-imidazoles'),
    ('CAT-PALU', 'CAT-PALU-ACT', 'ACT'),
    ('CAT-PALU', 'CAT-PALU-QUIN-INJ', 'Quinine injectable'),
    ('CAT-GASTRO', 'CAT-GASTRO-ORS', 'Rehydratation orale'),
    ('CAT-GASTRO', 'CAT-GASTRO-IPP', 'IPP'),
    ('CAT-DIAB', 'CAT-DIAB-BIG', 'Antidiabetiques oraux'),
    ('CAT-DIAB', 'CAT-DIAB-SULF', 'Sulfamides hypoglycemiants'),
    ('CAT-CARDIO', 'CAT-CARDIO-HTA', 'Antihypertenseurs'),
    ('CAT-CARDIO', 'CAT-CARDIO-ARA2', 'ARA II'),
    ('CAT-PNEUMO', 'CAT-PNEUMO-BRONCHO', 'Bronchodilatateurs'),
    ('CAT-ALLERG', 'CAT-ALLERG-AH', 'Antihistaminiques'),
    ('CAT-VIT', 'CAT-VIT-VIT', 'Vitamines'),
    ('CAT-ANTISEP', 'CAT-ANTISEP-DESINF', 'Desinfection'),
    ('CAT-DM-CAT', 'CAT-DM-PROT', 'Protection')
)
INSERT INTO sub_categories (tenant_id, category_id, sub_category_code, sub_category_name, is_active)
SELECT t.tenant_id, c.category_id, d.sub_category_code, d.sub_category_name, TRUE
FROM target_tenant t
JOIN sub_category_data d ON TRUE
JOIN categories c ON c.tenant_id = t.tenant_id AND c.category_code = d.category_code
ON CONFLICT (category_id, sub_category_code) DO UPDATE
SET tenant_id = EXCLUDED.tenant_id,
    sub_category_name = EXCLUDED.sub_category_name,
    is_active = EXCLUDED.is_active;

WITH target_tenant AS (
  SELECT tenant_id FROM tenants WHERE tenant_code = 'DEMO'
),
form_data(form_code, form_name) AS (
  VALUES
    ('CAT-COMP', 'Comprime'),
    ('CAT-GEL', 'Gelule'),
    ('CAT-INJ', 'Injectable'),
    ('CAT-SACHET', 'Sachet'),
    ('CAT-AEROSOL', 'Aerosol'),
    ('CAT-SOL', 'Solution'),
    ('CAT-GANTS', 'Gants')
)
INSERT INTO galenic_forms (tenant_id, form_code, form_name)
SELECT t.tenant_id, d.form_code, d.form_name
FROM target_tenant t
CROSS JOIN form_data d
ON CONFLICT (form_name) DO UPDATE
SET tenant_id = EXCLUDED.tenant_id,
    form_code = EXCLUDED.form_code;

WITH target_tenant AS (
  SELECT tenant_id FROM tenants WHERE tenant_code = 'DEMO'
),
route_data(route_code, route_name) AS (
  VALUES
    ('CAT-ORAL', 'Orale'),
    ('CAT-IV', 'Intraveineuse'),
    ('CAT-INHAL', 'Inhalation'),
    ('CAT-CUT', 'Cutanee')
)
INSERT INTO administration_routes (tenant_id, route_code, route_name)
SELECT t.tenant_id, d.route_code, d.route_name
FROM target_tenant t
CROSS JOIN route_data d
ON CONFLICT (route_name) DO UPDATE
SET tenant_id = EXCLUDED.tenant_id,
    route_code = EXCLUDED.route_code;

WITH target_tenant AS (
  SELECT tenant_id FROM tenants WHERE tenant_code = 'DEMO'
),
article_data(article_code, commercial_name, dci, dosage, category_code, sub_category_code, form_code, route_code, type_code, atc_code, prescription_required, stock_min) AS (
  VALUES
    ('CAT-PARA-500', 'Paracetamol 500 mg comprime', 'Paracetamol', '500 mg', 'CAT-ANTALG', 'CAT-ANTALG-SIMPLE', 'CAT-COMP', 'CAT-ORAL', 'CAT-MED', 'N02BE01', FALSE, 20),
    ('CAT-IBU-400', 'Ibuprofene 400 mg comprime', 'Ibuprofene', '400 mg', 'CAT-AINS', 'CAT-AINS-ORAL', 'CAT-COMP', 'CAT-ORAL', 'CAT-MED', 'M01AE01', FALSE, 15),
    ('CAT-AMOX-500', 'Amoxicilline 500 mg gelule', 'Amoxicilline', '500 mg', 'CAT-ATB', 'CAT-ATB-PEN', 'CAT-GEL', 'CAT-ORAL', 'CAT-MED', 'J01CA04', TRUE, 10),
    ('CAT-AMOX-CLAV-625', 'Amoxicilline acide clavulanique 625 mg', 'Amoxicilline + acide clavulanique', '500 mg + 125 mg', 'CAT-ATB', 'CAT-ATB-PEN-ASSOC', 'CAT-COMP', 'CAT-ORAL', 'CAT-MED', 'J01CR02', TRUE, 8),
    ('CAT-AZI-500', 'Azithromycine 500 mg comprime', 'Azithromycine', '500 mg', 'CAT-ATB', 'CAT-ATB-MAC', 'CAT-COMP', 'CAT-ORAL', 'CAT-MED', 'J01FA10', TRUE, 8),
    ('CAT-METRO-500', 'Metronidazole 500 mg comprime', 'Metronidazole', '500 mg', 'CAT-INFECT', 'CAT-INFECT-NITRO', 'CAT-COMP', 'CAT-ORAL', 'CAT-MED', 'J01XD01', TRUE, 10),
    ('CAT-ART-LUM', 'Artemether Lumefantrine 20/120 mg', 'Artemether + Lumefantrine', '20 mg + 120 mg', 'CAT-PALU', 'CAT-PALU-ACT', 'CAT-COMP', 'CAT-ORAL', 'CAT-MED', 'P01BF01', TRUE, 20),
    ('CAT-QUIN-INJ', 'Quinine injectable 300 mg/ml', 'Quinine', '300 mg/ml', 'CAT-PALU', 'CAT-PALU-QUIN-INJ', 'CAT-INJ', 'CAT-IV', 'CAT-MED', 'P01BC01', TRUE, 5),
    ('CAT-ORS-SACHET', 'SRO sachet', 'Sels de rehydratation orale', 'Sachet', 'CAT-GASTRO', 'CAT-GASTRO-ORS', 'CAT-SACHET', 'CAT-ORAL', 'CAT-MED', 'A07CA', FALSE, 30),
    ('CAT-OMEP-20', 'Omeprazole 20 mg gelule', 'Omeprazole', '20 mg', 'CAT-GASTRO', 'CAT-GASTRO-IPP', 'CAT-GEL', 'CAT-ORAL', 'CAT-MED', 'A02BC01', FALSE, 15),
    ('CAT-METF-500', 'Metformine 500 mg comprime', 'Metformine', '500 mg', 'CAT-DIAB', 'CAT-DIAB-BIG', 'CAT-COMP', 'CAT-ORAL', 'CAT-MED', 'A10BA02', TRUE, 10),
    ('CAT-GLIB-5', 'Glibenclamide 5 mg comprime', 'Glibenclamide', '5 mg', 'CAT-DIAB', 'CAT-DIAB-SULF', 'CAT-COMP', 'CAT-ORAL', 'CAT-MED', 'A10BB01', TRUE, 10),
    ('CAT-AMLO-5', 'Amlodipine 5 mg comprime', 'Amlodipine', '5 mg', 'CAT-CARDIO', 'CAT-CARDIO-HTA', 'CAT-COMP', 'CAT-ORAL', 'CAT-MED', 'C08CA01', TRUE, 10),
    ('CAT-LOS-50', 'Losartan 50 mg comprime', 'Losartan', '50 mg', 'CAT-CARDIO', 'CAT-CARDIO-ARA2', 'CAT-COMP', 'CAT-ORAL', 'CAT-MED', 'C09CA01', TRUE, 10),
    ('CAT-SALB-INH', 'Salbutamol inhalateur 100 mcg', 'Salbutamol', '100 mcg/dose', 'CAT-PNEUMO', 'CAT-PNEUMO-BRONCHO', 'CAT-AEROSOL', 'CAT-INHAL', 'CAT-MED', 'R03AC02', TRUE, 5),
    ('CAT-CET-10', 'Cetirizine 10 mg comprime', 'Cetirizine', '10 mg', 'CAT-ALLERG', 'CAT-ALLERG-AH', 'CAT-COMP', 'CAT-ORAL', 'CAT-MED', 'R06AE07', FALSE, 10),
    ('CAT-VITC-500', 'Vitamine C 500 mg comprime', 'Acide ascorbique', '500 mg', 'CAT-VIT', 'CAT-VIT-VIT', 'CAT-COMP', 'CAT-ORAL', 'CAT-SUPP', 'A11GA01', FALSE, 20),
    ('CAT-ALCOOL-70', 'Alcool 70 pour cent', 'Ethanol', '70%', 'CAT-ANTISEP', 'CAT-ANTISEP-DESINF', 'CAT-SOL', 'CAT-CUT', 'CAT-PARA', 'D08AX08', FALSE, 10),
    ('CAT-BETADINE-10', 'Povidone iodee 10 pour cent', 'Povidone iodee', '10%', 'CAT-ANTISEP', 'CAT-ANTISEP-DESINF', 'CAT-SOL', 'CAT-CUT', 'CAT-MED', 'D08AG02', FALSE, 8),
    ('CAT-GANTS-MED', 'Gants medicaux non steriles', NULL, 'Taille M', 'CAT-DM-CAT', 'CAT-DM-PROT', 'CAT-GANTS', 'CAT-CUT', 'CAT-DM', NULL, FALSE, 50)
)
INSERT INTO articles (
  tenant_id, article_code, commercial_name, dci, dosage, category_id, sub_category_id,
  form_id, route_id, product_type_id, atc_code, prescription_required, default_stock_min, is_active
)
SELECT
  t.tenant_id, d.article_code, d.commercial_name, d.dci, d.dosage, c.category_id, sc.sub_category_id,
  gf.form_id, ar.route_id, pt.product_type_id, d.atc_code, d.prescription_required, d.stock_min, TRUE
FROM target_tenant t
JOIN article_data d ON TRUE
JOIN categories c ON c.tenant_id = t.tenant_id AND c.category_code = d.category_code
JOIN sub_categories sc ON sc.tenant_id = t.tenant_id AND sc.sub_category_code = d.sub_category_code
JOIN galenic_forms gf ON gf.tenant_id = t.tenant_id AND gf.form_code = d.form_code
JOIN administration_routes ar ON ar.tenant_id = t.tenant_id AND ar.route_code = d.route_code
JOIN product_types pt ON pt.tenant_id = t.tenant_id AND pt.type_code = d.type_code
ON CONFLICT (article_code) DO UPDATE
SET tenant_id = EXCLUDED.tenant_id,
    commercial_name = EXCLUDED.commercial_name,
    dci = EXCLUDED.dci,
    dosage = EXCLUDED.dosage,
    category_id = EXCLUDED.category_id,
    sub_category_id = EXCLUDED.sub_category_id,
    form_id = EXCLUDED.form_id,
    route_id = EXCLUDED.route_id,
    product_type_id = EXCLUDED.product_type_id,
    atc_code = EXCLUDED.atc_code,
    prescription_required = EXCLUDED.prescription_required,
    default_stock_min = EXCLUDED.default_stock_min,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

COMMIT;
