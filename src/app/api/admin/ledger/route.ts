import { NextResponse } from 'next/server';
import { z } from 'zod';
import { TxnType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { apiHandler, requireRole, ROLE_GROUPS } from '@/lib/authz';
import { plain, num } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async () => {
  await requireRole(ROLE_GROUPS.finance);
  const [ledger, totals] = await Promise.all([
    prisma.ledgerEntry.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.ledgerEntry.aggregate({ _sum: { credit: true, debit: true } }),
  ]);
  const balance = num(totals._sum.credit) - num(totals._sum.debit);
  return NextResponse.json({ success: true, ledger: plain(ledger), balance });
});

const schema = z.object({
  type: z.nativeEnum(TxnType),
  description: z.string().trim().min(3).max(200),
  amount: z.number().positive(),
  mode: z.string().trim().max(40).default('BANK_TRANSFER'),
  orderId: z.string().optional(),
});

// Manual entries (bank transfers, govt fee debits, payouts). Gateway payments/refunds are recorded automatically.
export const POST = apiHandler(async (request: Request) => {
  await requireRole(ROLE_GROUPS.finance);
  const input = schema.parse(await request.json());
  const isCredit = input.type === 'CLIENT_PAYMENT';

  const entry = await prisma.ledgerEntry.create({
    data: {
      txnNo: `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: input.type,
      description: input.description,
      debit: isCredit ? 0 : input.amount,
      credit: isCredit ? input.amount : 0,
      mode: input.mode,
      orderId: input.orderId || null,
    },
  });

  return NextResponse.json({ success: true, entry: plain(entry) }, { status: 201 });
});
