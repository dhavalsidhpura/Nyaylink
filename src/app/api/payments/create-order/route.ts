import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { apiHandler, clientIp, HttpError, requireUser } from '@/lib/authz';
import { getActiveService } from '@/lib/catalog';
import { computeQuote, isValidState } from '@/lib/pricing';
import { nextOrderNumber } from '@/lib/counters';
import { preparePaymentCheckout, type CheckoutPayload } from '@/lib/payments';
import { num } from '@/lib/serialize';
import { CONSENT_VERSIONS } from '@/lib/env';

const schema = z.object({
  serviceSlug: z.string().min(1).max(120),
  clientState: z.string().length(2).refine(isValidState, 'unknown state'),
  intake: z.record(z.string().max(500)).default({}),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please accept the terms and KYC consent to continue.' }) }),
});

async function tryCheckout(paymentId: string, userId: string) {
  try {
    return { checkout: await preparePaymentCheckout(paymentId, userId), paymentError: null };
  } catch (error) {
    console.error('Gateway order creation failed:', error);
    const message = error instanceof HttpError ? error.message : 'Payment gateway is unavailable. You can retry from your order page.';
    return { checkout: null as CheckoutPayload | null, paymentError: message };
  }
}

/**
 * Creates an order priced entirely on the server from the Service table, plus a Payment and a
 * Razorpay order. Send an `Idempotency-Key` header so double-clicks/retries return the same order.
 */
export const POST = apiHandler(async (request: Request) => {
  const user = await requireUser();
  const body = schema.parse(await request.json());
  const idempotencyKey = request.headers.get('idempotency-key')?.slice(0, 100) || null;

  if (idempotencyKey) {
    const existing = await prisma.order.findUnique({
      where: { idempotencyKey },
      include: { payments: { where: { kind: 'FULL' } } },
    });
    if (existing) {
      if (existing.clientId !== user.id) throw new HttpError(409, 'Idempotency key already used.');
      const payment = existing.payments[0];
      const result = payment && payment.status !== 'CAPTURED' ? await tryCheckout(payment.id, user.id) : { checkout: null, paymentError: null };
      return NextResponse.json({ success: true, orderNumber: existing.orderNumber, paymentId: payment?.id, ...result });
    }
  }

  const service = await getActiveService(body.serviceSlug);
  if (!service) throw new HttpError(404, 'This service is not available.');

  const quote = computeQuote(
    { professionalFee: num(service.professionalFee), govtFee: num(service.govtFee), gstRate: num(service.gstRate) },
    body.clientState
  );

  let created;
  try {
    created = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber: await nextOrderNumber(tx),
          idempotencyKey,
          serviceId: service.id,
          clientId: user.id,
          professionalFee: quote.professionalFee,
          govtFee: quote.govtFee,
          gstAmount: quote.gstAmount,
          totalAmount: quote.total,
          clientState: body.clientState,
          intakeData: body.intake,
          statusLogs: { create: { status: 'PENDING_PAYMENT', remarks: 'Order created, awaiting payment.', actorId: user.id } },
        },
      });
      const payment = await tx.payment.create({
        data: {
          kind: 'FULL',
          amount: quote.total,
          taxableAmount: quote.professionalFee,
          gstAmount: quote.gstAmount,
          description: `${service.title} (${order.orderNumber})`,
          orderId: order.id,
        },
      });
      await tx.consent.create({
        data: { userId: user.id, purpose: 'KYC_PROCESSING', version: CONSENT_VERSIONS.KYC_PROCESSING, ip: clientIp(request) },
      });
      await tx.user.updateMany({ where: { id: user.id, state: null }, data: { state: body.clientState } });
      return { order, payment };
    });
  } catch (error) {
    // Lost a race with a concurrent request carrying the same idempotency key.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002' && idempotencyKey) {
      throw new HttpError(409, 'This order is already being created. Please refresh.');
    }
    throw error;
  }

  // The gateway call happens outside the DB transaction. If it fails, the order still exists and
  // the client can retry payment from the order page.
  const result = await tryCheckout(created.payment.id, user.id);

  return NextResponse.json(
    { success: true, orderNumber: created.order.orderNumber, paymentId: created.payment.id, ...result },
    { status: 201 }
  );
});
