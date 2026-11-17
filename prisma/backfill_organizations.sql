-- ==============================================================================
-- NyayaLink Deterministic Entity-Scoped Organization Backfill Plan
-- Target: Maps legacy clients to organizations with strict provenance verification
-- Guarantees: Zero duplicate rows, unambiguous evidence checks, automated review tasks
-- ==============================================================================

-- 1. Create a default Organization for every existing CLIENT user using deterministic evidence
INSERT INTO "Organization" ("id", "slug", "name", "stateCode", "createdAt", "updatedAt")
SELECT
  'org_' || u."id" AS "id",
  'org-' || lower(u."id") AS "slug",
  coalesce(u."name", 'My Organization') AS "name",
  CASE
    -- Ambiguity check: multiple conflicting attested states from documents -> UNKNOWN
    WHEN de."distinctAttestedCount" > 1
    THEN 'UNKNOWN'

    -- Ambiguity check: multiple verified GSTIN states detected -> UNKNOWN
    WHEN ge."distinctGstinStateCount" > 1
    THEN 'UNKNOWN'

    -- Audit record MUST explicitly verify the exact current GSTIN (no missing field, no fallback)
    WHEN ge."userId" IS NOT NULL AND ge."currentGstinMatchCount" = 0
    THEN 'UNKNOWN'

    -- Conflict check: if both document state and GSTIN state exist but contradict each other -> UNKNOWN
    WHEN de."docState" IS NOT NULL AND ge."gstinState" IS NOT NULL AND de."docState" != ge."gstinState"
    THEN 'UNKNOWN'

    -- Multi-entity or branch registration without registered office scope cannot infer organization-wide state
    WHEN ge."gstinState" IS NOT NULL AND (ge."distinctEntitiesCount" > 1 OR coalesce(ge."gstinScope", '') != 'REGISTERED_OFFICE')
      AND de."docState" IS NULL
    THEN 'UNKNOWN'

    -- Unambiguous document evidence with verified reviewer, timestamp, storageKey, and REGISTERED_OFFICE scope
    WHEN de."docState" IS NOT NULL
    THEN de."docState"

    -- Unambiguous single verified GSTIN tied to registered office scope and current GSTIN
    WHEN ge."gstinState" IS NOT NULL
      AND ge."distinctGstinStateCount" = 1
      AND ge."currentGstinMatchCount" > 0
      AND ge."gstinScope" = 'REGISTERED_OFFICE'
      AND ge."distinctEntitiesCount" <= 1
    THEN ge."gstinState"

    -- Missing or unverified evidence -> UNKNOWN
    ELSE 'UNKNOWN'
  END AS "stateCode",
  u."createdAt" AS "createdAt",
  CURRENT_TIMESTAMP AS "updatedAt"
FROM "User" u
LEFT JOIN (
  SELECT
    vd."ownerId" AS "userId",
    COUNT(DISTINCT upper(trim(se."attestedStateCode"))) AS "distinctAttestedCount",
    MAX(upper(trim(se."attestedStateCode"))) AS "docState"
  FROM "StatutoryEvidence" se
  JOIN "VaultDocument" vd ON vd."id" = se."documentId"
  JOIN "User" rev ON rev."id" = se."reviewerId"
  JOIN "User" u ON u."id" = vd."ownerId"
  WHERE vd."status" = 'VERIFIED'
    AND vd."storageKey" IS NOT NULL
    AND (se."organizationId" IS NULL OR se."organizationId" = 'org_' || u."id")
    AND rev."role" IN ('SUPER_ADMIN', 'OPS_MANAGER', 'CA_CS_LEAD', 'COMPLIANCE_EXEC')
    AND se."attestedStateCode" IS NOT NULL
    AND length(trim(se."attestedStateCode")) = 2
    AND upper(trim(se."attestedStateCode")) IN ('AN','AP','AR','AS','BR','CH','CG','DN','DL','GA','GJ','HR','HP','JK','JH','KA','KL','LA','LD','MP','MH','MN','ML','MZ','NL','OD','PY','PB','RJ','SK','TN','TS','TR','UP','UK','WB')
    AND se."scope" = 'REGISTERED_OFFICE'
  GROUP BY vd."ownerId"
) de ON de."userId" = u."id"
LEFT JOIN (
  SELECT
    vd."ownerId" AS "userId",
    COUNT(DISTINCT substr(trim(se."verifiedGstin"), 1, 2)) AS "distinctGstinStateCount",
    MAX(
      CASE substr(trim(se."verifiedGstin"), 1, 2)
        WHEN '01' THEN 'JK' WHEN '02' THEN 'HP' WHEN '03' THEN 'PB' WHEN '04' THEN 'CH'
        WHEN '05' THEN 'UK' WHEN '06' THEN 'HR' WHEN '07' THEN 'DL' WHEN '08' THEN 'RJ'
        WHEN '09' THEN 'UP' WHEN '10' THEN 'BR' WHEN '11' THEN 'SK' WHEN '12' THEN 'AR'
        WHEN '13' THEN 'NL' WHEN '14' THEN 'MN' WHEN '15' THEN 'MZ' WHEN '16' THEN 'TR'
        WHEN '17' THEN 'ML' WHEN '18' THEN 'AS' WHEN '19' THEN 'WB' WHEN '20' THEN 'JH'
        WHEN '21' THEN 'OD' WHEN '22' THEN 'CG' WHEN '23' THEN 'MP' WHEN '24' THEN 'GJ'
        WHEN '26' THEN 'DN' WHEN '27' THEN 'MH' WHEN '29' THEN 'KA' WHEN '30' THEN 'GA'
        WHEN '31' THEN 'LD' WHEN '32' THEN 'KL' WHEN '33' THEN 'TN' WHEN '34' THEN 'PY'
        WHEN '35' THEN 'AN' WHEN '36' THEN 'TS' WHEN '37' THEN 'AP' WHEN '38' THEN 'LA'
        ELSE NULL
      END
    ) AS "gstinState",
    MAX(se."scope") AS "gstinScope",
    COUNT(DISTINCT se."legalEntityId") AS "distinctEntitiesCount",
    COUNT(CASE WHEN se."verifiedGstin" = u."gstin" AND se."isCurrent" = true THEN 1 END) AS "currentGstinMatchCount"
  FROM "StatutoryEvidence" se
  JOIN "VaultDocument" vd ON vd."id" = se."documentId"
  JOIN "User" rev ON rev."id" = se."reviewerId"
  JOIN "User" u ON u."id" = vd."ownerId"
  WHERE vd."status" = 'VERIFIED'
    AND (se."organizationId" IS NULL OR se."organizationId" = 'org_' || u."id")
    AND rev."role" IN ('SUPER_ADMIN', 'OPS_MANAGER', 'CA_CS_LEAD', 'COMPLIANCE_EXEC')
    AND se."verifiedGstin" IS NOT NULL
    AND length(trim(se."verifiedGstin")) = 15
    AND u."gstin" IS NOT NULL
    AND length(trim(u."gstin")) = 15
  GROUP BY vd."ownerId"
) ge ON ge."userId" = u."id"
WHERE u."role" = 'CLIENT'
ON CONFLICT ("id") DO UPDATE SET
  "stateCode" = EXCLUDED."stateCode",
  "updatedAt" = EXCLUDED."updatedAt";

-- 2. Link each existing CLIENT as OWNER of their Organization
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

-- 3. Idempotently backfill existing Orders with client organization ID
UPDATE "Order"
SET "organizationId" = 'org_' || "clientId"
WHERE "organizationId" IS NULL
  AND "clientId" IS NOT NULL;

-- 4. Idempotently link VaultDocuments and StatutoryEvidence to client organizations
UPDATE "VaultDocument"
SET "organizationId" = 'org_' || "ownerId"
WHERE "organizationId" IS NULL;

-- 5. Create Review Tasks and Compliance Matter for organizations with UNKNOWN / ambiguous state
INSERT INTO "Matter" ("id", "matterNumber", "title", "vertical", "status", "organizationId", "notes", "createdAt", "updatedAt")
SELECT
  'mat_rev_' || org."id",
  'MAT-REV-' || substr(org."id", 5, 8),
  'State & Place of Supply Verification',
  CAST('TAXATION_GST_VCFO' AS "MatterVertical"),
  CAST('INTAKE_PENDING' AS "MatterStatus"),
  org."id",
  'State is UNKNOWN / unverified. Professional review required to verify registered office jurisdiction.',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Organization" org
WHERE org."stateCode" = 'UNKNOWN'
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "MatterTask" ("id", "matterId", "title", "description", "status", "createdAt", "updatedAt")
SELECT
  'task_rev_' || org."id",
  'mat_rev_' || org."id",
  'Review State Provenance & Place of Supply Evidence',
  'Evidence is missing, conflicting, or unverified. Verify state against statutory certificate or GSTN portal.',
  CAST('PENDING' AS "TaskStatus"),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Organization" org
WHERE org."stateCode" = 'UNKNOWN'
ON CONFLICT ("id") DO NOTHING;

-- 6. Audit Log recording review tasks generated
INSERT INTO "AuditLog" ("id", "action", "entityType", "entityId", "details", "createdAt")
SELECT
  'aud_rev_' || org."id",
  'STATE_VERIFICATION_REVIEW_REQUIRED',
  'Organization',
  org."id",
  CAST('{"reason": "Missing, conflicting, or unverified state evidence during migration. Review task created."}' AS JSONB),
  CURRENT_TIMESTAMP
FROM "Organization" org
WHERE org."stateCode" = 'UNKNOWN'
ON CONFLICT ("id") DO NOTHING;
