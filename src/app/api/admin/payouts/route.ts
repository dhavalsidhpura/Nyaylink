import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireRole, ROLE_GROUPS } from '@/lib/authz';
import { num } from '@/lib/serialize';

// Consultations that are completed, paid, not refunded, and not yet in a payout.
const payableWhere = (lawyerId: string) => ({
  lawyerId,
  status: 'COMPLETED' as const,
  payoutId: null,
  payments: { some: { status: 'CAPTURED' as const } },
});

const createSchema = z.object({ lawyerId: z.string().min(1) });

// Creates a pending payout batching all payable consultations. The advocate receives their full fee;
// the platform keeps the platform fee.
export const POST = apiHandler(async (request: Request) => {
  await requireRole(ROLE_GROUPS.finance);
  const { lawyerId } = createSchema.parse(await request.json());

  const payout = await prisma.$transaction(async (tx) => {
    const consultations = await tx.consultation.findMany({ where: payableWhere(lawyerId), select: { id: true, fee: true } });
    if (consultations.length === 0) throw new HttpError(409, 'Nothing to pay out for this advocate.');
    const amount = consultations.reduce((sum, c) => sum + num(c.fee), 0);
    return tx.payout.create({
      data: { lawyerId, amount, consultations: { connect: consultations.map((c) => ({ id: c.id })) } },
    });
  });

  return NextResponse.json({ success: true, payoutId: payout.id, amount: num(payout.amount) }, { status: 201 });
});

const paySchema = z.object({ payoutId: z.string().min(1), reference: z.string().trim().min(4).max(60) });

// Marks a payout as paid after the bank transfer (UTR reference) and records it in the ledger.
export const PATCH = apiHandler(async (request: Request) => {
  await requireRole(ROLE_GROUPS.finance);
  const { payoutId, reference } = paySchema.parse(await request.json());

  await prisma.$transaction(async (tx) => {
    const payout = await tx.payout.findUnique({ where: { id: payoutId }, include: { lawyer: { include: { user: true } } } });
    if (!payout) throw new HttpError(404, 'Payout not found.');
    if (payout.status === 'PAID') throw new HttpError(409, 'This payout is already marked as paid.');
    await tx.payout.update({ where: { id: payoutId }, data: { status: 'PAID', reference, paidAt: new Date() } });
    await tx.ledgerEntry.create({
      data: {
        txnNo: `PAYOUT-${payout.id}`,
        type: 'LAWYER_PAYOUT',
        description: `Payout to ${payout.lawyer.user.name} (UTR ${reference})`,
        debit: payout.amount,
        mode: 'BANK_TRANSFER',
      },
    });
  });

  return NextResponse.json({ success: true });
});
