import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { apiHandler, HttpError, requireRole, ROLE_GROUPS, clientIp } from '@/lib/authz';
import { reviewApprovalRequest } from '@/lib/approvals';
import { executeGatewayRefund } from '@/lib/razorpay';
import { recordRefund } from '@/lib/payments';
import { invalidateServiceCache } from '@/lib/catalog';
import { plain, num } from '@/lib/serialize';

const reviewSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  reviewNotes: z.string().max(1000).optional(),
});

export const POST = apiHandler(async (request: Request, { params }: { params: { id: string } }) => {
  const user = await requireRole(ROLE_GROUPS.staff);
  const { action, reviewNotes } = reviewSchema.parse(await request.json());
  const ip = clientIp(request);

  // 1. Fetch the request to verify type-specific role permissions
  const existing = await prisma.approvalRequest.findUnique({ where: { id: params.id } });
  if (!existing) throw new HttpError(404, 'Approval request not found.');

  if (
    existing.type === 'REFUND' ||
    existing.type === 'MANUAL_LEDGER_ADJUSTMENT' ||
    existing.type === 'PAYOUT_DISBURSEMENT'
  ) {
    if (!ROLE_GROUPS.finance.includes(user.role)) {
      throw new HttpError(403, 'Only Finance Officers or Super Admin can review financial approval requests.');
    }
  }

  if (existing.type === 'CATALOG_PRICE_CHANGE') {
    if (!['SUPER_ADMIN', 'CA_CS_LEAD', 'OPS_MANAGER'].includes(user.role)) {
      throw new HttpError(403, 'Only Super Admin or Compliance / Ops Leads can review catalog changes.');
    }
  }

  // 2. Perform the Maker-Checker verification (strictly blocks self-approval)
  const reviewed = await reviewApprovalRequest({
    approvalId: params.id,
    reviewerId: user.id,
    reviewerRole: user.role,
    action,
    reviewNotes,
    ipAddress: ip,
  });

  // 3. If approved, execute the corresponding domain mutation safely
  if (action === 'APPROVE') {
    const payload = existing.payload as Record<string, any>;

    if (existing.type === 'REFUND') {
      const { paymentId, amount, refundRequestId: payloadReqId, reason: refundReason } = payload;
      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment || payment.status !== 'CAPTURED' || !payment.gatewayPaymentId) {
        throw new HttpError(409, 'Only captured payments can be refunded.');
      }

      const refundAmount = amount ? Number(amount) : num(payment.amount);
      const isSim = payment.gatewayPaymentId.startsWith('pay_demo_');
      const refundRequestId = payloadReqId || `ref_req_appr_${existing.id}`;

      // Call executeGatewayRefund adapter passing documented X-Refund-Idempotency and identical payload
      const gatewayRefund = await executeGatewayRefund(
        payment.gatewayPaymentId,
        {
          amount: Math.round(refundAmount * 100),
          notes: { paymentId: payment.id, approvedBy: user.email, approvalId: existing.id },
          receipt: refundRequestId,
        },
        {
          refundRequestId,
          isSimulation: isSim,
        }
      );

      await recordRefund(payment.gatewayPaymentId, gatewayRefund.id, refundAmount, {
        approverId: user.id,
        requesterId: existing.requesterId,
        isSimulation: isSim,
        refundRequestId,
        reason: refundReason || `Approved refund by ${user.email}`,
      });
    } else if (existing.type === 'PAYOUT_DISBURSEMENT') {
      const { professionalType, vendorName, amount, purpose, orderId } = payload;
      const txnType = professionalType === 'LAWYER' ? 'LAWYER_PAYOUT' : 'CA_PAYOUT';
      await prisma.ledgerEntry.create({
        data: {
          txnNo: `TXN-PO-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: txnType,
          description: `[APPROVED PAYOUT by ${user.email}] To ${vendorName || 'Professional'}: ${purpose || 'Disbursement'}`,
          debit: Number(amount),
          credit: 0,
          mode: 'BANK_TRANSFER',
          orderId: orderId || null,
        },
      });
    } else if (existing.type === 'CATALOG_PRICE_CHANGE') {
      const { slug, professionalFee, govtFee, govtFeeNote, sla } = payload;
      await prisma.service.update({
        where: { slug },
        data: {
          ...(professionalFee !== undefined ? { professionalFee } : {}),
          ...(govtFee !== undefined ? { govtFee } : {}),
          ...(govtFeeNote !== undefined ? { govtFeeNote } : {}),
          ...(sla !== undefined ? { sla } : {}),
        },
      });
      invalidateServiceCache();
    } else if (existing.type === 'MANUAL_LEDGER_ADJUSTMENT') {
      const { type, description, amount, mode, orderId } = payload;
      const isCredit = type === 'CLIENT_PAYMENT';
      await prisma.ledgerEntry.create({
        data: {
          txnNo: `TXN-ADJ-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type,
          description: `[APPROVED by ${user.email}] ${description}`,
          debit: isCredit ? 0 : Number(amount),
          credit: isCredit ? Number(amount) : 0,
          mode: mode || 'BANK_TRANSFER',
          orderId: orderId || null,
        },
      });
    }
  }

  return NextResponse.json({
    success: true,
    action,
    approval: plain(reviewed),
    message: action === 'APPROVE' ? 'Request approved and executed successfully.' : 'Request rejected.',
  });
});
