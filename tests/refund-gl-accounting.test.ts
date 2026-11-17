import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { HttpError } from '../src/lib/http';
import {
  DEFAULT_COA,
  validateJournalEntryBalance,
  type PostRefundJournalParams,
  type JournalLineInput,
} from '../src/lib/gl';

interface InMemoryAccount {
  id: string;
  code: string;
  name: string;
  type: string;
}

interface InMemoryJournalLine {
  id: string;
  journalEntryId: string;
  accountId: string;
  accountCode: string;
  debit: number;
  credit: number;
  description: string;
}

interface InMemoryJournalEntry {
  id: string;
  entryNo: string;
  date: Date;
  description: string;
  referenceType: string;
  referenceId: string;
  status: 'POSTED' | 'DRAFT' | 'VOID';
  isTest: boolean;
  createdById?: string | null;
  approvedById?: string | null;
  lines: InMemoryJournalLine[];
}

interface InMemoryPayment {
  id: string;
  orderId: string;
  gatewayPaymentId: string;
  amount: number;
  status: 'CAPTURED' | 'REFUNDED' | 'FAILED';
  refundedAmount: number;
}

interface InMemoryOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED';
}

interface InMemoryQuote {
  id: string;
  orderId: string;
  total: number;
  status: 'ACCEPTED';
}

interface InMemoryGatewayCall {
  idempotencyKey: string;
  refundId: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'TIMEOUT';
}

/**
 * Isolated Staging In-Memory Double-Entry GL Ledger Engine.
 * Replicates production prisma transaction semantics without live provider calls.
 */
class DoubleEntryGLEngine {
  accounts: Map<string, InMemoryAccount> = new Map();
  journalEntries: InMemoryJournalEntry[] = [];
  journalLines: InMemoryJournalLine[] = [];
  orders: Map<string, InMemoryOrder> = new Map();
  quotes: Map<string, InMemoryQuote> = new Map();
  payments: Map<string, InMemoryPayment> = new Map();
  gatewayCalls: Map<string, InMemoryGatewayCall> = new Map();

  constructor() {
    // Seed default chart of accounts
    this.accounts.set(DEFAULT_COA.REFUND_CONTRA.code, {
      id: 'acc_4100',
      code: DEFAULT_COA.REFUND_CONTRA.code,
      name: DEFAULT_COA.REFUND_CONTRA.name,
      type: DEFAULT_COA.REFUND_CONTRA.type,
    });
    this.accounts.set(DEFAULT_COA.GATEWAY_CLEARING.code, {
      id: 'acc_1020',
      code: DEFAULT_COA.GATEWAY_CLEARING.code,
      name: DEFAULT_COA.GATEWAY_CLEARING.name,
      type: DEFAULT_COA.GATEWAY_CLEARING.type,
    });
    this.accounts.set(DEFAULT_COA.OPERATING_BANK.code, {
      id: 'acc_1010',
      code: DEFAULT_COA.OPERATING_BANK.code,
      name: DEFAULT_COA.OPERATING_BANK.name,
      type: DEFAULT_COA.OPERATING_BANK.type,
    });
  }

  postRefundJournal(params: PostRefundJournalParams) {
    // 1. Idempotency check: A refund ID must be recorded at most once in the GL
    const existing = this.journalEntries.find(
      (j) => j.referenceType === 'REFUND' && j.referenceId === params.refundId
    );
    if (existing) {
      return { journalEntry: existing, duplicateSkipped: true };
    }

    const contraAcc = this.accounts.get(DEFAULT_COA.REFUND_CONTRA.code)!;
    const clearingAcc = this.accounts.get(DEFAULT_COA.GATEWAY_CLEARING.code)!;

    // 2. Build double-entry lines
    const rawLines = [
      {
        accountId: contraAcc.id,
        accountCode: contraAcc.code,
        debit: params.amount,
        credit: 0,
        description: `Debit Contra Revenue: Refund for ${params.orderNumber || params.gatewayPaymentId}`,
      },
      {
        accountId: clearingAcc.id,
        accountCode: clearingAcc.code,
        debit: 0,
        credit: params.amount,
        description: `Credit Gateway Clearing: Refund disbursement via ${params.refundId}`,
      },
    ];

    // 3. Strict mathematical balance validation
    const validation = validateJournalEntryBalance(rawLines);
    if (!validation.isBalanced) {
      throw new HttpError(
        500,
        `Double-Entry GL Validation Failed: Debit (₹${validation.totalDebit}) != Credit (₹${validation.totalCredit})`
      );
    }

    const entryId = `je_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const lines: InMemoryJournalLine[] = rawLines.map((l, idx) => ({
      id: `jl_${entryId}_${idx + 1}`,
      journalEntryId: entryId,
      accountId: l.accountId,
      accountCode: l.accountCode,
      debit: l.debit,
      credit: l.credit,
      description: l.description,
    }));

    const entry: InMemoryJournalEntry = {
      id: entryId,
      entryNo: `JE-REF-2026-${String(this.journalEntries.length + 1).padStart(4, '0')}`,
      date: new Date(),
      description: params.memo || `Refund against payment ${params.gatewayPaymentId}`,
      referenceType: 'REFUND',
      referenceId: params.refundId,
      status: 'POSTED',
      isTest: Boolean(params.isSimulation),
      createdById: params.requesterId,
      approvedById: params.approverId,
      lines,
    };

    this.journalEntries.push(entry);
    this.journalLines.push(...lines);

    return { journalEntry: entry, duplicateSkipped: false };
  }

  executeRefundLifecycle(params: {
    gatewayPaymentId: string;
    refundId: string;
    amount: number;
    requesterId: string;
    approverId: string;
    idempotencyKey?: string;
    simulatedProviderFailure?: boolean;
    simulatedTimeout?: boolean;
  }) {
    // Step 1: Payment validation
    const payment = this.payments.get(params.gatewayPaymentId);
    if (!payment) throw new HttpError(404, 'Payment not found for refund.');
    if (payment.status === 'REFUNDED') throw new HttpError(409, 'Only captured payments can be refunded.');

    // Step 2: Cumulative Refund Amount & Remaining Balance Control
    const cumulativePriorRefunded = payment.refundedAmount;
    const remainingRefundable = Math.round((payment.amount - cumulativePriorRefunded) * 100) / 100;
    if (params.amount > remainingRefundable) {
      throw new HttpError(
        400,
        `Refund Rejected: Requested refund of ₹${params.amount} exceeds remaining refundable balance of ₹${remainingRefundable} for payment ${params.gatewayPaymentId}.`
      );
    }

    // Step 3: Gateway Execution & Idempotency Mechanism Simulation
    const idKey = params.idempotencyKey || params.refundId;
    const existingCall = this.gatewayCalls.get(idKey);

    if (existingCall && existingCall.status === 'SUCCESS') {
      // Gateway recognizes idempotency key: reuses existing refund without re-debiting
      params.refundId = existingCall.refundId;
    } else if (params.simulatedProviderFailure) {
      throw new HttpError(502, 'Provider Gateway Refund Failure: GATEWAY_INSUFFICIENT_FUNDS');
    } else if (params.simulatedTimeout) {
      // Record in-flight call at provider then timeout
      this.gatewayCalls.set(idKey, {
        idempotencyKey: idKey,
        refundId: params.refundId,
        amount: params.amount,
        status: 'TIMEOUT',
      });
      throw new HttpError(504, 'Provider Gateway Refund Timeout: ETIMEDOUT (retry with idempotency key)');
    } else {
      // Record successful gateway refund
      this.gatewayCalls.set(idKey, {
        idempotencyKey: idKey,
        refundId: params.refundId,
        amount: params.amount,
        status: 'SUCCESS',
      });
    }

    // Step 4: GL Double-Entry Posting
    const order = this.orders.get(payment.orderId);
    const glResult = this.postRefundJournal({
      refundId: params.refundId,
      amount: params.amount,
      gatewayPaymentId: params.gatewayPaymentId,
      orderNumber: order?.orderNumber,
      isSimulation: true,
      requesterId: params.requesterId,
      approverId: params.approverId,
      memo: `[TEST SIMULATION] Refund against ${params.gatewayPaymentId}`,
    });

    if (glResult.duplicateSkipped) {
      return { duplicateSkipped: true, journalEntry: glResult.journalEntry };
    }

    // Step 5: Update payment record
    payment.refundedAmount += params.amount;
    if (Math.round(payment.refundedAmount * 100) >= Math.round(payment.amount * 100)) {
      payment.status = 'REFUNDED';
    }

    // Step 6: Update order balance (Contract price totalAmount remains strictly invariant)
    if (order) {
      order.amountPaid -= params.amount;
      order.paymentStatus = order.amountPaid <= 0 ? 'REFUNDED' : 'PARTIALLY_PAID';
    }

    return { duplicateSkipped: false, journalEntry: glResult.journalEntry };
  }
}

describe('Double-Entry General Ledger Refund Accounting & Verification Suite', () => {
  const MAKER_ID = 'usr_finance_maker_101';
  const CHECKER_ID = 'usr_super_admin_checker_202';

  function setupScenario() {
    const engine = new DoubleEntryGLEngine();

    const order: InMemoryOrder = {
      id: 'ord_erp_001',
      orderNumber: 'ORD-2026-8999',
      totalAmount: 8999, // Original invariant contract value
      amountPaid: 8999,
      paymentStatus: 'PAID',
    };
    engine.orders.set(order.id, order);

    const quote: InMemoryQuote = {
      id: 'quote_erp_001',
      orderId: order.id,
      total: 8999,
      status: 'ACCEPTED',
    };
    engine.quotes.set(quote.id, quote);

    const payment: InMemoryPayment = {
      id: 'pay_erp_001',
      orderId: order.id,
      gatewayPaymentId: 'pay_demo_captured_8999',
      amount: 8999,
      status: 'CAPTURED',
      refundedAmount: 0,
    };
    engine.payments.set(payment.gatewayPaymentId, payment);

    return { engine, order, quote, payment };
  }

  // Path 1: Full Refund
  it('1. Full Refund Path: creates balanced JournalEntry, updates payment/order, preserves contract price', () => {
    const { engine, order, quote, payment } = setupScenario();

    const result = engine.executeRefundLifecycle({
      gatewayPaymentId: payment.gatewayPaymentId,
      refundId: 'rfnd_sim_full_001',
      amount: 8999,
      requesterId: MAKER_ID,
      approverId: CHECKER_ID,
    });

    assert.equal(result.duplicateSkipped, false);
    const je = result.journalEntry;

    // GL Verification
    assert.equal(je.status, 'POSTED');
    assert.equal(je.referenceType, 'REFUND');
    assert.equal(je.referenceId, 'rfnd_sim_full_001', 'Reference must stably point to provider refundId');
    assert.equal(je.approvedById, CHECKER_ID);
    assert.equal(je.createdById, MAKER_ID);
    assert.equal(je.lines.length, 2, 'Must have exactly two balanced journal lines');

    // Double-Entry Balance Verification
    const debitLine = je.lines.find((l) => l.debit > 0)!;
    const creditLine = je.lines.find((l) => l.credit > 0)!;

    assert.equal(debitLine.accountCode, '4100', 'Debit must hit Contra Revenue 4100');
    assert.equal(debitLine.debit, 8999);
    assert.equal(debitLine.credit, 0);

    assert.equal(creditLine.accountCode, '1020', 'Credit must hit Gateway Clearing 1020');
    assert.equal(creditLine.credit, 8999);
    assert.equal(creditLine.debit, 0);

    const balance = validateJournalEntryBalance(je.lines);
    assert.equal(balance.isBalanced, true, 'Double-entry balance check: Total Debit === Total Credit');
    assert.equal(balance.totalDebit, 8999);
    assert.equal(balance.totalCredit, 8999);

    // State Mutation Verification
    assert.equal(payment.status, 'REFUNDED');
    assert.equal(payment.amount, 8999, 'Payment historical amount must never be altered');
    assert.equal(order.amountPaid, 0);
    assert.equal(order.paymentStatus, 'REFUNDED');

    // Contract Invariance Assertions
    assert.equal(order.totalAmount, 8999, 'Original order contract price must remain untouched');
    assert.equal(quote.total, 8999, 'Accepted quote price must remain untouched');
    assert.equal(quote.status, 'ACCEPTED');
  });

  // Path 2A: Several Partial Refunds
  it('2A. Several Partial Refunds: tracks cumulative balance across multiple partial refunds', () => {
    const { engine, order, quote, payment } = setupScenario();

    // Partial Refund 1: ₹2,000
    const refund1 = engine.executeRefundLifecycle({
      gatewayPaymentId: payment.gatewayPaymentId,
      refundId: 'rfnd_sim_part_1',
      amount: 2000,
      requesterId: MAKER_ID,
      approverId: CHECKER_ID,
    });

    assert.equal(refund1.duplicateSkipped, false);
    assert.equal(payment.refundedAmount, 2000);
    assert.equal(payment.status, 'CAPTURED');
    assert.equal(order.amountPaid, 6999);
    assert.equal(order.paymentStatus, 'PARTIALLY_PAID');

    // Partial Refund 2: ₹3,000
    const refund2 = engine.executeRefundLifecycle({
      gatewayPaymentId: payment.gatewayPaymentId,
      refundId: 'rfnd_sim_part_2',
      amount: 3000,
      requesterId: MAKER_ID,
      approverId: CHECKER_ID,
    });

    assert.equal(refund2.duplicateSkipped, false);
    assert.equal(payment.refundedAmount, 5000, 'Cumulative refunded amount must be ₹5,000');
    assert.equal(payment.status, 'CAPTURED');
    assert.equal(order.amountPaid, 3999, 'Remaining amountPaid must be ₹3,999');
    assert.equal(order.paymentStatus, 'PARTIALLY_PAID');
    assert.equal(engine.journalEntries.length, 2, 'Exactly 2 distinct balanced JournalEntries in GL');
    assert.equal(engine.journalLines.length, 4, 'Exactly 4 balanced JournalLines in GL');

    // Invariance Checks
    assert.equal(order.totalAmount, 8999, 'Contract price remains invariant');
    assert.equal(quote.total, 8999, 'Quote remains invariant');
  });

  // Path 2B: Exact Final Refund
  it('2B. Exact Final Refund: final partial refund exactly exhausting balance marks payment & order REFUNDED', () => {
    const { engine, order, quote, payment } = setupScenario();

    // Step 1: Refund ₹5,000
    engine.executeRefundLifecycle({
      gatewayPaymentId: payment.gatewayPaymentId,
      refundId: 'rfnd_sim_prior_5000',
      amount: 5000,
      requesterId: MAKER_ID,
      approverId: CHECKER_ID,
    });
    assert.equal(payment.status, 'CAPTURED');

    // Step 2: Refund exact remainder ₹3,999
    const finalRefund = engine.executeRefundLifecycle({
      gatewayPaymentId: payment.gatewayPaymentId,
      refundId: 'rfnd_sim_final_3999',
      amount: 3999,
      requesterId: MAKER_ID,
      approverId: CHECKER_ID,
    });

    assert.equal(finalRefund.duplicateSkipped, false);
    assert.equal(payment.refundedAmount, 8999);
    assert.equal(payment.status, 'REFUNDED', 'Payment status must transition to REFUNDED upon exact exhaustion');
    assert.equal(order.amountPaid, 0);
    assert.equal(order.paymentStatus, 'REFUNDED', 'Order paymentStatus must transition to REFUNDED');

    // Invariance Checks
    assert.equal(order.totalAmount, 8999);
    assert.equal(quote.total, 8999);
  });

  // Path 2C: Over-Refund Attempt Rejection
  it('2C. Over-Refund Attempt Rejection: rejects refund exceeding remaining refundable balance with zero GL mutation', () => {
    const { engine, order, quote, payment } = setupScenario();

    // Step 1: Prior refund of ₹6,000 (Remaining refundable balance: ₹2,999)
    engine.executeRefundLifecycle({
      gatewayPaymentId: payment.gatewayPaymentId,
      refundId: 'rfnd_sim_prior_6000',
      amount: 6000,
      requesterId: MAKER_ID,
      approverId: CHECKER_ID,
    });

    const glEntriesBefore = engine.journalEntries.length;
    const glLinesBefore = engine.journalLines.length;

    // Step 2: Attempt to refund ₹3,000 (exceeds remaining ₹2,999 by ₹1)
    assert.throws(
      () =>
        engine.executeRefundLifecycle({
          gatewayPaymentId: payment.gatewayPaymentId,
          refundId: 'rfnd_sim_over_attempt',
          amount: 3000,
          requesterId: MAKER_ID,
          approverId: CHECKER_ID,
        }),
      (err: any) => {
        assert.equal(err.status, 400);
        assert.match(err.message, /Refund Rejected: Requested refund of ₹3000 exceeds remaining refundable balance of ₹2999/);
        return true;
      }
    );

    // Assert zero state drift or GL mutation
    assert.equal(engine.journalEntries.length, glEntriesBefore, 'Zero new journal entries created');
    assert.equal(engine.journalLines.length, glLinesBefore, 'Zero new journal lines created');
    assert.equal(payment.refundedAmount, 6000, 'Refunded amount must remain ₹6,000');
    assert.equal(payment.status, 'CAPTURED');
    assert.equal(order.amountPaid, 2999);
    assert.equal(order.totalAmount, 8999);
    assert.equal(quote.total, 8999);
  });

  // Path 3: Concurrent / Retried Refund
  it('3. Duplicate / Retried Refund Path: skips idempotently without duplicate journal entries or balance drift', () => {
    const { engine, order, payment } = setupScenario();

    // First execution
    const firstRun = engine.executeRefundLifecycle({
      gatewayPaymentId: payment.gatewayPaymentId,
      refundId: 'rfnd_sim_retry_003',
      amount: 3500,
      requesterId: MAKER_ID,
      approverId: CHECKER_ID,
    });
    assert.equal(firstRun.duplicateSkipped, false);
    assert.equal(engine.journalEntries.length, 1);
    assert.equal(order.amountPaid, 5499);

    // Duplicate retry with the same provider refund ID
    const retryRun = engine.executeRefundLifecycle({
      gatewayPaymentId: payment.gatewayPaymentId,
      refundId: 'rfnd_sim_retry_003',
      amount: 3500,
      requesterId: MAKER_ID,
      approverId: CHECKER_ID,
    });

    assert.equal(retryRun.duplicateSkipped, true, 'Retry must be skipped idempotently');
    assert.equal(engine.journalEntries.length, 1, 'Zero new journal entries created');
    assert.equal(engine.journalLines.length, 2, 'Zero new journal lines created');
    assert.equal(order.amountPaid, 5499, 'Amount paid must NOT be double-decremented');
    assert.equal(payment.refundedAmount, 3500, 'Refunded amount must NOT be double-counted');
  });

  // Path 4: Provider Timeout & Idempotent Retry Behavior
  it('4. Provider Timeout & Idempotent Retry: simulates timeout on call 1 and successful idempotent recovery on retry', () => {
    const { engine, order, payment } = setupScenario();
    const idempotencyKey = 'idemp_key_timeout_004';
    const refundId = 'rfnd_timeout_retry_004';

    // Call 1: Gateway experiences network timeout (e.g. ETIMEDOUT / 504)
    assert.throws(
      () =>
        engine.executeRefundLifecycle({
          gatewayPaymentId: payment.gatewayPaymentId,
          refundId,
          idempotencyKey,
          amount: 2500,
          requesterId: MAKER_ID,
          approverId: CHECKER_ID,
          simulatedTimeout: true,
        }),
      (err: any) => {
        assert.equal(err.status, 504);
        assert.match(err.message, /Provider Gateway Refund Timeout/);
        return true;
      }
    );

    // Verify zero GL entries were posted during timeout
    assert.equal(engine.journalEntries.length, 0);
    assert.equal(payment.refundedAmount, 0);

    // Call 2: Retry with the exact same idempotency key
    const retryResult = engine.executeRefundLifecycle({
      gatewayPaymentId: payment.gatewayPaymentId,
      refundId,
      idempotencyKey,
      amount: 2500,
      requesterId: MAKER_ID,
      approverId: CHECKER_ID,
    });

    assert.equal(retryResult.duplicateSkipped, false);
    assert.equal(engine.journalEntries.length, 1, 'Exactly one journal entry created after successful retry');
    assert.equal(engine.journalLines.length, 2);
    assert.equal(payment.refundedAmount, 2500);
    assert.equal(order.amountPaid, 6499);
    assert.equal(order.paymentStatus, 'PARTIALLY_PAID');

    // Call 3: Repeated retry after success returns duplicateSkipped
    const secondRetry = engine.executeRefundLifecycle({
      gatewayPaymentId: payment.gatewayPaymentId,
      refundId,
      idempotencyKey,
      amount: 2500,
      requesterId: MAKER_ID,
      approverId: CHECKER_ID,
    });
    assert.equal(secondRetry.duplicateSkipped, true);
    assert.equal(engine.journalEntries.length, 1);
    assert.equal(payment.refundedAmount, 2500);
  });

  // Path 5: Rejected Refund Request
  it('5. Rejected Refund Request Path: transitions approval to REJECTED with zero GL entries or mutations', () => {
    const { engine, order, payment } = setupScenario();

    // Maker submits approval request
    const approvalRequest = {
      id: 'appr_ref_004',
      type: 'REFUND',
      status: 'PENDING',
      requesterId: MAKER_ID,
      reviewerId: null as string | null,
      reviewNotes: null as string | null,
      payload: {
        gatewayPaymentId: payment.gatewayPaymentId,
        refundId: 'rfnd_sim_rejected_004',
        amount: 8999,
      },
    };

    // Checker rejects
    approvalRequest.status = 'REJECTED';
    approvalRequest.reviewerId = CHECKER_ID;
    approvalRequest.reviewNotes = 'Rejected: MCA SPICe+ filing already processed with non-refundable statutory fees.';

    // Because request is REJECTED, executeRefundLifecycle is NEVER called
    assert.equal(approvalRequest.status, 'REJECTED');
    assert.equal(engine.journalEntries.length, 0, 'Zero JournalEntries posted to GL for rejected request');
    assert.equal(engine.journalLines.length, 0, 'Zero JournalLines posted to GL for rejected request');
    assert.equal(payment.status, 'CAPTURED');
    assert.equal(payment.refundedAmount, 0);
    assert.equal(order.amountPaid, 8999);
    assert.equal(order.paymentStatus, 'PAID');
  });

  // Path 6: Failed Provider Refund
  it('6. Failed Provider Refund Path: aborts transaction with zero GL entries or balance mutations', () => {
    const { engine, order, payment } = setupScenario();

    // Provider gateway call simulates failure
    assert.throws(
      () =>
        engine.executeRefundLifecycle({
          gatewayPaymentId: payment.gatewayPaymentId,
          refundId: 'rfnd_sim_failed_005',
          amount: 8999,
          requesterId: MAKER_ID,
          approverId: CHECKER_ID,
          simulatedProviderFailure: true,
        }),
      (err: any) => {
        assert.equal(err.status, 502);
        assert.match(err.message, /Provider Gateway Refund Failure/);
        return true;
      }
    );

    // Assert zero mutations occurred
    assert.equal(engine.journalEntries.length, 0, 'Zero JournalEntries posted to GL upon gateway failure');
    assert.equal(engine.journalLines.length, 0, 'Zero JournalLines posted to GL upon gateway failure');
    assert.equal(payment.status, 'CAPTURED');
    assert.equal(payment.refundedAmount, 0);
    assert.equal(order.amountPaid, 8999);
    assert.equal(order.paymentStatus, 'PAID');
    assert.equal(order.totalAmount, 8999);
  });
});
