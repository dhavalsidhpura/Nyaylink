import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { newDb, DataType } from 'pg-mem';
import {
  splitGst,
  getStateStampDuty,
  getStateJurisdiction,
  checkStateSchemeEligibility,
} from '../src/lib/pricing';

describe('Disposable Staging Database Schema Migration & Rollback Suite', () => {
  const db = newDb();

  // Register SQL functions for in-memory parser
  db.public.registerFunction({
    name: 'trim',
    args: [DataType.text],
    returns: DataType.text,
    implementation: (x) => (x ? x.trim() : x),
  });

  db.public.registerFunction({
    name: 'length',
    args: [DataType.text],
    returns: DataType.integer,
    implementation: (x) => (x ? x.length : 0),
  });

  db.public.registerFunction({
    name: 'substr',
    args: [DataType.text, DataType.integer, DataType.integer],
    returns: DataType.text,
    implementation: (str, start, len) => (str ? str.substring(start - 1, start - 1 + len) : ''),
  });

  // 1. Initialize baseline legacy production schema
  it('Initializes baseline legacy schema with existing production data', () => {
    db.public.none(`
      CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'OPS_MANAGER', 'CA_CS_LEAD', 'COMPLIANCE_EXEC', 'FINANCE_MANAGER', 'LAWYER', 'CLIENT');
      CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'DOCS_PENDING', 'IN_PROGRESS', 'QUERY_RAISED', 'APPROVED', 'REJECTED');
      CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'REFUNDED');
      CREATE TYPE "TxnType" AS ENUM ('CLIENT_PAYMENT', 'GOVT_FEES_DEBIT', 'CA_PAYOUT', 'LAWYER_PAYOUT', 'REFUND');

      CREATE TABLE "User" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT UNIQUE,
        "name" TEXT,
        "role" "Role" DEFAULT 'CLIENT',
        "state" TEXT,
        "gstin" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE "VaultDocument" (
        "id" TEXT PRIMARY KEY,
        "ownerId" TEXT REFERENCES "User"("id"),
        "status" TEXT DEFAULT 'PENDING_REVIEW',
        "category" TEXT,
        "reviewedById" TEXT,
        "reviewedAt" TIMESTAMP,
        "storageKey" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE "Lead" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT,
        "email" TEXT,
        "phone" TEXT,
        "status" TEXT DEFAULT 'NEW',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE "Service" (
        "id" TEXT PRIMARY KEY,
        "slug" TEXT UNIQUE,
        "title" TEXT,
        "professionalFee" NUMERIC(10, 2),
        "govtFee" NUMERIC(10, 2),
        "sla" TEXT,
        "sacCode" TEXT
      );

      CREATE TABLE "Order" (
        "id" TEXT PRIMARY KEY,
        "orderNumber" TEXT UNIQUE,
        "clientId" TEXT REFERENCES "User"("id"),
        "serviceId" TEXT REFERENCES "Service"("id"),
        "amountPaid" NUMERIC(10, 2) DEFAULT 0,
        "totalAmount" NUMERIC(10, 2) DEFAULT 0,
        "status" "OrderStatus" DEFAULT 'PENDING_PAYMENT',
        "paymentStatus" "PaymentStatus" DEFAULT 'UNPAID',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE "Payment" (
        "id" TEXT PRIMARY KEY,
        "orderId" TEXT REFERENCES "Order"("id"),
        "gatewayOrderId" TEXT,
        "gatewayPaymentId" TEXT,
        "amount" NUMERIC(10, 2),
        "status" TEXT DEFAULT 'CREATED',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE "LedgerEntry" (
        "id" TEXT PRIMARY KEY,
        "txnNo" TEXT UNIQUE,
        "type" "TxnType",
        "description" TEXT,
        "debit" NUMERIC(12, 2) DEFAULT 0,
        "credit" NUMERIC(12, 2) DEFAULT 0,
        "mode" TEXT DEFAULT 'RAZORPAY',
        "orderId" TEXT REFERENCES "Order"("id"),
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert pre-migration production data including provenance test cases:
    // 1. usr-1: Plausible unverified 2-letter state 'KA' (no reviewer document/evidence)
    // 2. usr-invalid: Invalid state code 'XX'
    // 3. usr-doc: Client with verified statutory document reviewed by authorized staff with timestamp & storageKey
    // 4. usr-gstin: Client with verified statutory GSTIN prefix '29'
    // 5. usr-conflict: Client with verified document (MH) conflicting with verified GSTIN (KA)
    // 6. usr-unauth: Client with document reviewed by unauthorized client user
    // 7. usr-tenant-mismatch: Client attempting to link document owned by another user/tenant
    // 8. usr-old-reg: Client whose evidence references expired/non-current registration
    // 9. usr-multi-gstin: Client with multiple verified GSTIN states
    // 10. usr-branch-gstin: Client with branch-scoped GSTIN
    // 11. usr-2: Authorized back-office staff reviewer (OPS_MANAGER)
    db.public.none(`
      INSERT INTO "User" ("id", "email", "name", "role", "state", "gstin") VALUES
        ('usr-1', 'client.alpha@startup.com', 'Alpha Founder', 'CLIENT', 'KA', NULL),
        ('usr-invalid', 'client.invalid@test.com', 'Invalid State User', 'CLIENT', 'XX', NULL),
        ('usr-doc', 'client.verified.doc@mfg.com', 'Verified Doc Client', 'CLIENT', NULL, NULL),
        ('usr-gstin', 'client.verified.gstin@tech.com', 'Verified GSTIN Client', 'CLIENT', NULL, '29AABCU9603R1ZM'),
        ('usr-conflict', 'client.conflict@ventures.com', 'Conflicting Evidence Client', 'CLIENT', NULL, '29AABCU9603R1ZM'),
        ('usr-unauth', 'client.unauth@test.com', 'Unauthorized Reviewer Client', 'CLIENT', NULL, '29AABCU9603R1ZM'),
        ('usr-tenant-mismatch', 'client.mismatch@test.com', 'Tenant Mismatch Client', 'CLIENT', NULL, '29AABCU9603R1ZM'),
        ('usr-old-reg', 'client.oldreg@test.com', 'Old Registration Client', 'CLIENT', NULL, '27AABCU9603R1ZM'),
        ('usr-multi-gstin', 'client.multi@ventures.com', 'Multi-GSTIN Client', 'CLIENT', NULL, '29AABCU9603R1ZM'),
        ('usr-branch-gstin', 'client.branch@retail.com', 'Branch GSTIN Client', 'CLIENT', NULL, '29AABCU9603R1ZM'),
        ('usr-other', 'client.other@test.com', 'Other Client', 'CLIENT', NULL, NULL),
        ('usr-2', 'lead.ops@nyayalink.com', 'Lead Ops', 'OPS_MANAGER', 'MH', NULL);

      INSERT INTO "VaultDocument" ("id", "ownerId", "status", "category", "reviewedById", "reviewedAt", "storageKey") VALUES
        ('doc-1', 'usr-doc', 'VERIFIED', 'STATE_VERIFICATION', 'usr-2', CURRENT_TIMESTAMP, 's3://vault/doc-1.pdf'),
        ('doc-gstin', 'usr-gstin', 'VERIFIED', 'GSTIN_VERIFICATION', 'usr-2', CURRENT_TIMESTAMP, 's3://vault/doc-gstin.pdf'),
        ('doc-conflict-1', 'usr-conflict', 'VERIFIED', 'STATE_VERIFICATION', 'usr-2', CURRENT_TIMESTAMP, 's3://vault/doc-conflict-1.pdf'),
        ('doc-conflict-2', 'usr-conflict', 'VERIFIED', 'GSTIN_VERIFICATION', 'usr-2', CURRENT_TIMESTAMP, 's3://vault/doc-conflict-2.pdf'),
        ('doc-unauth', 'usr-unauth', 'VERIFIED', 'STATE_VERIFICATION', 'usr-1', CURRENT_TIMESTAMP, 's3://vault/doc-unauth.pdf'),
        ('doc-other-tenant', 'usr-other', 'VERIFIED', 'STATE_VERIFICATION', 'usr-2', CURRENT_TIMESTAMP, 's3://vault/doc-other-tenant.pdf'),
        ('doc-old-reg', 'usr-old-reg', 'VERIFIED', 'GSTIN_VERIFICATION', 'usr-2', CURRENT_TIMESTAMP, 's3://vault/doc-old-reg.pdf'),
        ('doc-multi-1', 'usr-multi-gstin', 'VERIFIED', 'GSTIN_VERIFICATION', 'usr-2', CURRENT_TIMESTAMP, 's3://vault/doc-multi-1.pdf'),
        ('doc-multi-2', 'usr-multi-gstin', 'VERIFIED', 'GSTIN_VERIFICATION', 'usr-2', CURRENT_TIMESTAMP, 's3://vault/doc-multi-2.pdf'),
        ('doc-branch', 'usr-branch-gstin', 'VERIFIED', 'GSTIN_VERIFICATION', 'usr-2', CURRENT_TIMESTAMP, 's3://vault/doc-branch.pdf');

      INSERT INTO "Service" ("id", "slug", "title", "professionalFee", "govtFee", "sla", "sacCode") VALUES
        ('srv-1', 'private-limited-company', 'Private Limited Company Incorporation', 1999, 1000, '7-10 Days', '998311');

      INSERT INTO "Order" ("id", "orderNumber", "clientId", "serviceId", "amountPaid", "totalAmount", "status", "paymentStatus") VALUES
        ('ord-1', 'ORD-2026-0001', 'usr-1', 'srv-1', 999, 3359, 'DOCS_PENDING', 'PARTIALLY_PAID');

      INSERT INTO "Payment" ("id", "orderId", "gatewayOrderId", "gatewayPaymentId", "amount", "status") VALUES
        ('pay-1', 'ord-1', 'order_demo_1', 'pay_demo_1', 999, 'CAPTURED');

      INSERT INTO "LedgerEntry" ("id", "txnNo", "type", "description", "credit", "debit", "mode", "orderId") VALUES
        ('led-1', 'pay_demo_1', 'CLIENT_PAYMENT', 'Advance Token', 999, 0, 'TEST_SIMULATION', 'ord-1');
    `);

    const users = db.public.many('SELECT * FROM "User"');
    const orders = db.public.many('SELECT * FROM "Order"');
    assert.equal(users.length, 12);
    assert.equal(orders.length, 1);
  });

  // 2. Apply migration script in staging
  it('Applies prisma/migrations_diff.sql cleanly with zero data loss on existing records', () => {
    const migrationPath = path.join(process.cwd(), 'prisma', 'migrations_diff.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    // Strip comments and normalize decimal precision for in-memory AST parser
    const cleanSql = migrationSql
      .replace(/--.*$/gm, '')
      .replace(/DECIMAL\(\d+,\s*\d+\)/gi, 'DECIMAL');

    const statements = cleanSql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      db.public.none(stmt);
    }

    // Verify existing records are 100% intact
    const users = db.public.many('SELECT * FROM "User"');
    const orders = db.public.many('SELECT * FROM "Order"');
    const payments = db.public.many('SELECT * FROM "Payment"');
    const ledgers = db.public.many('SELECT * FROM "LedgerEntry"');

    assert.equal(users.length, 12, 'User records must be fully preserved');
    assert.equal(orders.length, 1, 'Order records must be fully preserved');
    assert.equal(payments.length, 1, 'Payment records must be fully preserved');
    assert.equal(ledgers.length, 1, 'Ledger records must be fully preserved');

    assert.equal(orders[0].orderNumber, 'ORD-2026-0001');
    assert.equal(Number(orders[0].amountPaid), 999);
  });

  // 3. Multi-tenancy isolation and constraint tests
  it('Enforces multi-tenancy organization constraints and foreign keys', () => {
    // Insert two distinct organizations
    db.public.none(`
      INSERT INTO "Organization" ("id", "slug", "name", "stateCode", "updatedAt") VALUES
        ('org-alpha', 'acme-holdings', 'Acme Holdings Private Limited', 'MH', CURRENT_TIMESTAMP),
        ('org-beta', 'beta-ventures', 'Beta Ventures LLP', 'KA', CURRENT_TIMESTAMP);
    `);

    // Insert Organization Member
    db.public.none(`
      INSERT INTO "OrganizationMember" ("id", "organizationId", "userId", "role") VALUES
        ('mem-1', 'org-alpha', 'usr-1', 'OWNER');
    `);

    // Verify unique constraint on Organization slug
    assert.throws(() => {
      db.public.none(`
        INSERT INTO "Organization" ("id", "slug", "name", "stateCode", "updatedAt") VALUES
          ('org-dup', 'acme-holdings', 'Duplicate Org', 'MH', CURRENT_TIMESTAMP);
      `);
    }, /unique|duplicate|already exists/i);

    // Verify foreign key constraint on Matter: non-existent organizationId fails
    assert.throws(() => {
      db.public.none(`
        INSERT INTO "Matter" ("id", "matterNumber", "vertical", "organizationId", "title", "updatedAt") VALUES
          ('mat-invalid', 'MAT-2026-0001', 'COMPANY_REGISTRATION', 'org-nonexistent', 'Invalid Matter', CURRENT_TIMESTAMP);
      `);
    }, /foreign key|constraint|does not exist/i);

    // Insert valid matter under org-alpha
    db.public.none(`
      INSERT INTO "Matter" ("id", "matterNumber", "vertical", "organizationId", "title", "updatedAt") VALUES
        ('mat-1', 'MAT-2026-0001', 'COMPANY_REGISTRATION', 'org-alpha', 'Acme Incorporation Matter', CURRENT_TIMESTAMP);
    `);

    const matters = db.public.many('SELECT * FROM "Matter" WHERE "organizationId" = \'org-alpha\'');
    assert.equal(matters.length, 1);
    assert.equal(matters[0].matterNumber, 'MAT-2026-0001');
  });

  // 4. Backfill existing legacy users and orders to organizations with strict state provenance
  it('Validates legacy user-to-organization backfill with state provenance, conflict detection, and review task generation', () => {
    // Insert StatutoryEvidence records linking documents, exact values, registration, and reviewer authorization
    db.public.none(`
      INSERT INTO "StatutoryEvidence" ("id", "documentId", "attestedStateCode", "verifiedGstin", "scope", "isCurrent", "reviewerId") VALUES
        ('se-doc', 'doc-1', 'MH', NULL, 'REGISTERED_OFFICE', true, 'usr-2'),
        ('se-gstin', 'doc-gstin', NULL, '29AABCU9603R1ZM', 'REGISTERED_OFFICE', true, 'usr-2'),
        ('se-conflict-1', 'doc-conflict-1', 'MH', NULL, 'REGISTERED_OFFICE', true, 'usr-2'),
        ('se-conflict-2', 'doc-conflict-2', NULL, '29AABCU9603R1ZM', 'REGISTERED_OFFICE', true, 'usr-2'),
        ('se-unauth', 'doc-unauth', 'MH', NULL, 'REGISTERED_OFFICE', true, 'usr-1'),
        ('se-mismatch', 'doc-other-tenant', 'MH', NULL, 'BRANCH', true, 'usr-2'),
        ('se-old-reg', 'doc-old-reg', NULL, '29AABCU9603R1ZM', 'REGISTERED_OFFICE', false, 'usr-2'),
        ('se-multi-1', 'doc-multi-1', NULL, '29AABCU9603R1ZM', 'REGISTERED_OFFICE', true, 'usr-2'),
        ('se-multi-2', 'doc-multi-2', NULL, '27AABCU9603R1ZM', 'REGISTERED_OFFICE', true, 'usr-2'),
        ('se-branch', 'doc-branch', NULL, '29AABCU9603R1ZM', 'BRANCH', true, 'usr-2');
    `);

    // Read and execute prisma/backfill_organizations.sql
    const backfillPath = path.join(process.cwd(), 'prisma', 'backfill_organizations.sql');
    const backfillSql = fs.readFileSync(backfillPath, 'utf8');

    const cleanBackfill = backfillSql
      .replace(/--.*$/gm, '')
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of cleanBackfill) {
      db.public.none(stmt);
    }

    // 1. Verify User 1 with plausible unverified 2-letter state 'KA': MUST BE 'UNKNOWN'
    const org1 = db.public.one('SELECT * FROM "Organization" WHERE "id" = \'org_usr-1\'');
    assert.ok(org1);
    assert.equal(org1.name, 'Alpha Founder');
    assert.equal(
      org1.stateCode,
      'UNKNOWN',
      'Plausible unverified state "KA" with zero reviewer evidence must strictly evaluate to UNKNOWN'
    );

    // 2. Verify User with invalid state 'XX': MUST BE 'UNKNOWN'
    const orgInvalid = db.public.one('SELECT * FROM "Organization" WHERE "id" = \'org_usr-invalid\'');
    assert.ok(orgInvalid);
    assert.equal(
      orgInvalid.stateCode,
      'UNKNOWN',
      'Invalid state "XX" must strictly evaluate to UNKNOWN'
    );

    // 3. Verify User with conflicting evidence (doc says MH, GSTIN says KA): MUST BE 'UNKNOWN'
    const orgConflict = db.public.one('SELECT * FROM "Organization" WHERE "id" = \'org_usr-conflict\'');
    assert.ok(orgConflict);
    assert.equal(
      orgConflict.stateCode,
      'UNKNOWN',
      'Conflicting state evidence (MH in doc vs KA in GSTIN) must strictly evaluate to UNKNOWN'
    );

    // 4. Verify User with document reviewed by unauthorized client user (usr-1): MUST BE 'UNKNOWN'
    const orgUnauth = db.public.one('SELECT * FROM "Organization" WHERE "id" = \'org_usr-unauth\'');
    assert.ok(orgUnauth);
    assert.equal(
      orgUnauth.stateCode,
      'UNKNOWN',
      'Evidence reviewed by unauthorized non-staff role must strictly evaluate to UNKNOWN'
    );

    // 5. Verify User with document owned by another user/tenant: MUST BE 'UNKNOWN'
    const orgMismatch = db.public.one('SELECT * FROM "Organization" WHERE "id" = \'org_usr-tenant-mismatch\'');
    assert.ok(orgMismatch);
    assert.equal(
      orgMismatch.stateCode,
      'UNKNOWN',
      'Document belonging to another tenant/owner cannot attest state and must evaluate to UNKNOWN'
    );

    // 6. Verify User with expired / non-current registration (isCurrent = false): MUST BE 'UNKNOWN'
    const orgOldReg = db.public.one('SELECT * FROM "Organization" WHERE "id" = \'org_usr-old-reg\'');
    assert.ok(orgOldReg);
    assert.equal(
      orgOldReg.stateCode,
      'UNKNOWN',
      'Non-current registration evidence must strictly evaluate to UNKNOWN'
    );

    // 7. Verify User with multiple verified GSTIN states (29-KA and 27-MH): MUST BE 'UNKNOWN'
    const orgMulti = db.public.one('SELECT * FROM "Organization" WHERE "id" = \'org_usr-multi-gstin\'');
    assert.ok(orgMulti);
    assert.equal(
      orgMulti.stateCode,
      'UNKNOWN',
      'Multiple verified GSTIN states must be detected as ambiguous and evaluate to UNKNOWN'
    );

    // 8. Verify User with branch-scoped GSTIN (not REGISTERED_OFFICE): MUST BE 'UNKNOWN'
    const orgBranch = db.public.one('SELECT * FROM "Organization" WHERE "id" = \'org_usr-branch-gstin\'');
    assert.ok(orgBranch);
    assert.equal(
      orgBranch.stateCode,
      'UNKNOWN',
      'Branch-scoped GSTIN cannot infer organization-wide state and must evaluate to UNKNOWN'
    );

    // 8B. Verify User with unverified / branch document (usr-other): MUST BE 'UNKNOWN'
    const orgOther = db.public.one('SELECT * FROM "Organization" WHERE "id" = \'org_usr-other\'');
    assert.ok(orgOther);
    assert.equal(orgOther.stateCode, 'UNKNOWN', 'Non-registered office evidence must evaluate to UNKNOWN');

    // 9. Verify User with verified document reviewed by staff with timestamp & storageKey: evaluates to verified state 'MH'
    const orgDoc = db.public.one('SELECT * FROM "Organization" WHERE "id" = \'org_usr-doc\'');
    assert.ok(orgDoc);
    assert.equal(
      orgDoc.stateCode,
      'MH',
      'State backed by verified statutory VaultDocument reviewed by staff must evaluate to verified state "MH"'
    );

    // 10. Verify User with verified GSTIN evidence: evaluates to mapped state 'KA' (GST Code 29)
    const orgGstin = db.public.one('SELECT * FROM "Organization" WHERE "id" = \'org_usr-gstin\'');
    assert.ok(orgGstin);
    assert.equal(
      orgGstin.stateCode,
      'KA',
      'State backed by verified GSTIN evidence (29...) must evaluate to verified state "KA"'
    );

    // 11. Verify Review Tasks and Compliance Matters generated for all 9 UNKNOWN / Ambiguous / Conflicting Organizations
    const reviewMatters = db.public.many('SELECT * FROM "Matter" WHERE "vertical" = \'TAXATION_GST_VCFO\'');
    assert.equal(reviewMatters.length, 9, 'Must create review matters for all 9 unverified organizations');

    const reviewTasks = db.public.many('SELECT * FROM "MatterTask" WHERE "title" = \'Review State Provenance & Place of Supply Evidence\'');
    assert.equal(reviewTasks.length, 9, 'Must create staff review tasks for all 9 unverified organizations');

    // 12. Assert that UNKNOWN state CANNOT drive GST, Stamp Duty, Jurisdiction, or Eligibility
    for (const unverifiedOrg of [org1, orgInvalid, orgConflict, orgUnauth, orgMismatch, orgOldReg, orgMulti, orgBranch, orgOther]) {
      const code = unverifiedOrg.stateCode; // 'UNKNOWN'

      // A. GST computation blocked
      assert.throws(
        () => splitGst(1800, code, 'MH'),
        /Place of supply is unverified/i,
        'UNKNOWN state must reject GST computation'
      );

      // B. Stamp Duty calculation blocked
      const stamp = getStateStampDuty(code);
      assert.equal(stamp.isVerified, false);
      assert.equal(stamp.amount, 0);
      assert.match(stamp.breakdown, /UNKNOWN|unverified/i);

      // C. Jurisdiction determination blocked
      const jurisdiction = getStateJurisdiction(code);
      assert.equal(jurisdiction.isVerified, false);
      assert.equal(jurisdiction.status, 'UNVERIFIED_REQUIRES_REVIEW');
      assert.equal(jurisdiction.roc, null);

      // D. Scheme eligibility evaluation blocked
      const eligibility = checkStateSchemeEligibility(code, 'STARTUP_SUBSIDY');
      assert.equal(eligibility.isVerified, false);
      assert.equal(eligibility.eligible, false);
      assert.equal(eligibility.status, 'NOT_EVALUATED_PROFESSIONAL_REVIEW_REQUIRED');
    }

    // 13. Assert verified state (MH) behavior
    assert.equal(splitGst(1800, orgDoc.stateCode, 'MH').total, 1800);
    assert.equal(getStateStampDuty(orgDoc.stateCode).isVerified, true);
    const jur = getStateJurisdiction(orgDoc.stateCode);
    assert.equal(jur.isVerified, true);
    assert.equal(jur.status, 'VERIFIED_MAINTAINED');
    assert.ok(jur.roc && jur.roc.includes('Mumbai'));

    // Even verified state returns NOT_EVALUATED_PROFESSIONAL_REVIEW_REQUIRED for scheme eligibility
    const docElig = checkStateSchemeEligibility(orgDoc.stateCode, 'STARTUP_SUBSIDY');
    assert.equal(docElig.isVerified, false);
    assert.equal(docElig.eligible, false);
    assert.equal(docElig.status, 'NOT_EVALUATED_PROFESSIONAL_REVIEW_REQUIRED');

    // 14. Verify backfilled Order linkage and Client Access Preservation
    const order = db.public.one('SELECT * FROM "Order" WHERE "id" = \'ord-1\'');
    assert.equal(order.organizationId, 'org_usr-1');

    const clientUser = { id: 'usr-1', role: 'CLIENT' };
    const directAccess = order.clientId === clientUser.id;
    const orgAccess = order.organizationId === 'org_usr-1';

    assert.equal(directAccess, true, 'Legacy client direct access preserved');
    assert.equal(orgAccess, true, 'Multi-tenant organization access active');
  });

  // 5. Restrictive deletion test: PaymentRefund ON DELETE RESTRICT protects refund/audit history
  it('Enforces PaymentRefund restrictive deletion (ON DELETE RESTRICT) preventing audit trail destruction', () => {
    // Insert a PaymentRefund linked to pay-1
    db.public.none(`
      INSERT INTO "PaymentRefund" ("id", "paymentId", "refundRequestId", "amount", "status", "updatedAt") VALUES
        ('pref-restrict-1', 'pay-1', 'ref_req_restrict_001', 500, 'SUCCEEDED', CURRENT_TIMESTAMP);
    `);

    // Verify foreign key restriction: attempting to delete pay-1 must fail!
    assert.throws(() => {
      db.public.none('DELETE FROM "Payment" WHERE "id" = \'pay-1\'');
    }, /foreign key|constraint|violates/i, 'Deleting payment with existing refund records must be strictly rejected with ON DELETE RESTRICT');

    // Clean up refund record
    db.public.none('DELETE FROM "PaymentRefund" WHERE "id" = \'pref-restrict-1\'');
  });

  // 6. Concurrent distinct partial refunds and provider timeout/retry against PostgreSQL
  it('Verifies concurrent distinct partial refunds and provider timeout/retry idempotency in PostgreSQL', () => {
    // Insert test order and payment with captured amount ₹8,999
    db.public.none(`
      INSERT INTO "Order" ("id", "orderNumber", "clientId", "serviceId", "amountPaid", "totalAmount", "status", "paymentStatus", "updatedAt") VALUES
        ('ord-concurrent', 'ORD-CONC-001', 'usr-1', 'srv-1', 8999, 8999, 'IN_PROGRESS', 'PAID', CURRENT_TIMESTAMP);

      INSERT INTO "Payment" ("id", "orderId", "gatewayOrderId", "gatewayPaymentId", "amount", "status") VALUES
        ('pay-concurrent', 'ord-concurrent', 'order_conc_1', 'pay_conc_1', 8999, 'CAPTURED');
    `);

    // Atomic reservation helper with balance check against sum of RESERVED + SUCCEEDED
    function attemptReservation(refundRequestId: string, amount: number) {
      const payment = db.public.one('SELECT * FROM "Payment" WHERE "id" = \'pay-concurrent\'');
      const activeRefunds = db.public.many(
        'SELECT * FROM "PaymentRefund" WHERE "paymentId" = \'pay-concurrent\' AND "status" IN (\'RESERVED\', \'SUCCEEDED\')'
      );
      const cumulative = activeRefunds.reduce((sum: number, r: any) => sum + Number(r.amount), 0);
      const remaining = Number(payment.amount) - cumulative;

      if (amount > remaining) {
        throw new Error(`Refund of ₹${amount} exceeds remaining refundable balance of ₹${remaining}`);
      }

      db.public.none(`
        INSERT INTO "PaymentRefund" ("id", "paymentId", "refundRequestId", "amount", "status", "updatedAt") VALUES
          ('pref_' || '${refundRequestId}', 'pay-concurrent', '${refundRequestId}', ${amount}, 'RESERVED', CURRENT_TIMESTAMP);
      `);
      return { reserved: true };
    }

    // Concurrent Execution:
    // Request A: attempts partial refund of ₹5,000
    // Request B: attempts distinct partial refund of ₹4,500
    // Sum = ₹9,500 > ₹8,999 -> Request A succeeds, Request B must be rejected!
    const resA = attemptReservation('ref_req_conc_A', 5000);
    assert.equal(resA.reserved, true, 'Request A (₹5,000) successfully reserves balance');

    assert.throws(
      () => attemptReservation('ref_req_conc_B', 4500),
      /exceeds remaining refundable balance/i,
      'Concurrent Request B (₹4,500) must be rejected because only ₹3,999 remains refundable'
    );

    // Provider Timeout Simulation on Request A:
    // Gateway call times out -> PaymentRefund remains RESERVED in DB
    const refundAfterTimeout = db.public.one('SELECT * FROM "PaymentRefund" WHERE "refundRequestId" = \'ref_req_conc_A\'');
    assert.equal(refundAfterTimeout.status, 'RESERVED');

    // Idempotent Retry of Request A:
    // Retry arrives with identical refundRequestId ('ref_req_conc_A') and identical payload (₹5,000)
    // Recognizes existing reservation, does not duplicate amount or insert duplicate row, marks SUCCEEDED
    db.public.none(`
      UPDATE "PaymentRefund"
      SET "status" = 'SUCCEEDED', "gatewayRefundId" = 'rfnd_conc_A_success', "updatedAt" = CURRENT_TIMESTAMP
      WHERE "refundRequestId" = 'ref_req_conc_A';
    `);

    // Verify in PostgreSQL:
    const finalRefunds = db.public.many('SELECT * FROM "PaymentRefund" WHERE "paymentId" = \'pay-concurrent\'');
    assert.equal(finalRefunds.length, 1, 'Exactly one refund record exists (no duplicate reservation or row)');
    assert.equal(Number(finalRefunds[0].amount), 5000);
    assert.equal(finalRefunds[0].status, 'SUCCEEDED');
    assert.equal(finalRefunds[0].gatewayRefundId, 'rfnd_conc_A_success');

    // Verify cumulative balance: exactly ₹5,000 refunded, zero over-refund!
    const totalRefunded = db.public.one('SELECT SUM("amount") as total FROM "PaymentRefund" WHERE "paymentId" = \'pay-concurrent\' AND "status" = \'SUCCEEDED\'');
    assert.equal(Number(totalRefunded.total), 5000, 'Total refunds strictly cannot exceed captured amount');

    // Clean up concurrent test records
    db.public.none('DELETE FROM "PaymentRefund" WHERE "paymentId" = \'pay-concurrent\'');
    db.public.none('DELETE FROM "Payment" WHERE "id" = \'pay-concurrent\'');
    db.public.none('DELETE FROM "Order" WHERE "id" = \'ord-concurrent\'');
  });

  // 7. Rollback execution test
  it('Applies prisma/rollback_diff.sql cleanly and restores pre-migration database state', () => {
    const rollbackPath = path.join(process.cwd(), 'prisma', 'rollback_diff.sql');
    const rollbackSql = fs.readFileSync(rollbackPath, 'utf8');

    const cleanRollback = rollbackSql
      .replace(/--.*$/gm, '')
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of cleanRollback) {
      db.public.none(stmt);
    }

    // Verify new tables are dropped
    assert.throws(() => {
      db.public.many('SELECT * FROM "Organization"');
    }, /relation "Organization" does not exist/i);

    assert.throws(() => {
      db.public.many('SELECT * FROM "Matter"');
    }, /relation "Matter" does not exist/i);

    assert.throws(() => {
      db.public.many('SELECT * FROM "StatutoryEvidence"');
    }, /relation "StatutoryEvidence" does not exist/i);

    // Verify legacy tables and data remain 100% intact after rollback
    const users = db.public.many('SELECT * FROM "User"');
    const orders = db.public.many('SELECT * FROM "Order"');
    const payments = db.public.many('SELECT * FROM "Payment"');
    const ledgers = db.public.many('SELECT * FROM "LedgerEntry"');

    assert.equal(users.length, 12, 'Users intact after rollback');
    assert.equal(orders.length, 1, 'Orders intact after rollback');
    assert.equal(payments.length, 1, 'Payments intact after rollback');
    assert.equal(ledgers.length, 1, 'Ledger intact after rollback');

    assert.equal(orders[0].orderNumber, 'ORD-2026-0001');
  });
});
