import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { newDb } from 'pg-mem';

describe('Disposable Staging Database Schema Migration & Rollback Suite', () => {
  const db = newDb();

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
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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

    // Insert pre-migration production data
    db.public.none(`
      INSERT INTO "User" ("id", "email", "name", "role") VALUES
        ('usr-1', 'client.alpha@startup.com', 'Alpha Founder', 'CLIENT'),
        ('usr-2', 'lead.ops@nyayalink.com', 'Lead Ops', 'OPS_MANAGER');

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
    assert.equal(users.length, 2);
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

    assert.equal(users.length, 2, 'User records must be fully preserved');
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

  // 4. Rollback execution test
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

    assert.equal(users.length, 2, 'Users intact after rollback');
    assert.equal(orders.length, 1, 'Orders intact after rollback');
    assert.equal(payments.length, 1, 'Payments intact after rollback');
    assert.equal(ledgers.length, 1, 'Ledger intact after rollback');

    assert.equal(orders[0].orderNumber, 'ORD-2026-0001');
  });
});
