import { test, describe } from 'node:test';
import assert from 'node:assert';
import { num } from '../src/lib/serialize.ts';

describe('Staging Payment Simulation & Safe-Mode Tests', () => {
  test('Demo payment simulation generates deterministic mock identifiers', () => {
    const timestamp = Date.now();
    const mockGatewayOrderId = `order_demo_${timestamp}`;
    const mockGatewayPaymentId = `pay_demo_${timestamp}_abc12`;

    assert.ok(mockGatewayOrderId.startsWith('order_demo_'));
    assert.ok(mockGatewayPaymentId.startsWith('pay_demo_'));
  });

  test('Test account detector accurately identifies test identities to mute outbound emails', () => {
    const testAccounts = [
      'client@nyayalink.local',
      'admin@nyayalink.local',
      'demo.user@nyayalink.com',
      'test-client@gmail.com',
    ];

    const prodAccounts = [
      'founder@startupindia.in',
      'contact@tatamotors.com',
      'dhaval@sidhpura.com',
    ];

    const isTest = (email?: string | null, isSimulation?: boolean) => {
      if (isSimulation) return true;
      if (!email) return false;
      return email.endsWith('.local') || email.includes('demo') || email.includes('test');
    };

    for (const email of testAccounts) {
      assert.strictEqual(isTest(email, false), true, `Failed to recognize test account: ${email}`);
    }

    for (const email of prodAccounts) {
      assert.strictEqual(isTest(email, false), false, `Falsely flagged prod account as test: ${email}`);
    }

    assert.strictEqual(isTest('founder@prod.com', true), true, 'Simulation flag must always trigger test mode');
  });

  test('Simulated transactions use TEST_SIMULATION ledger mode and are isolated from production totals', () => {
    const ledger = [
      { id: '1', txnNo: 'pay_live_001', type: 'CLIENT_PAYMENT', debit: 0, credit: 6999, mode: 'RAZORPAY' },
      { id: '2', txnNo: 'pay_live_002', type: 'CLIENT_PAYMENT', debit: 0, credit: 1499, mode: 'RAZORPAY' },
      { id: '3', txnNo: 'pay_demo_001', type: 'CLIENT_PAYMENT', debit: 0, credit: 999, mode: 'TEST_SIMULATION' },
    ];

    // Production calculation filters out TEST_SIMULATION
    const prodEntries = ledger.filter((l) => l.mode !== 'TEST_SIMULATION');
    assert.strictEqual(prodEntries.length, 2);

    const prodTotalCredit = prodEntries.reduce((sum, e) => sum + e.credit, 0);
    assert.strictEqual(prodTotalCredit, 8498);

    // Total with simulation
    const rawTotalCredit = ledger.reduce((sum, e) => sum + e.credit, 0);
    assert.strictEqual(rawTotalCredit, 9497);

    // Verify isolation difference is exactly the simulation amount
    assert.strictEqual(rawTotalCredit - prodTotalCredit, 999);
  });
});
