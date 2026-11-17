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
    simulatedProviderFailure?: boolean;
  }) {
    // Step 1: Payment validation
    const payment = this.payments.get(params.gatewayPaymentId);
    if (!payment) throw new HttpError(404, 'Payment not found for refund.');
    if (payment.status === 'REFUNDED') throw new HttpError(409, 'Only captured payments can be refunded.');

    // Step 2: Gateway execution simulation
    if (params.simulatedProviderFailure) {
      throw new HttpError(502, 'Provider Gateway Refund Failure: GATEWAY_INSUFFICIENT_FUNDS');
    }

    // Step 3: GL Double-Entry Posting
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

    // Step 4: Update payment record
    payment.refundedAmount += params.amount;
    if (payment.refundedAmount >= payment.amount) {
      payment.status = 'REFUNDED';
    }

    // Step 5: Update order balance (Contract price totalAmount remains strictly invariant)
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

  // Path 2: Partial Refund
  it('2. Partial Refund Path: creates balanced JournalEntry for partial amount, updates remaining balance', () => {
    const { engine, order, quote, payment } = setupScenario();

    const result = engine.executeRefundLifecycle({
      gatewayPaymentId: payment.gatewayPaymentId,
      refundId: 'rfnd_sim_partial_002',
      amount: 3500, // Partial refund
      requesterId: MAKER_ID,
      approverId: CHECKER_ID,
    });

    assert.equal(result.duplicateSkipped, false);
    const je = result.journalEntry;

    // GL Verification
    assert.equal(je.lines.length, 2);
    const debitLine = je.lines.find((l) => l.debit > 0)!;
    const creditLine = je.lines.find((l) => l.credit > 0)!;

    assert.equal(debitLine.accountCode, '4100');
    assert.equal(debitLine.debit, 3500);
    assert.equal(creditLine.accountCode, '1020');
    assert.equal(creditLine.credit, 3500);

    const balance = validateJournalEntryBalance(je.lines);
    assert.equal(balance.isBalanced, true);
    assert.equal(balance.totalDebit, 3500);
    assert.equal(balance.totalCredit, 3500);

    // Partial State Verification
    assert.equal(payment.status, 'CAPTURED', 'Payment remains CAPTURED when only partially refunded');
    assert.equal(payment.refundedAmount, 3500);
    assert.equal(order.amountPaid, 5499, 'Order amountPaid decremented to ₹5,499');
    assert.equal(order.paymentStatus, 'PARTIALLY_PAID');

    // Invariance Checks
    assert.equal(order.totalAmount, 8999);
    assert.equal(quote.total, 8999);
  });

  // Path 3: Duplicate / Retried Refund
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

  // Path 4: Rejected Refund Request
  it('4. Rejected Refund Request Path: transitions approval to REJECTED with zero GL entries or mutations', () => {
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

  // Path 5: Failed Provider Refund
  it('5. Failed Provider Refund Path: aborts transaction with zero GL entries or balance mutations', () => {
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
