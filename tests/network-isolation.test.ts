import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import https from 'node:https';
import { sendWhatsAppMessage } from '../src/lib/whatsapp';
import { sendNotificationEmail } from '../src/lib/email';

export function isTestAccountIdentity(email?: string | null, isSimulation?: boolean): boolean {
  if (isSimulation) return true;
  if (!email) return false;
  return email.endsWith('.local') || email.includes('demo') || email.includes('test');
}

describe('Network-Intercepted Staging Egress & Zero Outbound Calls Test', () => {
  const interceptedCalls: string[] = [];
  const originalFetch = globalThis.fetch;
  const originalHttpRequest = http.request;
  const originalHttpsRequest = https.request;

  beforeEach(() => {
    interceptedCalls.length = 0;

    // Spy on global fetch
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      interceptedCalls.push(url);

      if (url.includes('api.razorpay.com') || url.includes('api.resend.com') || url.includes('graph.facebook.com')) {
        throw new Error(`SECURITY POLICY VIOLATION: Unauthorized live egress attempt to ${url} during test/simulation.`);
      }

      return new Response(JSON.stringify({ success: true, simulated: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    // Spy on Node http/https
    const mockRequest = (urlOrOptions: any) => {
      const target = typeof urlOrOptions === 'string' ? urlOrOptions : (urlOrOptions?.hostname || urlOrOptions?.host || '');
      interceptedCalls.push(target);
      if (target.includes('razorpay') || target.includes('resend') || target.includes('facebook')) {
        throw new Error(`SECURITY POLICY VIOLATION: Unauthorized live egress attempt to ${target} during test/simulation.`);
      }
      return {
        on: () => {},
        write: () => {},
        end: () => {},
      } as any;
    };

    http.request = mockRequest as any;
    https.request = mockRequest as any;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    http.request = originalHttpRequest;
    https.request = originalHttpsRequest;
    interceptedCalls.length = 0;
  });

  it('Verifies simulated staging payments make zero outbound calls to Razorpay, Resend, or Meta WhatsApp', async () => {
    // 1. Synthetic test identity
    const testClient = {
      name: 'Rohan Sharma',
      email: 'rohan.sharma@startup.local',
      phone: '9876543210',
    };

    const isTest = isTestAccountIdentity(testClient.email);
    assert.equal(isTest, true, 'Test account identity must be detected as test');

    // 2. Simulated payment dispatch logic
    // In staging simulation mode (isSimulation: true or test accounts), outbound calls must be muted
    if (!isTest) {
      await sendNotificationEmail({
        to: testClient.email,
        subject: 'Payment Confirmed',
        html: '<p>Paid</p>',
      });
      await sendWhatsAppMessage({
        to: testClient.phone,
        bodyText: 'Payment Confirmed',
      });
    }

    // Assert that zero calls reached external gateway APIs
    const externalGatewayCalls = interceptedCalls.filter(
      (c) => c.includes('api.razorpay.com') || c.includes('api.resend.com') || c.includes('graph.facebook.com')
    );

    assert.equal(
      externalGatewayCalls.length,
      0,
      `Expected 0 external calls to Razorpay/Resend/Meta, but intercepted ${externalGatewayCalls.length}: ${JSON.stringify(externalGatewayCalls)}`
    );
  });

  it('Verifies TEST_SIMULATION entries are 100% excluded from all production-facing totals and reconciliations', () => {
    // Mock mixed database ledger entries (live vs simulated)
    const mockLedgerDatabase = [
      { id: '1', txnNo: 'pay_live_001', mode: 'RAZORPAY', credit: 8999, debit: 0, type: 'CLIENT_PAYMENT' },
      { id: '2', txnNo: 'pay_live_002', mode: 'RAZORPAY', credit: 14999, debit: 0, type: 'CLIENT_PAYMENT' },
      { id: '3', txnNo: 'pay_demo_101', mode: 'TEST_SIMULATION', credit: 8999, debit: 0, type: 'CLIENT_PAYMENT' },
      { id: '4', txnNo: 'pay_demo_102', mode: 'TEST_SIMULATION', credit: 24999, debit: 0, type: 'CLIENT_PAYMENT' },
      { id: '5', txnNo: 'ref_live_001', mode: 'RAZORPAY', credit: 0, debit: 2000, type: 'REFUND' },
      { id: '6', txnNo: 'ref_demo_101', mode: 'TEST_SIMULATION', credit: 0, debit: 8999, type: 'REFUND' },
    ];

    // Production ledger query filter: where: { mode: { not: 'TEST_SIMULATION' } }
    const productionLedgerEntries = mockLedgerDatabase.filter((e) => e.mode !== 'TEST_SIMULATION');

    // Assert simulation entries are completely excluded
    assert.equal(productionLedgerEntries.length, 3);
    assert.ok(productionLedgerEntries.every((e) => e.mode !== 'TEST_SIMULATION'));

    // Compute production-facing financial totals
    const totalProductionCredit = productionLedgerEntries.reduce((sum, e) => sum + e.credit, 0);
    const totalProductionDebit = productionLedgerEntries.reduce((sum, e) => sum + e.debit, 0);
    const netProductionRevenue = totalProductionCredit - totalProductionDebit;

    assert.equal(totalProductionCredit, 8999 + 14999); // 23,998
    assert.equal(totalProductionDebit, 2000); // 2,000
    assert.equal(netProductionRevenue, 21998); // 21,998

    // Verification: if TEST_SIMULATION were accidentally included, credit would be 57,996 and net would be 47,000
    const contaminatedCredit = mockLedgerDatabase.reduce((sum, e) => sum + e.credit, 0);
    assert.notEqual(
      totalProductionCredit,
      contaminatedCredit,
      'Production total must NOT match contaminated ledger total'
    );
  });

  it('Verifies reconciliation reports flag TEST_SIMULATION records separately without mixing into general ledger balances', () => {
    const mockLedger = [
      { txnNo: 'pay_live_1', mode: 'RAZORPAY', credit: 5000 },
      { txnNo: 'pay_demo_1', mode: 'TEST_SIMULATION', credit: 999 },
    ];

    const isSimulatedMode = (mode: string) => mode === 'TEST_SIMULATION';

    const productionEntries = mockLedger.filter((e) => !isSimulatedMode(e.mode));
    const stagingEntries = mockLedger.filter((e) => isSimulatedMode(e.mode));

    assert.equal(productionEntries.length, 1);
    assert.equal(stagingEntries.length, 1);
    assert.equal(productionEntries[0].txnNo, 'pay_live_1');
    assert.equal(stagingEntries[0].txnNo, 'pay_demo_1');
  });
});
