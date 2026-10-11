import type { Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

/** Atomically increments and returns a named counter (row-level lock inside the transaction). */
export async function nextSequence(tx: Tx, key: string): Promise<number> {
  const counter = await tx.counter.upsert({
    where: { key },
    create: { key, value: 1 },
    update: { value: { increment: 1 } },
  });
  return counter.value;
}

/** Indian financial year label, e.g. 2026-10-02 → "26-27". */
export function financialYear(date = new Date()): string {
  const ist = new Date(date.getTime() + 330 * 60 * 1000);
  const year = ist.getUTCFullYear();
  const start = ist.getUTCMonth() >= 3 ? year : year - 1;
  return `${String(start).slice(2)}-${String(start + 1).slice(2)}`;
}

/** GST rule 46: consecutive serial, max 16 characters, unique per financial year. e.g. "NL/26-27/000042" */
export async function nextInvoiceNumber(tx: Tx): Promise<string> {
  const fy = financialYear();
  const seq = await nextSequence(tx, `invoice:${fy}`);
  return `NL/${fy}/${String(seq).padStart(6, '0')}`;
}

export async function nextOrderNumber(tx: Tx): Promise<string> {
  const yy = String(new Date().getFullYear()).slice(2);
  const seq = await nextSequence(tx, `order:${yy}`);
  return `NYA-${yy}${String(seq).padStart(5, '0')}`;
}

export async function nextConsultationNumber(tx: Tx): Promise<string> {
  const yy = String(new Date().getFullYear()).slice(2);
  const seq = await nextSequence(tx, `consultation:${yy}`);
  return `CON-${yy}${String(seq).padStart(5, '0')}`;
}
