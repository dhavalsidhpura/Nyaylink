import { postRefundJournalEntry } from '@/lib/gl';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { HttpError } from '@/lib/http';
import { getRazorpay, razorpayKeyId } from '@/lib/razorpay';
import { nextInvoiceNumber } from '@/lib/counters';
import { splitGst, SUPPLIER_STATE } from '@/lib/pricing';
import { num } from '@/lib/serialize';
import { sendNotificationEmail, buildPaymentReceiptEmail, buildConsultationConfirmedEmail } from '@/lib/email';
import { notifyOrderCreatedWhatsApp } from '@/lib/whatsapp';

// SAC for the platform facilitation fee on consultations — confirm with your CA.
const CONSULTATION_SAC = '998599';

/**
 * Checks whether demo reset is permitted in the current runtime environment.
 * Strictly blocked in live production environments.
 */
export function isDemoResetAllowed(): boolean {
  if (process.env.APP_ENV === 'production') return false;
  if (process.env.VERCEL_ENV === 'production') return false;
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_STAGING_RESET) return false;
  return true;
}

const paymentInclude = {
  order: { include: { client: true, service: true } },
  consultation: { include: { client: true, lawyer: { include: { user: true } } } },
} satisfies Prisma.PaymentInclude;

type PaymentWithTarget = Prisma.PaymentGetPayload<{ include: typeof paymentInclude }>;

export interface CheckoutPayload {
  keyId: string;
  gatewayOrderId: string;
  amountPaise: number;
  currency: 'INR';
  description: string;
  prefill: { name: string; email: string; contact?: string };
}

/**
 * Ensures the payment has a Razorpay order and returns what the browser needs to open Checkout.
 * Re-uses an existing gateway order, so retries after a closed popup don't create duplicates.
 */
export async function preparePaymentCheckout(paymentId: string, ownerId: string): Promise<CheckoutPayload> {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId }, include: paymentInclude });
  const client = payment?.order?.client ?? payment?.consultation?.client;
  if (!payment || !client || client.id !== ownerId) throw new HttpError(404, 'Payment not found.');
  if (payment.status === 'CAPTURED') throw new HttpError(409, 'This payment has already been completed.');
  if (payment.consultation?.status === 'CANCELLED') throw new HttpError(409, 'This booking was cancelled. Please choose a new slot.');
  const hold = payment.consultation?.holdExpiresAt;
  if (payment.consultation?.status === 'PENDING_PAYMENT' && hold && hold < new Date()) {
    throw new HttpError(409, 'Your 15-minute hold on this slot expired. Please pick the slot again.');
  }

  let gatewayOrderId = payment.gatewayOrderId;
  if (!gatewayOrderId) {
    const order = await getRazorpay().orders.create({
      amount: Math.round(num(payment.amount) * 100),
      currency: 'INR',
      receipt: payment.id,
      notes: { paymentId: payment.id, reference: payment.order?.orderNumber || payment.consultation?.number || '' },
    });
    gatewayOrderId = order.id;
    await prisma.payment.update({ where: { id: payment.id }, data: { gatewayOrderId } });
  }

  return {
    keyId: razorpayKeyId(),
    gatewayOrderId,
    amountPaise: Math.round(num(payment.amount) * 100),
    currency: 'INR',
    description: payment.description,
    prefill: { name: client.name, email: client.email, contact: client.phone || undefined },
  };
}

async function createInvoice(tx: Prisma.TransactionClient, payment: PaymentWithTarget) {
  const client = payment.order?.client ?? payment.consultation!.client;
  const placeOfSupply = payment.order?.clientState || client.state || SUPPLIER_STATE;
  const taxable = num(payment.taxableAmount);
  const gst = splitGst(num(payment.gstAmount), placeOfSupply);
  const reimbursements = Math.round((num(payment.amount) - taxable - gst.total) * 100) / 100;

  return tx.invoice.create({
    data: {
      invoiceNo: await nextInvoiceNumber(tx),
      orderId: payment.orderId,
      paymentId: payment.id,
      billedToName: client.name,
      billedToGstin: client.gstin,
      placeOfSupply,
      sacCode: payment.order?.service.sacCode || CONSULTATION_SAC,
      taxableAmount: taxable,
      cgst: gst.cgst,
      sgst: gst.sgst,
      igst: gst.igst,
      reimbursements,
      totalAmount: payment.amount,
    },
  });
}

/**
 * Marks a gateway payment as captured. Idempotent: the browser callback and the webhook can both
 * call this for the same payment, in any order, any number of times — side effects run exactly once.
 */
export async function capturePayment(
  gatewayOrderId: string,
  gatewayPaymentId: string,
  options?: { isSimulation?: boolean }
) {
  const isSimulation = Boolean(options?.isSimulation || gatewayPaymentId.startsWith('pay_demo_'));

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { gatewayOrderId }, include: paymentInclude });
    if (!payment) throw new HttpError(404, 'Payment not found.');

    const claimed = await tx.payment.updateMany({
      where: { id: payment.id, status: { in: ['CREATED', 'FAILED'] } },
      data: { status: 'CAPTURED', gatewayPaymentId, capturedAt: new Date() },
    });
    if (claimed.count === 0) return { payment, newlyCaptured: false, slotLost: false };

    let slotLost = false;

    if (payment.order) {
      const order = await tx.order.update({
        where: { id: payment.order.id },
        data: { amountPaid: { increment: payment.amount } },
      });
      const fullyPaid = num(order.amountPaid) >= num(order.totalAmount);
      const nextStatus = order.status === 'PENDING_PAYMENT' ? 'DOCS_PENDING' : order.status;
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: fullyPaid ? 'PAID' : 'PARTIALLY_PAID', status: nextStatus },
      });
      await tx.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: nextStatus === order.status ? 'PAYMENT_RECEIVED' : nextStatus,
          remarks: `${isSimulation ? '[TEST SIMULATION] ' : ''}Payment ${gatewayPaymentId} of ₹${num(payment.amount).toLocaleString('en-IN')} received (${payment.description}).`,
        },
      });
    }

    if (payment.consultation) {
      const c = payment.consultation;
      // If the hold expired and someone else booked the slot meanwhile, don't double-book.
      const clash = await tx.consultation.findFirst({
        where: {
          id: { not: c.id },
          lawyerId: c.lawyerId,
          startsAt: { lt: c.endsAt },
          endsAt: { gt: c.startsAt },
          OR: [{ status: 'CONFIRMED' }, { status: 'PENDING_PAYMENT', holdExpiresAt: { gt: new Date() } }],
        },
      });
      slotLost = Boolean(clash);
      await tx.consultation.update({
        where: { id: c.id },
        data: slotLost
          ? { status: 'CANCELLED', holdExpiresAt: null, lawyerNotes: 'AUTO: paid after hold expired and slot was taken — refund required.' }
          : { status: 'CONFIRMED', holdExpiresAt: null },
      });
    }

    await tx.ledgerEntry.create({
      data: {
        txnNo: gatewayPaymentId,
        type: 'CLIENT_PAYMENT',
        description: isSimulation ? `[TEST SIMULATION] ${payment.description}` : payment.description,
        credit: payment.amount,
        mode: isSimulation ? 'TEST_SIMULATION' : 'RAZORPAY',
        orderId: payment.orderId,
      },
    });

    await createInvoice(tx, payment);
    return { payment, newlyCaptured: true, slotLost };
  });

  if (result.newlyCaptured) {
    const { payment } = result;
    const isTestAccount =
      isSimulation ||
      payment.order?.client.email?.endsWith('.local') ||
      payment.order?.client.email?.includes('demo') ||
      payment.order?.client.email?.includes('test') ||
      payment.consultation?.client.email?.endsWith('.local') ||
      payment.consultation?.client.email?.includes('demo') ||
      payment.consultation?.client.email?.includes('test');

    if (!isTestAccount) {
      if (payment.order) {
        await sendNotificationEmail({
          to: payment.order.client.email,
          subject: `Payment Confirmed [${payment.order.orderNumber}]`,
          html: buildPaymentReceiptEmail(
            payment.order.client.name,
            payment.order.orderNumber,
            num(payment.amount),
            payment.order.service.title,
            `/orders/${payment.order.orderNumber}`
          ),
        });

        if (payment.order.client.phone) {
          await notifyOrderCreatedWhatsApp({
            phone: payment.order.client.phone,
            clientName: payment.order.client.name,
            orderNumber: payment.order.orderNumber,
            serviceTitle: payment.order.service.title,
            amountPaid: num(payment.amount),
          });
        }
      } else if (payment.consultation && !result.slotLost) {
        const c = payment.consultation;
        await sendNotificationEmail({
          to: c.client.email,
          subject: `Consultation confirmed [${c.number}]`,
          html: buildConsultationConfirmedEmail(c.client.name, c.lawyer.user.name, c.startsAt, c.number),
        });
        await sendNotificationEmail({
          to: c.lawyer.user.email,
          subject: `New consultation booked [${c.number}]`,
          html: buildConsultationConfirmedEmail(c.lawyer.user.name, `${c.client.name} (client)`, c.startsAt, c.number),
        });
      }
    } else {
      console.log(`[staging] Suppressed outbound notifications for test account: ${payment.order?.client.email || payment.consultation?.client.email}`);
    }
  }

  return result;
}

export async function markPaymentFailed(gatewayOrderId: string) {
  await prisma.payment.updateMany({ where: { gatewayOrderId, status: 'CREATED' }, data: { status: 'FAILED' } });
}

export interface RecordRefundOptions {
  approverId?: string | null;
  requesterId?: string | null;
  isSimulation?: boolean;
  refundRequestId?: string;
  reason?: string;
}

export interface ReserveRefundOptions {
  refundRequestId: string;
  reason?: string;
  isSimulation?: boolean;
}

export interface FinalizeRefundOptions {
  refundRequestId: string;
  approverId?: string;
  requesterId?: string;
  isSimulation?: boolean;
  reason?: string;
}

/**
 * Step 1: Acquires payment-row lock and creates durable RESERVED refund record
 * in one database transaction before any gateway call.
 * Ensures concurrent requests include all reserved and successful refunds in the balance check.
 */
export async function reserveRefund(
  gatewayPaymentId: string,
  amount: number,
  options: ReserveRefundOptions
) {
  const { refundRequestId, reason } = options;
  if (!refundRequestId || !refundRequestId.trim()) {
    throw new HttpError(400, 'refundRequestId is required for reservation idempotency.');
  }

  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { gatewayPaymentId },
      include: { order: true, refunds: true },
    });
    if (!payment) throw new HttpError(404, 'Payment not found for refund.');
    if (payment.status === 'REFUNDED') throw new HttpError(409, 'Payment is already fully refunded.');

    // Database-backed pessimistic row lock on the Payment record
    try {
      await tx.$executeRaw`SELECT 1 FROM "Payment" WHERE "id" = ${payment.id} FOR UPDATE`;
    } catch {
      // Safe fallback for environments/dialects without raw FOR UPDATE support (e.g. pg-mem)
    }

    // 1. Idempotency check: see if this exact refundRequestId was already handled
    const existing = await tx.paymentRefund.findUnique({
      where: { refundRequestId },
    });
    if (existing) {
      if (existing.status === 'SUCCEEDED') {
        return { alreadySucceeded: true, alreadyReserved: false, refund: existing, payment };
      }
      if (existing.status === 'RESERVED') {
        return { alreadySucceeded: false, alreadyReserved: true, refund: existing, payment };
      }
    }

    // 2. Balance check across ALL RESERVED and SUCCEEDED refunds
    const activeRefunds = await tx.paymentRefund.findMany({
      where: {
        paymentId: payment.id,
        status: { in: ['RESERVED', 'SUCCEEDED'] },
        refundRequestId: { not: refundRequestId },
      },
    });

    const cumulativePrior = activeRefunds.reduce((sum, r) => sum + num(r.amount), 0);
    const remainingRefundable = Math.round((num(payment.amount) - cumulativePrior) * 100) / 100;

    if (amount > remainingRefundable) {
      throw new HttpError(
        400,
        `Refund Rejected: Requested refund of ₹${amount} exceeds remaining refundable balance of ₹${remainingRefundable} for payment ${gatewayPaymentId}.`
      );
    }

    // 3. Create durable RESERVED refund record in the database
    const refund = await tx.paymentRefund.create({
      data: {
        paymentId: payment.id,
        refundRequestId,
        amount,
        status: 'RESERVED',
        reason: reason || `Refund reservation against payment ${gatewayPaymentId}`,
      },
    });

    return { alreadySucceeded: false, alreadyReserved: false, refund, payment };
  });
}

/**
 * Step 2: Finalizes the refund only after confirmed provider result in a second database transaction.
 * Marks PaymentRefund as SUCCEEDED and posts balanced JournalEntry to Double-Entry GL.
 */
export async function finalizeRefund(
  gatewayPaymentId: string,
  gatewayRefundId: string,
  amount: number,
  options: FinalizeRefundOptions
) {
  const { refundRequestId, approverId, requesterId } = options;

  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { gatewayPaymentId },
      include: { order: true },
    });
    if (!payment) throw new HttpError(404, 'Payment not found for refund finalization.');

    // Database-backed pessimistic row lock on the Payment record
    try {
      await tx.$executeRaw`SELECT 1 FROM "Payment" WHERE "id" = ${payment.id} FOR UPDATE`;
    } catch {}

    const existingRefund = await tx.paymentRefund.findUnique({
      where: { refundRequestId },
    });

    if (existingRefund && existingRefund.status === 'SUCCEEDED') {
      return { duplicateSkipped: true, refund: existingRefund };
    }

    const isSimulation = Boolean(options.isSimulation || gatewayPaymentId.startsWith('pay_demo_'));

    // 1. Mark PaymentRefund as SUCCEEDED with confirmed gateway refund ID
    const refund = await tx.paymentRefund.upsert({
      where: { refundRequestId },
      update: {
        status: 'SUCCEEDED',
        gatewayRefundId,
        amount,
      },
      create: {
        paymentId: payment.id,
        refundRequestId,
        gatewayRefundId,
        amount,
        status: 'SUCCEEDED',
        reason: options.reason || `Refund against payment ${gatewayPaymentId}`,
      },
    });

    // 2. Post immutable, balanced JournalEntry to Double-Entry General Ledger
    const { journalEntry, duplicateSkipped } = await postRefundJournalEntry(tx, {
      refundId: gatewayRefundId,
      amount,
      gatewayPaymentId,
      orderNumber: payment.order?.orderNumber,
      isSimulation,
      requesterId,
      approverId,
      memo: `${isSimulation ? '[TEST SIMULATION] ' : ''}Refund against ${gatewayPaymentId}`,
    });

    if (duplicateSkipped) {
      return { duplicateSkipped: true, journalEntry, refund };
    }

    // 3. Post backward-compatible LedgerEntry
    await tx.ledgerEntry.create({
      data: {
        txnNo: gatewayRefundId,
        type: 'REFUND',
        description: `${isSimulation ? '[TEST SIMULATION] ' : ''}Refund against ${gatewayPaymentId}`,
        debit: amount,
        credit: 0,
        mode: isSimulation ? 'TEST_SIMULATION' : 'RAZORPAY',
        orderId: payment.orderId,
      },
    });

    // 4. Mark payment as REFUNDED if cumulative succeeded refunds equal or exceed original amount
    const allSucceeded = await tx.paymentRefund.findMany({
      where: { paymentId: payment.id, status: 'SUCCEEDED' },
    });
    const cumulativeSucceeded = allSucceeded.reduce((sum, r) => sum + num(r.amount), 0);
    const fullRefund = Math.round(cumulativeSucceeded * 100) >= Math.round(num(payment.amount) * 100);
    if (fullRefund) {
      await tx.payment.update({ where: { id: payment.id }, data: { status: 'REFUNDED' } });
    }

    // 5. Decrement order amountPaid (original order totalAmount and accepted quote remain invariant!)
    if (payment.orderId) {
      const order = await tx.order.update({
        where: { id: payment.orderId },
        data: { amountPaid: { decrement: amount } },
      });
      const paid = num(order.amountPaid);
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: paid <= 0 ? 'REFUNDED' : paid >= num(order.totalAmount) ? 'PAID' : 'PARTIALLY_PAID' },
      });
      await tx.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: 'REFUND_PROCESSED',
          remarks: `${isSimulation ? '[TEST SIMULATION] ' : ''}Refund of ₹${amount.toLocaleString('en-IN')} processed (Ref: ${gatewayRefundId}).`,
        },
      });
    }

    return { duplicateSkipped: false, journalEntry, refund };
  });
}

/**
 * Combined helper for backward compatibility and synchronous flows:
 * reserves refund, records provider execution, and finalizes accounting.
 */
export async function recordRefund(
  gatewayPaymentId: string,
  refundId: string,
  amount: number,
  options?: RecordRefundOptions
) {
  const refundRequestId = options?.refundRequestId || `ref_req_${refundId}`;
  const isSimulation = Boolean(options?.isSimulation || gatewayPaymentId.startsWith('pay_demo_'));

  const reservation = await reserveRefund(gatewayPaymentId, amount, {
    refundRequestId,
    reason: options?.reason,
    isSimulation,
  });

  if (reservation.alreadySucceeded) {
    return { duplicateSkipped: true };
  }

  return await finalizeRefund(gatewayPaymentId, refundId, amount, {
    refundRequestId,
    approverId: options?.approverId,
    requesterId: options?.requesterId,
    isSimulation,
    reason: options?.reason,
  });
}


