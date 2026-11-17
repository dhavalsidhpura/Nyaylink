import { prisma } from '@/lib/prisma';
import { HttpError } from '@/lib/http';
import type { Prisma } from '@prisma/client';

export const DEFAULT_COA = {
  REFUND_CONTRA: {
    code: '4100',
    name: 'Contra Revenue - Sales Refunds & Allowances',
    type: 'REVENUE' as const, // Normal balance: Debit (contra to revenue)
  },
  GATEWAY_CLEARING: {
    code: '1020',
    name: 'Razorpay Gateway Clearing Account',
    type: 'ASSET' as const, // Normal balance: Debit. Credits reduce clearing asset.
  },
  OPERATING_BANK: {
    code: '1010',
    name: 'Operating Bank Account (HDFC)',
    type: 'ASSET' as const,
  },
  REVENUE_PROFESSIONAL: {
    code: '4000',
    name: 'Professional Legal & Advisory Fees',
    type: 'REVENUE' as const,
  },
  GOVT_FEES_PAYABLE: {
    code: '2100',
    name: 'Government Statutory Fees Collected as Pure Agent',
    type: 'LIABILITY' as const,
  },
};

export interface JournalLineInput {
  accountId?: string;
  accountCode: string;
  accountName?: string;
  debit: number;
  credit: number;
  description?: string;
}

/**
 * Pure double-entry validation helper.
 * Strictly asserts that sum of debits equals sum of credits to the exact paise.
 */
export function validateJournalEntryBalance(lines: Array<{ debit: number; credit: number }>): {
  isBalanced: boolean;
  totalDebit: number;
  totalCredit: number;
} {
  const totalDebit = Math.round(lines.reduce((s, l) => s + (Number(l.debit) || 0), 0) * 100) / 100;
  const totalCredit = Math.round(lines.reduce((s, l) => s + (Number(l.credit) || 0), 0) * 100) / 100;
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;
  return { isBalanced, totalDebit, totalCredit };
}

/**
 * Ensures standard Chart of Accounts exist in the database.
 */
export async function ensureDefaultAccounts(tx: Prisma.TransactionClient) {
  const contra = await tx.account.upsert({
    where: { code: DEFAULT_COA.REFUND_CONTRA.code },
    update: {},
    create: {
      code: DEFAULT_COA.REFUND_CONTRA.code,
      name: DEFAULT_COA.REFUND_CONTRA.name,
      type: DEFAULT_COA.REFUND_CONTRA.type,
    },
  });

  const clearing = await tx.account.upsert({
    where: { code: DEFAULT_COA.GATEWAY_CLEARING.code },
    update: {},
    create: {
      code: DEFAULT_COA.GATEWAY_CLEARING.code,
      name: DEFAULT_COA.GATEWAY_CLEARING.name,
      type: DEFAULT_COA.GATEWAY_CLEARING.type,
    },
  });

  return { contra, clearing };
}

export interface PostRefundJournalParams {
  refundId: string;
  amount: number;
  gatewayPaymentId: string;
  orderNumber?: string;
  isSimulation?: boolean;
  requesterId?: string | null;
  approverId?: string | null;
  memo?: string;
}

/**
 * Posts an immutable, balanced JournalEntry for a refund in the Double-Entry General Ledger.
 * Enforces:
 *   1. Strict mathematical balance (Debit Contra Revenue 4100 = Credit Gateway Clearing 1020).
 *   2. Idempotency against duplicate provider refundId.
 *   3. Immutable audit reference to gateway refund ID.
 */
export async function postRefundJournalEntry(
  tx: Prisma.TransactionClient,
  params: PostRefundJournalParams
) {
  // 1. Idempotency check: A refund ID must be recorded at most once in the General Ledger
  const existing = await tx.journalEntry.findFirst({
    where: { referenceType: 'REFUND', referenceId: params.refundId },
    include: { lines: { include: { account: true } } },
  });

  if (existing) {
    return { journalEntry: existing, duplicateSkipped: true };
  }

  // 2. Ensure accounts exist
  const { contra, clearing } = await ensureDefaultAccounts(tx);

  // 3. Formulate balanced double-entry lines
  const lines = [
    {
      accountId: contra.id,
      debit: params.amount,
      credit: 0,
      description: `Debit Contra-Revenue: Refund for ${params.orderNumber || params.gatewayPaymentId}`,
    },
    {
      accountId: clearing.id,
      debit: 0,
      credit: params.amount,
      description: `Credit Gateway Clearing: Refund via ${params.refundId}`,
    },
  ];

  const validation = validateJournalEntryBalance(lines);
  if (!validation.isBalanced) {
    throw new HttpError(
      500,
      `Double-Entry GL Validation Failed: Debit (₹${validation.totalDebit}) does not equal Credit (₹${validation.totalCredit}).`
    );
  }

  const entryNo = `JE-REF-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  // 4. Create immutable JournalEntry and JournalLines atomically
  const journalEntry = await tx.journalEntry.create({
    data: {
      entryNo,
      description: params.memo || `Refund of ₹${params.amount.toLocaleString('en-IN')} against ${params.gatewayPaymentId}`,
      referenceType: 'REFUND',
      referenceId: params.refundId,
      status: 'POSTED',
      isTest: Boolean(params.isSimulation),
      createdById: params.requesterId || null,
      approvedById: params.approverId || null,
      lines: {
        create: lines.map((line) => ({
          accountId: line.accountId,
          debit: line.debit,
          credit: line.credit,
          description: line.description,
        })),
      },
    },
    include: {
      lines: { include: { account: true } },
    },
  });

  return { journalEntry, duplicateSkipped: false };
}
