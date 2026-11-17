-- ==============================================================================
-- NyayaLink Safe Rollback Migration (Additive ERP/CRM Schema -> Pre-Migration State)
-- Rollback Target: Reverts changes made by prisma/migrations_diff.sql
-- Zero Impact on Legacy Tables: Users, Services, Orders (legacy cols), Payments, Ledger
-- ==============================================================================

-- 1. Remove additive foreign key columns from legacy Order table
ALTER TABLE "Order" DROP COLUMN IF EXISTS "legalEntityId";
ALTER TABLE "Order" DROP COLUMN IF EXISTS "organizationId";
ALTER TABLE "Order" DROP COLUMN IF EXISTS "quoteId";

-- 2. Drop new additive ERP/CRM domain tables in reverse dependency order
DROP TABLE IF EXISTS "AuditLog" CASCADE;
DROP TABLE IF EXISTS "ApprovalRequest" CASCADE;
DROP TABLE IF EXISTS "JournalLine" CASCADE;
DROP TABLE IF EXISTS "JournalEntry" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "MatterEvidence" CASCADE;
DROP TABLE IF EXISTS "MatterTask" CASCADE;
DROP TABLE IF EXISTS "Matter" CASCADE;
DROP TABLE IF EXISTS "Quote" CASCADE;
DROP TABLE IF EXISTS "BundleItem" CASCADE;
DROP TABLE IF EXISTS "Bundle" CASCADE;
DROP TABLE IF EXISTS "LegalEntity" CASCADE;
DROP TABLE IF EXISTS "OrganizationMember" CASCADE;
DROP TABLE IF EXISTS "Organization" CASCADE;

-- 3. Drop new additive enums
DROP TYPE IF EXISTS "ApprovalStatus";
DROP TYPE IF EXISTS "ApprovalType";
DROP TYPE IF EXISTS "JournalStatus";
DROP TYPE IF EXISTS "AccountType";
DROP TYPE IF EXISTS "TaskStatus";
DROP TYPE IF EXISTS "MatterStatus";
DROP TYPE IF EXISTS "MatterVertical";
DROP TYPE IF EXISTS "QuoteStatus";
DROP TYPE IF EXISTS "CatalogStatus";
DROP TYPE IF EXISTS "EntityType";
DROP TYPE IF EXISTS "OrgRole";
