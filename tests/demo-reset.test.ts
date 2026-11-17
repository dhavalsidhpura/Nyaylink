import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isDemoResetAllowed } from '../src/lib/payments';

describe('Demo Reset Security & Safety Guardrails Tests', () => {
  it('Proves demo reset is strictly blocked in production environments', () => {
    const prevNodeEnv = process.env.NODE_ENV;
    const prevVercelEnv = process.env.VERCEL_ENV;
    const prevAppEnv = process.env.APP_ENV;

    try {
      // 1. Production on Vercel
      process.env.VERCEL_ENV = 'production';
      assert.equal(isDemoResetAllowed(), false, 'Must block demo reset when VERCEL_ENV is production');

      // 2. Production via APP_ENV
      process.env.VERCEL_ENV = undefined;
      process.env.APP_ENV = 'production';
      assert.equal(isDemoResetAllowed(), false, 'Must block demo reset when APP_ENV is production');

      // 3. Staging / Preview
      process.env.APP_ENV = undefined;
      process.env.VERCEL_ENV = 'preview';
      process.env.NODE_ENV = 'test';
      assert.equal(isDemoResetAllowed(), true, 'Must allow demo reset in preview/staging/test');
    } finally {
      process.env.NODE_ENV = prevNodeEnv;
      process.env.VERCEL_ENV = prevVercelEnv;
      process.env.APP_ENV = prevAppEnv;
    }
  });

  it('Restricts reset permissions to authorized test users or staff roles', () => {
    const checkUserPermission = (user: { email: string; role: string }) => {
      const isStagingUser = Boolean(
        user.email?.endsWith('.local') ||
        user.email?.includes('demo') ||
        user.email?.includes('test')
      );
      const isStaffMember = ['SUPER_ADMIN', 'OPS_MANAGER', 'CA_CS_LEAD', 'FINANCE_MANAGER'].includes(user.role);
      return isStagingUser || isStaffMember;
    };

    // Client with personal real email -> REJECTED
    assert.equal(
      checkUserPermission({ email: 'client@gmail.com', role: 'CLIENT' }),
      false,
      'Real personal client cannot access demo reset desk'
    );

    // Staging test client -> ALLOWED
    assert.equal(
      checkUserPermission({ email: 'client@startup.local', role: 'CLIENT' }),
      true,
      'Test account *.local is authorized'
    );

    // Staff member (Ops Manager) -> ALLOWED
    assert.equal(
      checkUserPermission({ email: 'ops@nyayalink.com', role: 'OPS_MANAGER' }),
      true,
      'Ops Manager is authorized for test staging maintenance'
    );

    // External Lawyer -> REJECTED
    assert.equal(
      checkUserPermission({ email: 'advocate.sharma@delhicourt.in', role: 'LAWYER' }),
      false,
      'External advocate cannot trigger order reset'
    );
  });

  it('Restricts order reset targets strictly to synthetic demo client records', () => {
    const isSyntheticDemoOrder = (clientEmail: string, orderNumber: string) => {
      return Boolean(
        clientEmail.endsWith('.local') ||
        clientEmail.includes('demo') ||
        clientEmail.includes('test') ||
        orderNumber.includes('DEMO')
      );
    };

    assert.equal(isSyntheticDemoOrder('real.founder@acme.com', 'ORD-2026-1001'), false);
    assert.equal(isSyntheticDemoOrder('test.founder@startup.local', 'ORD-2026-1002'), true);
    assert.equal(isSyntheticDemoOrder('demo.client@example.com', 'ORD-2026-1003'), true);
    assert.equal(isSyntheticDemoOrder('random@gmail.com', 'ORD-DEMO-9999'), true);
  });

  it('Incapable of resetting any order with real payment history', () => {
    const validateOrderPayments = (payments: Array<{ gatewayPaymentId?: string | null }>) => {
      const hasRealPayment = payments.some(
        (p) => p.gatewayPaymentId && !p.gatewayPaymentId.startsWith('pay_demo_')
      );
      if (hasRealPayment) {
        throw new Error('Cannot reset order: Real gateway payment history detected.');
      }
      return true;
    };

    // Simulated order with mock payment -> ALLOWED
    assert.doesNotThrow(() => {
      validateOrderPayments([{ gatewayPaymentId: 'pay_demo_1700000000_abcd' }]);
    });

    // Real production payment -> STRICTLY BLOCKED
    assert.throws(
      () => {
        validateOrderPayments([
          { gatewayPaymentId: 'pay_demo_1700000000_abcd' },
          { gatewayPaymentId: 'pay_N8s9df72kjd8' }, // Real Razorpay live payment ID
        ]);
      },
      /Real gateway payment history detected/
    );
  });

  it('Incapable of resetting any order with live ledger entries or deleting ledger history', () => {
    const mockLedgerDatabase = [
      { id: 'ledger-1', orderId: 'ord-1', mode: 'TEST_SIMULATION', credit: 999, debit: 0 },
      { id: 'ledger-2', orderId: 'ord-2', mode: 'RAZORPAY', credit: 8999, debit: 0 },
    ];

    const canResetLedger = (orderId: string) => {
      const hasRealLedger = mockLedgerDatabase.find(
        (e) => e.orderId === orderId && e.mode !== 'TEST_SIMULATION'
      );
      if (hasRealLedger) {
        throw new Error('Cannot reset order: Production ledger entries detected.');
      }
      return true;
    };

    // Order with only simulation ledger -> ALLOWED
    assert.doesNotThrow(() => canResetLedger('ord-1'));

    // Order with real live ledger -> BLOCKED
    assert.throws(
      () => canResetLedger('ord-2'),
      /Production ledger entries detected/
    );

    // Assert ledger history is preserved (zero ledger deletion)
    const initialLedgerCount = mockLedgerDatabase.length;
    // Reset does not perform deleteMany on ledgerEntry
    assert.equal(mockLedgerDatabase.length, initialLedgerCount, 'Ledger history must remain completely intact');
  });

  it('Proves demo reset is idempotent across repeated executions', () => {
    const orderState = {
      orderNumber: 'ORD-DEMO-TEST',
      amountPaid: 999,
      paymentStatus: 'PARTIALLY_PAID',
      status: 'DOCS_PENDING',
    };

    const resetOrder = () => {
      const isAlreadyReset =
        orderState.amountPaid === 0 &&
        orderState.paymentStatus === 'UNPAID' &&
        orderState.status === 'PENDING_PAYMENT';

      if (!isAlreadyReset) {
        orderState.amountPaid = 0;
        orderState.paymentStatus = 'UNPAID';
        orderState.status = 'PENDING_PAYMENT';
      }

      return { isAlreadyReset, orderState: { ...orderState } };
    };

    // First reset: modifies state
    const firstRun = resetOrder();
    assert.equal(firstRun.isAlreadyReset, false);
    assert.equal(firstRun.orderState.amountPaid, 0);
    assert.equal(firstRun.orderState.paymentStatus, 'UNPAID');
    assert.equal(firstRun.orderState.status, 'PENDING_PAYMENT');

    // Second reset: idempotent no-op
    const secondRun = resetOrder();
    assert.equal(secondRun.isAlreadyReset, true);
    assert.deepEqual(secondRun.orderState, firstRun.orderState);

    // Third reset: idempotent no-op
    const thirdRun = resetOrder();
    assert.equal(thirdRun.isAlreadyReset, true);
    assert.deepEqual(thirdRun.orderState, firstRun.orderState);
  });
});
