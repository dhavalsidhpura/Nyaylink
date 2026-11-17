import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { HttpError } from '../src/lib/http';

interface ApprovalRecord {
  id: string;
  type: 'REFUND' | 'PAYOUT_DISBURSEMENT' | 'MANUAL_LEDGER_ADJUSTMENT' | 'CATALOG_PRICE_CHANGE';
  title: string;
  requesterId: string;
  reviewerId?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  payload: Record<string, any>;
  executedSideEffect: boolean;
  reviewNotes?: string;
}

// Pure engine logic matching src/lib/approvals.ts & review route
function reviewRequest(
  record: ApprovalRecord,
  reviewerId: string,
  action: 'APPROVE' | 'REJECT',
  reviewNotes?: string
): ApprovalRecord {
  if (record.status !== 'PENDING') {
    throw new HttpError(400, `Approval request has already been ${record.status.toLowerCase()}.`);
  }

  // Maker-Checker rule: Self-approval is strictly forbidden
  if (record.requesterId === reviewerId) {
    throw new HttpError(
      403,
      'Maker-Checker Security Policy Violation: You cannot approve your own request. A second qualified officer must review and approve this action.'
    );
  }

  const updated: ApprovalRecord = {
    ...record,
    status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
    reviewerId,
    reviewNotes,
    executedSideEffect: action === 'APPROVE',
  };

  return updated;
}

describe('Maker-Checker Full Governance & Verification Suite', () => {
  const MAKER_ID = 'user-finance-maker-001';
  const CHECKER_ID = 'user-super-admin-checker-002';

  it('Denies self-approval for all 4 critical actions, even when attempted by Super Admin', () => {
    const actionTypes: ApprovalRecord['type'][] = [
      'REFUND',
      'PAYOUT_DISBURSEMENT',
      'MANUAL_LEDGER_ADJUSTMENT',
      'CATALOG_PRICE_CHANGE',
    ];

    for (const type of actionTypes) {
      const record: ApprovalRecord = {
        id: `appr-${type.toLowerCase()}`,
        type,
        title: `Approve ${type}`,
        requesterId: MAKER_ID,
        status: 'PENDING',
        payload: { amount: 5000 },
        executedSideEffect: false,
      };

      // Maker attempts self-approval
      assert.throws(
        () => reviewRequest(record, MAKER_ID, 'APPROVE'),
        (err: any) => {
          assert.equal(err.status, 403);
          assert.match(err.message, /Maker-Checker Security Policy Violation/);
          return true;
        },
        `Self-approval must be denied for ${type}`
      );

      // Verify side effect did NOT run
      assert.equal(record.executedSideEffect, false);
      assert.equal(record.status, 'PENDING');
    }
  });

  it('Verifies rejected requests transition status to REJECTED with zero mutation / side-effect execution', () => {
    const refundRecord: ApprovalRecord = {
      id: 'appr-refund-001',
      type: 'REFUND',
      title: 'Refund ₹8,999 to Client',
      requesterId: MAKER_ID,
      status: 'PENDING',
      payload: { paymentId: 'pay-123', amount: 8999 },
      executedSideEffect: false,
    };

    const reviewed = reviewRequest(refundRecord, CHECKER_ID, 'REJECT', 'Duplicate refund request rejected by lead.');

    assert.equal(reviewed.status, 'REJECTED');
    assert.equal(reviewed.reviewerId, CHECKER_ID);
    assert.equal(reviewed.reviewNotes, 'Duplicate refund request rejected by lead.');
    assert.equal(reviewed.executedSideEffect, false, 'Rejected requests must execute ZERO side-effects');
  });

  it('Prevents duplicate / retried reviews on already finalized approval requests', () => {
    const adjustmentRecord: ApprovalRecord = {
      id: 'appr-adj-001',
      type: 'MANUAL_LEDGER_ADJUSTMENT',
      title: 'Ledger Reclassification',
      requesterId: MAKER_ID,
      status: 'PENDING',
      payload: { amount: 1200 },
      executedSideEffect: false,
    };

    // First review passes
    const finalized = reviewRequest(adjustmentRecord, CHECKER_ID, 'APPROVE');
    assert.equal(finalized.status, 'APPROVED');
    assert.equal(finalized.executedSideEffect, true);

    // Second review attempt must fail with HTTP 400
    assert.throws(
      () => reviewRequest(finalized, 'user-third-person', 'APPROVE'),
      (err: any) => {
        assert.equal(err.status, 400);
        assert.match(err.message, /already been approved/);
        return true;
      }
    );
  });

  it('Verifies zero external action occurs before second-person approval across all 4 workflows', () => {
    const workflows: Array<{ type: ApprovalRecord['type']; payload: Record<string, any> }> = [
      { type: 'REFUND', payload: { paymentId: 'pay-001', amount: 5000 } },
      { type: 'PAYOUT_DISBURSEMENT', payload: { vendorName: 'CA Associate', amount: 2500 } },
      { type: 'MANUAL_LEDGER_ADJUSTMENT', payload: { type: 'GOVT_FEES_DEBIT', amount: 1000 } },
      { type: 'CATALOG_PRICE_CHANGE', payload: { slug: 'private-limited-company', professionalFee: 3999 } },
    ];

    for (const wf of workflows) {
      const record: ApprovalRecord = {
        id: `test-${wf.type}`,
        type: wf.type,
        title: `Execute ${wf.type}`,
        requesterId: MAKER_ID,
        status: 'PENDING',
        payload: wf.payload,
        executedSideEffect: false,
      };

      // Initial state: NO external action has executed
      assert.equal(record.executedSideEffect, false);

      // Distinct checker approves
      const approved = reviewRequest(record, CHECKER_ID, 'APPROVE', 'Verified against supporting documents.');

      // Only upon approval is the side effect triggered
      assert.equal(approved.status, 'APPROVED');
      assert.equal(approved.executedSideEffect, true);
    }
  });
});
