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
export async function capturePayment(gatewayOrderId: string, gatewayPaymentId: string) {
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
          remarks: `Payment ${gatewayPaymentId} of ₹${num(payment.amount).toLocaleString('en-IN')} received (${payment.description}).`,
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
        description: payment.description,
        credit: payment.amount,
        mode: 'RAZORPAY',
        orderId: payment.orderId,
      },
    });

    await createInvoice(tx, payment);
    return { payment, newlyCaptured: true, slotLost };
  });

  if (result.newlyCaptured) {
    const { payment } = result;
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
  }

  return result;
}

export async function markPaymentFailed(gatewayOrderId: string) {
  await prisma.payment.updateMany({ where: { gatewayOrderId, status: 'CREATED' }, data: { status: 'FAILED' } });
}

/** Records a refund once per gateway refund id (ledger txnNo is unique). */
export async function recordRefund(gatewayPaymentId: string, refundId: string, amount: number) {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.ledgerEntry.findUnique({ where: { txnNo: refundId } });
    if (existing) return;

    const payment = await tx.payment.findUnique({ where: { gatewayPaymentId } });
    if (!payment) throw new HttpError(404, 'Payment not found for refund.');

    const fullRefund = amount >= num(payment.amount);
    if (fullRefund) await tx.payment.update({ where: { id: payment.id }, data: { status: 'REFUNDED' } });

    await tx.ledgerEntry.create({
      data: {
        txnNo: refundId,
        type: 'REFUND',
        description: `Refund against ${gatewayPaymentId}`,
        debit: amount,
        mode: 'RAZORPAY',
        orderId: payment.orderId,
      },
    });

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
        data: { orderId: order.id, status: 'REFUND_PROCESSED', remarks: `Refund of ₹${amount.toLocaleString('en-IN')} processed.` },
      });
    }
  });
}

