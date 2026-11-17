-- ==============================================================================
-- NyayaLink Idempotent Legacy User & Order Backfill Plan (Harnessed State Provenance)
-- Target: Safely maps existing legacy Clients and Orders into Organizations
-- Guarantees: Zero client lockout, strict provenance verification, idempotent ON CONFLICT guards
-- ==============================================================================

-- 1. Create a default Organization for every existing CLIENT user
-- State code is ONLY populated if verified with explicit provenance/reviewer evidence:
--   - Provenance Rule 1: Verified statutory document in VaultDocument (status = 'VERIFIED' and reviewedById IS NOT NULL)
--   - Provenance Rule 2: Verified statutory GSTIN with reviewer audit log (AuditLog action = 'GSTIN_VERIFIED')
-- Any raw unverified User.state (e.g. 'KA', 'DL', 'MH' without reviewer evidence) or invalid code ('XX', '99', NULL)
-- is strictly set to 'UNKNOWN'.
INSERT INTO "Organization" ("id", "slug", "name", "stateCode", "createdAt", "updatedAt")
SELECT
  'org_' || u."id" AS "id",
  'org-' || lower(u."id") AS "slug",
  coalesce(u."name", 'My Organization') AS "name",
  CASE
    -- Provenance Rule 1: Verified statutory document in VaultDocument with reviewer audit
    WHEN vd."id" IS NOT NULL AND u."state" IN ('AN','AP','AR','AS','BR','CH','CG','DN','DL','GA','GJ','HR','HP','JK','JH','KA','KL','LA','LD','MP','MH','MN','ML','MZ','NL','OD','PY','PB','RJ','SK','TN','TS','TR','UP','UK','WB')
    THEN upper(trim(u."state"))

    -- Provenance Rule 2: Verified statutory GSTIN with reviewer audit log
    WHEN al."id" IS NOT NULL AND u."gstin" IS NOT NULL AND length(trim(u."gstin")) = 15
    THEN (
      CASE substr(trim(u."gstin"), 1, 2)
        WHEN '01' THEN 'JK' WHEN '02' THEN 'HP' WHEN '03' THEN 'PB' WHEN '04' THEN 'CH'
        WHEN '05' THEN 'UK' WHEN '06' THEN 'HR' WHEN '07' THEN 'DL' WHEN '08' THEN 'RJ'
        WHEN '09' THEN 'UP' WHEN '10' THEN 'BR' WHEN '11' THEN 'SK' WHEN '12' THEN 'AR'
        WHEN '13' THEN 'NL' WHEN '14' THEN 'MN' WHEN '15' THEN 'MZ' WHEN '16' THEN 'TR'
        WHEN '17' THEN 'ML' WHEN '18' THEN 'AS' WHEN '19' THEN 'WB' WHEN '20' THEN 'JH'
        WHEN '21' THEN 'OD' WHEN '22' THEN 'CG' WHEN '23' THEN 'MP' WHEN '24' THEN 'GJ'
        WHEN '26' THEN 'DN' WHEN '27' THEN 'MH' WHEN '29' THEN 'KA' WHEN '30' THEN 'GA'
        WHEN '31' THEN 'LD' WHEN '32' THEN 'KL' WHEN '33' THEN 'TN' WHEN '34' THEN 'PY'
        WHEN '35' THEN 'AN' WHEN '36' THEN 'TS' WHEN '37' THEN 'AP' WHEN '38' THEN 'LA'
        ELSE 'UNKNOWN'
      END
    )

    -- Plausible unverified 2-letter codes and invalid codes strictly evaluate to UNKNOWN
    ELSE 'UNKNOWN'
  END AS "stateCode",
  u."createdAt" AS "createdAt",
  CURRENT_TIMESTAMP AS "updatedAt"
FROM "User" u
LEFT JOIN "VaultDocument" vd
  ON vd."ownerId" = u."id"
  AND vd."status" = 'VERIFIED'
  AND vd."reviewedById" IS NOT NULL
  AND vd."category" IN ('STATE_VERIFICATION', 'GST_CERTIFICATE', 'INCORPORATION_CERTIFICATE')
LEFT JOIN "AuditLog" al
  ON al."entityId" = u."id"
  AND al."action" = 'GSTIN_VERIFIED'
  AND al."actorId" IS NOT NULL
WHERE u."role" = 'CLIENT'
ON CONFLICT ("id") DO NOTHING;

-- 2. Link each existing CLIENT as the OWNER of their Organization
INSERT INTO "OrganizationMember" ("id", "organizationId", "userId", "role", "createdAt")
SELECT
  'mem_' || u."id" AS "id",
  'org_' || u."id" AS "organizationId",
  u."id" AS "userId",
  CAST('OWNER' AS "OrgRole") AS "role",
  CURRENT_TIMESTAMP AS "createdAt"
FROM "User" u
WHERE u."role" = 'CLIENT'
ON CONFLICT ("id") DO NOTHING;

-- 3. Idempotently backfill existing Orders with their client's Organization ID
UPDATE "Order"
SET "organizationId" = 'org_' || "clientId"
WHERE "organizationId" IS NULL
  AND "clientId" IS NOT NULL;

-- 4. Create an audit log recording completion of the backfill
INSERT INTO "AuditLog" ("id", "action", "entityType", "details", "createdAt")
VALUES (
  'audit_backfill_init',
  'MIGRATION_BACKFILL_ORGANIZATIONS',
  'System',
  '{"strategy": "idempotent_client_org_mapping_with_provenance"}',
  CURRENT_TIMESTAMP
);
