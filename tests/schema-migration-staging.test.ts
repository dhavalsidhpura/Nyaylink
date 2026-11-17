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
    // 1. usr-1: Plausible unverified 2-letter state 'KA' (no reviewer document/audit)
    // 2. usr-invalid: Invalid state code 'XX'
    // 3. usr-doc: Client with verified statutory document reviewed by staff with timestamp & storageKey
    // 4. usr-gstin: Client with verified statutory GSTIN prefix '29'
    // 5. usr-conflict: Client with verified document (MH) conflicting with verified GSTIN (KA)
    db.public.none(`
      INSERT INTO "User" ("id", "email", "name", "role", "state", "gstin") VALUES
        ('usr-1', 'client.alpha@startup.com', 'Alpha Founder', 'CLIENT', 'KA', NULL),
        ('usr-invalid', 'client.invalid@test.com', 'Invalid State User', 'CLIENT', 'XX', NULL),
        ('usr-doc', 'client.verified.doc@mfg.com', 'Verified Doc Client', 'CLIENT', 'MH', NULL),
        ('usr-gstin', 'client.verified.gstin@tech.com', 'Verified GSTIN Client', 'CLIENT', NULL, '29AABCU9603R1ZM'),
        ('usr-conflict', 'client.conflict@ventures.com', 'Conflicting Evidence Client', 'CLIENT', 'MH', '29AABCU9603R1ZM'),
        ('usr-2', 'lead.ops@nyayalink.com', 'Lead Ops', 'OPS_MANAGER', 'MH', NULL);

      INSERT INTO "VaultDocument" ("id", "ownerId", "status", "category", "reviewedById", "reviewedAt", "storageKey") VALUES
        ('doc-1', 'usr-doc', 'VERIFIED', 'STATE_VERIFICATION', 'usr-2', CURRENT_TIMESTAMP, 's3://vault/doc-1.pdf'),
        ('doc-conflict', 'usr-conflict', 'VERIFIED', 'STATE_VERIFICATION', 'usr-2', CURRENT_TIMESTAMP, 's3://vault/doc-conflict.pdf');

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
    assert.equal(users.length, 6);
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

    assert.equal(users.length, 6, 'User records must be fully preserved');
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
    // Insert verified GSTIN audit log records before executing backfill
    db.public.none(`
      INSERT INTO "AuditLog" ("id", "action", "entityType", "entityId", "actorId", "createdAt", "details") VALUES
        ('aud-gstin-1', 'GSTIN_VERIFIED', 'User', 'usr-gstin', 'usr-2', CURRENT_TIMESTAMP, CAST('{"verifiedGstin": "29AABCU9603R1ZM"}' AS JSONB)),
        ('aud-conflict', 'GSTIN_VERIFIED', 'User', 'usr-conflict', 'usr-2', CURRENT_TIMESTAMP, CAST('{"verifiedGstin": "29AABCU9603R1ZM"}' AS JSONB));
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

    // 4. Verify User with verified document reviewed by staff with timestamp & storageKey: evaluates to verified state 'MH'
    const orgDoc = db.public.one('SELECT * FROM "Organization" WHERE "id" = \'org_usr-doc\'');
    assert.ok(orgDoc);
    assert.equal(
      orgDoc.stateCode,
      'MH',
      'State backed by verified statutory VaultDocument reviewed by staff must evaluate to verified state "MH"'
    );

    // 5. Verify User with verified GSTIN audit log: evaluates to mapped state 'KA' (GST Code 29)
    const orgGstin = db.public.one('SELECT * FROM "Organization" WHERE "id" = \'org_usr-gstin\'');
    assert.ok(orgGstin);
    assert.equal(
      orgGstin.stateCode,
      'KA',
      'State backed by verified GSTIN audit log (29...) must evaluate to verified state "KA"'
    );

    // 6. Verify Review Tasks and Compliance Matters generated for UNKNOWN / Ambiguous / Conflicting Organizations
    const reviewMatters = db.public.many('SELECT * FROM "Matter" WHERE "vertical" = \'TAXATION_GST_VCFO\'');
    assert.equal(reviewMatters.length, 3, 'Must create review matters for all 3 unverified organizations (usr-1, usr-invalid, usr-conflict)');

    const reviewTasks = db.public.many('SELECT * FROM "MatterTask" WHERE "title" = \'Review State Provenance & Place of Supply Evidence\'');
    assert.equal(reviewTasks.length, 3, 'Must create staff review tasks for all 3 unverified organizations');

    // 7. Assert that UNKNOWN state CANNOT drive GST, Stamp Duty, Jurisdiction, or Eligibility
    for (const unverifiedOrg of [org1, orgInvalid, orgConflict]) {
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

    // 8. Assert verified state (MH) behavior
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

    // 9. Verify backfilled Order linkage and Client Access Preservation
    const order = db.public.one('SELECT * FROM "Order" WHERE "id" = \'ord-1\'');
    assert.equal(order.organizationId, 'org_usr-1');

    const clientUser = { id: 'usr-1', role: 'CLIENT' };
    const directAccess = order.clientId === clientUser.id;
    const orgAccess = order.organizationId === 'org_usr-1';

    assert.equal(directAccess, true, 'Legacy client direct access preserved');
    assert.equal(orgAccess, true, 'Multi-tenant organization access active');
  });

  // 5. Rollback execution test
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

    // Verify legacy tables and data remain 100% intact after rollback
    const users = db.public.many('SELECT * FROM "User"');
    const orders = db.public.many('SELECT * FROM "Order"');
    const payments = db.public.many('SELECT * FROM "Payment"');
    const ledgers = db.public.many('SELECT * FROM "LedgerEntry"');

    assert.equal(users.length, 6, 'Users intact after rollback');
    assert.equal(orders.length, 1, 'Orders intact after rollback');
    assert.equal(payments.length, 1, 'Payments intact after rollback');
    assert.equal(ledgers.length, 1, 'Ledger intact after rollback');

    assert.equal(orders[0].orderNumber, 'ORD-2026-0001');
  });
});
