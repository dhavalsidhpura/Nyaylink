// Set dummy test secrets before importing server auth modules
process.env.NEXTAUTH_SECRET = 'test-secret-at-least-32-chars-long-dummy';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test?schema=public';

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { isStaff, orderAccess, ROLE_GROUPS, STAFF_ROLES } from '../src/lib/authz.ts';
import type { SessionUser } from '../src/lib/authz.ts';

describe('Role-Based Access Control (RBAC) & Boundary Tests', () => {
  const superAdmin: SessionUser = { id: 'usr-admin', name: 'Admin', email: 'admin@nyayalink.local', role: 'SUPER_ADMIN' };
  const opsManager: SessionUser = { id: 'usr-ops', name: 'Ops', email: 'ops@nyayalink.local', role: 'OPS_MANAGER' };
  const caLead: SessionUser = { id: 'usr-ca', name: 'CA Lead', email: 'ca@nyayalink.local', role: 'CA_CS_LEAD' };
  const complianceExec: SessionUser = { id: 'usr-exec', name: 'Compliance Exec', email: 'exec@nyayalink.local', role: 'COMPLIANCE_EXEC' };
  const financeManager: SessionUser = { id: 'usr-fin', name: 'Finance Mgr', email: 'finance@nyayalink.local', role: 'FINANCE_MANAGER' };
  const lawyer: SessionUser = { id: 'usr-law', name: 'Advocate', email: 'advocate@nyayalink.local', role: 'LAWYER' };
  const clientOwner: SessionUser = { id: 'usr-client-1', name: 'Client Owner', email: 'client1@nyayalink.local', role: 'CLIENT' };
  const clientOther: SessionUser = { id: 'usr-client-2', name: 'Other Client', email: 'client2@nyayalink.local', role: 'CLIENT' };

  test('isStaff identifies back-office staff roles and rejects client and external lawyer roles', () => {
    assert.strictEqual(isStaff('SUPER_ADMIN'), true);
    assert.strictEqual(isStaff('OPS_MANAGER'), true);
    assert.strictEqual(isStaff('CA_CS_LEAD'), true);
    assert.strictEqual(isStaff('COMPLIANCE_EXEC'), true);
    assert.strictEqual(isStaff('FINANCE_MANAGER'), true);

    // Clients and marketplace lawyers are NOT staff
    assert.strictEqual(isStaff('CLIENT'), false);
    assert.strictEqual(isStaff('LAWYER'), false);
  });

  test('ROLE_GROUPS enforces least-privilege boundary definitions', () => {
    // Only Super Admin in superAdmin group
    assert.deepStrictEqual(ROLE_GROUPS.superAdmin, ['SUPER_ADMIN']);

    // Only Finance and Super Admin can access finance ledger/payouts
    assert.deepStrictEqual(ROLE_GROUPS.finance, ['SUPER_ADMIN', 'FINANCE_MANAGER']);
    assert.strictEqual(ROLE_GROUPS.finance.includes('OPS_MANAGER'), false);
    assert.strictEqual(ROLE_GROUPS.finance.includes('CA_CS_LEAD'), false);

    // Caseworkers group includes technical legal staff, but excludes finance
    assert.deepStrictEqual(ROLE_GROUPS.caseworkers, ['SUPER_ADMIN', 'OPS_MANAGER', 'CA_CS_LEAD', 'COMPLIANCE_EXEC']);
    assert.strictEqual(ROLE_GROUPS.caseworkers.includes('FINANCE_MANAGER'), false);

    // Assignable caseworkers
    assert.deepStrictEqual(ROLE_GROUPS.assignable, ['CA_CS_LEAD', 'COMPLIANCE_EXEC']);
  });

  test('orderAccess: Client can only view their own order, never another client\'s order', () => {
    const order = { clientId: clientOwner.id, assignedCAId: null };

    // Owner gets client access
    assert.strictEqual(orderAccess(clientOwner, order), 'client');

    // Another client gets null (forbidden / access denied)
    assert.strictEqual(orderAccess(clientOther, order), null);
  });

  test('orderAccess: Compliance Executive can only view orders assigned to them', () => {
    const assignedOrder = { clientId: clientOwner.id, assignedCAId: complianceExec.id };
    const unassignedOrder = { clientId: clientOwner.id, assignedCAId: 'another-staff-id' };

    // Assigned order -> staff access
    assert.strictEqual(orderAccess(complianceExec, assignedOrder), 'staff');

    // Unassigned order -> null (denied)
    assert.strictEqual(orderAccess(complianceExec, unassignedOrder), null);
  });

  test('orderAccess: Supervisory roles have administrative staff clearance', () => {
    const order = { clientId: clientOwner.id, assignedCAId: null };

    assert.strictEqual(orderAccess(superAdmin, order), 'staff');
    assert.strictEqual(orderAccess(opsManager, order), 'staff');
    assert.strictEqual(orderAccess(caLead, order), 'staff');
  });

  test('orderAccess: Finance and Lawyer roles cannot access privileged case documents', () => {
    const order = { clientId: clientOwner.id, assignedCAId: null };

    // Finance staff cannot access case documents / dockets
    assert.strictEqual(orderAccess(financeManager, order), null);

    // Lawyers cannot access corporate docket cases
    assert.strictEqual(orderAccess(lawyer, order), null);
  });
});
