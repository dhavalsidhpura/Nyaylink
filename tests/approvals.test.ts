import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Maker-Checker Security & Governance Policy', () => {
  const requester = { id: 'usr-fin-maker', role: 'FINANCE_MANAGER', email: 'maker@nyayalink.local' };
  const sameOfficer = { id: 'usr-fin-maker', role: 'SUPER_ADMIN', email: 'maker@nyayalink.local' };
  const checkerOfficer = { id: 'usr-fin-checker', role: 'FINANCE_MANAGER', email: 'checker@nyayalink.local' };

  test('Self-approval is strictly forbidden even if the user holds Super Admin privileges', () => {
    const approvalRequest = {
      id: 'app-001',
      requesterId: requester.id,
      status: 'PENDING',
      type: 'REFUND',
      title: 'Refund of ₹6,999',
    };

    const attemptApproval = (reviewerId: string) => {
      if (approvalRequest.requesterId === reviewerId) {
        throw new Error('Maker-Checker Security Policy Violation: You cannot approve your own request.');
      }
      return { status: 'APPROVED', reviewerId };
    };

    // Attempt 1: Same user attempts to approve their own request -> Throws error
    assert.throws(
      () => attemptApproval(sameOfficer.id),
      /Maker-Checker Security Policy Violation/
    );

    // Attempt 2: A different qualified officer reviews and approves -> Succeeds
    const result = attemptApproval(checkerOfficer.id);
    assert.strictEqual(result.status, 'APPROVED');
    assert.strictEqual(result.reviewerId, checkerOfficer.id);
  });

  test('Double-Entry Balance Validation verifies that debit sum strictly equals credit sum', () => {
    const validLines = [
      { accountCode: '1001', debit: 6999, credit: 0 }, // Bank clearing (Debit Asset)
      { accountCode: '4001', debit: 0, credit: 5931.36 }, // Revenue (Credit Revenue)
      { accountCode: '2002', debit: 0, credit: 533.82 }, // CGST Payable (Credit Liability)
      { accountCode: '2003', debit: 0, credit: 533.82 }, // SGST Payable (Credit Liability)
    ];

    const sumDebit = validLines.reduce((s, l) => s + l.debit, 0);
    const sumCredit = Math.round(validLines.reduce((s, l) => s + l.credit, 0) * 100) / 100;

    assert.strictEqual(sumDebit, 6999);
    assert.strictEqual(sumCredit, 6999);
    assert.strictEqual(sumDebit - sumCredit, 0, 'Journal entry must be balanced');

    const unbalancedLines = [
      { accountCode: '1001', debit: 5000, credit: 0 },
      { accountCode: '4001', debit: 0, credit: 4000 },
    ];

    const isBalanced = (lines: typeof unbalancedLines) => {
      const d = lines.reduce((s, l) => s + l.debit, 0);
      const c = lines.reduce((s, l) => s + l.credit, 0);
      return Math.abs(d - c) < 0.001;
    };

    assert.strictEqual(isBalanced(unbalancedLines), false, 'Unbalanced journal entry must be rejected');
  });

  test('Conditional Pure Agent (Rule 33) requires explicit transaction verification evidence', () => {
    const isPureAgentEligible = (item: { isStatutoryPassThrough: boolean; hasOfficialChallanEvidence: boolean; clientBilledAtActuals: boolean }) => {
      // Under Rule 33 of CGST Rules, 2017:
      // All 3 conditions must be met to exclude from GST value
      return item.isStatutoryPassThrough && item.hasOfficialChallanEvidence && item.clientBilledAtActuals;
    };

    assert.strictEqual(
      isPureAgentEligible({ isStatutoryPassThrough: true, hasOfficialChallanEvidence: true, clientBilledAtActuals: true }),
      true
    );

    // If challan receipt evidence is missing, it cannot be treated as pure agent
    assert.strictEqual(
      isPureAgentEligible({ isStatutoryPassThrough: true, hasOfficialChallanEvidence: false, clientBilledAtActuals: true }),
      false
    );
  });
});
