-- ==============================================================================
-- NYAYLINK SECURITY REMEDIATION: ENABLE RLS & REVOKE POSTGREST PUBLIC ACCESS
-- Target Project: Nyaylink (nvvwjpmqomwrmvdolydd)
-- Resolves: 
--   1. rls_disabled_in_public (38 tables in public schema)
--   2. sensitive_columns_exposed (public.User - password column exposed without RLS)
--
-- Safety Verification:
--   - Nyaylink is a full-stack Next.js application querying PostgreSQL via Prisma.
--   - Prisma connects with role "postgres" (or service_role), which has "rolbypassrls = true".
--   - The browser never queries Supabase PostgREST directly (0 calls to @supabase/supabase-js).
--   - Enabling RLS blocks external PostgREST exploitation while leaving Prisma 100% operational.
-- ==============================================================================

-- 1. Enable Row Level Security (RLS) on all 38 application tables
ALTER TABLE "public"."Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ApprovalRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."AvailabilityRule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Bundle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."BundleItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Consent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Consultation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Counter" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."DocumentAccessLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."JournalEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."JournalLine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."LawyerProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."LawyerTimeOff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."LedgerEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."LegalEntity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Matter" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."MatterEvidence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."MatterTask" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."OrderMessage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."OrderStatusLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."OrganizationMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."OtpCode" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."PaymentRefund" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Payout" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."PracticeArea" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Quote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ServiceDocRequirement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."StatutoryEvidence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."VaultDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."_LawyerProfileToPracticeArea" ENABLE ROW LEVEL SECURITY;

-- 2. Revoke public Data API (PostgREST) privileges from anon and authenticated roles
--    This prevents unauthorized HTTP endpoints from accessing or mutating core legal tables.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;
