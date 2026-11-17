-- ==============================================================================
-- NyayaLink Idempotent Legacy User & Order Backfill Plan
-- Target: Safely maps existing legacy Clients and Orders into Organizations
-- Guarantees: Zero client lockout, idempotent ON CONFLICT guards, backward compatible
-- ==============================================================================

-- 1. Create a default Organization for every existing CLIENT user
INSERT INTO "Organization" ("id", "slug", "name", "stateCode", "createdAt", "updatedAt")
SELECT
  'org_' || u."id" AS "id",
  'org-' || lower(regexp_replace(coalesce(u."name", 'client'), '[^a-zA-Z0-9]', '-', 'g')) || '-' || substr(md5(u."id"), 1, 6) AS "slug",
  coalesce(u."name", 'My Organization') AS "name",
  'MH' AS "stateCode",
  u."createdAt" AS "createdAt",
  CURRENT_TIMESTAMP AS "updatedAt"
FROM "User" u
WHERE u."role" = 'CLIENT'
ON CONFLICT ("id") DO NOTHING;

-- 2. Link each existing CLIENT as the OWNER of their Organization
INSERT INTO "OrganizationMember" ("id", "organizationId", "userId", "role", "createdAt")
SELECT
  'mem_' || u."id" AS "id",
  'org_' || u."id" AS "organizationId",
  u."id" AS "userId",
  'OWNER'::"OrgRole" AS "role",
  CURRENT_TIMESTAMP AS "createdAt"
FROM "User" u
WHERE u."role" = 'CLIENT'
ON CONFLICT ("id") DO NOTHING;

-- 3. Idempotently backfill existing Orders with their client's Organization ID
UPDATE "Order"
SET "organizationId" = 'org_' || "clientId"
WHERE "organizationId" IS NULL
  AND "clientId" IS NOT NULL
  AND EXISTS (SELECT 1 FROM "Organization" org WHERE org."id" = 'org_' || "Order"."clientId");

-- 4. Create an audit log recording completion of the backfill
INSERT INTO "AuditLog" ("id", "action", "entityType", "details", "createdAt")
VALUES (
  'audit_backfill_' || floor(extract(epoch from now())),
  'MIGRATION_BACKFILL_ORGANIZATIONS',
  'System',
  jsonb_build_object('strategy', 'idempotent_client_org_mapping', 'executedAt', CURRENT_TIMESTAMP),
  CURRENT_TIMESTAMP
);
